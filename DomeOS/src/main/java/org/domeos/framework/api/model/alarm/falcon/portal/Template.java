package org.domeos.framework.api.model.alarm.falcon.portal;

import java.sql.Timestamp;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class Template {

    // tpl

    private long id;
    private String tpl_name = "";
    private long parent_id = 0;
    private long action_id = 0;
    private String create_user = "";
    private Timestamp create_at = new Timestamp(System.currentTimeMillis());

    public Template() {
    }

    public Template(long id) {
        this.id = id;
    }

    public Template(long id, String tpl_name, long parent_id, long action_id, String create_user, Timestamp create_at) {
        this.id = id;
        this.tpl_name = tpl_name;
        this.parent_id = parent_id;
        this.action_id = action_id;
        this.create_user = create_user;
        this.create_at = create_at;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getTpl_name() {
        return tpl_name;
    }

    public void setTpl_name(String tpl_name) {
        this.tpl_name = tpl_name;
    }

    public long getParent_id() {
        return parent_id;
    }

    public void setParent_id(long parent_id) {
        this.parent_id = parent_id;
    }

    public long getAction_id() {
        return action_id;
    }

    public void setAction_id(long action_id) {
        this.action_id = action_id;
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
