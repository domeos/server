package org.domeos.framework.api.consolemodel.auth;

/**
 * Created by zhenfengchen on 15-12-6.
 */
public class Namespace {
    private String type;  // USER or GROUP
    private String name;  // userName or groupName
    private long id;      // userId or groupId

    public Namespace() {
    }

    public Namespace(String type, String name, long id) {
        this.type = type;
        this.name = name;
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }
}
