package org.domeos.framework.api.consolemodel.alarm;

import org.domeos.framework.api.model.alarm.HostGroupInfoBasic;
import org.domeos.framework.api.model.alarm.HostInfo;
import org.domeos.framework.api.model.alarm.TemplateInfoBasic;

import java.util.Comparator;
import java.util.List;

/**
 * Created by baokangwang on 2016/3/31.
 */
public class HostGroupInfo {

    private long id;
    private String hostGroupName;
    private long creatorId;
    private String creatorName;
    private long createTime;
    private long updateTime;
    private List<HostInfo> hostList;
    private List<TemplateInfoBasic> templateList;

    public HostGroupInfo() {
    }

    public HostGroupInfo(long id, String hostGroupName, long creatorId, String creatorName, long createTime,
                         long updateTime, List<HostInfo> hostList, List<TemplateInfoBasic> templateList) {
        this.id = id;
        this.hostGroupName = hostGroupName;
        this.creatorId = creatorId;
        this.creatorName = creatorName;
        this.createTime = createTime;
        this.updateTime = updateTime;
        this.hostList = hostList;
        this.templateList = templateList;
    }

    public HostGroupInfo(HostGroupInfoBasic hostGroupInfoBasic) {
        this.id = hostGroupInfoBasic.getId();
        this.hostGroupName = hostGroupInfoBasic.getHostGroupName();
        this.creatorId = hostGroupInfoBasic.getCreatorId();
        this.creatorName = hostGroupInfoBasic.getCreatorName();
        this.createTime = hostGroupInfoBasic.getCreateTime();
        this.updateTime = hostGroupInfoBasic.getUpdateTime();
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getHostGroupName() {
        return hostGroupName;
    }

    public void setHostGroupName(String hostGroupName) {
        this.hostGroupName = hostGroupName;
    }

    public long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(long creatorId) {
        this.creatorId = creatorId;
    }

    public String getCreatorName() {
        return creatorName;
    }

    public void setCreatorName(String creatorName) {
        this.creatorName = creatorName;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public long getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(long updateTime) {
        this.updateTime = updateTime;
    }

    public List<HostInfo> getHostList() {
        return hostList;
    }

    public void setHostList(List<HostInfo> hostList) {
        this.hostList = hostList;
    }

    public List<TemplateInfoBasic> getTemplateList() {
        return templateList;
    }

    public void setTemplateList(List<TemplateInfoBasic> templateList) {
        this.templateList = templateList;
    }

    public static class HostGroupInfoComparator implements Comparator<HostGroupInfo> {
        @Override
        public int compare(HostGroupInfo t1, HostGroupInfo t2) {
            if (t2.getCreateTime() - t1.getCreateTime() > 0) {
                return 1;
            } else if (t2.getCreateTime() - t1.getCreateTime() < 0) {
                return -1;
            } else {
                return 0;
            }
        }
    }
}
