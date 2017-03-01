package org.domeos.framework.api.service.global.impl;

import org.domeos.util.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.global.Server;
import org.domeos.framework.api.service.global.ServerService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.CurrentThreadInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2015/11/16.
 */

@Service
public class ServerServiceImpl implements ServerService {

    @Autowired
    GlobalBiz globalBiz;

    private void checkAdmin() {
        if (!AuthUtil.isAdmin(CurrentThreadInfo.getUserId())) {
            throw new PermitException("only admin can operate server configuration");
        }
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
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "server info is null");
        }
        if (!StringUtils.isBlank(server.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, server.checkLegality());
        }

        Server tmp = globalBiz.getServer();
        if (tmp != null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "server info already exist");
        }

        globalBiz.deleteServer();
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
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, server.checkLegality());
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
