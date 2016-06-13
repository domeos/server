package org.domeos.client.kubernetesclient.definitions.unversioned;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.unversioned.StatusCause;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// StatusDetails
// =============
// Description:
// 	StatusDetails is a set of additional properties that MAY be set by the
// 	server to provide additional information about a response. The Reason
// 	field of a Status object defines what attributes will be set. Clients
// 	must ignore fields that do not match the defined type of each attribute,
// 	and should assume that any attribute may be empty, invalid, or under
// 	defined.
// Variables:
// 	Name             	Required	Schema                       	Default
// 	=================	========	=============================	=======
// 	name             	false   	string                       	       
// 	kind             	false   	string                       	       
// 	causes           	false   	unversioned.StatusCause array	       
// 	retryAfterSeconds	false   	integer (int32)              	       

public class StatusDetails {
	// The name attribute of the resource associated with the status
	// StatusReason (when there is a single name which can be described).
	private String name;

	// The kind attribute of the resource associated with the status
	// StatusReason. On some operations may differ from the requested
	// resource Kind. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#types-kinds
	private String kind;

	// The Causes array includes more details associated with the
	// StatusReason failure. Not all StatusReasons may provide detailed
	// causes.
	private StatusCause[] causes;

	// If specified, the time in seconds before the operation should be
	// retried.
	private int retryAfterSeconds;

	public StatusDetails() {
		kind = "StatusDetails";
	}
	// for name
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public StatusDetails putName(String name) {
		this.name = name;
		return this;
	}

	// for kind
	public String getKind() {
		return kind;
	}
	public void setKind(String kind) {
		this.kind = kind;
	}
	public StatusDetails putKind(String kind) {
		this.kind = kind;
		return this;
	}

	// for causes
	public StatusCause[] getCauses() {
		return causes;
	}
	public void setCauses(StatusCause[] causes) {
		this.causes = causes;
	}
	public StatusDetails putCauses(StatusCause[] causes) {
		this.causes = causes;
		return this;
	}

	// for retryAfterSeconds
	public int getRetryAfterSeconds() {
		return retryAfterSeconds;
	}
	public void setRetryAfterSeconds(int retryAfterSeconds) {
		this.retryAfterSeconds = retryAfterSeconds;
	}
	public StatusDetails putRetryAfterSeconds(int retryAfterSeconds) {
		this.retryAfterSeconds = retryAfterSeconds;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (name != null) {
			tmpStr += firstLinePrefix + "name: " + name;
		}
		if (kind != null) {
			tmpStr += "\n" + prefix + "kind: " + kind;
		}
		if (causes != null) {
			tmpStr += "\n" + prefix + "causes:";
			for (StatusCause ele : causes) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		tmpStr += "\n" + prefix + "retryAfterSeconds: " + retryAfterSeconds;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}