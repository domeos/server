domeApp.controller('buildModalCtr', ['$scope', 'projectInfo', '$domeProject', '$domePublic', '$modalInstance', function($scope, projectInfo, $domeProject, $domePublic, $modalInstance) {
	'use strict';
	$scope.projectInfo = projectInfo;
	$scope.buildInfo = {
		selectedBranch:'',
		imageTag:''
	};
	if ($scope.projectInfo.hasCodeInfo) {
		$scope.isModalLoading = true;
		$domeProject.getBranchList($scope.projectInfo.projectId).then(function(res) {
			$scope.branches = res.data.result;
			$scope.buildInfo.selectedBranch = $scope.branches[0];
		}).finally(function() {
			$scope.isModalLoading = false;
		});
	}
	$scope.toggleBranch = function(branch) {
		$scope.buildInfo.selectedBranch = branch;
	};
	$scope.close = function() {
		$modalInstance.dismiss('cancel');
	};
	$scope.toBuild = function() {
		var buildInfo = {
			projectId: $scope.projectInfo.projectId
		};
		if ($scope.projectInfo.hasCodeInfo) {
			buildInfo.codeBranch = $scope.buildInfo.selectedBranch;
		}
		if ($scope.buildInfo.imageTag) {
			buildInfo.imageTag = $scope.buildInfo.imageTag;
		}
		$domeProject.toBuild(buildInfo).then(function(res) {
			if (res.data.resultCode == 200) {
				$modalInstance.close();
				$domePublic.openPrompt('成功，正在构建！');
			} else {
				$modalInstance.close();
				$domePublic.openWarning('构建失败！错误信息：' + res.data.resultMsg);
			}
		}, function() {
			$domePublic.openWarning('构建失败，请重试！');
		});
	};
}]);