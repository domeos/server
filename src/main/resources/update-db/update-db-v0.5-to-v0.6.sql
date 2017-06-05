CREATE TABLE IF NOT EXISTS `clusterwatcher_deploy_map` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `clusterId` INT(11) NOT NULL COMMENT 'projectId or deployId',
  `deployId` INT(11) NOT NULL COMMENT 'PROJECT or DEPLOY or CLUSTER',
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

INSERT INTO git_config(id, TYPE, url, createTime, lastUpdate, description, removed, removeTime)
SELECT id AS id,
  type AS TYPE,
  value AS url,
  createTime AS createTime,
  lastUpdate AS lastUpdate,
  description AS description,
  0 AS removed,
  0 AS removeTime
FROM global
WHERE type = 'GITLAB';

DELETE FROM global WHERE type = 'GITLAB';
UPDATE global SET value = 'pub.domeos.org/domeos/build:0.5' WHERE type = 'BUILD_IMAGE';

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
SET sql_mode ='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
ALTER TABLE uniq_port_index ADD COLUMN createTime BIGINT(20) DEFAULT NULL;
ALTER TABLE uniq_port_index ADD COLUMN removeTime BIGINT(20) DEFAULT NULL;
ALTER TABLE uniq_port_index ADD COLUMN removed TINYINT(4) DEFAULT 0;
ALTER TABLE uniq_port_index ADD COLUMN ip VARCHAR(15) NOT NULL;
UPDATE uniq_port_index SET createTime = UNIX_TIMESTAMP(current_timestamp)*1000;
ALTER TABLE uniq_port_index DROP INDEX uniq_port_index_cluster_port;
CREATE INDEX uniq_port_index_port_clusterId_index ON uniq_port_index (port, clusterId);
ALTER TABLE uniq_port_index CHANGE lbid loadBalancerId INT(11) NOT NULL;

ALTER TABLE load_balancer rename loadbalancer;
UPDATE loadbalancer SET loadbalancer.name=SUBSTR(loadbalancer.name,5) WHERE LOCATE('dmo-',loadbalancer.name) != 0;
UPDATE deploy_collection SET deploy_collection.data = REPLACE(deploy_collection.data," }\"","}") WHERE LOCATE(" }\"", deploy_collection.data) != 0;
ALTER TABLE load_balancer_deploy_map DROP COLUMN name;
ALTER TABLE load_balancer_deploy_map DROP COLUMN description;
ALTER TABLE load_balancer_deploy_map DROP COLUMN state;
ALTER TABLE load_balancer_deploy_map DROP COLUMN data;
ALTER TABLE load_balancer_deploy_map RENAME loadbalancer_deploy_map;

DELIMITER //
DROP FUNCTION IF EXISTS getSplitStringSize//
CREATE FUNCTION getSplitStringSize (
  sourcestr VARCHAR (10000),
  delimiter VARCHAR (50)
) RETURNS INT (11)
  BEGIN
    RETURN 1 + (LENGTH(sourcestr) - LENGTH(REPLACE (sourcestr, delimiter, ''))) / LENGTH(delimiter);
  END;
//

DROP FUNCTION IF EXISTS splitString//
CREATE FUNCTION splitString (
  sourcestr VARCHAR (1000),
  delimiter VARCHAR (50),
  inx INT
) RETURNS VARCHAR (255) CHARSET utf8
  BEGIN
    RETURN REPLACE(SUBSTRING(
                       SUBSTRING_INDEX(sourcestr, delimiter, inx),LENGTH(
                                                                      SUBSTRING_INDEX(sourcestr, delimiter, inx - 1)) + 1),delimiter,'');
  END;
//

DROP PROCEDURE IF EXISTS update_lb//
CREATE PROCEDURE update_lb()
    TestOne:BEGIN
    DECLARE done BOOLEAN DEFAULT FALSE;
    DECLARE deploy_collection_id INT;
    DECLARE cluster_id INT;
    DECLARE tempPort INT;
    DECLARE targetPort INT;
    DECLARE protocol VARCHAR(255);
    DECLARE old_namespace VARCHAR(255);
    DECLARE lbc_id INT;
    DECLARE portIndexId INT;
    DECLARE externalIP VARCHAR(255);
    DECLARE user_name VARCHAR(255);
    DECLARE deploy_name VARCHAR(255);
    DECLARE deploy_collection_name VARCHAR(255);
    DECLARE deploy_status VARCHAR(255);
    DECLARE user_role VARCHAR(255);
    DECLARE lb_name VARCHAR(255);
    DECLARE old_lb_name VARCHAR(255);
    DECLARE creator_id INT;
    DECLARE collection_authority_id INT;
    DECLARE lb_id INT;
    DECLARE deploy_id INT;
    DECLARE deploy_collection_creator_id INT;
    DECLARE deploy_collection_user_name VARCHAR(255);
    DECLARE lb_collection_name VARCHAR(255);
    DECLARE cur_time BIGINT(20);
    DECLARE lb_createTime BIGINT(20);
    DECLARE deploy_collection_time BIGINT(20);
    DECLARE splitSize INT DEFAULT 0;
    DECLARE indx INT DEFAULT 0;
    DECLARE sessionAffinity VARCHAR(255) DEFAULT 'false';
    DECLARE old_lb_id CURSOR FOR
      SELECT id FROM loadbalancer WHERE loadbalancer.removed = 0;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done := TRUE;

    OPEN old_lb_id;

    process: LOOP
      FETCH old_lb_id INTO lb_id;
      IF done THEN
        LEAVE process;
      END IF;

      SELECT deployId INTO deploy_id FROM loadbalancer_deploy_map WHERE loadbalancer_deploy_map.removed = 0 AND loadbalancer_deploy_map.loadBalancerId = lb_id;
      IF ISNULL(deploy_id) THEN
        SET done := FALSE;
        ITERATE process;
      END IF;
      SELECT name INTO deploy_name FROM deployment WHERE deployment.removed = 0 AND deployment.id = deploy_id;
      SELECT deployment.clusterId INTO cluster_id FROM deployment WHERE deployment.removed = 0 AND deployment.id = deploy_id;
      SELECT deployment.state INTO deploy_status FROM deployment WHERE deployment.removed = 0 AND deployment.id = deploy_id;
      SELECT SUBSTR( data, POSITION('"namespace"' IN data) + 12, ( POSITION( ',"hostEnv"' IN data ) - POSITION('"namespace"' IN data) - 12 )) INTO old_namespace FROM deployment WHERE deployment.removed = 0 AND deployment.id = deploy_id;
      IF ISNULL(deploy_name) OR ISNULL(cluster_id) OR ISNULL(old_namespace) OR ISNULL(deploy_status) THEN
        SET done := FALSE;
        ITERATE process;
      END IF;
      SELECT lb.createTime INTO lb_createTime FROM loadbalancer lb WHERE lb.id = lb_id;

      SELECT lb.name INTO lb_name FROM loadbalancer lb WHERE LOCATE('"ver":1', lb.data) != 0 AND lb.id = lb_id;
      IF NOT ISNULL(lb_name) THEN
        SELECT SUBSTR( lb.data, POSITION('"externalIPs"' IN lb.data) + 16, ( POSITION( '"],"protocol"' IN lb.data ) - POSITION('"externalIPs"' IN lb.data) - 16 )) INTO externalIP FROM loadbalancer lb where LOCATE('EXTERNAL_SERVICE', lb.data) != 0 AND lb.removed = 0 AND lb.id = lb_id;
        SELECT SUBSTR( lb.data, POSITION('"port"' IN lb.data) + 7, ( POSITION( ',"targetPort"' IN lb.data ) - POSITION('"port"' IN lb.data) - 7 )) INTO tempPort FROM loadbalancer lb WHERE lb.id = lb_id;
        SELECT SUBSTR( lb.data, POSITION('"targetPort"' IN lb.data) + 13, ( POSITION( ',"type"' IN lb.data ) - POSITION('"targetPort"' IN lb.data) - 13 )) INTO targetPort FROM loadbalancer lb WHERE lb.id = lb_id;
        SELECT SUBSTR( lb.data, POSITION('"protocol"' IN lb.data) + 12, ( POSITION( ',"clusterId"' IN lb.data ) - POSITION('protocol' IN lb.data) - 12)) INTO protocol FROM loadbalancer lb WHERE lb.id = lb_id;
        IF NOT ISNULL(tempPort) AND NOT ISNULL(targetPort) AND NOT ISNULL(protocol) THEN
          IF NOT ISNULL(externalIP) THEN
            SET splitSize := getSplitStringSize(externalIP,'","');
            SELECT portIndex.id INTO portIndexId FROM loadbalancer lb INNER JOIN uniq_port_index portIndex ON lb.id = portIndex.loadBalancerId AND LOCATE('EXTERNAL_SERVICE', lb.data) != 0 AND lb.removed = 0 AND lb.id = lb_id;
            IF NOT ISNULL(portIndexId) THEN
              UPDATE uniq_port_index SET ip =  splitString(externalIP, '","', 1) WHERE loadbalancerId = lb_id;
              SET indx = indx + 1;
              IF (splitSize > 1) THEN
                WHILE indx < splitSize
                DO
                  SET indx = indx + 1;
                  INSERT INTO uniq_port_index(loadBalancerId, port, clusterId, createTime, removeTime, removed, ip) SELECT loadBalancerId, port, clusterId, createTime, removeTime, removed, splitString(externalIP, '","', indx) FROM uniq_port_index portIndex WHERE portIndex.id = portIndexId;
                END WHILE;
              END IF;
            ELSE
              SET done := FALSE;
            END IF;
            UPDATE loadbalancer lb set lb.data = CONCAT("{\"ver\":1,\"fqcn\":\"org.domeos.framework.api.model.loadBalancer.LoadBalancer\",\"type\":\"EXTERNAL_SERVICE\",\"clusterId\":", cluster_id, ",\"namespace\":", old_namespace, ",\"serviceDraft\":{\"lbPorts\":[{\"port\":", tempPort, ",\"targetPort\":", targetPort, ",\"protocol\":\"", protocol, "\"}],\"sessionAffinity\":false,\"deployId\":", deploy_id, ",\"deployName\":\"", deploy_name, "\",\"deployStatus\":\"", deploy_status, "\"},\"externalIPs\":[\"", externalIP, "\"],\"lastUpdateTime\":", lb_createTime, "}") where lb.id = lb_id AND LOCATE('EXTERNAL_SERVICE', lb.data) != 0;
          ELSE
            SET done := FALSE;
          END IF;

          UPDATE loadbalancer lb set lb.data = CONCAT("{\"ver\":1,\"fqcn\":\"org.domeos.framework.api.model.loadBalancer.LoadBalancer\",\"type\":\"INNER_SERVICE\",\"clusterId\":", cluster_id, ",\"namespace\":", old_namespace, ",\"serviceDraft\":{\"lbPorts\":[{\"port\":", tempPort, ",\"targetPort\":", targetPort, ",\"protocol\":\"", protocol, "\"}],\"sessionAffinity\":false,\"deployId\":", deploy_id, ",\"deployName\":\"", deploy_name, "\",\"deployStatus\":\"", deploy_status, "\"},\"lastUpdateTime\":", lb_createTime, "}") where lb.id = lb_id AND LOCATE('EXTERNAL_SERVICE', lb.data) = 0;
        ELSE
          SET done := FALSE;
        END IF;
      ELSE
        SELECT SUBSTR( lb.data, POSITION('"externalIPs"' IN lb.data) + 16, ( POSITION( '"],"dnsName"' IN lb.data ) - POSITION('"externalIPs"' IN lb.data) - 16 )) INTO externalIP FROM loadbalancer lb where LOCATE('EXTERNAL_SERVICE', lb.data) != 0 AND lb.removed = 0 AND lb.id = lb_id;
        IF (LENGTH(externalIP) = 0) THEN
          SELECT SUBSTR( lb.data, POSITION('"externalIPs"' IN lb.data) + 16, ( POSITION( '"],"sessionAffinity"' IN lb.data ) - POSITION('"externalIPs"' IN lb.data) - 16 )) INTO externalIP FROM loadbalancer lb where LOCATE('EXTERNAL_SERVICE', lb.data) != 0 AND lb.removed = 0 AND lb.id = lb_id;
        END IF;
        IF NOT ISNULL(externalIP) THEN
          SET splitSize := getSplitStringSize(externalIP,'","');
          UPDATE uniq_port_index SET ip = splitString(externalIP, '","', 1) WHERE loadbalancerId = lb_id;
          SET indx = indx + 1;
          IF (splitSize > 1) THEN
            WHILE indx < splitSize
            DO
              SET indx = indx + 1;
              INSERT INTO uniq_port_index(loadBalancerId, port, clusterId, createTime, removeTime, removed, ip) SELECT loadBalancerId, port, clusterId, createTime, removeTime, removed, splitString(externalIP, '","', indx) FROM uniq_port_index portIndex WHERE portIndex.loadbalancerId = lb_id GROUP BY portIndex.port;
            END WHILE;
          END IF;
        ELSE
          SET done := FALSE;
        END IF;
        SELECT SUBSTR( lb.data, POSITION('"sessionAffinity"' IN lb.data) + 18, LENGTH(lb.data) - POSITION('sessionAffinity' IN lb.data) - 17) INTO sessionAffinity FROM loadbalancer lb WHERE lb.id = lb_id AND LOCATE('sessionAffinity', lb.data) != 0;
        IF ISNULL(sessionAffinity) THEN
          SET sessionAffinity := 'false';
        END IF;

        UPDATE loadbalancer lb set lb.data = replace(lb.data, '"loadBalancerPorts":',CONCAT("\"clusterId\":", cluster_id, ",\"namespace\":", old_namespace, ",\"lastUpdateTime\":", lb_createTime, ",\"serviceDraft\":{\"lbPorts\":")) where lb.id = lb_id AND LOCATE('EXTERNAL_SERVICE', lb.data) != 0;
        UPDATE loadbalancer lb set lb.data = replace(lb.data, '"externalIPs":', CONCAT("\"sessionAffinity\":", sessionAffinity, ",\"deployId\":", deploy_id, ",\"deployName\":\"", deploy_name, "\",\"deployStatus\":\"", deploy_status, "\"},\"externalIPs\":")) where lb.id = lb_id AND LOCATE('EXTERNAL_SERVICE', lb.data) != 0;

        UPDATE loadbalancer lb set lb.data = replace(lb.data, '"loadBalancerPorts":',CONCAT("\"clusterId\":", cluster_id, ",\"namespace\":", old_namespace, ",\"lastUpdateTime\":", lb_createTime, ",\"serviceDraft\":{\"lbPorts\":")) where lb.id = lb_id AND LOCATE('EXTERNAL_SERVICE', lb.data) = 0;
        UPDATE loadbalancer lb set lb.data = replace(lb.data, '"dnsName":', CONCAT("\"sessionAffinity\":", sessionAffinity, ",\"deployId\":", deploy_id, ",\"deployName\":\"", deploy_name, "\",\"deployStatus\":\"", deploy_status, "\"},\"dnsName\":")) where lb.id = lb_id AND LOCATE('EXTERNAL_SERVICE', lb.data) = 0;

        UPDATE loadbalancer lb SET lb.data = replace(lb.data, '"ver":2,"fqcn":"org.domeos.framework.api.model.LoadBalancer.LoadBalancer"','"ver":1,"fqcn":"org.domeos.framework.api.model.loadBalancer.LoadBalancer"') WHERE lb.id = lb_id;
        SET done := FALSE;
      END IF;

      SELECT lb.name INTO old_lb_name FROM loadbalancer lb WHERE LOCATE('EXTERNAL_SERVICE', lb.data) != 0 AND lb.id = lb_id;
      IF ISNULL(old_lb_name) THEN
        SET done := FALSE;
        ITERATE process;
      END IF;
      SELECT UNIX_TIMESTAMP(current_timestamp)*1000 INTO cur_time;

      SELECT creatorId INTO creator_id FROM collection_resource_map WHERE collection_resource_map.resourceId = deploy_id AND collection_resource_map.resourceType = "DEPLOY";
      IF ISNULL(creator_id) THEN
        SET done := FALSE;
        ITERATE process;
      END IF;
      SELECT collectionId INTO deploy_collection_id FROM collection_resource_map WHERE collection_resource_map.resourceId = deploy_id AND collection_resource_map.resourceType = "DEPLOY";
      IF ISNULL(deploy_collection_id) THEN
        SET done := FALSE;
        ITERATE process;
      END IF;

      SELECT deploy_collection.name INTO deploy_collection_name FROM deploy_collection WHERE deploy_collection.id = deploy_collection_id AND deploy_collection.removed = 0;

      IF ISNULL(deploy_collection_name) THEN
        SET done := FALSE;
        ITERATE process;
      END IF;
      SELECT deploy_collection.createTime INTO deploy_collection_time FROM deploy_collection WHERE deploy_collection.id = deploy_collection_id AND deploy_collection.removed = 0;

      SELECT SUBSTR( deploy_collection.data, POSITION('"creatorId"' IN deploy_collection.data) + 12, LENGTH(deploy_collection.data) - POSITION('creatorId' IN deploy_collection.data) - 11) INTO deploy_collection_creator_id FROM deploy_collection WHERE deploy_collection.id = deploy_collection_id AND deploy_collection.removed = 0;
      IF ISNULL(deploy_collection_creator_id) THEN
        SET done := FALSE;
        SELECT 1 INTO deploy_collection_creator_id;
      END IF;

      SELECT username INTO deploy_collection_user_name FROM users WHERE id = deploy_collection_creator_id;
      IF ISNULL(deploy_collection_user_name) THEN
        SET done := FALSE;
        SELECT "admin" INTO deploy_collection_user_name;
      END IF;

      SELECT username INTO user_name FROM users WHERE id = creator_id;
      IF ISNULL(user_name) THEN
        SET done := FALSE;
        SELECT "admin" INTO user_name;
      END IF;
      SELECT CONCAT("lb-", deploy_collection_name) INTO lb_collection_name;
      SELECT id INTO lbc_id FROM loadbalancer_collection WHERE loadbalancer_collection.name = lb_collection_name;
      IF ISNULL(lbc_id) THEN
        INSERT IGNORE INTO loadbalancer_collection (name, description, state, createTime, removeTime, removed, data)
        VALUES (lb_collection_name, "system update created", "ACTIVE", deploy_collection_time, 0, 0, CONCAT("{\"ver\":1,\"fqcn\":\"org.domeos.framework.api.model.loadBalancer.LoadBalancerCollection\",\"creatorId\":", deploy_collection_creator_id, ",\"type\":", "\"KUBE_PROXY\"}"));
        SELECT id INTO lbc_id FROM loadbalancer_collection WHERE loadbalancer_collection.name = lb_collection_name;
        INSERT IGNORE INTO operation_history (resourceId, resourceType, operation, userId, userName, status, message, operateTime)
        VALUES (lbc_id, "LOADBALANCER_COLLECTION", "SET", deploy_collection_creator_id, deploy_collection_user_name, "OK", "", cur_time);
        SET done := FALSE;
      END IF;

      INSERT IGNORE INTO collection_resource_map (resourceId, creatorId, resourceType, collectionId, updateTime)
      VALUES (lb_id, creator_id, "LOADBALANCER", lbc_id, cur_time);
      INSERT IGNORE INTO operation_history (resourceId, resourceType, operation, userId, userName, status, message, operateTime)
      VALUES (lb_id, "LOADBALANCER", "SET", creator_id, user_name, "OK", "", cur_time);

      SELECT collection_authority_map.id INTO collection_authority_id FROM collection_authority_map WHERE collection_authority_map.collectionId = lbc_id AND collection_authority_map.resourceType = "LOADBALANCER_COLLECTION" LIMIT 1;

      IF ISNULL(collection_authority_id) THEN
        SELECT role INTO user_role FROM collection_authority_map WHERE collectionId = deploy_collection_id AND resourceType = "DEPLOY_COLLECTION" LIMIT 1;
        IF ISNULL(user_role) THEN
          INSERT IGNORE INTO collection_authority_map (collectionId, resourceType, userId, role, updateTime) VALUES (lbc_id, "LOADBALANCER_COLLECTION", creator_id, "MASTER", cur_time);
          SET done := FALSE;
          ITERATE process;
        END IF;

        INSERT IGNORE INTO collection_authority_map (collectionId, resourceType, userId, role, updateTime)
          SELECT lbc_id, "LOADBALANCER_COLLECTION", collection_authority_map.userId, collection_authority_map.role, cur_time FROM collection_authority_map WHERE collectionId = deploy_collection_id AND resourceType = "DEPLOY_COLLECTION";
        SET done := FALSE;
      END IF;
      SELECT NULL INTO cluster_id;
      SELECT NULL INTO old_namespace;
      SELECT NULL INTO tempPort;
      SELECT NULL INTO targetPort;
      SELECT NULL INTO protocol;
      SELECT NULL INTO externalIP;
      SELECT NULL INTO portIndexId;
      SELECT NULL INTO deploy_id;
      SELECT NULL INTO deploy_name;
      SELECT NULL INTO deploy_collection_name;
      SELECT NULL INTO deploy_collection_creator_id;
      SELECT NULL INTO deploy_collection_user_name;
      SELECT NULL INTO deploy_status;
      SELECT NULL INTO collection_authority_id;
      SELECT NULL INTO creator_id;
      SELECT NULL INTO lbc_id;
      SELECT NULL INTO deploy_collection_id;
      SELECT NULL INTO lb_collection_name;
      SELECT NULL INTO lb_name;
      SELECT NULL INTO old_lb_name;
      SELECT NULL INTO user_name;
      SELECT NULL INTO user_role;
      SELECT NULL INTO splitSize;
      SELECT 0 INTO indx;
    END LOOP process;
    CLOSE old_lb_id;
  END;
//
DELIMITER ;
CALL update_lb();