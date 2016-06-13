package org.domeos.framework.api.biz.auth;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.auth.Group;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.UserGroupMap;
import org.domeos.framework.api.model.resource.related.ResourceOwnerType;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
public interface AuthBiz extends BaseBiz {
    boolean isAdmin(int userId);

    int getUserId(String userName);

    User getUser(String userName);

    Group getGroupByName(String groupName);

    UserGroupMap getUserGroup(int userId, int owner_id);

    int masterCountInGroup(int groupId);

    String getUserNameById(int id);

    void createGroup(Group group);

    void addUserToGroup(UserGroupMap userGroup);

    Group getGroupById(int groupId);

    void deleteGroup(Group group);

    void modifyGroup(Group groupInDB);

    List<Group> listAllGroup();

    List<Group> listAllGroupByUserId(int userId);

    List<UserGroupMap> getAllUsersInGroup(int groupId);

    void deleteAllUserInGroup(int groupId);

    int userExistInGroup(UserGroupMap userGroup);

    void modifyUserGroup(UserGroupMap userGroup);

    void addUserGroup(UserGroupMap userGroup);

    void deleteUserGroup(UserGroupMap userGroup);

    User getUserById(int userId);

    List<Integer> getGroupIds(int id);

    User getUserByName(String username);

    void addUser(User user);

    void modifyUser(User existUser);

    void deleteUser(User user);

    void changePassword(User user);

    List<User> listAllUser();

    List<String> getRole(String username);

    String getNameByTypeAndId(ResourceOwnerType creatorType, int creatorId);

    List<Integer> getAllGroupIds();
}
