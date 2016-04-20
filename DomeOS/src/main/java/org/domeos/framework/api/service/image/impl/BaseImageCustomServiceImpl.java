package org.domeos.framework.api.service.image.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.client.kubernetesclient.definitions.v1.EnvVar;
import org.domeos.client.kubernetesclient.definitions.v1beta1.Job;
import org.domeos.framework.api.biz.file.FileContentBiz;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.biz.image.ImageBiz;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.ci.related.BuildState;
import org.domeos.framework.api.model.ci.related.BuildStatus;
import org.domeos.framework.api.model.global.Registry;
import org.domeos.framework.api.model.global.Server;
import org.domeos.framework.api.model.image.BaseImage;
import org.domeos.framework.api.model.image.BaseImageCustom;
import org.domeos.framework.api.model.image.BuildImage;
import org.domeos.framework.api.model.image.DockerImage;
import org.domeos.framework.api.model.image.related.FileInfo;
import org.domeos.framework.api.model.image.related.SourceImage;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.project.related.EnvSetting;
import org.domeos.framework.api.service.image.BaseImageCustomService;
import org.domeos.framework.api.service.project.impl.UpdateBuildStatusInfo;
import org.domeos.framework.engine.exception.DaoException;
import org.domeos.framework.engine.k8s.JobWrapper;
import org.domeos.framework.engine.model.JobType;
import org.domeos.global.GlobalConstant;
import org.domeos.util.MD5Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;


/**
 * Created by kairen on 29/02/16.
 */
@Service("baseImageCustomService")
public class BaseImageCustomServiceImpl implements BaseImageCustomService {

    private static Logger logger = LoggerFactory.getLogger(BaseImageCustomServiceImpl.class);

    @Autowired
    GlobalBiz globalBiz;

    @Autowired
    ImageBiz imageBiz;

    @Autowired
    ProjectBiz projectBiz;

    @Autowired
    FileContentBiz fileContentBiz;

    @Override
    public HttpResponseTemp<?> addBaseImageCustom(String username, BaseImageCustom baseImageCustom) {

        if (baseImageCustom == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "base image custom information is null.");
        }
        if (!StringUtils.isBlank(baseImageCustom.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, baseImageCustom.checkLegality());
        }

        SourceImage sourceImage = baseImageCustom.getSourceImage();
        if (sourceImage != null) {
            if (StringUtils.isBlank(sourceImage.getRegistryUrl())) {
                sourceImage.setRegistryUrl(globalBiz.getRegistry().getUrl());
            }
            baseImageCustom.setSourceImageJson(baseImageCustom.getSourceImage().toString());
        }
        baseImageCustom.setCreateTime(System.currentTimeMillis());
        baseImageCustom.setUsername(username);

        imageBiz.setBaseImageCustom(baseImageCustom);

        HttpResponseTemp<?> ret = addRelatedInfo(baseImageCustom);
        if (ret != null) {
            imageBiz.deleteBaseImageCustomById(baseImageCustom.getId());
            return ret;
        }
        return ResultStat.OK.wrap(baseImageCustom);
    }

    public HttpResponseTemp<?> validation(long userId, String imageName, String imageTag) {
        Registry registry = globalBiz.getRegistry();
        if (registry == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "registry in global configuation must be set");
        }
        if (imageTag != null) {
            List<DockerImage> images = PrivateRegistry.getDockerImageInfo(imageName, registry.fullRegistry());
            if (images != null) {
                for (DockerImage image : images) {
                    if (imageTag.equals(image.getTag())) {
                        return ResultStat.OK.wrap(JobType.IMAGE_IN_REGISTRY.name());
                    }
                }
            }
        }
        Project project = projectBiz.getProjectByName(imageName);
        if (project != null) {
            return ResultStat.OK.wrap(JobType.PROJECT.name());
        }
        BaseImage baseImage = imageBiz.getBaseImageByNameAndTag(imageName, imageTag, registry.fullRegistry());
        if (baseImage != null) {
            return ResultStat.OK.wrap(JobType.BASEIMAGE.name());
        }

        return ResultStat.OK.wrap(JobType.NEITHER.name());
    }

    public HttpResponseTemp<?> addRelatedInfo(BaseImageCustom baseImageCustom) {

        // filter empty EnvSetting & FileInfo
        List<EnvSetting> newEnvSettings = new ArrayList<>();
        for (EnvSetting envSetting : baseImageCustom.getEnvSettings()) {
            if (StringUtils.isBlank(envSetting.getKey()) || StringUtils.isBlank(envSetting.getValue())) {
                continue;
            }
            newEnvSettings.add(envSetting);
        }
        List<FileInfo> newFileInfos = new ArrayList<>();
        for (FileInfo fileInfo : baseImageCustom.getFiles()) {
            if (StringUtils.isBlank(fileInfo.getFileName()) || StringUtils.isBlank(fileInfo.getFilePath())) {
                continue;
            }
            newFileInfos.add(fileInfo);
        }
        baseImageCustom.setEnvSettings(newEnvSettings);
        baseImageCustom.setFiles(newFileInfos);

        List<FileInfo> fileInfos = baseImageCustom.getFiles();
        StringBuilder dockerfile = new StringBuilder();
        FileInfo dockerfileinfo = new FileInfo(true, "Dockerfile", "", baseImageCustom.getDockerfileContent());

        if (StringUtils.isBlank(baseImageCustom.getDockerfileContent())) {
            SourceImage sourceImage = baseImageCustom.getSourceImage();
            String dockerFrom = sourceImage.getRegistryUrl() + "/" + sourceImage.getImageName() + ":" + sourceImage.getImageTag();
            if (dockerFrom.startsWith(GlobalConstant.HTTP_PREFIX)) {
                dockerFrom = dockerFrom.substring(7);
            }
            if (dockerFrom.startsWith(GlobalConstant.HTTPS_PREFIX)) {
                dockerFrom = dockerFrom.substring(8);
            }
            dockerfile.append("From ").append(dockerFrom).append("\n");

            for (EnvSetting envSetting : baseImageCustom.getEnvSettings()) {
                if (envSetting.getKey().isEmpty() || envSetting.getValue().isEmpty()) {
                    continue;
                }
                dockerfile.append("Env ").append(envSetting.getKey()).append(" ").append(envSetting.getValue()).append("\n");
            }

            StringBuilder fileInfoJson = new StringBuilder();
            for (FileInfo fileInfo : fileInfos) {
                if (StringUtils.isBlank(fileInfo.getFileName())) {
                    continue;
                }
                try {
                    String md5 = saveFile(fileInfo.getFileName(), fileInfo.getContent().getBytes());
                    fileInfo.setMd5(md5);
                    if (fileInfoJson.length() == 0) {
                        fileInfoJson.append("{\"files\" : [").append(fileInfo.toJson());
                    } else {
                        fileInfoJson.append(", ").append(fileInfo.toJson());
                    }
                } catch (Exception e) {
                    return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
                }
                dockerfile.append("COPY ").append(fileInfo.getFileName()).append(" ").append(fileInfo.getFilePath()).append("\n");
            }
            if (fileInfoJson.length() != 0) {
                fileInfoJson.append("]}");
            }

            dockerfileinfo.setContent(dockerfile.toString());
            baseImageCustom.setFileJson(fileInfoJson.toString());
        }
        baseImageCustom.setDockerfileContent(dockerfileinfo.getContent());
//        try {
//            String md5 = saveFile(dockerfileinfo.getFileName(), dockerfileinfo.getContent().getBytes());
//            baseImageCustom.setDockerfile(md5);
//        } catch (Exception e) {
//            return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
//        }

        baseImageCustom.setState(BuildState.Preparing.name());
        imageBiz.updateBaseImageCustomById(baseImageCustom);

        return null;
    }

    @Override
    public HttpResponseTemp<?> previewFile(long userId, BaseImageCustom baseImageCustom, String docMD5) {
        if (baseImageCustom == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "cannot find the custom base image");
        }
        if (userId <= 0) {
            throw ApiException.wrapResultStat(ResultStat.FORBIDDEN);
        }

        byte[] content = fileContentBiz.getContentByMd5(docMD5);
        if (content == null) {
            return ResultStat.OK.wrap(null);
        }
        return ResultStat.OK.wrap(new String(content));
    }

    @Override
    public HttpResponseTemp<?> modifyBaseImageCustom(long userId, String username, BaseImageCustom baseImageCustom) {
        if (baseImageCustom == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "base image custom info is null");
        }

        if (userId <= 0) {
            throw ApiException.wrapResultStat(ResultStat.FORBIDDEN);
        }

        if (!StringUtils.isBlank(baseImageCustom.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, baseImageCustom.checkLegality());
        }
        return addBaseImageCustom(username, baseImageCustom);
    }

    public HttpResponseTemp<?> deleteBaseImageCustom(long userId, int imageId) {
        if (userId <= 0) {
            throw ApiException.wrapResultStat(ResultStat.FORBIDDEN);
        }
        BaseImageCustom baseImageCustom = imageBiz.getBaseImageCustomById(imageId);
        if (baseImageCustom == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "base image custom info is null");
        }
        imageBiz.deleteBaseImageCustomById(baseImageCustom.getId());
        return ResultStat.OK.wrap(null, null);
    }

    @Override
    public HttpResponseTemp<?> startBuild(int imageId, long userId) {

        if (userId <= 0) {
            throw ApiException.wrapResultStat(ResultStat.FORBIDDEN);
        }
        BaseImageCustom baseImageCustom = imageBiz.getBaseImageCustomById(imageId);
        if (baseImageCustom == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "cannot find the Custom base image!");
        }
        BuildImage buildImage = globalBiz.getBuildImage();
        if (buildImage == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "build image not set!");
        }
        Server server = globalBiz.getServer();
        if (server == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "server not set!");
        }

        String secret = UUID.randomUUID().toString();
        baseImageCustom.setSecret(secret);

        JobWrapper jobWrapper;
        try {
            jobWrapper = new JobWrapper().init();
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }

        String registryUrl = globalBiz.getRegistry().registryDomain();
        EnvVar[] envVars = generateEnvs(server.serverInfo(), baseImageCustom.getId(), baseImageCustom.getImageName(),
                baseImageCustom.getImageTag(), registryUrl,
                secret, "BASEIMAGECUSTOM", baseImageCustom.getDockerfile());
        if (envVars == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no env info for build kube job");
        }
        Job job = jobWrapper.sendJob(jobWrapper.generateJob(buildImage.getName(), envVars));

        baseImageCustom.setState(BuildState.Building.name());
        baseImageCustom.setTaskName(job.getMetadata().getName());

        imageBiz.updateBaseImageCustomById(baseImageCustom);

        /*
        kubeBuildMapper.addKubeBuild(new KubeBuild(baseImageCustom.getId(), job.getMetadata().getName(), BuildState.SEND.name(),
         KubeBuild.KubeBuildType.BASEIMAGE.getType()));
        */


        return ResultStat.OK.wrap(baseImageCustom);
    }

    @Override
    public HttpResponseTemp<?> uploadLogfile(MultipartFile body, int imageId, String secret) throws DaoException {

        if (body == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "upload build log error");
        }

        String md5 = saveFile("log", body);
        if (StringUtils.isBlank(md5)) {
            logger.warn("save build log error, image id " + imageId + ", build id ");
            throw ApiException.wrapMessage(ResultStat.SERVER_INTERNAL_ERROR, "save build log file error");
        }

        imageBiz.setBaseImageLogMD5(imageId, md5);

        return ResultStat.OK.wrap(null);
    }

    public HttpResponseTemp<?> listBaseImageCustomInfo(long userId) {
        if (userId <= 0) {
            throw ApiException.wrapResultStat(ResultStat.FORBIDDEN);
        }
        try {
            List<BaseImageCustom> customList = UpdateBuildStatusInfo.updateBaseImageCustoms(imageBiz.listBaseImageCustom());
            Collections.sort(customList, new BaseImageCustom.ProjectListInfoComparator());
            return ResultStat.OK.wrap(customList);
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }

    public HttpResponseTemp<?> getBaseImageCustomInfo(int id) {

        BaseImageCustom baseImageCustom = imageBiz.getBaseImageCustomById(id);
        if (baseImageCustom == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "baseImageCustom not exist");
        }

        if (!StringUtils.isBlank(baseImageCustom.getFileJson())) {
            baseImageCustom.jsonToFileInfo(baseImageCustom.getFileJson());
            for (FileInfo fileInfo : baseImageCustom.getFiles()) {
                fileInfo.setContent(new String(fileContentBiz.getContentByMd5(fileInfo.getMd5())));
            }
        }
        if (globalBiz.getRegistry() == null) {
            baseImageCustom.setRegistry(null);
        } else {
            baseImageCustom.setRegistry(globalBiz.getRegistry().registryDomain());
        }
        baseImageCustom.setSourceImageJson(null);
        baseImageCustom.setFileJson(null);
        baseImageCustom.setDockerfile(null);
        return ResultStat.OK.wrap(baseImageCustom);
    }

    @Override
    public String downloadDockerfile(String secret, int imageId) {
        BaseImageCustom baseImageCustom = imageBiz.getBaseImageCustomById(imageId);
        if (baseImageCustom == null || !baseImageCustom.getSecret().equals(secret)) {
            return "Forbidden";
        }

        return baseImageCustom.getDockerfileContent();
    }

    public String getFileJson(String secret, int imageId) {
        BaseImageCustom baseImageCustom = imageBiz.getBaseImageCustomById(imageId);
        if (baseImageCustom == null || !baseImageCustom.getSecret().equals(secret))
            return null;
        return baseImageCustom.getFileJson();
    }

    public byte[] downloadFile(String md5, String secret, int imageId) {
        BaseImageCustom baseImageCustom = imageBiz.getBaseImageCustomById(imageId);
        if (baseImageCustom == null || !baseImageCustom.getSecret().equals(secret)) {
            return null;
        }

        for (FileInfo fileInfo : baseImageCustom.getFiles()) {
            if (!fileInfo.getMd5().equals(md5)) {
                continue;
            }
            return fileInfo.getContent().getBytes();
        }

        return null;
    }

    public HttpResponseTemp<?> downloadLogFile(int imageId, long userId) {

        if (userId <= 0) {
            throw ApiException.wrapResultStat(ResultStat.FORBIDDEN);
        }
        String md5 = imageBiz.getBaseImageLogMD5(imageId);
        if (StringUtils.isBlank(md5)) {
            return ResultStat.OK.wrap(null);
        }
        byte[] content = fileContentBiz.getContentByMd5(md5);
        if (content == null) {
            return ResultStat.OK.wrap(null);
        }
        return ResultStat.OK.wrap(new String(content));

    }

    public HttpResponseTemp<?> setBuildStatus(BuildStatus buildStatus, String secret) {

        if (buildStatus != null) {
            BaseImageCustom baseImageCustom = imageBiz.getBaseImageCustomById(buildStatus.getProjectId());
            if (baseImageCustom == null || !baseImageCustom.getSecret().equals(secret)) {
                throw ApiException.wrapResultStat(ResultStat.FORBIDDEN);
            }
            Registry registry = globalBiz.getRegistry();
            if (registry != null && BuildState.Success.name().equals(buildStatus.getStatus())) {
                baseImageCustom.setState(BuildState.Success.name());
                BaseImage baseImage = new BaseImage(baseImageCustom.getImageName(), baseImageCustom.getImageTag(),
                        registry.fullRegistry(), baseImageCustom.getDescription());
                double imageSize = PrivateRegistry.getImageSize(baseImage);
                if (imageSize > 0) {
                    buildStatus.setImageSize(imageSize);
                }
                if (baseImageCustom.getPublish() == 1) {
                    BaseImage old = imageBiz.getBaseImageByNameAndTag(baseImage.getImageName(), baseImage.getImageTag(), baseImage.getRegistry());
                    if (old == null) {
                        imageBiz.setBaseImage(baseImage);
                    }
                }
            }
            baseImageCustom.setFinishTime(System.currentTimeMillis());

            imageBiz.updateBaseImageCustomById(baseImageCustom);
        }
        return ResultStat.OK.wrap(null);
    }


    private String saveFile(String name, byte[] content) {
        String md5;
        try {
            md5 = MD5Util.getMd5Str(content);
            fileContentBiz.insertFileContent(name, md5, content);
            return md5;
        } catch (NoSuchAlgorithmException e) {
            logger.error("calculate file Md5 error, message is " + e.getMessage());
        } catch (DaoException e) {
            logger.error("save file error, message is " + e.getMessage());
        }
        return null;
    }

    private String saveFile(String name, MultipartFile file) {
        try {
            byte[] bytes = new byte[(int) file.getSize()];
            file.getInputStream().read(bytes);
            return saveFile(name, bytes);
        } catch (IOException e) {
            logger.error("save upload build log file error, message is " + e.getMessage());
        }
        return null;
    }

    public EnvVar[] generateEnvs(String server, int imageId, String imageName, String imageTag, String registryUrl,
                                 String secret, String type, String dockerfile) {
        return new EnvVar[]{
                new EnvVar().putName("SERVER").putValue(server),
                new EnvVar().putName("IMAGEID").putValue(String.valueOf(imageId)),
                new EnvVar().putName("IMAGENAME").putValue(imageName),
                new EnvVar().putName("IMAGETAG").putValue(imageTag),
                new EnvVar().putName("REGISTRYURL").putValue(registryUrl),
                new EnvVar().putName("SECRET").putValue(secret),
                new EnvVar().putName("DOCKERFILE").putValue(dockerfile),
                new EnvVar().putName("TYPE").putValue(type)
        };
    }

    //unused for the feature of user identified cancel
    public class BaseImageCustomInfoTask implements Callable<BaseImageCustom> {
        int imageId;

        public BaseImageCustomInfoTask(int imageId) {
            this.imageId = imageId;
        }

        @Override
        public BaseImageCustom call() throws Exception {
            BaseImageCustom baseImageCustom = imageBiz.getBaseImageCustomById(imageId);
            if (baseImageCustom == null) {
                return null;
            }
            for (FileInfo fileInfo : baseImageCustom.getFiles()) {
                fileInfo.setContent(new String(fileContentBiz.getContentByMd5(fileInfo.getMd5())));
            }
            return baseImageCustom;
        }
    }
}
