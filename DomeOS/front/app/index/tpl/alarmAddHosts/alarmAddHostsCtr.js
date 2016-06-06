'use strict';

(function () {
	'use strict';

	domeApp.controller('AlarmAddHostsCtr', AlarmAddHostCtr);

	function AlarmAddHostCtr($scope, $domeCluster, $domeAlarm, $state, $domePublic) {
		'use strict';

		var vm = this;
		var id = +$state.params.id,
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
		var hostGroupHostList = [];
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
			var selectedList = [];
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = vm.nodeListIns.selectedList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var selectedNode = _step.value;

					selectedList.push({
						hostname: selectedNode.name,
						ip: selectedNode.ip,
						id: selectedNode.id,
						cluster: selectedNode.cluster
					});
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			hostGroupService.addHost(id, selectedList).then(function () {
				$domePublic.openPrompt('添加成功！');
				$state.go('alarm.hostgroups');
			}, function (res) {
				$domePublic.openWarning({
					title: '添加失败！',
					msg: 'Message:' + res.data.resultMsg
				});
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
	AlarmAddHostCtr.$inject = ['$scope', '$domeCluster', '$domeAlarm', '$state', '$domePublic'];
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L3RwbC9hbGFybUFkZEhvc3RzL2FsYXJtQWRkSG9zdHNDdHIuZXMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxDQUFDLFlBQVc7QUFDWCxjQURXOztBQUVYLFNBQVEsVUFBUixDQUFtQixrQkFBbkIsRUFBdUMsZUFBdkMsRUFGVzs7QUFJWCxVQUFTLGVBQVQsQ0FBeUIsTUFBekIsRUFBaUMsWUFBakMsRUFBK0MsVUFBL0MsRUFBMkQsTUFBM0QsRUFBbUUsV0FBbkUsRUFBZ0Y7QUFDL0UsZUFEK0U7O0FBRS9FLE1BQUksS0FBSyxJQUFMLENBRjJFO0FBRy9FLE1BQU0sS0FBSyxDQUFDLE9BQU8sTUFBUCxDQUFjLEVBQWQ7TUFDWCxnQkFBZ0IsT0FBTyxNQUFQLENBQWMsSUFBZDtNQUNoQixtQkFBbUIsV0FBVyxXQUFYLENBQXVCLGtCQUF2QixDQUFuQjtNQUNBLGNBQWMsYUFBYSxXQUFiLENBQXlCLGFBQXpCLENBQWQsQ0FOOEU7QUFPL0UsTUFBSSxDQUFDLEVBQUQsSUFBTyxDQUFDLGFBQUQsRUFBZ0I7QUFDMUIsVUFBTyxFQUFQLENBQVUsa0JBQVYsRUFEMEI7QUFFMUIsVUFGMEI7R0FBM0I7QUFJQSxTQUFPLEtBQVAsQ0FBYSxXQUFiLEVBQTBCO0FBQ3pCLFVBQU8sVUFBVSxhQUFWO0FBQ1AsZUFBWSxtQkFBWjtBQUNBLFFBQUssU0FBTDtHQUhELEVBWCtFO0FBZ0IvRSxNQUFJLG9CQUFvQixFQUFwQixDQWhCMkU7QUFpQi9FLEtBQUcsT0FBSCxHQUFhLEVBQWIsQ0FqQitFO0FBa0IvRSxLQUFHLFFBQUgsR0FBYztBQUNiLFlBQVMsRUFBVDtBQUNBLG9CQUFpQixFQUFqQjtHQUZELENBbEIrRTtBQXNCL0UsS0FBRyxhQUFILEdBQW1CLFVBQVMsU0FBVCxFQUFvQixXQUFwQixFQUFpQztBQUNuRCxNQUFHLE9BQUgsQ0FBVyxFQUFYLEdBQWdCLFNBQWhCLENBRG1EO0FBRW5ELE1BQUcsT0FBSCxDQUFXLElBQVgsR0FBa0IsV0FBbEIsQ0FGbUQ7QUFHbkQsZUFBWSxXQUFaLENBQXdCLFNBQXhCLEVBQW1DLElBQW5DLENBQXdDLFVBQVMsR0FBVCxFQUFjO0FBQ3JELE9BQUcsV0FBSCxDQUFlLElBQWYsQ0FBb0IsSUFBSSxJQUFKLENBQVMsTUFBVCxFQUFpQixXQUFyQyxFQURxRDtJQUFkLEVBRXJDLFlBQVc7QUFDYixPQUFHLFdBQUgsQ0FBZSxJQUFmLENBQW9CLEVBQXBCLEVBQXdCLFdBQXhCLEVBRGE7SUFBWCxDQUZILENBSG1EO0dBQWpDLENBdEI0RDtBQStCL0UsS0FBRyxZQUFILEdBQWtCLFlBQVc7QUFDNUIsTUFBRyxXQUFILENBQWUsZ0JBQWYsQ0FBZ0MsaUJBQWhDLEVBRDRCO0dBQVgsQ0EvQjZEO0FBa0MvRSxLQUFHLFVBQUgsR0FBZ0IsWUFBVztBQUMxQixPQUFJLGVBQWUsRUFBZixDQURzQjs7Ozs7O0FBRTFCLHlCQUF5QixHQUFHLFdBQUgsQ0FBZSxZQUFmLDBCQUF6QixvR0FBc0Q7U0FBN0MsMkJBQTZDOztBQUNyRCxrQkFBYSxJQUFiLENBQWtCO0FBQ2pCLGdCQUFVLGFBQWEsSUFBYjtBQUNWLFVBQUksYUFBYSxFQUFiO0FBQ0osVUFBSSxhQUFhLEVBQWI7QUFDSixlQUFTLGFBQWEsT0FBYjtNQUpWLEVBRHFEO0tBQXREOzs7Ozs7Ozs7Ozs7OztJQUYwQjs7QUFVMUIsb0JBQWlCLE9BQWpCLENBQXlCLEVBQXpCLEVBQTZCLFlBQTdCLEVBQTJDLElBQTNDLENBQWdELFlBQVc7QUFDMUQsZ0JBQVksVUFBWixDQUF1QixPQUF2QixFQUQwRDtBQUUxRCxXQUFPLEVBQVAsQ0FBVSxrQkFBVixFQUYwRDtJQUFYLEVBRzdDLFVBQVMsR0FBVCxFQUFjO0FBQ2hCLGdCQUFZLFdBQVosQ0FBd0I7QUFDdkIsWUFBTyxPQUFQO0FBQ0EsVUFBSyxhQUFhLElBQUksSUFBSixDQUFTLFNBQVQ7S0FGbkIsRUFEZ0I7SUFBZCxDQUhILENBVjBCO0dBQVgsQ0FsQytEO0FBc0QvRSxjQUFZLE9BQVosR0FBc0IsSUFBdEIsQ0FBMkIsVUFBUyxHQUFULEVBQWM7QUFDeEMsTUFBRyxXQUFILEdBQWlCLElBQUksSUFBSixDQUFTLE1BQVQsSUFBbUIsRUFBbkIsQ0FEdUI7QUFFeEMsTUFBRyxXQUFILEdBQWlCLFdBQVcsV0FBWCxDQUF1QixVQUF2QixDQUFqQixDQUZ3QztBQUd4QyxPQUFJLEdBQUcsV0FBSCxDQUFlLENBQWYsQ0FBSixFQUF1QjtBQUN0QixPQUFHLGFBQUgsQ0FBaUIsR0FBRyxXQUFILENBQWUsQ0FBZixFQUFrQixFQUFsQixFQUFzQixHQUFHLFdBQUgsQ0FBZSxDQUFmLEVBQWtCLElBQWxCLENBQXZDLENBRHNCO0lBQXZCO0dBSDBCLENBQTNCLENBdEQrRTtFQUFoRjtBQThEQSxpQkFBZ0IsT0FBaEIsR0FBMEIsQ0FBQyxRQUFELEVBQVcsY0FBWCxFQUEyQixZQUEzQixFQUF5QyxRQUF6QyxFQUFtRCxhQUFuRCxDQUExQixDQWxFVztDQUFYLENBQUQiLCJmaWxlIjoiaW5kZXgvdHBsL2FsYXJtQWRkSG9zdHMvYWxhcm1BZGRIb3N0c0N0ci5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXHRkb21lQXBwLmNvbnRyb2xsZXIoJ0FsYXJtQWRkSG9zdHNDdHInLCBBbGFybUFkZEhvc3RDdHIpO1xuXG5cdGZ1bmN0aW9uIEFsYXJtQWRkSG9zdEN0cigkc2NvcGUsICRkb21lQ2x1c3RlciwgJGRvbWVBbGFybSwgJHN0YXRlLCAkZG9tZVB1YmxpYykge1xuXHRcdCd1c2Ugc3RyaWN0Jztcblx0XHRsZXQgdm0gPSB0aGlzO1xuXHRcdGNvbnN0IGlkID0gKyRzdGF0ZS5wYXJhbXMuaWQsXG5cdFx0XHRob3N0R3JvdXBOYW1lID0gJHN0YXRlLnBhcmFtcy5uYW1lLFxuXHRcdFx0aG9zdEdyb3VwU2VydmljZSA9ICRkb21lQWxhcm0uZ2V0SW5zdGFuY2UoJ0hvc3RHcm91cFNlcnZpY2UnKSxcblx0XHRcdG5vZGVTZXJ2aWNlID0gJGRvbWVDbHVzdGVyLmdldEluc3RhbmNlKCdOb2RlU2VydmljZScpO1xuXHRcdGlmICghaWQgfHwgIWhvc3RHcm91cE5hbWUpIHtcblx0XHRcdCRzdGF0ZS5nbygnYWxhcm0uaG9zdGdyb3VwcycpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQkc2NvcGUuJGVtaXQoJ3BhZ2VUaXRsZScsIHtcblx0XHRcdHRpdGxlOiAn5re75Yqg5Li75py64oCUJyArIGhvc3RHcm91cE5hbWUsXG5cdFx0XHRkZXNjcml0aW9uOiAn5Zyo6L+Z6YeM5oKo5Y+v5Lul5bCG5Li75py65re75Yqg5Yiw5Li75py657uE5Lit44CCJyxcblx0XHRcdG1vZDogJ21vbml0b3InXG5cdFx0fSk7XG5cdFx0bGV0IGhvc3RHcm91cEhvc3RMaXN0ID0gW107XG5cdFx0dm0uY2x1c3RlciA9IHt9O1xuXHRcdHZtLnZhcmlhYmxlID0ge1xuXHRcdFx0bm9kZUtleTogJycsXG5cdFx0XHRzZWxlY3RlZE5vZGVLZXk6ICcnXG5cdFx0fTtcblx0XHR2bS50b2dnbGVDbHVzdGVyID0gZnVuY3Rpb24oY2x1c3RlcklkLCBjbHVzdGVyTmFtZSkge1xuXHRcdFx0dm0uY2x1c3Rlci5pZCA9IGNsdXN0ZXJJZDtcblx0XHRcdHZtLmNsdXN0ZXIubmFtZSA9IGNsdXN0ZXJOYW1lO1xuXHRcdFx0bm9kZVNlcnZpY2UuZ2V0Tm9kZUxpc3QoY2x1c3RlcklkKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHR2bS5ub2RlTGlzdElucy5pbml0KHJlcy5kYXRhLnJlc3VsdCwgY2x1c3Rlck5hbWUpO1xuXHRcdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZtLm5vZGVMaXN0SW5zLmluaXQoW10sIGNsdXN0ZXJOYW1lKTtcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0dm0uY2FuY2VsTW9kaWZ5ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2bS5ub2RlTGlzdElucy5pbml0U2VsZWN0ZWRMaXN0KGhvc3RHcm91cEhvc3RMaXN0KTtcblx0XHR9O1xuXHRcdHZtLnNhdmVNb2RpZnkgPSBmdW5jdGlvbigpIHtcblx0XHRcdGxldCBzZWxlY3RlZExpc3QgPSBbXTtcblx0XHRcdGZvciAobGV0IHNlbGVjdGVkTm9kZSBvZiB2bS5ub2RlTGlzdElucy5zZWxlY3RlZExpc3QpIHtcblx0XHRcdFx0c2VsZWN0ZWRMaXN0LnB1c2goe1xuXHRcdFx0XHRcdGhvc3RuYW1lOiBzZWxlY3RlZE5vZGUubmFtZSxcblx0XHRcdFx0XHRpcDogc2VsZWN0ZWROb2RlLmlwLFxuXHRcdFx0XHRcdGlkOiBzZWxlY3RlZE5vZGUuaWQsXG5cdFx0XHRcdFx0Y2x1c3Rlcjogc2VsZWN0ZWROb2RlLmNsdXN0ZXJcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRob3N0R3JvdXBTZXJ2aWNlLmFkZEhvc3QoaWQsIHNlbGVjdGVkTGlzdCkudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdFx0JGRvbWVQdWJsaWMub3BlblByb21wdCgn5re75Yqg5oiQ5Yqf77yBJyk7XG5cdFx0XHRcdCRzdGF0ZS5nbygnYWxhcm0uaG9zdGdyb3VwcycpO1xuXHRcdFx0fSwgZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcblx0XHRcdFx0XHR0aXRsZTogJ+a3u+WKoOWksei0pe+8gScsXG5cdFx0XHRcdFx0bXNnOiAnTWVzc2FnZTonICsgcmVzLmRhdGEucmVzdWx0TXNnXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fTtcblx0XHRub2RlU2VydmljZS5nZXREYXRhKCkudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdHZtLmNsdXN0ZXJMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuXHRcdFx0dm0ubm9kZUxpc3RJbnMgPSAkZG9tZUFsYXJtLmdldEluc3RhbmNlKCdOb2RlTGlzdCcpO1xuXHRcdFx0aWYgKHZtLmNsdXN0ZXJMaXN0WzBdKSB7XG5cdFx0XHRcdHZtLnRvZ2dsZUNsdXN0ZXIodm0uY2x1c3Rlckxpc3RbMF0uaWQsIHZtLmNsdXN0ZXJMaXN0WzBdLm5hbWUpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdEFsYXJtQWRkSG9zdEN0ci4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGRvbWVDbHVzdGVyJywgJyRkb21lQWxhcm0nLCAnJHN0YXRlJywgJyRkb21lUHVibGljJ107XG59KSgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
