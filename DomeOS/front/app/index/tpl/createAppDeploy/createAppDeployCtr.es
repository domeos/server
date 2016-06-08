(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('CreateAppDeployCtr', ['$scope', '$domeAppStore', '$domeCluster', '$domeUser', '$state', '$stateParams', '$domePublic', function ($scope, $domeAppStore, $domeCluster, $domeUser, $state, $stateParams, $domePublic) {
		if (!$stateParams.appName) {
			$state.go('appStore');
		}
		$scope.$emit('pageTitle', {
			title: $stateParams.appName,
			descrition: '',
			mod: 'appStore'
		});
		let appData;
		const nodeService = $domeCluster.getInstance('NodeService');
		$domeAppStore.getStoreApps().then(function (res) {
			let isExist = false;
			if (res.data) {
				for (let i = 0, l = res.data.length; i < l; i++) {
					if (res.data[i].appName === $stateParams.appName) {
						isExist = true;
						appData = res.data[i];
						break;
					}
				}
				if (!isExist) {
					$domePublic.openWarning('无相关应用数据');
					$state.go('appStore');
				} else {
					let logDraft = {
						logItemDrafts: []
					};
					let logPathList = appData.deploymentTemplate.logPathList;
					if (!logPathList) {
						logPathList = [];
					}
					for (let j = 0, l1 = logPathList.length; j < l1; j++) {
						logDraft.logItemDrafts.push({
							logPath: logPathList[j],
							autoCollect: false,
							autoDelete: false
						});
					}
					appData.deploymentTemplate.logPathList = void 0;
					// 转换为部署需要的日志格式
					appData.deploymentTemplate.logDraft = logDraft;
					appData.deploymentTemplate.networkMode = 'DEFAULT';
					$scope.appInfoIns = $domeAppStore.getInstance('AppInfo', appData);
					$scope.config = $scope.appInfoIns.config;
					$scope.deployIns = $scope.appInfoIns.deployIns;
					$scope.deployConfig = $scope.deployIns.config;
					nodeService.getData().then(function (res) {
						$scope.deployIns.clusterListIns.init(res.data.result);
						$scope.deployIns.toggleCluster();
					});
					// $domeUser.userService.getGroupList().then(function(res) {
					// 	$scope.deployIns.userGroupListIns.init(res.data.result);
					// }).finally(function() {});
				}
			} else {
				$domePublic.openWarning('请求失败！');
				$state.go('appStore');
			}
		}, function () {
			$domePublic.openWarning('请求失败！');
			$state.go('appStore');
		});

		$scope.createDeploy = function () {
			$scope.isLoading = true;
			$scope.deployIns.create().then(function () {
				$domePublic.openPrompt('创建成功！');
				$state.go('deployManage');
			}, function (res) {
				if (res.type == 'namespace') {
					$domePublic.openWarning({
						title: '创建namespace失败！',
						msg: 'Msg:' + res.msg
					});
				} else {
					$domePublic.openWarning({
						title: '创建失败！',
						msg: 'Msg:' + res.msg
					});
				}
			}).finally(function () {
				$scope.isLoading = false;
			});
		};
	}]);
})(window.domeApp);