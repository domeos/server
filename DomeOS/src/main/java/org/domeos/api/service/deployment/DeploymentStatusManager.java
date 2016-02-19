package org.domeos.api.service.deployment;

import org.domeos.api.model.deployment.DeploymentSnapshot;
import org.domeos.api.model.deployment.DeploymentStatus;
import org.domeos.api.model.user.User;
import org.domeos.exception.DeploymentEventException;

import java.io.IOException;
import java.util.List;

/**
 * Created by anningluo on 2015/12/19.
 */
public interface DeploymentStatusManager {

    /**
     *
     * @param deployId
     * @param user
     * @param dstSnapshot
     * @throws DeploymentEventException
     * @throws IOException
     */
    void registerStartEvent(long deployId, User user, List<DeploymentSnapshot> dstSnapshot)
            throws DeploymentEventException, IOException;

    /**
     *
     * @param deployId
     * @param user
     * @param srcSnapshot
     * @param currentSnapshot
     * @throws DeploymentEventException
     * @throws IOException
     */
    void registerStopEvent(long deployId, User user, List<DeploymentSnapshot> srcSnapshot,
                           List<DeploymentSnapshot> currentSnapshot) throws DeploymentEventException, IOException;

    /**
     *
     * @param deployId
     * @param user
     * @param srcSnapshot
     * @param currentSnapshot
     * @param dstSnapshot
     * @throws IOException
     * @throws DeploymentEventException
     */
    void registerStartUpdateEvent(long deployId, User user, List<DeploymentSnapshot> srcSnapshot,
                                  List<DeploymentSnapshot> currentSnapshot, List<DeploymentSnapshot> dstSnapshot)
            throws IOException, DeploymentEventException;

    /**
     *
     * @param deployId
     * @param user
     * @param srcSnapshot
     * @param currentSnapshot
     * @param dstSnapshot
     * @throws IOException
     * @throws DeploymentEventException
     */
    void registerStartRollbackEvent(long deployId, User user, List<DeploymentSnapshot> srcSnapshot,
                                    List<DeploymentSnapshot> currentSnapshot, List<DeploymentSnapshot> dstSnapshot)
            throws IOException, DeploymentEventException;

    /**
     *
     * @param deployId
     * @param user
     * @param srcSnapshot
     * @param currentSnapshot
     * @param dstSnapshot
     * @throws IOException
     * @throws DeploymentEventException
     */
    void registerScaleUpEvent (long deployId, User user, List<DeploymentSnapshot> srcSnapshot,
                               List<DeploymentSnapshot> currentSnapshot, List<DeploymentSnapshot> dstSnapshot)
            throws IOException, DeploymentEventException;

    /**
     *
     * @param deployId
     * @param user
     * @param srcSnapshot
     * @param currentSnapshot
     * @param dstSnapshot
     * @throws IOException
     * @throws DeploymentEventException
     */
    void registerScaleDownEvent(long deployId, User user, List<DeploymentSnapshot> srcSnapshot,
                                List<DeploymentSnapshot> currentSnapshot, List<DeploymentSnapshot> dstSnapshot)
            throws IOException, DeploymentEventException;

    /**
     *
     * @param eid
     * @param currentSnapshot
     * @throws IOException
     * @throws DeploymentEventException
     */
    void freshEvent(long eid, List<DeploymentSnapshot> currentSnapshot)
            throws IOException, DeploymentEventException;

    /**
     *
     * @param eid
     * @param currentSnapshot
     * @throws IOException
     * @throws DeploymentEventException
     */
    void succeedEvent(long eid, List<DeploymentSnapshot> currentSnapshot)
            throws IOException, DeploymentEventException;

    /**
     *
     * @param eid
     * @param currentSnapshot
     * @param message
     * @throws IOException
     * @throws DeploymentEventException
     */
    void failedEvent(long eid, List<DeploymentSnapshot> currentSnapshot, String message)
            throws IOException, DeploymentEventException;

    /**
     *
     * @param deployId
     * @return
     * @throws IOException
     */
    DeploymentStatus getDeploymentStatus(long deployId) throws IOException;

    /**
     *
     * @param deployId
     * @throws IOException
     */
    void registerStartDeploymentStatus(long deployId) throws IOException;

    /**
     *
     * @param deploymentId
     * @param currentSnapshot
     * @param message
     * @throws IOException
     * @throws DeploymentEventException
     */
    void failedEventForDeployment(long deploymentId, List<DeploymentSnapshot> currentSnapshot, String message)
            throws IOException, DeploymentEventException;
}
