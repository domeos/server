/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('CreateDeployCommonCtr', ['$scope', '$state', '$domeData', '$domeDeploy', '$domePublic', function ($scope, $state, $domeData, $domeDeploy, $domePublic) {
		$scope.$emit('pageTitle', {
			title: '新建部署',
			descrition: '在这里您可以选择一个或多个项目镜像同时部署。',
			mod: 'deployManage'
		});

    // read deploy data from next page or create a new one
		if ($domeData.getData('createDeployInfoCommon')) {
		  $scope.deployIns = $domeData.getData('createDeployInfoCommon');
		  $scope.deployIns.formartHealthChecker();
		  $domeData.delData('createDeployInfoCommon');
		} else {
		  $scope.deployIns = $domeDeploy.getInstance('Deploy');
		}


    /*
		var createDeployInfo = $domeData.getData('createDeployInfo');
		if (!createDeployInfo) {
			$state.go('createDeploy/1');
			return;
		}

		$scope.deployIns = createDeployInfo;
		$domeData.delData('createDeployInfo');
    */

		$scope.config = $scope.deployIns.config;

		$scope.labelKey = {
			key: ''
		};
		$scope.loadingsIns = $domePublic.getLoadingInstance();
		if ($scope.deployIns.clusterListIns.clusterList.length === 0) {
			$scope.deployIns.initCluster();
		}
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

    // go to next step
		$scope.toNext = function () {
		  $domeData.setData('createDeployInfoCommon', $scope.deployIns);
		  if ($scope.config.versionType === 'CUSTOM') $state.go('createDeployImage');
		  else $state.go('createDeployRaw');
		};

	}]);
})(window.domeApp);