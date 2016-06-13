package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// NodeAddress
// ===========
// Description:
// 	NodeAddress contains information for the node’s address.
// Variables:
// 	Name   	Required	Schema	Default
// 	=======	========	======	=======
// 	type   	true    	string	       
// 	address	true    	string	       

public class NodeAddress {
	// Node address type, one of Hostname, ExternalIP or InternalIP.
	private String type;

	// The node address.
	private String address;

	public NodeAddress() {
	}
	// for type
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public NodeAddress putType(String type) {
		this.type = type;
		return this;
	}

	// for address
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public NodeAddress putAddress(String address) {
		this.address = address;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (type != null) {
			tmpStr += firstLinePrefix + "type: " + type;
		}
		if (address != null) {
			tmpStr += "\n" + prefix + "address: " + address;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}