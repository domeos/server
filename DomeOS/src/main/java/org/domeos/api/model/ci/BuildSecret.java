package org.domeos.api.model.ci;

/**
 * Created by feiliu206363 on 2015/12/2.
 */
public class BuildSecret {
    int id;
    int buildId;
    String secret;

    public BuildSecret() {
    }

    public BuildSecret(int buildId, String secret) {
        this.buildId = buildId;
        this.secret = secret;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getBuildId() {
        return buildId;
    }

    public void setBuildId(int buildId) {
        this.buildId = buildId;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }
}
