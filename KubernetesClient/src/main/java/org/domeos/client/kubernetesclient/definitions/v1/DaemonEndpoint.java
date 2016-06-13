package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// DaemonEndpoint
// ==============
// Description:
// 	DaemonEndpoint contains information about a single Daemon endpoint.
// Variables:
// 	Name	Required	Schema         	Default
// 	====	========	===============	=======
// 	Port	true    	integer (int32)	       

public class DaemonEndpoint {
	// Port number of the given endpoint.
	@JsonProperty("Port")
	private int port;

	public DaemonEndpoint() {
	}
	// for Port
	public int getPort() {
		return port;
	}
	public void setPort(int port) {
		this.port = port;
	}
	public DaemonEndpoint putPort(int port) {
		this.port = port;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		tmpStr += firstLinePrefix + "port: " + port;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}