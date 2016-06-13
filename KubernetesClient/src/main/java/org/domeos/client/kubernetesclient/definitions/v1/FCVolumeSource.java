package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// FCVolumeSource
// ==============
// Description:
// 	A Fibre Channel Disk can only be mounted as read/write once.
// Variables:
// 	Name      	Required	Schema         	Default
// 	==========	========	===============	=======
// 	targetWWNs	true    	string array   	       
// 	lun       	true    	integer (int32)	       
// 	fsType    	true    	string         	       
// 	readOnly  	false   	boolean        	false  

public class FCVolumeSource {
	// Required: FC target world wide names (WWNs)
	private String[] targetWWNs;

	// Required: FC target lun number
	private int lun;

	// Required: Filesystem type to mount. Must be a filesystem type
	// supported by the host operating system. Ex. "ext4", "xfs", "ntfs"
	private String fsType;

	// Optional: Defaults to false (read/write). ReadOnly here will force
	// the ReadOnly setting in VolumeMounts.
	private boolean readOnly;

	public FCVolumeSource() {
	}
	// for targetWWNs
	public String[] getTargetWWNs() {
		return targetWWNs;
	}
	public void setTargetWWNs(String[] targetWWNs) {
		this.targetWWNs = targetWWNs;
	}
	public FCVolumeSource putTargetWWNs(String[] targetWWNs) {
		this.targetWWNs = targetWWNs;
		return this;
	}

	// for lun
	public int getLun() {
		return lun;
	}
	public void setLun(int lun) {
		this.lun = lun;
	}
	public FCVolumeSource putLun(int lun) {
		this.lun = lun;
		return this;
	}

	// for fsType
	public String getFsType() {
		return fsType;
	}
	public void setFsType(String fsType) {
		this.fsType = fsType;
	}
	public FCVolumeSource putFsType(String fsType) {
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
	public FCVolumeSource putReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (targetWWNs != null) {
			tmpStr += firstLinePrefix + "targetWWNs:";
			for (String ele : targetWWNs) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele;
				}
			}
		}
		tmpStr += "\n" + prefix + "lun: " + lun;
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