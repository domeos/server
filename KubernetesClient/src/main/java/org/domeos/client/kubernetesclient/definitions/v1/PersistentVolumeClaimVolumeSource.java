package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// PersistentVolumeClaimVolumeSource
// =================================
// Description:
// 	PersistentVolumeClaimVolumeSource references the user’s PVC in the
// 	same namespace. This volume finds the bound PV and mounts that volume
// 	for the pod. A PersistentVolumeClaimVolumeSource is, essentially, a
// 	wrapper around another type of volume that is owned by someone else (the
// 	system).
// Variables:
// 	Name     	Required	Schema 	Default
// 	=========	========	=======	=======
// 	claimName	true    	string 	       
// 	readOnly 	false   	boolean	false  

public class PersistentVolumeClaimVolumeSource {
	// ClaimName is the name of a PersistentVolumeClaim in the same namespace
	// as the pod using this volume. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/persistent-volumes.html#persistentvolumeclaims
	private String claimName;

	// Will force the ReadOnly setting in VolumeMounts. Default false.
	private boolean readOnly;

	public PersistentVolumeClaimVolumeSource() {
	}
	// for claimName
	public String getClaimName() {
		return claimName;
	}
	public void setClaimName(String claimName) {
		this.claimName = claimName;
	}
	public PersistentVolumeClaimVolumeSource putClaimName(String claimName) {
		this.claimName = claimName;
		return this;
	}

	// for readOnly
	public boolean getReadOnly() {
		return readOnly;
	}
	public void setReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
	}
	public PersistentVolumeClaimVolumeSource putReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (claimName != null) {
			tmpStr += firstLinePrefix + "claimName: " + claimName;
		}
		tmpStr += "\n" + prefix + "readOnly: " + readOnly;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}