domeApp.controller('createAppDeployCtr', ['$scope', '$domeAppStore', '$domeCluster', '$domeUser', '$state', '$stateParams', '$domePublic', function($scope, $domeAppStore, $domeCluster, $domeUser, $state, $stateParams, $domePublic) {
	if (!$stateParams.appName) {
		$state.go('appStore');
	}
	$scope.$emit('pageTitle', {
		title: $stateParams.appName,
		descrition: '',
		mod: 'appStore'
	});
	var appData;
	$domeAppStore.getStoreApps().then(function(res) {
		var isExist = false;
		if (res.data) {
			for (var i = 0; i < res.data.length; i++) {
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
				var logDraft = {
					logItemDrafts: []
				};
				var logPathList = appData.deploymentTemplate.logPathList;
				if (!logPathList) {
					logPathList = [];
				}
				for (var j = 0; j < logPathList.length; j++) {
					logDraft.logItemDrafts.push({
						logPath: logPathList[j],
						autoCollect: false,
						autoDelete: false
					});
				}
				delete appData.deploymentTemplate.logPathList;
				// 转换为部署需要的日志格式
				appData.deploymentTemplate.logDraft = logDraft;
				appData.deploymentTemplate.networkMode = 'DEFAULT';
				$scope.appInfoIns = $domeAppStore.getInstance('AppInfo', appData);
				$scope.config = $scope.appInfoIns.config;
				$scope.deployIns = $scope.appInfoIns.deployIns;
				$domeCluster.getClusterList().then(function(res) {
					$scope.deployIns.clusterListIns.init(res.data.result);
					$scope.deployIns.toggleCluster();
				});
				$domeUser.getGroupList().then(function(res) {
					$scope.deployIns.userGroupListIns.init(res.data.result);
				}).finally(function() {});
			}
		} else {
			$domePublic.openWarning('请求失败！');
			$state.go('appStore');
		}
	}, function() {
		$domePublic.openWarning('请求失败！');
		$state.go('appStore');
	});

	$scope.createDeploy = function() {
		$scope.isLoading = true;
		$scope.deployIns.create().then(function() {
			$domePublic.openPrompt('创建成功！');
			$state.go('deployManage');
		}, function(res) {
			if (res == 'namespace') {
				$domePublic.openWarning('创建namespace失败，请重试！');
			} else {
				$domePublic.openWarning('创建失败，请重试！');
			}
		}).finally(function() {
			$scope.isLoading = false;
		});
	};
}]);