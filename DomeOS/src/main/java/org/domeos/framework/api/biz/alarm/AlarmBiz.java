package org.domeos.framework.api.biz.alarm;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.consolemodel.alarm.AlarmEventInfoDraft;
import org.domeos.framework.api.model.alarm.*;
import org.domeos.framework.api.model.alarm.assist.Link;
import org.domeos.framework.api.model.deployment.Deployment;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/13.
 */
public interface AlarmBiz extends BaseBiz {

    // host

    HostInfo getHostInfoById(long id);

    HostInfo getHostInfoByHostname(String hostname);

    HostInfo selectHostInfo(String hostname, String ip, String cluster);

    void addHostInfo(HostInfo hostInfo);

    List<HostInfo> getHostInfoByHostGroupId(long hostGroupId);

    // host group

    List<HostGroupInfoBasic> listHostGroupInfoBasic();

    HostGroupInfoBasic getHostGroupInfoBasicById(long id);

    HostGroupInfoBasic getHostGroupInfoBasicByName(String hostGroupName);

    void addHostGroupInfoBasic(HostGroupInfoBasic hostGroupInfoBasic);

    void updateHostGroupInfoBasicById(HostGroupInfoBasic hostGroupInfoBasic);

    void deleteHostGroupInfoBasicById(long id);

    List<HostGroupInfoBasic> listHostGroupInfoBasicByTemplateId(long templateId);

    // template

    List<TemplateInfoBasic> getTemplateInfoBasicByHostGroupId(long hostGroupId);

    List<TemplateInfoBasic> getTemplateInfoBasicByUserGroupId(long userGroupId);

    List<TemplateInfoBasic> listTemplateInfoBasic();

    TemplateInfoBasic getTemplateInfoBasicByName(String templateName);

    TemplateInfoBasic getTemplateInfoBasicById(long id);

    void addTemplateInfoBasic(TemplateInfoBasic templateInfoBasic);

    void updateTemplateInfoBasicById(TemplateInfoBasic templateInfoBasic);

    void setTemplateCallbackIdByTemplateId(long id, long callbackId);

    void setTemplateDeployIdByTemplateId(long id, long deployId);

    void deleteTemplateInfoBasicById(long id);

    Deployment getDeploymentByTemplateId(long templateId);

    // strategy

    void addStrategyInfo(StrategyInfo strategyInfo);

    void deleteStrategyInfoByTemplateId(long templateId);

    List<StrategyInfo> listStrategyInfoByTemplateId(long templateId);

    // callback

    void addCallBackInfo(CallBackInfo callBackInfo);

    void deleteCallbackInfoByTemplateId(long templateId);

    CallBackInfo getCallbackInfoByTemplateId(long templateId);

    // host group - host

    Long getHostGroupHostBindTime(long hostGroupId, long hostId);

    void addHostGroupHostBind(long hostGroupId, long hostId, long bindTime);

    void updateHostGroupHostBind(long hostGroupId, long hostId, long bindTime);

    void deleteHostGroupHostBindByHostGroupId(long hostGroupId);

    void deleteHostGroupHostBind(long hostGroupId, long hostId);

    // template - host group

    void addTemplateHostGroupBind(long templateId, long hostGroupId, long bindTime);

    void deleteTemplateHostGroupBindByHostGroupId(long hostGroupId);

    void deleteTemplateHostGroupBindByTemplateId(long templateId);

    // template - strategy

    void addTemplateStrategyBind(long templateId, long strategyId, long bindTime);

    void deleteTemplateStrategyBindByTemplateId(long templateId);

    // template - user group

    void addTemplateUserGroupBind(long templateId, long userGroupId, long bindTime);

    void deleteTemplateUserGroupBindByTemplateId(long templateId);

    List<Long> listUserGroupIdByTemplateId(long templateId);

    // alarm event

    List<AlarmEventInfoDraft> listAlarmEventInfoDraft();

    // link

    void addLink(Link link);

    Link getLinkById(long id);

    // user group

    List<UserGroupBasic> listUserGroupInfoBasic();

    UserGroupBasic getUserGroupInfoBasicById(long id);

    UserGroupBasic getUserGroupInfoBasicByName(String userGroupName);

    void addUserGroupInfoBasic(UserGroupBasic userGroupBasic);

    void updateUserGroupInfoBasicById(UserGroupBasic userGroupBasic);

    void deleteUserGroupInfoBasicById(long id);

    List<UserGroupBasic> listUserGroupInfoBasicByTemplateId(long templateId);

    // user group - user

    Long getUserGroupUserBindTime(long userGroupId, long userId);

    void addUserGroupUserBind(long userGroupId, long userId, long bindTime);

    void updateUserGroupUserBind(long userGroupId, long userId, long bindTime);

    void deleteUserGroupUserBindByUserGroupId(long userGroupId);

    void deleteUserGroupUserBind(long userGroupId, long userId);

    List<UserInfo> getUserInfoByUserGroupId(long hostGroupId);
}
