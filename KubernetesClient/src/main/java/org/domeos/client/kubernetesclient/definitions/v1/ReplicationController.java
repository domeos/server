package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ObjectMeta;
import org.domeos.client.kubernetesclient.definitions.v1.ReplicationControllerStatus;
import org.domeos.client.kubernetesclient.definitions.v1.ReplicationControllerSpec;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;
import org.domeos.client.kubernetesclient.KubeAPIVersion;

// ReplicationController
// =====================
// Description:
// 	ReplicationController represents the configuration of a
// 	replication controller.
// Variables:
// 	Name      	Required	Schema                        	Default
// 	==========	========	==============================	=======
// 	kind      	false   	string                        	       
// 	apiVersion	false   	string                        	       
// 	metadata  	false   	v1.ObjectMeta                 	       
// 	spec      	false   	v1.ReplicationControllerSpec  	       
// 	status    	false   	v1.ReplicationControllerStatus	       

public class ReplicationController {
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

	// If the Labels of a ReplicationController are empty, they are defaulted
	// to be the same as the Pod(s) that the replication controller manages.
	// Standard object’s metadata. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#metadata
	private ObjectMeta metadata;

	// Spec defines the specification of the desired behavior of the
	// replication controller. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#spec-and-status
	private ReplicationControllerSpec spec;

	// Status is the most recently observed status of the replication
	// controller. This data may be out of date by some window of time.
	// Populated by the system. Read-only. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#spec-and-status
	private ReplicationControllerStatus status;

	public ReplicationController() {
		kind = "ReplicationController";
		apiVersion = KubeAPIVersion.v1.toString();
	}
	// for kind
	public String getKind() {
		return kind;
	}
	public void setKind(String kind) {
		this.kind = kind;
	}
	public ReplicationController putKind(String kind) {
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
	public ReplicationController putApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
		return this;
	}

	// for metadata
	public ObjectMeta getMetadata() {
		return metadata;
	}
	public void setMetadata(ObjectMeta metadata) {
		this.metadata = metadata;
	}
	public ReplicationController putMetadata(ObjectMeta metadata) {
		this.metadata = metadata;
		return this;
	}

	// for spec
	public ReplicationControllerSpec getSpec() {
		return spec;
	}
	public void setSpec(ReplicationControllerSpec spec) {
		this.spec = spec;
	}
	public ReplicationController putSpec(ReplicationControllerSpec spec) {
		this.spec = spec;
		return this;
	}

	// for status
	public ReplicationControllerStatus getStatus() {
		return status;
	}
	public void setStatus(ReplicationControllerStatus status) {
		this.status = status;
	}
	public ReplicationController putStatus(ReplicationControllerStatus status) {
		this.status = status;
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
		if (spec != null) {
			tmpStr += "\n" + prefix + "spec: ";
			tmpStr += "\n" + spec.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (status != null) {
			tmpStr += "\n" + prefix + "status: ";
			tmpStr += "\n" + status.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}