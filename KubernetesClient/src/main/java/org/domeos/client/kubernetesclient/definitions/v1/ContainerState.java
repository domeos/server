package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ContainerStateWaiting;
import org.domeos.client.kubernetesclient.definitions.v1.ContainerStateTerminated;
import org.domeos.client.kubernetesclient.definitions.v1.ContainerStateRunning;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ContainerState
// ==============
// Description:
// 	ContainerState holds a possible state of container. Only one of its
// 	members may be specified. If none of them is specified, the default one
// 	is ContainerStateWaiting.
// Variables:
// 	Name      	Required	Schema                     	Default
// 	==========	========	===========================	=======
// 	waiting   	false   	v1.ContainerStateWaiting   	       
// 	running   	false   	v1.ContainerStateRunning   	       
// 	terminated	false   	v1.ContainerStateTerminated	       

public class ContainerState {
	// Details about a waiting container
	private ContainerStateWaiting waiting;

	// Details about a running container
	private ContainerStateRunning running;

	// Details about a terminated container
	private ContainerStateTerminated terminated;

	public ContainerState() {
	}
	// for waiting
	public ContainerStateWaiting getWaiting() {
		return waiting;
	}
	public void setWaiting(ContainerStateWaiting waiting) {
		this.waiting = waiting;
	}
	public ContainerState putWaiting(ContainerStateWaiting waiting) {
		this.waiting = waiting;
		return this;
	}

	// for running
	public ContainerStateRunning getRunning() {
		return running;
	}
	public void setRunning(ContainerStateRunning running) {
		this.running = running;
	}
	public ContainerState putRunning(ContainerStateRunning running) {
		this.running = running;
		return this;
	}

	// for terminated
	public ContainerStateTerminated getTerminated() {
		return terminated;
	}
	public void setTerminated(ContainerStateTerminated terminated) {
		this.terminated = terminated;
	}
	public ContainerState putTerminated(ContainerStateTerminated terminated) {
		this.terminated = terminated;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (waiting != null) {
			tmpStr += firstLinePrefix + "waiting: ";
			tmpStr += "\n" + waiting.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (running != null) {
			tmpStr += "\n" + prefix + "running: ";
			tmpStr += "\n" + running.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (terminated != null) {
			tmpStr += "\n" + prefix + "terminated: ";
			tmpStr += "\n" + terminated.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}