package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.LimitRangeItem;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// LimitRangeSpec
// ==============
// Description:
// 	LimitRangeSpec defines a min/max usage limit for resources that match
// 	on kind.
// Variables:
// 	Name  	Required	Schema                 	Default
// 	======	========	=======================	=======
// 	limits	true    	v1.LimitRangeItem array	       

public class LimitRangeSpec {
	// Limits is the list of LimitRangeItem objects that are enforced.
	private LimitRangeItem[] limits;

	public LimitRangeSpec() {
	}
	// for limits
	public LimitRangeItem[] getLimits() {
		return limits;
	}
	public void setLimits(LimitRangeItem[] limits) {
		this.limits = limits;
	}
	public LimitRangeSpec putLimits(LimitRangeItem[] limits) {
		this.limits = limits;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (limits != null) {
			tmpStr += firstLinePrefix + "limits:";
			for (LimitRangeItem ele : limits) {
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