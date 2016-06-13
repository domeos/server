package org.domeos.client.kubernetesclient.definitions.unversioned;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// StatusCause
// ===========
// Description:
// 	StatusCause provides more information about an api.Status failure,
// 	including cases when multiple errors are encountered.
// Variables:
// 	Name   	Required	Schema	Default
// 	=======	========	======	=======
// 	reason 	false   	string	       
// 	message	false   	string	       
// 	field  	false   	string	       

public class StatusCause {
	// A machine-readable description of the cause of the error. If this value
	// is empty there is no information available.
	private String reason;

	// A human-readable description of the cause of the error. This field may
	// be presented as-is to a reader.
	private String message;

	// The field of the resource that has caused this error, as named by its JSON
	// serialization. May include dot and postfix notation for nested
	// attributes. Arrays are zero-indexed. Fields may appear more than once
	// in an array of causes due to fields having multiple errors. Optional.
	// Examples: "name" - the field "name" on the current resource
	// "items[0].name" - the field "name" on the first array entry in "items"
	private String field;

	public StatusCause() {
	}
	// for reason
	public String getReason() {
		return reason;
	}
	public void setReason(String reason) {
		this.reason = reason;
	}
	public StatusCause putReason(String reason) {
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
	public StatusCause putMessage(String message) {
		this.message = message;
		return this;
	}

	// for field
	public String getField() {
		return field;
	}
	public void setField(String field) {
		this.field = field;
	}
	public StatusCause putField(String field) {
		this.field = field;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (reason != null) {
			tmpStr += firstLinePrefix + "reason: " + reason;
		}
		if (message != null) {
			tmpStr += "\n" + prefix + "message: " + message;
		}
		if (field != null) {
			tmpStr += "\n" + prefix + "field: " + field;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}