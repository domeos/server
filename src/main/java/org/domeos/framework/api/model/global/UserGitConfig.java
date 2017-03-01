package org.domeos.framework.api.model.global;

import java.util.List;

/**
 * Created by yuanfeizhou on 2017/1/12.
 */
public class UserGitConfig {
    private List<GitConfig> gitConfigList;
    private int defaultGitlab;

    public UserGitConfig() {
    }

    public UserGitConfig(List<GitConfig> gitConfigs, int defaultGitlab) {
        this.gitConfigList = gitConfigs;
        this.defaultGitlab = defaultGitlab;
    }

    public List<GitConfig> getGitConfigList() {
        return gitConfigList;
    }

    public void setGitConfigList(List<GitConfig> gitConfigList) {
        this.gitConfigList = gitConfigList;
    }

    public int getDefaultGitlab() {
        return defaultGitlab;
    }

    public void setDefaultGitlab(int defaultGitlab) {
        this.defaultGitlab = defaultGitlab;
    }
}
