package org.domeos.util;

import org.apache.shiro.crypto.RandomNumberGenerator;
import org.apache.shiro.crypto.SecureRandomNumberGenerator;
import org.apache.shiro.crypto.hash.SimpleHash;
import org.apache.shiro.util.ByteSource;
import org.domeos.api.model.user.User;

/**
 * Created by zhenfengchen on 15-11-16.
 */
public class CryptoUtil {
    private static RandomNumberGenerator randomNumberGenerator = new SecureRandomNumberGenerator();
    private static String algorithmName = "md5";
    private static int hashIterations = 2;

    public static String generateSalt() {
        return randomNumberGenerator.nextBytes().toHex();
    }

    public static String encryptPassword(String password, String salt) {
        return new SimpleHash(
            algorithmName,
            password,
            ByteSource.Util.bytes(salt),
            hashIterations).toHex();
    }

    public static void encryptPassword(User user) {
        String newPassword = new SimpleHash(
            algorithmName,
            user.getPassword(),
            ByteSource.Util.bytes(user.getSalt()),
            hashIterations).toHex();
        user.setPassword(newPassword);
    }
}
