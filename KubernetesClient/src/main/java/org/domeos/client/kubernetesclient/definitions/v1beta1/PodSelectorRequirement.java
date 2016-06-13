package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// PodSelectorRequirement
// ======================
// Description:
// 	A pod selector requirement is a selector that contains values, a key,
// 	and an operator that relates the key and values.
// Variables:
// 	Name    	Required	Schema      	Default
// 	========	========	============	=======
// 	key     	true    	string      	       
// 	operator	true    	string      	       
// 	values  	false   	string array	       

public class PodSelectorRequirement {
	// key is the label key that the selector applies to.
	private String key;

	// operator represents a key’s relationship to a set of values. Valid
	// operators ard In, NotIn, Exists and DoesNotExist.
	private String operator;

	// values is an array of string values. If the operator is In or NotIn, the
	// values array must be non-empty. If the operator is Exists or
	// DoesNotExist, the values array must be empty. This array is replaced
	// during a strategic merge patch.
	private String[] values;

	public PodSelectorRequirement() {
	}
	// for key
	public String getKey() {
		return key;
	}
	public void setKey(String key) {
		this.key = key;
	}
	public PodSelectorRequirement putKey(String key) {
		this.key = key;
		return this;
	}

	// for operator
	public String getOperator() {
		return operator;
	}
	public void setOperator(String operator) {
		this.operator = operator;
	}
	public PodSelectorRequirement putOperator(String operator) {
		this.operator = operator;
		return this;
	}

	// for values
	public String[] getValues() {
		return values;
	}
	public void setValues(String[] values) {
		this.values = values;
	}
	public PodSelectorRequirement putValues(String[] values) {
		this.values = values;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (key != null) {
			tmpStr += firstLinePrefix + "key: " + key;
		}
		if (operator != null) {
			tmpStr += "\n" + prefix + "operator: " + operator;
		}
		if (values != null) {
			tmpStr += "\n" + prefix + "values:";
			for (String ele : values) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
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