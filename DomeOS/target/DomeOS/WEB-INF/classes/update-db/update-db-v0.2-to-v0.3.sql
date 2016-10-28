USE domeos;

UPDATE global SET value="pub.domeos.org/domeos/build:0.3" WHERE type="BUILD_IMAGE";

INSERT INTO global(type, value) VALUES ('PUBLIC_REGISTRY_URL', 'http://pub.domeos.org');
DROP TABLE k8s_events;
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

create database if not exists `portal`;

DROP TABLE if exists `portal`.`action`;
CREATE TABLE `portal`.`action` (
  `id`                   INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uic`                  VARCHAR(255)     NOT NULL DEFAULT '',
  `url`                  VARCHAR(255)     NOT NULL DEFAULT '',
  `callback`             TINYINT(4)       NOT NULL DEFAULT '0',
  `before_callback_sms`  TINYINT(4)       NOT NULL DEFAULT '0',
  `before_callback_mail` TINYINT(4)       NOT NULL DEFAULT '0',
  `after_callback_sms`   TINYINT(4)       NOT NULL DEFAULT '0',
  `after_callback_mail`  TINYINT(4)       NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
)
  ENGINE =InnoDB
  DEFAULT CHARSET =utf8
  COLLATE =utf8_unicode_ci;

DROP TABLE if exists `portal`.`expression`;
CREATE TABLE `portal`.`expression` (
  `id`          INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `expression`  VARCHAR(1024)    NOT NULL,
  `func`        VARCHAR(16)      NOT NULL DEFAULT 'all(#1)',
  `op`          VARCHAR(8)       NOT NULL DEFAULT '',
  `right_value` VARCHAR(16)      NOT NULL DEFAULT '',
  `max_step`    INT(11)          NOT NULL DEFAULT '1',
  `priority`    TINYINT(4)       NOT NULL DEFAULT '0',
  `note`        VARCHAR(1024)    NOT NULL DEFAULT '',
  `action_id`   INT(10) UNSIGNED NOT NULL DEFAULT '0',
  `create_user` VARCHAR(64)      NOT NULL DEFAULT '',
  `pause`       TINYINT(1)       NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
)
  ENGINE =InnoDB
  DEFAULT CHARSET =utf8
  COLLATE =utf8_unicode_ci;

DROP TABLE if exists `portal`.`grp`;
CREATE TABLE `portal`.`grp` (
  id          INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  grp_name    VARCHAR(255)     NOT NULL DEFAULT '',
  create_user VARCHAR(64)      NOT NULL DEFAULT '',
  create_at   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  come_from   TINYINT(4)       NOT NULL DEFAULT '0',
  PRIMARY KEY (id),
  UNIQUE KEY idx_host_grp_grp_name (grp_name)
)
  ENGINE =InnoDB
  DEFAULT CHARSET =utf8
  COLLATE =utf8_unicode_ci
  AUTO_INCREMENT=1000;

DROP TABLE if exists `portal`.`grp_host`;
CREATE TABLE `portal`.`grp_host` (
  grp_id  INT UNSIGNED NOT NULL,
  host_id INT UNSIGNED NOT NULL,
  KEY idx_grp_host_grp_id (grp_id),
  KEY idx_grp_host_host_id (host_id)
)
  ENGINE =InnoDB
  DEFAULT CHARSET =utf8
  COLLATE =utf8_unicode_ci;

DROP TABLE if exists `portal`.`grp_tpl`;
CREATE TABLE `portal`.`grp_tpl` (
  `grp_id`    INT(10) UNSIGNED NOT NULL,
  `tpl_id`    INT(10) UNSIGNED NOT NULL,
  `bind_user` VARCHAR(64)      NOT NULL DEFAULT '',
  KEY `idx_grp_tpl_grp_id` (`grp_id`),
  KEY `idx_grp_tpl_tpl_id` (`tpl_id`)
)
  ENGINE =InnoDB
  DEFAULT CHARSET =utf8
  COLLATE =utf8_unicode_ci;

DROP TABLE if exists `portal`.`host`;
CREATE TABLE `portal`.`host` (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  hostname       VARCHAR(255) NOT NULL DEFAULT '',
  ip             VARCHAR(16)  NOT NULL DEFAULT '',
  agent_version  VARCHAR(16)  NOT NULL DEFAULT '',
  plugin_version VARCHAR(128) NOT NULL DEFAULT '',
  maintain_begin INT UNSIGNED NOT NULL DEFAULT 0,
  maintain_end   INT UNSIGNED NOT NULL DEFAULT 0,
  update_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY idx_host_hostname (hostname)
)
  ENGINE =InnoDB
  DEFAULT CHARSET =utf8
  COLLATE =utf8_unicode_ci;

DROP TABLE if exists `portal`.`mockcfg`;
CREATE TABLE `portal`.`mockcfg` (
  `id`       BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`     VARCHAR(255)        NOT NULL DEFAULT ''
  COMMENT 'name of mockcfg, used for uuid',
  `obj`      VARCHAR(10240)      NOT NULL DEFAULT ''
  COMMENT 'desc of object',
  `obj_type` VARCHAR(255)        NOT NULL DEFAULT ''
  COMMENT 'type of object, host or group or other',
  `metric`   VARCHAR(128)        NOT NULL DEFAULT '',
  `tags`     VARCHAR(1024)       NOT NULL DEFAULT '',
  `dstype`   VARCHAR(32)         NOT NULL DEFAULT 'GAUGE',
  `step`     INT(11) UNSIGNED    NOT NULL DEFAULT 60,
  `mock`     DOUBLE              NOT NULL DEFAULT 0
  COMMENT 'mocked value when nodata occurs',
  `creator`  VARCHAR(64)         NOT NULL DEFAULT '',
  `t_create` DATETIME            NOT NULL
  COMMENT 'create time',
  `t_modify` TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'last modify time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_name` (`name`)
)
  ENGINE =InnoDB
  DEFAULT CHARSET =utf8
  COLLATE =utf8_unicode_ci;

DROP TABLE if exists `portal`.`plugin_dir`;
CREATE TABLE `portal`.`plugin_dir` (
  `id`          INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `grp_id`      INT(10) UNSIGNED NOT NULL,
  `dir`         VARCHAR(255)     NOT NULL,
  `create_user` VARCHAR(64)      NOT NULL DEFAULT '',
  `create_at`   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_plugin_dir_grp_id` (`grp_id`)
)
  ENGINE =InnoDB
  DEFAULT CHARSET =utf8
  COLLATE =utf8_unicode_ci;

DROP TABLE if exists `portal`.`strategy`;
CREATE TABLE `portal`.`strategy` (
  `id`          INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `metric`      VARCHAR(128)     NOT NULL DEFAULT '',
  `tags`        VARCHAR(256)     NOT NULL DEFAULT '',
  `max_step`    INT(11)          NOT NULL DEFAULT '1',
  `priority`    TINYINT(4)       NOT NULL DEFAULT '0',
  `func`        VARCHAR(16)      NOT NULL DEFAULT 'all(#1)',
  `op`          VARCHAR(8)       NOT NULL DEFAULT '',
  `right_value` VARCHAR(64)      NOT NULL,
  `note`        VARCHAR(128)     NOT NULL DEFAULT '',
  `run_begin`   VARCHAR(16)      NOT NULL DEFAULT '',
  `run_end`     VARCHAR(16)      NOT NULL DEFAULT '',
  `tpl_id`      INT(10) UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_strategy_tpl_id` (`tpl_id`)
)
  ENGINE =InnoDB
  DEFAULT CHARSET =utf8
  COLLATE =utf8_unicode_ci;

DROP TABLE if exists `portal`.`tpl`;
CREATE TABLE `portal`.`tpl` (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tpl_name    VARCHAR(255) NOT NULL DEFAULT '',
  parent_id   INT UNSIGNED NOT NULL DEFAULT 0,
  action_id   INT UNSIGNED NOT NULL DEFAULT 0,
  create_user VARCHAR(64)  NOT NULL DEFAULT '',
  create_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY idx_tpl_name (tpl_name),
  KEY idx_tpl_create_user (create_user)
)
  ENGINE =InnoDB
  DEFAULT CHARSET =utf8
  COLLATE =utf8_unicode_ci;

DELIMITER //

DROP PROCEDURE IF EXISTS update_lb_namespace;

CREATE PROCEDURE update_lb_namespace()
domeos:BEGIN
  DECLARE done BOOLEAN DEFAULT FALSE;
  DECLARE lb_id INT;
  DECLARE deploy_id INT;
  DECLARE lb_data_len INT;
  DECLARE deploy_data MEDIUMTEXT;
  DECLARE lb_old_data MEDIUMTEXT;
  DECLARE lb_new_data MEDIUMTEXT;
  DECLARE deploy_data_front INT;
  DECLARE deploy_data_forward INT;
  DECLARE lb_namespace VARCHAR(255);
  DECLARE string_tmp MEDIUMTEXT;
  DECLARE old_lb CURSOR FOR
    SELECT id FROM load_balancer WHERE data NOT LIKE '%namespace%';
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done := TRUE;

  OPEN old_lb;

  process: LOOP
    FETCH old_lb INTO lb_id;
    IF done THEN
      LEAVE process;
    END IF;
    SELECT deployId INTO deploy_id FROM load_balancer_deploy_map WHERE loadBalancerId=lb_id;
    SELECT data INTO deploy_data FROM deployment WHERE id=deploy_id;
    SELECT SUBSTRING_INDEX(deploy_data, 'namespace', 1) INTO string_tmp;
    SELECT CHAR_LENGTH(string_tmp) INTO deploy_data_front;
    SELECT SUBSTRING_INDEX(deploy_data, 'hostEnv', 1) INTO string_tmp;
    SELECT CHAR_LENGTH(string_tmp) INTO deploy_data_forward;
    SELECT SUBSTRING(deploy_data, deploy_data_front+13, deploy_data_forward-deploy_data_front-15) INTO lb_namespace;
    SELECT data INTO lb_old_data FROM load_balancer WHERE id=lb_id;
    SELECT CHAR_LENGTH(lb_old_data) INTO lb_data_len;
    SELECT SUBSTRING(lb_old_data, 1, lb_data_len-1) INTO string_tmp;
    SELECT CONCAT(string_tmp, ',"namespace":"', lb_namespace, '"}') INTO lb_new_data;
    UPDATE load_balancer SET data=lb_new_data WHERE id=lb_id;
  END LOOP process;

  CLOSE old_lb;
END;

DROP PROCEDURE IF EXISTS update_lb_name;

CREATE PROCEDURE update_lb_name()
domeos:BEGIN
  DECLARE done BOOLEAN DEFAULT FALSE;
  DECLARE lb_id INT;
  DECLARE deploy_id INT;
  DECLARE deploy_name VARCHAR(255);
  DECLARE lb_name VARCHAR(255);
  DECLARE old_lb CURSOR FOR
    SELECT id FROM load_balancer WHERE name='';
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done := TRUE;

  OPEN old_lb;

  process: LOOP
    FETCH old_lb INTO lb_id;
    IF done THEN
      LEAVE process;
    END IF;
    SELECT deployId INTO deploy_id FROM load_balancer_deploy_map WHERE loadBalancerId=lb_id;
    SELECT name INTO deploy_name FROM deployment WHERE id=deploy_id;
    SELECT CONCAT('dmo-', deploy_name) INTO lb_name;
    UPDATE load_balancer SET name=lb_name WHERE id=lb_id;
  END LOOP process;

  CLOSE old_lb;
END;
//
DELIMITER ;
CALL update_lb_namespace;
CALL update_lb_name;