package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.PersistentVolumeAccessMode;
import org.domeos.client.kubernetesclient.definitions.v1.CephFSVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.GlusterfsVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.FlockerVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.RBDVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.ISCSIVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.FCVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.ObjectReference;
import org.domeos.client.kubernetesclient.definitions.v1.CinderVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.NFSVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.HostPathVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.GCEPersistentDiskVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.AWSElasticBlockStoreVolumeSource;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// PersistentVolumeSpec
// ====================
// Description:
// 	PersistentVolumeSpec is the specification of a persistent volume.
// Variables:
// 	Name                         	Required	Schema                             	Default
// 	=============================	========	===================================	=======
// 	capacity                     	false   	any                                	       
// 	gcePersistentDisk            	false   	v1.GCEPersistentDiskVolumeSource   	       
// 	awsElasticBlockStore         	false   	v1.AWSElasticBlockStoreVolumeSource	       
// 	hostPath                     	false   	v1.HostPathVolumeSource            	       
// 	glusterfs                    	false   	v1.GlusterfsVolumeSource           	       
// 	nfs                          	false   	v1.NFSVolumeSource                 	       
// 	rbd                          	false   	v1.RBDVolumeSource                 	       
// 	iscsi                        	false   	v1.ISCSIVolumeSource               	       
// 	cinder                       	false   	v1.CinderVolumeSource              	       
// 	cephfs                       	false   	v1.CephFSVolumeSource              	       
// 	fc                           	false   	v1.FCVolumeSource                  	       
// 	flocker                      	false   	v1.FlockerVolumeSource             	       
// 	accessModes                  	false   	v1.PersistentVolumeAccessMode array	       
// 	claimRef                     	false   	v1.ObjectReference                 	       
// 	persistentVolumeReclaimPolicy	false   	string                             	       

public class PersistentVolumeSpec {
	// A description of the persistent volume’s resources and capacity. More
	// info:
	// http://kubernetes.io/v1.1/docs/user-guide/persistent-volumes.html#capacity
	private Map<String, String> capacity;

	// GCEPersistentDisk represents a GCE Disk resource that is attached to a
	// kubelet’s host machine and then exposed to the pod. Provisioned by an
	// admin. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#gcepersistentdisk
	private GCEPersistentDiskVolumeSource gcePersistentDisk;

	// AWSElasticBlockStore represents an AWS Disk resource that is
	// attached to a kubelet’s host machine and then exposed to the pod. More
	// info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#awselasticblockstore
	private AWSElasticBlockStoreVolumeSource awsElasticBlockStore;

	// HostPath represents a directory on the host. Provisioned by a
	// developer or tester. This is useful for single-node development and
	// testing only! On-host storage is not supported in any way and WILL NOT
	// WORK in a multi-node cluster. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#hostpath
	private HostPathVolumeSource hostPath;

	// Glusterfs represents a Glusterfs volume that is attached to a host and
	// exposed to the pod. Provisioned by an admin. More info:
	// http://kubernetes.io/v1.1/examples/glusterfs/README.html
	private GlusterfsVolumeSource glusterfs;

	// NFS represents an NFS mount on the host. Provisioned by an admin. More
	// info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#nfs
	private NFSVolumeSource nfs;

	// RBD represents a Rados Block Device mount on the host that shares a pod’s
	// lifetime. More info:
	// http://kubernetes.io/v1.1/examples/rbd/README.html
	private RBDVolumeSource rbd;

	// ISCSI represents an ISCSI Disk resource that is attached to a kubelet’s
	// host machine and then exposed to the pod. Provisioned by an admin.
	private ISCSIVolumeSource iscsi;

	// Cinder represents a cinder volume attached and mounted on kubelets
	// host machine More info:
	// http://kubernetes.io/v1.1/examples/mysql-cinder-pd/README.html
	private CinderVolumeSource cinder;

	// CephFS represents a Ceph FS mount on the host that shares a pod’s
	// lifetime
	private CephFSVolumeSource cephfs;

	// FC represents a Fibre Channel resource that is attached to a kubelet’s
	// host machine and then exposed to the pod.
	private FCVolumeSource fc;

	// Flocker represents a Flocker volume attached to a kubelet’s host
	// machine and exposed to the pod for its usage. This depends on the Flocker
	// control service being running
	private FlockerVolumeSource flocker;

	// AccessModes contains all ways the volume can be mounted. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/persistent-volumes.html#access-modes
	private PersistentVolumeAccessMode[] accessModes;

	// ClaimRef is part of a bi-directional binding between
	// PersistentVolume and PersistentVolumeClaim. Expected to be non-nil
	// when bound. claim.VolumeName is the authoritative bind between PV and
	// PVC. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/persistent-volumes.html#binding
	private ObjectReference claimRef;

	// What happens to a persistent volume when released from its claim. Valid
	// options are Retain (default) and Recycle. Recyling must be supported
	// by the volume plugin underlying this persistent volume. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/persistent-volumes.html#recycling-policy
	private String persistentVolumeReclaimPolicy;

	public PersistentVolumeSpec() {
	}
	// for capacity
	public Map<String, String> getCapacity() {
		return capacity;
	}
	public void setCapacity(Map<String, String> capacity) {
		this.capacity = capacity;
	}
	public PersistentVolumeSpec putCapacity(Map<String, String> capacity) {
		this.capacity = capacity;
		return this;
	}

	// for gcePersistentDisk
	public GCEPersistentDiskVolumeSource getGcePersistentDisk() {
		return gcePersistentDisk;
	}
	public void setGcePersistentDisk(GCEPersistentDiskVolumeSource gcePersistentDisk) {
		this.gcePersistentDisk = gcePersistentDisk;
	}
	public PersistentVolumeSpec putGcePersistentDisk(GCEPersistentDiskVolumeSource gcePersistentDisk) {
		this.gcePersistentDisk = gcePersistentDisk;
		return this;
	}

	// for awsElasticBlockStore
	public AWSElasticBlockStoreVolumeSource getAwsElasticBlockStore() {
		return awsElasticBlockStore;
	}
	public void setAwsElasticBlockStore(AWSElasticBlockStoreVolumeSource awsElasticBlockStore) {
		this.awsElasticBlockStore = awsElasticBlockStore;
	}
	public PersistentVolumeSpec putAwsElasticBlockStore(AWSElasticBlockStoreVolumeSource awsElasticBlockStore) {
		this.awsElasticBlockStore = awsElasticBlockStore;
		return this;
	}

	// for hostPath
	public HostPathVolumeSource getHostPath() {
		return hostPath;
	}
	public void setHostPath(HostPathVolumeSource hostPath) {
		this.hostPath = hostPath;
	}
	public PersistentVolumeSpec putHostPath(HostPathVolumeSource hostPath) {
		this.hostPath = hostPath;
		return this;
	}

	// for glusterfs
	public GlusterfsVolumeSource getGlusterfs() {
		return glusterfs;
	}
	public void setGlusterfs(GlusterfsVolumeSource glusterfs) {
		this.glusterfs = glusterfs;
	}
	public PersistentVolumeSpec putGlusterfs(GlusterfsVolumeSource glusterfs) {
		this.glusterfs = glusterfs;
		return this;
	}

	// for nfs
	public NFSVolumeSource getNfs() {
		return nfs;
	}
	public void setNfs(NFSVolumeSource nfs) {
		this.nfs = nfs;
	}
	public PersistentVolumeSpec putNfs(NFSVolumeSource nfs) {
		this.nfs = nfs;
		return this;
	}

	// for rbd
	public RBDVolumeSource getRbd() {
		return rbd;
	}
	public void setRbd(RBDVolumeSource rbd) {
		this.rbd = rbd;
	}
	public PersistentVolumeSpec putRbd(RBDVolumeSource rbd) {
		this.rbd = rbd;
		return this;
	}

	// for iscsi
	public ISCSIVolumeSource getIscsi() {
		return iscsi;
	}
	public void setIscsi(ISCSIVolumeSource iscsi) {
		this.iscsi = iscsi;
	}
	public PersistentVolumeSpec putIscsi(ISCSIVolumeSource iscsi) {
		this.iscsi = iscsi;
		return this;
	}

	// for cinder
	public CinderVolumeSource getCinder() {
		return cinder;
	}
	public void setCinder(CinderVolumeSource cinder) {
		this.cinder = cinder;
	}
	public PersistentVolumeSpec putCinder(CinderVolumeSource cinder) {
		this.cinder = cinder;
		return this;
	}

	// for cephfs
	public CephFSVolumeSource getCephfs() {
		return cephfs;
	}
	public void setCephfs(CephFSVolumeSource cephfs) {
		this.cephfs = cephfs;
	}
	public PersistentVolumeSpec putCephfs(CephFSVolumeSource cephfs) {
		this.cephfs = cephfs;
		return this;
	}

	// for fc
	public FCVolumeSource getFc() {
		return fc;
	}
	public void setFc(FCVolumeSource fc) {
		this.fc = fc;
	}
	public PersistentVolumeSpec putFc(FCVolumeSource fc) {
		this.fc = fc;
		return this;
	}

	// for flocker
	public FlockerVolumeSource getFlocker() {
		return flocker;
	}
	public void setFlocker(FlockerVolumeSource flocker) {
		this.flocker = flocker;
	}
	public PersistentVolumeSpec putFlocker(FlockerVolumeSource flocker) {
		this.flocker = flocker;
		return this;
	}

	// for accessModes
	public PersistentVolumeAccessMode[] getAccessModes() {
		return accessModes;
	}
	public void setAccessModes(PersistentVolumeAccessMode[] accessModes) {
		this.accessModes = accessModes;
	}
	public PersistentVolumeSpec putAccessModes(PersistentVolumeAccessMode[] accessModes) {
		this.accessModes = accessModes;
		return this;
	}

	// for claimRef
	public ObjectReference getClaimRef() {
		return claimRef;
	}
	public void setClaimRef(ObjectReference claimRef) {
		this.claimRef = claimRef;
	}
	public PersistentVolumeSpec putClaimRef(ObjectReference claimRef) {
		this.claimRef = claimRef;
		return this;
	}

	// for persistentVolumeReclaimPolicy
	public String getPersistentVolumeReclaimPolicy() {
		return persistentVolumeReclaimPolicy;
	}
	public void setPersistentVolumeReclaimPolicy(String persistentVolumeReclaimPolicy) {
		this.persistentVolumeReclaimPolicy = persistentVolumeReclaimPolicy;
	}
	public PersistentVolumeSpec putPersistentVolumeReclaimPolicy(String persistentVolumeReclaimPolicy) {
		this.persistentVolumeReclaimPolicy = persistentVolumeReclaimPolicy;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (capacity != null) {
			tmpStr += firstLinePrefix + "capacity:";
			Iterator<Map.Entry<String, String>> iter = capacity.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, String> entry = iter.next();
				tmpStr += "\n" + prefix + unitPrefix + entry.getKey() + ": " + entry.getValue();
			}
		}
		if (gcePersistentDisk != null) {
			tmpStr += "\n" + prefix + "gcePersistentDisk: ";
			tmpStr += "\n" + gcePersistentDisk.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (awsElasticBlockStore != null) {
			tmpStr += "\n" + prefix + "awsElasticBlockStore: ";
			tmpStr += "\n" + awsElasticBlockStore.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (hostPath != null) {
			tmpStr += "\n" + prefix + "hostPath: ";
			tmpStr += "\n" + hostPath.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (glusterfs != null) {
			tmpStr += "\n" + prefix + "glusterfs: ";
			tmpStr += "\n" + glusterfs.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (nfs != null) {
			tmpStr += "\n" + prefix + "nfs: ";
			tmpStr += "\n" + nfs.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (rbd != null) {
			tmpStr += "\n" + prefix + "rbd: ";
			tmpStr += "\n" + rbd.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (iscsi != null) {
			tmpStr += "\n" + prefix + "iscsi: ";
			tmpStr += "\n" + iscsi.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (cinder != null) {
			tmpStr += "\n" + prefix + "cinder: ";
			tmpStr += "\n" + cinder.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (cephfs != null) {
			tmpStr += "\n" + prefix + "cephfs: ";
			tmpStr += "\n" + cephfs.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (fc != null) {
			tmpStr += "\n" + prefix + "fc: ";
			tmpStr += "\n" + fc.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (flocker != null) {
			tmpStr += "\n" + prefix + "flocker: ";
			tmpStr += "\n" + flocker.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
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
		if (claimRef != null) {
			tmpStr += "\n" + prefix + "claimRef: ";
			tmpStr += "\n" + claimRef.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (persistentVolumeReclaimPolicy != null) {
			tmpStr += "\n" + prefix + "persistentVolumeReclaimPolicy: " + persistentVolumeReclaimPolicy;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}