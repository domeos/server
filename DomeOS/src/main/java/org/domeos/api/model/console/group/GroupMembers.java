package org.domeos.api.model.console.group;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.group.UserGroup;

import java.util.List;

/**
 * Created by zhenfengchen on 15-12-22.
 */
public class GroupMembers {
    private List<UserGroup> members = null;
    private long groupId;

    public GroupMembers() {

    }

    public String checkLegality() {
        if (members == null) {
            return "members info must be set";
        }
        for (UserGroup userGroup : members) {
            String tmp = userGroup.checkLegality();
            if (!StringUtils.isBlank(tmp)) {
                return tmp;
            }
        }
        return null;
    }

    public List<UserGroup> getMembers() {
        return members;
    }

    public void setMembers(List<UserGroup> members) {
        this.members = members;
    }

    public long getGroupId() {
        return groupId;
    }

    public void setGroupId(long groupId) {
        this.groupId = groupId;
    }
}
