package org.domeos.framework.api.consolemodel.alarm;

import org.domeos.framework.api.model.alarm.UserGroupBasic;
import org.domeos.util.StringUtils;

/**
 * Created by KaiRen on 2016/9/27.
 */
public class UserGroupDraft {
    private int id;
    private String userGroupName;

    public UserGroupDraft() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUserGroupName() {
        return userGroupName;
    }

    public void setUserGroupName(String userGroupName) {
        this.userGroupName = userGroupName;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(userGroupName)) {
            return "user group name is blank";
        }
        return null;
    }

    public UserGroupBasic toUserGroupBasic() {
        UserGroupBasic userGroupBasic = new UserGroupBasic();
        userGroupBasic.setUserGroupName(userGroupName);
        userGroupBasic.setId(id);
        return userGroupBasic;
    }
}
