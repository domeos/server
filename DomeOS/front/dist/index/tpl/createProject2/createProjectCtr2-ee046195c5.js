(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('CreateProjectCtr2', ['$scope', '$modal', '$domeProject', '$domeImage', '$domeData', '$domePublic', '$state', function ($scope, $modal, $domeProject, $domeImage, $domeData, $domePublic, $state) {
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

			$scope.valid = {
				needValid: false,
				createdFileStoragePath: false
			};
			var initConig = function () {
				$scope.config = $scope.project.config;
				// $scope.config.userDefineDockerfile = lastPageInfo.projectType == 'dockerfile';
				$scope.project.customConfig.buildPath = '/';
				$scope.project.customConfig.dockerfilePath = '/Dockerfile';
				$scope.config.authority = 0;
			};
			$scope.project = $domeProject.getInstance('Project', {
				userDefineDockerfile: lastPageInfo.projectType == 'dockerfile',
				exclusiveBuild: {
					customType: lastPageInfo.projectType == 'custom' ? 'java' : null
				}
			});
			initConig();

			var create = function () {
				$scope.project.create().then(function () {
					$domePublic.openPrompt('新建成功！');
					$state.go('projectManage');
				}, function (res) {
					$domePublic.openWarning({
						title: '新建失败！',
						msg: 'Message:' + res.data.resultMsg
					});
				});
			};
			if (!$scope.config.userDefineDockerfile) {
				$domeImage.imageService.getExclusiveImages('java').then(function (res) {
					$scope.project.projectImagesIns.init(res.data.result);
					console.log($scope.project);
				});
				$domeImage.imageService.getBaseImages().then(function (res) {
					$scope.imageList = res.data.result;
				});
			}
			// 切换项目类型
			// @param type: 'allType'(通用配置)/'java'
			$scope.toggleProjectType = function (type) {
				// 如果没有改变
				if (type == 'allType' && !$scope.project.isUseCustom || type === $scope.project.isUseCustom && $scope.project.customConfig.customType) return;
				// 重置配置
				$scope.project.init();
				initConig();
				if (type == 'allType') {
					$scope.project.isUseCustom = false;
				} else {
					$scope.project.isUseCustom = true;
					$scope.project.customConfig.customType = type;
				}
			};
			$scope.validCreatedFileStoragePath = function () {
				if (!$scope.project.isUseCustom) {
					$scope.valid.createdFileStoragePath = true;
					return;
				}
				var createdFileStoragePath = $scope.project.customConfig.createdFileStoragePath;
				for (var i = 0, l = createdFileStoragePath.length; i < l; i++) {
					if (createdFileStoragePath[i].name) {
						$scope.valid.createdFileStoragePath = true;
						return;
					}
				}
				$scope.valid.createdFileStoragePath = false;
			};
			$scope.changeDockerfilePath = function (txt) {
				if (txt == '/') {
					$scope.config.dockerfileInfo.dockerfilePath = '/Dockerfile';
				} else {
					$scope.config.dockerfileInfo.dockerfilePath = txt + '/Dockerfile';
				}
			};
			$scope.getDockerfile = function () {
				$scope.config.name = lastPageInfo.info.projectBelong + '/' + lastPageInfo.info.name;
				$scope.config.codeInfo = lastPageInfo.info.codeInfo;
				$scope.config.autoBuildInfo = lastPageInfo.info.autoBuildInfo;

				$scope.project.getDockerfile();
			};
			$scope.toCopy = function () {
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'projectListModal.html',
					controller: 'ProjectListModalCtr',
					size: 'lg',
					resolve: {
						isUseDefineDockerfile: $scope.config.userDefineDockerfile,
						customType: function () {
							return $scope.project.customConfig.customType;
						}
					}
				});
				modalInstance.result.then(function (projectId) {
					$domeProject.projectService.getData(projectId).then(function (res) {
						var pro = res.data.result,
							customConfig = $scope.project.customConfig;
						delete pro.id;
						$scope.project.init(pro);
						if (!pro.userDefineDockerfile && pro.exclusiveBuild && pro.exclusiveBuild.customType) {
							$scope.project.projectImagesIns.toggleSpecifiedImage('compile', pro.exclusiveBuild.compileImage);
							$scope.project.projectImagesIns.toggleSpecifiedImage('run', pro.exclusiveBuild.runImage);
						}
						$scope.config = $scope.project.config;
						$scope.validCreatedFileStoragePath();
					});

				});
			};
			$scope.toLastPage = function () {
				$domeData.setData('createProjectInfo1', lastPageInfo);
				$state.go('createProject/1');
			};
			$scope.createProject = function () {
				$scope.config.name = lastPageInfo.info.projectBelong + '/' + lastPageInfo.info.name;
				$scope.config.codeInfo = lastPageInfo.info.codeInfo;
				$scope.config.autoBuildInfo = lastPageInfo.info.autoBuildInfo;
				$scope.project.creatorDraft = lastPageInfo.creatorDraft;
				create();
			};

		}])
		.controller('ProjectListModalCtr', ['$scope', '$modalInstance', '$domeProject', 'isUseDefineDockerfile', 'customType', function ($scope, $modalInstance, $domeProject, isUseDefineDockerfile, customType) {
			$scope.loading = true;
			$scope.key = {
				searchKey: ''
			};
			$domeProject.projectService.getData().then(function (res) {
				var projectList = res.data.result || [];
				for (var i = 0; i < projectList.length; i++) {
					if (isUseDefineDockerfile) {
						if (!projectList[i].userDefineDockerfile) {
							projectList.splice(i, 1);
							i--;
						}
					} else {
						if (projectList[i].userDefineDockerfile || !customType && projectList[i].projectType !== 'simple' || customType && projectList[i].projectType !== customType) {
							projectList.splice(i, 1);
							i--;
						}
					}
				}
				$scope.projectList = projectList;
			}).finally(function () {
				$scope.loading = false;
			});
			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};
			$scope.copy = function (projectId) {
				$modalInstance.close(projectId);
			};
		}]);
})(window.domeApp);