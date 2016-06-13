package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// PersistentVolumeStatus
// ======================
// Description:
// 	PersistentVolumeStatus is the current status of a persistent volume.
// Variables:
// 	Name   	Required	Schema	Default
// 	=======	========	======	=======
// 	phase  	false   	string	       
// 	message	false   	string	       
// 	reason 	false   	string	       

public class PersistentVolumeStatus {
	// Phase indicates if a volume is available, bound to a claim, or released
	// by a claim. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/persistent-volumes.html#phase
	private String phase;

	// A human-readable message indicating details about why the volume is in
	// this state.
	private String message;

	// Reason is a brief CamelCase string that describes any failure and is
	// meant for machine parsing and tidy display in the CLI.
	private String reason;

	public PersistentVolumeStatus() {
	}
	// for phase
	public String getPhase() {
		return phase;
	}
	public void setPhase(String phase) {
		this.phase = phase;
	}
	public PersistentVolumeStatus putPhase(String phase) {
		this.phase = phase;
		return this;
	}

	// for message
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public PersistentVolumeStatus putMessage(String message) {
		this.message = message;
		return this;
	}

	// for reason
	public String getReason() {
		return reason;
	}
	public void setReason(String reason) {
		this.reason = reason;
	}
	public PersistentVolumeStatus putReason(String reason) {
		this.reason = reason;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (phase != null) {
			tmpStr += firstLinePrefix + "phase: " + phase;
		}
		if (message != null) {
			tmpStr += "\n" + prefix + "message: " + message;
		}
		if (reason != null) {
			tmpStr += "\n" + prefix + "reason: " + reason;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}