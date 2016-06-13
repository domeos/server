package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
// ServicePort
// ===========
// Description:
// 	ServicePort conatins information on service’s port.
// Variables:
// 	Name      	Required	Schema         	Default
// 	==========	========	===============	=======
// 	name      	false   	string         	       
// 	protocol  	false   	string         	       
// 	port      	true    	integer (int32)	       
// 	targetPort	false   	string         	       
// 	nodePort  	false   	integer (int32)	       

public class ServicePort {
	// The name of this port within the service. This must be a DNS_LABEL. All
	// ports within a ServiceSpec must have unique names. This maps to the Name
	// field in EndpointPort objects. Optional if only one ServicePort is
	// defined on this service.
	private String name;

	// The IP protocol for this port. Supports "TCP" and "UDP". Default is TCP.
	private String protocol;

	// The port that will be exposed by this service.
	private int port;

	// Number or name of the port to access on the pods targeted by the service.
	// Number must be in the range 1 to 65535. Name must be an IANA_SVC_NAME. If
	// this is a string, it will be looked up as a named port in the target Pod’s
	// container ports. If this is not specified, the value of Port is used (an
	// identity map). Defaults to the service port. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/services.html#defining-a-service
	// private String targetPort;
	private int targetPort;

	// The port on each node on which this service is exposed when
	// type=NodePort or LoadBalancer. Usually assigned by the system. If
	// specified, it will be allocated to the service if unused or else
	// creation of the service will fail. Default is to auto-allocate a port if
	// the ServiceType of this Service requires one. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/services.html#type—nodeport
	private int nodePort;

	public ServicePort() {
	}
	// for name
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public ServicePort putName(String name) {
		this.name = name;
		return this;
	}

	// for protocol
	public String getProtocol() {
		return protocol;
	}
	public void setProtocol(String protocol) {
		this.protocol = protocol;
	}
	public ServicePort putProtocol(String protocol) {
		this.protocol = protocol;
		return this;
	}

	// for port
	public int getPort() {
		return port;
	}
	public void setPort(int port) {
		this.port = port;
	}
	public ServicePort putPort(int port) {
		this.port = port;
		return this;
	}

	// for targetPort
	public int getTargetPort() {
		return targetPort;
	}
	public void setTargetPort(int targetPort) {
		this.targetPort = targetPort;
	}
	public ServicePort putTargetPort(int targetPort) {
		this.targetPort = targetPort;
		return this;
	}

	// for nodePort
	public int getNodePort() {
		return nodePort;
	}
	public void setNodePort(int nodePort) {
		this.nodePort = nodePort;
	}
	public ServicePort putNodePort(int nodePort) {
		this.nodePort = nodePort;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (name != null) {
			tmpStr += firstLinePrefix + "name: " + name;
		}
		if (protocol != null) {
			tmpStr += "\n" + prefix + "protocol: " + protocol;
		}
		tmpStr += "\n" + prefix + "port: " + port;
		// if (targetPort != null) {
			tmpStr += "\n" + prefix + "targetPort: " + targetPort;
		// }
		tmpStr += "\n" + prefix + "nodePort: " + nodePort;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}