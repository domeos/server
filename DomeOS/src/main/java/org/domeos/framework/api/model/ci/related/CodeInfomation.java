package org.domeos.framework.api.model.ci.related;

/**
 * Created by feiliu206363 on 2016/4/4.
 */
public class CodeInfomation {
    private String codeBranch;
    private String codeTag;

    public String getCodeBranch() {
        return codeBranch;
    }

    public void setCodeBranch(String codeBranch) {
        this.codeBranch = codeBranch;
    }

    public String getCodeTag() {
        return codeTag;
    }

    public void setCodeTag(String codeTag) {
        this.codeTag = codeTag;
    }
}
