package org.domeos.framework.api.model.ci.related;

/**
 * Created by feiliu206363 on 2016/4/4.
 */
public class CommitInformation {
    String name;
    String id;
    String message;
    long authoredDate;
    String authorName;
    String authorEmail;
    long committedDate;
    String committerName;
    String committerEmail;

    public CommitInformation() {
    }

    public CommitInformation(String name, String id, String message, long authoredDate, String authorName, String authorEmail,
                             long committedDate, String committerName, String committerEmail) {
        this.name = name;
        this.id = id;
        this.message = message;
        this.authoredDate = authoredDate;
        this.authorName = authorName;
        this.authorEmail = authorEmail;
        this.committedDate = committedDate;
        this.committerName = committerName;
        this.committerEmail = committerEmail;
    }

    public long getAuthoredDate() {
        return authoredDate;
    }

    public void setAuthoredDate(long authoredDate) {
        this.authoredDate = authoredDate;
    }

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

    public long getCommittedDate() {
        return committedDate;
    }

    public void setCommittedDate(long committedDate) {
        this.committedDate = committedDate;
    }

    public String getCommitterName() {
        return committerName;
    }

    public void setCommitterName(String committerName) {
        this.committerName = committerName;
    }

    public String getCommitterEmail() {
        return committerEmail;
    }

    public void setCommitterEmail(String committerEmail) {
        this.committerEmail = committerEmail;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
}
