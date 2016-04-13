domeApp.controller('monitorCtr', ['$scope', '$domeCluster', '$domeDeploy', '$domeMonitor', '$domePublic', '$modal', '$q', '$sce', function($scope, $domeCluster, $domeDeploy, $domeMonitor, $domePublic, $modal, $q, $sce) {
	'use strict';
	$scope.$emit('pageTitle', {
		title: '监控',
		descrition: '在这里您可以对主机、实例和容器进行多维度的实时监控。',
		mod: 'monitor'
	});
	var loadingsIns = $scope.loadingIns = $domePublic.getLoadingInstance();
	$scope.monitorType = '主机';
	$scope.currentEnv = {
		text: '生产',
		value: 'PROD'
	};
	$scope.labelKey = {
		key: ''
	};
	$scope.keywords = {
		node: '',
		instance: ''
	};
	$scope.orderBy = {
		node: '',
		pod: '',
		isReverse: false
	};
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
	var freshNodeMonitor = function() {
		loadingsIns.startLoading('loadingNode');
		$domeCluster.getNodeList($scope.clusterListIns.cluster.id).then(function(res) {
			var nodeData = res.data.result || [];
			$scope.nodeListIns = $domeCluster.getInstance('NodeList', nodeData);

			$scope.toggleEnv('生产');

			if (nodeData.length === 0) {
				return;
			}
			var monitorInfo = [],
				monitorItems = [];
			for (var i = 0; i < nodeData.length; i++) {
				monitorInfo[i] = {
					node: nodeData[i].name
				};
				monitorItems.push(nodeData[i].name);
			}
			$domeMonitor.getMonitorStatistical('node', monitorInfo, monitorItems).then(function(monitorResult) {
				var nodeList = $scope.nodeListIns.nodeList;
				for (i = 0; i < nodeList.length; i++) {
					angular.extend(nodeList[i], monitorResult[nodeList[i].name]);
				}
				console.log(nodeList);
			});
		}, function() {
			$scope.nodeListIns = $domeCluster.getInstance('NodeList');
		}).finally(function() {
			loadingsIns.finishLoading('loadingNode');
		});
	};

	var freshPodMonitor = function() {
		var insList = $scope.deployListIns.deployInstanceListIns.instanceList;
		if (!insList || insList.length === 0) {
			return;
		}
		var monitorInfo = [],
			monitorItems = [];
		for (var i = 0; i < insList.length; i++) {
			var containers = [];
			if (insList[i].containers) {
				for (var j = 0; j < insList[i].containers.length; j++) {
					containers.push({
						hostname: insList[i].hostName,
						containerId: insList[i].containers[j].containerId
					});
				}
			}
			monitorInfo.push({
				pod: {
					podName: insList[i].instanceName,
					containers: containers
				}
			});
			monitorItems.push(insList[i].instanceName);
		}
		$domeMonitor.getMonitorStatistical('pod', monitorInfo, monitorItems).then(function(monitorResult) {
			var instanceList = $scope.deployListIns.deployInstanceListIns.instanceList;
			for (i = 0; i < instanceList.length; i++) {
				angular.extend(instanceList[i], monitorResult[instanceList[i].instanceName]);
			}
			console.log(instanceList);
		});
	};

	$scope.modifyTooltip = function(type, data) {
		if (!data) {
			return;
		}
		var tpl = [];
		tpl.push('<div class="table-detail-wrap"><table class="table-detail">');
		tpl.push('<thead><tr>');
		switch (type) {
			case 'diskUsed':
				tpl.push('<th>设备</th><th>磁盘占用率</th>');
				break;
			case 'diskRead':
				tpl.push('<th>设备</th><th>磁盘读取(KB/s)</th>');
				break;
			case 'diskWrite':
				tpl.push('<th>设备</th><th>磁盘写入(KB/s)</th>');
				break;
			case 'netIn':
				tpl.push('<th>网卡</th><th>流入数据(KB/s)</th>');
				break;
			case 'netOut':
				tpl.push('<th>网卡</th><th>流出数据(KB/s)</th>');
				break;
		}
		tpl.push('</tr></thead>');
		tpl.push('<tbody>');
		for (var i = 0; i < data.length; i++) {
			tpl.push('<tr><td>' + data[i].item + '</td><td>' + data[i].value + '</td>');
		}
		tpl.push('</tbody>');
		tpl.push('</table></div>');
		$scope.toolTipText = $sce.trustAsHtml(tpl.join(''));
	};
	$scope.toggleEnv = function(envText) {
		var deployList, i, envValue = envText === '生产' ? 'PROD' : 'TEST';

		$scope.currentEnv = {
			text: envText,
			value: envValue
		};
		if ($scope.monitorType == '主机') {
			$scope.nodeListIns.toggleEnv(envValue);
		} else {
			$scope.deployListIns.filterDeploy($scope.clusterListIns.cluster.name, envValue).finally(function() {
				freshPodMonitor();
			});
		}
	};
	$scope.toggleCluster = function(index) {
		$scope.clusterListIns.toggleCluster(index);
		if ($scope.monitorType == '主机') {
			freshNodeMonitor();
		} else if ($scope.monitorType == '实例') {
			$scope.deployListIns.filterDeploy($scope.clusterListIns.cluster.name, envValue).finally(function() {
				freshPodMonitor();
			});
			// // 过滤掉非当前集群的deploy，并切换到第一个符合条件的deploy
			// $scope.deployListIns.filterCluster($scope.clusterListIns.cluster.name);

			// $scope.toggleDeploy($scope.deployListIns.deploy.id, $scope.deployListIns.deploy.name);
		}
	};
	$scope.toggleDeploy = function(deployId, deployName) {
		$scope.deployListIns.toggleDeploy(deployId, deployName).finally(function() {
			freshPodMonitor();
		});
	};

	$scope.toggleMonitorType = function(type) {
		function initDeploy() {
			if ($scope.clusterListIns.cluster.name) {
				$scope.deployListIns.filterDeploy($scope.clusterListIns.cluster.name, $scope.currentEnv.value).finally(function() {
					freshPodMonitor();
				});
			}
		}
		if (type === $scope.monitorType) {
			return;
		} else {
			$scope.monitorType = type;
			if (type == '主机') {
				freshNodeMonitor();
			} else {
				if (!$scope.deployListIns) {
					$domeDeploy.getDeployList().then(function(res) {
						$scope.deployListIns = $domeDeploy.getInstance('DeployList', res.data.result);
						initDeploy();
					});
				} else {
					initDeploy();
				}
			}
		}
	};
	$scope.toggleOrderBy = function(type, orderBy) {
		if ($scope.orderBy[type] === orderBy) {
			$scope.orderBy.isReverse = !$scope.orderBy.isReverse;
		} else {
			$scope.orderBy[type] = orderBy;
			$scope.orderBy.isReverse = false;
		}
	};
	$scope.showContainer = function(instance) {
		$scope.deployListIns.deployInstanceListIns.toggleContainerList(instance);

		var monitorInfo = [],
			monitorItems = [],
			i, hostname = instance.hostName,
			containerList = $scope.deployListIns.deployInstanceListIns.containerList;

		for (i = 0; i < containerList.length; i++) {
			monitorInfo.push({
				container: {
					hostname: hostname,
					containerId: containerList[i].containerId
				}
			});
			monitorItems.push(containerList[i].containerId);
		}
		$domeMonitor.getMonitorStatistical('container', monitorInfo, monitorItems).then(function(monitorResult) {
			for (i = 0; i < containerList.length; i++) {
				angular.extend(containerList[i], monitorResult[containerList[i].containerId]);
			}
			$modal.open({
				templateUrl: 'containersModal.html',
				controller: 'containersModalCtr',
				size: 'lg',
				resolve: {
					monitorParams: function() {
						return {
							clusterId: $scope.clusterListIns.cluster.id,
							clusterName: $scope.clusterListIns.cluster.name,
							hostname: hostname
						};
					},
					instanceIns: function() {
						return $scope.deployListIns.deployInstanceListIns;
					}
				}
			});
		});
	};
	$scope.toMonitorDetail = function(monitorType, singleItem) {
		var monitorTargetInfo = {
				targetType: monitorType,
				targetInfos: []
			},
			i, j, instanceList;

		function getPodMonitorContainers(instance) {
			var containerList = instance.containers || [],
				containers = [];
			for (var j = 0; j < containerList.length; j++) {
				containers.push({
					hostname: instance.hostName,
					containerId: containerList[j].containerId
				});
			}
			return containers;
		}
		if (monitorType == 'node') {
			if (singleItem !== undefined) {
				monitorTargetInfo.targetInfos.push({
					node: singleItem.name
				});
			} else {
				for (i = 0; i < $scope.nodeListIns.nodeList.length; i++) {
					if ($scope.nodeListIns.nodeList[i].isSelected) {
						monitorTargetInfo.targetInfos.push({
							node: $scope.nodeListIns.nodeList[i].name
						});
					}
				}
			}
		} else if (monitorType == 'pod') {
			if (singleItem !== undefined) {
				monitorTargetInfo.targetInfos.push({
					pod: {
						podName: singleItem.instanceName,
						containers: getPodMonitorContainers(singleItem)
					}
				});
			} else {
				instanceList = $scope.deployListIns.deployInstanceListIns.instanceList;
				for (i = 0; i < instanceList.length; i++) {
					if (instanceList[i].isSelected) {
						monitorTargetInfo.targetInfos.push({
							pod: {
								podName: instanceList[i].instanceName,
								containers: getPodMonitorContainers(instanceList[i])
							}
						});
					}
				}
			}
		}
		if (monitorTargetInfo.targetInfos.length === 0) {
			$domePublic.openWarning('请至少选择一项监控');
		} else {
			$domeMonitor.toMonitorPage($scope.clusterListIns.cluster.id, $scope.clusterListIns.cluster.name, monitorTargetInfo);
		}
	};
	$scope.labelKeyDown = function(event, str, labelsInfoFiltered) {
		var lastSelectLabelKey, labelsInfo = $scope.nodeListIns.labelsInfo,
			hasSelected = false;
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
}]).controller('containersModalCtr', ['$scope', 'instanceIns', 'monitorParams', '$domeMonitor', function($scope, instanceIns, monitorParams, $domeMonitor) {
	instanceIns.checkAllContainer(true);
	$scope.instanceIns = instanceIns;
	var i;
	$scope.orderBy = {
		container: '',
		isReverse: false
	};
	for (i = 0; i < instanceIns.containerList.length; i++) {
		var imageName = instanceIns.containerList[i].imageName;
		var seperateIndex = imageName.lastIndexOf(':');
		instanceIns.containerList[i].shortContainerId = instanceIns.containerList[i].containerId.substring(0, 12);
		if (seperateIndex !== -1) {
			instanceIns.containerList[i].image = imageName.substring(0, seperateIndex);
			instanceIns.containerList[i].imageTag = imageName.substring(seperateIndex + 1);
		}
	}
	$scope.toggleOrderBy = function(orderBy) {
		if ($scope.orderBy.container === orderBy) {
			$scope.orderBy.isReverse = !$scope.orderBy.isReverse;
		} else {
			$scope.orderBy.container = orderBy;
			$scope.orderBy.isReverse = false;
		}
	};
	$scope.toMonitorDetail = function(singleItem) {
		var monitorTargetInfo = {
			targetType: 'container',
			targetInfos: []
		};
		if (singleItem) {
			monitorTargetInfo.targetInfos.push({
				container: {
					hostname: monitorParams.hostname,
					containerId: singleItem.containerId
				}
			});
		} else {
			for (var i = 0; i < instanceIns.containerList.length; i++) {
				if (instanceIns.containerList[i].isSelected) {
					monitorTargetInfo.targetInfos.push({
						container: {
							hostname: monitorParams.hostname,
							containerId: instanceIns.containerList[i].containerId
						}
					});
				}
			}
		}
		if (monitorTargetInfo.targetInfos.length === 0) {
			$domePublic.openWarning('请至少选择一项监控');
		} else {
			$domeMonitor.toMonitorPage(monitorParams.clusterId, monitorParams.clusterName, monitorTargetInfo);
		}

	};
}]);