package org.domeos.framework.api.consolemodel.project;

import org.domeos.framework.api.consolemodel.CreatorDraft;
import org.domeos.framework.api.model.project.Project;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
public class ProjectCreate {
    private Project project;
    private CreatorDraft creatorDraft;

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public CreatorDraft getCreatorDraft() {
        return creatorDraft;
    }

    public void setCreatorDraft(CreatorDraft creatorDraft) {
        this.creatorDraft = creatorDraft;
    }
}
