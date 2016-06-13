package org.domeos.framework.api.model.alarm.assist;

/**
 * Created by baokangwang on 2016/4/14.
 */
public class Link {

    private long id;
    private String content;

    public Link() {
    }

    public Link(long id, String content) {
        this.id = id;
        this.content = content;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
