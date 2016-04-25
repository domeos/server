package org.domeos.framework.api.consolemodel.auth;

import org.domeos.framework.api.model.auth.Group;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by zhenfengchen on 15-11-20.
 * groupinfo
 */
public class GroupInfo {
    private int id;  // group_id
    private String name;
    private String description;
    private long createTime;

    private Map<String, Integer> countMap = new HashMap<>();

    public GroupInfo(Group group) {
        this.name = group.getName();
        this.description = group.getDescription();
        this.id = group.getId();
        this.createTime = group.getCreateTime();
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public void setCountMap(Map<String, Integer> countMap) {
        this.countMap = countMap;
    }

    public Map<String, Integer> getCountMap() {
        return countMap;
    }

    public <T> void addItemToCountMap(ResourceCountKey key, List<T> lists) {
        countMap.put(key.name(), lists == null ? 0 : lists.size());
    }
}
