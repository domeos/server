package org.domeos.api.service.deployment;

import org.domeos.api.model.deployment.Version;
import org.domeos.api.model.deployment.VersionDetail;
import org.domeos.api.model.deployment.VersionInfo;
import org.domeos.basemodel.HttpResponseTemp;

import java.io.IOException;
import java.util.List;

/**
 */
public interface VersionService {

    /**
     *
     * @param version
     * @param deployId
     * @param userId
     * @return
     * @throws Exception
     */
    HttpResponseTemp<?> createVersion(Version version, long deployId, long userId) throws Exception;

    /**
     *
     * @param deployId
     * @param version
     * @param userId
     * @return
     * @throws IOException
     */
    HttpResponseTemp<VersionDetail> getVersionDetail(long deployId, long version, long userId) throws IOException;

    /**
     *
     * @param deployId
     * @param userId
     * @return
     * @throws IOException
     */
    HttpResponseTemp<List<VersionInfo>> listVersions(long deployId, long userId) throws IOException;

}
