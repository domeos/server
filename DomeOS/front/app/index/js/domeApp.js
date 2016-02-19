var domeApp = angular.module('domeApp', ['ui.router', 'ncy-angular-breadcrumb', 'ngAnimate', 'pasvaz.bindonce', 'ngLocale', 'ui.bootstrap', 'angularFileUpload', 'ngScrollbar', 'pubServices']);

domeApp.run(function($rootScope) {
	// 修改页面title，采用ng-bind的方法会使页面闪烁
	$rootScope.$on("pageTitle", function(event, msg) {
		if (msg.title && msg.title !== '') {
			$('title').html('DomeOS-' + msg.title);
		}
	});
});

domeApp.config(function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.when('', '/projectManage');
		$stateProvider.state('projectManage', {
				url: '/projectManage',
				templateUrl: 'index/tpl/projectManage/projectManage.html',
				controller: 'projectManageCtr',
				ncyBreadcrumb: {
					label: '项目管理'
				}
			})
			.state('createProject/1', {
				url: '/createProject/1',
				templateUrl: 'index/tpl/createProject1/createProject1.html',
				controller: 'createProjectCtr1',
				ncyBreadcrumb: {
					label: '新建项目',
					parent: 'projectManage'
				}
			})
			.state('createProject/2', {
				url: '/createProject/2',
				templateUrl: 'index/tpl/createProject2/createProject2.html',
				controller: 'createProjectCtr2',
				ncyBreadcrumb: {
					label: '新建项目',
					parent: 'projectManage'
				}
			})
			.state('projectDetail', {
				url: '/projectDetail/:project',
				templateUrl: 'index/tpl/projectDetail/projectDetail.html',
				controller: 'projectDetailCtr',
				ncyBreadcrumb: {
					label: '项目详情',
					parent: 'projectManage'
				}
			}).state('deployManage', {
				url: '/deployManage',
				templateUrl: 'index/tpl/deployManage/deployManage.html',
				controller: 'deployManageCtr',
				ncyBreadcrumb: {
					label: '部署'
				}
			}).state('createDeploy/1', {
				url: '/createDeploy/1',
				templateUrl: 'index/tpl/createDeploy1/createDeploy1.html',
				controller: 'createDeployCtr1',
				ncyBreadcrumb: {
					label: '新建部署',
					parent: 'deployManage'
				}
			}).state('createDeploy/2', {
				url: '/createDeploy/2',
				templateUrl: 'index/tpl/createDeploy2/createDeploy2.html',
				controller: 'createDeployCtr2',
				ncyBreadcrumb: {
					label: '新建部署',
					parent: 'deployManage'
				}
			}).state('deployDetail', {
				url: '/deployDetail/:id',
				templateUrl: 'index/tpl/deployDetail/deployDetail.html',
				controller: 'deployDetailCtr',
				ncyBreadcrumb: {
					label: '部署详情',
					parent: 'deployManage'
				}
			}).state('groupManage', {
				url: '/groupManage',
				templateUrl: 'index/tpl/groupManage/groupManage.html',
				controller: 'groupManageCtr',
				ncyBreadcrumb: {
					label: '组管理'
				}
			}).state('createGroup', {
				url: '/createGroup',
				templateUrl: 'index/tpl/createGroup/createGroup.html',
				controller: 'createGroupCtr',
				ncyBreadcrumb: {
					label: '新建组',
					parent: 'groupManage'
				}
			}).state('groupDetail', {
				url: '/groupDetail/:id',
				templateUrl: 'index/tpl/groupDetail/groupDetail.html',
				controller: 'groupDetailCtr',
				ncyBreadcrumb: {
					label: '组详情',
					parent: 'groupManage'
				}
			}).state('clusterManage', {
				url: '/clusterManage',
				templateUrl: 'index/tpl/clusterManage/clusterManage.html',
				controller: 'clusterManageCtr',
				ncyBreadcrumb: {
					label: '集群管理'
				}
			}).state('createCluster', {
				url: '/createCluster',
				templateUrl: 'index/tpl/createCluster/createCluster.html',
				controller: 'createClusterCtr',
				ncyBreadcrumb: {
					label: '新建集群',
					parent: 'clusterManage'
				}
			}).state('clusterDetail', {
				url: '/clusterDetail/:id',
				templateUrl: 'index/tpl/clusterDetail/clusterDetail.html',
				controller: 'clusterDetailCtr',
				ncyBreadcrumb: {
					label: '集群详情',
					parent: 'clusterManage'
				}
			}).state('hostDetail', {
				url: '/hostDetail/:clusterId/:name',
				templateUrl: 'index/tpl/hostDetail/hostDetail.html',
				controller: 'hostDetailCtr',
				ncyBreadcrumb: {
					label: '主机详情',
					parent: function($scope) {
						return $scope.parentState;
					}
				}
			}).state('monitor', {
				url: '/monitor',
				templateUrl: 'index/tpl/monitor/monitor.html',
				controller: 'monitorCtr',
				ncyBreadcrumb: {
					label: '监控'
				}
			}).state('imageManage', {
				url: '/image',
				templateUrl: 'index/tpl/imageManage/imageManage.html',
				controller: 'imageManageCtr',
				ncyBreadcrumb: {
					label: '镜像管理'
				}
			}).state('globalSetting', {
				url: '/globalSetting',
				templateUrl: 'index/tpl/globalSetting/globalSetting.html',
				controller: 'globalSettingCtr',
				ncyBreadcrumb: {
					label: '全局配置'
				}
			}).state('addHost', {
				url: '/addHost/:id',
				templateUrl: 'index/tpl/addHost/addHost.html',
				controller: 'addHostCtr',
				ncyBreadcrumb: {
					label: '添加主机',
					parent: function($scope) {
						return $scope.parentState;
					}
				}
			}).state('createAppDeploy', {
				url: '/createDeploy/app/:appName',
				templateUrl: 'index/tpl/createAppDeploy/createAppDeploy.html',
				controller: 'createAppDeployCtr',
				ncyBreadcrumb: {
					label: '应用部署',
					parent: 'appStore'
				}
			}).state('appStore', {
				url: '/appStore',
				templateUrl: 'index/tpl/appStore/appStore.html',
				controller: 'appStoreCtr',
				ncyBreadcrumb: {
					label: '应用商店'
				}
			});
	})
	.config(['$httpProvider', function($httpProvider) {
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
		$httpProvider.interceptors.push(function($rootScope, $q) {
			return {
				'response': function(response) {
					if (typeof(response.data) == 'string' && response.data.indexOf('<html ng-app="loginApp">') >= 0) {
						if (response.config.url.indexOf('api/user/logout') !== -1) {
							location.href = '/login/login.html';
						} else {
							location.href = '/login/login.html?redirect=' + encodeURIComponent(location.href);
						}
					}
					// 判断是否需要自动将resultCode!=200的请求默认为失败 可以设置请求的config:{notIntercept:true},使其不对resultCode!==200的进行拦截
					if (!response.config.notIntercept) {
						if (!response.data.resultCode || response.data.resultCode == 200) {
							return response || $q.resolve(response);
						}
						return $q.reject(response);
					}
					return response;
				}
			};
		});
	}])
	.config(function($compileProvider) {
		$compileProvider.debugInfoEnabled(false);
	});