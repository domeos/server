package org.domeos.framework.api.model.project;

import org.domeos.framework.api.consolemodel.auth.CreatorInfo;
import org.domeos.framework.api.consolemodel.project.ProjectCollectionConsole;
import org.domeos.framework.engine.model.RowModelBase;

/**
 * Created by feiliu206363 on 2016/9/22.
 */
public class ProjectCollection extends RowModelBase {
    private int creatorId;
    private ProjectCollectionState projectCollectionState;

    public int getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(int creatorId) {
        this.creatorId = creatorId;
    }

    public ProjectCollectionState getProjectCollectionState() {
        return projectCollectionState;
    }

    public void setProjectCollectionState(ProjectCollectionState projectCollectionState) {
        this.projectCollectionState = projectCollectionState;
    }

    @Override
    public boolean equals(Object o) {
        if (o != null && o instanceof ProjectCollection) {
            ProjectCollection collection = (ProjectCollection) o;
            if (this.getId() == collection.getId()) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    @Override
    public int hashCode() {
        return getId();
    }

    public ProjectCollectionConsole createProjectCollectionList(String creatorName) {
        ProjectCollectionConsole tmp = new ProjectCollectionConsole();
        tmp.setId(this.getId());
        tmp.setName(this.getName());
        tmp.setCreateTime(this.getCreateTime());
        tmp.setDescription(this.getDescription());
        tmp.setCreatorInfo(new CreatorInfo().setCreatorId(this.getCreatorId()).setName(creatorName));
        tmp.setProjectCollectionState(projectCollectionState);
        return tmp;
    }

    public enum ProjectCollectionState {
        PUBLIC,
        PRIVATE
    }
}
