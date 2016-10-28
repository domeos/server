package org.domeos.framework.engine.k8s.util;

/**
 * Created by xupeng on 16-6-21.
 */
public class StringUtils {
    public static boolean isBlank(String s) {
        return s == null || s.length() == 0;
    }
}
