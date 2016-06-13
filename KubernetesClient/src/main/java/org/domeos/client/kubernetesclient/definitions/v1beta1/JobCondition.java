package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// JobCondition
// ============
// Description:
// 	JobCondition describes current state of a job.
// Variables:
// 	Name              	Required	Schema	Default
// 	==================	========	======	=======
// 	type              	true    	string	       
// 	status            	true    	string	       
// 	lastProbeTime     	false   	string	       
// 	lastTransitionTime	false   	string	       
// 	reason            	false   	string	       
// 	message           	false   	string	       

public class JobCondition {
	// Type of job condition, currently only Complete.
	private String type;

	// Status of the condition, one of True, False, Unknown.
	private String status;

	// Last time the condition was checked.
	private String lastProbeTime;

	// Last time the condition transit from one status to another.
	private String lastTransitionTime;

	// (brief) reason for the condition’s last transition.
	private String reason;

	// Human readable message indicating details about last transition.
	private String message;

	public JobCondition() {
	}
	// for type
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public JobCondition putType(String type) {
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
	public JobCondition putStatus(String status) {
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
	public JobCondition putLastProbeTime(String lastProbeTime) {
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
	public JobCondition putLastTransitionTime(String lastTransitionTime) {
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
	public JobCondition putReason(String reason) {
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
	public JobCondition putMessage(String message) {
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