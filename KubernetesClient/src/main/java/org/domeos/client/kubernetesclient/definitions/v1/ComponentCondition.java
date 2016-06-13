package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ComponentCondition
// ==================
// Description:
// 	Information about the condition of a component.
// Variables:
// 	Name   	Required	Schema	Default
// 	=======	========	======	=======
// 	type   	true    	string	       
// 	status 	true    	string	       
// 	message	false   	string	       
// 	error  	false   	string	       

public class ComponentCondition {
	// Type of condition for a component. Valid value: "Healthy"
	private String type;

	// Status of the condition for a component. Valid values for "Healthy":
	// "True", "False", or "Unknown".
	private String status;

	// Message about the condition for a component. For example, information
	// about a health check.
	private String message;

	// Condition error code for a component. For example, a health check error
	// code.
	private String error;

	public ComponentCondition() {
	}
	// for type
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public ComponentCondition putType(String type) {
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
	public ComponentCondition putStatus(String status) {
		this.status = status;
		return this;
	}

	// for message
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public ComponentCondition putMessage(String message) {
		this.message = message;
		return this;
	}

	// for error
	public String getError() {
		return error;
	}
	public void setError(String error) {
		this.error = error;
	}
	public ComponentCondition putError(String error) {
		this.error = error;
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
		if (message != null) {
			tmpStr += "\n" + prefix + "message: " + message;
		}
		if (error != null) {
			tmpStr += "\n" + prefix + "error: " + error;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}