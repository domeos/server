# create tabels first
-- alarm user group info & user group bind
DROP TABLE IF EXISTS `alarm_user_group_info`;
DROP TABLE IF EXISTS `alarm_user_group_user_bind`;
DROP TABLE IF EXISTS `collection_authority_map`;
DROP TABLE IF EXISTS `collection_resource_map`;
DROP TABLE IF EXISTS `project_collection`;
DROP TABLE IF EXISTS `deploy_collection`;
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

# update_project_user() will create project collections with project created by user, which named with username
# update_deploy_group() will create deploy collections with deployment created by group, which named with group name.
# all update_project_* functions will insert related data to collection_authority_map, collection_resource_map and operation_history.
DELIMITER //

DROP PROCEDURE IF EXISTS update_project_user//

CREATE PROCEDURE update_project_user()
domeos:BEGIN
  DECLARE done BOOLEAN DEFAULT FALSE;
  DECLARE resource_id INT;
  DECLARE creator_name VARCHAR(255);
  DECLARE owner_id INT;
  DECLARE role VARCHAR(255);
  DECLARE user_name VARCHAR(255);
  DECLARE collection_id INT;
  DECLARE collection_name VARCHAR(255);
  DECLARE cur_time BIGINT(20);
  DECLARE debug_enable BOOLEAN DEFAULT TRUE;
  DECLARE creator_id INT;
  DECLARE x INT;
  DECLARE y INT;
  DECLARE old_resource_id CURSOR FOR
  SELECT id FROM project WHERE project.removed = 0 AND project.id not in (SELECT DISTINCTROW resourceId FROM resources WHERE resourceType = "PROJECT" AND ownerType = "GROUP" AND resourceId NOT IN (SELECT id FROM project WHERE project.removed = 1) AND ownerId IN (SELECT id FROM groups WHERE state=1));
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done := TRUE;

  OPEN old_resource_id;

  process: LOOP
    FETCH old_resource_id INTO resource_id;
    IF done THEN
       LEAVE process;
    END IF;
  SELECT SUBSTRING_INDEX(name, '/', 1) INTO collection_name FROM project WHERE id=resource_id and project.removed = 0;
  SELECT null INTO creator_id;
  SELECT id INTO creator_id FROM users WHERE SUBSTRING_INDEX(users.username, '@', 1)=collection_name;
  IF isnull(creator_id) THEN
     SELECT 1 INTO creator_id;
  END IF;
  SELECT username INTO creator_name FROM users WHERE id=creator_id;
  SELECT UNIX_TIMESTAMP(current_timestamp)*1000 INTO cur_time;
    SELECT 0 INTO x;
  SELECT COUNT(*) INTO x FROM project_collection WHERE name=collection_name AND project_collection.removed=0;
  IF x=0 THEN
    INSERT IGNORE INTO project_collection (name, description, state, createTime, removeTime, removed, data, projectCollectionState)
      VALUES (collection_name, "system update created", "ACTIVE", cur_time, 0, 0, CONCAT("{\"ver\":1,\"fqcn\":\"org.domeos.framework.api.model.project.ProjectCollection\", \"creatorId\":", creator_id, ",\"projectCollectionState\":\"PRIVATE\"}"), "PRIVATE");
    SELECT id INTO collection_id FROM project_collection WHERE name = collection_name;
    INSERT IGNORE INTO collection_authority_map (collectionId, resourceType, userId, role, updateTime) VALUES (collection_id, "PROJECT_COLLECTION", creator_id, "MASTER", cur_time);
    INSERT IGNORE INTO operation_history (resourceId, resourceType, operation, userId, userName, status, message, operateTime)
      VALUES (collection_id, "PROJECT_COLLECTION", "SET", creator_id, creator_name, "OK", "", cur_time);
  END IF;
  SELECT id INTO collection_id FROM project_collection WHERE name = collection_name;
  INSERT IGNORE INTO collection_resource_map (resourceId, creatorId, resourceType, collectionId, updateTime)
    VALUES (resource_id, creator_id, "PROJECT", collection_id, cur_time);
  INSERT IGNORE INTO collection_authority_map (collectionId, resourceType, userId, role, updateTime)
    SELECT collection_id, "PROJECT_COLLECTION", resources.ownerId, resources.role, cur_time FROM resources WHERE resourceId = resource_id AND resourceType = "PROJECT" AND ownerType = "USER";
  END LOOP process;

  CLOSE old_resource_id;
END;
//

DROP PROCEDURE IF EXISTS update_project_group;

CREATE PROCEDURE update_project_group()
domeos:BEGIN
  DECLARE done BOOLEAN DEFAULT FALSE;
  DECLARE resource_id INT;
  DECLARE group_id INT;
  DECLARE role VARCHAR(255);
  DECLARE collection_id INT;
  DECLARE collection_name VARCHAR(255);
  DECLARE cur_time BIGINT(20);
  DECLARE creator_id INT;
  DECLARE creator_name VARCHAR(255);
  DECLARE x INT;
  DECLARE old_resource_id CURSOR FOR
    SELECT id FROM project WHERE project.removed = 0 AND project.id in (SELECT DISTINCTROW resourceId FROM resources WHERE resourceType = "PROJECT" AND ownerType = "GROUP" AND resourceId NOT IN (SELECT id FROM project WHERE project.removed = 1) AND ownerId IN (SELECT id FROM groups WHERE state=1));
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done := TRUE;

  OPEN old_resource_id;

  process: LOOP
    FETCH old_resource_id INTO resource_id;
    IF done THEN
       LEAVE process;
    END IF;
  SELECT SUBSTRING_INDEX(name, '/', 1) INTO collection_name FROM project WHERE id=resource_id and project.removed = 0;
  SELECT null INTO creator_id;
  SELECT userId INTO creator_id FROM operation_history WHERE resourceId = resource_id AND resourceType = "PROJECT" AND operation="SET" AND status="OK";
    IF isnull(creator_id) THEN
       SELECT 1 INTO creator_id;
    END IF;
  SELECT username INTO creator_name FROM users WHERE id = creator_id;
   SELECT UNIX_TIMESTAMP(current_timestamp)*1000 INTO cur_time;
    SELECT 0 INTO x;
  SELECT COUNT(*) INTO x FROM project_collection WHERE name=collection_name AND project_collection.removed=0;
  IF x=0 THEN
    INSERT IGNORE INTO project_collection (name, description, state, createTime, removeTime, removed, data, projectCollectionState)
       VALUES (collection_name, "system update created", "ACTIVE", cur_time, 0, 0, CONCAT("{\"ver\":1,\"fqcn\":\"org.domeos.framework.api.model.project.ProjectCollection\", \"creatorId\":", creator_id, ",\"projectCollectionState\":\"PRIVATE\"}"), "PRIVATE");
    SELECT id INTO collection_id FROM project_collection WHERE name = collection_name;
    SELECT null INTO group_id;
    SELECT id INTO group_id FROM groups WHERE groups.name=collection_name AND state=1;
    INSERT IGNORE INTO operation_history (resourceId, resourceType, operation, userId, userName, status, message, operateTime) VALUES (collection_id, "PROJECT_COLLECTION", "SET", creator_id, creator_name, "OK", "", cur_time);
    IF isnull(group_id) THEN
      INSERT IGNORE INTO collection_authority_map (collectionId, resourceType, userId, role, updateTime) VALUES (collection_id, "PROJECT_COLLECTION", creator_id, "MASTER", cur_time);
    ELSE
    INSERT IGNORE INTO collection_authority_map (collectionId, resourceType, userId, role, updateTime) SELECT collection_id, "PROJECT_COLLECTION", user_group_map.userId, user_group_map.role, cur_time FROM user_group_map WHERE groupId = group_id;
    END IF;
   END IF;
  INSERT IGNORE INTO collection_resource_map (resourceId, creatorId, resourceType, collectionId, updateTime) VALUES (resource_id, creator_id, "PROJECT", collection_id, cur_time);

  END LOOP process;

  CLOSE old_resource_id;
END;
//
DELIMITER ;
CALL update_project_user();
CALL update_project_group();


# update_deploy_user() will create deploy collections with deployment created by user, which named with DEPLOYCOLLECION-$username-$deployId
# update_deploy_group() will create deploy collections with deployment created by group, which named with group name.
# update_deploy_group_with_user() will create deploy collections with deployment created by group which add additional user's authority,
# which named with groupname-deployId.
# all three update_deploy_* functions will insert related data to collection_authority_map, collection_resource_map and operation_history.


UPDATE operation_history SET operation = "SET" WHERE operation = "BUILD" AND resourceType = "DEPLOY";
DELIMITER //

DROP PROCEDURE IF EXISTS update_deploy_user//
DROP PROCEDURE IF EXISTS debug_msg//
CREATE PROCEDURE debug_msg(enabled BOOLEAN, msg VARCHAR(255))
  BEGIN
    IF enabled THEN BEGIN
      select concat("** ", msg) AS '** DEBUG:';
    END; END IF;
  END //



CREATE PROCEDURE update_deploy_user()
    domeos:BEGIN
    DECLARE done BOOLEAN DEFAULT FALSE;
    DECLARE resource_id INT;
    DECLARE creator_id INT;
    DECLARE owner_id INT;
    DECLARE role VARCHAR(255);
    DECLARE user_name VARCHAR(255);
    DECLARE collection_id INT;
    DECLARE collection_name VARCHAR(255);
    DECLARE cur_time BIGINT(20);
    DECLARE debug_enable BOOLEAN DEFAULT TRUE;
    DECLARE old_resource_id CURSOR FOR
      SELECT DISTINCTROW resourceId FROM resources WHERE resourceType = "DEPLOY" AND ownerType = "USER" AND
                                                         resourceId NOT IN (SELECT resourceId FROM resources WHERE ownerType = "GROUP" AND resourceType = "DEPLOY") AND
                                                         resourceId NOT IN (SELECT id FROM deployment WHERE deployment.removed = 1);
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done := TRUE;

    OPEN old_resource_id;

    process: LOOP
      FETCH old_resource_id INTO resource_id;
      IF done THEN
        LEAVE process;
      END IF;

      SELECT userId INTO creator_id FROM operation_history WHERE resourceId=resource_id and operation='SET' and resourceType='DEPLOY';
      IF isnull(creator_id) THEN
        SELECT 1 INTO creator_id;
      END IF;
      SELECT username INTO user_name FROM users WHERE id = creator_id;
      SELECT UNIX_TIMESTAMP(current_timestamp)*1000 INTO cur_time;
      SELECT CONCAT("DEPLOYCOLLECTION-", user_name, "-", resource_id) INTO collection_name;
      INSERT IGNORE INTO deploy_collection (name, description, state, createTime, removeTime, removed, data)
      VALUES (collection_name, "system update created", "ACTIVE", cur_time, 0, 0, CONCAT("{\"ver\":1,\"fqcn\":\"org.domeos.framework.api.model.deployment.DeployCollection\", \"creatorId\":", creator_id, " }\""));
      SELECT id INTO collection_id FROM deploy_collection WHERE name = collection_name;
      INSERT IGNORE INTO collection_resource_map (resourceId, creatorId, resourceType, collectionId, updateTime)
      VALUES (resource_id, creator_id, "DEPLOY", collection_id, cur_time);
      INSERT IGNORE INTO collection_authority_map (collectionId, resourceType, userId, role, updateTime)
        SELECT collection_id, "DEPLOY_COLLECTION", resources.ownerId, resources.role, cur_time FROM resources WHERE resourceId = resource_id AND resourceType = "DEPLOY" AND ownerType = "USER";
      INSERT IGNORE INTO operation_history (resourceId, resourceType, operation, userId, userName, status, message, operateTime)
      VALUES (collection_id, "DEPLOY_COLLECTION", "SET", 1, "admin", "OK", "", cur_time);
      SELECT NULL INTO creator_id;
      SELECT NULL INTO user_name;

    END LOOP process;

    CLOSE old_resource_id;
  END;
//

DROP PROCEDURE IF EXISTS update_deploy_group;

CREATE PROCEDURE update_deploy_group()
    domeos:BEGIN
    DECLARE done BOOLEAN DEFAULT FALSE;
    DECLARE resource_id INT;
    DECLARE group_id INT;
    DECLARE role VARCHAR(255);
    DECLARE collection_id INT;
    DECLARE collection_name VARCHAR(255);
    DECLARE cur_time BIGINT(20);
    DECLARE old_group_id CURSOR FOR
      SELECT DISTINCT ownerId FROM resources WHERE resourceType = "DEPLOY" AND ownerType = "GROUP"  AND resourceId NOT  IN (SELECT id FROM deployment WHERE deployment.removed = 1);
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done := TRUE;

    OPEN old_group_id;

    process: LOOP
      FETCH old_group_id INTO group_id;

      IF done THEN
        LEAVE process;
      END IF;
      SELECT name INTO collection_name FROM groups WHERE id = group_id;
      SELECT UNIX_TIMESTAMP(current_timestamp)*1000 INTO cur_time;
      INSERT IGNORE INTO deploy_collection (name, description, state, createTime, removeTime, removed, data)
      VALUES (collection_name, "system update with group migrate", "ACTIVE", cur_time, 0, 0, CONCAT("{\"ver\":1,\"fqcn\":\"org.domeos.framework.api.model.deployment.DeployCollection\", \"creatorId\":1 }\""));
      SELECT id INTO collection_id FROM deploy_collection WHERE name = collection_name;
      INSERT IGNORE INTO collection_resource_map (resourceId, creatorId, resourceType, collectionId, updateTime) SELECT resources.resourceId, operation_history.userId, "DEPLOY", collection_id, cur_time
                                                                                                          FROM resources, operation_history WHERE resources.ownerId = group_id AND resources.ownerType = "GROUP" AND resources.resourceType = "DEPLOY"
                                                                                                                                                  AND operation_history.resourceId = resources.resourceId AND operation_history.operation = "SET" AND operation_history.resourceType = "DEPLOY";
      INSERT IGNORE INTO collection_authority_map (collectionId, resourceType, userId, role, updateTime)
        SELECT collection_id, "DEPLOY_COLLECTION", user_group_map.userId, user_group_map.role, cur_time FROM user_group_map WHERE groupId = group_id;
      INSERT IGNORE INTO operation_history (resourceId, resourceType, operation, userId, userName, status, message, operateTime) VALUES (collection_id, "DEPLOY_COLLECTION", "SET", 1, "admin", "OK", "", cur_time);
    END LOOP process;

    CLOSE old_group_id;
  END;
//


DROP PROCEDURE IF EXISTS update_deploy_group_with_user;

CREATE PROCEDURE update_deploy_group_with_user()
    domeos:BEGIN
    DECLARE done BOOLEAN DEFAULT FALSE;
    DECLARE resource_id INT;
    DECLARE group_id INT;
    DECLARE owner_id INT;
    DECLARE creator_id INT;
    DECLARE role VARCHAR(255);
    DECLARE user_name VARCHAR(255);
    DECLARE collection_id INT;
    DECLARE collection_name VARCHAR(255);
    DECLARE group_name VARCHAR(255);
    DECLARE cur_time BIGINT(20);
    DECLARE old_collection_id INT;
    DECLARE old_resource_id CURSOR FOR
      SELECT DISTINCT resourceId FROM resources WHERE resourceType = "DEPLOY" AND ownerType = "USER" AND
                                                      resourceId IN (SELECT resourceId FROM resources WHERE ownerType = "GROUP" AND resourceType = "DEPLOY") AND
                                                      resourceId NOT IN (SELECT id FROM deployment WHERE deployment.removed = 1);
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done := TRUE;

    OPEN old_resource_id;

    process: LOOP
      FETCH old_resource_id INTO resource_id;
      IF done THEN
        LEAVE process;
      END IF;
      SELECT userId INTO creator_id FROM operation_history WHERE resourceId=resource_id and operation='SET' and resourceType='DEPLOY';
      IF ISNULL(creator_id) THEN
        SELECT 1 INTO creator_id;
      END IF;
      SELECT deploy_collection.name INTO group_name FROM deploy_collection, collection_resource_map  WHERE
        deploy_collection.id = collection_resource_map.collectionId AND collection_resource_map.resourceType = "DEPLOY" AND
        collection_resource_map.resourceId = resource_id;
      SELECT username INTO user_name FROM users WHERE id = creator_id;
      SELECT UNIX_TIMESTAMP(current_timestamp) * 10000 INTO cur_time;
      SELECT CONCAT(group_name, "-", resource_id) INTO collection_name;
      INSERT IGNORE INTO deploy_collection (name, description, state, createTime, removeTime, removed, data)
      VALUES (collection_name, "system update with group with other user migrate", "ACTIVE", cur_time, 0, 0, CONCAT("{\"ver\":1,\"fqcn\":\"org.domeos.framework.api.model.deployment.DeployCollection\", \"creatorId\":", creator_id, " }\""));
      SELECT id INTO collection_id FROM deploy_collection WHERE name = collection_name;
      SELECT collectionId INTO old_collection_id FROM collection_resource_map WHERE resourceId = resource_id AND resourceType = "DEPLOY";
      UPDATE collection_resource_map SET  collectionId = collection_id WHERE resourceId = resource_id AND resourceType = "DEPLOY";
      INSERT IGNORE INTO collection_authority_map (collectionId, resourceType, userId, role, updateTime)
        SELECT collection_id, "DEPLOY_COLLECTION", collection_authority_map.userId, collection_authority_map.role, cur_time FROM collection_authority_map WHERE collectionId = old_collection_id AND resourceType = "DEPLOY_COLLECTION";
      INSERT IGNORE INTO collection_authority_map (collectionId, resourceType, userId, role, updateTime)
        SELECT collection_id, "DEPLOY_COLLECTION", resources.ownerId, resources.role, cur_time FROM resources
          WHERE resourceId = resource_id AND resourceType = "DEPLOY" AND ownerId NOT IN
                  (SELECT userId from collection_authority_map WHERE collectionId = collection_id AND  resourceType = "DEPLOY_COLLECTION");
      INSERT IGNORE INTO operation_history (resourceId, resourceType, operation, userId, userName, status, message, operateTime) VALUES (collection_id, "DEPLOY_COLLECTION", "SET", 1, "admin", "OK", "", cur_time);
      SELECT NULL INTO creator_id;
    END LOOP process;

    CLOSE old_resource_id;
  END
//
DELIMITER ;
CALL update_deploy_user();
CALL update_deploy_group();
CALL update_deploy_group_with_user();

#these 3 insert sql will update the alarm related tables.
INSERT IGNORE INTO collection_authority_map (collectionId, resourceType, userId, role, updateTime) SELECT
                                                                                              1000, "ALARM", userId, role, updateTime FROM user_group_map WHERE groupId = 1000;

INSERT IGNORE INTO alarm_user_group_info (userGroupName, creatorId, creatorName, createTime, updateTime) SELECT
                                                                                                    name, 1, "admin", createTime, updateTime FROM groups WHERE id IN (SELECT DISTINCT userGroupId FROM alarm_template_user_group_bind);

INSERT IGNORE INTO alarm_user_group_user_bind (userGroupId, userId, bindTime)
  SELECT alarm_user_group_info.id, user_group_map.userId, user_group_map.updateTime FROM alarm_user_group_info, user_group_map, groups WHERE
    alarm_user_group_info.userGroupName = groups.name AND groups.id = user_group_map.groupId;


#update the data field of table cluster
UPDATE cluster AS clus SET clus.`data` = REPLACE ( clus.`data`, '"ownerType":"USER",', '' );

UPDATE cluster AS clus SET clus.`data` = REPLACE ( clus.`data`, '"ownerType":"GROUP",', '' );

#insert resource data(cluster) into collection_authority_map
INSERT IGNORE INTO collection_authority_map ( collectionId, resourceType, userId, role, updateTime ) SELECT res.resourceId, res.resourceType, res.ownerId, res.role, res.updateTime FROM resources AS res WHERE res.resourceType = 'CLUSTER' AND res.ownerType='USER';

INSERT IGNORE INTO collection_authority_map ( collectionId, resourceType, userId, role, updateTime ) SELECT res.resourceId, res.resourceType, ugm.userId, ugm.role, res.updateTime FROM resources AS res INNER JOIN user_group_map AS ugm ON res.resourceType = 'CLUSTER' AND res.ownerType='GROUP' AND res.ownerId=ugm.groupId;

#insert cluster data(cluster) into collection_resource_map
INSERT IGNORE INTO collection_resource_map ( resourceId, creatorId, resourceType, collectionId, updateTime ) SELECT clus.id,
    SUBSTR( clus.`data`, POSITION('"ownerId"' IN clus.`data`) + 10, ( POSITION( ',"logConfig"' IN clus.`data` ) - POSITION('"ownerId"' IN clus.`data`) - 10 )), "CLUSTER", clus.id, clus.createTime FROM cluster AS clus;
