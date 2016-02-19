package org.domeos.api.model.console.group;

import org.domeos.api.model.group.Group;
import org.domeos.api.model.group.UserGroup;
import org.domeos.util.DateUtil;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by zhenfengchen on 15-11-20.
 * groupinfo
 */
public class GroupInfo {
    private Long id;  // group_id
    private String name;
    private String description;
    private String create_time;
//    private List<String> projects = null;  // project's owned by this group
//    private List<UserGroup> members = null;
//    private int memberCount;
//    private int projectCount;
//    private int deployCount;
//    private int clusterCount;

    private Map<String, Integer> countMap = new HashMap<>();

    public GroupInfo(Group group) {
        this.name = group.getName();
        this.description = group.getDescription();
        this.id = group.getId();
        this.create_time = group.getCreate_time();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public String getCreate_time() {
        return create_time;
    }
    public void setCreate_time(String create_time) {
        this.create_time = create_time;
    }

    public Map<String, Integer> getCountMap() {
        return countMap;
    }

    public <T> void addItemToCountMap(ResourceCountKey key, List<T> lists) {
        countMap.put(key.name(), lists == null ? 0 : lists.size());
    }

    //    public List<String> getProjects() {
//        return projects;
//    }
//
//    public void setProjects(List<String> projects) {
//        this.projects = projects;
//    }

//    public List<UserGroup> getMembers() {
//        return members;
//    }
//
//    public void setMembers(List<UserGroup> members) {
//        this.members = members;
//    }
//
//    public int getMembersCount() {
//        return members == null ? 0 : members.size();
//    }

}
