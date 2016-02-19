package org.domeos.api.service.deployment;

import org.domeos.api.model.deployment.DeploymentDraft;
import org.domeos.api.model.deployment.Version;
import org.domeos.api.model.deployment.VersionDetail;

import java.io.IOException;
import java.util.List;

/**
 */
public interface VersionBiz {
    /**
     *
     * @param version
     * @return
     * @throws Exception
     */
    long createVersion(Version version) throws Exception;

    /**
     *
     * @param deployId
     * @param version
     * @return
     * @throws IOException
     */
    Version getVersion(long deployId, long version) throws IOException;

    /**
     *
     * @param deployId
     * @return
     * @throws IOException
     */
    Version getNewestVersion(long deployId) throws IOException;

    /**
     *
     * @param deployId
     */
    void deleteAllVersion(long deployId);

    /**
     *
     * @param deployId
     * @return
     * @throws IOException
     */
    List<Version> listVersions(long deployId) throws IOException;

    /**
     *
     * @param deploymentDraft
     * @param deployId
     * @return
     */
    Version buildVersion(DeploymentDraft deploymentDraft, long deployId);

    /**
     *
     * @param deployId
     * @param version
     * @return
     * @throws IOException
     */
    boolean versionExist(long deployId, long version) throws IOException;

    /**
     *
     * @param deployId
     * @param versionId
     * @return
     * @throws IOException
     */
    VersionDetail buildVersionDetail(long deployId, long versionId) throws IOException;
}
