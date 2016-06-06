(() => {
    'use strict';
    let deployModule = angular.module('deployModule', []);

    function DeployService($http, $domeCluster, $domeUser, $domeProject, $domeImage, $domePublic, $domeModel, $modal, $q) {
        const nodeService = $domeCluster.getInstance('NodeService');
        const DeployService = function () {
            const _url = '/api/deploy';
            const _versionUrl = '/api/version';
            this.getList = () => $http.get(_url + '/list');
            this.getSingle = (deployId) => $http.get(_url + '/id/' + deployId);
            this.getEvents = (deployId) => $http.get(_url + '/event/list?deployId=' + deployId);
            this.getInstances = (deployId) => $http.get(_url + '/' + deployId + '/instance');
            this.getVersions = (deployId) => $http.get(_versionUrl + '/list?deployId=' + deployId);
            this.getSingleVersion = (deployId, versionId) => $http.get(_versionUrl + '/id/' + deployId + '/' + versionId);
            this.createVersion = (version) => $http.post(_versionUrl + '/create?deployId=' + version.deployId, angular.toJson(version));
            this.rollbackDeploy = (deployId, versionId, replicas) => {
                if (replicas) {
                    return $http.post('/api/deploy/action/rollback?deployId=' + deployId + '&version=' + versionId + '&replicas=' + replicas);
                } else {
                    return $http.post('/api/deploy/action/rollback?deployId=' + deployId + '&version=' + versionId);
                }
            };
            this.updateDeploy = (deployId, versionId, replicas) => {
                if (replicas) {
                    return $http.post('/api/deploy/action/update?deployId=' + deployId + '&version=' + versionId + '&replicas=' + replicas);
                } else {
                    return $http.post('/api/deploy/action/update?deployId=' + deployId + '&version=' + versionId);
                }
            };
            this.startDeploy = (deployId, versionId, replicas) => {
                if (replicas) {
                    return $http.post('/api/deploy/action/start?deployId=' + deployId + '&version=' + versionId + '&replicas=' + replicas);
                } else {
                    return $http.post('/api/deploy/action/start?deployId=' + deployId + '&version=' + versionId);
                }
            };
        };
        const deployService = new DeployService();


        class Deploy {
            constructor(deployConfig) {
                this.namespaceList = [];
                // 是否是新建namespace
                this.isNewNamespace = false;
                this.imageList = undefined;
                this.envList = [{
                    value: 'TEST',
                    text: '测试环境'
                }, {
                    value: 'PROD',
                    text: '生产环境'
                }];
                // 表单不能实现的验证
                this.valid = {
                    // ip至少填一个
                    ips: false
                };
                // 是否开启日志收集
                this.logConfig = undefined;
                this.envText = '请选择部署环境';
                this.versionList = undefined;
                this.nodeListIns = $domeCluster.getInstance('NodeList');
                this.nodeListForIps = [];
                this.clusterListIns = $domeCluster.getInstance('ClusterList');
                this.loadingIns = $domePublic.getLoadingInstance();
                this.creator = {
                    id: null,
                    name: null,
                    type: null
                };
                this.visitMode = 'noAccess';
                this.config = {};
                this.init(deployConfig);
            }
            init(deployConfig) {
                    let currentVersions, i, j, id,
                        createTime = -1;

                    if (!deployConfig) {
                        deployConfig = {};
                    }
                    if (deployConfig.replicas === undefined) {
                        deployConfig.replicas = 3;
                    }
                    if (deployConfig.exposePortNum === undefined) {
                        deployConfig.exposePortNum = '';
                    }
                    // 是否使用负载均衡
                    if (!deployConfig.loadBalanceDrafts) {
                        deployConfig.loadBalanceDrafts = [];
                    }
                    //对内服务
                    if (!deployConfig.innerServiceDrafts) {
                        deployConfig.innerServiceDrafts = [];
                    }

                    // loadBalanceDraft.externalIPs: ['externalIP1','externalIP2'] --> [{ip:'externalIP1'},{ip:'externalIP1'},{ip:''}]
                    for (i = 0; i < deployConfig.loadBalanceDrafts.length; i++) {
                        if (!deployConfig.loadBalanceDrafts[i].externalIPs) {
                            deployConfig.loadBalanceDrafts[i].externalIPs = [];
                        }
                        let ipsArr = deployConfig.loadBalanceDrafts[i].externalIPs;
                        let externalIPs = [];
                        for (j = 0; j < ipsArr.length; j++) {
                            externalIPs.push({
                                ip: ipsArr[j]
                            });
                        }
                        externalIPs.push({
                            ip: ''
                        });
                        deployConfig.loadBalanceDrafts[i].externalIPs = externalIPs;
                    }

                    this.config = deployConfig;

                    this.addLoadBalance();
                    this.addInnerService();

                    //网络模式
                    if (!this.config.networkMode) {
                        this.config.networkMode = 'DEFAULT';
                    }
                    if (!this.config.accessType) {
                        this.config.accessType = 'K8S_SERVICE';
                    }
                    currentVersions = this.config.currentVersions;
                    // 是否是新建deploy
                    if (this.config.deployId) {
                        if (!this.versionList) {
                            deployService.getVersions(this.config.deployId).then((res) => {
                                this.versionList = res.data.result || [];
                                if (!currentVersions || currentVersions.length === 0) {
                                    this.toggleVersion(this.versionList[0].version);
                                }
                            });
                        }
                        if (currentVersions && currentVersions.length !== 0) {
                            for (i = 0; i < currentVersions.length; i++) {
                                if (currentVersions[i].createTime > createTime) {
                                    createTime = currentVersions[i].createTime;
                                    id = currentVersions[i].version;
                                }
                            }
                            this.toggleVersion(id);
                        }
                    } else {
                        this.initData();
                    }
                }
                // deployinfo和versioninfo重合的信息在这里处理，切换version之后重新调用进行初始化
            initData() {
                if (!this.config.logDraft) {
                    this.config.logDraft = {};
                }
                if (!this.config.logDraft.logItemDrafts) {
                    this.config.logDraft.logItemDrafts = [];
                }
                this.config.logDraft.logItemDrafts.push({
                    logPath: '',
                    autoCollect: false,
                    autoDelete: false
                });
                if (!this.config.containerDrafts) {
                    this.config.containerDrafts = [];
                }
                if (!this.config.labelSelectors) {
                    this.config.labelSelectors = [];
                }
                this.initSelectedLabels();

                if (!this.config.hostEnv) {
                    this.toggleEnv(this.envList[0]);
                } else {
                    for (let i = 0; i < this.envList.length; i++) {
                        if (this.config.hostEnv === this.envList[i].value) {
                            this.toggleEnv(this.envList[i]);
                            break;
                        }
                    }
                }

                if (!this.config.stateful) {
                    if (!this.imageList) {
                        this.loadingIns.startLoading('dockerImage');
                        $domeImage.imageService.getProjectImages().then((res) => {
                            let imageList = res.data.result || [];
                            // 格式化image的envSettings为containerDrafts格式
                            for (let i = 0; i < imageList.length; i++) {
                                let envs = [];
                                if (imageList[i].envSettings) {
                                    for (let j = 0; j < imageList[i].envSettings.length; j++) {
                                        envs.push({
                                            key: imageList[i].envSettings[j].key,
                                            value: imageList[i].envSettings[j].value,
                                            description: imageList[i].envSettings[j].description
                                        });
                                    }
                                }
                                imageList[i].envSettings = envs;
                            }
                            this.imageList = imageList;
                            // 处理部署已有的镜像
                            this.formartContainerDrafts();
                        }).finally(() => {
                            this.loadingIns.finishLoading('dockerImage');
                        });
                    } else {
                        this.formartContainerDrafts();
                    }
                }
            }
            initCluster() {
                    this.loadingIns.startLoading('cluster');
                    return nodeService.getData().then((res) => {
                        this.clusterListIns.init(res.data.result);
                        this.toggleCluster();
                    }).finally(() => {
                        this.loadingIns.finishLoading('cluster');
                    });
                }
                // 刷新当前Deploy状态
            freshDeploy(newConfig) {
                if (newConfig) {
                    this.config.lastUpdateTime = newConfig.lastUpdateTime;
                    this.config.deploymentStatus = newConfig.deploymentStatus;
                    this.config.currentVersions = newConfig.currentVersions;
                    this.config.currentReplicas = newConfig.currentReplicas;
                }
            }
            freshVersionList() {
                this.loadingIns.startLoading('versionList');
                deployService.getVersions(this.config.deployId).then((res) => {
                    this.versionList = res.data.result || [];
                }).finally(() => {
                    this.loadingIns.finishLoading('versionList');
                });
            }
            toggleCluster(index) {
                    let clusterId;
                    // 选择当前deploy/version的cluster
                    if (index === undefined) {
                        let isHasCluster = false,
                            clusterList = this.clusterListIns.clusterList;
                        for (let i = 0; i < clusterList.length; i++) {
                            if (clusterList[i].id === this.config.clusterId) {
                                isHasCluster = true;
                                index = i;
                                break;
                            }
                        }
                        // 如果当前deploy/version没有cluster，则选择第一个
                        if (!isHasCluster) {
                            if (this.clusterListIns.clusterList.length === 0) {
                                return;
                            }
                            index = 0;
                        }
                    }

                    this.clusterListIns.toggleCluster(index);
                    this.logConfig = this.clusterListIns.clusterList[index].logConfig;
                    clusterId = this.clusterListIns.cluster.id;

                    if (this.logConfig !== 1) {
                        this.config.logDraft = {
                            logItemDrafts: [{
                                logPath: '',
                                autoCollect: false,
                                autoDelete: false
                            }]
                        };
                    }

                    this.loadingIns.startLoading('nodelist');

                    nodeService.getNodeList(clusterId).then((res) => {
                        let nodeList = res.data.result || [];
                        this.nodeListForIps = angular.copy(nodeList);
                        for (let i = 0; i < this.nodeListForIps.length; i++) {
                            let node = this.nodeListForIps[i];
                            if (node.status == 'Ready') {
                                let ips = this.config.loadBalanceDrafts[0].externalIPs;
                                for (let ip of ips) {
                                    if (ip === node.ip) {
                                        node.isSelected = true;
                                        break;
                                    }
                                }
                                if (node.isSelected === undefined) {
                                    node.isSelected = false;
                                }
                            } else {
                                this.nodeListForIps.splice(i, 1);
                                i--;
                            }
                        }
                        // 如果是app store的主机列表，则过滤掉没有diskPath的主机
                        this.nodeListIns.init(nodeList, this.config.stateful);
                        this.initSelectedLabels();
                        this.nodeListIns.toggleEnv(this.config.hostEnv);
                        // 如果是有状态服务，默认选择和replics相等的主机个数
                        if (this.config.stateful && this.config.replicas && this.nodeListIns.nodeList) {
                            for (let i = 0; i < this.nodeListIns.nodeList.length && i < this.config.replicas; i++) {
                                this.nodeListIns.nodeList[i].isSelected = true;
                                this.nodeListIns.toggleNodeCheck(this.nodeListIns.nodeList[i]);
                            }
                        }
                    }, () => {
                        this.nodeListIns.init();
                    }).finally(() => {
                        this.loadingIns.finishLoading('nodelist');
                    });

                    if (this.config.deployId === undefined) {
                        this.loadingIns.startLoading('namespace');
                        nodeService.getNamespace(clusterId).then((res) => {
                            this.namespaceList = res.data.result || [];
                            this.isNewNamespace = false;
                            this.config.namespace = this.namespaceList[0].name || undefined;
                            for (let i = 0; i < this.namespaceList.length; i++) {
                                if (this.namespaceList[i].name == 'default') {
                                    this.config.namespace = this.namespaceList[i].name;
                                    break;
                                }
                            }
                        }, () => {
                            this.isNewNamespace = false;
                            this.namespaceList = [];
                            this.config.namespace = undefined;
                        }).finally(() => {
                            this.loadingIns.finishLoading('namespace');
                        });
                    }
                }
                // 初始化选中的label
            initSelectedLabels() {
                this.nodeListIns.initLabelsInfo();
                if (!this.config.labelSelectors) {
                    return;
                }
                let labelSelectors = this.config.labelSelectors;
                for (let labelSelector of labelSelectors) {
                    let labelName = labelSelector.name;
                    if (labelName != 'kubernetes.io/hostname' && labelName != 'TESTENV' && labelName != 'PRODENV') {
                        this.nodeListIns.toggleLabel(labelName, true);
                    }
                }
            }
            validIps() {
                    if (this.visitMode === 'foreign') {
                        for (let node of this.nodeListForIps) {
                            if (node.isSelected) {
                                this.valid.ips = true;
                                return;
                            }
                        }
                        this.valid.ips = false;
                    } else {
                        this.valid.ips = true;
                    }
                }
                // 切换当前展示的version
            toggleVersion(versionId) {
                    deployService.getSingleVersion(this.config.deployId, versionId).then((res) => {
                        if (res.data.result) {
                            $.extend(this.config, res.data.result);
                            this.initData();
                        }
                    });
                }
                // containerDrafts：新增containerDraft的oldEnv，newEnv，tagList属性
            formartContainerDrafts() {
                let containerDrafts = this.config.containerDrafts;

                const getTag = (containerDraft) => {
                    this.loadingIns.startLoading('tag');
                    $domeImage.imageService.getImageTags(containerDraft.image, containerDraft.registry).then((res) => {
                        containerDraft.tagList = res.data.result || [];
                    }).finally(() => {
                        this.loadingIns.finishLoading('tag');
                    });
                };
                for (let i = 0; i < containerDrafts.length; i++) {
                    containerDrafts[i].oldEnv = [];
                    containerDrafts[i].newEnv = [];
                    // 获得该镜像版本
                    getTag(containerDrafts[i]);
                    let oldEnv = [];
                    // 获得镜像原本的envSettings
                    for (let j = 0; j < this.imageList.length; j++) {
                        if (this.imageList[j].imageName === containerDrafts[i].image) {
                            oldEnv = this.imageList[j].envSettings;
                            break;
                        }
                    }
                    // 分离镜像本身的image和新添加的image的env
                    if (containerDrafts[i].envs) {
                        for (let w = 0; w < containerDrafts[i].envs.length; w++) {
                            let isOldEnv = false;
                            for (let k = 0; k < oldEnv.length; k++) {
                                if (oldEnv[k].key === containerDrafts[i].envs[w].key) {
                                    isOldEnv = true;
                                    break;
                                }
                            }
                            if (isOldEnv) {
                                containerDrafts[i].oldEnv.push(containerDrafts[i].envs[w]);
                            } else {
                                containerDrafts[i].newEnv.push(containerDrafts[i].envs[w]);
                            }
                        }
                    } else {
                        containerDrafts[i].oldEnv = angular.copy(oldEnv);
                    }
                }
            }
            toggleNamespace(namespace) {
                this.config.namespace = namespace;
            }
            toggleIsNewNamespace() {
                this.isNewNamespace = !this.isNewNamespace;
                this.config.namespace = undefined;
            }
            toggleEnv(env) {
                this.config.hostEnv = env.value;
                this.envText = env.text;
                this.nodeListIns.toggleEnv(env.value);
            }
            toggleCreator(user) {
                this.creator = user;
            }
            toggleImageTag(index, tag) {
                    this.config.containerDrafts[index].tag = tag;
                }
                // 添加containerDraft
            addImage(image) {
                    this.loadingIns.startLoading('addImage');
                    $domeImage.imageService.getImageTags(image.imageName, image.registry).then((res) => {
                        let tags = res.data.result;
                        this.config.containerDrafts.push({
                            image: image.imageName,
                            registry: image.registry,
                            cpu: 0.5,
                            mem: 1024,
                            tag: tags && tags[0] ? tags[0].tag : undefined,
                            tagList: tags ? tags : [],
                            oldEnv: image.envSettings ? image.envSettings : [],
                            newEnv: [],
                            healthChecker: {
                                type: 'NONE'
                            }
                        });
                    }).finally(() => {
                        this.loadingIns.finishLoading('addImage');
                    });
                }
                // 添加其他镜像
            addOtherImage() {
                let modalInstance = $modal.open({
                    animation: true,
                    templateUrl: '/index/tpl/modal/otherImageModal/otherImageModal.html',
                    controller: 'OtherImageModalCtr',
                    size: 'md'
                });
                modalInstance.result.then((imageInfo) => {
                    this.config.containerDrafts.push({
                        image: imageInfo.name,
                        registry: imageInfo.registry,
                        cpu: 0.5,
                        mem: 1024,
                        tag: imageInfo.tag,
                        tagList: [{
                            tag: imageInfo.tag
                        }],
                        oldEnv: [],
                        newEnv: []
                    });
                });
            }
            deleteImage(index) {
                this.config.containerDrafts.splice(index, 1);
            }
            addImageEnv(index) {
                this.config.containerDrafts[index].newEnv.push({
                    key: '',
                    value: '',
                    description: ''
                });
            }
            deleteImageEnv(containerDraftIndex, index) {
                this.config.containerDrafts[containerDraftIndex].newEnv.splice(index, 1);
            }
            addLoadBalance() {
                this.config.loadBalanceDrafts.push({
                    port: '',
                    targetPort: '',
                    externalIPs: [{
                        ip: ''
                    }]
                });
            }
            addInnerService() {
                this.config.innerServiceDrafts.push({
                    port: '',
                    targetPort: ''
                });
            }
            addExternalIPs(index) {
                this.config.loadBalanceDrafts[index].externalIPs.push({
                    ip: ''
                });
            }
            deleteExternalIPs(loadBalanceDraftIndex, index) {
                this.config.loadBalanceDrafts[loadBalanceDraftIndex].externalIPs.splice(index, 1);
            }
            addLogDraft() {
                this.config.logDraft.logItemDrafts.push({
                    logPath: '',
                    autoCollect: false,
                    autoDelete: false
                });
            }
            deleteLogDraft(index) {
                this.config.logDraft.logItemDrafts.splice(index, 1);
            }
            deleteArrItem(item, index) {
                this.config[item].splice(index, 1);
            }
            formartHealthChecker() {
                if (this.config.networkMode == 'HOST') {
                    for (let containerDraft of this.config.containerDrafts) {
                        containerDraft.healthChecker = {
                            type: 'NONE'
                        };
                    }
                }
            }
            changeNetworkmode() {
                if (this.config.networkMode == 'HOST') {
                    for (let i = 0; i < this.config.loadBalanceDrafts.length; i++) {
                        this.config.loadBalanceDrafts[i].port = this.config.loadBalanceDrafts[i].targetPort;
                    }
                }
            }
            changeTargetPort(index) {
                    this.config.loadBalanceDrafts[index].port = this.config.loadBalanceDrafts[index].targetPort;
                }
                // 将数据结构转换为与后台交互的数据格式
            _formartDeploy() {
                let deployConfig = angular.copy(this.config),
                    i = 0,
                    j = 0;

                if (deployConfig.networkMode == 'HOST') {
                    deployConfig.loadBalanceDrafts = [];
                    deployConfig.accessType = 'DIY';
                    deployConfig.innerServiceDrafts = [];
                    if (this.visitMode == 'noAccess') {
                        deployConfig.exposePortNum = 0;
                    }
                } else {
                    deployConfig.exposePortNum = 0;
                    if (this.visitMode == 'noAccess') {
                        deployConfig.accessType = 'DIY';
                        deployConfig.loadBalanceDrafts = [];
                        deployConfig.innerServiceDrafts = [];
                    } else if (this.visitMode == 'internal') {
                        deployConfig.accessType = 'K8S_SERVICE';
                        deployConfig.innerServiceDrafts[0].targetPort = deployConfig.innerServiceDrafts[0].port;
                        deployConfig.loadBalanceDrafts = [];
                    } else {
                        deployConfig.accessType = 'K8S_SERVICE';
                        deployConfig.innerServiceDrafts = [];
                    }
                }

                deployConfig.loadBalanceDrafts = (() => {
                    let ips = [],
                        loadBalanceDrafts = [];
                    for (let node of this.nodeListForIps) {
                        if (node.isSelected) {
                            ips.push(node.ip);
                        }
                    }
                    for (let loadBalanceDraft of deployConfig.loadBalanceDrafts) {
                        if (loadBalanceDraft.port) {
                            loadBalanceDraft.externalIPs = ips;
                            loadBalanceDrafts.push(loadBalanceDraft);
                        }
                    }
                    return loadBalanceDrafts;
                })();


                if (!deployConfig.stateful) {
                    deployConfig.labelSelectors = this.nodeListIns.getFormartSelectedLabels();
                } else {
                    deployConfig.hostList = this.nodeListIns.getSelectedNodes();
                }

                deployConfig.clusterId = this.clusterListIns.cluster.id;

                if (this.creator.id) {
                    deployConfig.creator = {
                        creatorId: this.creator.id,
                        creatorName: this.creator.name,
                        creatorType: this.creator.type
                    };
                }


                deployConfig.logDraft = (() => {
                    let logItemDrafts = [];
                    for (let logItem of deployConfig.logDraft.logItemDrafts) {
                        if (logItem.logPath !== '') {
                            let formartLogItem = {
                                logPath: logItem.logPath,
                                autoCollect: logItem.autoCollect,
                                autoDelete: logItem.autoDelete
                            };
                            if (logItem.autoCollect) {
                                formartLogItem.logTopic = logItem.logTopic;
                                formartLogItem.processCmd = logItem.processCmd;
                            }
                            if (logItem.autoDelete) {
                                formartLogItem.logExpired = logItem.logExpired;
                            }
                            logItemDrafts.push(formartLogItem);
                        }
                    }
                    if (logItemDrafts.length === 0) {
                        return null;
                    } else {
                        return {
                            logItemDrafts: logItemDrafts
                        };
                    }
                })();

                deployConfig.containerDrafts = (() => {
                    if (deployConfig.stateful) {
                        return deployConfig.containerDrafts;
                    }

                    if (!deployConfig.containerDrafts) {
                        return undefined;
                    }

                    let envConf, containerDrafts = [],
                        healthChecker;

                    for (let containerDraft of deployConfig.containerDrafts) {
                        envConf = containerDraft.oldEnv;
                        if (!containerDraft.healthChecker) {
                            containerDraft.healthChecker = {
                                type: 'NONE'
                            };
                        }
                        healthChecker = {
                            type: containerDraft.healthChecker.type
                        };

                        if (deployConfig.networkMode != 'HOST') {
                            if (healthChecker.type == 'TCP' || healthChecker.type == 'HTTP') {
                                healthChecker.port = containerDraft.healthChecker.port;
                                healthChecker.timeout = containerDraft.healthChecker.timeout;
                                healthChecker.delay = containerDraft.healthChecker.delay;
                            }
                            if (healthChecker.type == 'HTTP') {
                                healthChecker.url = containerDraft.healthChecker.url;
                            }
                        } else {
                            healthChecker.type = 'NONE';
                        }

                        for (let env of containerDraft.newEnv) {
                            if (env.key !== '') {
                                envConf.push(env);
                            }
                        }

                        containerDrafts.push({
                            image: containerDraft.image,
                            registry: containerDraft.registry,
                            tag: containerDraft.tag,
                            cpu: containerDraft.cpu,
                            mem: containerDraft.mem,
                            envs: envConf,
                            healthChecker: healthChecker
                        });
                    }
                    return containerDrafts;
                })();

                return deployConfig;
            }

            createVersion() { // 创建version
                    let deferred = $q.defer(),
                        newConfig = this._formartDeploy(),
                        versionObj = {
                            deployId: newConfig.deployId,
                            containerDrafts: newConfig.containerDrafts,
                            logDraft: newConfig.logDraft,
                            labelSelectors: newConfig.labelSelectors
                        };
                    deployService.createVersion(versionObj).then((res) => {
                        if (this.config.deploymentStatus != 'RUNNING') {
                            $domePublic.openPrompt('新建部署版本成功,当前状态不能升级。');
                            deferred.resolve('create');
                        } else {
                            $domePublic.openConfirm('成功新建部署版本，是否继续升级？').then(() => {
                                deployService.updateDeploy(this.config.deployId, res.data.result).then(() => {
                                    $domePublic.openPrompt('已提交，正在升级！');
                                    deferred.resolve('update');
                                }, (res) => {
                                    $domePublic.openWarning({
                                        title: '升级失败！',
                                        msg: res.data.resultMsg
                                    });
                                    deferred.resolve('updateFailed');
                                });
                            }, () => {
                                deferred.resolve('dismiss');
                            });
                        }
                    }, (res) => {
                        $domePublic.openWarning({
                            title: '创建版本失败！',
                            msg: res.data.resultMsg
                        });
                        deferred.reject('create');
                    });
                    return deferred.promise;
                }
                // 停止
            stop() {
                return $http.post('/api/deploy/action/stop?deployId=' + this.config.deployId);
            }
            abort() {
                    return $http.post('/api/deploy/action/abort?deployId=' + this.config.deployId);
                }
                // 扩容/缩容
            scale() {
                    let deferred = $q.defer();
                    let modalInstance = $modal.open({
                        animation: true,
                        templateUrl: 'scaleModal.html',
                        controller: 'ScaleModalCtr',
                        size: 'md',
                        resolve: {
                            oldReplicas: () => this.config.currentReplicas
                        }
                    });
                    modalInstance.result.then((replicas) => {
                        replicas = parseInt(replicas);
                        let url = '';
                        let currentVersionId = this.config.currentVersions[0].version;
                        if (replicas > this.config.currentReplicas) {
                            url = 'api/deploy/action/scaleup';
                        } else if (replicas < this.config.currentReplicas) {
                            url = 'api/deploy/action/scaledown';
                        }
                        $http.post(url + '?deployId=' + this.config.deployId + '&replicas=' + replicas + '&version=' + currentVersionId).then((res) => {
                            $domePublic.openPrompt('操作成功！');
                            deferred.resolve(res.data.result);
                        }, function () {
                            $domePublic.openWarning('请求失败！');
                            deferred.reject('requestError');
                        });
                    }, function () {
                        deferred.reject('dismiss');
                    });
                    return deferred.promise;
                }
                // 恢复
            recoverVersion() {
                    let deferred = $q.defer();
                    let versionModalIns = $modal.open({
                        animation: true,
                        templateUrl: 'versionListModal.html',
                        controller: 'VersionListModalCtr',
                        size: 'md',
                        resolve: {
                            deployInfo: () => this.config
                        }
                    });
                    versionModalIns.result.then((startInfo) => {
                        deployService.rollbackDeploy(this.config.deployId, startInfo.versionId, startInfo.replicas).then((res) => {
                            deferred.resolve(res.data.result);
                        }, () => {
                            deferred.reject();
                        });
                    }, () => {
                        deferred.reject('dismiss');
                    });
                    return deferred.promise;
                }
                // 升级
            updateVersion() {
                    let deferred = $q.defer();
                    let versionModalIns = $modal.open({
                        animation: true,
                        templateUrl: 'versionListModal.html',
                        controller: 'VersionListModalCtr',
                        size: 'md',
                        resolve: {
                            deployInfo: () => this.config
                        }
                    });
                    versionModalIns.result.then((startInfo) => {
                        let currentVersionId = this.config.currentVersions[0].version;
                        if (currentVersionId === startInfo.versionId) {
                            $domePublic.openWarning('您不能选择当前版本！');
                            deferred.reject('dismiss');
                        } else if (currentVersionId > startInfo.versionId) {
                            deployService.rollbackDeploy(this.config.deployId, startInfo.versionId, startInfo.replicas).then((res) => {
                                $domePublic.openPrompt('已提交，正在回滚！');
                                deferred.resolve(res.data.result);
                            }, () => {
                                $domePublic.openWarning('回滚失败，请重试！');
                                deferred.reject();
                            });
                        } else {
                            deployService.updateDeploy(this.config.deployId, startInfo.versionId, startInfo.replicas).then((res) => {
                                $domePublic.openPrompt('已提交，正在升级！');
                                deferred.resolve(res.data.result);
                            }, () => {
                                $domePublic.openPrompt('升级失败，请重试！');
                                deferred.reject();
                            });
                        }
                    }, () => {
                        deferred.reject('dismiss');
                    });
                    return deferred.promise;
                }
                // 启动
            startVersion() {
                    let deferred = $q.defer();
                    let versionModalIns = $modal.open({
                        animation: true,
                        templateUrl: 'versionListModal.html',
                        controller: 'VersionListModalCtr',
                        size: 'md',
                        resolve: {
                            deployInfo: () => this.config
                        }
                    });
                    versionModalIns.result.then((startInfo) => {
                        deployService.startDeploy(this.config.deployId, startInfo.versionId, startInfo.replicas).then((res) => {
                            deferred.resolve(res.data.result);
                        }, () => {
                            deferred.reject();
                        });
                    }, () => {
                        deferred.reject('dismiss');
                    });
                    return deferred.promise;
                }
                // 删除
            delete() {
                    return $http.delete('/api/deploy/id/' + this.config.deployId);
                }
                // 新建
            create() {
                let deferred = $q.defer(),
                    obj = this._formartDeploy();

                function createDeploy() {
                    $http.post('api/deploy/create', angular.toJson(obj)).then(() => {
                        deferred.resolve();
                    }, (res) => {
                        deferred.reject({
                            type: 'create',
                            msg: res.data.resultMsg
                        });
                    });
                }

                if (this.isNewNamespace) {
                    let namespace = this.config.namespace;
                    let namespaceArr = [namespace];
                    nodeService.setNamespace(this.clusterListIns.cluster.id, namespaceArr).then(() => {
                        this.toggleIsNewNamespace();
                        this.namespaceList.push(namespace);
                        this.toggleNamespace(namespace);
                        createDeploy();
                    }, (res) => {
                        deferred.reject({
                            type: 'namespace',
                            msg: res.data.resultMsg
                        });
                    });
                } else {
                    createDeploy();
                }
                return deferred.promise;
            }
        }
        class DeployInstanceList {
            constructor(instances) {
                this.isCheckAll = false;
                this.isCheckAllContainer = false;
                this.containerList = [];
                // 已选中instance数
                this.selectedCount = 0;
                // 已选中container数
                this.selectedContainerCount = 0;
                this.init(instances);
            }
            init(instances) {
                    this.isCheckAll = false;
                    this.isCheckAllContainer = false;
                    this.instanceList = (function (instances) {
                        instances = instances || [];
                        for (let i = 0; i < instances.length; i++) {
                            instances[i].isSelected = false;
                            instances[i].keyFilter = true;
                            if (instances[i].containers) {
                                for (let j = 0; j < instances[i].containers.length; j++) {
                                    instances[i].containers[j].shortContainerId = instances[i].containers[j].containerId.substring(0, 12);
                                }
                            }
                        }
                        return instances;
                    })(instances);
                }
                // 选择实例-->切换containerList
            toggleContainerList(instance) {
                this.isCheckAllContainer = false;
                this.selectedContainerCount = 0;
                this.containerList = instance.containers || [];
                for (let i = 0; i < this.containerList.length; i++) {
                    this.containerList[i].isSelected = false;
                }
            }
            filterWithKey(keywords) {
                this.isCheckAll = false;
                this.selectedCount = 0;
                for (let i = 0; i < this.instanceList.length; i++) {
                    this.instanceList[i].isSelected = false;
                    this.instanceList[i].keyFilter = this.instanceList[i].instanceName.indexOf(keywords) !== -1;
                }
            }
            toggleContainerCheck(container) {
                    let isAllHasChange = true;
                    if (container.isSelected) {
                        this.selectedContainerCount++;
                        // 是否为全选
                        for (let i = 0; i < this.containerList.length; i++) {
                            if (!this.containerList[i].isSelected) {
                                isAllHasChange = false;
                                break;
                            }
                        }
                        if (isAllHasChange) {
                            this.isCheckAllContainer = true;
                        }
                    } else {
                        this.selectedContainerCount--;
                        this.isCheckAllContainer = false;
                    }
                }
                // 全选/全不选
            checkAllContainer(isCheckAllContainer) {
                    this.isCheckAllContainer = isCheckAllContainer === undefined ? !this.isCheckAllContainer : isCheckAllContainer;
                    if (this.isCheckAllContainer) {
                        this.selectedContainerCount = this.containerList.length;
                    } else {
                        this.selectedContainerCount = 0;
                    }
                    for (let i = 0; i < this.containerList.length; i++) {
                        this.containerList[i].isSelected = this.isCheckAllContainer;
                    }
                }
                // 切换单个实例的选中状态
            toggleCheck(instance) {
                    let isAllHasChange = true;
                    if (instance.isSelected) {
                        this.selectedCount++;
                        // 是否为全选
                        for (let i = 0; i < this.instanceList.length; i++) {
                            if (this.instanceList[i].keyFilter && !this.instanceList[i].isSelected) {
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
                }
                // 全选/全不选
            checkAllInstance(isCheckAll) {
                this.isCheckAll = isCheckAll === undefined ? this.isCheckAll : isCheckAll;
                this.selectedCount = 0;
                for (let i = 0; i < this.instanceList.length; i++) {
                    if (this.instanceList[i].keyFilter && this.isCheckAll) {
                        this.instanceList[i].isSelected = true;
                        this.selectedCount++;
                    } else {
                        this.instanceList[i].isSelected = false;
                    }
                }
            }
        }

        class DeployList {
            constructor(deployList) {
                this.deploy = {};
                this.isLoading = false;
                this.deployInstanceListIns = new DeployInstanceList();
                this.init(deployList);
            }
            init(deployList) {
                this.deployList = deployList || [];
            }
            toggleDeploy(deployId, deployName, namespace, notNeedInstances) {
                    let deferred = $q.defer();
                    if (!deployId) {
                        this.deploy.id = undefined;
                        this.deploy.name = undefined;
                        this.deploy.namespace = undefined;
                        this.deployInstanceListIns.init();
                        deferred.reject();
                    } else {
                        this.deploy.id = deployId;
                        this.deploy.name = deployName;
                        this.deploy.namespace = namespace;
                        this.isLoading = true;
                        if (!notNeedInstances) {
                            deployService.getInstances(deployId).then((res) => {
                                this.deployInstanceListIns.init(res.data.result);
                                deferred.resolve();
                            }).finally(function () {
                                deferred.reject();
                                this.isLoading = false;
                            });
                        }
                    }
                    return deferred.promise;
                }
                // @param hostEnv: 'TEST' or 'PROD'
            filterDeploy(clusterName, hostEnv) {
                let firstIndex = -1,
                    deployId, deployName, namespace;
                for (let i = 0; i < this.deployList.length; i++) {
                    if (clusterName) {
                        this.deployList[i].clusterFilter = this.deployList[i].clusterName === clusterName;
                    } else {
                        this.deployList[i].clusterFilter = true;
                    }
                    if (hostEnv) {
                        this.deployList[i].hostFilter = this.deployList[i].hostEnv === hostEnv;
                    } else {
                        this.deployList[i].hostFilter = true;
                    }
                    // 选中第一个符合条件的部署并切换到该部署
                    if (firstIndex === -1 && this.deployList[i].clusterFilter && this.deployList[i].hostFilter) {
                        firstIndex = i;
                        deployId = this.deployList[i].deployId;
                        deployName = this.deployList[i].deployName;
                        namespace = this.deployList[i].namespace;
                    }

                }
                if (firstIndex === -1) {
                    return this.toggleDeploy();
                } else {
                    return this.toggleDeploy(deployId, deployName, namespace);
                }
            }
        }

        // 获得实例
        const getInstance = $domeModel.instancesCreator({
            DeployList: DeployList,
            Deploy: Deploy
        });
        return {
            deployService: deployService,
            getInstance: getInstance
        };
    }
    DeployService.$inject = ['$http', '$domeCluster', '$domeUser', '$domeProject', '$domeImage', '$domePublic', '$domeModel', '$modal', '$q'];
    deployModule.factory('$domeDeploy', DeployService);
    window.deployModule = deployModule;
})();