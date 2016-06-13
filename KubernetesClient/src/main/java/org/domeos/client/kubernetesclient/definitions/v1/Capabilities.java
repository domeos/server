package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.Capability;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// Capabilities
// ============
// Description:
// 	Adds and removes POSIX capabilities from running containers.
// Variables:
// 	Name	Required	Schema             	Default
// 	====	========	===================	=======
// 	add 	false   	v1.Capability array	       
// 	drop	false   	v1.Capability array	       

public class Capabilities {
	// Added capabilities
	private Capability[] add;

	// Removed capabilities
	private Capability[] drop;

	public Capabilities() {
	}
	// for add
	public Capability[] getAdd() {
		return add;
	}
	public void setAdd(Capability[] add) {
		this.add = add;
	}
	public Capabilities putAdd(Capability[] add) {
		this.add = add;
		return this;
	}

	// for drop
	public Capability[] getDrop() {
		return drop;
	}
	public void setDrop(Capability[] drop) {
		this.drop = drop;
	}
	public Capabilities putDrop(Capability[] drop) {
		this.drop = drop;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (add != null) {
			tmpStr += firstLinePrefix + "add:";
			for (Capability ele : add) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		if (drop != null) {
			tmpStr += "\n" + prefix + "drop:";
			for (Capability ele : drop) {
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