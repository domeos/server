/*
 * @author ChandraLee
 */
 (function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('SelectContainerModalCtr', ['$scope', 'info', '$modalInstance', function ($scope, info, $modalInstance) {
		$scope.containerList = info.containerList || [];
		$scope.hostIp = info.hostIp;
		$scope.resourceId = info.resourceId;
		$scope.type = info.type;
		for (var i = 0, l = $scope.containerList.length; i < l; i++) {
			$scope.containerList[i].shortContainerId = $scope.containerList[i].containerId.substring(0, 12);
			$scope.containerList[i].pageContainer = $scope.containerList[i].shortContainerId + ' (' + $scope.containerList[i].imageName + ')';
		}
		$scope.toggleCurrentContainer = function (index) {
			$scope.currentContainer = $scope.containerList[index];
		};
		if ($scope.containerList[0]) {
			$scope.toggleCurrentContainer(0);
		}
		$scope.cancel = function () {
			$modalInstance.dismiss('');
		};
	}]);
})(angular.module('domeApp'));