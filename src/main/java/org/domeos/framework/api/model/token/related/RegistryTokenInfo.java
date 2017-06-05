package org.domeos.framework.api.model.token.related;

import org.domeos.util.StringUtils;

/**
 * Created by KaiRen on 16/8/17.
 */
public class RegistryTokenInfo {
    private String issuer;
    private String service;
    private String private_key;

    public RegistryTokenInfo() {
    }

    public RegistryTokenInfo(String issuer, String service, String private_key) {
        this.issuer = issuer;
        this.service = service;
        this.private_key = private_key;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getPrivate_key() {
        return private_key;
    }

    public void setPrivate_key(String private_key) {
        this.private_key = private_key;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(issuer)) {
            return "issuer must be set if use token service.";
        } else if (StringUtils.isBlank(service)) {
            return "service must be set if use token service";
        } else if (StringUtils.isBlank(private_key)) {
            return "private_key must be set if use token service";
        } else {
            return null;
        }
    }
}
