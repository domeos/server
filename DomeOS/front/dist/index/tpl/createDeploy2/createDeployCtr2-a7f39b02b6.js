domeApp.controller('CreateDeployCtr2', ['$scope', '$state', '$domeData', '$modal', '$domeDeploy', '$domeCluster', '$domePublic', '$domeUser', function ($scope, $state, $domeData, $modal, $domeDeploy, $domeCluster, $domePublic, $domeUser) {
	'use strict';
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

	$scope.deployIns = createDeployInfo;
	$domeData.delData('createDeployInfo');
	$scope.config = $scope.deployIns.config;

	$scope.labelKey = {
		key: ''
	};
	$scope.loadingsIns = $domePublic.getLoadingInstance();
	if ($scope.deployIns.clusterListIns.clusterList.length === 0) {
		$scope.deployIns.initCluster();
	}
	$scope.toLastStep = function () {
		$domeData.setData('createDeployInfo1', $scope.deployIns);
		$state.go('createDeploy/1');
	};
	$scope.selectFocus = function () {
		$scope.validHost = true;
	};
	$scope.labelKeyDown = function (event, str, labelsInfoFiltered) {
		var lastSelectLabelKey;
		var labelsInfo = $scope.deployIns.nodeListIns.labelsInfo;
		var hasSelected = false;
		if (event.keyCode == 13 && labelsInfoFiltered) {
			angular.forEach(labelsInfoFiltered, function (value, label) {
				if (!hasSelected && !value.isSelected) {
					$scope.deployIns.nodeListIns.toggleLabel(label, true);
					$scope.labelKey.key = '';
				}
				hasSelected = true;
			});
		} else if (!str && event.keyCode == 8) {
			angular.forEach(labelsInfo, function (value, key) {
				if (value.isSelected) {
					lastSelectLabelKey = key;
				}
			});
			if (lastSelectLabelKey) {
				$scope.deployIns.nodeListIns.toggleLabel(lastSelectLabelKey, false);
			}
		}
	};
	$scope.toCreate = function () {
		$scope.loadingsIns.startLoading('create');

		$scope.deployIns.create().then(function () {
			$domePublic.openPrompt('创建成功！');
			$state.go('deployManage');
		}, function (res) {
			if (res.type == 'namespace') {
				$domePublic.openWarning({
					title: '创建namespace失败！',
					msg: 'Message:' + res.msg
				});
			} else {
				$domePublic.openWarning({
					title: '创建失败！',
					msg: 'Message:' + res.msg
				});
			}
		}).finally(function () {
			$scope.loadingsIns.finishLoading('create');
		});
	};
}]);