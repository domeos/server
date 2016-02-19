package org.domeos.api.service.global.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.global.GitConfig;
import org.domeos.api.model.global.GlobalInfo;
import org.domeos.api.model.global.GlobalType;
import org.domeos.api.service.global.GitConfigService;
import org.domeos.api.service.global.GlobalService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by feiliu206363 on 2015/11/17.
 */

@Service("gitConfigService")
public class GitConfigServiceImpl implements GitConfigService{

    @Autowired
    GlobalService globalService;

    @Override
    public HttpResponseTemp<?> listGitConfigs() {
        GlobalInfo gitlab = globalService.getGlobalInfoByType(GlobalType.GITLAB);
        List<GitConfig> gitConfigs = new LinkedList<>();
        if (gitlab != null) {
            gitConfigs.add(new GitConfig(gitlab.getId(), gitlab.getType(), gitlab.getValue(), gitlab.getCreateTime(), gitlab.getLastUpdate()));
        }
        GlobalInfo github = globalService.getGlobalInfoByType(GlobalType.GITHUB);
        if (github != null) {
            gitConfigs.add(new GitConfig(github.getId(), github.getType(), github.getValue(), github.getCreateTime(), github.getLastUpdate()));
        }
        return ResultStat.OK.wrap(gitConfigs);
    }

    @Override
    public HttpResponseTemp<?> addGitConfg(GitConfig gitConfig) {
        if (!AuthUtil.isAdmin()) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        if (gitConfig == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "git config info is null");
        }

        if (!StringUtils.isBlank(gitConfig.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, gitConfig.checkLegality());
        }

        GlobalInfo gitInfo = globalService.getGlobalInfoByType(gitConfig.getType());
        if (gitInfo != null) {
            return ResultStat.GIT_INFO_ALREADY_EXIST.wrap(null);
        }

        GlobalInfo globalInfo = new GlobalInfo(gitConfig.getType(), gitConfig.getUrl());
        globalService.addGlobalInfo(globalInfo);
        gitConfig.setId(globalInfo.getId());

        return ResultStat.OK.wrap(gitConfig);
    }

    @Override
    public HttpResponseTemp<?> getGitConfigById(int id) {
        if (!AuthUtil.isAdmin()) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        GitConfig gitConfig = globalService.getGitConfigById(id);
        return ResultStat.OK.wrap(gitConfig);
    }

    @Override
    public HttpResponseTemp<?> deleteGitConfigById(int id) {
        if (!AuthUtil.isAdmin()) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        return ResultStat.OK.wrap(globalService.deleteGlobalInfoById(id));
    }

    @Override
    public HttpResponseTemp<?> modifyGitConfig(GitConfig gitConfig) {
        if (!AuthUtil.isAdmin()) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        if (gitConfig.getId() <= 0) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such code info");
        }
        if (!StringUtils.isBlank(gitConfig.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, gitConfig.checkLegality());
        }
        GlobalInfo globalInfo = new GlobalInfo(gitConfig.getId(), gitConfig.getType(), gitConfig.getUrl());
        globalService.updateGlobalInfoById(globalInfo);
        return ResultStat.OK.wrap(gitConfig);
    }
}
