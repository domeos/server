package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ObjectMeta;
import org.domeos.client.kubernetesclient.definitions.v1.ObjectReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;
import org.domeos.client.kubernetesclient.KubeAPIVersion;

// Binding
// =======
// Description:
// 	Binding ties one object to another. For example, a pod is bound to a node
// 	by a scheduler.
// Variables:
// 	Name      	Required	Schema            	Default
// 	==========	========	==================	=======
// 	kind      	false   	string            	       
// 	apiVersion	false   	string            	       
// 	metadata  	false   	v1.ObjectMeta     	       
// 	target    	true    	v1.ObjectReference	       

public class Binding {
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

	// The target object that you want to bind to the standard object.
	private ObjectReference target;

	public Binding() {
		kind = "Binding";
		apiVersion = KubeAPIVersion.v1.toString();
	}
	// for kind
	public String getKind() {
		return kind;
	}
	public void setKind(String kind) {
		this.kind = kind;
	}
	public Binding putKind(String kind) {
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
	public Binding putApiVersion(String apiVersion) {
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
	public Binding putMetadata(ObjectMeta metadata) {
		this.metadata = metadata;
		return this;
	}

	// for target
	public ObjectReference getTarget() {
		return target;
	}
	public void setTarget(ObjectReference target) {
		this.target = target;
	}
	public Binding putTarget(ObjectReference target) {
		this.target = target;
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
		if (target != null) {
			tmpStr += "\n" + prefix + "target: ";
			tmpStr += "\n" + target.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}