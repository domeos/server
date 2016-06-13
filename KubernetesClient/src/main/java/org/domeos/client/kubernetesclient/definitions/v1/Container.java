package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
// Container
// =========
// Description:
// 	A single application container that you want to run within a pod.
// Variables:
// 	Name                  	Required	Schema                 	Default
// 	======================	========	=======================	=======
// 	name                  	true    	string                 	       
// 	image                 	false   	string                 	       
// 	command               	false   	string array           	       
// 	args                  	false   	string array           	       
// 	workingDir            	false   	string                 	       
// 	ports                 	false   	v1.ContainerPort array 	       
// 	env                   	false   	v1.EnvVar array        	       
// 	resources             	false   	v1.ResourceRequirements	       
// 	volumeMounts          	false   	v1.VolumeMount array   	       
// 	livenessProbe         	false   	v1.Probe               	       
// 	readinessProbe        	false   	v1.Probe               	       
// 	lifecycle             	false   	v1.Lifecycle           	       
// 	terminationMessagePath	false   	string                 	       
// 	imagePullPolicy       	false   	string                 	       
// 	securityContext       	false   	v1.SecurityContext     	       
// 	stdin                 	false   	boolean                	false  
// 	stdinOnce             	false   	boolean                	false  
// 	tty                   	false   	boolean                	false  

public class Container {
	// Name of the container specified as a DNS_LABEL. Each container in a pod
	// must have a unique name (DNS_LABEL). Cannot be updated.
	private String name;

	// Docker image name. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/images.html
	private String image;

	// Entrypoint array. Not executed within a shell. The docker image’s
	// entrypoint is used if this is not provided. Variable references
	// $(VAR_NAME) are expanded using the container’s environment. If a
	// variable cannot be resolved, the reference in the input string will be
	// unchanged. The $(VAR_NAME) syntax can be escaped with a double $$, ie:
	// $$(VAR_NAME). Escaped references will never be expanded, regardless
	// of whether the variable exists or not. Cannot be updated. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/containers.html#containers-and-commands
	private String[] command;

	// Arguments to the entrypoint. The docker image’s cmd is used if this is
	// not provided. Variable references $(VAR_NAME) are expanded using the
	// container’s environment. If a variable cannot be resolved, the
	// reference in the input string will be unchanged. The $(VAR_NAME)
	// syntax can be escaped with a double $$, ie: $$(VAR_NAME). Escaped
	// references will never be expanded, regardless of whether the variable
	// exists or not. Cannot be updated. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/containers.html#containers-and-commands
	private String[] args;

	// Container’s working directory. Defaults to Docker’s default. D
	// efaults to image’s default. Cannot be updated.
	private String workingDir;

	// List of ports to expose from the container. Cannot be updated.
	private ContainerPort[] ports;

	// List of environment variables to set in the container. Cannot be
	// updated.
	private EnvVar[] env;

	// Compute Resources required by this container. Cannot be updated. More
	// info:
	// http://kubernetes.io/v1.1/docs/user-guide/persistent-volumes.html#resources
	private ResourceRequirements resources;

	// Pod volumes to mount into the container’s filesyste. Cannot be
	// updated.
	private VolumeMount[] volumeMounts;

	// Periodic probe of container liveness. Container will be restarted if
	// the probe fails. Cannot be updated. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/pod-states.html#container-probes
	private Probe livenessProbe;

	// Periodic probe of container service readiness. Container will be
	// removed from service endpoints if the probe fails. Cannot be updated.
	// More info:
	// http://kubernetes.io/v1.1/docs/user-guide/pod-states.html#container-probes
	private Probe readinessProbe;

	// Actions that the management system should take in response to
	// container lifecycle events. Cannot be updated.
	private Lifecycle lifecycle;

	// Optional: Path at which the file to which the container’s termination
	// message will be written is mounted into the container’s filesystem.
	// Message written is intended to be brief final status, such as an
	// assertion failure message. Defaults to /dev/termination-log.
	// Cannot be updated.
	private String terminationMessagePath;

	// Image pull policy. One of Always, Never, IfNotPresent. Defaults to
	// Always if :latest tag is specified, or IfNotPresent otherwise. Cannot
	// be updated. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/images.html#updating-images
	private String imagePullPolicy;

	// Security options the pod should run with. More info:
	// http://kubernetes.io/v1.1/docs/design/security_context.html
	private SecurityContext securityContext;

	// Whether this container should allocate a buffer for stdin in the
	// container runtime. If this is not set, reads from stdin in the container
	// will always result in EOF. Default is false.
	private boolean stdin;

	// Whether the container runtime should close the stdin channel after it
	// has been opened by a single attach. When stdin is true the stdin stream
	// will remain open across multiple attach sessions. If stdinOnce is set
	// to true, stdin is opened on container start, is empty until the first
	// client attaches to stdin, and then remains open and accepts data until
	// the client disconnects, at which time stdin is closed and remains
	// closed until the container is restarted. If this flag is false, a
	// container processes that reads from stdin will never receive an EOF.
	// Default is false
	private boolean stdinOnce;

	// Whether this container should allocate a TTY for itself, also requires
	// stdin to be true. Default is false.
	private boolean tty;

	public Container() {
	}
	// for name
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Container putName(String name) {
		this.name = name;
		return this;
	}

	// for image
	public String getImage() {
		return image;
	}
	public void setImage(String image) {
		this.image = image;
	}
	public Container putImage(String image) {
		this.image = image;
		return this;
	}

	// for command
	public String[] getCommand() {
		return command;
	}
	public void setCommand(String[] command) {
		this.command = command;
	}
	public Container putCommand(String[] command) {
		this.command = command;
		return this;
	}

	// for args
	public String[] getArgs() {
		return args;
	}
	public void setArgs(String[] args) {
		this.args = args;
	}
	public Container putArgs(String[] args) {
		this.args = args;
		return this;
	}

	// for workingDir
	public String getWorkingDir() {
		return workingDir;
	}
	public void setWorkingDir(String workingDir) {
		this.workingDir = workingDir;
	}
	public Container putWorkingDir(String workingDir) {
		this.workingDir = workingDir;
		return this;
	}

	// for ports
	public ContainerPort[] getPorts() {
		return ports;
	}
	public void setPorts(ContainerPort[] ports) {
		this.ports = ports;
	}
	public Container putPorts(ContainerPort[] ports) {
		this.ports = ports;
		return this;
	}

	// for env
	public EnvVar[] getEnv() {
		return env;
	}
	public void setEnv(EnvVar[] env) {
		this.env = env;
	}
	public Container putEnv(EnvVar[] env) {
		this.env = env;
		return this;
	}

	// for resources
	public ResourceRequirements getResources() {
		return resources;
	}
	public void setResources(ResourceRequirements resources) {
		this.resources = resources;
	}
	public Container putResources(ResourceRequirements resources) {
		this.resources = resources;
		return this;
	}

	// for volumeMounts
	public VolumeMount[] getVolumeMounts() {
		return volumeMounts;
	}
	public void setVolumeMounts(VolumeMount[] volumeMounts) {
		this.volumeMounts = volumeMounts;
	}
	public Container putVolumeMounts(VolumeMount[] volumeMounts) {
		this.volumeMounts = volumeMounts;
		return this;
	}

	// for livenessProbe
	public Probe getLivenessProbe() {
		return livenessProbe;
	}
	public void setLivenessProbe(Probe livenessProbe) {
		this.livenessProbe = livenessProbe;
	}
	public Container putLivenessProbe(Probe livenessProbe) {
		this.livenessProbe = livenessProbe;
		return this;
	}

	// for readinessProbe
	public Probe getReadinessProbe() {
		return readinessProbe;
	}
	public void setReadinessProbe(Probe readinessProbe) {
		this.readinessProbe = readinessProbe;
	}
	public Container putReadinessProbe(Probe readinessProbe) {
		this.readinessProbe = readinessProbe;
		return this;
	}

	// for lifecycle
	public Lifecycle getLifecycle() {
		return lifecycle;
	}
	public void setLifecycle(Lifecycle lifecycle) {
		this.lifecycle = lifecycle;
	}
	public Container putLifecycle(Lifecycle lifecycle) {
		this.lifecycle = lifecycle;
		return this;
	}

	// for terminationMessagePath
	public String getTerminationMessagePath() {
		return terminationMessagePath;
	}
	public void setTerminationMessagePath(String terminationMessagePath) {
		this.terminationMessagePath = terminationMessagePath;
	}
	public Container putTerminationMessagePath(String terminationMessagePath) {
		this.terminationMessagePath = terminationMessagePath;
		return this;
	}

	// for imagePullPolicy
	public String getImagePullPolicy() {
		return imagePullPolicy;
	}
	public void setImagePullPolicy(String imagePullPolicy) {
		this.imagePullPolicy = imagePullPolicy;
	}
	public Container putImagePullPolicy(String imagePullPolicy) {
		this.imagePullPolicy = imagePullPolicy;
		return this;
	}

	// for securityContext
	public SecurityContext getSecurityContext() {
		return securityContext;
	}
	public void setSecurityContext(SecurityContext securityContext) {
		this.securityContext = securityContext;
	}
	public Container putSecurityContext(SecurityContext securityContext) {
		this.securityContext = securityContext;
		return this;
	}

	// for stdin
	public boolean getStdin() {
		return stdin;
	}
	public void setStdin(boolean stdin) {
		this.stdin = stdin;
	}
	public Container putStdin(boolean stdin) {
		this.stdin = stdin;
		return this;
	}

	// for stdinOnce
	public boolean getStdinOnce() {
		return stdinOnce;
	}
	public void setStdinOnce(boolean stdinOnce) {
		this.stdinOnce = stdinOnce;
	}
	public Container putStdinOnce(boolean stdinOnce) {
		this.stdinOnce = stdinOnce;
		return this;
	}

	// for tty
	public boolean getTty() {
		return tty;
	}
	public void setTty(boolean tty) {
		this.tty = tty;
	}
	public Container putTty(boolean tty) {
		this.tty = tty;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (name != null) {
			tmpStr += firstLinePrefix + "name: " + name;
		}
		if (image != null) {
			tmpStr += "\n" + prefix + "image: " + image;
		}
		if (command != null) {
			tmpStr += "\n" + prefix + "command:";
			for (String ele : command) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele;
				}
			}
		}
		if (args != null) {
			tmpStr += "\n" + prefix + "args:";
			for (String ele : args) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele;
				}
			}
		}
		if (workingDir != null) {
			tmpStr += "\n" + prefix + "workingDir: " + workingDir;
		}
		if (ports != null) {
			tmpStr += "\n" + prefix + "ports:";
			for (ContainerPort ele : ports) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		if (env != null) {
			tmpStr += "\n" + prefix + "env:";
			for (EnvVar ele : env) {
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
		if (volumeMounts != null) {
			tmpStr += "\n" + prefix + "volumeMounts:";
			for (VolumeMount ele : volumeMounts) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		if (livenessProbe != null) {
			tmpStr += "\n" + prefix + "livenessProbe: ";
			tmpStr += "\n" + livenessProbe.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (readinessProbe != null) {
			tmpStr += "\n" + prefix + "readinessProbe: ";
			tmpStr += "\n" + readinessProbe.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (lifecycle != null) {
			tmpStr += "\n" + prefix + "lifecycle: ";
			tmpStr += "\n" + lifecycle.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (terminationMessagePath != null) {
			tmpStr += "\n" + prefix + "terminationMessagePath: " + terminationMessagePath;
		}
		if (imagePullPolicy != null) {
			tmpStr += "\n" + prefix + "imagePullPolicy: " + imagePullPolicy;
		}
		if (securityContext != null) {
			tmpStr += "\n" + prefix + "securityContext: ";
			tmpStr += "\n" + securityContext.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		tmpStr += "\n" + prefix + "stdin: " + stdin;
		tmpStr += "\n" + prefix + "stdinOnce: " + stdinOnce;
		tmpStr += "\n" + prefix + "tty: " + tty;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}