package org.domeos.framework.api.service.global.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.global.GitConfig;
import org.domeos.framework.api.model.global.GlobalInfo;
import org.domeos.framework.api.model.global.GlobalType;
import org.domeos.framework.api.service.global.GitConfigService;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.GlobalConstant;
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

    private int checkAdmin() {
        User user = GlobalConstant.userThreadLocal.get();
        if (user == null || !AuthUtil.isAdmin(user.getId())) {
            throw new PermitException();
        }
        return user.getId();
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
            return ResultStat.PARAM_ERROR.wrap(null, "git config info is null");
        }

        if (!StringUtils.isBlank(gitConfig.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, gitConfig.checkLegality());
        }

        GlobalInfo gitInfo = globalBiz.getGlobalInfoByType(gitConfig.getType());
        if (gitInfo != null) {
            return ResultStat.GIT_INFO_ALREADY_EXIST.wrap(null);
        }

        GlobalInfo globalInfo = new GlobalInfo(gitConfig.getType(), gitConfig.getUrl());
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
            return ResultStat.PARAM_ERROR.wrap(null, "no such code info");
        }
        if (!StringUtils.isBlank(gitConfig.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, gitConfig.checkLegality());
        }
        GlobalInfo globalInfo = new GlobalInfo(gitConfig.getId(), gitConfig.getType(), gitConfig.getUrl());
        globalBiz.updateGlobalInfoById(globalInfo);
        return ResultStat.OK.wrap(gitConfig);
    }
}
