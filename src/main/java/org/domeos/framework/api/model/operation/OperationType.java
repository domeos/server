package org.domeos.framework.api.model.operation;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
public enum OperationType {
    SET,
    MODIFY,
    GET,
    DELETE,
    BUILD,
    ADDUSER,
    MODIFYUSER,
    GETUSER,
    DELETEUSER,
    ADDGROUPMEMBER,
    MODIFYGROUPMEMBER,
    DELETEGROUPMEMBER,
    LISTGROUPMEMBER,
    SCALEUP,
    SCALEDOWN,
    START,
    STOP,
    UPDATE,
    ROLLBACK,
    ABORT, 
    DELETEINSTANCE
}
