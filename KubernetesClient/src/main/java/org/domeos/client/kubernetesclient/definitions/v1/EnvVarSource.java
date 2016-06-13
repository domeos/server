package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ObjectFieldSelector;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// EnvVarSource
// ============
// Description:
// 	EnvVarSource represents a source for the value of an EnvVar.
// Variables:
// 	Name    	Required	Schema                	Default
// 	========	========	======================	=======
// 	fieldRef	true    	v1.ObjectFieldSelector	       

public class EnvVarSource {
	// Selects a field of the pod. Only name and namespace are supported.
	private ObjectFieldSelector fieldRef;

	public EnvVarSource() {
	}
	// for fieldRef
	public ObjectFieldSelector getFieldRef() {
		return fieldRef;
	}
	public void setFieldRef(ObjectFieldSelector fieldRef) {
		this.fieldRef = fieldRef;
	}
	public EnvVarSource putFieldRef(ObjectFieldSelector fieldRef) {
		this.fieldRef = fieldRef;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (fieldRef != null) {
			tmpStr += firstLinePrefix + "fieldRef: ";
			tmpStr += "\n" + fieldRef.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}