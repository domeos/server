package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// NFSVolumeSource
// ===============
// Description:
// 	NFSVolumeSource represents an NFS mount that lasts the lifetime of a
// 	pod
// Variables:
// 	Name    	Required	Schema 	Default
// 	========	========	=======	=======
// 	server  	true    	string 	       
// 	path    	true    	string 	       
// 	readOnly	false   	boolean	false  

public class NFSVolumeSource {
	// Server is the hostname or IP address of the NFS server. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#nfs
	private String server;

	// Path that is exported by the NFS server. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#nfs
	private String path;

	// ReadOnly here will force the NFS export to be mounted with read-only
	// permissions. Defaults to false. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#nfs
	private boolean readOnly;

	public NFSVolumeSource() {
	}
	// for server
	public String getServer() {
		return server;
	}
	public void setServer(String server) {
		this.server = server;
	}
	public NFSVolumeSource putServer(String server) {
		this.server = server;
		return this;
	}

	// for path
	public String getPath() {
		return path;
	}
	public void setPath(String path) {
		this.path = path;
	}
	public NFSVolumeSource putPath(String path) {
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
	public NFSVolumeSource putReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (server != null) {
			tmpStr += firstLinePrefix + "server: " + server;
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