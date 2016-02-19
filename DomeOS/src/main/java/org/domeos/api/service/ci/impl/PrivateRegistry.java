package org.domeos.api.service.ci.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.util.EntityUtils;
import org.apache.log4j.Logger;
import org.domeos.api.model.ci.BaseImage;
import org.domeos.api.model.global.DockerImage;
import org.domeos.global.ClientConfigure;
import org.domeos.global.DateManager;
import org.domeos.global.GlobalConstant;
import org.domeos.global.HttpsClient;
import org.domeos.util.CommonUtil;

import java.io.IOException;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.TimeZone;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 * Created by feiliu206363 on 2015/12/2.
 */
public class PrivateRegistry {
    private static Logger logger = org.apache.log4j.Logger.getLogger(PrivateRegistry.class);

    public static long getCreateTime(BaseImage baseImage) {
        ObjectMapper mapper = new ObjectMapper();
        String imageInfo = getHttpResposeBody(generateUrl(baseImage));
        if (StringUtils.isBlank(imageInfo)) {
            return 0;
        }
        try {
            JsonNode manifests = mapper.readTree(imageInfo);
            JsonNode histories = manifests.get(GlobalConstant.REGISTRY_HISTORY);
            if (histories == null) {
                return -1;
            }
            long createTime = 0;
            Iterator<JsonNode> element = histories.elements();
            while (element.hasNext()) {
                JsonNode history = element.next();
                JsonNode v1Compatibility = mapper.readTree(history.get(GlobalConstant.REGISTRY_HISTORY_V1COMPATIBILITY).asText());
                String created = v1Compatibility.get(GlobalConstant.REGISTRY_HISTORY_V1COMPATIBILITY_CREATED).asText();
                try {
                    long tmpTime = DateManager.string2timestamp(created);
                    if (tmpTime > createTime) {
                        createTime = tmpTime;
                    }
                } catch (Exception e) {
                    logger.warn("change date format error, message: " + e.getMessage());
                }
            }
            return createTime;
        } catch (IOException e) {
            logger.warn("get json error, " + e.getMessage());
        }
        return 0;
    }

    public static double getImageSize(BaseImage baseImage) {
        ObjectMapper mapper = new ObjectMapper();
        String imageInfo = getHttpResposeBody(generateUrl(baseImage));
        long size = 0;
        try {
            JsonNode manifests = mapper.readTree(imageInfo);
            JsonNode histories = manifests.get(GlobalConstant.REGISTRY_HISTORY);
            if (histories == null) {
                return -1;
            }
            Iterator<JsonNode> element = histories.elements();
            while (element.hasNext()) {
                JsonNode history = element.next();
                JsonNode v1Compatibility = mapper.readTree(history.get(GlobalConstant.REGISTRY_HISTORY_V1COMPATIBILITY).asText());
                int tmpSize = v1Compatibility.get(GlobalConstant.REGISTRY_HISTORY_V1COMPATIBILITY_SIZE).asInt();
                size += tmpSize;
            }
        } catch (IOException e) {
            logger.warn("get image size error, " + e.getMessage());
        }
        return (size * 1.0 / 1000000);
    }

    public static String getHttpResposeBody(String url) {
        HttpGet httpGet = null;
        String value = null;
        try {
            httpGet = new HttpGet(url);
            RequestConfig requestConfig = RequestConfig.custom().setSocketTimeout(HttpsClient.SocketTimeout)
                    .setConnectTimeout(HttpsClient.ConnectTimeout).build();
            httpGet.setConfig(requestConfig);
            try (CloseableHttpResponse response = HttpsClient.getHttpClient().execute(httpGet)) {
                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    value = EntityUtils.toString(entity);
                }
            }
        } catch (IOException e) {
            logger.warn("get response error, url is " + url + ", message is" + e.getMessage());
        } finally {
            if (httpGet != null) {
                httpGet.completed();
            }
        }
        return value;
    }

    public static String generateUrl(BaseImage baseImage) {
        String url = CommonUtil.fullUrl(baseImage.getRegistry());
        url += GlobalConstant.REGISTRY_VERSION + baseImage.getImageName() + GlobalConstant.REGISTRY_MANIFESTS;
        if (StringUtils.isBlank(baseImage.getImageTag())) {
            url += "latest";
        } else {
            url += baseImage.getImageTag();
        }
        return url;
    }

    public static String generateGetImagesUrl(String url) {
        if (StringUtils.isBlank(url)) {
            return null;
        }
        url += "/v2/_catalog?n=1000000";
        return url;
    }

    public static List<String> getDockerImages(String url) {
        ObjectMapper mapper = new ObjectMapper();
        String images = getHttpResposeBody(generateGetImagesUrl(url));
        try {
            JsonNode repositories = mapper.readTree(images).get("repositories");
            if (repositories == null) {
                return null;
            }
            Iterator<JsonNode> element = repositories.elements();
            List<String> imageList = new LinkedList<>();
            while (element.hasNext()) {
                JsonNode image = element.next();
                imageList.add(image.asText());
            }
            return imageList;
        } catch (IOException e) {
            logger.warn("get json error, " + e.getMessage());
            return null;
        }
    }

    public static String generateGetImageTagsUrl(String url, String name) {
        if (StringUtils.isBlank(url)) {
            return null;
        }
        url += GlobalConstant.REGISTRY_VERSION + name + GlobalConstant.REGISTRY_TAGLIST;
        return url;
    }

    public static String generateGetImageCreateTimeUrl(String url, String name, String tag) {
        if (StringUtils.isBlank(url) || StringUtils.isBlank(name) || StringUtils.isBlank(tag)) {
            return null;
        }
        url += GlobalConstant.REGISTRY_VERSION + name + GlobalConstant.REGISTRY_MANIFESTS + tag;
        return url;
    }

    public static List<DockerImage> getDockerImageInfo(String name, String url) {
        ObjectMapper mapper = new ObjectMapper();
        String result = getHttpResposeBody(generateGetImageTagsUrl(url, name));
        try {
            JsonNode tags = mapper.readTree(result).get("tags");
            if (tags == null) {
                return null;
            }
            Iterator<JsonNode> element = tags.elements();
            List<DockerImage> dockerImages = new LinkedList<>();
            List<Future<DockerImage>> futures = new LinkedList<>();
            while (element.hasNext()) {
                JsonNode tag = element.next();
                Future<DockerImage> future = ClientConfigure.executorService.submit(new DockerImageInfoTask(url, name, tag.asText()));
                futures.add(future);
            }
            for (Future<DockerImage> future : futures) {
                try {
                    DockerImage dockerImage = future.get();
                    if (dockerImage != null) {
                        dockerImages.add(dockerImage);
                    }
                } catch (InterruptedException | ExecutionException e) {
                    logger.warn("get project list error, message is " + e.getMessage());
                }
            }

            return dockerImages;
        } catch (IOException e) {
            logger.warn("get json error, " + e.getMessage());
            return null;
        }
    }

    public static class DockerImageInfoTask implements Callable<DockerImage> {
        String url;
        String name;
        String tag;

        public DockerImageInfoTask(String url, String name, String tag) {
            this.url = url;
            this.name = name;
            this.tag = tag;
        }

        @Override
        public DockerImage call() throws Exception {
            String createTimeUrl = generateGetImageCreateTimeUrl(url, name, tag);
            return new DockerImage(url, name, tag, getCreateTime(createTimeUrl));
        }
    }

    public static long getCreateTime(String url) {
        ObjectMapper mapper = new ObjectMapper();
        String imageInfo = getHttpResposeBody(url);
        try {
            JsonNode manifests = mapper.readTree(imageInfo);
            JsonNode histories = manifests.get(GlobalConstant.REGISTRY_HISTORY);
            if (histories == null) {
                return -1;
            }
            long createTime = 0;
            Iterator<JsonNode> element = histories.elements();
            while (element.hasNext()) {
                JsonNode history = element.next();
                JsonNode v1Compatibility = mapper.readTree(history.get(GlobalConstant.REGISTRY_HISTORY_V1COMPATIBILITY).asText());
                String created = v1Compatibility.get(GlobalConstant.REGISTRY_HISTORY_V1COMPATIBILITY_CREATED).asText();
                try {
                    long tmpTime = DateManager.string2timestamp(created, TimeZone.getTimeZone(GlobalConstant.UTC_TIME));
                    if (tmpTime > createTime) {
                        createTime = tmpTime;
                    }
                } catch (Exception e) {
                    logger.warn("change date format error, message: " + e.getMessage());
                }
            }
            return createTime;
        } catch (IOException e) {
            logger.warn("get json error, " + e.getMessage());
        }
        return 0;
    }
}
