package org.domeos.framework.api.model.global;

/**
 * Created by KaiRen on 2017/5/5.
 */
public class LoginOption {
    private boolean normalLogin;
    private boolean ldapLogin;
    private boolean ssoLogin;

    public LoginOption() {
    }

    public boolean isNormalLogin() {
        return normalLogin;
    }

    public void setNormalLogin(boolean normalLogin) {
        this.normalLogin = normalLogin;
    }

    public boolean isLdapLogin() {
        return ldapLogin;
    }

    public void setLdapLogin(boolean ldapLogin) {
        this.ldapLogin = ldapLogin;
    }

    public boolean isSsoLogin() {
        return ssoLogin;
    }

    public void setSsoLogin(boolean ssoLogin) {
        this.ssoLogin = ssoLogin;
    }
}
