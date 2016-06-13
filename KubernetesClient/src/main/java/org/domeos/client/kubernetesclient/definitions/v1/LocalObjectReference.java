package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// LocalObjectReference
// ====================
// Description:
// 	LocalObjectReference contains enough information to let you locate
// 	the referenced object inside the same namespace.
// Variables:
// 	Name	Required	Schema	Default
// 	====	========	======	=======
// 	name	false   	string	       

public class LocalObjectReference {
	// Name of the referent. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/identifiers.html#names
	private String name;

	public LocalObjectReference() {
	}
	// for name
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public LocalObjectReference putName(String name) {
		this.name = name;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (name != null) {
			tmpStr += firstLinePrefix + "name: " + name;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}