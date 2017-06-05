/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;
    domeApp.controller('MonitorCtr', [
      '$scope',
      '$http',
      '$domeCluster',
      '$domeDeploy',
      '$domeMonitor',
      '$domePublic',
      'dialog',
      '$modal',
      '$domeUser',
      '$q',
      '$sce',
      '$filter',
      'api',
      function (
        $scope,
        $http,
        $domeCluster,
        $domeDeploy,
        $domeMonitor,
        $domePublic,
        dialog,
        $modal,
        $domeUser,
        $q,
        $sce,
        $filter,
        api
      ) {
        'use strict';
        $scope.$emit('pageTitle', {
            title: '监控',
            descrition: '在这里您可以对主机、实例和容器进行多维度的实时监控。',
            mod: 'monitor'
        });

        $scope.loadingsIns = $domePublic.getLoadingInstance();
        var nodeService = $domeCluster.getInstance('NodeService');
        $scope.monitorType = '主机';
        $scope.currentEnv = {
            text: '生产',
            value: 'PROD'
        };
        $scope.labelKey = {
            key: ''
        };
        $scope.keywords = {
            node: '',
            instance: '',
            deployName: ''
        };
        $scope.orderBy = {
            node: '',
            pod: '',
            isReverse: false
        };

        $scope.alarmPermission = {};
        $scope.loadingsIns.startLoading('loadingCluster');
        // 获取集群列表
        nodeService.getData().then(function (res) {
            $scope.clusterListIns = $domeCluster.getInstance('ClusterList', res.data.result);
            if ($scope.clusterListIns.clusterList[0]) {
                $scope.toggleCluster(0);
            }
        }).finally(function () {
            $scope.loadingsIns.finishLoading('loadingCluster');
        });
        // 获取当前用户的报警权限
        $domeUser.getLoginUser().then(function (user) {
          $http.get('/api/user/resource/ALARM/1000').then(function (res) {
            var role = res.data.result;
            vm.permission.id = user.id;
            vm.permission.role = role;
          });
        });
        var freshNodeMonitor = function () {
            $scope.loadingsIns.startLoading('loadingNode');
            nodeService.getNodeListWoPods($scope.clusterListIns.cluster.id).then(function (res) {
                var nodeData = res.data.result || [];
                $scope.nodeListIns = $domeCluster.getInstance('NodeList', nodeData);

                $scope.toggleEnv('生产');

                if (nodeData.length === 0) {
                    return;
                }
                var monitorInfo = [],
                    monitorItems = [],
                    i, l;
                for (i = 0, l = nodeData.length; i < l; i++) {
                    monitorInfo[i] = {
                        node: nodeData[i].name
                    };
                    monitorItems.push(nodeData[i].name);
                }
                $domeMonitor.getMonitorStatistical('node', $scope.clusterListIns.cluster.id, monitorInfo, monitorItems).then(function (monitorResult) {
                    var nodeList = $scope.nodeListIns.nodeList;
                    for (i = 0, l = nodeList.length; i < l; i++) {
                        angular.extend(nodeList[i], monitorResult[nodeList[i].name]);
                    }
                });
            }, function () {
                $scope.nodeListIns = $domeCluster.getInstance('NodeList');
            }).finally(function () {
                $scope.loadingsIns.finishLoading('loadingNode');
            });
        };

        var freshPodMonitor = function () {
            var insList = $scope.deployListIns.deployInstanceListIns.instanceList;
            if (!insList || insList.length === 0) {
                return;
            }
            var monitorInfo = [],
                monitorItems = [],
                i, j, l1, l2;
            for (i = 0, l1 = insList.length; i < l1; i++) {
                var containers = [];
                if (insList[i].containers) {
                    for (j = 0, l2 = insList[i].containers.length; j < l2; j++) {
                        containers.push({
                            hostname: insList[i].hostName,
                            containerId: insList[i].containers[j].containerId
                        });
                    }
                }
                monitorInfo.push({
                    pod: {
                        podName: insList[i].instanceName,
                        containers: containers
                    }
                });
                monitorItems.push(insList[i].instanceName);
            }
            $domeMonitor.getMonitorStatistical('pod', $scope.clusterListIns.cluster.id, monitorInfo, monitorItems).then(function (monitorResult) {
                for (i = 0, l1 = insList.length; i < l1; i++) {
                    angular.extend(insList[i], monitorResult[insList[i].instanceName]);
                }
            });
        };

        $scope.modifyTooltip = function (type, data) {
            if (!data) {
                return;
            }
            var tpl = [];
            tpl.push('<div class="table-detail-wrap"><table class="table-detail">');
            tpl.push('<thead><tr>');
            switch (type) {
            case 'diskUsed':
                tpl.push('<th>设备</th><th>磁盘占用率</th>');
                break;
            case 'diskRead':
                tpl.push('<th>设备</th><th>磁盘读取(KB/s)</th>');
                break;
            case 'diskWrite':
                tpl.push('<th>设备</th><th>磁盘写入(KB/s)</th>');
                break;
            case 'netIn':
                tpl.push('<th>网卡</th><th>流入数据(KB/s)</th>');
                break;
            case 'netOut':
                tpl.push('<th>网卡</th><th>流出数据(KB/s)</th>');
                break;
            }
            tpl.push('</tr></thead>');
            tpl.push('<tbody>');
            for (var i = 0, l = data.length; i < l; i++) {
                tpl.push('<tr><td>' + data[i].item + '</td><td>' + data[i].value + '</td>');
            }
            tpl.push('</tbody>');
            tpl.push('</table></div>');
            $scope.toolTipText = $sce.trustAsHtml(tpl.join(''));
        };

        $scope.toggleEnv = function (envText) {
            var envValue = envText === '生产' ? 'PROD' : 'TEST';

            $scope.currentEnv = {
                text: envText,
                value: envValue
            };
            if ($scope.monitorType == '主机') {
                $scope.nodeListIns.toggleEnv(envValue);
            } else {
                $scope.deployListIns.filterDeploy($scope.clusterListIns.cluster.name, envValue, $scope.instanceType).finally(function () {
                    freshPodMonitor();
                });
            }
        };

        $scope.calcFilterdNodeListLength = function(){
            let total = 0;
            $scope.nodeListIns && $scope.nodeListIns.nodeList.length && (total = $filter('filter')($scope.nodeListIns.nodeList, {'labelFilter':true}).length);
            return `共 ${total} 台主机`;
        }

        $scope.toggleCluster = function (index) {
            $scope.clusterListIns.toggleCluster(index);
            if ($scope.monitorType == '主机') {
                freshNodeMonitor();
            } else if ($scope.monitorType == '部署实例' || $scope.monitorType === '负载均衡') {
                $scope.deployListIns.filterDeploy($scope.clusterListIns.cluster.name, $scope.currentEnv.value, $scope.instanceType).finally(function () {
                    freshPodMonitor();
                });
                // // 过滤掉非当前集群的deploy，并切换到第一个符合条件的deploy
                // $scope.deployListIns.filterCluster($scope.clusterListIns.cluster.name);

                // $scope.toggleDeploy($scope.deployListIns.deploy.id, $scope.deployListIns.deploy.name);
            }
        };
        $scope.toggleDeploy = function (deployId, deployName, namespace) {
            $scope.deployListIns.toggleDeploy(deployId, deployName, namespace, '', $scope.instanceType).finally(function () {
                freshPodMonitor();
            });
            $scope.keywords.deployName = '';
        };
        $scope.instanceType = ''; //用于区分实例类型: loadBalance = 负载均衡实例， '' || 'deploy' = 部署实例
        $scope.toggleMonitorType = function (type) {
            function initDeploy() {
                if ($scope.clusterListIns.cluster.name) {
                    $scope.deployListIns.filterDeploy($scope.clusterListIns.cluster.name, $scope.currentEnv.value, $scope.instanceType).finally(function () {
                        freshPodMonitor();
                    });
                }
            }
            if (type === $scope.monitorType) {
                return;
            } else {
                $scope.monitorType = type;
                if (type == '主机') {
                    freshNodeMonitor();
                } else if (type == '部署实例'){
                    $scope.loadingsIns.startLoading('deploy');
                    $domeDeploy.deployService.getList().then(function (res) {
                      $scope.deployListIns = $domeDeploy.getInstance('DeployList', res.data.result);
                      initDeploy();
                    }, function (res) {
                      dialog.error('请求失败', res.data.resultMsg);
                    }).finally(function () {
                      $scope.loadingsIns.finishLoading('deploy');
                    });
                }else if (type == '负载均衡'){
                    $scope.instanceType = 'loadBalance';
                    api.loadBalance.loadBalance.listAll().then(response => {
                      $scope.deployListIns = $domeDeploy.getInstance('DeployList',response);
                      initDeploy();
                    }).catch(error => { dialog.error('请求失败', error.message); })
                }
            }
        };
        $scope.toggleOrderBy = function (type, orderBy) {
            if ($scope.orderBy[type] === orderBy) {
                $scope.orderBy.isReverse = !$scope.orderBy.isReverse;
            } else {
                $scope.orderBy[type] = orderBy;
                $scope.orderBy.isReverse = false;
            }
        };
        $scope.showContainer = function (instance) {
            $scope.deployListIns.deployInstanceListIns.toggleContainerList(instance);

            var monitorInfo = [],
                monitorItems = [],
                i, l, hostname = instance.hostName,
                containerList = $scope.deployListIns.deployInstanceListIns.containerList;

            for (i = 0, l = containerList.length; i < l; i++) {
                monitorInfo.push({
                    container: {
                        hostname: hostname,
                        containerId: containerList[i].containerId
                    }
                });
                monitorItems.push(containerList[i].containerId);
            }

            $domeMonitor.getMonitorStatistical('container', $scope.clusterListIns.cluster.id, monitorInfo, monitorItems).then(function (monitorResult) {
                for (i = 0, l = containerList.length; i < l; i++) {
                    angular.extend(containerList[i], monitorResult[containerList[i].containerId]);
                }
                $modal.open({
                    templateUrl: 'containersModal.html',
                    controller: 'ContainersModalCtr',
                    size: 'lg',
                    resolve: {
                        monitorParams: function () {
                            return {
                                clusterId: $scope.clusterListIns.cluster.id,
                                clusterName: $scope.clusterListIns.cluster.name,
                                hostname: hostname
                            };
                        },
                        instanceIns: function () {
                            return $scope.deployListIns.deployInstanceListIns;
                        }
                    }
                });
            });
        };
        $scope.toMonitorDetail = function (monitorType, singleItem) {
            var monitorTargetInfo = {
                    clusterId: $scope.clusterListIns.cluster.id,
                    targetType: monitorType,
                    targetInfos: []
                },
                i, l, instanceList;

            function getPodMonitorContainers(instance) {
                var containerList = instance.containers || [],
                    containers = [];
                for (var j = 0, l1 = containerList.length; j < l1; j++) {
                    containers.push({
                        hostname: instance.hostName,
                        containerId: containerList[j].containerId
                    });
                }
                return containers;
            }
            if (monitorType == 'node') {
                if (typeof singleItem !== 'undefined') {
                    monitorTargetInfo.targetInfos.push({
                        node: singleItem.name
                    });
                } else {
                    for (i = 0, l = $scope.nodeListIns.nodeList.length; i < l; i++) {
                        if ($scope.nodeListIns.nodeList[i].isSelected) {
                            monitorTargetInfo.targetInfos.push({
                                node: $scope.nodeListIns.nodeList[i].name
                            });
                        }
                    }
                }
            } else if (monitorType == 'pod') {
                if (typeof singleItem !== 'undefined') {
                    monitorTargetInfo.targetInfos.push({
                        pod: {
                            podName: singleItem.instanceName,
                            containers: getPodMonitorContainers(singleItem)
                        }
                    });
                } else {
                    instanceList = $scope.deployListIns.deployInstanceListIns.instanceList;
                    for (i = 0, l = instanceList.length; i < l; i++) {
                        if (instanceList[i].isSelected) {
                            monitorTargetInfo.targetInfos.push({
                                pod: {
                                    podName: instanceList[i].instanceName,
                                    containers: getPodMonitorContainers(instanceList[i])
                                }
                            });
                        }
                    }
                }
            }
            if (monitorTargetInfo.targetInfos.length === 0) {
                dialog.error('警告', '请至少选择一项监控');
            } else {
                $domeMonitor.toMonitorPage($scope.clusterListIns.cluster.id, $scope.clusterListIns.cluster.name, monitorTargetInfo);
            }
        };
        $scope.labelKeyDown = function (event, str, labelsInfoFiltered) {
            var lastSelectLabelKey, labelsInfo = $scope.nodeListIns.labelsInfo,
                hasSelected = false;
            if (event.keyCode == 13 && labelsInfoFiltered) {
                angular.forEach(labelsInfoFiltered, function (value, label) {
                    if (!hasSelected && !value.isSelected) {
                        $scope.nodeListIns.toggleLabel(label, true);
                        $scope.labelKey.key = '';
                    }
                    hasSelected = true;
                });
            } else if (!str && event.keyCode == 8) {
                angular.forEach(labelsInfo, function (value, key) {
                    if (value.isSelected) {
                        lastSelectLabelKey = key;
                    }
                });
                if (lastSelectLabelKey) {
                    $scope.nodeListIns.toggleLabel(lastSelectLabelKey, false);
                }
            }
        };
    }]).controller('ContainersModalCtr', ['$scope', 'instanceIns', 'monitorParams', '$domeMonitor', 'dialog', function ($scope, instanceIns, monitorParams, $domeMonitor, dialog) {
        instanceIns.checkAllContainer(true);
        $scope.instanceIns = instanceIns;
        var i, l;
        $scope.orderBy = {
            container: '',
            isReverse: false
        };
        for (i = 0, l = instanceIns.containerList.length; i < l; i++) {
            var imageName = instanceIns.containerList[i].imageName;
            var seperateIndex = imageName.lastIndexOf(':');
            instanceIns.containerList[i].shortContainerId = instanceIns.containerList[i].containerId.substring(0, 12);
            if (seperateIndex !== -1) {
                instanceIns.containerList[i].image = imageName.substring(0, seperateIndex);
                instanceIns.containerList[i].imageTag = imageName.substring(seperateIndex + 1);
            }
        }
        $scope.toggleOrderBy = function (orderBy) {
            if ($scope.orderBy.container === orderBy) {
                $scope.orderBy.isReverse = !$scope.orderBy.isReverse;
            } else {
                $scope.orderBy.container = orderBy;
                $scope.orderBy.isReverse = false;
            }
        };
        $scope.toMonitorDetail = function (singleItem) {
            var monitorTargetInfo = {
                clusterId: monitorParams.clusterId,
                targetType: 'container',
                targetInfos: []
            };
            if (singleItem) {
                monitorTargetInfo.targetInfos.push({
                    container: {
                        hostname: monitorParams.hostname,
                        containerId: singleItem.containerId
                    }
                });
            } else {
                for (var i = 0, l = instanceIns.containerList.length; i < l; i++) {
                    if (instanceIns.containerList[i].isSelected) {
                        monitorTargetInfo.targetInfos.push({
                            container: {
                                hostname: monitorParams.hostname,
                                containerId: instanceIns.containerList[i].containerId
                            }
                        });
                    }
                }
            }
            if (monitorTargetInfo.targetInfos.length === 0) {
                dialog.error('警告', '请至少选择一项监控');
            } else {
                $domeMonitor.toMonitorPage(monitorParams.clusterId, monitorParams.clusterName, monitorTargetInfo);
            }

        };
    }]);
})(angular.module('domeApp'));