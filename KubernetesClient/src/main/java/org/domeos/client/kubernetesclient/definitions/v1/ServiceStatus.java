package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.LoadBalancerStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ServiceStatus
// =============
// Description:
// 	ServiceStatus represents the current status of a service.
// Variables:
// 	Name        	Required	Schema               	Default
// 	============	========	=====================	=======
// 	loadBalancer	false   	v1.LoadBalancerStatus	       

public class ServiceStatus {
	// LoadBalancer contains the current status of the load-balancer, if one
	// is present.
	private LoadBalancerStatus loadBalancer;

	public ServiceStatus() {
	}
	// for loadBalancer
	public LoadBalancerStatus getLoadBalancer() {
		return loadBalancer;
	}
	public void setLoadBalancer(LoadBalancerStatus loadBalancer) {
		this.loadBalancer = loadBalancer;
	}
	public ServiceStatus putLoadBalancer(LoadBalancerStatus loadBalancer) {
		this.loadBalancer = loadBalancer;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (loadBalancer != null) {
			tmpStr += firstLinePrefix + "loadBalancer: ";
			tmpStr += "\n" + loadBalancer.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}