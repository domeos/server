package org.domeos.framework.api.service.image.impl;

import com.fasterxml.jackson.databind.JsonNode;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpHead;
import org.apache.http.message.BasicHeader;
import org.apache.http.util.EntityUtils;
import org.domeos.exception.ResponseException;
import org.domeos.framework.api.consolemodel.image.ImageTagDetail;
import org.domeos.framework.api.model.image.*;
import org.domeos.framework.api.model.image.related.PublicImageConstant;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.domeos.global.ClientConfigure;
import org.domeos.global.GlobalConstant;
import org.domeos.util.CommonUtil;
import org.domeos.util.DateUtil;
import org.domeos.util.HttpsClient;
import org.domeos.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.text.ParseException;
import java.util.*;
import java.util.concurrent.Callable;

/**
 * Created by feiliu206363 on 2015/12/2.
 */
public class PrivateRegistry {
    private static CustomObjectMapper mapper = new CustomObjectMapper();
    private static Logger logger = LoggerFactory.getLogger(PrivateRegistry.class);

    public static long getCreateTime(BaseImage baseImage, String token) {
        try {
            String imageInfo = getHttpResponseBody(generateUrl(baseImage), token);
            if (StringUtils.isBlank(imageInfo)) {
                return 0;
            }
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
        } catch (IOException | ResponseException e) {
            logger.warn("get json error, " + e.getMessage());
            return 0;
        }
    }

    public static double getImageSize(BaseImage baseImage, String token) {
        try {
            String imageInfo = getHttpResponseBody(generateUrl(baseImage), token);
            return getImageSize(imageInfo, CommonUtil.fullUrl(baseImage.getRegistry()), baseImage.getImageName(), token);
        } catch (ResponseException e) {
            logger.warn("get image size error, " + e.getMessage());
            return 0;
        }
    }

    /**
     * @param registry
     * @param imageName
     * @param token
     * @return
     */
    public static List<String> getImageTagList(String registry, String imageName, String token) {
        try {
            registry = CommonUtil.fullUrl(registry);
            String tagUrl = generateGetImageTagsUrl(registry, imageName);
            String tagInfo = getHttpResponseBody(tagUrl, token);
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
        } catch (IOException | ResponseException e) {
            logger.warn("get json error, " + e.getMessage());
            return null;
        }
    }

    public static List<ImageTagDetail> getImageTagDetailList(String registry, String imageName, String token) {
        try {
            registry = CommonUtil.fullUrl(registry);
            String tagUrl = generateGetImageTagsUrl(registry, imageName);
            String tagInfo = getHttpResponseBody(tagUrl, token);
            JsonNode tags = mapper.readTree(tagInfo).get("tags");
            if (tags == null) {
                return null;
            }
            Iterator<JsonNode> element = tags.elements();
            List<GetTagDetail> tagDetails = new LinkedList<>();
            List<String> tagList = new ArrayList<>();
            while (element.hasNext()) {
                JsonNode tag = element.next();
                tagList.add(tag.asText());
                tagDetails.add(new GetTagDetail(registry, imageName, tag.asText(), token));
            }
            List<TagDetail> tagDetailList = ClientConfigure.executeCompletionService(tagDetails);
            List<ImageTagDetail> imageTagDetails = new ArrayList<>(tagDetailList.size());
            for (TagDetail tagDetail : tagDetailList) {
                if (tagDetail != null) {
                    imageTagDetails.add(new ImageTagDetail().setCreateTime(tagDetail.getCreateTime()).setSize(tagDetail.getImageSize())
                            .setTag(tagDetail.getImageTag()));
                }
            }
            return imageTagDetails;
        } catch (IOException | ResponseException e) {
            logger.warn("get json error, " + e.getMessage());
            return null;
        }
    }

    public static ImageTagDetail getImageTagDetail(String registry, String name, String tag, String token, boolean needSize) {
        ImageTagDetail imageTagDetail = getPublicImageTagDetail(registry, name, tag, token);
        if (imageTagDetail == null) {
            try {
                String tagUrl = generateGetImageManifestsUrl(registry, name, tag);
                String tagInfo = getHttpResponseBody(tagUrl, token);
                long createTime = getCreateTime(tagInfo);
                ImageTagDetail tagDetail = new ImageTagDetail();
                // TODO: remove size from image tag detail
                if (needSize) {
                    double size = getImageSize(tagInfo, registry, name, token);
                    tagDetail.setSize(size);
                }
                tagDetail.setCreateTime(createTime);
                tagDetail.setTag(tag);
                tagDetail.setRegistry(registry);
                tagDetail.setName(name);
                return tagDetail;
            } catch (ResponseException | IllegalStateException e) {
                logger.warn("get json error, " + e.getMessage());
                return null;
            }
        }
        return imageTagDetail;
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
            String imageDetail = getHttpResponseBody(url, token);
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

    private static String getHttpResponseBody(String url, String token) throws ResponseException {
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
                if (response.getStatusLine() != null && response.getStatusLine().getStatusCode() != 200) {
                    throw new ResponseException(response.getStatusLine().getStatusCode(), value);
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
        try {
            String images = getHttpResponseBody(generateGetImagesUrl(url), token);
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

        } catch (ResponseException | IOException e) {
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

    private static String generateGetImageInfoUrl(String url, String name) {
        if (StringUtils.isBlank(url)) {
            return null;
        }
        url += GlobalConstant.REGISTRY_VERSION + name + "/" + PublicImageConstant.IMAGE_INFO;
        return url;
    }

    private static String generateGetImageTagInfoUrl(String url, String name, String tag) {
        if (StringUtils.isBlank(url)) {
            return null;
        }
        url += GlobalConstant.REGISTRY_VERSION + name + "/" + PublicImageConstant.TAG_INFO + "/";
        if (StringUtils.isBlank(tag)) {
            url += "latest";
        } else {
            url += tag;
        }
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
        PublicImageDetail publicImageDetail = getPublicImageDetail(url, token, name);
        if (publicImageDetail != null && publicImageDetail.getTagInfos() != null && !publicImageDetail.getTagInfos().isEmpty()) {
            List<DockerImage> dockerImages = new ArrayList<>(publicImageDetail.getTagInfos().size());
            for (PublicTagInfo tagInfo : publicImageDetail.getTagInfos()) {
                dockerImages.add(new DockerImage(url, name, tagInfo.getImageTag(), tagInfo.getCreateTime()));
            }
            return dockerImages;
        } else {
            try {
                String result = getHttpResponseBody(generateGetImageTagsUrl(url, name), token);
                if (StringUtils.isBlank(result)) {
                    return null;
                }
                JsonNode tags = mapper.readTree(result).get("tags");
                if (tags == null) {
                    return null;
                }
                Iterator<JsonNode> element = tags.elements();

                List<DockerImageInfoTask> dockerImageInfoTasks = new LinkedList<>();
                while (element.hasNext()) {
                    JsonNode tag = element.next();
                    dockerImageInfoTasks.add(new DockerImageInfoTask(url, name, tag.asText(), token));
                }
                return ClientConfigure.executeCompletionService(dockerImageInfoTasks);
            } catch (IOException | ResponseException e) {
                logger.warn("get json error, " + e.getMessage());
                return null;
            }
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
        try {
            String imageInfo = getHttpResponseBody(url, token);
            return getCreateTime(imageInfo);
        } catch (ResponseException e) {
            logger.warn("get create time error, " + e.getMessage());
            return 0;
        }
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

    // for extending function

    private static String generateGetCatalogInfoUrl(String url) {
        if (StringUtils.isBlank(url)) {
            return null;
        }
        return url + GlobalConstant.REGISTRY_VERSION + "cataloginfo";
    }

    private static String generateGetItemInfoUrl(String url, String suffix) {
        if (StringUtils.isBlank(url)) {
            return null;
        }
        return url + GlobalConstant.REGISTRY_VERSION + suffix;
    }

    private static String generateImageItemUrl(String imageName, String itemName) {
        return "/api/image/public/item/content?itemUrl=" + imageName + "/" + PublicImageConstant.REGISTRY_ITEM + "/"
                + itemName;
    }

    private static String generateTagItemUrl(String imageName, String tagName, String itemName) {
        return "/api/image/public/item/content?itemUrl=" + imageName + "/" + PublicImageConstant.REGISTRY_ITEM +
                "/" + tagName + "/" + itemName;
    }

    public static List<PublicImageInfo> getPublicImageInfos(String registryUrl, String token) {
        try {
            String images = getHttpResponseBody(generateGetCatalogInfoUrl(registryUrl), token);
            JsonNode imageInfos = mapper.readTree(images).get("imageInfos");
            if (imageInfos == null) {
                return null;
            }
            Iterator<JsonNode> element = imageInfos.elements();
            List<PublicImageInfo> imageList = new LinkedList<>();
            while (element.hasNext()) {
                JsonNode image = element.next();
                String lastModified = image.get(PublicImageConstant.LAST_MODIFIED).asText();
                long lastModifiedTime = DateUtil.string2timestamp(lastModified, TimeZone.getTimeZone(GlobalConstant.UTC_TIME));
                String imageName = image.get(PublicImageConstant.IMAGE_NAME).asText();
                int downloadCount = image.get(PublicImageConstant.DOWNLOAD_COUNT).asInt();
                int size = image.get(PublicImageConstant.SIZE).asInt();
                if (size == 0) {
                    continue;
                }
                String iconUrl = generateImageItemUrl(imageName, PublicImageConstant.IMAGE_ICON);
                PublicImageInfo publicImageInfo = new PublicImageInfo(imageName, size, downloadCount, iconUrl, lastModifiedTime);
                imageList.add(publicImageInfo);
            }
            return imageList;
        } catch (IOException | ParseException | ResponseException e) {
            logger.warn("get json error, " + e.getMessage());
            return null;
        }
    }

    public static PublicImageDetail getPublicImageDetail(String registryUrl, String token, String imageName) {
        try {
            String imageInfo = getHttpResponseBody(generateGetImageInfoUrl(registryUrl, imageName), token);
            JsonNode imageInfoJson = mapper.readTree(imageInfo);
            String created = imageInfoJson.get(PublicImageConstant.CREATETIME).asText();
            long createTime = DateUtil.string2timestamp(created, TimeZone.getTimeZone(GlobalConstant.UTC_TIME));
            String lastModified = imageInfoJson.get(PublicImageConstant.LAST_MODIFIED).asText();
            long lastModifiedTime = DateUtil.string2timestamp(lastModified, TimeZone.getTimeZone(GlobalConstant.UTC_TIME));
            int downloadCount = imageInfoJson.get(PublicImageConstant.DOWNLOAD_COUNT).asInt();
            int size = imageInfoJson.get(PublicImageConstant.SIZE).asInt();
            String iconUrl = generateImageItemUrl(imageName, PublicImageConstant.IMAGE_ICON);
            List<PublicTagInfo> tags = new LinkedList<>();
            JsonNode tagInfos = imageInfoJson.get("tags");
            Iterator<JsonNode> element = tagInfos.elements();
            String readMeUrl = generateImageItemUrl(imageName, PublicImageConstant.IMAGE_README);
            while (element.hasNext()) {
                JsonNode tag = element.next();
                String tagCreated = tag.get(PublicImageConstant.CREATETIME).asText();
                long tagCreateTime = DateUtil.string2timestamp(tagCreated, TimeZone.getTimeZone(GlobalConstant.UTC_TIME));
                String tagName = tag.get(PublicImageConstant.IMAGE_TAG).asText();
                int tagDownloadCount = tag.get(PublicImageConstant.DOWNLOAD_COUNT).asInt();
                long tagSize = tag.get(PublicImageConstant.SIZE).asLong();
                String dockerfileUrl = generateTagItemUrl(imageName, tagName, PublicImageConstant.DOCKERFILE);
                PublicTagInfo tagInfo = new PublicTagInfo(imageName, tagName, tagSize, tagCreateTime,
                        tagDownloadCount, dockerfileUrl, CommonUtil.domainUrl(registryUrl) + "/" + imageName + ":" + tagName);
                tags.add(tagInfo);
            }
            return new PublicImageDetail(imageName, size, downloadCount, iconUrl, createTime, readMeUrl, "", lastModifiedTime, tags);

        } catch (IOException | ParseException | ResponseException e) {
            logger.warn("get json error, " + e.getMessage());
            return null;
        }
    }

    public static ImageTagDetail getPublicImageTagDetail(String registryUrl, String token, String imageName, String tag) {
        try {
            String tagInfo = getHttpResponseBody(generateGetImageTagInfoUrl(registryUrl, imageName, tag), token);
            JsonNode tagInfoJson = mapper.readTree(tagInfo);
            String created = tagInfoJson.get(PublicImageConstant.CREATETIME).asText();
            long createTime = DateUtil.string2timestamp(created, TimeZone.getTimeZone(GlobalConstant.UTC_TIME));
//            int downloadCount = tagInfoJson.get(PublicImageConstant.DOWNLOAD_COUNT).asInt();
            long size = tagInfoJson.get(PublicImageConstant.SIZE).asInt();
            return new ImageTagDetail().setRegistry(registryUrl).setName(imageName).setTag(tag)
                    .setSize(size).setCreateTime(createTime);
        } catch (IOException | ParseException | ResponseException | IllegalStateException e) {
            logger.warn("get json error, " + e.getMessage());
            return null;
        }
    }

    public static String getPublicRegistryItem(String registryUrl, String token, String suffix) throws ResponseException {
        return getHttpResponseBody(generateGetItemInfoUrl(registryUrl, suffix), token);
    }
}
