package org.domeos.framework.api.model.ci.related;

/**
 * Created by feiliu206363 on 2016/4/4.
 */
public class CommitInformation {
    private String id;
    private String message;
    private String authorName;
    private String authorEmail;
    private long createdAt;

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public void setAuthorEmail(String authorEmail) {
        this.authorEmail = authorEmail;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public CommitInformation setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
        return this;
    }
}
