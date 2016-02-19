package org.domeos.client.kubernetesclient.definitions.unversioned;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.unversioned.ListMeta;
import org.domeos.client.kubernetesclient.definitions.unversioned.StatusDetails;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;
import org.domeos.client.kubernetesclient.KubeAPIVersion;

// Status
// ======
// Description:
// 	Status is a return value for calls that don’t return other objects.
// Variables:
// 	Name      	Required	Schema                   	Default
// 	==========	========	=========================	=======
// 	kind      	false   	string                   	       
// 	apiVersion	false   	string                   	       
// 	metadata  	false   	unversioned.ListMeta     	       
// 	status    	false   	string                   	       
// 	message   	false   	string                   	       
// 	reason    	false   	string                   	       
// 	details   	false   	unversioned.StatusDetails	       
// 	code      	false   	integer (int32)          	       

public class Status {
	// Kind is a string value representing the REST resource this object
	// represents. Servers may infer this from the endpoint the client
	// submits requests to. Cannot be updated. In CamelCase. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#types-kinds
	private String kind;

	// APIVersion defines the versioned schema of this representation of an
	// object. Servers should convert recognized schemas to the latest
	// internal value, and may reject unrecognized values. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#resources
	private String apiVersion;

	// Standard list metadata. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#types-kinds
	private ListMeta metadata;

	// Status of the operation. One of: "Success" or "Failure". More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#spec-and-status
	private String status;

	// A human-readable description of the status of this operation.
	private String message;

	// A machine-readable description of why this operation is in the
	// "Failure" status. If this value is empty there is no information
	// available. A Reason clarifies an HTTP status code but does not override
	// it.
	private String reason;

	// Extended data associated with the reason. Each reason may define its
	// own extended details. This field is optional and the data returned is
	// not guaranteed to conform to any schema except that defined by the
	// reason type.
	private StatusDetails details;

	// Suggested HTTP return code for this status, 0 if not set.
	private int code;

	public Status() {
		kind = "Status";
		apiVersion = KubeAPIVersion.unversioned.toString();
	}
	// for kind
	public String getKind() {
		return kind;
	}
	public void setKind(String kind) {
		this.kind = kind;
	}
	public Status putKind(String kind) {
		this.kind = kind;
		return this;
	}

	// for apiVersion
	public String getApiVersion() {
		return apiVersion;
	}
	public void setApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
	}
	public Status putApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
		return this;
	}

	// for metadata
	public ListMeta getMetadata() {
		return metadata;
	}
	public void setMetadata(ListMeta metadata) {
		this.metadata = metadata;
	}
	public Status putMetadata(ListMeta metadata) {
		this.metadata = metadata;
		return this;
	}

	// for status
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public Status putStatus(String status) {
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
	public Status putMessage(String message) {
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
	public Status putReason(String reason) {
		this.reason = reason;
		return this;
	}

	// for details
	public StatusDetails getDetails() {
		return details;
	}
	public void setDetails(StatusDetails details) {
		this.details = details;
	}
	public Status putDetails(StatusDetails details) {
		this.details = details;
		return this;
	}

	// for code
	public int getCode() {
		return code;
	}
	public void setCode(int code) {
		this.code = code;
	}
	public Status putCode(int code) {
		this.code = code;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (kind != null) {
			tmpStr += firstLinePrefix + "kind: " + kind;
		}
		if (apiVersion != null) {
			tmpStr += "\n" + prefix + "apiVersion: " + apiVersion;
		}
		if (metadata != null) {
			tmpStr += "\n" + prefix + "metadata: ";
			tmpStr += "\n" + metadata.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (status != null) {
			tmpStr += "\n" + prefix + "status: " + status;
		}
		if (message != null) {
			tmpStr += "\n" + prefix + "message: " + message;
		}
		if (reason != null) {
			tmpStr += "\n" + prefix + "reason: " + reason;
		}
		if (details != null) {
			tmpStr += "\n" + prefix + "details: ";
			tmpStr += "\n" + details.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		tmpStr += "\n" + prefix + "code: " + code;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}