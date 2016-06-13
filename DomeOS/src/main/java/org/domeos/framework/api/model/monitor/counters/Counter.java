package org.domeos.framework.api.model.monitor.counters;

/**
 * Created by baokangwang on 2016/3/6.
 */
public class Counter {

    String name;
    String type;
    boolean tagged;

    public Counter() {
    }

    public Counter(String name, String type, boolean tagged) {
        this.name = name;
        this.type = type;
        this.tagged = tagged;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isTagged() {
        return tagged;
    }

    public void setTagged(boolean tagged) {
        this.tagged = tagged;
    }
}
