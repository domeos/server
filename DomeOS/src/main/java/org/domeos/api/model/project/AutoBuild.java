package org.domeos.api.model.project;

/**
 * Created by feiliu206363 on 2015/11/16.
 */
public class AutoBuild {
    int id;
    int projectId;
    String branch;
    int tag;

    public AutoBuild() {}

    public AutoBuild(int projectId, String branch, int tag) {
        this.projectId = projectId;
        this.branch = branch;
        this.tag = tag;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getProjectId() {
        return projectId;
    }

    public void setProjectId(int projectId) {
        this.projectId = projectId;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public int getTag() {
        return tag;
    }

    public void setTag(int tag) {
        this.tag = tag;
    }
}
