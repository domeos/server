package org.domeos.framework.api.model.collection.related;

import org.domeos.global.GlobalConstant;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
public enum ResourceType {
    PROJECT_COLLECTION(GlobalConstant.PROJECT_COLLECTION_TABLE_NAME),
    DEPLOY_COLLECTION(GlobalConstant.DEPLOY_COLLETION_TABLE_NAME),
    PROJECT(GlobalConstant.PROJECT_TABLE_NAME),
    CUSTOM(""),
    CLUSTER(GlobalConstant.CLUSTER_TABLE_NAME),
    DEPLOY(GlobalConstant.DEPLOY_TABLE_NAME),
    ALARM(""),
    GITLAB(""),
    LDAP(""),
    SUBVERSION("");

    private String tableName;

    ResourceType(String tableName) {
        this.tableName = tableName;
    }

    public String getTableName() {
        return tableName;
    }

    public ResourceType setTableName(String tableName) {
        this.tableName = tableName;
        return this;
    }
}