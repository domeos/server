package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1beta1.PodSelectorRequirement;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// PodSelector
// ===========
// Description:
// 	A pod selector is a label query over a set of pods. The result of
// 	matchLabels and matchExpressions are ANDed. An empty pod selector
// 	matches all objects. A null pod selector matches no objects.
// Variables:
// 	Name            	Required	Schema                              	Default
// 	================	========	====================================	=======
// 	matchLabels     	false   	any                                 	       
// 	matchExpressions	false   	v1beta1.PodSelectorRequirement array	       

public class PodSelector {
	// matchLabels is a map of {key,value} pairs. A single {key,value} in the
	// matchLabels map is equivalent to an element of matchExpressions,
	// whose key field is "key", the operator is "In", and the values array
	// contains only "value". The requirements are ANDed.
	private Map<String, String> matchLabels;

	// matchExpressions is a list of pod selector requirements. The
	// requirements are ANDed.
	private PodSelectorRequirement[] matchExpressions;

	public PodSelector() {
	}
	// for matchLabels
	public Map<String, String> getMatchLabels() {
		return matchLabels;
	}
	public void setMatchLabels(Map<String, String> matchLabels) {
		this.matchLabels = matchLabels;
	}
	public PodSelector putMatchLabels(Map<String, String> matchLabels) {
		this.matchLabels = matchLabels;
		return this;
	}

	// for matchExpressions
	public PodSelectorRequirement[] getMatchExpressions() {
		return matchExpressions;
	}
	public void setMatchExpressions(PodSelectorRequirement[] matchExpressions) {
		this.matchExpressions = matchExpressions;
	}
	public PodSelector putMatchExpressions(PodSelectorRequirement[] matchExpressions) {
		this.matchExpressions = matchExpressions;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (matchLabels != null) {
			tmpStr += firstLinePrefix + "matchLabels:";
			Iterator<Map.Entry<String, String>> iter = matchLabels.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, String> entry = iter.next();
				tmpStr += "\n" + prefix + unitPrefix + entry.getKey() + ": " + entry.getValue();
			}
		}
		if (matchExpressions != null) {
			tmpStr += "\n" + prefix + "matchExpressions:";
			for (PodSelectorRequirement ele : matchExpressions) {
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