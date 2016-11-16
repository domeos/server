package org.domeos.framework.api.service.image.impl;

import org.apache.commons.lang.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.biz.image.ImageBiz;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.biz.project.ProjectCollectionBiz;
import org.domeos.framework.api.consolemodel.image.*;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.global.Registry;
import org.domeos.framework.api.model.image.*;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.project.ProjectCollection;
import org.domeos.framework.api.model.project.related.ExclusiveBuildType;
import org.domeos.framework.api.service.image.ImageService;
import org.domeos.framework.api.service.token.TokenService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.ClientConfigure;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.util.CommonUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 * Created by baokangwang on 2016/4/6.
 */
@Service("imageService")
public class ImageServiceImpl implements ImageService {

    private static Logger logger = LoggerFactory.getLogger(ImageServiceImpl.class);

    @Autowired
    ImageBiz imageBiz;

    @Autowired
    GlobalBiz globalBiz;

    @Autowired
    ProjectBiz projectBiz;

    @Autowired
    TokenService tokenService;

    @Autowired
    ProjectCollectionBiz projectCollectionBiz;

    private User getUser() {
        User user = CurrentThreadInfo.getUser();
        if (user == null) {
            throw new PermitException("no user logged in");
        }
        return user;
    }

    private String getToken(String privateRegistryUrl, String imageName) {
        Registry registry = globalBiz.getRegistry();
        if (registry == null) {
            throw ApiException.wrapResultStat(ResultStat.REGISTRY_NOT_EXIST);
        }
        if (registry.fullRegistry().equalsIgnoreCase(privateRegistryUrl)) {
            return tokenService.getAdminToken(imageName);
        }
        return null;
    }

    @Override
    public HttpResponseTemp<?> getBaseImage(int id) {
        BaseImage baseImage = imageBiz.getBaseImage(id);
        if (baseImage == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "not a base image");
        }

        String token = getToken(baseImage.getRegistry(), baseImage.getImageName());
        long createTime = PrivateRegistry.getCreateTime(baseImage, token);
        if (createTime <= 0) {
            logger.error("image not exist in registry");
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "image not exist in registry");
        }
        baseImage.setCreateTime(createTime);
        return ResultStat.OK.wrap(baseImage);
    }

    @Override
    public HttpResponseTemp<?> setBaseImage(BaseImage baseImage) {
        User user = getUser();
        if (!AuthUtil.isAdmin(user.getId())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "this user is not admin");
        }
        if (baseImage == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "base image info is null");
        }
        if (!StringUtils.isBlank(baseImage.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, baseImage.checkLegality());
        }

        BaseImage tmp = imageBiz.getBaseImageByNameAndTag(baseImage.getImageName(), baseImage.getImageTag(), baseImage.getRegistry());
        if (tmp != null) {
            throw ApiException.wrapResultStat(ResultStat.BASE_IMAGE_ALREADY_EXIST);
        }

        String token = getToken(baseImage.getRegistry(), baseImage.getImageName());
        long createTime = PrivateRegistry.getCreateTime(baseImage, token);
        if (createTime <= 0) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such image in registry");
        }

        BaseImage old = imageBiz.getBaseImageByNameAndTag(baseImage.getImageName(), baseImage.getImageTag(), baseImage.getRegistry());
        if (old != null) {
            throw ApiException.wrapMessage(ResultStat.BASE_IMAGE_ALREADY_EXIST, "base image exist");
        }
        baseImage.setCreateTime(createTime);
        imageBiz.setBaseImage(baseImage);
        return ResultStat.OK.wrap(baseImage);
    }

    @Override
    public HttpResponseTemp<List<BaseImage>> listBaseImage() {
        List<BaseImage> baseImages = imageBiz.listBaseImages();
//        Iterator<BaseImage> iterator = baseImages.iterator();
//        List<Future<BaseImage>> futures = new ArrayList<>();
//        while (iterator.hasNext()) {
//            BaseImage image = iterator.next();
//            String token = getToken(image.getRegistry(), image.getImageName());
//            Future<BaseImage> future = ClientConfigure.executorService.submit(new GetBaseImageTask(image, token));
//            futures.add(future);
//        }
//
//        for (Future<BaseImage> future : futures) {
//            try {
//                BaseImage baseImage = future.get();
//                baseImages.add(baseImage);
//            } catch (InterruptedException | ExecutionException e) {
//                logger.warn("get base image info error, message=" + e.getMessage());
//            }
//        }
        return ResultStat.OK.wrap(baseImages);
    }

    @Override
    public HttpResponseTemp<?> deleteBaseImage(int id) {
        User user = getUser();
        if (!AuthUtil.isAdmin(user.getId())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "this user is not admin");
        }
        imageBiz.deleteBuildImage(id);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> getBuildImage() {
        User user = getUser();
        if (!AuthUtil.isAdmin(user.getId())) {
            throw ApiException.wrapMessage(ResultStat.FORBIDDEN, "only admin can do this");
        }
        return ResultStat.OK.wrap(globalBiz.getBuildImage());
    }

    @Override
    public HttpResponseTemp<?> setBuildImage(BuildImage buildImage) {
        User user = getUser();
        if (!AuthUtil.isAdmin(user.getId())) {
            throw ApiException.wrapMessage(ResultStat.FORBIDDEN, "only admin can do this");
        }
        if (buildImage == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "build image info is null");
        }
        globalBiz.deleteBuildImage();
        buildImage.setLastUpdate(System.currentTimeMillis());
        globalBiz.setBuildImage(buildImage);
        return ResultStat.OK.wrap(buildImage);
    }

    @Override
    public HttpResponseTemp<?> getDockerImages() {
        User user = getUser();
        Registry registry = globalBiz.getRegistry();
        if (registry == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "private registry must be set");
        }
        HashSet<DockerImage> authImages = new HashSet<>();
        List<String> images = PrivateRegistry.getDockerImages(registry.fullRegistry(), tokenService.getCatalogToken());
        if (images != null && images.size() > 0) {
            List<Future<DockerImage>> futures = new LinkedList<>();
            for (String image : images) {
                Future<DockerImage> future = ClientConfigure.executorService.submit(new GetProjectImageTask(image, user.getId(), registry.fullRegistry()));
                futures.add(future);
            }
            for (Future<DockerImage> future : futures) {
                try {
                    DockerImage dockerImage = future.get();
                    if (dockerImage != null) {
                        authImages.add(dockerImage);
                    }
                } catch (InterruptedException | ExecutionException e) {
                    logger.warn("get project list error, message is " + e.getMessage());
                }
            }
        }
        List<BaseImage> baseImages = imageBiz.listBaseImages();
        if (baseImages != null && baseImages.size() > 0) {
            for (BaseImage baseImage : baseImages) {
                authImages.add(new DockerImage(baseImage.getRegistry(), baseImage.getImageName(), null, 0));
            }
        }
        return ResultStat.OK.wrap(authImages);
    }

    private class GetBaseImageTask implements Callable<BaseImage> {
        private BaseImage image;
        private String token;

        GetBaseImageTask(BaseImage image, String token) {
            this.image = image;
            this.token = token;
        }

        @Override
        public BaseImage call() throws Exception {
            long createTime = PrivateRegistry.getCreateTime(image, token);
            if (createTime <= 0) {
                logger.warn("base image not exist in registry, image: " + image.toString());
            } else {
                image.setCreateTime(createTime);
            }
            return image;
        }
    }

    private class GetProjectImageTask implements Callable<DockerImage> {

        private String image;
        private long userId;
        private String registry;

        public GetProjectImageTask(String image, long userId, String registry) {

            this.image = image;
            this.userId = userId;
            this.registry = registry;
        }

        @Override
        public DockerImage call() throws Exception {
            Project project = projectBiz.getProjectByName(image);
            if (project != null && AuthUtil.verify((int) userId, project.getId(), ResourceType.PROJECT, OperationType.GET)) {
                return new DockerImage(project.getId(), registry, image, null, project.getEnvConfDefault(), 0);
            }
            return null;
        }
    }

    @Override
    public HttpResponseTemp<?> getDockerImageDetailByProjectName(String projectName, String registryUrl) {
        User user = getUser();
        registryUrl = checkRegistry(registryUrl);

        HashSet<DockerImage> dockerImages = new HashSet<>();
        List<BaseImage> baseImages = imageBiz.getBaseImagesByNameAndRegistry(projectName, registryUrl);
        if (baseImages != null && baseImages.size() > 0) {
            List<Future<DockerImage>> futures = new LinkedList<>();
            String token = tokenService.getCatalogToken();
            for (BaseImage baseImage : baseImages) {
                Future<DockerImage> future = ClientConfigure.executorService.submit(new GetDockerImageTask(baseImage, token));
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
                    throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such image in registry");
                }
            }
        }

        Project project = projectBiz.getProjectByName(projectName);
        if (project != null) {
            try {
                AuthUtil.verify(user.getId(), project.getId(), ResourceType.PROJECT, OperationType.GET);
                String token = tokenService.getAdminToken(projectName);
                List<DockerImage> images = PrivateRegistry.getDockerImageInfo(projectName, CommonUtil.fullUrl(registryUrl), token);
                if (images != null) {
                    dockerImages.addAll(images);
                }
            } catch (PermitException e) {
                if (dockerImages.size() == 0) {
                    throw e;
                }
            }
        }

        return ResultStat.OK.wrap(doSort(dockerImages));
    }

    private class GetDockerImageTask implements Callable<DockerImage> {
        private BaseImage image;
        private String token;

        public GetDockerImageTask(BaseImage image, String token) {
            this.image = image;
            this.token = token;
        }

        @Override
        public DockerImage call() throws Exception {
            long createTime = PrivateRegistry.getCreateTime(image, token);
            if (createTime <= 0) {
                return null;
            } else {
                image.setCreateTime(createTime);
                return new DockerImage(0, image.getRegistry(), image.getImageName(), image.getImageTag(), null, createTime);
            }
        }
    }

    private List<DockerImage> doSort(HashSet<DockerImage> images) {
        List<DockerImage> list = new ArrayList<>();
        list.addAll(images);
        Collections.sort(list, new DockerImage.DockerImageComparator());
        return list;
    }

    @Override
    public HttpResponseTemp<AllDockerImages> getAllDockerImages() {
        User user = getUser();
        Registry registry = globalBiz.getRegistry();
        if (registry == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "private registry must be set");
        }

        return ResultStat.OK.wrap(getAllDockerImages(registry.fullRegistry(), user));
    }

    private AllDockerImages getAllDockerImages(String registry, User user) {
        AllDockerImages allDockerImages = new AllDockerImages();
        allDockerImages.setRegistry(registry);
        List<String> images = PrivateRegistry.getDockerImages(registry, tokenService.getCatalogToken());
        if (images == null || images.size() == 0) {
            return null;
        }

        Map<String, ProjectCollection> projectCollections = projectCollectionBiz.getCurrentUserProjectCollectionMap(user.getId());

        Set<String> otherImages = new TreeSet<>();
        Map<String, Set<String>> imageMap = new HashMap<>();
        for (String image : images) {
            String[] names = image.split("/");
            if (names.length < 2) {
                otherImages.add(image);
            } else if (projectCollections.containsKey(names[0])) {
                Set<String> imageSet = imageMap.get(names[0]);
                if (imageSet == null) {
                    imageMap.put(names[0], new TreeSet<String>());
                    imageSet = imageMap.get(names[0]);
                }
                imageSet.add(image);
            } else {
                otherImages.add(image);
            }
        }
        Set<ImageProjectCollection> imageProjectCollections = new TreeSet<>();
        for (Map.Entry<String, Set<String>> entry : imageMap.entrySet()) {
            ProjectCollection projectCollection = projectCollections.get(entry.getKey());
            ImageProjectCollection imageProjectCollection = new ImageProjectCollection();
            imageProjectCollection.setProjectCollectionId(projectCollection.getId());
            imageProjectCollection.setProjectCollectionName(projectCollection.getName());
            imageProjectCollection.setCreateTime(projectCollection.getCreateTime());
            imageProjectCollection.setCreator(AuthUtil.getUserNameById(projectCollection.getCreatorId()));
            imageProjectCollection.setDescription(projectCollection.getDescription());
            imageProjectCollection.setDeletable(checkDeletable(projectCollection.getId(), user.getId()));
            imageProjectCollection.setProjectImages(entry.getValue());
            imageProjectCollections.add(imageProjectCollection);
        }
        allDockerImages.setOtherImages(otherImages);
        allDockerImages.setImageProjectCollections(imageProjectCollections);
        return allDockerImages;
    }

    private List<String> getOtherImages(String registry, User user) {
        List<String> images = PrivateRegistry.getDockerImages(registry, tokenService.getCatalogToken());
        if (images == null || images.size() == 0) {
            return null;
        }

        Map<String, ProjectCollection> projectCollections = projectCollectionBiz.getCurrentUserProjectCollectionMap(user.getId());

        Set<String> otherImages = new TreeSet<>();
        for (String image : images) {
            String[] names = image.split("/");
            if (names.length < 2 || !projectCollections.containsKey(names[0])) {
                otherImages.add(image);
            }
        }
        return new ArrayList<>(otherImages);
    }

    private List<String> getProjectCollectionImages(String registry, int collectionId, User user) {
        List<String> images = PrivateRegistry.getDockerImages(registry, tokenService.getCatalogToken());
        if (images == null || images.size() == 0) {
            return null;
        }

        AuthUtil.verify(user.getId(), collectionId, ResourceType.PROJECT_COLLECTION, OperationType.GET);
        String name = projectCollectionBiz.getNameById(ProjectCollectionBiz.PROJECT_COLLECTION, collectionId);

        Set<String> collectionImages = new TreeSet<>();
        for (String image : images) {
            String[] names = image.split("/");
            if (names.length >= 2 && names[0].equals(name)) {
                collectionImages.add(image);
            }
        }
        return new ArrayList<>(collectionImages);
    }

    private class BaseImageTask implements Callable<BaseImage> {
        private BaseImage baseImage;
        private String token;

        public BaseImageTask(BaseImage baseImage, String token) {
            this.baseImage = baseImage;
            this.token = token;
        }

        @Override
        public BaseImage call() throws Exception {
            long createTime = PrivateRegistry.getCreateTime(baseImage, token);
            baseImage.setCreateTime(createTime);
            return baseImage;
        }
    }

    @Override
    public HttpResponseTemp<?> getDockerImageDetail(String name, String registryUrl) {
        User user = getUser();
        registryUrl = checkRegistry(registryUrl);

        Project project = projectBiz.getProjectByName(name);
        if (project != null && !AuthUtil.verify(user.getId(), project.getId(), ResourceType.PROJECT, OperationType.GET)) {
            throw ApiException.wrapResultStat(ResultStat.FORBIDDEN);
        }

        List<DockerImage> dockerImages = PrivateRegistry.getDockerImageInfo(name, registryUrl, tokenService.getAdminToken(name));
        if (dockerImages != null) {
            Collections.sort(dockerImages, new DockerImage.DockerImageComparator());
        }
        return ResultStat.OK.wrap(dockerImages);
    }

    @Override
    public HttpResponseTemp<List<ImageNameDetail>> dockerImageNameDetail(ImageNameDetailRequest imageNameDetailRequest) {
        if (imageNameDetailRequest == null || imageNameDetailRequest.getImages() == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "image name is null");
        }

        String registry = checkRegistry(imageNameDetailRequest.getRegistry());
        Registry privateRegistry = globalBiz.getRegistry();

        User user = getUser();
        if (ImageNameDetailRequest.RequestType.PROJECT_COLLECTION.equals(imageNameDetailRequest.getRequestType())) {
            AuthUtil.collectionVerify(user.getId(), imageNameDetailRequest.getProjectCollectionId(), ResourceType.PROJECT_COLLECTION, OperationType.GET, -1);
        }

        List<String> images = imageNameDetailRequest.getImages();
        if (images == null || images.isEmpty()) {
            if (ImageNameDetailRequest.RequestType.OTHERIMAGE.equals(imageNameDetailRequest.getRequestType())) {
                images = getOtherImages(registry, user);
            } else {
                images = getProjectCollectionImages(registry, imageNameDetailRequest.getProjectCollectionId(), user);
            }
        }

        if (images == null || images.isEmpty()) {
            return ResultStat.OK.wrap(null);
        }

        List<ImageNameDetail> imageNameDetails = new ArrayList<>();
        List<Future<ImageNameDetail>> futures = new ArrayList<>();
        boolean useToken = registry.equals(privateRegistry.fullRegistry());
        for (String image : images) {
            Future<ImageNameDetail> future = ClientConfigure.executorService.submit(new GetImageDetailTask(registry, image, useToken));
            futures.add(future);
        }

        for (Future<ImageNameDetail> future : futures) {
            try {
                ImageNameDetail detail = future.get();
                if (detail != null) {
                    imageNameDetails.add(detail);
                }
            } catch (InterruptedException | ExecutionException e) {
                logger.warn("Get image detail error, message is :" + e);
            }
        }

        return ResultStat.OK.wrap(imageNameDetails);
    }

    @Override
    public HttpResponseTemp<Set<ImageTagDetail>> getImageTagDetail(ImageTagDetailRequest imageTagDetailRequest) {
        if (imageTagDetailRequest == null || StringUtils.isBlank(imageTagDetailRequest.getName()) || imageTagDetailRequest.getTags() == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "image name or tags is null");
        }

        String registry = checkRegistry(imageTagDetailRequest.getRegistry());
        Registry privateRegistry = globalBiz.getRegistry();
        User user = getUser();
        String token = null;
        if (registry.equals(privateRegistry.fullRegistry())) {
            Project project = projectBiz.getProjectByName(imageTagDetailRequest.getName());
            if (project != null) {
                AuthUtil.verify(user.getId(), project.getId(), ResourceType.PROJECT, OperationType.GET);
            }
            token = tokenService.getAdminToken(imageTagDetailRequest.getName());
        }

        List<Future<ImageTagDetail>> futures = new ArrayList<>();
        String name = imageTagDetailRequest.getName();
        Set<ImageTagDetail> imageTagDetails = new HashSet<>();
        for (String tag : imageTagDetailRequest.getTags()) {
            Future<ImageTagDetail> future = ClientConfigure.executorService.submit(new GetImageTagDetailTask(registry, name, tag, token));
            futures.add(future);
        }
        for (Future<ImageTagDetail> future : futures) {
            try {
                ImageTagDetail tagDetail = future.get();
                if (tagDetail != null) {
                    imageTagDetails.add(tagDetail);
                }
            } catch (InterruptedException | ExecutionException e) {
                logger.warn("get image tag detail error, message is " + e.getMessage());
            }
        }

        return ResultStat.OK.wrap(imageTagDetails);
    }

    @Override
    public HttpResponseTemp<?> deleteImage(String name, String registry) {
        return null;
    }

    private class GetImageTagDetailTask implements Callable<ImageTagDetail> {
        private String tag;
        private String name;
        private String registry;
        private String token;

        public GetImageTagDetailTask(String registry, String name, String tag, String token) {
            this.tag = tag;
            this.name = name;
            this.registry = registry;
            this.token = token;
        }

        @Override
        public ImageTagDetail call() throws Exception {
            return PrivateRegistry.getImageTagDetail(registry, name, tag, token);
        }
    }

    @Override
    public HttpResponseTemp<?> deleteImageByTag(String name, String tag, String registry) {
        User user = getUser();
        registry = checkRegistry(registry);
        Project project = projectBiz.getProjectByName(name);
        if (project != null) {
            AuthUtil.verify(user.getId(), project.getId(), ResourceType.PROJECT, OperationType.DELETE);
        }
        String value = PrivateRegistry.deleteDockerImage(registry, name, tag, tokenService.getCurrentUserToken(name, "push"));
        if (value == null) {
            return ResultStat.PROJECT_NOT_EXIST.wrap("the docker is not exist");
        }
        if (value.length() > 0) {
            return ResultStat.DELETE_IMAGE_IN_REGISTRY_ERROR.wrap(value);
        }
        return ResultStat.OK.wrap(value);
    }

    private class GetImageDetailTask implements Callable<ImageNameDetail> {
        private Boolean useToken;
        private String registry;
        private String image;

        public GetImageDetailTask(String registry, String image, Boolean useToken) {
            this.registry = registry;
            this.image = image;
            this.useToken = useToken;
        }

        @Override
        public ImageNameDetail call() throws Exception {
            String token = null;
            if (useToken) {
                token = tokenService.getAdminToken(image);
            }
            List<String> imageTags = PrivateRegistry.getImageTagList(registry, image, token);
            return new ImageNameDetail().setImageName(image).setTags(imageTags).setRegistry(registry);
        }
    }

    @Override
    public HttpResponseTemp<?> getAllExclusiveImages(String type) {
        Registry publicRegistry = globalBiz.getPublicRegistry();
        Registry privateRegistry = globalBiz.getRegistry();
        if (publicRegistry == null || StringUtils.isBlank(publicRegistry.fullRegistry())) {
            throw ApiException.wrapMessage(ResultStat.REGISTRY_NOT_EXIST, "public registry must be set.");
        }
        if (privateRegistry == null || StringUtils.isBlank(privateRegistry.fullRegistry())) {
            throw ApiException.wrapMessage(ResultStat.REGISTRY_NOT_EXIST, "private registry must be set.");
        }
        String privateRegistryUrl = privateRegistry.fullRegistry();
        String publicRegistryUrl = publicRegistry.fullRegistry();

        AllExclusiveImages imageList = new AllExclusiveImages();
        List<ExclusiveImage> publicCompileImages = null, privateCompileImages = null, publicRunImages = null, privateRunImages = null;
        if (StringUtils.equalsIgnoreCase(ExclusiveBuildType.JAVA.name(), type)) {
            publicCompileImages = getExclusiveImages("domeos/" + ExclusiveImage.ImageType.JAVACOMPILE.getType(), CommonUtil.fullUrl(publicRegistryUrl), true);
            privateCompileImages = getExclusiveImages(ExclusiveImage.ImageType.JAVACOMPILE.getType(), CommonUtil.fullUrl(privateRegistryUrl), false);
            publicRunImages = getExclusiveImages("domeos/" + ExclusiveImage.ImageType.JAVARUN.getType(), CommonUtil.fullUrl(publicRegistryUrl), true);
            privateRunImages = getExclusiveImages(ExclusiveImage.ImageType.JAVARUN.getType(), CommonUtil.fullUrl(privateRegistryUrl), false);
        }
        imageList.setCompilePublicImageList(publicCompileImages);
        imageList.setCompilePrivateImageList(privateCompileImages);
        imageList.setRunPublicImageList(publicRunImages);
        imageList.setRunPrivateImageList(privateRunImages);
        imageList.sortAllImageList();
        return ResultStat.OK.wrap(imageList);
    }

    private class PublicExclusiveImageTask implements Callable<ExclusiveImage> {
        private DockerImage image;
        private boolean isPublic;

        public PublicExclusiveImageTask(DockerImage image, boolean isPublic) {
            this.image = image;
            this.isPublic = isPublic;
        }

        @Override
        public ExclusiveImage call() throws Exception {
            ExclusiveImage imageInfo = new ExclusiveImage(image.getImageName(), image.getTag(), image.getRegistry(), isPublic, image.getCreateTime());
            if (isPublic) {
                for (ExclusiveImage.RunFileStoragePath path : ExclusiveImage.RunFileStoragePath.values()) {
                    if (StringUtils.containsIgnoreCase(image.getTag(), path.name())) {
                        imageInfo.setRunFileStoragePath(path.getPath());
                    }
                }
                for (ExclusiveImage.StartCommand command : ExclusiveImage.StartCommand.values()) {
                    if (StringUtils.containsIgnoreCase(image.getTag(), command.name())) {
                        imageInfo.setStartCommand(command.getCommand());
                    }
                }
            }
            return imageInfo;
        }
    }

    public List<ExclusiveImage> getExclusiveImages(String name, String registryUrl, boolean isPublic) {
        String token = tokenService.getAdminToken(name);
        List<DockerImage> dockerImages = PrivateRegistry.getDockerImageInfo(name, CommonUtil.fullUrl(registryUrl), token);
        List<ExclusiveImage> imageList = new ArrayList<>();
        if (dockerImages != null) {
            Collections.sort(dockerImages, new DockerImage.DockerImageComparator());
            List<Future<ExclusiveImage>> futureExclusiveImages = new LinkedList<>();
            for (DockerImage image : dockerImages) {
                Future<ExclusiveImage> future = ClientConfigure.executorService.submit(new PublicExclusiveImageTask(image, isPublic));
                futureExclusiveImages.add(future);
            }
            for (Future<ExclusiveImage> futureImage : futureExclusiveImages) {
                try {
                    ExclusiveImage imageInfo = futureImage.get();
                    imageList.add(imageInfo);
                } catch (InterruptedException | ExecutionException e) {
                    logger.warn("get exclusive image list error, message is " + e.getMessage());
                }
            }
            //private registry contain base images
            if (!isPublic) {
                List<BaseImage> baseImages = imageBiz.getBaseImagesByName(name);
                List<Future<BaseImage>> futureImages = new LinkedList<>();
                for (BaseImage baseImage : baseImages) {
                    if (baseImage.getRegistry().equals(CommonUtil.fullUrl(registryUrl))) {
                        continue;
                    }
                    Future<BaseImage> future = ClientConfigure.executorService.submit(new BaseImageTask(baseImage, token));
                    futureImages.add(future);
                }
                for (Future<BaseImage> future : futureImages) {
                    try {
                        BaseImage baseImage = future.get();
                        ExclusiveImage image = new ExclusiveImage(baseImage.getImageName(), baseImage.getImageTag(),
                                baseImage.getRegistry(), isPublic, baseImage.getCreateTime());
                        imageList.add(image);
                    } catch (InterruptedException | ExecutionException e) {
                        logger.warn("get base image list error, message is " + e.getMessage());
                    }
                }
            }
        }
        return imageList;
    }

    private String checkRegistry(String registryUrl) {
        if (StringUtils.isBlank(registryUrl)) {
            Registry registry = globalBiz.getRegistry();
            if (registry == null) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "private registry must be set");
            }
            registryUrl = registry.fullRegistry();
        }
        return registryUrl;
    }

    private boolean checkDeletable(int projectCollectionId, int userId) {
        try {
            AuthUtil.collectionVerify(userId, projectCollectionId, ResourceType.PROJECT_COLLECTION, OperationType.DELETE, -1);
            return true;
        } catch (PermitException e) {
            return false;
        }
    }
}
