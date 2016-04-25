domeApp.controller('groupDetailCtr', ['$scope', '$stateParams', '$state', '$domeUser', '$domePublic', function($scope, $stateParams, $state, $domeUser, $domePublic) {
	'use strict';
	if (!$stateParams.id) {
		$state.go('groupManage');
	}
	var groupId = $stateParams.id;
	$scope.resourceType = 'group';
	$scope.resourceId = groupId;
	$domeUser.getGroupInfo(groupId).then(function(res) {
		$scope.groupInfo = res.data.result;
		$scope.$emit('pageTitle', {
			title: $scope.groupInfo.name,
			descrition: '',
			mod: 'user'
		});
		$scope.groupInfo.description = $scope.groupInfo.description || '无描述信息';
	}, function(res) {
		$domePublic.openWarning('请求失败！');
		$state.go('groupManage');
	});
	$scope.deleteGroup = function() {
		$domePublic.openDelete().then(function(res) {
			$domeUser.deleteGroup(groupId).then(function(res) {
				$domePublic.openPrompt('删除成功！');
				$state.go('groupManage');
			}, function(res) {
				$domePublic.openWarning({
					title: '删除失败！',
					msg: 'Message:' + res.data.resultMsg
				});
			});
		});
	};
}]);