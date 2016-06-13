package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ObjectMeta;
import org.domeos.client.kubernetesclient.definitions.v1.EventSource;
import org.domeos.client.kubernetesclient.definitions.v1.ObjectReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;
import org.domeos.client.kubernetesclient.KubeAPIVersion;

// Event
// =====
// Description:
// 	Event is a report of an event somewhere in the cluster.
// Variables:
// 	Name          	Required	Schema            	Default
// 	==============	========	==================	=======
// 	kind          	false   	string            	       
// 	apiVersion    	false   	string            	       
// 	metadata      	true    	v1.ObjectMeta     	       
// 	involvedObject	true    	v1.ObjectReference	       
// 	reason        	false   	string            	       
// 	message       	false   	string            	       
// 	source        	false   	v1.EventSource    	       
// 	firstTimestamp	false   	string            	       
// 	lastTimestamp 	false   	string            	       
// 	count         	false   	integer (int32)   	       

public class Event {
	// Kind is a string value representing the REST resource this object
	// represents. Servers may infer this from the endpoint the client
	// submits requests to. Cannot be updated. In CamelCase. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#types-kinds
	private String kind;

	// APIVersion defines the versioned schema of this representation of an
	// object. Servers should convert recognized schemas to the latest
	// internal value, and may reject unrecognized values. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#resources
	private String apiVersion;

	// Standard object’s metadata. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#metadata
	private ObjectMeta metadata;

	// The object that this event is about.
	private ObjectReference involvedObject;

	// This should be a short, machine understandable string that gives the
	// reason for the transition into the object’s current status.
	private String reason;

	// A human-readable description of the status of this operation.
	private String message;

	// The component reporting this event. Should be a short machine
	// understandable string.
	private EventSource source;

	// The time at which the event was first recorded. (Time of server receipt
	// is in TypeMeta.)
	private String firstTimestamp;

	// The time at which the most recent occurrence of this event was recorded.
	private String lastTimestamp;

	// The number of times this event has occurred.
	private int count;

	public Event() {
		kind = "Event";
		apiVersion = KubeAPIVersion.v1.toString();
	}
	// for kind
	public String getKind() {
		return kind;
	}
	public void setKind(String kind) {
		this.kind = kind;
	}
	public Event putKind(String kind) {
		this.kind = kind;
		return this;
	}

	// for apiVersion
	public String getApiVersion() {
		return apiVersion;
	}
	public void setApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
	}
	public Event putApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
		return this;
	}

	// for metadata
	public ObjectMeta getMetadata() {
		return metadata;
	}
	public void setMetadata(ObjectMeta metadata) {
		this.metadata = metadata;
	}
	public Event putMetadata(ObjectMeta metadata) {
		this.metadata = metadata;
		return this;
	}

	// for involvedObject
	public ObjectReference getInvolvedObject() {
		return involvedObject;
	}
	public void setInvolvedObject(ObjectReference involvedObject) {
		this.involvedObject = involvedObject;
	}
	public Event putInvolvedObject(ObjectReference involvedObject) {
		this.involvedObject = involvedObject;
		return this;
	}

	// for reason
	public String getReason() {
		return reason;
	}
	public void setReason(String reason) {
		this.reason = reason;
	}
	public Event putReason(String reason) {
		this.reason = reason;
		return this;
	}

	// for message
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public Event putMessage(String message) {
		this.message = message;
		return this;
	}

	// for source
	public EventSource getSource() {
		return source;
	}
	public void setSource(EventSource source) {
		this.source = source;
	}
	public Event putSource(EventSource source) {
		this.source = source;
		return this;
	}

	// for firstTimestamp
	public String getFirstTimestamp() {
		return firstTimestamp;
	}
	public void setFirstTimestamp(String firstTimestamp) {
		this.firstTimestamp = firstTimestamp;
	}
	public Event putFirstTimestamp(String firstTimestamp) {
		this.firstTimestamp = firstTimestamp;
		return this;
	}

	// for lastTimestamp
	public String getLastTimestamp() {
		return lastTimestamp;
	}
	public void setLastTimestamp(String lastTimestamp) {
		this.lastTimestamp = lastTimestamp;
	}
	public Event putLastTimestamp(String lastTimestamp) {
		this.lastTimestamp = lastTimestamp;
		return this;
	}

	// for count
	public int getCount() {
		return count;
	}
	public void setCount(int count) {
		this.count = count;
	}
	public Event putCount(int count) {
		this.count = count;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (kind != null) {
			tmpStr += firstLinePrefix + "kind: " + kind;
		}
		if (apiVersion != null) {
			tmpStr += "\n" + prefix + "apiVersion: " + apiVersion;
		}
		if (metadata != null) {
			tmpStr += "\n" + prefix + "metadata: ";
			tmpStr += "\n" + metadata.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (involvedObject != null) {
			tmpStr += "\n" + prefix + "involvedObject: ";
			tmpStr += "\n" + involvedObject.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (reason != null) {
			tmpStr += "\n" + prefix + "reason: " + reason;
		}
		if (message != null) {
			tmpStr += "\n" + prefix + "message: " + message;
		}
		if (source != null) {
			tmpStr += "\n" + prefix + "source: ";
			tmpStr += "\n" + source.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (firstTimestamp != null) {
			tmpStr += "\n" + prefix + "firstTimestamp: " + firstTimestamp;
		}
		if (lastTimestamp != null) {
			tmpStr += "\n" + prefix + "lastTimestamp: " + lastTimestamp;
		}
		tmpStr += "\n" + prefix + "count: " + count;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}