package org.domeos.framework.api.service.global.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.global.GitConfig;
import org.domeos.framework.api.model.global.GlobalInfo;
import org.domeos.framework.api.model.global.GlobalType;
import org.domeos.framework.api.service.global.GitConfigService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.CurrentThreadInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by feiliu206363 on 2015/11/17.
 */

@Service("gitConfigService")
public class GitConfigServiceImpl implements GitConfigService {

    @Autowired
    GlobalBiz globalBiz;

    private void checkAdmin() {
        if (!AuthUtil.isAdmin(CurrentThreadInfo.getUserId())) {
            throw new PermitException("only admin can operate git configuration");
        }
    }

    @Override
    public HttpResponseTemp<?> listGitConfigs() {
        GlobalInfo gitlab = globalBiz.getGlobalInfoByType(GlobalType.GITLAB);
        List<GitConfig> gitConfigs = new LinkedList<>();
        if (gitlab != null) {
            gitConfigs.add(new GitConfig(gitlab.getId(), gitlab.getType(), gitlab.getValue(), gitlab.getCreateTime(), gitlab.getLastUpdate()));
        }
        GlobalInfo github = globalBiz.getGlobalInfoByType(GlobalType.GITHUB);
        if (github != null) {
            gitConfigs.add(new GitConfig(github.getId(), github.getType(), github.getValue(), github.getCreateTime(), github.getLastUpdate()));
        }
        return ResultStat.OK.wrap(gitConfigs);
    }

    @Override
    public HttpResponseTemp<?> addGitConfg(GitConfig gitConfig) {
        checkAdmin();
        if (gitConfig == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "git config info is null");
        }

        if (!StringUtils.isBlank(gitConfig.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, gitConfig.checkLegality());
        }

        GlobalInfo gitInfo = globalBiz.getGlobalInfoByType(gitConfig.getType());
        if (gitInfo != null) {
            throw ApiException.wrapResultStat(ResultStat.GIT_INFO_ALREADY_EXIST);
        }

        GlobalInfo globalInfo = new GlobalInfo(gitConfig.getType(), gitConfig.getUrl());
        globalBiz.deleteGlobalInfoByType(gitConfig.getType());
        globalBiz.addGlobalInfo(globalInfo);
        gitConfig.setId(globalInfo.getId());

        return ResultStat.OK.wrap(gitConfig);
    }

    @Override
    public HttpResponseTemp<?> getGitConfigById(int id) {
        checkAdmin();
        GitConfig gitConfig = globalBiz.getGitConfigById(id);
        return ResultStat.OK.wrap(gitConfig);
    }

    @Override
    public HttpResponseTemp<?> deleteGitConfigById(int id) {
        checkAdmin();
        return ResultStat.OK.wrap(globalBiz.deleteGlobalInfoById(id));
    }

    @Override
    public HttpResponseTemp<?> modifyGitConfig(GitConfig gitConfig) {
        checkAdmin();
        if (gitConfig.getId() <= 0) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such code info");
        }
        if (!StringUtils.isBlank(gitConfig.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, gitConfig.checkLegality());
        }
        GlobalInfo globalInfo = new GlobalInfo(gitConfig.getId(), gitConfig.getType(), gitConfig.getUrl());
        globalBiz.updateGlobalInfoById(globalInfo);
        return ResultStat.OK.wrap(gitConfig);
    }
}
