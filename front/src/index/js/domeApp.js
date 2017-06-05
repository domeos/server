/*
 * @author ChandraLee
 * @description 控制台页面入口，初始化app
 */

(function (window) {
  'use strict';

  var domeApp = angular.module('domeApp', [
    'ui.router',
    'ncy-angular-breadcrumb',
    'oc.lazyLoad',
    'ngAnimate',
    'pasvaz.bindonce',
    'ngLocale',
    'ui.bootstrap',
    'publicModule',
    'domeModule',
    'deployModule',
    'imageModule',
    'userModule',
    'projectModule',
    'ngclipboard',
    'ngCookies',
    'pageLayout',
    'commonDialogs',
    'constant',
    'formInputs',
    'backendApi',
    'commonFilters',
  ]);

  domeApp.run(['$rootScope', '$document', function ($rootScope, $document) {
    // 修改页面title，采用ng-bind的方法会使页面闪烁
    $rootScope.$on('pageTitle', function (event, msg) {
      if (msg.title && msg.title !== '') {
        $('title').html(msg.title + ' - DomeOS');
      }
    });
    $rootScope.$on('$stateChangeStart', function () {
      angular.element($document).scrollTop(0);
    });
  }]);

  domeApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    // 设置首页
    $urlRouterProvider.when('', '/overview');

    // 公用的加载文件用
    var loadFiles = function (files) {
      if (!Array.isArray(files)) files = [files];
      // 向链接中加入 versionhash 来解决冲突问题
      files = files.map(file => {
        let a = document.createElement('a');
        a.href = file;
        a.search = 'version=' + window.VERSION_HASH;
        return a.href;
      });
      return {
        loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load([{ files: files }]).then(function (value) {
            return value;
          });
        }]
      };
    };

    // 用来表示有参数的父状态
    // 用法： stateExpr('projectManage', $scope => ({ id: $scope.projectCollectionId }))
    let stateExpr = function (name, params) {
      return function ($scope) {
        return `${name}(${JSON.stringify(params($scope))})`;
      };
    };

    // 总览
    $stateProvider.state('overview', {
      url: '/overview',
      templateUrl: 'index/tpl/overview/overview.html',
      controller: 'OverviewCtr',
      resolve: loadFiles([
        'index/tpl/overview/overview.css',
        'index/tpl/overview/overviewCtr.js',
      ]),
      ncyBreadcrumb: { label: '总览', navItem: null }
    });
    // 项目管理
    $stateProvider.state('projectCollectionManage', {
      url: '/projectCollectionManage',
      templateUrl: 'index/tpl/projectCollectionManage/projectCollectionManage.html',
      resolve: loadFiles([
        'index/tpl/projectCollectionManage/projectCollectionManageCtr.js',
        'index/tpl/projectCollectionManage/projectCollectionManage.css',
      ]),
      controller: 'ProjectCollectionManageCtr',
      ncyBreadcrumb: { label: '项目管理', navItem: 'project' },
    });

    // 新建项目
    $stateProvider.state('createProjectCollection', {
      url: '/createProjectCollection',
      templateUrl: 'index/tpl/createProjectCollection/createProjectCollection.html',
      resolve: loadFiles([
        'index/tpl/createProjectCollection/createProjectCollectionCtr.js',
        'index/tpl/createProjectCollection/createProjectCollection.css',
      ]),
      controller: 'CreateProjectCollectionCtr',
      ncyBreadcrumb: { label: '新建项目', parent: 'projectCollectionManage' }
    });

    // 项目详情
    $stateProvider.state('projectManage', {
      url: '/projectManage/:id',
      templateUrl: 'index/tpl/projectManage/projectManage.html',
      resolve: loadFiles([
        'index/tpl/projectManage/projectManageCtr.js',
        'index/tpl/projectManage/projectManage.css',
      ]),
      controller: 'ProjectManageCtr',
      ncyBreadcrumb: { label: '{{projectCollectionName}}', parent: 'projectCollectionManage' }
    }).state('projectManage.project', { // 工程
      url: '/project',
      templateUrl: 'index/tpl/projectManage/projectManage.html',
      ncyBreadcrumb: { parent: 'projectManage', skip: true }
    }).state('projectManage.user', { // 成员
      url: '/user',
      templateUrl: 'index/tpl/projectManage/projectManage.html',
      controller: 'ProjectManageCtr',
      ncyBreadcrumb: { parent: 'projectManage', skip: true }
    });

    // 新建工程
    $stateProvider.state('createProject1', {
      url: '/createProject/1/:projectCollectionId',
      templateUrl: 'index/tpl/createProject1/createProject1.html',
      resolve: loadFiles([
        'index/tpl/createProject1/createProject1.css',
        'index/tpl/createProject1/createProjectCtr1.js',
      ]),
      controller: 'CreateProjectCtr1',
      ncyBreadcrumb: {
        label: '新建工程',
        parent: stateExpr('projectManage', $scope => ({
          id: $scope.projectCollectionId
        }))
      }
    }).state('createProject2', {
      url: '/createProject/2/:projectCollectionId',
      templateUrl: 'index/tpl/createProject2/createProject2.html',
      resolve: loadFiles([
        'index/tpl/createProject2/createProject2.css',
        'index/tpl/createProject2/createProjectCtr2.js',
        'index/tpl/tplProjectSetting/projectSettingTpl.css',
        // do NOT do like this
        'index/tpl/projectDetail/projectDetail.css',
        'index/tpl/tplChoseImage/choseImageCtr.js',
      ]),
      controller: 'CreateProjectCtr2',
      ncyBreadcrumb: { parent: 'createProject1', skip: true }
    });

    // 工程详情
    $stateProvider.state('projectDetail', {
      url: '/projectDetail/:projectCollectionId/:project',
      templateUrl: 'index/tpl/projectDetail/projectDetail.html',
      resolve: loadFiles([
        'index/tpl/projectDetail/projectDetail.css',
        'index/tpl/projectDetail/projectDetailCtr.js',
        'index/tpl/tplProjectSetting/projectSettingTpl.css',
      ]),
      controller: 'ProjectDetailCtr',
      ncyBreadcrumb: { label: '工程详情', parent: stateExpr('projectManage', $scope => ({ id: $scope.projectCollectionId })), },
    }).state('projectDetail.info', {
      url: '/info',
      ncyBreadcrumb: { parent: 'projectDetail', skip: true },
    }).state('projectDetail.config', {
      url: '/config',
      ncyBreadcrumb: { parent: 'projectDetail', skip: true },
    }).state('projectDetail.autobuild', {
      url: '/autobuild',
      ncyBreadcrumb: { parent: 'projectDetail', skip: true },
    }).state('projectDetail.buildlog', {
      url: '/buildlog',
      ncyBreadcrumb: { parent: 'projectDetail', skip: true },
    }).state('projectDetail.user', {
      url: '/user',
      ncyBreadcrumb: { parent: 'projectDetail', skip: true },
    });

    // 镜像管理
    $stateProvider.state('imageCollectionManage', {
      url: '/imageCollectionManage',
      templateUrl: 'index/tpl/imageCollectionManage/imageCollectionManage.html',
      resolve: loadFiles([
        'index/tpl/imageCollectionManage/imageCollectionManage.css',
        'index/tpl/imageCollectionManage/imageCollectionManageCtr.js',
      ]),
      controller: 'ImageCollectionManageCtr',
      ncyBreadcrumb: { label: '镜像管理', navItem: 'image' }
    }).state('imageCollectionManage.baseimages', {
      url: '/baseimages',
      templateUrl: 'index/tpl/imageCollectionManage/imageCollectionManage.html',
      ncyBreadcrumb: { parent: 'imageCollectionManage', skip: true }
    }).state('imageCollectionManage.proimages', {
      url: '/proimages',
      templateUrl: 'index/tpl/imageCollectionManage/imageCollectionManage.html',
      ncyBreadcrumb: { parent: 'imageCollectionManage', skip: true }
    }).state('imageCollectionManage.publicimages', {
      url: '/publicimages',
      templateUrl: 'index/tpl/imageCollectionManage/imageCollectionManage.html',
      ncyBreadcrumb: { parent: 'imageCollectionManage', skip: true }
    });

    // 官方仓库
    $stateProvider.state('publicImageDetail', {
      url: '/publicImageDetail/:name/:page',
      params: {
        page: { value: null, squash: true, dynamic: true },
      },
      resolve: loadFiles([
        'index/tpl/publicImageDetail/publicImageDetail.css',
        'index/tpl/publicImageDetail/publicImageDetailCtr.js',
      ]),
      templateUrl: 'index/tpl/publicImageDetail/publicImageDetail.html',
      ncyBreadcrumb: { label: '官方仓库', parent: 'imageCollectionManage.publicimages' }
    })

    // 其他镜像
    $stateProvider.state('otherImagesManage', {
      url: '/otherImagesManage',
      templateUrl: 'index/tpl/imagesManage/imagesManage.html',
      resolve: loadFiles([
        'index/tpl/imagesManage/imagesManage.css',
        'index/tpl/imagesManage/imagesManageCtr.js',
      ]),
      controller: 'ImagesManageCtr',
      params: { args: {} },
      ncyBreadcrumb: { label: '其他镜像', parent: 'imageCollectionManage' }
    });

    // 项目镜像
    $stateProvider.state('projImagesManage', {
      url: '/projImagesManage',
      templateUrl: 'index/tpl/imagesManage/imagesManage.html',
      resolve: loadFiles([
        'index/tpl/imagesManage/imagesManage.css',
        'index/tpl/imagesManage/imagesManageCtr.js',
      ]),
      controller: 'ImagesManageCtr',
      params: { args: {} },
      ncyBreadcrumb: {
        label: '{{collectionName}}镜像',
        parent: 'imageCollectionManage'
      }
    });

    // 服务管理
    $stateProvider.state('deployCollectionManage', {
      url: '/deployCollectionManage',
      templateUrl: 'index/tpl/deployCollectionManage/deployCollectionManage.html',
      resolve: loadFiles([
        'index/tpl/deployCollectionManage/deployCollectionManage.css',
        'index/tpl/deployCollectionManage/deployCollectionManageCtr.js',
      ]),
      controller: 'DeployCollectionManageCtr',
      ncyBreadcrumb: { label: '服务', navItem: 'service' }
    });

    // 新建服务
    $stateProvider.state('createDeployCollection', {
      url: '/createDeployCollection',
      templateUrl: 'index/tpl/createDeployCollection/createDeployCollection.html',
      resolve: loadFiles([
        'index/tpl/createDeployCollection/createDeployCollectionCtr.js',
        'index/tpl/createDeployCollection/createDeployCollection.css',
      ]),
      controller: 'CreateDeployCollectionCtr',
      ncyBreadcrumb: { label: '新建服务', parent: 'deployCollectionManage' }
    });

    // 所有部署
    $stateProvider.state('deployAllManage', {
      url: '/deployAllManage/:id/:name',
      templateUrl: 'index/tpl/deployManage/deployManageAll.html',
      resolve: loadFiles([
        'index/tpl/deployManage/deployManageCtr.js',
        'index/tpl/deployManage/deployManage.css',
      ]),
      controller: 'DeployManageCtr',
      ncyBreadcrumb: { label: '所有部署', parent: 'deployCollectionManage' }
    });

    // 部署详情
    $stateProvider.state('deployManage', {
      url: '/deployManage/:id/:name',
      templateUrl: 'index/tpl/deployManage/deployManage.html',
      resolve: loadFiles([
        'index/tpl/deployManage/deployManageCtr.js',
        'index/tpl/deployManage/deployManage.css',
      ]),
      controller: 'DeployManageCtr',
      ncyBreadcrumb: { label: '{{collectionName}}', parent: 'deployCollectionManage' }
    }).state('deployManage.deploy', { // 部署
      url: '/deploy',
      templateUrl: 'index/tpl/deployManage/deployManage.html',
      ncyBreadcrumb: { parent: 'deployManage', skip: true }
    }).state('deployManage.user', { // 成员
      url: '/user',
      templateUrl: 'index/tpl/deployManage/deployManage.html',
      controller: 'DeployManageCtr',
      ncyBreadcrumb: { parent: 'deployManage', skip: true }
    });

    // 新建部署
    // 新建部署首页
    $stateProvider.state('createDeployCommon', {
      url: '/createDeployCommon/:collectionId/:collectionName',
      templateUrl: 'index/tpl/createDeployCommon/createDeployCommon.html',
      resolve: loadFiles([
        'index/tpl/createDeployCommon/createDeployCommon.css',
        'index/tpl/createDeployCommon/createDeployCommonCtr.js',
      ]),
      controller: 'CreateDeployCommonCtr',
      ncyBreadcrumb: {
        label: '新建部署',
        parent: stateExpr('deployManage', $scope => ({
          id: $scope.collectionId,
          name: $scope.collectionName,
        }))
      }
    });
    // YAML / JSON 部署
    $stateProvider.state('createDeployRaw', {
      url: '/createDeployRaw/:collectionId/:collectionName',
      templateUrl: 'index/tpl/createDeployRaw/createDeployRaw.html',
      resolve: loadFiles([
        'index/tpl/createDeployRaw/createDeployRaw.css',
        'index/tpl/createDeployRaw/createDeployRawCtr.js',
      ]),
      controller: 'CreateDeployRawCtr',
      ncyBreadcrumb: { parent: 'createDeployCommon', skip: true }
    });
    // 默认类型部署（需要镜像）
    $stateProvider.state('createDeployImage', {
      url: '/createDeployImage/:collectionId/:collectionName',
      templateUrl: 'index/tpl/createDeployImage/createDeployImage.html',
      resolve: loadFiles([
        'index/tpl/createDeployImage/createDeployImage.css',
        'index/tpl/createDeployImage/createDeployImageCtr.js',
      ]),
      controller: 'CreateDeployImageCtr',
      ncyBreadcrumb: { parent: 'createDeployCommon', skip: true }
    });

    // 部署详情
    $stateProvider.state('deployDetail', {
      url: '/deployDetail/:id/:collectionId/:collectionName',
      params: {
        storageId: null, //if come from storage volume this is storageVolumeId,else is null.
      },
      templateUrl: 'index/tpl/deployDetail/deployDetail.html',
      resolve: loadFiles([
        'index/tpl/deployDetail/deployDetail.css',
        'index/tpl/deployDetail/deployDetailCtr.js',
      ]),
      controller: 'DeployDetailCtr',
      ncyBreadcrumb: {
        label: '{{deployName}}',
        parent: function ($scope) {
          if (+$scope.collectionId) {
            return stateExpr('deployManage', $scope => ({
              id: $scope.collectionId,
              name: $scope.collectionName,
            }))($scope);
          } else {
            return 'deployAllManage({ id: 0 })';
          }
        }, 
      }
    }).state('deployDetail.detail', {
      url: '/detail',
      ncyBreadcrumb: { parent: 'deployDetail', skip: true }
    }).state('deployDetail.update', {
      url: '/update',
      ncyBreadcrumb: { parent: 'deployDetail', skip: true }
    }).state('deployDetail.event', {
      url: '/event',
      ncyBreadcrumb: { parent: 'deployDetail', skip: true }
    }).state('deployDetail.instance', {
      url: '/instance',
      ncyBreadcrumb: { parent: 'deployDetail', skip: true }
    }).state('deployDetail.network', {
      url: '/network',
      ncyBreadcrumb: { parent: 'deployDetail', skip: true }
    });

    // 集群管理
    $stateProvider.state('clusterManage', {
      url: '/clusterManage',
      templateUrl: 'index/tpl/clusterManage/clusterManage.html',
      resolve: loadFiles([
        'index/tpl/clusterManage/clusterManage.css',
        'index/tpl/clusterManage/clusterManageCtr.js',
      ]),
      controller: 'ClusterManageCtr',
      ncyBreadcrumb: { label: '集群管理', navItem: 'cluster' }
    });
    // 新建集群
    $stateProvider.state('createCluster', {
      url: '/createCluster',
      templateUrl: 'index/tpl/createCluster/createCluster.html',
      resolve: loadFiles([
        'index/tpl/createCluster/createCluster.css',
        'index/tpl/createCluster/createClusterCtr.js',
      ]),
      controller: 'CreateClusterCtr',
      ncyBreadcrumb: { label: '新建集群', parent: 'clusterManage' }
    });
    // 集群详情
    $stateProvider.state('clusterDetail', {
      url: '/clusterDetail/:id',
      templateUrl: 'index/tpl/clusterDetail/clusterDetail.html',
      resolve: loadFiles([
        'index/tpl/clusterDetail/clusterDetail.css',
        'index/tpl/clusterDetail/clusterDetailCtr.js',
      ]),
      controller: 'ClusterDetailCtr',
      ncyBreadcrumb: { label: '集群详情', parent: 'clusterManage' }
    }).state('clusterDetail.hostlist', {
      url: '/hostlist',
      ncyBreadcrumb: { parent: 'clusterDetail', skip: true }
    }).state('clusterDetail.info', {
      url: '/info',
      ncyBreadcrumb: { parent: 'clusterDetail', skip: true }
    }).state('clusterDetail.namespace', {
      url: '/namespace',
      ncyBreadcrumb: { parent: 'clusterDetail', skip: true }
    }).state('clusterDetail.instances', {
      url: '/instances',
      ncyBreadcrumb: { parent: 'clusterDetail', skip: true }
    }).state('clusterDetail.users', {
      url: '/users',
      ncyBreadcrumb: { parent: 'clusterDetail', skip: true }
    }).state('clusterDetail.watcher', {
      url: '/watcher',
      ncyBreadcrumb: { parent: 'clusterDetail', skip: true }
    });
    //监听器
    $stateProvider.state('createWatcher', {
      url: '/cluster/:id/createWatcher',
      templateUrl: 'index/tpl/createWatcher/createWatcher.html',
      controller: 'CreateWatcherCtr',
      resolve: loadFiles([
        'index/tpl/createWatcher/createWatcherCtr.js',
      ]),
      ncyBreadcrumb: {
        label: '添加监听器',
        parent: stateExpr('clusterDetail', $scope => ({
          id: $scope.clusterId,
        }))
      }
    });
    $stateProvider.state('watcherDetail', {
      url: '/cluster/:clusterId/:deployId',
      params: { args: {} },
      templateUrl: 'index/tpl/watcherDetail/watcherDetail.html',
      controller: 'WatcherDetailCtr',
      resolve: loadFiles([
        'index/tpl/watcherDetail/watcherDetailCtr.js',
        'index/tpl/deployDetail/deployDetailCtr.js',
        'index/tpl/watcherDetail/watcherDetail.css',
        'index/tpl/deployDetail/deployDetail.css',
        'index/tpl/deployDetail/deployDetailCtr.js',
        'index/tpl/createWatcher/createWatcherCtr.js',
      ]),
      ncyBreadcrumb: {
        label: '监听器详情',
        parent: stateExpr('clusterDetail', $scope => ({
          id: $scope.clusterId,
        }))
      }
    }).state('watcherDetail.detail', {
      url: '/detail',
      ncyBreadcrumb: { parent: 'watcherDetail', skip: true }
    }).state('watcherDetail.update', {
      url: '/update',
      ncyBreadcrumb: { parent: 'watcherDetail', skip: true }
    }).state('watcherDetail.event', {
      url: '/event',
      ncyBreadcrumb: { parent: 'watcherDetail', skip: true }
    });

    // 添加主机
    $stateProvider.state('addHost', {
      url: '/addHost/:id',
      templateUrl: 'index/tpl/addHost/addHost.html',
      controller: 'AddHostCtr',
      resolve: loadFiles([
        'index/tpl/addHost/addHost.css',
        'index/tpl/addHost/addHostCtr.js',
      ]),
      ncyBreadcrumb: {
        label: '添加主机',
        parent: stateExpr('clusterDetail', $scope => ({
          id: $scope.id,
        }))
      }
    });
    // 主机详情
    $stateProvider.state('hostDetail', {
      url: '/hostDetail/:clusterId/:name',
      templateUrl: 'index/tpl/hostDetail/hostDetail.html',
      resolve: loadFiles([
        'index/tpl/hostDetail/hostDetail.css',
        'index/tpl/hostDetail/hostDetailCtr.js',
      ]),
      controller: 'HostDetailCtr',
      ncyBreadcrumb: {
        label: '主机详情',
        parent: stateExpr('clusterDetail', $scope => ({
          id: $scope.clusterId,
        }))
      }
    }).state('hostDetail.instancelist', {
      url: '/instancelist',
      ncyBreadcrumb: { parent: 'hostDetail', skip: true },
    }).state('hostDetail.info', {
      url: '/info',
      ncyBreadcrumb: { parent: 'hostDetail', skip: true },
    });

    // 监控
    $stateProvider.state('monitor', {
      url: '/monitor',
      templateUrl: 'index/tpl/monitor/monitor.html',
      controller: 'MonitorCtr',
      resolve: loadFiles([
        'index/tpl/monitor/monitor.css',
        'index/tpl/monitor/monitorCtr.js',
      ]),
      ncyBreadcrumb: { label: '监控', navItem: 'monitor' }
    });

    // 应用商店
    $stateProvider.state('appStore', {
      url: '/appStore',
      templateUrl: 'index/tpl/appStore/appStore.html',
      controller: 'AppStoreCtr',
      resolve: loadFiles([
        'index/tpl/appStore/appStore.css',
        'index/tpl/appStore/appStoreCtr.js',
      ]),
      ncyBreadcrumb: { label: '应用商店', navItem: 'apps' }
    });
    // 应用部署
    $stateProvider.state('createAppDeploy', {
      url: '/createDeploy/app/:appName',
      templateUrl: 'index/tpl/createAppDeploy/createAppDeploy.html',
      controller: 'CreateAppDeployCtr',
      resolve: loadFiles([
        'index/tpl/createAppDeploy/createAppDeploy.css',
        'index/tpl/createAppDeploy/createAppDeployCtr.js',
      ]),
      ncyBreadcrumb: { label: '应用部署', parent: 'appStore' }
    });

    // 报警
    $stateProvider.state('alarm', {
      url: '/alarm',
      templateUrl: 'index/tpl/alarm/alarm.html',
      controller: 'AlarmCtr as vm',
      resolve: loadFiles([
        'index/tpl/alarm/alarm.css',
        'index/tpl/alarm/alarmCtr.js',
      ]),
      ncyBreadcrumb: { label: '报警', navItem: 'alarm' }
    }).state('alarm.templates', {
      url: '/templates',
      templateUrl: 'index/tpl/alarm/tabTemplates/tabTemplates.html',
      controller: 'TabAlarmTemplatesCtr as vmTemplate',
      ncyBreadcrumb: { parent: 'alarm', skip: true }
    }).state('alarm.nodegroups', {
      url: '/nodegroups',
      templateUrl: 'index/tpl/alarm/tabHostGroups/tabHostGroups.html',
      controller: 'TabHostGroupsCtr as vmHostGroup',
      ncyBreadcrumb: { parent: 'alarm', skip: true }
    }).state('alarm.currentAlarms', {
      url: '/currentAlarms',
      templateUrl: 'index/tpl/alarm/tabCurrentAlarms/tabCurrentAlarms.html',
      controller: 'TabAlarmCurrentAlarmsCtr as vmAlarm',
      ncyBreadcrumb: { parent: 'alarm', skip: true }
    }).state('alarm.group', {
      url: '/group',
      templateUrl: 'index/tpl/alarm/tabGroup/tabGroup.html',
      controller: 'TabGroupCtr as vmGroup',
      ncyBreadcrumb: { parent: 'alarm', skip: true }
    }).state('alarm.usergroup', {
      url: '/usergroup',
      templateUrl: 'index/tpl/alarm/tabUserGroup/tabUserGroup.html',
      controller: 'TabUserGroupCtr',
      ncyBreadcrumb: { parent: 'alarm', skip: true }
    });
    // 新建报警模板
    $stateProvider.state('createAlarmTemplate', {
      url: '/createAlarmTemplate',
      templateUrl: 'index/tpl/createAlarmTemplate/createAlarmTemplate.html',
      controller: 'CreateAlarmTemplateCtr',
      resolve: loadFiles([
        'index/tpl/createAlarmTemplate/createAlarmTemplateCtr.js',
        'index/tpl/tplAlarmTemplate/tplAlarmTemplate.css',
      ]),
      ncyBreadcrumb: { label: '新建模板', parent: 'alarm.templates' }
    });
    // 报警模板详情
    $stateProvider.state('alarmTemplateDetail', {
      url: '/alarmTemplateDetail/:id',
      templateUrl: 'index/tpl/alarmTemplateDetail/alarmTemplateDetail.html',
      controller: 'AlarmTemplateDetailCtr',
      resolve: loadFiles([
        'index/tpl/alarmTemplateDetail/alarmTemplateDetailCtr.js',
        'index/tpl/tplAlarmTemplate/tplAlarmTemplate.css',
      ]),
      ncyBreadcrumb: { label: '模板详情', parent: 'alarm.templates' }
    });
    // 添加主机
    $stateProvider.state('alarmAddHosts', {
      url: '/alarmAddHosts/:id/:name',
      templateUrl: 'index/tpl/alarmAddHosts/alarmAddHosts.html',
      controller: 'AlarmAddHostsCtr as vm',
      resolve: loadFiles([
        'index/tpl/alarmAddHosts/alarmAddHostsCtr.js',
        'index/tpl/alarmAddHosts/alarmAddHosts.css',
      ]),
      ncyBreadcrumb: { label: '添加主机', parent: 'alarm.nodegroups' }});

    // 配置集合
      $stateProvider.state('configMapCollection', {
        url: '/configMapCollection',
        templateUrl: 'index/tpl/configMap/configMapCollection/configMapCollection.html',
        controller: 'ConfigMapCollectionCtr',
        ncyBreadcrumb: { label: '配置集合', navItem: 'configmap' },
        resolve: loadFiles([
            '/index/tpl/configMap/configMapCollection/configMapCollectionCtr.js',
        ]),
    });
    // 新建配置集合
    $stateProvider.state('createConfigMapCollection', {
        url: '/createConfigMapCollection',
        templateUrl: 'index/tpl/configMap/createConfigMapCollection/createConfigMapCollection.html',
        controller: 'CreateConfigMapCollectionCtr',
        resolve: loadFiles([
            '/index/tpl/configMap/createConfigMapCollection/createConfigMapCollectionCtr.js'
        ]),
        ncyBreadcrumb: { label: '新建配置集合', parent: 'configMapCollection' },
    });
      $stateProvider.state('configMapCollectionDetail', {
        url: '/configMapCollectionDetail/:id/:page',
        params: {
          page: { value: null, squash: true, dynamic: true },
        },
        templateUrl: 'index/tpl/configMap/configMapCollectionDetail/configMapCollectionDetail.html',
        controller: 'ConfigMapCollectionDetailCtr',
        resolve: loadFiles([
            '/index/tpl/configMap/configMapCollectionDetail/configMapCollectionDetailCtr.js'
        ]),
        ncyBreadcrumb: { label: '集合信息', parent: 'configMapCollection' },
    });
      $stateProvider.state('createConfigMap', {
        url: '/createConfigMap/:id',
        templateUrl: 'index/tpl/configMap/createConfigMap/createConfigMap.html',
        controller: 'CreateConfigMapCtr',
        resolve: loadFiles([
            '/index/tpl/configMap/createConfigMap/createConfigMapCtr.js'
        ]),
        ncyBreadcrumb: { label: '新建配置', parent: 'configMapCollectionDetail' },
    });
      $stateProvider.state('configMapDetail', {
        url: '/configMapDetail/:id/:configMapId/:page',
        params: {
          page: { value: null, squash: true, dynamic: true },
        },
        templateUrl: 'index/tpl/configMap/configMapDetail/configMapDetail.html',
        controller: 'ConfigMapDetailCtr',
        resolve: loadFiles([
            '/index/tpl/configMap/configMapDetail/configMapDetailCtr.js'
        ]),
        ncyBreadcrumb: { label: '配置详情',  parent: 'configMapCollectionDetail' },
    });
      $stateProvider.state('createDeploy', {
        url: '/createDeploy/:collectionId/:collectionName',
        templateUrl: 'index/tpl/deployment/createDeployment/createDeployment.html',
        resolve: loadFiles([
            '/index/tpl/deployment/createDeployment/createDeploymentCtr.js'
        ]),
        controller: 'CreateDeploymentCtr',
        ncyBreadcrumb: {
            label: '新建部署',
            parent: stateExpr('deployManage', $scope => ({
                id: $scope.collectionId,
                name: $scope.collectionName,
            })),
        },
    });
    // 报警用户组
    $stateProvider.state('alarmUserGroupDetail', {
      url: '/alarmUserGroupDetail/:id',
      templateUrl: 'index/tpl/tplAlarmUserGroupDetail/tplAlarmUserGroupDetail.html',
      controller: 'TplAlarmUserGroupDetailCtr',
      resolve: loadFiles([
        'index/tpl/tplAlarmUserGroupDetail/tplAlarmUserGroupDetailCtr.js',
        'index/tpl/tplAlarmUserGroupDetail/tplAlarmUserGroupDetail.css',
      ]),
      ncyBreadcrumb: { label: '用户组详情', parent: 'alarm.usergroup' }
    });

    // 全局配置
    $stateProvider.state('globalSetting', {
      url: '/globalSetting/:page',
      params: {
        page: { value: null, squash: true, dynamic: true },
      },
      templateUrl: 'index/tpl/globalSetting/globalSetting.html',
      controller: 'GlobalSettingCtr',
      resolve: loadFiles([
        'index/tpl/globalSetting/globalSetting.css',
        'index/tpl/globalSetting/globalSettingCtr.js',
      ]),
      ncyBreadcrumb: { label: '全局配置', navItem: 'global' }
    });

    /** 负载均衡 **/
    // 负载均衡组
    $stateProvider.state('loadBalanceCollection', {
      url: '/loadBalanceCollection',
      templateUrl: 'index/tpl/loadBalance/loadBalanceCollection/loadBalanceCollection.html',
      controller: 'LoadBalanceCollectionCtr',
      resolve: loadFiles([
        '/index/tpl/loadBalance/loadBalanceCollection/loadBalanceCollectionCtr.js',
      ]),
      ncyBreadcrumb: { label: '负载均衡' },
    });
    // 创建负载均衡
    $stateProvider.state('createLoadBalanceCollection', {
      url: '/createLoadBalanceCollection',
      templateUrl: 'index/tpl/loadBalance/createLoadBalanceCollection/createLoadBalanceCollection.html',
      controller: 'CreateLoadBalanceCollectionCtr',
      resolve: loadFiles([
        '/index/tpl/loadBalance/createLoadBalanceCollection/createLoadBalanceCollectionCtr.js'
      ]),
      ncyBreadcrumb: { label: '新建负载均衡', parent: 'loadBalanceCollection' },
    });
    // 负载均衡列表
    $stateProvider.state('loadBalanceInfo', {
      url: '/loadBalanceInfo/:id/:type/:page',
      params: {
        page: { value: null, squash: true, dynamic: true },
      },
      templateUrl: 'index/tpl/loadBalance/loadBalanceInfo/loadBalanceInfo.html',
      controller: 'LoadBalanceInfoCtr',
      resolve: loadFiles([
        '/index/tpl/loadBalance/loadBalanceInfo/loadBalanceInfoCtr.js',
      ]),
      ncyBreadcrumb: { label: '负载均衡实例', parent: 'loadBalanceCollection' },
    });
    // 新建kube proxy负载均衡
    $stateProvider.state('createKubeLoadBalance', {
      url: '/createKubeLoadBalance/:id',
      templateUrl: 'index/tpl/loadBalance/createLoadBalance/createKubeLoadBalance.html',
      controller: 'CreateKubeLoadBalanceCtr',
      ncyBreadcrumb: {
        label: '添加',
        parent: stateExpr( 'loadBalanceInfo', $scope => ({
          id: $scope.collectionId , type: $scope.type,
        })),
      },
      resolve: loadFiles([
        '/index/tpl/loadBalance/common/loadBalanceComponent.js',
        '/index/tpl/loadBalance/createLoadBalance/createLoadBalanceCtr.js',
      ]),
    });
    // 新建nginx负载均衡
    $stateProvider.state('createNginxLoadBalance', {
      url: '/createNginxLoadBalance/:id',
      templateUrl: 'index/tpl/loadBalance/createLoadBalance/createNginxLoadBalance.html',
      controller: 'CreateNginxLoadBalanceCtr',
      ncyBreadcrumb: {
        label: '添加',
        parent: stateExpr('loadBalanceInfo', $scope => ({
          id: $scope.collectionId , type: $scope.type,
        })),
      },
      resolve: loadFiles([
        '/index/tpl/loadBalance/common/loadBalanceComponent.js',
        '/index/tpl/loadBalance/createLoadBalance/createLoadBalanceCtr.js',
      ]),
    });
    // kube 详情
    $stateProvider.state('kubeLoadBalanceDetail', {
      url: '/kubeLoadBalanceDetail/:collectionId/:loadBalanceId',
      templateUrl: 'index/tpl/loadBalance/loadBalanceDetail/kubeLoadBalanceDetail.html',
      controller: 'KubeLoadBalanceDetailCtr',
      ncyBreadcrumb: {
        label: '{{loadBalanceDraft.name}}',
        parent: stateExpr('loadBalanceInfo',$scope => ({
          id: $scope.collectionId , type: $scope.type,
        })),
      },
      resolve: loadFiles([
        '/index/tpl/loadBalance/common/loadBalanceComponent.js',
        '/index/tpl/loadBalance/loadBalanceDetail/loadBalanceDetailCtr.js',
      ]),
    });
    // nginx详情
    $stateProvider.state('nginxLoadBalanceDetail', {
      url: '/nginxLoadBalanceDetail/:collectionId/:loadBalanceId/:page',
      templateUrl: 'index/tpl/loadBalance/loadBalanceDetail/nginxLoadBalanceDetail.html',
      params: {
        page: { value: null, squash: true, dynamic: true },
      },
      controller: 'NginxLoadBalanceDetailCtr',
      ncyBreadcrumb: {
        label: '{{loadBalanceDraft.name}}',
        parent: stateExpr('loadBalanceInfo', $scope => ({
          id: $scope.collectionId, type: $scope.type,
        })),
      },
      resolve: loadFiles([
        'index/tpl/deployDetail/deployDetail.css', //事件样式
        '/index/tpl/loadBalance/common/loadBalanceComponent.js',
        '/index/tpl/loadBalance/loadBalanceDetail/loadBalanceDetailCtr.js',
      ]),
    });

  }])
    .config(['$compileProvider', '$qProvider', function ($compileProvider, $qProvider) {
      $compileProvider.debugInfoEnabled(false);
      $qProvider.errorOnUnhandledRejections(false);
    }])
    .config(['$provide', function ($provide) {
      // Set a suffix outside the decorator function
      // from: http://stackoverflow.com/questions/23589843/disable-template-caching-in-angularjs-with-ui-router
      var cacheBuster = window.VERSION_HASH || Date.now().toString();

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
