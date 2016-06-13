package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
// TCPSocketAction
// ===============
// Description:
// 	TCPSocketAction describes an action based on opening a socket
// Variables:
// 	Name	Required	Schema	Default
// 	====	========	======	=======
// 	port	true    	string	       

public class TCPSocketAction {
	// Number or name of the port to access on the container. Number must be in
	// the range 1 to 65535. Name must be an IANA_SVC_NAME.
	private int port;

	public TCPSocketAction() {
	}
	// for port
	public int getPort() {
		return port;
	}
	public void setPort(int port) {
		this.port = port;
	}
	public TCPSocketAction putPort(int port) {
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