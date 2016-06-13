package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.Container;
import org.domeos.client.kubernetesclient.definitions.v1.LocalObjectReference;
import org.domeos.client.kubernetesclient.definitions.v1.Volume;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// PodSpec
// =======
// Description:
// 	PodSpec is a description of a pod.
// Variables:
// 	Name                         	Required	Schema                       	Default
// 	=============================	========	=============================	=======
// 	volumes                      	false   	v1.Volume array              	       
// 	containers                   	true    	v1.Container array           	       
// 	restartPolicy                	false   	string                       	       
// 	terminationGracePeriodSeconds	false   	integer (int64)              	       
// 	activeDeadlineSeconds        	false   	integer (int64)              	       
// 	dnsPolicy                    	false   	string                       	       
// 	nodeSelector                 	false   	any                          	       
// 	serviceAccountName           	false   	string                       	       
// 	serviceAccount               	false   	string                       	       
// 	nodeName                     	false   	string                       	       
// 	hostNetwork                  	false   	boolean                      	false  
// 	hostPID                      	false   	boolean                      	false  
// 	hostIPC                      	false   	boolean                      	false  
// 	imagePullSecrets             	false   	v1.LocalObjectReference array	       

public class PodSpec {
	// List of volumes that can be mounted by containers belonging to the pod.
	// More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html
	private Volume[] volumes;

	// List of containers belonging to the pod. Containers cannot currently
	// be added or removed. There must be at least one container in a Pod. Cannot
	// be updated. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/containers.html
	private Container[] containers;

	// Restart policy for all containers within the pod. One of Always,
	// OnFailure, Never. Default to Always. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/pod-states.html#restartpolicy
	private String restartPolicy;

	// Optional duration in seconds the pod needs to terminate gracefully.
	// May be decreased in delete request. Value must be non-negative
	// integer. The value zero indicates delete immediately. If this value is
	// nil, the default grace period will be used instead. The grace period is
	// the duration in seconds after the processes running in the pod are sent a
	// termination signal and the time when the processes are forcibly halted
	// with a kill signal. Set this value longer than the expected cleanup time
	// for your process. Defaults to 30 seconds.
	private long terminationGracePeriodSeconds;

	// Optional duration in seconds the pod may be active on the node relative
	// to StartTime before the system will actively try to mark it failed and
	// kill associated containers. Value must be a positive integer.
	private long activeDeadlineSeconds;

	// Set DNS policy for containers within the pod. One of ClusterFirst or
	// Default . Defaults to "ClusterFirst".
	private String dnsPolicy;

	// NodeSelector is a selector which must be true for the pod to fit on a node.
	// Selector which must match a node’s labels for the pod to be scheduled on
	// that node. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/node-selection/README.html
	private Map<String, String> nodeSelector;

	// ServiceAccountName is the name of the ServiceAccount to use to run this
	// pod. More info:
	// http://kubernetes.io/v1.1/docs/design/service_accounts.html
	private String serviceAccountName;

	// DeprecatedServiceAccount is a depreciated alias for
	// ServiceAccountName. Deprecated: Use serviceAccountName instead.
	private String serviceAccount;

	// NodeName is a request to schedule this pod onto a specific node. If it is
	// non-empty, the scheduler simply schedules this pod onto that node,
	// assuming that it fits resource requirements.
	private String nodeName;

	// Host networking requested for this pod. Use the host’s network
	// namespace. If this option is set, the ports that will be used must be
	// specified. Default to false.
	private boolean hostNetwork;

	// Use the host’s pid namespace. Optional: Default to false.
	private boolean hostPID;

	// Use the host’s ipc namespace. Optional: Default to false.
	private boolean hostIPC;

	// ImagePullSecrets is an optional list of references to secrets in the
	// same namespace to use for pulling any of the images used by this PodSpec.
	// If specified, these secrets will be passed to individual puller
	// implementations for them to use. For example, in the case of docker,
	// only DockerConfig type secrets are honored. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/images.html#specifying-imagepullsecrets-on-a-pod
	private LocalObjectReference[] imagePullSecrets;

	public PodSpec() {
	}
	// for volumes
	public Volume[] getVolumes() {
		return volumes;
	}
	public void setVolumes(Volume[] volumes) {
		this.volumes = volumes;
	}
	public PodSpec putVolumes(Volume[] volumes) {
		this.volumes = volumes;
		return this;
	}

	// for containers
	public Container[] getContainers() {
		return containers;
	}
	public void setContainers(Container[] containers) {
		this.containers = containers;
	}
	public PodSpec putContainers(Container[] containers) {
		this.containers = containers;
		return this;
	}

	// for restartPolicy
	public String getRestartPolicy() {
		return restartPolicy;
	}
	public void setRestartPolicy(String restartPolicy) {
		this.restartPolicy = restartPolicy;
	}
	public PodSpec putRestartPolicy(String restartPolicy) {
		this.restartPolicy = restartPolicy;
		return this;
	}

	// for terminationGracePeriodSeconds
	public long getTerminationGracePeriodSeconds() {
		return terminationGracePeriodSeconds;
	}
	public void setTerminationGracePeriodSeconds(long terminationGracePeriodSeconds) {
		this.terminationGracePeriodSeconds = terminationGracePeriodSeconds;
	}
	public PodSpec putTerminationGracePeriodSeconds(long terminationGracePeriodSeconds) {
		this.terminationGracePeriodSeconds = terminationGracePeriodSeconds;
		return this;
	}

	// for activeDeadlineSeconds
	public long getActiveDeadlineSeconds() {
		return activeDeadlineSeconds;
	}
	public void setActiveDeadlineSeconds(long activeDeadlineSeconds) {
		this.activeDeadlineSeconds = activeDeadlineSeconds;
	}
	public PodSpec putActiveDeadlineSeconds(long activeDeadlineSeconds) {
		this.activeDeadlineSeconds = activeDeadlineSeconds;
		return this;
	}

	// for dnsPolicy
	public String getDnsPolicy() {
		return dnsPolicy;
	}
	public void setDnsPolicy(String dnsPolicy) {
		this.dnsPolicy = dnsPolicy;
	}
	public PodSpec putDnsPolicy(String dnsPolicy) {
		this.dnsPolicy = dnsPolicy;
		return this;
	}

	// for nodeSelector
	public Map<String, String> getNodeSelector() {
		return nodeSelector;
	}
	public void setNodeSelector(Map<String, String> nodeSelector) {
		this.nodeSelector = nodeSelector;
	}
	public PodSpec putNodeSelector(Map<String, String> nodeSelector) {
		this.nodeSelector = nodeSelector;
		return this;
	}

	// for serviceAccountName
	public String getServiceAccountName() {
		return serviceAccountName;
	}
	public void setServiceAccountName(String serviceAccountName) {
		this.serviceAccountName = serviceAccountName;
	}
	public PodSpec putServiceAccountName(String serviceAccountName) {
		this.serviceAccountName = serviceAccountName;
		return this;
	}

	// for serviceAccount
	public String getServiceAccount() {
		return serviceAccount;
	}
	public void setServiceAccount(String serviceAccount) {
		this.serviceAccount = serviceAccount;
	}
	public PodSpec putServiceAccount(String serviceAccount) {
		this.serviceAccount = serviceAccount;
		return this;
	}

	// for nodeName
	public String getNodeName() {
		return nodeName;
	}
	public void setNodeName(String nodeName) {
		this.nodeName = nodeName;
	}
	public PodSpec putNodeName(String nodeName) {
		this.nodeName = nodeName;
		return this;
	}

	// for hostNetwork
	public boolean getHostNetwork() {
		return hostNetwork;
	}
	public void setHostNetwork(boolean hostNetwork) {
		this.hostNetwork = hostNetwork;
	}
	public PodSpec putHostNetwork(boolean hostNetwork) {
		this.hostNetwork = hostNetwork;
		return this;
	}

	// for hostPID
	public boolean getHostPID() {
		return hostPID;
	}
	public void setHostPID(boolean hostPID) {
		this.hostPID = hostPID;
	}
	public PodSpec putHostPID(boolean hostPID) {
		this.hostPID = hostPID;
		return this;
	}

	// for hostIPC
	public boolean getHostIPC() {
		return hostIPC;
	}
	public void setHostIPC(boolean hostIPC) {
		this.hostIPC = hostIPC;
	}
	public PodSpec putHostIPC(boolean hostIPC) {
		this.hostIPC = hostIPC;
		return this;
	}

	// for imagePullSecrets
	public LocalObjectReference[] getImagePullSecrets() {
		return imagePullSecrets;
	}
	public void setImagePullSecrets(LocalObjectReference[] imagePullSecrets) {
		this.imagePullSecrets = imagePullSecrets;
	}
	public PodSpec putImagePullSecrets(LocalObjectReference[] imagePullSecrets) {
		this.imagePullSecrets = imagePullSecrets;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (volumes != null) {
			tmpStr += firstLinePrefix + "volumes:";
			for (Volume ele : volumes) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		if (containers != null) {
			tmpStr += "\n" + prefix + "containers:";
			for (Container ele : containers) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		if (restartPolicy != null) {
			tmpStr += "\n" + prefix + "restartPolicy: " + restartPolicy;
		}
		tmpStr += "\n" + prefix + "terminationGracePeriodSeconds: " + terminationGracePeriodSeconds;
		tmpStr += "\n" + prefix + "activeDeadlineSeconds: " + activeDeadlineSeconds;
		if (dnsPolicy != null) {
			tmpStr += "\n" + prefix + "dnsPolicy: " + dnsPolicy;
		}
		if (nodeSelector != null) {
			tmpStr += "\n" + prefix + "nodeSelector:";
			Iterator<Map.Entry<String, String>> iter = nodeSelector.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, String> entry = iter.next();
				tmpStr += "\n" + prefix + unitPrefix + entry.getKey() + ": " + entry.getValue();
			}
		}
		if (serviceAccountName != null) {
			tmpStr += "\n" + prefix + "serviceAccountName: " + serviceAccountName;
		}
		if (serviceAccount != null) {
			tmpStr += "\n" + prefix + "serviceAccount: " + serviceAccount;
		}
		if (nodeName != null) {
			tmpStr += "\n" + prefix + "nodeName: " + nodeName;
		}
		tmpStr += "\n" + prefix + "hostNetwork: " + hostNetwork;
		tmpStr += "\n" + prefix + "hostPID: " + hostPID;
		tmpStr += "\n" + prefix + "hostIPC: " + hostIPC;
		if (imagePullSecrets != null) {
			tmpStr += "\n" + prefix + "imagePullSecrets:";
			for (LocalObjectReference ele : imagePullSecrets) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}