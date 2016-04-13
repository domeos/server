package org.domeos.framework.api.service.global.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.global.Server;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.service.global.ServerService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2015/11/16.
 */

@Service("serverService")

public class ServerServiceImpl implements ServerService {

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
    public HttpResponseTemp<?> getServer() {
        Server server = globalBiz.getServer();
        return ResultStat.OK.wrap(server);
    }

    @Override
    public HttpResponseTemp<?> setServer(Server server) {
        checkAdmin();
        if (server == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "server info is null");
        }
        if (!StringUtils.isBlank(server.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, server.checkLegality());
        }

        Server tmp = globalBiz.getServer();
        if (tmp != null) {
            return ResultStat.PARAM_ERROR.wrap(null, "server info already exist");
        }

        globalBiz.setServer(server);
        return ResultStat.OK.wrap(server);
    }

    @Override
    public HttpResponseTemp<?> updateServer(Server server) {
        checkAdmin();
        if (server == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "server is null");
        }
        if (!StringUtils.isBlank(server.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, server.checkLegality());
        }

        globalBiz.updateServer(server);
        return ResultStat.OK.wrap(server);
    }

    @Override
    public HttpResponseTemp<?> deleteServer() {
        checkAdmin();
        globalBiz.deleteServer();
        return ResultStat.OK.wrap(null);
    }

}
