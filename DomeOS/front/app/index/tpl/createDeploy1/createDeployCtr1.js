domeApp.controller('createDeployCtr1', ['$scope', '$state', '$domeData', '$domeDeploy', '$domePublic', function($scope, $state, $domeData, $domeDeploy, $domePublic) {
	$scope.$emit('pageTitle', {
		title: '新建部署',
		descrition: '在这里您可以选择一个或多个项目镜像同时部署。',
		mod: 'deployManage'
	});
	if ($domeData.getData('createDeployInfo1')) {
		$scope.deployEditIns = $domeData.getData('createDeployInfo1');
		$domeData.delData('createDeployInfo1');
	} else {
		$scope.deployEditIns = $domeDeploy.getInstance('EditDeploy');
	}
	$scope.editConfig = $scope.deployEditIns.config;
	$scope.toNext = function() {
		if ($scope.editConfig.containerDrafts.length === 0) {
			$domePublic.openWarning('请至少选择一个镜像！');
		} else {
			$domeData.setData('createDeployInfo', $scope.deployEditIns);
			$state.go('createDeploy/2');
		}
	};
}]);