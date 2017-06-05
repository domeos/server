package org.domeos.framework.api.service.deployment;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.deployment.VersionDraft;
import org.domeos.framework.api.consolemodel.deployment.VersionInfo;

import java.util.List;

/**
 * Created by xxs on 16/4/5.
 */
public interface VersionService {
    /**
     * create deployment version
     *
     * @param version  version input parameters
     * @param deployId deployment id
     * @return
     * @throws Exception
     */
    Long createVersion(VersionDraft version, int deployId) throws Exception;

    /**
     * get version by deployId and versionId
     *
     * @param deployId  deployment id
     * @param versionId version id
     * @return
     * @throws Exception
     */
    VersionDraft getVersion(int deployId, int versionId) throws Exception;

    /**
     * list all versions for specific deployment
     *
     * @param deployId deployment id
     * @return
     * @throws Exception
     */
    List<VersionInfo> listVersion(int deployId) throws Exception;

    /**
     * deprecate version to umount volume
     *
     * @param id
     * @return
     */
    HttpResponseTemp<?> deprecateVersionById(int id);

    /**
     * enable version
     *
     * @param id
     * @return
     */
    HttpResponseTemp<?> enableVersionById(int id);

    /**
     * umount volume
     *
     * @param deployId
     * @param versionId
     * @return
     */
    HttpResponseTemp<?> deprecateVersionByDeployIdAndVersionId(int deployId, int versionId);

    /**
     * enable version
     *
     * @param deployId
     * @param versionId
     * @return
     */
    HttpResponseTemp<?> enableVersionByDeployIdAndVersionId(int deployId, int versionId);
}
