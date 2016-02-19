package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1beta1.IngressBackend;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// HTTPIngressPath
// ===============
// Description:
// 	IngressPath associates a path regex with an IngressBackend. Incoming
// 	urls matching the Path are forwarded to the Backend.
// Variables:
// 	Name   	Required	Schema                	Default
// 	=======	========	======================	=======
// 	path   	false   	string                	       
// 	backend	true    	v1beta1.IngressBackend	       

public class HTTPIngressPath {
	// Path is a regex matched against the url of an incoming request.
	private String path;

	// Define the referenced service endpoint which the traffic will be
	// forwarded to.
	private IngressBackend backend;

	public HTTPIngressPath() {
	}
	// for path
	public String getPath() {
		return path;
	}
	public void setPath(String path) {
		this.path = path;
	}
	public HTTPIngressPath putPath(String path) {
		this.path = path;
		return this;
	}

	// for backend
	public IngressBackend getBackend() {
		return backend;
	}
	public void setBackend(IngressBackend backend) {
		this.backend = backend;
	}
	public HTTPIngressPath putBackend(IngressBackend backend) {
		this.backend = backend;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (path != null) {
			tmpStr += firstLinePrefix + "path: " + path;
		}
		if (backend != null) {
			tmpStr += "\n" + prefix + "backend: ";
			tmpStr += "\n" + backend.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}