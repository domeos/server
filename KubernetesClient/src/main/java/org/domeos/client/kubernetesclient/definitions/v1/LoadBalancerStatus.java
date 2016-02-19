package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.LoadBalancerIngress;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// LoadBalancerStatus
// ==================
// Description:
// 	LoadBalancerStatus represents the status of a load-balancer.
// Variables:
// 	Name   	Required	Schema                      	Default
// 	=======	========	============================	=======
// 	ingress	false   	v1.LoadBalancerIngress array	       

public class LoadBalancerStatus {
	// Ingress is a list containing ingress points for the load-balancer.
	// Traffic intended for the service should be sent to these ingress
	// points.
	private LoadBalancerIngress[] ingress;

	public LoadBalancerStatus() {
	}
	// for ingress
	public LoadBalancerIngress[] getIngress() {
		return ingress;
	}
	public void setIngress(LoadBalancerIngress[] ingress) {
		this.ingress = ingress;
	}
	public LoadBalancerStatus putIngress(LoadBalancerIngress[] ingress) {
		this.ingress = ingress;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (ingress != null) {
			tmpStr += firstLinePrefix + "ingress:";
			for (LoadBalancerIngress ele : ingress) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}