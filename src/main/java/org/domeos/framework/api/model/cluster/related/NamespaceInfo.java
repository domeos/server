package org.domeos.framework.api.model.cluster.related;

/**
 * Created by feiliu206363 on 2015/12/25.
 */
public class NamespaceInfo {

    private String name;
    private long createTime;

    public NamespaceInfo() {
    }

    public NamespaceInfo(String name, long createTime) {
        this.name = name;
        this.createTime = createTime;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }
}
