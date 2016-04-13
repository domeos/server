package org.domeos.framework.api.service.image.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.framework.api.biz.image.ImageBiz;
import org.apache.log4j.Logger;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.model.global.Registry;
import org.domeos.framework.api.model.image.AllDockerImages;
import org.domeos.framework.api.model.image.BaseImage;
import org.domeos.framework.api.model.image.BuildImage;
import org.domeos.framework.api.model.image.DockerImage;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.resource.related.ResourceType;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.service.image.ImageService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.ClientConfigure;
import org.domeos.global.GlobalConstant;
import org.domeos.util.CommonUtil;
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

    private static Logger logger = org.apache.log4j.Logger.getLogger(ImageServiceImpl.class);

    @Autowired
    ImageBiz imageBiz;

    @Autowired
    GlobalBiz globalBiz;

    @Autowired
    ProjectBiz projectBiz;

    @Override
    public HttpResponseTemp<?> getBaseImage(int id) {
        BaseImage baseImage = imageBiz.getBaseImage(id);
        if (baseImage == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "not a base image");
        }
        long createTime = PrivateRegistry.getCreateTime(baseImage);
        if (createTime <= 0) {
            logger.error("image not exist in registry");
            return ResultStat.PARAM_ERROR.wrap(null, "image not exist in registry");
        }
        baseImage.setCreateTime(createTime);
        return ResultStat.OK.wrap(baseImage);
    }

    @Override
    public HttpResponseTemp<?> setBaseImage(BaseImage baseImage) {
        if (baseImage == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "base image info is null");
        }
        if (!StringUtils.isBlank(baseImage.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, baseImage.checkLegality());
        }

        BaseImage tmp = imageBiz.getBaseImageByNameAndTag(baseImage.getImageName(), baseImage.getImageTag(), baseImage.getRegistry());
        if (tmp != null) {
            return ResultStat.BASE_IMAGE_ALREADY_EXIST.wrap(null);
        }

        long createTime = PrivateRegistry.getCreateTime(baseImage);
        if (createTime <= 0) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such image in registry");
        } else {
            BaseImage old = imageBiz.getBaseImageByNameAndTag(baseImage.getImageName(), baseImage.getImageTag(), baseImage.getRegistry());
            if (old == null) {
                baseImage.setCreateTime(PrivateRegistry.getCreateTime(baseImage));
                imageBiz.setBaseImage(baseImage);
            } else {
                return ResultStat.BASE_IMAGE_ALREADY_EXIST.wrap(null, "base image exist");
            }
            return ResultStat.OK.wrap(baseImage);
        }
    }

    @Override
    public HttpResponseTemp<?> listBaseImage() {
        List<BaseImage> baseImages = imageBiz.listBaseImages();
        Iterator<BaseImage> iterator = baseImages.iterator();
        while (iterator.hasNext()) {
            BaseImage image = iterator.next();
            long createTime = PrivateRegistry.getCreateTime(image);
            if (createTime <= 0) {
                iterator.remove();
                logger.warn("base image not exist in registry, image: " + image.toString());
            } else {
                image.setCreateTime(createTime);
            }
        }
        return ResultStat.OK.wrap(baseImages);
    }

    @Override
    public HttpResponseTemp<?> deleteBaseImage(int id) {
        imageBiz.deleteBuildImage(id);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> getBuildImage() {
        int userId = GlobalConstant.userThreadLocal.get().getId();
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        return ResultStat.OK.wrap(globalBiz.getBuildImage());
    }

    @Override
    public HttpResponseTemp<?> setBuildImage(BuildImage buildImage) {
        int userId = GlobalConstant.userThreadLocal.get().getId();
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        if (buildImage == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "build image info is null");
        }
        globalBiz.deleteBuildImage();
        buildImage.setLastUpdate(System.currentTimeMillis());
        globalBiz.setBuildImage(buildImage);
        return ResultStat.OK.wrap(buildImage);
    }

    @Override
    public HttpResponseTemp<?> getDockerImages() {
        int userId = GlobalConstant.userThreadLocal.get().getId();
        Registry registry = globalBiz.getRegistry();
        if (registry == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "private registry must be set");
        }
        HashSet<DockerImage> authImages = new HashSet<>();
        List<String> images = PrivateRegistry.getDockerImages(registry.fullRegistry());
        if (images != null && images.size() > 0) {
            List<Future<DockerImage>> futures = new LinkedList<>();
            for (String image : images) {
                Future<DockerImage> future = ClientConfigure.executorService.submit(new GetProjectImageTask(image, userId, registry.fullRegistry()));
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

    public class GetProjectImageTask implements Callable<DockerImage> {

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
            if (project != null && AuthUtil.verify((int)userId, project.getId(), ResourceType.PROJECT, OperationType.GET)) {
                return new DockerImage(project.getId(), registry, image, null, project.getEnvConfDefault(), 0);
            }
            return null;
        }
    }

    @Override
    public HttpResponseTemp<?> getDockerImageDetailByProjectName(String projectName, String registryUrl) {
        int userId = GlobalConstant.userThreadLocal.get().getId();
        if (StringUtils.isBlank(registryUrl)) {
            Registry registry = globalBiz.getRegistry();
            if (registry == null) {
                return ResultStat.PARAM_ERROR.wrap(null, "private registry must be set");
            }
            registryUrl = registry.fullRegistry();
        }

        Project project = projectBiz.getProjectByName(projectName);
        HashSet<DockerImage> dockerImages = new HashSet<>();
        if (project != null) {
            if (AuthUtil.verify(userId, project.getId(), ResourceType.PROJECT, OperationType.GET)) {
                List<DockerImage> images = PrivateRegistry.getDockerImageInfo(projectName, CommonUtil.fullUrl(registryUrl));
                if (images != null) {
                    dockerImages.addAll(images);
                }
            }
        }

        List<BaseImage> baseImages = imageBiz.getBaseImagesByNameAndRegistry(projectName, registryUrl);
        if (baseImages != null && baseImages.size() > 0) {
            List<Future<DockerImage>> futures = new LinkedList<>();
            for (BaseImage baseImage : baseImages) {
                Future<DockerImage> future = ClientConfigure.executorService.submit(new GetBaseImageTask(baseImage));
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
                    return ResultStat.PARAM_ERROR.wrap(null, "no such image in registry");
                }
            }
        }
        return ResultStat.OK.wrap(doSort(dockerImages));
    }

    public class GetBaseImageTask implements Callable<DockerImage> {
        private BaseImage image;

        public GetBaseImageTask(BaseImage image) {
            this.image = image;
        }

        @Override
        public DockerImage call() throws Exception {
            long createTime = PrivateRegistry.getCreateTime(image);
            if (createTime <= 0) {
                return null;
            } else {
                image.setCreateTime(createTime);
                return new DockerImage(0, image.getRegistry(), image.getImageName(), image.getImageTag(), null, createTime);
            }
        }
    }

    private List<DockerImage> doSort(HashSet<DockerImage> images){
        List<DockerImage> list = new ArrayList<>();
        list.addAll(images);
        Collections.sort(list, new DockerImage.DockerImageComparator());
        return list;
    }

    @Override
    public HttpResponseTemp<?> getAllDockerImages() {
        int userId = GlobalConstant.userThreadLocal.get().getId();
        Registry registry = globalBiz.getRegistry();
        if (registry == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "private registry must be set");
        }
        AllDockerImages allDockerImages = new AllDockerImages();
        allDockerImages.setRegistry(registry.getUrl());
        List<String> images = PrivateRegistry.getDockerImages(registry.fullRegistry());
        if (images == null || images.size() == 0) {
            return ResultStat.OK.wrap(null);
        }

        List<Future<Boolean>> futures = new LinkedList<>();
        for (String image : images) {
            Future<Boolean> future = ClientConfigure.executorService.submit(new AllDockerImageTask(allDockerImages, image, userId, registry));
            futures.add(future);
        }
        for (Future<Boolean> future : futures) {
            try {
                future.get();
            } catch (InterruptedException | ExecutionException e) {
                logger.warn("get project list error, message is " + e.getMessage());
            }
        }

        List<BaseImage> baseImages = imageBiz.listBaseImages();
        if (baseImages != null && baseImages.size() > 0) {
            List<Future<BaseImage>> futureImages = new LinkedList<>();
            for (BaseImage baseImage : baseImages) {
                Future<BaseImage> future = ClientConfigure.executorService.submit(new BaseImageTask(baseImage));
                futureImages.add(future);
            }
            for (Future<BaseImage> future : futureImages) {
                try {
                    BaseImage baseImage = future.get();
                    allDockerImages.addBaseImage(baseImage);
                } catch (InterruptedException | ExecutionException e) {
                    logger.warn("get base image list error, message is " + e.getMessage());
                }
            }
        }
        allDockerImages.sortDockerimages();
        allDockerImages.sortBaseimages();
        return ResultStat.OK.wrap(allDockerImages);
    }

    public class BaseImageTask implements Callable<BaseImage> {
        private BaseImage baseImage;

        public BaseImageTask(BaseImage baseImage) {
            this.baseImage = baseImage;
        }

        @Override
        public BaseImage call() throws Exception {
            long createTime = PrivateRegistry.getCreateTime(baseImage);
            baseImage.setCreateTime(createTime);
            return baseImage;
        }
    }

    public class AllDockerImageTask implements Callable<Boolean> {

        private AllDockerImages allDockerImages;
        private String image;
        private int userId;
        private Registry registry;

        public AllDockerImageTask(AllDockerImages allDockerImages, String image, int userId, Registry registry) {
            this.allDockerImages = allDockerImages;
            this.image = image;
            this.userId = userId;
            this.registry = registry;
        }

        @Override
        public Boolean call() throws Exception {
            Project project = projectBiz.getProjectByName(image);
            if (project != null && AuthUtil.verify(userId, project.getId(), ResourceType.PROJECT, OperationType.GET)) {
                allDockerImages.addProjectImage(new DockerImage(project.getId(), registry.getUrl(), image, null, null, project.getCreateTime()));
                return true;
            }
            allDockerImages.addOtherImage(image);
            return true;
        }
    }

    @Override
    public HttpResponseTemp<?> getDockerImageDetail(String name, String registryUrl) {
        int userId = GlobalConstant.userThreadLocal.get().getId();
        if (StringUtils.isBlank(registryUrl)) {
            Registry registry = globalBiz.getRegistry();
            if (registry == null) {
                return ResultStat.PARAM_ERROR.wrap(null, "private registry must be set");
            }
            registryUrl = registry.fullRegistry();
        }

        Project project = projectBiz.getProjectByName(name);
        if (project != null && !AuthUtil.verify(userId, project.getId(), ResourceType.PROJECT, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        List<DockerImage> dockerImages = PrivateRegistry.getDockerImageInfo(name, CommonUtil.fullUrl(registryUrl));
        if (dockerImages != null) {
            Collections.sort(dockerImages, new DockerImage.DockerImageComparator());
        }
        return ResultStat.OK.wrap(dockerImages);
    }
}
