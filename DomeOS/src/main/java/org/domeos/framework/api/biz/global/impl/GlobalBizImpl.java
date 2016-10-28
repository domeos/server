package org.domeos.framework.api.biz.global.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.mapper.global.GlobalMapper;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.global.*;
import org.domeos.framework.api.model.image.BuildImage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2016/4/8.
 */
@Service("globalServie")
public class GlobalBizImpl implements GlobalBiz {
    @Autowired
    GlobalMapper globalMapper;

    @Autowired
    ClusterBiz clusterBiz;

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

    public Registry getPublicRegistry() {
        GlobalInfo url = globalMapper.getGlobalInfoByType(GlobalType.PUBLIC_REGISTRY_URL);
        Registry registry = null;
        if (url != null) {
            registry = new Registry();
            registry.setUrl(url.getValue());
        }
        return registry;
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

    public void setWebSsh(WebSsh webSsh) {
        long time = System.currentTimeMillis();
        GlobalInfo globalInfo = new GlobalInfo(GlobalType.WEBSSH, webSsh.getUrl(), time, time);
        globalMapper.addGlobalInfo(globalInfo);
        webSsh.setId(globalInfo.getId());
    }

    public void updateWebSsh(WebSsh webSsh) {
        long time = System.currentTimeMillis();
        GlobalInfo globalInfo = new GlobalInfo(webSsh.getId(), GlobalType.WEBSSH, webSsh.getUrl(), webSsh.getCreateTime(), time);
        globalMapper.updateGlobalInfoById(globalInfo);
        webSsh.setLastUpdate(time);
    }

    public ClusterMonitor getMonitor() {
        ClusterMonitor clusterMonitor = null;
        clusterMonitor = new ClusterMonitor();
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
        GlobalInfo hbs = globalMapper.getGlobalInfoByType(GlobalType.MONITOR_HBS);
        if (hbs != null) {
            clusterMonitor.setHbs(hbs.getValue());
        }
        GlobalInfo judge = globalMapper.getGlobalInfoByType(GlobalType.MONITOR_JUDGE);
        if (judge != null) {
            clusterMonitor.setJudge(judge.getValue());
        }
        GlobalInfo alarm = globalMapper.getGlobalInfoByType(GlobalType.MONITOR_ALARM);
        if (alarm != null) {
            clusterMonitor.setAlarm(alarm.getValue());
        }
        GlobalInfo sender = globalMapper.getGlobalInfoByType(GlobalType.MONITOR_SENDER);
        if (sender != null) {
            clusterMonitor.setSender(sender.getValue());
        }
        GlobalInfo nodata = globalMapper.getGlobalInfoByType(GlobalType.MONITOR_NODATA);
        if (nodata != null) {
            clusterMonitor.setNodata(nodata.getValue());
        }
        GlobalInfo redis = globalMapper.getGlobalInfoByType(GlobalType.MONITOR_REDIS);
        if (redis != null) {
            clusterMonitor.setRedis(redis.getValue());
        }
        GlobalInfo apiSms = globalMapper.getGlobalInfoByType(GlobalType.MONITOR_API_SMS);
        if (apiSms != null) {
            clusterMonitor.setApiSms(apiSms.getValue());
        }
        GlobalInfo apiMail = globalMapper.getGlobalInfoByType(GlobalType.MONITOR_API_MAIL);
        if (apiMail != null) {
            clusterMonitor.setApiMail(apiMail.getValue());
        }
        return clusterMonitor;
    }

    public void deleteMonitor() {
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_TRANSFER);
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_GRAPH);
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_QUERY);
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_HBS);
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_JUDGE);
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_ALARM);
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_SENDER);
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_NODATA);
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_REDIS);
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_API_SMS);
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_API_MAIL);
    }

    public void addMonitor(ClusterMonitor clusterMonitor) {
        long time = System.currentTimeMillis();
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
        if (!StringUtils.isBlank(clusterMonitor.getHbs())) {
            GlobalInfo hbs = new GlobalInfo(GlobalType.MONITOR_HBS, clusterMonitor.getHbs(), time, time);
            globalMapper.addGlobalInfo(hbs);
        }
        if (!StringUtils.isBlank(clusterMonitor.getJudge())) {
            GlobalInfo judge = new GlobalInfo(GlobalType.MONITOR_JUDGE, clusterMonitor.getJudge(), time, time);
            globalMapper.addGlobalInfo(judge);
        }
        if (!StringUtils.isBlank(clusterMonitor.getAlarm())) {
            GlobalInfo alarm = new GlobalInfo(GlobalType.MONITOR_ALARM, clusterMonitor.getAlarm(), time, time);
            globalMapper.addGlobalInfo(alarm);
        }
        if (!StringUtils.isBlank(clusterMonitor.getSender())) {
            GlobalInfo sender = new GlobalInfo(GlobalType.MONITOR_SENDER, clusterMonitor.getSender(), time, time);
            globalMapper.addGlobalInfo(sender);
        }
        if (!StringUtils.isBlank(clusterMonitor.getNodata())) {
            GlobalInfo nodata = new GlobalInfo(GlobalType.MONITOR_NODATA, clusterMonitor.getNodata(), time, time);
            globalMapper.addGlobalInfo(nodata);
        }
        if (!StringUtils.isBlank(clusterMonitor.getRedis())) {
            GlobalInfo redis = new GlobalInfo(GlobalType.MONITOR_REDIS, clusterMonitor.getRedis(), time, time);
            globalMapper.addGlobalInfo(redis);
        }
        if (!StringUtils.isBlank(clusterMonitor.getApiSms())) {
            GlobalInfo apiSms = new GlobalInfo(GlobalType.MONITOR_API_SMS, clusterMonitor.getApiSms(), time, time);
            globalMapper.addGlobalInfo(apiSms);
        }
        if (!StringUtils.isBlank(clusterMonitor.getApiMail())) {
            GlobalInfo apiMail = new GlobalInfo(GlobalType.MONITOR_API_MAIL, clusterMonitor.getApiMail(), time, time);
            globalMapper.addGlobalInfo(apiMail);
        }
    }

    public void updateMonitor(ClusterMonitor clusterMonitor) {
        long time = System.currentTimeMillis();
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
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_HBS);
        if (!StringUtils.isBlank(clusterMonitor.getHbs())) {
            GlobalInfo hbs = new GlobalInfo(GlobalType.MONITOR_HBS, clusterMonitor.getHbs(), clusterMonitor.getCreateTime(), time);
            globalMapper.addGlobalInfo(hbs);
        }
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_JUDGE);
        if (!StringUtils.isBlank(clusterMonitor.getJudge())) {
            GlobalInfo judge = new GlobalInfo(GlobalType.MONITOR_JUDGE, clusterMonitor.getJudge(), clusterMonitor.getCreateTime(), time);
            globalMapper.addGlobalInfo(judge);
        }
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_ALARM);
        if (!StringUtils.isBlank(clusterMonitor.getAlarm())) {
            GlobalInfo alarm = new GlobalInfo(GlobalType.MONITOR_ALARM, clusterMonitor.getAlarm(), clusterMonitor.getCreateTime(), time);
            globalMapper.addGlobalInfo(alarm);
        }
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_SENDER);
        if (!StringUtils.isBlank(clusterMonitor.getSender())) {
            GlobalInfo sender = new GlobalInfo(GlobalType.MONITOR_SENDER, clusterMonitor.getSender(), clusterMonitor.getCreateTime(), time);
            globalMapper.addGlobalInfo(sender);
        }
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_NODATA);
        if (!StringUtils.isBlank(clusterMonitor.getNodata())) {
            GlobalInfo nodata = new GlobalInfo(GlobalType.MONITOR_NODATA, clusterMonitor.getNodata(), clusterMonitor.getCreateTime(), time);
            globalMapper.addGlobalInfo(nodata);
        }
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_REDIS);
        if (!StringUtils.isBlank(clusterMonitor.getRedis())) {
            GlobalInfo redis = new GlobalInfo(GlobalType.MONITOR_REDIS, clusterMonitor.getRedis(), clusterMonitor.getCreateTime(), time);
            globalMapper.addGlobalInfo(redis);
        }
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_API_SMS);
        if (!StringUtils.isBlank(clusterMonitor.getApiSms())) {
            GlobalInfo apiSms = new GlobalInfo(GlobalType.MONITOR_API_SMS, clusterMonitor.getApiSms(), clusterMonitor.getCreateTime(), time);
            globalMapper.addGlobalInfo(apiSms);
        }
        globalMapper.deleteGlobalInfoByType(GlobalType.MONITOR_API_MAIL);
        if (!StringUtils.isBlank(clusterMonitor.getApiMail())) {
            GlobalInfo apiMail = new GlobalInfo(GlobalType.MONITOR_API_MAIL, clusterMonitor.getApiMail(), clusterMonitor.getCreateTime(), time);
            globalMapper.addGlobalInfo(apiMail);
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
        if (StringUtils.isBlank(ldapInfo.getEmailSuffix())) {
            ldapInfo.setEmailSuffix("");
        }
        GlobalInfo ldapPrefix = new GlobalInfo(GlobalType.LDAP_PREFIX, ldapInfo.getEmailSuffix(), ldapInfo.getCreateTime(), ldapInfo.getLastUpdate());
        globalMapper.addGlobalInfo(ldapPrefix);
    }

    public void updateLdapInfo(LdapInfo ldapInfo) {
        GlobalInfo ldapServer = new GlobalInfo(GlobalType.LDAP_SERVER, ldapInfo.getServer(), ldapInfo.getCreateTime(), System.currentTimeMillis());
        globalMapper.updateGlobalInfoByType(ldapServer);
        if (StringUtils.isBlank(ldapInfo.getEmailSuffix())) {
            ldapInfo.setEmailSuffix("");
        }
        GlobalInfo ldapPrefix = new GlobalInfo(GlobalType.LDAP_PREFIX, ldapInfo.getEmailSuffix(), ldapInfo.getCreateTime(), System.currentTimeMillis());
        globalMapper.updateGlobalInfoByType(ldapPrefix);
    }

    public CiCluster getCiCluster() {
//        GlobalInfo host = globalMapper.getGlobalInfoByType(GlobalType.CI_CLUSTER_HOST);
        GlobalInfo namespace = globalMapper.getGlobalInfoByType(GlobalType.CI_CLUSTER_NAMESPACE);
        GlobalInfo clusterId = globalMapper.getGlobalInfoByType(GlobalType.CI_CLUSTER_ID);
        if (clusterId == null) {
            return null;
        }
//        GlobalInfo clusterName = globalMapper.getGlobalInfoByType(GlobalType.CI_CLUSTER_NAME);
        Cluster cluster = clusterBiz.getClusterById(Integer.parseInt(clusterId.getValue()));
        if (cluster != null) {
            CiCluster ciCluster = new CiCluster();
            ciCluster.setNamespace(namespace.getValue());
            ciCluster.setHost(cluster.getApi());
            ciCluster.setClusterId(Integer.parseInt(clusterId.getValue()));
            ciCluster.setClusterName(cluster.getName());
            ciCluster.setCreateTime(cluster.getCreateTime());
            ciCluster.setLastUpdate(clusterId.getLastUpdate());
            ciCluster.setUsername(cluster.getUsername());
            ciCluster.setPassword(cluster.getPassword());
            ciCluster.setOauthToken(cluster.getOauthToken());
            return ciCluster;
        }
//        GlobalInfo username = globalMapper.getGlobalInfoByType(GlobalType.CI_CLUSTER_USERNAME);
//        GlobalInfo password = globalMapper.getGlobalInfoByType(GlobalType.CI_CLUSTER_PASSWORD);
//        GlobalInfo oauthToken = globalMapper.getGlobalInfoByType(GlobalType.CI_CLUSTER_OAUTHTOKEN);
//
//        if (host != null && namespace != null && clusterName != null) {
//            return new CiCluster(host.getId(),
//                    namespace.getValue(),
//                    host.getValue(),
//                    Integer.parseInt(clusterId.getValue()),
//                    clusterName.getValue(),
//                    host.getCreateTime(),
//                    host.getLastUpdate(),
//                    username.getValue(),
//                    password.getValue(),
//                    oauthToken.getValue());
//        }
        return null;
    }

    public void setCiCluster(CiCluster ciCluster) {
        long time = System.currentTimeMillis();
//        ciCluster.setCreateTime(time);
//        ciCluster.setLastUpdate(time);
//        GlobalInfo host = new GlobalInfo(GlobalType.CI_CLUSTER_HOST, ciCluster.getHost(), time, time);
//        globalMapper.addGlobalInfo(host);
//        ciCluster.setId(host.getId());
        GlobalInfo namespace = new GlobalInfo(GlobalType.CI_CLUSTER_NAMESPACE, ciCluster.getNamespace(), time, time);
        globalMapper.addGlobalInfo(namespace);
        GlobalInfo clusterId = new GlobalInfo(GlobalType.CI_CLUSTER_ID, String.valueOf(ciCluster.getClusterId()), time, time);
        globalMapper.addGlobalInfo(clusterId);
//        GlobalInfo clusterName = new GlobalInfo(GlobalType.CI_CLUSTER_NAME, ciCluster.getClusterName(), time, time);
//        globalMapper.addGlobalInfo(clusterName);
//        GlobalInfo username = new GlobalInfo(GlobalType.CI_CLUSTER_USERNAME, ciCluster.getUsername(), time, time);
//        globalMapper.addGlobalInfo(username);
//        GlobalInfo password = new GlobalInfo(GlobalType.CI_CLUSTER_PASSWORD, ciCluster.getPassword(), time, time);
//        globalMapper.addGlobalInfo(password);
//        GlobalInfo oauthToken = new GlobalInfo(GlobalType.CI_CLUSTER_OAUTHTOKEN, ciCluster.getOauthToken(), time, time);
//        globalMapper.addGlobalInfo(oauthToken);
    }

    public void deleteCiCluster() {
        globalMapper.deleteGlobalInfoByType(GlobalType.CI_CLUSTER_HOST);
        globalMapper.deleteGlobalInfoByType(GlobalType.CI_CLUSTER_NAMESPACE);
        globalMapper.deleteGlobalInfoByType(GlobalType.CI_CLUSTER_ID);
        globalMapper.deleteGlobalInfoByType(GlobalType.CI_CLUSTER_NAME);
    }

    public void updateCiCluster(CiCluster ciCluster) {
        long time = System.currentTimeMillis();
        GlobalInfo host = new GlobalInfo(GlobalType.CI_CLUSTER_HOST, ciCluster.getHost(), ciCluster.getCreateTime(), time);
        globalMapper.updateGlobalInfoByType(host);
        GlobalInfo namespace = new GlobalInfo(GlobalType.CI_CLUSTER_NAMESPACE, ciCluster.getNamespace(), ciCluster.getCreateTime(), time);
        globalMapper.updateGlobalInfoByType(namespace);
        GlobalInfo clusterId = new GlobalInfo(GlobalType.CI_CLUSTER_ID, String.valueOf(ciCluster.getClusterId()), ciCluster.getCreateTime(), time);
        globalMapper.updateGlobalInfoByType(clusterId);
        GlobalInfo clusterName = new GlobalInfo(GlobalType.CI_CLUSTER_NAME, ciCluster.getClusterName(), ciCluster.getCreateTime(), time);
        globalMapper.updateGlobalInfoByType(clusterName);
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
