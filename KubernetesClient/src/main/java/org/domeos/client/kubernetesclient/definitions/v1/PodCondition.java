package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// PodCondition
// ============
// Description:
// 	PodCondition contains details for the current condition of this pod.
// Variables:
// 	Name              	Required	Schema	Default
// 	==================	========	======	=======
// 	type              	true    	string	       
// 	status            	true    	string	       
// 	lastProbeTime     	false   	string	       
// 	lastTransitionTime	false   	string	       
// 	reason            	false   	string	       
// 	message           	false   	string	       

public class PodCondition {
	// Type is the type of the condition. Currently only Ready. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/pod-states.html#pod-conditions
	private String type;

	// Status is the status of the condition. Can be True, False, Unknown. More
	// info:
	// http://kubernetes.io/v1.1/docs/user-guide/pod-states.html#pod-conditions
	private String status;

	// Last time we probed the condition.
	private String lastProbeTime;

	// Last time the condition transitioned from one status to another.
	private String lastTransitionTime;

	// Unique, one-word, CamelCase reason for the condition’s last
	// transition.
	private String reason;

	// Human-readable message indicating details about last transition.
	private String message;

	public PodCondition() {
	}
	// for type
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public PodCondition putType(String type) {
		this.type = type;
		return this;
	}

	// for status
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public PodCondition putStatus(String status) {
		this.status = status;
		return this;
	}

	// for lastProbeTime
	public String getLastProbeTime() {
		return lastProbeTime;
	}
	public void setLastProbeTime(String lastProbeTime) {
		this.lastProbeTime = lastProbeTime;
	}
	public PodCondition putLastProbeTime(String lastProbeTime) {
		this.lastProbeTime = lastProbeTime;
		return this;
	}

	// for lastTransitionTime
	public String getLastTransitionTime() {
		return lastTransitionTime;
	}
	public void setLastTransitionTime(String lastTransitionTime) {
		this.lastTransitionTime = lastTransitionTime;
	}
	public PodCondition putLastTransitionTime(String lastTransitionTime) {
		this.lastTransitionTime = lastTransitionTime;
		return this;
	}

	// for reason
	public String getReason() {
		return reason;
	}
	public void setReason(String reason) {
		this.reason = reason;
	}
	public PodCondition putReason(String reason) {
		this.reason = reason;
		return this;
	}

	// for message
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public PodCondition putMessage(String message) {
		this.message = message;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (type != null) {
			tmpStr += firstLinePrefix + "type: " + type;
		}
		if (status != null) {
			tmpStr += "\n" + prefix + "status: " + status;
		}
		if (lastProbeTime != null) {
			tmpStr += "\n" + prefix + "lastProbeTime: " + lastProbeTime;
		}
		if (lastTransitionTime != null) {
			tmpStr += "\n" + prefix + "lastTransitionTime: " + lastTransitionTime;
		}
		if (reason != null) {
			tmpStr += "\n" + prefix + "reason: " + reason;
		}
		if (message != null) {
			tmpStr += "\n" + prefix + "message: " + message;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}