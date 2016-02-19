package org.domeos.util.code;

import org.domeos.api.mapper.ci.RSAKeyPairMapper;
import org.domeos.api.mapper.project.GitlabMapper;
import org.domeos.api.model.ci.RSAKeyPair;
import org.domeos.api.model.git.Gitlab;
import org.domeos.api.model.global.GlobalInfo;
import org.domeos.api.model.global.GlobalType;
import org.domeos.api.service.global.GlobalService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/10.
 */
public class GitlabInfo {
    static GitlabMapper gitlabMapper;
    static RSAKeyPairMapper rsaKeyPairMapper;
    static GlobalService globalService;

    @Autowired
    public void setGitlabMapper(GitlabMapper gitlabMapper) {
        GitlabInfo.gitlabMapper = gitlabMapper;
    }

    @Autowired
    public void setRsaKeyPairMapper(RSAKeyPairMapper rsaKeyPairMapper) {
        GitlabInfo.rsaKeyPairMapper = rsaKeyPairMapper;
    }

    @Autowired
    public void setGlobalService(GlobalService globalService) {
        GitlabInfo.globalService = globalService;
    }

    public static String getGitlabUrl() {
        GlobalInfo gitConfig = globalService.getGlobalInfoByType(GlobalType.GITLAB);
        if (gitConfig != null) {
            return gitConfig.getValue();
        } else {
            return null;
        }
    }

    public static String getGitlabToken(int id) {
        Gitlab gitlab = gitlabMapper.getGitlabInfoById(id);
        if (gitlab != null) {
            return gitlab.getToken();
        } else {
            return null;
        }
    }

    public static List<Gitlab> getGitlabsByUserId(int userId) {
        return gitlabMapper.getGitlabInfoByUserId(userId);
    }

    public static RSAKeyPair getRSAKeyPairByDeployId(int deployId) {
        return rsaKeyPairMapper.getRSAKeyPairByKeyId(deployId);
    }

    public static int updateExtraDeployId(RSAKeyPair keyPair, int oldDeployId) {
        return rsaKeyPairMapper.updateExtraRSAKeyPair(keyPair, oldDeployId);
    }
}
