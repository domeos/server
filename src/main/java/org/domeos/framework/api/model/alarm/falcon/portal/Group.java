package org.domeos.framework.api.model.alarm.falcon.portal;

import java.sql.Timestamp;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class Group {

    // grp

    private long id;
    private String grp_name = "";
    private String create_user = "";
    private Timestamp create_at = new Timestamp(System.currentTimeMillis());
    private int come_from = 0;

    public Group() {
    }

    public Group(long id) {
        this.id = id;
    }

    public Group(long id, String grp_name, String create_user, Timestamp create_at, int come_from) {
        this.id = id;
        this.grp_name = grp_name;
        this.create_user = create_user;
        this.create_at = create_at;
        this.come_from = come_from;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getGrp_name() {
        return grp_name;
    }

    public void setGrp_name(String grp_name) {
        this.grp_name = grp_name;
    }

    public String getCreate_user() {
        return create_user;
    }

    public void setCreate_user(String create_user) {
        this.create_user = create_user;
    }

    public Timestamp getCreate_at() {
        return create_at;
    }

    public void setCreate_at(Timestamp create_at) {
        this.create_at = create_at;
    }

    public int getCome_from() {
        return come_from;
    }

    public void setCome_from(int come_from) {
        this.come_from = come_from;
    }
}
