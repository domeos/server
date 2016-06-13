package org.domeos.client.kubernetesclient.definitions.unversioned;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// Patch
// =====
// Description:
// 	Patch is provided to give a concrete name and type to the Kubernetes
// 	PATCH request body.
public class Patch {
	public Patch() {
	}
	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}