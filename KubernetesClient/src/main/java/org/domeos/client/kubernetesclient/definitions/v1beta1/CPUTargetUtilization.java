package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// CPUTargetUtilization
// ====================
// Description:
// Variables:
// 	Name            	Required	Schema         	Default
// 	================	========	===============	=======
// 	targetPercentage	true    	integer (int32)	       

public class CPUTargetUtilization {
	// fraction of the requested CPU that should be utilized/used, e.g. 70
	// means that 70% of the requested CPU should be in use.
	private int targetPercentage;

	public CPUTargetUtilization() {
	}
	// for targetPercentage
	public int getTargetPercentage() {
		return targetPercentage;
	}
	public void setTargetPercentage(int targetPercentage) {
		this.targetPercentage = targetPercentage;
	}
	public CPUTargetUtilization putTargetPercentage(int targetPercentage) {
		this.targetPercentage = targetPercentage;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		tmpStr += firstLinePrefix + "targetPercentage: " + targetPercentage;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}