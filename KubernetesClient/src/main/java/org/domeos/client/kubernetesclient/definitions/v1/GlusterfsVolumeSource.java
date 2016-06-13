package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// GlusterfsVolumeSource
// =====================
// Description:
// 	GlusterfsVolumeSource represents a Glusterfs Mount that lasts the
// 	lifetime of a pod.
// Variables:
// 	Name     	Required	Schema 	Default
// 	=========	========	=======	=======
// 	endpoints	true    	string 	       
// 	path     	true    	string 	       
// 	readOnly 	false   	boolean	false  

public class GlusterfsVolumeSource {
	// EndpointsName is the endpoint name that details Glusterfs topology.
	// More info:
	// http://kubernetes.io/v1.1/examples/glusterfs/README.html#create-a-pod
	private String endpoints;

	// Path is the Glusterfs volume path. More info:
	// http://kubernetes.io/v1.1/examples/glusterfs/README.html#create-a-pod
	private String path;

	// ReadOnly here will force the Glusterfs volume to be mounted with
	// read-only permissions. Defaults to false. More info:
	// http://kubernetes.io/v1.1/examples/glusterfs/README.html#create-a-pod
	private boolean readOnly;

	public GlusterfsVolumeSource() {
	}
	// for endpoints
	public String getEndpoints() {
		return endpoints;
	}
	public void setEndpoints(String endpoints) {
		this.endpoints = endpoints;
	}
	public GlusterfsVolumeSource putEndpoints(String endpoints) {
		this.endpoints = endpoints;
		return this;
	}

	// for path
	public String getPath() {
		return path;
	}
	public void setPath(String path) {
		this.path = path;
	}
	public GlusterfsVolumeSource putPath(String path) {
		this.path = path;
		return this;
	}

	// for readOnly
	public boolean getReadOnly() {
		return readOnly;
	}
	public void setReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
	}
	public GlusterfsVolumeSource putReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (endpoints != null) {
			tmpStr += firstLinePrefix + "endpoints: " + endpoints;
		}
		if (path != null) {
			tmpStr += "\n" + prefix + "path: " + path;
		}
		tmpStr += "\n" + prefix + "readOnly: " + readOnly;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}