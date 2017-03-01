package org.domeos.framework.api.model.ci.related;

import org.domeos.framework.engine.model.RowModelBase;

/**
 * Created by feiliu206363 on 2016/4/4.
 */
public class RSAKeyPair extends RowModelBase {
    private String privateKey;
    private String publicKey;
    private String fingerPrint;

    public RSAKeyPair() {
    }

    public RSAKeyPair(String privateKey, String publicKey, String fingerPrint) {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
        this.fingerPrint = fingerPrint;
    }

    public String getPrivateKey() {
        return privateKey;
    }

    public void setPrivateKey(String privateKey) {
        this.privateKey = privateKey;
    }

    public String getPublicKey() {
        return publicKey;
    }

    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }

    public String getFingerPrint() {
        return fingerPrint;
    }

    public void setFingerPrint(String fingerPrint) {
        this.fingerPrint = fingerPrint;
    }
}
