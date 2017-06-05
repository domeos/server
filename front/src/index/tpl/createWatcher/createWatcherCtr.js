/*
 * @author lgl1993
 * @description 创建监听器
 * Created on 2017/1/22
 */

(function(domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;
    domeApp.controller('CreateWatcherCtr', ['$scope', '$state', '$domePublic', '$util', '$domeCluster', '$domeDeploy', '$modal', 'dialog', function($scope, $state, $domePublic, $util, $domeCluster, $domeDeploy, $modal, dialog) {
        'use strict';
        $scope.$emit('pageTitle', {
            title: '新建监听器',
            descrition: '新建一个监听器',
            mod: 'cluster'
        });
        if (!$state.params.id) {
            $state.go('clusterManage');
        }
        const clusterId = $scope.clusterId = $state.params.id,
            nodeService = $domeCluster.getInstance('NodeService'),
            clusterService = $domeCluster.getInstance('ClusterService');
        $scope.loadingsIns = $domePublic.getLoadingInstance();
        //$scope.parentState = 'clusterDetail({"id":' + clusterId + '})';
        $scope.watcher = {};
        $scope.watcher.clusterId = clusterId;
        $scope.watcher.containerDrafts = [];
        $scope.watcher.containerDrafts[0] = {
            registry: 'https://pub.domeos.org',
            image: 'kube_event_watcher',
            tag: 'v0.1.0',
            mem: 0,
            cpu: 0
        };

        //获取nodeList实例
        const getNodeListIns = () => {
            $scope.loadingsIns.startLoading('loadingNode');
            nodeService.getNodeList(clusterId).then((res) => {
                var nodeData = res.data.result || [];
                $scope.nodeListIns = $domeCluster.getInstance('NodeList', nodeData);
            }, () => {
                $scope.nodeListIns = $domeCluster.getInstance('NodeList');
            }).finally(function() {
                $scope.loadingsIns.finishLoading('loadingNode');
            });
        };
        getNodeListIns();

        const getNamespace = () => {
            $scope.loadingsIns.startLoading('loadingNamespace');
            clusterService.getNamespace(clusterId).then((res) => {
                let namespaceList = res.data.result || [];
                if (namespaceList instanceof Array) {
                    for (let namespace of namespaceList) {
                        if (namespace.name === 'default') {
                            $scope.watcher.namespace = namespace.name;
                            break;
                        }
                    }
                    if ($scope.watcher.namespace == null) {
                        $scope.watcher.namespace = namespaceList[0].name;
                    }
                }
                $scope.namespaceOption = [];
                namespaceList.map(function(element) {
                    $scope.namespaceOption.push({
                        text: element.name,
                        value: element.name
                    })
                });
            }, () => {
                $scope.namespaceOption = [];
            }).finally(() => {
                //$scope.isWaitingNamespace = false;
                $scope.loadingsIns.finishLoading('loadingNamespace');
            });
        };
        getNamespace();

        const getLabels = () => {
            $scope.loadingsIns.startLoading('loadingLabels');
            clusterService.getLabels(clusterId).then((res) => {
                let labels = res.data.result || [];
                $scope.labelsOption = [];
                for (let label in labels) {
                    if (labels[label] === 'USER_LABEL_VALUE') {
                        $scope.labelsOption.push({
                            text: label,
                            value: { name: label, content: labels[label] }
                        })
                    }
                }
            }, () => {
                $scope.labelsOption = [];
            }).finally(() => {
                $scope.loadingsIns.finishLoading('loadingLabels');
            });
        };
        getLabels();

        $scope.modifyMirrorInfo = function() {
            const modalInstance = $modal.open({
                animation: true,
                templateUrl: 'modifyMirrorInfo.html',
                controller: 'ModifyMirrorInfoCtr',
                size: 'md',
                resolve: {
                    mirrorInfo: () => $scope.watcher.containerDrafts[0]
                }
            });
            modalInstance.result.then((res) => {
                angular.extend($scope.watcher.containerDrafts[0], res);
            })
        };

        //切换主机标签，控制主机显示
        $scope.toggleLabels = function(labels) {
            //每次重置labels状态
            for (let i in $scope.nodeListIns.labelsInfo) {
                $scope.nodeListIns.labelsInfo[i].isSelected = false;
            }
            $scope.nodeListIns.toggleLabelNodes()

            for (let i in labels) {
                $scope.nodeListIns.toggleLabel(labels[i].name, true);
            }
        };

        $scope.cancel = function(){
            $state.go('clusterDetail.watcher',{'id':clusterId});
        }
        
        $scope.createWatcherSubmit = function() {
            let watcher = angular.copy($scope.watcher);
            clusterService.createWatcher(clusterId, watcher).then((res) => {
                let watcher = res.data.result || [];
                $state.go('watcherDetail', { 'clusterId': watcher.clusterId, 'deployId': watcher.id });
            }, (resError) => {
                dialog.error('操作失败', resError.data.resultMsg);
            });
        };
    }]).controller('ModifyMirrorInfoCtr', ['mirrorInfo', '$scope', '$modalInstance', function(mirrorInfo, $scope, $modalInstance) {
        $scope.containerDrafts = {
            registry: 'https://pub.domeos.org',
            image: 'kube_event_watcher',
            tag: 'v0.1.0',
            mem: 0,
            cpu: 0
        };
        angular.extend($scope.containerDrafts, mirrorInfo);
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
        $scope.submit = function() {
            $modalInstance.close($scope.containerDrafts);
        };
    }]);
})(angular.module('domeApp'));