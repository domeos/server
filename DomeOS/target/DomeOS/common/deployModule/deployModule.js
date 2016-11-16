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
            this.getListByCollectionId = function (collectionId) {
                return $http.get(_url + '/list/' + collectionId);
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

                this.collectionId = '';
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

                    //console.log(this.config.containerDrafts);
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
                key: 'setCollectionId',
                value: function setCollectionId(collectionId) {
                    this.collectionId = collectionId;
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
                            autoDeploy: false,
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

                    deployConfig.collectionId = this.collectionId;

                    /*
                    if (this.creator.id) {
                        if (0) deployConfig.creator = {
                            creatorId: this.creator.id,
                            creatorName: this.creator.name,
                            creatorType: this.creator.type
                        };
                        deployConfig.creatorId = this.creator.id;
                    }
                    */

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
                                        imagePullPolicy: containerDraft.imagePullPolicy,
                                        autoDeploy: containerDraft.autoDeploy
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9kZXBsb3lNb2R1bGUvZGVwbG95TW9kdWxlLmVzIl0sIm5hbWVzIjpbIndpbmRvdyIsInVuZGVmaW5lZCIsImRlcGxveU1vZHVsZSIsImFuZ3VsYXIiLCJtb2R1bGUiLCJEZXBsb3lTZXJ2aWNlIiwiJGh0dHAiLCIkZG9tZUNsdXN0ZXIiLCIkZG9tZUltYWdlIiwiJGRvbWVQdWJsaWMiLCIkZG9tZU1vZGVsIiwiJG1vZGFsIiwiJHEiLCIkdXRpbCIsIm5vZGVTZXJ2aWNlIiwiZ2V0SW5zdGFuY2UiLCJfdXJsIiwiX3ZlcnNpb25VcmwiLCJnZXRMaXN0IiwiZ2V0IiwiZ2V0TGlzdEJ5Q29sbGVjdGlvbklkIiwiY29sbGVjdGlvbklkIiwiZ2V0U2luZ2xlIiwiZGVwbG95SWQiLCJnZXRFdmVudHMiLCJnZXRJbnN0YW5jZXMiLCJnZXRWZXJzaW9ucyIsImdldFNpbmdsZVZlcnNpb24iLCJ2ZXJzaW9uSWQiLCJjcmVhdGVWZXJzaW9uIiwidmVyc2lvbiIsInBvc3QiLCJ0b0pzb24iLCJyb2xsYmFja0RlcGxveSIsInJlcGxpY2FzIiwidXBkYXRlRGVwbG95Iiwic3RhcnREZXBsb3kiLCJkZXBsb3lTZXJ2aWNlIiwiRGVwbG95IiwiZGVwbG95Q29uZmlnIiwibmFtZXNwYWNlTGlzdCIsImlzTmV3TmFtZXNwYWNlIiwiaW1hZ2VMaXN0IiwiZW52TGlzdCIsInZhbHVlIiwidGV4dCIsInZhbGlkIiwiaXBzIiwibG9nQ29uZmlnIiwiZW52VGV4dCIsInZlcnNpb25MaXN0Iiwibm9kZUxpc3RJbnMiLCJub2RlTGlzdEZvcklwcyIsImNsdXN0ZXJMaXN0SW5zIiwibG9hZGluZ0lucyIsImdldExvYWRpbmdJbnN0YW5jZSIsImNyZWF0b3IiLCJpZCIsIm5hbWUiLCJ0eXBlIiwidmlzaXRNb2RlIiwiaG9zdEVudiIsImNvbmZpZyIsImRlZmF1bHRWZXJzaW9uU3RyaW5nIiwiaW5pdCIsImN1cnJlbnRWZXJzaW9ucyIsImNyZWF0ZVRpbWUiLCJpc09iamVjdCIsInZlcnNpb25UeXBlIiwidmVyc2lvblN0cmluZyIsInBvZFNwZWMiLCJwYWRTcGVjIiwiaXNBcnJheSIsImxvYWRCYWxhbmNlRHJhZnRzIiwiaW5uZXJTZXJ2aWNlRHJhZnRzIiwibG9hZEJhbGFuY2VEcmFmdCIsImV4dGVybmFsSVBzIiwiaXAiLCJwdXNoIiwiYWRkTG9hZEJhbGFuY2UiLCJhZGRJbm5lclNlcnZpY2UiLCJuZXR3b3JrTW9kZSIsImFjY2Vzc1R5cGUiLCJ0aGVuIiwicmVzIiwiZGF0YSIsInJlc3VsdCIsImxlbmd0aCIsInRvZ2dsZVZlcnNpb24iLCJpIiwibCIsImluaXREYXRhIiwiY29udGFpbmVyRHJhZnRzIiwibGFiZWxTZWxlY3RvcnMiLCJpbml0U2VsZWN0ZWRMYWJlbHMiLCJ0b2dnbGVFbnYiLCJlbnYiLCJzdGF0ZWZ1bCIsInN0YXJ0TG9hZGluZyIsImltYWdlU2VydmljZSIsImdldFByb2plY3RJbWFnZXMiLCJpbWFnZSIsImVudnMiLCJlbnZTZXR0aW5ncyIsImtleSIsImRlc2NyaXB0aW9uIiwiZm9ybWFydENvbnRhaW5lckRyYWZ0cyIsImZpbmFsbHkiLCJmaW5pc2hMb2FkaW5nIiwiYWRkTG9nRHJhZnQiLCJnZXREYXRhIiwidG9nZ2xlQ2x1c3RlciIsIm5ld0NvbmZpZyIsImxhc3RVcGRhdGVUaW1lIiwiZGVwbG95bWVudFN0YXR1cyIsImN1cnJlbnRSZXBsaWNhcyIsImluZGV4IiwiY2x1c3RlcklkIiwiY2x1c3Rlckxpc3QiLCJjbHVzdGVyIiwiZ2V0Tm9kZUxpc3QiLCJub2RlTGlzdCIsImNvcHkiLCJub2RlIiwic3RhdHVzIiwiaXNTZWxlY3RlZCIsInNwbGljZSIsInRvZ2dsZU5vZGVDaGVjayIsImdldE5hbWVzcGFjZSIsIm5hbWVzcGFjZSIsImluaXRMYWJlbHNJbmZvIiwibGFiZWxTZWxlY3RvciIsImxhYmVsTmFtZSIsInRvZ2dsZUxhYmVsIiwiJCIsImV4dGVuZCIsImdldFRhZyIsImNvbnRhaW5lckRyYWZ0IiwiZ2V0SW1hZ2VUYWdzIiwicmVnaXN0cnkiLCJ0YWdMaXN0Iiwib2xkRW52IiwibmV3RW52IiwiaiIsImwxIiwiaW1hZ2VOYW1lIiwidyIsImwyIiwiaXNPbGRFbnYiLCJrIiwibDMiLCJ1c2VyIiwidGFnIiwidGFncyIsImNwdSIsIm1lbSIsImhlYWx0aENoZWNrZXIiLCJpbWFnZVB1bGxQb2xpY3kiLCJhdXRvRGVwbG95IiwibG9nSXRlbURyYWZ0cyIsImxvZ1BhdGgiLCJhdXRvQ29sbGVjdCIsImF1dG9EZWxldGUiLCJtb2RhbEluc3RhbmNlIiwib3BlbiIsImFuaW1hdGlvbiIsInRlbXBsYXRlVXJsIiwiY29udHJvbGxlciIsInNpemUiLCJpbWFnZUluZm8iLCJjb250YWluZXJEcmFmdEluZGV4IiwicG9ydCIsInRhcmdldFBvcnQiLCJsb2FkQmFsYW5jZURyYWZ0SW5kZXgiLCJsb2dEcmFmdCIsImluZGV4T2YiLCJpdGVtIiwiZXhwb3NlUG9ydE51bSIsImdldEZvcm1hcnRTZWxlY3RlZExhYmVscyIsImhvc3RMaXN0IiwiZ2V0U2VsZWN0ZWROb2RlcyIsImVudkNvbmYiLCJ0aW1lb3V0IiwiZGVsYXkiLCJ1cmwiLCJwcmVGb3JtYXR0ZWRsb2dEcmFmdHMiLCJsb2dJdGVtIiwiZm9ybWFydExvZ0l0ZW0iLCJsb2dUb3BpYyIsInByb2Nlc3NDbWQiLCJsb2dFeHBpcmVkIiwicG9kU3BlY1N0ciIsImRlZmVycmVkIiwiZGVmZXIiLCJfZm9ybWFydERlcGxveSIsInZlcnNpb25PYmoiLCJvcGVuUHJvbXB0IiwicmVzb2x2ZSIsIm9wZW5Db25maXJtIiwib3Blbldhcm5pbmciLCJ0aXRsZSIsIm1zZyIsInJlc3VsdE1zZyIsInJlamVjdCIsInByb21pc2UiLCJvbGRSZXBsaWNhcyIsInBhcnNlSW50IiwidmVyc2lvbk1vZGFsSW5zIiwiZGVwbG95SW5mbyIsInN0YXJ0SW5mbyIsImN1cnJlbnRWZXJzaW9uSWQiLCJkZWxldGUiLCJvYmoiLCJjcmVhdGVEZXBsb3kiLCJuYW1lc3BhY2VBcnIiLCJzZXROYW1lc3BhY2UiLCJ0b2dnbGVJc05ld05hbWVzcGFjZSIsInRvZ2dsZU5hbWVzcGFjZSIsImNhbGxiYWNrIiwiRGVwbG95SW5zdGFuY2VMaXN0IiwiaW5zdGFuY2VzIiwiaXNDaGVja0FsbCIsImlzQ2hlY2tBbGxDb250YWluZXIiLCJpbnN0YW5jZUxpc3QiLCJjb250YWluZXJMaXN0Iiwic2VsZWN0ZWRDb3VudCIsInNlbGVjdGVkQ29udGFpbmVyQ291bnQiLCJpbnN0YW5jZSIsImtleUZpbHRlciIsImNvbnRhaW5lcnMiLCJjb250YWluZXIiLCJzaG9ydENvbnRhaW5lcklkIiwiY29udGFpbmVySWQiLCJzdWJzdHJpbmciLCJrZXl3b3JkcyIsImluc3RhbmNlTmFtZSIsImlzQWxsSGFzQ2hhbmdlIiwiRGVwbG95TGlzdCIsImRlcGxveUxpc3QiLCJkZXBsb3kiLCJpc0xvYWRpbmciLCJkZXBsb3lJbnN0YW5jZUxpc3RJbnMiLCJkZXBsb3lOYW1lIiwibm90TmVlZEluc3RhbmNlcyIsImNsdXN0ZXJOYW1lIiwiY2x1c3RlckZpbHRlciIsImhvc3RGaWx0ZXIiLCJ0b2dnbGVEZXBsb3kiLCJpbnN0YW5jZXNDcmVhdG9yIiwiJGluamVjdCIsImZhY3RvcnkiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7OztBQUtBLENBQUMsVUFBQ0EsTUFBRCxFQUFTQyxTQUFULEVBQXVCO0FBQ3BCOztBQUNBLFFBQUlDLGVBQWVDLFFBQVFDLE1BQVIsQ0FBZSxjQUFmLEVBQStCLEVBQS9CLENBQW5COztBQUVBLGFBQVNDLGFBQVQsQ0FBdUJDLEtBQXZCLEVBQThCQyxZQUE5QixFQUE0Q0MsVUFBNUMsRUFBd0RDLFdBQXhELEVBQXFFQyxVQUFyRSxFQUFpRkMsTUFBakYsRUFBeUZDLEVBQXpGLEVBQTZGQyxLQUE3RixFQUFvRztBQUNoRyxZQUFNQyxjQUFjUCxhQUFhUSxXQUFiLENBQXlCLGFBQXpCLENBQXBCO0FBQ0EsWUFBTVYsZ0JBQWdCLFNBQWhCQSxhQUFnQixHQUFZO0FBQzlCLGdCQUFNVyxPQUFPLGFBQWI7QUFDQSxnQkFBTUMsY0FBYyxjQUFw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QUMsT0FBRCxFQUFVLGNBQVYsRUFBMEIsWUFBMUIsRUFBd0MsYUFBeEMsRUFBdUQsWUFBdkQsRUFBcUUsUUFBckUsRUFBK0UsSUFBL0UsRUFBcUYsT0FBckYsQ0FBeEI7QUFDQXZQLGlCQUFhd1AsT0FBYixDQUFxQixhQUFyQixFQUFvQ3JQLGFBQXBDO0FBQ0FMLFdBQU9FLFlBQVAsR0FBc0JBLFlBQXRCO0FBQ0gsQ0F2bENELEVBdWxDR0YsTUF2bENIIiwiZmlsZSI6ImNvbW1vbi9kZXBsb3lNb2R1bGUvZGVwbG95TW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogQGF1dGhvciAgQ2hhbmRyYUxlZVxyXG4gKiBAZGVzY3JpcHRpb24gIOmDqOe9suaooeWdl1xyXG4gKi9cclxuXHJcbigod2luZG93LCB1bmRlZmluZWQpID0+IHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGxldCBkZXBsb3lNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnZGVwbG95TW9kdWxlJywgW10pO1xyXG5cclxuICAgIGZ1bmN0aW9uIERlcGxveVNlcnZpY2UoJGh0dHAsICRkb21lQ2x1c3RlciwgJGRvbWVJbWFnZSwgJGRvbWVQdWJsaWMsICRkb21lTW9kZWwsICRtb2RhbCwgJHEsICR1dGlsKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZVNlcnZpY2UgPSAkZG9tZUNsdXN0ZXIuZ2V0SW5zdGFuY2UoJ05vZGVTZXJ2aWNlJyk7XHJcbiAgICAgICAgY29uc3QgRGVwbG95U2VydmljZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY29uc3QgX3VybCA9ICcvYXBpL2RlcGxveSc7XHJcbiAgICAgICAgICAgIGNvbnN0IF92ZXJzaW9uVXJsID0gJy9hcGkvdmVyc2lvbic7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0TGlzdCA9ICgpID0+ICRodHRwLmdldChgJHtfdXJsfS9saXN0YCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0TGlzdEJ5Q29sbGVjdGlvbklkID0gKGNvbGxlY3Rpb25JZCkgPT4gJGh0dHAuZ2V0KGAke191cmx9L2xpc3QvJHtjb2xsZWN0aW9uSWR9YCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0U2luZ2xlID0gKGRlcGxveUlkKSA9PiAkaHR0cC5nZXQoYCR7X3VybH0vaWQvJHtkZXBsb3lJZH1gKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRFdmVudHMgPSAoZGVwbG95SWQpID0+ICRodHRwLmdldChgJHtfdXJsfS9ldmVudC9saXN0P2RlcGxveUlkPSR7ZGVwbG95SWR9YCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0SW5zdGFuY2VzID0gKGRlcGxveUlkKSA9PiAkaHR0cC5nZXQoYCR7X3VybH0vJHtkZXBsb3lJZH0vaW5zdGFuY2VgKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRWZXJzaW9ucyA9IChkZXBsb3lJZCkgPT4gJGh0dHAuZ2V0KGAke192ZXJzaW9uVXJsfS9saXN0P2RlcGxveUlkPSR7ZGVwbG95SWR9YCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0U2luZ2xlVmVyc2lvbiA9IChkZXBsb3lJZCwgdmVyc2lvbklkKSA9PiAkaHR0cC5nZXQoYCR7X3ZlcnNpb25Vcmx9L2lkLyR7ZGVwbG95SWR9LyR7dmVyc2lvbklkfWApO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVZlcnNpb24gPSAodmVyc2lvbikgPT4gJGh0dHAucG9zdChgJHtfdmVyc2lvblVybH0vY3JlYXRlP2RlcGxveUlkPSR7dmVyc2lvbi5kZXBsb3lJZH1gLCBhbmd1bGFyLnRvSnNvbih2ZXJzaW9uKSk7XHJcbiAgICAgICAgICAgIHRoaXMucm9sbGJhY2tEZXBsb3kgPSAoZGVwbG95SWQsIHZlcnNpb25JZCwgcmVwbGljYXMpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXBsaWNhcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGAvYXBpL2RlcGxveS9hY3Rpb24vcm9sbGJhY2s/ZGVwbG95SWQ9JHtkZXBsb3lJZH0mdmVyc2lvbj0ke3ZlcnNpb25JZH0mcmVwbGljYXM9JHtyZXBsaWNhc31gKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoYC9hcGkvZGVwbG95L2FjdGlvbi9yb2xsYmFjaz9kZXBsb3lJZD0ke2RlcGxveUlkfSZ2ZXJzaW9uPSR7dmVyc2lvbklkfWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURlcGxveSA9IChkZXBsb3lJZCwgdmVyc2lvbklkLCByZXBsaWNhcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcGxpY2FzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoYC9hcGkvZGVwbG95L2FjdGlvbi91cGRhdGU/ZGVwbG95SWQ9JHtkZXBsb3lJZH0mdmVyc2lvbj0ke3ZlcnNpb25JZH0mcmVwbGljYXM9JHtyZXBsaWNhc31gKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoYC9hcGkvZGVwbG95L2FjdGlvbi91cGRhdGU/ZGVwbG95SWQ9JHtkZXBsb3lJZH0mdmVyc2lvbj0ke3ZlcnNpb25JZH1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5zdGFydERlcGxveSA9IChkZXBsb3lJZCwgdmVyc2lvbklkLCByZXBsaWNhcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcGxpY2FzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoYC9hcGkvZGVwbG95L2FjdGlvbi9zdGFydD9kZXBsb3lJZD0ke2RlcGxveUlkfSZ2ZXJzaW9uPSR7dmVyc2lvbklkfSZyZXBsaWNhcz0ke3JlcGxpY2FzfWApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChgL2FwaS9kZXBsb3kvYWN0aW9uL3N0YXJ0P2RlcGxveUlkPSR7ZGVwbG95SWR9JnZlcnNpb249JHt2ZXJzaW9uSWR9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBkZXBsb3lTZXJ2aWNlID0gbmV3IERlcGxveVNlcnZpY2UoKTtcclxuXHJcblxyXG4gICAgICAgIGNsYXNzIERlcGxveSB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKGRlcGxveUNvbmZpZykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uSWQgPSAnJztcclxuICAgICAgICAgICAgICAgIHRoaXMubmFtZXNwYWNlTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgLy8g5piv5ZCm5piv5paw5bu6bmFtZXNwYWNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzTmV3TmFtZXNwYWNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudkxpc3QgPSBbe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnVEVTVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJ+a1i+ivleeOr+WigydcclxuICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ1BST0QnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICfnlJ/kuqfnjq/looMnXHJcbiAgICAgICAgICAgICAgICB9XTtcclxuICAgICAgICAgICAgICAgIC8vIOihqOWNleS4jeiDveWunueOsOeahOmqjOivgVxyXG4gICAgICAgICAgICAgICAgdGhpcy52YWxpZCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpcOiHs+WwkeWhq+S4gOS4qlxyXG4gICAgICAgICAgICAgICAgICAgIGlwczogZmFsc2VcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAvLyDmmK/lkKblvIDlkK/ml6Xlv5fmlLbpm4ZcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nQ29uZmlnID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW52VGV4dCA9ICfor7fpgInmi6npg6jnvbLnjq/looMnO1xyXG4gICAgICAgICAgICAgICAgdGhpcy52ZXJzaW9uTGlzdCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0SW5zID0gJGRvbWVDbHVzdGVyLmdldEluc3RhbmNlKCdOb2RlTGlzdCcpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdEZvcklwcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdElucyA9ICRkb21lQ2x1c3Rlci5nZXRJbnN0YW5jZSgnQ2x1c3Rlckxpc3QnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucyA9ICRkb21lUHVibGljLmdldExvYWRpbmdJbnN0YW5jZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdG9yID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogbnVsbFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHRoaXMudmlzaXRNb2RlID0gJ25vQWNjZXNzJztcclxuICAgICAgICAgICAgICAgIHRoaXMuaG9zdEVudiA9ICdURVNUJztcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnID0ge307XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmF1bHRWZXJzaW9uU3RyaW5nID0ge1xyXG4gICAgICAgICAgICAgICAgICAnWUFNTCc6ICdjb250YWluZXJzOlxcbi0gaW1hZ2U6IFxcXCJwdWIuZG9tZW9zLm9yZy9yZWdpc3RyeToyLjNcXFwiXFxuICBuYW1lOiBcXFwidGVzdC1jb250YWluZXJcXFwiXFxuICB2b2x1bWVNb3VudHM6XFxuICAtIG1vdW50UGF0aDogXFxcIi90ZXN0LWhvc3RwYXRoXFxcIlxcbiAgICBuYW1lOiBcXFwidGVzdC12b2x1bWVcXFwiXFxudm9sdW1lczpcXG4tIGhvc3RQYXRoOlxcbiAgICBwYXRoOiBcXFwiL29wdC9zY3NcXFwiXFxuICBuYW1lOiBcXFwidGVzdC12b2x1bWVcXFwiXFxuJyxcclxuICAgICAgICAgICAgICAgICAgJ0pTT04nOiAne1xcbiAgXFxcImNvbnRhaW5lcnNcXFwiOiBbe1xcbiAgICBcXFwiaW1hZ2VcXFwiOiBcXFwicHViLmRvbWVvcy5vcmcvcmVnaXN0cnk6Mi4zXFxcIixcXG4gICAgXFxcIm5hbWVcXFwiOiBcXFwidGVzdC1jb250YWluZXJcXFwiLFxcbiAgICBcXFwidm9sdW1lTW91bnRzXFxcIjogW3tcXG4gICAgICBcXFwibW91bnRQYXRoXFxcIjogXFxcIi90ZXN0LWhvc3RwYXRoXFxcIixcXG4gICAgICBcXFwibmFtZVxcXCI6IFxcXCJ0ZXN0LXZvbHVtZVxcXCJcXG4gICAgfV1cXG4gIH1dLFxcbiAgXFxcInZvbHVtZXNcXFwiOiBbe1xcbiAgICBcXFwiaG9zdFBhdGhcXFwiOiB7XFxuICAgICAgXFxcInBhdGhcXFwiOiBcXFwiL29wdC9zY3NcXFwiXFxuICAgIH0sXFxuICAgIFxcXCJuYW1lXFxcIjogXFxcInRlc3Qtdm9sdW1lXFxcIlxcbiAgfV1cXG59XFxuJyxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoZGVwbG95Q29uZmlnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbml0KGRlcGxveUNvbmZpZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50VmVyc2lvbnMsIGlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVUaW1lID0gLTE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNPYmplY3QoZGVwbG95Q29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZGVwbG95Q29uZmlnLnZlcnNpb25UeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy52ZXJzaW9uVHlwZSA9ICdDVVNUT00nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVwbG95Q29uZmlnLnZlcnNpb25UeXBlID09PSAnWUFNTCcgfHwgZGVwbG95Q29uZmlnLnZlcnNpb25UeXBlID09PSAnSlNPTicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLnZlcnNpb25TdHJpbmcgPSBkZXBsb3lDb25maWcudmVyc2lvblN0cmluZyB8fCB7fTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLnZlcnNpb25TdHJpbmcucG9kU3BlYyA9IGRlcGxveUNvbmZpZy52ZXJzaW9uU3RyaW5nLnBhZFNwZWMgfHwgJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRlcGxveUNvbmZpZy5yZXBsaWNhcyAhPT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLnJlcGxpY2FzID0gMztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5piv5ZCm5L2/55So6LSf6L295Z2H6KGhXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KGRlcGxveUNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0cykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8v5a+55YaF5pyN5YqhXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KGRlcGxveUNvbmZpZy5jdXJyZW50VmVyc2lvbnMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5jdXJyZW50VmVyc2lvbnMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbG9hZEJhbGFuY2VEcmFmdC5leHRlcm5hbElQczogWydleHRlcm5hbElQMScsJ2V4dGVybmFsSVAyJ10gLS0+IFt7aXA6J2V4dGVybmFsSVAxJ30se2lwOidleHRlcm5hbElQMSd9LHtpcDonJ31dXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbG9hZEJhbGFuY2VEcmFmdCBvZiBkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFsb2FkQmFsYW5jZURyYWZ0LmV4dGVybmFsSVBzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkQmFsYW5jZURyYWZ0LmV4dGVybmFsSVBzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4dGVybmFsSVBzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGlwIG9mIGxvYWRCYWxhbmNlRHJhZnQuZXh0ZXJuYWxJUHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVybmFsSVBzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlwOiBpcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZXJuYWxJUHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpcDogJydcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRCYWxhbmNlRHJhZnQuZXh0ZXJuYWxJUHMgPSBleHRlcm5hbElQcztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnID0gZGVwbG95Q29uZmlnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZExvYWRCYWxhbmNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRJbm5lclNlcnZpY2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy/nvZHnu5zmqKHlvI9cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlnLm5ldHdvcmtNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLm5ldHdvcmtNb2RlID0gJ0RFRkFVTFQnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlnLmFjY2Vzc1R5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuYWNjZXNzVHlwZSA9ICdLOFNfU0VSVklDRSc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRWZXJzaW9ucyA9IHRoaXMuY29uZmlnLmN1cnJlbnRWZXJzaW9ucztcclxuICAgICAgICAgICAgICAgICAgICAvLyDmmK/lkKbmmK/mlrDlu7pkZXBsb3lcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuZGVwbG95SWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnZlcnNpb25MaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLmdldFZlcnNpb25zKHRoaXMuY29uZmlnLmRlcGxveUlkKS50aGVuKChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZlcnNpb25MaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50VmVyc2lvbnMubGVuZ3RoID09PSAwICYmICR1dGlsLmlzT2JqZWN0KHRoaXMudmVyc2lvbkxpc3RbMF0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlVmVyc2lvbih0aGlzLnZlcnNpb25MaXN0WzBdLnZlcnNpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gY3VycmVudFZlcnNpb25zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRWZXJzaW9uc1tpXS5jcmVhdGVUaW1lID4gY3JlYXRlVGltZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZVRpbWUgPSBjdXJyZW50VmVyc2lvbnNbaV0uY3JlYXRlVGltZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA9IGN1cnJlbnRWZXJzaW9uc1tpXS52ZXJzaW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlVmVyc2lvbihpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0RGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGRlcGxveWluZm/lkox2ZXJzaW9uaW5mb+mHjeWQiOeahOS/oeaBr+WcqOi/memHjOWkhOeQhu+8jOWIh+aNonZlcnNpb27kuYvlkI7ph43mlrDosIPnlKjov5vooYzliJ3lp4vljJZcclxuICAgICAgICAgICAgaW5pdERhdGEoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkodGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KHRoaXMuY29uZmlnLmxhYmVsU2VsZWN0b3JzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxhYmVsU2VsZWN0b3JzID0gW107XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRTZWxlY3RlZExhYmVscygpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb25maWcuaG9zdEVudikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlRW52KHRoaXMuZW52TGlzdFswXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGVudiBvZiB0aGlzLmVudkxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmhvc3RFbnYgPT09IGVudi52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVFbnYoZW52KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5zdGF0ZWZ1bCAhPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheSh0aGlzLmltYWdlTGlzdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnZG9ja2VySW1hZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVJbWFnZS5pbWFnZVNlcnZpY2UuZ2V0UHJvamVjdEltYWdlcygpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOagvOW8j+WMlmltYWdl55qEZW52U2V0dGluZ3PkuLpjb250YWluZXJEcmFmdHPmoLzlvI9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGltYWdlIG9mIGltYWdlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlbnZzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlLmVudlNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGVudiBvZiBpbWFnZS5lbnZTZXR0aW5ncykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52cy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGVudi5rZXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGVudi52YWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZW52LmRlc2NyaXB0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5lbnZTZXR0aW5ncyA9IGVudnM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdCA9IGltYWdlTGlzdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWkhOeQhumDqOe9suW3suacieeahOmVnOWDj1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtYXJ0Q29udGFpbmVyRHJhZnRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ2RvY2tlckltYWdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZm9ybWFydENvbnRhaW5lckRyYWZ0cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cyk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpbWFnZSBvZiB0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZExvZ0RyYWZ0KGltYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZXRDb2xsZWN0aW9uSWQoY29sbGVjdGlvbklkKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uSWQgPSBjb2xsZWN0aW9uSWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5pdENsdXN0ZXIoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnY2x1c3RlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlU2VydmljZS5nZXREYXRhKCkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlckxpc3RJbnMuaW5pdChyZXMuZGF0YS5yZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUNsdXN0ZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ2NsdXN0ZXInKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIOWIt+aWsOW9k+WJjURlcGxveeeKtuaAgVxyXG4gICAgICAgICAgICBmcmVzaERlcGxveShuZXdDb25maWcpIHtcclxuICAgICAgICAgICAgICAgIGlmICgkdXRpbC5pc09iamVjdChuZXdDb25maWcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubGFzdFVwZGF0ZVRpbWUgPSBuZXdDb25maWcubGFzdFVwZGF0ZVRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZGVwbG95bWVudFN0YXR1cyA9IG5ld0NvbmZpZy5kZXBsb3ltZW50U3RhdHVzO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmN1cnJlbnRWZXJzaW9ucyA9IG5ld0NvbmZpZy5jdXJyZW50VmVyc2lvbnM7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY3VycmVudFJlcGxpY2FzID0gbmV3Q29uZmlnLmN1cnJlbnRSZXBsaWNhcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmcmVzaFZlcnNpb25MaXN0KCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygndmVyc2lvbkxpc3QnKTtcclxuICAgICAgICAgICAgICAgIGRlcGxveVNlcnZpY2UuZ2V0VmVyc2lvbnModGhpcy5jb25maWcuZGVwbG95SWQpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmVyc2lvbkxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XHJcbiAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygndmVyc2lvbkxpc3QnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRvZ2dsZUNsdXN0ZXIoaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2x1c3RlcklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHVzdGVyTGlzdCA9IHRoaXMuY2x1c3Rlckxpc3RJbnMuY2x1c3Rlckxpc3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsdXN0ZXJMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOmAieaLqeW9k+WJjWRlcGxveS92ZXJzaW9u55qEY2x1c3RlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXggPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gY2x1c3Rlckxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2x1c3Rlckxpc3RbaV0uaWQgPT09IHRoaXMuY29uZmlnLmNsdXN0ZXJJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzlvZPliY1kZXBsb3kvdmVyc2lvbuayoeaciWNsdXN0ZXLvvIzliJnpgInmi6nnrKzkuIDkuKpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmRleCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdElucy50b2dnbGVDbHVzdGVyKGluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ0NvbmZpZyA9IGNsdXN0ZXJMaXN0W2luZGV4XS5sb2dDb25maWc7XHJcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlcklkID0gdGhpcy5jbHVzdGVyTGlzdElucy5jbHVzdGVyLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOmHjee9ruaXpeW/l+S/oeaBr1xyXG4gICAgICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubG9nQ29uZmlnICE9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvZ0RyYWZ0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nSXRlbURyYWZ0czogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dQYXRoOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29sbGVjdDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0RlbGV0ZTogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICovXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ25vZGVsaXN0Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE5vZGVMaXN0KGNsdXN0ZXJJZCkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBub2RlTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdEZvcklwcyA9IGFuZ3VsYXIuY29weShub2RlTGlzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ub2RlTGlzdEZvcklwcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5vZGUgPSB0aGlzLm5vZGVMaXN0Rm9ySXBzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuc3RhdHVzID09ICdSZWFkeScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXBzID0gdGhpcy5jb25maWcubG9hZEJhbGFuY2VEcmFmdHNbMF0uZXh0ZXJuYWxJUHM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaXAgb2YgaXBzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpcCA9PT0gbm9kZS5pcCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmlzU2VsZWN0ZWQgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RGb3JJcHMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGktLTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzmmK9hcHAgc3RvcmXnmoTkuLvmnLrliJfooajvvIzliJnov4fmu6TmjonmsqHmnIlkaXNrUGF0aOeahOS4u+aculxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0SW5zLmluaXQobm9kZUxpc3QsIHRoaXMuY29uZmlnLnN0YXRlZnVsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0U2VsZWN0ZWRMYWJlbHMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy50b2dnbGVFbnYodGhpcy5jb25maWcuaG9zdEVudik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWmguaenOaYr+acieeKtuaAgeacjeWKoe+8jOm7mOiupOmAieaLqeWSjHJlcGxpY3Pnm7jnrYnnmoTkuLvmnLrkuKrmlbBcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLnN0YXRlZnVsICYmIHRoaXMuY29uZmlnLnJlcGxpY2FzICYmIHRoaXMubm9kZUxpc3RJbnMubm9kZUxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5ub2RlTGlzdElucy5ub2RlTGlzdC5sZW5ndGg7IGkgPCBsICYmIGkgPCB0aGlzLmNvbmZpZy5yZXBsaWNhczsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy5ub2RlTGlzdFtpXS5pc1NlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0SW5zLnRvZ2dsZU5vZGVDaGVjayh0aGlzLm5vZGVMaXN0SW5zLm5vZGVMaXN0W2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy5pbml0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCdub2RlbGlzdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuZGVwbG95SWQgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCduYW1lc3BhY2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TmFtZXNwYWNlKGNsdXN0ZXJJZCkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5hbWVzcGFjZUxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzTmV3TmFtZXNwYWNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5uYW1lc3BhY2UgPSB0aGlzLm5hbWVzcGFjZUxpc3RbMF0ubmFtZSB8fCBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLm5hbWVzcGFjZUxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubmFtZXNwYWNlTGlzdFtpXS5uYW1lID09ICdkZWZhdWx0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5uYW1lc3BhY2UgPSB0aGlzLm5hbWVzcGFjZUxpc3RbaV0ubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzTmV3TmFtZXNwYWNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5hbWVzcGFjZUxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLm5hbWVzcGFjZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ25hbWVzcGFjZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyDliJ3lp4vljJbpgInkuK3nmoRsYWJlbFxyXG4gICAgICAgICAgICBpbml0U2VsZWN0ZWRMYWJlbHMoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0SW5zLmluaXRMYWJlbHNJbmZvKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlnLmxhYmVsU2VsZWN0b3JzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGV0IGxhYmVsU2VsZWN0b3JzID0gdGhpcy5jb25maWcubGFiZWxTZWxlY3RvcnM7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBsYWJlbFNlbGVjdG9yIG9mIGxhYmVsU2VsZWN0b3JzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxhYmVsTmFtZSA9IGxhYmVsU2VsZWN0b3IubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGFiZWxOYW1lICE9ICdrdWJlcm5ldGVzLmlvL2hvc3RuYW1lJyAmJiBsYWJlbE5hbWUgIT0gJ1RFU1RFTlYnICYmIGxhYmVsTmFtZSAhPSAnUFJPREVOVicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy50b2dnbGVMYWJlbChsYWJlbE5hbWUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YWxpZElwcygpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpdE1vZGUgPT09ICdmb3JlaWduJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3RGb3JJcHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmlzU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkLmlwcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWQuaXBzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZC5pcHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIOWIh+aNouW9k+WJjeWxleekuueahHZlcnNpb25cclxuICAgICAgICAgICAgdG9nZ2xlVmVyc2lvbih2ZXJzaW9uSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLmdldFNpbmdsZVZlcnNpb24odGhpcy5jb25maWcuZGVwbG95SWQsIHZlcnNpb25JZCkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkdXRpbC5pc09iamVjdChyZXMuZGF0YS5yZXN1bHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLmV4dGVuZCh0aGlzLmNvbmZpZywgcmVzLmRhdGEucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdERhdGEoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gY29udGFpbmVyRHJhZnRz77ya5paw5aKeY29udGFpbmVyRHJhZnTnmoRvbGRFbnbvvIxuZXdFbnbvvIx0YWdMaXN05bGe5oCnXHJcbiAgICAgICAgICAgIGZvcm1hcnRDb250YWluZXJEcmFmdHMoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29udGFpbmVyRHJhZnRzID0gdGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGdldFRhZyA9IChjb250YWluZXJEcmFmdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ3RhZycpO1xyXG4gICAgICAgICAgICAgICAgICAgICRkb21lSW1hZ2UuaW1hZ2VTZXJ2aWNlLmdldEltYWdlVGFncyhjb250YWluZXJEcmFmdC5pbWFnZSwgY29udGFpbmVyRHJhZnQucmVnaXN0cnkpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdC50YWdMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygndGFnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBjb250YWluZXJEcmFmdHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnRzW2ldLm9sZEVudiA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0c1tpXS5uZXdFbnYgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDojrflvpfor6XplZzlg4/niYjmnKxcclxuICAgICAgICAgICAgICAgICAgICBnZXRUYWcoY29udGFpbmVyRHJhZnRzW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgb2xkRW52ID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6I635b6X6ZWc5YOP5Y6f5pys55qEZW52U2V0dGluZ3NcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMCwgbDEgPSB0aGlzLmltYWdlTGlzdC5sZW5ndGg7IGogPCBsMTsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmltYWdlTGlzdFtqXS5pbWFnZU5hbWUgPT09IGNvbnRhaW5lckRyYWZ0c1tpXS5pbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkRW52ID0gdGhpcy5pbWFnZUxpc3Rbal0uZW52U2V0dGluZ3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyDliIbnprvplZzlg4/mnKzouqvnmoRpbWFnZeWSjOaWsOa3u+WKoOeahGltYWdl55qEZW52XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lckRyYWZ0c1tpXS5lbnZzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHcgPSAwLCBsMiA9IGNvbnRhaW5lckRyYWZ0c1tpXS5lbnZzLmxlbmd0aDsgdyA8IGwyOyB3KyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc09sZEVudiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgayA9IDAsIGwzID0gb2xkRW52Lmxlbmd0aDsgayA8IGwzOyBrKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob2xkRW52W2tdLmtleSA9PT0gY29udGFpbmVyRHJhZnRzW2ldLmVudnNbd10ua2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzT2xkRW52ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzT2xkRW52KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnRzW2ldLm9sZEVudi5wdXNoKGNvbnRhaW5lckRyYWZ0c1tpXS5lbnZzW3ddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnRzW2ldLm5ld0Vudi5wdXNoKGNvbnRhaW5lckRyYWZ0c1tpXS5lbnZzW3ddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0c1tpXS5vbGRFbnYgPSBhbmd1bGFyLmNvcHkob2xkRW52KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG9nZ2xlTmFtZXNwYWNlKG5hbWVzcGFjZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRvZ2dsZUlzTmV3TmFtZXNwYWNlKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc05ld05hbWVzcGFjZSA9ICF0aGlzLmlzTmV3TmFtZXNwYWNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcubmFtZXNwYWNlID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0b2dnbGVFbnYoZW52KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5ob3N0RW52ID0gZW52LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnZUZXh0ID0gZW52LnRleHQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0SW5zLnRvZ2dsZUVudihlbnYudmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRvZ2dsZUNyZWF0b3IodXNlcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdG9yID0gdXNlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0b2dnbGVJbWFnZVRhZyhpbmRleCwgdGFnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzW2luZGV4XS50YWcgPSB0YWc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyDmt7vliqBjb250YWluZXJEcmFmdFxyXG4gICAgICAgICAgICBhZGRJbWFnZShpbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ2FkZEltYWdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVJbWFnZS5pbWFnZVNlcnZpY2UuZ2V0SW1hZ2VUYWdzKGltYWdlLmltYWdlTmFtZSwgaW1hZ2UucmVnaXN0cnkpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFncyA9IHJlcy5kYXRhLnJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IGltYWdlLmltYWdlTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJ5OiBpbWFnZS5yZWdpc3RyeSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNwdTogMC41LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtOiAxMDI0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiB0YWdzICYmIHRhZ3NbMF0gPyB0YWdzWzBdLnRhZyA6IHZvaWQgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZ0xpc3Q6IHRhZ3MgfHwgW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRFbnY6IGltYWdlLmVudlNldHRpbmdzIHx8IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RW52OiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTk9ORSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVB1bGxQb2xpY3k6ICdBbHdheXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0RlcGxveTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dJdGVtRHJhZnRzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nUGF0aDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29sbGVjdDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvRGVsZXRlOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCdhZGRJbWFnZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8g5re75Yqg5YW25LuW6ZWc5YOPXHJcbiAgICAgICAgICAgIGFkZE90aGVySW1hZ2UoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcclxuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvaW5kZXgvdHBsL21vZGFsL290aGVySW1hZ2VNb2RhbC9vdGhlckltYWdlTW9kYWwuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ090aGVySW1hZ2VNb2RhbEN0cicsXHJcbiAgICAgICAgICAgICAgICAgICAgc2l6ZTogJ21kJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKChpbWFnZUluZm8pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiBpbWFnZUluZm8ubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cnk6IGltYWdlSW5mby5yZWdpc3RyeSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3B1OiAwLjUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbTogMTAyNCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiBpbWFnZUluZm8udGFnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdMaXN0OiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiBpbWFnZUluZm8udGFnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbGRFbnY6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdFbnY6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWxldGVJbWFnZShpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWRkSW1hZ2VFbnYoaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0c1tpbmRleF0ubmV3RW52LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGtleTogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVsZXRlSW1hZ2VFbnYoY29udGFpbmVyRHJhZnRJbmRleCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0c1tjb250YWluZXJEcmFmdEluZGV4XS5uZXdFbnYuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhZGRMb2FkQmFsYW5jZSgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHBvcnQ6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFBvcnQ6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGV4dGVybmFsSVBzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpcDogJydcclxuICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWRkSW5uZXJTZXJ2aWNlKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuaW5uZXJTZXJ2aWNlRHJhZnRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHBvcnQ6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFBvcnQ6ICcnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhZGRFeHRlcm5hbElQcyhpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcubG9hZEJhbGFuY2VEcmFmdHNbaW5kZXhdLmV4dGVybmFsSVBzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGlwOiAnJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVsZXRlRXh0ZXJuYWxJUHMobG9hZEJhbGFuY2VEcmFmdEluZGV4LCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcubG9hZEJhbGFuY2VEcmFmdHNbbG9hZEJhbGFuY2VEcmFmdEluZGV4XS5leHRlcm5hbElQcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFkZExvZ0RyYWZ0KGltYWdlKSB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZS5sb2dJdGVtRHJhZnRzID0gaW1hZ2UubG9nSXRlbURyYWZ0cyB8fCBbXTtcclxuICAgICAgICAgICAgICAgIGltYWdlLmxvZ0l0ZW1EcmFmdHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nUGF0aDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbGxlY3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dG9EZWxldGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWxldGVMb2dEcmFmdChpbWFnZSwgbG9nRHJhZnQpIHtcclxuICAgICAgICAgICAgICAgIGltYWdlLmxvZ0l0ZW1EcmFmdHMuc3BsaWNlKGltYWdlLmxvZ0l0ZW1EcmFmdHMuaW5kZXhPZihsb2dEcmFmdCksIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZUFyckl0ZW0oaXRlbSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnW2l0ZW1dLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9ybWFydEhlYWx0aENoZWNrZXIoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcubmV0d29ya01vZGUgPT0gJ0hPU1QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY29udGFpbmVyRHJhZnQgb2YgdGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTk9ORSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2hhbmdlTmV0d29ya21vZGUoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcubmV0d29ya01vZGUgPT0gJ0hPU1QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbG9hZEJhbGFuY2VEcmFmdCBvZiB0aGlzLmNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQmFsYW5jZURyYWZ0LnBvcnQgPSBsb2FkQmFsYW5jZURyYWZ0LnRhcmdldFBvcnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNoYW5nZVRhcmdldFBvcnQoaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0c1tpbmRleF0ucG9ydCA9IHRoaXMuY29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzW2luZGV4XS50YXJnZXRQb3J0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8g5bCG5pWw5o2u57uT5p6E6L2s5o2i5Li65LiO5ZCO5Y+w5Lqk5LqS55qE5pWw5o2u5qC85byPXHJcbiAgICAgICAgICAgIF9mb3JtYXJ0RGVwbG95KCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRlcGxveUNvbmZpZyA9IGFuZ3VsYXIuY29weSh0aGlzLmNvbmZpZyk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGRlcGxveUNvbmZpZy5uZXR3b3JrTW9kZSA9PSAnSE9TVCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcuYWNjZXNzVHlwZSA9ICdESVknO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpdE1vZGUgPT0gJ25vQWNjZXNzJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcuZXhwb3NlUG9ydE51bSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcuZXhwb3NlUG9ydE51bSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmlzaXRNb2RlID09ICdub0FjY2VzcycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmFjY2Vzc1R5cGUgPSAnRElZJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudmlzaXRNb2RlID09ICdpbnRlcm5hbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmFjY2Vzc1R5cGUgPSAnSzhTX1NFUlZJQ0UnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcuaW5uZXJTZXJ2aWNlRHJhZnRzWzBdLnRhcmdldFBvcnQgPSBkZXBsb3lDb25maWcuaW5uZXJTZXJ2aWNlRHJhZnRzWzBdLnBvcnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0cyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5hY2Nlc3NUeXBlID0gJ0s4U19TRVJWSUNFJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmlubmVyU2VydmljZURyYWZ0cyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMgPSAoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpcHMgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZEJhbGFuY2VEcmFmdHMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3RGb3JJcHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXBzLnB1c2gobm9kZS5pcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbG9hZEJhbGFuY2VEcmFmdCBvZiBkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRCYWxhbmNlRHJhZnQucG9ydCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZEJhbGFuY2VEcmFmdC5leHRlcm5hbElQcyA9IGlwcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRCYWxhbmNlRHJhZnRzLnB1c2gobG9hZEJhbGFuY2VEcmFmdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRCYWxhbmNlRHJhZnRzO1xyXG4gICAgICAgICAgICAgICAgfSkoKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFkZXBsb3lDb25maWcuc3RhdGVmdWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcubGFiZWxTZWxlY3RvcnMgPSB0aGlzLm5vZGVMaXN0SW5zLmdldEZvcm1hcnRTZWxlY3RlZExhYmVscygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcuaG9zdExpc3QgPSB0aGlzLm5vZGVMaXN0SW5zLmdldFNlbGVjdGVkTm9kZXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcuY2x1c3RlcklkID0gdGhpcy5jbHVzdGVyTGlzdElucy5jbHVzdGVyLmlkO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5jb2xsZWN0aW9uSWQgPSB0aGlzLmNvbGxlY3Rpb25JZDtcclxuXHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3JlYXRvci5pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgwKSBkZXBsb3lDb25maWcuY3JlYXRvciA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRvcklkOiB0aGlzLmNyZWF0b3IuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0b3JOYW1lOiB0aGlzLmNyZWF0b3IubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRvclR5cGU6IHRoaXMuY3JlYXRvci50eXBlXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcuY3JlYXRvcklkID0gdGhpcy5jcmVhdG9yLmlkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKi9cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZGVwbG95Q29uZmlnLnZlcnNpb25UeXBlID09PSAnQ1VTVE9NJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5jb250YWluZXJEcmFmdHMgPSAoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVwbG95Q29uZmlnLnN0YXRlZnVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVwbG95Q29uZmlnLmNvbnRhaW5lckRyYWZ0cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkZXBsb3lDb25maWcuY29udGFpbmVyRHJhZnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZW52Q29uZiwgY29udGFpbmVyRHJhZnRzID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFsdGhDaGVja2VyO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY29udGFpbmVyRHJhZnQgb2YgZGVwbG95Q29uZmlnLmNvbnRhaW5lckRyYWZ0cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52Q29uZiA9IGNvbnRhaW5lckRyYWZ0Lm9sZEVudjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY29udGFpbmVyRHJhZnQuaGVhbHRoQ2hlY2tlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdOT05FJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFsdGhDaGVja2VyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIudHlwZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVwbG95Q29uZmlnLm5ldHdvcmtNb2RlICE9ICdIT1NUJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoZWFsdGhDaGVja2VyLnR5cGUgPT0gJ1RDUCcgfHwgaGVhbHRoQ2hlY2tlci50eXBlID09ICdIVFRQJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFsdGhDaGVja2VyLnBvcnQgPSBjb250YWluZXJEcmFmdC5oZWFsdGhDaGVja2VyLnBvcnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXIudGltZW91dCA9IGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIudGltZW91dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlci5kZWxheSA9IGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIuZGVsYXk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoZWFsdGhDaGVja2VyLnR5cGUgPT0gJ0hUVFAnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXIudXJsID0gY29udGFpbmVyRHJhZnQuaGVhbHRoQ2hlY2tlci51cmw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFsdGhDaGVja2VyLnR5cGUgPSAnTk9ORSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgZW52IG9mIGNvbnRhaW5lckRyYWZ0Lm5ld0Vudikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbnYua2V5ICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZDb25mLnB1c2goZW52KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvZ0l0ZW1EcmFmdHMgPSAoKHByZUZvcm1hdHRlZGxvZ0RyYWZ0cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb2dJdGVtRHJhZnRzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbG9nSXRlbSBvZiBwcmVGb3JtYXR0ZWRsb2dEcmFmdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvZ0l0ZW0ubG9nUGF0aCAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmb3JtYXJ0TG9nSXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dQYXRoOiBsb2dJdGVtLmxvZ1BhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbGxlY3Q6IGxvZ0l0ZW0uYXV0b0NvbGxlY3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0RlbGV0ZTogbG9nSXRlbS5hdXRvRGVsZXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvZ0l0ZW0uYXV0b0NvbGxlY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0TG9nSXRlbS5sb2dUb3BpYyA9IGxvZ0l0ZW0ubG9nVG9waWM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWFydExvZ0l0ZW0ucHJvY2Vzc0NtZCA9IGxvZ0l0ZW0ucHJvY2Vzc0NtZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2dJdGVtLmF1dG9EZWxldGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0TG9nSXRlbS5sb2dFeHBpcmVkID0gbG9nSXRlbS5sb2dFeHBpcmVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nSXRlbURyYWZ0cy5wdXNoKGZvcm1hcnRMb2dJdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9nSXRlbURyYWZ0cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvZ0l0ZW1EcmFmdHM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkoY29udGFpbmVyRHJhZnQubG9nSXRlbURyYWZ0cyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiBjb250YWluZXJEcmFmdC5pbWFnZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpc3RyeTogY29udGFpbmVyRHJhZnQucmVnaXN0cnksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiBjb250YWluZXJEcmFmdC50YWcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3B1OiBjb250YWluZXJEcmFmdC5jcHUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtOiBjb250YWluZXJEcmFmdC5tZW0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nSXRlbURyYWZ0czogbG9nSXRlbURyYWZ0cyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZzOiBlbnZDb25mLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXI6IGhlYWx0aENoZWNrZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VQdWxsUG9saWN5OiBjb250YWluZXJEcmFmdC5pbWFnZVB1bGxQb2xpY3ksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0RlcGxveTogY29udGFpbmVyRHJhZnQuYXV0b0RlcGxveVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRhaW5lckRyYWZ0cztcclxuICAgICAgICAgICAgICAgICAgICB9KSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkZXBsb3lDb25maWcudmVyc2lvblR5cGUgPT09ICdKU09OJyB8fCBkZXBsb3lDb25maWcudmVyc2lvblR5cGUgPT09ICdZQU1MJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXBsb3lDb25maWcudmVyc2lvblN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcucG9kU3BlY1N0ciA9IGRlcGxveUNvbmZpZy52ZXJzaW9uU3RyaW5nLnBvZFNwZWNTdHI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkZXBsb3lDb25maWcudmVyc2lvblN0cmluZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlcGxveUNvbmZpZztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY3JlYXRlVmVyc2lvbigpIHsgLy8g5Yib5bu6dmVyc2lvblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NvbmZpZyA9IHRoaXMuX2Zvcm1hcnREZXBsb3koKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmVyc2lvbk9iaiA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUlkOiBuZXdDb25maWcuZGVwbG95SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdHM6IG5ld0NvbmZpZy5jb250YWluZXJEcmFmdHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFNlbGVjdG9yczogbmV3Q29uZmlnLmxhYmVsU2VsZWN0b3JzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVyc2lvblR5cGU6IG5ld0NvbmZpZy52ZXJzaW9uVHlwZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvZFNwZWNTdHI6IG5ld0NvbmZpZy5wb2RTcGVjU3RyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS5jcmVhdGVWZXJzaW9uKHZlcnNpb25PYmopLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuZGVwbG95bWVudFN0YXR1cyAhPSAnUlVOTklORycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+aWsOW7uumDqOe9sueJiOacrOaIkOWKnyzlvZPliY3nirbmgIHkuI3og73ljYfnuqfjgIInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoJ2NyZWF0ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlbkNvbmZpcm0oJ+aIkOWKn+aWsOW7uumDqOe9sueJiOacrO+8jOaYr+WQpue7p+e7reWNh+e6p++8nycpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveVNlcnZpY2UudXBkYXRlRGVwbG95KHRoaXMuY29uZmlnLmRlcGxveUlkLCByZXMuZGF0YS5yZXN1bHQpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCflt7Lmj5DkuqTvvIzmraPlnKjljYfnuqfvvIEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgndXBkYXRlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+WNh+e6p+Wksei0pe+8gScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgndXBkYXRlRmFpbGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgnZGlzbWlzcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LCAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5Yib5bu654mI5pys5aSx6LSl77yBJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2NyZWF0ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8g5YGc5q2iXHJcbiAgICAgICAgICAgIHN0b3AoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9kZXBsb3kvYWN0aW9uL3N0b3A/ZGVwbG95SWQ9JyArIHRoaXMuY29uZmlnLmRlcGxveUlkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhYm9ydCgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9kZXBsb3kvYWN0aW9uL2Fib3J0P2RlcGxveUlkPScgKyB0aGlzLmNvbmZpZy5kZXBsb3lJZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyDmianlrrkv57yp5a65XHJcbiAgICAgICAgICAgIHNjYWxlKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdzY2FsZU1vZGFsLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU2NhbGVNb2RhbEN0cicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZFJlcGxpY2FzOiAoKSA9PiB0aGlzLmNvbmZpZy5jdXJyZW50UmVwbGljYXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oKHJlcGxpY2FzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxpY2FzID0gcGFyc2VJbnQocmVwbGljYXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVwbGljYXMgPT09IHRoaXMuY29uZmlnLmN1cnJlbnRSZXBsaWNhcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+WunuS+i+S4quaVsOaXoOWPmOWMlu+8gScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVybCA9IHJlcGxpY2FzID4gdGhpcy5jb25maWcuY3VycmVudFJlcGxpY2FzID8gJ2FwaS9kZXBsb3kvYWN0aW9uL3NjYWxldXAnIDogJ2FwaS9kZXBsb3kvYWN0aW9uL3NjYWxlZG93bic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRodHRwLnBvc3QodXJsICsgJz9kZXBsb3lJZD0nICsgdGhpcy5jb25maWcuZGVwbG95SWQgKyAnJnJlcGxpY2FzPScgKyByZXBsaWNhcyArICcmdmVyc2lvbj0nICsgdGhpcy5jb25maWcuY3VycmVudFZlcnNpb25zWzBdLnZlcnNpb24pLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5pON5L2c5oiQ5Yqf77yBJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlcy5kYXRhLnJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfor7fmsYLlpLHotKXvvIEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgncmVxdWVzdEVycm9yJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdkaXNtaXNzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyDmgaLlpI1cclxuICAgICAgICAgICAgcmVjb3ZlclZlcnNpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdmVyc2lvbk1vZGFsSW5zID0gJG1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndmVyc2lvbkxpc3RNb2RhbC5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1ZlcnNpb25MaXN0TW9kYWxDdHInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiAnbWQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lJbmZvOiAoKSA9PiB0aGlzLmNvbmZpZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvbk1vZGFsSW5zLnJlc3VsdC50aGVuKChzdGFydEluZm8pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS5yb2xsYmFja0RlcGxveSh0aGlzLmNvbmZpZy5kZXBsb3lJZCwgc3RhcnRJbmZvLnZlcnNpb25JZCwgc3RhcnRJbmZvLnJlcGxpY2FzKS50aGVuKChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzLmRhdGEucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdkaXNtaXNzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyDljYfnuqdcclxuICAgICAgICAgICAgdXBkYXRlVmVyc2lvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB2ZXJzaW9uTW9kYWxJbnMgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd2ZXJzaW9uTGlzdE1vZGFsLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVmVyc2lvbkxpc3RNb2RhbEN0cicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUluZm86ICgpID0+IHRoaXMuY29uZmlnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uTW9kYWxJbnMucmVzdWx0LnRoZW4oKHN0YXJ0SW5mbykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudFZlcnNpb25JZCA9IHRoaXMuY29uZmlnLmN1cnJlbnRWZXJzaW9uc1swXS52ZXJzaW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFZlcnNpb25JZCA9PT0gc3RhcnRJbmZvLnZlcnNpb25JZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+aCqOS4jeiDvemAieaLqeW9k+WJjeeJiOacrO+8gScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdkaXNtaXNzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFZlcnNpb25JZCA+IHN0YXJ0SW5mby52ZXJzaW9uSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveVNlcnZpY2Uucm9sbGJhY2tEZXBsb3kodGhpcy5jb25maWcuZGVwbG95SWQsIHN0YXJ0SW5mby52ZXJzaW9uSWQsIHN0YXJ0SW5mby5yZXBsaWNhcykudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5bey5o+Q5Lqk77yM5q2j5Zyo5Zue5rua77yBJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXMuZGF0YS5yZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCflm57mu5rlpLHotKXvvIzor7fph43or5XvvIEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS51cGRhdGVEZXBsb3kodGhpcy5jb25maWcuZGVwbG95SWQsIHN0YXJ0SW5mby52ZXJzaW9uSWQsIHN0YXJ0SW5mby5yZXBsaWNhcykudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5bey5o+Q5Lqk77yM5q2j5Zyo5Y2H57qn77yBJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXMuZGF0YS5yZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+WNh+e6p+Wksei0pe+8jOivt+mHjeivle+8gScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnZGlzbWlzcycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8g5ZCv5YqoXHJcbiAgICAgICAgICAgIHN0YXJ0VmVyc2lvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB2ZXJzaW9uTW9kYWxJbnMgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd2ZXJzaW9uTGlzdE1vZGFsLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVmVyc2lvbkxpc3RNb2RhbEN0cicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUluZm86ICgpID0+IHRoaXMuY29uZmlnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uTW9kYWxJbnMucmVzdWx0LnRoZW4oKHN0YXJ0SW5mbykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLnN0YXJ0RGVwbG95KHRoaXMuY29uZmlnLmRlcGxveUlkLCBzdGFydEluZm8udmVyc2lvbklkLCBzdGFydEluZm8ucmVwbGljYXMpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXMuZGF0YS5yZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2Rpc21pc3MnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIOWIoOmZpFxyXG4gICAgICAgICAgICBkZWxldGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZSgnL2FwaS9kZXBsb3kvaWQvJyArIHRoaXMuY29uZmlnLmRlcGxveUlkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIOaWsOW7ulxyXG4gICAgICAgICAgICBjcmVhdGUoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG9iaiA9IHRoaXMuX2Zvcm1hcnREZXBsb3koKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVEZXBsb3koKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGh0dHAucG9zdCgnYXBpL2RlcGxveS9jcmVhdGUnLCBhbmd1bGFyLnRvSnNvbihvYmopKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjcmVhdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiByZXMuZGF0YS5yZXN1bHRNc2dcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNOZXdOYW1lc3BhY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZXNwYWNlID0gdGhpcy5jb25maWcubmFtZXNwYWNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lc3BhY2VBcnIgPSBbbmFtZXNwYWNlXTtcclxuICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5zZXROYW1lc3BhY2UodGhpcy5jbHVzdGVyTGlzdElucy5jbHVzdGVyLmlkLCBuYW1lc3BhY2VBcnIpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUlzTmV3TmFtZXNwYWNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmFtZXNwYWNlTGlzdC5wdXNoKG5hbWVzcGFjZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTmFtZXNwYWNlKG5hbWVzcGFjZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZURlcGxveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICduYW1lc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiByZXMuZGF0YS5yZXN1bHRNc2dcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZURlcGxveSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZ2V0RGVwbG95U3RyKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgbGV0IG9iaiA9IHRoaXMuX2Zvcm1hcnREZXBsb3koKTtcclxuICAgICAgICAgICAgICBvYmoucG9kU3BlY1N0ciA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChgYXBpL2RlcGxveS9kZXBsb3ltZW50c3RyYCwgYW5ndWxhci50b0pzb24ob2JqKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2xhc3MgRGVwbG95SW5zdGFuY2VMaXN0IHtcclxuICAgICAgICAgICAgY29uc3RydWN0b3IoaW5zdGFuY2VzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgLy8g5bey6YCJ5LitaW5zdGFuY2XmlbBcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XHJcbiAgICAgICAgICAgICAgICAvLyDlt7LpgInkuK1jb250YWluZXLmlbBcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb250YWluZXJDb3VudCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoaW5zdGFuY2VzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbml0KGluc3RhbmNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VMaXN0ID0gKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VzID0gaW5zdGFuY2VzIHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpbnN0YW5jZSBvZiBpbnN0YW5jZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmtleUZpbHRlciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UuY29udGFpbmVycykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNvbnRhaW5lciBvZiBpbnN0YW5jZS5jb250YWluZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zaG9ydENvbnRhaW5lcklkID0gY29udGFpbmVyLmNvbnRhaW5lcklkLnN1YnN0cmluZygwLCAxMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIOmAieaLqeWunuS+iy0tPuWIh+aNomNvbnRhaW5lckxpc3RcclxuICAgICAgICAgICAgdG9nZ2xlQ29udGFpbmVyTGlzdChpbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsQ29udGFpbmVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29udGFpbmVyQ291bnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJMaXN0ID0gaW5zdGFuY2UuY29udGFpbmVycyB8fCBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNvbnRhaW5lciBvZiB0aGlzLmNvbnRhaW5lckxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZpbHRlcldpdGhLZXkoa2V5d29yZHMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGluc3RhbmNlIG9mIHRoaXMuaW5zdGFuY2VMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmtleUZpbHRlciA9IGluc3RhbmNlLmluc3RhbmNlTmFtZS5pbmRleE9mKGtleXdvcmRzKSAhPT0gLTE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG9nZ2xlQ29udGFpbmVyQ2hlY2soY29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGlzQWxsSGFzQ2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyLmlzU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbnRhaW5lckNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaYr+WQpuS4uuWFqOmAiVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjb250YWluZXIgb2YgdGhpcy5jb250YWluZXJMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRhaW5lci5pc1NlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNBbGxIYXNDaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNBbGxIYXNDaGFuZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29udGFpbmVyQ291bnQtLTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsQ29udGFpbmVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8g5YWo6YCJL+WFqOS4jemAiVxyXG4gICAgICAgICAgICBjaGVja0FsbENvbnRhaW5lcihpc0NoZWNrQWxsQ29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsQ29udGFpbmVyID0gdHlwZW9mIGlzQ2hlY2tBbGxDb250YWluZXIgPT09ICd1bmRlZmluZWQnID8gIXRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA6IGlzQ2hlY2tBbGxDb250YWluZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbnRhaW5lckNvdW50ID0gdGhpcy5pc0NoZWNrQWxsQ29udGFpbmVyID8gdGhpcy5jb250YWluZXJMaXN0Lmxlbmd0aCA6IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY29udGFpbmVyIG9mIHRoaXMuY29udGFpbmVyTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuaXNTZWxlY3RlZCA9IHRoaXMuaXNDaGVja0FsbENvbnRhaW5lcjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyDliIfmjaLljZXkuKrlrp7kvovnmoTpgInkuK3nirbmgIFcclxuICAgICAgICAgICAgdG9nZ2xlQ2hlY2soaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaXNBbGxIYXNDaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5pc1NlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmmK/lkKbkuLrlhajpgIlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaW5zdGFuY2Ugb2YgdGhpcy5pbnN0YW5jZUxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5rZXlGaWx0ZXIgJiYgIWluc3RhbmNlLmlzU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0FsbEhhc0NoYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0FsbEhhc0NoYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudC0tO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyDlhajpgIkv5YWo5LiN6YCJXHJcbiAgICAgICAgICAgIGNoZWNrQWxsSW5zdGFuY2UoaXNDaGVja0FsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gdHlwZW9mIGlzQ2hlY2tBbGwgPT09ICd1bmRlZmluZWQnID8gdGhpcy5pc0NoZWNrQWxsIDogaXNDaGVja0FsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpbnN0YW5jZSBvZiB0aGlzLmluc3RhbmNlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5rZXlGaWx0ZXIgJiYgdGhpcy5pc0NoZWNrQWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmlzU2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5pc1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjbGFzcyBEZXBsb3lMaXN0IHtcclxuICAgICAgICAgICAgY29uc3RydWN0b3IoZGVwbG95TGlzdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXBsb3kgPSB7fTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95SW5zdGFuY2VMaXN0SW5zID0gbmV3IERlcGxveUluc3RhbmNlTGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KGRlcGxveUxpc3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluaXQoZGVwbG95TGlzdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0ID0gZGVwbG95TGlzdCB8fCBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0b2dnbGVEZXBsb3koZGVwbG95SWQsIGRlcGxveU5hbWUsIG5hbWVzcGFjZSwgbm90TmVlZEluc3RhbmNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkZXBsb3lJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveS5pZCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95Lm5hbWUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveS5uYW1lc3BhY2UgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUluc3RhbmNlTGlzdElucy5pbml0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95LmlkID0gZGVwbG95SWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95Lm5hbWUgPSBkZXBsb3lOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveS5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFub3ROZWVkSW5zdGFuY2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLmdldEluc3RhbmNlcyhkZXBsb3lJZCkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lJbnN0YW5jZUxpc3RJbnMuaW5pdChyZXMuZGF0YS5yZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIEBwYXJhbSBob3N0RW52OiAnVEVTVCcgb3IgJ1BST0QnXHJcbiAgICAgICAgICAgIGZpbHRlckRlcGxveShjbHVzdGVyTmFtZSwgaG9zdEVudikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRlcGxveUlkLCBkZXBsb3lOYW1lLCBuYW1lc3BhY2U7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBkZXBsb3kgb2YgdGhpcy5kZXBsb3lMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95LmNsdXN0ZXJGaWx0ZXIgPSBjbHVzdGVyTmFtZSA/IGRlcGxveS5jbHVzdGVyTmFtZSA9PT0gY2x1c3Rlck5hbWUgOiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlcGxveS5ob3N0RmlsdGVyID0gaG9zdEVudiA/IGRlcGxveS5ob3N0RW52ID09PSBob3N0RW52IDogdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDpgInkuK3nrKzkuIDkuKrnrKblkIjmnaHku7bnmoTpg6jnvbLlubbliIfmjaLliLDor6Xpg6jnvbJcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRlcGxveUlkID09PSAndW5kZWZpbmVkJyAmJiBkZXBsb3kuY2x1c3RlckZpbHRlciAmJiBkZXBsb3kuaG9zdEZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lJZCA9IGRlcGxveS5kZXBsb3lJZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95TmFtZSA9IGRlcGxveS5kZXBsb3lOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2UgPSBkZXBsb3kubmFtZXNwYWNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIGRlcGxveUlkID09PSAndW5kZWZpbmVkJyA/IHRoaXMudG9nZ2xlRGVwbG95KCkgOiB0aGlzLnRvZ2dsZURlcGxveShkZXBsb3lJZCwgZGVwbG95TmFtZSwgbmFtZXNwYWNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g6I635b6X5a6e5L6LXHJcbiAgICAgICAgY29uc3QgZ2V0SW5zdGFuY2UgPSAkZG9tZU1vZGVsLmluc3RhbmNlc0NyZWF0b3Ioe1xyXG4gICAgICAgICAgICBEZXBsb3lMaXN0OiBEZXBsb3lMaXN0LFxyXG4gICAgICAgICAgICBEZXBsb3k6IERlcGxveVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGRlcGxveVNlcnZpY2U6IGRlcGxveVNlcnZpY2UsXHJcbiAgICAgICAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBEZXBsb3lTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJywgJyRkb21lQ2x1c3RlcicsICckZG9tZUltYWdlJywgJyRkb21lUHVibGljJywgJyRkb21lTW9kZWwnLCAnJG1vZGFsJywgJyRxJywgJyR1dGlsJ107XHJcbiAgICBkZXBsb3lNb2R1bGUuZmFjdG9yeSgnJGRvbWVEZXBsb3knLCBEZXBsb3lTZXJ2aWNlKTtcclxuICAgIHdpbmRvdy5kZXBsb3lNb2R1bGUgPSBkZXBsb3lNb2R1bGU7XHJcbn0pKHdpbmRvdyk7XHJcbiJdfQ==
