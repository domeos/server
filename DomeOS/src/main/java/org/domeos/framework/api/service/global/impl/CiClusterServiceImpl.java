package org.domeos.framework.api.service.global.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.framework.api.model.global.CiCluster;
import org.domeos.framework.api.service.global.CiClusterService;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2015/12/4.
 */

@Service("ciClusterService")
public class CiClusterServiceImpl implements CiClusterService {

    @Autowired
    GlobalBiz globalBiz;

    @Override
    public HttpResponseTemp<?> getCiCluster() {
        CiCluster ciCluster = globalBiz.getCiCluster();
        return ResultStat.OK.wrap(ciCluster);
    }

    @Override
    public HttpResponseTemp<?> setCiCluster(CiCluster ciCluster) {
        int userId = GlobalConstant.userThreadLocal.get().getId();
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        if (ciCluster == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "input kube cluster is null");
        }
        if (!StringUtils.isBlank(ciCluster.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, ciCluster.checkLegality());
        }
        if (globalBiz.getCiCluster() != null) {
            ResultStat.CLUSTER_ALREADY_EXIST.wrap(null);
        }

        globalBiz.setCiCluster(ciCluster);
        return ResultStat.OK.wrap(ciCluster);
    }

    @Override
    public HttpResponseTemp<?> updateCiCluster(CiCluster ciCluster) {
        int userId = GlobalConstant.userThreadLocal.get().getId();
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        if (ciCluster == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "input kube cluster is null");
        }
        if (!StringUtils.isBlank(ciCluster.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, ciCluster.checkLegality());
        }

        globalBiz.updateCiCluster(ciCluster);
        return ResultStat.OK.wrap(ciCluster);
    }

    @Override
    public HttpResponseTemp<?> deleteCiCluster() {
        int userId = GlobalConstant.userThreadLocal.get().getId();
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        globalBiz.deleteCiCluster();
        return ResultStat.OK.wrap(null);
    }
}
