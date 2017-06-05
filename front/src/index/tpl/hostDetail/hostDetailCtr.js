/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;
    domeApp.controller('HostDetailCtr', ['$scope', '$stateParams', '$domeCluster', 'dialog', '$modal', '$state', '$q', function ($scope, $stateParams, $domeCluster, dialog, $modal, $state, $q) {
        $scope.loading = true;
        var loadingItems = {
                host: true,
                instance: true
            },
            nodeService = $domeCluster.getInstance('NodeService'),
            hostname = $stateParams.name,
            clusterId = $stateParams.clusterId;
        if (!$stateParams.name || !$stateParams.clusterId) {
            $state.go('clusterDetail.hostlist', {
                id: clusterId
            });
            return;
        }
        var envData = {
            testEnv: false,
            prodEnv: false
        };
        $scope.hostSetting = {
            labelTxt: '',
            diskTxt: '',
            isUsedToBuild: false
        };
        $scope.$emit('pageTitle', {
            title: hostname,
            descrition: '',
            mod: 'cluster'
        });
        $scope.clusterConfig = {};
        // 面包屑 父级url
        $scope.parentState = 'clusterDetail({id:"' + clusterId + '"})';
        $scope.clusterId = clusterId;

        $scope.tabActive = [{
            active: false
        }, {
            active: false
        }];

        var stateInfo = $state.$current.name;
        if (stateInfo.indexOf('info') !== -1) {
            $scope.tabActive[1].active = true;
        } else {
            $scope.tabActive[0].active = true;
        }
        $scope.orderBy = {
            item: '',
            isReverse: false
        };
        $scope.toggleOrderBy = function (item) {
            if ($scope.orderBy.item === item) {
                $scope.orderBy.isReverse = !$scope.orderBy.isReverse;
            } else {
                $scope.orderBy.item = item;
                $scope.orderBy.isReverse = false;
            }
        };
        nodeService.getData(clusterId).then(function (res) {
            $scope.clusterConfig = res.data.result || {};
        });

        nodeService.getNodeInfo(clusterId, hostname).then(function (res) {
            var node = res.data.result;
            $scope.hostSetting.diskTxt = node.diskInfo;
            node.capacity.memory = (node.capacity.memory / 1024 / 1024).toFixed(2);
            node.statusTxt = node.status == 'Ready' ? '在线' : '离线';
            if (node.labels) {
                if (node.labels.TESTENV) {
                    envData.testEnv = true;
                }
                if (node.labels.PRODENV) {
                    envData.prodEnv = true;
                }
                $scope.envData = angular.copy(envData);

                //过滤非用户标签
                Object.keys(node.labels).forEach(key => {
                    if (node.labels[key] !== 'USER_LABEL_VALUE'){
                      delete node.labels[key];
                    }
                });
                // delete node.labels['kubernetes.io/hostname'];
                // delete node.labels.TESTENV;
                // delete node.labels.PRODENV;
                // delete node.labels.hostEnv;
                if (node.labels.BUILDENV) {
                    $scope.hostSetting.isUsedToBuild = true;
                    delete node.labels.BUILDENV;
                }
                $scope.labelsList = node.labels;
            }
            // // @TODO 修改操作系统判断逻辑
            if(node.osVersion && node.osVersion.toLowerCase().indexOf('ubuntu') !== -1) {
                $scope.osType = 'ubuntu';
            } else if(node.osVersion && node.osVersion.toLowerCase().indexOf('red hat') !== -1){
                $scope.osType = 'centos';
            } else {
                $scope.osType = 'centos';
            }
            $scope.node = node;
        }, function () {
            dialog.error('警告', '请求失败！');
            $state.go('clusterDetail.hostlist', {
                id: clusterId
            });
        }).finally(function () {
            loadingItems.host = false;
            if (!loadingItems.instance && $scope.loading) {
                $scope.loading = false;
            }
        });
        nodeService.getHostInstances(clusterId, hostname).then(function (res) {
            $scope.instanceList = res.data.result || [];
        }).finally(function () {
            loadingItems.instance = false;
            if (!loadingItems.host && $scope.loading) {
                $scope.loading = false;
            }
        });
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
        $scope.toggleBuildEnv = function () {
            var requestData = [{
                node: hostname,
                labels: {
                    BUILDENV: 'HOSTENVTYPE'
                }
            }];
            if ($scope.hostSetting.isUsedToBuild) {
                nodeService.addLabel(clusterId, requestData).then(function () {
                    // $scope.hostSetting.isUsedToBuild = true;
                }, function () {
                    dialog.error('警告', '添加失败！');
                });

            } else {
                nodeService.getNodeList(clusterId).then(function (res) {
                    var nodeList = res.data.result || [];
                    for (var i = 0, l = nodeList.length; i < l; i++) {
                        if (nodeList[i].name !== hostname && nodeList[i].labels && nodeList[i].labels.BUILDENV) {
                            return true;
                        }
                    }
                    dialog.error('警告', '构建集群至少需要一台用于构建的主机！');
                    return $q.reject();
                }).then(function () {
                    nodeService.deleteLabel(clusterId, requestData).then(function () {
                        // $scope.hostSetting.isUsedToBuild = false;
                    }, function () {
                        dialog.error('警告', '修改失败！');
                    });
                });
            }
        };
        $scope.modifyEnv = function () {
            var addLabels = [],
                deleteLabels = [];
            if (!$scope.envData.testEnv && !$scope.envData.prodEnv) {
                dialog.error('警告', '请至少选中一个工作场景！');
                return;
            }

            if ($scope.envData.testEnv) {
                addLabels.push({
                    node: hostname,
                    labels: {
                        TESTENV: 'HOSTENVTYPE'
                    }
                });
            } else {
                deleteLabels.push({
                    node: hostname,
                    labels: {
                        TESTENV: 'HOSTENVTYPE'
                    }
                });
            }

            if ($scope.envData.prodEnv) {
                if (!addLabels[0]) {
                    addLabels.push({
                        node: hostname,
                        labels: {
                            PRODENV: 'HOSTENVTYPE'
                        }
                    });
                } else {
                    addLabels[0].labels.PRODENV = 'HOSTENVTYPE';
                }
            } else {
                if (!deleteLabels[0]) {
                    deleteLabels.push({
                        node: hostname,
                        labels: {
                            PRODENV: 'HOSTENVTYPE'
                        }
                    });
                } else {
                    deleteLabels[0].labels.PRODENV = 'HOSTENVTYPE';
                }
            }

            if (addLabels.length !== 0 && deleteLabels.length !== 0) {
                // 不能同时操作删除和添加
                nodeService.addLabel(clusterId, addLabels).then(function () {
                    return true;
                }, function (res) {
                    dialog.error('修改失败', res.data.resultMsg);
                }).then(function () {
                    nodeService.deleteLabel(clusterId, deleteLabels).then(function () {
                        dialog.alert('提示', '修改成功！');
                    }, function (res) {
                        dialog.error('修改失败', res.data.resultMsg);
                    });
                });
            } else if (addLabels.length !== 0) {
                nodeService.addLabel(clusterId, addLabels).then(function () {
                    dialog.alert('提示', '修改成功');
                }, function (res) {
                    dialog.error('修改失败', res.data.resultMsg);
                });
            } else {
                nodeService.deleteLabel(clusterId, deleteLabels).then(function () {
                    dialog.alert('提示', '修改成功');
                }, function (res) {
                    dialog.error('修改失败', res.data.resultMsg);
                });
            }
        };
        $scope.addLabel = function () {
            if (!$scope.hostSetting.labelTxt || $scope.hostSetting.labelTxt === '') {
                return;
            }
            var requestData = [{
                node: hostname,
                labels: {}
            }];
            requestData[0].labels[$scope.hostSetting.labelTxt] = 'USER_LABEL_VALUE';

            nodeService.addLabel(clusterId, requestData).then(function () {
                $scope.labelsList[$scope.hostSetting.labelTxt] = 'USER_LABEL_VALUE';
                $scope.hostSetting.labelTxt = '';
            }, function () {
                dialog.error('警告', '添加失败！');
            });
        };
        $scope.deleteLable = function (label) {
            var deleteLabelInfo = [{
                node: hostname,
                labels: {}
            }];
            deleteLabelInfo[0].labels[label] = null;
            dialog.continue('提示', '删除主机标签可能会影响部署，是否继续？').then(button => { if (button !== dialog.button.BUTTON_OK) throw '' }).then(function () {
                nodeService.deleteLabel(clusterId, deleteLabelInfo).then(function () {
                    delete $scope.labelsList[label];
                }, function () {
                    dialog.error('警告', '删除失败！');
                });
            });
        };
        $scope.goToDeployInstance = function(instance) {
            $state.go('deployDetail.instance', {
                'id': instance.deloyId,
                'collectionId': 0,
                'collectionName': 'all-deploy',
            });

        };
        $scope.toConsole = function (index) {
            $modal.open({
                templateUrl: 'index/tpl/modal/selectContainerModal/selectContainerModal.html',
                controller: 'SelectContainerModalCtr',
                size: 'md',
                resolve: {
                    info: function () {
                        return {
                            containerList: $scope.instanceList[index].containers,
                            hostIp: $scope.instanceList[index].hostIp,
                            resourceId: clusterId,
                            type: 'CLUSTER'
                        };
                    }
                }
            });
        };
    }]);
})(angular.module('domeApp'));