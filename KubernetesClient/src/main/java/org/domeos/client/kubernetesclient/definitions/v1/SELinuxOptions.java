package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// SELinuxOptions
// ==============
// Description:
// 	SELinuxOptions are the labels to be applied to the container
// Variables:
// 	Name 	Required	Schema	Default
// 	=====	========	======	=======
// 	user 	false   	string	       
// 	role 	false   	string	       
// 	type 	false   	string	       
// 	level	false   	string	       

public class SELinuxOptions {
	// User is a SELinux user label that applies to the container. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/labels.html
	private String user;

	// Role is a SELinux role label that applies to the container. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/labels.html
	private String role;

	// Type is a SELinux type label that applies to the container. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/labels.html
	private String type;

	// Level is SELinux level label that applies to the container. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/labels.html
	private String level;

	public SELinuxOptions() {
	}
	// for user
	public String getUser() {
		return user;
	}
	public void setUser(String user) {
		this.user = user;
	}
	public SELinuxOptions putUser(String user) {
		this.user = user;
		return this;
	}

	// for role
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public SELinuxOptions putRole(String role) {
		this.role = role;
		return this;
	}

	// for type
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public SELinuxOptions putType(String type) {
		this.type = type;
		return this;
	}

	// for level
	public String getLevel() {
		return level;
	}
	public void setLevel(String level) {
		this.level = level;
	}
	public SELinuxOptions putLevel(String level) {
		this.level = level;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (user != null) {
			tmpStr += firstLinePrefix + "user: " + user;
		}
		if (role != null) {
			tmpStr += "\n" + prefix + "role: " + role;
		}
		if (type != null) {
			tmpStr += "\n" + prefix + "type: " + type;
		}
		if (level != null) {
			tmpStr += "\n" + prefix + "level: " + level;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}