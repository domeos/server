package org.domeos.framework.api.service.image.impl;

import com.fasterxml.jackson.databind.JsonNode;
import org.apache.commons.lang.StringUtils;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpHead;
import org.apache.http.message.BasicHeader;
import org.apache.http.util.EntityUtils;
import org.domeos.framework.api.consolemodel.image.ImageTagDetail;
import org.domeos.framework.api.model.image.BaseImage;
import org.domeos.framework.api.model.image.DockerImage;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.domeos.global.ClientConfigure;
import org.domeos.global.GlobalConstant;
import org.domeos.util.CommonUtil;
import org.domeos.util.DateUtil;
import org.domeos.util.HttpsClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 * Created by feiliu206363 on 2015/12/2.
 */
public class PrivateRegistry {
    private static CustomObjectMapper mapper = new CustomObjectMapper();
    private static Logger logger = LoggerFactory.getLogger(PrivateRegistry.class);

    public static long getCreateTime(BaseImage baseImage, String token) {
        String imageInfo = getHttpResposeBody(generateUrl(baseImage), token);
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
                    long tmpTime = DateUtil.string2timestamp(created);
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

    public static double getImageSize(BaseImage baseImage, String token) {
        String imageInfo = getHttpResposeBody(generateUrl(baseImage), token);
        return getImageSize(imageInfo, CommonUtil.fullUrl(baseImage.getRegistry()), baseImage.getImageName(), token);
    }

    /**
     *
     * @param registry
     * @param imageName
     * @param token
     * @return
     */
    public static List<String> getImageTagList(String registry, String imageName, String token) {
        registry = CommonUtil.fullUrl(registry);
        String tagUrl = generateGetImageTagsUrl(registry, imageName);
        String tagInfo = getHttpResposeBody(tagUrl, token);
        try {
            JsonNode tags = mapper.readTree(tagInfo).get("tags");
            if (tags == null) {
                return null;
            }
            Iterator<JsonNode> element = tags.elements();
            List<String> tagList = new ArrayList<>();
            while (element.hasNext()) {
                JsonNode tag = element.next();
                tagList.add(tag.asText());
            }
            return tagList;
        } catch (IOException e) {
            logger.warn("get json error, " + e.getMessage());
            return null;
        }
    }

    public static List<ImageTagDetail> getImageTagDetailList(String registry, String imageName, String token) {
        registry = CommonUtil.fullUrl(registry);
        String tagUrl = generateGetImageTagsUrl(registry, imageName);
        String tagInfo = getHttpResposeBody(tagUrl, token);
        try {
            JsonNode tags = mapper.readTree(tagInfo).get("tags");
            if (tags == null) {
                return null;
            }
            Iterator<JsonNode> element = tags.elements();
            List<ImageTagDetail> imageTagDetails = new ArrayList<>();
            List<Future<TagDetail>> futures = new LinkedList<>();
            List<String> tagList = new ArrayList<>();
            while (element.hasNext()) {
                JsonNode tag = element.next();
                tagList.add(tag.asText());
                Future<TagDetail> future = ClientConfigure.executorService.submit(new GetTagDetail(registry, imageName, tag.asText(), token));
                futures.add(future);
            }
            for (Future<TagDetail> future : futures) {
                try {
                    TagDetail tagDetail = future.get();
                    if (tagDetail != null) {
                        imageTagDetails.add(new ImageTagDetail().setCreateTime(tagDetail.getCreateTime()).setSize(tagDetail.getImageSize())
                                .setTag(tagDetail.getImageTag()));
                    }
                } catch (InterruptedException | ExecutionException e) {
                    logger.warn("get project list error, message is " + e);
                }
            }
            return imageTagDetails;
        } catch (IOException e) {
            logger.warn("get json error, " + e.getMessage());
            return null;
        }
    }

    public static ImageTagDetail getImageTagDetail(String registry, String name, String tag, String token) {
        String tagUrl = generateGetImageManifestsUrl(registry, name, tag);
        String tagInfo = getHttpResposeBody(tagUrl, token);
        long createTime = getCreateTime(tagInfo);
        // TODO: remove size from image tag detail
//        double size = getImageSize(tagInfo, registry, name);
        ImageTagDetail tagDetail = new ImageTagDetail();
        tagDetail.setCreateTime(createTime);
        tagDetail.setTag(tag);
//        tagDetail.setSize(size);
        tagDetail.setRegistry(registry);
        tagDetail.setName(name);
        return tagDetail;
    }

    private static class GetTagDetail implements Callable<TagDetail> {
        private String registry;
        private String image;
        private String tag;
        private String token;

        public GetTagDetail(String registry, String image, String tag, String token) {
            this.registry = registry;
            this.tag = tag;
            this.image = image;
            this.token = token;
        }

        @Override
        public TagDetail call() throws Exception {
            String url = generateGetImageManifestsUrl(registry, image, tag);
            String imageDetail = getHttpResposeBody(url, token);
            long createTime = getCreateTime(imageDetail);
            double imageSize = getImageSize(imageDetail, registry, image, token);

            TagDetail tagDetail = new TagDetail();
            tagDetail.setCreateTime(createTime);
            tagDetail.setImageName(image);
            tagDetail.setImageTag(tag);
            tagDetail.setImageSize(imageSize);
            return tagDetail;
        }
    }

    private static class TagDetail {
        private String imageName;
        private String imageTag;
        private long createTime;
        private double imageSize;

        public String getImageName() {
            return imageName;
        }

        public TagDetail setImageName(String imageName) {
            this.imageName = imageName;
            return this;
        }

        public String getImageTag() {
            return imageTag;
        }

        public TagDetail setImageTag(String imageTag) {
            this.imageTag = imageTag;
            return this;
        }

        public long getCreateTime() {
            return createTime;
        }

        public TagDetail setCreateTime(long createTime) {
            this.createTime = createTime;
            return this;
        }

        public double getImageSize() {
            return imageSize;
        }

        public TagDetail setImageSize(double imageSize) {
            this.imageSize = imageSize;
            return this;
        }
    }

    private static long getCreateTime(String imageDetail) {
        long createTime = 0;
        try {
            JsonNode manifests = mapper.readTree(imageDetail);
            JsonNode histories = manifests.get(GlobalConstant.REGISTRY_HISTORY);
            if (histories != null) {
                Iterator<JsonNode> element = histories.elements();
                while (element.hasNext()) {
                    JsonNode history = element.next();
                    if (history.has(GlobalConstant.REGISTRY_HISTORY_V1COMPATIBILITY)) {
                        JsonNode v1Compatibility = mapper.readTree(history.get(GlobalConstant.REGISTRY_HISTORY_V1COMPATIBILITY).asText());
                        String created = v1Compatibility.get(GlobalConstant.REGISTRY_HISTORY_V1COMPATIBILITY_CREATED).asText();
                        try {
                            long tmpTime = DateUtil.string2timestamp(created, TimeZone.getTimeZone(GlobalConstant.UTC_TIME));
                            if (tmpTime > createTime) {
                                createTime = tmpTime;
                            }
                        } catch (Exception e) {
                            logger.warn("change date format error, message: " + e.getMessage());
                        }
                    }
                }
            }
        } catch (IOException e) {
            logger.warn("get json error, " + e.getMessage());
        }
        return createTime;
    }

    private static double getImageSize(String imageDetail, String registry, String image, String token) {
        long imageSize = 0;
        try {
            JsonNode manifests = mapper.readTree(imageDetail);
            JsonNode fsLayers = manifests.get(GlobalConstant.REGISTRY_FSLAYERS);
            if (fsLayers != null) {
                Iterator<JsonNode> element = fsLayers.elements();
                String urlPrefix = registry + GlobalConstant.REGISTRY_VERSION + image + GlobalConstant.REGISTRY_BLOBS;
                while (element.hasNext()) {
                    JsonNode layers = element.next();
                    if (layers.has(GlobalConstant.REGISTRY_BLOBSUM)) {
                        String blobSum = layers.get(GlobalConstant.REGISTRY_BLOBSUM).asText();
                        long tmpSize = getBlobSize(urlPrefix + blobSum, token);
                        imageSize += tmpSize;
                    }
                }
            }
        } catch (IOException e) {
            logger.warn("get json error, " + e.getMessage());
        }
        return (imageSize * 1.0 / 1000000);
    }

    private static String getHttpResposeBody(String url, String token) {
        HttpGet httpGet = null;
        String value = null;
        try {
            httpGet = new HttpGet(url);
            if (token != null) {
                httpGet.setHeader(new BasicHeader("authorization", "Bearer " + token));
            }
            RequestConfig requestConfig = RequestConfig.custom().setSocketTimeout(HttpsClient.SocketTimeout)
                    .setConnectTimeout(HttpsClient.ConnectTimeout).build();
            httpGet.setConfig(requestConfig);
            CloseableHttpResponse response = HttpsClient.getHttpClient().execute(httpGet);
            if (response != null) {
                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    value = EntityUtils.toString(entity);
                }
                response.close();
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

    private static String headHttpResponseBody(String url, String token) {
        HttpHead httpHead = null;
        String value = null;
        try {
            httpHead = new HttpHead(url);
            RequestConfig requestConfig = RequestConfig.custom().setSocketTimeout(HttpsClient.SocketTimeout)
                    .setConnectTimeout(HttpsClient.ConnectTimeout).build();
            httpHead.setConfig(requestConfig);
            if (token != null) {
                httpHead.setHeader(new BasicHeader("authorization", "Bearer " + token));
            }
            //the head must be this, or we will get wrong digest
            httpHead.setHeader("Accept", "application/vnd.docker.distribution.manifest.v2+json");
            CloseableHttpResponse response = HttpsClient.getHttpClient().execute(httpHead);
            if (response != null) {
                Header header = response.getLastHeader("Docker-Content-Digest");
                if (header != null) {
                    value = header.getValue();
                }
                response.close();
            }
        } catch (IOException e) {
            logger.warn("get response error, url is " + url + ", message is" + e.getMessage());
        } finally {
            if (httpHead != null) {
                httpHead.completed();
            }
        }
        return value;
    }

    private static long getBlobSize(String url, String token) {
        HttpHead httpHead = null;
        try {
            httpHead = new HttpHead(url);
            RequestConfig requestConfig = RequestConfig.custom().setSocketTimeout(HttpsClient.SocketTimeout)
                    .setConnectTimeout(HttpsClient.ConnectTimeout).build();
            httpHead.setConfig(requestConfig);
            if (token != null) {
                httpHead.setHeader(new BasicHeader("authorization", "Bearer " + token));
            }
            //the head must be this, or we will get wrong digest
            httpHead.setHeader("Accept", "application/vnd.docker.distribution.manifest.v2+json");
            CloseableHttpResponse response = HttpsClient.getHttpClient().execute(httpHead);
            if (response != null) {
                Header header = response.getFirstHeader(GlobalConstant.HTTP_CONTENTLENGTH);
                if (header != null) {
                    return Long.valueOf(header.getValue());
                }
                response.close();
            }
        } catch (IOException e) {
            logger.warn("get response error, url is " + url + ", message is" + e.getMessage());
        } finally {
            if (httpHead != null) {
                httpHead.completed();
            }
        }
        return 0;
    }

    private static String generateUrl(BaseImage baseImage) {
        String url = CommonUtil.fullUrl(baseImage.getRegistry());
        url += GlobalConstant.REGISTRY_VERSION + baseImage.getImageName() + GlobalConstant.REGISTRY_MANIFESTS;
        if (StringUtils.isBlank(baseImage.getImageTag())) {
            url += "latest";
        } else {
            url += baseImage.getImageTag();
        }
        return url;
    }

    private static String generateGetImagesUrl(String url) {
        if (StringUtils.isBlank(url)) {
            return null;
        }
        url += "/v2/_catalog?n=1000000";
        return url;
    }

    public static List<String> getDockerImages(String url, String token) {
        String images = getHttpResposeBody(generateGetImagesUrl(url), token);
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

    private static String generateGetImageTagsUrl(String url, String name) {
        if (StringUtils.isBlank(url)) {
            return null;
        }
        url += GlobalConstant.REGISTRY_VERSION + name + GlobalConstant.REGISTRY_TAGLIST;
        return url;
    }

    private static String generateGetImageManifestsUrl(String url, String name, String tag) {
        if (StringUtils.isBlank(url) || StringUtils.isBlank(name)) {
            return null;
        }
        if (StringUtils.isBlank(tag)) {
            tag = "latest";
        }
        url += GlobalConstant.REGISTRY_VERSION + name + GlobalConstant.REGISTRY_MANIFESTS + tag;
        return url;
    }

    public static List<DockerImage> getDockerImageInfo(String name, String url, String token) {
        String result = getHttpResposeBody(generateGetImageTagsUrl(url, name), token);
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
                Future<DockerImage> future = ClientConfigure.executorService.submit(new DockerImageInfoTask(url, name, tag.asText(), token));
                futures.add(future);
            }
            for (Future<DockerImage> future : futures) {
                try {
                    DockerImage dockerImage = future.get();
                    if (dockerImage != null) {
                        dockerImages.add(dockerImage);
                    }
                } catch (InterruptedException | ExecutionException e) {
                    logger.warn("get project list error, message is " + e);
                }
            }

            return dockerImages;
        } catch (IOException e) {
            logger.warn("get json error, " + e.getMessage());
            return null;
        }
    }

    private static class DockerImageInfoTask implements Callable<DockerImage> {
        private String url;
        private String name;
        private String tag;
        private String token;

        public DockerImageInfoTask(String url, String name, String tag, String token) {
            this.url = url;
            this.name = name;
            this.tag = tag;
            this.token = token;
        }

        @Override
        public DockerImage call() throws Exception {
            String createTimeUrl = generateGetImageManifestsUrl(url, name, tag);
            return new DockerImage(url, name, tag, getCreateTime(createTimeUrl, token));
        }
    }

    public static long getCreateTime(String url, String token) {
        String imageInfo = getHttpResposeBody(url, token);
        return getCreateTime(imageInfo);
    }

    public static String deleteDockerImage(String url, String name, String tag, String token) {
        String deleteUrl = generateGetImageManifestsUrl(url, name, tag);
        String digest = headHttpResponseBody(deleteUrl, token);
        if (digest == null) {
            return null;
        }
        deleteUrl = generateGetImageManifestsUrl(url, name, digest);
        return deleteHttpResponseBody(deleteUrl, token);
    }

    private static String deleteHttpResponseBody(String url, String token) {
        HttpDelete httpDelete = null;
        String value = null;
        try {
            httpDelete = new HttpDelete(url);
            RequestConfig requestConfig = RequestConfig.custom().setSocketTimeout(HttpsClient.SocketTimeout)
                    .setConnectTimeout(HttpsClient.ConnectTimeout).build();
            httpDelete.setConfig(requestConfig);
            if (token != null) {
                httpDelete.setHeader(new BasicHeader("authorization", "Bearer " + token));
            }
            CloseableHttpResponse response = HttpsClient.getHttpClient().execute(httpDelete);
            if (response != null) {
                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    value = EntityUtils.toString(entity);
                }
                response.close();
            }
        } catch (IOException e) {
            logger.warn("get response error, url is " + url + ", message is" + e.getMessage());
        } finally {
            if (httpDelete != null) {
                httpDelete.completed();
            }
        }
        return value;
    }
}
