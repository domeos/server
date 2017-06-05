package org.domeos.framework.api.service.deployment;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.model.deployment.related.Instance;

import java.util.List;
import java.util.Map;

/**
 * Created by xxs on 16/4/5.
 */
public interface InstanceService {
    /**
     * list all pods for specific deployment
     *
     * @param deployId deployment id
     * @return
     */
    HttpResponseTemp<?> listPodsByDeployId(int deployId) throws Exception;

    /**
     * set annotation for pod
     *
     * @param clusterName cluster name
     * @param namespace   cluster namespace
     * @param podName     pod name
     * @param annotations annotations to be set
     * @return
     */
    HttpResponseTemp<?> setPodAnnotation(String clusterName, String namespace, String podName, Map<String, String> annotations);

    /**
     * get instances for specific deployment
     *
     * @param deployId deployment id
     * @return
     * @throws Exception
     */
    List<Instance> getInstances(int deployId) throws Exception;
    
    /**
     * delete pod of specific deployment
     *
     * @param deployId deployment id
     * @param podName pod name
     * @return
     * @throws Exception
     */
    HttpResponseTemp<?> deletePodByDeployIdAndInsName(int deployId, String insName) throws Exception;
}
