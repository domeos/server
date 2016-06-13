domeApp.controller('projectDetailCtr', ['$scope', '$state', '$stateParams', '$domeProject', '$domePublic', '$domeImage', '$modal', '$timeout', '$location', function($scope, $state, $stateParams, $domeProject, $domePublic, $domeImage, $modal, $timeout, $location) {
	'use strict';
	$scope.projectId = $stateParams.project;
	$scope.branch = 'master';
	$scope.needValid = false;
	$scope.edit = false;
	$scope.isWaitingForModify = false;
	$scope.statusKey = '';
	$scope.autoBuildKey = '';
	// 项目成员的资源类型
	$scope.resourceType = 'PROJECT';
	$scope.resourceId = $scope.projectId;

	$scope.tabActive = [{
		active: false
	}, {
		active: false
	}, {
		active: false
	}, {
		active: false
	}, {
		active: false
	}];

	$scope.$on('memberPermisson', function(event, hasPermisson) {
		$scope.hasMemberPermisson = hasPermisson;
		if (!hasPermisson && stateInfo.indexOf('user') !== -1) {
			$state.go('projectDetail.info');
			$scope.tabActive[0].active = true;
		}
	});
	var editProject, project, fileMap = {},
		timeout;
	var initProjectInfo = function() {
		$domeProject.getProjectInfo($scope.projectId).then(function(res) {
			project = $scope.project = $domeProject.getProjectInstance(res.data.result);
			editProject = angular.copy(project);
			$scope.config = $scope.project.config;
			$scope.$emit('pageTitle', {
				title: $scope.config.name,
				descrition: '更新于' + $scope.parseDate($scope.config.lastModify),
				mod: 'projectManage'
			});
		});
	};
	initProjectInfo();
	var modify = function() {
		$scope.isWaitingForModify = true;
		$scope.project.modify().then(function() {
			$domePublic.openPrompt('修改成功！');
			$scope.checkEdit();
			initProjectInfo();
			$scope.needValid = false;
		}, function(res) {
			$domePublic.openWarning({
				title: '修改失败！',
				msg: 'Message:' + res.data.resultMsg
			});
		}).finally(function() {
			$scope.isWaitingForModify = false;
		});
	};
	var openDockerfile = function() {
		$modal.open({
			animation: true,
			templateUrl: 'dockerfileModal.html',
			controller: 'dockerfileModalCtr',
			size: 'md',
			resolve: {
				project: function() {
					return $scope.project;
				}
			}
		});
	};
	$domeImage.getBaseImageList().then(function(res) {
		$scope.imageList = res.data.result;
	});
	$scope.checkEdit = function() {
		$scope.edit = !$scope.edit;
		if ($scope.edit) {
			$scope.project = editProject;
			var buildPath = $scope.project.config.dockerfileInfo.buildPath,
				dockerfilePath = $scope.project.config.dockerfileInfo.dockerfilePath;
			if (!buildPath || buildPath === '') {
				$scope.project.config.dockerfileInfo.buildPath = '/';
			}
			if (!dockerfilePath || dockerfilePath === '') {
				$scope.project.config.dockerfileInfo.dockerfilePath = '/Dockerfile';
			}
		} else {
			editProject = angular.copy(project);
			$scope.project = project;
		}
		$scope.config = $scope.project.config;
	};
	$scope.getBuildList = function() {
		$domeProject.getBuildList($scope.projectId).then(function(res) {
			var buildList = res.data.result || [],
				requestUrl = $location.host(),
				logUrl;
			if ($location.port()) {
				requestUrl += ':' + $location.port();
			}
			for (var i = 0; i < buildList.length; i++) {
				if (buildList[i].state === 'Success' || buildList[i].state === 'Fail') {
					logUrl = $location.protocol() + '://' + requestUrl + '/api/ci/build/download/' + buildList[i].projectId + '/' + buildList[i].id;
				} else if (buildList[i].state === 'Building') {
					logUrl = 'ws://' + requestUrl + '/api/ci/build/log/realtime?buildId=' + buildList[i].id;
				} else {
					logUrl = '';
				}
				buildList[i].logHref = '/log/log.html?url=' + encodeURIComponent(logUrl);
			}
			$scope.buildList = res.data.result;
		});
	};
	$scope.changeDockerfilePath = function(txt) {
		$scope.config.dockerfileInfo.dockerfilePath = txt + '/Dockerfile';
	};
	$scope.startEdit = function() {
		$scope.edit = !$scope.edit;
	};
	$scope.isNoSet = function(str) {
		if (!str) {
			str = '未设置';
		}
		return str;
	};
	$scope.submitModify = function() {
		modify();
	};
	$scope.deleteProject = function() {
		$scope.project.delete().then(function() {
			$state.go('projectManage');
		});
	};
	$scope.toggleStatus = function(status) {
		if (status === $scope.statusKey) {
			$scope.statusKey = '';
		} else {
			$scope.statusKey = status;
		}
	};
	$scope.toggleAutoBuild = function(autoBuild) {
		if (autoBuild === $scope.autoBuildKey) {
			$scope.autoBuildKey = '';
		} else {
			$scope.autoBuildKey = autoBuild;
		}
	};
	$scope.modifyCI = function() {
		$scope.isWaitingForModify = true;
		modify();
	};
	$scope.openBuild = function() {
		$domeProject.buildProject($scope.config.id, !!$scope.config.codeInfo).then(function() {
			$scope.getBuildList();
		});
	};
	$scope.getDockerfile = function() {
		if ($scope.config.userDefineDockerfile) {
			var useDockerfileModalIns = $modal.open({
				templateUrl: 'branchCheckModal.html',
				controller: 'branchCheckModalCtr',
				size: 'md',
				resolve: {
					projectId: function() {
						return $scope.config.id;
					}
				}
			});
			useDockerfileModalIns.result.then(function(branch) {
				$scope.config.dockerfileInfo.branch = branch;
				openDockerfile();
			});
		} else {
			openDockerfile();
		}
	};
	var stateInfo = $state.$current.name;
	if (stateInfo.indexOf('config') !== -1) {
		$scope.tabActive[1].active = true;
	} else if (stateInfo.indexOf('autobuild') !== -1) {
		$scope.tabActive[2].active = true;
	} else if (stateInfo.indexOf('buildlog') !== -1) {
		$scope.tabActive[3].active = true;
		$scope.getBuildList();
	} else if (stateInfo.indexOf('user') !== -1) {
		$scope.tabActive[4].active = true;
	} else {
		$scope.tabActive[0].active = true;
	}
}]).controller('dockerfileModalCtr', ['$scope', '$modalInstance', 'project', '$domeProject', '$sce', function($scope, $modalInstance, project, $domeProject, $sce) {
	project.getDockerfile().then(function(res) {
		if (res.data.resultCode == 200) {
			if (res.data.result) {
				$scope.dockerfileTxt = $sce.trustAsHtml(res.data.result.replace(/[\n\r]/g, '<br/>'));
			} else {
				$scope.dockerfileTxt = $sce.trustAsHtml('无数据！');
			}
		} else {
			$scope.dockerfileTxt = $sce.trustAsHtml('<h4 class="txt-error">请求失败！</h4><p class="txt-error">错误信息：' + res.data.resultMsg + '</p>');
		}
	}, function() {
		$scope.dockerfileTxt = $sce.trustAsHtml('<p class="txt-error">请求失败！</p>');
	});
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
}]).controller('branchCheckModalCtr', ['$scope', '$modalInstance', '$domeProject', 'projectId', function($scope, $modalInstance, $domeProject, projectId) {
	$domeProject.getBranchList(projectId).then(function(res) {
		$scope.branches = res.data.result;
		$scope.selectedBranch = $scope.branches[0];
	});
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
	$scope.submitBranch = function() {
		$modalInstance.close($scope.selectedBranch);
	};
	$scope.toggleBranch = function(branch) {
		$scope.selectedBranch = branch;
	};
}]);