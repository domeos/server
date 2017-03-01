package org.domeos.framework.shiro.filter;

import org.apache.shiro.web.filter.mgt.FilterChainResolver;
import org.apache.shiro.web.mgt.WebSecurityManager;
import org.apache.shiro.web.servlet.AbstractShiroFilter;
import org.apache.shiro.web.servlet.ShiroHttpServletRequest;

import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by feiliu206363 on 2015/12/9.
 */
public class JsessionIdAvoidFilter extends AbstractShiroFilter {

    public JsessionIdAvoidFilter(WebSecurityManager webSecurityManager, FilterChainResolver resolver) {
        if (webSecurityManager == null) {
            throw new IllegalArgumentException("WebSecurityManager property cannot be null.");
        } else {
            super.setSecurityManager(webSecurityManager);
            if (resolver != null) {
                super.setFilterChainResolver(resolver);
            }

        }
    }

    @Override
    protected ServletResponse wrapServletResponse(HttpServletResponse orig, ShiroHttpServletRequest request) {
        return new JessionShiroHttpServletResponse(orig, getServletContext(), request);
    }
}
