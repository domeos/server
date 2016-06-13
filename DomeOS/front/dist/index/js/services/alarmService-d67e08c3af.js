'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

domeApp.factory('$domeAlarm', ['$domeModel', '$domeUser', '$domeDeploy', '$domeCluster', '$http', '$domePublic', '$q', function ($domeModel, $domeUser, $domeDeploy, $domeCluster, $http, $domePublic, $q) {
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
                if (!alarmInfo) {
                    alarmInfo = {
                        templateType: 'host'
                    };
                }
                if (!alarmInfo.deploymentInfo) {
                    alarmInfo.deploymentInfo = {};
                }
                if (!alarmInfo.strategyList) {
                    alarmInfo.strategyList = [];
                }
                if (!alarmInfo.callback) {
                    alarmInfo.callback = {};
                }
                if (!alarmInfo.hostGroupList) {
                    alarmInfo.hostGroupList = [];
                }
                for (var i = 0; i < alarmInfo.strategyList.length; i++) {
                    var strategy = alarmInfo.strategyList[i];
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
                this.config = alarmInfo;
                if (this.config.id === undefined) {
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
                        i = 0,
                        j = 0,
                        isFind = void 0;
                    if (configHostGroupList && configHostGroupList.length === 0) {
                        for (i = 0; i < _this.hostGroupList.length; i++) {
                            _this.hostGroupList[i].isSelected = false;
                        }
                    } else {
                        for (i = 0; i < _this.hostGroupList.length; i++) {
                            isFind = false;
                            for (j = 0; j < configHostGroupList.length; j++) {
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
                    var i = 0,
                        j = 0,
                        isFind = void 0;
                    if (!userGroupList || userGroupList.length === 0) {
                        for (i = 0; i < _this2.groupList.length; i++) {
                            _this2.groupList[i].isSelected = false;
                        }
                    } else {
                        for (i = 0; i < _this2.groupList.length; i++) {
                            isFind = false;
                            for (j = 0; j < userGroupList.length; j++) {
                                if (_this2.groupList[i].id === userGroupList[j].id) {
                                    isFind = true;
                                    break;
                                }
                            }
                            _this2.groupList[i].isSelected = isFind;
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
                if (type == this.config.templateType) {
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
                var i = 0,
                    strategy = void 0;
                config.templateName = this.config.templateName;
                config.templateType = this.config.templateType;
                config.id = this.config.id;

                if (config.templateType == 'host') {
                    config.templateType = this.config.templateType;
                    config.hostGroupList = [];
                    for (i = 0; i < this.hostGroupList.length; i++) {
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
                for (i = 0; i < this.config.strategyList.length; i++) {
                    strategy = angular.copy(this.config.strategyList[i]);
                    if (strategy.metric == 'agent_alive') {
                        strategy.rightValue = 1;
                        strategy.operator = '<';
                    }
                    if (strategy.tag) {
                        if (strategy.metric == 'disk_percent') {
                            strategy.tag = 'mount=' + strategy.tag;
                        } else if (strategy.metric.indexOf('disk') !== -1) {
                            strategy.tag = 'device=' + strategy.tag;
                        } else if (strategy.metric.indexOf('network') !== -1) {
                            strategy.tag = 'iface=' + strategy.tag;
                        }
                    }
                    config.strategyList.push(strategy);
                }

                config.userGroupList = [];
                for (i = 0; i < this.groupList.length; i++) {
                    if (this.groupList[i].isSelected) {
                        config.userGroupList.push({
                            id: this.groupList[i].id
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
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = nodeList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var node = _step.value;
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = this.selectedList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var selectedNode = _step2.value;

                                if (selectedNode.cluster === clusterName && selectedNode.name === node.name) {
                                    node.isSelected = true;
                                    break;
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

                        if (!node.isSelected) {
                            node.isSelected = false;
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
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = this.nodeList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var node = _step3.value;

                            if (node.isSelected) {
                                var isExist = false;
                                var _iteratorNormalCompletion4 = true;
                                var _didIteratorError4 = false;
                                var _iteratorError4 = undefined;

                                try {
                                    for (var _iterator4 = this.selectedList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                        var selectedNode = _step4.value;

                                        if (this.clusterName === selectedNode.cluster && node.name === selectedNode.name) {
                                            isExist = true;
                                            break;
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
                } else {
                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = this.nodeList[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var _node = _step5.value;

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
                    var _iteratorNormalCompletion6 = true;
                    var _didIteratorError6 = false;
                    var _iteratorError6 = undefined;

                    try {
                        for (var _iterator6 = this.nodeList[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            var sigNode = _step6.value;

                            if (sigNode.name === node.name) {
                                _get(Object.getPrototypeOf(NodeList.prototype), 'toggleCheck', this).call(this, sigNode, false);
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
                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                    for (var _iterator7 = this.nodeList[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                        var sigItem = _step7.value;

                        var exist = false;
                        sigItem.keyFilter = sigItem.name.indexOf(keywords) !== -1 ? true : false;
                        if (sigItem.keyFilter) {
                            var _iteratorNormalCompletion8 = true;
                            var _didIteratorError8 = false;
                            var _iteratorError8 = undefined;

                            try {
                                for (var _iterator8 = this.selectedList[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                    var selectedNode = _step8.value;

                                    if (selectedNode.name === sigItem.name && selectedNode.cluster === this.clusterName) {
                                        sigItem.isSelected = true;
                                        this.selectedCount++;
                                        break;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L2pzL3NlcnZpY2VzL2FsYXJtU2VydmljZS5lcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxRQUFRLE9BQVIsQ0FBZ0IsWUFBaEIsRUFBOEIsQ0FBQyxZQUFELEVBQWUsV0FBZixFQUE0QixhQUE1QixFQUEyQyxjQUEzQyxFQUEyRCxPQUEzRCxFQUFvRSxhQUFwRSxFQUFtRixJQUFuRixFQUF5RixVQUFVLFVBQVYsRUFBc0IsU0FBdEIsRUFBaUMsV0FBakMsRUFBOEMsWUFBOUMsRUFBNEQsS0FBNUQsRUFBbUUsV0FBbkUsRUFBZ0YsRUFBaEYsRUFBb0Y7QUFDdk0sUUFBSSxlQUFlLFNBQWYsWUFBZSxHQUFZO0FBQzNCLG1CQUFXLFlBQVgsQ0FBd0IsSUFBeEIsQ0FBNkIsSUFBN0IsRUFBbUMscUJBQW5DLEVBRDJCO0tBQVosQ0FEb0w7QUFJdk0sUUFBSSxtQkFBbUIsU0FBbkIsZ0JBQW1CLEdBQVk7QUFDL0IsbUJBQVcsWUFBWCxDQUF3QixJQUF4QixDQUE2QixJQUE3QixFQUFtQyxzQkFBbkMsRUFEK0I7QUFFL0IsYUFBSyxPQUFMLEdBQWUsVUFBQyxFQUFELEVBQUssUUFBTDttQkFBa0IsTUFBTSxJQUFOLENBQVcsK0JBQStCLEVBQS9CLEVBQW1DLFFBQVEsTUFBUixDQUFlLFFBQWYsQ0FBOUM7U0FBbEIsQ0FGZ0I7QUFHL0IsYUFBSyxVQUFMLEdBQWtCLFVBQUMsRUFBRCxFQUFLLE1BQUw7bUJBQWdCLE1BQU0sTUFBTixDQUFhLCtCQUErQixFQUEvQixHQUFvQyxHQUFwQyxHQUEwQyxNQUExQztTQUE3QixDQUhhO0tBQVosQ0FKZ0w7QUFTdk0sUUFBTSxpQkFBaUIsYUFBYSxXQUFiLENBQXlCLGdCQUF6QixDQUFqQixDQVRpTTtBQVV2TSxRQUFJLGdCQUFnQixJQUFJLFlBQUosRUFBaEIsQ0FWbU07QUFXdk0sUUFBTSxVQUFVO0FBQ1osZ0JBQVE7QUFDSix5QkFBYTtBQUNULHNCQUFNLFFBQU47QUFDQSxzQkFB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TUFBTSxHQUFOLENBQVUsa0JBQVY7U0FBTjtBQUNULGdCQUFRLGdCQUFDLElBQUQ7bUJBQVUsTUFBTSxJQUFOLENBQVcseUJBQVgsRUFBc0MsSUFBdEM7U0FBVjtLQUZOLENBMWRpTTtBQThkdk0sV0FBTztBQUNILHFCQUFhLFdBQWI7QUFDQSwyQkFBbUIsaUJBQW5CO0FBQ0EsaUJBQVMsT0FBVDtLQUhKLENBOWR1TTtDQUFwRixDQUF2SCIsImZpbGUiOiJpbmRleC9qcy9zZXJ2aWNlcy9hbGFybVNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJkb21lQXBwLmZhY3RvcnkoJyRkb21lQWxhcm0nLCBbJyRkb21lTW9kZWwnLCAnJGRvbWVVc2VyJywgJyRkb21lRGVwbG95JywgJyRkb21lQ2x1c3RlcicsICckaHR0cCcsICckZG9tZVB1YmxpYycsICckcScsIGZ1bmN0aW9uICgkZG9tZU1vZGVsLCAkZG9tZVVzZXIsICRkb21lRGVwbG95LCAkZG9tZUNsdXN0ZXIsICRodHRwLCAkZG9tZVB1YmxpYywgJHEpIHtcbiAgICBsZXQgQWxhcm1TZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkZG9tZU1vZGVsLlNlcnZpY2VNb2RlbC5jYWxsKHRoaXMsICcvYXBpL2FsYXJtL3RlbXBsYXRlJyk7XG4gICAgfTtcbiAgICBsZXQgSG9zdEdyb3VwU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJGRvbWVNb2RlbC5TZXJ2aWNlTW9kZWwuY2FsbCh0aGlzLCAnL2FwaS9hbGFybS9ob3N0Z3JvdXAnKTtcbiAgICAgICAgdGhpcy5hZGRIb3N0ID0gKGlkLCBob3N0SW5mbykgPT4gJGh0dHAucG9zdCgnL2FwaS9hbGFybS9ob3N0Z3JvdXAvYmluZC8nICsgaWQsIGFuZ3VsYXIudG9Kc29uKGhvc3RJbmZvKSk7XG4gICAgICAgIHRoaXMuZGVsZXRlSG9zdCA9IChpZCwgbm9kZUlkKSA9PiAkaHR0cC5kZWxldGUoJy9hcGkvYWxhcm0vaG9zdGdyb3VwL2JpbmQvJyArIGlkICsgJy8nICsgbm9kZUlkKTtcbiAgICB9O1xuICAgIGNvbnN0IGNsdXN0ZXJTZXJ2aWNlID0gJGRvbWVDbHVzdGVyLmdldEluc3RhbmNlKCdDbHVzdGVyU2VydmljZScpO1xuICAgIGxldCBfYWxhcm1TZXJ2aWNlID0gbmV3IEFsYXJtU2VydmljZSgpO1xuICAgIGNvbnN0IGtleU1hcHMgPSB7XG4gICAgICAgIG1ldHJpYzoge1xuICAgICAgICAgICAgY3B1X3BlcmNlbnQ6IHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAnQ1BV5Y2g55So546HJyxcbiAgICAgICAgICAgICAgICB1bml0OiAnJScsXG4gICAgICAgICAgICAgICAgYmVsb25nOiAnYWxsJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1lbW9yeV9wZXJjZW50OiB7XG4gICAgICAgICAgICAgICAgdGV4dDogJ+WGheWtmOWNoOeUqOeOhycsXG4gICAgICAgICAgICAgICAgdW5pdDogJyUnLFxuICAgICAgICAgICAgICAgIGJlbG9uZzogJ2FsbCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkaXNrX3BlcmNlbnQ6IHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAn56OB55uY5Y2g55So546HJyxcbiAgICAgICAgICAgICAgICB0YWdOYW1lOiAn5YiG5Yy6JyxcbiAgICAgICAgICAgICAgICB1bml0OiAnJScsXG4gICAgICAgICAgICAgICAgYmVsb25nOiAnaG9zdCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkaXNrX3JlYWQ6IHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAn56OB55uY6K+75Y+WJyxcbiAgICAgICAgICAgICAgICB0YWdOYW1lOiAn6K6+5aSHJyxcbiAgICAgICAgICAgICAgICB1bml0OiAnS0IvcycsXG4gICAgICAgICAgICAgICAgYmVsb25nOiAnaG9zdCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkaXNrX3dyaXRlOiB7XG4gICAgICAgICAgICAgICAgdGV4dDogJ+ejgeebmOWGmeWFpScsXG4gICAgICAgICAgICAgICAgdGFnTmFtZTogJ+iuvuWkhycsXG4gICAgICAgICAgICAgICAgdW5pdDogJ0tCL3MnLFxuICAgICAgICAgICAgICAgIGJlbG9uZzogJ2hvc3QnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbmV0d29ya19pbjoge1xuICAgICAgICAgICAgICAgIHRleHQ6ICfnvZHnu5zmtYHlhaUnLFxuICAgICAgICAgICAgICAgIHRhZ05hbWU6ICfnvZHljaEnLFxuICAgICAgICAgICAgICAgIHVuaXQ6ICdLQi9zJyxcbiAgICAgICAgICAgICAgICBiZWxvbmc6ICdhbGwnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbmV0d29ya19vdXQ6IHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAn572R57uc5rWB5Ye6JyxcbiAgICAgICAgICAgICAgICB0YWdOYW1lOiAn572R5Y2hJyxcbiAgICAgICAgICAgICAgICB1bml0OiAnS0IvcycsXG4gICAgICAgICAgICAgICAgYmVsb25nOiAnYWxsJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFnZW50X2FsaXZlOiB7XG4gICAgICAgICAgICAgICAgdGV4dDogJ2FnZW505a2Y5rS7JyxcbiAgICAgICAgICAgICAgICBiZWxvbmc6ICdob3N0J1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBhZ2dyZWdhdGVUeXBlOiB7XG4gICAgICAgICAgICBhdmc6ICflubPlnYflgLwnLFxuICAgICAgICAgICAgbWF4OiAn5pyA5aSn5YC8JyxcbiAgICAgICAgICAgIG1pbjogJ+acgOWwj+WAvCcsXG4gICAgICAgICAgICBzdW06ICflkozlgLwnXG4gICAgICAgIH0sXG4gICAgICAgIGFnZ3JlZ2F0ZVR5cGVBZ2VudDoge1xuICAgICAgICAgICAgbWF4OiAn5YWo6YOoJyxcbiAgICAgICAgICAgIG1pbjogJ+iHs+WwkeS4gOasoSdcbiAgICAgICAgfVxuICAgIH07XG4gICAgY2xhc3MgQWxhcm1UZW1wbGF0ZSB7XG4gICAgICAgIGNvbnN0cnVjdG9yKGFsYXJtSW5mbykge1xuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuaG9zdEdyb3VwTGlzdCA9IFtdO1xuICAgICAgICAgICAgdGhpcy5rZXlNYXBzID0ga2V5TWFwcztcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBMaXN0ID0gW107XG4gICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMgPSAkZG9tZURlcGxveS5nZXRJbnN0YW5jZSgnRGVwbG95TGlzdCcpO1xuICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zID0gJGRvbWVQdWJsaWMuZ2V0TG9hZGluZ0luc3RhbmNlKCk7XG4gICAgICAgICAgICB0aGlzLmNsdXN0ZXJMaXN0ID0gW107XG4gICAgICAgICAgICB0aGlzLmluaXQoYWxhcm1JbmZvKTtcbiAgICAgICAgfVxuICAgICAgICBpbml0KGFsYXJtSW5mbykge1xuICAgICAgICAgICAgaWYgKCFhbGFybUluZm8pIHtcbiAgICAgICAgICAgICAgICBhbGFybUluZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVHlwZTogJ2hvc3QnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghYWxhcm1JbmZvLmRlcGxveW1lbnRJbmZvKSB7XG4gICAgICAgICAgICAgICAgYWxhcm1JbmZvLmRlcGxveW1lbnRJbmZvID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWFsYXJtSW5mby5zdHJhdGVneUxpc3QpIHtcbiAgICAgICAgICAgICAgICBhbGFybUluZm8uc3RyYXRlZ3lMaXN0ID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWFsYXJtSW5mby5jYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGFsYXJtSW5mby5jYWxsYmFjayA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFhbGFybUluZm8uaG9zdEdyb3VwTGlzdCkge1xuICAgICAgICAgICAgICAgIGFsYXJtSW5mby5ob3N0R3JvdXBMaXN0ID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsYXJtSW5mby5zdHJhdGVneUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgc3RyYXRlZ3kgPSBhbGFybUluZm8uc3RyYXRlZ3lMaXN0W2ldO1xuICAgICAgICAgICAgICAgIGlmIChzdHJhdGVneS5tZXRyaWMgPT0gJ2Rpc2tfcGVyY2VudCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc3RyYXRlZ3kudGFnID0gJ21vdW50PS9vcHQnXG4gICAgICAgICAgICAgICAgICAgIHN0cmF0ZWd5LnRhZyA9IHN0cmF0ZWd5LnRhZy5zdWJzdHJpbmcoNik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdHJhdGVneS5tZXRyaWMuaW5kZXhPZignZGlzaycpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBzdHJhdGVneS50YWcgPSAnZGV2aWNlPXNkYSdcbiAgICAgICAgICAgICAgICAgICAgc3RyYXRlZ3kudGFnID0gc3RyYXRlZ3kudGFnLnN1YnN0cmluZyg3KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0cmF0ZWd5Lm1ldHJpYy5pbmRleE9mKCduZXR3b3JrJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHN0cmF0ZWd5LnRhZyA9ICdpZmFjZT1zZGEnXG4gICAgICAgICAgICAgICAgICAgIHN0cmF0ZWd5LnRhZyA9IHN0cmF0ZWd5LnRhZy5zdWJzdHJpbmcoNik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSBhbGFybUluZm87XG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWcuaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb25maWcuZGVwbG95bWVudEluZm8uaG9zdEVudikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5kZXBsb3ltZW50SW5mby5ob3N0RW52ID0gJ1BST0QnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmFkZFN0cmF0ZWd5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaW5pdEhvc3RHcm91cExpc3QoKSB7XG4gICAgICAgICAgICBsZXQgaG9zdEdyb3VwU2VydmljZTtcblxuICAgICAgICAgICAgY29uc3QgaW5pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgY29uZmlnSG9zdEdyb3VwTGlzdCA9IHRoaXMuY29uZmlnLmhvc3RHcm91cExpc3QsXG4gICAgICAgICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICAgICAgICBqID0gMCxcbiAgICAgICAgICAgICAgICAgICAgaXNGaW5kO1xuICAgICAgICAgICAgICAgIGlmIChjb25maWdIb3N0R3JvdXBMaXN0ICYmIGNvbmZpZ0hvc3RHcm91cExpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmhvc3RHcm91cExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaG9zdEdyb3VwTGlzdFtpXS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5ob3N0R3JvdXBMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0ZpbmQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBjb25maWdIb3N0R3JvdXBMaXN0Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ0hvc3RHcm91cExpc3Rbal0uaWQgPT09IHRoaXMuaG9zdEdyb3VwTGlzdFtpXS5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0ZpbmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3RHcm91cExpc3RbaV0uaXNTZWxlY3RlZCA9IGlzRmluZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAodGhpcy5ob3N0R3JvdXBMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ2hvc3Rncm91cCcpO1xuICAgICAgICAgICAgICAgIGhvc3RHcm91cFNlcnZpY2UgPSBuZXcgSG9zdEdyb3VwU2VydmljZSgpO1xuICAgICAgICAgICAgICAgIGhvc3RHcm91cFNlcnZpY2UuZ2V0RGF0YSgpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3RHcm91cExpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfojrflj5bkuLvmnLrnu4Tkv6Hmga/lpLHotKXvvIEnKTtcbiAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ2hvc3Rncm91cCcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICBpbml0R3JvdXBMaXN0KCkge1xuICAgICAgICAgICAgbGV0IHVzZXJHcm91cExpc3QgPSB0aGlzLmNvbmZpZy51c2VyR3JvdXBMaXN0O1xuXG4gICAgICAgICAgICBjb25zdCBpbml0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICAgICAgaiA9IDAsXG4gICAgICAgICAgICAgICAgICAgIGlzRmluZDtcbiAgICAgICAgICAgICAgICBpZiAoIXVzZXJHcm91cExpc3QgfHwgdXNlckdyb3VwTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMuZ3JvdXBMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwTGlzdFtpXS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5ncm91cExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzRmluZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHVzZXJHcm91cExpc3QubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ncm91cExpc3RbaV0uaWQgPT09IHVzZXJHcm91cExpc3Rbal0uaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNGaW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91cExpc3RbaV0uaXNTZWxlY3RlZCA9IGlzRmluZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAodGhpcy5ncm91cExpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnZ3JvdXBMaXN0Jyk7XG4gICAgICAgICAgICAgICAgJGRvbWVVc2VyLnVzZXJTZXJ2aWNlLmdldEdyb3VwKCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn6I635Y+W57uE5L+h5oGv5aSx6LSl77yBJyk7XG4gICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCdncm91cExpc3QnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGluaXREZXBsb3lBbmRDbHVzdGVyTGlzdCgpIHtcbiAgICAgICAgICAgICAgICBsZXQgZGVwbG95bWVudEluZm8gPSB0aGlzLmNvbmZpZy5kZXBsb3ltZW50SW5mbztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveUxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ2RlcGxveScpO1xuICAgICAgICAgICAgICAgICAgICAkcS5hbGwoWyRkb21lRGVwbG95LmRlcGxveVNlcnZpY2UuZ2V0TGlzdCgpLCBjbHVzdGVyU2VydmljZS5nZXREYXRhKCldKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95TGlzdElucy5pbml0KHJlc1swXS5kYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdCA9IHJlc1sxXS5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRlcGxveW1lbnRJbmZvLmNsdXN0ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveW1lbnRJbmZvLmNsdXN0ZXJOYW1lID0gdGhpcy5jbHVzdGVyTGlzdFswXS5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUNsdXN0ZXIodGhpcy5jbHVzdGVyTGlzdFswXS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUhvc3RFbnYoZGVwbG95bWVudEluZm8uaG9zdEVudik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95TGlzdElucy5kZXBsb3kuaWQgPSBkZXBsb3ltZW50SW5mby5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveS5uYW1lID0gZGVwbG95bWVudEluZm8uZGVwbG95bWVudE5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfojrflj5bkv6Hmga/lpLHotKXvvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCdkZXBsb3knKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlSG9zdEVudihkZXBsb3ltZW50SW5mby5ob3N0RW52KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveS5pZCA9IGRlcGxveW1lbnRJbmZvLmlkO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMuZGVwbG95Lm5hbWUgPSBkZXBsb3ltZW50SW5mby5kZXBsb3ltZW50TmFtZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBAcGFyYW0gdHlwZTogJ2hvc3QnLydkZXBsb3knXG4gICAgICAgIHRvZ2dsZVRlbXBsYXRlVHlwZSh0eXBlKSB7XG4gICAgICAgICAgICBpZiAodHlwZSA9PSB0aGlzLmNvbmZpZy50ZW1wbGF0ZVR5cGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy50ZW1wbGF0ZVR5cGUgPSB0eXBlO1xuICAgICAgICAgICAgdGhpcy5jb25maWcuc3RyYXRlZ3lMaXN0ID0gW107XG4gICAgICAgICAgICB0aGlzLmFkZFN0cmF0ZWd5KCk7XG4gICAgICAgIH1cbiAgICAgICAgYWRkU3RyYXRlZ3koKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5zdHJhdGVneUxpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgbWV0cmljOiAnY3B1X3BlcmNlbnQnLFxuICAgICAgICAgICAgICAgIHRhZzogJycsXG4gICAgICAgICAgICAgICAgcG9pbnROdW06IDMsXG4gICAgICAgICAgICAgICAgYWdncmVnYXRlVHlwZTogJ2F2ZycsXG4gICAgICAgICAgICAgICAgb3BlcmF0b3I6ICc9PScsXG4gICAgICAgICAgICAgICAgcmlnaHRWYWx1ZTogbnVsbCxcbiAgICAgICAgICAgICAgICBub3RlOiAnJyxcbiAgICAgICAgICAgICAgICBtYXhTdGVwOiAzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBkZWxldGVTdHJhdGVneShpbmRleCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWcuc3RyYXRlZ3lMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgdG9nZ2xlU3RyYXRlZ3lNZXRyaWMoc3RyYXRlZ3lJbmRleCwgbWV0cmljKSB7XG4gICAgICAgICAgICBsZXQgc3RyYXRlZ3kgPSB0aGlzLmNvbmZpZy5zdHJhdGVneUxpc3Rbc3RyYXRlZ3lJbmRleF07XG4gICAgICAgICAgICBpZiAoc3RyYXRlZ3kubWV0cmljID09PSBtZXRyaWMpIHJldHVybjtcbiAgICAgICAgICAgIGlmIChtZXRyaWMgPT09ICdhZ2VudF9hbGl2ZScpIHtcbiAgICAgICAgICAgICAgICBzdHJhdGVneS5hZ2dyZWdhdGVUeXBlID0gJ21heCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdHJhdGVneS5tZXRyaWMgPSBtZXRyaWM7XG4gICAgICAgICAgICBzdHJhdGVneS50YWcgPSAnJztcbiAgICAgICAgfVxuICAgICAgICB0b2dnbGVIb3N0RW52KGVudikge1xuICAgICAgICAgICAgdGhpcy5jb25maWcuZGVwbG95bWVudEluZm8uaG9zdEVudiA9IGVudjtcbiAgICAgICAgICAgIHRoaXMuZGVwbG95TGlzdElucy5maWx0ZXJEZXBsb3kodGhpcy5jb25maWcuZGVwbG95bWVudEluZm8uY2x1c3Rlck5hbWUsIGVudik7XG4gICAgICAgIH1cbiAgICAgICAgdG9nZ2xlQ2x1c3RlcihjbHVzdGVyTmFtZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWcuZGVwbG95bWVudEluZm8uY2x1c3Rlck5hbWUgPSBjbHVzdGVyTmFtZTtcbiAgICAgICAgICAgIHRoaXMuZGVwbG95TGlzdElucy5maWx0ZXJEZXBsb3koY2x1c3Rlck5hbWUsIHRoaXMuY29uZmlnLmRlcGxveW1lbnRJbmZvLmhvc3RFbnYpO1xuICAgICAgICB9XG4gICAgICAgIGdldEZvcm1hcnRDb25maWcoKSB7XG4gICAgICAgICAgICBsZXQgY29uZmlnID0ge307XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgc3RyYXRlZ3k7XG4gICAgICAgICAgICBjb25maWcudGVtcGxhdGVOYW1lID0gdGhpcy5jb25maWcudGVtcGxhdGVOYW1lO1xuICAgICAgICAgICAgY29uZmlnLnRlbXBsYXRlVHlwZSA9IHRoaXMuY29uZmlnLnRlbXBsYXRlVHlwZTtcbiAgICAgICAgICAgIGNvbmZpZy5pZCA9IHRoaXMuY29uZmlnLmlkO1xuXG4gICAgICAgICAgICBpZiAoY29uZmlnLnRlbXBsYXRlVHlwZSA9PSAnaG9zdCcpIHtcbiAgICAgICAgICAgICAgICBjb25maWcudGVtcGxhdGVUeXBlID0gdGhpcy5jb25maWcudGVtcGxhdGVUeXBlO1xuICAgICAgICAgICAgICAgIGNvbmZpZy5ob3N0R3JvdXBMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMuaG9zdEdyb3VwTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ob3N0R3JvdXBMaXN0W2ldLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5ob3N0R3JvdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLmhvc3RHcm91cExpc3RbaV0uaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChjb25maWcudGVtcGxhdGVUeXBlID09ICdkZXBsb3knKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLmRlcGxveW1lbnRJbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveS5pZCxcbiAgICAgICAgICAgICAgICAgICAgY2x1c3Rlck5hbWU6IHRoaXMuY29uZmlnLmRlcGxveW1lbnRJbmZvLmNsdXN0ZXJOYW1lLFxuICAgICAgICAgICAgICAgICAgICBkZXBsb3ltZW50TmFtZTogdGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBob3N0RW52OiB0aGlzLmNvbmZpZy5kZXBsb3ltZW50SW5mby5ob3N0RW52XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uZmlnLnN0cmF0ZWd5TGlzdCA9IFtdO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMuY29uZmlnLnN0cmF0ZWd5TGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHN0cmF0ZWd5ID0gYW5ndWxhci5jb3B5KHRoaXMuY29uZmlnLnN0cmF0ZWd5TGlzdFtpXSk7XG4gICAgICAgICAgICAgICAgaWYgKHN0cmF0ZWd5Lm1ldHJpYyA9PSAnYWdlbnRfYWxpdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0cmF0ZWd5LnJpZ2h0VmFsdWUgPSAxO1xuICAgICAgICAgICAgICAgICAgICBzdHJhdGVneS5vcGVyYXRvciA9ICc8JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHN0cmF0ZWd5LnRhZykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RyYXRlZ3kubWV0cmljID09ICdkaXNrX3BlcmNlbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJhdGVneS50YWcgPSAnbW91bnQ9JyArIHN0cmF0ZWd5LnRhZztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdHJhdGVneS5tZXRyaWMuaW5kZXhPZignZGlzaycpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyYXRlZ3kudGFnID0gJ2RldmljZT0nICsgc3RyYXRlZ3kudGFnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0cmF0ZWd5Lm1ldHJpYy5pbmRleE9mKCduZXR3b3JrJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJhdGVneS50YWcgPSAnaWZhY2U9JyArIHN0cmF0ZWd5LnRhZztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25maWcuc3RyYXRlZ3lMaXN0LnB1c2goc3RyYXRlZ3kpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25maWcudXNlckdyb3VwTGlzdCA9IFtdO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMuZ3JvdXBMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ3JvdXBMaXN0W2ldLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLnVzZXJHcm91cExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5ncm91cExpc3RbaV0uaWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uZmlnLmNhbGxiYWNrID0gYW5ndWxhci5jb3B5KHRoaXMuY29uZmlnLmNhbGxiYWNrKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNvbmZpZyk7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgICB9XG4gICAgICAgIGNyZWF0ZSgpIHtcbiAgICAgICAgICAgIHJldHVybiBfYWxhcm1TZXJ2aWNlLnNldERhdGEodGhpcy5nZXRGb3JtYXJ0Q29uZmlnKCkpO1xuICAgICAgICB9XG4gICAgICAgIG1vZGlmeSgpIHtcbiAgICAgICAgICAgIHJldHVybiBfYWxhcm1TZXJ2aWNlLnVwZGF0ZURhdGEodGhpcy5nZXRGb3JtYXJ0Q29uZmlnKCkpO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgLy8gaG9zdEdyb3Vw5re75Yqg5Li75py6XG4gICAgY2xhc3MgTm9kZUxpc3QgZXh0ZW5kcyAkZG9tZU1vZGVsLlNlbGVjdExpc3RNb2RlbCB7XG5cbiAgICAgICAgY29uc3RydWN0b3Iobm9kZUxpc3QsIGNsdXN0ZXJOYW1lKSB7XG4gICAgICAgICAgICBzdXBlcignbm9kZUxpc3QnKTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0ID0gW107XG4gICAgICAgICAgICB0aGlzLmluaXQobm9kZUxpc3QsIGNsdXN0ZXJOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpbml0KG5vZGVMaXN0LCBjbHVzdGVyTmFtZSkge1xuICAgICAgICAgICAgaWYgKCFub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgIG5vZGVMaXN0ID0gdGhpcy5ub2RlTGlzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghY2x1c3Rlck5hbWUpIHtcbiAgICAgICAgICAgICAgICBjbHVzdGVyTmFtZSA9IHRoaXMuY2x1c3Rlck5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW5vZGVMaXN0IHx8ICFjbHVzdGVyTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY2x1c3Rlck5hbWUgPSBjbHVzdGVyTmFtZTtcbiAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzZWxlY3RlZE5vZGUgb2YgdGhpcy5zZWxlY3RlZExpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkTm9kZS5jbHVzdGVyID09PSBjbHVzdGVyTmFtZSAmJiBzZWxlY3RlZE5vZGUubmFtZSA9PT0gbm9kZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmlzU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFub2RlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3VwZXIuaW5pdChub2RlTGlzdCk7XG4gICAgICAgIH1cbiAgICAgICAgaW5pdFNlbGVjdGVkTGlzdCgpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0ID0gW107XG4gICAgICAgICAgICB0aGlzLmNoZWNrQWxsSXRlbShmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2hlY2tBbGxJdGVtKGlzQ2hlY2tBbGwpIHtcbiAgICAgICAgICAgIHN1cGVyLmNoZWNrQWxsSXRlbShpc0NoZWNrQWxsKTtcbiAgICAgICAgICAgIGlmIChpc0NoZWNrQWxsKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLm5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc0V4aXN0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzZWxlY3RlZE5vZGUgb2YgdGhpcy5zZWxlY3RlZExpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jbHVzdGVyTmFtZSA9PT0gc2VsZWN0ZWROb2RlLmNsdXN0ZXIgJiYgbm9kZS5uYW1lID09PSBzZWxlY3RlZE5vZGUubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0V4aXN0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0V4aXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5vZGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXA6IG5vZGUuaXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsdXN0ZXI6IHRoaXMuY2x1c3Rlck5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLm5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zZWxlY3RlZExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZE5vZGUgPSB0aGlzLnNlbGVjdGVkTGlzdFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsdXN0ZXJOYW1lID09PSBzZWxlY3RlZE5vZGUuY2x1c3RlciAmJiBub2RlLm5hbWUgPT09IHNlbGVjdGVkTm9kZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0b2dnbGVDaGVjayhpdGVtLCBpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICBzdXBlci50b2dnbGVDaGVjayhpdGVtLCBpc1NlbGVjdGVkKTtcbiAgICAgICAgICAgIGlmIChpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5jbHVzdGVyID0gdGhpcy5jbHVzdGVyTmFtZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlzdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBpcDogaXRlbS5pcCxcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlcjogaXRlbS5jbHVzdGVyXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zZWxlY3RlZExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRMaXN0W2ldLm5hbWUgPT09IGl0ZW0ubmFtZSAmJiB0aGlzLnNlbGVjdGVkTGlzdFtpXS5jbHVzdGVyID09PSB0aGlzLmNsdXN0ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkZWxldGVTZWxlY3RlZE5vZGUobm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUuY2x1c3RlciA9PT0gdGhpcy5jbHVzdGVyTmFtZSkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ05vZGUgb2YgdGhpcy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2lnTm9kZS5uYW1lID09PSBub2RlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1cGVyLnRvZ2dsZUNoZWNrKHNpZ05vZGUsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNlbGVjdGVkTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkTGlzdFtpXS5uYW1lID09PSBub2RlLm5hbWUgJiYgdGhpcy5zZWxlY3RlZExpc3RbaV0uY2x1c3RlciA9PT0gbm9kZS5jbHVzdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZpbHRlcldpdGhLZXkoa2V5d29yZHMpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSB0cnVlO1xuICAgICAgICAgICAgZm9yIChsZXQgc2lnSXRlbSBvZiB0aGlzLm5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgbGV0IGV4aXN0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2lnSXRlbS5rZXlGaWx0ZXIgPSBzaWdJdGVtLm5hbWUuaW5kZXhPZihrZXl3b3JkcykgIT09IC0xID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChzaWdJdGVtLmtleUZpbHRlcikge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzZWxlY3RlZE5vZGUgb2YgdGhpcy5zZWxlY3RlZExpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZE5vZGUubmFtZSA9PT0gc2lnSXRlbS5uYW1lICYmIHNlbGVjdGVkTm9kZS5jbHVzdGVyID09PSB0aGlzLmNsdXN0ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnSXRlbS5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIXNpZ0l0ZW0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2lnSXRlbS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0NoZWNrQWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzaWdJdGVtLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGNvbnN0IGdldEluc3RhbmNlID0gJGRvbWVNb2RlbC5pbnN0YW5jZXNDcmVhdG9yKHtcbiAgICAgICAgTm9kZUxpc3Q6IE5vZGVMaXN0LFxuICAgICAgICBBbGFybVNlcnZpY2U6IEFsYXJtU2VydmljZSxcbiAgICAgICAgSG9zdEdyb3VwU2VydmljZTogSG9zdEdyb3VwU2VydmljZSxcbiAgICAgICAgQWxhcm1UZW1wbGF0ZTogQWxhcm1UZW1wbGF0ZVxuICAgIH0pO1xuXG4gICAgY29uc3QgYWxhcm1FdmVudFNlcnZpY2UgPSB7XG4gICAgICAgIGdldERhdGE6ICgpID0+ICRodHRwLmdldCgnL2FwaS9hbGFybS9ldmVudCcpLFxuICAgICAgICBpZ25vcmU6IChkYXRhKSA9PiAkaHR0cC5wb3N0KCcvYXBpL2FsYXJtL2V2ZW50L2lnbm9yZScsIGRhdGEpXG4gICAgfTtcbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRJbnN0YW5jZTogZ2V0SW5zdGFuY2UsXG4gICAgICAgIGFsYXJtRXZlbnRTZXJ2aWNlOiBhbGFybUV2ZW50U2VydmljZSxcbiAgICAgICAga2V5TWFwczoga2V5TWFwc1xuICAgIH07XG59XSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
