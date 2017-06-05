package org.domeos.framework.api.biz.alarm.impl;

import org.domeos.util.StringUtils;
import org.domeos.framework.api.consolemodel.alarm.TemplateInfo;
import org.domeos.framework.api.consolemodel.alarm.UserGroupInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.domeos.framework.api.biz.alarm.AlarmBiz;
import org.domeos.framework.api.biz.alarm.PortalBiz;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.mapper.domeos.alarm.AlarmEventInfoMapper;
import org.domeos.framework.api.mapper.portal.*;
import org.domeos.framework.api.model.alarm.*;
import org.domeos.framework.api.model.alarm.falcon.portal.*;
import org.domeos.framework.api.model.deployment.related.Container;
import org.domeos.framework.api.model.deployment.related.Instance;
import org.domeos.framework.api.service.alarm.AlarmEventService;
import org.domeos.framework.api.service.deployment.InstanceService;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

/**
 * Created by baokangwang on 2016/4/14.
 */
@Service("portalBiz")
public class PortalBizImpl extends BaseBizImpl implements PortalBiz {

    private static Logger logger = LoggerFactory.getLogger(PortalBizImpl.class);

    @Autowired
    AuthBiz authBiz;

    @Autowired
    AlarmBiz alarmBiz;

    @Autowired
    PortalGroupMapper portalGroupMapper;

    @Autowired
    PortalGroupHostMapper portalGroupHostMapper;

    @Autowired
    PortalGroupTemplateMapper portalGroupTemplateMapper;

    @Autowired
    PortalHostMapper portalHostMapper;

    @Autowired
    PortalActionMapper portalActionMapper;

    @Autowired
    PortalStrategyMapper portalStrategyMapper;

    @Autowired
    PortalTemplateMapper portalTemplateMapper;

    @Autowired
    PortalMockcfgMapper portalMockcfgMapper;

    @Autowired
    AlarmEventInfoMapper alarmEventInfoMapper;

    @Autowired
    InstanceService instanceService;

    @Autowired
    AlarmEventService alarmEventService;

    // host

    @Override
    public Integer getHostIdByHostname(String hostname) {
        return portalHostMapper.getHostIdByHostname(hostname);
    }

    // group

    @Override
    public void insertHostGroupByHostGroupBasicInfo(HostGroupInfoBasic hostGroupInfoBasic) {

        Group group = new Group();
        group.setId(hostGroupInfoBasic.getId());
        group.setGrp_name(hostGroupInfoBasic.getHostGroupName());
        group.setCreate_user(hostGroupInfoBasic.getCreatorName());
        group.setCreate_at(new Timestamp(hostGroupInfoBasic.getCreateTime()));
        group.setCome_from(1);
        portalGroupMapper.insertHostGroupById(group);

        // update nodata config
        updateNodataObj(getHostGroupList());
    }

    @Override
    public void updateHostGroupByHostGroupBasicInfo(HostGroupInfoBasic hostGroupInfoBasic) {

        long id = hostGroupInfoBasic.getId();
        String grp_name = hostGroupInfoBasic.getHostGroupName();
        portalGroupMapper.updateHostGroup(id, grp_name);

        // update nodata config
        updateNodataObj(getHostGroupList());
    }

    @Override
    public void deleteHostGroupById(long id) {

        portalGroupHostMapper.deleteByHostGroup(id);
        portalGroupTemplateMapper.deleteByHostGroup(id);
        portalGroupMapper.deleteHostGroup(id);

        // update nodata config
        updateNodataObj(getHostGroupList());
    }

    @Override
    public String getHostGroupList() {
        List<HostGroupInfoBasic> hostGroups = alarmBiz.listHostGroupInfoBasic();
        if (hostGroups == null || hostGroups.size() == 0) {
            return "";
        }
        StringBuilder retBuilder = new StringBuilder();
        for (HostGroupInfoBasic hostGroupInfoBasic : hostGroups) {
            retBuilder.append(hostGroupInfoBasic.getHostGroupName()).append("\n");
        }
        String ret = retBuilder.toString();
        return retBuilder.toString().substring(0, ret.length() - 1);
    }

    // template

    @Override
    public void insertTemplateByTemplateInfo(TemplateInfo templateInfo) {

        long actionId = createTemplateRelatedByTemplateInfo(templateInfo);

        // create template
        Template template = new Template();
        template.setId(templateInfo.getId());
        template.setTpl_name(templateInfo.getTemplateName());
        template.setAction_id(actionId);
        template.setCreate_user(templateInfo.getCreatorName());
        template.setCreate_at(new Timestamp(templateInfo.getCreateTime()));
        portalTemplateMapper.insertTemplateById(template);
    }

    @Override
    public void updateTemplateByTemplateInfo(TemplateInfo templateInfo) {

        Template template = portalTemplateMapper.getTemplateById(templateInfo.getId());
        if (template == null) {
            insertTemplateByTemplateInfo(templateInfo);
            return;
        }

        // delete related
        deleteTemplateRelatedByTemplateInfo(templateInfo.getId(), templateInfo.getTemplateType());

        // create related
        long actionId = createTemplateRelatedByTemplateInfo(templateInfo);

        // update template
        template.setTpl_name(templateInfo.getTemplateName());
        template.setAction_id(actionId);
        portalTemplateMapper.updateTemplateById(template);
    }

    @Override
    public void deleteTemplateByIdAndType(long templateId, String templateType) {

        // delete related
        deleteTemplateRelatedByTemplateInfo(templateId, templateType);

        portalTemplateMapper.deleteTemplateById(templateId);
    }

    @Override
    public void updateDeployAlarmPortal(long templateId, int deployId, List<StrategyInfo> strategyInfos) {

        List<Instance> instances;
        try {
            instances = instanceService.getInstances(deployId);
        } catch (Exception e) {
            logger.warn("get instances for deployment " + deployId + " error: " + e.getMessage());
            instances = new ArrayList<>(1);
        }

        Integer groupId = portalGroupTemplateMapper.getGroupIdByTemplateId(templateId);
        if (groupId == null) {
            return;
        }

        portalGroupHostMapper.deleteByTemplate(templateId);
        List<String> hostnameList = getHostnameListFromInstanceList(instances);
        for (String hostname : hostnameList) {
            Integer id = portalHostMapper.getHostIdByHostname(hostname);
            if (id == null) {
                continue;
            }
            GroupHost groupHost = new GroupHost(groupId.longValue(), id.longValue());
            portalGroupHostMapper.insertGroupHostBind(groupHost);
        }

        // check container changes
        List<String> currentContainers = getContainerIdListFromInstanceList(instances);
        List<String> delContainers = portalStrategyMapper.getContainerIdByTemplateId(templateId);
        if (currentContainers == null || delContainers == null) {
            logger.info("no container exists in mysql for deploy: " + String.valueOf(templateId));
            return;
        }
        List<String> newContainers = new ArrayList<>(currentContainers.size());
        for (String current : currentContainers) {
            if (delContainers.contains(current)) {
                delContainers.remove(current);
            } else {
                newContainers.add(current);
            }
        }

        // for containers that need to delete
        String deleteContainerIds = convertContainerTagList(delContainers);
        if (!StringUtils.isBlank(deleteContainerIds)) {
            List<String> alarmEventIds = alarmEventInfoMapper.listAlarmEventInfoIdByContainerIds(deleteContainerIds);
            String alarmString = "";
            if (alarmEventIds != null) {
                for (String alarmEventId : alarmEventIds) {
                    alarmString = alarmString + alarmEventId + ",,";
                }
            }
            if (!StringUtils.isBlank(alarmString)) {
                alarmString = alarmString.substring(0, alarmString.length() - 2);
                alarmEventService.ignoreAlarmsInside(alarmString);
            }
            portalStrategyMapper.deleteStrategyByContainerIds(deleteContainerIds);
        }

        // for containers that need to add
        for (StrategyInfo strategyInfo : strategyInfos) {
            createStrategyForDeploy(strategyInfo, templateId, newContainers);
        }

    }

    private long createTemplateRelatedByTemplateInfo(TemplateInfo templateInfo) {

        if (templateInfo.getTemplateType().equals(TemplateType.host.name())) {
            // create group-bind
            for (HostGroupInfoBasic hostGroupInfoBasic : templateInfo.getHostGroupList()) {
                createGroupTemplateBind(hostGroupInfoBasic.getId(), templateInfo.getId(), templateInfo.getCreatorName());
            }
            // create strategy
            for (StrategyInfo strategyInfo : templateInfo.getStrategyList()) {
                createStrategyForHost(strategyInfo, templateInfo.getId());
            }
        } else if (templateInfo.getTemplateType().equals(TemplateType.deploy.name())) {
            // get all instances
            List<Instance> instances;
            try {
                instances = instanceService.getInstances(templateInfo.getDeploymentInfo().getId());
            } catch (Exception e) {
                logger.warn("get instances for deployment " + templateInfo.getDeploymentInfo().getDeploymentName() + " error: " + e.getMessage());
                instances = new ArrayList<>(1);
            }
            // create host group for deployment
            long groupId = createHostGroupForDeploy(instances, templateInfo);
            // create group-bind
            createGroupTemplateBind(groupId, templateInfo.getId(), templateInfo.getCreatorName());
            // create strategy
            List<String> containerIdList = getContainerIdListFromInstanceList(instances);
            for (StrategyInfo strategyInfo : templateInfo.getStrategyList()) {
                createStrategyForDeploy(strategyInfo, templateInfo.getId(), containerIdList);
            }
        }

        // create action
        return createAction(templateInfo.getUserGroupList(), templateInfo.getCallback());
    }

    private void deleteTemplateRelatedByTemplateInfo(long templateId, String templateType) {

        Template template = portalTemplateMapper.getTemplateById(templateId);
        if (template == null) {
            return;
        }

        // delete action & strategy & group-bind
        portalActionMapper.deleteActionById(template.getAction_id());
        List<String> alarmEventIds = alarmEventInfoMapper.listAlarmEventInfoIdByTemplateId(template.getId());
        String alarmString = "";
        if (alarmEventIds != null) {
            for (String alarmEventId : alarmEventIds) {
                alarmString = alarmString + alarmEventId + ",,";
            }
        }
        if (!StringUtils.isBlank(alarmString)) {
            alarmString = alarmString.substring(0, alarmString.length() - 2);
            alarmEventService.ignoreAlarmsInside(alarmString);
        }
        portalStrategyMapper.deleteStrategyByTemplateId(template.getId());
        if (templateType.equals(TemplateType.deploy.name())) {
            portalGroupHostMapper.deleteByTemplate(template.getId());
            portalGroupMapper.deleteByTemplate(template.getId());
        }
        portalGroupTemplateMapper.deleteByTemplate(template.getId());
    }

    // group host bind

    @Override
    public void insertGroupHostBind(long grp_id, long host_id) {

        GroupHost groupHost = new GroupHost(grp_id, host_id);
        if (portalGroupHostMapper.checkGroupHostBind(groupHost) != null) {
            return;
        }
        portalGroupHostMapper.insertGroupHostBind(groupHost);
    }

    @Override
    public void deleteGroupHostBind(long grp_id, long host_id) {

        portalGroupHostMapper.deleteGroupHostBind(grp_id, host_id);
    }

    @Override
    public void deleteGroupHostBindByGroupId(long grp_id) {

        portalGroupHostMapper.deleteByHostGroup(grp_id);
    }

    // group template bind

    @Override
    public void insertGroupTemplateBind(GroupTemplate groupTemplate) {

        if (portalGroupTemplateMapper.checkGroupTemplateBind(groupTemplate) != null) {
            return;
        }
        portalGroupTemplateMapper.insertGroupTemplateBind(groupTemplate);
    }

    // action

    @Override
    public Action getActionById(long id) {
        return portalActionMapper.getActionById(id);
    }

    // mockcfg

    @Override
    public void updateNodataObj(String groups) {

        Mockcfg mockcfg = portalMockcfgMapper.getMockcfgByName(GlobalConstant.NODATA_CONFIG_NAME);
        if (mockcfg == null) {
            mockcfg = new Mockcfg();
            mockcfg.setName(GlobalConstant.NODATA_CONFIG_NAME);
            mockcfg.setObj(groups);
            mockcfg.setObj_type("group");
            mockcfg.setMetric("agent.alive");
            mockcfg.setTags("");
            mockcfg.setDstype("GAUGE");
            mockcfg.setStep(10);
            mockcfg.setMock(-1);
            mockcfg.setCreator("admin");
            mockcfg.setT_create(new Timestamp(System.currentTimeMillis()));
            mockcfg.setT_modify(mockcfg.getT_create());
            portalMockcfgMapper.insertMockcfg(mockcfg);
            return;
        }
        portalMockcfgMapper.updateObjByName(GlobalConstant.NODATA_CONFIG_NAME, groups);
    }


    // misc

    private static int booleanToInt(boolean var) {
        return var ? 1 : 0;
    }

    private static String fixNullString(String var) {
        return (var == null) ? "" : var;
    }

    private static String convertMetricForHost(String metric) {
        switch (metric) {
            case "cpu_percent":
                return "cpu.busy";
            case "memory_percent":
                return "mem.memused.percent";
            case "disk_percent":
                return "df.bytes.used.percent";
            case "disk_read":
                return "disk.io.read_bytes";
            case "disk_write":
                return "disk.io.write_bytes";
            case "network_in":
                return "net.if.in.bytes";
            case "network_out":
                return "net.if.out.bytes";
            case "agent_alive":
                return "agent.alive";
            default:
                return "";
        }
    }

    private static String convertMetricForDeploy(String metric) {
        switch (metric) {
            case "cpu_percent":
                return "container.cpu.usage.busy";
            case "memory_percent":
                return "container.mem.usage.percent";
            case "network_in":
                return "container.net.if.in.bytes";
            case "network_out":
                return "container.net.if.out.bytes";
            default:
                return "";
        }
    }

    private static String createFunc(String aggregateType, int pointNum) {
        return aggregateType + "(#" + String.valueOf(pointNum) + ")";
    }

    private String convertContainerTagList(List<String> containerIds) {

        String ret = "";
        for (String containerId : containerIds) {
            ret = ret + "\"id=" + containerId + "\",";
        }
        if (!StringUtils.isBlank(ret)) {
            return ret.substring(0, ret.length() - 1);
        }
        return ret;
    }

    private long createAction(List<UserGroupInfo> userGroupList, CallBackInfo callback) {

        Action action = new Action();
        StringBuilder uicBuilder = new StringBuilder();
        for (UserGroupInfo userGroupInfo : userGroupList) {
            UserGroupBasic userGroupBasic = alarmBiz.getUserGroupInfoBasicById(userGroupInfo.getId());
            if (userGroupBasic == null) {
                continue;
            }
            String userGroupName = userGroupBasic.getUserGroupName();
            if (StringUtils.isBlank(userGroupName)) {
                continue;
            }
            uicBuilder.append(userGroupName).append(",");
        }
        String uic = uicBuilder.toString();
        if (userGroupList.size() == 0) {
            action.setUic("");
        } else {
            action.setUic(uic.substring(0, uic.length() - 1));
        }
        action.setUrl(fixNullString(callback.getUrl()));
        if (callback.isAfterCallbackMail() || callback.isAfterCallbackSms() ||
                callback.isBeforeCallbackMail() || callback.isBeforeCallbackSms()) {
            action.setCallback(1);
        } else {
            action.setCallback(0);
        }
        action.setBefore_callback_sms(booleanToInt(callback.isBeforeCallbackSms()));
        action.setBefore_callback_mail(booleanToInt(callback.isBeforeCallbackMail()));
        action.setAfter_callback_sms(booleanToInt(callback.isAfterCallbackSms()));
        action.setAfter_callback_mail(booleanToInt(callback.isAfterCallbackMail()));
        portalActionMapper.insertAction(action);
        return action.getId();
    }

    private void createStrategyForHost(StrategyInfo strategyInfo, long templateId) {

        Strategy strategy = new Strategy();
        // strategy.setId(strategyInfo.getId());
        strategy.setMetric(convertMetricForHost(strategyInfo.getMetric()));
        strategy.setTags(fixNullString(strategyInfo.getTag()));
        strategy.setMax_step(strategyInfo.getMaxStep());
        strategy.setPriority(0);
        strategy.setFunc(createFunc(strategyInfo.getAggregateType(), strategyInfo.getPointNum()));
        strategy.setOp(strategyInfo.getOperator());
        strategy.setRight_value(String.valueOf(strategyInfo.getRightValue()));
        strategy.setNote(strategyInfo.getNote());
        strategy.setTpl_id(templateId);
        portalStrategyMapper.insertStrategy(strategy);
    }

    private void createStrategyForDeploy(StrategyInfo strategyInfo, long templateId, List<String> containerIdList) {

        for (String containerId : containerIdList) {
            Strategy strategy = new Strategy();
            strategy.setMetric(convertMetricForDeploy(strategyInfo.getMetric()));
            strategy.setTags("id=" + containerId);
            strategy.setMax_step(strategyInfo.getMaxStep());
            strategy.setPriority(0);
            strategy.setFunc(createFunc(strategyInfo.getAggregateType(), strategyInfo.getPointNum()));
            strategy.setOp(strategyInfo.getOperator());
            strategy.setRight_value(String.valueOf(strategyInfo.getRightValue()));
            strategy.setNote(strategyInfo.getNote());
            strategy.setTpl_id(templateId);
            portalStrategyMapper.insertStrategy(strategy);
        }
    }

    private void createGroupTemplateBind(long hostGroupId, long templateId, String creatorName) {
        GroupTemplate groupTemplate = new GroupTemplate();
        groupTemplate.setGrp_id(hostGroupId);
        groupTemplate.setTpl_id(templateId);
        groupTemplate.setBind_user(creatorName);
        insertGroupTemplateBind(groupTemplate);
    }

    private List<String> getHostnameListFromInstanceList(List<Instance> instanceList) {

        List<String> hostnameList = new LinkedList<>();
        for (Instance instance : instanceList) {
            hostnameList.add(instance.getHostName());
        }
        return hostnameList;
    }

    private List<String> getContainerIdListFromInstanceList(List<Instance> instanceList) {

        List<String> containerIdList = new LinkedList<>();
        for (Instance instance : instanceList) {
            for (Container container : instance.getContainers()) {
                containerIdList.add(container.getContainerId());
            }
        }
        return containerIdList;
    }

    private long createHostGroupForDeploy(List<Instance> instances, TemplateInfo templateInfo) {

        List<String> hostnameList = getHostnameListFromInstanceList(instances);

        Group group = new Group();
        group.setGrp_name("domeos_deploy_" + templateInfo.getDeploymentInfo().getDeploymentName() + "_" + String.valueOf(templateInfo.getId()));
        group.setCreate_user(templateInfo.getCreatorName());
        group.setCreate_at(new Timestamp(templateInfo.getCreateTime()));
        group.setCome_from(1);
        portalGroupMapper.insertHostGroup(group);

        for (String hostname : hostnameList) {
            Integer id = portalHostMapper.getHostIdByHostname(hostname);
            if (id == null) {
                continue;
            }
            GroupHost groupHost = new GroupHost(group.getId(), id.longValue());
            portalGroupHostMapper.insertGroupHostBind(groupHost);
        }

        return group.getId();
    }
}
