package org.domeos.framework.api.service.global.impl;

import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.*;
import org.apache.shiro.subject.Subject;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.resource.ResourceBiz;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.related.LoginType;
import org.domeos.framework.api.model.global.LdapInfo;
import org.domeos.framework.api.model.global.LdapLoginInfo;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.service.global.LdapInfoService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.shiro.token.MultiAuthenticationToken;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2015/12/30.
 */
@Service("ldapInfoService")
public class LdapInfoServiceImpl implements LdapInfoService {

    @Autowired
    GlobalBiz globalBiz;
    @Autowired
    ResourceBiz resourceBiz;

    private int checkAdmin() {
        User user = GlobalConstant.userThreadLocal.get();
        if (user == null || !AuthUtil.isAdmin(user.getId())) {
            throw new PermitException();
        }
        return user.getId();
    }

    @Override
    public HttpResponseTemp<?> getLdapInfo() {
        checkAdmin();
        LdapInfo ldapInfo = globalBiz.getLdapInfo();
        return ResultStat.OK.wrap(ldapInfo);
    }

    @Override
    public HttpResponseTemp<?> setLdapInfo(LdapInfo ldapInfo) {
        checkAdmin();

        if (!StringUtils.isBlank(ldapInfo.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, ldapInfo.checkLegality());
        }

        globalBiz.deleteLdapInfo();
        globalBiz.addLdapInfo(ldapInfo);

//        ResourceHistory resourceHistory = new ResourceHistory(ResourceType.LDAP.getResourceName(), ldapInfo.getId(),
//                OperationType.SET.getOperation(), userId, System.currentTimeMillis(), "OK");
//        resourceHistoryMapper.addResourceHistory(resourceHistory);

        return ResultStat.OK.wrap(ldapInfo);
    }

    @Override
    public HttpResponseTemp<?> modifyLdapInfo(LdapInfo ldapInfo) {
        checkAdmin();

        if (!StringUtils.isBlank(ldapInfo.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, ldapInfo.checkLegality());
        }

        globalBiz.updateLdapInfo(ldapInfo);
//        ResourceHistory resourceHistory = new ResourceHistory(ResourceType.LDAP.getResourceName(), ldapInfo.getId(),
//                OperationType.MODIFY.getOperation(), userId, System.currentTimeMillis(), "OK");
//        resourceHistoryMapper.addResourceHistory(resourceHistory);

        return ResultStat.OK.wrap(ldapInfo);
    }

    @Override
    public HttpResponseTemp<?> deleteLdapInfo(int id) {
        checkAdmin();

        globalBiz.deleteLdapInfo();

//        ResourceHistory resourceHistory = new ResourceHistory(ResourceType.LDAP.getResourceName(), id,
//                OperationType.DELETE.getOperation(), userId, System.currentTimeMillis(), "OK");
//        resourceHistoryMapper.addResourceHistory(resourceHistory);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> ldapLoginTest(LdapLoginInfo ldapLoginInfo) {
        if (!StringUtils.isBlank(ldapLoginInfo.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, ldapLoginInfo.checkLegality());
        }

        return normalLogin(ldapLoginInfo);
    }

    public HttpResponseTemp<?> normalLogin(LdapLoginInfo ldapLoginInfo) {
        Subject subject = SecurityUtils.getSubject();
        String ldapEmailSuffix = ldapLoginInfo.getEmailSuffix();
        String userName = ldapLoginInfo.getUsername();
        if (ldapEmailSuffix != null && !userName.endsWith(ldapEmailSuffix)) {
            ldapLoginInfo.setUsername(userName + ldapEmailSuffix);
        }
        UsernamePasswordToken token = new MultiAuthenticationToken(ldapLoginInfo.getUsername(), ldapLoginInfo.getPassword(), ldapLoginInfo.getServer(), LoginType.LDAP);
        try {
            subject.login(token);
            return ResultStat.OK.wrap(null);
        } catch (UnknownAccountException e) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("username wrong");
        } catch (IncorrectCredentialsException e) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("password wrong");
        } catch (ExcessiveAttemptsException e) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("login wrong too many times");
        } catch (AuthenticationException e) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("other reasons, " + e.getMessage());
        }
    }
}
