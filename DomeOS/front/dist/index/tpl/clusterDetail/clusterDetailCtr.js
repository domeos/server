'use strict';

(function (domeApp, undefined) {
	'use strict';

	if (typeof domeApp === 'undefined') return;
	domeApp.controller('ClusterDetailCtr', ['$scope', '$domeCluster', '$stateParams', '$state', '$domePublic', '$domeModel', '$modal', function ($scope, $domeCluster, $stateParams, $state, $domePublic, $domeModel, $modal) {
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
					node.isUsedByBuild = typeof node.labels.BUILDENV !== 'undefined';
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
				for (var i = 0, l = namespaceList.length; i < l; i++) {
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
			for (var i = 0, l = $scope.namespaceList.length; i < l; i++) {
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
})(window.domeApp);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L3RwbC9jbHVzdGVyRGV0YWlsL2NsdXN0ZXJEZXRhaWxDdHIuZXMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxDQUFDLFVBQVUsT0FBVixFQUFtQixTQUFuQixFQUE4QjtBQUM5QixjQUQ4Qjs7QUFFOUIsS0FBSSxPQUFPLE9BQVAsS0FBbUIsV0FBbkIsRUFBZ0MsT0FBcEM7QUFDQSxTQUFRLFVBQVIsQ0FBbUIsa0JBQW5CLEVBQXVDLENBQUMsUUFBRCxFQUFXLGNBQVgsRUFBMkIsY0FBM0IsRUFBMkMsUUFBM0MsRUFBcUQsYUFBckQsRUFBb0UsWUFBcEUsRUFBa0YsUUFBbEYsRUFBNEYsVUFBVSxNQUFWLEVBQWtCLFlBQWxCLEVBQWdDLFlBQWhDLEVBQThDLE1BQTlDLEVBQXNELFdBQXRELEVBQW1FLFVBQW5FLEVBQStFLE1BQS9FLEVBQXVGO0FBQ3pOLE1BQUksQ0FBQyxhQUFhLEVBQWIsRUFBaUI7QUFDckIsVUFBTyxFQUFQLENBQVUsZUFBVixFQURxQjtHQUF0QjtBQUdBLE1BQU0sYUFBWSxPQUFPLFNBQVAsR0FBbUIsYUFBYSxFQUFiO01BQ3BDLGNBQWMsYUFBYSxXQUFiLENBQXlCLGFBQXpCLENBQWQsQ0FMd047QUFNek4sTUFBSSxzQkFBSixDQU55TjtBQU96TixTQUFPLFdBQVAsR0FBcUIsSUFBSSxXQUFXLGVBQVgsQ0FBMkIsVUFBL0IsQ0FBckIsQ0FQeU47QUFRek4sU0FBTyxZQUFQLEdBQXNCLFNBQXRCLENBUnlOO0FBU3pOLFNBQU8sVUFBUCxHQUFvQixVQUFwQixDQVR5TjtBQVV6TixTQUFPLGFBQVAsR0FBdUIsSUFBdkIsQ0FWeU47QUFXek4sU0FBTyxrQkFBUCxHQUE0QixJQUE1QixDQVh5TjtBQVl6TixTQUFPLGVBQVAsR0FBeUIsS0FBekIsQ0FaeU47QUFhek4sU0FBTyxLQUFQLEdBQWU7QUFDZCxjQUFXLEtBQVg7R0FERCxDQWJ5TjtBQWdCek4sU0FBTyxZQUFQLEdBQXNCO0FBQ3JCLGNBQVcsRUFBWDtHQURE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bEMsZ0JBQVksV0FBWixDQUF3QixVQUF4QixFQURrQztBQUVsQyxXQUZrQztJQUFuQztBQUlBLE9BQUksU0FBUyxFQUFULENBTHVCOzs7Ozs7QUFNM0IsMEJBQWtCLE9BQU8sU0FBUCwyQkFBbEIsd0dBQW9DO1NBQTNCLHFCQUEyQjs7QUFDbkMsWUFBTyxLQUFQLElBQWdCLGtCQUFoQixDQURtQztLQUFwQzs7Ozs7Ozs7Ozs7Ozs7SUFOMkI7Ozs7Ozs7QUFTM0IsMEJBQWlCLG1DQUFqQix3R0FBMkI7U0FBbEIsb0JBQWtCOztBQUMxQixVQUFLLE1BQUwsR0FBYyxNQUFkLENBRDBCO0tBQTNCOzs7Ozs7Ozs7Ozs7OztJQVQyQjs7QUFZM0IsZUFBWSxRQUFaLENBQXFCLFNBQXJCLEVBQWdDLFFBQWhDLEVBQTBDLElBQTFDLENBQStDLFlBQU07QUFDcEQsZ0JBQVksVUFBWixDQUF1QixPQUF2QixFQURvRDtBQUVwRCxtQkFBZSxLQUFmLEdBRm9EO0lBQU4sRUFHNUMsVUFBQyxHQUFELEVBQVM7QUFDWCxnQkFBWSxXQUFaLENBQXdCO0FBQ3ZCLFlBQU8sT0FBUDtBQUNBLFVBQUssYUFBYSxJQUFJLElBQUosQ0FBUyxTQUFUO0tBRm5CLEVBRFc7SUFBVCxDQUhILENBWjJCO0dBQU4sQ0FsQm1MO0FBd0N6TSxTQUFPLE1BQVAsR0FBZ0IsWUFBTTtBQUNyQixrQkFBZSxPQUFmLEdBRHFCO0dBQU4sQ0F4Q3lMO0VBQWxGLENBOU94SCxFQUg4QjtDQUE5QixDQUFELENBNlJHLE9BQU8sT0FBUCxDQTdSSCIsImZpbGUiOiJpbmRleC90cGwvY2x1c3RlckRldGFpbC9jbHVzdGVyRGV0YWlsQ3RyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIChkb21lQXBwLCB1bmRlZmluZWQpIHtcblx0J3VzZSBzdHJpY3QnO1xuXHRpZiAodHlwZW9mIGRvbWVBcHAgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XG5cdGRvbWVBcHAuY29udHJvbGxlcignQ2x1c3RlckRldGFpbEN0cicsIFsnJHNjb3BlJywgJyRkb21lQ2x1c3RlcicsICckc3RhdGVQYXJhbXMnLCAnJHN0YXRlJywgJyRkb21lUHVibGljJywgJyRkb21lTW9kZWwnLCAnJG1vZGFsJywgZnVuY3Rpb24gKCRzY29wZSwgJGRvbWVDbHVzdGVyLCAkc3RhdGVQYXJhbXMsICRzdGF0ZSwgJGRvbWVQdWJsaWMsICRkb21lTW9kZWwsICRtb2RhbCkge1xuXHRcdGlmICghJHN0YXRlUGFyYW1zLmlkKSB7XG5cdFx0XHQkc3RhdGUuZ28oJ2NsdXN0ZXJNYW5hZ2UnKTtcblx0XHR9XG5cdFx0Y29uc3QgY2x1c3RlcklkID0gJHNjb3BlLmNsdXN0ZXJJZCA9ICRzdGF0ZVBhcmFtcy5pZCxcblx0XHRcdG5vZGVTZXJ2aWNlID0gJGRvbWVDbHVzdGVyLmdldEluc3RhbmNlKCdOb2RlU2VydmljZScpO1xuXHRcdGxldCBjbHVzdGVyQ29uZmlnO1xuXHRcdCRzY29wZS5ub2RlTGlzdElucyA9IG5ldyAkZG9tZU1vZGVsLlNlbGVjdExpc3RNb2RlbCgnbm9kZUxpc3QnKTtcblx0XHQkc2NvcGUucmVzb3VyY2VUeXBlID0gJ0NMVVNURVInO1xuXHRcdCRzY29wZS5yZXNvdXJjZUlkID0gY2x1c3RlcklkO1xuXHRcdCRzY29wZS5pc1dhaXRpbmdIb3N0ID0gdHJ1ZTtcblx0XHQkc2NvcGUuaXNXYWl0aW5nTmFtZXNwYWNlID0gdHJ1ZTtcblx0XHQkc2NvcGUuaXNXYWl0aW5nTW9kaWZ5ID0gZmFsc2U7XG5cdFx0JHNjb3BlLnZhbGlkID0ge1xuXHRcdFx0bmVlZFZhbGlkOiBmYWxzZVxuXHRcdH07XG5cdFx0JHNjb3BlLm5hbWVzcGFjZVR4dCA9IHtcblx0XHRcdG5hbWVzcGFjZTogJydcblx0XHR9O1xuXHRcdCRzY29wZS5pc0VkaXQgPSBmYWxzZTtcblxuXHRcdCRzY29wZS50YWJBY3RpdmUgPSBbe1xuXHRcdFx0YWN0aXZlOiBmYWxzZVxuXHRcdH0sIHtcblx0XHRcdGFjdGl2ZTogZmFsc2Vcblx0XHR9LCB7XG5cdFx0XHRhY3RpdmU6IGZhbHNlXG5cblx0XHR9LCB7XG5cdFx0XHRhY3RpdmU6IGZhbHNlXG5cdFx0fV07XG5cblx0XHRub2RlU2VydmljZS5nZXROb2RlTGlzdChjbHVzdGVySWQpLnRoZW4oKHJlcykgPT4ge1xuXHRcdFx0bGV0IG5vZGVMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuXHRcdFx0Zm9yIChsZXQgbm9kZSBvZiBub2RlTGlzdCkge1xuXHRcdFx0XHRpZiAobm9kZS5jYXBhY2l0eSkge1xuXHRcdFx0XHRcdG5vZGUuY2FwYWNpdHkubWVtb3J5ID0gKG5vZGUuY2FwYWNpdHkubWVtb3J5IC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMik7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCFub2RlLmxhYmVscykge1xuXHRcdFx0XHRcdG5vZGUubGFiZWxzID0ge307XG5cdFx0XHRcdH1cblx0XHRcdFx0bm9kZS5pc1VzZWRCeUJ1aWxkID0gdHlwZW9mIG5vZGUubGFiZWxzLkJVSUxERU5WICE9PSAndW5kZWZpbmVkJztcblx0XHRcdH1cblx0XHRcdCRzY29wZS5ub2RlTGlzdElucy5pbml0KG5vZGVMaXN0LCBmYWxzZSk7XG5cdFx0fSkuZmluYWxseSgoKSA9PiB7XG5cdFx0XHQkc2NvcGUuaXNXYWl0aW5nSG9zdCA9IGZhbHNlO1xuXHRcdH0pO1xuXHRcdHZhciBpbml0ID0gKCkgPT4ge1xuXHRcdFx0bm9kZVNlcnZpY2UuZ2V0RGF0YShjbHVzdGVySWQpLnRoZW4oKHJlcykgPT4ge1xuXHRcdFx0XHQkc2NvcGUuY2x1c3RlcklucyA9ICRkb21lQ2x1c3Rlci5nZXRJbnN0YW5jZSgnQ2x1c3RlcicsIHJlcy5kYXRhLnJlc3VsdCk7XG5cdFx0XHRcdGNsdXN0ZXJDb25maWcgPSBhbmd1bGFyLmNvcHkoJHNjb3BlLmNsdXN0ZXJJbnMuY29uZmlnKTtcblx0XHRcdFx0JHNjb3BlLmNvbmZpZyA9ICRzY29wZS5jbHVzdGVySW5zLmNvbmZpZztcblx0XHRcdFx0aWYgKGNsdXN0ZXJDb25maWcuYnVpbGRDb25maWcgPT09IDEpIHtcblx0XHRcdFx0XHQkc2NvcGUuJGVtaXQoJ3BhZ2VUaXRsZScsIHtcblx0XHRcdFx0XHRcdHRpdGxlOiAkc2NvcGUuY29uZmlnLm5hbWUsXG5cdFx0XHRcdFx0XHRkZXNjcml0aW9uOiAn6K+l6ZuG576k5piv5p6E5bu66ZuG576k77yM6ZyA6KaB5L+d6K+B6ZuG576k5YaF5Li75py65Y+v55So5LqO5p6E5bu644CCJyxcblx0XHRcdFx0XHRcdG1vZDogJ2NsdXN0ZXInXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JHNjb3BlLiRlbWl0KCdwYWdlVGl0bGUnLCB7XG5cdFx0XHRcdFx0XHR0aXRsZTogJHNjb3BlLmNvbmZpZy5uYW1lLFxuXHRcdFx0XHRcdFx0ZGVzY3JpdGlvbjogJycsXG5cdFx0XHRcdFx0XHRtb2Q6ICdjbHVzdGVyJ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG5vZGVTZXJ2aWNlLmdldERhdGEoKS50aGVuKChyZXMpID0+IHtcblx0XHRcdFx0XHQkc2NvcGUuY2x1c3Rlckxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAkc2NvcGUuY2x1c3Rlckxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGlmICgkc2NvcGUuY2x1c3Rlckxpc3RbaV0ubmFtZSA9PT0gY2x1c3RlckNvbmZpZy5uYW1lKSB7XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5jbHVzdGVyTGlzdC5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9LCAoKSA9PiB7XG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfor7fmsYLlpLHotKXvvIEnKTtcblx0XHRcdFx0JHN0YXRlLmdvKCdjbHVzdGVyTWFuYWdlJyk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdGluaXQoKTtcblx0XHQkc2NvcGUuZ2V0TmFtZXNwYWNlID0gKCkgPT4ge1xuXHRcdFx0bm9kZVNlcnZpY2UuZ2V0TmFtZXNwYWNlKGNsdXN0ZXJJZCkudGhlbigocmVzKSA9PiB7XG5cdFx0XHRcdGxldCBuYW1lc3BhY2VMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuXHRcdFx0XHQkc2NvcGUubmFtZXNwYWNlTGlzdCA9IFtdO1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMCwgbCA9IG5hbWVzcGFjZUxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHRcdFx0JHNjb3BlLm5hbWVzcGFjZUxpc3QucHVzaChuYW1lc3BhY2VMaXN0W2ldLm5hbWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCAoKSA9PiB7XG5cdFx0XHRcdCRzY29wZS5uYW1lc3BhY2VMaXN0ID0gW107XG5cdFx0XHR9KS5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0JHNjb3BlLmlzV2FpdGluZ05hbWVzcGFjZSA9IGZhbHNlO1xuXHRcdFx0fSk7XG5cdFx0fTtcblx0XHQkc2NvcGUuYWRkTmFtZXNwYWNlID0gKCkgPT4ge1xuXHRcdFx0JHNjb3BlLmlzTG9hZGluZ05hbWVzcGFjZSA9IHRydWU7XG5cdFx0XHRsZXQgbmFtZXNwYWNlID0gJHNjb3BlLm5hbWVzcGFjZVR4dC5uYW1lc3BhY2U7XG5cdFx0XHRpZiAoIW5hbWVzcGFjZSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGxldCBpID0gMCwgbCA9ICRzY29wZS5uYW1lc3BhY2VMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHRcdFx0XHRpZiAoJHNjb3BlLm5hbWVzcGFjZUxpc3RbaV0gPT09IG5hbWVzcGFjZSkge1xuXHRcdFx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKCflt7LlrZjlnKjvvIEnKTtcblx0XHRcdFx0XHQkc2NvcGUuaXNMb2FkaW5nTmFtZXNwYWNlID0gZmFsc2U7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRub2RlU2VydmljZS5zZXROYW1lc3BhY2UoY2x1c3RlcklkLCBbbmFtZXNwYWNlXSkudGhlbigoKSA9PiB7XG5cdFx0XHRcdCRzY29wZS5uYW1lc3BhY2VMaXN0LnB1c2gobmFtZXNwYWNlKTtcblx0XHRcdFx0JHNjb3BlLm5hbWVzcGFjZVR4dC5uYW1lc3BhY2UgPSAnJztcblx0XHRcdH0sICgpID0+IHtcblx0XHRcdFx0JGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+a3u+WKoOWksei0pe+8gScpO1xuXHRcdFx0fSkuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdCRzY29wZS5pc0xvYWRpbmdOYW1lc3BhY2UgPSBmYWxzZTtcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0JHNjb3BlLmNoZWNrRWRpdCA9ICgpID0+IHtcblx0XHRcdCRzY29wZS5pc0VkaXQgPSAhJHNjb3BlLmlzRWRpdDtcblx0XHRcdGlmICghJHNjb3BlLmlzRWRpdCkge1xuXHRcdFx0XHQkc2NvcGUudmFsaWQubmVlZFZhbGlkID0gZmFsc2U7XG5cdFx0XHRcdCRzY29wZS5jbHVzdGVySW5zLmNvbmZpZyA9IGFuZ3VsYXIuY29weShjbHVzdGVyQ29uZmlnKTtcblx0XHRcdFx0JHNjb3BlLmNvbmZpZyA9ICRzY29wZS5jbHVzdGVySW5zLmNvbmZpZztcblx0XHRcdH1cblx0XHR9O1xuXHRcdCRzY29wZS5kZWxldGVDbHVzdGVyID0gKCkgPT4ge1xuXHRcdFx0bm9kZVNlcnZpY2UuZGVsZXRlRGF0YShjbHVzdGVySWQpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHQkc3RhdGUuZ28oJ2NsdXN0ZXJNYW5hZ2UnKTtcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0JHNjb3BlLm1vZGlmeUNsdXN0ZXIgPSAoKSA9PiB7XG5cdFx0XHRsZXQgdmFsaWRFdGNkID0gJHNjb3BlLmNsdXN0ZXJJbnMudmFsaWRJdGVtKCdldGNkJyksXG5cdFx0XHRcdHZhbGlkS2Fma2EgPSAkc2NvcGUuY2x1c3Rlcklucy52YWxpZEl0ZW0oJ2thZmthJyksXG5cdFx0XHRcdHZhbGlkWm9va2VlcGVyID0gJHNjb3BlLmNsdXN0ZXJJbnMudmFsaWRJdGVtKCd6b29rZWVwZXInKTtcblx0XHRcdGlmICghdmFsaWRFdGNkIHx8ICF2YWxpZEthZmthIHx8ICF2YWxpZFpvb2tlZXBlcikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHQkc2NvcGUuaXNXYWl0aW5nTW9kaWZ5ID0gdHJ1ZTtcblx0XHRcdCRzY29wZS52YWxpZC5uZWVkVmFsaWQgPSBmYWxzZTtcblx0XHRcdCRzY29wZS5jbHVzdGVySW5zLm1vZGlmeSgpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCfkv67mlLnmiJDlip/vvIEnKTtcblx0XHRcdFx0aW5pdCgpO1xuXHRcdFx0XHQkc2NvcGUuY2hlY2tFZGl0KCk7XG5cdFx0XHR9LCAocmVzKSA9PiB7XG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcblx0XHRcdFx0XHR0aXRsZTogJ+S/ruaUueWksei0pe+8gScsXG5cdFx0XHRcdFx0bXNnOiAnTWVzc2FnZTonICsgcmVzLmRhdGEucmVzdWx0TXNnXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSkuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdCRzY29wZS5pc1dhaXRpbmdNb2RpZnkgPSBmYWxzZTtcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0JHNjb3BlLmFkZExhYmVscyA9ICgpID0+IHtcblx0XHRcdGxldCBub2RlTGlzdCA9IFtdO1xuXHRcdFx0Zm9yIChsZXQgbm9kZSBvZiAkc2NvcGUubm9kZUxpc3RJbnMubm9kZUxpc3QpIHtcblx0XHRcdFx0aWYgKG5vZGUuaXNTZWxlY3RlZCkge1xuXHRcdFx0XHRcdG5vZGVMaXN0LnB1c2goe1xuXHRcdFx0XHRcdFx0bm9kZTogbm9kZS5uYW1lXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChub2RlTGlzdC5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0JGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+ivt+iHs+WwkemAieaLqeS4gOWPsOS4u+acuu+8gScpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHQkbW9kYWwub3Blbih7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYWRkTGFiZWxNb2RhbC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0FkZExhYmVsTW9kYWxDdHInLFxuXHRcdFx0XHRzaXplOiAnbWQnLFxuXHRcdFx0XHRyZXNvbHZlOiB7XG5cdFx0XHRcdFx0Y2x1c3RlcklkOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY2x1c3RlcklkO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bm9kZUxpc3Q6ICgpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBub2RlTGlzdDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0JHNjb3BlLnRvZ2dsZU5vZGVMYWJlbCA9IChub2RlKSA9PiB7XG5cdFx0XHRub2RlLmlzVXNlZEJ5QnVpbGQgPSAhbm9kZS5pc1VzZWRCeUJ1aWxkO1xuXHRcdFx0bGV0IGlzT25seSA9IGZhbHNlO1xuXHRcdFx0aWYgKCFub2RlLmlzVXNlZEJ5QnVpbGQpIHtcblx0XHRcdFx0aXNPbmx5ID0gdHJ1ZTtcblx0XHRcdFx0Zm9yIChsZXQgbm9kZSBvZiAkc2NvcGUubm9kZUxpc3RJbnMubm9kZUxpc3QpIHtcblx0XHRcdFx0XHRpZiAobm9kZS5pc1VzZWRCeUJ1aWxkKSB7XG5cdFx0XHRcdFx0XHRpc09ubHkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGlzT25seSkge1xuXHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn6K+35L+d6K+B6ZuG576k5YaF6Iez5bCR5pyJ5LiA5Y+w55So5LqO5p6E5bu655qE5Li75py677yBJyk7XG5cdFx0XHRcdG5vZGUuaXNVc2VkQnlCdWlsZCA9ICFub2RlLmlzVXNlZEJ5QnVpbGQ7XG5cdFx0XHR9XG5cdFx0XHRsZXQgbGFiZWxzSW5mbyA9IFt7XG5cdFx0XHRcdG5vZGU6IG5vZGUubmFtZSxcblx0XHRcdFx0bGFiZWxzOiB7XG5cdFx0XHRcdFx0J0JVSUxERU5WJzogJ0hPU1RFTlZUWVBFJ1xuXHRcdFx0XHR9XG5cdFx0XHR9XTtcblx0XHRcdGlmIChub2RlLmlzVXNlZEJ5QnVpbGQpIHtcblx0XHRcdFx0bm9kZVNlcnZpY2UuYWRkTGFiZWwoY2x1c3RlcklkLCBsYWJlbHNJbmZvKS5jYXRjaCgocmVzKSA9PiB7XG5cdFx0XHRcdFx0bm9kZS5pc1VzZWRCeUJ1aWxkID0gIW5vZGUuaXNVc2VkQnlCdWlsZDtcblx0XHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG5cdFx0XHRcdFx0XHR0aXRsZTogJ+S/ruaUueWksei0pe+8gScsXG5cdFx0XHRcdFx0XHRtc2c6ICdNZXNzYWdlOicgKyByZXMuZGF0YS5yZXN1bHRNc2dcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRub2RlU2VydmljZS5kZWxldGVMYWJlbChjbHVzdGVySWQsIGxhYmVsc0luZm8pLmNhdGNoKChyZXMpID0+IHtcblx0XHRcdFx0XHRub2RlLmlzVXNlZEJ5QnVpbGQgPSAhbm9kZS5pc1VzZWRCeUJ1aWxkO1xuXHRcdFx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcblx0XHRcdFx0XHRcdHRpdGxlOiAn5L+u5pS55aSx6LSl77yBJyxcblx0XHRcdFx0XHRcdG1zZzogJ01lc3NhZ2U6JyArIHJlcy5kYXRhLnJlc3VsdE1zZ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0bGV0IHN0YXRlSW5mbyA9ICRzdGF0ZS4kY3VycmVudC5uYW1lO1xuXHRcdGlmIChzdGF0ZUluZm8uaW5kZXhPZignaW5mbycpICE9PSAtMSkge1xuXHRcdFx0JHNjb3BlLnRhYkFjdGl2ZVsxXS5hY3RpdmUgPSB0cnVlO1xuXHRcdH0gZWxzZSBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ25hbWVzcGFjZScpICE9PSAtMSkge1xuXHRcdFx0JHNjb3BlLnRhYkFjdGl2ZVsyXS5hY3RpdmUgPSB0cnVlO1xuXHRcdFx0JHNjb3BlLmdldE5hbWVzcGFjZSgpO1xuXHRcdH0gZWxzZSBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ3VzZXJzJykgIT09IC0xKSB7XG5cdFx0XHQkc2NvcGUudGFiQWN0aXZlWzNdLmFjdGl2ZSA9IHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRzY29wZS50YWJBY3RpdmVbMF0uYWN0aXZlID0gdHJ1ZTtcblx0XHR9XG5cblxuXHRcdCRzY29wZS4kb24oJ21lbWJlclBlcm1pc3NvbicsIGZ1bmN0aW9uIChldmVudCwgaGFzUGVybWlzc29uKSB7XG5cdFx0XHQkc2NvcGUuaGFzTWVtYmVyUGVybWlzc29uID0gaGFzUGVybWlzc29uO1xuXHRcdFx0aWYgKCFoYXNQZXJtaXNzb24gJiYgc3RhdGVJbmZvLmluZGV4T2YoJ3VzZXJzJykgIT09IC0xKSB7XG5cdFx0XHRcdCRzdGF0ZS5nbygnY2x1c3RlckRldGFpbC5ob3N0bGlzdCcpO1xuXHRcdFx0XHQkc2NvcGUudGFiQWN0aXZlWzBdLmFjdGl2ZSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1dKS5jb250cm9sbGVyKCdBZGRMYWJlbE1vZGFsQ3RyJywgWyckc2NvcGUnLCAnY2x1c3RlcklkJywgJ25vZGVMaXN0JywgJyRtb2RhbEluc3RhbmNlJywgJyRkb21lUHVibGljJywgJyRkb21lQ2x1c3RlcicsIGZ1bmN0aW9uICgkc2NvcGUsIGNsdXN0ZXJJZCwgbm9kZUxpc3QsICRtb2RhbEluc3RhbmNlLCAkZG9tZVB1YmxpYywgJGRvbWVDbHVzdGVyKSB7XG5cdFx0Y29uc29sZS5sb2cobm9kZUxpc3QpO1xuXHRcdCRzY29wZS5sYWJlbExpc3QgPSBbXTtcblx0XHQkc2NvcGUubmV3TGFiZWwgPSAnJztcblx0XHRsZXQgbm9kZVNlcnZpY2UgPSAkZG9tZUNsdXN0ZXIuZ2V0SW5zdGFuY2UoJ05vZGVTZXJ2aWNlJyk7XG5cdFx0JHNjb3BlLmFkZExhYmVsID0gKCkgPT4ge1xuXHRcdFx0Zm9yIChsZXQgbGFiZWwgb2YgJHNjb3BlLmxhYmVsTGlzdCkge1xuXHRcdFx0XHRpZiAobGFiZWwgPT09ICRzY29wZS5uZXdMYWJlbCkge1xuXHRcdFx0XHRcdCRzY29wZS5uZXdMYWJlbCA9ICcnO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0JHNjb3BlLmxhYmVsTGlzdC5wdXNoKCRzY29wZS5uZXdMYWJlbCk7XG5cdFx0XHQkc2NvcGUubmV3TGFiZWwgPSAnJztcblx0XHR9O1xuXHRcdCRzY29wZS5kZWxldGVMYWJlbCA9IChpbmRleCkgPT4ge1xuXHRcdFx0JHNjb3BlLmxhYmVsTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdH07XG5cdFx0JHNjb3BlLnN1Ym1pdExhYmVscyA9ICgpID0+IHtcblx0XHRcdGlmICgkc2NvcGUubGFiZWxMaXN0Lmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5oKo5bCa5pyq5re75Yqg5qCH562+77yBJyk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGxldCBsYWJlbHMgPSB7fTtcblx0XHRcdGZvciAobGV0IGxhYmVsIG9mICRzY29wZS5sYWJlbExpc3QpIHtcblx0XHRcdFx0bGFiZWxzW2xhYmVsXSA9ICdVU0VSX0xBQkVMX1ZBTFVFJztcblx0XHRcdH1cblx0XHRcdGZvciAobGV0IG5vZGUgb2Ygbm9kZUxpc3QpIHtcblx0XHRcdFx0bm9kZS5sYWJlbHMgPSBsYWJlbHM7XG5cdFx0XHR9XG5cdFx0XHRub2RlU2VydmljZS5hZGRMYWJlbChjbHVzdGVySWQsIG5vZGVMaXN0KS50aGVuKCgpID0+IHtcblx0XHRcdFx0JGRvbWVQdWJsaWMub3BlblByb21wdCgn5re75Yqg5oiQ5Yqf77yBJyk7XG5cdFx0XHRcdCRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XG5cdFx0XHR9LCAocmVzKSA9PiB7XG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcblx0XHRcdFx0XHR0aXRsZTogJ+a3u+WKoOWksei0pe+8gScsXG5cdFx0XHRcdFx0bXNnOiAnTWVzc2FnZTonICsgcmVzLmRhdGEucmVzdWx0TXNnXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fTtcblx0XHQkc2NvcGUuY2FuY2VsID0gKCkgPT4ge1xuXHRcdFx0JG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuXHRcdH07XG5cdH1dKTtcbn0pKHdpbmRvdy5kb21lQXBwKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
