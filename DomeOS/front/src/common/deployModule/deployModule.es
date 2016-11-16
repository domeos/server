/*
 * @author  ChandraLee
 * @description  部署模块
 */

((window, undefined) => {
    'use strict';
    let deployModule = angular.module('deployModule', []);

    function DeployService($http, $domeCluster, $domeImage, $domePublic, $domeModel, $modal, $q, $util) {
        const nodeService = $domeCluster.getInstance('NodeService');
        const DeployService = function () {
            const _url = '/api/deploy';
            const _versionUrl = '/api/version';
            this.getList = () => $http.get(`${_url}/list`);
            this.getListByCollectionId = (collectionId) => $http.get(`${_url}/list/${collectionId}`);
            this.getSingle = (deployId) => $http.get(`${_url}/id/${deployId}`);
            this.getEvents = (deployId) => $http.get(`${_url}/event/list?deployId=${deployId}`);
            this.getInstances = (deployId) => $http.get(`${_url}/${deployId}/instance`);
            this.getVersions = (deployId) => $http.get(`${_versionUrl}/list?deployId=${deployId}`);
            this.getSingleVersion = (deployId, versionId) => $http.get(`${_versionUrl}/id/${deployId}/${versionId}`);
            this.createVersion = (version) => $http.post(`${_versionUrl}/create?deployId=${version.deployId}`, angular.toJson(version));
            this.rollbackDeploy = (deployId, versionId, replicas) => {
                if (replicas) {
                    return $http.post(`/api/deploy/action/rollback?deployId=${deployId}&version=${versionId}&replicas=${replicas}`);
                } else {
                    return $http.post(`/api/deploy/action/rollback?deployId=${deployId}&version=${versionId}`);
                }
            };
            this.updateDeploy = (deployId, versionId, replicas) => {
                if (replicas) {
                    return $http.post(`/api/deploy/action/update?deployId=${deployId}&version=${versionId}&replicas=${replicas}`);
                } else {
                    return $http.post(`/api/deploy/action/update?deployId=${deployId}&version=${versionId}`);
                }
            };
            this.startDeploy = (deployId, versionId, replicas) => {
                if (replicas) {
                    return $http.post(`/api/deploy/action/start?deployId=${deployId}&version=${versionId}&replicas=${replicas}`);
                } else {
                    return $http.post(`/api/deploy/action/start?deployId=${deployId}&version=${versionId}`);
                }
            };
        };
        const deployService = new DeployService();


        class Deploy {
            constructor(deployConfig) {
                this.collectionId = '';
                this.namespaceList = [];
                // 是否是新建namespace
                this.isNewNamespace = false;
                this.imageList = null;
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
                this.logConfig = null;
                this.envText = '请选择部署环境';
                this.versionList = null;
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
                this.hostEnv = 'TEST';
                this.config = {};
                this.defaultVersionString = {
                  'YAML': 'containers:\n- image: \"pub.domeos.org/registry:2.3\"\n  name: \"test-container\"\n  volumeMounts:\n  - mountPath: \"/test-hostpath\"\n    name: \"test-volume\"\nvolumes:\n- hostPath:\n    path: \"/opt/scs\"\n  name: \"test-volume\"\n',
                  'JSON': '{\n  \"containers\": [{\n    \"image\": \"pub.domeos.org/registry:2.3\",\n    \"name\": \"test-container\",\n    \"volumeMounts\": [{\n      \"mountPath\": \"/test-hostpath\",\n      \"name\": \"test-volume\"\n    }]\n  }],\n  \"volumes\": [{\n    \"hostPath\": {\n      \"path\": \"/opt/scs\"\n    },\n    \"name\": \"test-volume\"\n  }]\n}\n',
                };
                this.init(deployConfig);
            }
            init(deployConfig) {
                    let currentVersions, id,
                        createTime = -1;

                    if (!$util.isObject(deployConfig)) {
                        deployConfig = {};
                    }

                    if (!deployConfig.versionType) {
                        deployConfig.versionType = 'CUSTOM';
                    }
                    if (deployConfig.versionType === 'YAML' || deployConfig.versionType === 'JSON') {
                        deployConfig.versionString = deployConfig.versionString || {};
                        deployConfig.versionString.podSpec = deployConfig.versionString.padSpec || '';
                    }

                    if (typeof deployConfig.replicas !== 'number') {
                        deployConfig.replicas = 3;
                    }
                    // 是否使用负载均衡
                    if (!$util.isArray(deployConfig.loadBalanceDrafts)) {
                        deployConfig.loadBalanceDrafts = [];
                    }
                    //对内服务
                    if (!$util.isArray(deployConfig.innerServiceDrafts)) {
                        deployConfig.innerServiceDrafts = [];
                    }
                    if (!$util.isArray(deployConfig.currentVersions)) {
                        deployConfig.currentVersions = [];
                    }
                    // loadBalanceDraft.externalIPs: ['externalIP1','externalIP2'] --> [{ip:'externalIP1'},{ip:'externalIP1'},{ip:''}]
                    for (let loadBalanceDraft of deployConfig.loadBalanceDrafts) {
                        if (!loadBalanceDraft.externalIPs) {
                            loadBalanceDraft.externalIPs = [];
                        }
                        let externalIPs = [];
                        for (let ip of loadBalanceDraft.externalIPs) {
                            externalIPs.push({
                                ip: ip
                            });
                        }
                        externalIPs.push({
                            ip: ''
                        });
                        loadBalanceDraft.externalIPs = externalIPs;
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
                                if (currentVersions.length === 0 && $util.isObject(this.versionList[0])) {
                                    this.toggleVersion(this.versionList[0].version);
                                }
                            });
                        }
                        for (let i = 0, l = currentVersions.length; i < l; i++) {
                            if (currentVersions[i].createTime > createTime) {
                                createTime = currentVersions[i].createTime;
                                id = currentVersions[i].version;
                            }
                        }
                        this.toggleVersion(id);
                    } else {
                        this.initData();
                    }
                }
                // deployinfo和versioninfo重合的信息在这里处理，切换version之后重新调用进行初始化
            initData() {
                if (!$util.isArray(this.config.containerDrafts)) {
                    this.config.containerDrafts = [];
                }
                if (!$util.isArray(this.config.labelSelectors)) {
                    this.config.labelSelectors = [];
                }
                this.initSelectedLabels();

                if (!this.config.hostEnv) {
                    this.toggleEnv(this.envList[0]);
                } else {
                    for (let env of this.envList) {
                        if (this.config.hostEnv === env.value) {
                            this.toggleEnv(env);
                            break;
                        }
                    }
                }

                if (this.config.stateful !== true) {
                    if (!$util.isArray(this.imageList)) {
                        this.loadingIns.startLoading('dockerImage');
                        $domeImage.imageService.getProjectImages().then((res) => {
                            let imageList = res.data.result || [];
                            // 格式化image的envSettings为containerDrafts格式
                            for (let image of imageList) {
                                let envs = [];
                                if (image.envSettings) {
                                    for (let env of image.envSettings) {
                                        envs.push({
                                            key: env.key,
                                            value: env.value,
                                            description: env.description
                                        });
                                    }
                                }
                                image.envSettings = envs;
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

                //console.log(this.config.containerDrafts);
                for (let image of this.config.containerDrafts) {
                    this.addLogDraft(image);
                }
            }
            setCollectionId(collectionId) {
              this.collectionId = collectionId;
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
                if ($util.isObject(newConfig)) {
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
                    let clusterId,
                        clusterList = this.clusterListIns.clusterList;
                    if (clusterList.length === 0) {
                        return;
                    }
                    // 选择当前deploy/version的cluster
                    if (typeof index === 'undefined') {
                        for (let i = 0, l = clusterList.length; i < l; i++) {
                            if (clusterList[i].id === this.config.clusterId) {
                                index = i;
                                break;
                            }
                        }
                        // 如果当前deploy/version没有cluster，则选择第一个
                        if (typeof index === 'undefined') {
                            index = 0;
                        }
                    }

                    this.clusterListIns.toggleCluster(index);
                    this.logConfig = clusterList[index].logConfig;
                    clusterId = this.clusterListIns.cluster.id;
                    // 重置日志信息
                    /*
                    if (this.logConfig !== 1) {
                        this.config.logDraft = {
                            logItemDrafts: [{
                                logPath: '',
                                autoCollect: false,
                                autoDelete: false
                            }]
                        };
                    }
                    */

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
                                if (node.isSelected === void 0) {
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
                            for (let i = 0, l = this.nodeListIns.nodeList.length; i < l && i < this.config.replicas; i++) {
                                this.nodeListIns.nodeList[i].isSelected = true;
                                this.nodeListIns.toggleNodeCheck(this.nodeListIns.nodeList[i]);
                            }
                        }
                    }, () => {
                        this.nodeListIns.init();
                    }).finally(() => {
                        this.loadingIns.finishLoading('nodelist');
                    });

                    if (this.config.deployId === void 0) {
                        this.loadingIns.startLoading('namespace');
                        nodeService.getNamespace(clusterId).then((res) => {
                            this.namespaceList = res.data.result || [];
                            this.isNewNamespace = false;
                            this.config.namespace = this.namespaceList[0].name || null;
                            for (let i = 0, l = this.namespaceList.length; i < l; i++) {
                                if (this.namespaceList[i].name == 'default') {
                                    this.config.namespace = this.namespaceList[i].name;
                                    break;
                                }
                            }
                        }, () => {
                            this.isNewNamespace = false;
                            this.namespaceList = [];
                            this.config.namespace = null;
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
                        if ($util.isObject(res.data.result)) {
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
                for (let i = 0, l = containerDrafts.length; i < l; i++) {
                    containerDrafts[i].oldEnv = [];
                    containerDrafts[i].newEnv = [];
                    // 获得该镜像版本
                    getTag(containerDrafts[i]);
                    let oldEnv = [];
                    // 获得镜像原本的envSettings
                    for (let j = 0, l1 = this.imageList.length; j < l1; j++) {
                        if (this.imageList[j].imageName === containerDrafts[i].image) {
                            oldEnv = this.imageList[j].envSettings;
                            break;
                        }
                    }
                    // 分离镜像本身的image和新添加的image的env
                    if (containerDrafts[i].envs) {
                        for (let w = 0, l2 = containerDrafts[i].envs.length; w < l2; w++) {
                            let isOldEnv = false;
                            for (let k = 0, l3 = oldEnv.length; k < l3; k++) {
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
                this.config.namespace = null;
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
                            tag: tags && tags[0] ? tags[0].tag : void 0,
                            tagList: tags || [],
                            oldEnv: image.envSettings || [],
                            newEnv: [],
                            healthChecker: {
                                type: 'NONE'
                            },
                            imagePullPolicy: 'Always',
                            autoDeploy: false,
                            logItemDrafts: [{
                               logPath: '',
                               autoCollect: false,
                               autoDelete: false
                            }]
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
            addLogDraft(image) {
                image.logItemDrafts = image.logItemDrafts || [];
                image.logItemDrafts.push({
                    logPath: '',
                    autoCollect: false,
                    autoDelete: false
                });
            }
            deleteLogDraft(image, logDraft) {
                image.logItemDrafts.splice(image.logItemDrafts.indexOf(logDraft), 1);
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
                    for (let loadBalanceDraft of this.config.loadBalanceDrafts) {
                        loadBalanceDraft.port = loadBalanceDraft.targetPort;
                    }
                }
            }
            changeTargetPort(index) {
                    this.config.loadBalanceDrafts[index].port = this.config.loadBalanceDrafts[index].targetPort;
                }
                // 将数据结构转换为与后台交互的数据格式
            _formartDeploy() {
                let deployConfig = angular.copy(this.config);

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

                deployConfig.collectionId = this.collectionId;

                /*
                if (this.creator.id) {
                    if (0) deployConfig.creator = {
                        creatorId: this.creator.id,
                        creatorName: this.creator.name,
                        creatorType: this.creator.type
                    };
                    deployConfig.creatorId = this.creator.id;
                }
                */

                if (deployConfig.versionType === 'CUSTOM') {
                    deployConfig.containerDrafts = (() => {
                        if (deployConfig.stateful) {
                            return deployConfig.containerDrafts;
                        }

                        if (!deployConfig.containerDrafts) {
                            return void 0;
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

                            let logItemDrafts = ((preFormattedlogDrafts) => {
                                let logItemDrafts = [];
                                for (let logItem of preFormattedlogDrafts) {
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
                                    return logItemDrafts;
                                }
                            })(containerDraft.logItemDrafts);

                            containerDrafts.push({
                                image: containerDraft.image,
                                registry: containerDraft.registry,
                                tag: containerDraft.tag,
                                cpu: containerDraft.cpu,
                                mem: containerDraft.mem,
                                logItemDrafts: logItemDrafts,
                                envs: envConf,
                                healthChecker: healthChecker,
                                imagePullPolicy: containerDraft.imagePullPolicy,
                                autoDeploy: containerDraft.autoDeploy
                            });
                        }
                        return containerDrafts;
                    })();
                } else if (deployConfig.versionType === 'JSON' || deployConfig.versionType === 'YAML') {
                    if (deployConfig.versionString) {
                        deployConfig.podSpecStr = deployConfig.versionString.podSpecStr;
                        delete deployConfig.versionString;
                    }
                }

                return deployConfig;
            }

            createVersion() { // 创建version
                    let deferred = $q.defer(),
                        newConfig = this._formartDeploy(),
                        versionObj = {
                            deployId: newConfig.deployId,
                            containerDrafts: newConfig.containerDrafts,
                            labelSelectors: newConfig.labelSelectors,
                            versionType: newConfig.versionType,
                            podSpecStr: newConfig.podSpecStr
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
                        if (replicas === this.config.currentReplicas) {
                            $domePublic.openWarning('实例个数无变化！');
                            deferred.reject();
                            return;
                        }
                        let url = replicas > this.config.currentReplicas ? 'api/deploy/action/scaleup' : 'api/deploy/action/scaledown';
                        $http.post(url + '?deployId=' + this.config.deployId + '&replicas=' + replicas + '&version=' + this.config.currentVersions[0].version).then((res) => {
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
            getDeployStr(callback) {
              let obj = this._formartDeploy();
              obj.podSpecStr = '';

              return $http.post(`api/deploy/deploymentstr`, angular.toJson(obj));
            }
        }
        class DeployInstanceList {
            constructor(instances) {
                this.isCheckAll = false;
                this.isCheckAllContainer = false;
                this.instanceList = [];
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
                    this.instanceList = (() => {
                        instances = instances || [];
                        for (let instance of instances) {
                            instance.isSelected = false;
                            instance.keyFilter = true;
                            if (instance.containers) {
                                for (let container of instance.containers) {
                                    container.shortContainerId = container.containerId.substring(0, 12);
                                }
                            }
                        }
                        return instances;
                    })();
                }
                // 选择实例-->切换containerList
            toggleContainerList(instance) {
                this.isCheckAllContainer = false;
                this.selectedContainerCount = 0;
                this.containerList = instance.containers || [];
                for (let container of this.containerList) {
                    container.isSelected = false;
                }
            }
            filterWithKey(keywords) {
                this.isCheckAll = false;
                this.selectedCount = 0;
                for (let instance of this.instanceList) {
                    instance.isSelected = false;
                    instance.keyFilter = instance.instanceName.indexOf(keywords) !== -1;
                }
            }
            toggleContainerCheck(container) {
                    let isAllHasChange = true;
                    if (container.isSelected) {
                        this.selectedContainerCount++;
                        // 是否为全选
                        for (let container of this.containerList) {
                            if (!container.isSelected) {
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
                    this.isCheckAllContainer = typeof isCheckAllContainer === 'undefined' ? !this.isCheckAllContainer : isCheckAllContainer;
                    this.selectedContainerCount = this.isCheckAllContainer ? this.containerList.length : 0;
                    for (let container of this.containerList) {
                        container.isSelected = this.isCheckAllContainer;
                    }
                }
                // 切换单个实例的选中状态
            toggleCheck(instance) {
                    let isAllHasChange = true;
                    if (instance.isSelected) {
                        this.selectedCount++;
                        // 是否为全选
                        for (let instance of this.instanceList) {
                            if (instance.keyFilter && !instance.isSelected) {
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
                this.isCheckAll = typeof isCheckAll === 'undefined' ? this.isCheckAll : isCheckAll;
                this.selectedCount = 0;
                for (let instance of this.instanceList) {
                    if (instance.keyFilter && this.isCheckAll) {
                        instance.isSelected = true;
                        this.selectedCount++;
                    } else {
                        instance.isSelected = false;
                    }
                }
            }
        }

        class DeployList {
            constructor(deployList) {
                this.deploy = {};
                this.isLoading = false;
                this.deployList = [];
                this.deployInstanceListIns = new DeployInstanceList();
                this.init(deployList);
            }
            init(deployList) {
                this.deployList = deployList || [];
            }
            toggleDeploy(deployId, deployName, namespace, notNeedInstances) {
                    let deferred = $q.defer();
                    if (!deployId) {
                        this.deploy.id = null;
                        this.deploy.name = null;
                        this.deploy.namespace = null;
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
                let deployId, deployName, namespace;
                for (let deploy of this.deployList) {
                    deploy.clusterFilter = clusterName ? deploy.clusterName === clusterName : true;
                    deploy.hostFilter = hostEnv ? deploy.hostEnv === hostEnv : true;
                    // 选中第一个符合条件的部署并切换到该部署
                    if (typeof deployId === 'undefined' && deploy.clusterFilter && deploy.hostFilter) {
                        deployId = deploy.deployId;
                        deployName = deploy.deployName;
                        namespace = deploy.namespace;
                    }

                }
                return typeof deployId === 'undefined' ? this.toggleDeploy() : this.toggleDeploy(deployId, deployName, namespace);
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
    DeployService.$inject = ['$http', '$domeCluster', '$domeImage', '$domePublic', '$domeModel', '$modal', '$q', '$util'];
    deployModule.factory('$domeDeploy', DeployService);
    window.deployModule = deployModule;
})(window);
