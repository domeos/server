domeApp.controller('createClusterCtr', ['$scope', '$domeCluster', '$domePublic', '$state', function($scope, $domeCluster, $domePublic, $state) {
	'use strict';
	$scope.$emit('pageTitle', {
		title: '新建集群',
		descrition: '在这里您可以将一个部署好的Kubernetes集群添加到控制台进行管理。',
		mod: 'cluster'
	});
	$scope.creatCluster = true;
	$scope.clusterIns = $domeCluster.getInstance('Cluster');
	$scope.config = $scope.clusterIns.config;
	$scope.createCluster = function() {
		var validEtcd = $scope.clusterIns.validItem('etcd');
		var validKafka = $scope.clusterIns.validItem('kafka');
		var validZookeeper = $scope.clusterIns.validItem('zookeeper');
		if (!validEtcd || !validKafka || !validZookeeper) {
			return;
		}
		$scope.isWaingCreate = true;
		$scope.clusterIns.create().then(function() {
			$domePublic.openPrompt('创建成功！');
			$state.go('clusterManage');
		}, function(res) {
			$domePublic.openWarning({
				title: '创建失败！',
				msg: 'Message:' + res.data.resultMsg
			});
		}).finally(function() {
			$scope.isWaingCreate = false;
		});
	};
	$domeCluster.getClusterList().then(function(res) {
		$scope.clusterList = res.data.result || [];
	});
}]);