package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;
import org.domeos.client.kubernetesclient.KubeAPIVersion;

// DeleteOptions
// =============
// Description:
// 	DeleteOptions may be provided when deleting an API object
// Variables:
// 	Name              	Required	Schema         	Default
// 	==================	========	===============	=======
// 	kind              	false   	string         	       
// 	apiVersion        	false   	string         	       
// 	gracePeriodSeconds	true    	integer (int64)	       

public class DeleteOptions {
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

	// The duration in seconds before the object should be deleted. Value must
	// be non-negative integer. The value zero indicates delete
	// immediately. If this value is nil, the default grace period for the
	// specified type will be used. Defaults to a per object value if not
	// specified. zero means delete immediately.
	private long gracePeriodSeconds;

	public DeleteOptions() {
		kind = "DeleteOptions";
		apiVersion = KubeAPIVersion.v1.toString();
	}
	// for kind
	public String getKind() {
		return kind;
	}
	public void setKind(String kind) {
		this.kind = kind;
	}
	public DeleteOptions putKind(String kind) {
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
	public DeleteOptions putApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
		return this;
	}

	// for gracePeriodSeconds
	public long getGracePeriodSeconds() {
		return gracePeriodSeconds;
	}
	public void setGracePeriodSeconds(long gracePeriodSeconds) {
		this.gracePeriodSeconds = gracePeriodSeconds;
	}
	public DeleteOptions putGracePeriodSeconds(long gracePeriodSeconds) {
		this.gracePeriodSeconds = gracePeriodSeconds;
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
		tmpStr += "\n" + prefix + "gracePeriodSeconds: " + gracePeriodSeconds;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}