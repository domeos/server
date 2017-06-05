package org.domeos.framework.shiro.filter;

import com.google.common.collect.Lists;
import org.apache.commons.lang3.StringUtils;
import org.springframework.web.filter.ShallowEtagHeaderFilter;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * Created by feiliu206363 on 2017/2/15.
 */
public class FrontFilter extends ShallowEtagHeaderFilter implements Filter {
    private static List<String> suffix = Lists.newArrayList(new String[]{
            ".css",
            ".eot",
            ".gif",
            ".ico",
            ".js",
            ".map",
            ".png",
            ".svg",
            ".swf",
            ".ttf",
            ".TTF",
            ".ttf",
            ".woff",
            ".woff2"
    });

    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
//        response.setHeader("Access-Control-Allow-Origin", "*");
//        response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE, PATCH, HEAD");
//        response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//        response.setHeader("Access-Control-Expose-Headers", "All-Style-Names");
//        response.setHeader("Access-Control-Allow-Credentials", "true");
//        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Server", "Apache-Coyote/1.1");
        response.setHeader("Cache-Control", "max-age=0");
        String uri = request.getRequestURI();
        if (!StringUtils.isBlank(uri)) {
            int index = uri.lastIndexOf(".");
            if (index > 0 && suffix.contains(uri.substring(index))) {
                response.setHeader("Cache-Control", "max-age=3600");
            }
            if (uri.startsWith("/lib")) {
                response.setHeader("Cache-Control", "max-age=3600, immutable");
            }
        }
        super.doFilterInternal(request, response, filterChain);
    }
}