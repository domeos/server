domeApp.controller('buildModalCtr', ['$scope', 'projectInfo', '$domeProject', '$domePublic', '$modalInstance', function($scope, projectInfo, $domeProject, $domePublic, $modalInstance) {
	'use strict';
	$scope.projectInfo = projectInfo;
	$scope.buildInfo = {
		selectedBranch:'',
		selectedCodetag:'',
		imageTag:''
	};
	$scope.BuildWay = 'branch';
	var getBuildList=function(){
		if ($scope.projectInfo.hasCodeInfo && $scope.BuildWay == 'branch') {
			$scope.buildInfo.selectedCodetag='';
			$domeProject.getBranchList($scope.projectInfo.projectId).then(function(res) {
				$scope.branches = res.data.result;
				$scope.buildInfo.selectedBranch = $scope.branches[0];
			}).finally(function() {
				
			});
		}
		if ($scope.projectInfo.hasCodeInfo && $scope.BuildWay == 'tag') {
			$scope.buildInfo.selectedBranch='';
			$domeProject.getTagList($scope.projectInfo.projectId).then(function(res) {
				$scope.tags = res.data.result;
				$scope.buildInfo.selectedCodetag = $scope.tags[0];
			}).finally(function() {
				
			});
		}
	};
	getBuildList();
	$scope.toggleSelect =function(value){
		$scope.BuildWay=value;
		getBuildList();
	};
	$scope.toggleBranch = function(branch) {
		$scope.buildInfo.selectedBranch = branch;
	};
	$scope.toggleTag = function(Tag) {
		$scope.buildInfo.selectedCodetag = Tag;
	};
	$scope.close = function() {
		$modalInstance.dismiss('cancel');
	};
	$scope.toBuild = function() {
		var buildInfo = {
			projectId: $scope.projectInfo.projectId,
			codeInfo : {}, //代码信息
			imageInfo : {} //镜像信息
		};
		if ($scope.projectInfo.hasCodeInfo ) {
			buildInfo.codeInfo.codeBranch = $scope.buildInfo.selectedBranch;
			buildInfo.codeInfo.codeTag = $scope.buildInfo.selectedCodetag;
		}
		 
		if ($scope.buildInfo.imageTag) {
			buildInfo.imageInfo.imageTag = $scope.buildInfo.imageTag;
		}
		// console.log(buildInfo);
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