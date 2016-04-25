domeApp.controller('hostListModalCtr', ['$scope', 'hostList', '$modalInstance', 'filterFilter', function($scope, hostList, $modalInstance, filterFilter) {
	'use strict';
	$scope.hostList = filterFilter(hostList, {
		'labelFilter': true
	});
}]);