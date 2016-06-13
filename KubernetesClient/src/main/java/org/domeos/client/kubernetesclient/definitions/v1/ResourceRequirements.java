package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ResourceRequirements
// ====================
// Description:
// 	ResourceRequirements describes the compute resource requirements.
// Variables:
// 	Name    	Required	Schema	Default
// 	========	========	======	=======
// 	limits  	false   	any   	       
// 	requests	false   	any   	       

public class ResourceRequirements {
	// Limits describes the maximum amount of compute resources allowed.
	// More info:
	// http://kubernetes.io/v1.1/docs/design/resources.html#resource-specifications
	private Map<String, String> limits;

	// Requests describes the minimum amount of compute resources required.
	// If Requests is omitted for a container, it defaults to Limits if that is
	// explicitly specified, otherwise to an implementation-defined
	// value. More info:
	// http://kubernetes.io/v1.1/docs/design/resources.html#resource-specifications
	private Map<String, String> requests;

	public ResourceRequirements() {
	}
	// for limits
	public Map<String, String> getLimits() {
		return limits;
	}
	public void setLimits(Map<String, String> limits) {
		this.limits = limits;
	}
	public ResourceRequirements putLimits(Map<String, String> limits) {
		this.limits = limits;
		return this;
	}

	// for requests
	public Map<String, String> getRequests() {
		return requests;
	}
	public void setRequests(Map<String, String> requests) {
		this.requests = requests;
	}
	public ResourceRequirements putRequests(Map<String, String> requests) {
		this.requests = requests;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (limits != null) {
			tmpStr += firstLinePrefix + "limits:";
			Iterator<Map.Entry<String, String>> iter = limits.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, String> entry = iter.next();
				tmpStr += "\n" + prefix + unitPrefix + entry.getKey() + ": " + entry.getValue();
			}
		}
		if (requests != null) {
			tmpStr += "\n" + prefix + "requests:";
			Iterator<Map.Entry<String, String>> iter = requests.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, String> entry = iter.next();
				tmpStr += "\n" + prefix + unitPrefix + entry.getKey() + ": " + entry.getValue();
			}
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}