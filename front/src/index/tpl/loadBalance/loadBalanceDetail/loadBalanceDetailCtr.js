/**
 * Created by haozhou on 2017/3/30.
 */
;(function (domeApp) {
  'use strict';
  /*************************** KUBE-PROXY *******************************/
  domeApp.controller('KubeLoadBalanceDetailCtr', [
    '$scope',
    '$state',
    'dialog',
    'api',
  function (
    $scope,
    $state,
    dialog,
    api
  ) {
    let collectionId = $state.params.collectionId;
    let loadBalanceId = $state.params.loadBalanceId;
    $scope.loadBalanceDraft = {};
    if (!collectionId || !loadBalanceId) {
      $state.go('loadBalanceInfo', {});
      return;
    }
    // let loadBalanceType = 'EXTERNAL_SERVICE';
    $scope.collectionId = collectionId;
    $scope.type = 'KUBE_PROXY';

    function getLoadBalanceDetail() {
      $scope.isLoading = true;
      api.loadBalance.loadBalance.getById(loadBalanceId).then(response => {
        $scope.loadBalanceDraft = response || {};
        // 权限变量
        $scope.hasDeletePermission = $scope.loadBalanceDraft.role === 'MASTER';
        $scope.hasUpdatePermission = $scope.loadBalanceDraft.role === 'MASTER' || $scope.loadBalanceDraft.role === 'DEVELOPER';
      }).catch((error) => {
        dialog.error('错误提示', error.response.data.resultMsg);
      }).then(() => {
        $scope.isLoading = false;
        listForeignServiceIP();
        // listDeployment();
      });
    }

    getLoadBalanceDetail();

    const listForeignServiceIP = function () {
      $scope.isLoadingNodeIP = true;
      api.cluster.listNodeList($scope.loadBalanceDraft.clusterId).then(response => {
        $scope.nodeIPListSelector = (response || []).map(node => ({
          value: node.ip,
          text: node.ip,
          remark: '主机：' + node.name + ' ' + '状态：' + node.status,
        }));
      }).catch(() => {
      }).then(() => {
        $scope.isLoadingNodeIP = false;
      });
    };
    $scope.toggleEdit = function (type) {
      getLoadBalanceDetail(); //修改前和取消后都要重新拉取数据
      $scope.isEditing = !$scope.isEditing;
    };

    $scope.addPortSetting = function () {
      $scope.loadBalanceDraft.serviceDraft.lbPorts.push({
        port: null,
        targetPort: null,
        protocol: 'TCP',
      });
      $scope.loadBalanceDraft.serviceDraft.lbPorts = $scope.loadBalanceDraft.serviceDraft.lbPorts.filter(ports => ports !== undefined);
    };

    $scope.updateLoadBalance = function () {
      $scope.isUpdating = true;
      $scope.loadBalanceDraft.lbcId = collectionId;
      api.loadBalance.loadBalance.update($scope.loadBalanceDraft).then(response => {
        getLoadBalanceDetail();
        $scope.toggleEdit();
        $scope.isUpdating = false;
      }).catch((error) => {
        $scope.isUpdating = false;
        dialog.error('修改错误', error.message || '修改负载均衡时出现错误！');
      });
    }
  }]);

  /*********************************** nginx detail **************************************/
  domeApp.controller('NginxLoadBalanceDetailCtr', [
    '$scope',
    '$state',
    'dialog',
    'api',
    '$timeout',
  function (
    $scope,
    $state,
    dialog,
    api,
    $timeout
  ) {
    let collectionId = $state.params.collectionId;
    let loadBalanceId = $state.params.loadBalanceId;
    if (!collectionId || !loadBalanceId) {
      $state.go('loadBalanceCollection', {});
      return;
    }
    $scope.collectionId = collectionId;
    $scope.type = 'NGINX';

    let timeout = null;

    $scope.logStoragePrompt = {
      HOSTPATH: '该类别会将主机目录挂载到nginx容器内部，nginx实例调度后存在于主机目录的日志文件不会丢失',
      EMPTYDIR: 'nginx的日志会打到容器的控制台，nginx实例调度时，日志会丢失',
    };

    $scope.updateVersionDraft = {};

    function getLoadBalanceDetail() {
      return api.loadBalance.loadBalance.getById(loadBalanceId).then(response => {
        $scope.loadBalanceDraft = response || {};
        // 权限变量
        $scope.hasDeletePermission = $scope.loadBalanceDraft.role === 'MASTER';
        $scope.hasUpdatePermission = $scope.loadBalanceDraft.role === 'MASTER' || $scope.loadBalanceDraft.role === 'DEVELOPER';
        return $scope.loadBalanceDraft;
      }).catch(error => {
        // 没有访问权限
        if(error.response.data.resultCode === 403) {
          $state.go('loadBalanceCollection',{});
        }
      });
    }

    function freshLoadBalanceDetail() {
      getLoadBalanceDetail();
      if (timeout) {
        $timeout.cancel(timeout);
      }
      timeout = $timeout(freshLoadBalanceDetail, 4000);
    }

    freshLoadBalanceDetail();
    function initDetail() {
      $scope.isLoading = true;
      getLoadBalanceDetail().then(loadBalanceDraft => {
        $scope.loadBalanceForRule = angular.copy(loadBalanceDraft);
      }).catch((error) => {
        dialog.error('错误提示', error.response.data.resultMsg);
      }).then(() => {
        listVersion(); //获取版本列表
        $scope.isLoading = false;
      });
    }

    initDetail();
    $scope.$on('$destroy', function () {
      if (timeout) {
        $timeout.cancel(timeout);
      }
    });
    let currentRunningVersionId = null; //当前运行的版本号

    $scope.currentVersion = null;  //当前显示的版本号
    const listVersion = function () {
      $scope.isLoadingVersionList = true;
      api.loadBalance.version.listVersion(loadBalanceId).then(response => {
        let versions = response || [];
        $scope.versionList = versions.map(version => ({
          value: version.version,
          text: 'version' + version.version
        }));
        $scope.isLoadingVersionList = false;
        if ($scope.loadBalanceDraft.nginxDraft.currentVersions && $scope.loadBalanceDraft.nginxDraft.currentVersions.length > 0) {
          currentRunningVersionId = $scope.currentVersion = $scope.loadBalanceDraft.nginxDraft.currentVersions[0].version;
          $scope.nginxVersionDraft = $scope.loadBalanceDraft.nginxDraft.currentVersions[0];
          $scope.updateVersionDraft = angular.copy($scope.nginxVersionDraft);
        } else {
          $scope.currentVersion = versions[0].version;
          getVersionById();
        }
      }).catch((error) => {
        $scope.isLoadingVersionList = false;
        dialog.error('查询失败', error.message);
      });
    };
    const getVersionById = function () {
      api.loadBalance.version.getVersionById(loadBalanceId, $scope.currentVersion).then(response => {
        $scope.nginxVersionDraft = response || {};
        $scope.updateVersionDraft = angular.copy($scope.nginxVersionDraft);
      }).catch((error) => {
        dialog.error('查询失败', error.messsage);
      });
    };

    $scope.toggleVersion = function (versionId) {
      if($scope.currentVersion !== versionId){
        $scope.currentVersion = versionId;
        getVersionById();
      }
    };
    $scope.createVersion = function () {
      let value = {newVersionId: ''};
      api.loadBalance.version.create(loadBalanceId, $scope.updateVersionDraft).then(response => {
        initDetail(); // 刷新配置详情和升级页面数据
        value.newVersionId = response.version;
        if ($scope.loadBalanceDraft.state !== 'RUNNING') {
          dialog.alert('新建部署版本', '成功新建部署版本：version' + value.newVersionId + ', 当前为' + $scope.loadBalanceDraft.state + '状态，非运行状态不能升级。');
        } else {
          dialog.common({
            title: '升级版本',
            buttons: [
              {text: '暂不升级', value: dialog.button['BUTTON_CANCEL'], secondary: false},
              {text: '继续升级', value: dialog.button['BUTTON_OK']}
            ],
            value: value,
            template: `
              <form-container left-column-width="60px">
              <form name="updateRunningNginxDialog">
                  <form-config-group>
                      <div>成功新建部署版本: version{{ value.newVersionId }}，是否升级到新版本？</div>
                  </form-config-group>
              </form>
              </form-container>
              `,
            size: 400,
          }).then((response) => {
            if (response == dialog.button.BUTTON_OK) {
              if (!value.newVersionId) {
                dialog.alert('错误信息', '版本号错误');
                return;
              }
              dialog.tip('', '升级中，请查看部署状态！');
              api.loadBalance.action.update(loadBalanceId, value.newVersionId).then(response => {
                $scope.toggleVersion(value.newVersionId); //刷新配置详情页和升级页面
              }).catch(exception => {
                dialog.error('升级失败', exception.message);
              });
            }
          });
        }
      }).catch(error => {
        dialog.error('创建版本错误', error.message)
      });
    };
    /**
     * 操作
     */
    // delete
    $scope.delete = function () {
      dialog.danger('确认删除', '确认要删除吗？').then(button => {
        if (button !== dialog.button.BUTTON_OK) throw ''
      }).then(function () {
        api.loadBalance.loadBalance.delete(loadBalanceId).then(response => {
          $state.go('loadBalanceInfo', {id: collectionId, type: $scope.type});
        }).catch(error => {
          dialog.error('删除错误', error.message || '删除时出现错误');
        });
      });
    };
    /**
     * 版本选择dialog
     * return { promise, result }
     */
    function versionListDialogPromise() {
      let paramsValue = {
        versionList: [],
        currentVersion: null,
        isLoadingVersionList: true,
        currentVersions:$scope.loadBalanceDraft.nginxDraft.currentVersions,
      };
      api.loadBalance.version.listVersion(loadBalanceId).then(response => {
        paramsValue.versionList = (response || []).map(version => ({
          value: version.version,
          text: 'version' + version.version
        }));
        paramsValue.isLoadingVersionList = false;
      }).catch((error) => {
        paramsValue.isLoadingVersionList = false;
        dialog.error('查询失败', error.message);
      });
      return {
        result: paramsValue,
        promise: dialog.common({
          title: '选择启动版本',
          buttons: dialog.buttons.BUTTON_OK_CANCEL,
          value: paramsValue,
          template: `
            <form-container left-column-width="60px">
              <form-config-group>
                <form-config-item config-title="当前版本">
                  <form-input-container>
                    <span ng-if="!value.currentVersions||value.currentVersions.length===0">无</span>
                    <span ng-repeat="version in value.currentVersions" ng-cloak>version{{version.version}}</span>
                  </form-input-container>
                </form-config-item>
                <form-config-item config-title="选择版本" required="true">
                  <form-input-container>
                    <form-select ng-model="value.currentVersion" name="$_versionSelector" options="value.versionList" show-search-input="never" placeholder="请选择版本" is-loading="isLoadingVersionList" loading-text="正在获取版本信息" empty-text="无相关信息" required="true"></form-select>
                    <form-error-message form="versionDialog" target="$_versionSelector" type="required">请选择版本</form-error-message>
                  </form-input-container>
                </form-config-item>
              </form-config-group>
            </form-container>
          `,
          size: 540,
          form: 'versionDialog'
        }),
      };
    }

    // start
    $scope.start = function () {
      $scope.isWaitingStart = true;
      let dialogResult = versionListDialogPromise();
      dialogResult.promise.then(buttonResponse => {
        if (buttonResponse === dialog.button.BUTTON_OK) {
          $scope.toggleVersion(dialogResult.result.currentVersion);
          api.loadBalance.action.start(loadBalanceId, dialogResult.result.currentVersion).then(response => {
            currentRunningVersionId = dialogResult.result.currentVersion;
            $scope.isWaitingStart = false;
          }).catch(error => {
            $scope.isWaitingStart = false;
            if (error.response.data.resultCode === 1007) {
              dialog.continue('警告！', '监听器状态异常，请点击确定进入详情页进行配置').then(function (res) {
                if (res === dialog.buttons.BUTTON_OK_ONLY) {
                  $state.go('clusterDetail.watcher', {id: $scope.loadBalanceDraft.clusterId});
                  hide();
                }
              });
            } else {
              dialog.error('启动失败', error.message)
            }
          });
        } else {
          $scope.isWaitingStart = false;
        }
      });
    };

    // 恢复
    $scope.recover = function () {
      $scope.isWaitingRecover = true;
      let dialogResult = versionListDialogPromise();
      dialogResult.promise.then(buttonResponse => {
        if (buttonResponse === dialog.button.BUTTON_OK) {
          $scope.toggleVersion(dialogResult.result.currentVersion);
          api.loadBalance.action.rollback(loadBalanceId, dialogResult.result.currentVersion).then(response => {
            currentRunningVersionId = dialogResult.result.currentVersion;
            $scope.isWaitingRecover = false;
          }).catch(error => {
            $scope.isWaitingRecover = false;
            if (error.response.data.resultCode === 1007) {
              dialog.continue('警告！', '监听器状态异常，请点击确定进入详情页进行配置').then(function (res) {
                if (res === dialog.buttons.BUTTON_OK_ONLY) {
                  $state.go('clusterDetail.watcher', {id: $scope.loadBalanceDraft.clusterId});
                  hide();
                }
              });
            } else {
              dialog.error('恢复失败', error.message)
            }
          });
        } else {
          $scope.isWaitingRecover = false;
        }
      });
    };

    // 停止
    $scope.stopVersion = function () {
      $scope.isWaitingStop = true;
      dialog.continue('确认停止', '确认要停止吗？').then(button => {
        if (button !== dialog.button.BUTTON_OK) {
          $scope.isWaitingStop = false;
          throw '';
        }
      }).then(function () {
        api.loadBalance.action.stop(loadBalanceId).then(response => {
          currentRunningVersionId = null;
          $scope.isWaitingStop = false;
        }).catch(error => {
          $scope.isWaitingStop = false;
          if (error.response.data.resultCode === 1007) {
            dialog.continue('警告！', '监听器状态异常，请点击确定进入详情页进行配置').then(function (res) {
              if (res === dialog.buttons.BUTTON_OK_ONLY) {
                $state.go('clusterDetail.watcher', {id: $scope.loadBalanceDraft.clusterId});
                hide();
              }
            });
          } else {
            dialog.error('停止错误', error.message || '停止时出现错误');
          }
        });
      });
    };

    // 升级/ 回滚
    $scope.updateVersion = function () {
      $scope.isWaitingUpVersion = true;
      let dialogResult = versionListDialogPromise();
      dialogResult.promise.then(buttonResponse => {
        if (buttonResponse === dialog.button.BUTTON_OK) {
          if (!currentRunningVersionId || !dialogResult.result.currentVersion) {
            $scope.isWaitingUpVersion = false;
            dialog.tip('参数错误', '版本号为空');
            return;
          }
          $scope.toggleVersion(dialogResult.result.currentVersion);
          if (currentRunningVersionId === dialogResult.result.currentVersion) {
            $scope.isWaitingUpVersion = false;
            dialog.alert('升级/回滚', '您不能选择当前版本进行升级/回滚！');
          } else if (currentRunningVersionId > dialogResult.result.currentVersion) {
            dialog.tip('回滚提示', '请求已发送，回滚中...');
            api.loadBalance.action.rollback(loadBalanceId, dialogResult.result.currentVersion).then(response => {
              currentRunningVersionId = dialogResult.result.currentVersion;
              $scope.isWaitingUpVersion = false;
            }).catch(error => {
              $scope.isWaitingUpVersion = false;
              if (error.response.data.resultCode === 1007) {
                dialog.continue('警告！', '监听器状态异常，请点击确定进入详情页进行配置').then(function (res) {
                  if (res === dialog.buttons.BUTTON_OK_ONLY) {
                    $state.go('clusterDetail.watcher', {id: $scope.loadBalanceDraft.clusterId});
                    hide();
                  }
                });
              } else {
                dialog.error('回滚失败', error.message)
              }
            });
          } else if (currentRunningVersionId < dialogResult.result.currentVersion) {
            dialog.tip('升级提示', '请求已发送，升级中...');
            api.loadBalance.action.update(loadBalanceId, dialogResult.result.currentVersion).then(response => {
              currentRunningVersionId = dialogResult.result.currentVersion;
              $scope.isWaitingUpVersion = false;
            }).catch(error => {
              $scope.isWaitingUpVersion = false;
              if (error.response.data.resultCode === 1007) {
                dialog.continue('警告！', '监听器状态异常，请点击确定进入详情页进行配置').then(function (res) {
                  if (res === dialog.buttons.BUTTON_OK_ONLY) {
                    $state.go('clusterDetail.watcher', {id: $scope.loadBalanceDraft.clusterId});
                    hide();
                  }
                });
              } else {
                dialog.error('升级失败', error.message)
              }
            });
          }
        } else {
          $scope.isWaitingUpVersion = false;
        }
      });
    };

    // 扩容/缩容
    $scope.scaleVersion = function () {
      let paramsValue = {
        nodeDraft: $scope.loadBalanceDraft.nginxDraft.currentVersions[0].nodeDraft || [],
        clusterId: $scope.loadBalanceDraft.clusterId,
        hostEnv: $scope.loadBalanceDraft.nginxDraft.currentVersions[0].hostEnv,
      };

      dialog.common({
        title: '扩容/缩容',
        buttons: dialog.buttons.BUTTON_OK_CANCEL,
        value: paramsValue,
        template: `
          <form-container left-column-width="60px">
            <form-config-group>
              <form-config-item config-title="选择主机" required="true">
                <form-input-container>
                  <form-multiple-select-list ng-model="value.nodeDraft" name="scaleNodeList" parameters="{clusterId:value.clusterId,hostEnv:value.hostEnv}" placeholder="请选择主机" loading-text="正在获取主机" empty-text="无相关信息" error-message="主机不能为空" get-list-fn="{{'nodeByLabels'}}"></form-multiple-select-list>
                  <form-error-message form="scaleDialog" target="scaleNodeList" type="required">请选择主机</form-error-message>
                </form-input-container>
              </form-config-item>
            </form-config-group>
          </form-container>
        `,
        size: 540,
        form: 'scaleDialog'
      }).then(buttonResponse => {
        if (buttonResponse === dialog.button.BUTTON_OK) {
          $scope.isWaitingScale = true;
          $scope.toggleVersion(currentRunningVersionId);
          api.loadBalance.action.scale(loadBalanceId, currentRunningVersionId, paramsValue.nodeDraft).then(response => {
            $scope.isWaitingScale = false;
          }).catch(error => {
            $scope.isWaitingScale = false;
            if (error.response.data.resultCode === 1007) {
              dialog.continue('警告！', '监听器状态异常，请点击确定进入详情页进行配置').then(function (res) {
                if (res === dialog.buttons.BUTTON_OK_ONLY) {
                  $state.go('clusterDetail.watcher', {id: $scope.loadBalanceDraft.clusterId});
                  hide();
                }
              });
            } else {
              dialog.error('扩容/缩容失败', error.message)
            }
          });
        } else {
          $scope.isWaitingScale = false;
        }
      });

    };

    $scope.toggleEdit = function (type) {
      initDetail();
      $scope.isEditingRule = !$scope.isEditingRule;
    };
    //修改转发规则
    $scope.updateLoadBalanceRule = function () {
      $scope.isUpdating = true;
      api.loadBalance.loadBalance.update($scope.loadBalanceForRule).then(response => {
        initDetail();
        $scope.toggleEdit();
        $scope.isUpdating = false;
      }).catch((error) => {
        $scope.isUpdating = false;
        dialog.error('修改错误', error.message || '修改负载均衡时出现错误！');
      });
    };
    $scope.editDescription = {
      text: null
    };
    let oldDescription = null;
    $scope.toggleIsEditDesc = function () {
      oldDescription = $scope.loadBalanceForRule.description;
      $scope.editDescription.text = $scope.loadBalanceForRule.description;
      $scope.isEditDesc = !$scope.isEditDesc;
    };
    //修改描述
    $scope.updateLoadBalanceDesc = function () {
      $scope.isEditDesc = false;
      $scope.loadBalanceForRule.description = $scope.editDescription.text;
      api.loadBalance.loadBalance.updateDescription(loadBalanceId, $scope.loadBalanceForRule.description).then(function (res) {
        oldDescription = null;
      }).catch(function (resError) {
        $scope.loadBalanceForRule.description = oldDescription;
        dialog.error('修改失败', resError.message);
      }).then(() => {
        $scope.isEditDesc = false;
      });
    };

    $scope.userDefinedImage = function () {
      let otherImage = {name: '', registry: '', tag: ''};
      dialog.common({
        title: '修改定制镜像',
        buttons: dialog.buttons.BUTTON_OK_CANCEL,
        value: {otherImage},
        template: `
            <form-container left-column-width="60px">
              <form-config-group>
                <form-help-line>
                  <icon-info></icon-info><span>DomeOS提供了默认镜像，如果有特殊需求，可以根据文档说明，定制自己的nginx镜像。</span>
                </form-help-line>
                <form-config-item config-title="仓库地址" required="true">
                  <form-input-container>
                      <input type="text" name="registry" ng-model="value.otherImage.registry" required>
                      <form-error-message form="otherImageDialog" target="registry" type="required">请填写仓库地址</form-error-message>
                  </form-input-container>
                </form-config-item>
                <form-config-item config-title="镜像名称" required="true">
                  <form-input-container>
                      <input type="text" name="name" ng-model="value.otherImage.name" required>
                      <form-error-message form="otherImageDialog" target="name" type="required">请填写镜像名称</form-error-message>
                  </form-input-container>
                </form-config-item>
                <form-config-item config-title="镜像版本" required="true">
                  <form-input-container>
                      <input type="text" name="tag" ng-model="value.otherImage.tag" required>
                      <form-error-message form="otherImageDialog" target="tag" type="required">请填写镜像版本</form-error-message>
                  </form-input-container>
                </form-config-item>
              </form-config-group>
            </form-container>
          `,
        size: 540,
        form: 'otherImageDialog'
      }).then((response) => {
        if (response === dialog.button.BUTTON_OK) {
          if (!otherImage.name || !otherImage.registry || !otherImage.tag) return;
          $scope.updateVersionDraft.registry = otherImage.registry;
          $scope.updateVersionDraft.image = otherImage.name;
          $scope.updateVersionDraft.tag = otherImage.tag;
        }
      });
    };

  }]);

  domeApp.controller('NginxInstanceCtr', [
    '$scope',
    '$state',
    'api',
    'dialog',
    '$modal',
    '$timeout',
    '$window',
  function (
    $scope,
    $state,
    api,
    dialog,
    $modal,
    $timeout,
    $window
  ) {
    let collectionId = $state.params.collectionId;
    let loadBalanceId = $state.params.loadBalanceId;
    let timeout = null;
    api.loadBalance.loadBalance.getById(loadBalanceId).then(response => {
      $scope.loadBalanceDraft = response || {};
    });
    function listInstance() {
      $scope.isLoadingInstance = true;
      api.loadBalance.loadBalance.listInstance(loadBalanceId).then(response => {
        $scope.instanceList = response || [];
        $scope.isLoadingInstance = false;
      }).catch((error) => {
        $scope.isLoadingInstance = false;
        console.log('list load balance instance list error: ', error);
      });
    }

    listInstance();

    function freshInstance() {
     listInstance();
      if (timeout) {
        $timeout.cancel(timeout);
      }
      timeout = $timeout(freshInstance, 4000);
    }
    freshInstance();

    $scope.$on('$destroy', function () {
      if (timeout) {
        $timeout.cancel(timeout);
      }
    });

    // 日志
    $scope.showLog = function (instanceDraft) {
      $modal.open({
        templateUrl: 'index/tpl/modal/instanceLogModal/instanceLogModal.html',
        controller: 'InstanceLogModalCtr',
        size: 'md',
        resolve: {
          instanceInfo: function () {
            return {
              clusterId: $scope.loadBalanceDraft.clusterId,
              namespace: $scope.loadBalanceDraft.namespace,
              instanceName: instanceDraft.instanceName,
              containers: instanceDraft.containers
            };
          }
        }
      });
    };
    //控制台
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
              resourceId: loadBalanceId,
              type: 'LOADBALANCER'
            };
          }
        }
      });
    };
    //重启实例
    $scope.restartInstance = function (instanceDraft) {
      $scope.isRestartInstance = true;
      if(instanceDraft.status === 'Terminating' || instanceDraft.status === 'Pending' || instanceDraft.status === 'ContainerCreating' || !$scope.isRestartInstance) return;
      dialog.continue('重启确认', `您将要对实例${instanceDraft.instanceName}进行重启，重启后原实例将被关闭，确认要重启吗？`).then(button => {
        if (button === dialog.button.BUTTON_OK) {
          api.loadBalance.loadBalance.restartInstance(loadBalanceId, instanceDraft.instanceName).then(response => {

          }).catch(error => {
            dialog.error('重启实例失败', error.message);
          }).then(() => { $scope.isRestartInstance = false; });
        }
      }).then(() => {
        $scope.isRestartInstance = false;
      });

    };
    //监控
    $scope.showMonitor = function(instanceDraft) {
      let newWindow = $window.open('', '_blank');
      api.loadBalance.version.getVersionById(loadBalanceId, instanceDraft.versionId).then(response => {
        let path = "http://" + instanceDraft.hostIp + ":" + response.listenPort + "/domeos_nginx_status";
        newWindow.location.href = path;
      }).catch(error => {
        dialog.error('获取失败', error.message);
      });
    };

  }]);
  domeApp.controller('NginxEventCtr', ['$scope', '$state', 'api', '$timeout', function ($scope, $state, api, $timeout) {
    let loadBalanceId = $state.params.loadBalanceId;
    let timeout = null;
    function listEvent() {
      api.loadBalance.loadBalance.listEvent(loadBalanceId).then(response => {
        $scope.eventList = response || [];
      });
    }
    listEvent();
    $scope.wrongMessageList = {};
    $scope.showWrong = function(eid) {
      if($scope.wrongMessageList[eid] === undefined){
        $scope.wrongMessageList[eid] = true;
      }
      else{
        $scope.wrongMessageList[eid] = !$scope.wrongMessageList[eid];
      }
    };
    function freshEvent() {
      listEvent();
      if (timeout) {
        $timeout.cancel(timeout);
      }
      timeout = $timeout(freshEvent, 4000);
    }

    freshEvent();
    $scope.$on('$destroy', function () {
      if (timeout) {
        $timeout.cancel(timeout);
      }
    });
  }]);

}(angular.module('domeApp')));
