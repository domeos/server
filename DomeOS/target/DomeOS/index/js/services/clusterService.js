'use strict';

/*
 * @author ChandraLee
 * @description 集群服务
 */

(function (domeApp, undefined) {
    'use strict';

    if (typeof domeApp === 'undefined') return;
    domeApp.factory('$domeCluster', ['$http', '$q', '$modal', '$domePublic', '$domeModel', '$util', function ($http, $q, $modal, $domePublic, $domeModel, $util) {
        var ClusterService = function ClusterService() {
            var _this = this;

            this.url = '/api/cluster';
            $domeModel.ServiceModel.call(this, this.url);
            var deleteData = this.deleteData;

            this.getNamespace = function (clusterId) {
                return $http.get(_this.url + '/' + clusterId + '/namespace');
            };
            this.setNamespace = function (clusterId, namespaceList) {
                return $http.post(_this.url + '/' + clusterId + '/namespace', angular.toJson(namespaceList));
            };
            this.deleteData = function (id) {
                var defered = $q.defer();
                $domePublic.openDelete().then(function () {
                    deleteData(id).then(function () {
                        $domePublic.openPrompt('删除成功！');
                        defered.resolve();
                    }, function (res) {
                        $domePublic.openWarning({
                            title: '删除失败！',
                            msg: res.data.resultMsg
                        });
                        defered.reject();
                    });
                }, function () {
                    defered.reject();
                });
                return defered.promise;
            };
        };
        var NodeService = function NodeService() {
            var _this2 = this;

            ClusterService.call(this);
            this.getNodeList = function (clusterId) {
                return $http.get(_this2.url + '/' + clusterId + '/nodelist');
            };
            this.getNodeInfo = function (clusterId, hostname) {
                return $http.get(_this2.url + '/' + clusterId + '/node/' + hostname);
            };
            this.getHostInstances = function (clusterId, hostname) {
                return $http.get(_this2.url + '/' + clusterId + '/nodelist/' + hostname);
            };
            this.updateDisk = function (clusterId, nodeName, path) {
                return $http.post(_this2.url + '/' + clusterId + '/' + nodeName + '/disk?path=' + path);
            };
            this.addLabel = function (clusterId, labelInfo) {
                return $http.post(_this2.url + '/' + clusterId + '/nodelabels/add', angular.toJson(labelInfo));
            };
            this.deleteLabel = function (clusterId, labelInfo) {
                return $http.post(_this2.url + '/' + clusterId + '/nodelabels/delete', angular.toJson(labelInfo));
            };
            this.modifyNodeDisk = function (clusterId, nodeName, path) {
                return $http.post(_this2.url + '/' + clusterId + '/' + nodeName + '/disk?path=' + path);
            };
        };
        // nodeList Class
        var NodeList = function NodeList(nodes, isFilterDisk) {
            this.isCheckAll = false;
            this.nodeList = [];
            this.selectedCount = 0;
            this.labelsInfo = {};
            this.init(nodes, isFilterDisk);
        };
        NodeList.prototype = {
            // @params nodes: [], getNodeList() 接口返回的node数据结构
            // @params isFilterDisk : 是否过滤掉nodes中diskinfo等于null或''的node
            init: function init(nodes, isFilterDisk) {
                var _this3 = this;

                if (isFilterDisk !== true) {
                    isFilterDisk = false;
                }
                // nodeList：nodes中每个node添加keyFilter、labelFilter、isSelected属性之后的重新生成的Array。
                this.nodeList = function () {
                    nodes = nodes ? nodes : [];
                    for (var i = 0; i < nodes.length; i++) {
                        if (isFilterDisk && !nodes[i].diskInfo) {
                            nodes.splice(i, 1);
                            i--;
                            continue;
                        }
                        // 关键字过滤结果
                        nodes[i].keyFilter = true;
                        // label过滤结果
                        nodes[i].labelFilter = true;
                        nodes[i].isSelected = false;
                    }
                    return nodes;
                }();
                // labelsInfo ：{labelname:{contents:[labelcontent1,labelcontent2],isSelected:true/false,isShow:true/false}};
                // contents为labelkey对应的labelcontent；isSelected是否被选中；isShow是否展示在页面上。
                this.labelsInfo = function () {
                    var map = {};
                    var nodeList = _this3.nodeList;
                    for (var i = 0, l = nodeList.length; i < l; i++) {
                        for (var key in nodeList[i].labels) {
                            if (nodeList[i].labels.hasOwnProperty(key) && key != 'kubernetes.io/hostname' && key != 'hostEnv') {
                                if (map[key]) {
                                    var isContentExist = false;
                                    for (var j = 0, l1 = map[key].contents.length; j < l1; j++) {
                                        if (map[key].contents[j] === nodeList[i].labels[key]) {
                                            isContentExist = true;
                                            break;
                                        }
                                    }
                                    if (!isContentExist) {
                                        map[key].contents.push(nodeList[i].labels[key]);
                                    }
                                } else {
                                    map[key] = {
                                        contents: [nodeList[i].labels[key]],
                                        isSelected: false,
                                        isShow: true
                                    };
                                }
                            }
                        }
                    }
                    if (map.PRODENV) {
                        map.PRODENV.isShow = false;
                    } else {
                        map.PRODENV = {
                            isShow: false,
                            contents: [],
                            isSelected: false
                        };
                    }
                    if (map.TESTENV) {
                        map.TESTENV.isShow = false;
                    } else {
                        map.TESTENV = {
                            isShow: false,
                            contents: [],
                            isSelected: false
                        };
                    }
                    if (map.BUILDENV) {
                        map.BUILDENV.isShow = false;
                    } else {
                        map.BUILDENV = {
                            isShow: false,
                            contents: [],
                            isSelected: false
                        };
                    }
                    return map;
                }();
            },
            initLabelsInfo: function initLabelsInfo() {
                for (var label in this.labelsInfo) {
                    if (this.labelsInfo.hasOwnProperty(label) && this.labelsInfo[label].isSelected) {
                        this.labelsInfo[label].isSelected = false;
                    }
                }
                this.toggleLabelNodes();
            },
            // @param env : 'PROD'(生产环境) or 'TEST'(测试环境)
            toggleEnv: function toggleEnv(env) {
                if (env == 'PROD' || env == 'TEST') {
                    this.labelsInfo.TESTENV.isSelected = env != 'PROD';
                    this.labelsInfo.PRODENV.isSelected = env == 'PROD';
                }
                this.toggleLabelNodes();
            },
            // 切换单个node的选中状态之后调用
            toggleNodeCheck: function toggleNodeCheck(node) {
                var isAllHasChange = true;
                if (node.isSelected) {
                    this.selectedCount++;
                    // 是否为全选
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = this.nodeList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var _node = _step.value;

                            // 过滤的node中有node未选中
                            if (_node.keyFilter && _node.labelFilter && !_node.isSelected) {
                                isAllHasChange = false;
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

                    if (isAllHasChange) {
                        this.isCheckAll = true;
                    }
                } else {
                    this.selectedCount--;
                    this.isCheckAll = false;
                }
            },
            // 关键字过滤node
            filterWithKey: function filterWithKey(keywords) {
                this.isCheckAll = false;
                this.selectedCount = 0;
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.nodeList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var node = _step2.value;

                        node.isSelected = false;
                        node.keyFilter = node.name.indexOf(keywords) !== -1;
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
            },
            // 全选/全不选 node
            checkAllNode: function checkAllNode(isCheckAll) {
                this.isCheckAll = typeof isCheckAll === 'undefined' ? this.isCheckAll : isCheckAll;
                this.selectedCount = 0;
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this.nodeList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var node = _step3.value;

                        if (node.keyFilter && node.labelFilter && this.isCheckAll) {
                            node.isSelected = true;
                            this.selectedCount++;
                        } else {
                            node.isSelected = false;
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
            },
            // 切换单个label选中状态，label:labelkey，isSelect:true/false
            toggleLabel: function toggleLabel(label, isSelect) {
                if (!this.labelsInfo[label]) {
                    return;
                }
                if (typeof isSelect !== 'undefined') {
                    if (this.labelsInfo[label].isSelected === isSelect) {
                        return;
                    }
                    this.labelsInfo[label].isSelected = isSelect;
                } else {
                    this.labelsInfo[label].isSelected = !this.labelsInfo[label].isSelected;
                }
                this.toggleLabelNodes();
            },
            // 根据label对node进行过滤
            toggleLabelNodes: function toggleLabelNodes() {
                var isHasLabelSelected = false;
                this.isCheckAll = false;
                this.selectedCount = 0;
                angular.forEach(this.labelsInfo, function (value) {
                    if (!isHasLabelSelected && value.isSelected) {
                        isHasLabelSelected = true;
                    }
                });
                if (!isHasLabelSelected) {
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = this.nodeList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var node = _step4.value;

                            node.isSelected = false;
                            node.labelFilter = true;
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
                } else {
                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = this.nodeList[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var _node2 = _step5.value;

                            var hasAllSelect = true;
                            _node2.isSelected = false;
                            for (var key in this.labelsInfo) {
                                if (this.labelsInfo.hasOwnProperty(key) && this.labelsInfo[key].isSelected && _node2.labels[key] === void 0) {
                                    hasAllSelect = false;
                                    break;
                                }
                            }
                            _node2.labelFilter = hasAllSelect;
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
            },
            // 弹出框展示node
            showHost: function showHost() {
                var _this4 = this;

                var hostModalIns = $modal.open({
                    animation: true,
                    templateUrl: '/index/tpl/modal/hostListModal/hostListModal.html',
                    controller: 'HostListModalCtr',
                    size: 'lg',
                    resolve: {
                        hostList: function hostList() {
                            return _this4.nodeList;
                        }
                    }
                });
                return hostModalIns.result;
            },
            // @return labelSelectors = [{labelKey1:labelContent1,labelKey1:labelContent2}];
            getFormartSelectedLabels: function getFormartSelectedLabels() {
                var labelSelectors = [];
                angular.forEach(this.labelsInfo, function (value, key) {
                    if (value.isSelected) {
                        for (var i = 0, l = value.contents.length; i < l; i++) {
                            labelSelectors.push({
                                name: key,
                                content: value.contents[i]
                            });
                        }
                    }
                });
                return labelSelectors;
            },
            // @return ['nodename1','nodename2']
            getSelectedNodes: function getSelectedNodes() {
                var nodes = [];
                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = this.nodeList[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var node = _step6.value;

                        if (node.isSelected) {
                            nodes.push(node.name);
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

                return nodes;
            }
        };
        // Cluster Class
        var Cluster = function Cluster(clusterInfo) {
            // creator info
            // this.userList = [];
            this.etcdValid = true;
            this.zookeeperValid = true;
            this.kafkaValid = true;
            this.config = {};
            this.init(clusterInfo);
        };
        Cluster.prototype = {
            constructor: Cluster,
            init: function init(clusterInfo) {
                var etcd = [],
                    etcdStrArr = void 0,
                    zookeeper = [],
                    zookeeperStrArr = void 0,
                    kafka = [],
                    kafkaStrArr = void 0;
                if (!$util.isObject(clusterInfo)) {
                    clusterInfo = {};
                }
                // 初始化etcd：etcd:'etcd1,etcd2'--> etcd:[{name:'etcd1'},{name:'etcd2'}]
                if (typeof clusterInfo.etcd === 'string') {
                    etcdStrArr = clusterInfo.etcd.split(',');
                    for (var i = 0, l = etcdStrArr.length; i < l; i++) {
                        if (etcdStrArr[i] !== '') {
                            etcd.push({
                                name: etcdStrArr[i]
                            });
                        }
                    }
                }
                etcd.push({
                    name: ''
                });
                clusterInfo.etcd = etcd;
                // 初始化clusterLog
                if (!$util.isObject(clusterInfo.clusterLog)) {
                    clusterInfo.clusterLog = {};
                }
                // 初始化clusterLog.zookeeper：
                // zookeeper:'zookeeper1,zookeepe2'--> zookeeper:[{name:'zookeeper1'},{name:'zookeepe2'}]
                if (typeof clusterInfo.clusterLog.zookeeper === 'string') {
                    zookeeperStrArr = clusterInfo.clusterLog.zookeeper.split(',');
                    for (var _i = 0, _l = zookeeperStrArr.length; _i < _l; _i++) {
                        if (zookeeperStrArr[_i] !== '') {
                            zookeeper.push({
                                name: zookeeperStrArr[_i]
                            });
                        }
                    }
                }
                zookeeper.push({
                    name: ''
                });
                clusterInfo.clusterLog.zookeeper = zookeeper;
                // 初始化clusterLog.kafka，同zookeeper
                if (typeof clusterInfo.clusterLog.kafka === 'string') {
                    kafkaStrArr = clusterInfo.clusterLog.kafka.split(',');
                    for (var _i2 = 0, _l2 = kafkaStrArr.length; _i2 < _l2; _i2++) {
                        if (kafkaStrArr[_i2] !== '') {
                            kafka.push({
                                name: kafkaStrArr[_i2]
                            });
                        }
                    }
                }
                kafka.push({
                    name: ''
                });
                clusterInfo.clusterLog.kafka = kafka;

                // 新增isHttps字段，表示是否启动https
                clusterInfo.isHttps = typeof clusterInfo.api !== 'undefined' && clusterInfo.api.indexOf('https://') === 0;
                if (clusterInfo.isHttps) {
                    // 去掉https://开头，用于页面展示。在最后传递数据时需要补回来
                    clusterInfo.api = clusterInfo.api.substring(8);
                }

                if (!clusterInfo.logConfig) {
                    clusterInfo.logConfig = 0;
                }
                this.config = clusterInfo;
            },
            addEtcd: function addEtcd() {
                this.config.etcd.push({
                    name: ''
                });
            },
            addKafka: function addKafka() {
                this.config.clusterLog.kafka.push({
                    name: ''
                });
            },
            addZookeeper: function addZookeeper() {
                this.config.clusterLog.zookeeper.push({
                    name: ''
                });
            },
            deleteArrItem: function deleteArrItem(item, index) {
                this.config[item].splice(index, 1);
            },
            deleteLogArrItem: function deleteLogArrItem(item, index) {
                this.config.clusterLog[item].splice(index, 1);
            },
            toggleUser: function toggleUser(user) {
                if (Object.prototype.toString.call(user) !== '[object Object]') return;
                this.config.ownerName = user.name;
                this.creatorDraft = {
                    creatorType: user.type,
                    creatorId: user.id
                };
            },
            toggleLogConfig: function toggleLogConfig() {
                this.config.logConfig = this.config.logConfig === 1 ? 0 : 1;
            },
            validItem: function validItem(item) {
                var valid = false;
                if (item != 'etcd' && this.config.logConfig === 0) {
                    valid = true;
                } else {
                    var itemArr = item == 'etcd' ? this.config.etcd : this.config.clusterLog[item] || [];
                    for (var i = 0, l = itemArr.length; i < l; i++) {
                        if (itemArr[i].name && itemArr[i].name !== '') {
                            valid = true;
                            break;
                        }
                    }
                }
                switch (item) {
                    case 'etcd':
                        this.etcdValid = valid;
                        break;
                    case 'zookeeper':
                        this.zookeeperValid = valid;
                        break;
                    case 'kafka':
                        this.kafkaValid = valid;
                        break;
                    default:
                        break;
                }
                return valid;
            },
            modify: function modify() {
                return $http.put('/api/cluster', angular.toJson(this._formartCluster()));
            },
            // 转换为于后台交互的cluster的数据结构
            _formartCluster: function _formartCluster() {
                var clusterConfig = angular.copy(this.config),
                    etcd = '',
                    zookeeper = '',
                    kafka = '';
                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                    for (var _iterator7 = clusterConfig.etcd[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                        var sigEtcd = _step7.value;

                        if (sigEtcd.name) {
                            etcd += sigEtcd.name + ',';
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

                clusterConfig.etcd = etcd;

                if (clusterConfig.logConfig === 0) {
                    clusterConfig.clusterLog = null;
                } else {
                    var _iteratorNormalCompletion8 = true;
                    var _didIteratorError8 = false;
                    var _iteratorError8 = undefined;

                    try {
                        for (var _iterator8 = clusterConfig.clusterLog.zookeeper[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            var sigZookeeper = _step8.value;

                            if (sigZookeeper.name) {
                                zookeeper += sigZookeeper.name + ',';
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

                    clusterConfig.clusterLog.zookeeper = zookeeper;

                    var _iteratorNormalCompletion9 = true;
                    var _didIteratorError9 = false;
                    var _iteratorError9 = undefined;

                    try {
                        for (var _iterator9 = clusterConfig.clusterLog.kafka[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                            var sigKafka = _step9.value;

                            if (sigKafka.name) {
                                kafka += sigKafka.name + ',';
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

                    clusterConfig.clusterLog.kafka = kafka;
                }
                if (!clusterConfig.isHttps) {
                    clusterConfig.username = clusterConfig.password = void 0;
                } else {
                    clusterConfig.api = 'https://' + clusterConfig.api;
                }
                clusterConfig.isHttps = void 0;
                return clusterConfig;
            },
            _formartNewCluster: function _formartNewCluster(cluster) {
                var formartNewCluster = {};

                formartNewCluster.clusterInfo = cluster;
                formartNewCluster.creatorDraft = this.creatorDraft;
                return formartNewCluster;
            },
            create: function create() {
                var cluster = this._formartCluster(),
                    newCluster = this._formartNewCluster(cluster);
                return $http.post('/api/cluster', angular.toJson(newCluster));
            }
        };
        // ClusterList Class
        var ClusterList = function ClusterList(list) {
            this.cluster = {};
            this.clusterList = [];
            this.init(list);
        };
        ClusterList.prototype = {
            init: function init(list) {
                this.clusterList = list || [];
            },
            toggleCluster: function toggleCluster(index) {
                this.cluster.id = this.clusterList[index].id;
                this.cluster.name = this.clusterList[index].name;
            }
        };
        // 获得实例
        var getInstance = $domeModel.instancesCreator({
            ClusterList: ClusterList,
            Cluster: Cluster,
            NodeList: NodeList,
            ClusterService: ClusterService,
            NodeService: NodeService
        });

        return {
            getInstance: getInstance
        };
    }]);
})(window.domeApp);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L2pzL3NlcnZpY2VzL2NsdXN0ZXJTZXJ2aWNlLmVzIl0sIm5hbWVzIjpbImRvbWVBcHAiLCJ1bmRlZmluZWQiLCJmYWN0b3J5IiwiJGh0dHAiLCIkcSIsIiRtb2RhbCIsIiRkb21lUHVibGljIiwiJGRvbWVNb2RlbCIsIiR1dGlsIiwiQ2x1c3RlclNlcnZpY2UiLCJ1cmwiLCJTZXJ2aWNlTW9kZWwiLCJjYWxsIiwiZGVsZXRlRGF0YSIsImdldE5hbWVzcGFjZSIsImdldCIsImNsdXN0ZXJJZCIsInNldE5hbWVzcGFjZSIsIm5hbWVzcGFjZUxpc3QiLCJwb3N0IiwiYW5ndWxhciIsInRvSnNvbiIsImRlZmVyZWQiLCJkZWZlciIsIm9wZW5EZWxldGUiLCJ0aGVuIiwiaWQiLCJvcGVuUHJvbXB0IiwicmVzb2x2ZSIsInJlcyIsIm9wZW5XYXJuaW5nIiwidGl0bGUiLCJtc2ciLCJkYXRhIiwicmVzdWx0TXNnIiwicmVqZWN0IiwicHJvbWlzZSIsIk5vZGVTZXJ2aWNlIiwiZ2V0Tm9kZUxpc3QiLCJnZXROb2RlSW5mbyIsImhvc3RuYW1lIiwiZ2V0SG9zdEluc3RhbmNlcyIsInVwZGF0ZURpc2siLCJub2RlTmFtZSIsInBhdGgiLCJhZGRMYWJlbCIsImxhYmVsSW5mbyIsImRlbGV0ZUxhYmVsIiwibW9kaWZ5Tm9kZURpc2siLCJOb2RlTGlzdCIsIm5vZGVzIiwiaXNGaWx0ZXJEaXNrIiwiaXNDaGVja0FsbCIsIm5vZGVMaXN0Iiwic2VsZWN0ZWRDb3VudCIsImxhYmVsc0luZm8iLCJpbml0IiwicHJvdG90eXBlIiwiaSIsImxlbmd0aCIsImRpc2tJbmZvIiwic3BsaWNlIiwia2V5RmlsdGVyIiwibGFiZWxGaWx0ZXIiLCJpc1NlbGVjdGVkIiwibWFwIiwibCIsImtleSIsImxhYmVscyIsImhhc093blByb3BlcnR5IiwiaXNDb250ZW50RXhpc3QiLCJqIiwibDEiLCJjb250ZW50cyIsInB1c2giLCJpc1Nob3ciLCJQUk9ERU5WIiwiVEVTVEVOViIsIkJVSUxERU5WIiwiaW5pdExhYmVsc0luZm8iLCJsYWJlbCIsInRvZ2dsZUxhYmVsTm9kZXMiLCJ0b2dnbGVFbnYiLCJlbnYiLCJ0b2dnbGVOb2RlQ2hlY2siLCJub2RlIiwiaXNBbGxIYXNDaGFuZ2UiLCJmaWx0ZXJXaXRoS2V5Iiwia2V5d29yZHMiLCJuYW1lIiwiaW5kZXhPZiIsImNoZWNrQWxsTm9kZSIsInRvZ2dsZUxhYmVsIiwiaXNTZWxlY3QiLCJpc0hhc0xhYmVsU2VsZWN0ZWQiLCJmb3JFYWNoIiwidmFsdWUiLCJoYXNBbGxTZWxlY3QiLCJzaG93SG9zdCIsImhvc3RNb2RhbElucyIsIm9wZW4iLCJhbmltYXRpb24iLCJ0ZW1wbGF0ZVVybCIsImNvbnRyb2xsZXIiLCJzaXplIiwiaG9zdExpc3QiLCJyZXN1bHQiLCJnZXRGb3JtYXJ0U2VsZWN0ZWRMYWJlbHMiLCJsYWJlbFNlbGVjdG9ycyIsImNvbnRlbnQiLCJnZXRTZWxlY3RlZE5vZGVzIiwiQ2x1c3RlciIsImNsdXN0ZXJJbmZvIiwiZXRjZFZhbGlkIiwiem9va2VlcGVyVmFsaWQiLCJrYWZrYVZhbGlkIiwiY29uZmlnIiwiY29uc3RydWN0b3IiLCJldGNkIiwiZXRjZFN0ckFyciIsInpvb2tlZXBlciIsInpvb2tlZXBlclN0ckFyciIsImthZmthIiwia2Fma2FTdHJBcnIiLCJpc09iamVjdCIsInNwbGl0IiwiY2x1c3RlckxvZyIsImlzSHR0cHMiLCJhcGkiLCJzdWJzdHJpbmciLCJsb2dDb25maWciLCJhZGRFdGNkIiwiYWRkS2Fma2EiLCJhZGRab29rZWVwZXIiLCJkZWxldGVBcnJJdGVtIiwiaXRlbSIsImluZGV4IiwiZGVsZXRlTG9nQXJySXRlbSIsInRvZ2dsZVVzZXIiLCJ1c2VyIiwiT2JqZWN0IiwidG9TdHJpbmciLCJvd25lck5hbWUiLCJjcmVhdG9yRHJhZnQiLCJjcmVhdG9yVHlwZSIsInR5cGUiLCJjcmVhdG9ySWQiLCJ0b2dnbGVMb2dDb25maWciLCJ2YWxpZEl0ZW0iLCJ2YWxpZCIsIml0ZW1BcnIiLCJtb2RpZnkiLCJwdXQiLCJfZm9ybWFydENsdXN0ZXIiLCJjbHVzdGVyQ29uZmlnIiwiY29weSIsInNpZ0V0Y2QiLCJzaWdab29rZWVwZXIiLCJzaWdLYWZrYSIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJfZm9ybWFydE5ld0NsdXN0ZXIiLCJjbHVzdGVyIiwiZm9ybWFydE5ld0NsdXN0ZXIiLCJjcmVhdGUiLCJuZXdDbHVzdGVyIiwiQ2x1c3Rlckxpc3QiLCJsaXN0IiwiY2x1c3Rlckxpc3QiLCJ0b2dnbGVDbHVzdGVyIiwiZ2V0SW5zdGFuY2UiLCJpbnN0YW5jZXNDcmVhdG9yIiwid2luZG93Il0sIm1hcHBpbmdzIjoiOztBQUFBOzs7OztBQUtBLENBQUMsVUFBQ0EsT0FBRCxFQUFVQyxTQUFWLEVBQXdCO0FBQ3JCOztBQUNBLFFBQUksT0FBT0QsT0FBUCxLQUFtQixXQUF2QixFQUFvQztBQUNwQ0EsWUFBUUUsT0FBUixDQUFnQixjQUFoQixFQUFnQyxDQUFDLE9BQUQsRUFBVSxJQUFWLEVBQWdCLFFBQWhCLEVBQTBCLGFBQTFCLEVBQXlDLFlBQXpDLEVBQXVELE9BQXZELEVBQWdFLFVBQVVDLEtBQVYsRUFBaUJDLEVBQWpCLEVBQXFCQyxNQUFyQixFQUE2QkMsV0FBN0IsRUFBMENDLFVBQTFDLEVBQXNEQyxLQUF0RCxFQUE2RDtBQUN6SixZQUFNQyxpQkFBaUIsU0FBakJBLGNBQWlCLEdBQVk7QUFBQTs7QUFDL0IsaUJBQUtDLEdBQUwsR0FBVyxjQUFYO0FBQ0FILHVCQUFXSSxZQUFYLENBQXdCQyxJQUF4QixDQUE2QixJQUE3QixFQUFtQyxLQUFLRixHQUF4QztBQUNBLGdCQUFNRyxhQUFhLEtBQUtBLFVBQXhCOztBQUVBLGlCQUFLQyxZQUFMLEdBQW9CO0FBQUEsdUJBQWFYLE1BQU1ZLEdBQU4sQ0FBYSxNQUFLTCxHQUFsQixTQUF5Qk0sU0FBekIsZ0JBQWI7QUFBQSxhQUFwQjtBQUNBLGlCQUFLQyxZQUFMLEdBQW9CLFVBQUNELFNBQUQsRUFBWUUsYUFBWjtBQUFBLHVCQUE4QmYsTUFBTWdCLElBQU4sQ0FBYyxN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LFNBQXhCO0FBU0E7QUFDQSxZQUFNaUYsY0FBY25LLFdBQVdvSyxnQkFBWCxDQUE0QjtBQUM1Q0wseUJBQWFBLFdBRCtCO0FBRTVDdkQscUJBQVNBLE9BRm1DO0FBRzVDOUQsc0JBQVVBLFFBSGtDO0FBSTVDeEMsNEJBQWdCQSxjQUo0QjtBQUs1QzRCLHlCQUFhQTtBQUwrQixTQUE1QixDQUFwQjs7QUFRQSxlQUFPO0FBQ0hxSSx5QkFBYUE7QUFEVixTQUFQO0FBR0gsS0E5ZStCLENBQWhDO0FBK2VILENBbGZELEVBa2ZHRSxPQUFPNUssT0FsZlYiLCJmaWxlIjoiaW5kZXgvanMvc2VydmljZXMvY2x1c3RlclNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQGF1dGhvciBDaGFuZHJhTGVlXG4gKiBAZGVzY3JpcHRpb24g6ZuG576k5pyN5YqhXG4gKi9cblxuKChkb21lQXBwLCB1bmRlZmluZWQpID0+IHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgaWYgKHR5cGVvZiBkb21lQXBwID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xuICAgIGRvbWVBcHAuZmFjdG9yeSgnJGRvbWVDbHVzdGVyJywgWyckaHR0cCcsICckcScsICckbW9kYWwnLCAnJGRvbWVQdWJsaWMnLCAnJGRvbWVNb2RlbCcsICckdXRpbCcsIGZ1bmN0aW9uICgkaHR0cCwgJHEsICRtb2RhbCwgJGRvbWVQdWJsaWMsICRkb21lTW9kZWwsICR1dGlsKSB7XG4gICAgICAgIGNvbnN0IENsdXN0ZXJTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy51cmwgPSAnL2FwaS9jbHVzdGVyJztcbiAgICAgICAgICAgICRkb21lTW9kZWwuU2VydmljZU1vZGVsLmNhbGwodGhpcywgdGhpcy51cmwpO1xuICAgICAgICAgICAgY29uc3QgZGVsZXRlRGF0YSA9IHRoaXMuZGVsZXRlRGF0YTtcblxuICAgICAgICAgICAgdGhpcy5nZXROYW1lc3BhY2UgPSBjbHVzdGVySWQgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vbmFtZXNwYWNlYCk7XG4gICAgICAgICAgICB0aGlzLnNldE5hbWVzcGFjZSA9IChjbHVzdGVySWQsIG5hbWVzcGFjZUxpc3QpID0+ICRodHRwLnBvc3QoYCR7dGhpcy51cmx9LyR7Y2x1c3RlcklkfS9uYW1lc3BhY2VgLCBhbmd1bGFyLnRvSnNvbihuYW1lc3BhY2VMaXN0KSk7XG4gICAgICAgICAgICB0aGlzLmRlbGV0ZURhdGEgPSBpZCA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGRlZmVyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5EZWxldGUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlRGF0YShpZCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCfliKDpmaTmiJDlip/vvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfliKDpmaTlpLHotKXvvIEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJlZC5wcm9taXNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgTm9kZVNlcnZpY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBDbHVzdGVyU2VydmljZS5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5nZXROb2RlTGlzdCA9IGNsdXN0ZXJJZCA9PiAkaHR0cC5nZXQoYCR7dGhpcy51cmx9LyR7Y2x1c3RlcklkfS9ub2RlbGlzdGApO1xuICAgICAgICAgICAgdGhpcy5nZXROb2RlSW5mbyA9IChjbHVzdGVySWQsIGhvc3RuYW1lKSA9PiAkaHR0cC5nZXQoYCR7dGhpcy51cmx9LyR7Y2x1c3RlcklkfS9ub2RlLyR7aG9zdG5hbWV9YCk7XG4gICAgICAgICAgICB0aGlzLmdldEhvc3RJbnN0YW5jZXMgPSAoY2x1c3RlcklkLCBob3N0bmFtZSkgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vbm9kZWxpc3QvJHtob3N0bmFtZX1gKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRGlzayA9IChjbHVzdGVySWQsIG5vZGVOYW1lLCBwYXRoKSA9PiAkaHR0cC5wb3N0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vJHtub2RlTmFtZX0vZGlzaz9wYXRoPSR7cGF0aH1gKTtcbiAgICAgICAgICAgIHRoaXMuYWRkTGFiZWwgPSAoY2x1c3RlcklkLCBsYWJlbEluZm8pID0+ICRodHRwLnBvc3QoYCR7dGhpcy51cmx9LyR7Y2x1c3RlcklkfS9ub2RlbGFiZWxzL2FkZGAsIGFuZ3VsYXIudG9Kc29uKGxhYmVsSW5mbykpO1xuICAgICAgICAgICAgdGhpcy5kZWxldGVMYWJlbCA9IChjbHVzdGVySWQsIGxhYmVsSW5mbykgPT4gJGh0dHAucG9zdChgJHt0aGlzLnVybH0vJHtjbHVzdGVySWR9L25vZGVsYWJlbHMvZGVsZXRlYCwgYW5ndWxhci50b0pzb24obGFiZWxJbmZvKSk7XG4gICAgICAgICAgICB0aGlzLm1vZGlmeU5vZGVEaXNrID0gKGNsdXN0ZXJJZCwgbm9kZU5hbWUsIHBhdGgpID0+ICRodHRwLnBvc3QoYCR7dGhpcy51cmx9LyR7Y2x1c3RlcklkfS8ke25vZGVOYW1lfS9kaXNrP3BhdGg9JHtwYXRofWApO1xuICAgICAgICB9O1xuICAgICAgICAvLyBub2RlTGlzdCBDbGFzc1xuICAgICAgICBjb25zdCBOb2RlTGlzdCA9IGZ1bmN0aW9uIChub2RlcywgaXNGaWx0ZXJEaXNrKSB7XG4gICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubm9kZUxpc3QgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICB0aGlzLmxhYmVsc0luZm8gPSB7fTtcbiAgICAgICAgICAgIHRoaXMuaW5pdChub2RlcywgaXNGaWx0ZXJEaXNrKTtcbiAgICAgICAgfTtcbiAgICAgICAgTm9kZUxpc3QucHJvdG90eXBlID0ge1xuICAgICAgICAgICAgLy8gQHBhcmFtcyBub2RlczogW10sIGdldE5vZGVMaXN0KCkg5o6l5Y+j6L+U5Zue55qEbm9kZeaVsOaNrue7k+aehFxuICAgICAgICAgICAgLy8gQHBhcmFtcyBpc0ZpbHRlckRpc2sgOiDmmK/lkKbov4fmu6Tmjolub2Rlc+S4rWRpc2tpbmZv562J5LqObnVsbOaIlicn55qEbm9kZVxuICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24gKG5vZGVzLCBpc0ZpbHRlckRpc2spIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNGaWx0ZXJEaXNrICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzRmlsdGVyRGlzayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBub2RlTGlzdO+8mm5vZGVz5Lit5q+P5Liqbm9kZea3u+WKoGtleUZpbHRlcuOAgWxhYmVsRmlsdGVy44CBaXNTZWxlY3RlZOWxnuaAp+S5i+WQjueahOmHjeaWsOeUn+aIkOeahEFycmF544CCXG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdCA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzID0gbm9kZXMgPyBub2RlcyA6IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNGaWx0ZXJEaXNrICYmICFub2Rlc1tpXS5kaXNrSW5mbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlhbPplK7lrZfov4fmu6Tnu5PmnpxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldLmtleUZpbHRlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsYWJlbOi/h+a7pOe7k+aenFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0ubGFiZWxGaWx0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0uaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlcztcbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgIC8vIGxhYmVsc0luZm8g77yae2xhYmVsbmFtZTp7Y29udGVudHM6W2xhYmVsY29udGVudDEsbGFiZWxjb250ZW50Ml0saXNTZWxlY3RlZDp0cnVlL2ZhbHNlLGlzU2hvdzp0cnVlL2ZhbHNlfX07XG4gICAgICAgICAgICAgICAgLy8gY29udGVudHPkuLpsYWJlbGtleeWvueW6lOeahGxhYmVsY29udGVudO+8m2lzU2VsZWN0ZWTmmK/lkKbooqvpgInkuK3vvJtpc1Nob3fmmK/lkKblsZXnpLrlnKjpobXpnaLkuIrjgIJcbiAgICAgICAgICAgICAgICB0aGlzLmxhYmVsc0luZm8gPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbWFwID0ge307XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVMaXN0ID0gdGhpcy5ub2RlTGlzdDtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBub2RlTGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBub2RlTGlzdFtpXS5sYWJlbHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZUxpc3RbaV0ubGFiZWxzLmhhc093blByb3BlcnR5KGtleSkgJiYga2V5ICE9ICdrdWJlcm5ldGVzLmlvL2hvc3RuYW1lJyAmJiBrZXkgIT0gJ2hvc3RFbnYnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXBba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlzQ29udGVudEV4aXN0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMCwgbDEgPSBtYXBba2V5XS5jb250ZW50cy5sZW5ndGg7IGogPCBsMTsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hcFtrZXldLmNvbnRlbnRzW2pdID09PSBub2RlTGlzdFtpXS5sYWJlbHNba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0NvbnRlbnRFeGlzdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNDb250ZW50RXhpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBba2V5XS5jb250ZW50cy5wdXNoKG5vZGVMaXN0W2ldLmxhYmVsc1trZXldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcFtrZXldID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRzOiBbbm9kZUxpc3RbaV0ubGFiZWxzW2tleV1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2hvdzogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobWFwLlBST0RFTlYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5QUk9ERU5WLmlzU2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLlBST0RFTlYgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTaG93OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hcC5URVNURU5WKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuVEVTVEVOVi5pc1Nob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5URVNURU5WID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2hvdzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXAuQlVJTERFTlYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5CVUlMREVOVi5pc1Nob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5CVUlMREVOViA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1Nob3c6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaW5pdExhYmVsc0luZm86IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBsYWJlbCBpbiB0aGlzLmxhYmVsc0luZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubGFiZWxzSW5mby5oYXNPd25Qcm9wZXJ0eShsYWJlbCkgJiYgdGhpcy5sYWJlbHNJbmZvW2xhYmVsXS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxhYmVsc0luZm9bbGFiZWxdLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUxhYmVsTm9kZXMoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBAcGFyYW0gZW52IDogJ1BST0QnKOeUn+S6p+eOr+Wigykgb3IgJ1RFU1QnKOa1i+ivleeOr+WigylcbiAgICAgICAgICAgIHRvZ2dsZUVudjogZnVuY3Rpb24gKGVudikge1xuICAgICAgICAgICAgICAgIGlmIChlbnYgPT0gJ1BST0QnIHx8IGVudiA9PSAnVEVTVCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvLlRFU1RFTlYuaXNTZWxlY3RlZCA9IGVudiAhPSAnUFJPRCc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFiZWxzSW5mby5QUk9ERU5WLmlzU2VsZWN0ZWQgPSBlbnYgPT0gJ1BST0QnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUxhYmVsTm9kZXMoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyDliIfmjaLljZXkuKpub2Rl55qE6YCJ5Lit54q25oCB5LmL5ZCO6LCD55SoXG4gICAgICAgICAgICB0b2dnbGVOb2RlQ2hlY2s6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlzQWxsSGFzQ2hhbmdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAvLyDmmK/lkKbkuLrlhajpgIlcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLm5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDov4fmu6TnmoRub2Rl5Lit5pyJbm9kZeacqumAieS4rVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUua2V5RmlsdGVyICYmIG5vZGUubGFiZWxGaWx0ZXIgJiYgIW5vZGUuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQWxsSGFzQ2hhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQWxsSGFzQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50LS07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyDlhbPplK7lrZfov4fmu6Rub2RlXG4gICAgICAgICAgICBmaWx0ZXJXaXRoS2V5OiBmdW5jdGlvbiAoa2V5d29yZHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5rZXlGaWx0ZXIgPSBub2RlLm5hbWUuaW5kZXhPZihrZXl3b3JkcykgIT09IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyDlhajpgIkv5YWo5LiN6YCJIG5vZGVcbiAgICAgICAgICAgIGNoZWNrQWxsTm9kZTogZnVuY3Rpb24gKGlzQ2hlY2tBbGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSB0eXBlb2YgaXNDaGVja0FsbCA9PT0gJ3VuZGVmaW5lZCcgPyB0aGlzLmlzQ2hlY2tBbGwgOiBpc0NoZWNrQWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLm5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmtleUZpbHRlciAmJiBub2RlLmxhYmVsRmlsdGVyICYmIHRoaXMuaXNDaGVja0FsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8g5YiH5o2i5Y2V5LiqbGFiZWzpgInkuK3nirbmgIHvvIxsYWJlbDpsYWJlbGtlee+8jGlzU2VsZWN0OnRydWUvZmFsc2VcbiAgICAgICAgICAgIHRvZ2dsZUxhYmVsOiBmdW5jdGlvbiAobGFiZWwsIGlzU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmxhYmVsc0luZm9bbGFiZWxdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpc1NlbGVjdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubGFiZWxzSW5mb1tsYWJlbF0uaXNTZWxlY3RlZCA9PT0gaXNTZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhYmVsc0luZm9bbGFiZWxdLmlzU2VsZWN0ZWQgPSBpc1NlbGVjdDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhYmVsc0luZm9bbGFiZWxdLmlzU2VsZWN0ZWQgPSAhdGhpcy5sYWJlbHNJbmZvW2xhYmVsXS5pc1NlbGVjdGVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUxhYmVsTm9kZXMoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyDmoLnmja5sYWJlbOWvuW5vZGXov5vooYzov4fmu6RcbiAgICAgICAgICAgIHRvZ2dsZUxhYmVsTm9kZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgaXNIYXNMYWJlbFNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godGhpcy5sYWJlbHNJbmZvLCAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0hhc0xhYmVsU2VsZWN0ZWQgJiYgdmFsdWUuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNIYXNMYWJlbFNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICghaXNIYXNMYWJlbFNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmxhYmVsRmlsdGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGhhc0FsbFNlbGVjdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiB0aGlzLmxhYmVsc0luZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5sYWJlbHNJbmZvLmhhc093blByb3BlcnR5KGtleSkgJiYgdGhpcy5sYWJlbHNJbmZvW2tleV0uaXNTZWxlY3RlZCAmJiBub2RlLmxhYmVsc1trZXldID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzQWxsU2VsZWN0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUubGFiZWxGaWx0ZXIgPSBoYXNBbGxTZWxlY3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8g5by55Ye65qGG5bGV56S6bm9kZVxuICAgICAgICAgICAgc2hvd0hvc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgaG9zdE1vZGFsSW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2luZGV4L3RwbC9tb2RhbC9ob3N0TGlzdE1vZGFsL2hvc3RMaXN0TW9kYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdIb3N0TGlzdE1vZGFsQ3RyJyxcbiAgICAgICAgICAgICAgICAgICAgc2l6ZTogJ2xnJyxcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaG9zdExpc3Q6ICgpID0+IHRoaXMubm9kZUxpc3RcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBob3N0TW9kYWxJbnMucmVzdWx0O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIEByZXR1cm4gbGFiZWxTZWxlY3RvcnMgPSBbe2xhYmVsS2V5MTpsYWJlbENvbnRlbnQxLGxhYmVsS2V5MTpsYWJlbENvbnRlbnQyfV07XG4gICAgICAgICAgICBnZXRGb3JtYXJ0U2VsZWN0ZWRMYWJlbHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgbGFiZWxTZWxlY3RvcnMgPSBbXTtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godGhpcy5sYWJlbHNJbmZvLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB2YWx1ZS5jb250ZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFNlbGVjdG9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiB2YWx1ZS5jb250ZW50c1tpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhYmVsU2VsZWN0b3JzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIEByZXR1cm4gWydub2RlbmFtZTEnLCdub2RlbmFtZTInXVxuICAgICAgICAgICAgZ2V0U2VsZWN0ZWROb2RlczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxldCBub2RlcyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKG5vZGUubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvLyBDbHVzdGVyIENsYXNzXG4gICAgICAgIGNvbnN0IENsdXN0ZXIgPSBmdW5jdGlvbiAoY2x1c3RlckluZm8pIHtcbiAgICAgICAgICAgIC8vIGNyZWF0b3IgaW5mb1xuICAgICAgICAgICAgLy8gdGhpcy51c2VyTGlzdCA9IFtdO1xuICAgICAgICAgICAgdGhpcy5ldGNkVmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy56b29rZWVwZXJWYWxpZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmthZmthVmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuaW5pdChjbHVzdGVySW5mbyk7XG4gICAgICAgIH07XG4gICAgICAgIENsdXN0ZXIucHJvdG90eXBlID0ge1xuICAgICAgICAgICAgY29uc3RydWN0b3I6IENsdXN0ZXIsXG4gICAgICAgICAgICBpbml0OiBmdW5jdGlvbiAoY2x1c3RlckluZm8pIHtcbiAgICAgICAgICAgICAgICBsZXQgZXRjZCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICBldGNkU3RyQXJyLCB6b29rZWVwZXIgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgem9va2VlcGVyU3RyQXJyLCBrYWZrYSA9IFtdLFxuICAgICAgICAgICAgICAgICAgICBrYWZrYVN0ckFycjtcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KGNsdXN0ZXJJbmZvKSkge1xuICAgICAgICAgICAgICAgICAgICBjbHVzdGVySW5mbyA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDliJ3lp4vljJZldGNk77yaZXRjZDonZXRjZDEsZXRjZDInLS0+IGV0Y2Q6W3tuYW1lOidldGNkMSd9LHtuYW1lOidldGNkMid9XVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2x1c3RlckluZm8uZXRjZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgZXRjZFN0ckFyciA9IGNsdXN0ZXJJbmZvLmV0Y2Quc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBldGNkU3RyQXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV0Y2RTdHJBcnJbaV0gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXRjZC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZXRjZFN0ckFycltpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGV0Y2QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY2x1c3RlckluZm8uZXRjZCA9IGV0Y2Q7XG4gICAgICAgICAgICAgICAgLy8g5Yid5aeL5YyWY2x1c3RlckxvZ1xuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNPYmplY3QoY2x1c3RlckluZm8uY2x1c3RlckxvZykpIHtcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlckluZm8uY2x1c3RlckxvZyA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDliJ3lp4vljJZjbHVzdGVyTG9nLnpvb2tlZXBlcu+8mlxuICAgICAgICAgICAgICAgIC8vIHpvb2tlZXBlcjonem9va2VlcGVyMSx6b29rZWVwZTInLS0+IHpvb2tlZXBlcjpbe25hbWU6J3pvb2tlZXBlcjEnfSx7bmFtZTonem9va2VlcGUyJ31dXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjbHVzdGVySW5mby5jbHVzdGVyTG9nLnpvb2tlZXBlciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgem9va2VlcGVyU3RyQXJyID0gY2x1c3RlckluZm8uY2x1c3RlckxvZy56b29rZWVwZXIuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB6b29rZWVwZXJTdHJBcnIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoem9va2VlcGVyU3RyQXJyW2ldICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvb2tlZXBlci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogem9va2VlcGVyU3RyQXJyW2ldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgem9va2VlcGVyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cuem9va2VlcGVyID0gem9va2VlcGVyO1xuICAgICAgICAgICAgICAgIC8vIOWIneWni+WMlmNsdXN0ZXJMb2cua2Fma2HvvIzlkIx6b29rZWVwZXJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cua2Fma2EgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGthZmthU3RyQXJyID0gY2x1c3RlckluZm8uY2x1c3RlckxvZy5rYWZrYS5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGthZmthU3RyQXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGthZmthU3RyQXJyW2ldICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGthZmthLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBrYWZrYVN0ckFycltpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGthZmthLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cua2Fma2EgPSBrYWZrYTtcblxuICAgICAgICAgICAgICAgIC8vIOaWsOWinmlzSHR0cHPlrZfmrrXvvIzooajnpLrmmK/lkKblkK/liqhodHRwc1xuICAgICAgICAgICAgICAgIGNsdXN0ZXJJbmZvLmlzSHR0cHMgPSB0eXBlb2YgY2x1c3RlckluZm8uYXBpICE9PSAndW5kZWZpbmVkJyAmJiBjbHVzdGVySW5mby5hcGkuaW5kZXhPZignaHR0cHM6Ly8nKSA9PT0gMDtcbiAgICAgICAgICAgICAgICBpZiAoY2x1c3RlckluZm8uaXNIdHRwcykge1xuICAgICAgICAgICAgICAgICAgICAvLyDljrvmjolodHRwczovL+W8gOWktO+8jOeUqOS6jumhtemdouWxleekuuOAguWcqOacgOWQjuS8oOmAkuaVsOaNruaXtumcgOimgeihpeWbnuadpVxuICAgICAgICAgICAgICAgICAgICBjbHVzdGVySW5mby5hcGkgPSBjbHVzdGVySW5mby5hcGkuc3Vic3RyaW5nKDgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghY2x1c3RlckluZm8ubG9nQ29uZmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJJbmZvLmxvZ0NvbmZpZyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnID0gY2x1c3RlckluZm87XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWRkRXRjZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmV0Y2QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWRkS2Fma2E6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jbHVzdGVyTG9nLmthZmthLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFkZFpvb2tlZXBlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNsdXN0ZXJMb2cuem9va2VlcGVyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlbGV0ZUFyckl0ZW06IGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnW2l0ZW1dLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGVsZXRlTG9nQXJySXRlbTogZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY2x1c3RlckxvZ1tpdGVtXS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRvZ2dsZVVzZXI6IGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh1c2VyKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHJldHVybjtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5vd25lck5hbWUgPSB1c2VyLm5hbWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdG9yRHJhZnQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0b3JUeXBlOiB1c2VyLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0b3JJZDogdXNlci5pZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdG9nZ2xlTG9nQ29uZmlnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcubG9nQ29uZmlnID0gdGhpcy5jb25maWcubG9nQ29uZmlnID09PSAxID8gMCA6IDE7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmFsaWRJdGVtOiBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIGxldCB2YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtICE9ICdldGNkJyAmJiB0aGlzLmNvbmZpZy5sb2dDb25maWcgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpdGVtQXJyID0gaXRlbSA9PSAnZXRjZCcgPyB0aGlzLmNvbmZpZy5ldGNkIDogdGhpcy5jb25maWcuY2x1c3RlckxvZ1tpdGVtXSB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBpdGVtQXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW1BcnJbaV0ubmFtZSAmJiBpdGVtQXJyW2ldLm5hbWUgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN3aXRjaCAoaXRlbSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2V0Y2QnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV0Y2RWYWxpZCA9IHZhbGlkO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd6b29rZWVwZXInOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnpvb2tlZXBlclZhbGlkID0gdmFsaWQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2thZmthJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rYWZrYVZhbGlkID0gdmFsaWQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsaWQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kaWZ5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnB1dCgnL2FwaS9jbHVzdGVyJywgYW5ndWxhci50b0pzb24odGhpcy5fZm9ybWFydENsdXN0ZXIoKSkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIOi9rOaNouS4uuS6juWQjuWPsOS6pOS6kueahGNsdXN0ZXLnmoTmlbDmja7nu5PmnoRcbiAgICAgICAgICAgIF9mb3JtYXJ0Q2x1c3RlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxldCBjbHVzdGVyQ29uZmlnID0gYW5ndWxhci5jb3B5KHRoaXMuY29uZmlnKSxcbiAgICAgICAgICAgICAgICAgICAgZXRjZCA9ICcnLFxuICAgICAgICAgICAgICAgICAgICB6b29rZWVwZXIgPSAnJyxcbiAgICAgICAgICAgICAgICAgICAga2Fma2EgPSAnJztcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzaWdFdGNkIG9mIGNsdXN0ZXJDb25maWcuZXRjZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2lnRXRjZC5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldGNkICs9IHNpZ0V0Y2QubmFtZSArICcsJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjbHVzdGVyQ29uZmlnLmV0Y2QgPSBldGNkO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNsdXN0ZXJDb25maWcubG9nQ29uZmlnID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJDb25maWcuY2x1c3RlckxvZyA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgc2lnWm9va2VlcGVyIG9mIGNsdXN0ZXJDb25maWcuY2x1c3RlckxvZy56b29rZWVwZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaWdab29rZWVwZXIubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvb2tlZXBlciArPSBzaWdab29rZWVwZXIubmFtZSArICcsJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyQ29uZmlnLmNsdXN0ZXJMb2cuem9va2VlcGVyID0gem9va2VlcGVyO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ0thZmthIG9mIGNsdXN0ZXJDb25maWcuY2x1c3RlckxvZy5rYWZrYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNpZ0thZmthLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrYWZrYSArPSBzaWdLYWZrYS5uYW1lICsgJywnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJDb25maWcuY2x1c3RlckxvZy5rYWZrYSA9IGthZmthO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWNsdXN0ZXJDb25maWcuaXNIdHRwcykge1xuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyQ29uZmlnLnVzZXJuYW1lID0gY2x1c3RlckNvbmZpZy5wYXNzd29yZCA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyQ29uZmlnLmFwaSA9ICdodHRwczovLycgKyBjbHVzdGVyQ29uZmlnLmFwaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2x1c3RlckNvbmZpZy5pc0h0dHBzID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIHJldHVybiBjbHVzdGVyQ29uZmlnO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF9mb3JtYXJ0TmV3Q2x1c3RlcjogZnVuY3Rpb24gKGNsdXN0ZXIpIHtcbiAgICAgICAgICAgICAgICBsZXQgZm9ybWFydE5ld0NsdXN0ZXIgPSB7fTtcblxuICAgICAgICAgICAgICAgIGZvcm1hcnROZXdDbHVzdGVyLmNsdXN0ZXJJbmZvID0gY2x1c3RlcjtcbiAgICAgICAgICAgICAgICBmb3JtYXJ0TmV3Q2x1c3Rlci5jcmVhdG9yRHJhZnQgPSB0aGlzLmNyZWF0b3JEcmFmdDtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9ybWFydE5ld0NsdXN0ZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNsdXN0ZXIgPSB0aGlzLl9mb3JtYXJ0Q2x1c3RlcigpLFxuICAgICAgICAgICAgICAgICAgICBuZXdDbHVzdGVyID0gdGhpcy5fZm9ybWFydE5ld0NsdXN0ZXIoY2x1c3Rlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvY2x1c3RlcicsIGFuZ3VsYXIudG9Kc29uKG5ld0NsdXN0ZXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8gQ2x1c3Rlckxpc3QgQ2xhc3NcbiAgICAgICAgY29uc3QgQ2x1c3Rlckxpc3QgPSBmdW5jdGlvbiAobGlzdCkge1xuICAgICAgICAgICAgdGhpcy5jbHVzdGVyID0ge307XG4gICAgICAgICAgICB0aGlzLmNsdXN0ZXJMaXN0ID0gW107XG4gICAgICAgICAgICB0aGlzLmluaXQobGlzdCk7XG4gICAgICAgIH07XG4gICAgICAgIENsdXN0ZXJMaXN0LnByb3RvdHlwZSA9IHtcbiAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uIChsaXN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdCA9IGxpc3QgfHwgW107XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdG9nZ2xlQ2x1c3RlcjogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyLmlkID0gdGhpcy5jbHVzdGVyTGlzdFtpbmRleF0uaWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyLm5hbWUgPSB0aGlzLmNsdXN0ZXJMaXN0W2luZGV4XS5uYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvLyDojrflvpflrp7kvotcbiAgICAgICAgY29uc3QgZ2V0SW5zdGFuY2UgPSAkZG9tZU1vZGVsLmluc3RhbmNlc0NyZWF0b3Ioe1xuICAgICAgICAgICAgQ2x1c3Rlckxpc3Q6IENsdXN0ZXJMaXN0LFxuICAgICAgICAgICAgQ2x1c3RlcjogQ2x1c3RlcixcbiAgICAgICAgICAgIE5vZGVMaXN0OiBOb2RlTGlzdCxcbiAgICAgICAgICAgIENsdXN0ZXJTZXJ2aWNlOiBDbHVzdGVyU2VydmljZSxcbiAgICAgICAgICAgIE5vZGVTZXJ2aWNlOiBOb2RlU2VydmljZVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ2V0SW5zdGFuY2U6IGdldEluc3RhbmNlXG4gICAgICAgIH07XG4gICAgfV0pO1xufSkod2luZG93LmRvbWVBcHApOyJdfQ==
