package org.domeos.framework.api.model.cluster;

import org.domeos.framework.api.consolemodel.cluster.ClusterInfo;
import org.domeos.framework.api.model.cluster.related.ClusterLog;
import org.domeos.framework.engine.model.RowModelBase;
import org.domeos.util.MD5Util;
import org.domeos.util.StringUtils;

/**
 * Created by baokangwang on 2016/4/6.
 */
public class Cluster extends RowModelBase {

    private String api;
    private String username;
    private String password;
    private String oauthToken;
    private String tag;
    private String domain;
    private String dns;
    private String etcd;
    private String ownerName;
    private int ownerId;
    private int logConfig;
    private ClusterLog clusterLog;

    public Cluster() {
    }

    public Cluster(ClusterInfo clusterInfo) {
        this.setName(clusterInfo.getName());
        this.setDescription(clusterInfo.getDescription());
        this.setState("active");
        this.setUsername(clusterInfo.getUsername());
        this.setPassword(clusterInfo.getPassword());
        this.setOauthToken(clusterInfo.getOauthToken());
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getOauthToken() {
        return oauthToken;
    }

    public void setOauthToken(String oauthToken) {
        this.oauthToken = oauthToken;
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
        this.api = clusterInfo.getApi();
        this.tag = clusterInfo.getTag();
        this.domain = clusterInfo.getDomain();
        this.dns = clusterInfo.getDns();
        this.etcd = clusterInfo.getEtcd();
        this.logConfig = clusterInfo.getLogConfig();
        this.clusterLog = clusterInfo.getClusterLog();
        this.ownerName = clusterInfo.getOwnerName();
        this.username = clusterInfo.getUsername();
        this.password = clusterInfo.getPassword();
    }

    public boolean equalWith(Cluster cluster) {
        if (cluster == null) {
            return false;
        }
        if (!StringUtils.equals(api, cluster.getApi())) {
            return false;
        }
        if (!StringUtils.equals(username, cluster.getUsername())) {
            return false;
        }
        if (!StringUtils.equals(password, cluster.getPassword())) {
            return false;
        }
        if (!StringUtils.equals(oauthToken, cluster.getOauthToken())) {
            return false;
        }
        if (!StringUtils.equals(tag, cluster.getTag())) {
            return false;
        }
        if (!StringUtils.equals(domain, cluster.getDomain())) {
            return false;
        }
        if (!StringUtils.equals(dns, cluster.getDns())) {
            return false;
        }
        if (!StringUtils.equals(etcd, cluster.getEtcd())) {
            return false;
        }
        if (!StringUtils.equals(ownerName, cluster.getOwnerName())) {
            return false;
        }
        if (ownerId != cluster.getOwnerId()) {
            return false;
        }
        return true;
    }

    public String md5Key(String namespace) {
        String key = api + username + password + oauthToken + getId() + namespace;
        return MD5Util.getMD5InHex(key);
    }
}
