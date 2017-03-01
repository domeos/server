package org.domeos.framework.api.model.alarm.falcon.portal;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class GroupTemplate {

    // grp_tpl

    private long grp_id;
    private long tpl_id;
    private String bind_user = "";

    public GroupTemplate() {
    }

    public GroupTemplate(long grp_id, long tpl_id, String bind_user) {
        this.grp_id = grp_id;
        this.tpl_id = tpl_id;
        this.bind_user = bind_user;
    }

    public long getGrp_id() {
        return grp_id;
    }

    public void setGrp_id(long grp_id) {
        this.grp_id = grp_id;
    }

    public long getTpl_id() {
        return tpl_id;
    }

    public void setTpl_id(long tpl_id) {
        this.tpl_id = tpl_id;
    }

    public String getBind_user() {
        return bind_user;
    }

    public void setBind_user(String bind_user) {
        this.bind_user = bind_user;
    }
}

