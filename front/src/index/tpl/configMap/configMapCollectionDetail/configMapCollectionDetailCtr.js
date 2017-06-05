/**
 * Created by haozhou on 2017/2/9.
 */
;(function (domeApp) {
    'use strict';
    domeApp.controller('ConfigMapCollectionDetailCtr', ['$scope', '$state', 'api', 'dialog', function ($scope, $state, api, dialog) {
        $scope.configMapCollectionId = $state.params.id;
        if (!$scope.configMapCollectionId) {
            $state.go('configMapCollection');
        }
        $scope.resourceType = 'CONFIGURATION_COLLECTION';
        // 登录用户角色
        $scope.setRole = function (role) {
            $scope.hasDeletePermission = () => role === 'MASTER';
            $scope.$broadcast('configMapCurrentRole', {
                role: role,
            });
        };
        $scope.exitToList = () => {
            $state.go('configMapCollection');
        };
        function init() {
            api.configMap.getConfigMapCollectionById($scope.configMapCollectionId).then(function (response) {
                $scope.configMapCollectionInfo = response;
                if (response == null) {
                    $state.go('configMapCollection');
                }
            }).catch(function (error) {
                $state.go('configMapCollection');
                console.log("get config map error:", error);
            });
        }

        init();
        $scope.delete = function () {
            dialog.danger('确认删除', '确认要删除吗？').then(button => { if (button !== dialog.button.BUTTON_OK) throw '' }).then(function() {
                api.configMap.deleteConfigMapCollection($scope.configMapCollectionId).then(function () {
                    $state.go('configMapCollection');
                }).catch(function (error) {
                    dialog.error('删除失败！', error.message || '删除配置集合时发生错误');
                });
            });
        };
    }]);
    domeApp.controller('ConfigMapListCtr', ['$scope', '$state', 'api', 'dialog', function ($scope, $state, api, dialog) {
        $scope.configMapCollectionId = $state.params.id;
        if (!$scope.configMapCollectionId) {
            $state.go('configMapCollection');
        }
        const update_no_Delete = () => {
            $scope.noDeleteList = $scope.hasDeletePermission() ? [] : $scope.configMapInfo.filteredConfigMapList;
        };
        $scope.$on('configMapCurrentRole', function (event, response) {
            $scope.currentRole = response.role;
            update_no_Delete();
        });
        $scope.hasDeletePermission = () => $scope.currentRole === 'MASTER';
        $scope.configMapInfo = {
            configMapList: [],
            filteredConfigMapList: [],
            searchKeyword: '',
        };

        $scope.filterConfigMapList = function () {
            $scope.configMapInfo.filteredConfigMapList = $scope.configMapInfo.configMapList.filter(function (configMap) {
                return configMap.name.indexOf($scope.configMapInfo.searchKeyword) !== -1;
            });
            update_no_Delete();
        };
        function initList() {
            $scope.isLoading = true;
            api.configMap.listConfigMap($scope.configMapCollectionId).then(function (response) {
                $scope.configMapInfo.configMapList = response || [];
                $scope.filterConfigMapList();
            }).catch(() => {
            }).then(function () {
                $scope.isLoading = false;
            });
        }

        initList();
        $scope.listRelatedDeploy = function (configMap) {
            dialog.common({
                title: '查看关联部署',
                buttons: dialog.buttons.BUTTON_OK_ONLY,
                value: {configMapId: configMap.id},
                controller: 'ListRelatedDeployCtr',
                template: `
                <form>
                    <form-container>
                        <form-table
                            ng-model="configMapRelatedDeployList"
                            template="relatedDeployListTable"
                            columns="[
                                { text: '服务名称', key: 'deployCollectionName', width: '25%' },
                                { text: '部署名称', key: 'deployName', width: '25%' },
                                { text: '服务版本', key: 'versionIdInDeploy', width: '25%' },
                                { text: '创建时间', key: 'deployCreateTime', width: '25%' },
                            ]"
                            empty-text="{{ isLoading ? '正在获取配置列表，请稍候' : '无关联部署信息'}}"
                            param="{ showDeploy: showDeploy }"
                        ></form-table>
                    <form-container>
                </form>
                <script type="text/ng-template" id="relatedDeployListTable">
                    <div ng-if="column.key === 'deployCollectionName'" ng-bind="value"></div>
                    <div ng-if="column.key === 'deployName'">
                        <a class="ui-table-link" ng-click="param.showDeploy(row)" ng-bind="value"></a>
                    </div>
                    <div ng-if="column.key === 'versionIdInDeploy'" ng-bind="'version'+value"></div>
                    <div ng-if="column.key === 'deployCreateTime'" ng-bind="value | date:'yyyy-MM-dd' "></div>
                </script>
                `,
                size: 600
            });
        };
        $scope.deleteConfigMap = function (configMap) {
            dialog.danger('确认删除', '确认要删除吗？').then(button => { if (button !== dialog.button.BUTTON_OK) throw '' }).then(function() {
                api.configMap.deleteConfigMap(configMap.id).then(function () {
                    initList();
                }).catch(function (error) {
                    dialog.error('删除失败', error.message || '删除配置文件时出现错误');
                });
            }, function () {
               initList();
            });
        };

    }]);
    domeApp.controller('ListRelatedDeployCtr', ['$scope', 'api', '$state', '$window', function ($scope, api, $state, $window) {
        api.configMap.listRelatedDeploy($scope.value.configMapId).then(response => {
            $scope.configMapRelatedDeployList = response || [];
        });
        $scope.showDeploy = function (relatedDeploy) {
            $scope.close();
            $state.go('deployDetail', {
                id: relatedDeploy.deployId,
                collectionId: relatedDeploy.deployCollectionId,
                collectionName: relatedDeploy.deployCollectionName,
            });
            // watch to refresh left menu in directive.js
            $window.refreshMenu = Date.now().toString() + Math.random();
        };
    }])
})(angular.module('domeApp'));