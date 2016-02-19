package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ObjectReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// EndpointAddress
// ===============
// Description:
// 	EndpointAddress is a tuple that describes single IP address.
// Variables:
// 	Name     	Required	Schema            	Default
// 	=========	========	==================	=======
// 	ip       	true    	string            	       
// 	targetRef	false   	v1.ObjectReference	       

public class EndpointAddress {
	// The IP of this endpoint. May not be loopback (127.0.0.0/8), link-local
	// (169.254.0.0/16), or link-local multicast ((224.0.0.0/24).
	private String ip;

	// Reference to object providing the endpoint.
	private ObjectReference targetRef;

	public EndpointAddress() {
	}
	// for ip
	public String getIp() {
		return ip;
	}
	public void setIp(String ip) {
		this.ip = ip;
	}
	public EndpointAddress putIp(String ip) {
		this.ip = ip;
		return this;
	}

	// for targetRef
	public ObjectReference getTargetRef() {
		return targetRef;
	}
	public void setTargetRef(ObjectReference targetRef) {
		this.targetRef = targetRef;
	}
	public EndpointAddress putTargetRef(ObjectReference targetRef) {
		this.targetRef = targetRef;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (ip != null) {
			tmpStr += firstLinePrefix + "ip: " + ip;
		}
		if (targetRef != null) {
			tmpStr += "\n" + prefix + "targetRef: ";
			tmpStr += "\n" + targetRef.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}