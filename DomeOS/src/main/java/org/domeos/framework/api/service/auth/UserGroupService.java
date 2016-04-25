package org.domeos.framework.api.service.auth;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.auth.GroupMembers;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.UserGroupMap;

/**
 * Created by zhenfengchen on 15-11-20.
 */
public interface UserGroupService {
    HttpResponseTemp<?> addUserToGroup(UserGroupMap userGroup);

    HttpResponseTemp<?> deleteAllUserInGroup(int groupId);

    HttpResponseTemp<?> addGroupMember(int userId, UserGroupMap userGroup);

    HttpResponseTemp<?> addGroupMembers(int userId, GroupMembers members);

    HttpResponseTemp<?> deleteGroupMember(int userId, UserGroupMap userGroup);

    HttpResponseTemp<?> listGroupMember(int userId, int groupId);

    HttpResponseTemp<?> getNamespace(User user);

    void addUserGroup(UserGroupMap userGroup);
}
