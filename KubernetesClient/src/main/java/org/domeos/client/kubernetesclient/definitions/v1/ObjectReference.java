package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;
import org.domeos.client.kubernetesclient.KubeAPIVersion;

// ObjectReference
// ===============
// Description:
// 	ObjectReference contains enough information to let you inspect or
// 	modify the referred object.
// Variables:
// 	Name           	Required	Schema	Default
// 	===============	========	======	=======
// 	kind           	false   	string	       
// 	namespace      	false   	string	       
// 	name           	false   	string	       
// 	uid            	false   	string	       
// 	apiVersion     	false   	string	       
// 	resourceVersion	false   	string	       
// 	fieldPath      	false   	string	       

public class ObjectReference {
	// Kind of the referent. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#types-kinds
	private String kind;

	// Namespace of the referent. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/namespaces.html
	private String namespace;

	// Name of the referent. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/identifiers.html#names
	private String name;

	// UID of the referent. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/identifiers.html#uids
	private String uid;

	// API version of the referent.
	private String apiVersion;

	// Specific resourceVersion to which this reference is made, if any. More
	// info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#concurrency-control-and-consistency
	private String resourceVersion;

	// If referring to a piece of an object instead of an entire object, this
	// string should contain a valid JSON/Go field access statement, such as
	// desiredState.manifest.containers[2]. For example, if the object
	// reference is to a container within a pod, this would take on a value like:
	// "spec.containers{name}" (where "name" refers to the name of the
	// container that triggered the event) or if no container name is
	// specified "spec.containers[2]" (container with index 2 in this pod).
	// This syntax is chosen only to have some well-defined way of referencing
	// a part of an object.
	private String fieldPath;

	public ObjectReference() {
		kind = "ObjectReference";
		apiVersion = KubeAPIVersion.v1.toString();
	}
	// for kind
	public String getKind() {
		return kind;
	}
	public void setKind(String kind) {
		this.kind = kind;
	}
	public ObjectReference putKind(String kind) {
		this.kind = kind;
		return this;
	}

	// for namespace
	public String getNamespace() {
		return namespace;
	}
	public void setNamespace(String namespace) {
		this.namespace = namespace;
	}
	public ObjectReference putNamespace(String namespace) {
		this.namespace = namespace;
		return this;
	}

	// for name
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public ObjectReference putName(String name) {
		this.name = name;
		return this;
	}

	// for uid
	public String getUid() {
		return uid;
	}
	public void setUid(String uid) {
		this.uid = uid;
	}
	public ObjectReference putUid(String uid) {
		this.uid = uid;
		return this;
	}

	// for apiVersion
	public String getApiVersion() {
		return apiVersion;
	}
	public void setApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
	}
	public ObjectReference putApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
		return this;
	}

	// for resourceVersion
	public String getResourceVersion() {
		return resourceVersion;
	}
	public void setResourceVersion(String resourceVersion) {
		this.resourceVersion = resourceVersion;
	}
	public ObjectReference putResourceVersion(String resourceVersion) {
		this.resourceVersion = resourceVersion;
		return this;
	}

	// for fieldPath
	public String getFieldPath() {
		return fieldPath;
	}
	public void setFieldPath(String fieldPath) {
		this.fieldPath = fieldPath;
	}
	public ObjectReference putFieldPath(String fieldPath) {
		this.fieldPath = fieldPath;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (kind != null) {
			tmpStr += firstLinePrefix + "kind: " + kind;
		}
		if (namespace != null) {
			tmpStr += "\n" + prefix + "namespace: " + namespace;
		}
		if (name != null) {
			tmpStr += "\n" + prefix + "name: " + name;
		}
		if (uid != null) {
			tmpStr += "\n" + prefix + "uid: " + uid;
		}
		if (apiVersion != null) {
			tmpStr += "\n" + prefix + "apiVersion: " + apiVersion;
		}
		if (resourceVersion != null) {
			tmpStr += "\n" + prefix + "resourceVersion: " + resourceVersion;
		}
		if (fieldPath != null) {
			tmpStr += "\n" + prefix + "fieldPath: " + fieldPath;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}