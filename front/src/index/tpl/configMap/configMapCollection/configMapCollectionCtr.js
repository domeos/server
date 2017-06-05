/**
 * Created by haozhou on 2017/2/9.
 */
;(function (domeApp) {
    'use strict';
    domeApp.controller('ConfigMapCollectionCtr', ['$scope', '$state', 'api', 'dialog', function ($scope, $state, api, dialog) {
        function init() {
            $scope.isLoading = true;
            api.configMap.listConfigMapCollection().then(function (res) {
                $scope.configMapCollectionList = res;
            }).catch(() => {
            }).then(() => {
                $scope.isLoading = false;
            });
        }

        init();
        $scope.delete = function (id) {
            dialog.danger('确认删除', '确认要删除吗？').then(button => { if (button !== dialog.button.BUTTON_OK) throw '' }).then(function() {
                api.configMap.deleteConfigMapCollection(id).then(function () {
                    init();
                }).catch(function (error) {
                    dialog.error('删除失败！', error.message || '删除配置集合时发生错误');
                });
            });
        };
        $scope.saveModify = function (configMapCollection) {
            api.configMap.updateConfigMapCollection(configMapCollection).then(response => {
            }).catch(function (error) {
                dialog.error('修改失败',error.message || '修改配置集合时出现错误');
                init();
            });
        };
        $scope.cancelModify = function () {
            init();
        };
    }]);
})(angular.module('domeApp'));