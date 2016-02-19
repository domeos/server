domeApp.controller('createProjectCtr1', ['$scope', '$state', '$domeData', '$modal', '$domeProject', '$domeUser', '$domePublic', function($scope, $state, $domeData, $modal, $domeProject, $domeUser, $domePublic) {
		$scope.$emit('pageTitle', {
			title: '新建项目',
			descrition: '在这里把您的代码仓库和DomeOS对接即可创建新项目。此外，您还可以对现有项目进行查询和管理。',
			mod: 'projectManage'
		});
		$scope.pageNo = 1;
		$scope.projectList = [];
		$scope.pageSize = 8;
		$scope.codeManager = 'gitlab';
		$scope.useDockerFile = false;
		$scope.autoBuildInfo = {
			tag: 0,
			master: false,
			other: false,
			branches: ''
		};
		$scope.groupList = [];
		$scope.currentGroup = {};
		$scope.currentProject = {};
		//  如果是“上一步”进入本页面
		var createProjectInfo1 = angular.copy($domeData.getData('createProjectInfo1'));
		if (createProjectInfo1) {
			$domeData.delData('createProjectInfo1');
			$scope.projectName = createProjectInfo1.info.projectName;
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
			// 如果codeInfo存在，则初始化
			if (createProjectInfo1.info.codeInfo) {
				$scope.codeManager = createProjectInfo1.info.codeInfo.codeManager;
			} else {
				$scope.codeManager = null;
			}
			$scope.useDockerFile = createProjectInfo1.useDockerFile;
		}
		$scope.setProjectList = function(info) {
			$scope.pageNo = 1;
			$scope.currentUserId = info.id;
			$scope.projectList = info.projectInfos;
		};
		var getGitLabInfo = function() {
			$scope.isLoading = true;
			$domeProject.getGitLabInfo().then(function(res) {
				$scope.gitLabInfo = res.data.result;
				// 判断是否从“上一步”返回该页面，并初始化。
				var isFindLastProject = false;
				if ($domeData.getData('projectInfo') && $domeData.getData('projectInfo').info.codeInfo) {
					var codeInfo = $domeData.getData('projectInfo').info.codeInfo;
					for (var i = 0; i < $scope.gitLabInfo.length; i++) {
						if ($scope.gitLabInfo[i].id === codeInfo.userInfo) {
							$scope.setProjectList($scope.gitLabInfo[i]);
							for (var j = 0; j < $scope.projectList.length; j++) {
								if ($scope.projectList[j].projectId === codeInfo.codeId) {
									$scope.setCurrentProject($scope.projectList[j]);
									break;
								}
							}
							isFindLastProject = true;
							break;
						}
					}
				}
				if (!isFindLastProject) {
					if ($scope.gitLabInfo[0]) {
						$scope.setProjectList($scope.gitLabInfo[0]);
					}
				}
			}).finally(function() {
				$scope.isLoading = false;
			});
		};
		getGitLabInfo();
		$scope.toggleDockerFile = function() {
			$scope.useDockerFile = !$scope.useDockerFile;
		};
		$scope.toggleGroup = function(group) {
			$scope.currentGroup.projectBelong = group.name;
			$scope.currentGroup.type = group.type;
		};
		$domeUser.getGroupList().then(function(res) {
			$scope.groupList = res.data.result ? res.data.result : [];
			if (createProjectInfo1) {
				for (var i = 0; i < $scope.groupList.length; i++) {
					if (createProjectInfo1.info.projectBelong === $scope.groupList[i].name) {
						$scope.toggleGroup($scope.groupList[i]);
					}
				}
			} else {
				$scope.toggleGroup($scope.groupList[0]);
			}
		});
		$scope.toRelated = function() {
			var loginModalIns = $modal.open({
				templateUrl: 'loginModal.html',
				controller: 'loginModalCtr',
				size: 'md'
			});
			loginModalIns.result.then(function() {
				$domePublic.openPrompt('关联成功！');
				getGitLabInfo();
			});
		};
		$scope.toNext = function() {
			if ($scope.codeManager && !$scope.currentProject.projectId) {
				$domePublic.openWarning('请选择一个项目！');
				return;
			}
			var proInfo = {
				projectName: $scope.projectName,
				projectBelong: $scope.currentGroup.projectBelong,
				type: $scope.currentGroup.type
			};
			if ($scope.codeManager) {
				proInfo.autoBuildInfo = $scope.autoBuildInfo;
				proInfo.codeInfo = {
					codeManager: $scope.codeManager,
					codeSource: $scope.currentProject.nameWithNamespace,
					codeSshUrl: $scope.currentProject.sshUrl,
					codeHttpUrl: $scope.currentProject.httpUrl,
					codeId: $scope.currentProject.projectId,
					userInfo: $scope.currentUserId
				};
			} else if ($scope.useDockerFile) {
				$scope.useDockerFile = false;
			}
			$domeData.setData('projectInfo', {
				info: proInfo,
				useDockerFile: $scope.useDockerFile
			});
			$state.go('createProject/2');
		};
		$scope.isDescriptionNull = function(str) {
			var result = str;
			if (!str || str === '') {
				result = '无描述信息';
			}
			return result;
		};
		$scope.setCurrentProject = function(pro) {
			$scope.currentProject = pro;
		};
	}])
	.controller('loginModalCtr', ['$scope', '$http', '$modalInstance', '$domeUser', '$domePublic', function($scope, $http, $modalInstance, $domeUser, $domePublic) {
		$scope.toLogin = function() {
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
			$domeUser.relatedGitLab(data).then(function(userInfo) {
				$modalInstance.close();
			}, function() {
				$scope.errorTxt = '关联失败，请重试！';
				$scope.isWaiting = false;
			});
		};
		$scope.close = function() {
			$modalInstance.dismiss('cancel');
		};
	}]);