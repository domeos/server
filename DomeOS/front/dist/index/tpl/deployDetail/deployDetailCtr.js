domeApp.controller('deployDetailCtr', ['$scope', '$domeDeploy', '$domeCluster', '$domePublic', '$stateParams', '$state', '$modal', '$interval', function($scope, $domeDeploy, $domeCluster, $domePublic, $stateParams, $state, $modal, $interval) {
	'use strict';
	$scope.$emit('pageTitle', {
		title: '部署',
		descrition: '',
		mod: 'deployManage'
	});
	if (!$stateParams.id) {
		$state.go('deployManage');
	}
	$scope.needValid = false;
	var deployId = parseInt($stateParams.id);
	var clusterList = [];
	$scope.resourceType = 'DEPLOY';
	$scope.resourceId = deployId;
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
	}, {
		active: false
	}];
	$scope.labelKey = {
		key: ''
	};
	$scope.$on('memberPermisson', function(event, hasPermisson) {
		$scope.hasMemberPermisson = hasPermisson;
	});
	var loadingsIns = $scope.loadingsIns = $domePublic.getLoadingInstance();
	var getEvent = function() {
		$domeDeploy.getDeployEvents(deployId).then(function(res) {
			$scope.eventsList = res.data.result || [];

			function formartProcessStatusArr(statusList) {
				var formartedStatus = [];
				if (!statusList || statusList.length === 0) {
					return [{
						version: '无状态',
						replicas: '0实例'
					}];
				}
				for (var i = 0; i < statusList.length; i++) {
					formartedStatus.push({
						version: 'version' + statusList[i].version,
						replicas: statusList[i].replicas + '实例'
					});
				}
				return formartedStatus;
			}
			for (var i = 0; i < $scope.eventsList.length; i++) {
				var thisEvent = $scope.eventsList[i];
				thisEvent.date = $scope.parseDate(thisEvent.startTime);
				thisEvent.primarySnapshot = formartProcessStatusArr(thisEvent.primarySnapshot);
				thisEvent.targetSnapshot = formartProcessStatusArr(thisEvent.targetSnapshot);
				thisEvent.currentSnapshot = formartProcessStatusArr(thisEvent.currentSnapshot);
				switch (thisEvent.operation) {
					case 'UPDATE':
						thisEvent.optTxt = '升级';
						break;
					case 'ROLLBACK':
						thisEvent.optTxt = '回滚';
						break;
					case 'SCALE_UP':
						thisEvent.optTxt = '扩容';
						break;
					case 'SCALE_DOWN':
						thisEvent.optTxt = '缩容';
						break;
					case 'CREATE':
						thisEvent.optTxt = '创建';
						break;
					case 'START':
						thisEvent.optTxt = '启动';
						break;
					case 'STOP':
						thisEvent.optTxt = '停止';
						break;
					case 'DELETE':
						thisEvent.optTxt = '删除';
						break;
				}
				switch (thisEvent.eventStatus) {
					case 'START':
						thisEvent.statusTxt = '开始';
						break;
					case 'PROCESSING':
						thisEvent.statusTxt = '处理中';
						break;
					case 'SUCCESS':
						thisEvent.statusTxt = '成功';
						break;
					case 'FAILED':
						thisEvent.statusTxt = '失败';
						break;
				}
			}
		});
	};
	var getDeployInstance = function() {
		$domeDeploy.getDeployInsList(deployId).then(function(res) {
			$scope.instanceList = res.data.result;
		});
	};
	var interval = $interval(function() {
		if (location.href.indexOf('deployDetail') === -1) {
			$interval.cancel(interval);
		}
		if ($scope.deployIns) {
			$scope.deployIns.freshDeploy();
		}
	}, 4000);
	var init = function() {
		loadingsIns.startLoading('fresh');
		getEvent();
		getDeployInstance();
		$domeDeploy.getDeployInfo(deployId).then(function(res) {
			var data = res.data.result;
			$scope.$emit('pageTitle', {
				title: data.deployName,
				descrition: data.serviceDnsName,
				mod: 'deployManage'
			});
			$scope.deployIns = $domeDeploy.getInstance('EditDeploy', angular.copy(res.data.result));
			$scope.config = $scope.deployIns.config;
			// 初始化clusterlist
			$scope.deployIns.clusterListIns.init(angular.copy(clusterList));
			// 选择当前version的cluster
			$scope.deployIns.toggleCluster();

			$scope.deployEditIns = $domeDeploy.getInstance('EditDeploy', angular.copy(res.data.result));
			$scope.editConfig = $scope.deployEditIns.config;
			$scope.deployEditIns.clusterListIns.init(angular.copy(clusterList));
			$scope.deployEditIns.toggleCluster();

			$scope.showdeploy = angular.copy(data);
			if ($scope.showdeploy.networkMode === 'HOST') {
				$scope.showdeploy.serviceDnsName = 'Host网络下没有内网域名';
				if ($scope.showdeploy.exposePortNum !== 0) {
					$scope.showdeploy.visitSet = '允许访问';
				} else {
					$scope.showdeploy.visitSet = '禁止访问';
				}

			} else {
				if ($scope.showdeploy.loadBalanceDrafts && $scope.showdeploy.loadBalanceDrafts.length !== 0) {
					$scope.showdeploy.visitSet = '对外服务开启';
				} else if ($scope.showdeploy.innerServiceDrafts && $scope.showdeploy.innerServiceDrafts.length !== 0) {
					$scope.showdeploy.visitSet = '对内服务开启';
				} else {
					$scope.showdeploy.visitSet = '禁止访问';
					$scope.showdeploy.serviceDnsName = '未开启访问设置，不提供内网域名';
				}
			}
		}, function() {
			$domePublic.openWarning('请求失败！');
			$state.go('deployManage');
		}).finally(function() {
			loadingsIns.finishLoading('fresh');
			loadingsIns.finishLoading('init');
		});
	};
	loadingsIns.startLoading('init');
	$domeCluster.getClusterList().then(function(res) {
		clusterList = res.data.result || [];
		init();
	});
	$scope.labelKeyDown = function(event, str, labelsInfoFiltered) {
		var lastSelectLabelKey;
		var labelsInfo = $scope.deployEditIns.nodeListIns.labelsInfo;
		var hasSelected = false;
		if (event.keyCode == 13 && labelsInfoFiltered) {
			angular.forEach(labelsInfoFiltered, function(value, label) {
				if (!hasSelected && !value.isSelected) {
					$scope.deployEditIns.nodeListIns.toggleLabel(label, true);
					$scope.labelKey.key = '';
				}
				hasSelected = true;
			});
		} else if ((!str || str === '') && event.keyCode == 8) {
			angular.forEach(labelsInfo, function(value, key) {
				if (value.isSelected) {
					lastSelectLabelKey = key;
				}
			});
			if (lastSelectLabelKey) {
				$scope.deployEditIns.nodeListIns.toggleLabel(lastSelectLabelKey, false);
			}
		}
	};
	$scope.toggleVersion = function(versionId) {
		$scope.deployIns.toggleVersion(versionId);
	};
	$scope.recover = function() {
		$scope.isWaitingRecover = true;
		$scope.deployIns.recoverVersion().then(function() {
			$domePublic.openPrompt('已提交，正在恢复。');
			init();
		}, function(res) {
			if (res != 'dismiss') {
				$domePublic.openWarning('恢复失败！');
			}
		}).finally(function() {
			$scope.isWaitingRecover = false;
		});
	};
	$scope.startVersion = function() {
		$scope.isWaitingStart = true;
		$scope.deployIns.startVersion().then(function() {
			init();
		}, function(res) {
			if (res != 'dismiss') {
				$domePublic.openWarning('启动失败！');
			}
		}).finally(function() {
			$scope.isWaitingStart = false;
		});
	};
	$scope.stopVersion = function() {
		$scope.isWaitingStop = true;
		$scope.deployIns.stop().then(function() {
			$domePublic.openPrompt('已发送，正在停止！');
			init();
		}, function() {
			$domePublic.openWarning('停止失败！');
		}).finally(function() {
			$scope.isWaitingStop = false;
		});
	};
	$scope.showLog = function(instanceName, containers) {
		$modal.open({
			templateUrl: 'index/tpl/modal/instanceLogModal/instanceLogModal.html',
			controller: 'instanceLogModalCtr',
			size: 'md',
			resolve: {
				instanceInfo: function() {
					return {
						clusterId: $scope.deployIns.config.clusterId,
						namespace: $scope.deployIns.config.namespace,
						instanceName: instanceName,
						containers: containers
					};
				}
			}
		});
	};
	$scope.toUpdate = function() {
		if ($scope.editConfig.containerDrafts.length === 0) {
			$domePublic.openWarning('请至少选择一个镜像！');
		} else {
			$scope.isWaitingUpdate = true;
			$scope.deployEditIns.createVersion().then(function(msg) {
				$scope.deployIns.freshVersionList();
				if (msg == 'update') {
					init();
				}
			}).finally(function() {
				$scope.isWaitingUpdate = false;
			});
		}
	};
	$scope.scaleVersion = function() {
		$scope.isWaitingScale = true;
		$scope.deployIns.scale().then(function() {
			init();
		}).finally(function() {
			$scope.isWaitingScale = false;
		});
	};
	$scope.updateVersion = function() {
		$scope.isWaitingUpVersion = true;
		$scope.deployIns.updateVersion().then(function() {
			init();
		}, function(res) {
			if (res != 'dismiss') {
				$domePublic.openWarning('升级失败！');
			}
		}).finally(function() {
			$scope.isWaitingUpVersion = false;
		});
	};
	$scope.deleteDeploy = function() {
		$domePublic.openDelete().then(function() {
			$scope.deployIns.delete().then(function() {
				$domePublic.openPrompt('删除成功！');
				$state.go('deployManage');
			}, function(res) {
				$domePublic.openWarning('删除失败！');
			});
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

}]).controller('versionListModalCtr', ['$scope', '$domeDeploy', 'deployInfo', '$modalInstance', function($scope, $domeDeploy, deployInfo, $modalInstance) {
	var deployId = deployInfo.deployId;
	$scope.stateful = deployInfo.stateful;
	$scope.versionData = {
		replicas: deployInfo.defaultReplicas
	};
	$domeDeploy.getVersionList(deployId).then(function(res) {
		$scope.versionList = res.data.result || [];
		if ($scope.versionList[0]) {
			$scope.checkVersion($scope.versionList[0].version);
		}
	});
	$scope.checkVersion = function(version) {
		$scope.versionData.versionId = version;
	};
	$scope.submit = function() {
		if ($scope.stateful) {
			delete $scope.versionData.replicas;
		}
		$modalInstance.close($scope.versionData);
	};
}]).controller('scaleModalCtr', ['$scope', 'oldReplicas', '$modalInstance', function($scope, oldReplicas, $modalInstance) {
	$scope.oldReplicas = oldReplicas;
	$scope.submitScale = function() {
		$modalInstance.close($scope.replicas);
	};
}]);