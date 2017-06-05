/**
 * Created by haozhou on 2017/4/5.
 */
(function (formInputs) {
  const genUniqueId = (function () {
    let currentIndex = Date.now();
    let randomText = () => Math.random().toString(36)[4] || '0';
    return () => {
      let text = [...Array(8)].map(randomText).join('').toUpperCase();
      return `AUTO_GENERATED_INDEX_${++currentIndex}_${text}`;
    };
  }());
  /**
  * <lb-related-deployment-with-port> 关联部署和端口组件
  * ngModel (双向, array=[{deployment, domain, servicePort}])
  * parameters {clusterId,namespace,loadBalanceType}
  * formName 表单验证
  */
  formInputs.component('lbRelatedDeploymentWithPort', {
    template: `
        <form-input-container>
          <form-multiple-inline>
          <form-multiple-inline-item style="flex: 3; margin: 0 6px 0 0;">
            <form-select-list ng-model="$ctrl.ngModel.deployment" name="_NginxRelatedDeployment{{$ctrl.order}}" on-change="$ctrl.toggleDeployment($ctrl.ngModel.deployment)" form-name="$ctrl.formName"  parameters="$ctrl.parameters" loading-text="正在获取部署信息" empty-text="无相关信息" placeholder="请选择部署" get-list-fn="{{'loadBalanceDeployment'}}" error-message="关联部署不能为空" fallback-options="{value:{deployId:$ctrl.ngModel.deployment.deployId,deployName:$ctrl.ngModel.deployment.deployName,deployStatus:$ctrl.ngModel.deployment.deployStatus,innerServiceName:$ctrl.ngModel.serviceName,ports:[$ctrl.ngModel.servicePort]},text:$ctrl.ngModel.deployment.deployName,match:{deployName:$ctrl.ngModel.deployment.deployName}}"></form-select-list>
          </form-multiple-inline-item>
          <form-multiple-inline-item" style="flex: 1;margin: 0 6px 0 0;">
            <form-select ng-model="$ctrl.value" name="_ServicePort{{$ctrl.order}}" options="$ctrl.deploymentPortSelectorList" show-search-input="never" placeholder="请选择服务端口" empty-text="无相关信息" required="true" on-change="$ctrl.togglePort()"></form-select>
            <form-error-message form="$ctrl.formName" target="_ServicePort{{$ctrl.order}}" type="required">服务端口不能为空</form-error-message>
          </form-multiple-inline-item>
          </form-multiple-inline>
        <form-input-container>
      `,
    bindings: {
      ngModel: '=',
      parameters: '<?',
      formName: '<?',
      order: '<?',
    },
    controller: ['$scope', 'api', function ($scope, api) {
      const $ctrl = this;
      $ctrl.order = genUniqueId();
      $ctrl.input = function () {
        if (!$ctrl.ngModel || !$ctrl.ngModel.deployment) {
          $ctrl.value = null;
          $ctrl.deploymentPortSelectorList = [];
          $ctrl.output();
          return;
        }

        if($ctrl.ngModel.deployment.ports && $ctrl.ngModel.deployment.ports.length){
          $ctrl.deploymentPortSelectorList = $ctrl.ngModel.deployment.ports.map(port => ({ value: port, text: port }));
        }
        else{
          return;
        }

        if (!$ctrl.deploymentPortSelectorList.some(port => {
          if ($ctrl.ngModel.servicePort === port.text) {
            $ctrl.value = port.value;
            return !0;
          }
          return !1;
        }))
          $ctrl.value = null;
        $ctrl.output();
      };

      $ctrl.output = function () {
        if (!angular.equals($ctrl.ngModel.servicePort, $ctrl.value)) $ctrl.ngModel.servicePort = $ctrl.value;
      };

      $ctrl.toggleDeployment = function (deployment) {
        if (!deployment && !deployment.ports) return;
        $ctrl.deploymentPortSelectorList = (angular.copy(deployment.ports) || []).map(port => ({ value: port, text: port }));
        $ctrl.input();
      }

      $ctrl.togglePort = function () {
        $ctrl.output();
      };

      $scope.$watchCollection('$ctrl.ngModel.deployment', $ctrl.input);
    }]
  })

  /**
   * <lb-nginx-rule> nginx负载均衡转发规则组件
   * ngModel (双向, array=[{deployment, domain, servicePort}])
   * clusterId 集群ID
   * namespace
   * loadBalanceType
   * formName 表单验证
   */
  formInputs.component('lbNginxRule', {
    template: `
      <div class="form-array-item" style="border: 1px solid #ddd; border-radius: 3px; margin-bottom: 10px; padding-left: 10px;" ng-repeat="rule in $ctrl.ngModel">
        <div class="form-array-item-delete" ng-click="$ctrl.deleteRule($index)" ng-if="$ctrl.ngModel.length > 0">
          <icon-close class="form-array-item-delete-icon"></icon-close>
        </div>
        <form-config-group>
          <form-config-item config-title="服务域名">
            <form-input-container>
              <input type="text" ng-model="rule.domain" required/>
            </form-input-container>
          </form-config-item>
            <form-config-item config-title="关联部署">
                <lb-related-deployment-with-port ng-model="rule" order="$index" form-name="$ctrl.formName" parameters="$ctrl.parameters">
                </lb-related-deployment-with-port>
            </form-config-item>
        </form-config-group>
      </div>
      <a class="txt-bright"  ng-click="$ctrl.addRule()">
        <icon-plus></icon-plus>
        <span>添加新规则</span>
      </a> 
    `,
    bindings: {
      ngModel: '=',
      parameters: '<?',
      formName: '<?',
      index: '<?'
    },
    controller: ['$scope', 'api', function ($scope, api) {
      const $ctrl = this;

      $ctrl.addRule = function () {
        $ctrl.ngModel.push({
          domain: null,
          deployment: null,
          serviceName: null,
          servicePort: null,
        });
      };
      $ctrl.deleteRule = function (index) {
        $ctrl.ngModel.splice(index, 1);
      };
    }],
  });

}(angular.module('formInputs')));