package org.domeos.framework.api.consolemodel.cluster;

import org.domeos.framework.api.consolemodel.CreatorDraft;

/**
 * Created by baokangwang on 2016/4/6.
 */
public class ClusterCreate {

    private ClusterInfo clusterInfo;
    private CreatorDraft creatorDraft;

    public ClusterCreate() {
    }

    public ClusterCreate(ClusterInfo clusterInfo, CreatorDraft creatorDraft) {
        this.clusterInfo = clusterInfo;
        this.creatorDraft = creatorDraft;
    }

    public ClusterInfo getClusterInfo() {
        return clusterInfo;
    }

    public void setClusterInfo(ClusterInfo clusterInfo) {
        this.clusterInfo = clusterInfo;
    }

    public CreatorDraft getCreatorDraft() {
        return creatorDraft;
    }

    public void setCreatorDraft(CreatorDraft creatorDraft) {
        this.creatorDraft = creatorDraft;
    }

}
