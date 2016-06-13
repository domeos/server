package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ISCSIVolumeSource
// =================
// Description:
// 	ISCSIVolumeSource describes an ISCSI Disk can only be mounted as
// 	read/write once.
// Variables:
// 	Name        	Required	Schema         	Default
// 	============	========	===============	=======
// 	targetPortal	true    	string         	       
// 	iqn         	true    	string         	       
// 	lun         	true    	integer (int32)	       
// 	fsType      	true    	string         	       
// 	readOnly    	false   	boolean        	false  

public class ISCSIVolumeSource {
	// iSCSI target portal. The portal is either an IP or ip_addr:port if the
	// port is other than default (typically TCP ports 860 and 3260).
	private String targetPortal;

	// Target iSCSI Qualified Name.
	private String iqn;

	// iSCSI target lun number.
	private int lun;

	// Filesystem type of the volume that you want to mount. Tip: Ensure that
	// the filesystem type is supported by the host operating system.
	// Examples: "ext4", "xfs", "ntfs". More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#iscsi
	private String fsType;

	// ReadOnly here will force the ReadOnly setting in VolumeMounts.
	// Defaults to false.
	private boolean readOnly;

	public ISCSIVolumeSource() {
	}
	// for targetPortal
	public String getTargetPortal() {
		return targetPortal;
	}
	public void setTargetPortal(String targetPortal) {
		this.targetPortal = targetPortal;
	}
	public ISCSIVolumeSource putTargetPortal(String targetPortal) {
		this.targetPortal = targetPortal;
		return this;
	}

	// for iqn
	public String getIqn() {
		return iqn;
	}
	public void setIqn(String iqn) {
		this.iqn = iqn;
	}
	public ISCSIVolumeSource putIqn(String iqn) {
		this.iqn = iqn;
		return this;
	}

	// for lun
	public int getLun() {
		return lun;
	}
	public void setLun(int lun) {
		this.lun = lun;
	}
	public ISCSIVolumeSource putLun(int lun) {
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
	public ISCSIVolumeSource putFsType(String fsType) {
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
	public ISCSIVolumeSource putReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (targetPortal != null) {
			tmpStr += firstLinePrefix + "targetPortal: " + targetPortal;
		}
		if (iqn != null) {
			tmpStr += "\n" + prefix + "iqn: " + iqn;
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