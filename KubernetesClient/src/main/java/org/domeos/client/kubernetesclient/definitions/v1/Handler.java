package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.TCPSocketAction;
import org.domeos.client.kubernetesclient.definitions.v1.HTTPGetAction;
import org.domeos.client.kubernetesclient.definitions.v1.ExecAction;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// Handler
// =======
// Description:
// 	Handler defines a specific action that should be taken
// Variables:
// 	Name     	Required	Schema            	Default
// 	=========	========	==================	=======
// 	exec     	false   	v1.ExecAction     	       
// 	httpGet  	false   	v1.HTTPGetAction  	       
// 	tcpSocket	false   	v1.TCPSocketAction	       

public class Handler {
	// One and only one of the following should be specified. Exec specifies
	// the action to take.
	private ExecAction exec;

	// HTTPGet specifies the http request to perform.
	private HTTPGetAction httpGet;

	// TCPSocket specifies an action involving a TCP port. TCP hooks not yet
	// supported
	private TCPSocketAction tcpSocket;

	public Handler() {
	}
	// for exec
	public ExecAction getExec() {
		return exec;
	}
	public void setExec(ExecAction exec) {
		this.exec = exec;
	}
	public Handler putExec(ExecAction exec) {
		this.exec = exec;
		return this;
	}

	// for httpGet
	public HTTPGetAction getHttpGet() {
		return httpGet;
	}
	public void setHttpGet(HTTPGetAction httpGet) {
		this.httpGet = httpGet;
	}
	public Handler putHttpGet(HTTPGetAction httpGet) {
		this.httpGet = httpGet;
		return this;
	}

	// for tcpSocket
	public TCPSocketAction getTcpSocket() {
		return tcpSocket;
	}
	public void setTcpSocket(TCPSocketAction tcpSocket) {
		this.tcpSocket = tcpSocket;
	}
	public Handler putTcpSocket(TCPSocketAction tcpSocket) {
		this.tcpSocket = tcpSocket;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (exec != null) {
			tmpStr += firstLinePrefix + "exec: ";
			tmpStr += "\n" + exec.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (httpGet != null) {
			tmpStr += "\n" + prefix + "httpGet: ";
			tmpStr += "\n" + httpGet.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (tcpSocket != null) {
			tmpStr += "\n" + prefix + "tcpSocket: ";
			tmpStr += "\n" + tcpSocket.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}