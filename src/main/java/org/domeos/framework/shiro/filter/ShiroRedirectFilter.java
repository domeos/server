package org.domeos.framework.shiro.filter;

import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.web.filter.authc.FormAuthenticationFilter;
import org.apache.shiro.web.util.WebUtils;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Created by feiliu206363 on 2017/2/14.
 */
public class ShiroRedirectFilter extends FormAuthenticationFilter {
    @Override
    protected void setFailureAttribute(ServletRequest request, AuthenticationException ae) {
        request.setAttribute(getFailureKeyAttribute(), ae);
    }

    @Override
    protected void redirectToLogin(ServletRequest servletRequest, ServletResponse servletResponse) throws IOException {
        try {
            HttpServletRequest request = (HttpServletRequest) servletRequest;
            String requestURI = request.getRequestURI();
            HttpServletResponse response = (HttpServletResponse) servletResponse;
            if (requestURI.equals("/")) {
                WebUtils.issueRedirect(request, response, "/login/login.html");
            } else {

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setCharacterEncoding("UTF-8");
                response.setContentType("text/html");

                PrintWriter writer = response.getWriter();
                writer.print("<html><head><meta http-equiv=\"refresh\" content=\"0; URL=/login/login.html\"></head><body>" +
                        "<a href=\"login/login.html\">您尚未登录，请登录后再访问</a></body></html>");
            }

        } catch (Exception e) {
            super.redirectToLogin(servletRequest, servletResponse);
        }
    }
}
