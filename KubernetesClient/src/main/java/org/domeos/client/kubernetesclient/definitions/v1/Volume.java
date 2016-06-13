package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.CephFSVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.AWSElasticBlockStoreVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.PersistentVolumeClaimVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.GitRepoVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.FlockerVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.DownwardAPIVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.RBDVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.ISCSIVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.FCVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.NFSVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.CinderVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.EmptyDirVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.HostPathVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.GCEPersistentDiskVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.GlusterfsVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.SecretVolumeSource;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// Volume
// ======
// Description:
// 	Volume represents a named volume in a pod that may be accessed by any
// 	container in the pod.
// Variables:
// 	Name                 	Required	Schema                              	Default
// 	=====================	========	====================================	=======
// 	name                 	true    	string                              	       
// 	hostPath             	false   	v1.HostPathVolumeSource             	       
// 	emptyDir             	false   	v1.EmptyDirVolumeSource             	       
// 	gcePersistentDisk    	false   	v1.GCEPersistentDiskVolumeSource    	       
// 	awsElasticBlockStore 	false   	v1.AWSElasticBlockStoreVolumeSource 	       
// 	gitRepo              	false   	v1.GitRepoVolumeSource              	       
// 	secret               	false   	v1.SecretVolumeSource               	       
// 	nfs                  	false   	v1.NFSVolumeSource                  	       
// 	iscsi                	false   	v1.ISCSIVolumeSource                	       
// 	glusterfs            	false   	v1.GlusterfsVolumeSource            	       
// 	persistentVolumeClaim	false   	v1.PersistentVolumeClaimVolumeSource	       
// 	rbd                  	false   	v1.RBDVolumeSource                  	       
// 	cinder               	false   	v1.CinderVolumeSource               	       
// 	cephfs               	false   	v1.CephFSVolumeSource               	       
// 	flocker              	false   	v1.FlockerVolumeSource              	       
// 	downwardAPI          	false   	v1.DownwardAPIVolumeSource          	       
// 	fc                   	false   	v1.FCVolumeSource                   	       

public class Volume {
	// Volume’s name. Must be a DNS_LABEL and unique within the pod. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/identifiers.html#names
	private String name;

	// HostPath represents a pre-existing file or directory on the host
	// machine that is directly exposed to the container. This is generally
	// used for system agents or other privileged things that are allowed to
	// see the host machine. Most containers will NOT need this. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#hostpath
	private HostPathVolumeSource hostPath;

	// EmptyDir represents a temporary directory that shares a pod’s
	// lifetime. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#emptydir
	private EmptyDirVolumeSource emptyDir;

	// GCEPersistentDisk represents a GCE Disk resource that is attached to a
	// kubelet’s host machine and then exposed to the pod. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#gcepersistentdisk
	private GCEPersistentDiskVolumeSource gcePersistentDisk;

	// AWSElasticBlockStore represents an AWS Disk resource that is
	// attached to a kubelet’s host machine and then exposed to the pod. More
	// info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#awselasticblockstore
	private AWSElasticBlockStoreVolumeSource awsElasticBlockStore;

	// GitRepo represents a git repository at a particular revision.
	private GitRepoVolumeSource gitRepo;

	// Secret represents a secret that should populate this volume. More
	// info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#secrets
	private SecretVolumeSource secret;

	// NFS represents an NFS mount on the host that shares a pod’s lifetime More
	// info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#nfs
	private NFSVolumeSource nfs;

	// ISCSI represents an ISCSI Disk resource that is attached to a kubelet’s
	// host machine and then exposed to the pod. More info:
	// http://kubernetes.io/v1.1/examples/iscsi/README.html
	private ISCSIVolumeSource iscsi;

	// Glusterfs represents a Glusterfs mount on the host that shares a pod’s
	// lifetime. More info:
	// http://kubernetes.io/v1.1/examples/glusterfs/README.html
	private GlusterfsVolumeSource glusterfs;

	// PersistentVolumeClaimVolumeSource represents a reference to a
	// PersistentVolumeClaim in the same namespace. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/persistent-volumes.html#persistentvolumeclaims
	private PersistentVolumeClaimVolumeSource persistentVolumeClaim;

	// RBD represents a Rados Block Device mount on the host that shares a pod’s
	// lifetime. More info:
	// http://kubernetes.io/v1.1/examples/rbd/README.html
	private RBDVolumeSource rbd;

	// Cinder represents a cinder volume attached and mounted on kubelets
	// host machine More info:
	// http://kubernetes.io/v1.1/examples/mysql-cinder-pd/README.html
	private CinderVolumeSource cinder;

	// CephFS represents a Ceph FS mount on the host that shares a pod’s
	// lifetime
	private CephFSVolumeSource cephfs;

	// Flocker represents a Flocker volume attached to a kubelet’s host
	// machine. This depends on the Flocker control service being running
	private FlockerVolumeSource flocker;

	// DownwardAPI represents downward API about the pod that should
	// populate this volume
	private DownwardAPIVolumeSource downwardAPI;

	// FC represents a Fibre Channel resource that is attached to a kubelet’s
	// host machine and then exposed to the pod.
	private FCVolumeSource fc;

	public Volume() {
	}
	// for name
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Volume putName(String name) {
		this.name = name;
		return this;
	}

	// for hostPath
	public HostPathVolumeSource getHostPath() {
		return hostPath;
	}
	public void setHostPath(HostPathVolumeSource hostPath) {
		this.hostPath = hostPath;
	}
	public Volume putHostPath(HostPathVolumeSource hostPath) {
		this.hostPath = hostPath;
		return this;
	}

	// for emptyDir
	public EmptyDirVolumeSource getEmptyDir() {
		return emptyDir;
	}
	public void setEmptyDir(EmptyDirVolumeSource emptyDir) {
		this.emptyDir = emptyDir;
	}
	public Volume putEmptyDir(EmptyDirVolumeSource emptyDir) {
		this.emptyDir = emptyDir;
		return this;
	}

	// for gcePersistentDisk
	public GCEPersistentDiskVolumeSource getGcePersistentDisk() {
		return gcePersistentDisk;
	}
	public void setGcePersistentDisk(GCEPersistentDiskVolumeSource gcePersistentDisk) {
		this.gcePersistentDisk = gcePersistentDisk;
	}
	public Volume putGcePersistentDisk(GCEPersistentDiskVolumeSource gcePersistentDisk) {
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
	public Volume putAwsElasticBlockStore(AWSElasticBlockStoreVolumeSource awsElasticBlockStore) {
		this.awsElasticBlockStore = awsElasticBlockStore;
		return this;
	}

	// for gitRepo
	public GitRepoVolumeSource getGitRepo() {
		return gitRepo;
	}
	public void setGitRepo(GitRepoVolumeSource gitRepo) {
		this.gitRepo = gitRepo;
	}
	public Volume putGitRepo(GitRepoVolumeSource gitRepo) {
		this.gitRepo = gitRepo;
		return this;
	}

	// for secret
	public SecretVolumeSource getSecret() {
		return secret;
	}
	public void setSecret(SecretVolumeSource secret) {
		this.secret = secret;
	}
	public Volume putSecret(SecretVolumeSource secret) {
		this.secret = secret;
		return this;
	}

	// for nfs
	public NFSVolumeSource getNfs() {
		return nfs;
	}
	public void setNfs(NFSVolumeSource nfs) {
		this.nfs = nfs;
	}
	public Volume putNfs(NFSVolumeSource nfs) {
		this.nfs = nfs;
		return this;
	}

	// for iscsi
	public ISCSIVolumeSource getIscsi() {
		return iscsi;
	}
	public void setIscsi(ISCSIVolumeSource iscsi) {
		this.iscsi = iscsi;
	}
	public Volume putIscsi(ISCSIVolumeSource iscsi) {
		this.iscsi = iscsi;
		return this;
	}

	// for glusterfs
	public GlusterfsVolumeSource getGlusterfs() {
		return glusterfs;
	}
	public void setGlusterfs(GlusterfsVolumeSource glusterfs) {
		this.glusterfs = glusterfs;
	}
	public Volume putGlusterfs(GlusterfsVolumeSource glusterfs) {
		this.glusterfs = glusterfs;
		return this;
	}

	// for persistentVolumeClaim
	public PersistentVolumeClaimVolumeSource getPersistentVolumeClaim() {
		return persistentVolumeClaim;
	}
	public void setPersistentVolumeClaim(PersistentVolumeClaimVolumeSource persistentVolumeClaim) {
		this.persistentVolumeClaim = persistentVolumeClaim;
	}
	public Volume putPersistentVolumeClaim(PersistentVolumeClaimVolumeSource persistentVolumeClaim) {
		this.persistentVolumeClaim = persistentVolumeClaim;
		return this;
	}

	// for rbd
	public RBDVolumeSource getRbd() {
		return rbd;
	}
	public void setRbd(RBDVolumeSource rbd) {
		this.rbd = rbd;
	}
	public Volume putRbd(RBDVolumeSource rbd) {
		this.rbd = rbd;
		return this;
	}

	// for cinder
	public CinderVolumeSource getCinder() {
		return cinder;
	}
	public void setCinder(CinderVolumeSource cinder) {
		this.cinder = cinder;
	}
	public Volume putCinder(CinderVolumeSource cinder) {
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
	public Volume putCephfs(CephFSVolumeSource cephfs) {
		this.cephfs = cephfs;
		return this;
	}

	// for flocker
	public FlockerVolumeSource getFlocker() {
		return flocker;
	}
	public void setFlocker(FlockerVolumeSource flocker) {
		this.flocker = flocker;
	}
	public Volume putFlocker(FlockerVolumeSource flocker) {
		this.flocker = flocker;
		return this;
	}

	// for downwardAPI
	public DownwardAPIVolumeSource getDownwardAPI() {
		return downwardAPI;
	}
	public void setDownwardAPI(DownwardAPIVolumeSource downwardAPI) {
		this.downwardAPI = downwardAPI;
	}
	public Volume putDownwardAPI(DownwardAPIVolumeSource downwardAPI) {
		this.downwardAPI = downwardAPI;
		return this;
	}

	// for fc
	public FCVolumeSource getFc() {
		return fc;
	}
	public void setFc(FCVolumeSource fc) {
		this.fc = fc;
	}
	public Volume putFc(FCVolumeSource fc) {
		this.fc = fc;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (name != null) {
			tmpStr += firstLinePrefix + "name: " + name;
		}
		if (hostPath != null) {
			tmpStr += "\n" + prefix + "hostPath: ";
			tmpStr += "\n" + hostPath.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (emptyDir != null) {
			tmpStr += "\n" + prefix + "emptyDir: ";
			tmpStr += "\n" + emptyDir.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (gcePersistentDisk != null) {
			tmpStr += "\n" + prefix + "gcePersistentDisk: ";
			tmpStr += "\n" + gcePersistentDisk.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (awsElasticBlockStore != null) {
			tmpStr += "\n" + prefix + "awsElasticBlockStore: ";
			tmpStr += "\n" + awsElasticBlockStore.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (gitRepo != null) {
			tmpStr += "\n" + prefix + "gitRepo: ";
			tmpStr += "\n" + gitRepo.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (secret != null) {
			tmpStr += "\n" + prefix + "secret: ";
			tmpStr += "\n" + secret.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (nfs != null) {
			tmpStr += "\n" + prefix + "nfs: ";
			tmpStr += "\n" + nfs.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (iscsi != null) {
			tmpStr += "\n" + prefix + "iscsi: ";
			tmpStr += "\n" + iscsi.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (glusterfs != null) {
			tmpStr += "\n" + prefix + "glusterfs: ";
			tmpStr += "\n" + glusterfs.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (persistentVolumeClaim != null) {
			tmpStr += "\n" + prefix + "persistentVolumeClaim: ";
			tmpStr += "\n" + persistentVolumeClaim.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (rbd != null) {
			tmpStr += "\n" + prefix + "rbd: ";
			tmpStr += "\n" + rbd.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (cinder != null) {
			tmpStr += "\n" + prefix + "cinder: ";
			tmpStr += "\n" + cinder.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (cephfs != null) {
			tmpStr += "\n" + prefix + "cephfs: ";
			tmpStr += "\n" + cephfs.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (flocker != null) {
			tmpStr += "\n" + prefix + "flocker: ";
			tmpStr += "\n" + flocker.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (downwardAPI != null) {
			tmpStr += "\n" + prefix + "downwardAPI: ";
			tmpStr += "\n" + downwardAPI.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (fc != null) {
			tmpStr += "\n" + prefix + "fc: ";
			tmpStr += "\n" + fc.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}