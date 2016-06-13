package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// AWSElasticBlockStoreVolumeSource
// ================================
// Description:
// 	Represents a persistent disk resource in AWS.
// 	An Amazon Elastic Block Store (EBS) must already be created,
// 	formatted, and reside in the same AWS zone as the kubelet before it can be
// 	mounted. Note: Amazon EBS volumes can be mounted to only one instance at
// 	a time.
// Variables:
// 	Name     	Required	Schema         	Default
// 	=========	========	===============	=======
// 	volumeID 	true    	string         	       
// 	fsType   	true    	string         	       
// 	partition	false   	integer (int32)	       
// 	readOnly 	false   	boolean        	false  

public class AWSElasticBlockStoreVolumeSource {
	// Unique ID of the persistent disk resource in AWS (Amazon EBS volume).
	// More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#awselasticblockstore
	private String volumeID;

	// Filesystem type of the volume that you want to mount. Tip: Ensure that
	// the filesystem type is supported by the host operating system.
	// Examples: "ext4", "xfs", "ntfs". More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#awselasticblockstore
	private String fsType;

	// The partition in the volume that you want to mount. If omitted, the
	// default is to mount by volume name. Examples: For volume /dev/sda1, you
	// specify the partition as "1". Similarly, the volume partition for
	// /dev/sda is "0" (or you can leave the property empty).
	private int partition;

	// Specify "true" to force and set the ReadOnly property in VolumeMounts
	// to "true". If omitted, the default is "false". More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#awselasticblockstore
	private boolean readOnly;

	public AWSElasticBlockStoreVolumeSource() {
	}
	// for volumeID
	public String getVolumeID() {
		return volumeID;
	}
	public void setVolumeID(String volumeID) {
		this.volumeID = volumeID;
	}
	public AWSElasticBlockStoreVolumeSource putVolumeID(String volumeID) {
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
	public AWSElasticBlockStoreVolumeSource putFsType(String fsType) {
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
	public AWSElasticBlockStoreVolumeSource putPartition(int partition) {
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
	public AWSElasticBlockStoreVolumeSource putReadOnly(boolean readOnly) {
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
		tmpStr += "\n" + prefix + "partition: " + partition;
		tmpStr += "\n" + prefix + "readOnly: " + readOnly;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}