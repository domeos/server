package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ObjectFieldSelector;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// DownwardAPIVolumeFile
// =====================
// Description:
// 	DownwardAPIVolumeFile represents information to create the file
// 	containing the pod field
// Variables:
// 	Name    	Required	Schema                	Default
// 	========	========	======================	=======
// 	path    	true    	string                	       
// 	fieldRef	true    	v1.ObjectFieldSelector	       

public class DownwardAPIVolumeFile {
	// Required: Path is the relative path name of the file to be created. Must
	// not be absolute or contain the .. path. Must be utf-8 encoded. The first
	// item of the relative path must not start with ..
	private String path;

	// Required: Selects a field of the pod: only annotations, labels, name
	// and namespace are supported.
	private ObjectFieldSelector fieldRef;

	public DownwardAPIVolumeFile() {
	}
	// for path
	public String getPath() {
		return path;
	}
	public void setPath(String path) {
		this.path = path;
	}
	public DownwardAPIVolumeFile putPath(String path) {
		this.path = path;
		return this;
	}

	// for fieldRef
	public ObjectFieldSelector getFieldRef() {
		return fieldRef;
	}
	public void setFieldRef(ObjectFieldSelector fieldRef) {
		this.fieldRef = fieldRef;
	}
	public DownwardAPIVolumeFile putFieldRef(ObjectFieldSelector fieldRef) {
		this.fieldRef = fieldRef;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (path != null) {
			tmpStr += firstLinePrefix + "path: " + path;
		}
		if (fieldRef != null) {
			tmpStr += "\n" + prefix + "fieldRef: ";
			tmpStr += "\n" + fieldRef.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}