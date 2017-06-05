package org.domeos.framework.shiro.realm;

import org.apache.shiro.authc.*;
import org.apache.shiro.ldap.UnsupportedAuthenticationMechanismException;
import org.apache.shiro.realm.ldap.JndiLdapRealm;
import org.apache.shiro.realm.ldap.LdapContextFactory;
import org.apache.shiro.realm.ldap.LdapUtils;
import org.domeos.framework.shiro.token.MultiAuthenticationToken;

import javax.naming.AuthenticationNotSupportedException;
import javax.naming.NamingException;
import javax.naming.ldap.LdapContext;

/**
 * Created by zhenfengchen on 15-12-2.
 */

public class LdapRealm extends JndiLdapRealm {

    public LdapRealm() {
        super();
        setName("LDAP");
    }

    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(
            AuthenticationToken token) throws AuthenticationException {
        AuthenticationInfo info;
        try {
            NewLdapContextFactory contextFactory = (NewLdapContextFactory) getContextFactory();
            MultiAuthenticationToken mlat = (MultiAuthenticationToken) token;
            if (mlat.getServer() != null) {
                contextFactory.setUrl(mlat.getServer());
            } else {
                contextFactory.setLdapInfo();
            }
            info = queryForAuthenticationInfo(token, contextFactory);
        } catch (AuthenticationNotSupportedException e) {
            String msg = "Unsupported configured authentication mechanism.";
            throw new UnsupportedAuthenticationMechanismException(msg, e);
        } catch (javax.naming.AuthenticationException e) {
            String msg = "LDAP authentication failed.";
            throw new AuthenticationException(msg, e);
        } catch (NamingException e) {
            String msg = "LDAP naming error while attempting to authenticate user.";
            throw new AuthenticationException(msg, e);
        } catch (UnknownAccountException e) {
            String msg = "UnknownAccountException";
            throw new UnknownAccountException(msg, e);
        } catch (IncorrectCredentialsException e) {
            String msg = "IncorrectCredentialsException";
            throw new IncorrectCredentialsException(msg, e);
        } catch (Exception e) {
            throw new UnsupportedAuthenticationMechanismException(e.getMessage());
        }
        return info;
    }

    @Override
    protected AuthenticationInfo queryForAuthenticationInfo(
            AuthenticationToken token, LdapContextFactory ldapContextFactory)
            throws NamingException {
        Object principal = token.getPrincipal();
        Object credentials = token.getCredentials();

        LdapContext ctx = null;
        try {
            ctx = ldapContextFactory.getLdapContext(principal, credentials);
            return createAuthenticationInfo(token, principal, credentials, ctx);
        } finally {
            LdapUtils.closeContext(ctx);
        }
    }
}
