package org.domeos.api.model.project;

/**
 * Created by feiliu206363 on 2015/11/16.
 */
public class CodeConfig {
    int id;
    int projectId;
    String codeManager; // for now, only support git
    String codeSource;
    String codeHttpUrl; // git url to pull code
    String codeSshUrl;
    int codeId;
    int userInfo;

    public CodeConfig() {}

    public CodeConfig(int projectId, String codeManager, String codeSource, String codeHttpUrl, String codeSshUrl, int codeId, int userInfo) {
        this.projectId = projectId;
        this.codeManager = codeManager;
        this.codeSource = codeSource;
        this.codeHttpUrl = codeHttpUrl;
        this.codeSshUrl = codeSshUrl;
        this.codeId = codeId;
        this.userInfo = userInfo;
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

    public String getCodeManager() {
        return codeManager;
    }

    public void setCodeManager(String codeManager) {
        this.codeManager = codeManager;
    }

    public String getCodeSource() {
        return codeSource;
    }

    public void setCodeSource(String codeSource) {
        this.codeSource = codeSource;
    }

    public String getCodeHttpUrl() {
        return codeHttpUrl;
    }

    public void setCodeHttpUrl(String codeHttpUrl) {
        this.codeHttpUrl = codeHttpUrl;
    }

    public String getCodeSshUrl() {
        return codeSshUrl;
    }

    public void setCodeSshUrl(String codeSshUrl) {
        this.codeSshUrl = codeSshUrl;
    }

    public int getCodeId() {
        return codeId;
    }

    public void setCodeId(int codeId) {
        this.codeId = codeId;
    }

    public int getUserInfo() {
        return userInfo;
    }

    public void setUserInfo(int userInfo) {
        this.userInfo = userInfo;
    }
}
