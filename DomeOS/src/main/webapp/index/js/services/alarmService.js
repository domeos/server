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
        //用户组
        var UserGroupService = function UserGroupService() {
            $domeModel.ServiceModel.call(this, '/api/alarm/usergroup');
            this.getUserGroup = function () {
                return $http.get('/api/alarm/usergroup');
            };
            this.createUserGroup = function (userGroupDraft) {
                return $http.post('/api/alarm/usergroup', angular.toJson(userGroupDraft));
            };
            this.bindUser = function (userGroupId, userInfo) {
                return $http.post('/api/alarm/usergroup/bind/' + userGroupId, angular.toJson(userInfo));
            };
            this.deleteUserGroup = function (userGroupId) {
                return $http.delete('/api/alarm/usergroup/' + userGroupId);
            };
            this.updateUserGroup = function (userGroupDraft) {
                return $http.put('/api/alarm/usergroup', angular.toJson(userGroupDraft));
            };
            this.deleteSingleUser = function (userGroupId, userId) {
                return $http.delete('/api/alarm/usergroup/bind/' + userGroupId + '/' + userId);
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
                        // $domeUser.userService.getGroup().then((res) => {
                        $http.get('/api/alarm/usergroup').then(function (res) {
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
            AlarmTemplate: AlarmTemplate,
            UserGroupService: UserGroupService
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L2pzL3NlcnZpY2VzL2FsYXJtU2VydmljZS5lcyJdLCJuYW1lcyI6WyJkb21lQXBwIiwidW5kZWZpbmVkIiwiZmFjdG9yeSIsIiRkb21lTW9kZWwiLCIkZG9tZVVzZXIiLCIkZG9tZURlcGxveSIsIiRkb21lQ2x1c3RlciIsIiRodHRwIiwiJGRvbWVQdWJsaWMiLCIkcSIsIiR1dGlsIiwiQWxhcm1TZXJ2aWNlIiwiU2VydmljZU1vZGVsIiwiY2FsbCIsIkhvc3RHcm91cFNlcnZpY2UiLCJhZGRIb3N0IiwiaWQiLCJob3N0SW5mbyIsInBvc3QiLCJhbmd1bGFyIiwidG9Kc29uIiwiZGVsZXRlSG9zdCIsIm5vZGVJZCIsImRlbGV0ZSIsIlVzZXJHcm91cFNlcnZpY2UiLCJnZXRVc2VyR3JvdXAiLCJnZXQiLCJjcmVhdGVVc2VyR3JvdXAiLCJ1c2VyR3JvdXBEcmFmdCIsImJpbmRVc2VyIiwidXNlckdyb3VwSWQiLCJ1c2VySW5mbyIsImRlbGV0ZVVzZXJHcm91cCIsInVwZGF0ZVVzZXJHcm91cCIsInB1dCIsImRlbGV0ZVNpbmdsZVVzZXIiLCJ1c2VySWQiLCJjbHVzdGVyU2VydmljZSIsImdldEluc3RhbmNlIiwiX2FsYXJtU2VydmljZSIsImtleU1hcHMiLCJtZXRyaWMiLCJjcHVfcGVyY2VudCIsInRleHQiLCJ1bml0IiwiYmVsb25nIiwibWVtb3J5X3BlcmNlbnQiLCJkaXNrX3BlcmNlbnQiLCJ0YWdOYW1lIiwiZGlza19yZWFkIiwiZGlza193cml0ZSIsIm5ldHdvcmtfaW4iLCJuZXR3b3JrX291dCIsImFnZW50X2FsaXZlIiwiYWdncmVnYXRlVHlwZSIsImF2ZyIsIm1heCIsIm1pbiIsInN1bSIsImFnZ3JlZ2F0ZVR5cGVBZ2VudCIsIkFsYXJtVGVtcGxhdGUiLCJhbGFybUluZm8iLCJjb25maWciLCJob3N0R3JvdXBMaXN0IiwiZ3JvdXBMaXN0IiwiZGVwbG95TGlzdElucyIsImxvYWRpbmdJbnMiLCJnZXRMb2FkaW5nSW5zdGFuY2UiLCJjbHVzdGVyTGlzdCIsImluaXQiLCJpc09iamVjdCIsInRlbXBsYXRlVHlwZSIsImRlcGxveW1lbnRJbmZvIiwiaXNBcnJheSIsInN0cmF0ZWd5TGlzdCIsImNhbGxiYWNrIiwic3RyYXRlZ3kiLCJ0YWciLCJzdWJzdHJpbmciLCJpbmRleE9mIiwiaG9zdEVudiIsImFkZFN0cmF0ZWd5IiwiaG9zdEdyb3VwU2VydmljZSIsImNvbmZpZ0hvc3RHcm91cExpc3QiLCJpc0ZpbmQiLCJsZW5ndGgiLCJob3N0R3JvdXAiLCJpc1NlbGVjdGVkIiwiaSIsImwiLCJqIiwibDEiLCJzdGFydExvYWRpbmciLCJnZXREYXRhIiwidGhlbiIsInJlcyIsImRhdGEiLCJyZXN1bHQiLCJvcGVuV2FybmluZyIsImZpbmFsbHkiLCJmaW5pc2hMb2FkaW5nIiwidXNlckdyb3VwTGlzdCIsImRlcGxveUxpc3QiLCJhbGwiLCJkZXBsb3lTZXJ2aWNlIiwiZ2V0TGlzdCIsImNsdXN0ZXJOYW1lIiwibmFtZSIsInRvZ2dsZUNsdXN0ZXIiLCJ0b2dnbGVIb3N0RW52IiwiZGVwbG95IiwiZGVwbG95bWVudE5hbWUiLCJ0eXBlIiwicHVzaCIsInBvaW50TnVtIiwib3BlcmF0b3IiLCJyaWdodFZhbHVlIiwibm90ZSIsIm1heFN0ZXAiLCJpbmRleCIsInNwbGljZSIsInN0cmF0ZWd5SW5kZXgiLCJlbnYiLCJmaWx0ZXJEZXBsb3kiLCJ0ZW1wbGF0ZU5hbWUiLCJuZXdTdHJhdGVneSIsImNvcHkiLCJjb25zb2xlIiwibG9nIiwic2V0RGF0YSIsImdldEZvcm1hcnRDb25maWciLCJ1cGRhdGVEYXRhIiwiTm9kZUxpc3QiLCJub2RlTGlzdCIsInNlbGVjdGVkTGlzdCIsIm5vZGUiLCJzZWxlY3RlZE5vZGUiLCJjbHVzdGVyIiwiY2hlY2tBbGxJdGVtIiwiaXNDaGVja0FsbCIsImlzRXhpc3QiLCJpcCIsIml0ZW0iLCJzaWdOb2RlIiwia2V5d29yZHMiLCJzZWxlY3RlZENvdW50Iiwic2lnSXRlbSIsImV4aXN0Iiwia2V5RmlsdGVyIiwiU2VsZWN0TGlzdE1vZGVsIiwiaW5zdGFuY2VzQ3JlYXRvciIsImFsYXJtRXZlbnRTZXJ2aWNlIiwiaWdub3JlIiwid2luZG93Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7QUFLQSxDQUFDLFVBQUNBLE9BQUQsRUFBVUMsU0FBVixFQUF3QjtBQUNyQjs7QUFDQSxRQUFJLE9BQU9ELE9BQVAsS0FBbUIsV0FBdkIsRUFBb0M7O0FBRXBDQSxZQUFRRSxPQUFSLENBQWdCLFlBQWhCLEVBQThCLENBQUMsWUFBRCxFQUFlLFdBQWYsRUFBNEIsYUFBNUIsRUFBMkMsY0FBM0MsRUFBMkQsT0FBM0QsRUFBb0UsYUFBcEUsRUFBbUYsSUFBbkYsRUFBeUYsT0FBekYsRUFBa0csVUFBVUMsVUFBVixFQUFzQkMsU0FBdEIsRUFBaUNDLFdBQWpDLEVBQThDQyxZQUE5QyxFQUE0REMsS0FBNUQsRUFBbUVDLFdBQW5FLEVBQWdGQyxFQUFoRixFQUFvRkMsS0FBcEYsRUFBMkY7QUFDdk4sWUFBTUMsZUFBZSxTQUFmQSxZQUFlLEdBQVk7QUFDN0JSLHVCQUFXUyxZQUFYLENBQXdCQyxJQUF4QixDQUE2QixJQUE3QixFQUFtQyxxQkFBbkM7QUFDSCxTQUZEO0FBR0EsWUFBTUMsbUJBQW1CLFNBQW5CQSxnQkFBbUIsR0FBWTtBQUNqQ1gsdUJBQVdTLFlBQVgsQ0FBd0JDLElBQXhCLENBQTZCLElBQTdCLEVBQW1DLHNCQUFuQztBQUNBLGlCQUFLRSxPQUFMLEdBQWUsVUFBQ0MsRUFBRCxFQUFLQyxRQUFMO0FBQUEsdUJBQWtCVixNQUFNVyxJQUFOLGdDQUF3Q0YsRUFBeEMsRUFBOENHLFFBQVFDLE1BQVIsQ0FBZUgsUUFBZixDQUE5QyxDQUFsQjtBQUFBLGFBQWY7QUFDQSxpQkFBS0ksVUFBTCxHQUFrQixVQUFDTCxFQUFELEVBQUtNLE1BQUw7QUFBQSx1QkFBZ0JmLE1BQU1nQixNQUFOLGdDQUEwQ1AsRUFBMUMsU0FBZ0RNLE1BQWhELENBQWhCO0FBQUEsYUFBbEI7QUFDSCxTQUpEO0FBS0E7QUFDQSxZQUFNRSxt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aEI7QUFHSC9HLHFCQUFTQTtBQUhOLFNBQVA7QUFLSCxLQXhlNkIsQ0FBOUI7QUF5ZUgsQ0E3ZUQsRUE2ZUdpSCxPQUFPekosT0E3ZVYiLCJmaWxlIjoiaW5kZXgvanMvc2VydmljZXMvYWxhcm1TZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogQGF1dGhvciBDaGFuZHJhTGVlXHJcbiAqIEBkZXNjcmlwdGlvbiDmiqXorabmnI3liqFcclxuICovXHJcblxyXG4oKGRvbWVBcHAsIHVuZGVmaW5lZCkgPT4ge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgaWYgKHR5cGVvZiBkb21lQXBwID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xyXG5cclxuICAgIGRvbWVBcHAuZmFjdG9yeSgnJGRvbWVBbGFybScsIFsnJGRvbWVNb2RlbCcsICckZG9tZVVzZXInLCAnJGRvbWVEZXBsb3knLCAnJGRvbWVDbHVzdGVyJywgJyRodHRwJywgJyRkb21lUHVibGljJywgJyRxJywgJyR1dGlsJywgZnVuY3Rpb24gKCRkb21lTW9kZWwsICRkb21lVXNlciwgJGRvbWVEZXBsb3ksICRkb21lQ2x1c3RlciwgJGh0dHAsICRkb21lUHVibGljLCAkcSwgJHV0aWwpIHtcclxuICAgICAgICBjb25zdCBBbGFybVNlcnZpY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRkb21lTW9kZWwuU2VydmljZU1vZGVsLmNhbGwodGhpcywgJy9hcGkvYWxhcm0vdGVtcGxhdGUnKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IEhvc3RHcm91cFNlcnZpY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRkb21lTW9kZWwuU2VydmljZU1vZGVsLmNhbGwodGhpcywgJy9hcGkvYWxhcm0vaG9zdGdyb3VwJyk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkSG9zdCA9IChpZCwgaG9zdEluZm8pID0+ICRodHRwLnBvc3QoYC9hcGkvYWxhcm0vaG9zdGdyb3VwL2JpbmQvJHtpZH1gLCBhbmd1bGFyLnRvSnNvbihob3N0SW5mbykpO1xyXG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUhvc3QgPSAoaWQsIG5vZGVJZCkgPT4gJGh0dHAuZGVsZXRlKGAvYXBpL2FsYXJtL2hvc3Rncm91cC9iaW5kLyR7aWR9LyR7bm9kZUlkfWApO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy/nlKjmiLfnu4RcclxuICAgICAgICBjb25zdCBVc2VyR3JvdXBTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkZG9tZU1vZGVsLlNlcnZpY2VNb2RlbC5jYWxsKHRoaXMsICcvYXBpL2FsYXJtL3VzZXJncm91cCcpO1xyXG4gICAgICAgICAgICB0aGlzLmdldFVzZXJHcm91cCA9ICgpID0+ICRodHRwLmdldCgnL2FwaS9hbGFybS91c2VyZ3JvdXAnKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVVc2VyR3JvdXAgPSAodXNlckdyb3VwRHJhZnQpID0+ICRodHRwLnBvc3QoJy9hcGkvYWxhcm0vdXNlcmdyb3VwJywgYW5ndWxhci50b0pzb24odXNlckdyb3VwRHJhZnQpKTtcclxuICAgICAgICAgICAgdGhpcy5iaW5kVXNlciA9ICh1c2VyR3JvdXBJZCwgdXNlckluZm8pID0+ICRodHRwLnBvc3QoYC9hcGkvYWxhcm0vdXNlcmdyb3VwL2JpbmQvJHt1c2VyR3JvdXBJZH1gLCBhbmd1bGFyLnRvSnNvbih1c2VySW5mbykpO1xyXG4gICAgICAgICAgICB0aGlzLmRlbGV0ZVVzZXJHcm91cCA9ICh1c2VyR3JvdXBJZCkgPT4gJGh0dHAuZGVsZXRlKGAvYXBpL2FsYXJtL3VzZXJncm91cC8ke3VzZXJHcm91cElkfWApO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVVzZXJHcm91cCA9ICh1c2VyR3JvdXBEcmFmdCkgPT4gJGh0dHAucHV0KCcvYXBpL2FsYXJtL3VzZXJncm91cCcsIGFuZ3VsYXIudG9Kc29uKHVzZXJHcm91cERyYWZ0KSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlU2luZ2xlVXNlciA9ICh1c2VyR3JvdXBJZCwgdXNlcklkKSA9PiAkaHR0cC5kZWxldGUoYC9hcGkvYWxhcm0vdXNlcmdyb3VwL2JpbmQvJHt1c2VyR3JvdXBJZH0vJHt1c2VySWR9YCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBjbHVzdGVyU2VydmljZSA9ICRkb21lQ2x1c3Rlci5nZXRJbnN0YW5jZSgnQ2x1c3RlclNlcnZpY2UnKTtcclxuICAgICAgICBjb25zdCBfYWxhcm1TZXJ2aWNlID0gbmV3IEFsYXJtU2VydmljZSgpO1xyXG4gICAgICAgIGNvbnN0IGtleU1hcHMgPSB7XHJcbiAgICAgICAgICAgIG1ldHJpYzoge1xyXG4gICAgICAgICAgICAgICAgY3B1X3BlcmNlbnQ6IHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnQ1BV5Y2g55So546HJyxcclxuICAgICAgICAgICAgICAgICAgICB1bml0OiAnJScsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVsb25nOiAnYWxsJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG1lbW9yeV9wZXJjZW50OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJ+WGheWtmOWNoOeUqOeOhycsXHJcbiAgICAgICAgICAgICAgICAgICAgdW5pdDogJyUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJlbG9uZzogJ2FsbCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkaXNrX3BlcmNlbnQ6IHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn56OB55uY5Y2g55So546HJyxcclxuICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiAn5YiG5Yy6JyxcclxuICAgICAgICAgICAgICAgICAgICB1bml0OiAnJScsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVsb25nOiAnaG9zdCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkaXNrX3JlYWQ6IHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn56OB55uY6K+75Y+WJyxcclxuICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiAn6K6+5aSHJyxcclxuICAgICAgICAgICAgICAgICAgICB1bml0OiAnS0IvcycsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVsb25nOiAnaG9zdCdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkaXNrX3dyaXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJ+ejgeebmOWGmeWFpScsXHJcbiAgICAgICAgICAgICAgICAgICAgdGFnTmFtZTogJ+iuvuWkhycsXHJcbiAgICAgICAgICAgICAgICAgICAgdW5pdDogJ0tCL3MnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJlbG9uZzogJ2hvc3QnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbmV0d29ya19pbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICfnvZHnu5zmtYHlhaUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRhZ05hbWU6ICfnvZHljaEnLFxyXG4gICAgICAgICAgICAgICAgICAgIHVuaXQ6ICdLQi9zJyxcclxuICAgICAgICAgICAgICAgICAgICBiZWxvbmc6ICdhbGwnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbmV0d29ya19vdXQ6IHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn572R57uc5rWB5Ye6JyxcclxuICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiAn572R5Y2hJyxcclxuICAgICAgICAgICAgICAgICAgICB1bml0OiAnS0IvcycsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVsb25nOiAnYWxsJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGFnZW50X2FsaXZlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJ2FnZW505a2Y5rS7JyxcclxuICAgICAgICAgICAgICAgICAgICBiZWxvbmc6ICdob3N0J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZ2dyZWdhdGVUeXBlOiB7XHJcbiAgICAgICAgICAgICAgICBhdmc6ICflubPlnYflgLwnLFxyXG4gICAgICAgICAgICAgICAgbWF4OiAn5pyA5aSn5YC8JyxcclxuICAgICAgICAgICAgICAgIG1pbjogJ+acgOWwj+WAvCcsXHJcbiAgICAgICAgICAgICAgICBzdW06ICflkozlgLwnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGFnZ3JlZ2F0ZVR5cGVBZ2VudDoge1xyXG4gICAgICAgICAgICAgICAgbWF4OiAn5YWo6YOoJyxcclxuICAgICAgICAgICAgICAgIG1pbjogJ+iHs+WwkeS4gOasoSdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY2xhc3MgQWxhcm1UZW1wbGF0ZSB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKGFsYXJtSW5mbykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7fTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaG9zdEdyb3VwTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlNYXBzID0ga2V5TWFwcztcclxuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMgPSAkZG9tZURlcGxveS5nZXRJbnN0YW5jZSgnRGVwbG95TGlzdCcpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zID0gJGRvbWVQdWJsaWMuZ2V0TG9hZGluZ0luc3RhbmNlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsdXN0ZXJMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoYWxhcm1JbmZvKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbml0KGFsYXJtSW5mbykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc09iamVjdChhbGFybUluZm8pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxhcm1JbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVR5cGU6ICdob3N0J1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KGFsYXJtSW5mby5kZXBsb3ltZW50SW5mbykpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGFybUluZm8uZGVwbG95bWVudEluZm8gPSB7fTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheShhbGFybUluZm8uc3RyYXRlZ3lMaXN0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsYXJtSW5mby5zdHJhdGVneUxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNPYmplY3QoYWxhcm1JbmZvLmNhbGxiYWNrKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsYXJtSW5mby5jYWxsYmFjayA9IHt9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KGFsYXJtSW5mby5ob3N0R3JvdXBMaXN0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsYXJtSW5mby5ob3N0R3JvdXBMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzdHJhdGVneSBvZiBhbGFybUluZm8uc3RyYXRlZ3lMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0cmF0ZWd5Lm1ldHJpYyA9PSAnZGlza19wZXJjZW50Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzdHJhdGVneS50YWcgPSAnbW91bnQ9L29wdCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyYXRlZ3kudGFnID0gc3RyYXRlZ3kudGFnLnN1YnN0cmluZyg2KTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0cmF0ZWd5Lm1ldHJpYy5pbmRleE9mKCdkaXNrJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0cmF0ZWd5LnRhZyA9ICdkZXZpY2U9c2RhJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJhdGVneS50YWcgPSBzdHJhdGVneS50YWcuc3Vic3RyaW5nKDcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RyYXRlZ3kubWV0cmljLmluZGV4T2YoJ25ldHdvcmsnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3RyYXRlZ3kudGFnID0gJ2lmYWNlPXNkYSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyYXRlZ3kudGFnID0gc3RyYXRlZ3kudGFnLnN1YnN0cmluZyg2KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IGFsYXJtSW5mbztcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5pZCA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5kZXBsb3ltZW50SW5mby5ob3N0RW52KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRlcGxveW1lbnRJbmZvLmhvc3RFbnYgPSAnUFJPRCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkU3RyYXRlZ3koKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbml0SG9zdEdyb3VwTGlzdCgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBob3N0R3JvdXBTZXJ2aWNlO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGluaXQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbmZpZ0hvc3RHcm91cExpc3QgPSB0aGlzLmNvbmZpZy5ob3N0R3JvdXBMaXN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0ZpbmQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ0hvc3RHcm91cExpc3QgJiYgY29uZmlnSG9zdEdyb3VwTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaG9zdEdyb3VwIG9mIHRoaXMuaG9zdEdyb3VwTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdEdyb3VwLmlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5ob3N0R3JvdXBMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNGaW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMCwgbDEgPSBjb25maWdIb3N0R3JvdXBMaXN0Lmxlbmd0aDsgaiA8IGwxOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnSG9zdEdyb3VwTGlzdFtqXS5pZCA9PT0gdGhpcy5ob3N0R3JvdXBMaXN0W2ldLmlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRmluZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaG9zdEdyb3VwTGlzdFtpXS5pc1NlbGVjdGVkID0gaXNGaW5kO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhvc3RHcm91cExpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnaG9zdGdyb3VwJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaG9zdEdyb3VwU2VydmljZSA9IG5ldyBIb3N0R3JvdXBTZXJ2aWNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaG9zdEdyb3VwU2VydmljZS5nZXREYXRhKCkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaG9zdEdyb3VwTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+iOt+WPluS4u+acuue7hOS/oeaBr+Wksei0pe+8gScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygnaG9zdGdyb3VwJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5pdEdyb3VwTGlzdCgpIHtcclxuICAgICAgICAgICAgICAgIGxldCB1c2VyR3JvdXBMaXN0ID0gdGhpcy5jb25maWcudXNlckdyb3VwTGlzdDtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbml0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpc0ZpbmQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF1c2VyR3JvdXBMaXN0IHx8IHVzZXJHcm91cExpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5ncm91cExpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwTGlzdFtpXS5pc1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuZ3JvdXBMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNGaW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMCwgbDEgPSB1c2VyR3JvdXBMaXN0Lmxlbmd0aDsgaiA8IGwxOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ncm91cExpc3RbaV0uaWQgPT09IHVzZXJHcm91cExpc3Rbal0uaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNGaW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91cExpc3RbaV0uaXNTZWxlY3RlZCA9IGlzRmluZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ncm91cExpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnZ3JvdXBMaXN0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gJGRvbWVVc2VyLnVzZXJTZXJ2aWNlLmdldEdyb3VwKCkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGh0dHAuZ2V0KCcvYXBpL2FsYXJtL3VzZXJncm91cCcpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+iOt+WPlue7hOS/oeaBr+Wksei0pe+8gScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygnZ3JvdXBMaXN0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbml0RGVwbG95QW5kQ2x1c3Rlckxpc3QoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlcGxveW1lbnRJbmZvID0gdGhpcy5jb25maWcuZGVwbG95bWVudEluZm87XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGVwbG95TGlzdElucy5kZXBsb3lMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdkZXBsb3knKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKFskZG9tZURlcGxveS5kZXBsb3lTZXJ2aWNlLmdldExpc3QoKSwgY2x1c3RlclNlcnZpY2UuZ2V0RGF0YSgpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMuaW5pdChyZXNbMF0uZGF0YS5yZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlckxpc3QgPSByZXNbMV0uZGF0YS5yZXN1bHQgfHwgW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkZXBsb3ltZW50SW5mby5jbHVzdGVyTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3ltZW50SW5mby5jbHVzdGVyTmFtZSA9IHRoaXMuY2x1c3Rlckxpc3RbMF0ubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVDbHVzdGVyKHRoaXMuY2x1c3Rlckxpc3RbMF0ubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVIb3N0RW52KGRlcGxveW1lbnRJbmZvLmhvc3RFbnYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcGxveUxpc3RJbnMuZGVwbG95LmlkID0gZGVwbG95bWVudEluZm8uaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95TGlzdElucy5kZXBsb3kubmFtZSA9IGRlcGxveW1lbnRJbmZvLmRlcGxveW1lbnROYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn6I635Y+W5L+h5oGv5aSx6LSl77yBJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJbnMuZmluaXNoTG9hZGluZygnZGVwbG95Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUhvc3RFbnYoZGVwbG95bWVudEluZm8uaG9zdEVudik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwbG95TGlzdElucy5kZXBsb3kuaWQgPSBkZXBsb3ltZW50SW5mby5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveS5uYW1lID0gZGVwbG95bWVudEluZm8uZGVwbG95bWVudE5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gQHBhcmFtIHR5cGU6ICdob3N0Jy8nZGVwbG95J1xyXG4gICAgICAgICAgICB0b2dnbGVUZW1wbGF0ZVR5cGUodHlwZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09IHRoaXMuY29uZmlnLnRlbXBsYXRlVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnRlbXBsYXRlVHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5zdHJhdGVneUxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkU3RyYXRlZ3koKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhZGRTdHJhdGVneSgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnN0cmF0ZWd5TGlzdC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBtZXRyaWM6ICdjcHVfcGVyY2VudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGFnOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICBwb2ludE51bTogMyxcclxuICAgICAgICAgICAgICAgICAgICBhZ2dyZWdhdGVUeXBlOiAnYXZnJyxcclxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRvcjogJz09JyxcclxuICAgICAgICAgICAgICAgICAgICByaWdodFZhbHVlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIG5vdGU6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1heFN0ZXA6IDNcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZVN0cmF0ZWd5KGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5zdHJhdGVneUxpc3Quc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0b2dnbGVTdHJhdGVneU1ldHJpYyhzdHJhdGVneUluZGV4LCBtZXRyaWMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzdHJhdGVneSA9IHRoaXMuY29uZmlnLnN0cmF0ZWd5TGlzdFtzdHJhdGVneUluZGV4XTtcclxuICAgICAgICAgICAgICAgIGlmIChzdHJhdGVneS5tZXRyaWMgPT09IG1ldHJpYykgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1ldHJpYyA9PT0gJ2FnZW50X2FsaXZlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0cmF0ZWd5LmFnZ3JlZ2F0ZVR5cGUgPSAnbWF4JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN0cmF0ZWd5Lm1ldHJpYyA9IG1ldHJpYztcclxuICAgICAgICAgICAgICAgIHN0cmF0ZWd5LnRhZyA9ICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRvZ2dsZUhvc3RFbnYoZW52KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5kZXBsb3ltZW50SW5mby5ob3N0RW52ID0gZW52O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0SW5zLmZpbHRlckRlcGxveSh0aGlzLmNvbmZpZy5kZXBsb3ltZW50SW5mby5jbHVzdGVyTmFtZSwgZW52KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0b2dnbGVDbHVzdGVyKGNsdXN0ZXJOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5kZXBsb3ltZW50SW5mby5jbHVzdGVyTmFtZSA9IGNsdXN0ZXJOYW1lO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXBsb3lMaXN0SW5zLmZpbHRlckRlcGxveShjbHVzdGVyTmFtZSwgdGhpcy5jb25maWcuZGVwbG95bWVudEluZm8uaG9zdEVudik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZ2V0Rm9ybWFydENvbmZpZygpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjb25maWcgPSB7fTtcclxuICAgICAgICAgICAgICAgIGNvbmZpZy50ZW1wbGF0ZU5hbWUgPSB0aGlzLmNvbmZpZy50ZW1wbGF0ZU5hbWU7XHJcbiAgICAgICAgICAgICAgICBjb25maWcudGVtcGxhdGVUeXBlID0gdGhpcy5jb25maWcudGVtcGxhdGVUeXBlO1xyXG4gICAgICAgICAgICAgICAgY29uZmlnLmlkID0gdGhpcy5jb25maWcuaWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZy50ZW1wbGF0ZVR5cGUgPT0gJ2hvc3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLnRlbXBsYXRlVHlwZSA9IHRoaXMuY29uZmlnLnRlbXBsYXRlVHlwZTtcclxuICAgICAgICAgICAgICAgICAgICBjb25maWcuaG9zdEdyb3VwTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5ob3N0R3JvdXBMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ob3N0R3JvdXBMaXN0W2ldLmlzU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5ob3N0R3JvdXBMaXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLmhvc3RHcm91cExpc3RbaV0uaWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb25maWcudGVtcGxhdGVUeXBlID09ICdkZXBsb3knKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLmRlcGxveW1lbnRJbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2x1c3Rlck5hbWU6IHRoaXMuY29uZmlnLmRlcGxveW1lbnRJbmZvLmNsdXN0ZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBsb3ltZW50TmFtZTogdGhpcy5kZXBsb3lMaXN0SW5zLmRlcGxveS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBob3N0RW52OiB0aGlzLmNvbmZpZy5kZXBsb3ltZW50SW5mby5ob3N0RW52XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25maWcuc3RyYXRlZ3lMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzdHJhdGVneSBvZiB0aGlzLmNvbmZpZy5zdHJhdGVneUxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3U3RyYXRlZ3kgPSBhbmd1bGFyLmNvcHkoc3RyYXRlZ3kpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdTdHJhdGVneS5tZXRyaWMgPT0gJ2FnZW50X2FsaXZlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdTdHJhdGVneS5yaWdodFZhbHVlID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RyYXRlZ3kub3BlcmF0b3IgPSAnPCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdTdHJhdGVneS50YWcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1N0cmF0ZWd5Lm1ldHJpYyA9PSAnZGlza19wZXJjZW50Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RyYXRlZ3kudGFnID0gJ21vdW50PScgKyBuZXdTdHJhdGVneS50YWc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3U3RyYXRlZ3kubWV0cmljLmluZGV4T2YoJ2Rpc2snKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0cmF0ZWd5LnRhZyA9ICdkZXZpY2U9JyArIG5ld1N0cmF0ZWd5LnRhZztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdTdHJhdGVneS5tZXRyaWMuaW5kZXhPZignbmV0d29yaycpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RyYXRlZ3kudGFnID0gJ2lmYWNlPScgKyBuZXdTdHJhdGVneS50YWc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLnN0cmF0ZWd5TGlzdC5wdXNoKG5ld1N0cmF0ZWd5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25maWcudXNlckdyb3VwTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLmdyb3VwTGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ncm91cExpc3RbaV0uaXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcudXNlckdyb3VwTGlzdC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLmdyb3VwTGlzdFtpXS5pZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25maWcuY2FsbGJhY2sgPSBhbmd1bGFyLmNvcHkodGhpcy5jb25maWcuY2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY29uZmlnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjb25maWc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY3JlYXRlKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIF9hbGFybVNlcnZpY2Uuc2V0RGF0YSh0aGlzLmdldEZvcm1hcnRDb25maWcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbW9kaWZ5KCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIF9hbGFybVNlcnZpY2UudXBkYXRlRGF0YSh0aGlzLmdldEZvcm1hcnRDb25maWcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGhvc3RHcm91cOa3u+WKoOS4u+aculxyXG4gICAgICAgIGNsYXNzIE5vZGVMaXN0IGV4dGVuZHMgJGRvbWVNb2RlbC5TZWxlY3RMaXN0TW9kZWwge1xyXG5cclxuICAgICAgICAgICAgY29uc3RydWN0b3Iobm9kZUxpc3QsIGNsdXN0ZXJOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBzdXBlcignbm9kZUxpc3QnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQobm9kZUxpc3QsIGNsdXN0ZXJOYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbml0KG5vZGVMaXN0LCBjbHVzdGVyTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFub2RlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVMaXN0ID0gdGhpcy5ub2RlTGlzdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghY2x1c3Rlck5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyTmFtZSA9IHRoaXMuY2x1c3Rlck5hbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIW5vZGVMaXN0IHx8ICFjbHVzdGVyTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlck5hbWUgPSBjbHVzdGVyTmFtZTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZUxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzZWxlY3RlZE5vZGUgb2YgdGhpcy5zZWxlY3RlZExpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkTm9kZS5jbHVzdGVyID09PSBjbHVzdGVyTmFtZSAmJiBzZWxlY3RlZE5vZGUubmFtZSA9PT0gbm9kZS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmlzU2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFub2RlLmlzU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc3VwZXIuaW5pdChub2RlTGlzdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5pdFNlbGVjdGVkTGlzdCgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrQWxsSXRlbShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2hlY2tBbGxJdGVtKGlzQ2hlY2tBbGwpIHtcclxuICAgICAgICAgICAgICAgIHN1cGVyLmNoZWNrQWxsSXRlbShpc0NoZWNrQWxsKTtcclxuICAgICAgICAgICAgICAgIGlmIChpc0NoZWNrQWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLm5vZGVMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmlzU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc0V4aXN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzZWxlY3RlZE5vZGUgb2YgdGhpcy5zZWxlY3RlZExpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jbHVzdGVyTmFtZSA9PT0gc2VsZWN0ZWROb2RlLmNsdXN0ZXIgJiYgbm9kZS5uYW1lID09PSBzZWxlY3RlZE5vZGUubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0V4aXN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0V4aXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3QucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5vZGUubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXA6IG5vZGUuaXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsdXN0ZXI6IHRoaXMuY2x1c3Rlck5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLm5vZGVMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zZWxlY3RlZExpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZE5vZGUgPSB0aGlzLnNlbGVjdGVkTGlzdFtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsdXN0ZXJOYW1lID09PSBzZWxlY3RlZE5vZGUuY2x1c3RlciAmJiBub2RlLm5hbWUgPT09IHNlbGVjdGVkTm9kZS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3Quc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGktLTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0b2dnbGVDaGVjayhpdGVtLCBpc1NlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICBzdXBlci50b2dnbGVDaGVjayhpdGVtLCBpc1NlbGVjdGVkKTtcclxuICAgICAgICAgICAgICAgIGlmIChpc1NlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jbHVzdGVyID0gdGhpcy5jbHVzdGVyTmFtZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlzdC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpcDogaXRlbS5pcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2x1c3RlcjogaXRlbS5jbHVzdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zZWxlY3RlZExpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRMaXN0W2ldLm5hbWUgPT09IGl0ZW0ubmFtZSAmJiB0aGlzLnNlbGVjdGVkTGlzdFtpXS5jbHVzdGVyID09PSB0aGlzLmNsdXN0ZXJOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlzdC5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWxldGVTZWxlY3RlZE5vZGUobm9kZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuY2x1c3RlciA9PT0gdGhpcy5jbHVzdGVyTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ05vZGUgb2YgdGhpcy5ub2RlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2lnTm9kZS5uYW1lID09PSBub2RlLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1cGVyLnRvZ2dsZUNoZWNrKHNpZ05vZGUsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNlbGVjdGVkTGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkTGlzdFtpXS5uYW1lID09PSBub2RlLm5hbWUgJiYgdGhpcy5zZWxlY3RlZExpc3RbaV0uY2x1c3RlciA9PT0gbm9kZS5jbHVzdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0LnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZpbHRlcldpdGhLZXkoa2V5d29yZHMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc2lnSXRlbSBvZiB0aGlzLm5vZGVMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGV4aXN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgc2lnSXRlbS5rZXlGaWx0ZXIgPSBzaWdJdGVtLm5hbWUuaW5kZXhPZihrZXl3b3JkcykgIT09IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaWdJdGVtLmtleUZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzZWxlY3RlZE5vZGUgb2YgdGhpcy5zZWxlY3RlZExpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZE5vZGUubmFtZSA9PT0gc2lnSXRlbS5uYW1lICYmIHNlbGVjdGVkTm9kZS5jbHVzdGVyID09PSB0aGlzLmNsdXN0ZXJOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnSXRlbS5pc1NlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNpZ0l0ZW0uaXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnSXRlbS5pc1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0NoZWNrQWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaWdJdGVtLmlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZENvdW50ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBnZXRJbnN0YW5jZSA9ICRkb21lTW9kZWwuaW5zdGFuY2VzQ3JlYXRvcih7XHJcbiAgICAgICAgICAgIE5vZGVMaXN0OiBOb2RlTGlzdCxcclxuICAgICAgICAgICAgQWxhcm1TZXJ2aWNlOiBBbGFybVNlcnZpY2UsXHJcbiAgICAgICAgICAgIEhvc3RHcm91cFNlcnZpY2U6IEhvc3RHcm91cFNlcnZpY2UsXHJcbiAgICAgICAgICAgIEFsYXJtVGVtcGxhdGU6IEFsYXJtVGVtcGxhdGUsXHJcbiAgICAgICAgICAgIFVzZXJHcm91cFNlcnZpY2U6IFVzZXJHcm91cFNlcnZpY2VcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgYWxhcm1FdmVudFNlcnZpY2UgPSB7XHJcbiAgICAgICAgICAgIGdldERhdGE6ICgpID0+ICRodHRwLmdldCgnL2FwaS9hbGFybS9ldmVudCcpLFxyXG4gICAgICAgICAgICBpZ25vcmU6IGRhdGEgPT4gJGh0dHAucG9zdCgnL2FwaS9hbGFybS9ldmVudC9pZ25vcmUnLCBkYXRhKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0SW5zdGFuY2U6IGdldEluc3RhbmNlLFxyXG4gICAgICAgICAgICBhbGFybUV2ZW50U2VydmljZTogYWxhcm1FdmVudFNlcnZpY2UsXHJcbiAgICAgICAgICAgIGtleU1hcHM6IGtleU1hcHNcclxuICAgICAgICB9O1xyXG4gICAgfV0pO1xyXG59KSh3aW5kb3cuZG9tZUFwcCk7Il19
