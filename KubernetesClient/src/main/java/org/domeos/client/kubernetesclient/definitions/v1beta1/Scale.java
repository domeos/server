package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ObjectMeta;
import org.domeos.client.kubernetesclient.definitions.v1beta1.ScaleSpec;
import org.domeos.client.kubernetesclient.definitions.v1beta1.ScaleStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;
import org.domeos.client.kubernetesclient.KubeAPIVersion;

// Scale
// =====
// Description:
// 	represents a scaling request for a resource.
// Variables:
// 	Name      	Required	Schema             	Default
// 	==========	========	===================	=======
// 	kind      	false   	string             	       
// 	apiVersion	false   	string             	       
// 	metadata  	false   	v1.ObjectMeta      	       
// 	spec      	false   	v1beta1.ScaleSpec  	       
// 	status    	false   	v1beta1.ScaleStatus	       

public class Scale {
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

	// Standard object metadata; More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#metadata
	// .
	private ObjectMeta metadata;

	// defines the behavior of the scale. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#spec-and-status
	// .
	private ScaleSpec spec;

	// current status of the scale. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#spec-and-status
	// . Read-only.
	private ScaleStatus status;

	public Scale() {
		kind = "Scale";
		apiVersion = KubeAPIVersion.v1beta1.toString();
	}
	// for kind
	public String getKind() {
		return kind;
	}
	public void setKind(String kind) {
		this.kind = kind;
	}
	public Scale putKind(String kind) {
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
	public Scale putApiVersion(String apiVersion) {
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
	public Scale putMetadata(ObjectMeta metadata) {
		this.metadata = metadata;
		return this;
	}

	// for spec
	public ScaleSpec getSpec() {
		return spec;
	}
	public void setSpec(ScaleSpec spec) {
		this.spec = spec;
	}
	public Scale putSpec(ScaleSpec spec) {
		this.spec = spec;
		return this;
	}

	// for status
	public ScaleStatus getStatus() {
		return status;
	}
	public void setStatus(ScaleStatus status) {
		this.status = status;
	}
	public Scale putStatus(ScaleStatus status) {
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