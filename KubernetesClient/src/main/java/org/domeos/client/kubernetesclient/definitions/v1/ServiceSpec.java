package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ServicePort;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ServiceSpec
// ===========
// Description:
// 	ServiceSpec describes the attributes that a user creates on a service.
// Variables:
// 	Name               	Required	Schema              	Default
// 	===================	========	====================	=======
// 	ports              	true    	v1.ServicePort array	       
// 	selector           	false   	any                 	       
// 	clusterIP          	false   	string              	       
// 	type               	false   	string              	       
// 	externalIPs        	false   	string array        	       
// 	deprecatedPublicIPs	false   	string array        	       
// 	sessionAffinity    	false   	string              	       
// 	loadBalancerIP     	false   	string              	       

public class ServiceSpec {
	// The list of ports that are exposed by this service. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/services.html#virtual-ips-and-service-proxies
	private ServicePort[] ports;

	// This service will route traffic to pods having labels matching this
	// selector. Label keys and values that must match in order to receive
	// traffic for this service. If empty, all pods are selected, if not
	// specified, endpoints must be manually specified. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/services.html#overview
	private Map<String, String> selector;

	// ClusterIP is usually assigned by the master and is the IP address of the
	// service. If specified, it will be allocated to the service if it is
	// unused or else creation of the service will fail. Valid values are None,
	// empty string (""), or a valid IP address. None can be specified for a
	// headless service when proxying is not required. Cannot be updated.
	// More info:
	// http://kubernetes.io/v1.1/docs/user-guide/services.html#virtual-ips-and-service-proxies
	private String clusterIP;

	// Type of exposed service. Must be ClusterIP, NodePort, or
	// LoadBalancer. Defaults to ClusterIP. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/services.html#external-services
	private String type;

	// externalIPs is a list of IP addresses for which nodes in the cluster will
	// also accept traffic for this service. These IPs are not managed by
	// Kubernetes. The user is responsible for ensuring that traffic arrives
	// at a node with this IP. A common example is external load-balancers that
	// are not part of the Kubernetes system. A previous form of this
	// functionality exists as the deprecatedPublicIPs field. When using
	// this field, callers should also clear the deprecatedPublicIPs field.
	private String[] externalIPs;

	// deprecatedPublicIPs is deprecated and replaced by the externalIPs
	// field with almost the exact same semantics. This field is retained in
	// the v1 API for compatibility until at least 8/20/2016. It will be
	// removed from any new API revisions. If both deprecatedPublicIPs and
	// externalIPs are set, deprecatedPublicIPs is used.
	private String[] deprecatedPublicIPs;

	// Supports "ClientIP" and "None". Used to maintain session affinity.
	// Enable client IP based session affinity. Must be ClientIP or None.
	// Defaults to None. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/services.html#virtual-ips-and-service-proxies
	private String sessionAffinity;

	// Only applies to Service Type: LoadBalancer LoadBalancer will get
	// created with the IP specified in this field. This feature depends on
	// whether the underlying cloud-provider supports specifying the
	// loadBalancerIP when a load balancer is created. This field will be
	// ignored if the cloud-provider does not support the feature.
	private String loadBalancerIP;

	public ServiceSpec() {
	}
	// for ports
	public ServicePort[] getPorts() {
		return ports;
	}
	public void setPorts(ServicePort[] ports) {
		this.ports = ports;
	}
	public ServiceSpec putPorts(ServicePort[] ports) {
		this.ports = ports;
		return this;
	}

	// for selector
	public Map<String, String> getSelector() {
		return selector;
	}
	public void setSelector(Map<String, String> selector) {
		this.selector = selector;
	}
	public ServiceSpec putSelector(Map<String, String> selector) {
		this.selector = selector;
		return this;
	}

	// for clusterIP
	public String getClusterIP() {
		return clusterIP;
	}
	public void setClusterIP(String clusterIP) {
		this.clusterIP = clusterIP;
	}
	public ServiceSpec putClusterIP(String clusterIP) {
		this.clusterIP = clusterIP;
		return this;
	}

	// for type
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public ServiceSpec putType(String type) {
		this.type = type;
		return this;
	}

	// for externalIPs
	public String[] getExternalIPs() {
		return externalIPs;
	}
	public void setExternalIPs(String[] externalIPs) {
		this.externalIPs = externalIPs;
	}
	public ServiceSpec putExternalIPs(String[] externalIPs) {
		this.externalIPs = externalIPs;
		return this;
	}

	// for deprecatedPublicIPs
	public String[] getDeprecatedPublicIPs() {
		return deprecatedPublicIPs;
	}
	public void setDeprecatedPublicIPs(String[] deprecatedPublicIPs) {
		this.deprecatedPublicIPs = deprecatedPublicIPs;
	}
	public ServiceSpec putDeprecatedPublicIPs(String[] deprecatedPublicIPs) {
		this.deprecatedPublicIPs = deprecatedPublicIPs;
		return this;
	}

	// for sessionAffinity
	public String getSessionAffinity() {
		return sessionAffinity;
	}
	public void setSessionAffinity(String sessionAffinity) {
		this.sessionAffinity = sessionAffinity;
	}
	public ServiceSpec putSessionAffinity(String sessionAffinity) {
		this.sessionAffinity = sessionAffinity;
		return this;
	}

	// for loadBalancerIP
	public String getLoadBalancerIP() {
		return loadBalancerIP;
	}
	public void setLoadBalancerIP(String loadBalancerIP) {
		this.loadBalancerIP = loadBalancerIP;
	}
	public ServiceSpec putLoadBalancerIP(String loadBalancerIP) {
		this.loadBalancerIP = loadBalancerIP;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (ports != null) {
			tmpStr += firstLinePrefix + "ports:";
			for (ServicePort ele : ports) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		if (selector != null) {
			tmpStr += "\n" + prefix + "selector:";
			Iterator<Map.Entry<String, String>> iter = selector.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, String> entry = iter.next();
				tmpStr += "\n" + prefix + unitPrefix + entry.getKey() + ": " + entry.getValue();
			}
		}
		if (clusterIP != null) {
			tmpStr += "\n" + prefix + "clusterIP: " + clusterIP;
		}
		if (type != null) {
			tmpStr += "\n" + prefix + "type: " + type;
		}
		if (externalIPs != null) {
			tmpStr += "\n" + prefix + "externalIPs:";
			for (String ele : externalIPs) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele;
				}
			}
		}
		if (deprecatedPublicIPs != null) {
			tmpStr += "\n" + prefix + "deprecatedPublicIPs:";
			for (String ele : deprecatedPublicIPs) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele;
				}
			}
		}
		if (sessionAffinity != null) {
			tmpStr += "\n" + prefix + "sessionAffinity: " + sessionAffinity;
		}
		if (loadBalancerIP != null) {
			tmpStr += "\n" + prefix + "loadBalancerIP: " + loadBalancerIP;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}