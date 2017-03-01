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
            nodeService = $domeCluster.getInstance('NodeService'),
            clusterService = $domeCluster.getInstance('ClusterService');
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
            if ($scope.mayEditCluster()) {
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
        $scope.exitToList = function () {
            $state.go('clusterManage');
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
        } else if (stateInfo.indexOf('instances') !== -1) {
            $scope.tabActive[4].active = true;
        } else {
            $scope.tabActive[0].active = true;
        }
        $scope.showColumn = {
            hostName: true,
            podIp: true,
            status: true,
            deployName: true,
            deployVersion: false,
            namespace: false,
            startTime: false,
            containerId: false,
            imageName: false
        };
        $scope.hideColumn = [{ name: '主机名称', key: 'hostName' }, { name: '实例IP', key: 'podIp' }, { name: '实例状态', key: 'status' }, { name: '部署名称', key: 'deployName' }, { name: '部署版本', key: 'deployVersion' }, { name: 'namespace', key: 'namespace' }, { name: '启动时间', key: 'startTime' }, { name: '容器ID', key: 'containerId' }, { name: '镜像名称', key: 'imageName' }];
        var getInstances = function getInstances() {
            $scope.isWaitingInstances = true;
            clusterService.getInstancesList(_clusterId).then(function (res) {
                $scope.instanceList = res.data.result || [];
            }).finally(function () {
                $scope.isWaitingInstances = false;
            });
        };
        getInstances();
        $scope.showLog = function (instanceName, containers, namespace) {
            $modal.open({
                templateUrl: 'index/tpl/modal/instanceLogModal/instanceLogModal.html',
                controller: 'InstanceLogModalCtr',
                size: 'md',
                resolve: {
                    instanceInfo: function instanceInfo() {
                        return {
                            clusterId: _clusterId,
                            namespace: namespace,
                            instanceName: instanceName,
                            containers: containers
                        };
                    }
                }
            });
        };
        $scope.toConsole = function (containers, hostIp) {
            $modal.open({
                templateUrl: 'index/tpl/modal/selectContainerModal/selectContainerModal.html',
                controller: 'SelectContainerModalCtr',
                size: 'md',
                resolve: {
                    info: function info() {
                        return {
                            containerList: containers,
                            hostIp: hostIp,
                            resourceId: _clusterId,
                            type: 'CLUSTER'
                        };
                    }
                }
            });
        };
        // 登录用户角色权限
        $scope.userRole = null;
        $scope.setRole = function (role) {
            $scope.userRole = role;
        };
        $scope.mayEditCluster = function () {
            return $scope.userRole === 'MASTER' || $scope.userRole === 'DEVELOPER';
        };
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L3RwbC9jbHVzdGVyRGV0YWlsL2NsdXN0ZXJEZXRhaWxDdHIuZXMiXSwibmFtZXMiOlsiZG9tZUFwcCIsInVuZGVmaW5lZCIsImNvbnRyb2xsZXIiLCIkc2NvcGUiLCIkZG9tZUNsdXN0ZXIiLCIkc3RhdGVQYXJhbXMiLCIkc3RhdGUiLCIkZG9tZVB1YmxpYyIsIiRkb21lTW9kZWwiLCIkbW9kYWwiLCJpZCIsImdvIiwiY2x1c3RlcklkIiwibm9kZVNlcnZpY2UiLCJnZXRJbnN0YW5jZSIsImNsdXN0ZXJTZXJ2aWNlIiwiY2x1c3RlckNvbmZpZyIsIm5vZGVMaXN0SW5zIiwiU2VsZWN0TGlzdE1vZGVsIiwicmVzb3VyY2VUeXBlIiwicmVzb3VyY2VJZCIsImlzV2FpdGluZ0hvc3QiLCJpc1dhaXRpbmdOYW1lc3BhY2UiLCJpc1dhaXRpbmdNb2RpZnkiLCJ2YWxpZCIsIm5lZWRWYWxpZCIsIm5hbWVzcGFjZVR4dCIsIm5hbWVzcGFjZSIsImlzRWRpdCIsInRhYkFjdGl2ZSIsImFjdGl2ZSIsImdldE5vZGVMaXN0IiwidGhlbiIsInJlcyIsIm5vZGVMaXN0IiwiZGF0YSIsInJlc3VsdCIsIm5vZGUiLCJjYXBhY2l0eSIsIm1lbW9yeSIsInRvRml4ZWQiLCJsYWJlbHMiLCJpc1VzZWRCeUJ1aWxkIiwiQlVJTERFTlYiLCJpbml0IiwiZmluYWxseSIsImdldERhdGEiLCJjbHVzdGVySW5zIiwiYW5ndWxhciIsImNvcHkiLCJjb25maWciLCJidWlsZENvbmZpZyIsIiRlbWl0IiwidGl0bGUiLCJuYW1lIiwiZGVzY3JpdGlvbiIsIm1vZCIsImNsdXN0ZXJMaXN0IiwiaSIsImxlbmd0aCIsInNwbGljZSIsIm9wZW5XYXJuaW5nIiwiZ2V0TmFtZXNwYWNlIiwibmFtZXNwYWNlTGlzdCIsImwiLCJwdXNoIiwiYWRkSG9zdCIsIm1heUVkaXRDbHVzdGVyIiwiYWRkTmFtZXNwYWNlIiwiaXNMb2FkaW5nTmFtZXNwYWNlIiwic2V0TmFtZXNwYWNlIiwiY2hlY2tFZGl0IiwiZGVsZXRlQ2x1c3RlciIsImRlbGV0ZURhdGEiLCJleGl0VG9MaXN0IiwibW9kaWZ5Q2x1c3RlciIsInZhbGlkRXRjZCIsInZhbGlkSXRlbSIsInZhbGlkS2Fma2EiLCJ2YWxpZFpvb2tlZXBlciIsIm1vZGlmeSIsIm9wZW5Qcm9tcHQiLCJtc2ciLCJyZXN1bHRNc2ciLCJhZGRMYWJlbHMiLCJpc1NlbGVjdGVkIiwib3BlbiIsInRlbXBsYXRlVXJsIiwic2l6ZSIsInJlc29sdmUiLCJ0b2dnbGVOb2RlTGFiZWwiLCJpc09ubHkiLCJsYWJlbHNJbmZvIiwiYWRkTGFiZWwiLCJjYXRjaCIsImRlbGV0ZUxhYmVsIiwic3RhdGVJbmZvIiwiJGN1cnJlbnQiLCJpbmRleE9mIiwic2hvd0NvbHVtbiIsImhvc3ROYW1lIiwicG9kSXAiLCJzdGF0dXMiLCJkZXBsb3lOYW1lIiwiZGVwbG95VmVyc2lvbiIsInN0YXJ0VGltZSIsImNvbnRhaW5lcklkIiwiaW1hZ2VOYW1lIiwiaGlkZUNvbHVtbiIsImtleSIsImdldEluc3RhbmNlcyIsImlzV2FpdGluZ0luc3RhbmNlcyIsImdldEluc3RhbmNlc0xpc3QiLCJpbnN0YW5jZUxpc3QiLCJzaG93TG9nIiwiaW5zdGFuY2VOYW1lIiwiY29udGFpbmVycyIsImluc3RhbmNlSW5mbyIsInRvQ29uc29sZSIsImhvc3RJcCIsImluZm8iLCJjb250YWluZXJMaXN0IiwidHlwZSIsInVzZXJSb2xlIiwic2V0Um9sZSIsInJvbGUiLCIkbW9kYWxJbnN0YW5jZSIsImxhYmVsTGlzdCIsIm5ld0xhYmVsIiwibGFiZWwiLCJpbmRleCIsInN1Ym1pdExhYmVscyIsImNsb3NlIiwiY2FuY2VsIiwiZGlzbWlzcyIsIndpbmRvdyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7O0FBR0EsQ0FBQyxVQUFVQSxPQUFWLEVBQW1CQyxTQUFuQixFQUE4QjtBQUMzQjs7QUFDQSxRQUFJLE9BQU9ELE9BQVAsS0FBbUIsV0FBdkIsRUFBb0M7QUFDcENBLFlBQVFFLFVBQVIsQ0FBbUIsa0JBQW5C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QUFNO0FBQ2pEekIsNEJBQVkwRSxVQUFaLENBQXVCLE9BQXZCO0FBQ0E2QywrQkFBZU0sS0FBZjtBQUNILGFBSEQsRUFHRyxVQUFDbkcsR0FBRCxFQUFTO0FBQ1IxQiw0QkFBWXNELFdBQVosQ0FBd0I7QUFDcEJSLDJCQUFPLE9BRGE7QUFFcEI2Qix5QkFBSyxhQUFhakQsSUFBSUUsSUFBSixDQUFTZ0Q7QUFGUCxpQkFBeEI7QUFJSCxhQVJEO0FBU0gsU0FyQkQ7QUFzQkFoRixlQUFPa0ksTUFBUCxHQUFnQixZQUFNO0FBQ2xCUCwyQkFBZVEsT0FBZjtBQUNILFNBRkQ7QUFHSCxLQTNDa0MsQ0EzVG5DO0FBdVdILENBMVdELEVBMFdHQyxPQUFPdkksT0ExV1YiLCJmaWxlIjoiaW5kZXgvdHBsL2NsdXN0ZXJEZXRhaWwvY2x1c3RlckRldGFpbEN0ci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBAYXV0aG9yIENoYW5kcmFMZWVcbiAqL1xuKGZ1bmN0aW9uIChkb21lQXBwLCB1bmRlZmluZWQpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgaWYgKHR5cGVvZiBkb21lQXBwID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xuICAgIGRvbWVBcHAuY29udHJvbGxlcignQ2x1c3RlckRldGFpbEN0cicsIFsnJHNjb3BlJywgJyRkb21lQ2x1c3RlcicsICckc3RhdGVQYXJhbXMnLCAnJHN0YXRlJywgJyRkb21lUHVibGljJywgJyRkb21lTW9kZWwnLCAnJG1vZGFsJywgZnVuY3Rpb24gKCRzY29wZSwgJGRvbWVDbHVzdGVyLCAkc3RhdGVQYXJhbXMsICRzdGF0ZSwgJGRvbWVQdWJsaWMsICRkb21lTW9kZWwsICRtb2RhbCkge1xuICAgICAgICBpZiAoISRzdGF0ZVBhcmFtcy5pZCkge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdjbHVzdGVyTWFuYWdlJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2x1c3RlcklkID0gJHNjb3BlLmNsdXN0ZXJJZCA9ICRzdGF0ZVBhcmFtcy5pZCxcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlID0gJGRvbWVDbHVzdGVyLmdldEluc3RhbmNlKCdOb2RlU2VydmljZScpLFxuICAgICAgICAgICAgY2x1c3RlclNlcnZpY2UgPSAkZG9tZUNsdXN0ZXIuZ2V0SW5zdGFuY2UoJ0NsdXN0ZXJTZXJ2aWNlJyk7XG4gICAgICAgIGxldCBjbHVzdGVyQ29uZmlnO1xuICAgICAgICAkc2NvcGUubm9kZUxpc3RJbnMgPSBuZXcgJGRvbWVNb2RlbC5TZWxlY3RMaXN0TW9kZWwoJ25vZGVMaXN0Jyk7XG4gICAgICAgICRzY29wZS5yZXNvdXJjZVR5cGUgPSAnQ0xVU1RFUic7XG4gICAgICAgICRzY29wZS5yZXNvdXJjZUlkID0gY2x1c3RlcklkO1xuICAgICAgICAkc2NvcGUuaXNXYWl0aW5nSG9zdCA9IHRydWU7XG4gICAgICAgICRzY29wZS5pc1dhaXRpbmdOYW1lc3BhY2UgPSB0cnVlO1xuICAgICAgICAkc2NvcGUuaXNXYWl0aW5nTW9kaWZ5ID0gZmFsc2U7XG4gICAgICAgICRzY29wZS52YWxpZCA9IHtcbiAgICAgICAgICAgIG5lZWRWYWxpZDogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLm5hbWVzcGFjZVR4dCA9IHtcbiAgICAgICAgICAgIG5hbWVzcGFjZTogJydcbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLmlzRWRpdCA9IGZhbHNlO1xuXG4gICAgICAgICRzY29wZS50YWJBY3RpdmUgPSBbe1xuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICAgIH1dO1xuXG4gICAgICAgIG5vZGVTZXJ2aWNlLmdldE5vZGVMaXN0KGNsdXN0ZXJJZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICBsZXQgbm9kZUxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIG5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuY2FwYWNpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5jYXBhY2l0eS5tZW1vcnkgPSAobm9kZS5jYXBhY2l0eS5tZW1vcnkgLyAxMDI0IC8gMTAyNCkudG9GaXhlZCgyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFub2RlLmxhYmVscykge1xuICAgICAgICAgICAgICAgICAgICBub2RlLmxhYmVscyA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBub2RlLmlzVXNlZEJ5QnVpbGQgPSB0eXBlb2Ygbm9kZS5sYWJlbHMuQlVJTERFTlYgIT09ICd1bmRlZmluZWQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLm5vZGVMaXN0SW5zLmluaXQobm9kZUxpc3QsIGZhbHNlKTtcbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAkc2NvcGUuaXNXYWl0aW5nSG9zdCA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGluaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXREYXRhKGNsdXN0ZXJJZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNsdXN0ZXJJbnMgPSAkZG9tZUNsdXN0ZXIuZ2V0SW5zdGFuY2UoJ0NsdXN0ZXInLCByZXMuZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgIGNsdXN0ZXJDb25maWcgPSBhbmd1bGFyLmNvcHkoJHNjb3BlLmNsdXN0ZXJJbnMuY29uZmlnKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29uZmlnID0gJHNjb3BlLmNsdXN0ZXJJbnMuY29uZmlnO1xuICAgICAgICAgICAgICAgIGlmIChjbHVzdGVyQ29uZmlnLmJ1aWxkQ29uZmlnID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kZW1pdCgncGFnZVRpdGxlJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICRzY29wZS5jb25maWcubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXRpb246ICfor6Xpm4bnvqTmmK/mnoTlu7rpm4bnvqTvvIzpnIDopoHkv53or4Hpm4bnvqTlhoXkuLvmnLrlj6/nlKjkuo7mnoTlu7rjgIInLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kOiAnY2x1c3RlcidcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRlbWl0KCdwYWdlVGl0bGUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJHNjb3BlLmNvbmZpZy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpdGlvbjogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2Q6ICdjbHVzdGVyJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0RGF0YSgpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY2x1c3Rlckxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJHNjb3BlLmNsdXN0ZXJMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmNsdXN0ZXJMaXN0W2ldLm5hbWUgPT09IGNsdXN0ZXJDb25maWcubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jbHVzdGVyTGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn6K+35rGC5aSx6LSl77yBJyk7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdjbHVzdGVyTWFuYWdlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgaW5pdCgpO1xuICAgICAgICAkc2NvcGUuZ2V0TmFtZXNwYWNlID0gKCkgPT4ge1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TmFtZXNwYWNlKGNsdXN0ZXJJZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG5hbWVzcGFjZUxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgJHNjb3BlLm5hbWVzcGFjZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IG5hbWVzcGFjZUxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5uYW1lc3BhY2VMaXN0LnB1c2gobmFtZXNwYWNlTGlzdFtpXS5uYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm5hbWVzcGFjZUxpc3QgPSBbXTtcbiAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICRzY29wZS5pc1dhaXRpbmdOYW1lc3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICAkc2NvcGUuYWRkSG9zdCA9IChjbHVzdGVySWQpID0+IHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUubWF5RWRpdENsdXN0ZXIoKSkge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnYWRkSG9zdCcsIHsnaWQnOiBjbHVzdGVySWR9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+aCqOayoeacieadg+mZkOa3u+WKoOS4u+acuicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAkc2NvcGUuYWRkTmFtZXNwYWNlID0gKCkgPT4ge1xuICAgICAgICAgICAgJHNjb3BlLmlzTG9hZGluZ05hbWVzcGFjZSA9IHRydWU7XG4gICAgICAgICAgICBsZXQgbmFtZXNwYWNlID0gJHNjb3BlLm5hbWVzcGFjZVR4dC5uYW1lc3BhY2U7XG4gICAgICAgICAgICBpZiAoIW5hbWVzcGFjZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gJHNjb3BlLm5hbWVzcGFjZUxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5uYW1lc3BhY2VMaXN0W2ldID09PSBuYW1lc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+W3suWtmOWcqO+8gScpO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuaXNMb2FkaW5nTmFtZXNwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlU2VydmljZS5zZXROYW1lc3BhY2UoY2x1c3RlcklkLCBbbmFtZXNwYWNlXSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm5hbWVzcGFjZUxpc3QucHVzaChuYW1lc3BhY2UpO1xuICAgICAgICAgICAgICAgICRzY29wZS5uYW1lc3BhY2VUeHQubmFtZXNwYWNlID0gJyc7XG4gICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+a3u+WKoOWksei0pe+8gScpO1xuICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmlzTG9hZGluZ05hbWVzcGFjZSA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS5jaGVja0VkaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAkc2NvcGUuaXNFZGl0ID0gISRzY29wZS5pc0VkaXQ7XG4gICAgICAgICAgICBpZiAoISRzY29wZS5pc0VkaXQpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUudmFsaWQubmVlZFZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNsdXN0ZXJJbnMuY29uZmlnID0gYW5ndWxhci5jb3B5KGNsdXN0ZXJDb25maWcpO1xuICAgICAgICAgICAgICAgICRzY29wZS5jb25maWcgPSAkc2NvcGUuY2x1c3Rlcklucy5jb25maWc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS5kZWxldGVDbHVzdGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZGVsZXRlRGF0YShjbHVzdGVySWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnY2x1c3Rlck1hbmFnZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS5leGl0VG9MaXN0ID0gKCkgPT4ge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdjbHVzdGVyTWFuYWdlJyk7XG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS5tb2RpZnlDbHVzdGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHZhbGlkRXRjZCA9ICRzY29wZS5jbHVzdGVySW5zLnZhbGlkSXRlbSgnZXRjZCcpLFxuICAgICAgICAgICAgICAgIHZhbGlkS2Fma2EgPSAkc2NvcGUuY2x1c3Rlcklucy52YWxpZEl0ZW0oJ2thZmthJyksXG4gICAgICAgICAgICAgICAgdmFsaWRab29rZWVwZXIgPSAkc2NvcGUuY2x1c3Rlcklucy52YWxpZEl0ZW0oJ3pvb2tlZXBlcicpO1xuICAgICAgICAgICAgaWYgKCF2YWxpZEV0Y2QgfHwgIXZhbGlkS2Fma2EgfHwgIXZhbGlkWm9va2VlcGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLmlzV2FpdGluZ01vZGlmeSA9IHRydWU7XG4gICAgICAgICAgICAkc2NvcGUudmFsaWQubmVlZFZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAkc2NvcGUuY2x1c3Rlcklucy5tb2RpZnkoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCfkv67mlLnmiJDlip/vvIEnKTtcbiAgICAgICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNoZWNrRWRpdCgpO1xuICAgICAgICAgICAgfSwgKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfkv67mlLnlpLHotKXvvIEnLFxuICAgICAgICAgICAgICAgICAgICBtc2c6ICdNZXNzYWdlOicgKyByZXMuZGF0YS5yZXN1bHRNc2dcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICRzY29wZS5pc1dhaXRpbmdNb2RpZnkgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICAkc2NvcGUuYWRkTGFiZWxzID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IG5vZGVMaXN0ID0gW107XG4gICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mICRzY29wZS5ub2RlTGlzdElucy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZUxpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlOiBub2RlLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vZGVMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfor7foh7PlsJHpgInmi6nkuIDlj7DkuLvmnLrvvIEnKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhZGRMYWJlbE1vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBZGRMYWJlbE1vZGFsQ3RyJyxcbiAgICAgICAgICAgICAgICBzaXplOiAnbWQnLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlcklkOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2x1c3RlcklkO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBub2RlTGlzdDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVMaXN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS50b2dnbGVOb2RlTGFiZWwgPSAobm9kZSkgPT4ge1xuICAgICAgICAgICAgbm9kZS5pc1VzZWRCeUJ1aWxkID0gIW5vZGUuaXNVc2VkQnlCdWlsZDtcbiAgICAgICAgICAgIGxldCBpc09ubHkgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICghbm9kZS5pc1VzZWRCeUJ1aWxkKSB7XG4gICAgICAgICAgICAgICAgaXNPbmx5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mICRzY29wZS5ub2RlTGlzdElucy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pc1VzZWRCeUJ1aWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc09ubHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzT25seSkge1xuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfor7fkv53or4Hpm4bnvqTlhoXoh7PlsJHmnInkuIDlj7DnlKjkuo7mnoTlu7rnmoTkuLvmnLrvvIEnKTtcbiAgICAgICAgICAgICAgICBub2RlLmlzVXNlZEJ5QnVpbGQgPSAhbm9kZS5pc1VzZWRCeUJ1aWxkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGxhYmVsc0luZm8gPSBbe1xuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUubmFtZSxcbiAgICAgICAgICAgICAgICBsYWJlbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0JVSUxERU5WJzogJ0hPU1RFTlZUWVBFJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgaWYgKG5vZGUuaXNVc2VkQnlCdWlsZCkge1xuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmFkZExhYmVsKGNsdXN0ZXJJZCwgbGFiZWxzSW5mbykuY2F0Y2goKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBub2RlLmlzVXNlZEJ5QnVpbGQgPSAhbm9kZS5pc1VzZWRCeUJ1aWxkO1xuICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+S/ruaUueWksei0pe+8gScsXG4gICAgICAgICAgICAgICAgICAgICAgICBtc2c6ICdNZXNzYWdlOicgKyByZXMuZGF0YS5yZXN1bHRNc2dcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmRlbGV0ZUxhYmVsKGNsdXN0ZXJJZCwgbGFiZWxzSW5mbykuY2F0Y2goKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBub2RlLmlzVXNlZEJ5QnVpbGQgPSAhbm9kZS5pc1VzZWRCeUJ1aWxkO1xuICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+S/ruaUueWksei0pe+8gScsXG4gICAgICAgICAgICAgICAgICAgICAgICBtc2c6ICdNZXNzYWdlOicgKyByZXMuZGF0YS5yZXN1bHRNc2dcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHN0YXRlSW5mbyA9ICRzdGF0ZS4kY3VycmVudC5uYW1lO1xuICAgICAgICBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ2luZm8nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICRzY29wZS50YWJBY3RpdmVbMV0uYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZUluZm8uaW5kZXhPZignbmFtZXNwYWNlJykgIT09IC0xKSB7XG4gICAgICAgICAgICAkc2NvcGUudGFiQWN0aXZlWzJdLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAkc2NvcGUuZ2V0TmFtZXNwYWNlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ3VzZXJzJykgIT09IC0xKSB7XG4gICAgICAgICAgICAkc2NvcGUudGFiQWN0aXZlWzNdLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ2luc3RhbmNlcycpICE9PSAtMSkge1xuICAgICAgICAgICAgJHNjb3BlLnRhYkFjdGl2ZVs0XS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLnRhYkFjdGl2ZVswXS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgICRzY29wZS5zaG93Q29sdW1uID0ge1xuICAgICAgICAgICAgaG9zdE5hbWU6IHRydWUsXG4gICAgICAgICAgICBwb2RJcDogdHJ1ZSxcbiAgICAgICAgICAgIHN0YXR1czogdHJ1ZSxcbiAgICAgICAgICAgIGRlcGxveU5hbWU6IHRydWUsXG4gICAgICAgICAgICBkZXBsb3lWZXJzaW9uOiBmYWxzZSxcbiAgICAgICAgICAgIG5hbWVzcGFjZTogZmFsc2UsXG4gICAgICAgICAgICBzdGFydFRpbWU6IGZhbHNlLFxuICAgICAgICAgICAgY29udGFpbmVySWQ6IGZhbHNlLFxuICAgICAgICAgICAgaW1hZ2VOYW1lOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLmhpZGVDb2x1bW4gPSBbXG4gICAgICAgICAgICB7bmFtZTogJ+S4u+acuuWQjeensCcsIGtleTogJ2hvc3ROYW1lJ30sXG4gICAgICAgICAgICB7bmFtZTogJ+WunuS+i0lQJywga2V5OiAncG9kSXAnfSxcbiAgICAgICAgICAgIHtuYW1lOiAn5a6e5L6L54q25oCBJywga2V5OiAnc3RhdHVzJ30sXG4gICAgICAgICAgICB7bmFtZTogJ+mDqOe9suWQjeensCcsIGtleTogJ2RlcGxveU5hbWUnfSxcbiAgICAgICAgICAgIHtuYW1lOiAn6YOo572y54mI5pysJywga2V5OiAnZGVwbG95VmVyc2lvbid9LFxuICAgICAgICAgICAge25hbWU6ICduYW1lc3BhY2UnLCBrZXk6ICduYW1lc3BhY2UnfSxcbiAgICAgICAgICAgIHtuYW1lOiAn5ZCv5Yqo5pe26Ze0Jywga2V5OiAnc3RhcnRUaW1lJ30sXG4gICAgICAgICAgICB7bmFtZTogJ+WuueWZqElEJywga2V5OiAnY29udGFpbmVySWQnfSxcbiAgICAgICAgICAgIHtuYW1lOiAn6ZWc5YOP5ZCN56ewJywga2V5OiAnaW1hZ2VOYW1lJ31cbiAgICAgICAgXTtcbiAgICAgICAgY29uc3QgZ2V0SW5zdGFuY2VzID0gKCkgPT4ge1xuICAgICAgICAgICAgJHNjb3BlLmlzV2FpdGluZ0luc3RhbmNlcyA9IHRydWU7XG4gICAgICAgICAgICBjbHVzdGVyU2VydmljZS5nZXRJbnN0YW5jZXNMaXN0KGNsdXN0ZXJJZCkudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgICAgICRzY29wZS5pbnN0YW5jZUxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuaXNXYWl0aW5nSW5zdGFuY2VzID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgZ2V0SW5zdGFuY2VzKCk7XG4gICAgICAgICRzY29wZS5zaG93TG9nID0gZnVuY3Rpb24gKGluc3RhbmNlTmFtZSwgY29udGFpbmVycywgbmFtZXNwYWNlKSB7XG4gICAgICAgICAgICAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRleC90cGwvbW9kYWwvaW5zdGFuY2VMb2dNb2RhbC9pbnN0YW5jZUxvZ01vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdJbnN0YW5jZUxvZ01vZGFsQ3RyJyxcbiAgICAgICAgICAgICAgICBzaXplOiAnbWQnLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJbmZvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJJZDogY2x1c3RlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogbmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlTmFtZTogaW5zdGFuY2VOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcnM6IGNvbnRhaW5lcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLnRvQ29uc29sZSA9IGZ1bmN0aW9uIChjb250YWluZXJzLCBob3N0SXApIHtcbiAgICAgICAgICAgICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGV4L3RwbC9tb2RhbC9zZWxlY3RDb250YWluZXJNb2RhbC9zZWxlY3RDb250YWluZXJNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU2VsZWN0Q29udGFpbmVyTW9kYWxDdHInLFxuICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICBpbmZvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckxpc3Q6IGNvbnRhaW5lcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdElwOiBob3N0SXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VJZDogY2x1c3RlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdDTFVTVEVSJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8g55m75b2V55So5oi36KeS6Imy5p2D6ZmQXG4gICAgICAgICRzY29wZS51c2VyUm9sZSA9IG51bGw7XG4gICAgICAgICRzY29wZS5zZXRSb2xlID0gZnVuY3Rpb24gKHJvbGUpIHtcbiAgICAgICAgICAgICRzY29wZS51c2VyUm9sZSA9IHJvbGU7XG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS5tYXlFZGl0Q2x1c3RlciA9ICgpID0+ICRzY29wZS51c2VyUm9sZSA9PT0gJ01BU1RFUicgfHwgJHNjb3BlLnVzZXJSb2xlID09PSAnREVWRUxPUEVSJztcblxuICAgIH1dKS5jb250cm9sbGVyKCdBZGRMYWJlbE1vZGFsQ3RyJywgWyckc2NvcGUnLCAnY2x1c3RlcklkJywgJ25vZGVMaXN0JywgJyRtb2RhbEluc3RhbmNlJywgJyRkb21lUHVibGljJywgJyRkb21lQ2x1c3RlcicsIGZ1bmN0aW9uICgkc2NvcGUsIGNsdXN0ZXJJZCwgbm9kZUxpc3QsICRtb2RhbEluc3RhbmNlLCAkZG9tZVB1YmxpYywgJGRvbWVDbHVzdGVyKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2cobm9kZUxpc3QpO1xuICAgICAgICAkc2NvcGUubGFiZWxMaXN0ID0gW107XG4gICAgICAgICRzY29wZS5uZXdMYWJlbCA9ICcnO1xuICAgICAgICBsZXQgbm9kZVNlcnZpY2UgPSAkZG9tZUNsdXN0ZXIuZ2V0SW5zdGFuY2UoJ05vZGVTZXJ2aWNlJyk7XG4gICAgICAgICRzY29wZS5hZGRMYWJlbCA9ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGxhYmVsIG9mICRzY29wZS5sYWJlbExpc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAobGFiZWwgPT09ICRzY29wZS5uZXdMYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubmV3TGFiZWwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS5sYWJlbExpc3QucHVzaCgkc2NvcGUubmV3TGFiZWwpO1xuICAgICAgICAgICAgJHNjb3BlLm5ld0xhYmVsID0gJyc7XG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS5kZWxldGVMYWJlbCA9IChpbmRleCkgPT4ge1xuICAgICAgICAgICAgJHNjb3BlLmxhYmVsTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9O1xuICAgICAgICAkc2NvcGUuc3VibWl0TGFiZWxzID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5sYWJlbExpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+aCqOWwmuacqua3u+WKoOagh+etvu+8gScpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBsYWJlbHMgPSB7fTtcbiAgICAgICAgICAgIGZvciAobGV0IGxhYmVsIG9mICRzY29wZS5sYWJlbExpc3QpIHtcbiAgICAgICAgICAgICAgICBsYWJlbHNbbGFiZWxdID0gJ1VTRVJfTEFCRUxfVkFMVUUnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgIG5vZGUubGFiZWxzID0gbGFiZWxzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuYWRkTGFiZWwoY2x1c3RlcklkLCBub2RlTGlzdCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5re75Yqg5oiQ5Yqf77yBJyk7XG4gICAgICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgICAgICAgIH0sIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5re75Yqg5aSx6LSl77yBJyxcbiAgICAgICAgICAgICAgICAgICAgbXNnOiAnTWVzc2FnZTonICsgcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9ICgpID0+IHtcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICAgICAgfTtcbiAgICB9XSk7XG59KSh3aW5kb3cuZG9tZUFwcCk7XG4iXX0=
