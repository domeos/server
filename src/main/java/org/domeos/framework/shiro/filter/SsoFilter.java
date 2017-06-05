package org.domeos.framework.shiro.filter;

import org.apache.http.client.utils.URIBuilder;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.cas.CasFilter;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.web.util.WebUtils;
import org.domeos.framework.api.model.global.SsoInfo;
import org.domeos.framework.api.model.global.SsoToken;
import org.domeos.framework.engine.SsoUtil;
import org.domeos.global.GlobalConstant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URISyntaxException;

/**
 * Created by KaiRen on 2017/4/11.
 */
public class SsoFilter extends CasFilter {
    private static Logger logger = LoggerFactory.getLogger(SsoFilter.class);
    private static final String FROM_PARAMETER = "from";
    private static final String TICKET_PARAMETER = "ticket";

    @Override
    protected boolean onLoginSuccess(AuthenticationToken token, Subject subject, ServletRequest request,
                                     ServletResponse response) throws Exception {
        WebUtils.issueRedirect(request, response, getSuccessUrl());
        return false;
    }

    @Override
    protected AuthenticationToken createToken(ServletRequest request, ServletResponse response) throws Exception {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String ticket = httpRequest.getParameter(TICKET_PARAMETER);
        String from = httpRequest.getParameter(FROM_PARAMETER);
        return new SsoToken(ticket, from);
    }


    @Override
    protected boolean onLoginFailure(AuthenticationToken token, AuthenticationException ae, ServletRequest request,
                                     ServletResponse response) {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String from = httpRequest.getParameter(FROM_PARAMETER);
        String casServerLoginUrl = "";
        SsoInfo ssoInfo = SsoUtil.getSsoInfo();
        if (ssoInfo != null) {
            casServerLoginUrl = ssoInfo.getCasServerUrl() + ssoInfo.getLoginUrl();
        }
        String failureUrl = null;
        try {
            URIBuilder uriBuilder = new URIBuilder(casServerLoginUrl);
            uriBuilder.addParameter("service", from + GlobalConstant.SSO_API + "?from=" + from);
            failureUrl = uriBuilder.toString();
        } catch (URISyntaxException e) {
            logger.error("Cannot build failure url : {}", e);
            return false;
        }
        if (logger.isDebugEnabled()) {
            logger.debug( "Authentication exception", ae );
        }
        // is user authenticated or in remember me mode ?
        Subject subject = getSubject(request, response);
        if (subject.isAuthenticated() || subject.isRemembered()) {
            try {
                issueSuccessRedirect(request, response);
            } catch (Exception e) {
                logger.error("Cannot redirect to the default success url", e);
            }
        } else {
            try {
                WebUtils.issueRedirect(request, response, failureUrl);
            } catch (IOException e) {
                logger.error("Cannot redirect to failure url : {}", failureUrl, e);
            }
        }
        return false;
    }
}
