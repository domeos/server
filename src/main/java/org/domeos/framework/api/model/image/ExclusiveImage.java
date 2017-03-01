package org.domeos.framework.api.model.image;

import org.domeos.util.StringUtils;
import org.domeos.util.CommonUtil;

/**
 * Created by kairen on 25/04/16.
 */
public class ExclusiveImage {
    String imageName;
    String imageTag;
    String registryUrl;
    String startCommand;
    String runFileStoragePath;
    long createTime;
    int registryType; //0 is private 1 is public

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

    public String getRegistryUrl() {
        return registryUrl;
    }

    public void setRegistryUrl(String registryUrl) {
        this.registryUrl = registryUrl;
    }

    public String getStartCommand() {
        return startCommand;
    }

    public void setStartCommand(String startCommand) {
        this.startCommand = startCommand;
    }

    public String getRunFileStoragePath() {
        return runFileStoragePath;
    }

    public void setRunFileStoragePath(String runFileStoragePath) {
        this.runFileStoragePath = runFileStoragePath;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public int getRegistryType() {
        return registryType;
    }

    public void setRegistryType(int registryType) {
        this.registryType = registryType;
    }

    public ExclusiveImage() {
    }

    public ExclusiveImage(String imageName, String imageTag, String registryUrl, boolean isPublic, long createTime) {
        this.imageName = imageName;
        this.imageTag = imageTag;
        this.registryUrl = registryUrl;
        this.registryType = isPublic ? 1: 0;
        this.createTime = createTime;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(imageName)) {
            return "imageName must be set. ";
        } else if (StringUtils.isBlank((imageTag))) {
            return "imageTag must be set. ";
        } else if (StringUtils.isBlank(registryUrl)) {
            return "registry url must be set. ";
        }
        return null;
    }

    public String imageInfo() {
        return CommonUtil.domainUrl(registryUrl+"/"+imageName+":"+imageTag);
    }

//    public Boolean tagLegal() {
//        if (Pattern.matches("([^-_]+-[^-_]+)(_([^-_]+-[^-_]+)*)", imageTag)) {
//            return true;
//        } else {
//            return false;
//        }
//
//    }

    public enum ImageType {
        JAVARUN("runimage-java"),
        JAVACOMPILE("compileimage-java"),
        PHPRUN("runimage-php"),
        PHPCOMPILE("compileimage-php");
        public final String type;
        ImageType(String type) { this.type = type; }
        public String getType() { return this.type; }
    }
    public enum StartCommand {
        TOMCAT("catalina.sh");
        public final String command;
        StartCommand(String command) { this.command = command; }
        public String getCommand() { return this.command; }
    }
    public enum RunFileStoragePath {
        TOMCAT("/usr/local/tomcat/webapps/");
        public final String path;
        RunFileStoragePath(String path) { this.path = path; }
        public String getPath() { return this.path; }
    }

}
