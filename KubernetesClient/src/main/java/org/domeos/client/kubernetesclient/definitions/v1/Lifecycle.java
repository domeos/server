package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.Handler;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// Lifecycle
// =========
// Description:
// 	Lifecycle describes actions that the management system should take in
// 	response to container lifecycle events. For the PostStart and PreStop
// 	lifecycle handlers, management of the container blocks until the
// 	action is complete, unless the container process fails, in which case
// 	the handler is aborted.
// Variables:
// 	Name     	Required	Schema    	Default
// 	=========	========	==========	=======
// 	postStart	false   	v1.Handler	       
// 	preStop  	false   	v1.Handler	       

public class Lifecycle {
	// PostStart is called immediately after a container is created. If the
	// handler fails, the container is terminated and restarted according to
	// its restart policy. Other management of the container blocks until the
	// hook completes. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/container-environment.html#hook-details
	private Handler postStart;

	// PreStop is called immediately before a container is terminated. The
	// container is terminated after the handler completes. The reason for
	// termination is passed to the handler. Regardless of the outcome of the
	// handler, the container is eventually terminated. Other management of
	// the container blocks until the hook completes. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/container-environment.html#hook-details
	private Handler preStop;

	public Lifecycle() {
	}
	// for postStart
	public Handler getPostStart() {
		return postStart;
	}
	public void setPostStart(Handler postStart) {
		this.postStart = postStart;
	}
	public Lifecycle putPostStart(Handler postStart) {
		this.postStart = postStart;
		return this;
	}

	// for preStop
	public Handler getPreStop() {
		return preStop;
	}
	public void setPreStop(Handler preStop) {
		this.preStop = preStop;
	}
	public Lifecycle putPreStop(Handler preStop) {
		this.preStop = preStop;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (postStart != null) {
			tmpStr += firstLinePrefix + "postStart: ";
			tmpStr += "\n" + postStart.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (preStop != null) {
			tmpStr += "\n" + prefix + "preStop: ";
			tmpStr += "\n" + preStop.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}