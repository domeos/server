package org.domeos.framework.api.biz.alarm.impl;

import org.domeos.framework.api.biz.alarm.AlarmBiz;
import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.consolemodel.alarm.AlarmEventInfoDraft;
import org.domeos.framework.api.mapper.domeos.alarm.*;
import org.domeos.framework.api.model.alarm.*;
import org.domeos.framework.api.model.alarm.assist.Link;
import org.domeos.framework.api.model.deployment.Deployment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/13.
 */
@Service("alarmBiz")
public class AlarmBizImpl extends BaseBizImpl implements AlarmBiz {

    @Autowired
    CallbackInfoMapper callbackInfoMapper;
    @Autowired
    HostGroupHostBindMapper hostGroupHostBindMapper;
    @Autowired
    HostGroupInfoBasicMapper hostGroupInfoBasicMapper;
    @Autowired
    UserGroupUserBindMapper userGroupUserBindMapper;
    @Autowired
    UserGroupInfoBasicMapper userGroupInfoBasicMapper;
    @Autowired
    HostInfoMapper hostInfoMapper;
    @Autowired
    StrategyInfoMapper strategyInfoMapper;
    @Autowired
    TemplateHostGroupBindMapper templateHostGroupBindMapper;
    @Autowired
    TemplateInfoBasicMapper templateInfoBasicMapper;
    @Autowired
    TemplateStrategyBindMapper templateStrategyBindMapper;
    @Autowired
    TemplateUserGroupBindMapper templateUserGroupBindMapper;
    @Autowired
    AlarmEventInfoMapper alarmEventInfoMapper;
    @Autowired
    LinkMapper linkMapper;
    @Autowired
    DeploymentBiz deploymentBiz;

    // host

    @Override
    public HostInfo getHostInfoById(long id) {
        return hostInfoMapper.getHostInfoById(id);
    }

    @Override
    public HostInfo getHostInfoByHostname(String hostname) {
        return hostInfoMapper.getHostInfoByHostname(hostname);
    }

    @Override
    public HostInfo selectHostInfo(String hostname, String ip, String cluster) {
        return hostInfoMapper.selectHostInfo(hostname, ip, cluster);
    }

    @Override
    public void addHostInfo(HostInfo hostInfo) {
        hostInfoMapper.addHostInfo(hostInfo);
    }

    @Override
    public List<HostInfo> getHostInfoByHostGroupId(long hostGroupId) {
        return hostInfoMapper.getHostInfoByHostGroupId(hostGroupId);
    }

    // host group

    @Override
    public List<HostGroupInfoBasic> listHostGroupInfoBasic() {
        return hostGroupInfoBasicMapper.listHostGroupInfoBasic();
    }

    @Override
    public HostGroupInfoBasic getHostGroupInfoBasicById(long id) {
        return hostGroupInfoBasicMapper.getHostGroupInfoBasicById(id);
    }

    @Override
    public HostGroupInfoBasic getHostGroupInfoBasicByName(String hostGroupName) {
        return hostGroupInfoBasicMapper.getHostGroupInfoBasicByName(hostGroupName);
    }

    @Override
    public void addHostGroupInfoBasic(HostGroupInfoBasic hostGroupInfoBasic) {
        hostGroupInfoBasicMapper.addHostGroupInfoBasic(hostGroupInfoBasic);
    }

    @Override
    public void updateHostGroupInfoBasicById(HostGroupInfoBasic hostGroupInfoBasic) {
        hostGroupInfoBasicMapper.updateHostGroupInfoBasicById(hostGroupInfoBasic);
    }

    @Override
    public List<HostGroupInfoBasic> listHostGroupInfoBasicByTemplateId(long templateId) {
        return hostGroupInfoBasicMapper.listHostGroupInfoBasicByTemplateId(templateId);
    }

    @Override
    public void deleteHostGroupInfoBasicById(long id) {
        hostGroupInfoBasicMapper.deleteHostGroupInfoBasicById(id);
    }

    // template

    @Override
    public List<TemplateInfoBasic> getTemplateInfoBasicByHostGroupId(long hostGroupId) {
        return templateInfoBasicMapper.getTemplateInfoBasicByHostGroupId(hostGroupId);
    }

    @Override
    public List<TemplateInfoBasic> getTemplateInfoBasicByUserGroupId(long userGroupId) {
        return templateInfoBasicMapper.getTemplateInfoBasicByUserGroupId(userGroupId);
    }

    @Override
    public List<TemplateInfoBasic> listTemplateInfoBasic() {
        return templateInfoBasicMapper.listTemplateInfoBasic();
    }

    @Override
    public TemplateInfoBasic getTemplateInfoBasicByName(String templateName) {
        return templateInfoBasicMapper.getTemplateInfoBasicByName(templateName);
    }

    @Override
    public TemplateInfoBasic getTemplateInfoBasicById(long id) {
        return templateInfoBasicMapper.getTemplateInfoBasicById(id);
    }

    @Override
    public void addTemplateInfoBasic(TemplateInfoBasic templateInfoBasic) {
        templateInfoBasicMapper.addTemplateInfoBasic(templateInfoBasic);
    }

    @Override
    public void updateTemplateInfoBasicById(TemplateInfoBasic templateInfoBasic) {
        templateInfoBasicMapper.updateTemplateInfoBasicById(templateInfoBasic);
    }

    @Override
    public void setTemplateCallbackIdByTemplateId(long id, long callbackId) {
        templateInfoBasicMapper.setTemplateCallbackIdByTemplateId(id, callbackId);
    }

    @Override
    public void setTemplateDeployIdByTemplateId(long id, long deployId) {
        templateInfoBasicMapper.setTemplateDeployIdByTemplateId(id, deployId);
    }

    @Override
    public void deleteTemplateInfoBasicById(long id) {
        templateInfoBasicMapper.deleteTemplateInfoBasicById(id);
    }

    @Override
    public Deployment getDeploymentByTemplateId(long templateId) {
        Long deployId = templateInfoBasicMapper.getDeployIdByTemplateId(templateId);
        if (deployId == null) {
            return null;
        }
        return deploymentBiz.getDeployment(deployId.intValue());
    }

    // strategy

    @Override
    public void addStrategyInfo(StrategyInfo strategyInfo) {
        strategyInfoMapper.addStrategyInfo(strategyInfo);
    }

    @Override
    public void deleteStrategyInfoByTemplateId(long templateId) {
        strategyInfoMapper.deleteStrategyInfoByTemplateId(templateId);
    }

    @Override
    public List<StrategyInfo> listStrategyInfoByTemplateId(long templateId) {
        return strategyInfoMapper.listStrategyInfoByTemplateId(templateId);
    }

    // callback

    @Override
    public void addCallBackInfo(CallBackInfo callBackInfo) {
        callbackInfoMapper.addCallBackInfo(callBackInfo);
    }

    @Override
    public void deleteCallbackInfoByTemplateId(long templateId) {
        callbackInfoMapper.deleteCallbackInfoByTemplateId(templateId);
    }

    @Override
    public CallBackInfo getCallbackInfoByTemplateId(long templateId) {
        return callbackInfoMapper.getCallbackInfoByTemplateId(templateId);
    }

    // host group - host

    @Override
    public Long getHostGroupHostBindTime(long hostGroupId, long hostId) {
        return hostGroupHostBindMapper.getHostGroupHostBindTime(hostGroupId, hostId);
    }

    @Override
    public void addHostGroupHostBind(long hostGroupId, long hostId, long bindTime) {
        hostGroupHostBindMapper.addHostGroupHostBind(hostGroupId, hostId, bindTime);
    }

    @Override
    public void updateHostGroupHostBind(long hostGroupId, long hostId, long bindTime) {
        hostGroupHostBindMapper.updateHostGroupHostBind(hostGroupId, hostId, bindTime);
    }

    @Override
    public void deleteHostGroupHostBindByHostGroupId(long hostGroupId) {
        hostGroupHostBindMapper.deleteHostGroupHostBindByHostGroupId(hostGroupId);
    }

    @Override
    public void deleteHostGroupHostBind(long hostGroupId, long hostId) {
        hostGroupHostBindMapper.deleteHostGroupHostBind(hostGroupId, hostId);
    }

    // template - host group

    @Override
    public void addTemplateHostGroupBind(long templateId, long hostGroupId, long bindTime) {
        templateHostGroupBindMapper.addTemplateHostGroupBind(templateId, hostGroupId, bindTime);
    }

    @Override
    public void deleteTemplateHostGroupBindByHostGroupId(long hostGroupId) {
        templateHostGroupBindMapper.deleteTemplateHostGroupBindByHostGroupId(hostGroupId);
    }

    @Override
    public void deleteTemplateHostGroupBindByTemplateId(long templateId) {
        templateHostGroupBindMapper.deleteTemplateHostGroupBindByTemplateId(templateId);
    }

    // template - strategy

    @Override
    public void addTemplateStrategyBind(long templateId, long strategyId, long bindTime) {
        templateStrategyBindMapper.addTemplateStrategyBind(templateId, strategyId, bindTime);
    }

    @Override
    public void deleteTemplateStrategyBindByTemplateId(long templateId) {
        templateStrategyBindMapper.deleteTemplateStrategyBindByTemplateId(templateId);
    }

    // template - user group

    @Override
    public void addTemplateUserGroupBind(long templateId, long userGroupId, long bindTime) {
        templateUserGroupBindMapper.addTemplateUserGroupBind(templateId, userGroupId, bindTime);
    }

    @Override
    public void deleteTemplateUserGroupBindByTemplateId(long templateId) {
        templateUserGroupBindMapper.deleteTemplateUserGroupBindByTemplateId(templateId);
    }

    @Override
    public List<Long> listUserGroupIdByTemplateId(long templateId) {
        return templateUserGroupBindMapper.listUserGroupIdByTemplateId(templateId);
    }

    // alarm event

    @Override
    public List<AlarmEventInfoDraft> listAlarmEventInfoDraft() {
        return alarmEventInfoMapper.listAlarmEventInfoDraft();
    }

    // link

    @Override
    public void addLink(Link link) {
        linkMapper.addLink(link);
    }

    @Override
    public Link getLinkById(long id) {
        return linkMapper.getLinkById(id);
    }

    // user group

    @Override
    public List<UserGroupBasic> listUserGroupInfoBasic() {
        return userGroupInfoBasicMapper.listUserGroupInfoBasic();
    }

    @Override
    public UserGroupBasic getUserGroupInfoBasicById(long id) {
        return userGroupInfoBasicMapper.getUserGroupInfoBasicById(id);
    }

    @Override
    public UserGroupBasic getUserGroupInfoBasicByName(String userGroupName) {
        return userGroupInfoBasicMapper.getUserGroupInfoBasicByName(userGroupName);
    }

    @Override
    public void addUserGroupInfoBasic(UserGroupBasic userGroupBasic) {
        userGroupInfoBasicMapper.addUserGroupInfoBasic(userGroupBasic);
    }

    @Override
    public void updateUserGroupInfoBasicById(UserGroupBasic userGroupBasic) {
        userGroupInfoBasicMapper.updateUserGroupInfoBasicById(userGroupBasic);
    }

    @Override
    public List<UserGroupBasic> listUserGroupInfoBasicByTemplateId(long templateId) {
        return userGroupInfoBasicMapper.listUserGroupInfoBasicByTemplateId(templateId);
    }

    @Override
    public void deleteUserGroupInfoBasicById(long id) {
        userGroupInfoBasicMapper.deleteUserGroupInfoBasicById(id);
    }

    // user group - user

    @Override
    public Long getUserGroupUserBindTime(long userGroupId, long userId) {
        return userGroupUserBindMapper.getUserGroupUserBindTime(userGroupId, userId);
    }

    @Override
    public void addUserGroupUserBind(long userGroupId, long userId, long bindTime) {
        userGroupUserBindMapper.addUserGroupUserBind(userGroupId, userId, bindTime);
    }

    @Override
    public void updateUserGroupUserBind(long userGroupId, long userId, long bindTime) {
        userGroupUserBindMapper.updateUserGroupUserBind(userGroupId, userId, bindTime);
    }

    @Override
    public void deleteUserGroupUserBindByUserGroupId(long userGroupId) {
        userGroupUserBindMapper.deleteUserGroupUserBindByUserGroupId(userGroupId);
    }

    @Override
    public void deleteUserGroupUserBind(long userGroupId, long userId) {
        userGroupUserBindMapper.deleteUserGroupUserBind(userGroupId, userId);
    }

    @Override
    public List<UserInfo> getUserInfoByUserGroupId(long hostGroupId) {
        return userGroupUserBindMapper.getUserInfoByUserGroupId(hostGroupId);
    }

}