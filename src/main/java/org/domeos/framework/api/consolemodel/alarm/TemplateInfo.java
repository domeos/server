package org.domeos.framework.api.consolemodel.alarm;

import org.domeos.framework.api.model.alarm.*;
import org.domeos.util.StringUtils;

import java.util.List;

/**
 * Created by baokangwang on 2016/3/31.
 */
public class TemplateInfo {

    private long id;
    private String templateName;
    private String templateType;
    private long creatorId;
    private String creatorName;
    private long createTime;
    private long updateTime;
    private List<HostGroupInfoBasic> hostGroupList;
    private DeploymentInfo deploymentInfo;
    private List<StrategyInfo> strategyList;
    private List<UserGroupInfo> userGroupList;
    private CallBackInfo callback;

    public TemplateInfo() {
    }

    public TemplateInfo(long id, String templateName, String templateType, long creatorId, String creatorName,
                        long createTime, long updateTime, List<HostGroupInfoBasic> hostGroupList,
                        DeploymentInfo deploymentInfo, List<StrategyInfo> strategyList, List<UserGroupInfo> userGroupList,
                        CallBackInfo callback) {
        this.id = id;
        this.templateName = templateName;
        this.templateType = templateType;
        this.creatorId = creatorId;
        this.creatorName = creatorName;
        this.createTime = createTime;
        this.updateTime = updateTime;
        this.hostGroupList = hostGroupList;
        this.deploymentInfo = deploymentInfo;
        this.strategyList = strategyList;
        this.userGroupList = userGroupList;
        this.callback = callback;
    }

    public TemplateInfo(TemplateInfoBasic templateInfoBasic) {
        this.id = templateInfoBasic.getId();
        this.templateName = templateInfoBasic.getTemplateName();
        this.templateType = templateInfoBasic.getTemplateType();
        this.creatorId = templateInfoBasic.getCreatorId();
        this.creatorName = templateInfoBasic.getCreatorName();
        this.createTime = templateInfoBasic.getCreateTime();
        this.updateTime = templateInfoBasic.getUpdateTime();
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public String getTemplateType() {
        return templateType;
    }

    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }

    public long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(long creatorId) {
        this.creatorId = creatorId;
    }

    public String getCreatorName() {
        return creatorName;
    }

    public void setCreatorName(String creatorName) {
        this.creatorName = creatorName;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public long getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(long updateTime) {
        this.updateTime = updateTime;
    }

    public List<HostGroupInfoBasic> getHostGroupList() {
        return hostGroupList;
    }

    public void setHostGroupList(List<HostGroupInfoBasic> hostGroupList) {
        this.hostGroupList = hostGroupList;
    }

    public DeploymentInfo getDeploymentInfo() {
        return deploymentInfo;
    }

    public void setDeploymentInfo(DeploymentInfo deploymentInfo) {
        this.deploymentInfo = deploymentInfo;
    }

    public List<StrategyInfo> getStrategyList() {
        return strategyList;
    }

    public void setStrategyList(List<StrategyInfo> strategyList) {
        this.strategyList = strategyList;
    }

    public List<UserGroupInfo> getUserGroupList() {
        return userGroupList;
    }

    public void setUserGroupList(List<UserGroupInfo> userGroupList) {
        this.userGroupList = userGroupList;
    }

    public CallBackInfo getCallback() {
        return callback;
    }

    public void setCallback(CallBackInfo callback) {
        this.callback = callback;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(templateName)) {
            return "template name is blank";
        }
        if (templateType == null) {
            return "template type is blank";
        }
        if (templateType.equals(TemplateType.host.name()) && hostGroupList == null) {
            return "host group is blank";
        }
        if (templateType.equals(TemplateType.deploy.name()) && deploymentInfo == null) {
            return "deployment info is blank";
        }
        if (!templateType.equals(TemplateType.host.name()) && !templateType.equals(TemplateType.deploy.name())) {
            return "illegal template type";
        }
        if (strategyList == null) {
            return "strategy list is blank";
        }
        if (userGroupList == null) {
            return "user group list is blank";
        }
        if (callback == null) {
            return "callback is blank";
        }
        return null;
    }
}