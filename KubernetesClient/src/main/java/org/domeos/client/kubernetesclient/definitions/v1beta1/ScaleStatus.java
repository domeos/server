package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ScaleStatus
// ===========
// Description:
// 	represents the current status of a scale subresource.
// Variables:
// 	Name    	Required	Schema         	Default
// 	========	========	===============	=======
// 	replicas	true    	integer (int32)	       
// 	selector	false   	any            	       

public class ScaleStatus {
	// actual number of observed instances of the scaled object.
	private int replicas;

	// label query over pods that should match the replicas count. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/labels.html#label-selectors
	private Map<String, String> selector;

	public ScaleStatus() {
	}
	// for replicas
	public int getReplicas() {
		return replicas;
	}
	public void setReplicas(int replicas) {
		this.replicas = replicas;
	}
	public ScaleStatus putReplicas(int replicas) {
		this.replicas = replicas;
		return this;
	}

	// for selector
	public Map<String, String> getSelector() {
		return selector;
	}
	public void setSelector(Map<String, String> selector) {
		this.selector = selector;
	}
	public ScaleStatus putSelector(Map<String, String> selector) {
		this.selector = selector;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		tmpStr += firstLinePrefix + "replicas: " + replicas;
		if (selector != null) {
			tmpStr += "\n" + prefix + "selector:";
			Iterator<Map.Entry<String, String>> iter = selector.entrySet().iterator();
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