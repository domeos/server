package org.domeos.framework.shiro.filter;

import org.apache.shiro.web.servlet.ShiroHttpServletRequest;
import org.apache.shiro.web.servlet.ShiroHttpServletResponse;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;

/**
 * Created by feiliu206363 on 2017/2/7.
 */
public class JessionShiroHttpServletResponse extends ShiroHttpServletResponse {

    private static final String DEFAULT_SESSION_ID_PARAMETER_NAME = "JSESSIONID";

    public JessionShiroHttpServletResponse(HttpServletResponse wrapped, ServletContext context, ShiroHttpServletRequest request) {
        super(wrapped, context, request);
    }

    @Override
    public String encodeRedirectURL(String url) {
        if (isEncodeable(toAbsolute(url))) {
            return toEncoded(url, getRequest().getSession().getId());
        } else {
            return url;
        }
    }

    @Override
    protected String toEncoded(String url, String sessionId) {
        if ((url == null) || (sessionId == null)) {
            return (url);
        }
        String path = url;
        String query = "";
        String anchor = "";
        int question = url.indexOf('?');
        if (question >= 0) {
            path = url.substring(0, question);
            query = url.substring(question);
        }
        int pound = path.indexOf('#');
        if (pound >= 0) {
            anchor = path.substring(pound);
            path = path.substring(0, pound);
        }
        StringBuilder sb = new StringBuilder(path);
//        if (sb.length() > 0) { // session id param can't be first.
//            sb.append(";");
//            sb.append(DEFAULT_SESSION_ID_PARAMETER_NAME);
//            sb.append("=");
//            sb.append(sessionId);
//        }
        sb.append(anchor);
        sb.append(query);
        return (sb.toString());
    }

    private String toAbsolute(String location) {
        if (location == null) {
            return null;
        } else {
            boolean leadingSlash = location.startsWith("/");
            if (!leadingSlash && this.hasScheme(location)) {
                return location;
            } else {
                StringBuilder buf = new StringBuilder();
                String scheme = getRequest().getScheme();
                String name = getRequest().getServerName();
                int port = getRequest().getServerPort();

                try {
                    buf.append(scheme).append("://").append(name);
                    if (scheme.equals("http") && port != 80 || scheme.equals("https") && port != 443) {
                        buf.append(':').append(port);
                    }

                    if (!leadingSlash) {
                        String e = getRequest().getRequestURI();
                        int iae1 = e.lastIndexOf(47);
                        e = e.substring(0, iae1);
                        String encodedURI = URLEncoder.encode(e, this.getCharacterEncoding());
                        buf.append(encodedURI).append('/');
                    }

                    buf.append(location);
                } catch (IOException var10) {
                    IllegalArgumentException iae = new IllegalArgumentException(location);
                    iae.initCause(var10);
                    throw iae;
                }

                return buf.toString();
            }
        }
    }

    private boolean hasScheme(String uri) {
        int len = uri.length();

        for (int i = 0; i < len; ++i) {
            char c = uri.charAt(i);
            if (c == 58) {
                return i > 0;
            }

            if (!isSchemeChar(c)) {
                return false;
            }
        }
        return false;
    }
}