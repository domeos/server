package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1beta1.HTTPIngressRuleValue;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// IngressRule
// ===========
// Description:
// 	IngressRule represents the rules mapping the paths under a specified
// 	host to the related backend services.
// Variables:
// 	Name	Required	Schema                      	Default
// 	====	========	============================	=======
// 	host	false   	string                      	       
// 	http	true    	v1beta1.HTTPIngressRuleValue	       

public class IngressRule {
	// Host is the fully qualified domain name of a network host, as defined by
	// RFC 3986. Note the following deviations from the "host" part of the URI
	// as defined in the RFC: 1. IPs are not allowed. Currently an
	// IngressRuleValue can only apply to the IP in the Spec of the parent
	// Ingress. 2. The : delimiter is not respected because ports are not
	// allowed. Currently the port of an Ingress is implicitly :80 for http and
	// :443 for https. Both these may change in the future. Incoming requests
	// are matched against the Host before the IngressRuleValue.
	private String host;

	// Currently mixing different types of rules in a single Ingress is
	// disallowed, so exactly one of the following must be set.
	private HTTPIngressRuleValue http;

	public IngressRule() {
	}
	// for host
	public String getHost() {
		return host;
	}
	public void setHost(String host) {
		this.host = host;
	}
	public IngressRule putHost(String host) {
		this.host = host;
		return this;
	}

	// for http
	public HTTPIngressRuleValue getHttp() {
		return http;
	}
	public void setHttp(HTTPIngressRuleValue http) {
		this.http = http;
	}
	public IngressRule putHttp(HTTPIngressRuleValue http) {
		this.http = http;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (host != null) {
			tmpStr += firstLinePrefix + "host: " + host;
		}
		if (http != null) {
			tmpStr += "\n" + prefix + "http: ";
			tmpStr += "\n" + http.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}