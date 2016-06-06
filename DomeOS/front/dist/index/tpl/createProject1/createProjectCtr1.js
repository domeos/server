domeApp.controller('CreateProjectCtr1', ['$scope', '$state', '$domeData', '$modal', '$domeProject', '$domePublic', function ($scope, $state, $domeData, $modal, $domeProject, $domePublic) {
		'use strict';
		$scope.$emit('pageTitle', {
			title: '新建项目',
			descrition: '在这里把您的代码仓库和DomeOS对接即可创建新项目。此外，您还可以对现有项目进行查询和管理。',
			mod: 'projectManage'
		});
		$scope.pageNo = 1;
		$scope.pageSize = 8;
		$scope.projectList = [];
		$scope.creator = {};
		$scope.codeManager = 'gitlab';
		$scope.autoBuildInfo = {
			tag: 0,
			master: false,
			other: false,
			branches: ''
		};
		$scope.role = 'user';
		$scope.projectType = 'common'; // 'common' / 'custom' / 'dockerfile'
		// $scope.currentGroup = {};
		$scope.currentProject = {};
		//  如果是“上一步”进入本页面
		var createProjectInfo1 = angular.copy($domeData.getData('createProjectInfo1'));
		if (createProjectInfo1) {
			$domeData.delData('createProjectInfo1');
			if (createProjectInfo1.info.codeInfo) {
				$scope.currentProject = (function () {
					var codeInfo = createProjectInfo1.info.codeInfo;
					return {
						nameWithNamespace: codeInfo.nameWithNamespace,
						sshUrl: codeInfo.codeSshUrl,
						httpUrl: codeInfo.codeHttpUrl,
						projectId: codeInfo.codeId
					};
				})();
				$scope.currentUserId = createProjectInfo1.info.codeInfo.codeManagerUserId;
			}
			$scope.codeManager = createProjectInfo1.codeManager;
			$scope.creator = {
				id: createProjectInfo1.creatorDraft.creatorId,
				type: createProjectInfo1.creatorDraft.creatorType
			};
			$scope.projectName = createProjectInfo1.info.name;
			if (createProjectInfo1.info.autoBuildInfo) {
				$scope.autoBuildInfo = createProjectInfo1.info.autoBuildInfo;
			} else {
				$scope.autoBuildInfo = {
					tag: 0,
					master: false,
					other: false,
					branches: ''
				};
			}
			$scope.projectType = createProjectInfo1.projectType;
		}
		$scope.setProjectList = function (info) {
			$scope.pageNo = 1;
			$scope.currentUserId = info.id;
			$scope.projectList = info.projectInfos;
		};
		var getGitLabInfo = function () {
			$scope.isLoading = true;
			$domeProject.projectService.getGitLabInfo().then(function (res) {
				$scope.gitLabInfo = res.data.result;
				// 判断是否从“上一步”返回该页面，并初始化。
				if ($scope.currentUserId && $scope.currentProject) {
					for (var i = 0; i < $scope.gitLabInfo.length; i++) {
						if ($scope.gitLabInfo[i].id === $scope.currentUserId) {
							$scope.setProjectList($scope.gitLabInfo[i]);
							for (var j = 0; j < $scope.projectList.length; j++) {
								if ($scope.projectList[j].projectId === $scope.currentProject.projectId) {
									$scope.setCurrentProject($scope.projectList[j]);
									break;
								}
							}
							break;
						}
					}
				} else {
					if ($scope.gitLabInfo[0]) {
						$scope.setProjectList($scope.gitLabInfo[0]);
					}
				}
			}).finally(function () {
				$scope.isLoading = false;
			});
		};
		getGitLabInfo();

		$scope.toggleCodeManager = function (codeManager) {
			$scope.codeManager = codeManager;
			if (!codeManager && ($scope.projectType == 'dockerfile' || $scope.projectType == 'custom')) {
				$scope.projectType = 'common';
			}
			$scope.$broadcast('changeScrollList', new Date());
		};
		$scope.toRelated = function () {
			var loginModalIns = $modal.open({
				templateUrl: 'loginModal.html',
				controller: 'LoginModalCtr',
				size: 'md'
			});
			loginModalIns.result.then(function () {
				$domePublic.openPrompt('关联成功！');
				getGitLabInfo();
			});
		};
		$scope.changeCreator = function (user) {
			$scope.creator = user;
		};
		$scope.toNext = function () {
			if ($scope.codeManager && !$scope.currentProject.projectId) {
				$domePublic.openWarning('请选择一个项目！');
				return;
			}
			var creatorInfo = {
				creatorType: $scope.creator.type,
				creatorId: $scope.creator.id
			};
			var proInfo = {
				name: $scope.projectName,
				projectBelong: $scope.creator.name
			};

			//使用gitlab
			if ($scope.codeManager) {
				//自动构建
				proInfo.autoBuildInfo = $scope.autoBuildInfo;
				proInfo.codeInfo = {
					codeManager: $scope.codeManager,
					nameWithNamespace: $scope.currentProject.nameWithNamespace,
					codeSshUrl: $scope.currentProject.sshUrl,
					codeHttpUrl: $scope.currentProject.httpUrl,
					codeId: $scope.currentProject.projectId,
					codeManagerUserId: $scope.currentUserId
				};
			}

			$domeData.setData('projectInfo', {
				creatorDraft: creatorInfo,
				codeManager: $scope.codeManager,
				info: proInfo,
				projectType: $scope.projectType
			});
			$state.go('createProject/2');
		};
		$scope.isDescriptionNull = function (str) {
			var result = str;
			if (!str) {
				result = '无描述信息';
			}
			return result;
		};
		$scope.setCurrentProject = function (pro) {
			$scope.currentProject = pro;
		};
	}])
	.controller('LoginModalCtr', ['$scope', '$http', '$modalInstance', '$domeUser', function ($scope, $http, $modalInstance, $domeUser) {
		$scope.toLogin = function () {
			$scope.errorTxt = '';
			$scope.isWaiting = true;
			var index = $scope.username.indexOf('@');
			var username = $scope.username;
			if (index !== -1) {
				username = username.substring(0, index);
			}
			var data = {
				login: username,
				password: $scope.password
			};
			$domeUser.relatedGitLab(data).then(function () {
				$modalInstance.close();
			}, function () {
				$scope.errorTxt = '关联失败，请重试！';
				$scope.isWaiting = false;
			});
		};
		$scope.close = function () {
			$modalInstance.dismiss('cancel');
		};
	}]);