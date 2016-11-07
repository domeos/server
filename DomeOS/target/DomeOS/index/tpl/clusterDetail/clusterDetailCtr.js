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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L3RwbC9jbHVzdGVyRGV0YWlsL2NsdXN0ZXJEZXRhaWxDdHIuZXMiXSwibmFtZXMiOlsiZG9tZUFwcCIsInVuZGVmaW5lZCIsImNvbnRyb2xsZXIiLCIkc2NvcGUiLCIkZG9tZUNsdXN0ZXIiLCIkc3RhdGVQYXJhbXMiLCIkc3RhdGUiLCIkZG9tZVB1YmxpYyIsIiRkb21lTW9kZWwiLCIkbW9kYWwiLCJpZCIsImdvIiwiY2x1c3RlcklkIiwibm9kZVNlcnZpY2UiLCJnZXRJbnN0YW5jZSIsImNsdXN0ZXJDb25maWciLCJub2RlTGlzdElucyIsIlNlbGVjdExpc3RNb2RlbCIsInJlc291cmNlVHlwZSIsInJlc291cmNlSWQiLCJpc1dhaXRpbmdIb3N0IiwiaXNXYWl0aW5nTmFtZXNwYWNlIiwiaXNXYWl0aW5nTW9kaWZ5IiwidmFsaWQiLCJuZWVkVmFsaWQiLCJuYW1lc3BhY2VUeHQiLCJuYW1lc3BhY2UiLCJpc0VkaXQiLCJ0YWJBY3RpdmUiLCJhY3RpdmUiLCJnZXROb2RlTGlzdCIsInRoZW4iLCJyZXMiLCJub2RlTGlzdCIsImRhdGEiLCJyZXN1bHQiLCJub2RlIiwiY2FwYWNpdHkiLCJtZW1vcnkiLCJ0b0ZpeGVkIiwibGFiZWxzIiwiaXNVc2VkQnlCdWlsZCIsIkJVSUxERU5WIiwiaW5pdCIsImZpbmFsbHkiLCJnZXREYXRhIiwiY2x1c3RlcklucyIsImFuZ3VsYXIiLCJjb3B5IiwiY29uZmlnIiwiYnVpbGRDb25maWciLCIkZW1pdCIsInRpdGxlIiwibmFtZSIsImRlc2NyaXRpb24iLCJtb2QiLCJjbHVzdGVyTGlzdCIsImkiLCJsZW5ndGgiLCJzcGxpY2UiLCJvcGVuV2FybmluZyIsImdldE5hbWVzcGFjZSIsIm5hbWVzcGFjZUxpc3QiLCJsIiwicHVzaCIsImFkZE5hbWVzcGFjZSIsImlzTG9hZGluZ05hbWVzcGFjZSIsInNldE5hbWVzcGFjZSIsImNoZWNrRWRpdCIsImRlbGV0ZUNsdXN0ZXIiLCJkZWxldGVEYXRhIiwibW9kaWZ5Q2x1c3RlciIsInZhbGlkRXRjZCIsInZhbGlkSXRlbSIsInZhbGlkS2Fma2EiLCJ2YWxpZFpvb2tlZXBlciIsIm1vZGlmeSIsIm9wZW5Qcm9tcHQiLCJtc2ciLCJyZXN1bHRNc2ciLCJhZGRMYWJlbHMiLCJpc1NlbGVjdGVkIiwib3BlbiIsInRlbXBsYXRlVXJsIiwic2l6ZSIsInJlc29sdmUiLCJ0b2dnbGVOb2RlTGFiZWwiLCJpc09ubHkiLCJsYWJlbHNJbmZvIiwiYWRkTGFiZWwiLCJjYXRjaCIsImRlbGV0ZUxhYmVsIiwic3RhdGVJbmZvIiwiJGN1cnJlbnQiLCJpbmRleE9mIiwiJG9uIiwiZXZlbnQiLCJoYXNQZXJtaXNzb24iLCJoYXNNZW1iZXJQZXJtaXNzb24iLCIkbW9kYWxJbnN0YW5jZSIsImNvbnNvbGUiLCJsb2ciLCJsYWJlbExpc3QiLCJuZXdMYWJlbCIsImxhYmVsIiwiaW5kZXgiLCJzdWJtaXRMYWJlbHMiLCJjbG9zZSIsImNhbmNlbCIsImRpc21pc3MiLCJ3aW5kb3ciXSwibWFwcGluZ3MiOiI7O0FBQUE7OztBQUdBLENBQUMsVUFBVUEsT0FBVixFQUFtQkMsU0FBbkIsRUFBOEI7QUFDOUI7O0FBQ0EsS0FBSSxPQUFPRCxPQUFQLEtBQW1CLFdBQXZCLEVBQW9DO0FBQ3BDQSxTQUFRRSxVQUFSLENBQW1CLGtCQUFuQixFQUF1QyxDQUFDLFFBQUQsRUFBVyxjQUFYLEVBQTJCLGNBQTNCLEVBQTJDLFFBQTNDLEVBQXFELGFBQXJELEVBQW9FLFlBQXBFLEVBQWtGLFFBQWxGLEVBQTRGLFVBQVVDLE1BQVYsRUFBa0JDLFlBQWxCLEVBQWdDQyxZQUFoQyxFQUE4Q0MsTUFBOUMsRUFBc0RDLFdBQXRELEVBQW1FQyxVQUFuRSxFQUErRUMsTUFBL0UsRUFBdUY7QUFDek4sTUFBSSxDQUFDSixhQUFhSyxFQUFsQixFQUFzQjtBQUNyQkosVUFBT0ssRUFBUCxDQUFVLGVBQVY7QUFDQTtBQUNELE1BQU1DLGFBQVlULE9BQU9TLFNBQVAsR0FBbUJQLGFBQWFLLEVBQWxEO0FBQUEsTUFDQ0csY0FBY1Qs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LFlBQU9nRSxLQUFQLElBQWdCLGtCQUFoQjtBQUNBO0FBUjBCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBUzNCLDBCQUFpQnZFLFFBQWpCLG1JQUEyQjtBQUFBLFNBQWxCRyxJQUFrQjs7QUFDMUJBLFVBQUtJLE1BQUwsR0FBY0EsTUFBZDtBQUNBO0FBWDBCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBWTNCM0IsZUFBWTRFLFFBQVosQ0FBcUI3RSxTQUFyQixFQUFnQ3FCLFFBQWhDLEVBQTBDRixJQUExQyxDQUErQyxZQUFNO0FBQ3BEeEIsZ0JBQVlzRSxVQUFaLENBQXVCLE9BQXZCO0FBQ0FzQixtQkFBZVEsS0FBZjtBQUNBLElBSEQsRUFHRyxVQUFDM0UsR0FBRCxFQUFTO0FBQ1h6QixnQkFBWXFELFdBQVosQ0FBd0I7QUFDdkJSLFlBQU8sT0FEZ0I7QUFFdkIwQixVQUFLLGFBQWE5QyxJQUFJRSxJQUFKLENBQVM2QztBQUZKLEtBQXhCO0FBSUEsSUFSRDtBQVNBLEdBckJEO0FBc0JBNUUsU0FBT3lHLE1BQVAsR0FBZ0IsWUFBTTtBQUNyQlQsa0JBQWVVLE9BQWY7QUFDQSxHQUZEO0FBR0EsRUEzQ2tDLENBOU9uQztBQTBSQSxDQTdSRCxFQTZSR0MsT0FBTzlHLE9BN1JWIiwiZmlsZSI6ImluZGV4L3RwbC9jbHVzdGVyRGV0YWlsL2NsdXN0ZXJEZXRhaWxDdHIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQGF1dGhvciBDaGFuZHJhTGVlXG4gKi9cbihmdW5jdGlvbiAoZG9tZUFwcCwgdW5kZWZpbmVkKSB7XG5cdCd1c2Ugc3RyaWN0Jztcblx0aWYgKHR5cGVvZiBkb21lQXBwID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xuXHRkb21lQXBwLmNvbnRyb2xsZXIoJ0NsdXN0ZXJEZXRhaWxDdHInLCBbJyRzY29wZScsICckZG9tZUNsdXN0ZXInLCAnJHN0YXRlUGFyYW1zJywgJyRzdGF0ZScsICckZG9tZVB1YmxpYycsICckZG9tZU1vZGVsJywgJyRtb2RhbCcsIGZ1bmN0aW9uICgkc2NvcGUsICRkb21lQ2x1c3RlciwgJHN0YXRlUGFyYW1zLCAkc3RhdGUsICRkb21lUHVibGljLCAkZG9tZU1vZGVsLCAkbW9kYWwpIHtcblx0XHRpZiAoISRzdGF0ZVBhcmFtcy5pZCkge1xuXHRcdFx0JHN0YXRlLmdvKCdjbHVzdGVyTWFuYWdlJyk7XG5cdFx0fVxuXHRcdGNvbnN0IGNsdXN0ZXJJZCA9ICRzY29wZS5jbHVzdGVySWQgPSAkc3RhdGVQYXJhbXMuaWQsXG5cdFx0XHRub2RlU2VydmljZSA9ICRkb21lQ2x1c3Rlci5nZXRJbnN0YW5jZSgnTm9kZVNlcnZpY2UnKTtcblx0XHRsZXQgY2x1c3RlckNvbmZpZztcblx0XHQkc2NvcGUubm9kZUxpc3RJbnMgPSBuZXcgJGRvbWVNb2RlbC5TZWxlY3RMaXN0TW9kZWwoJ25vZGVMaXN0Jyk7XG5cdFx0JHNjb3BlLnJlc291cmNlVHlwZSA9ICdDTFVTVEVSJztcblx0XHQkc2NvcGUucmVzb3VyY2VJZCA9IGNsdXN0ZXJJZDtcblx0XHQkc2NvcGUuaXNXYWl0aW5nSG9zdCA9IHRydWU7XG5cdFx0JHNjb3BlLmlzV2FpdGluZ05hbWVzcGFjZSA9IHRydWU7XG5cdFx0JHNjb3BlLmlzV2FpdGluZ01vZGlmeSA9IGZhbHNlO1xuXHRcdCRzY29wZS52YWxpZCA9IHtcblx0XHRcdG5lZWRWYWxpZDogZmFsc2Vcblx0XHR9O1xuXHRcdCRzY29wZS5uYW1lc3BhY2VUeHQgPSB7XG5cdFx0XHRuYW1lc3BhY2U6ICcnXG5cdFx0fTtcblx0XHQkc2NvcGUuaXNFZGl0ID0gZmFsc2U7XG5cblx0XHQkc2NvcGUudGFiQWN0aXZlID0gW3tcblx0XHRcdGFjdGl2ZTogZmFsc2Vcblx0XHR9LCB7XG5cdFx0XHRhY3RpdmU6IGZhbHNlXG5cdFx0fSwge1xuXHRcdFx0YWN0aXZlOiBmYWxzZVxuXG5cdFx0fSwge1xuXHRcdFx0YWN0aXZlOiBmYWxzZVxuXHRcdH1dO1xuXG5cdFx0bm9kZVNlcnZpY2UuZ2V0Tm9kZUxpc3QoY2x1c3RlcklkKS50aGVuKChyZXMpID0+IHtcblx0XHRcdGxldCBub2RlTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcblx0XHRcdGZvciAobGV0IG5vZGUgb2Ygbm9kZUxpc3QpIHtcblx0XHRcdFx0aWYgKG5vZGUuY2FwYWNpdHkpIHtcblx0XHRcdFx0XHRub2RlLmNhcGFjaXR5Lm1lbW9yeSA9IChub2RlLmNhcGFjaXR5Lm1lbW9yeSAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICghbm9kZS5sYWJlbHMpIHtcblx0XHRcdFx0XHRub2RlLmxhYmVscyA9IHt9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdG5vZGUuaXNVc2VkQnlCdWlsZCA9IHR5cGVvZiBub2RlLmxhYmVscy5CVUlMREVOViAhPT0gJ3VuZGVmaW5lZCc7XG5cdFx0XHR9XG5cdFx0XHQkc2NvcGUubm9kZUxpc3RJbnMuaW5pdChub2RlTGlzdCwgZmFsc2UpO1xuXHRcdH0pLmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0JHNjb3BlLmlzV2FpdGluZ0hvc3QgPSBmYWxzZTtcblx0XHR9KTtcblx0XHR2YXIgaW5pdCA9ICgpID0+IHtcblx0XHRcdG5vZGVTZXJ2aWNlLmdldERhdGEoY2x1c3RlcklkKS50aGVuKChyZXMpID0+IHtcblx0XHRcdFx0JHNjb3BlLmNsdXN0ZXJJbnMgPSAkZG9tZUNsdXN0ZXIuZ2V0SW5zdGFuY2UoJ0NsdXN0ZXInLCByZXMuZGF0YS5yZXN1bHQpO1xuXHRcdFx0XHRjbHVzdGVyQ29uZmlnID0gYW5ndWxhci5jb3B5KCRzY29wZS5jbHVzdGVySW5zLmNvbmZpZyk7XG5cdFx0XHRcdCRzY29wZS5jb25maWcgPSAkc2NvcGUuY2x1c3Rlcklucy5jb25maWc7XG5cdFx0XHRcdGlmIChjbHVzdGVyQ29uZmlnLmJ1aWxkQ29uZmlnID09PSAxKSB7XG5cdFx0XHRcdFx0JHNjb3BlLiRlbWl0KCdwYWdlVGl0bGUnLCB7XG5cdFx0XHRcdFx0XHR0aXRsZTogJHNjb3BlLmNvbmZpZy5uYW1lLFxuXHRcdFx0XHRcdFx0ZGVzY3JpdGlvbjogJ+ivpembhue+pOaYr+aehOW7uumbhue+pO+8jOmcgOimgeS/neivgembhue+pOWGheS4u+acuuWPr+eUqOS6juaehOW7uuOAgicsXG5cdFx0XHRcdFx0XHRtb2Q6ICdjbHVzdGVyJ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCRzY29wZS4kZW1pdCgncGFnZVRpdGxlJywge1xuXHRcdFx0XHRcdFx0dGl0bGU6ICRzY29wZS5jb25maWcubmFtZSxcblx0XHRcdFx0XHRcdGRlc2NyaXRpb246ICcnLFxuXHRcdFx0XHRcdFx0bW9kOiAnY2x1c3Rlcidcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRub2RlU2VydmljZS5nZXREYXRhKCkudGhlbigocmVzKSA9PiB7XG5cdFx0XHRcdFx0JHNjb3BlLmNsdXN0ZXJMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgJHNjb3BlLmNsdXN0ZXJMaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRpZiAoJHNjb3BlLmNsdXN0ZXJMaXN0W2ldLm5hbWUgPT09IGNsdXN0ZXJDb25maWcubmFtZSkge1xuXHRcdFx0XHRcdFx0XHQkc2NvcGUuY2x1c3Rlckxpc3Quc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSwgKCkgPT4ge1xuXHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn6K+35rGC5aSx6LSl77yBJyk7XG5cdFx0XHRcdCRzdGF0ZS5nbygnY2x1c3Rlck1hbmFnZScpO1xuXHRcdFx0fSk7XG5cdFx0fTtcblx0XHRpbml0KCk7XG5cdFx0JHNjb3BlLmdldE5hbWVzcGFjZSA9ICgpID0+IHtcblx0XHRcdG5vZGVTZXJ2aWNlLmdldE5hbWVzcGFjZShjbHVzdGVySWQpLnRoZW4oKHJlcykgPT4ge1xuXHRcdFx0XHRsZXQgbmFtZXNwYWNlTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcblx0XHRcdFx0JHNjb3BlLm5hbWVzcGFjZUxpc3QgPSBbXTtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDAsIGwgPSBuYW1lc3BhY2VMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHRcdFx0XHRcdCRzY29wZS5uYW1lc3BhY2VMaXN0LnB1c2gobmFtZXNwYWNlTGlzdFtpXS5uYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgKCkgPT4ge1xuXHRcdFx0XHQkc2NvcGUubmFtZXNwYWNlTGlzdCA9IFtdO1xuXHRcdFx0fSkuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdCRzY29wZS5pc1dhaXRpbmdOYW1lc3BhY2UgPSBmYWxzZTtcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0JHNjb3BlLmFkZE5hbWVzcGFjZSA9ICgpID0+IHtcblx0XHRcdCRzY29wZS5pc0xvYWRpbmdOYW1lc3BhY2UgPSB0cnVlO1xuXHRcdFx0bGV0IG5hbWVzcGFjZSA9ICRzY29wZS5uYW1lc3BhY2VUeHQubmFtZXNwYWNlO1xuXHRcdFx0aWYgKCFuYW1lc3BhY2UpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0Zm9yIChsZXQgaSA9IDAsIGwgPSAkc2NvcGUubmFtZXNwYWNlTGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHRcdFx0aWYgKCRzY29wZS5uYW1lc3BhY2VMaXN0W2ldID09PSBuYW1lc3BhY2UpIHtcblx0XHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5bey5a2Y5Zyo77yBJyk7XG5cdFx0XHRcdFx0JHNjb3BlLmlzTG9hZGluZ05hbWVzcGFjZSA9IGZhbHNlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0bm9kZVNlcnZpY2Uuc2V0TmFtZXNwYWNlKGNsdXN0ZXJJZCwgW25hbWVzcGFjZV0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHQkc2NvcGUubmFtZXNwYWNlTGlzdC5wdXNoKG5hbWVzcGFjZSk7XG5cdFx0XHRcdCRzY29wZS5uYW1lc3BhY2VUeHQubmFtZXNwYWNlID0gJyc7XG5cdFx0XHR9LCAoKSA9PiB7XG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfmt7vliqDlpLHotKXvvIEnKTtcblx0XHRcdH0pLmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHQkc2NvcGUuaXNMb2FkaW5nTmFtZXNwYWNlID0gZmFsc2U7XG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdCRzY29wZS5jaGVja0VkaXQgPSAoKSA9PiB7XG5cdFx0XHQkc2NvcGUuaXNFZGl0ID0gISRzY29wZS5pc0VkaXQ7XG5cdFx0XHRpZiAoISRzY29wZS5pc0VkaXQpIHtcblx0XHRcdFx0JHNjb3BlLnZhbGlkLm5lZWRWYWxpZCA9IGZhbHNlO1xuXHRcdFx0XHQkc2NvcGUuY2x1c3Rlcklucy5jb25maWcgPSBhbmd1bGFyLmNvcHkoY2x1c3RlckNvbmZpZyk7XG5cdFx0XHRcdCRzY29wZS5jb25maWcgPSAkc2NvcGUuY2x1c3Rlcklucy5jb25maWc7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHQkc2NvcGUuZGVsZXRlQ2x1c3RlciA9ICgpID0+IHtcblx0XHRcdG5vZGVTZXJ2aWNlLmRlbGV0ZURhdGEoY2x1c3RlcklkKS50aGVuKCgpID0+IHtcblx0XHRcdFx0JHN0YXRlLmdvKCdjbHVzdGVyTWFuYWdlJyk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdCRzY29wZS5tb2RpZnlDbHVzdGVyID0gKCkgPT4ge1xuXHRcdFx0bGV0IHZhbGlkRXRjZCA9ICRzY29wZS5jbHVzdGVySW5zLnZhbGlkSXRlbSgnZXRjZCcpLFxuXHRcdFx0XHR2YWxpZEthZmthID0gJHNjb3BlLmNsdXN0ZXJJbnMudmFsaWRJdGVtKCdrYWZrYScpLFxuXHRcdFx0XHR2YWxpZFpvb2tlZXBlciA9ICRzY29wZS5jbHVzdGVySW5zLnZhbGlkSXRlbSgnem9va2VlcGVyJyk7XG5cdFx0XHRpZiAoIXZhbGlkRXRjZCB8fCAhdmFsaWRLYWZrYSB8fCAhdmFsaWRab29rZWVwZXIpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0JHNjb3BlLmlzV2FpdGluZ01vZGlmeSA9IHRydWU7XG5cdFx0XHQkc2NvcGUudmFsaWQubmVlZFZhbGlkID0gZmFsc2U7XG5cdFx0XHQkc2NvcGUuY2x1c3Rlcklucy5tb2RpZnkoKS50aGVuKCgpID0+IHtcblx0XHRcdFx0JGRvbWVQdWJsaWMub3BlblByb21wdCgn5L+u5pS55oiQ5Yqf77yBJyk7XG5cdFx0XHRcdGluaXQoKTtcblx0XHRcdFx0JHNjb3BlLmNoZWNrRWRpdCgpO1xuXHRcdFx0fSwgKHJlcykgPT4ge1xuXHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG5cdFx0XHRcdFx0dGl0bGU6ICfkv67mlLnlpLHotKXvvIEnLFxuXHRcdFx0XHRcdG1zZzogJ01lc3NhZ2U6JyArIHJlcy5kYXRhLnJlc3VsdE1zZ1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pLmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHQkc2NvcGUuaXNXYWl0aW5nTW9kaWZ5ID0gZmFsc2U7XG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdCRzY29wZS5hZGRMYWJlbHMgPSAoKSA9PiB7XG5cdFx0XHRsZXQgbm9kZUxpc3QgPSBbXTtcblx0XHRcdGZvciAobGV0IG5vZGUgb2YgJHNjb3BlLm5vZGVMaXN0SW5zLm5vZGVMaXN0KSB7XG5cdFx0XHRcdGlmIChub2RlLmlzU2VsZWN0ZWQpIHtcblx0XHRcdFx0XHRub2RlTGlzdC5wdXNoKHtcblx0XHRcdFx0XHRcdG5vZGU6IG5vZGUubmFtZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAobm9kZUxpc3QubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfor7foh7PlsJHpgInmi6nkuIDlj7DkuLvmnLrvvIEnKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0JG1vZGFsLm9wZW4oe1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FkZExhYmVsTW9kYWwuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdBZGRMYWJlbE1vZGFsQ3RyJyxcblx0XHRcdFx0c2l6ZTogJ21kJyxcblx0XHRcdFx0cmVzb2x2ZToge1xuXHRcdFx0XHRcdGNsdXN0ZXJJZDogKCkgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGNsdXN0ZXJJZDtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG5vZGVMaXN0OiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbm9kZUxpc3Q7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdCRzY29wZS50b2dnbGVOb2RlTGFiZWwgPSAobm9kZSkgPT4ge1xuXHRcdFx0bm9kZS5pc1VzZWRCeUJ1aWxkID0gIW5vZGUuaXNVc2VkQnlCdWlsZDtcblx0XHRcdGxldCBpc09ubHkgPSBmYWxzZTtcblx0XHRcdGlmICghbm9kZS5pc1VzZWRCeUJ1aWxkKSB7XG5cdFx0XHRcdGlzT25seSA9IHRydWU7XG5cdFx0XHRcdGZvciAobGV0IG5vZGUgb2YgJHNjb3BlLm5vZGVMaXN0SW5zLm5vZGVMaXN0KSB7XG5cdFx0XHRcdFx0aWYgKG5vZGUuaXNVc2VkQnlCdWlsZCkge1xuXHRcdFx0XHRcdFx0aXNPbmx5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChpc09ubHkpIHtcblx0XHRcdFx0JGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+ivt+S/neivgembhue+pOWGheiHs+WwkeacieS4gOWPsOeUqOS6juaehOW7uueahOS4u+acuu+8gScpO1xuXHRcdFx0XHRub2RlLmlzVXNlZEJ5QnVpbGQgPSAhbm9kZS5pc1VzZWRCeUJ1aWxkO1xuXHRcdFx0fVxuXHRcdFx0bGV0IGxhYmVsc0luZm8gPSBbe1xuXHRcdFx0XHRub2RlOiBub2RlLm5hbWUsXG5cdFx0XHRcdGxhYmVsczoge1xuXHRcdFx0XHRcdCdCVUlMREVOVic6ICdIT1NURU5WVFlQRSdcblx0XHRcdFx0fVxuXHRcdFx0fV07XG5cdFx0XHRpZiAobm9kZS5pc1VzZWRCeUJ1aWxkKSB7XG5cdFx0XHRcdG5vZGVTZXJ2aWNlLmFkZExhYmVsKGNsdXN0ZXJJZCwgbGFiZWxzSW5mbykuY2F0Y2goKHJlcykgPT4ge1xuXHRcdFx0XHRcdG5vZGUuaXNVc2VkQnlCdWlsZCA9ICFub2RlLmlzVXNlZEJ5QnVpbGQ7XG5cdFx0XHRcdFx0JGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xuXHRcdFx0XHRcdFx0dGl0bGU6ICfkv67mlLnlpLHotKXvvIEnLFxuXHRcdFx0XHRcdFx0bXNnOiAnTWVzc2FnZTonICsgcmVzLmRhdGEucmVzdWx0TXNnXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bm9kZVNlcnZpY2UuZGVsZXRlTGFiZWwoY2x1c3RlcklkLCBsYWJlbHNJbmZvKS5jYXRjaCgocmVzKSA9PiB7XG5cdFx0XHRcdFx0bm9kZS5pc1VzZWRCeUJ1aWxkID0gIW5vZGUuaXNVc2VkQnlCdWlsZDtcblx0XHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG5cdFx0XHRcdFx0XHR0aXRsZTogJ+S/ruaUueWksei0pe+8gScsXG5cdFx0XHRcdFx0XHRtc2c6ICdNZXNzYWdlOicgKyByZXMuZGF0YS5yZXN1bHRNc2dcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGxldCBzdGF0ZUluZm8gPSAkc3RhdGUuJGN1cnJlbnQubmFtZTtcblx0XHRpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ2luZm8nKSAhPT0gLTEpIHtcblx0XHRcdCRzY29wZS50YWJBY3RpdmVbMV0uYWN0aXZlID0gdHJ1ZTtcblx0XHR9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCduYW1lc3BhY2UnKSAhPT0gLTEpIHtcblx0XHRcdCRzY29wZS50YWJBY3RpdmVbMl0uYWN0aXZlID0gdHJ1ZTtcblx0XHRcdCRzY29wZS5nZXROYW1lc3BhY2UoKTtcblx0XHR9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCd1c2VycycpICE9PSAtMSkge1xuXHRcdFx0JHNjb3BlLnRhYkFjdGl2ZVszXS5hY3RpdmUgPSB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkc2NvcGUudGFiQWN0aXZlWzBdLmFjdGl2ZSA9IHRydWU7XG5cdFx0fVxuXG5cblx0XHQkc2NvcGUuJG9uKCdtZW1iZXJQZXJtaXNzb24nLCBmdW5jdGlvbiAoZXZlbnQsIGhhc1Blcm1pc3Nvbikge1xuXHRcdFx0JHNjb3BlLmhhc01lbWJlclBlcm1pc3NvbiA9IGhhc1Blcm1pc3Nvbjtcblx0XHRcdGlmICghaGFzUGVybWlzc29uICYmIHN0YXRlSW5mby5pbmRleE9mKCd1c2VycycpICE9PSAtMSkge1xuXHRcdFx0XHQkc3RhdGUuZ28oJ2NsdXN0ZXJEZXRhaWwuaG9zdGxpc3QnKTtcblx0XHRcdFx0JHNjb3BlLnRhYkFjdGl2ZVswXS5hY3RpdmUgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XSkuY29udHJvbGxlcignQWRkTGFiZWxNb2RhbEN0cicsIFsnJHNjb3BlJywgJ2NsdXN0ZXJJZCcsICdub2RlTGlzdCcsICckbW9kYWxJbnN0YW5jZScsICckZG9tZVB1YmxpYycsICckZG9tZUNsdXN0ZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBjbHVzdGVySWQsIG5vZGVMaXN0LCAkbW9kYWxJbnN0YW5jZSwgJGRvbWVQdWJsaWMsICRkb21lQ2x1c3Rlcikge1xuXHRcdGNvbnNvbGUubG9nKG5vZGVMaXN0KTtcblx0XHQkc2NvcGUubGFiZWxMaXN0ID0gW107XG5cdFx0JHNjb3BlLm5ld0xhYmVsID0gJyc7XG5cdFx0bGV0IG5vZGVTZXJ2aWNlID0gJGRvbWVDbHVzdGVyLmdldEluc3RhbmNlKCdOb2RlU2VydmljZScpO1xuXHRcdCRzY29wZS5hZGRMYWJlbCA9ICgpID0+IHtcblx0XHRcdGZvciAobGV0IGxhYmVsIG9mICRzY29wZS5sYWJlbExpc3QpIHtcblx0XHRcdFx0aWYgKGxhYmVsID09PSAkc2NvcGUubmV3TGFiZWwpIHtcblx0XHRcdFx0XHQkc2NvcGUubmV3TGFiZWwgPSAnJztcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdCRzY29wZS5sYWJlbExpc3QucHVzaCgkc2NvcGUubmV3TGFiZWwpO1xuXHRcdFx0JHNjb3BlLm5ld0xhYmVsID0gJyc7XG5cdFx0fTtcblx0XHQkc2NvcGUuZGVsZXRlTGFiZWwgPSAoaW5kZXgpID0+IHtcblx0XHRcdCRzY29wZS5sYWJlbExpc3Quc3BsaWNlKGluZGV4LCAxKTtcblx0XHR9O1xuXHRcdCRzY29wZS5zdWJtaXRMYWJlbHMgPSAoKSA9PiB7XG5cdFx0XHRpZiAoJHNjb3BlLmxhYmVsTGlzdC5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0JGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+aCqOWwmuacqua3u+WKoOagh+etvu+8gScpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRsZXQgbGFiZWxzID0ge307XG5cdFx0XHRmb3IgKGxldCBsYWJlbCBvZiAkc2NvcGUubGFiZWxMaXN0KSB7XG5cdFx0XHRcdGxhYmVsc1tsYWJlbF0gPSAnVVNFUl9MQUJFTF9WQUxVRSc7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGxldCBub2RlIG9mIG5vZGVMaXN0KSB7XG5cdFx0XHRcdG5vZGUubGFiZWxzID0gbGFiZWxzO1xuXHRcdFx0fVxuXHRcdFx0bm9kZVNlcnZpY2UuYWRkTGFiZWwoY2x1c3RlcklkLCBub2RlTGlzdCkudGhlbigoKSA9PiB7XG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+a3u+WKoOaIkOWKn++8gScpO1xuXHRcdFx0XHQkbW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuXHRcdFx0fSwgKHJlcykgPT4ge1xuXHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG5cdFx0XHRcdFx0dGl0bGU6ICfmt7vliqDlpLHotKXvvIEnLFxuXHRcdFx0XHRcdG1zZzogJ01lc3NhZ2U6JyArIHJlcy5kYXRhLnJlc3VsdE1zZ1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0JHNjb3BlLmNhbmNlbCA9ICgpID0+IHtcblx0XHRcdCRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcblx0XHR9O1xuXHR9XSk7XG59KSh3aW5kb3cuZG9tZUFwcCk7Il19
