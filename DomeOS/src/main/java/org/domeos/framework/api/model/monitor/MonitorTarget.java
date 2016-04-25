package org.domeos.framework.api.model.monitor;

import java.util.Date;

/**
 * Created by baokangwang on 2016/3/7.
 */
public class MonitorTarget {

    private long id;
    private String target;
    private Date createTime;

    public MonitorTarget() {
    }

    public MonitorTarget(long id, String target, Date createTime) {
        this.id = id;
        this.target = target;
        this.createTime = createTime;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }
}