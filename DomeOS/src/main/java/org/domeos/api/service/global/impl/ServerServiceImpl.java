package org.domeos.api.service.global.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.global.Server;
import org.domeos.api.service.global.GlobalService;
import org.domeos.api.service.global.ServerService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2015/11/16.
 */

@Service("serverService")

public class ServerServiceImpl implements ServerService {

    @Autowired
    GlobalService globalService;

    @Override
    public HttpResponseTemp<?> getServer() {
        Server server = globalService.getServer();
        return ResultStat.OK.wrap(server);
    }

    @Override
    public HttpResponseTemp<?> setServer(Server server) {
        if (!AuthUtil.isAdmin()) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        if (server == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "server info is null");
        }
        if (!StringUtils.isBlank(server.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, server.checkLegality());
        }

        Server tmp = globalService.getServer();
        if (tmp != null) {
            return ResultStat.PARAM_ERROR.wrap(null, "server info already exist");
        }

        globalService.setServer(server);
        return ResultStat.OK.wrap(server);
    }

    @Override
    public HttpResponseTemp<?> updateServer(Server server) {
        if (!AuthUtil.isAdmin()) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        if (server == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "server is null");
        }
        if (!StringUtils.isBlank(server.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, server.checkLegality());
        }

        globalService.updateServer(server);
        return ResultStat.OK.wrap(server);
    }

    @Override
    public HttpResponseTemp<?> deleteServer() {
        if (!AuthUtil.isAdmin()) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }

        globalService.deleteServer();
        return ResultStat.OK.wrap(null);
    }

}
