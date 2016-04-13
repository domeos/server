package org.domeos.framework.api.consolemodel.project;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/11/17.
 */
public class CodeSourceInfo {
    int id;
    String userName;
    List<ProjectInfo> projectInfos;
    ProjectInfo svnProjectInfo;

    public CodeSourceInfo() {
    }

    public CodeSourceInfo(int id, String userName, List<ProjectInfo> projectInfos) {
        this.id = id;
        this.userName = userName;
        this.projectInfos = projectInfos;
        this.svnProjectInfo = null;
    }

    public CodeSourceInfo(int id, String userName, ProjectInfo svnProjectInfo) {
        this.id = id;
        this.userName = userName;
        this.svnProjectInfo = svnProjectInfo;
        this.projectInfos = null;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public List<ProjectInfo> getProjectInfos() {
        return projectInfos;
    }

    public void setProjectInfos(List<ProjectInfo> projectInfos) {
        this.projectInfos = projectInfos;
    }

    public static class ProjectInfo {
        int projectId;
        String nameWithNamespace;
        String sshUrl;
        String httpUrl;
        String description;
        String accessLevel;
        long createTime;

        public ProjectInfo() {
        }

        public ProjectInfo(int projectId, String nameWithNamespace, String sshUrl, String httpUrl, String description, String accessLevel, long createTime) {
            this.projectId = projectId;
            this.nameWithNamespace = nameWithNamespace;
            this.sshUrl = sshUrl;
            this.httpUrl = httpUrl;
            this.description = description;
            this.accessLevel = accessLevel;
            this.createTime = createTime;
        }

        public int getProjectId() {
            return projectId;
        }

        public void setProjectId(int projectId) {
            this.projectId = projectId;
        }

        public String getNameWithNamespace() {
            return nameWithNamespace;
        }

        public void setNameWithNamespace(String nameWithNamespace) {
            this.nameWithNamespace = nameWithNamespace;
        }

        public String getSshUrl() {
            return sshUrl;
        }

        public void setSshUrl(String sshUrl) {
            this.sshUrl = sshUrl;
        }

        public String getHttpUrl() {
            return httpUrl;
        }

        public void setHttpUrl(String httpUrl) {
            this.httpUrl = httpUrl;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getAccessLevel() {
            return accessLevel;
        }

        public void setAccessLevel(String accessLevel) {
            this.accessLevel = accessLevel;
        }

        public long getCreateTime() {
            return createTime;
        }

        public void setCreateTime(long createTime) {
            this.createTime = createTime;
        }
    }
}
