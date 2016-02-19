package org.domeos.api.model.ci;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.console.project.Project;
import org.domeos.util.CommonUtil;

/**
 * Created by feiliu206363 on 2015/7/29.
 */
public class BuildInfo {
    int id;
    int projectId;
    String codeBranch;
    String codeTag;
    String imageName;
    String imageTag;
    double imageSize;
    String registry;
    String cmtName;
    String cmtId;
    String cmtMessage;
    long cmtAuthoredDate;
    String cmtAuthorName;
    String cmtAuthorEmail;
    long cmtCommittedDate;
    String cmtCommitterName;
    String cmtCommitterEmail;
    StatusType status;
    String message;
    long userId;
    String userName;
    int autoBuild;
    long createTime;
    long finishTime;
    int isGC;

    public BuildInfo() {
    }

    public BuildInfo(int projectId, String codeBranch, String codeTag, String imageName, String imageTag, double imageSize, String registry, String cmtName, String cmtId, String cmtMessage, long cmtAuthoredDate, String cmtAuthorName, String cmtAuthorEmail, long cmtCommittedDate, String cmtCommitterName, String cmtCommitterEmail, StatusType status, String message, long userId, String userName, int autoBuild, long createTime, long finishTime) {
        this.projectId = projectId;
        this.codeBranch = codeBranch;
        this.codeTag = codeTag;
        this.imageName = imageName;
        this.imageTag = imageTag;
        this.imageSize = imageSize;
        this.registry = registry;
        this.cmtName = cmtName;
        this.cmtId = cmtId;
        this.cmtMessage = cmtMessage;
        this.cmtAuthoredDate = cmtAuthoredDate;
        this.cmtAuthorName = cmtAuthorName;
        this.cmtAuthorEmail = cmtAuthorEmail;
        this.cmtCommittedDate = cmtCommittedDate;
        this.cmtCommitterName = cmtCommitterName;
        this.cmtCommitterEmail = cmtCommitterEmail;
        this.status = status;
        this.message = message;
        this.userId = userId;
        this.userName = userName;
        this.autoBuild = autoBuild;
        this.createTime = createTime;
        this.finishTime = finishTime;
        this.isGC = 0;
    }

    public String getCmtName() {
        return cmtName;
    }

    public void setCmtName(String cmtName) {
        this.cmtName = cmtName;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getProjectId() {
        return projectId;
    }

    public void setProjectId(int projectId) {
        this.projectId = projectId;
    }

    public String getCodeBranch() {
        return codeBranch;
    }

    public void setCodeBranch(String codeBranch) {
        this.codeBranch = codeBranch;
    }

    public String getCodeTag() {
        return codeTag;
    }

    public void setCodeTag(String codeTag) {
        this.codeTag = codeTag;
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

    public double getImageSize() {
        return imageSize;
    }

    public void setImageSize(double imageSize) {
        this.imageSize = imageSize;
    }

    public String getRegistry() {
        return registry;
    }

    public void setRegistry(String registry) {
        this.registry = registry;
    }

    public String getCmtId() {
        return cmtId;
    }

    public void setCmtId(String cmtId) {
        this.cmtId = cmtId;
    }

    public String getCmtMessage() {
        return cmtMessage;
    }

    public void setCmtMessage(String cmtMessage) {
        this.cmtMessage = cmtMessage;
    }

    public long getCmtAuthoredDate() {
        return cmtAuthoredDate;
    }

    public void setCmtAuthoredDate(long cmtAuthoredDate) {
        this.cmtAuthoredDate = cmtAuthoredDate;
    }

    public String getCmtAuthorName() {
        return cmtAuthorName;
    }

    public void setCmtAuthorName(String cmtAuthorName) {
        this.cmtAuthorName = cmtAuthorName;
    }

    public String getCmtAuthorEmail() {
        return cmtAuthorEmail;
    }

    public void setCmtAuthorEmail(String cmtAuthorEmail) {
        this.cmtAuthorEmail = cmtAuthorEmail;
    }

    public long getCmtCommittedDate() {
        return cmtCommittedDate;
    }

    public void setCmtCommittedDate(long cmtCommittedDate) {
        this.cmtCommittedDate = cmtCommittedDate;
    }

    public String getCmtCommitterName() {
        return cmtCommitterName;
    }

    public void setCmtCommitterName(String cmtCommitterName) {
        this.cmtCommitterName = cmtCommitterName;
    }

    public String getCmtCommitterEmail() {
        return cmtCommitterEmail;
    }

    public void setCmtCommitterEmail(String cmtCommitterEmail) {
        this.cmtCommitterEmail = cmtCommitterEmail;
    }

    public StatusType getStatus() {
        return status;
    }

    public void setStatus(StatusType status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public int getAutoBuild() {
        return autoBuild;
    }

    public void setAutoBuild(int autoBuild) {
        this.autoBuild = autoBuild;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public long getFinishTime() {
        return finishTime;
    }

    public void setFinishTime(long finishTime) {
        this.finishTime = finishTime;
    }

    public int getIsGC() {
        return isGC;
    }

    public void setIsGC(int isGC) {
        this.isGC = isGC;
    }

    public enum StatusType {
        Preparing,
        Building,
        Success,
        Fail
    }

    public String checkLegality() {
        if (!StringUtils.isBlank(imageName) && !Project.isRegularDockerName(imageName)) {
            return "image name not support, must match [a-z0-9]+([._-][a-z0-9]+)*";
        }
        if (!StringUtils.isBlank(imageTag) && !Project.isRegularDockerName(imageTag)) {
            return "image tag not support , must match [a-z0-9]+([._-][a-z0-9]+)*";
        }
        // we need registry with out http or https here
        registry = CommonUtil.domainUrl(registry);
        return null;
    }
}
