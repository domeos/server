'use strict';

domeApp.controller('ClusterDetailCtr', ['$scope', '$domeCluster', '$stateParams', '$state', '$domePublic', '$domeModel', '$modal', function ($scope, $domeCluster, $stateParams, $state, $domePublic, $domeModel, $modal) {
	'use strict';

	if (!$stateParams.id) {
		$state.go('clusterManage');
	}
	var _clusterId = $scope.clusterId = $stateParams.id,
	    nodeService = $domeCluster.getInstance('NodeService');
	var clusterConfig = void 0;
	$scope.nodeListIns = new $domeModel.SelectListModel('nodeList');
	$scope.resourceType = 'CLUSTER';
	$scope.resourceId = _clusterId;
	$scope.isWaitingHost = true;
	$scope.isWaitingNamespace = true;
	$scope.isWaitingModify = false;
	$scope.valid = {
		needValid: false
	};
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

	nodeService.getNodeList(_clusterId).then(function (res) {
		var nodeList = res.data.result || [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = nodeList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var node = _step.value;

				if (node.capacity) {
					node.capacity.memory = (node.capacity.memory / 1024 / 1024).toFixed(2);
				}
				if (!node.labels) {
					node.labels = {};
				}
				node.isUsedByBuild = node.labels.BUILDENV ? true : false;
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

		$scope.nodeListIns.init(nodeList, false);
	}).finally(function () {
		$scope.isWaitingHost = false;
	});
	var init = function init() {
		nodeService.getData(_clusterId).then(function (res) {
			$scope.clusterIns = $domeCluster.getInstance('Cluster', res.data.result);
			clusterConfig = angular.copy($scope.clusterIns.config);
			$scope.config = $scope.clusterIns.config;
			if (clusterConfig.buildConfig === 1) {
				$scope.$emit('pageTitle', {
					title: $scope.config.name,
					descrition: '该集群是构建集群，需要保证集群内主机可用于构建。',
					mod: 'cluster'
				});
			} else {
				$scope.$emit('pageTitle', {
					title: $scope.config.name,
					descrition: '',
					mod: 'cluster'
				});
			}
			nodeService.getData().then(function (res) {
				$scope.clusterList = res.data.result || [];
				for (var i = 0; i < $scope.clusterList.length; i++) {
					if ($scope.clusterList[i].name === clusterConfig.name) {
						$scope.clusterList.splice(i, 1);
						break;
					}
				}
			});
		}, function () {
			$domePublic.openWarning('请求失败！');
			$state.go('clusterManage');
		});
	};
	init();
	$scope.getNamespace = function () {
		nodeService.getNamespace(_clusterId).then(function (res) {
			var namespaceList = res.data.result || [];
			$scope.namespaceList = [];
			for (var i = 0; i < namespaceList.length; i++) {
				$scope.namespaceList.push(namespaceList[i].name);
			}
		}, function () {
			$scope.namespaceList = [];
		}).finally(function () {
			$scope.isWaitingNamespace = false;
		});
	};
	$scope.addNamespace = function () {
		$scope.isLoadingNamespace = true;
		var namespace = $scope.namespaceTxt.namespace;
		if (!namespace) {
			return;
		}
		for (var i = 0; i < $scope.namespaceList.length; i++) {
			if ($scope.namespaceList[i] === namespace) {
				$domePublic.openWarning('已存在！');
				$scope.isLoadingNamespace = false;
				return;
			}
		}
		nodeService.setNamespace(_clusterId, [namespace]).then(function () {
			$scope.namespaceList.push(namespace);
			$scope.namespaceTxt.namespace = '';
		}, function () {
			$domePublic.openWarning('添加失败！');
		}).finally(function () {
			$scope.isLoadingNamespace = false;
		});
	};
	$scope.checkEdit = function () {
		$scope.isEdit = !$scope.isEdit;
		if (!$scope.isEdit) {
			$scope.valid.needValid = false;
			$scope.clusterIns.config = angular.copy(clusterConfig);
			$scope.config = $scope.clusterIns.config;
		}
	};
	$scope.deleteCluster = function () {
		nodeService.deleteData(_clusterId).then(function () {
			$state.go('clusterManage');
		});
	};
	$scope.modifyCluster = function () {
		var validEtcd = $scope.clusterIns.validItem('etcd'),
		    validKafka = $scope.clusterIns.validItem('kafka'),
		    validZookeeper = $scope.clusterIns.validItem('zookeeper');
		if (!validEtcd || !validKafka || !validZookeeper) {
			return;
		}
		$scope.isWaitingModify = true;
		$scope.valid.needValid = false;
		$scope.clusterIns.modify().then(function () {
			$domePublic.openPrompt('修改成功！');
			init();
			$scope.checkEdit();
		}, function (res) {
			$domePublic.openWarning({
				title: '修改失败！',
				msg: 'Message:' + res.data.resultMsg
			});
		}).finally(function () {
			$scope.isWaitingModify = false;
		});
	};
	$scope.addLabels = function () {
		var _nodeList = [];
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = $scope.nodeListIns.nodeList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var node = _step2.value;

				if (node.isSelected) {
					_nodeList.push({
						node: node.name
					});
				}
			}
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}

		if (_nodeList.length === 0) {
			$domePublic.openWarning('请至少选择一台主机！');
			return;
		}
		$modal.open({
			templateUrl: 'addLabelModal.html',
			controller: 'AddLabelModalCtr',
			size: 'md',
			resolve: {
				clusterId: function clusterId() {
					return _clusterId;
				},
				nodeList: function nodeList() {
					return _nodeList;
				}
			}
		});
	};
	$scope.toggleNodeLabel = function (node) {
		node.isUsedByBuild = !node.isUsedByBuild;
		var isOnly = false;
		if (!node.isUsedByBuild) {
			isOnly = true;
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = $scope.nodeListIns.nodeList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var _node = _step3.value;

					if (_node.isUsedByBuild) {
						isOnly = false;
						break;
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}
		}
		if (isOnly) {
			$domePublic.openWarning('请保证集群内至少有一台用于构建的主机！');
			node.isUsedByBuild = !node.isUsedByBuild;
		}
		var labelsInfo = [{
			node: node.name,
			labels: {
				'BUILDENV': 'HOSTENVTYPE'
			}
		}];
		if (node.isUsedByBuild) {
			nodeService.addLabel(_clusterId, labelsInfo).catch(function (res) {
				node.isUsedByBuild = !node.isUsedByBuild;
				$domePublic.openWarning({
					title: '修改失败！',
					msg: 'Message:' + res.data.resultMsg
				});
			});
		} else {
			nodeService.deleteLabel(_clusterId, labelsInfo).catch(function (res) {
				node.isUsedByBuild = !node.isUsedByBuild;
				$domePublic.openWarning({
					title: '修改失败！',
					msg: 'Message:' + res.data.resultMsg
				});
			});
		}
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

	$scope.$on('memberPermisson', function (event, hasPermisson) {
		$scope.hasMemberPermisson = hasPermisson;
		if (!hasPermisson && stateInfo.indexOf('users') !== -1) {
			$state.go('clusterDetail.hostlist');
			$scope.tabActive[0].active = true;
		}
	});
}]).controller('AddLabelModalCtr', ['$scope', 'clusterId', 'nodeList', '$modalInstance', '$domePublic', '$domeCluster', function ($scope, clusterId, nodeList, $modalInstance, $domePublic, $domeCluster) {
	console.log(nodeList);
	$scope.labelList = [];
	$scope.newLabel = '';
	var nodeService = $domeCluster.getInstance('NodeService');
	$scope.addLabel = function () {
		var _iteratorNormalCompletion4 = true;
		var _didIteratorError4 = false;
		var _iteratorError4 = undefined;

		try {
			for (var _iterator4 = $scope.labelList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
				var label = _step4.value;

				if (label === $scope.newLabel) {
					$scope.newLabel = '';
					return;
				}
			}
		} catch (err) {
			_didIteratorError4 = true;
			_iteratorError4 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion4 && _iterator4.return) {
					_iterator4.return();
				}
			} finally {
				if (_didIteratorError4) {
					throw _iteratorError4;
				}
			}
		}

		$scope.labelList.push($scope.newLabel);
		$scope.newLabel = '';
	};
	$scope.deleteLabel = function (index) {
		$scope.labelList.splice(index, 1);
	};
	$scope.submitLabels = function () {
		if ($scope.labelList.length === 0) {
			$domePublic.openWarning('您尚未添加标签！');
			return;
		}
		var labels = {};
		var _iteratorNormalCompletion5 = true;
		var _didIteratorError5 = false;
		var _iteratorError5 = undefined;

		try {
			for (var _iterator5 = $scope.labelList[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
				var label = _step5.value;

				labels[label] = 'USER_LABEL_VALUE';
			}
		} catch (err) {
			_didIteratorError5 = true;
			_iteratorError5 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion5 && _iterator5.return) {
					_iterator5.return();
				}
			} finally {
				if (_didIteratorError5) {
					throw _iteratorError5;
				}
			}
		}

		var _iteratorNormalCompletion6 = true;
		var _didIteratorError6 = false;
		var _iteratorError6 = undefined;

		try {
			for (var _iterator6 = nodeList[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
				var node = _step6.value;

				node.labels = labels;
			}
		} catch (err) {
			_didIteratorError6 = true;
			_iteratorError6 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion6 && _iterator6.return) {
					_iterator6.return();
				}
			} finally {
				if (_didIteratorError6) {
					throw _iteratorError6;
				}
			}
		}

		nodeService.addLabel(clusterId, nodeList).then(function () {
			$domePublic.openPrompt('添加成功！');
			$modalInstance.close();
		}, function (res) {
			$domePublic.openWarning({
				title: '添加失败！',
				msg: 'Message:' + res.data.resultMsg
			});
		});
	};
	$scope.cancel = function () {
		$modalInstance.dismiss();
	};
}]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L3RwbC9jbHVzdGVyRGV0YWlsL2NsdXN0ZXJEZXRhaWxDdHIuZXMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxRQUFRLFVBQVIsQ0FBbUIsa0JBQW5CLEVBQXVDLENBQUMsUUFBRCxFQUFXLGNBQVgsRUFBMkIsY0FBM0IsRUFBMkMsUUFBM0MsRUFBcUQsYUFBckQsRUFBb0UsWUFBcEUsRUFBa0YsUUFBbEYsRUFBNEYsVUFBVSxNQUFWLEVBQWtCLFlBQWxCLEVBQWdDLFlBQWhDLEVBQThDLE1BQTlDLEVBQXNELFdBQXRELEVBQW1FLFVBQW5FLEVBQStFLE1BQS9FLEVBQXVGO0FBQ3pOLGNBRHlOOztBQUV6TixLQUFJLENBQUMsYUFBYSxFQUFiLEVBQWlCO0FBQ3JCLFNBQU8sRUFBUCxDQUFVLGVBQVYsRUFEcUI7RUFBdEI7QUFHQSxLQUFNLGFBQVksT0FBTyxTQUFQLEdBQW1CLGFBQWEsRUFBYjtLQUNwQyxjQUFjLGFBQWEsV0FBYixDQUF5QixhQUF6QixDQUFkLENBTndOO0FBT3pOLEtBQUksc0JBQUosQ0FQeU47QUFRek4sUUFBTyxXQUFQLEdBQXFCLElBQUksV0FBVyxlQUFYLENBQTJCLFVBQS9CLENBQXJCLENBUnlOO0FBU3pOLFFBQU8sWUFBUCxHQUFzQixTQUF0QixDQVR5TjtBQVV6TixRQUFPLFVBQVAsR0FBb0IsVUFBcEIsQ0FWeU47QUFXek4sUUFBTyxhQUFQLEdBQXVCLElBQXZCLENBWHlOO0FBWXpOLFFBQU8sa0JBQVAsR0FBNEIsSUFBNUIsQ0FaeU47QUFhek4sUUFBTyxlQUFQLEdBQXlCLEtBQXpCLENBYnlOO0FBY3pOLFFBQU8sS0FBUCxHQUFlO0FBQ2QsYUFBVyxLQUFYO0VBREQsQ0FkeU47QUFpQnpOLFFBQU8sWUFBUCxHQUFzQjtBQUNyQixhQUFXLEVBQVg7RUFERCxDQWpCeU47QUFvQnpOLFFBQU8sTUFBUCxHQUFnQixLQUFoQixDQXBCeU47O0FBc0J6TixRQUFPLFNBQVAsR0FBbUIsQ0FBQztBQUNuQixVQUFR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QTNCLHFCQUEyQjs7QUFDbkMsV0FBTyxLQUFQLElBQWdCLGtCQUFoQixDQURtQztJQUFwQzs7Ozs7Ozs7Ozs7Ozs7R0FOMkI7Ozs7Ozs7QUFTM0IseUJBQWlCLG1DQUFqQix3R0FBMkI7UUFBbEIsb0JBQWtCOztBQUMxQixTQUFLLE1BQUwsR0FBYyxNQUFkLENBRDBCO0lBQTNCOzs7Ozs7Ozs7Ozs7OztHQVQyQjs7QUFZM0IsY0FBWSxRQUFaLENBQXFCLFNBQXJCLEVBQWdDLFFBQWhDLEVBQTBDLElBQTFDLENBQStDLFlBQU07QUFDcEQsZUFBWSxVQUFaLENBQXVCLE9BQXZCLEVBRG9EO0FBRXBELGtCQUFlLEtBQWYsR0FGb0Q7R0FBTixFQUc1QyxVQUFDLEdBQUQsRUFBUztBQUNYLGVBQVksV0FBWixDQUF3QjtBQUN2QixXQUFPLE9BQVA7QUFDQSxTQUFLLGFBQWEsSUFBSSxJQUFKLENBQVMsU0FBVDtJQUZuQixFQURXO0dBQVQsQ0FISCxDQVoyQjtFQUFOLENBbEJtTDtBQXdDek0sUUFBTyxNQUFQLEdBQWdCLFlBQU07QUFDckIsaUJBQWUsT0FBZixHQURxQjtFQUFOLENBeEN5TDtDQUFsRixDQS9PeEgiLCJmaWxlIjoiaW5kZXgvdHBsL2NsdXN0ZXJEZXRhaWwvY2x1c3RlckRldGFpbEN0ci5qcyIsInNvdXJjZXNDb250ZW50IjpbImRvbWVBcHAuY29udHJvbGxlcignQ2x1c3RlckRldGFpbEN0cicsIFsnJHNjb3BlJywgJyRkb21lQ2x1c3RlcicsICckc3RhdGVQYXJhbXMnLCAnJHN0YXRlJywgJyRkb21lUHVibGljJywgJyRkb21lTW9kZWwnLCAnJG1vZGFsJywgZnVuY3Rpb24gKCRzY29wZSwgJGRvbWVDbHVzdGVyLCAkc3RhdGVQYXJhbXMsICRzdGF0ZSwgJGRvbWVQdWJsaWMsICRkb21lTW9kZWwsICRtb2RhbCkge1xuXHQndXNlIHN0cmljdCc7XG5cdGlmICghJHN0YXRlUGFyYW1zLmlkKSB7XG5cdFx0JHN0YXRlLmdvKCdjbHVzdGVyTWFuYWdlJyk7XG5cdH1cblx0Y29uc3QgY2x1c3RlcklkID0gJHNjb3BlLmNsdXN0ZXJJZCA9ICRzdGF0ZVBhcmFtcy5pZCxcblx0XHRub2RlU2VydmljZSA9ICRkb21lQ2x1c3Rlci5nZXRJbnN0YW5jZSgnTm9kZVNlcnZpY2UnKTtcblx0bGV0IGNsdXN0ZXJDb25maWc7XG5cdCRzY29wZS5ub2RlTGlzdElucyA9IG5ldyAkZG9tZU1vZGVsLlNlbGVjdExpc3RNb2RlbCgnbm9kZUxpc3QnKTtcblx0JHNjb3BlLnJlc291cmNlVHlwZSA9ICdDTFVTVEVSJztcblx0JHNjb3BlLnJlc291cmNlSWQgPSBjbHVzdGVySWQ7XG5cdCRzY29wZS5pc1dhaXRpbmdIb3N0ID0gdHJ1ZTtcblx0JHNjb3BlLmlzV2FpdGluZ05hbWVzcGFjZSA9IHRydWU7XG5cdCRzY29wZS5pc1dhaXRpbmdNb2RpZnkgPSBmYWxzZTtcblx0JHNjb3BlLnZhbGlkID0ge1xuXHRcdG5lZWRWYWxpZDogZmFsc2Vcblx0fTtcblx0JHNjb3BlLm5hbWVzcGFjZVR4dCA9IHtcblx0XHRuYW1lc3BhY2U6ICcnXG5cdH07XG5cdCRzY29wZS5pc0VkaXQgPSBmYWxzZTtcblxuXHQkc2NvcGUudGFiQWN0aXZlID0gW3tcblx0XHRhY3RpdmU6IGZhbHNlXG5cdH0sIHtcblx0XHRhY3RpdmU6IGZhbHNlXG5cdH0sIHtcblx0XHRhY3RpdmU6IGZhbHNlXG5cblx0fSwge1xuXHRcdGFjdGl2ZTogZmFsc2Vcblx0fV07XG5cblx0bm9kZVNlcnZpY2UuZ2V0Tm9kZUxpc3QoY2x1c3RlcklkKS50aGVuKChyZXMpID0+IHtcblx0XHRsZXQgbm9kZUxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG5cdFx0Zm9yIChsZXQgbm9kZSBvZiBub2RlTGlzdCkge1xuXHRcdFx0aWYgKG5vZGUuY2FwYWNpdHkpIHtcblx0XHRcdFx0bm9kZS5jYXBhY2l0eS5tZW1vcnkgPSAobm9kZS5jYXBhY2l0eS5tZW1vcnkgLyAxMDI0IC8gMTAyNCkudG9GaXhlZCgyKTtcblx0XHRcdH1cblx0XHRcdGlmICghbm9kZS5sYWJlbHMpIHtcblx0XHRcdFx0bm9kZS5sYWJlbHMgPSB7fTtcblx0XHRcdH1cblx0XHRcdG5vZGUuaXNVc2VkQnlCdWlsZCA9IG5vZGUubGFiZWxzLkJVSUxERU5WID8gdHJ1ZSA6IGZhbHNlO1xuXHRcdH1cblx0XHQkc2NvcGUubm9kZUxpc3RJbnMuaW5pdChub2RlTGlzdCwgZmFsc2UpO1xuXHR9KS5maW5hbGx5KCgpID0+IHtcblx0XHQkc2NvcGUuaXNXYWl0aW5nSG9zdCA9IGZhbHNlO1xuXHR9KTtcblx0dmFyIGluaXQgPSAoKSA9PiB7XG5cdFx0bm9kZVNlcnZpY2UuZ2V0RGF0YShjbHVzdGVySWQpLnRoZW4oKHJlcykgPT4ge1xuXHRcdFx0JHNjb3BlLmNsdXN0ZXJJbnMgPSAkZG9tZUNsdXN0ZXIuZ2V0SW5zdGFuY2UoJ0NsdXN0ZXInLCByZXMuZGF0YS5yZXN1bHQpO1xuXHRcdFx0Y2x1c3RlckNvbmZpZyA9IGFuZ3VsYXIuY29weSgkc2NvcGUuY2x1c3Rlcklucy5jb25maWcpO1xuXHRcdFx0JHNjb3BlLmNvbmZpZyA9ICRzY29wZS5jbHVzdGVySW5zLmNvbmZpZztcblx0XHRcdGlmIChjbHVzdGVyQ29uZmlnLmJ1aWxkQ29uZmlnID09PSAxKSB7XG5cdFx0XHRcdCRzY29wZS4kZW1pdCgncGFnZVRpdGxlJywge1xuXHRcdFx0XHRcdHRpdGxlOiAkc2NvcGUuY29uZmlnLm5hbWUsXG5cdFx0XHRcdFx0ZGVzY3JpdGlvbjogJ+ivpembhue+pOaYr+aehOW7uumbhue+pO+8jOmcgOimgeS/neivgembhue+pOWGheS4u+acuuWPr+eUqOS6juaehOW7uuOAgicsXG5cdFx0XHRcdFx0bW9kOiAnY2x1c3Rlcidcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkc2NvcGUuJGVtaXQoJ3BhZ2VUaXRsZScsIHtcblx0XHRcdFx0XHR0aXRsZTogJHNjb3BlLmNvbmZpZy5uYW1lLFxuXHRcdFx0XHRcdGRlc2NyaXRpb246ICcnLFxuXHRcdFx0XHRcdG1vZDogJ2NsdXN0ZXInXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0bm9kZVNlcnZpY2UuZ2V0RGF0YSgpLnRoZW4oKHJlcykgPT4ge1xuXHRcdFx0XHQkc2NvcGUuY2x1c3Rlckxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgJHNjb3BlLmNsdXN0ZXJMaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKCRzY29wZS5jbHVzdGVyTGlzdFtpXS5uYW1lID09PSBjbHVzdGVyQ29uZmlnLm5hbWUpIHtcblx0XHRcdFx0XHRcdCRzY29wZS5jbHVzdGVyTGlzdC5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sICgpID0+IHtcblx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfor7fmsYLlpLHotKXvvIEnKTtcblx0XHRcdCRzdGF0ZS5nbygnY2x1c3Rlck1hbmFnZScpO1xuXHRcdH0pO1xuXHR9O1xuXHRpbml0KCk7XG5cdCRzY29wZS5nZXROYW1lc3BhY2UgPSAoKSA9PiB7XG5cdFx0bm9kZVNlcnZpY2UuZ2V0TmFtZXNwYWNlKGNsdXN0ZXJJZCkudGhlbigocmVzKSA9PiB7XG5cdFx0XHRsZXQgbmFtZXNwYWNlTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcblx0XHRcdCRzY29wZS5uYW1lc3BhY2VMaXN0ID0gW107XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG5hbWVzcGFjZUxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0JHNjb3BlLm5hbWVzcGFjZUxpc3QucHVzaChuYW1lc3BhY2VMaXN0W2ldLm5hbWUpO1xuXHRcdFx0fVxuXHRcdH0sICgpID0+IHtcblx0XHRcdCRzY29wZS5uYW1lc3BhY2VMaXN0ID0gW107XG5cdFx0fSkuZmluYWxseSgoKSA9PiB7XG5cdFx0XHQkc2NvcGUuaXNXYWl0aW5nTmFtZXNwYWNlID0gZmFsc2U7XG5cdFx0fSk7XG5cdH07XG5cdCRzY29wZS5hZGROYW1lc3BhY2UgPSAoKSA9PiB7XG5cdFx0JHNjb3BlLmlzTG9hZGluZ05hbWVzcGFjZSA9IHRydWU7XG5cdFx0bGV0IG5hbWVzcGFjZSA9ICRzY29wZS5uYW1lc3BhY2VUeHQubmFtZXNwYWNlO1xuXHRcdGlmICghbmFtZXNwYWNlKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgJHNjb3BlLm5hbWVzcGFjZUxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmICgkc2NvcGUubmFtZXNwYWNlTGlzdFtpXSA9PT0gbmFtZXNwYWNlKSB7XG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKCflt7LlrZjlnKjvvIEnKTtcblx0XHRcdFx0JHNjb3BlLmlzTG9hZGluZ05hbWVzcGFjZSA9IGZhbHNlO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fVxuXHRcdG5vZGVTZXJ2aWNlLnNldE5hbWVzcGFjZShjbHVzdGVySWQsIFtuYW1lc3BhY2VdKS50aGVuKCgpID0+IHtcblx0XHRcdCRzY29wZS5uYW1lc3BhY2VMaXN0LnB1c2gobmFtZXNwYWNlKTtcblx0XHRcdCRzY29wZS5uYW1lc3BhY2VUeHQubmFtZXNwYWNlID0gJyc7XG5cdFx0fSwgKCkgPT4ge1xuXHRcdFx0JGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+a3u+WKoOWksei0pe+8gScpO1xuXHRcdH0pLmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0JHNjb3BlLmlzTG9hZGluZ05hbWVzcGFjZSA9IGZhbHNlO1xuXHRcdH0pO1xuXHR9O1xuXHQkc2NvcGUuY2hlY2tFZGl0ID0gKCkgPT4ge1xuXHRcdCRzY29wZS5pc0VkaXQgPSAhJHNjb3BlLmlzRWRpdDtcblx0XHRpZiAoISRzY29wZS5pc0VkaXQpIHtcblx0XHRcdCRzY29wZS52YWxpZC5uZWVkVmFsaWQgPSBmYWxzZTtcblx0XHRcdCRzY29wZS5jbHVzdGVySW5zLmNvbmZpZyA9IGFuZ3VsYXIuY29weShjbHVzdGVyQ29uZmlnKTtcblx0XHRcdCRzY29wZS5jb25maWcgPSAkc2NvcGUuY2x1c3Rlcklucy5jb25maWc7XG5cdFx0fVxuXHR9O1xuXHQkc2NvcGUuZGVsZXRlQ2x1c3RlciA9ICgpID0+IHtcblx0XHRub2RlU2VydmljZS5kZWxldGVEYXRhKGNsdXN0ZXJJZCkudGhlbigoKSA9PiB7XG5cdFx0XHQkc3RhdGUuZ28oJ2NsdXN0ZXJNYW5hZ2UnKTtcblx0XHR9KTtcblx0fTtcblx0JHNjb3BlLm1vZGlmeUNsdXN0ZXIgPSAoKSA9PiB7XG5cdFx0bGV0IHZhbGlkRXRjZCA9ICRzY29wZS5jbHVzdGVySW5zLnZhbGlkSXRlbSgnZXRjZCcpLFxuXHRcdFx0dmFsaWRLYWZrYSA9ICRzY29wZS5jbHVzdGVySW5zLnZhbGlkSXRlbSgna2Fma2EnKSxcblx0XHRcdHZhbGlkWm9va2VlcGVyID0gJHNjb3BlLmNsdXN0ZXJJbnMudmFsaWRJdGVtKCd6b29rZWVwZXInKTtcblx0XHRpZiAoIXZhbGlkRXRjZCB8fCAhdmFsaWRLYWZrYSB8fCAhdmFsaWRab29rZWVwZXIpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0JHNjb3BlLmlzV2FpdGluZ01vZGlmeSA9IHRydWU7XG5cdFx0JHNjb3BlLnZhbGlkLm5lZWRWYWxpZCA9IGZhbHNlO1xuXHRcdCRzY29wZS5jbHVzdGVySW5zLm1vZGlmeSgpLnRoZW4oKCkgPT4ge1xuXHRcdFx0JGRvbWVQdWJsaWMub3BlblByb21wdCgn5L+u5pS55oiQ5Yqf77yBJyk7XG5cdFx0XHRpbml0KCk7XG5cdFx0XHQkc2NvcGUuY2hlY2tFZGl0KCk7XG5cdFx0fSwgKHJlcykgPT4ge1xuXHRcdFx0JGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xuXHRcdFx0XHR0aXRsZTogJ+S/ruaUueWksei0pe+8gScsXG5cdFx0XHRcdG1zZzogJ01lc3NhZ2U6JyArIHJlcy5kYXRhLnJlc3VsdE1zZ1xuXHRcdFx0fSk7XG5cdFx0fSkuZmluYWxseSgoKSA9PiB7XG5cdFx0XHQkc2NvcGUuaXNXYWl0aW5nTW9kaWZ5ID0gZmFsc2U7XG5cdFx0fSk7XG5cdH07XG5cdCRzY29wZS5hZGRMYWJlbHMgPSAoKSA9PiB7XG5cdFx0bGV0IG5vZGVMaXN0ID0gW107XG5cdFx0Zm9yIChsZXQgbm9kZSBvZiAkc2NvcGUubm9kZUxpc3RJbnMubm9kZUxpc3QpIHtcblx0XHRcdGlmIChub2RlLmlzU2VsZWN0ZWQpIHtcblx0XHRcdFx0bm9kZUxpc3QucHVzaCh7XG5cdFx0XHRcdFx0bm9kZTogbm9kZS5uYW1lXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAobm9kZUxpc3QubGVuZ3RoID09PSAwKSB7XG5cdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn6K+36Iez5bCR6YCJ5oup5LiA5Y+w5Li75py677yBJyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdCRtb2RhbC5vcGVuKHtcblx0XHRcdHRlbXBsYXRlVXJsOiAnYWRkTGFiZWxNb2RhbC5odG1sJyxcblx0XHRcdGNvbnRyb2xsZXI6ICdBZGRMYWJlbE1vZGFsQ3RyJyxcblx0XHRcdHNpemU6ICdtZCcsXG5cdFx0XHRyZXNvbHZlOiB7XG5cdFx0XHRcdGNsdXN0ZXJJZDogKCkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBjbHVzdGVySWQ7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG5vZGVMaXN0OiAoKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIG5vZGVMaXN0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG5cdCRzY29wZS50b2dnbGVOb2RlTGFiZWwgPSAobm9kZSkgPT4ge1xuXHRcdG5vZGUuaXNVc2VkQnlCdWlsZCA9ICFub2RlLmlzVXNlZEJ5QnVpbGQ7XG5cdFx0bGV0IGlzT25seSA9IGZhbHNlO1xuXHRcdGlmICghbm9kZS5pc1VzZWRCeUJ1aWxkKSB7XG5cdFx0XHRpc09ubHkgPSB0cnVlO1xuXHRcdFx0Zm9yIChsZXQgbm9kZSBvZiAkc2NvcGUubm9kZUxpc3RJbnMubm9kZUxpc3QpIHtcblx0XHRcdFx0aWYgKG5vZGUuaXNVc2VkQnlCdWlsZCkge1xuXHRcdFx0XHRcdGlzT25seSA9IGZhbHNlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChpc09ubHkpIHtcblx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfor7fkv53or4Hpm4bnvqTlhoXoh7PlsJHmnInkuIDlj7DnlKjkuo7mnoTlu7rnmoTkuLvmnLrvvIEnKTtcblx0XHRcdG5vZGUuaXNVc2VkQnlCdWlsZCA9ICFub2RlLmlzVXNlZEJ5QnVpbGQ7XG5cdFx0fVxuXHRcdGxldCBsYWJlbHNJbmZvID0gW3tcblx0XHRcdG5vZGU6IG5vZGUubmFtZSxcblx0XHRcdGxhYmVsczoge1xuXHRcdFx0XHQnQlVJTERFTlYnOiAnSE9TVEVOVlRZUEUnXG5cdFx0XHR9XG5cdFx0fV07XG5cdFx0aWYgKG5vZGUuaXNVc2VkQnlCdWlsZCkge1xuXHRcdFx0bm9kZVNlcnZpY2UuYWRkTGFiZWwoY2x1c3RlcklkLCBsYWJlbHNJbmZvKS5jYXRjaCgocmVzKSA9PiB7XG5cdFx0XHRcdG5vZGUuaXNVc2VkQnlCdWlsZCA9ICFub2RlLmlzVXNlZEJ5QnVpbGQ7XG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcblx0XHRcdFx0XHR0aXRsZTogJ+S/ruaUueWksei0pe+8gScsXG5cdFx0XHRcdFx0bXNnOiAnTWVzc2FnZTonICsgcmVzLmRhdGEucmVzdWx0TXNnXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vZGVTZXJ2aWNlLmRlbGV0ZUxhYmVsKGNsdXN0ZXJJZCwgbGFiZWxzSW5mbykuY2F0Y2goKHJlcykgPT4ge1xuXHRcdFx0XHRub2RlLmlzVXNlZEJ5QnVpbGQgPSAhbm9kZS5pc1VzZWRCeUJ1aWxkO1xuXHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG5cdFx0XHRcdFx0dGl0bGU6ICfkv67mlLnlpLHotKXvvIEnLFxuXHRcdFx0XHRcdG1zZzogJ01lc3NhZ2U6JyArIHJlcy5kYXRhLnJlc3VsdE1zZ1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcblxuXHRsZXQgc3RhdGVJbmZvID0gJHN0YXRlLiRjdXJyZW50Lm5hbWU7XG5cdGlmIChzdGF0ZUluZm8uaW5kZXhPZignaW5mbycpICE9PSAtMSkge1xuXHRcdCRzY29wZS50YWJBY3RpdmVbMV0uYWN0aXZlID0gdHJ1ZTtcblx0fSBlbHNlIGlmIChzdGF0ZUluZm8uaW5kZXhPZignbmFtZXNwYWNlJykgIT09IC0xKSB7XG5cdFx0JHNjb3BlLnRhYkFjdGl2ZVsyXS5hY3RpdmUgPSB0cnVlO1xuXHRcdCRzY29wZS5nZXROYW1lc3BhY2UoKTtcblx0fSBlbHNlIGlmIChzdGF0ZUluZm8uaW5kZXhPZigndXNlcnMnKSAhPT0gLTEpIHtcblx0XHQkc2NvcGUudGFiQWN0aXZlWzNdLmFjdGl2ZSA9IHRydWU7XG5cdH0gZWxzZSB7XG5cdFx0JHNjb3BlLnRhYkFjdGl2ZVswXS5hY3RpdmUgPSB0cnVlO1xuXHR9XG5cblxuXHQkc2NvcGUuJG9uKCdtZW1iZXJQZXJtaXNzb24nLCBmdW5jdGlvbiAoZXZlbnQsIGhhc1Blcm1pc3Nvbikge1xuXHRcdCRzY29wZS5oYXNNZW1iZXJQZXJtaXNzb24gPSBoYXNQZXJtaXNzb247XG5cdFx0aWYgKCFoYXNQZXJtaXNzb24gJiYgc3RhdGVJbmZvLmluZGV4T2YoJ3VzZXJzJykgIT09IC0xKSB7XG5cdFx0XHQkc3RhdGUuZ28oJ2NsdXN0ZXJEZXRhaWwuaG9zdGxpc3QnKTtcblx0XHRcdCRzY29wZS50YWJBY3RpdmVbMF0uYWN0aXZlID0gdHJ1ZTtcblx0XHR9XG5cdH0pO1xufV0pLmNvbnRyb2xsZXIoJ0FkZExhYmVsTW9kYWxDdHInLCBbJyRzY29wZScsICdjbHVzdGVySWQnLCAnbm9kZUxpc3QnLCAnJG1vZGFsSW5zdGFuY2UnLCAnJGRvbWVQdWJsaWMnLCAnJGRvbWVDbHVzdGVyJywgZnVuY3Rpb24gKCRzY29wZSwgY2x1c3RlcklkLCBub2RlTGlzdCwgJG1vZGFsSW5zdGFuY2UsICRkb21lUHVibGljLCAkZG9tZUNsdXN0ZXIpIHtcblx0Y29uc29sZS5sb2cobm9kZUxpc3QpO1xuXHQkc2NvcGUubGFiZWxMaXN0ID0gW107XG5cdCRzY29wZS5uZXdMYWJlbCA9ICcnO1xuXHRsZXQgbm9kZVNlcnZpY2UgPSAkZG9tZUNsdXN0ZXIuZ2V0SW5zdGFuY2UoJ05vZGVTZXJ2aWNlJyk7XG5cdCRzY29wZS5hZGRMYWJlbCA9ICgpID0+IHtcblx0XHRmb3IgKGxldCBsYWJlbCBvZiAkc2NvcGUubGFiZWxMaXN0KSB7XG5cdFx0XHRpZiAobGFiZWwgPT09ICRzY29wZS5uZXdMYWJlbCkge1xuXHRcdFx0XHQkc2NvcGUubmV3TGFiZWwgPSAnJztcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQkc2NvcGUubGFiZWxMaXN0LnB1c2goJHNjb3BlLm5ld0xhYmVsKTtcblx0XHQkc2NvcGUubmV3TGFiZWwgPSAnJztcblx0fTtcblx0JHNjb3BlLmRlbGV0ZUxhYmVsID0gKGluZGV4KSA9PiB7XG5cdFx0JHNjb3BlLmxhYmVsTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuXHR9O1xuXHQkc2NvcGUuc3VibWl0TGFiZWxzID0gKCkgPT4ge1xuXHRcdGlmICgkc2NvcGUubGFiZWxMaXN0Lmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0JGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+aCqOWwmuacqua3u+WKoOagh+etvu+8gScpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRsZXQgbGFiZWxzID0ge307XG5cdFx0Zm9yIChsZXQgbGFiZWwgb2YgJHNjb3BlLmxhYmVsTGlzdCkge1xuXHRcdFx0bGFiZWxzW2xhYmVsXSA9ICdVU0VSX0xBQkVMX1ZBTFVFJztcblx0XHR9XG5cdFx0Zm9yIChsZXQgbm9kZSBvZiBub2RlTGlzdCkge1xuXHRcdFx0bm9kZS5sYWJlbHMgPSBsYWJlbHM7XG5cdFx0fVxuXHRcdG5vZGVTZXJ2aWNlLmFkZExhYmVsKGNsdXN0ZXJJZCwgbm9kZUxpc3QpLnRoZW4oKCkgPT4ge1xuXHRcdFx0JGRvbWVQdWJsaWMub3BlblByb21wdCgn5re75Yqg5oiQ5Yqf77yBJyk7XG5cdFx0XHQkbW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuXHRcdH0sIChyZXMpID0+IHtcblx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcblx0XHRcdFx0dGl0bGU6ICfmt7vliqDlpLHotKXvvIEnLFxuXHRcdFx0XHRtc2c6ICdNZXNzYWdlOicgKyByZXMuZGF0YS5yZXN1bHRNc2dcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9O1xuXHQkc2NvcGUuY2FuY2VsID0gKCkgPT4ge1xuXHRcdCRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcblx0fTtcbn1dKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
