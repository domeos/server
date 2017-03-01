package org.domeos.util;

import io.fabric8.kubernetes.api.model.Quantity;
import org.domeos.global.GlobalConstant;

import javax.servlet.http.HttpServletRequest;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by zhenfengchen on 15-11-18.
 */
public class CommonUtil {
    public static boolean useAjax(HttpServletRequest request) {
        return "XMLHttpRequest".equalsIgnoreCase(request.getHeader("X-Requested-With"));
    }

    public static String registryFullUrl(String url) {
        if (!StringUtils.isBlank(url) && url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }
        return fullUrl(url);
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

    public static Quantity getMemory(Quantity memoryQuantity) {
        String memory = memoryQuantity.getAmount();
        if (memory.endsWith("K")) {
            memory = memory.substring(0, memory.length() - 1) + "000";
        }
        if (memory.endsWith("Ki")) {
            memory = String.valueOf(Long.valueOf(memory.substring(0, memory.length() - 2)) * 1024);
        }
        memoryQuantity.setAmount(memory);
        return memoryQuantity;
    }

    public static String getNameWithoutSuffix(String name) {
        if (name == null) {
            return name;
        }
        if (name.contains("@")) {
            return name.split("@")[0];
        } else {
            return name;
        }
    }

    public static String timestamp() {
        return new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
    }
}
