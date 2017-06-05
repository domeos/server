package org.domeos.framework.api.model.ci;

import org.domeos.util.StringUtils;
import org.domeos.framework.api.model.ci.related.CodeInfomation;
import org.domeos.framework.api.model.ci.related.CommitInformation;
import org.domeos.framework.api.model.ci.related.ImageInformation;
import org.domeos.framework.api.model.ci.related.UserInformation;
import org.domeos.framework.engine.model.RowModelBase;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by feiliu206363 on 2016/4/4.
 */
public class BuildHistory extends RowModelBase {
    @Override
    public Set<String> excludeForJSON() {
        return toExclude;
    }

    public static Set<String> toExclude = new HashSet<String>() {{
        addAll(RowModelBase.toExclude);
        add("log");
        add("dockerfileContent");
    }};

    private int projectId;
    private CodeInfomation codeInfo;
    private CommitInformation commitInfo;
    private ImageInformation imageInfo;
    private long finishTime;
    private String message;
    private UserInformation userInfo;
    private int autoBuild;
    private int isGC;
    private String secret;
    private String taskName;
    private String log;
    private String dockerfileContent;

    public int getProjectId() {
        return projectId;
    }

    public void setProjectId(int projectId) {
        this.projectId = projectId;
    }

    public CodeInfomation getCodeInfo() {
        return codeInfo;
    }

    public void setCodeInfo(CodeInfomation codeInfo) {
        this.codeInfo = codeInfo;
    }

    public CommitInformation getCommitInfo() {
        return commitInfo;
    }

    public void setCommitInfo(CommitInformation commitInfo) {
        this.commitInfo = commitInfo;
    }

    public long getFinishTime() {
        return finishTime;
    }

    public ImageInformation getImageInfo() {
        return imageInfo;
    }

    public void setImageInfo(ImageInformation imageInfo) {
        this.imageInfo = imageInfo;
    }

    public void setFinishTime(long finishTime) {
        this.finishTime = finishTime;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public UserInformation getUserInfo() {
        return userInfo;
    }

    public void setUserInfo(UserInformation userInfo) {
        this.userInfo = userInfo;
    }

    public int getAutoBuild() {
        return autoBuild;
    }

    public void setAutoBuild(int autoBuild) {
        this.autoBuild = autoBuild;
    }

    public int getIsGC() {
        return isGC;
    }

    public void setIsGC(int isGC) {
        this.isGC = isGC;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public String getLog() {
        return log;
    }

    public void setLog(String log) {
        this.log = log;
    }

    public String getDockerfileContent() {
        return dockerfileContent;
    }

    public void setDockerfileContent(String dockerfileContent) {
        this.dockerfileContent = dockerfileContent;
    }

    public String checkLegality() {
        if (imageInfo == null) {
            return "image info is null";
        }
        if (!StringUtils.isBlank(imageInfo.checkLegality())) {
            return imageInfo.checkLegality();
        }
        return null;
    }
}
