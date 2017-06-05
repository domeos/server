package org.domeos.framework.api.service.loadBalancer;

import org.domeos.framework.api.consolemodel.loadBalancer.*;
import org.domeos.framework.api.model.cluster.related.NodeInfo;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.related.Instance;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerType;

import java.util.List;

/**
 * Created by jackfan on 17/2/27.
 */
public interface LoadBalancerService {

    LoadBalancerDraft createLoadBalancer(LoadBalancerDraft lbDraft) throws Exception;

    void removeLoadBalancer(int lbId) throws Exception;

    void updateLoadBalancer(LoadBalancerDraft lbDraft) throws Exception;

    LoadBalancerDetail getLoadBalancer(int lbId) throws Exception;
    
    List<LoadBalancerInfo> listLoadBalancer(int lbcId) throws Exception;
    
    List<LoadBalancerInfo> listLoadBalancer() throws Exception;
    
    void startLoadBalancer(int lbId, int versionId) throws Exception;

    void stopLoadBalancer(int lbId) throws Exception;
    
    void abortLoadBalancerOperation(int lbId) throws Exception;
    
    void startUpdate(int lbId, int versionId) throws Exception;

    List<Instance> listLoadBalancerInstance(int lbId) throws Exception;
    
    List<DeployEvent> listLoadBalancerEvent(int lbId) throws Exception;

    void startRollback(int lbId, int versionId) throws Exception;
    
    void scaleUpAndDown(int lbId, int versionId, List<NodeInfo> nodes) throws Exception;

    List<LinkedDeployDraft> listDeploy(int clusterId, String namespace, LoadBalancerType lbType) throws Exception;

    void updateLoadBalancerDescription(int lbId, String description);

    void deletePodByLbIdAndInsName(int lbId, String insName) throws Exception;

}
