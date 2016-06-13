package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// EndpointPort
// ============
// Description:
// 	EndpointPort is a tuple that describes a single port.
// Variables:
// 	Name    	Required	Schema         	Default
// 	========	========	===============	=======
// 	name    	false   	string         	       
// 	port    	true    	integer (int32)	       
// 	protocol	false   	string         	       

public class EndpointPort {
	// The name of this port (corresponds to ServicePort.Name). Must be a
	// DNS_LABEL. Optional only if one port is defined.
	private String name;

	// The port number of the endpoint.
	private int port;

	// The IP protocol for this port. Must be UDP or TCP. Default is TCP.
	private String protocol;

	public EndpointPort() {
	}
	// for name
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public EndpointPort putName(String name) {
		this.name = name;
		return this;
	}

	// for port
	public int getPort() {
		return port;
	}
	public void setPort(int port) {
		this.port = port;
	}
	public EndpointPort putPort(int port) {
		this.port = port;
		return this;
	}

	// for protocol
	public String getProtocol() {
		return protocol;
	}
	public void setProtocol(String protocol) {
		this.protocol = protocol;
	}
	public EndpointPort putProtocol(String protocol) {
		this.protocol = protocol;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (name != null) {
			tmpStr += firstLinePrefix + "name: " + name;
		}
		tmpStr += "\n" + prefix + "port: " + port;
		if (protocol != null) {
			tmpStr += "\n" + prefix + "protocol: " + protocol;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}