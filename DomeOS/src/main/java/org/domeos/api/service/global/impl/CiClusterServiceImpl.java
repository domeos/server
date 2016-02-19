package org.domeos.api.service.global.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.cluster.CiCluster;
import org.domeos.api.service.global.CiClusterService;
import org.domeos.api.service.global.GlobalService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2015/12/4.
 */

@Service("ciClusterService")
public class CiClusterServiceImpl implements CiClusterService {

    @Autowired
    GlobalService globalService;

    @Override
    public HttpResponseTemp<?> getCiCluster(long userId) {
        CiCluster ciCluster = globalService.getCiCluster();
        return ResultStat.OK.wrap(ciCluster);
    }

    @Override
    public HttpResponseTemp<?> setCiCluster(CiCluster ciCluster, long userId) {
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        if (ciCluster == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "input kube cluster is null");
        }
        if (!StringUtils.isBlank(ciCluster.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, ciCluster.checkLegality());
        }
        if (globalService.getCiCluster() != null) {
            ResultStat.CLUSTER_ALREADY_EXIST.wrap(null);
        }

        globalService.setCiCluster(ciCluster);
        return ResultStat.OK.wrap(ciCluster);
    }

    @Override
    public HttpResponseTemp<?> updateCiCluster(CiCluster ciCluster, long userId) {
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        if (ciCluster == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "input kube cluster is null");
        }
        if (!StringUtils.isBlank(ciCluster.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, ciCluster.checkLegality());
        }

        globalService.updateCiCluster(ciCluster);
        return ResultStat.OK.wrap(ciCluster);
    }

    @Override
    public HttpResponseTemp<?> deleteCiCluster(long userId) {
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        globalService.deleteCiCluster();
        return ResultStat.OK.wrap(null);
    }
}
