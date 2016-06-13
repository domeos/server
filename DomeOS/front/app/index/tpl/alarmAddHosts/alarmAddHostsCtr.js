'use strict';

(function (domeApp, undefined) {
	'use strict';

	if (typeof domeApp === 'undefined') return;

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
})(window.domeApp);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L3RwbC9hbGFybUFkZEhvc3RzL2FsYXJtQWRkSG9zdHNDdHIuZXMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxDQUFDLFVBQVUsT0FBVixFQUFtQixTQUFuQixFQUE4QjtBQUM5QixjQUQ4Qjs7QUFFOUIsS0FBSSxPQUFPLE9BQVAsS0FBbUIsV0FBbkIsRUFBZ0MsT0FBcEM7O0FBRUEsU0FBUSxVQUFSLENBQW1CLGtCQUFuQixFQUF1QyxlQUF2QyxFQUo4Qjs7QUFNOUIsVUFBUyxlQUFULENBQXlCLE1BQXpCLEVBQWlDLFlBQWpDLEVBQStDLFVBQS9DLEVBQTJELE1BQTNELEVBQW1FLFdBQW5FLEVBQWdGO0FBQy9FLGVBRCtFOztBQUUvRSxNQUFJLEtBQUssSUFBTCxDQUYyRTtBQUcvRSxNQUFNLEtBQUssQ0FBQyxPQUFPLE1BQVAsQ0FBYyxFQUFkO01BQ1gsZ0JBQWdCLE9BQU8sTUFBUCxDQUFjLElBQWQ7TUFDaEIsbUJBQW1CLFdBQVcsV0FBWCxDQUF1QixrQkFBdkIsQ0FBbkI7TUFDQSxjQUFjLGFBQWEsV0FBYixDQUF5QixhQUF6QixDQUFkLENBTjhFO0FBTy9FLE1BQUksQ0FBQyxFQUFELElBQU8sQ0FBQyxhQUFELEVBQWdCO0FBQzFCLFVBQU8sRUFBUCxDQUFVLGtCQUFWLEVBRDBCO0FBRTFCLFVBRjBCO0dBQTNCO0FBSUEsU0FBTyxLQUFQLENBQWEsV0FBYixFQUEwQjtBQUN6QixVQUFPLFVBQVUsYUFBVjtBQUNQLGVBQVksbUJBQVo7QUFDQSxRQUFLLFNBQUw7R0FIRCxFQVgrRTtBQWdCL0UsTUFBSSxvQkFBb0IsRUFBcEIsQ0FoQjJFO0FBaUIvRSxLQUFHLE9BQUgsR0FBYSxFQUFiLENBakIrRTtBQWtCL0UsS0FBRyxRQUFILEdBQWM7QUFDYixZQUFTLEVBQVQ7QUFDQSxvQkFBaUIsRUFBakI7R0FGRCxDQWxCK0U7QUFzQi9FLEtBQUcsYUFBSCxHQUFtQixVQUFVLFNBQVYsRUFBcUIsV0FBckIsRUFBa0M7QUFDcEQsTUFBRyxPQUFILENBQVcsRUFBWCxHQUFnQixTQUFoQixDQURvRDtBQUVwRCxNQUFHLE9BQUgsQ0FBVyxJQUFYLEdBQWtCLFdBQWxCLENBRm9EO0FBR3BELGVBQVksV0FBWixDQUF3QixTQUF4QixFQUFtQyxJQUFuQyxDQUF3QyxVQUFVLEdBQVYsRUFBZTtBQUN0RCxPQUFHLFdBQUgsQ0FBZSxJQUFmLENBQW9CLElBQUksSUFBSixDQUFTLE1BQVQsRUFBaUIsV0FBckMsRUFEc0Q7SUFBZixFQUVyQyxZQUFZO0FBQ2QsT0FBRyxXQUFILENBQWUsSUFBZixDQUFvQixFQUFwQixFQUF3QixXQUF4QixFQURjO0lBQVosQ0FGSCxDQUhvRDtHQUFsQyxDQXRCNEQ7QUErQi9FLEtBQUcsWUFBSCxHQUFrQixZQUFZO0FBQzdCLE1BQUcsV0FBSCxDQUFlLGdCQUFmLENBQWdDLGlCQUFoQyxFQUQ2QjtHQUFaLENBL0I2RDtBQWtDL0UsS0FBRyxVQUFILEdBQWdCLFlBQVk7QUFDM0IsT0FBSSxlQUFlLEVBQWYsQ0FEdUI7Ozs7OztBQUUzQix5QkFBeUIsR0FBRyxXQUFILENBQWUsWUFBZiwwQkFBekIsb0dBQXNEO1NBQTdDLDJCQUE2Qzs7QUFDckQsa0JBQWEsSUFBYixDQUFrQjtBQUNqQixnQkFBVSxhQUFhLElBQWI7QUFDVixVQUFJLGFBQWEsRUFBYjtBQUNKLFVBQUksYUFBYSxFQUFiO0FBQ0osZUFBUyxhQUFhLE9BQWI7TUFKVixFQURxRDtLQUF0RDs7Ozs7Ozs7Ozs7Ozs7SUFGMkI7O0FBVTNCLG9CQUFpQixPQUFqQixDQUF5QixFQUF6QixFQUE2QixZQUE3QixFQUEyQyxJQUEzQyxDQUFnRCxZQUFZO0FBQzNELGdCQUFZLFVBQVosQ0FBdUIsT0FBdkIsRUFEMkQ7QUFFM0QsV0FBTyxFQUFQLENBQVUsa0JBQVYsRUFGMkQ7SUFBWixFQUc3QyxVQUFVLEdBQVYsRUFBZTtBQUNqQixnQkFBWSxXQUFaLENBQXdCO0FBQ3ZCLFlBQU8sT0FBUDtBQUNBLFVBQUssYUFBYSxJQUFJLElBQUosQ0FBUyxTQUFUO0tBRm5CLEVBRGlCO0lBQWYsQ0FISCxDQVYyQjtHQUFaLENBbEMrRDtBQXNEL0UsY0FBWSxPQUFaLEdBQXNCLElBQXRCLENBQTJCLFVBQVUsR0FBVixFQUFlO0FBQ3pDLE1BQUcsV0FBSCxHQUFpQixJQUFJLElBQUosQ0FBUyxNQUFULElBQW1CLEVBQW5CLENBRHdCO0FBRXpDLE1BQUcsV0FBSCxHQUFpQixXQUFXLFdBQVgsQ0FBdUIsVUFBdkIsQ0FBakIsQ0FGeUM7QUFHekMsT0FBSSxHQUFHLFdBQUgsQ0FBZSxDQUFmLENBQUosRUFBdUI7QUFDdEIsT0FBRyxhQUFILENBQWlCLEdBQUcsV0FBSCxDQUFlLENBQWYsRUFBa0IsRUFBbEIsRUFBc0IsR0FBRyxXQUFILENBQWUsQ0FBZixFQUFrQixJQUFsQixDQUF2QyxDQURzQjtJQUF2QjtHQUgwQixDQUEzQixDQXREK0U7RUFBaEY7QUE4REEsaUJBQWdCLE9BQWhCLEdBQTBCLENBQUMsUUFBRCxFQUFXLGNBQVgsRUFBMkIsWUFBM0IsRUFBeUMsUUFBekMsRUFBbUQsYUFBbkQsQ0FBMUIsQ0FwRThCO0NBQTlCLENBQUQsQ0FxRUcsT0FBTyxPQUFQLENBckVIIiwiZmlsZSI6ImluZGV4L3RwbC9hbGFybUFkZEhvc3RzL2FsYXJtQWRkSG9zdHNDdHIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKGRvbWVBcHAsIHVuZGVmaW5lZCkge1xuXHQndXNlIHN0cmljdCc7XG5cdGlmICh0eXBlb2YgZG9tZUFwcCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcblxuXHRkb21lQXBwLmNvbnRyb2xsZXIoJ0FsYXJtQWRkSG9zdHNDdHInLCBBbGFybUFkZEhvc3RDdHIpO1xuXG5cdGZ1bmN0aW9uIEFsYXJtQWRkSG9zdEN0cigkc2NvcGUsICRkb21lQ2x1c3RlciwgJGRvbWVBbGFybSwgJHN0YXRlLCAkZG9tZVB1YmxpYykge1xuXHRcdCd1c2Ugc3RyaWN0Jztcblx0XHRsZXQgdm0gPSB0aGlzO1xuXHRcdGNvbnN0IGlkID0gKyRzdGF0ZS5wYXJhbXMuaWQsXG5cdFx0XHRob3N0R3JvdXBOYW1lID0gJHN0YXRlLnBhcmFtcy5uYW1lLFxuXHRcdFx0aG9zdEdyb3VwU2VydmljZSA9ICRkb21lQWxhcm0uZ2V0SW5zdGFuY2UoJ0hvc3RHcm91cFNlcnZpY2UnKSxcblx0XHRcdG5vZGVTZXJ2aWNlID0gJGRvbWVDbHVzdGVyLmdldEluc3RhbmNlKCdOb2RlU2VydmljZScpO1xuXHRcdGlmICghaWQgfHwgIWhvc3RHcm91cE5hbWUpIHtcblx0XHRcdCRzdGF0ZS5nbygnYWxhcm0uaG9zdGdyb3VwcycpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQkc2NvcGUuJGVtaXQoJ3BhZ2VUaXRsZScsIHtcblx0XHRcdHRpdGxlOiAn5re75Yqg5Li75py64oCUJyArIGhvc3RHcm91cE5hbWUsXG5cdFx0XHRkZXNjcml0aW9uOiAn5Zyo6L+Z6YeM5oKo5Y+v5Lul5bCG5Li75py65re75Yqg5Yiw5Li75py657uE5Lit44CCJyxcblx0XHRcdG1vZDogJ21vbml0b3InXG5cdFx0fSk7XG5cdFx0bGV0IGhvc3RHcm91cEhvc3RMaXN0ID0gW107XG5cdFx0dm0uY2x1c3RlciA9IHt9O1xuXHRcdHZtLnZhcmlhYmxlID0ge1xuXHRcdFx0bm9kZUtleTogJycsXG5cdFx0XHRzZWxlY3RlZE5vZGVLZXk6ICcnXG5cdFx0fTtcblx0XHR2bS50b2dnbGVDbHVzdGVyID0gZnVuY3Rpb24gKGNsdXN0ZXJJZCwgY2x1c3Rlck5hbWUpIHtcblx0XHRcdHZtLmNsdXN0ZXIuaWQgPSBjbHVzdGVySWQ7XG5cdFx0XHR2bS5jbHVzdGVyLm5hbWUgPSBjbHVzdGVyTmFtZTtcblx0XHRcdG5vZGVTZXJ2aWNlLmdldE5vZGVMaXN0KGNsdXN0ZXJJZCkudGhlbihmdW5jdGlvbiAocmVzKSB7XG5cdFx0XHRcdHZtLm5vZGVMaXN0SW5zLmluaXQocmVzLmRhdGEucmVzdWx0LCBjbHVzdGVyTmFtZSk7XG5cdFx0XHR9LCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZtLm5vZGVMaXN0SW5zLmluaXQoW10sIGNsdXN0ZXJOYW1lKTtcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0dm0uY2FuY2VsTW9kaWZ5ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0dm0ubm9kZUxpc3RJbnMuaW5pdFNlbGVjdGVkTGlzdChob3N0R3JvdXBIb3N0TGlzdCk7XG5cdFx0fTtcblx0XHR2bS5zYXZlTW9kaWZ5ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0bGV0IHNlbGVjdGVkTGlzdCA9IFtdO1xuXHRcdFx0Zm9yIChsZXQgc2VsZWN0ZWROb2RlIG9mIHZtLm5vZGVMaXN0SW5zLnNlbGVjdGVkTGlzdCkge1xuXHRcdFx0XHRzZWxlY3RlZExpc3QucHVzaCh7XG5cdFx0XHRcdFx0aG9zdG5hbWU6IHNlbGVjdGVkTm9kZS5uYW1lLFxuXHRcdFx0XHRcdGlwOiBzZWxlY3RlZE5vZGUuaXAsXG5cdFx0XHRcdFx0aWQ6IHNlbGVjdGVkTm9kZS5pZCxcblx0XHRcdFx0XHRjbHVzdGVyOiBzZWxlY3RlZE5vZGUuY2x1c3RlclxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGhvc3RHcm91cFNlcnZpY2UuYWRkSG9zdChpZCwgc2VsZWN0ZWRMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0JGRvbWVQdWJsaWMub3BlblByb21wdCgn5re75Yqg5oiQ5Yqf77yBJyk7XG5cdFx0XHRcdCRzdGF0ZS5nbygnYWxhcm0uaG9zdGdyb3VwcycpO1xuXHRcdFx0fSwgZnVuY3Rpb24gKHJlcykge1xuXHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG5cdFx0XHRcdFx0dGl0bGU6ICfmt7vliqDlpLHotKXvvIEnLFxuXHRcdFx0XHRcdG1zZzogJ01lc3NhZ2U6JyArIHJlcy5kYXRhLnJlc3VsdE1zZ1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0bm9kZVNlcnZpY2UuZ2V0RGF0YSgpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuXHRcdFx0dm0uY2x1c3Rlckxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG5cdFx0XHR2bS5ub2RlTGlzdElucyA9ICRkb21lQWxhcm0uZ2V0SW5zdGFuY2UoJ05vZGVMaXN0Jyk7XG5cdFx0XHRpZiAodm0uY2x1c3Rlckxpc3RbMF0pIHtcblx0XHRcdFx0dm0udG9nZ2xlQ2x1c3Rlcih2bS5jbHVzdGVyTGlzdFswXS5pZCwgdm0uY2x1c3Rlckxpc3RbMF0ubmFtZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0QWxhcm1BZGRIb3N0Q3RyLiRpbmplY3QgPSBbJyRzY29wZScsICckZG9tZUNsdXN0ZXInLCAnJGRvbWVBbGFybScsICckc3RhdGUnLCAnJGRvbWVQdWJsaWMnXTtcbn0pKHdpbmRvdy5kb21lQXBwKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
