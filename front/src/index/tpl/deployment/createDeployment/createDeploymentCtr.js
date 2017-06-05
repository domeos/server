/**
 * Created by haozhou on 2017/2/17.
 */
;(function (domeApp) {
    'use strict';
    domeApp.controller('CreateDeploymentCtr', ['$scope', '$state', 'api', 'dialog', function ($scope, $state, api, dialog) {
        let collectionId = $state.params.collectionId;
        let collectionName = $state.params.collectionName;
        if (!collectionId || !collectionName) {
            $state.go('deployCollectionManage');
        }
        $scope.collectionName = collectionName;
        $scope.collectionId = collectionId;
        $scope.parentState = 'deployManage({id:"' + collectionId + '",name:"' + collectionName + '"})';
        $scope.createDeploymentStep = 'common';
        // 初始化 deployment
        $scope.deploymentDraft = {
            collectionId: collectionId,
            creatorId: null,
            replicas: 3, //初始值
            // innerServiceDraft: {loadBalancerPorts: [{ targetPort: '', port: '' }], sessionAffinity: false,},
            loadBalanceDraft: {loadBalancerPorts: [{ targetPort: '', port: '' }], sessionAffinity: false, externalIPs: [],},
            containerConsoles: [],
            versionString: {},
        };
        $scope.deploymentDefaultVisitMode = 'noAccess';
        api.user.whoami().then(user => {
            $scope.deploymentDraft.creatorId = user.id;
        });
        /*step 1:
         *
         * @function: deployment common params
         *
         * */
        $scope.cluster = {};
        $scope.deploymentAppEnvRadioList = [
            {value: 'TEST', text: '测试环境'},
            {value: 'PROD', text: '生产环境'}
        ];
        $scope.deploymentTypeHelpText = type => {
            const deployType = {
                REPLICATIONCONTROLLER: '以replicas的形式保证pod的实例个数，部署的升级/回滚/扩容/缩容由DomeOS负责维护处理。',
                DAEMONSET: 'DaemonSet保证所选的每个节点上且只有一个pod运行，部署的升级/回滚/扩容/缩容由k8s维护处理，这些操作不能中断，只能停止当前部署。',
                DEPLOYMENT: 'Deployment是升级版的Replication Controller，它以replica set的形式维护pod的个数，部署的升级/回滚/扩容/缩容由k8s负责维护处理。',
            };
            return deployType[type];
        };
        $scope.deploymentTypeRadioList = [
            {value: 'DEPLOYMENT', text: 'Deployment（默认）'},
            {value: 'REPLICATIONCONTROLLER', text: 'ReplicationController'},
            {value: 'DAEMONSET', text: 'DaemonSet'},
        ];
        $scope.deploymentVersionTypeRadioList = [
            {value: 'CUSTOM', text: '默认类型'},
            {value: 'YAML', text: 'YAML'},
            {value: 'JSON', text: 'JSON'},
        ];
        $scope.deploymentNetworkModeRadioList = [
            {value: 'DEFAULT', text: 'Overlay'},
            {value: 'HOST', text: 'Host'},
        ];
        $scope.deploymentAccessTypeRadioList = [
            {value: 'noAccess', text: '禁止访问'},
            {value: 'internal', text: '对内服务'},
            // {value: 'foreign', text: '对外服务'},
        ];
        $scope.visitModeHelpText = {
            noAccess: '该部署不需要被其他应用发现时请选择禁止访问。',
            internal: '创建集群内可访问的虚拟IP实现多个实例的负载均衡。',
            foreign: '利用主机IP创建集群外访问的负载均衡。',
        };
        $scope.deploymentSessionAffinityRadioList = [
          {value: 'false', text: '关闭(默认)'},
          {value: 'true', text: '开启'},
        ];
        /**
         * networkMode 决定网络访问模式
         */
        $scope.updateDeploymentAccessType = function () {
            let networkMode = $scope.deploymentDraft.networkMode;
            if (networkMode === 'DEFAULT') {
                $scope.deploymentVisitMode = 'noAccess';
                $scope.deploymentAccessTypeRadioList = [
                    {value: 'noAccess', text: '禁止访问'},
                    {value: 'internal', text: '对内服务'},
                    // {value: 'foreign', text: '对外服务'},
                ];
            } else if (networkMode === 'HOST') {
                $scope.deploymentVisitMode = 'noAccess';
                $scope.deploymentAccessTypeRadioList = [
                    {value: 'noAccess', text: '禁止访问'},
                    {value: 'access', text: '允许访问'},
                ];
            } else {
                $scope.deploymentVisitMode = 'noAccess';
                $scope.deploymentAccessTypeRadioList = [
                    {value: 'noAccess', text: '禁止访问'},
                    {value: 'internal', text: '对内服务'},
                    // {value: 'foreign', text: '对外服务'},
                ];
            }
        };
        // $scope.$watch('$scope.deploymentDraft.cluster', $scope.listForeignServiceIP);
        $scope.toggleVisitMode = function () {
          $scope.deploymentDraft.loadBalanceDraft = {
            loadBalancerPorts: [{ targetPort: '', port: '' }],
            sessionAffinity: false, externalIPs: [],
          };
          $scope.listForeignServiceIP();
        };
        $scope.nodeIPListSelector = [];
        $scope.listForeignServiceIP = function () {
            if ($scope.deploymentDraft.visitMode === 'foreign') {
                $scope.deploymentDraft.loadBalanceDraft.externalIPs = null; //清空
                $scope.isLoadingNodeIP = true;
                api.cluster.listNodeList($scope.deploymentDraft.cluster.id).then(response => {
                    $scope.nodeIPListSelector = (response || []).filter(node => node.status === 'Ready').map(node => ({
                        value: node.ip,
                        text: node.ip,
                        remark: '主机：' + node.name + ' ' + '状态：' + node.status,
                    }))
                }).catch(() => { }).then(() => {
                    $scope.isLoadingNodeIP = false;
                });
            }
        };
        $scope.isDisplayInternalService = function () {
            return $scope.deploymentVisitMode === 'internal';
        };
        $scope.isDisplayForeignService = function () {
            return $scope.deploymentVisitMode === 'foreign';
        };
        $scope.isDisplayReplicas = function () {
            return $scope.deploymentDraft.deploymentType !== 'DAEMONSET';
        };
        $scope.isDisplayLabelSelectors = function () {
            return $scope.deploymentDraft.versionType === 'CUSTOM';
        };
        $scope.isDisplayNetworkMode = function () {
            return $scope.deploymentDraft.versionType === 'CUSTOM';
        };
        $scope.cancel = function () {
            $state.go('deployManage', {'id': collectionId, 'name': collectionName});
        };
        /*
         * 检查当前集群，当前label下是否有主机
         * return promise: true or false
         */
        function hasHostListPromise() {
            const hostEnvLabelMap = {
                TEST: {name: 'TESTENV', content: 'HOSTENVTYPE'},
                PROD: {name: 'PRODENV', content: 'HOSTENVTYPE'}
            };
            let hostLabels = angular.copy($scope.deploymentDraft.labelSelectors || []);
            hostLabels = hostLabels.filter(label => {
                return label.content !== 'HOSTENVTYPE'
            }).concat(hostEnvLabelMap[$scope.deploymentDraft.hostEnv]);
            // yaml 或者 json类型主机标签置空
            if ($scope.deploymentDraft.versionType !== 'CUSTOM') {
                hostLabels = hostLabels.filter(label => label.content !== 'USER_LABEL_VALUE');
            }
            return api.cluster.hasNodeByLabels($scope.deploymentDraft.cluster.id, hostLabels);
        }

        function goCommonNextStep() {
            if ($scope.deploymentDraft.versionType === 'CUSTOM') {
                $scope.createDeploymentStep = 'image';
            } else if (['YAML', 'JSON'].some(type => type === $scope.deploymentDraft.versionType)) {
                $scope.podStrUndoText = null; // 复原撤销按钮为 样例
                $scope.createDeploymentStep = 'raw';
            } else {
                $scope.createDeploymentStep = 'image';
            }
        }

        $scope.commonNextStep = function () {
            hasHostListPromise().then(hasNodeResponse => {
                if (hasNodeResponse) {
                    goCommonNextStep();
                } else {
                    const hostEnvMap = {TEST: '测试环境', PROD: '生产环境'};
                    let hostLabelName = '';
                    let hasLabelText = '';
                    // yaml和json类型不显示标签
                    if ($scope.deploymentDraft.versionType === 'CUSTOM') {
                        hostLabelName = (!$scope.deploymentDraft.labelSelectors || $scope.deploymentDraft.labelSelectors.length === 0) ? '' : angular.copy($scope.deploymentDraft.labelSelectors).map(label => label.name);
                        hasLabelText = (!$scope.deploymentDraft.labelSelectors || $scope.deploymentDraft.labelSelectors.length === 0) ? '' : '所选标签';
                    }
                    let promptText = `集群<span class="dome-heighten-text">${$scope.deploymentDraft.cluster.name}</span>在<span class="dome-heighten-text">${hostEnvMap[$scope.deploymentDraft.hostEnv]}</span>${hasLabelText}<span class="dome-heighten-text">${hostLabelName}</span>下没有主机，部署将无法正常启动，是否继续创建？`;
                    dialog.continue('提示', promptText).then(buttonResponse => {
                        if (buttonResponse === dialog.button.BUTTON_OK) {
                            goCommonNextStep();
                        }
                    });
                }
            });
            // 同时获取镜像列表或者yaml,json
            $scope.deploymentDraft.versionType === 'CUSTOM' ? initImageList() : getDeploymentStr($scope.deploymentDraft);
        };
        /*step 2:
         *
         * @function: image of container
         *
         * */
        $scope.copyFrom = {};
        $scope.doCopyFrom = function () {
          if (!$scope.copyFrom.version) return;
          $scope.copyFrom.isLoading = true;
          let request = api.deployment.version.getVersionById($scope.copyFrom.version.deploy.id, $scope.copyFrom.version.id).then(copyTarget => {
            $scope.deploymentDraft.containerConsoles = angular.copy(copyTarget.containerConsoles);
          });
          request.catch(() => { }).then(() => $scope.copyFrom.isLoading = false);
        };
        // 他们一开始说要把克隆已有项目做成弹框
        // 所以有的这段代码
        // 直到我问后台要接口，他们说要改掉了
        // 反正也不知道这段代码还有没有用，就堆在这里算了，等没用了再删掉也不迟
        //$scope.cloneFromPastDeploy = function () {
        //  let chosenDeploy = dialog.common({
        //    title: '选择待复制部署',
        //    size: 600,
        //    buttons: dialog.buttons.BUTTON_EMPTY,
        //    template: `
        //       <form-container><form>
        //         <form-multiple-inline content-type="search">
        //           <form-multiple-inline-item>
        //             <form-select
        //               ng-model="$ctrl.selectedCollection"
        //               options="$ctrl.collectionList"
        //             ></form-select>
        //           </form-multiple-inline-item>
        //           <form-multiple-inline-item>
        //             <form-search-box-with-count
        //               ng-model="$ctrl.userInput.searchText"
        //               placeholder="根据部署名称过滤"
        //               text-prefix="共"
        //               text-suffix="个部署"
        //               total="$ctrl.deployList"
        //               match="$ctrl.deployList | filter { name: $ctrl.userInput.searchText }"
        //             ></form-search-box-with-count>
        //           </form-multiple-inline-item>
        //         </form-multiple-inline>
        //         <script id="cloneDeployTableTemplate" type="text/ng-template">
        //           <div ng-if="column.key === 'collection'" ng-bind="param.collection.name"></div>
        //           <div ng-if="column.key === 'deploy'" ng-bind="row.name"></div>
        //           <div ng-if="column.key === 'version'">
        //             <form-select
        //               ng-model="row.chosedVersion"
        //               options="row.versionList"
        //             ></form-select>
        //           </div>
        //           <div ng-if="column.key === 'select'">
        //             <button type="button" ng-click="$ctrl.choseCloneTarget(row)">复制</button>
        //           </div>
        //         </script>
        //         <form-table
        //           columns="[
        //             { key: 'collection', text: '服务名称' },
        //             { key: 'deploy', text: '部署名称' },
        //             { key: 'version', text: '部署版本' },
        //             { key: 'select', text: '选择' },
        //           ]"
        //           template="cloneDeployTableTemplate"
        //           param="{
        //             choseCloneTarget: $ctrl.choseCloneTarget,
        //             collection: $ctrl.selectedCollection,
        //           }"
        //           ng-model="$ctrl.deployList"
        //         ></form-table>
        //       </form></form-container>
        //    `,
        //    controller: [function () {
        //      const $ctrl = this;
        //      $ctrl.selectedCollection = { id: collectionId, name: collectionName };
        //      $ctrl.collectionList = [$ctrl.selectedCollection];
        //      api.deployment.collection().then(collectionList => {
        //        $ctrl.collectionList = collectionList;
        //        $ctrl.selectedCollection = $ctrl.collectionList.filter(x => x.id === collectionId)[0];
        //      });
        //      $ctrl.userInput.searchText = '';
        //      $ctrl.deployList = [];
        //      let loadDeployList = function () {
        //        api.deployment.
        //      };
        //      $ctrl.choseCloneTarget = function (target) {
        //        console.log(JSON.stringify(target));
        //      };
        //    }],
        //  });
        //};
        $scope.imagePullPolicyRadioList = [
            {value: 'Always', text: 'Always'},
            {value: 'Never', text: 'Never'},
            {value: 'IfNotPresent', text: 'If Not Present'},
        ];
        $scope.imageHealthCheckerRadioList = $scope.imageReadinessCheckerRadioList = [
            {value: 'NONE', text: 'NONE'},
            {value: 'TCP', text: 'TCP检查'},
            {value: 'HTTP', text: 'HTTP检查'},
        ];
        $scope.isDisplayChecker = function (imageDraft,checkType) {
            return imageDraft[checkType].type !== "NONE";
        };
        $scope.isDisplayCheckerUrl = function (imageDraft,checkType) {
            return imageDraft[checkType].type === "HTTP";
        };
        $scope.isDisplayCheckerStatusCode = function (imageDraft,checkType) {
            return imageDraft[checkType].type === "HTTP";
        };
        
        $scope.currentContainerDraft = {
            index: 0
        };
        function initImageList() {
            api.image.privateRegistry.list().then(response => {
                $scope.imageSelectorList = (response || []).map(function (image) {
                    return {
                        text: image.name,
                        value: {name: image.name, registry: image.registry, envSettings: image.envSettings},
                        remark: image.registry,
                    }
                });
            });
        }

        // image = {name, registry, ...}
        function pushContainerDraftList(image) {
            $scope.deploymentDraft.containerConsoles.push(angular.copy({
                name: image.name,
                registry: image.registry,
                cpu: 0.5,
                mem: 1024,
                tag: image.tag ? image.tag : null,
                oldEnv: image.envSettings || [],
                newEnv: [],
                healthChecker: {
                    type: 'NONE',
                    failureThreshold:3,
                },
                readinessChecker: {
                    type: 'NONE',
                    failureThreshold:3,
                    successThreshold:1,
                },
                imagePullPolicy: 'Always',
                autoDeploy: false,
                logItemDrafts: [],
                volumeMountConsoles: [],
                configConsoles: [],
                args:[],
                commands:'',
            }));
            $scope.deploymentDraft.image = null; //清空选择镜像
        }

        $scope.addImage = function (image) {
            // console.log("current add image: ", image);
            if (image) {
                pushContainerDraftList(image);
            }
        };
        $scope.addOtherImage = function () {
            let otherImage = {name: '', registry: '', tag: ''};
            dialog.common({
                title: '添加其他镜像',
                buttons: dialog.buttons.BUTTON_OK_CANCEL,
                value: {otherImage},
                template: `
                    <form name="otherImageDialog" ng-class="{'need-valid':otherImageDialog.$submitted}">
                        <form-container left-column-width="60px">
                            <form-config-group>
                                <form-config-item config-title="仓库地址" required="true">
                                    <form-input-container>
                                        <input type="text" name="registry" ng-model="value.otherImage.registry" required>
                                    </form-input-container>
                                </form-config-item>
                                <form-config-item config-title="镜像名称" required="true">
                                    <form-input-container>
                                        <input type="text" name="name" ng-model="value.otherImage.name" required>
                                    </form-input-container>
                                </form-config-item>
                                <form-config-item config-title="镜像版本" required="true">
                                    <form-input-container>
                                        <input type="text" name="tag" ng-model="value.otherImage.tag" required>
                                    </form-input-container>
                                </form-config-item>
                            </form-config-group>
                        </form-container>
                    </form>
                    `,
                size: 540,
            }).then((response) => {
                if (response === dialog.button.BUTTON_OK) {
                    if (!otherImage.name || !otherImage.registry || !otherImage.tag) return;
                    pushContainerDraftList(otherImage);
                }
            });
        };


        /* step 2.2 for raw yaml and json*/
        $scope.versionTypeName = {
            YAML: 'YAML配置',
            JSON: 'JSON配置',
        };
        $scope.deploymentDraft.versionString = {};
        function getDeploymentStr(deploymentDraft) {
            $scope.isLoadingDeployString = true;
            if (!$scope.deploymentDraft.versionString.deploymentStrHead) {
                // deploymentStrHead 文件头
                const initString = {
                    YAML: '---\napiVersion: \"v1\"\nkind: \"\"\nmetadata:\n  labels: {}\n  name: \"dmo-\"\n  namespace: \"\"\nspec:\n  replicas: 0\n  template:\n    metadata:\n      annotations:\n        deployName: \"\"\n      deletionGracePeriodSeconds: 0\n      labels: {}\n    spec:\n',
                    JSON: '{\n  \"apiVersion\" : \"v1\",\n  \"kind\" : \"\",\n  \"metadata\" : {\n    \"labels\" : { },\n    \"name\" : \"dmo-\",\n    \"namespace\" : \"\"\n  },\n  \"spec\" : {\n    \"replicas\" : 0,\n    \"template\" : {\n      \"metadata\" : {\n        \"annotations\" : {\n          \"deployName\" : \"\"\n        },\n        \"deletionGracePeriodSeconds\" : 0,\n        \"labels\" : { }\n      }\n      \"spec\" : ',
                };
                $scope.deploymentDraft.versionString.deploymentStrHead = initString[$scope.deploymentDraft.versionType];
            }
            api.deployment.getDeploymentStr(deploymentDraft).then((response) => {
                $scope.deploymentDraft.versionString = response || {};
            }).catch((exception) => {
                console.log("get deployment string exception: ", exception);
            }).then(() => {
                $scope.isLoadingDeployString = false;
            });
        }

        $scope.podStrUndoText = null;
        // podSpecStr 文件内容
        const defaultVersionString = {
            'YAML': 'containers:\n- image: \"pub.domeos.org/registry:2.3\"\n  name: \"test-container\"\n  volumeMounts:\n  - mountPath: \"/test-hostpath\"\n    name: \"test-volume\"\nvolumes:\n- hostPath:\n    path: \"/opt/scs\"\n  name: \"test-volume\"\n',
            'JSON': '{\n  \"containers\": [{\n    \"image\": \"pub.domeos.org/registry:2.3\",\n    \"name\": \"test-container\",\n    \"volumeMounts\": [{\n      \"mountPath\": \"/test-hostpath\",\n      \"name\": \"test-volume\"\n    }]\n  }],\n  \"volumes\": [{\n    \"hostPath\": {\n      \"path\": \"/opt/scs\"\n    },\n    \"name\": \"test-volume\"\n  }]\n}\n',
        };
        $scope.setPodStrToDefault = function () {
            $scope.podStrUndoText = $scope.deploymentDraft.versionString.podSpecStr || '';
            $scope.deploymentDraft.versionString.podSpecStr = defaultVersionString[$scope.deploymentDraft.versionType];
        };
        $scope.clearPodStrUndoText = function () {
            $scope.podStrUndoText = null;
        };
        $scope.undoPodStrToDefault = function () {
            $scope.deploymentDraft.versionString.podSpecStr = $scope.podStrUndoText;
            $scope.podStrUndoText = null;
        };
        
        /**
         * create deployment
         */
        $scope.imageLastStep = function () {
            $scope.createDeploymentStep = 'common';
        };
        $scope.createDeployment = function () {
            // console.log('deploy draft (step 2): ', JSON.stringify($scope.deploymentDraft));
            $scope.isCreating = true;
            api.deployment.create($scope.deploymentDraft).then(response => {
                $scope.isCreating = false;
                $state.go('deployManage', {'id': collectionId, 'name': collectionName});
            }).catch(exception => {
                $scope.isCreating = false;
                dialog.error('新建部署错误', exception.message);
            }).then(() => { $scope.isCreating = false; });

        };
    }]);
    domeApp
        .directive('isDeploymentUnique', ['api', function (api) {
            // 验证部署（DeploymentName）是否存在
            return {
                require: 'ngModel',
                scope: {},
                link: function (scope, iElm, iAttrs, controller) {
                    let deployList = [],
                        namespace = iAttrs.namespace,
                        clustername = iAttrs.clustername;
                    api.deployment.list().then(function (response) {
                        deployList = response || [];
                    }).then(function () {
                        scope.$watch(function () {
                            return {
                                namespace: iAttrs.namespace,
                                clustername: iAttrs.clustername
                            };
                        }, function (newValue) {
                            namespace = newValue.namespace;
                            clustername = newValue.clustername;
                            validate(controller.$modelValue);
                        }, true);
                        function validate(viewValue) {
                            let isDeployExist = deployList.some(function (deployment) {
                                return deployment.clusterName === clustername && deployment.namespace === namespace && deployment.deployName === viewValue;
                            });
                            controller.$setValidity('isDeploymentUnique', !isDeployExist);
                            return viewValue;
                        }

                        controller.$parsers.unshift(validate);
                    });
                }
            };
        }])
        .directive('isNamespaceUnique', ['api', function (api) {
            return {
                require: 'ngModel',
                scope: [],
                link: function (scope, element, attrs, controller) {
                    let namespaceList = [];
                    scope.$watch(function () {
                        return attrs.clusterid;
                    }, function (newValue) {
                        api.cluster.getNamespace(newValue).then(function (response) {
                            namespaceList = response || [];
                        });
                    });
                    controller.$parsers.unshift(function (viewValue) {
                        let isNamespaceUnique = namespaceList.every(function (namespace) {
                            return namespace.name !== viewValue;
                        });
                        controller.$setValidity('isNamespaceUnique', isNamespaceUnique);
                        return viewValue;
                    });
                }

            };
        }]);
})(angular.module("domeApp"));
