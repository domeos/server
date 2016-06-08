'use strict';

/*
 * @description: 集群管理service
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
                $http.put('/api/cluster', angular.toJson(this._formartCluster()));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L2pzL3NlcnZpY2VzL2NsdXN0ZXJTZXJ2aWNlLmVzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBR0EsQ0FBQyxVQUFDLE9BQUQsRUFBVSxTQUFWLEVBQXdCO0FBQ3JCLGlCQURxQjs7QUFFckIsUUFBSSxPQUFPLE9BQVAsS0FBbUIsV0FBbkIsRUFBZ0MsT0FBcEM7QUFDQSxZQUFRLE9BQVIsQ0FBZ0IsY0FBaEIsRUFBZ0MsQ0FBQyxPQUFELEVBQVUsSUFBVixFQUFnQixRQUFoQixFQUEwQixhQUExQixFQUF5QyxZQUF6QyxFQUF1RCxPQUF2RCxFQUFnRSxVQUFVLEtBQVYsRUFBaUIsRUFBakIsRUFBcUIsTUFBckIsRUFBNkIsV0FBN0IsRUFBMEMsVUFBMUMsRUFBc0QsS0FBdEQsRUFBNkQ7QUFDekosWUFBTSxpQkFBaUIsU0FBakIsY0FBaUIsR0FBWTs7O0FBQy9CLGlCQUFLLEdBQUwsR0FBVyxjQUFYLENBRCtCO0FBRS9CLHVCQUFXLFlBQVgsQ0FBd0IsSUFBeEIsQ0FBNkIsSUFBN0IsRUFBbUMsS0FBSyxHQUFMLENBQW5DLENBRitCO0FBRy9CLGdCQUFNLGFBQWEsS0FBSyxVQUFMLENBSFk7O0FBSy9CLGlCQUFLLFlBQUwsR0FBb0I7dUJBQWEsTUFBTSxHQUFOLENBQWEsTUFBSyxHQUFMLFNBQVksd0JBQXpCO2FBQWIsQ0FMVztBQU0vQixpQkFBSyxZQUFMLEdBQW9CLFVBQUMsU0FBRCxFQUFZLGFBQVo7dUJBQThCLE1BQU0sSUFBTixDQUFjLE1BQUssR0FBTCxTQUFZLHdCQUExQixFQUFpRCxRQUFRLE1BQVIsQ0FBZSxhQUFmLENBQWpEO2FBQTlCLENBTlc7QUFPL0IsaUJBQUssVUFBTCxHQUFrQixjQUFNO0FBQ3BCLG9CQUFJLFVBQVUsR0FBRyxLQUFILEVBQVYsQ0FEZ0I7QUFFcEIsNEJBQVksVUFBWixHQUF5QixJQUF6QixDQUE4QixZQUFZO0FBQ3RDLCtCQUFXLEVBQVgsRUFBZSxJQUFmLENBQW9CLFlBQVk7QUFDNUIsb0NB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QWMsV0FBVyxnQkFBWCxDQUE0QjtBQUM1Qyx5QkFBYSxXQUFiO0FBQ0EscUJBQVMsT0FBVDtBQUNBLHNCQUFVLFFBQVY7QUFDQSw0QkFBZ0IsY0FBaEI7QUFDQSx5QkFBYSxXQUFiO1NBTGdCLENBQWQsQ0F0ZG1KOztBQThkekosZUFBTztBQUNILHlCQUFhLFdBQWI7U0FESixDQTlkeUo7S0FBN0QsQ0FBaEcsRUFIcUI7Q0FBeEIsQ0FBRCxDQXFlRyxPQUFPLE9BQVAsQ0FyZUgiLCJmaWxlIjoiaW5kZXgvanMvc2VydmljZXMvY2x1c3RlclNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQGRlc2NyaXB0aW9uOiDpm4bnvqTnrqHnkIZzZXJ2aWNlXG4gKi9cbigoZG9tZUFwcCwgdW5kZWZpbmVkKSA9PiB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZG9tZUFwcCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcbiAgICBkb21lQXBwLmZhY3RvcnkoJyRkb21lQ2x1c3RlcicsIFsnJGh0dHAnLCAnJHEnLCAnJG1vZGFsJywgJyRkb21lUHVibGljJywgJyRkb21lTW9kZWwnLCAnJHV0aWwnLCBmdW5jdGlvbiAoJGh0dHAsICRxLCAkbW9kYWwsICRkb21lUHVibGljLCAkZG9tZU1vZGVsLCAkdXRpbCkge1xuICAgICAgICBjb25zdCBDbHVzdGVyU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMudXJsID0gJy9hcGkvY2x1c3Rlcic7XG4gICAgICAgICAgICAkZG9tZU1vZGVsLlNlcnZpY2VNb2RlbC5jYWxsKHRoaXMsIHRoaXMudXJsKTtcbiAgICAgICAgICAgIGNvbnN0IGRlbGV0ZURhdGEgPSB0aGlzLmRlbGV0ZURhdGE7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0TmFtZXNwYWNlID0gY2x1c3RlcklkID0+ICRodHRwLmdldChgJHt0aGlzLnVybH0vJHtjbHVzdGVySWR9L25hbWVzcGFjZWApO1xuICAgICAgICAgICAgdGhpcy5zZXROYW1lc3BhY2UgPSAoY2x1c3RlcklkLCBuYW1lc3BhY2VMaXN0KSA9PiAkaHR0cC5wb3N0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vbmFtZXNwYWNlYCwgYW5ndWxhci50b0pzb24obmFtZXNwYWNlTGlzdCkpO1xuICAgICAgICAgICAgdGhpcy5kZWxldGVEYXRhID0gaWQgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBkZWZlcmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuRGVsZXRlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZURhdGEoaWQpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5Yig6Zmk5oiQ5Yqf77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5Yig6Zmk5aSx6LSl77yBJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVyZWQucHJvbWlzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IE5vZGVTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgQ2x1c3RlclNlcnZpY2UuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0Tm9kZUxpc3QgPSBjbHVzdGVySWQgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vbm9kZWxpc3RgKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0Tm9kZUluZm8gPSAoY2x1c3RlcklkLCBob3N0bmFtZSkgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vbm9kZS8ke2hvc3RuYW1lfWApO1xuICAgICAgICAgICAgdGhpcy5nZXRIb3N0SW5zdGFuY2VzID0gKGNsdXN0ZXJJZCwgaG9zdG5hbWUpID0+ICRodHRwLmdldChgJHt0aGlzLnVybH0vJHtjbHVzdGVySWR9L25vZGVsaXN0LyR7aG9zdG5hbWV9YCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURpc2sgPSAoY2x1c3RlcklkLCBub2RlTmFtZSwgcGF0aCkgPT4gJGh0dHAucG9zdChgJHt0aGlzLnVybH0vJHtjbHVzdGVySWR9LyR7bm9kZU5hbWV9L2Rpc2s/cGF0aD0ke3BhdGh9YCk7XG4gICAgICAgICAgICB0aGlzLmFkZExhYmVsID0gKGNsdXN0ZXJJZCwgbGFiZWxJbmZvKSA9PiAkaHR0cC5wb3N0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vbm9kZWxhYmVscy9hZGRgLCBhbmd1bGFyLnRvSnNvbihsYWJlbEluZm8pKTtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlTGFiZWwgPSAoY2x1c3RlcklkLCBsYWJlbEluZm8pID0+ICRodHRwLnBvc3QoYCR7dGhpcy51cmx9LyR7Y2x1c3RlcklkfS9ub2RlbGFiZWxzL2RlbGV0ZWAsIGFuZ3VsYXIudG9Kc29uKGxhYmVsSW5mbykpO1xuICAgICAgICAgICAgdGhpcy5tb2RpZnlOb2RlRGlzayA9IChjbHVzdGVySWQsIG5vZGVOYW1lLCBwYXRoKSA9PiAkaHR0cC5wb3N0KGAke3RoaXMudXJsfS8ke2NsdXN0ZXJJZH0vJHtub2RlTmFtZX0vZGlzaz9wYXRoPSR7cGF0aH1gKTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gbm9kZUxpc3QgQ2xhc3NcbiAgICAgICAgY29uc3QgTm9kZUxpc3QgPSBmdW5jdGlvbiAobm9kZXMsIGlzRmlsdGVyRGlzaykge1xuICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm5vZGVMaXN0ID0gW107XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvID0ge307XG4gICAgICAgICAgICB0aGlzLmluaXQobm9kZXMsIGlzRmlsdGVyRGlzayk7XG4gICAgICAgIH07XG4gICAgICAgIE5vZGVMaXN0LnByb3RvdHlwZSA9IHtcbiAgICAgICAgICAgIC8vIEBwYXJhbXMgbm9kZXM6IFtdLCBnZXROb2RlTGlzdCgpIOaOpeWPo+i/lOWbnueahG5vZGXmlbDmja7nu5PmnoRcbiAgICAgICAgICAgIC8vIEBwYXJhbXMgaXNGaWx0ZXJEaXNrIDog5piv5ZCm6L+H5ruk5o6Jbm9kZXPkuK1kaXNraW5mb+etieS6jm51bGzmiJYnJ+eahG5vZGVcbiAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uIChub2RlcywgaXNGaWx0ZXJEaXNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRmlsdGVyRGlzayAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpc0ZpbHRlckRpc2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gbm9kZUxpc3TvvJpub2Rlc+S4reavj+S4qm5vZGXmt7vliqBrZXlGaWx0ZXLjgIFsYWJlbEZpbHRlcuOAgWlzU2VsZWN0ZWTlsZ7mgKfkuYvlkI7nmoTph43mlrDnlJ/miJDnmoRBcnJheeOAglxuICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3QgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBub2RlcyA9IG5vZGVzID8gbm9kZXMgOiBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRmlsdGVyRGlzayAmJiAhbm9kZXNbaV0uZGlza0luZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2Rlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5YWz6ZSu5a2X6L+H5ruk57uT5p6cXG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXS5rZXlGaWx0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGFiZWzov4fmu6Tnu5PmnpxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldLmxhYmVsRmlsdGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZXM7XG4gICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICAvLyBsYWJlbHNJbmZvIO+8mntsYWJlbG5hbWU6e2NvbnRlbnRzOltsYWJlbGNvbnRlbnQxLGxhYmVsY29udGVudDJdLGlzU2VsZWN0ZWQ6dHJ1ZS9mYWxzZSxpc1Nob3c6dHJ1ZS9mYWxzZX19O1xuICAgICAgICAgICAgICAgIC8vIGNvbnRlbnRz5Li6bGFiZWxrZXnlr7nlupTnmoRsYWJlbGNvbnRlbnTvvJtpc1NlbGVjdGVk5piv5ZCm6KKr6YCJ5Lit77ybaXNTaG935piv5ZCm5bGV56S65Zyo6aG16Z2i5LiK44CCXG4gICAgICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hcCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlTGlzdCA9IHRoaXMubm9kZUxpc3Q7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gbm9kZUxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gbm9kZUxpc3RbaV0ubGFiZWxzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGVMaXN0W2ldLmxhYmVscy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleSAhPSAna3ViZXJuZXRlcy5pby9ob3N0bmFtZScgJiYga2V5ICE9ICdob3N0RW52Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFwW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc0NvbnRlbnRFeGlzdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDAsIGwxID0gbWFwW2tleV0uY29udGVudHMubGVuZ3RoOyBqIDwgbDE7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXBba2V5XS5jb250ZW50c1tqXSA9PT0gbm9kZUxpc3RbaV0ubGFiZWxzW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDb250ZW50RXhpc3QgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzQ29udGVudEV4aXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwW2tleV0uY29udGVudHMucHVzaChub2RlTGlzdFtpXS5sYWJlbHNba2V5XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBba2V5XSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50czogW25vZGVMaXN0W2ldLmxhYmVsc1trZXldXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1Nob3c6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hcC5QUk9ERU5WKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuUFJPREVOVi5pc1Nob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5QUk9ERU5WID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2hvdzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXAuVEVTVEVOVikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLlRFU1RFTlYuaXNTaG93ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuVEVTVEVOViA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1Nob3c6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobWFwLkJVSUxERU5WKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuQlVJTERFTlYuaXNTaG93ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuQlVJTERFTlYgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTaG93OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGluaXRMYWJlbHNJbmZvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbGFiZWwgaW4gdGhpcy5sYWJlbHNJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmxhYmVsc0luZm8uaGFzT3duUHJvcGVydHkobGFiZWwpICYmIHRoaXMubGFiZWxzSW5mb1tsYWJlbF0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvW2xhYmVsXS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVMYWJlbE5vZGVzKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gQHBhcmFtIGVudiA6ICdQUk9EJyjnlJ/kuqfnjq/looMpIG9yICdURVNUJyjmtYvor5Xnjq/looMpXG4gICAgICAgICAgICB0b2dnbGVFbnY6IGZ1bmN0aW9uIChlbnYpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW52ID09ICdQUk9EJyB8fCBlbnYgPT0gJ1RFU1QnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFiZWxzSW5mby5URVNURU5WLmlzU2VsZWN0ZWQgPSBlbnYgIT0gJ1BST0QnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhYmVsc0luZm8uUFJPREVOVi5pc1NlbGVjdGVkID0gZW52ID09ICdQUk9EJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVMYWJlbE5vZGVzKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8g5YiH5o2i5Y2V5Liqbm9kZeeahOmAieS4reeKtuaAgeS5i+WQjuiwg+eUqFxuICAgICAgICAgICAgdG9nZ2xlTm9kZUNoZWNrOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgIGxldCBpc0FsbEhhc0NoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgLy8g5piv5ZCm5Li65YWo6YCJXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g6L+H5ruk55qEbm9kZeS4reaciW5vZGXmnKrpgInkuK1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmtleUZpbHRlciAmJiBub2RlLmxhYmVsRmlsdGVyICYmICFub2RlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0FsbEhhc0NoYW5nZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0FsbEhhc0NoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudC0tO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8g5YWz6ZSu5a2X6L+H5rukbm9kZVxuICAgICAgICAgICAgZmlsdGVyV2l0aEtleTogZnVuY3Rpb24gKGtleXdvcmRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUua2V5RmlsdGVyID0gbm9kZS5uYW1lLmluZGV4T2Yoa2V5d29yZHMpICE9PSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8g5YWo6YCJL+WFqOS4jemAiSBub2RlXG4gICAgICAgICAgICBjaGVja0FsbE5vZGU6IGZ1bmN0aW9uIChpc0NoZWNrQWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gdHlwZW9mIGlzQ2hlY2tBbGwgPT09ICd1bmRlZmluZWQnID8gdGhpcy5pc0NoZWNrQWxsIDogaXNDaGVja0FsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5ub2RlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5rZXlGaWx0ZXIgJiYgbm9kZS5sYWJlbEZpbHRlciAmJiB0aGlzLmlzQ2hlY2tBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIOWIh+aNouWNleS4qmxhYmVs6YCJ5Lit54q25oCB77yMbGFiZWw6bGFiZWxrZXnvvIxpc1NlbGVjdDp0cnVlL2ZhbHNlXG4gICAgICAgICAgICB0b2dnbGVMYWJlbDogZnVuY3Rpb24gKGxhYmVsLCBpc1NlbGVjdCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5sYWJlbHNJbmZvW2xhYmVsXSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaXNTZWxlY3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmxhYmVsc0luZm9bbGFiZWxdLmlzU2VsZWN0ZWQgPT09IGlzU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvW2xhYmVsXS5pc1NlbGVjdGVkID0gaXNTZWxlY3Q7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvW2xhYmVsXS5pc1NlbGVjdGVkID0gIXRoaXMubGFiZWxzSW5mb1tsYWJlbF0uaXNTZWxlY3RlZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVMYWJlbE5vZGVzKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8g5qC55o2ubGFiZWzlr7lub2Rl6L+b6KGM6L+H5rukXG4gICAgICAgICAgICB0b2dnbGVMYWJlbE5vZGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlzSGFzTGFiZWxTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRoaXMubGFiZWxzSW5mbywgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNIYXNMYWJlbFNlbGVjdGVkICYmIHZhbHVlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzSGFzTGFiZWxTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzSGFzTGFiZWxTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5sYWJlbEZpbHRlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBoYXNBbGxTZWxlY3QgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGhpcy5sYWJlbHNJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubGFiZWxzSW5mby5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIHRoaXMubGFiZWxzSW5mb1trZXldLmlzU2VsZWN0ZWQgJiYgbm9kZS5sYWJlbHNba2V5XSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0FsbFNlbGVjdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmxhYmVsRmlsdGVyID0gaGFzQWxsU2VsZWN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIOW8ueWHuuahhuWxleekum5vZGVcbiAgICAgICAgICAgIHNob3dIb3N0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGhvc3RNb2RhbElucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9pbmRleC90cGwvbW9kYWwvaG9zdExpc3RNb2RhbC9ob3N0TGlzdE1vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnSG9zdExpc3RNb2RhbEN0cicsXG4gICAgICAgICAgICAgICAgICAgIHNpemU6ICdsZycsXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RMaXN0OiAoKSA9PiB0aGlzLm5vZGVMaXN0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaG9zdE1vZGFsSW5zLnJlc3VsdDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBAcmV0dXJuIGxhYmVsU2VsZWN0b3JzID0gW3tsYWJlbEtleTE6bGFiZWxDb250ZW50MSxsYWJlbEtleTE6bGFiZWxDb250ZW50Mn1dO1xuICAgICAgICAgICAgZ2V0Rm9ybWFydFNlbGVjdGVkTGFiZWxzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGxhYmVsU2VsZWN0b3JzID0gW107XG4gICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRoaXMubGFiZWxzSW5mbywgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdmFsdWUuY29udGVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTZWxlY3RvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogdmFsdWUuY29udGVudHNbaV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBsYWJlbFNlbGVjdG9ycztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBAcmV0dXJuIFsnbm9kZW5hbWUxJywnbm9kZW5hbWUyJ11cbiAgICAgICAgICAgIGdldFNlbGVjdGVkTm9kZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgbm9kZXMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXMucHVzaChub2RlLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8gQ2x1c3RlciBDbGFzc1xuICAgICAgICBjb25zdCBDbHVzdGVyID0gZnVuY3Rpb24gKGNsdXN0ZXJJbmZvKSB7XG4gICAgICAgICAgICAvLyBjcmVhdG9yIGluZm9cbiAgICAgICAgICAgIC8vIHRoaXMudXNlckxpc3QgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuZXRjZFZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuem9va2VlcGVyVmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5rYWZrYVZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnID0ge307XG4gICAgICAgICAgICB0aGlzLmluaXQoY2x1c3RlckluZm8pO1xuICAgICAgICB9O1xuICAgICAgICBDbHVzdGVyLnByb3RvdHlwZSA9IHtcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiBDbHVzdGVyLFxuICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24gKGNsdXN0ZXJJbmZvKSB7XG4gICAgICAgICAgICAgICAgbGV0IGV0Y2QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgZXRjZFN0ckFyciwgem9va2VlcGVyID0gW10sXG4gICAgICAgICAgICAgICAgICAgIHpvb2tlZXBlclN0ckFyciwga2Fma2EgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAga2Fma2FTdHJBcnI7XG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc09iamVjdChjbHVzdGVySW5mbykpIHtcbiAgICAgICAgICAgICAgICAgICAgY2x1c3RlckluZm8gPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5Yid5aeL5YyWZXRjZO+8mmV0Y2Q6J2V0Y2QxLGV0Y2QyJy0tPiBldGNkOlt7bmFtZTonZXRjZDEnfSx7bmFtZTonZXRjZDInfV1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNsdXN0ZXJJbmZvLmV0Y2QgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGV0Y2RTdHJBcnIgPSBjbHVzdGVySW5mby5ldGNkLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gZXRjZFN0ckFyci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldGNkU3RyQXJyW2ldICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV0Y2QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGV0Y2RTdHJBcnJbaV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBldGNkLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNsdXN0ZXJJbmZvLmV0Y2QgPSBldGNkO1xuICAgICAgICAgICAgICAgIC8vIOWIneWni+WMlmNsdXN0ZXJMb2dcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cgPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5Yid5aeL5YyWY2x1c3RlckxvZy56b29rZWVwZXLvvJpcbiAgICAgICAgICAgICAgICAvLyB6b29rZWVwZXI6J3pvb2tlZXBlcjEsem9va2VlcGUyJy0tPiB6b29rZWVwZXI6W3tuYW1lOid6b29rZWVwZXIxJ30se25hbWU6J3pvb2tlZXBlMid9XVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2x1c3RlckluZm8uY2x1c3RlckxvZy56b29rZWVwZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHpvb2tlZXBlclN0ckFyciA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cuem9va2VlcGVyLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gem9va2VlcGVyU3RyQXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHpvb2tlZXBlclN0ckFycltpXSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b29rZWVwZXIucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHpvb2tlZXBlclN0ckFycltpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHpvb2tlZXBlci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjbHVzdGVySW5mby5jbHVzdGVyTG9nLnpvb2tlZXBlciA9IHpvb2tlZXBlcjtcbiAgICAgICAgICAgICAgICAvLyDliJ3lp4vljJZjbHVzdGVyTG9nLmthZmth77yM5ZCMem9va2VlcGVyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjbHVzdGVySW5mby5jbHVzdGVyTG9nLmthZmthID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBrYWZrYVN0ckFyciA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cua2Fma2Euc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBrYWZrYVN0ckFyci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrYWZrYVN0ckFycltpXSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrYWZrYS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZToga2Fma2FTdHJBcnJbaV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBrYWZrYS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjbHVzdGVySW5mby5jbHVzdGVyTG9nLmthZmthID0ga2Fma2E7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWNsdXN0ZXJJbmZvLmxvZ0NvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICBjbHVzdGVySW5mby5sb2dDb25maWcgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IGNsdXN0ZXJJbmZvO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFkZEV0Y2Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5ldGNkLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFkZEthZmthOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY2x1c3RlckxvZy5rYWZrYS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhZGRab29rZWVwZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jbHVzdGVyTG9nLnpvb2tlZXBlci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZWxldGVBcnJJdGVtOiBmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ1tpdGVtXS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlbGV0ZUxvZ0Fyckl0ZW06IGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNsdXN0ZXJMb2dbaXRlbV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0b2dnbGVVc2VyOiBmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodXNlcikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcub3duZXJOYW1lID0gdXNlci5uYW1lO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRvckRyYWZ0ID0ge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdG9yVHlwZTogdXNlci50eXBlLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdG9ySWQ6IHVzZXIuaWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRvZ2dsZUxvZ0NvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmxvZ0NvbmZpZyA9IHRoaXMuY29uZmlnLmxvZ0NvbmZpZyA9PT0gMSA/IDAgOiAxO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZhbGlkSXRlbTogZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBsZXQgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbSAhPSAnZXRjZCcgJiYgdGhpcy5jb25maWcubG9nQ29uZmlnID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbUFyciA9IGl0ZW0gPT0gJ2V0Y2QnID8gdGhpcy5jb25maWcuZXRjZCA6IHRoaXMuY29uZmlnLmNsdXN0ZXJMb2dbaXRlbV0gfHwgW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gaXRlbUFyci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtQXJyW2ldLm5hbWUgJiYgaXRlbUFycltpXS5uYW1lICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBjYXNlICdldGNkJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ldGNkVmFsaWQgPSB2YWxpZDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnem9va2VlcGVyJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy56b29rZWVwZXJWYWxpZCA9IHZhbGlkO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdrYWZrYSc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2Fma2FWYWxpZCA9IHZhbGlkO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbGlkO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZGlmeTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRodHRwLnB1dCgnL2FwaS9jbHVzdGVyJywgYW5ndWxhci50b0pzb24odGhpcy5fZm9ybWFydENsdXN0ZXIoKSkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIOi9rOaNouS4uuS6juWQjuWPsOS6pOS6kueahGNsdXN0ZXLnmoTmlbDmja7nu5PmnoRcbiAgICAgICAgICAgIF9mb3JtYXJ0Q2x1c3RlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxldCBjbHVzdGVyQ29uZmlnID0gYW5ndWxhci5jb3B5KHRoaXMuY29uZmlnKSxcbiAgICAgICAgICAgICAgICAgICAgZXRjZCA9ICcnLFxuICAgICAgICAgICAgICAgICAgICB6b29rZWVwZXIgPSAnJyxcbiAgICAgICAgICAgICAgICAgICAga2Fma2EgPSAnJztcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzaWdFdGNkIG9mIGNsdXN0ZXJDb25maWcuZXRjZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2lnRXRjZC5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldGNkICs9IHNpZ0V0Y2QubmFtZSArICcsJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjbHVzdGVyQ29uZmlnLmV0Y2QgPSBldGNkO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNsdXN0ZXJDb25maWcubG9nQ29uZmlnID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJDb25maWcuY2x1c3RlckxvZyA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgc2lnWm9va2VlcGVyIG9mIGNsdXN0ZXJDb25maWcuY2x1c3RlckxvZy56b29rZWVwZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaWdab29rZWVwZXIubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvb2tlZXBlciArPSBzaWdab29rZWVwZXIubmFtZSArICcsJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyQ29uZmlnLmNsdXN0ZXJMb2cuem9va2VlcGVyID0gem9va2VlcGVyO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ0thZmthIG9mIGNsdXN0ZXJDb25maWcuY2x1c3RlckxvZy5rYWZrYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNpZ0thZmthLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrYWZrYSArPSBzaWdLYWZrYS5uYW1lICsgJywnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNsdXN0ZXJDb25maWcuY2x1c3RlckxvZy5rYWZrYSA9IGthZmthO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gY2x1c3RlckNvbmZpZztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfZm9ybWFydE5ld0NsdXN0ZXI6IGZ1bmN0aW9uIChjbHVzdGVyKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZvcm1hcnROZXdDbHVzdGVyID0ge307XG5cbiAgICAgICAgICAgICAgICBmb3JtYXJ0TmV3Q2x1c3Rlci5jbHVzdGVySW5mbyA9IGNsdXN0ZXI7XG4gICAgICAgICAgICAgICAgZm9ybWFydE5ld0NsdXN0ZXIuY3JlYXRvckRyYWZ0ID0gdGhpcy5jcmVhdG9yRHJhZnQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvcm1hcnROZXdDbHVzdGVyO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxldCBjbHVzdGVyID0gdGhpcy5fZm9ybWFydENsdXN0ZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgbmV3Q2x1c3RlciA9IHRoaXMuX2Zvcm1hcnROZXdDbHVzdGVyKGNsdXN0ZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2NsdXN0ZXInLCBhbmd1bGFyLnRvSnNvbihuZXdDbHVzdGVyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vIENsdXN0ZXJMaXN0IENsYXNzXG4gICAgICAgIGNvbnN0IENsdXN0ZXJMaXN0ID0gZnVuY3Rpb24gKGxpc3QpIHtcbiAgICAgICAgICAgIHRoaXMuY2x1c3RlciA9IHt9O1xuICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdCA9IFtdO1xuICAgICAgICAgICAgdGhpcy5pbml0KGxpc3QpO1xuICAgICAgICB9O1xuICAgICAgICBDbHVzdGVyTGlzdC5wcm90b3R5cGUgPSB7XG4gICAgICAgICAgICBpbml0OiBmdW5jdGlvbiAobGlzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlckxpc3QgPSBsaXN0IHx8IFtdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRvZ2dsZUNsdXN0ZXI6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlci5pZCA9IHRoaXMuY2x1c3Rlckxpc3RbaW5kZXhdLmlkO1xuICAgICAgICAgICAgICAgIHRoaXMuY2x1c3Rlci5uYW1lID0gdGhpcy5jbHVzdGVyTGlzdFtpbmRleF0ubmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8g6I635b6X5a6e5L6LXG4gICAgICAgIGNvbnN0IGdldEluc3RhbmNlID0gJGRvbWVNb2RlbC5pbnN0YW5jZXNDcmVhdG9yKHtcbiAgICAgICAgICAgIENsdXN0ZXJMaXN0OiBDbHVzdGVyTGlzdCxcbiAgICAgICAgICAgIENsdXN0ZXI6IENsdXN0ZXIsXG4gICAgICAgICAgICBOb2RlTGlzdDogTm9kZUxpc3QsXG4gICAgICAgICAgICBDbHVzdGVyU2VydmljZTogQ2x1c3RlclNlcnZpY2UsXG4gICAgICAgICAgICBOb2RlU2VydmljZTogTm9kZVNlcnZpY2VcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZVxuICAgICAgICB9O1xuICAgIH1dKTtcbn0pKHdpbmRvdy5kb21lQXBwKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
