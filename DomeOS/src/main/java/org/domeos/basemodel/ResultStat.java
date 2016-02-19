package org.domeos.basemodel;

import org.springframework.util.StringUtils;

/**
 */
public enum ResultStat {
    /**
     * if you need new result code, add it here and give it a good name
     */
    OK(200),
    SERVER_INTERNAL_ERROR(500),

    PARAM_ERROR(400),

    FORBIDDEN(403),

    RESOURCE_NOT_EXIST(404),

    RESOURCE_NOT_ENOUGH(500),

    NODE_NOT_REGISTERD(404),

    KUBE_EXCEPTION(600),

    // cluster related
    CLUSTER_ALREADY_EXIST(1000),
    CANNOT_DELETE_CLUSTER(1001),
    CANNOT_UPDATE_CLUSTER(1002),

    // project related
    PROJECT_EXISTED(1100),
    PROJECT_NOT_EXIST(1101),
    PROJECT_NOT_LEGAL(1102),
    CANNOT_DELETE_PROJECT(1103),
    PROJECT_CODE_INFO_NOT_EXIST(1104),

    // deployment related
    DEPLOYMENT_NOT_LEGAL(1200),
    DEPLOYMENT_NOT_EXIST(1201),
    CANNOT_DELETE_DEPLOYMENT(1202),
    DEPLOYMENT_EXIST(1203),
    DEPLOYMENT_STOP_FAILED(1204),
    DEPLOYMENT_START_FAILED(1205),
    DEPLOYMENT_GETVERSION_FAILED(1206),

    // version related
    VERSION_NOT_EXIST(1300),
    CANNOT_DELETE_VERSION(1301),

    // build related
    BUILD_NOT_EXIST(1400),
    BUILD_GET_VALUE_ERROR(1401),
    BUILD_EXISTED(1402),
    DOCKERFILE_NOT_EXIST(1403),
    BUILD_INFO_NOT_EXIST(1404),
    BUILD_INFO_NOT_MATCH(1405),
    REGISTRY_NOT_EXIST(1406),

    // base image related
    BASE_IMAGE_MAPPING_ERROR(1500),
    BASE_IMAGE_ERROR(1501),
    BASE_IMAGE_ALREADY_EXIST(1502),

    // sshkey related
    DO(1600),
    SSHKEY_NOT_EXIST(1601),

    // deploymentRuntime related
    DEPLOYMENTRUNTIME_NOT_EXIST(1701),

    // instance related
    INSTANCE_NOT_EXIST(1801),

    DEPLOYMENTINFO_NOT_EXIST(1801),

    // git related
    GITLAB_INFO_NOT_EXIST(1901),
    GITLAB_GLOBAL_INFO_NOT_EXIST(1902),
    GITLAB_COMMIT_NOT_FOUND(1903),
    GIT_INFO_ALREADY_EXIST(1904),

    // auth user related
    USER_EXISTED(2000),
    USER_NOT_EXIST(2001),
    USER_NOT_AUTHORIZED(2002),
    USER_NOT_LEGAL(2003),
    USER_LIST_EMPTY(2004),
    // auth group related
    GROUP_EXISTED(2030),
    GROUP_NOT_EXIST(2031),
    GROUP_NOT_AUTHORIZED(2032),
    GROUP_NOT_LEGAL(2033),
    GROUP_LIST_EMPTY(2034),
    // group member related
    GROUP_MEMBER_FAILED(2050),
    GROUP_MEMBER_LIST_EMPTY(2051),
    // resource
    NAMESPACE_FAILED(2060),

    // deployment update related
    DEPLOYMENT_UPDATE_FAILED(2100),

    // deployment scale related
    DEPLOYMENT_SCALE_NO_RC_FOUND(2200),
    DEPLOYMENT_SCALE_BAD_RC_FOUND(2201),

    MAX(9999);
    //!!----------------do not modify code below------------------!!
    public final int responseCode;

    public <T> HttpResponseTemp<T> wrap(T data) {
        return wrap(data, null);
    }

    /**
     * wrap the result with a result code and result message
     * @param data result data
     * @param msg result message
     * @param <T> result type
     * @return
     */
    public <T> HttpResponseTemp<T> wrap(T data, String msg) {
        String message = this.name();
        if (!StringUtils.isEmpty(msg)) {
            message = message + ":" + msg;
        }
        return new HttpResponseTemp<>(data, this, message);
    }

    private ResultStat(int code) {
        this.responseCode = code;
    }
}
