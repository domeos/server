package org.domeos.framework.api.service.global.impl;

import org.domeos.util.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.global.CiCluster;
import org.domeos.framework.api.service.global.CiClusterService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.CurrentThreadInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2015/12/4.
 */

@Service
public class CiClusterServiceImpl implements CiClusterService {

    @Autowired
    GlobalBiz globalBiz;

    private void checkAdmin() {
        if (!AuthUtil.isAdmin(CurrentThreadInfo.getUserId())) {
            throw new PermitException("only admin can operate ci cluster");
        }
    }

    @Override
    public HttpResponseTemp<?> getCiCluster() {
        CiCluster ciCluster = globalBiz.getCiCluster();
        return ResultStat.OK.wrap(ciCluster);
    }

    @Override
    public HttpResponseTemp<?> setCiCluster(CiCluster ciCluster) {
        checkAdmin();

        if (ciCluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "input kube cluster is null");
        }
        if (!StringUtils.isBlank(ciCluster.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, ciCluster.checkLegality());
        }
        if (globalBiz.getCiCluster() != null) {
            throw ApiException.wrapResultStat(ResultStat.CLUSTER_ALREADY_EXIST);
        }

        globalBiz.deleteCiCluster();
        globalBiz.setCiCluster(ciCluster);
        return ResultStat.OK.wrap(ciCluster);
    }

    @Override
    public HttpResponseTemp<?> updateCiCluster(CiCluster ciCluster) {
        checkAdmin();

        if (ciCluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "input kube cluster is null");
        }
        if (!StringUtils.isBlank(ciCluster.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, ciCluster.checkLegality());
        }

        globalBiz.updateCiCluster(ciCluster);
        return ResultStat.OK.wrap(ciCluster);
    }

    @Override
    public HttpResponseTemp<?> deleteCiCluster() {
        checkAdmin();

        globalBiz.deleteCiCluster();
        return ResultStat.OK.wrap(null);
    }
}
