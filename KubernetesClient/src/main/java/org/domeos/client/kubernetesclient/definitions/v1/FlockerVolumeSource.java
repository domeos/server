package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// FlockerVolumeSource
// ===================
// Description:
// 	FlockerVolumeSource represents a Flocker volume mounted by the
// 	Flocker agent.
// Variables:
// 	Name       	Required	Schema	Default
// 	===========	========	======	=======
// 	datasetName	true    	string	       

public class FlockerVolumeSource {
	// Required: the volume name. This is going to be store on metadata → name on
	// the payload for Flocker
	private String datasetName;

	public FlockerVolumeSource() {
	}
	// for datasetName
	public String getDatasetName() {
		return datasetName;
	}
	public void setDatasetName(String datasetName) {
		this.datasetName = datasetName;
	}
	public FlockerVolumeSource putDatasetName(String datasetName) {
		this.datasetName = datasetName;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (datasetName != null) {
			tmpStr += firstLinePrefix + "datasetName: " + datasetName;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}