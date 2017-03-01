package org.domeos.framework.api.consolemodel.deployment;

import org.domeos.framework.api.model.deployment.DeployCollection;
import org.domeos.util.StringUtils;

/**
 * Created by KaiRen on 2016/9/23.
 */
public class DeployCollectionDraft {
    private String name;
    private int id;
    private String description;
    private int creatorId;

    public DeployCollectionDraft() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public int getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(int creatorId) {
        this.creatorId = creatorId;
    }


    public String checkLegality() {
        String error = null;
        if (StringUtils.isBlank(name)) {
            error = "deploy collection name is blank";
        }
        return error;
    }

    public DeployCollection toDeployCollection() {
        DeployCollection deployCollection = new DeployCollection();
        deployCollection.setCreatorId(creatorId);
        deployCollection.setName(name);
        deployCollection.setDescription(description);
        return deployCollection;
    }
}
