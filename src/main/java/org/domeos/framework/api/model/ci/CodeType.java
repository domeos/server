package org.domeos.framework.api.model.ci;

import org.domeos.framework.api.model.project.related.CodeManager;

/**
 * Created by feiliu206363 on 2015/12/10.
 */
public enum CodeType {
    github("org.domeos.util.code.GithubApiWrapper"),
    gitlab("org.domeos.framework.engine.coderepo.GitlabApiWrapper"),
    bitbucket("org.domeos.util.code.BitbucketApiWrapper"),
    subversion("org.domeos.framework.engine.coderepo.SubversionApiWrapper");

    public final String codeType;

    CodeType(String codeType) {
        this.codeType = codeType;
    }

    public String getCodeType() {
        return this.codeType;
    }

    public static String getTypeByName(CodeManager name) {
        switch (name) {
            case github:
                return github.getCodeType();
            case gitlab:
                return gitlab.getCodeType();
            case subversion:
                return subversion.getCodeType();
            default:
                return null;
        }
    }

    public static boolean isSupported(String name) {
        if (github.name().equals(name)) {
            return true;
        } else if (gitlab.name().equals(name)) {
            return true;
        } else if (bitbucket.name().equals(name)) {
            return true;
        } else if (subversion.name().equals(name)) {
            return true;
        } else {
            return false;
        }
    }
}
