domeApp.factory('$domeAlarm', ['$domeModel', '$domeUser', '$domeDeploy', '$domeCluster', '$http', '$domePublic', '$q', function ($domeModel, $domeUser, $domeDeploy, $domeCluster, $http, $domePublic, $q) {
    let AlarmService = function () {
        $domeModel.ServiceModel.call(this, '/api/alarm/template');
    };
    let HostGroupService = function () {
        $domeModel.ServiceModel.call(this, '/api/alarm/hostgroup');
        this.addHost = (id, hostInfo) => $http.post('/api/alarm/hostgroup/bind/' + id, angular.toJson(hostInfo));
        this.deleteHost = (id, nodeId) => $http.delete('/api/alarm/hostgroup/bind/' + id + '/' + nodeId);
    };
    const clusterService = $domeCluster.getInstance('ClusterService');
    let _alarmService = new AlarmService();
    const keyMaps = {
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
    class AlarmTemplate {
        constructor(alarmInfo) {
            this.config = {};
            this.hostGroupList = [];
            this.keyMaps = keyMaps;
            this.groupList = [];
            this.deployListIns = $domeDeploy.getInstance('DeployList');
            this.loadingIns = $domePublic.getLoadingInstance();
            this.clusterList = [];
            this.init(alarmInfo);
        }
        init(alarmInfo) {
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
            for (let i = 0; i < alarmInfo.strategyList.length; i++) {
                let strategy = alarmInfo.strategyList[i];
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
        initHostGroupList() {
            let hostGroupService;

            const init = () => {
                let configHostGroupList = this.config.hostGroupList,
                    i = 0,
                    j = 0,
                    isFind;
                if (configHostGroupList && configHostGroupList.length === 0) {
                    for (i = 0; i < this.hostGroupList.length; i++) {
                        this.hostGroupList[i].isSelected = false;
                    }
                } else {
                    for (i = 0; i < this.hostGroupList.length; i++) {
                        isFind = false;
                        for (j = 0; j < configHostGroupList.length; j++) {
                            if (configHostGroupList[j].id === this.hostGroupList[i].id) {
                                isFind = true;
                                break;
                            }
                        }
                        this.hostGroupList[i].isSelected = isFind;
                    }
                }
            };
            if (this.hostGroupList.length === 0) {
                this.loadingIns.startLoading('hostgroup');
                hostGroupService = new HostGroupService();
                hostGroupService.getData().then((res) => {
                    this.hostGroupList = res.data.result || [];
                    init();
                }, () => {
                    $domePublic.openWarning('获取主机组信息失败！');
                }).finally(() => {
                    this.loadingIns.finishLoading('hostgroup');
                });
            } else {
                init();
            }

        }
        initGroupList() {
            let userGroupList = this.config.userGroupList;

            const init = () => {
                let i = 0,
                    j = 0,
                    isFind;
                if (!userGroupList || userGroupList.length === 0) {
                    for (i = 0; i < this.groupList.length; i++) {
                        this.groupList[i].isSelected = false;
                    }
                } else {
                    for (i = 0; i < this.groupList.length; i++) {
                        isFind = false;
                        for (j = 0; j < userGroupList.length; j++) {
                            if (this.groupList[i].id === userGroupList[j].id) {
                                isFind = true;
                                break;
                            }
                        }
                        this.groupList[i].isSelected = isFind;
                    }
                }
            };
            if (this.groupList.length === 0) {
                this.loadingIns.startLoading('groupList');
                $domeUser.userService.getGroup().then((res) => {
                    this.groupList = res.data.result || [];
                    init();
                }, () => {
                    $domePublic.openWarning('获取组信息失败！');
                }).finally(() => {
                    this.loadingIns.finishLoading('groupList');
                });
            } else {
                init();
            }
        }
        initDeployAndClusterList() {
                let deploymentInfo = this.config.deploymentInfo;
                if (this.deployListIns.deployList.length === 0) {
                    this.loadingIns.startLoading('deploy');
                    $q.all([$domeDeploy.deployService.getList(), clusterService.getData()])
                        .then((res) => {
                            this.deployListIns.init(res[0].data.result);
                            this.clusterList = res[1].data.result || [];
                            if (!deploymentInfo.clusterName) {
                                deploymentInfo.clusterName = this.clusterList[0].name;
                                this.toggleCluster(this.clusterList[0].name);
                            } else {
                                this.toggleHostEnv(deploymentInfo.hostEnv);
                                this.deployListIns.deploy.id = deploymentInfo.id;
                                this.deployListIns.deploy.name = deploymentInfo.deploymentName;
                            }
                        }, () => {
                            $domePublic.openWarning('获取信息失败！');
                        }).finally(() => {
                            this.loadingIns.finishLoading('deploy');
                        });
                } else {
                    this.toggleHostEnv(deploymentInfo.hostEnv);
                    this.deployListIns.deploy.id = deploymentInfo.id;
                    this.deployListIns.deploy.name = deploymentInfo.deploymentName;
                }
            }
            // @param type: 'host'/'deploy'
        toggleTemplateType(type) {
            if (type == this.config.templateType) {
                return;
            }
            this.config.templateType = type;
            this.config.strategyList = [];
            this.addStrategy();
        }
        addStrategy() {
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
        deleteStrategy(index) {
            this.config.strategyList.splice(index, 1);
        }
        toggleStrategyMetric(strategyIndex, metric) {
            let strategy = this.config.strategyList[strategyIndex];
            if (strategy.metric === metric) return;
            if (metric === 'agent_alive') {
                strategy.aggregateType = 'max';
            }
            strategy.metric = metric;
            strategy.tag = '';
        }
        toggleHostEnv(env) {
            this.config.deploymentInfo.hostEnv = env;
            this.deployListIns.filterDeploy(this.config.deploymentInfo.clusterName, env);
        }
        toggleCluster(clusterName) {
            this.config.deploymentInfo.clusterName = clusterName;
            this.deployListIns.filterDeploy(clusterName, this.config.deploymentInfo.hostEnv);
        }
        getFormartConfig() {
            let config = {};
            let i = 0,
                strategy;
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
        create() {
            return _alarmService.setData(this.getFormartConfig());
        }
        modify() {
            return _alarmService.updateData(this.getFormartConfig());
        }

    }
    // hostGroup添加主机
    class NodeList extends $domeModel.SelectListModel {

        constructor(nodeList, clusterName) {
            super('nodeList');
            this.selectedList = [];
            this.init(nodeList, clusterName);
        }
        init(nodeList, clusterName) {
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
            for (let node of nodeList) {
                for (let selectedNode of this.selectedList) {
                    if (selectedNode.cluster === clusterName && selectedNode.name === node.name) {
                        node.isSelected = true;
                        break;
                    }
                }
                if (!node.isSelected) {
                    node.isSelected = false;
                }
            }
            super.init(nodeList);
        }
        initSelectedList() {
            this.selectedList = [];
            this.checkAllItem(false);
        }
        checkAllItem(isCheckAll) {
            super.checkAllItem(isCheckAll);
            if (isCheckAll) {
                for (let node of this.nodeList) {
                    if (node.isSelected) {
                        let isExist = false;
                        for (let selectedNode of this.selectedList) {
                            if (this.clusterName === selectedNode.cluster && node.name === selectedNode.name) {
                                isExist = true;
                                break;
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
            } else {
                for (let node of this.nodeList) {
                    for (let i = 0; i < this.selectedList.length; i++) {
                        let selectedNode = this.selectedList[i];
                        if (this.clusterName === selectedNode.cluster && node.name === selectedNode.name) {
                            this.selectedList.splice(i, 1);
                            i--;
                            break;
                        }
                    }
                }
            }
        }
        toggleCheck(item, isSelected) {
            super.toggleCheck(item, isSelected);
            if (isSelected) {
                item.cluster = this.clusterName;
                this.selectedList.push({
                    name: item.name,
                    ip: item.ip,
                    cluster: item.cluster
                });
            } else {
                for (let i = 0; i < this.selectedList.length; i++) {
                    if (this.selectedList[i].name === item.name && this.selectedList[i].cluster === this.clusterName) {
                        this.selectedList.splice(i, 1);
                        break;
                    }
                }
            }
        }
        deleteSelectedNode(node) {
            if (node.cluster === this.clusterName) {
                for (let sigNode of this.nodeList) {
                    if (sigNode.name === node.name) {
                        super.toggleCheck(sigNode, false);
                        break;
                    }
                }
            }
            for (let i = 0; i < this.selectedList.length; i++) {
                if (this.selectedList[i].name === node.name && this.selectedList[i].cluster === node.cluster) {
                    this.selectedList.splice(i, 1);
                    break;
                }
            }
        }
        filterWithKey(keywords) {
            this.selectedCount = 0;
            this.isCheckAll = true;
            for (let sigItem of this.nodeList) {
                let exist = false;
                sigItem.keyFilter = sigItem.name.indexOf(keywords) !== -1 ? true : false;
                if (sigItem.keyFilter) {
                    for (let selectedNode of this.selectedList) {
                        if (selectedNode.name === sigItem.name && selectedNode.cluster === this.clusterName) {
                            sigItem.isSelected = true;
                            this.selectedCount++;
                            break;
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
            if (this.selectedCount === 0) {
                this.isCheckAll = false;
            }
        }

    }

    const getInstance = $domeModel.instancesCreator({
        NodeList: NodeList,
        AlarmService: AlarmService,
        HostGroupService: HostGroupService,
        AlarmTemplate: AlarmTemplate
    });

    const alarmEventService = {
        getData: () => $http.get('/api/alarm/event'),
        ignore: (data) => $http.post('/api/alarm/event/ignore', data)
    };
    return {
        getInstance: getInstance,
        alarmEventService: alarmEventService,
        keyMaps: keyMaps
    };
}]);