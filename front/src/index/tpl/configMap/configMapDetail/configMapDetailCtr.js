/**
 * Created by haozhou on 2017/2/13.
 */
;(function (domeApp) {
    'use strict';
    domeApp.controller('ConfigMapDetailCtr', ['$scope', '$state', 'api', 'dialog', function ($scope, $state, api, dialog) {
        const configMapCollectionId = $state.params.id;
        const configMapId = $state.params.configMapId;
        if (!configMapCollectionId) {
            $state.go('configMapCollection');
        } else if (!configMapId) {
            $state.go('configMapCollectionDetail', {id: configMapCollectionId});
        }
        let resource = {
            id: configMapCollectionId,
            type: 'CONFIGURATION_COLLECTION',
        };
        api.user.myRole(resource).then(response => {
            $scope.hasDeletePermission = () => response === 'MASTER';
            $scope.$broadcast('configMapCurrentRole', {
                role: response,
            });
        });
        function initCollection() {
            api.configMap.getConfigMapCollectionById(configMapCollectionId).then(function (response) {
                $scope.configMapCollectionInfo = response;
            });
        }

        initCollection();

        $scope.delete = function () {
            dialog.danger('确认删除', '确认要删除吗？').then(button => { if (button !== dialog.button.BUTTON_OK) throw '' }).then(function() {
                api.configMap.deleteConfigMapCollection(configMapCollectionId).then(function () {
                    $state.go('configMapCollection');
                }).catch(function (error) {
                    dialog.error('删除失败！', error.message || '删除配置集合时发生错误');
                });
            });
        };
    }]);

    domeApp.controller('ConfigMapDetailInfoCtr', ['$scope', '$state', 'api', 'dialog', function ($scope, $state, api, dialog) {
        $scope.$on('configMapCurrentRole', function (event, response) {
            $scope.currentRole = response.role;
            // console.log("currentRole:", $scope.currentRole);
        });
        const configMapCollectionId = $state.params.id;
        const configMapId = $state.params.configMapId;
        $scope.isEditConfigMap = false;
        $scope.configMapDetailInfo = {};
        //获取当前用户角色
        $scope.$on('configMapCurrentRole', function (event, response) {
            $scope.currentRole = response.role;
        });
        $scope.hasDeletePermission = () => $scope.currentRole === 'MASTER';
        $scope.hasPostPermission = () => $scope.currentRole === 'MASTER' || $scope.currentRole === 'DEVELOPER';
        function initConfigMapInfo() {
            $scope.isLoading = true;
            api.configMap.getConfigMap(configMapId).then(response => {
                $scope.configMapDetailInfo = response || {};
            }, (error) => {
                console.error(error.message);
            }).then(() => {
                $scope.isLoading = false;
            });
        }

        initConfigMapInfo();
        $scope.updateConfigMap = function () {
            if ($scope.configMapDetailInfo.configFileList.every(configMap => {return configMap && configMap.name && configMap.content})) {
                $scope.isUpdating = true;
                api.configMap.updateConfigMap(configMapCollectionId, $scope.configMapDetailInfo).then(() => {
                    $scope.toggleEdit();
                    initConfigMapInfo();
                }).catch(error => {
                    dialog.error('修改失败！', error.message || '修改配置信息时出现错误');
                }).then(()=>{
                    $scope.isUpdating = false;
                });
            } else {
                dialog.error('','请填写文件名称和文件内容，并检查填写内容的格式');
            }
        };
        $scope.toggleEdit = function (option) {
            $scope.isEditConfigMap = !$scope.isEditConfigMap;
            if (option === 'cancel') {
                $scope.isEditConfigMap = false;
            }
            if($scope.isEditConfigMap){
                initConfigMapInfo();
            }
        };
    }]);
}(angular.module('domeApp')));


(function (formInputs) {
    formInputs.component('multipleConfigFileRead', {
        template: `
            <form-array-container
                type="complex"
                ng-model="$ctrl.configFileList"
                max-length="$ctrl.configFileList.length"
                min-length="$ctrl.configFileList.length"
                template="configFileRead.html"
            ></form-array-container>
            <script type="text/ng-template" id="configFileRead.html">
                <form-multiple-inline>
                    <form-multiple-inline-item class="config-file-container config-file-id-container">
                        <span ng-bind="$index + 1"></span>
                    </form-multiple-inline-item>
                    <form-multiple-inline-item class="config-file-container">
                        <div>
                            <span>文件名称</span>
                            <input type="text" name="fileName{{$index}}" ng-model="$ctrl.ngModel[$index].name" readonly/>
                        </div>
                        <div>
                            <span>文件内容</span>
                            <codearea ng-model="$ctrl.ngModel[$index].content" height="10,50" readonly="true"></codearea>
                        </div>
                    </form-multiple-inline-item>
                </form-multiple-inline>
            </script>
        `,
        bindings: {
            configFileList: '='
        },
        controller: function () {
        }
    });
    formInputs.component('multipleConfigFileWrite', {
        template: `
            <form-array-container
                type="complex" 
                ng-model="$ctrl.configFileList" 
                max-length="100" 
                min-length="1" 
                template="configFileWrite.html"
            ></form-array-container>
            <script type="text/ng-template" id="configFileWrite.html">
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