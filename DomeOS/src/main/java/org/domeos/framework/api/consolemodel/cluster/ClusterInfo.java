package org.domeos.framework.api.consolemodel.cluster;

import org.apache.commons.lang3.StringUtils;
import org.domeos.framework.api.model.cluster.related.ClusterLog;
import org.domeos.util.CommonUtil;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public class ClusterInfo {

    private int id;
    private String name;
    private String api;
    private String tag;
    private String domain;
    private String dns;
    private String etcd;
    private String ownerName;
    private int logConfig;
    private long createTime;
    private ClusterLog clusterLog;

    public ClusterInfo() {
    }

    public ClusterInfo(int id, String name, String api, String tag, String domain, String dns, String etcd,
                       String ownerName, int logConfig, long createTime, ClusterLog clusterLog) {
        this.id = id;
        this.name = name;
        this.api = api;
        this.tag = tag;
        this.domain = domain;
        this.dns = dns;
        this.etcd = etcd;
        this.ownerName = ownerName;
        this.logConfig = logConfig;
        this.createTime = createTime;
        this.clusterLog = clusterLog;
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

    public ClusterLog getClusterLog() {
        return clusterLog;
    }

    public void setClusterLog(ClusterLog clusterLog) {
        this.clusterLog = clusterLog;
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
        api = CommonUtil.domainUrl(api);
        return null;
    }
}
