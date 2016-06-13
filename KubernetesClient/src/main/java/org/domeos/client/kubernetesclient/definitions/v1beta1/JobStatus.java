package org.domeos.client.kubernetesclient.definitions.v1beta1;
/**
 * Created by anningluo on 2015-12-02.
*/
import org.domeos.client.kubernetesclient.definitions.v1beta1.JobCondition;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// JobStatus
// =========
// Description:
// 	JobStatus represents the current state of a Job.
// Variables:
// 	Name          	Required	Schema                    	Default
// 	==============	========	==========================	=======
// 	conditions    	false   	v1beta1.JobCondition array	       
// 	startTime     	false   	string                    	       
// 	completionTime	false   	string                    	       
// 	active        	false   	integer (int32)           	       
// 	succeeded     	false   	integer (int32)           	       
// 	failed        	false   	integer (int32)           	       

public class JobStatus {
	// Conditions represent the latest available observations of an
	// object’s current state. More info:
	// http://kubernetes.io/v1.1/docs/user-guide/jobs.html
	private JobCondition[] conditions;

	// StartTime represents time when the job was acknowledged by the Job
	// Manager. It is not guaranteed to be set in happens-before order across
	// separate operations. It is represented in RFC3339 form and is in UTC.
	private String startTime;

	// CompletionTime represents time when the job was completed. It is not
	// guaranteed to be set in happens-before order across separate
	// operations. It is represented in RFC3339 form and is in UTC.
	private String completionTime;

	// Active is the number of actively running pods.
	private int active;

	// Succeeded is the number of pods which reached Phase Succeeded.
	private int succeeded;

	// Failed is the number of pods which reached Phase Failed.
	private int failed;

	public JobStatus() {
	}
	// for conditions
	public JobCondition[] getConditions() {
		return conditions;
	}
	public void setConditions(JobCondition[] conditions) {
		this.conditions = conditions;
	}
	public JobStatus putConditions(JobCondition[] conditions) {
		this.conditions = conditions;
		return this;
	}

	// for startTime
	public String getStartTime() {
		return startTime;
	}
	public void setStartTime(String startTime) {
		this.startTime = startTime;
	}
	public JobStatus putStartTime(String startTime) {
		this.startTime = startTime;
		return this;
	}

	// for completionTime
	public String getCompletionTime() {
		return completionTime;
	}
	public void setCompletionTime(String completionTime) {
		this.completionTime = completionTime;
	}
	public JobStatus putCompletionTime(String completionTime) {
		this.completionTime = completionTime;
		return this;
	}

	// for active
	public int getActive() {
		return active;
	}
	public void setActive(int active) {
		this.active = active;
	}
	public JobStatus putActive(int active) {
		this.active = active;
		return this;
	}

	// for succeeded
	public int getSucceeded() {
		return succeeded;
	}
	public void setSucceeded(int succeeded) {
		this.succeeded = succeeded;
	}
	public JobStatus putSucceeded(int succeeded) {
		this.succeeded = succeeded;
		return this;
	}

	// for failed
	public int getFailed() {
		return failed;
	}
	public void setFailed(int failed) {
		this.failed = failed;
	}
	public JobStatus putFailed(int failed) {
		this.failed = failed;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (conditions != null) {
			tmpStr += firstLinePrefix + "conditions:";
			for (JobCondition ele : conditions) {
				tmpStr += "\n" + prefix + "- ";
				if (ele != null) {
					tmpStr += ele.formatLikeYaml(prefix + "  ", unitPrefix, "");
				}
			}
		}
		if (startTime != null) {
			tmpStr += "\n" + prefix + "startTime: " + startTime;
		}
		if (completionTime != null) {
			tmpStr += "\n" + prefix + "completionTime: " + completionTime;
		}
		tmpStr += "\n" + prefix + "active: " + active;
		tmpStr += "\n" + prefix + "succeeded: " + succeeded;
		tmpStr += "\n" + prefix + "failed: " + failed;
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}