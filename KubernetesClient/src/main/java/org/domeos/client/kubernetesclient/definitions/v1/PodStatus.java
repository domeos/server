package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ContainerStatus;
import org.domeos.client.kubernetesclient.definitions.v1.PodCondition;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// PodStatus
// =========
// Description:
// 	PodStatus represents information about the status of a pod. Status may
// 	trail the actual state of a system.
// Variables:
// 	Name             	Required	Schema                  	Default
// 	=================	========	========================	=======
// 	phase            	false   	string                  	       
// 	conditions       	false   	v1.PodCondition array   	       
// 	message          	false   	string                  	       
// 	reason           	false   	string                  	       
// 	hostIP           	false   	string                  	       
// 	podIP            	false   	string                  	       
// 	startTime        	false   	string                  	       
// 	containerStatuses	false   	v1.ContainerStatus array	       

public class PodStatus {
	// Current condition of the pod. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/pod-states.html#pod-phase
	private String phase;

	// Current service state of pod. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/pod-states.html#pod-conditions
	private PodCondition[] conditions;

	// A human readable message indicating details about why the pod is in this
	// condition.
	private String message;

	// A brief CamelCase message indicating details about why the pod is in
	// this state. e.g. OutOfDisk
	private String reason;

	// IP address of the host to which the pod is assigned. Empty if not yet
	// scheduled.
	private String hostIP;

	// IP address allocated to the pod. Routable at least within the cluster.
	// Empty if not yet allocated.
	private String podIP;

	// RFC 3339 date and time at which the object was acknowledged by the
	// Kubelet. This is before the Kubelet pulled the container image(s) for
	// the pod.
	private String startTime;

	// The list has one entry per container in the manifest. Each entry is
	// currently the output of docker inspect . More info:
	// http://kubernetes.io/v1.1/docs/user-guide/pod-states.html#container-statuses
	private ContainerStatus[] containerStatuses;

	public PodStatus() {
	}
	// for phase
	public String getPhase() {
		return phase;
	}
	public void setPhase(String phase) {
		this.phase = phase;
	}
	public PodStatus putPhase(String phase) {
		this.phase = phase;
		return this;
	}

	// for conditions
	public PodCondition[] getConditions() {
		return conditions;
	}
	public void setConditions(PodCondition[] conditions) {
		this.conditions = conditions;
	}
	public PodStatus putConditions(PodCondition[] conditions) {
		this.conditions = conditions;
		return this;
	}

	// for message
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public PodStatus putMessage(String message) {
		this.message = message;
		return this;
	}

	// for reason
	public String getReason() {
		return reason;
	}
	public void setReason(String reason) {
		this.reason = reason;
	}
	public PodStatus putReason(String reason) {
		this.reason = reason;
		return this;
	}

	// for hostIP
	public String getHostIP() {
		return hostIP;
	}
	public void setHostIP(String hostIP) {
		this.hostIP = hostIP;
	}
	public PodStatus putHostIP(String hostIP) {
		this.hostIP = hostIP;
		return this;
	}

	// for podIP
	public String getPodIP() {
		return podIP;
	}
	public void setPodIP(String podIP) {
		this.podIP = podIP;
	}
	public PodStatus putPodIP(String podIP) {
		this.podIP = podIP;
		return this;
	}

	// for startTime
	public String getStartTime() {
		return startTime;
	}
	public void setStartTime(String startTime) {
		this.startTime = startTime;
	}
	public PodStatus putStartTime(String startTime) {
		this.startTime = startTime;
		return this;
	}

	// for containerStatuses
	public ContainerStatus[] getContainerStatuses() {
		return containerStatuses;
	}
	public void setContainerStatuses(ContainerStatus[] containerStatuses) {
		this.containerStatuses = containerStatuses;
	}
	public PodStatus putContainerStatuses(ContainerStatus[] containerStatuses) {
		this.containerStatuses = containerStatuses;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (phase != null) {
			tmpStr += firstLinePrefix + "phase: " + phase;
		}
		if (conditions != null) {
			tmpStr += "\n" + prefix + "conditions:";
			for (PodCondition ele : conditions) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		if (message != null) {
			tmpStr += "\n" + prefix + "message: " + message;
		}
		if (reason != null) {
			tmpStr += "\n" + prefix + "reason: " + reason;
		}
		if (hostIP != null) {
			tmpStr += "\n" + prefix + "hostIP: " + hostIP;
		}
		if (podIP != null) {
			tmpStr += "\n" + prefix + "podIP: " + podIP;
		}
		if (startTime != null) {
			tmpStr += "\n" + prefix + "startTime: " + startTime;
		}
		if (containerStatuses != null) {
			tmpStr += "\n" + prefix + "containerStatuses:";
			for (ContainerStatus ele : containerStatuses) {
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