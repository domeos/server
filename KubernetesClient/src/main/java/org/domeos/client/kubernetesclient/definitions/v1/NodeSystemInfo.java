package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// NodeSystemInfo
// ==============
// Description:
// 	NodeSystemInfo is a set of ids/uuids to uniquely identify the node.
// Variables:
// 	Name                   	Required	Schema	Default
// 	=======================	========	======	=======
// 	machineID              	true    	string	       
// 	systemUUID             	true    	string	       
// 	bootID                 	true    	string	       
// 	kernelVersion          	true    	string	       
// 	osImage                	true    	string	       
// 	containerRuntimeVersion	true    	string	       
// 	kubeletVersion         	true    	string	       
// 	kubeProxyVersion       	true    	string	       

public class NodeSystemInfo {
	// Machine ID reported by the node.
	private String machineID;

	// System UUID reported by the node.
	private String systemUUID;

	// Boot ID reported by the node.
	private String bootID;

	// Kernel Version reported by the node from uname -r (e.g.
	// 3.16.0-0.bpo.4-amd64).
	private String kernelVersion;

	// OS Image reported by the node from /etc/os-release (e.g. Debian
	// GNU/Linux 7 (wheezy)).
	private String osImage;

	// ContainerRuntime Version reported by the node through runtime remote
	// API (e.g. docker://1.5.0).
	private String containerRuntimeVersion;

	// Kubelet Version reported by the node.
	private String kubeletVersion;

	// KubeProxy Version reported by the node.
	private String kubeProxyVersion;

	public NodeSystemInfo() {
	}
	// for machineID
	public String getMachineID() {
		return machineID;
	}
	public void setMachineID(String machineID) {
		this.machineID = machineID;
	}
	public NodeSystemInfo putMachineID(String machineID) {
		this.machineID = machineID;
		return this;
	}

	// for systemUUID
	public String getSystemUUID() {
		return systemUUID;
	}
	public void setSystemUUID(String systemUUID) {
		this.systemUUID = systemUUID;
	}
	public NodeSystemInfo putSystemUUID(String systemUUID) {
		this.systemUUID = systemUUID;
		return this;
	}

	// for bootID
	public String getBootID() {
		return bootID;
	}
	public void setBootID(String bootID) {
		this.bootID = bootID;
	}
	public NodeSystemInfo putBootID(String bootID) {
		this.bootID = bootID;
		return this;
	}

	// for kernelVersion
	public String getKernelVersion() {
		return kernelVersion;
	}
	public void setKernelVersion(String kernelVersion) {
		this.kernelVersion = kernelVersion;
	}
	public NodeSystemInfo putKernelVersion(String kernelVersion) {
		this.kernelVersion = kernelVersion;
		return this;
	}

	// for osImage
	public String getOsImage() {
		return osImage;
	}
	public void setOsImage(String osImage) {
		this.osImage = osImage;
	}
	public NodeSystemInfo putOsImage(String osImage) {
		this.osImage = osImage;
		return this;
	}

	// for containerRuntimeVersion
	public String getContainerRuntimeVersion() {
		return containerRuntimeVersion;
	}
	public void setContainerRuntimeVersion(String containerRuntimeVersion) {
		this.containerRuntimeVersion = containerRuntimeVersion;
	}
	public NodeSystemInfo putContainerRuntimeVersion(String containerRuntimeVersion) {
		this.containerRuntimeVersion = containerRuntimeVersion;
		return this;
	}

	// for kubeletVersion
	public String getKubeletVersion() {
		return kubeletVersion;
	}
	public void setKubeletVersion(String kubeletVersion) {
		this.kubeletVersion = kubeletVersion;
	}
	public NodeSystemInfo putKubeletVersion(String kubeletVersion) {
		this.kubeletVersion = kubeletVersion;
		return this;
	}

	// for kubeProxyVersion
	public String getKubeProxyVersion() {
		return kubeProxyVersion;
	}
	public void setKubeProxyVersion(String kubeProxyVersion) {
		this.kubeProxyVersion = kubeProxyVersion;
	}
	public NodeSystemInfo putKubeProxyVersion(String kubeProxyVersion) {
		this.kubeProxyVersion = kubeProxyVersion;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (machineID != null) {
			tmpStr += firstLinePrefix + "machineID: " + machineID;
		}
		if (systemUUID != null) {
			tmpStr += "\n" + prefix + "systemUUID: " + systemUUID;
		}
		if (bootID != null) {
			tmpStr += "\n" + prefix + "bootID: " + bootID;
		}
		if (kernelVersion != null) {
			tmpStr += "\n" + prefix + "kernelVersion: " + kernelVersion;
		}
		if (osImage != null) {
			tmpStr += "\n" + prefix + "osImage: " + osImage;
		}
		if (containerRuntimeVersion != null) {
			tmpStr += "\n" + prefix + "containerRuntimeVersion: " + containerRuntimeVersion;
		}
		if (kubeletVersion != null) {
			tmpStr += "\n" + prefix + "kubeletVersion: " + kubeletVersion;
		}
		if (kubeProxyVersion != null) {
			tmpStr += "\n" + prefix + "kubeProxyVersion: " + kubeProxyVersion;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}