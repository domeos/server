/**
 * Created by haozhou on 2017/3/14.
 */
;(function (domeApp) {
  'use strict';
  domeApp.controller('LoadBalanceCollectionCtr', ['$scope', '$state', 'api', 'dialog', function ($scope, $state, api, dialog) {
    function init() {
      $scope.isLoading = true;
      api.loadBalance.collection.list().then((response) => {
        $scope.loadBalanceCollectionList = response;
      }).catch(() => {
      }).then(() => {
        $scope.isLoading = false;
      });
    }

    init();
    $scope.delete = function (loadBalanceCollection) {
      dialog.danger('删除', `是否确认删除负载均衡：${loadBalanceCollection.name}`).then(buttonCode => {
        if (buttonCode === dialog.button.BUTTON_OK) {
          api.loadBalance.collection.delete(loadBalanceCollection.id).then(() => {
          }).catch((error) => {
            dialog.error('删除失败！', error.message || '删除负载均衡时发生错误');
          }).then(() => {init();});
        }
      })
    };
    $scope.saveModify = function (loadBalanceCollection) {
      api.loadBalance.collection.update(loadBalanceCollection).then(() => {
      }).catch((error) => {
        dialog.error('修改失败！', error.message || '修改负载均衡时发生错误');
      }).then(() => {init();});
    };
    $scope.cancelModify = function () {
      init();
    };
  }]);
})(angular.module('domeApp'));
