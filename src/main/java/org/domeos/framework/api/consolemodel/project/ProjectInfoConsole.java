package org.domeos.framework.api.consolemodel.project;


import org.domeos.framework.api.model.project.related.CodeManager;

import java.util.Comparator;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
public class ProjectInfoConsole {
    private int id;
    private String name;
    private long buildTime;
    private long createTime;
    private String buildStatus;
    private String codeSshUrl;
    private String codeHttpUrl;
    private String nameWithNamespace;
    private CodeManager codeManager;
    private boolean userDefineDockerfile;
    private boolean autoBuild;
    private String projectType;

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

    public String getNameWithNamespace() {
        return nameWithNamespace;
    }

    public void setNameWithNamespace(String nameWithNamespace) {
        this.nameWithNamespace = nameWithNamespace;
    }

    public CodeManager getCodeManager() {
        return codeManager;
    }

    public void setCodeManager(CodeManager codeManager) {
        this.codeManager = codeManager;
    }

    public boolean isUserDefineDockerfile() {
        return userDefineDockerfile;
    }

    public void setUserDefineDockerfile(boolean userDefineDockerfile) {
        this.userDefineDockerfile = userDefineDockerfile;
    }

    public String getProjectType() {
        return projectType;
    }

    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }

    public boolean isAutoBuild() {
        return autoBuild;
    }

    public void setAutoBuild(boolean autoBuild) {
        this.autoBuild = autoBuild;
    }

    public static class ProjectListComparator implements Comparator<ProjectInfoConsole> {
        @Override
        public int compare(ProjectInfoConsole t1, ProjectInfoConsole t2) {
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
