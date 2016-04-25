domeApp.controller('addHostCtr', ['$scope', '$state', '$stateParams', '$domeCluster', '$domeMonitor', '$domeGlobal', '$domePublic', function($scope, $state, $stateParams, $domeCluster, $domeMonitor, $domeGlobal, $domePublic) {
	'use strict';
	$scope.$emit('pageTitle', {
		title: '添加主机',
		descrition: '请按照步骤操作，将您的主机添加到DomeOS上。',
		mod: 'cluster'
	});
	if ($stateParams.id === undefined || $stateParams.id === '') {
		$state.go('clusterManage');
	}
	$scope.parentState = 'clusterDetail({"id":' + $stateParams.id + '})';
	$scope.isLoading = true;
	$scope.hostInfo = {
		labels: '',
		env: {
			test: false,
			prod: false
		}
	};
	var cmdInfo = {};
	var registryOptions = $domeGlobal.getGloabalInstance('registry');
	var serverOptions = $domeGlobal.getGloabalInstance('server');

	$scope.getCmdLabels = function() {
		var labels = $scope.hostInfo.labels.split(' ');
		var labelStr = [];
		for (var i = 0; i < labels.length; i++) {
			if (labels[i] !== '')
				labelStr.push(labels[i] + '=USER_LABEL_VALUE,');
		}
		if ($scope.hostInfo.env.test) {
			labelStr.push('TESTENV=HOSTENVTYPE,');
		}
		if ($scope.hostInfo.env.prod) {
			labelStr.push('PRODENV=HOSTENVTYPE,');
		}
		labelStr.push('BUILDENV=HOSTENVTYPE');
		cmdInfo.node_labels = labelStr.join('');
		genarateCmd();
	};

	function genarateCmd() {
		var cmdArr = ['curl -o start_node_centos.sh http://deploy-domeos.bjcnc.scs.sohucs.com/start_node_centos.sh && sudo sh start_node_centos.sh'];
		if (cmdInfo.api_servers) {
			cmdArr.push(' --api-server ' + cmdInfo.api_servers);
		}
		if (cmdInfo.cluster_dns) {
			cmdArr.push(' --cluster-dns ' + cmdInfo.cluster_dns);
		}
		if (cmdInfo.cluster_domain) {
			cmdArr.push(' --cluster-domain ' + cmdInfo.cluster_domain);
		}
		if (cmdInfo.monitor_transfer) {
			cmdArr.push(' --monitor-transfer ' + cmdInfo.monitor_transfer);
		}
		if (cmdInfo.registry_type) {
			cmdArr.push(' --registry-type ' + cmdInfo.registry_type);
		}
		if (cmdInfo.registry_arg) {
			cmdArr.push(' --registry-arg ' + cmdInfo.registry_arg);
		}
		if (cmdInfo.domeos_server) {
			cmdArr.push(' --domeos-server ' + cmdInfo.domeos_server);
		}
		if (cmdInfo.etcd_server) {
			cmdArr.push(' --etcd-server ' + cmdInfo.etcd_server);
		}
		// if (cmdInfo.node_labels && cmdInfo.node_labels !== '') {
		cmdArr.push(' --node-labels ' + cmdInfo.node_labels);
		// }
		$scope.hostCmd = cmdArr.join('');
	}
	$domeCluster.getClusterDetail($stateParams.id).then(function(res) {
		var cluster = res.data.result;
		cmdInfo.api_servers = cluster.api;
		cmdInfo.cluster_dns = cluster.dns;
		cmdInfo.cluster_domain = cluster.domain;
		cmdInfo.etcd_server = cluster.etcd;
		// 某些etcd最后一个符号为”,“，需去掉
		if (cmdInfo.etcd_server && cmdInfo.etcd_server.slice(-1) == ',') {
			cmdInfo.etcd_server = cmdInfo.etcd_server.slice(0, -1);
		}
		$scope.getCmdLabels();
		$domeMonitor.getMonitorInfo().then(function(res) {
			var resData = res.data.result;
			if (resData && resData.transfer && resData.transfer !== '') {
				cmdInfo.monitor_transfer = resData.transfer;
			}
			genarateCmd();
		});
		registryOptions.getData().then(function(resData) {
			if (resData.status === 1) {
				cmdInfo.registry_type = 'https';
			} else {
				cmdInfo.registry_type = 'http';
			}
			if (resData.url) {
				resData.url = resData.url.replace('http://', '');
				resData.url = resData.url.replace('https://', '');
			}
			cmdInfo.registry_arg = resData.url;
			genarateCmd();
		});
		serverOptions.getData().then(function(resData) {
			cmdInfo.domeos_server = resData.url;
			genarateCmd();
		});
	}, function() {
		$domePublic.openWarning('请求失败！');
		$state.go('clusterManage');
	}).finally(function() {
		$scope.isLoading = false;
	});
}]);