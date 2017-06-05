package org.domeos.framework.api.service.alarm.impl;

import org.domeos.framework.api.consolemodel.alarm.DeploymentInfo;
import org.domeos.framework.api.consolemodel.alarm.TemplateInfo;
import org.domeos.framework.api.consolemodel.alarm.UserGroupInfo;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.alarm.AlarmBiz;
import org.domeos.framework.api.biz.alarm.PortalBiz;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.alarm.*;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.related.HostEnv;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.service.alarm.TemplateService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by baokangwang on 2016/4/13.
 */
@Service
public class TemplateServiceImpl implements TemplateService {

    private static Logger logger = LoggerFactory.getLogger(TemplateServiceImpl.class);

    private final ResourceType resourceType = ResourceType.ALARM;

    @Autowired
    AlarmBiz alarmBiz;

    @Autowired
    AuthBiz authBiz;

    @Autowired
    PortalBiz portalBiz;

    @Autowired
    ClusterBiz clusterBiz;

    @Autowired
    DeploymentBiz deploymentBiz;

    @Override
    public HttpResponseTemp<?> listTemplateInfo() {

        AuthUtil.collectionVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, resourceType, OperationType.GET, 0);

        return ResultStat.OK.wrap(alarmBiz.listTemplateInfoBasic());
    }

    @Override
    public HttpResponseTemp<?> createTemplate(TemplateInfo templateInfo) {

        AuthUtil.collectionVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, resourceType, OperationType.GET, 0);

        if (templateInfo == null) {
            throw ApiException.wrapMessage(ResultStat.TEMPLATE_NOT_LEGAL, "template info is null");
        }
        if (templateInfo.checkLegality() != null) {
            throw ApiException.wrapMessage(ResultStat.TEMPLATE_NOT_LEGAL, templateInfo.checkLegality());
        }
        if (alarmBiz.getTemplateInfoBasicByName(templateInfo.getTemplateName()) != null) {
            throw ApiException.wrapResultStat(ResultStat.TEMPLATE_EXISTED);
        }

        TemplateInfoBasic templateInfoBasic = new TemplateInfoBasic();
        templateInfoBasic.setTemplateName(templateInfo.getTemplateName());
        templateInfoBasic.setTemplateType(templateInfo.getTemplateType());
        templateInfoBasic.setCreatorId(AuthUtil.getUserId());
        templateInfoBasic.setCreatorName(AuthUtil.getCurrentUserName());
        templateInfoBasic.setCreateTime(System.currentTimeMillis());
        templateInfoBasic.setUpdateTime(templateInfoBasic.getCreateTime());
        alarmBiz.addTemplateInfoBasic(templateInfoBasic);
        templateInfo.setId(templateInfoBasic.getId());
        templateInfo.setCreateTime(templateInfoBasic.getCreateTime());
        templateInfo.setCreatorName(templateInfoBasic.getCreatorName());

        createTemplateRelated(templateInfo);

        // insert template into portal database
        portalBiz.insertTemplateByTemplateInfo(templateInfo);

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> modifyTemplate(TemplateInfo templateInfo) {

        AuthUtil.collectionVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, resourceType, OperationType.MODIFY, 0);

        if (templateInfo == null) {
            throw ApiException.wrapMessage(ResultStat.TEMPLATE_NOT_LEGAL, "template info is null");
        }
        if (templateInfo.checkLegality() != null) {
            throw ApiException.wrapMessage(ResultStat.TEMPLATE_NOT_LEGAL, templateInfo.checkLegality());
        }
        TemplateInfoBasic updatedTemplateInfoBasic = alarmBiz.getTemplateInfoBasicById(templateInfo.getId());
        if (updatedTemplateInfoBasic == null) {
            throw ApiException.wrapResultStat(ResultStat.TEMPLATE_NOT_EXISTED);
        }

        updatedTemplateInfoBasic.setTemplateName(templateInfo.getTemplateName());
        updatedTemplateInfoBasic.setUpdateTime(System.currentTimeMillis());
        alarmBiz.updateTemplateInfoBasicById(updatedTemplateInfoBasic);

        deleteTemplateRelated(templateInfo.getId());
        createTemplateRelated(templateInfo);

        templateInfo.setCreateTime(updatedTemplateInfoBasic.getCreateTime());
        templateInfo.setCreatorName(updatedTemplateInfoBasic.getCreatorName());

        // update template into portal database
        portalBiz.updateTemplateByTemplateInfo(templateInfo);

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> getTemplateInfo(long id) {

        AuthUtil.collectionVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, resourceType, OperationType.GET, 0);

        TemplateInfoBasic templateInfoBasic = alarmBiz.getTemplateInfoBasicById(id);
        if (templateInfoBasic == null) {
            throw ApiException.wrapResultStat(ResultStat.TEMPLATE_NOT_EXISTED);
        }

        TemplateInfo templateInfo = new TemplateInfo(templateInfoBasic);
        if (templateInfoBasic.getTemplateType().equals(TemplateType.host.name())) {
            templateInfo.setHostGroupList(alarmBiz.listHostGroupInfoBasicByTemplateId(id));
        } else if (templateInfoBasic.getTemplateType().equals(TemplateType.deploy.name())) {
            Deployment deployment = alarmBiz.getDeploymentByTemplateId(id);
            DeploymentInfo deploymentInfo;
            if (deployment == null) {
                deploymentInfo = new DeploymentInfo(0, null, "non-existed deployment", HostEnv.TEST);
            } else {
                deploymentInfo = new DeploymentInfo(deployment);
                Cluster cluster = clusterBiz.getClusterById(deployment.getClusterId());
                if (cluster != null) {
                    deploymentInfo.setClusterName(cluster.getName());
                }
            }
            templateInfo.setDeploymentInfo(deploymentInfo);
        }
        templateInfo.setStrategyList(alarmBiz.listStrategyInfoByTemplateId(id));
        List<UserGroupInfo> userGroupInfos = new LinkedList<>();
        List<Long> userGroupIds = alarmBiz.listUserGroupIdByTemplateId(id);
        for (Long userGroupId : userGroupIds) {
            if (userGroupId == null) {
                continue;
            }
            UserGroupBasic userGroupBasic = alarmBiz.getUserGroupInfoBasicById(userGroupId);
            if (userGroupBasic == null || userGroupBasic.getUserGroupName() == null) {
                continue;
            }
            String userGroupName = userGroupBasic.getUserGroupName();
            userGroupInfos.add(new UserGroupInfo(userGroupId, userGroupName));
        }
        templateInfo.setUserGroupList(userGroupInfos);
        templateInfo.setCallback(alarmBiz.getCallbackInfoByTemplateId(id));

        return ResultStat.OK.wrap(templateInfo);
    }

    @Override
    public HttpResponseTemp<?> deleteTemplate(long id) {

        AuthUtil.collectionVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, resourceType, OperationType.MODIFY, 0);

        TemplateInfoBasic templateInfoBasic = alarmBiz.getTemplateInfoBasicById(id);
        if (templateInfoBasic == null) {
            throw ApiException.wrapResultStat(ResultStat.TEMPLATE_NOT_EXISTED);
        }

        deleteTemplateRelated(id);
        alarmBiz.deleteTemplateInfoBasicById(id);

        // delete template from portal database
        portalBiz.deleteTemplateByIdAndType(id, templateInfoBasic.getTemplateType());

        return ResultStat.OK.wrap(null);
    }

    private void createTemplateRelated(TemplateInfo templateInfo) {

        long templateId = templateInfo.getId();
        long current = System.currentTimeMillis();

        if (templateInfo.getTemplateType().equals(TemplateType.host.name())) {
            // for host group : only host alarm need to record this
            for (HostGroupInfoBasic hostGroupInfoBasic : templateInfo.getHostGroupList()) {
                if (hostGroupInfoBasic == null) {
                    continue;
                }
                alarmBiz.addTemplateHostGroupBind(templateId, hostGroupInfoBasic.getId(), current);
            }
        } else if (templateInfo.getTemplateType().equals(TemplateType.deploy.name())) {
            alarmBiz.setTemplateDeployIdByTemplateId(templateId, templateInfo.getDeploymentInfo().getId());
        }

        // for strategy
        for (StrategyInfo strategyInfo : templateInfo.getStrategyList()) {
            if (strategyInfo == null) {
                continue;
            }
            long strategyId = createStrategy(strategyInfo);
            alarmBiz.addTemplateStrategyBind(templateId, strategyId, current);
        }
        // for user group
        for (UserGroupInfo userGroupInfo : templateInfo.getUserGroupList()) {
            if (userGroupInfo == null) {
                continue;
            }
            alarmBiz.addTemplateUserGroupBind(templateId, userGroupInfo.getId(), current);
        }
        // for callback
        CallBackInfo callbackInfo = templateInfo.getCallback();
        alarmBiz.addCallBackInfo(callbackInfo);
        alarmBiz.setTemplateCallbackIdByTemplateId(templateId, callbackInfo.getId());
    }

    private void deleteTemplateRelated(long templateId) {

        TemplateInfoBasic templateInfoBasic = alarmBiz.getTemplateInfoBasicById(templateId);
        if (templateInfoBasic == null) {
            return;
        }

        if (templateInfoBasic.getTemplateType().equals(TemplateType.host.name())) {
            // for host group
            alarmBiz.deleteTemplateHostGroupBindByTemplateId(templateId);
        }
        // for strategy
        alarmBiz.deleteStrategyInfoByTemplateId(templateId);
        alarmBiz.deleteTemplateStrategyBindByTemplateId(templateId);
        // for user group
        alarmBiz.deleteTemplateUserGroupBindByTemplateId(templateId);
        // for callback
        alarmBiz.deleteCallbackInfoByTemplateId(templateId);
    }

    private long createStrategy(StrategyInfo strategyInfo) {

        alarmBiz.addStrategyInfo(strategyInfo);
        return strategyInfo.getId();
    }

}
