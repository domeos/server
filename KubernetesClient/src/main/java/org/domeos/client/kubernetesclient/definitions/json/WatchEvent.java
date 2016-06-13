package org.domeos.client.kubernetesclient.definitions.json;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Created by anningluo on 2015-12-02.
*/
// WatchEvent
// ==========
// Description:
// Variables:
// 	Name  	Required	Schema	Default
// 	======	========	======	=======
// 	type  	false   	string	       
// 	object	false   	string	       

public class WatchEvent {
	// the type of watch event; may be ADDED, MODIFIED, DELETED, or ERROR
	private String type;

	// the object being watched; will match the type of the resource endpoint
	// or be a Status object if the type is ERROR
	private JsonNode object;

	public WatchEvent() {
	}
	// for type
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public WatchEvent putType(String type) {
		this.type = type;
		return this;
	}

	// for object
	public JsonNode getObject() {
		return object;
	}
	public void setObject(JsonNode object) {
		this.object = object;
	}
	public WatchEvent putObject(JsonNode object) {
		this.object = object;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (type != null) {
			tmpStr += firstLinePrefix + "type: " + type;
		}
		if (object != null) {
			tmpStr += "\n" + prefix + "object: " + object;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}