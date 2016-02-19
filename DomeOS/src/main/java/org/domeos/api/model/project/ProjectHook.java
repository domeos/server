package org.domeos.api.model.project;

/**
 * Created by feiliu206363 on 2015/11/19.
 */
public class ProjectHook {
    int id;
    String url;
    boolean push_events;
    boolean issues_events;
    boolean merge_requests_events;
    boolean tag_push_events;
    boolean note_events;
    boolean enable_ssl_verification;

    public ProjectHook() {}

    public ProjectHook(int id, String url, boolean push_events, boolean tag_push_events) {
        this.id = id;
        this.url = url;
        this.push_events = push_events;
        this.tag_push_events = tag_push_events;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public boolean isPush_events() {
        return push_events;
    }

    public void setPush_events(boolean push_events) {
        this.push_events = push_events;
    }

    public boolean issues_events() {
        return issues_events;
    }

    public void setIssues_events(boolean issues_events) {
        this.issues_events = issues_events;
    }

    public boolean isMerge_requests_events() {
        return merge_requests_events;
    }

    public void setMerge_requests_events(boolean merge_requests_events) {
        this.merge_requests_events = merge_requests_events;
    }

    public boolean isTag_push_events() {
        return tag_push_events;
    }

    public void setTag_push_events(boolean tag_push_events) {
        this.tag_push_events = tag_push_events;
    }

    public boolean isNote_events() {
        return note_events;
    }

    public void setNote_events(boolean note_events) {
        this.note_events = note_events;
    }

    public boolean isEnable_ssl_verification() {
        return enable_ssl_verification;
    }

    public void setEnable_ssl_verification(boolean enable_ssl_verification) {
        this.enable_ssl_verification = enable_ssl_verification;
    }
}
