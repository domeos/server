package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// NodeSpec
// ========
// Description:
// 	NodeSpec describes the attributes that a node is created with.
// Variables:
// 	Name         	Required	Schema 	Default
// 	=============	========	=======	=======
// 	podCIDR      	false   	string 	       
// 	externalID   	false   	string 	       
// 	providerID   	false   	string 	       
// 	unschedulable	false   	boolean	false  

public class NodeSpec {
	// PodCIDR represents the pod IP range assigned to the node.
	private String podCIDR;

	// External ID of the node assigned by some machine database (e.g. a cloud
	// provider). Deprecated.
	private String externalID;

	// ID of the node assigned by the cloud provider in the format:
	// <ProviderName>://<ProviderSpecificNodeID>
	private String providerID;

	// Unschedulable controls node schedulability of new pods. By default,
	// node is schedulable. More info:
	// http://kubernetes.io/v1.1/docs/admin/node.html#manual-node-administration"`
	private boolean unschedulable;

	public NodeSpec() {
	}
	// for podCIDR
	public String getPodCIDR() {
		return podCIDR;
	}
	public void setPodCIDR(String podCIDR) {
		this.podCIDR = podCIDR;
	}
	public NodeSpec putPodCIDR(String podCIDR) {
		this.podCIDR = podCIDR;
		return this;
	}

	// for externalID
	public String getExternalID() {
		return externalID;
	}
	public void setExternalID(String externalID) {
		this.externalID = externalID;
	}
	public NodeSpec putExternalID(String externalID) {
		this.externalID = externalID;
		return this;
	}

	// for providerID
	public String getProviderID() {
		return providerID;
	}
	public void setProviderID(String providerID) {
		this.providerID = providerID;
	}
	public NodeSpec putProviderID(String providerID) {
		this.providerID = providerID;
		return this;
	}

	// for unschedulable
	public boolean getUnschedulable() {
		return unschedulable;
	}
	public void setUnschedulable(boolean unschedulable) {
		this.unschedulable = unschedulable;
	}
	public NodeSpec putUnschedulable(boolean unschedulable) {
		this.unschedulable = unschedulable;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (podCIDR != null) {
			tmpStr += firstLinePrefix + "podCIDR: " + podCIDR;
		}
		if (externalID != null) {
			tmpStr += "\n" + prefix + "externalID: " + externalID;
		}
		if (providerID != null) {
			tmpStr += "\n" + prefix + "providerID: " + providerID;
		}
		tmpStr += "\n" + prefix + "unschedulable: " + unschedulable;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}