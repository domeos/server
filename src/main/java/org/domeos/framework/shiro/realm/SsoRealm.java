package org.domeos.framework.shiro.realm;

import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.cas.CasAuthenticationException;
import org.apache.shiro.cas.CasRealm;
import org.apache.shiro.cas.CasToken;
import org.apache.shiro.subject.PrincipalCollection;
import org.apache.shiro.subject.SimplePrincipalCollection;
import org.apache.shiro.util.CollectionUtils;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.related.LoginType;
import org.domeos.framework.api.model.auth.related.UserState;
import org.domeos.framework.api.model.global.SsoInfo;
import org.domeos.util.StringUtils;
import org.jasig.cas.client.authentication.AttributePrincipal;
import org.jasig.cas.client.validation.Assertion;
import org.jasig.cas.client.validation.TicketValidationException;
import org.jasig.cas.client.validation.TicketValidator;
import org.springframework.beans.factory.annotation.Autowired;

import javax.annotation.PostConstruct;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

/**
 * Created by KaiRen on 2017/4/11.
 */
public class SsoRealm  extends CasRealm {


    @Autowired
    private GlobalBiz globalBiz;

    @Autowired
    private AuthBiz authBiz;

    @PostConstruct
    private void initCasConfig() {
        SsoInfo ssoInfo = globalBiz.getSsoInfo();
        if (ssoInfo != null) {
            setCasServerUrlPrefix(ssoInfo.getCasServerUrl());
        } else {
            setCasServerUrlPrefix("");
        }
    }

    public SsoRealm() {
        super();
        setName("SSO");

    }

    @Override
    public String getCasServerUrlPrefix() {
        SsoInfo ssoInfo = globalBiz.getSsoInfo();
        if (ssoInfo == null) {
            return "";
        }
        return ssoInfo.getCasServerUrl();
    }

    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {

        String username = (String) principals.getPrimaryPrincipal();

        SimpleAuthorizationInfo authorizationInfo = new SimpleAuthorizationInfo();
        HashSet<String> roles = new HashSet<>();
        roles.addAll(authBiz.getRole(username));
        authorizationInfo.setRoles(roles);
        return authorizationInfo;
    }

    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) {
        AuthenticationInfo authc = testInfo(token);
        if (authc == null) {
            return null;
        }

        String username = (String) authc.getPrincipals().getPrimaryPrincipal();
        if (StringUtils.isBlank(username)) {
            return null;
        }
        User user = authBiz.getUserByName(username);
        if (user == null) {
            user = new User();
            user.setUsername(username);
            user.setCreateTime(System.currentTimeMillis());
            user.setState(UserState.NORMAL);
            user.setPassword("NULL");
            user.setEmail(username);
            user.setLoginType(LoginType.LDAP);
            authBiz.addUser(user);
        } else {
            user.setUpdateTime(System.currentTimeMillis());
            authBiz.modifyUser(user);
        }
        return new SimpleAuthenticationInfo(
                user.getUsername(),
                token.getCredentials(),
                getName()
        );
    }

    private AuthenticationInfo testInfo(AuthenticationToken token) {
        CasToken casToken = (CasToken)token;
        if(token == null) {
            return null;
        } else {
            String ticket = (String)casToken.getCredentials();
            if(!org.apache.shiro.util.StringUtils.hasText(ticket)) {
                return null;
            } else {
                TicketValidator ticketValidator = this.ensureTicketValidator();
                try {
                    Assertion casAssertion = ticketValidator.validate(ticket, this.getCasService());
                    AttributePrincipal casPrincipal = casAssertion.getPrincipal();
                    String userId = casPrincipal.getName();
//                    logger.info("Validate ticket : {} in CAS server : {} to retrieve user : {}", new Object[]{ticket, this.getCasServerUrlPrefix(), userId});
                    Map<String, Object> attributes = casPrincipal.getAttributes();
                    casToken.setUserId(userId);
                    String rememberMeAttributeName = this.getRememberMeAttributeName();
                    String rememberMeStringValue = (String)attributes.get(rememberMeAttributeName);
                    boolean isRemembered = rememberMeStringValue != null && Boolean.parseBoolean(rememberMeStringValue);
                    if(isRemembered) {
                        casToken.setRememberMe(true);
                    }

                    List<Object> principals = CollectionUtils.asList(new Object[]{userId, attributes});
                    PrincipalCollection principalCollection = new SimplePrincipalCollection(principals, this.getName());
                    return new SimpleAuthenticationInfo(principalCollection, ticket);
                } catch (TicketValidationException var14) {
//                    logger.info("now authentication token");
                    throw new CasAuthenticationException("Unable to validate ticket [" + ticket + "]", var14);
                }
            }
        }
    }
}
