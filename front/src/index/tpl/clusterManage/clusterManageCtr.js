/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;
    domeApp.controller('ClusterManageCtr', ['$scope', '$domeCluster', function ($scope, $domeCluster) {
        $scope.$emit('pageTitle', {
            title: '集群管理',
            descrition: '在这里您可以查看和管理自己的物理集群，并随时添加主机到集群中。',
            mod: 'cluster'
        });
        $scope.isLoading = true;
        var clusterService = $domeCluster.getInstance('ClusterService');
        var nodeService = $domeCluster.getInstance('NodeService');
        clusterService.getData().then(function (res) {
            $scope.clusterList = res.data.result || [];
        }).finally(function () {
            $scope.isLoading = false;
        });
        $scope.deleteCluster = function(clusterId) {
            nodeService.deleteData(clusterId).then(function() {
                for (var i = 0; i < $scope.clusterList.length; i++) {
                    if ($scope.clusterList[i].id === clusterId) {
                        $scope.clusterList.splice(i, 1);
                    }
                }
                $state.go('clusterManage');
            });
        };
    }]);
})(angular.module('domeApp'));