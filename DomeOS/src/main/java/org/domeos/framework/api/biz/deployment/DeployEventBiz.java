package org.domeos.framework.api.biz.deployment;

import com.fasterxml.jackson.core.JsonProcessingException;
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
     * @throws JsonProcessingException
     */
    void createEvent(DeployEvent event) throws JsonProcessingException;

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
     * @throws IOException
     */
    DeployEvent getNewestEventByDeployId(int deployId) throws IOException;

    /**
     *
     * @param eid
     * @param event
     * @throws JsonProcessingException
     */
    void updateEvent(long eid, DeployEvent event) throws JsonProcessingException;

    /**
     *
     * @return
     * @throws IOException
     */
    List<DeployEvent> getUnfinishedEvent() throws IOException;
}
