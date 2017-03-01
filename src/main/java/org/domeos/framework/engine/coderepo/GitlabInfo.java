package org.domeos.framework.engine.coderepo;

import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.model.global.GlobalInfo;
import org.domeos.framework.api.model.global.GlobalType;
import org.domeos.framework.api.model.project.GitlabUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/10.
 */
@Component
public class GitlabInfo {
    static ProjectBiz projectBiz;
    static GlobalBiz globalBiz;

    @Autowired
    public void setProjectBiz(ProjectBiz projectBiz) {
        GitlabInfo.projectBiz = projectBiz;
    }

    @Autowired
    public void setGlobalService(GlobalBiz globalBiz) {
        GitlabInfo.globalBiz = globalBiz;
    }

    public static String getGitlabUrl() {
        List<GlobalInfo> gitConfigs = globalBiz.listGlobalInfoByType(GlobalType.GITLAB);
        if (gitConfigs != null && !gitConfigs.isEmpty()) {
            return gitConfigs.get(0).getValue();
        } else {
            return null;
        }
    }

    public static String getGitlabUrl(int gitlabId) {
        GlobalInfo gitConfig = globalBiz.getGlobalInfoByTypeAndId(GlobalType.GITLAB, gitlabId);
        if (gitConfig != null) {
            return gitConfig.getValue();
        } else {
            return null;
        }
    }

    public static String getGitlabUrlByGitLabUserId(int gitlabUserId) {
        GitlabUser gitlab = projectBiz.getGitlabUserById(gitlabUserId);
        if (gitlab == null) {
            return null;
        }

        return getGitlabUrl(gitlab.getGitlabId());
    }

    public static String getGitlabToken(int id) {
        GitlabUser gitlab = projectBiz.getGitlabUserById(id);
        if (gitlab != null) {
            return gitlab.getToken();
        } else {
            return null;
        }
    }

    public static List<GitlabUser> getGitlabsByUserId(int userId) {
        return projectBiz.getGitlabInfoByUserId(userId);
    }

    public static List<GitlabUser> getGitlabsByUserIdAndGitlabId(int userId, int gitlabId) {
        return projectBiz.getGitlabInfoByUserIdAndGitlabId(userId, gitlabId);
    }

//    public static RSAKeyPair getRSAKeyPairByDeployId(int deployId) {
//        return projectBiz.getRSAKeyPairByKeyId(deployId);
//    }

//    public static int updateExtraDeployId(RSAKeyPair keyPair, int oldDeployId) {
//        return projectBiz.updateExtraRSAKeyPair(keyPair, oldDeployId);
//    }
}
