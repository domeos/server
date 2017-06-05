/**
 * Created by haozhou on 2017/3/14.
 */
;(function (domeApp) {
  'use strict';
  domeApp.controller('LoadBalanceInfoCtr', ['$scope', '$state', 'api', 'dialog', '$timeout', function ($scope, $state, api, dialog, $timeout) {
    $scope.loadBalanceCollectionId = $state.params.id;
    let loadBalanceCollectionType = $state.params.type;
    if (!$scope.loadBalanceCollectionId) {
      $state.go('loadBalanceCollection');
      return;
    }
    const pageTabsHash = {
      'KUBE_PROXY': [
        {text: "列表", page: "", html: 'loadBalanceKubeProxyList.html'},
        {text: "成员", page: "users", lazy: false, html: 'loadBalanceCollectionUsers.html'},
      ],
      'NGINX': [
        {text: "列表", page: "", html: 'loadBalanceNginxList.html'},
        {text: "成员", page: "users", lazy: false, html: 'loadBalanceCollectionUsers.html'},
      ],
    };
    $scope.pageTabs = pageTabsHash[loadBalanceCollectionType];
    $scope.resourceType = 'LOADBALANCER_COLLECTION';
    // 登录用户角色
    $scope.setRole = function (role) {
      // $scope.hasDeletePermission = () => role === 'MASTER';
      // $scope.hasUpdatePermission = () => role === 'MASTER' || role === 'DEVELOPER';
      $scope.$broadcast('loadBalanceCurrentRole', {
        role: role,
      });
    };
    $scope.exitToList = () => {
      $state.go('loadBalanceCollection');
    };
  }]);
  domeApp.controller('LoadBalanceListCtr', ['$scope', '$state', 'api', '$domePublic', 'dialog', function ($scope, $state, api, $domePublic, dialog) {
    $scope.loadBalanceCollectionId = $state.params.id;
    if (!$scope.loadBalanceCollectionId) {
      $state.go('loadBalanceCollection');
    }
    const update_no_Delete = () => {
      $scope.noDeleteList = $scope.hasDeletePermission() ? [] : $scope.loadBalanceInfo.filteredLoadBalanceList;
      $scope.noEditList = $scope.hasUpdatePermission() ? [] : $scope.loadBalanceInfo.filteredLoadBalanceList;
    };
    $scope.$on('loadBalanceCurrentRole', function (event, response) {
      $scope.currentRole = response.role;
      update_no_Delete();
    });
    $scope.hasDeletePermission = () => $scope.currentRole === 'MASTER';
    $scope.hasUpdatePermission = () => $scope.currentRole === 'MASTER' || $scope.currentRole === 'DEVELOPER';
    $scope.loadBalanceInfo = {
      loadBalanceList: [],
      filteredLoadBalanceList: [],
      searchKeyword: '',
    };
    $scope.filterLoadBalanceList = function () {
      $scope.loadBalanceInfo.filteredLoadBalanceList = $scope.loadBalanceInfo.loadBalanceList.filter(function (loadBalance) {
        return loadBalance.name.indexOf($scope.loadBalanceInfo.searchKeyword) !== -1;
      });
      update_no_Delete();
    };
    function initList() {
      $scope.isLoading = true;
      api.loadBalance.loadBalance.list($scope.loadBalanceCollectionId).then(function (response) {
        $scope.loadBalanceInfo.loadBalanceList = response || [];
        $scope.filterLoadBalanceList();
      }).catch(() => {
      }).then(function () {
        $scope.isLoading = false;
      });
    }

    initList();

    $scope.deleteLoadBalance = function (loadBalance) {
      dialog.danger('确认删除', '确认要删除吗？').then(button => {
        if (button !== dialog.button.BUTTON_OK) {
          initList();
          throw '';
        }
      }).then(function () {
        api.loadBalance.loadBalance.delete(loadBalance.id).then(response => {
        }).catch(error => {
          dialog.error('删除错误', error.message || '删除时出现错误');
        }).then(() => {
          initList();
        });
      });
    };
    $scope.onSuccess = function(e, info) {
      dialog.tip('复制成功', info);
      e.clearSelection();
    };
    $scope.onError = function(e) {
      dialog.alert('复制失败','');
    };

  }]);
})(angular.module('domeApp'));