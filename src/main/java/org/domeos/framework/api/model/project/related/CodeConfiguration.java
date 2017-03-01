package org.domeos.framework.api.model.project.related;

import org.domeos.util.StringUtils;

/**
 * Created by feiliu206363 on 2016/4/4.
 */
public class CodeConfiguration {
    // code information at gitlab
    private CodeManager codeManager;
    private String code;
    private String nameWithNamespace;
    private String codeSshUrl;
    private String codeHttpUrl;
    private String runnersToken; // gitlab version > 8 has runners token
    private int codeId;
    private int codeManagerUserId;

    public CodeConfiguration() {
    }

    public CodeConfiguration(String codeManager, int codeId, int codeManagerUserId) {
        this.codeManager = CodeManager.valueOf(codeManager);
        this.codeId = codeId;
        this.codeManagerUserId = codeManagerUserId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public CodeManager getCodeManager() {
        return codeManager;
    }

    public void setCodeManager(CodeManager codeManager) {
        this.codeManager = codeManager;
    }

    public String getNameWithNamespace() {
        return nameWithNamespace;
    }

    public void setNameWithNamespace(String nameWithNamespace) {
        this.nameWithNamespace = nameWithNamespace;
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

    public int getCodeId() {
        return codeId;
    }

    public void setCodeId(int codeId) {
        this.codeId = codeId;
    }

    public int getCodeManagerUserId() {
        return codeManagerUserId;
    }

    public void setCodeManagerUserId(int codeManagerUserId) {
        this.codeManagerUserId = codeManagerUserId;
    }

    public String getRunnersToken() {
        return runnersToken;
    }

    public CodeConfiguration setRunnersToken(String runnersToken) {
        this.runnersToken = runnersToken;
        return this;
    }

    public String checkLegality() {
        if (codeManager == null) {
            return "code manager error";
        } else if (StringUtils.isBlank(codeSshUrl) || StringUtils.isBlank(codeHttpUrl)) {
            return "code url is null";
        } else if (codeManagerUserId <= 0) {
            return "user info error";
        } else {
            return null;
        }
    }
}
