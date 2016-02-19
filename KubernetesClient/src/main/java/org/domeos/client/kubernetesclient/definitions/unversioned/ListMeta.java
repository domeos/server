package org.domeos.client.kubernetesclient.definitions.unversioned;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// ListMeta
// ========
// Description:
// 	ListMeta describes metadata that synthetic resources must have,
// 	including lists and various status objects. A resource may have only
// 	one of {ObjectMeta, ListMeta}.
// Variables:
// 	Name           	Required	Schema	Default
// 	===============	========	======	=======
// 	selfLink       	false   	string	       
// 	resourceVersion	false   	string	       

public class ListMeta {
	// SelfLink is a URL representing this object. Populated by the system.
	// Read-only.
	private String selfLink;

	// String that identifies the server’s internal version of this object
	// that can be used by clients to determine when objects have changed.
	// Value must be treated as opaque by clients and passed unmodified back to
	// the server. Populated by the system. Read-only. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#concurrency-control-and-consistency
	private String resourceVersion;

	public ListMeta() {
	}
	// for selfLink
	public String getSelfLink() {
		return selfLink;
	}
	public void setSelfLink(String selfLink) {
		this.selfLink = selfLink;
	}
	public ListMeta putSelfLink(String selfLink) {
		this.selfLink = selfLink;
		return this;
	}

	// for resourceVersion
	public String getResourceVersion() {
		return resourceVersion;
	}
	public void setResourceVersion(String resourceVersion) {
		this.resourceVersion = resourceVersion;
	}
	public ListMeta putResourceVersion(String resourceVersion) {
		this.resourceVersion = resourceVersion;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (selfLink != null) {
			tmpStr += firstLinePrefix + "selfLink: " + selfLink;
		}
		if (resourceVersion != null) {
			tmpStr += "\n" + prefix + "resourceVersion: " + resourceVersion;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}