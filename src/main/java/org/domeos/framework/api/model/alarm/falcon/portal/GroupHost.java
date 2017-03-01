package org.domeos.framework.api.model.alarm.falcon.portal;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class GroupHost {

    // grp_host

    private long grp_id;
    private long host_id;

    public GroupHost() {
    }

    public GroupHost(long grp_id, long host_id) {
        this.grp_id = grp_id;
        this.host_id = host_id;
    }

    public long getGrp_id() {
        return grp_id;
    }

    public void setGrp_id(long grp_id) {
        this.grp_id = grp_id;
    }

    public long getHost_id() {
        return host_id;
    }

    public void setHost_id(long host_id) {
        this.host_id = host_id;
    }
}
