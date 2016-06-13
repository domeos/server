package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// GCEPersistentDiskVolumeSource
// =============================
// Description:
// 	GCEPersistentDiskVolumeSource represents a Persistent Disk
// 	resource in Google Compute Engine.
// 	A GCE PD must exist and be formatted before mounting to a container. The
// 	disk must also be in the same GCE project and zone as the kubelet. A GCE PD
// 	can only be mounted as read/write once.
// Variables:
// 	Name     	Required	Schema         	Default
// 	=========	========	===============	=======
// 	pdName   	true    	string         	       
// 	fsType   	true    	string         	       
// 	partition	false   	integer (int32)	       
// 	readOnly 	false   	boolean        	false  

public class GCEPersistentDiskVolumeSource {
	// Unique name of the PD resource in GCE. Used to identify the disk in GCE.
	// More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#gcepersistentdisk
	private String pdName;

	// Filesystem type of the volume that you want to mount. Tip: Ensure that
	// the filesystem type is supported by the host operating system.
	// Examples: "ext4", "xfs", "ntfs". More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#gcepersistentdisk
	private String fsType;

	// The partition in the volume that you want to mount. If omitted, the
	// default is to mount by volume name. Examples: For volume /dev/sda1, you
	// specify the partition as "1". Similarly, the volume partition for
	// /dev/sda is "0" (or you can leave the property empty). More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#gcepersistentdisk
	private int partition;

	// ReadOnly here will force the ReadOnly setting in VolumeMounts.
	// Defaults to false. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#gcepersistentdisk
	private boolean readOnly;

	public GCEPersistentDiskVolumeSource() {
	}
	// for pdName
	public String getPdName() {
		return pdName;
	}
	public void setPdName(String pdName) {
		this.pdName = pdName;
	}
	public GCEPersistentDiskVolumeSource putPdName(String pdName) {
		this.pdName = pdName;
		return this;
	}

	// for fsType
	public String getFsType() {
		return fsType;
	}
	public void setFsType(String fsType) {
		this.fsType = fsType;
	}
	public GCEPersistentDiskVolumeSource putFsType(String fsType) {
		this.fsType = fsType;
		return this;
	}

	// for partition
	public int getPartition() {
		return partition;
	}
	public void setPartition(int partition) {
		this.partition = partition;
	}
	public GCEPersistentDiskVolumeSource putPartition(int partition) {
		this.partition = partition;
		return this;
	}

	// for readOnly
	public boolean getReadOnly() {
		return readOnly;
	}
	public void setReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
	}
	public GCEPersistentDiskVolumeSource putReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (pdName != null) {
			tmpStr += firstLinePrefix + "pdName: " + pdName;
		}
		if (fsType != null) {
			tmpStr += "\n" + prefix + "fsType: " + fsType;
		}
		tmpStr += "\n" + prefix + "partition: " + partition;
		tmpStr += "\n" + prefix + "readOnly: " + readOnly;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}