package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import java.util.Iterator;
import java.util.Map;

// ReplicationControllerSpec
// =========================
// Description:
// 	ReplicationControllerSpec is the specification of a replication
// 	controller.
// Variables:
// 	Name    	Required	Schema            	Default
// 	========	========	==================	=======
// 	replicas	false   	integer (int32)   	       
// 	selector	false   	any               	       
// 	template	false   	v1.PodTemplateSpec	       

public class ReplicationControllerSpec {
	// Replicas is the number of desired replicas. This is a pointer to
	// distinguish between explicit zero and unspecified. Defaults to 1.
	// More info:
	// http://kubernetes.io/v1.1/docs/user-guide/replication-controller.html#what-is-a-replication-controller
	// @JsonInclude(value = JsonInclude.Include.ALWAYS)
	private int replicas = -1;

	// Selector is a label query over pods that should match the Replicas
	// count. If Selector is empty, it is defaulted to the labels present on the
	// Pod template. Label keys and values that must match in order to be
	// controlled by this replication controller, if empty defaulted to
	// labels on Pod template. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/labels.html#label-selectors
	private Map<String, String> selector;

	// Template is the object that describes the pod that will be created if
	// insufficient replicas are detected. This takes precedence over a
	// TemplateRef. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/replication-controller.html#pod-template
	private PodTemplateSpec template;

	public ReplicationControllerSpec() {
	}
	// for replicas
	public int getReplicas() {
		return replicas;
	}
	public void setReplicas(int replicas) {
		this.replicas = replicas;
	}
	public ReplicationControllerSpec putReplicas(int replicas) {
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
	public ReplicationControllerSpec putSelector(Map<String, String> selector) {
		this.selector = selector;
		return this;
	}

	// for template
	public PodTemplateSpec getTemplate() {
		return template;
	}
	public void setTemplate(PodTemplateSpec template) {
		this.template = template;
	}
	public ReplicationControllerSpec putTemplate(PodTemplateSpec template) {
		this.template = template;
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
		if (template != null) {
			tmpStr += "\n" + prefix + "template: ";
			tmpStr += "\n" + template.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}