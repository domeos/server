package org.domeos.framework.api.consolemodel.project;

import org.domeos.util.StringUtils;
import org.domeos.framework.api.consolemodel.auth.CreatorInfo;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.project.ProjectCollection;

import java.util.Comparator;

/**
 * Created by feiliu206363 on 2016/9/22.
 */
public class ProjectCollectionConsole {
    private int id;
    private String name;
    private String description;
    private CreatorInfo creatorInfo;
    private ProjectCollection.ProjectCollectionState projectCollectionState;
    private long createTime;
    private int memberCount;
    private int projectCount;
    private Role role;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CreatorInfo getCreatorInfo() {
        return creatorInfo;
    }

    public void setCreatorInfo(CreatorInfo creatorInfo) {
        this.creatorInfo = creatorInfo;
    }

    public ProjectCollection.ProjectCollectionState getProjectCollectionState() {
        return projectCollectionState;
    }

    public void setProjectCollectionState(ProjectCollection.ProjectCollectionState projectCollectionState) {
        this.projectCollectionState = projectCollectionState;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public ProjectCollection createProjectCollection() {
        ProjectCollection tmp = new ProjectCollection();
        tmp.setId(id);
        tmp.setName(name);
        tmp.setDescription(description);
        tmp.setCreateTime(System.currentTimeMillis());
        tmp.setCreatorId(creatorInfo.getCreatorId());
        tmp.setProjectCollectionState(projectCollectionState);
        return tmp;
    }

    public int getMemberCount() {
        return memberCount;
    }

    public ProjectCollectionConsole setMemberCount(int memberCount) {
        this.memberCount = memberCount;
        return this;
    }

    public int getProjectCount() {
        return projectCount;
    }

    public ProjectCollectionConsole setProjectCount(int projectCount) {
        this.projectCount = projectCount;
        return this;
    }

    public Role getRole() {
        return role;
    }

    public ProjectCollectionConsole setRole(Role role) {
        this.role = role;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null) {
            return false;
        }
        if (o instanceof ProjectCollectionConsole) {
            ProjectCollectionConsole projectCollectionConsole = (ProjectCollectionConsole) o;
            if (this.id == projectCollectionConsole.getId()) {
                return true;
            }
        }
        return false;
    }

    @Override
    public int hashCode() {
        return new Integer(id).hashCode();
    }

    public String checkLegality() {
        String error = null;
        if (StringUtils.isBlank(name)) {
            error = "project collection name must be set";
        } else if (projectCollectionState == null) {
            error = "project collection state must be set";
        }
        if (!Project.isRegularDockerName(name)) {
            error = "project collection name must match [a-z0-9]+([._-][a-z0-9]+)*";
        }
        return error;
    }

    public static class ProjectCollectionListComparator implements Comparator<ProjectCollectionConsole> {
        @Override
        public int compare(ProjectCollectionConsole t1, ProjectCollectionConsole t2) {
            if (t2.getCreateTime() - t1.getCreateTime() > 0) {
                return 1;
            } else if (t2.getCreateTime() - t1.getCreateTime() < 0) {
                return -1;
            } else {
                return 0;
            }
        }
    }
}
