package org.domeos.framework.api.biz.global;

import org.domeos.framework.api.model.global.GitConfig;

import java.util.List;

/**
 * Created by junwuguo on 2017/4/1 0001.
 */
public interface GitConfigBiz {

    List<GitConfig> listAllGitConfigs();

    GitConfig getGitConfigById(int id);

    int addGitConfig(GitConfig gitConfig);

    int updateGitConfigById(GitConfig gitConfig);

    int deleteGitConfigById(int id);
}
