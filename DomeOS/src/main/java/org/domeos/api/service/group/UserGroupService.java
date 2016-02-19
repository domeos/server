package org.domeos.api.service.group;

import org.domeos.api.model.console.group.GroupMembers;
import org.domeos.api.model.group.UserGroup;
import org.domeos.api.model.user.User;
import org.domeos.basemodel.HttpResponseTemp;

/**
 * Created by zhenfengchen on 15-11-20.
 */
public interface UserGroupService {
    HttpResponseTemp<?> addUserToGroup(UserGroup userGroup);
    HttpResponseTemp<?> deleteAllUserInGroup(long groupId);

    HttpResponseTemp<?> addGroupMember(long userId, UserGroup userGroup);
    HttpResponseTemp<?> addGroupMembers(long userId, GroupMembers members);
    HttpResponseTemp<?> deleteGroupMember(long userId, UserGroup userGroup);
    HttpResponseTemp<?> listGroupMember(long userId, long groupId);
    HttpResponseTemp<?> getNamespace(User user);
    UserGroup getUserGroup(long user_id, long group_id);
    void addUserGroup(UserGroup userGroup);
    int masterCountInGroup(long group_id);
}
