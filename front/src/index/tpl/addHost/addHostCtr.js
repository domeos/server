/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;

	domeApp.controller('AddHostCtr', ['$scope', '$state', '$stateParams', '$domeCluster', '$domeMonitor', '$domeGlobal', 'dialog', function ($scope, $state, $stateParams, $domeCluster, $domeMonitor, $domeGlobal, dialog) {
		$scope.$emit('pageTitle', {
			title: '添加主机',
			descrition: '请按照步骤操作，将您的主机添加到DomeOS上。',
			mod: 'cluster'
		});
		if ($stateParams.id === void 0 || $stateParams.id === '') {
			$state.go('clusterManage');
		}
		$scope.parentState = 'clusterDetail({"id":' + $stateParams.id + '})';
		$scope.isLoading = true;
		$scope.hostInfo = {
			labels: '',
			env: {
				test: true,
				prod: false
			}
		};
		$scope.selectedOS = 'centos';
		$scope.hostname = '';
		var cmdInfo = {},
			registryOptions = $domeGlobal.getGloabalInstance('registry'),
			serverOptions = $domeGlobal.getGloabalInstance('server'),
			clusterService = $domeCluster.getInstance('ClusterService');

		$scope.getCmdLabels = function () {
			var labels = $scope.hostInfo.labels.split(' '),
				labelStr = [];
			for (var i = 0, l = labels.length; i < l; i++) {
				if (labels[i] !== '')
					labelStr.push(labels[i] + '=USER_LABEL_VALUE');
			}
			if ($scope.hostInfo.env.test) {
				labelStr.push('TESTENV=HOSTENVTYPE');
			}
			if ($scope.hostInfo.env.prod) {
				labelStr.push('PRODENV=HOSTENVTYPE');
			}
			// labelStr.push('BUILDENV=HOSTENVTYPE');
			cmdInfo.node_labels = labelStr.join(',');
			genarateCmd();
		};
		$scope.toggleOS = function (osName) {
			if ($scope.selectedOS === osName) return;
			$scope.selectedOS = osName;
			genarateCmd();
		};

		$scope.changeHostName = function () {
			cmdInfo.hostname_override = $scope.hostname;
			genarateCmd();
		};

		function genarateCmd() {
			var cmdArr = ['curl -o '];
			if ($scope.selectedOS == 'centos') {
				cmdArr.push('start_node_centos.sh http://domeos-script.bjctc.scs.sohucs.com/start_node_centos.sh && sudo sh start_node_centos.sh');
			} else {
				cmdArr.push('start_node_ubuntu.sh http://domeos-script.bjctc.scs.sohucs.com/start_node_ubuntu.sh && sudo bash start_node_ubuntu.sh');
			}
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
			if (cmdInfo.heartbeat_addr) {
				cmdArr.push(' --heartbeat-addr ' + cmdInfo.heartbeat_addr);
			}
			if (cmdInfo.registry_type) {
				cmdArr.push(' --registry-type ' + cmdInfo.registry_type);
			}
			if (cmdInfo.registry_arg) {
				cmdArr.push(' --registry-arg ' + cmdInfo.registry_arg);
			}
			if (cmdInfo.insecure_registry_crt) {
				cmdArr.push(' --insecure-registry-crt ' + cmdInfo.insecure_registry_crt);
			}
			if (cmdInfo.domeos_server && cmdInfo.insecure_registry_crt) {
				cmdArr.push(' --domeos-server ' + cmdInfo.domeos_server);
			}
			if (cmdInfo.etcd_server) {
				cmdArr.push(' --etcd-server ' + cmdInfo.etcd_server);
			}
			if (cmdInfo.node_labels) {
				cmdArr.push(' --node-labels ' + cmdInfo.node_labels);
			}
			if (cmdInfo.hostname_override) {
				cmdArr.push(' --hostname-override ' + cmdInfo.hostname_override);
			}
			$scope.hostCmd = cmdArr.join('');
		}
		clusterService.getData($stateParams.id).then(function (res) {
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
			$domeMonitor.getMonitorInfo().then(function (res) {
				var resData = res.data.result;
				if (resData) {
					cmdInfo.monitor_transfer = resData.transfer;
					cmdInfo.heartbeat_addr = resData.hbs;
				}
				genarateCmd();
			});
			registryOptions.getData().then(function (resData) {
				if (resData.status === 1) {
					cmdInfo.registry_type = 'https';
					if (resData.certification) {
            cmdInfo.insecure_registry_crt = true;
          }
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
			serverOptions.getData().then(function (resData) {
				cmdInfo.domeos_server = resData.url;
				genarateCmd();
			});
		}, function () {
			dialog.error('警告', '请求失败！');
			$state.go('clusterManage');
		}).finally(function () {
			$scope.isLoading = false;
		});
	}]);
})(angular.module('domeApp'));