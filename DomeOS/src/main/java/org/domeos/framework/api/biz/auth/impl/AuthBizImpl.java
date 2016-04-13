package org.domeos.framework.api.biz.auth.impl;

import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.mapper.auth.AdminRolesMapper;
import org.domeos.framework.api.mapper.auth.GroupMapper;
import org.domeos.framework.api.mapper.auth.UserGroupMapMapper;
import org.domeos.framework.api.mapper.auth.UserMapper;
import org.domeos.framework.api.model.auth.AdminRole;
import org.domeos.framework.api.model.auth.Group;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.UserGroupMap;
import org.domeos.framework.api.model.resource.related.ResourceOwnerType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
@Service("authBiz")
public class AuthBizImpl extends BaseBizImpl implements AuthBiz {
    @Autowired
    AdminRolesMapper adminRolesMapper;
    @Autowired
    UserMapper userMapper;
    @Autowired
    GroupMapper groupMapper;
    @Autowired
    UserGroupMapMapper userGroupMapMapper;

    @Override
    public boolean isAdmin(int userId) {
        AdminRole adminRole = adminRolesMapper.getAdminById(userId);
        if (adminRole != null) {
            return true;
        }
        return false;
    }

    @Override
    public int getUserId(String userName) {
        User user = userMapper.getUserByName(userName);
        if (user == null) {
            return -1;
        }
        return user.getId();
    }


    @Override
    public User getUser(String userName) {
        return userMapper.getUserByName(userName);
    }

    @Override
    public User getUserById(int userId) {
        return userMapper.getUserById(userId);
    }

    @Override
    public Group getGroupByName(String groupName) {
        return groupMapper.getGroupByName(groupName);
    }

    @Override
    public Group getGroupById(int groupId) {
        return groupMapper.getGroupById(groupId);
    }

    @Override
    public UserGroupMap getUserGroup(int userId, int owner_id) {
        return userGroupMapMapper.getUserGroup(userId, owner_id);
    }

    @Override
    public int masterCountInGroup(int groupId) {
        return userGroupMapMapper.masterCountInGroup(groupId);
    }

    @Override
    public String getUserNameById(int id) {
        return userMapper.getUserNameById(id);
    }

    @Override
    public void createGroup(Group group) {
        groupMapper.addGroup(group);
    }

    @Override
    public void addUserToGroup(UserGroupMap userGroup) {
        userGroupMapMapper.addUserGroup(userGroup);
    }

    @Override
    public void deleteGroup(Group group) {
        groupMapper.deleteGroup(group);
    }

    @Override
    public void modifyGroup(Group groupInDB) {
        groupMapper.modifyGroup(groupInDB);
    }

    @Override
    public List<Group> listAllGroup() {
        return groupMapper.listAllGroup();
    }

    @Override
    public List<Group> listAllGroupByUserId(int userId) {
        return groupMapper.listAllGroupByUserId(userId);
    }

    @Override
    public List<UserGroupMap> getAllUsersInGroup(int groupId) {
        return userGroupMapMapper.getAllUsersInGroup(groupId);
    }

    @Override
    public void deleteAllUserInGroup(int groupId) {
        userGroupMapMapper.deleteAllUserInGroup(groupId);
    }

    @Override
    public int userExistInGroup(UserGroupMap userGroup) {
        return userGroupMapMapper.userExistInGroup(userGroup);
    }

    @Override
    public void modifyUserGroup(UserGroupMap userGroup) {
        userGroupMapMapper.modifyUserGroup(userGroup);
    }

    @Override
    public void addUserGroup(UserGroupMap userGroup) {
        userGroupMapMapper.addUserGroup(userGroup);
    }

    @Override
    public void deleteUserGroup(UserGroupMap userGroup) {
        userGroupMapMapper.deleteUserGroup(userGroup);
    }

    @Override
    public List<Integer> getGroupIds(int id) {
        return userGroupMapMapper.getGroupIds(id);
    }

    @Override
    public User getUserByName(String username) {
        return userMapper.getUserByName(username);
    }

    @Override
    public void addUser(User user) {
        userMapper.addUser(user);
    }

    @Override
    public void modifyUser(User existUser) {
        userMapper.modifyUser(existUser);
    }

    @Override
    public void deleteUser(User user) {
        userMapper.deleteUser(user);
    }

    @Override
    public void changePassword(User user) {
        userMapper.changePassword(user);
    }

    @Override
    public List<User> listAllUser() {
        return userMapper.listAllUserInfo();
    }

    @Override
    public List<String> getRole(String username) {
        return userMapper.getRole(username);
    }

    @Override
    public String getNameByTypeAndId(ResourceOwnerType creatorType, int creatorId) {
        switch (creatorType) {
            case GROUP:
                Group group = groupMapper.getGroupById(creatorId);
                if (group != null) {
                    return group.getName();
                }
            case USER:
                return userMapper.getUserNameById(creatorId);
            default:
                return null;
        }
    }

    @Override
    public List<Integer> getAllGroupIds() {
        return groupMapper.getAllGroupIds();
    }
}
