package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// NamespaceStatus
// ===============
// Description:
// 	NamespaceStatus is information about the current status of a
// 	Namespace.
// Variables:
// 	Name 	Required	Schema	Default
// 	=====	========	======	=======
// 	phase	false   	string	       

public class NamespaceStatus {
	// Phase is the current lifecycle phase of the namespace. More info:
	// http://kubernetes.io/v1.1/docs/design/namespaces.html#phases
	private String phase;

	public NamespaceStatus() {
	}
	// for phase
	public String getPhase() {
		return phase;
	}
	public void setPhase(String phase) {
		this.phase = phase;
	}
	public NamespaceStatus putPhase(String phase) {
		this.phase = phase;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (phase != null) {
			tmpStr += firstLinePrefix + "phase: " + phase;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}