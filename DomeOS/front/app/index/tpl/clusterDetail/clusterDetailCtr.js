domeApp.controller('clusterDetailCtr', ['$scope', '$domeCluster', '$stateParams', '$state', '$domePublic', function($scope, $domeCluster, $stateParams, $state, $domePublic) {
	'use strict';
	if (!$stateParams.id) {
		$state.go('clusterManage');
	}
	var clusterId = $scope.clusterId = $stateParams.id;
	$scope.resourceType = 'CLUSTER';
	$scope.resourceId = clusterId;
	var clusterConfig;
	$scope.isWaitingHost = true;
	$scope.isWaitingNamespace = true;
	$scope.isWaitingModify = false;
	$scope.namespaceTxt = {
		namespace: ''
	};
	$scope.isEdit = false;

	$scope.tabActive = [{
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
		if (!hasPermisson && stateInfo.indexOf('users') !== -1) {
			$state.go('clusterDetail.hostlist');
			$scope.tabActive[0].active = true;
		}
	});

	$domeCluster.getNodeList(clusterId).then(function(res) {
		var nodeList = res.data.result || [];
		for (var i = 0; i < nodeList.length; i++) {
			if (nodeList[i].capacity) {
				nodeList[i].capacity.memory = (nodeList[i].capacity.memory / 1024 / 1024).toFixed(2);
			}
		}
		$scope.nodeList = nodeList;
	}).finally(function() {
		$scope.isWaitingHost = false;
	});
	var init = function() {
		$domeCluster.getClusterDetail(clusterId).then(function(res) {
			$scope.clusterIns = $domeCluster.getInstance('Cluster', res.data.result);
			clusterConfig = angular.copy($scope.clusterIns.config);
			$scope.config = $scope.clusterIns.config;
			$scope.$emit('pageTitle', {
				title: $scope.config.name,
				descrition: '',
				mod: 'cluster'
			});
		}, function() {
			$domePublic.openWarning('请求失败！');
			$state.go('clusterManage');
		});
	};
	init();
	$scope.getNamespace = function() {
		$domeCluster.getNamespace(clusterId).then(function(res) {
			var namespaceList = res.data.result || [];
			$scope.namespaceList = [];
			for (var i = 0; i < namespaceList.length; i++) {
				$scope.namespaceList.push(namespaceList[i].name);
			}
		}, function() {
			$scope.namespaceList = [];
		}).finally(function() {
			$scope.isWaitingNamespace = false;
		});
	};
	$scope.addNamespace = function() {
		$scope.isLoadingNamespace = true;
		var namespace = $scope.namespaceTxt.namespace;
		if (!namespace || namespace === '') {
			return;
		}
		for (var i = 0; i < $scope.namespaceList.length; i++) {
			if ($scope.namespaceList[i] === namespace) {
				$domePublic.openWarning('已存在！');
				$scope.isLoadingNamespace = false;
				return;
			}
		}
		$domeCluster.createNamespace(clusterId, [namespace]).then(function(res) {
			$scope.namespaceList.push(namespace);
			$scope.namespaceTxt.namespace = '';
		}, function() {
			$domePublic.openWarning('添加失败！');
		}).finally(function() {
			$scope.isLoadingNamespace = false;
		});
	};
	$scope.checkEdit = function() {
		$scope.isEdit = !$scope.isEdit;
		if (!$scope.isEdit) {
			$scope.clusterIns.config = angular.copy(clusterConfig);
			$scope.config = $scope.clusterIns.config;
		}
	};
	$scope.deleteCluster = function() {
		$domeCluster.deleteCluster(clusterId).then(function() {
			$state.go('clusterManage');
		});
	};
	$scope.modifyCluster = function() {
		var validEtcd = $scope.clusterIns.validItem('etcd');
		var validKafka = $scope.clusterIns.validItem('kafka');
		var validZookeeper = $scope.clusterIns.validItem('zookeeper');
		if (!validEtcd || !validKafka || !validZookeeper) {
			return;
		}
		$scope.isWaitingModify = true;
		$scope.clusterIns.modify().then(function(res) {
			$domePublic.openPrompt('修改成功！');
			init();
			$scope.checkEdit();
		}, function(res) {
			$domePublic.openWarning({
				title: '修改失败！',
				msg: 'Message:' + res.data.resultMsg
			});
		}).finally(function() {
			$scope.isWaitingModify = false;
		});
	};

	var stateInfo = $state.$current.name;
	if (stateInfo.indexOf('info') !== -1) {
		$scope.tabActive[1].active = true;
	} else if (stateInfo.indexOf('namespace') !== -1) {
		$scope.tabActive[2].active = true;
		$scope.getNamespace();
	} else if (stateInfo.indexOf('users') !== -1) {
		$scope.tabActive[3].active = true;
	} else {
		$scope.tabActive[0].active = true;
	}
}]);