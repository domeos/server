package org.domeos.api.service.global.impl;

import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.*;
import org.apache.shiro.subject.Subject;
import org.domeos.api.mapper.resource.ResourceHistoryMapper;
import org.domeos.api.model.global.LdapInfo;
import org.domeos.api.model.global.LdapLoginInfo;
import org.domeos.api.model.resource.ResourceHistory;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.OperationType;
import org.domeos.api.model.user.UserLoginType;
import org.domeos.api.service.global.GlobalService;
import org.domeos.api.service.global.LdapInfoService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.shiro.AuthUtil;
import org.domeos.shiro.token.MultiAuthenticationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2015/12/30.
 */
@Service("ldapInfoService")
public class LdapInfoServiceImpl implements LdapInfoService {

    @Autowired
    GlobalService globalService;
    @Autowired
    ResourceHistoryMapper resourceHistoryMapper;

    @Override
    public HttpResponseTemp<?> getLdapInfo(Long userId) {
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        LdapInfo ldapInfo = globalService.getLdapInfo();
        return ResultStat.OK.wrap(ldapInfo);
    }

    @Override
    public HttpResponseTemp<?> setLdapInfo(LdapInfo ldapInfo, Long userId) {
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }

        if (!StringUtils.isBlank(ldapInfo.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, ldapInfo.checkLegality());
        }

        globalService.deleteLdapInfo();
        globalService.addLdapInfo(ldapInfo);

        ResourceHistory resourceHistory = new ResourceHistory(ResourceType.LDAP.getResourceName(), ldapInfo.getId(),
                OperationType.SET.getOperation(), userId, System.currentTimeMillis(), "OK");
        resourceHistoryMapper.addResourceHistory(resourceHistory);

        return ResultStat.OK.wrap(ldapInfo);
    }

    @Override
    public HttpResponseTemp<?> modifyLdapInfo(LdapInfo ldapInfo, Long userId) {
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }

        if (!StringUtils.isBlank(ldapInfo.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, ldapInfo.checkLegality());
        }

        globalService.updateLdapInfo(ldapInfo);
        ResourceHistory resourceHistory = new ResourceHistory(ResourceType.LDAP.getResourceName(), ldapInfo.getId(),
                OperationType.MODIFY.getOperation(), userId, System.currentTimeMillis(), "OK");
        resourceHistoryMapper.addResourceHistory(resourceHistory);

        return ResultStat.OK.wrap(ldapInfo);
    }

    @Override
    public HttpResponseTemp<?> deleteLdapInfo(int id, long userId) {
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }

        globalService.deleteLdapInfo();

        ResourceHistory resourceHistory = new ResourceHistory(ResourceType.LDAP.getResourceName(), id,
                OperationType.DELETE.getOperation(), userId, System.currentTimeMillis(), "OK");
        resourceHistoryMapper.addResourceHistory(resourceHistory);
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
        UsernamePasswordToken token = new MultiAuthenticationToken(ldapLoginInfo.getUsername(), ldapLoginInfo.getPassword(), ldapLoginInfo.getServer(), UserLoginType.LDAP);
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
