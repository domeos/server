package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.unversioned.ListMeta;
import org.domeos.client.kubernetesclient.definitions.v1beta1.HorizontalPodAutoscaler;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;
import org.domeos.client.kubernetesclient.KubeAPIVersion;

// HorizontalPodAutoscalerList
// ===========================
// Description:
// 	list of horizontal pod autoscaler objects.
// Variables:
// 	Name      	Required	Schema                               	Default
// 	==========	========	=====================================	=======
// 	kind      	false   	string                               	       
// 	apiVersion	false   	string                               	       
// 	metadata  	false   	unversioned.ListMeta                 	       
// 	items     	true    	v1beta1.HorizontalPodAutoscaler array	       

public class HorizontalPodAutoscalerList {
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

	// Standard list metadata.
	private ListMeta metadata;

	// list of horizontal pod autoscaler objects.
	private HorizontalPodAutoscaler[] items;

	public HorizontalPodAutoscalerList() {
		kind = "HorizontalPodAutoscalerList";
		apiVersion = KubeAPIVersion.v1beta1.toString();
	}
	// for kind
	public String getKind() {
		return kind;
	}
	public void setKind(String kind) {
		this.kind = kind;
	}
	public HorizontalPodAutoscalerList putKind(String kind) {
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
	public HorizontalPodAutoscalerList putApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
		return this;
	}

	// for metadata
	public ListMeta getMetadata() {
		return metadata;
	}
	public void setMetadata(ListMeta metadata) {
		this.metadata = metadata;
	}
	public HorizontalPodAutoscalerList putMetadata(ListMeta metadata) {
		this.metadata = metadata;
		return this;
	}

	// for items
	public HorizontalPodAutoscaler[] getItems() {
		return items;
	}
	public void setItems(HorizontalPodAutoscaler[] items) {
		this.items = items;
	}
	public HorizontalPodAutoscalerList putItems(HorizontalPodAutoscaler[] items) {
		this.items = items;
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
		if (items != null) {
			tmpStr += "\n" + prefix + "items:";
			for (HorizontalPodAutoscaler ele : items) {
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