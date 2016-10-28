/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;

	domeApp.controller('DeployManageCtr', ['$scope', '$domeDeploy', '$domeCluster', '$timeout', '$state', function ($scope, $domeDeploy, $domeCluster, $timeout, $state) {
		$scope.$emit('pageTitle', {
			title: '部署',
			descrition: '在这里您可以把项目镜像部署到运行环境中。此外，您还可以对现有部署进行监控和管理。',
			mod: 'deployManage'
		});
		$scope.showSelect = true;
		$scope.isLoading = true;

		var cluserList = [],
			timeout;
		var clusterService = $domeCluster.getInstance('ClusterService');
		$scope.selectOption = {};
		$scope.selectOption.status = {
			ALL: true,
			DEPLOYING: false,
			RUNNING: false,
			// AB_TEST: false,
			STOP: false,
			ERROR: false,
			STOPPING: false,
			BACKROLLING: false,
			UPDATING: false,
			UPSCALING: false,
			DOWNSCALING: false,
			ABORTING: false,
			BACKROLL_ABORTED: false,
			UPDATE_ABORTED: false
		};
		$scope.selectOption.env = {
			ALL: true,
			PROD: false,
			TEST: false
		};
		$scope.selectOption.namespace = {
			ALL: true
		};
		$scope.selectOption.cluster = {
			ALL: true
		};

		$scope.deloyList = [];
		var init = function () {
			if ($state.current.name == 'deployManage') {
				$domeDeploy.deployService.getList().then(function (res) {
					var thisDeploy, cpuPercent, memPercent;
					if (res.data.result) {
						$scope.deloyList = res.data.result;
						for (var i = 0, l = $scope.deloyList.length; i < l; i++) {
							thisDeploy = $scope.deloyList[i];
							cpuPercent = thisDeploy.cpuTotal > 0 ? (thisDeploy.cpuUsed / thisDeploy.cpuTotal * 100).toFixed(2) : '0.00';
							memPercent = thisDeploy.memoryTotal > 0 ? (thisDeploy.memoryUsed / thisDeploy.memoryTotal * 100).toFixed(2) : '0.00';
							if (thisDeploy.serviceDnsName) {
								thisDeploy.dnsName = thisDeploy.serviceDnsName;
							} else {
								thisDeploy.dnsName = '无';
							}
							if (cpuPercent > memPercent) {
								thisDeploy.compare = 'cpu';
								thisDeploy.comparePercent = cpuPercent;
							} else {
								thisDeploy.compare = 'memory';
								thisDeploy.comparePercent = memPercent;
							}
						}
					}
				}).finally(function () {
					$scope.isLoading = false;
					if (timeout) {
						$timeout.cancel(timeout);
					}
					timeout = $timeout(init, 4000);
				});
			}
		};
		init();

		var getNamespace = function (clusterId) {
			clusterService.getNamespace(clusterId).then(function (res) {
				var namespaceList = res.data.result || [];
				for (var j = 0, l = namespaceList.length; j < l; j++) {
					if (!$scope.selectOption.namespace[namespaceList[j].name]) {
						$scope.selectOption.namespace[namespaceList[j].name] = false;
					}
				}
			});
		};
		var getNamespaceList = function () {
			var i, l;
			$scope.selectOption.namespace = {
				ALL: true
			};
			if ($scope.selectOption.cluster.ALL) {
				for (i = 0, l = cluserList.length; i < l; i++) {
					getNamespace(cluserList[i].id);
				}
			} else {
				angular.forEach($scope.selectOption.cluster, function (value, key) {
					if (key !== 'ALL' && value) {
						for (i = 0, l = cluserList.length; i < l; i++) {
							if (cluserList[i].name === key) {
								getNamespace(cluserList[i].id);
								break;
							}
						}
					}
				});
			}
		};
		clusterService.getData().then(function (res) {
			cluserList = res.data.result || [];
			getNamespaceList('all');
			for (var i = 0, l = cluserList.length; i < l; i++) {
				$scope.selectOption.cluster[cluserList[i].name] = false;
			}
		});
		$scope.toggleShowSelect = function () {
			$scope.showSelect = !$scope.showSelect;
		};
		$scope.toggleAll = function (type) {
			angular.forEach($scope.selectOption[type], function (value, key) {
				$scope.selectOption[type][key] = false;
			});
			$scope.selectOption[type].ALL = true;
			if (type === 'cluster') {
				getNamespaceList('all');
			}
		};
		$scope.toggleSelect = function (type, item) {
			var hasNone = true;
			$scope.selectOption[type][item] = !$scope.selectOption[type][item];
			if (!$scope.selectOption[type][item]) {
				angular.forEach($scope.selectOption[type], function (value, key) {
					if (key !== 'ALL' && $scope.selectOption[type][key] && hasNone) {
						hasNone = false;
					}
				});
				if (hasNone) {
					$scope.toggleAll(type);
				}
			} else if ($scope.selectOption[type].ALL) {
				$scope.selectOption[type].ALL = false;
			}
			if (type === 'cluster') {
				getNamespaceList(item);
			}
		};
		$scope.$on('$destroy', function (argument) {
			if (timeout) {
				$timeout.cancel(timeout);
			}
		});
	}]);
})(window.domeApp);