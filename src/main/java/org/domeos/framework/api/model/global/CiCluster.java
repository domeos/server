package org.domeos.framework.api.model.global;

import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.util.CommonUtil;
import org.domeos.util.StringUtils;

/**
 * Created by feiliu206363 on 2015/12/4.
 */

public class CiCluster {

    private int id;
    private String namespace;
    private String host;
    private int clusterId;
    private String clusterName;
    private long createTime;
    private long lastUpdate;
    //add
    private String username;
    private String password;
    private String oauthToken;

    public CiCluster() {
    }

    public CiCluster(int id, String namespace, String host, int clusterId, String clusterName, long createTime, long lastUpdate) {
        this.id = id;
        this.namespace = namespace;
        this.host = host;
        this.clusterId = clusterId;
        this.clusterName = clusterName;
        this.createTime = createTime;
        this.lastUpdate = lastUpdate;
    }

    public CiCluster(int id, String namespace, String host, int clusterId, String clusterName, long createTime, long lastUpdate,
                     String username, String password, String oauthToken) {
        this.id = id;
        this.namespace = namespace;
        this.host = host;
        this.clusterId = clusterId;
        this.clusterName = clusterName;
        this.createTime = createTime;
        this.lastUpdate = lastUpdate;
        this.username = username;
        this.password = password;
        this.oauthToken = oauthToken;
    }


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public int getClusterId() {
        return clusterId;
    }

    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
    }

    public String getClusterName() {
        return clusterName;
    }

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public long getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(long lastUpdate) {
        this.lastUpdate = lastUpdate;
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

    public String checkLegality() {

        if (StringUtils.isBlank(namespace)) {
            return "namespace is null";
        } else if (StringUtils.isBlank(host)) {
            return "host is null";
        } else if (StringUtils.isBlank(clusterName)) {
            return "cluster name is null";
        }
        // for k8s, we don't need http or https
        host = CommonUtil.domainUrl(host);
        return null;
    }

    public Cluster buildCluster() {
        Cluster cluster = new Cluster();
        cluster.setApi(host);
        cluster.setUsername(username);
        cluster.setPassword(password);
        cluster.setOauthToken(oauthToken);
        return cluster;
    }
}
