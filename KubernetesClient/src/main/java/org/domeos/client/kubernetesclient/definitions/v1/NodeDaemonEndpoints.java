package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.DaemonEndpoint;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// NodeDaemonEndpoints
// ===================
// Description:
// 	NodeDaemonEndpoints lists ports opened by daemons running on the
// 	Node.
// Variables:
// 	Name           	Required	Schema           	Default
// 	===============	========	=================	=======
// 	kubeletEndpoint	false   	v1.DaemonEndpoint	       

public class NodeDaemonEndpoints {
	// Endpoint on which Kubelet is listening.
	private DaemonEndpoint kubeletEndpoint;

	public NodeDaemonEndpoints() {
	}
	// for kubeletEndpoint
	public DaemonEndpoint getKubeletEndpoint() {
		return kubeletEndpoint;
	}
	public void setKubeletEndpoint(DaemonEndpoint kubeletEndpoint) {
		this.kubeletEndpoint = kubeletEndpoint;
	}
	public NodeDaemonEndpoints putKubeletEndpoint(DaemonEndpoint kubeletEndpoint) {
		this.kubeletEndpoint = kubeletEndpoint;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (kubeletEndpoint != null) {
			tmpStr += firstLinePrefix + "kubeletEndpoint: ";
			tmpStr += "\n" + kubeletEndpoint.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}