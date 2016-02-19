package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;
import org.domeos.client.kubernetesclient.KubeAPIVersion;

// ObjectFieldSelector
// ===================
// Description:
// 	ObjectFieldSelector selects an APIVersioned field of an object.
// Variables:
// 	Name      	Required	Schema	Default
// 	==========	========	======	=======
// 	apiVersion	false   	string	       
// 	fieldPath 	true    	string	       

public class ObjectFieldSelector {
	// Version of the schema the FieldPath is written in terms of, defaults to
	// "v1".
	private String apiVersion;

	// Path of the field to select in the specified API version.
	private String fieldPath;

	public ObjectFieldSelector() {
		apiVersion = KubeAPIVersion.v1.toString();
	}
	// for apiVersion
	public String getApiVersion() {
		return apiVersion;
	}
	public void setApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
	}
	public ObjectFieldSelector putApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
		return this;
	}

	// for fieldPath
	public String getFieldPath() {
		return fieldPath;
	}
	public void setFieldPath(String fieldPath) {
		this.fieldPath = fieldPath;
	}
	public ObjectFieldSelector putFieldPath(String fieldPath) {
		this.fieldPath = fieldPath;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (apiVersion != null) {
			tmpStr += firstLinePrefix + "apiVersion: " + apiVersion;
		}
		if (fieldPath != null) {
			tmpStr += "\n" + prefix + "fieldPath: " + fieldPath;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}