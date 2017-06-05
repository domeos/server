/**
 * Created by haozhou on 2017/3/14.
 */
;(function (domeApp) {
    'use strict';
    domeApp.controller('CreateLoadBalanceCollectionCtr', ['$scope', '$state', 'api', 'dialog', function ($scope, $state, api, dialog) {
        let collection = {
            type: "LOADBALANCER_COLLECTION",
            id: null,
        };
        $scope.loadBalanceCollection = {}; // 初始化负载均衡
        $scope.chosenUserList = []; // 初始化待添加的用户
        $scope.loadBalanceCollectionTypeRadioList = [
            { value: 'KUBE_PROXY', text: 'kube_proxy'},
            { value: 'NGINX', text: 'nginx'},
        ];
        $scope.createLoadBalanceCollectionSubmit = function () {
            api.loadBalance.collection.create($scope.loadBalanceCollection).then(collectionResponse => {
                collection.id = collectionResponse.id;
            }).then(() => {
                api.memberCollection.addMany(collection, $scope.chosenUserList).then(function () {
                    $state.go('loadBalanceCollection');
                }).catch(function (userError) {
                    dialog.error('添加用户失败！', userError.message || '添加用户时发生错误');
                });
            }).catch(function (error) {
                dialog.error( '新建错误！', error.message || '新建配置集合时发生错误');
            });
        };
    }]);
}(angular.module('domeApp')));