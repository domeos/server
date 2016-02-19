domeApp.controller('deployManageCtr', ['$scope', '$domeDeploy', '$domeCluster', '$interval', function($scope, $domeDeploy, $domeCluster, $interval) {
	$scope.$emit('pageTitle', {
		title: '部署',
		descrition: '在这里您可以把项目镜像部署到运行环境中。此外，您还可以对现有部署进行监控和管理。',
		mod: 'deployManage'
	});
	$scope.showSelect = true;
	$scope.isLoading = true;
	var cluserList = [];
	$scope.selectOption = {};
	$scope.selectOption.status = {
		ALL: true,
		DEPLOYING: false,
		RUNNING: false,
		AB_TEST: false,
		STOP: false,
		ERROR: false
	};
	$scope.selectOption.env = {
		ALL: true,
		PROD: false,
		TEST: false
	};
	var i = 0;
	$scope.selectOption.namespace = {
		ALL: true
	};
	$scope.selectOption.cluster = {
		ALL: true
	};

	$scope.deloyList = [];
	var init = function() {
		$domeDeploy.getDeployList().then(function(res) {
			if (res.data.result) {
				$scope.deloyList = res.data.result;
				for (i = 0; i < $scope.deloyList.length; i++) {
					var thisDeploy = $scope.deloyList[i];
					var cpuPercent = thisDeploy.cpuTotal > 0 ? (thisDeploy.cpuUsed / thisDeploy.cpuTotal * 100).toFixed(2) : (0).toFixed(2);
					var memPercent = thisDeploy.memoryTotal > 0 ? (thisDeploy.memoryUsed / thisDeploy.memoryTotal * 100).toFixed(2) : (0).toFixed(2);
					if (cpuPercent > memPercent) {
						thisDeploy.compare = 'cpu';
						thisDeploy.comparePercent = cpuPercent;
					} else {
						thisDeploy.compare = 'memory';
						thisDeploy.comparePercent = memPercent;
					}
				}
			}
		}).finally(function() {
			$scope.isLoading = false;
			$scope.$digest();
		});
	};
	init();
	var interval = $interval(function() {
		if (location.href.indexOf('deployManage') === -1) {
			$interval.cancel(interval);
		}
		init();
	}, 4000);
	var getNamespace = function(clusterId) {
		$domeCluster.getNamespace(clusterId).then(function(res) {
			var namespaceList = res.data.result;
			for (var j = 0; j < namespaceList.length; j++) {
				if (!$scope.selectOption.namespace[namespaceList[j].name]) {
					$scope.selectOption.namespace[namespaceList[j].name] = false;
				}
			}
		});
	};
	var getNamespaceList = function() {
		$scope.selectOption.namespace = {
			ALL: true
		};
		if ($scope.selectOption.cluster.ALL) {
			for (i = 0; i < cluserList.length; i++) {
				getNamespace(cluserList[i].id);
			}
		} else {
			angular.forEach($scope.selectOption.cluster, function(value, key) {
				if (key !== 'ALL' && value) {
					for (i = 0; i < cluserList.length; i++) {
						if (cluserList[i].name === key) {
							getNamespace(cluserList[i].id);
							break;
						}
					}
				}
			});
		}
	};
	$domeCluster.getClusterList().then(function(res) {
		cluserList = res.data.result || [];
		getNamespaceList('all');
		for (var i = 0; i < cluserList.length; i++) {
			$scope.selectOption.cluster[cluserList[i].name] = false;
		}
	});
	$scope.toggleShowSelect = function() {
		$scope.showSelect = !$scope.showSelect;
	};
	$scope.toggleAll = function(type) {
		angular.forEach($scope.selectOption[type], function(value, key) {
			$scope.selectOption[type][key] = false;
		});
		$scope.selectOption[type].ALL = true;
		if (type === 'cluster') {
			getNamespaceList('all');
		}
	};
	$scope.toggleSelect = function(type, item) {
		var hasNone = true;
		$scope.selectOption[type][item] = !$scope.selectOption[type][item];
		if (!$scope.selectOption[type][item]) {
			angular.forEach($scope.selectOption[type], function(value, key) {
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
}]);