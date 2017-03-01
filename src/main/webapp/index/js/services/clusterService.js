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
            this.getInstancesList = function (clusterId) {
                return $http.get(_this.url + '/' + clusterId + '/instancelist');
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L2pzL3NlcnZpY2VzL2NsdXN0ZXJTZXJ2aWNlLmVzIl0sIm5hbWVzIjpbImRvbWVBcHAiLCJ1bmRlZmluZWQiLCJmYWN0b3J5IiwiJGh0dHAiLCIkcSIsIiRtb2RhbCIsIiRkb21lUHVibGljIiwiJGRvbWVNb2RlbCIsIiR1dGlsIiwiQ2x1c3RlclNlcnZpY2UiLCJ1cmwiLCJTZXJ2aWNlTW9kZWwiLCJjYWxsIiwiZGVsZXRlRGF0YSIsImdldE5hbWVzcGFjZSIsImdldCIsImNsdXN0ZXJJZCIsInNldE5hbWVzcGFjZSIsIm5hbWVzcGFjZUxpc3QiLCJwb3N0IiwiYW5ndWxhciIsInRvSnNvbiIsImRlZmVyZWQiLCJkZWZlciIsIm9wZW5EZWxldGUiLCJ0aGVuIiwiaWQiLCJvcGVuUHJvbXB0IiwicmVzb2x2ZSIsInJlcyIsIm9wZW5XYXJuaW5nIiwidGl0bGUiLCJtc2ciLCJkYXRhIiwicmVzdWx0TXNnIiwicmVqZWN0IiwicHJvbWlzZSIsImdldEluc3RhbmNlc0xpc3QiLCJOb2RlU2VydmljZSIsImdldE5vZGVMaXN0IiwiZ2V0Tm9kZUluZm8iLCJob3N0bmFtZSIsImdldEhvc3RJbnN0YW5jZXMiLCJ1cGRhdGVEaXNrIiwibm9kZU5hbWUiLCJwYXRoIiwiYWRkTGFiZWwiLCJsYWJlbEluZm8iLCJkZWxldGVMYWJlbCIsIm1vZGlmeU5vZGVEaXNrIiwiTm9kZUxpc3QiLCJub2RlcyIsImlzRmlsdGVyRGlzayIsImlzQ2hlY2tBbGwiLCJub2RlTGlzdCIsInNlbGVjdGVkQ291bnQiLCJsYWJlbHNJbmZvIiwiaW5pdCIsInByb3RvdHlwZSIsImkiLCJsZW5ndGgiLCJkaXNrSW5mbyIsInNwbGljZSIsImtleUZpbHRlciIsImxhYmVsRmlsdGVyIiwiaXNTZWxlY3RlZCIsIm1hcCIsImwiLCJrZXkiLCJsYWJlbHMiLCJoYXNPd25Qcm9wZXJ0eSIsImlzQ29udGVudEV4aXN0IiwiaiIsImwxIiwiY29udGVudHMiLCJwdXNoIiwiaXNTaG93IiwiUFJPREVOViIsIlRFU1RFTlYiLCJCVUlMREVOViIsImluaXRMYWJlbHNJbmZvIiwibGFiZWwiLCJ0b2dnbGVMYWJlbE5vZGVzIiwidG9nZ2xlRW52IiwiZW52IiwidG9nZ2xlTm9kZUNoZWNrIiwibm9kZSIsImlzQWxsSGFzQ2hhbmdlIiwiZmlsdGVyV2l0aEtleSIsImtleXdvcmRzIiwibmFtZSIsImluZGV4T2YiLCJjaGVja0FsbE5vZGUiLCJ0b2dnbGVMYWJlbCIsImlzU2VsZWN0IiwiaXNIYXNMYWJlbFNlbGVjdGVkIiwiZm9yRWFjaCIsInZhbHVlIiwiaGFzQWxsU2VsZWN0Iiwic2hvd0hvc3QiLCJob3N0TW9kYWxJbnMiLCJvcGVuIiwiYW5pbWF0aW9uIiwidGVtcGxhdGVVcmwiLCJjb250cm9sbGVyIiwic2l6ZSIsImhvc3RMaXN0IiwicmVzdWx0IiwiZ2V0Rm9ybWFydFNlbGVjdGVkTGFiZWxzIiwibGFiZWxTZWxlY3RvcnMiLCJjb250ZW50IiwiZ2V0U2VsZWN0ZWROb2RlcyIsIkNsdXN0ZXIiLCJjbHVzdGVySW5mbyIsImV0Y2RWYWxpZCIsInpvb2tlZXBlclZhbGlkIiwia2Fma2FWYWxpZCIsImNvbmZpZyIsImNvbnN0cnVjdG9yIiwiZXRjZCIsImV0Y2RTdHJBcnIiLCJ6b29rZWVwZXIiLCJ6b29rZWVwZXJTdHJBcnIiLCJrYWZrYSIsImthZmthU3RyQXJyIiwiaXNPYmplY3QiLCJzcGxpdCIsImNsdXN0ZXJMb2ciLCJpc0h0dHBzIiwiYXBpIiwic3Vic3RyaW5nIiwibG9nQ29uZmlnIiwiYWRkRXRjZCIsImFkZEthZmthIiwiYWRkWm9va2VlcGVyIiwiZGVsZXRlQXJySXRlbSIsIml0ZW0iLCJpbmRleCIsImRlbGV0ZUxvZ0Fyckl0ZW0iLCJ0b2dnbGVVc2VyIiwidXNlciIsIk9iamVjdCIsInRvU3RyaW5nIiwib3duZXJOYW1lIiwidG9nZ2xlTG9nQ29uZmlnIiwidmFsaWRJdGVtIiwidmFsaWQiLCJpdGVtQXJyIiwibW9kaWZ5IiwicHV0IiwiX2Zvcm1hcnRDbHVzdGVyIiwiY2x1c3RlckNvbmZpZyIsImNvcHkiLCJzaWdFdGNkIiwic2lnWm9va2VlcGVyIiwic2lnS2Fma2EiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwiX2Zvcm1hcnROZXdDbHVzdGVyIiwiY2x1c3RlciIsImZvcm1hcnROZXdDbHVzdGVyIiwiY3JlYXRlIiwibmV3Q2x1c3RlciIsIkNsdXN0ZXJMaXN0IiwibGlzdCIsImNsdXN0ZXJMaXN0IiwidG9nZ2xlQ2x1c3RlciIsImdldEluc3RhbmNlIiwiaW5zdGFuY2VzQ3JlYXRvciIsIndpbmRvdyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7QUFLQSxDQUFDLFVBQUNBLE9BQUQsRUFBVUMsU0FBVixFQUF3QjtBQUNyQjs7QUFDQSxRQUFJLE9BQU9ELE9BQVAsS0FBbUIsV0FBdkIsRUFBb0M7QUFDcENBLFlBQVFFLE9BQVIsQ0FBZ0IsY0FBaEIsRUFBZ0MsQ0FBQyxPQUFELEVBQVUsSUFBVixFQUFnQixRQUFoQixFQUEwQixhQUExQixFQUF5QyxZQUF6QyxFQUF1RCxPQUF2RCxFQUFnRSxVQUFVQyxLQUFWLEVBQWlCQyxFQUFqQixFQUFxQkMsTUFBckIsRUFBNkJDLFdBQTdCLEVBQTBDQyxVQUExQyxFQUFzREMsS0FBdEQsRUFBNkQ7QUFDekosWUFBTUMsaUJBQWlCLFNBQWpCQSxjQUFpQixHQUFZO0FBQUE7O0FBQy9CLGlCQUFLQyxHQUFMLEdBQVcsY0FBWDtBQUNBSCx1QkFBV0ksWUFBWCxDQUF3QkMsSUFBeEIsQ0FBNkIsSUFBN0IsRUFBbUMsS0FBS0YsR0FBeEM7QUFDQSxnQkFBTUcsYUFBYSxLQUFLQSxVQUF4Qjs7QUFFQSxpQkFBS0MsWUFBTCxHQUFvQjtBQUFBLHVCQUFhWCxNQUFNWSxHQUFOLENBQWEsTUFBS0wsR0FBbEIsU0FBeUJNLFNBQXpCLGdCQUFiO0FBQUEsYUFBcEI7QUFDQSxpQkFBS0MsWUFBTCxHQUFvQixVQUFDRCxTQUFELEVBQVlFLGFBQVo7QUFBQSx1QkFBOEJmLE1BQU1nQixJQUFOLENBQWMsTUFBS1QsR0FBbkIsU0FBMEJNLFNBQTFCLGlCQUFp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LGNBQWNoSyxXQUFXaUssZ0JBQVgsQ0FBNEI7QUFDNUNMLHlCQUFhQSxXQUQrQjtBQUU1Q25ELHFCQUFTQSxPQUZtQztBQUc1QzlELHNCQUFVQSxRQUhrQztBQUk1Q3pDLDRCQUFnQkEsY0FKNEI7QUFLNUM2Qix5QkFBYUE7QUFMK0IsU0FBNUIsQ0FBcEI7O0FBUUEsZUFBTztBQUNIaUkseUJBQWFBO0FBRFYsU0FBUDtBQUdILEtBL2UrQixDQUFoQztBQWdmSCxDQW5mRCxFQW1mR0UsT0FBT3pLLE9BbmZWIiwiZmlsZSI6ImluZGV4L2pzL3NlcnZpY2VzL2NsdXN0ZXJTZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIEBhdXRob3IgQ2hhbmRyYUxlZVxuICogQGRlc2NyaXB0aW9uIOmbhue+pOacjeWKoVxuICovXG5cbigoZG9tZUFwcCwgdW5kZWZpbmVkKSA9PiB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZG9tZUFwcCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcbiAgICBkb21lQXBwLmZhY3RvcnkoJyRkb21lQ2x1c3RlcicsIFsnJGh0dHAnLCAnJHEnLCAnJG1vZGFsJywgJyRkb21lUHVibGljJywgJyRkb21lTW9kZWwnLCAnJHV0aWwnLCBmdW5jdGlvbiAoJGh0dHAsICRxLCAkbW9kYWwsICRkb21lUHVibGljLCAkZG9tZU1vZGVsLCAkdXRpbCkge1xuICAgICAgICBjb25zdCBDbHVzdGVyU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMudXJsID0gJy9hcGkvY2x1c3Rlcic7XG4gICAgICAgICAgICAkZG9tZU1vZGVsLlNlcnZpY2VNb2RlbC5jYWxsKHRoaXMsIHRoaXMudXJsKTtcbiAgICAgICAgICAgIGNvbnN0IGRlbGV0ZURhdGEgPSB0aGlzLmRlbGV0ZURhdGE7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0TmFtZXNwYWNlID0gY2x1c3RlcklkID0+ICRodHRwLmdldChgJHt0aGlzLnVybH0vJHtjbHVzdGVySWR9L25hbWVzcGFjZWApO1xuICAgICAgICAgICAgdGhpcy5zZXROYW1lc3BhY2UgPSAoY2x1c3RlcklkLCBuYW1lc3BhY2VMaXN0KSA9PiAkaHR0cC5wb3N0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vbmFtZXNwYWNlYCwgYW5ndWxhci50b0pzb24obmFtZXNwYWNlTGlzdCkpO1xuICAgICAgICAgICAgdGhpcy5kZWxldGVEYXRhID0gaWQgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBkZWZlcmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuRGVsZXRlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZURhdGEoaWQpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5Yig6Zmk5oiQ5Yqf77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5Yig6Zmk5aSx6LSl77yBJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVyZWQucHJvbWlzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLmdldEluc3RhbmNlc0xpc3QgPSBjbHVzdGVySWQgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vaW5zdGFuY2VsaXN0YCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IE5vZGVTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgQ2x1c3RlclNlcnZpY2UuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0Tm9kZUxpc3QgPSBjbHVzdGVySWQgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vbm9kZWxpc3RgKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0Tm9kZUluZm8gPSAoY2x1c3RlcklkLCBob3N0bmFtZSkgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vbm9kZS8ke2hvc3RuYW1lfWApO1xuICAgICAgICAgICAgdGhpcy5nZXRIb3N0SW5zdGFuY2VzID0gKGNsdXN0ZXJJZCwgaG9zdG5hbWUpID0+ICRodHRwLmdldChgJHt0aGlzLnVybH0vJHtjbHVzdGVySWR9L25vZGVsaXN0LyR7aG9zdG5hbWV9YCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURpc2sgPSAoY2x1c3RlcklkLCBub2RlTmFtZSwgcGF0aCkgPT4gJGh0dHAucG9zdChgJHt0aGlzLnVybH0vJHtjbHVzdGVySWR9LyR7bm9kZU5hbWV9L2Rpc2s/cGF0aD0ke3BhdGh9YCk7XG4gICAgICAgICAgICB0aGlzLmFkZExhYmVsID0gKGNsdXN0ZXJJZCwgbGFiZWxJbmZvKSA9PiAkaHR0cC5wb3N0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vbm9kZWxhYmVscy9hZGRgLCBhbmd1bGFyLnRvSnNvbihsYWJlbEluZm8pKTtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlTGFiZWwgPSAoY2x1c3RlcklkLCBsYWJlbEluZm8pID0+ICRodHRwLnBvc3QoYCR7dGhpcy51cmx9LyR7Y2x1c3RlcklkfS9ub2RlbGFiZWxzL2RlbGV0ZWAsIGFuZ3VsYXIudG9Kc29uKGxhYmVsSW5mbykpO1xuICAgICAgICAgICAgdGhpcy5tb2RpZnlOb2RlRGlzayA9IChjbHVzdGVySWQsIG5vZGVOYW1lLCBwYXRoKSA9PiAkaHR0cC5wb3N0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vJHtub2RlTmFtZX0vZGlzaz9wYXRoPSR7cGF0aH1gKTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gbm9kZUxpc3QgQ2xhc3NcbiAgICAgICAgY29uc3QgTm9kZUxpc3QgPSBmdW5jdGlvbiAobm9kZXMsIGlzRmlsdGVyRGlzaykge1xuICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm5vZGVMaXN0ID0gW107XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvID0ge307XG4gICAgICAgICAgICB0aGlzLmluaXQobm9kZXMsIGlzRmlsdGVyRGlzayk7XG4gICAgICAgIH07XG4gICAgICAgIE5vZGVMaXN0LnByb3RvdHlwZSA9IHtcbiAgICAgICAgICAgIC8vIEBwYXJhbXMgbm9kZXM6IFtdLCBnZXROb2RlTGlzdCgpIOaOpeWPo+i/lOWbnueahG5vZGXmlbDmja7nu5PmnoRcbiAgICAgICAgICAgIC8vIEBwYXJhbXMgaXNGaWx0ZXJEaXNrIDog5piv5ZCm6L+H5ruk5o6Jbm9kZXPkuK1kaXNraW5mb+etieS6jm51bGzmiJYnJ+eahG5vZGVcbiAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uIChub2RlcywgaXNGaWx0ZXJEaXNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRmlsdGVyRGlzayAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpc0ZpbHRlckRpc2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gbm9kZUxpc3TvvJpub2Rlc+S4reavj+S4qm5vZGXmt7vliqBrZXlGaWx0ZXLjgIFsYWJlbEZpbHRlcuOAgWlzU2VsZWN0ZWTlsZ7mgKfkuYvlkI7nmoTph43mlrDnlJ/miJDnmoRBcnJheeOAglxuICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3QgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBub2RlcyA9IG5vZGVzID8gbm9kZXMgOiBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRmlsdGVyRGlzayAmJiAhbm9kZXNbaV0uZGlza0luZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2Rlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5YWz6ZSu5a2X6L+H5ruk57uT5p6cXG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXS5rZXlGaWx0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGFiZWzov4fmu6Tnu5PmnpxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldLmxhYmVsRmlsdGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZXM7XG4gICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICAvLyBsYWJlbHNJbmZvIO+8mntsYWJlbG5hbWU6e2NvbnRlbnRzOltsYWJlbGNvbnRlbnQxLGxhYmVsY29udGVudDJdLGlzU2VsZWN0ZWQ6dHJ1ZS9mYWxzZSxpc1Nob3c6dHJ1ZS9mYWxzZX19O1xuICAgICAgICAgICAgICAgIC8vIGNvbnRlbnRz5Li6bGFiZWxrZXnlr7nlupTnmoRsYWJlbGNvbnRlbnTvvJtpc1NlbGVjdGVk5piv5ZCm6KKr6YCJ5Lit77ybaXNTaG935piv5ZCm5bGV56S65Zyo6aG16Z2i5LiK44CCXG4gICAgICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hcCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlTGlzdCA9IHRoaXMubm9kZUxpc3Q7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gbm9kZUxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gbm9kZUxpc3RbaV0ubGFiZWxzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGVMaXN0W2ldLmxhYmVscy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleSAhPSAna3ViZXJuZXRlcy5pby9ob3N0bmFtZScgJiYga2V5ICE9ICdob3N0RW52Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFwW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc0NvbnRlbnRFeGlzdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDAsIGwxID0gbWFwW2tleV0uY29udGVudHMubGVuZ3RoOyBqIDwgbDE7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXBba2V5XS5jb250ZW50c1tqXSA9PT0gbm9kZUxpc3RbaV0ubGFiZWxzW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDb250ZW50RXhpc3QgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzQ29udGVudEV4aXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwW2tleV0uY29udGVudHMucHVzaChub2RlTGlzdFtpXS5sYWJlbHNba2V5XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBba2V5XSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50czogW25vZGVMaXN0W2ldLmxhYmVsc1trZXldXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1Nob3c6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hcC5QUk9ERU5WKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuUFJPREVOVi5pc1Nob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5QUk9ERU5WID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2hvdzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXAuVEVTVEVOVikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLlRFU1RFTlYuaXNTaG93ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuVEVTVEVOViA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1Nob3c6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobWFwLkJVSUxERU5WKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuQlVJTERFTlYuaXNTaG93ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuQlVJTERFTlYgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTaG93OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGluaXRMYWJlbHNJbmZvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbGFiZWwgaW4gdGhpcy5sYWJlbHNJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmxhYmVsc0luZm8uaGFzT3duUHJvcGVydHkobGFiZWwpICYmIHRoaXMubGFiZWxzSW5mb1tsYWJlbF0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvW2xhYmVsXS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVMYWJlbE5vZGVzKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gQHBhcmFtIGVudiA6ICdQUk9EJyjnlJ/kuqfnjq/looMpIG9yICdURVNUJyjmtYvor5Xnjq/looMpXG4gICAgICAgICAgICB0b2dnbGVFbnY6IGZ1bmN0aW9uIChlbnYpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW52ID09ICdQUk9EJyB8fCBlbnYgPT0gJ1RFU1QnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFiZWxzSW5mby5URVNURU5WLmlzU2VsZWN0ZWQgPSBlbnYgIT0gJ1BST0QnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhYmVsc0luZm8uUFJPREVOVi5pc1NlbGVjdGVkID0gZW52ID09ICdQUk9EJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVMYWJlbE5vZGVzKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8g5YiH5o2i5Y2V5Liqbm9kZeeahOmAieS4reeKtuaAgeS5i+WQjuiwg+eUqFxuICAgICAgICAgICAgdG9nZ2xlTm9kZUNoZWNrOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgIGxldCBpc0FsbEhhc0NoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgLy8g5piv5ZCm5Li65YWo6YCJXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g6L+H5ruk55qEbm9kZeS4reaciW5vZGXmnKrpgInkuK1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmtleUZpbHRlciAmJiBub2RlLmxhYmVsRmlsdGVyICYmICFub2RlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0FsbEhhc0NoYW5nZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0FsbEhhc0NoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudC0tO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8g5YWz6ZSu5a2X6L+H5rukbm9kZVxuICAgICAgICAgICAgZmlsdGVyV2l0aEtleTogZnVuY3Rpb24gKGtleXdvcmRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUua2V5RmlsdGVyID0gbm9kZS5uYW1lLmluZGV4T2Yoa2V5d29yZHMpICE9PSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8g5YWo6YCJL+WFqOS4jemAiSBub2RlXG4gICAgICAgICAgICBjaGVja0FsbE5vZGU6IGZ1bmN0aW9uIChpc0NoZWNrQWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gdHlwZW9mIGlzQ2hlY2tBbGwgPT09ICd1bmRlZmluZWQnID8gdGhpcy5pc0NoZWNrQWxsIDogaXNDaGVja0FsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5rZXlGaWx0ZXIgJiYgbm9kZS5sYWJlbEZpbHRlciAmJiB0aGlzLmlzQ2hlY2tBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIOWIh+aNouWNleS4qmxhYmVs6YCJ5Lit54q25oCB77yMbGFiZWw6bGFiZWxrZXnvvIxpc1NlbGVjdDp0cnVlL2ZhbHNlXG4gICAgICAgICAgICB0b2dnbGVMYWJlbDogZnVuY3Rpb24gKGxhYmVsLCBpc1NlbGVjdCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5sYWJlbHNJbmZvW2xhYmVsXSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaXNTZWxlY3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmxhYmVsc0luZm9bbGFiZWxdLmlzU2VsZWN0ZWQgPT09IGlzU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvW2xhYmVsXS5pc1NlbGVjdGVkID0gaXNTZWxlY3Q7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvW2xhYmVsXS5pc1NlbGVjdGVkID0gIXRoaXMubGFiZWxzSW5mb1tsYWJlbF0uaXNTZWxlY3RlZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVMYWJlbE5vZGVzKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8g5qC55o2ubGFiZWzlr7lub2Rl6L+b6KGM6L+H5rukXG4gICAgICAgICAgICB0b2dnbGVMYWJlbE5vZGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlzSGFzTGFiZWxTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRoaXMubGFiZWxzSW5mbywgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNIYXNMYWJlbFNlbGVjdGVkICYmIHZhbHVlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzSGFzTGFiZWxTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzSGFzTGFiZWxTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5sYWJlbEZpbHRlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBoYXNBbGxTZWxlY3QgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGhpcy5sYWJlbHNJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubGFiZWxzSW5mby5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIHRoaXMubGFiZWxzSW5mb1trZXldLmlzU2VsZWN0ZWQgJiYgbm9kZS5sYWJlbHNba2V5XSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0FsbFNlbGVjdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmxhYmVsRmlsdGVyID0gaGFzQWxsU2VsZWN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIOW8ueWHuuahhuWxleekum5vZGVcbiAgICAgICAgICAgIHNob3dIb3N0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGhvc3RNb2RhbElucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9pbmRleC90cGwvbW9kYWwvaG9zdExpc3RNb2RhbC9ob3N0TGlzdE1vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnSG9zdExpc3RNb2RhbEN0cicsXG4gICAgICAgICAgICAgICAgICAgIHNpemU6ICdsZycsXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RMaXN0OiAoKSA9PiB0aGlzLm5vZGVMaXN0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaG9zdE1vZGFsSW5zLnJlc3VsdDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBAcmV0dXJuIGxhYmVsU2VsZWN0b3JzID0gW3tsYWJlbEtleTE6bGFiZWxDb250ZW50MSxsYWJlbEtleTE6bGFiZWxDb250ZW50Mn1dO1xuICAgICAgICAgICAgZ2V0Rm9ybWFydFNlbGVjdGVkTGFiZWxzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGxhYmVsU2VsZWN0b3JzID0gW107XG4gICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRoaXMubGFiZWxzSW5mbywgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdmFsdWUuY29udGVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTZWxlY3RvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogdmFsdWUuY29udGVudHNbaV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBsYWJlbFNlbGVjdG9ycztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBAcmV0dXJuIFsnbm9kZW5hbWUxJywnbm9kZW5hbWUyJ11cbiAgICAgICAgICAgIGdldFNlbGVjdGVkTm9kZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgbm9kZXMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXMucHVzaChub2RlLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8gQ2x1c3RlciBDbGFzc1xuICAgICAgICBjb25zdCBDbHVzdGVyID0gZnVuY3Rpb24gKGNsdXN0ZXJJbmZvKSB7XG4gICAgICAgICAgICAvLyBjcmVhdG9yIGluZm9cbiAgICAgICAgICAgIC8vIHRoaXMudXNlckxpc3QgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuZXRjZFZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuem9va2VlcGVyVmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5rYWZrYVZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnID0ge307XG4gICAgICAgICAgICB0aGlzLmluaXQoY2x1c3RlckluZm8pO1xuICAgICAgICB9O1xuICAgICAgICBDbHVzdGVyLnByb3RvdHlwZSA9IHtcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiBDbHVzdGVyLFxuICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24gKGNsdXN0ZXJJbmZvKSB7XG4gICAgICAgICAgICAgICAgbGV0IGV0Y2QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgZXRjZFN0ckFyciwgem9va2VlcGVyID0gW10sXG4gICAgICAgICAgICAgICAgICAgIHpvb2tlZXBlclN0ckFyciwga2Fma2EgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAga2Fma2FTdHJBcnI7XG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc09iamVjdChjbHVzdGVySW5mbykpIHtcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlckluZm8gPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5Yid5aeL5YyWZXRjZO+8mmV0Y2Q6J2V0Y2QxLGV0Y2QyJy0tPiBldGNkOlt7bmFtZTonZXRjZDEnfSx7bmFtZTonZXRjZDInfV1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNsdXN0ZXJJbmZvLmV0Y2QgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGV0Y2RTdHJBcnIgPSBjbHVzdGVySW5mby5ldGNkLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gZXRjZFN0ckFyci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldGNkU3RyQXJyW2ldICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV0Y2QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGV0Y2RTdHJBcnJbaV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBldGNkLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNsdXN0ZXJJbmZvLmV0Y2QgPSBldGNkO1xuICAgICAgICAgICAgICAgIC8vIOWIneWni+WMlmNsdXN0ZXJMb2dcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cgPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5Yid5aeL5YyWY2x1c3RlckxvZy56b29rZWVwZXLvvJpcbiAgICAgICAgICAgICAgICAvLyB6b29rZWVwZXI6J3pvb2tlZXBlcjEsem9va2VlcGUyJy0tPiB6b29rZWVwZXI6W3tuYW1lOid6b29rZWVwZXIxJ30se25hbWU6J3pvb2tlZXBlMid9XVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2x1c3RlckluZm8uY2x1c3RlckxvZy56b29rZWVwZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHpvb2tlZXBlclN0ckFyciA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cuem9va2VlcGVyLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gem9va2VlcGVyU3RyQXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHpvb2tlZXBlclN0ckFycltpXSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b29rZWVwZXIucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHpvb2tlZXBlclN0ckFycltpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHpvb2tlZXBlci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjbHVzdGVySW5mby5jbHVzdGVyTG9nLnpvb2tlZXBlciA9IHpvb2tlZXBlcjtcbiAgICAgICAgICAgICAgICAvLyDliJ3lp4vljJZjbHVzdGVyTG9nLmthZmth77yM5ZCMem9va2VlcGVyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjbHVzdGVySW5mby5jbHVzdGVyTG9nLmthZmthID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBrYWZrYVN0ckFyciA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cua2Fma2Euc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBrYWZrYVN0ckFyci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrYWZrYVN0ckFycltpXSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrYWZrYS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZToga2Fma2FTdHJBcnJbaV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBrYWZrYS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjbHVzdGVySW5mby5jbHVzdGVyTG9nLmthZmthID0ga2Fma2E7XG5cbiAgICAgICAgICAgICAgICAvLyDmlrDlop5pc0h0dHBz5a2X5q6177yM6KGo56S65piv5ZCm5ZCv5YqoaHR0cHNcbiAgICAgICAgICAgICAgICBjbHVzdGVySW5mby5pc0h0dHBzID0gdHlwZW9mIGNsdXN0ZXJJbmZvLmFwaSAhPT0gJ3VuZGVmaW5lZCcgJiYgY2x1c3RlckluZm8uYXBpLmluZGV4T2YoJ2h0dHBzOi8vJykgPT09IDA7XG4gICAgICAgICAgICAgICAgaWYgKGNsdXN0ZXJJbmZvLmlzSHR0cHMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5Y675o6JaHR0cHM6Ly/lvIDlpLTvvIznlKjkuo7pobXpnaLlsZXnpLrjgILlnKjmnIDlkI7kvKDpgJLmlbDmja7ml7bpnIDopoHooaXlm57mnaVcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlckluZm8uYXBpID0gY2x1c3RlckluZm8uYXBpLnN1YnN0cmluZyg4KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWNsdXN0ZXJJbmZvLmxvZ0NvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICBjbHVzdGVySW5mby5sb2dDb25maWcgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IGNsdXN0ZXJJbmZvO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFkZEV0Y2Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5ldGNkLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFkZEthZmthOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY2x1c3RlckxvZy5rYWZrYS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhZGRab29rZWVwZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jbHVzdGVyTG9nLnpvb2tlZXBlci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZWxldGVBcnJJdGVtOiBmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ1tpdGVtXS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlbGV0ZUxvZ0Fyckl0ZW06IGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNsdXN0ZXJMb2dbaXRlbV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0b2dnbGVVc2VyOiBmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodXNlcikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcub3duZXJOYW1lID0gdXNlci5uYW1lO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuY3JlYXRvckRyYWZ0ID0ge1xuICAgICAgICAgICAgICAgIC8vICAgICBjcmVhdG9yVHlwZTogdXNlci50eXBlLFxuICAgICAgICAgICAgICAgIC8vICAgICBjcmVhdG9ySWQ6IHVzZXIuaWRcbiAgICAgICAgICAgICAgICAvLyB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRvZ2dsZUxvZ0NvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvZ0NvbmZpZyA9IHRoaXMuY29uZmlnLmxvZ0NvbmZpZyA9PT0gMSA/IDAgOiAxO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZhbGlkSXRlbTogZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBsZXQgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbSAhPSAnZXRjZCcgJiYgdGhpcy5jb25maWcubG9nQ29uZmlnID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbUFyciA9IGl0ZW0gPT0gJ2V0Y2QnID8gdGhpcy5jb25maWcuZXRjZCA6IHRoaXMuY29uZmlnLmNsdXN0ZXJMb2dbaXRlbV0gfHwgW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gaXRlbUFyci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtQXJyW2ldLm5hbWUgJiYgaXRlbUFycltpXS5uYW1lICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBjYXNlICdldGNkJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ldGNkVmFsaWQgPSB2YWxpZDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnem9va2VlcGVyJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy56b29rZWVwZXJWYWxpZCA9IHZhbGlkO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdrYWZrYSc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2Fma2FWYWxpZCA9IHZhbGlkO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbGlkO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZGlmeTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvY2x1c3RlcicsIGFuZ3VsYXIudG9Kc29uKHRoaXMuX2Zvcm1hcnRDbHVzdGVyKCkpKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyDovazmjaLkuLrkuo7lkI7lj7DkuqTkupLnmoRjbHVzdGVy55qE5pWw5o2u57uT5p6EXG4gICAgICAgICAgICBfZm9ybWFydENsdXN0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgY2x1c3RlckNvbmZpZyA9IGFuZ3VsYXIuY29weSh0aGlzLmNvbmZpZyksXG4gICAgICAgICAgICAgICAgICAgIGV0Y2QgPSAnJyxcbiAgICAgICAgICAgICAgICAgICAgem9va2VlcGVyID0gJycsXG4gICAgICAgICAgICAgICAgICAgIGthZmthID0gJyc7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc2lnRXRjZCBvZiBjbHVzdGVyQ29uZmlnLmV0Y2QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpZ0V0Y2QubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXRjZCArPSBzaWdFdGNkLm5hbWUgKyAnLCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2x1c3RlckNvbmZpZy5ldGNkID0gZXRjZDtcblxuICAgICAgICAgICAgICAgIGlmIChjbHVzdGVyQ29uZmlnLmxvZ0NvbmZpZyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyQ29uZmlnLmNsdXN0ZXJMb2cgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ1pvb2tlZXBlciBvZiBjbHVzdGVyQ29uZmlnLmNsdXN0ZXJMb2cuem9va2VlcGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2lnWm9va2VlcGVyLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b29rZWVwZXIgKz0gc2lnWm9va2VlcGVyLm5hbWUgKyAnLCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlckNvbmZpZy5jbHVzdGVyTG9nLnpvb2tlZXBlciA9IHpvb2tlZXBlcjtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzaWdLYWZrYSBvZiBjbHVzdGVyQ29uZmlnLmNsdXN0ZXJMb2cua2Fma2EpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaWdLYWZrYS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2Fma2EgKz0gc2lnS2Fma2EubmFtZSArICcsJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyQ29uZmlnLmNsdXN0ZXJMb2cua2Fma2EgPSBrYWZrYTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFjbHVzdGVyQ29uZmlnLmlzSHR0cHMpIHtcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlckNvbmZpZy51c2VybmFtZSA9IGNsdXN0ZXJDb25maWcucGFzc3dvcmQgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlckNvbmZpZy5hcGkgPSAnaHR0cHM6Ly8nICsgY2x1c3RlckNvbmZpZy5hcGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNsdXN0ZXJDb25maWcuaXNIdHRwcyA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2x1c3RlckNvbmZpZztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfZm9ybWFydE5ld0NsdXN0ZXI6IGZ1bmN0aW9uIChjbHVzdGVyKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZvcm1hcnROZXdDbHVzdGVyID0ge307XG5cbiAgICAgICAgICAgICAgICBmb3JtYXJ0TmV3Q2x1c3Rlci5jbHVzdGVySW5mbyA9IGNsdXN0ZXI7XG4gICAgICAgICAgICAgICAgLy8gZm9ybWFydE5ld0NsdXN0ZXIuY3JlYXRvckRyYWZ0ID0gdGhpcy5jcmVhdG9yRHJhZnQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvcm1hcnROZXdDbHVzdGVyO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxldCBjbHVzdGVyID0gdGhpcy5fZm9ybWFydENsdXN0ZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgbmV3Q2x1c3RlciA9IHRoaXMuX2Zvcm1hcnROZXdDbHVzdGVyKGNsdXN0ZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2NsdXN0ZXInLCBhbmd1bGFyLnRvSnNvbihuZXdDbHVzdGVyLmNsdXN0ZXJJbmZvKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vIENsdXN0ZXJMaXN0IENsYXNzXG4gICAgICAgIGNvbnN0IENsdXN0ZXJMaXN0ID0gZnVuY3Rpb24gKGxpc3QpIHtcbiAgICAgICAgICAgIHRoaXMuY2x1c3RlciA9IHt9O1xuICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdCA9IFtdO1xuICAgICAgICAgICAgdGhpcy5pbml0KGxpc3QpO1xuICAgICAgICB9O1xuICAgICAgICBDbHVzdGVyTGlzdC5wcm90b3R5cGUgPSB7XG4gICAgICAgICAgICBpbml0OiBmdW5jdGlvbiAobGlzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlckxpc3QgPSBsaXN0IHx8IFtdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRvZ2dsZUNsdXN0ZXI6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlci5pZCA9IHRoaXMuY2x1c3Rlckxpc3RbaW5kZXhdLmlkO1xuICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlci5uYW1lID0gdGhpcy5jbHVzdGVyTGlzdFtpbmRleF0ubmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8g6I635b6X5a6e5L6LXG4gICAgICAgIGNvbnN0IGdldEluc3RhbmNlID0gJGRvbWVNb2RlbC5pbnN0YW5jZXNDcmVhdG9yKHtcbiAgICAgICAgICAgIENsdXN0ZXJMaXN0OiBDbHVzdGVyTGlzdCxcbiAgICAgICAgICAgIENsdXN0ZXI6IENsdXN0ZXIsXG4gICAgICAgICAgICBOb2RlTGlzdDogTm9kZUxpc3QsXG4gICAgICAgICAgICBDbHVzdGVyU2VydmljZTogQ2x1c3RlclNlcnZpY2UsXG4gICAgICAgICAgICBOb2RlU2VydmljZTogTm9kZVNlcnZpY2VcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZVxuICAgICAgICB9O1xuICAgIH1dKTtcbn0pKHdpbmRvdy5kb21lQXBwKTsiXX0=
