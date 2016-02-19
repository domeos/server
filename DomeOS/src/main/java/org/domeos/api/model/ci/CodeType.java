package org.domeos.api.model.ci;

/**
 * Created by feiliu206363 on 2015/12/10.
 */
public enum  CodeType {
    github("org.domeos.util.code.GithubApiWrapper"),
    gitlab("org.domeos.util.code.GitlabApiWrapper"),
    bitbucket("org.domeos.util.code.BitbucketApiWrapper"),
    subversion("org.domeos.util.code.SubversionApiWrapper");


    public final String codeType;

    CodeType(String codeType) {
        this.codeType = codeType;
    }

    public String getCodeType() {
        return this.codeType;
    }

    public static String getTypeByName(String name) {
        if (github.name().equals(name)) {
            return github.getCodeType();
        } else if (gitlab.name().equals(name)) {
            return gitlab.getCodeType();
        } else if (bitbucket.name().equals(name)) {
            return bitbucket.getCodeType();
        } else if (subversion.name().equals(name)) {
            return subversion.getCodeType();
        }else {
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
            return  true;
        } else {
            return false;
        }
    }
}
