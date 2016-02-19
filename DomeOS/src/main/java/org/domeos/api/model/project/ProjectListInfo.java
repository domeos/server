package org.domeos.api.model.project;

import org.domeos.api.model.user.ResourceOwnerType;

import java.util.Comparator;

/**
 * Created by feiliu206363 on 2015/11/30.
 */
public class ProjectListInfo {
    private int id;
    private String projectName;
    private ResourceOwnerType type;
    private long buildTime;
    private long createTime;
    private String buildStatus;
    private String codeSshUrl;
    private String codeHttpUrl;
    private String codeSource;
    private String codeManager;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public ResourceOwnerType getType() {
        return type;
    }

    public void setType(ResourceOwnerType type) {
        this.type = type;
    }

    public long getBuildTime() {
        return buildTime;
    }

    public void setBuildTime(long buildTime) {
        this.buildTime = buildTime;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public String getBuildStatus() {
        return buildStatus;
    }

    public void setBuildStatus(String buildStatus) {
        this.buildStatus = buildStatus;
    }

    public String getCodeSshUrl() {
        return codeSshUrl;
    }

    public void setCodeSshUrl(String codeSshUrl) {
        this.codeSshUrl = codeSshUrl;
    }

    public String getCodeHttpUrl() {
        return codeHttpUrl;
    }

    public void setCodeHttpUrl(String codeHttpUrl) {
        this.codeHttpUrl = codeHttpUrl;
    }

    public String getCodeSource() {
        return codeSource;
    }

    public void setCodeSource(String codeSource) {
        this.codeSource = codeSource;
    }

    public String getCodeManager() {
        return codeManager;
    }

    public void setCodeManager(String codeManager) {
        this.codeManager = codeManager;
    }

    public static class ProjectListInfoComparator implements Comparator<ProjectListInfo> {
        @Override
        public int compare(ProjectListInfo t1, ProjectListInfo t2) {
            if (t2.getBuildTime() == 0 && t1.getBuildTime() == 0) {
                if (t2.getCreateTime() - t1.getCreateTime() > 0) {
                    return 1;
                } else if (t2.getCreateTime() - t1.getCreateTime() < 0) {
                    return -1;
                } else {
                    return 0;
                }
            } else if (t2.getBuildTime() == 0) {
                return 1;
            } else if (t1.getBuildTime() == 0) {
                return -1;
            } else {
                if (t2.getBuildTime() - t1.getBuildTime() > 0) {
                    return 1;
                } else if (t2.getBuildTime() - t1.getBuildTime() < 0) {
                    return -1;
                } else {
                    return 0;
                }
            }
        }
    }
}
