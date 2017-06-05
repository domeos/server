package org.domeos.framework.api.consolemodel.cluster;

import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.cluster.related.ClusterLog;
import org.domeos.util.CommonUtil;
import org.domeos.util.StringUtils;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public class ClusterInfo {

    private int id;
    private String name;
    private String description;
    private String api;
    private String username;
    private String password;
    private String oauthToken;
    private String tag;
    private String domain;
    private String dns;
    private String etcd;
    private String ownerName;
    private int logConfig;
    private long createTime;
    private int buildConfig;
    private ClusterLog clusterLog;

    public ClusterInfo() {
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

    public String getDescription() {
        return description;
    }

    public ClusterInfo setDescription(String description) {
        this.description = description;
        return this;
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

    public int getBuildConfig() {
        return buildConfig;
    }

    public void setBuildConfig(int buildConfig) {
        this.buildConfig = buildConfig;
    }

    public ClusterLog getClusterLog() {
        return clusterLog;
    }

    public void setClusterLog(ClusterLog clusterLog) {
        this.clusterLog = clusterLog;
    }

    public static ClusterInfo fromCluster(Cluster cluster) {
        ClusterInfo clusterInfo = new ClusterInfo();
        clusterInfo.id = cluster.getId();
        clusterInfo.name = cluster.getName();
        clusterInfo.description = cluster.getDescription();
        clusterInfo.api = cluster.getApi();
        clusterInfo.username = cluster.getUsername();
        clusterInfo.password = cluster.getPassword();
        clusterInfo.oauthToken = cluster.getOauthToken();
        clusterInfo.tag = cluster.getTag();
        clusterInfo.domain = cluster.getDomain();
        clusterInfo.dns = cluster.getDns();
        clusterInfo.etcd = cluster.getEtcd();
        clusterInfo.ownerName = cluster.getOwnerName();
        clusterInfo.logConfig = cluster.getLogConfig();
        clusterInfo.createTime = cluster.getCreateTime();
        clusterInfo.clusterLog = cluster.getClusterLog();
        return clusterInfo;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(name)) {
            return "cluster name must be set";
        }
        if (StringUtils.isBlank(api)) {
            return "cluster api server must be set";
        }
        if (StringUtils.isBlank(ownerName)) {
            return "owner name must be set";
        }

        if (StringUtils.isBlank(etcd)) {
            return "etcd must be set";
        }
        if (logConfig == 0 && clusterLog != null) {
            return "cluster log cannot be set";
        }
        if (logConfig > 0 && clusterLog == null) {
            return "cluster log must be set";
        }
        if (clusterLog != null) {
            return clusterLog.checkLegality();
        }
        domain = CommonUtil.domainUrl(domain);
        // api = CommonUtil.domainUrl(api);
        return null;
    }
}
