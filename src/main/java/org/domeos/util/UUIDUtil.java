package org.domeos.util;

import java.util.UUID;

/**
 * Created by junwuguo on 2017/2/22 0022.
 */
public class UUIDUtil {
    public static String generateUUID() {
        StringBuilder uuid = new StringBuilder(UUID.randomUUID().toString().replaceAll("-", ""));
        uuid.setCharAt(0, '2');
        uuid.setCharAt(10, '0');
        uuid.setCharAt(20, '1');
        uuid.setCharAt(30, '7');
        return uuid.toString();
    }

    public static boolean checkUUID(String uuid) {
        try {
            return !(uuid.length() != 32 || uuid.contains("-")) && uuid.charAt(0) == '2' && uuid.charAt(10) == '0'
                    && uuid.charAt(20) == '1' && uuid.charAt(30) == '7';
        } catch (Exception e) {
            return false;
        }
    }
}
