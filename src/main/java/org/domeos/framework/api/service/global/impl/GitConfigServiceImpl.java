package org.domeos.framework.api.service.global.impl;

import org.domeos.util.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.global.GitConfig;
import org.domeos.framework.api.model.global.GlobalInfo;
import org.domeos.framework.api.model.global.GlobalType;
import org.domeos.framework.api.model.global.UserGitConfig;
import org.domeos.framework.api.model.project.GitlabUser;
import org.domeos.framework.api.service.global.GitConfigService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.coderepo.GitlabInfo;
import org.domeos.global.CurrentThreadInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

/**
 * Created by feiliu206363 on 2015/11/17.
 */

@Service
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
        return ResultStat.OK.wrap(fetchAllGitConfigs());
    }

    private List<GitConfig> fetchAllGitConfigs() {
        List<GlobalInfo> gitlabs = globalBiz.listGlobalInfoByType(GlobalType.GITLAB);
        List<GitConfig> gitConfigs = new LinkedList<>();
        if (gitlabs != null) {
            for (GlobalInfo gitlab : gitlabs) {
                gitConfigs.add(new GitConfig(gitlab.getId(), gitlab.getType(), gitlab.getValue(),
                        gitlab.getCreateTime(), gitlab.getLastUpdate(), gitlab.getDescription()));
            }
        }
        List<GlobalInfo> githubs = globalBiz.listGlobalInfoByType(GlobalType.GITHUB);
        if (githubs != null) {
            for (GlobalInfo github : githubs) {
                gitConfigs.add(new GitConfig(github.getId(), github.getType(), github.getValue(),
                        github.getCreateTime(), github.getLastUpdate(), github.getDescription()));
            }
        }

        return gitConfigs;
    }

    @Override
    public HttpResponseTemp<?> listUserGitConfigs() {
        List<GitConfig> gitConfigs = fetchAllGitConfigs();
        if (gitConfigs == null || gitConfigs.isEmpty()) {
            return ResultStat.OK.wrap(new UserGitConfig(gitConfigs, -1));
        }
        int userId = CurrentThreadInfo.getUserId();
        List<org.domeos.framework.api.model.project.GitlabUser> gitlabs = GitlabInfo.getGitlabsByUserId(userId);
        Set<Integer> gitlabIds = new HashSet<>();
        if (gitlabs != null && !gitlabs.isEmpty()) {
            for (GitlabUser user : gitlabs) {
                gitlabIds.add(user.getGitlabId());
            }
        }
        int defaultGitlabId = gitConfigs.get(0).getId();
        for (GitConfig gitConfig : gitConfigs) {
            if (gitlabIds.contains(gitConfig.getId())) {
                defaultGitlabId = gitConfig.getId();
                break;
            }
        }

        return ResultStat.OK.wrap(new UserGitConfig(gitConfigs, defaultGitlabId));
    }

    @Override
    public HttpResponseTemp<?> addGitConfig(GitConfig gitConfig) {
        checkAdmin();
        if (gitConfig == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "git config info is null");
        }

        if (!StringUtils.isBlank(gitConfig.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, gitConfig.checkLegality());
        }

        if (checkGitInfoExist(gitConfig)) {
            throw ApiException.wrapResultStat(ResultStat.GIT_INFO_ALREADY_EXIST);
        }

        GlobalInfo globalInfo = new GlobalInfo(gitConfig.getType(), gitConfig.getUrl(), gitConfig.getDescription());
        globalBiz.addGlobalInfo(globalInfo);
        gitConfig.setId(globalInfo.getId());

        return ResultStat.OK.wrap(gitConfig);
    }

    private boolean checkGitInfoExist(GitConfig gitConfig) {
        List<GlobalInfo> gitInfos = globalBiz.listGlobalInfoByType(gitConfig.getType());
        if (gitInfos == null) {
            return false;
        }

        for (GlobalInfo gitInfo : gitInfos) {
            if (gitConfig.getUrl().equalsIgnoreCase(gitInfo.getValue())
                    || gitConfig.getDescription().equalsIgnoreCase(gitInfo.getDescription())) {
                return true;
            }
        }

        return false;
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
        GlobalInfo globalInfo = new GlobalInfo(gitConfig.getId(), gitConfig.getType(), gitConfig.getUrl(), gitConfig.getDescription());
        globalBiz.updateGlobalInfoById(globalInfo);
        return ResultStat.OK.wrap(gitConfig);
    }
}
