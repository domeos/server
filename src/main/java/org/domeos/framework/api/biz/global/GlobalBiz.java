package org.domeos.framework.api.biz.global;

import org.domeos.framework.api.model.global.*;
import org.domeos.framework.api.model.image.BuildImage;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/1/20.
 */
public interface GlobalBiz {

    int addGlobalInfo(GlobalInfo globalInfo);

    GlobalInfo getGlobalInfoByType(GlobalType globalType);

    GlobalInfo getGlobalInfoByTypeAndId(GlobalType globalType, int id);

    List<GlobalInfo> listGlobalInfoByType(GlobalType globalType);

    GlobalInfo getGlobalInfoById(int id);

    int deleteGlobalInfoByType(GlobalType globalType);

    int deleteGlobalInfoById(int id);

    int updateGlobalInfoById(GlobalInfo globalInfo);

    int updateGlobalInfoByType(GlobalInfo globalInfo);

    Server getServer();

    void setServer(Server server);

    void updateServer(Server server);

    void deleteServer();

    Registry getPublicRegistry();

    Registry getRegistry();

    void deleteRegistry();

    void setRegistry(Registry registry);

    String getCertification();

    void setWebSsh(WebSsh webSsh);

    WebSsh getWebSsh();

    void deleteWebSsh();

    void updateWebSsh(WebSsh webSsh);

    ClusterMonitor getMonitor();

    void deleteMonitor();

    void addMonitor(ClusterMonitor clusterMonitor);

    void updateMonitor(ClusterMonitor clusterMonitor);

    LdapInfo getLdapInfo();

    void deleteLdapInfo();

    void addLdapInfo(LdapInfo ldapInfo);

    void updateLdapInfo(LdapInfo ldapInfo);

    CiCluster getCiCluster();

    void setCiCluster(CiCluster ciCluster);

    void deleteCiCluster();

    void updateCiCluster(CiCluster ciCluster);

    BuildImage getBuildImage();

    void deleteBuildImage();

    void setBuildImage(BuildImage buildImage);

    String getUpdateJobImage();

    String getUUID();

    SsoInfo getSsoInfo();

    void setSsoInfo(SsoInfo ssoInfo);

    void updateSsoInfo(SsoInfo ssoInfo);

    void deleteSsoInfo();
}
