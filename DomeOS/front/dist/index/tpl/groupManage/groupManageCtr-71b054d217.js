domeApp.controller('GroupManageCtr', ['$scope', '$domeUser', function($scope, $domeUser) {
	'use strict';
	$scope.$emit('pageTitle', {
		title: '组管理',
		descrition: '在这里您可以看到所有的组。您可以选择某个组查看详细信息或新建一个组。',
		mod: 'user'
	});
	$scope.isLoading = true;
	$domeUser.userService.getGroup().then(function(res) {
		$scope.groupList = res.data.result || [];
	}).finally(function() {
		$scope.isLoading = false;
	});
}]);