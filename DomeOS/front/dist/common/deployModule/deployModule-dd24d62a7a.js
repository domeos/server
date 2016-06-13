'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (window, undefined) {
    'use strict';

    var deployModule = angular.module('deployModule', []);

    function DeployService($http, $domeCluster, $domeImage, $domePublic, $domeModel, $modal, $q, $util) {
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
                this.imageList = null;
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
                this.logConfig = null;
                this.envText = '请选择部署环境';
                this.versionList = null;
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
                        id = void 0,
                        createTime = -1;

                    if (!$util.isObject(deployConfig)) {
                        deployConfig = {};
                    }
                    if (typeof deployConfig.replicas !== 'number') {
                        deployConfig.replicas = 3;
                    }
                    // 是否使用负载均衡
                    if (!$util.isArray(deployConfig.loadBalanceDrafts)) {
                        deployConfig.loadBalanceDrafts = [];
                    }
                    //对内服务
                    if (!$util.isArray(deployConfig.innerServiceDrafts)) {
                        deployConfig.innerServiceDrafts = [];
                    }
                    if (!$util.isArray(deployConfig.currentVersions)) {
                        deployConfig.currentVersions = [];
                    }
                    // loadBalanceDraft.externalIPs: ['externalIP1','externalIP2'] --> [{ip:'externalIP1'},{ip:'externalIP1'},{ip:''}]
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = deployConfig.loadBalanceDrafts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var loadBalanceDraft = _step.value;

                            if (!loadBalanceDraft.externalIPs) {
                                loadBalanceDraft.externalIPs = [];
                            }
                            var externalIPs = [];
                            var _iteratorNormalCompletion2 = true;
                            var _didIteratorError2 = false;
                            var _iteratorError2 = undefined;

                            try {
                                for (var _iterator2 = loadBalanceDraft.externalIPs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var ip = _step2.value;

                                    externalIPs.push({
                                        ip: ip
                                    });
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

                            externalIPs.push({
                                ip: ''
                            });
                            loadBalanceDraft.externalIPs = externalIPs;
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
                                if (currentVersions.length === 0 && $util.isObject(_this.versionList[0])) {
                                    _this.toggleVersion(_this.versionList[0].version);
                                }
                            });
                        }
                        for (var i = 0, l = currentVersions.length; i < l; i++) {
                            if (currentVersions[i].createTime > createTime) {
                                createTime = currentVersions[i].createTime;
                                id = currentVersions[i].version;
                            }
                        }
                        this.toggleVersion(id);
                    } else {
                        this.initData();
                    }
                }
                // deployinfo和versioninfo重合的信息在这里处理，切换version之后重新调用进行初始化

            }, {
                key: 'initData',
                value: function initData() {
                    var _this2 = this;

                    if (!$util.isObject(this.config.logDraft)) {
                        this.config.logDraft = {};
                    }
                    if (!$util.isArray(this.config.logDraft.logItemDrafts)) {
                        this.config.logDraft.logItemDrafts = [];
                    }
                    this.config.logDraft.logItemDrafts.push({
                        logPath: '',
                        autoCollect: false,
                        autoDelete: false
                    });
                    if (!$util.isArray(this.config.containerDrafts)) {
                        this.config.containerDrafts = [];
                    }
                    if (!$util.isArray(this.config.labelSelectors)) {
                        this.config.labelSelectors = [];
                    }
                    this.initSelectedLabels();

                    if (!this.config.hostEnv) {
                        this.toggleEnv(this.envList[0]);
                    } else {
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = this.envList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var env = _step3.value;

                                if (this.config.hostEnv === env.value) {
                                    this.toggleEnv(env);
                                    break;
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
                    }

                    if (this.config.stateful !== true) {
                        if (!$util.isArray(this.imageList)) {
                            this.loadingIns.startLoading('dockerImage');
                            $domeImage.imageService.getProjectImages().then(function (res) {
                                var imageList = res.data.result || [];
                                // 格式化image的envSettings为containerDrafts格式
                                var _iteratorNormalCompletion4 = true;
                                var _didIteratorError4 = false;
                                var _iteratorError4 = undefined;

                                try {
                                    for (var _iterator4 = imageList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                        var image = _step4.value;

                                        var envs = [];
                                        if (image.envSettings) {
                                            var _iteratorNormalCompletion5 = true;
                                            var _didIteratorError5 = false;
                                            var _iteratorError5 = undefined;

                                            try {
                                                for (var _iterator5 = image.envSettings[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                                    var _env = _step5.value;

                                                    envs.push({
                                                        key: _env.key,
                                                        value: _env.value,
                                                        description: _env.description
                                                    });
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
                                        }
                                        image.envSettings = envs;
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
                    if ($util.isObject(newConfig)) {
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

                    var clusterId = void 0,
                        clusterList = this.clusterListIns.clusterList;
                    if (clusterList.length === 0) {
                        return;
                    }
                    // 选择当前deploy/version的cluster
                    if (typeof index === 'undefined') {
                        for (var i = 0, l = clusterList.length; i < l; i++) {
                            if (clusterList[i].id === this.config.clusterId) {
                                index = i;
                                break;
                            }
                        }
                        // 如果当前deploy/version没有cluster，则选择第一个
                        if (typeof index === 'undefined') {
                            index = 0;
                        }
                    }

                    this.clusterListIns.toggleCluster(index);
                    this.logConfig = clusterList[index].logConfig;
                    clusterId = this.clusterListIns.cluster.id;
                    // 重置日志信息
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
                        for (var _i = 0; _i < _this5.nodeListForIps.length; _i++) {
                            var node = _this5.nodeListForIps[_i];
                            if (node.status == 'Ready') {
                                var ips = _this5.config.loadBalanceDrafts[0].externalIPs;
                                var _iteratorNormalCompletion6 = true;
                                var _didIteratorError6 = false;
                                var _iteratorError6 = undefined;

                                try {
                                    for (var _iterator6 = ips[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                        var ip = _step6.value;

                                        if (ip === node.ip) {
                                            node.isSelected = true;
                                            break;
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

                                if (node.isSelected === void 0) {
                                    node.isSelected = false;
                                }
                            } else {
                                _this5.nodeListForIps.splice(_i, 1);
                                _i--;
                            }
                        }
                        // 如果是app store的主机列表，则过滤掉没有diskPath的主机
                        _this5.nodeListIns.init(nodeList, _this5.config.stateful);
                        _this5.initSelectedLabels();
                        _this5.nodeListIns.toggleEnv(_this5.config.hostEnv);
                        // 如果是有状态服务，默认选择和replics相等的主机个数
                        if (_this5.config.stateful && _this5.config.replicas && _this5.nodeListIns.nodeList) {
                            for (var _i2 = 0, _l = _this5.nodeListIns.nodeList.length; _i2 < _l && _i2 < _this5.config.replicas; _i2++) {
                                _this5.nodeListIns.nodeList[_i2].isSelected = true;
                                _this5.nodeListIns.toggleNodeCheck(_this5.nodeListIns.nodeList[_i2]);
                            }
                        }
                    }, function () {
                        _this5.nodeListIns.init();
                    }).finally(function () {
                        _this5.loadingIns.finishLoading('nodelist');
                    });

                    if (this.config.deployId === void 0) {
                        this.loadingIns.startLoading('namespace');
                        nodeService.getNamespace(clusterId).then(function (res) {
                            _this5.namespaceList = res.data.result || [];
                            _this5.isNewNamespace = false;
                            _this5.config.namespace = _this5.namespaceList[0].name || null;
                            for (var _i3 = 0, _l2 = _this5.namespaceList.length; _i3 < _l2; _i3++) {
                                if (_this5.namespaceList[_i3].name == 'default') {
                                    _this5.config.namespace = _this5.namespaceList[_i3].name;
                                    break;
                                }
                            }
                        }, function () {
                            _this5.isNewNamespace = false;
                            _this5.namespaceList = [];
                            _this5.config.namespace = null;
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
                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;

                    try {
                        for (var _iterator7 = labelSelectors[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var labelSelector = _step7.value;

                            var labelName = labelSelector.name;
                            if (labelName != 'kubernetes.io/hostname' && labelName != 'TESTENV' && labelName != 'PRODENV') {
                                this.nodeListIns.toggleLabel(labelName, true);
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
                }
            }, {
                key: 'validIps',
                value: function validIps() {
                    if (this.visitMode === 'foreign') {
                        var _iteratorNormalCompletion8 = true;
                        var _didIteratorError8 = false;
                        var _iteratorError8 = undefined;

                        try {
                            for (var _iterator8 = this.nodeListForIps[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                var node = _step8.value;

                                if (node.isSelected) {
                                    this.valid.ips = true;
                                    return;
                                }
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
                        if ($util.isObject(res.data.result)) {
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
                    for (var i = 0, l = containerDrafts.length; i < l; i++) {
                        containerDrafts[i].oldEnv = [];
                        containerDrafts[i].newEnv = [];
                        // 获得该镜像版本
                        getTag(containerDrafts[i]);
                        var oldEnv = [];
                        // 获得镜像原本的envSettings
                        for (var j = 0, l1 = this.imageList.length; j < l1; j++) {
                            if (this.imageList[j].imageName === containerDrafts[i].image) {
                                oldEnv = this.imageList[j].envSettings;
                                break;
                            }
                        }
                        // 分离镜像本身的image和新添加的image的env
                        if (containerDrafts[i].envs) {
                            for (var w = 0, l2 = containerDrafts[i].envs.length; w < l2; w++) {
                                var isOldEnv = false;
                                for (var k = 0, l3 = oldEnv.length; k < l3; k++) {
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
                    this.config.namespace = null;
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
                            tag: tags && tags[0] ? tags[0].tag : void 0,
                            tagList: tags || [],
                            oldEnv: image.envSettings || [],
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
                        var _iteratorNormalCompletion9 = true;
                        var _didIteratorError9 = false;
                        var _iteratorError9 = undefined;

                        try {
                            for (var _iterator9 = this.config.containerDrafts[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                var containerDraft = _step9.value;

                                containerDraft.healthChecker = {
                                    type: 'NONE'
                                };
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
                    }
                }
            }, {
                key: 'changeNetworkmode',
                value: function changeNetworkmode() {
                    if (this.config.networkMode == 'HOST') {
                        var _iteratorNormalCompletion10 = true;
                        var _didIteratorError10 = false;
                        var _iteratorError10 = undefined;

                        try {
                            for (var _iterator10 = this.config.loadBalanceDrafts[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                                var loadBalanceDraft = _step10.value;

                                loadBalanceDraft.port = loadBalanceDraft.targetPort;
                            }
                        } catch (err) {
                            _didIteratorError10 = true;
                            _iteratorError10 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion10 && _iterator10.return) {
                                    _iterator10.return();
                                }
                            } finally {
                                if (_didIteratorError10) {
                                    throw _iteratorError10;
                                }
                            }
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

                    var deployConfig = angular.copy(this.config);

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
                        var _iteratorNormalCompletion11 = true;
                        var _didIteratorError11 = false;
                        var _iteratorError11 = undefined;

                        try {
                            for (var _iterator11 = _this10.nodeListForIps[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                                var node = _step11.value;

                                if (node.isSelected) {
                                    ips.push(node.ip);
                                }
                            }
                        } catch (err) {
                            _didIteratorError11 = true;
                            _iteratorError11 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion11 && _iterator11.return) {
                                    _iterator11.return();
                                }
                            } finally {
                                if (_didIteratorError11) {
                                    throw _iteratorError11;
                                }
                            }
                        }

                        var _iteratorNormalCompletion12 = true;
                        var _didIteratorError12 = false;
                        var _iteratorError12 = undefined;

                        try {
                            for (var _iterator12 = deployConfig.loadBalanceDrafts[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                                var loadBalanceDraft = _step12.value;

                                if (loadBalanceDraft.port) {
                                    loadBalanceDraft.externalIPs = ips;
                                    loadBalanceDrafts.push(loadBalanceDraft);
                                }
                            }
                        } catch (err) {
                            _didIteratorError12 = true;
                            _iteratorError12 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion12 && _iterator12.return) {
                                    _iterator12.return();
                                }
                            } finally {
                                if (_didIteratorError12) {
                                    throw _iteratorError12;
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
                        var _iteratorNormalCompletion13 = true;
                        var _didIteratorError13 = false;
                        var _iteratorError13 = undefined;

                        try {
                            for (var _iterator13 = deployConfig.logDraft.logItemDrafts[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                                var logItem = _step13.value;

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
                            _didIteratorError13 = true;
                            _iteratorError13 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion13 && _iterator13.return) {
                                    _iterator13.return();
                                }
                            } finally {
                                if (_didIteratorError13) {
                                    throw _iteratorError13;
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
                            return void 0;
                        }

                        var envConf = void 0,
                            containerDrafts = [],
                            healthChecker = void 0;

                        var _iteratorNormalCompletion14 = true;
                        var _didIteratorError14 = false;
                        var _iteratorError14 = undefined;

                        try {
                            for (var _iterator14 = deployConfig.containerDrafts[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                                var containerDraft = _step14.value;

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

                                var _iteratorNormalCompletion15 = true;
                                var _didIteratorError15 = false;
                                var _iteratorError15 = undefined;

                                try {
                                    for (var _iterator15 = containerDraft.newEnv[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                                        var env = _step15.value;

                                        if (env.key !== '') {
                                            envConf.push(env);
                                        }
                                    }
                                } catch (err) {
                                    _didIteratorError15 = true;
                                    _iteratorError15 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion15 && _iterator15.return) {
                                            _iterator15.return();
                                        }
                                    } finally {
                                        if (_didIteratorError15) {
                                            throw _iteratorError15;
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
                            _didIteratorError14 = true;
                            _iteratorError14 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion14 && _iterator14.return) {
                                    _iterator14.return();
                                }
                            } finally {
                                if (_didIteratorError14) {
                                    throw _iteratorError14;
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
                        if (replicas === _this12.config.currentReplicas) {
                            $domePublic.openWarning('实例个数无变化！');
                            deferred.reject();
                            return;
                        }
                        var url = replicas > _this12.config.currentReplicas ? 'api/deploy/action/scaleup' : 'api/deploy/action/scaledown';
                        $http.post(url + '?deployId=' + _this12.config.deployId + '&replicas=' + replicas + '&version=' + _this12.config.currentVersions[0].version).then(function (res) {
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
                this.instanceList = [];
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
                    this.instanceList = function () {
                        instances = instances || [];
                        var _iteratorNormalCompletion16 = true;
                        var _didIteratorError16 = false;
                        var _iteratorError16 = undefined;

                        try {
                            for (var _iterator16 = instances[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                                var instance = _step16.value;

                                instance.isSelected = false;
                                instance.keyFilter = true;
                                if (instance.containers) {
                                    var _iteratorNormalCompletion17 = true;
                                    var _didIteratorError17 = false;
                                    var _iteratorError17 = undefined;

                                    try {
                                        for (var _iterator17 = instance.containers[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                                            var container = _step17.value;

                                            container.shortContainerId = container.containerId.substring(0, 12);
                                        }
                                    } catch (err) {
                                        _didIteratorError17 = true;
                                        _iteratorError17 = err;
                                    } finally {
                                        try {
                                            if (!_iteratorNormalCompletion17 && _iterator17.return) {
                                                _iterator17.return();
                                            }
                                        } finally {
                                            if (_didIteratorError17) {
                                                throw _iteratorError17;
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (err) {
                            _didIteratorError16 = true;
                            _iteratorError16 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion16 && _iterator16.return) {
                                    _iterator16.return();
                                }
                            } finally {
                                if (_didIteratorError16) {
                                    throw _iteratorError16;
                                }
                            }
                        }

                        return instances;
                    }();
                }
                // 选择实例-->切换containerList

            }, {
                key: 'toggleContainerList',
                value: function toggleContainerList(instance) {
                    this.isCheckAllContainer = false;
                    this.selectedContainerCount = 0;
                    this.containerList = instance.containers || [];
                    var _iteratorNormalCompletion18 = true;
                    var _didIteratorError18 = false;
                    var _iteratorError18 = undefined;

                    try {
                        for (var _iterator18 = this.containerList[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                            var container = _step18.value;

                            container.isSelected = false;
                        }
                    } catch (err) {
                        _didIteratorError18 = true;
                        _iteratorError18 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion18 && _iterator18.return) {
                                _iterator18.return();
                            }
                        } finally {
                            if (_didIteratorError18) {
                                throw _iteratorError18;
                            }
                        }
                    }
                }
            }, {
                key: 'filterWithKey',
                value: function filterWithKey(keywords) {
                    this.isCheckAll = false;
                    this.selectedCount = 0;
                    var _iteratorNormalCompletion19 = true;
                    var _didIteratorError19 = false;
                    var _iteratorError19 = undefined;

                    try {
                        for (var _iterator19 = this.instanceList[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
                            var instance = _step19.value;

                            instance.isSelected = false;
                            instance.keyFilter = instance.instanceName.indexOf(keywords) !== -1;
                        }
                    } catch (err) {
                        _didIteratorError19 = true;
                        _iteratorError19 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion19 && _iterator19.return) {
                                _iterator19.return();
                            }
                        } finally {
                            if (_didIteratorError19) {
                                throw _iteratorError19;
                            }
                        }
                    }
                }
            }, {
                key: 'toggleContainerCheck',
                value: function toggleContainerCheck(container) {
                    var isAllHasChange = true;
                    if (container.isSelected) {
                        this.selectedContainerCount++;
                        // 是否为全选
                        var _iteratorNormalCompletion20 = true;
                        var _didIteratorError20 = false;
                        var _iteratorError20 = undefined;

                        try {
                            for (var _iterator20 = this.containerList[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
                                var _container = _step20.value;

                                if (!_container.isSelected) {
                                    isAllHasChange = false;
                                    break;
                                }
                            }
                        } catch (err) {
                            _didIteratorError20 = true;
                            _iteratorError20 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion20 && _iterator20.return) {
                                    _iterator20.return();
                                }
                            } finally {
                                if (_didIteratorError20) {
                                    throw _iteratorError20;
                                }
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
                    this.isCheckAllContainer = typeof isCheckAllContainer === 'undefined' ? !this.isCheckAllContainer : isCheckAllContainer;
                    this.selectedContainerCount = this.isCheckAllContainer ? this.containerList.length : 0;
                    var _iteratorNormalCompletion21 = true;
                    var _didIteratorError21 = false;
                    var _iteratorError21 = undefined;

                    try {
                        for (var _iterator21 = this.containerList[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
                            var container = _step21.value;

                            container.isSelected = this.isCheckAllContainer;
                        }
                    } catch (err) {
                        _didIteratorError21 = true;
                        _iteratorError21 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion21 && _iterator21.return) {
                                _iterator21.return();
                            }
                        } finally {
                            if (_didIteratorError21) {
                                throw _iteratorError21;
                            }
                        }
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
                        var _iteratorNormalCompletion22 = true;
                        var _didIteratorError22 = false;
                        var _iteratorError22 = undefined;

                        try {
                            for (var _iterator22 = this.instanceList[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
                                var _instance = _step22.value;

                                if (_instance.keyFilter && !_instance.isSelected) {
                                    isAllHasChange = false;
                                    break;
                                }
                            }
                        } catch (err) {
                            _didIteratorError22 = true;
                            _iteratorError22 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion22 && _iterator22.return) {
                                    _iterator22.return();
                                }
                            } finally {
                                if (_didIteratorError22) {
                                    throw _iteratorError22;
                                }
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
                    this.isCheckAll = typeof isCheckAll === 'undefined' ? this.isCheckAll : isCheckAll;
                    this.selectedCount = 0;
                    var _iteratorNormalCompletion23 = true;
                    var _didIteratorError23 = false;
                    var _iteratorError23 = undefined;

                    try {
                        for (var _iterator23 = this.instanceList[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
                            var instance = _step23.value;

                            if (instance.keyFilter && this.isCheckAll) {
                                instance.isSelected = true;
                                this.selectedCount++;
                            } else {
                                instance.isSelected = false;
                            }
                        }
                    } catch (err) {
                        _didIteratorError23 = true;
                        _iteratorError23 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion23 && _iterator23.return) {
                                _iterator23.return();
                            }
                        } finally {
                            if (_didIteratorError23) {
                                throw _iteratorError23;
                            }
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
                this.deployList = [];
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
                        this.deploy.id = null;
                        this.deploy.name = null;
                        this.deploy.namespace = null;
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
                    var deployId = void 0,
                        deployName = void 0,
                        namespace = void 0;
                    var _iteratorNormalCompletion24 = true;
                    var _didIteratorError24 = false;
                    var _iteratorError24 = undefined;

                    try {
                        for (var _iterator24 = this.deployList[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
                            var deploy = _step24.value;

                            deploy.clusterFilter = clusterName ? deploy.clusterName === clusterName : true;
                            deploy.hostFilter = hostEnv ? deploy.hostEnv === hostEnv : true;
                            // 选中第一个符合条件的部署并切换到该部署
                            if (typeof deployId === 'undefined' && deploy.clusterFilter && deploy.hostFilter) {
                                deployId = deploy.deployId;
                                deployName = deploy.deployName;
                                namespace = deploy.namespace;
                            }
                        }
                    } catch (err) {
                        _didIteratorError24 = true;
                        _iteratorError24 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion24 && _iterator24.return) {
                                _iterator24.return();
                            }
                        } finally {
                            if (_didIteratorError24) {
                                throw _iteratorError24;
                            }
                        }
                    }

                    return typeof deployId === 'undefined' ? this.toggleDeploy() : this.toggleDeploy(deployId, deployName, namespace);
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
    DeployService.$inject = ['$http', '$domeCluster', '$domeImage', '$domePublic', '$domeModel', '$modal', '$q', '$util'];
    deployModule.factory('$domeDeploy', DeployService);
    window.deployModule = deployModule;
})(window);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9kZXBsb3lNb2R1bGUvZGVwbG95TW9kdWxlLmVzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLENBQUMsVUFBQyxNQUFELEVBQVMsU0FBVCxFQUF1QjtBQUNwQixpQkFEb0I7O0FBRXBCLFFBQUksZUFBZSxRQUFRLE1BQVIsQ0FBZSxjQUFmLEVBQStCLEVBQS9CLENBQWYsQ0FGZ0I7O0FBSXBCLGFBQVMsYUFBVCxDQUF1QixLQUF2QixFQUE4QixZQUE5QixFQUE0QyxVQUE1QyxFQUF3RCxXQUF4RCxFQUFxRSxVQUFyRSxFQUFpRixNQUFqRixFQUF5RixFQUF6RixFQUE2RixLQUE3RixFQUFvRztBQUNoRyxZQUFNLGNBQWMsYUFBYSxXQUFiLENBQXlCLGFBQXpCLENBQWQsQ0FEMEY7QUFFaEcsWUFBTSxnQkFBZ0IsU0FBaEIsYUFBZ0IsR0FBWTtBQUM5QixnQkFBTSxPQUFPLGFBQVAsQ0FEd0I7QUFFOUIsZ0JBQU0sY0FBYyxjQUFkLENBRndCO0FBRzlCLGlCQUFLLE9BQUwsR0FBZTt1QkFBTSxNQUFNLEdBQU4sQ0FBYSxjQUFiO2FBQU4sQ0FIZTtBQUk5QixpQkFBSyxTQUFMLEdBQWlCLFVBQUMsUUFBRDt1QkFBYyxNQUFNLEdBQU4sQ0FBYSxnQkFBVyxRQUF4QjthQUFkLENBSmE7QUFLOUIsaUJBQUssU0FBTCxHQUFpQixVQUFDLFFBQUQ7dUJBQWMsTUFBTSxHQUFOLENBQWEsaUNBQTRCLFFBQXpDO2FBQWQsQ0FMYTtBQU05QixpQkFBSyxZQUFMLEdBQW9CLFVBQUMsUUFBRDt1QkFBYyxNQUFNLEdBQU4sQ0FBYSxhQUFRLHNCQUFyQjthQUFkLENBTlU7QUFPOUIsaUJBQUssV0FBTCxHQUFtQixVQUFDLFFBQUQ7dUJBQWMsTUFBTSxHQUFOLENBQWEsa0NBQTZCLFFBQTFDO2FBQWQsQ0FQVztBQVE5QixpQkFBSyxnQkFBTCxHQUF3QixVQUFDLFFBQUQsRUFBVyxTQUFYO3VCQUF5QixNQUFNLEdBQU4sQ0FBYSx1QkFBa0IsaUJBQVksU0FBM0M7YUFBekIsQ0FSTTtBQVM5QixpQkFBSyxhQUFMLEdBQXFCLFVBQUMsT0FBRDt1QkFBYSxNQUFNLElBQU4sQ0FBYyxvQ0FBK0IsUUFBUSxRQUFSLEVBQW9CLFFBQVEsTUFBUixDQUFlLE9BQWYsQ0FBakU7YUFBYixDQVRTO0FBVTlCLGlCQUFLLGNBQUwsR0FBc0IsVUFBQyxRQUFELEVBQVcsU0FBWCxFQUFzQixRQUF0QixFQUFtQztBQUNyRCxvQkFBSSxRQUFKLEVBQWM7QUFDViwyQkFBTyxNQUFNLElBQU4sMkNBQW1ELHlCQUFvQiwyQkFBc0IsUUFBN0YsQ0FBUCxDQURVO2lCQUFkLE1BRU87QUFDSCwyQkFBTyxNQUFNLElBQU4sMkNBQW1ELHlCQUFvQixTQUF2RSxDQUFQLENBREc7aUJBRlA7YUFEa0IsQ0FWUTtBQWlCOUIsaUJBQUssWUFBTCxHQUFvQixVQUFDLFFBQUQsRUFBVyxTQUFYLEVBQXNCLFFBQXRCLEVBQW1DO0FBQ25ELG9CQUFJLFFBQUosRUFBYztBQUNWLDJCQUFPLE1BQU0sSUFBTix5Q0FBaUQseUJBQW9CLDJCQUFzQixRQUEzRixDQUFQLENBRFU7aUJBQWQsTUFFTztBQUNILDJCQUFPLE1BQU0sSUFBTix5Q0FBaUQseUJBQW9CLFNBQXJFLENBQVAsQ0FERztpQkFGUDthQURnQixDQWpCVTtBQXdCOUIsaUJBQUssV0FBTCxHQUFtQixVQUFDLFFBQUQsRUFBVyxTQUFYLEVBQXNCLFFBQXRCLEVBQW1DO0FBQ2xELG9CQUFJLFFBQUosRUFBYztBQUNWLDJCQUFPLE1BQU0sSUFBTix3Q0FBZ0QseUJBQW9CLDJCQUFzQixRQUExRixDQUFQLENBRFU7aUJBQWQsTUFFTztBQUNILDJCQUFPLE1BQU0sSUFBTix3Q0FBZ0QseUJBQW9CLFNBQXBFLENBQVAsQ0FERztpQkFGUDthQURlLENBeEJXO1NBQVosQ0FGMEU7QUFrQ2hHLFlBQU0sZ0JBQWdCLElBQUksYUFBSixFQUFoQixDQWxDMEY7O1lBcUMxRjtBQUNGLHFCQURFLE1BQ0YsQ0FBWSxZQUFaLEVBQTBCO3NDQUR4QixRQUN3Qjs7QUFDdEIscUJBQUssYUFBTCxHQUFxQixFQUFyQjs7QUFEc0Isb0JBR3RCLENBQUssY0FBTCxHQUFzQixLQUF0QixDQUhzQjtBQUl0QixxQkFBSyxTQUFMLEdBQWlCLElBQWpCLENBSnNCO0FBS3RCLHFCQUFLLE9BQUwsR0FBZSxDQUFDO0FBQ1osMkJBQU8sTUFBUDtBQUNBLDBCQUFNLE1BQU47aUJBRlcsRUFHWjtBQUNDLDJCQUFPLE1BQVA7QUFDQSwwQkFBTSxNQUFOO2lCQUxXLENBQWY7O0FBTHNCLG9CQWF0QixDQUFLLEtBQUwsR0FBYTs7QUFFVCx5QkFBSyxLQUFMO2lCQUZKOztBQWJzQixvQkFrQnRCLENBQUssU0FBTCxHQUFpQixJQUFqQixDQWxCc0I7QUFtQnRCLHFCQUFLLE9BQUwsR0FBZSxTQUFmLENBbkJzQjtBQW9CdEIscUJBQUssV0FBTCxHQUFtQixJQUFuQixDQXBCc0I7QUFxQnRCLHFCQUFLLFdBQUwsR0FBbUIsYUFBYSxXQUFiLENBQXlCLFVBQXpCLENBQW5CLENBckJzQjtBQXNCdEIscUJBQUssY0FBTCxHQUFzQixFQUF0QixDQXRCc0I7QUF1QnRCLHFCQUFLLGNBQUwsR0FBc0IsYUFBYSxXQUFiLENBQXlCLGFBQXpCLENBQXRCLENBdkJzQjtBQXdCdEIscUJBQUssVUFBTCxHQUFrQixZQUFZLGtCQUFaLEVBQWxCLENBeEJzQjtBQXlCdEIscUJBQUssT0FBTCxHQUFlO0FBQ1gsd0JBQUksSUFBSjtBQUNBLDBCQUFNLElBQU47QUFDQSwwQkFBTSxJQUFOO2lCQUhKLENBekJzQjtBQThCdEIscUJBQUssU0FBTCxHQUFpQixVQUFqQixDQTlCc0I7QUErQnRCLHFCQUFLLE1BQUwsR0FBYyxFQUFkLENBL0JzQjtBQWdDdEIscUJBQUssSUFBTCxDQUFVLFlBQVYsRUFoQ3NCO2FBQTFCOzt5QkFERTs7cUNBbUNHLGNBQWM7OztBQUNYLHdCQUFJLHdCQUFKO3dCQUFxQixXQUFyQjt3QkFDSSxhQUFhLENBQUMsQ0FBRCxDQUZOOztBQUlYLHdCQUFJLENBQUMsTUFBTSxRQUFOLENBQWUsWUFBZixDQUFELEVBQStCO0FBQy9CLHVDQUFlLEVBQWYsQ0FEK0I7cUJBQW5DO0FBR0Esd0JBQUksT0FBTyxhQUFhLFFBQWIsS0FBMEIsUUFBakMsRUFBMkM7QUFDM0MscUNBQWEsUUFBYixHQUF3QixDQUF4QixDQUQyQztxQkFBL0M7O0FBUFcsd0JBV1AsQ0FBQyxNQUFNLE9BQU4sQ0FBYyxhQUFhLGlCQUFiLENBQWYsRUFBZ0Q7QUFDaEQscUNBQWEsaUJBQWIsR0FBaUMsRUFBakMsQ0FEZ0Q7cUJBQXBEOztBQVhXLHdCQWVQLENBQUMsTUFBTSxPQUFOLENBQWMsYUFBYSxrQkFBYixDQUFmLEVBQWlEO0FBQ2pELHFDQUFhLGtCQUFiLEdBQWtDLEVBQWxDLENBRGlEO3FCQUFyRDtBQUdBLHdCQUFJLENBQUMsTUFBTSxPQUFOLENBQWMsYUFBYSxlQUFiLENBQWYsRUFBOEM7QUFDOUMscUNBQWEsZUFBYixHQUErQixFQUEvQixDQUQ4QztxQkFBbEQ7O0FBbEJXOzs7OztBQXNCWCw2Q0FBNkIsYUFBYSxpQkFBYiwwQkFBN0Isb0dBQTZEO2dDQUFwRCwrQkFBb0Q7O0FBQ3pELGdDQUFJLENBQUMsaUJBQWlCLFdBQWpCLEVBQThCO0FBQy9CLGlEQUFpQixXQUFqQixHQUErQixFQUEvQixDQUQrQjs2QkFBbkM7QUFHQSxnQ0FBSSxjQUFjLEVBQWQsQ0FKcUQ7Ozs7OztBQUt6RCxzREFBZSxpQkFBaUIsV0FBakIsMkJBQWYsd0dBQTZDO3dDQUFwQyxrQkFBb0M7O0FBQ3pDLGdEQUFZLElBQVosQ0FBaUI7QUFDYiw0Q0FBSSxFQUFKO3FDQURKLEVBRHlDO2lDQUE3Qzs7Ozs7Ozs7Ozs7Ozs7NkJBTHlEOztBQVV6RCx3Q0FBWSxJQUFaLENBQWlCO0FBQ2Isb0NBQUksRUFBSjs2QkFESixFQVZ5RDtBQWF6RCw2Q0FBaUIsV0FBakIsR0FBK0IsV0FBL0IsQ0FieUQ7eUJBQTdEOzs7Ozs7Ozs7Ozs7OztxQkF0Qlc7O0FBc0NYLHlCQUFLLE1BQUwsR0FBYyxZQUFkLENBdENXOztBQXdDWCx5QkFBSyxjQUFMLEdBeENXO0FBeUNYLHlCQUFLLGVBQUw7OztBQXpDVyx3QkE0Q1AsQ0FBQyxLQUFLLE1BQUwsQ0FBWSxXQUFaLEVBQXlCO0FBQzFCLDZCQUFLLE1BQUwsQ0FBWSxXQUFaLEdBQTBCLFNBQTFCLENBRDBCO3FCQUE5QjtBQUdBLHdCQUFJLENBQUMsS0FBSyxNQUFMLENBQVksVUFBWixFQUF3QjtBQUN6Qiw2QkFBSyxNQUFMLENBQVksVUFBWixHQUF5QixhQUF6QixDQUR5QjtxQkFBN0I7QUFHQSxzQ0FBa0IsS0FBSyxNQUFMLENBQVksZUFBWjs7QUFsRFAsd0JBb0RQLEtBQUssTUFBTCxDQUFZLFFBQVosRUFBc0I7QUFDdEIsNEJBQUksQ0FBQyxLQUFLLFdBQUwsRUFBa0I7QUFDbkIsMENBQWMsV0FBZCxDQUEwQixLQUFLLE1BQUwsQ0FBWSxRQUFaLENBQTFCLENBQWdELElBQWhELENBQXFELFVBQUMsR0FBRCxFQUFTO0FBQzFELHNDQUFLLFdBQUwsR0FBbUIsSUFBSSxJQUFKLENBQVMsTUFBVCxJQUFtQixFQUFuQixDQUR1QztBQUUxRCxvQ0FBSSxnQkFBZ0IsTUFBaEIsS0FBMkIsQ0FBM0IsSUFBZ0MsTUFBTSxRQUFOLENBQWUsTUFBSyxXQUFMLENBQWlCLENBQWpCLENBQWYsQ0FBaEMsRUFBcUU7QUFDckUsMENBQUssYUFBTCxDQUFtQixNQUFLLFdBQUwsQ0FBaUIsQ0FBakIsRUFBb0IsT0FBcEIsQ0FBbkIsQ0FEcUU7aUNBQXpFOzZCQUZpRCxDQUFyRCxDQURtQjt5QkFBdkI7QUFRQSw2QkFBSyxJQUFJLElBQUksQ0FBSixFQUFPLElBQUksZ0JBQWdCLE1BQWhCLEVBQXdCLElBQUksQ0FBSixFQUFPLEdBQW5ELEVBQXdEO0FBQ3BELGdDQUFJLGdCQUFnQixDQUFoQixFQUFtQixVQUFuQixHQUFnQyxVQUFoQyxFQUE0QztBQUM1Qyw2Q0FBYSxnQkFBZ0IsQ0FBaEIsRUFBbUIsVUFBbkIsQ0FEK0I7QUFFNUMscUNBQUssZ0JBQWdCLENBQWhCLEVBQW1CLE9BQW5CLENBRnVDOzZCQUFoRDt5QkFESjtBQU1BLDZCQUFLLGFBQUwsQ0FBbUIsRUFBbkIsRUFmc0I7cUJBQTFCLE1BZ0JPO0FBQ0gsNkJBQUssUUFBTCxHQURHO3FCQWhCUDs7Ozs7OzJDQXFCRzs7O0FBQ1Asd0JBQUksQ0FBQyxNQUFNLFFBQU4sQ0FBZSxLQUFLLE1BQUwsQ0FBWSxRQUFaLENBQWhCLEVBQXVDO0FBQ3ZDLDZCQUFLLE1BQUwsQ0FBWSxRQUFaLEdBQXVCLEVBQXZCLENBRHVDO3FCQUEzQztBQUdBLHdCQUFJLENBQUMsTUFBTSxPQUFOLENBQWMsS0FBSyxNQUFMLENBQVksUUFBWixDQUFxQixhQUFyQixDQUFmLEVBQW9EO0FBQ3BELDZCQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLGFBQXJCLEdBQXFDLEVBQXJDLENBRG9EO3FCQUF4RDtBQUdBLHlCQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLGFBQXJCLENBQW1DLElBQW5DLENBQXdDO0FBQ3BDLGlDQUFTLEVBQVQ7QUFDQSxxQ0FBYSxLQUFiO0FBQ0Esb0NBQVksS0FBWjtxQkFISixFQVBPO0FBWVAsd0JBQUksQ0FBQyxNQUFNLE9BQU4sQ0FBYyxLQUFLLE1BQUwsQ0FBWSxlQUFaLENBQWYsRUFBNkM7QUFDN0MsNkJBQUssTUFBTCxDQUFZLGVBQVosR0FBOEIsRUFBOUIsQ0FENkM7cUJBQWpEO0FBR0Esd0JBQUksQ0FBQyxNQUFNLE9BQU4sQ0FBYyxLQUFLLE1BQUwsQ0FBWSxjQUFaLENBQWYsRUFBNEM7QUFDNUMsNkJBQUssTUFBTCxDQUFZLGNBQVosR0FBNkIsRUFBN0IsQ0FENEM7cUJBQWhEO0FBR0EseUJBQUssa0JBQUwsR0FsQk87O0FBb0JQLHdCQUFJLENBQUMsS0FBSyxNQUFMLENBQVksT0FBWixFQUFxQjtBQUN0Qiw2QkFBSyxTQUFMLENBQWUsS0FBSyxPQUFMLENBQWEsQ0FBYixDQUFmLEVBRHNCO3FCQUExQixNQUVPOzs7Ozs7QUFDSCxrREFBZ0IsS0FBSyxPQUFMLDJCQUFoQix3R0FBOEI7b0NBQXJCLG1CQUFxQjs7QUFDMUIsb0NBQUksS0FBSyxNQUFMLENBQVksT0FBWixLQUF3QixJQUFJLEtBQUosRUFBVztBQUNuQyx5Q0FBSyxTQUFMLENBQWUsR0FBZixFQURtQztBQUVuQywwQ0FGbUM7aUNBQXZDOzZCQURKOzs7Ozs7Ozs7Ozs7Ozt5QkFERztxQkFGUDs7QUFXQSx3QkFBSSxLQUFLLE1BQUwsQ0FBWSxRQUFaLEtBQXlCLElBQXpCLEVBQStCO0FBQy9CLDRCQUFJLENBQUMsTUFBTSxPQUFOLENBQWMsS0FBSyxTQUFMLENBQWYsRUFBZ0M7QUFDaEMsaUNBQUssVUFBTCxDQUFnQixZQUFoQixDQUE2QixhQUE3QixFQURnQztBQUVoQyx1Q0FBVyxZQUFYLENBQXdCLGdCQUF4QixHQUEyQyxJQUEzQyxDQUFnRCxVQUFDLEdBQUQsRUFBUztBQUNyRCxvQ0FBSSxZQUFZLElBQUksSUFBSixDQUFTLE1BQVQsSUFBbUIsRUFBbkI7O0FBRHFDOzs7OztBQUdyRCwwREFBa0Isb0NBQWxCLHdHQUE2Qjs0Q0FBcEIscUJBQW9COztBQUN6Qiw0Q0FBSSxPQUFPLEVBQVAsQ0FEcUI7QUFFekIsNENBQUksTUFBTSxXQUFOLEVBQW1COzs7Ozs7QUFDbkIsc0VBQWdCLE1BQU0sV0FBTiwyQkFBaEIsd0dBQW1DO3dEQUExQixvQkFBMEI7O0FBQy9CLHlEQUFLLElBQUwsQ0FBVTtBQUNOLDZEQUFLLEtBQUksR0FBSjtBQUNMLCtEQUFPLEtBQUksS0FBSjtBQUNQLHFFQUFhLEtBQUksV0FBSjtxREFIakIsRUFEK0I7aURBQW5DOzs7Ozs7Ozs7Ozs7Ozs2Q0FEbUI7eUNBQXZCO0FBU0EsOENBQU0sV0FBTixHQUFvQixJQUFwQixDQVh5QjtxQ0FBN0I7Ozs7Ozs7Ozs7Ozs7O2lDQUhxRDs7QUFnQnJELHVDQUFLLFNBQUwsR0FBaUIsU0FBakI7O0FBaEJxRCxzQ0FrQnJELENBQUssc0JBQUwsR0FsQnFEOzZCQUFULENBQWhELENBbUJHLE9BbkJILENBbUJXLFlBQU07QUFDYix1Q0FBSyxVQUFMLENBQWdCLGFBQWhCLENBQThCLGFBQTlCLEVBRGE7NkJBQU4sQ0FuQlgsQ0FGZ0M7eUJBQXBDLE1Bd0JPO0FBQ0gsaUNBQUssc0JBQUwsR0FERzt5QkF4QlA7cUJBREo7Ozs7OENBOEJVOzs7QUFDTix5QkFBSyxVQUFMLENBQWdCLFlBQWhCLENBQTZCLFNBQTdCLEVBRE07QUFFTiwyQkFBTyxZQUFZLE9BQVosR0FBc0IsSUFBdEIsQ0FBMkIsVUFBQyxHQUFELEVBQVM7QUFDdkMsK0JBQUssY0FBTCxDQUFvQixJQUFwQixDQUF5QixJQUFJLElBQUosQ0FBUyxNQUFULENBQXpCLENBRHVDO0FBRXZDLCtCQUFLLGFBQUwsR0FGdUM7cUJBQVQsQ0FBM0IsQ0FHSixPQUhJLENBR0ksWUFBTTtBQUNiLCtCQUFLLFVBQUwsQ0FBZ0IsYUFBaEIsQ0FBOEIsU0FBOUIsRUFEYTtxQkFBTixDQUhYLENBRk07Ozs7Ozs0Q0FVRixXQUFXO0FBQ25CLHdCQUFJLE1BQU0sUUFBTixDQUFlLFNBQWYsQ0FBSixFQUErQjtBQUMzQiw2QkFBSyxNQUFMLENBQVksY0FBWixHQUE2QixVQUFVLGNBQVYsQ0FERjtBQUUzQiw2QkFBSyxNQUFMLENBQVksZ0JBQVosR0FBK0IsVUFBVSxnQkFBVixDQUZKO0FBRzNCLDZCQUFLLE1BQUwsQ0FBWSxlQUFaLEdBQThCLFVBQVUsZUFBVixDQUhIO0FBSTNCLDZCQUFLLE1BQUwsQ0FBWSxlQUFaLEdBQThCLFVBQVUsZUFBVixDQUpIO3FCQUEvQjs7OzttREFPZTs7O0FBQ2YseUJBQUssVUFBTCxDQUFnQixZQUFoQixDQUE2QixhQUE3QixFQURlO0FBRWYsa0NBQWMsV0FBZCxDQUEwQixLQUFLLE1BQUwsQ0FBWSxRQUFaLENBQTFCLENBQWdELElBQWhELENBQXFELFVBQUMsR0FBRCxFQUFTO0FBQzFELCtCQUFLLFdBQUwsR0FBbUIsSUFBSSxJQUFKLENBQVMsTUFBVCxJQUFtQixFQUFuQixDQUR1QztxQkFBVCxDQUFyRCxDQUVHLE9BRkgsQ0FFVyxZQUFNO0FBQ2IsK0JBQUssVUFBTCxDQUFnQixhQUFoQixDQUE4QixhQUE5QixFQURhO3FCQUFOLENBRlgsQ0FGZTs7Ozs4Q0FRTCxPQUFPOzs7QUFDYix3QkFBSSxrQkFBSjt3QkFDSSxjQUFjLEtBQUssY0FBTCxDQUFvQixXQUFwQixDQUZMO0FBR2Isd0JBQUksWUFBWSxNQUFaLEtBQXVCLENBQXZCLEVBQTBCO0FBQzFCLCtCQUQwQjtxQkFBOUI7O0FBSGEsd0JBT1QsT0FBTyxLQUFQLEtBQWlCLFdBQWpCLEVBQThCO0FBQzlCLDZCQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxZQUFZLE1BQVosRUFBb0IsSUFBSSxDQUFKLEVBQU8sR0FBL0MsRUFBb0Q7QUFDaEQsZ0NBQUksWUFBWSxDQUFaLEVBQWUsRUFBZixLQUFzQixLQUFLLE1BQUwsQ0FBWSxTQUFaLEVBQXVCO0FBQzdDLHdDQUFRLENBQVIsQ0FENkM7QUFFN0Msc0NBRjZDOzZCQUFqRDt5QkFESjs7QUFEOEIsNEJBUTFCLE9BQU8sS0FBUCxLQUFpQixXQUFqQixFQUE4QjtBQUM5QixvQ0FBUSxDQUFSLENBRDhCO3lCQUFsQztxQkFSSjs7QUFhQSx5QkFBSyxjQUFMLENBQW9CLGFBQXBCLENBQWtDLEtBQWxDLEVBcEJhO0FBcUJiLHlCQUFLLFNBQUwsR0FBaUIsWUFBWSxLQUFaLEVBQW1CLFNBQW5CLENBckJKO0FBc0JiLGdDQUFZLEtBQUssY0FBTCxDQUFvQixPQUFwQixDQUE0QixFQUE1Qjs7QUF0QkMsd0JBd0JULEtBQUssU0FBTCxLQUFtQixDQUFuQixFQUFzQjtBQUN0Qiw2QkFBSyxNQUFMLENBQVksUUFBWixHQUF1QjtBQUNuQiwyQ0FBZSxDQUFDO0FBQ1oseUNBQVMsRUFBVDtBQUNBLDZDQUFhLEtBQWI7QUFDQSw0Q0FBWSxLQUFaOzZCQUhXLENBQWY7eUJBREosQ0FEc0I7cUJBQTFCOztBQVVBLHlCQUFLLFVBQUwsQ0FBZ0IsWUFBaEIsQ0FBNkIsVUFBN0IsRUFsQ2E7O0FBb0NiLGdDQUFZLFdBQVosQ0FBd0IsU0FBeEIsRUFBbUMsSUFBbkMsQ0FBd0MsVUFBQyxHQUFELEVBQVM7QUFDN0MsNEJBQUksV0FBVyxJQUFJLElBQUosQ0FBUyxNQUFULElBQW1CLEVBQW5CLENBRDhCO0FBRTdDLCtCQUFLLGNBQUwsR0FBc0IsUUFBUSxJQUFSLENBQWEsUUFBYixDQUF0QixDQUY2QztBQUc3Qyw2QkFBSyxJQUFJLEtBQUksQ0FBSixFQUFPLEtBQUksT0FBSyxjQUFMLENBQW9CLE1BQXBCLEVBQTRCLElBQWhELEVBQXFEO0FBQ2pELGdDQUFJLE9BQU8sT0FBSyxjQUFMLENBQW9CLEVBQXBCLENBQVAsQ0FENkM7QUFFakQsZ0NBQUksS0FBSyxNQUFMLElBQWUsT0FBZixFQUF3QjtBQUN4QixvQ0FBSSxNQUFNLE9BQUssTUFBTCxDQUFZLGlCQUFaLENBQThCLENBQTlCLEVBQWlDLFdBQWpDLENBRGM7Ozs7OztBQUV4QiwwREFBZSw4QkFBZix3R0FBb0I7NENBQVgsa0JBQVc7O0FBQ2hCLDRDQUFJLE9BQU8sS0FBSyxFQUFMLEVBQVM7QUFDaEIsaURBQUssVUFBTCxHQUFrQixJQUFsQixDQURnQjtBQUVoQixrREFGZ0I7eUNBQXBCO3FDQURKOzs7Ozs7Ozs7Ozs7OztpQ0FGd0I7O0FBUXhCLG9DQUFJLEtBQUssVUFBTCxLQUFvQixLQUFLLENBQUwsRUFBUTtBQUM1Qix5Q0FBSyxVQUFMLEdBQWtCLEtBQWxCLENBRDRCO2lDQUFoQzs2QkFSSixNQVdPO0FBQ0gsdUNBQUssY0FBTCxDQUFvQixNQUFwQixDQUEyQixFQUEzQixFQUE4QixDQUE5QixFQURHO0FBRUgscUNBRkc7NkJBWFA7eUJBRko7O0FBSDZDLDhCQXNCN0MsQ0FBSyxXQUFMLENBQWlCLElBQWpCLENBQXNCLFFBQXRCLEVBQWdDLE9BQUssTUFBTCxDQUFZLFFBQVosQ0FBaEMsQ0F0QjZDO0FBdUI3QywrQkFBSyxrQkFBTCxHQXZCNkM7QUF3QjdDLCtCQUFLLFdBQUwsQ0FBaUIsU0FBakIsQ0FBMkIsT0FBSyxNQUFMLENBQVksT0FBWixDQUEzQjs7QUF4QjZDLDRCQTBCekMsT0FBSyxNQUFMLENBQVksUUFBWixJQUF3QixPQUFLLE1BQUwsQ0FBWSxRQUFaLElBQXdCLE9BQUssV0FBTCxDQUFpQixRQUFqQixFQUEyQjtBQUMzRSxpQ0FBSyxJQUFJLE1BQUksQ0FBSixFQUFPLEtBQUksT0FBSyxXQUFMLENBQWlCLFFBQWpCLENBQTBCLE1BQTFCLEVBQWtDLE1BQUksRUFBSixJQUFTLE1BQUksT0FBSyxNQUFMLENBQVksUUFBWixFQUFzQixLQUF6RixFQUE4RjtBQUMxRix1Q0FBSyxXQUFMLENBQWlCLFFBQWpCLENBQTBCLEdBQTFCLEVBQTZCLFVBQTdCLEdBQTBDLElBQTFDLENBRDBGO0FBRTFGLHVDQUFLLFdBQUwsQ0FBaUIsZUFBakIsQ0FBaUMsT0FBSyxXQUFMLENBQWlCLFFBQWpCLENBQTBCLEdBQTFCLENBQWpDLEVBRjBGOzZCQUE5Rjt5QkFESjtxQkExQm9DLEVBZ0NyQyxZQUFNO0FBQ0wsK0JBQUssV0FBTCxDQUFpQixJQUFqQixHQURLO3FCQUFOLENBaENILENBa0NHLE9BbENILENBa0NXLFlBQU07QUFDYiwrQkFBSyxVQUFMLENBQWdCLGFBQWhCLENBQThCLFVBQTlCLEVBRGE7cUJBQU4sQ0FsQ1gsQ0FwQ2E7O0FBMEViLHdCQUFJLEtBQUssTUFBTCxDQUFZLFFBQVosS0FBeUIsS0FBSyxDQUFMLEVBQVE7QUFDakMsNkJBQUssVUFBTCxDQUFnQixZQUFoQixDQUE2QixXQUE3QixFQURpQztBQUVqQyxvQ0FBWSxZQUFaLENBQXlCLFNBQXpCLEVBQW9DLElBQXBDLENBQXlDLFVBQUMsR0FBRCxFQUFTO0FBQzlDLG1DQUFLLGFBQUwsR0FBcUIsSUFBSSxJQUFKLENBQVMsTUFBVCxJQUFtQixFQUFuQixDQUR5QjtBQUU5QyxtQ0FBSyxjQUFMLEdBQXNCLEtBQXRCLENBRjhDO0FBRzlDLG1DQUFLLE1BQUwsQ0FBWSxTQUFaLEdBQXdCLE9BQUssYUFBTCxDQUFtQixDQUFuQixFQUFzQixJQUF0QixJQUE4QixJQUE5QixDQUhzQjtBQUk5QyxpQ0FBSyxJQUFJLE1BQUksQ0FBSixFQUFPLE1BQUksT0FBSyxhQUFMLENBQW1CLE1BQW5CLEVBQTJCLE1BQUksR0FBSixFQUFPLEtBQXRELEVBQTJEO0FBQ3ZELG9DQUFJLE9BQUssYUFBTCxDQUFtQixHQUFuQixFQUFzQixJQUF0QixJQUE4QixTQUE5QixFQUF5QztBQUN6QywyQ0FBSyxNQUFMLENBQVksU0FBWixHQUF3QixPQUFLLGFBQUwsQ0FBbUIsR0FBbkIsRUFBc0IsSUFBdEIsQ0FEaUI7QUFFekMsMENBRnlDO2lDQUE3Qzs2QkFESjt5QkFKcUMsRUFVdEMsWUFBTTtBQUNMLG1DQUFLLGNBQUwsR0FBc0IsS0FBdEIsQ0FESztBQUVMLG1DQUFLLGFBQUwsR0FBcUIsRUFBckIsQ0FGSztBQUdMLG1DQUFLLE1BQUwsQ0FBWSxTQUFaLEdBQXdCLElBQXhCLENBSEs7eUJBQU4sQ0FWSCxDQWNHLE9BZEgsQ0FjVyxZQUFNO0FBQ2IsbUNBQUssVUFBTCxDQUFnQixhQUFoQixDQUE4QixXQUE5QixFQURhO3lCQUFOLENBZFgsQ0FGaUM7cUJBQXJDOzs7Ozs7cURBc0JhO0FBQ2pCLHlCQUFLLFdBQUwsQ0FBaUIsY0FBakIsR0FEaUI7QUFFakIsd0JBQUksQ0FBQyxLQUFLLE1BQUwsQ0FBWSxjQUFaLEVBQTRCO0FBQzdCLCtCQUQ2QjtxQkFBakM7QUFHQSx3QkFBSSxpQkFBaUIsS0FBSyxNQUFMLENBQVksY0FBWixDQUxKOzs7Ozs7QUFNakIsOENBQTBCLHlDQUExQix3R0FBMEM7Z0NBQWpDLDZCQUFpQzs7QUFDdEMsZ0NBQUksWUFBWSxjQUFjLElBQWQsQ0FEc0I7QUFFdEMsZ0NBQUksYUFBYSx3QkFBYixJQUF5QyxhQUFhLFNBQWIsSUFBMEIsYUFBYSxTQUFiLEVBQXdCO0FBQzNGLHFDQUFLLFdBQUwsQ0FBaUIsV0FBakIsQ0FBNkIsU0FBN0IsRUFBd0MsSUFBeEMsRUFEMkY7NkJBQS9GO3lCQUZKOzs7Ozs7Ozs7Ozs7OztxQkFOaUI7Ozs7MkNBYVY7QUFDSCx3QkFBSSxLQUFLLFNBQUwsS0FBbUIsU0FBbkIsRUFBOEI7Ozs7OztBQUM5QixrREFBaUIsS0FBSyxjQUFMLDJCQUFqQix3R0FBc0M7b0NBQTdCLG9CQUE2Qjs7QUFDbEMsb0NBQUksS0FBSyxVQUFMLEVBQWlCO0FBQ2pCLHlDQUFLLEtBQUwsQ0FBVyxHQUFYLEdBQWlCLElBQWpCLENBRGlCO0FBRWpCLDJDQUZpQjtpQ0FBckI7NkJBREo7Ozs7Ozs7Ozs7Ozs7O3lCQUQ4Qjs7QUFPOUIsNkJBQUssS0FBTCxDQUFXLEdBQVgsR0FBaUIsS0FBakIsQ0FQOEI7cUJBQWxDLE1BUU87QUFDSCw2QkFBSyxLQUFMLENBQVcsR0FBWCxHQUFpQixJQUFqQixDQURHO3FCQVJQOzs7Ozs7OENBYU0sV0FBVzs7O0FBQ2pCLGtDQUFjLGdCQUFkLENBQStCLEtBQUssTUFBTCxDQUFZLFFBQVosRUFBc0IsU0FBckQsRUFBZ0UsSUFBaEUsQ0FBcUUsVUFBQyxHQUFELEVBQVM7QUFDMUUsNEJBQUksTUFBTSxRQUFOLENBQWUsSUFBSSxJQUFKLENBQVMsTUFBVCxDQUFuQixFQUFxQztBQUNqQyw4QkFBRSxNQUFGLENBQVMsT0FBSyxNQUFMLEVBQWEsSUFBSSxJQUFKLENBQVMsTUFBVCxDQUF0QixDQURpQztBQUVqQyxtQ0FBSyxRQUFMLEdBRmlDO3lCQUFyQztxQkFEaUUsQ0FBckUsQ0FEaUI7Ozs7Ozt5REFTQTs7O0FBQ3JCLHdCQUFJLGtCQUFrQixLQUFLLE1BQUwsQ0FBWSxlQUFaLENBREQ7O0FBR3JCLHdCQUFNLFNBQVMsU0FBVCxNQUFTLENBQUMsY0FBRCxFQUFvQjtBQUMvQiwrQkFBSyxVQUFMLENBQWdCLFlBQWhCLENBQTZCLEtBQTdCLEVBRCtCO0FBRS9CLG1DQUFXLFlBQVgsQ0FBd0IsWUFBeEIsQ0FBcUMsZUFBZSxLQUFmLEVBQXNCLGVBQWUsUUFBZixDQUEzRCxDQUFvRixJQUFwRixDQUF5RixVQUFDLEdBQUQsRUFBUztBQUM5RiwyQ0FBZSxPQUFmLEdBQXlCLElBQUksSUFBSixDQUFTLE1BQVQsSUFBbUIsRUFBbkIsQ0FEcUU7eUJBQVQsQ0FBekYsQ0FFRyxPQUZILENBRVcsWUFBTTtBQUNiLG1DQUFLLFVBQUwsQ0FBZ0IsYUFBaEIsQ0FBOEIsS0FBOUIsRUFEYTt5QkFBTixDQUZYLENBRitCO3FCQUFwQixDQUhNO0FBV3JCLHlCQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxnQkFBZ0IsTUFBaEIsRUFBd0IsSUFBSSxDQUFKLEVBQU8sR0FBbkQsRUFBd0Q7QUFDcEQsd0NBQWdCLENBQWhCLEVBQW1CLE1BQW5CLEdBQTRCLEVBQTVCLENBRG9EO0FBRXBELHdDQUFnQixDQUFoQixFQUFtQixNQUFuQixHQUE0QixFQUE1Qjs7QUFGb0QsOEJBSXBELENBQU8sZ0JBQWdCLENBQWhCLENBQVAsRUFKb0Q7QUFLcEQsNEJBQUksU0FBUyxFQUFUOztBQUxnRCw2QkFPL0MsSUFBSSxJQUFJLENBQUosRUFBTyxLQUFLLEtBQUssU0FBTCxDQUFlLE1BQWYsRUFBdUIsSUFBSSxFQUFKLEVBQVEsR0FBcEQsRUFBeUQ7QUFDckQsZ0NBQUksS0FBSyxTQUFMLENBQWUsQ0FBZixFQUFrQixTQUFsQixLQUFnQyxnQkFBZ0IsQ0FBaEIsRUFBbUIsS0FBbkIsRUFBMEI7QUFDMUQseUNBQVMsS0FBSyxTQUFMLENBQWUsQ0FBZixFQUFrQixXQUFsQixDQURpRDtBQUUxRCxzQ0FGMEQ7NkJBQTlEO3lCQURKOztBQVBvRCw0QkFjaEQsZ0JBQWdCLENBQWhCLEVBQW1CLElBQW5CLEVBQXlCO0FBQ3pCLGlDQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sS0FBSyxnQkFBZ0IsQ0FBaEIsRUFBbUIsSUFBbkIsQ0FBd0IsTUFBeEIsRUFBZ0MsSUFBSSxFQUFKLEVBQVEsR0FBN0QsRUFBa0U7QUFDOUQsb0NBQUksV0FBVyxLQUFYLENBRDBEO0FBRTlELHFDQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sS0FBSyxPQUFPLE1BQVAsRUFBZSxJQUFJLEVBQUosRUFBUSxHQUE1QyxFQUFpRDtBQUM3Qyx3Q0FBSSxPQUFPLENBQVAsRUFBVSxHQUFWLEtBQWtCLGdCQUFnQixDQUFoQixFQUFtQixJQUFuQixDQUF3QixDQUF4QixFQUEyQixHQUEzQixFQUFnQztBQUNsRCxtREFBVyxJQUFYLENBRGtEO0FBRWxELDhDQUZrRDtxQ0FBdEQ7aUNBREo7QUFNQSxvQ0FBSSxRQUFKLEVBQWM7QUFDVixvREFBZ0IsQ0FBaEIsRUFBbUIsTUFBbkIsQ0FBMEIsSUFBMUIsQ0FBK0IsZ0JBQWdCLENBQWhCLEVBQW1CLElBQW5CLENBQXdCLENBQXhCLENBQS9CLEVBRFU7aUNBQWQsTUFFTztBQUNILG9EQUFnQixDQUFoQixFQUFtQixNQUFuQixDQUEwQixJQUExQixDQUErQixnQkFBZ0IsQ0FBaEIsRUFBbUIsSUFBbkIsQ0FBd0IsQ0FBeEIsQ0FBL0IsRUFERztpQ0FGUDs2QkFSSjt5QkFESixNQWVPO0FBQ0gsNENBQWdCLENBQWhCLEVBQW1CLE1BQW5CLEdBQTRCLFFBQVEsSUFBUixDQUFhLE1BQWIsQ0FBNUIsQ0FERzt5QkFmUDtxQkFkSjs7OztnREFrQ1ksV0FBVztBQUN2Qix5QkFBSyxNQUFMLENBQVksU0FBWixHQUF3QixTQUF4QixDQUR1Qjs7Ozt1REFHSjtBQUNuQix5QkFBSyxjQUFMLEdBQXNCLENBQUMsS0FBSyxjQUFMLENBREo7QUFFbkIseUJBQUssTUFBTCxDQUFZLFNBQVosR0FBd0IsSUFBeEIsQ0FGbUI7Ozs7MENBSWIsS0FBSztBQUNYLHlCQUFLLE1BQUwsQ0FBWSxPQUFaLEdBQXNCLElBQUksS0FBSixDQURYO0FBRVgseUJBQUssT0FBTCxHQUFlLElBQUksSUFBSixDQUZKO0FBR1gseUJBQUssV0FBTCxDQUFpQixTQUFqQixDQUEyQixJQUFJLEtBQUosQ0FBM0IsQ0FIVzs7Ozs4Q0FLRCxNQUFNO0FBQ2hCLHlCQUFLLE9BQUwsR0FBZSxJQUFmLENBRGdCOzs7OytDQUdMLE9BQU8sS0FBSztBQUNuQix5QkFBSyxNQUFMLENBQVksZUFBWixDQUE0QixLQUE1QixFQUFtQyxHQUFuQyxHQUF5QyxHQUF6QyxDQURtQjs7Ozs7O3lDQUlsQixPQUFPOzs7QUFDUix5QkFBSyxVQUFMLENBQWdCLFlBQWhCLENBQTZCLFVBQTdCLEVBRFE7QUFFUiwrQkFBVyxZQUFYLENBQXdCLFlBQXhCLENBQXFDLE1BQU0sU0FBTixFQUFpQixNQUFNLFFBQU4sQ0FBdEQsQ0FBc0UsSUFBdEUsQ0FBMkUsVUFBQyxHQUFELEVBQVM7QUFDaEYsNEJBQUksT0FBTyxJQUFJLElBQUosQ0FBUyxNQUFULENBRHFFO0FBRWhGLCtCQUFLLE1BQUwsQ0FBWSxlQUFaLENBQTRCLElBQTVCLENBQWlDO0FBQzdCLG1DQUFPLE1BQU0sU0FBTjtBQUNQLHNDQUFVLE1BQU0sUUFBTjtBQUNWLGlDQUFLLEdBQUw7QUFDQSxpQ0FBSyxJQUFMO0FBQ0EsaUNBQUssUUFBUSxLQUFLLENBQUwsQ0FBUixHQUFrQixLQUFLLENBQUwsRUFBUSxHQUFSLEdBQWMsS0FBSyxDQUFMO0FBQ3JDLHFDQUFTLFFBQVEsRUFBUjtBQUNULG9DQUFRLE1BQU0sV0FBTixJQUFxQixFQUFyQjtBQUNSLG9DQUFRLEVBQVI7QUFDQSwyQ0FBZTtBQUNYLHNDQUFNLE1BQU47NkJBREo7eUJBVEosRUFGZ0Y7cUJBQVQsQ0FBM0UsQ0FlRyxPQWZILENBZVcsWUFBTTtBQUNiLCtCQUFLLFVBQUwsQ0FBZ0IsYUFBaEIsQ0FBOEIsVUFBOUIsRUFEYTtxQkFBTixDQWZYLENBRlE7Ozs7OztnREFzQkE7OztBQUNaLHdCQUFJLGdCQUFnQixPQUFPLElBQVAsQ0FBWTtBQUM1QixtQ0FBVyxJQUFYO0FBQ0EscUNBQWEsdURBQWI7QUFDQSxvQ0FBWSxvQkFBWjtBQUNBLDhCQUFNLElBQU47cUJBSmdCLENBQWhCLENBRFE7QUFPWixrQ0FBYyxNQUFkLENBQXFCLElBQXJCLENBQTBCLFVBQUMsU0FBRCxFQUFlO0FBQ3JDLCtCQUFLLE1BQUwsQ0FBWSxlQUFaLENBQTRCLElBQTVCLENBQWlDO0FBQzdCLG1DQUFPLFVBQVUsSUFBVjtBQUNQLHNDQUFVLFVBQVUsUUFBVjtBQUNWLGlDQUFLLEdBQUw7QUFDQSxpQ0FBSyxJQUFMO0FBQ0EsaUNBQUssVUFBVSxHQUFWO0FBQ0wscUNBQVMsQ0FBQztBQUNOLHFDQUFLLFVBQVUsR0FBVjs2QkFEQSxDQUFUO0FBR0Esb0NBQVEsRUFBUjtBQUNBLG9DQUFRLEVBQVI7eUJBVkosRUFEcUM7cUJBQWYsQ0FBMUIsQ0FQWTs7Ozs0Q0FzQkosT0FBTztBQUNmLHlCQUFLLE1BQUwsQ0FBWSxlQUFaLENBQTRCLE1BQTVCLENBQW1DLEtBQW5DLEVBQTBDLENBQTFDLEVBRGU7Ozs7NENBR1AsT0FBTztBQUNmLHlCQUFLLE1BQUwsQ0FBWSxlQUFaLENBQTRCLEtBQTVCLEVBQW1DLE1BQW5DLENBQTBDLElBQTFDLENBQStDO0FBQzNDLDZCQUFLLEVBQUw7QUFDQSwrQkFBTyxFQUFQO0FBQ0EscUNBQWEsRUFBYjtxQkFISixFQURlOzs7OytDQU9KLHFCQUFxQixPQUFPO0FBQ3ZDLHlCQUFLLE1BQUwsQ0FBWSxlQUFaLENBQTRCLG1CQUE1QixFQUFpRCxNQUFqRCxDQUF3RCxNQUF4RCxDQUErRCxLQUEvRCxFQUFzRSxDQUF0RSxFQUR1Qzs7OztpREFHMUI7QUFDYix5QkFBSyxNQUFMLENBQVksaUJBQVosQ0FBOEIsSUFBOUIsQ0FBbUM7QUFDL0IsOEJBQU0sRUFBTjtBQUNBLG9DQUFZLEVBQVo7QUFDQSxxQ0FBYSxDQUFDO0FBQ1YsZ0NBQUksRUFBSjt5QkFEUyxDQUFiO3FCQUhKLEVBRGE7Ozs7a0RBU0M7QUFDZCx5QkFBSyxNQUFMLENBQVksa0JBQVosQ0FBK0IsSUFBL0IsQ0FBb0M7QUFDaEMsOEJBQU0sRUFBTjtBQUNBLG9DQUFZLEVBQVo7cUJBRkosRUFEYzs7OzsrQ0FNSCxPQUFPO0FBQ2xCLHlCQUFLLE1BQUwsQ0FBWSxpQkFBWixDQUE4QixLQUE5QixFQUFxQyxXQUFyQyxDQUFpRCxJQUFqRCxDQUFzRDtBQUNsRCw0QkFBSSxFQUFKO3FCQURKLEVBRGtCOzs7O2tEQUtKLHVCQUF1QixPQUFPO0FBQzVDLHlCQUFLLE1BQUwsQ0FBWSxpQkFBWixDQUE4QixxQkFBOUIsRUFBcUQsV0FBckQsQ0FBaUUsTUFBakUsQ0FBd0UsS0FBeEUsRUFBK0UsQ0FBL0UsRUFENEM7Ozs7OENBR2xDO0FBQ1YseUJBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsYUFBckIsQ0FBbUMsSUFBbkMsQ0FBd0M7QUFDcEMsaUNBQVMsRUFBVDtBQUNBLHFDQUFhLEtBQWI7QUFDQSxvQ0FBWSxLQUFaO3FCQUhKLEVBRFU7Ozs7K0NBT0MsT0FBTztBQUNsQix5QkFBSyxNQUFMLENBQVksUUFBWixDQUFxQixhQUFyQixDQUFtQyxNQUFuQyxDQUEwQyxLQUExQyxFQUFpRCxDQUFqRCxFQURrQjs7Ozs4Q0FHUixNQUFNLE9BQU87QUFDdkIseUJBQUssTUFBTCxDQUFZLElBQVosRUFBa0IsTUFBbEIsQ0FBeUIsS0FBekIsRUFBZ0MsQ0FBaEMsRUFEdUI7Ozs7dURBR0o7QUFDbkIsd0JBQUksS0FBSyxNQUFMLENBQVksV0FBWixJQUEyQixNQUEzQixFQUFtQzs7Ozs7O0FBQ25DLGtEQUEyQixLQUFLLE1BQUwsQ0FBWSxlQUFaLDJCQUEzQix3R0FBd0Q7b0NBQS9DLDhCQUErQzs7QUFDcEQsK0NBQWUsYUFBZixHQUErQjtBQUMzQiwwQ0FBTSxNQUFOO2lDQURKLENBRG9EOzZCQUF4RDs7Ozs7Ozs7Ozs7Ozs7eUJBRG1DO3FCQUF2Qzs7OztvREFRZ0I7QUFDaEIsd0JBQUksS0FBSyxNQUFMLENBQVksV0FBWixJQUEyQixNQUEzQixFQUFtQzs7Ozs7O0FBQ25DLG1EQUE2QixLQUFLLE1BQUwsQ0FBWSxpQkFBWiw0QkFBN0IsNEdBQTREO29DQUFuRCxpQ0FBbUQ7O0FBQ3hELGlEQUFpQixJQUFqQixHQUF3QixpQkFBaUIsVUFBakIsQ0FEZ0M7NkJBQTVEOzs7Ozs7Ozs7Ozs7Ozt5QkFEbUM7cUJBQXZDOzs7O2lEQU1hLE9BQU87QUFDaEIseUJBQUssTUFBTCxDQUFZLGlCQUFaLENBQThCLEtBQTlCLEVBQXFDLElBQXJDLEdBQTRDLEtBQUssTUFBTCxDQUFZLGlCQUFaLENBQThCLEtBQTlCLEVBQXFDLFVBQXJDLENBRDVCOzs7Ozs7aURBSVA7OztBQUNiLHdCQUFJLGVBQWUsUUFBUSxJQUFSLENBQWEsS0FBSyxNQUFMLENBQTVCLENBRFM7O0FBR2Isd0JBQUksYUFBYSxXQUFiLElBQTRCLE1BQTVCLEVBQW9DO0FBQ3BDLHFDQUFhLGlCQUFiLEdBQWlDLEVBQWpDLENBRG9DO0FBRXBDLHFDQUFhLFVBQWIsR0FBMEIsS0FBMUIsQ0FGb0M7QUFHcEMscUNBQWEsa0JBQWIsR0FBa0MsRUFBbEMsQ0FIb0M7QUFJcEMsNEJBQUksS0FBSyxTQUFMLElBQWtCLFVBQWxCLEVBQThCO0FBQzlCLHlDQUFhLGFBQWIsR0FBNkIsQ0FBN0IsQ0FEOEI7eUJBQWxDO3FCQUpKLE1BT087QUFDSCxxQ0FBYSxhQUFiLEdBQTZCLENBQTdCLENBREc7QUFFSCw0QkFBSSxLQUFLLFNBQUwsSUFBa0IsVUFBbEIsRUFBOEI7QUFDOUIseUNBQWEsVUFBYixHQUEwQixLQUExQixDQUQ4QjtBQUU5Qix5Q0FBYSxpQkFBYixHQUFpQyxFQUFqQyxDQUY4QjtBQUc5Qix5Q0FBYSxrQkFBYixHQUFrQyxFQUFsQyxDQUg4Qjt5QkFBbEMsTUFJTyxJQUFJLEtBQUssU0FBTCxJQUFrQixVQUFsQixFQUE4QjtBQUNyQyx5Q0FBYSxVQUFiLEdBQTBCLGFBQTFCLENBRHFDO0FBRXJDLHlDQUFhLGtCQUFiLENBQWdDLENBQWhDLEVBQW1DLFVBQW5DLEdBQWdELGFBQWEsa0JBQWIsQ0FBZ0MsQ0FBaEMsRUFBbUMsSUFBbkMsQ0FGWDtBQUdyQyx5Q0FBYSxpQkFBYixHQUFpQyxFQUFqQyxDQUhxQzt5QkFBbEMsTUFJQTtBQUNILHlDQUFhLFVBQWIsR0FBMEIsYUFBMUIsQ0FERztBQUVILHlDQUFhLGtCQUFiLEdBQWtDLEVBQWxDLENBRkc7eUJBSkE7cUJBYlg7O0FBdUJBLGlDQUFhLGlCQUFiLEdBQWlDLFlBQU87QUFDcEMsNEJBQUksTUFBTSxFQUFOOzRCQUNBLG9CQUFvQixFQUFwQixDQUZnQzs7Ozs7O0FBR3BDLG1EQUFpQixRQUFLLGNBQUwsNEJBQWpCLDRHQUFzQztvQ0FBN0IscUJBQTZCOztBQUNsQyxvQ0FBSSxLQUFLLFVBQUwsRUFBaUI7QUFDakIsd0NBQUksSUFBSixDQUFTLEtBQUssRUFBTCxDQUFULENBRGlCO2lDQUFyQjs2QkFESjs7Ozs7Ozs7Ozs7Ozs7eUJBSG9DOzs7Ozs7O0FBUXBDLG1EQUE2QixhQUFhLGlCQUFiLDRCQUE3Qiw0R0FBNkQ7b0NBQXBELGlDQUFvRDs7QUFDekQsb0NBQUksaUJBQWlCLElBQWpCLEVBQXVCO0FBQ3ZCLHFEQUFpQixXQUFqQixHQUErQixHQUEvQixDQUR1QjtBQUV2QixzREFBa0IsSUFBbEIsQ0FBdUIsZ0JBQXZCLEVBRnVCO2lDQUEzQjs2QkFESjs7Ozs7Ozs7Ozs7Ozs7eUJBUm9DOztBQWNwQywrQkFBTyxpQkFBUCxDQWRvQztxQkFBTixFQUFsQyxDQTFCYTs7QUE0Q2Isd0JBQUksQ0FBQyxhQUFhLFFBQWIsRUFBdUI7QUFDeEIscUNBQWEsY0FBYixHQUE4QixLQUFLLFdBQUwsQ0FBaUIsd0JBQWpCLEVBQTlCLENBRHdCO3FCQUE1QixNQUVPO0FBQ0gscUNBQWEsUUFBYixHQUF3QixLQUFLLFdBQUwsQ0FBaUIsZ0JBQWpCLEVBQXhCLENBREc7cUJBRlA7O0FBTUEsaUNBQWEsU0FBYixHQUF5QixLQUFLLGNBQUwsQ0FBb0IsT0FBcEIsQ0FBNEIsRUFBNUIsQ0FsRFo7O0FBb0RiLHdCQUFJLEtBQUssT0FBTCxDQUFhLEVBQWIsRUFBaUI7QUFDakIscUNBQWEsT0FBYixHQUF1QjtBQUNuQix1Q0FBVyxLQUFLLE9BQUwsQ0FBYSxFQUFiO0FBQ1gseUNBQWEsS0FBSyxPQUFMLENBQWEsSUFBYjtBQUNiLHlDQUFhLEtBQUssT0FBTCxDQUFhLElBQWI7eUJBSGpCLENBRGlCO3FCQUFyQjs7QUFTQSxpQ0FBYSxRQUFiLEdBQXdCLFlBQU87QUFDM0IsNEJBQUksZ0JBQWdCLEVBQWhCLENBRHVCOzs7Ozs7QUFFM0IsbURBQW9CLGFBQWEsUUFBYixDQUFzQixhQUF0Qiw0QkFBcEIsNEdBQXlEO29DQUFoRCx3QkFBZ0Q7O0FBQ3JELG9DQUFJLFFBQVEsT0FBUixLQUFvQixFQUFwQixFQUF3QjtBQUN4Qix3Q0FBSSxpQkFBaUI7QUFDakIsaURBQVMsUUFBUSxPQUFSO0FBQ1QscURBQWEsUUFBUSxXQUFSO0FBQ2Isb0RBQVksUUFBUSxVQUFSO3FDQUhaLENBRG9CO0FBTXhCLHdDQUFJLFFBQVEsV0FBUixFQUFxQjtBQUNyQix1REFBZSxRQUFmLEdBQTBCLFFBQVEsUUFBUixDQURMO0FBRXJCLHVEQUFlLFVBQWYsR0FBNEIsUUFBUSxVQUFSLENBRlA7cUNBQXpCO0FBSUEsd0NBQUksUUFBUSxVQUFSLEVBQW9CO0FBQ3BCLHVEQUFlLFVBQWYsR0FBNEIsUUFBUSxVQUFSLENBRFI7cUNBQXhCO0FBR0Esa0RBQWMsSUFBZCxDQUFtQixjQUFuQixFQWJ3QjtpQ0FBNUI7NkJBREo7Ozs7Ozs7Ozs7Ozs7O3lCQUYyQjs7QUFtQjNCLDRCQUFJLGNBQWMsTUFBZCxLQUF5QixDQUF6QixFQUE0QjtBQUM1QixtQ0FBTyxJQUFQLENBRDRCO3lCQUFoQyxNQUVPO0FBQ0gsbUNBQU87QUFDSCwrQ0FBZSxhQUFmOzZCQURKLENBREc7eUJBRlA7cUJBbkJxQixFQUF6QixDQTdEYTs7QUF5RmIsaUNBQWEsZUFBYixHQUErQixZQUFPO0FBQ2xDLDRCQUFJLGFBQWEsUUFBYixFQUF1QjtBQUN2QixtQ0FBTyxhQUFhLGVBQWIsQ0FEZ0I7eUJBQTNCOztBQUlBLDRCQUFJLENBQUMsYUFBYSxlQUFiLEVBQThCO0FBQy9CLG1DQUFPLEtBQUssQ0FBTCxDQUR3Qjt5QkFBbkM7O0FBSUEsNEJBQUksZ0JBQUo7NEJBQWEsa0JBQWtCLEVBQWxCOzRCQUNULHNCQURKLENBVGtDOzs7Ozs7O0FBWWxDLG1EQUEyQixhQUFhLGVBQWIsNEJBQTNCLDRHQUF5RDtvQ0FBaEQsK0JBQWdEOztBQUNyRCwwQ0FBVSxlQUFlLE1BQWYsQ0FEMkM7QUFFckQsb0NBQUksQ0FBQyxlQUFlLGFBQWYsRUFBOEI7QUFDL0IsbURBQWUsYUFBZixHQUErQjtBQUMzQiw4Q0FBTSxNQUFOO3FDQURKLENBRCtCO2lDQUFuQztBQUtBLGdEQUFnQjtBQUNaLDBDQUFNLGVBQWUsYUFBZixDQUE2QixJQUE3QjtpQ0FEVixDQVBxRDs7QUFXckQsb0NBQUksYUFBYSxXQUFiLElBQTRCLE1BQTVCLEVBQW9DO0FBQ3BDLHdDQUFJLGNBQWMsSUFBZCxJQUFzQixLQUF0QixJQUErQixjQUFjLElBQWQsSUFBc0IsTUFBdEIsRUFBOEI7QUFDN0Qsc0RBQWMsSUFBZCxHQUFxQixlQUFlLGFBQWYsQ0FBNkIsSUFBN0IsQ0FEd0M7QUFFN0Qsc0RBQWMsT0FBZCxHQUF3QixlQUFlLGFBQWYsQ0FBNkIsT0FBN0IsQ0FGcUM7QUFHN0Qsc0RBQWMsS0FBZCxHQUFzQixlQUFlLGFBQWYsQ0FBNkIsS0FBN0IsQ0FIdUM7cUNBQWpFO0FBS0Esd0NBQUksY0FBYyxJQUFkLElBQXNCLE1BQXRCLEVBQThCO0FBQzlCLHNEQUFjLEdBQWQsR0FBb0IsZUFBZSxhQUFmLENBQTZCLEdBQTdCLENBRFU7cUNBQWxDO2lDQU5KLE1BU087QUFDSCxrREFBYyxJQUFkLEdBQXFCLE1BQXJCLENBREc7aUNBVFA7O3VFQVhxRDs7Ozs7QUF3QnJELDJEQUFnQixlQUFlLE1BQWYsNEJBQWhCLDRHQUF1Qzs0Q0FBOUIsb0JBQThCOztBQUNuQyw0Q0FBSSxJQUFJLEdBQUosS0FBWSxFQUFaLEVBQWdCO0FBQ2hCLG9EQUFRLElBQVIsQ0FBYSxHQUFiLEVBRGdCO3lDQUFwQjtxQ0FESjs7Ozs7Ozs7Ozs7Ozs7aUNBeEJxRDs7QUE4QnJELGdEQUFnQixJQUFoQixDQUFxQjtBQUNqQiwyQ0FBTyxlQUFlLEtBQWY7QUFDUCw4Q0FBVSxlQUFlLFFBQWY7QUFDVix5Q0FBSyxlQUFlLEdBQWY7QUFDTCx5Q0FBSyxlQUFlLEdBQWY7QUFDTCx5Q0FBSyxlQUFlLEdBQWY7QUFDTCwwQ0FBTSxPQUFOO0FBQ0EsbURBQWUsYUFBZjtpQ0FQSixFQTlCcUQ7NkJBQXpEOzs7Ozs7Ozs7Ozs7Ozt5QkFaa0M7O0FBb0RsQywrQkFBTyxlQUFQLENBcERrQztxQkFBTixFQUFoQyxDQXpGYTs7QUFnSmIsMkJBQU8sWUFBUCxDQWhKYTs7OztnREFtSkQ7Ozs7QUFDUix3QkFBSSxXQUFXLEdBQUcsS0FBSCxFQUFYO3dCQUNBLFlBQVksS0FBSyxjQUFMLEVBQVo7d0JBQ0EsYUFBYTtBQUNULGtDQUFVLFVBQVUsUUFBVjtBQUNWLHlDQUFpQixVQUFVLGVBQVY7QUFDakIsa0NBQVUsVUFBVSxRQUFWO0FBQ1Ysd0NBQWdCLFVBQVUsY0FBVjtxQkFKcEIsQ0FISTtBQVNSLGtDQUFjLGFBQWQsQ0FBNEIsVUFBNUIsRUFBd0MsSUFBeEMsQ0FBNkMsVUFBQyxHQUFELEVBQVM7QUFDbEQsNEJBQUksUUFBSyxNQUFMLENBQVksZ0JBQVosSUFBZ0MsU0FBaEMsRUFBMkM7QUFDM0Msd0NBQVksVUFBWixDQUF1QixvQkFBdkIsRUFEMkM7QUFFM0MscUNBQVMsT0FBVCxDQUFpQixRQUFqQixFQUYyQzt5QkFBL0MsTUFHTztBQUNILHdDQUFZLFdBQVosQ0FBd0Isa0JBQXhCLEVBQTRDLElBQTVDLENBQWlELFlBQU07QUFDbkQsOENBQWMsWUFBZCxDQUEyQixRQUFLLE1BQUwsQ0FBWSxRQUFaLEVBQXNCLElBQUksSUFBSixDQUFTLE1BQVQsQ0FBakQsQ0FBa0UsSUFBbEUsQ0FBdUUsWUFBTTtBQUN6RSxnREFBWSxVQUFaLENBQXVCLFdBQXZCLEVBRHlFO0FBRXpFLDZDQUFTLE9BQVQsQ0FBaUIsUUFBakIsRUFGeUU7aUNBQU4sRUFHcEUsVUFBQyxHQUFELEVBQVM7QUFDUixnREFBWSxXQUFaLENBQXdCO0FBQ3BCLCtDQUFPLE9BQVA7QUFDQSw2Q0FBSyxJQUFJLElBQUosQ0FBUyxTQUFUO3FDQUZULEVBRFE7QUFLUiw2Q0FBUyxPQUFULENBQWlCLGNBQWpCLEVBTFE7aUNBQVQsQ0FISCxDQURtRDs2QkFBTixFQVc5QyxZQUFNO0FBQ0wseUNBQVMsT0FBVCxDQUFpQixTQUFqQixFQURLOzZCQUFOLENBWEgsQ0FERzt5QkFIUDtxQkFEeUMsRUFvQjFDLFVBQUMsR0FBRCxFQUFTO0FBQ1Isb0NBQVksV0FBWixDQUF3QjtBQUNwQixtQ0FBTyxTQUFQO0FBQ0EsaUNBQUssSUFBSSxJQUFKLENBQVMsU0FBVDt5QkFGVCxFQURRO0FBS1IsaUNBQVMsTUFBVCxDQUFnQixRQUFoQixFQUxRO3FCQUFULENBcEJILENBVFE7QUFvQ1IsMkJBQU8sU0FBUyxPQUFULENBcENDOzs7Ozs7dUNBdUNUO0FBQ0gsMkJBQU8sTUFBTSxJQUFOLENBQVcsc0NBQXNDLEtBQUssTUFBTCxDQUFZLFFBQVosQ0FBeEQsQ0FERzs7Ozt3Q0FHQztBQUNBLDJCQUFPLE1BQU0sSUFBTixDQUFXLHVDQUF1QyxLQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXpELENBREE7Ozs7Ozt3Q0FJQTs7O0FBQ0Esd0JBQUksV0FBVyxHQUFHLEtBQUgsRUFBWCxDQURKO0FBRUEsd0JBQUksZ0JBQWdCLE9BQU8sSUFBUCxDQUFZO0FBQzVCLG1DQUFXLElBQVg7QUFDQSxxQ0FBYSxpQkFBYjtBQUNBLG9DQUFZLGVBQVo7QUFDQSw4QkFBTSxJQUFOO0FBQ0EsaUNBQVM7QUFDTCx5Q0FBYTt1Q0FBTSxRQUFLLE1BQUwsQ0FBWSxlQUFaOzZCQUFOO3lCQURqQjtxQkFMZ0IsQ0FBaEIsQ0FGSjtBQVdBLGtDQUFjLE1BQWQsQ0FBcUIsSUFBckIsQ0FBMEIsVUFBQyxRQUFELEVBQWM7QUFDcEMsbUNBQVcsU0FBUyxRQUFULENBQVgsQ0FEb0M7QUFFcEMsNEJBQUksYUFBYSxRQUFLLE1BQUwsQ0FBWSxlQUFaLEVBQTZCO0FBQzFDLHdDQUFZLFdBQVosQ0FBd0IsVUFBeEIsRUFEMEM7QUFFMUMscUNBQVMsTUFBVCxHQUYwQztBQUcxQyxtQ0FIMEM7eUJBQTlDO0FBS0EsNEJBQUksTUFBTSxXQUFXLFFBQUssTUFBTCxDQUFZLGVBQVosR0FBOEIsMkJBQXpDLEdBQXVFLDZCQUF2RSxDQVAwQjtBQVFwQyw4QkFBTSxJQUFOLENBQVcsTUFBTSxZQUFOLEdBQXFCLFFBQUssTUFBTCxDQUFZLFFBQVosR0FBdUIsWUFBNUMsR0FBMkQsUUFBM0QsR0FBc0UsV0FBdEUsR0FBb0YsUUFBSyxNQUFMLENBQVksZUFBWixDQUE0QixDQUE1QixFQUErQixPQUEvQixDQUEvRixDQUF1SSxJQUF2SSxDQUE0SSxVQUFDLEdBQUQsRUFBUztBQUNqSix3Q0FBWSxVQUFaLENBQXVCLE9BQXZCLEVBRGlKO0FBRWpKLHFDQUFTLE9BQVQsQ0FBaUIsSUFBSSxJQUFKLENBQVMsTUFBVCxDQUFqQixDQUZpSjt5QkFBVCxFQUd6SSxZQUFZO0FBQ1gsd0NBQVksV0FBWixDQUF3QixPQUF4QixFQURXO0FBRVgscUNBQVMsTUFBVCxDQUFnQixjQUFoQixFQUZXO3lCQUFaLENBSEgsQ0FSb0M7cUJBQWQsRUFldkIsWUFBWTtBQUNYLGlDQUFTLE1BQVQsQ0FBZ0IsU0FBaEIsRUFEVztxQkFBWixDQWZILENBWEE7QUE2QkEsMkJBQU8sU0FBUyxPQUFULENBN0JQOzs7Ozs7aURBZ0NTOzs7QUFDVCx3QkFBSSxXQUFXLEdBQUcsS0FBSCxFQUFYLENBREs7QUFFVCx3QkFBSSxrQkFBa0IsT0FBTyxJQUFQLENBQVk7QUFDOUIsbUNBQVcsSUFBWDtBQUNBLHFDQUFhLHVCQUFiO0FBQ0Esb0NBQVkscUJBQVo7QUFDQSw4QkFBTSxJQUFOO0FBQ0EsaUNBQVM7QUFDTCx3Q0FBWTt1Q0FBTSxRQUFLLE1BQUw7NkJBQU47eUJBRGhCO3FCQUxrQixDQUFsQixDQUZLO0FBV1Qsb0NBQWdCLE1BQWhCLENBQXVCLElBQXZCLENBQTRCLFVBQUMsU0FBRCxFQUFlO0FBQ3ZDLHNDQUFjLGNBQWQsQ0FBNkIsUUFBSyxNQUFMLENBQVksUUFBWixFQUFzQixVQUFVLFNBQVYsRUFBcUIsVUFBVSxRQUFWLENBQXhFLENBQTRGLElBQTVGLENBQWlHLFVBQUMsR0FBRCxFQUFTO0FBQ3RHLHFDQUFTLE9BQVQsQ0FBaUIsSUFBSSxJQUFKLENBQVMsTUFBVCxDQUFqQixDQURzRzt5QkFBVCxFQUU5RixZQUFNO0FBQ0wscUNBQVMsTUFBVCxHQURLO3lCQUFOLENBRkgsQ0FEdUM7cUJBQWYsRUFNekIsWUFBTTtBQUNMLGlDQUFTLE1BQVQsQ0FBZ0IsU0FBaEIsRUFESztxQkFBTixDQU5ILENBWFM7QUFvQlQsMkJBQU8sU0FBUyxPQUFULENBcEJFOzs7Ozs7Z0RBdUJEOzs7QUFDUix3QkFBSSxXQUFXLEdBQUcsS0FBSCxFQUFYLENBREk7QUFFUix3QkFBSSxrQkFBa0IsT0FBTyxJQUFQLENBQVk7QUFDOUIsbUNBQVcsSUFBWDtBQUNBLHFDQUFhLHVCQUFiO0FBQ0Esb0NBQVkscUJBQVo7QUFDQSw4QkFBTSxJQUFOO0FBQ0EsaUNBQVM7QUFDTCx3Q0FBWTt1Q0FBTSxRQUFLLE1BQUw7NkJBQU47eUJBRGhCO3FCQUxrQixDQUFsQixDQUZJO0FBV1Isb0NBQWdCLE1BQWhCLENBQXVCLElBQXZCLENBQTRCLFVBQUMsU0FBRCxFQUFlO0FBQ3ZDLDRCQUFJLG1CQUFtQixRQUFLLE1BQUwsQ0FBWSxlQUFaLENBQTRCLENBQTVCLEVBQStCLE9BQS9CLENBRGdCO0FBRXZDLDRCQUFJLHFCQUFxQixVQUFVLFNBQVYsRUFBcUI7QUFDMUMsd0NBQVksV0FBWixDQUF3QixZQUF4QixFQUQwQztBQUUxQyxxQ0FBUyxNQUFULENBQWdCLFNBQWhCLEVBRjBDO3lCQUE5QyxNQUdPLElBQUksbUJBQW1CLFVBQVUsU0FBVixFQUFxQjtBQUMvQywwQ0FBYyxjQUFkLENBQTZCLFFBQUssTUFBTCxDQUFZLFFBQVosRUFBc0IsVUFBVSxTQUFWLEVBQXFCLFVBQVUsUUFBVixDQUF4RSxDQUE0RixJQUE1RixDQUFpRyxVQUFDLEdBQUQsRUFBUztBQUN0Ryw0Q0FBWSxVQUFaLENBQXVCLFdBQXZCLEVBRHNHO0FBRXRHLHlDQUFTLE9BQVQsQ0FBaUIsSUFBSSxJQUFKLENBQVMsTUFBVCxDQUFqQixDQUZzRzs2QkFBVCxFQUc5RixZQUFNO0FBQ0wsNENBQVksV0FBWixDQUF3QixXQUF4QixFQURLO0FBRUwseUNBQVMsTUFBVCxHQUZLOzZCQUFOLENBSEgsQ0FEK0M7eUJBQTVDLE1BUUE7QUFDSCwwQ0FBYyxZQUFkLENBQTJCLFFBQUssTUFBTCxDQUFZLFFBQVosRUFBc0IsVUFBVSxTQUFWLEVBQXFCLFVBQVUsUUFBVixDQUF0RSxDQUEwRixJQUExRixDQUErRixVQUFDLEdBQUQsRUFBUztBQUNwRyw0Q0FBWSxVQUFaLENBQXVCLFdBQXZCLEVBRG9HO0FBRXBHLHlDQUFTLE9BQVQsQ0FBaUIsSUFBSSxJQUFKLENBQVMsTUFBVCxDQUFqQixDQUZvRzs2QkFBVCxFQUc1RixZQUFNO0FBQ0wsNENBQVksVUFBWixDQUF1QixXQUF2QixFQURLO0FBRUwseUNBQVMsTUFBVCxHQUZLOzZCQUFOLENBSEgsQ0FERzt5QkFSQTtxQkFMaUIsRUFzQnpCLFlBQU07QUFDTCxpQ0FBUyxNQUFULENBQWdCLFNBQWhCLEVBREs7cUJBQU4sQ0F0QkgsQ0FYUTtBQW9DUiwyQkFBTyxTQUFTLE9BQVQsQ0FwQ0M7Ozs7OzsrQ0F1Q0Q7OztBQUNQLHdCQUFJLFdBQVcsR0FBRyxLQUFILEVBQVgsQ0FERztBQUVQLHdCQUFJLGtCQUFrQixPQUFPLElBQVAsQ0FBWTtBQUM5QixtQ0FBVyxJQUFYO0FBQ0EscUNBQWEsdUJBQWI7QUFDQSxvQ0FBWSxxQkFBWjtBQUNBLDhCQUFNLElBQU47QUFDQSxpQ0FBUztBQUNMLHdDQUFZO3VDQUFNLFFBQUssTUFBTDs2QkFBTjt5QkFEaEI7cUJBTGtCLENBQWxCLENBRkc7QUFXUCxvQ0FBZ0IsTUFBaEIsQ0FBdUIsSUFBdkIsQ0FBNEIsVUFBQyxTQUFELEVBQWU7QUFDdkMsc0NBQWMsV0FBZCxDQUEwQixRQUFLLE1BQUwsQ0FBWSxRQUFaLEVBQXNCLFVBQVUsU0FBVixFQUFxQixVQUFVLFFBQVYsQ0FBckUsQ0FBeUYsSUFBekYsQ0FBOEYsVUFBQyxHQUFELEVBQVM7QUFDbkcscUNBQVMsT0FBVCxDQUFpQixJQUFJLElBQUosQ0FBUyxNQUFULENBQWpCLENBRG1HO3lCQUFULEVBRTNGLFlBQU07QUFDTCxxQ0FBUyxNQUFULEdBREs7eUJBQU4sQ0FGSCxDQUR1QztxQkFBZixFQU16QixZQUFNO0FBQ0wsaUNBQVMsTUFBVCxDQUFnQixTQUFoQixFQURLO3FCQUFOLENBTkgsQ0FYTztBQW9CUCwyQkFBTyxTQUFTLE9BQVQsQ0FwQkE7Ozs7OzswQ0F1Qk47QUFDRCwyQkFBTyxNQUFNLE1BQU4sQ0FBYSxvQkFBb0IsS0FBSyxNQUFMLENBQVksUUFBWixDQUF4QyxDQURDOzs7Ozs7eUNBSUE7OztBQUNMLHdCQUFJLFdBQVcsR0FBRyxLQUFILEVBQVg7d0JBQ0EsTUFBTSxLQUFLLGNBQUwsRUFBTixDQUZDOztBQUlMLDZCQUFTLFlBQVQsR0FBd0I7QUFDcEIsOEJBQU0sSUFBTixDQUFXLG1CQUFYLEVBQWdDLFFBQVEsTUFBUixDQUFlLEdBQWYsQ0FBaEMsRUFBcUQsSUFBckQsQ0FBMEQsWUFBTTtBQUM1RCxxQ0FBUyxPQUFULEdBRDREO3lCQUFOLEVBRXZELFVBQUMsR0FBRCxFQUFTO0FBQ1IscUNBQVMsTUFBVCxDQUFnQjtBQUNaLHNDQUFNLFFBQU47QUFDQSxxQ0FBSyxJQUFJLElBQUosQ0FBUyxTQUFUOzZCQUZULEVBRFE7eUJBQVQsQ0FGSCxDQURvQjtxQkFBeEI7O0FBV0Esd0JBQUksS0FBSyxjQUFMLEVBQXFCOztBQUNyQixnQ0FBSSxZQUFZLFFBQUssTUFBTCxDQUFZLFNBQVo7QUFDaEIsZ0NBQUksZUFBZSxDQUFDLFNBQUQsQ0FBZjtBQUNKLHdDQUFZLFlBQVosQ0FBeUIsUUFBSyxjQUFMLENBQW9CLE9BQXBCLENBQTRCLEVBQTVCLEVBQWdDLFlBQXpELEVBQXVFLElBQXZFLENBQTRFLFlBQU07QUFDOUUsd0NBQUssb0JBQUwsR0FEOEU7QUFFOUUsd0NBQUssYUFBTCxDQUFtQixJQUFuQixDQUF3QixTQUF4QixFQUY4RTtBQUc5RSx3Q0FBSyxlQUFMLENBQXFCLFNBQXJCLEVBSDhFO0FBSTlFLCtDQUo4RTs2QkFBTixFQUt6RSxVQUFDLEdBQUQsRUFBUztBQUNSLHlDQUFTLE1BQVQsQ0FBZ0I7QUFDWiwwQ0FBTSxXQUFOO0FBQ0EseUNBQUssSUFBSSxJQUFKLENBQVMsU0FBVDtpQ0FGVCxFQURROzZCQUFULENBTEg7NkJBSHFCO3FCQUF6QixNQWNPO0FBQ0gsdUNBREc7cUJBZFA7QUFpQkEsMkJBQU8sU0FBUyxPQUFULENBaENGOzs7O21CQWx6QlA7WUFyQzBGOztZQTAzQjFGO0FBQ0YscUJBREUsa0JBQ0YsQ0FBWSxTQUFaLEVBQXVCO3NDQURyQixvQkFDcUI7O0FBQ25CLHFCQUFLLFVBQUwsR0FBa0IsS0FBbEIsQ0FEbUI7QUFFbkIscUJBQUssbUJBQUwsR0FBMkIsS0FBM0IsQ0FGbUI7QUFHbkIscUJBQUssWUFBTCxHQUFvQixFQUFwQixDQUhtQjtBQUluQixxQkFBSyxhQUFMLEdBQXFCLEVBQXJCOztBQUptQixvQkFNbkIsQ0FBSyxhQUFMLEdBQXFCLENBQXJCOztBQU5tQixvQkFRbkIsQ0FBSyxzQkFBTCxHQUE4QixDQUE5QixDQVJtQjtBQVNuQixxQkFBSyxJQUFMLENBQVUsU0FBVixFQVRtQjthQUF2Qjs7eUJBREU7O3FDQVlHLFdBQVc7QUFDUix5QkFBSyxVQUFMLEdBQWtCLEtBQWxCLENBRFE7QUFFUix5QkFBSyxtQkFBTCxHQUEyQixLQUEzQixDQUZRO0FBR1IseUJBQUssWUFBTCxHQUFvQixZQUFPO0FBQ3ZCLG9DQUFZLGFBQWEsRUFBYixDQURXOzs7Ozs7QUFFdkIsbURBQXFCLHFDQUFyQiw0R0FBZ0M7b0NBQXZCLHlCQUF1Qjs7QUFDNUIseUNBQVMsVUFBVCxHQUFzQixLQUF0QixDQUQ0QjtBQUU1Qix5Q0FBUyxTQUFULEdBQXFCLElBQXJCLENBRjRCO0FBRzVCLG9DQUFJLFNBQVMsVUFBVCxFQUFxQjs7Ozs7O0FBQ3JCLCtEQUFzQixTQUFTLFVBQVQsNEJBQXRCLDRHQUEyQztnREFBbEMsMEJBQWtDOztBQUN2QyxzREFBVSxnQkFBVixHQUE2QixVQUFVLFdBQVYsQ0FBc0IsU0FBdEIsQ0FBZ0MsQ0FBaEMsRUFBbUMsRUFBbkMsQ0FBN0IsQ0FEdUM7eUNBQTNDOzs7Ozs7Ozs7Ozs7OztxQ0FEcUI7aUNBQXpCOzZCQUhKOzs7Ozs7Ozs7Ozs7Ozt5QkFGdUI7O0FBV3ZCLCtCQUFPLFNBQVAsQ0FYdUI7cUJBQU4sRUFBckIsQ0FIUTs7Ozs7O29EQWtCSSxVQUFVO0FBQzFCLHlCQUFLLG1CQUFMLEdBQTJCLEtBQTNCLENBRDBCO0FBRTFCLHlCQUFLLHNCQUFMLEdBQThCLENBQTlCLENBRjBCO0FBRzFCLHlCQUFLLGFBQUwsR0FBcUIsU0FBUyxVQUFULElBQXVCLEVBQXZCLENBSEs7Ozs7OztBQUkxQiwrQ0FBc0IsS0FBSyxhQUFMLDRCQUF0Qiw0R0FBMEM7Z0NBQWpDLDBCQUFpQzs7QUFDdEMsc0NBQVUsVUFBVixHQUF1QixLQUF2QixDQURzQzt5QkFBMUM7Ozs7Ozs7Ozs7Ozs7O3FCQUowQjs7Ozs4Q0FRaEIsVUFBVTtBQUNwQix5QkFBSyxVQUFMLEdBQWtCLEtBQWxCLENBRG9CO0FBRXBCLHlCQUFLLGFBQUwsR0FBcUIsQ0FBckIsQ0FGb0I7Ozs7OztBQUdwQiwrQ0FBcUIsS0FBSyxZQUFMLDRCQUFyQiw0R0FBd0M7Z0NBQS9CLHlCQUErQjs7QUFDcEMscUNBQVMsVUFBVCxHQUFzQixLQUF0QixDQURvQztBQUVwQyxxQ0FBUyxTQUFULEdBQXFCLFNBQVMsWUFBVCxDQUFzQixPQUF0QixDQUE4QixRQUE5QixNQUE0QyxDQUFDLENBQUQsQ0FGN0I7eUJBQXhDOzs7Ozs7Ozs7Ozs7OztxQkFIb0I7Ozs7cURBUUgsV0FBVztBQUN4Qix3QkFBSSxpQkFBaUIsSUFBakIsQ0FEb0I7QUFFeEIsd0JBQUksVUFBVSxVQUFWLEVBQXNCO0FBQ3RCLDZCQUFLLHNCQUFMOztBQURzQjs7Ozs7QUFHdEIsbURBQXNCLEtBQUssYUFBTCw0QkFBdEIsNEdBQTBDO29DQUFqQywyQkFBaUM7O0FBQ3RDLG9DQUFJLENBQUMsV0FBVSxVQUFWLEVBQXNCO0FBQ3ZCLHFEQUFpQixLQUFqQixDQUR1QjtBQUV2QiwwQ0FGdUI7aUNBQTNCOzZCQURKOzs7Ozs7Ozs7Ozs7Ozt5QkFIc0I7O0FBU3RCLDRCQUFJLGNBQUosRUFBb0I7QUFDaEIsaUNBQUssbUJBQUwsR0FBMkIsSUFBM0IsQ0FEZ0I7eUJBQXBCO3FCQVRKLE1BWU87QUFDSCw2QkFBSyxzQkFBTCxHQURHO0FBRUgsNkJBQUssbUJBQUwsR0FBMkIsS0FBM0IsQ0FGRztxQkFaUDs7Ozs7O2tEQWtCVSxxQkFBcUI7QUFDL0IseUJBQUssbUJBQUwsR0FBMkIsT0FBTyxtQkFBUCxLQUErQixXQUEvQixHQUE2QyxDQUFDLEtBQUssbUJBQUwsR0FBMkIsbUJBQXpFLENBREk7QUFFL0IseUJBQUssc0JBQUwsR0FBOEIsS0FBSyxtQkFBTCxHQUEyQixLQUFLLGFBQUwsQ0FBbUIsTUFBbkIsR0FBNEIsQ0FBdkQsQ0FGQzs7Ozs7O0FBRy9CLCtDQUFzQixLQUFLLGFBQUwsNEJBQXRCLDRHQUEwQztnQ0FBakMsMEJBQWlDOztBQUN0QyxzQ0FBVSxVQUFWLEdBQXVCLEtBQUssbUJBQUwsQ0FEZTt5QkFBMUM7Ozs7Ozs7Ozs7Ozs7O3FCQUgrQjs7Ozs7OzRDQVEzQixVQUFVO0FBQ2Qsd0JBQUksaUJBQWlCLElBQWpCLENBRFU7QUFFZCx3QkFBSSxTQUFTLFVBQVQsRUFBcUI7QUFDckIsNkJBQUssYUFBTDs7QUFEcUI7Ozs7O0FBR3JCLG1EQUFxQixLQUFLLFlBQUwsNEJBQXJCLDRHQUF3QztvQ0FBL0IsMEJBQStCOztBQUNwQyxvQ0FBSSxVQUFTLFNBQVQsSUFBc0IsQ0FBQyxVQUFTLFVBQVQsRUFBcUI7QUFDNUMscURBQWlCLEtBQWpCLENBRDRDO0FBRTVDLDBDQUY0QztpQ0FBaEQ7NkJBREo7Ozs7Ozs7Ozs7Ozs7O3lCQUhxQjs7QUFTckIsNEJBQUksY0FBSixFQUFvQjtBQUNoQixpQ0FBSyxVQUFMLEdBQWtCLElBQWxCLENBRGdCO3lCQUFwQjtxQkFUSixNQVlPO0FBQ0gsNkJBQUssYUFBTCxHQURHO0FBRUgsNkJBQUssVUFBTCxHQUFrQixLQUFsQixDQUZHO3FCQVpQOzs7Ozs7aURBa0JTLFlBQVk7QUFDekIseUJBQUssVUFBTCxHQUFrQixPQUFPLFVBQVAsS0FBc0IsV0FBdEIsR0FBb0MsS0FBSyxVQUFMLEdBQWtCLFVBQXRELENBRE87QUFFekIseUJBQUssYUFBTCxHQUFxQixDQUFyQixDQUZ5Qjs7Ozs7O0FBR3pCLCtDQUFxQixLQUFLLFlBQUwsNEJBQXJCLDRHQUF3QztnQ0FBL0IseUJBQStCOztBQUNwQyxnQ0FBSSxTQUFTLFNBQVQsSUFBc0IsS0FBSyxVQUFMLEVBQWlCO0FBQ3ZDLHlDQUFTLFVBQVQsR0FBc0IsSUFBdEIsQ0FEdUM7QUFFdkMscUNBQUssYUFBTCxHQUZ1Qzs2QkFBM0MsTUFHTztBQUNILHlDQUFTLFVBQVQsR0FBc0IsS0FBdEIsQ0FERzs2QkFIUDt5QkFESjs7Ozs7Ozs7Ozs7Ozs7cUJBSHlCOzs7O21CQTlGM0I7WUExM0IwRjs7WUFzK0IxRjtBQUNGLHFCQURFLFVBQ0YsQ0FBWSxVQUFaLEVBQXdCO3NDQUR0QixZQUNzQjs7QUFDcEIscUJBQUssTUFBTCxHQUFjLEVBQWQsQ0FEb0I7QUFFcEIscUJBQUssU0FBTCxHQUFpQixLQUFqQixDQUZvQjtBQUdwQixxQkFBSyxVQUFMLEdBQWtCLEVBQWxCLENBSG9CO0FBSXBCLHFCQUFLLHFCQUFMLEdBQTZCLElBQUksa0JBQUosRUFBN0IsQ0FKb0I7QUFLcEIscUJBQUssSUFBTCxDQUFVLFVBQVYsRUFMb0I7YUFBeEI7O3lCQURFOztxQ0FRRyxZQUFZO0FBQ2IseUJBQUssVUFBTCxHQUFrQixjQUFjLEVBQWQsQ0FETDs7Ozs2Q0FHSixVQUFVLFlBQVksV0FBVyxrQkFBa0I7OztBQUN4RCx3QkFBSSxXQUFXLEdBQUcsS0FBSCxFQUFYLENBRG9EO0FBRXhELHdCQUFJLENBQUMsUUFBRCxFQUFXO0FBQ1gsNkJBQUssTUFBTCxDQUFZLEVBQVosR0FBaUIsSUFBakIsQ0FEVztBQUVYLDZCQUFLLE1BQUwsQ0FBWSxJQUFaLEdBQW1CLElBQW5CLENBRlc7QUFHWCw2QkFBSyxNQUFMLENBQVksU0FBWixHQUF3QixJQUF4QixDQUhXO0FBSVgsNkJBQUsscUJBQUwsQ0FBMkIsSUFBM0IsR0FKVztBQUtYLGlDQUFTLE1BQVQsR0FMVztxQkFBZixNQU1PO0FBQ0gsNkJBQUssTUFBTCxDQUFZLEVBQVosR0FBaUIsUUFBakIsQ0FERztBQUVILDZCQUFLLE1BQUwsQ0FBWSxJQUFaLEdBQW1CLFVBQW5CLENBRkc7QUFHSCw2QkFBSyxNQUFMLENBQVksU0FBWixHQUF3QixTQUF4QixDQUhHO0FBSUgsNkJBQUssU0FBTCxHQUFpQixJQUFqQixDQUpHO0FBS0gsNEJBQUksQ0FBQyxnQkFBRCxFQUFtQjtBQUNuQiwwQ0FBYyxZQUFkLENBQTJCLFFBQTNCLEVBQXFDLElBQXJDLENBQTBDLFVBQUMsR0FBRCxFQUFTO0FBQy9DLHdDQUFLLHFCQUFMLENBQTJCLElBQTNCLENBQWdDLElBQUksSUFBSixDQUFTLE1BQVQsQ0FBaEMsQ0FEK0M7QUFFL0MseUNBQVMsT0FBVCxHQUYrQzs2QkFBVCxDQUExQyxDQUdHLE9BSEgsQ0FHVyxZQUFZO0FBQ25CLHlDQUFTLE1BQVQsR0FEbUI7QUFFbkIscUNBQUssU0FBTCxHQUFpQixLQUFqQixDQUZtQjs2QkFBWixDQUhYLENBRG1CO3lCQUF2QjtxQkFYSjtBQXFCQSwyQkFBTyxTQUFTLE9BQVQsQ0F2QmlEOzs7Ozs7NkNBMEJuRCxhQUFhLFNBQVM7QUFDL0Isd0JBQUksaUJBQUo7d0JBQWMsbUJBQWQ7d0JBQTBCLGtCQUExQixDQUQrQjs7Ozs7O0FBRS9CLCtDQUFtQixLQUFLLFVBQUwsNEJBQW5CLDRHQUFvQztnQ0FBM0IsdUJBQTJCOztBQUNoQyxtQ0FBTyxhQUFQLEdBQXVCLGNBQWMsT0FBTyxXQUFQLEtBQXVCLFdBQXZCLEdBQXFDLElBQW5ELENBRFM7QUFFaEMsbUNBQU8sVUFBUCxHQUFvQixVQUFVLE9BQU8sT0FBUCxLQUFtQixPQUFuQixHQUE2QixJQUF2Qzs7QUFGWSxnQ0FJNUIsT0FBTyxRQUFQLEtBQW9CLFdBQXBCLElBQW1DLE9BQU8sYUFBUCxJQUF3QixPQUFPLFVBQVAsRUFBbUI7QUFDOUUsMkNBQVcsT0FBTyxRQUFQLENBRG1FO0FBRTlFLDZDQUFhLE9BQU8sVUFBUCxDQUZpRTtBQUc5RSw0Q0FBWSxPQUFPLFNBQVAsQ0FIa0U7NkJBQWxGO3lCQUpKOzs7Ozs7Ozs7Ozs7OztxQkFGK0I7O0FBYS9CLDJCQUFPLE9BQU8sUUFBUCxLQUFvQixXQUFwQixHQUFrQyxLQUFLLFlBQUwsRUFBbEMsR0FBd0QsS0FBSyxZQUFMLENBQWtCLFFBQWxCLEVBQTRCLFVBQTVCLEVBQXdDLFNBQXhDLENBQXhELENBYndCOzs7O21CQXJDakM7Ozs7QUF0K0IwRjs7QUE2aENoRyxZQUFNLGNBQWMsV0FBVyxnQkFBWCxDQUE0QjtBQUM1Qyx3QkFBWSxVQUFaO0FBQ0Esb0JBQVEsTUFBUjtTQUZnQixDQUFkLENBN2hDMEY7QUFpaUNoRyxlQUFPO0FBQ0gsMkJBQWUsYUFBZjtBQUNBLHlCQUFhLFdBQWI7U0FGSixDQWppQ2dHO0tBQXBHO0FBc2lDQSxrQkFBYyxPQUFkLEdBQXdCLENBQUMsT0FBRCxFQUFVLGNBQVYsRUFBMEIsWUFBMUIsRUFBd0MsYUFBeEMsRUFBdUQsWUFBdkQsRUFBcUUsUUFBckUsRUFBK0UsSUFBL0UsRUFBcUYsT0FBckYsQ0FBeEIsQ0ExaUNvQjtBQTJpQ3BCLGlCQUFhLE9BQWIsQ0FBcUIsYUFBckIsRUFBb0MsYUFBcEMsRUEzaUNvQjtBQTRpQ3BCLFdBQU8sWUFBUCxHQUFzQixZQUF0QixDQTVpQ29CO0NBQXZCLENBQUQsQ0E2aUNHLE1BN2lDSCIsImZpbGUiOiJjb21tb24vZGVwbG95TW9kdWxlL2RlcGxveU1vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIigod2luZG93LCB1bmRlZmluZWQpID0+IHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgbGV0IGRlcGxveU1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdkZXBsb3lNb2R1bGUnLCBbXSk7XG5cbiAgICBmdW5jdGlvbiBEZXBsb3lTZXJ2aWNlKCRodHRwLCAkZG9tZUNsdXN0ZXIsICRkb21lSW1hZ2UsICRkb21lUHVibGljLCAkZG9tZU1vZGVsLCAkbW9kYWwsICRxLCAkdXRpbCkge1xuICAgICAgICBjb25zdCBub2RlU2VydmljZSA9ICRkb21lQ2x1c3Rlci5nZXRJbnN0YW5jZSgnTm9kZVNlcnZpY2UnKTtcbiAgICAgICAgY29uc3QgRGVwbG95U2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IF91cmwgPSAnL2FwaS9kZXBsb3knO1xuICAgICAgICAgICAgY29uc3QgX3ZlcnNpb25VcmwgPSAnL2FwaS92ZXJzaW9uJztcbiAgICAgICAgICAgIHRoaXMuZ2V0TGlzdCA9ICgpID0+ICRodHRwLmdldChgJHtfdXJsfS9saXN0YCk7XG4gICAgICAgICAgICB0aGlzLmdldFNpbmdsZSA9IChkZXBsb3lJZCkgPT4gJGh0dHAuZ2V0KGAke191cmx9L2lkLyR7ZGVwbG95SWR9YCk7XG4gICAgICAgICAgICB0aGlzLmdldEV2ZW50cyA9IChkZXBsb3lJZCkgPT4gJGh0dHAuZ2V0KGAke191cmx9L2V2ZW50L2xpc3Q/ZGVwbG95SWQ9JHtkZXBsb3lJZH1gKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0SW5zdGFuY2VzID0gKGRlcGxveUlkKSA9PiAkaHR0cC5nZXQoYCR7X3VybH0vJHtkZXBsb3lJZH0vaW5zdGFuY2VgKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0VmVyc2lvbnMgPSAoZGVwbG95SWQpID0+ICRodHRwLmdldChgJHtfdmVyc2lvblVybH0vbGlzdD9kZXBsb3lJZD0ke2RlcGxveUlkfWApO1xuICAgICAgICAgICAgdGhpcy5nZXRTaW5nbGVWZXJzaW9uID0gKGRlcGxveUlkLCB2ZXJzaW9uSWQpID0+ICRodHRwLmdldChgJHtfdmVyc2lvblVybH0vaWQvJHtkZXBsb3lJZH0vJHt2ZXJzaW9uSWR9YCk7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVZlcnNpb24gPSAodmVyc2lvbikgPT4gJGh0dHAucG9zdChgJHtfdmVyc2lvblVybH0vY3JlYXRlP2RlcGxveUlkPSR7dmVyc2lvbi5kZXBsb3lJZH1gLCBhbmd1bGFyLnRvSnNvbih2ZXJzaW9uKSk7XG4gICAgICAgICAgICB0aGlzLnJvbGxiYWNrRGVwbG95ID0gKGRlcGxveUlkLCB2ZXJzaW9uSWQsIHJlcGxpY2FzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlcGxpY2FzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGAvYXBpL2RlcGxveS9hY3Rpb24vcm9sbGJhY2s/ZGVwbG95SWQ9JHtkZXBsb3lJZH0mdmVyc2lvbj0ke3ZlcnNpb25JZH0mcmVwbGljYXM9JHtyZXBsaWNhc31gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChgL2FwaS9kZXBsb3kvYWN0aW9uL3JvbGxiYWNrP2RlcGxveUlkPSR7ZGVwbG95SWR9JnZlcnNpb249JHt2ZXJzaW9uSWR9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGVwbG95ID0gKGRlcGxveUlkLCB2ZXJzaW9uSWQsIHJlcGxpY2FzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlcGxpY2FzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGAvYXBpL2RlcGxveS9hY3Rpb24vdXBkYXRlP2RlcGxveUlkPSR7ZGVwbG95SWR9JnZlcnNpb249JHt2ZXJzaW9uSWR9JnJlcGxpY2FzPSR7cmVwbGljYXN9YCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoYC9hcGkvZGVwbG95L2FjdGlvbi91cGRhdGU/ZGVwbG95SWQ9JHtkZXBsb3lJZH0mdmVyc2lvbj0ke3ZlcnNpb25JZH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5zdGFydERlcGxveSA9IChkZXBsb3lJZCwgdmVyc2lvbklkLCByZXBsaWNhcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXBsaWNhcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChgL2FwaS9kZXBsb3kvYWN0aW9uL3N0YXJ0P2RlcGxveUlkPSR7ZGVwbG95SWR9JnZlcnNpb249JHt2ZXJzaW9uSWR9JnJlcGxpY2FzPSR7cmVwbGljYXN9YCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoYC9hcGkvZGVwbG95L2FjdGlvbi9zdGFydD9kZXBsb3lJZD0ke2RlcGxveUlkfSZ2ZXJzaW9uPSR7dmVyc2lvbklkfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGRlcGxveVNlcnZpY2UgPSBuZXcgRGVwbG95U2VydmljZSgpO1xuXG5cbiAgICAgICAgY2xhc3MgRGVwbG95IHtcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKGRlcGxveUNvbmZpZykge1xuICAgICAgICAgICAgICAgIHRoaXMubmFtZXNwYWNlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIC8vIOaYr+WQpuaYr+aWsOW7um5hbWVzcGFjZVxuICAgICAgICAgICAgICAgIHRoaXMuaXNOZXdOYW1lc3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnZMaXN0ID0gW3tcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdURVNUJyxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJ+a1i+ivleeOr+WigydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnUFJPRCcsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICfnlJ/kuqfnjq/looMnXG4gICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgLy8g6KGo5Y2V5LiN6IO95a6e546w55qE6aqM6K+BXG4gICAgICAgICAgICAgICAgdGhpcy52YWxpZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaXDoh7PlsJHloavkuIDkuKpcbiAgICAgICAgICAgICAgICAgICAgaXBzOiBmYWxzZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgLy8g5piv5ZCm5byA5ZCv5pel5b+X5pS26ZuGXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dDb25maWcgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuZW52VGV4dCA9ICfor7fpgInmi6npg6jnvbLnjq/looMnO1xuICAgICAgICAgICAgICAgIHRoaXMudmVyc2lvbkxpc3QgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RJbnMgPSAkZG9tZUNsdXN0ZXIuZ2V0SW5zdGFuY2UoJ05vZGVMaXN0Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdEZvcklwcyA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlckxpc3RJbnMgPSAkZG9tZUNsdXN0ZXIuZ2V0SW5zdGFuY2UoJ0NsdXN0ZXJMaXN0Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zID0gJGRvbWVQdWJsaWMuZ2V0TG9hZGluZ0luc3RhbmNlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdG9yID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogbnVsbFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy52aXNpdE1vZGUgPSAnbm9BY2Nlc3MnO1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KGRlcGxveUNvbmZpZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0KGRlcGxveUNvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudFZlcnNpb25zLCBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZVRpbWUgPSAtMTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KGRlcGxveUNvbmZpZykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZGVwbG95Q29uZmlnLnJlcGxpY2FzICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLnJlcGxpY2FzID0gMztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyDmmK/lkKbkvb/nlKjotJ/ovb3lnYfooaFcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KGRlcGxveUNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0cykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8v5a+55YaF5pyN5YqhXG4gICAgICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheShkZXBsb3lDb25maWcuaW5uZXJTZXJ2aWNlRHJhZnRzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmlubmVyU2VydmljZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheShkZXBsb3lDb25maWcuY3VycmVudFZlcnNpb25zKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmN1cnJlbnRWZXJzaW9ucyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGxvYWRCYWxhbmNlRHJhZnQuZXh0ZXJuYWxJUHM6IFsnZXh0ZXJuYWxJUDEnLCdleHRlcm5hbElQMiddIC0tPiBbe2lwOidleHRlcm5hbElQMSd9LHtpcDonZXh0ZXJuYWxJUDEnfSx7aXA6Jyd9XVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBsb2FkQmFsYW5jZURyYWZ0IG9mIGRlcGxveUNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFsb2FkQmFsYW5jZURyYWZ0LmV4dGVybmFsSVBzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZEJhbGFuY2VEcmFmdC5leHRlcm5hbElQcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4dGVybmFsSVBzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpcCBvZiBsb2FkQmFsYW5jZURyYWZ0LmV4dGVybmFsSVBzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZXJuYWxJUHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlwOiBpcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZXJuYWxJUHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRCYWxhbmNlRHJhZnQuZXh0ZXJuYWxJUHMgPSBleHRlcm5hbElQcztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnID0gZGVwbG95Q29uZmlnO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTG9hZEJhbGFuY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRJbm5lclNlcnZpY2UoKTtcblxuICAgICAgICAgICAgICAgICAgICAvL+e9kee7nOaooeW8j1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlnLm5ldHdvcmtNb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5uZXR3b3JrTW9kZSA9ICdERUZBVUxUJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlnLmFjY2Vzc1R5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmFjY2Vzc1R5cGUgPSAnSzhTX1NFUlZJQ0UnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRWZXJzaW9ucyA9IHRoaXMuY29uZmlnLmN1cnJlbnRWZXJzaW9ucztcbiAgICAgICAgICAgICAgICAgICAgLy8g5piv5ZCm5piv5paw5bu6ZGVwbG95XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5kZXBsb3lJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnZlcnNpb25MaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS5nZXRWZXJzaW9ucyh0aGlzLmNvbmZpZy5kZXBsb3lJZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmVyc2lvbkxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50VmVyc2lvbnMubGVuZ3RoID09PSAwICYmICR1dGlsLmlzT2JqZWN0KHRoaXMudmVyc2lvbkxpc3RbMF0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZVZlcnNpb24odGhpcy52ZXJzaW9uTGlzdFswXS52ZXJzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBjdXJyZW50VmVyc2lvbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRWZXJzaW9uc1tpXS5jcmVhdGVUaW1lID4gY3JlYXRlVGltZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVUaW1lID0gY3VycmVudFZlcnNpb25zW2ldLmNyZWF0ZVRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gY3VycmVudFZlcnNpb25zW2ldLnZlcnNpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVWZXJzaW9uKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdERhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBkZXBsb3lpbmZv5ZKMdmVyc2lvbmluZm/ph43lkIjnmoTkv6Hmga/lnKjov5nph4zlpITnkIbvvIzliIfmjaJ2ZXJzaW9u5LmL5ZCO6YeN5paw6LCD55So6L+b6KGM5Yid5aeL5YyWXG4gICAgICAgICAgICBpbml0RGF0YSgpIHtcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KHRoaXMuY29uZmlnLmxvZ0RyYWZ0KSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5sb2dEcmFmdCA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkodGhpcy5jb25maWcubG9nRHJhZnQubG9nSXRlbURyYWZ0cykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubG9nRHJhZnQubG9nSXRlbURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5sb2dEcmFmdC5sb2dJdGVtRHJhZnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBsb2dQYXRoOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbGxlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBhdXRvRGVsZXRlOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheSh0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHMpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkodGhpcy5jb25maWcubGFiZWxTZWxlY3RvcnMpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxhYmVsU2VsZWN0b3JzID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdFNlbGVjdGVkTGFiZWxzKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlnLmhvc3RFbnYpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVFbnYodGhpcy5lbnZMaXN0WzBdKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBlbnYgb2YgdGhpcy5lbnZMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuaG9zdEVudiA9PT0gZW52LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVFbnYoZW52KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5zdGF0ZWZ1bCAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkodGhpcy5pbWFnZUxpc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdkb2NrZXJJbWFnZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVJbWFnZS5pbWFnZVNlcnZpY2UuZ2V0UHJvamVjdEltYWdlcygpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZUxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5qC85byP5YyWaW1hZ2XnmoRlbnZTZXR0aW5nc+S4umNvbnRhaW5lckRyYWZ0c+agvOW8j1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGltYWdlIG9mIGltYWdlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZW52cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2UuZW52U2V0dGluZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGVudiBvZiBpbWFnZS5lbnZTZXR0aW5ncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogZW52LmtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGVudi52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGVudi5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLmVudlNldHRpbmdzID0gZW52cztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3QgPSBpbWFnZUxpc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5aSE55CG6YOo572y5bey5pyJ55qE6ZWc5YOPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtYXJ0Q29udGFpbmVyRHJhZnRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygnZG9ja2VySW1hZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtYXJ0Q29udGFpbmVyRHJhZnRzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0Q2x1c3RlcigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnY2x1c3RlcicpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVNlcnZpY2UuZ2V0RGF0YSgpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdElucy5pbml0KHJlcy5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUNsdXN0ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygnY2x1c3RlcicpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5Yi35paw5b2T5YmNRGVwbG9554q25oCBXG4gICAgICAgICAgICBmcmVzaERlcGxveShuZXdDb25maWcpIHtcbiAgICAgICAgICAgICAgICBpZiAoJHV0aWwuaXNPYmplY3QobmV3Q29uZmlnKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5sYXN0VXBkYXRlVGltZSA9IG5ld0NvbmZpZy5sYXN0VXBkYXRlVGltZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZGVwbG95bWVudFN0YXR1cyA9IG5ld0NvbmZpZy5kZXBsb3ltZW50U3RhdHVzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jdXJyZW50VmVyc2lvbnMgPSBuZXdDb25maWcuY3VycmVudFZlcnNpb25zO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jdXJyZW50UmVwbGljYXMgPSBuZXdDb25maWcuY3VycmVudFJlcGxpY2FzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZyZXNoVmVyc2lvbkxpc3QoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygndmVyc2lvbkxpc3QnKTtcbiAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLmdldFZlcnNpb25zKHRoaXMuY29uZmlnLmRlcGxveUlkKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52ZXJzaW9uTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ3ZlcnNpb25MaXN0Jyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b2dnbGVDbHVzdGVyKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjbHVzdGVySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHVzdGVyTGlzdCA9IHRoaXMuY2x1c3Rlckxpc3RJbnMuY2x1c3Rlckxpc3Q7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjbHVzdGVyTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyDpgInmi6nlvZPliY1kZXBsb3kvdmVyc2lvbueahGNsdXN0ZXJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmRleCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gY2x1c3Rlckxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNsdXN0ZXJMaXN0W2ldLmlkID09PSB0aGlzLmNvbmZpZy5jbHVzdGVySWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzlvZPliY1kZXBsb3kvdmVyc2lvbuayoeaciWNsdXN0ZXLvvIzliJnpgInmi6nnrKzkuIDkuKpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdElucy50b2dnbGVDbHVzdGVyKGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dDb25maWcgPSBjbHVzdGVyTGlzdFtpbmRleF0ubG9nQ29uZmlnO1xuICAgICAgICAgICAgICAgICAgICBjbHVzdGVySWQgPSB0aGlzLmNsdXN0ZXJMaXN0SW5zLmNsdXN0ZXIuaWQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIOmHjee9ruaXpeW/l+S/oeaBr1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5sb2dDb25maWcgIT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvZ0RyYWZ0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ0l0ZW1EcmFmdHM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ1BhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29sbGVjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9EZWxldGU6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdub2RlbGlzdCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE5vZGVMaXN0KGNsdXN0ZXJJZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZUxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0Rm9ySXBzID0gYW5ndWxhci5jb3B5KG5vZGVMaXN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ub2RlTGlzdEZvcklwcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBub2RlID0gdGhpcy5ub2RlTGlzdEZvcklwc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5zdGF0dXMgPT0gJ1JlYWR5Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXBzID0gdGhpcy5jb25maWcubG9hZEJhbGFuY2VEcmFmdHNbMF0uZXh0ZXJuYWxJUHM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGlwIG9mIGlwcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlwID09PSBub2RlLmlwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pc1NlbGVjdGVkID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdEZvcklwcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzmmK9hcHAgc3RvcmXnmoTkuLvmnLrliJfooajvvIzliJnov4fmu6TmjonmsqHmnIlkaXNrUGF0aOeahOS4u+aculxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy5pbml0KG5vZGVMaXN0LCB0aGlzLmNvbmZpZy5zdGF0ZWZ1bCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRTZWxlY3RlZExhYmVscygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy50b2dnbGVFbnYodGhpcy5jb25maWcuaG9zdEVudik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzmmK/mnInnirbmgIHmnI3liqHvvIzpu5jorqTpgInmi6nlkoxyZXBsaWNz55u4562J55qE5Li75py65Liq5pWwXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuc3RhdGVmdWwgJiYgdGhpcy5jb25maWcucmVwbGljYXMgJiYgdGhpcy5ub2RlTGlzdElucy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5ub2RlTGlzdElucy5ub2RlTGlzdC5sZW5ndGg7IGkgPCBsICYmIGkgPCB0aGlzLmNvbmZpZy5yZXBsaWNhczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RJbnMubm9kZUxpc3RbaV0uaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RJbnMudG9nZ2xlTm9kZUNoZWNrKHRoaXMubm9kZUxpc3RJbnMubm9kZUxpc3RbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy5pbml0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ25vZGVsaXN0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5kZXBsb3lJZCA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCduYW1lc3BhY2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE5hbWVzcGFjZShjbHVzdGVySWQpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmFtZXNwYWNlTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzTmV3TmFtZXNwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubmFtZXNwYWNlID0gdGhpcy5uYW1lc3BhY2VMaXN0WzBdLm5hbWUgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMubmFtZXNwYWNlTGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubmFtZXNwYWNlTGlzdFtpXS5uYW1lID09ICdkZWZhdWx0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubmFtZXNwYWNlID0gdGhpcy5uYW1lc3BhY2VMaXN0W2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzTmV3TmFtZXNwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uYW1lc3BhY2VMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubmFtZXNwYWNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCduYW1lc3BhY2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWIneWni+WMlumAieS4reeahGxhYmVsXG4gICAgICAgICAgICBpbml0U2VsZWN0ZWRMYWJlbHMoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy5pbml0TGFiZWxzSW5mbygpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb25maWcubGFiZWxTZWxlY3RvcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgbGFiZWxTZWxlY3RvcnMgPSB0aGlzLmNvbmZpZy5sYWJlbFNlbGVjdG9ycztcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBsYWJlbFNlbGVjdG9yIG9mIGxhYmVsU2VsZWN0b3JzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsYWJlbE5hbWUgPSBsYWJlbFNlbGVjdG9yLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYWJlbE5hbWUgIT0gJ2t1YmVybmV0ZXMuaW8vaG9zdG5hbWUnICYmIGxhYmVsTmFtZSAhPSAnVEVTVEVOVicgJiYgbGFiZWxOYW1lICE9ICdQUk9ERU5WJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy50b2dnbGVMYWJlbChsYWJlbE5hbWUsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsaWRJcHMoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnZpc2l0TW9kZSA9PT0gJ2ZvcmVpZ24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3RGb3JJcHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWQuaXBzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWQuaXBzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkLmlwcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5YiH5o2i5b2T5YmN5bGV56S655qEdmVyc2lvblxuICAgICAgICAgICAgdG9nZ2xlVmVyc2lvbih2ZXJzaW9uSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS5nZXRTaW5nbGVWZXJzaW9uKHRoaXMuY29uZmlnLmRlcGxveUlkLCB2ZXJzaW9uSWQpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCR1dGlsLmlzT2JqZWN0KHJlcy5kYXRhLnJlc3VsdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLmV4dGVuZCh0aGlzLmNvbmZpZywgcmVzLmRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXREYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBjb250YWluZXJEcmFmdHPvvJrmlrDlop5jb250YWluZXJEcmFmdOeahG9sZEVudu+8jG5ld0Vudu+8jHRhZ0xpc3TlsZ7mgKdcbiAgICAgICAgICAgIGZvcm1hcnRDb250YWluZXJEcmFmdHMoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvbnRhaW5lckRyYWZ0cyA9IHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cztcblxuICAgICAgICAgICAgICAgIGNvbnN0IGdldFRhZyA9IChjb250YWluZXJEcmFmdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCd0YWcnKTtcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVJbWFnZS5pbWFnZVNlcnZpY2UuZ2V0SW1hZ2VUYWdzKGNvbnRhaW5lckRyYWZ0LmltYWdlLCBjb250YWluZXJEcmFmdC5yZWdpc3RyeSkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdC50YWdMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCd0YWcnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGNvbnRhaW5lckRyYWZ0cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnRzW2ldLm9sZEVudiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdHNbaV0ubmV3RW52ID0gW107XG4gICAgICAgICAgICAgICAgICAgIC8vIOiOt+W+l+ivpemVnOWDj+eJiOacrFxuICAgICAgICAgICAgICAgICAgICBnZXRUYWcoY29udGFpbmVyRHJhZnRzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9sZEVudiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAvLyDojrflvpfplZzlg4/ljp/mnKznmoRlbnZTZXR0aW5nc1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMCwgbDEgPSB0aGlzLmltYWdlTGlzdC5sZW5ndGg7IGogPCBsMTsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWFnZUxpc3Rbal0uaW1hZ2VOYW1lID09PSBjb250YWluZXJEcmFmdHNbaV0uaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRFbnYgPSB0aGlzLmltYWdlTGlzdFtqXS5lbnZTZXR0aW5ncztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyDliIbnprvplZzlg4/mnKzouqvnmoRpbWFnZeWSjOaWsOa3u+WKoOeahGltYWdl55qEZW52XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb250YWluZXJEcmFmdHNbaV0uZW52cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgdyA9IDAsIGwyID0gY29udGFpbmVyRHJhZnRzW2ldLmVudnMubGVuZ3RoOyB3IDwgbDI7IHcrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc09sZEVudiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGsgPSAwLCBsMyA9IG9sZEVudi5sZW5ndGg7IGsgPCBsMzsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvbGRFbnZba10ua2V5ID09PSBjb250YWluZXJEcmFmdHNbaV0uZW52c1t3XS5rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzT2xkRW52ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc09sZEVudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdHNbaV0ub2xkRW52LnB1c2goY29udGFpbmVyRHJhZnRzW2ldLmVudnNbd10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0c1tpXS5uZXdFbnYucHVzaChjb250YWluZXJEcmFmdHNbaV0uZW52c1t3XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnRzW2ldLm9sZEVudiA9IGFuZ3VsYXIuY29weShvbGRFbnYpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlTmFtZXNwYWNlKG5hbWVzcGFjZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZUlzTmV3TmFtZXNwYWNlKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNOZXdOYW1lc3BhY2UgPSAhdGhpcy5pc05ld05hbWVzcGFjZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5uYW1lc3BhY2UgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlRW52KGVudikge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmhvc3RFbnYgPSBlbnYudmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnZUZXh0ID0gZW52LnRleHQ7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy50b2dnbGVFbnYoZW52LnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZUNyZWF0b3IodXNlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRvciA9IHVzZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b2dnbGVJbWFnZVRhZyhpbmRleCwgdGFnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0c1tpbmRleF0udGFnID0gdGFnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDmt7vliqBjb250YWluZXJEcmFmdFxuICAgICAgICAgICAgYWRkSW1hZ2UoaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnYWRkSW1hZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVJbWFnZS5pbWFnZVNlcnZpY2UuZ2V0SW1hZ2VUYWdzKGltYWdlLmltYWdlTmFtZSwgaW1hZ2UucmVnaXN0cnkpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhZ3MgPSByZXMuZGF0YS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IGltYWdlLmltYWdlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpc3RyeTogaW1hZ2UucmVnaXN0cnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3B1OiAwLjUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtOiAxMDI0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZzogdGFncyAmJiB0YWdzWzBdID8gdGFnc1swXS50YWcgOiB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnTGlzdDogdGFncyB8fCBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRFbnY6IGltYWdlLmVudlNldHRpbmdzIHx8IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0VudjogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTk9ORSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygnYWRkSW1hZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOa3u+WKoOWFtuS7lumVnOWDj1xuICAgICAgICAgICAgYWRkT3RoZXJJbWFnZSgpIHtcbiAgICAgICAgICAgICAgICBsZXQgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9pbmRleC90cGwvbW9kYWwvb3RoZXJJbWFnZU1vZGFsL290aGVySW1hZ2VNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ090aGVySW1hZ2VNb2RhbEN0cicsXG4gICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKChpbWFnZUluZm8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IGltYWdlSW5mby5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cnk6IGltYWdlSW5mby5yZWdpc3RyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNwdTogMC41LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtOiAxMDI0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiBpbWFnZUluZm8udGFnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnTGlzdDogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWc6IGltYWdlSW5mby50YWdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2xkRW52OiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0VudjogW11cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVJbWFnZShpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkSW1hZ2VFbnYoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHNbaW5kZXhdLm5ld0Vudi5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZUltYWdlRW52KGNvbnRhaW5lckRyYWZ0SW5kZXgsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzW2NvbnRhaW5lckRyYWZ0SW5kZXhdLm5ld0Vudi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkTG9hZEJhbGFuY2UoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcubG9hZEJhbGFuY2VEcmFmdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHBvcnQ6ICcnLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRQb3J0OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZXh0ZXJuYWxJUHM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICBpcDogJydcbiAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZElubmVyU2VydmljZSgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHBvcnQ6ICcnLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRQb3J0OiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkRXh0ZXJuYWxJUHMoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0c1tpbmRleF0uZXh0ZXJuYWxJUHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGlwOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlRXh0ZXJuYWxJUHMobG9hZEJhbGFuY2VEcmFmdEluZGV4LCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzW2xvYWRCYWxhbmNlRHJhZnRJbmRleF0uZXh0ZXJuYWxJUHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZExvZ0RyYWZ0KCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvZ0RyYWZ0LmxvZ0l0ZW1EcmFmdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGxvZ1BhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29sbGVjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGF1dG9EZWxldGU6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVMb2dEcmFmdChpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvZ0RyYWZ0LmxvZ0l0ZW1EcmFmdHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZUFyckl0ZW0oaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ1tpdGVtXS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9ybWFydEhlYWx0aENoZWNrZXIoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLm5ldHdvcmtNb2RlID09ICdIT1NUJykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjb250YWluZXJEcmFmdCBvZiB0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ05PTkUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hhbmdlTmV0d29ya21vZGUoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLm5ldHdvcmtNb2RlID09ICdIT1NUJykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBsb2FkQmFsYW5jZURyYWZ0IG9mIHRoaXMuY29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQmFsYW5jZURyYWZ0LnBvcnQgPSBsb2FkQmFsYW5jZURyYWZ0LnRhcmdldFBvcnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFuZ2VUYXJnZXRQb3J0KGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzW2luZGV4XS5wb3J0ID0gdGhpcy5jb25maWcubG9hZEJhbGFuY2VEcmFmdHNbaW5kZXhdLnRhcmdldFBvcnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWwhuaVsOaNrue7k+aehOi9rOaNouS4uuS4juWQjuWPsOS6pOS6kueahOaVsOaNruagvOW8j1xuICAgICAgICAgICAgX2Zvcm1hcnREZXBsb3koKSB7XG4gICAgICAgICAgICAgICAgbGV0IGRlcGxveUNvbmZpZyA9IGFuZ3VsYXIuY29weSh0aGlzLmNvbmZpZyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVwbG95Q29uZmlnLm5ldHdvcmtNb2RlID09ICdIT1NUJykge1xuICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmFjY2Vzc1R5cGUgPSAnRElZJztcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmlubmVyU2VydmljZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpdE1vZGUgPT0gJ25vQWNjZXNzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmV4cG9zZVBvcnROdW0gPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmV4cG9zZVBvcnROdW0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpdE1vZGUgPT0gJ25vQWNjZXNzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmFjY2Vzc1R5cGUgPSAnRElZJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmlubmVyU2VydmljZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudmlzaXRNb2RlID09ICdpbnRlcm5hbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5hY2Nlc3NUeXBlID0gJ0s4U19TRVJWSUNFJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHNbMF0udGFyZ2V0UG9ydCA9IGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHNbMF0ucG9ydDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmFjY2Vzc1R5cGUgPSAnSzhTX1NFUlZJQ0UnO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmlubmVyU2VydmljZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGlwcyA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZEJhbGFuY2VEcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLm5vZGVMaXN0Rm9ySXBzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXBzLnB1c2gobm9kZS5pcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbG9hZEJhbGFuY2VEcmFmdCBvZiBkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2FkQmFsYW5jZURyYWZ0LnBvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkQmFsYW5jZURyYWZ0LmV4dGVybmFsSVBzID0gaXBzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRCYWxhbmNlRHJhZnRzLnB1c2gobG9hZEJhbGFuY2VEcmFmdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRCYWxhbmNlRHJhZnRzO1xuICAgICAgICAgICAgICAgIH0pKCk7XG5cblxuICAgICAgICAgICAgICAgIGlmICghZGVwbG95Q29uZmlnLnN0YXRlZnVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5sYWJlbFNlbGVjdG9ycyA9IHRoaXMubm9kZUxpc3RJbnMuZ2V0Rm9ybWFydFNlbGVjdGVkTGFiZWxzKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmhvc3RMaXN0ID0gdGhpcy5ub2RlTGlzdElucy5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmNsdXN0ZXJJZCA9IHRoaXMuY2x1c3Rlckxpc3RJbnMuY2x1c3Rlci5pZDtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNyZWF0b3IuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmNyZWF0b3IgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdG9ySWQ6IHRoaXMuY3JlYXRvci5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0b3JOYW1lOiB0aGlzLmNyZWF0b3IubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0b3JUeXBlOiB0aGlzLmNyZWF0b3IudHlwZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmxvZ0RyYWZ0ID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxvZ0l0ZW1EcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbG9nSXRlbSBvZiBkZXBsb3lDb25maWcubG9nRHJhZnQubG9nSXRlbURyYWZ0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvZ0l0ZW0ubG9nUGF0aCAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZm9ybWFydExvZ0l0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ1BhdGg6IGxvZ0l0ZW0ubG9nUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbGxlY3Q6IGxvZ0l0ZW0uYXV0b0NvbGxlY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9EZWxldGU6IGxvZ0l0ZW0uYXV0b0RlbGV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvZ0l0ZW0uYXV0b0NvbGxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWFydExvZ0l0ZW0ubG9nVG9waWMgPSBsb2dJdGVtLmxvZ1RvcGljO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0TG9nSXRlbS5wcm9jZXNzQ21kID0gbG9nSXRlbS5wcm9jZXNzQ21kO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9nSXRlbS5hdXRvRGVsZXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hcnRMb2dJdGVtLmxvZ0V4cGlyZWQgPSBsb2dJdGVtLmxvZ0V4cGlyZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ0l0ZW1EcmFmdHMucHVzaChmb3JtYXJ0TG9nSXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvZ0l0ZW1EcmFmdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nSXRlbURyYWZ0czogbG9nSXRlbURyYWZ0c1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcuY29udGFpbmVyRHJhZnRzID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlcGxveUNvbmZpZy5zdGF0ZWZ1bCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlcGxveUNvbmZpZy5jb250YWluZXJEcmFmdHM7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWRlcGxveUNvbmZpZy5jb250YWluZXJEcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsZXQgZW52Q29uZiwgY29udGFpbmVyRHJhZnRzID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFsdGhDaGVja2VyO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNvbnRhaW5lckRyYWZ0IG9mIGRlcGxveUNvbmZpZy5jb250YWluZXJEcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudkNvbmYgPSBjb250YWluZXJEcmFmdC5vbGRFbnY7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdC5oZWFsdGhDaGVja2VyID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTk9ORSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBjb250YWluZXJEcmFmdC5oZWFsdGhDaGVja2VyLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXBsb3lDb25maWcubmV0d29ya01vZGUgIT0gJ0hPU1QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhlYWx0aENoZWNrZXIudHlwZSA9PSAnVENQJyB8fCBoZWFsdGhDaGVja2VyLnR5cGUgPT0gJ0hUVFAnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXIucG9ydCA9IGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIucG9ydDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlci50aW1lb3V0ID0gY29udGFpbmVyRHJhZnQuaGVhbHRoQ2hlY2tlci50aW1lb3V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFsdGhDaGVja2VyLmRlbGF5ID0gY29udGFpbmVyRHJhZnQuaGVhbHRoQ2hlY2tlci5kZWxheTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhlYWx0aENoZWNrZXIudHlwZSA9PSAnSFRUUCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlci51cmwgPSBjb250YWluZXJEcmFmdC5oZWFsdGhDaGVja2VyLnVybDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXIudHlwZSA9ICdOT05FJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgZW52IG9mIGNvbnRhaW5lckRyYWZ0Lm5ld0Vudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbnYua2V5ICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZDb25mLnB1c2goZW52KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogY29udGFpbmVyRHJhZnQuaW1hZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cnk6IGNvbnRhaW5lckRyYWZ0LnJlZ2lzdHJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZzogY29udGFpbmVyRHJhZnQudGFnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNwdTogY29udGFpbmVyRHJhZnQuY3B1LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbTogY29udGFpbmVyRHJhZnQubWVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudnM6IGVudkNvbmYsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlcjogaGVhbHRoQ2hlY2tlclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRhaW5lckRyYWZ0cztcbiAgICAgICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlcGxveUNvbmZpZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3JlYXRlVmVyc2lvbigpIHsgLy8g5Yib5bu6dmVyc2lvblxuICAgICAgICAgICAgICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q29uZmlnID0gdGhpcy5fZm9ybWFydERlcGxveSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmVyc2lvbk9iaiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lJZDogbmV3Q29uZmlnLmRlcGxveUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0czogbmV3Q29uZmlnLmNvbnRhaW5lckRyYWZ0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dEcmFmdDogbmV3Q29uZmlnLmxvZ0RyYWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU2VsZWN0b3JzOiBuZXdDb25maWcubGFiZWxTZWxlY3RvcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGRlcGxveVNlcnZpY2UuY3JlYXRlVmVyc2lvbih2ZXJzaW9uT2JqKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5kZXBsb3ltZW50U3RhdHVzICE9ICdSVU5OSU5HJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+aWsOW7uumDqOe9sueJiOacrOaIkOWKnyzlvZPliY3nirbmgIHkuI3og73ljYfnuqfjgIInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCdjcmVhdGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlbkNvbmZpcm0oJ+aIkOWKn+aWsOW7uumDqOe9sueJiOacrO+8jOaYr+WQpue7p+e7reWNh+e6p++8nycpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLnVwZGF0ZURlcGxveSh0aGlzLmNvbmZpZy5kZXBsb3lJZCwgcmVzLmRhdGEucmVzdWx0KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+W3suaPkOS6pO+8jOato+WcqOWNh+e6p++8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgndXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+WNh+e6p+Wksei0pe+8gScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiByZXMuZGF0YS5yZXN1bHRNc2dcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgndXBkYXRlRmFpbGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgnZGlzbWlzcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfliJvlu7rniYjmnKzlpLHotKXvvIEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnY3JlYXRlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5YGc5q2iXG4gICAgICAgICAgICBzdG9wKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RlcGxveS9hY3Rpb24vc3RvcD9kZXBsb3lJZD0nICsgdGhpcy5jb25maWcuZGVwbG95SWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWJvcnQoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RlcGxveS9hY3Rpb24vYWJvcnQ/ZGVwbG95SWQ9JyArIHRoaXMuY29uZmlnLmRlcGxveUlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5omp5a65L+e8qeWuuVxuICAgICAgICAgICAgc2NhbGUoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdzY2FsZU1vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NjYWxlTW9kYWxDdHInLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRSZXBsaWNhczogKCkgPT4gdGhpcy5jb25maWcuY3VycmVudFJlcGxpY2FzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKChyZXBsaWNhcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGljYXMgPSBwYXJzZUludChyZXBsaWNhcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVwbGljYXMgPT09IHRoaXMuY29uZmlnLmN1cnJlbnRSZXBsaWNhcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCflrp7kvovkuKrmlbDml6Dlj5jljJbvvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXJsID0gcmVwbGljYXMgPiB0aGlzLmNvbmZpZy5jdXJyZW50UmVwbGljYXMgPyAnYXBpL2RlcGxveS9hY3Rpb24vc2NhbGV1cCcgOiAnYXBpL2RlcGxveS9hY3Rpb24vc2NhbGVkb3duJztcbiAgICAgICAgICAgICAgICAgICAgICAgICRodHRwLnBvc3QodXJsICsgJz9kZXBsb3lJZD0nICsgdGhpcy5jb25maWcuZGVwbG95SWQgKyAnJnJlcGxpY2FzPScgKyByZXBsaWNhcyArICcmdmVyc2lvbj0nICsgdGhpcy5jb25maWcuY3VycmVudFZlcnNpb25zWzBdLnZlcnNpb24pLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+aTjeS9nOaIkOWKn++8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzLmRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn6K+35rGC5aSx6LSl77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdyZXF1ZXN0RXJyb3InKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2Rpc21pc3MnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDmgaLlpI1cbiAgICAgICAgICAgIHJlY292ZXJWZXJzaW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmVyc2lvbk1vZGFsSW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd2ZXJzaW9uTGlzdE1vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1ZlcnNpb25MaXN0TW9kYWxDdHInLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lJbmZvOiAoKSA9PiB0aGlzLmNvbmZpZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvbk1vZGFsSW5zLnJlc3VsdC50aGVuKChzdGFydEluZm8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveVNlcnZpY2Uucm9sbGJhY2tEZXBsb3kodGhpcy5jb25maWcuZGVwbG95SWQsIHN0YXJ0SW5mby52ZXJzaW9uSWQsIHN0YXJ0SW5mby5yZXBsaWNhcykudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXMuZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnZGlzbWlzcycpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWNh+e6p1xuICAgICAgICAgICAgdXBkYXRlVmVyc2lvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZlcnNpb25Nb2RhbElucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndmVyc2lvbkxpc3RNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdWZXJzaW9uTGlzdE1vZGFsQ3RyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95SW5mbzogKCkgPT4gdGhpcy5jb25maWdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb25Nb2RhbElucy5yZXN1bHQudGhlbigoc3RhcnRJbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudFZlcnNpb25JZCA9IHRoaXMuY29uZmlnLmN1cnJlbnRWZXJzaW9uc1swXS52ZXJzaW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRWZXJzaW9uSWQgPT09IHN0YXJ0SW5mby52ZXJzaW9uSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5oKo5LiN6IO96YCJ5oup5b2T5YmN54mI5pys77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdkaXNtaXNzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRWZXJzaW9uSWQgPiBzdGFydEluZm8udmVyc2lvbklkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS5yb2xsYmFja0RlcGxveSh0aGlzLmNvbmZpZy5kZXBsb3lJZCwgc3RhcnRJbmZvLnZlcnNpb25JZCwgc3RhcnRJbmZvLnJlcGxpY2FzKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5bey5o+Q5Lqk77yM5q2j5Zyo5Zue5rua77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzLmRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCflm57mu5rlpLHotKXvvIzor7fph43or5XvvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveVNlcnZpY2UudXBkYXRlRGVwbG95KHRoaXMuY29uZmlnLmRlcGxveUlkLCBzdGFydEluZm8udmVyc2lvbklkLCBzdGFydEluZm8ucmVwbGljYXMpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCflt7Lmj5DkuqTvvIzmraPlnKjljYfnuqfvvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXMuZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5Y2H57qn5aSx6LSl77yM6K+36YeN6K+V77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2Rpc21pc3MnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDlkK/liqhcbiAgICAgICAgICAgIHN0YXJ0VmVyc2lvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZlcnNpb25Nb2RhbElucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndmVyc2lvbkxpc3RNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdWZXJzaW9uTGlzdE1vZGFsQ3RyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95SW5mbzogKCkgPT4gdGhpcy5jb25maWdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb25Nb2RhbElucy5yZXN1bHQudGhlbigoc3RhcnRJbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLnN0YXJ0RGVwbG95KHRoaXMuY29uZmlnLmRlcGxveUlkLCBzdGFydEluZm8udmVyc2lvbklkLCBzdGFydEluZm8ucmVwbGljYXMpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzLmRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2Rpc21pc3MnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDliKDpmaRcbiAgICAgICAgICAgIGRlbGV0ZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZSgnL2FwaS9kZXBsb3kvaWQvJyArIHRoaXMuY29uZmlnLmRlcGxveUlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5paw5bu6XG4gICAgICAgICAgICBjcmVhdGUoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgb2JqID0gdGhpcy5fZm9ybWFydERlcGxveSgpO1xuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gY3JlYXRlRGVwbG95KCkge1xuICAgICAgICAgICAgICAgICAgICAkaHR0cC5wb3N0KCdhcGkvZGVwbG95L2NyZWF0ZScsIGFuZ3VsYXIudG9Kc29uKG9iaikpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjcmVhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNOZXdOYW1lc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWVzcGFjZSA9IHRoaXMuY29uZmlnLm5hbWVzcGFjZTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWVzcGFjZUFyciA9IFtuYW1lc3BhY2VdO1xuICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5zZXROYW1lc3BhY2UodGhpcy5jbHVzdGVyTGlzdElucy5jbHVzdGVyLmlkLCBuYW1lc3BhY2VBcnIpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVJc05ld05hbWVzcGFjZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uYW1lc3BhY2VMaXN0LnB1c2gobmFtZXNwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTmFtZXNwYWNlKG5hbWVzcGFjZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVEZXBsb3koKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbmFtZXNwYWNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZURlcGxveSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjbGFzcyBEZXBsb3lJbnN0YW5jZUxpc3Qge1xuICAgICAgICAgICAgY29uc3RydWN0b3IoaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsQ29udGFpbmVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lckxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICAvLyDlt7LpgInkuK1pbnN0YW5jZeaVsFxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgLy8g5bey6YCJ5LitY29udGFpbmVy5pWwXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbnRhaW5lckNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoaW5zdGFuY2VzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluaXQoaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGxDb250YWluZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUxpc3QgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VzID0gaW5zdGFuY2VzIHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaW5zdGFuY2Ugb2YgaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmtleUZpbHRlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLmNvbnRhaW5lcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY29udGFpbmVyIG9mIGluc3RhbmNlLmNvbnRhaW5lcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zaG9ydENvbnRhaW5lcklkID0gY29udGFpbmVyLmNvbnRhaW5lcklkLnN1YnN0cmluZygwLCAxMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2VzO1xuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDpgInmi6nlrp7kvostLT7liIfmjaJjb250YWluZXJMaXN0XG4gICAgICAgICAgICB0b2dnbGVDb250YWluZXJMaXN0KGluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsQ29udGFpbmVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbnRhaW5lckNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lckxpc3QgPSBpbnN0YW5jZS5jb250YWluZXJzIHx8IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGNvbnRhaW5lciBvZiB0aGlzLmNvbnRhaW5lckxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWx0ZXJXaXRoS2V5KGtleXdvcmRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpbnN0YW5jZSBvZiB0aGlzLmluc3RhbmNlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmtleUZpbHRlciA9IGluc3RhbmNlLmluc3RhbmNlTmFtZS5pbmRleE9mKGtleXdvcmRzKSAhPT0gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlQ29udGFpbmVyQ2hlY2soY29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpc0FsbEhhc0NoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb250YWluZXIuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbnRhaW5lckNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmmK/lkKbkuLrlhajpgIlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNvbnRhaW5lciBvZiB0aGlzLmNvbnRhaW5lckxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRhaW5lci5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQWxsSGFzQ2hhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0FsbEhhc0NoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29udGFpbmVyQ291bnQtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWFqOmAiS/lhajkuI3pgIlcbiAgICAgICAgICAgIGNoZWNrQWxsQ29udGFpbmVyKGlzQ2hlY2tBbGxDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsQ29udGFpbmVyID0gdHlwZW9mIGlzQ2hlY2tBbGxDb250YWluZXIgPT09ICd1bmRlZmluZWQnID8gIXRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA6IGlzQ2hlY2tBbGxDb250YWluZXI7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb250YWluZXJDb3VudCA9IHRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA/IHRoaXMuY29udGFpbmVyTGlzdC5sZW5ndGggOiAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjb250YWluZXIgb2YgdGhpcy5jb250YWluZXJMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuaXNTZWxlY3RlZCA9IHRoaXMuaXNDaGVja0FsbENvbnRhaW5lcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDliIfmjaLljZXkuKrlrp7kvovnmoTpgInkuK3nirbmgIFcbiAgICAgICAgICAgIHRvZ2dsZUNoZWNrKGluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpc0FsbEhhc0NoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaYr+WQpuS4uuWFqOmAiVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaW5zdGFuY2Ugb2YgdGhpcy5pbnN0YW5jZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2Uua2V5RmlsdGVyICYmICFpbnN0YW5jZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQWxsSGFzQ2hhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0FsbEhhc0NoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWFqOmAiS/lhajkuI3pgIlcbiAgICAgICAgICAgIGNoZWNrQWxsSW5zdGFuY2UoaXNDaGVja0FsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IHR5cGVvZiBpc0NoZWNrQWxsID09PSAndW5kZWZpbmVkJyA/IHRoaXMuaXNDaGVja0FsbCA6IGlzQ2hlY2tBbGw7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpbnN0YW5jZSBvZiB0aGlzLmluc3RhbmNlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2Uua2V5RmlsdGVyICYmIHRoaXMuaXNDaGVja0FsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNsYXNzIERlcGxveUxpc3Qge1xuICAgICAgICAgICAgY29uc3RydWN0b3IoZGVwbG95TGlzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95ID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUluc3RhbmNlTGlzdElucyA9IG5ldyBEZXBsb3lJbnN0YW5jZUxpc3QoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoZGVwbG95TGlzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0KGRlcGxveUxpc3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3QgPSBkZXBsb3lMaXN0IHx8IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlRGVwbG95KGRlcGxveUlkLCBkZXBsb3lOYW1lLCBuYW1lc3BhY2UsIG5vdE5lZWRJbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkZXBsb3lJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3kuaWQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3kubmFtZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveS5uYW1lc3BhY2UgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lJbnN0YW5jZUxpc3RJbnMuaW5pdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveS5pZCA9IGRlcGxveUlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3kubmFtZSA9IGRlcGxveU5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveS5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5vdE5lZWRJbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLmdldEluc3RhbmNlcyhkZXBsb3lJZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95SW5zdGFuY2VMaXN0SW5zLmluaXQocmVzLmRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQHBhcmFtIGhvc3RFbnY6ICdURVNUJyBvciAnUFJPRCdcbiAgICAgICAgICAgIGZpbHRlckRlcGxveShjbHVzdGVyTmFtZSwgaG9zdEVudikge1xuICAgICAgICAgICAgICAgIGxldCBkZXBsb3lJZCwgZGVwbG95TmFtZSwgbmFtZXNwYWNlO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGRlcGxveSBvZiB0aGlzLmRlcGxveUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95LmNsdXN0ZXJGaWx0ZXIgPSBjbHVzdGVyTmFtZSA/IGRlcGxveS5jbHVzdGVyTmFtZSA9PT0gY2x1c3Rlck5hbWUgOiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBkZXBsb3kuaG9zdEZpbHRlciA9IGhvc3RFbnYgPyBkZXBsb3kuaG9zdEVudiA9PT0gaG9zdEVudiA6IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIOmAieS4reesrOS4gOS4quespuWQiOadoeS7tueahOmDqOe9suW5tuWIh+aNouWIsOivpemDqOe9slxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRlcGxveUlkID09PSAndW5kZWZpbmVkJyAmJiBkZXBsb3kuY2x1c3RlckZpbHRlciAmJiBkZXBsb3kuaG9zdEZpbHRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95SWQgPSBkZXBsb3kuZGVwbG95SWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lOYW1lID0gZGVwbG95LmRlcGxveU5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2UgPSBkZXBsb3kubmFtZXNwYWNlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBkZXBsb3lJZCA9PT0gJ3VuZGVmaW5lZCcgPyB0aGlzLnRvZ2dsZURlcGxveSgpIDogdGhpcy50b2dnbGVEZXBsb3koZGVwbG95SWQsIGRlcGxveU5hbWUsIG5hbWVzcGFjZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDojrflvpflrp7kvotcbiAgICAgICAgY29uc3QgZ2V0SW5zdGFuY2UgPSAkZG9tZU1vZGVsLmluc3RhbmNlc0NyZWF0b3Ioe1xuICAgICAgICAgICAgRGVwbG95TGlzdDogRGVwbG95TGlzdCxcbiAgICAgICAgICAgIERlcGxveTogRGVwbG95XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVwbG95U2VydmljZTogZGVwbG95U2VydmljZSxcbiAgICAgICAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZVxuICAgICAgICB9O1xuICAgIH1cbiAgICBEZXBsb3lTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJywgJyRkb21lQ2x1c3RlcicsICckZG9tZUltYWdlJywgJyRkb21lUHVibGljJywgJyRkb21lTW9kZWwnLCAnJG1vZGFsJywgJyRxJywgJyR1dGlsJ107XG4gICAgZGVwbG95TW9kdWxlLmZhY3RvcnkoJyRkb21lRGVwbG95JywgRGVwbG95U2VydmljZSk7XG4gICAgd2luZG93LmRlcGxveU1vZHVsZSA9IGRlcGxveU1vZHVsZTtcbn0pKHdpbmRvdyk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
