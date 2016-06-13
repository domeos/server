package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ObjectMeta;
import org.domeos.client.kubernetesclient.definitions.v1.LocalObjectReference;
import org.domeos.client.kubernetesclient.definitions.v1.ObjectReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;
import org.domeos.client.kubernetesclient.KubeAPIVersion;

// ServiceAccount
// ==============
// Description:
// 	ServiceAccount binds together: * a name, understood by users, and
// 	perhaps by peripheral systems, for an identity * a principal that can be
// 	authenticated and authorized * a set of secrets
// Variables:
// 	Name            	Required	Schema                       	Default
// 	================	========	=============================	=======
// 	kind            	false   	string                       	       
// 	apiVersion      	false   	string                       	       
// 	metadata        	false   	v1.ObjectMeta                	       
// 	secrets         	false   	v1.ObjectReference array     	       
// 	imagePullSecrets	false   	v1.LocalObjectReference array	       

public class ServiceAccount {
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

	// Secrets is the list of secrets allowed to be used by pods running using
	// this ServiceAccount. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/secrets.html
	private ObjectReference[] secrets;

	// ImagePullSecrets is a list of references to secrets in the same
	// namespace to use for pulling any images in pods that reference this
	// ServiceAccount. ImagePullSecrets are distinct from Secrets because
	// Secrets can be mounted in the pod, but ImagePullSecrets are only
	// accessed by the kubelet. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/secrets.html#manually-specifying-an-imagepullsecret
	private LocalObjectReference[] imagePullSecrets;

	public ServiceAccount() {
		kind = "ServiceAccount";
		apiVersion = KubeAPIVersion.v1.toString();
	}
	// for kind
	public String getKind() {
		return kind;
	}
	public void setKind(String kind) {
		this.kind = kind;
	}
	public ServiceAccount putKind(String kind) {
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
	public ServiceAccount putApiVersion(String apiVersion) {
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
	public ServiceAccount putMetadata(ObjectMeta metadata) {
		this.metadata = metadata;
		return this;
	}

	// for secrets
	public ObjectReference[] getSecrets() {
		return secrets;
	}
	public void setSecrets(ObjectReference[] secrets) {
		this.secrets = secrets;
	}
	public ServiceAccount putSecrets(ObjectReference[] secrets) {
		this.secrets = secrets;
		return this;
	}

	// for imagePullSecrets
	public LocalObjectReference[] getImagePullSecrets() {
		return imagePullSecrets;
	}
	public void setImagePullSecrets(LocalObjectReference[] imagePullSecrets) {
		this.imagePullSecrets = imagePullSecrets;
	}
	public ServiceAccount putImagePullSecrets(LocalObjectReference[] imagePullSecrets) {
		this.imagePullSecrets = imagePullSecrets;
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
		if (secrets != null) {
			tmpStr += "\n" + prefix + "secrets:";
			for (ObjectReference ele : secrets) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		if (imagePullSecrets != null) {
			tmpStr += "\n" + prefix + "imagePullSecrets:";
			for (LocalObjectReference ele : imagePullSecrets) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}