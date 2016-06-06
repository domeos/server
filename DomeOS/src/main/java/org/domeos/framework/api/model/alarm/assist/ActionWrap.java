package org.domeos.framework.api.model.alarm.assist;

import org.domeos.framework.api.model.alarm.falcon.portal.Action;

/**
 * Created by baokangwang on 2016/3/30.
 */

public class ActionWrap {

    private String msg;
    private Action data;

    public ActionWrap() {
    }

    public ActionWrap(String msg, Action data) {
        this.msg = msg;
        this.data = data;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Action getData() {
        return data;
    }

    public void setData(Action data) {
        this.data = data;
    }
}
