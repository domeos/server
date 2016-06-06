-- CREATE DATABASE IF NOT EXISTS portal;
-- USE portal;
-- SET NAMES 'utf8';
-- grant all privileges on portal.* to 'domeos'@'%' with grant option;

use portal;

DROP TABLE if exists `portal`.`action`;
CREATE TABLE `portal`.`action` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`uic` VARCHAR(255) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`url` VARCHAR(255) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`callback` TINYINT(4) NOT NULL DEFAULT '0',
	`before_callback_sms` TINYINT(4) NOT NULL DEFAULT '0',
	`before_callback_mail` TINYINT(4) NOT NULL DEFAULT '0',
	`after_callback_sms` TINYINT(4) NOT NULL DEFAULT '0',
	`after_callback_mail` TINYINT(4) NOT NULL DEFAULT '0',
	PRIMARY KEY (`id`)
)
COLLATE='utf8_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=3
;

DROP TABLE if exists `portal`.`expression`;
CREATE TABLE `portal`.`expression` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`expression` VARCHAR(1024) NOT NULL COLLATE 'utf8_unicode_ci',
	`func` VARCHAR(16) NOT NULL DEFAULT 'all(#1)' COLLATE 'utf8_unicode_ci',
	`op` VARCHAR(8) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`right_value` VARCHAR(16) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`max_step` INT(11) NOT NULL DEFAULT '1',
	`priority` TINYINT(4) NOT NULL DEFAULT '0',
	`note` VARCHAR(1024) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`action_id` INT(10) UNSIGNED NOT NULL DEFAULT '0',
	`create_user` VARCHAR(64) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`pause` TINYINT(1) NOT NULL DEFAULT '0',
	PRIMARY KEY (`id`)
)
COLLATE='utf8_unicode_ci'
ENGINE=InnoDB
;

DROP TABLE if exists `portal`.`grp`;
CREATE TABLE `portal`.`grp` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`grp_name` VARCHAR(255) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`create_user` VARCHAR(64) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`create_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`come_from` TINYINT(4) NOT NULL DEFAULT '0',
	PRIMARY KEY (`id`),
	UNIQUE INDEX `idx_host_grp_grp_name` (`grp_name`)
)
COLLATE='utf8_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=1000
;

DROP TABLE if exists `portal`.`grp_host`;
CREATE TABLE `portal`.`grp_host` (
	`grp_id` INT(10) UNSIGNED NOT NULL,
	`host_id` INT(10) UNSIGNED NOT NULL,
	INDEX `idx_grp_host_grp_id` (`grp_id`),
	INDEX `idx_grp_host_host_id` (`host_id`)
)
COLLATE='utf8_unicode_ci'
ENGINE=InnoDB
;

DROP TABLE if exists `portal`.`grp_tpl`;
CREATE TABLE `portal`.`grp_tpl` (
	`grp_id` INT(10) UNSIGNED NOT NULL,
	`tpl_id` INT(10) UNSIGNED NOT NULL,
	`bind_user` VARCHAR(64) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	INDEX `idx_grp_tpl_grp_id` (`grp_id`),
	INDEX `idx_grp_tpl_tpl_id` (`tpl_id`)
)
COLLATE='utf8_unicode_ci'
ENGINE=InnoDB
;

DROP TABLE if exists `portal`.`host`;
CREATE TABLE `portal`.`host` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`hostname` VARCHAR(255) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`ip` VARCHAR(16) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`agent_version` VARCHAR(16) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`plugin_version` VARCHAR(128) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`maintain_begin` INT(10) UNSIGNED NOT NULL DEFAULT '0',
	`maintain_end` INT(10) UNSIGNED NOT NULL DEFAULT '0',
	`update_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE INDEX `idx_host_hostname` (`hostname`)
)
COLLATE='utf8_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=48095996
;

DROP TABLE if exists `portal`.`mockcfg`;
CREATE TABLE `portal`.`mockcfg` (
	`id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'name of mockcfg, used for uuid' COLLATE 'utf8_unicode_ci',
	`obj` VARCHAR(10240) NOT NULL DEFAULT '' COMMENT 'desc of object' COLLATE 'utf8_unicode_ci',
	`obj_type` VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'type of object, host or group or other' COLLATE 'utf8_unicode_ci',
	`metric` VARCHAR(128) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`tags` VARCHAR(1024) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`dstype` VARCHAR(32) NOT NULL DEFAULT 'GAUGE' COLLATE 'utf8_unicode_ci',
	`step` INT(11) UNSIGNED NOT NULL DEFAULT '60',
	`mock` DOUBLE NOT NULL DEFAULT '0' COMMENT 'mocked value when nodata occurs',
	`creator` VARCHAR(64) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`t_create` DATETIME NOT NULL COMMENT 'create time',
	`t_modify` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'last modify time',
	PRIMARY KEY (`id`),
	UNIQUE INDEX `uniq_name` (`name`)
)
COLLATE='utf8_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=2
;

DROP TABLE if exists `portal`.`plugin_dir`;
CREATE TABLE `portal`.`plugin_dir` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`grp_id` INT(10) UNSIGNED NOT NULL,
	`dir` VARCHAR(255) NOT NULL COLLATE 'utf8_unicode_ci',
	`create_user` VARCHAR(64) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`create_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	INDEX `idx_plugin_dir_grp_id` (`grp_id`)
)
COLLATE='utf8_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=4
;

DROP TABLE if exists `portal`.`strategy`;
CREATE TABLE `portal`.`strategy` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`metric` VARCHAR(128) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`tags` VARCHAR(256) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`max_step` INT(11) NOT NULL DEFAULT '1',
	`priority` TINYINT(4) NOT NULL DEFAULT '0',
	`func` VARCHAR(16) NOT NULL DEFAULT 'all(#1)' COLLATE 'utf8_unicode_ci',
	`op` VARCHAR(8) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`right_value` VARCHAR(64) NOT NULL COLLATE 'utf8_unicode_ci',
	`note` VARCHAR(128) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`run_begin` VARCHAR(16) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`run_end` VARCHAR(16) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`tpl_id` INT(10) UNSIGNED NOT NULL DEFAULT '0',
	PRIMARY KEY (`id`),
	INDEX `idx_strategy_tpl_id` (`tpl_id`)
)
COLLATE='utf8_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=8
;

DROP TABLE if exists `portal`.`tpl`;
CREATE TABLE `portal`.`tpl` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`tpl_name` VARCHAR(255) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`parent_id` INT(10) UNSIGNED NOT NULL DEFAULT '0',
	`action_id` INT(10) UNSIGNED NOT NULL DEFAULT '0',
	`create_user` VARCHAR(64) NOT NULL DEFAULT '' COLLATE 'utf8_unicode_ci',
	`create_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE INDEX `idx_tpl_name` (`tpl_name`),
	INDEX `idx_tpl_create_user` (`create_user`)
)
COLLATE='utf8_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=5
;
