package org.domeos.util;

import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Created by anningluo on 2016/1/19.
 */

public class MD5Util {
    public static String getMD5InHex(String data) {
        try {
            MessageDigest messageDigest = MessageDigest.getInstance("MD5");
            messageDigest.update(data.getBytes());
            byte[] result = messageDigest.digest();
            return new BigInteger(1, result).toString(16);
        } catch (NoSuchAlgorithmException e) {
            return null;
        }
    }
}
