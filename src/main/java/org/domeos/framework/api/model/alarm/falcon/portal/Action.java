package org.domeos.framework.api.model.alarm.falcon.portal;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class Action {

    // action

    private long id;
    private String uic;
    private String url;
    private int callback = 0;
    private int before_callback_sms = 0;
    private int before_callback_mail = 0;
    private int after_callback_sms = 0;
    private int after_callback_mail = 0;

    public Action() {
    }

    public Action(long id) {
        this.id = id;
    }

    public Action(long id, String uic, String url, int callback, int before_callback_sms, int before_callback_mail,
                  int after_callback_sms, int after_callback_mail) {
        this.id = id;
        this.uic = uic;
        this.url = url;
        this.callback = callback;
        this.before_callback_sms = before_callback_sms;
        this.before_callback_mail = before_callback_mail;
        this.after_callback_sms = after_callback_sms;
        this.after_callback_mail = after_callback_mail;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getUic() {
        return uic;
    }

    public void setUic(String uic) {
        this.uic = uic;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public int getCallback() {
        return callback;
    }

    public void setCallback(int callback) {
        this.callback = callback;
    }

    public int getBefore_callback_sms() {
        return before_callback_sms;
    }

    public void setBefore_callback_sms(int before_callback_sms) {
        this.before_callback_sms = before_callback_sms;
    }

    public int getBefore_callback_mail() {
        return before_callback_mail;
    }

    public void setBefore_callback_mail(int before_callback_mail) {
        this.before_callback_mail = before_callback_mail;
    }

    public int getAfter_callback_sms() {
        return after_callback_sms;
    }

    public void setAfter_callback_sms(int after_callback_sms) {
        this.after_callback_sms = after_callback_sms;
    }

    public int getAfter_callback_mail() {
        return after_callback_mail;
    }

    public void setAfter_callback_mail(int after_callback_mail) {
        this.after_callback_mail = after_callback_mail;
    }
}

