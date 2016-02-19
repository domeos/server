package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// IngressBackend
// ==============
// Description:
// 	IngressBackend describes all endpoints for a given Service and port.
// Variables:
// 	Name       	Required	Schema	Default
// 	===========	========	======	=======
// 	serviceName	true    	string	       
// 	servicePort	true    	string	       

public class IngressBackend {
	// Specifies the name of the referenced service.
	private String serviceName;

	// Specifies the port of the referenced service.
	private String servicePort;

	public IngressBackend() {
	}
	// for serviceName
	public String getServiceName() {
		return serviceName;
	}
	public void setServiceName(String serviceName) {
		this.serviceName = serviceName;
	}
	public IngressBackend putServiceName(String serviceName) {
		this.serviceName = serviceName;
		return this;
	}

	// for servicePort
	public String getServicePort() {
		return servicePort;
	}
	public void setServicePort(String servicePort) {
		this.servicePort = servicePort;
	}
	public IngressBackend putServicePort(String servicePort) {
		this.servicePort = servicePort;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (serviceName != null) {
			tmpStr += firstLinePrefix + "serviceName: " + serviceName;
		}
		if (servicePort != null) {
			tmpStr += "\n" + prefix + "servicePort: " + servicePort;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}