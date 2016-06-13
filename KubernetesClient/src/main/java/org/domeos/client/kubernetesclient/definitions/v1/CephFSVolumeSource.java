package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.LocalObjectReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// CephFSVolumeSource
// ==================
// Description:
// 	CephFSVolumeSource represents a Ceph Filesystem Mount that lasts the
// 	lifetime of a pod
// Variables:
// 	Name      	Required	Schema                 	Default
// 	==========	========	=======================	=======
// 	monitors  	true    	string array           	       
// 	user      	false   	string                 	       
// 	secretFile	false   	string                 	       
// 	secretRef 	false   	v1.LocalObjectReference	       
// 	readOnly  	false   	boolean                	false  

public class CephFSVolumeSource {
	// Required: Monitors is a collection of Ceph monitors More info:
	// http://kubernetes.io/v1.1/examples/cephfs/README.html#how-to-use-it
	private String[] monitors;

	// Optional: User is the rados user name, default is admin More info:
	// http://kubernetes.io/v1.1/examples/cephfs/README.html#how-to-use-it
	private String user;

	// Optional: SecretFile is the path to key ring for User, default is
	// /etc/ceph/user.secret More info:
	// http://kubernetes.io/v1.1/examples/cephfs/README.html#how-to-use-it
	private String secretFile;

	// Optional: SecretRef is reference to the authentication secret for
	// User, default is empty. More info:
	// http://kubernetes.io/v1.1/examples/cephfs/README.html#how-to-use-it
	private LocalObjectReference secretRef;

	// Optional: Defaults to false (read/write). ReadOnly here will force
	// the ReadOnly setting in VolumeMounts. More info:
	// http://kubernetes.io/v1.1/examples/cephfs/README.html#how-to-use-it
	private boolean readOnly;

	public CephFSVolumeSource() {
	}
	// for monitors
	public String[] getMonitors() {
		return monitors;
	}
	public void setMonitors(String[] monitors) {
		this.monitors = monitors;
	}
	public CephFSVolumeSource putMonitors(String[] monitors) {
		this.monitors = monitors;
		return this;
	}

	// for user
	public String getUser() {
		return user;
	}
	public void setUser(String user) {
		this.user = user;
	}
	public CephFSVolumeSource putUser(String user) {
		this.user = user;
		return this;
	}

	// for secretFile
	public String getSecretFile() {
		return secretFile;
	}
	public void setSecretFile(String secretFile) {
		this.secretFile = secretFile;
	}
	public CephFSVolumeSource putSecretFile(String secretFile) {
		this.secretFile = secretFile;
		return this;
	}

	// for secretRef
	public LocalObjectReference getSecretRef() {
		return secretRef;
	}
	public void setSecretRef(LocalObjectReference secretRef) {
		this.secretRef = secretRef;
	}
	public CephFSVolumeSource putSecretRef(LocalObjectReference secretRef) {
		this.secretRef = secretRef;
		return this;
	}

	// for readOnly
	public boolean getReadOnly() {
		return readOnly;
	}
	public void setReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
	}
	public CephFSVolumeSource putReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (monitors != null) {
			tmpStr += firstLinePrefix + "monitors:";
			for (String ele : monitors) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele;
				}
			}
		}
		if (user != null) {
			tmpStr += "\n" + prefix + "user: " + user;
		}
		if (secretFile != null) {
			tmpStr += "\n" + prefix + "secretFile: " + secretFile;
		}
		if (secretRef != null) {
			tmpStr += "\n" + prefix + "secretRef: ";
			tmpStr += "\n" + secretRef.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		tmpStr += "\n" + prefix + "readOnly: " + readOnly;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}