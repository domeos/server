package org.domeos.framework.api.service.deployment;

import org.domeos.exception.DeploymentEventException;
import org.domeos.exception.DeploymentTerminatedException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.deployment.related.DeployOperation;
import org.domeos.framework.api.model.deployment.related.DeploymentSnapshot;
import org.domeos.framework.api.model.deployment.related.DeploymentStatus;

import java.io.IOException;
import java.util.List;

/**
 * Created by anningluo on 2015/12/19.
 */
public interface DeploymentStatusManager {

    /**
     * @param deployId
     * @param user
     * @param srcSnapshot
     * @param currentSnapshot
     * @param dstSnapshot
     * @throws DeploymentEventException
     */
    long registerEvent(int deployId, DeployOperation operation, User user, List<DeploymentSnapshot> srcSnapshot,
                       List<DeploymentSnapshot> currentSnapshot, List<DeploymentSnapshot> dstSnapshot) throws DeploymentEventException, IOException;

    /**
     * register abort operation event
     *
     * @param deployId
     * @param user
     * @throws DeploymentEventException
     */
    long registerAbortEvent(int deployId, User user) throws DeploymentEventException, IOException;

    /**
     * @param eid
     * @param currentSnapshot
     * @throws IOException
     * @throws DeploymentEventException
     */
    void freshEvent(long eid, List<DeploymentSnapshot> currentSnapshot)
            throws IOException, DeploymentEventException;

    /**
     * @param eid
     * @param currentSnapshot
     * @throws IOException
     * @throws DeploymentEventException
     */
    void succeedEvent(long eid, List<DeploymentSnapshot> currentSnapshot)
            throws IOException, DeploymentEventException, DeploymentTerminatedException;

    /**
     * @param eid
     * @param currentSnapshot
     * @param message
     * @throws IOException
     * @throws DeploymentEventException
     */
    void failedEvent(long eid, List<DeploymentSnapshot> currentSnapshot, String message)
            throws IOException, DeploymentEventException, DeploymentTerminatedException;

    /**
     * @param deploymentId
     * @param currentSnapshot
     * @param message
     * @throws IOException
     * @throws DeploymentEventException
     */
    void failedEventForDeployment(int deploymentId, List<DeploymentSnapshot> currentSnapshot, String message)
            throws IOException, DeploymentEventException, DeploymentTerminatedException;

    /**
     * check available deployment state from current state
     *
     * @param curState current deployment state
     * @param dstState destination deployment state
     */
    void checkStateAvailable(DeploymentStatus curState, DeploymentStatus dstState);

}
