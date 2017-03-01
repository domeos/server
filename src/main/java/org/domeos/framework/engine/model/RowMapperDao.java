package org.domeos.framework.engine.model;

import org.domeos.framework.engine.exception.DaoConvertingException;

/**
 * Created by sparkchen on 16/4/5.
 */
public class RowMapperDao {

    private int id;
    private String name = "";
    private String description = "";
    private String state = "";
    private long createTime = 0;
    private long removeTime = 0;
    private boolean removed = false;
    private String data;

    public RowMapperDao() {
    }
    public RowMapperDao(RowModelBase item) {
        this.id = item.getId();
        this.name = item.getName();
        this.description = item.getDescription();
        this.state = item.getState();
        this.createTime = item.getCreateTime();
        this.removeTime = item.getRemoveTime();
        this.removed = item.isRemoved();
        this.data = item.toString();
    }
    public <T extends RowModelBase> T toModel(Class<T> clazz) throws DaoConvertingException{
        try {
            T result = clazz.newInstance();
            if (data != null && data.length() != 0) {
                result = result.fromString(data);
            }
            result.setId(id);
            result.setName(name);
            result.setCreateTime(createTime);
            result.setDescription(description);
            result.setState(state);
            result.setRemoved(removed);
            result.setRemoveTime(removeTime);
            return result;
        } catch (InstantiationException e) {
            throw new DaoConvertingException(e);
        } catch (IllegalAccessException e) {
            throw new DaoConvertingException(e);
        }
    }
    @Override
    public String toString() {
        return "RowMapperDao{" +
            "createTime=" + createTime +
            ", id=" + id +
            ", name='" + name + '\'' +
            ", description='" + description + '\'' +
            ", state='" + state + '\'' +
            ", removeTime=" + removeTime +
            ", removed=" + removed +
            ", data='" + data + '\'' +
            '}';
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
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

    public long getRemoveTime() {
        return removeTime;
    }

    public void setRemoveTime(long removeTime) {
        this.removeTime = removeTime;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }


}
