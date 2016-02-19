package org.domeos.api.model.ci;

/**
 * Created by feiliu206363 on 2015/11/19.
 */
public class RSAKeyPair {
    int id;
    int projectId;
    int keyId;
    String privateKey;
    String publicKey;
    String fingerPrint;

    public RSAKeyPair() {}

    public RSAKeyPair(String privateKey, String publicKey, String fingerPrint) {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
        this.fingerPrint = fingerPrint;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getProjectId() {
        return projectId;
    }

    public void setProjectId(int projectId) {
        this.projectId = projectId;
    }

    public int getKeyId() {
        return keyId;
    }

    public void setKeyId(int keyId) {
        this.keyId = keyId;
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
