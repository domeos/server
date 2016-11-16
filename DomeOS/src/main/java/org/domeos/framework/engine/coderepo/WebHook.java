package org.domeos.framework.engine.coderepo;

import org.domeos.framework.api.model.ci.related.CodeInfomation;
import org.domeos.framework.api.model.ci.related.CommitInformation;

/**
 * Created by feiliu206363 on 2015/12/10.
 */
public interface WebHook {
    int getProject_id();

    String getTag();

    String getBranch();

    String getAfter();

    String getRepositoryName();

    String getCommitMessage();

    String getUser_name();

    String getUser_email();

    long getCommitTimestamp();

    String getCommitAuthorName();

    String getCommitAuthorEmail();

    CodeInfomation generateCodeInfo();

    CommitInformation generateCommitInfo();
}
