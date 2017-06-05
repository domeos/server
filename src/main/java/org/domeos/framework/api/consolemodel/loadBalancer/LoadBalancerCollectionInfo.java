/**
 * 
 */
package org.domeos.framework.api.consolemodel.loadBalancer;

import java.util.Comparator;

import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.loadBalancer.LoadBalancerCollection;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerCollectionType;

/**
 * Created by jackfan on 17/2/27.
 */
public class LoadBalancerCollectionInfo {
    private int id;
    private String name;
    private String description;
    private LoadBalancerCollectionType lbcType;
    private int creatorId;
    private String creatorName;
    private long createTime;
    private int memberCount;
    private int loadBalancerCount;
    private Role role;
    
    public LoadBalancerCollectionInfo() {
    }
    
    public LoadBalancerCollectionInfo(LoadBalancerCollection lbc) {
        this.id = lbc.getId();
        this.name = lbc.getName();
        this.description = lbc.getDescription();
        this.creatorId = lbc.getCreatorId();
        this.createTime = lbc.getCreateTime();
        this.lbcType = lbc.getType();
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

    public LoadBalancerCollectionType getLbcType() {
        return lbcType;
    }

    public void setLbcType(LoadBalancerCollectionType lbcType) {
        this.lbcType = lbcType;
    }

    public int getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(int creatorId) {
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

    public int getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(int memberCount) {
        this.memberCount = memberCount;
    }

    public int getLoadBalancerCount() {
        return loadBalancerCount;
    }
 
    public void setLoadBalancerCount(int loadBalancerCount) {
        this.loadBalancerCount = loadBalancerCount;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
    
    public static class LoadBalancerCollectionComparator implements Comparator<LoadBalancerCollectionInfo> {
        @Override
        public int compare(LoadBalancerCollectionInfo o1, LoadBalancerCollectionInfo o2) {
            if (o2.getCreateTime() - o1.getCreateTime() > 0) {
                return 1;
            } else if (o2.getCreateTime() - o1.getCreateTime() < 0) {
                return -1;
            } else {
                return 0;
            }
        }
    }
}
