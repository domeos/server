package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;
import org.domeos.client.kubernetesclient.KubeAPIVersion;

// SubresourceReference
// ====================
// Description:
// 	SubresourceReference contains enough information to let you inspect
// 	or modify the referred subresource.
// Variables:
// 	Name       	Required	Schema	Default
// 	===========	========	======	=======
// 	kind       	false   	string	       
// 	namespace  	false   	string	       
// 	name       	false   	string	       
// 	apiVersion 	false   	string	       
// 	subresource	false   	string	       

public class SubresourceReference {
	// Kind of the referent; More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#types-kinds"
	private String kind;

	// Namespace of the referent; More info:
	// http://kubernetes.io/v1.1/docs/user-guide/namespaces.html
	private String namespace;

	// Name of the referent; More info:
	// http://kubernetes.io/v1.1/docs/user-guide/identifiers.html#names
	private String name;

	// API version of the referent
	private String apiVersion;

	// Subresource name of the referent
	private String subresource;

	public SubresourceReference() {
		kind = "SubresourceReference";
		apiVersion = KubeAPIVersion.v1beta1.toString();
	}
	// for kind
	public String getKind() {
		return kind;
	}
	public void setKind(String kind) {
		this.kind = kind;
	}
	public SubresourceReference putKind(String kind) {
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
	public SubresourceReference putNamespace(String namespace) {
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
	public SubresourceReference putName(String name) {
		this.name = name;
		return this;
	}

	// for apiVersion
	public String getApiVersion() {
		return apiVersion;
	}
	public void setApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
	}
	public SubresourceReference putApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
		return this;
	}

	// for subresource
	public String getSubresource() {
		return subresource;
	}
	public void setSubresource(String subresource) {
		this.subresource = subresource;
	}
	public SubresourceReference putSubresource(String subresource) {
		this.subresource = subresource;
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
		if (apiVersion != null) {
			tmpStr += "\n" + prefix + "apiVersion: " + apiVersion;
		}
		if (subresource != null) {
			tmpStr += "\n" + prefix + "subresource: " + subresource;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}