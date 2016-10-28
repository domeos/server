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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L2pzL3NlcnZpY2VzL2FsYXJtU2VydmljZS5lcyJdLCJuYW1lcyI6WyJkb21lQXBwIiwidW5kZWZpbmVkIiwiZmFjdG9yeSIsIiRkb21lTW9kZWwiLCIkZG9tZVVzZXIiLCIkZG9tZURlcGxveSIsIiRkb21lQ2x1c3RlciIsIiRodHRwIiwiJGRvbWVQdWJsaWMiLCIkcSIsIiR1dGlsIiwiQWxhcm1TZXJ2aWNlIiwiU2VydmljZU1vZGVsIiwiY2FsbCIsIkhvc3RHcm91cFNlcnZpY2UiLCJhZGRIb3N0IiwiaWQiLCJob3N0SW5mbyIsInBvc3QiLCJhbmd1bGFyIiwidG9Kc29uIiwiZGVsZXRlSG9zdCIsIm5vZGVJZCIsImRlbGV0ZSIsImNsdXN0ZXJTZXJ2aWNlIiwiZ2V0SW5zdGFuY2UiLCJfYWxhcm1TZXJ2aWNlIiwia2V5TWFwcyIsIm1ldHJpYyIsImNwdV9wZXJjZW50IiwidGV4dCIsInVuaXQiLCJiZWxvbmciLCJtZW1vcnlfcGVyY2VudCIsImRpc2tfcGVyY2VudCIsInRhZ05hbWUiLCJkaXNrX3JlYWQiLCJkaXNrX3dyaXRlIiwibmV0d29ya19pbiIsIm5ldHdvcmtfb3V0IiwiYWdlbnRfYWxpdmUiLCJhZ2dyZWdhdGVUeXBlIiwiYXZnIiwibWF4IiwibWluIiwic3VtIiwiYWdncmVnYXRlVHlwZUFnZW50IiwiQWxhcm1UZW1wbGF0ZSIsImFsYXJtSW5mbyIsImNvbmZpZyIsImhvc3RHcm91cExpc3QiLCJncm91cExpc3QiLCJkZXBsb3lMaXN0SW5zIiwibG9hZGluZ0lucyIsImdldExvYWRpbmdJbnN0YW5jZSIsImNsdXN0ZXJMaXN0IiwiaW5pdCIsImlzT2JqZWN0IiwidGVtcGxhdGVUeXBlIiwiZGVwbG95bWVudEluZm8iLCJpc0FycmF5Iiwic3RyYXRlZ3lMaXN0IiwiY2FsbGJhY2siLCJzdHJhdGVneSIsInRhZyIsInN1YnN0cmluZyIsImluZGV4T2YiLCJob3N0RW52IiwiYWRkU3RyYXRlZ3kiLCJob3N0R3JvdXBTZXJ2aWNlIiwiY29uZmlnSG9zdEdyb3VwTGlzdCIsImlzRmluZCIsImxlbmd0aCIsImhvc3RHcm91cCIsImlzU2VsZWN0ZWQiLCJpIiwibCIsImoiLCJsMSIsInN0YXJ0TG9hZGluZyIsImdldERhdGEiLCJ0aGVuIiwicmVzIiwiZGF0YSIsInJlc3VsdCIsIm9wZW5XYXJuaW5nIiwiZmluYWxseSIsImZpbmlzaExvYWRpbmciLCJ1c2VyR3JvdXBMaXN0IiwidXNlclNlcnZpY2UiLCJnZXRHcm91cCIsImRlcGxveUxpc3QiLCJhbGwiLCJkZXBsb3lTZXJ2aWNlIiwiZ2V0TGlzdCIsImNsdXN0ZXJOYW1lIiwibmFtZSIsInRvZ2dsZUNsdXN0ZXIiLCJ0b2dnbGVIb3N0RW52IiwiZGVwbG95IiwiZGVwbG95bWVudE5hbWUiLCJ0eXBlIiwicHVzaCIsInBvaW50TnVtIiwib3BlcmF0b3IiLCJyaWdodFZhbHVlIiwibm90ZSIsIm1heFN0ZXAiLCJpbmRleCIsInNwbGljZSIsInN0cmF0ZWd5SW5kZXgiLCJlbnYiLCJmaWx0ZXJEZXBsb3kiLCJ0ZW1wbGF0ZU5hbWUiLCJuZXdTdHJhdGVneSIsImNvcHkiLCJjb25zb2xlIiwibG9nIiwic2V0RGF0YSIsImdldEZvcm1hcnRDb25maWciLCJ1cGRhdGVEYXRhIiwiTm9kZUxpc3QiLCJub2RlTGlzdCIsInNlbGVjdGVkTGlzdCIsIm5vZGUiLCJzZWxlY3RlZE5vZGUiLCJjbHVzdGVyIiwiY2hlY2tBbGxJdGVtIiwiaXNDaGVja0FsbCIsImlzRXhpc3QiLCJpcCIsIml0ZW0iLCJzaWdOb2RlIiwia2V5d29yZHMiLCJzZWxlY3RlZENvdW50Iiwic2lnSXRlbSIsImV4aXN0Iiwia2V5RmlsdGVyIiwiU2VsZWN0TGlzdE1vZGVsIiwiaW5zdGFuY2VzQ3JlYXRvciIsImFsYXJtRXZlbnRTZXJ2aWNlIiwiZ2V0IiwiaWdub3JlIiwid2luZG93Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7QUFLQSxDQUFDLFVBQUNBLE9BQUQsRUFBVUMsU0FBVixFQUF3QjtBQUNyQjs7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QWplRCxFQWllR29ILE9BQU8vSSxPQWplViIsImZpbGUiOiJpbmRleC9qcy9zZXJ2aWNlcy9hbGFybVNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBAYXV0aG9yIENoYW5kcmFMZWVcclxuICogQGRlc2NyaXB0aW9uIOaKpeitpuacjeWKoVxyXG4gKi9cclxuXHJcbigoZG9tZUFwcCwgdW5kZWZpbmVkKSA9PiB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBpZiAodHlwZW9mIGRvbWVBcHAgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XHJcblxyXG4gICAgZG9tZUFwcC5mYWN0b3J5KCckZG9tZUFsYXJtJywgWyckZG9tZU1vZGVsJywgJyRkb21lVXNlcicsICckZG9tZURlcGxveScsICckZG9tZUNsdXN0ZXInLCAnJGh0dHAnLCAnJGRvbWVQdWJsaWMnLCAnJHEnLCAnJHV0aWwnLCBmdW5jdGlvbiAoJGRvbWVNb2RlbCwgJGRvbWVVc2VyLCAkZG9tZURlcGxveSwgJGRvbWVDbHVzdGVyLCAkaHR0cCwgJGRvbWVQdWJsaWMsICRxLCAkdXRpbCkge1xyXG4gICAgICAgIGNvbnN0IEFsYXJtU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJGRvbWVNb2RlbC5TZXJ2aWNlTW9kZWwuY2FsbCh0aGlzLCAnL2FwaS9hbGFybS90ZW1wbGF0ZScpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgSG9zdEdyb3VwU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJGRvbWVNb2RlbC5TZXJ2aWNlTW9kZWwuY2FsbCh0aGlzLCAnL2FwaS9hbGFybS9ob3N0Z3JvdXAnKTtcclxuICAgICAgICAgICAgdGhpcy5hZGRIb3N0ID0gKGlkLCBob3N0SW5mbykgPT4gJGh0dHAucG9zdChgL2FwaS9hbGFybS9ob3N0Z3JvdXAvYmluZC8ke2lkfWAsIGFuZ3VsYXIudG9Kc29uKGhvc3RJbmZvKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlSG9zdCA9IChpZCwgbm9kZUlkKSA9PiAkaHR0cC5kZWxldGUoYC9hcGkvYWxhcm0vaG9zdGdyb3VwL2JpbmQvJHtpZH0vJHtub2RlSWR9YCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBjbHVzdGVyU2VydmljZSA9ICRkb21lQ2x1c3Rlci5nZXRJbnN0YW5jZSgnQ2x1c3RlclNlcnZpY2UnKTtcclxuICAgICAgICBjb25zdCBfYWxhcm1TZXJ2aWNlID0gbmV3IEFsYXJtU2VydmljZSgpO1xyXG4gICAgICAgIGNvbnN0IGtleU1hcHMgPSB7XHJcbiAgICAgICAgICAgIG1ldHJpYzoge1xyXG4gICAgICAgICAgICAgICAgY3B1X3BlcmNlbnQ6IHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnQ1BV5Y2g55So546HJyxcclxuICAgICAgICAgICAgICAgICAgICB1bml0OiAnJScsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVsb25nOiAnYWxsJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG1lbW9yeV9wZXJjZW50OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJ+WGheWtmOWNoOeUqOeOhycsXHJcbiAgICAgICAgICAgICAgICAgICAgdW5pdDogJyUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJlbG9uZzogJ2FsbCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkaXNrX3BlcmNlbnQ6IHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn56OB55uY5Y2g55So546HJyxcclxuICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiAn5YiG5Yy6JyxcclxuICAgICAgICAgICAgICAgICAgICB1bml0OiAnJScsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVsb25nOiAnaG9zdCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkaXNrX3JlYWQ6IHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn56OB55uY6K+75Y+WJyxcclxuICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiAn6K6+5aSHJyxcclxuICAgICAgICAgICAgICAgICAgICB1bml0OiAnS0IvcycsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVsb25nOiAnaG9zdCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkaXNrX3dyaXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJ+ejgeebmOWGmeWFpScsXHJcbiAgICAgICAgICAgICAgICAgICAgdGFnTmFtZTogJ+iuvuWkhycsXHJcbiAgICAgICAgICAgICAgICAgICAgdW5pdDogJ0tCL3MnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJlbG9uZzogJ2hvc3QnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbmV0d29ya19pbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICfnvZHnu5zmtYHlhaUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRhZ05hbWU6ICfnvZHljaEnLFxyXG4gICAgICAgICAgICAgICAgICAgIHVuaXQ6ICdLQi9zJyxcclxuICAgICAgICAgICAgICAgICAgICBiZWxvbmc6ICdhbGwnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbmV0d29ya19vdXQ6IHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn572R57uc5rWB5Ye6JyxcclxuICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiAn572R5Y2hJyxcclxuICAgICAgICAgICAgICAgICAgICB1bml0OiAnS0IvcycsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVsb25nOiAnYWxsJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGFnZW50X2FsaXZlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJ2FnZW505a2Y5rS7JyxcclxuICAgICAgICAgICAgICAgICAgICBiZWxvbmc6ICdob3N0J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZ2dyZWdhdGVUeXBlOiB7XHJcbiAgICAgICAgICAgICAgICBhdmc6ICflubPlnYflgLwnLFxyXG4gICAgICAgICAgICAgICAgbWF4OiAn5pyA5aSn5YC8JyxcclxuICAgICAgICAgICAgICAgIG1pbjogJ+acgOWwj+WAvCcsXHJcbiAgICAgICAgICAgICAgICBzdW06ICflkozlgLwnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGFnZ3JlZ2F0ZVR5cGVBZ2VudDoge1xyXG4gICAgICAgICAgICAgICAgbWF4OiAn5YWo6YOoJyxcclxuICAgICAgICAgICAgICAgIG1pbjogJ+iHs+WwkeS4gOasoSdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY2xhc3MgQWxhcm1UZW1wbGF0ZSB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKGFsYXJtSW5mbykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7fTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaG9zdEdyb3VwTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlNYXBzID0ga2V5TWFwcztcclxuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMgPSAkZG9tZURlcGxveS5nZXRJbnN0YW5jZSgnRGVwbG95TGlzdCcpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zID0gJGRvbWVQdWJsaWMuZ2V0TG9hZGluZ0luc3RhbmNlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsdXN0ZXJMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoYWxhcm1JbmZvKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbml0KGFsYXJtSW5mbykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc09iamVjdChhbGFybUluZm8pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxhcm1JbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVR5cGU6ICdob3N0J1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KGFsYXJtSW5mby5kZXBsb3ltZW50SW5mbykpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGFybUluZm8uZGVwbG95bWVudEluZm8gPSB7fTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheShhbGFybUluZm8uc3RyYXRlZ3lMaXN0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsYXJtSW5mby5zdHJhdGVneUxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNPYmplY3QoYWxhcm1JbmZvLmNhbGxiYWNrKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsYXJtSW5mby5jYWxsYmFjayA9IHt9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KGFsYXJtSW5mby5ob3N0R3JvdXBMaXN0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsYXJtSW5mby5ob3N0R3JvdXBMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzdHJhdGVneSBvZiBhbGFybUluZm8uc3RyYXRlZ3lMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0cmF0ZWd5Lm1ldHJpYyA9PSAnZGlza19wZXJjZW50Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzdHJhdGVneS50YWcgPSAnbW91bnQ9L29wdCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyYXRlZ3kudGFnID0gc3RyYXRlZ3kudGFnLnN1YnN0cmluZyg2KTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0cmF0ZWd5Lm1ldHJpYy5pbmRleE9mKCdkaXNrJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0cmF0ZWd5LnRhZyA9ICdkZXZpY2U9c2RhJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJhdGVneS50YWcgPSBzdHJhdGVneS50YWcuc3Vic3RyaW5nKDcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RyYXRlZ3kubWV0cmljLmluZGV4T2YoJ25ldHdvcmsnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3RyYXRlZ3kudGFnID0gJ2lmYWNlPXNkYSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyYXRlZ3kudGFnID0gc3RyYXRlZ3kudGFnLnN1YnN0cmluZyg2KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IGFsYXJtSW5mbztcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5pZCA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5kZXBsb3ltZW50SW5mby5ob3N0RW52KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRlcGxveW1lbnRJbmZvLmhvc3RFbnYgPSAnUFJPRCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkU3RyYXRlZ3koKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbml0SG9zdEdyb3VwTGlzdCgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBob3N0R3JvdXBTZXJ2aWNlO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGluaXQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbmZpZ0hvc3RHcm91cExpc3QgPSB0aGlzLmNvbmZpZy5ob3N0R3JvdXBMaXN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0ZpbmQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ0hvc3RHcm91cExpc3QgJiYgY29uZmlnSG9zdEdyb3VwTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaG9zdEdyb3VwIG9mIHRoaXMuaG9zdEdyb3VwTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdEdyb3VwLmlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5ob3N0R3JvdXBMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNGaW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMCwgbDEgPSBjb25maWdIb3N0R3JvdXBMaXN0Lmxlbmd0aDsgaiA8IGwxOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnSG9zdEdyb3VwTGlzdFtqXS5pZCA9PT0gdGhpcy5ob3N0R3JvdXBMaXN0W2ldLmlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRmluZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaG9zdEdyb3VwTGlzdFtpXS5pc1NlbGVjdGVkID0gaXNGaW5kO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhvc3RHcm91cExpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnaG9zdGdyb3VwJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaG9zdEdyb3VwU2VydmljZSA9IG5ldyBIb3N0R3JvdXBTZXJ2aWNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaG9zdEdyb3VwU2VydmljZS5nZXREYXRhKCkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaG9zdEdyb3VwTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+iOt+WPluS4u+acuue7hOS/oeaBr+Wksei0pe+8gScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygnaG9zdGdyb3VwJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5pdEdyb3VwTGlzdCgpIHtcclxuICAgICAgICAgICAgICAgIGxldCB1c2VyR3JvdXBMaXN0ID0gdGhpcy5jb25maWcudXNlckdyb3VwTGlzdDtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbml0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpc0ZpbmQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF1c2VyR3JvdXBMaXN0IHx8IHVzZXJHcm91cExpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5ncm91cExpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwTGlzdFtpXS5pc1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuZ3JvdXBMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNGaW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMCwgbDEgPSB1c2VyR3JvdXBMaXN0Lmxlbmd0aDsgaiA8IGwxOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ncm91cExpc3RbaV0uaWQgPT09IHVzZXJHcm91cExpc3Rbal0uaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNGaW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91cExpc3RbaV0uaXNTZWxlY3RlZCA9IGlzRmluZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ncm91cExpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnZ3JvdXBMaXN0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVVc2VyLnVzZXJTZXJ2aWNlLmdldEdyb3VwKCkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn6I635Y+W57uE5L+h5oGv5aSx6LSl77yBJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCdncm91cExpc3QnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluaXREZXBsb3lBbmRDbHVzdGVyTGlzdCgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGVwbG95bWVudEluZm8gPSB0aGlzLmNvbmZpZy5kZXBsb3ltZW50SW5mbztcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ2RlcGxveScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwoWyRkb21lRGVwbG95LmRlcGxveVNlcnZpY2UuZ2V0TGlzdCgpLCBjbHVzdGVyU2VydmljZS5nZXREYXRhKCldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95TGlzdElucy5pbml0KHJlc1swXS5kYXRhLnJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdCA9IHJlc1sxXS5kYXRhLnJlc3VsdCB8fCBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRlcGxveW1lbnRJbmZvLmNsdXN0ZXJOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveW1lbnRJbmZvLmNsdXN0ZXJOYW1lID0gdGhpcy5jbHVzdGVyTGlzdFswXS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUNsdXN0ZXIodGhpcy5jbHVzdGVyTGlzdFswXS5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUhvc3RFbnYoZGVwbG95bWVudEluZm8uaG9zdEVudik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95TGlzdElucy5kZXBsb3kuaWQgPSBkZXBsb3ltZW50SW5mby5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveS5uYW1lID0gZGVwbG95bWVudEluZm8uZGVwbG95bWVudE5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfojrflj5bkv6Hmga/lpLHotKXvvIEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCdkZXBsb3knKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlSG9zdEVudihkZXBsb3ltZW50SW5mby5ob3N0RW52KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveS5pZCA9IGRlcGxveW1lbnRJbmZvLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMuZGVwbG95Lm5hbWUgPSBkZXBsb3ltZW50SW5mby5kZXBsb3ltZW50TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBAcGFyYW0gdHlwZTogJ2hvc3QnLydkZXBsb3knXHJcbiAgICAgICAgICAgIHRvZ2dsZVRlbXBsYXRlVHlwZSh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gdGhpcy5jb25maWcudGVtcGxhdGVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcudGVtcGxhdGVUeXBlID0gdHlwZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnN0cmF0ZWd5TGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRTdHJhdGVneSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFkZFN0cmF0ZWd5KCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuc3RyYXRlZ3lMaXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldHJpYzogJ2NwdV9wZXJjZW50JyxcclxuICAgICAgICAgICAgICAgICAgICB0YWc6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvaW50TnVtOiAzLFxyXG4gICAgICAgICAgICAgICAgICAgIGFnZ3JlZ2F0ZVR5cGU6ICdhdmcnLFxyXG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdG9yOiAnPT0nLFxyXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0VmFsdWU6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgbm90ZTogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4U3RlcDogM1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVsZXRlU3RyYXRlZ3koaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnN0cmF0ZWd5TGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRvZ2dsZVN0cmF0ZWd5TWV0cmljKHN0cmF0ZWd5SW5kZXgsIG1ldHJpYykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHN0cmF0ZWd5ID0gdGhpcy5jb25maWcuc3RyYXRlZ3lMaXN0W3N0cmF0ZWd5SW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0cmF0ZWd5Lm1ldHJpYyA9PT0gbWV0cmljKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBpZiAobWV0cmljID09PSAnYWdlbnRfYWxpdmUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyYXRlZ3kuYWdncmVnYXRlVHlwZSA9ICdtYXgnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc3RyYXRlZ3kubWV0cmljID0gbWV0cmljO1xyXG4gICAgICAgICAgICAgICAgc3RyYXRlZ3kudGFnID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG9nZ2xlSG9zdEVudihlbnYpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRlcGxveW1lbnRJbmZvLmhvc3RFbnYgPSBlbnY7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMuZmlsdGVyRGVwbG95KHRoaXMuY29uZmlnLmRlcGxveW1lbnRJbmZvLmNsdXN0ZXJOYW1lLCBlbnYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRvZ2dsZUNsdXN0ZXIoY2x1c3Rlck5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRlcGxveW1lbnRJbmZvLmNsdXN0ZXJOYW1lID0gY2x1c3Rlck5hbWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMuZmlsdGVyRGVwbG95KGNsdXN0ZXJOYW1lLCB0aGlzLmNvbmZpZy5kZXBsb3ltZW50SW5mby5ob3N0RW52KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBnZXRGb3JtYXJ0Q29uZmlnKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbmZpZyA9IHt9O1xyXG4gICAgICAgICAgICAgICAgY29uZmlnLnRlbXBsYXRlTmFtZSA9IHRoaXMuY29uZmlnLnRlbXBsYXRlTmFtZTtcclxuICAgICAgICAgICAgICAgIGNvbmZpZy50ZW1wbGF0ZVR5cGUgPSB0aGlzLmNvbmZpZy50ZW1wbGF0ZVR5cGU7XHJcbiAgICAgICAgICAgICAgICBjb25maWcuaWQgPSB0aGlzLmNvbmZpZy5pZDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlnLnRlbXBsYXRlVHlwZSA9PSAnaG9zdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25maWcudGVtcGxhdGVUeXBlID0gdGhpcy5jb25maWcudGVtcGxhdGVUeXBlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5ob3N0R3JvdXBMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLmhvc3RHcm91cExpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmhvc3RHcm91cExpc3RbaV0uaXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLmhvc3RHcm91cExpc3QucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRoaXMuaG9zdEdyb3VwTGlzdFtpXS5pZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbmZpZy50ZW1wbGF0ZVR5cGUgPT0gJ2RlcGxveScpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25maWcuZGVwbG95bWVudEluZm8gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLmRlcGxveUxpc3RJbnMuZGVwbG95LmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHVzdGVyTmFtZTogdGhpcy5jb25maWcuZGVwbG95bWVudEluZm8uY2x1c3Rlck5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveW1lbnROYW1lOiB0aGlzLmRlcGxveUxpc3RJbnMuZGVwbG95Lm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RFbnY6IHRoaXMuY29uZmlnLmRlcGxveW1lbnRJbmZvLmhvc3RFbnZcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbmZpZy5zdHJhdGVneUxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHN0cmF0ZWd5IG9mIHRoaXMuY29uZmlnLnN0cmF0ZWd5TGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdTdHJhdGVneSA9IGFuZ3VsYXIuY29weShzdHJhdGVneSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1N0cmF0ZWd5Lm1ldHJpYyA9PSAnYWdlbnRfYWxpdmUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0cmF0ZWd5LnJpZ2h0VmFsdWUgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdTdHJhdGVneS5vcGVyYXRvciA9ICc8JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1N0cmF0ZWd5LnRhZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3U3RyYXRlZ3kubWV0cmljID09ICdkaXNrX3BlcmNlbnQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTdHJhdGVneS50YWcgPSAnbW91bnQ9JyArIG5ld1N0cmF0ZWd5LnRhZztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdTdHJhdGVneS5tZXRyaWMuaW5kZXhPZignZGlzaycpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RyYXRlZ3kudGFnID0gJ2RldmljZT0nICsgbmV3U3RyYXRlZ3kudGFnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld1N0cmF0ZWd5Lm1ldHJpYy5pbmRleE9mKCduZXR3b3JrJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTdHJhdGVneS50YWcgPSAnaWZhY2U9JyArIG5ld1N0cmF0ZWd5LnRhZztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb25maWcuc3RyYXRlZ3lMaXN0LnB1c2gobmV3U3RyYXRlZ3kpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbmZpZy51c2VyR3JvdXBMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuZ3JvdXBMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmdyb3VwTGlzdFtpXS5pc1NlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy51c2VyR3JvdXBMaXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRoaXMuZ3JvdXBMaXN0W2ldLmlkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbmZpZy5jYWxsYmFjayA9IGFuZ3VsYXIuY29weSh0aGlzLmNvbmZpZy5jYWxsYmFjayk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjb25maWcpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjcmVhdGUoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gX2FsYXJtU2VydmljZS5zZXREYXRhKHRoaXMuZ2V0Rm9ybWFydENvbmZpZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtb2RpZnkoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gX2FsYXJtU2VydmljZS51cGRhdGVEYXRhKHRoaXMuZ2V0Rm9ybWFydENvbmZpZygpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaG9zdEdyb3Vw5re75Yqg5Li75py6XHJcbiAgICAgICAgY2xhc3MgTm9kZUxpc3QgZXh0ZW5kcyAkZG9tZU1vZGVsLlNlbGVjdExpc3RNb2RlbCB7XHJcblxyXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvcihub2RlTGlzdCwgY2x1c3Rlck5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHN1cGVyKCdub2RlTGlzdCcpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdChub2RlTGlzdCwgY2x1c3Rlck5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluaXQobm9kZUxpc3QsIGNsdXN0ZXJOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW5vZGVMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZUxpc3QgPSB0aGlzLm5vZGVMaXN0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFjbHVzdGVyTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJOYW1lID0gdGhpcy5jbHVzdGVyTmFtZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghbm9kZUxpc3QgfHwgIWNsdXN0ZXJOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyTmFtZSA9IGNsdXN0ZXJOYW1lO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBub2RlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNlbGVjdGVkTm9kZSBvZiB0aGlzLnNlbGVjdGVkTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWROb2RlLmNsdXN0ZXIgPT09IGNsdXN0ZXJOYW1lICYmIHNlbGVjdGVkTm9kZS5uYW1lID09PSBub2RlLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaXNTZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW5vZGUuaXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzdXBlci5pbml0KG5vZGVMaXN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbml0U2VsZWN0ZWRMaXN0KCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tBbGxJdGVtKGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjaGVja0FsbEl0ZW0oaXNDaGVja0FsbCkge1xyXG4gICAgICAgICAgICAgICAgc3VwZXIuY2hlY2tBbGxJdGVtKGlzQ2hlY2tBbGwpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzQ2hlY2tBbGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlzRXhpc3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNlbGVjdGVkTm9kZSBvZiB0aGlzLnNlbGVjdGVkTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsdXN0ZXJOYW1lID09PSBzZWxlY3RlZE5vZGUuY2x1c3RlciAmJiBub2RlLm5hbWUgPT09IHNlbGVjdGVkTm9kZS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRXhpc3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRXhpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlzdC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbm9kZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpcDogbm9kZS5pcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2x1c3RlcjogdGhpcy5jbHVzdGVyTmFtZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNlbGVjdGVkTGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkTm9kZSA9IHRoaXMuc2VsZWN0ZWRMaXN0W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2x1c3Rlck5hbWUgPT09IHNlbGVjdGVkTm9kZS5jbHVzdGVyICYmIG5vZGUubmFtZSA9PT0gc2VsZWN0ZWROb2RlLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlzdC5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRvZ2dsZUNoZWNrKGl0ZW0sIGlzU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHN1cGVyLnRvZ2dsZUNoZWNrKGl0ZW0sIGlzU2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmNsdXN0ZXIgPSB0aGlzLmNsdXN0ZXJOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlwOiBpdGVtLmlwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHVzdGVyOiBpdGVtLmNsdXN0ZXJcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNlbGVjdGVkTGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZExpc3RbaV0ubmFtZSA9PT0gaXRlbS5uYW1lICYmIHRoaXMuc2VsZWN0ZWRMaXN0W2ldLmNsdXN0ZXIgPT09IHRoaXMuY2x1c3Rlck5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0LnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZVNlbGVjdGVkTm9kZShub2RlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5jbHVzdGVyID09PSB0aGlzLmNsdXN0ZXJOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgc2lnTm9kZSBvZiB0aGlzLm5vZGVMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaWdOb2RlLm5hbWUgPT09IG5vZGUubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VwZXIudG9nZ2xlQ2hlY2soc2lnTm9kZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2VsZWN0ZWRMaXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRMaXN0W2ldLm5hbWUgPT09IG5vZGUubmFtZSAmJiB0aGlzLnNlbGVjdGVkTGlzdFtpXS5jbHVzdGVyID09PSBub2RlLmNsdXN0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3Quc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZmlsdGVyV2l0aEtleShrZXl3b3Jkcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzaWdJdGVtIG9mIHRoaXMubm9kZUxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZXhpc3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBzaWdJdGVtLmtleUZpbHRlciA9IHNpZ0l0ZW0ubmFtZS5pbmRleE9mKGtleXdvcmRzKSAhPT0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpZ0l0ZW0ua2V5RmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNlbGVjdGVkTm9kZSBvZiB0aGlzLnNlbGVjdGVkTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkTm9kZS5uYW1lID09PSBzaWdJdGVtLm5hbWUgJiYgc2VsZWN0ZWROb2RlLmNsdXN0ZXIgPT09IHRoaXMuY2x1c3Rlck5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWdJdGVtLmlzU2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc2lnSXRlbS5pc1NlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWdJdGVtLmlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzQ2hlY2tBbGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ0l0ZW0uaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGdldEluc3RhbmNlID0gJGRvbWVNb2RlbC5pbnN0YW5jZXNDcmVhdG9yKHtcclxuICAgICAgICAgICAgTm9kZUxpc3Q6IE5vZGVMaXN0LFxyXG4gICAgICAgICAgICBBbGFybVNlcnZpY2U6IEFsYXJtU2VydmljZSxcclxuICAgICAgICAgICAgSG9zdEdyb3VwU2VydmljZTogSG9zdEdyb3VwU2VydmljZSxcclxuICAgICAgICAgICAgQWxhcm1UZW1wbGF0ZTogQWxhcm1UZW1wbGF0ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBhbGFybUV2ZW50U2VydmljZSA9IHtcclxuICAgICAgICAgICAgZ2V0RGF0YTogKCkgPT4gJGh0dHAuZ2V0KCcvYXBpL2FsYXJtL2V2ZW50JyksXHJcbiAgICAgICAgICAgIGlnbm9yZTogZGF0YSA9PiAkaHR0cC5wb3N0KCcvYXBpL2FsYXJtL2V2ZW50L2lnbm9yZScsIGRhdGEpXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRJbnN0YW5jZTogZ2V0SW5zdGFuY2UsXHJcbiAgICAgICAgICAgIGFsYXJtRXZlbnRTZXJ2aWNlOiBhbGFybUV2ZW50U2VydmljZSxcclxuICAgICAgICAgICAga2V5TWFwczoga2V5TWFwc1xyXG4gICAgICAgIH07XHJcbiAgICB9XSk7XHJcbn0pKHdpbmRvdy5kb21lQXBwKTsiXX0=
