package org.domeos.framework.api.biz.deployment;

import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.deployment.DeployEvent;

import java.io.IOException;
import java.util.List;

/**
 */
public interface DeployEventBiz {
    String DEPLOY_EVENT_NAME = "deploy_event";

    /**
     *
     * @param event
     */
    long createEvent(DeployEvent event);

    /**
     *
     * @param eid
     * @return
     * @throws IOException
     */
    DeployEvent getEvent(long eid) throws IOException;

    /**
     *
     * @param deployId
     * @return
     * @throws IOException
     */
    List<DeployEvent> getEventByDeployId(int deployId) throws IOException;

    /**
     *
     * @param deployId
     * @return
     */
    DeployEvent getNewestEventByDeployId(int deployId) throws IOException;

    /**
     *
     * @param event
     */
    void updateEvent(DeployEvent event);

    /**
     *
     * @return
     * @throws IOException
     */
    List<DeployEvent> getUnfinishedEvent() throws IOException;

    List<DeployEvent> listRecentEventByDeployCollectionIdTime(List<CollectionAuthorityMap> mapList, long startTime);

    List<DeployEvent> listRecentEventAllDeploymentIncludeRemovedByTime(long startTime);
}
