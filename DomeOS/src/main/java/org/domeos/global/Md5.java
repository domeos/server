package org.domeos.global;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Created by feiliu206363 on 2015/11/18.
 */
public class Md5 {
    public static String getMd5Str(byte[] bytes) throws NoSuchAlgorithmException {
        MessageDigest messageDigest = MessageDigest.getInstance("MD5");
        messageDigest.reset();
        messageDigest.update(bytes);

        byte[] byteArray = messageDigest.digest();

        StringBuilder md5StrBuff = new StringBuilder();

        for (byte aByteArray : byteArray) {
            if (Integer.toHexString(0xFF & aByteArray).length() == 1)
                md5StrBuff.append("0").append(
                        Integer.toHexString(0xFF & aByteArray));
            else
                md5StrBuff.append(Integer.toHexString(0xFF & aByteArray));
        }

        return md5StrBuff.toString();
    }
}
