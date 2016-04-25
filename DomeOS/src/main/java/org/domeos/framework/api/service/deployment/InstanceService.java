package org.domeos.framework.api.service.deployment;

import org.domeos.basemodel.HttpResponseTemp;

import java.util.Map;

/**
 * Created by xxs on 16/4/5.
 */
public interface InstanceService {
    /**
     * list all pods for specific deployment
     * @param deployId deployment id
     * @return
     */
    HttpResponseTemp<?> listPodsByDeployId(int deployId) throws Exception;

    /**
     * set annotation for pod
     * @param clusterName cluster name
     * @param namespace cluster namespace
     * @param podName pod name
     * @param annotations annotations to be set
     * @return
     */
    HttpResponseTemp<?> setPodAnnotation(String clusterName, String namespace, String podName, Map<String, String> annotations);
}