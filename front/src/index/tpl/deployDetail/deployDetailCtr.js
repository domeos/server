/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;
    domeApp.controller('DeployDetailCtr',[
        '$scope',
        '$domeDeploy',
        '$domeCluster',
        '$state',
        '$modal',
        '$timeout',
        '$util',
        '$domeData',
        'dialog',
        '$window',
        'api',
        function (
            $scope,
            $domeDeploy,
            $domeCluster,
            $state,
            $modal,
            $timeout,
            $util,
            $domeData,
            dialog,
            $window,
            api
            ) {
                $scope.$emit('pageTitle', {
                    title: '部署',
                    descrition: '',
                    mod: 'deployManage'
                });
                $scope.collectionId = $state.params.collectionId;
                $scope.collectionName = $state.params.collectionName;
                if (!$scope.collectionId || !$scope.collectionName) {
                    $state.go('deployCollectionManage');
                }
                const goBackParam = {
                    id: $scope.collectionId,
                    name: $scope.collectionName
                };
                if (!$state.params.id) {
                    $state.go('deployManage', goBackParam);
                }
                let deployId = $state.params.id;
                let timeout, timeoutEvent, timeoutInstance, stateInfo;
                let resourceType = 'DEPLOY';
                let resourceId = deployId;
                $scope.storageId = $state.params.storageId;
                $scope.sourceModule = $state.params.source;
                $scope.watcherInfo = {
                    clusterId: null
                };
                $scope.goBackStorage = function () {
                    $state.go('storageVolumeDetail', {
                        id: $scope.storageId,
                    });
                    $window.refreshMenu = Date.now().toString() + Math.random();
                };
                // 面包屑 父级url
                let goBackUrl = 'deployCollectionManage';
                if ($scope.collectionName === 'all-deploy') {
                    $scope.parentState = 'deployAllManage({id:"' + $scope.collectionId + '",name:"' + $scope.collectionName + '"})';
                    goBackUrl = 'deployAllManage';
                } else {
                    $scope.parentState = 'deployManage({id:"' + $scope.collectionId + '",name:"' + $scope.collectionName + '"})';
                    goBackUrl = 'deployManage';
                }


                $scope.valid = {
                    needValid: false
                };
                $scope.isEditDesc = false;

                $scope.wrongMessageList = {};
                
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
                }, {
                    active: false
                }, {
                    active: false
                }];
                if($scope.sourceModule === 'clusterHostInstance') {
                    $scope.tabActive[3].active = true;
                }
                $scope.labelKey = {
                    key: ''
                };

                $scope.showWrong = function(eid){
                    if($scope.wrongMessageList[eid] === undefined){
                        $scope.wrongMessageList[eid] = true;
                    }
                    else{
                        $scope.wrongMessageList[eid] = !$scope.wrongMessageList[eid];
                    }
                }

                //获取用户角色
                const getUserRole = function() {
                    let resource = {type: resourceType, id: resourceId};
                    api.user.myRole(resource).then(userRole => {
                    $scope.mayDelete = userRole === 'MASTER';
                    $scope.mayUpdate = userRole === 'MASTER' || userRole === 'DEVELOPER';
                    }).catch(() => {
                        $scope.mayDelete = false;
                        $scope.mayUpdate = false;
                    });
                };
                getUserRole();

                let getDeploymentPromise = api.SimplePromise.resolve([]);
                const initDeployment = function () {
                    $scope.isLoadingDeploymentInfo = true;
                    getDeploymentPromise = api.deployment.get(deployId).then(deployment => {
                        $scope.config = deployment || {};
                        return $scope.config;
                    });
                };

                function freshDeployment() {
                    initDeployment();
                    if (timeout) {
                        $timeout.cancel(timeout);
                    }
                    timeout = $timeout(freshDeployment, 4000);
                }
                freshDeployment();

                /**
                 * $scope.config  部署的详细信息，主要用于header部分，其他少部分也有用
                 * $scope.versionList 版本列表
                 * $scope.deployVersionDraft 版本详情
                 */
                const initVersion = function () {
                    $scope.isLoadingDetail = true;
                    api.deployment.get(deployId).then(deployment => {
                        $scope.config = deployment || {};
                        $scope.deployName = $scope.config.deployName;
                        $scope.watcherInfo.clusterId = $scope.config.clusterId;
                        return $scope.config;
                    }).then(() => {
                        networkVisit($scope.config);
                    }).catch(() => { }).then(() => {
                        let deployment = $scope.config;
                        api.deployment.version.listVersion(deployment.deployId).then(responseVersionList => {
                            $scope.versionList = responseVersionList || [];
                            // 初始化时显示的当前版本
                            let currentVersion = null;
                            if (deployment.currentVersions && deployment.currentVersions.length > 0) {
                                // copy from deployModule.es
                                let createTime = -1;
                                for (let i = 0, l = deployment.currentVersions.length; i < l; i++) {
                                    if (deployment.currentVersions[i].createTime > createTime) {
                                        createTime = deployment.currentVersions[i].createTime;
                                        $scope.currentVersionId = deployment.currentVersions[i].version;
                                        currentVersion = deployment.currentVersions[i];
                                    }
                                }
                            } else {
                                $scope.currentVersionId = $scope.versionList[0].version;
                            }
                            return { currentVersion: currentVersion, currentVersionId: $scope.currentVersionId };
                        }).then(currentVersionDraft => {
                            if (currentVersionDraft.currentVersion) {
                                $scope.deployVersionDraft = currentVersionDraft.currentVersion;
                            } else {
                                api.deployment.version.getVersionById(deployId, currentVersionDraft.currentVersionId).then(versionDraft => {
                                    $scope.deployVersionDraft = versionDraft;
                                });
                            }
                        }).catch((error) => { console.error(error); }).then(() => { $scope.isLoadingDetail = false; });
                    }).catch((error) => {
                        console.log(error);
                        $scope.isLoadingDetail = false;
                        if ($scope.storageId) {
                            $scope.goBackStorage(); //返回存储
                        } else {
                            $state.go(goBackUrl, goBackParam);
                        }
                    });
                };
                initVersion();
                $scope.toggleVersion = function (versionId) {
                    $scope.currentVersionId = versionId;
                    api.deployment.version.getVersionById(deployId, versionId).then(versionDraft => {
                        $scope.deployVersionDraft = versionDraft;
                    });
                };
                //判断当前版本是否显示废弃按钮
                $scope.mayDeprecate = function () {
                  if ($scope.config && $scope.config.currentVersions && $scope.config.currentVersions.length) {
                    return !$scope.config.currentVersions.some(version => version.version === $scope.currentVersionId);
                  } else {
                    return true;
                  }
                };
                const freshEvents = function () {
                    return api.deployment.getEvents(deployId).then(function (res) {
                        let eventList = res || [];
                        if (!$scope.eventList || $scope.eventList.length === 0) {
                            $scope.eventList = eventList;
                            eventList = null;
                            return true;
                        }
                        let responseLength = eventList.length;
                        let pageLength = $scope.eventList.length;

                        if (responseLength > pageLength) {
                            for (let i = 0; i < responseLength; i++) {
                                Object.assign($scope.eventList[i], eventList[i]);
                            }
                        }
                        eventList = null;
                        return true;
                    }).catch(function () {
                        return true;
                    });
                };
                freshEvents();

                $scope.getEvents = function () {
                    if (!$scope.eventList) {
                        freshEvents();
                    }
                    if (timeoutEvent) {
                        $timeout.cancel(timeoutEvent);
                    }
                    timeoutEvent = $timeout(function () {
                        freshEvents().then(function () {
                            if ($state.$current.name === 'deployDetail.event') {
                                $scope.getEvents();
                            }
                        });
                    }, 4000);
                };
                
                const getDeployInstance = function() {
                    api.deployment.getInstances(deployId).then(function(res) {
                        $scope.instanceList = res;
                    });
                };
                function freshInstance(){
                    getDeployInstance();
                    timeoutInstance = $timeout(freshInstance, 4000);
                }
                freshInstance();

                const networkVisit = function (deployment) {
                  if (deployment.lbForDeploys) {
                    let isDefinedInner = true;
                    for(let loadBalance of deployment.lbForDeploys) {
                      if (loadBalance.lbType === 'INNER_SERVICE') {
                        isDefinedInner = false;
                        break;
                      } else if (loadBalance.lbType === 'EXTERNAL_SERVICE' && loadBalance.lbName === deployment.deployName) {
                        isDefinedInner = false;
                        break;
                      }
                    }
                    if (isDefinedInner) {
                      // lbForDeploy 已经按类型排序 INNER_SERVICE 类型在前面
                      deployment.lbForDeploys.unshift({
                        lbType: "INNER_SERVICE",
                        dnsName: "未设置",
                        serviceDraft: {
                          lbPorts: [],
                          sessionAffinity: '未设置',
                        },
                      })
                    }
                  }
                  $scope.showDeployNet = angular.copy(deployment);
                };
                const getInnerLoadBalance = function () {
                  $scope.isgetingLoadBalance = true;
                  api.deployment.getDeployLoadBalance(deployId).then(response => {
                    (response || []).forEach(lb => {
                      if (lb.lbType === 'INNER_SERVICE') {
                        $scope.innerServiceUpdateDraft.sessionAffinity = String(lb.serviceDraft.sessionAffinity);
                        $scope.innerServiceUpdateDraft.loadBalancerPorts = lb.serviceDraft.lbPorts;
                        }
                    });
                  }).catch(() => {}).then(() => { $scope.isgetingLoadBalance = false; });
                };
                $scope.innerServiceUpdateDraft = {
                  sessionAffinity: false,
                  loadBalancerPorts: [],
                };
                $scope.toggleEditLoadBalance = function (type) {
                    $scope.isEditLoadBalance = !$scope.isEditLoadBalance;
                  if(type === 'cancel') {
                    networkVisit($scope.config);
                  } else if (type === 'edit') {
                    getInnerLoadBalance();
                  }
                };
                $scope.updateLoadBalance = function () {
                  let hasNull = false;
                  for (let element of $scope.innerServiceUpdateDraft.loadBalancerPorts) {
                    if (element === undefined) {
                      hasNull = true;
                      break;
                    }
                  }
                  if (hasNull || $scope.innerServiceUpdateDraft.loadBalancerPorts.some(lbPort => lbPort.targetPort == null || lbPort.targetPort ==='')) {
                    dialog.alert('提示', '程序服务端口不能为空');
                    return;
                  }
                  $scope.isUpdatingLoadBalance = true;
                  api.deployment.updateLoadBalance($scope.showDeployNet.deployId, $scope.innerServiceUpdateDraft).then(response => {
                    initVersion(); //刷新
                    $scope.isEditLoadBalance = !$scope.isEditLoadBalance;
                  }).catch((error) => { dialog.error('修改失败', error.message || '修改访问设置时出现错误');
                  }).then(() => { $scope.isUpdatingLoadBalance = false; });
                };
                $scope.showHostByLabels = function () {
                    let nodeList = [];
                    let isLoadingNode = { loading: true };
                    const hostEnvLabelMap = {
                        TEST: { name: 'TESTENV', content: 'HOSTENVTYPE' },
                        PROD: { name: 'PRODENV', content: 'HOSTENVTYPE' }
                    };
                    let labelSelectors = angular.copy($scope.deployVersionDraft.labelSelectors);
                    labelSelectors = labelSelectors.filter(label => { return label.content !== 'HOSTENVTYPE' })
                        .concat(hostEnvLabelMap[$scope.deployVersionDraft.hostEnv]);
                    api.cluster.listNodeByLabels($scope.config.clusterId, labelSelectors).then(response => {
                        Array.prototype.push.apply(nodeList, response);
                    }).catch(() => {
                    }).then(() => {
                        isLoadingNode.loading = false;
                    });
                    dialog.common({
                        title: '主机列表',
                        buttons: dialog.buttons.BUTTON_OK,
                        value: { nodeList, isLoadingNode },
                        template: `
                    <form-container>
                    <form-table
                        ng-model="value.nodeList"
                        template="nodeListByLabelsTable"
                        columns="[
                            { text: '主机名', key: 'name', width: '30%' },
                            { text: 'IP地址', key: 'ip', width: '30%' },
                            { text: '实例个数', key: 'runningPods', width: '20%' },
                            { text: '状态', key: 'status', width: '20%' },
                        ]"
                        empty-text="{{ value.isLoadingNode.loading ? '加载中...' : '无主机信息' }}"
                    ></form-table>
                    </form-container>
                    <script type="text/ng-template" id="nodeListByLabelsTable">
                        <div ng-if="column.key === 'name'" ng-bind="value"></div>
                        <div ng-if="column.key === 'ip'" ng-bind="value"></div>
                        <div ng-if="column.key === 'runningPods'" ng-bind="value"></div>
                        <div ng-if="column.key === 'status'" ng-bind="value"></div>
                    </script>
                    `,
                        size: 600
                    });
                };
                // 废弃版本可删除数据卷
                $scope.deprecateVersion = function (versionId) {
                    dialog.continue('废弃版本', '是否废弃version' + versionId + '！').then(button => {
                        if (button !== dialog.button.BUTTON_OK) throw ''
                    }).then(function () {
                        $scope.isWaitingDeprecate = true;
                        api.deployment.version.deprecateVersion(deployId, versionId).then(function () {
                            initVersion();
                            dialog.tip('提示', '废弃完成！');
                        }).catch(function (res) {
                            dialog.error('操作失败！', res.message || '废弃版本时出现错误');
                        }).then(function () {
                            $scope.isWaitingDeprecate = false;
                        });
                    });
                };
                // 还原废弃版本
                $scope.recoverDeprecateVersion = function (versionId) {
                    $scope.isWaitingDeprecate = true;
                    api.deployment.version.recoverDeprecateVersion(deployId, versionId).then(function () {
                        initVersion();
                        dialog.tip('提示', 'version' + versionId + '完成还原！');
                    }).catch(function (res) {
                        dialog.error('操作失败！', res.message || '还原版本时出现错误');
                    }).then(function () {
                        $scope.isWaitingDeprecate = false;
                    });
                };
                // 以上方法调用的接口已重构到 backend
                $scope.editDescription = {
                    text: null
                };
                let oldDescription = null;
                $scope.toggleIsEditDesc = function () {
                    oldDescription = $scope.config.description;
                    $scope.editDescription.text = $scope.config.description;
                    $scope.isEditDesc = !$scope.isEditDesc;
                };
                $scope.saveDescription = function () {
                    $scope.isEditDesc = false;
                    $scope.config.description = $scope.editDescription.text;
                    api.deployment.updateDeploymentDescription(deployId, $scope.config.description).then(function (res) {
                        oldDescription = null;
                    }).catch(function (resError) {
                        $scope.config.description = oldDescription;
                        dialog.error('修改失败', resError.message || '修改时出现错误');
                    }).then(() => {
                        $scope.isEditDesc = false;
                    });
                };

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
                                        <span ng-repeat="versionItem in deployInfo.currentVersions" ng-cloak>version{{versionItem.version}}&nbsp;</span>
                                    </form-input-container>
                                </form-config-item>
                                <form-config-item config-title="选择version" required>
                                    <form-input-container>
                                        <form-select ng-model="deployInfo.version" name="versionSelector" options="versionList" show-search-input="never" placeholder="选择version" is-loading="isLoadingVersionList" loading-text="正在获取版本信息" empty-text="无相关信息" required></form-select>
                                        <form-error-message form="versionDialog" target="versionSelector" type="required">请选择版本</form-error-message>
                                    </form-input-container>
                                </form-config-item>
                                <form-config-item config-title="启动实例个数" required>
                                    <form-input-container>
                                        <input min="1" max="999" ng-model="deployInfo.replicas" type="number" style="width:100%;"/>
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
                            }).catch((error) => {
                                dialog.error('查询失败', error.message);
                            }).then(() => {
                                $dialogscope.isLoadingVersionList = false;
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
                }

                function scaleDialog(deployInfo, status) {
                    if (deployInfo.deploymentType !== 'DAEMONSET') {
                        return dialog.common({
                            title: '扩容缩容',
                            buttons: dialog.buttons.BUTTON_OK_CANCEL,
                            template: `
                            <form name="scaleDialog">
                                <form-container left-column-width="100px">
                                    <form-config-group>
                                        <form-config-item config-title="当前实例个数">
                                            <span>{{deployInfo.currentReplicas+'个'}}</span>
                                        </form-config-item>
                                        <form-config-item config-title="实例个数">
                                            <form-input-container>
                                                <input ng-model="deployInfo.replicas" type="number" name="replicasNumber" min=1 max=999 style="width:200px;"/>
                                                <span>个</span>
                                            </form-input-container>
                                        </form-config-item>
                                    </form-config-group>
                                </form-container>
                            </form>
                            `,
                            size: 540,
                            controller: ['$scope', function ($dialogscope) {
                                $dialogscope.deployInfo = deployInfo;
                                $dialogscope.onbeforeclose = function (button) {
                                    if (button === dialog.button.BUTTON_OK) {
                                        if ($dialogscope.scaleDialog.$valid) {
                                            $dialogscope.resolve($dialogscope.deployInfo);
                                        }
                                    } else $dialogscope.resolve(null);
                                    return false;
                                };
                            }]
                        })
                    }
                    else {
                        return dialog.common({
                            title: '扩容缩容',
                            buttons: dialog.buttons.BUTTON_OK_CANCEL,
                            template: `
                            <form name="scaleDialog">
                                <form-container left-column-width="80px">
                                    <form-config-group>
                                        <form-config-item config-title="主机标签">
                                            <form-input-container>
                                                <host-label-selector ng-model="deployInfo.labelSelectors.label" host-env="deployInfo.hostEnv" cluster="deployInfo.cluster"></host-label-selector>
                                            </form-input-container>
                                        </form-config-item>
                                    </form-config-group>
                                </form-container>
                            </form>
                            `,
                            size: 600,
                            controller: ['$scope', function ($dialogscope) {
                                $dialogscope.deployInfo = deployInfo;
                                $dialogscope.onbeforeclose = function (button) {
                                    if (button === dialog.button.BUTTON_OK) {
                                        if ($dialogscope.scaleDialog.$valid) {
                                            const hostEnvLabelMap = {
                                                TEST: { name: 'TESTENV', content: 'HOSTENVTYPE' },
                                                PROD: { name: 'PRODENV', content: 'HOSTENVTYPE' }
                                            };
                                            $dialogscope.deployInfo.labels = ($dialogscope.deployInfo.labelSelectors.label || []).filter(label => { return label.content !== 'HOSTENVTYPE' }).concat(hostEnvLabelMap[$dialogscope.deployInfo.hostEnv]);
                                            $dialogscope.resolve($dialogscope.deployInfo);
                                        }
                                    } else $dialogscope.resolve(null);
                                    return false;
                                };
                            }]
                        })
                    }
                }

                function checkSaleDialog(deployInfo, status) {
                    return scaleDialog(deployInfo, status).then(result => {
                        if (deployInfo.deploymentType !== 'DAEMONSET' && result && result.currentReplicas === result.replicas) {
                            throw '实例个数无变化！';
                        }
                        return result;
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
                        'UPSCALING': '中断扩容，部署实例数会处于中断时的个数，是否继续？',
                        'DOWNSCALING': '中断缩容，部署实例数会处于中断时的个数，是否继续？',
                    })[status];
                    return dialog.continue('中断操作', promptTxt).then(button => {
                        if (button !== dialog.button.BUTTON_OK) return null;
                        return deployInfo;
                    })
                }

                let actionMap = {
                    recover: { waitingTxt: 'isWaitingRecover', action: 'rollback', name: '恢复', dialog: versionListDialog },
                    start: { waitingTxt: 'isWaitingStart', action: 'start', name: '启动', dialog: versionListDialog },
                    update: { waitingTxt: 'isWaitingUpVersion', action: 'update', name: '升级', dialog: checkVersionListDialog },
                    scale: { waitingTxt: 'isWaitingScale', action: 'scale', name: '扩容/缩容', dialog: checkSaleDialog },
                    stop: { waitingTxt: 'isWaitingStop', action: 'stop', name: '停止', dialog: stopDialog },
                    abort: { waitingTxt: 'isWaitingOperation', action: 'abort', name: '中断', dialog: abortDialog },
                }

                $scope.operate = function (type, status = null) {
                    let deployInfo = {
                        id: $scope.config.deployId,
                        version: null,
                        currentVersions: $scope.config.currentVersions,
                        currentVersion: $scope.config.currentVersions.length && $scope.config.currentVersions[0].version || null,
                        replicas: $scope.config.defaultReplicas,
                        currentReplicas: $scope.config.currentReplicas,
                        labelSelectors: { label: $scope.config.currentVersions.length && $scope.config.currentVersions[0].labelSelectors || [] },
                        hostEnv: $scope.config.currentVersions.length && $scope.config.currentVersions[0].hostEnv || '',
                        labels: [],
                        deploymentType: $scope.config.deploymentType,
                        cluster: { id: $scope.config.clusterId },
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
                            initVersion();
                            let tiptxt = '已提交，正在'+ actionMap[type].name + '。';
                            if(response && 'tip' in response){
                                tiptxt = response.tip;
                            }
                            return dialog.tip(tiptxt,'');
                        }).catch(error => {
                            if (error.response && error.response.data.resultCode === 1007) {
                                return dialog.continue('警告！', '监听器状态异常，请点击确定进入详情页进行配置').then(function (res) {
                                    if (res === dialog.button.BUTTON_OK) {
                                        $state.go('clusterDetail.watcher', { id: $scope.config.clusterId });
                                    }
                                });
                            } else {
                                return dialog.error(actionMap[type].name + '失败', error.message);
                            }
                        }).then(() => {
                            $scope[actionMap[type].waitingTxt] = false;
                        });
                    }).catch(e => {
                        $scope[actionMap[type].waitingTxt] = false;
                        return dialog.error('警告',e);
                    })
                };

                //重启
                $scope.restart = function(instanceName){
                    let instanceInfo ={
                        id:deployId,
                        instanceName:instanceName,
                    }
                    dialog.continue('确认重启实例', `您将要对实例${instanceName}进行重启，重启后原实例将被关闭，确认要重启吗？`).then(buttonResponse => {
                        if (buttonResponse !== dialog.button.BUTTON_OK)
                            throw '';
                        api.deployment.action.restart(instanceInfo)
                        .then()
                        .catch((resError)=>{
                            dialog.error('操作失败', resError.message);
                        })
                    });  
                }

                $scope.showLog = function (instanceName, containers) {
                    $modal.open({
                        templateUrl: 'index/tpl/modal/instanceLogModal/instanceLogModal.html',
                        controller: 'InstanceLogModalCtr',
                        size: 'md',
                        resolve: {
                            instanceInfo: function () {
                                return {
                                    clusterId: $scope.config.clusterId,
                                    namespace: $scope.config.namespace,
                                    instanceName: instanceName,
                                    containers: containers
                                };
                            }
                        }
                    });
                };

                // $scope.toUpdate = function() {
                //     if ($scope.editConfig.versionType === 'CUSTOM' && $scope.editConfig.containerDrafts.length === 0) {
                //         $domePublic.openWarning('请至少选择一个镜像！');
                //     } else {
                //         $scope.isWaitingUpdate = true;
                //         $scope.valid.needValid = false;
                //         $scope.deployEditIns.createVersion($scope.watcherInfo).then(function(msg) {
                //             $scope.deployIns.freshVersionList();
                //             if (msg == 'update') {
                //                 initVersion();
                //             }
                //         }).finally(function() {
                //             $scope.isWaitingUpdate = false;
                //         });
                //     }
                // };

                /**
                 * 接口调用backend api
                 */
                $scope.deleteDeploy = function () {
                  api.deployment.getDeployLoadBalance(deployId).then(response => {
                    let hasLoadBalance = (response || []).some(loadBalance => loadBalance.lbType === 'NGINX' || loadBalance.lbType === 'EXTERNAL_SERVICE');
                    let promptText = hasLoadBalance ? '此部署已关联负载均衡，是否删除？' : '确定要删除？';
                    dialog.danger('确认删除', promptText).then(button => { if (button !== dialog.button.BUTTON_OK) throw '' }).then(function () {
                      api.deployment.delete($scope.config.deployId).then(function () {
                            dialog.tip('提示', '删除成功！');
                            let backend = { id: $scope.collectionId, name: $scope.collectionName };
                            if ($scope.collectionName === 'all-deploy') {
                                $state.go('deployAllManage', backend);
                            } else {
                                $state.go('deployManage', backend);
                            }
                        }).catch(function (res) {
                            dialog.error('删除失败！', res.message);
                        });
                    });
                  }).catch((error) => {
                      console.log('delete deploy：', error.message);
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
                                    resourceId: deployId,
                                    type: 'DEPLOY'
                                };
                            }
                        }
                    });
                };

                $scope.updateSuccess = function () {
                    initVersion();
                };

                stateInfo = $state.$current.name;
                if (stateInfo.indexOf('update') !== -1) {
                    $scope.tabActive[1].active = true;
                } else if (stateInfo.indexOf('event') !== -1) {
                    $scope.tabActive[2].active = true;
                    $scope.getEvents();
                } else if (stateInfo.indexOf('instance') !== -1) {
                    $scope.tabActive[3].active = true;
                } else if (stateInfo.indexOf('network') !== -1) {
                    $scope.tabActive[4].active = true;
                } else if (stateInfo.indexOf('user') !== -1) {
                    $scope.tabActive[5].active = true;
                } else {
                    $scope.tabActive[0].active = true;
                }
                $scope.$on('$destroy', function () {
                    if (timeout) {
                        $timeout.cancel(timeout);
                    }
                    if (timeoutEvent) {
                        $timeout.cancel(timeoutEvent);
                    }
                    if (timeoutInstance) {
                        $timeout.cancel(timeoutInstance);
                    }
                });
            }]);
})(angular.module('domeApp'));

; (function (formInputs) {
    /**
     * <update-deployment-detail> 升级部署
     * dependents file: index/common/deploymentComponent/deploymentComponent.es
     *
     * clusterId: 集群ID
     * deploymentId: 部署ID
     * versionId: 部署版本
     * deploymentStatus: 部署状态， 用于判断是否可以升级
     * defaultReplicas: 默认实例数，用于升级
     * onUpdateSuccess: 回调函数，用于新建版本后，刷新页面
     * versionType: 版本的类型（CUSTOM,YAML,JSON），用于显示页面类型
     *
     */
    formInputs.component('updateDeploymentDetail', {
        template: `
         <style>
         .form-array-container-deployment .form-array-item-deployment {
            position: relative;
            padding-right: 40px;
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 0 40px 0 0;
            margin: 0 0 20px 0;
          }
         .form-array-item-hide{
            cursor: pointer;
            margin: auto;
            bottom: 0;
            height: 22px;
            width: 56px;
            text-align: center;
            border-radius: 3px 3px 0 0;
            border: 1px solid #ddd;
            border-bottom: 0;
            line-height: 20px;
         }
         .form-container-outer{
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 0 10px;
            margin: 3px 0;
            }
         </style>
         <form-container left-column-width="120px">
          <form name="$ctrl.updateDeploymentForm">
          
            <form-config-group ng-if="$ctrl.versionType === 'YAML' || $ctrl.versionType === 'JSON'">
              <form-config-item config-title="{{ ({'YAML': 'YAML配置', 'JSON' : 'JSON配置'}[$ctrl.deploymentVersionDraft.versionType]) }}">
                <form-input-container>
                    <div class="info-content" style="margin-top: 10px">
                        <div class="config-input-group-label">
                          <div class="config-input-group">
                            <div class="config-input-group-top code-area" style="line-height: 20px" ng-bind="$ctrl.deploymentVersionDraft.versionString.deploymentStrHead"></div>
                            <div class="config-input-group-textarea-tip" style="text-align: right;margin-top: -20px">
                                <a ng-click="$ctrl.setPodStrToDefault()" href="javascript:void 0;" ng-if="$ctrl.podStrUndoText === null &amp;&amp; $ctrl.deploymentVersionDraft.versionType === 'YAML'">YAML配置样例</a>
                                <a ng-click="$ctrl.setPodStrToDefault()" href="javascript:void 0;" ng-if="$ctrl.podStrUndoText === null &amp;&amp; $ctrl.deploymentVersionDraft.versionType === 'JSON'">JSON配置样例</a>
                                <a ng-click="$ctrl.undoPodStrToDefault()" href="javascript:void 0;" ng-if="$ctrl.podStrUndoText !== null">撤销</a>
                            </div>
                            <codearea ng-model="$ctrl.deploymentVersionDraft.versionString.podSpecStr" language="{{ ($ctrl.deploymentVersionDraft.versionType).toLowerCase() }}" name="dockerFileConfig" ng-change="$ctrl.clearPodStrUndoText()" height="20,50"></codearea>
                            <div class="config-input-group-bottom code-area" ng-bind="$ctrl.deploymentVersionDraft.versionString.deploymentStrTail"></div>
                          </div>
                        </div>
                    </div>
                   </form-input-container>
              </form-config-item>
            </form-config-group>
           <div ng-if="$ctrl.versionType === 'CUSTOM'">
            <div style="display: flex; margin: 20px 0;">
              <span style="padding: 0 10px; font-weight: bold;">镜像设置</span>
              <form-with-button width="80px" style="flex-grow: 1">
                <content-area>
                    <form-select ng-model="$ctrl.addingImage" name="addingImage" options="$ctrl.imageSelectorList" on-change="$ctrl.addImage()" placeholder="请选择镜像，可多次选择添加多个镜像" empty-text="无相关信息"></form-select>
                </content-area>
                <button-area>
                     <button type="button" ng-click="$ctrl.addOtherImage()">其他镜像</button>
                </button-area>
              </form-with-button>
            </div>
            
           <div class="form-array-container-deployment">
            <div class="form-array-item-deployment" ng-repeat="imageDraft in $ctrl.deploymentVersionDraft.containerConsoles track by $index" ng-init="innerForm='form' + $index">
            
              <ng-form role="form" name="{{ innerForm }}">
                <div class="form-array-item-delete" ng-click="$ctrl.deleteImageDraft($index)" ng-if="$ctrl.deploymentVersionDraft.containerConsoles.length > 0">
                    <icon-close class="form-array-item-delete-icon"></icon-close>
                </div>
                <form-config-group>
                <div>
                  <form-config-item config-title="镜像仓库">
                    <form-input-container><span ng-bind="imageDraft.registry"></span></form-input-container>
                  </form-config-item>
                  <form-config-item config-title="镜像名称">
                    <form-input-container><span ng-bind="imageDraft.name"></span></form-input-container>
                  </form-config-item>
                  <form-config-item config-title="镜像版本" required="required">
                    <form-input-container>
                      <image-tag-selector ng-model="imageDraft.tag" form="updateDeployment[innerForm]" name="{{ innerForm + 'tag' }}" image="imageDraft" required></image-tag-selector>
                    </form-input-container>
                  </form-config-item>
                </div>
                <div ng-hide="!imageDraft.isCollapse">
                  <form-config-item config-title="自动部署">
                    <form-input-container>
                      <form-multiple-inline>
                        <form-multiple-inline-item style="flex: 0.2">
                          <form-input-checkbox ng-model="imageDraft.autoDeploy" name="{{ innerForm + 'autoDeploy' }}" value="true" value-false="false" appearance="switch"></form-input-checkbox>
                        </form-multiple-inline-item>
                        <form-multiple-inline-item><div style="display: inline-block;" class="form-help-text">开启后，通过项目构建产生该镜像的新版本时，会自动触发该部署升级。该功能只对运行中的部署有效。</div></form-multiple-inline-item>
                      </form-multiple-inline>
                    </form-input-container>
                  </form-config-item>
                  <form-config-item config-title="镜像拉取策略">
                    <form-input-container>
                      <form-input-radio-group ng-model="imageDraft.imagePullPolicy" name="{{ innerForm + 'pullPolicyType' }}" fallback-value="'Always'" options="$ctrl.imagePullPolicyRadioList" required="required"></form-input-radio-group>
                    </form-input-container>
                  </form-config-item>
                  <form-config-item config-title="挂载存储">
                    <form-input-container>
                      <volume-mount-storage ng-model="imageDraft.volumeMountConsoles" name="{{ innerForm + 'volumeMount' }}" cluster="$ctrl.cluster" namespace="$ctrl.namespace" container-consoles="$ctrl.deploymentVersionDraft.containerConsoles" container-index="{{ $index }}" image-name="{{ imageDraft.name }}"></volume-mount-storage>
                    </form-input-container>
                  </form-config-item>
                  <form-config-item config-title="配置管理">
                    <form-input-container>
                      <volume-mount-configmap ng-model="imageDraft.configConsoles" name="{{ innerForm + 'configMap'}}" cluster="$ctrl.cluster" namespace="$ctrl.namespace"></volume-mount-configmap>
                      <form-error-message form="updateDeployment[innerForm]" target="{{ innerForm + 'configMap'}}">配置不能为空，请选择配置</form-error-message>
                    </form-input-container>
                  </form-config-item>
                  <form-config-item config-title="启动命令">
                     <form-input-container>
                        <input ng-model="imageDraft.commands" type="text" name="{{ innerForm + 'commands'}}" cluster="deploymentDraft.cluster" placeholder="启动命令不能包含启动参数，示例/sbin/dumb-init、docker-entrypoint.sh" />
                    </form-input-container>
                 </form-config-item>                
                <form-config-item config-title="启动参数">
                    <form-input-container>
                        <form-array-container ng-model="imageDraft.args" template="envInputargs" max-length="100" min-length="0" type="simple">
                        </form-array-container>
                    </form-input-container>
                </form-config-item>
                 <script type="text/ng-template" id="envInputargs">
                    <form-multiple-inline>
                        <form-multiple-inline-item>
                            <input ng-model="$ctrl.ngModel[$index]" type="text" name="argsValue{{$index}}"  required max-length="100" min-length="0" placeholder="用于设置启动命令所需的参数，一个输入框中仅能添加一个启动参数"/>
                        </form-multiple-inline-item>
                    </form-multiple-inline>
                 </script>
                  <form-config-item config-title="运行过程环境变量">
                    <form-input-container>
                      <form-table ng-if="imageDraft.oldEnv && imageDraft.oldEnv.length > 0" ng-model="imageDraft.oldEnv" template="existentEnvTable" columns="[
                        { text: '环境变量名', key: 'key' },
                        { text: '环境变量值', key: 'value' },
                        { text: '描述', key: 'description'},
                        ]">
                      </form-table>
                      <script type="text/ng-template" id="existentEnvTable">
                        <div ng-if="column.key === 'key'" ng-bind="value"></div>
                        <div ng-if="column.key === 'value'">
                          <input type="text" ng-model="value"/>
                        </div>
                        <div ng-if="column.key === 'description'" ng-bind="value"></div>
                      </script>
                      <form-array-container ng-model="imageDraft.newEnv" template="envInput" max-length="100" min-length="0" type="simple"></form-array-container>
                      <script type="text/ng-template" id="envInput">
                        <form-multiple-inline>
                          <form-multiple-inline-item>
                            <input ng-model="$ctrl.ngModel[$index].key" type="text" name="envKey{{$index}}" required="required" ng-pattern="/^[A-Za-z_][A-Za-z0-9_]*$/" placeholder="环境变量名"/>
                          </form-multiple-inline-item>
                          <form-multiple-inline-item style="margin-left: 6px">
                            <input ng-model="$ctrl.ngModel[$index].value" type="text" name="envValue{{$index}}" required="required" placeholder="环境变量值"/>
                          </form-multiple-inline-item>
                          <form-multiple-inline-item style="margin-left: 6px">
                            <input ng-model="$ctrl.ngModel[$index].description" type="text" name="envDescription{{$index}}" placeholder="描述信息" />
                          </form-multiple-inline-item>
                        </form-multiple-inline>
                      </script>
                    </form-input-container>
                  </form-config-item>
                  <form-config-item config-title="容器大小" required="required">
                    <form-input-container><span style="margin-right: 20px"><span>CPU(个)</span>
                        <input ng-model="imageDraft.cpu" type="number" step="0.1" min="0" name="{{ innerForm + 'imageCpu' }}" required="required" ng-pattern="/^(([0-9]+.[0-9]*[0-9][0-9]*)|([0-9]*[0-9][0-9]*.[0-9]+)|([0-9]*[0-9][0-9]*))$/"/></span><span style="margin-right: 20px"><span>内存(MB)</span>
                        <input ng-model="imageDraft.mem" type="number" min="0" name="{{ innerForm + 'imageMemory' }}" required="required" ng-pattern="/^[0-9]\\d*$/"/></span></form-input-container>
                  </form-config-item>
                  <form-config-item config-title="健康检查">
                    <form-input-container help-text="根据配置的检查规则来判定部署实例是否健康，如果不健康就重启该部署实例。">
                      <form-input-radio-group ng-model="imageDraft.healthChecker.type" name="{{ innerForm + 'healthCheckerType' }}" fallback-value="'NONE'" options="$ctrl.imageHealthCheckerRadioList" required="required"></form-input-radio-group>
                      <sub-form-container left-column-width="105px" ng-if="$ctrl.isDisplayChecker(imageDraft,'healthChecker')">
                        <form-config-group>
                          <form-config-item config-title="检查端口">
                            <form-input-container>
                              <input ng-model="imageDraft.healthChecker.port" type="number" min="1" max="65535" style="width:100%;" name="{{ innerForm + 'healthCheckerPort' }}" placeholder="请输入端口号" required="required"/>
                            </form-input-container>
                          </form-config-item>
                          <form-config-item config-title="超时时间(s)">
                            <form-input-container>
                              <input ng-model="imageDraft.healthChecker.timeout" type="number" min="1" name="{{ innerForm + 'healthCheckerTimeout' }}" placeholder="超过时间达到规定阈值，则健康检查判定为异常" required="required" style="width:100%" ng-pattern="/^[1-9]\\d*$/"/>
                            </form-input-container>
                          </form-config-item>
                          <form-config-item config-title="首次检测延迟(s)">
                            <form-input-container>
                              <input ng-model="imageDraft.healthChecker.delay" type="number" min="1" name="{{ innerForm + 'healthCheckerDelay' }}" placeholder="容器启动后延迟规定秒数，再开始健康检查" required="required" style="width:100%" ng-pattern="/^[1-9]\\d*$/"/>
                            </form-input-container>
                          </form-config-item>
                           <form-config-item config-title="检查周期(s)">
                            <form-input-container>
                              <input  placeholder='健康检查的时间间隔' ng-model="imageDraft.healthChecker.periodSeconds" type="number" min="1" name="{{ innerForm + 'healthCheckerPeriodSeconds' }}"  required="required" style="width:100%"/>
                            </form-input-container>
                          </form-config-item>
                          <form-config-item config-title="检查次数">
                            <form-input-container help-text="健康检查连续失败次数达到阈值，健康检查判断为异常；健康检查连续成功次数达到阈值，健康检查判断为正常" help-text-position="bottom">
                                 <form-multiple-inline>
                                         <form-multiple-inline-item style="flex:1")>
                                            <span style="margin-right: 1ch;">失败次数</span>
                                            <input ng-model="imageDraft.healthChecker.failureThreshold" type="number" min="1" name="{{innerForm + 'healthCheckerFailureThreshold' }}" style="width: 48%;" required/>                                       
                                         </form-multiple-inline-item>
                                         <form-multiple-inline-item style="flex:1")>
                                            <span>成功次数：1</span>
                                         </form-multiple-inline-item>
                                 </form-multiple-inline>
                            </form-input-container>
                          </form-config-item>
                          <form-config-item config-title="检测URL" ng-if="$ctrl.isDisplayCheckerUrl(imageDraft, 'healthChecker')">
                            <form-input-container>
                              <input ng-model="imageDraft.healthChecker.url" type="text" name="{{ innerForm + 'healthCheckerUrl' }}" placeholder="请输入URL" required="required"/>
                            </form-input-container>
                          </form-config-item>
                          <form-config-item config-title="允许返回值" ng-if="$ctrl.isDisplayCheckerStatusCode(imageDraft, 'healthChecker')">
                            <form-input-container><span>200-400(不包含400)</span></form-input-container>
                          </form-config-item>
                        </form-config-group>
                      </sub-form-container>
                    </form-input-container>
                  </form-config-item>
                  <form-config-item config-title="就绪性检查">
                    <form-input-container help-text="根据配置的规则来检查实例能否访问；配置该项时，通过对内服务或对外服务访问部署时，请求只被转发到就绪状态的实例；非就绪状态的实例不会被重启。">
                      <form-input-radio-group ng-model="imageDraft.readinessChecker.type" name="{{ innerForm + 'readinessCheckerType' }}" fallback-value="'NONE'" options="$ctrl.imageReadinessCheckerRadioList" required></form-input-radio-group>
                      <sub-form-container left-column-width="105px" ng-if="$ctrl.isDisplayChecker(imageDraft,'readinessChecker')">
                        <form-config-group>
                          <form-config-item config-title="检查端口">
                            <form-input-container>
                              <input ng-model="imageDraft.readinessChecker.port" type="number" min="1" max="65535" style="width:100%;" name="{{ innerForm + 'readinessCheckerPort' }}" placeholder="请输入端口号" required/>
                            </form-input-container>
                          </form-config-item>
                          <form-config-item config-title="超时时间(s)">
                            <form-input-container>
                              <input ng-model="imageDraft.readinessChecker.timeout" type="number" min="1" name="{{ innerForm + 'readinessCheckerTimeout' }}" placeholder="超过时间达到规定阈值，则就绪性检查判定为异常" required style="width:100%"/>
                            </form-input-container>
                          </form-config-item>
                          <form-config-item config-title="首次检测延迟(s)">
                            <form-input-container>
                              <input ng-model="imageDraft.readinessChecker.delay" type="number" min="1" name="{{ innerForm + 'readinessCheckerDelay' }}" placeholder="容器启动后延迟规定秒数，再开始就绪性检查" required style="width:100%" />
                            </form-input-container>
                          </form-config-item>
                           <form-config-item config-title="检查周期(s)">
                            <form-input-container>
                              <input  placeholder='就绪性检查的时间间隔' ng-model="imageDraft.readinessChecker.periodSeconds" type="number" min="1" name="{{ innerForm + 'readinessCheckerPeriodSeconds' }}"  required style="width:100%"/>
                            </form-input-container>
                          </form-config-item>
                          <form-config-item config-title="检查次数">
                            <form-input-container help-text="就绪性检查连续失败次数达到阈值，就绪性检查判断为异常；就绪性检查连续成功次数达到阈值，就绪性检查判断为正常" help-text-position="bottom">
                                 <form-multiple-inline>
                                         <form-multiple-inline-item style="flex:1")>
                                            <span style="margin-right: 1ch;">失败次数</span>
                                            <input ng-model="imageDraft.readinessChecker.failureThreshold" type="number" min="1" name="{{innerForm + 'readinessCheckerFailureThreshold' }}" style="width: 48%;" required/>                                       
                                         </form-multiple-inline-item>
                                         <form-multiple-inline-item style="flex:1")>
                                            <span style="margin-right: 1ch;">成功次数</span>
                                            <input ng-model="imageDraft.readinessChecker.successThreshold" type="number" min="1" name="{{innerForm + 'readinessCheckerFailureThreshold' }}" style="width: 48%;" required/>
                                         </form-multiple-inline-item>
                                 </form-multiple-inline>
                            </form-input-container>
                          </form-config-item>
                          <form-config-item config-title="检测URL" ng-if="$ctrl.isDisplayCheckerUrl(imageDraft,'readinessChecker')">
                            <form-input-container>
                              <input ng-model="imageDraft.readinessChecker.url" type="text" name="{{ innerForm + 'readinessCheckerUrl' }}" placeholder="请输入URL" required/>
                            </form-input-container>
                          </form-config-item>
                          <form-config-item config-title="允许返回值" ng-if="$ctrl.isDisplayCheckerStatusCode(imageDraft,'readinessChecker')">
                            <form-input-container><span>200-400(不包含400)</span></form-input-container>
                          </form-config-item>
                        </form-config-group>
                      </sub-form-container>
                    </form-input-container>
                  </form-config-item>

                  <form-config-item config-title="日志">
                    <form-input-container>
                      <container-log ng-model="imageDraft.logItemDrafts" name="{{ innerForm + 'logItem' }}" cluster="$ctrl.cluster"></container-log>
                    </form-input-container>
                  </form-config-item>
                </div>  
                </form-config-group>
                <div class="form-array-item-hide" ng-click="$ctrl.toggleCollapseItem(imageDraft)">
                    <i class="icon-down-double" ng-class="{'up': imageDraft.isCollapse}"></i>
                </div>
              </ng-form>
              
             </div>
            </div>
                
              <div>
                <div style="padding: 0 10px; font-weight: bold;">部署设置</div>
                <div class="form-container-outer">
                    <form-config-group>
                        <form-config-item config-title="筛选主机">
                            <form-input-container>
                                <form-multiple-inline>
                                    <form-multiple-inline-item>
                                        <span>集群：</span><span ng-bind="$ctrl.deploymentVersionDraft.clusterName"></span>
                                    </form-multiple-inline-item>
                                    <form-multiple-inline-item>
                                        <span>工作场景：</span><span ng-bind="$ctrl.deploymentAppEnv[$ctrl.deploymentVersionDraft.hostEnv]"></span>
                                    </form-multiple-inline-item>
                                </form-multiple-inline>
                               <host-label-selector ng-model="$ctrl.deploymentVersionDraft.labelSelectors" host-env="$ctrl.deploymentVersionDraft.hostEnv" cluster="$ctrl.cluster"></host-label-selector>
                            </form-input-container>
                        </form-config-item>
                        <form-config-item config-title="网络模式">
                            <form-input-container>
                                <span ng-bind="$ctrl.deploymentVersionDraft.networkMode === 'HOST' ? 'HOST' : 'Overlay'"></span>
                            </form-input-container>
                        </form-config-item>
                    </form-config-group>
                </div>
              </div>
            </div>
            <form-config-group ng-if="$ctrl.hasUpdatePermission">
                <form-config-item>
                <form-input-container>
                    <form-submit-button form="$ctrl.updateDeploymentForm" on-submit="$ctrl.updateDeployment()">提交升级设置</form-submit-button>
                </form-input-container>
            </form-config-group>    
          </form>
        </form-container>
        `,
        bindings: {
            // ngModel: '=',
            clusterId: '<?',
            namespace: '<?',
            deploymentId: '<?',
            versionId: '<?',
            deploymentStatus: '<?',
            defaultReplicas: '<?',
            onUpdateSuccess: '&?',
            versionType: '<?',
            clusterLog: '<?',
            hasUpdatePermission: '<?',
        },
        controller: ['$scope', '$timeout', 'api', 'dialog', function ($scope, $timeout, api, dialog) {
            const $ctrl = this;
            $ctrl.addingImage = null;
            $ctrl.deploymentAppEnv = { TEST: '测试环境', PROD: '生产环境' };
            $ctrl.imagePullPolicyRadioList = [
                { value: 'Always', text: 'Always' },
                { value: 'Never', text: 'Never' },
                { value: 'IfNotPresent', text: 'If Not Present' },
            ];
            $ctrl.imageHealthCheckerRadioList = $ctrl.imageReadinessCheckerRadioList = [
                { value: 'NONE', text: 'NONE' },
                { value: 'TCP', text: 'TCP检查' },
                { value: 'HTTP', text: 'HTTP检查' },
            ];
            
            $ctrl.isDisplayChecker = function (imageDraft,checkType) {
                return imageDraft[checkType].type !== "NONE";
            };
            $ctrl.isDisplayCheckerUrl = function (imageDraft,checkType) {
                return imageDraft[checkType].type === "HTTP";
            };
            $ctrl.isDisplayCheckerStatusCode = function (imageDraft,checkType) {
                return imageDraft[checkType].type === "HTTP";
            };
            $ctrl.toggleCollapseItem = function (imageDraft) {
                imageDraft.isCollapse = !imageDraft.isCollapse;
            };
            function initImageList() {
                api.image.privateRegistry.list().then(response => {
                    $ctrl.imageSelectorList = (response || []).map(function (image) {
                        return {
                            text: image.name,
                            value: { name: image.name, registry: image.registry, envSettings: image.envSettings },
                            remark: image.registry,
                        }
                    });
                });
            }

            initImageList();
            const pushContainerDraftList = function (image) {
                if (image) {
                    $ctrl.deploymentVersionDraft.containerConsoles.push(angular.copy({
                        name: image.name,
                        registry: image.registry,
                        cpu: 0.5,
                        mem: 1024,
                        tag: image.tag ? image.tag : null,
                        oldEnv: image.envSettings || [],
                        newEnv: [],
                        healthChecker: {
                            type: 'NONE',
                            failureThreshold:3,
                        },
                        readinessChecker: {
                            type: 'NONE',
                            failureThreshold:3,
                            successThreshold:1,
                        },
                        imagePullPolicy: 'Always',
                        autoDeploy: false,
                        logItemDrafts: [],
                        volumeMountConsoles: [],
                        configConsoles: [],
                    }));
                    $ctrl.addingImage = null; //清空选择镜像
                }
            };
            $ctrl.addImage = function () {
                $timeout(function () {
                    let image = $ctrl.addingImage;
                    pushContainerDraftList(image);
                }, 0);
            };

            $ctrl.deleteImageDraft = function (index) {
                $ctrl.deploymentVersionDraft.containerConsoles.splice(index, 1);
            };
            const onUpdateSuccess = function () {
                $ctrl.onUpdateSuccess();
            };
            $ctrl.updateDeployment = function () {
                console.log('update deploy:', $ctrl.deploymentVersionDraft);
                if ($ctrl.deploymentVersionDraft.containerConsoles.length === 0) {
                    dialog.alert(' 警告', '请至少选择一个镜像');
                    return;
                }
                let currentDeployId = $ctrl.deploymentVersionDraft.deployId;
                let responseVersionId = null;
                let value = {replicas: $ctrl.defaultReplicas, newVersionId: ''};
                let createdeploymentVersion =  api.deployment.version.createVersion(currentDeployId, $ctrl.deploymentVersionDraft).then(response => {
                    responseVersionId = response;
                    value.newVersionId = response;
                })
                createdeploymentVersion.catch((exception) => {
                    dialog.error('创建新版本失败', exception.message);
                })
                createdeploymentVersion.then(() => {
                    onUpdateSuccess(); //更新部署详情
                    
                    $ctrl.updateDeploymentForm.$submitted = false;
                    if ($ctrl.deploymentStatus !== 'RUNNING') {
                        dialog.alert('新建部署版本', '成功新建部署版本：version' + value.newVersionId + ', 当前为' + $ctrl.deploymentStatus + '状态，非运行状态不能升级。');
                    } else {
                        dialog.common({
                            title: '升级版本',
                            buttons: [
                                { text: '暂不升级', value: dialog.button['BUTTON_CANCEL'], secondary: false },
                                { text: '继续升级', value: dialog.button['BUTTON_OK'] }
                            ],
                            value: value,
                            template: `
                            <form-container left-column-width="60px">
                            <form name="replicasDialog" ng-class="{'need-valid':replicasDialog.$submitted}">
                                <form-config-group>
                                    <div>成功新建部署版本: version{{ value.newVersionId }}，是否升级到新版本？</div>
                                    <form-config-item config-title="实例个数" required>
                                        <form-input-container>
                                            <input style="width: 150px;" type="number" min="1" name="replicas" ng-model="value.replicas" required ng-pattern="/^[1-9]\\d*$/">
                                        </form-input-container>
                                    </form-config-item>
                                </form-config-group>
                            </form>
                            </form-container>
                            `,
                            size: 400,
                        }).then((response) => {
                            if (response == dialog.button.BUTTON_OK) {
                                if (!value.replicas || !angular.isNumber(value.replicas)) {
                                    dialog.alert('错误信息', '实例个数输入格式错误');
                                    return;
                                }
                                dialog.tip('提示', '升级中，请查看部署状态！');
                                api.deployment.action.updateDeployment(currentDeployId, responseVersionId, value.replicas).then(response => {
                                    onUpdateSuccess();
                                }).catch(exception => {
                                    dialog.error('升级失败', exception.message);
                                });
                            }
                        });
                    }
                });
            };
            const getVersionDraft = function () {
                if ($ctrl.deploymentId && $ctrl.versionId) {
                    api.deployment.version.getVersionById($ctrl.deploymentId, $ctrl.versionId).then(response => {
                        $ctrl.deploymentVersionDraft = response;
                    });
                }
            };
            const getCluster = function () {
                if ($ctrl.clusterId) {
                    // 无集群权限的用户无法使用getClusterById接口，因此删除
                    // api.cluster.getClusterById($ctrl.clusterId).then(response => {
                    //     $ctrl.cluster = response;
                    // }).catch(() => {
                    // });
                    //  根据clusterLog判断集群是否开启日志
                    $ctrl.cluster = { id: $ctrl.clusterId, clusterLog: $ctrl.clusterLog }
                }
            };
            $scope.$watch('$ctrl.clusterId', getCluster);
            $scope.$watch('$ctrl.deploymentId', getVersionDraft);
            $scope.$watch('$ctrl.versionId', getVersionDraft);

            $ctrl.addOtherImage = function () {
                let otherImage = { name: '', registry: '', tag: '' };
                dialog.common({
                    title: '添加其他镜像',
                    buttons: dialog.buttons.BUTTON_OK_CANCEL,
                    value: { otherImage },
                    template: `
                    <form name="otherImageDialog" ng-class="{'need-valid':otherImageDialog.$submitted}">
                        <form-container left-column-width="60px">
                            <form-config-group>
                                <form-config-item config-title="仓库地址" required>
                                    <form-input-container>
                                        <input type="text" name="registry" ng-model="value.otherImage.registry" required>
                                    </form-input-container>
                                </form-config-item>
                                <form-config-item config-title="镜像名称" required>
                                    <form-input-container>
                                        <input type="text" name="name" ng-model="value.otherImage.name" required>
                                    </form-input-container>
                                </form-config-item>
                                <form-config-item config-title="镜像版本" required>
                                    <form-input-container>
                                        <input type="text" name="tag" ng-model="value.otherImage.tag" required>
                                    </form-input-container>
                                </form-config-item>
                            </form-config-group>
                        </form-container>
                    </form>
                    `,
                    size: 540,
                }).then((response) => {
                    if (response === dialog.button.BUTTON_OK) {
                        if (!otherImage.name || !otherImage.registry || !otherImage.tag) return;
                        pushContainerDraftList(otherImage);
                    }
                });
            };

            $ctrl.podStrUndoText = null;
            // podSpecStr 文件内容
            const defaultVersionString = {
                'YAML': 'containers:\n- image: \"pub.domeos.org/registry:2.3\"\n  name: \"test-container\"\n  volumeMounts:\n  - mountPath: \"/test-hostpath\"\n    name: \"test-volume\"\nvolumes:\n- hostPath:\n    path: \"/opt/scs\"\n  name: \"test-volume\"\n',
                'JSON': '{\n  \"containers\": [{\n    \"image\": \"pub.domeos.org/registry:2.3\",\n    \"name\": \"test-container\",\n    \"volumeMounts\": [{\n      \"mountPath\": \"/test-hostpath\",\n      \"name\": \"test-volume\"\n    }]\n  }],\n  \"volumes\": [{\n    \"hostPath\": {\n      \"path\": \"/opt/scs\"\n    },\n    \"name\": \"test-volume\"\n  }]\n}\n',
            };
            $ctrl.setPodStrToDefault = function () {
                $ctrl.podStrUndoText = $ctrl.deploymentVersionDraft.versionString.podSpecStr || '';
                $ctrl.deploymentVersionDraft.versionString.podSpecStr = defaultVersionString[$ctrl.deploymentVersionDraft.versionType];
            };
            $ctrl.clearPodStrUndoText = function () {
                $ctrl.podStrUndoText = null;
            };
            $ctrl.undoPodStrToDefault = function () {
                $ctrl.deploymentVersionDraft.versionString.podSpecStr = $ctrl.podStrUndoText;
                $ctrl.podStrUndoText = null;
            };
        }],
    });
}(angular.module('formInputs')));