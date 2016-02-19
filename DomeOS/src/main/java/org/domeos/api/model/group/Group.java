package org.domeos.api.model.group;

import org.apache.commons.lang3.StringUtils;
import org.domeos.util.DateUtil;

import java.util.Date;

/**
 * Created by zhenfengchen on 15-11-19.
 */
public class Group {
    private Long id;
    private String name;
    private String description;
    private Date create_time;
    private Date update_time = new Date();
    private int status;  // 1 means normal, 0 means deleted

    public Group() {
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Group group = (Group) o;
        if (id != null ? !id.equals(group.id) : group.id != null)
            return false;
        return true;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "Group{" +
            "id=" + id +
            ", name='" + name + '\'' +
            ", description='" + description + '\'' +
            '}';
    }

    public String checkLegality() {
        String error = null;
        if (StringUtils.isBlank(name)) {
            error = "groupname is blank";
        }
        return error;
    }

    public String getCreate_time() {
        return DateUtil.getDatetime(create_time);
    }

    public void setCreate_time(Date create_time) {
        this.create_time = create_time;
    }

    public String getUpdate_time() {
        return DateUtil.getDatetime(update_time);
    }

    public void setUpdate_time(Date update_time) {
        this.update_time = update_time;
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

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }
}
