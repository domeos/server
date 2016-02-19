package org.domeos.api.service.global;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.mapper.global.GlobalMapper;
import org.domeos.api.model.ci.BuildImage;
import org.domeos.api.model.cluster.CiCluster;
import org.domeos.api.model.cluster.ClusterMonitor;
import org.domeos.api.model.global.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2016/1/20.
 */

@Service("globalServie")
public class GlobalService {

    @Autowired
    GlobalMapper globalMapper;

    public int addGlobalInfo(GlobalInfo globalInfo) {
        globalInfo.setCreateTime(System.currentTimeMillis());
        globalInfo.setLastUpdate(System.currentTimeMillis());
        return globalMapper.addGlobalInfo(globalInfo);
    }

    public GlobalInfo getGlobalInfoByType(GlobalType globalType) {
        return globalMapper.getGlobalInfoByType(globalType);
    }

    public GlobalInfo getGlobalInfoById(int id) {
        return globalMapper.getGlobalInfoById(id);
    }

    public int deleteGlobalInfoByType(GlobalType globalType) {
        return globalMapper.deleteGlobalInfoByType(globalType);
    }

    public int deleteGlobalInfoById(int id) {
        return globalMapper.deleteGlobalInfoById(id);
    }

    public int updateGlobalInfoById(GlobalInfo globalInfo) {
        globalInfo.setLastUpdate(System.currentTimeMillis());
        return globalMapper.updateGlobalInfoById(globalInfo);
    }

    public int updateGlobalInfoByType(GlobalInfo globalInfo) {
        globalInfo.setLastUpdate(System.currentTimeMillis());
        return globalMapper.updateGlobalInfoByType(globalInfo);
    }

    public Server getServer() {
        GlobalInfo globalInfo = globalMapper.getGlobalInfoByType(GlobalType.SERVER);
        if (globalInfo != null) {
            return new Server(globalInfo.getId(), globalInfo.getValue(), globalInfo.getCreateTime(), globalInfo.getLastUpdate());
        }
        return null;
    }

    public void setServer(Server server) {
        long time = System.currentTimeMillis();
        server.setCreateTime(time);
        server.setLastUpdate(time);
        GlobalInfo globalServer = new GlobalInfo(GlobalType.SERVER, server.getUrl(), time, time);
        globalMapper.addGlobalInfo(globalServer);
        server.setId(globalServer.getId());
    }

    public void updateServer(Server server) {
        long time = System.currentTimeMillis();
        server.setLastUpdate(time);
        GlobalInfo globalInfo = new GlobalInfo(server.getId(), GlobalType.SERVER, server.getUrl(), server.getCreateTime(), time);
        globalMapper.updateGlobalInfoById(globalInfo);
    }

    public void deleteServer() {
        globalMapper.deleteGlobalInfoByType(GlobalType.SERVER);
    }

    public Registry getRegistry() {
        GlobalInfo url = globalMapper.getGlobalInfoByType(GlobalType.REGISTRY_URL);
        GlobalInfo description = globalMapper.getGlobalInfoByType(GlobalType.REGISTRY_DESCRIPTION);
        GlobalInfo status = globalMapper.getGlobalInfoByType(GlobalType.REGISTRY_STATUS);
        GlobalInfo certification = globalMapper.getGlobalInfoByType(GlobalType.REGISTRY_CERTIFICATION);

        Registry registry = null;
        if (url != null) {
            registry = new Registry();
            registry.setUrl(url.getValue());
            registry.setCreateTime(url.getCreateTime());
            registry.setLastUpdate(url.getLastUpdate());
            if (description != null) {
                registry.setDescription(description.getValue());
            }
            if (status != null) {
                registry.setStatus(Integer.valueOf(status.getValue()));
            }
            if (certification != null) {
                registry.setCertification(certification.getValue());
            }
        }
        return registry;
    }

    public void deleteRegistry() {
        globalMapper.deleteGlobalInfoByType(GlobalType.REGISTRY_URL);
        globalMapper.deleteGlobalInfoByType(GlobalType.REGISTRY_DESCRIPTION);
        globalMapper.deleteGlobalInfoByType(GlobalType.REGISTRY_STATUS);
        globalMapper.deleteGlobalInfoByType(GlobalType.REGISTRY_CERTIFICATION);
    }

    public void setRegistry(Registry registry) {
        long create = System.currentTimeMillis();
        long update = System.currentTimeMillis();
        registry.setCreateTime(create);
        registry.setLastUpdate(update);
        GlobalInfo url = new GlobalInfo(GlobalType.REGISTRY_URL, registry.getUrl(), create, update);
        globalMapper.addGlobalInfo(url);
        registry.setId(url.getId());
        if (!StringUtils.isBlank(registry.getDescription())) {
            GlobalInfo description = new GlobalInfo(GlobalType.REGISTRY_DESCRIPTION, registry.getDescription(), create, update);
            globalMapper.addGlobalInfo(description);
        }
        GlobalInfo status = new GlobalInfo(GlobalType.REGISTRY_STATUS, String.valueOf(registry.getStatus()), create, update);
        globalMapper.addGlobalInfo(status);
        if (!StringUtils.isBlank(registry.getCertification())) {
            GlobalInfo certification = new GlobalInfo(GlobalType.REGISTRY_CERTIFICATION, registry.getCertification(), create, update);
            globalMapper.addGlobalInfo(certification);
        }
    }

    public String getCertification() {
        GlobalInfo globalInfo = globalMapper.getGlobalInfoByType(GlobalType.REGISTRY_CERTIFICATION);
        if (globalInfo != null) {
            return globalInfo.getValue();
        }
        return null;
    }

    public WebSsh getWebSsh() {
        GlobalInfo globalInfo = globalMapper.getGlobalInfoByType(GlobalType.WEBSSH);
        if (globalInfo != null) {
            return new WebSsh(globalInfo.getId(), globalInfo.getValue(), globalInfo.getCreateTime(), globalInfo.getLastUpdate());
        }
        return null;
    }

    public void deleteWebSsh() {
        globalMapper.deleteGlobalInfoByType(GlobalType.WEBSSH);
    }

    public void setWebSsh (WebSsh webSsh) {
        long time = System.currentTimeMillis();
        GlobalInfo globalInfo = new GlobalInfo(GlobalType.WEBSSH, webSsh.getUrl(), time, time);
        globalMapper.addGlobalInfo(globalInfo);
        webSsh.setId(globalInfo.getId());
    }

    public void updateWebSsh (WebSsh webSsh) {
        long time = System.currentTimeMillis();
        GlobalInfo globalInfo = new GlobalInfo(webSsh.getId(), GlobalType.WEBSSH, webSsh.getUrl(), webSsh.getCreateTime(), time);
        globalMapper.updateGlobalInfoById(globalInfo);
        webSsh.setLastUpdate(time);
    }

    public ClusterMonitor getMonitor() {
        ClusterMonitor clusterMonitor = null;
        GlobalInfo url = globalMapper.getGlobalInfoByType(GlobalType.MONITOR_URL);
        if (url != null) {
            clusterMonitor = new ClusterMonitor();
            clusterMonitor.setId(url.getId());
            clusterMonitor.setUrl(url.getValue());
            clusterMonitor.setCreateTime(url.getCreateTime());
            clusterMonitor.setLastUpdate(url.getLastUpdate());
            GlobalInfo transfer = globalMapper.getGlobalInfoByType(GlobalType.MONITOR_TRANSFER);
            if (transfer != null) {
                clusterMonitor.setTransfer(transfer.getValue());
            }
            GlobalInfo graph = globalMapper.getGlobalInfoByType(GlobalType.MONITOR_GRAPH);
            if (graph != null) {
                clusterMonitor.setGraph(graph.getValue());
            }
            GlobalInfo query = globalMapper.getGlobalInfoByType(GlobalType.MONITOR_QUERY);
            if (query != null) {
                clusterMonitor.setQuery(query.getValue());
            }
        }
        return clusterMonitor;
    }

    public void deleteMonitor() {
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_URL);
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_TRANSFER);
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_GRAPH);
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_QUERY);
    }

    public void addMonitor(ClusterMonitor clusterMonitor) {
        long time = System.currentTimeMillis();
        GlobalInfo url = new GlobalInfo(GlobalType.MONITOR_URL, clusterMonitor.getUrl(), time, time);
        globalMapper.addGlobalInfo(url);
        clusterMonitor.setId(url.getId());
        if (!StringUtils.isBlank(clusterMonitor.getTransfer())) {
            GlobalInfo transfer = new GlobalInfo(GlobalType.MONITOR_TRANSFER, clusterMonitor.getTransfer(), time, time);
            globalMapper.addGlobalInfo(transfer);
        }
        if (!StringUtils.isBlank(clusterMonitor.getGraph())) {
            GlobalInfo graph = new GlobalInfo(GlobalType.MONITOR_GRAPH, clusterMonitor.getGraph(), time, time);
            globalMapper.addGlobalInfo(graph);
        }
        if (!StringUtils.isBlank(clusterMonitor.getQuery())) {
            GlobalInfo query = new GlobalInfo(GlobalType.MONITOR_QUERY, clusterMonitor.getQuery(), time, time);
            globalMapper.addGlobalInfo(query);
        }
    }

    public void updateMonitor(ClusterMonitor clusterMonitor) {
        long time = System.currentTimeMillis();
        GlobalInfo url = new GlobalInfo(clusterMonitor.getId(), GlobalType.MONITOR_URL, clusterMonitor.getUrl(), clusterMonitor.getCreateTime(), time);
        globalMapper.updateGlobalInfoById(url);
        clusterMonitor.setId(url.getId());
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_TRANSFER);
        if (!StringUtils.isBlank(clusterMonitor.getTransfer())) {
            GlobalInfo transfer = new GlobalInfo(GlobalType.MONITOR_TRANSFER, clusterMonitor.getTransfer(), clusterMonitor.getCreateTime(), time);
            globalMapper.addGlobalInfo(transfer);
        }
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_GRAPH);
        if (!StringUtils.isBlank(clusterMonitor.getGraph())) {
            GlobalInfo graph = new GlobalInfo(GlobalType.MONITOR_GRAPH, clusterMonitor.getGraph(), clusterMonitor.getCreateTime(), time);
            globalMapper.addGlobalInfo(graph);
        }
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_QUERY);
        if (!StringUtils.isBlank(clusterMonitor.getQuery())) {
            GlobalInfo query = new GlobalInfo(GlobalType.MONITOR_QUERY, clusterMonitor.getQuery(), clusterMonitor.getCreateTime(), time);
            globalMapper.addGlobalInfo(query);
        }
    }

    public GitConfig getGitConfigById(int id) {
        GlobalInfo globalInfo = globalMapper.getGlobalInfoById(id);
        if (globalInfo != null) {
            return new GitConfig(globalInfo.getId(), globalInfo.getType(), globalInfo.getValue(), globalInfo.getCreateTime(), globalInfo.getLastUpdate());
        }
        return null;
    }

    public LdapInfo getLdapInfo() {
        GlobalInfo ldapServer = globalMapper.getGlobalInfoByType(GlobalType.LDAP_SERVER);
        GlobalInfo ldapPrefix = globalMapper.getGlobalInfoByType(GlobalType.LDAP_PREFIX);
        LdapInfo ldapInfo = null;
        if (ldapServer != null) {
            ldapInfo = new LdapInfo();
            ldapInfo.setId(ldapServer.getId());
            ldapInfo.setServer(ldapServer.getValue());
            ldapInfo.setCreateTime(ldapServer.getCreateTime());
            ldapInfo.setLastUpdate(ldapServer.getLastUpdate());
            if (ldapPrefix != null) {
                ldapInfo.setEmailSuffix(ldapPrefix.getValue());
            }
        }
        return ldapInfo;
    }

    public void deleteLdapInfo() {
        globalMapper.deleteGlobalInfoByType(GlobalType.LDAP_SERVER);
        globalMapper.deleteGlobalInfoByType(GlobalType.LDAP_PREFIX);
    }

    public void addLdapInfo(LdapInfo ldapInfo) {
        long time = System.currentTimeMillis();
        ldapInfo.setCreateTime(time);
        ldapInfo.setLastUpdate(time);
        GlobalInfo ldapServer = new GlobalInfo(GlobalType.LDAP_SERVER, ldapInfo.getServer(), ldapInfo.getCreateTime(), ldapInfo.getLastUpdate());
        globalMapper.addGlobalInfo(ldapServer);
        ldapInfo.setId(ldapServer.getId());
        if (!StringUtils.isBlank(ldapInfo.getEmailSuffix())) {
            GlobalInfo ldapPrefix = new GlobalInfo(GlobalType.LDAP_PREFIX, ldapInfo.getEmailSuffix(), ldapInfo.getCreateTime(), ldapInfo.getLastUpdate());
            globalMapper.addGlobalInfo(ldapPrefix);
        }
    }

    public void updateLdapInfo(LdapInfo ldapInfo) {
        GlobalInfo ldapServer = new GlobalInfo(GlobalType.LDAP_SERVER, ldapInfo.getServer(), ldapInfo.getCreateTime(), System.currentTimeMillis());
        globalMapper.updateGlobalInfoByType(ldapServer);
        if (!StringUtils.isBlank(ldapInfo.getEmailSuffix())) {
            GlobalInfo ldapPrefix = new GlobalInfo(GlobalType.LDAP_PREFIX, ldapInfo.getEmailSuffix(), ldapInfo.getCreateTime(), System.currentTimeMillis());
            globalMapper.updateGlobalInfoByType(ldapPrefix);
        }
    }

    public CiCluster getCiCluster() {
        GlobalInfo host = globalMapper.getGlobalInfoByType(GlobalType.CI_CLUSTER_HOST);
        GlobalInfo namespace = globalMapper.getGlobalInfoByType(GlobalType.CI_CLUSTER_NAMESPACE);
        if (host != null && namespace != null) {
            return new CiCluster(host.getId(), namespace.getValue(), host.getValue(), host.getCreateTime(), host.getLastUpdate());
        }
        return null;
    }

    public void setCiCluster(CiCluster ciCluster) {
        long time = System.currentTimeMillis();
        ciCluster.setCreateTime(time);
        ciCluster.setLastUpdate(time);
        GlobalInfo host = new GlobalInfo(GlobalType.CI_CLUSTER_HOST, ciCluster.getHost(), time, time);
        globalMapper.addGlobalInfo(host);
        ciCluster.setId(host.getId());
        GlobalInfo namespace = new GlobalInfo(GlobalType.CI_CLUSTER_NAMESPACE, ciCluster.getNamespace(), time, time);
        globalMapper.addGlobalInfo(namespace);
    }

    public void deleteCiCluster() {
        globalMapper.deleteGlobalInfoByType(GlobalType.CI_CLUSTER_HOST);
        globalMapper.deleteGlobalInfoByType(GlobalType.CI_CLUSTER_NAMESPACE);
    }

    public void updateCiCluster(CiCluster ciCluster) {
        long time = System.currentTimeMillis();
        GlobalInfo host = new GlobalInfo(GlobalType.CI_CLUSTER_HOST, ciCluster.getHost(), ciCluster.getCreateTime(), time);
        globalMapper.updateGlobalInfoById(host);
        GlobalInfo namespace = new GlobalInfo(GlobalType.CI_CLUSTER_NAMESPACE, ciCluster.getNamespace(), ciCluster.getCreateTime(), time);
        globalMapper.updateGlobalInfoByType(namespace);
    }

    public BuildImage getBuildImage() {
        GlobalInfo globalInfo = globalMapper.getGlobalInfoByType(GlobalType.BUILD_IMAGE);
        if (globalInfo != null) {
            return new BuildImage(globalInfo.getId(), globalInfo.getValue(), globalInfo.getCreateTime(), globalInfo.getLastUpdate());
        }
        return null;
    }

    public void deleteBuildImage() {
        globalMapper.deleteGlobalInfoByType(GlobalType.BUILD_IMAGE);
    }

    public void setBuildImage(BuildImage buildImage) {
        long time = System.currentTimeMillis();
        buildImage.setCreateTime(time);
        buildImage.setLastUpdate(time);
        GlobalInfo globalInfo = new GlobalInfo(GlobalType.BUILD_IMAGE, buildImage.getName(), time, time);
        globalMapper.addGlobalInfo(globalInfo);
        buildImage.setId(globalInfo.getId());
    }
}
