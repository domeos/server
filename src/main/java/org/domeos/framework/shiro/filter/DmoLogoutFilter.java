package org.domeos.framework.shiro.filter;

import org.apache.shiro.session.SessionException;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.web.filter.authc.LogoutFilter;
import org.domeos.framework.api.model.auth.related.LoginType;
import org.domeos.framework.api.model.global.SsoInfo;
import org.domeos.framework.engine.SsoUtil;
import org.domeos.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import java.util.Set;

/**
 * Created by KaiRen on 2017/4/11.
 */
public class DmoLogoutFilter extends LogoutFilter {

    private static final Logger log = LoggerFactory.getLogger(DmoLogoutFilter.class);
    private static final String FROM_PARAMETER = "from";

    @Override
    protected boolean preHandle(ServletRequest request, ServletResponse response) throws Exception {
        Subject subject = getSubject(request, response);
        //try/catch added for SHIRO-298:
        try {
            if (subject.getPrincipals() != null) {
                Set<String> realmNames = subject.getPrincipals().getRealmNames();
                SsoInfo ssoInfo = SsoUtil.getSsoInfo();
                if (ssoInfo != null) {
                    for (String realmName : realmNames){
                        if (StringUtils.equalsIgnoreCase(realmName, LoginType.SSO.name())) {
                            HttpServletRequest httpRequest = (HttpServletRequest) request;
                            String from = httpRequest.getParameter(FROM_PARAMETER);
                            setRedirectUrl(ssoInfo.getCasServerUrl() + ssoInfo.getLogoutUrl() + "?service=" + from + "/login/login.html ");
                            break;
                        }
                    }
                }
            }
            subject.logout();
        } catch (SessionException ise) {
            log.debug("Encountered session exception during logout. This can generally safely be ignored.", ise);
        }
        String redirectUrl = getRedirectUrl(request, response, subject);
        issueRedirect(request, response, redirectUrl);
        return false;
    }

}
