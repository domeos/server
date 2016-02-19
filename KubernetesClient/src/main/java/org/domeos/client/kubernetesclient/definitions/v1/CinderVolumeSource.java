package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// CinderVolumeSource
// ==================
// Description:
// 	CinderVolumeSource represents a cinder volume resource in
// 	Openstack. A Cinder volume must exist before mounting to a container.
// 	The volume must also be in the same region as the kubelet.
// Variables:
// 	Name    	Required	Schema 	Default
// 	========	========	=======	=======
// 	volumeID	true    	string 	       
// 	fsType  	false   	string 	       
// 	readOnly	false   	boolean	false  

public class CinderVolumeSource {
	// volume id used to identify the volume in cinder More info:
	// http://kubernetes.io/v1.1/examples/mysql-cinder-pd/README.html
	private String volumeID;

	// Required: Filesystem type to mount. Must be a filesystem type
	// supported by the host operating system. Only ext3 and ext4 are allowed
	// More info:
	// http://kubernetes.io/v1.1/examples/mysql-cinder-pd/README.html
	private String fsType;

	// Optional: Defaults to false (read/write). ReadOnly here will force
	// the ReadOnly setting in VolumeMounts. More info:
	// http://kubernetes.io/v1.1/examples/mysql-cinder-pd/README.html
	private boolean readOnly;

	public CinderVolumeSource() {
	}
	// for volumeID
	public String getVolumeID() {
		return volumeID;
	}
	public void setVolumeID(String volumeID) {
		this.volumeID = volumeID;
	}
	public CinderVolumeSource putVolumeID(String volumeID) {
		this.volumeID = volumeID;
		return this;
	}

	// for fsType
	public String getFsType() {
		return fsType;
	}
	public void setFsType(String fsType) {
		this.fsType = fsType;
	}
	public CinderVolumeSource putFsType(String fsType) {
		this.fsType = fsType;
		return this;
	}

	// for readOnly
	public boolean getReadOnly() {
		return readOnly;
	}
	public void setReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
	}
	public CinderVolumeSource putReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (volumeID != null) {
			tmpStr += firstLinePrefix + "volumeID: " + volumeID;
		}
		if (fsType != null) {
			tmpStr += "\n" + prefix + "fsType: " + fsType;
		}
		tmpStr += "\n" + prefix + "readOnly: " + readOnly;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}