package org.domeos.framework.api.model.LoadBalancer;

import org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceType;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalancerPort;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.engine.exception.DaoConvertingException;
import org.domeos.framework.engine.model.RowModelBase;
import sun.net.util.IPAddressUtil;

import java.util.*;

/**
 * Created by xupeng on 16-4-5.
 */
public class LoadBalancer extends RowModelBase {
    @Override
    public int VERSION_NOW() {
        return 2;
    }

    @Override
    public LoadBalancer fromString(String str, int ver) throws DaoConvertingException {
        if (str == null || str.length() == 0) {
            return null;
        }
        try {
            if (ver == VERSION_NOW()) {
                return fromString(str);
            } else if (ver == 1) {
                String fqcn = "org.domeos.framework.api.model.LoadBalancer.LoadBalancerV1";
                Class clazz = Class.forName(fqcn);
                LoadBalancerV1 loadBalancerV1 = (LoadBalancerV1)objectMapper.readValue(str, clazz);
                return fromLoadBalancerV1(loadBalancerV1);
            } else {
                return null;
            }
        } catch (Exception e) {
            throw new DaoConvertingException("Parse Data from JSON failed, str = " + str + e.getMessage(), e);
        }
    }

    @Override
    public Set<String> excludeForJSON() {
        return toExclude;
    }

    public static Set<String> toExclude = new HashSet<String>() {{
        addAll(RowModelBase.toExclude);
        add("deploys");
    }};

    private int clusterId; // used for unique cluster and port
    private String namespace;
    private LoadBalanceType type;
    private List<LoadBalancerPort> loadBalancerPorts;
    private List<String> externalIPs;
    private List<Deployment> deploys;
    private String dnsName;  // domain name

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public List<LoadBalancerPort> getLoadBalancerPorts() {
        return loadBalancerPorts;
    }

    public void setLoadBalancerPorts(List<LoadBalancerPort> loadBalancerPorts) {
        this.loadBalancerPorts = loadBalancerPorts;
    }

    public LoadBalanceType getType() {
        return type;
    }

    public void setType(LoadBalanceType type) {
        this.type = type;
    }

    public List<String> getExternalIPs() {
        return externalIPs;
    }

    public void setExternalIPs(List<String> externalIPs) {
        this.externalIPs = externalIPs;
    }

    public int getClusterId() {
        return clusterId;
    }

    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
    }

    public String getDnsName() {
        return dnsName;
    }

    public void setDnsName(String dnsName) {
        this.dnsName = dnsName;
    }

    public List<Deployment> getDeploys() {
        return deploys;
    }

    public void setDeploys(List<Deployment> deploys) {
        this.deploys = deploys;
    }

    public static Set<String> getToExclude() {
        return toExclude;
    }

    public static void setToExclude(Set<String> toExclude) {
        LoadBalancer.toExclude = toExclude;
    }

    public String checkLegality() {
        if (clusterId <= 0) {
            return "cluster id less than 0";
        } else if (externalIPs == null || externalIPs.size() == 0) {
        //     return "do not have external ip info";
            return "";  // for stateful deployment
        } else {
            for (String ip : externalIPs) {
                if (!IPAddressUtil.isIPv4LiteralAddress(ip)) {
                    return ip + " is not a valid ip address";
                }
            }
        }
        return "";
    }

    public String checkExternalIPs() {
        if (externalIPs == null || externalIPs.size() < 1) {
            return "externalIPs is empty";
        }
        return "";
    }

    public LoadBalancer fromLoadBalancerV1(LoadBalancerV1 loadBalancerV1) {
        LoadBalancer loadBalancer = new LoadBalancer();
        loadBalancer.setVer(VERSION_NOW());
        loadBalancer.setFqcn("org.domeos.framework.api.model.LoadBalancerService.LoadBalancerService");
        loadBalancer.setId(loadBalancerV1.getId());
        loadBalancer.setName(loadBalancerV1.getName());
        loadBalancer.setDescription(loadBalancerV1.getDescription());
        loadBalancer.setState(loadBalancerV1.getState());
        loadBalancer.setCreateTime(loadBalancerV1.getCreateTime());
        loadBalancer.setRemoveTime(loadBalancerV1.getRemoveTime());
        loadBalancer.setRemoved(loadBalancerV1.isRemoved());
        loadBalancer.setType(loadBalancerV1.getType());
        loadBalancer.setExternalIPs(loadBalancerV1.getExternalIPs());
        loadBalancer.setClusterId(loadBalancerV1.getClusterId());
        LoadBalancerPort loadBalancerPort = new LoadBalancerPort();
        loadBalancerPort.setPort(loadBalancerV1.getPort());
        loadBalancerPort.setTargetPort(loadBalancerV1.getTargetPort());
        loadBalancerPort.setProtocol(loadBalancerV1.getProtocol());
        List<LoadBalancerPort> loadBalancerPorts = new ArrayList<>();
        loadBalancerPorts.add(loadBalancerPort);
        loadBalancer.setLoadBalancerPorts(loadBalancerPorts);
        // TODO(openxxs) update database data to assign dnsName and namespace
        loadBalancer.setDnsName(loadBalancerV1.getDnsName());
        loadBalancer.setNamespace(loadBalancerV1.getNamespace());
        return loadBalancer;
    }
}
