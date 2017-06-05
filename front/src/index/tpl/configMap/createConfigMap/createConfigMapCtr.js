/**
 * Created by haozhou on 2017/2/13.
 */
;(function (domeApp) {
    'use strict';
    domeApp.controller('CreateConfigMapCtr', ['$scope', '$state', 'api', 'dialog', function ($scope, $state, api, dialog) {
        let configMapCollectionId = $state.params.id;
        if (!configMapCollectionId) {
            $state.go('configMapCollection');
        }
        $scope.configMap = {};
        function initCluster() {
            $scope.isLoadingCluster = true;
            api.cluster.listCluster().then(function (response) {
                let clusterList = response || [];
                if (clusterList.length > 0) {
                    $scope.configMap.clusterId = clusterList[0].id;
                }
                $scope.clusterOption = [];
                clusterList.map(function (cluster) {
                    $scope.clusterOption.push({
                        text: cluster.name,
                        value: cluster.id
                    });
                });
            }).catch(() => {}).then(function () {
                $scope.isLoadingCluster = false;
            });
        }

        initCluster();
        $scope.initNamespace = function (clusterId) {
            $scope.configMap.namespace = null;
            api.cluster.getNamespace(clusterId).then(function (response) {
                let namespaceList = response || [];
                $scope.namespaceOption = [];
                namespaceList.map(function (namespace) {
                    if (namespace.name === 'default') {
                        $scope.configMap.namespace = namespace.name;
                    }
                    $scope.namespaceOption.push({
                        text: namespace.name,
                        value: namespace.name
                    });
                });
                if ($scope.configMap.namespace == null) {
                    $scope.configMap.namespace = namespaceList[0].name;
                }
            });
        };
        $scope.cancel = function () {
            $state.go('configMapCollectionDetail', {id: configMapCollectionId});
        };
        $scope.createConfigMapSubmit = function () {
            api.configMap.createConfigMap(configMapCollectionId, $scope.configMap).then(function () {
                $state.go('configMapCollectionDetail', {id: configMapCollectionId});
            }).catch(function (exception) {
                dialog.error('新建错误！', exception.message || '新建配置时发生错误');
            });
        };
    }]);
    domeApp.directive('isConfigmapUnique', ['api', function (api) {
        return {
            require: 'ngModel',
            scope: [],
            link: function (scope, element, attrs, controller) {
                let configMapList = [];
                scope.$watch(function (oldValue) {
                    return oldValue;
                }, function (newValue) {
                    api.configMap.listConfigMapAll().then(function (response) {
                        configMapList = response || [];
                    });
                });
                controller.$parsers.unshift(function (viewValue) {
                    let isConfigmapUnique = configMapList.every(function (configMap) {
                        return configMap.name !== viewValue;
                    });
                    controller.$setValidity('isConfigmapUnique', isConfigmapUnique);
                    return viewValue;
                });
            }

        };
    }]);
})(angular.module('domeApp'));

(function (formInputs) {
    formInputs.component('multipleConfigFiles', {
        template: `
            <form-array-container
                type="complex" 
                ng-model="$ctrl.configFileList" 
                max-length="100" 
                min-length="1" 
                template="configFile.html"
            ></form-array-container>
            <script type="text/ng-template" id="configFile.html">
                <form-multiple-inline>
                    <form-multiple-inline-item class="config-file-container config-file-id-container">
                        <span ng-bind="$index + 1"></span>
                    </form-multiple-inline-item>
                    <form-multiple-inline-item class="config-file-container">
                        <div>
                            <span>文件名称</span>
                            <input type="text" name="fileName{{$index}}" ng-model="$ctrl.ngModel[$index].name" placeholder="请输入文件名" required/>
                        </div>
                        <div>
                            <span>文件内容</span>
                            <codearea ng-model="$ctrl.ngModel[$index].content" height="10,50" required></codearea>
                        </div>
                    </form-multiple-inline-item>
                </form-multiple-inline>
            </script>
        `,
        bindings: {
            configFileList: '='
        },
    });
}(angular.module('formInputs')));
