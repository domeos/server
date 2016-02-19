package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ObjectMeta;
import org.domeos.client.kubernetesclient.definitions.v1.LimitRangeSpec;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;
import org.domeos.client.kubernetesclient.KubeAPIVersion;

// LimitRange
// ==========
// Description:
// 	LimitRange sets resource usage limits for each kind of resource in a
// 	Namespace.
// Variables:
// 	Name      	Required	Schema           	Default
// 	==========	========	=================	=======
// 	kind      	false   	string           	       
// 	apiVersion	false   	string           	       
// 	metadata  	false   	v1.ObjectMeta    	       
// 	spec      	false   	v1.LimitRangeSpec	       

public class LimitRange {
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

	// Standard object’s metadata. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#metadata
	private ObjectMeta metadata;

	// Spec defines the limits enforced. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#spec-and-status
	private LimitRangeSpec spec;

	public LimitRange() {
		kind = "LimitRange";
		apiVersion = KubeAPIVersion.v1.toString();
	}
	// for kind
	public String getKind() {
		return kind;
	}
	public void setKind(String kind) {
		this.kind = kind;
	}
	public LimitRange putKind(String kind) {
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
	public LimitRange putApiVersion(String apiVersion) {
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
	public LimitRange putMetadata(ObjectMeta metadata) {
		this.metadata = metadata;
		return this;
	}

	// for spec
	public LimitRangeSpec getSpec() {
		return spec;
	}
	public void setSpec(LimitRangeSpec spec) {
		this.spec = spec;
	}
	public LimitRange putSpec(LimitRangeSpec spec) {
		this.spec = spec;
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
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}