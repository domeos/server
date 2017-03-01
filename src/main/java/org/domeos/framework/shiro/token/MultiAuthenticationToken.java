package org.domeos.framework.shiro.token;

import org.apache.shiro.authc.UsernamePasswordToken;
import org.domeos.framework.api.model.auth.related.LoginType;

/**
 * Created by feiliu206363 on 2015/12/11.
 */

public class MultiAuthenticationToken extends UsernamePasswordToken {

    private LoginType type;
    private String server;

    public MultiAuthenticationToken(final String username, final char[] password, LoginType type) {
        setUsername(username);
        setPassword(password);
        setType(type);
    }

    public MultiAuthenticationToken(final String username, final String password, LoginType type) {
        setUsername(username);
        setPassword(password != null ? password.toCharArray() : null);
        setType(type);
    }

    public MultiAuthenticationToken(final String username, final String password, String server, LoginType type) {
        setUsername(username);
        setPassword(password != null ? password.toCharArray() : null);
        setType(type);
        setServer(server);
    }

    public LoginType getType() {
        return type;
    }

    public void setType(LoginType type) {
        this.type = type;
    }

    public String getServer() {
        return server;
    }

    public void setServer(String server) {
        this.server = server;
    }
}
