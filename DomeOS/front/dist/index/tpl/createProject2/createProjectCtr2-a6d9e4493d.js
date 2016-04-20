domeApp.controller('createProjectCtr2', ['$scope', '$modal', 'FileUploader', '$domeProject', '$domeImage', '$domeData', '$domePublic', '$state', function($scope, $modal, FileUploader, $domeProject, $domeImage, $domeData, $domePublic, $state) {
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
		$scope.uploader = new FileUploader({
			url: '/api/project/upload/file'
		});
		$scope.useDockerFile = lastPageInfo.useDockerFile;
		$scope.project = $domeProject.getProjectInstance();
		$scope.config = $scope.project.config;
		$scope.config.dockerfileInfo.buildPath = '/';
		$scope.config.dockerfileInfo.dockerfilePath = '/Dockerfile';
		var fileMap = {};
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
		$scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
			var fileData = response.result;
			for (var fileName in fileData) {
				$scope.config.uploadFile.push({
					md5: fileData[fileName],
					location: fileMap[fileName]
				});
			}
			console.info('onCompleteItem', $scope.config.uploadFile);
		};
		$scope.uploader.onCompleteAll = function() {
			create();
			$scope.uploader.queue = [];
			console.info('onCompleteAll');
		};
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
				size: 'lg'
			});
			modalInstance.result.then(function(projectId) {
				$domeProject.getProjectInfo(projectId).then(function(res) {
					var pro = res.data.result;
					delete pro.id;
					$scope.project = $domeProject.getProjectInstance(pro);
					$scope.config = $scope.project.config;
				}, function() {});

			});
		};
		$scope.toLastPage = function() {
			$domeData.setData('createProjectInfo1', lastPageInfo);
			$state.go('createProject/1');
		};
		$scope.createProject = function() {
			$scope.config.projectName = lastPageInfo.info.projectBelong + '/' + lastPageInfo.info.projectName;
			$scope.config.codeInfo = lastPageInfo.info.codeInfo;
			$scope.config.autoBuildInfo = lastPageInfo.info.autoBuildInfo;
			$scope.config.type = lastPageInfo.info.type;
			$scope.project.useDockerfile = $scope.useDockerFile;
			if ($scope.uploader.queue && $scope.uploader.queue.length !== 0) {
				for (var i = 0; i < $scope.uploader.queue.length; i++) {
					var location = $scope.uploader.queue[i].file.location;
					location = location.substr(-1) === '/' ? location : location + '/';
					fileMap[$scope.uploader.queue[i].file.name] = location + $scope.uploader.queue[i].file.name;
				}
				$scope.uploader.uploadAll();
			} else {
				create();
			}
		};

	}])
	.controller('projectListModalCtr', ['$scope', '$modalInstance', '$domeProject', function($scope, $modalInstance, $domeProject) {
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