package org.domeos.framework.engine.model;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by sparkchen on 16/4/4.
 */
public class RowModelBase extends DataModelBase {

    @Override
    public Set<String> excludeForJSON() {
        return toExclude;
    }

    public static Set<String> toExclude = new HashSet<String>() {{
        add("id");
        add("name");
        add("description");
        add("state");
        add("createTime");
        add("removeTime");
        add("removed");
    }};

    private int id;
    private String name = "";
    private String description = "";
    private String state = "";
    private long createTime = 0;
    private long removeTime = 0;
    private boolean removed = false;

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public long getRemoveTime() {
        return removeTime;
    }

    public void setRemoveTime(long removeTime) {
        this.removeTime = removeTime;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isRemoved() {
        return removed;
    }

    public void setRemoved(boolean removed) {
        this.removed = removed;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
}

