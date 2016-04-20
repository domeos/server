domeApp.controller('hostDetailCtr', ['$scope', '$stateParams', '$domeCluster', '$domePublic', '$modal', '$state', function($scope, $stateParams, $domeCluster, $domePublic, $modal, $state) {
	'use strict';
	$scope.loading = true;
	var loadingItems = {
		host: true,
		instance: true
	};
	if (!$stateParams.name || !$stateParams.clusterId) {
		$state.go('clusterManage');
	}
	var hostname = $stateParams.name;
	var clusterId = $stateParams.clusterId;
	var envData = {
		testEnv: false,
		prodEnv: false
	};
	$scope.hostSetting = {
		labelTxt: '',
		diskTxt: '',
		isUsedToBuild: false
	};
	$scope.$emit('pageTitle', {
		title: hostname,
		descrition: '',
		mod: 'cluster'
	});
	// 面包屑 父级url
	$scope.parentState = 'clusterDetail({id:"' + clusterId + '"})';

	$scope.tabActive = [{
		active: false
	}, {
		active: false
	}];

	var stateInfo = $state.$current.name;
	if (stateInfo.indexOf('info') !== -1) {
		$scope.tabActive[1].active = true;
	} else {
		$scope.tabActive[0].active = true;
	}

	$domeCluster.getNodeInfo(clusterId, hostname).then(function(res) {
		var node = res.data.result;
		$scope.hostSetting.diskTxt = node.diskInfo;
		node.capacity.memory = (node.capacity.memory / 1024 / 1024).toFixed(2);
		node.statusTxt = node.status == 'Ready' ? '在线' : '离线';
		if (node.labels) {
			if (node.labels.TESTENV) {
				envData.testEnv = true;
			}
			if (node.labels.PRODENV) {
				envData.prodEnv = true;
			}
			$scope.envData = angular.copy(envData);
			delete node.labels['kubernetes.io/hostname'];
			delete node.labels.TESTENV;
			delete node.labels.PRODENV;
			delete node.labels.hostEnv;
			if (node.labels.BUILDENV) {
				$scope.hostSetting.isUsedToBuild = true;
				delete node.labels.BUILDENV;
			}
			$scope.labelsList = node.labels;
		}
		$scope.node = node;
	}, function() {
		$domePublic.openWarning('请求失败！');
		$state.go('clusterManage');
	}).finally(function() {
		loadingItems.host = false;
		if (!loadingItems.instance && $scope.loading) {
			$scope.loading = false;
		}
	});
	$domeCluster.getHostInstance(clusterId, hostname).then(function(res) {
		$scope.instanceList = res.data.result || [];
	}).finally(function() {
		loadingItems.instance = false;
		if (!loadingItems.host && $scope.loading) {
			$scope.loading = false;
		}
	});
	$scope.showLog = function(instanceName, containers, namespace) {
		$modal.open({
			templateUrl: 'index/tpl/modal/instanceLogModal/instanceLogModal.html',
			controller: 'instanceLogModalCtr',
			size: 'md',
			resolve: {
				instanceInfo: function() {
					return {
						clusterId: clusterId,
						namespace: namespace,
						instanceName: instanceName,
						containers: containers
					};
				}
			}
		});
	};
	$scope.toggleBuildEnv = function() {
		if (!$scope.hostSetting.isUsedToBuild) {
			var requestData = {
				node: hostname,
				labels: {
					BUILDENV: 'HOSTENVTYPE'
				}
			};
			$domeCluster.addLabel(clusterId, requestData).then(function() {
				$scope.hostSetting.isUsedToBuild = true;
			}, function() {
				$domePublic.openWarning('添加失败！');
			});

		} else {
			$domeCluster.deleteLabel(clusterId, hostname, 'BUILDENV').then(function(res) {
				$scope.hostSetting.isUsedToBuild = false;
			}, function() {
				$domePublic.openWarning('修改失败！');
			});
		}
		$scope.hostSetting.isUsedToBuild = !$scope.hostSetting.isUsedToBuild;
	};
	$scope.modifyEnv = function() {
		if (!$scope.envData.testEnv && !$scope.envData.prodEnv) {
			$domePublic.openWarning('请至少选中一个工作场景！');
			return;
		}
		var labels = {};
		var hasAddLabel = false;

		function deleteLable(label) {
			$domeCluster.deleteLabel(clusterId, hostname, label).then(function(res) {
				if (label === 'TESTENV') {
					envData.testEnv = false;
				} else if (label === 'PRODENV') {
					envData.prodEnv = false;
				}
			}, function() {
				$domePublic.openWarning('修改失败！');
			});
		}

		function isDeleteLabel() {
			if (!$scope.envData.testEnv && envData.testEnv) {
				deleteLable('TESTENV');
			}
			if (!$scope.envData.prodEnv && envData.prodEnv) {
				deleteLable('PRODENV');
			}

		}

		if ($scope.envData.testEnv && !envData.testEnv) {
			labels.TESTENV = 'HOSTENVTYPE';
			hasAddLabel = true;
		}

		if ($scope.envData.prodEnv && !envData.prodEnv) {
			labels.PRODENV = 'HOSTENVTYPE';
			hasAddLabel = true;
		}
		var addRequestData = {
			node: hostname,
			labels: labels
		};
		if (hasAddLabel) {
			$domeCluster.addLabel(clusterId, addRequestData).then(function() {
				if (addRequestData.labels.TESTENV) {
					envData.testEnv = true;
				}
				if (addRequestData.labels.PRODENV) {
					envData.prodEnv = true;
				}
			}, function() {
				$domePublic.openWarning('修改失败！');
			}).finally(function() { //添加完之后才能进行删除操作
				isDeleteLabel();
			});
		} else {
			isDeleteLabel();
		}
	};
	$scope.addLabel = function() {
		if (!$scope.hostSetting.labelTxt || $scope.hostSetting.labelTxt === '') {
			return;
		}
		var requestData = {
			node: hostname,
			labels: {}
		};
		requestData.labels[$scope.hostSetting.labelTxt] = 'USER_LABEL_VALUE';

		$domeCluster.addLabel(clusterId, requestData).then(function() {
			$scope.labelsList[$scope.hostSetting.labelTxt] = 'USER_LABEL_VALUE';
			$scope.hostSetting.labelTxt = '';
		}, function() {
			$domePublic.openWarning('添加失败！');
		});
	};
	$scope.deleteLable = function(label) {
		$domePublic.openConfirm('删除主机标签可能会影响部署，是否继续？').then(function() {
			$domeCluster.deleteLabel(clusterId, hostname, label).then(function(res) {
				delete $scope.labelsList[label];
			}, function() {
				$domePublic.openWarning('删除失败！');
			});
		});
	};
	$scope.saveDisk = function() {
		$domeCluster.modifyDisk(clusterId, hostname, $scope.hostSetting.diskTxt).then(function() {
			$domePublic.openPrompt('修改成功！');
		}, function() {
			$domePublic.openWarning('修改失败！');
		});
	};
	$scope.toConsole = function(index) {
		$modal.open({
			templateUrl: 'index/tpl/modal/selectContainerModal/selectContainerModal.html',
			controller: 'selectContainerModalCtr',
			size: 'md',
			resolve: {
				containerList: function() {
					return $scope.instanceList[index].containers;
				},
				hostIp: function() {
					return $scope.instanceList[index].hostIp;
				}
			}
		});
	};
}]);