domeApp.controller('monitorCtr', ['$scope', '$domeCluster', '$domeDeploy', '$domeMonitor', '$domePublic', function($scope, $domeCluster, $domeDeploy, $domeMonitor, $domePublic) {
	$scope.$emit('pageTitle', {
		title: '监控',
		descrition: '在这里您可以对主机、实例和容器进行多维度的实时监控。',
		mod: 'monitor'
	});
	var itemKeywords = '';
	$scope.keywords1 = '';
	$scope.monitorType = '主机';
	$scope.clusterListIns = {};
	$scope.monitorKey = '';
	$scope.counterListIns = {};
	$scope.labelKey = {
		key: ''
	};
	var currentMonitorInfo = {};
	// 查看容器
	$scope.showContainer = false;
	var loadingsIns = $scope.loadingIns = $domePublic.getLoadingInstance();
	loadingsIns.startLoading('loadingCluster');
	// 获取集群列表
	$domeCluster.getClusterList().then(function(res) {
		$scope.clusterListIns = $domeCluster.getInstance('ClusterList', res.data.result);
		if ($scope.clusterListIns.clusterList[0]) {
			$scope.toggleCluster(0);
		}
	}).finally(function(res) {
		loadingsIns.finishLoading('loadingCluster');
	});
	var getNodeList = function() {
		loadingsIns.startLoading('loadingNode');
		$domeCluster.getNodeList($scope.clusterListIns.cluster.id).then(function(res) {
			$scope.nodeListIns = $domeCluster.getInstance('NodeList', res.data.result);
		}, function() {
			$scope.nodeListIns = $domeCluster.getInstance('NodeList');
		}).finally(function() {
			loadingsIns.finishLoading('loadingNode');
		});
	};
	var freshCounter = function() {
		loadingsIns.startLoading('loadingCounters');
		$domeMonitor.getCounterList(currentMonitorInfo.type, currentMonitorInfo.monitorData, currentMonitorInfo.filter, currentMonitorInfo.clusterId).then(function(res) {
			var counterData = res;
			$scope.counterListIns = $domeMonitor.getInstance('CounterList', counterData);
		}, function() {
			$scope.counterListIns = $domeMonitor.getInstance('CounterList');
		}).finally(function() {
			loadingsIns.finishLoading('loadingCounters');
		});
	};
	$scope.toggleShowContainer = function(isShowContainer) {
		$scope.showContainer = isShowContainer;
		if (isShowContainer) {
			$scope.deployListIns.deployInstanceListIns.getContainerList();
		}
	};
	$scope.toggleMonitorType = function(type) {
		if (type === $scope.monitorType) {
			return;
		} else {
			$scope.monitorType = type;
			if (type == '容器') {
				$scope.toggleShowContainer(false);
				if (!$scope.deployListIns) {
					$domeDeploy.getDeployList().then(function(res) {
						$scope.deployListIns = $domeDeploy.getInstance('DeployList', res.data.result);
						$scope.deployListIns.filterCluster($scope.clusterListIns.cluster.name);
					});
				} else {
					$scope.deployListIns.filterCluster($scope.clusterListIns.cluster.name);
				}
			}
		}
	};
	$scope.toggleCluster = function(index) {
		$scope.clusterListIns.toggleCluster(index);
		var i;
		if ($scope.monitorType == '主机') {
			getNodeList();
		} else if ($scope.monitorType == '容器') {
			$scope.deployListIns.filterCluster($scope.clusterListIns.cluster.name);
		}
	};
	$scope.toggleDeploy = function(deployId, deployName) {
		$scope.deployListIns.toggleDeploy(deployId, deployName);
		$scope.showContainer = false;
	};
	$scope.filterItem = function() {
		if ($scope.keywords1 === itemKeywords) {
			return;
		} else {
			itemKeywords = $scope.keywords1;
			$scope.nodeListIns.filterWithKey($scope.keywords1);
		}
	};
	$scope.getCounterList = function() {
		var type, monitorData = [],
			filter = $scope.monitorKey,
			clusterId = $scope.clusterListIns.cluster.id;
		var i, j;
		var instanceList, hostName, isHasSelectedItems = false;
		if ($scope.monitorType == '容器') {
			instanceList = $scope.deployListIns.deployInstanceListIns.instanceList;
			// 获取Container监控
			if ($scope.showContainer) {
				type = 'container';
				for (i = 0; i < instanceList.length; i++) {
					if (instanceList[i].isSelected) {
						hostName = instanceList[i].hostName;
						if (instanceList[i].containers) {
							for (j = 0; j < instanceList[i].containers.length; j++) {
								if (instanceList[i].containers[j].isSelected) {
									monitorData.push({
										hostname: hostName,
										containerId: instanceList[i].containers[j].containerId
									});
									if (!isHasSelectedItems) isHasSelectedItems = true;
								}
							}
						}
					}
				}
			} else {
				// 获取实例监控
				type = 'pod';
				for (i = 0; i < instanceList.length; i++) {
					if (instanceList[i].isSelected) {
						hostName = instanceList[i].hostName;
						var item = {
							podName: instanceList[i].instanceName,
							containers: []
						};
						if (instanceList[i].containers) {
							for (j = 0; j < instanceList[i].containers.length; j++) {
								item.containers.push({
									hostname: hostName,
									containerId: instanceList[i].containers[j].containerId
								});
							}
						}
						monitorData.push(item);
						if (!isHasSelectedItems) isHasSelectedItems = true;
					}
				}
			}
		} else {
			// 获取主机监控
			type = 'node';
			for (i = 0; i < $scope.nodeListIns.nodeList.length; i++) {
				if ($scope.nodeListIns.nodeList[i].isSelected) {
					monitorData.push($scope.nodeListIns.nodeList[i].name);
					if (!isHasSelectedItems) isHasSelectedItems = true;
				}
			}
		}
		if (!isHasSelectedItems) {
			$domePublic.openWarning('请至少选中一项！');
			return;
		}
		currentMonitorInfo = {
			type: type,
			monitorData: angular.copy(monitorData),
			filter: filter,
			clusterId: clusterId
		};
		freshCounter();
	};
	$scope.searchCount = function() {
		if (!currentMonitorInfo.type) {
			return;
		}
		currentMonitorInfo.filter = $scope.monitorKey;
		freshCounter();
	};
	$scope.labelKeyDown = function(event, str, labelsInfoFiltered) {
		var lastSelectLabelKey;
		var labelsInfo = $scope.nodeListIns.labelsInfo;
		var hasSelected = false;
		if (event.keyCode == 13 && labelsInfoFiltered) {
			angular.forEach(labelsInfoFiltered, function(value, label) {
				if (!hasSelected && !value.isSelected) {
					$scope.nodeListIns.toggleLabel(label, true);
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
				$scope.nodeListIns.toggleLabel(lastSelectLabelKey, false);
			}
		}
	};
	$scope.toBigChart = function(counterName) {
		$domeMonitor.showChart(currentMonitorInfo.type, currentMonitorInfo.monitorData, [counterName], currentMonitorInfo.clusterId);
	};
	$scope.toChart = function(graphType) {
		if (!currentMonitorInfo.type) {
			$domePublic.openWarning('请刷新监控监控指标列表！');
			return;
		}
		var counters = [];
		var counterList = $scope.counterListIns.counterList;
		for (var i = 0; i < counterList.length; i++) {
			if (counterList[i].isSelected) {
				counters.push(counterList[i].counter);
			}
		}
		if (counters.length === 0) {
			$domePublic.openWarning('请至少选择一项指标！');
			return;
		}
		$domeMonitor.showChart(currentMonitorInfo.type, currentMonitorInfo.monitorData, counters, currentMonitorInfo.clusterId, graphType);
	};
}]);