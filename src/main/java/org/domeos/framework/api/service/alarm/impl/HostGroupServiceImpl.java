package org.domeos.framework.api.service.alarm.impl;

import org.domeos.framework.api.model.collection.related.ResourceType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.alarm.AlarmBiz;
import org.domeos.framework.api.biz.alarm.PortalBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.consolemodel.alarm.HostGroupInfo;
import org.domeos.framework.api.model.alarm.HostGroupInfoBasic;
import org.domeos.framework.api.model.alarm.HostInfo;
import org.domeos.framework.api.model.alarm.TemplateInfoBasic;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.service.alarm.HostGroupService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.ClientConfigure;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.Callable;

/**
 * Created by baokangwang on 2016/4/13.
 */
@Service
public class HostGroupServiceImpl implements HostGroupService {

    private static Logger logger = LoggerFactory.getLogger(HostGroupServiceImpl.class);

    private final ResourceType resourceType = ResourceType.ALARM;

    @Autowired
    AlarmBiz alarmBiz;

    @Autowired
    PortalBiz portalBiz;

    @Override
    public HttpResponseTemp<?> listHostGroupInfo() {

        AuthUtil.collectionVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, resourceType, OperationType.GET, 0);

        List<HostGroupInfoBasic> hostGroupInfoBasics = alarmBiz.listHostGroupInfoBasic();
        if (hostGroupInfoBasics == null) {
            return ResultStat.OK.wrap(null);
        }
        List<HostGroupInfoTask> hostGroupInfoTasks = new LinkedList<>();

        for (HostGroupInfoBasic hostGroupInfoBasic : hostGroupInfoBasics) {
            hostGroupInfoTasks.add(new HostGroupInfoTask(hostGroupInfoBasic));
        }
        List<HostGroupInfo> hostGroupInfos = ClientConfigure.executeCompletionService(hostGroupInfoTasks);
        Collections.sort(hostGroupInfos, new HostGroupInfo.HostGroupInfoComparator());
        return ResultStat.OK.wrap(hostGroupInfos);
    }

    @Override
    public HttpResponseTemp<?> createHostGroup(HostGroupInfoBasic hostGroupInfoBasic) {

        AuthUtil.collectionVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, resourceType, OperationType.GET, 0);

        if (hostGroupInfoBasic == null) {
            throw ApiException.wrapMessage(ResultStat.HOSTGROUP_NOT_LEGAL, "host group info is null");
        }
        if (hostGroupInfoBasic.checkLegality() != null) {
            throw ApiException.wrapMessage(ResultStat.HOSTGROUP_NOT_LEGAL, hostGroupInfoBasic.checkLegality());
        }
        if (alarmBiz.getHostGroupInfoBasicByName(hostGroupInfoBasic.getHostGroupName()) != null) {
            throw ApiException.wrapResultStat(ResultStat.HOSTGROUP_EXISTED);
        }

        hostGroupInfoBasic.setCreatorId(AuthUtil.getUserId());
        hostGroupInfoBasic.setCreatorName(AuthUtil.getCurrentUserName());
        hostGroupInfoBasic.setCreateTime(System.currentTimeMillis());
        hostGroupInfoBasic.setUpdateTime(hostGroupInfoBasic.getCreateTime());

        alarmBiz.addHostGroupInfoBasic(hostGroupInfoBasic);

        // insert host group info into portal database
        portalBiz.insertHostGroupByHostGroupBasicInfo(hostGroupInfoBasic);

        return ResultStat.OK.wrap(hostGroupInfoBasic);
    }

    @Override
    public HttpResponseTemp<?> modifyHostGroup(HostGroupInfoBasic hostGroupInfoBasic) {

        AuthUtil.collectionVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, resourceType, OperationType.MODIFY, 0);

        if (hostGroupInfoBasic == null) {
            throw ApiException.wrapMessage(ResultStat.HOSTGROUP_NOT_LEGAL, "host group info is null");
        }
        if (hostGroupInfoBasic.checkLegality() != null) {
            throw ApiException.wrapMessage(ResultStat.HOSTGROUP_NOT_LEGAL, hostGroupInfoBasic.checkLegality());
        }
        HostGroupInfoBasic updatedHostGroupInfoBasic = alarmBiz.getHostGroupInfoBasicById(hostGroupInfoBasic.getId());
        if (updatedHostGroupInfoBasic == null) {
            throw ApiException.wrapResultStat(ResultStat.HOSTGROUP_NOT_EXISTED);
        }

        updatedHostGroupInfoBasic.setHostGroupName(hostGroupInfoBasic.getHostGroupName());
        updatedHostGroupInfoBasic.setUpdateTime(System.currentTimeMillis());

        alarmBiz.updateHostGroupInfoBasicById(updatedHostGroupInfoBasic);

        // update host group info in portal database
        portalBiz.updateHostGroupByHostGroupBasicInfo(updatedHostGroupInfoBasic);

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> deleteHostGroup(long id) {

        AuthUtil.collectionVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, resourceType, OperationType.MODIFY, 0);

        HostGroupInfoBasic hostGroupInfoBasic = alarmBiz.getHostGroupInfoBasicById(id);
        if (hostGroupInfoBasic == null) {
            throw ApiException.wrapResultStat(ResultStat.HOSTGROUP_NOT_EXISTED);
        }

        alarmBiz.deleteHostGroupHostBindByHostGroupId(id);
        alarmBiz.deleteTemplateHostGroupBindByHostGroupId(id);
        alarmBiz.deleteHostGroupInfoBasicById(id);

        // delete host group info in portal database
        portalBiz.deleteHostGroupById(id);

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> bindHostList(long id, List<HostInfo> hostInfoList) {

        AuthUtil.collectionVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, resourceType, OperationType.MODIFY, 0);

        if (hostInfoList == null) {
            throw ApiException.wrapMessage(ResultStat.HOST_NOT_LEGAL, "host info list is null");
        }
        for (HostInfo hostInfo : hostInfoList) {
            if (hostInfo.checkLegality() != null) {
                throw ApiException.wrapMessage(ResultStat.HOST_NOT_LEGAL, hostInfo.checkLegality());
            }
        }
        HostGroupInfoBasic hostGroupInfoBasic = alarmBiz.getHostGroupInfoBasicById(id);
        if (hostGroupInfoBasic == null) {
            throw ApiException.wrapResultStat(ResultStat.HOSTGROUP_NOT_EXISTED);
        }

        for (HostInfo hostInfo : hostInfoList) {
            if (portalBiz.getHostIdByHostname(hostInfo.getHostname()) == null) {
                throw ApiException.wrapMessage(ResultStat.AGENT_NOT_READY, "agent not ready on node " + hostInfo.getHostname());
            }
        }

        for (HostInfo hostInfo : hostInfoList) {

            long hostId = portalBiz.getHostIdByHostname(hostInfo.getHostname()).longValue();
            hostInfo.setId(hostId);
            createHostIfNotExist(hostInfo);
            if (alarmBiz.getHostGroupHostBindTime(id, hostId) != null) {
                alarmBiz.updateHostGroupHostBind(id, hostId, System.currentTimeMillis());
            } else {
                alarmBiz.addHostGroupHostBind(id, hostId, System.currentTimeMillis());
                portalBiz.insertGroupHostBind(id, hostId);
            }
        }

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> unbindHost(long id, long hostId) {

        AuthUtil.collectionVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, resourceType, OperationType.MODIFY, 0);

        if (alarmBiz.getHostGroupInfoBasicById(id) == null) {
            throw ApiException.wrapResultStat(ResultStat.HOSTGROUP_NOT_EXISTED);
        }
        if (alarmBiz.getHostInfoById(hostId) == null) {
            throw ApiException.wrapResultStat(ResultStat.HOST_NOT_EXISTED);
        }

        alarmBiz.deleteHostGroupHostBind(id, hostId);
        portalBiz.deleteGroupHostBind(id, hostId);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public void createHostIfNotExist(HostInfo hostInfo) {
        HostInfo retrievedHostInfo = alarmBiz.getHostInfoById(hostInfo.getId());
        if (retrievedHostInfo != null) {
            return;
        }

        hostInfo.setCreateTime(System.currentTimeMillis());
        alarmBiz.addHostInfo(hostInfo);
    }

    private class HostGroupInfoTask implements Callable<HostGroupInfo> {
        HostGroupInfoBasic hostGroupInfoBasic;

        public HostGroupInfoTask(HostGroupInfoBasic hostGroupInfoBasic) {
            this.hostGroupInfoBasic = hostGroupInfoBasic;
        }

        @Override
        public HostGroupInfo call() throws Exception {
            HostGroupInfo hostGroupInfo = new HostGroupInfo(hostGroupInfoBasic);

            long hostGroupId = hostGroupInfoBasic.getId();
            List<HostInfo> hostInfoList = alarmBiz.getHostInfoByHostGroupId(hostGroupId);
            hostGroupInfo.setHostList(hostInfoList);
            List<TemplateInfoBasic> templateInfoBasicList = alarmBiz.getTemplateInfoBasicByHostGroupId(hostGroupId);
            hostGroupInfo.setTemplateList(templateInfoBasicList);

            return hostGroupInfo;
        }
    }
}
