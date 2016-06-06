/*
 * @description: 集群管理service
 * @version: 0.1
 */
domeApp.factory('$domeCluster', ['$http', '$domeUser', '$q', '$modal', '$domePublic', '$domeModel', function ($http, $domeUser, $q, $modal, $domePublic, $domeModel) {
    const ClusterService = function () {
        this.url = '/api/cluster';
        $domeModel.ServiceModel.call(this, this.url);
        let deleteData = this.deleteData;

        this.getNamespace = clusterId => $http.get(this.url + '/' + clusterId + '/namespace');
        this.setNamespace = (clusterId, namespaceList) => $http.post(this.url + '/' + clusterId + '/namespace', angular.toJson(namespaceList));
        this.deleteData = id => {
            let defered = $q.defer();
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
    const NodeService = function () {
        ClusterService.call(this);
        this.getNodeList = clusterId => $http.get(this.url + '/' + clusterId + '/nodelist');
        this.getNodeInfo = (clusterId, hostname) => $http.get(this.url + '/' + clusterId + '/node/' + hostname);
        this.getHostInstances = (clusterId, hostname) => $http.get(this.url + '/' + clusterId + '/nodelist/' + hostname);
        this.updateDisk = (clusterId, nodeName, path) => $http.post(this.url + '/' + clusterId + '/' + nodeName + '/disk?path=' + path);
        this.addLabel = (clusterId, labelInfo) => $http.post(this.url + '/' + clusterId + '/nodelabels/add', angular.toJson(labelInfo));
        this.deleteLabel = (clusterId, labelInfo) => $http.post(this.url + '/' + clusterId + '/nodelabels/delete', angular.toJson(labelInfo));
        this.modifyNodeDisk = (clusterId, nodeName, path) => $http.post('/api/cluster/' + clusterId + '/' + nodeName + '/disk?path=' + path);
    };
    // nodeList Class
    const NodeList = function (nodes, isFilterDisk) {
        this.isCheckAll = false;
        this.nodeList = [];
        this.selectedCount = 0;
        this.labelsInfo = {};
        this.init(nodes, isFilterDisk);
    };
    NodeList.prototype = {
        // @params nodes: [], getNodeList() 接口返回的node数据结构
        // @params isFilterDisk : 是否过滤掉nodes中diskinfo等于null或''的node
        init: function (nodes, isFilterDisk) {
            if (isFilterDisk !== true) {
                isFilterDisk = false;
            }
            // nodeList：nodes中每个node添加keyFilter、labelFilter、isSelected属性之后的重新生成的Array。
            this.nodeList = ((nodes, isFilterDisk) => {
                nodes = nodes ? nodes : [];
                for (let i = 0; i < nodes.length; i++) {
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
            })(nodes, isFilterDisk);
            // labelsInfo ：{labelname:{contents:[labelcontent1,labelcontent2],isSelected:true/false,isShow:true/false}};
            // contents为labelkey对应的labelcontent；isSelected是否被选中；isShow是否展示在页面上。
            this.labelsInfo = (() => {
                let map = {};
                const nodeList = this.nodeList;
                for (let i = 0; i < nodeList.length; i++) {
                    for (let key in nodeList[i].labels) {
                        if (nodeList[i].labels.hasOwnProperty(key) && key != 'kubernetes.io/hostname' && key != 'hostEnv') {
                            if (map[key]) {
                                let isContentExist = false;
                                for (let j = 0; j < map[key].contents.length; j++) {
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
            })();
        },
        initLabelsInfo: function () {
            for (let label in this.labelsInfo) {
                if (this.labelsInfo[label].isSelected) {
                    this.labelsInfo[label].isSelected = false;
                }
            }
            this.toggleLabelNodes();
        },
        // @param env : 'PROD'(生产环境) or 'TEST'(测试环境)
        toggleEnv: function (env) {
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
        toggleNodeCheck: function (node) {
            let isAllHasChange = true;
            if (node.isSelected) {
                this.selectedCount++;
                // 是否为全选
                for (let i = 0; i < this.nodeList.length; i++) {
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
        filterWithKey: function (keywords) {
            this.isCheckAll = false;
            this.selectedCount = 0;
            for (let i = 0; i < this.nodeList.length; i++) {
                this.nodeList[i].isSelected = false;
                this.nodeList[i].keyFilter = this.nodeList[i].name.indexOf(keywords) !== -1 ? true : false;
            }
        },
        // 全选/全不选 node
        checkAllNode: function (isCheckAll) {
            this.isCheckAll = isCheckAll === undefined ? this.isCheckAll : isCheckAll;
            this.selectedCount = 0;
            for (let i = 0; i < this.nodeList.length; i++) {
                if (this.nodeList[i].keyFilter && this.nodeList[i].labelFilter && this.isCheckAll) {
                    this.nodeList[i].isSelected = true;
                    this.selectedCount++;
                } else {
                    this.nodeList[i].isSelected = false;
                }
            }
        },
        // 切换单个label选中状态，label:labelkey，isSelect:true/false
        toggleLabel: function (label, isSelect) {
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
        toggleLabelNodes: function () {
            let isHasLabelSelected = false;
            this.isCheckAll = false;
            this.selectedCount = 0;
            angular.forEach(this.labelsInfo, (value) => {
                if (!isHasLabelSelected && value.isSelected) {
                    isHasLabelSelected = true;
                }
            });
            if (!isHasLabelSelected) {
                for (let node of this.nodeList) {
                    node.isSelected = false;
                    node.labelFilter = true;
                }
            } else {
                for (let i = 0; i < this.nodeList.length; i++) {
                    let hasAllSelect = true;
                    this.nodeList[i].isSelected = false;
                    for (let key in this.labelsInfo) {
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
        showHost: function () {
            let hostModalIns = $modal.open({
                animation: true,
                templateUrl: '/index/tpl/modal/hostListModal/hostListModal.html',
                controller: 'HostListModalCtr',
                size: 'lg',
                resolve: {
                    hostList: () => this.nodeList
                }
            });
            return hostModalIns.result;
        },
        // @return labelSelectors = [{labelKey1:labelContent1,labelKey1:labelContent2}];
        getFormartSelectedLabels: function () {
            let labelSelectors = [];
            angular.forEach(this.labelsInfo, function (value, key) {
                if (value.isSelected) {
                    for (let i = 0; i < value.contents.length; i++) {
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
        getSelectedNodes: function () {
            let nodes = [];
            for (let i = 0; i < this.nodeList.length; i++) {
                if (this.nodeList[i].isSelected) {
                    nodes.push(this.nodeList[i].name);
                }
            }
            return nodes;
        }
    };
    // Cluster Class
    const Cluster = function (clusterInfo) {
        // creator info
        // this.userList = [];
        this.etcdValid = true;
        this.zookeeperValid = true;
        this.kafkaValid = true;
        this.config = {};
        this.init(clusterInfo);
    };
    Cluster.prototype = {
        init: function (clusterInfo) {
            let etcd = [],
                etcdStrArr, zookeeper = [],
                zookeeperStrArr, kafka = [],
                kafkaStrArr, i;
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
        addEtcd: function () {
            this.config.etcd.push({
                name: ''
            });
        },
        addKafka: function () {
            this.config.clusterLog.kafka.push({
                name: ''
            });
        },
        addZookeeper: function () {
            this.config.clusterLog.zookeeper.push({
                name: ''
            });
        },
        deleteArrItem: function (item, index) {
            this.config[item].splice(index, 1);
        },
        deleteLogArrItem: function (item, index) {
            this.config.clusterLog[item].splice(index, 1);
        },
        toggleUser: function (user) {
            this.config.ownerName = user.name;
            this.creatorDraft = {
                creatorType: user.type,
                creatorId: user.id
            };
        },
        toggleLogConfig: function () {
            this.config.logConfig = this.config.logConfig === 1 ? 0 : 1;
        },
        validItem: function (item) {
            let itemArr = [],
                valid = false;
            if (item == 'etcd') {
                itemArr = this.config.etcd;
            } else {
                itemArr = this.config.clusterLog[item];
            }
            if (item != 'etcd' && this.config.logConfig === 0) {
                valid = true;
            } else {
                for (let i = 0; i < itemArr.length; i++) {
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
        modify: function () {
            return $http.put('/api/cluster', angular.toJson(this._formartCluster()));
        },
        // 转换为于后台交互的cluster的数据结构
        _formartCluster: function () {
            let clusterConfig = angular.copy(this.config),
                etcd = '',
                zookeeper = '',
                kafka = '',
                name;
            for (let i = 0; i < clusterConfig.etcd.length; i++) {
                name = clusterConfig.etcd[i].name;
                if (name) {
                    etcd += name + ',';
                }
            }
            clusterConfig.etcd = etcd;

            if (clusterConfig.logConfig === 0) {
                clusterConfig.clusterLog = null;
            } else {
                for (let i = 0; i < clusterConfig.clusterLog.zookeeper.length; i++) {
                    name = clusterConfig.clusterLog.zookeeper[i].name;
                    if (name) {
                        zookeeper += name + ',';
                    }
                }
                clusterConfig.clusterLog.zookeeper = zookeeper;
                for (let i = 0; i < clusterConfig.clusterLog.kafka.length; i++) {
                    name = clusterConfig.clusterLog.kafka[i].name;
                    if (name) {
                        kafka += name + ',';
                    }
                }
                clusterConfig.clusterLog.kafka = kafka;
            }
            return clusterConfig;
        },
        _formartNewCluster: function (cluster) {
            let formartNewCluster = {};

            formartNewCluster.clusterInfo = cluster;
            formartNewCluster.creatorDraft = this.creatorDraft;
            return formartNewCluster;

        },
        create: function () {
            let cluster = this._formartCluster(),
                newCluster = this._formartNewCluster(cluster);
            return $http.post('/api/cluster', angular.toJson(newCluster));
        }
    };
    // ClusterList Class
    const ClusterList = function (list) {
        this.cluster = {};
        this.init(list);
    };
    ClusterList.prototype = {
        init: function (list) {
            this.clusterList = list || [];
        },
        toggleCluster: function (index) {
            this.cluster.id = this.clusterList[index].id;
            this.cluster.name = this.clusterList[index].name;
        }
    };
    // 获得实例
    const getInstance = $domeModel.instancesCreator({
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