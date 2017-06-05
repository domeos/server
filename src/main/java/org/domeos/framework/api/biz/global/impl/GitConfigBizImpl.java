package org.domeos.framework.api.biz.global.impl;

import org.domeos.framework.api.biz.global.GitConfigBiz;
import org.domeos.framework.api.mapper.domeos.global.GitConfigMapper;
import org.domeos.framework.api.model.global.GitConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by junwuguo on 2017/4/1 0001.
 */
@Service("gitConfigBiz")
public class GitConfigBizImpl implements GitConfigBiz {

    @Autowired
    GitConfigMapper gitConfigMapper;

    @Override
    public List<GitConfig> listAllGitConfigs() {
        return gitConfigMapper.listAllGitConfigs();
    }

    @Override
    public GitConfig getGitConfigById(int id) {
        return gitConfigMapper.getGitConfigById(id);
    }

    @Override
    public int addGitConfig(GitConfig gitConfig) {
        long currentTimeMillis = System.currentTimeMillis();
        gitConfig.setCreateTime(currentTimeMillis);
        gitConfig.setLastUpdate(currentTimeMillis);
        return gitConfigMapper.addGitConfig(gitConfig);
    }

    @Override
    public int updateGitConfigById(GitConfig gitConfig) {
        gitConfig.setLastUpdate(System.currentTimeMillis());
        return gitConfigMapper.updateGitConfig(gitConfig);
    }

    @Override
    public int deleteGitConfigById(int id) {
        GitConfig gitConfig = gitConfigMapper.getGitConfigById(id);
        long currentTimeMillis = System.currentTimeMillis();
        gitConfig.setRemoved(true);
        gitConfig.setRemoveTime(currentTimeMillis);
        gitConfig.setLastUpdate(currentTimeMillis);
        return gitConfigMapper.updateGitConfig(gitConfig);
    }


}
