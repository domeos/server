package org.domeos.framework.api.service.deployment;

import org.domeos.framework.api.consolemodel.deployment.VersionDetail;
import org.domeos.framework.api.consolemodel.deployment.VersionInfo;
import org.domeos.framework.api.model.deployment.Version;

import java.util.List;

/**
 * Created by xxs on 16/4/5.
 */
public interface VersionService {
    /**
     * create deployment version
     * @param version version input parameters
     * @param deployId deployment id
     * @return
     * @throws Exception
     */
    Long createVersion(Version version, int deployId) throws Exception;

    /**
     * get version by deployId and versionId
     * @param deployId deployment id
     * @param versionId version id
     * @return
     * @throws Exception
     */
    VersionDetail getVersion(int deployId, int versionId) throws Exception;

    /**
     * list all versions for specific deployment
     * @param deployId deployment id
     * @return
     * @throws Exception
     */
    List<VersionInfo> listVersion(int deployId) throws Exception;
}