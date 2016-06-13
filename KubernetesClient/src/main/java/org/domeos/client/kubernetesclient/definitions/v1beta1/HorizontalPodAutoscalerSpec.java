package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1beta1.SubresourceReference;
import org.domeos.client.kubernetesclient.definitions.v1beta1.CPUTargetUtilization;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// HorizontalPodAutoscalerSpec
// ===========================
// Description:
// 	specification of a horizontal pod autoscaler.
// Variables:
// 	Name          	Required	Schema                      	Default
// 	==============	========	============================	=======
// 	scaleRef      	true    	v1beta1.SubresourceReference	       
// 	minReplicas   	false   	integer (int32)             	       
// 	maxReplicas   	true    	integer (int32)             	       
// 	cpuUtilization	false   	v1beta1.CPUTargetUtilization	       

public class HorizontalPodAutoscalerSpec {
	// reference to Scale subresource; horizontal pod autoscaler will learn
	// the current resource consumption from its status, and will set the
	// desired number of pods by modifying its spec.
	private SubresourceReference scaleRef;

	// lower limit for the number of pods that can be set by the autoscaler,
	// default 1.
	private int minReplicas;

	// upper limit for the number of pods that can be set by the autoscaler;
	// cannot be smaller than MinReplicas.
	private int maxReplicas;

	// target average CPU utilization (represented as a percentage of
	// requested CPU) over all the pods; if not specified it defaults to the
	// target CPU utilization at 80% of the requested resources.
	private CPUTargetUtilization cpuUtilization;

	public HorizontalPodAutoscalerSpec() {
	}
	// for scaleRef
	public SubresourceReference getScaleRef() {
		return scaleRef;
	}
	public void setScaleRef(SubresourceReference scaleRef) {
		this.scaleRef = scaleRef;
	}
	public HorizontalPodAutoscalerSpec putScaleRef(SubresourceReference scaleRef) {
		this.scaleRef = scaleRef;
		return this;
	}

	// for minReplicas
	public int getMinReplicas() {
		return minReplicas;
	}
	public void setMinReplicas(int minReplicas) {
		this.minReplicas = minReplicas;
	}
	public HorizontalPodAutoscalerSpec putMinReplicas(int minReplicas) {
		this.minReplicas = minReplicas;
		return this;
	}

	// for maxReplicas
	public int getMaxReplicas() {
		return maxReplicas;
	}
	public void setMaxReplicas(int maxReplicas) {
		this.maxReplicas = maxReplicas;
	}
	public HorizontalPodAutoscalerSpec putMaxReplicas(int maxReplicas) {
		this.maxReplicas = maxReplicas;
		return this;
	}

	// for cpuUtilization
	public CPUTargetUtilization getCpuUtilization() {
		return cpuUtilization;
	}
	public void setCpuUtilization(CPUTargetUtilization cpuUtilization) {
		this.cpuUtilization = cpuUtilization;
	}
	public HorizontalPodAutoscalerSpec putCpuUtilization(CPUTargetUtilization cpuUtilization) {
		this.cpuUtilization = cpuUtilization;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (scaleRef != null) {
			tmpStr += firstLinePrefix + "scaleRef: ";
			tmpStr += "\n" + scaleRef.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		tmpStr += "\n" + prefix + "minReplicas: " + minReplicas;
		tmpStr += "\n" + prefix + "maxReplicas: " + maxReplicas;
		if (cpuUtilization != null) {
			tmpStr += "\n" + prefix + "cpuUtilization: ";
			tmpStr += "\n" + cpuUtilization.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}