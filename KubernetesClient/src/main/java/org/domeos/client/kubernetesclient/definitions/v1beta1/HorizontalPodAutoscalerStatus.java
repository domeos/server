package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// HorizontalPodAutoscalerStatus
// =============================
// Description:
// 	current status of a horizontal pod autoscaler
// Variables:
// 	Name                           	Required	Schema         	Default
// 	===============================	========	===============	=======
// 	observedGeneration             	false   	integer (int64)	       
// 	lastScaleTime                  	false   	string         	       
// 	currentReplicas                	true    	integer (int32)	       
// 	desiredReplicas                	true    	integer (int32)	       
// 	currentCPUUtilizationPercentage	false   	integer (int32)	       

public class HorizontalPodAutoscalerStatus {
	// most recent generation observed by this autoscaler.
	private long observedGeneration;

	// last time the HorizontalPodAutoscaler scaled the number of pods; used
	// by the autoscaler to control how often the number of pods is changed.
	private String lastScaleTime;

	// current number of replicas of pods managed by this autoscaler.
	private int currentReplicas;

	// desired number of replicas of pods managed by this autoscaler.
	private int desiredReplicas;

	// current average CPU utilization over all pods, represented as a
	// percentage of requested CPU, e.g. 70 means that an average pod is using
	// now 70% of its requested CPU.
	private int currentCPUUtilizationPercentage;

	public HorizontalPodAutoscalerStatus() {
	}
	// for observedGeneration
	public long getObservedGeneration() {
		return observedGeneration;
	}
	public void setObservedGeneration(long observedGeneration) {
		this.observedGeneration = observedGeneration;
	}
	public HorizontalPodAutoscalerStatus putObservedGeneration(long observedGeneration) {
		this.observedGeneration = observedGeneration;
		return this;
	}

	// for lastScaleTime
	public String getLastScaleTime() {
		return lastScaleTime;
	}
	public void setLastScaleTime(String lastScaleTime) {
		this.lastScaleTime = lastScaleTime;
	}
	public HorizontalPodAutoscalerStatus putLastScaleTime(String lastScaleTime) {
		this.lastScaleTime = lastScaleTime;
		return this;
	}

	// for currentReplicas
	public int getCurrentReplicas() {
		return currentReplicas;
	}
	public void setCurrentReplicas(int currentReplicas) {
		this.currentReplicas = currentReplicas;
	}
	public HorizontalPodAutoscalerStatus putCurrentReplicas(int currentReplicas) {
		this.currentReplicas = currentReplicas;
		return this;
	}

	// for desiredReplicas
	public int getDesiredReplicas() {
		return desiredReplicas;
	}
	public void setDesiredReplicas(int desiredReplicas) {
		this.desiredReplicas = desiredReplicas;
	}
	public HorizontalPodAutoscalerStatus putDesiredReplicas(int desiredReplicas) {
		this.desiredReplicas = desiredReplicas;
		return this;
	}

	// for currentCPUUtilizationPercentage
	public int getCurrentCPUUtilizationPercentage() {
		return currentCPUUtilizationPercentage;
	}
	public void setCurrentCPUUtilizationPercentage(int currentCPUUtilizationPercentage) {
		this.currentCPUUtilizationPercentage = currentCPUUtilizationPercentage;
	}
	public HorizontalPodAutoscalerStatus putCurrentCPUUtilizationPercentage(int currentCPUUtilizationPercentage) {
		this.currentCPUUtilizationPercentage = currentCPUUtilizationPercentage;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		tmpStr += firstLinePrefix + "observedGeneration: " + observedGeneration;
		if (lastScaleTime != null) {
			tmpStr += "\n" + prefix + "lastScaleTime: " + lastScaleTime;
		}
		tmpStr += "\n" + prefix + "currentReplicas: " + currentReplicas;
		tmpStr += "\n" + prefix + "desiredReplicas: " + desiredReplicas;
		tmpStr += "\n" + prefix + "currentCPUUtilizationPercentage: " + currentCPUUtilizationPercentage;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}