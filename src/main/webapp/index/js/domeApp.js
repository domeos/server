/*
 * @author ChandraLee
 * @description 控制台页面入口，初始化app
 */

(function (window, undefined) {
    'use strict';
    // var domeApp = angular.module('domeApp', ['ui.router', 'ncy-angular-breadcrumb', 'angular-loading-bar', 'oc.lazyLoad', 'ngAnimate', 'pasvaz.bindonce', 'ngLocale', 'ui.bootstrap', 'ngScrollbar', 'publicModule', 'domeModule', 'deployModule', 'imageModule', 'userModule', 'projectModule']);
    window.domeApp = angular.module('domeApp', [
      'ui.router',
      'ncy-angular-breadcrumb',
      'oc.lazyLoad',
      'ngAnimate',
      'pasvaz.bindonce',
      'ngLocale',
      'ui.bootstrap',
      'ngScrollbar',
      'publicModule',
      'domeModule',
      'deployModule',
      'imageModule',
      'userModule',
      'projectModule',
      'ngclipboard',
      'ngCookies',
      'pageLayout',
      'formInputs',
      'backendApi',
      'commonFilters',
    ]);

    domeApp.run(['$rootScope', '$document', function ($rootScope, $document) {
        // 修改页面title，采用ng-bind的方法会使页面闪烁
        $rootScope.$on('pageTitle', function (event, msg) {
            if (msg.title && msg.title !== '') {
                $('title').html('DomeOS-' + msg.title);
            }
        });
        $rootScope.$on('$stateChangeStart', function () {
            angular.element($document).scrollTop(0);
        });
    }]);

    domeApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.when('', '/overview');
            $stateProvider.state('overview', {
            		url: '/overview',
            		templateUrl: 'index/tpl/overview/overview.html',
            		controller: 'OverviewCtr',
            		ncyBreadcrumb: {
                    label: '总览'
                }
            	}).state('projectCollectionManage', {
            		url: '/projectCollectionManage',
            		templateUrl: 'index/tpl/projectCollectionManage/projectCollectionManage.html',
            		controller: 'ProjectCollectionManageCtr',
            		ncyBreadcrumb: {
                        label: '项目管理'
                    }
            	}).state('createProjectCollection', {
            		url: '/createProjectCollection',
            		templateUrl: 'index/tpl/createProjectCollection/createProjectCollection.html',
            		controller: 'CreateProjectCollectionCtr',
            		ncyBreadcrumb: {
            			label: '新建项目',
            			parent: 'projectCollectionManage'
            		}
            	}).state('projectManage', {
                    url: '/projectManage/:id',
                    templateUrl: 'index/tpl/projectManage/projectManage.html',
                    controller: 'ProjectManageCtr',
                    ncyBreadcrumb: {
                        label: '{{projectCollectionName}}',
                        parent:'projectCollectionManage'
                    }
                }).state('projectManage.project', {
                    url: '/project',
                    templateUrl: 'index/tpl/projectManage/projectManage.html',
                    ncyBreadcrumb: {
                        label: '{{projectCollectionName}}',
                        parent:'projectCollectionManage'
                    }
                }).state('projectManage.user', {
                    url: '/user',
                    templateUrl: 'index/tpl/projectManage/projectManage.html',
                    controller: 'ProjectManageCtr',
                    ncyBreadcrumb: {
                        label: '{{projectCollectionName}}',
                        parent:'projectCollectionManage'
                    }
                }).state('createProject/1', {
                    url: '/createProject/1/:projectCollectionId',
                    templateUrl: 'index/tpl/createProject1/createProject1.html',
                    controller: 'CreateProjectCtr1',
                    ncyBreadcrumb: {
                        label: '新建工程',
                        parent: function($scope){
                            return $scope.parentState;
                        }
                    }
                }).state('createProject/2', {
                    url: '/createProject/2/:projectCollectionId',
                    templateUrl: 'index/tpl/createProject2/createProject2.html',
                    controller: 'CreateProjectCtr2',
                    ncyBreadcrumb: {
                        label: '新建工程',
                         parent: function($scope){
                            return $scope.parentState;
                        }
                    }
                }).state('projectDetail', {
                    url: '/projectDetail/:projectCollectionId/:project',
                    templateUrl: 'index/tpl/projectDetail/projectDetail.html',
                    controller: 'ProjectDetailCtr',
                    ncyBreadcrumb: {
                        label: '工程详情',
                        parent: function ($scope) {
                            return $scope.parentState;
                        }
                    },
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('/lib/js/jquery.zclip.js');
                        }]
                    }
                }).state('projectDetail.info', {
                    url: '/info',
                    ncyBreadcrumb: {
                        label: '工程详情',
                        parent: function ($scope) {
                            return $scope.parentState;
                        }
                    }
                }).state('projectDetail.config', {
                    url: '/config',
                    ncyBreadcrumb: {
                        label: '工程详情',
                        parent: function ($scope) {
                            return $scope.parentState;
                        }
                    }
                }).state('projectDetail.autobuild', {
                    url: '/autobuild',
                    ncyBreadcrumb: {
                        label: '工程详情',
                       parent: function ($scope) {
                            return $scope.parentState;
                        }
                    }
                }).state('projectDetail.buildlog', {
                    url: '/buildlog',
                    ncyBreadcrumb: {
                        label: '工程详情',
                        parent: function ($scope) {
                            return $scope.parentState;
                        }
                    }
                }).state('projectDetail.user', {
                    url: '/user',
                    ncyBreadcrumb: {
                        label: '工程详情',
                        parent: function ($scope) {
                            return $scope.parentState;
                        }
                    }
                }).state('deployCollectionManage', {
                    url: '/deployCollectionManage',
                    templateUrl: 'index/tpl/deployCollectionManage/deployCollectionManage.html',
                    controller: 'DeployCollectionManageCtr',
                    ncyBreadcrumb: {
                        label: '服务'
                    }
                }).state('createDeployCollection', {
                    url: '/createDeployCollection',
                    templateUrl: 'index/tpl/createDeployCollection/createDeployCollection.html',
                    controller: 'CreateDeployCollectionCtr',
                    ncyBreadcrumb: {
                        label: '新建服务',
                        parent: 'deployCollectionManage'
                    }
                }).state('deployAllManage', {
                    url: '/deployAllManage/:id/:name',
                    templateUrl: 'index/tpl/deployManage/deployManageAll.html',
                    controller: 'DeployManageCtr',
                    ncyBreadcrumb: {
                        label: '所有部署',
                        parent: 'deployCollectionManage'
                    }
                }).state('deployManage', {
                    url: '/deployManage/:id/:name',
                    templateUrl: 'index/tpl/deployManage/deployManage.html',
                    controller: 'DeployManageCtr',
                    ncyBreadcrumb: {
                        label: '{{collectionName}}',
                        parent: 'deployCollectionManage'
                    }
                }).state('deployManage.deploy', {
                    url: '/deploy',
                    templateUrl: 'index/tpl/deployManage/deployManage.html',
                    ncyBreadcrumb: {
                        label: '{{collectionName}}',
                        parent: 'deployCollectionManage'
                    }
                }).state('deployManage.user', {
                    url: '/user',
                    templateUrl: 'index/tpl/deployManage/deployManage.html',
                    controller: 'DeployManageCtr',
                    ncyBreadcrumb: {
                        label: '{{collectionName}}',
                        parent: 'deployCollectionManage'
                    }
                }).state('createDeployCommon', {
                    url: '/createDeployCommon/:collectionId/:collectionName',
                    templateUrl: 'index/tpl/createDeployCommon/createDeployCommon.html',
                    controller: 'CreateDeployCommonCtr',
                    ncyBreadcrumb: {
                        label: '新建部署',
                        parent: function($scope){
                            return $scope.parentState;
                        }
                    }
                }).state('createDeployRaw', {
                    url: '/createDeployRaw/:collectionId/:collectionName',
                    templateUrl: 'index/tpl/createDeployRaw/createDeployRaw.html',
                    controller: 'CreateDeployRawCtr',
                    ncyBreadcrumb: {
                        label: '新建部署',
                        parent: function($scope){
                            return $scope.parentState;
                        }
                    }
                }).state('createDeployImage', {
                  url: '/createDeployImage/:collectionId/:collectionName',
                  templateUrl: 'index/tpl/createDeployImage/createDeployImage.html',
                  controller: 'CreateDeployImageCtr',
                  ncyBreadcrumb: {
                    label: '新建部署',
                    parent: function ($scope) {
                      return $scope.parentState;
                    }
                  }
                }).state('createDeployDetail', {
                    url: '/createDeployDetail/:collectionId/:collectionName',
                    templateUrl: 'index/tpl/createDeployDetail/createDeployDetail.html',
                    controller: 'CreateDeployDetailCtr',
                    ncyBreadcrumb: {
                        label: '新建部署',
                        parent: function($scope){
                            return $scope.parentState;
                        }
                    }
                }).state('deployDetail', {
                    url: '/deployDetail/:id/:collectionId/:collectionName',
                    templateUrl: 'index/tpl/deployDetail/deployDetail.html',
                    controller: 'DeployDetailCtr',
                    ncyBreadcrumb: {
                        label: '{{deployName}}',
                        parent: function($scope){
                            return $scope.parentState;
                        }
                    }
                }).state('deployDetail.detail', {
                    url: '/detail',
                    ncyBreadcrumb: {
                        label: '{{deployName}}',
                        parent: function($scope){
                            return $scope.parentState;
                        }
                    }
                }).state('deployDetail.update', {
                    url: '/update',
                    ncyBreadcrumb: {
                        label: '{{deployName}}',
                        parent: function($scope){
                            return $scope.parentState;
                        }
                    }
                }).state('deployDetail.event', {
                    url: '/event',
                    ncyBreadcrumb: {
                        label: '{{deployName}}',
                        parent: function($scope){
                            return $scope.parentState;
                        }
                    }
                }).state('deployDetail.instance', {
                    url: '/instance',
                    ncyBreadcrumb: {
                        label: '{{deployName}}',
                        parent: function($scope){
                            return $scope.parentState;
                        }
                    }
                }).state('deployDetail.network', {
                    url: '/network',
                    ncyBreadcrumb: {
                        label: '{{deployName}}',
                        parent: function($scope){
                            return $scope.parentState;
                        }
                    }
                }).state('clusterManage', {
                    url: '/clusterManage',
                    templateUrl: 'index/tpl/clusterManage/clusterManage.html',
                    controller: 'ClusterManageCtr',
                    ncyBreadcrumb: {
                        label: '集群管理'
                    }
                }).state('createCluster', {
                    url: '/createCluster',
                    templateUrl: 'index/tpl/createCluster/createCluster.html',
                    controller: 'CreateClusterCtr',
                    ncyBreadcrumb: {
                        label: '新建集群',
                        parent: 'clusterManage'
                    }
                }).state('clusterDetail', {
                    url: '/clusterDetail/:id',
                    templateUrl: 'index/tpl/clusterDetail/clusterDetail.html',
                    controller: 'ClusterDetailCtr',
                    ncyBreadcrumb: {
                        label: '集群详情',
                        parent: 'clusterManage'
                    }
                }).state('clusterDetail.hostlist', {
                    url: '/hostlist',
                    ncyBreadcrumb: {
                        label: '集群详情',
                        parent: 'clusterManage'
                    }
                }).state('clusterDetail.info', {
                    url: '/info',
                    ncyBreadcrumb: {
                        label: '集群详情',
                        parent: 'clusterManage'
                    }
                }).state('clusterDetail.namespace', {
                    url: '/namespace',
                    ncyBreadcrumb: {
                        label: '集群详情',
                        parent: 'clusterManage'
                    }
                }).state('clusterDetail.users', {
                    url: '/users',
                    ncyBreadcrumb: {
                        label: '集群详情',
                        parent: 'clusterManage'
                    }
                }).state('clusterDetail.instances', {
                    url: '/instances',
                    ncyBreadcrumb: {
                        label: '集群详情',
                        parent: 'clusterManage'
                    }
                }).state('hostDetail', {
                    url: '/hostDetail/:clusterId/:name',
                    templateUrl: 'index/tpl/hostDetail/hostDetail.html',
                    controller: 'HostDetailCtr',
                    ncyBreadcrumb: {
                        label: '主机详情',
                        parent: function ($scope) {
                            return $scope.parentState;
                        }
                    }
                }).state('hostDetail.instancelist', {
                    url: '/instancelist',
                    ncyBreadcrumb: {
                        label: '主机详情',
                        parent: function ($scope) {
                            return $scope.parentState;
                        }
                    }
                }).state('hostDetail.info', {
                    url: '/info',
                    ncyBreadcrumb: {
                        label: '主机详情',
                        parent: function ($scope) {
                            return $scope.parentState;
                        }
                    }
                }).state('monitor', {
                    url: '/monitor',
                    templateUrl: 'index/tpl/monitor/monitor.html',
                    controller: 'MonitorCtr',
                    ncyBreadcrumb: {
                        label: '监控'
                    }
                }).state('imageCollectionManage', {
                    url: '/imageCollectionManage',
                    templateUrl: 'index/tpl/imageCollectionManage/imageCollectionManage.html',
                    controller: 'ImageCollectionManageCtr',
                    ncyBreadcrumb: {
                        label: '镜像管理'
                    }
                }).state('imageCollectionManage.baseimages', {
                    url: '/baseimages',
                    templateUrl: 'index/tpl/imageCollectionManage/imageCollectionManage.html',
                    ncyBreadcrumb: {
                        label: '镜像管理'
                    }
                }).state('imageCollectionManage.proimages', {
                    url: '/proimages',
                    templateUrl: 'index/tpl/imageCollectionManage/imageCollectionManage.html',
                    ncyBreadcrumb: {
                        label: '镜像管理'
                    }
                }).state('imageCollectionManage.publicimages', {
                    url: '/publicimages',
                    templateUrl: 'index/tpl/imageCollectionManage/imageCollectionManage.html',
                    ncyBreadcrumb: {
                        label: '镜像管理'
                    }
                }).state('publicImageDetail', {
                    url: '/publicImageDetail/:name/:page',
                    params: {
                      page: { value: null, squash: true, dynamic: true },
                    },
                    templateUrl: 'index/tpl/publicImageDetail/publicImageDetail.html',
                    ncyBreadcrumb: {
                      parent: 'imageCollectionManage.publicimages',
                      label: '官方仓库'
                    }
                }).state('imageCollectionManage.otherimages', {
                    url: '/otherimages',
                    ncyBreadcrumb: {
                        label: '镜像管理'
                    }
                }).state('otherImagesManage', {
                    url: '/otherImagesManage',
                    templateUrl: 'index/tpl/imagesManage/imagesManage.html',
                    controller: 'ImagesManageCtr',
                    params:{args:{}},
                    ncyBreadcrumb: {
                        label: '其他镜像',
                        parent: 'imageCollectionManage'
                    }
                }).state('projImagesManage', {
                    url: '/projImagesManage',
                    templateUrl: 'index/tpl/imagesManage/imagesManage.html',
                    controller: 'ImagesManageCtr',
                    params:{args:{}},
                    ncyBreadcrumb: {
                        label: '{{collectionName}}镜像',
                        parent: 'imageCollectionManage'
                    }
                }).state('mirrorCustom', {
                    url: '/mirrorCustom',
                    templateUrl: 'index/tpl/mirrorCustom/mirrorCustom.html',
                    controller: 'MirrorCustomCtr',
                    ncyBreadcrumb: {
                        label: '镜像定制',
                        parent: 'imageManage'
                    }
                }).state('mirrorCustom.log', {
                    url: '/log',
                    ncyBreadcrumb: {
                        label: '镜像定制',
                        parent: 'imageManage'
                    }
                }).state('globalSetting', {
                    url: '/globalSetting',
                    templateUrl: 'index/tpl/globalSetting/globalSetting.html',
                    controller: 'GlobalSettingCtr as vm',
                    ncyBreadcrumb: {
                        label: '全局配置'
                    }
                }).state('globalSetting.userinfo', {
                    url: '/userinfo',
                    ncyBreadcrumb: {
                        label: '全局配置'
                    }
                }).state('globalSetting.ldapinfo', {
                    url: '/ldapinfo',
                    ncyBreadcrumb: {
                        label: '全局配置'
                    }
                }).state('globalSetting.gitinfo', {
                    url: '/gitinfo',
                    ncyBreadcrumb: {
                        label: '全局配置'
                    }
                }).state('globalSetting.registryinfo', {
                    url: '/registryinfo',
                    ncyBreadcrumb: {
                        label: '全局配置'
                    }
                }).state('globalSetting.serverinfo', {
                    url: '/serverinfo',
                    ncyBreadcrumb: {
                        label: '全局配置'
                    }
                }).state('globalSetting.monitorinfo', {
                    url: '/monitorinfo',
                    ncyBreadcrumb: {
                        label: '全局配置'
                    }
                }).state('globalSetting.sshinfo', {
                    url: '/sshinfo',
                    ncyBreadcrumb: {
                        label: '全局配置'
                    }
                }).state('globalSetting.clusterinfo', {
                    url: '/clusterinfo',
                    ncyBreadcrumb: {
                        label: '全局配置'
                    }
                }).state('addHost', {
                    url: '/addHost/:id',
                    templateUrl: 'index/tpl/addHost/addHost.html',
                    controller: 'AddHostCtr',
                    ncyBreadcrumb: {
                        label: '添加主机',
                        parent: function ($scope) {
                            return $scope.parentState;
                        }
                    }
                }).state('createAppDeploy', {
                    url: '/createDeploy/app/:appName',
                    templateUrl: 'index/tpl/createAppDeploy/createAppDeploy.html',
                    controller: 'CreateAppDeployCtr',
                    ncyBreadcrumb: {
                        label: '应用部署',
                        parent: 'appStore'
                    }
                }).state('appStore', {
                    url: '/appStore',
                    templateUrl: 'index/tpl/appStore/appStore.html',
                    controller: 'AppStoreCtr',
                    ncyBreadcrumb: {
                        label: '应用商店'
                    }
                }).state('alarm', {
                    url: '/alarm',
                    templateUrl: 'index/tpl/alarm/alarm.html',
                    controller: 'AlarmCtr as vm',
                    ncyBreadcrumb: {
                        label: '报警'
                    }
                }).state('alarm.templates', {
                    url: '/templates',
                    templateUrl: 'index/tpl/alarm/tabTemplates/tabTemplates.html',
                    controller: 'TabAlarmTemplatesCtr as vmTemplate',
                    ncyBreadcrumb: {
                        label: '报警模板'
                    }
                }).state('alarm.nodegroups', {
                    url: '/nodegroups',
                    templateUrl: 'index/tpl/alarm/tabHostGroups/tabHostGroups.html',
                    controller: 'TabHostGroupsCtr as vmHostGroup',
                    ncyBreadcrumb: {
                        label: '主机组'
                    }
                }).state('alarm.currentAlarms', {
                    url: '/currentAlarms',
                    templateUrl: 'index/tpl/alarm/tabCurrentAlarms/tabCurrentAlarms.html',
                    controller: 'TabAlarmCurrentAlarmsCtr as vmAlarm',
                    ncyBreadcrumb: {
                        label: '未恢复报警'
                    }
                }).state('alarm.group', {
                    url: '/group',
                    templateUrl: 'index/tpl/alarm/tabGroup/tabGroup.html',
                    controller: 'TabGroupCtr as vmGroup',
                    ncyBreadcrumb: {
                        label: '报警组'
                    }
                }).state('alarm.usergroup', {
                    url: '/usergroup',
                    templateUrl: 'index/tpl/alarm/tabUserGroup/tabUserGroup.html',
                    controller: 'TabUserGroupCtr',
                    ncyBreadcrumb: {
                        label: '用户组'
                    }
                }).state('createAlarmTemplate', {
                    url: '/createAlarmTemplate',
                    templateUrl: 'index/tpl/createAlarmTemplate/createAlarmTemplate.html',
                    controller: 'CreateAlarmTemplateCtr',
                    ncyBreadcrumb: {
                        label: '新建模板',
                        parent: 'alarm.templates'
                    }
                }).state('alarmUserGroupDetail', {
                    url: '/alarmUserGroupDetail/:id',
                    templateUrl: 'index/tpl/tplAlarmUserGroupDetail/tplAlarmUserGroupDetail.html',
                    controller: 'TplAlarmUserGroupDetailCtr',
                    ncyBreadcrumb: {
                        label: '用户组详情',
                        parent: 'alarm.usergroup'
                    }
                }).state('alarmTemplateDetail', {
                    url: '/alarmTemplateDetail/:id',
                    templateUrl: 'index/tpl/alarmTemplateDetail/alarmTemplateDetail.html',
                    controller: 'AlarmTemplateDetailCtr',
                    ncyBreadcrumb: {
                        label: '模板详情',
                        parent: 'alarm.templates'
                    }
                }).state('alarmAddHosts', {
                    url: '/alarmAddHosts/:id/:name',
                    templateUrl: 'index/tpl/alarmAddHosts/alarmAddHosts.html',
                    controller: 'AlarmAddHostsCtr as vm',
                    ncyBreadcrumb: {
                        label: '添加主机',
                        parent: 'alarm.nodegroups'
                    }
                });
        }])
        .config(['$compileProvider', '$qProvider',function ($compileProvider, $qProvider) {
            $compileProvider.debugInfoEnabled(false);
            $qProvider.errorOnUnhandledRejections(false);
        }])
        .config(['$provide', function ($provide) {
            // Set a suffix outside the decorator function
            // from: http://stackoverflow.com/questions/23589843/disable-template-caching-in-angularjs-with-ui-router
            var cacheBuster = window.VERSION_HASH  || Date.now().toString();

            function templateFactoryDecorator($delegate) {
                var fromUrl = angular.bind($delegate, $delegate.fromUrl);
                $delegate.fromUrl = function (url, params) {
                    if (url !== null && angular.isDefined(url) && angular.isString(url)) {
                        url += (url.indexOf("?") === -1 ? "?" : "&");
                        url += "v=" + cacheBuster;
                    }

                    return fromUrl(url, params);
                };

                return $delegate;
            }

            $provide.decorator('$templateFactory', ['$delegate', templateFactoryDecorator]);
        }]);

})(window);
