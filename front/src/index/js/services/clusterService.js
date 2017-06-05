/*
 * @author ChandraLee
 * @description 集群服务
 */

((domeApp, undefined) => {
    'use strict';
    if (typeof domeApp === 'undefined') return;
    domeApp.factory('$domeCluster', ['$http', '$q', '$modal', 'dialog', '$domeModel', '$util', function ($http, $q, $modal, dialog, $domeModel, $util) {
        const ClusterService = function () {
            this.url = '/api/cluster';
            $domeModel.ServiceModel.call(this, this.url);
            const deleteData = this.deleteData;
            this.getNamespace = clusterId => $http.get(`${this.url}/${clusterId}/namespace`);
            this.setNamespace = (clusterId, namespaceList) => $http.post(`${this.url}/${clusterId}/namespace`, angular.toJson(namespaceList));
            this.getLabels = (clusterId) => $http.get(`${this.url}/${clusterId}/labels`);
            this.createWatcher = (clusterId, watcher) => $http.post(`${this.url}/${clusterId}/watcher/create`, angular.toJson(watcher));
            this.getWatcher = (clusterId) => $http.get(`${this.url}/${clusterId}/watcher/status`);
            this.getDeployList = () => $http.get('/api/deploy/list');
            this.getInitWatcherVersion = (deployId) => $http.get(`/api/version/id/${deployId}/1`);
            this.deleteData = id => {
                let defered = $q.defer();
                dialog.danger('确认删除', '确认要删除吗？').then(button => { if (button !== dialog.button.BUTTON_OK) throw '' }).then(function () {
                    deleteData(id).then(function () {
                        dialog.alert('提示', '删除成功！');
                        defered.resolve();
                    }, function (res) {
                        dialog.error('删除失败', res.data.resultMsg);
                        defered.reject();
                    });
                }, function () {
                    defered.reject();
                });
                return defered.promise;
            };
            this.getInstancesList = clusterId => $http.get(`${this.url}/${clusterId}/instancelist`);
        };
        const NodeService = function () {
            ClusterService.call(this);
            this.getNodeList = clusterId => $http.get(`${this.url}/${clusterId}/nodelist`);
            this.getNodeListWoPods = clusterId => $http.get(`${this.url}/${clusterId}/nodelistwithoutpods`);
            this.getNodeInfo = (clusterId, hostname) => $http.get(`${this.url}/${clusterId}/node/${hostname}`);
            this.getHostInstances = (clusterId, hostname) => $http.get(`${this.url}/${clusterId}/nodelist/${hostname}`);
            this.updateDisk = (clusterId, nodeName, path) => $http.post(`${this.url}/${clusterId}/${nodeName}/disk?path=${path}`);
            this.addLabel = (clusterId, labelInfo) => $http.post(`${this.url}/${clusterId}/nodelabels/add`, angular.toJson(labelInfo));
            this.deleteLabel = (clusterId, labelInfo) => $http.post(`${this.url}/${clusterId}/nodelabels/delete`, angular.toJson(labelInfo));
            this.modifyNodeDisk = (clusterId, nodeName, path) => $http.post(`${this.url}/${clusterId}/${nodeName}/disk?path=${path}`);
            this.getLabels = clusterId => $http.get(`${this.url}/${clusterId}/labels`);
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
                this.nodeList = (() => {
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
                })();
                // labelsInfo ：{labelname:{contents:[labelcontent1,labelcontent2],isSelected:true/false,isShow:true/false}};
                // contents为labelkey对应的labelcontent；isSelected是否被选中；isShow是否展示在页面上。
                this.labelsInfo = (() => {
                    let map = {};
                    const nodeList = this.nodeList;
                    for (let i = 0, l = nodeList.length; i < l; i++) {
                        for (let key in nodeList[i].labels) {
                            if (nodeList[i].labels.hasOwnProperty(key) && key != 'kubernetes.io/hostname' && key != 'hostEnv') {
                                if (map[key]) {
                                    let isContentExist = false;
                                    for (let j = 0, l1 = map[key].contents.length; j < l1; j++) {
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
                    if (this.labelsInfo.hasOwnProperty(label) && this.labelsInfo[label].isSelected) {
                        this.labelsInfo[label].isSelected = false;
                    }
                }
                this.toggleLabelNodes();
            },
            // @param env : 'PROD'(生产环境) or 'TEST'(测试环境)
            toggleEnv: function (env) {
                if (env == 'PROD' || env == 'TEST') {
                    this.labelsInfo.TESTENV.isSelected = env != 'PROD';
                    this.labelsInfo.PRODENV.isSelected = env == 'PROD';
                }
                this.toggleLabelNodes();
            },
            // 切换单个node的选中状态之后调用
            toggleNodeCheck: function (node) {
                let isAllHasChange = true;
                if (node.isSelected) {
                    this.selectedCount++;
                    // 是否为全选
                    for (let node of this.nodeList) {
                        // 过滤的node中有node未选中
                        if (node.keyFilter && node.labelFilter && !node.isSelected) {
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
                for (let node of this.nodeList) {
                    node.isSelected = false;
                    node.keyFilter = node.name.indexOf(keywords) !== -1;
                }
            },
            // 全选/全不选 node
            checkAllNode: function (isCheckAll) {
                this.isCheckAll = typeof isCheckAll === 'undefined' ? this.isCheckAll : isCheckAll;
                this.selectedCount = 0;
                for (let node of this.nodeList) {
                    if (node.keyFilter && node.labelFilter && this.isCheckAll) {
                        node.isSelected = true;
                        this.selectedCount++;
                    } else {
                        node.isSelected = false;
                    }
                }
            },
            // 切换单个label选中状态，label:labelkey，isSelect:true/false
            toggleLabel: function (label, isSelect) {
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
                    for (let node of this.nodeList) {
                        let hasAllSelect = true;
                        node.isSelected = false;
                        for (let key in this.labelsInfo) {
                            if (this.labelsInfo.hasOwnProperty(key) && this.labelsInfo[key].isSelected && node.labels[key] === void 0) {
                                hasAllSelect = false;
                                break;
                            }
                        }
                        node.labelFilter = hasAllSelect;
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
                angular.forEach(this.labelsInfo, (value, key) => {
                    if (value.isSelected) {
                        for (let i = 0, l = value.contents.length; i < l; i++) {
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
                for (let node of this.nodeList) {
                    if (node.isSelected) {
                        nodes.push(node.name);
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
            constructor: Cluster,
            init: function (clusterInfo) {
                let etcd = [],
                    etcdStrArr, zookeeper = [],
                    zookeeperStrArr, kafka = [],
                    kafkaStrArr;
                if (!$util.isObject(clusterInfo)) {
                    clusterInfo = {};
                }
                // 初始化etcd：etcd:'etcd1,etcd2'--> etcd:[{name:'etcd1'},{name:'etcd2'}]
                if (typeof clusterInfo.etcd === 'string') {
                    etcdStrArr = clusterInfo.etcd.split(',');
                    for (let i = 0, l = etcdStrArr.length; i < l; i++) {
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
                    for (let i = 0, l = zookeeperStrArr.length; i < l; i++) {
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
                if (typeof clusterInfo.clusterLog.kafka === 'string') {
                    kafkaStrArr = clusterInfo.clusterLog.kafka.split(',');
                    for (let i = 0, l = kafkaStrArr.length; i < l; i++) {
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
                if (Object.prototype.toString.call(user) !== '[object Object]') return;
                this.config.ownerName = user.name;
                // this.creatorDraft = {
                //     creatorType: user.type,
                //     creatorId: user.id
                // };
            },
            toggleLogConfig: function () {
                this.config.logConfig = this.config.logConfig === 1 ? 0 : 1;
            },
            validItem: function (item) {
                let valid = false;
                if (item != 'etcd' && this.config.logConfig === 0) {
                    valid = true;
                } else {
                    let itemArr = item == 'etcd' ? this.config.etcd : this.config.clusterLog[item] || [];
                    for (let i = 0, l = itemArr.length; i < l; i++) {
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
                    kafka = '';
                for (let sigEtcd of clusterConfig.etcd) {
                    if (sigEtcd.name) {
                        etcd += sigEtcd.name + ',';
                    }
                }
                clusterConfig.etcd = etcd;

                if (clusterConfig.logConfig === 0) {
                    clusterConfig.clusterLog = null;
                } else {
                    for (let sigZookeeper of clusterConfig.clusterLog.zookeeper) {
                        if (sigZookeeper.name) {
                            zookeeper += sigZookeeper.name + ',';
                        }
                    }
                    clusterConfig.clusterLog.zookeeper = zookeeper;

                    for (let sigKafka of clusterConfig.clusterLog.kafka) {
                        if (sigKafka.name) {
                            kafka += sigKafka.name + ',';
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
            _formartNewCluster: function (cluster) {
                let formartNewCluster = {};

                formartNewCluster.clusterInfo = cluster;
                // formartNewCluster.creatorDraft = this.creatorDraft;
                return formartNewCluster;
            },
            create: function () {
                let cluster = this._formartCluster(),
                    newCluster = this._formartNewCluster(cluster);
                return $http.post('/api/cluster', angular.toJson(newCluster.clusterInfo));
            }
        };
        // ClusterList Class
        const ClusterList = function (list) {
            this.cluster = {};
            this.clusterList = [];
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
})(angular.module('domeApp'));