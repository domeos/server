package org.domeos.global;


import org.domeos.util.DatabaseType;

/**
 * Created by Administrator on 2015/7/21.
 */

public class GlobalConstant {
    public static final String CLUSTER_TABLE_NAME = "cluster";
    public static final String DEPLOY_TABLE_NAME = "deployment";
    public static final String DEPLOY_COLLETION_TABLE_NAME = "deploy_collection";
    public static final String PROJECT_TABLE_NAME = "project";
    public static final String PROJECT_COLLECTION_TABLE_NAME = "project_collection";
    public static final String RSAKEYPAIR_TABLE_NAME = "rsa_keypair";
    public static final String BUILDHISTORY_TABLE_NAME = "build_history";
    public static final String UNIQPORTINDEX_TABLE_NAME = "uniq_port_index";
    public static final String CLUSTERWATHCERDEPLOYMAP_TABLE_NAME = "clusterwatcher_deploy_map";
    public static final String VERSION_TABLE_NAME = "version";
    public static final String CONFIGURATION_COLLECTION_TABLE_NAME = "configuration_collection";
    public static final String CONFIGURATION_TABLE_NAME = "configuration";
    public static final String CONFIGURATION_DEPLOY_MAP_TABLE_NAME = "configuration_deploy_map";
    public static final String GITCONFIG_TABLE_NAME = "git_config";
    
    public static DatabaseType DATABASETYPE = DatabaseType.H2;
    public static String HTTP_PREFIX = "http://";
    public static String HTTPS_PREFIX = "https://";
    public static String REGISTRY_VERSION = "/v2/";
    public static String REGISTRY_TAGLIST = "/tags/list";
    public static String REGISTRY_MANIFESTS = "/manifests/";
    public static String REGISTRY_HISTORY = "history";
    public static String REGISTRY_FSLAYERS = "fsLayers";
    public static String REGISTRY_BLOBS = "/blobs/";
    public static String REGISTRY_BLOBSUM = "blobSum";
    public static String REGISTRY_HISTORY_V1COMPATIBILITY = "v1Compatibility";
    public static String REGISTRY_HISTORY_V1COMPATIBILITY_CREATED = "created";
    public static String APPLICATION_JSON = "application/json";
    public static String CONTENT_TYPE_TEXT_JSON = "text/json";
    public static String DISK_STR = "disk";
    public static String NODE_PORT_STR = "NodePort";
    public static String CLUSTER_IP_STR = "ClusterIP";
    public static String UTC_TIME = "UTC";
    public static String HTTP_CONTENTLENGTH = "Content-Length";

    public static String DEPLOY_ID_STR = "deployId";
    public static String VERSION_STR = "version";
    public static String JOB_DEPLOY_ID_STR = "jobDeployId";
    public static String JOB_STR = "jobTime";
    public static String RC_NAME_PREFIX = "dmo-";
    public static String RC_NAME_SUFFIX = "-rc";
    public static String CONFIG_MAP_SUFFIX = "-cp";
    public static String CONFIG_MAP_ID_STR = "configurationId";
    public static String DEPLOYMENT_NAME_SUFFIX = "-deploy";
    public static String WITH_LB_PREFIX = "withLB_";
    public static String WITH_LB_VALUE = "TRUE";

    public static String BUILD_CODE_PATH = "/code";
    public static String BUILD_GENERATE_PATH= "/domeos_created_file";
    public static String NODATA_CONFIG_NAME = "domeos.agent.alive";
    public static int alarmGroupId = 1000;
    public static final int K8S_POD_COUNTS = 100;
    public static int PROJECT_LIST_SIZE = 20;

    public static String DEFAULT_NAMESPACE = "default";
    public static String SECRET_DOCKERCFG_TYPE = "kubernetes.io/dockerconfigjson";
    public static String SECRET_DOCKERCFG_DATA_KEY = ".dockerconfigjson";
    public static String REGISTRY_TOKEN = "ZG9tZW9zOmRvbWVvcw==";
    public static String REGISTRY_EMAIL = "domeos@xxx.com";
    public static String SECRET_NAME_PREFIX = "domeos-";
    public static final String LABEL_VALUE = "USER_LABEL_VALUE";

    public static int TIME_TO_LIVE_SECONDS = 3600;
    public static String SHIRO_REDIS_HOST = "SHIRO_REDIS_HOST";
    public static String SHIRO_REDIS_PORT = "SHIRO_REDIS_PORT";
    public static String SHIRO_REDIS_PASSWORD = "SHIRO_REDIS_PASSWORD";
    public static int SHIRO_REDIS_TIMEOUT = 10000;
    public static int SHIRO_REDIS_MAXTOTAL = 500;
    public static int SHIRO_REDIS_SESSION_TIMEOUT = 3600000;
    public static String DOMEOS_MYSQL_HOST = "MYSQL_HOST";
    public static String DOMEOS_MYSQL_PORT = "MYSQL_PORT";
    public static String DOMEOS_MYSQL_DB = "MYSQL_DB";
    public static String DOMEOS_MYSQL_USERNAME = "MYSQL_USERNAME";
    public static String DOMEOS_MYSQL_PASSWORD = "MYSQL_PASSWORD";
    public static String PORTAL_MYSQL_HOST = "MYSQL_PORTAL_HOST";
    public static String PORTAL_MYSQL_PORT = "MYSQL_PORTAL_PORT";
    public static String PORTAL_MYSQL_DB = "MYSQL_PORTAL_DB";
    public static String PORTAL_MYSQL_USERNAME = "MYSQL_PORTAL_USERNAME";
    public static String PORTAL_MYSQL_PASSWORD = "MYSQL_PORTAL_PASSWORD";
    public static String GRAPH_MYSQL_HOST = "MYSQL_GRAPH_HOST";
    public static String GRAPH_MYSQL_PORT = "MYSQL_GRAPH_PORT";
    public static String GRAPH_MYSQL_DB = "MYSQL_GRAPH_DB";
    public static String GRAPH_MYSQL_USERNAME = "MYSQL_GRAPH_USERNAME";
    public static String GRAPH_MYSQL_PASSWORD = "MYSQL_GRAPH_PASSWORD";

    public static String UPDATE_JOB_CONTAINER = "pub.domeos.org/rolling-updater:v0.1";
    public static String K8S_JOB_VERSION = "extensions/v1beta1";
    public static int GITLAB_PERPAGESIZE = 10;
    public static String TOMCAT_KEEPALIVETIMEOUT = "TOMCAT_KEEPALIVETIMEOUT";
    public static String TOMCAT_CONNECTIONTIMEOUT = "TOMCAT_CONNECTIONTIMEOUT";
    public static String TOMCAT_ACCEPTORTHREADCOUNT = "TOMCAT_ACCEPTORTHREADCOUNT";
    public static String TOMCAT_MAXTHREADS = "TOMCAT_MAXTHREADS";
    public static String TOMCAT_MINSPARETHREADS = "TOMCAT_MINSPARETHREADS";
    
    public static final String LOADBALANCER_TABLE_NAME = "loadbalancer";
    public static final String LOADBALANCER_COLLECTION_TABLE_NAME = "loadbalancer_collection";
    public static final String LOADBALANCERDEPLOYMAP_TABLE_NAME = "loadbalancer_deploy_map";
    public static final String LOADBALANCER_EVENT_TABLE_NAME = "loadbalancer_event";
    public static final String INGRESS_ANNOTATION_KEY = "kubernetes.io/ingress.class";
    public static final String LB_NODE_LABEL = "system_loadbalancer_value";
    public static final String LOADBALANCER_SUFFIX = "-lb";
    public static String WITH_NEWLB_PREFIX = "withlb-";
    public static String LOAD_BALANCER_ID_STR = "loadBalancerId";
    
    public static final String SSO_API="/api/ssologin";

}
