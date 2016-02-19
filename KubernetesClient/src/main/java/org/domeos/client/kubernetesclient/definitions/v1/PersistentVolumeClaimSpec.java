package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.PersistentVolumeAccessMode;
import org.domeos.client.kubernetesclient.definitions.v1.ResourceRequirements;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// PersistentVolumeClaimSpec
// =========================
// Description:
// 	PersistentVolumeClaimSpec describes the common attributes of
// 	storage devices and allows a Source for provider-specific attributes
// Variables:
// 	Name       	Required	Schema                             	Default
// 	===========	========	===================================	=======
// 	accessModes	false   	v1.PersistentVolumeAccessMode array	       
// 	resources  	false   	v1.ResourceRequirements            	       
// 	volumeName 	false   	string                             	       

public class PersistentVolumeClaimSpec {
	// AccessModes contains the desired access modes the volume should have.
	// More info:
	// http://kubernetes.io/v1.1/docs/user-guide/persistent-volumes.html#access-modes-1
	private PersistentVolumeAccessMode[] accessModes;

	// Resources represents the minimum resources the volume should have.
	// More info:
	// http://kubernetes.io/v1.1/docs/user-guide/persistent-volumes.html#resources
	private ResourceRequirements resources;

	// VolumeName is the binding reference to the PersistentVolume backing
	// this claim.
	private String volumeName;

	public PersistentVolumeClaimSpec() {
	}
	// for accessModes
	public PersistentVolumeAccessMode[] getAccessModes() {
		return accessModes;
	}
	public void setAccessModes(PersistentVolumeAccessMode[] accessModes) {
		this.accessModes = accessModes;
	}
	public PersistentVolumeClaimSpec putAccessModes(PersistentVolumeAccessMode[] accessModes) {
		this.accessModes = accessModes;
		return this;
	}

	// for resources
	public ResourceRequirements getResources() {
		return resources;
	}
	public void setResources(ResourceRequirements resources) {
		this.resources = resources;
	}
	public PersistentVolumeClaimSpec putResources(ResourceRequirements resources) {
		this.resources = resources;
		return this;
	}

	// for volumeName
	public String getVolumeName() {
		return volumeName;
	}
	public void setVolumeName(String volumeName) {
		this.volumeName = volumeName;
	}
	public PersistentVolumeClaimSpec putVolumeName(String volumeName) {
		this.volumeName = volumeName;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (accessModes != null) {
			tmpStr += firstLinePrefix + "accessModes:";
			for (PersistentVolumeAccessMode ele : accessModes) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		if (resources != null) {
			tmpStr += "\n" + prefix + "resources: ";
			tmpStr += "\n" + resources.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (volumeName != null) {
			tmpStr += "\n" + prefix + "volumeName: " + volumeName;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}