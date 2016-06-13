-- CREATE DATABASE IF NOT EXISTSS `domeos`;
-- grant all privileges on domeos.* to 'domeos'@'%' with grant option;

-- use domeos;
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
  `createTime` BIGINT(20) NOT NULL DEFAULT '0'
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `gitlab_user_userId` ON gitlab_user(`userId`);

CREATE TABLE IF NOT EXISTS `groups` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT 'group name',
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `createTime` BIGINT(20) NULL DEFAULT NULL,
  `updateTime` BIGINT(20) NULL DEFAULT NULL,
  `state` INT(11) NULL DEFAULT '1'
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `groups_name` ON groups(`name`);

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

CREATE TABLE IF NOT EXISTS `resources` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `resourceId` INT(11) NOT NULL COMMENT 'projectId or deployId',
  `resourceType` VARCHAR(255) NOT NULL COMMENT 'PROJECT or DEPLOY or CLUSTER',
  `ownerId` INT(11) NOT NULL COMMENT 'userId or groupId',
  `ownerType` VARCHAR(255) NOT NULL COMMENT 'USER or GROUP',
  `role` VARCHAR(255) NOT NULL COMMENT 'role name',
  `updateTime` BIGINT(20) NULL DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `resources_resourceType` ON resources(`resourceType`);
CREATE INDEX `resources_resourceId` ON resources(`resourceId`);
CREATE INDEX `resources_ownerId` ON resources(`ownerId`);
CREATE INDEX `resources_ownerType` ON resources(`ownerType`);

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

CREATE TABLE IF NOT EXISTS `user_group_map` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `groupId` INT(11) NOT NULL,
  `userId` INT(11) NOT NULL,
  `role` VARCHAR(255) NOT NULL COMMENT 'role name',
  `updateTime` BIGINT(20) NULL DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `user_group_map_userId` ON user_group_map(`userId`);
CREATE INDEX `user_group_map_groupId` ON user_group_map(`groupId`);

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

CREATE TABLE IF NOT EXISTS `load_balancer` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1024) DEFAULT NULL,
  `state` VARCHAR(128) NOT NULL,
  `createTime` BIGINT(20) DEFAULT NULL,
  `removeTime` BIGINT(20) DEFAULT NULL,
  `removed` TINYINT(4) NOT NULL DEFAULT '0',
  `data` MEDIUMTEXT
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `load_balancer_deploy_map` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1024) DEFAULT NULL,
  `state` VARCHAR(128) NOT NULL,
  `createTime` BIGINT(20) DEFAULT NULL,
  `removeTime` BIGINT(20) DEFAULT NULL,
  `removed` TINYINT(4) NOT NULL DEFAULT '0',
  `data` MEDIUMTEXT,
  `deployId` INT(11) DEFAULT NULL,
  `loadBalancerId` INT(11) DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `file_content` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1024) NULL DEFAULT NULL,
  `state` VARCHAR(128) NOT NULL,
  `createTime` BIGINT(20) NOT NULL DEFAULT '0',
  `removeTime` BIGINT(20) NULL DEFAULT NULL,
  `removed` TINYINT(4) NOT NULL DEFAULT '0',
  `data` MEDIUMTEXT NULL,
  `md5` VARCHAR(255) NOT NULL DEFAULT '0',
  `content` LONGBLOB NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `file_content_name` ON file_content(`name`);
CREATE INDEX `file_content_md5` ON file_content(`md5`);

CREATE TABLE IF NOT EXISTS `base_image_custom` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1024) NULL DEFAULT NULL,
  `state` VARCHAR(128) NOT NULL,
  `createTime` BIGINT(20) NOT NULL DEFAULT '0',
  `removeTime` BIGINT(20) NULL DEFAULT NULL,
  `removed` TINYINT(4) NOT NULL DEFAULT '0',
  `data` MEDIUMTEXT NULL,
  `isGC` INT(11) NULL DEFAULT '0',
  `logMD5` VARCHAR(255) NULL DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `base_image_custom_name` ON base_image_custom(`name`);

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
  `lastUpdate` BIGINT(20) NOT NULL DEFAULT '0'
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `monitor_targets` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `target` VARCHAR(10240) NULL DEFAULT NULL,
  `create_time` DATETIME NULL DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `k8s_events` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `version` VARCHAR(255) NOT NULL,
  `clusterId` INT(11) NOT NULL,
  `namespace` VARCHAR(255) NOT NULL,
  `eventKind` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `host` VARCHAR(255),
  `content` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX `k8s_events_index1` ON k8s_events(`clusterId`, `namespace`, `eventKind`);
CREATE INDEX `k8s_events_index2` ON k8s_events(`clusterId`, `name`);
CREATE INDEX `k8s_events_index3` ON k8s_events(`host`);

CREATE TABLE IF NOT EXISTS `test` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `version` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  UNIQUE KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `deploy_event` (
  `eid` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `deployId` INT(11) DEFAULT NULL,
  `operation` VARCHAR(255) DEFAULT NULL,
  `eventStatus` VARCHAR(255) DEFAULT NULL,
  `statusExpire` BIGINT(20) DEFAULT NULL,
  `content` MEDIUMTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `uniq_port_index` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `lbid` INT(11) NOT NULL,
  `port` INT(11) NOT NULL,
  `clusterId` INT(11) NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE UNIQUE INDEX `uniq_port_index_cluster_port` ON uniq_port_index(`port`, `clusterId`);

CREATE INDEX `k8s_events_kind_index` ON k8s_events(`clusterId`, `namespace`, `eventKind`);
CREATE UNIQUE INDEX `k8s_events_name_index` ON k8s_events(`clusterId`, `namespace`, `name`);
CREATE INDEX `k8s_events_host_index` ON k8s_events(`host`);

-- test, test
insert into users(username, password, salt, loginType, state) VALUES ('admin','5fdf2372d4f23bdecfd2b8e8d7aacce1','0ea3abcf42700bb1bbcca6c27c92a821','USER','NORMAL');
insert into users(username, password, salt, loginType, state) VALUES ('test','060b125a2e2de865ccc0f06367bc3491','831d1215e1bcbe99419a3e8f88edb869','USER','NORMAL');
insert into users(username, password, salt, loginType, state) VALUES ('test2','a190c9f28a28a1d7667f50830d8bf6d5','db5474a6e19613a7081506e2910f5dc4','USER','NORMAL');
insert into global(type, value) VALUES ('LDAP_SERVER','ldap://ldap.test.com:389');
insert into global(type, value) VALUES ('LDAP_PREFIX','@test.com');
insert into global(type, value) VALUES ('SERVER','localhost:8080');
INSERT INTO admin_roles(userId, role) VALUES ('1', 'admin');
INSERT INTO cluster(name, state, removed, data) VALUES ('mycluster', 'RUNNING', '0', '{"api":"0.0.0.0:8080", "ver":1, "fqcn": "org.domeos.framework.api.model.cluster.Cluster"}');

CREATE TABLE IF NOT EXISTS `testmodel1` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1024) NULL DEFAULT NULL,
  `state` VARCHAR(128) NOT NULL,
  `createTime` BIGINT(20) NOT NULL DEFAULT '0',
  `removeTime` BIGINT(20) NULL DEFAULT NULL,
  `removed` TINYINT(4) NOT NULL DEFAULT '0',
  `data` MEDIUMTEXT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `testmodel2` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1024) NULL DEFAULT NULL,
  `state` VARCHAR(128) NOT NULL,
  `createTime` BIGINT(20) NOT NULL DEFAULT '0',
  `removeTime` BIGINT(20) NULL DEFAULT NULL,
  `removed` TINYINT(4) NOT NULL DEFAULT '0',
  `data` MEDIUMTEXT NULL,
  `column1` INT(11)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;