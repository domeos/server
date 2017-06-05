package org.domeos.framework.api.model.alarm;

/**
 * Created by baokangwang on 2016/3/31.
 */
public class CallBackInfo {

    private long id;
    private String url;
    private boolean beforeCallbackSms;
    private boolean beforeCallbackMail;
    private boolean afterCallbackSms;
    private boolean afterCallbackMail;

    public CallBackInfo() {
    }

    public CallBackInfo(long id, String url, boolean beforeCallbackSms, boolean beforeCallbackMail, boolean afterCallbackSms, boolean afterCallbackMail) {
        this.id = id;
        this.url = url;
        this.beforeCallbackSms = beforeCallbackSms;
        this.beforeCallbackMail = beforeCallbackMail;
        this.afterCallbackSms = afterCallbackSms;
        this.afterCallbackMail = afterCallbackMail;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public boolean isBeforeCallbackSms() {
        return beforeCallbackSms;
    }

    public void setBeforeCallbackSms(boolean beforeCallbackSms) {
        this.beforeCallbackSms = beforeCallbackSms;
    }

    public boolean isBeforeCallbackMail() {
        return beforeCallbackMail;
    }

    public void setBeforeCallbackMail(boolean beforeCallbackMail) {
        this.beforeCallbackMail = beforeCallbackMail;
    }

    public boolean isAfterCallbackSms() {
        return afterCallbackSms;
    }

    public void setAfterCallbackSms(boolean afterCallbackSms) {
        this.afterCallbackSms = afterCallbackSms;
    }

    public boolean isAfterCallbackMail() {
        return afterCallbackMail;
    }

    public void setAfterCallbackMail(boolean afterCallbackMail) {
        this.afterCallbackMail = afterCallbackMail;
    }
}
