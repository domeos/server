package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.DownwardAPIVolumeFile;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// DownwardAPIVolumeSource
// =======================
// Description:
// 	DownwardAPIVolumeSource represents a volume containing downward
// 	API info
// Variables:
// 	Name 	Required	Schema                        	Default
// 	=====	========	==============================	=======
// 	items	false   	v1.DownwardAPIVolumeFile array	       

public class DownwardAPIVolumeSource {
	// Items is a list of downward API volume file
	private DownwardAPIVolumeFile[] items;

	public DownwardAPIVolumeSource() {
	}
	// for items
	public DownwardAPIVolumeFile[] getItems() {
		return items;
	}
	public void setItems(DownwardAPIVolumeFile[] items) {
		this.items = items;
	}
	public DownwardAPIVolumeSource putItems(DownwardAPIVolumeFile[] items) {
		this.items = items;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (items != null) {
			tmpStr += firstLinePrefix + "items:";
			for (DownwardAPIVolumeFile ele : items) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}