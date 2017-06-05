package org.domeos.framework.api.service.auth.impl;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.consolemodel.auth.CollectionMember;
import org.domeos.framework.api.consolemodel.auth.CollectionMembers;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.related.CollectionInfo;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.global.Server;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.service.alarm.impl.MailService;
import org.domeos.framework.api.service.auth.UserCollectionService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.groovy.GroovyLoadAndInvoke;
import org.domeos.global.ClientConfigure;
import org.domeos.global.GlobalConstant;
import org.domeos.util.EncodingTool;
import org.domeos.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Created by KaiRen on 2016/9/22.
 */
@Service
public class UserCollectionServiceImpl implements UserCollectionService {
    protected static Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    AuthBiz authBiz;
    @Autowired
    CollectionBiz collectionBiz;
    @Autowired
    GlobalBiz globalBiz;


    @Override
    public HttpResponseTemp<?> addUserToCollection(CollectionAuthorityMap authorityMap) {
        addUserCollection(authorityMap);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> deleteAllUserInCollection(int collectionId, ResourceType resourceType) {
        collectionBiz.deleteAuthoritiesByCollectionIdAndResourceType(collectionId, resourceType);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> addCollectionMember(int userId, CollectionMember member) {
        if (member.getResourceType() == ResourceType.ALARM) {
            member.setCollectionId(GlobalConstant.alarmGroupId);
        }
        AuthUtil.collectionVerify(userId, member.getCollectionId(),
                member.getResourceType(), OperationType.ADDGROUPMEMBER, member.getUserId());
        CollectionAuthorityMap authorityMap = new CollectionAuthorityMap(member.getCollectionId(),
                member.getResourceType(),
                member.getUserId(),
                member.getRole(),
                System.currentTimeMillis());
        collectionBiz.addAuthority(authorityMap);
        ClientConfigure.executorService.submit(new EmailNotifyTask(authorityMap));
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> modifyCollectionMember(int userId, CollectionMember member) {
        if (member.getResourceType() == ResourceType.ALARM) {
            member.setCollectionId(GlobalConstant.alarmGroupId);
        }
        AuthUtil.collectionVerify(userId, member.getCollectionId(),
                member.getResourceType(), OperationType.MODIFYGROUPMEMBER, member.getUserId());
        CollectionAuthorityMap authorityMap = new CollectionAuthorityMap(member.getCollectionId(),
                member.getResourceType(),
                member.getUserId(),
                member.getRole(),
                System.currentTimeMillis());
        CollectionAuthorityMap exist = collectionBiz.getAuthorityByUserIdAndResourceTypeAndCollectionId(authorityMap.getUserId(),
                authorityMap.getResourceType(), authorityMap.getCollectionId());
        if (exist != null) {
            if (exist.getRole() == Role.MASTER && authorityMap.getRole() != Role.MASTER &&
                    collectionBiz.masterCountInColleciton(authorityMap.getCollectionId(), authorityMap.getResourceType()) <= 1) {
                throw new PermitException(authorityMap.getUserId(), authorityMap.getCollectionId(),
                        authorityMap.getResourceType(), OperationType.MODIFYGROUPMEMBER, authorityMap.getUserId());
            }
            collectionBiz.modifyCollectionAuthorityMap(authorityMap);
        }
        ClientConfigure.executorService.submit(new EmailNotifyTask(authorityMap));
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> addCollectionMembers(int userId, CollectionMembers members) {
        if (members == null) {
            throw new PermitException("group is null");
        }
        if (members.getResourceType() == ResourceType.ALARM) {
            members.setCollectionId(GlobalConstant.alarmGroupId);
        }
        AuthUtil.collectionVerify(userId, members.getCollectionId(), members.getResourceType(), OperationType.ADDGROUPMEMBER, -1);
        String membersLegalityInfo = members.checkLegality();
        if (!StringUtils.isBlank(membersLegalityInfo)) {
            throw ApiException.wrapMessage(ResultStat.GROUP_MEMBER_FAILED, membersLegalityInfo);
        }
        for (CollectionAuthorityMap authorityMap : members.getMembers()) {
            authorityMap.setCollectionId(members.getCollectionId());
            authorityMap.setUpdateTime(System.currentTimeMillis());
            authorityMap.setResourceType(members.getResourceType());
            addUserCollection(authorityMap);
        }

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> deleteCollectionMember(int userId, CollectionAuthorityMap authorityMap) {
        if (authorityMap == null) {
            throw new PermitException("authority map is null");
        }
        if (authorityMap.getResourceType() == ResourceType.ALARM) {
            authorityMap.setCollectionId(GlobalConstant.alarmGroupId);
        }
        CollectionAuthorityMap mapInfo = collectionBiz.getAuthorityByUserIdAndResourceTypeAndCollectionId(
                authorityMap.getUserId(),
                authorityMap.getResourceType(),
                authorityMap.getCollectionId()
        );
        if (mapInfo == null) {
            return ResultStat.GROUP_MEMBER_FAILED.wrap("no such collection authority map");
        }
        AuthUtil.collectionVerify(userId, authorityMap.getCollectionId(),
                authorityMap.getResourceType(), OperationType.DELETEGROUPMEMBER, authorityMap.getUserId());
        if (mapInfo.getRole() == Role.MASTER &&
                collectionBiz.masterCountInColleciton(authorityMap.getCollectionId(), authorityMap.getResourceType()) <= 1) {
            throw ApiException.wrapMessage(ResultStat.GROUP_MEMBER_DELETE_ERROR, "You cannot delete the last master in the group.");
        }
        collectionBiz.deleteAuthorityMap(authorityMap);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> listCollectionMember(int userId, int collectionId, ResourceType resourceType) {
        if (resourceType == ResourceType.ALARM) {
            collectionId = GlobalConstant.alarmGroupId;
        }
        AuthUtil.collectionVerify(userId, collectionId, resourceType, OperationType.LISTGROUPMEMBER, -1);
        List<CollectionAuthorityMap> authorityMaps = collectionBiz.getAllUsersInCollection(collectionId, resourceType);
        List<CollectionMember> res = null;
        if (authorityMaps != null && !authorityMaps.isEmpty()) {
            res = new ArrayList<>(authorityMaps.size());
            for (CollectionAuthorityMap authorityMap : authorityMaps) {
                CollectionMember collectionMember = new CollectionMember(authorityMap);
                User user = authBiz.getUserById(collectionMember.getUserId());
                collectionMember.setUsername(user.getUsername());
                res.add(collectionMember);
            }
        }
        return ResultStat.OK.wrap(res);
    }

    public HttpResponseTemp<List<CollectionInfo>> listAllCollectionInfo(int userId, ResourceType collectionType) {
        List<CollectionInfo> collectionInfos;
        if (AuthUtil.isAdmin(userId)) {
            collectionInfos = collectionBiz.getAllCollectionInfo(collectionType.getTableName());
        } else {
            collectionInfos = collectionBiz.getCollectionInfoByUserId(collectionType.getTableName(), userId, collectionType);
        }
        return ResultStat.OK.wrap(collectionInfos);
    }

    private void addUserCollection(CollectionAuthorityMap authorityMap) {
        CollectionAuthorityMap exist = collectionBiz.getAuthorityByUserIdAndResourceTypeAndCollectionId(authorityMap.getUserId(),
                authorityMap.getResourceType(), authorityMap.getCollectionId());
        if (exist != null) {
            if (exist.getRole() == Role.MASTER && authorityMap.getRole() != Role.MASTER &&
                    collectionBiz.masterCountInColleciton(authorityMap.getCollectionId(), authorityMap.getResourceType()) <= 1) {
                throw ApiException.wrapMessage(ResultStat.GROUP_MEMBER_EDIT_ERROR, "You cannot edit the last master in the group.");
            }
            if (authorityMap.getRole().getAccessLevel() > exist.getRole().getAccessLevel()) {
                authorityMap.setRole(exist.getRole());
            }
            collectionBiz.modifyCollectionAuthorityMap(authorityMap);
        } else {
            collectionBiz.addAuthority(authorityMap);
        }
        ClientConfigure.executorService.submit(new EmailNotifyTask(authorityMap));
    }

    private class EmailNotifyTask implements Runnable {
        private CollectionAuthorityMap authorityMap;
        private String type;
        private String name;
        private String roleName;
        private String server;

        EmailNotifyTask(CollectionAuthorityMap authorityMap) {
            this.authorityMap = authorityMap;
        }

        @Override
        public void run() {
            if (authorityMap == null || !init()) {
                return;
            }
            String content = generateContent();
            String subject = generateSubject();
            User user = authBiz.getUserById(authorityMap.getUserId());
            if (user == null || StringUtils.isBlank(user.getEmail())) {
                return;
            }
            try {
                HashMap<String, String> mailParam = (HashMap<String, String>) GroovyLoadAndInvoke
                        .loadAndInvokeGroovy(EncodingTool.getMailSender(null), "send", null);
                if (mailParam != null && mailParam.containsKey("host") && mailParam.containsKey("fromAddr")) {
                    MailService.send(mailParam.get("host"), mailParam.get("fromAddr"), user.getEmail(), subject, content);
                }
            } catch (IOException | IllegalAccessException | InstantiationException | MessagingException e) {
                logger.warn("send alarm message error, mail: " + user.getEmail() + ", error: " + e.getMessage());
            }
        }

        private String generateContent() {
            return String.format("You have been granted %s access to %s %s. \nPlease login %s.", this.roleName, this.type, this.name, this.server);
        }

        private String generateSubject() {
            return String.format("[DomeOS] %s | Access to %s was granted", this.name, this.type);
        }

        private boolean init() {
            if (authorityMap == null || authorityMap.getResourceType() == null || authorityMap.getRole() == null) {
                return false;
            }
            String table = authorityMap.getResourceType().getTableName();
            if (!StringUtils.isBlank(table)) {
                this.name = authBiz.getNameById(table, this.authorityMap.getCollectionId());
            } else if (this.authorityMap.getResourceType() == ResourceType.ALARM) {
                this.name = "";
            } else {
                return false;
            }
            Server server = globalBiz.getServer();
            if (server == null) {
                return false;
            }

            this.server = server.getUrl();
            this.type = this.authorityMap.getResourceType().name();
            this.roleName = this.authorityMap.getRole().name();

            return true;
        }
    }
}
