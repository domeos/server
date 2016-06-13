package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1beta1.HTTPIngressPath;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// HTTPIngressRuleValue
// ====================
// Description:
// 	HTTPIngressRuleValue is a list of http selectors pointing to
// 	IngressBackends. In the example:
// 	http://<host>/<path>?<searchpart> → IngressBackend where parts of
// 	the url correspond to RFC 3986, this resource will be used to to match
// 	against everything after the last / and before the first ? or # .
// Variables:
// 	Name 	Required	Schema                       	Default
// 	=====	========	=============================	=======
// 	paths	true    	v1beta1.HTTPIngressPath array	       

public class HTTPIngressRuleValue {
	// A collection of paths that map requests to IngressBackends.
	private HTTPIngressPath[] paths;

	public HTTPIngressRuleValue() {
	}
	// for paths
	public HTTPIngressPath[] getPaths() {
		return paths;
	}
	public void setPaths(HTTPIngressPath[] paths) {
		this.paths = paths;
	}
	public HTTPIngressRuleValue putPaths(HTTPIngressPath[] paths) {
		this.paths = paths;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (paths != null) {
			tmpStr += firstLinePrefix + "paths:";
			for (HTTPIngressPath ele : paths) {
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