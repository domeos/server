package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1.EnvVarSource;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// EnvVar
// ======
// Description:
// 	EnvVar represents an environment variable present in a Container.
// Variables:
// 	Name     	Required	Schema         	Default
// 	=========	========	===============	=======
// 	name     	true    	string         	       
// 	value    	false   	string         	       
// 	valueFrom	false   	v1.EnvVarSource	       

public class EnvVar {
	// Name of the environment variable. Must be a C_IDENTIFIER.
	private String name;

	// Variable references $(VAR_NAME) are expanded using the previous
	// defined environment variables in the container and any service
	// environment variables. If a variable cannot be resolved, the
	// reference in the input string will be unchanged. The $(VAR_NAME)
	// syntax can be escaped with a double $$, ie: $$(VAR_NAME). Escaped
	// references will never be expanded, regardless of whether the variable
	// exists or not. Defaults to "".
	private String value;

	// Source for the environment variable’s value. Cannot be used if value is
	// not empty.
	private EnvVarSource valueFrom;

	public EnvVar() {
	}
	// for name
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public EnvVar putName(String name) {
		this.name = name;
		return this;
	}

	// for value
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
	public EnvVar putValue(String value) {
		this.value = value;
		return this;
	}

	// for valueFrom
	public EnvVarSource getValueFrom() {
		return valueFrom;
	}
	public void setValueFrom(EnvVarSource valueFrom) {
		this.valueFrom = valueFrom;
	}
	public EnvVar putValueFrom(EnvVarSource valueFrom) {
		this.valueFrom = valueFrom;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (name != null) {
			tmpStr += firstLinePrefix + "name: " + name;
		}
		if (value != null) {
			tmpStr += "\n" + prefix + "value: " + value;
		}
		if (valueFrom != null) {
			tmpStr += "\n" + prefix + "valueFrom: ";
			tmpStr += "\n" + valueFrom.formatLikeYaml(prefix + unitPrefix, unitPrefix, prefix + unitPrefix);
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}