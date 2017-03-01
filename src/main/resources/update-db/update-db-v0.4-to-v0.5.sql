USE domeos;

ALTER TABLE global ADD `description` VARCHAR(1024) NULL DEFAULT NULL;

ALTER TABLE gitlab_user ADD  `gitlabId` INT(11) NOT NULL;

UPDATE gitlab_user SET gitlabId=(SELECT id from global where type='GITLAB');

INSERT INTO global(type, value) VALUES ('UPDATE_JOB_IMAGE', 'pub.domeos.org/rolling-updater:v0.1');

ALTER TABLE deploy_event ADD startTime BIGINT(20) NULL;

CREATE INDEX `deploy_event_start_time_index` ON deploy_event(`startTime`);

UPDATE deploy_event SET startTime = SUBSTR( content, POSITION('"startTime"' IN content) + 12, ( POSITION( ',"lastModify"' IN content ) - POSITION('"startTime"' IN content) - 12 ))
