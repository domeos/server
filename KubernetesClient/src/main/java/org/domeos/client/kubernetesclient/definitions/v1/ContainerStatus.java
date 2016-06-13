package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ContainerState;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ContainerStatus
// ===============
// Description:
// 	ContainerStatus contains details for the current status of this
// 	container.
// Variables:
// 	Name        	Required	Schema           	Default
// 	============	========	=================	=======
// 	name        	true    	string           	       
// 	state       	false   	v1.ContainerState	       
// 	lastState   	false   	v1.ContainerState	       
// 	ready       	true    	boolean          	false  
// 	restartCount	true    	integer (int32)  	       
// 	image       	true    	string           	       
// 	imageID     	true    	string           	       
// 	containerID 	false   	string           	       

public class ContainerStatus {
	// This must be a DNS_LABEL. Each container in a pod must have a unique name.
	// Cannot be updated.
	private String name;

	// Details about the container’s current condition.
	private ContainerState state;

	// Details about the container’s last termination condition.
	private ContainerState lastState;

	// Specifies whether the container has passed its readiness probe.
	private boolean ready;

	// The number of times the container has been restarted, currently based
	// on the number of dead containers that have not yet been removed. Note
	// that this is calculated from dead containers. But those containers are
	// subject to garbage collection. This value will get capped at 5 by GC.
	private int restartCount;

	// The image the container is running. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/images.html
	private String image;

	// ImageID of the container’s image.
	private String imageID;

	// Container’s ID in the format docker://<container_id> . More info:
	// http://kubernetes.io/v1.1/docs/user-guide/container-environment.html#container-information
	private String containerID;

	public ContainerStatus() {
	}
	// for name
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public ContainerStatus putName(String name) {
		this.name = name;
		return this;
	}

	// for state
	public ContainerState getState() {
		return state;
	}
	public void setState(ContainerState state) {
		this.state = state;
	}
	public ContainerStatus putState(ContainerState state) {
		this.state = state;
		return this;
	}

	// for lastState
	public ContainerState getLastState() {
		return lastState;
	}
	public void setLastState(ContainerState lastState) {
		this.lastState = lastState;
	}
	public ContainerStatus putLastState(ContainerState lastState) {
		this.lastState = lastState;
		return this;
	}

	// for ready
	public boolean getReady() {
		return ready;
	}
	public void setReady(boolean ready) {
		this.ready = ready;
	}
	public ContainerStatus putReady(boolean ready) {
		this.ready = ready;
		return this;
	}

	// for restartCount
	public int getRestartCount() {
		return restartCount;
	}
	public void setRestartCount(int restartCount) {
		this.restartCount = restartCount;
	}
	public ContainerStatus putRestartCount(int restartCount) {
		this.restartCount = restartCount;
		return this;
	}

	// for image
	public String getImage() {
		return image;
	}
	public void setImage(String image) {
		this.image = image;
	}
	public ContainerStatus putImage(String image) {
		this.image = image;
		return this;
	}

	// for imageID
	public String getImageID() {
		return imageID;
	}
	public void setImageID(String imageID) {
		this.imageID = imageID;
	}
	public ContainerStatus putImageID(String imageID) {
		this.imageID = imageID;
		return this;
	}

	// for containerID
	public String getContainerID() {
		return containerID;
	}
	public void setContainerID(String containerID) {
		this.containerID = containerID;
	}
	public ContainerStatus putContainerID(String containerID) {
		this.containerID = containerID;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (name != null) {
			tmpStr += firstLinePrefix + "name: " + name;
		}
		if (state != null) {
			tmpStr += "\n" + prefix + "state: ";
			tmpStr += "\n" + state.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (lastState != null) {
			tmpStr += "\n" + prefix + "lastState: ";
			tmpStr += "\n" + lastState.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		tmpStr += "\n" + prefix + "ready: " + ready;
		tmpStr += "\n" + prefix + "restartCount: " + restartCount;
		if (image != null) {
			tmpStr += "\n" + prefix + "image: " + image;
		}
		if (imageID != null) {
			tmpStr += "\n" + prefix + "imageID: " + imageID;
		}
		if (containerID != null) {
			tmpStr += "\n" + prefix + "containerID: " + containerID;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}