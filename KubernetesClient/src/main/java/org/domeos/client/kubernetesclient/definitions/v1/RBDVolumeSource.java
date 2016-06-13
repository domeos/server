package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.LocalObjectReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// RBDVolumeSource
// ===============
// Description:
// 	RBDVolumeSource represents a Rados Block Device Mount that lasts the
// 	lifetime of a pod
// Variables:
// 	Name     	Required	Schema                 	Default
// 	=========	========	=======================	=======
// 	monitors 	true    	string array           	       
// 	image    	true    	string                 	       
// 	fsType   	false   	string                 	       
// 	pool     	true    	string                 	       
// 	user     	true    	string                 	       
// 	keyring  	true    	string                 	       
// 	secretRef	true    	v1.LocalObjectReference	       
// 	readOnly 	false   	boolean                	false  

public class RBDVolumeSource {
	// A collection of Ceph monitors. More info:
	// http://kubernetes.io/v1.1/examples/rbd/README.html#how-to-use-it
	private String[] monitors;

	// The rados image name. More info:
	// http://kubernetes.io/v1.1/examples/rbd/README.html#how-to-use-it
	private String image;

	// Filesystem type of the volume that you want to mount. Tip: Ensure that
	// the filesystem type is supported by the host operating system.
	// Examples: "ext4", "xfs", "ntfs". More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#rbd
	private String fsType;

	// The rados pool name. Default is rbd. More info:
	// http://kubernetes.io/v1.1/examples/rbd/README.html#how-to-use-it
	// .
	private String pool;

	// The rados user name. Default is admin. More info:
	// http://kubernetes.io/v1.1/examples/rbd/README.html#how-to-use-it
	private String user;

	// Keyring is the path to key ring for RBDUser. Default is
	// /etc/ceph/keyring. More info:
	// http://kubernetes.io/v1.1/examples/rbd/README.html#how-to-use-it
	private String keyring;

	// SecretRef is name of the authentication secret for RBDUser. If
	// provided overrides keyring. Default is empty. More info:
	// http://kubernetes.io/v1.1/examples/rbd/README.html#how-to-use-it
	private LocalObjectReference secretRef;

	// ReadOnly here will force the ReadOnly setting in VolumeMounts.
	// Defaults to false. More info:
	// http://kubernetes.io/v1.1/examples/rbd/README.html#how-to-use-it
	private boolean readOnly;

	public RBDVolumeSource() {
	}
	// for monitors
	public String[] getMonitors() {
		return monitors;
	}
	public void setMonitors(String[] monitors) {
		this.monitors = monitors;
	}
	public RBDVolumeSource putMonitors(String[] monitors) {
		this.monitors = monitors;
		return this;
	}

	// for image
	public String getImage() {
		return image;
	}
	public void setImage(String image) {
		this.image = image;
	}
	public RBDVolumeSource putImage(String image) {
		this.image = image;
		return this;
	}

	// for fsType
	public String getFsType() {
		return fsType;
	}
	public void setFsType(String fsType) {
		this.fsType = fsType;
	}
	public RBDVolumeSource putFsType(String fsType) {
		this.fsType = fsType;
		return this;
	}

	// for pool
	public String getPool() {
		return pool;
	}
	public void setPool(String pool) {
		this.pool = pool;
	}
	public RBDVolumeSource putPool(String pool) {
		this.pool = pool;
		return this;
	}

	// for user
	public String getUser() {
		return user;
	}
	public void setUser(String user) {
		this.user = user;
	}
	public RBDVolumeSource putUser(String user) {
		this.user = user;
		return this;
	}

	// for keyring
	public String getKeyring() {
		return keyring;
	}
	public void setKeyring(String keyring) {
		this.keyring = keyring;
	}
	public RBDVolumeSource putKeyring(String keyring) {
		this.keyring = keyring;
		return this;
	}

	// for secretRef
	public LocalObjectReference getSecretRef() {
		return secretRef;
	}
	public void setSecretRef(LocalObjectReference secretRef) {
		this.secretRef = secretRef;
	}
	public RBDVolumeSource putSecretRef(LocalObjectReference secretRef) {
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
	public RBDVolumeSource putReadOnly(boolean readOnly) {
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
		if (image != null) {
			tmpStr += "\n" + prefix + "image: " + image;
		}
		if (fsType != null) {
			tmpStr += "\n" + prefix + "fsType: " + fsType;
		}
		if (pool != null) {
			tmpStr += "\n" + prefix + "pool: " + pool;
		}
		if (user != null) {
			tmpStr += "\n" + prefix + "user: " + user;
		}
		if (keyring != null) {
			tmpStr += "\n" + prefix + "keyring: " + keyring;
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