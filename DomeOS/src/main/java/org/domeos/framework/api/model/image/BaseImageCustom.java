package org.domeos.framework.api.model.image;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;

import org.domeos.framework.api.model.image.related.FileInfo;
import org.domeos.framework.api.model.image.related.SourceImage;
import org.domeos.framework.api.model.project.related.EnvSetting;
import org.domeos.framework.engine.model.RowModelBase;
import java.io.IOException;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Created by baokangwang on 2016/4/6.
 */
public class BaseImageCustom extends RowModelBase {

    @Override
    public Set<String> excludeForJSON() {
        return toExclude;
    }

    public static Set<String> toExclude = new HashSet<String>() {{
        add("isGC");
        add("logMD5"); //  this need to be a column in database, because state and log maybe update in different fuc
        addAll(RowModelBase.toExclude);
    }};

    String username;
    SourceImage sourceImage;
    String sourceImageJson;
    String imageName;
    String imageTag;
    String registry;
    String fileJson; //save for the files info on users input used for imagebuilder to download all input files
    String dockerfile;  //dockerfile md5 used for dockerfile download
    String dockerfileContent;
    String secret;
    String logMD5;
    String message;
    double imageSize;
    int publish;
    int autoCustom;
    long finishTime;
    List<FileInfo> files;
    List<EnvSetting> envSettings;
    int isGC;
    String taskName;

    public BaseImageCustom() {
    }

    public BaseImageCustom(String imageName, String imageTag, String registry, String description, List<FileInfo> files) {
        this.imageName = imageName;
        this.imageTag = imageTag;
        this.registry = registry;
        this.setDescription(description);
        this.files = files;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public SourceImage getSourceImage() {
        return sourceImage;
    }

    public void setSourceImage(SourceImage sourceImage) {
        this.sourceImage = sourceImage;
    }

    public String getSourceImageJson() {
        return sourceImageJson;
    }

    public void setSourceImageJson(String sourceImageJson) {
        this.sourceImageJson = sourceImageJson;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public String getImageTag() {
        return imageTag;
    }

    public void setImageTag(String imageTag) {
        this.imageTag = imageTag;
    }

    public String getRegistry() {
        return registry;
    }

    public void setRegistry(String registry) {
        this.registry = registry;
    }

    public String getFileJson() {
        return fileJson;
    }

    public void setFileJson(String fileJson) {
        this.fileJson = fileJson;
    }

    public String getDockerfile() {
        return dockerfile;
    }

    public void setDockerfile(String dockerfile) {
        this.dockerfile = dockerfile;
    }

    public String getDockerfileContent() {
        return dockerfileContent;
    }

    public void setDockerfileContent(String dockerfileContent) {
        this.dockerfileContent = dockerfileContent;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getLogMD5() {
        return logMD5;
    }

    public void setLogMD5(String logMD5) {
        this.logMD5 = logMD5;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public double getImageSize() {
        return imageSize;
    }

    public void setImageSize(double imageSize) {
        this.imageSize = imageSize;
    }

    public int getPublish() {
        return publish;
    }

    public void setPublish(int publish) {
        this.publish = publish;
    }

    public int getAutoCustom() {
        return autoCustom;
    }

    public void setAutoCustom(int autoCustom) {
        this.autoCustom = autoCustom;
    }

    public long getFinishTime() {
        return finishTime;
    }

    public void setFinishTime(long finishTime) {
        this.finishTime = finishTime;
    }

    public List<FileInfo> getFiles() {
        return files;
    }

    public void setFiles(List<FileInfo> files) {
        this.files = files;
    }

    public List<EnvSetting> getEnvSettings() {
        return envSettings;
    }

    public void setEnvSettings(List<EnvSetting> envSettings) {
        this.envSettings = envSettings;
    }

    public int getIsGC() {
        return isGC;
    }

    public void setIsGC(int isGC) {
        this.isGC = isGC;
    }

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

//    public SourceImage jsonToSourceImage(String soourceImageJson) {
//        ObjectMapper objectMapper = new ObjectMapper();
//        try {
//            SourceImage sourceImage = objectMapper.readValue(sourceImageJson, SourceImage.class);
//            this.sourceImage = sourceImage;
//            return sourceImage;
//        } catch (IOException e) {
//            return null;
//        }
//    }

    public List<FileInfo> jsonToFileInfo (String jsonString) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            FileInfos fileInfos = mapper.readValue(jsonString, FileInfos.class);
            this.setFiles(fileInfos.getFiles());
            return fileInfos.getFiles();
        } catch (IOException e) {
            return null;
        }
    }

    /*
    @Override
    public String toString() {
        return "{\"imageName\":" + imageName + ",\"imageTag\":" + imageTag +",\"registry\":" + registry + "}";
    }*/

    public String checkLegality() {
        if (StringUtils.isBlank(imageName)) {
            return "image name is null";
        }
        if (StringUtils.isBlank(imageTag)) {
            this.imageTag = "latest";
        }
        if (sourceImage == null && autoCustom == 1) {
            return "auto custom must select source image.";
        }
        if (autoCustom == 0 && StringUtils.isBlank(dockerfileContent))
            return "you must input the dockerfile when you build image using dockerfile.";
        return null;
    }

    public static class FileInfos {
        List<FileInfo> files;

        public FileInfos(List<FileInfo> files) {
            this.files = files;
        }

        public FileInfos() {
        }

        public List<FileInfo> getFiles() {
            return files;
        }

        public void setFiles(List<FileInfo> files) {
            this.files = files;
        }
    }

    public static class ProjectListInfoComparator implements Comparator<BaseImageCustom> {
        @Override
        public int compare(BaseImageCustom t1, BaseImageCustom t2) {
            if (t2.getCreateTime() > t1.getCreateTime())
                return 1;
            else if (t2.getCreateTime() < t1.getCreateTime())
                return -1;
            else
                return 0;
        }
    }
}