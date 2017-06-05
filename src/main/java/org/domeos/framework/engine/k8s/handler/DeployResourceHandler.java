package org.domeos.framework.engine.k8s.handler;

import java.util.List;

import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.consolemodel.deployment.DeploymentDraft;
import org.domeos.framework.api.consolemodel.deployment.EnvDraft;
import org.domeos.framework.api.consolemodel.deployment.VersionString;
import org.domeos.framework.api.model.deployment.Policy;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.loadBalancer.LoadBalancer;

/**
 * Created by KaiRen on 2016/11/7.
 */
public interface DeployResourceHandler<T> {

    T build(Version version, List<LoadBalancer> loadBalancers, List<EnvDraft> extraEnvs);

    T create(Version version, List<EnvDraft> extraEnvs) throws K8sDriverException;

    void delete() throws K8sDriverException;

    T scaleUp(Version version, int replicas) throws K8sDriverException;

    T scaleDown(Version version, int replicas) throws K8sDriverException;

    T update(Version version, List<LoadBalancer> loadBalancers,
            List<EnvDraft> extraEnvs, Policy policy, long eventId, int targetVersion) throws K8sDriverException;
   
    T rollback(Version version, List<LoadBalancer> loadBalancers,
            List<EnvDraft> extraEnvs, Policy policy, long eventId, int targetVersion) throws K8sDriverException;

    Boolean abortUpdateOrRollBack() throws K8sDriverException;

    void abortScales() throws K8sDriverException;

    T abort();

    void removeOtherDeploy(int versionId) throws K8sDriverException;

    VersionString getVersionString(DeploymentDraft deploymentDraft);

    VersionString getVersionString(Version version, List<LoadBalancer> loadBalancers, List<EnvDraft> extraEnvs);

    List queryDesiredSnapshot() throws K8sDriverException;

}
