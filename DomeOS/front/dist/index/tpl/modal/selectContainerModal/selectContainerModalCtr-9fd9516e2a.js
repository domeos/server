domeApp.controller('selectContainerModalCtr', ['$scope', 'containerList', 'hostIp', '$modalInstance', function($scope, containerList, hostIp, $modalInstance) {
	'use strict';
	$scope.containerList = containerList || [];
	$scope.hostIp = hostIp;
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