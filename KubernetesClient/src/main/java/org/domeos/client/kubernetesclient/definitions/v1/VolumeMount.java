package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// VolumeMount
// ===========
// Description:
// 	VolumeMount describes a mounting of a Volume within a container.
// Variables:
// 	Name     	Required	Schema 	Default
// 	=========	========	=======	=======
// 	name     	true    	string 	       
// 	readOnly 	false   	boolean	false  
// 	mountPath	true    	string 	       

public class VolumeMount {
	// This must match the Name of a Volume.
	private String name;

	// Mounted read-only if true, read-write otherwise (false or
	// unspecified). Defaults to false.
	private boolean readOnly;

	// Path within the container at which the volume should be mounted.
	private String mountPath;

	public VolumeMount() {
	}
	// for name
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public VolumeMount putName(String name) {
		this.name = name;
		return this;
	}

	// for readOnly
	public boolean getReadOnly() {
		return readOnly;
	}
	public void setReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
	}
	public VolumeMount putReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
		return this;
	}

	// for mountPath
	public String getMountPath() {
		return mountPath;
	}
	public void setMountPath(String mountPath) {
		this.mountPath = mountPath;
	}
	public VolumeMount putMountPath(String mountPath) {
		this.mountPath = mountPath;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (name != null) {
			tmpStr += firstLinePrefix + "name: " + name;
		}
		tmpStr += "\n" + prefix + "readOnly: " + readOnly;
		if (mountPath != null) {
			tmpStr += "\n" + prefix + "mountPath: " + mountPath;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}