package org.domeos.api.model.cluster;

import org.domeos.api.model.console.Cluster.Cluster;
import org.domeos.api.model.user.ResourceOwnerType;
import org.domeos.util.CommonUtil;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public class ClusterBasic {
    private int id;
    private String name;
    private String api;
    private String tag;
    private String ownerName;
    private ResourceOwnerType ownerType;
    private String domain;
    private String dns;
    private String etcd;
    int logConfig;
    private long createTime;

    public ClusterBasic() {
    }

    public ClusterBasic(Cluster cluster) {
        this.name = cluster.getName();
        this.api = cluster.getApi();
        this.tag = cluster.getTag();
        this.ownerName = cluster.getOwnerName();
        this.ownerType = cluster.getOwnerType();
        this.domain = cluster.getDomain();
        this.dns = cluster.getDns();
        this.etcd = cluster.getEtcd();
        this.logConfig = cluster.getLogConfig();
        this.createTime = cluster.getCreateTime();
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public ResourceOwnerType getOwnerType() {
        return ownerType;
    }

    public void setOwnerType(ResourceOwnerType ownerType) {
        this.ownerType = ownerType;
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

    public int getLogConfig() {
        return logConfig;
    }

    public void setLogConfig(int logConfig) {
        this.logConfig = logConfig;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public void update(Cluster cluster) {
        this.name = cluster.getName();
        this.api = CommonUtil.domainUrl(cluster.getApi());
        this.tag = cluster.getTag();
        this.ownerName = cluster.getOwnerName();
        this.ownerType = cluster.getOwnerType();
        this.domain = cluster.getDomain();
        this.dns = cluster.getDns();
        this.etcd = cluster.getEtcd();
        this.logConfig = cluster.getLogConfig();
    }
}
