package org.domeos.framework.api.model.alarm.falcon.portal;

import java.sql.Timestamp;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class PluginDir {

    // plugin_dir

    private long id;
    private long grp_id;
    private String dir;
    private String create_user = "";
    private Timestamp create_at = new Timestamp(System.currentTimeMillis());

    public PluginDir() {
    }

    public PluginDir(long id) {
        this.id = id;
    }

    public PluginDir(long id, long grp_id, String dir, String create_user, Timestamp create_at) {
        this.id = id;
        this.grp_id = grp_id;
        this.dir = dir;
        this.create_user = create_user;
        this.create_at = create_at;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public long getGrp_id() {
        return grp_id;
    }

    public void setGrp_id(long grp_id) {
        this.grp_id = grp_id;
    }

    public String getDir() {
        return dir;
    }

    public void setDir(String dir) {
        this.dir = dir;
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
}
