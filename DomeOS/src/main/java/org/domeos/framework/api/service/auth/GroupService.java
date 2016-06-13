package org.domeos.framework.api.service.auth;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.auth.GroupInfo;
import org.domeos.framework.api.model.auth.Group;

import java.util.List;

/**
 * Created by zhenfengchen on 15-11-19.
 */
public interface GroupService {
    // group info from groups
    HttpResponseTemp<?> createGroup(Group group);

    HttpResponseTemp<?> deleteGroup(int userId, int groupId);

    HttpResponseTemp<?> getGroup(int groupId);

    HttpResponseTemp<?> modifyGroup(Group group);

    // return entire group info such as users and projects belong to this
    HttpResponseTemp<List<GroupInfo>> listAllGroupInfo(int userId);

    Group getGroupByName(String groupName);
}
