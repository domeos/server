package org.domeos.api.model.deployment;

import org.apache.commons.lang.StringUtils;

import java.util.Arrays;

/**
 */
public class LoadBalanceDBProto {
    int id;
    String name;
    int port; // service port
    int targetPort; // container port
    long deployId;
    String externalIPs;
    LoadBalanceType type; // tcp or http
    String clusterName;

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

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public int getTargetPort() {
        return targetPort;
    }

    public void setTargetPort(int targetPort) {
        this.targetPort = targetPort;
    }

    public long getDeployId() {
        return deployId;
    }

    public void setDeployId(long deployId) {
        this.deployId = deployId;
    }

    public String getExternalIPs() {
        return externalIPs;
    }

    public void setExternalIPs(String externalIPs) {
        this.externalIPs = externalIPs;
    }

    public LoadBalanceType getType() {
        return type;
    }

    public void setType(LoadBalanceType type) {
        this.type = type;
    }

    public String getClusterName() {
        return clusterName;
    }

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    public LoadBalanceDraft toLoadBalanceDraft() {
        LoadBalanceDraft draft = new LoadBalanceDraft();
        draft.setClusterName(clusterName);
        draft.setDeployId(deployId);
        draft.setId(id);
        draft.setPort(port);
        draft.setTargetPort(targetPort);
        draft.setType(type);
        draft.setName(name);
        if (externalIPs != null) {
            draft.setExternalIPs(Arrays.asList(externalIPs.split(",")));
        }
        return draft;
    }

    public static LoadBalanceDBProto fromLoadBalanceDraft(LoadBalanceDraft draft) {
        LoadBalanceDBProto proto = new LoadBalanceDBProto();
        proto.setClusterName(draft.getClusterName());
        proto.setDeployId(draft.getDeployId());
        proto.setId(draft.getId());
        proto.setPort(draft.getPort());
        proto.setTargetPort(draft.getTargetPort());
        proto.setName(draft.getName());
        proto.setType(draft.getType());
        proto.setExternalIPs(StringUtils.join(draft.getExternalIPs(), ','));
        return proto;
    }
}
