/**
 * Created by haozhou on 2017/2/10.
 */
;(function (domeApp) {
    'use strict';
    domeApp.controller('CreateConfigMapCollectionCtr', ['$scope', 'api', 'dialog', '$state', function ($scope, api, dialog, $state) {
        let collection = {
            type: "CONFIGURATION_COLLECTION",
            id: null,
        };
        $scope.chosenUserList = [];
        $scope.configMapCollection = {};
        $scope.createConfigMapSubmit = function () {
            api.configMap.createConfigMapCollection($scope.configMapCollection).then(configMapCollection => {
                collection.id = configMapCollection.id;
            }).then(() => {
                api.memberCollection.addMany(collection, $scope.chosenUserList).then(function () {
                    $state.go('configMapCollection');
                }, function (error) {
                    dialog.error('添加用户失败！', error.message || '添加用户时发生错误');
                });
            }).catch(function (error) {
                dialog.error('新建错误！', error.message || '新建配置集合时发生错误');
            });
        }
    }]);
    domeApp.directive('isConfigCollectionUnique', ['api', function (api) {
        return {
            require: 'ngModel',
            scope: [],
            link: function (scope, element, attrs, controller) {
                let configMapCollectionList = [];
                scope.$watch(function (oldValue) {
                    return oldValue;
                }, function (newValue) {
                    api.configMap.listConfigMapCollection().then(function (response) {
                        configMapCollectionList = response || [];
                    });
                });
                controller.$parsers.unshift(function (viewValue) {
                    let isConfigCollectionUnique = configMapCollectionList.every(function (configMapCollection) {
                        return configMapCollection.name !== viewValue;
                    });
                    controller.$setValidity('isConfigCollectionUnique', isConfigCollectionUnique);
                    return viewValue;
                });
            }
        }
    }]);
})(angular.module('domeApp'));