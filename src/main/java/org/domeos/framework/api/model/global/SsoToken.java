package org.domeos.framework.api.model.global;

import org.apache.shiro.cas.CasToken;

/**
 * Created by KaiRen on 2017/5/9.
 */
public class SsoToken extends CasToken {
    private String from;

    public SsoToken(String ticket, String from) {
        super(ticket);
        this.from = from;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }
}
