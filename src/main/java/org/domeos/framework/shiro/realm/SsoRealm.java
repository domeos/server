package org.domeos.framework.shiro.realm;

import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.cas.CasRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.related.LoginType;
import org.domeos.framework.api.model.auth.related.UserState;
import org.domeos.framework.api.model.global.SsoInfo;
import org.domeos.framework.api.model.global.SsoToken;
import org.domeos.global.GlobalConstant;
import org.domeos.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import javax.annotation.PostConstruct;
import java.util.HashSet;

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
        SsoToken ssoToken = (SsoToken) token;
        if (!StringUtils.isBlank(ssoToken.getFrom())) {
            setCasService(ssoToken.getFrom() + GlobalConstant.SSO_API);
        }
        AuthenticationInfo authc = super.doGetAuthenticationInfo(token);
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
}
