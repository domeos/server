/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;

	domeApp.controller('AlarmAddHostsCtr', AlarmAddHostCtr);

	function AlarmAddHostCtr($scope, $domeCluster, $domeAlarm, $state, dialog) {
		'use strict';
		let vm = this;
		const id = +$state.params.id,
			hostGroupName = $state.params.name,
			hostGroupService = $domeAlarm.getInstance('HostGroupService'),
			nodeService = $domeCluster.getInstance('NodeService');
		if (!id || !hostGroupName) {
			$state.go('alarm.hostgroups');
			return;
		}
		$scope.$emit('pageTitle', {
			title: '添加主机—' + hostGroupName,
			descrition: '在这里您可以将主机添加到主机组中。',
			mod: 'monitor'
		});
		let hostGroupHostList = [];
		vm.cluster = {};
		vm.variable = {
			nodeKey: '',
			selectedNodeKey: ''
		};
		vm.toggleCluster = function (clusterId, clusterName) {
			vm.cluster.id = clusterId;
			vm.cluster.name = clusterName;
			nodeService.getNodeList(clusterId).then(function (res) {
				vm.nodeListIns.init(res.data.result, clusterName);
			}, function () {
				vm.nodeListIns.init([], clusterName);
			});
		};
		vm.cancelModify = function () {
			vm.nodeListIns.initSelectedList(hostGroupHostList);
		};
		vm.saveModify = function () {
			let selectedList = [];
			for (let selectedNode of vm.nodeListIns.selectedList) {
				selectedList.push({
					hostname: selectedNode.name,
					ip: selectedNode.ip,
					id: selectedNode.id,
					cluster: selectedNode.cluster
				});
			}
			hostGroupService.addHost(id, selectedList).then(function () {
				dialog.alert('提示', '添加成功！');
				$state.go('alarm.hostgroups');
			}, function (res) {
				dialog.error('添加失败', res.data.resultMsg);
			});
		};
		nodeService.getData().then(function (res) {
			vm.clusterList = res.data.result || [];
			vm.nodeListIns = $domeAlarm.getInstance('NodeList');
			if (vm.clusterList[0]) {
				vm.toggleCluster(vm.clusterList[0].id, vm.clusterList[0].name);
			}
		});
	}
	AlarmAddHostCtr.$inject = ['$scope', '$domeCluster', '$domeAlarm', '$state', 'dialog'];
})(angular.module('domeApp'));