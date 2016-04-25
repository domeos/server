package org.domeos.framework.api.service.deployment;

import org.domeos.framework.api.model.deployment.related.DeploymentSnapshot;
import org.domeos.framework.api.model.deployment.related.DeploymentStatus;
import org.domeos.framework.api.model.auth.User;
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
    void registerStartEvent(int deployId, User user, List<DeploymentSnapshot> dstSnapshot)
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
    void registerStopEvent(int deployId, User user, List<DeploymentSnapshot> srcSnapshot,
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
    void registerStartUpdateEvent(int deployId, User user, List<DeploymentSnapshot> srcSnapshot,
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
    void registerStartRollbackEvent(int deployId, User user, List<DeploymentSnapshot> srcSnapshot,
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
    void registerScaleUpEvent (int deployId, User user, List<DeploymentSnapshot> srcSnapshot,
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
    void registerScaleDownEvent(int deployId, User user, List<DeploymentSnapshot> srcSnapshot,
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
    DeploymentStatus getDeploymentStatus(int deployId) throws IOException;


    /**
     *
     * @param deploymentId
     * @param currentSnapshot
     * @param message
     * @throws IOException
     * @throws DeploymentEventException
     */
    void failedEventForDeployment(int deploymentId, List<DeploymentSnapshot> currentSnapshot, String message)
            throws IOException, DeploymentEventException;
}
