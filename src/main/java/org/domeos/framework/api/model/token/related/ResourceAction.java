package org.domeos.framework.api.model.token.related;

import java.util.List;

/**
 * Created by KaiRen on 16/8/2.
 */
public class ResourceAction {
    private String type;
    private String name;
    private List<String> actions;

    public ResourceAction() {
    }

    public ResourceAction(String type, String name, List<String> actions) {
        this.type = type;
        this.name = name;
        this.actions = actions;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getActions() {
        return actions;
    }

    public void setActions(List<String> actions) {
        this.actions = actions;
    }
}
