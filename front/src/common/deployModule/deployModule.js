/*
 * @author  ChandraLee
 * @description  部署模块
 */

((window, undefined) => {
    'use strict';
    let deployModule = angular.module('deployModule', []);

    function DeployService($http, $domeCluster, $domeImage, $domePublic, dialog, $domeModel, $modal, $q, $util, $sce, api) {
        const nodeService = $domeCluster.getInstance('NodeService');
        const DeployService = function () {
            const _url = '/api/deploy';
            const _versionUrl = '/api/version';
            this.getList = () => $http.get(`${_url}/list`);
            this.getListByCollectionId = (collectionId) => $http.get(`${_url}/list/${collectionId}`);
            this.getSingle = (deployId) => $http.get(`${_url}/id/${deployId}`);
            this.modifyDeploy = (deployId, deploymentDraft) => $http.put(`${_url}/id/${deployId}`, angular.toJson(deploymentDraft));
            this.getEvents = (deployId) => $http.get(`${_url}/event/list?deployId=${deployId}`);
            this.getInstances = (deployId) => $http.get(`${_url}/${deployId}/instance`);
            this.getVersions = (deployId) => $http.get(`${_versionUrl}/list?deployId=${deployId}`);
            this.getSingleVersion = (deployId, versionId) => $http.get(`${_versionUrl}/id/${deployId}/${versionId}`);
            this.createVersion = (version) => $http.post(`${_versionUrl}/create?deployId=${version.deployId}`, angular.toJson(version));
            this.createWatcherVersion = (version) => $http.post(`${_versionUrl}/create?deployId=${version.deployId}`, angular.toJson(version));
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
                this.mountVolumeType = {
                    'HOSTPATH': '主机目录',
                    'EMPTYDIR': '实例内目录',
                };
                this.storageVolumeConsole = [];
                this.init(deployConfig);
            }
            init(deployConfig) {
                    let currentVersions, id,
                        createTime = -1;

                    if (!$util.isObject(deployConfig)) {
                        deployConfig = {};
                    }

                    if (!deployConfig.deploymentType) {
                        deployConfig.deploymentType = 'DEPLOYMENT';
                    }

                    if (!deployConfig.volumeDrafts) {
                        deployConfig.volumeDrafts = [];
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
                        if (this.versionList === null) {
                            this.loadingIns.startLoading('versions');
                            deployService.getVersions(this.config.deployId).then((res) => {
                                this.versionList = res.data.result || [];
                                if (currentVersions.length === 0 && $util.isObject(this.versionList[0])) {
                                    this.toggleVersion(this.versionList[0].version);
                                }
                            }).finally(() => {
                                this.loadingIns.finishLoading('versions');
                            });
                        }
                        for (let i = 0, l = currentVersions.length; i < l; i++) {
                            if (currentVersions[i].createTime > createTime) {
                                createTime = currentVersions[i].createTime;
                                id = currentVersions[i].version;
                            }
                        }
                        if (typeof id !== 'undefined') {
                            this.toggleVersion(id);
                        }

                    } else {
                        this.initData();
                    }
                }
                // deployinfo和versioninfo重合的信息在这里处理，切换version之后重新调用进行初始化
            initData() {
                if (!$util.isArray(this.config.containerConsoles)) {
                    this.config.containerConsoles = [];
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
                    if (!$util.isArray(this.imageList) && this.config.versionType!=='WATCHER') {
                        this.loadingIns.startLoading('dockerImage');
                        $domeImage.imageService.getProjectImages().then((res) => {
                            let imageList = res.data.result || [];
                            // 格式化image的envSettings为containerConsoles格式
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
                            this.formartcontainerConsoles();
                        }).finally(() => {
                            this.loadingIns.finishLoading('dockerImage');
                        });
                    } else {
                        this.formartcontainerConsoles();
                    }
                }
                // console.log(this.config.containerConsoles);
                for (let image of this.config.containerConsoles) {
                    this.addLogDraft(image);
                    this.linkVolumeMountToVolume(image, this.config.volumeDrafts);
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
                    // 获取集群下的volume configMap
                    this.initStorageVolumeList(clusterId);
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
                    this.loadingIns.startLoading('toggleVersion');
                    deployService.getSingleVersion(this.config.deployId, versionId).then((res) => {
                        if ($util.isObject(res.data.result)) {
                            $.extend(this.config, res.data.result);
                            this.initData();
                        }
                    }).finally(() => {
                        this.loadingIns.finishLoading('toggleVersion');   
                    });
                }
                // containerConsoles：新增containerConsole的oldEnv，newEnv，tagList属性
            formartcontainerConsoles() {
                let containerConsoles = this.config.containerConsoles;

                const getTag = (containerConsole) => {
                    this.loadingIns.startLoading('tag');
                    $domeImage.imageService.getImageTags(containerConsole.image, containerConsole.registry).then((res) => {
                        containerConsole.tagList = res.data.result || [];
                    }).finally(() => {
                        this.loadingIns.finishLoading('tag');
                    });
                };
                for (let i = 0, l = containerConsoles.length; i < l; i++) {
                    containerConsoles[i].oldEnv = [];
                    containerConsoles[i].newEnv = [];
                    // 获得该镜像版本
                    getTag(containerConsoles[i]);
                    let oldEnv = [];
                    // 获得镜像原本的envSettings
                    for (let j = 0, l1 = this.imageList.length; j < l1; j++) {
                        if (this.imageList[j].imageName === containerConsoles[i].image) {
                            oldEnv = this.imageList[j].envSettings;
                            break;
                        }
                    }
                    // 分离镜像本身的image和新添加的image的env
                    if (containerConsoles[i].envs) {
                        for (let w = 0, l2 = containerConsoles[i].envs.length; w < l2; w++) {
                            let isOldEnv = false;
                            for (let k = 0, l3 = oldEnv.length; k < l3; k++) {
                                if (oldEnv[k].key === containerConsoles[i].envs[w].key) {
                                    isOldEnv = true;
                                    break;
                                }
                            }
                            if (isOldEnv) {
                                containerConsoles[i].oldEnv.push(containerConsoles[i].envs[w]);
                            } else {
                                containerConsoles[i].newEnv.push(containerConsoles[i].envs[w]);
                            }
                        }
                    } else {
                        containerConsoles[i].oldEnv = angular.copy(oldEnv);
                    }
                }
            }
            changeVisitModeToValid() {
                let validModes = [];
                validModes.push('noAccess');
                if (this.config.networkMode === 'HOST') validModes.push('access');
                if (this.config.networkMode === 'DEFAULT') validModes.push('internal', 'foreign');
                if (validModes.indexOf(this.visitMode) === -1) this.visitMode = validModes[0];
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
            toggleVolumeType(volume, type) {
                volume.volumeType = type;
            }
            toggleStorageVolumeReadonly(volume,accessControl) {
                volume.volumePVC.readOnly = accessControl;
            }
            toggleStorageVolumeName(volume,storageVolume) {
                volume.volumePVC.volumeId = storageVolume.storageVolumeDraft.id;
                volume.volumePVC.volumeName = storageVolume.storageVolumeDraft.name;
                volume.volumePVC.claimName = storageVolume.storageVolumeDraft.name;
            }
            deleteVolumeDraft(volume, images) {
                let volumeDrafts = this.config.volumeDrafts;
                let index = volumeDrafts.indexOf(volume);
                volumeDrafts.splice(index, 1);
                this.deleteVolumeMountDraftByVolume(volume, images);
            }
            addVolumeDraft() {
                this.config.volumeDrafts = this.config.volumeDrafts || [];
                this.config.volumeDrafts.push({
                    name: '',
                    volumeType: 'HOSTPATH',
                    hostPath: '',
                    emptyDir: '',
                    volumePVC: {
                        claimName: '',
                        readOnly: false,
                        volumeId: null,
                        volumeName: null
                    },
                });
            }
            toggleImageTag(index, tag) {
                    this.config.containerConsoles[index].tag = tag;
                }
                // 添加containerConsole
            addImage(image) {
                    this.loadingIns.startLoading('addImage');
                    $domeImage.imageService.getImageTags(image.imageName, image.registry).then((res) => {
                        let tags = res.data.result;
                        this.config.containerConsoles.push({
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
                            }],
                            volumeMountDrafts: [],
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
                    this.config.containerConsoles.push({
                        image: imageInfo.name,
                        registry: imageInfo.registry,
                        cpu: 0.5,
                        mem: 1024,
                        tag: imageInfo.tag,
                        tagList: [{
                            tag: imageInfo.tag
                        }],
                        oldEnv: [],
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
                });
            }
            deleteImage(index) {
                this.config.containerConsoles.splice(index, 1);
            }
            addImageEnv(index) {
                this.config.containerConsoles[index].newEnv.push({
                    key: '',
                    value: '',
                    description: ''
                });
            }
            deleteImageEnv(containerConsoleIndex, index) {
                this.config.containerConsoles[containerConsoleIndex].newEnv.splice(index, 1);
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
            linkVolumeMountToVolume(image, volumeDrafts) {
                image.volumeMountDrafts = image.volumeMountDrafts || [];
                image.volumeMountDrafts = image.volumeMountDrafts.filter((volumeMount) => {
                    let volume = volumeDrafts.filter(volume => volume.name === volumeMount.name)[0];
                    if (!volume) return;
                    volumeMount._volume = volume;
                    return true;
                });
            }
            addVolumeMountDraft(image) {
                image.volumeMountDrafts = image.volumeMountDrafts || [];
                image.volumeMountDrafts.push({
                    name: '',
                    readOnly: false,
                    mountPath: '',
                    subPath: '',
                    _volume: null
                });
            }
            deleteVolumeMountDraft(image, volumeMount) {
                image.volumeMountDrafts = image.volumeMountDrafts || [];
                image.volumeMountDrafts = image.volumeMountDrafts.filter(function (me) {
                  return me !== volumeMount;
                });
            }
            deleteVolumeMountDraftByVolume(volume, images) {
                images.forEach(image => {
                    image.volumeMountDrafts = image.volumeMountDrafts || [];
                    image.volumeMountDrafts = image.volumeMountDrafts.filter(function (me) {
                      return me._volume !== volume;
                    });
                });
            }
            updateVolumeMountName(volume, images) {
                images.forEach(image => {
                    image.volumeMountDrafts = image.volumeMountDrafts || [];
                    image.volumeMountDrafts.forEach(function (me) {
                      if (me._volume === volume) me.name = volume.name;
                    });
                });
            }
            toggleVolumeMountReadonly(volumeMount, isReadonly) {
                volumeMount.readOnly = isReadonly;
            }
            toggleVolumeMountName(volumeMounts, volume) {
                volumeMounts.name = volume.name;
                volumeMounts._volume = volume;
            }
            deleteLogDraft(image, logDraft) {
                image.logItemDrafts.splice(image.logItemDrafts.indexOf(logDraft), 1);
            }
            deleteArrItem(item, index) {
                this.config[item].splice(index, 1);
            }
            formartHealthChecker() {
                if (this.config.networkMode == 'HOST') {
                    for (let containerConsole of this.config.containerConsoles) {
                        containerConsole.healthChecker = {
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
                    deployConfig.containerConsoles = (() => {
                        if (deployConfig.stateful) {
                            return deployConfig.containerConsoles;
                        }

                        if (!deployConfig.containerConsoles) {
                            return void 0;
                        }

                        let envConf, containerConsoles = [],
                            healthChecker;

                        for (let containerConsole of deployConfig.containerConsoles) {
                            envConf = containerConsole.oldEnv;
                            if (!containerConsole.healthChecker) {
                                containerConsole.healthChecker = {
                                    type: 'NONE'
                                };
                            }
                            healthChecker = {
                                type: containerConsole.healthChecker.type
                            };

                            if (deployConfig.networkMode != 'HOST') {
                                if (healthChecker.type == 'TCP' || healthChecker.type == 'HTTP') {
                                    healthChecker.port = containerConsole.healthChecker.port;
                                    healthChecker.timeout = containerConsole.healthChecker.timeout;
                                    healthChecker.delay = containerConsole.healthChecker.delay;
                                }
                                if (healthChecker.type == 'HTTP') {
                                    healthChecker.url = containerConsole.healthChecker.url;
                                }
                            } else {
                                healthChecker.type = 'NONE';
                            }

                            for (let env of containerConsole.newEnv) {
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
                            })(containerConsole.logItemDrafts);

                            let volumeMountDrafts = (((volumeMountDrafts) => {
                                return volumeMountDrafts.map(volumeMount => {
                                    return {
                                        name: volumeMount.name,
                                        readOnly: volumeMount.readOnly,
                                        mountPath: volumeMount.mountPath,
                                        subPath: volumeMount.subPath,
                                    };
                                }).filter(volumeMount => volumeMount.name);
                            })(containerConsole.volumeMountDrafts || []));

                            containerConsoles.push({
                                image: containerConsole.image,
                                registry: containerConsole.registry,
                                tag: containerConsole.tag,
                                cpu: containerConsole.cpu,
                                mem: containerConsole.mem,
                                logItemDrafts: logItemDrafts,
                                envs: envConf,
                                healthChecker: healthChecker,
                                imagePullPolicy: containerConsole.imagePullPolicy,
                                autoDeploy: containerConsole.autoDeploy,
                                volumeMountDrafts: volumeMountDrafts,
                            });
                        }
                        return containerConsoles;
                    })();
                } else if (deployConfig.versionType === 'JSON' || deployConfig.versionType === 'YAML') {
                    if (deployConfig.versionString) {
                        deployConfig.podSpecStr = deployConfig.versionString.podSpecStr;
                        delete deployConfig.versionString;
                    }
                }

                return deployConfig;
            }

            createVersion(watcherInfo) { // 创建version
                    let deferred = $q.defer(),
                        newConfig = this._formartDeploy(),
                        versionObj = {
                            deployId: newConfig.deployId,
                            containerConsoles: newConfig.containerConsoles,
                            labelSelectors: newConfig.labelSelectors,
                            versionType: newConfig.versionType,
                            podSpecStr: newConfig.podSpecStr,
                            volumeDrafts: newConfig.volumeDrafts,
                        };
                    deployService.createVersion(versionObj).then((res) => {
                        if (this.config.deploymentStatus != 'RUNNING') {
                            dialog.alert('新建成功', '新建部署版本成功,当前状态不能升级。');
                            deferred.resolve('create');
                        } else {
                            // this template is in deployDetail.html
                            let createVersionModal = $modal.open({
                                animation: true,
                                templateUrl: 'createVersionModal.html',
                                controller: 'createVersionModalCtr',
                                size: 'sm',
                                resolve: {
                                    replicas: () => this.config.currentReplicas
                                }
                            });
                            createVersionModal.result.then((replicas) => {
                                deployService.updateDeploy(this.config.deployId, res.data.result, replicas).then(() => {
                                    dialog.alert('正在升级', '已提交，正在升级！');
                                    deferred.resolve('update');
                                }, (res) => {
                                if (res.data.resultCode === 1007) {
                                    dialog.continue('警告！','监听器状态异常，请点击确定进入详情页进行配置').then(function(res){
                                    if(res === dialog.buttons.BUTTON_OK_ONLY){
                                        $state.go('clusterDetail.watcher', {id: $scope.watcherInfo.clusterId});
                                        hide();
                                        }
                                    });
                                } else {
                                    dialog.error('升级失败！', res.data.resultMsg);
                                }
                                deferred.resolve('updateFailed');
                            });
                        }, () => {
                            deferred.resolve('dismiss');
                            });
                        }
                    }, (res) => {
                        dialog.error('创建版本失败！', res.data.resultMsg);
                        deferred.reject('create');
                    });
                    return deferred.promise;
                }
            createWatcherVersion(versionObj) { // 创建监听器version
                    let deferred = $q.defer()
                    deployService.createVersion(versionObj).then((res) => {
                        if (this.config.deploymentStatus != 'RUNNING') {
                            dialog.alert('新建部署版本成功,当前状态不能升级。');
                            deferred.resolve('create');
                        } else {
                            // this template is in deployDetail.html
                            let createVersionModal = $modal.open({
                                animation: true,
                                templateUrl: 'createVersionModal.html',
                                controller: 'createWatcherVersionModalCtr',
                                size: 'sm',
                                resolve: {
                                    replicas: () => this.config.currentReplicas
                                }
                            });
                            createVersionModal.result.then((replicas) => {
                                deployService.updateDeploy(this.config.deployId, res.data.result, replicas).then(() => {
                                    dialog.alert('已提交，正在升级！');
                                    deferred.resolve('update');
                                }, (res) => {
                                    dialog.error('升级失败',res.data.resultMsg);
                                    deferred.resolve('updateFailed');
                                });
                            }, () => {
                                deferred.resolve('dismiss');
                            });
                        }
                    }, (res) => {
                        dialog.error('创建版本失败',res.data.resultMsg);
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
            // DaemonSet 的扩容缩容
            scaleForDaemonSet(watcherInfo) {
                    let deferred = $q.defer();
                    let modalInstance = $modal.open({
                        animation: true,
                        templateUrl: 'scaleModalForDaemonSet.html',
                        controller: 'scaleModalForDaemonSetCtr',
                        size: 'md',
                        resolve: {
                            deployIns: () => this,
                        }
                    });
                    modalInstance.result.then((nodeList) => {
                        let url = `api/deploy/action/daemonset/scales?deployId=${this.config.deployId}&version=${this.config.currentVersions[0].version}`;
                        $http.post(url, nodeList).then((res) => {
                            dialog.alert('提示', '操作成功！');
                            deferred.resolve(res.data.result);
                    }, function(res) {
                        if (res.data.resultCode === 1007) {
                         dialog.continue('警告！','监听器状态异常，请点击确定进入详情页进行配置').then(function(res){
                            if(res === dialog.buttons.BUTTON_OK_ONLY){
                                $state.go('clusterDetail.watcher', {id: $scope.watcherInfo.clusterId});
                                hide();
                                }
                            });
                        } else {
                            dialog.error('警告', '请求失败！');
                        }
                        deferred.reject('requestError');
                        });
                    }, function () {
                        deferred.reject('dismiss');
                    });
                    return deferred.promise;
                }

                // 扩容/缩容
            scale(watcherInfo) {
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
                            dialog.error('警告', '实例个数无变化！');
                            deferred.reject();
                            return;
                        }
                        let url = replicas > this.config.currentReplicas ? 'api/deploy/action/scaleup' : 'api/deploy/action/scaledown';
                        $http.post(url + '?deployId=' + this.config.deployId + '&replicas=' + replicas + '&version=' + this.config.currentVersions[0].version).then((res) => {
                            dialog.alert('提示', '操作成功！');
                            deferred.resolve(res.data.result);
                        }, function(res) {
                            if (res.data.resultCode === 1007) {
                               dialog.continue('警告！','监听器状态异常，请点击确定进入详情页进行配置').then(function(res){
                                    if(res === dialog.buttons.BUTTON_OK_ONLY){
                                        $state.go('clusterDetail.watcher', {id: $scope.watcherInfo.clusterId});
                                        hide();
                                        }
                                    });
                            } else {
                            dialog.error('警告', '请求失败！');
                            }
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
            updateVersion(watcherInfo) {
                    // console.log(watcherInfo);
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
                            dialog.error('警告', '您不能选择当前版本！');
                            deferred.reject('dismiss');
                        } else if (currentVersionId > startInfo.versionId) {
                            deployService.rollbackDeploy(this.config.deployId, startInfo.versionId, startInfo.replicas).then((res) => {
                                dialog.alert('提示', '已提交，正在回滚！');
                                deferred.resolve(res.data.result);
                            }, (res) => {
                                if (res.data.resultCode === 1007) {
                                   dialog.continue('警告！','监听器状态异常，请点击确定进入详情页进行配置').then(function(res){
                                    if(res === dialog.buttons.BUTTON_OK_ONLY){
                                        $state.go('clusterDetail.watcher', {id: $scope.watcherInfo.clusterId});
                                        hide();
                                        }
                                    });
                                } else {
                                dialog.error('警告', '回滚失败，请重试！');
                                }
                                deferred.reject();
                            });
                        } else {
                            deployService.updateDeploy(this.config.deployId, startInfo.versionId, startInfo.replicas).then((res) => {
                                dialog.alert('提示', '已提交，正在升级！');
                                deferred.resolve(res.data.result);
                            }, (res) => {
                                if (res.data.resultCode === 1007) {
                                  dialog.continue('警告！','监听器状态异常，请点击确定进入详情页进行配置').then(function(res){
                                    if(res === dialog.buttons.BUTTON_OK_ONLY){
                                        $state.go('clusterDetail.watcher', {id: $scope.watcherInfo.clusterId});
                                        hide();
                                        }
                                    });
                                } else {
                                    dialog.alert('提示', '升级失败，请重试！');
                                }

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
            modifyDeploy() {
                let obj = this._formartDeploy();
                return deployService.modifyDeploy(this.config.deployId, obj);
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
            toggleDeploy(deployId, deployName, namespace, notNeedInstances, type) {
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
                            if (!type || type === 'deploy') {
                              deployService.getInstances(deployId).then((res) => {
                                this.deployInstanceListIns.init(res.data.result);
                                deferred.resolve();
                              }).finally(function () {
                                deferred.reject();
                                this.isLoading = false;
                              });
                            } else if(type === 'loadBalance') {
                                api.loadBalance.loadBalance.listInstance(deployId).then(response => {
                                  this.deployInstanceListIns.init(response);
                                  deferred.resolve();
                                }).catch(error => {}).then(() => {
                                  deferred.reject();
                                  this.isLoading = false;
                                });
                            }
                        }
                    }
                    return deferred.promise;
                }
                // @param hostEnv: 'TEST' or 'PROD'
            filterDeploy(clusterName, hostEnv, type) {
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
                return typeof deployId === 'undefined' ? this.toggleDeploy() : this.toggleDeploy(deployId, deployName, namespace, '', type);
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
    DeployService.$inject = ['$http', '$domeCluster', '$domeImage', '$domePublic', 'dialog', '$domeModel', '$modal', '$q', '$util', '$sce', 'api'];
    deployModule.factory('$domeDeploy', DeployService);
    window.deployModule = deployModule;
})(window);
