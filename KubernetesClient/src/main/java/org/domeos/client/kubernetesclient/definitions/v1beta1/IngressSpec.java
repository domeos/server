package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1beta1.IngressRule;
import org.domeos.client.kubernetesclient.definitions.v1beta1.IngressBackend;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// IngressSpec
// ===========
// Description:
// 	IngressSpec describes the Ingress the user wishes to exist.
// Variables:
// 	Name   	Required	Schema                   	Default
// 	=======	========	=========================	=======
// 	backend	false   	v1beta1.IngressBackend   	       
// 	rules  	true    	v1beta1.IngressRule array	       

public class IngressSpec {
	// A default backend capable of servicing requests that don’t match any
	// IngressRule. It is optional to allow the loadbalancer controller or
	// defaulting logic to specify a global default.
	private IngressBackend backend;

	// A list of host rules used to configure the Ingress.
	private IngressRule[] rules;

	public IngressSpec() {
	}
	// for backend
	public IngressBackend getBackend() {
		return backend;
	}
	public void setBackend(IngressBackend backend) {
		this.backend = backend;
	}
	public IngressSpec putBackend(IngressBackend backend) {
		this.backend = backend;
		return this;
	}

	// for rules
	public IngressRule[] getRules() {
		return rules;
	}
	public void setRules(IngressRule[] rules) {
		this.rules = rules;
	}
	public IngressSpec putRules(IngressRule[] rules) {
		this.rules = rules;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (backend != null) {
			tmpStr += firstLinePrefix + "backend: ";
			tmpStr += "\n" + backend.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (rules != null) {
			tmpStr += "\n" + prefix + "rules:";
			for (IngressRule ele : rules) {
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