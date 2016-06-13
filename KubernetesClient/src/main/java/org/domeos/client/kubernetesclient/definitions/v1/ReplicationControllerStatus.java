package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ReplicationControllerStatus
// ===========================
// Description:
// 	ReplicationControllerStatus represents the current status of a
// 	replication controller.
// Variables:
// 	Name              	Required	Schema         	Default
// 	==================	========	===============	=======
// 	replicas          	true    	integer (int32)	       
// 	observedGeneration	false   	integer (int64)	       

public class ReplicationControllerStatus {
	// Replicas is the most recently oberved number of replicas. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/replication-controller.html#what-is-a-replication-controller
	private int replicas;

	// ObservedGeneration reflects the generation of the most recently
	// observed replication controller.
	private long observedGeneration;

	public ReplicationControllerStatus() {
	}
	// for replicas
	public int getReplicas() {
		return replicas;
	}
	public void setReplicas(int replicas) {
		this.replicas = replicas;
	}
	public ReplicationControllerStatus putReplicas(int replicas) {
		this.replicas = replicas;
		return this;
	}

	// for observedGeneration
	public long getObservedGeneration() {
		return observedGeneration;
	}
	public void setObservedGeneration(long observedGeneration) {
		this.observedGeneration = observedGeneration;
	}
	public ReplicationControllerStatus putObservedGeneration(long observedGeneration) {
		this.observedGeneration = observedGeneration;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		tmpStr += firstLinePrefix + "replicas: " + replicas;
		tmpStr += "\n" + prefix + "observedGeneration: " + observedGeneration;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}