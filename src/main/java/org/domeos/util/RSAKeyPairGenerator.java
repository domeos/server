package org.domeos.util;

import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.KeyPair;
import org.domeos.framework.api.model.ci.related.RSAKeyPair;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;

/**
 * Created by feiliu206363 on 2015/11/19.
 */
public class RSAKeyPairGenerator {
    static String comment = "DomeOS";

    static JSch jsch = new JSch();

    public static RSAKeyPair generateKeyPair() {
        try {
            KeyPair kpair = KeyPair.genKeyPair(jsch, KeyPair.RSA);
            kpair.setPassphrase("");
            OutputStream privateStream = new ByteArrayOutputStream();
            OutputStream publicStream = new ByteArrayOutputStream();
            kpair.writePrivateKey(privateStream);
            String privateKey = privateStream.toString();
            kpair.writePublicKey(publicStream, comment);
            String publicKey = publicStream.toString();
            String fingerPrint = kpair.getFingerPrint();
            kpair.dispose();
            return new RSAKeyPair(privateKey, publicKey, fingerPrint);
        } catch (JSchException e1) {
            e1.printStackTrace();
        }
        return null;
    }
}
