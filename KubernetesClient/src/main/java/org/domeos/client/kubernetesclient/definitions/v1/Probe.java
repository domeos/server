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

// Probe
// =====
// Description:
// 	Probe describes a liveness probe to be examined to the container.
// Variables:
// 	Name               	Required	Schema            	Default
// 	===================	========	==================	=======
// 	exec               	false   	v1.ExecAction     	       
// 	httpGet            	false   	v1.HTTPGetAction  	       
// 	tcpSocket          	false   	v1.TCPSocketAction	       
// 	initialDelaySeconds	false   	integer (int64)   	       
// 	timeoutSeconds     	false   	integer (int64)   	       

public class Probe {
	// One and only one of the following should be specified. Exec specifies
	// the action to take.
	private ExecAction exec;

	// HTTPGet specifies the http request to perform.
	private HTTPGetAction httpGet;

	// TCPSocket specifies an action involving a TCP port. TCP hooks not yet
	// supported
	private TCPSocketAction tcpSocket;

	// Number of seconds after the container has started before liveness
	// probes are initiated. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/pod-states.html#container-probes
	private long initialDelaySeconds;

	// Number of seconds after which liveness probes timeout. Defaults to 1
	// second. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/pod-states.html#container-probes
	private long timeoutSeconds;

	public Probe() {
	}
	// for exec
	public ExecAction getExec() {
		return exec;
	}
	public void setExec(ExecAction exec) {
		this.exec = exec;
	}
	public Probe putExec(ExecAction exec) {
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
	public Probe putHttpGet(HTTPGetAction httpGet) {
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
	public Probe putTcpSocket(TCPSocketAction tcpSocket) {
		this.tcpSocket = tcpSocket;
		return this;
	}

	// for initialDelaySeconds
	public long getInitialDelaySeconds() {
		return initialDelaySeconds;
	}
	public void setInitialDelaySeconds(long initialDelaySeconds) {
		this.initialDelaySeconds = initialDelaySeconds;
	}
	public Probe putInitialDelaySeconds(long initialDelaySeconds) {
		this.initialDelaySeconds = initialDelaySeconds;
		return this;
	}

	// for timeoutSeconds
	public long getTimeoutSeconds() {
		return timeoutSeconds;
	}
	public void setTimeoutSeconds(long timeoutSeconds) {
		this.timeoutSeconds = timeoutSeconds;
	}
	public Probe putTimeoutSeconds(long timeoutSeconds) {
		this.timeoutSeconds = timeoutSeconds;
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
		tmpStr += "\n" + prefix + "initialDelaySeconds: " + initialDelaySeconds;
		tmpStr += "\n" + prefix + "timeoutSeconds: " + timeoutSeconds;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}