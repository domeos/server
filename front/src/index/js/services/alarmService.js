/*
 * @author ChandraLee
 * @description 报警服务
 */

((domeApp, undefined) => {
    'use strict';
    if (typeof domeApp === 'undefined') return;

    domeApp.factory('$domeAlarm', ['$domeModel', '$domeUser', '$domeDeploy', '$domeCluster', '$http', '$domePublic', 'dialog', '$q', '$util', function ($domeModel, $domeUser, $domeDeploy, $domeCluster, $http, $domePublic, dialog, $q, $util) {
        const AlarmService = function () {
            $domeModel.ServiceModel.call(this, '/api/alarm/template');
        };
        const HostGroupService = function () {
            $domeModel.ServiceModel.call(this, '/api/alarm/hostgroup');
            this.addHost = (id, hostInfo) => $http.post(`/api/alarm/hostgroup/bind/${id}`, angular.toJson(hostInfo));
            this.deleteHost = (id, nodeId) => $http.delete(`/api/alarm/hostgroup/bind/${id}/${nodeId}`);
        };
        //用户组
        const UserGroupService = function () {
            $domeModel.ServiceModel.call(this, '/api/alarm/usergroup');
            this.getUserGroup = () => $http.get('/api/alarm/usergroup');
            this.createUserGroup = (userGroupDraft) => $http.post('/api/alarm/usergroup', angular.toJson(userGroupDraft));
            this.bindUser = (userGroupId, userInfo) => $http.post(`/api/alarm/usergroup/bind/${userGroupId}`, angular.toJson(userInfo));
            this.deleteUserGroup = (userGroupId) => $http.delete(`/api/alarm/usergroup/${userGroupId}`);
            this.updateUserGroup = (userGroupDraft) => $http.put('/api/alarm/usergroup', angular.toJson(userGroupDraft));
            this.deleteSingleUser = (userGroupId, userId) => $http.delete(`/api/alarm/usergroup/bind/${userGroupId}/${userId}`);
        };
        const clusterService = $domeCluster.getInstance('ClusterService');
        const _alarmService = new AlarmService();
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
                for (let strategy of alarmInfo.strategyList) {
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
                if (this.config.id === void 0) {
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
                        isFind;
                    if (configHostGroupList && configHostGroupList.length === 0) {
                        for (let hostGroup of this.hostGroupList) {
                            hostGroup.isSelected = false;
                        }
                    } else {
                        for (let i = 0, l = this.hostGroupList.length; i < l; i++) {
                            isFind = false;
                            for (let j = 0, l1 = configHostGroupList.length; j < l1; j++) {
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
                        dialog.error('警告', '获取主机组信息失败！');
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
                    let isFind;
                    if (!userGroupList || userGroupList.length === 0) {
                        for (let i = 0, l = this.groupList.length; i < l; i++) {
                            this.groupList[i].isSelected = false;
                        }
                    } else {
                        for (let i = 0, l = this.groupList.length; i < l; i++) {
                            isFind = false;
                            for (let j = 0, l1 = userGroupList.length; j < l1; j++) {
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
                    // $domeUser.userService.getGroup().then((res) => {
                    $http.get('/api/alarm/usergroup').then((res) => {
                        this.groupList = res.data.result || [];
                        init();
                    }, () => {
                        dialog.error('警告', '获取组信息失败！');
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
                                dialog.error('警告', '获取信息失败！');
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
                if (type === this.config.templateType) {
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
                    operator: '>=',
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
                config.templateName = this.config.templateName;
                config.templateType = this.config.templateType;
                config.id = this.config.id;

                if (config.templateType == 'host') {
                    config.templateType = this.config.templateType;
                    config.hostGroupList = [];
                    for (let i = 0, l = this.hostGroupList.length; i < l; i++) {
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
                for (let strategy of this.config.strategyList) {
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

                config.userGroupList = [];
                for (let i = 0, l = this.groupList.length; i < l; i++) {
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
                    sigItem.keyFilter = sigItem.name.indexOf(keywords) !== -1;
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
            AlarmTemplate: AlarmTemplate,
            UserGroupService: UserGroupService
        });

        const alarmEventService = {
            getData: () => $http.get('/api/alarm/event'),
            ignore: data => $http.post('/api/alarm/event/ignore', data)
        };
        return {
            getInstance: getInstance,
            alarmEventService: alarmEventService,
            keyMaps: keyMaps
        };
    }]);
})(angular.module('domeApp'));