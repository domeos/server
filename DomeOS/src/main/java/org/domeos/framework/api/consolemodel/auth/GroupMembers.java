package org.domeos.framework.api.consolemodel.auth;

import org.apache.commons.lang3.StringUtils;
import org.domeos.framework.api.model.auth.UserGroupMap;

import java.util.List;

/**
 * Created by zhenfengchen on 15-12-22.
 */
public class GroupMembers {
    private List<UserGroupMap> members = null;
    private int groupId;

    public GroupMembers() {

    }

    public String checkLegality() {
        if (members == null) {
            return "members info must be set";
        }
        for (UserGroupMap userGroup : members) {
            String tmp = userGroup.checkLegality();
            if (!StringUtils.isBlank(tmp)) {
                return tmp;
            }
        }
        return null;
    }

    public List<UserGroupMap> getMembers() {
        return members;
    }

    public void setMembers(List<UserGroupMap> members) {
        this.members = members;
    }

    public int getGroupId() {
        return groupId;
    }

    public void setGroupId(int groupId) {
        this.groupId = groupId;
    }
}
