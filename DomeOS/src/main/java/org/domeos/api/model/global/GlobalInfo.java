package org.domeos.api.model.global;

/**
 * Created by feiliu206363 on 2016/1/20.
 */
public class GlobalInfo {
    int id;
    GlobalType type;
    String value;
    long createTime;
    long lastUpdate;

    public GlobalInfo() {
    }

    public GlobalInfo(GlobalType type, String value) {
        this.type = type;
        this.value = value;
    }

    public GlobalInfo(int id, GlobalType type, String value) {
        this.id = id;
        this.type = type;
        this.value = value;
    }

    public GlobalInfo(GlobalType type, String value, long createTime, long lastUpdate) {
        this.type = type;
        this.value = value;
        this.createTime = createTime;
        this.lastUpdate = lastUpdate;
    }

    public GlobalInfo(int id, GlobalType type, String value, long createTime, long lastUpdate) {
        this.id = id;
        this.type = type;
        this.value = value;
        this.createTime = createTime;
        this.lastUpdate = lastUpdate;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public GlobalType getType() {
        return type;
    }

    public void setType(GlobalType type) {
        this.type = type;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public long getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(long lastUpdate) {
        this.lastUpdate = lastUpdate;
    }
}
