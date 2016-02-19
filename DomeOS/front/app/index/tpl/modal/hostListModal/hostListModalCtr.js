domeApp.controller('hostListModalCtr', ['$scope', 'hostList', '$modalInstance', 'filterFilter', function($scope, hostList, $modalInstance, filterFilter) {
	$scope.hostList = filterFilter(hostList, {
		'labelFilter': true
	});
}]);