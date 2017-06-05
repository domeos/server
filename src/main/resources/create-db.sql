create database if not exists `domeos`;
create database if not exists `graph`;
create database if not exists `portal`;

use domeos;
CREATE TABLE IF NOT EXISTS `admin_roles` (
  `userId` INT(11) NOT NULL PRIMARY KEY,
  `role` VARCHAR(255) NOT NULL DEFAULT '0'
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `build_history` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1024) NULL DEFAULT NULL,
  `state` VARCHAR(128) NOT NULL,
  `createTime` BIGINT(20) NOT NULL DEFAULT '0',
  `removeTime` BIGINT(20) NULL DEFAULT NULL,
  `removed` TINYINT(4) NOT NULL DEFAULT '0',
  `data` MEDIUMTEXT NULL,
  `projectId` INT(11) NOT NULL,
  `secret` VARCHAR(255) NOT NULL,
  `log` LONGBLOB NULL,
  `taskName` VARCHAR(255) NULL DEFAULT NULL,
  `dockerfileContent` MEDIUMTEXT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `build_history_name` ON build_history(`name`);
CREATE INDEX `build_history_projectId` ON build_history(`projectId`);

CREATE TABLE IF NOT EXISTS `gitlab_user` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `userId` INT(11) NOT NULL DEFAULT '0',
  `name` VARCHAR(255) NOT NULL COMMENT 'username in gitlab',
  `token` VARCHAR(255) NOT NULL,
  `createTime` BIGINT(20) NOT NULL DEFAULT '0',
  `gitlabId` INT(11) NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `gitlab_user_userId` ON gitlab_user(`userId`);

CREATE TABLE IF NOT EXISTS `operation_history` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `resourceId` INT(11) NOT NULL,
  `resourceType` VARCHAR(255) NOT NULL,
  `operation` VARCHAR(255) NOT NULL,
  `userId` INT(11) NOT NULL,
  `userName` VARCHAR(255) NOT NULL,
  `status` VARCHAR(255) NOT NULL,
  `message` MEDIUMTEXT NOT NULL,
  `operateTime` BIGINT(20) NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `project` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1024) NULL DEFAULT NULL,
  `state` VARCHAR(128) NOT NULL,
  `createTime` BIGINT(20) NULL DEFAULT NULL,
  `removeTime` BIGINT(20) NULL DEFAULT NULL,
  `removed` TINYINT(4) NOT NULL DEFAULT '0',
  `data` MEDIUMTEXT NULL,
  `authority` TINYINT(4) NOT NULL DEFAULT '0'
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `project_name` ON project(`name`);
CREATE INDEX `project_authority` ON project(`authority`);

CREATE TABLE IF NOT EXISTS `project_rsakey_map` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT(11) NOT NULL,
  `rsaKeypairId` INT(11) NOT NULL,
  `keyId` INT(11) NOT NULL,
  `state` VARCHAR(128) NOT NULL,
  `createTime` BIGINT(20) NOT NULL DEFAULT '0'
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `project_rsakey_map_projectId` ON project_rsakey_map(`projectId`);
CREATE INDEX `project_rsakey_map_rsaKeypairId` ON project_rsakey_map(`rsaKeypairId`);

CREATE TABLE IF NOT EXISTS `rsa_keypair` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1024) NULL DEFAULT NULL,
  `state` VARCHAR(128) NOT NULL,
  `createTime` BIGINT(20) NOT NULL DEFAULT '0',
  `removeTime` BIGINT(20) NULL DEFAULT NULL,
  `removed` TINYINT(4) NOT NULL DEFAULT '0',
  `data` MEDIUMTEXT NULL,
  `authority` INT(11) NOT NULL DEFAULT '0'
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `rsa_keypair_name` ON rsa_keypair(`name`);

CREATE TABLE IF NOT EXISTS `subversion_user` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `userId` INT(11) NOT NULL DEFAULT '0',
  `name` VARCHAR(255) NOT NULL COMMENT 'username in subversion',
  `password` VARCHAR(255) NOT NULL,
  `svnPath` VARCHAR(255) NOT NULL,
  `createTime` BIGINT(20) NOT NULL DEFAULT '0'
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `subversion_user_userId` ON subversion_user(`userId`);

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `salt` VARCHAR(255) NULL DEFAULT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `phone` VARCHAR(255) NULL DEFAULT NULL,
  `loginType` VARCHAR(255) NOT NULL,
  `createTime` BIGINT(20) NOT NULL DEFAULT '0',
  `updateTime` BIGINT(20) NOT NULL DEFAULT '0',
  `state` VARCHAR(128) NULL DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `users_state` ON users(`state`);
CREATE INDEX `users_username` ON users(`username`);

CREATE TABLE IF NOT EXISTS `deployment` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1024) NULL DEFAULT NULL,
  `state` VARCHAR(128) NOT NULL,
  `createTime` BIGINT(20) NOT NULL DEFAULT '0',
  `removeTime` BIGINT(20) NULL DEFAULT NULL,
  `removed` TINYINT(4) NOT NULL DEFAULT '0',
  `data` MEDIUMTEXT NULL,
  `clusterId` INT(11) DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `version` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1024) DEFAULT NULL,
  `state` VARCHAR(128) NOT NULL,
  `createTime` BIGINT(20) DEFAULT NULL,
  `removeTime` BIGINT(20) DEFAULT NULL,
  `removed` TINYINT(4) NOT NULL DEFAULT '0',
  `data` MEDIUMTEXT NULL,
  `deployId` INT(11) DEFAULT NULL,
  `version` BIGINT(20) DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `cluster` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1024) DEFAULT NULL,
  `state` VARCHAR(128) NOT NULL,
  `createTime` BIGINT(20) DEFAULT NULL,
  `removeTime` BIGINT(20) DEFAULT NULL,
  `removed` TINYINT(4) NOT NULL DEFAULT '0',
  `data` MEDIUMTEXT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `loadbalancer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `state` varchar(128) NOT NULL,
  `createTime` bigint(20) DEFAULT NULL,
  `removeTime` bigint(20) DEFAULT NULL,
  `removed` tinyint(4) NOT NULL DEFAULT '0',
  `data` mediumtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `loadbalancer_collection` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `state` varchar(128) NOT NULL,
  `createTime` bigint(20) NOT NULL,
  `removeTime` bigint(20) DEFAULT NULL,
  `removed` tinyint(4) NOT NULL DEFAULT '0',
  `data` mediumtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `loadbalancer_deploy_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createTime` bigint(20) DEFAULT NULL,
  `removeTime` bigint(20) DEFAULT NULL,
  `removed` tinyint(4) NOT NULL DEFAULT '0',
  `deployId` int(11) DEFAULT NULL,
  `loadBalancerId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `uniq_port_index` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `loadBalancerId` int(11) NOT NULL,
  `port` int(11) NOT NULL,
  `clusterId` int(11) NOT NULL,
  `createTime` bigint(20) DEFAULT NULL,
  `removeTime` bigint(20) DEFAULT NULL,
  `removed` tinyint(4) DEFAULT '0',
  `ip` varchar(15) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `uniq_port_index_port_clusterId_index` (`port`,`clusterId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `base_images` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `imageName` VARCHAR(255) NOT NULL DEFAULT '0',
  `imageTag` VARCHAR(255) NULL DEFAULT '0',
  `registry` VARCHAR(255) NULL DEFAULT '0',
  `description` TEXT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `global` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `type` VARCHAR(255) NOT NULL,
  `value` VARCHAR(4096) NOT NULL,
  `createTime` BIGINT(20) NOT NULL DEFAULT '0',
  `lastUpdate` BIGINT(20) NOT NULL DEFAULT '0',
  `description` VARCHAR(1024) NULL DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `monitor_targets` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `target` VARCHAR(10240) NULL DEFAULT NULL,
  `create_time` DATETIME NULL DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

 CREATE TABLE IF NOT EXISTS `k8s_events` (
   `id` INT(20) NOT NULL AUTO_INCREMENT PRIMARY KEY,
   `version` VARCHAR(255) NOT NULL,
   `clusterId` INT(11) NOT NULL,
   `deployId` INT(11) NOT NULL DEFAULT -1,
   `namespace` VARCHAR(255) NOT NULL,
   `eventKind` VARCHAR(255) NOT NULL,
   `name` VARCHAR(255) NOT NULL,
   `host` VARCHAR(255),
   `content` TEXT
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `k8s_events_kind_index` ON k8s_events(`clusterId`, `namespace`, `eventKind`);
CREATE INDEX `k8s_events_name_index` ON k8s_events(`clusterId`, `namespace`, `name`);
CREATE INDEX `k8s_events_host_index` ON k8s_events(`host`);
CREATE INDEX `k8s_events_deploy_index` ON k8s_events(`clusterId`, `namespace`, `deployId`);

 CREATE TABLE IF NOT EXISTS `deploy_event` (
  `eid` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `deployId` INT(11) DEFAULT NULL,
  `operation` VARCHAR(255) DEFAULT NULL,
  `eventStatus` VARCHAR(255) DEFAULT NULL,
  `statusExpire` BIGINT(20) DEFAULT NULL,
  `content` MEDIUMTEXT NULL,
   `startTime` BIGINT(20) DEFAULT NULL
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `deploy_event_start_time_index` ON deploy_event(`startTime`);


CREATE TABLE IF NOT EXISTS `project_collection` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1024) NULL DEFAULT NULL,
  `state` VARCHAR(128) NOT NULL,
  `createTime` BIGINT(20) NOT NULL DEFAULT '0',
  `removeTime` BIGINT(20) NULL DEFAULT '0',
  `removed` TINYINT(4) NOT NULL DEFAULT '0',
  `data` MEDIUMTEXT NULL,
  `projectCollectionState` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `deploy_collection` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `state` varchar(128) NOT NULL,
  `createTime` bigint(20) DEFAULT NULL,
  `removeTime` bigint(20) DEFAULT NULL,
  `removed` tinyint(4) NOT NULL DEFAULT '0',
  `data` mediumtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- alarm related tables: 11 in total
-- 2016.04.14

-- alarm event info
CREATE TABLE IF NOT EXISTS `alarm_event_info_draft` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `endpoint` VARCHAR(128) NULL DEFAULT NULL,
  `metric` VARCHAR(128) NULL DEFAULT NULL,
  `counter` VARCHAR(128) NULL DEFAULT NULL,
  `func` VARCHAR(128) NULL DEFAULT NULL,
  `left_value` VARCHAR(128) NULL DEFAULT NULL,
  `operator` VARCHAR(128) NULL DEFAULT NULL,
  `right_value` VARCHAR(128) NULL DEFAULT NULL,
  `note` VARCHAR(4096) NULL DEFAULT NULL,
  `max_step` INT(20) NULL DEFAULT NULL,
  `current_step` INT(20) NULL DEFAULT NULL,
  `priority` INT(20) NULL DEFAULT NULL,
  `status` VARCHAR(128) NULL DEFAULT NULL,
  `timestamp` INT(20) NULL DEFAULT NULL,
  `expression_id` INT(20) NULL DEFAULT NULL,
  `strategy_id` INT(20) NULL DEFAULT NULL,
  `template_id` INT(20) NULL DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- alarm callback
CREATE TABLE IF NOT EXISTS `alarm_callback_info` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `url` VARCHAR(256) NULL DEFAULT NULL,
  `beforeCallbackSms` TINYINT(1) NULL DEFAULT NULL,
  `beforeCallbackMail` TINYINT(1) NULL DEFAULT NULL,
  `afterCallbackSms` TINYINT(1) NULL DEFAULT NULL,
  `afterCallbackMail` TINYINT(1) NULL DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- alarm host info
CREATE TABLE IF NOT EXISTS `alarm_host_info` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `hostname` VARCHAR(128) NULL DEFAULT NULL,
  `ip` VARCHAR(128) NULL DEFAULT NULL,
  `cluster` VARCHAR(128) NULL DEFAULT NULL,
  `createTime` BIGINT(20) NULL DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- alarm host group info
CREATE TABLE IF NOT EXISTS `alarm_host_group_info` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `hostGroupName` VARCHAR(128) NULL DEFAULT NULL,
  `creatorId` INT(11) NULL DEFAULT NULL,
  `creatorName` VARCHAR(128) NULL DEFAULT NULL,
  `createTime` BIGINT(20) NULL DEFAULT NULL,
  `updateTime` BIGINT(20) NULL DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- alarm strategy info
CREATE TABLE IF NOT EXISTS `alarm_strategy_info` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `metric` VARCHAR(64) NULL DEFAULT NULL,
  `tag` VARCHAR(128) NULL DEFAULT NULL,
  `pointNum` INT(11) NULL DEFAULT NULL,
  `aggregateType` VARCHAR(64) NULL DEFAULT NULL,
  `operator` VARCHAR(64) NULL DEFAULT NULL,
  `rightValue` DOUBLE NULL DEFAULT NULL,
  `note` VARCHAR(1024) NULL DEFAULT NULL,
  `maxStep` INT(11) NULL DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- alarm template info
CREATE TABLE IF NOT EXISTS `alarm_template_info` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `templateName` VARCHAR(64) NULL DEFAULT NULL,
  `templateType` VARCHAR(64) NULL DEFAULT NULL,
  `creatorId` INT(11) NULL DEFAULT NULL,
  `creatorName` VARCHAR(128) NULL DEFAULT NULL,
  `createTime` BIGINT(20) NULL DEFAULT NULL,
  `updateTime` BIGINT(20) NULL DEFAULT NULL,
  `callbackId` INT(11) NULL DEFAULT NULL,
  `deployId` INT(11) NULL DEFAULT NULL,
  `isRemoved` TINYINT(4) NOT NULL DEFAULT '0'
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- alarm host group & host bind
CREATE TABLE IF NOT EXISTS `alarm_host_group_host_bind` (
  `hostGroupId` INT(11) NOT NULL,
  `hostId` INT(11) NOT NULL,
  `bindTime` BIGINT(20) NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- alarm template & host group bind
CREATE TABLE IF NOT EXISTS `alarm_template_host_group_bind` (
  `templateId` INT(11) NOT NULL,
  `hostGroupId` INT(11) NOT NULL,
  `bindTime` BIGINT(20) NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- alarm template & user group bind
CREATE TABLE IF NOT EXISTS `alarm_template_user_group_bind` (
  `templateId` INT(11) NOT NULL,
  `userGroupId` INT(11) NOT NULL,
  `bindTime` BIGINT(20) NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- alarm template & strategy bind
CREATE TABLE IF NOT EXISTS `alarm_template_strategy_bind` (
  `templateId` INT(11) NOT NULL,
  `strategyId` INT(11) NOT NULL,
  `bindTime` BIGINT(20) NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- alarm link info
CREATE TABLE IF NOT EXISTS `alarm_link_info` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `content` MEDIUMTEXT NULL DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- alarm user group info & user group bind
CREATE TABLE IF NOT EXISTS `alarm_user_group_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `userGroupName` varchar(128) DEFAULT NULL,
  `creatorId` int(11) DEFAULT NULL,
  `creatorName` varchar(128) DEFAULT NULL,
  `createTime` bigint(20) DEFAULT NULL,
  `updateTime` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE UNIQUE INDEX `alarm_user_group_info_userGroupName_pk_index` ON alarm_user_group_info(`userGroupName`);

CREATE TABLE IF NOT EXISTS `alarm_user_group_user_bind` (
  `userGroupId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `bindTime` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- add collection map
CREATE TABLE IF NOT EXISTS `collection_authority_map` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `collectionId` INT(11) NOT NULL COMMENT 'projectCollectionId or deployCollectionId or clusterId',
  `resourceType` VARCHAR(255) NOT NULL COMMENT 'PROJECT or DEPLOY or CLUSTER',
  `userId` INT(11) NOT NULL COMMENT 'userId',
  `role` VARCHAR(255) NOT NULL COMMENT 'role name',
  `updateTime` BIGINT(20) NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `collection_authority_map_resourceType_index` ON collection_authority_map(`resourceType`);
CREATE INDEX `ollection_authority_map_collectionId_index` ON collection_authority_map(`collectionId`);
CREATE INDEX `collection_authority_map_userId_index` ON collection_authority_map(`userId`);
CREATE UNIQUE INDEX `collection_authority_map_uniq` ON collection_authority_map(`collectionId`, `resourceType`, `userId`);

CREATE TABLE IF NOT EXISTS `collection_resource_map` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `resourceId` INT(11) NOT NULL COMMENT 'projectId or deployId',
  `creatorId` INT(11) NOT NULL COMMENT 'userId',
  `resourceType` VARCHAR(255) NOT NULL COMMENT 'PROJECT or DEPLOY or CLUSTER',
  `collectionId` INT(11) NOT NULL COMMENT 'projectCollectionId or deployCollectionId',
  `updateTime` BIGINT(20) NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `collection_resource_map_resourceType_resourceId_index` ON collection_resource_map(`resourceType`, `resourceId`);
CREATE INDEX `collection_resource_map_collection_index` ON collection_resource_map(`collectionId`, `resourceType`, `resourceId`);

CREATE TABLE IF NOT EXISTS `clusterwatcher_deploy_map` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `clusterId` INT(11) NOT NULL,
  `deployId` INT(11) NOT NULL,
  `updateTime` BIGINT(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE UNIQUE INDEX `clusterwatcher_deploy_map_uniq_index` ON clusterwatcher_deploy_map(`clusterId`);

CREATE TABLE IF NOT EXISTS `configuration_collection` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1024) NULL DEFAULT NULL,
  `state` VARCHAR(128) NULL DEFAULT NULL,
  `createTime` BIGINT(20) NULL DEFAULT NULL,
  `removeTime` BIGINT(20) NULL DEFAULT NULL,
  `data` MEDIUMTEXT NULL,
  `removed` TINYINT(4) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `configuration` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1024) NULL DEFAULT NULL,
  `state` VARCHAR(128) NULL DEFAULT NULL,
  `createTime` BIGINT(20) NULL DEFAULT NULL,
  `removeTime` BIGINT(20) NULL DEFAULT NULL,
  `data` MEDIUMTEXT NULL,
  `removed` TINYINT(4) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `configuration_deploy_map` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `configurationId` INT(11) NOT NULL,
  `deployId` INT(11) NOT NULL,
  `versionId` INT(11) NOT NULL,
  `createTime` BIGINT(20) NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE UNIQUE INDEX `configuration_deploy_map_uniq_index` ON configuration_deploy_map(`configurationId`, `deployId`, `versionId`);

CREATE TABLE IF NOT EXISTS `git_config` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `type` VARCHAR(255) NOT NULL,
  `url` VARCHAR(4096) NOT NULL,
  `description` VARCHAR(1024) NOT NULL,
  `createTime` BIGINT(20) NOT NULL DEFAULT '0',
  `lastUpdate` BIGINT(20) NOT NULL DEFAULT '0',
  `removeTime` BIGINT(20) DEFAULT NULL,
  `removed` TINYINT(4) NOT NULL DEFAULT '0'
) ENGINE=INNODB DEFAULT CHARSET=utf8;