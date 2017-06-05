package org.domeos.framework.api.service.global.impl;

import org.domeos.util.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.global.Registry;
import org.domeos.framework.api.service.global.RegistryService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.CurrentThreadInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2015/8/31.
 */

@Service
public class RegistryServiceImpl implements RegistryService {

    @Autowired
    GlobalBiz globalBiz;

    private void checkAdmin() {
        if (!AuthUtil.isAdmin(CurrentThreadInfo.getUserId())) {
            throw new PermitException("only admin can operate private registry");
        }
    }

    @Override
    public HttpResponseTemp<?> getPrivateRegistry() {
        Registry registry = globalBiz.getRegistry();
        return ResultStat.OK.wrap(registry);
    }

    @Override
    public HttpResponseTemp<?> setPrivateRegistry(Registry registry) {
        checkAdmin();
        if (registry == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "param is null");
        }
        if (!StringUtils.isBlank(registry.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, registry.checkLegality());
        }

        globalBiz.deleteRegistry();
        globalBiz.setRegistry(registry);

        return ResultStat.OK.wrap(registry);
    }

    @Override
    public String getCertification() {
        return globalBiz.getCertification();
    }
}
