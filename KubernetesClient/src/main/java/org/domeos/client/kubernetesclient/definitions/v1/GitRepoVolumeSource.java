package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Iterator;

// GitRepoVolumeSource
// ===================
// Description:
// 	GitRepoVolumeSource represents a volume that is pulled from git when
// 	the pod is created.
// Variables:
// 	Name      	Required	Schema	Default
// 	==========	========	======	=======
// 	repository	true    	string	       
// 	revision  	true    	string	       

public class GitRepoVolumeSource {
	// Repository URL
	private String repository;

	// Commit hash for the specified revision.
	private String revision;

	public GitRepoVolumeSource() {
	}
	// for repository
	public String getRepository() {
		return repository;
	}
	public void setRepository(String repository) {
		this.repository = repository;
	}
	public GitRepoVolumeSource putRepository(String repository) {
		this.repository = repository;
		return this;
	}

	// for revision
	public String getRevision() {
		return revision;
	}
	public void setRevision(String revision) {
		this.revision = revision;
	}
	public GitRepoVolumeSource putRevision(String revision) {
		this.revision = revision;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
		if (repository != null) {
			tmpStr += firstLinePrefix + "repository: " + repository;
		}
		if (revision != null) {
			tmpStr += "\n" + prefix + "revision: " + revision;
		}
		return tmpStr;
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}