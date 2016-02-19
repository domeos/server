package org.domeos.api.service.global.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.global.Registry;
import org.domeos.api.service.global.GlobalService;
import org.domeos.api.service.global.RegistryService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2015/8/31.
 */

@Service("registryService")
public class RegistryServiceImpl implements RegistryService {

    @Autowired
    GlobalService globalService;

    @Override
    public HttpResponseTemp<?> getPrivateRegistry() {
        Registry registry = globalService.getRegistry();
        return ResultStat.OK.wrap(registry);
    }

    @Override
    public HttpResponseTemp<?> setPrivateRegistry(Registry registry) {
        if (!AuthUtil.isAdmin()) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        if (registry == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "param is null");
        }
        if (!StringUtils.isBlank(registry.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, registry.checkLegality());
        }

        globalService.deleteRegistry();
        globalService.setRegistry(registry);

        return ResultStat.OK.wrap(registry);
    }

    @Override
    public String getCertification() {
        return globalService.getCertification();
    }
}
