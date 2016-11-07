'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @author ChandraLee
 * @description 报警服务
 */

(function (domeApp, undefined) {
    'use strict';

    if (typeof domeApp === 'undefined') return;

    domeApp.factory('$domeAlarm', ['$domeModel', '$domeUser', '$domeDeploy', '$domeCluster', '$http', '$domePublic', '$q', '$util', function ($domeModel, $domeUser, $domeDeploy, $domeCluster, $http, $domePublic, $q, $util) {
        var AlarmService = function AlarmService() {
            $domeModel.ServiceModel.call(this, '/api/alarm/template');
        };
        var HostGroupService = function HostGroupService() {
            $domeModel.ServiceModel.call(this, '/api/alarm/hostgroup');
            this.addHost = function (id, hostInfo) {
                return $http.post('/api/alarm/hostgroup/bind/' + id, angular.toJson(hostInfo));
            };
            this.deleteHost = function (id, nodeId) {
                return $http.delete('/api/alarm/hostgroup/bind/' + id + '/' + nodeId);
            };
        };
        var clusterService = $domeCluster.getInstance('ClusterService');
        var _alarmService = new AlarmService();
        var keyMaps = {
            metric: {
                cpu_percent: {
                    text: 'CPU占用率',
                    unit: '%',
                    belong: 'all'
                },
                memory_percent: {
                    text: '内存占用率',
                    unit: '%',
                    belong: 'all'
                },
                disk_percent: {
                    text: '磁盘占用率',
                    tagName: '分区',
                    unit: '%',
                    belong: 'host'
                },
                disk_read: {
                    text: '磁盘读取',
                    tagName: '设备',
                    unit: 'KB/s',
                    belong: 'host'
                },
                disk_write: {
                    text: '磁盘写入',
                    tagName: '设备',
                    unit: 'KB/s',
                    belong: 'host'
                },
                network_in: {
                    text: '网络流入',
                    tagName: '网卡',
                    unit: 'KB/s',
                    belong: 'all'
                },
                network_out: {
                    text: '网络流出',
                    tagName: '网卡',
                    unit: 'KB/s',
                    belong: 'all'
                },
                agent_alive: {
                    text: 'agent存活',
                    belong: 'host'
                }
            },
            aggregateType: {
                avg: '平均值',
                max: '最大值',
                min: '最小值',
                sum: '和值'
            },
            aggregateTypeAgent: {
                max: '全部',
                min: '至少一次'
            }
        };

        var AlarmTemplate = function () {
            function AlarmTemplate(alarmInfo) {
                _classCallCheck(this, AlarmTemplate);

                this.config = {};
                this.hostGroupList = [];
                this.keyMaps = keyMaps;
                this.groupList = [];
                this.deployListIns = $domeDeploy.getInstance('DeployList');
                this.loadingIns = $domePublic.getLoadingInstance();
                this.clusterList = [];
                this.init(alarmInfo);
            }

            _createClass(AlarmTemplate, [{
                key: 'init',
                value: function init(alarmInfo) {
                    if (!$util.isObject(alarmInfo)) {
                        alarmInfo = {
                            templateType: 'host'
                        };
                    }
                    if (!$util.isObject(alarmInfo.deploymentInfo)) {
                        alarmInfo.deploymentInfo = {};
                    }
                    if (!$util.isArray(alarmInfo.strategyList)) {
                        alarmInfo.strategyList = [];
                    }
                    if (!$util.isObject(alarmInfo.callback)) {
                        alarmInfo.callback = {};
                    }
                    if (!$util.isArray(alarmInfo.hostGroupList)) {
                        alarmInfo.hostGroupList = [];
                    }
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = alarmInfo.strategyList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var strategy = _step.value;

                            if (strategy.metric == 'disk_percent') {
                                // strategy.tag = 'mount=/opt'
                                strategy.tag = strategy.tag.substring(6);
                            } else if (strategy.metric.indexOf('disk') !== -1) {
                                // strategy.tag = 'device=sda'
                                strategy.tag = strategy.tag.substring(7);
                            } else if (strategy.metric.indexOf('network') !== -1) {
                                // strategy.tag = 'iface=sda'
                                strategy.tag = strategy.tag.substring(6);
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

                    this.config = alarmInfo;
                    if (this.config.id === void 0) {
                        if (!this.config.deploymentInfo.hostEnv) {
                            this.config.deploymentInfo.hostEnv = 'PROD';
                        }
                        this.addStrategy();
                    }
                }
            }, {
                key: 'initHostGroupList',
                value: function initHostGroupList() {
                    var _this = this;

                    var hostGroupService = void 0;

                    var init = function init() {
                        var configHostGroupList = _this.config.hostGroupList,
                            isFind = void 0;
                        if (configHostGroupList && configHostGroupList.length === 0) {
                            var _iteratorNormalCompletion2 = true;
                            var _didIteratorError2 = false;
                            var _iteratorError2 = undefined;

                            try {
                                for (var _iterator2 = _this.hostGroupList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var hostGroup = _step2.value;

                                    hostGroup.isSelected = false;
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
                        } else {
                            for (var i = 0, l = _this.hostGroupList.length; i < l; i++) {
                                isFind = false;
                                for (var j = 0, l1 = configHostGroupList.length; j < l1; j++) {
                                    if (configHostGroupList[j].id === _this.hostGroupList[i].id) {
                                        isFind = true;
                                        break;
                                    }
                                }
                                _this.hostGroupList[i].isSelected = isFind;
                            }
                        }
                    };
                    if (this.hostGroupList.length === 0) {
                        this.loadingIns.startLoading('hostgroup');
                        hostGroupService = new HostGroupService();
                        hostGroupService.getData().then(function (res) {
                            _this.hostGroupList = res.data.result || [];
                            init();
                        }, function () {
                            $domePublic.openWarning('获取主机组信息失败！');
                        }).finally(function () {
                            _this.loadingIns.finishLoading('hostgroup');
                        });
                    } else {
                        init();
                    }
                }
            }, {
                key: 'initGroupList',
                value: function initGroupList() {
                    var _this2 = this;

                    var userGroupList = this.config.userGroupList;

                    var init = function init() {
                        var isFind = void 0;
                        if (!userGroupList || userGroupList.length === 0) {
                            for (var i = 0, l = _this2.groupList.length; i < l; i++) {
                                _this2.groupList[i].isSelected = false;
                            }
                        } else {
                            for (var _i = 0, _l = _this2.groupList.length; _i < _l; _i++) {
                                isFind = false;
                                for (var j = 0, l1 = userGroupList.length; j < l1; j++) {
                                    if (_this2.groupList[_i].id === userGroupList[j].id) {
                                        isFind = true;
                                        break;
                                    }
                                }
                                _this2.groupList[_i].isSelected = isFind;
                            }
                        }
                    };
                    if (this.groupList.length === 0) {
                        this.loadingIns.startLoading('groupList');
                        $domeUser.userService.getGroup().then(function (res) {
                            _this2.groupList = res.data.result || [];
                            init();
                        }, function () {
                            $domePublic.openWarning('获取组信息失败！');
                        }).finally(function () {
                            _this2.loadingIns.finishLoading('groupList');
                        });
                    } else {
                        init();
                    }
                }
            }, {
                key: 'initDeployAndClusterList',
                value: function initDeployAndClusterList() {
                    var _this3 = this;

                    var deploymentInfo = this.config.deploymentInfo;
                    if (this.deployListIns.deployList.length === 0) {
                        this.loadingIns.startLoading('deploy');
                        $q.all([$domeDeploy.deployService.getList(), clusterService.getData()]).then(function (res) {
                            _this3.deployListIns.init(res[0].data.result);
                            _this3.clusterList = res[1].data.result || [];
                            if (!deploymentInfo.clusterName) {
                                deploymentInfo.clusterName = _this3.clusterList[0].name;
                                _this3.toggleCluster(_this3.clusterList[0].name);
                            } else {
                                _this3.toggleHostEnv(deploymentInfo.hostEnv);
                                _this3.deployListIns.deploy.id = deploymentInfo.id;
                                _this3.deployListIns.deploy.name = deploymentInfo.deploymentName;
                            }
                        }, function () {
                            $domePublic.openWarning('获取信息失败！');
                        }).finally(function () {
                            _this3.loadingIns.finishLoading('deploy');
                        });
                    } else {
                        this.toggleHostEnv(deploymentInfo.hostEnv);
                        this.deployListIns.deploy.id = deploymentInfo.id;
                        this.deployListIns.deploy.name = deploymentInfo.deploymentName;
                    }
                }
                // @param type: 'host'/'deploy'

            }, {
                key: 'toggleTemplateType',
                value: function toggleTemplateType(type) {
                    if (type === this.config.templateType) {
                        return;
                    }
                    this.config.templateType = type;
                    this.config.strategyList = [];
                    this.addStrategy();
                }
            }, {
                key: 'addStrategy',
                value: function addStrategy() {
                    this.config.strategyList.push({
                        metric: 'cpu_percent',
                        tag: '',
                        pointNum: 3,
                        aggregateType: 'avg',
                        operator: '==',
                        rightValue: null,
                        note: '',
                        maxStep: 3
                    });
                }
            }, {
                key: 'deleteStrategy',
                value: function deleteStrategy(index) {
                    this.config.strategyList.splice(index, 1);
                }
            }, {
                key: 'toggleStrategyMetric',
                value: function toggleStrategyMetric(strategyIndex, metric) {
                    var strategy = this.config.strategyList[strategyIndex];
                    if (strategy.metric === metric) return;
                    if (metric === 'agent_alive') {
                        strategy.aggregateType = 'max';
                    }
                    strategy.metric = metric;
                    strategy.tag = '';
                }
            }, {
                key: 'toggleHostEnv',
                value: function toggleHostEnv(env) {
                    this.config.deploymentInfo.hostEnv = env;
                    this.deployListIns.filterDeploy(this.config.deploymentInfo.clusterName, env);
                }
            }, {
                key: 'toggleCluster',
                value: function toggleCluster(clusterName) {
                    this.config.deploymentInfo.clusterName = clusterName;
                    this.deployListIns.filterDeploy(clusterName, this.config.deploymentInfo.hostEnv);
                }
            }, {
                key: 'getFormartConfig',
                value: function getFormartConfig() {
                    var config = {};
                    config.templateName = this.config.templateName;
                    config.templateType = this.config.templateType;
                    config.id = this.config.id;

                    if (config.templateType == 'host') {
                        config.templateType = this.config.templateType;
                        config.hostGroupList = [];
                        for (var i = 0, l = this.hostGroupList.length; i < l; i++) {
                            if (this.hostGroupList[i].isSelected) {
                                config.hostGroupList.push({
                                    id: this.hostGroupList[i].id
                                });
                            }
                        }
                    } else if (config.templateType == 'deploy') {
                        config.deploymentInfo = {
                            id: this.deployListIns.deploy.id,
                            clusterName: this.config.deploymentInfo.clusterName,
                            deploymentName: this.deployListIns.deploy.name,
                            hostEnv: this.config.deploymentInfo.hostEnv
                        };
                    }

                    config.strategyList = [];
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = this.config.strategyList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var strategy = _step3.value;

                            var newStrategy = angular.copy(strategy);
                            if (newStrategy.metric == 'agent_alive') {
                                newStrategy.rightValue = 1;
                                newStrategy.operator = '<';
                            }
                            if (newStrategy.tag) {
                                if (newStrategy.metric == 'disk_percent') {
                                    newStrategy.tag = 'mount=' + newStrategy.tag;
                                } else if (newStrategy.metric.indexOf('disk') !== -1) {
                                    newStrategy.tag = 'device=' + newStrategy.tag;
                                } else if (newStrategy.metric.indexOf('network') !== -1) {
                                    newStrategy.tag = 'iface=' + newStrategy.tag;
                                }
                            }
                            config.strategyList.push(newStrategy);
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

                    config.userGroupList = [];
                    for (var _i2 = 0, _l2 = this.groupList.length; _i2 < _l2; _i2++) {
                        if (this.groupList[_i2].isSelected) {
                            config.userGroupList.push({
                                id: this.groupList[_i2].id
                            });
                        }
                    }
                    config.callback = angular.copy(this.config.callback);
                    console.log(config);
                    return config;
                }
            }, {
                key: 'create',
                value: function create() {
                    return _alarmService.setData(this.getFormartConfig());
                }
            }, {
                key: 'modify',
                value: function modify() {
                    return _alarmService.updateData(this.getFormartConfig());
                }
            }]);

            return AlarmTemplate;
        }();
        // hostGroup添加主机


        var NodeList = function (_$domeModel$SelectLis) {
            _inherits(NodeList, _$domeModel$SelectLis);

            function NodeList(nodeList, clusterName) {
                _classCallCheck(this, NodeList);

                var _this4 = _possibleConstructorReturn(this, (NodeList.__proto__ || Object.getPrototypeOf(NodeList)).call(this, 'nodeList'));

                _this4.selectedList = [];
                _this4.init(nodeList, clusterName);
                return _this4;
            }

            _createClass(NodeList, [{
                key: 'init',
                value: function init(nodeList, clusterName) {
                    if (!nodeList) {
                        nodeList = this.nodeList;
                    }
                    if (!clusterName) {
                        clusterName = this.clusterName;
                    }
                    if (!nodeList || !clusterName) {
                        return;
                    }
                    this.clusterName = clusterName;
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = nodeList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var node = _step4.value;
                            var _iteratorNormalCompletion5 = true;
                            var _didIteratorError5 = false;
                            var _iteratorError5 = undefined;

                            try {
                                for (var _iterator5 = this.selectedList[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    var selectedNode = _step5.value;

                                    if (selectedNode.cluster === clusterName && selectedNode.name === node.name) {
                                        node.isSelected = true;
                                        break;
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

                            if (!node.isSelected) {
                                node.isSelected = false;
                            }
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

                    _get(NodeList.prototype.__proto__ || Object.getPrototypeOf(NodeList.prototype), 'init', this).call(this, nodeList);
                }
            }, {
                key: 'initSelectedList',
                value: function initSelectedList() {
                    this.selectedList = [];
                    this.checkAllItem(false);
                }
            }, {
                key: 'checkAllItem',
                value: function checkAllItem(isCheckAll) {
                    _get(NodeList.prototype.__proto__ || Object.getPrototypeOf(NodeList.prototype), 'checkAllItem', this).call(this, isCheckAll);
                    if (isCheckAll) {
                        var _iteratorNormalCompletion6 = true;
                        var _didIteratorError6 = false;
                        var _iteratorError6 = undefined;

                        try {
                            for (var _iterator6 = this.nodeList[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                var node = _step6.value;

                                if (node.isSelected) {
                                    var isExist = false;
                                    var _iteratorNormalCompletion7 = true;
                                    var _didIteratorError7 = false;
                                    var _iteratorError7 = undefined;

                                    try {
                                        for (var _iterator7 = this.selectedList[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                            var selectedNode = _step7.value;

                                            if (this.clusterName === selectedNode.cluster && node.name === selectedNode.name) {
                                                isExist = true;
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

                                    if (!isExist) {
                                        this.selectedList.push({
                                            name: node.name,
                                            ip: node.ip,
                                            cluster: this.clusterName
                                        });
                                    }
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
                    } else {
                        var _iteratorNormalCompletion8 = true;
                        var _didIteratorError8 = false;
                        var _iteratorError8 = undefined;

                        try {
                            for (var _iterator8 = this.nodeList[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                var _node = _step8.value;

                                for (var i = 0; i < this.selectedList.length; i++) {
                                    var _selectedNode = this.selectedList[i];
                                    if (this.clusterName === _selectedNode.cluster && _node.name === _selectedNode.name) {
                                        this.selectedList.splice(i, 1);
                                        i--;
                                        break;
                                    }
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
                }
            }, {
                key: 'toggleCheck',
                value: function toggleCheck(item, isSelected) {
                    _get(NodeList.prototype.__proto__ || Object.getPrototypeOf(NodeList.prototype), 'toggleCheck', this).call(this, item, isSelected);
                    if (isSelected) {
                        item.cluster = this.clusterName;
                        this.selectedList.push({
                            name: item.name,
                            ip: item.ip,
                            cluster: item.cluster
                        });
                    } else {
                        for (var i = 0; i < this.selectedList.length; i++) {
                            if (this.selectedList[i].name === item.name && this.selectedList[i].cluster === this.clusterName) {
                                this.selectedList.splice(i, 1);
                                break;
                            }
                        }
                    }
                }
            }, {
                key: 'deleteSelectedNode',
                value: function deleteSelectedNode(node) {
                    if (node.cluster === this.clusterName) {
                        var _iteratorNormalCompletion9 = true;
                        var _didIteratorError9 = false;
                        var _iteratorError9 = undefined;

                        try {
                            for (var _iterator9 = this.nodeList[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                var sigNode = _step9.value;

                                if (sigNode.name === node.name) {
                                    _get(NodeList.prototype.__proto__ || Object.getPrototypeOf(NodeList.prototype), 'toggleCheck', this).call(this, sigNode, false);
                                    break;
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
                    }
                    for (var i = 0; i < this.selectedList.length; i++) {
                        if (this.selectedList[i].name === node.name && this.selectedList[i].cluster === node.cluster) {
                            this.selectedList.splice(i, 1);
                            break;
                        }
                    }
                }
            }, {
                key: 'filterWithKey',
                value: function filterWithKey(keywords) {
                    this.selectedCount = 0;
                    this.isCheckAll = true;
                    var _iteratorNormalCompletion10 = true;
                    var _didIteratorError10 = false;
                    var _iteratorError10 = undefined;

                    try {
                        for (var _iterator10 = this.nodeList[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                            var sigItem = _step10.value;

                            var exist = false;
                            sigItem.keyFilter = sigItem.name.indexOf(keywords) !== -1;
                            if (sigItem.keyFilter) {
                                var _iteratorNormalCompletion11 = true;
                                var _didIteratorError11 = false;
                                var _iteratorError11 = undefined;

                                try {
                                    for (var _iterator11 = this.selectedList[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                                        var selectedNode = _step11.value;

                                        if (selectedNode.name === sigItem.name && selectedNode.cluster === this.clusterName) {
                                            sigItem.isSelected = true;
                                            this.selectedCount++;
                                            break;
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

                                if (!sigItem.isSelected) {
                                    sigItem.isSelected = false;
                                    if (this.isCheckAll) {
                                        this.isCheckAll = false;
                                    }
                                }
                            } else {
                                sigItem.isSelected = false;
                            }
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

                    if (this.selectedCount === 0) {
                        this.isCheckAll = false;
                    }
                }
            }]);

            return NodeList;
        }($domeModel.SelectListModel);

        var getInstance = $domeModel.instancesCreator({
            NodeList: NodeList,
            AlarmService: AlarmService,
            HostGroupService: HostGroupService,
            AlarmTemplate: AlarmTemplate
        });

        var alarmEventService = {
            getData: function getData() {
                return $http.get('/api/alarm/event');
            },
            ignore: function ignore(data) {
                return $http.post('/api/alarm/event/ignore', data);
            }
        };
        return {
            getInstance: getInstance,
            alarmEventService: alarmEventService,
            keyMaps: keyMaps
        };
    }]);
})(window.domeApp);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L2pzL3NlcnZpY2VzL2FsYXJtU2VydmljZS5lcyJdLCJuYW1lcyI6WyJkb21lQXBwIiwidW5kZWZpbmVkIiwiZmFjdG9yeSIsIiRkb21lTW9kZWwiLCIkZG9tZVVzZXIiLCIkZG9tZURlcGxveSIsIiRkb21lQ2x1c3RlciIsIiRodHRwIiwiJGRvbWVQdWJsaWMiLCIkcSIsIiR1dGlsIiwiQWxhcm1TZXJ2aWNlIiwiU2VydmljZU1vZGVsIiwiY2FsbCIsIkhvc3RHcm91cFNlcnZpY2UiLCJhZGRIb3N0IiwiaWQiLCJob3N0SW5mbyIsInBvc3QiLCJhbmd1bGFyIiwidG9Kc29uIiwiZGVsZXRlSG9zdCIsIm5vZGVJZCIsImRlbGV0ZSIsImNsdXN0ZXJTZXJ2aWNlIiwiZ2V0SW5zdGFuY2UiLCJfYWxhcm1TZXJ2aWNlIiwia2V5TWFwcyIsIm1ldHJpYyIsImNwdV9wZXJjZW50IiwidGV4dCIsInVuaXQiLCJiZWxvbmciLCJtZW1vcnlfcGVyY2VudCIsImRpc2tfcGVyY2VudCIsInRhZ05hbWUiLCJkaXNrX3JlYWQiLCJkaXNrX3dyaXRlIiwibmV0d29ya19pbiIsIm5ldHdvcmtfb3V0IiwiYWdlbnRfYWxpdmUiLCJhZ2dyZWdhdGVUeXBlIiwiYXZnIiwibWF4IiwibWluIiwic3VtIiwiYWdncmVnYXRlVHlwZUFnZW50IiwiQWxhcm1UZW1wbGF0ZSIsImFsYXJtSW5mbyIsImNvbmZpZyIsImhvc3RHcm91cExpc3QiLCJncm91cExpc3QiLCJkZXBsb3lMaXN0SW5zIiwibG9hZGluZ0lucyIsImdldExvYWRpbmdJbnN0YW5jZSIsImNsdXN0ZXJMaXN0IiwiaW5pdCIsImlzT2JqZWN0IiwidGVtcGxhdGVUeXBlIiwiZGVwbG95bWVudEluZm8iLCJpc0FycmF5Iiwic3RyYXRlZ3lMaXN0IiwiY2FsbGJhY2siLCJzdHJhdGVneSIsInRhZyIsInN1YnN0cmluZyIsImluZGV4T2YiLCJob3N0RW52IiwiYWRkU3RyYXRlZ3kiLCJob3N0R3JvdXBTZXJ2aWNlIiwiY29uZmlnSG9zdEdyb3VwTGlzdCIsImlzRmluZCIsImxlbmd0aCIsImhvc3RHcm91cCIsImlzU2VsZWN0ZWQiLCJpIiwibCIsImoiLCJsMSIsInN0YXJ0TG9hZGluZyIsImdldERhdGEiLCJ0aGVuIiwicmVzIiwiZGF0YSIsInJlc3VsdCIsIm9wZW5XYXJuaW5nIiwiZmluYWxseSIsImZpbmlzaExvYWRpbmciLCJ1c2VyR3JvdXBMaXN0IiwidXNlclNlcnZpY2UiLCJnZXRHcm91cCIsImRlcGxveUxpc3QiLCJhbGwiLCJkZXBsb3lTZXJ2aWNlIiwiZ2V0TGlzdCIsImNsdXN0ZXJOYW1lIiwibmFtZSIsInRvZ2dsZUNsdXN0ZXIiLCJ0b2dnbGVIb3N0RW52IiwiZGVwbG95IiwiZGVwbG95bWVudE5hbWUiLCJ0eXBlIiwicHVzaCIsInBvaW50TnVtIiwib3BlcmF0b3IiLCJyaWdodFZhbHVlIiwibm90ZSIsIm1heFN0ZXAiLCJpbmRleCIsInNwbGljZSIsInN0cmF0ZWd5SW5kZXgiLCJlbnYiLCJmaWx0ZXJEZXBsb3kiLCJ0ZW1wbGF0ZU5hbWUiLCJuZXdTdHJhdGVneSIsImNvcHkiLCJjb25zb2xlIiwibG9nIiwic2V0RGF0YSIsImdldEZvcm1hcnRDb25maWciLCJ1cGRhdGVEYXRhIiwiTm9kZUxpc3QiLCJub2RlTGlzdCIsInNlbGVjdGVkTGlzdCIsIm5vZGUiLCJzZWxlY3RlZE5vZGUiLCJjbHVzdGVyIiwiY2hlY2tBbGxJdGVtIiwiaXNDaGVja0FsbCIsImlzRXhpc3QiLCJpcCIsIml0ZW0iLCJzaWdOb2RlIiwia2V5d29yZHMiLCJzZWxlY3RlZENvdW50Iiwic2lnSXRlbSIsImV4aXN0Iiwia2V5RmlsdGVyIiwiU2VsZWN0TGlzdE1vZGVsIiwiaW5zdGFuY2VzQ3JlYXRvciIsImFsYXJtRXZlbnRTZXJ2aWNlIiwiZ2V0IiwiaWdub3JlIiwid2luZG93Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7QUFLQSxDQUFDLFVBQUNBLE9BQUQsRUFBVUMsU0FBVixFQUF3QjtBQUNyQjs7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QWplRCxFQWllR29ILE9BQU8vSSxPQWplViIsImZpbGUiOiJpbmRleC9qcy9zZXJ2aWNlcy9hbGFybVNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQGF1dGhvciBDaGFuZHJhTGVlXG4gKiBAZGVzY3JpcHRpb24g5oql6K2m5pyN5YqhXG4gKi9cblxuKChkb21lQXBwLCB1bmRlZmluZWQpID0+IHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgaWYgKHR5cGVvZiBkb21lQXBwID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xuXG4gICAgZG9tZUFwcC5mYWN0b3J5KCckZG9tZUFsYXJtJywgWyckZG9tZU1vZGVsJywgJyRkb21lVXNlcicsICckZG9tZURlcGxveScsICckZG9tZUNsdXN0ZXInLCAnJGh0dHAnLCAnJGRvbWVQdWJsaWMnLCAnJHEnLCAnJHV0aWwnLCBmdW5jdGlvbiAoJGRvbWVNb2RlbCwgJGRvbWVVc2VyLCAkZG9tZURlcGxveSwgJGRvbWVDbHVzdGVyLCAkaHR0cCwgJGRvbWVQdWJsaWMsICRxLCAkdXRpbCkge1xuICAgICAgICBjb25zdCBBbGFybVNlcnZpY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkZG9tZU1vZGVsLlNlcnZpY2VNb2RlbC5jYWxsKHRoaXMsICcvYXBpL2FsYXJtL3RlbXBsYXRlJyk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IEhvc3RHcm91cFNlcnZpY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkZG9tZU1vZGVsLlNlcnZpY2VNb2RlbC5jYWxsKHRoaXMsICcvYXBpL2FsYXJtL2hvc3Rncm91cCcpO1xuICAgICAgICAgICAgdGhpcy5hZGRIb3N0ID0gKGlkLCBob3N0SW5mbykgPT4gJGh0dHAucG9zdChgL2FwaS9hbGFybS9ob3N0Z3JvdXAvYmluZC8ke2lkfWAsIGFuZ3VsYXIudG9Kc29uKGhvc3RJbmZvKSk7XG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUhvc3QgPSAoaWQsIG5vZGVJZCkgPT4gJGh0dHAuZGVsZXRlKGAvYXBpL2FsYXJtL2hvc3Rncm91cC9iaW5kLyR7aWR9LyR7bm9kZUlkfWApO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjbHVzdGVyU2VydmljZSA9ICRkb21lQ2x1c3Rlci5nZXRJbnN0YW5jZSgnQ2x1c3RlclNlcnZpY2UnKTtcbiAgICAgICAgY29uc3QgX2FsYXJtU2VydmljZSA9IG5ldyBBbGFybVNlcnZpY2UoKTtcbiAgICAgICAgY29uc3Qga2V5TWFwcyA9IHtcbiAgICAgICAgICAgIG1ldHJpYzoge1xuICAgICAgICAgICAgICAgIGNwdV9wZXJjZW50OiB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICdDUFXljaDnlKjnjocnLFxuICAgICAgICAgICAgICAgICAgICB1bml0OiAnJScsXG4gICAgICAgICAgICAgICAgICAgIGJlbG9uZzogJ2FsbCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1lbW9yeV9wZXJjZW50OiB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICflhoXlrZjljaDnlKjnjocnLFxuICAgICAgICAgICAgICAgICAgICB1bml0OiAnJScsXG4gICAgICAgICAgICAgICAgICAgIGJlbG9uZzogJ2FsbCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc2tfcGVyY2VudDoge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn56OB55uY5Y2g55So546HJyxcbiAgICAgICAgICAgICAgICAgICAgdGFnTmFtZTogJ+WIhuWMuicsXG4gICAgICAgICAgICAgICAgICAgIHVuaXQ6ICclJyxcbiAgICAgICAgICAgICAgICAgICAgYmVsb25nOiAnaG9zdCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc2tfcmVhZDoge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn56OB55uY6K+75Y+WJyxcbiAgICAgICAgICAgICAgICAgICAgdGFnTmFtZTogJ+iuvuWkhycsXG4gICAgICAgICAgICAgICAgICAgIHVuaXQ6ICdLQi9zJyxcbiAgICAgICAgICAgICAgICAgICAgYmVsb25nOiAnaG9zdCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc2tfd3JpdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJ+ejgeebmOWGmeWFpScsXG4gICAgICAgICAgICAgICAgICAgIHRhZ05hbWU6ICforr7lpIcnLFxuICAgICAgICAgICAgICAgICAgICB1bml0OiAnS0IvcycsXG4gICAgICAgICAgICAgICAgICAgIGJlbG9uZzogJ2hvc3QnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBuZXR3b3JrX2luOiB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICfnvZHnu5zmtYHlhaUnLFxuICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiAn572R5Y2hJyxcbiAgICAgICAgICAgICAgICAgICAgdW5pdDogJ0tCL3MnLFxuICAgICAgICAgICAgICAgICAgICBiZWxvbmc6ICdhbGwnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBuZXR3b3JrX291dDoge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn572R57uc5rWB5Ye6JyxcbiAgICAgICAgICAgICAgICAgICAgdGFnTmFtZTogJ+e9keWNoScsXG4gICAgICAgICAgICAgICAgICAgIHVuaXQ6ICdLQi9zJyxcbiAgICAgICAgICAgICAgICAgICAgYmVsb25nOiAnYWxsJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWdlbnRfYWxpdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJ2FnZW505a2Y5rS7JyxcbiAgICAgICAgICAgICAgICAgICAgYmVsb25nOiAnaG9zdCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWdncmVnYXRlVHlwZToge1xuICAgICAgICAgICAgICAgIGF2ZzogJ+W5s+Wdh+WAvCcsXG4gICAgICAgICAgICAgICAgbWF4OiAn5pyA5aSn5YC8JyxcbiAgICAgICAgICAgICAgICBtaW46ICfmnIDlsI/lgLwnLFxuICAgICAgICAgICAgICAgIHN1bTogJ+WSjOWAvCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhZ2dyZWdhdGVUeXBlQWdlbnQ6IHtcbiAgICAgICAgICAgICAgICBtYXg6ICflhajpg6gnLFxuICAgICAgICAgICAgICAgIG1pbjogJ+iHs+WwkeS4gOasoSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY2xhc3MgQWxhcm1UZW1wbGF0ZSB7XG4gICAgICAgICAgICBjb25zdHJ1Y3RvcihhbGFybUluZm8pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMuaG9zdEdyb3VwTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMua2V5TWFwcyA9IGtleU1hcHM7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cExpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMgPSAkZG9tZURlcGxveS5nZXRJbnN0YW5jZSgnRGVwbG95TGlzdCcpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucyA9ICRkb21lUHVibGljLmdldExvYWRpbmdJbnN0YW5jZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlckxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoYWxhcm1JbmZvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluaXQoYWxhcm1JbmZvKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc09iamVjdChhbGFybUluZm8pKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsYXJtSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVHlwZTogJ2hvc3QnXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNPYmplY3QoYWxhcm1JbmZvLmRlcGxveW1lbnRJbmZvKSkge1xuICAgICAgICAgICAgICAgICAgICBhbGFybUluZm8uZGVwbG95bWVudEluZm8gPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KGFsYXJtSW5mby5zdHJhdGVneUxpc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsYXJtSW5mby5zdHJhdGVneUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc09iamVjdChhbGFybUluZm8uY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsYXJtSW5mby5jYWxsYmFjayA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkoYWxhcm1JbmZvLmhvc3RHcm91cExpc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsYXJtSW5mby5ob3N0R3JvdXBMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAobGV0IHN0cmF0ZWd5IG9mIGFsYXJtSW5mby5zdHJhdGVneUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0cmF0ZWd5Lm1ldHJpYyA9PSAnZGlza19wZXJjZW50Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3RyYXRlZ3kudGFnID0gJ21vdW50PS9vcHQnXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJhdGVneS50YWcgPSBzdHJhdGVneS50YWcuc3Vic3RyaW5nKDYpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0cmF0ZWd5Lm1ldHJpYy5pbmRleE9mKCdkaXNrJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzdHJhdGVneS50YWcgPSAnZGV2aWNlPXNkYSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmF0ZWd5LnRhZyA9IHN0cmF0ZWd5LnRhZy5zdWJzdHJpbmcoNyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RyYXRlZ3kubWV0cmljLmluZGV4T2YoJ25ldHdvcmsnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0cmF0ZWd5LnRhZyA9ICdpZmFjZT1zZGEnXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJhdGVneS50YWcgPSBzdHJhdGVneS50YWcuc3Vic3RyaW5nKDYpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnID0gYWxhcm1JbmZvO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5pZCA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb25maWcuZGVwbG95bWVudEluZm8uaG9zdEVudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZGVwbG95bWVudEluZm8uaG9zdEVudiA9ICdQUk9EJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFN0cmF0ZWd5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5pdEhvc3RHcm91cExpc3QoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGhvc3RHcm91cFNlcnZpY2U7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBpbml0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29uZmlnSG9zdEdyb3VwTGlzdCA9IHRoaXMuY29uZmlnLmhvc3RHcm91cExpc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0ZpbmQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWdIb3N0R3JvdXBMaXN0ICYmIGNvbmZpZ0hvc3RHcm91cExpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBob3N0R3JvdXAgb2YgdGhpcy5ob3N0R3JvdXBMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdEdyb3VwLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5ob3N0R3JvdXBMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRmluZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwLCBsMSA9IGNvbmZpZ0hvc3RHcm91cExpc3QubGVuZ3RoOyBqIDwgbDE7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnSG9zdEdyb3VwTGlzdFtqXS5pZCA9PT0gdGhpcy5ob3N0R3JvdXBMaXN0W2ldLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0ZpbmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3N0R3JvdXBMaXN0W2ldLmlzU2VsZWN0ZWQgPSBpc0ZpbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhvc3RHcm91cExpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ2hvc3Rncm91cCcpO1xuICAgICAgICAgICAgICAgICAgICBob3N0R3JvdXBTZXJ2aWNlID0gbmV3IEhvc3RHcm91cFNlcnZpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgaG9zdEdyb3VwU2VydmljZS5nZXREYXRhKCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3RHcm91cExpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfojrflj5bkuLvmnLrnu4Tkv6Hmga/lpLHotKXvvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygnaG9zdGdyb3VwJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluaXRHcm91cExpc3QoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHVzZXJHcm91cExpc3QgPSB0aGlzLmNvbmZpZy51c2VyR3JvdXBMaXN0O1xuXG4gICAgICAgICAgICAgICAgY29uc3QgaW5pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGlzRmluZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF1c2VyR3JvdXBMaXN0IHx8IHVzZXJHcm91cExpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuZ3JvdXBMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBMaXN0W2ldLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5ncm91cExpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNGaW5kID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDAsIGwxID0gdXNlckdyb3VwTGlzdC5sZW5ndGg7IGogPCBsMTsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmdyb3VwTGlzdFtpXS5pZCA9PT0gdXNlckdyb3VwTGlzdFtqXS5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNGaW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBMaXN0W2ldLmlzU2VsZWN0ZWQgPSBpc0ZpbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdyb3VwTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnZ3JvdXBMaXN0Jyk7XG4gICAgICAgICAgICAgICAgICAgICRkb21lVXNlci51c2VyU2VydmljZS5nZXRHcm91cCgpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91cExpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfojrflj5bnu4Tkv6Hmga/lpLHotKXvvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygnZ3JvdXBMaXN0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0RGVwbG95QW5kQ2x1c3Rlckxpc3QoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkZXBsb3ltZW50SW5mbyA9IHRoaXMuY29uZmlnLmRlcGxveW1lbnRJbmZvO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveUxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdkZXBsb3knKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChbJGRvbWVEZXBsb3kuZGVwbG95U2VydmljZS5nZXRMaXN0KCksIGNsdXN0ZXJTZXJ2aWNlLmdldERhdGEoKV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMuaW5pdChyZXNbMF0uZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsdXN0ZXJMaXN0ID0gcmVzWzFdLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRlcGxveW1lbnRJbmZvLmNsdXN0ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3ltZW50SW5mby5jbHVzdGVyTmFtZSA9IHRoaXMuY2x1c3Rlckxpc3RbMF0ubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlQ2x1c3Rlcih0aGlzLmNsdXN0ZXJMaXN0WzBdLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVIb3N0RW52KGRlcGxveW1lbnRJbmZvLmhvc3RFbnYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveS5pZCA9IGRlcGxveW1lbnRJbmZvLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveS5uYW1lID0gZGVwbG95bWVudEluZm8uZGVwbG95bWVudE5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfojrflj5bkv6Hmga/lpLHotKXvvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ2RlcGxveScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVIb3N0RW52KGRlcGxveW1lbnRJbmZvLmhvc3RFbnYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveS5pZCA9IGRlcGxveW1lbnRJbmZvLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveS5uYW1lID0gZGVwbG95bWVudEluZm8uZGVwbG95bWVudE5hbWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQHBhcmFtIHR5cGU6ICdob3N0Jy8nZGVwbG95J1xuICAgICAgICAgICAgdG9nZ2xlVGVtcGxhdGVUeXBlKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gdGhpcy5jb25maWcudGVtcGxhdGVUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcudGVtcGxhdGVUeXBlID0gdHlwZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5zdHJhdGVneUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFN0cmF0ZWd5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGRTdHJhdGVneSgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5zdHJhdGVneUxpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG1ldHJpYzogJ2NwdV9wZXJjZW50JyxcbiAgICAgICAgICAgICAgICAgICAgdGFnOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnROdW06IDMsXG4gICAgICAgICAgICAgICAgICAgIGFnZ3JlZ2F0ZVR5cGU6ICdhdmcnLFxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRvcjogJz09JyxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRWYWx1ZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbm90ZTogJycsXG4gICAgICAgICAgICAgICAgICAgIG1heFN0ZXA6IDNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZVN0cmF0ZWd5KGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuc3RyYXRlZ3lMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b2dnbGVTdHJhdGVneU1ldHJpYyhzdHJhdGVneUluZGV4LCBtZXRyaWMpIHtcbiAgICAgICAgICAgICAgICBsZXQgc3RyYXRlZ3kgPSB0aGlzLmNvbmZpZy5zdHJhdGVneUxpc3Rbc3RyYXRlZ3lJbmRleF07XG4gICAgICAgICAgICAgICAgaWYgKHN0cmF0ZWd5Lm1ldHJpYyA9PT0gbWV0cmljKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaWYgKG1ldHJpYyA9PT0gJ2FnZW50X2FsaXZlJykge1xuICAgICAgICAgICAgICAgICAgICBzdHJhdGVneS5hZ2dyZWdhdGVUeXBlID0gJ21heCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN0cmF0ZWd5Lm1ldHJpYyA9IG1ldHJpYztcbiAgICAgICAgICAgICAgICBzdHJhdGVneS50YWcgPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZUhvc3RFbnYoZW52KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZGVwbG95bWVudEluZm8uaG9zdEVudiA9IGVudjtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMuZmlsdGVyRGVwbG95KHRoaXMuY29uZmlnLmRlcGxveW1lbnRJbmZvLmNsdXN0ZXJOYW1lLCBlbnYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlQ2x1c3RlcihjbHVzdGVyTmFtZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRlcGxveW1lbnRJbmZvLmNsdXN0ZXJOYW1lID0gY2x1c3Rlck5hbWU7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0SW5zLmZpbHRlckRlcGxveShjbHVzdGVyTmFtZSwgdGhpcy5jb25maWcuZGVwbG95bWVudEluZm8uaG9zdEVudik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnZXRGb3JtYXJ0Q29uZmlnKCkge1xuICAgICAgICAgICAgICAgIGxldCBjb25maWcgPSB7fTtcbiAgICAgICAgICAgICAgICBjb25maWcudGVtcGxhdGVOYW1lID0gdGhpcy5jb25maWcudGVtcGxhdGVOYW1lO1xuICAgICAgICAgICAgICAgIGNvbmZpZy50ZW1wbGF0ZVR5cGUgPSB0aGlzLmNvbmZpZy50ZW1wbGF0ZVR5cGU7XG4gICAgICAgICAgICAgICAgY29uZmlnLmlkID0gdGhpcy5jb25maWcuaWQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoY29uZmlnLnRlbXBsYXRlVHlwZSA9PSAnaG9zdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLnRlbXBsYXRlVHlwZSA9IHRoaXMuY29uZmlnLnRlbXBsYXRlVHlwZTtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLmhvc3RHcm91cExpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLmhvc3RHcm91cExpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ob3N0R3JvdXBMaXN0W2ldLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcuaG9zdEdyb3VwTGlzdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRoaXMuaG9zdEdyb3VwTGlzdFtpXS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb25maWcudGVtcGxhdGVUeXBlID09ICdkZXBsb3knKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5kZXBsb3ltZW50SW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLmRlcGxveUxpc3RJbnMuZGVwbG95LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2x1c3Rlck5hbWU6IHRoaXMuY29uZmlnLmRlcGxveW1lbnRJbmZvLmNsdXN0ZXJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwbG95bWVudE5hbWU6IHRoaXMuZGVwbG95TGlzdElucy5kZXBsb3kubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RFbnY6IHRoaXMuY29uZmlnLmRlcGxveW1lbnRJbmZvLmhvc3RFbnZcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25maWcuc3RyYXRlZ3lMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc3RyYXRlZ3kgb2YgdGhpcy5jb25maWcuc3RyYXRlZ3lMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdTdHJhdGVneSA9IGFuZ3VsYXIuY29weShzdHJhdGVneSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdTdHJhdGVneS5tZXRyaWMgPT0gJ2FnZW50X2FsaXZlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RyYXRlZ3kucmlnaHRWYWx1ZSA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdTdHJhdGVneS5vcGVyYXRvciA9ICc8JztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3U3RyYXRlZ3kudGFnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3U3RyYXRlZ3kubWV0cmljID09ICdkaXNrX3BlcmNlbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RyYXRlZ3kudGFnID0gJ21vdW50PScgKyBuZXdTdHJhdGVneS50YWc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld1N0cmF0ZWd5Lm1ldHJpYy5pbmRleE9mKCdkaXNrJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RyYXRlZ3kudGFnID0gJ2RldmljZT0nICsgbmV3U3RyYXRlZ3kudGFnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdTdHJhdGVneS5tZXRyaWMuaW5kZXhPZignbmV0d29yaycpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0cmF0ZWd5LnRhZyA9ICdpZmFjZT0nICsgbmV3U3RyYXRlZ3kudGFnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5zdHJhdGVneUxpc3QucHVzaChuZXdTdHJhdGVneSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uZmlnLnVzZXJHcm91cExpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuZ3JvdXBMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ncm91cExpc3RbaV0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLnVzZXJHcm91cExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRoaXMuZ3JvdXBMaXN0W2ldLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25maWcuY2FsbGJhY2sgPSBhbmd1bGFyLmNvcHkodGhpcy5jb25maWcuY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNvbmZpZyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNyZWF0ZSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2FsYXJtU2VydmljZS5zZXREYXRhKHRoaXMuZ2V0Rm9ybWFydENvbmZpZygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1vZGlmeSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2FsYXJtU2VydmljZS51cGRhdGVEYXRhKHRoaXMuZ2V0Rm9ybWFydENvbmZpZygpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIC8vIGhvc3RHcm91cOa3u+WKoOS4u+aculxuICAgICAgICBjbGFzcyBOb2RlTGlzdCBleHRlbmRzICRkb21lTW9kZWwuU2VsZWN0TGlzdE1vZGVsIHtcblxuICAgICAgICAgICAgY29uc3RydWN0b3Iobm9kZUxpc3QsIGNsdXN0ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoJ25vZGVMaXN0Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQobm9kZUxpc3QsIGNsdXN0ZXJOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluaXQobm9kZUxpc3QsIGNsdXN0ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlTGlzdCA9IHRoaXMubm9kZUxpc3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghY2x1c3Rlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2x1c3Rlck5hbWUgPSB0aGlzLmNsdXN0ZXJOYW1lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIW5vZGVMaXN0IHx8ICFjbHVzdGVyTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlck5hbWUgPSBjbHVzdGVyTmFtZTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIG5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNlbGVjdGVkTm9kZSBvZiB0aGlzLnNlbGVjdGVkTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkTm9kZS5jbHVzdGVyID09PSBjbHVzdGVyTmFtZSAmJiBzZWxlY3RlZE5vZGUubmFtZSA9PT0gbm9kZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIW5vZGUuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3VwZXIuaW5pdChub2RlTGlzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0U2VsZWN0ZWRMaXN0KCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0FsbEl0ZW0oZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hlY2tBbGxJdGVtKGlzQ2hlY2tBbGwpIHtcbiAgICAgICAgICAgICAgICBzdXBlci5jaGVja0FsbEl0ZW0oaXNDaGVja0FsbCk7XG4gICAgICAgICAgICAgICAgaWYgKGlzQ2hlY2tBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLm5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlzRXhpc3QgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzZWxlY3RlZE5vZGUgb2YgdGhpcy5zZWxlY3RlZExpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2x1c3Rlck5hbWUgPT09IHNlbGVjdGVkTm9kZS5jbHVzdGVyICYmIG5vZGUubmFtZSA9PT0gc2VsZWN0ZWROb2RlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRXhpc3QgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0V4aXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbm9kZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXA6IG5vZGUuaXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHVzdGVyOiB0aGlzLmNsdXN0ZXJOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNlbGVjdGVkTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZE5vZGUgPSB0aGlzLnNlbGVjdGVkTGlzdFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jbHVzdGVyTmFtZSA9PT0gc2VsZWN0ZWROb2RlLmNsdXN0ZXIgJiYgbm9kZS5uYW1lID09PSBzZWxlY3RlZE5vZGUubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlQ2hlY2soaXRlbSwgaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHN1cGVyLnRvZ2dsZUNoZWNrKGl0ZW0sIGlzU2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgIGlmIChpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uY2x1c3RlciA9IHRoaXMuY2x1c3Rlck5hbWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXA6IGl0ZW0uaXAsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHVzdGVyOiBpdGVtLmNsdXN0ZXJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNlbGVjdGVkTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRMaXN0W2ldLm5hbWUgPT09IGl0ZW0ubmFtZSAmJiB0aGlzLnNlbGVjdGVkTGlzdFtpXS5jbHVzdGVyID09PSB0aGlzLmNsdXN0ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlU2VsZWN0ZWROb2RlKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5jbHVzdGVyID09PSB0aGlzLmNsdXN0ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ05vZGUgb2YgdGhpcy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNpZ05vZGUubmFtZSA9PT0gbm9kZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VwZXIudG9nZ2xlQ2hlY2soc2lnTm9kZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zZWxlY3RlZExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRMaXN0W2ldLm5hbWUgPT09IG5vZGUubmFtZSAmJiB0aGlzLnNlbGVjdGVkTGlzdFtpXS5jbHVzdGVyID09PSBub2RlLmNsdXN0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsdGVyV2l0aEtleShrZXl3b3Jkcykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzaWdJdGVtIG9mIHRoaXMubm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGV4aXN0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHNpZ0l0ZW0ua2V5RmlsdGVyID0gc2lnSXRlbS5uYW1lLmluZGV4T2Yoa2V5d29yZHMpICE9PSAtMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpZ0l0ZW0ua2V5RmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzZWxlY3RlZE5vZGUgb2YgdGhpcy5zZWxlY3RlZExpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWROb2RlLm5hbWUgPT09IHNpZ0l0ZW0ubmFtZSAmJiBzZWxlY3RlZE5vZGUuY2x1c3RlciA9PT0gdGhpcy5jbHVzdGVyTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWdJdGVtLmlzU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzaWdJdGVtLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWdJdGVtLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0NoZWNrQWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ0l0ZW0uaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBnZXRJbnN0YW5jZSA9ICRkb21lTW9kZWwuaW5zdGFuY2VzQ3JlYXRvcih7XG4gICAgICAgICAgICBOb2RlTGlzdDogTm9kZUxpc3QsXG4gICAgICAgICAgICBBbGFybVNlcnZpY2U6IEFsYXJtU2VydmljZSxcbiAgICAgICAgICAgIEhvc3RHcm91cFNlcnZpY2U6IEhvc3RHcm91cFNlcnZpY2UsXG4gICAgICAgICAgICBBbGFybVRlbXBsYXRlOiBBbGFybVRlbXBsYXRlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGFsYXJtRXZlbnRTZXJ2aWNlID0ge1xuICAgICAgICAgICAgZ2V0RGF0YTogKCkgPT4gJGh0dHAuZ2V0KCcvYXBpL2FsYXJtL2V2ZW50JyksXG4gICAgICAgICAgICBpZ25vcmU6IGRhdGEgPT4gJGh0dHAucG9zdCgnL2FwaS9hbGFybS9ldmVudC9pZ25vcmUnLCBkYXRhKVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ2V0SW5zdGFuY2U6IGdldEluc3RhbmNlLFxuICAgICAgICAgICAgYWxhcm1FdmVudFNlcnZpY2U6IGFsYXJtRXZlbnRTZXJ2aWNlLFxuICAgICAgICAgICAga2V5TWFwczoga2V5TWFwc1xuICAgICAgICB9O1xuICAgIH1dKTtcbn0pKHdpbmRvdy5kb21lQXBwKTsiXX0=
