package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.NodeSystemInfo;
import org.domeos.client.kubernetesclient.definitions.v1.NodeDaemonEndpoints;
import org.domeos.client.kubernetesclient.definitions.v1.NodeCondition;
import org.domeos.client.kubernetesclient.definitions.v1.NodeAddress;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// NodeStatus
// ==========
// Description:
// 	NodeStatus is information about the current status of a node.
// Variables:
// 	Name           	Required	Schema                	Default
// 	===============	========	======================	=======
// 	capacity       	false   	any                   	       
// 	phase          	false   	string                	       
// 	conditions     	false   	v1.NodeCondition array	       
// 	addresses      	false   	v1.NodeAddress array  	       
// 	daemonEndpoints	false   	v1.NodeDaemonEndpoints	       
// 	nodeInfo       	false   	v1.NodeSystemInfo     	       

public class NodeStatus {
	// Capacity represents the available resources of a node. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/persistent-volumes.html#capacity
	// for more details.
	private Map<String, String> capacity;

	// NodePhase is the recently observed lifecycle phase of the node. More
	// info:
	// http://kubernetes.io/v1.1/docs/admin/node.html#node-phase
	private String phase;

	// Conditions is an array of current observed node conditions. More info:
	// http://kubernetes.io/v1.1/docs/admin/node.html#node-condition
	private NodeCondition[] conditions;

	// List of addresses reachable to the node. Queried from cloud provider,
	// if available. More info:
	// http://kubernetes.io/v1.1/docs/admin/node.html#node-addresses
	private NodeAddress[] addresses;

	// Endpoints of daemons running on the Node.
	private NodeDaemonEndpoints daemonEndpoints;

	// Set of ids/uuids to uniquely identify the node. More info:
	// http://kubernetes.io/v1.1/docs/admin/node.html#node-info
	private NodeSystemInfo nodeInfo;

	public NodeStatus() {
	}
	// for capacity
	public Map<String, String> getCapacity() {
		return capacity;
	}
	public void setCapacity(Map<String, String> capacity) {
		this.capacity = capacity;
	}
	public NodeStatus putCapacity(Map<String, String> capacity) {
		this.capacity = capacity;
		return this;
	}

	// for phase
	public String getPhase() {
		return phase;
	}
	public void setPhase(String phase) {
		this.phase = phase;
	}
	public NodeStatus putPhase(String phase) {
		this.phase = phase;
		return this;
	}

	// for conditions
	public NodeCondition[] getConditions() {
		return conditions;
	}
	public void setConditions(NodeCondition[] conditions) {
		this.conditions = conditions;
	}
	public NodeStatus putConditions(NodeCondition[] conditions) {
		this.conditions = conditions;
		return this;
	}

	// for addresses
	public NodeAddress[] getAddresses() {
		return addresses;
	}
	public void setAddresses(NodeAddress[] addresses) {
		this.addresses = addresses;
	}
	public NodeStatus putAddresses(NodeAddress[] addresses) {
		this.addresses = addresses;
		return this;
	}

	// for daemonEndpoints
	public NodeDaemonEndpoints getDaemonEndpoints() {
		return daemonEndpoints;
	}
	public void setDaemonEndpoints(NodeDaemonEndpoints daemonEndpoints) {
		this.daemonEndpoints = daemonEndpoints;
	}
	public NodeStatus putDaemonEndpoints(NodeDaemonEndpoints daemonEndpoints) {
		this.daemonEndpoints = daemonEndpoints;
		return this;
	}

	// for nodeInfo
	public NodeSystemInfo getNodeInfo() {
		return nodeInfo;
	}
	public void setNodeInfo(NodeSystemInfo nodeInfo) {
		this.nodeInfo = nodeInfo;
	}
	public NodeStatus putNodeInfo(NodeSystemInfo nodeInfo) {
		this.nodeInfo = nodeInfo;
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
		if (phase != null) {
			tmpStr += "\n" + prefix + "phase: " + phase;
		}
		if (conditions != null) {
			tmpStr += "\n" + prefix + "conditions:";
			for (NodeCondition ele : conditions) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		if (addresses != null) {
			tmpStr += "\n" + prefix + "addresses:";
			for (NodeAddress ele : addresses) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		if (daemonEndpoints != null) {
			tmpStr += "\n" + prefix + "daemonEndpoints: ";
			tmpStr += "\n" + daemonEndpoints.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (nodeInfo != null) {
			tmpStr += "\n" + prefix + "nodeInfo: ";
			tmpStr += "\n" + nodeInfo.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}