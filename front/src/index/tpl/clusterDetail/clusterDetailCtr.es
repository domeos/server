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
        const clusterId = $scope.clusterId = $stateParams.id,
            nodeService = $domeCluster.getInstance('NodeService'),
            clusterService = $domeCluster.getInstance('ClusterService');
        let clusterConfig;
        $scope.nodeListIns = new $domeModel.SelectListModel('nodeList');
        $scope.resourceType = 'CLUSTER';
        $scope.resourceId = clusterId;
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

        nodeService.getNodeList(clusterId).then((res) => {
            let nodeList = res.data.result || [];
            for (let node of nodeList) {
                if (node.capacity) {
                    node.capacity.memory = (node.capacity.memory / 1024 / 1024).toFixed(2);
                }
                if (!node.labels) {
                    node.labels = {};
                }
                node.isUsedByBuild = typeof node.labels.BUILDENV !== 'undefined';
            }
            $scope.nodeListIns.init(nodeList, false);
        }).finally(() => {
            $scope.isWaitingHost = false;
        });
        var init = () => {
            nodeService.getData(clusterId).then((res) => {
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
                nodeService.getData().then((res) => {
                    $scope.clusterList = res.data.result || [];
                    for (var i = 0; i < $scope.clusterList.length; i++) {
                        if ($scope.clusterList[i].name === clusterConfig.name) {
                            $scope.clusterList.splice(i, 1);
                            break;
                        }
                    }
                });
            }, () => {
                $domePublic.openWarning('请求失败！');
                $state.go('clusterManage');
            });
        };
        init();
        $scope.getNamespace = () => {
            nodeService.getNamespace(clusterId).then((res) => {
                let namespaceList = res.data.result || [];
                $scope.namespaceList = [];
                for (let i = 0, l = namespaceList.length; i < l; i++) {
                    $scope.namespaceList.push(namespaceList[i].name);
                }
            }, () => {
                $scope.namespaceList = [];
            }).finally(() => {
                $scope.isWaitingNamespace = false;
            });
        };
        $scope.addHost = (clusterId) => {
            if ($scope.mayEditCluster()) {
                $state.go('addHost', {'id': clusterId});
            } else {
                $domePublic.openWarning('您没有权限添加主机');
            }
        };
        $scope.addNamespace = () => {
            $scope.isLoadingNamespace = true;
            let namespace = $scope.namespaceTxt.namespace;
            if (!namespace) {
                return;
            }
            for (let i = 0, l = $scope.namespaceList.length; i < l; i++) {
                if ($scope.namespaceList[i] === namespace) {
                    $domePublic.openWarning('已存在！');
                    $scope.isLoadingNamespace = false;
                    return;
                }
            }
            nodeService.setNamespace(clusterId, [namespace]).then(() => {
                $scope.namespaceList.push(namespace);
                $scope.namespaceTxt.namespace = '';
            }, () => {
                $domePublic.openWarning('添加失败！');
            }).finally(() => {
                $scope.isLoadingNamespace = false;
            });
        };
        $scope.checkEdit = () => {
            $scope.isEdit = !$scope.isEdit;
            if (!$scope.isEdit) {
                $scope.valid.needValid = false;
                $scope.clusterIns.config = angular.copy(clusterConfig);
                $scope.config = $scope.clusterIns.config;
            }
        };
        $scope.deleteCluster = () => {
            nodeService.deleteData(clusterId).then(() => {
                $state.go('clusterManage');
            });
        };
        $scope.exitToList = () => {
            $state.go('clusterManage');
        };
        $scope.modifyCluster = () => {
            let validEtcd = $scope.clusterIns.validItem('etcd'),
                validKafka = $scope.clusterIns.validItem('kafka'),
                validZookeeper = $scope.clusterIns.validItem('zookeeper');
            if (!validEtcd || !validKafka || !validZookeeper) {
                return;
            }
            $scope.isWaitingModify = true;
            $scope.valid.needValid = false;
            $scope.clusterIns.modify().then(() => {
                $domePublic.openPrompt('修改成功！');
                init();
                $scope.checkEdit();
            }, (res) => {
                $domePublic.openWarning({
                    title: '修改失败！',
                    msg: 'Message:' + res.data.resultMsg
                });
            }).finally(() => {
                $scope.isWaitingModify = false;
            });
        };
        $scope.addLabels = () => {
            let nodeList = [];
            for (let node of $scope.nodeListIns.nodeList) {
                if (node.isSelected) {
                    nodeList.push({
                        node: node.name
                    });
                }
            }
            if (nodeList.length === 0) {
                $domePublic.openWarning('请至少选择一台主机！');
                return;
            }
            $modal.open({
                templateUrl: 'addLabelModal.html',
                controller: 'AddLabelModalCtr',
                size: 'md',
                resolve: {
                    clusterId: () => {
                        return clusterId;
                    },
                    nodeList: () => {
                        return nodeList;
                    }
                }
            });
        };
        $scope.toggleNodeLabel = (node) => {
            node.isUsedByBuild = !node.isUsedByBuild;
            let isOnly = false;
            if (!node.isUsedByBuild) {
                isOnly = true;
                for (let node of $scope.nodeListIns.nodeList) {
                    if (node.isUsedByBuild) {
                        isOnly = false;
                        break;
                    }
                }
            }
            if (isOnly) {
                $domePublic.openWarning('请保证集群内至少有一台用于构建的主机！');
                node.isUsedByBuild = !node.isUsedByBuild;
            }
            let labelsInfo = [{
                node: node.name,
                labels: {
                    'BUILDENV': 'HOSTENVTYPE'
                }
            }];
            if (node.isUsedByBuild) {
                nodeService.addLabel(clusterId, labelsInfo).catch((res) => {
                    node.isUsedByBuild = !node.isUsedByBuild;
                    $domePublic.openWarning({
                        title: '修改失败！',
                        msg: 'Message:' + res.data.resultMsg
                    });
                });
            } else {
                nodeService.deleteLabel(clusterId, labelsInfo).catch((res) => {
                    node.isUsedByBuild = !node.isUsedByBuild;
                    $domePublic.openWarning({
                        title: '修改失败！',
                        msg: 'Message:' + res.data.resultMsg
                    });
                });
            }
        };

        let stateInfo = $state.$current.name;
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
            imageName: false,
        };
        $scope.hideColumn = [
            {name: '主机名称', key: 'hostName'},
            {name: '实例IP', key: 'podIp'},
            {name: '实例状态', key: 'status'},
            {name: '部署名称', key: 'deployName'},
            {name: '部署版本', key: 'deployVersion'},
            {name: 'namespace', key: 'namespace'},
            {name: '启动时间', key: 'startTime'},
            {name: '容器ID', key: 'containerId'},
            {name: '镜像名称', key: 'imageName'}
        ];
        const getInstances = () => {
            $scope.isWaitingInstances = true;
            clusterService.getInstancesList(clusterId).then(res => {
                $scope.instanceList = res.data.result || [];
            }).finally(() => {
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
                    instanceInfo: function () {
                        return {
                            clusterId: clusterId,
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
                    info: function () {
                        return {
                            containerList: containers,
                            hostIp: hostIp,
                            resourceId: clusterId,
                            type: 'CLUSTER',
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
        $scope.mayEditCluster = () => $scope.userRole === 'MASTER' || $scope.userRole === 'DEVELOPER';

    }]).controller('AddLabelModalCtr', ['$scope', 'clusterId', 'nodeList', '$modalInstance', '$domePublic', '$domeCluster', function ($scope, clusterId, nodeList, $modalInstance, $domePublic, $domeCluster) {
        //console.log(nodeList);
        $scope.labelList = [];
        $scope.newLabel = '';
        let nodeService = $domeCluster.getInstance('NodeService');
        $scope.addLabel = () => {
            for (let label of $scope.labelList) {
                if (label === $scope.newLabel) {
                    $scope.newLabel = '';
                    return;
                }
            }
            $scope.labelList.push($scope.newLabel);
            $scope.newLabel = '';
        };
        $scope.deleteLabel = (index) => {
            $scope.labelList.splice(index, 1);
        };
        $scope.submitLabels = () => {
            if ($scope.labelList.length === 0) {
                $domePublic.openWarning('您尚未添加标签！');
                return;
            }
            let labels = {};
            for (let label of $scope.labelList) {
                labels[label] = 'USER_LABEL_VALUE';
            }
            for (let node of nodeList) {
                node.labels = labels;
            }
            nodeService.addLabel(clusterId, nodeList).then(() => {
                $domePublic.openPrompt('添加成功！');
                $modalInstance.close();
            }, (res) => {
                $domePublic.openWarning({
                    title: '添加失败！',
                    msg: 'Message:' + res.data.resultMsg
                });
            });
        };
        $scope.cancel = () => {
            $modalInstance.dismiss();
        };
    }]);
})(window.domeApp);
