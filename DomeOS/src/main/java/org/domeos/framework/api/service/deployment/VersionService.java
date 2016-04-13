package org.domeos.framework.api.service.deployment;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.deployment.VersionDetail;
import org.domeos.framework.api.consolemodel.deployment.VersionInfo;
import org.domeos.framework.api.model.deployment.Version;

import java.io.IOException;
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
    HttpResponseTemp<?> createVersion(Version version, int deployId) throws Exception;

    /**
     * get version by deployId and versionId
     * @param deployId deployment id
     * @param versionId version id
     * @return
     * @throws IOException
     */
    HttpResponseTemp<VersionDetail> getVersion(int deployId, long versionId) throws Exception;

    /**
     * list all versions for specific deployment
     * @param deployId deployment id
     * @return
     * @throws IOException
     */
    HttpResponseTemp<List<VersionInfo>> listVersion(int deployId) throws Exception;
}