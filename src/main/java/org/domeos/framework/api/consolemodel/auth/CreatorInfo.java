package org.domeos.framework.api.consolemodel.auth;

/**
 * Created by feiliu206363 on 2016/9/22.
 */
public class CreatorInfo {
    private String name;
    private int creatorId;

    public String getName() {
        return name;
    }

    public CreatorInfo setName(String name) {
        this.name = name;
        return this;
    }

    public int getCreatorId() {
        return creatorId;
    }

    public CreatorInfo setCreatorId(int creatorId) {
        this.creatorId = creatorId;
        return this;
    }
}
