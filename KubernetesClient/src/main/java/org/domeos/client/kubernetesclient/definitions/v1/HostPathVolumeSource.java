package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// HostPathVolumeSource
// ====================
// Description:
// 	HostPathVolumeSource represents bare host directory volume.
// Variables:
// 	Name	Required	Schema	Default
// 	====	========	======	=======
// 	path	true    	string	       

public class HostPathVolumeSource {
	// Path of the directory on the host. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#hostpath
	private String path;

	public HostPathVolumeSource() {
	}
	// for path
	public String getPath() {
		return path;
	}
	public void setPath(String path) {
		this.path = path;
	}
	public HostPathVolumeSource putPath(String path) {
		this.path = path;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (path != null) {
			tmpStr += firstLinePrefix + "path: " + path;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}