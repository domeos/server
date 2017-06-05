package org.domeos.framework.api.consolemodel.project;

import org.domeos.framework.api.model.ci.BuildHistory;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/12/20.
 */
public class BuildHistoryListInfo {
    private int total;
    private List<BuildHistory> buildHistories;
    private String registryUrl;
    private boolean authRegistryEnabled;

    public int getTotal() {
        return total;
    }

    public BuildHistoryListInfo setTotal(int total) {
        this.total = total;
        return this;
    }

    public List<BuildHistory> getBuildHistories() {
        return buildHistories;
    }

    public BuildHistoryListInfo setBuildHistories(List<BuildHistory> buildHistories) {
        this.buildHistories = buildHistories;
        return this;
    }

    public String getRegistryUrl() {
        return registryUrl;
    }

    public void setRegistryUrl(String registryUrl) {
        this.registryUrl = registryUrl;
    }

    public boolean isAuthRegistryEnabled() {
        return authRegistryEnabled;
    }

    public void setAuthRegistryEnabled(boolean authRegistryEnabled) {
        this.authRegistryEnabled = authRegistryEnabled;
    }
}