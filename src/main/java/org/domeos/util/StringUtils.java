package org.domeos.util;

import org.domeos.global.GlobalConstant;

import java.util.regex.Pattern;

/**
 * Created by xupeng on 16-6-21.
 */
public class StringUtils extends org.apache.commons.lang.StringUtils {
    private static Pattern dnsNamePattern = Pattern.compile("[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*");
    private static Pattern envNamePattern = Pattern.compile("[A-Za-z_][A-Za-z0-9_]*");
    private static Pattern labelNamePattern = Pattern.compile("([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]");
    private static Pattern imageNamePattern = Pattern.compile("[a-z0-9]+([._-][a-z0-9]+)*");
    private static Pattern mobilePattern = Pattern.compile("^((13[0-9])|(15[^4,\\D])|(18[0,5-9]))\\d{8}$");
    private static Pattern emailPattern = Pattern.compile("^([a-z0-9A-Z]+[-|\\.]?)+[a-z0-9A-Z]@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\.)+[a-zA-Z]{2,}$");
    private static Pattern volumeNamePattern = Pattern.compile("^[a-z0-9]([-a-z0-9]*[a-z0-9])?$");
    
    public static String pvcClaimNameUtil(String name) {
        if (isBlank(name)) {
            return name;
        }
        if (name.startsWith(GlobalConstant.RC_NAME_PREFIX)) {
            return name;
        } else {
            return GlobalConstant.RC_NAME_PREFIX + name;
        }
    }

    public static String configmapNameUtil(String name) {
        if (isBlank(name)) {
            return name;
        }
        if (!name.startsWith(GlobalConstant.RC_NAME_PREFIX)) {
            name = GlobalConstant.RC_NAME_PREFIX + name;
        }
        if (!name.endsWith(GlobalConstant.CONFIG_MAP_SUFFIX)) {
            name = name + GlobalConstant.CONFIG_MAP_SUFFIX;
        }
        return name;
    }

    public static boolean checkDnsNamePattern(String name) {
        try {
            return dnsNamePattern.matcher(name).matches();
        } catch (Exception e) {
            return false;
        }
    }
    
    public static boolean checkEnvNamePattern(String name) {
        try {
            return envNamePattern.matcher(name).matches();
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean checkLabelNamePattern(String name) {
        try {
            return labelNamePattern.matcher(name).matches();
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean checkImageNamePattern(String name) {
        try {
            return imageNamePattern.matcher(name).matches();
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean checkMobilePattern(String name) {
        try {
            return mobilePattern.matcher(name).matches();
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean checkEmailPattern(String name) {
        try {
            return emailPattern.matcher(name).matches();
        } catch (Exception e) {
            return false;
        }
    }

    public static String removeFirstSlash(String str) {
        if (isBlank(str)) {
            return str;
        }
        if (str.startsWith("/")) {
            return str.substring(1);
        }
        return str;
    }

    // use for exclusive build
    public static String getFilenameWithSlash(String savePath) {
        if (savePath.endsWith("/")) {
            savePath = savePath.substring(0, savePath.length() - 1);
            return substringAfterLast(savePath, "/") + "/";
        }
        return substringAfterLast(savePath, "/");
    }
    
    public static boolean checkVolumeNamePattern(String name) {
        try {
            return volumeNamePattern.matcher(name).matches();
        } catch (Exception e) {
            return false;
        }
    }
}