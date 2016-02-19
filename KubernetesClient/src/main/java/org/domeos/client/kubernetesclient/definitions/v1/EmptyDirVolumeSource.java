package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// EmptyDirVolumeSource
// ====================
// Description:
// 	EmptyDirVolumeSource is temporary directory that shares a pod’s
// 	lifetime.
// Variables:
// 	Name  	Required	Schema	Default
// 	======	========	======	=======
// 	medium	false   	string	       

public class EmptyDirVolumeSource {
	// What type of storage medium should back this directory. The default is
	// "" which means to use the node’s default medium. Must be an empty string
	// (default) or Memory. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#emptydir
	private String medium;

	public EmptyDirVolumeSource() {
	}
	// for medium
	public String getMedium() {
		return medium;
	}
	public void setMedium(String medium) {
		this.medium = medium;
	}
	public EmptyDirVolumeSource putMedium(String medium) {
		this.medium = medium;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (medium != null) {
			tmpStr += firstLinePrefix + "medium: " + medium;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}