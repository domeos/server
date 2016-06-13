package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ObjectMeta;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;
import org.domeos.client.kubernetesclient.KubeAPIVersion;

// Secret
// ======
// Description:
// 	Secret holds secret data of a certain type. The total bytes of the values
// 	in the Data field must be less than MaxSecretSize bytes.
// Variables:
// 	Name      	Required	Schema       	Default
// 	==========	========	=============	=======
// 	kind      	false   	string       	       
// 	apiVersion	false   	string       	       
// 	metadata  	false   	v1.ObjectMeta	       
// 	data      	false   	any          	       
// 	type      	false   	string       	       

public class Secret {
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

	// Data contains the secret data. Each key must be a valid DNS_SUBDOMAIN or
	// leading dot followed by valid DNS_SUBDOMAIN. The serialized form of
	// the secret data is a base64 encoded string, representing the arbitrary
	// (possibly non-string) data value here. Described in
	// https://tools.ietf.org/html/rfc4648#section-4
	private Map<String, String> data;

	// Used to facilitate programmatic handling of secret data.
	private String type;

	public Secret() {
		kind = "Secret";
		apiVersion = KubeAPIVersion.v1.toString();
	}
	// for kind
	public String getKind() {
		return kind;
	}
	public void setKind(String kind) {
		this.kind = kind;
	}
	public Secret putKind(String kind) {
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
	public Secret putApiVersion(String apiVersion) {
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
	public Secret putMetadata(ObjectMeta metadata) {
		this.metadata = metadata;
		return this;
	}

	// for data
	public Map<String, String> getData() {
		return data;
	}
	public void setData(Map<String, String> data) {
		this.data = data;
	}
	public Secret putData(Map<String, String> data) {
		this.data = data;
		return this;
	}

	// for type
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public Secret putType(String type) {
		this.type = type;
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
		if (data != null) {
			tmpStr += "\n" + prefix + "data:";
			Iterator<Map.Entry<String, String>> iter = data.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, String> entry = iter.next();
				tmpStr += "\n" + prefix + unitPrefix + entry.getKey() + ": " + entry.getValue();
			}
		}
		if (type != null) {
			tmpStr += "\n" + prefix + "type: " + type;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}