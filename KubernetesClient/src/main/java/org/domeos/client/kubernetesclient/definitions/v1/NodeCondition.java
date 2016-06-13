package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// NodeCondition
// =============
// Description:
// 	NodeCondition contains condition infromation for a node.
// Variables:
// 	Name              	Required	Schema	Default
// 	==================	========	======	=======
// 	type              	true    	string	       
// 	status            	true    	string	       
// 	lastHeartbeatTime 	false   	string	       
// 	lastTransitionTime	false   	string	       
// 	reason            	false   	string	       
// 	message           	false   	string	       

public class NodeCondition {
	// Type of node condition, currently only Ready.
	private String type;

	// Status of the condition, one of True, False, Unknown.
	private String status;

	// Last time we got an update on a given condition.
	private String lastHeartbeatTime;

	// Last time the condition transit from one status to another.
	private String lastTransitionTime;

	// (brief) reason for the condition’s last transition.
	private String reason;

	// Human readable message indicating details about last transition.
	private String message;

	public NodeCondition() {
	}
	// for type
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public NodeCondition putType(String type) {
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
	public NodeCondition putStatus(String status) {
		this.status = status;
		return this;
	}

	// for lastHeartbeatTime
	public String getLastHeartbeatTime() {
		return lastHeartbeatTime;
	}
	public void setLastHeartbeatTime(String lastHeartbeatTime) {
		this.lastHeartbeatTime = lastHeartbeatTime;
	}
	public NodeCondition putLastHeartbeatTime(String lastHeartbeatTime) {
		this.lastHeartbeatTime = lastHeartbeatTime;
		return this;
	}

	// for lastTransitionTime
	public String getLastTransitionTime() {
		return lastTransitionTime;
	}
	public void setLastTransitionTime(String lastTransitionTime) {
		this.lastTransitionTime = lastTransitionTime;
	}
	public NodeCondition putLastTransitionTime(String lastTransitionTime) {
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
	public NodeCondition putReason(String reason) {
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
	public NodeCondition putMessage(String message) {
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
		if (lastHeartbeatTime != null) {
			tmpStr += "\n" + prefix + "lastHeartbeatTime: " + lastHeartbeatTime;
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