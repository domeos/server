package org.domeos.shiro.token;

import org.apache.shiro.authc.UsernamePasswordToken;
import org.domeos.api.model.user.UserLoginType;

/**
 * Created by feiliu206363 on 2015/12/11.
 */

public class MultiAuthenticationToken extends UsernamePasswordToken {

    private UserLoginType type;
    private String server;

    public MultiAuthenticationToken(final String username, final char[] password, UserLoginType type) {
        setUsername(username);
        setPassword(password);
        setType(type);
    }

    public MultiAuthenticationToken(final String username, final String password, UserLoginType type) {
        setUsername(username);
        setPassword(password != null ? password.toCharArray() : null);
        setType(type);
    }

    public MultiAuthenticationToken(final String username, final String password, String server, UserLoginType type) {
        setUsername(username);
        setPassword(password != null ? password.toCharArray() : null);
        setType(type);
        setServer(server);
    }

    public UserLoginType getType() {
        return type;
    }

    public void setType(UserLoginType type) {
        this.type = type;
    }

    public String getServer() {
        return server;
    }

    public void setServer(String server) {
        this.server = server;
    }
}
