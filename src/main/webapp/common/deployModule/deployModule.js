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
            this.modifyDeploy = function (deployId, deploymentDraft) {
                return $http.put(_url + '/id/' + deployId, angular.toJson(deploymentDraft));
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
                this.mountVolumeType = {
                    'HOSTPATH': '主机目录',
                    'EMPTYDIR': '实例内目录'
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

                    if (!deployConfig.deploymentType) {
                        deployConfig.deploymentType = 'REPLICATIONCONTROLLER';
                    }

                    if (!deployConfig.volumeDrafts) {
                        deployConfig.volumeDrafts = [];
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
                        if (this.versionList === null) {
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
                        if (typeof id !== 'undefined') {
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
                    // console.log(this.config.containerDrafts);
                    var _iteratorNormalCompletion6 = true;
                    var _didIteratorError6 = false;
                    var _iteratorError6 = undefined;

                    try {
                        for (var _iterator6 = this.config.containerDrafts[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            var image = _step6.value;

                            this.addLogDraft(image);
                            this.linkVolumeMountToVolume(image, this.config.volumeDrafts);
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
                key: 'changeVisitModeToValid',
                value: function changeVisitModeToValid() {
                    var validModes = [];
                    validModes.push('noAccess');
                    if (this.config.networkMode === 'HOST') validModes.push('access');
                    if (this.config.networkMode === 'DEFAULT') validModes.push('internal', 'foreign');
                    if (validModes.indexOf(this.visitMode) === -1) this.visitMode = validModes[0];
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
                key: 'toggleVolumeType',
                value: function toggleVolumeType(volume, type) {
                    volume.volumeType = type;
                }
            }, {
                key: 'deleteVolumeDraft',
                value: function deleteVolumeDraft(volume, images) {
                    var volumeDrafts = this.config.volumeDrafts;
                    var index = volumeDrafts.indexOf(volume);
                    volumeDrafts.splice(index, 1);
                    this.deleteVolumeMountDraftByVolume(volume, images);
                }
            }, {
                key: 'addVolumeDraft',
                value: function addVolumeDraft() {
                    this.config.volumeDrafts = this.config.volumeDrafts || [];
                    this.config.volumeDrafts.push({
                        name: '',
                        volumeType: 'HOSTPATH',
                        hostPath: '',
                        emptyDir: ''
                    });
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
                            }],
                            volumeMountDrafts: []
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
                key: 'linkVolumeMountToVolume',
                value: function linkVolumeMountToVolume(image, volumeDrafts) {
                    image.volumeMountDrafts = image.volumeMountDrafts || [];
                    image.volumeMountDrafts = image.volumeMountDrafts.filter(function (volumeMount) {
                        var volume = volumeDrafts.filter(function (volume) {
                            return volume.name === volumeMount.name;
                        })[0];
                        if (!volume) return;
                        volumeMount._volume = volume;
                        return true;
                    });
                }
            }, {
                key: 'addVolumeMountDraft',
                value: function addVolumeMountDraft(image) {
                    image.volumeMountDrafts = image.volumeMountDrafts || [];
                    image.volumeMountDrafts.push({
                        name: '',
                        readOnly: false,
                        mountPath: '',
                        subPath: '',
                        _volume: null
                    });
                }
            }, {
                key: 'deleteVolumeMountDraft',
                value: function deleteVolumeMountDraft(image, volumeMount) {
                    image.volumeMountDrafts = image.volumeMountDrafts || [];
                    image.volumeMountDrafts = image.volumeMountDrafts.filter(function (me) {
                        return me !== volumeMount;
                    });
                }
            }, {
                key: 'deleteVolumeMountDraftByVolume',
                value: function deleteVolumeMountDraftByVolume(volume, images) {
                    images.forEach(function (image) {
                        image.volumeMountDrafts = image.volumeMountDrafts || [];
                        image.volumeMountDrafts = image.volumeMountDrafts.filter(function (me) {
                            return me._volume !== volume;
                        });
                    });
                }
            }, {
                key: 'updateVolumeMountName',
                value: function updateVolumeMountName(volume, images) {
                    images.forEach(function (image) {
                        image.volumeMountDrafts = image.volumeMountDrafts || [];
                        image.volumeMountDrafts.forEach(function (me) {
                            if (me._volume === volume) me.name = volume.name;
                        });
                    });
                }
            }, {
                key: 'toggleVolumeMountReadonly',
                value: function toggleVolumeMountReadonly(volumeMount, isReadonly) {
                    volumeMount.readOnly = isReadonly;
                }
            }, {
                key: 'toggleVolumeMountName',
                value: function toggleVolumeMountName(volumeMounts, volume) {
                    volumeMounts.name = volume.name;
                    volumeMounts._volume = volume;
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

                                    var volumeMountDrafts = function (volumeMountDrafts) {
                                        return volumeMountDrafts.map(function (volumeMount) {
                                            return {
                                                name: volumeMount.name,
                                                readOnly: volumeMount.readOnly,
                                                mountPath: volumeMount.mountPath,
                                                subPath: volumeMount.subPath
                                            };
                                        }).filter(function (volumeMount) {
                                            return volumeMount.name;
                                        });
                                    }(containerDraft.volumeMountDrafts || []);

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
                                        autoDeploy: containerDraft.autoDeploy,
                                        volumeMountDrafts: volumeMountDrafts
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
                        podSpecStr: newConfig.podSpecStr,
                        volumeDrafts: newConfig.volumeDrafts
                    };
                    deployService.createVersion(versionObj).then(function (res) {
                        if (_this11.config.deploymentStatus != 'RUNNING') {
                            $domePublic.openPrompt('新建部署版本成功,当前状态不能升级。');
                            deferred.resolve('create');
                        } else {
                            // this template is in deployDetail.html
                            var createVersionModal = $modal.open({
                                animation: true,
                                templateUrl: 'createVersionModal.html',
                                controller: 'createVersionModalCtr',
                                size: 'sm',
                                resolve: {
                                    replicas: function replicas() {
                                        return _this11.config.currentReplicas;
                                    }
                                }
                            });
                            createVersionModal.result.then(function (replicas) {
                                deployService.updateDeploy(_this11.config.deployId, res.data.result, replicas).then(function () {
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
                // DaemonSet 的扩容缩容

            }, {
                key: 'scaleForDaemonSet',
                value: function scaleForDaemonSet() {
                    var _this12 = this;

                    var deferred = $q.defer();
                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: 'scaleModalForDaemonSet.html',
                        controller: 'scaleModalForDaemonSetCtr',
                        size: 'md',
                        resolve: {
                            deployIns: function deployIns() {
                                return _this12;
                            }
                        }
                    });
                    modalInstance.result.then(function (nodeList) {
                        var url = 'api/deploy/action/daemonset/scales?deployId=' + _this12.config.deployId + '&version=' + _this12.config.currentVersions[0].version;
                        $http.post(url, nodeList).then(function (res) {
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

                // 扩容/缩容

            }, {
                key: 'scale',
                value: function scale() {
                    var _this13 = this;

                    var deferred = $q.defer();
                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: 'scaleModal.html',
                        controller: 'ScaleModalCtr',
                        size: 'md',
                        resolve: {
                            oldReplicas: function oldReplicas() {
                                return _this13.config.currentReplicas;
                            }
                        }
                    });
                    modalInstance.result.then(function (replicas) {
                        replicas = parseInt(replicas);
                        if (replicas === _this13.config.currentReplicas) {
                            $domePublic.openWarning('实例个数无变化！');
                            deferred.reject();
                            return;
                        }
                        var url = replicas > _this13.config.currentReplicas ? 'api/deploy/action/scaleup' : 'api/deploy/action/scaledown';
                        $http.post(url + '?deployId=' + _this13.config.deployId + '&replicas=' + replicas + '&version=' + _this13.config.currentVersions[0].version).then(function (res) {
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
                        deployService.rollbackDeploy(_this14.config.deployId, startInfo.versionId, startInfo.replicas).then(function (res) {
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
                        var currentVersionId = _this15.config.currentVersions[0].version;
                        if (currentVersionId === startInfo.versionId) {
                            $domePublic.openWarning('您不能选择当前版本！');
                            deferred.reject('dismiss');
                        } else if (currentVersionId > startInfo.versionId) {
                            deployService.rollbackDeploy(_this15.config.deployId, startInfo.versionId, startInfo.replicas).then(function (res) {
                                $domePublic.openPrompt('已提交，正在回滚！');
                                deferred.resolve(res.data.result);
                            }, function () {
                                $domePublic.openWarning('回滚失败，请重试！');
                                deferred.reject();
                            });
                        } else {
                            deployService.updateDeploy(_this15.config.deployId, startInfo.versionId, startInfo.replicas).then(function (res) {
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
                    var _this16 = this;

                    var deferred = $q.defer();
                    var versionModalIns = $modal.open({
                        animation: true,
                        templateUrl: 'versionListModal.html',
                        controller: 'VersionListModalCtr',
                        size: 'md',
                        resolve: {
                            deployInfo: function deployInfo() {
                                return _this16.config;
                            }
                        }
                    });
                    versionModalIns.result.then(function (startInfo) {
                        deployService.startDeploy(_this16.config.deployId, startInfo.versionId, startInfo.replicas).then(function (res) {
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
            }, {
                key: 'modifyDeploy',
                value: function modifyDeploy() {
                    var obj = this._formartDeploy();
                    return deployService.modifyDeploy(this.config.deployId, obj);
                }
                // 新建

            }, {
                key: 'create',
                value: function create() {
                    var _this17 = this;

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
                        var namespace = this.config.namespace;
                        var namespaceArr = [namespace];
                        nodeService.setNamespace(this.clusterListIns.cluster.id, namespaceArr).then(function () {
                            _this17.toggleIsNewNamespace();
                            _this17.namespaceList.push(namespace);
                            _this17.toggleNamespace(namespace);
                            createDeploy();
                        }, function (res) {
                            deferred.reject({
                                type: 'namespace',
                                msg: res.data.resultMsg
                            });
                        });
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
                    var _this18 = this;

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
                                _this18.deployInstanceListIns.init(res.data.result);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9kZXBsb3lNb2R1bGUvZGVwbG95TW9kdWxlLmVzIl0sIm5hbWVzIjpbIndpbmRvdyIsInVuZGVmaW5lZCIsImRlcGxveU1vZHVsZSIsImFuZ3VsYXIiLCJtb2R1bGUiLCJEZXBsb3lTZXJ2aWNlIiwiJGh0dHAiLCIkZG9tZUNsdXN0ZXIiLCIkZG9tZUltYWdlIiwiJGRvbWVQdWJsaWMiLCIkZG9tZU1vZGVsIiwiJG1vZGFsIiwiJHEiLCIkdXRpbCIsIm5vZGVTZXJ2aWNlIiwiZ2V0SW5zdGFuY2UiLCJfdXJsIiwiX3ZlcnNpb25VcmwiLCJnZXRMaXN0IiwiZ2V0IiwiZ2V0TGlzdEJ5Q29sbGVjdGlvbklkIiwiY29sbGVjdGlvbklkIiwiZ2V0U2luZ2xlIiwiZGVwbG95SWQiLCJtb2RpZnlEZXBsb3kiLCJkZXBsb3ltZW50RHJhZnQiLCJwdXQiLCJ0b0pzb24iLCJnZXRFdmVudHMiLCJnZXRJbnN0YW5jZXMiLCJnZXRWZXJzaW9ucyIsImdldFNpbmdsZVZlcnNpb24iLCJ2ZXJzaW9uSWQiLCJjcmVhdGVWZXJzaW9uIiwidmVyc2lvbiIsInBvc3QiLCJyb2xsYmFja0RlcGxveSIsInJlcGxpY2FzIiwidXBkYXRlRGVwbG95Iiwic3RhcnREZXBsb3kiLCJkZXBsb3lTZXJ2aWNlIiwiRGVwbG95IiwiZGVwbG95Q29uZmlnIiwibmFtZXNwYWNlTGlzdCIsImlzTmV3TmFtZXNwYWNlIiwiaW1hZ2VMaXN0IiwiZW52TGlzdCIsInZhbHVlIiwidGV4dCIsInZhbGlkIiwiaXBzIiwibG9nQ29uZmlnIiwiZW52VGV4dCIsInZlcnNpb25MaXN0Iiwibm9kZUxpc3RJbnMiLCJub2RlTGlzdEZvcklwcyIsImNsdXN0ZXJMaXN0SW5zIiwibG9hZGluZ0lucyIsImdldExvYWRpbmdJbnN0YW5jZSIsImNyZWF0b3IiLCJpZCIsIm5hbWUiLCJ0eXBlIiwidmlzaXRNb2RlIiwiaG9zdEVudiIsImNvbmZpZyIsImRlZmF1bHRWZXJzaW9uU3RyaW5nIiwibW91bnRWb2x1bWVUeXBlIiwiaW5pdCIsImN1cnJlbnRWZXJzaW9ucyIsImNyZWF0ZVRpbWUiLCJpc09iamVjdCIsImRlcGxveW1lbnRUeXBlIiwidm9sdW1lRHJhZnRzIiwidmVyc2lvblR5cGUiLCJ2ZXJzaW9uU3RyaW5nIiwicG9kU3BlYyIsInBhZFNwZWMiLCJpc0FycmF5IiwibG9hZEJhbGFuY2VEcmFmdHMiLCJpbm5lclNlcnZpY2VEcmFmdHMiLCJsb2FkQmFsYW5jZURyYWZ0IiwiZXh0ZXJuYWxJUHMiLCJpcCIsInB1c2giLCJhZGRMb2FkQmFsYW5jZSIsImFkZElubmVyU2VydmljZSIsIm5ldHdvcmtNb2RlIiwiYWNjZXNzVHlwZSIsInRoZW4iLCJyZXMiLCJkYXRhIiwicmVzdWx0IiwibGVuZ3RoIiwidG9nZ2xlVmVyc2lvbiIsImkiLCJsIiwiaW5pdERhdGEiLCJjb250YWluZXJEcmFmdHMiLCJsYWJlbFNlbGVjdG9ycyIsImluaXRTZWxlY3RlZExhYmVscyIsInRvZ2dsZUVudiIsImVudiIsInN0YXRlZnVsIiwic3RhcnRMb2FkaW5nIiwiaW1hZ2VTZXJ2aWNlIiwiZ2V0UHJvamVjdEltYWdlcyIsImltYWdlIiwiZW52cyIsImVudlNldHRpbmdzIiwia2V5IiwiZGVzY3JpcHRpb24iLCJmb3JtYXJ0Q29udGFpbmVyRHJhZnRzIiwiZmluYWxseSIsImZpbmlzaExvYWRpbmciLCJhZGRMb2dEcmFmdCIsImxpbmtWb2x1bWVNb3VudFRvVm9sdW1lIiwiZ2V0RGF0YSIsInRvZ2dsZUNsdXN0ZXIiLCJuZXdDb25maWciLCJsYXN0VXBkYXRlVGltZSIsImRlcGxveW1lbnRTdGF0dXMiLCJjdXJyZW50UmVwbGljYXMiLCJpbmRleCIsImNsdXN0ZXJJZCIsImNsdXN0ZXJMaXN0IiwiY2x1c3RlciIsImdldE5vZGVMaXN0Iiwibm9kZUxpc3QiLCJjb3B5Iiwibm9kZSIsInN0YXR1cyIsImlzU2VsZWN0ZWQiLCJzcGxpY2UiLCJ0b2dnbGVOb2RlQ2hlY2siLCJnZXROYW1lc3BhY2UiLCJuYW1lc3BhY2UiLCJpbml0TGFiZWxzSW5mbyIsImxhYmVsU2VsZWN0b3IiLCJsYWJlbE5hbWUiLCJ0b2dnbGVMYWJlbCIsIiQiLCJleHRlbmQiLCJnZXRUYWciLCJjb250YWluZXJEcmFmdCIsImdldEltYWdlVGFncyIsInJlZ2lzdHJ5IiwidGFnTGlzdCIsIm9sZEVudiIsIm5ld0VudiIsImoiLCJsMSIsImltYWdlTmFtZSIsInciLCJsMiIsImlzT2xkRW52IiwiayIsImwzIiwidmFsaWRNb2RlcyIsImluZGV4T2YiLCJ1c2VyIiwidm9sdW1lIiwidm9sdW1lVHlwZSIsImltYWdlcyIsImRlbGV0ZVZvbHVtZU1vdW50RHJhZnRCeVZvbHVtZSIsImhvc3RQYXRoIiwiZW1wdHlEaXIiLCJ0YWciLCJ0YWdzIiwiY3B1IiwibWVtIiwiaGVhbHRoQ2hlY2tlciIsImltYWdlUHVsbFBvbGljeSIsImF1dG9EZXBsb3kiLCJsb2dJdGVtRHJhZnRzIiwibG9nUGF0aCIsImF1dG9Db2xsZWN0IiwiYXV0b0RlbGV0ZSIsInZvbHVtZU1vdW50RHJhZnRzIiwibW9kYWxJbnN0YW5jZSIsIm9wZW4iLCJhbmltYXRpb24iLCJ0ZW1wbGF0ZVVybCIsImNvbnRyb2xsZXIiLCJzaXplIiwiaW1hZ2VJbmZvIiwiY29udGFpbmVyRHJhZnRJbmRleCIsInBvcnQiLCJ0YXJnZXRQb3J0IiwibG9hZEJhbGFuY2VEcmFmdEluZGV4IiwiZmlsdGVyIiwidm9sdW1lTW91bnQiLCJfdm9sdW1lIiwicmVhZE9ubHkiLCJtb3VudFBhdGgiLCJzdWJQYXRoIiwibWUiLCJmb3JFYWNoIiwiaXNSZWFkb25seSIsInZvbHVtZU1vdW50cyIsImxvZ0RyYWZ0IiwiaXRlbSIsImV4cG9zZVBvcnROdW0iLCJnZXRGb3JtYXJ0U2VsZWN0ZWRMYWJlbHMiLCJob3N0TGlzdCIsImdldFNlbGVjdGVkTm9kZXMiLCJlbnZDb25mIiwidGltZW91dCIsImRlbGF5IiwidXJsIiwicHJlRm9ybWF0dGVkbG9nRHJhZnRzIiwibG9nSXRlbSIsImZvcm1hcnRMb2dJdGVtIiwibG9nVG9waWMiLCJwcm9jZXNzQ21kIiwibG9nRXhwaXJlZCIsIm1hcCIsInBvZFNwZWNTdHIiLCJkZWZlcnJlZCIsImRlZmVyIiwiX2Zvcm1hcnREZXBsb3kiLCJ2ZXJzaW9uT2JqIiwib3BlblByb21wdCIsInJlc29sdmUiLCJjcmVhdGVWZXJzaW9uTW9kYWwiLCJvcGVuV2FybmluZyIsInRpdGxlIiwibXNnIiwicmVzdWx0TXNnIiwicmVqZWN0IiwicHJvbWlzZSIsImRlcGxveUlucyIsIm9sZFJlcGxpY2FzIiwicGFyc2VJbnQiLCJ2ZXJzaW9uTW9kYWxJbnMiLCJkZXBsb3lJbmZvIiwic3RhcnRJbmZvIiwiY3VycmVudFZlcnNpb25JZCIsImRlbGV0ZSIsIm9iaiIsImNyZWF0ZURlcGxveSIsIm5hbWVzcGFjZUFyciIsInNldE5hbWVzcGFjZSIsInRvZ2dsZUlzTmV3TmFtZXNwYWNlIiwidG9nZ2xlTmFtZXNwYWNlIiwiY2FsbGJhY2siLCJEZXBsb3lJbnN0YW5jZUxpc3QiLCJpbnN0YW5jZXMiLCJpc0NoZWNrQWxsIiwiaXNDaGVja0FsbENvbnRhaW5lciIsImluc3RhbmNlTGlzdCIsImNvbnRhaW5lckxpc3QiLCJzZWxlY3RlZENvdW50Iiwic2VsZWN0ZWRDb250YWluZXJDb3VudCIsImluc3RhbmNlIiwia2V5RmlsdGVyIiwiY29udGFpbmVycyIsImNvbnRhaW5lciIsInNob3J0Q29udGFpbmVySWQiLCJjb250YWluZXJJZCIsInN1YnN0cmluZyIsImtleXdvcmRzIiwiaW5zdGFuY2VOYW1lIiwiaXNBbGxIYXNDaGFuZ2UiLCJEZXBsb3lMaXN0IiwiZGVwbG95TGlzdCIsImRlcGxveSIsImlzTG9hZGluZyIsImRlcGxveUluc3RhbmNlTGlzdElucyIsImRlcGxveU5hbWUiLCJub3ROZWVkSW5zdGFuY2VzIiwiY2x1c3Rlck5hbWUiLCJjbHVzdGVyRmlsdGVyIiwiaG9zdEZpbHRlciIsInRvZ2dsZURlcGxveSIsImluc3RhbmNlc0NyZWF0b3IiLCIkaW5qZWN0IiwiZmFjdG9yeSJdLCJtYXBwaW5ncyI6Ijs7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dkNELEVBZ3ZDR0YsTUFodkNIIiwiZmlsZSI6ImNvbW1vbi9kZXBsb3lNb2R1bGUvZGVwbG95TW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIEBhdXRob3IgIENoYW5kcmFMZWVcbiAqIEBkZXNjcmlwdGlvbiAg6YOo572y5qih5Z2XXG4gKi9cblxuKCh3aW5kb3csIHVuZGVmaW5lZCkgPT4ge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBsZXQgZGVwbG95TW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ2RlcGxveU1vZHVsZScsIFtdKTtcblxuICAgIGZ1bmN0aW9uIERlcGxveVNlcnZpY2UoJGh0dHAsICRkb21lQ2x1c3RlciwgJGRvbWVJbWFnZSwgJGRvbWVQdWJsaWMsICRkb21lTW9kZWwsICRtb2RhbCwgJHEsICR1dGlsKSB7XG4gICAgICAgIGNvbnN0IG5vZGVTZXJ2aWNlID0gJGRvbWVDbHVzdGVyLmdldEluc3RhbmNlKCdOb2RlU2VydmljZScpO1xuICAgICAgICBjb25zdCBEZXBsb3lTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3QgX3VybCA9ICcvYXBpL2RlcGxveSc7XG4gICAgICAgICAgICBjb25zdCBfdmVyc2lvblVybCA9ICcvYXBpL3ZlcnNpb24nO1xuICAgICAgICAgICAgdGhpcy5nZXRMaXN0ID0gKCkgPT4gJGh0dHAuZ2V0KGAke191cmx9L2xpc3RgKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0TGlzdEJ5Q29sbGVjdGlvbklkID0gKGNvbGxlY3Rpb25JZCkgPT4gJGh0dHAuZ2V0KGAke191cmx9L2xpc3QvJHtjb2xsZWN0aW9uSWR9YCk7XG4gICAgICAgICAgICB0aGlzLmdldFNpbmdsZSA9IChkZXBsb3lJZCkgPT4gJGh0dHAuZ2V0KGAke191cmx9L2lkLyR7ZGVwbG95SWR9YCk7XG4gICAgICAgICAgICB0aGlzLm1vZGlmeURlcGxveSA9IChkZXBsb3lJZCwgZGVwbG95bWVudERyYWZ0KSA9PiAkaHR0cC5wdXQoYCR7X3VybH0vaWQvJHtkZXBsb3lJZH1gLCBhbmd1bGFyLnRvSnNvbihkZXBsb3ltZW50RHJhZnQpKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXZlbnRzID0gKGRlcGxveUlkKSA9PiAkaHR0cC5nZXQoYCR7X3VybH0vZXZlbnQvbGlzdD9kZXBsb3lJZD0ke2RlcGxveUlkfWApO1xuICAgICAgICAgICAgdGhpcy5nZXRJbnN0YW5jZXMgPSAoZGVwbG95SWQpID0+ICRodHRwLmdldChgJHtfdXJsfS8ke2RlcGxveUlkfS9pbnN0YW5jZWApO1xuICAgICAgICAgICAgdGhpcy5nZXRWZXJzaW9ucyA9IChkZXBsb3lJZCkgPT4gJGh0dHAuZ2V0KGAke192ZXJzaW9uVXJsfS9saXN0P2RlcGxveUlkPSR7ZGVwbG95SWR9YCk7XG4gICAgICAgICAgICB0aGlzLmdldFNpbmdsZVZlcnNpb24gPSAoZGVwbG95SWQsIHZlcnNpb25JZCkgPT4gJGh0dHAuZ2V0KGAke192ZXJzaW9uVXJsfS9pZC8ke2RlcGxveUlkfS8ke3ZlcnNpb25JZH1gKTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVmVyc2lvbiA9ICh2ZXJzaW9uKSA9PiAkaHR0cC5wb3N0KGAke192ZXJzaW9uVXJsfS9jcmVhdGU/ZGVwbG95SWQ9JHt2ZXJzaW9uLmRlcGxveUlkfWAsIGFuZ3VsYXIudG9Kc29uKHZlcnNpb24pKTtcbiAgICAgICAgICAgIHRoaXMucm9sbGJhY2tEZXBsb3kgPSAoZGVwbG95SWQsIHZlcnNpb25JZCwgcmVwbGljYXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVwbGljYXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoYC9hcGkvZGVwbG95L2FjdGlvbi9yb2xsYmFjaz9kZXBsb3lJZD0ke2RlcGxveUlkfSZ2ZXJzaW9uPSR7dmVyc2lvbklkfSZyZXBsaWNhcz0ke3JlcGxpY2FzfWApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGAvYXBpL2RlcGxveS9hY3Rpb24vcm9sbGJhY2s/ZGVwbG95SWQ9JHtkZXBsb3lJZH0mdmVyc2lvbj0ke3ZlcnNpb25JZH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy51cGRhdGVEZXBsb3kgPSAoZGVwbG95SWQsIHZlcnNpb25JZCwgcmVwbGljYXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVwbGljYXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoYC9hcGkvZGVwbG95L2FjdGlvbi91cGRhdGU/ZGVwbG95SWQ9JHtkZXBsb3lJZH0mdmVyc2lvbj0ke3ZlcnNpb25JZH0mcmVwbGljYXM9JHtyZXBsaWNhc31gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChgL2FwaS9kZXBsb3kvYWN0aW9uL3VwZGF0ZT9kZXBsb3lJZD0ke2RlcGxveUlkfSZ2ZXJzaW9uPSR7dmVyc2lvbklkfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLnN0YXJ0RGVwbG95ID0gKGRlcGxveUlkLCB2ZXJzaW9uSWQsIHJlcGxpY2FzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlcGxpY2FzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGAvYXBpL2RlcGxveS9hY3Rpb24vc3RhcnQ/ZGVwbG95SWQ9JHtkZXBsb3lJZH0mdmVyc2lvbj0ke3ZlcnNpb25JZH0mcmVwbGljYXM9JHtyZXBsaWNhc31gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdChgL2FwaS9kZXBsb3kvYWN0aW9uL3N0YXJ0P2RlcGxveUlkPSR7ZGVwbG95SWR9JnZlcnNpb249JHt2ZXJzaW9uSWR9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBkZXBsb3lTZXJ2aWNlID0gbmV3IERlcGxveVNlcnZpY2UoKTtcblxuXG4gICAgICAgIGNsYXNzIERlcGxveSB7XG4gICAgICAgICAgICBjb25zdHJ1Y3RvcihkZXBsb3lDb25maWcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb25JZCA9ICcnO1xuICAgICAgICAgICAgICAgIHRoaXMubmFtZXNwYWNlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIC8vIOaYr+WQpuaYr+aWsOW7um5hbWVzcGFjZVxuICAgICAgICAgICAgICAgIHRoaXMuaXNOZXdOYW1lc3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnZMaXN0ID0gW3tcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdURVNUJyxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJ+a1i+ivleeOr+WigydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnUFJPRCcsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICfnlJ/kuqfnjq/looMnXG4gICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgLy8g6KGo5Y2V5LiN6IO95a6e546w55qE6aqM6K+BXG4gICAgICAgICAgICAgICAgdGhpcy52YWxpZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaXDoh7PlsJHloavkuIDkuKpcbiAgICAgICAgICAgICAgICAgICAgaXBzOiBmYWxzZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgLy8g5piv5ZCm5byA5ZCv5pel5b+X5pS26ZuGXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dDb25maWcgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuZW52VGV4dCA9ICfor7fpgInmi6npg6jnvbLnjq/looMnO1xuICAgICAgICAgICAgICAgIHRoaXMudmVyc2lvbkxpc3QgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RJbnMgPSAkZG9tZUNsdXN0ZXIuZ2V0SW5zdGFuY2UoJ05vZGVMaXN0Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdEZvcklwcyA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlckxpc3RJbnMgPSAkZG9tZUNsdXN0ZXIuZ2V0SW5zdGFuY2UoJ0NsdXN0ZXJMaXN0Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zID0gJGRvbWVQdWJsaWMuZ2V0TG9hZGluZ0luc3RhbmNlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdG9yID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogbnVsbFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy52aXNpdE1vZGUgPSAnbm9BY2Nlc3MnO1xuICAgICAgICAgICAgICAgIHRoaXMuaG9zdEVudiA9ICdURVNUJztcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMuZGVmYXVsdFZlcnNpb25TdHJpbmcgPSB7XG4gICAgICAgICAgICAgICAgICAnWUFNTCc6ICdjb250YWluZXJzOlxcbi0gaW1hZ2U6IFxcXCJwdWIuZG9tZW9zLm9yZy9yZWdpc3RyeToyLjNcXFwiXFxuICBuYW1lOiBcXFwidGVzdC1jb250YWluZXJcXFwiXFxuICB2b2x1bWVNb3VudHM6XFxuICAtIG1vdW50UGF0aDogXFxcIi90ZXN0LWhvc3RwYXRoXFxcIlxcbiAgICBuYW1lOiBcXFwidGVzdC12b2x1bWVcXFwiXFxudm9sdW1lczpcXG4tIGhvc3RQYXRoOlxcbiAgICBwYXRoOiBcXFwiL29wdC9zY3NcXFwiXFxuICBuYW1lOiBcXFwidGVzdC12b2x1bWVcXFwiXFxuJyxcbiAgICAgICAgICAgICAgICAgICdKU09OJzogJ3tcXG4gIFxcXCJjb250YWluZXJzXFxcIjogW3tcXG4gICAgXFxcImltYWdlXFxcIjogXFxcInB1Yi5kb21lb3Mub3JnL3JlZ2lzdHJ5OjIuM1xcXCIsXFxuICAgIFxcXCJuYW1lXFxcIjogXFxcInRlc3QtY29udGFpbmVyXFxcIixcXG4gICAgXFxcInZvbHVtZU1vdW50c1xcXCI6IFt7XFxuICAgICAgXFxcIm1vdW50UGF0aFxcXCI6IFxcXCIvdGVzdC1ob3N0cGF0aFxcXCIsXFxuICAgICAgXFxcIm5hbWVcXFwiOiBcXFwidGVzdC12b2x1bWVcXFwiXFxuICAgIH1dXFxuICB9XSxcXG4gIFxcXCJ2b2x1bWVzXFxcIjogW3tcXG4gICAgXFxcImhvc3RQYXRoXFxcIjoge1xcbiAgICAgIFxcXCJwYXRoXFxcIjogXFxcIi9vcHQvc2NzXFxcIlxcbiAgICB9LFxcbiAgICBcXFwibmFtZVxcXCI6IFxcXCJ0ZXN0LXZvbHVtZVxcXCJcXG4gIH1dXFxufVxcbicsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm1vdW50Vm9sdW1lVHlwZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ0hPU1RQQVRIJzogJ+S4u+acuuebruW9lScsXG4gICAgICAgICAgICAgICAgICAgICdFTVBUWURJUic6ICflrp7kvovlhoXnm67lvZUnLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KGRlcGxveUNvbmZpZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0KGRlcGxveUNvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudFZlcnNpb25zLCBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZVRpbWUgPSAtMTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KGRlcGxveUNvbmZpZykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkZXBsb3lDb25maWcuZGVwbG95bWVudFR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5kZXBsb3ltZW50VHlwZSA9ICdSRVBMSUNBVElPTkNPTlRST0xMRVInO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkZXBsb3lDb25maWcudm9sdW1lRHJhZnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcudm9sdW1lRHJhZnRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWRlcGxveUNvbmZpZy52ZXJzaW9uVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLnZlcnNpb25UeXBlID0gJ0NVU1RPTSc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlcGxveUNvbmZpZy52ZXJzaW9uVHlwZSA9PT0gJ1lBTUwnIHx8IGRlcGxveUNvbmZpZy52ZXJzaW9uVHlwZSA9PT0gJ0pTT04nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcudmVyc2lvblN0cmluZyA9IGRlcGxveUNvbmZpZy52ZXJzaW9uU3RyaW5nIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLnZlcnNpb25TdHJpbmcucG9kU3BlYyA9IGRlcGxveUNvbmZpZy52ZXJzaW9uU3RyaW5nLnBhZFNwZWMgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRlcGxveUNvbmZpZy5yZXBsaWNhcyAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5yZXBsaWNhcyA9IDM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8g5piv5ZCm5L2/55So6LSf6L295Z2H6KGhXG4gICAgICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheShkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL+WvueWGheacjeWKoVxuICAgICAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkoZGVwbG95Q29uZmlnLmlubmVyU2VydmljZURyYWZ0cykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkoZGVwbG95Q29uZmlnLmN1cnJlbnRWZXJzaW9ucykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5jdXJyZW50VmVyc2lvbnMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBsb2FkQmFsYW5jZURyYWZ0LmV4dGVybmFsSVBzOiBbJ2V4dGVybmFsSVAxJywnZXh0ZXJuYWxJUDInXSAtLT4gW3tpcDonZXh0ZXJuYWxJUDEnfSx7aXA6J2V4dGVybmFsSVAxJ30se2lwOicnfV1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbG9hZEJhbGFuY2VEcmFmdCBvZiBkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbG9hZEJhbGFuY2VEcmFmdC5leHRlcm5hbElQcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRCYWxhbmNlRHJhZnQuZXh0ZXJuYWxJUHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleHRlcm5hbElQcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaXAgb2YgbG9hZEJhbGFuY2VEcmFmdC5leHRlcm5hbElQcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVybmFsSVBzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpcDogaXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVybmFsSVBzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlwOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQmFsYW5jZURyYWZ0LmV4dGVybmFsSVBzID0gZXh0ZXJuYWxJUHM7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IGRlcGxveUNvbmZpZztcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZExvYWRCYWxhbmNlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkSW5uZXJTZXJ2aWNlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy/nvZHnu5zmqKHlvI9cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5uZXR3b3JrTW9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubmV0d29ya01vZGUgPSAnREVGQVVMVCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5hY2Nlc3NUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5hY2Nlc3NUeXBlID0gJ0s4U19TRVJWSUNFJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VmVyc2lvbnMgPSB0aGlzLmNvbmZpZy5jdXJyZW50VmVyc2lvbnM7XG4gICAgICAgICAgICAgICAgICAgIC8vIOaYr+WQpuaYr+aWsOW7umRlcGxveVxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuZGVwbG95SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnZlcnNpb25MaXN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS5nZXRWZXJzaW9ucyh0aGlzLmNvbmZpZy5kZXBsb3lJZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmVyc2lvbkxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50VmVyc2lvbnMubGVuZ3RoID09PSAwICYmICR1dGlsLmlzT2JqZWN0KHRoaXMudmVyc2lvbkxpc3RbMF0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZVZlcnNpb24odGhpcy52ZXJzaW9uTGlzdFswXS52ZXJzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBjdXJyZW50VmVyc2lvbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRWZXJzaW9uc1tpXS5jcmVhdGVUaW1lID4gY3JlYXRlVGltZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVUaW1lID0gY3VycmVudFZlcnNpb25zW2ldLmNyZWF0ZVRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gY3VycmVudFZlcnNpb25zW2ldLnZlcnNpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZVZlcnNpb24oaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXREYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZGVwbG95aW5mb+WSjHZlcnNpb25pbmZv6YeN5ZCI55qE5L+h5oGv5Zyo6L+Z6YeM5aSE55CG77yM5YiH5o2idmVyc2lvbuS5i+WQjumHjeaWsOiwg+eUqOi/m+ihjOWIneWni+WMllxuICAgICAgICAgICAgaW5pdERhdGEoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheSh0aGlzLmNvbmZpZy5sYWJlbFNlbGVjdG9ycykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubGFiZWxTZWxlY3RvcnMgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0U2VsZWN0ZWRMYWJlbHMoKTtcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb25maWcuaG9zdEVudikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUVudih0aGlzLmVudkxpc3RbMF0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGVudiBvZiB0aGlzLmVudkxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5ob3N0RW52ID09PSBlbnYudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUVudihlbnYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLnN0YXRlZnVsICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheSh0aGlzLmltYWdlTGlzdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ2RvY2tlckltYWdlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZUltYWdlLmltYWdlU2VydmljZS5nZXRQcm9qZWN0SW1hZ2VzKCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDmoLzlvI/ljJZpbWFnZeeahGVudlNldHRpbmdz5Li6Y29udGFpbmVyRHJhZnRz5qC85byPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaW1hZ2Ugb2YgaW1hZ2VMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlbnZzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZS5lbnZTZXR0aW5ncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgZW52IG9mIGltYWdlLmVudlNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBlbnYua2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZW52LnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZW52LmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuZW52U2V0dGluZ3MgPSBlbnZzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdCA9IGltYWdlTGlzdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDlpITnkIbpg6jnvbLlt7LmnInnmoTplZzlg49cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1hcnRDb250YWluZXJEcmFmdHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCdkb2NrZXJJbWFnZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1hcnRDb250YWluZXJEcmFmdHMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHMpO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGltYWdlIG9mIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZExvZ0RyYWZ0KGltYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saW5rVm9sdW1lTW91bnRUb1ZvbHVtZShpbWFnZSwgdGhpcy5jb25maWcudm9sdW1lRHJhZnRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRDb2xsZWN0aW9uSWQoY29sbGVjdGlvbklkKSB7XG4gICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbklkID0gY29sbGVjdGlvbklkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5pdENsdXN0ZXIoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ2NsdXN0ZXInKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVTZXJ2aWNlLmdldERhdGEoKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlckxpc3RJbnMuaW5pdChyZXMuZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVDbHVzdGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ2NsdXN0ZXInKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWIt+aWsOW9k+WJjURlcGxveeeKtuaAgVxuICAgICAgICAgICAgZnJlc2hEZXBsb3kobmV3Q29uZmlnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCR1dGlsLmlzT2JqZWN0KG5ld0NvbmZpZykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcubGFzdFVwZGF0ZVRpbWUgPSBuZXdDb25maWcubGFzdFVwZGF0ZVRpbWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRlcGxveW1lbnRTdGF0dXMgPSBuZXdDb25maWcuZGVwbG95bWVudFN0YXR1cztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY3VycmVudFZlcnNpb25zID0gbmV3Q29uZmlnLmN1cnJlbnRWZXJzaW9ucztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY3VycmVudFJlcGxpY2FzID0gbmV3Q29uZmlnLmN1cnJlbnRSZXBsaWNhcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmcmVzaFZlcnNpb25MaXN0KCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ3ZlcnNpb25MaXN0Jyk7XG4gICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS5nZXRWZXJzaW9ucyh0aGlzLmNvbmZpZy5kZXBsb3lJZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmVyc2lvbkxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCd2ZXJzaW9uTGlzdCcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlQ2x1c3RlcihpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2x1c3RlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2x1c3Rlckxpc3QgPSB0aGlzLmNsdXN0ZXJMaXN0SW5zLmNsdXN0ZXJMaXN0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2x1c3Rlckxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8g6YCJ5oup5b2T5YmNZGVwbG95L3ZlcnNpb27nmoRjbHVzdGVyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGNsdXN0ZXJMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbHVzdGVyTGlzdFtpXS5pZCA9PT0gdGhpcy5jb25maWcuY2x1c3RlcklkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c5b2T5YmNZGVwbG95L3ZlcnNpb27msqHmnIljbHVzdGVy77yM5YiZ6YCJ5oup56ys5LiA5LiqXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGluZGV4ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlckxpc3RJbnMudG9nZ2xlQ2x1c3RlcihpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nQ29uZmlnID0gY2x1c3Rlckxpc3RbaW5kZXhdLmxvZ0NvbmZpZztcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlcklkID0gdGhpcy5jbHVzdGVyTGlzdElucy5jbHVzdGVyLmlkO1xuICAgICAgICAgICAgICAgICAgICAvLyDph43nva7ml6Xlv5fkv6Hmga9cbiAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubG9nQ29uZmlnICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5sb2dEcmFmdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dJdGVtRHJhZnRzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dQYXRoOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbGxlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvRGVsZXRlOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnbm9kZWxpc3QnKTtcblxuICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5nZXROb2RlTGlzdChjbHVzdGVySWQpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5vZGVMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdEZvcklwcyA9IGFuZ3VsYXIuY29weShub2RlTGlzdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubm9kZUxpc3RGb3JJcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZSA9IHRoaXMubm9kZUxpc3RGb3JJcHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuc3RhdHVzID09ICdSZWFkeScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlwcyA9IHRoaXMuY29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzWzBdLmV4dGVybmFsSVBzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpcCBvZiBpcHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpcCA9PT0gbm9kZS5pcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaXNTZWxlY3RlZCA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RGb3JJcHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c5pivYXBwIHN0b3Jl55qE5Li75py65YiX6KGo77yM5YiZ6L+H5ruk5o6J5rKh5pyJZGlza1BhdGjnmoTkuLvmnLpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RJbnMuaW5pdChub2RlTGlzdCwgdGhpcy5jb25maWcuc3RhdGVmdWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0U2VsZWN0ZWRMYWJlbHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RJbnMudG9nZ2xlRW52KHRoaXMuY29uZmlnLmhvc3RFbnYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c5piv5pyJ54q25oCB5pyN5Yqh77yM6buY6K6k6YCJ5oup5ZKMcmVwbGljc+ebuOetieeahOS4u+acuuS4quaVsFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLnN0YXRlZnVsICYmIHRoaXMuY29uZmlnLnJlcGxpY2FzICYmIHRoaXMubm9kZUxpc3RJbnMubm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMubm9kZUxpc3RJbnMubm9kZUxpc3QubGVuZ3RoOyBpIDwgbCAmJiBpIDwgdGhpcy5jb25maWcucmVwbGljYXM7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0SW5zLm5vZGVMaXN0W2ldLmlzU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0SW5zLnRvZ2dsZU5vZGVDaGVjayh0aGlzLm5vZGVMaXN0SW5zLm5vZGVMaXN0W2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RJbnMuaW5pdCgpO1xuICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCdub2RlbGlzdCcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuZGVwbG95SWQgPT09IHZvaWQgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnbmFtZXNwYWNlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5nZXROYW1lc3BhY2UoY2x1c3RlcklkKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5hbWVzcGFjZUxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc05ld05hbWVzcGFjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLm5hbWVzcGFjZSA9IHRoaXMubmFtZXNwYWNlTGlzdFswXS5uYW1lIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLm5hbWVzcGFjZUxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm5hbWVzcGFjZUxpc3RbaV0ubmFtZSA9PSAnZGVmYXVsdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLm5hbWVzcGFjZSA9IHRoaXMubmFtZXNwYWNlTGlzdFtpXS5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc05ld05hbWVzcGFjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmFtZXNwYWNlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLm5hbWVzcGFjZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygnbmFtZXNwYWNlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDliJ3lp4vljJbpgInkuK3nmoRsYWJlbFxuICAgICAgICAgICAgaW5pdFNlbGVjdGVkTGFiZWxzKCkge1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RJbnMuaW5pdExhYmVsc0luZm8oKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlnLmxhYmVsU2VsZWN0b3JzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IGxhYmVsU2VsZWN0b3JzID0gdGhpcy5jb25maWcubGFiZWxTZWxlY3RvcnM7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbGFiZWxTZWxlY3RvciBvZiBsYWJlbFNlbGVjdG9ycykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGFiZWxOYW1lID0gbGFiZWxTZWxlY3Rvci5uYW1lO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFiZWxOYW1lICE9ICdrdWJlcm5ldGVzLmlvL2hvc3RuYW1lJyAmJiBsYWJlbE5hbWUgIT0gJ1RFU1RFTlYnICYmIGxhYmVsTmFtZSAhPSAnUFJPREVOVicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RJbnMudG9nZ2xlTGFiZWwobGFiZWxOYW1lLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbGlkSXBzKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpdE1vZGUgPT09ICdmb3JlaWduJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLm5vZGVMaXN0Rm9ySXBzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkLmlwcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkLmlwcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZC5pcHMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWIh+aNouW9k+WJjeWxleekuueahHZlcnNpb25cbiAgICAgICAgICAgIHRvZ2dsZVZlcnNpb24odmVyc2lvbklkKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlcGxveVNlcnZpY2UuZ2V0U2luZ2xlVmVyc2lvbih0aGlzLmNvbmZpZy5kZXBsb3lJZCwgdmVyc2lvbklkKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkdXRpbC5pc09iamVjdChyZXMuZGF0YS5yZXN1bHQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5leHRlbmQodGhpcy5jb25maWcsIHJlcy5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0RGF0YSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gY29udGFpbmVyRHJhZnRz77ya5paw5aKeY29udGFpbmVyRHJhZnTnmoRvbGRFbnbvvIxuZXdFbnbvvIx0YWdMaXN05bGe5oCnXG4gICAgICAgICAgICBmb3JtYXJ0Q29udGFpbmVyRHJhZnRzKCkge1xuICAgICAgICAgICAgICAgIGxldCBjb250YWluZXJEcmFmdHMgPSB0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHM7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBnZXRUYWcgPSAoY29udGFpbmVyRHJhZnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygndGFnJyk7XG4gICAgICAgICAgICAgICAgICAgICRkb21lSW1hZ2UuaW1hZ2VTZXJ2aWNlLmdldEltYWdlVGFncyhjb250YWluZXJEcmFmdC5pbWFnZSwgY29udGFpbmVyRHJhZnQucmVnaXN0cnkpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnQudGFnTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygndGFnJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBjb250YWluZXJEcmFmdHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0c1tpXS5vbGRFbnYgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnRzW2ldLm5ld0VudiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAvLyDojrflvpfor6XplZzlg4/niYjmnKxcbiAgICAgICAgICAgICAgICAgICAgZ2V0VGFnKGNvbnRhaW5lckRyYWZ0c1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBvbGRFbnYgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgLy8g6I635b6X6ZWc5YOP5Y6f5pys55qEZW52U2V0dGluZ3NcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDAsIGwxID0gdGhpcy5pbWFnZUxpc3QubGVuZ3RoOyBqIDwgbDE7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VMaXN0W2pdLmltYWdlTmFtZSA9PT0gY29udGFpbmVyRHJhZnRzW2ldLmltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkRW52ID0gdGhpcy5pbWFnZUxpc3Rbal0uZW52U2V0dGluZ3M7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8g5YiG56a76ZWc5YOP5pys6Lqr55qEaW1hZ2XlkozmlrDmt7vliqDnmoRpbWFnZeeahGVudlxuICAgICAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyRHJhZnRzW2ldLmVudnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHcgPSAwLCBsMiA9IGNvbnRhaW5lckRyYWZ0c1tpXS5lbnZzLmxlbmd0aDsgdyA8IGwyOyB3KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXNPbGRFbnYgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrID0gMCwgbDMgPSBvbGRFbnYubGVuZ3RoOyBrIDwgbDM7IGsrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob2xkRW52W2tdLmtleSA9PT0gY29udGFpbmVyRHJhZnRzW2ldLmVudnNbd10ua2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc09sZEVudiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNPbGRFbnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnRzW2ldLm9sZEVudi5wdXNoKGNvbnRhaW5lckRyYWZ0c1tpXS5lbnZzW3ddKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdHNbaV0ubmV3RW52LnB1c2goY29udGFpbmVyRHJhZnRzW2ldLmVudnNbd10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0c1tpXS5vbGRFbnYgPSBhbmd1bGFyLmNvcHkob2xkRW52KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoYW5nZVZpc2l0TW9kZVRvVmFsaWQoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHZhbGlkTW9kZXMgPSBbXTtcbiAgICAgICAgICAgICAgICB2YWxpZE1vZGVzLnB1c2goJ25vQWNjZXNzJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLm5ldHdvcmtNb2RlID09PSAnSE9TVCcpIHZhbGlkTW9kZXMucHVzaCgnYWNjZXNzJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLm5ldHdvcmtNb2RlID09PSAnREVGQVVMVCcpIHZhbGlkTW9kZXMucHVzaCgnaW50ZXJuYWwnLCAnZm9yZWlnbicpO1xuICAgICAgICAgICAgICAgIGlmICh2YWxpZE1vZGVzLmluZGV4T2YodGhpcy52aXNpdE1vZGUpID09PSAtMSkgdGhpcy52aXNpdE1vZGUgPSB2YWxpZE1vZGVzWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlTmFtZXNwYWNlKG5hbWVzcGFjZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZUlzTmV3TmFtZXNwYWNlKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNOZXdOYW1lc3BhY2UgPSAhdGhpcy5pc05ld05hbWVzcGFjZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5uYW1lc3BhY2UgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlRW52KGVudikge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmhvc3RFbnYgPSBlbnYudmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnZUZXh0ID0gZW52LnRleHQ7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdElucy50b2dnbGVFbnYoZW52LnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZUNyZWF0b3IodXNlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRvciA9IHVzZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b2dnbGVWb2x1bWVUeXBlKHZvbHVtZSwgdHlwZSkge1xuICAgICAgICAgICAgICAgIHZvbHVtZS52b2x1bWVUeXBlID0gdHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZVZvbHVtZURyYWZ0KHZvbHVtZSwgaW1hZ2VzKSB7XG4gICAgICAgICAgICAgICAgbGV0IHZvbHVtZURyYWZ0cyA9IHRoaXMuY29uZmlnLnZvbHVtZURyYWZ0cztcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSB2b2x1bWVEcmFmdHMuaW5kZXhPZih2b2x1bWUpO1xuICAgICAgICAgICAgICAgIHZvbHVtZURyYWZ0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlVm9sdW1lTW91bnREcmFmdEJ5Vm9sdW1lKHZvbHVtZSwgaW1hZ2VzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZFZvbHVtZURyYWZ0KCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnZvbHVtZURyYWZ0cyA9IHRoaXMuY29uZmlnLnZvbHVtZURyYWZ0cyB8fCBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy52b2x1bWVEcmFmdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICB2b2x1bWVUeXBlOiAnSE9TVFBBVEgnLFxuICAgICAgICAgICAgICAgICAgICBob3N0UGF0aDogJycsXG4gICAgICAgICAgICAgICAgICAgIGVtcHR5RGlyOiAnJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZUltYWdlVGFnKGluZGV4LCB0YWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzW2luZGV4XS50YWcgPSB0YWc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOa3u+WKoGNvbnRhaW5lckRyYWZ0XG4gICAgICAgICAgICBhZGRJbWFnZShpbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdhZGRJbWFnZScpO1xuICAgICAgICAgICAgICAgICAgICAkZG9tZUltYWdlLmltYWdlU2VydmljZS5nZXRJbWFnZVRhZ3MoaW1hZ2UuaW1hZ2VOYW1lLCBpbWFnZS5yZWdpc3RyeSkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFncyA9IHJlcy5kYXRhLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogaW1hZ2UuaW1hZ2VOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJ5OiBpbWFnZS5yZWdpc3RyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcHU6IDAuNSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW06IDEwMjQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiB0YWdzICYmIHRhZ3NbMF0gPyB0YWdzWzBdLnRhZyA6IHZvaWQgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWdMaXN0OiB0YWdzIHx8IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZEVudjogaW1hZ2UuZW52U2V0dGluZ3MgfHwgW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RW52OiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFsdGhDaGVja2VyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdOT05FJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VQdWxsUG9saWN5OiAnQWx3YXlzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvRGVwbG95OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dJdGVtRHJhZnRzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ1BhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db2xsZWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvRGVsZXRlOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvbHVtZU1vdW50RHJhZnRzOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ2FkZEltYWdlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDmt7vliqDlhbbku5bplZzlg49cbiAgICAgICAgICAgIGFkZE90aGVySW1hZ2UoKSB7XG4gICAgICAgICAgICAgICAgbGV0IG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvaW5kZXgvdHBsL21vZGFsL290aGVySW1hZ2VNb2RhbC9vdGhlckltYWdlTW9kYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdPdGhlckltYWdlTW9kYWxDdHInLFxuICAgICAgICAgICAgICAgICAgICBzaXplOiAnbWQnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbigoaW1hZ2VJbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiBpbWFnZUluZm8ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJ5OiBpbWFnZUluZm8ucmVnaXN0cnksXG4gICAgICAgICAgICAgICAgICAgICAgICBjcHU6IDAuNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbTogMTAyNCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZzogaW1hZ2VJbmZvLnRhZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ0xpc3Q6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiBpbWFnZUluZm8udGFnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9sZEVudjogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdFbnY6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdOT05FJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlUHVsbFBvbGljeTogJ0Fsd2F5cycsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvRGVwbG95OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ0l0ZW1EcmFmdHM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nUGF0aDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbGxlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9EZWxldGU6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZUltYWdlKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29udGFpbmVyRHJhZnRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGRJbWFnZUVudihpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckRyYWZ0c1tpbmRleF0ubmV3RW52LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICcnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlSW1hZ2VFbnYoY29udGFpbmVyRHJhZnRJbmRleCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHNbY29udGFpbmVyRHJhZnRJbmRleF0ubmV3RW52LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGRMb2FkQmFsYW5jZSgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgcG9ydDogJycsXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFBvcnQ6ICcnLFxuICAgICAgICAgICAgICAgICAgICBleHRlcm5hbElQczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGlwOiAnJ1xuICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkSW5uZXJTZXJ2aWNlKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmlubmVyU2VydmljZURyYWZ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgcG9ydDogJycsXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFBvcnQ6ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGRFeHRlcm5hbElQcyhpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzW2luZGV4XS5leHRlcm5hbElQcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaXA6ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVFeHRlcm5hbElQcyhsb2FkQmFsYW5jZURyYWZ0SW5kZXgsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcubG9hZEJhbGFuY2VEcmFmdHNbbG9hZEJhbGFuY2VEcmFmdEluZGV4XS5leHRlcm5hbElQcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkTG9nRHJhZnQoaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBpbWFnZS5sb2dJdGVtRHJhZnRzID0gaW1hZ2UubG9nSXRlbURyYWZ0cyB8fCBbXTtcbiAgICAgICAgICAgICAgICBpbWFnZS5sb2dJdGVtRHJhZnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBsb2dQYXRoOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbGxlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBhdXRvRGVsZXRlOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGlua1ZvbHVtZU1vdW50VG9Wb2x1bWUoaW1hZ2UsIHZvbHVtZURyYWZ0cykge1xuICAgICAgICAgICAgICAgIGltYWdlLnZvbHVtZU1vdW50RHJhZnRzID0gaW1hZ2Uudm9sdW1lTW91bnREcmFmdHMgfHwgW107XG4gICAgICAgICAgICAgICAgaW1hZ2Uudm9sdW1lTW91bnREcmFmdHMgPSBpbWFnZS52b2x1bWVNb3VudERyYWZ0cy5maWx0ZXIoKHZvbHVtZU1vdW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2b2x1bWUgPSB2b2x1bWVEcmFmdHMuZmlsdGVyKHZvbHVtZSA9PiB2b2x1bWUubmFtZSA9PT0gdm9sdW1lTW91bnQubmFtZSlbMF07XG4gICAgICAgICAgICAgICAgICAgIGlmICghdm9sdW1lKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIHZvbHVtZU1vdW50Ll92b2x1bWUgPSB2b2x1bWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkVm9sdW1lTW91bnREcmFmdChpbWFnZSkge1xuICAgICAgICAgICAgICAgIGltYWdlLnZvbHVtZU1vdW50RHJhZnRzID0gaW1hZ2Uudm9sdW1lTW91bnREcmFmdHMgfHwgW107XG4gICAgICAgICAgICAgICAgaW1hZ2Uudm9sdW1lTW91bnREcmFmdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICByZWFkT25seTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1vdW50UGF0aDogJycsXG4gICAgICAgICAgICAgICAgICAgIHN1YlBhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICBfdm9sdW1lOiBudWxsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVWb2x1bWVNb3VudERyYWZ0KGltYWdlLCB2b2x1bWVNb3VudCkge1xuICAgICAgICAgICAgICAgIGltYWdlLnZvbHVtZU1vdW50RHJhZnRzID0gaW1hZ2Uudm9sdW1lTW91bnREcmFmdHMgfHwgW107XG4gICAgICAgICAgICAgICAgaW1hZ2Uudm9sdW1lTW91bnREcmFmdHMgPSBpbWFnZS52b2x1bWVNb3VudERyYWZ0cy5maWx0ZXIoZnVuY3Rpb24gKG1lKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbWUgIT09IHZvbHVtZU1vdW50O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlVm9sdW1lTW91bnREcmFmdEJ5Vm9sdW1lKHZvbHVtZSwgaW1hZ2VzKSB7XG4gICAgICAgICAgICAgICAgaW1hZ2VzLmZvckVhY2goaW1hZ2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZS52b2x1bWVNb3VudERyYWZ0cyA9IGltYWdlLnZvbHVtZU1vdW50RHJhZnRzIHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICBpbWFnZS52b2x1bWVNb3VudERyYWZ0cyA9IGltYWdlLnZvbHVtZU1vdW50RHJhZnRzLmZpbHRlcihmdW5jdGlvbiAobWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWUuX3ZvbHVtZSAhPT0gdm9sdW1lO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVwZGF0ZVZvbHVtZU1vdW50TmFtZSh2b2x1bWUsIGltYWdlcykge1xuICAgICAgICAgICAgICAgIGltYWdlcy5mb3JFYWNoKGltYWdlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2Uudm9sdW1lTW91bnREcmFmdHMgPSBpbWFnZS52b2x1bWVNb3VudERyYWZ0cyB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2Uudm9sdW1lTW91bnREcmFmdHMuZm9yRWFjaChmdW5jdGlvbiAobWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAobWUuX3ZvbHVtZSA9PT0gdm9sdW1lKSBtZS5uYW1lID0gdm9sdW1lLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlVm9sdW1lTW91bnRSZWFkb25seSh2b2x1bWVNb3VudCwgaXNSZWFkb25seSkge1xuICAgICAgICAgICAgICAgIHZvbHVtZU1vdW50LnJlYWRPbmx5ID0gaXNSZWFkb25seTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZVZvbHVtZU1vdW50TmFtZSh2b2x1bWVNb3VudHMsIHZvbHVtZSkge1xuICAgICAgICAgICAgICAgIHZvbHVtZU1vdW50cy5uYW1lID0gdm9sdW1lLm5hbWU7XG4gICAgICAgICAgICAgICAgdm9sdW1lTW91bnRzLl92b2x1bWUgPSB2b2x1bWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVMb2dEcmFmdChpbWFnZSwgbG9nRHJhZnQpIHtcbiAgICAgICAgICAgICAgICBpbWFnZS5sb2dJdGVtRHJhZnRzLnNwbGljZShpbWFnZS5sb2dJdGVtRHJhZnRzLmluZGV4T2YobG9nRHJhZnQpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZUFyckl0ZW0oaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ1tpdGVtXS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9ybWFydEhlYWx0aENoZWNrZXIoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLm5ldHdvcmtNb2RlID09ICdIT1NUJykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjb250YWluZXJEcmFmdCBvZiB0aGlzLmNvbmZpZy5jb250YWluZXJEcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ05PTkUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hhbmdlTmV0d29ya21vZGUoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLm5ldHdvcmtNb2RlID09ICdIT1NUJykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBsb2FkQmFsYW5jZURyYWZ0IG9mIHRoaXMuY29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkQmFsYW5jZURyYWZ0LnBvcnQgPSBsb2FkQmFsYW5jZURyYWZ0LnRhcmdldFBvcnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFuZ2VUYXJnZXRQb3J0KGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzW2luZGV4XS5wb3J0ID0gdGhpcy5jb25maWcubG9hZEJhbGFuY2VEcmFmdHNbaW5kZXhdLnRhcmdldFBvcnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWwhuaVsOaNrue7k+aehOi9rOaNouS4uuS4juWQjuWPsOS6pOS6kueahOaVsOaNruagvOW8j1xuICAgICAgICAgICAgX2Zvcm1hcnREZXBsb3koKSB7XG4gICAgICAgICAgICAgICAgbGV0IGRlcGxveUNvbmZpZyA9IGFuZ3VsYXIuY29weSh0aGlzLmNvbmZpZyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVwbG95Q29uZmlnLm5ldHdvcmtNb2RlID09ICdIT1NUJykge1xuICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmFjY2Vzc1R5cGUgPSAnRElZJztcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmlubmVyU2VydmljZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpdE1vZGUgPT0gJ25vQWNjZXNzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmV4cG9zZVBvcnROdW0gPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmV4cG9zZVBvcnROdW0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpdE1vZGUgPT0gJ25vQWNjZXNzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmFjY2Vzc1R5cGUgPSAnRElZJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmlubmVyU2VydmljZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudmlzaXRNb2RlID09ICdpbnRlcm5hbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5hY2Nlc3NUeXBlID0gJ0s4U19TRVJWSUNFJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHNbMF0udGFyZ2V0UG9ydCA9IGRlcGxveUNvbmZpZy5pbm5lclNlcnZpY2VEcmFmdHNbMF0ucG9ydDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5sb2FkQmFsYW5jZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmFjY2Vzc1R5cGUgPSAnSzhTX1NFUlZJQ0UnO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmlubmVyU2VydmljZURyYWZ0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmxvYWRCYWxhbmNlRHJhZnRzID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGlwcyA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZEJhbGFuY2VEcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLm5vZGVMaXN0Rm9ySXBzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXBzLnB1c2gobm9kZS5pcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbG9hZEJhbGFuY2VEcmFmdCBvZiBkZXBsb3lDb25maWcubG9hZEJhbGFuY2VEcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2FkQmFsYW5jZURyYWZ0LnBvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkQmFsYW5jZURyYWZ0LmV4dGVybmFsSVBzID0gaXBzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRCYWxhbmNlRHJhZnRzLnB1c2gobG9hZEJhbGFuY2VEcmFmdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRCYWxhbmNlRHJhZnRzO1xuICAgICAgICAgICAgICAgIH0pKCk7XG5cblxuICAgICAgICAgICAgICAgIGlmICghZGVwbG95Q29uZmlnLnN0YXRlZnVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5sYWJlbFNlbGVjdG9ycyA9IHRoaXMubm9kZUxpc3RJbnMuZ2V0Rm9ybWFydFNlbGVjdGVkTGFiZWxzKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmhvc3RMaXN0ID0gdGhpcy5ub2RlTGlzdElucy5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmNsdXN0ZXJJZCA9IHRoaXMuY2x1c3Rlckxpc3RJbnMuY2x1c3Rlci5pZDtcblxuICAgICAgICAgICAgICAgIGRlcGxveUNvbmZpZy5jb2xsZWN0aW9uSWQgPSB0aGlzLmNvbGxlY3Rpb25JZDtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNyZWF0b3IuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKDApIGRlcGxveUNvbmZpZy5jcmVhdG9yID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRvcklkOiB0aGlzLmNyZWF0b3IuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdG9yTmFtZTogdGhpcy5jcmVhdG9yLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdG9yVHlwZTogdGhpcy5jcmVhdG9yLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95Q29uZmlnLmNyZWF0b3JJZCA9IHRoaXMuY3JlYXRvci5pZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoZGVwbG95Q29uZmlnLnZlcnNpb25UeXBlID09PSAnQ1VTVE9NJykge1xuICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcuY29udGFpbmVyRHJhZnRzID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXBsb3lDb25maWcuc3RhdGVmdWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVwbG95Q29uZmlnLmNvbnRhaW5lckRyYWZ0cztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkZXBsb3lDb25maWcuY29udGFpbmVyRHJhZnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVudkNvbmYsIGNvbnRhaW5lckRyYWZ0cyA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNvbnRhaW5lckRyYWZ0IG9mIGRlcGxveUNvbmZpZy5jb250YWluZXJEcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZDb25mID0gY29udGFpbmVyRHJhZnQub2xkRW52O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY29udGFpbmVyRHJhZnQuaGVhbHRoQ2hlY2tlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJEcmFmdC5oZWFsdGhDaGVja2VyID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ05PTkUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIudHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVwbG95Q29uZmlnLm5ldHdvcmtNb2RlICE9ICdIT1NUJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGVhbHRoQ2hlY2tlci50eXBlID09ICdUQ1AnIHx8IGhlYWx0aENoZWNrZXIudHlwZSA9PSAnSFRUUCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXIucG9ydCA9IGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIucG9ydDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXIudGltZW91dCA9IGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIudGltZW91dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXIuZGVsYXkgPSBjb250YWluZXJEcmFmdC5oZWFsdGhDaGVja2VyLmRlbGF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoZWFsdGhDaGVja2VyLnR5cGUgPT0gJ0hUVFAnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFsdGhDaGVja2VyLnVybCA9IGNvbnRhaW5lckRyYWZ0LmhlYWx0aENoZWNrZXIudXJsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhbHRoQ2hlY2tlci50eXBlID0gJ05PTkUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGVudiBvZiBjb250YWluZXJEcmFmdC5uZXdFbnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVudi5rZXkgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZDb25mLnB1c2goZW52KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb2dJdGVtRHJhZnRzID0gKChwcmVGb3JtYXR0ZWRsb2dEcmFmdHMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvZ0l0ZW1EcmFmdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbG9nSXRlbSBvZiBwcmVGb3JtYXR0ZWRsb2dEcmFmdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2dJdGVtLmxvZ1BhdGggIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZvcm1hcnRMb2dJdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dQYXRoOiBsb2dJdGVtLmxvZ1BhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db2xsZWN0OiBsb2dJdGVtLmF1dG9Db2xsZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvRGVsZXRlOiBsb2dJdGVtLmF1dG9EZWxldGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2dJdGVtLmF1dG9Db2xsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hcnRMb2dJdGVtLmxvZ1RvcGljID0gbG9nSXRlbS5sb2dUb3BpYztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWFydExvZ0l0ZW0ucHJvY2Vzc0NtZCA9IGxvZ0l0ZW0ucHJvY2Vzc0NtZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvZ0l0ZW0uYXV0b0RlbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0TG9nSXRlbS5sb2dFeHBpcmVkID0gbG9nSXRlbS5sb2dFeHBpcmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dJdGVtRHJhZnRzLnB1c2goZm9ybWFydExvZ0l0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2dJdGVtRHJhZnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9nSXRlbURyYWZ0cztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKGNvbnRhaW5lckRyYWZ0LmxvZ0l0ZW1EcmFmdHMpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHZvbHVtZU1vdW50RHJhZnRzID0gKCgodm9sdW1lTW91bnREcmFmdHMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZvbHVtZU1vdW50RHJhZnRzLm1hcCh2b2x1bWVNb3VudCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHZvbHVtZU1vdW50Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZE9ubHk6IHZvbHVtZU1vdW50LnJlYWRPbmx5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdW50UGF0aDogdm9sdW1lTW91bnQubW91bnRQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YlBhdGg6IHZvbHVtZU1vdW50LnN1YlBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5maWx0ZXIodm9sdW1lTW91bnQgPT4gdm9sdW1lTW91bnQubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkoY29udGFpbmVyRHJhZnQudm9sdW1lTW91bnREcmFmdHMgfHwgW10pKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckRyYWZ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IGNvbnRhaW5lckRyYWZ0LmltYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpc3RyeTogY29udGFpbmVyRHJhZnQucmVnaXN0cnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZzogY29udGFpbmVyRHJhZnQudGFnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcHU6IGNvbnRhaW5lckRyYWZ0LmNwdSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtOiBjb250YWluZXJEcmFmdC5tZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ0l0ZW1EcmFmdHM6IGxvZ0l0ZW1EcmFmdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudnM6IGVudkNvbmYsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWx0aENoZWNrZXI6IGhlYWx0aENoZWNrZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlUHVsbFBvbGljeTogY29udGFpbmVyRHJhZnQuaW1hZ2VQdWxsUG9saWN5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvRGVwbG95OiBjb250YWluZXJEcmFmdC5hdXRvRGVwbG95LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2x1bWVNb3VudERyYWZ0czogdm9sdW1lTW91bnREcmFmdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udGFpbmVyRHJhZnRzO1xuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVwbG95Q29uZmlnLnZlcnNpb25UeXBlID09PSAnSlNPTicgfHwgZGVwbG95Q29uZmlnLnZlcnNpb25UeXBlID09PSAnWUFNTCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlcGxveUNvbmZpZy52ZXJzaW9uU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lDb25maWcucG9kU3BlY1N0ciA9IGRlcGxveUNvbmZpZy52ZXJzaW9uU3RyaW5nLnBvZFNwZWNTdHI7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGVwbG95Q29uZmlnLnZlcnNpb25TdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZGVwbG95Q29uZmlnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjcmVhdGVWZXJzaW9uKCkgeyAvLyDliJvlu7p2ZXJzaW9uXG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdDb25maWcgPSB0aGlzLl9mb3JtYXJ0RGVwbG95KCksXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uT2JqID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUlkOiBuZXdDb25maWcuZGVwbG95SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyRHJhZnRzOiBuZXdDb25maWcuY29udGFpbmVyRHJhZnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU2VsZWN0b3JzOiBuZXdDb25maWcubGFiZWxTZWxlY3RvcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVyc2lvblR5cGU6IG5ld0NvbmZpZy52ZXJzaW9uVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2RTcGVjU3RyOiBuZXdDb25maWcucG9kU3BlY1N0cixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2x1bWVEcmFmdHM6IG5ld0NvbmZpZy52b2x1bWVEcmFmdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLmNyZWF0ZVZlcnNpb24odmVyc2lvbk9iaikudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcuZGVwbG95bWVudFN0YXR1cyAhPSAnUlVOTklORycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCfmlrDlu7rpg6jnvbLniYjmnKzmiJDlip8s5b2T5YmN54q25oCB5LiN6IO95Y2H57qn44CCJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgnY3JlYXRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgdGVtcGxhdGUgaXMgaW4gZGVwbG95RGV0YWlsLmh0bWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3JlYXRlVmVyc2lvbk1vZGFsID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnY3JlYXRlVmVyc2lvbk1vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnY3JlYXRlVmVyc2lvbk1vZGFsQ3RyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogJ3NtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGljYXM6ICgpID0+IHRoaXMuY29uZmlnLmN1cnJlbnRSZXBsaWNhc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlVmVyc2lvbk1vZGFsLnJlc3VsdC50aGVuKChyZXBsaWNhcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLnVwZGF0ZURlcGxveSh0aGlzLmNvbmZpZy5kZXBsb3lJZCwgcmVzLmRhdGEucmVzdWx0LCByZXBsaWNhcykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCflt7Lmj5DkuqTvvIzmraPlnKjljYfnuqfvvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfljYfnuqflpLHotKXvvIEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoJ3VwZGF0ZUZhaWxlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgnZGlzbWlzcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfliJvlu7rniYjmnKzlpLHotKXvvIEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnY3JlYXRlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5YGc5q2iXG4gICAgICAgICAgICBzdG9wKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RlcGxveS9hY3Rpb24vc3RvcD9kZXBsb3lJZD0nICsgdGhpcy5jb25maWcuZGVwbG95SWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWJvcnQoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RlcGxveS9hY3Rpb24vYWJvcnQ/ZGVwbG95SWQ9JyArIHRoaXMuY29uZmlnLmRlcGxveUlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBEYWVtb25TZXQg55qE5omp5a6557yp5a65XG4gICAgICAgICAgICBzY2FsZUZvckRhZW1vblNldCgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3NjYWxlTW9kYWxGb3JEYWVtb25TZXQuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnc2NhbGVNb2RhbEZvckRhZW1vblNldEN0cicsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiAnbWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUluczogKCkgPT4gdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oKG5vZGVMaXN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXJsID0gYGFwaS9kZXBsb3kvYWN0aW9uL2RhZW1vbnNldC9zY2FsZXM/ZGVwbG95SWQ9JHt0aGlzLmNvbmZpZy5kZXBsb3lJZH0mdmVyc2lvbj0ke3RoaXMuY29uZmlnLmN1cnJlbnRWZXJzaW9uc1swXS52ZXJzaW9ufWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAkaHR0cC5wb3N0KHVybCwgbm9kZUxpc3QpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+aTjeS9nOaIkOWKn++8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzLmRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn6K+35rGC5aSx6LSl77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdyZXF1ZXN0RXJyb3InKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2Rpc21pc3MnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOaJqeWuuS/nvKnlrrlcbiAgICAgICAgICAgIHNjYWxlKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnc2NhbGVNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTY2FsZU1vZGFsQ3RyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkUmVwbGljYXM6ICgpID0+IHRoaXMuY29uZmlnLmN1cnJlbnRSZXBsaWNhc1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbigocmVwbGljYXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxpY2FzID0gcGFyc2VJbnQocmVwbGljYXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcGxpY2FzID09PSB0aGlzLmNvbmZpZy5jdXJyZW50UmVwbGljYXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5a6e5L6L5Liq5pWw5peg5Y+Y5YyW77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVybCA9IHJlcGxpY2FzID4gdGhpcy5jb25maWcuY3VycmVudFJlcGxpY2FzID8gJ2FwaS9kZXBsb3kvYWN0aW9uL3NjYWxldXAnIDogJ2FwaS9kZXBsb3kvYWN0aW9uL3NjYWxlZG93bic7XG4gICAgICAgICAgICAgICAgICAgICAgICAkaHR0cC5wb3N0KHVybCArICc/ZGVwbG95SWQ9JyArIHRoaXMuY29uZmlnLmRlcGxveUlkICsgJyZyZXBsaWNhcz0nICsgcmVwbGljYXMgKyAnJnZlcnNpb249JyArIHRoaXMuY29uZmlnLmN1cnJlbnRWZXJzaW9uc1swXS52ZXJzaW9uKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCfmk43kvZzmiJDlip/vvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlcy5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+ivt+axguWksei0pe+8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgncmVxdWVzdEVycm9yJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdkaXNtaXNzJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5oGi5aSNXG4gICAgICAgICAgICByZWNvdmVyVmVyc2lvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZlcnNpb25Nb2RhbElucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndmVyc2lvbkxpc3RNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdWZXJzaW9uTGlzdE1vZGFsQ3RyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95SW5mbzogKCkgPT4gdGhpcy5jb25maWdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb25Nb2RhbElucy5yZXN1bHQudGhlbigoc3RhcnRJbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLnJvbGxiYWNrRGVwbG95KHRoaXMuY29uZmlnLmRlcGxveUlkLCBzdGFydEluZm8udmVyc2lvbklkLCBzdGFydEluZm8ucmVwbGljYXMpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzLmRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2Rpc21pc3MnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDljYfnuqdcbiAgICAgICAgICAgIHVwZGF0ZVZlcnNpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2ZXJzaW9uTW9kYWxJbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3ZlcnNpb25MaXN0TW9kYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVmVyc2lvbkxpc3RNb2RhbEN0cicsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiAnbWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUluZm86ICgpID0+IHRoaXMuY29uZmlnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uTW9kYWxJbnMucmVzdWx0LnRoZW4oKHN0YXJ0SW5mbykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRWZXJzaW9uSWQgPSB0aGlzLmNvbmZpZy5jdXJyZW50VmVyc2lvbnNbMF0udmVyc2lvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50VmVyc2lvbklkID09PSBzdGFydEluZm8udmVyc2lvbklkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+aCqOS4jeiDvemAieaLqeW9k+WJjeeJiOacrO+8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnZGlzbWlzcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50VmVyc2lvbklkID4gc3RhcnRJbmZvLnZlcnNpb25JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveVNlcnZpY2Uucm9sbGJhY2tEZXBsb3kodGhpcy5jb25maWcuZGVwbG95SWQsIHN0YXJ0SW5mby52ZXJzaW9uSWQsIHN0YXJ0SW5mby5yZXBsaWNhcykudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+W3suaPkOS6pO+8jOato+WcqOWbnua7mu+8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlcy5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5Zue5rua5aSx6LSl77yM6K+36YeN6K+V77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLnVwZGF0ZURlcGxveSh0aGlzLmNvbmZpZy5kZXBsb3lJZCwgc3RhcnRJbmZvLnZlcnNpb25JZCwgc3RhcnRJbmZvLnJlcGxpY2FzKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5bey5o+Q5Lqk77yM5q2j5Zyo5Y2H57qn77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzLmRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+WNh+e6p+Wksei0pe+8jOivt+mHjeivle+8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdkaXNtaXNzJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5ZCv5YqoXG4gICAgICAgICAgICBzdGFydFZlcnNpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2ZXJzaW9uTW9kYWxJbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3ZlcnNpb25MaXN0TW9kYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVmVyc2lvbkxpc3RNb2RhbEN0cicsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiAnbWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveUluZm86ICgpID0+IHRoaXMuY29uZmlnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uTW9kYWxJbnMucmVzdWx0LnRoZW4oKHN0YXJ0SW5mbykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95U2VydmljZS5zdGFydERlcGxveSh0aGlzLmNvbmZpZy5kZXBsb3lJZCwgc3RhcnRJbmZvLnZlcnNpb25JZCwgc3RhcnRJbmZvLnJlcGxpY2FzKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlcy5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdkaXNtaXNzJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDliKDpmaRcbiAgICAgICAgICAgIGRlbGV0ZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZSgnL2FwaS9kZXBsb3kvaWQvJyArIHRoaXMuY29uZmlnLmRlcGxveUlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBtb2RpZnlEZXBsb3koKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9iaiA9IHRoaXMuX2Zvcm1hcnREZXBsb3koKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVwbG95U2VydmljZS5tb2RpZnlEZXBsb3kodGhpcy5jb25maWcuZGVwbG95SWQsIG9iaik7XG4gICAgICAgICAgICB9IFxuICAgICAgICAgICAgLy8g5paw5bu6XG4gICAgICAgICAgICBjcmVhdGUoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgb2JqID0gdGhpcy5fZm9ybWFydERlcGxveSgpO1xuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gY3JlYXRlRGVwbG95KCkge1xuICAgICAgICAgICAgICAgICAgICAkaHR0cC5wb3N0KCdhcGkvZGVwbG95L2NyZWF0ZScsIGFuZ3VsYXIudG9Kc29uKG9iaikpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjcmVhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNOZXdOYW1lc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWVzcGFjZSA9IHRoaXMuY29uZmlnLm5hbWVzcGFjZTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWVzcGFjZUFyciA9IFtuYW1lc3BhY2VdO1xuICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5zZXROYW1lc3BhY2UodGhpcy5jbHVzdGVyTGlzdElucy5jbHVzdGVyLmlkLCBuYW1lc3BhY2VBcnIpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVJc05ld05hbWVzcGFjZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uYW1lc3BhY2VMaXN0LnB1c2gobmFtZXNwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTmFtZXNwYWNlKG5hbWVzcGFjZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVEZXBsb3koKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbmFtZXNwYWNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZURlcGxveSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdldERlcGxveVN0cihjYWxsYmFjaykge1xuICAgICAgICAgICAgICBsZXQgb2JqID0gdGhpcy5fZm9ybWFydERlcGxveSgpO1xuICAgICAgICAgICAgICBvYmoucG9kU3BlY1N0ciA9ICcnO1xuXG4gICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KGBhcGkvZGVwbG95L2RlcGxveW1lbnRzdHJgLCBhbmd1bGFyLnRvSnNvbihvYmopKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjbGFzcyBEZXBsb3lJbnN0YW5jZUxpc3Qge1xuICAgICAgICAgICAgY29uc3RydWN0b3IoaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsQ29udGFpbmVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lckxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICAvLyDlt7LpgInkuK1pbnN0YW5jZeaVsFxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgLy8g5bey6YCJ5LitY29udGFpbmVy5pWwXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbnRhaW5lckNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoaW5zdGFuY2VzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluaXQoaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGxDb250YWluZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUxpc3QgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VzID0gaW5zdGFuY2VzIHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaW5zdGFuY2Ugb2YgaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmtleUZpbHRlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLmNvbnRhaW5lcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY29udGFpbmVyIG9mIGluc3RhbmNlLmNvbnRhaW5lcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zaG9ydENvbnRhaW5lcklkID0gY29udGFpbmVyLmNvbnRhaW5lcklkLnN1YnN0cmluZygwLCAxMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2VzO1xuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDpgInmi6nlrp7kvostLT7liIfmjaJjb250YWluZXJMaXN0XG4gICAgICAgICAgICB0b2dnbGVDb250YWluZXJMaXN0KGluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsQ29udGFpbmVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbnRhaW5lckNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lckxpc3QgPSBpbnN0YW5jZS5jb250YWluZXJzIHx8IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGNvbnRhaW5lciBvZiB0aGlzLmNvbnRhaW5lckxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWx0ZXJXaXRoS2V5KGtleXdvcmRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpbnN0YW5jZSBvZiB0aGlzLmluc3RhbmNlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmtleUZpbHRlciA9IGluc3RhbmNlLmluc3RhbmNlTmFtZS5pbmRleE9mKGtleXdvcmRzKSAhPT0gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlQ29udGFpbmVyQ2hlY2soY29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpc0FsbEhhc0NoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb250YWluZXIuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbnRhaW5lckNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmmK/lkKbkuLrlhajpgIlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNvbnRhaW5lciBvZiB0aGlzLmNvbnRhaW5lckxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRhaW5lci5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQWxsSGFzQ2hhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0FsbEhhc0NoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29udGFpbmVyQ291bnQtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWFqOmAiS/lhajkuI3pgIlcbiAgICAgICAgICAgIGNoZWNrQWxsQ29udGFpbmVyKGlzQ2hlY2tBbGxDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsQ29udGFpbmVyID0gdHlwZW9mIGlzQ2hlY2tBbGxDb250YWluZXIgPT09ICd1bmRlZmluZWQnID8gIXRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA6IGlzQ2hlY2tBbGxDb250YWluZXI7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb250YWluZXJDb3VudCA9IHRoaXMuaXNDaGVja0FsbENvbnRhaW5lciA/IHRoaXMuY29udGFpbmVyTGlzdC5sZW5ndGggOiAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjb250YWluZXIgb2YgdGhpcy5jb250YWluZXJMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuaXNTZWxlY3RlZCA9IHRoaXMuaXNDaGVja0FsbENvbnRhaW5lcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDliIfmjaLljZXkuKrlrp7kvovnmoTpgInkuK3nirbmgIFcbiAgICAgICAgICAgIHRvZ2dsZUNoZWNrKGluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpc0FsbEhhc0NoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaYr+WQpuS4uuWFqOmAiVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaW5zdGFuY2Ugb2YgdGhpcy5pbnN0YW5jZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2Uua2V5RmlsdGVyICYmICFpbnN0YW5jZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQWxsSGFzQ2hhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0FsbEhhc0NoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWFqOmAiS/lhajkuI3pgIlcbiAgICAgICAgICAgIGNoZWNrQWxsSW5zdGFuY2UoaXNDaGVja0FsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IHR5cGVvZiBpc0NoZWNrQWxsID09PSAndW5kZWZpbmVkJyA/IHRoaXMuaXNDaGVja0FsbCA6IGlzQ2hlY2tBbGw7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpbnN0YW5jZSBvZiB0aGlzLmluc3RhbmNlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2Uua2V5RmlsdGVyICYmIHRoaXMuaXNDaGVja0FsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNsYXNzIERlcGxveUxpc3Qge1xuICAgICAgICAgICAgY29uc3RydWN0b3IoZGVwbG95TGlzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95ID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUluc3RhbmNlTGlzdElucyA9IG5ldyBEZXBsb3lJbnN0YW5jZUxpc3QoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoZGVwbG95TGlzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0KGRlcGxveUxpc3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3QgPSBkZXBsb3lMaXN0IHx8IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlRGVwbG95KGRlcGxveUlkLCBkZXBsb3lOYW1lLCBuYW1lc3BhY2UsIG5vdE5lZWRJbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkZXBsb3lJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3kuaWQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3kubmFtZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveS5uYW1lc3BhY2UgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lJbnN0YW5jZUxpc3RJbnMuaW5pdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveS5pZCA9IGRlcGxveUlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3kubmFtZSA9IGRlcGxveU5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveS5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5vdE5lZWRJbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lTZXJ2aWNlLmdldEluc3RhbmNlcyhkZXBsb3lJZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95SW5zdGFuY2VMaXN0SW5zLmluaXQocmVzLmRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQHBhcmFtIGhvc3RFbnY6ICdURVNUJyBvciAnUFJPRCdcbiAgICAgICAgICAgIGZpbHRlckRlcGxveShjbHVzdGVyTmFtZSwgaG9zdEVudikge1xuICAgICAgICAgICAgICAgIGxldCBkZXBsb3lJZCwgZGVwbG95TmFtZSwgbmFtZXNwYWNlO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGRlcGxveSBvZiB0aGlzLmRlcGxveUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVwbG95LmNsdXN0ZXJGaWx0ZXIgPSBjbHVzdGVyTmFtZSA/IGRlcGxveS5jbHVzdGVyTmFtZSA9PT0gY2x1c3Rlck5hbWUgOiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBkZXBsb3kuaG9zdEZpbHRlciA9IGhvc3RFbnYgPyBkZXBsb3kuaG9zdEVudiA9PT0gaG9zdEVudiA6IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIOmAieS4reesrOS4gOS4quespuWQiOadoeS7tueahOmDqOe9suW5tuWIh+aNouWIsOivpemDqOe9slxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRlcGxveUlkID09PSAndW5kZWZpbmVkJyAmJiBkZXBsb3kuY2x1c3RlckZpbHRlciAmJiBkZXBsb3kuaG9zdEZpbHRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95SWQgPSBkZXBsb3kuZGVwbG95SWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3lOYW1lID0gZGVwbG95LmRlcGxveU5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2UgPSBkZXBsb3kubmFtZXNwYWNlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBkZXBsb3lJZCA9PT0gJ3VuZGVmaW5lZCcgPyB0aGlzLnRvZ2dsZURlcGxveSgpIDogdGhpcy50b2dnbGVEZXBsb3koZGVwbG95SWQsIGRlcGxveU5hbWUsIG5hbWVzcGFjZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDojrflvpflrp7kvotcbiAgICAgICAgY29uc3QgZ2V0SW5zdGFuY2UgPSAkZG9tZU1vZGVsLmluc3RhbmNlc0NyZWF0b3Ioe1xuICAgICAgICAgICAgRGVwbG95TGlzdDogRGVwbG95TGlzdCxcbiAgICAgICAgICAgIERlcGxveTogRGVwbG95XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVwbG95U2VydmljZTogZGVwbG95U2VydmljZSxcbiAgICAgICAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZVxuICAgICAgICB9O1xuICAgIH1cbiAgICBEZXBsb3lTZXJ2aWNlLiRpbmplY3QgPSBbJyRodHRwJywgJyRkb21lQ2x1c3RlcicsICckZG9tZUltYWdlJywgJyRkb21lUHVibGljJywgJyRkb21lTW9kZWwnLCAnJG1vZGFsJywgJyRxJywgJyR1dGlsJ107XG4gICAgZGVwbG95TW9kdWxlLmZhY3RvcnkoJyRkb21lRGVwbG95JywgRGVwbG95U2VydmljZSk7XG4gICAgd2luZG93LmRlcGxveU1vZHVsZSA9IGRlcGxveU1vZHVsZTtcbn0pKHdpbmRvdyk7XG4iXX0=
