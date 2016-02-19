package org.domeos.api.model.user;

/**
 * Created by zhenfengchen on 15-11-29.
 */
public enum OperationType {
    SET("SET"),
    MODIFY("MODIFY"),
    GET("GET"),
    DELETE("DELETE"),
    BUILD("BUILD"),
    ADDUSER("ADDUSER"),
    MODIFYUSER("MODIFYUSER"),
    GETUSER("GETUSER"),
    DELETEUSER("DELETEUSER"),
    ADDGROUPMEMBER("ADDGROUPMEMBER"),
    MODIFYGROUPMEMBER("MODIFYGROUPMEMBER"),
    DELETEGROUPMEMBER("DELETEGROUPMEMBER"),
    LISTGROUPMEMBER("LISTGROUPMEMBER");

    public final String operation;
    private OperationType(String operation) {
        this.operation = operation;
    }
    public String getOperation() {
        return operation;
    }
}
