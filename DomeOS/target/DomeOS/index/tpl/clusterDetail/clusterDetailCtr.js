'use strict';

/*
 * @author ChandraLee
 */
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
		$scope.addHost = function (clusterId) {
			if ($scope.isEditCluster) {
				$state.go('addHost', { 'id': clusterId });
			} else {
				$domePublic.openWarning('您没有权限添加主机');
			}
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

		// 登录用户角色权限
		$scope.$on('signalResourceCurrentUserRole', function (event, msg) {
			var userRole = msg;
			if (userRole === 'MASTER' || userRole === 'DEVELOPER') {
				$scope.isEditCluster = true;
			} else {
				$scope.isEditCluster = false;
			}
		});

		$scope.$on('memberPermisson', function (event, hasPermisson) {
			$scope.hasMemberPermisson = hasPermisson;
			if (!hasPermisson && stateInfo.indexOf('users') !== -1) {
				$state.go('clusterDetail.hostlist');
				$scope.tabActive[0].active = true;
			}
		});
	}]).controller('AddLabelModalCtr', ['$scope', 'clusterId', 'nodeList', '$modalInstance', '$domePublic', '$domeCluster', function ($scope, clusterId, nodeList, $modalInstance, $domePublic, $domeCluster) {
		//console.log(nodeList);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L3RwbC9jbHVzdGVyRGV0YWlsL2NsdXN0ZXJEZXRhaWxDdHIuZXMiXSwibmFtZXMiOlsiZG9tZUFwcCIsInVuZGVmaW5lZCIsImNvbnRyb2xsZXIiLCIkc2NvcGUiLCIkZG9tZUNsdXN0ZXIiLCIkc3RhdGVQYXJhbXMiLCIkc3RhdGUiLCIkZG9tZVB1YmxpYyIsIiRkb21lTW9kZWwiLCIkbW9kYWwiLCJpZCIsImdvIiwiY2x1c3RlcklkIiwibm9kZVNlcnZpY2UiLCJnZXRJbnN0YW5jZSIsImNsdXN0ZXJDb25maWciLCJub2RlTGlzdElucyIsIlNlbGVjdExpc3RNb2RlbCIsInJlc291cmNlVHlwZSIsInJlc291cmNlSWQiLCJpc1dhaXRpbmdIb3N0IiwiaXNXYWl0aW5nTmFtZXNwYWNlIiwiaXNXYWl0aW5nTW9kaWZ5IiwidmFsaWQiLCJuZWVkVmFsaWQiLCJuYW1lc3BhY2VUeHQiLCJuYW1lc3BhY2UiLCJpc0VkaXQiLCJ0YWJBY3RpdmUiLCJhY3RpdmUiLCJnZXROb2RlTGlzdCIsInRoZW4iLCJyZXMiLCJub2RlTGlzdCIsImRhdGEiLCJyZXN1bHQiLCJub2RlIiwiY2FwYWNpdHkiLCJtZW1vcnkiLCJ0b0ZpeGVkIiwibGFiZWxzIiwiaXNVc2VkQnlCdWlsZCIsIkJVSUxERU5WIiwiaW5pdCIsImZpbmFsbHkiLCJnZXREYXRhIiwiY2x1c3RlcklucyIsImFuZ3VsYXIiLCJjb3B5IiwiY29uZmlnIiwiYnVpbGRDb25maWciLCIkZW1pdCIsInRpdGxlIiwibmFtZSIsImRlc2NyaXRpb24iLCJtb2QiLCJjbHVzdGVyTGlzdCIsImkiLCJsZW5ndGgiLCJzcGxpY2UiLCJvcGVuV2FybmluZyIsImdldE5hbWVzcGFjZSIsIm5hbWVzcGFjZUxpc3QiLCJsIiwicHVzaCIsImFkZEhvc3QiLCJpc0VkaXRDbHVzdGVyIiwiYWRkTmFtZXNwYWNlIiwiaXNMb2FkaW5nTmFtZXNwYWNlIiwic2V0TmFtZXNwYWNlIiwiY2hlY2tFZGl0IiwiZGVsZXRlQ2x1c3RlciIsImRlbGV0ZURhdGEiLCJtb2RpZnlDbHVzdGVyIiwidmFsaWRFdGNkIiwidmFsaWRJdGVtIiwidmFsaWRLYWZrYSIsInZhbGlkWm9va2VlcGVyIiwibW9kaWZ5Iiwib3BlblByb21wdCIsIm1zZyIsInJlc3VsdE1zZyIsImFkZExhYmVscyIsImlzU2VsZWN0ZWQiLCJvcGVuIiwidGVtcGxhdGVVcmwiLCJzaXplIiwicmVzb2x2ZSIsInRvZ2dsZU5vZGVMYWJlbCIsImlzT25seSIsImxhYmVsc0luZm8iLCJhZGRMYWJlbCIsImNhdGNoIiwiZGVsZXRlTGFiZWwiLCJzdGF0ZUluZm8iLCIkY3VycmVudCIsImluZGV4T2YiLCIkb24iLCJldmVudCIsInVzZXJSb2xlIiwiaGFzUGVybWlzc29uIiwiaGFzTWVtYmVyUGVybWlzc29uIiwiJG1vZGFsSW5zdGFuY2UiLCJsYWJlbExpc3QiLCJuZXdMYWJlbCIsImxhYmVsIiwiaW5kZXgiLCJzdWJtaXRMYWJlbHMiLCJjbG9zZSIsImNhbmNlbCIsImRpc21pc3MiLCJ3aW5kb3ciXSwibWFwcGluZ3MiOiI7O0FBQUE7OztBQUdBLENBQUMsVUFBVUEsT0FBVixFQUFtQkMsU0FBbkIsRUFBOEI7QUFDOUI7O0FBQ0EsS0FBSSxPQUFPRCxPQUFQLEtBQW1CLFdBQXZCLEVBQW9DO0FBQ3BDQSxTQUFRRSxVQUFSLENBQW1CLGtCQUFuQixFQUF1QyxDQUFDLFFBQUQsRUFBVyxjQUFYLEVBQTJCLGNBQTNCLEVBQTJDLFFBQTNDLEVBQXFELGFBQXJELEVBQW9FLFlBQXBFLEVBQWtGLFFBQWxGLEVBQTRGLFVBQVVDLE1BQVYsRUFBa0JDLFlBQWxCLEVBQWdDQyxZQUFoQyxFQUE4Q0MsTUFBOUMsRUFBc0RDLFdBQXRELEVBQW1FQyxVQUFuRSxFQUErRUMsTUFBL0UsRUFBdUY7QUFDek4sTUFBSSxDQUFDSixhQUFhSyxFQUFsQixFQUFzQjtBQUNyQkosVUFBT0ssRUFBUCxDQUFVLGVBQVY7QUFDQTtBQUNELE1BQU1DLGFBQVlULE9BQU9TLFNBQVAsR0FBbUJQLGFBQWFLLEVB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QUV2QjRCLFVBQUssYUFBYWhELElBQUlFLElBQUosQ0FBUytDO0FBRkosS0FBeEI7QUFJQSxJQVJEO0FBU0EsR0FyQkQ7QUFzQkE5RSxTQUFPMEcsTUFBUCxHQUFnQixZQUFNO0FBQ3JCUCxrQkFBZVEsT0FBZjtBQUNBLEdBRkQ7QUFHQSxFQTNDa0MsQ0E5UG5DO0FBMFNBLENBN1NELEVBNlNHQyxPQUFPL0csT0E3U1YiLCJmaWxlIjoiaW5kZXgvdHBsL2NsdXN0ZXJEZXRhaWwvY2x1c3RlckRldGFpbEN0ci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXHJcbiAqIEBhdXRob3IgQ2hhbmRyYUxlZVxyXG4gKi9cclxuKGZ1bmN0aW9uIChkb21lQXBwLCB1bmRlZmluZWQpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblx0aWYgKHR5cGVvZiBkb21lQXBwID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xyXG5cdGRvbWVBcHAuY29udHJvbGxlcignQ2x1c3RlckRldGFpbEN0cicsIFsnJHNjb3BlJywgJyRkb21lQ2x1c3RlcicsICckc3RhdGVQYXJhbXMnLCAnJHN0YXRlJywgJyRkb21lUHVibGljJywgJyRkb21lTW9kZWwnLCAnJG1vZGFsJywgZnVuY3Rpb24gKCRzY29wZSwgJGRvbWVDbHVzdGVyLCAkc3RhdGVQYXJhbXMsICRzdGF0ZSwgJGRvbWVQdWJsaWMsICRkb21lTW9kZWwsICRtb2RhbCkge1xyXG5cdFx0aWYgKCEkc3RhdGVQYXJhbXMuaWQpIHtcclxuXHRcdFx0JHN0YXRlLmdvKCdjbHVzdGVyTWFuYWdlJyk7XHJcblx0XHR9XHJcblx0XHRjb25zdCBjbHVzdGVySWQgPSAkc2NvcGUuY2x1c3RlcklkID0gJHN0YXRlUGFyYW1zLmlkLFxyXG5cdFx0XHRub2RlU2VydmljZSA9ICRkb21lQ2x1c3Rlci5nZXRJbnN0YW5jZSgnTm9kZVNlcnZpY2UnKTtcclxuXHRcdGxldCBjbHVzdGVyQ29uZmlnO1xyXG5cdFx0JHNjb3BlLm5vZGVMaXN0SW5zID0gbmV3ICRkb21lTW9kZWwuU2VsZWN0TGlzdE1vZGVsKCdub2RlTGlzdCcpO1xyXG5cdFx0JHNjb3BlLnJlc291cmNlVHlwZSA9ICdDTFVTVEVSJztcclxuXHRcdCRzY29wZS5yZXNvdXJjZUlkID0gY2x1c3RlcklkO1xyXG5cdFx0JHNjb3BlLmlzV2FpdGluZ0hvc3QgPSB0cnVlO1xyXG5cdFx0JHNjb3BlLmlzV2FpdGluZ05hbWVzcGFjZSA9IHRydWU7XHJcblx0XHQkc2NvcGUuaXNXYWl0aW5nTW9kaWZ5ID0gZmFsc2U7XHJcblx0XHQkc2NvcGUudmFsaWQgPSB7XHJcblx0XHRcdG5lZWRWYWxpZDogZmFsc2VcclxuXHRcdH07XHJcblx0XHQkc2NvcGUubmFtZXNwYWNlVHh0ID0ge1xyXG5cdFx0XHRuYW1lc3BhY2U6ICcnXHJcblx0XHR9O1xyXG5cdFx0JHNjb3BlLmlzRWRpdCA9IGZhbHNlO1xyXG5cclxuXHRcdCRzY29wZS50YWJBY3RpdmUgPSBbe1xyXG5cdFx0XHRhY3RpdmU6IGZhbHNlXHJcblx0XHR9LCB7XHJcblx0XHRcdGFjdGl2ZTogZmFsc2VcclxuXHRcdH0sIHtcclxuXHRcdFx0YWN0aXZlOiBmYWxzZVxyXG5cclxuXHRcdH0sIHtcclxuXHRcdFx0YWN0aXZlOiBmYWxzZVxyXG5cdFx0fV07XHJcblxyXG5cdFx0bm9kZVNlcnZpY2UuZ2V0Tm9kZUxpc3QoY2x1c3RlcklkKS50aGVuKChyZXMpID0+IHtcclxuXHRcdFx0bGV0IG5vZGVMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xyXG5cdFx0XHRmb3IgKGxldCBub2RlIG9mIG5vZGVMaXN0KSB7XHJcblx0XHRcdFx0aWYgKG5vZGUuY2FwYWNpdHkpIHtcclxuXHRcdFx0XHRcdG5vZGUuY2FwYWNpdHkubWVtb3J5ID0gKG5vZGUuY2FwYWNpdHkubWVtb3J5IC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmICghbm9kZS5sYWJlbHMpIHtcclxuXHRcdFx0XHRcdG5vZGUubGFiZWxzID0ge307XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdG5vZGUuaXNVc2VkQnlCdWlsZCA9IHR5cGVvZiBub2RlLmxhYmVscy5CVUlMREVOViAhPT0gJ3VuZGVmaW5lZCc7XHJcblx0XHRcdH1cclxuXHRcdFx0JHNjb3BlLm5vZGVMaXN0SW5zLmluaXQobm9kZUxpc3QsIGZhbHNlKTtcclxuXHRcdH0pLmZpbmFsbHkoKCkgPT4ge1xyXG5cdFx0XHQkc2NvcGUuaXNXYWl0aW5nSG9zdCA9IGZhbHNlO1xyXG5cdFx0fSk7XHJcblx0XHR2YXIgaW5pdCA9ICgpID0+IHtcclxuXHRcdFx0bm9kZVNlcnZpY2UuZ2V0RGF0YShjbHVzdGVySWQpLnRoZW4oKHJlcykgPT4ge1xyXG5cdFx0XHRcdCRzY29wZS5jbHVzdGVySW5zID0gJGRvbWVDbHVzdGVyLmdldEluc3RhbmNlKCdDbHVzdGVyJywgcmVzLmRhdGEucmVzdWx0KTtcclxuXHRcdFx0XHRjbHVzdGVyQ29uZmlnID0gYW5ndWxhci5jb3B5KCRzY29wZS5jbHVzdGVySW5zLmNvbmZpZyk7XHJcblx0XHRcdFx0JHNjb3BlLmNvbmZpZyA9ICRzY29wZS5jbHVzdGVySW5zLmNvbmZpZztcclxuXHRcdFx0XHRpZiAoY2x1c3RlckNvbmZpZy5idWlsZENvbmZpZyA9PT0gMSkge1xyXG5cdFx0XHRcdFx0JHNjb3BlLiRlbWl0KCdwYWdlVGl0bGUnLCB7XHJcblx0XHRcdFx0XHRcdHRpdGxlOiAkc2NvcGUuY29uZmlnLm5hbWUsXHJcblx0XHRcdFx0XHRcdGRlc2NyaXRpb246ICfor6Xpm4bnvqTmmK/mnoTlu7rpm4bnvqTvvIzpnIDopoHkv53or4Hpm4bnvqTlhoXkuLvmnLrlj6/nlKjkuo7mnoTlu7rjgIInLFxyXG5cdFx0XHRcdFx0XHRtb2Q6ICdjbHVzdGVyJ1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCRzY29wZS4kZW1pdCgncGFnZVRpdGxlJywge1xyXG5cdFx0XHRcdFx0XHR0aXRsZTogJHNjb3BlLmNvbmZpZy5uYW1lLFxyXG5cdFx0XHRcdFx0XHRkZXNjcml0aW9uOiAnJyxcclxuXHRcdFx0XHRcdFx0bW9kOiAnY2x1c3RlcidcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRub2RlU2VydmljZS5nZXREYXRhKCkudGhlbigocmVzKSA9PiB7XHJcblx0XHRcdFx0XHQkc2NvcGUuY2x1c3Rlckxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8ICRzY29wZS5jbHVzdGVyTGlzdC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0XHRpZiAoJHNjb3BlLmNsdXN0ZXJMaXN0W2ldLm5hbWUgPT09IGNsdXN0ZXJDb25maWcubmFtZSkge1xyXG5cdFx0XHRcdFx0XHRcdCRzY29wZS5jbHVzdGVyTGlzdC5zcGxpY2UoaSwgMSk7XHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSwgKCkgPT4ge1xyXG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfor7fmsYLlpLHotKXvvIEnKTtcclxuXHRcdFx0XHQkc3RhdGUuZ28oJ2NsdXN0ZXJNYW5hZ2UnKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9O1xyXG5cdFx0aW5pdCgpO1xyXG5cdFx0JHNjb3BlLmdldE5hbWVzcGFjZSA9ICgpID0+IHtcclxuXHRcdFx0bm9kZVNlcnZpY2UuZ2V0TmFtZXNwYWNlKGNsdXN0ZXJJZCkudGhlbigocmVzKSA9PiB7XHJcblx0XHRcdFx0bGV0IG5hbWVzcGFjZUxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XHJcblx0XHRcdFx0JHNjb3BlLm5hbWVzcGFjZUxpc3QgPSBbXTtcclxuXHRcdFx0XHRmb3IgKGxldCBpID0gMCwgbCA9IG5hbWVzcGFjZUxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcblx0XHRcdFx0XHQkc2NvcGUubmFtZXNwYWNlTGlzdC5wdXNoKG5hbWVzcGFjZUxpc3RbaV0ubmFtZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCAoKSA9PiB7XHJcblx0XHRcdFx0JHNjb3BlLm5hbWVzcGFjZUxpc3QgPSBbXTtcclxuXHRcdFx0fSkuZmluYWxseSgoKSA9PiB7XHJcblx0XHRcdFx0JHNjb3BlLmlzV2FpdGluZ05hbWVzcGFjZSA9IGZhbHNlO1xyXG5cdFx0XHR9KTtcclxuXHRcdH07XHJcblx0XHQkc2NvcGUuYWRkSG9zdCA9IChjbHVzdGVySWQpID0+IHtcclxuXHRcdFx0aWYoJHNjb3BlLmlzRWRpdENsdXN0ZXIpIHtcclxuXHRcdFx0XHQkc3RhdGUuZ28oJ2FkZEhvc3QnLCB7J2lkJzpjbHVzdGVySWR9KTtcclxuXHRcdFx0fWVsc2Uge1xyXG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfmgqjmsqHmnInmnYPpmZDmt7vliqDkuLvmnLonKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdCRzY29wZS5hZGROYW1lc3BhY2UgPSAoKSA9PiB7XHJcblx0XHRcdCRzY29wZS5pc0xvYWRpbmdOYW1lc3BhY2UgPSB0cnVlO1xyXG5cdFx0XHRsZXQgbmFtZXNwYWNlID0gJHNjb3BlLm5hbWVzcGFjZVR4dC5uYW1lc3BhY2U7XHJcblx0XHRcdGlmICghbmFtZXNwYWNlKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdGZvciAobGV0IGkgPSAwLCBsID0gJHNjb3BlLm5hbWVzcGFjZUxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcblx0XHRcdFx0aWYgKCRzY29wZS5uYW1lc3BhY2VMaXN0W2ldID09PSBuYW1lc3BhY2UpIHtcclxuXHRcdFx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKCflt7LlrZjlnKjvvIEnKTtcclxuXHRcdFx0XHRcdCRzY29wZS5pc0xvYWRpbmdOYW1lc3BhY2UgPSBmYWxzZTtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0bm9kZVNlcnZpY2Uuc2V0TmFtZXNwYWNlKGNsdXN0ZXJJZCwgW25hbWVzcGFjZV0pLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdCRzY29wZS5uYW1lc3BhY2VMaXN0LnB1c2gobmFtZXNwYWNlKTtcclxuXHRcdFx0XHQkc2NvcGUubmFtZXNwYWNlVHh0Lm5hbWVzcGFjZSA9ICcnO1xyXG5cdFx0XHR9LCAoKSA9PiB7XHJcblx0XHRcdFx0JGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+a3u+WKoOWksei0pe+8gScpO1xyXG5cdFx0XHR9KS5maW5hbGx5KCgpID0+IHtcclxuXHRcdFx0XHQkc2NvcGUuaXNMb2FkaW5nTmFtZXNwYWNlID0gZmFsc2U7XHJcblx0XHRcdH0pO1xyXG5cdFx0fTtcclxuXHRcdCRzY29wZS5jaGVja0VkaXQgPSAoKSA9PiB7XHJcblx0XHRcdCRzY29wZS5pc0VkaXQgPSAhJHNjb3BlLmlzRWRpdDtcclxuXHRcdFx0aWYgKCEkc2NvcGUuaXNFZGl0KSB7XHJcblx0XHRcdFx0JHNjb3BlLnZhbGlkLm5lZWRWYWxpZCA9IGZhbHNlO1xyXG5cdFx0XHRcdCRzY29wZS5jbHVzdGVySW5zLmNvbmZpZyA9IGFuZ3VsYXIuY29weShjbHVzdGVyQ29uZmlnKTtcclxuXHRcdFx0XHQkc2NvcGUuY29uZmlnID0gJHNjb3BlLmNsdXN0ZXJJbnMuY29uZmlnO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0JHNjb3BlLmRlbGV0ZUNsdXN0ZXIgPSAoKSA9PiB7XHJcblx0XHRcdG5vZGVTZXJ2aWNlLmRlbGV0ZURhdGEoY2x1c3RlcklkKS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHQkc3RhdGUuZ28oJ2NsdXN0ZXJNYW5hZ2UnKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9O1xyXG5cdFx0JHNjb3BlLm1vZGlmeUNsdXN0ZXIgPSAoKSA9PiB7XHJcblx0XHRcdGxldCB2YWxpZEV0Y2QgPSAkc2NvcGUuY2x1c3Rlcklucy52YWxpZEl0ZW0oJ2V0Y2QnKSxcclxuXHRcdFx0XHR2YWxpZEthZmthID0gJHNjb3BlLmNsdXN0ZXJJbnMudmFsaWRJdGVtKCdrYWZrYScpLFxyXG5cdFx0XHRcdHZhbGlkWm9va2VlcGVyID0gJHNjb3BlLmNsdXN0ZXJJbnMudmFsaWRJdGVtKCd6b29rZWVwZXInKTtcclxuXHRcdFx0aWYgKCF2YWxpZEV0Y2QgfHwgIXZhbGlkS2Fma2EgfHwgIXZhbGlkWm9va2VlcGVyKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdCRzY29wZS5pc1dhaXRpbmdNb2RpZnkgPSB0cnVlO1xyXG5cdFx0XHQkc2NvcGUudmFsaWQubmVlZFZhbGlkID0gZmFsc2U7XHJcblx0XHRcdCRzY29wZS5jbHVzdGVySW5zLm1vZGlmeSgpLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+S/ruaUueaIkOWKn++8gScpO1xyXG5cdFx0XHRcdGluaXQoKTtcclxuXHRcdFx0XHQkc2NvcGUuY2hlY2tFZGl0KCk7XHJcblx0XHRcdH0sIChyZXMpID0+IHtcclxuXHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XHJcblx0XHRcdFx0XHR0aXRsZTogJ+S/ruaUueWksei0pe+8gScsXHJcblx0XHRcdFx0XHRtc2c6ICdNZXNzYWdlOicgKyByZXMuZGF0YS5yZXN1bHRNc2dcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSkuZmluYWxseSgoKSA9PiB7XHJcblx0XHRcdFx0JHNjb3BlLmlzV2FpdGluZ01vZGlmeSA9IGZhbHNlO1xyXG5cdFx0XHR9KTtcclxuXHRcdH07XHJcblx0XHQkc2NvcGUuYWRkTGFiZWxzID0gKCkgPT4ge1xyXG5cdFx0XHRsZXQgbm9kZUxpc3QgPSBbXTtcclxuXHRcdFx0Zm9yIChsZXQgbm9kZSBvZiAkc2NvcGUubm9kZUxpc3RJbnMubm9kZUxpc3QpIHtcclxuXHRcdFx0XHRpZiAobm9kZS5pc1NlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRub2RlTGlzdC5wdXNoKHtcclxuXHRcdFx0XHRcdFx0bm9kZTogbm9kZS5uYW1lXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKG5vZGVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfor7foh7PlsJHpgInmi6nkuIDlj7DkuLvmnLrvvIEnKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdFx0JG1vZGFsLm9wZW4oe1xyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYWRkTGFiZWxNb2RhbC5odG1sJyxcclxuXHRcdFx0XHRjb250cm9sbGVyOiAnQWRkTGFiZWxNb2RhbEN0cicsXHJcblx0XHRcdFx0c2l6ZTogJ21kJyxcclxuXHRcdFx0XHRyZXNvbHZlOiB7XHJcblx0XHRcdFx0XHRjbHVzdGVySWQ6ICgpID0+IHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGNsdXN0ZXJJZDtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRub2RlTGlzdDogKCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gbm9kZUxpc3Q7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH07XHJcblx0XHQkc2NvcGUudG9nZ2xlTm9kZUxhYmVsID0gKG5vZGUpID0+IHtcclxuXHRcdFx0bm9kZS5pc1VzZWRCeUJ1aWxkID0gIW5vZGUuaXNVc2VkQnlCdWlsZDtcclxuXHRcdFx0bGV0IGlzT25seSA9IGZhbHNlO1xyXG5cdFx0XHRpZiAoIW5vZGUuaXNVc2VkQnlCdWlsZCkge1xyXG5cdFx0XHRcdGlzT25seSA9IHRydWU7XHJcblx0XHRcdFx0Zm9yIChsZXQgbm9kZSBvZiAkc2NvcGUubm9kZUxpc3RJbnMubm9kZUxpc3QpIHtcclxuXHRcdFx0XHRcdGlmIChub2RlLmlzVXNlZEJ5QnVpbGQpIHtcclxuXHRcdFx0XHRcdFx0aXNPbmx5ID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoaXNPbmx5KSB7XHJcblx0XHRcdFx0JGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+ivt+S/neivgembhue+pOWGheiHs+WwkeacieS4gOWPsOeUqOS6juaehOW7uueahOS4u+acuu+8gScpO1xyXG5cdFx0XHRcdG5vZGUuaXNVc2VkQnlCdWlsZCA9ICFub2RlLmlzVXNlZEJ5QnVpbGQ7XHJcblx0XHRcdH1cclxuXHRcdFx0bGV0IGxhYmVsc0luZm8gPSBbe1xyXG5cdFx0XHRcdG5vZGU6IG5vZGUubmFtZSxcclxuXHRcdFx0XHRsYWJlbHM6IHtcclxuXHRcdFx0XHRcdCdCVUlMREVOVic6ICdIT1NURU5WVFlQRSdcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1dO1xyXG5cdFx0XHRpZiAobm9kZS5pc1VzZWRCeUJ1aWxkKSB7XHJcblx0XHRcdFx0bm9kZVNlcnZpY2UuYWRkTGFiZWwoY2x1c3RlcklkLCBsYWJlbHNJbmZvKS5jYXRjaCgocmVzKSA9PiB7XHJcblx0XHRcdFx0XHRub2RlLmlzVXNlZEJ5QnVpbGQgPSAhbm9kZS5pc1VzZWRCeUJ1aWxkO1xyXG5cdFx0XHRcdFx0JGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xyXG5cdFx0XHRcdFx0XHR0aXRsZTogJ+S/ruaUueWksei0pe+8gScsXHJcblx0XHRcdFx0XHRcdG1zZzogJ01lc3NhZ2U6JyArIHJlcy5kYXRhLnJlc3VsdE1zZ1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bm9kZVNlcnZpY2UuZGVsZXRlTGFiZWwoY2x1c3RlcklkLCBsYWJlbHNJbmZvKS5jYXRjaCgocmVzKSA9PiB7XHJcblx0XHRcdFx0XHRub2RlLmlzVXNlZEJ5QnVpbGQgPSAhbm9kZS5pc1VzZWRCeUJ1aWxkO1xyXG5cdFx0XHRcdFx0JGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xyXG5cdFx0XHRcdFx0XHR0aXRsZTogJ+S/ruaUueWksei0pe+8gScsXHJcblx0XHRcdFx0XHRcdG1zZzogJ01lc3NhZ2U6JyArIHJlcy5kYXRhLnJlc3VsdE1zZ1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0bGV0IHN0YXRlSW5mbyA9ICRzdGF0ZS4kY3VycmVudC5uYW1lO1xyXG5cdFx0aWYgKHN0YXRlSW5mby5pbmRleE9mKCdpbmZvJykgIT09IC0xKSB7XHJcblx0XHRcdCRzY29wZS50YWJBY3RpdmVbMV0uYWN0aXZlID0gdHJ1ZTtcclxuXHRcdH0gZWxzZSBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ25hbWVzcGFjZScpICE9PSAtMSkge1xyXG5cdFx0XHQkc2NvcGUudGFiQWN0aXZlWzJdLmFjdGl2ZSA9IHRydWU7XHJcblx0XHRcdCRzY29wZS5nZXROYW1lc3BhY2UoKTtcclxuXHRcdH0gZWxzZSBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ3VzZXJzJykgIT09IC0xKSB7XHJcblx0XHRcdCRzY29wZS50YWJBY3RpdmVbM10uYWN0aXZlID0gdHJ1ZTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCRzY29wZS50YWJBY3RpdmVbMF0uYWN0aXZlID0gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyDnmbvlvZXnlKjmiLfop5LoibLmnYPpmZBcclxuXHRcdCRzY29wZS4kb24oJ3NpZ25hbFJlc291cmNlQ3VycmVudFVzZXJSb2xlJywgZnVuY3Rpb24gKGV2ZW50LCBtc2cpIHtcclxuICAgICAgICAgIFx0dmFyIHVzZXJSb2xlID0gbXNnO1xyXG4gICAgICAgICAgXHRpZiAodXNlclJvbGUgPT09ICdNQVNURVInIHx8IHVzZXJSb2xlID09PSAnREVWRUxPUEVSJykge1xyXG5cdFx0XHRcdCRzY29wZS5pc0VkaXRDbHVzdGVyID0gdHJ1ZTtcclxuXHRcdFx0fWVsc2Uge1xyXG5cdFx0XHRcdCRzY29wZS5pc0VkaXRDbHVzdGVyID0gZmFsc2U7XHJcblx0XHRcdH1cclxuICAgICAgICB9KTtcclxuXHJcblx0XHQkc2NvcGUuJG9uKCdtZW1iZXJQZXJtaXNzb24nLCBmdW5jdGlvbiAoZXZlbnQsIGhhc1Blcm1pc3Nvbikge1xyXG5cdFx0XHQkc2NvcGUuaGFzTWVtYmVyUGVybWlzc29uID0gaGFzUGVybWlzc29uO1xyXG5cdFx0XHRpZiAoIWhhc1Blcm1pc3NvbiAmJiBzdGF0ZUluZm8uaW5kZXhPZigndXNlcnMnKSAhPT0gLTEpIHtcclxuXHRcdFx0XHQkc3RhdGUuZ28oJ2NsdXN0ZXJEZXRhaWwuaG9zdGxpc3QnKTtcclxuXHRcdFx0XHQkc2NvcGUudGFiQWN0aXZlWzBdLmFjdGl2ZSA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1dKS5jb250cm9sbGVyKCdBZGRMYWJlbE1vZGFsQ3RyJywgWyckc2NvcGUnLCAnY2x1c3RlcklkJywgJ25vZGVMaXN0JywgJyRtb2RhbEluc3RhbmNlJywgJyRkb21lUHVibGljJywgJyRkb21lQ2x1c3RlcicsIGZ1bmN0aW9uICgkc2NvcGUsIGNsdXN0ZXJJZCwgbm9kZUxpc3QsICRtb2RhbEluc3RhbmNlLCAkZG9tZVB1YmxpYywgJGRvbWVDbHVzdGVyKSB7XHJcblx0XHQvL2NvbnNvbGUubG9nKG5vZGVMaXN0KTtcclxuXHRcdCRzY29wZS5sYWJlbExpc3QgPSBbXTtcclxuXHRcdCRzY29wZS5uZXdMYWJlbCA9ICcnO1xyXG5cdFx0bGV0IG5vZGVTZXJ2aWNlID0gJGRvbWVDbHVzdGVyLmdldEluc3RhbmNlKCdOb2RlU2VydmljZScpO1xyXG5cdFx0JHNjb3BlLmFkZExhYmVsID0gKCkgPT4ge1xyXG5cdFx0XHRmb3IgKGxldCBsYWJlbCBvZiAkc2NvcGUubGFiZWxMaXN0KSB7XHJcblx0XHRcdFx0aWYgKGxhYmVsID09PSAkc2NvcGUubmV3TGFiZWwpIHtcclxuXHRcdFx0XHRcdCRzY29wZS5uZXdMYWJlbCA9ICcnO1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHQkc2NvcGUubGFiZWxMaXN0LnB1c2goJHNjb3BlLm5ld0xhYmVsKTtcclxuXHRcdFx0JHNjb3BlLm5ld0xhYmVsID0gJyc7XHJcblx0XHR9O1xyXG5cdFx0JHNjb3BlLmRlbGV0ZUxhYmVsID0gKGluZGV4KSA9PiB7XHJcblx0XHRcdCRzY29wZS5sYWJlbExpc3Quc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdH07XHJcblx0XHQkc2NvcGUuc3VibWl0TGFiZWxzID0gKCkgPT4ge1xyXG5cdFx0XHRpZiAoJHNjb3BlLmxhYmVsTGlzdC5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5oKo5bCa5pyq5re75Yqg5qCH562+77yBJyk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdGxldCBsYWJlbHMgPSB7fTtcclxuXHRcdFx0Zm9yIChsZXQgbGFiZWwgb2YgJHNjb3BlLmxhYmVsTGlzdCkge1xyXG5cdFx0XHRcdGxhYmVsc1tsYWJlbF0gPSAnVVNFUl9MQUJFTF9WQUxVRSc7XHJcblx0XHRcdH1cclxuXHRcdFx0Zm9yIChsZXQgbm9kZSBvZiBub2RlTGlzdCkge1xyXG5cdFx0XHRcdG5vZGUubGFiZWxzID0gbGFiZWxzO1xyXG5cdFx0XHR9XHJcblx0XHRcdG5vZGVTZXJ2aWNlLmFkZExhYmVsKGNsdXN0ZXJJZCwgbm9kZUxpc3QpLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+a3u+WKoOaIkOWKn++8gScpO1xyXG5cdFx0XHRcdCRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XHJcblx0XHRcdH0sIChyZXMpID0+IHtcclxuXHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XHJcblx0XHRcdFx0XHR0aXRsZTogJ+a3u+WKoOWksei0pe+8gScsXHJcblx0XHRcdFx0XHRtc2c6ICdNZXNzYWdlOicgKyByZXMuZGF0YS5yZXN1bHRNc2dcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9O1xyXG5cdFx0JHNjb3BlLmNhbmNlbCA9ICgpID0+IHtcclxuXHRcdFx0JG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xyXG5cdFx0fTtcclxuXHR9XSk7XHJcbn0pKHdpbmRvdy5kb21lQXBwKTsiXX0=
