domeApp.controller('projectDetailCtr', ['$scope', '$stateParams', '$domeProject', '$domePublic', '$domeImage', 'FileUploader', '$modal', '$interval', function($scope, $stateParams, $domeProject, $domePublic, $domeImage, FileUploader, $modal, $interval) {
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
	$scope.$on('memberPermisson', function(event, hasPermisson) {
		$scope.hasMemberPermisson = hasPermisson;
	});
	$scope.tabActive = [{
		active: true
	}, {
		active: false
	}, {
		active: false
	}, {
		active: false
	}, {
		active: false
	}];
	var editProject, project, fileMap = {};
	var initProjectInfo = function() {
		$domeProject.getProjectInfo($scope.projectId).then(function(res) {
			project = $scope.project = $domeProject.getProjectInstance(res.data.result);
			editProject = angular.copy(project);
			$scope.config = $scope.project.config;
			$scope.$emit('pageTitle', {
				title: $scope.config.projectName,
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
	var showDockerfile = function() {
		function openDockerfile() {
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
		}
		if ($scope.project.useDockerfile) {
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
	var setFileMap = function() {
		fileMap = {};
		if ($scope.uploader.queue && $scope.uploader.queue.length !== 0) {
			for (var i = 0; i < $scope.uploader.queue.length; i++) {
				var location = $scope.uploader.queue[i].file.location;
				location = location.substr(-1) === '/' ? location : location + '/';
				fileMap[$scope.uploader.queue[i].file.name] = location + $scope.uploader.queue[i].file.name;
			}
		}
	};
	$domeImage.getBaseImageList().then(function(res) {
		$scope.imageList = res.data.result;
	});
	$scope.uploader = new FileUploader({
		url: '/api/project/upload/file'
	});
	$scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
		var fileData = response.result;
		for (var fileName in fileData) {
			$scope.config.uploadFile.push({
				md5: fileData[fileName],
				location: fileMap[fileName]
			});
		}
	};
	$scope.uploader.onCompleteAll = function(fileItem) {
		if ($scope.currentOptions == 'getDockerfile') {
			showDockerfile();
		} else if ($scope.currentOptions == 'modify') {
			modify();
		}
		$scope.uploader.queue = [];
		$scope.currentOptions = null;
		// modify();
	};
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
			$scope.uploader.queue = [];
		}
		$scope.config = $scope.project.config;
	};
	$scope.getBuildList = function() {
		$domeProject.getBuildList($scope.projectId).then(function(res) {
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
		if ($scope.uploader.queue && $scope.uploader.queue.length !== 0) {
			$scope.currentOptions = 'modify';
			setFileMap();
			$scope.uploader.uploadAll();
		} else {
			modify();
		}
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
	$scope.getBuildLog = function(proId, buildId, status) {
		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'logInfoModal.html',
			controller: 'logInfoModalCtr',
			size: 'lg',
			resolve: {
				params: function() {
					return {
						projectId: proId,
						buildId: buildId,
						status: status
					};
				}
			}
		});
	};
	$scope.getDockerfile = function() {
		if ($scope.edit && $scope.uploader.queue.length !== 0) {
			$scope.currentOptions = 'getDockerfile';
			$scope.uploader.uploadAll();
			setFileMap();
			return;
		}
		showDockerfile();
	};
}]).controller('logInfoModalCtr', ['$scope', 'params', '$domeProject', '$sce', '$location', function($scope, params, $domeProject, $sce, $location) {
	var logSocket, strLog = '',
		requestUrl = 'ws://' + $location.host();
	if ($location.port()) {
		requestUrl += ':' + $location.port();
	}
	if (params.status === 'Success' || params.status === 'Fail') {
		$domeProject.getFinishBuildLog(params.projectId, params.buildId).then(function(res) {
			if (res.data.result) {
				var strLog = res.data.result.replace(/[\n\r]/g, '<br>');
				$scope.log = $sce.trustAsHtml(strLog);
			} else {
				$scope.log = $sce.trustAsHtml('<p class="nolog">无日志信息</p>');
			}
		});
	} else if (params.status === 'Building') {
		logSocket = new WebSocket(requestUrl + '/api/ci/build/log/realtime?buildId=' + params.buildId);

		var onMessage = function(event) {
			strLog = (strLog + event.data).replace(/[\n]/g, '<br>');
			$scope.$apply(function() {　　
				$scope.log = $sce.trustAsHtml(strLog);
			});
		};

		var onOpen = function(event) {
			console.log("连接打开！");
		};
		logSocket.onopen = function(event) {
			onOpen(event);
		};
		logSocket.onmessage = function(event) {
			onMessage(event);
		};
		logSocket.onclose = function() {
			console.log('连接被关闭！');
		};
	} else {
		$scope.log = $sce.trustAsHtml('<p class="nolog">无日志信息</p>');
	}
	$scope.$on("$destroy", function() {
		if (logSocket) {
			logSocket.close();
			return false;
		}
	});
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