package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import java.util.Iterator;
import java.util.Map;

// LimitRangeItem
// ==============
// Description:
// 	LimitRangeItem defines a min/max usage limit for any resource that
// 	matches on kind.
// Variables:
// 	Name                	Required	Schema	Default
// 	====================	========	======	=======
// 	type                	false   	string	       
// 	max                 	false   	any   	       
// 	min                 	false   	any   	       
// 	Default             	false   	any
// 	defaultRequest      	false   	any   	       
// 	maxLimitRequestRatio	false   	any   	       

public class LimitRangeItem {
	// Type of resource that this limit applies to.
	private String type;

	// Max usage constraints on this kind by resource name.
	private Map<String, String> max;

	// Min usage constraints on this kind by resource name.
	private Map<String, String> min;

	// Default resource requirement limit value by resource name if resource
	// limit is omitted.
	private Map<String, String> Default;

	// DefaultRequest is the Default resource requirement request value by
	// resource name if resource request is omitted.
	private Map<String, String> defaultRequest;

	// MaxLimitRequestRatio if specified, the named resource must have a
	// request and limit that are both non-zero where limit divided by request
	// is less than or equal to the enumerated value; this represents the max
	// burst for the named resource.
	private Map<String, String> maxLimitRequestRatio;

	public LimitRangeItem() {
	}
	// for type
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public LimitRangeItem putType(String type) {
		this.type = type;
		return this;
	}

	// for max
	public Map<String, String> getMax() {
		return max;
	}
	public void setMax(Map<String, String> max) {
		this.max = max;
	}
	public LimitRangeItem putMax(Map<String, String> max) {
		this.max = max;
		return this;
	}

	// for min
	public Map<String, String> getMin() {
		return min;
	}
	public void setMin(Map<String, String> min) {
		this.min = min;
	}
	public LimitRangeItem putMin(Map<String, String> min) {
		this.min = min;
		return this;
	}

	// for default
	public Map<String, String> getDefault() {
		return Default;
	}
	public void setDefault(Map<String, String> Default) {
		this.Default = Default;
	}
	public LimitRangeItem putDefault(Map<String, String> Default) {
		this.Default = Default;
		return this;
	}

	// for defaultRequest
	public Map<String, String> getDefaultRequest() {
		return defaultRequest;
	}
	public void setDefaultRequest(Map<String, String> defaultRequest) {
		this.defaultRequest = defaultRequest;
	}
	public LimitRangeItem putDefaultRequest(Map<String, String> defaultRequest) {
		this.defaultRequest = defaultRequest;
		return this;
	}

	// for maxLimitRequestRatio
	public Map<String, String> getMaxLimitRequestRatio() {
		return maxLimitRequestRatio;
	}
	public void setMaxLimitRequestRatio(Map<String, String> maxLimitRequestRatio) {
		this.maxLimitRequestRatio = maxLimitRequestRatio;
	}
	public LimitRangeItem putMaxLimitRequestRatio(Map<String, String> maxLimitRequestRatio) {
		this.maxLimitRequestRatio = maxLimitRequestRatio;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (type != null) {
			tmpStr += firstLinePrefix + "type: " + type;
		}
		if (max != null) {
			tmpStr += "\n" + prefix + "max:";
			Iterator<Map.Entry<String, String>> iter = max.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, String> entry = iter.next();
				tmpStr += "\n" + prefix + unitPrefix + entry.getKey() + ": " + entry.getValue();
			}
		}
		if (min != null) {
			tmpStr += "\n" + prefix + "min:";
			Iterator<Map.Entry<String, String>> iter = min.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, String> entry = iter.next();
				tmpStr += "\n" + prefix + unitPrefix + entry.getKey() + ": " + entry.getValue();
			}
		}
		if (Default != null) {
			tmpStr += "\n" + prefix + "Default:";
			Iterator<Map.Entry<String, String>> iter = Default.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, String> entry = iter.next();
				tmpStr += "\n" + prefix + unitPrefix + entry.getKey() + ": " + entry.getValue();
			}
		}
		if (defaultRequest != null) {
			tmpStr += "\n" + prefix + "defaultRequest:";
			Iterator<Map.Entry<String, String>> iter = defaultRequest.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, String> entry = iter.next();
				tmpStr += "\n" + prefix + unitPrefix + entry.getKey() + ": " + entry.getValue();
			}
		}
		if (maxLimitRequestRatio != null) {
			tmpStr += "\n" + prefix + "maxLimitRequestRatio:";
			Iterator<Map.Entry<String, String>> iter = maxLimitRequestRatio.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, String> entry = iter.next();
				tmpStr += "\n" + prefix + unitPrefix + entry.getKey() + ": " + entry.getValue();
			}
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}