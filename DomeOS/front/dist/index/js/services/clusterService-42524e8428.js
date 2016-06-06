'use strict';

/*
 * @description: 集群管理service
 * @version: 0.1
 */
domeApp.factory('$domeCluster', ['$http', '$domeUser', '$q', '$modal', '$domePublic', '$domeModel', function ($http, $domeUser, $q, $modal, $domePublic, $domeModel) {
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
            return $http.post('/api/cluster/' + clusterId + '/' + nodeName + '/disk?path=' + path);
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
            this.nodeList = function (nodes, isFilterDisk) {
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
            }(nodes, isFilterDisk);
            // labelsInfo ：{labelname:{contents:[labelcontent1,labelcontent2],isSelected:true/false,isShow:true/false}};
            // contents为labelkey对应的labelcontent；isSelected是否被选中；isShow是否展示在页面上。
            this.labelsInfo = function () {
                var map = {};
                var nodeList = _this3.nodeList;
                for (var i = 0; i < nodeList.length; i++) {
                    for (var key in nodeList[i].labels) {
                        if (nodeList[i].labels.hasOwnProperty(key) && key != 'kubernetes.io/hostname' && key != 'hostEnv') {
                            if (map[key]) {
                                var isContentExist = false;
                                for (var j = 0; j < map[key].contents.length; j++) {
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
                if (this.labelsInfo[label].isSelected) {
                    this.labelsInfo[label].isSelected = false;
                }
            }
            this.toggleLabelNodes();
        },
        // @param env : 'PROD'(生产环境) or 'TEST'(测试环境)
        toggleEnv: function toggleEnv(env) {
            if (env == 'PROD') {
                this.labelsInfo.TESTENV.isSelected = false;
                this.labelsInfo.PRODENV.isSelected = true;
            } else if (env == 'TEST') {
                this.labelsInfo.TESTENV.isSelected = true;
                this.labelsInfo.PRODENV.isSelected = false;
            }
            this.toggleLabelNodes();
        },
        // 切换单个node的选中状态之后调用
        toggleNodeCheck: function toggleNodeCheck(node) {
            var isAllHasChange = true;
            if (node.isSelected) {
                this.selectedCount++;
                // 是否为全选
                for (var i = 0; i < this.nodeList.length; i++) {
                    // 过滤的node中有node未选中
                    if (this.nodeList[i].keyFilter && this.nodeList[i].labelFilter && !this.nodeList[i].isSelected) {
                        isAllHasChange = false;
                        break;
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
            for (var i = 0; i < this.nodeList.length; i++) {
                this.nodeList[i].isSelected = false;
                this.nodeList[i].keyFilter = this.nodeList[i].name.indexOf(keywords) !== -1 ? true : false;
            }
        },
        // 全选/全不选 node
        checkAllNode: function checkAllNode(isCheckAll) {
            this.isCheckAll = isCheckAll === undefined ? this.isCheckAll : isCheckAll;
            this.selectedCount = 0;
            for (var i = 0; i < this.nodeList.length; i++) {
                if (this.nodeList[i].keyFilter && this.nodeList[i].labelFilter && this.isCheckAll) {
                    this.nodeList[i].isSelected = true;
                    this.selectedCount++;
                } else {
                    this.nodeList[i].isSelected = false;
                }
            }
        },
        // 切换单个label选中状态，label:labelkey，isSelect:true/false
        toggleLabel: function toggleLabel(label, isSelect) {
            if (!this.labelsInfo[label]) {
                return;
            }
            if (isSelect !== undefined) {
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
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.nodeList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var node = _step.value;

                        node.isSelected = false;
                        node.labelFilter = true;
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
            } else {
                for (var i = 0; i < this.nodeList.length; i++) {
                    var hasAllSelect = true;
                    this.nodeList[i].isSelected = false;
                    for (var key in this.labelsInfo) {
                        if (this.labelsInfo.hasOwnProperty(key) && this.labelsInfo[key].isSelected && this.nodeList[i].labels[key] === undefined) {
                            hasAllSelect = false;
                            break;
                        }
                    }
                    this.nodeList[i].labelFilter = hasAllSelect;
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
                    for (var i = 0; i < value.contents.length; i++) {
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
            for (var i = 0; i < this.nodeList.length; i++) {
                if (this.nodeList[i].isSelected) {
                    nodes.push(this.nodeList[i].name);
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
        init: function init(clusterInfo) {
            var etcd = [],
                etcdStrArr = void 0,
                zookeeper = [],
                zookeeperStrArr = void 0,
                kafka = [],
                kafkaStrArr = void 0,
                i = void 0;
            if (!clusterInfo) {
                clusterInfo = {};
            }
            // 初始化etcd：etcd:'etcd1,etcd2'--> etcd:[{name:'etcd1'},{name:'etcd2'}]
            if (clusterInfo.etcd) {
                etcdStrArr = clusterInfo.etcd.split(',');
                for (i = 0; i < etcdStrArr.length; i++) {
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
            if (!clusterInfo.clusterLog) {
                clusterInfo.clusterLog = {};
            }
            // 初始化clusterLog.zookeeper：
            // zookeeper:'zookeeper1,zookeepe2'--> zookeeper:[{name:'zookeeper1'},{name:'zookeepe2'}]
            if (clusterInfo.clusterLog.zookeeper) {
                zookeeperStrArr = clusterInfo.clusterLog.zookeeper.split(',');
                for (i = 0; i < zookeeperStrArr.length; i++) {
                    if (zookeeperStrArr[i] !== '') {
                        zookeeper.push({
                            name: zookeeperStrArr[i]
                        });
                    }
                }
            }
            zookeeper.push({
                name: ''
            });
            clusterInfo.clusterLog.zookeeper = zookeeper;
            // 初始化clusterLog.kafka，同zookeeper
            if (clusterInfo.clusterLog.kafka) {
                kafkaStrArr = clusterInfo.clusterLog.kafka.split(',');
                for (i = 0; i < kafkaStrArr.length; i++) {
                    if (kafkaStrArr[i] !== '') {
                        kafka.push({
                            name: kafkaStrArr[i]
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
            var itemArr = [],
                valid = false;
            if (item == 'etcd') {
                itemArr = this.config.etcd;
            } else {
                itemArr = this.config.clusterLog[item];
            }
            if (item != 'etcd' && this.config.logConfig === 0) {
                valid = true;
            } else {
                for (var i = 0; i < itemArr.length; i++) {
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
                kafka = '',
                name = void 0;
            for (var i = 0; i < clusterConfig.etcd.length; i++) {
                name = clusterConfig.etcd[i].name;
                if (name) {
                    etcd += name + ',';
                }
            }
            clusterConfig.etcd = etcd;

            if (clusterConfig.logConfig === 0) {
                clusterConfig.clusterLog = null;
            } else {
                for (var _i = 0; _i < clusterConfig.clusterLog.zookeeper.length; _i++) {
                    name = clusterConfig.clusterLog.zookeeper[_i].name;
                    if (name) {
                        zookeeper += name + ',';
                    }
                }
                clusterConfig.clusterLog.zookeeper = zookeeper;
                for (var _i2 = 0; _i2 < clusterConfig.clusterLog.kafka.length; _i2++) {
                    name = clusterConfig.clusterLog.kafka[_i2].name;
                    if (name) {
                        kafka += name + ',';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L2pzL3NlcnZpY2VzL2NsdXN0ZXJTZXJ2aWNlLmVzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUlBLFFBQVEsT0FBUixDQUFnQixjQUFoQixFQUFnQyxDQUFDLE9BQUQsRUFBVSxXQUFWLEVBQXVCLElBQXZCLEVBQTZCLFFBQTdCLEVBQXVDLGFBQXZDLEVBQXNELFlBQXRELEVBQW9FLFVBQVUsS0FBVixFQUFpQixTQUFqQixFQUE0QixFQUE1QixFQUFnQyxNQUFoQyxFQUF3QyxXQUF4QyxFQUFxRCxVQUFyRCxFQUFpRTtBQUNqSyxRQUFNLGlCQUFpQixTQUFqQixjQUFpQixHQUFZOzs7QUFDL0IsYUFBSyxHQUFMLEdBQVcsY0FBWCxDQUQrQjtBQUUvQixtQkFBVyxZQUFYLENBQXdCLElBQXhCLENBQTZCLElBQTdCLEVBQW1DLEtBQUssR0FBTCxDQUFuQyxDQUYrQjtBQUcvQixZQUFJLGFBQWEsS0FBSyxVQUFMLENBSGM7O0FBSy9CLGFBQUssWUFBTCxHQUFvQjttQkFBYSxNQUFNLEdBQU4sQ0FBVSxNQUFLLEdBQUwsR0FBVyxHQUFYLEdBQWlCLFNBQWpCLEdBQTZCLFlBQTdCO1NBQXZCLENBTFc7QUFNL0IsYUFBSyxZQUFMLEdBQW9CLFVBQUMsU0FBRCxFQUFZLGFBQVo7bUJBQThCLE1BQU0sSUFBTixDQUFXLE1BQUssR0FBTCxHQUFXLEdBQVgsR0FBaUIsU0FBakIsR0FBNkIsWUFBN0IsRUFBMkMsUUFBUSxNQUFSLENBQWUsYUFBZixDQUF0RDtTQUE5QixDQU5XO0FBTy9CLGFBQUssVUFBTCxHQUFrQixjQUFNO0FBQ3BCLGdCQUFJLFVBQVUsR0FBRyxLQUFILEVBQVYsQ0FEZ0I7QUFFcEIsd0JBQVksVUFBWixHQUF5QixJQUF6QixDQUE4QixZQUFZO0FBQ3RDLDJCQUFXLEVBQVgsRUFBZSxJQUFmLENBQW9CLFlBQVk7QUFDNUIsZ0NBQVksVUFBWixDQUF1QixPQUF2QixFQUQ0QjtBQUU1Qiw0QkFBUSxPQUFSLEdBRjRCO2lCQUFa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QyxhQUFLLE9BQUwsR0FBZSxFQUFmLENBRGdDO0FBRWhDLGFBQUssSUFBTCxDQUFVLElBQVYsRUFGZ0M7S0FBaEIsQ0FqZDZJO0FBcWRqSyxnQkFBWSxTQUFaLEdBQXdCO0FBQ3BCLGNBQU0sY0FBVSxJQUFWLEVBQWdCO0FBQ2xCLGlCQUFLLFdBQUwsR0FBbUIsUUFBUSxFQUFSLENBREQ7U0FBaEI7QUFHTix1QkFBZSx1QkFBVSxLQUFWLEVBQWlCO0FBQzVCLGlCQUFLLE9BQUwsQ0FBYSxFQUFiLEdBQWtCLEtBQUssV0FBTCxDQUFpQixLQUFqQixFQUF3QixFQUF4QixDQURVO0FBRTVCLGlCQUFLLE9BQUwsQ0FBYSxJQUFiLEdBQW9CLEtBQUssV0FBTCxDQUFpQixLQUFqQixFQUF3QixJQUF4QixDQUZRO1NBQWpCO0tBSm5COztBQXJkaUssUUErZDNKLGNBQWMsV0FBVyxnQkFBWCxDQUE0QjtBQUM1QyxxQkFBYSxXQUFiO0FBQ0EsaUJBQVMsT0FBVDtBQUNBLGtCQUFVLFFBQVY7QUFDQSx3QkFBZ0IsY0FBaEI7QUFDQSxxQkFBYSxXQUFiO0tBTGdCLENBQWQsQ0EvZDJKOztBQXVlakssV0FBTztBQUNILHFCQUFhLFdBQWI7S0FESixDQXZlaUs7Q0FBakUsQ0FBcEciLCJmaWxlIjoiaW5kZXgvanMvc2VydmljZXMvY2x1c3RlclNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQGRlc2NyaXB0aW9uOiDpm4bnvqTnrqHnkIZzZXJ2aWNlXG4gKiBAdmVyc2lvbjogMC4xXG4gKi9cbmRvbWVBcHAuZmFjdG9yeSgnJGRvbWVDbHVzdGVyJywgWyckaHR0cCcsICckZG9tZVVzZXInLCAnJHEnLCAnJG1vZGFsJywgJyRkb21lUHVibGljJywgJyRkb21lTW9kZWwnLCBmdW5jdGlvbiAoJGh0dHAsICRkb21lVXNlciwgJHEsICRtb2RhbCwgJGRvbWVQdWJsaWMsICRkb21lTW9kZWwpIHtcbiAgICBjb25zdCBDbHVzdGVyU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy51cmwgPSAnL2FwaS9jbHVzdGVyJztcbiAgICAgICAgJGRvbWVNb2RlbC5TZXJ2aWNlTW9kZWwuY2FsbCh0aGlzLCB0aGlzLnVybCk7XG4gICAgICAgIGxldCBkZWxldGVEYXRhID0gdGhpcy5kZWxldGVEYXRhO1xuXG4gICAgICAgIHRoaXMuZ2V0TmFtZXNwYWNlID0gY2x1c3RlcklkID0+ICRodHRwLmdldCh0aGlzLnVybCArICcvJyArIGNsdXN0ZXJJZCArICcvbmFtZXNwYWNlJyk7XG4gICAgICAgIHRoaXMuc2V0TmFtZXNwYWNlID0gKGNsdXN0ZXJJZCwgbmFtZXNwYWNlTGlzdCkgPT4gJGh0dHAucG9zdCh0aGlzLnVybCArICcvJyArIGNsdXN0ZXJJZCArICcvbmFtZXNwYWNlJywgYW5ndWxhci50b0pzb24obmFtZXNwYWNlTGlzdCkpO1xuICAgICAgICB0aGlzLmRlbGV0ZURhdGEgPSBpZCA9PiB7XG4gICAgICAgICAgICBsZXQgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuRGVsZXRlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlRGF0YShpZCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+WIoOmZpOaIkOWKn++8gScpO1xuICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5Yig6Zmk5aSx6LSl77yBJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcmVkLnByb21pc2U7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBjb25zdCBOb2RlU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgQ2x1c3RlclNlcnZpY2UuY2FsbCh0aGlzKTtcbiAgICAgICAgdGhpcy5nZXROb2RlTGlzdCA9IGNsdXN0ZXJJZCA9PiAkaHR0cC5nZXQodGhpcy51cmwgKyAnLycgKyBjbHVzdGVySWQgKyAnL25vZGVsaXN0Jyk7XG4gICAgICAgIHRoaXMuZ2V0Tm9kZUluZm8gPSAoY2x1c3RlcklkLCBob3N0bmFtZSkgPT4gJGh0dHAuZ2V0KHRoaXMudXJsICsgJy8nICsgY2x1c3RlcklkICsgJy9ub2RlLycgKyBob3N0bmFtZSk7XG4gICAgICAgIHRoaXMuZ2V0SG9zdEluc3RhbmNlcyA9IChjbHVzdGVySWQsIGhvc3RuYW1lKSA9PiAkaHR0cC5nZXQodGhpcy51cmwgKyAnLycgKyBjbHVzdGVySWQgKyAnL25vZGVsaXN0LycgKyBob3N0bmFtZSk7XG4gICAgICAgIHRoaXMudXBkYXRlRGlzayA9IChjbHVzdGVySWQsIG5vZGVOYW1lLCBwYXRoKSA9PiAkaHR0cC5wb3N0KHRoaXMudXJsICsgJy8nICsgY2x1c3RlcklkICsgJy8nICsgbm9kZU5hbWUgKyAnL2Rpc2s/cGF0aD0nICsgcGF0aCk7XG4gICAgICAgIHRoaXMuYWRkTGFiZWwgPSAoY2x1c3RlcklkLCBsYWJlbEluZm8pID0+ICRodHRwLnBvc3QodGhpcy51cmwgKyAnLycgKyBjbHVzdGVySWQgKyAnL25vZGVsYWJlbHMvYWRkJywgYW5ndWxhci50b0pzb24obGFiZWxJbmZvKSk7XG4gICAgICAgIHRoaXMuZGVsZXRlTGFiZWwgPSAoY2x1c3RlcklkLCBsYWJlbEluZm8pID0+ICRodHRwLnBvc3QodGhpcy51cmwgKyAnLycgKyBjbHVzdGVySWQgKyAnL25vZGVsYWJlbHMvZGVsZXRlJywgYW5ndWxhci50b0pzb24obGFiZWxJbmZvKSk7XG4gICAgICAgIHRoaXMubW9kaWZ5Tm9kZURpc2sgPSAoY2x1c3RlcklkLCBub2RlTmFtZSwgcGF0aCkgPT4gJGh0dHAucG9zdCgnL2FwaS9jbHVzdGVyLycgKyBjbHVzdGVySWQgKyAnLycgKyBub2RlTmFtZSArICcvZGlzaz9wYXRoPScgKyBwYXRoKTtcbiAgICB9O1xuICAgIC8vIG5vZGVMaXN0IENsYXNzXG4gICAgY29uc3QgTm9kZUxpc3QgPSBmdW5jdGlvbiAobm9kZXMsIGlzRmlsdGVyRGlzaykge1xuICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ub2RlTGlzdCA9IFtdO1xuICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICB0aGlzLmxhYmVsc0luZm8gPSB7fTtcbiAgICAgICAgdGhpcy5pbml0KG5vZGVzLCBpc0ZpbHRlckRpc2spO1xuICAgIH07XG4gICAgTm9kZUxpc3QucHJvdG90eXBlID0ge1xuICAgICAgICAvLyBAcGFyYW1zIG5vZGVzOiBbXSwgZ2V0Tm9kZUxpc3QoKSDmjqXlj6Pov5Tlm57nmoRub2Rl5pWw5o2u57uT5p6EXG4gICAgICAgIC8vIEBwYXJhbXMgaXNGaWx0ZXJEaXNrIDog5piv5ZCm6L+H5ruk5o6Jbm9kZXPkuK1kaXNraW5mb+etieS6jm51bGzmiJYnJ+eahG5vZGVcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKG5vZGVzLCBpc0ZpbHRlckRpc2spIHtcbiAgICAgICAgICAgIGlmIChpc0ZpbHRlckRpc2sgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpc0ZpbHRlckRpc2sgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG5vZGVMaXN077yabm9kZXPkuK3mr4/kuKpub2Rl5re75Yqga2V5RmlsdGVy44CBbGFiZWxGaWx0ZXLjgIFpc1NlbGVjdGVk5bGe5oCn5LmL5ZCO55qE6YeN5paw55Sf5oiQ55qEQXJyYXnjgIJcbiAgICAgICAgICAgIHRoaXMubm9kZUxpc3QgPSAoKG5vZGVzLCBpc0ZpbHRlckRpc2spID0+IHtcbiAgICAgICAgICAgICAgICBub2RlcyA9IG5vZGVzID8gbm9kZXMgOiBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0ZpbHRlckRpc2sgJiYgIW5vZGVzW2ldLmRpc2tJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyDlhbPplK7lrZfov4fmu6Tnu5PmnpxcbiAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0ua2V5RmlsdGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gbGFiZWzov4fmu6Tnu5PmnpxcbiAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0ubGFiZWxGaWx0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlcztcbiAgICAgICAgICAgIH0pKG5vZGVzLCBpc0ZpbHRlckRpc2spO1xuICAgICAgICAgICAgLy8gbGFiZWxzSW5mbyDvvJp7bGFiZWxuYW1lOntjb250ZW50czpbbGFiZWxjb250ZW50MSxsYWJlbGNvbnRlbnQyXSxpc1NlbGVjdGVkOnRydWUvZmFsc2UsaXNTaG93OnRydWUvZmFsc2V9fTtcbiAgICAgICAgICAgIC8vIGNvbnRlbnRz5Li6bGFiZWxrZXnlr7nlupTnmoRsYWJlbGNvbnRlbnTvvJtpc1NlbGVjdGVk5piv5ZCm6KKr6YCJ5Lit77ybaXNTaG935piv5ZCm5bGV56S65Zyo6aG16Z2i5LiK44CCXG4gICAgICAgICAgICB0aGlzLmxhYmVsc0luZm8gPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBtYXAgPSB7fTtcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlTGlzdCA9IHRoaXMubm9kZUxpc3Q7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gbm9kZUxpc3RbaV0ubGFiZWxzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZUxpc3RbaV0ubGFiZWxzLmhhc093blByb3BlcnR5KGtleSkgJiYga2V5ICE9ICdrdWJlcm5ldGVzLmlvL2hvc3RuYW1lJyAmJiBrZXkgIT0gJ2hvc3RFbnYnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hcFtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc0NvbnRlbnRFeGlzdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG1hcFtrZXldLmNvbnRlbnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFwW2tleV0uY29udGVudHNbal0gPT09IG5vZGVMaXN0W2ldLmxhYmVsc1trZXldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDb250ZW50RXhpc3QgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNDb250ZW50RXhpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcFtrZXldLmNvbnRlbnRzLnB1c2gobm9kZUxpc3RbaV0ubGFiZWxzW2tleV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwW2tleV0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50czogW25vZGVMaXN0W2ldLmxhYmVsc1trZXldXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTaG93OiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtYXAuUFJPREVOVikge1xuICAgICAgICAgICAgICAgICAgICBtYXAuUFJPREVOVi5pc1Nob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtYXAuUFJPREVOViA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzU2hvdzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobWFwLlRFU1RFTlYpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLlRFU1RFTlYuaXNTaG93ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLlRFU1RFTlYgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1Nob3c6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG1hcC5CVUlMREVOVikge1xuICAgICAgICAgICAgICAgICAgICBtYXAuQlVJTERFTlYuaXNTaG93ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLkJVSUxERU5WID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNTaG93OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBtYXA7XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9LFxuICAgICAgICBpbml0TGFiZWxzSW5mbzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yIChsZXQgbGFiZWwgaW4gdGhpcy5sYWJlbHNJbmZvKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGFiZWxzSW5mb1tsYWJlbF0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhYmVsc0luZm9bbGFiZWxdLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUxhYmVsTm9kZXMoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gQHBhcmFtIGVudiA6ICdQUk9EJyjnlJ/kuqfnjq/looMpIG9yICdURVNUJyjmtYvor5Xnjq/looMpXG4gICAgICAgIHRvZ2dsZUVudjogZnVuY3Rpb24gKGVudikge1xuICAgICAgICAgICAgaWYgKGVudiA9PSAnUFJPRCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxhYmVsc0luZm8uVEVTVEVOVi5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvLlBST0RFTlYuaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVudiA9PSAnVEVTVCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxhYmVsc0luZm8uVEVTVEVOVi5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmxhYmVsc0luZm8uUFJPREVOVi5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUxhYmVsTm9kZXMoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5YiH5o2i5Y2V5Liqbm9kZeeahOmAieS4reeKtuaAgeS5i+WQjuiwg+eUqFxuICAgICAgICB0b2dnbGVOb2RlQ2hlY2s6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICBsZXQgaXNBbGxIYXNDaGFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKG5vZGUuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xuICAgICAgICAgICAgICAgIC8vIOaYr+WQpuS4uuWFqOmAiVxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ub2RlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAvLyDov4fmu6TnmoRub2Rl5Lit5pyJbm9kZeacqumAieS4rVxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ub2RlTGlzdFtpXS5rZXlGaWx0ZXIgJiYgdGhpcy5ub2RlTGlzdFtpXS5sYWJlbEZpbHRlciAmJiAhdGhpcy5ub2RlTGlzdFtpXS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0FsbEhhc0NoYW5nZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGlzQWxsSGFzQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQtLTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8g5YWz6ZSu5a2X6L+H5rukbm9kZVxuICAgICAgICBmaWx0ZXJXaXRoS2V5OiBmdW5jdGlvbiAoa2V5d29yZHMpIHtcbiAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ub2RlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RbaV0uaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RbaV0ua2V5RmlsdGVyID0gdGhpcy5ub2RlTGlzdFtpXS5uYW1lLmluZGV4T2Yoa2V5d29yZHMpICE9PSAtMSA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8g5YWo6YCJL+WFqOS4jemAiSBub2RlXG4gICAgICAgIGNoZWNrQWxsTm9kZTogZnVuY3Rpb24gKGlzQ2hlY2tBbGwpIHtcbiAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGlzQ2hlY2tBbGwgPT09IHVuZGVmaW5lZCA/IHRoaXMuaXNDaGVja0FsbCA6IGlzQ2hlY2tBbGw7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubm9kZUxpc3RbaV0ua2V5RmlsdGVyICYmIHRoaXMubm9kZUxpc3RbaV0ubGFiZWxGaWx0ZXIgJiYgdGhpcy5pc0NoZWNrQWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RbaV0uaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3RbaV0uaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8g5YiH5o2i5Y2V5LiqbGFiZWzpgInkuK3nirbmgIHvvIxsYWJlbDpsYWJlbGtlee+8jGlzU2VsZWN0OnRydWUvZmFsc2VcbiAgICAgICAgdG9nZ2xlTGFiZWw6IGZ1bmN0aW9uIChsYWJlbCwgaXNTZWxlY3QpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5sYWJlbHNJbmZvW2xhYmVsXSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc1NlbGVjdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGFiZWxzSW5mb1tsYWJlbF0uaXNTZWxlY3RlZCA9PT0gaXNTZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmxhYmVsc0luZm9bbGFiZWxdLmlzU2VsZWN0ZWQgPSBpc1NlbGVjdDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sYWJlbHNJbmZvW2xhYmVsXS5pc1NlbGVjdGVkID0gIXRoaXMubGFiZWxzSW5mb1tsYWJlbF0uaXNTZWxlY3RlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlTGFiZWxOb2RlcygpO1xuICAgICAgICB9LFxuICAgICAgICAvLyDmoLnmja5sYWJlbOWvuW5vZGXov5vooYzov4fmu6RcbiAgICAgICAgdG9nZ2xlTGFiZWxOb2RlczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IGlzSGFzTGFiZWxTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRoaXMubGFiZWxzSW5mbywgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0hhc0xhYmVsU2VsZWN0ZWQgJiYgdmFsdWUuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICBpc0hhc0xhYmVsU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFpc0hhc0xhYmVsU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUubGFiZWxGaWx0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBoYXNBbGxTZWxlY3QgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0W2ldLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMubGFiZWxzSW5mbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubGFiZWxzSW5mby5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIHRoaXMubGFiZWxzSW5mb1trZXldLmlzU2VsZWN0ZWQgJiYgdGhpcy5ub2RlTGlzdFtpXS5sYWJlbHNba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzQWxsU2VsZWN0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdFtpXS5sYWJlbEZpbHRlciA9IGhhc0FsbFNlbGVjdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOW8ueWHuuahhuWxleekum5vZGVcbiAgICAgICAgc2hvd0hvc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCBob3N0TW9kYWxJbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2luZGV4L3RwbC9tb2RhbC9ob3N0TGlzdE1vZGFsL2hvc3RMaXN0TW9kYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0hvc3RMaXN0TW9kYWxDdHInLFxuICAgICAgICAgICAgICAgIHNpemU6ICdsZycsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICBob3N0TGlzdDogKCkgPT4gdGhpcy5ub2RlTGlzdFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGhvc3RNb2RhbElucy5yZXN1bHQ7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIEByZXR1cm4gbGFiZWxTZWxlY3RvcnMgPSBbe2xhYmVsS2V5MTpsYWJlbENvbnRlbnQxLGxhYmVsS2V5MTpsYWJlbENvbnRlbnQyfV07XG4gICAgICAgIGdldEZvcm1hcnRTZWxlY3RlZExhYmVsczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IGxhYmVsU2VsZWN0b3JzID0gW107XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godGhpcy5sYWJlbHNJbmZvLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUuY29udGVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU2VsZWN0b3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiB2YWx1ZS5jb250ZW50c1tpXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBsYWJlbFNlbGVjdG9ycztcbiAgICAgICAgfSxcbiAgICAgICAgLy8gQHJldHVybiBbJ25vZGVuYW1lMScsJ25vZGVuYW1lMiddXG4gICAgICAgIGdldFNlbGVjdGVkTm9kZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCBub2RlcyA9IFtdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubm9kZUxpc3RbaV0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKHRoaXMubm9kZUxpc3RbaV0ubmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5vZGVzO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBDbHVzdGVyIENsYXNzXG4gICAgY29uc3QgQ2x1c3RlciA9IGZ1bmN0aW9uIChjbHVzdGVySW5mbykge1xuICAgICAgICAvLyBjcmVhdG9yIGluZm9cbiAgICAgICAgLy8gdGhpcy51c2VyTGlzdCA9IFtdO1xuICAgICAgICB0aGlzLmV0Y2RWYWxpZCA9IHRydWU7XG4gICAgICAgIHRoaXMuem9va2VlcGVyVmFsaWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmthZmthVmFsaWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHt9O1xuICAgICAgICB0aGlzLmluaXQoY2x1c3RlckluZm8pO1xuICAgIH07XG4gICAgQ2x1c3Rlci5wcm90b3R5cGUgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uIChjbHVzdGVySW5mbykge1xuICAgICAgICAgICAgbGV0IGV0Y2QgPSBbXSxcbiAgICAgICAgICAgICAgICBldGNkU3RyQXJyLCB6b29rZWVwZXIgPSBbXSxcbiAgICAgICAgICAgICAgICB6b29rZWVwZXJTdHJBcnIsIGthZmthID0gW10sXG4gICAgICAgICAgICAgICAga2Fma2FTdHJBcnIsIGk7XG4gICAgICAgICAgICBpZiAoIWNsdXN0ZXJJbmZvKSB7XG4gICAgICAgICAgICAgICAgY2x1c3RlckluZm8gPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOWIneWni+WMlmV0Y2TvvJpldGNkOidldGNkMSxldGNkMictLT4gZXRjZDpbe25hbWU6J2V0Y2QxJ30se25hbWU6J2V0Y2QyJ31dXG4gICAgICAgICAgICBpZiAoY2x1c3RlckluZm8uZXRjZCkge1xuICAgICAgICAgICAgICAgIGV0Y2RTdHJBcnIgPSBjbHVzdGVySW5mby5ldGNkLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGV0Y2RTdHJBcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV0Y2RTdHJBcnJbaV0gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldGNkLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGV0Y2RTdHJBcnJbaV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXRjZC5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbHVzdGVySW5mby5ldGNkID0gZXRjZDtcbiAgICAgICAgICAgIC8vIOWIneWni+WMlmNsdXN0ZXJMb2dcbiAgICAgICAgICAgIGlmICghY2x1c3RlckluZm8uY2x1c3RlckxvZykge1xuICAgICAgICAgICAgICAgIGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOWIneWni+WMlmNsdXN0ZXJMb2cuem9va2VlcGVy77yaXG4gICAgICAgICAgICAvLyB6b29rZWVwZXI6J3pvb2tlZXBlcjEsem9va2VlcGUyJy0tPiB6b29rZWVwZXI6W3tuYW1lOid6b29rZWVwZXIxJ30se25hbWU6J3pvb2tlZXBlMid9XVxuICAgICAgICAgICAgaWYgKGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cuem9va2VlcGVyKSB7XG4gICAgICAgICAgICAgICAgem9va2VlcGVyU3RyQXJyID0gY2x1c3RlckluZm8uY2x1c3RlckxvZy56b29rZWVwZXIuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgem9va2VlcGVyU3RyQXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh6b29rZWVwZXJTdHJBcnJbaV0gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB6b29rZWVwZXIucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogem9va2VlcGVyU3RyQXJyW2ldXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHpvb2tlZXBlci5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbHVzdGVySW5mby5jbHVzdGVyTG9nLnpvb2tlZXBlciA9IHpvb2tlZXBlcjtcbiAgICAgICAgICAgIC8vIOWIneWni+WMlmNsdXN0ZXJMb2cua2Fma2HvvIzlkIx6b29rZWVwZXJcbiAgICAgICAgICAgIGlmIChjbHVzdGVySW5mby5jbHVzdGVyTG9nLmthZmthKSB7XG4gICAgICAgICAgICAgICAga2Fma2FTdHJBcnIgPSBjbHVzdGVySW5mby5jbHVzdGVyTG9nLmthZmthLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGthZmthU3RyQXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrYWZrYVN0ckFycltpXSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGthZmthLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGthZmthU3RyQXJyW2ldXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGthZmthLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsdXN0ZXJJbmZvLmNsdXN0ZXJMb2cua2Fma2EgPSBrYWZrYTtcblxuICAgICAgICAgICAgaWYgKCFjbHVzdGVySW5mby5sb2dDb25maWcpIHtcbiAgICAgICAgICAgICAgICBjbHVzdGVySW5mby5sb2dDb25maWcgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSBjbHVzdGVySW5mbztcbiAgICAgICAgfSxcbiAgICAgICAgYWRkRXRjZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWcuZXRjZC5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFkZEthZmthOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5jbHVzdGVyTG9nLmthZmthLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYWRkWm9va2VlcGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5jbHVzdGVyTG9nLnpvb2tlZXBlci5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZUFyckl0ZW06IGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWdbaXRlbV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVsZXRlTG9nQXJySXRlbTogZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5jbHVzdGVyTG9nW2l0ZW1dLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH0sXG4gICAgICAgIHRvZ2dsZVVzZXI6IGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5vd25lck5hbWUgPSB1c2VyLm5hbWU7XG4gICAgICAgICAgICB0aGlzLmNyZWF0b3JEcmFmdCA9IHtcbiAgICAgICAgICAgICAgICBjcmVhdG9yVHlwZTogdXNlci50eXBlLFxuICAgICAgICAgICAgICAgIGNyZWF0b3JJZDogdXNlci5pZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9nZ2xlTG9nQ29uZmlnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5sb2dDb25maWcgPSB0aGlzLmNvbmZpZy5sb2dDb25maWcgPT09IDEgPyAwIDogMTtcbiAgICAgICAgfSxcbiAgICAgICAgdmFsaWRJdGVtOiBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgbGV0IGl0ZW1BcnIgPSBbXSxcbiAgICAgICAgICAgICAgICB2YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGl0ZW0gPT0gJ2V0Y2QnKSB7XG4gICAgICAgICAgICAgICAgaXRlbUFyciA9IHRoaXMuY29uZmlnLmV0Y2Q7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGl0ZW1BcnIgPSB0aGlzLmNvbmZpZy5jbHVzdGVyTG9nW2l0ZW1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGl0ZW0gIT0gJ2V0Y2QnICYmIHRoaXMuY29uZmlnLmxvZ0NvbmZpZyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtQXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtQXJyW2ldLm5hbWUgJiYgaXRlbUFycltpXS5uYW1lICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzd2l0Y2ggKGl0ZW0pIHtcbiAgICAgICAgICAgIGNhc2UgJ2V0Y2QnOlxuICAgICAgICAgICAgICAgIHRoaXMuZXRjZFZhbGlkID0gdmFsaWQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd6b29rZWVwZXInOlxuICAgICAgICAgICAgICAgIHRoaXMuem9va2VlcGVyVmFsaWQgPSB2YWxpZDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2thZmthJzpcbiAgICAgICAgICAgICAgICB0aGlzLmthZmthVmFsaWQgPSB2YWxpZDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsaWQ7XG4gICAgICAgIH0sXG4gICAgICAgIG1vZGlmeTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnB1dCgnL2FwaS9jbHVzdGVyJywgYW5ndWxhci50b0pzb24odGhpcy5fZm9ybWFydENsdXN0ZXIoKSkpO1xuICAgICAgICB9LFxuICAgICAgICAvLyDovazmjaLkuLrkuo7lkI7lj7DkuqTkupLnmoRjbHVzdGVy55qE5pWw5o2u57uT5p6EXG4gICAgICAgIF9mb3JtYXJ0Q2x1c3RlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IGNsdXN0ZXJDb25maWcgPSBhbmd1bGFyLmNvcHkodGhpcy5jb25maWcpLFxuICAgICAgICAgICAgICAgIGV0Y2QgPSAnJyxcbiAgICAgICAgICAgICAgICB6b29rZWVwZXIgPSAnJyxcbiAgICAgICAgICAgICAgICBrYWZrYSA9ICcnLFxuICAgICAgICAgICAgICAgIG5hbWU7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsdXN0ZXJDb25maWcuZXRjZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBjbHVzdGVyQ29uZmlnLmV0Y2RbaV0ubmFtZTtcbiAgICAgICAgICAgICAgICBpZiAobmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBldGNkICs9IG5hbWUgKyAnLCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2x1c3RlckNvbmZpZy5ldGNkID0gZXRjZDtcblxuICAgICAgICAgICAgaWYgKGNsdXN0ZXJDb25maWcubG9nQ29uZmlnID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2x1c3RlckNvbmZpZy5jbHVzdGVyTG9nID0gbnVsbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbHVzdGVyQ29uZmlnLmNsdXN0ZXJMb2cuem9va2VlcGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBjbHVzdGVyQ29uZmlnLmNsdXN0ZXJMb2cuem9va2VlcGVyW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB6b29rZWVwZXIgKz0gbmFtZSArICcsJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjbHVzdGVyQ29uZmlnLmNsdXN0ZXJMb2cuem9va2VlcGVyID0gem9va2VlcGVyO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2x1c3RlckNvbmZpZy5jbHVzdGVyTG9nLmthZmthLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBjbHVzdGVyQ29uZmlnLmNsdXN0ZXJMb2cua2Fma2FbaV0ubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGthZmthICs9IG5hbWUgKyAnLCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2x1c3RlckNvbmZpZy5jbHVzdGVyTG9nLmthZmthID0ga2Fma2E7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2x1c3RlckNvbmZpZztcbiAgICAgICAgfSxcbiAgICAgICAgX2Zvcm1hcnROZXdDbHVzdGVyOiBmdW5jdGlvbiAoY2x1c3Rlcikge1xuICAgICAgICAgICAgbGV0IGZvcm1hcnROZXdDbHVzdGVyID0ge307XG5cbiAgICAgICAgICAgIGZvcm1hcnROZXdDbHVzdGVyLmNsdXN0ZXJJbmZvID0gY2x1c3RlcjtcbiAgICAgICAgICAgIGZvcm1hcnROZXdDbHVzdGVyLmNyZWF0b3JEcmFmdCA9IHRoaXMuY3JlYXRvckRyYWZ0O1xuICAgICAgICAgICAgcmV0dXJuIGZvcm1hcnROZXdDbHVzdGVyO1xuXG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IGNsdXN0ZXIgPSB0aGlzLl9mb3JtYXJ0Q2x1c3RlcigpLFxuICAgICAgICAgICAgICAgIG5ld0NsdXN0ZXIgPSB0aGlzLl9mb3JtYXJ0TmV3Q2x1c3RlcihjbHVzdGVyKTtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2NsdXN0ZXInLCBhbmd1bGFyLnRvSnNvbihuZXdDbHVzdGVyKSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIENsdXN0ZXJMaXN0IENsYXNzXG4gICAgY29uc3QgQ2x1c3Rlckxpc3QgPSBmdW5jdGlvbiAobGlzdCkge1xuICAgICAgICB0aGlzLmNsdXN0ZXIgPSB7fTtcbiAgICAgICAgdGhpcy5pbml0KGxpc3QpO1xuICAgIH07XG4gICAgQ2x1c3Rlckxpc3QucHJvdG90eXBlID0ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbiAobGlzdCkge1xuICAgICAgICAgICAgdGhpcy5jbHVzdGVyTGlzdCA9IGxpc3QgfHwgW107XG4gICAgICAgIH0sXG4gICAgICAgIHRvZ2dsZUNsdXN0ZXI6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdGhpcy5jbHVzdGVyLmlkID0gdGhpcy5jbHVzdGVyTGlzdFtpbmRleF0uaWQ7XG4gICAgICAgICAgICB0aGlzLmNsdXN0ZXIubmFtZSA9IHRoaXMuY2x1c3Rlckxpc3RbaW5kZXhdLm5hbWU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIOiOt+W+l+WunuS+i1xuICAgIGNvbnN0IGdldEluc3RhbmNlID0gJGRvbWVNb2RlbC5pbnN0YW5jZXNDcmVhdG9yKHtcbiAgICAgICAgQ2x1c3Rlckxpc3Q6IENsdXN0ZXJMaXN0LFxuICAgICAgICBDbHVzdGVyOiBDbHVzdGVyLFxuICAgICAgICBOb2RlTGlzdDogTm9kZUxpc3QsXG4gICAgICAgIENsdXN0ZXJTZXJ2aWNlOiBDbHVzdGVyU2VydmljZSxcbiAgICAgICAgTm9kZVNlcnZpY2U6IE5vZGVTZXJ2aWNlXG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRJbnN0YW5jZTogZ2V0SW5zdGFuY2VcbiAgICB9O1xufV0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
