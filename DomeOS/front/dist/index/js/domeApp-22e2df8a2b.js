(function (window, undefined) {
    'use strict';
    // var domeApp = angular.module('domeApp', ['ui.router', 'ncy-angular-breadcrumb', 'angular-loading-bar', 'oc.lazyLoad', 'ngAnimate', 'pasvaz.bindonce', 'ngLocale', 'ui.bootstrap', 'ngScrollbar', 'publicModule', 'domeModule', 'deployModule', 'imageModule', 'userModule', 'projectModule']);
    window.domeApp = angular.module('domeApp', ['ui.router', 'ncy-angular-breadcrumb', 'oc.lazyLoad', 'ngAnimate', 'pasvaz.bindonce', 'ngLocale', 'ui.bootstrap', 'ngScrollbar', 'publicModule', 'domeModule', 'deployModule', 'imageModule', 'userModule', 'projectModule']);

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
            $urlRouterProvider.when('', '/projectManage');
            $stateProvider.state('projectManage', {
                    url: '/projectManage',
                    templateUrl: 'index/tpl/projectManage/projectManage.html',
                    controller: 'ProjectManageCtr',
                    ncyBreadcrumb: {
                        label: '项目管理'
                    }
                })
                .state('createProject/1', {
                    url: '/createProject/1',
                    templateUrl: 'index/tpl/createProject1/createProject1.html',
                    controller: 'CreateProjectCtr1',
                    ncyBreadcrumb: {
                        label: '新建项目',
                        parent: 'projectManage'
                    }
                })
                .state('createProject/2', {
                    url: '/createProject/2',
                    templateUrl: 'index/tpl/createProject2/createProject2.html',
                    controller: 'CreateProjectCtr2',
                    ncyBreadcrumb: {
                        label: '新建项目',
                        parent: 'projectManage'
                    }
                })
                .state('projectDetail', {
                    url: '/projectDetail/:project',
                    templateUrl: 'index/tpl/projectDetail/projectDetail.html',
                    controller: 'ProjectDetailCtr',
                    ncyBreadcrumb: {
                        label: '项目详情',
                        parent: 'projectManage'
                    },
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('/lib/js/jquery-a482e1500f.zclip.js');
                        }]
                    }
                })
                .state('projectDetail.info', {
                    url: '/info',
                    ncyBreadcrumb: {
                        label: '项目详情',
                        parent: 'projectManage'
                    }
                }).state('projectDetail.config', {
                    url: '/config',
                    ncyBreadcrumb: {
                        label: '项目详情',
                        parent: 'projectManage'
                    }
                }).state('projectDetail.autobuild', {
                    url: '/autobuild',
                    ncyBreadcrumb: {
                        label: '项目详情',
                        parent: 'projectManage'
                    }
                }).state('projectDetail.buildlog', {
                    url: '/buildlog',
                    ncyBreadcrumb: {
                        label: '项目详情',
                        parent: 'projectManage'
                    }
                }).state('projectDetail.user', {
                    url: '/user',
                    ncyBreadcrumb: {
                        label: '项目详情',
                        parent: 'projectManage'
                    }
                })
                .state('deployManage', {
                    url: '/deployManage',
                    templateUrl: 'index/tpl/deployManage/deployManage.html',
                    controller: 'DeployManageCtr',
                    ncyBreadcrumb: {
                        label: '部署'
                    }
                }).state('createDeploy/1', {
                    url: '/createDeploy/1',
                    templateUrl: 'index/tpl/createDeploy1/createDeploy1.html',
                    controller: 'CreateDeployCtr1',
                    ncyBreadcrumb: {
                        label: '新建部署',
                        parent: 'deployManage'
                    }
                }).state('createDeploy/2', {
                    url: '/createDeploy/2',
                    templateUrl: 'index/tpl/createDeploy2/createDeploy2.html',
                    controller: 'CreateDeployCtr2',
                    ncyBreadcrumb: {
                        label: '新建部署',
                        parent: 'deployManage'
                    }
                }).state('deployDetail', {
                    url: '/deployDetail/:id',
                    templateUrl: 'index/tpl/deployDetail/deployDetail.html',
                    controller: 'DeployDetailCtr',
                    ncyBreadcrumb: {
                        label: '部署详情',
                        parent: 'deployManage'
                    }
                }).state('deployDetail.detail', {
                    url: '/detail',
                    ncyBreadcrumb: {
                        label: '部署详情',
                        parent: 'deployManage'
                    }
                }).state('deployDetail.update', {
                    url: '/update',
                    ncyBreadcrumb: {
                        label: '部署详情',
                        parent: 'deployManage'
                    }
                }).state('deployDetail.event', {
                    url: '/event',
                    ncyBreadcrumb: {
                        label: '部署详情',
                        parent: 'deployManage'
                    }
                }).state('deployDetail.instance', {
                    url: '/instance',
                    ncyBreadcrumb: {
                        label: '部署详情',
                        parent: 'deployManage'
                    }
                }).state('deployDetail.network', {
                    url: '/network',
                    ncyBreadcrumb: {
                        label: '部署详情',
                        parent: 'deployManage'
                    }
                }).state('deployDetail.user', {
                    url: '/user',
                    ncyBreadcrumb: {
                        label: '部署详情',
                        parent: 'deployManage'
                    }
                }).state('groupManage', {
                    url: '/groupManage',
                    templateUrl: 'index/tpl/groupManage/groupManage.html',
                    controller: 'GroupManageCtr',
                    ncyBreadcrumb: {
                        label: '组管理'
                    }
                }).state('createGroup', {
                    url: '/createGroup',
                    templateUrl: 'index/tpl/createGroup/createGroup.html',
                    controller: 'CreateGroupCtr',
                    ncyBreadcrumb: {
                        label: '新建组',
                        parent: 'groupManage'
                    }
                }).state('groupDetail', {
                    url: '/groupDetail/:id',
                    templateUrl: 'index/tpl/groupDetail/groupDetail.html',
                    controller: 'GroupDetailCtr',
                    ncyBreadcrumb: {
                        label: '组详情',
                        parent: 'groupManage'
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
                }).state('imageManage', {
                    url: '/image',
                    templateUrl: 'index/tpl/imageManage/imageManage.html',
                    controller: 'ImageManageCtr',
                    ncyBreadcrumb: {
                        label: '镜像管理'
                    }
                }).state('imageManage.baseimages', {
                    url: '/baseimages',
                    templateUrl: 'index/tpl/imageManage/imageManage.html',
                    ncyBreadcrumb: {
                        label: '镜像管理'
                    }
                }).state('imageManage.projectimages', {
                    url: '/projectimages',
                    templateUrl: 'index/tpl/imageManage/imageManage.html',
                    ncyBreadcrumb: {
                        label: '镜像管理'
                    }
                }).state('imageManage.otherimages', {
                    url: '/otherimages',
                    ncyBreadcrumb: {
                        label: '镜像管理'
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
                        label: '报警',
                        parent: 'monitor'
                    }
                }).state('alarm.templates', {
                    url: '/templates',
                    templateUrl: 'index/tpl/alarm/tabTemplates/tabTemplates.html',
                    controller: 'TabAlarmTemplatesCtr as vmTemplate',
                    ncyBreadcrumb: {
                        label: '报警',
                        parent: 'monitor'
                    }
                }).state('alarm.hostgroups', {
                    url: '/hostgroups',
                    templateUrl: 'index/tpl/alarm/tabHostGroups/tabHostGroups.html',
                    controller: 'TabHostGroupsCtr as vmHostGroup',
                    ncyBreadcrumb: {
                        label: '报警',
                        parent: 'monitor'
                    }
                }).state('alarm.currentAlarms', {
                    url: '/currentAlarms',
                    templateUrl: 'index/tpl/alarm/tabCurrentAlarms/tabCurrentAlarms.html',
                    controller: 'TabAlarmCurrentAlarmsCtr as vmAlarm',
                    ncyBreadcrumb: {
                        label: '报警',
                        parent: 'monitor'
                    }
                }).state('alarm.group', {
                    url: '/group',
                    templateUrl: 'index/tpl/alarm/tabGroup/tabGroup.html',
                    controller: 'TabGroupCtr as vmGroup',
                    ncyBreadcrumb: {
                        label: '报警',
                        parent: 'monitor'
                    }
                }).state('createAlarmTemplate', {
                    url: '/createAlarmTemplate',
                    templateUrl: 'index/tpl/createAlarmTemplate/createAlarmTemplate.html',
                    controller: 'CreateAlarmTemplateCtr',
                    ncyBreadcrumb: {
                        label: '新建模板',
                        parent: 'alarm.templates'
                    }
                }).state('alarmTemplateDetail', {
                    url: '/template/:id',
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
                        parent: 'alarm.templates'
                    }
                });
        }])
        .config(['$compileProvider', function ($compileProvider) {
            $compileProvider.debugInfoEnabled(false);
        }]);
})(window);