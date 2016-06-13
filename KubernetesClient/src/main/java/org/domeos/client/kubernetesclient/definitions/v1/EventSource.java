package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// EventSource
// ===========
// Description:
// 	EventSource contains information for an event.
// Variables:
// 	Name     	Required	Schema	Default
// 	=========	========	======	=======
// 	component	false   	string	       
// 	host     	false   	string	       

public class EventSource {
	// Component from which the event is generated.
	private String component;

	// Host name on which the event is generated.
	private String host;

	public EventSource() {
	}
	// for component
	public String getComponent() {
		return component;
	}
	public void setComponent(String component) {
		this.component = component;
	}
	public EventSource putComponent(String component) {
		this.component = component;
		return this;
	}

	// for host
	public String getHost() {
		return host;
	}
	public void setHost(String host) {
		this.host = host;
	}
	public EventSource putHost(String host) {
		this.host = host;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (component != null) {
			tmpStr += firstLinePrefix + "component: " + component;
		}
		if (host != null) {
			tmpStr += "\n" + prefix + "host: " + host;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}