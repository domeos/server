package org.domeos.framework.api.biz.alarm;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.alarm.HostGroupInfoBasic;
import org.domeos.framework.api.model.alarm.StrategyInfo;
import org.domeos.framework.api.consolemodel.alarm.TemplateInfo;
import org.domeos.framework.api.model.alarm.falcon.portal.Action;
import org.domeos.framework.api.model.alarm.falcon.portal.GroupTemplate;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/14.
 */
public interface PortalBiz extends BaseBiz {

    // host

    Integer getHostIdByHostname(String hostname);

    // group

    void insertHostGroupByHostGroupBasicInfo(HostGroupInfoBasic hostGroupInfoBasic);

    void updateHostGroupByHostGroupBasicInfo(HostGroupInfoBasic hostGroupInfoBasic);

    void deleteHostGroupById(long id);

    String getHostGroupList();

    // template

    void insertTemplateByTemplateInfo(TemplateInfo templateInfo);

    void updateTemplateByTemplateInfo(TemplateInfo templateInfo);

    void deleteTemplateByIdAndType(long templateId, String templateType);

    void updateDeployAlarmPortal(long templateId, int deployId, List<StrategyInfo> strategyInfos);

    // group host bind

    void insertGroupHostBind(long grp_id, long host_id);

    void deleteGroupHostBind(long grp_id, long host_id);

    void deleteGroupHostBindByGroupId(long grp_id);

    // group template bind

    void insertGroupTemplateBind(GroupTemplate groupTemplate);

    // action

    Action getActionById(long id);

    // mockcfg

    void updateNodataObj(String groups);
}
