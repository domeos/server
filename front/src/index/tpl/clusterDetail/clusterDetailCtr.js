/*
 * @author ChandraLee
 */
(function (domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;
    domeApp.controller('ClusterDetailCtr', [
      '$scope',
      '$domeCluster',
      '$stateParams',
      '$state',
      'dialog',
      '$domeModel',
      '$modal',
      'api',
      function (
        $scope,
        $domeCluster,
        $stateParams,
        $state,
        dialog,
        $domeModel,
        $modal,
        api
      ) {
        if (!$stateParams.id) {
            $state.go('clusterManage');
        }
        const clusterId = $scope.clusterId = $stateParams.id,
            nodeService = $domeCluster.getInstance('NodeService'),
            clusterService = $domeCluster.getInstance('ClusterService');
        let clusterConfig;
        $scope.labels = { selectedNodeLabelList :[], selectedLabelForInstance: [] };
        $scope.nodeLabelSelectorList = [];
        $scope.nodeListIns = new $domeModel.SelectListModel('nodeList');
        $scope.resourceType = 'CLUSTER';
        $scope.resourceId = clusterId;
        $scope.isWaitingHost = true;
        $scope.isWaitingNamespace = true;
        $scope.isWaitingModify = false;
        $scope.hasWatcher = false;
        $scope.hasActiveVersions = false;
        $scope.watcher = {};
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
        }, {
            active: false
        }];

        /****主机列表***/
        $scope.hostOrderBy = {
            item: '',
            isReverse: false
        };
        $scope.toggleHostOrderBy = function (item) {
          if ($scope.hostOrderBy.item === item) {
            $scope.hostOrderBy.isReverse = !$scope.hostOrderBy.isReverse;
          } else {
            $scope.hostOrderBy.item = item;
            $scope.hostOrderBy.isReverse = false;
          }
        };
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
        function ip2Number(ip) {
          if (!ip) return '0';
          return ip.replace(/\d+/g, section => ('000' + section).slice(-3));
        }
        function formatNodeList (nodeList) {
          for (let node of nodeList) {
            node.ipNumber = ip2Number(node.ip);
            node.workEnv = [];
            if ('TESTENV' in node.labels) node.workEnv.push('测试');
            if ('PRODENV' in node.labels) node.workEnv.push('生产');
            node.workEnv = node.workEnv.join(',') || '未知';
            if (node.capacity) {
              node.memoryNumber = parseInt(node.capacity.memory, 10);
              node.cpuNumber = parseInt(node.capacity.cpu, 10);
              node.capacity.memory = (node.capacity.memory / 1024 / 1024).toFixed(2);
            }
            if (!node.labels) {
              node.labels = {};
            }
            node.isUsedByBuild = typeof node.labels.BUILDENV !== 'undefined';
          }
        }
        function initNodeList() {
            nodeService.getNodeList(clusterId).then((res) => {
                let nodeList = res.data.result || [];
                formatNodeList(nodeList); //格式化
            $scope.nodeListIns.init(nodeList, false);
        }).finally(() => {
            $scope.labels.selectedNodeLabelList = [];
            $scope.isWaitingHost = false;
        });
        }
        initNodeList();
        // 主机标签下拉框候选项
        $scope.getNodeLabel = function() {
            $scope.isLoadingNodeLabel = true;
            api.cluster.listHostLabel(clusterId).then(response => {
                $scope.nodeLabelSelectorList = (response || []).filter(label => {
                    return label.content === 'USER_LABEL_VALUE';
                }).map(label => ({value: label, text: label.name}));
            }).catch((error) => {}).then(() => {$scope.isLoadingNodeLabel = false;});
        };
        $scope.getNodeLabel();
        $scope.getNodeListByLabel = function () {
            if($scope.labels.selectedNodeLabelList.length === 0) {
                initNodeList();
            } else {
                $scope.isWaitingHost = true;
                api.cluster.listNodeByLabels(clusterId, $scope.labels.selectedNodeLabelList).then(response => {
                    let nodeList = response || [];
                    formatNodeList(nodeList); // 格式化
                    $scope.nodeListIns.init(nodeList, false);
                }).catch(() => {}).then(() => {$scope.isWaitingHost = false;});
            }
        };
        $scope.hideHostColumn = {
          cpu: { name: 'CPU总量', isShow: true },
          memory: { name: '内存总量', isShow: true },
          workEnv: { name: '工作场景', isShow: true },
          runningPods: { name: '运行实例', isShow: true },
          dockerVersion: { name: 'Docker版本', isShow: false },
          k8sVersion: { name: 'Kubernete版本', isShow: false },
        };

        $scope.nodeSearch = { displaySearchType: 'name', searchKey: ''};
        $scope.changeSearchType = function () {
          $scope.labels.selectedNodeLabelList = [];
          $scope.nodeSearch.searchKey = '';
          initNodeList();
          if ($scope.nodeSearch.displaySearchType === 'label') {
            $scope.getNodeLabel();
          }
        };
        // 修改主机标签
        $scope.modifyLabels = () => {
          let nodeList = ($scope.nodeListIns.nodeList || []).filter(node => node.isSelected === true);
          if (nodeList.length === 0) {
            dialog.alert('选择主机', '请至少选择一台主机！');
            return;
          }
          $scope.getNodeLabel();
          let commonLabelList = [];
          let nodeLabelList = nodeList.map(node => Object.keys(node.labels).filter(nodeKey => node.labels[nodeKey] === 'USER_LABEL_VALUE'));
          let intersectedLabelList = nodeLabelList.reduce((accumulator, currentValue) => {
            return accumulator.filter(label => currentValue.includes(label));
          });
          dialog.common({
            title: '修改主机标签',
            buttons: dialog.buttons.BUTTON_OK_CANCEL,
            controller: ['$scope', function ($dialogScope) {
              commonLabelList = $dialogScope.commonLabelList = angular.copy(intersectedLabelList);
              $dialogScope.formData = {
                hasExistedLabel: 'true',
                selectedNodeLabel: [],
                filledNodeLabel: null,
              };
              $dialogScope.addSelectedLabel = function () {
                let selectedNodeLabel = $dialogScope.formData.selectedNodeLabel;
                commonLabelList = $dialogScope.commonLabelList = $dialogScope.commonLabelList
                  .concat(selectedNodeLabel.filter(label => !$dialogScope.commonLabelList.includes(label.name)).map(key => key.name));
              };
              $dialogScope.addInputLabel = function () {
                let inputNodeLabel = $dialogScope.formData.filledNodeLabel;
                if (!inputNodeLabel) return;
                if (!($dialogScope.commonLabelList || []).includes(inputNodeLabel)) {
                  $dialogScope.commonLabelList.push(inputNodeLabel);
                  commonLabelList = $dialogScope.commonLabelList;
                }
                $dialogScope.formData.filledNodeLabel = null;
              };
              $dialogScope.removeLabel = function (label) {
                let list =  $dialogScope.commonLabelList;
                list.splice(list.indexOf(label), 1);
                commonLabelList = list;
              };
            }],
            value: {nodeLabelList: $scope.nodeLabelSelectorList},
            template: `
              <form id="input_label_form" ng-submit="addInputLabel()"></form>
              <form>
                <form-container left-column-width="60px">
                  <form-config-group>
                    <form-help-line>
                        <icon-info></icon-info><span>用户可“添加”已有标签/新标签，也可点击×删除所选主机共同标签。</span>
                    </form-help-line>
                    <form-config-item config-title="主机标签">
                      <form-input-container>
                        <form-input-radio-group ng-model="formData.hasExistedLabel" name="labelStatus" fallback-value="'true'" options="[{value: 'true', text: '已有标签'}, {value: 'false', text: '新建标签'}]"></form-input-radio-group>
                      </form-input-container>
                    </form-config-item>
                    <form-config-item ng-if="formData.hasExistedLabel === 'true'">
                      <form-input-container>
                        <form-with-button width="50px">
                          <content-area>
                            <form-multiple-select name="nodeLabelSelect" ng-model="formData.selectedNodeLabel" options="value.nodeLabelList" placeholder="选择主机标签" empty-text="无标签信息"></form-multiple-select>
                          </content-area>
                          <button-area>
                            <button type="button" style="color: #fff; background-color: /*[[BUTTON_COLOR*/#188ae2/*]]*/;" ng-click="addSelectedLabel(formData.selectedNodeLabel)">添加</button>
                          </button-area>
                        </form-with-button>
                      </form-input-container>
                    </form-config-item>
                    <form-config-item ng-if="formData.hasExistedLabel === 'false'">
                      <form-input-container>
                        <form-with-button width="50px">
                          <content-area>
                            <input form="input_label_form" type="text" name="nodeLabelInput" ng-model="formData.filledNodeLabel" placeholder="输入主机标签"/>
                          </content-area>
                          <button-area>
                            <button type="submit" form="input_label_form" style="color: #fff; background-color: /*[[BUTTON_COLOR*/#188ae2/*]]*/;">添加</button>
                          </button-area>
                        </form-with-button>
                      </form-input-container>
                    </form-config-item>
                    <form-config-item style="line-height: 20px" config-title="共同标签">
                      <form-input-container>
                        <div ng-if="commonLabelList.length === 0">无</div>
                        <div class="ui-label" ng-repeat="label in commonLabelList track by $index">
                           <a class="icon-cancle icon-cancle-former" ng-click="removeLabel(label)"></a><span ng-bind="label"></span>
                        </div>
                      </form-input-container>
                    </form-config-item>
                  </form-config-group>
                </form-container>
              </form>  
            `,
            size: 600
          }).then(button => {
            if (button !== dialog.button.BUTTON_OK) return;
            let addingLabelList = commonLabelList.filter(label => !intersectedLabelList.includes(label) && commonLabelList.includes(label));
            let addNodeLabelList = nodeList.map(node => ({
              nodeName: node.name,
              labels: Object.assign({},...(addingLabelList||[]).map(label=>({[label]:'USER_LABEL_VALUE'}))),
            }));

            let deletingLabelList = intersectedLabelList.filter(label => intersectedLabelList.includes(label) && !commonLabelList.includes(label));
            let deleteNodeLabelList = nodeList.map(node => ({
              nodeName: node.name,
              labels: Object.assign({},...(deletingLabelList||[]).map(label=>({[label]:'USER_LABEL_VALUE'}))),
            }));
            if (deletingLabelList.length === 0 && addingLabelList.length === 0) {
              dialog.tip('无修改', '无修改操作');
              return;
            }
            dialog[deletingLabelList.length ? 'danger' : 'continue'](
              '修改主机标签',
              '是否' + [
                deletingLabelList.length ? `删除主机标签${deletingLabelList.join('、')}` : '',
                addingLabelList.length ? `添加主机标签${addingLabelList.join('、')}` : ''
              ].filter(x => x).join('，') + '？'
            ).then(button => {
              if (button !== dialog.button.BUTTON_OK) return;
              $scope.isUpdateLabel = true;
              api.SimplePromise.resolve().then(() => {
                if (deletingLabelList.length) return api.cluster.deleteNodeLabels(clusterId, deleteNodeLabelList);
              }).then(() => {
                if (addingLabelList.length) return api.cluster.addNodeLabels(clusterId, addNodeLabelList);
              }).then(() => {
                dialog.tip('修改成功', '修改主机标签成功');
                $scope.getNodeLabel();
                initNodeList();
              }, error => {
                dialog.error('修改主机标签失败', error.message);
              }).then(() => {
                $scope.isUpdateLabel = false;
              });
            });
          });
        };
        //批量修改主机工作场景
        $scope.modifyWorkEnv = function () {
          let nodeList = ($scope.nodeListIns.nodeList || []).filter(node => node.isSelected === true);
          if (nodeList.length === 0) {
            dialog.alert('选择主机', '请至少选择一台主机！');
            return;
          }
          let workEnv = {
            testEnv: false,
            prodEnv: false,
          };
          dialog.common({
            title: '修改工作场景',
            buttons: dialog.buttons.BUTTON_OK_CANCEL,
            value: { workEnv },
            template: `
                <form-container left-column-width="60px">
                  <form>
                    <form-config-group>
                      <form-help-line>
                        <icon-info></icon-info><span>该操作将会对勾选的主机添加同样的工作场景。如需删除主机工作场景，可进入该主机详情进行删除。</span>
                      </form-help-line>
                      <form-config-item config-title="工作场景">
                        <form-input-container>
                          <form-multiple-inline>
                            <form-multiple-inline-item>
                              <form-input-checkbox ng-model="value.workEnv.testEnv" text="测试环境" value="true" value-false="false"></form-input-checkbox>
                            </form-multiple-inline-item>
                            <form-multiple-inline-item>
                              <form-input-checkbox ng-model="value.workEnv.prodEnv" text="生产环境" value="true" value-false="false"></form-input-checkbox>
                            </form-multiple-inline-item>
                          </form-multiple-inline>
                        </form-input-container>
                      </form-config-item>
                    </form-config-group>
                  </form>
                </form-container>
              `,
            size: 600
          }).then(button => {
            if(button !== dialog.button.BUTTON_OK) return;
            let labels = {};
            if (workEnv.testEnv) {
              labels.TESTENV = 'HOSTENVTYPE';
            }
            if (workEnv.prodEnv) {
              labels.PRODENV = 'HOSTENVTYPE';
            }
            let nodeLabelList = nodeList.map(node => ({
              nodeName: node.name,
              labels: labels,
            }));
            $scope.isUpdateLabel = true;
            api.cluster.addNodeLabels(clusterId, nodeLabelList).then(() => {
              dialog.tip('修改成功', '工作场景修改成功');
              initNodeList();
            }).catch(error => {dialog.error('修改工作场景失败', error.message);}).then(() => { $scope.isUpdateLabel = false; });
          });
        };
        $scope.displayCondition = true;
        $scope.toggleFilterCondition = function () {
          $scope.displayCondition = !$scope.displayCondition;
        };

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
                dialog.error('警告', '请求失败！');
                $state.go('clusterManage');
            });

            //获取监听器信息
            clusterService.getWatcher(clusterId).then((res) => {
                    if (res.data.resultCode == '200') {
                        $scope.watcher = angular.copy(res.data.result);
                        $scope.hasWatcher = true;
                        if ($scope.watcher.versionSelectorInfos) {
                            $scope.hasActiveVersions = true;
                        }
                        if ($scope.watcher.hostEnv === 'PROD') {
                            $scope.watcher.hostEnv = '生产环境'
                        } else if ($scope.watcher.hostEnv === 'TEST') {
                            $scope.watcher.hostEnv = '测试环境'
                        }
                    } else {
                        $scope.hasWatcher = true;
                    }
                })
                .then(() => {
                    nodeService.getNodeList($scope.clusterId).then((res) => {
                        var nodeData = res.data.result || [];
                        $scope.nodeListIns2 = $domeCluster.getInstance('NodeList', nodeData);
                    }, () => {
                        $scope.nodeListIns2 = $domeCluster.getInstance('NodeList');
                    })
                })
        };
        init();

        //查看选中主机
        $scope.showHost = (lablesSelectorInfo) => {
            //每次重置labels状态
            for (let i in $scope.nodeListIns2.labelsInfo) {
                $scope.nodeListIns2.labelsInfo[i].isSelected = false;
            }
            $scope.nodeListIns2.toggleLabelNodes();
            for (let i in lablesSelectorInfo) {
                $scope.nodeListIns2.toggleLabel(lablesSelectorInfo[i].name, true);
            }
            var hostModalIns = $modal.open({
                animation: true,
                templateUrl: '/index/tpl/modal/hostListModal/hostListModal.html',
                controller: 'HostListModalCtr',
                size: 'lg',
                resolve: {
                    hostList: function hostList() {
                        return $scope.nodeListIns2.nodeList
                    }
                }
            });
            return hostModalIns.result;
        };
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
                dialog.error('警告', '您没有权限添加主机');
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
                    dialog.error('警告', '已存在！');
                    $scope.isLoadingNamespace = false;
                    return;
                }
            }
            nodeService.setNamespace(clusterId, [namespace]).then(() => {
                $scope.namespaceList.push(namespace);
                $scope.namespaceTxt.namespace = '';
            }, () => {
                dialog.error('警告', '添加失败！');
            }).finally(() => {
                $scope.isLoadingNamespace = false;
            });
        };
        //添加监听器
        $scope.createWatcher = (clusterId) => {
            if ($scope.mayEditCluster()) {
                $state.go('createWatcher', { 'id': clusterId });
            } else {
                dialog.error('您没有权限添加监听器');
            }
        };

        $scope.checkEdit = () => {
            $scope.isEdit = !$scope.isEdit;
            if (!$scope.isEdit) {
                $scope.valid.needValid = false;
                $scope.clusterIns.config = angular.copy(clusterConfig);
                $scope.config = $scope.clusterIns.config;
            }
            else{
                init();
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
                dialog.alert('提示', '修改成功！');
                init();
                $scope.checkEdit();
            }, (res) => {
                dialog.error('修改失败', res.data.resultMsg);
            }).finally(() => {
                $scope.isWaitingModify = false;
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
                dialog.error('警告', '请保证集群内至少有一台用于构建的主机！');
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
                    dialog.error('修改失败', res.data.resultMsg);
                });
            } else {
                nodeService.deleteLabel(clusterId, labelsInfo).catch((res) => {
                    node.isUsedByBuild = !node.isUsedByBuild;
                    dialog.error('修改失败', res.data.resultMsg);
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
        } else if (stateInfo.indexOf('watcher') !== -1) {
            $scope.tabActive[5].active = true;
        } else {
            $scope.tabActive[0].active = true;
        }

        // 登录用户角色权限
        $scope.userRole = null;
        $scope.setRole = function(role) { $scope.userRole = role; };
        $scope.mayEditCluster = () => $scope.userRole === 'MASTER' || $scope.userRole === 'DEVELOPER';

        /*********** 实例列表 ********/
        $scope.instanceSearch = { displaySearchType: 'name', searchKey: ''};
        $scope.changeInstanceSearchType = function () {
          $scope.labels.selectedLabelForInstance = [];
          $scope.instanceSearch.searchKey = '';
          getInstances();
          if ($scope.instanceSearch.displaySearchType === 'label') {
            $scope.getNodeLabel();
          }
        };
        $scope.hideInstanceColumn = {
          hostName: { name: '主机名称', isShow: true },
          podIp: { name: '实例IP', isShow: true },
          status: { name: '实例状态', isShow: true },
          deployName: { name: '部署名称', isShow: true },
          deployVersion: { name: '部署版本', isShow: false },
          namespace: { name: 'namespace', isShow: false },
          startTime: { name: '启动时间', isShow: false },
          containerId: { name: '容器ID', isShow: false },
          imageName: { name: '镜像名称', isShow: false },
        };

        const getInstances = () => {
            $scope.isWaitingInstances = true;
            api.cluster.listInstance(clusterId).then(res => {
                $scope.instanceList = res.map(instance => {
                    instance.podIpNumber = ip2Number(instance.podIp);
                    return instance;
                });
            }).catch(error => {}).then(() => {
              $scope.labels.selectedLabelForInstance = [];
              $scope.isWaitingInstances = false;
            });
        };
        getInstances();
        $scope.listInstanceByLabel = function () {
          if ($scope.labels.selectedLabelForInstance.length > 0) {
            $scope.isWaitingInstances = true;
            api.cluster.listInstanceByLabel(clusterId, $scope.labels.selectedLabelForInstance).then(response => {
              $scope.instanceList = (response || []).map(instance => {
                instance.podIpNumber = ip2Number(instance.podIp);
                return instance;
              });
            }).catch(error => {}).then(() => { $scope.isWaitingInstances = false; })
          } else {
            getInstances();
          }
        };
        // html上已删除查看日志和进入控制台按钮，
        // 不确定以后是否添加，先注释掉代码
        // $scope.showLog = function (instanceName, containers, namespace) {
        //     $modal.open({
        //         templateUrl: 'index/tpl/modal/instanceLogModal/instanceLogModal.html',
        //         controller: 'InstanceLogModalCtr',
        //         size: 'md',
        //         resolve: {
        //             instanceInfo: function () {
        //                 return {
        //                     clusterId: clusterId,
        //                     namespace: namespace,
        //                     instanceName: instanceName,
        //                     containers: containers
        //                 };
        //             }
        //         }
        //     });
        // };
        // $scope.toConsole = function (containers, hostIp) {
        //     $modal.open({
        //         templateUrl: 'index/tpl/modal/selectContainerModal/selectContainerModal.html',
        //         controller: 'SelectContainerModalCtr',
        //         size: 'md',
        //         resolve: {
        //             info: function () {
        //                 return {
        //                     containerList: containers,
        //                     hostIp: hostIp,
        //                     resourceId: clusterId,
        //                     type: 'CLUSTER',
        //                 };
        //             }
        //         }
        //     });
        // };
        $scope.goToDeployInstance = function(instance) {
            $state.go('deployDetail.instance', {
                'id': instance.deloyId,
                'collectionId': 0,
                'collectionName': 'all-deploy',
            });

        };
    }]).directive('status', function() {
        return {
            restrict: 'E',
            replace: 'true',
            template: '<b><span>{{statusVal}}</span></b>',
            link: function(scope, elem, attrs) {
                switch (attrs.type) {
                    case 'RUNNING':
                        elem.addClass('txt-success');
                        scope.statusVal = '运行中';
                        break;
                    case 'DEPLOYING':
                        elem.addClass('txt-normal');
                        scope.statusVal = '部署中';
                        break;
                    case 'STOP':
                        elem.addClass('txt-warning');
                        scope.statusVal = '停止';
                        break;
                    case 'ERROR':
                        elem.addClass('txt-warning');
                        scope.statusVal = '异常';
                        break;
                    case 'BACKROLLING':
                        elem.addClass('txt-mormal');
                        scope.statusVal = '回滚中';
                        break;
                    case 'STOPPING':
                        elem.addClass('txt-mormal');
                        scope.statusVal = '停止中';
                        break;
                    case 'UPDATING':
                        elem.addClass('txt-mormal');
                        scope.statusVal = '升级中';
                        break;
                    case 'UPSCALING':
                        elem.addClass('txt-mormal');
                        scope.statusVal = '扩容中';
                        break;
                    case 'DOWNSCALING':
                        elem.addClass('txt-mormal');
                        scope.statusVal = '缩容中';
                        break;
                    case 'ABORTING':
                        elem.addClass('txt-mormal');
                        scope.statusVal = '中断中';
                        break;
                    case 'BACKROLL_ABORTED':
                        elem.addClass('txt-warning');
                        scope.statusVal = '回滚已中断';
                        break;
                    case 'UPDATE_ABORTED':
                        elem.addClass('txt-warning');
                        scope.statusVal = '升级已中断';
                        break;
                    default:
                        scope.statusVal = '-';
                        break;
                }
            }
        }
    });
})(angular.module('domeApp'));

;(function (formInputs) {
  formInputs.component('customTableColumn', {
    template: `
      <style>
        .setting-table-column{ line-height: 40px; }
      </style>
      <div class="setting-table-column">
        <icon-setting ng-click="$ctrl.operateHostTableColumn()" tooltip="显示更多列"></icon-setting>
      </div>
    `,
    bindings: {
      ngModel: '=',
    },
    controller: ['$scope', 'dialog', function ($scope, dialog) {
      const $ctrl = this;
      $ctrl.operateHostTableColumn = function () {
        input();
        dialog.common({
          title: '自定义列表',
          buttons: dialog.buttons.BUTTON_OK_CANCEL,
          value: {columns: $ctrl.value},
          template: `
              <form-container left-column-width="60px">
                <form>
                  <form-config-group>
                    <form-help-line>
                      <icon-info></icon-info><span>请选择您想显示的列表详细信息。</span>
                    </form-help-line>
                    <form-config-item config-title="可选项">
                      <form-input-container>
                        <form-multiple-inline>
                          <form-multiple-inline-item style="flex-basis: 120px;" ng-repeat="(key, column) in value.columns">
                            <form-input-checkbox ng-model="column.isShow" text="{{ column.name }}" value="true" value-false="false"></form-input-checkbox>
                          </form-multiple-inline-item>
                        </form-multiple-inline>
                      </form-input-container>
                    </form-config-item>
                  </form-config-group>
                </form>
              </form-container>
            `,
          size: 600
        }).then(button => {
          if (button !== dialog.button.BUTTON_OK) throw '';
          $ctrl.ngModel = $ctrl.value;
        });
      };
      const input = function () {
        if(!$ctrl.ngModel) return;
        $ctrl.value = angular.copy($ctrl.ngModel);
      };
      $scope.$watch('$ctrl.ngModel', input);
    }]
  });
}(angular.module('formInputs')));

