package org.domeos.util;

import org.apache.commons.lang3.StringUtils;
import org.domeos.global.GlobalConstant;

import javax.servlet.http.HttpServletRequest;
/**
 * Created by zhenfengchen on 15-11-18.
 */
public class CommonUtil {
    public static boolean useAjax(HttpServletRequest request) {
        return "XMLHttpRequest".equalsIgnoreCase(request.getHeader("X-Requested-With"));
    }

    public static String fullUrl(String url) {
        if (StringUtils.isBlank(url) || url.startsWith(GlobalConstant.HTTP_PREFIX) || url.startsWith(GlobalConstant.HTTPS_PREFIX)) {
            return url;
        } else {
            return GlobalConstant.HTTP_PREFIX + url;
        }
    }

    public static String domainUrl(String url) {
        if (StringUtils.isBlank(url)) {
            return url;
        } else if (url.startsWith(GlobalConstant.HTTP_PREFIX)) {
            return url.substring(7, url.length());
        } else if (url.startsWith(GlobalConstant.HTTPS_PREFIX)) {
            return url.substring(8, url.length());
        } else {
            return url;
        }
    }

    public static String getMemory(String memory) {
        if (memory.endsWith("K")) {
            memory = memory.substring(0, memory.length() - 1) + "000";
        }
        if (memory.endsWith("Ki")) {
            memory = String.valueOf(Long.valueOf(memory.substring(0, memory.length() - 2)) * 1024);
        }
        return memory;
    }
}
