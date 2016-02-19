package org.domeos.util;

/**
 * Created by zhenfengchen on 15-12-8.
 */
public class ResourceUtil {

    public static final String RESOURCE_DELIMITER = "/";

    public static String getOwnerName(String resourceName) {
        String[] tmp = resourceName.split(RESOURCE_DELIMITER);
        if (tmp.length != 2) {
            return null;
        } else {
            return tmp[0];
        }
    }

}
