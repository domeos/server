package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.PodTemplateSpec;
import org.domeos.client.kubernetesclient.definitions.v1beta1.PodSelector;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// JobSpec
// =======
// Description:
// 	JobSpec describes how the job execution will look like.
// Variables:
// 	Name       	Required	Schema             	Default
// 	===========	========	===================	=======
// 	parallelism	false   	integer (int32)    	       
// 	completions	false   	integer (int32)    	       
// 	selector   	false   	v1beta1.PodSelector	       
// 	template   	true    	v1.PodTemplateSpec 	       

public class JobSpec {
	// Parallelism specifies the maximum desired number of pods the job
	// should run at any given time. The actual number of pods running in steady
	// state will be less than this number when ((.spec.completions -
	// .status.successful) < .spec.parallelism), i.e. when the work left to
	// do is less than max parallelism. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/jobs.html
	private int parallelism;

	// Completions specifies the desired number of successfully finished
	// pods the job should be run with. Defaults to 1. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/jobs.html
	private int completions;

	// Selector is a label query over pods that should match the pod count. More
	// info:
	// http://kubernetes.io/v1.1/docs/user-guide/labels.html#label-selectors
	private PodSelector selector;

	// Template is the object that describes the pod that will be created when
	// executing a job. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/jobs.html
	private PodTemplateSpec template;

	public JobSpec() {
	}
	// for parallelism
	public int getParallelism() {
		return parallelism;
	}
	public void setParallelism(int parallelism) {
		this.parallelism = parallelism;
	}
	public JobSpec putParallelism(int parallelism) {
		this.parallelism = parallelism;
		return this;
	}

	// for completions
	public int getCompletions() {
		return completions;
	}
	public void setCompletions(int completions) {
		this.completions = completions;
	}
	public JobSpec putCompletions(int completions) {
		this.completions = completions;
		return this;
	}

	// for selector
	public PodSelector getSelector() {
		return selector;
	}
	public void setSelector(PodSelector selector) {
		this.selector = selector;
	}
	public JobSpec putSelector(PodSelector selector) {
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
	public JobSpec putTemplate(PodTemplateSpec template) {
		this.template = template;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		tmpStr += firstLinePrefix + "parallelism: " + parallelism;
		tmpStr += "\n" + prefix + "completions: " + completions;
		if (selector != null) {
			tmpStr += "\n" + prefix + "selector: ";
			tmpStr += "\n" + selector.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
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