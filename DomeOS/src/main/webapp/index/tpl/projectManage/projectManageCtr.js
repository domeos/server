/*
 * @author ChandraLee
 */

 (function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('ProjectManageCtr', ['$scope', '$domeProject', '$timeout', function ($scope, $domeProject, $timeout) {
		$scope.projectList = [];
		$scope.isLoading = true;
		$scope.$emit('pageTitle', {
			title: '项目管理',
			descrition: '在这里把您的代码仓库和DomeOS对接即可创建新项目。此外，您还可以对现有项目进行查询和管理。',
			mod: 'projectManage'
		});
		var timeout;
		var init = function () {
			$domeProject.projectService.getData().then(function (res) {
				$scope.projectList = res.data.result || [];
			}).finally(function () {
				$scope.isLoading = false;
				if (timeout) {
					$timeout.cancel(timeout);
				}
				timeout = $timeout(init, 4000);
			});
		};
		init();
		$scope.openBuild = function (proid, hasCodeInfo) {
			$domeProject.buildProject(proid, hasCodeInfo);
		};
		$scope.$on('$destroy', function (argument) {
			if (timeout) {
				$timeout.cancel(timeout);
			}
		});
	}]);
})(window.domeApp);