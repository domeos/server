package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ObjectMeta;
import org.domeos.client.kubernetesclient.definitions.v1.EndpointSubset;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;
import org.domeos.client.kubernetesclient.KubeAPIVersion;

// Endpoints
// =========
// Description:
// 	Endpoints is a collection of endpoints that implement the actual
// 	service. Example: Name: "mysvc", Subsets: [ { Addresses: [{"ip":
// 	"10.10.1.1"}, {"ip": "10.10.2.2"}], Ports: [{"name": "a", "port":
// 	8675}, {"name": "b", "port": 309}] }, { Addresses: [{"ip":
// 	"10.10.3.3"}], Ports: [{"name": "a", "port": 93}, {"name": "b",
// 	"port": 76}] }, ]
// Variables:
// 	Name      	Required	Schema                 	Default
// 	==========	========	=======================	=======
// 	kind      	false   	string                 	       
// 	apiVersion	false   	string                 	       
// 	metadata  	false   	v1.ObjectMeta          	       
// 	subsets   	true    	v1.EndpointSubset array	       

public class Endpoints {
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

	// The set of all endpoints is the union of all subsets. Addresses are
	// placed into subsets according to the IPs they share. A single address
	// with multiple ports, some of which are ready and some of which are not
	// (because they come from different containers) will result in the
	// address being displayed in different subsets for the different ports.
	// No address will appear in both Addresses and NotReadyAddresses in the
	// same subset. Sets of addresses and ports that comprise a service.
	private EndpointSubset[] subsets;

	public Endpoints() {
		kind = "Endpoints";
		apiVersion = KubeAPIVersion.v1.toString();
	}
	// for kind
	public String getKind() {
		return kind;
	}
	public void setKind(String kind) {
		this.kind = kind;
	}
	public Endpoints putKind(String kind) {
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
	public Endpoints putApiVersion(String apiVersion) {
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
	public Endpoints putMetadata(ObjectMeta metadata) {
		this.metadata = metadata;
		return this;
	}

	// for subsets
	public EndpointSubset[] getSubsets() {
		return subsets;
	}
	public void setSubsets(EndpointSubset[] subsets) {
		this.subsets = subsets;
	}
	public Endpoints putSubsets(EndpointSubset[] subsets) {
		this.subsets = subsets;
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
		if (subsets != null) {
			tmpStr += "\n" + prefix + "subsets:";
			for (EndpointSubset ele : subsets) {
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