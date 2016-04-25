domeApp.controller('otherImageModalCtr', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	'use strict';
	$scope.imageInfo = {
		name: '',
		tag: '',
		registry: ''
	};
	$scope.submitImage = function() {
		$modalInstance.close($scope.imageInfo);
	};
}]);