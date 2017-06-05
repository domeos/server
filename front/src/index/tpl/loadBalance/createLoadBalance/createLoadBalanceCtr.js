/**
 * Created by haozhou on 2017/3/15.
 */
;(function (domeApp) {
  'use strict';
  // 创建kube proxy类型 负载均衡
  domeApp.controller('CreateKubeLoadBalanceCtr', ['$scope', '$state', 'api', 'dialog', function ($scope, $state, api, dialog) {
    let loadBalanceCollectionId = $state.params.id;
    let loadBalanceCollectionType = 'KUBE_PROXY';
    $scope.collectionId = loadBalanceCollectionId;
    $scope.type = loadBalanceCollectionType;
    if ($scope.loadBalanceCollectionId) {
      $state.go('loadBalanceInfo', {id: loadBalanceCollectionId, type: loadBalanceCollectionType}); // type有变动时需要手动修改
    }
    let loadBalanceType = 'EXTERNAL_SERVICE'; // INNER_SERVICE, EXTERNAL_SERVICE, NGINX
    $scope.loadBalanceDraft = {
      collectionId: loadBalanceCollectionId,
      type: loadBalanceType,
      serviceDraft: {
        sessionAffinity: false,
        lbPorts: [{
          port: null,
          targetPort: null,
          protocol: 'TCP',
        }],
      }
    };

    $scope.addPortSetting = function () {
      $scope.loadBalanceDraft.serviceDraft.lbPorts.push({
        port: null,
        targetPort: null,
        protocol: 'TCP',
      });
      $scope.loadBalanceDraft.serviceDraft.lbPorts = $scope.loadBalanceDraft.serviceDraft.lbPorts.filter(ports => ports !== undefined);
    };
   
    $scope.cancel = function () {
      $state.go('loadBalanceInfo', {id: loadBalanceCollectionId, type: loadBalanceCollectionType});
    };
    $scope.createKubeLoadBalance = function () {
      $scope.isCreating = true;
      api.loadBalance.loadBalance.create($scope.loadBalanceDraft).then(() => {
        $state.go('loadBalanceInfo', {id: loadBalanceCollectionId, type: loadBalanceCollectionType});
      }).catch((error) => {
        dialog.error('新建失败', error.message);
      }).then(() => {
        $scope.isCreating = false;
      });
    };
  }]);
  // 创建nginx类型负载均衡
  domeApp.controller('CreateNginxLoadBalanceCtr', ['$scope', '$state', 'api', 'dialog', function ($scope, $state, api, dialog) {
    let loadBalanceCollectionId = $state.params.id;
    let loadBalanceCollectionType = 'NGINX';
    $scope.collectionId = loadBalanceCollectionId;
    $scope.type = loadBalanceCollectionType;
    let loadBalanceType = 'NGINX'; // INNER_SERVICE, EXTERNAL_SERVICE, NGINX
    if ($scope.loadBalanceCollectionId) {
      $state.go('loadBalanceInfo', {id: loadBalanceCollectionId, type: loadBalanceCollectionType}); // type有变动时需要手动修改
    }
    $scope.loadBalanceDraft = {
      collectionId: loadBalanceCollectionId,
      type: loadBalanceType,
      nginxDraft: {
        registry: 'https://pub.domeos.org',
        image: 'domeos/nginx-controller',
        tag: '1.0',
        cpu: 0.5,
        mem: 1024,
        volumeConsole: {
          volumeType: 'EMPTYDIR'
        },
        rules: [],
      }
    };
    $scope.logStoragePrompt = {
      HOSTPATH: '该类别会将主机目录挂载到nginx容器内部，nginx实例调度后存在于主机目录的日志文件不会丢失',
      EMPTYDIR: 'nginx的日志会打到容器的控制台，nginx实例调度时，日志会丢失',
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
          $scope.isUserDefined = true; // 默认
          $scope.loadBalanceDraft.nginxDraft.registry = otherImage.registry;
          $scope.loadBalanceDraft.nginxDraft.image = otherImage.name;
          $scope.loadBalanceDraft.nginxDraft.tag = otherImage.tag;
        }
      });
    };
    $scope.cancel = function () {
      $state.go('loadBalanceInfo', {id: loadBalanceCollectionId, type: loadBalanceCollectionType});
    };
    $scope.createNginxLoadBalance = function () {
      $scope.isCreating = true;
      api.loadBalance.loadBalance.create($scope.loadBalanceDraft).then(() => {
        $state.go('loadBalanceInfo', {id: loadBalanceCollectionId, type: loadBalanceCollectionType});
      }).catch((error) => {
        dialog.error('新建失败', error.message);
      }).then(() => {
        $scope.isCreating = false;
      });
    }
  }]);

}(angular.module('domeApp')));