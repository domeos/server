'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    var deployModule = angular.module('deployModule', []);

    function DeployService($http, $domeCluster, $domeUser, $domeProject, $domeImage, $domePublic, $domeModel, $modal, $q) {
        var nodeService = $domeCluster.getInstance('NodeService');
        var DeployService = function DeployService() {
            var _url = '/api/deploy';
            var _versionUrl = '/api/version';
            this.getList = function () {
                return $http.get(_url + '/list');
            };
            this.getSingle = function (deployId) {
                return $http.get(_url + '/id/' + deployId);
            };
            this.getEvents = function (deployId) {
                return $http.get(_url + '/event/list?deployId=' + deployId);
            };
            this.getInstances = function (deployId) {
                return $http.get(_url + '/' + deployId + '/instance');
            };
            this.getVersions = function (deployId) {
                return $http.get(_versionUrl + '/list?deployId=' + deployId);
            };
            this.getSingleVersion = function (deployId, versionId) {
                return $http.get(_versionUrl + '/id/' + deployId + '/' + versionId);
            };
            this.createVersion = function (version) {
                return $http.post(_versionUrl + '/create?deployId=' + version.deployId, angular.toJson(version));
            };
            this.rollbackDeploy = function (deployId, versionId, replicas) {
                if (replicas) {
                    return $http.post('/api/deploy/action/rollback?deployId=' + deployId + '&version=' + versionId + '&replicas=' + replicas);
                } else {
                    return $http.post('/api/deploy/action/rollback?deployId=' + deployId + '&version=' + versionId);
                }
            };
            this.updateDeploy = function (deployId, versionId, replicas) {
                if (replicas) {
                    return $http.post('/api/deploy/action/update?deployId=' + deployId + '&version=' + versionId + '&replicas=' + replicas);
                } else {
                    return $http.post('/api/deploy/action/update?deployId=' + deployId + '&version=' + versionId);
                }
            };
            this.startDeploy = function (deployId, versionId, replicas) {
                if (replicas) {
                    return $http.post('/api/deploy/action/start?deployId=' + deployId + '&version=' + versionId + '&replicas=' + replicas);
                } else {
                    return $http.post('/api/deploy/action/start?deployId=' + deployId + '&version=' + versionId);
                }
            };
        };
        var deployService = new DeployService();

        var Deploy = function () {
            function Deploy(deployConfig) {
                _classCallCheck(this, Deploy);

                this.namespaceList = [];
                // 是否是新建namespace
                this.isNewNamespace = false;
                this.imageList = undefined;
                this.envList = [{
                    value: 'TEST',
                    text: '测试环境'
                }, {
                    value: 'PROD',
                    text: '生产环境'
                }];
                // 表单不能实现的验证
                this.valid = {
                    // ip至少填一个
                    ips: false
                };
                // 是否开启日志收集
                this.logConfig = undefined;
                this.envText = '请选择部署环境';
                this.versionList = undefined;
                this.nodeListIns = $domeCluster.getInstance('NodeList');
                this.nodeListForIps = [];
                this.clusterListIns = $domeCluster.getInstance('ClusterList');
                this.loadingIns = $domePublic.getLoadingInstance();
                this.creator = {
                    id: null,
                    name: null,
                    type: null
                };
                this.visitMode = 'noAccess';
                this.config = {};
                this.init(deployConfig);
            }

            _createClass(Deploy, [{
                key: 'init',
                value: function init(deployConfig) {
                    var _this = this;

                    var currentVersions = void 0,
                        i = void 0,
                        j = void 0,
                        id = void 0,
                        createTime = -1;

                    if (!deployConfig) {
                        deployConfig = {};
                    }
                    if (deployConfig.replicas === undefined) {
                        deployConfig.replicas = 3;
                    }
                    if (deployConfig.exposePortNum === undefined) {
                        deployConfig.exposePortNum = '';
                    }
                    // 是否使用负载均衡
                    if (!deployConfig.loadBalanceDrafts) {
                        deployConfig.loadBalanceDrafts = [];
                    }
                    //对内服务
                    if (!deployConfig.innerServiceDrafts) {
                        deployConfig.innerServiceDrafts = [];
                    }

                    // loadBalanceDraft.externalIPs: ['externalIP1','externalIP2'] --> [{ip:'externalIP1'},{ip:'externalIP1'},{ip:''}]
                    for (i = 0; i < deployConfig.loadBalanceDrafts.length; i++) {
                        if (!deployConfig.loadBalanceDrafts[i].externalIPs) {
                            deployConfig.loadBalanceDrafts[i].externalIPs = [];
                        }
                        var ipsArr = deployConfig.loadBalanceDrafts[i].externalIPs;
                        var externalIPs = [];
                        for (j = 0; j < ipsArr.length; j++) {
                            externalIPs.push({
                                ip: ipsArr[j]
                            });
                        }
                        externalIPs.push({
                            ip: ''
                        });
                        deployConfig.loadBalanceDrafts[i].externalIPs = externalIPs;
                    }

                    this.config = deployConfig;

                    this.addLoadBalance();
                    this.addInnerService();

                    //网络模式
                    if (!this.config.networkMode) {
                        this.config.networkMode = 'DEFAULT';
                    }
                    if (!this.config.accessType) {
                        this.config.accessType = 'K8S_SERVICE';
                    }
                    currentVersions = this.config.currentVersions;
                    // 是否是新建deploy
                    if (this.config.deployId) {
                        if (!this.versionList) {
                            deployService.getVersions(this.config.deployId).then(function (res) {
                                _this.versionList = res.data.result || [];
                                if (!currentVersions || currentVersions.length === 0) {
                                    _this.toggleVersion(_this.versionList[0].version);
                                }
                            });
                        }
                        if (currentVersions && currentVersions.length !== 0) {
                            for (i = 0; i < currentVersions.length; i++) {
                                if (currentVersions[i].createTime > createTime) {
                                    createTime = currentVersions[i].createTime;
                                    id = currentVersions[i].version;
                                }
                            }
                            this.toggleVersion(id);
                        }
                    } else {
                        this.initData();
                    }
                }
                // deployinfo和versioninfo重合的信息在这里处理，切换version之后重新调用进行初始化

            }, {
                key: 'initData',
                value: function initData() {
                    var _this2 = this;

                    if (!this.config.logDraft) {
                        this.config.logDraft = {};
                    }
                    if (!this.config.logDraft.logItemDrafts) {
                        this.config.logDraft.logItemDrafts = [];
                    }
                    this.config.logDraft.logItemDrafts.push({
                        logPath: '',
                        autoCollect: false,
                        autoDelete: false
                    });
                    if (!this.config.containerDrafts) {
                        this.config.containerDrafts = [];
                    }
                    if (!this.config.labelSelectors) {
                        this.config.labelSelectors = [];
                    }
                    this.initSelectedLabels();

                    if (!this.config.hostEnv) {
                        this.toggleEnv(this.envList[0]);
                    } else {
                        for (var i = 0; i < this.envList.length; i++) {
                            if (this.config.hostEnv === this.envList[i].value) {
                                this.toggleEnv(this.envList[i]);
                                break;
                            }
                        }
                    }

                    if (!this.config.stateful) {
                        if (!this.imageList) {
                            this.loadingIns.startLoading('dockerImage');
                            $domeImage.imageService.getProjectImages().then(function (res) {
                                var imageList = res.data.result || [];
                                // 格式化image的envSettings为containerDrafts格式
                                for (var _i = 0; _i < imageList.length; _i++) {
                                    var envs = [];
                                    if (imageList[_i].envSettings) {
                                        for (var j = 0; j < imageList[_i].envSettings.length; j++) {
                                            envs.push({
                                                key: imageList[_i].envSettings[j].key,
                                                value: imageList[_i].envSettings[j].value,
                                                description: imageList[_i].envSettings[j].description
                                            });
                                        }
                                    }
                                    imageList[_i].envSettings = envs;
                                }
                                _this2.imageList = imageList;
                                // 处理部署已有的镜像
                                _this2.formartContainerDrafts();
                            }).finally(function () {
                                _this2.loadingIns.finishLoading('dockerImage');
                            });
                        } else {
                            this.formartContainerDrafts();
                        }
                    }
                }
            }, {
                key: 'initCluster',
                value: function initCluster() {
                    var _this3 = this;

                    this.loadingIns.startLoading('cluster');
                    return nodeService.getData().then(function (res) {
                        _this3.clusterListIns.init(res.data.result);
                        _this3.toggleCluster();
                    }).finally(function () {
                        _this3.loadingIns.finishLoading('cluster');
                    });
                }
                // 刷新当前Deploy状态

            }, {
                key: 'freshDeploy',
                value: function freshDeploy(newConfig) {
                    if (newConfig) {
                        this.config.lastUpdateTime = newConfig.lastUpdateTime;
                        this.config.deploymentStatus = newConfig.deploymentStatus;
                        this.config.currentVersions = newConfig.currentVersions;
                        this.config.currentReplicas = newConfig.currentReplicas;
                    }
                }
            }, {
                key: 'freshVersionList',
                value: function freshVersionList() {
                    var _this4 = this;

                    this.loadingIns.startLoading('versionList');
                    deployService.getVersions(this.config.deployId).then(function (res) {
                        _this4.versionList = res.data.result || [];
                    }).finally(function () {
                        _this4.loadingIns.finishLoading('versionList');
                    });
                }
            }, {
                key: 'toggleCluster',
                value: function toggleCluster(index) {
                    var _this5 = this;

                    var clusterId = void 0;
                    // 选择当前deploy/version的cluster
                    if (index === undefined) {
                        var isHasCluster = false,
                            clusterList = this.clusterListIns.clusterList;
                        for (var i = 0; i < clusterList.length; i++) {
                            if (clusterList[i].id === this.config.clusterId) {
                                isHasCluster = true;
                                index = i;
                                break;
                            }
                        }
                        // 如果当前deploy/version没有cluster，则选择第一个
                        if (!isHasCluster) {
                            if (this.clusterListIns.clusterList.length === 0) {
                                return;
                            }
                            index = 0;
                        }
                    }

                    this.clusterListIns.toggleCluster(index);
                    this.logConfig = this.clusterListIns.clusterList[index].logConfig;
                    clusterId = this.clusterListIns.cluster.id;

                    if (this.logConfig !== 1) {
                        this.config.logDraft = {
                            logItemDrafts: [{
                                logPath: '',
                                autoCollect: false,
                                autoDelete: false
                            }]
                        };
                    }

                    this.loadingIns.startLoading('nodelist');

                    nodeService.getNodeList(clusterId).then(function (res) {
                        var nodeList = res.data.result || [];
                        _this5.nodeListForIps = angular.copy(nodeList);
                        for (var _i2 = 0; _i2 < _this5.nodeListForIps.length; _i2++) {
                            var node = _this5.nodeListForIps[_i2];
                            if (node.status == 'Ready') {
                                var ips = _this5.config.loadBalanceDrafts[0].externalIPs;
                                var _iteratorNormalCompletion = true;
                                var _didIteratorError = false;
                                var _iteratorError = undefined;

                                try {
                                    for (var _iterator = ips[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                        var ip = _step.value;

                                        if (ip === node.ip) {
                                            node.isSelected = true;
                                            break;
                                        }
                                    }
                                } catch (err) {
                                    _didIteratorError = true;
                                    _iteratorError = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion && _iterator.return) {
                                            _iterator.return();
                                        }
                                    } finally {
                                        if (_didIteratorError) {
                                            throw _iteratorError;
                                        }
                                    }
                                }

                                if (node.isSelected === undefined) {
                                    node.isSelected = false;
                                }
                            } else {
                                _this5.nodeListForIps.splice(_i2, 1);
                                _i2--;
                            }
                        }
                        // 如果是app store的主机列表，则过滤掉没有diskPath的主机
                        _this5.nodeListIns.init(nodeList, _this5.config.stateful);
                        _this5.initSelectedLabels();
                        _this5.nodeListIns.toggleEnv(_this5.config.hostEnv);
                        // 如果是有状态服务，默认选择和replics相等的主机个数
                        if (_this5.config.stateful && _this5.config.replicas && _this5.nodeListIns.nodeList) {
                            for (var _i3 = 0; _i3 < _this5.nodeListIns.nodeList.length && _i3 < _this5.config.replicas; _i3++) {
                                _this5.nodeListIns.nodeList[_i3].isSelected = true;
                                _this5.nodeListIns.toggleNodeCheck(_this5.nodeListIns.nodeList[_i3]);
                            }
                        }
                    }, function () {
                        _this5.nodeListIns.init();
                    }).finally(function () {
                        _this5.loadingIns.finishLoading('nodelist');
                    });

                    if (this.config.deployId === undefined) {
                        this.loadingIns.startLoading('namespace');
                        nodeService.getNamespace(clusterId).then(function (res) {
                            _this5.namespaceList = res.data.result || [];
                            _this5.isNewNamespace = false;
                            _this5.config.namespace = _this5.namespaceList[0].name || undefined;
                            for (var _i4 = 0; _i4 < _this5.namespaceList.length; _i4++) {
                                if (_this5.namespaceList[_i4].name == 'default') {
                                    _this5.config.namespace = _this5.namespaceList[_i4].name;
                                    break;
                                }
                            }
                        }, function () {
                            _this5.isNewNamespace = false;
                            _this5.namespaceList = [];
                            _this5.config.namespace = undefined;
                        }).finally(function () {
                            _this5.loadingIns.finishLoading('namespace');
                        });
                    }
                }
                // 初始化选中的label

            }, {
                key: 'initSelectedLabels',
                value: function initSelectedLabels() {
                    this.nodeListIns.initLabelsInfo();
                    if (!this.config.labelSelectors) {
                        return;
                    }
                    var labelSelectors = this.config.labelSelectors;
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = labelSelectors[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var labelSelector = _step2.value;

                            var labelName = labelSelector.name;
                            if (labelName != 'kubernetes.io/hostname' && labelName != 'TESTENV' && labelName != 'PRODENV') {
                                this.nodeListIns.toggleLabel(labelName, true);
                            }
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }
                }
            }, {
                key: 'validIps',
                value: function validIps() {
                    if (this.visitMode === 'foreign') {
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = this.nodeListForIps[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var node = _step3.value;

                                if (node.isSelected) {
                                    this.valid.ips = true;
                                    return;
                                }
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }

                        this.valid.ips = false;
                    } else {
                        this.valid.ips = true;
                    }
                }
                // 切换当前展示的version

            }, {
                key: 'toggleVersion',
                value: function toggleVersion(versionId) {
                    var _this6 = this;

                    deployService.getSingleVersion(this.config.deployId, versionId).then(function (res) {
                        if (res.data.result) {
                            $.extend(_this6.config, res.data.result);
                            _this6.initData();
                        }
                    });
                }
                // containerDrafts：新增containerDraft的oldEnv，newEnv，tagList属性

            }, {
                key: 'formartContainerDrafts',
                value: function formartContainerDrafts() {
                    var _this7 = this;

                    var containerDrafts = this.config.containerDrafts;

                    var getTag = function getTag(containerDraft) {
                        _this7.loadingIns.startLoading('tag');
                        $domeImage.imageService.getImageTags(containerDraft.image, containerDraft.registry).then(function (res) {
                            containerDraft.tagList = res.data.result || [];
                        }).finally(function () {
                            _this7.loadingIns.finishLoading('tag');
                        });
                    };
                    for (var i = 0; i < containerDrafts.length; i++) {
                        containerDrafts[i].oldEnv = [];
                        containerDrafts[i].newEnv = [];
                        // 获得该镜像版本
                        getTag(containerDrafts[i]);
                        var oldEnv = [];
                        // 获得镜像原本的envSettings
                        for (var j = 0; j < this.imageList.length; j++) {
                            if (this.imageList[j].imageName === containerDrafts[i].image) {
                                oldEnv = this.imageList[j].envSettings;
                                break;
                            }
                        }
                        // 分离镜像本身的image和新添加的image的env
                        if (containerDrafts[i].envs) {
                            for (var w = 0; w < containerDrafts[i].envs.length; w++) {
                                var isOldEnv = false;
                                for (var k = 0; k < oldEnv.length; k++) {
                                    if (oldEnv[k].key === containerDrafts[i].envs[w].key) {
                                        isOldEnv = true;
                                        break;
                                    }
                                }
                                if (isOldEnv) {
                                    containerDrafts[i].oldEnv.push(containerDrafts[i].envs[w]);
                                } else {
                                    containerDrafts[i].newEnv.push(containerDrafts[i].envs[w]);
                                }
                            }
                        } else {
                            containerDrafts[i].oldEnv = angular.copy(oldEnv);
                        }
                    }
                }
            }, {
                key: 'toggleNamespace',
                value: function toggleNamespace(namespace) {
                    this.config.namespace = namespace;
                }
            }, {
                key: 'toggleIsNewNamespace',
                value: function toggleIsNewNamespace() {
                    this.isNewNamespace = !this.isNewNamespace;
                    this.config.namespace = undefined;
                }
            }, {
                key: 'toggleEnv',
                value: function toggleEnv(env) {
                    this.config.hostEnv = env.value;
                    this.envText = env.text;
                    this.nodeListIns.toggleEnv(env.value);
                }
            }, {
                key: 'toggleCreator',
                value: function toggleCreator(user) {
                    this.creator = user;
                }
            }, {
                key: 'toggleImageTag',
                value: function toggleImageTag(index, tag) {
                    this.config.containerDrafts[index].tag = tag;
                }
                // 添加containerDraft

            }, {
                key: 'addImage',
                value: function addImage(image) {
                    var _this8 = this;

                    this.loadingIns.startLoading('addImage');
                    $domeImage.imageService.getImageTags(image.imageName, image.registry).then(function (res) {
                        var tags = res.data.result;
                        _this8.config.containerDrafts.push({
                            image: image.imageName,
                            registry: image.registry,
                            cpu: 0.5,
                            mem: 1024,
                            tag: tags && tags[0] ? tags[0].tag : undefined,
                            tagList: tags ? tags : [],
                            oldEnv: image.envSettings ? image.envSettings : [],
                            newEnv: [],
                            healthChecker: {
                                type: 'NONE'
                            }
                        });
                    }).finally(function () {
                        _this8.loadingIns.finishLoading('addImage');
                    });
                }
                // 添加其他镜像

            }, {
                key: 'addOtherImage',
                value: function addOtherImage() {
                    var _this9 = this;

                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: '/index/tpl/modal/otherImageModal/otherImageModal.html',
                        controller: 'OtherImageModalCtr',
                        size: 'md'
                    });
                    modalInstance.result.then(function (imageInfo) {
                        _this9.config.containerDrafts.push({
                            image: imageInfo.name,
                            registry: imageInfo.registry,
                            cpu: 0.5,
                            mem: 1024,
                            tag: imageInfo.tag,
                            tagList: [{
                                tag: imageInfo.tag
                            }],
                            oldEnv: [],
                            newEnv: []
                        });
                    });
                }
            }, {
                key: 'deleteImage',
                value: function deleteImage(index) {
                    this.config.containerDrafts.splice(index, 1);
                }
            }, {
                key: 'addImageEnv',
                value: function addImageEnv(index) {
                    this.config.containerDrafts[index].newEnv.push({
                        key: '',
                        value: '',
                        description: ''
                    });
                }
            }, {
                key: 'deleteImageEnv',
                value: function deleteImageEnv(containerDraftIndex, index) {
                    this.config.containerDrafts[containerDraftIndex].newEnv.splice(index, 1);
                }
            }, {
                key: 'addLoadBalance',
                value: function addLoadBalance() {
                    this.config.loadBalanceDrafts.push({
                        port: '',
                        targetPort: '',
                        externalIPs: [{
                            ip: ''
                        }]
                    });
                }
            }, {
                key: 'addInnerService',
                value: function addInnerService() {
                    this.config.innerServiceDrafts.push({
                        port: '',
                        targetPort: ''
                    });
                }
            }, {
                key: 'addExternalIPs',
                value: function addExternalIPs(index) {
                    this.config.loadBalanceDrafts[index].externalIPs.push({
                        ip: ''
                    });
                }
            }, {
                key: 'deleteExternalIPs',
                value: function deleteExternalIPs(loadBalanceDraftIndex, index) {
                    this.config.loadBalanceDrafts[loadBalanceDraftIndex].externalIPs.splice(index, 1);
                }
            }, {
                key: 'addLogDraft',
                value: function addLogDraft() {
                    this.config.logDraft.logItemDrafts.push({
                        logPath: '',
                        autoCollect: false,
                        autoDelete: false
                    });
                }
            }, {
                key: 'deleteLogDraft',
                value: function deleteLogDraft(index) {
                    this.config.logDraft.logItemDrafts.splice(index, 1);
                }
            }, {
                key: 'deleteArrItem',
                value: function deleteArrItem(item, index) {
                    this.config[item].splice(index, 1);
                }
            }, {
                key: 'formartHealthChecker',
                value: function formartHealthChecker() {
                    if (this.config.networkMode == 'HOST') {
                        var _iteratorNormalCompletion4 = true;
                        var _didIteratorError4 = false;
                        var _iteratorError4 = undefined;

                        try {
                            for (var _iterator4 = this.config.containerDrafts[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                var containerDraft = _step4.value;

                                containerDraft.healthChecker = {
                                    type: 'NONE'
                                };
                            }
                        } catch (err) {
                            _didIteratorError4 = true;
                            _iteratorError4 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }
                            } finally {
                                if (_didIteratorError4) {
                                    throw _iteratorError4;
                                }
                            }
                        }
                    }
                }
            }, {
                key: 'changeNetworkmode',
                value: function changeNetworkmode() {
                    if (this.config.networkMode == 'HOST') {
                        for (var i = 0; i < this.config.loadBalanceDrafts.length; i++) {
                            this.config.loadBalanceDrafts[i].port = this.config.loadBalanceDrafts[i].targetPort;
                        }
                    }
                }
            }, {
                key: 'changeTargetPort',
                value: function changeTargetPort(index) {
                    this.config.loadBalanceDrafts[index].port = this.config.loadBalanceDrafts[index].targetPort;
                }
                // 将数据结构转换为与后台交互的数据格式

            }, {
                key: '_formartDeploy',
                value: function _formartDeploy() {
                    var _this10 = this;

                    var deployConfig = angular.copy(this.config),
                        i = 0,
                        j = 0;

                    if (deployConfig.networkMode == 'HOST') {
                        deployConfig.loadBalanceDrafts = [];
                        deployConfig.accessType = 'DIY';
                        deployConfig.innerServiceDrafts = [];
                        if (this.visitMode == 'noAccess') {
                            deployConfig.exposePortNum = 0;
                        }
                    } else {
                        deployConfig.exposePortNum = 0;
                        if (this.visitMode == 'noAccess') {
                            deployConfig.accessType = 'DIY';
                            deployConfig.loadBalanceDrafts = [];
                            deployConfig.innerServiceDrafts = [];
                        } else if (this.visitMode == 'internal') {
                            deployConfig.accessType = 'K8S_SERVICE';
                            deployConfig.innerServiceDrafts[0].targetPort = deployConfig.innerServiceDrafts[0].port;
                            deployConfig.loadBalanceDrafts = [];
                        } else {
                            deployConfig.accessType = 'K8S_SERVICE';
                            deployConfig.innerServiceDrafts = [];
                        }
                    }

                    deployConfig.loadBalanceDrafts = function () {
                        var ips = [],
                            loadBalanceDrafts = [];
                        var _iteratorNormalCompletion5 = true;
                        var _didIteratorError5 = false;
                        var _iteratorError5 = undefined;

                        try {
                            for (var _iterator5 = _this10.nodeListForIps[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                var node = _step5.value;

                                if (node.isSelected) {
                                    ips.push(node.ip);
                                }
                            }
                        } catch (err) {
                            _didIteratorError5 = true;
                            _iteratorError5 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                    _iterator5.return();
                                }
                            } finally {
                                if (_didIteratorError5) {
                                    throw _iteratorError5;
                                }
                            }
                        }

                        var _iteratorNormalCompletion6 = true;
                        var _didIteratorError6 = false;
                        var _iteratorError6 = undefined;

                        try {
                            for (var _iterator6 = deployConfig.loadBalanceDrafts[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                var loadBalanceDraft = _step6.value;

                                if (loadBalanceDraft.port) {
                                    loadBalanceDraft.externalIPs = ips;
                                    loadBalanceDrafts.push(loadBalanceDraft);
                                }
                            }
                        } catch (err) {
                            _didIteratorError6 = true;
                            _iteratorError6 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                    _iterator6.return();
                                }
                            } finally {
                                if (_didIteratorError6) {
                                    throw _iteratorError6;
                                }
                            }
                        }

                        return loadBalanceDrafts;
                    }();

                    if (!deployConfig.stateful) {
                        deployConfig.labelSelectors = this.nodeListIns.getFormartSelectedLabels();
                    } else {
                        deployConfig.hostList = this.nodeListIns.getSelectedNodes();
                    }

                    deployConfig.clusterId = this.clusterListIns.cluster.id;

                    if (this.creator.id) {
                        deployConfig.creator = {
                            creatorId: this.creator.id,
                            creatorName: this.creator.name,
                            creatorType: this.creator.type
                        };
                    }

                    deployConfig.logDraft = function () {
                        var logItemDrafts = [];
                        var _iteratorNormalCompletion7 = true;
                        var _didIteratorError7 = false;
                        var _iteratorError7 = undefined;

                        try {
                            for (var _iterator7 = deployConfig.logDraft.logItemDrafts[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                var logItem = _step7.value;

                                if (logItem.logPath !== '') {
                                    var formartLogItem = {
                                        logPath: logItem.logPath,
                                        autoCollect: logItem.autoCollect,
                                        autoDelete: logItem.autoDelete
                                    };
                                    if (logItem.autoCollect) {
                                        formartLogItem.logTopic = logItem.logTopic;
                                        formartLogItem.processCmd = logItem.processCmd;
                                    }
                                    if (logItem.autoDelete) {
                                        formartLogItem.logExpired = logItem.logExpired;
                                    }
                                    logItemDrafts.push(formartLogItem);
                                }
                            }
                        } catch (err) {
                            _didIteratorError7 = true;
                            _iteratorError7 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                    _iterator7.return();
                                }
                            } finally {
                                if (_didIteratorError7) {
                                    throw _iteratorError7;
                                }
                            }
                        }

                        if (logItemDrafts.length === 0) {
                            return null;
                        } else {
                            return {
                                logItemDrafts: logItemDrafts
                            };
                        }
                    }();

                    deployConfig.containerDrafts = function () {
                        if (deployConfig.stateful) {
                            return deployConfig.containerDrafts;
                        }

                        if (!deployConfig.containerDrafts) {
                            return undefined;
                        }

                        var envConf = void 0,
                            containerDrafts = [],
                            healthChecker = void 0;

                        var _iteratorNormalCompletion8 = true;
                        var _didIteratorError8 = false;
                        var _iteratorError8 = undefined;

                        try {
                            for (var _iterator8 = deployConfig.containerDrafts[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                var containerDraft = _step8.value;

                                envConf = containerDraft.oldEnv;
                                if (!containerDraft.healthChecker) {
                                    containerDraft.healthChecker = {
                                        type: 'NONE'
                                    };
                                }
                                healthChecker = {
                                    type: containerDraft.healthChecker.type
                                };

                                if (deployConfig.networkMode != 'HOST') {
                                    if (healthChecker.type == 'TCP' || healthChecker.type == 'HTTP') {
                                        healthChecker.port = containerDraft.healthChecker.port;
                                        healthChecker.timeout = containerDraft.healthChecker.timeout;
                                        healthChecker.delay = containerDraft.healthChecker.delay;
                                    }
                                    if (healthChecker.type == 'HTTP') {
                                        healthChecker.url = containerDraft.healthChecker.url;
                                    }
                                } else {
                                    healthChecker.type = 'NONE';
                                }

                                var _iteratorNormalCompletion9 = true;
                                var _didIteratorError9 = false;
                                var _iteratorError9 = undefined;

                                try {
                                    for (var _iterator9 = containerDraft.newEnv[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                        var env = _step9.value;

                                        if (env.key !== '') {
                                            envConf.push(env);
                                        }
                                    }
                                } catch (err) {
                                    _didIteratorError9 = true;
                                    _iteratorError9 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                            _iterator9.return();
                                        }
                                    } finally {
                                        if (_didIteratorError9) {
                                            throw _iteratorError9;
                                        }
                                    }
                                }

                                containerDrafts.push({
                                    image: containerDraft.image,
                                    registry: containerDraft.registry,
                                    tag: containerDraft.tag,
                                    cpu: containerDraft.cpu,
                                    mem: containerDraft.mem,
                                    envs: envConf,
                                    healthChecker: healthChecker
                                });
                            }
                        } catch (err) {
                            _didIteratorError8 = true;
                            _iteratorError8 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                    _iterator8.return();
                                }
                            } finally {
                                if (_didIteratorError8) {
                                    throw _iteratorError8;
                                }
                            }
                        }

                        return containerDrafts;
                    }();

                    return deployConfig;
                }
            }, {
                key: 'createVersion',
                value: function createVersion() {
                    var _this11 = this;

                    // 创建version
                    var deferred = $q.defer(),
                        newConfig = this._formartDeploy(),
                        versionObj = {
                        deployId: newConfig.deployId,
                        containerDrafts: newConfig.containerDrafts,
                        logDraft: newConfig.logDraft,
                        labelSelectors: newConfig.labelSelectors
                    };
                    deployService.createVersion(versionObj).then(function (res) {
                        if (_this11.config.deploymentStatus != 'RUNNING') {
                            $domePublic.openPrompt('新建部署版本成功,当前状态不能升级。');
                            deferred.resolve('create');
                        } else {
                            $domePublic.openConfirm('成功新建部署版本，是否继续升级？').then(function () {
                                deployService.updateDeploy(_this11.config.deployId, res.data.result).then(function () {
                                    $domePublic.openPrompt('已提交，正在升级！');
                                    deferred.resolve('update');
                                }, function (res) {
                                    $domePublic.openWarning({
                                        title: '升级失败！',
                                        msg: res.data.resultMsg
                                    });
                                    deferred.resolve('updateFailed');
                                });
                            }, function () {
                                deferred.resolve('dismiss');
                            });
                        }
                    }, function (res) {
                        $domePublic.openWarning({
                            title: '创建版本失败！',
                            msg: res.data.resultMsg
                        });
                        deferred.reject('create');
                    });
                    return deferred.promise;
                }
                // 停止

            }, {
                key: 'stop',
                value: function stop() {
                    return $http.post('/api/deploy/action/stop?deployId=' + this.config.deployId);
                }
            }, {
                key: 'abort',
                value: function abort() {
                    return $http.post('/api/deploy/action/abort?deployId=' + this.config.deployId);
                }
                // 扩容/缩容

            }, {
                key: 'scale',
                value: function scale() {
                    var _this12 = this;

                    var deferred = $q.defer();
                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: 'scaleModal.html',
                        controller: 'ScaleModalCtr',
                        size: 'md',
                        resolve: {
                            oldReplicas: function oldReplicas() {
                                return _this12.config.currentReplicas;
                            }
                        }
                    });
                    modalInstance.result.then(function (replicas) {
                        replicas = parseInt(replicas);
                        var url = '';
                        var currentVersionId = _this12.config.currentVersions[0].version;
                        if (replicas > _this12.config.currentReplicas) {
                            url = 'api/deploy/action/scaleup';
                        } else if (replicas < _this12.config.currentReplicas) {
                            url = 'api/deploy/action/scaledown';
                        }
                        $http.post(url + '?deployId=' + _this12.config.deployId + '&replicas=' + replicas + '&version=' + currentVersionId).then(function (res) {
                            $domePublic.openPrompt('操作成功！');
                            deferred.resolve(res.data.result);
                        }, function () {
                            $domePublic.openWarning('请求失败！');
                            deferred.reject('requestError');
                        });
                    }, function () {
                        deferred.reject('dismiss');
                    });
                    return deferred.promise;
                }
                // 恢复

            }, {
                key: 'recoverVersion',
                value: function recoverVersion() {
                    var _this13 = this;

                    var deferred = $q.defer();
                    var versionModalIns = $modal.open({
                        animation: true,
                        templateUrl: 'versionListModal.html',
                        controller: 'VersionListModalCtr',
                        size: 'md',
                        resolve: {
                            deployInfo: function deployInfo() {
                                return _this13.config;
                            }
                        }
                    });
                    versionModalIns.result.then(function (startInfo) {
                        deployService.rollbackDeploy(_this13.config.deployId, startInfo.versionId, startInfo.replicas).then(function (res) {
                            deferred.resolve(res.data.result);
                        }, function () {
                            deferred.reject();
                        });
                    }, function () {
                        deferred.reject('dismiss');
                    });
                    return deferred.promise;
                }
                // 升级

            }, {
                key: 'updateVersion',
                value: function updateVersion() {
                    var _this14 = this;

                    var deferred = $q.defer();
                    var versionModalIns = $modal.open({
                        animation: true,
                        templateUrl: 'versionListModal.html',
                        controller: 'VersionListModalCtr',
                        size: 'md',
                        resolve: {
                            deployInfo: function deployInfo() {
                                return _this14.config;
                            }
                        }
                    });
                    versionModalIns.result.then(function (startInfo) {
                        var currentVersionId = _this14.config.currentVersions[0].version;
                        if (currentVersionId === startInfo.versionId) {
                            $domePublic.openWarning('您不能选择当前版本！');
                            deferred.reject('dismiss');
                        } else if (currentVersionId > startInfo.versionId) {
                            deployService.rollbackDeploy(_this14.config.deployId, startInfo.versionId, startInfo.replicas).then(function (res) {
                                $domePublic.openPrompt('已提交，正在回滚！');
                                deferred.resolve(res.data.result);
                            }, function () {
                                $domePublic.openWarning('回滚失败，请重试！');
                                deferred.reject();
                            });
                        } else {
                            deployService.updateDeploy(_this14.config.deployId, startInfo.versionId, startInfo.replicas).then(function (res) {
                                $domePublic.openPrompt('已提交，正在升级！');
                                deferred.resolve(res.data.result);
                            }, function () {
                                $domePublic.openPrompt('升级失败，请重试！');
                                deferred.reject();
                            });
                        }
                    }, function () {
                        deferred.reject('dismiss');
                    });
                    return deferred.promise;
                }
                // 启动

            }, {
                key: 'startVersion',
                value: function startVersion() {
                    var _this15 = this;

                    var deferred = $q.defer();
                    var versionModalIns = $modal.open({
                        animation: true,
                        templateUrl: 'versionListModal.html',
                        controller: 'VersionListModalCtr',
                        size: 'md',
                        resolve: {
                            deployInfo: function deployInfo() {
                                return _this15.config;
                            }
                        }
                    });
                    versionModalIns.result.then(function (startInfo) {
                        deployService.startDeploy(_this15.config.deployId, startInfo.versionId, startInfo.replicas).then(function (res) {
                            deferred.resolve(res.data.result);
                        }, function () {
                            deferred.reject();
                        });
                    }, function () {
                        deferred.reject('dismiss');
                    });
                    return deferred.promise;
                }
                // 删除

            }, {
                key: 'delete',
                value: function _delete() {
                    return $http.delete('/api/deploy/id/' + this.config.deployId);
                }
                // 新建

            }, {
                key: 'create',
                value: function create() {
                    var _this16 = this;

                    var deferred = $q.defer(),
                        obj = this._formartDeploy();

                    function createDeploy() {
                        $http.post('api/deploy/create', angular.toJson(obj)).then(function () {
                            deferred.resolve();
                        }, function (res) {
                            deferred.reject({
                                type: 'create',
                                msg: res.data.resultMsg
                            });
                        });
                    }

                    if (this.isNewNamespace) {
                        (function () {
                            var namespace = _this16.config.namespace;
                            var namespaceArr = [namespace];
                            nodeService.setNamespace(_this16.clusterListIns.cluster.id, namespaceArr).then(function () {
                                _this16.toggleIsNewNamespace();
                                _this16.namespaceList.push(namespace);
                                _this16.toggleNamespace(namespace);
                                createDeploy();
                            }, function (res) {
                                deferred.reject({
                                    type: 'namespace',
                                    msg: res.data.resultMsg
                                });
                            });
                        })();
                    } else {
                        createDeploy();
                    }
                    return deferred.promise;
                }
            }]);

            return Deploy;
        }();

        var DeployInstanceList = function () {
            function DeployInstanceList(instances) {
                _classCallCheck(this, DeployInstanceList);

                this.isCheckAll = false;
                this.isCheckAllContainer = false;
                this.containerList = [];
                // 已选中instance数
                this.selectedCount = 0;
                // 已选中container数
                this.selectedContainerCount = 0;
                this.init(instances);
            }

            _createClass(DeployInstanceList, [{
                key: 'init',
                value: function init(instances) {
                    this.isCheckAll = false;
                    this.isCheckAllContainer = false;
                    this.instanceList = function (instances) {
                        instances = instances || [];
                        for (var i = 0; i < instances.length; i++) {
                            instances[i].isSelected = false;
                            instances[i].keyFilter = true;
                            if (instances[i].containers) {
                                for (var j = 0; j < instances[i].containers.length; j++) {
                                    instances[i].containers[j].shortContainerId = instances[i].containers[j].containerId.substring(0, 12);
                                }
                            }
                        }
                        return instances;
                    }(instances);
                }
                // 选择实例-->切换containerList

            }, {
                key: 'toggleContainerList',
                value: function toggleContainerList(instance) {
                    this.isCheckAllContainer = false;
                    this.selectedContainerCount = 0;
                    this.containerList = instance.containers || [];
                    for (var i = 0; i < this.containerList.length; i++) {
                        this.containerList[i].isSelected = false;
                    }
                }
            }, {
                key: 'filterWithKey',
                value: function filterWithKey(keywords) {
                    this.isCheckAll = false;
                    this.selectedCount = 0;
                    for (var i = 0; i < this.instanceList.length; i++) {
                        this.instanceList[i].isSelected = false;
                        this.instanceList[i].keyFilter = this.instanceList[i].instanceName.indexOf(keywords) !== -1;
                    }
                }
            }, {
                key: 'toggleContainerCheck',
                value: function toggleContainerCheck(container) {
                    var isAllHasChange = true;
                    if (container.isSelected) {
                        this.selectedContainerCount++;
                        // 是否为全选
                        for (var i = 0; i < this.containerList.length; i++) {
                            if (!this.containerList[i].isSelected) {
                                isAllHasChange = false;
                                break;
                            }
                        }
                        if (isAllHasChange) {
                            this.isCheckAllContainer = true;
                        }
                    } else {
                        this.selectedContainerCount--;
                        this.isCheckAllContainer = false;
                    }
                }
                // 全选/全不选

            }, {
                key: 'checkAllContainer',
                value: function checkAllContainer(isCheckAllContainer) {
                    this.isCheckAllContainer = isCheckAllContainer === undefined ? !this.isCheckAllContainer : isCheckAllContainer;
                    if (this.isCheckAllContainer) {
                        this.selectedContainerCount = this.containerList.length;
                    } else {
                        this.selectedContainerCount = 0;
                    }
                    for (var i = 0; i < this.containerList.length; i++) {
                        this.containerList[i].isSelected = this.isCheckAllContainer;
                    }
                }
                // 切换单个实例的选中状态

            }, {
                key: 'toggleCheck',
                value: function toggleCheck(instance) {
                    var isAllHasChange = true;
                    if (instance.isSelected) {
                        this.selectedCount++;
                        // 是否为全选
                        for (var i = 0; i < this.instanceList.length; i++) {
                            if (this.instanceList[i].keyFilter && !this.instanceList[i].isSelected) {
                                isAllHasChange = false;
                                break;
                            }
                        }
                        if (isAllHasChange) {
                            this.isCheckAll = true;
                        }
                    } else {
                        this.selectedCount--;
                        this.isCheckAll = false;
                    }
                }
                // 全选/全不选

            }, {
                key: 'checkAllInstance',
                value: function checkAllInstance(isCheckAll) {
                    this.isCheckAll = isCheckAll === undefined ? this.isCheckAll : isCheckAll;
                    this.selectedCount = 0;
                    for (var i = 0; i < this.instanceList.length; i++) {
                        if (this.instanceList[i].keyFilter && this.isCheckAll) {
                            this.instanceList[i].isSelected = true;
                            this.selectedCount++;
                        } else {
                            this.instanceList[i].isSelected = false;
                        }
                    }
                }
            }]);

            return DeployInstanceList;
        }();

        var DeployList = function () {
            function DeployList(deployList) {
                _classCallCheck(this, DeployList);

                this.deploy = {};
                this.isLoading = false;
                this.deployInstanceListIns = new DeployInstanceList();
                this.init(deployList);
            }

            _createClass(DeployList, [{
                key: 'init',
                value: function init(deployList) {
                    this.deployList = deployList || [];
                }
            }, {
                key: 'toggleDeploy',
                value: function toggleDeploy(deployId, deployName, namespace, notNeedInstances) {
                    var _this17 = this;

                    var deferred = $q.defer();
                    if (!deployId) {
                        this.deploy.id = undefined;
                        this.deploy.name = undefined;
                        this.deploy.namespace = undefined;
                        this.deployInstanceListIns.init();
                        deferred.reject();
                    } else {
                        this.deploy.id = deployId;
                        this.deploy.name = deployName;
                        this.deploy.namespace = namespace;
                        this.isLoading = true;
                        if (!notNeedInstances) {
                            deployService.getInstances(deployId).then(function (res) {
                                _this17.deployInstanceListIns.init(res.data.result);
                                deferred.resolve();
                            }).finally(function () {
                                deferred.reject();
                                this.isLoading = false;
                            });
                        }
                    }
                    return deferred.promise;
                }
                // @param hostEnv: 'TEST' or 'PROD'

            }, {
                key: 'filterDeploy',
                value: function filterDeploy(clusterName, hostEnv) {
                    var firstIndex = -1,
                        deployId = void 0,
                        deployName = void 0,
                        namespace = void 0;
                    for (var i = 0; i < this.deployList.length; i++) {
                        if (clusterName) {
                            this.deployList[i].clusterFilter = this.deployList[i].clusterName === clusterName;
                        } else {
                            this.deployList[i].clusterFilter = true;
                        }
                        if (hostEnv) {
                            this.deployList[i].hostFilter = this.deployList[i].hostEnv === hostEnv;
                        } else {
                            this.deployList[i].hostFilter = true;
                        }
                        // 选中第一个符合条件的部署并切换到该部署
                        if (firstIndex === -1 && this.deployList[i].clusterFilter && this.deployList[i].hostFilter) {
                            firstIndex = i;
                            deployId = this.deployList[i].deployId;
                            deployName = this.deployList[i].deployName;
                            namespace = this.deployList[i].namespace;
                        }
                    }
                    if (firstIndex === -1) {
                        return this.toggleDeploy();
                    } else {
                        return this.toggleDeploy(deployId, deployName, namespace);
                    }
                }
            }]);

            return DeployList;
        }();

        // 获得实例


        var getInstance = $domeModel.instancesCreator({
            DeployList: DeployList,
            Deploy: Deploy
        });
        return {
            deployService: deployService,
            getInstance: getInstance
        };
    }
    DeployService.$inject = ['$http', '$domeCluster', '$domeUser', '$domeProject', '$domeImage', '$domePublic', '$domeModel', '$modal', '$q'];
    deployModule.factory('$domeDeploy', DeployService);
    window.deployModule = deployModule;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9kZXBsb3lNb2R1bGUvZGVwbG95TW9kdWxlLmVzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLENBQUMsWUFBTTtBQUNILGlCQURHOztBQUVILFFBQUksZUFBZSxRQUFRLE1BQVIsQ0FBZSxjQUFmLEVBQStCLEVBQS9CLENBQWYsQ0FGRDs7QUFJSCxhQUFTLGFBQVQsQ0FBdUIsS0FBdkIsRUFBOEIsWUFBOUIsRUFBNEMsU0FBNUMsRUFBdUQsWUFBdkQsRUFBcUUsVUFBckUsRUFBaUYsV0FBakYsRUFBOEYsVUFBOUYsRUFBMEcsTUFBMUcsRUFBa0gsRUFBbEgsRUFBc0g7QUFDbEgsWUFBTSxjQUFjLGFBQWEsV0FBYixDQUF5QixhQUF6QixDQUFkLENBRDRHO0FBRWxILFlBQU0sZ0JBQWdCLFNBQWhCLGFBQWdCLEdBQVk7QUFDOUIsZ0JBQU0sT0FBTyxhQUFQLENBRHdCO0FBRTlCLGdCQUFNLGNBQWMsY0FBZCxDQUZ3QjtBQUc5QixpQkFBSyxPQUFMLEdBQWU7dUJBQU0sTUFBTSxHQUFOLENBQVUsT0FBTyxPQUFQO2FBQWhCLENBSGU7QUFJOUIsaUJBQUssU0FBTCxHQUFpQixVQUFDLFFBQUQ7dUJBQWMsTUFBTSxHQUFOLENBQVUsT0FBTyxNQUFQLEdBQWdCLFFBQWhCO2FBQXhCLENBSmE7QUFLOUIsaUJBQUssU0FBTCxHQUFpQixVQUFDLFFBQUQ7dUJBQWMsTUFBTSxHQUFOLENBQVUsT0FBTyx1QkFBUCxHQUFpQyxRQUFqQzthQUF4QixDQUxhO0FBTTlCLGlCQUFLLFlBQUwsR0FBb0IsVUFBQyxRQUFEO3VCQUFjLE1BQU0sR0FBTixDQUFVLE9BQU8sR0FBUCxHQUFhLFFBQWIsR0FBd0IsV0FBeEI7YUFBeEIsQ0FOVTtBQU85QixpQkFBSyxXQUFMLEdBQW1CLFVBQUMsUUFBRDt1QkFBYyxNQUFNLEdBQU4sQ0FBVSxjQUFjLGlCQUFkLEdBQWtDLFFBQWxDO2FBQXhCLENBUFc7QUFROUIsaUJBQUssZ0JBQUwsR0FBd0IsVUFBQyxR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Rix3Q0FBWSxLQUFLLFVBQUwsQ0FBZ0IsQ0FBaEIsRUFBbUIsU0FBbkIsQ0FKNEU7eUJBQTVGO3FCQVpKO0FBb0JBLHdCQUFJLGVBQWUsQ0FBQyxDQUFELEVBQUk7QUFDbkIsK0JBQU8sS0FBSyxZQUFMLEVBQVAsQ0FEbUI7cUJBQXZCLE1BRU87QUFDSCwrQkFBTyxLQUFLLFlBQUwsQ0FBa0IsUUFBbEIsRUFBNEIsVUFBNUIsRUFBd0MsU0FBeEMsQ0FBUCxDQURHO3FCQUZQOzs7O21CQTNERjs7OztBQWwvQjRHOztBQXNqQ2xILFlBQU0sY0FBYyxXQUFXLGdCQUFYLENBQTRCO0FBQzVDLHdCQUFZLFVBQVo7QUFDQSxvQkFBUSxNQUFSO1NBRmdCLENBQWQsQ0F0akM0RztBQTBqQ2xILGVBQU87QUFDSCwyQkFBZSxhQUFmO0FBQ0EseUJBQWEsV0FBYjtTQUZKLENBMWpDa0g7S0FBdEg7QUErakNBLGtCQUFjLE9BQWQsR0FBd0IsQ0FBQyxPQUFELEVBQVUsY0FBVixFQUEwQixXQUExQixFQUF1QyxjQUF2QyxFQUF1RCxZQUF2RCxFQUFxRSxhQUFyRSxFQUFvRixZQUFwRixFQUFrRyxRQUFsRyxFQUE0RyxJQUE1RyxDQUF4QixDQW5rQ0c7QUFva0NILGlCQUFhLE9BQWIsQ0FBcUIsYUFBckIsRUFBb0MsYUFBcEMsRUFwa0NHO0FBcWtDSCxXQUFPLFlBQVAsR0FBc0IsWUFBdEIsQ0Fya0NHO0NBQU4sQ0FBRCIsImZpbGUiOiJjb21tb24vZGVwbG95TW9kdWxlL2RlcGxveU1vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIigoKSA9PiB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGxldCBkZXBsb3lNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnZGVwbG95TW9kdWxlJywgW10pO1xuXG4gICAgZnVuY3Rpb24gRGVwbG95U2VydmljZSgkaHR0cCwgJGRvbWVDbHVzdGVyLCAkZG9tZVVzZXIsICRkb21lUHJvamVjdCwgJGRvbWVJbWFnZSwgJGRvbWVQdWJsaWMsICRkb21lTW9kZWwsICRtb2RhbCwgJHEpIHtcbiAgICAgICAgY29uc3Qgbm9kZVNlcnZpY2UgPSAkZG9tZUNsdXN0ZXIuZ2V0SW5zdGFuY2UoJ05vZGVTZXJ2aWNlJyk7XG4gICAgICAgIGNvbnN0IERlcGxveVNlcnZpY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zdCBfdXJsID0gJy9hcGkvZGVwbG95JztcbiAgICAgICAgICAgIGNvbnN0IF92ZXJzaW9uVXJsID0gJy9hcGkvdmVyc2lvbic7XG4gICAgICAgICAgICB0aGlzLmdldExpc3QgPSAoKSA9PiAkaHR0cC5nZXQoX3VybCArICcvbGlzdCcpO1xuICAgICAgICAgICAgdGhpcy5nZXRTaW5nbGUgPSAoZGVwbG95SWQpID0+ICRodHRwLmdldChfdXJsICsgJy9pZC8nICsgZGVwbG95SWQpO1xuICAgICAgICAgICAgdGhpcy5nZXRFdmVudHMgPSAoZGVwbG95SWQpID0+ICRodHRwLmdldChfdXJsICsgJy9ldmVudC9saXN0P2RlcGxveUlkPScgKyBkZXBsb3lJZCk7XG4gICAgICAgICAgICB0aGlzLmdldEluc3RhbmNlcyA9IChkZXBsb3lJZCkgPT4gJGh0dHAuZ2V0KF91cmwgKyAnLycgKyBkZXBsb3lJZCArICcvaW5zdGFuY2UnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0VmVyc2lvbnMgPSAoZGVwbG95SWQpID0+ICRodHRwLmdldChfdmVyc2lvblVybCArICcvbGlzdD9kZXBsb3lJZD0nICsgZGVwbG95SWQpO1xuICAgICAgICAgICAgdGhpcy5nZXRTaW5nbGVWZXJzaW9uID0gKGRlcGxveUlkLCB2ZXJzaW9uSWQpID0+ICRodHRwLmdldChfdmVyc2lvblVybCArICcvaWQvJyArIGRlcGxveUlkICsgJy8nICsgdmVyc2lvbklkKTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmVyc2lvbiA9ICh2ZXJzaW9uKSA9PiAkaHR0cC5wb3N0KF92ZXJzaW9uVXJsICsgJy9jcmVhdGU/ZGVwbG95SWQ9JyArIHZlcnNpb24uZGVwbG95SWQsIGFuZ3VsYXIudG9Kc29uKHZlcnNpb24pKTtcbiAgICAgICAgICAgIHRoaXMucm9sbGJhY2tEZXBsb3kgPSAoZGVwbG95SWQsIHZlcnNpb25JZCwgcmVwbGljYXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVwbGljYXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGVwbG95L2FjdGlvbi9yb2xsYmFjaz9kZXBsb3lJZD0nICsgZGVwbG95SWQgKyAnJnZlcnNpb249JyArIHZlcnNpb25JZCArICcmcmVwbGljYXM9JyArIHJlcGxpY2FzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9kZXBsb3kvYWN0aW9uL3JvbGxiYWNrP2RlcGxveUlkPScgKyBkZXBsb3lJZCArICcmdmVyc2lvbj0nICsgdmVyc2lvbklkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy51cGRhdGVEZXBsb3kgPSAoZGVwbG95SWQsIHZlcnNpb25JZCwgcmVwbGljYXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVwbGljYXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGVwbG95L2FjdGlvbi91cGRhdGU/ZGVwbG95SWQ9JyArIGRlcGxveUlkICsgJyZ2ZXJzaW9uPScgKyB2ZXJzaW9uSWQgKyAnJnJlcGxpY2FzPScgKyByZXBsaWNhcyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGVwbG95L2FjdGlvbi91cGRhdGU/ZGVwbG95SWQ9JyArIGRlcGxveUlkICsgJyZ2ZXJzaW9uPScgKyB2ZXJzaW9uSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLnN0YXJ0RGVwbG95ID0gKGRlcGxveUlkLCB2ZXJzaW9uSWQsIHJlcGxpY2FzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlcGxpY2FzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RlcGxveS9hY3Rpb24vc3RhcnQ/ZGVwbG95SWQ9JyArIGRlcGxveUlkICsgJyZ2ZXJzaW9uPScgKyB2ZXJzaW9uSWQgKyAnJnJlcGxpY2FzPScgKyByZXBsaWNhcyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGVwbG95L2FjdGlvbi9zdGFydD9kZXBsb3lJZD0nICsgZGVwbG95SWQgKyAnJnZlcnNpb249JyArIHZlcnNpb25JZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZGVwbG95U2VydmljZSA9IG5ldyBEZXBsb3lTZXJ2aWNlKCk7XG5cblxuICAgICAgICBjbGFzcyBEZXBsb3kge1xuICAgICAgICAgICAgY29uc3RydWN0b3IoZGVwbG95Q29uZmlnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uYW1lc3BhY2VMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgLy8g5piv5ZCm5piv5paw5bu6bmFtZXNwYWNlXG4gICAgICAgICAgICAgICAgdGhpcy5pc05ld05hbWVzcGFjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VMaXN0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHRoaXMuZW52TGlzdCA9IFt7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnVEVTVCcsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICfmtYvor5Xnjq/looMnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ1BST0QnLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn55Sf5Lqn546v5aKDJ1xuICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgIC8vIOihqOWNleS4jeiDveWunueOsOeahOmqjOivgVxuICAgICAgICAgICAgICAgIHRoaXMudmFsaWQgPSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlw6Iez5bCR5aGr5LiA5LiqXG4gICAgICAgICAgICAgICAgICAgIGlwczogZmFsc2VcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIC8vIOaYr+WQpuW8gOWQr+aXpeW/l+aUtumbhlxuICAgICAgICAgICAgICAgIHRoaXMubG9nQ29uZmlnID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHRoaXMuZW52VGV4dCA9ICfor7fpgInmi6npg6jnvbLnjq/looMnO1xuICAgICAgICAgICAgICAgIHRoaXMudmVyc2lvbkxpc3QgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucyA9ICRkb21lQ2x1c3Rlci5nZXRJbnN0YW5jZSgnTm9kZUxpc3QnKTtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0Rm9ySXBzID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdElucyA9ICRkb21lQ2x1c3Rlci5nZXRJbnN0YW5jZSgnQ2x1c3Rlckxpc3QnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMgPSAkZG9tZVB1YmxpYy5nZXRMb2FkaW5nSW5zdGFuY2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0b3IgPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBudWxsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnZpc2l0TW9kZSA9ICdub0FjY2Vzcyc7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoZGVwbG95Q29uZmlnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluaXQoZGVwbG95Q29uZmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50VmVyc2lvbnMsIGksIGosIGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlVGltZSA9IC0xO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghZGVwbG95Q29uZmlnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVwbG95Q29uZmlnLnJlcGxpY2FzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5yZXBsaWNhcyA9IDM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlcGxveUNvbmZpZy5leHBvc2VQb3J0TnVtID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5leHBvc2VQb3J0TnVtID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8g5piv5ZCm5L2/55So6LSf6L295Z2H6KGhXG4gICAgICAgICAgICAgICAgICAgIGlmICghZGVwbG95Q29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL+WvueWGheacjeWKoVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGxvYWRCYWxhbmNlRHJhZnQuZXh0ZXJuYWxJUHM6IFsnZXh0ZXJuYWxJUDEnLCdleHRlcm5hbElQMiddIC0tPiBbe2lwOidleHRlcm5hbElQMSd9LHtpcDonZXh0ZXJuYWxJUDEnfSx7aXA6Jyd9XVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZGVwbG95Q29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRlcGxveUNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0c1tpXS5leHRlcm5hbElQcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0c1tpXS5leHRlcm5hbElQcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlwc0FyciA9IGRlcGxveUNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0c1tpXS5leHRlcm5hbElQcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleHRlcm5hbElQcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IGlwc0Fyci5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVybmFsSVBzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpcDogaXBzQXJyW2pdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlcm5hbElQcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpcDogJydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzW2ldLmV4dGVybmFsSVBzID0gZXh0ZXJuYWxJUHM7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IGRlcGxveUNvbmZpZztcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZExvYWRCYWxhbmNlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkSW5uZXJTZXJ2aWNlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy/nvZHnu5zmqKHlvI9cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5uZXR3b3JrTW9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubmV0d29ya01vZGUgPSAnREVGQVVMVCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5hY2Nlc3NUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5hY2Nlc3NUeXBlID0gJ0s4U19TRVJWSUNFJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VmVyc2lvbnMgPSB0aGlzLmNvbmZpZy5jdXJyZW50VmVyc2lvbnM7XG4gICAgICAgICAgICAgICAgICAgIC8vIOaYr+WQpuaYr+aWsOW7umRlcGxveVxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuZGVwbG95SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy52ZXJzaW9uTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveVNlcnZpY2UuZ2V0VmVyc2lvbnModGhpcy5jb25maWcuZGVwbG95SWQpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZlcnNpb25MaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnRWZXJzaW9ucyB8fCBjdXJyZW50VmVyc2lvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZVZlcnNpb24odGhpcy52ZXJzaW9uTGlzdFswXS52ZXJzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRWZXJzaW9ucyAmJiBjdXJyZW50VmVyc2lvbnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGN1cnJlbnRWZXJzaW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFZlcnNpb25zW2ldLmNyZWF0ZVRpbWUgPiBjcmVhdGVUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVUaW1lID0gY3VycmVudFZlcnNpb25zW2ldLmNyZWF0ZVRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA9IGN1cnJlbnRWZXJzaW9uc1tpXS52ZXJzaW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlVmVyc2lvbihpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXREYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZGVwbG95aW5mb+WSjHZlcnNpb25pbmZv6YeN5ZCI55qE5L+h5oGv5Zyo6L+Z6YeM5aSE55CG77yM5YiH5o2idmVyc2lvbuS5i+WQjumHjeaWsOiwg+eUqOi/m+ihjOWIneWni+WMllxuICAgICAgICAgICAgaW5pdERhdGEoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5sb2dEcmFmdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5sb2dEcmFmdCA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlnLmxvZ0RyYWZ0LmxvZ0l0ZW1EcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubG9nRHJhZnQubG9nSXRlbURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5sb2dEcmFmdC5sb2dJdGVtRHJhZnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBsb2dQYXRoOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbGxlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBhdXRvRGVsZXRlOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlnLmxhYmVsU2VsZWN0b3JzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxhYmVsU2VsZWN0b3JzID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdFNlbGVjdGVkTGFiZWxzKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlnLmhvc3RFbnYpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVFbnYodGhpcy5lbnZMaXN0WzBdKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZW52TGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmhvc3RFbnYgPT09IHRoaXMuZW52TGlzdFtpXS52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlRW52KHRoaXMuZW52TGlzdFtpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlnLnN0YXRlZnVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5pbWFnZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ2RvY2tlckltYWdlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZUltYWdlLmltYWdlU2VydmljZS5nZXRQcm9qZWN0SW1hZ2VzKCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDmoLzlvI/ljJZpbWFnZeeahGVudlNldHRpbmdz5Li6Y29udGFpbmVyRHJhZnRz5qC85byPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbWFnZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVudnMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlTGlzdFtpXS5lbnZTZXR0aW5ncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBpbWFnZUxpc3RbaV0uZW52U2V0dGluZ3MubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGltYWdlTGlzdFtpXS5lbnZTZXR0aW5nc1tqXS5rZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBpbWFnZUxpc3RbaV0uZW52U2V0dGluZ3Nbal0udmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBpbWFnZUxpc3RbaV0uZW52U2V0dGluZ3Nbal0uZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZUxpc3RbaV0uZW52U2V0dGluZ3MgPSBlbnZzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdCA9IGltYWdlTGlzdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDlpITnkIbpg6jnvbLlt7LmnInnmoTplZzlg49cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1hcnRDb250YWluZXJEcmFmdHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCdkb2NrZXJJbWFnZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1hcnRDb250YWluZXJEcmFmdHMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluaXRDbHVzdGVyKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdjbHVzdGVyJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlU2VydmljZS5nZXREYXRhKCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsdXN0ZXJMaXN0SW5zLmluaXQocmVzLmRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlQ2x1c3RlcigpO1xuICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCdjbHVzdGVyJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDliLfmlrDlvZPliY1EZXBsb3nnirbmgIFcbiAgICAgICAgICAgIGZyZXNoRGVwbG95KG5ld0NvbmZpZykge1xuICAgICAgICAgICAgICAgIGlmIChuZXdDb25maWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubGFzdFVwZGF0ZVRpbWUgPSBuZXdDb25maWcubGFzdFVwZGF0ZVRpbWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRlcGxveW1lbnRTdGF0dXMgPSBuZXdDb25maWcuZGVwbG95bWVudFN0YXR1cztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY3VycmVudFZlcnNpb25zID0gbmV3Q29uZmlnLmN1cnJlbnRWZXJzaW9ucztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY3VycmVudFJlcGxpY2FzID0gbmV3Q29uZmlnLmN1cnJlbnRSZXBsaWNhcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmcmVzaFZlcnNpb25MaXN0KCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ3ZlcnNpb25MaXN0Jyk7XG4gICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS5nZXRWZXJzaW9ucyh0aGlzLmNvbmZpZy5kZXBsb3lJZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmVyc2lvbkxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCd2ZXJzaW9uTGlzdCcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlQ2x1c3RlcihpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2x1c3RlcklkO1xuICAgICAgICAgICAgICAgICAgICAvLyDpgInmi6nlvZPliY1kZXBsb3kvdmVyc2lvbueahGNsdXN0ZXJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc0hhc0NsdXN0ZXIgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHVzdGVyTGlzdCA9IHRoaXMuY2x1c3Rlckxpc3RJbnMuY2x1c3Rlckxpc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsdXN0ZXJMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNsdXN0ZXJMaXN0W2ldLmlkID09PSB0aGlzLmNvbmZpZy5jbHVzdGVySWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNIYXNDbHVzdGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzlvZPliY1kZXBsb3kvdmVyc2lvbuayoeaciWNsdXN0ZXLvvIzliJnpgInmi6nnrKzkuIDkuKpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNIYXNDbHVzdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2x1c3Rlckxpc3RJbnMuY2x1c3Rlckxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdElucy50b2dnbGVDbHVzdGVyKGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dDb25maWcgPSB0aGlzLmNsdXN0ZXJMaXN0SW5zLmNsdXN0ZXJMaXN0W2luZGV4XS5sb2dDb25maWc7XG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJJZCA9IHRoaXMuY2x1c3Rlckxpc3RJbnMuY2x1c3Rlci5pZDtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5sb2dDb25maWcgIT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvZ0RyYWZ0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ0l0ZW1EcmFmdHM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ1BhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29sbGVjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9EZWxldGU6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdub2RlbGlzdCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE5vZGVMaXN0KGNsdXN0ZXJJZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZUxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0Rm9ySXBzID0gYW5ndWxhci5jb3B5KG5vZGVMaXN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ub2RlTGlzdEZvcklwcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBub2RlID0gdGhpcy5ub2RlTGlzdEZvcklwc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5zdGF0dXMgPT0gJ1JlYWR5Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXBzID0gdGhpcy5jb25maWcubG9hZEJhbGFuY2VEcmFmdHNbMF0uZXh0ZXJuYWxJUHM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGlwIG9mIGlwcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlwID09PSBub2RlLmlwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pc1NlbGVjdGVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdEZvcklwcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzmmK9hcHAgc3RvcmXnmoTkuLvmnLrliJfooajvvIzliJnov4fmu6TmjonmsqHmnIlkaXNrUGF0aOeahOS4u+aculxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy5pbml0KG5vZGVMaXN0LCB0aGlzLmNvbmZpZy5zdGF0ZWZ1bCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRTZWxlY3RlZExhYmVscygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy50b2dnbGVFbnYodGhpcy5jb25maWcuaG9zdEVudik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzmmK/mnInnirbmgIHmnI3liqHvvIzpu5jorqTpgInmi6nlkoxyZXBsaWNz55u4562J55qE5Li75py65Liq5pWwXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuc3RhdGVmdWwgJiYgdGhpcy5jb25maWcucmVwbGljYXMgJiYgdGhpcy5ub2RlTGlzdElucy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ub2RlTGlzdElucy5ub2RlTGlzdC5sZW5ndGggJiYgaSA8IHRoaXMuY29uZmlnLnJlcGxpY2FzOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy5ub2RlTGlzdFtpXS5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy50b2dnbGVOb2RlQ2hlY2sodGhpcy5ub2RlTGlzdElucy5ub2RlTGlzdFtpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0SW5zLmluaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygnbm9kZWxpc3QnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmRlcGxveUlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ25hbWVzcGFjZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TmFtZXNwYWNlKGNsdXN0ZXJJZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uYW1lc3BhY2VMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNOZXdOYW1lc3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5uYW1lc3BhY2UgPSB0aGlzLm5hbWVzcGFjZUxpc3RbMF0ubmFtZSB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm5hbWVzcGFjZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubmFtZXNwYWNlTGlzdFtpXS5uYW1lID09ICdkZWZhdWx0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubmFtZXNwYWNlID0gdGhpcy5uYW1lc3BhY2VMaXN0W2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzTmV3TmFtZXNwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uYW1lc3BhY2VMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubmFtZXNwYWNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ25hbWVzcGFjZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5Yid5aeL5YyW6YCJ5Lit55qEbGFiZWxcbiAgICAgICAgICAgIGluaXRTZWxlY3RlZExhYmVscygpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0SW5zLmluaXRMYWJlbHNJbmZvKCk7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5sYWJlbFNlbGVjdG9ycykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBsYWJlbFNlbGVjdG9ycyA9IHRoaXMuY29uZmlnLmxhYmVsU2VsZWN0b3JzO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGxhYmVsU2VsZWN0b3Igb2YgbGFiZWxTZWxlY3RvcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxhYmVsTmFtZSA9IGxhYmVsU2VsZWN0b3IubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhYmVsTmFtZSAhPSAna3ViZXJuZXRlcy5pby9ob3N0bmFtZScgJiYgbGFiZWxOYW1lICE9ICdURVNURU5WJyAmJiBsYWJlbE5hbWUgIT0gJ1BST0RFTlYnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0SW5zLnRvZ2dsZUxhYmVsKGxhYmVsTmFtZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWxpZElwcygpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmlzaXRNb2RlID09PSAnZm9yZWlnbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5ub2RlTGlzdEZvcklwcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZC5pcHMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZC5pcHMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWQuaXBzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDliIfmjaLlvZPliY3lsZXnpLrnmoR2ZXJzaW9uXG4gICAgICAgICAgICB0b2dnbGVWZXJzaW9uKHZlcnNpb25JZCkge1xuICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLmdldFNpbmdsZVZlcnNpb24odGhpcy5jb25maWcuZGVwbG95SWQsIHZlcnNpb25JZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzLmRhdGEucmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5leHRlbmQodGhpcy5jb25maWcsIHJlcy5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0RGF0YSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gY29udGFpbmVyRHJhZnRz77ya5paw5aKeY29udGFpbmVyRHJhZnTnmoRvbGRFbnbvvIxuZXdFbnbvvIx0YWdMaXN05bGe5oCnXG4gICAgICAgICAgICBmb3JtYXJ0Q29udGFpbmVyRHJhZnRzKCkge1xuICAgICAgICAgICAgICAgIGxldCBjb250YWluZXJEcmFmdHMgPSB0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHM7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBnZXRUYWcgPSAoY29udGFpbmVyRHJhZnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygndGFnJyk7XG4gICAgICAgICAgICAgICAgICAgICRkb21lSW1hZ2UuaW1hZ2VTZXJ2aWNlLmdldEltYWdlVGFncyhjb250YWluZXJEcmFmdC5pbWFnZSwgY29udGFpbmVyRHJhZnQucmVnaXN0cnkpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnQudGFnTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygndGFnJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb250YWluZXJEcmFmdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnRzW2ldLm9sZEVudiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdHNbaV0ubmV3RW52ID0gW107XG4gICAgICAgICAgICAgICAgICAgIC8vIOiOt+W+l+ivpemVnOWDj+eJiOacrFxuICAgICAgICAgICAgICAgICAgICBnZXRUYWcoY29udGFpbmVyRHJhZnRzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9sZEVudiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAvLyDojrflvpfplZzlg4/ljp/mnKznmoRlbnZTZXR0aW5nc1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWFnZUxpc3Rbal0uaW1hZ2VOYW1lID09PSBjb250YWluZXJEcmFmdHNbaV0uaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRFbnYgPSB0aGlzLmltYWdlTGlzdFtqXS5lbnZTZXR0aW5ncztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyDliIbnprvplZzlg4/mnKzouqvnmoRpbWFnZeWSjOaWsOa3u+WKoOeahGltYWdl55qEZW52XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb250YWluZXJEcmFmdHNbaV0uZW52cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgdyA9IDA7IHcgPCBjb250YWluZXJEcmFmdHNbaV0uZW52cy5sZW5ndGg7IHcrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc09sZEVudiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgb2xkRW52Lmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvbGRFbnZba10ua2V5ID09PSBjb250YWluZXJEcmFmdHNbaV0uZW52c1t3XS5rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzT2xkRW52ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc09sZEVudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdHNbaV0ub2xkRW52LnB1c2goY29udGFpbmVyRHJhZnRzW2ldLmVudnNbd10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0c1tpXS5uZXdFbnYucHVzaChjb250YWluZXJEcmFmdHNbaV0uZW52c1t3XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnRzW2ldLm9sZEVudiA9IGFuZ3VsYXIuY29weShvbGRFbnYpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlTmFtZXNwYWNlKG5hbWVzcGFjZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZUlzTmV3TmFtZXNwYWNlKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNOZXdOYW1lc3BhY2UgPSAhdGhpcy5pc05ld05hbWVzcGFjZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5uYW1lc3BhY2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b2dnbGVFbnYoZW52KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuaG9zdEVudiA9IGVudi52YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmVudlRleHQgPSBlbnYudGV4dDtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0SW5zLnRvZ2dsZUVudihlbnYudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlQ3JlYXRvcih1c2VyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdG9yID0gdXNlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZUltYWdlVGFnKGluZGV4LCB0YWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzW2luZGV4XS50YWcgPSB0YWc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOa3u+WKoGNvbnRhaW5lckRyYWZ0XG4gICAgICAgICAgICBhZGRJbWFnZShpbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdhZGRJbWFnZScpO1xuICAgICAgICAgICAgICAgICAgICAkZG9tZUltYWdlLmltYWdlU2VydmljZS5nZXRJbWFnZVRhZ3MoaW1hZ2UuaW1hZ2VOYW1lLCBpbWFnZS5yZWdpc3RyeSkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFncyA9IHJlcy5kYXRhLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogaW1hZ2UuaW1hZ2VOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJ5OiBpbWFnZS5yZWdpc3RyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcHU6IDAuNSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW06IDEwMjQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiB0YWdzICYmIHRhZ3NbMF0gPyB0YWdzWzBdLnRhZyA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWdMaXN0OiB0YWdzID8gdGFncyA6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZEVudjogaW1hZ2UuZW52U2V0dGluZ3MgPyBpbWFnZS5lbnZTZXR0aW5ncyA6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0VudjogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTk9ORSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygnYWRkSW1hZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOa3u+WKoOWFtuS7lumVnOWDj1xuICAgICAgICAgICAgYWRkT3RoZXJJbWFnZSgpIHtcbiAgICAgICAgICAgICAgICBsZXQgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9pbmRleC90cGwvbW9kYWwvb3RoZXJJbWFnZU1vZGFsL290aGVySW1hZ2VNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ090aGVySW1hZ2VNb2RhbEN0cicsXG4gICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKChpbWFnZUluZm8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IGltYWdlSW5mby5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cnk6IGltYWdlSW5mby5yZWdpc3RyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNwdTogMC41LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtOiAxMDI0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiBpbWFnZUluZm8udGFnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnTGlzdDogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWc6IGltYWdlSW5mby50YWdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2xkRW52OiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0VudjogW11cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVJbWFnZShpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkSW1hZ2VFbnYoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHNbaW5kZXhdLm5ld0Vudi5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZUltYWdlRW52KGNvbnRhaW5lckRyYWZ0SW5kZXgsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzW2NvbnRhaW5lckRyYWZ0SW5kZXhdLm5ld0Vudi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkTG9hZEJhbGFuY2UoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcubG9hZEJhbGFuY2VEcmFmdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHBvcnQ6ICcnLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRQb3J0OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZXh0ZXJuYWxJUHM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICBpcDogJydcbiAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZElubmVyU2VydmljZSgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHBvcnQ6ICcnLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRQb3J0OiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkRXh0ZXJuYWxJUHMoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0c1tpbmRleF0uZXh0ZXJuYWxJUHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGlwOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlRXh0ZXJuYWxJUHMobG9hZEJhbGFuY2VEcmFmdEluZGV4LCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzW2xvYWRCYWxhbmNlRHJhZnRJbmRleF0uZXh0ZXJuYWxJUHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZExvZ0RyYWZ0KCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvZ0RyYWZ0LmxvZ0l0ZW1EcmFmdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGxvZ1BhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29sbGVjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGF1dG9EZWxldGU6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVMb2dEcmFmdChpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvZ0RyYWZ0LmxvZ0l0ZW1EcmFmdHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZUFyckl0ZW0oaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ1tpdGVtXS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9ybWFydEhlYWx0aENoZWNrZXIoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLm5ldHdvcmtNb2RlID09ICdIT1NUJykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjb250YWluZXJEcmFmdCBvZiB0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ05PTkUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hhbmdlTmV0d29ya21vZGUoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLm5ldHdvcmtNb2RlID09ICdIT1NUJykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0c1tpXS5wb3J0ID0gdGhpcy5jb25maWcubG9hZEJhbGFuY2VEcmFmdHNbaV0udGFyZ2V0UG9ydDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoYW5nZVRhcmdldFBvcnQoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubG9hZEJhbGFuY2VEcmFmdHNbaW5kZXhdLnBvcnQgPSB0aGlzLmNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0c1tpbmRleF0udGFyZ2V0UG9ydDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5bCG5pWw5o2u57uT5p6E6L2s5o2i5Li65LiO5ZCO5Y+w5Lqk5LqS55qE5pWw5o2u5qC85byPXG4gICAgICAgICAgICBfZm9ybWFydERlcGxveSgpIHtcbiAgICAgICAgICAgICAgICBsZXQgZGVwbG95Q29uZmlnID0gYW5ndWxhci5jb3B5KHRoaXMuY29uZmlnKSxcbiAgICAgICAgICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICAgICAgICAgIGogPSAwO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRlcGxveUNvbmZpZy5uZXR3b3JrTW9kZSA9PSAnSE9TVCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5hY2Nlc3NUeXBlID0gJ0RJWSc7XG4gICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmlzaXRNb2RlID09ICdub0FjY2VzcycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5leHBvc2VQb3J0TnVtID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5leHBvc2VQb3J0TnVtID0gMDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmlzaXRNb2RlID09ICdub0FjY2VzcycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5hY2Nlc3NUeXBlID0gJ0RJWSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnZpc2l0TW9kZSA9PSAnaW50ZXJuYWwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcuYWNjZXNzVHlwZSA9ICdLOFNfU0VSVklDRSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcuaW5uZXJTZXJ2aWNlRHJhZnRzWzBdLnRhcmdldFBvcnQgPSBkZXBsb3lDb25maWcuaW5uZXJTZXJ2aWNlRHJhZnRzWzBdLnBvcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5hY2Nlc3NUeXBlID0gJ0s4U19TRVJWSUNFJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0cyA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpcHMgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRCYWxhbmNlRHJhZnRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5ub2RlTGlzdEZvcklwcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlwcy5wdXNoKG5vZGUuaXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGxvYWRCYWxhbmNlRHJhZnQgb2YgZGVwbG95Q29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9hZEJhbGFuY2VEcmFmdC5wb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZEJhbGFuY2VEcmFmdC5leHRlcm5hbElQcyA9IGlwcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkQmFsYW5jZURyYWZ0cy5wdXNoKGxvYWRCYWxhbmNlRHJhZnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2FkQmFsYW5jZURyYWZ0cztcbiAgICAgICAgICAgICAgICB9KSgpO1xuXG5cbiAgICAgICAgICAgICAgICBpZiAoIWRlcGxveUNvbmZpZy5zdGF0ZWZ1bCkge1xuICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcubGFiZWxTZWxlY3RvcnMgPSB0aGlzLm5vZGVMaXN0SW5zLmdldEZvcm1hcnRTZWxlY3RlZExhYmVscygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5ob3N0TGlzdCA9IHRoaXMubm9kZUxpc3RJbnMuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5jbHVzdGVySWQgPSB0aGlzLmNsdXN0ZXJMaXN0SW5zLmNsdXN0ZXIuaWQ7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jcmVhdG9yLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5jcmVhdG9yID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRvcklkOiB0aGlzLmNyZWF0b3IuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdG9yTmFtZTogdGhpcy5jcmVhdG9yLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdG9yVHlwZTogdGhpcy5jcmVhdG9yLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5sb2dEcmFmdCA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsb2dJdGVtRHJhZnRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGxvZ0l0ZW0gb2YgZGVwbG95Q29uZmlnLmxvZ0RyYWZ0LmxvZ0l0ZW1EcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2dJdGVtLmxvZ1BhdGggIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZvcm1hcnRMb2dJdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dQYXRoOiBsb2dJdGVtLmxvZ1BhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db2xsZWN0OiBsb2dJdGVtLmF1dG9Db2xsZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvRGVsZXRlOiBsb2dJdGVtLmF1dG9EZWxldGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2dJdGVtLmF1dG9Db2xsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hcnRMb2dJdGVtLmxvZ1RvcGljID0gbG9nSXRlbS5sb2dUb3BpYztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWFydExvZ0l0ZW0ucHJvY2Vzc0NtZCA9IGxvZ0l0ZW0ucHJvY2Vzc0NtZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvZ0l0ZW0uYXV0b0RlbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0TG9nSXRlbS5sb2dFeHBpcmVkID0gbG9nSXRlbS5sb2dFeHBpcmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dJdGVtRHJhZnRzLnB1c2goZm9ybWFydExvZ0l0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2dJdGVtRHJhZnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ0l0ZW1EcmFmdHM6IGxvZ0l0ZW1EcmFmdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmNvbnRhaW5lckRyYWZ0cyA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXBsb3lDb25maWcuc3RhdGVmdWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkZXBsb3lDb25maWcuY29udGFpbmVyRHJhZnRzO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkZXBsb3lDb25maWcuY29udGFpbmVyRHJhZnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudkNvbmYsIGNvbnRhaW5lckRyYWZ0cyA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlcjtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjb250YWluZXJEcmFmdCBvZiBkZXBsb3lDb25maWcuY29udGFpbmVyRHJhZnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbnZDb25mID0gY29udGFpbmVyRHJhZnQub2xkRW52O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjb250YWluZXJEcmFmdC5oZWFsdGhDaGVja2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnQuaGVhbHRoQ2hlY2tlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ05PTkUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY29udGFpbmVyRHJhZnQuaGVhbHRoQ2hlY2tlci50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVwbG95Q29uZmlnLm5ldHdvcmtNb2RlICE9ICdIT1NUJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoZWFsdGhDaGVja2VyLnR5cGUgPT0gJ1RDUCcgfHwgaGVhbHRoQ2hlY2tlci50eXBlID09ICdIVFRQJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFsdGhDaGVja2VyLnBvcnQgPSBjb250YWluZXJEcmFmdC5oZWFsdGhDaGVja2VyLnBvcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXIudGltZW91dCA9IGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIudGltZW91dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlci5kZWxheSA9IGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIuZGVsYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoZWFsdGhDaGVja2VyLnR5cGUgPT0gJ0hUVFAnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXIudXJsID0gY29udGFpbmVyRHJhZnQuaGVhbHRoQ2hlY2tlci51cmw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFsdGhDaGVja2VyLnR5cGUgPSAnTk9ORSc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGVudiBvZiBjb250YWluZXJEcmFmdC5uZXdFbnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW52LmtleSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52Q29uZi5wdXNoKGVudik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IGNvbnRhaW5lckRyYWZ0LmltYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJ5OiBjb250YWluZXJEcmFmdC5yZWdpc3RyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWc6IGNvbnRhaW5lckRyYWZ0LnRhZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcHU6IGNvbnRhaW5lckRyYWZ0LmNwdSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW06IGNvbnRhaW5lckRyYWZ0Lm1lbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZzOiBlbnZDb25mLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXI6IGhlYWx0aENoZWNrZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb250YWluZXJEcmFmdHM7XG4gICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBkZXBsb3lDb25maWc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNyZWF0ZVZlcnNpb24oKSB7IC8vIOWIm+W7unZlcnNpb25cbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NvbmZpZyA9IHRoaXMuX2Zvcm1hcnREZXBsb3koKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnNpb25PYmogPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95SWQ6IG5ld0NvbmZpZy5kZXBsb3lJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdHM6IG5ld0NvbmZpZy5jb250YWluZXJEcmFmdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nRHJhZnQ6IG5ld0NvbmZpZy5sb2dEcmFmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFNlbGVjdG9yczogbmV3Q29uZmlnLmxhYmVsU2VsZWN0b3JzXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLmNyZWF0ZVZlcnNpb24odmVyc2lvbk9iaikudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuZGVwbG95bWVudFN0YXR1cyAhPSAnUlVOTklORycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCfmlrDlu7rpg6jnvbLniYjmnKzmiJDlip8s5b2T5YmN54q25oCB5LiN6IO95Y2H57qn44CCJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgnY3JlYXRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Db25maXJtKCfmiJDlip/mlrDlu7rpg6jnvbLniYjmnKzvvIzmmK/lkKbnu6fnu63ljYfnuqfvvJ8nKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS51cGRhdGVEZXBsb3kodGhpcy5jb25maWcuZGVwbG95SWQsIHJlcy5kYXRhLnJlc3VsdCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCflt7Lmj5DkuqTvvIzmraPlnKjljYfnuqfvvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfljYfnuqflpLHotKXvvIEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoJ3VwZGF0ZUZhaWxlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoJ2Rpc21pc3MnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5Yib5bu654mI5pys5aSx6LSl77yBJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2NyZWF0ZScpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWBnOatolxuICAgICAgICAgICAgc3RvcCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9kZXBsb3kvYWN0aW9uL3N0b3A/ZGVwbG95SWQ9JyArIHRoaXMuY29uZmlnLmRlcGxveUlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFib3J0KCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9kZXBsb3kvYWN0aW9uL2Fib3J0P2RlcGxveUlkPScgKyB0aGlzLmNvbmZpZy5kZXBsb3lJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOaJqeWuuS/nvKnlrrlcbiAgICAgICAgICAgIHNjYWxlKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnc2NhbGVNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTY2FsZU1vZGFsQ3RyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkUmVwbGljYXM6ICgpID0+IHRoaXMuY29uZmlnLmN1cnJlbnRSZXBsaWNhc1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbigocmVwbGljYXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxpY2FzID0gcGFyc2VJbnQocmVwbGljYXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVybCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRWZXJzaW9uSWQgPSB0aGlzLmNvbmZpZy5jdXJyZW50VmVyc2lvbnNbMF0udmVyc2lvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXBsaWNhcyA+IHRoaXMuY29uZmlnLmN1cnJlbnRSZXBsaWNhcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9ICdhcGkvZGVwbG95L2FjdGlvbi9zY2FsZXVwJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVwbGljYXMgPCB0aGlzLmNvbmZpZy5jdXJyZW50UmVwbGljYXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSAnYXBpL2RlcGxveS9hY3Rpb24vc2NhbGVkb3duJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICRodHRwLnBvc3QodXJsICsgJz9kZXBsb3lJZD0nICsgdGhpcy5jb25maWcuZGVwbG95SWQgKyAnJnJlcGxpY2FzPScgKyByZXBsaWNhcyArICcmdmVyc2lvbj0nICsgY3VycmVudFZlcnNpb25JZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5pON5L2c5oiQ5Yqf77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXMuZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfor7fmsYLlpLHotKXvvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ3JlcXVlc3RFcnJvcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnZGlzbWlzcycpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOaBouWkjVxuICAgICAgICAgICAgcmVjb3ZlclZlcnNpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2ZXJzaW9uTW9kYWxJbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3ZlcnNpb25MaXN0TW9kYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVmVyc2lvbkxpc3RNb2RhbEN0cicsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiAnbWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUluZm86ICgpID0+IHRoaXMuY29uZmlnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uTW9kYWxJbnMucmVzdWx0LnRoZW4oKHN0YXJ0SW5mbykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS5yb2xsYmFja0RlcGxveSh0aGlzLmNvbmZpZy5kZXBsb3lJZCwgc3RhcnRJbmZvLnZlcnNpb25JZCwgc3RhcnRJbmZvLnJlcGxpY2FzKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlcy5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdkaXNtaXNzJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5Y2H57qnXG4gICAgICAgICAgICB1cGRhdGVWZXJzaW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmVyc2lvbk1vZGFsSW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd2ZXJzaW9uTGlzdE1vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1ZlcnNpb25MaXN0TW9kYWxDdHInLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lJbmZvOiAoKSA9PiB0aGlzLmNvbmZpZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvbk1vZGFsSW5zLnJlc3VsdC50aGVuKChzdGFydEluZm8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50VmVyc2lvbklkID0gdGhpcy5jb25maWcuY3VycmVudFZlcnNpb25zWzBdLnZlcnNpb247XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFZlcnNpb25JZCA9PT0gc3RhcnRJbmZvLnZlcnNpb25JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfmgqjkuI3og73pgInmi6nlvZPliY3niYjmnKzvvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2Rpc21pc3MnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFZlcnNpb25JZCA+IHN0YXJ0SW5mby52ZXJzaW9uSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLnJvbGxiYWNrRGVwbG95KHRoaXMuY29uZmlnLmRlcGxveUlkLCBzdGFydEluZm8udmVyc2lvbklkLCBzdGFydEluZm8ucmVwbGljYXMpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCflt7Lmj5DkuqTvvIzmraPlnKjlm57mu5rvvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXMuZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+Wbnua7muWksei0pe+8jOivt+mHjeivle+8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS51cGRhdGVEZXBsb3kodGhpcy5jb25maWcuZGVwbG95SWQsIHN0YXJ0SW5mby52ZXJzaW9uSWQsIHN0YXJ0SW5mby5yZXBsaWNhcykudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+W3suaPkOS6pO+8jOato+WcqOWNh+e6p++8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlcy5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCfljYfnuqflpLHotKXvvIzor7fph43or5XvvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnZGlzbWlzcycpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWQr+WKqFxuICAgICAgICAgICAgc3RhcnRWZXJzaW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmVyc2lvbk1vZGFsSW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd2ZXJzaW9uTGlzdE1vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1ZlcnNpb25MaXN0TW9kYWxDdHInLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lJbmZvOiAoKSA9PiB0aGlzLmNvbmZpZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvbk1vZGFsSW5zLnJlc3VsdC50aGVuKChzdGFydEluZm8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveVNlcnZpY2Uuc3RhcnREZXBsb3kodGhpcy5jb25maWcuZGVwbG95SWQsIHN0YXJ0SW5mby52ZXJzaW9uSWQsIHN0YXJ0SW5mby5yZXBsaWNhcykudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXMuZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnZGlzbWlzcycpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWIoOmZpFxuICAgICAgICAgICAgZGVsZXRlKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKCcvYXBpL2RlcGxveS9pZC8nICsgdGhpcy5jb25maWcuZGVwbG95SWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDmlrDlu7pcbiAgICAgICAgICAgIGNyZWF0ZSgpIHtcbiAgICAgICAgICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgICAgICBvYmogPSB0aGlzLl9mb3JtYXJ0RGVwbG95KCk7XG5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVEZXBsb3koKSB7XG4gICAgICAgICAgICAgICAgICAgICRodHRwLnBvc3QoJ2FwaS9kZXBsb3kvY3JlYXRlJywgYW5ndWxhci50b0pzb24ob2JqKSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NyZWF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiByZXMuZGF0YS5yZXN1bHRNc2dcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc05ld05hbWVzcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZXNwYWNlID0gdGhpcy5jb25maWcubmFtZXNwYWNlO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZXNwYWNlQXJyID0gW25hbWVzcGFjZV07XG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLnNldE5hbWVzcGFjZSh0aGlzLmNsdXN0ZXJMaXN0SW5zLmNsdXN0ZXIuaWQsIG5hbWVzcGFjZUFycikudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUlzTmV3TmFtZXNwYWNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5hbWVzcGFjZUxpc3QucHVzaChuYW1lc3BhY2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVOYW1lc3BhY2UobmFtZXNwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZURlcGxveSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICduYW1lc3BhY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlRGVwbG95KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNsYXNzIERlcGxveUluc3RhbmNlTGlzdCB7XG4gICAgICAgICAgICBjb25zdHJ1Y3RvcihpbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGxDb250YWluZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lckxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICAvLyDlt7LpgInkuK1pbnN0YW5jZeaVsFxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgLy8g5bey6YCJ5LitY29udGFpbmVy5pWwXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbnRhaW5lckNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoaW5zdGFuY2VzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluaXQoaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGxDb250YWluZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUxpc3QgPSAoZnVuY3Rpb24gKGluc3RhbmNlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VzID0gaW5zdGFuY2VzIHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZXNbaV0uaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlc1tpXS5rZXlGaWx0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZXNbaV0uY29udGFpbmVycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGluc3RhbmNlc1tpXS5jb250YWluZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZXNbaV0uY29udGFpbmVyc1tqXS5zaG9ydENvbnRhaW5lcklkID0gaW5zdGFuY2VzW2ldLmNvbnRhaW5lcnNbal0uY29udGFpbmVySWQuc3Vic3RyaW5nKDAsIDEyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZXM7XG4gICAgICAgICAgICAgICAgICAgIH0pKGluc3RhbmNlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOmAieaLqeWunuS+iy0tPuWIh+aNomNvbnRhaW5lckxpc3RcbiAgICAgICAgICAgIHRvZ2dsZUNvbnRhaW5lckxpc3QoaW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGxDb250YWluZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29udGFpbmVyQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyTGlzdCA9IGluc3RhbmNlLmNvbnRhaW5lcnMgfHwgW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbnRhaW5lckxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJMaXN0W2ldLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWx0ZXJXaXRoS2V5KGtleXdvcmRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaW5zdGFuY2VMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VMaXN0W2ldLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUxpc3RbaV0ua2V5RmlsdGVyID0gdGhpcy5pbnN0YW5jZUxpc3RbaV0uaW5zdGFuY2VOYW1lLmluZGV4T2Yoa2V5d29yZHMpICE9PSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b2dnbGVDb250YWluZXJDaGVjayhjb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGlzQWxsSGFzQ2hhbmdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lci5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29udGFpbmVyQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaYr+WQpuS4uuWFqOmAiVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbnRhaW5lckxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29udGFpbmVyTGlzdFtpXS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQWxsSGFzQ2hhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0FsbEhhc0NoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29udGFpbmVyQ291bnQtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWFqOmAiS/lhajkuI3pgIlcbiAgICAgICAgICAgIGNoZWNrQWxsQ29udGFpbmVyKGlzQ2hlY2tBbGxDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsQ29udGFpbmVyID0gaXNDaGVja0FsbENvbnRhaW5lciA9PT0gdW5kZWZpbmVkID8gIXRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA6IGlzQ2hlY2tBbGxDb250YWluZXI7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzQ2hlY2tBbGxDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb250YWluZXJDb3VudCA9IHRoaXMuY29udGFpbmVyTGlzdC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29udGFpbmVyQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb250YWluZXJMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lckxpc3RbaV0uaXNTZWxlY3RlZCA9IHRoaXMuaXNDaGVja0FsbENvbnRhaW5lcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDliIfmjaLljZXkuKrlrp7kvovnmoTpgInkuK3nirbmgIFcbiAgICAgICAgICAgIHRvZ2dsZUNoZWNrKGluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpc0FsbEhhc0NoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaYr+WQpuS4uuWFqOmAiVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmluc3RhbmNlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluc3RhbmNlTGlzdFtpXS5rZXlGaWx0ZXIgJiYgIXRoaXMuaW5zdGFuY2VMaXN0W2ldLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNBbGxIYXNDaGFuZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQWxsSGFzQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5YWo6YCJL+WFqOS4jemAiVxuICAgICAgICAgICAgY2hlY2tBbGxJbnN0YW5jZShpc0NoZWNrQWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gaXNDaGVja0FsbCA9PT0gdW5kZWZpbmVkID8gdGhpcy5pc0NoZWNrQWxsIDogaXNDaGVja0FsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbnN0YW5jZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2VMaXN0W2ldLmtleUZpbHRlciAmJiB0aGlzLmlzQ2hlY2tBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VMaXN0W2ldLmlzU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlTGlzdFtpXS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjbGFzcyBEZXBsb3lMaXN0IHtcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKGRlcGxveUxpc3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveSA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lJbnN0YW5jZUxpc3RJbnMgPSBuZXcgRGVwbG95SW5zdGFuY2VMaXN0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KGRlcGxveUxpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5pdChkZXBsb3lMaXN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0ID0gZGVwbG95TGlzdCB8fCBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZURlcGxveShkZXBsb3lJZCwgZGVwbG95TmFtZSwgbmFtZXNwYWNlLCBub3ROZWVkSW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZGVwbG95SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95LmlkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3kubmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95Lm5hbWVzcGFjZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95SW5zdGFuY2VMaXN0SW5zLmluaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3kuaWQgPSBkZXBsb3lJZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95Lm5hbWUgPSBkZXBsb3lOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3kubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFub3ROZWVkSW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS5nZXRJbnN0YW5jZXMoZGVwbG95SWQpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUluc3RhbmNlTGlzdElucy5pbml0KHJlcy5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEBwYXJhbSBob3N0RW52OiAnVEVTVCcgb3IgJ1BST0QnXG4gICAgICAgICAgICBmaWx0ZXJEZXBsb3koY2x1c3Rlck5hbWUsIGhvc3RFbnYpIHtcbiAgICAgICAgICAgICAgICBsZXQgZmlyc3RJbmRleCA9IC0xLFxuICAgICAgICAgICAgICAgICAgICBkZXBsb3lJZCwgZGVwbG95TmFtZSwgbmFtZXNwYWNlO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kZXBsb3lMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjbHVzdGVyTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0W2ldLmNsdXN0ZXJGaWx0ZXIgPSB0aGlzLmRlcGxveUxpc3RbaV0uY2x1c3Rlck5hbWUgPT09IGNsdXN0ZXJOYW1lO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0W2ldLmNsdXN0ZXJGaWx0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChob3N0RW52KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RbaV0uaG9zdEZpbHRlciA9IHRoaXMuZGVwbG95TGlzdFtpXS5ob3N0RW52ID09PSBob3N0RW52O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0W2ldLmhvc3RGaWx0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIOmAieS4reesrOS4gOS4quespuWQiOadoeS7tueahOmDqOe9suW5tuWIh+aNouWIsOivpemDqOe9slxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlyc3RJbmRleCA9PT0gLTEgJiYgdGhpcy5kZXBsb3lMaXN0W2ldLmNsdXN0ZXJGaWx0ZXIgJiYgdGhpcy5kZXBsb3lMaXN0W2ldLmhvc3RGaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0SW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95SWQgPSB0aGlzLmRlcGxveUxpc3RbaV0uZGVwbG95SWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lOYW1lID0gdGhpcy5kZXBsb3lMaXN0W2ldLmRlcGxveU5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2UgPSB0aGlzLmRlcGxveUxpc3RbaV0ubmFtZXNwYWNlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRvZ2dsZURlcGxveSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRvZ2dsZURlcGxveShkZXBsb3lJZCwgZGVwbG95TmFtZSwgbmFtZXNwYWNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDojrflvpflrp7kvotcbiAgICAgICAgY29uc3QgZ2V0SW5zdGFuY2UgPSAkZG9tZU1vZGVsLmluc3RhbmNlc0NyZWF0b3Ioe1xuICAgICAgICAgICAgRGVwbG95TGlzdDogRGVwbG95TGlzdCxcbiAgICAgICAgICAgIERlcGxveTogRGVwbG95XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVwbG95U2VydmljZTogZGVwbG95U2VydmljZSxcbiAgICAgICAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZVxuICAgICAgICB9O1xuICAgIH1cbiAgICBEZXBsb3lTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJywgJyRkb21lQ2x1c3RlcicsICckZG9tZVVzZXInLCAnJGRvbWVQcm9qZWN0JywgJyRkb21lSW1hZ2UnLCAnJGRvbWVQdWJsaWMnLCAnJGRvbWVNb2RlbCcsICckbW9kYWwnLCAnJHEnXTtcbiAgICBkZXBsb3lNb2R1bGUuZmFjdG9yeSgnJGRvbWVEZXBsb3knLCBEZXBsb3lTZXJ2aWNlKTtcbiAgICB3aW5kb3cuZGVwbG95TW9kdWxlID0gZGVwbG95TW9kdWxlO1xufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
