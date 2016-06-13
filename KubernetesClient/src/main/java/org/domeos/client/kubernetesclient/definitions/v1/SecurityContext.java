package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.Capabilities;
import org.domeos.client.kubernetesclient.definitions.v1.SELinuxOptions;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// SecurityContext
// ===============
// Description:
// 	SecurityContext holds security configuration that will be applied to
// 	a container.
// Variables:
// 	Name          	Required	Schema           	Default
// 	==============	========	=================	=======
// 	capabilities  	false   	v1.Capabilities  	       
// 	privileged    	false   	boolean          	false  
// 	seLinuxOptions	false   	v1.SELinuxOptions	       
// 	runAsUser     	false   	integer (int64)  	       
// 	runAsNonRoot  	false   	boolean          	false  

public class SecurityContext {
	// The linux kernel capabilites that should be added or removed. Default
	// to Container.Capabilities if left unset. More info:
	// http://kubernetes.io/v1.1/docs/design/security_context.html#security-context
	private Capabilities capabilities;

	// Run the container in privileged mode. Default to
	// Container.Privileged if left unset. More info:
	// http://kubernetes.io/v1.1/docs/design/security_context.html#security-context
	private boolean privileged;

	// SELinuxOptions are the labels to be applied to the container and
	// volumes. Options that control the SELinux labels applied. More info:
	// http://kubernetes.io/v1.1/docs/design/security_context.html#security-context
	private SELinuxOptions seLinuxOptions;

	// RunAsUser is the UID to run the entrypoint of the container process. The
	// user id that runs the first process in the container. More info:
	// http://kubernetes.io/v1.1/docs/design/security_context.html#security-context
	private long runAsUser;

	// RunAsNonRoot indicates that the container should be run as a non-root
	// user. If the RunAsUser field is not explicitly set then the kubelet may
	// check the image for a specified user or perform defaulting to specify a
	// user.
	private boolean runAsNonRoot;

	public SecurityContext() {
	}
	// for capabilities
	public Capabilities getCapabilities() {
		return capabilities;
	}
	public void setCapabilities(Capabilities capabilities) {
		this.capabilities = capabilities;
	}
	public SecurityContext putCapabilities(Capabilities capabilities) {
		this.capabilities = capabilities;
		return this;
	}

	// for privileged
	public boolean getPrivileged() {
		return privileged;
	}
	public void setPrivileged(boolean privileged) {
		this.privileged = privileged;
	}
	public SecurityContext putPrivileged(boolean privileged) {
		this.privileged = privileged;
		return this;
	}

	// for seLinuxOptions
	public SELinuxOptions getSeLinuxOptions() {
		return seLinuxOptions;
	}
	public void setSeLinuxOptions(SELinuxOptions seLinuxOptions) {
		this.seLinuxOptions = seLinuxOptions;
	}
	public SecurityContext putSeLinuxOptions(SELinuxOptions seLinuxOptions) {
		this.seLinuxOptions = seLinuxOptions;
		return this;
	}

	// for runAsUser
	public long getRunAsUser() {
		return runAsUser;
	}
	public void setRunAsUser(long runAsUser) {
		this.runAsUser = runAsUser;
	}
	public SecurityContext putRunAsUser(long runAsUser) {
		this.runAsUser = runAsUser;
		return this;
	}

	// for runAsNonRoot
	public boolean getRunAsNonRoot() {
		return runAsNonRoot;
	}
	public void setRunAsNonRoot(boolean runAsNonRoot) {
		this.runAsNonRoot = runAsNonRoot;
	}
	public SecurityContext putRunAsNonRoot(boolean runAsNonRoot) {
		this.runAsNonRoot = runAsNonRoot;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (capabilities != null) {
			tmpStr += firstLinePrefix + "capabilities: ";
			tmpStr += "\n" + capabilities.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		tmpStr += "\n" + prefix + "privileged: " + privileged;
		if (seLinuxOptions != null) {
			tmpStr += "\n" + prefix + "seLinuxOptions: ";
			tmpStr += "\n" + seLinuxOptions.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		tmpStr += "\n" + prefix + "runAsUser: " + runAsUser;
		tmpStr += "\n" + prefix + "runAsNonRoot: " + runAsNonRoot;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}