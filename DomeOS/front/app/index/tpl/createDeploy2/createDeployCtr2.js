domeApp.controller('createDeployCtr2', ['$scope', '$state', '$domeData', '$modal', '$domeDeploy', '$domeCluster', '$domePublic', '$domeUser', function($scope, $state, $domeData, $modal, $domeDeploy, $domeCluster, $domePublic, $domeUser) {
	$scope.$emit('pageTitle', {
		title: '新建部署',
		descrition: '在这里您可以选择一个或多个项目镜像同时部署。',
		mod: 'deployManage'
	});
	var createDeployInfo = $domeData.getData('createDeployInfo');
	if (!createDeployInfo) {
		$state.go('createDeploy/1');
		return;
	}
	$scope.isExternalIPsValid = false;
	$scope.deployIns = angular.copy(createDeployInfo);
	$domeData.delData('createDeployInfo');
	$scope.config = $scope.deployIns.config;
	$scope.labelKey = {
		key: ''
	};
	var loadingsIns = $scope.loadingsIns = $domePublic.getLoadingInstance();
	loadingsIns.startLoading('cluster');
	loadingsIns.startLoading('userGroup');

	$domeCluster.getClusterList().then(function(res) {
		$scope.deployIns.clusterListIns.init(res.data.result);
		$scope.deployIns.toggleCluster();
	}).finally(function() {
		loadingsIns.finishLoading('cluster');
	});

	$domeUser.getGroupList().then(function(res) {
		$scope.deployIns.userGroupListIns.init(res.data.result);
	}).finally(function() {
		loadingsIns.finishLoading('userGroup');
	});
	$scope.toLastStep = function() {
		$domeData.setData('createDeployInfo1', createDeployInfo);
		$state.go('createDeploy/1');
	};
	$scope.selectFocus = function() {
		$scope.validHost = true;
	};
	$scope.labelKeyDown = function(event, str, labelsInfoFiltered) {
		var lastSelectLabelKey;
		var labelsInfo = $scope.deployIns.nodeListIns.labelsInfo;
		var hasSelected = false;
		if (event.keyCode == 13 && labelsInfoFiltered) {
			angular.forEach(labelsInfoFiltered, function(value, label) {
				if (!hasSelected && !value.isSelected) {
					$scope.deployIns.nodeListIns.toggleLabel(label, true);
					$scope.labelKey.key = '';
				}
				hasSelected = true;
			});
		} else if ((!str || str === '') && event.keyCode == 8) {
			angular.forEach(labelsInfo, function(value, key) {
				if (value.isSelected) {
					lastSelectLabelKey = key;
				}
			});
			if (lastSelectLabelKey) {
				$scope.deployIns.nodeListIns.toggleLabel(lastSelectLabelKey, false);
			}
		}
	};
	$scope.toCreate = function() {
		loadingsIns.startLoading('create');
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
			loadingsIns.finishLoading('create');
		});
	};
}]);