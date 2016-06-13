package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
// HTTPGetAction
// =============
// Description:
// 	HTTPGetAction describes an action based on HTTP Get requests.
// Variables:
// 	Name  	Required	Schema	Default
// 	======	========	======	=======
// 	path  	false   	string	       
// 	port  	true    	string	       
// 	host  	false   	string	       
// 	scheme	false   	string	       

public class HTTPGetAction {
	// Path to access on the HTTP server.
	private String path;

	// Name or number of the port to access on the container. Number must be in
	// the range 1 to 65535. Name must be an IANA_SVC_NAME.
	private int port;

	// Host name to connect to, defaults to the pod IP.
	private String host;

	// Scheme to use for connecting to the host. Defaults to HTTP.
	private String scheme;

	public HTTPGetAction() {
	}
	// for path
	public String getPath() {
		return path;
	}
	public void setPath(String path) {
		this.path = path;
	}
	public HTTPGetAction putPath(String path) {
		this.path = path;
		return this;
	}

	// for port
	public int getPort() {
		return port;
	}
	public void setPort(int port) {
		this.port = port;
	}
	public HTTPGetAction putPort(int port) {
		this.port = port;
		return this;
	}

	// for host
	public String getHost() {
		return host;
	}
	public void setHost(String host) {
		this.host = host;
	}
	public HTTPGetAction putHost(String host) {
		this.host = host;
		return this;
	}

	// for scheme
	public String getScheme() {
		return scheme;
	}
	public void setScheme(String scheme) {
		this.scheme = scheme;
	}
	public HTTPGetAction putScheme(String scheme) {
		this.scheme = scheme;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (path != null) {
			tmpStr += firstLinePrefix + "path: " + path;
		}
        tmpStr += "\n" + prefix + "port: " + port;
		if (host != null) {
			tmpStr += "\n" + prefix + "host: " + host;
		}
		if (scheme != null) {
			tmpStr += "\n" + prefix + "scheme: " + scheme;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}