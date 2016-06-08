'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @description: 报警管理Service
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

                var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(NodeList).call(this, 'nodeList'));

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

                    _get(Object.getPrototypeOf(NodeList.prototype), 'init', this).call(this, nodeList);
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
                    _get(Object.getPrototypeOf(NodeList.prototype), 'checkAllItem', this).call(this, isCheckAll);
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
                    _get(Object.getPrototypeOf(NodeList.prototype), 'toggleCheck', this).call(this, item, isSelected);
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
                                    _get(Object.getPrototypeOf(NodeList.prototype), 'toggleCheck', this).call(this, sigNode, false);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L2pzL3NlcnZpY2VzL2FsYXJtU2VydmljZS5lcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsQ0FBQyxVQUFDLE9BQUQsRUFBVSxTQUFWLEVBQXdCO0FBQ3JCLGlCQURxQjs7QUFFckIsUUFBSSxPQUFPLE9BQVAsS0FBbUIsV0FBbkIsRUFBZ0MsT0FBcEM7O0FBRUEsWUFBUSxPQUFSLENBQWdCLFlBQWhCLEVBQThCLENBQUMsWUFBRCxFQUFlLFdBQWYsRUFBNEIsYUFBNUIsRUFBMkMsY0FBM0MsRUFBMkQsT0FBM0QsRUFBb0UsYUFBcEUsRUFBbUYsSUFBbkYsRUFBeUYsT0FBekYsRUFBa0csVUFBVSxVQUFWLEVBQXNCLFNBQXRCLEVBQWlDLFdBQWpDLEVBQThDLFlBQTlDLEVBQTRELEtBQTVELEVBQW1FLFdBQW5FLEVBQWdGLEVBQWhGLEVBQW9GLEtBQXBGLEVBQTJGO0FBQ3ZOLFlBQU0sZUFBZSxTQUFmLFlBQWUsR0FBWTtBQUM3Qix1QkFBVyxZQUFYLENBQXdCLElBQXhCLENBQTZCLElBQTdCLEVBQW1DLHFCQUFuQyxFQUQ2QjtTQUFaLENBRGtNO0FBSXZOLFlBQU0sbUJBQW1CLFNBQW5CLGdCQUFtQixHQUFZO0FBQ2pDLHVCQUFXLFlBQVgsQ0FBd0IsSUFBeEIsQ0FBNkIsSUFBN0IsRUFBbUMsc0JBQW5DLEVBRGlDO0FBRWpDLGlCQUFLLE9BQUwsR0FBZSxVQUFDLEVBQUQsRUFBSyxRQUFMO3VCQUFrQixNQUFNLElBQU4sZ0NBQXdDLEVBQXhDLEVBQThDLFFBQVEsTUFBUixDQUFlLFFBQWYsQ0FBOUM7YUFBbEIsQ0FGa0I7QUFHakMsaUJBQUssVUFBTCxHQUFrQixVQUFDLEVBQUQsRUFBSyxNQUFMO3VCQUFnQixNQUFNLE1BQU4sZ0NBQTBDLFdBQU0sTUFBaEQ7YUFBaEIsQ0FIZTtTQUFaLENBSjhMO0FBU3ZOLFlBQU0saUJBQWlCLGFBQWEsV0FBYixDQUF5QixnQkFBekIsQ0FBakIsQ0FUaU47QUFVdk4s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dk4sWUFBTSxjQUFjLFdBQVcsZ0JBQVgsQ0FBNEI7QUFDNUMsc0JBQVUsUUFBVjtBQUNBLDBCQUFjLFlBQWQ7QUFDQSw4QkFBa0IsZ0JBQWxCO0FBQ0EsMkJBQWUsYUFBZjtTQUpnQixDQUFkLENBNWNpTjs7QUFtZHZOLFlBQU0sb0JBQW9CO0FBQ3RCLHFCQUFTO3VCQUFNLE1BQU0sR0FBTixDQUFVLGtCQUFWO2FBQU47QUFDVCxvQkFBUTt1QkFBUSxNQUFNLElBQU4sQ0FBVyx5QkFBWCxFQUFzQyxJQUF0QzthQUFSO1NBRk4sQ0FuZGlOO0FBdWR2TixlQUFPO0FBQ0gseUJBQWEsV0FBYjtBQUNBLCtCQUFtQixpQkFBbkI7QUFDQSxxQkFBUyxPQUFUO1NBSEosQ0F2ZHVOO0tBQTNGLENBQWhJLEVBSnFCO0NBQXhCLENBQUQsQ0FpZUcsT0FBTyxPQUFQLENBamVIIiwiZmlsZSI6ImluZGV4L2pzL3NlcnZpY2VzL2FsYXJtU2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBAZGVzY3JpcHRpb246IOaKpeitpueuoeeQhlNlcnZpY2VcbiAqL1xuXG4oKGRvbWVBcHAsIHVuZGVmaW5lZCkgPT4ge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBpZiAodHlwZW9mIGRvbWVBcHAgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XG5cbiAgICBkb21lQXBwLmZhY3RvcnkoJyRkb21lQWxhcm0nLCBbJyRkb21lTW9kZWwnLCAnJGRvbWVVc2VyJywgJyRkb21lRGVwbG95JywgJyRkb21lQ2x1c3RlcicsICckaHR0cCcsICckZG9tZVB1YmxpYycsICckcScsICckdXRpbCcsIGZ1bmN0aW9uICgkZG9tZU1vZGVsLCAkZG9tZVVzZXIsICRkb21lRGVwbG95LCAkZG9tZUNsdXN0ZXIsICRodHRwLCAkZG9tZVB1YmxpYywgJHEsICR1dGlsKSB7XG4gICAgICAgIGNvbnN0IEFsYXJtU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRkb21lTW9kZWwuU2VydmljZU1vZGVsLmNhbGwodGhpcywgJy9hcGkvYWxhcm0vdGVtcGxhdGUnKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgSG9zdEdyb3VwU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRkb21lTW9kZWwuU2VydmljZU1vZGVsLmNhbGwodGhpcywgJy9hcGkvYWxhcm0vaG9zdGdyb3VwJyk7XG4gICAgICAgICAgICB0aGlzLmFkZEhvc3QgPSAoaWQsIGhvc3RJbmZvKSA9PiAkaHR0cC5wb3N0KGAvYXBpL2FsYXJtL2hvc3Rncm91cC9iaW5kLyR7aWR9YCwgYW5ndWxhci50b0pzb24oaG9zdEluZm8pKTtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlSG9zdCA9IChpZCwgbm9kZUlkKSA9PiAkaHR0cC5kZWxldGUoYC9hcGkvYWxhcm0vaG9zdGdyb3VwL2JpbmQvJHtpZH0vJHtub2RlSWR9YCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGNsdXN0ZXJTZXJ2aWNlID0gJGRvbWVDbHVzdGVyLmdldEluc3RhbmNlKCdDbHVzdGVyU2VydmljZScpO1xuICAgICAgICBjb25zdCBfYWxhcm1TZXJ2aWNlID0gbmV3IEFsYXJtU2VydmljZSgpO1xuICAgICAgICBjb25zdCBrZXlNYXBzID0ge1xuICAgICAgICAgICAgbWV0cmljOiB7XG4gICAgICAgICAgICAgICAgY3B1X3BlcmNlbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJ0NQVeWNoOeUqOeOhycsXG4gICAgICAgICAgICAgICAgICAgIHVuaXQ6ICclJyxcbiAgICAgICAgICAgICAgICAgICAgYmVsb25nOiAnYWxsJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbWVtb3J5X3BlcmNlbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJ+WGheWtmOWNoOeUqOeOhycsXG4gICAgICAgICAgICAgICAgICAgIHVuaXQ6ICclJyxcbiAgICAgICAgICAgICAgICAgICAgYmVsb25nOiAnYWxsJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlza19wZXJjZW50OiB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICfno4Hnm5jljaDnlKjnjocnLFxuICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiAn5YiG5Yy6JyxcbiAgICAgICAgICAgICAgICAgICAgdW5pdDogJyUnLFxuICAgICAgICAgICAgICAgICAgICBiZWxvbmc6ICdob3N0J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlza19yZWFkOiB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICfno4Hnm5jor7vlj5YnLFxuICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiAn6K6+5aSHJyxcbiAgICAgICAgICAgICAgICAgICAgdW5pdDogJ0tCL3MnLFxuICAgICAgICAgICAgICAgICAgICBiZWxvbmc6ICdob3N0J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlza193cml0ZToge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn56OB55uY5YaZ5YWlJyxcbiAgICAgICAgICAgICAgICAgICAgdGFnTmFtZTogJ+iuvuWkhycsXG4gICAgICAgICAgICAgICAgICAgIHVuaXQ6ICdLQi9zJyxcbiAgICAgICAgICAgICAgICAgICAgYmVsb25nOiAnaG9zdCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG5ldHdvcmtfaW46IHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJ+e9kee7nOa1geWFpScsXG4gICAgICAgICAgICAgICAgICAgIHRhZ05hbWU6ICfnvZHljaEnLFxuICAgICAgICAgICAgICAgICAgICB1bml0OiAnS0IvcycsXG4gICAgICAgICAgICAgICAgICAgIGJlbG9uZzogJ2FsbCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG5ldHdvcmtfb3V0OiB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICfnvZHnu5zmtYHlh7onLFxuICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiAn572R5Y2hJyxcbiAgICAgICAgICAgICAgICAgICAgdW5pdDogJ0tCL3MnLFxuICAgICAgICAgICAgICAgICAgICBiZWxvbmc6ICdhbGwnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBhZ2VudF9hbGl2ZToge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnYWdlbnTlrZjmtLsnLFxuICAgICAgICAgICAgICAgICAgICBiZWxvbmc6ICdob3N0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhZ2dyZWdhdGVUeXBlOiB7XG4gICAgICAgICAgICAgICAgYXZnOiAn5bmz5Z2H5YC8JyxcbiAgICAgICAgICAgICAgICBtYXg6ICfmnIDlpKflgLwnLFxuICAgICAgICAgICAgICAgIG1pbjogJ+acgOWwj+WAvCcsXG4gICAgICAgICAgICAgICAgc3VtOiAn5ZKM5YC8J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFnZ3JlZ2F0ZVR5cGVBZ2VudDoge1xuICAgICAgICAgICAgICAgIG1heDogJ+WFqOmDqCcsXG4gICAgICAgICAgICAgICAgbWluOiAn6Iez5bCR5LiA5qyhJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjbGFzcyBBbGFybVRlbXBsYXRlIHtcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKGFsYXJtSW5mbykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5ob3N0R3JvdXBMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5rZXlNYXBzID0ga2V5TWFwcztcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95TGlzdElucyA9ICRkb21lRGVwbG95LmdldEluc3RhbmNlKCdEZXBsb3lMaXN0Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zID0gJGRvbWVQdWJsaWMuZ2V0TG9hZGluZ0luc3RhbmNlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdChhbGFybUluZm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5pdChhbGFybUluZm8pIHtcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KGFsYXJtSW5mbykpIHtcbiAgICAgICAgICAgICAgICAgICAgYWxhcm1JbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVUeXBlOiAnaG9zdCdcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc09iamVjdChhbGFybUluZm8uZGVwbG95bWVudEluZm8pKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsYXJtSW5mby5kZXBsb3ltZW50SW5mbyA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkoYWxhcm1JbmZvLnN0cmF0ZWd5TGlzdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYWxhcm1JbmZvLnN0cmF0ZWd5TGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KGFsYXJtSW5mby5jYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICAgICAgYWxhcm1JbmZvLmNhbGxiYWNrID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheShhbGFybUluZm8uaG9zdEdyb3VwTGlzdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYWxhcm1JbmZvLmhvc3RHcm91cExpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc3RyYXRlZ3kgb2YgYWxhcm1JbmZvLnN0cmF0ZWd5TGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RyYXRlZ3kubWV0cmljID09ICdkaXNrX3BlcmNlbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzdHJhdGVneS50YWcgPSAnbW91bnQ9L29wdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmF0ZWd5LnRhZyA9IHN0cmF0ZWd5LnRhZy5zdWJzdHJpbmcoNik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RyYXRlZ3kubWV0cmljLmluZGV4T2YoJ2Rpc2snKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0cmF0ZWd5LnRhZyA9ICdkZXZpY2U9c2RhJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyYXRlZ3kudGFnID0gc3RyYXRlZ3kudGFnLnN1YnN0cmluZyg3KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdHJhdGVneS5tZXRyaWMuaW5kZXhPZignbmV0d29yaycpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3RyYXRlZ3kudGFnID0gJ2lmYWNlPXNkYSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmF0ZWd5LnRhZyA9IHN0cmF0ZWd5LnRhZy5zdWJzdHJpbmcoNik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSBhbGFybUluZm87XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmlkID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5kZXBsb3ltZW50SW5mby5ob3N0RW52KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5kZXBsb3ltZW50SW5mby5ob3N0RW52ID0gJ1BST0QnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkU3RyYXRlZ3koKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0SG9zdEdyb3VwTGlzdCgpIHtcbiAgICAgICAgICAgICAgICBsZXQgaG9zdEdyb3VwU2VydmljZTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGluaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb25maWdIb3N0R3JvdXBMaXN0ID0gdGhpcy5jb25maWcuaG9zdEdyb3VwTGlzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzRmluZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ0hvc3RHcm91cExpc3QgJiYgY29uZmlnSG9zdEdyb3VwTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGhvc3RHcm91cCBvZiB0aGlzLmhvc3RHcm91cExpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0R3JvdXAuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLmhvc3RHcm91cExpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNGaW5kID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDAsIGwxID0gY29uZmlnSG9zdEdyb3VwTGlzdC5sZW5ndGg7IGogPCBsMTsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25maWdIb3N0R3JvdXBMaXN0W2pdLmlkID09PSB0aGlzLmhvc3RHcm91cExpc3RbaV0uaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRmluZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3RHcm91cExpc3RbaV0uaXNTZWxlY3RlZCA9IGlzRmluZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaG9zdEdyb3VwTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnaG9zdGdyb3VwJyk7XG4gICAgICAgICAgICAgICAgICAgIGhvc3RHcm91cFNlcnZpY2UgPSBuZXcgSG9zdEdyb3VwU2VydmljZSgpO1xuICAgICAgICAgICAgICAgICAgICBob3N0R3JvdXBTZXJ2aWNlLmdldERhdGEoKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaG9zdEdyb3VwTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+iOt+WPluS4u+acuue7hOS/oeaBr+Wksei0pe+8gScpO1xuICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCdob3N0Z3JvdXAnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5pdEdyb3VwTGlzdCgpIHtcbiAgICAgICAgICAgICAgICBsZXQgdXNlckdyb3VwTGlzdCA9IHRoaXMuY29uZmlnLnVzZXJHcm91cExpc3Q7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBpbml0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaXNGaW5kO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXVzZXJHcm91cExpc3QgfHwgdXNlckdyb3VwTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5ncm91cExpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91cExpc3RbaV0uaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLmdyb3VwTGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0ZpbmQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMCwgbDEgPSB1c2VyR3JvdXBMaXN0Lmxlbmd0aDsgaiA8IGwxOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZ3JvdXBMaXN0W2ldLmlkID09PSB1c2VyR3JvdXBMaXN0W2pdLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0ZpbmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91cExpc3RbaV0uaXNTZWxlY3RlZCA9IGlzRmluZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ3JvdXBMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdncm91cExpc3QnKTtcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVVc2VyLnVzZXJTZXJ2aWNlLmdldEdyb3VwKCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+iOt+WPlue7hOS/oeaBr+Wksei0pe+8gScpO1xuICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCdncm91cExpc3QnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluaXREZXBsb3lBbmRDbHVzdGVyTGlzdCgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlcGxveW1lbnRJbmZvID0gdGhpcy5jb25maWcuZGVwbG95bWVudEluZm87XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRlcGxveUxpc3RJbnMuZGVwbG95TGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ2RlcGxveScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKFskZG9tZURlcGxveS5kZXBsb3lTZXJ2aWNlLmdldExpc3QoKSwgY2x1c3RlclNlcnZpY2UuZ2V0RGF0YSgpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95TGlzdElucy5pbml0KHJlc1swXS5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlckxpc3QgPSByZXNbMV0uZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGVwbG95bWVudEluZm8uY2x1c3Rlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveW1lbnRJbmZvLmNsdXN0ZXJOYW1lID0gdGhpcy5jbHVzdGVyTGlzdFswXS5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVDbHVzdGVyKHRoaXMuY2x1c3Rlckxpc3RbMF0ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUhvc3RFbnYoZGVwbG95bWVudEluZm8uaG9zdEVudik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMuZGVwbG95LmlkID0gZGVwbG95bWVudEluZm8uaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMuZGVwbG95Lm5hbWUgPSBkZXBsb3ltZW50SW5mby5kZXBsb3ltZW50TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+iOt+WPluS/oeaBr+Wksei0pe+8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygnZGVwbG95Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUhvc3RFbnYoZGVwbG95bWVudEluZm8uaG9zdEVudik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMuZGVwbG95LmlkID0gZGVwbG95bWVudEluZm8uaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMuZGVwbG95Lm5hbWUgPSBkZXBsb3ltZW50SW5mby5kZXBsb3ltZW50TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBAcGFyYW0gdHlwZTogJ2hvc3QnLydkZXBsb3knXG4gICAgICAgICAgICB0b2dnbGVUZW1wbGF0ZVR5cGUodHlwZSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSB0aGlzLmNvbmZpZy50ZW1wbGF0ZVR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy50ZW1wbGF0ZVR5cGUgPSB0eXBlO1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnN0cmF0ZWd5TGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkU3RyYXRlZ3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZFN0cmF0ZWd5KCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnN0cmF0ZWd5TGlzdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWV0cmljOiAnY3B1X3BlcmNlbnQnLFxuICAgICAgICAgICAgICAgICAgICB0YWc6ICcnLFxuICAgICAgICAgICAgICAgICAgICBwb2ludE51bTogMyxcbiAgICAgICAgICAgICAgICAgICAgYWdncmVnYXRlVHlwZTogJ2F2ZycsXG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdG9yOiAnPT0nLFxuICAgICAgICAgICAgICAgICAgICByaWdodFZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBub3RlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgbWF4U3RlcDogM1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlU3RyYXRlZ3koaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5zdHJhdGVneUxpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZVN0cmF0ZWd5TWV0cmljKHN0cmF0ZWd5SW5kZXgsIG1ldHJpYykge1xuICAgICAgICAgICAgICAgIGxldCBzdHJhdGVneSA9IHRoaXMuY29uZmlnLnN0cmF0ZWd5TGlzdFtzdHJhdGVneUluZGV4XTtcbiAgICAgICAgICAgICAgICBpZiAoc3RyYXRlZ3kubWV0cmljID09PSBtZXRyaWMpIHJldHVybjtcbiAgICAgICAgICAgICAgICBpZiAobWV0cmljID09PSAnYWdlbnRfYWxpdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0cmF0ZWd5LmFnZ3JlZ2F0ZVR5cGUgPSAnbWF4JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3RyYXRlZ3kubWV0cmljID0gbWV0cmljO1xuICAgICAgICAgICAgICAgIHN0cmF0ZWd5LnRhZyA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlSG9zdEVudihlbnYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5kZXBsb3ltZW50SW5mby5ob3N0RW52ID0gZW52O1xuICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95TGlzdElucy5maWx0ZXJEZXBsb3kodGhpcy5jb25maWcuZGVwbG95bWVudEluZm8uY2x1c3Rlck5hbWUsIGVudik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b2dnbGVDbHVzdGVyKGNsdXN0ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZGVwbG95bWVudEluZm8uY2x1c3Rlck5hbWUgPSBjbHVzdGVyTmFtZTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMuZmlsdGVyRGVwbG95KGNsdXN0ZXJOYW1lLCB0aGlzLmNvbmZpZy5kZXBsb3ltZW50SW5mby5ob3N0RW52KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdldEZvcm1hcnRDb25maWcoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgICAgIGNvbmZpZy50ZW1wbGF0ZU5hbWUgPSB0aGlzLmNvbmZpZy50ZW1wbGF0ZU5hbWU7XG4gICAgICAgICAgICAgICAgY29uZmlnLnRlbXBsYXRlVHlwZSA9IHRoaXMuY29uZmlnLnRlbXBsYXRlVHlwZTtcbiAgICAgICAgICAgICAgICBjb25maWcuaWQgPSB0aGlzLmNvbmZpZy5pZDtcblxuICAgICAgICAgICAgICAgIGlmIChjb25maWcudGVtcGxhdGVUeXBlID09ICdob3N0Jykge1xuICAgICAgICAgICAgICAgICAgICBjb25maWcudGVtcGxhdGVUeXBlID0gdGhpcy5jb25maWcudGVtcGxhdGVUeXBlO1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuaG9zdEdyb3VwTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuaG9zdEdyb3VwTGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmhvc3RHcm91cExpc3RbaV0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5ob3N0R3JvdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5ob3N0R3JvdXBMaXN0W2ldLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbmZpZy50ZW1wbGF0ZVR5cGUgPT0gJ2RlcGxveScpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLmRlcGxveW1lbnRJbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRoaXMuZGVwbG95TGlzdElucy5kZXBsb3kuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHVzdGVyTmFtZTogdGhpcy5jb25maWcuZGVwbG95bWVudEluZm8uY2x1c3Rlck5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3ltZW50TmFtZTogdGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgaG9zdEVudjogdGhpcy5jb25maWcuZGVwbG95bWVudEluZm8uaG9zdEVudlxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbmZpZy5zdHJhdGVneUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzdHJhdGVneSBvZiB0aGlzLmNvbmZpZy5zdHJhdGVneUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1N0cmF0ZWd5ID0gYW5ndWxhci5jb3B5KHN0cmF0ZWd5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1N0cmF0ZWd5Lm1ldHJpYyA9PSAnYWdlbnRfYWxpdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdTdHJhdGVneS5yaWdodFZhbHVlID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0cmF0ZWd5Lm9wZXJhdG9yID0gJzwnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdTdHJhdGVneS50YWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdTdHJhdGVneS5tZXRyaWMgPT0gJ2Rpc2tfcGVyY2VudCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTdHJhdGVneS50YWcgPSAnbW91bnQ9JyArIG5ld1N0cmF0ZWd5LnRhZztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3U3RyYXRlZ3kubWV0cmljLmluZGV4T2YoJ2Rpc2snKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTdHJhdGVneS50YWcgPSAnZGV2aWNlPScgKyBuZXdTdHJhdGVneS50YWc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld1N0cmF0ZWd5Lm1ldHJpYy5pbmRleE9mKCduZXR3b3JrJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RyYXRlZ3kudGFnID0gJ2lmYWNlPScgKyBuZXdTdHJhdGVneS50YWc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLnN0cmF0ZWd5TGlzdC5wdXNoKG5ld1N0cmF0ZWd5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25maWcudXNlckdyb3VwTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5ncm91cExpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmdyb3VwTGlzdFtpXS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcudXNlckdyb3VwTGlzdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5ncm91cExpc3RbaV0uaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbmZpZy5jYWxsYmFjayA9IGFuZ3VsYXIuY29weSh0aGlzLmNvbmZpZy5jYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY29uZmlnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3JlYXRlKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYWxhcm1TZXJ2aWNlLnNldERhdGEodGhpcy5nZXRGb3JtYXJ0Q29uZmlnKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbW9kaWZ5KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYWxhcm1TZXJ2aWNlLnVwZGF0ZURhdGEodGhpcy5nZXRGb3JtYXJ0Q29uZmlnKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgLy8gaG9zdEdyb3Vw5re75Yqg5Li75py6XG4gICAgICAgIGNsYXNzIE5vZGVMaXN0IGV4dGVuZHMgJGRvbWVNb2RlbC5TZWxlY3RMaXN0TW9kZWwge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvcihub2RlTGlzdCwgY2x1c3Rlck5hbWUpIHtcbiAgICAgICAgICAgICAgICBzdXBlcignbm9kZUxpc3QnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdChub2RlTGlzdCwgY2x1c3Rlck5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5pdChub2RlTGlzdCwgY2x1c3Rlck5hbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVMaXN0ID0gdGhpcy5ub2RlTGlzdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFjbHVzdGVyTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyTmFtZSA9IHRoaXMuY2x1c3Rlck5hbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghbm9kZUxpc3QgfHwgIWNsdXN0ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyTmFtZSA9IGNsdXN0ZXJOYW1lO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgc2VsZWN0ZWROb2RlIG9mIHRoaXMuc2VsZWN0ZWRMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWROb2RlLmNsdXN0ZXIgPT09IGNsdXN0ZXJOYW1lICYmIHNlbGVjdGVkTm9kZS5uYW1lID09PSBub2RlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmlzU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghbm9kZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdXBlci5pbml0KG5vZGVMaXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluaXRTZWxlY3RlZExpc3QoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrQWxsSXRlbShmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGVja0FsbEl0ZW0oaXNDaGVja0FsbCkge1xuICAgICAgICAgICAgICAgIHN1cGVyLmNoZWNrQWxsSXRlbShpc0NoZWNrQWxsKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNDaGVja0FsbCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXNFeGlzdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNlbGVjdGVkTm9kZSBvZiB0aGlzLnNlbGVjdGVkTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jbHVzdGVyTmFtZSA9PT0gc2VsZWN0ZWROb2RlLmNsdXN0ZXIgJiYgbm9kZS5uYW1lID09PSBzZWxlY3RlZE5vZGUubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNFeGlzdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRXhpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBub2RlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpcDogbm9kZS5pcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsdXN0ZXI6IHRoaXMuY2x1c3Rlck5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLm5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2VsZWN0ZWRMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkTm9kZSA9IHRoaXMuc2VsZWN0ZWRMaXN0W2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsdXN0ZXJOYW1lID09PSBzZWxlY3RlZE5vZGUuY2x1c3RlciAmJiBub2RlLm5hbWUgPT09IHNlbGVjdGVkTm9kZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b2dnbGVDaGVjayhpdGVtLCBpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIudG9nZ2xlQ2hlY2soaXRlbSwgaXNTZWxlY3RlZCk7XG4gICAgICAgICAgICAgICAgaWYgKGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jbHVzdGVyID0gdGhpcy5jbHVzdGVyTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpcDogaXRlbS5pcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsdXN0ZXI6IGl0ZW0uY2x1c3RlclxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2VsZWN0ZWRMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZExpc3RbaV0ubmFtZSA9PT0gaXRlbS5uYW1lICYmIHRoaXMuc2VsZWN0ZWRMaXN0W2ldLmNsdXN0ZXIgPT09IHRoaXMuY2x1c3Rlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVTZWxlY3RlZE5vZGUobm9kZSkge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmNsdXN0ZXIgPT09IHRoaXMuY2x1c3Rlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgc2lnTm9kZSBvZiB0aGlzLm5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2lnTm9kZS5uYW1lID09PSBub2RlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdXBlci50b2dnbGVDaGVjayhzaWdOb2RlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNlbGVjdGVkTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZExpc3RbaV0ubmFtZSA9PT0gbm9kZS5uYW1lICYmIHRoaXMuc2VsZWN0ZWRMaXN0W2ldLmNsdXN0ZXIgPT09IG5vZGUuY2x1c3Rlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWx0ZXJXaXRoS2V5KGtleXdvcmRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ0l0ZW0gb2YgdGhpcy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZXhpc3QgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgc2lnSXRlbS5rZXlGaWx0ZXIgPSBzaWdJdGVtLm5hbWUuaW5kZXhPZihrZXl3b3JkcykgIT09IC0xO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2lnSXRlbS5rZXlGaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNlbGVjdGVkTm9kZSBvZiB0aGlzLnNlbGVjdGVkTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZE5vZGUubmFtZSA9PT0gc2lnSXRlbS5uYW1lICYmIHNlbGVjdGVkTm9kZS5jbHVzdGVyID09PSB0aGlzLmNsdXN0ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZ0l0ZW0uaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNpZ0l0ZW0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZ0l0ZW0uaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzQ2hlY2tBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2lnSXRlbS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGdldEluc3RhbmNlID0gJGRvbWVNb2RlbC5pbnN0YW5jZXNDcmVhdG9yKHtcbiAgICAgICAgICAgIE5vZGVMaXN0OiBOb2RlTGlzdCxcbiAgICAgICAgICAgIEFsYXJtU2VydmljZTogQWxhcm1TZXJ2aWNlLFxuICAgICAgICAgICAgSG9zdEdyb3VwU2VydmljZTogSG9zdEdyb3VwU2VydmljZSxcbiAgICAgICAgICAgIEFsYXJtVGVtcGxhdGU6IEFsYXJtVGVtcGxhdGVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgYWxhcm1FdmVudFNlcnZpY2UgPSB7XG4gICAgICAgICAgICBnZXREYXRhOiAoKSA9PiAkaHR0cC5nZXQoJy9hcGkvYWxhcm0vZXZlbnQnKSxcbiAgICAgICAgICAgIGlnbm9yZTogZGF0YSA9PiAkaHR0cC5wb3N0KCcvYXBpL2FsYXJtL2V2ZW50L2lnbm9yZScsIGRhdGEpXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBnZXRJbnN0YW5jZTogZ2V0SW5zdGFuY2UsXG4gICAgICAgICAgICBhbGFybUV2ZW50U2VydmljZTogYWxhcm1FdmVudFNlcnZpY2UsXG4gICAgICAgICAgICBrZXlNYXBzOiBrZXlNYXBzXG4gICAgICAgIH07XG4gICAgfV0pO1xufSkod2luZG93LmRvbWVBcHApOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
