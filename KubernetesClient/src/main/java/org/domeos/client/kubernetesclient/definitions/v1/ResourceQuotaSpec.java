package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ResourceQuotaSpec
// =================
// Description:
// 	ResourceQuotaSpec defines the desired hard limits to enforce for
// 	Quota.
// Variables:
// 	Name	Required	Schema	Default
// 	====	========	======	=======
// 	hard	false   	any   	       

public class ResourceQuotaSpec {
	// Hard is the set of desired hard limits for each named resource. More
	// info:
	// http://kubernetes.io/v1.1/docs/design/admission_control_resource_quota.html#admissioncontrol-plugin-resourcequota
	private Map<String, String> hard;

	public ResourceQuotaSpec() {
	}
	// for hard
	public Map<String, String> getHard() {
		return hard;
	}
	public void setHard(Map<String, String> hard) {
		this.hard = hard;
	}
	public ResourceQuotaSpec putHard(Map<String, String> hard) {
		this.hard = hard;
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
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}