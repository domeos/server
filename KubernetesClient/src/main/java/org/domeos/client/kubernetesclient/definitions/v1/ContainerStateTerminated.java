package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ContainerStateTerminated
// ========================
// Description:
// 	ContainerStateTerminated is a terminated state of a container.
// Variables:
// 	Name       	Required	Schema         	Default
// 	===========	========	===============	=======
// 	exitCode   	true    	integer (int32)	       
// 	signal     	false   	integer (int32)	       
// 	reason     	false   	string         	       
// 	message    	false   	string         	       
// 	startedAt  	false   	string         	       
// 	finishedAt 	false   	string         	       
// 	containerID	false   	string         	       

public class ContainerStateTerminated {
	// Exit status from the last termination of the container
	private int exitCode;

	// Signal from the last termination of the container
	private int signal;

	// (brief) reason from the last termination of the container
	private String reason;

	// Message regarding the last termination of the container
	private String message;

	// Time at which previous execution of the container started
	private String startedAt;

	// Time at which the container last terminated
	private String finishedAt;

	// Container’s ID in the format docker://<container_id>
	private String containerID;

	public ContainerStateTerminated() {
	}
	// for exitCode
	public int getExitCode() {
		return exitCode;
	}
	public void setExitCode(int exitCode) {
		this.exitCode = exitCode;
	}
	public ContainerStateTerminated putExitCode(int exitCode) {
		this.exitCode = exitCode;
		return this;
	}

	// for signal
	public int getSignal() {
		return signal;
	}
	public void setSignal(int signal) {
		this.signal = signal;
	}
	public ContainerStateTerminated putSignal(int signal) {
		this.signal = signal;
		return this;
	}

	// for reason
	public String getReason() {
		return reason;
	}
	public void setReason(String reason) {
		this.reason = reason;
	}
	public ContainerStateTerminated putReason(String reason) {
		this.reason = reason;
		return this;
	}

	// for message
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public ContainerStateTerminated putMessage(String message) {
		this.message = message;
		return this;
	}

	// for startedAt
	public String getStartedAt() {
		return startedAt;
	}
	public void setStartedAt(String startedAt) {
		this.startedAt = startedAt;
	}
	public ContainerStateTerminated putStartedAt(String startedAt) {
		this.startedAt = startedAt;
		return this;
	}

	// for finishedAt
	public String getFinishedAt() {
		return finishedAt;
	}
	public void setFinishedAt(String finishedAt) {
		this.finishedAt = finishedAt;
	}
	public ContainerStateTerminated putFinishedAt(String finishedAt) {
		this.finishedAt = finishedAt;
		return this;
	}

	// for containerID
	public String getContainerID() {
		return containerID;
	}
	public void setContainerID(String containerID) {
		this.containerID = containerID;
	}
	public ContainerStateTerminated putContainerID(String containerID) {
		this.containerID = containerID;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		tmpStr += firstLinePrefix + "exitCode: " + exitCode;
		tmpStr += "\n" + prefix + "signal: " + signal;
		if (reason != null) {
			tmpStr += "\n" + prefix + "reason: " + reason;
		}
		if (message != null) {
			tmpStr += "\n" + prefix + "message: " + message;
		}
		if (startedAt != null) {
			tmpStr += "\n" + prefix + "startedAt: " + startedAt;
		}
		if (finishedAt != null) {
			tmpStr += "\n" + prefix + "finishedAt: " + finishedAt;
		}
		if (containerID != null) {
			tmpStr += "\n" + prefix + "containerID: " + containerID;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}