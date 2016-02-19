package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// LoadBalancerIngress
// ===================
// Description:
// 	LoadBalancerIngress represents the status of a load-balancer
// 	ingress point: traffic intended for the service should be sent to an
// 	ingress point.
// Variables:
// 	Name    	Required	Schema	Default
// 	========	========	======	=======
// 	ip      	false   	string	       
// 	hostname	false   	string	       

public class LoadBalancerIngress {
	// IP is set for load-balancer ingress points that are IP based (typically
	// GCE or OpenStack load-balancers)
	private String ip;

	// Hostname is set for load-balancer ingress points that are DNS based
	// (typically AWS load-balancers)
	private String hostname;

	public LoadBalancerIngress() {
	}
	// for ip
	public String getIp() {
		return ip;
	}
	public void setIp(String ip) {
		this.ip = ip;
	}
	public LoadBalancerIngress putIp(String ip) {
		this.ip = ip;
		return this;
	}

	// for hostname
	public String getHostname() {
		return hostname;
	}
	public void setHostname(String hostname) {
		this.hostname = hostname;
	}
	public LoadBalancerIngress putHostname(String hostname) {
		this.hostname = hostname;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (ip != null) {
			tmpStr += firstLinePrefix + "ip: " + ip;
		}
		if (hostname != null) {
			tmpStr += "\n" + prefix + "hostname: " + hostname;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}