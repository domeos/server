package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ContainerPort
// =============
// Description:
// 	ContainerPort represents a network port in a single container.
// Variables:
// 	Name         	Required	Schema         	Default
// 	=============	========	===============	=======
// 	name         	false   	string         	       
// 	hostPort     	false   	integer (int32)	       
// 	containerPort	true    	integer (int32)	       
// 	protocol     	false   	string         	       
// 	hostIP       	false   	string         	       

public class ContainerPort {
	// If specified, this must be an IANA_SVC_NAME and unique within the pod.
	// Each named port in a pod must have a unique name. Name for the port that can
	// be referred to by services.
	private String name;

	// Number of port to expose on the host. If specified, this must be a valid
	// port number, 0 < x < 65536. If HostNetwork is specified, this must match
	// ContainerPort. Most containers do not need this.
	private int hostPort;

	// Number of port to expose on the pod’s IP address. This must be a valid port
	// number, 0 < x < 65536.
	private int containerPort;

	// Protocol for port. Must be UDP or TCP. Defaults to "TCP".
	private String protocol;

	// What host IP to bind the external port to.
	private String hostIP;

	public ContainerPort() {
	}
	// for name
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public ContainerPort putName(String name) {
		this.name = name;
		return this;
	}

	// for hostPort
	public int getHostPort() {
		return hostPort;
	}
	public void setHostPort(int hostPort) {
		this.hostPort = hostPort;
	}
	public ContainerPort putHostPort(int hostPort) {
		this.hostPort = hostPort;
		return this;
	}

	// for containerPort
	public int getContainerPort() {
		return containerPort;
	}
	public void setContainerPort(int containerPort) {
		this.containerPort = containerPort;
	}
	public ContainerPort putContainerPort(int containerPort) {
		this.containerPort = containerPort;
		return this;
	}

	// for protocol
	public String getProtocol() {
		return protocol;
	}
	public void setProtocol(String protocol) {
		this.protocol = protocol;
	}
	public ContainerPort putProtocol(String protocol) {
		this.protocol = protocol;
		return this;
	}

	// for hostIP
	public String getHostIP() {
		return hostIP;
	}
	public void setHostIP(String hostIP) {
		this.hostIP = hostIP;
	}
	public ContainerPort putHostIP(String hostIP) {
		this.hostIP = hostIP;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (name != null) {
			tmpStr += firstLinePrefix + "name: " + name;
		}
		tmpStr += "\n" + prefix + "hostPort: " + hostPort;
		tmpStr += "\n" + prefix + "containerPort: " + containerPort;
		if (protocol != null) {
			tmpStr += "\n" + prefix + "protocol: " + protocol;
		}
		if (hostIP != null) {
			tmpStr += "\n" + prefix + "hostIP: " + hostIP;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}