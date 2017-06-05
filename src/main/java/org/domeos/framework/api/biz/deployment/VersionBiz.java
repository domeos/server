package org.domeos.framework.api.biz.deployment;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.Version;

import java.util.List;

/**
 */
public interface VersionBiz extends BaseBiz {
    String VERSION_TABLE_NAME = "version";

    int insertRow(Version version);

    int insertVersionWithLogCollect(Version version, Cluster cluster);

    void disableAllVersion(int deployId);

    int updateLabelSelector(Version version);

    Version getVersion(int deployId, int version);

    List<Version> getAllVersionByDeployId(int deployId);

    int updateVersion(Version version);

    void enableVersion(Version version);

//    /**
//     *
//     * @param version
//     * @return
//     * @throws Exception
//     */
//    long createVersion(Version version) throws Exception;
//
//    /**
//     *
//     * @param deployId
//     * @param version
//     * @return
//     * @throws IOException
//     */
//    Version getVersion(long deployId, long version) throws IOException;
//
//    /**
//     *
//     * @param deployId
//     * @return
//     * @throws IOException
//     */
//    Version getNewestVersion(long deployId) throws IOException;
//
//    /**
//     *
//     * @param deployId
//     */
//    void deleteAllVersion(long deployId);
//
//    /**
//     *
//     * @param deployId
//     * @return
//     * @throws IOException
//     */
//    List<Version> listVersions(long deployId) throws IOException;
//
//    /**
//     *
//     * @param deploymentDraft
//     * @param deployId
//     * @return
//     */
//    Version buildVersion(DeploymentDraft deploymentDraft, long deployId);
//
//    /**
//     *
//     * @param deployId
//     * @param version
//     * @return
//     * @throws IOException
//     */
//    boolean versionExist(long deployId, long version) throws IOException;
//
//    /**
//     *
//     * @param deployId
//     * @param versionId
//     * @return
//     * @throws IOException
//     */
//    VersionDetail buildVersionDetail(long deployId, long versionId) throws IOException;
}
