package org.domeos.framework.api.model.cluster;

import org.domeos.framework.api.consolemodel.cluster.ClusterInfo;
import org.domeos.framework.api.model.cluster.related.ClusterLog;
import org.domeos.framework.api.model.resource.related.ResourceOwnerType;
import org.domeos.framework.engine.model.RowModelBase;
import org.domeos.util.CommonUtil;

/**
 * Created by baokangwang on 2016/4/6.
 */
public class Cluster extends RowModelBase {

    private String api;
    private String tag;
    private String domain;
    private String dns;
    private String etcd;
    private String ownerName;
    private int ownerId;
    private ResourceOwnerType ownerType;
    private int logConfig;
    private ClusterLog clusterLog;

    public Cluster() {
    }

    public Cluster(String api, String tag, String domain, String dns, String etcd, String ownerName, int logConfig, ClusterLog clusterLog) {
        this.api = api;
        this.tag = tag;
        this.domain = domain;
        this.dns = dns;
        this.etcd = etcd;
        this.ownerName = ownerName;
        this.logConfig = logConfig;
        this.clusterLog = clusterLog;
    }

    public Cluster(ClusterInfo clusterInfo) {
        this.setName(clusterInfo.getName());
        this.setState("active");
        this.setCreateTime(clusterInfo.getCreateTime());
        this.setApi(clusterInfo.getApi());
        this.setTag(clusterInfo.getTag());
        this.setDomain(clusterInfo.getDomain());
        this.setDns(clusterInfo.getDns());
        this.setEtcd(clusterInfo.getEtcd());
        this.setOwnerName(clusterInfo.getOwnerName());
        this.setLogConfig(clusterInfo.getLogConfig());
        this.setClusterLog(clusterInfo.getClusterLog());
    }

    public String getApi() {
        return api;
    }

    public void setApi(String api) {
        this.api = api;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getDns() {
        return dns;
    }

    public void setDns(String dns) {
        this.dns = dns;
    }

    public String getEtcd() {
        return etcd;
    }

    public void setEtcd(String etcd) {
        this.etcd = etcd;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public int getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(int ownerId) {
        this.ownerId = ownerId;
    }

    public ResourceOwnerType getOwnerType() {
        return ownerType;
    }

    public void setOwnerType(ResourceOwnerType ownerType) {
        this.ownerType = ownerType;
    }

    public int getLogConfig() {
        return logConfig;
    }

    public void setLogConfig(int logConfig) {
        this.logConfig = logConfig;
    }

    public ClusterLog getClusterLog() {
        return clusterLog;
    }

    public void setClusterLog(ClusterLog clusterLog) {
        this.clusterLog = clusterLog;
    }

    public void update(ClusterInfo clusterInfo) {
        this.setName(clusterInfo.getName());
        this.api = CommonUtil.domainUrl(clusterInfo.getApi());
        this.tag = clusterInfo.getTag();
        this.domain = clusterInfo.getDomain();
        this.dns = clusterInfo.getDns();
        this.etcd = clusterInfo.getEtcd();
        this.logConfig = clusterInfo.getLogConfig();
        this.clusterLog = clusterInfo.getClusterLog();
        this.ownerName = clusterInfo.getOwnerName();
    }

}
