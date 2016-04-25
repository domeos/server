domeApp.controller('selectContainerModalCtr', ['$scope', 'info', '$modalInstance', function($scope, info, $modalInstance) {
	'use strict';
	$scope.containerList = info.containerList || [];
	$scope.hostIp = info.hostIp;
	$scope.resourceId = info.resourceId;
	$scope.type = info.type;
	for (var i = 0; i < $scope.containerList.length; i++) {
		$scope.containerList[i].shortContainerId = $scope.containerList[i].containerId.substring(0, 12);
		$scope.containerList[i].pageContainer = $scope.containerList[i].shortContainerId + ' (' + $scope.containerList[i].imageName + ')';
	}
	$scope.toggleCurrentContainer = function(index) {
		$scope.currentContainer = $scope.containerList[index];
	};
	if ($scope.containerList[0]) {
		$scope.toggleCurrentContainer(0);
	}
	$scope.cancel = function() {
		$modalInstance.dismiss('');
	};
}]);