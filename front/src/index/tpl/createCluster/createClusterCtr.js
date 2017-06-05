/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('CreateClusterCtr', ['$scope', '$domeUser', '$domeCluster', 'dialog', '$state', function ($scope, $domeUser, $domeCluster, dialog, $state) {
		'use strict';
		$scope.$emit('pageTitle', {
			title: '新建集群',
			descrition: '在这里您可以将一个部署好的Kubernetes集群添加到控制台进行管理。',
			mod: 'cluster'
		});
		$scope.clusterIns = $domeCluster.getInstance('Cluster');
		var userService = $domeUser.userService;
		userService.getCurrentUser().then(function (res) {
			var loginUser = res.data.result;
			var user = {
				Id: loginUser.id,
				name: loginUser.username,
			};
			$scope.clusterIns.toggleUser(user);
		});
		$scope.config = $scope.clusterIns.config;
		$scope.createCluster = true;
		$scope.valid = {
			needValid: false
		};
		var clusterService = $domeCluster.getInstance('ClusterService');
		$scope.create = function () {
			var validEtcd = $scope.clusterIns.validItem('etcd');
			var validKafka = $scope.clusterIns.validItem('kafka');
			var validZookeeper = $scope.clusterIns.validItem('zookeeper');
			if (!validEtcd || !validKafka || !validZookeeper) {
				return;
			}
			$scope.isWaingCreate = true;
			$scope.clusterIns.create().then(function () {
				dialog.alert('提示', '创建成功！');
				$state.go('clusterManage');
			}, function (res) {
				dialog.error('创建失败', res.data.resultMsg);
			}).finally(function () {
				$scope.isWaingCreate = false;
			});
		};
		clusterService.getData().then(function (res) {
			$scope.clusterList = res.data.result || [];
		});
	}]);
})(angular.module('domeApp'));