package org.domeos.framework.api.service.alarm;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.model.alarm.HostGroupInfoBasic;
import org.domeos.framework.api.model.alarm.HostInfo;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/13.
 */
public interface HostGroupService {

    /**
     *
     * @return
     */
    HttpResponseTemp<?> listHostGroupInfo();

    /**
     *
     * @param hostGroupInfoBasic
     * @return
     */
    HttpResponseTemp<?> createHostGroup(HostGroupInfoBasic hostGroupInfoBasic);

    /**
     *
     * @param hostGroupInfoBasic
     * @return
     */
    HttpResponseTemp<?> modifyHostGroup(HostGroupInfoBasic hostGroupInfoBasic);

    /**
     *
     * @param id
     * @return
     */
    HttpResponseTemp<?> deleteHostGroup(long id);

    /**
     *
     * @param id
     * @param hostInfoList
     * @return
     */
    HttpResponseTemp<?> bindHostList(long id, List<HostInfo> hostInfoList);

    /**
     *
     * @param id
     * @param hostId
     * @return
     */
    HttpResponseTemp<?> unbindHost(long id, long hostId);

    /**
     *
     * @param hostInfo
     */
    void createHostIfNotExist(HostInfo hostInfo);
}
