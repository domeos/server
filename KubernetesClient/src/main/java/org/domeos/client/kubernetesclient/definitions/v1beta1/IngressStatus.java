package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.LoadBalancerStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// IngressStatus
// =============
// Description:
// 	IngressStatus describe the current state of the Ingress.
// Variables:
// 	Name        	Required	Schema               	Default
// 	============	========	=====================	=======
// 	loadBalancer	false   	v1.LoadBalancerStatus	       

public class IngressStatus {
	// LoadBalancer contains the current status of the load-balancer.
	private LoadBalancerStatus loadBalancer;

	public IngressStatus() {
	}
	// for loadBalancer
	public LoadBalancerStatus getLoadBalancer() {
		return loadBalancer;
	}
	public void setLoadBalancer(LoadBalancerStatus loadBalancer) {
		this.loadBalancer = loadBalancer;
	}
	public IngressStatus putLoadBalancer(LoadBalancerStatus loadBalancer) {
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