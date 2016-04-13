domeApp.controller('createProjectCtr2', ['$scope', '$modal', '$domeProject', '$domeImage', '$domeData', '$domePublic', '$state', function($scope, $modal, $domeProject, $domeImage, $domeData, $domePublic, $state) {
		'use strict';
		$scope.$emit('pageTitle', {
			title: '新建项目',
			descrition: '在这里把您的代码仓库和DomeOS对接即可创建新项目。此外，您还可以对现有项目进行查询和管理。',
			mod: 'projectManage'
		});
		var lastPageInfo = angular.copy($domeData.getData('projectInfo'));
		$domeData.delData('projectInfo');
		if (!lastPageInfo) {
			$state.go('createProject/1');
			return;
		}
		$scope.showMoreInfo = false;

		$scope.project = $domeProject.getProjectInstance();
		$scope.config = $scope.project.config;
		$scope.config.userDefineDockerfile = lastPageInfo.userDefineDockerfile;
		$scope.config.dockerfileInfo.buildPath = '/';
		$scope.config.dockerfileInfo.dockerfilePath = '/Dockerfile';
		$scope.config.authority = 0;
		$scope.creatorDraft = $scope.project.creatorDraft;
		var create = function() {
			$scope.project.create().then(function() {
				$domePublic.openPrompt('新建成功！');
				$state.go('projectManage');
			}, function(res) {
				$domePublic.openWarning({
					title: '新建失败！',
					msg: 'Message:' + res.data.resultMsg
				});
			});
		};
		$domeImage.getBaseImageList().then(function(res) {
			$scope.imageList = res.data.result;
		});
		$scope.changeDockerfilePath = function(txt) {
			if (txt == '/') {
				$scope.config.dockerfileInfo.dockerfilePath = '/Dockerfile';
			} else {
				$scope.config.dockerfileInfo.dockerfilePath = txt + '/Dockerfile';
			}
		};
		$scope.toCopy = function() {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'projectListModal.html',
				controller: 'projectListModalCtr',
				size: 'lg',
				resolve: {
					isUseDefineDockerfile: $scope.config.userDefineDockerfile
				}
			});
			modalInstance.result.then(function(projectId) {
				$domeProject.getProjectInfo(projectId).then(function(res) {
					var pro = res.data.result;
					delete pro.id;
					$scope.project = $domeProject.getProjectInstance(pro);
					$scope.config = $scope.project.config;
					$scope.project.creatorDraft.creatorType = lastPageInfo.creatorDraft.creatorType;
					$scope.project.creatorDraft.creatorId = lastPageInfo.creatorDraft.creatorId;
				}, function() {});

			});
		};
		$scope.toLastPage = function() {
			$domeData.setData('createProjectInfo1', lastPageInfo);
			$state.go('createProject/1');
		};
		$scope.createProject = function() {
			$scope.config.name = lastPageInfo.info.projectBelong + '/' + lastPageInfo.info.name;
			$scope.config.codeInfo = lastPageInfo.info.codeInfo;
			$scope.config.autoBuildInfo = lastPageInfo.info.autoBuildInfo;
			// $scope.project.userDefineDockerfile = $scope.userDefineDockerfile;

			$scope.creatorDraft.creatorType = lastPageInfo.creatorDraft.creatorType;
			$scope.creatorDraft.creatorId = lastPageInfo.creatorDraft.creatorId;
			create();
		};

	}])
	.controller('projectListModalCtr', ['$scope', '$modalInstance', '$domeProject', 'isUseDefineDockerfile', function($scope, $modalInstance, $domeProject, isUseDefineDockerfile) {
		$scope.isUseDefineDockerfile = isUseDefineDockerfile;
		$domeProject.getProjectList().then(function(res) {
			$scope.projectList = res.data.result;
		});
		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};
		$scope.copy = function(projectId) {
			$modalInstance.close(projectId);
		};
	}]);