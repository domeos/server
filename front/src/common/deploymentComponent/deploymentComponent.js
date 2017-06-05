;(function (formInputs) {
    /**
     * <host-label-selector> 主机标签下拉选择框，可查看主机列表
     * ng-model (双向，数组)已选择主机标签
     * cluster {id,...} (集群对象)传入参数，用于获取主机标签 （必填）
     * host-env （单向，TEST or PROD） 根据label查询主机时，需要加工作场景标签
     */
    formInputs.component("hostLabelSelector", {
        template: `
        <form-with-button width="150px">
          <content-area>
            <form-multiple-select ng-model="$ctrl.value" options="$ctrl.labelSelectorsList" on-change="$ctrl.output()" placeholder="请选择主机标签" is-loading="$ctrl.isLoadingLabel" loading-text="正在获取主机标签" empty-text="无相关信息"></form-multiple-select>
          </content-area>
          <button-area>
            <button type="button" ng-click="$ctrl.showHost()" >查看选中主机</button>
          </button-area>  
        </form-with-button>
      `,
        bindings: {
            ngModel: '=?',
            cluster: '<?',
            hostEnv: '<?',
        },
        controller: ['$scope', 'api', 'dialog', function ($scope, api, dialog) {
            const $ctrl = this;
            let isFirstGetHostLabel = true;
            let hostLabels = [];
            $ctrl.labelSelectorsList = [];
            let hostLabelListPromise = api.SimplePromise.resolve([]);
            const getHostLabel = function () {
                if(!isFirstGetHostLabel) {
                    $ctrl.ngModel = null;
                    $ctrl.value = null; //清空
                }
                $ctrl.isLoadingLabel = true;
                if ($ctrl.cluster && $ctrl.cluster.id) {
                    hostLabelListPromise = api.cluster.listHostLabel($ctrl.cluster.id).then(response => {
                        let labelList = response || [];
                        $ctrl.labelSelectorsList = labelList.filter(label => {
                            return label.content === 'USER_LABEL_VALUE';
                        }).map(label => {
                            return {text: label.name, value: label}; // options数组
                        });
                        return $ctrl.labelSelectorsList;
                    });
                    hostLabelListPromise.catch(() => {
                    }).then(() => {
                        $ctrl.isLoadingLabel = false;
                        isFirstGetHostLabel = false;
                    });
                }
            };
            $ctrl.showHost = function () {
                updateHostEnvLabel();
                let nodeList = [];
                let isLoadingNode = {loading: true};
                api.cluster.listNodeByLabels($ctrl.cluster.id, hostLabels).then(response => {
                    Array.prototype.push.apply(nodeList, response);
                }).catch(() => {
                }).then(() => {
                    isLoadingNode.loading = false;
                });
                dialog.common({
                    title: '主机列表',
                    buttons: dialog.buttons.BUTTON_OK_ONLY,
                    value: {nodeList, isLoadingNode},
                    template: `
                    <form-container>
                    <form-table
                        ng-model="value.nodeList"
                        template="nodeListByLabelsTable"
                        columns="[
                            { text: '主机名', key: 'name', width: '30%' },
                            { text: 'IP地址', key: 'ip', width: '30%' },
                            { text: '实例个数', key: 'runningPods', width: '20%' },
                            { text: '状态', key: 'status', width: '20%' },
                        ]"
                        empty-text="{{ value.isLoadingNode.loading ? '加载中...' : '无主机信息' }}"
                    ></form-table>
                    </form-container>
                    <script type="text/ng-template" id="nodeListByLabelsTable">
                        <div ng-if="column.key === 'name'" ng-bind="value"></div>
                        <div ng-if="column.key === 'ip'" ng-bind="value"></div>
                        <div ng-if="column.key === 'runningPods'" ng-bind="value"></div>
                        <div ng-if="column.key === 'status'" ng-bind="value"></div>
                    </script>
                    `,
                    size: 600
                });
            };
            // ngModel 初始不为空时，需要匹配options列表展示ngModel数组
            const input = function () {
                if (!angular.isArray($ctrl.ngModel)) return;
                if (angular.equals($ctrl.ngModel, $ctrl.value)) return;
                if ($ctrl.ngModel.length > 0) {
                    hostLabelListPromise.then(response => {
                        ($ctrl.ngModel || []).forEach(inputLabel => {
                            $ctrl.value = $ctrl.value.concat(response.filter(label => {
                                return inputLabel.name === label.text;
                            }));
                        });
                        $ctrl.value = ($ctrl.value || []).map(label => label.value);
                    });
                }
            };
            $ctrl.output = function () {
                if (!angular.equals($ctrl.ngModel, $ctrl.value)) $ctrl.ngModel = $ctrl.value;
            };
            const updateHostEnvLabel = function () {
                if ($ctrl.hostEnv) {
                    const hostEnvLabelMap = {
                        TEST: {name: 'TESTENV', content: 'HOSTENVTYPE'},
                        PROD: {name: 'PRODENV', content: 'HOSTENVTYPE'}
                    };
                    hostLabels = angular.copy($ctrl.ngModel || []);
                    hostLabels = hostLabels.filter(label => {return label.content !== 'HOSTENVTYPE'}).concat(hostEnvLabelMap[$ctrl.hostEnv]);
                }
            };
            $scope.$watch('$ctrl.cluster', getHostLabel);
            $scope.$watch('$ctrl.ngModel', input);
        }],
    });
    /**
     * <image-tag-selector> 镜像版本下拉选择框，默认选择第一个镜像版本
     *
     * name (字符串)
     * ng-model （双向，object） 待绑定的镜像对象
     * image （必填）镜像摘要 {name, registry, tag} name和registry 作为查询tag的参数，不能为空
     * required （可选） 用于表单验证，表示不能为空
     * form （可选）用于表单验证，显示对应form内的错误信息
     */
    formInputs.component('imageTagSelector', {
        template: `
            <form-select 
                ng-model="$ctrl.value" 
                name="$ctrl.name" 
                options="$ctrl.imageTagSelectorList" 
                on-change="$ctrl.output()"
                placeholder="请选择版本" 
                is-loading="$ctrl.isLoadingImageTag" 
                loading-text="正在获取镜像版本" 
                required="$ctrl.required" 
                empty-text="无相关信息" 
            ></form-select>
            <form-error-message form="$ctrl.form" target="{{ $ctrl.name }}">镜像版本不能为空！</form-error-message>
            `,
        bindings: {
            name: '@',
            ngModel: '=?',
            image: '<?',
            required: '@',
            form: '<?',
        },
        controller: ['$scope', 'api', '$filter', function ($scope, api, $filter) {
            const $ctrl = this;
            let imageTagListPromise = api.SimplePromise.resolve([]);
            const listImageTags = function () {
                $ctrl.isLoadingImageTag = true;
                if ($ctrl.image && $ctrl.image.name && $ctrl.image.registry) {
                    imageTagListPromise = api.image.privateRegistry.listImageTags($ctrl.image.name, $ctrl.image.registry).then((response => {
                        $ctrl.imageTagSelectorList = (response || []).map(function (tag) {
                            return {
                                value: tag.tag,
                                text: tag.tag,
                                remark: $filter('date')(tag.createTime, 'yyyy-MM-dd HH:mm:ss')
                            };
                        }, []);
                        return $ctrl.imageTagSelectorList;
                    }));
                    imageTagListPromise.then(() => {
                        if (!$ctrl.image.tag) {
                            $ctrl.value = $ctrl.imageTagSelectorList && $ctrl.imageTagSelectorList[0] ? $ctrl.imageTagSelectorList[0].value : void 0;
                        } else {
                            if ($ctrl.imageTagSelectorList.length === 0) {
                                $ctrl.imageTagSelectorList = [{value: $ctrl.image.tag, text: $ctrl.image.tag}];
                                $ctrl.value = $ctrl.image.tag;
                            }
                        }
                    }).catch(() => {
                    }).then(() => {
                        $ctrl.isLoadingImageTag = false;
                    });

                }
            };
            const input = function () {
                if (angular.equals($ctrl.ngModel, $ctrl.value)) return;
                if (!$ctrl.ngModel) return;
                //添加其他镜像，需要填写镜像版本
                imageTagListPromise.then(function () {
                    ($ctrl.imageTagSelectorList || []).forEach(function (tag) {
                        if (tag.value === $ctrl.image.tag) {
                            $ctrl.value = tag.value;
                        }
                    });
                });
            };
            $ctrl.output = function () {
                if (!angular.equals($ctrl.ngModel, $ctrl.value)) $ctrl.ngModel = $ctrl.value;
            };
            $scope.$watch('$ctrl.image', listImageTags);
            $scope.$watch('$ctrl.ngModel', input);
        }],
    });
    /**
     * <volume-mount-storage> 挂载存储组件，有复制存储功能
     *
     * name （字符串） 组件名称，并用于表单验证
     * ng-model (双向，数组) 挂载的存储对象数组
     * cluster （单项，对象） Reserved
     * namespace （单项，namespace） Reserved
     * containerConsoles （单项，容器对象数组） 用途：计算容器对象中所有已填写的存储对象，用于复制存储功能
     * containerIndex （字符串） 容器的索引，用于挂载存储的命名
     * imageName （字符串）当前镜像名称，用于挂载存储的命名
     */
    formInputs.component('volumeMountStorage', {
        template: `
        <style>
        .volume-mount-container-next { margin-right: 5px; }
        .volume-mount-container-name{ flex-grow: 0; flex-basis: 20%; }
        .volume-mount-container-type{ flex-grow: 0;flex-basis: 14%; }
        .volume-mount-container-readonly{ flex-grow: 0;flex-basis: 9%; }
        .volume-mount-container-content{ flex-grow: 2; }
        .volume-mount-container-path-only{}
        .volume-mount-container-path{ flex-grow: 0; flex-basis: 25%; margin-right: 5px;}
        </style>
        <form-array-container ng-model="$ctrl.ngModel" name="$ctrl.name" on-add="$ctrl.addVolumeMountItem()" template="$_volumeMountStorageItem" max-length="100" min-length="0" type="simple" param="$ctrl.param"></form-array-container>
        <button ng-if="$ctrl.isDisplayCopyVolume()" type="button" ng-click="$ctrl.showVolumeMountTable()">复制已有存储</button>
        <script type="text/ng-template" id="$_volumeMountStorageItem" >
            <form-multiple-inline>
                <form-multiple-inline-item class="volume-mount-container-type volume-mount-container-next">
                    <form-select ng-model="$ctrl.ngModel[$index].volumeType" options="[{value: 'HOSTPATH', text: '主机目录'},{value: 'EMPTYDIR', text: '实例内目录'}]" placeholder="请选择存储类型" required show-search-input="never" empty-text="无相关信息"></form-select>
                </form-multiple-inline-item>
                <form-multiple-inline-item class="volume-mount-container-readonly volume-mount-container-next">
                    <form-select ng-model="$ctrl.ngModel[$index].readonly" options="[{value: 'false', text: '读写'}, {value: 'true', text: '只读'}]" placeholder="请选择读写类型" required show-search-input="never"></form-select>
                </form-multiple-inline-item>
                <form-multiple-inline-item class="volume-mount-container-name volume-mount-container-next">
                    <!--<div ng-bind="$ctrl.ngModel[$index].name"></div>-->
                    <input type="text" ng-model="$ctrl.ngModel[$index].name" name="{{ $ctrl.param.name + 'name' }}" placeholder="输入名称，不可重复" required pattern="^[a-z0-9]([-a-z0-9]*[a-z0-9])?$">
                </form-multiple-inline-item>
                
                <form-multiple-inline-item ng-class="{true: 'volume-mount-container-path-only',false: 'volume-mount-container-path'}[$ctrl.ngModel[$index].volumeType === 'EMPTYDIR']">
                    <input type="text" ng-model="$ctrl.ngModel[$index].containerPath" name="{{ $ctrl.param.name + 'containerPath' }}" placeholder="容器内挂载路径，以/开头" required pattern="^/.*"/>
                </form-multiple-inline-item>
                <form-multiple-inline-item class="volume-mount-container-content" ng-if="$ctrl.ngModel[$index].volumeType === 'HOSTPATH'">
                    <input type="text" ng-model="$ctrl.ngModel[$index].hostPath" name="{{ $ctrl.param.name + 'hostPath' }}" placeholder="主机内目录，以‘/’开头" required pattern="^/.*"/>
                </form-multiple-inline-item>
            </form-multiple-inline>
        </script>
        `,
        bindings: {
            name: '@',
            ngModel: '=?',
            cluster: '<?',
            namespace: '<?',
            containerConsoles: '<?',
            containerIndex: '@',
            imageName: '@',
        },
        controller: ['$scope', 'api', 'dialog', function ($scope, api, dialog) {
            const $ctrl = this;
            $ctrl.param = {
                storageVolumeSelectorList: [],
                formName: $ctrl.formName,
                name: $ctrl.name,
            };
            let storageVolumePromise = api.SimplePromise.resolve([]);
            $ctrl.addVolumeMountItem = function () {
                $ctrl.ngModel.push({
                    copied: false,
                    name: '',//$ctrl.imageName + '-mount-' + $ctrl.containerIndex + $ctrl.ngModel.length,
                    volumeType: 'HOSTPATH',
                    readonly: 'false',
                    containerPath: '',
                    hostPath: '',
                    emptyDir: '',
                    volumePVC: {
                        claimName: '',
                        readOnly: false,
                        volumeId: null,
                        volumeName: null
                    },
                    volumeConfigMap: {},
                });
                $ctrl.ngModel = $ctrl.ngModel.filter(volumeMount => volumeMount != undefined); //去掉重复添加的volumeMount对象
            };
            $ctrl.isDisplayCopyVolume = function () {
                return ($ctrl.existentVolumeMountList && $ctrl.existentVolumeMountList.length > 0 && $ctrl.containerConsoles.length > 1);
            };
            $ctrl.showVolumeMountTable = function () {
                updateVolumeMount();
                dialog.common({
                    title: '复制已有存储',
                    buttons: dialog.buttons.BUTTON_OK_CANCEL,
                    value: {existentVolumeMountList: $ctrl.existentVolumeMountList},
                    template: `
                    <form-container>
                    <form-table
                        ng-model="value.existentVolumeMountList" 
                        template="existentVolumeMountTable" 
                        columns="[
                            { text: '类型', key: 'volumeType', width: '15%' },
                            { text: '权限', key: 'readonly', width: '10%' },
                            { text: '名称', key: 'name' },
                            { text: '容器内路径', key: 'containerPath', width: '15%' },
                            { text: '主机内目录', key: 'hostPath', width: '15%' },
                            { text: '选择', key: 'option', width: '10%' },
                        ]" 
                        empty-text="无存储信息" 
                    ></form-table>
                    <script type="text/ng-template" id="existentVolumeMountTable">
                        <div ng-if="column.key === 'name'" ng-bind="value || '无'"></div>
                        <div ng-if="column.key === 'readonly'" ng-bind="value === 'true' ? '只读': '读写'"></div>
                        <div ng-if="column.key === 'volumeType'" ng-bind="value === 'HOSTPATH'? '主机目录': value === 'EMPTYDIR' ? '实例内目录': ''"></div>
                        <div ng-if="column.key === 'hostPath'" ng-bind="value || '-'"></div>
                        <div ng-if="column.key === 'containerPath'" ng-bind="value || '-'"></div>
                        <div ng-if="column.key === 'option'">
                            <div ng-show="row.name">
                            <form-input-checkbox ng-model="row.copied" text="" value="true" value-false="false" ></form-input-checkbox>
                            </div>
                            <div ng-show="!row.name">无名称</div>
                        </div>
                    </script>
                    </form-container>
                    `,
                }).then((response) => {
                    if (response === dialog.button.BUTTON_OK) {
                        $ctrl.existentVolumeMountList.map(volume => {
                            if (volume.copied === true && $ctrl.ngModel.every(myVolume => myVolume.name !== volume.name)) {
                                volume.copied = false;
                                $ctrl.ngModel.push(angular.copy(volume));
                                input();
                            }
                            volume.copied = false;
                            return volume;
                        });
                    } else {
                        $ctrl.existentVolumeMountList.map(volume => (volume.copied = false));
                    }
                }).catch(() => {
                    $ctrl.existentVolumeMountList.map(volume => (volume.copied = false));
                });

            };
            // 通过复制添加的存储不修改名称
            // const updateVolumeMountName = function () {
            //     ($ctrl.ngModel || []).map((volumeMount, index) => {
            //         volumeMount.name = $ctrl.imageName + '-mount-' + $ctrl.containerIndex + index;
            //         return volumeMount;
            //     });
            // };
            // 计算当前所有镜像中挂载的存储
            const updateVolumeMount = function () {
                $ctrl.existentVolumeMountList = [];
                ($ctrl.containerConsoles || []).forEach(image => {
                    (image.volumeMountConsoles || []).forEach(volume => {
                        if ($ctrl.existentVolumeMountList.every(myVolume => myVolume.name !== volume.name))
                            $ctrl.existentVolumeMountList.push(volume);
                    });
                });
                //$scope.$apply();
            };
            const input = function () {
                if (!angular.isArray($ctrl.ngModel)) return;
                if ($ctrl.ngModel.length === 0) return;
            };
            $scope.$watch('$ctrl.ngModel', updateVolumeMount, true);
            $scope.$watch('$ctrl.ngModel', input);
            $scope.$watch('$ctrl.containerConsoles.volumeMountConsoles', updateVolumeMount, true);
            $scope.$watch('$ctrl.name', function () {
                $ctrl.param.name = $ctrl.name;
            });
        }],
    });
    /**
     * <volume-mount-configmap> 配置管理组件
     *
     * name （字符串） 组件名称，可用于表单验证
     * ng-model （双向，configMap数组）
     * cluster （单项，集群对象）用于获取configMap列表
     * namespace (单向，namespace) 用于获取configMap
     */
    formInputs.component('volumeMountConfigmap', {
        template: `
        <style>
        .config-map-name{ flex-grow: 0; flex-basis: 44%; margin-right: 6px;}
        .config-map-path{ }
        .config-map-error::before {
            content: "";
            position: absolute;
            left: 10px;;
            top: 20px;
            width: 0;
            height: 0;
            border-top: 5px solid #f5707a;
            border-right: 5px solid transparent;
            border-left: 5px solid transparent;
        }
        .config-map-error{
            position: absolute;
            top: -20px;
            padding: 0 10px;
            width: 150px;
            color: #fff;
            background-color: #f5707a;
            border-radius: 3px;
            line-height: 20px;
        }
        </style>
        <form-array-container ng-model="$ctrl.ngModel" name="$ctrl.name" on-add="$ctrl.addVolumeMountConfigMapItem()" template="$_volumeMountConfigMapItem" max-length="100" min-length="0" type="simple" param="$ctrl.param"></form-array-container>
        <script type="text/ng-template" id="$_volumeMountConfigMapItem" >
            <form-multiple-inline>
                <form-multiple-inline-item class="config-map-name">
                    <form-select ng-model="$ctrl.ngModel[$index].configMap" name="{{ $ctrl.param.name + 'configMapIns' }}" options="$ctrl.ngModel[$index].configMapVolumeSelectorList" placeholder="请选择配置，不能为空且多个配置不能相同" required="true" show-search-input="always" empty-text="无相关信息"></form-select>
                    <!--<div class="config-map-error" ng-show="$ctrl.ngModel[$index].configMap === undefined">配置不能为空</div>-->
                </form-multiple-inline-item>
                <form-multiple-inline-item class="config-map-path">
                    <form-with-button width="90px">
                        <content-area>
                            <input type="text" ng-model="$ctrl.ngModel[$index].containerPath" name="{{ $ctrl.param.name + 'configMapPath' }}" placeholder="容器内挂载路径，以‘/’开头" required pattern="^/.*"/>
                        </content-area>
                        <button-area>
                            <button type="button" ng-click="$ctrl.param.setConfigFile($ctrl.ngModel[$index])">配置文件</button>
                        </button-area>
                    </form-with-button>
                </form-multiple-inline-item>
            </form-multiple-inline>
        </script>
    `,
        bindings: {
            name: '@',
            ngModel: '=?',
            cluster: '<?',
            namespace: '<?',
        },
        controller: ['$scope', 'api', 'dialog', function ($scope, api, dialog) {
            const $ctrl = this;
            $ctrl.param = {
                name: '',
                setConfigFile: null, // this is function
            };
            $ctrl.param.setConfigFile = function (configMapVolume) {
                if (!configMapVolume.configMap) {
                    return;
                }
                // path 与backend中一致
                dialog.common({
                    title: '配置文件',
                    buttons: dialog.buttons.BUTTON_OK_CANCEL,
                    value: {configMapVolume: configMapVolume},
                    template: `
                    <form>
                    <form-container>
                    <form-table
                        ng-model="value.configMapVolume.configMap.configFileList"
                        template="configMapFilesTable"
                        columns="[
                            { text: '配置文件', key: 'name', width: '35%' },
                            { text: '文件名(可以为空)', key: 'path', width: '65%' },
                        ]"
                        empty-text="无配置文件"
                        param="{configMapVolume: value.configMapVolume}"
                    ></form-table>
                    </form-container>
                    </form>
                    <script type="text/ng-template" id="configMapFilesTable">
                        <div ng-if="column.key === 'name'" ng-bind="value" popover="{{row.content}}" popover-trigger="click" popover-placement="left" style="cursor: pointer;"></div>
                        <div ng-if="column.key === 'path'">
                           <input type="text" ng-model="row.path" placeholder="{{ row.name }}"></td>
                        </div>
                    </script>
                    `,
                    size: 600
                });
            };
            let configMapListPromise = api.SimplePromise.resolve([]);
            const getConfigMaps = function () {
                if ($ctrl.cluster && $ctrl.cluster.id && $ctrl.namespace) {
                    configMapListPromise = api.configMap.listConfigMapByClusterIdAndNamespace($ctrl.cluster.id, $ctrl.namespace).then(response => {
                        $ctrl.configMapSelectorList = (response || []).map(configMap => ({
                            value: configMap,
                            text: configMap.name,
                        }));
                        return $ctrl.configMapSelectorList;
                    });
                }
            };
            getConfigMaps();
            const input = function () {
                if (!angular.isArray($ctrl.ngModel)) return;
                if ($ctrl.ngModel.length === 0) return;
                configMapListPromise.then(() => {
                    $ctrl.ngModel.map(configMapVolume => {
                        configMapVolume.configMapVolumeSelectorList = angular.copy($ctrl.configMapSelectorList);
                        configMapVolume.configMapVolumeSelectorList.forEach(configMap => {
                            if (configMapVolume.name === configMap.text) {
                                configMapVolume.configMap = configMap.value;
                                configMapVolume.configMap.configFileList = configMapVolume.volumeConfigMap.iterms ? Object.keys(configMapVolume.volumeConfigMap.iterms).map((key) => ({
                                    name: key,
                                    content: configMap.value.data[key],
                                    path: configMapVolume.volumeConfigMap.iterms? configMapVolume.volumeConfigMap.iterms[key] : null,
                                })): configMap.value.configFileList;
                                return configMapVolume;
                            }
                        });
                    });
                });
            };
            $ctrl.addVolumeMountConfigMapItem = function () {
                $ctrl.ngModel.push({
                    name: '',
                    volumeType: 'CONFIGMAP',
                    readonly: 'false',
                    containerPath: '',
                    hostPath: '',
                    emptyDir: '',
                    volumePVC: {},
                    volumeConfigMap: {
                        configurationId: null,
                        name: '',
                        iterms: null,
                    },
                });
                $ctrl.ngModel = $ctrl.ngModel.filter(volumeMountConfigMap => volumeMountConfigMap != undefined);
            };
            $scope.$watch('$ctrl.cluster', getConfigMaps);
            $scope.$watch('$ctrl.namespace', getConfigMaps);
            $scope.$watch('$ctrl.ngModel', input);
            $scope.$watch('$ctrl.name', function () {
                $ctrl.param.name = $ctrl.name;
            });
        }],
    });
    /**
     * <container-log> 容器日志组件
     *
     * name （字符串） 组件名称，可以用于表单验证
     * ng-model （双向，数组）绑定容器日志对象
     * cluster （单项，集群对象） 判断集群是否开启日志收集，决定是否可配置日志（logConfig===1：开启，logConfig===0：未开启）
     */
    formInputs.component('containerLog', {
        template: `
        <div ng-if="!$ctrl.hasClusterLogConfig()"> 所选集群没有开启日志自动收集。不能进行日志相关配置。 </div>
        <form-array-container ng-if="$ctrl.hasClusterLogConfig()" ng-model="$ctrl.ngModel" name="$ctrl.name" template="$_logItemContainer" max-length="100" min-length="0" type="complex" param="$ctrl.param"></form-array-container>                            
        <script type="text/ng-template" id="$_logItemContainer" >
            <div class="form-array-container-item" style="padding:10px;">
                <input ng-model="$ctrl.ngModel[$index].logPath" type="text" name="{{ $ctrl.param.name + 'logPath' }}" placeholder="请输入日志路径，不能放在根目录下" required ng-pattern="/^\/.*[^\/]$/" />
                <form-input-checkbox ng-model="$ctrl.ngModel[$index].autoCollect" text="自动收集日志"  value="true" value-false="false" ></form-input-checkbox>
                <div ng-if="$ctrl.ngModel[$index].autoCollect" >
                    <div>
                        <span>日志topic</span>
                        <input ng-model="$ctrl.ngModel[$index].logTopic" type="text" name="{{ $ctrl.param.name + 'logTopic' }}"  placeholder="请输入日志topic" required />
                    </div>
                    <div>
                        <span>预处理命令</span>
                        <a class="help-tip" popover="对收集到的日志做进一步处理，比如筛选或增减字段等，可以用grep和awk命令完成，命令以管道形式执行，因此必须以“|”开始，比如一个典型的处理命令为：   | grep &quot;ERROR\\|WARN\\| EXCEPTION\\| statistic&quot; | awk -vnhost=&quot;$HOSTNAME&quot; '{print &quot;[&quot;nhost&quot;]--&quot;$0}'，该命令将只筛选包含四个对应关键字的行，并且会在行首添加&quot;[hostname]--&quot;的字符串，参照可完成其他复杂的处理方式"></a>
                        <input ng-model="$ctrl.ngModel[$index].processCmd" type="text" name="{{ $ctrl.param.name + 'processCmd' }}" placeholder="请输入预处理命令" />
                    </div>
                </div>
                <form-input-checkbox ng-model="$ctrl.ngModel[$index].autoDelete" text="自动删除日志" value="true" value-false="false"></form-input-checkbox>
                <div ng-if="$ctrl.ngModel[$index].autoDelete">
                    <span> 过期时间</span>
                    <input ng-model="$ctrl.ngModel[$index].logExpired" type="number" min="1" name="{{ $ctrl.param.name + 'logExpired' }}" placeholder="过期则自动删除" required ng-pattern="/^(([0-9]+\\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\\.[0-9]+)|([0-9]*[1-9][0-9]*))$/" />
                    <span> 小时</span>
                </div>
            </div>
        </script>
        `,
        bindings: {
            name: '@',
            ngModel: '=',
            cluster: '<?',
        },
        controller: ['$scope', function ($scope) {
            const $ctrl = this;
            $ctrl.param = {
                name: $ctrl.name,
            };
            $ctrl.hasClusterLogConfig = function () {
                return $ctrl.cluster && ($ctrl.cluster.logConfig === 1 || $ctrl.cluster.clusterLog);
            };
            $scope.$watch('$ctrl.name', function () {
                $ctrl.param.name = $ctrl.name;
            });
        }],
    });

    /**
     * <form-multiple-item-scroll> 一行多项，并可以滑动
     * ng-model  当前选择的项目索引值
     * options 数组，如：[{name,...}]，需要有name值
     * form-object 组件所在的form名称，用于表单验证
     * required 表单验证
     */
    formInputs.component('formMultipleItemScroll', {
        template: `
        <style>
        .form-multiple-item-scroll{
            border-bottom: 1px solid #f9f9f9;
        }
        .form-multiple-item-scroll .com-tabset-scroll {
            margin-left: 110px;
        }
        .form-multiple-item-scroll ul.com-list-tab{
            padding: 0; border-bottom: none;
        }
        .form-multiple-itme-scroll ul.com-list-tab li a.link-list {
            padding-bottom: 10px;
        }
        .form-multiple-item-scroll ul.com-list-tab li.nav-option {
            width: 63px;
            height: 52px;
            padding: 0 0 0 20px;
        }
        .form-multiple-item-scroll ul.com-list-tab li:hover {
            border-bottom: 2px solid #cbe6ff;
        }
        .form-multiple-item-scroll ul.com-list-tab li.active {
            border-bottom: 2px solid #5dabf3;
        }
        .form-multiple-item-scroll ul.com-list-tab li.error-message a, .form-multiple-item-scroll .error-message{
            color: #f5707a;
        }
        </style>
        <div class="form-multiple-item-scroll">
            <input type="hidden" name="$ctrl.name" ng-model="$ctrl.value" ng-required="$ctrl.required">
            <ul list-scroll="list-scroll" width-offset="400">
                <li class="nav-option" disabled="true">
                    <span>
                        <a class="icon-last to-last"></a>
                        <a class="icon-next to-next"></a>
                    </span>
                </li>
                <li style="pointer-events: none;">
                    <div style="margin-left: 40px;" ng-if="!$ctrl.options || $ctrl.options.length === 0">
                        <span>您尚未选择任何镜像。</span>
                        <span ng-if="$ctrl.formObject.$submitted" class="error-message">请选择镜像</span>
                    </div>
                </li>
                <li ng-repeat="option in $ctrl.options track by $index" ng-class="{ 'active':$ctrl.ngModel===$index,'error-message':$ctrl.formObject['form'+$index].$invalid && $ctrl.formObject['form'+$index].$submitted}">
                    <div class="container-wrap">
                        <a ng-click="$ctrl.deleteOption($index);fresh()"><i class="fa fa-times"></i></a>
                        <a class="link-list" ng-click="$ctrl.ngModel = $index;" ng-bind="option.name"></a>
                    </div>
                </li>
            </ul>
        </div>
        `,
        bindings: {
            ngModel: '=',
            options: '=',
            formObject: '<',
            required: '<',
        },
        controller: ['$scope', function ($scope) {
            const $ctrl = this;
            $ctrl.ngModel = 0;
            $ctrl.value = null;
            $ctrl.deleteOption = function (index) {
                $ctrl.options.splice(index, 1);
                // index 删除项索引， $ctrl.ngModel 当前选中项索引
                if (index === $ctrl.ngModel || $ctrl.ngModel === 0) {
                    $ctrl.ngModel = 0;
                } else {
                    $ctrl.ngModel = $ctrl.ngModel - 1;
                }
            };
            const locateCurrentOption = function (newValue, oldValue) {
              $ctrl.ngModel = Math.max(Math.min($ctrl.ngModel, $ctrl.options.length - 1), 0);
            };
            const validate = function () {
                // 表单验证
                if ($ctrl.options.length === 0) {
                    $ctrl.value = null;
                } else {
                    $ctrl.options.forEach(option => {
                        $ctrl.value = option.name;
                    });
                }
            };
            $scope.$watch('$ctrl.options.length', locateCurrentOption, true);
            $scope.$watch('$ctrl.options.length', validate, true);
        }],
    });
}(angular.module('formInputs')));