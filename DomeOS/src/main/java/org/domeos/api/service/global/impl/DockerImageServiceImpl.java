package org.domeos.api.service.global.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.mapper.ci.BaseImageMapper;
import org.domeos.api.mapper.project.EnvConfigMapper;
import org.domeos.api.mapper.project.ProjectBasicMapper;
import org.domeos.api.model.ci.BaseImage;
import org.domeos.api.model.global.AllDockerImages;
import org.domeos.api.model.global.DockerImage;
import org.domeos.api.model.global.Registry;
import org.domeos.api.model.project.EnvConfig;
import org.domeos.api.model.project.ProjectBasic;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.OperationType;
import org.domeos.api.service.ci.impl.PrivateRegistry;
import org.domeos.api.service.global.DockerImageService;
import org.domeos.api.service.global.GlobalService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.global.ClientConfigure;
import org.domeos.shiro.AuthUtil;
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
 * Created by feiliu206363 on 2015/12/16.
 */

@Service("dockerImageService")
public class DockerImageServiceImpl implements DockerImageService {

    private static Logger logger = LoggerFactory.getLogger(DockerImageServiceImpl.class);

    @Autowired
    GlobalService globalService;
    @Autowired
    ProjectBasicMapper projectBasicMapper;
    @Autowired
    EnvConfigMapper envConfigMapper;
    @Autowired
    BaseImageMapper baseImageMapper;

    @Override
    public HttpResponseTemp<?> getDockerImages(Long userId) {
        Registry registry = globalService.getRegistry();
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
        List<BaseImage> baseImages = baseImageMapper.getAllBaseImage();
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
            ProjectBasic projectBasic = projectBasicMapper.getProjectBasicByName(image);
            if (projectBasic != null && AuthUtil.verify(userId, projectBasic.getId(), ResourceType.PROJECT, OperationType.GET)) {
                List<EnvConfig> envConfigs = envConfigMapper.getALLEnvConfigsByProjectId(projectBasic.getId());
                return new DockerImage(projectBasic.getId(), registry, image, null, envConfigs, 0);
            }
            return null;
        }

    }

    @Override
    public HttpResponseTemp<?> getDockerImageInfoByProjectName(String projectName, String registryUrl, Long userId) {
        if (StringUtils.isBlank(registryUrl)) {
            Registry registry = globalService.getRegistry();
            if (registry == null) {
                return ResultStat.PARAM_ERROR.wrap(null, "private registry must be set");
            }
            registryUrl = registry.fullRegistry();
        }
        ProjectBasic projectBasic = projectBasicMapper.getProjectBasicByName(projectName);
        HashSet<DockerImage> dockerImages = new HashSet<>();
        if (projectBasic != null) {
            if (AuthUtil.verify(userId, projectBasic.getId(), ResourceType.PROJECT, OperationType.GET)) {
                List<DockerImage> images = PrivateRegistry.getDockerImageInfo(projectName, CommonUtil.fullUrl(registryUrl));
                if (images != null) {
                    dockerImages.addAll(images);
                }
            }
        }

        List<BaseImage> baseImages = baseImageMapper.getBaseImagesByNameAndRegistry(projectName, registryUrl);
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

    @Override
    public HttpResponseTemp<?> getAllDockerImages(Long userId) {
        Registry registry = globalService.getRegistry();
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
        List<BaseImage> baseImages = baseImageMapper.getAllBaseImage();
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
        private long userId;
        private Registry registry;

        public AllDockerImageTask(AllDockerImages allDockerImages, String image, long userId, Registry registry) {
            this.allDockerImages = allDockerImages;
            this.image = image;
            this.userId = userId;
            this.registry = registry;
        }

        @Override
        public Boolean call() throws Exception {
            ProjectBasic projectBasic = projectBasicMapper.getProjectBasicByName(image);
            if (projectBasic != null && AuthUtil.verify(userId, projectBasic.getId(), ResourceType.PROJECT, OperationType.GET)) {
                allDockerImages.addProjectImage(new DockerImage(projectBasic.getId(), registry.getUrl(), image, null, null, projectBasic.getCreateTime()));
                return true;
            }
            allDockerImages.addOtherImage(image);
            return true;
        }
    }

    @Override
    public HttpResponseTemp<?> getDockerImageDetail(String name, String registryUrl, Long userId) {
        if (StringUtils.isBlank(registryUrl)) {
            Registry registry = globalService.getRegistry();
            if (registry == null) {
                return ResultStat.PARAM_ERROR.wrap(null, "private registry must be set");
            }
            registryUrl = registry.fullRegistry();
        }
        ProjectBasic projectBasic = projectBasicMapper.getProjectBasicByName(name);
        if (projectBasic != null && !AuthUtil.verify(userId, projectBasic.getId(), ResourceType.PROJECT, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        List<DockerImage> dockerImages = PrivateRegistry.getDockerImageInfo(name, CommonUtil.fullUrl(registryUrl));
        if (dockerImages != null) {
            Collections.sort(dockerImages, new DockerImage.DockerImageComparator());
        }
        return ResultStat.OK.wrap(dockerImages);
    }

    private List<DockerImage> doSort(HashSet<DockerImage> images){
        List<DockerImage> list = new ArrayList<>();
        list.addAll(images);
        Collections.sort(list, new DockerImage.DockerImageComparator());
        return list;
    }
}
