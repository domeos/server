package org.domeos.framework.api.service.global.impl;

import org.domeos.framework.api.biz.global.GitConfigBiz;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.project.related.CodeManager;
import org.domeos.util.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.global.GitConfig;
import org.domeos.framework.api.model.global.UserGitConfig;
import org.domeos.framework.api.model.project.GitlabUser;
import org.domeos.framework.api.service.global.GitConfigService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.coderepo.GitlabInfo;
import org.domeos.global.CurrentThreadInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Created by feiliu206363 on 2015/11/17.
 */

@Service
public class GitConfigServiceImpl implements GitConfigService {

    @Autowired
    GitConfigBiz gitConfigBiz;

    @Autowired
    ProjectBiz projectBiz;

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
        return gitConfigBiz.listAllGitConfigs();
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

        if (checkGitConfigExist(gitConfig)) {
            throw ApiException.wrapResultStat(ResultStat.GIT_INFO_ALREADY_EXIST);
        }

        gitConfigBiz.addGitConfig(gitConfig);
        return ResultStat.OK.wrap(gitConfig);
    }

    private boolean checkGitConfigExist(GitConfig gitConfig) {
        List<GitConfig> gitConfigList = gitConfigBiz.listAllGitConfigs();
        if (gitConfigList == null || gitConfigList.isEmpty()) {
            return false;
        }
        for (GitConfig tmp : gitConfigList) {
            if (gitConfig.getId() != tmp.getId()
                    && (gitConfig.getUrl().equalsIgnoreCase(tmp.getUrl())
                    || gitConfig.getDescription().equalsIgnoreCase(tmp.getDescription()))) {
                return true;
            }
        }
        return false;
    }

    @Override
    public HttpResponseTemp<?> getGitConfigById(int id) {
        checkAdmin();
        GitConfig gitConfig = gitConfigBiz.getGitConfigById(id);
        return ResultStat.OK.wrap(gitConfig);
    }

    @Override
    public HttpResponseTemp<?> deleteGitConfigById(int id) {
        checkAdmin();
        return ResultStat.OK.wrap(gitConfigBiz.deleteGitConfigById(id));
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
        if (checkGitConfigExist(gitConfig)) {
            throw ApiException.wrapResultStat(ResultStat.GIT_INFO_ALREADY_EXIST);
        }
        gitConfigBiz.updateGitConfigById(gitConfig);
        return ResultStat.OK.wrap(gitConfig);
    }

    @Override
    public HttpResponseTemp<?> getGitlabUsage(int gitlabId) {
        checkAdmin();
        List<GitlabUser> gitlabUserList = projectBiz.getGitlabUserByGitlabId(gitlabId);
        List<Integer> gitlabUserIdList = new ArrayList<>(gitlabUserList.size());
        for (GitlabUser gitlabUser : gitlabUserList) {
            gitlabUserIdList.add(gitlabUser.getId());
        }
        List<Project> projectList = projectBiz.listAllProjects();
        if (projectList == null || projectList.isEmpty()) {
            return ResultStat.OK.wrap(null);
        }
        List<Project> result = new ArrayList<>(projectList.size());
        for (Project project : projectList) {
            if (project.getCodeInfo() != null
                    && project.getCodeInfo().getCodeManager() == CodeManager.gitlab
                    && gitlabUserIdList.contains(project.getCodeInfo().getCodeManagerUserId())) {
                result.add(project);
            }
        }
        return ResultStat.OK.wrap(result);
    }
}
