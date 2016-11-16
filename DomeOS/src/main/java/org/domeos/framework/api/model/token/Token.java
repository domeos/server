package org.domeos.framework.api.model.token;

/**
 * Created by KaiRen on 16/8/5.
 */
public class Token {
    private String token;
    private long expires_in;
    private String issued_at;

    public Token(String token, long expires_in, String issued_at) {
        this.token = token;
        this.expires_in = expires_in;
        this.issued_at = issued_at;
    }

    public Token() {
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public long getExpires_in() {
        return expires_in;
    }

    public void setExpires_in(long expires_in) {
        this.expires_in = expires_in;
    }

    public String getIssued_at() {
        return issued_at;
    }

    public void setIssued_at(String issued_at) {
        this.issued_at = issued_at;
    }
}
