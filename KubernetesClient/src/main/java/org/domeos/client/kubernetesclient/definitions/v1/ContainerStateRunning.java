package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ContainerStateRunning
// =====================
// Description:
// 	ContainerStateRunning is a running state of a container.
// Variables:
// 	Name     	Required	Schema	Default
// 	=========	========	======	=======
// 	startedAt	false   	string	       

public class ContainerStateRunning {
	// Time at which the container was last (re-)started
	private String startedAt;

	public ContainerStateRunning() {
	}
	// for startedAt
	public String getStartedAt() {
		return startedAt;
	}
	public void setStartedAt(String startedAt) {
		this.startedAt = startedAt;
	}
	public ContainerStateRunning putStartedAt(String startedAt) {
		this.startedAt = startedAt;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (startedAt != null) {
			tmpStr += firstLinePrefix + "startedAt: " + startedAt;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}