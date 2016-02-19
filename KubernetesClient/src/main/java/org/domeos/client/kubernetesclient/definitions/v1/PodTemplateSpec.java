package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.ObjectMeta;
import org.domeos.client.kubernetesclient.definitions.v1.PodSpec;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// PodTemplateSpec
// ===============
// Description:
// 	PodTemplateSpec describes the data a pod should have when created from
// 	a template
// Variables:
// 	Name    	Required	Schema       	Default
// 	========	========	=============	=======
// 	metadata	false   	v1.ObjectMeta	       
// 	spec    	false   	v1.PodSpec   	       

public class PodTemplateSpec {
	// Standard object’s metadata. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#metadata
	private ObjectMeta metadata;

	// Specification of the desired behavior of the pod. More info:
	// http://kubernetes.io/v1.1/docs/devel/api-conventions.html#spec-and-status
	private PodSpec spec;

	public PodTemplateSpec() {
	}
	// for metadata
	public ObjectMeta getMetadata() {
		return metadata;
	}
	public void setMetadata(ObjectMeta metadata) {
		this.metadata = metadata;
	}
	public PodTemplateSpec putMetadata(ObjectMeta metadata) {
		this.metadata = metadata;
		return this;
	}

	// for spec
	public PodSpec getSpec() {
		return spec;
	}
	public void setSpec(PodSpec spec) {
		this.spec = spec;
	}
	public PodTemplateSpec putSpec(PodSpec spec) {
		this.spec = spec;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (metadata != null) {
			tmpStr += firstLinePrefix + "metadata: ";
			tmpStr += "\n" + metadata.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		if (spec != null) {
			tmpStr += "\n" + prefix + "spec: ";
			tmpStr += "\n" + spec.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}