package org.domeos.framework.shiro.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Created by feiliu206363 on 2015/12/9.
 */
public class JsessionIdAvoiderFilter implements Filter {

    private static Logger logger = LoggerFactory.getLogger(JsessionIdAvoiderFilter.class);

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        boolean allowFilterChain = redirectToAvoidJsessionId((HttpServletRequest) req, (HttpServletResponse) res);
        // if its redirected, then no need to continue processing the request
        if (allowFilterChain) {
            chain.doFilter(req, res);
        }
    }

    public static boolean redirectToAvoidJsessionId(HttpServletRequest req, HttpServletResponse res) {
        String requestURI = req.getRequestURI();
        try {
            if (requestURI.indexOf(";JSESSIONID=") > 0) {
                res.sendRedirect(requestURI.substring(0, requestURI.indexOf(";JSESSIONID=")));
                return false;
            }
        } catch (IOException e) {
            logger.error(e.getMessage());
        }
        return true;
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void destroy() {
    }
}
