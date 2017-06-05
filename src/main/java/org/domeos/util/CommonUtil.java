package org.domeos.util;

import io.fabric8.kubernetes.api.model.Quantity;

import org.domeos.global.GlobalConstant;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import javax.servlet.http.HttpServletRequest;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Created by zhenfengchen on 15-11-18.
 */
public class CommonUtil {
    private static final DateTimeFormatter RFC1123_DATE_TIME_FORMATTER =
            DateTimeFormat.forPattern("EEE, dd MMM yyyy HH:mm:ss 'GMT'")
                    .withZoneUTC().withLocale(Locale.US);
    
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
        } else if (memory.endsWith("Ki")) {
            memory = String.valueOf(Long.valueOf(memory.substring(0, memory.length() - 2)) * 1024);
        } else if (memory.endsWith("M")) {
            memory = memory.substring(0, memory.length() - 1) + "000000";
        } else if (memory.endsWith("Mi")) {
            memory = String.valueOf(Long.valueOf(memory.substring(0, memory.length() - 2)) * 1048576);
        } else if (memory.endsWith("G")) {
            memory = memory.substring(0, memory.length() - 1) + "000000000";
        } else if (memory.endsWith("Gi")) {
            memory = String.valueOf(Long.valueOf(memory.substring(0, memory.length() - 2)) * 1073741824);
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
    
    public static boolean checkUrlHostEqual(String url1, String url2) {
        if (url1 == null || url2 == null) {
            return false;
        }
        url1 = domainUrl(url1);
        url2 = domainUrl(url2);
        return StringUtils.equalsIgnoreCase(url1, url2);
    }

    public static String timestamp() {
        return new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
    }
    
    public static String dateString() {
        return RFC1123_DATE_TIME_FORMATTER.print(System.currentTimeMillis());
//        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
//        return sdf.format(new Date());
    }

    public static String getScheme(String url) {
        if (StringUtils.isBlank(url)) {
            return null;
        }
        if (url.startsWith("https://")) {
            return "https";
        } else {
            return "http";
        }
    }

    public static String getHost(String url) {
        if (StringUtils.isBlank(url)) {
            return null;
        }
        url = domainUrl(url);
        if (url.contains(":")) {
            return url.substring(0, url.lastIndexOf(":"));
        } else {
            return url;
        }
    }

    public static int getPort(String url) {
        if (StringUtils.isBlank(url)) {
            return -1;
        }
        url = domainUrl(url);
        if (url.contains(":")) {
            return Integer.valueOf(url.substring(url.lastIndexOf(":") + 1));
        } else {
            return -1;
        }
    }
    
    public static String generateServiceDnsName(String nameSpace, String domain, String serviceName){
        String namespace = StringUtils.isBlank(nameSpace) ? "default" : nameSpace;
        String dnsSuffix = "." + namespace + ".svc.";
        if(!StringUtils.isBlank(domain)) {
            dnsSuffix += domain;
        } else {
            dnsSuffix += "domeos.local";
        }
        if (!StringUtils.isBlank(serviceName)) {
            if (serviceName.indexOf(GlobalConstant.RC_NAME_PREFIX) == -1) {
                return GlobalConstant.RC_NAME_PREFIX + serviceName + dnsSuffix;
            } else {
                return serviceName + dnsSuffix;
            }
        } else {
            return GlobalConstant.RC_NAME_PREFIX + "xxx" + dnsSuffix;
        }
    }
}
