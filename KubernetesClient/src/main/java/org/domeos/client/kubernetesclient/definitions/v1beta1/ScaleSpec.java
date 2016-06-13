package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ScaleSpec
// =========
// Description:
// 	describes the attributes of a scale subresource
// Variables:
// 	Name    	Required	Schema         	Default
// 	========	========	===============	=======
// 	replicas	false   	integer (int32)	       

public class ScaleSpec {
	// desired number of instances for the scaled object.
	private int replicas;

	public ScaleSpec() {
	}
	// for replicas
	public int getReplicas() {
		return replicas;
	}
	public void setReplicas(int replicas) {
		this.replicas = replicas;
	}
	public ScaleSpec putReplicas(int replicas) {
		this.replicas = replicas;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		tmpStr += firstLinePrefix + "replicas: " + replicas;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}