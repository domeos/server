package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// SecretVolumeSource
// ==================
// Description:
// 	SecretVolumeSource adapts a Secret into a VolumeSource. More info:
// 	http://kubernetes.io/v1.1/docs/design/secrets.html
// Variables:
// 	Name      	Required	Schema	Default
// 	==========	========	======	=======
// 	secretName	true    	string	       

public class SecretVolumeSource {
	// SecretName is the name of a secret in the pod’s namespace. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/volumes.html#secrets
	private String secretName;

	public SecretVolumeSource() {
	}
	// for secretName
	public String getSecretName() {
		return secretName;
	}
	public void setSecretName(String secretName) {
		this.secretName = secretName;
	}
	public SecretVolumeSource putSecretName(String secretName) {
		this.secretName = secretName;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (secretName != null) {
			tmpStr += firstLinePrefix + "secretName: " + secretName;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}