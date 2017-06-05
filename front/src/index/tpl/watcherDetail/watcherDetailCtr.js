/*
 * @author lgl993
 * @description 监听器详情
 * Created on 2017/1/22
 */
(function (domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;
    domeApp.controller('WatcherDetailCtr', ['$scope',
        '$domeDeploy',
        '$domeCluster',
        '$domePublic',
        '$state',
        '$modal',
        '$timeout',
        '$util',
        '$domeData',
        '$domeUser',
        '$window',
        'api',
        'dialog',
        function ($scope,
            $domeDeploy,
            $domeCluster,
            $domePublic,
            $state,
            $modal,
            $timeout,
            $util,
            $domeData,
            $domeUser,
            $window,
            api,
            dialog) {
            $scope.$emit('pageTitle', {
                title: '集群',
                descrition: '',
                mod: 'clusterManage'
            });
            $scope.clusterId = $state.params.clusterId;
            $scope.deployId = $state.params.deployId;
            $scope.resourceType = 'DEPLOY';
            $scope.resourceId = $state.params.deployId;
            $scope.watcher = {};
            $scope.watcher.containerDrafts = [];
            $scope.watcher.labelSelectors = [];
            //升级前的版本信息，必须提前定义为数组，否则初始化出现问题。
            $scope.watcherlabels = [];
            // 面包屑 父级url
            $scope.parentState = 'clusterDetail.watcher({id:"' + $scope.clusterId + '"})';
            $scope.wrongMessageList = {};
            $scope.tabActive = [{
                active: false
            }, {
                active: false
            }, {
                active: false
            }];

            const loadingsIns = $scope.loadingsIns = $domePublic.getLoadingInstance();
            const clusterService = $domeCluster.getInstance('ClusterService');
            const nodeService = $domeCluster.getInstance('NodeService');
            const WATCHER_REPLICAS = 1;
            var timeout, timeoutEvent, clusterList = [];

            $scope.showWrong = function(eid){
                if($scope.wrongMessageList[eid] === undefined){
                    $scope.wrongMessageList[eid] = true;
                }
                else{
                    $scope.wrongMessageList[eid] = !$scope.wrongMessageList[eid];
                }
            }
            
            //获取集群信息
            clusterService.getData().then(function (res) {
                clusterList = res.data.result || [];
                init();
            });

            //初始化用户角色
            (function () {
                loadingsIns.startLoading('userRole');
                $domeUser.userService.getResourceUserRole($scope.resourceType, $scope.resourceId).then(function (res) {
                    var userRole = res.data.result;
                    if (userRole === 'MASTER') {
                        $scope.isDelete = true;
                        $scope.isEdit = true;
                    } else if (userRole === 'DEVELOPER') {
                        $scope.isDelete = false;
                        $scope.isEdit = true;
                    } else {
                        $scope.isDelete = false;
                        $scope.isEdit = false;
                    }
                }, function () {
                    $scope.isDelete = false;
                    $scope.isEdit = false;
                }).finally(function () {
                    loadingsIns.finishLoading('userRole');
                });
            }());

            //获取监听器部署信息
            const getDeploy = function () {
                loadingsIns.startLoading('getDeploy');
                $domeDeploy.deployService.getSingle($scope.deployId).then(function (res) {
                    var data = res.data.result;
                    $scope.deployName = data.deployName;
                    $scope.$emit('pageTitle', {
                        title: data.deployName,
                        descrition: data.serviceDnsName,
                        mod: 'deployManage'
                    });
                    $scope.deployIns = $domeDeploy.getInstance('Deploy', angular.copy(res.data.result));
                    $scope.config = $scope.deployIns.config;
                    // 初始化clusterlist
                    $scope.deployIns.clusterListIns.init(angular.copy(clusterList));
                    // 选择当前version的cluster
                    $scope.deployIns.toggleCluster();
                }).finally(function () {
                    loadingsIns.finishLoading('getDeploy');
                });
            }

            //获取监听器的部署实例
            const getDeployInstance = function () {
                loadingsIns.startLoading('getDeployInstance');
                $domeDeploy.deployService.getInstances($scope.deployId).then(function (res) {
                    $scope.instanceList = res.data.result;
                }, function (resError) {
                    dialog.error('操作失败！', resError.data.resultMsg);
                }).finally(function () {
                    loadingsIns.finishLoading('getDeployInstance');
                });
            };

            //刷新事件
            var freshEvents = function() {
                return $domeDeploy.deployService.getEvents($scope.deployId).then(function(res) {
                let eventList = res.data.result || [];
                if (!$scope.eventList || $scope.eventList.length === 0) {
                    $scope.eventList = eventList;
                    eventList = null;
                    return true;
                }
                let responseLength = eventList.length;
                let pageLength = $scope.eventList.length;

                if(responseLength > pageLength){
                    for (let i = 0; i <responseLength ; i++) {
                        // $.extend($scope.eventList[i], eventList[i]);
                        Object.assign($scope.eventList[i],eventList[i]);
                    }
                }
                eventList = null;
                }, function() {
                    return true;
                }).finally(function () {
                    loadingsIns.finishLoading('freshEvents');
                });
            };

            const init = function () {
                loadingsIns.startLoading('freshEvents');
                freshEvents();
                getDeploy();
                getDeployInstance();
            }

            function versionListDialog(deployInfo, status) {
                return dialog.common({
                    title: '选择启动版本',
                    buttons: dialog.buttons.BUTTON_OK_CANCEL,
                    template: `
                        <form name="versionDialog">
                            <form-container left-column-width="100px">
                            <form-config-group>
                                <form-config-item config-title="当前版本">
                                    <form-input-container>
                                        <span ng-if="!deployInfo.currentVersions||deployInfo.currentVersions.length===0">无</span>
                                        <span ng-repeat="versionItem in deployInfo.currentVersions" ng-cloak>version{{versionItem.version}}</span>
                                    </form-input-container>
                                </form-config-item>
                                <form-config-item config-title="选择version" required>
                                    <form-input-container>
                                        <form-select ng-model="deployInfo.version" name="versionSelector"     options="versionList" show-search-input="never" placeholder="选择version" is-loading="isLoadingVersionList" loading-text="正在获取版本信息" empty-text="无相关信息" required></form-select>
                                        <form-error-message form="versionDialog" target="versionSelector" type="required">请选择版本</form-error-message>
                                    </form-input-container>
                                </form-config-item>
                            </form-config-group>
                            </form-container>
                        </form>
                        `,
                    size: 540,
                    controller: ['$scope', function ($dialogscope) {
                        $dialogscope.deployInfo = deployInfo;

                        $dialogscope.isLoadingVersionList = true;

                        api.deployment.version.listVersion(deployInfo.id).then(response => {
                            $dialogscope.versionList = (response || []).map(version => ({
                                value: version.version,
                                text: 'version' + version.version
                            }));
                            $dialogscope.isLoadingVersionList = false;
                        }).catch((error) => {
                            $dialogscope.isLoadingVersionList = false;
                            dialog.error('查询失败', error.message);
                        });
                        $dialogscope.onbeforeclose = function (button) {
                            if (button === dialog.button.BUTTON_OK) {
                                $dialogscope.versionDialog.$submitted = true;
                                if ($dialogscope.versionDialog.$valid) {
                                    $dialogscope.resolve($dialogscope.deployInfo);
                                }
                            } else $dialogscope.resolve(null);
                            return false;
                        };
                    }]
                })
            };

            function stopDialog(deployInfo, status) {
                return dialog.continue('确认停止', '确认要停止吗?').then(button => {
                    if (button !== dialog.button.BUTTON_OK) return null;
                    return deployInfo;
                })
            }

            function abortDialog(deployInfo, status) {
                let promptTxt = ({
                    'DEPLOYING': '中断启动，部署会处于停止状态，是否继续？',
                    'UPDATING': '中断升级，部署可能出现两个运行中的版本，是否继续？',
                    'BACKROLLING': '中断回滚，部署可能出现两个运行中的版本，是否继续？',
                })[status];
                return dialog.continue('中断操作', promptTxt).then(button => {
                    if (button !== dialog.button.BUTTON_OK) return null;
                    return deployInfo;
                })
            }

            function checkVersionListDialog(deployInfo, status) {
                return versionListDialog(deployInfo, status).then(result => {
                    if (result && result.currentVersion === result.version) {
                        throw '您不能选择当前版本！';
                    }
                    return result;
                })
            }

            let actionMap = {
                recover: { waitingTxt: 'isWaitingRecover', action: 'rollback', name: '恢复', dialog: versionListDialog },
                start: { waitingTxt: 'isWaitingStart', action: 'start', name: '启动', dialog: versionListDialog },
                update: { waitingTxt: 'isWaitingUpVersion', action: 'update', name: '升级', dialog: checkVersionListDialog },
                stop: { waitingTxt: 'isWaitingStop', action: 'stop', name: '停止', dialog: stopDialog },
                abort: { waitingTxt: 'isWaitingOperation', action: 'abort', name: '中断', dialog: abortDialog },
            }

            $scope.operate = function (type, status = null) {

                let deployInfo = {
                    id: $scope.deployId,
                    version: null,
                    currentVersions: $scope.config.currentVersions,
                    currentVersion: $scope.config.currentVersions.length && $scope.config.currentVersions[0].version || null,
                    replicas: WATCHER_REPLICAS
                }

                $scope[actionMap[type].waitingTxt] = true;

                actionMap[type].dialog(deployInfo, status).then((result) => {
                    if (result === null) {
                        $scope[actionMap[type].waitingTxt] = false;
                        return
                    }
                    if (result.version)
                        $scope.toggleVersion(result.version);
                    return api.deployment.action[actionMap[type].action](result).then(response => {
                        init();
                        let tiptxt = '已提交，正在'+ actionMap[type].name + '。';
                            if(response && 'tip' in response){
                                tiptxt = response.tip;
                            }
                        return dialog.tip(tiptxt,'');
                    }).catch(error => {
                        return dialog.error(actionMap[type].name + '失败', error.message);
                    }).then(() => {
                        $scope[actionMap[type].waitingTxt] = false;
                    });
                }).catch(e => {
                    $scope[actionMap[type].waitingTxt] = false;
                    return dialog.error('警告',e);
                })
            };
           
            $scope.deleteDeploy = function () {
                dialog.danger('确认删除', '确认要删除吗？').then(button => { if (button !== dialog.button.BUTTON_OK) throw '' }).then(function () {
                    api.deployment.delete($scope.deployId).then(function () {
                        dialog.tip('提示', '删除成功！');
                        let backend = { id: $scope.clusterId };
                        $state.go('clusterDetail.watcher', backend);
                    }).catch(function (res) {
                        dialog.error('删除失败！', res.message);
                    });
                });
            };

            $scope.toggleVersion = function (versionId) {
                $scope.deployIns.toggleVersion(versionId);
            };

            //升级部分
            const getLabels = () => {
                loadingsIns.startLoading('loadingLabels');
                clusterService.getLabels($scope.clusterId).then((res) => {
                    const labels = res.data.result || [];
                    //处理标签
                    $scope.labelsOption = [];
                    for (let label in labels) {
                        if (labels[label] === 'USER_LABEL_VALUE') {
                            $scope.labelsOption.push({
                                text: label,
                                value: label
                            })
                        }
                    }
                    loadingsIns.startLoading('loadingWatcher');
                    clusterService.getWatcher($scope.clusterId).then((res) => {
                        //处理部署版本信息
                        let versionInfo = {};
                        if (!res.data.result.versionSelectorInfos) {
                            clusterService.getInitWatcherVersion($scope.deployId).then((result) => {
                                versionInfo = result.data.result;
                                $scope.watcher.containerDrafts = angular.copy(versionInfo.containerDrafts);
                                $scope.watcher.versionType = 'WATCHER';
                                versionInfo.labelSelectors.forEach((value, index) => {
                                    $scope.watcherlabels.push(value.name);
                                })
                                if ($scope.nodeListIns) {
                                    $scope.toggleLabels($scope.watcherlabels);
                                }
                                loadingsIns.finishLoading('loadingWatcher');
                            })
                                .finally(() => {
                                    loadingsIns.finishLoading('loadingWatcher');
                                })
                        } else {
                            versionInfo = res.data.result.versionSelectorInfos[0] || {};
                            $scope.watcher.containerDrafts = angular.copy(versionInfo.containerDrafts);
                            $scope.watcher.versionType = 'WATCHER';
                            if (versionInfo.labelSelectors && versionInfo.labelSelectors.length) {
                                versionInfo.labelSelectors.forEach((value, index) => {
                                    $scope.watcherlabels.push(value.name);
                                })
                            }
                            if ($scope.nodeListIns) {
                                $scope.toggleLabels($scope.watcherlabels);
                            }
                            loadingsIns.finishLoading('loadingWatcher');
                        }
                    })
                })
                    .finally(function () {
                        loadingsIns.finishLoading('loadingLabels');
                    });
            }
            getLabels();

            //获取nodeList实例
            const getNodeListIns = () => {
                loadingsIns.startLoading('loadingNode');
                nodeService.getNodeList($scope.clusterId).then((res) => {
                    var nodeData = res.data.result || [];
                    $scope.nodeListIns = $domeCluster.getInstance('NodeList', nodeData);
                    if ($scope.watcherlabels) {
                        $scope.toggleLabels($scope.watcherlabels);
                    }
                }, () => {
                    $scope.nodeListIns = $domeCluster.getInstance('NodeList');
                }).finally(function () {
                    loadingsIns.finishLoading('loadingNode');
                });
            }
            getNodeListIns();

            //切换主机标签，控制主机显示,重新格式化watcher.labaelsSelecter
            $scope.toggleLabels = function (labels) {
                //每次重置labels状态
                for (let i in $scope.nodeListIns.labelsInfo) {
                    $scope.nodeListIns.labelsInfo[i].isSelected = false;
                }
                $scope.nodeListIns.toggleLabelNodes()
                $scope.watcher.labelSelectors = [];
                if (labels && labels.length) {
                    for (let i in labels) {
                        $scope.nodeListIns.toggleLabel(labels[i], true);
                        $scope.watcher.labelSelectors.push({ name: labels[i], content: 'USER_LABEL_VALUE' })
                    }
                }
            }

            $scope.modifyMirrorInfo = function () {
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
            }
            $scope.updateWatcherSubmit = function () {
                $scope.watcher.deployId = parseInt($scope.deployId, 10);
                let watcher = angular.copy($scope.watcher);
                $scope.isWaitingUpdate = true;
                $scope.deployIns.createWatcherVersion(watcher).then(function (msg) {
                    $scope.deployIns.freshVersionList();
                    if (msg == 'update') {
                        init();
                    }
                }).finally(function () {
                    $scope.isWaitingUpdate = false;
                });
            };

            //事件部分
            $scope.getEvents = function () {
                if (!$scope.eventList) {
                    freshEvents();
                }
                if (timeoutEvent) {
                    $timeout.cancel(timeoutEvent);
                }
                timeoutEvent = $timeout(function () {
                    freshEvents().finally(function () {
                        if ($state.$current.name == 'watcherDetail.event') {
                            $scope.getEvents();
                        }
                    });
                }, 4000);
            };

            let stateInfo = $state.$current.name;
            if (stateInfo.indexOf('detail') !== -1) {
                $scope.tabActive[0].active = true;
            } else if (stateInfo.indexOf('update') !== -1) {
                $scope.tabActive[1].active = true;
            } else if (stateInfo.indexOf('event') !== -1) {
                $scope.tabActive[2].active = true;
                $scope.getEvents();
            } else {
                $scope.tabActive[0].active = true;
            }
            
            $scope.$on('$destroy', function() {
                if (timeout) {
                    $timeout.cancel(timeout);
                }
                if (timeoutEvent) {
                    $timeout.cancel(timeoutEvent);
                }
            });
        }])
        .controller('createWatcherVersionModalCtr', ['$scope', 'replicas', '$modalInstance', function ($scope, replicas, $modalInstance) {
            $scope.replicas = 1;
            $scope.submitUpdateVersion = function () {
                $modalInstance.close($scope.replicas);
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }]);
})(angular.module('domeApp'));