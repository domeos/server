package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ObjectMeta;
import org.domeos.client.kubernetesclient.definitions.v1.PersistentVolumeClaimStatus;
import org.domeos.client.kubernetesclient.definitions.v1.PersistentVolumeClaimSpec;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;
import org.domeos.client.kubernetesclient.KubeAPIVersion;

// PersistentVolumeClaim
// =====================
// Description:
// 	PersistentVolumeClaim is a user’s request for and claim to a
// 	persistent volume
// Variables:
// 	Name      	Required	Schema                        	Default
// 	==========	========	==============================	=======
// 	kind      	false   	string                        	       
// 	apiVersion	false   	string                        	       
// 	metadata  	false   	v1.ObjectMeta                 	       
// 	spec      	false   	v1.PersistentVolumeClaimSpec  	       
// 	status    	false   	v1.PersistentVolumeClaimStatus	       

public class PersistentVolumeClaim {
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

	// Spec defines the desired characteristics of a volume requested by a pod
	// author. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/persistent-volumes.html#persistentvolumeclaims
	private PersistentVolumeClaimSpec spec;

	// Status represents the current information/status of a persistent
	// volume claim. Read-only. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/persistent-volumes.html#persistentvolumeclaims
	private PersistentVolumeClaimStatus status;

	public PersistentVolumeClaim() {
		kind = "PersistentVolumeClaim";
		apiVersion = KubeAPIVersion.v1.toString();
	}
	// for kind
	public String getKind() {
		return kind;
	}
	public void setKind(String kind) {
		this.kind = kind;
	}
	public PersistentVolumeClaim putKind(String kind) {
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
	public PersistentVolumeClaim putApiVersion(String apiVersion) {
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
	public PersistentVolumeClaim putMetadata(ObjectMeta metadata) {
		this.metadata = metadata;
		return this;
	}

	// for spec
	public PersistentVolumeClaimSpec getSpec() {
		return spec;
	}
	public void setSpec(PersistentVolumeClaimSpec spec) {
		this.spec = spec;
	}
	public PersistentVolumeClaim putSpec(PersistentVolumeClaimSpec spec) {
		this.spec = spec;
		return this;
	}

	// for status
	public PersistentVolumeClaimStatus getStatus() {
		return status;
	}
	public void setStatus(PersistentVolumeClaimStatus status) {
		this.status = status;
	}
	public PersistentVolumeClaim putStatus(PersistentVolumeClaimStatus status) {
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