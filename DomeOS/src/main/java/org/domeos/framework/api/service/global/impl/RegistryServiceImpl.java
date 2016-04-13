package org.domeos.framework.api.service.global.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.global.Registry;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.service.global.RegistryService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2015/8/31.
 */

@Service("registryService")
public class RegistryServiceImpl implements RegistryService {

    @Autowired
    GlobalBiz globalBiz;

    private int checkAdmin() {
        User user = GlobalConstant.userThreadLocal.get();
        if (user == null || !AuthUtil.isAdmin(user.getId())) {
            throw new PermitException();
        }
        return user.getId();
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
            return ResultStat.PARAM_ERROR.wrap(null, "param is null");
        }
        if (!StringUtils.isBlank(registry.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, registry.checkLegality());
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
