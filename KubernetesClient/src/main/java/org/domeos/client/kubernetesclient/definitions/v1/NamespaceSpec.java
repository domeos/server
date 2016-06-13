package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
// NamespaceSpec
// =============
// Description:
// 	NamespaceSpec describes the attributes on a Namespace.
// Variables:
// 	Name      	Required	Schema                	Default
// 	==========	========	======================	=======
// 	finalizers	false   	v1.String array

public class NamespaceSpec {
	// Finalizers is an opaque list of values that must be empty to permanently
	// remove object from storage. More info:
	// http://kubernetes.io/v1.1/docs/design/namespaces.html#finalizers
	private String[] finalizers;

	public NamespaceSpec() {
	}
	// for finalizers
	public String[] getFinalizers() {
		return finalizers;
	}
	public void setFinalizers(String[] finalizers) {
		this.finalizers = finalizers;
	}
	public NamespaceSpec putFinalizers(String[] finalizers) {
		this.finalizers = finalizers;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (finalizers != null) {
			tmpStr += firstLinePrefix + "finalizers:";
			for (String ele : finalizers) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					// tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
					tmpStr += ele;
				}
			}
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}