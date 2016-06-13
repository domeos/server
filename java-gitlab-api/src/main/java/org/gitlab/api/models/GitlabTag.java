package org.gitlab.api.models;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by feiliu206363 on 2015/11/25.
 */
public class GitlabTag {
    public final static String URL = "/repository/tags";

    @JsonProperty("name")
    private String name;

    @JsonProperty("commit")
    private GitlabBranchCommit commit;

    @JsonProperty("protected")
    private boolean branchProtected;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public GitlabBranchCommit getCommit() {
        return commit;
    }

    public void setCommit(GitlabBranchCommit commit) {
        this.commit = commit;
    }

    public boolean isProtected() {
        return branchProtected;
    }

    public void setProtected(boolean isProtected) {
        this.branchProtected = isProtected;
    }
}
