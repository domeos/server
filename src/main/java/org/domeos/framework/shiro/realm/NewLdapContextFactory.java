package org.domeos.framework.shiro.realm;

import org.apache.shiro.realm.ldap.JndiLdapContextFactory;
import org.apache.shiro.realm.ldap.LdapContextFactory;
import org.apache.shiro.util.StringUtils;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.model.global.LdapInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.naming.AuthenticationException;
import javax.naming.NamingException;
import javax.naming.ldap.Control;
import javax.naming.ldap.InitialLdapContext;
import javax.naming.ldap.LdapContext;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;

/**
 * Created by feiliu206363 on 2015/12/29.
 */
@Component("ldapContextFactory")
public class NewLdapContextFactory implements LdapContextFactory {

    protected static final String SUN_CONNECTION_POOLING_PROPERTY = "com.sun.jndi.ldap.connect.pool";
    protected static final String DEFAULT_CONTEXT_FACTORY_CLASS_NAME = "com.sun.jndi.ldap.LdapCtxFactory";
    protected static final String SIMPLE_AUTHENTICATION_MECHANISM_NAME = "simple";
    protected static final String DEFAULT_REFERRAL = "follow";

    private static final Logger logger = LoggerFactory.getLogger(JndiLdapContextFactory.class);
    private Map<String, Object> environment = new HashMap<>();
    private String systemUsername;
    private String systemPassword;
    private boolean poolingEnabled;

    @Autowired
    private GlobalBiz globalBiz;

    public GlobalBiz getGlobalBiz() {
        return globalBiz;
    }

    public void setGlobalBiz(GlobalBiz globalBiz) {
        this.globalBiz = globalBiz;
    }

    public NewLdapContextFactory() {
        this.setContextFactoryClassName("com.sun.jndi.ldap.LdapCtxFactory");
        this.setReferral("follow");
        this.poolingEnabled = true;
    }

    public void setAuthenticationMechanism(String authenticationMechanism) {
        this.setEnvironmentProperty("java.naming.security.authentication", authenticationMechanism);
    }

    public String getAuthenticationMechanism() {
        return (String) this.getEnvironmentProperty("java.naming.security.authentication");
    }

    public void setContextFactoryClassName(String contextFactoryClassName) {
        this.setEnvironmentProperty("java.naming.factory.initial", contextFactoryClassName);
    }

    public String getContextFactoryClassName() {
        return (String) this.getEnvironmentProperty("java.naming.factory.initial");
    }

    public Map<String, Object> getEnvironment() {
        return this.environment;
    }

    public void setEnvironment(Map<String, Object> env) {
        this.environment = env;
    }

    private Object getEnvironmentProperty(String name) {
        return this.environment.get(name);
    }

    private void setEnvironmentProperty(String name, String value) {
        if (StringUtils.hasText(value)) {
            this.environment.put(name, value);
        } else {
            this.environment.remove(name);
        }
    }

    public boolean isPoolingEnabled() {
        return this.poolingEnabled;
    }

    public void setPoolingEnabled(boolean poolingEnabled) {
        this.poolingEnabled = poolingEnabled;
    }

    public void setReferral(String referral) {
        this.setEnvironmentProperty("java.naming.referral", referral);
    }

    public String getReferral() {
        return (String) this.getEnvironmentProperty("java.naming.referral");
    }

    public void setUrl(String url) {
        this.setEnvironmentProperty("java.naming.provider.url", url);
    }

    public String getUrl() {
        return (String) this.getEnvironmentProperty("java.naming.provider.url");
    }

    public void setSystemPassword(String systemPassword) {
        this.systemPassword = systemPassword;
    }

    public String getSystemPassword() {
        return this.systemPassword;
    }

    public void setSystemUsername(String systemUsername) {
        this.systemUsername = systemUsername;
    }

    public String getSystemUsername() {
        return this.systemUsername;
    }

    public LdapContext getSystemLdapContext() throws NamingException {
        return this.getLdapContext((Object) this.getSystemUsername(), (Object) this.getSystemPassword());
    }

    /**
     * @deprecated
     */
    @Deprecated
    public LdapContext getLdapContext(String username, String password) throws NamingException {
        return this.getLdapContext((Object) username, (Object) password);
    }

    protected boolean isPoolingConnections(Object principal) {
        return this.isPoolingEnabled() && principal != null && principal.equals(this.getSystemUsername());
    }

    public LdapContext getLdapContext(Object principal, Object credentials) throws NamingException, IllegalStateException {
        String url = this.getUrl();
        if (url == null) {
            throw new IllegalStateException("An LDAP URL must be specified of the form ldap://<hostname>:<port>");
        } else {
            Hashtable<String, Object> env = new Hashtable<>(this.environment);
            String authcMech = this.getAuthenticationMechanism();
            if (authcMech == null && (principal != null || credentials != null)) {
                env.put("java.naming.security.authentication", "simple");
            }

            if (principal != null) {
                env.put("java.naming.security.principal", principal);
            }

            if (credentials != null) {
                env.put("java.naming.security.credentials", credentials);
            }

            boolean pooling = this.isPoolingConnections(principal);
            if (pooling) {
                env.put("com.sun.jndi.ldap.connect.pool", "true");
            }

            if (logger.isDebugEnabled()) {
                logger.debug("Initializing LDAP context using URL [{}] and principal [{}] with pooling {}", url, principal, pooling ? "enabled" : "disabled");
            }

            this.validateAuthenticationInfo(env);
            return this.createLdapContext(env);
        }
    }

    protected LdapContext createLdapContext(Hashtable env) throws NamingException {
        return new InitialLdapContext(env, (Control[]) null);
    }

    protected void validateAuthenticationInfo(Hashtable<String, Object> environment) throws AuthenticationException {
        if ("simple".equals(environment.get("java.naming.security.authentication")) &&
                environment.get("java.naming.security.principal") != null &&
                StringUtils.hasText(String.valueOf(environment.get("java.naming.security.principal")))) {
            Object credentials = environment.get("java.naming.security.credentials");
            if (credentials == null ||
                    credentials instanceof byte[] && ((byte[]) ((byte[]) credentials)).length <= 0 ||
                    credentials instanceof char[] && ((char[]) ((char[]) credentials)).length <= 0 ||
                    String.class.isInstance(credentials) && !StringUtils.hasText(String.valueOf(credentials))) {
                throw new AuthenticationException("LDAP Simple authentication requires both a principal and credentials.");
            }
        }
    }

    public void setLdapInfo() throws Exception {
        LdapInfo ldapInfo = globalBiz.getLdapInfo();
        if (ldapInfo != null) {
            this.setUrl(ldapInfo.getServer());
        } else {
            throw new Exception("no ldap info");
        }
    }
}
