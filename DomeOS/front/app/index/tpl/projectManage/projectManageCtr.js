domeApp.controller('projectManageCtr', ['$scope', '$modal', '$domeProject', '$domePublic', '$interval', function($scope, $modal, $domeProject, $domePublic, $interval) {
	$scope.projectList = [];
	$scope.isLoading = true;
	$scope.$emit('pageTitle', {
		title: '项目管理',
		descrition: '在这里把您的代码仓库和DomeOS对接即可创建新项目。此外，您还可以对现有项目进行查询和管理。',
		mod: 'projectManage'
	});
	var init = function() {
		$domeProject.getProjectList().then(function(res) {
			$scope.projectList = res.data.result;
		}).finally(function() {
			$scope.isLoading = false;
		});
	};
	init();
	var interval = $interval(function() {
		if (location.href.indexOf('projectManage') === -1) {
			$interval.cancel(interval);
		}
		init();
	}, 4000);
	$scope.openBuild = function(proid, hasCodeInfo) {
		$domeProject.buildProject(proid, hasCodeInfo);
	};
}]);