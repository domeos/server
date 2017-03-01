package org.domeos.framework.api.service.overview;

import org.domeos.framework.api.model.deployment.related.DeploymentOverview;
import org.domeos.framework.api.model.overview.OperationContent;
import org.domeos.framework.api.model.overview.ResourceOverview;
import org.domeos.framework.api.model.overview.UsageOverview;
import org.domeos.framework.api.model.project.related.ProjectOverview;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

/**
 * Created by junwuguo on 2017/1/19 0019.
 * The overview service
 */
public interface OverviewService {

    /**
     * Get the overview of current user's projects' usage
     * @return
     */
    UsageOverview getProjectUsageOverview();

    /**
     * Get the overview of current user's recent projects
     * @return
     */
    ProjectOverview getRecentProjectOverview();

    /**
     * Get the overview of current user's Deployments' usage
     * @return
     */
    UsageOverview getDeploymentUsageOverview();

    /**
     * Get the overview of current user's recent deployments
     * @return
     */
    DeploymentOverview getRecentDeploymentOverview();

    /**
     * Get the overview of current user's images
     * @return
     */
    UsageOverview getImageUsageOverview();

    /**
     * Get the overview of current user's clusters' usage
     * @return
     */
    UsageOverview getClusterUsageOverview();

    /**
     * Get the overview of current user's nodes
     * @return
     */
    ResourceOverview getNodeOverview();

    /**
     * Get the overview of current user's operation record
     * @return
     */
    List<OperationContent> getOperationOverview();

    /**
     * Get the overview of the usage of resources
     * @return
     */
    ResourceOverview getResourceOverview();

    /**
     * Get the overview of all resources' usage
     * @return
     */
    UsageOverview getUsageOverview() throws InvocationTargetException, IllegalAccessException;

}
