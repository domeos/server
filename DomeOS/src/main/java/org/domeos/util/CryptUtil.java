package org.domeos.util;

/**
 * Created by baokangwang on 2016/5/6.
 */

import sun.misc.BASE64Decoder;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

public class CryptUtil {

    private static final CryptUtil INSTANCE = new CryptUtil();

    public CryptUtil() {
    }

    public static CryptUtil getInstance() {
        return INSTANCE;
    }

    private Key initKeyForAES(String key) throws NoSuchAlgorithmException {
        if (null == key || key.length() == 0) {
            throw new NullPointerException("key not is null");
        }
        SecretKeySpec key2 = null;
        try {
            KeyGenerator kgen = KeyGenerator.getInstance("AES");
            kgen.init(128, new SecureRandom(key.getBytes()));
            SecretKey secretKey = kgen.generateKey();
            byte[] enCodeFormat = secretKey.getEncoded();
            key2 = new SecretKeySpec(enCodeFormat, "AES");
        } catch (NoSuchAlgorithmException ex) {
            throw new NoSuchAlgorithmException();
        }
        return key2;
    }

    public String encryptAES(String content, String key) {
        try {
            SecretKeySpec secretKey = (SecretKeySpec) initKeyForAES(key);
            Cipher cipher = Cipher.getInstance("AES"); // 创建密码器
            byte[] byteContent = content.getBytes("utf-8");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey); // 初始化
            byte[] result = cipher.doFinal(byteContent);
            return asHex(result); // 加密
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public String decryptAES(String content, String key) {
        try {
            SecretKeySpec secretKey = (SecretKeySpec) initKeyForAES(key);
            Cipher cipher = Cipher.getInstance("AES"); // 创建密码器
            cipher.init(Cipher.DECRYPT_MODE, secretKey); // 初始化
            byte[] result = cipher.doFinal(asBytes(content));
            return new String(result); // 加密
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public String asHex(byte buf[]) {
        StringBuffer strbuf = new StringBuffer(buf.length * 2);
        int i;
        for (i = 0; i < buf.length; i++) {
            if (((int) buf[i] & 0xff) < 0x10) {
                strbuf.append("0");
            }
            strbuf.append(Long.toString((int) buf[i] & 0xff, 16));
        }
        return strbuf.toString();
    }

    public String getMD5(String source) {
        String s = null;
        char hexDigits[] = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                'a', 'b', 'c', 'd', 'e', 'f'};
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            md.update(source.getBytes());
            byte tmp[] = md.digest();
            char str[] = new char[16 * 2];

            int k = 0;
            for (int i = 0; i < 16; i++) {
                str[k++] = hexDigits[tmp[i] >>> 4 & 0xf];
                str[k++] = hexDigits[tmp[i] & 0xf];
            }
            s = new String(str);
        } catch (Exception e) {
            //
        }
        return s;
    }

    public byte[] asBytes(String hexStr) {
        if (hexStr.length() < 1) {
            return null;
        }
        byte[] result = new byte[hexStr.length() / 2];
        for (int i = 0; i < hexStr.length() / 2; i++) {
            int high = Integer.parseInt(hexStr.substring(i * 2, i * 2 + 1), 16);
            int low = Integer.parseInt(hexStr.substring(i * 2 + 1, i * 2 + 2),
                    16);
            result[i] = (byte) (high * 16 + low);
        }
        return result;
    }

    // 将 s 进行 BASE64 编码
    public String encode(String s) {
        if (s == null) {
            return null;
        }
        return (new sun.misc.BASE64Encoder()).encode(s.getBytes());
    }

    // 将 BASE64 编码的字符串 s 进行解码
    public String decode(String s) {
        if (s == null) {
            return null;
        }
        BASE64Decoder decoder = new BASE64Decoder();
        try {
            byte[] b = decoder.decodeBuffer(s);
            return new String(b);
        } catch (Exception e) {
            return null;
        }
    }

    public String byteArrayToMD5(byte[] data, int offset, int length) throws Exception {
        String md5 = "";
        if (data == null) {
            throw new Exception("data is null");
        }
        if (offset < 0 || offset >= data.length) {
            throw new Exception("invalid offset value");
        }
        if (length <= 0) {
            throw new Exception("invalid length value");
        }
        MessageDigest messagedigest = null;
        try {
            messagedigest = MessageDigest.getInstance("MD5");
        } catch (NoSuchAlgorithmException e) {
        }

        messagedigest.update(data, offset, length);
        md5 = toHexString(messagedigest.digest());
        return md5;
    }

    public String toHexString(byte[] md) {
        char hexDigits[] = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                'a', 'b', 'c', 'd', 'e', 'f'};
        int j = md.length;
        char str[] = new char[j * 2];
        for (int i = 0; i < j; i++) {
            byte byte0 = md[i];
            str[2 * i] = hexDigits[byte0 >>> 4 & 0xf];
            str[i * 2 + 1] = hexDigits[byte0 & 0xf];
        }
        return new String(str);
    }
}
