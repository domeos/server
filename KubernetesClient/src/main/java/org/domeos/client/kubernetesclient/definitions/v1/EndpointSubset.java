package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.EndpointPort;
import org.domeos.client.kubernetesclient.definitions.v1.EndpointAddress;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// EndpointSubset
// ==============
// Description:
// 	EndpointSubset is a group of addresses with a common set of ports. The
// 	expanded set of endpoints is the Cartesian product of Addresses x
// 	Ports. For example, given: { Addresses: [{"ip": "10.10.1.1"}, {"ip":
// 	"10.10.2.2"}], Ports: [{"name": "a", "port": 8675}, {"name": "b",
// 	"port": 309}] } The resulting set of endpoints can be viewed as: a: [
// 	10.10.1.1:8675, 10.10.2.2:8675 ], b: [ 10.10.1.1:309,
// 	10.10.2.2:309 ]
// Variables:
// 	Name             	Required	Schema                  	Default
// 	=================	========	========================	=======
// 	addresses        	false   	v1.EndpointAddress array	       
// 	notReadyAddresses	false   	v1.EndpointAddress array	       
// 	ports            	false   	v1.EndpointPort array   	       

public class EndpointSubset {
	// IP addresses which offer the related ports that are marked as ready.
	// These endpoints should be considered safe for load balancers and
	// clients to utilize.
	private EndpointAddress[] addresses;

	// IP addresses which offer the related ports but are not currently marked
	// as ready because they have not yet finished starting, have recently
	// failed a readiness check, or have recently failed a liveness check.
	private EndpointAddress[] notReadyAddresses;

	// Port numbers available on the related IP addresses.
	private EndpointPort[] ports;

	public EndpointSubset() {
	}
	// for addresses
	public EndpointAddress[] getAddresses() {
		return addresses;
	}
	public void setAddresses(EndpointAddress[] addresses) {
		this.addresses = addresses;
	}
	public EndpointSubset putAddresses(EndpointAddress[] addresses) {
		this.addresses = addresses;
		return this;
	}

	// for notReadyAddresses
	public EndpointAddress[] getNotReadyAddresses() {
		return notReadyAddresses;
	}
	public void setNotReadyAddresses(EndpointAddress[] notReadyAddresses) {
		this.notReadyAddresses = notReadyAddresses;
	}
	public EndpointSubset putNotReadyAddresses(EndpointAddress[] notReadyAddresses) {
		this.notReadyAddresses = notReadyAddresses;
		return this;
	}

	// for ports
	public EndpointPort[] getPorts() {
		return ports;
	}
	public void setPorts(EndpointPort[] ports) {
		this.ports = ports;
	}
	public EndpointSubset putPorts(EndpointPort[] ports) {
		this.ports = ports;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (addresses != null) {
			tmpStr += firstLinePrefix + "addresses:";
			for (EndpointAddress ele : addresses) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		if (notReadyAddresses != null) {
			tmpStr += "\n" + prefix + "notReadyAddresses:";
			for (EndpointAddress ele : notReadyAddresses) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		if (ports != null) {
			tmpStr += "\n" + prefix + "ports:";
			for (EndpointPort ele : ports) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}