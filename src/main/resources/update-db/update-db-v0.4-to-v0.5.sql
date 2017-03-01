USE domeos;

ALTER TABLE global ADD `description` VARCHAR(1024) NULL DEFAULT NULL;

ALTER TABLE gitlab_user ADD  `gitlabId` INT(11) NOT NULL;

UPDATE gitlab_user SET gitlabId=(SELECT id from global where type='GITLAB');
INSERT INTO global(type, value) VALUES ('UPDATE_JOB_IMAGE', 'pub.domeos.org/rolling-updater:v0.1');