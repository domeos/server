package org.domeos.api.model.project;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.console.project.Project;
import org.domeos.api.model.user.ResourceOwnerType;

/**
 * Created by feiliu206363 on 2015/11/11.
 */
public class ProjectBasic {
    int id;
    String name;
    ResourceOwnerType type;
    String description;
    int stateless;
    int dockerfile;
    long createTime;
    long lastModify;
    int authority;
    int status;

    public ProjectBasic() {}

    public ProjectBasic(Project project) {
        this.id = project.getId();
        this.name = project.getProjectName();
        this.type = project.getType();
        this.description = project.getDescription();
        this.stateless = project.getStateless();
        if (project.getDockerfileConfig() == null || !StringUtils.isBlank(project.getDockerfileConfig().checkLegality())) {
            dockerfile = 1;
        } else {
            dockerfile = 0;
        }
        this.createTime = project.getCreateTime();
        this.lastModify = project.getLastModify();
        this.authority = project.getAuthority();
        this.status = 1;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public ResourceOwnerType getType() {
        return type;
    }

    public void setType(ResourceOwnerType type) {
        this.type = type;
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

    public int getStateless() {
        return stateless;
    }

    public void setStateless(int stateless) {
        this.stateless = stateless;
    }

    public int getDockerfile() {
        return dockerfile;
    }

    public void setDockerfile(int dockerfile) {
        this.dockerfile = dockerfile;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public long getLastModify() {
        return lastModify;
    }

    public void setLastModify(long lastModify) {
        this.lastModify = lastModify;
    }

    public int getAuthority() {
        return authority;
    }

    public void setAuthority(int authority) {
        this.authority = authority;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }
}

