package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ResourceQuotaStatus
// ===================
// Description:
// 	ResourceQuotaStatus defines the enforced hard limits and observed
// 	use.
// Variables:
// 	Name	Required	Schema	Default
// 	====	========	======	=======
// 	hard	false   	any   	       
// 	used	false   	any   	       

public class ResourceQuotaStatus {
	// Hard is the set of enforced hard limits for each named resource. More
	// info:
	// http://kubernetes.io/v1.1/docs/design/admission_control_resource_quota.html#admissioncontrol-plugin-resourcequota
	private Map<String, String> hard;

	// Used is the current observed total usage of the resource in the
	// namespace.
	private Map<String, String> used;

	public ResourceQuotaStatus() {
	}
	// for hard
	public Map<String, String> getHard() {
		return hard;
	}
	public void setHard(Map<String, String> hard) {
		this.hard = hard;
	}
	public ResourceQuotaStatus putHard(Map<String, String> hard) {
		this.hard = hard;
		return this;
	}

	// for used
	public Map<String, String> getUsed() {
		return used;
	}
	public void setUsed(Map<String, String> used) {
		this.used = used;
	}
	public ResourceQuotaStatus putUsed(Map<String, String> used) {
		this.used = used;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (hard != null) {
			tmpStr += firstLinePrefix + "hard:";
			Iterator<Map.Entry<String, String>> iter = hard.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, String> entry = iter.next();
				tmpStr += "\n" + prefix + unitPrefix + entry.getKey() + ": " + entry.getValue();
			}
		}
		if (used != null) {
			tmpStr += "\n" + prefix + "used:";
			Iterator<Map.Entry<String, String>> iter = used.entrySet().iterator();
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