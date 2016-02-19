package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.PersistentVolumeAccessMode;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// PersistentVolumeClaimStatus
// ===========================
// Description:
// 	PersistentVolumeClaimStatus is the current status of a persistent
// 	volume claim.
// Variables:
// 	Name       	Required	Schema                             	Default
// 	===========	========	===================================	=======
// 	phase      	false   	string                             	       
// 	accessModes	false   	v1.PersistentVolumeAccessMode array	       
// 	capacity   	false   	any                                	       

public class PersistentVolumeClaimStatus {
	// Phase represents the current phase of PersistentVolumeClaim.
	private String phase;

	// AccessModes contains the actual access modes the volume backing the
	// PVC has. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/persistent-volumes.html#access-modes-1
	private PersistentVolumeAccessMode[] accessModes;

	// Represents the actual resources of the underlying volume.
	private Map<String, String> capacity;

	public PersistentVolumeClaimStatus() {
	}
	// for phase
	public String getPhase() {
		return phase;
	}
	public void setPhase(String phase) {
		this.phase = phase;
	}
	public PersistentVolumeClaimStatus putPhase(String phase) {
		this.phase = phase;
		return this;
	}

	// for accessModes
	public PersistentVolumeAccessMode[] getAccessModes() {
		return accessModes;
	}
	public void setAccessModes(PersistentVolumeAccessMode[] accessModes) {
		this.accessModes = accessModes;
	}
	public PersistentVolumeClaimStatus putAccessModes(PersistentVolumeAccessMode[] accessModes) {
		this.accessModes = accessModes;
		return this;
	}

	// for capacity
	public Map<String, String> getCapacity() {
		return capacity;
	}
	public void setCapacity(Map<String, String> capacity) {
		this.capacity = capacity;
	}
	public PersistentVolumeClaimStatus putCapacity(Map<String, String> capacity) {
		this.capacity = capacity;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (phase != null) {
			tmpStr += firstLinePrefix + "phase: " + phase;
		}
		if (accessModes != null) {
			tmpStr += "\n" + prefix + "accessModes:";
			for (PersistentVolumeAccessMode ele : accessModes) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		if (capacity != null) {
			tmpStr += "\n" + prefix + "capacity:";
			Iterator<Map.Entry<String, String>> iter = capacity.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, String> entry = iter.next();
				tmpStr += "\n" + prefix + unitPrefix + entry.getKey() + ": " + entry.getValue();
			}
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}