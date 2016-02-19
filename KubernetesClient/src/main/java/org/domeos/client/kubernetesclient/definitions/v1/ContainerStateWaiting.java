package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ContainerStateWaiting
// =====================
// Description:
// 	ContainerStateWaiting is a waiting state of a container.
// Variables:
// 	Name   	Required	Schema	Default
// 	=======	========	======	=======
// 	reason 	false   	string	       
// 	message	false   	string	       

public class ContainerStateWaiting {
	// (brief) reason the container is not yet running.
	private String reason;

	// Message regarding why the container is not yet running.
	private String message;

	public ContainerStateWaiting() {
	}
	// for reason
	public String getReason() {
		return reason;
	}
	public void setReason(String reason) {
		this.reason = reason;
	}
	public ContainerStateWaiting putReason(String reason) {
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
	public ContainerStateWaiting putMessage(String message) {
		this.message = message;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (reason != null) {
			tmpStr += firstLinePrefix + "reason: " + reason;
		}
		if (message != null) {
			tmpStr += "\n" + prefix + "message: " + message;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}