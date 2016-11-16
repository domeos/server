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
                // this.creatorDraft = {
                //     creatorType: user.type,
                //     creatorId: user.id
                // };
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
                // formartNewCluster.creatorDraft = this.creatorDraft;
                return formartNewCluster;
            },
            create: function create() {
                var cluster = this._formartCluster(),
                    newCluster = this._formartNewCluster(cluster);
                return $http.post('/api/cluster', angular.toJson(newCluster.clusterInfo));
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L2pzL3NlcnZpY2VzL2NsdXN0ZXJTZXJ2aWNlLmVzIl0sIm5hbWVzIjpbImRvbWVBcHAiLCJ1bmRlZmluZWQiLCJmYWN0b3J5IiwiJGh0dHAiLCIkcSIsIiRtb2RhbCIsIiRkb21lUHVibGljIiwiJGRvbWVNb2RlbCIsIiR1dGlsIiwiQ2x1c3RlclNlcnZpY2UiLCJ1cmwiLCJTZXJ2aWNlTW9kZWwiLCJjYWxsIiwiZGVsZXRlRGF0YSIsImdldE5hbWVzcGFjZSIsImdldCIsImNsdXN0ZXJJZCIsInNldE5hbWVzcGFjZSIsIm5hbWVzcGFjZUxpc3QiLCJwb3N0IiwiYW5ndWxhciIsInRvSnNvbiIsImRlZmVyZWQiLCJkZWZlciIsIm9wZW5EZWxldGUiLCJ0aGVuIiwiaWQiLCJvcGVuUHJvbXB0IiwicmVzb2x2ZSIsInJlcyIsIm9wZW5XYXJuaW5nIiwidGl0bGUiLCJtc2ciLCJkYXRhIiwicmVzdWx0TXNnIiwicmVqZWN0IiwicHJvbWlzZSIsIk5vZGVTZXJ2aWNlIiwiZ2V0Tm9kZUxpc3QiLCJnZXROb2RlSW5mbyIsImhvc3RuYW1lIiwiZ2V0SG9zdEluc3RhbmNlcyIsInVwZGF0ZURpc2siLCJub2RlTmFtZSIsInBhdGgiLCJhZGRMYWJlbCIsImxhYmVsSW5mbyIsImRlbGV0ZUxhYmVsIiwibW9kaWZ5Tm9kZURpc2siLCJOb2RlTGlzdCIsIm5vZGVzIiwiaXNGaWx0ZXJEaXNrIiwiaXNDaGVja0FsbCIsIm5vZGVMaXN0Iiwic2VsZWN0ZWRDb3VudCIsImxhYmVsc0luZm8iLCJpbml0IiwicHJvdG90eXBlIiwiaSIsImxlbmd0aCIsImRpc2tJbmZvIiwic3BsaWNlIiwia2V5RmlsdGVyIiwibGFiZWxGaWx0ZXIiLCJpc1NlbGVjdGVkIiwibWFwIiwibCIsImtleSIsImxhYmVscyIsImhhc093blByb3BlcnR5IiwiaXNDb250ZW50RXhpc3QiLCJqIiwibDEiLCJjb250ZW50cyIsInB1c2giLCJpc1Nob3ciLCJQUk9ERU5WIiwiVEVTVEVOViIsIkJVSUxERU5WIiwiaW5pdExhYmVsc0luZm8iLCJsYWJlbCIsInRvZ2dsZUxhYmVsTm9kZXMiLCJ0b2dnbGVFbnYiLCJlbnYiLCJ0b2dnbGVOb2RlQ2hlY2siLCJub2RlIiwiaXNBbGxIYXNDaGFuZ2UiLCJmaWx0ZXJXaXRoS2V5Iiwia2V5d29yZHMiLCJuYW1lIiwiaW5kZXhPZiIsImNoZWNrQWxsTm9kZSIsInRvZ2dsZUxhYmVsIiwiaXNTZWxlY3QiLCJpc0hhc0xhYmVsU2VsZWN0ZWQiLCJmb3JFYWNoIiwidmFsdWUiLCJoYXNBbGxTZWxlY3QiLCJzaG93SG9zdCIsImhvc3RNb2RhbElucyIsIm9wZW4iLCJhbmltYXRpb24iLCJ0ZW1wbGF0ZVVybCIsImNvbnRyb2xsZXIiLCJzaXplIiwiaG9zdExpc3QiLCJyZXN1bHQiLCJnZXRGb3JtYXJ0U2VsZWN0ZWRMYWJlbHMiLCJsYWJlbFNlbGVjdG9ycyIsImNvbnRlbnQiLCJnZXRTZWxlY3RlZE5vZGVzIiwiQ2x1c3RlciIsImNsdXN0ZXJJbmZvIiwiZXRjZFZhbGlkIiwiem9va2VlcGVyVmFsaWQiLCJrYWZrYVZhbGlkIiwiY29uZmlnIiwiY29uc3RydWN0b3IiLCJldGNkIiwiZXRjZFN0ckFyciIsInpvb2tlZXBlciIsInpvb2tlZXBlclN0ckFyciIsImthZmthIiwia2Fma2FTdHJBcnIiLCJpc09iamVjdCIsInNwbGl0IiwiY2x1c3RlckxvZyIsImlzSHR0cHMiLCJhcGkiLCJzdWJzdHJpbmciLCJsb2dDb25maWciLCJhZGRFdGNkIiwiYWRkS2Fma2EiLCJhZGRab29rZWVwZXIiLCJkZWxldGVBcnJJdGVtIiwiaXRlbSIsImluZGV4IiwiZGVsZXRlTG9nQXJySXRlbSIsInRvZ2dsZVVzZXIiLCJ1c2VyIiwiT2JqZWN0IiwidG9TdHJpbmciLCJvd25lck5hbWUiLCJ0b2dnbGVMb2dDb25maWciLCJ2YWxpZEl0ZW0iLCJ2YWxpZCIsIml0ZW1BcnIiLCJtb2RpZnkiLCJwdXQiLCJfZm9ybWFydENsdXN0ZXIiLCJjbHVzdGVyQ29uZmlnIiwiY29weSIsInNpZ0V0Y2QiLCJzaWdab29rZWVwZXIiLCJzaWdLYWZrYSIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJfZm9ybWFydE5ld0NsdXN0ZXIiLCJjbHVzdGVyIiwiZm9ybWFydE5ld0NsdXN0ZXIiLCJjcmVhdGUiLCJuZXdDbHVzdGVyIiwiQ2x1c3Rlckxpc3QiLCJsaXN0IiwiY2x1c3Rlckxpc3QiLCJ0b2dnbGVDbHVzdGVyIiwiZ2V0SW5zdGFuY2UiLCJpbnN0YW5jZXNDcmVhdG9yIiwid2luZG93Il0sIm1hcHBpbmdzIjoiOztBQUFBOzs7OztBQUtBLENBQUMsVUFBQ0EsT0FBRCxFQUFVQyxTQUFWLEVBQXdCO0FBQ3JCOztBQUNBLFFBQUksT0FBT0QsT0FBUCxLQUFtQixXQUF2QixFQUFvQztBQUNwQ0EsWUFBUUUsT0FBUixDQUFnQixjQUFoQixFQUFnQyxDQUFDLE9BQUQsRUFBVSxJQUFWLEVBQWdCLFFBQWhCLEVBQTBCLGFBQTFCLEVBQXlDLFlBQXpDLEVBQXVELE9BQXZELEVBQWdFLFVBQVVDLEtBQVYsRUFBaUJDLEVBQWpCLEVBQXFCQyxNQUFyQixFQUE2QkMsV0FBN0IsRUFBMENDLFVBQTFDLEVBQXNEQyxLQUF0RCxFQUE2RDtBQUN6SixZQUFNQyxpQkFBaUIsU0FBakJBLGNBQWlCLEdBQVk7QUFBQTs7QUFDL0IsaUJBQUtDLEdBQUwsR0FBVyxjQUFYO0FBQ0FILHVCQUFXSSxZQUFYLENBQXdCQyxJQUF4QixDQUE2QixJQUE3QixFQUFtQyxLQUFLRixHQUF4QztBQUNBLGdCQUFNRyxhQUFhLEtBQUtBLFVBQXhCOztBQUVBLGlCQUFLQyxZQUFMLEdBQW9CO0FBQUEsdUJBQWFYLE1BQU1ZLEdBQU4sQ0FBYSxNQUFLTCxHQUFsQixTQUF5Qk0sU0FBekIsZ0JBQWI7QUFBQSxhQUFwQjtBQUNBLGlCQUFLQyxZQUFMLEdBQW9CLFVBQUNELFNBQUQsRUFBWUUsYUFBWjtBQUFBLHVCQUE4QmYsTUFBTWdCLElBQU4sQ0FBYyxNQUFLVCxHQUFuQixTQUEwQk0sU0FBMUIsaUJBQWlESSxRQUFRQyxNQUFSLENBQWVI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QzRCLHlCQUFhQTtBQUwrQixTQUE1QixDQUFwQjs7QUFRQSxlQUFPO0FBQ0hpSSx5QkFBYUE7QUFEVixTQUFQO0FBR0gsS0E5ZStCLENBQWhDO0FBK2VILENBbGZELEVBa2ZHRSxPQUFPeEssT0FsZlYiLCJmaWxlIjoiaW5kZXgvanMvc2VydmljZXMvY2x1c3RlclNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBAYXV0aG9yIENoYW5kcmFMZWVcclxuICogQGRlc2NyaXB0aW9uIOmbhue+pOacjeWKoVxyXG4gKi9cclxuXHJcbigoZG9tZUFwcCwgdW5kZWZpbmVkKSA9PiB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBpZiAodHlwZW9mIGRvbWVBcHAgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XHJcbiAgICBkb21lQXBwLmZhY3RvcnkoJyRkb21lQ2x1c3RlcicsIFsnJGh0dHAnLCAnJHEnLCAnJG1vZGFsJywgJyRkb21lUHVibGljJywgJyRkb21lTW9kZWwnLCAnJHV0aWwnLCBmdW5jdGlvbiAoJGh0dHAsICRxLCAkbW9kYWwsICRkb21lUHVibGljLCAkZG9tZU1vZGVsLCAkdXRpbCkge1xyXG4gICAgICAgIGNvbnN0IENsdXN0ZXJTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLnVybCA9ICcvYXBpL2NsdXN0ZXInO1xyXG4gICAgICAgICAgICAkZG9tZU1vZGVsLlNlcnZpY2VNb2RlbC5jYWxsKHRoaXMsIHRoaXMudXJsKTtcclxuICAgICAgICAgICAgY29uc3QgZGVsZXRlRGF0YSA9IHRoaXMuZGVsZXRlRGF0YTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0TmFtZXNwYWNlID0gY2x1c3RlcklkID0+ICRodHRwLmdldChgJHt0aGlzLnVybH0vJHtjbHVzdGVySWR9L25hbWVzcGFjZWApO1xyXG4gICAgICAgICAgICB0aGlzLnNldE5hbWVzcGFjZSA9IChjbHVzdGVySWQsIG5hbWVzcGFjZUxpc3QpID0+ICRodHRwLnBvc3QoYCR7dGhpcy51cmx9LyR7Y2x1c3RlcklkfS9uYW1lc3BhY2VgLCBhbmd1bGFyLnRvSnNvbihuYW1lc3BhY2VMaXN0KSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlRGF0YSA9IGlkID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBkZWZlcmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5EZWxldGUoKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVEYXRhKGlkKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5Yig6Zmk5oiQ5Yqf77yBJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChyZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfliKDpmaTlpLHotKXvvIEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiByZXMuZGF0YS5yZXN1bHRNc2dcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IE5vZGVTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBDbHVzdGVyU2VydmljZS5jYWxsKHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLmdldE5vZGVMaXN0ID0gY2x1c3RlcklkID0+ICRodHRwLmdldChgJHt0aGlzLnVybH0vJHtjbHVzdGVySWR9L25vZGVsaXN0YCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0Tm9kZUluZm8gPSAoY2x1c3RlcklkLCBob3N0bmFtZSkgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vbm9kZS8ke2hvc3RuYW1lfWApO1xyXG4gICAgICAgICAgICB0aGlzLmdldEhvc3RJbnN0YW5jZXMgPSAoY2x1c3RlcklkLCBob3N0bmFtZSkgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vbm9kZWxpc3QvJHtob3N0bmFtZX1gKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVEaXNrID0gKGNsdXN0ZXJJZCwgbm9kZU5hbWUsIHBhdGgpID0+ICRodHRwLnBvc3QoYCR7dGhpcy51cmx9LyR7Y2x1c3RlcklkfS8ke25vZGVOYW1lfS9kaXNrP3BhdGg9JHtwYXRofWApO1xyXG4gICAgICAgICAgICB0aGlzLmFkZExhYmVsID0gKGNsdXN0ZXJJZCwgbGFiZWxJbmZvKSA9PiAkaHR0cC5wb3N0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vbm9kZWxhYmVscy9hZGRgLCBhbmd1bGFyLnRvSnNvbihsYWJlbEluZm8pKTtcclxuICAgICAgICAgICAgdGhpcy5kZWxldGVMYWJlbCA9IChjbHVzdGVySWQsIGxhYmVsSW5mbykgPT4gJGh0dHAucG9zdChgJHt0aGlzLnVybH0vJHtjbHVzdGVySWR9L25vZGVsYWJlbHMvZGVsZXRlYCwgYW5ndWxhci50b0pzb24obGFiZWxJbmZvKSk7XHJcbiAgICAgICAgICAgIHRoaXMubW9kaWZ5Tm9kZURpc2sgPSAoY2x1c3RlcklkLCBub2RlTmFtZSwgcGF0aCkgPT4gJGh0dHAucG9zdChgJHt0aGlzLnVybH0vJHtjbHVzdGVySWR9LyR7bm9kZU5hbWV9L2Rpc2s/cGF0aD0ke3BhdGh9YCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyBub2RlTGlzdCBDbGFzc1xyXG4gICAgICAgIGNvbnN0IE5vZGVMaXN0ID0gZnVuY3Rpb24gKG5vZGVzLCBpc0ZpbHRlckRpc2spIHtcclxuICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZUxpc3QgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdChub2RlcywgaXNGaWx0ZXJEaXNrKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIE5vZGVMaXN0LnByb3RvdHlwZSA9IHtcclxuICAgICAgICAgICAgLy8gQHBhcmFtcyBub2RlczogW10sIGdldE5vZGVMaXN0KCkg5o6l5Y+j6L+U5Zue55qEbm9kZeaVsOaNrue7k+aehFxyXG4gICAgICAgICAgICAvLyBAcGFyYW1zIGlzRmlsdGVyRGlzayA6IOaYr+WQpui/h+a7pOaOiW5vZGVz5LitZGlza2luZm/nrYnkuo5udWxs5oiWJyfnmoRub2RlXHJcbiAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uIChub2RlcywgaXNGaWx0ZXJEaXNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNGaWx0ZXJEaXNrICE9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNGaWx0ZXJEaXNrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBub2RlTGlzdO+8mm5vZGVz5Lit5q+P5Liqbm9kZea3u+WKoGtleUZpbHRlcuOAgWxhYmVsRmlsdGVy44CBaXNTZWxlY3RlZOWxnuaAp+S5i+WQjueahOmHjeaWsOeUn+aIkOeahEFycmF544CCXHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0ID0gKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBub2RlcyA9IG5vZGVzID8gbm9kZXMgOiBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0ZpbHRlckRpc2sgJiYgIW5vZGVzW2ldLmRpc2tJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2Rlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlhbPplK7lrZfov4fmu6Tnu5PmnpxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0ua2V5RmlsdGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGFiZWzov4fmu6Tnu5PmnpxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0ubGFiZWxGaWx0ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXS5pc1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlcztcclxuICAgICAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgICAgICAgICAvLyBsYWJlbHNJbmZvIO+8mntsYWJlbG5hbWU6e2NvbnRlbnRzOltsYWJlbGNvbnRlbnQxLGxhYmVsY29udGVudDJdLGlzU2VsZWN0ZWQ6dHJ1ZS9mYWxzZSxpc1Nob3c6dHJ1ZS9mYWxzZX19O1xyXG4gICAgICAgICAgICAgICAgLy8gY29udGVudHPkuLpsYWJlbGtleeWvueW6lOeahGxhYmVsY29udGVudO+8m2lzU2VsZWN0ZWTmmK/lkKbooqvpgInkuK3vvJtpc1Nob3fmmK/lkKblsZXnpLrlnKjpobXpnaLkuIrjgIJcclxuICAgICAgICAgICAgICAgIHRoaXMubGFiZWxzSW5mbyA9ICgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hcCA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVMaXN0ID0gdGhpcy5ub2RlTGlzdDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IG5vZGVMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gbm9kZUxpc3RbaV0ubGFiZWxzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZUxpc3RbaV0ubGFiZWxzLmhhc093blByb3BlcnR5KGtleSkgJiYga2V5ICE9ICdrdWJlcm5ldGVzLmlvL2hvc3RuYW1lJyAmJiBrZXkgIT0gJ2hvc3RFbnYnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc0NvbnRlbnRFeGlzdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMCwgbDEgPSBtYXBba2V5XS5jb250ZW50cy5sZW5ndGg7IGogPCBsMTsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFwW2tleV0uY29udGVudHNbal0gPT09IG5vZGVMaXN0W2ldLmxhYmVsc1trZXldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDb250ZW50RXhpc3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNDb250ZW50RXhpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcFtrZXldLmNvbnRlbnRzLnB1c2gobm9kZUxpc3RbaV0ubGFiZWxzW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwW2tleV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50czogW25vZGVMaXN0W2ldLmxhYmVsc1trZXldXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTaG93OiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXAuUFJPREVOVikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuUFJPREVOVi5pc1Nob3cgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuUFJPREVOViA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2hvdzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50czogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobWFwLlRFU1RFTlYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLlRFU1RFTlYuaXNTaG93ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLlRFU1RFTlYgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1Nob3c6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudHM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZDogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hcC5CVUlMREVOVikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuQlVJTERFTlYuaXNTaG93ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLkJVSUxERU5WID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTaG93OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRzOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXA7XHJcbiAgICAgICAgICAgICAgICB9KSgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpbml0TGFiZWxzSW5mbzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbGFiZWwgaW4gdGhpcy5sYWJlbHNJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubGFiZWxzSW5mby5oYXNPd25Qcm9wZXJ0eShsYWJlbCkgJiYgdGhpcy5sYWJlbHNJbmZvW2xhYmVsXS5pc1NlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFiZWxzSW5mb1tsYWJlbF0uaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTGFiZWxOb2RlcygpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyBAcGFyYW0gZW52IDogJ1BST0QnKOeUn+S6p+eOr+Wigykgb3IgJ1RFU1QnKOa1i+ivleeOr+WigylcclxuICAgICAgICAgICAgdG9nZ2xlRW52OiBmdW5jdGlvbiAoZW52KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZW52ID09ICdQUk9EJyB8fCBlbnYgPT0gJ1RFU1QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvLlRFU1RFTlYuaXNTZWxlY3RlZCA9IGVudiAhPSAnUFJPRCc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvLlBST0RFTlYuaXNTZWxlY3RlZCA9IGVudiA9PSAnUFJPRCc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUxhYmVsTm9kZXMoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy8g5YiH5o2i5Y2V5Liqbm9kZeeahOmAieS4reeKtuaAgeS5i+WQjuiwg+eUqFxyXG4gICAgICAgICAgICB0b2dnbGVOb2RlQ2hlY2s6IGZ1bmN0aW9uIChub2RlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaXNBbGxIYXNDaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuaXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOaYr+WQpuS4uuWFqOmAiVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5ub2RlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDov4fmu6TnmoRub2Rl5Lit5pyJbm9kZeacqumAieS4rVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5rZXlGaWx0ZXIgJiYgbm9kZS5sYWJlbEZpbHRlciAmJiAhbm9kZS5pc1NlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0FsbEhhc0NoYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQWxsSGFzQ2hhbmdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQtLTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy8g5YWz6ZSu5a2X6L+H5rukbm9kZVxyXG4gICAgICAgICAgICBmaWx0ZXJXaXRoS2V5OiBmdW5jdGlvbiAoa2V5d29yZHMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5ub2RlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUua2V5RmlsdGVyID0gbm9kZS5uYW1lLmluZGV4T2Yoa2V5d29yZHMpICE9PSAtMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy8g5YWo6YCJL+WFqOS4jemAiSBub2RlXHJcbiAgICAgICAgICAgIGNoZWNrQWxsTm9kZTogZnVuY3Rpb24gKGlzQ2hlY2tBbGwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IHR5cGVvZiBpc0NoZWNrQWxsID09PSAndW5kZWZpbmVkJyA/IHRoaXMuaXNDaGVja0FsbCA6IGlzQ2hlY2tBbGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLm5vZGVMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUua2V5RmlsdGVyICYmIG5vZGUubGFiZWxGaWx0ZXIgJiYgdGhpcy5pc0NoZWNrQWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaXNTZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy8g5YiH5o2i5Y2V5LiqbGFiZWzpgInkuK3nirbmgIHvvIxsYWJlbDpsYWJlbGtlee+8jGlzU2VsZWN0OnRydWUvZmFsc2VcclxuICAgICAgICAgICAgdG9nZ2xlTGFiZWw6IGZ1bmN0aW9uIChsYWJlbCwgaXNTZWxlY3QpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5sYWJlbHNJbmZvW2xhYmVsXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaXNTZWxlY3QgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubGFiZWxzSW5mb1tsYWJlbF0uaXNTZWxlY3RlZCA9PT0gaXNTZWxlY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhYmVsc0luZm9bbGFiZWxdLmlzU2VsZWN0ZWQgPSBpc1NlbGVjdDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvW2xhYmVsXS5pc1NlbGVjdGVkID0gIXRoaXMubGFiZWxzSW5mb1tsYWJlbF0uaXNTZWxlY3RlZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTGFiZWxOb2RlcygpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyDmoLnmja5sYWJlbOWvuW5vZGXov5vooYzov4fmu6RcclxuICAgICAgICAgICAgdG9nZ2xlTGFiZWxOb2RlczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlzSGFzTGFiZWxTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRoaXMubGFiZWxzSW5mbywgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0hhc0xhYmVsU2VsZWN0ZWQgJiYgdmFsdWUuaXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0hhc0xhYmVsU2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpc0hhc0xhYmVsU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUubGFiZWxGaWx0ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLm5vZGVMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBoYXNBbGxTZWxlY3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMubGFiZWxzSW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubGFiZWxzSW5mby5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIHRoaXMubGFiZWxzSW5mb1trZXldLmlzU2VsZWN0ZWQgJiYgbm9kZS5sYWJlbHNba2V5XSA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzQWxsU2VsZWN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5sYWJlbEZpbHRlciA9IGhhc0FsbFNlbGVjdDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8vIOW8ueWHuuahhuWxleekum5vZGVcclxuICAgICAgICAgICAgc2hvd0hvc3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBob3N0TW9kYWxJbnMgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2luZGV4L3RwbC9tb2RhbC9ob3N0TGlzdE1vZGFsL2hvc3RMaXN0TW9kYWwuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0hvc3RMaXN0TW9kYWxDdHInLFxyXG4gICAgICAgICAgICAgICAgICAgIHNpemU6ICdsZycsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBob3N0TGlzdDogKCkgPT4gdGhpcy5ub2RlTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhvc3RNb2RhbElucy5yZXN1bHQ7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8vIEByZXR1cm4gbGFiZWxTZWxlY3RvcnMgPSBbe2xhYmVsS2V5MTpsYWJlbENvbnRlbnQxLGxhYmVsS2V5MTpsYWJlbENvbnRlbnQyfV07XHJcbiAgICAgICAgICAgIGdldEZvcm1hcnRTZWxlY3RlZExhYmVsczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxhYmVsU2VsZWN0b3JzID0gW107XHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godGhpcy5sYWJlbHNJbmZvLCAodmFsdWUsIGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5pc1NlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdmFsdWUuY29udGVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFNlbGVjdG9ycy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBrZXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogdmFsdWUuY29udGVudHNbaV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFiZWxTZWxlY3RvcnM7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8vIEByZXR1cm4gWydub2RlbmFtZTEnLCdub2RlbmFtZTInXVxyXG4gICAgICAgICAgICBnZXRTZWxlY3RlZE5vZGVzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbm9kZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5ub2RlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmlzU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXMucHVzaChub2RlLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy8gQ2x1c3RlciBDbGFzc1xyXG4gICAgICAgIGNvbnN0IENsdXN0ZXIgPSBmdW5jdGlvbiAoY2x1c3RlckluZm8pIHtcclxuICAgICAgICAgICAgLy8gY3JlYXRvciBpbmZvXHJcbiAgICAgICAgICAgIC8vIHRoaXMudXNlckxpc3QgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5ldGNkVmFsaWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLnpvb2tlZXBlclZhbGlkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5rYWZrYVZhbGlkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7fTtcclxuICAgICAgICAgICAgdGhpcy5pbml0KGNsdXN0ZXJJbmZvKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIENsdXN0ZXIucHJvdG90eXBlID0ge1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogQ2x1c3RlcixcclxuICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24gKGNsdXN0ZXJJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZXRjZCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIGV0Y2RTdHJBcnIsIHpvb2tlZXBlciA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb2tlZXBlclN0ckFyciwga2Fma2EgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICBrYWZrYVN0ckFycjtcclxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNPYmplY3QoY2x1c3RlckluZm8pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlckluZm8gPSB7fTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIOWIneWni+WMlmV0Y2TvvJpldGNkOidldGNkMSxldGNkMictLT4gZXRjZDpbe25hbWU6J2V0Y2QxJ30se25hbWU6J2V0Y2QyJ31dXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNsdXN0ZXJJbmZvLmV0Y2QgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXRjZFN0ckFyciA9IGNsdXN0ZXJJbmZvLmV0Y2Quc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGV0Y2RTdHJBcnIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldGNkU3RyQXJyW2ldICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXRjZC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBldGNkU3RyQXJyW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGV0Y2QucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY2x1c3RlckluZm8uZXRjZCA9IGV0Y2Q7XHJcbiAgICAgICAgICAgICAgICAvLyDliJ3lp4vljJZjbHVzdGVyTG9nXHJcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlckluZm8uY2x1c3RlckxvZyA9IHt9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8g5Yid5aeL5YyWY2x1c3RlckxvZy56b29rZWVwZXLvvJpcclxuICAgICAgICAgICAgICAgIC8vIHpvb2tlZXBlcjonem9va2VlcGVyMSx6b29rZWVwZTInLS0+IHpvb2tlZXBlcjpbe25hbWU6J3pvb2tlZXBlcjEnfSx7bmFtZTonem9va2VlcGUyJ31dXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cuem9va2VlcGVyID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHpvb2tlZXBlclN0ckFyciA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cuem9va2VlcGVyLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB6b29rZWVwZXJTdHJBcnIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh6b29rZWVwZXJTdHJBcnJbaV0gIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b29rZWVwZXIucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogem9va2VlcGVyU3RyQXJyW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHpvb2tlZXBlci5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjbHVzdGVySW5mby5jbHVzdGVyTG9nLnpvb2tlZXBlciA9IHpvb2tlZXBlcjtcclxuICAgICAgICAgICAgICAgIC8vIOWIneWni+WMlmNsdXN0ZXJMb2cua2Fma2HvvIzlkIx6b29rZWVwZXJcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2x1c3RlckluZm8uY2x1c3RlckxvZy5rYWZrYSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICBrYWZrYVN0ckFyciA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cua2Fma2Euc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGthZmthU3RyQXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2Fma2FTdHJBcnJbaV0gIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrYWZrYS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBrYWZrYVN0ckFycltpXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBrYWZrYS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjbHVzdGVySW5mby5jbHVzdGVyTG9nLmthZmthID0ga2Fma2E7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8g5paw5aKeaXNIdHRwc+Wtl+aute+8jOihqOekuuaYr+WQpuWQr+WKqGh0dHBzXHJcbiAgICAgICAgICAgICAgICBjbHVzdGVySW5mby5pc0h0dHBzID0gdHlwZW9mIGNsdXN0ZXJJbmZvLmFwaSAhPT0gJ3VuZGVmaW5lZCcgJiYgY2x1c3RlckluZm8uYXBpLmluZGV4T2YoJ2h0dHBzOi8vJykgPT09IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2x1c3RlckluZm8uaXNIdHRwcykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWOu+aOiWh0dHBzOi8v5byA5aS077yM55So5LqO6aG16Z2i5bGV56S644CC5Zyo5pyA5ZCO5Lyg6YCS5pWw5o2u5pe26ZyA6KaB6KGl5Zue5p2lXHJcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlckluZm8uYXBpID0gY2x1c3RlckluZm8uYXBpLnN1YnN0cmluZyg4KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWNsdXN0ZXJJbmZvLmxvZ0NvbmZpZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJJbmZvLmxvZ0NvbmZpZyA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IGNsdXN0ZXJJbmZvO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZGRFdGNkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5ldGNkLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICcnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWRkS2Fma2E6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNsdXN0ZXJMb2cua2Fma2EucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZGRab29rZWVwZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNsdXN0ZXJMb2cuem9va2VlcGVyLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICcnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVsZXRlQXJySXRlbTogZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ1tpdGVtXS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZWxldGVMb2dBcnJJdGVtOiBmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNsdXN0ZXJMb2dbaXRlbV0uc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdG9nZ2xlVXNlcjogZnVuY3Rpb24gKHVzZXIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodXNlcikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5vd25lck5hbWUgPSB1c2VyLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmNyZWF0b3JEcmFmdCA9IHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBjcmVhdG9yVHlwZTogdXNlci50eXBlLFxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGNyZWF0b3JJZDogdXNlci5pZFxyXG4gICAgICAgICAgICAgICAgLy8gfTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdG9nZ2xlTG9nQ29uZmlnOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5sb2dDb25maWcgPSB0aGlzLmNvbmZpZy5sb2dDb25maWcgPT09IDEgPyAwIDogMTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdmFsaWRJdGVtOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbSAhPSAnZXRjZCcgJiYgdGhpcy5jb25maWcubG9nQ29uZmlnID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsaWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbUFyciA9IGl0ZW0gPT0gJ2V0Y2QnID8gdGhpcy5jb25maWcuZXRjZCA6IHRoaXMuY29uZmlnLmNsdXN0ZXJMb2dbaXRlbV0gfHwgW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBpdGVtQXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbUFycltpXS5uYW1lICYmIGl0ZW1BcnJbaV0ubmFtZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdldGNkJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV0Y2RWYWxpZCA9IHZhbGlkO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnem9va2VlcGVyJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnpvb2tlZXBlclZhbGlkID0gdmFsaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdrYWZrYSc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rYWZrYVZhbGlkID0gdmFsaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbGlkO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtb2RpZnk6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvY2x1c3RlcicsIGFuZ3VsYXIudG9Kc29uKHRoaXMuX2Zvcm1hcnRDbHVzdGVyKCkpKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy8g6L2s5o2i5Li65LqO5ZCO5Y+w5Lqk5LqS55qEY2x1c3RlcueahOaVsOaNrue7k+aehFxyXG4gICAgICAgICAgICBfZm9ybWFydENsdXN0ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjbHVzdGVyQ29uZmlnID0gYW5ndWxhci5jb3B5KHRoaXMuY29uZmlnKSxcclxuICAgICAgICAgICAgICAgICAgICBldGNkID0gJycsXHJcbiAgICAgICAgICAgICAgICAgICAgem9va2VlcGVyID0gJycsXHJcbiAgICAgICAgICAgICAgICAgICAga2Fma2EgPSAnJztcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ0V0Y2Qgb2YgY2x1c3RlckNvbmZpZy5ldGNkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpZ0V0Y2QubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldGNkICs9IHNpZ0V0Y2QubmFtZSArICcsJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjbHVzdGVyQ29uZmlnLmV0Y2QgPSBldGNkO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjbHVzdGVyQ29uZmlnLmxvZ0NvbmZpZyA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJDb25maWcuY2x1c3RlckxvZyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ1pvb2tlZXBlciBvZiBjbHVzdGVyQ29uZmlnLmNsdXN0ZXJMb2cuem9va2VlcGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaWdab29rZWVwZXIubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgem9va2VlcGVyICs9IHNpZ1pvb2tlZXBlci5uYW1lICsgJywnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJDb25maWcuY2x1c3RlckxvZy56b29rZWVwZXIgPSB6b29rZWVwZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ0thZmthIG9mIGNsdXN0ZXJDb25maWcuY2x1c3RlckxvZy5rYWZrYSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2lnS2Fma2EubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2Fma2EgKz0gc2lnS2Fma2EubmFtZSArICcsJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyQ29uZmlnLmNsdXN0ZXJMb2cua2Fma2EgPSBrYWZrYTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghY2x1c3RlckNvbmZpZy5pc0h0dHBzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlckNvbmZpZy51c2VybmFtZSA9IGNsdXN0ZXJDb25maWcucGFzc3dvcmQgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJDb25maWcuYXBpID0gJ2h0dHBzOi8vJyArIGNsdXN0ZXJDb25maWcuYXBpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2x1c3RlckNvbmZpZy5pc0h0dHBzID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsdXN0ZXJDb25maWc7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF9mb3JtYXJ0TmV3Q2x1c3RlcjogZnVuY3Rpb24gKGNsdXN0ZXIpIHtcclxuICAgICAgICAgICAgICAgIGxldCBmb3JtYXJ0TmV3Q2x1c3RlciA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgIGZvcm1hcnROZXdDbHVzdGVyLmNsdXN0ZXJJbmZvID0gY2x1c3RlcjtcclxuICAgICAgICAgICAgICAgIC8vIGZvcm1hcnROZXdDbHVzdGVyLmNyZWF0b3JEcmFmdCA9IHRoaXMuY3JlYXRvckRyYWZ0O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvcm1hcnROZXdDbHVzdGVyO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjbHVzdGVyID0gdGhpcy5fZm9ybWFydENsdXN0ZXIoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXdDbHVzdGVyID0gdGhpcy5fZm9ybWFydE5ld0NsdXN0ZXIoY2x1c3Rlcik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9jbHVzdGVyJywgYW5ndWxhci50b0pzb24obmV3Q2x1c3Rlci5jbHVzdGVySW5mbykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyBDbHVzdGVyTGlzdCBDbGFzc1xyXG4gICAgICAgIGNvbnN0IENsdXN0ZXJMaXN0ID0gZnVuY3Rpb24gKGxpc3QpIHtcclxuICAgICAgICAgICAgdGhpcy5jbHVzdGVyID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuY2x1c3Rlckxpc3QgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5pbml0KGxpc3QpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQ2x1c3Rlckxpc3QucHJvdG90eXBlID0ge1xyXG4gICAgICAgICAgICBpbml0OiBmdW5jdGlvbiAobGlzdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdCA9IGxpc3QgfHwgW107XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRvZ2dsZUNsdXN0ZXI6IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVyLmlkID0gdGhpcy5jbHVzdGVyTGlzdFtpbmRleF0uaWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsdXN0ZXIubmFtZSA9IHRoaXMuY2x1c3Rlckxpc3RbaW5kZXhdLm5hbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vIOiOt+W+l+WunuS+i1xyXG4gICAgICAgIGNvbnN0IGdldEluc3RhbmNlID0gJGRvbWVNb2RlbC5pbnN0YW5jZXNDcmVhdG9yKHtcclxuICAgICAgICAgICAgQ2x1c3Rlckxpc3Q6IENsdXN0ZXJMaXN0LFxyXG4gICAgICAgICAgICBDbHVzdGVyOiBDbHVzdGVyLFxyXG4gICAgICAgICAgICBOb2RlTGlzdDogTm9kZUxpc3QsXHJcbiAgICAgICAgICAgIENsdXN0ZXJTZXJ2aWNlOiBDbHVzdGVyU2VydmljZSxcclxuICAgICAgICAgICAgTm9kZVNlcnZpY2U6IE5vZGVTZXJ2aWNlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZVxyXG4gICAgICAgIH07XHJcbiAgICB9XSk7XHJcbn0pKHdpbmRvdy5kb21lQXBwKTsiXX0=
