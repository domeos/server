package org.domeos.api.service.group;

import org.domeos.api.model.console.group.GroupInfo;
import org.domeos.api.model.group.Group;
import org.domeos.basemodel.HttpResponseTemp;

import java.util.List;

/**
 * Created by zhenfengchen on 15-11-19.
 */
public interface GroupService {
    // group info from sys_groups
    HttpResponseTemp<?> createGroup(Group group);
    HttpResponseTemp<?> deleteGroup(long userId, long groupId);
    HttpResponseTemp<?> getGroup(long groupId);
    HttpResponseTemp<?> modifyGroup(Group group);

    // return entire group info such as users and projects belong to this
    HttpResponseTemp<List<GroupInfo>> listAllGroupInfo(long userId);

    Group getGroupByName(String groupName);
}
