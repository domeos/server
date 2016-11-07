'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @author  ChandraLee
 * @description  部署模块
 */

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
                this.hostEnv = 'TEST';
                this.config = {};
                this.defaultVersionString = {
                    'YAML': 'containers:\n- image: \"pub.domeos.org/registry:2.3\"\n  name: \"test-container\"\n  volumeMounts:\n  - mountPath: \"/test-hostpath\"\n    name: \"test-volume\"\nvolumes:\n- hostPath:\n    path: \"/opt/scs\"\n  name: \"test-volume\"\n',
                    'JSON': '{\n  \"containers\": [{\n    \"image\": \"pub.domeos.org/registry:2.3\",\n    \"name\": \"test-container\",\n    \"volumeMounts\": [{\n      \"mountPath\": \"/test-hostpath\",\n      \"name\": \"test-volume\"\n    }]\n  }],\n  \"volumes\": [{\n    \"hostPath\": {\n      \"path\": \"/opt/scs\"\n    },\n    \"name\": \"test-volume\"\n  }]\n}\n'
                };
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

                    if (!deployConfig.versionType) {
                        deployConfig.versionType = 'CUSTOM';
                    }
                    if (deployConfig.versionType === 'YAML' || deployConfig.versionType === 'JSON') {
                        deployConfig.versionString = deployConfig.versionString || {};
                        deployConfig.versionString.podSpec = deployConfig.versionString.padSpec || '';
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

                    console.log(this.config.containerDrafts);
                    var _iteratorNormalCompletion6 = true;
                    var _didIteratorError6 = false;
                    var _iteratorError6 = undefined;

                    try {
                        for (var _iterator6 = this.config.containerDrafts[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            var image = _step6.value;

                            this.addLogDraft(image);
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
                    /*
                    if (this.logConfig !== 1) {
                        this.config.logDraft = {
                            logItemDrafts: [{
                                logPath: '',
                                autoCollect: false,
                                autoDelete: false
                            }]
                        };
                    }
                    */

                    this.loadingIns.startLoading('nodelist');

                    nodeService.getNodeList(clusterId).then(function (res) {
                        var nodeList = res.data.result || [];
                        _this5.nodeListForIps = angular.copy(nodeList);
                        for (var _i = 0; _i < _this5.nodeListForIps.length; _i++) {
                            var node = _this5.nodeListForIps[_i];
                            if (node.status == 'Ready') {
                                var ips = _this5.config.loadBalanceDrafts[0].externalIPs;
                                var _iteratorNormalCompletion7 = true;
                                var _didIteratorError7 = false;
                                var _iteratorError7 = undefined;

                                try {
                                    for (var _iterator7 = ips[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                        var ip = _step7.value;

                                        if (ip === node.ip) {
                                            node.isSelected = true;
                                            break;
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
                    var _iteratorNormalCompletion8 = true;
                    var _didIteratorError8 = false;
                    var _iteratorError8 = undefined;

                    try {
                        for (var _iterator8 = labelSelectors[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            var labelSelector = _step8.value;

                            var labelName = labelSelector.name;
                            if (labelName != 'kubernetes.io/hostname' && labelName != 'TESTENV' && labelName != 'PRODENV') {
                                this.nodeListIns.toggleLabel(labelName, true);
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
                }
            }, {
                key: 'validIps',
                value: function validIps() {
                    if (this.visitMode === 'foreign') {
                        var _iteratorNormalCompletion9 = true;
                        var _didIteratorError9 = false;
                        var _iteratorError9 = undefined;

                        try {
                            for (var _iterator9 = this.nodeListForIps[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                var node = _step9.value;

                                if (node.isSelected) {
                                    this.valid.ips = true;
                                    return;
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
                            },
                            imagePullPolicy: 'Always',
                            logItemDrafts: [{
                                logPath: '',
                                autoCollect: false,
                                autoDelete: false
                            }]
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
                value: function addLogDraft(image) {
                    image.logItemDrafts = image.logItemDrafts || [];
                    image.logItemDrafts.push({
                        logPath: '',
                        autoCollect: false,
                        autoDelete: false
                    });
                }
            }, {
                key: 'deleteLogDraft',
                value: function deleteLogDraft(image, logDraft) {
                    image.logItemDrafts.splice(image.logItemDrafts.indexOf(logDraft), 1);
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
                        var _iteratorNormalCompletion10 = true;
                        var _didIteratorError10 = false;
                        var _iteratorError10 = undefined;

                        try {
                            for (var _iterator10 = this.config.containerDrafts[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                                var containerDraft = _step10.value;

                                containerDraft.healthChecker = {
                                    type: 'NONE'
                                };
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
                key: 'changeNetworkmode',
                value: function changeNetworkmode() {
                    if (this.config.networkMode == 'HOST') {
                        var _iteratorNormalCompletion11 = true;
                        var _didIteratorError11 = false;
                        var _iteratorError11 = undefined;

                        try {
                            for (var _iterator11 = this.config.loadBalanceDrafts[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                                var loadBalanceDraft = _step11.value;

                                loadBalanceDraft.port = loadBalanceDraft.targetPort;
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
                        var _iteratorNormalCompletion12 = true;
                        var _didIteratorError12 = false;
                        var _iteratorError12 = undefined;

                        try {
                            for (var _iterator12 = _this10.nodeListForIps[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                                var node = _step12.value;

                                if (node.isSelected) {
                                    ips.push(node.ip);
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

                        var _iteratorNormalCompletion13 = true;
                        var _didIteratorError13 = false;
                        var _iteratorError13 = undefined;

                        try {
                            for (var _iterator13 = deployConfig.loadBalanceDrafts[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                                var loadBalanceDraft = _step13.value;

                                if (loadBalanceDraft.port) {
                                    loadBalanceDraft.externalIPs = ips;
                                    loadBalanceDrafts.push(loadBalanceDraft);
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

                    if (deployConfig.versionType === 'CUSTOM') {
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

                                    var logItemDrafts = function (preFormattedlogDrafts) {
                                        var logItemDrafts = [];
                                        var _iteratorNormalCompletion16 = true;
                                        var _didIteratorError16 = false;
                                        var _iteratorError16 = undefined;

                                        try {
                                            for (var _iterator16 = preFormattedlogDrafts[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                                                var logItem = _step16.value;

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

                                        if (logItemDrafts.length === 0) {
                                            return null;
                                        } else {
                                            return logItemDrafts;
                                        }
                                    }(containerDraft.logItemDrafts);

                                    containerDrafts.push({
                                        image: containerDraft.image,
                                        registry: containerDraft.registry,
                                        tag: containerDraft.tag,
                                        cpu: containerDraft.cpu,
                                        mem: containerDraft.mem,
                                        logItemDrafts: logItemDrafts,
                                        envs: envConf,
                                        healthChecker: healthChecker,
                                        imagePullPolicy: containerDraft.imagePullPolicy
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
                    } else if (deployConfig.versionType === 'JSON' || deployConfig.versionType === 'YAML') {
                        if (deployConfig.versionString) {
                            deployConfig.podSpecStr = deployConfig.versionString.podSpecStr;
                            delete deployConfig.versionString;
                        }
                    }

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
                        labelSelectors: newConfig.labelSelectors,
                        versionType: newConfig.versionType,
                        podSpecStr: newConfig.podSpecStr
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
            }, {
                key: 'getDeployStr',
                value: function getDeployStr(callback) {
                    var obj = this._formartDeploy();
                    obj.podSpecStr = '';

                    return $http.post('api/deploy/deploymentstr', angular.toJson(obj));
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
                        var _iteratorNormalCompletion17 = true;
                        var _didIteratorError17 = false;
                        var _iteratorError17 = undefined;

                        try {
                            for (var _iterator17 = instances[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                                var instance = _step17.value;

                                instance.isSelected = false;
                                instance.keyFilter = true;
                                if (instance.containers) {
                                    var _iteratorNormalCompletion18 = true;
                                    var _didIteratorError18 = false;
                                    var _iteratorError18 = undefined;

                                    try {
                                        for (var _iterator18 = instance.containers[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                                            var container = _step18.value;

                                            container.shortContainerId = container.containerId.substring(0, 12);
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
                    var _iteratorNormalCompletion19 = true;
                    var _didIteratorError19 = false;
                    var _iteratorError19 = undefined;

                    try {
                        for (var _iterator19 = this.containerList[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
                            var container = _step19.value;

                            container.isSelected = false;
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
                key: 'filterWithKey',
                value: function filterWithKey(keywords) {
                    this.isCheckAll = false;
                    this.selectedCount = 0;
                    var _iteratorNormalCompletion20 = true;
                    var _didIteratorError20 = false;
                    var _iteratorError20 = undefined;

                    try {
                        for (var _iterator20 = this.instanceList[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
                            var instance = _step20.value;

                            instance.isSelected = false;
                            instance.keyFilter = instance.instanceName.indexOf(keywords) !== -1;
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
                }
            }, {
                key: 'toggleContainerCheck',
                value: function toggleContainerCheck(container) {
                    var isAllHasChange = true;
                    if (container.isSelected) {
                        this.selectedContainerCount++;
                        // 是否为全选
                        var _iteratorNormalCompletion21 = true;
                        var _didIteratorError21 = false;
                        var _iteratorError21 = undefined;

                        try {
                            for (var _iterator21 = this.containerList[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
                                var _container = _step21.value;

                                if (!_container.isSelected) {
                                    isAllHasChange = false;
                                    break;
                                }
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
                    var _iteratorNormalCompletion22 = true;
                    var _didIteratorError22 = false;
                    var _iteratorError22 = undefined;

                    try {
                        for (var _iterator22 = this.containerList[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
                            var container = _step22.value;

                            container.isSelected = this.isCheckAllContainer;
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
                }
                // 切换单个实例的选中状态

            }, {
                key: 'toggleCheck',
                value: function toggleCheck(instance) {
                    var isAllHasChange = true;
                    if (instance.isSelected) {
                        this.selectedCount++;
                        // 是否为全选
                        var _iteratorNormalCompletion23 = true;
                        var _didIteratorError23 = false;
                        var _iteratorError23 = undefined;

                        try {
                            for (var _iterator23 = this.instanceList[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
                                var _instance = _step23.value;

                                if (_instance.keyFilter && !_instance.isSelected) {
                                    isAllHasChange = false;
                                    break;
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
                    var _iteratorNormalCompletion24 = true;
                    var _didIteratorError24 = false;
                    var _iteratorError24 = undefined;

                    try {
                        for (var _iterator24 = this.instanceList[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
                            var instance = _step24.value;

                            if (instance.keyFilter && this.isCheckAll) {
                                instance.isSelected = true;
                                this.selectedCount++;
                            } else {
                                instance.isSelected = false;
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
                    var _iteratorNormalCompletion25 = true;
                    var _didIteratorError25 = false;
                    var _iteratorError25 = undefined;

                    try {
                        for (var _iterator25 = this.deployList[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
                            var deploy = _step25.value;

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
                        _didIteratorError25 = true;
                        _iteratorError25 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion25 && _iterator25.return) {
                                _iterator25.return();
                            }
                        } finally {
                            if (_didIteratorError25) {
                                throw _iteratorError25;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9kZXBsb3lNb2R1bGUvZGVwbG95TW9kdWxlLmVzIl0sIm5hbWVzIjpbIndpbmRvdyIsInVuZGVmaW5lZCIsImRlcGxveU1vZHVsZSIsImFuZ3VsYXIiLCJtb2R1bGUiLCJEZXBsb3lTZXJ2aWNlIiwiJGh0dHAiLCIkZG9tZUNsdXN0ZXIiLCIkZG9tZUltYWdlIiwiJGRvbWVQdWJsaWMiLCIkZG9tZU1vZGVsIiwiJG1vZGFsIiwiJHEiLCIkdXRpbCIsIm5vZGVTZXJ2aWNlIiwiZ2V0SW5zdGFuY2UiLCJfdXJsIiwiX3ZlcnNpb25VcmwiLCJnZXRMaXN0IiwiZ2V0IiwiZ2V0U2luZ2xlIiwiZGVwbG95SWQiLCJnZXRFdmVudHMiLCJnZXRJbnN0YW5jZXMiLCJnZXRWZXJzaW9ucyIsImdldFNpbmdsZVZlcnNpb24iLCJ2ZXJzaW9uSWQiLCJjcmVhdGVWZXJzaW9uIiwidmVyc2lvbiIsInBvc3QiLCJ0b0pzb24iLCJyb2xsYmFja0RlcGxveSIsInJlcGxpY2FzIiwidXBkYXRlRGVwbG95Iiwic3RhcnREZXBsb3kiLCJkZXBsb3lTZXJ2aWNlIiwiRGVwbG95IiwiZGVwbG95Q29uZmlnIiwibmFtZXNwYWNlTGlzdCIsImlzTmV3TmFtZXNwYWNlIiwiaW1hZ2VMaXN0IiwiZW52TGlzdCIsInZhbHVlIiwidGV4dCIsInZhbGlkIiwiaXBzIiwibG9nQ29uZmlnIiwiZW52VGV4dCIsInZlcnNpb25MaXN0Iiwibm9kZUxpc3RJbnMiLCJub2RlTGlzdEZvcklwcyIsImNsdXN0ZXJMaXN0SW5zIiwibG9hZGluZ0lucyIsImdldExvYWRpbmdJbnN0YW5jZSIsImNyZWF0b3IiLCJpZCIsIm5hbWUiLCJ0eXBlIiwidmlzaXRNb2RlIiwiaG9zdEVudiIsImNvbmZpZyIsImRlZmF1bHRWZXJzaW9uU3RyaW5nIiwiaW5pdCIsImN1cnJlbnRWZXJzaW9ucyIsImNyZWF0ZVRpbWUiLCJpc09iamVjdCIsInZlcnNpb25UeXBlIiwidmVyc2lvblN0cmluZyIsInBvZFNwZWMiLCJwYWRTcGVjIiwiaXNBcnJheSIsImxvYWRCYWxhbmNlRHJhZnRzIiwiaW5uZXJTZXJ2aWNlRHJhZnRzIiwibG9hZEJhbGFuY2VEcmFmdCIsImV4dGVybmFsSVBzIiwiaXAiLCJwdXNoIiwiYWRkTG9hZEJhbGFuY2UiLCJhZGRJbm5lclNlcnZpY2UiLCJuZXR3b3JrTW9kZSIsImFjY2Vzc1R5cGUiLCJ0aGVuIiwicmVzIiwiZGF0YSIsInJlc3VsdCIsImxlbmd0aCIsInRvZ2dsZVZlcnNpb24iLCJpIiwibCIsImluaXREYXRhIiwiY29udGFpbmVyRHJhZnRzIiwibGFiZWxTZWxlY3RvcnMiLCJpbml0U2VsZWN0ZWRMYWJlbHMiLCJ0b2dnbGVFbnYiLCJlbnYiLCJzdGF0ZWZ1bCIsInN0YXJ0TG9hZGluZyIsImltYWdlU2VydmljZSIsImdldFByb2plY3RJbWFnZXMiLCJpbWFnZSIsImVudnMiLCJlbnZTZXR0aW5ncyIsImtleSIsImRlc2NyaXB0aW9uIiwiZm9ybWFydENvbnRhaW5lckRyYWZ0cyIsImZpbmFsbHkiLCJmaW5pc2hMb2FkaW5nIiwiY29uc29sZSIsImxvZyIsImFkZExvZ0RyYWZ0IiwiZ2V0RGF0YSIsInRvZ2dsZUNsdXN0ZXIiLCJuZXdDb25maWciLCJsYXN0VXBkYXRlVGltZSIsImRlcGxveW1lbnRTdGF0dXMiLCJjdXJyZW50UmVwbGljYXMiLCJpbmRleCIsImNsdXN0ZXJJZCIsImNsdXN0ZXJMaXN0IiwiY2x1c3RlciIsImdldE5vZGVMaXN0Iiwibm9kZUxpc3QiLCJjb3B5Iiwibm9kZSIsInN0YXR1cyIsImlzU2VsZWN0ZWQiLCJzcGxpY2UiLCJ0b2dnbGVOb2RlQ2hlY2siLCJnZXROYW1lc3BhY2UiLCJuYW1lc3BhY2UiLCJpbml0TGFiZWxzSW5mbyIsImxhYmVsU2VsZWN0b3IiLCJsYWJlbE5hbWUiLCJ0b2dnbGVMYWJlbCIsIiQiLCJleHRlbmQiLCJnZXRUYWciLCJjb250YWluZXJEcmFmdCIsImdldEltYWdlVGFncyIsInJlZ2lzdHJ5IiwidGFnTGlzdCIsIm9sZEVudiIsIm5ld0VudiIsImoiLCJsMSIsImltYWdlTmFtZSIsInciLCJsMiIsImlzT2xkRW52IiwiayIsImwzIiwidXNlciIsInRhZyIsInRhZ3MiLCJjcHUiLCJtZW0iLCJoZWFsdGhDaGVja2VyIiwiaW1hZ2VQdWxsUG9saWN5IiwibG9nSXRlbURyYWZ0cyIsImxvZ1BhdGgiLCJhdXRvQ29sbGVjdCIsImF1dG9EZWxldGUiLCJtb2RhbEluc3RhbmNlIiwib3BlbiIsImFuaW1hdGlvbiIsInRlbXBsYXRlVXJsIiwiY29udHJvbGxlciIsInNpemUiLCJpbWFnZUluZm8iLCJjb250YWluZXJEcmFmdEluZGV4IiwicG9ydCIsInRhcmdldFBvcnQiLCJsb2FkQmFsYW5jZURyYWZ0SW5kZXgiLCJsb2dEcmFmdCIsImluZGV4T2YiLCJpdGVtIiwiZXhwb3NlUG9ydE51bSIsImdldEZvcm1hcnRTZWxlY3RlZExhYmVscyIsImhvc3RMaXN0IiwiZ2V0U2VsZWN0ZWROb2RlcyIsImNyZWF0b3JJZCIsImNyZWF0b3JOYW1lIiwiY3JlYXRvclR5cGUiLCJlbnZDb25mIiwidGltZW91dCIsImRlbGF5IiwidXJsIiwicHJlRm9ybWF0dGVkbG9nRHJhZnRzIiwibG9nSXRlbSIsImZvcm1hcnRMb2dJdGVtIiwibG9nVG9waWMiLCJwcm9jZXNzQ21kIiwibG9nRXhwaXJlZCIsInBvZFNwZWNTdHIiLCJkZWZlcnJlZCIsImRlZmVyIiwiX2Zvcm1hcnREZXBsb3kiLCJ2ZXJzaW9uT2JqIiwib3BlblByb21wdCIsInJlc29sdmUiLCJvcGVuQ29uZmlybSIsIm9wZW5XYXJuaW5nIiwidGl0bGUiLCJtc2ciLCJyZXN1bHRNc2ciLCJyZWplY3QiLCJwcm9taXNlIiwib2xkUmVwbGljYXMiLCJwYXJzZUludCIsInZlcnNpb25Nb2RhbElucyIsImRlcGxveUluZm8iLCJzdGFydEluZm8iLCJjdXJyZW50VmVyc2lvbklkIiwiZGVsZXRlIiwib2JqIiwiY3JlYXRlRGVwbG95IiwibmFtZXNwYWNlQXJyIiwic2V0TmFtZXNwYWNlIiwidG9nZ2xlSXNOZXdOYW1lc3BhY2UiLCJ0b2dnbGVOYW1lc3BhY2UiLCJjYWxsYmFjayIsIkRlcGxveUluc3RhbmNlTGlzdCIsImluc3RhbmNlcyIsImlzQ2hlY2tBbGwiLCJpc0NoZWNrQWxsQ29udGFpbmVyIiwiaW5zdGFuY2VMaXN0IiwiY29udGFpbmVyTGlzdCIsInNlbGVjdGVkQ291bnQiLCJzZWxlY3RlZENvbnRhaW5lckNvdW50IiwiaW5zdGFuY2UiLCJrZXlGaWx0ZXIiLCJjb250YWluZXJzIiwiY29udGFpbmVyIiwic2hvcnRDb250YWluZXJJZCIsImNvbnRhaW5lcklkIiwic3Vic3RyaW5nIiwia2V5d29yZHMiLCJpbnN0YW5jZU5hbWUiLCJpc0FsbEhhc0NoYW5nZSIsIkRlcGxveUxpc3QiLCJkZXBsb3lMaXN0IiwiZGVwbG95IiwiaXNMb2FkaW5nIiwiZGVwbG95SW5zdGFuY2VMaXN0SW5zIiwiZGVwbG95TmFtZSIsIm5vdE5lZWRJbnN0YW5jZXMiLCJjbHVzdGVyTmFtZSIsImNsdXN0ZXJGaWx0ZXIiLCJob3N0RmlsdGVyIiwidG9nZ2xlRGVwbG95IiwiaW5zdGFuY2VzQ3JlYXRvciIsIiRpbmplY3QiLCJmYWN0b3J5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7QUFLQSxDQUFDLFVBQUNBLE1BQUQsRUFBU0MsU0FBVCxFQUF1QjtBQUNwQjs7QUFDQSxRQUFJQyxlQUFlQyxRQUFRQyxNQUFSLENBQWUsY0FBZixFQUErQixFQUEvQixDQUFuQjs7QUFFQSxhQUFTQyxhQUFULENBQXVCQyxLQUF2QixFQUE4QkMsWUFBOUIsRUFBNENDLFVBQTVDLEVBQXdEQyxXQUF4RCxFQUFxRUMsVUFBckUsRUFBaUZDLE1BQWpGLEVBQXlGQyxFQUF6RixFQUE2RkMsS0FBN0YsRUFBb0c7QUFDaEcsWUFBTUMsY0FBY1AsYUFBYVEsV0FBYixDQUF5QixhQUF6QixDQUFwQjtBQUNBLFlBQU1WLGdCQUFnQixTQUFoQkEsYUFBZ0IsR0FBWTtBQUM5QixnQkFBTVcsT0FBTyxhQUFiO0FBQ0EsZ0JBQU1DLGNBQWMsY0FBcEI7QUFDQSxpQkFBS0MsT0FBTCxHQUFlO0FBQUEsdUJBQU1aLE1BQU1hLEdBQU4sQ0FBYUgsSUFBYixXQUFOO0FBQUEsYUFBZjtBQUNBLGlCQUFLSSxTQUFMLEdBQWlCLFVBQUNDLFFBQUQ7QUFBQSx1QkFBY2YsTUFBTWEsR0FBTixDQUFhSCxJQUFiLFlBQXdCSyxRQUF4QixDQUFkO0FBQUEsYUFBakI7QUFDQSxpQkFBS0MsU0FBTCxHQUFpQixVQUFDRCxRQUFEO0FBQUEsdUJBQWNmLE1BQU1hLEdBQU4sQ0FBYUgsSUFBYiw2QkFBeUNLLFFBQXpDLENBQWQ7QUFBQSxhQUFqQjtBQUNBLGlCQUFLRSxZQUFMLEdBQW9CLFVBQUNGLFFBQUQ7QUFBQSx1QkFBY2YsTUFBTWEsR0FBTixDQUFhSCxJQUFiLFNBQXFCSyxRQUFyQixlQUFkO0FBQUEsYUFBcEI7QUFDQSxpQkFBS0csV0FBTCxHQUFtQixVQUFDSCxRQUFEO0FBQUEsdUJBQWNmLE1BQU1hLEdBQU4sQ0FBYUYsV0FBYix1QkFBMENJLFFBQTFDLENBQWQ7QUFBQSxhQUFuQjtBQUNBLGlCQUFLSSxnQkFBTCxHQUF3QixVQUFDSixRQUFELEVBQVdLLFNBQVg7QUFBQSx1QkFBeUJwQixNQUFNYSxHQUFOLENBQWFGLFdBQWIsWUFBK0JJLFFBQS9CLFNBQTJDSyxTQUEzQyxDQUF6QjtBQUFBLGFBQXhCO0FBQ0EsaUJBQUtDLGFBQUwsR0FBcUIsVUFBQ0MsT0FBRDtBQUFBLHVCQUFhdEIsTUFBTXVCLElBQU4sQ0FBY1osV0FBZCx5QkFBNkNXLFFBQVFQLFFBQXJELEVBQWlFbEIsUUFBUTJCLE1BQVIsQ0FBZUYsT0FBZixDQUFqRSxDQUFiO0FBQUEsYUFBckI7QUFDQSxpQkFBS0csY0FBTCxHQUFzQixVQUFDVixRQUFELEVBQVdLLFNBQVgsRUFBc0JNLFFBQXRCLEVBQW1DO0FBQ3JELG9CQUFJQSxRQUFKLEVBQWM7QUFDViwyQkFBTzFCLE1BQU11QixJQUFOLDJDQUFtRFIsUUFBbkQsaUJBQXVFSyxTQUF2RSxrQkFBNkZNLFFBQTdGLENBQVA7QUFDSCxpQkFGRCxNQUVPO0FBQ0gsMkJBQU8xQixNQUFNdUIsSUFBTiwyQ0FBbURSLFFBQW5ELGlCQUF1RUssU0FBdkUsQ0FBUDtBQUNIO0FBQ0osYUFORDtBQU9BLGlCQUFLTyxZQUFMLEdBQW9CLFVBQUNaLFFBQUQsRUFBV0ssU0FBWCxFQUFzQk0sUUFBdEIsRUFBbUM7QUFDbkQsb0JBQUlBLFFBQUosRUFBYztBQUNWLDJCQUFPMUIsTUFBTXVCLElBQU4seUNBQWlEUixRQUFqRCxpQkFBcUVLLFNBQXJFLGtCQUEyRk0sUUFBM0YsQ0FBUDtBQUNILGlCQUZELE1BRU87QUFDSCwyQkFBTzFCLE1BQU11QixJQUFOLHlDQUFpRFIsUUFBakQsaUJBQXFFSyxTQUFyRSxDQUFQO0FBQ0g7QUFDSixhQU5EO0FBT0EsaUJBQUtRLFdBQUwsR0FBbUIsVUFBQ2IsUUFBRCxFQUFXSyxTQUFYLEVBQXNCTSxRQUF0QixFQUFtQztBQUNsRCxvQkFBSUEsUUFBSixFQUFjO0FBQ1YsMkJBQU8xQixNQUFNdUIsSUFBTix3Q0FBZ0RSLFFBQWhELGlCQUFvRUssU0FBcEUsa0JBQTBGTSxRQUExRixDQUFQO0FBQ0gsaUJBRkQsTUFFTztBQUNILDJCQUFPMUIsTUFBTXVCLElBQU4sd0NBQWdEUixRQUFoRCxpQkFBb0VLLFNBQXBFLENBQVA7QUFDSDtBQUNKLGFBTkQ7QUFPSCxTQS9CRDtBQWdDQSxZQUFNUyxnQkFBZ0IsSUFBSTlCLGFBQUosRUFBdEI7O0FBbENnRyxZQXFDMUYrQixNQXJDMEY7QUFzQzVGLDRCQUFZQyxZQUFaLEVBQTBCO0FBQUE7O0FBQ3RCLHFCQUFLQyxhQUFMLEdBQXFCLEVBQXJCO0FBQ0E7QUFDQSxxQkFBS0MsY0FBTCxHQUFzQixLQUF0QjtBQUNBLHFCQUFLQyxTQUFMLEdBQWlCLElBQWpCO0FBQ0EscUJBQUtDLE9BQUwsR0FBZSxDQUFDO0FBQ1pDLDJCQUFPLE1BREs7QUFFWkMsMEJBQU07QUFGTSxpQkFBRCxFQUdaO0FBQ0NELDJCQUFPLE1BRFI7QUFFQ0MsMEJBQU07QUFGUCxpQkFIWSxDQUFmO0FBT0E7QUFDQSxxQkFBS0MsS0FBTCxHQUFhO0FBQ1Q7QUFDQUMseUJBQUs7QUFGSSxpQkFBYjtBQUlBO0FBQ0EscUJBQUtDLFNBQUwsR0FBaUIsSUFBakI7QUFDQSxxQkFBS0MsT0FBTCxHQUFlLFNBQWY7QUFDQSxxQkFBS0MsV0FBTCxHQUFtQixJQUFuQjtBQUNBLHFCQUFLQyxXQUFMLEdBQW1CMUMsYUFBYVEsV0FBYixDQUF5QixVQUF6QixDQUFuQjtBQUNBLHFCQUFLbUMsY0FBTCxHQUFzQixFQUF0QjtBQUNBLHFCQUFLQyxjQUFMLEdBQXNCNUMsYUFBYVEsV0FBYixDQUF5QixhQUF6QixDQUF0QjtBQUNBLHFCQUFLcUMsVUFBTCxHQUFrQjNDLFlBQVk0QyxrQkFBWixFQUFsQjtBQUNBLHFCQUFLQyxPQUFMLEdBQWU7QUFDWEMsd0JBQUksSUFETztBQUVYQywwQkFBTSxJQUZLO0FBR1hDLDBCQUFNO0FBSEssaUJBQWY7QUFLQSxxQkFBS0MsU0FBTCxHQUFpQixVQUFqQjtBQUNBLHFCQUFLQyxPQUFMLEdBQWUsTUFBZjtBQUNBLHFCQUFLQyxNQUFMLEdBQWMsRUFBZDtBQUNBLHFCQUFLQyxvQkFBTCxHQUE0QjtBQUMxQiw0QkFBUSw0T0FEa0I7QUFFMUIsNEJBQVE7QUFGa0IsaUJBQTVCO0FBSUEscUJBQUtDLElBQUwsQ0FBVXpCLFlBQVY7QUFDSDs7QUE1RTJGO0FBQUE7QUFBQSxxQ0E2RXZGQSxZQTdFdUYsRUE2RXpFO0FBQUE7O0FBQ1gsd0JBQUkwQix3QkFBSjtBQUFBLHdCQUFxQlIsV0FBckI7QUFBQSx3QkFDSVMsYUFBYSxDQUFDLENBRGxCOztBQUdBLHdCQUFJLENBQUNuRCxNQUFNb0QsUUFBTixDQUFlNUIsWUFBZixDQUFMLEVBQW1DO0FBQy9CQSx1Q0FBZSxFQUFmO0FBQ0g7O0FBRUQsd0JBQUksQ0FBQ0EsYUFBYTZCLFdBQWxCLEVBQStCO0FBQzNCN0IscUNBQWE2QixXQUFiLEdBQTJCLFFBQTNCO0FBQ0g7QUFDRCx3QkFBSTdCLGFBQWE2QixXQUFiLEtBQTZCLE1BQTdCLElBQXVDN0IsYUFBYTZCLFdBQWIsS0FBNkIsTUFBeEUsRUFBZ0Y7QUFDNUU3QixxQ0FBYThCLGFBQWIsR0FBNkI5QixhQUFhOEIsYUFBYixJQUE4QixFQUEzRDtBQUNBOUIscUNBQWE4QixhQUFiLENBQTJCQyxPQUEzQixHQUFxQy9CLGFBQWE4QixhQUFiLENBQTJCRSxPQUEzQixJQUFzQyxFQUEzRTtBQUNIOztBQUVELHdCQUFJLE9BQU9oQyxhQUFhTCxRQUFwQixLQUFpQyxRQUFyQyxFQUErQztBQUMzQ0sscUNBQWFMLFFBQWIsR0FBd0IsQ0FBeEI7QUFDSDtBQUNEO0FBQ0Esd0JBQUksQ0FBQ25CLE1BQU15RCxPQUFOLENBQWNqQyxhQUFha0MsaUJBQTNCLENBQUwsRUFBb0Q7QUFDaERsQyxxQ0FBYWtDLGlCQUFiLEdBQWlDLEVBQWpDO0FBQ0g7QUFDRDtBQUNBLHdCQUFJLENBQUMxRCxNQUFNeUQsT0FBTixDQUFjakMsYUFBYW1DLGtCQUEzQixDQUFMLEVBQXFEO0FBQ2pEbkMscUNBQWFtQyxrQkFBYixHQUFrQyxFQUFsQztBQUNIO0FBQ0Qsd0JBQUksQ0FBQzNELE1BQU15RCxPQUFOLENBQWNqQyxhQUFhMEIsZUFBM0IsQ0FBTCxFQUFrRDtBQUM5QzFCLHFDQUFhMEIsZUFBYixHQUErQixFQUEvQjtBQUNIO0FBQ0Q7QUE5Qlc7QUFBQTtBQUFBOztBQUFBO0FBK0JYLDZDQUE2QjFCLGFBQWFrQyxpQkFBMUMsOEhBQTZEO0FBQUEsZ0NBQXBERSxnQkFBb0Q7O0FBQ3pELGdDQUFJLENBQUNBLGlCQUFpQkMsV0FBdEIsRUFBbUM7QUFDL0JELGlEQUFpQkMsV0FBakIsR0FBK0IsRUFBL0I7QUFDSDtBQUNELGdDQUFJQSxjQUFjLEVBQWxCO0FBSnlEO0FBQUE7QUFBQTs7QUFBQTtBQUt6RCxzREFBZUQsaUJBQWlCQyxXQUFoQyxtSUFBNkM7QUFBQSx3Q0FBcENDLEVBQW9DOztBQUN6Q0QsZ0RBQVlFLElBQVosQ0FBaUI7QUFDYkQsNENBQUlBO0FBRFMscUNBQWpCO0FBR0g7QUFUd0Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFVekRELHdDQUFZRSxJQUFaLENBQWlCO0FBQ2JELG9DQUFJO0FBRFMsNkJBQWpCO0FBR0FGLDZDQUFpQkMsV0FBakIsR0FBK0JBLFdBQS9CO0FBQ0g7QUE3Q1U7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUErQ1gseUJBQUtkLE1BQUwsR0FBY3ZCLFlBQWQ7O0FBRUEseUJBQUt3QyxjQUFMO0FBQ0EseUJBQUtDLGVBQUw7O0FBRUE7QUFDQSx3QkFBSSxDQUFDLEtBQUtsQixNQUFMLENBQVltQixXQUFqQixFQUE4QjtBQUMxQiw2QkFBS25CLE1BQUwsQ0FBWW1CLFdBQVosR0FBMEIsU0FBMUI7QUFDSDtBQUNELHdCQUFJLENBQUMsS0FBS25CLE1BQUwsQ0FBWW9CLFVBQWpCLEVBQTZCO0FBQ3pCLDZCQUFLcEIsTUFBTCxDQUFZb0IsVUFBWixHQUF5QixhQUF6QjtBQUNIO0FBQ0RqQixzQ0FBa0IsS0FBS0gsTUFBTCxDQUFZRyxlQUE5QjtBQUNBO0FBQ0Esd0JBQUksS0FBS0gsTUFBTCxDQUFZdkMsUUFBaEIsRUFBMEI7QUFDdEIsNEJBQUksQ0FBQyxLQUFLMkIsV0FBVixFQUF1QjtBQUNuQmIsMENBQWNYLFdBQWQsQ0FBMEIsS0FBS29DLE1BQUwsQ0FBWXZDLFFBQXRDLEVBQWdENEQsSUFBaEQsQ0FBcUQsVUFBQ0MsR0FBRCxFQUFTO0FBQzFELHNDQUFLbEMsV0FBTCxHQUFtQmtDLElBQUlDLElBQUosQ0FBU0MsTUFBVCxJQUFtQixFQUF0QztBQUNBLG9DQUFJckIsZ0JBQWdCc0IsTUFBaEIsS0FBMkIsQ0FBM0IsSUFBZ0N4RSxNQUFNb0QsUUFBTixDQUFlLE1BQUtqQixXQUFMLENBQWlCLENBQWpCLENBQWYsQ0FBcEMsRUFBeUU7QUFDckUsMENBQUtzQyxhQUFMLENBQW1CLE1BQUt0QyxXQUFMLENBQWlCLENBQWpCLEVBQW9CcEIsT0FBdkM7QUFDSDtBQUNKLDZCQUxEO0FBTUg7QUFDRCw2QkFBSyxJQUFJMkQsSUFBSSxDQUFSLEVBQVdDLElBQUl6QixnQkFBZ0JzQixNQUFwQyxFQUE0Q0UsSUFBSUMsQ0FBaEQsRUFBbURELEdBQW5ELEVBQXdEO0FBQ3BELGdDQUFJeEIsZ0JBQWdCd0IsQ0FBaEIsRUFBbUJ2QixVQUFuQixHQUFnQ0EsVUFBcEMsRUFBZ0Q7QUFDNUNBLDZDQUFhRCxnQkFBZ0J3QixDQUFoQixFQUFtQnZCLFVBQWhDO0FBQ0FULHFDQUFLUSxnQkFBZ0J3QixDQUFoQixFQUFtQjNELE9BQXhCO0FBQ0g7QUFDSjtBQUNELDZCQUFLMEQsYUFBTCxDQUFtQi9CLEVBQW5CO0FBQ0gscUJBaEJELE1BZ0JPO0FBQ0gsNkJBQUtrQyxRQUFMO0FBQ0g7QUFDSjtBQUNEOztBQTlKd0Y7QUFBQTtBQUFBLDJDQStKakY7QUFBQTs7QUFDUCx3QkFBSSxDQUFDNUUsTUFBTXlELE9BQU4sQ0FBYyxLQUFLVixNQUFMLENBQVk4QixlQUExQixDQUFMLEVBQWlEO0FBQzdDLDZCQUFLOUIsTUFBTCxDQUFZOEIsZUFBWixHQUE4QixFQUE5QjtBQUNIO0FBQ0Qsd0JBQUksQ0FBQzdFLE1BQU15RCxPQUFOLENBQWMsS0FBS1YsTUFBTCxDQUFZK0IsY0FBMUIsQ0FBTCxFQUFnRDtBQUM1Qyw2QkFBSy9CLE1BQUwsQ0FBWStCLGNBQVosR0FBNkIsRUFBN0I7QUFDSDtBQUNELHlCQUFLQyxrQkFBTDs7QUFFQSx3QkFBSSxDQUFDLEtBQUtoQyxNQUFMLENBQVlELE9BQWpCLEVBQTBCO0FBQ3RCLDZCQUFLa0MsU0FBTCxDQUFlLEtBQUtwRCxPQUFMLENBQWEsQ0FBYixDQUFmO0FBQ0gscUJBRkQsTUFFTztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNILGtEQUFnQixLQUFLQSxPQUFyQixtSUFBOEI7QUFBQSxvQ0FBckJxRCxHQUFxQjs7QUFDMUIsb0NBQUksS0FBS2xDLE1BQUwsQ0FBWUQsT0FBWixLQUF3Qm1DLElBQUlwRCxLQUFoQyxFQUF1QztBQUNuQyx5Q0FBS21ELFNBQUwsQ0FBZUMsR0FBZjtBQUNBO0FBQ0g7QUFDSjtBQU5FO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFPTjs7QUFFRCx3QkFBSSxLQUFLbEMsTUFBTCxDQUFZbUMsUUFBWixLQUF5QixJQUE3QixFQUFtQztBQUMvQiw0QkFBSSxDQUFDbEYsTUFBTXlELE9BQU4sQ0FBYyxLQUFLOUIsU0FBbkIsQ0FBTCxFQUFvQztBQUNoQyxpQ0FBS1ksVUFBTCxDQUFnQjRDLFlBQWhCLENBQTZCLGFBQTdCO0FBQ0F4Rix1Q0FBV3lGLFlBQVgsQ0FBd0JDLGdCQUF4QixHQUEyQ2pCLElBQTNDLENBQWdELFVBQUNDLEdBQUQsRUFBUztBQUNyRCxvQ0FBSTFDLFlBQVkwQyxJQUFJQyxJQUFKLENBQVNDLE1BQVQsSUFBbUIsRUFBbkM7QUFDQTtBQUZxRDtBQUFBO0FBQUE7O0FBQUE7QUFHckQsMERBQWtCNUMsU0FBbEIsbUlBQTZCO0FBQUEsNENBQXBCMkQsS0FBb0I7O0FBQ3pCLDRDQUFJQyxPQUFPLEVBQVg7QUFDQSw0Q0FBSUQsTUFBTUUsV0FBVixFQUF1QjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNuQixzRUFBZ0JGLE1BQU1FLFdBQXRCLG1JQUFtQztBQUFBLHdEQUExQlAsSUFBMEI7O0FBQy9CTSx5REFBS3hCLElBQUwsQ0FBVTtBQUNOMEIsNkRBQUtSLEtBQUlRLEdBREg7QUFFTjVELCtEQUFPb0QsS0FBSXBELEtBRkw7QUFHTjZELHFFQUFhVCxLQUFJUztBQUhYLHFEQUFWO0FBS0g7QUFQa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVF0QjtBQUNESiw4Q0FBTUUsV0FBTixHQUFvQkQsSUFBcEI7QUFDSDtBQWZvRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWdCckQsdUNBQUs1RCxTQUFMLEdBQWlCQSxTQUFqQjtBQUNBO0FBQ0EsdUNBQUtnRSxzQkFBTDtBQUNILDZCQW5CRCxFQW1CR0MsT0FuQkgsQ0FtQlcsWUFBTTtBQUNiLHVDQUFLckQsVUFBTCxDQUFnQnNELGFBQWhCLENBQThCLGFBQTlCO0FBQ0gsNkJBckJEO0FBc0JILHlCQXhCRCxNQXdCTztBQUNILGlDQUFLRixzQkFBTDtBQUNIO0FBQ0o7O0FBRURHLDRCQUFRQyxHQUFSLENBQVksS0FBS2hELE1BQUwsQ0FBWThCLGVBQXhCO0FBbERPO0FBQUE7QUFBQTs7QUFBQTtBQW1EUCw4Q0FBa0IsS0FBSzlCLE1BQUwsQ0FBWThCLGVBQTlCLG1JQUErQztBQUFBLGdDQUF0Q1MsS0FBc0M7O0FBQzNDLGlDQUFLVSxXQUFMLENBQWlCVixLQUFqQjtBQUNIO0FBckRNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFzRFY7QUFyTjJGO0FBQUE7QUFBQSw4Q0FzTjlFO0FBQUE7O0FBQ04seUJBQUsvQyxVQUFMLENBQWdCNEMsWUFBaEIsQ0FBNkIsU0FBN0I7QUFDQSwyQkFBT2xGLFlBQVlnRyxPQUFaLEdBQXNCN0IsSUFBdEIsQ0FBMkIsVUFBQ0MsR0FBRCxFQUFTO0FBQ3ZDLCtCQUFLL0IsY0FBTCxDQUFvQlcsSUFBcEIsQ0FBeUJvQixJQUFJQyxJQUFKLENBQVNDLE1BQWxDO0FBQ0EsK0JBQUsyQixhQUFMO0FBQ0gscUJBSE0sRUFHSk4sT0FISSxDQUdJLFlBQU07QUFDYiwrQkFBS3JELFVBQUwsQ0FBZ0JzRCxhQUFoQixDQUE4QixTQUE5QjtBQUNILHFCQUxNLENBQVA7QUFNSDtBQUNEOztBQS9Od0Y7QUFBQTtBQUFBLDRDQWdPaEZNLFNBaE9nRixFQWdPckU7QUFDbkIsd0JBQUluRyxNQUFNb0QsUUFBTixDQUFlK0MsU0FBZixDQUFKLEVBQStCO0FBQzNCLDZCQUFLcEQsTUFBTCxDQUFZcUQsY0FBWixHQUE2QkQsVUFBVUMsY0FBdkM7QUFDQSw2QkFBS3JELE1BQUwsQ0FBWXNELGdCQUFaLEdBQStCRixVQUFVRSxnQkFBekM7QUFDQSw2QkFBS3RELE1BQUwsQ0FBWUcsZUFBWixHQUE4QmlELFVBQVVqRCxlQUF4QztBQUNBLDZCQUFLSCxNQUFMLENBQVl1RCxlQUFaLEdBQThCSCxVQUFVRyxlQUF4QztBQUNIO0FBQ0o7QUF2TzJGO0FBQUE7QUFBQSxtREF3T3pFO0FBQUE7O0FBQ2YseUJBQUsvRCxVQUFMLENBQWdCNEMsWUFBaEIsQ0FBNkIsYUFBN0I7QUFDQTdELGtDQUFjWCxXQUFkLENBQTBCLEtBQUtvQyxNQUFMLENBQVl2QyxRQUF0QyxFQUFnRDRELElBQWhELENBQXFELFVBQUNDLEdBQUQsRUFBUztBQUMxRCwrQkFBS2xDLFdBQUwsR0FBbUJrQyxJQUFJQyxJQUFKLENBQVNDLE1BQVQsSUFBbUIsRUFBdEM7QUFDSCxxQkFGRCxFQUVHcUIsT0FGSCxDQUVXLFlBQU07QUFDYiwrQkFBS3JELFVBQUwsQ0FBZ0JzRCxhQUFoQixDQUE4QixhQUE5QjtBQUNILHFCQUpEO0FBS0g7QUEvTzJGO0FBQUE7QUFBQSw4Q0FnUDlFVSxLQWhQOEUsRUFnUHZFO0FBQUE7O0FBQ2Isd0JBQUlDLGtCQUFKO0FBQUEsd0JBQ0lDLGNBQWMsS0FBS25FLGNBQUwsQ0FBb0JtRSxXQUR0QztBQUVBLHdCQUFJQSxZQUFZakMsTUFBWixLQUF1QixDQUEzQixFQUE4QjtBQUMxQjtBQUNIO0FBQ0Q7QUFDQSx3QkFBSSxPQUFPK0IsS0FBUCxLQUFpQixXQUFyQixFQUFrQztBQUM5Qiw2QkFBSyxJQUFJN0IsSUFBSSxDQUFSLEVBQVdDLElBQUk4QixZQUFZakMsTUFBaEMsRUFBd0NFLElBQUlDLENBQTVDLEVBQStDRCxHQUEvQyxFQUFvRDtBQUNoRCxnQ0FBSStCLFlBQVkvQixDQUFaLEVBQWVoQyxFQUFmLEtBQXNCLEtBQUtLLE1BQUwsQ0FBWXlELFNBQXRDLEVBQWlEO0FBQzdDRCx3Q0FBUTdCLENBQVI7QUFDQTtBQUNIO0FBQ0o7QUFDRDtBQUNBLDRCQUFJLE9BQU82QixLQUFQLEtBQWlCLFdBQXJCLEVBQWtDO0FBQzlCQSxvQ0FBUSxDQUFSO0FBQ0g7QUFDSjs7QUFFRCx5QkFBS2pFLGNBQUwsQ0FBb0I0RCxhQUFwQixDQUFrQ0ssS0FBbEM7QUFDQSx5QkFBS3RFLFNBQUwsR0FBaUJ3RSxZQUFZRixLQUFaLEVBQW1CdEUsU0FBcEM7QUFDQXVFLGdDQUFZLEtBQUtsRSxjQUFMLENBQW9Cb0UsT0FBcEIsQ0FBNEJoRSxFQUF4QztBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQVlBLHlCQUFLSCxVQUFMLENBQWdCNEMsWUFBaEIsQ0FBNkIsVUFBN0I7O0FBRUFsRixnQ0FBWTBHLFdBQVosQ0FBd0JILFNBQXhCLEVBQW1DcEMsSUFBbkMsQ0FBd0MsVUFBQ0MsR0FBRCxFQUFTO0FBQzdDLDRCQUFJdUMsV0FBV3ZDLElBQUlDLElBQUosQ0FBU0MsTUFBVCxJQUFtQixFQUFsQztBQUNBLCtCQUFLbEMsY0FBTCxHQUFzQi9DLFFBQVF1SCxJQUFSLENBQWFELFFBQWIsQ0FBdEI7QUFDQSw2QkFBSyxJQUFJbEMsS0FBSSxDQUFiLEVBQWdCQSxLQUFJLE9BQUtyQyxjQUFMLENBQW9CbUMsTUFBeEMsRUFBZ0RFLElBQWhELEVBQXFEO0FBQ2pELGdDQUFJb0MsT0FBTyxPQUFLekUsY0FBTCxDQUFvQnFDLEVBQXBCLENBQVg7QUFDQSxnQ0FBSW9DLEtBQUtDLE1BQUwsSUFBZSxPQUFuQixFQUE0QjtBQUN4QixvQ0FBSS9FLE1BQU0sT0FBS2UsTUFBTCxDQUFZVyxpQkFBWixDQUE4QixDQUE5QixFQUFpQ0csV0FBM0M7QUFEd0I7QUFBQTtBQUFBOztBQUFBO0FBRXhCLDBEQUFlN0IsR0FBZixtSUFBb0I7QUFBQSw0Q0FBWDhCLEVBQVc7O0FBQ2hCLDRDQUFJQSxPQUFPZ0QsS0FBS2hELEVBQWhCLEVBQW9CO0FBQ2hCZ0QsaURBQUtFLFVBQUwsR0FBa0IsSUFBbEI7QUFDQTtBQUNIO0FBQ0o7QUFQdUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFReEIsb0NBQUlGLEtBQUtFLFVBQUwsS0FBb0IsS0FBSyxDQUE3QixFQUFnQztBQUM1QkYseUNBQUtFLFVBQUwsR0FBa0IsS0FBbEI7QUFDSDtBQUNKLDZCQVhELE1BV087QUFDSCx1Q0FBSzNFLGNBQUwsQ0FBb0I0RSxNQUFwQixDQUEyQnZDLEVBQTNCLEVBQThCLENBQTlCO0FBQ0FBO0FBQ0g7QUFDSjtBQUNEO0FBQ0EsK0JBQUt0QyxXQUFMLENBQWlCYSxJQUFqQixDQUFzQjJELFFBQXRCLEVBQWdDLE9BQUs3RCxNQUFMLENBQVltQyxRQUE1QztBQUNBLCtCQUFLSCxrQkFBTDtBQUNBLCtCQUFLM0MsV0FBTCxDQUFpQjRDLFNBQWpCLENBQTJCLE9BQUtqQyxNQUFMLENBQVlELE9BQXZDO0FBQ0E7QUFDQSw0QkFBSSxPQUFLQyxNQUFMLENBQVltQyxRQUFaLElBQXdCLE9BQUtuQyxNQUFMLENBQVk1QixRQUFwQyxJQUFnRCxPQUFLaUIsV0FBTCxDQUFpQndFLFFBQXJFLEVBQStFO0FBQzNFLGlDQUFLLElBQUlsQyxNQUFJLENBQVIsRUFBV0MsS0FBSSxPQUFLdkMsV0FBTCxDQUFpQndFLFFBQWpCLENBQTBCcEMsTUFBOUMsRUFBc0RFLE1BQUlDLEVBQUosSUFBU0QsTUFBSSxPQUFLM0IsTUFBTCxDQUFZNUIsUUFBL0UsRUFBeUZ1RCxLQUF6RixFQUE4RjtBQUMxRix1Q0FBS3RDLFdBQUwsQ0FBaUJ3RSxRQUFqQixDQUEwQmxDLEdBQTFCLEVBQTZCc0MsVUFBN0IsR0FBMEMsSUFBMUM7QUFDQSx1Q0FBSzVFLFdBQUwsQ0FBaUI4RSxlQUFqQixDQUFpQyxPQUFLOUUsV0FBTCxDQUFpQndFLFFBQWpCLENBQTBCbEMsR0FBMUIsQ0FBakM7QUFDSDtBQUNKO0FBQ0oscUJBaENELEVBZ0NHLFlBQU07QUFDTCwrQkFBS3RDLFdBQUwsQ0FBaUJhLElBQWpCO0FBQ0gscUJBbENELEVBa0NHMkMsT0FsQ0gsQ0FrQ1csWUFBTTtBQUNiLCtCQUFLckQsVUFBTCxDQUFnQnNELGFBQWhCLENBQThCLFVBQTlCO0FBQ0gscUJBcENEOztBQXNDQSx3QkFBSSxLQUFLOUMsTUFBTCxDQUFZdkMsUUFBWixLQUF5QixLQUFLLENBQWxDLEVBQXFDO0FBQ2pDLDZCQUFLK0IsVUFBTCxDQUFnQjRDLFlBQWhCLENBQTZCLFdBQTdCO0FBQ0FsRixvQ0FBWWtILFlBQVosQ0FBeUJYLFNBQXpCLEVBQW9DcEMsSUFBcEMsQ0FBeUMsVUFBQ0MsR0FBRCxFQUFTO0FBQzlDLG1DQUFLNUMsYUFBTCxHQUFxQjRDLElBQUlDLElBQUosQ0FBU0MsTUFBVCxJQUFtQixFQUF4QztBQUNBLG1DQUFLN0MsY0FBTCxHQUFzQixLQUF0QjtBQUNBLG1DQUFLcUIsTUFBTCxDQUFZcUUsU0FBWixHQUF3QixPQUFLM0YsYUFBTCxDQUFtQixDQUFuQixFQUFzQmtCLElBQXRCLElBQThCLElBQXREO0FBQ0EsaUNBQUssSUFBSStCLE1BQUksQ0FBUixFQUFXQyxNQUFJLE9BQUtsRCxhQUFMLENBQW1CK0MsTUFBdkMsRUFBK0NFLE1BQUlDLEdBQW5ELEVBQXNERCxLQUF0RCxFQUEyRDtBQUN2RCxvQ0FBSSxPQUFLakQsYUFBTCxDQUFtQmlELEdBQW5CLEVBQXNCL0IsSUFBdEIsSUFBOEIsU0FBbEMsRUFBNkM7QUFDekMsMkNBQUtJLE1BQUwsQ0FBWXFFLFNBQVosR0FBd0IsT0FBSzNGLGFBQUwsQ0FBbUJpRCxHQUFuQixFQUFzQi9CLElBQTlDO0FBQ0E7QUFDSDtBQUNKO0FBQ0oseUJBVkQsRUFVRyxZQUFNO0FBQ0wsbUNBQUtqQixjQUFMLEdBQXNCLEtBQXRCO0FBQ0EsbUNBQUtELGFBQUwsR0FBcUIsRUFBckI7QUFDQSxtQ0FBS3NCLE1BQUwsQ0FBWXFFLFNBQVosR0FBd0IsSUFBeEI7QUFDSCx5QkFkRCxFQWNHeEIsT0FkSCxDQWNXLFlBQU07QUFDYixtQ0FBS3JELFVBQUwsQ0FBZ0JzRCxhQUFoQixDQUE4QixXQUE5QjtBQUNILHlCQWhCRDtBQWlCSDtBQUNKO0FBQ0Q7O0FBalZ3RjtBQUFBO0FBQUEscURBa1Z2RTtBQUNqQix5QkFBS3pELFdBQUwsQ0FBaUJpRixjQUFqQjtBQUNBLHdCQUFJLENBQUMsS0FBS3RFLE1BQUwsQ0FBWStCLGNBQWpCLEVBQWlDO0FBQzdCO0FBQ0g7QUFDRCx3QkFBSUEsaUJBQWlCLEtBQUsvQixNQUFMLENBQVkrQixjQUFqQztBQUxpQjtBQUFBO0FBQUE7O0FBQUE7QUFNakIsOENBQTBCQSxjQUExQixtSUFBMEM7QUFBQSxnQ0FBakN3QyxhQUFpQzs7QUFDdEMsZ0NBQUlDLFlBQVlELGNBQWMzRSxJQUE5QjtBQUNBLGdDQUFJNEUsYUFBYSx3QkFBYixJQUF5Q0EsYUFBYSxTQUF0RCxJQUFtRUEsYUFBYSxTQUFwRixFQUErRjtBQUMzRixxQ0FBS25GLFdBQUwsQ0FBaUJvRixXQUFqQixDQUE2QkQsU0FBN0IsRUFBd0MsSUFBeEM7QUFDSDtBQUNKO0FBWGdCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFZcEI7QUE5VjJGO0FBQUE7QUFBQSwyQ0ErVmpGO0FBQ0gsd0JBQUksS0FBSzFFLFNBQUwsS0FBbUIsU0FBdkIsRUFBa0M7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDOUIsa0RBQWlCLEtBQUtSLGNBQXRCLG1JQUFzQztBQUFBLG9DQUE3QnlFLElBQTZCOztBQUNsQyxvQ0FBSUEsS0FBS0UsVUFBVCxFQUFxQjtBQUNqQix5Q0FBS2pGLEtBQUwsQ0FBV0MsR0FBWCxHQUFpQixJQUFqQjtBQUNBO0FBQ0g7QUFDSjtBQU42QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU85Qiw2QkFBS0QsS0FBTCxDQUFXQyxHQUFYLEdBQWlCLEtBQWpCO0FBQ0gscUJBUkQsTUFRTztBQUNILDZCQUFLRCxLQUFMLENBQVdDLEdBQVgsR0FBaUIsSUFBakI7QUFDSDtBQUNKO0FBQ0Q7O0FBNVd3RjtBQUFBO0FBQUEsOENBNlc5RW5CLFNBN1c4RSxFQTZXbkU7QUFBQTs7QUFDakJTLGtDQUFjVixnQkFBZCxDQUErQixLQUFLbUMsTUFBTCxDQUFZdkMsUUFBM0MsRUFBcURLLFNBQXJELEVBQWdFdUQsSUFBaEUsQ0FBcUUsVUFBQ0MsR0FBRCxFQUFTO0FBQzFFLDRCQUFJckUsTUFBTW9ELFFBQU4sQ0FBZWlCLElBQUlDLElBQUosQ0FBU0MsTUFBeEIsQ0FBSixFQUFxQztBQUNqQ2tELDhCQUFFQyxNQUFGLENBQVMsT0FBSzNFLE1BQWQsRUFBc0JzQixJQUFJQyxJQUFKLENBQVNDLE1BQS9CO0FBQ0EsbUNBQUtLLFFBQUw7QUFDSDtBQUNKLHFCQUxEO0FBTUg7QUFDRDs7QUFyWHdGO0FBQUE7QUFBQSx5REFzWG5FO0FBQUE7O0FBQ3JCLHdCQUFJQyxrQkFBa0IsS0FBSzlCLE1BQUwsQ0FBWThCLGVBQWxDOztBQUVBLHdCQUFNOEMsU0FBUyxTQUFUQSxNQUFTLENBQUNDLGNBQUQsRUFBb0I7QUFDL0IsK0JBQUtyRixVQUFMLENBQWdCNEMsWUFBaEIsQ0FBNkIsS0FBN0I7QUFDQXhGLG1DQUFXeUYsWUFBWCxDQUF3QnlDLFlBQXhCLENBQXFDRCxlQUFldEMsS0FBcEQsRUFBMkRzQyxlQUFlRSxRQUExRSxFQUFvRjFELElBQXBGLENBQXlGLFVBQUNDLEdBQUQsRUFBUztBQUM5RnVELDJDQUFlRyxPQUFmLEdBQXlCMUQsSUFBSUMsSUFBSixDQUFTQyxNQUFULElBQW1CLEVBQTVDO0FBQ0gseUJBRkQsRUFFR3FCLE9BRkgsQ0FFVyxZQUFNO0FBQ2IsbUNBQUtyRCxVQUFMLENBQWdCc0QsYUFBaEIsQ0FBOEIsS0FBOUI7QUFDSCx5QkFKRDtBQUtILHFCQVBEO0FBUUEseUJBQUssSUFBSW5CLElBQUksQ0FBUixFQUFXQyxJQUFJRSxnQkFBZ0JMLE1BQXBDLEVBQTRDRSxJQUFJQyxDQUFoRCxFQUFtREQsR0FBbkQsRUFBd0Q7QUFDcERHLHdDQUFnQkgsQ0FBaEIsRUFBbUJzRCxNQUFuQixHQUE0QixFQUE1QjtBQUNBbkQsd0NBQWdCSCxDQUFoQixFQUFtQnVELE1BQW5CLEdBQTRCLEVBQTVCO0FBQ0E7QUFDQU4sK0JBQU85QyxnQkFBZ0JILENBQWhCLENBQVA7QUFDQSw0QkFBSXNELFNBQVMsRUFBYjtBQUNBO0FBQ0EsNkJBQUssSUFBSUUsSUFBSSxDQUFSLEVBQVdDLEtBQUssS0FBS3hHLFNBQUwsQ0FBZTZDLE1BQXBDLEVBQTRDMEQsSUFBSUMsRUFBaEQsRUFBb0RELEdBQXBELEVBQXlEO0FBQ3JELGdDQUFJLEtBQUt2RyxTQUFMLENBQWV1RyxDQUFmLEVBQWtCRSxTQUFsQixLQUFnQ3ZELGdCQUFnQkgsQ0FBaEIsRUFBbUJZLEtBQXZELEVBQThEO0FBQzFEMEMseUNBQVMsS0FBS3JHLFNBQUwsQ0FBZXVHLENBQWYsRUFBa0IxQyxXQUEzQjtBQUNBO0FBQ0g7QUFDSjtBQUNEO0FBQ0EsNEJBQUlYLGdCQUFnQkgsQ0FBaEIsRUFBbUJhLElBQXZCLEVBQTZCO0FBQ3pCLGlDQUFLLElBQUk4QyxJQUFJLENBQVIsRUFBV0MsS0FBS3pELGdCQUFnQkgsQ0FBaEIsRUFBbUJhLElBQW5CLENBQXdCZixNQUE3QyxFQUFxRDZELElBQUlDLEVBQXpELEVBQTZERCxHQUE3RCxFQUFrRTtBQUM5RCxvQ0FBSUUsV0FBVyxLQUFmO0FBQ0EscUNBQUssSUFBSUMsSUFBSSxDQUFSLEVBQVdDLEtBQUtULE9BQU94RCxNQUE1QixFQUFvQ2dFLElBQUlDLEVBQXhDLEVBQTRDRCxHQUE1QyxFQUFpRDtBQUM3Qyx3Q0FBSVIsT0FBT1EsQ0FBUCxFQUFVL0MsR0FBVixLQUFrQlosZ0JBQWdCSCxDQUFoQixFQUFtQmEsSUFBbkIsQ0FBd0I4QyxDQUF4QixFQUEyQjVDLEdBQWpELEVBQXNEO0FBQ2xEOEMsbURBQVcsSUFBWDtBQUNBO0FBQ0g7QUFDSjtBQUNELG9DQUFJQSxRQUFKLEVBQWM7QUFDVjFELG9EQUFnQkgsQ0FBaEIsRUFBbUJzRCxNQUFuQixDQUEwQmpFLElBQTFCLENBQStCYyxnQkFBZ0JILENBQWhCLEVBQW1CYSxJQUFuQixDQUF3QjhDLENBQXhCLENBQS9CO0FBQ0gsaUNBRkQsTUFFTztBQUNIeEQsb0RBQWdCSCxDQUFoQixFQUFtQnVELE1BQW5CLENBQTBCbEUsSUFBMUIsQ0FBK0JjLGdCQUFnQkgsQ0FBaEIsRUFBbUJhLElBQW5CLENBQXdCOEMsQ0FBeEIsQ0FBL0I7QUFDSDtBQUNKO0FBQ0oseUJBZkQsTUFlTztBQUNIeEQsNENBQWdCSCxDQUFoQixFQUFtQnNELE1BQW5CLEdBQTRCMUksUUFBUXVILElBQVIsQ0FBYW1CLE1BQWIsQ0FBNUI7QUFDSDtBQUNKO0FBQ0o7QUFsYTJGO0FBQUE7QUFBQSxnREFtYTVFWixTQW5hNEUsRUFtYWpFO0FBQ3ZCLHlCQUFLckUsTUFBTCxDQUFZcUUsU0FBWixHQUF3QkEsU0FBeEI7QUFDSDtBQXJhMkY7QUFBQTtBQUFBLHVEQXNhckU7QUFDbkIseUJBQUsxRixjQUFMLEdBQXNCLENBQUMsS0FBS0EsY0FBNUI7QUFDQSx5QkFBS3FCLE1BQUwsQ0FBWXFFLFNBQVosR0FBd0IsSUFBeEI7QUFDSDtBQXphMkY7QUFBQTtBQUFBLDBDQTBhbEZuQyxHQTFha0YsRUEwYTdFO0FBQ1gseUJBQUtsQyxNQUFMLENBQVlELE9BQVosR0FBc0JtQyxJQUFJcEQsS0FBMUI7QUFDQSx5QkFBS0ssT0FBTCxHQUFlK0MsSUFBSW5ELElBQW5CO0FBQ0EseUJBQUtNLFdBQUwsQ0FBaUI0QyxTQUFqQixDQUEyQkMsSUFBSXBELEtBQS9CO0FBQ0g7QUE5YTJGO0FBQUE7QUFBQSw4Q0ErYTlFNkcsSUEvYThFLEVBK2F4RTtBQUNoQix5QkFBS2pHLE9BQUwsR0FBZWlHLElBQWY7QUFDSDtBQWpiMkY7QUFBQTtBQUFBLCtDQWtiN0VuQyxLQWxiNkUsRUFrYnRFb0MsR0FsYnNFLEVBa2JqRTtBQUNuQix5QkFBSzVGLE1BQUwsQ0FBWThCLGVBQVosQ0FBNEIwQixLQUE1QixFQUFtQ29DLEdBQW5DLEdBQXlDQSxHQUF6QztBQUNIO0FBQ0Q7O0FBcmJ3RjtBQUFBO0FBQUEseUNBc2JuRnJELEtBdGJtRixFQXNiNUU7QUFBQTs7QUFDUix5QkFBSy9DLFVBQUwsQ0FBZ0I0QyxZQUFoQixDQUE2QixVQUE3QjtBQUNBeEYsK0JBQVd5RixZQUFYLENBQXdCeUMsWUFBeEIsQ0FBcUN2QyxNQUFNOEMsU0FBM0MsRUFBc0Q5QyxNQUFNd0MsUUFBNUQsRUFBc0UxRCxJQUF0RSxDQUEyRSxVQUFDQyxHQUFELEVBQVM7QUFDaEYsNEJBQUl1RSxPQUFPdkUsSUFBSUMsSUFBSixDQUFTQyxNQUFwQjtBQUNBLCtCQUFLeEIsTUFBTCxDQUFZOEIsZUFBWixDQUE0QmQsSUFBNUIsQ0FBaUM7QUFDN0J1QixtQ0FBT0EsTUFBTThDLFNBRGdCO0FBRTdCTixzQ0FBVXhDLE1BQU13QyxRQUZhO0FBRzdCZSxpQ0FBSyxHQUh3QjtBQUk3QkMsaUNBQUssSUFKd0I7QUFLN0JILGlDQUFLQyxRQUFRQSxLQUFLLENBQUwsQ0FBUixHQUFrQkEsS0FBSyxDQUFMLEVBQVFELEdBQTFCLEdBQWdDLEtBQUssQ0FMYjtBQU03QloscUNBQVNhLFFBQVEsRUFOWTtBQU83Qlosb0NBQVExQyxNQUFNRSxXQUFOLElBQXFCLEVBUEE7QUFRN0J5QyxvQ0FBUSxFQVJxQjtBQVM3QmMsMkNBQWU7QUFDWG5HLHNDQUFNO0FBREssNkJBVGM7QUFZN0JvRyw2Q0FBaUIsUUFaWTtBQWE3QkMsMkNBQWUsQ0FBQztBQUNiQyx5Q0FBUyxFQURJO0FBRWJDLDZDQUFhLEtBRkE7QUFHYkMsNENBQVk7QUFIQyw2QkFBRDtBQWJjLHlCQUFqQztBQW1CSCxxQkFyQkQsRUFxQkd4RCxPQXJCSCxDQXFCVyxZQUFNO0FBQ2IsK0JBQUtyRCxVQUFMLENBQWdCc0QsYUFBaEIsQ0FBOEIsVUFBOUI7QUFDSCxxQkF2QkQ7QUF3Qkg7QUFDRDs7QUFqZHdGO0FBQUE7QUFBQSxnREFrZDVFO0FBQUE7O0FBQ1osd0JBQUl3RCxnQkFBZ0J2SixPQUFPd0osSUFBUCxDQUFZO0FBQzVCQyxtQ0FBVyxJQURpQjtBQUU1QkMscUNBQWEsdURBRmU7QUFHNUJDLG9DQUFZLG9CQUhnQjtBQUk1QkMsOEJBQU07QUFKc0IscUJBQVosQ0FBcEI7QUFNQUwsa0NBQWM5RSxNQUFkLENBQXFCSCxJQUFyQixDQUEwQixVQUFDdUYsU0FBRCxFQUFlO0FBQ3JDLCtCQUFLNUcsTUFBTCxDQUFZOEIsZUFBWixDQUE0QmQsSUFBNUIsQ0FBaUM7QUFDN0J1QixtQ0FBT3FFLFVBQVVoSCxJQURZO0FBRTdCbUYsc0NBQVU2QixVQUFVN0IsUUFGUztBQUc3QmUsaUNBQUssR0FId0I7QUFJN0JDLGlDQUFLLElBSndCO0FBSzdCSCxpQ0FBS2dCLFVBQVVoQixHQUxjO0FBTTdCWixxQ0FBUyxDQUFDO0FBQ05ZLHFDQUFLZ0IsVUFBVWhCO0FBRFQsNkJBQUQsQ0FOb0I7QUFTN0JYLG9DQUFRLEVBVHFCO0FBVTdCQyxvQ0FBUTtBQVZxQix5QkFBakM7QUFZSCxxQkFiRDtBQWNIO0FBdmUyRjtBQUFBO0FBQUEsNENBd2VoRjFCLEtBeGVnRixFQXdlekU7QUFDZix5QkFBS3hELE1BQUwsQ0FBWThCLGVBQVosQ0FBNEJvQyxNQUE1QixDQUFtQ1YsS0FBbkMsRUFBMEMsQ0FBMUM7QUFDSDtBQTFlMkY7QUFBQTtBQUFBLDRDQTJlaEZBLEtBM2VnRixFQTJlekU7QUFDZix5QkFBS3hELE1BQUwsQ0FBWThCLGVBQVosQ0FBNEIwQixLQUE1QixFQUFtQzBCLE1BQW5DLENBQTBDbEUsSUFBMUMsQ0FBK0M7QUFDM0MwQiw2QkFBSyxFQURzQztBQUUzQzVELCtCQUFPLEVBRm9DO0FBRzNDNkQscUNBQWE7QUFIOEIscUJBQS9DO0FBS0g7QUFqZjJGO0FBQUE7QUFBQSwrQ0FrZjdFa0UsbUJBbGY2RSxFQWtmeERyRCxLQWxmd0QsRUFrZmpEO0FBQ3ZDLHlCQUFLeEQsTUFBTCxDQUFZOEIsZUFBWixDQUE0QitFLG1CQUE1QixFQUFpRDNCLE1BQWpELENBQXdEaEIsTUFBeEQsQ0FBK0RWLEtBQS9ELEVBQXNFLENBQXRFO0FBQ0g7QUFwZjJGO0FBQUE7QUFBQSxpREFxZjNFO0FBQ2IseUJBQUt4RCxNQUFMLENBQVlXLGlCQUFaLENBQThCSyxJQUE5QixDQUFtQztBQUMvQjhGLDhCQUFNLEVBRHlCO0FBRS9CQyxvQ0FBWSxFQUZtQjtBQUcvQmpHLHFDQUFhLENBQUM7QUFDVkMsZ0NBQUk7QUFETSx5QkFBRDtBQUhrQixxQkFBbkM7QUFPSDtBQTdmMkY7QUFBQTtBQUFBLGtEQThmMUU7QUFDZCx5QkFBS2YsTUFBTCxDQUFZWSxrQkFBWixDQUErQkksSUFBL0IsQ0FBb0M7QUFDaEM4Riw4QkFBTSxFQUQwQjtBQUVoQ0Msb0NBQVk7QUFGb0IscUJBQXBDO0FBSUg7QUFuZ0IyRjtBQUFBO0FBQUEsK0NBb2dCN0V2RCxLQXBnQjZFLEVBb2dCdEU7QUFDbEIseUJBQUt4RCxNQUFMLENBQVlXLGlCQUFaLENBQThCNkMsS0FBOUIsRUFBcUMxQyxXQUFyQyxDQUFpREUsSUFBakQsQ0FBc0Q7QUFDbERELDRCQUFJO0FBRDhDLHFCQUF0RDtBQUdIO0FBeGdCMkY7QUFBQTtBQUFBLGtEQXlnQjFFaUcscUJBemdCMEUsRUF5Z0JuRHhELEtBemdCbUQsRUF5Z0I1QztBQUM1Qyx5QkFBS3hELE1BQUwsQ0FBWVcsaUJBQVosQ0FBOEJxRyxxQkFBOUIsRUFBcURsRyxXQUFyRCxDQUFpRW9ELE1BQWpFLENBQXdFVixLQUF4RSxFQUErRSxDQUEvRTtBQUNIO0FBM2dCMkY7QUFBQTtBQUFBLDRDQTRnQmhGakIsS0E1Z0JnRixFQTRnQnpFO0FBQ2ZBLDBCQUFNMkQsYUFBTixHQUFzQjNELE1BQU0yRCxhQUFOLElBQXVCLEVBQTdDO0FBQ0EzRCwwQkFBTTJELGFBQU4sQ0FBb0JsRixJQUFwQixDQUF5QjtBQUNyQm1GLGlDQUFTLEVBRFk7QUFFckJDLHFDQUFhLEtBRlE7QUFHckJDLG9DQUFZO0FBSFMscUJBQXpCO0FBS0g7QUFuaEIyRjtBQUFBO0FBQUEsK0NBb2hCN0U5RCxLQXBoQjZFLEVBb2hCdEUwRSxRQXBoQnNFLEVBb2hCNUQ7QUFDNUIxRSwwQkFBTTJELGFBQU4sQ0FBb0JoQyxNQUFwQixDQUEyQjNCLE1BQU0yRCxhQUFOLENBQW9CZ0IsT0FBcEIsQ0FBNEJELFFBQTVCLENBQTNCLEVBQWtFLENBQWxFO0FBQ0g7QUF0aEIyRjtBQUFBO0FBQUEsOENBdWhCOUVFLElBdmhCOEUsRUF1aEJ4RTNELEtBdmhCd0UsRUF1aEJqRTtBQUN2Qix5QkFBS3hELE1BQUwsQ0FBWW1ILElBQVosRUFBa0JqRCxNQUFsQixDQUF5QlYsS0FBekIsRUFBZ0MsQ0FBaEM7QUFDSDtBQXpoQjJGO0FBQUE7QUFBQSx1REEwaEJyRTtBQUNuQix3QkFBSSxLQUFLeEQsTUFBTCxDQUFZbUIsV0FBWixJQUEyQixNQUEvQixFQUF1QztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNuQyxtREFBMkIsS0FBS25CLE1BQUwsQ0FBWThCLGVBQXZDLHdJQUF3RDtBQUFBLG9DQUEvQytDLGNBQStDOztBQUNwREEsK0NBQWVtQixhQUFmLEdBQStCO0FBQzNCbkcsMENBQU07QUFEcUIsaUNBQS9CO0FBR0g7QUFMa0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU10QztBQUNKO0FBbGlCMkY7QUFBQTtBQUFBLG9EQW1pQnhFO0FBQ2hCLHdCQUFJLEtBQUtHLE1BQUwsQ0FBWW1CLFdBQVosSUFBMkIsTUFBL0IsRUFBdUM7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDbkMsbURBQTZCLEtBQUtuQixNQUFMLENBQVlXLGlCQUF6Qyx3SUFBNEQ7QUFBQSxvQ0FBbkRFLGdCQUFtRDs7QUFDeERBLGlEQUFpQmlHLElBQWpCLEdBQXdCakcsaUJBQWlCa0csVUFBekM7QUFDSDtBQUhrQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXRDO0FBQ0o7QUF6aUIyRjtBQUFBO0FBQUEsaURBMGlCM0V2RCxLQTFpQjJFLEVBMGlCcEU7QUFDaEIseUJBQUt4RCxNQUFMLENBQVlXLGlCQUFaLENBQThCNkMsS0FBOUIsRUFBcUNzRCxJQUFyQyxHQUE0QyxLQUFLOUcsTUFBTCxDQUFZVyxpQkFBWixDQUE4QjZDLEtBQTlCLEVBQXFDdUQsVUFBakY7QUFDSDtBQUNEOztBQTdpQndGO0FBQUE7QUFBQSxpREE4aUIzRTtBQUFBOztBQUNiLHdCQUFJdEksZUFBZWxDLFFBQVF1SCxJQUFSLENBQWEsS0FBSzlELE1BQWxCLENBQW5COztBQUVBLHdCQUFJdkIsYUFBYTBDLFdBQWIsSUFBNEIsTUFBaEMsRUFBd0M7QUFDcEMxQyxxQ0FBYWtDLGlCQUFiLEdBQWlDLEVBQWpDO0FBQ0FsQyxxQ0FBYTJDLFVBQWIsR0FBMEIsS0FBMUI7QUFDQTNDLHFDQUFhbUMsa0JBQWIsR0FBa0MsRUFBbEM7QUFDQSw0QkFBSSxLQUFLZCxTQUFMLElBQWtCLFVBQXRCLEVBQWtDO0FBQzlCckIseUNBQWEySSxhQUFiLEdBQTZCLENBQTdCO0FBQ0g7QUFDSixxQkFQRCxNQU9PO0FBQ0gzSSxxQ0FBYTJJLGFBQWIsR0FBNkIsQ0FBN0I7QUFDQSw0QkFBSSxLQUFLdEgsU0FBTCxJQUFrQixVQUF0QixFQUFrQztBQUM5QnJCLHlDQUFhMkMsVUFBYixHQUEwQixLQUExQjtBQUNBM0MseUNBQWFrQyxpQkFBYixHQUFpQyxFQUFqQztBQUNBbEMseUNBQWFtQyxrQkFBYixHQUFrQyxFQUFsQztBQUNILHlCQUpELE1BSU8sSUFBSSxLQUFLZCxTQUFMLElBQWtCLFVBQXRCLEVBQWtDO0FBQ3JDckIseUNBQWEyQyxVQUFiLEdBQTBCLGFBQTFCO0FBQ0EzQyx5Q0FBYW1DLGtCQUFiLENBQWdDLENBQWhDLEVBQW1DbUcsVUFBbkMsR0FBZ0R0SSxhQUFhbUMsa0JBQWIsQ0FBZ0MsQ0FBaEMsRUFBbUNrRyxJQUFuRjtBQUNBckkseUNBQWFrQyxpQkFBYixHQUFpQyxFQUFqQztBQUNILHlCQUpNLE1BSUE7QUFDSGxDLHlDQUFhMkMsVUFBYixHQUEwQixhQUExQjtBQUNBM0MseUNBQWFtQyxrQkFBYixHQUFrQyxFQUFsQztBQUNIO0FBQ0o7O0FBRURuQyxpQ0FBYWtDLGlCQUFiLEdBQWtDLFlBQU07QUFDcEMsNEJBQUkxQixNQUFNLEVBQVY7QUFBQSw0QkFDSTBCLG9CQUFvQixFQUR4QjtBQURvQztBQUFBO0FBQUE7O0FBQUE7QUFHcEMsbURBQWlCLFFBQUtyQixjQUF0Qix3SUFBc0M7QUFBQSxvQ0FBN0J5RSxJQUE2Qjs7QUFDbEMsb0NBQUlBLEtBQUtFLFVBQVQsRUFBcUI7QUFDakJoRix3Q0FBSStCLElBQUosQ0FBUytDLEtBQUtoRCxFQUFkO0FBQ0g7QUFDSjtBQVBtQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQVFwQyxtREFBNkJ0QyxhQUFha0MsaUJBQTFDLHdJQUE2RDtBQUFBLG9DQUFwREUsZ0JBQW9EOztBQUN6RCxvQ0FBSUEsaUJBQWlCaUcsSUFBckIsRUFBMkI7QUFDdkJqRyxxREFBaUJDLFdBQWpCLEdBQStCN0IsR0FBL0I7QUFDQTBCLHNEQUFrQkssSUFBbEIsQ0FBdUJILGdCQUF2QjtBQUNIO0FBQ0o7QUFibUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFjcEMsK0JBQU9GLGlCQUFQO0FBQ0gscUJBZmdDLEVBQWpDOztBQWtCQSx3QkFBSSxDQUFDbEMsYUFBYTBELFFBQWxCLEVBQTRCO0FBQ3hCMUQscUNBQWFzRCxjQUFiLEdBQThCLEtBQUsxQyxXQUFMLENBQWlCZ0ksd0JBQWpCLEVBQTlCO0FBQ0gscUJBRkQsTUFFTztBQUNINUkscUNBQWE2SSxRQUFiLEdBQXdCLEtBQUtqSSxXQUFMLENBQWlCa0ksZ0JBQWpCLEVBQXhCO0FBQ0g7O0FBRUQ5SSxpQ0FBYWdGLFNBQWIsR0FBeUIsS0FBS2xFLGNBQUwsQ0FBb0JvRSxPQUFwQixDQUE0QmhFLEVBQXJEOztBQUVBLHdCQUFJLEtBQUtELE9BQUwsQ0FBYUMsRUFBakIsRUFBcUI7QUFDakJsQixxQ0FBYWlCLE9BQWIsR0FBdUI7QUFDbkI4SCx1Q0FBVyxLQUFLOUgsT0FBTCxDQUFhQyxFQURMO0FBRW5COEgseUNBQWEsS0FBSy9ILE9BQUwsQ0FBYUUsSUFGUDtBQUduQjhILHlDQUFhLEtBQUtoSSxPQUFMLENBQWFHO0FBSFAseUJBQXZCO0FBS0g7O0FBRUQsd0JBQUlwQixhQUFhNkIsV0FBYixLQUE2QixRQUFqQyxFQUEyQztBQUN2QzdCLHFDQUFhcUQsZUFBYixHQUFnQyxZQUFNO0FBQ2xDLGdDQUFJckQsYUFBYTBELFFBQWpCLEVBQTJCO0FBQ3ZCLHVDQUFPMUQsYUFBYXFELGVBQXBCO0FBQ0g7O0FBRUQsZ0NBQUksQ0FBQ3JELGFBQWFxRCxlQUFsQixFQUFtQztBQUMvQix1Q0FBTyxLQUFLLENBQVo7QUFDSDs7QUFFRCxnQ0FBSTZGLGdCQUFKO0FBQUEsZ0NBQWE3RixrQkFBa0IsRUFBL0I7QUFBQSxnQ0FDSWtFLHNCQURKOztBQVRrQztBQUFBO0FBQUE7O0FBQUE7QUFZbEMsdURBQTJCdkgsYUFBYXFELGVBQXhDLHdJQUF5RDtBQUFBLHdDQUFoRCtDLGNBQWdEOztBQUNyRDhDLDhDQUFVOUMsZUFBZUksTUFBekI7QUFDQSx3Q0FBSSxDQUFDSixlQUFlbUIsYUFBcEIsRUFBbUM7QUFDL0JuQix1REFBZW1CLGFBQWYsR0FBK0I7QUFDM0JuRyxrREFBTTtBQURxQix5Q0FBL0I7QUFHSDtBQUNEbUcsb0RBQWdCO0FBQ1puRyw4Q0FBTWdGLGVBQWVtQixhQUFmLENBQTZCbkc7QUFEdkIscUNBQWhCOztBQUlBLHdDQUFJcEIsYUFBYTBDLFdBQWIsSUFBNEIsTUFBaEMsRUFBd0M7QUFDcEMsNENBQUk2RSxjQUFjbkcsSUFBZCxJQUFzQixLQUF0QixJQUErQm1HLGNBQWNuRyxJQUFkLElBQXNCLE1BQXpELEVBQWlFO0FBQzdEbUcsMERBQWNjLElBQWQsR0FBcUJqQyxlQUFlbUIsYUFBZixDQUE2QmMsSUFBbEQ7QUFDQWQsMERBQWM0QixPQUFkLEdBQXdCL0MsZUFBZW1CLGFBQWYsQ0FBNkI0QixPQUFyRDtBQUNBNUIsMERBQWM2QixLQUFkLEdBQXNCaEQsZUFBZW1CLGFBQWYsQ0FBNkI2QixLQUFuRDtBQUNIO0FBQ0QsNENBQUk3QixjQUFjbkcsSUFBZCxJQUFzQixNQUExQixFQUFrQztBQUM5Qm1HLDBEQUFjOEIsR0FBZCxHQUFvQmpELGVBQWVtQixhQUFmLENBQTZCOEIsR0FBakQ7QUFDSDtBQUNKLHFDQVRELE1BU087QUFDSDlCLHNEQUFjbkcsSUFBZCxHQUFxQixNQUFyQjtBQUNIOztBQXRCb0Q7QUFBQTtBQUFBOztBQUFBO0FBd0JyRCwrREFBZ0JnRixlQUFlSyxNQUEvQix3SUFBdUM7QUFBQSxnREFBOUJoRCxHQUE4Qjs7QUFDbkMsZ0RBQUlBLElBQUlRLEdBQUosS0FBWSxFQUFoQixFQUFvQjtBQUNoQmlGLHdEQUFRM0csSUFBUixDQUFha0IsR0FBYjtBQUNIO0FBQ0o7QUE1Qm9EO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBOEJyRCx3Q0FBSWdFLGdCQUFpQixVQUFDNkIscUJBQUQsRUFBMkI7QUFDNUMsNENBQUk3QixnQkFBZ0IsRUFBcEI7QUFENEM7QUFBQTtBQUFBOztBQUFBO0FBRTVDLG1FQUFvQjZCLHFCQUFwQix3SUFBMkM7QUFBQSxvREFBbENDLE9BQWtDOztBQUN2QyxvREFBSUEsUUFBUTdCLE9BQVIsS0FBb0IsRUFBeEIsRUFBNEI7QUFDeEIsd0RBQUk4QixpQkFBaUI7QUFDakI5QixpRUFBUzZCLFFBQVE3QixPQURBO0FBRWpCQyxxRUFBYTRCLFFBQVE1QixXQUZKO0FBR2pCQyxvRUFBWTJCLFFBQVEzQjtBQUhILHFEQUFyQjtBQUtBLHdEQUFJMkIsUUFBUTVCLFdBQVosRUFBeUI7QUFDckI2Qix1RUFBZUMsUUFBZixHQUEwQkYsUUFBUUUsUUFBbEM7QUFDQUQsdUVBQWVFLFVBQWYsR0FBNEJILFFBQVFHLFVBQXBDO0FBQ0g7QUFDRCx3REFBSUgsUUFBUTNCLFVBQVosRUFBd0I7QUFDcEI0Qix1RUFBZUcsVUFBZixHQUE0QkosUUFBUUksVUFBcEM7QUFDSDtBQUNEbEMsa0VBQWNsRixJQUFkLENBQW1CaUgsY0FBbkI7QUFDSDtBQUNKO0FBbEIyQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQW1CNUMsNENBQUkvQixjQUFjekUsTUFBZCxLQUF5QixDQUE3QixFQUFnQztBQUM1QixtREFBTyxJQUFQO0FBQ0gseUNBRkQsTUFFTztBQUNILG1EQUFPeUUsYUFBUDtBQUNIO0FBQ0oscUNBeEJtQixDQXdCakJyQixlQUFlcUIsYUF4QkUsQ0FBcEI7O0FBMEJBcEUsb0RBQWdCZCxJQUFoQixDQUFxQjtBQUNqQnVCLCtDQUFPc0MsZUFBZXRDLEtBREw7QUFFakJ3QyxrREFBVUYsZUFBZUUsUUFGUjtBQUdqQmEsNkNBQUtmLGVBQWVlLEdBSEg7QUFJakJFLDZDQUFLakIsZUFBZWlCLEdBSkg7QUFLakJDLDZDQUFLbEIsZUFBZWtCLEdBTEg7QUFNakJHLHVEQUFlQSxhQU5FO0FBT2pCMUQsOENBQU1tRixPQVBXO0FBUWpCM0IsdURBQWVBLGFBUkU7QUFTakJDLHlEQUFpQnBCLGVBQWVvQjtBQVRmLHFDQUFyQjtBQVdIO0FBL0VpQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWdGbEMsbUNBQU9uRSxlQUFQO0FBQ0gseUJBakY4QixFQUEvQjtBQWtGSCxxQkFuRkQsTUFtRk8sSUFBSXJELGFBQWE2QixXQUFiLEtBQTZCLE1BQTdCLElBQXVDN0IsYUFBYTZCLFdBQWIsS0FBNkIsTUFBeEUsRUFBZ0Y7QUFDbkYsNEJBQUk3QixhQUFhOEIsYUFBakIsRUFBZ0M7QUFDNUI5Qix5Q0FBYTRKLFVBQWIsR0FBMEI1SixhQUFhOEIsYUFBYixDQUEyQjhILFVBQXJEO0FBQ0EsbUNBQU81SixhQUFhOEIsYUFBcEI7QUFDSDtBQUNKOztBQUVELDJCQUFPOUIsWUFBUDtBQUNIO0FBcnNCMkY7QUFBQTtBQUFBLGdEQXVzQjVFO0FBQUE7O0FBQUU7QUFDVix3QkFBSTZKLFdBQVd0TCxHQUFHdUwsS0FBSCxFQUFmO0FBQUEsd0JBQ0luRixZQUFZLEtBQUtvRixjQUFMLEVBRGhCO0FBQUEsd0JBRUlDLGFBQWE7QUFDVGhMLGtDQUFVMkYsVUFBVTNGLFFBRFg7QUFFVHFFLHlDQUFpQnNCLFVBQVV0QixlQUZsQjtBQUdUQyx3Q0FBZ0JxQixVQUFVckIsY0FIakI7QUFJVHpCLHFDQUFhOEMsVUFBVTlDLFdBSmQ7QUFLVCtILG9DQUFZakYsVUFBVWlGO0FBTGIscUJBRmpCO0FBU0E5SixrQ0FBY1IsYUFBZCxDQUE0QjBLLFVBQTVCLEVBQXdDcEgsSUFBeEMsQ0FBNkMsVUFBQ0MsR0FBRCxFQUFTO0FBQ2xELDRCQUFJLFFBQUt0QixNQUFMLENBQVlzRCxnQkFBWixJQUFnQyxTQUFwQyxFQUErQztBQUMzQ3pHLHdDQUFZNkwsVUFBWixDQUF1QixvQkFBdkI7QUFDQUoscUNBQVNLLE9BQVQsQ0FBaUIsUUFBakI7QUFDSCx5QkFIRCxNQUdPO0FBQ0g5TCx3Q0FBWStMLFdBQVosQ0FBd0Isa0JBQXhCLEVBQTRDdkgsSUFBNUMsQ0FBaUQsWUFBTTtBQUNuRDlDLDhDQUFjRixZQUFkLENBQTJCLFFBQUsyQixNQUFMLENBQVl2QyxRQUF2QyxFQUFpRDZELElBQUlDLElBQUosQ0FBU0MsTUFBMUQsRUFBa0VILElBQWxFLENBQXVFLFlBQU07QUFDekV4RSxnREFBWTZMLFVBQVosQ0FBdUIsV0FBdkI7QUFDQUosNkNBQVNLLE9BQVQsQ0FBaUIsUUFBakI7QUFDSCxpQ0FIRCxFQUdHLFVBQUNySCxHQUFELEVBQVM7QUFDUnpFLGdEQUFZZ00sV0FBWixDQUF3QjtBQUNwQkMsK0NBQU8sT0FEYTtBQUVwQkMsNkNBQUt6SCxJQUFJQyxJQUFKLENBQVN5SDtBQUZNLHFDQUF4QjtBQUlBViw2Q0FBU0ssT0FBVCxDQUFpQixjQUFqQjtBQUNILGlDQVREO0FBVUgsNkJBWEQsRUFXRyxZQUFNO0FBQ0xMLHlDQUFTSyxPQUFULENBQWlCLFNBQWpCO0FBQ0gsNkJBYkQ7QUFjSDtBQUNKLHFCQXBCRCxFQW9CRyxVQUFDckgsR0FBRCxFQUFTO0FBQ1J6RSxvQ0FBWWdNLFdBQVosQ0FBd0I7QUFDcEJDLG1DQUFPLFNBRGE7QUFFcEJDLGlDQUFLekgsSUFBSUMsSUFBSixDQUFTeUg7QUFGTSx5QkFBeEI7QUFJQVYsaUNBQVNXLE1BQVQsQ0FBZ0IsUUFBaEI7QUFDSCxxQkExQkQ7QUEyQkEsMkJBQU9YLFNBQVNZLE9BQWhCO0FBQ0g7QUFDRDs7QUE5dUJ3RjtBQUFBO0FBQUEsdUNBK3VCckY7QUFDSCwyQkFBT3hNLE1BQU11QixJQUFOLENBQVcsc0NBQXNDLEtBQUsrQixNQUFMLENBQVl2QyxRQUE3RCxDQUFQO0FBQ0g7QUFqdkIyRjtBQUFBO0FBQUEsd0NBa3ZCcEY7QUFDQSwyQkFBT2YsTUFBTXVCLElBQU4sQ0FBVyx1Q0FBdUMsS0FBSytCLE1BQUwsQ0FBWXZDLFFBQTlELENBQVA7QUFDSDtBQUNEOztBQXJ2QndGO0FBQUE7QUFBQSx3Q0FzdkJwRjtBQUFBOztBQUNBLHdCQUFJNkssV0FBV3RMLEdBQUd1TCxLQUFILEVBQWY7QUFDQSx3QkFBSWpDLGdCQUFnQnZKLE9BQU93SixJQUFQLENBQVk7QUFDNUJDLG1DQUFXLElBRGlCO0FBRTVCQyxxQ0FBYSxpQkFGZTtBQUc1QkMsb0NBQVksZUFIZ0I7QUFJNUJDLDhCQUFNLElBSnNCO0FBSzVCZ0MsaUNBQVM7QUFDTFEseUNBQWE7QUFBQSx1Q0FBTSxRQUFLbkosTUFBTCxDQUFZdUQsZUFBbEI7QUFBQTtBQURSO0FBTG1CLHFCQUFaLENBQXBCO0FBU0ErQyxrQ0FBYzlFLE1BQWQsQ0FBcUJILElBQXJCLENBQTBCLFVBQUNqRCxRQUFELEVBQWM7QUFDcENBLG1DQUFXZ0wsU0FBU2hMLFFBQVQsQ0FBWDtBQUNBLDRCQUFJQSxhQUFhLFFBQUs0QixNQUFMLENBQVl1RCxlQUE3QixFQUE4QztBQUMxQzFHLHdDQUFZZ00sV0FBWixDQUF3QixVQUF4QjtBQUNBUCxxQ0FBU1csTUFBVDtBQUNBO0FBQ0g7QUFDRCw0QkFBSW5CLE1BQU0xSixXQUFXLFFBQUs0QixNQUFMLENBQVl1RCxlQUF2QixHQUF5QywyQkFBekMsR0FBdUUsNkJBQWpGO0FBQ0E3Ryw4QkFBTXVCLElBQU4sQ0FBVzZKLE1BQU0sWUFBTixHQUFxQixRQUFLOUgsTUFBTCxDQUFZdkMsUUFBakMsR0FBNEMsWUFBNUMsR0FBMkRXLFFBQTNELEdBQXNFLFdBQXRFLEdBQW9GLFFBQUs0QixNQUFMLENBQVlHLGVBQVosQ0FBNEIsQ0FBNUIsRUFBK0JuQyxPQUE5SCxFQUF1SXFELElBQXZJLENBQTRJLFVBQUNDLEdBQUQsRUFBUztBQUNqSnpFLHdDQUFZNkwsVUFBWixDQUF1QixPQUF2QjtBQUNBSixxQ0FBU0ssT0FBVCxDQUFpQnJILElBQUlDLElBQUosQ0FBU0MsTUFBMUI7QUFDSCx5QkFIRCxFQUdHLFlBQVk7QUFDWDNFLHdDQUFZZ00sV0FBWixDQUF3QixPQUF4QjtBQUNBUCxxQ0FBU1csTUFBVCxDQUFnQixjQUFoQjtBQUNILHlCQU5EO0FBT0gscUJBZkQsRUFlRyxZQUFZO0FBQ1hYLGlDQUFTVyxNQUFULENBQWdCLFNBQWhCO0FBQ0gscUJBakJEO0FBa0JBLDJCQUFPWCxTQUFTWSxPQUFoQjtBQUNIO0FBQ0Q7O0FBcnhCd0Y7QUFBQTtBQUFBLGlEQXN4QjNFO0FBQUE7O0FBQ1Qsd0JBQUlaLFdBQVd0TCxHQUFHdUwsS0FBSCxFQUFmO0FBQ0Esd0JBQUljLGtCQUFrQnRNLE9BQU93SixJQUFQLENBQVk7QUFDOUJDLG1DQUFXLElBRG1CO0FBRTlCQyxxQ0FBYSx1QkFGaUI7QUFHOUJDLG9DQUFZLHFCQUhrQjtBQUk5QkMsOEJBQU0sSUFKd0I7QUFLOUJnQyxpQ0FBUztBQUNMVyx3Q0FBWTtBQUFBLHVDQUFNLFFBQUt0SixNQUFYO0FBQUE7QUFEUDtBQUxxQixxQkFBWixDQUF0QjtBQVNBcUosb0NBQWdCN0gsTUFBaEIsQ0FBdUJILElBQXZCLENBQTRCLFVBQUNrSSxTQUFELEVBQWU7QUFDdkNoTCxzQ0FBY0osY0FBZCxDQUE2QixRQUFLNkIsTUFBTCxDQUFZdkMsUUFBekMsRUFBbUQ4TCxVQUFVekwsU0FBN0QsRUFBd0V5TCxVQUFVbkwsUUFBbEYsRUFBNEZpRCxJQUE1RixDQUFpRyxVQUFDQyxHQUFELEVBQVM7QUFDdEdnSCxxQ0FBU0ssT0FBVCxDQUFpQnJILElBQUlDLElBQUosQ0FBU0MsTUFBMUI7QUFDSCx5QkFGRCxFQUVHLFlBQU07QUFDTDhHLHFDQUFTVyxNQUFUO0FBQ0gseUJBSkQ7QUFLSCxxQkFORCxFQU1HLFlBQU07QUFDTFgsaUNBQVNXLE1BQVQsQ0FBZ0IsU0FBaEI7QUFDSCxxQkFSRDtBQVNBLDJCQUFPWCxTQUFTWSxPQUFoQjtBQUNIO0FBQ0Q7O0FBNXlCd0Y7QUFBQTtBQUFBLGdEQTZ5QjVFO0FBQUE7O0FBQ1Isd0JBQUlaLFdBQVd0TCxHQUFHdUwsS0FBSCxFQUFmO0FBQ0Esd0JBQUljLGtCQUFrQnRNLE9BQU93SixJQUFQLENBQVk7QUFDOUJDLG1DQUFXLElBRG1CO0FBRTlCQyxxQ0FBYSx1QkFGaUI7QUFHOUJDLG9DQUFZLHFCQUhrQjtBQUk5QkMsOEJBQU0sSUFKd0I7QUFLOUJnQyxpQ0FBUztBQUNMVyx3Q0FBWTtBQUFBLHVDQUFNLFFBQUt0SixNQUFYO0FBQUE7QUFEUDtBQUxxQixxQkFBWixDQUF0QjtBQVNBcUosb0NBQWdCN0gsTUFBaEIsQ0FBdUJILElBQXZCLENBQTRCLFVBQUNrSSxTQUFELEVBQWU7QUFDdkMsNEJBQUlDLG1CQUFtQixRQUFLeEosTUFBTCxDQUFZRyxlQUFaLENBQTRCLENBQTVCLEVBQStCbkMsT0FBdEQ7QUFDQSw0QkFBSXdMLHFCQUFxQkQsVUFBVXpMLFNBQW5DLEVBQThDO0FBQzFDakIsd0NBQVlnTSxXQUFaLENBQXdCLFlBQXhCO0FBQ0FQLHFDQUFTVyxNQUFULENBQWdCLFNBQWhCO0FBQ0gseUJBSEQsTUFHTyxJQUFJTyxtQkFBbUJELFVBQVV6TCxTQUFqQyxFQUE0QztBQUMvQ1MsMENBQWNKLGNBQWQsQ0FBNkIsUUFBSzZCLE1BQUwsQ0FBWXZDLFFBQXpDLEVBQW1EOEwsVUFBVXpMLFNBQTdELEVBQXdFeUwsVUFBVW5MLFFBQWxGLEVBQTRGaUQsSUFBNUYsQ0FBaUcsVUFBQ0MsR0FBRCxFQUFTO0FBQ3RHekUsNENBQVk2TCxVQUFaLENBQXVCLFdBQXZCO0FBQ0FKLHlDQUFTSyxPQUFULENBQWlCckgsSUFBSUMsSUFBSixDQUFTQyxNQUExQjtBQUNILDZCQUhELEVBR0csWUFBTTtBQUNMM0UsNENBQVlnTSxXQUFaLENBQXdCLFdBQXhCO0FBQ0FQLHlDQUFTVyxNQUFUO0FBQ0gsNkJBTkQ7QUFPSCx5QkFSTSxNQVFBO0FBQ0gxSywwQ0FBY0YsWUFBZCxDQUEyQixRQUFLMkIsTUFBTCxDQUFZdkMsUUFBdkMsRUFBaUQ4TCxVQUFVekwsU0FBM0QsRUFBc0V5TCxVQUFVbkwsUUFBaEYsRUFBMEZpRCxJQUExRixDQUErRixVQUFDQyxHQUFELEVBQVM7QUFDcEd6RSw0Q0FBWTZMLFVBQVosQ0FBdUIsV0FBdkI7QUFDQUoseUNBQVNLLE9BQVQsQ0FBaUJySCxJQUFJQyxJQUFKLENBQVNDLE1BQTFCO0FBQ0gsNkJBSEQsRUFHRyxZQUFNO0FBQ0wzRSw0Q0FBWTZMLFVBQVosQ0FBdUIsV0FBdkI7QUFDQUoseUNBQVNXLE1BQVQ7QUFDSCw2QkFORDtBQU9IO0FBQ0oscUJBdEJELEVBc0JHLFlBQU07QUFDTFgsaUNBQVNXLE1BQVQsQ0FBZ0IsU0FBaEI7QUFDSCxxQkF4QkQ7QUF5QkEsMkJBQU9YLFNBQVNZLE9BQWhCO0FBQ0g7QUFDRDs7QUFuMUJ3RjtBQUFBO0FBQUEsK0NBbzFCN0U7QUFBQTs7QUFDUCx3QkFBSVosV0FBV3RMLEdBQUd1TCxLQUFILEVBQWY7QUFDQSx3QkFBSWMsa0JBQWtCdE0sT0FBT3dKLElBQVAsQ0FBWTtBQUM5QkMsbUNBQVcsSUFEbUI7QUFFOUJDLHFDQUFhLHVCQUZpQjtBQUc5QkMsb0NBQVkscUJBSGtCO0FBSTlCQyw4QkFBTSxJQUp3QjtBQUs5QmdDLGlDQUFTO0FBQ0xXLHdDQUFZO0FBQUEsdUNBQU0sUUFBS3RKLE1BQVg7QUFBQTtBQURQO0FBTHFCLHFCQUFaLENBQXRCO0FBU0FxSixvQ0FBZ0I3SCxNQUFoQixDQUF1QkgsSUFBdkIsQ0FBNEIsVUFBQ2tJLFNBQUQsRUFBZTtBQUN2Q2hMLHNDQUFjRCxXQUFkLENBQTBCLFFBQUswQixNQUFMLENBQVl2QyxRQUF0QyxFQUFnRDhMLFVBQVV6TCxTQUExRCxFQUFxRXlMLFVBQVVuTCxRQUEvRSxFQUF5RmlELElBQXpGLENBQThGLFVBQUNDLEdBQUQsRUFBUztBQUNuR2dILHFDQUFTSyxPQUFULENBQWlCckgsSUFBSUMsSUFBSixDQUFTQyxNQUExQjtBQUNILHlCQUZELEVBRUcsWUFBTTtBQUNMOEcscUNBQVNXLE1BQVQ7QUFDSCx5QkFKRDtBQUtILHFCQU5ELEVBTUcsWUFBTTtBQUNMWCxpQ0FBU1csTUFBVCxDQUFnQixTQUFoQjtBQUNILHFCQVJEO0FBU0EsMkJBQU9YLFNBQVNZLE9BQWhCO0FBQ0g7QUFDRDs7QUExMkJ3RjtBQUFBO0FBQUEsMENBMjJCbkY7QUFDRCwyQkFBT3hNLE1BQU0rTSxNQUFOLENBQWEsb0JBQW9CLEtBQUt6SixNQUFMLENBQVl2QyxRQUE3QyxDQUFQO0FBQ0g7QUFDRDs7QUE5MkJ3RjtBQUFBO0FBQUEseUNBKzJCbkY7QUFBQTs7QUFDTCx3QkFBSTZLLFdBQVd0TCxHQUFHdUwsS0FBSCxFQUFmO0FBQUEsd0JBQ0ltQixNQUFNLEtBQUtsQixjQUFMLEVBRFY7O0FBR0EsNkJBQVNtQixZQUFULEdBQXdCO0FBQ3BCak4sOEJBQU11QixJQUFOLENBQVcsbUJBQVgsRUFBZ0MxQixRQUFRMkIsTUFBUixDQUFld0wsR0FBZixDQUFoQyxFQUFxRHJJLElBQXJELENBQTBELFlBQU07QUFDNURpSCxxQ0FBU0ssT0FBVDtBQUNILHlCQUZELEVBRUcsVUFBQ3JILEdBQUQsRUFBUztBQUNSZ0gscUNBQVNXLE1BQVQsQ0FBZ0I7QUFDWnBKLHNDQUFNLFFBRE07QUFFWmtKLHFDQUFLekgsSUFBSUMsSUFBSixDQUFTeUg7QUFGRiw2QkFBaEI7QUFJSCx5QkFQRDtBQVFIOztBQUVELHdCQUFJLEtBQUtySyxjQUFULEVBQXlCO0FBQUE7QUFDckIsZ0NBQUkwRixZQUFZLFFBQUtyRSxNQUFMLENBQVlxRSxTQUE1QjtBQUNBLGdDQUFJdUYsZUFBZSxDQUFDdkYsU0FBRCxDQUFuQjtBQUNBbkgsd0NBQVkyTSxZQUFaLENBQXlCLFFBQUt0SyxjQUFMLENBQW9Cb0UsT0FBcEIsQ0FBNEJoRSxFQUFyRCxFQUF5RGlLLFlBQXpELEVBQXVFdkksSUFBdkUsQ0FBNEUsWUFBTTtBQUM5RSx3Q0FBS3lJLG9CQUFMO0FBQ0Esd0NBQUtwTCxhQUFMLENBQW1Cc0MsSUFBbkIsQ0FBd0JxRCxTQUF4QjtBQUNBLHdDQUFLMEYsZUFBTCxDQUFxQjFGLFNBQXJCO0FBQ0FzRjtBQUNILDZCQUxELEVBS0csVUFBQ3JJLEdBQUQsRUFBUztBQUNSZ0gseUNBQVNXLE1BQVQsQ0FBZ0I7QUFDWnBKLDBDQUFNLFdBRE07QUFFWmtKLHlDQUFLekgsSUFBSUMsSUFBSixDQUFTeUg7QUFGRixpQ0FBaEI7QUFJSCw2QkFWRDtBQUhxQjtBQWN4QixxQkFkRCxNQWNPO0FBQ0hXO0FBQ0g7QUFDRCwyQkFBT3JCLFNBQVNZLE9BQWhCO0FBQ0g7QUFoNUIyRjtBQUFBO0FBQUEsNkNBaTVCL0VjLFFBajVCK0UsRUFpNUJyRTtBQUNyQix3QkFBSU4sTUFBTSxLQUFLbEIsY0FBTCxFQUFWO0FBQ0FrQix3QkFBSXJCLFVBQUosR0FBaUIsRUFBakI7O0FBRUEsMkJBQU8zTCxNQUFNdUIsSUFBTiw2QkFBdUMxQixRQUFRMkIsTUFBUixDQUFld0wsR0FBZixDQUF2QyxDQUFQO0FBQ0Q7QUF0NUIyRjs7QUFBQTtBQUFBOztBQUFBLFlBdzVCMUZPLGtCQXg1QjBGO0FBeTVCNUYsd0NBQVlDLFNBQVosRUFBdUI7QUFBQTs7QUFDbkIscUJBQUtDLFVBQUwsR0FBa0IsS0FBbEI7QUFDQSxxQkFBS0MsbUJBQUwsR0FBMkIsS0FBM0I7QUFDQSxxQkFBS0MsWUFBTCxHQUFvQixFQUFwQjtBQUNBLHFCQUFLQyxhQUFMLEdBQXFCLEVBQXJCO0FBQ0E7QUFDQSxxQkFBS0MsYUFBTCxHQUFxQixDQUFyQjtBQUNBO0FBQ0EscUJBQUtDLHNCQUFMLEdBQThCLENBQTlCO0FBQ0EscUJBQUt0SyxJQUFMLENBQVVnSyxTQUFWO0FBQ0g7O0FBbjZCMkY7QUFBQTtBQUFBLHFDQW82QnZGQSxTQXA2QnVGLEVBbzZCNUU7QUFDUix5QkFBS0MsVUFBTCxHQUFrQixLQUFsQjtBQUNBLHlCQUFLQyxtQkFBTCxHQUEyQixLQUEzQjtBQUNBLHlCQUFLQyxZQUFMLEdBQXFCLFlBQU07QUFDdkJILG9DQUFZQSxhQUFhLEVBQXpCO0FBRHVCO0FBQUE7QUFBQTs7QUFBQTtBQUV2QixtREFBcUJBLFNBQXJCLHdJQUFnQztBQUFBLG9DQUF2Qk8sUUFBdUI7O0FBQzVCQSx5Q0FBU3hHLFVBQVQsR0FBc0IsS0FBdEI7QUFDQXdHLHlDQUFTQyxTQUFULEdBQXFCLElBQXJCO0FBQ0Esb0NBQUlELFNBQVNFLFVBQWIsRUFBeUI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDckIsK0RBQXNCRixTQUFTRSxVQUEvQix3SUFBMkM7QUFBQSxnREFBbENDLFNBQWtDOztBQUN2Q0Esc0RBQVVDLGdCQUFWLEdBQTZCRCxVQUFVRSxXQUFWLENBQXNCQyxTQUF0QixDQUFnQyxDQUFoQyxFQUFtQyxFQUFuQyxDQUE3QjtBQUNIO0FBSG9CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJeEI7QUFDSjtBQVZzQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVd2QiwrQkFBT2IsU0FBUDtBQUNILHFCQVptQixFQUFwQjtBQWFIO0FBQ0Q7O0FBcjdCd0Y7QUFBQTtBQUFBLG9EQXM3QnhFTyxRQXQ3QndFLEVBczdCOUQ7QUFDMUIseUJBQUtMLG1CQUFMLEdBQTJCLEtBQTNCO0FBQ0EseUJBQUtJLHNCQUFMLEdBQThCLENBQTlCO0FBQ0EseUJBQUtGLGFBQUwsR0FBcUJHLFNBQVNFLFVBQVQsSUFBdUIsRUFBNUM7QUFIMEI7QUFBQTtBQUFBOztBQUFBO0FBSTFCLCtDQUFzQixLQUFLTCxhQUEzQix3SUFBMEM7QUFBQSxnQ0FBakNNLFNBQWlDOztBQUN0Q0Esc0NBQVUzRyxVQUFWLEdBQXVCLEtBQXZCO0FBQ0g7QUFOeUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU83QjtBQTc3QjJGO0FBQUE7QUFBQSw4Q0E4N0I5RStHLFFBOTdCOEUsRUE4N0JwRTtBQUNwQix5QkFBS2IsVUFBTCxHQUFrQixLQUFsQjtBQUNBLHlCQUFLSSxhQUFMLEdBQXFCLENBQXJCO0FBRm9CO0FBQUE7QUFBQTs7QUFBQTtBQUdwQiwrQ0FBcUIsS0FBS0YsWUFBMUIsd0lBQXdDO0FBQUEsZ0NBQS9CSSxRQUErQjs7QUFDcENBLHFDQUFTeEcsVUFBVCxHQUFzQixLQUF0QjtBQUNBd0cscUNBQVNDLFNBQVQsR0FBcUJELFNBQVNRLFlBQVQsQ0FBc0IvRCxPQUF0QixDQUE4QjhELFFBQTlCLE1BQTRDLENBQUMsQ0FBbEU7QUFDSDtBQU5tQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBT3ZCO0FBcjhCMkY7QUFBQTtBQUFBLHFEQXM4QnZFSixTQXQ4QnVFLEVBczhCNUQ7QUFDeEIsd0JBQUlNLGlCQUFpQixJQUFyQjtBQUNBLHdCQUFJTixVQUFVM0csVUFBZCxFQUEwQjtBQUN0Qiw2QkFBS3VHLHNCQUFMO0FBQ0E7QUFGc0I7QUFBQTtBQUFBOztBQUFBO0FBR3RCLG1EQUFzQixLQUFLRixhQUEzQix3SUFBMEM7QUFBQSxvQ0FBakNNLFVBQWlDOztBQUN0QyxvQ0FBSSxDQUFDQSxXQUFVM0csVUFBZixFQUEyQjtBQUN2QmlILHFEQUFpQixLQUFqQjtBQUNBO0FBQ0g7QUFDSjtBQVJxQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVN0Qiw0QkFBSUEsY0FBSixFQUFvQjtBQUNoQixpQ0FBS2QsbUJBQUwsR0FBMkIsSUFBM0I7QUFDSDtBQUNKLHFCQVpELE1BWU87QUFDSCw2QkFBS0ksc0JBQUw7QUFDQSw2QkFBS0osbUJBQUwsR0FBMkIsS0FBM0I7QUFDSDtBQUNKO0FBQ0Q7O0FBejlCd0Y7QUFBQTtBQUFBLGtEQTA5QjFFQSxtQkExOUIwRSxFQTA5QnJEO0FBQy9CLHlCQUFLQSxtQkFBTCxHQUEyQixPQUFPQSxtQkFBUCxLQUErQixXQUEvQixHQUE2QyxDQUFDLEtBQUtBLG1CQUFuRCxHQUF5RUEsbUJBQXBHO0FBQ0EseUJBQUtJLHNCQUFMLEdBQThCLEtBQUtKLG1CQUFMLEdBQTJCLEtBQUtFLGFBQUwsQ0FBbUI3SSxNQUE5QyxHQUF1RCxDQUFyRjtBQUYrQjtBQUFBO0FBQUE7O0FBQUE7QUFHL0IsK0NBQXNCLEtBQUs2SSxhQUEzQix3SUFBMEM7QUFBQSxnQ0FBakNNLFNBQWlDOztBQUN0Q0Esc0NBQVUzRyxVQUFWLEdBQXVCLEtBQUttRyxtQkFBNUI7QUFDSDtBQUw4QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBTWxDO0FBQ0Q7O0FBaitCd0Y7QUFBQTtBQUFBLDRDQWsrQmhGSyxRQWwrQmdGLEVBaytCdEU7QUFDZCx3QkFBSVMsaUJBQWlCLElBQXJCO0FBQ0Esd0JBQUlULFNBQVN4RyxVQUFiLEVBQXlCO0FBQ3JCLDZCQUFLc0csYUFBTDtBQUNBO0FBRnFCO0FBQUE7QUFBQTs7QUFBQTtBQUdyQixtREFBcUIsS0FBS0YsWUFBMUIsd0lBQXdDO0FBQUEsb0NBQS9CSSxTQUErQjs7QUFDcEMsb0NBQUlBLFVBQVNDLFNBQVQsSUFBc0IsQ0FBQ0QsVUFBU3hHLFVBQXBDLEVBQWdEO0FBQzVDaUgscURBQWlCLEtBQWpCO0FBQ0E7QUFDSDtBQUNKO0FBUm9CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBU3JCLDRCQUFJQSxjQUFKLEVBQW9CO0FBQ2hCLGlDQUFLZixVQUFMLEdBQWtCLElBQWxCO0FBQ0g7QUFDSixxQkFaRCxNQVlPO0FBQ0gsNkJBQUtJLGFBQUw7QUFDQSw2QkFBS0osVUFBTCxHQUFrQixLQUFsQjtBQUNIO0FBQ0o7QUFDRDs7QUFyL0J3RjtBQUFBO0FBQUEsaURBcy9CM0VBLFVBdC9CMkUsRUFzL0IvRDtBQUN6Qix5QkFBS0EsVUFBTCxHQUFrQixPQUFPQSxVQUFQLEtBQXNCLFdBQXRCLEdBQW9DLEtBQUtBLFVBQXpDLEdBQXNEQSxVQUF4RTtBQUNBLHlCQUFLSSxhQUFMLEdBQXFCLENBQXJCO0FBRnlCO0FBQUE7QUFBQTs7QUFBQTtBQUd6QiwrQ0FBcUIsS0FBS0YsWUFBMUIsd0lBQXdDO0FBQUEsZ0NBQS9CSSxRQUErQjs7QUFDcEMsZ0NBQUlBLFNBQVNDLFNBQVQsSUFBc0IsS0FBS1AsVUFBL0IsRUFBMkM7QUFDdkNNLHlDQUFTeEcsVUFBVCxHQUFzQixJQUF0QjtBQUNBLHFDQUFLc0csYUFBTDtBQUNILDZCQUhELE1BR087QUFDSEUseUNBQVN4RyxVQUFULEdBQXNCLEtBQXRCO0FBQ0g7QUFDSjtBQVZ3QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBVzVCO0FBamdDMkY7O0FBQUE7QUFBQTs7QUFBQSxZQW9nQzFGa0gsVUFwZ0MwRjtBQXFnQzVGLGdDQUFZQyxVQUFaLEVBQXdCO0FBQUE7O0FBQ3BCLHFCQUFLQyxNQUFMLEdBQWMsRUFBZDtBQUNBLHFCQUFLQyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0EscUJBQUtGLFVBQUwsR0FBa0IsRUFBbEI7QUFDQSxxQkFBS0cscUJBQUwsR0FBNkIsSUFBSXRCLGtCQUFKLEVBQTdCO0FBQ0EscUJBQUsvSixJQUFMLENBQVVrTCxVQUFWO0FBQ0g7O0FBM2dDMkY7QUFBQTtBQUFBLHFDQTRnQ3ZGQSxVQTVnQ3VGLEVBNGdDM0U7QUFDYix5QkFBS0EsVUFBTCxHQUFrQkEsY0FBYyxFQUFoQztBQUNIO0FBOWdDMkY7QUFBQTtBQUFBLDZDQStnQy9FM04sUUEvZ0MrRSxFQStnQ3JFK04sVUEvZ0NxRSxFQStnQ3pEbkgsU0EvZ0N5RCxFQStnQzlDb0gsZ0JBL2dDOEMsRUErZ0M1QjtBQUFBOztBQUN4RCx3QkFBSW5ELFdBQVd0TCxHQUFHdUwsS0FBSCxFQUFmO0FBQ0Esd0JBQUksQ0FBQzlLLFFBQUwsRUFBZTtBQUNYLDZCQUFLNE4sTUFBTCxDQUFZMUwsRUFBWixHQUFpQixJQUFqQjtBQUNBLDZCQUFLMEwsTUFBTCxDQUFZekwsSUFBWixHQUFtQixJQUFuQjtBQUNBLDZCQUFLeUwsTUFBTCxDQUFZaEgsU0FBWixHQUF3QixJQUF4QjtBQUNBLDZCQUFLa0gscUJBQUwsQ0FBMkJyTCxJQUEzQjtBQUNBb0ksaUNBQVNXLE1BQVQ7QUFDSCxxQkFORCxNQU1PO0FBQ0gsNkJBQUtvQyxNQUFMLENBQVkxTCxFQUFaLEdBQWlCbEMsUUFBakI7QUFDQSw2QkFBSzROLE1BQUwsQ0FBWXpMLElBQVosR0FBbUI0TCxVQUFuQjtBQUNBLDZCQUFLSCxNQUFMLENBQVloSCxTQUFaLEdBQXdCQSxTQUF4QjtBQUNBLDZCQUFLaUgsU0FBTCxHQUFpQixJQUFqQjtBQUNBLDRCQUFJLENBQUNHLGdCQUFMLEVBQXVCO0FBQ25CbE4sMENBQWNaLFlBQWQsQ0FBMkJGLFFBQTNCLEVBQXFDNEQsSUFBckMsQ0FBMEMsVUFBQ0MsR0FBRCxFQUFTO0FBQy9DLHdDQUFLaUsscUJBQUwsQ0FBMkJyTCxJQUEzQixDQUFnQ29CLElBQUlDLElBQUosQ0FBU0MsTUFBekM7QUFDQThHLHlDQUFTSyxPQUFUO0FBQ0gsNkJBSEQsRUFHRzlGLE9BSEgsQ0FHVyxZQUFZO0FBQ25CeUYseUNBQVNXLE1BQVQ7QUFDQSxxQ0FBS3FDLFNBQUwsR0FBaUIsS0FBakI7QUFDSCw2QkFORDtBQU9IO0FBQ0o7QUFDRCwyQkFBT2hELFNBQVNZLE9BQWhCO0FBQ0g7QUFDRDs7QUF4aUN3RjtBQUFBO0FBQUEsNkNBeWlDL0V3QyxXQXppQytFLEVBeWlDbEUzTCxPQXppQ2tFLEVBeWlDekQ7QUFDL0Isd0JBQUl0QyxpQkFBSjtBQUFBLHdCQUFjK04sbUJBQWQ7QUFBQSx3QkFBMEJuSCxrQkFBMUI7QUFEK0I7QUFBQTtBQUFBOztBQUFBO0FBRS9CLCtDQUFtQixLQUFLK0csVUFBeEIsd0lBQW9DO0FBQUEsZ0NBQTNCQyxNQUEyQjs7QUFDaENBLG1DQUFPTSxhQUFQLEdBQXVCRCxjQUFjTCxPQUFPSyxXQUFQLEtBQXVCQSxXQUFyQyxHQUFtRCxJQUExRTtBQUNBTCxtQ0FBT08sVUFBUCxHQUFvQjdMLFVBQVVzTCxPQUFPdEwsT0FBUCxLQUFtQkEsT0FBN0IsR0FBdUMsSUFBM0Q7QUFDQTtBQUNBLGdDQUFJLE9BQU90QyxRQUFQLEtBQW9CLFdBQXBCLElBQW1DNE4sT0FBT00sYUFBMUMsSUFBMkROLE9BQU9PLFVBQXRFLEVBQWtGO0FBQzlFbk8sMkNBQVc0TixPQUFPNU4sUUFBbEI7QUFDQStOLDZDQUFhSCxPQUFPRyxVQUFwQjtBQUNBbkgsNENBQVlnSCxPQUFPaEgsU0FBbkI7QUFDSDtBQUVKO0FBWjhCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBYS9CLDJCQUFPLE9BQU81RyxRQUFQLEtBQW9CLFdBQXBCLEdBQWtDLEtBQUtvTyxZQUFMLEVBQWxDLEdBQXdELEtBQUtBLFlBQUwsQ0FBa0JwTyxRQUFsQixFQUE0QitOLFVBQTVCLEVBQXdDbkgsU0FBeEMsQ0FBL0Q7QUFDSDtBQXZqQzJGOztBQUFBO0FBQUE7O0FBMGpDaEc7OztBQUNBLFlBQU1sSCxjQUFjTCxXQUFXZ1AsZ0JBQVgsQ0FBNEI7QUFDNUNYLHdCQUFZQSxVQURnQztBQUU1QzNNLG9CQUFRQTtBQUZvQyxTQUE1QixDQUFwQjtBQUlBLGVBQU87QUFDSEQsMkJBQWVBLGFBRFo7QUFFSHBCLHlCQUFhQTtBQUZWLFNBQVA7QUFJSDtBQUNEVixrQkFBY3NQLE9BQWQsR0FBd0IsQ0FBQyxPQUFELEVBQVUsY0FBVixFQUEwQixZQUExQixFQUF3QyxhQUF4QyxFQUF1RCxZQUF2RCxFQUFxRSxRQUFyRSxFQUErRSxJQUEvRSxFQUFxRixPQUFyRixDQUF4QjtBQUNBelAsaUJBQWEwUCxPQUFiLENBQXFCLGFBQXJCLEVBQW9DdlAsYUFBcEM7QUFDQUwsV0FBT0UsWUFBUCxHQUFzQkEsWUFBdEI7QUFDSCxDQTNrQ0QsRUEya0NHRixNQTNrQ0giLCJmaWxlIjoiY29tbW9uL2RlcGxveU1vZHVsZS9kZXBsb3lNb2R1bGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQGF1dGhvciAgQ2hhbmRyYUxlZVxuICogQGRlc2NyaXB0aW9uICDpg6jnvbLmqKHlnZdcbiAqL1xuXG4oKHdpbmRvdywgdW5kZWZpbmVkKSA9PiB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGxldCBkZXBsb3lNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnZGVwbG95TW9kdWxlJywgW10pO1xuXG4gICAgZnVuY3Rpb24gRGVwbG95U2VydmljZSgkaHR0cCwgJGRvbWVDbHVzdGVyLCAkZG9tZUltYWdlLCAkZG9tZVB1YmxpYywgJGRvbWVNb2RlbCwgJG1vZGFsLCAkcSwgJHV0aWwpIHtcbiAgICAgICAgY29uc3Qgbm9kZVNlcnZpY2UgPSAkZG9tZUNsdXN0ZXIuZ2V0SW5zdGFuY2UoJ05vZGVTZXJ2aWNlJyk7XG4gICAgICAgIGNvbnN0IERlcGxveVNlcnZpY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zdCBfdXJsID0gJy9hcGkvZGVwbG95JztcbiAgICAgICAgICAgIGNvbnN0IF92ZXJzaW9uVXJsID0gJy9hcGkvdmVyc2lvbic7XG4gICAgICAgICAgICB0aGlzLmdldExpc3QgPSAoKSA9PiAkaHR0cC5nZXQoYCR7X3VybH0vbGlzdGApO1xuICAgICAgICAgICAgdGhpcy5nZXRTaW5nbGUgPSAoZGVwbG95SWQpID0+ICRodHRwLmdldChgJHtfdXJsfS9pZC8ke2RlcGxveUlkfWApO1xuICAgICAgICAgICAgdGhpcy5nZXRFdmVudHMgPSAoZGVwbG95SWQpID0+ICRodHRwLmdldChgJHtfdXJsfS9ldmVudC9saXN0P2RlcGxveUlkPSR7ZGVwbG95SWR9YCk7XG4gICAgICAgICAgICB0aGlzLmdldEluc3RhbmNlcyA9IChkZXBsb3lJZCkgPT4gJGh0dHAuZ2V0KGAke191cmx9LyR7ZGVwbG95SWR9L2luc3RhbmNlYCk7XG4gICAgICAgICAgICB0aGlzLmdldFZlcnNpb25zID0gKGRlcGxveUlkKSA9PiAkaHR0cC5nZXQoYCR7X3ZlcnNpb25Vcmx9L2xpc3Q/ZGVwbG95SWQ9JHtkZXBsb3lJZH1gKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0U2luZ2xlVmVyc2lvbiA9IChkZXBsb3lJZCwgdmVyc2lvbklkKSA9PiAkaHR0cC5nZXQoYCR7X3ZlcnNpb25Vcmx9L2lkLyR7ZGVwbG95SWR9LyR7dmVyc2lvbklkfWApO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVWZXJzaW9uID0gKHZlcnNpb24pID0+ICRodHRwLnBvc3QoYCR7X3ZlcnNpb25Vcmx9L2NyZWF0ZT9kZXBsb3lJZD0ke3ZlcnNpb24uZGVwbG95SWR9YCwgYW5ndWxhci50b0pzb24odmVyc2lvbikpO1xuICAgICAgICAgICAgdGhpcy5yb2xsYmFja0RlcGxveSA9IChkZXBsb3lJZCwgdmVyc2lvbklkLCByZXBsaWNhcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXBsaWNhcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChgL2FwaS9kZXBsb3kvYWN0aW9uL3JvbGxiYWNrP2RlcGxveUlkPSR7ZGVwbG95SWR9JnZlcnNpb249JHt2ZXJzaW9uSWR9JnJlcGxpY2FzPSR7cmVwbGljYXN9YCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoYC9hcGkvZGVwbG95L2FjdGlvbi9yb2xsYmFjaz9kZXBsb3lJZD0ke2RlcGxveUlkfSZ2ZXJzaW9uPSR7dmVyc2lvbklkfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURlcGxveSA9IChkZXBsb3lJZCwgdmVyc2lvbklkLCByZXBsaWNhcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXBsaWNhcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChgL2FwaS9kZXBsb3kvYWN0aW9uL3VwZGF0ZT9kZXBsb3lJZD0ke2RlcGxveUlkfSZ2ZXJzaW9uPSR7dmVyc2lvbklkfSZyZXBsaWNhcz0ke3JlcGxpY2FzfWApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGAvYXBpL2RlcGxveS9hY3Rpb24vdXBkYXRlP2RlcGxveUlkPSR7ZGVwbG95SWR9JnZlcnNpb249JHt2ZXJzaW9uSWR9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuc3RhcnREZXBsb3kgPSAoZGVwbG95SWQsIHZlcnNpb25JZCwgcmVwbGljYXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVwbGljYXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoYC9hcGkvZGVwbG95L2FjdGlvbi9zdGFydD9kZXBsb3lJZD0ke2RlcGxveUlkfSZ2ZXJzaW9uPSR7dmVyc2lvbklkfSZyZXBsaWNhcz0ke3JlcGxpY2FzfWApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGAvYXBpL2RlcGxveS9hY3Rpb24vc3RhcnQ/ZGVwbG95SWQ9JHtkZXBsb3lJZH0mdmVyc2lvbj0ke3ZlcnNpb25JZH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBkZXBsb3lTZXJ2aWNlID0gbmV3IERlcGxveVNlcnZpY2UoKTtcblxuXG4gICAgICAgIGNsYXNzIERlcGxveSB7XG4gICAgICAgICAgICBjb25zdHJ1Y3RvcihkZXBsb3lDb25maWcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5hbWVzcGFjZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICAvLyDmmK/lkKbmmK/mlrDlu7puYW1lc3BhY2VcbiAgICAgICAgICAgICAgICB0aGlzLmlzTmV3TmFtZXNwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3QgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuZW52TGlzdCA9IFt7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnVEVTVCcsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICfmtYvor5Xnjq/looMnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ1BST0QnLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn55Sf5Lqn546v5aKDJ1xuICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgIC8vIOihqOWNleS4jeiDveWunueOsOeahOmqjOivgVxuICAgICAgICAgICAgICAgIHRoaXMudmFsaWQgPSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlw6Iez5bCR5aGr5LiA5LiqXG4gICAgICAgICAgICAgICAgICAgIGlwczogZmFsc2VcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIC8vIOaYr+WQpuW8gOWQr+aXpeW/l+aUtumbhlxuICAgICAgICAgICAgICAgIHRoaXMubG9nQ29uZmlnID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmVudlRleHQgPSAn6K+36YCJ5oup6YOo572y546v5aKDJztcbiAgICAgICAgICAgICAgICB0aGlzLnZlcnNpb25MaXN0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0SW5zID0gJGRvbWVDbHVzdGVyLmdldEluc3RhbmNlKCdOb2RlTGlzdCcpO1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RGb3JJcHMgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmNsdXN0ZXJMaXN0SW5zID0gJGRvbWVDbHVzdGVyLmdldEluc3RhbmNlKCdDbHVzdGVyTGlzdCcpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucyA9ICRkb21lUHVibGljLmdldExvYWRpbmdJbnN0YW5jZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRvciA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IG51bGxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMudmlzaXRNb2RlID0gJ25vQWNjZXNzJztcbiAgICAgICAgICAgICAgICB0aGlzLmhvc3RFbnYgPSAnVEVTVCc7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmF1bHRWZXJzaW9uU3RyaW5nID0ge1xuICAgICAgICAgICAgICAgICAgJ1lBTUwnOiAnY29udGFpbmVyczpcXG4tIGltYWdlOiBcXFwicHViLmRvbWVvcy5vcmcvcmVnaXN0cnk6Mi4zXFxcIlxcbiAgbmFtZTogXFxcInRlc3QtY29udGFpbmVyXFxcIlxcbiAgdm9sdW1lTW91bnRzOlxcbiAgLSBtb3VudFBhdGg6IFxcXCIvdGVzdC1ob3N0cGF0aFxcXCJcXG4gICAgbmFtZTogXFxcInRlc3Qtdm9sdW1lXFxcIlxcbnZvbHVtZXM6XFxuLSBob3N0UGF0aDpcXG4gICAgcGF0aDogXFxcIi9vcHQvc2NzXFxcIlxcbiAgbmFtZTogXFxcInRlc3Qtdm9sdW1lXFxcIlxcbicsXG4gICAgICAgICAgICAgICAgICAnSlNPTic6ICd7XFxuICBcXFwiY29udGFpbmVyc1xcXCI6IFt7XFxuICAgIFxcXCJpbWFnZVxcXCI6IFxcXCJwdWIuZG9tZW9zLm9yZy9yZWdpc3RyeToyLjNcXFwiLFxcbiAgICBcXFwibmFtZVxcXCI6IFxcXCJ0ZXN0LWNvbnRhaW5lclxcXCIsXFxuICAgIFxcXCJ2b2x1bWVNb3VudHNcXFwiOiBbe1xcbiAgICAgIFxcXCJtb3VudFBhdGhcXFwiOiBcXFwiL3Rlc3QtaG9zdHBhdGhcXFwiLFxcbiAgICAgIFxcXCJuYW1lXFxcIjogXFxcInRlc3Qtdm9sdW1lXFxcIlxcbiAgICB9XVxcbiAgfV0sXFxuICBcXFwidm9sdW1lc1xcXCI6IFt7XFxuICAgIFxcXCJob3N0UGF0aFxcXCI6IHtcXG4gICAgICBcXFwicGF0aFxcXCI6IFxcXCIvb3B0L3Njc1xcXCJcXG4gICAgfSxcXG4gICAgXFxcIm5hbWVcXFwiOiBcXFwidGVzdC12b2x1bWVcXFwiXFxuICB9XVxcbn1cXG4nLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KGRlcGxveUNvbmZpZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0KGRlcGxveUNvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudFZlcnNpb25zLCBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZVRpbWUgPSAtMTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KGRlcGxveUNvbmZpZykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkZXBsb3lDb25maWcudmVyc2lvblR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy52ZXJzaW9uVHlwZSA9ICdDVVNUT00nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXBsb3lDb25maWcudmVyc2lvblR5cGUgPT09ICdZQU1MJyB8fCBkZXBsb3lDb25maWcudmVyc2lvblR5cGUgPT09ICdKU09OJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLnZlcnNpb25TdHJpbmcgPSBkZXBsb3lDb25maWcudmVyc2lvblN0cmluZyB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy52ZXJzaW9uU3RyaW5nLnBvZFNwZWMgPSBkZXBsb3lDb25maWcudmVyc2lvblN0cmluZy5wYWRTcGVjIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkZXBsb3lDb25maWcucmVwbGljYXMgIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcucmVwbGljYXMgPSAzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIOaYr+WQpuS9v+eUqOi0n+i9veWdh+ihoVxuICAgICAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkoZGVwbG95Q29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy/lr7nlhoXmnI3liqFcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcuaW5uZXJTZXJ2aWNlRHJhZnRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KGRlcGxveUNvbmZpZy5jdXJyZW50VmVyc2lvbnMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcuY3VycmVudFZlcnNpb25zID0gW107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gbG9hZEJhbGFuY2VEcmFmdC5leHRlcm5hbElQczogWydleHRlcm5hbElQMScsJ2V4dGVybmFsSVAyJ10gLS0+IFt7aXA6J2V4dGVybmFsSVAxJ30se2lwOidleHRlcm5hbElQMSd9LHtpcDonJ31dXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGxvYWRCYWxhbmNlRHJhZnQgb2YgZGVwbG95Q29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWxvYWRCYWxhbmNlRHJhZnQuZXh0ZXJuYWxJUHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkQmFsYW5jZURyYWZ0LmV4dGVybmFsSVBzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXh0ZXJuYWxJUHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGlwIG9mIGxvYWRCYWxhbmNlRHJhZnQuZXh0ZXJuYWxJUHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlcm5hbElQcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXA6IGlwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlcm5hbElQcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpcDogJydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZEJhbGFuY2VEcmFmdC5leHRlcm5hbElQcyA9IGV4dGVybmFsSVBzO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSBkZXBsb3lDb25maWc7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRMb2FkQmFsYW5jZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZElubmVyU2VydmljZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8v572R57uc5qih5byPXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb25maWcubmV0d29ya01vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLm5ldHdvcmtNb2RlID0gJ0RFRkFVTFQnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb25maWcuYWNjZXNzVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuYWNjZXNzVHlwZSA9ICdLOFNfU0VSVklDRSc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFZlcnNpb25zID0gdGhpcy5jb25maWcuY3VycmVudFZlcnNpb25zO1xuICAgICAgICAgICAgICAgICAgICAvLyDmmK/lkKbmmK/mlrDlu7pkZXBsb3lcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmRlcGxveUlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMudmVyc2lvbkxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLmdldFZlcnNpb25zKHRoaXMuY29uZmlnLmRlcGxveUlkKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52ZXJzaW9uTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRWZXJzaW9ucy5sZW5ndGggPT09IDAgJiYgJHV0aWwuaXNPYmplY3QodGhpcy52ZXJzaW9uTGlzdFswXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlVmVyc2lvbih0aGlzLnZlcnNpb25MaXN0WzBdLnZlcnNpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGN1cnJlbnRWZXJzaW9ucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFZlcnNpb25zW2ldLmNyZWF0ZVRpbWUgPiBjcmVhdGVUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZVRpbWUgPSBjdXJyZW50VmVyc2lvbnNbaV0uY3JlYXRlVGltZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQgPSBjdXJyZW50VmVyc2lvbnNbaV0udmVyc2lvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZVZlcnNpb24oaWQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0RGF0YSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGRlcGxveWluZm/lkox2ZXJzaW9uaW5mb+mHjeWQiOeahOS/oeaBr+WcqOi/memHjOWkhOeQhu+8jOWIh+aNonZlcnNpb27kuYvlkI7ph43mlrDosIPnlKjov5vooYzliJ3lp4vljJZcbiAgICAgICAgICAgIGluaXREYXRhKCkge1xuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheSh0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHMpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkodGhpcy5jb25maWcubGFiZWxTZWxlY3RvcnMpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxhYmVsU2VsZWN0b3JzID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdFNlbGVjdGVkTGFiZWxzKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlnLmhvc3RFbnYpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVFbnYodGhpcy5lbnZMaXN0WzBdKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBlbnYgb2YgdGhpcy5lbnZMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuaG9zdEVudiA9PT0gZW52LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVFbnYoZW52KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5zdGF0ZWZ1bCAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkodGhpcy5pbWFnZUxpc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdkb2NrZXJJbWFnZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVJbWFnZS5pbWFnZVNlcnZpY2UuZ2V0UHJvamVjdEltYWdlcygpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZUxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5qC85byP5YyWaW1hZ2XnmoRlbnZTZXR0aW5nc+S4umNvbnRhaW5lckRyYWZ0c+agvOW8j1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGltYWdlIG9mIGltYWdlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZW52cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2UuZW52U2V0dGluZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGVudiBvZiBpbWFnZS5lbnZTZXR0aW5ncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogZW52LmtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGVudi52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGVudi5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLmVudlNldHRpbmdzID0gZW52cztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3QgPSBpbWFnZUxpc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5aSE55CG6YOo572y5bey5pyJ55qE6ZWc5YOPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtYXJ0Q29udGFpbmVyRHJhZnRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygnZG9ja2VySW1hZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtYXJ0Q29udGFpbmVyRHJhZnRzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHMpO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGltYWdlIG9mIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZExvZ0RyYWZ0KGltYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0Q2x1c3RlcigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnY2x1c3RlcicpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVNlcnZpY2UuZ2V0RGF0YSgpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdElucy5pbml0KHJlcy5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUNsdXN0ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygnY2x1c3RlcicpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5Yi35paw5b2T5YmNRGVwbG9554q25oCBXG4gICAgICAgICAgICBmcmVzaERlcGxveShuZXdDb25maWcpIHtcbiAgICAgICAgICAgICAgICBpZiAoJHV0aWwuaXNPYmplY3QobmV3Q29uZmlnKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5sYXN0VXBkYXRlVGltZSA9IG5ld0NvbmZpZy5sYXN0VXBkYXRlVGltZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZGVwbG95bWVudFN0YXR1cyA9IG5ld0NvbmZpZy5kZXBsb3ltZW50U3RhdHVzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jdXJyZW50VmVyc2lvbnMgPSBuZXdDb25maWcuY3VycmVudFZlcnNpb25zO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jdXJyZW50UmVwbGljYXMgPSBuZXdDb25maWcuY3VycmVudFJlcGxpY2FzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZyZXNoVmVyc2lvbkxpc3QoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygndmVyc2lvbkxpc3QnKTtcbiAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLmdldFZlcnNpb25zKHRoaXMuY29uZmlnLmRlcGxveUlkKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52ZXJzaW9uTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ3ZlcnNpb25MaXN0Jyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b2dnbGVDbHVzdGVyKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjbHVzdGVySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHVzdGVyTGlzdCA9IHRoaXMuY2x1c3Rlckxpc3RJbnMuY2x1c3Rlckxpc3Q7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjbHVzdGVyTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyDpgInmi6nlvZPliY1kZXBsb3kvdmVyc2lvbueahGNsdXN0ZXJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmRleCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gY2x1c3Rlckxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNsdXN0ZXJMaXN0W2ldLmlkID09PSB0aGlzLmNvbmZpZy5jbHVzdGVySWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzlvZPliY1kZXBsb3kvdmVyc2lvbuayoeaciWNsdXN0ZXLvvIzliJnpgInmi6nnrKzkuIDkuKpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdElucy50b2dnbGVDbHVzdGVyKGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dDb25maWcgPSBjbHVzdGVyTGlzdFtpbmRleF0ubG9nQ29uZmlnO1xuICAgICAgICAgICAgICAgICAgICBjbHVzdGVySWQgPSB0aGlzLmNsdXN0ZXJMaXN0SW5zLmNsdXN0ZXIuaWQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIOmHjee9ruaXpeW/l+S/oeaBr1xuICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5sb2dDb25maWcgIT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvZ0RyYWZ0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ0l0ZW1EcmFmdHM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ1BhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29sbGVjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9EZWxldGU6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdub2RlbGlzdCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE5vZGVMaXN0KGNsdXN0ZXJJZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZUxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0Rm9ySXBzID0gYW5ndWxhci5jb3B5KG5vZGVMaXN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ub2RlTGlzdEZvcklwcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBub2RlID0gdGhpcy5ub2RlTGlzdEZvcklwc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5zdGF0dXMgPT0gJ1JlYWR5Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXBzID0gdGhpcy5jb25maWcubG9hZEJhbGFuY2VEcmFmdHNbMF0uZXh0ZXJuYWxJUHM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGlwIG9mIGlwcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlwID09PSBub2RlLmlwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pc1NlbGVjdGVkID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdEZvcklwcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzmmK9hcHAgc3RvcmXnmoTkuLvmnLrliJfooajvvIzliJnov4fmu6TmjonmsqHmnIlkaXNrUGF0aOeahOS4u+aculxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy5pbml0KG5vZGVMaXN0LCB0aGlzLmNvbmZpZy5zdGF0ZWZ1bCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRTZWxlY3RlZExhYmVscygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy50b2dnbGVFbnYodGhpcy5jb25maWcuaG9zdEVudik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzmmK/mnInnirbmgIHmnI3liqHvvIzpu5jorqTpgInmi6nlkoxyZXBsaWNz55u4562J55qE5Li75py65Liq5pWwXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuc3RhdGVmdWwgJiYgdGhpcy5jb25maWcucmVwbGljYXMgJiYgdGhpcy5ub2RlTGlzdElucy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5ub2RlTGlzdElucy5ub2RlTGlzdC5sZW5ndGg7IGkgPCBsICYmIGkgPCB0aGlzLmNvbmZpZy5yZXBsaWNhczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RJbnMubm9kZUxpc3RbaV0uaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RJbnMudG9nZ2xlTm9kZUNoZWNrKHRoaXMubm9kZUxpc3RJbnMubm9kZUxpc3RbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy5pbml0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ25vZGVsaXN0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5kZXBsb3lJZCA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCduYW1lc3BhY2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE5hbWVzcGFjZShjbHVzdGVySWQpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmFtZXNwYWNlTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzTmV3TmFtZXNwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubmFtZXNwYWNlID0gdGhpcy5uYW1lc3BhY2VMaXN0WzBdLm5hbWUgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMubmFtZXNwYWNlTGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubmFtZXNwYWNlTGlzdFtpXS5uYW1lID09ICdkZWZhdWx0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubmFtZXNwYWNlID0gdGhpcy5uYW1lc3BhY2VMaXN0W2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzTmV3TmFtZXNwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uYW1lc3BhY2VMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubmFtZXNwYWNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCduYW1lc3BhY2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWIneWni+WMlumAieS4reeahGxhYmVsXG4gICAgICAgICAgICBpbml0U2VsZWN0ZWRMYWJlbHMoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy5pbml0TGFiZWxzSW5mbygpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb25maWcubGFiZWxTZWxlY3RvcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgbGFiZWxTZWxlY3RvcnMgPSB0aGlzLmNvbmZpZy5sYWJlbFNlbGVjdG9ycztcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBsYWJlbFNlbGVjdG9yIG9mIGxhYmVsU2VsZWN0b3JzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsYWJlbE5hbWUgPSBsYWJlbFNlbGVjdG9yLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYWJlbE5hbWUgIT0gJ2t1YmVybmV0ZXMuaW8vaG9zdG5hbWUnICYmIGxhYmVsTmFtZSAhPSAnVEVTVEVOVicgJiYgbGFiZWxOYW1lICE9ICdQUk9ERU5WJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy50b2dnbGVMYWJlbChsYWJlbE5hbWUsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsaWRJcHMoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnZpc2l0TW9kZSA9PT0gJ2ZvcmVpZ24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3RGb3JJcHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWQuaXBzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWQuaXBzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkLmlwcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5YiH5o2i5b2T5YmN5bGV56S655qEdmVyc2lvblxuICAgICAgICAgICAgdG9nZ2xlVmVyc2lvbih2ZXJzaW9uSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS5nZXRTaW5nbGVWZXJzaW9uKHRoaXMuY29uZmlnLmRlcGxveUlkLCB2ZXJzaW9uSWQpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCR1dGlsLmlzT2JqZWN0KHJlcy5kYXRhLnJlc3VsdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLmV4dGVuZCh0aGlzLmNvbmZpZywgcmVzLmRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXREYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBjb250YWluZXJEcmFmdHPvvJrmlrDlop5jb250YWluZXJEcmFmdOeahG9sZEVudu+8jG5ld0Vudu+8jHRhZ0xpc3TlsZ7mgKdcbiAgICAgICAgICAgIGZvcm1hcnRDb250YWluZXJEcmFmdHMoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvbnRhaW5lckRyYWZ0cyA9IHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cztcblxuICAgICAgICAgICAgICAgIGNvbnN0IGdldFRhZyA9IChjb250YWluZXJEcmFmdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCd0YWcnKTtcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVJbWFnZS5pbWFnZVNlcnZpY2UuZ2V0SW1hZ2VUYWdzKGNvbnRhaW5lckRyYWZ0LmltYWdlLCBjb250YWluZXJEcmFmdC5yZWdpc3RyeSkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdC50YWdMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCd0YWcnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGNvbnRhaW5lckRyYWZ0cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnRzW2ldLm9sZEVudiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdHNbaV0ubmV3RW52ID0gW107XG4gICAgICAgICAgICAgICAgICAgIC8vIOiOt+W+l+ivpemVnOWDj+eJiOacrFxuICAgICAgICAgICAgICAgICAgICBnZXRUYWcoY29udGFpbmVyRHJhZnRzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9sZEVudiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAvLyDojrflvpfplZzlg4/ljp/mnKznmoRlbnZTZXR0aW5nc1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMCwgbDEgPSB0aGlzLmltYWdlTGlzdC5sZW5ndGg7IGogPCBsMTsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWFnZUxpc3Rbal0uaW1hZ2VOYW1lID09PSBjb250YWluZXJEcmFmdHNbaV0uaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRFbnYgPSB0aGlzLmltYWdlTGlzdFtqXS5lbnZTZXR0aW5ncztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyDliIbnprvplZzlg4/mnKzouqvnmoRpbWFnZeWSjOaWsOa3u+WKoOeahGltYWdl55qEZW52XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb250YWluZXJEcmFmdHNbaV0uZW52cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgdyA9IDAsIGwyID0gY29udGFpbmVyRHJhZnRzW2ldLmVudnMubGVuZ3RoOyB3IDwgbDI7IHcrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc09sZEVudiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGsgPSAwLCBsMyA9IG9sZEVudi5sZW5ndGg7IGsgPCBsMzsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvbGRFbnZba10ua2V5ID09PSBjb250YWluZXJEcmFmdHNbaV0uZW52c1t3XS5rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzT2xkRW52ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc09sZEVudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdHNbaV0ub2xkRW52LnB1c2goY29udGFpbmVyRHJhZnRzW2ldLmVudnNbd10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0c1tpXS5uZXdFbnYucHVzaChjb250YWluZXJEcmFmdHNbaV0uZW52c1t3XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnRzW2ldLm9sZEVudiA9IGFuZ3VsYXIuY29weShvbGRFbnYpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlTmFtZXNwYWNlKG5hbWVzcGFjZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZUlzTmV3TmFtZXNwYWNlKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNOZXdOYW1lc3BhY2UgPSAhdGhpcy5pc05ld05hbWVzcGFjZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5uYW1lc3BhY2UgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlRW52KGVudikge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmhvc3RFbnYgPSBlbnYudmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnZUZXh0ID0gZW52LnRleHQ7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy50b2dnbGVFbnYoZW52LnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZUNyZWF0b3IodXNlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRvciA9IHVzZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b2dnbGVJbWFnZVRhZyhpbmRleCwgdGFnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0c1tpbmRleF0udGFnID0gdGFnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDmt7vliqBjb250YWluZXJEcmFmdFxuICAgICAgICAgICAgYWRkSW1hZ2UoaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnYWRkSW1hZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVJbWFnZS5pbWFnZVNlcnZpY2UuZ2V0SW1hZ2VUYWdzKGltYWdlLmltYWdlTmFtZSwgaW1hZ2UucmVnaXN0cnkpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhZ3MgPSByZXMuZGF0YS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IGltYWdlLmltYWdlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpc3RyeTogaW1hZ2UucmVnaXN0cnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3B1OiAwLjUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtOiAxMDI0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZzogdGFncyAmJiB0YWdzWzBdID8gdGFnc1swXS50YWcgOiB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnTGlzdDogdGFncyB8fCBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRFbnY6IGltYWdlLmVudlNldHRpbmdzIHx8IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0VudjogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTk9ORSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlUHVsbFBvbGljeTogJ0Fsd2F5cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nSXRlbURyYWZ0czogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dQYXRoOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29sbGVjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0RlbGV0ZTogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ2FkZEltYWdlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDmt7vliqDlhbbku5bplZzlg49cbiAgICAgICAgICAgIGFkZE90aGVySW1hZ2UoKSB7XG4gICAgICAgICAgICAgICAgbGV0IG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvaW5kZXgvdHBsL21vZGFsL290aGVySW1hZ2VNb2RhbC9vdGhlckltYWdlTW9kYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdPdGhlckltYWdlTW9kYWxDdHInLFxuICAgICAgICAgICAgICAgICAgICBzaXplOiAnbWQnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbigoaW1hZ2VJbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiBpbWFnZUluZm8ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJ5OiBpbWFnZUluZm8ucmVnaXN0cnksXG4gICAgICAgICAgICAgICAgICAgICAgICBjcHU6IDAuNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbTogMTAyNCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZzogaW1hZ2VJbmZvLnRhZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ0xpc3Q6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiBpbWFnZUluZm8udGFnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9sZEVudjogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdFbnY6IFtdXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlSW1hZ2UoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZEltYWdlRW52KGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzW2luZGV4XS5uZXdFbnYucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVJbWFnZUVudihjb250YWluZXJEcmFmdEluZGV4LCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0c1tjb250YWluZXJEcmFmdEluZGV4XS5uZXdFbnYuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZExvYWRCYWxhbmNlKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBwb3J0OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UG9ydDogJycsXG4gICAgICAgICAgICAgICAgICAgIGV4dGVybmFsSVBzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgaXA6ICcnXG4gICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGRJbm5lclNlcnZpY2UoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuaW5uZXJTZXJ2aWNlRHJhZnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBwb3J0OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UG9ydDogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZEV4dGVybmFsSVBzKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcubG9hZEJhbGFuY2VEcmFmdHNbaW5kZXhdLmV4dGVybmFsSVBzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBpcDogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZUV4dGVybmFsSVBzKGxvYWRCYWxhbmNlRHJhZnRJbmRleCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0c1tsb2FkQmFsYW5jZURyYWZ0SW5kZXhdLmV4dGVybmFsSVBzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGRMb2dEcmFmdChpbWFnZSkge1xuICAgICAgICAgICAgICAgIGltYWdlLmxvZ0l0ZW1EcmFmdHMgPSBpbWFnZS5sb2dJdGVtRHJhZnRzIHx8IFtdO1xuICAgICAgICAgICAgICAgIGltYWdlLmxvZ0l0ZW1EcmFmdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGxvZ1BhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29sbGVjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGF1dG9EZWxldGU6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVMb2dEcmFmdChpbWFnZSwgbG9nRHJhZnQpIHtcbiAgICAgICAgICAgICAgICBpbWFnZS5sb2dJdGVtRHJhZnRzLnNwbGljZShpbWFnZS5sb2dJdGVtRHJhZnRzLmluZGV4T2YobG9nRHJhZnQpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZUFyckl0ZW0oaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ1tpdGVtXS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9ybWFydEhlYWx0aENoZWNrZXIoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLm5ldHdvcmtNb2RlID09ICdIT1NUJykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjb250YWluZXJEcmFmdCBvZiB0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ05PTkUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hhbmdlTmV0d29ya21vZGUoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLm5ldHdvcmtNb2RlID09ICdIT1NUJykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBsb2FkQmFsYW5jZURyYWZ0IG9mIHRoaXMuY29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQmFsYW5jZURyYWZ0LnBvcnQgPSBsb2FkQmFsYW5jZURyYWZ0LnRhcmdldFBvcnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFuZ2VUYXJnZXRQb3J0KGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzW2luZGV4XS5wb3J0ID0gdGhpcy5jb25maWcubG9hZEJhbGFuY2VEcmFmdHNbaW5kZXhdLnRhcmdldFBvcnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWwhuaVsOaNrue7k+aehOi9rOaNouS4uuS4juWQjuWPsOS6pOS6kueahOaVsOaNruagvOW8j1xuICAgICAgICAgICAgX2Zvcm1hcnREZXBsb3koKSB7XG4gICAgICAgICAgICAgICAgbGV0IGRlcGxveUNvbmZpZyA9IGFuZ3VsYXIuY29weSh0aGlzLmNvbmZpZyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVwbG95Q29uZmlnLm5ldHdvcmtNb2RlID09ICdIT1NUJykge1xuICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmFjY2Vzc1R5cGUgPSAnRElZJztcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmlubmVyU2VydmljZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpdE1vZGUgPT0gJ25vQWNjZXNzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmV4cG9zZVBvcnROdW0gPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmV4cG9zZVBvcnROdW0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpdE1vZGUgPT0gJ25vQWNjZXNzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmFjY2Vzc1R5cGUgPSAnRElZJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmlubmVyU2VydmljZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudmlzaXRNb2RlID09ICdpbnRlcm5hbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5hY2Nlc3NUeXBlID0gJ0s4U19TRVJWSUNFJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHNbMF0udGFyZ2V0UG9ydCA9IGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHNbMF0ucG9ydDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmFjY2Vzc1R5cGUgPSAnSzhTX1NFUlZJQ0UnO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmlubmVyU2VydmljZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGlwcyA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZEJhbGFuY2VEcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLm5vZGVMaXN0Rm9ySXBzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXBzLnB1c2gobm9kZS5pcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbG9hZEJhbGFuY2VEcmFmdCBvZiBkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2FkQmFsYW5jZURyYWZ0LnBvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkQmFsYW5jZURyYWZ0LmV4dGVybmFsSVBzID0gaXBzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRCYWxhbmNlRHJhZnRzLnB1c2gobG9hZEJhbGFuY2VEcmFmdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRCYWxhbmNlRHJhZnRzO1xuICAgICAgICAgICAgICAgIH0pKCk7XG5cblxuICAgICAgICAgICAgICAgIGlmICghZGVwbG95Q29uZmlnLnN0YXRlZnVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5sYWJlbFNlbGVjdG9ycyA9IHRoaXMubm9kZUxpc3RJbnMuZ2V0Rm9ybWFydFNlbGVjdGVkTGFiZWxzKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmhvc3RMaXN0ID0gdGhpcy5ub2RlTGlzdElucy5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmNsdXN0ZXJJZCA9IHRoaXMuY2x1c3Rlckxpc3RJbnMuY2x1c3Rlci5pZDtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNyZWF0b3IuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmNyZWF0b3IgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdG9ySWQ6IHRoaXMuY3JlYXRvci5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0b3JOYW1lOiB0aGlzLmNyZWF0b3IubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0b3JUeXBlOiB0aGlzLmNyZWF0b3IudHlwZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChkZXBsb3lDb25maWcudmVyc2lvblR5cGUgPT09ICdDVVNUT00nKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5jb250YWluZXJEcmFmdHMgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlcGxveUNvbmZpZy5zdGF0ZWZ1bCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkZXBsb3lDb25maWcuY29udGFpbmVyRHJhZnRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRlcGxveUNvbmZpZy5jb250YWluZXJEcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZW52Q29uZiwgY29udGFpbmVyRHJhZnRzID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlcjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY29udGFpbmVyRHJhZnQgb2YgZGVwbG95Q29uZmlnLmNvbnRhaW5lckRyYWZ0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudkNvbmYgPSBjb250YWluZXJEcmFmdC5vbGRFbnY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjb250YWluZXJEcmFmdC5oZWFsdGhDaGVja2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTk9ORSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY29udGFpbmVyRHJhZnQuaGVhbHRoQ2hlY2tlci50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXBsb3lDb25maWcubmV0d29ya01vZGUgIT0gJ0hPU1QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoZWFsdGhDaGVja2VyLnR5cGUgPT0gJ1RDUCcgfHwgaGVhbHRoQ2hlY2tlci50eXBlID09ICdIVFRQJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlci5wb3J0ID0gY29udGFpbmVyRHJhZnQuaGVhbHRoQ2hlY2tlci5wb3J0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlci50aW1lb3V0ID0gY29udGFpbmVyRHJhZnQuaGVhbHRoQ2hlY2tlci50aW1lb3V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlci5kZWxheSA9IGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIuZGVsYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhlYWx0aENoZWNrZXIudHlwZSA9PSAnSFRUUCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXIudXJsID0gY29udGFpbmVyRHJhZnQuaGVhbHRoQ2hlY2tlci51cmw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFsdGhDaGVja2VyLnR5cGUgPSAnTk9ORSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgZW52IG9mIGNvbnRhaW5lckRyYWZ0Lm5ld0Vudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW52LmtleSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudkNvbmYucHVzaChlbnYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvZ0l0ZW1EcmFmdHMgPSAoKHByZUZvcm1hdHRlZGxvZ0RyYWZ0cykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbG9nSXRlbURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBsb2dJdGVtIG9mIHByZUZvcm1hdHRlZGxvZ0RyYWZ0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvZ0l0ZW0ubG9nUGF0aCAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZm9ybWFydExvZ0l0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ1BhdGg6IGxvZ0l0ZW0ubG9nUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbGxlY3Q6IGxvZ0l0ZW0uYXV0b0NvbGxlY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9EZWxldGU6IGxvZ0l0ZW0uYXV0b0RlbGV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvZ0l0ZW0uYXV0b0NvbGxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWFydExvZ0l0ZW0ubG9nVG9waWMgPSBsb2dJdGVtLmxvZ1RvcGljO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0TG9nSXRlbS5wcm9jZXNzQ21kID0gbG9nSXRlbS5wcm9jZXNzQ21kO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9nSXRlbS5hdXRvRGVsZXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hcnRMb2dJdGVtLmxvZ0V4cGlyZWQgPSBsb2dJdGVtLmxvZ0V4cGlyZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ0l0ZW1EcmFmdHMucHVzaChmb3JtYXJ0TG9nSXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvZ0l0ZW1EcmFmdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2dJdGVtRHJhZnRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkoY29udGFpbmVyRHJhZnQubG9nSXRlbURyYWZ0cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiBjb250YWluZXJEcmFmdC5pbWFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cnk6IGNvbnRhaW5lckRyYWZ0LnJlZ2lzdHJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWc6IGNvbnRhaW5lckRyYWZ0LnRhZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3B1OiBjb250YWluZXJEcmFmdC5jcHUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbTogY29udGFpbmVyRHJhZnQubWVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dJdGVtRHJhZnRzOiBsb2dJdGVtRHJhZnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZzOiBlbnZDb25mLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFsdGhDaGVja2VyOiBoZWFsdGhDaGVja2VyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVB1bGxQb2xpY3k6IGNvbnRhaW5lckRyYWZ0LmltYWdlUHVsbFBvbGljeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb250YWluZXJEcmFmdHM7XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkZXBsb3lDb25maWcudmVyc2lvblR5cGUgPT09ICdKU09OJyB8fCBkZXBsb3lDb25maWcudmVyc2lvblR5cGUgPT09ICdZQU1MJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVwbG95Q29uZmlnLnZlcnNpb25TdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5wb2RTcGVjU3RyID0gZGVwbG95Q29uZmlnLnZlcnNpb25TdHJpbmcucG9kU3BlY1N0cjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkZXBsb3lDb25maWcudmVyc2lvblN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBkZXBsb3lDb25maWc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNyZWF0ZVZlcnNpb24oKSB7IC8vIOWIm+W7unZlcnNpb25cbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NvbmZpZyA9IHRoaXMuX2Zvcm1hcnREZXBsb3koKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnNpb25PYmogPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95SWQ6IG5ld0NvbmZpZy5kZXBsb3lJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdHM6IG5ld0NvbmZpZy5jb250YWluZXJEcmFmdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTZWxlY3RvcnM6IG5ld0NvbmZpZy5sYWJlbFNlbGVjdG9ycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uVHlwZTogbmV3Q29uZmlnLnZlcnNpb25UeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvZFNwZWNTdHI6IG5ld0NvbmZpZy5wb2RTcGVjU3RyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLmNyZWF0ZVZlcnNpb24odmVyc2lvbk9iaikudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuZGVwbG95bWVudFN0YXR1cyAhPSAnUlVOTklORycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCfmlrDlu7rpg6jnvbLniYjmnKzmiJDlip8s5b2T5YmN54q25oCB5LiN6IO95Y2H57qn44CCJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgnY3JlYXRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Db25maXJtKCfmiJDlip/mlrDlu7rpg6jnvbLniYjmnKzvvIzmmK/lkKbnu6fnu63ljYfnuqfvvJ8nKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS51cGRhdGVEZXBsb3kodGhpcy5jb25maWcuZGVwbG95SWQsIHJlcy5kYXRhLnJlc3VsdCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCflt7Lmj5DkuqTvvIzmraPlnKjljYfnuqfvvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfljYfnuqflpLHotKXvvIEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoJ3VwZGF0ZUZhaWxlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoJ2Rpc21pc3MnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5Yib5bu654mI5pys5aSx6LSl77yBJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2NyZWF0ZScpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWBnOatolxuICAgICAgICAgICAgc3RvcCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9kZXBsb3kvYWN0aW9uL3N0b3A/ZGVwbG95SWQ9JyArIHRoaXMuY29uZmlnLmRlcGxveUlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFib3J0KCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9kZXBsb3kvYWN0aW9uL2Fib3J0P2RlcGxveUlkPScgKyB0aGlzLmNvbmZpZy5kZXBsb3lJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOaJqeWuuS/nvKnlrrlcbiAgICAgICAgICAgIHNjYWxlKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnc2NhbGVNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTY2FsZU1vZGFsQ3RyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkUmVwbGljYXM6ICgpID0+IHRoaXMuY29uZmlnLmN1cnJlbnRSZXBsaWNhc1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbigocmVwbGljYXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxpY2FzID0gcGFyc2VJbnQocmVwbGljYXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcGxpY2FzID09PSB0aGlzLmNvbmZpZy5jdXJyZW50UmVwbGljYXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5a6e5L6L5Liq5pWw5peg5Y+Y5YyW77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVybCA9IHJlcGxpY2FzID4gdGhpcy5jb25maWcuY3VycmVudFJlcGxpY2FzID8gJ2FwaS9kZXBsb3kvYWN0aW9uL3NjYWxldXAnIDogJ2FwaS9kZXBsb3kvYWN0aW9uL3NjYWxlZG93bic7XG4gICAgICAgICAgICAgICAgICAgICAgICAkaHR0cC5wb3N0KHVybCArICc/ZGVwbG95SWQ9JyArIHRoaXMuY29uZmlnLmRlcGxveUlkICsgJyZyZXBsaWNhcz0nICsgcmVwbGljYXMgKyAnJnZlcnNpb249JyArIHRoaXMuY29uZmlnLmN1cnJlbnRWZXJzaW9uc1swXS52ZXJzaW9uKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCfmk43kvZzmiJDlip/vvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlcy5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+ivt+axguWksei0pe+8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgncmVxdWVzdEVycm9yJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdkaXNtaXNzJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5oGi5aSNXG4gICAgICAgICAgICByZWNvdmVyVmVyc2lvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZlcnNpb25Nb2RhbElucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndmVyc2lvbkxpc3RNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdWZXJzaW9uTGlzdE1vZGFsQ3RyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95SW5mbzogKCkgPT4gdGhpcy5jb25maWdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb25Nb2RhbElucy5yZXN1bHQudGhlbigoc3RhcnRJbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLnJvbGxiYWNrRGVwbG95KHRoaXMuY29uZmlnLmRlcGxveUlkLCBzdGFydEluZm8udmVyc2lvbklkLCBzdGFydEluZm8ucmVwbGljYXMpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzLmRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2Rpc21pc3MnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDljYfnuqdcbiAgICAgICAgICAgIHVwZGF0ZVZlcnNpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2ZXJzaW9uTW9kYWxJbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3ZlcnNpb25MaXN0TW9kYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVmVyc2lvbkxpc3RNb2RhbEN0cicsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiAnbWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUluZm86ICgpID0+IHRoaXMuY29uZmlnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uTW9kYWxJbnMucmVzdWx0LnRoZW4oKHN0YXJ0SW5mbykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRWZXJzaW9uSWQgPSB0aGlzLmNvbmZpZy5jdXJyZW50VmVyc2lvbnNbMF0udmVyc2lvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50VmVyc2lvbklkID09PSBzdGFydEluZm8udmVyc2lvbklkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+aCqOS4jeiDvemAieaLqeW9k+WJjeeJiOacrO+8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnZGlzbWlzcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50VmVyc2lvbklkID4gc3RhcnRJbmZvLnZlcnNpb25JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveVNlcnZpY2Uucm9sbGJhY2tEZXBsb3kodGhpcy5jb25maWcuZGVwbG95SWQsIHN0YXJ0SW5mby52ZXJzaW9uSWQsIHN0YXJ0SW5mby5yZXBsaWNhcykudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+W3suaPkOS6pO+8jOato+WcqOWbnua7mu+8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlcy5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5Zue5rua5aSx6LSl77yM6K+36YeN6K+V77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLnVwZGF0ZURlcGxveSh0aGlzLmNvbmZpZy5kZXBsb3lJZCwgc3RhcnRJbmZvLnZlcnNpb25JZCwgc3RhcnRJbmZvLnJlcGxpY2FzKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5bey5o+Q5Lqk77yM5q2j5Zyo5Y2H57qn77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzLmRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+WNh+e6p+Wksei0pe+8jOivt+mHjeivle+8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdkaXNtaXNzJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5ZCv5YqoXG4gICAgICAgICAgICBzdGFydFZlcnNpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2ZXJzaW9uTW9kYWxJbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3ZlcnNpb25MaXN0TW9kYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVmVyc2lvbkxpc3RNb2RhbEN0cicsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiAnbWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUluZm86ICgpID0+IHRoaXMuY29uZmlnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uTW9kYWxJbnMucmVzdWx0LnRoZW4oKHN0YXJ0SW5mbykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS5zdGFydERlcGxveSh0aGlzLmNvbmZpZy5kZXBsb3lJZCwgc3RhcnRJbmZvLnZlcnNpb25JZCwgc3RhcnRJbmZvLnJlcGxpY2FzKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlcy5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdkaXNtaXNzJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5Yig6ZmkXG4gICAgICAgICAgICBkZWxldGUoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoJy9hcGkvZGVwbG95L2lkLycgKyB0aGlzLmNvbmZpZy5kZXBsb3lJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOaWsOW7ulxuICAgICAgICAgICAgY3JlYXRlKCkge1xuICAgICAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgICAgIG9iaiA9IHRoaXMuX2Zvcm1hcnREZXBsb3koKTtcblxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNyZWF0ZURlcGxveSgpIHtcbiAgICAgICAgICAgICAgICAgICAgJGh0dHAucG9zdCgnYXBpL2RlcGxveS9jcmVhdGUnLCBhbmd1bGFyLnRvSnNvbihvYmopKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY3JlYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzTmV3TmFtZXNwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lc3BhY2UgPSB0aGlzLmNvbmZpZy5uYW1lc3BhY2U7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lc3BhY2VBcnIgPSBbbmFtZXNwYWNlXTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZVNlcnZpY2Uuc2V0TmFtZXNwYWNlKHRoaXMuY2x1c3Rlckxpc3RJbnMuY2x1c3Rlci5pZCwgbmFtZXNwYWNlQXJyKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlSXNOZXdOYW1lc3BhY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmFtZXNwYWNlTGlzdC5wdXNoKG5hbWVzcGFjZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZU5hbWVzcGFjZShuYW1lc3BhY2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRGVwbG95KCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ25hbWVzcGFjZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiByZXMuZGF0YS5yZXN1bHRNc2dcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVEZXBsb3koKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnZXREZXBsb3lTdHIoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgbGV0IG9iaiA9IHRoaXMuX2Zvcm1hcnREZXBsb3koKTtcbiAgICAgICAgICAgICAgb2JqLnBvZFNwZWNTdHIgPSAnJztcblxuICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChgYXBpL2RlcGxveS9kZXBsb3ltZW50c3RyYCwgYW5ndWxhci50b0pzb24ob2JqKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xhc3MgRGVwbG95SW5zdGFuY2VMaXN0IHtcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKGluc3RhbmNlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgLy8g5bey6YCJ5LitaW5zdGFuY2XmlbBcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgIC8vIOW3sumAieS4rWNvbnRhaW5lcuaVsFxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb250YWluZXJDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KGluc3RhbmNlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0KGluc3RhbmNlcykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsQ29udGFpbmVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VMaXN0ID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlcyA9IGluc3RhbmNlcyB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGluc3RhbmNlIG9mIGluc3RhbmNlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5rZXlGaWx0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5jb250YWluZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNvbnRhaW5lciBvZiBpbnN0YW5jZS5jb250YWluZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuc2hvcnRDb250YWluZXJJZCA9IGNvbnRhaW5lci5jb250YWluZXJJZC5zdWJzdHJpbmcoMCwgMTIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlcztcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g6YCJ5oup5a6e5L6LLS0+5YiH5o2iY29udGFpbmVyTGlzdFxuICAgICAgICAgICAgdG9nZ2xlQ29udGFpbmVyTGlzdChpbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb250YWluZXJDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJMaXN0ID0gaW5zdGFuY2UuY29udGFpbmVycyB8fCBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjb250YWluZXIgb2YgdGhpcy5jb250YWluZXJMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsdGVyV2l0aEtleShrZXl3b3Jkcykge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaW5zdGFuY2Ugb2YgdGhpcy5pbnN0YW5jZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5rZXlGaWx0ZXIgPSBpbnN0YW5jZS5pbnN0YW5jZU5hbWUuaW5kZXhPZihrZXl3b3JkcykgIT09IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZUNvbnRhaW5lckNoZWNrKGNvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaXNBbGxIYXNDaGFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb250YWluZXJDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5piv5ZCm5Li65YWo6YCJXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjb250YWluZXIgb2YgdGhpcy5jb250YWluZXJMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjb250YWluZXIuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0FsbEhhc0NoYW5nZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNBbGxIYXNDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGxDb250YWluZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbnRhaW5lckNvdW50LS07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGxDb250YWluZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDlhajpgIkv5YWo5LiN6YCJXG4gICAgICAgICAgICBjaGVja0FsbENvbnRhaW5lcihpc0NoZWNrQWxsQ29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA9IHR5cGVvZiBpc0NoZWNrQWxsQ29udGFpbmVyID09PSAndW5kZWZpbmVkJyA/ICF0aGlzLmlzQ2hlY2tBbGxDb250YWluZXIgOiBpc0NoZWNrQWxsQ29udGFpbmVyO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29udGFpbmVyQ291bnQgPSB0aGlzLmlzQ2hlY2tBbGxDb250YWluZXIgPyB0aGlzLmNvbnRhaW5lckxpc3QubGVuZ3RoIDogMDtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY29udGFpbmVyIG9mIHRoaXMuY29udGFpbmVyTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmlzU2VsZWN0ZWQgPSB0aGlzLmlzQ2hlY2tBbGxDb250YWluZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5YiH5o2i5Y2V5Liq5a6e5L6L55qE6YCJ5Lit54q25oCBXG4gICAgICAgICAgICB0b2dnbGVDaGVjayhpbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaXNBbGxIYXNDaGFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmmK/lkKbkuLrlhajpgIlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGluc3RhbmNlIG9mIHRoaXMuaW5zdGFuY2VMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLmtleUZpbHRlciAmJiAhaW5zdGFuY2UuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0FsbEhhc0NoYW5nZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNBbGxIYXNDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50LS07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDlhajpgIkv5YWo5LiN6YCJXG4gICAgICAgICAgICBjaGVja0FsbEluc3RhbmNlKGlzQ2hlY2tBbGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSB0eXBlb2YgaXNDaGVja0FsbCA9PT0gJ3VuZGVmaW5lZCcgPyB0aGlzLmlzQ2hlY2tBbGwgOiBpc0NoZWNrQWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaW5zdGFuY2Ugb2YgdGhpcy5pbnN0YW5jZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLmtleUZpbHRlciAmJiB0aGlzLmlzQ2hlY2tBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmlzU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjbGFzcyBEZXBsb3lMaXN0IHtcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKGRlcGxveUxpc3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveSA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lJbnN0YW5jZUxpc3RJbnMgPSBuZXcgRGVwbG95SW5zdGFuY2VMaXN0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KGRlcGxveUxpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5pdChkZXBsb3lMaXN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0ID0gZGVwbG95TGlzdCB8fCBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZURlcGxveShkZXBsb3lJZCwgZGVwbG95TmFtZSwgbmFtZXNwYWNlLCBub3ROZWVkSW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZGVwbG95SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95LmlkID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95Lm5hbWUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3kubmFtZXNwYWNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95SW5zdGFuY2VMaXN0SW5zLmluaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3kuaWQgPSBkZXBsb3lJZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95Lm5hbWUgPSBkZXBsb3lOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3kubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFub3ROZWVkSW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS5nZXRJbnN0YW5jZXMoZGVwbG95SWQpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUluc3RhbmNlTGlzdElucy5pbml0KHJlcy5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEBwYXJhbSBob3N0RW52OiAnVEVTVCcgb3IgJ1BST0QnXG4gICAgICAgICAgICBmaWx0ZXJEZXBsb3koY2x1c3Rlck5hbWUsIGhvc3RFbnYpIHtcbiAgICAgICAgICAgICAgICBsZXQgZGVwbG95SWQsIGRlcGxveU5hbWUsIG5hbWVzcGFjZTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBkZXBsb3kgb2YgdGhpcy5kZXBsb3lMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGRlcGxveS5jbHVzdGVyRmlsdGVyID0gY2x1c3Rlck5hbWUgPyBkZXBsb3kuY2x1c3Rlck5hbWUgPT09IGNsdXN0ZXJOYW1lIDogdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Lmhvc3RGaWx0ZXIgPSBob3N0RW52ID8gZGVwbG95Lmhvc3RFbnYgPT09IGhvc3RFbnYgOiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAvLyDpgInkuK3nrKzkuIDkuKrnrKblkIjmnaHku7bnmoTpg6jnvbLlubbliIfmjaLliLDor6Xpg6jnvbJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkZXBsb3lJZCA9PT0gJ3VuZGVmaW5lZCcgJiYgZGVwbG95LmNsdXN0ZXJGaWx0ZXIgJiYgZGVwbG95Lmhvc3RGaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUlkID0gZGVwbG95LmRlcGxveUlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95TmFtZSA9IGRlcGxveS5kZXBsb3lOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXNwYWNlID0gZGVwbG95Lm5hbWVzcGFjZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgZGVwbG95SWQgPT09ICd1bmRlZmluZWQnID8gdGhpcy50b2dnbGVEZXBsb3koKSA6IHRoaXMudG9nZ2xlRGVwbG95KGRlcGxveUlkLCBkZXBsb3lOYW1lLCBuYW1lc3BhY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g6I635b6X5a6e5L6LXG4gICAgICAgIGNvbnN0IGdldEluc3RhbmNlID0gJGRvbWVNb2RlbC5pbnN0YW5jZXNDcmVhdG9yKHtcbiAgICAgICAgICAgIERlcGxveUxpc3Q6IERlcGxveUxpc3QsXG4gICAgICAgICAgICBEZXBsb3k6IERlcGxveVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlcGxveVNlcnZpY2U6IGRlcGxveVNlcnZpY2UsXG4gICAgICAgICAgICBnZXRJbnN0YW5jZTogZ2V0SW5zdGFuY2VcbiAgICAgICAgfTtcbiAgICB9XG4gICAgRGVwbG95U2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICckZG9tZUNsdXN0ZXInLCAnJGRvbWVJbWFnZScsICckZG9tZVB1YmxpYycsICckZG9tZU1vZGVsJywgJyRtb2RhbCcsICckcScsICckdXRpbCddO1xuICAgIGRlcGxveU1vZHVsZS5mYWN0b3J5KCckZG9tZURlcGxveScsIERlcGxveVNlcnZpY2UpO1xuICAgIHdpbmRvdy5kZXBsb3lNb2R1bGUgPSBkZXBsb3lNb2R1bGU7XG59KSh3aW5kb3cpOyJdfQ==
