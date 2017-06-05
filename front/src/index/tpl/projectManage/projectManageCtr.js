/*
 * @author ChandraLee
 */

 (function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('ProjectManageCtr', ['$scope', '$state', '$domeProject', '$timeout', '$domeUser', function ($scope, $state, $domeProject, $timeout, $domeUser) {
		$scope.$emit('pageTitle', {
			title: '项目管理',
			descrition: '在这里把您的代码仓库和DomeOS对接即可创建新项目。此外，您还可以对现有项目进行查询和管理。',
			mod: 'projectManage'
		});
		if (!$state.params.id) {
			$state.go('projectCollectionManage');
		}
		$scope.resourceType = 'PROJECT_COLLECTION';
		$scope.resourceId = $state.params.id;
		$scope.userRole = null;
		$scope.setRole = function (role) { $scope.userRole = role; };
		$scope.mayCreateProject = function () { return $scope.userRole === 'MASTER' || $scope.userRole === 'DEVELOPER' };
		$scope.exitToList = function () {
		  $state.go('projectCollectionManage');
		};
		$scope.projectList = [];
		$scope.isLoading = true;
		$scope.tabActive = [{
			active: false
		}, {
			active: false
		}, {
			active: false
		}];
		var timeout;
		var init = function () {
			$domeProject.projectService.getProject($scope.resourceId).then(function (res) {
				$scope.projectList = res.data.result || [];
			}).finally(function () {
				$scope.isLoading = false;
				if (timeout) {
					$timeout.cancel(timeout);
				}
				timeout = $timeout(init, 4000);
			});
		};
		$domeProject.projectService.getProjectCollectionNameById($scope.resourceId).then(function (res) {
			$scope.projectCollectionName = res.data.result || '';
		});
		init();
		$scope.openBuild = function (proid, hasCodeInfo) {
			$domeProject.buildProject(proid, hasCodeInfo);
		};
		$scope.addUser = function (proid, hasCodeInfo) {
			$domeProject.addProjectCollectionUser(proid, hasCodeInfo);
		};
		$scope.$on('$destroy', function (argument) {
			if (timeout) {
				$timeout.cancel(timeout);
			}
		});
		var stateInfo = $state.$current.name;
		if (stateInfo.indexOf('user') !== -1) {
			$scope.tabActive[1].active = true;
		} else if (stateInfo.indexOf('project') !== -1) {
			$scope.tabActive[0].active = true;
		}
	}]);
})(angular.module('domeApp'));