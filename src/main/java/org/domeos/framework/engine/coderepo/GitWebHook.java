package org.domeos.framework.engine.coderepo;

import com.fasterxml.jackson.databind.JsonNode;
import org.domeos.util.StringUtils;
import org.domeos.exception.WebHooksException;
import org.domeos.framework.api.model.ci.related.CodeInfomation;
import org.domeos.framework.api.model.ci.related.CommitInformation;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.domeos.util.DateUtil;

import java.io.IOException;
import java.text.ParseException;

/**
 * Created by feiliu206363 on 2015/8/25.
 */
public class GitWebHook implements WebHook {
    String object_kind;
    String before;
    String after;
    String branch;
    String tag;
    int user_id;
    String user_name;
    String user_email;
    int project_id;
    Repository repository;
    Commit commit;
    int total_commits_count;

    public GitWebHook() {
    }

    public GitWebHook(String webHooksStr) throws WebHooksException {
        CustomObjectMapper mapper = new CustomObjectMapper();
        try {
            JsonNode node = mapper.readValue(webHooksStr, JsonNode.class);
            if (node.has("object_kind")) {
                this.object_kind = node.get("object_kind").asText();
            }
            if (node.has("ref")) {
                String ref = node.get("ref").asText();
                if (!StringUtils.isBlank(ref)) {
                    if (ref.contains("heads")) {
                        this.branch = ref.split("/")[2];
                    } else {
                        this.tag = ref.split("/")[2];
                    }
                }
            }
            if (node.has("before")) {
                this.before = node.get("before").asText();
            }
            if (node.has("after")) {
                this.after = node.get("after").asText();
            } else {
                throw new WebHooksException("no after");
            }
            if (node.has("user_id")) {
                this.user_id = node.get("user_id").asInt();
            }
            if (node.has("user_name")) {
                this.user_name = node.get("user_name").asText();
            }
            if (node.has("user_email")) {
                this.user_email = node.get("user_email").asText();
            }
            if (node.has("project_id")) {
                this.project_id = node.get("project_id").asInt();
            }
            if (node.has("repository")) {
                JsonNode repoNode = node.get("repository");
                this.repository = new Repository();
                if (repoNode.has("name")) {
                    this.repository.setName(repoNode.get("name").asText());
                }
                if (repoNode.has("url")) {
                    this.repository.setUrl(repoNode.get("url").asText());
                }
                if (repoNode.has("description")) {
                    this.repository.setDescription(repoNode.get("description").asText());
                }
            }
            if (node.has("commits")) {
                JsonNode commitsNode = node.get("commits");
                for (JsonNode commitNode : commitsNode) {
                    if (commitNode.has("id") && this.after.equals(commitNode.get("id").asText())) {
                        this.commit = new Commit();
                        this.commit.setId(this.after);
                        if (commitNode.has("author")) {
                            Commit.Author author = new Commit.Author(
                                    commitNode.get("author").get("name").asText(),
                                    commitNode.get("author").get("email").asText());
                            this.commit.setAuthor(author);
                        }
                        if (commitNode.has("message")) {
                            this.commit.setMessage(commitNode.get("message").asText());
                        }
                        if (commitNode.has("url")) {
                            this.commit.setUrl(commitNode.get("url").asText());
                        }
                        if (commitNode.has("timestamp")) {
                            String timeStr = commitNode.get("timestamp").asText();
                            if (timeStr.contains("+")) {
                                timeStr = timeStr.substring(0, timeStr.indexOf("+"));
                            }
                            try {
                                this.commit.setTimestamp(DateUtil.string2timestamp(timeStr));
                            } catch (ParseException ignored) {
                            }
                        }
                    }
                }
            }
            if (node.has("total_commits_count")) {
                this.total_commits_count = node.get("total_commits_count").asInt();
            }
        } catch (IOException e) {
            throw new WebHooksException(e.getMessage());
        }
    }

    public String getBefore() {
        return before;
    }

    public void setBefore(String before) {
        this.before = before;
    }

    public String getAfter() {
        return after;
    }

    @Override
    public String getRepositoryName() {
        if (this.repository != null) {
            this.repository.getName();
        }
        return null;
    }

    @Override
    public String getCommitMessage() {
        if (this.commit != null) {
            return commit.getMessage();
        }
        return null;
    }

    public void setAfter(String after) {
        this.after = after;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public int getUser_id() {
        return user_id;
    }

    public void setUser_id(int user_id) {
        this.user_id = user_id;
    }

    public String getUser_name() {
        return user_name;
    }

    public void setUser_name(String user_name) {
        this.user_name = user_name;
    }

    public int getProject_id() {
        return project_id;
    }

    public void setProject_id(int project_id) {
        this.project_id = project_id;
    }

    public Repository getRepository() {
        return repository;
    }

    public void setRepository(Repository repository) {
        this.repository = repository;
    }

    public String getObject_kind() {
        return object_kind;
    }

    public void setObject_kind(String object_kind) {
        this.object_kind = object_kind;
    }

    public String getUser_email() {
        return user_email;
    }

    @Override
    public long getCommitTimestamp() {
        if (this.commit != null) {
            return commit.getTimestamp();
        }
        return 0;
    }

    @Override
    public String getCommitAuthorName() {
        if (this.commit != null && commit.getAuthor() != null) {
            return commit.getAuthor().getName();
        }
        return null;
    }

    @Override
    public String getCommitAuthorEmail() {
        if (this.commit != null && commit.getAuthor() != null) {
            return commit.getAuthor().getEmail();
        }
        return null;
    }

    @Override
    public CodeInfomation generateCodeInfo() {
        CodeInfomation codeInfo = new CodeInfomation();
        codeInfo.setCodeBranch(branch);
        codeInfo.setCodeTag(tag);
        return codeInfo;
    }

    @Override
    public CommitInformation generateCommitInfo() {
        CommitInformation commitInfo = new CommitInformation();
        commitInfo.setId(after);
        commitInfo.setMessage(getCommitMessage());
        commitInfo.setAuthorName(getCommitAuthorName());
        commitInfo.setAuthorEmail(getCommitAuthorEmail());
        commitInfo.setCreatedAt(getCommitTimestamp());
        return commitInfo;
    }

    public void setUser_email(String user_email) {
        this.user_email = user_email;
    }

    public Commit getCommit() {
        return commit;
    }

    public void setCommit(Commit commit) {
        this.commit = commit;
    }

    public int getTotal_commits_count() {
        return total_commits_count;
    }

    public void setTotal_commits_count(int total_commits_count) {
        this.total_commits_count = total_commits_count;
    }

    public static class Repository {
        private String name;
        private String url;
        private String description;
        private String homepage;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getHomepage() {
            return homepage;
        }

        public void setHomepage(String homepage) {
            this.homepage = homepage;
        }
    }

    public static class Commit {
        private String id;
        private String message;
        private long timestamp;
        private String url;
        private Author author;

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

        public long getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(long timestamp) {
            this.timestamp = timestamp;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public Author getAuthor() {
            return author;
        }

        public void setAuthor(Author author) {
            this.author = author;
        }

        public static class Author {
            private String name;
            private String email;

            public Author() {
            }

            public Author(String name, String email) {
                this.name = name;
                this.email = email;
            }

            public String getEmail() {
                return email;
            }

            public void setEmail(String email) {
                this.email = email;
            }

            public String getName() {
                return name;
            }

            public void setName(String name) {
                this.name = name;
            }
        }
    }
}
