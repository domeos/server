package org.domeos.framework.api.service.alarm.impl;

import org.domeos.util.StringUtils;
import org.domeos.framework.api.model.alarm.UserGroupBasic;
import org.domeos.framework.api.model.alarm.UserInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.domeos.framework.api.biz.alarm.AlarmBiz;
import org.domeos.framework.api.biz.alarm.PortalBiz;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.model.alarm.assist.ActionWrap;
import org.domeos.framework.api.model.alarm.assist.Link;
import org.domeos.framework.api.model.alarm.assist.User;
import org.domeos.framework.api.model.alarm.assist.UserWrap;
import org.domeos.framework.api.model.alarm.falcon.portal.Action;
import org.domeos.framework.api.service.alarm.AssistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by baokangwang on 2016/4/14.
 */
@Service
public class AssistServiceImpl implements AssistService {

    private static Logger logger = LoggerFactory.getLogger(AssistServiceImpl.class);

    @Autowired
    PortalBiz portalBiz;

    @Autowired
    AlarmBiz alarmBiz;

    @Autowired
    AuthBiz authBiz;

    @Override
    public ActionWrap getActionById(long actionId) {

        Action action = portalBiz.getActionById(actionId);
        if (action == null) {
            logger.info("error from alarm : no such action : " + actionId);
            return new ActionWrap("no such action", null);
        }

        return new ActionWrap("", action);
    }

    @Override
    public UserWrap getUsers(String group) {

        if (StringUtils.isBlank(group)) {
            return new UserWrap("team is blank", null);
        }


        UserGroupBasic selectedGroup = alarmBiz.getUserGroupInfoBasicByName(group);
        if (selectedGroup == null) {
            return new UserWrap("", new ArrayList<User>());
        }
        List<UserInfo> userInfoList = alarmBiz.getUserInfoByUserGroupId(selectedGroup.getId());
        if (userInfoList == null) {
            return new UserWrap("", new ArrayList<User>());
        }
        List<User> users = new ArrayList<>(userInfoList.size());
        for (UserInfo userInfo : userInfoList) {
            if (userInfo == null) {
                continue;
            }
            users.add(new User(userInfo.getUsername(), userInfo.getEmail(), userInfo.getPhone()));
        }
        return new UserWrap("", users);
    }

    @Override
    public String storeLink(String content) {

        Link link = new Link();
        link.setContent(content);
        alarmBiz.addLink(link);
        return String.valueOf(link.getId());
    }

    @Override
    public String retrieveLink(long linkId) {

        Link link = alarmBiz.getLinkById(linkId);
        if (link == null) {
            return null;
        }
        return link.getContent();
    }
}
