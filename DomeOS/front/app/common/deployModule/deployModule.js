var deployModule = angular.module('deployModule', []);
deployModule.factory('$domeDeploy', ['$http', '$domeCluster', '$domeUser', '$domeProject', '$domeImage', '$domePublic', '$modal', '$q', function($http, $domeCluster, $domeUser, $domeProject, $domeImage, $domePublic, $modal, $q) {
	'use strict';
	var getDeloyNamespace = function() {
		return $http.get('/api/deploy/namespacelist');
	};
	var getDeployList = function() {
		return $http.get('/api/deploy/list');
	};
	// 获得部署信息
	var getDeployInfo = function(deployId) {
		return $http.get('/api/deploy/id/' + deployId);
	};
	var getDeployEvents = function(deployId) {
		return $http.get('/api/deploy/event/list?deployId=' + deployId);
	};
	var getDeployInsList = function(deployId) {
		return $http.get('/api/deploy/' + deployId + '/instance');
	};
	var getVersionList = function(deployId) {
		return $http.get('/api/version/list?deployId=' + deployId);
	};
	var getVersionDetail = function(deployId, versionId) {
		return $http.get('/api/version/id/' + deployId + '/' + versionId);
	};
	var createVersion = function(version) {
		return $http.post('/api/version/create?deployId=' + version.deployId, angular.toJson(version));
	};
	var rollback = function(deployId, versionId, replicas) {
		if (replicas) {
			return $http.post('/api/deploy/action/rollback?deployId=' + deployId + '&version=' + versionId + '&replicas=' + replicas);
		} else {
			return $http.post('/api/deploy/action/rollback?deployId=' + deployId + '&version=' + versionId);
		}
	};
	var updateVersion = function(deployId, versionId, replicas) {
		if (replicas) {
			return $http.post('/api/deploy/action/update?deployId=' + deployId + '&version=' + versionId + '&replicas=' + replicas);
		} else {
			return $http.post('/api/deploy/action/update?deployId=' + deployId + '&version=' + versionId);
		}
	};
	var startVersion = function(deployId, versionId, replicas) {
		if (replicas) {
			return $http.post('/api/deploy/action/start?deployId=' + deployId + '&version=' + versionId + '&replicas=' + replicas);
		} else {
			return $http.post('/api/deploy/action/start?deployId=' + deployId + '&version=' + versionId);
		}
	};
	var EditDeploy = function() {
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
		this.envText = '请选择部署环境';
		this.versionList = undefined;
		this.nodeListIns = $domeCluster.getInstance('NodeList');
		this.clusterListIns = $domeCluster.getInstance('ClusterList');
		this.userGroupListIns = $domeUser.getInstance('UserGroupList');
		this.loadingIns = $domePublic.getLoadingInstance();
		this.visitMode = {
			currentData: 'noAccess'
		};
	};
	EditDeploy.prototype = {
		constructor: EditDeploy,
		// 初始化
		init: function(deployConfig) {

			var that = this;
			var containerDrafts = [],
				currentVersions, i, j, id,
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
				var ipsArr = deployConfig.loadBalanceDrafts[i].externalIPs;
				var externalIPs = [];
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
			if (this.config.healthChecker) {
				this.config.healthCheckerDraft = this.config.healthChecker;
			}
			if (!that.config.healthCheckerDraft) {
				that.config.healthCheckerDraft = {
					type: 'NONE'
				};
			}

			//网络模式
			if (!that.config.networkMode) {
				that.config.networkMode = 'DEFAULT';
			}
			if (!that.config.accessType) {
				that.config.accessType = 'K8S_SERVICE';
			}
			currentVersions = this.config.currentVersions;
			// 是否是新建deploy
			if (that.config.deployId) {
				if (!that.versionList) {
					getVersionList(that.config.deployId).then(function(res) {
						that.versionList = res.data.result || [];
						if (!currentVersions || currentVersions.length === 0) {
							that.toggleVersion(that.versionList[0].version);
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
					that.toggleVersion(id);
				}
			} else {
				that.initData();
			}
		},
		// deployinfo和versioninfo重合的信息在这里处理，切换version之后重新调用进行初始化
		initData: function() {
			var that = this,
				i;
			if (!that.config.logDraft) {
				that.config.logDraft = {};
			}
			if (!that.config.logDraft.logItemDrafts) {
				that.config.logDraft.logItemDrafts = [];
			}
			that.config.logDraft.logItemDrafts.push({
				logPath: '',
				autoCollect: false,
				autoDelete: false
			});
			if (!that.config.containerDrafts) {
				that.config.containerDrafts = [];
			}
			if (!that.config.labelSelectors) {
				that.config.labelSelectors = [];
			}
			that.initSelectedLabels();

			if (!that.config.hostEnv) {
				that.toggleEnv(that.envList[0]);
			} else {
				for (i = 0; i < that.envList.length; i++) {
					if (that.config.hostEnv === that.envList[i].value) {
						that.toggleEnv(that.envList[i]);
						break;
					}
				}
			}

			if (!this.config.stateful) {
				if (!this.imageList) {
					this.loadingIns.startLoading('dockerImage');
					$domeImage.getBaseProjectImgList().then(function(res) {
						var i, j;
						var imageList = res.data.result || [];
						// 格式化image的envSettings为containerDrafts格式
						for (i = 0; i < imageList.length; i++) {
							var envs = [];
							if (imageList[i].envSettings) {
								for (j = 0; j < imageList[i].envSettings.length; j++) {
									envs.push({
										key: imageList[i].envSettings[j].key,
										value: imageList[i].envSettings[j].value,
										description: imageList[i].envSettings[j].description
									});
								}
							}
							imageList[i].envSettings = envs;
						}
						that.imageList = imageList;
						// 处理部署已有的镜像
						that.formartContainerDrafts();
					}).finally(function() {
						that.loadingIns.finishLoading('dockerImage');
					});
				} else {
					this.formartContainerDrafts();
				}
			}
		},
		// 刷新当前Deploy状态
		freshDeploy: function() {
			var that = this;
			getDeployInfo(this.config.deployId).then(function(res) {
				var newConfig = res.data.result;
				if (newConfig) {
					that.config.lastUpdateTime = newConfig.lastUpdateTime;
					that.config.deploymentStatus = newConfig.deploymentStatus;
					that.config.currentVersions = newConfig.currentVersions;
					that.config.currentReplicas = newConfig.currentReplicas;
				}
			});
		},
		freshVersionList: function() {
			var that = this;
			that.loadingIns.startLoading('versionList');
			getVersionList(that.config.deployId).then(function(res) {
				that.versionList = res.data.result || [];
			}).finally(function() {
				that.loadingIns.finishLoading('versionList');
			});
		},
		toggleCluster: function(index) {
			var that = this;
			var i = 0;
			var clusterList;
			var isHasCluster = false;
			// 选择当前deploy/version的cluster
			if (index === undefined) {
				clusterList = that.clusterListIns.clusterList;
				for (i = 0; i < clusterList.length; i++) {
					if (clusterList[i].id === that.config.clusterId) {
						isHasCluster = true;
						index = i;
						break;
					}
				}
				// 如果当前deploy/version没有cluster，则选择第一个
				if (!isHasCluster) {
					if (that.clusterListIns.clusterList.length === 0) {
						return;
					}
					index = 0;
				}
			}
			that.clusterListIns.toggleCluster(index);
			var clusterId = that.clusterListIns.cluster.id;
			that.loadingIns.startLoading('nodelist');
			
			$domeCluster.getNodeList(clusterId).then(function(res) {
				// 如果是app store的主机列表，则过滤掉没有diskPath的主机
				that.nodeListIns.init(res.data.result, that.config.stateful);
				that.initSelectedLabels();
				that.nodeListIns.toggleEnv(that.config.hostEnv);
				// 如果是有状态服务，默认选择和replics相等的主机个数
				if (that.config.stateful && that.config.replicas && that.nodeListIns.nodeList) {
					for (i = 0; i < that.nodeListIns.nodeList.length && i < that.config.replicas; i++) {
						that.nodeListIns.nodeList[i].isSelected = true;
						that.nodeListIns.toggleNodeCheck(that.nodeListIns.nodeList[i]);
					}
				}
			}, function() {
				that.nodeListIns.init();
			}).finally(function() {
				that.loadingIns.finishLoading('nodelist');
			});

			if (that.config.deployId === undefined) {
				that.loadingIns.startLoading('namespace');
				$domeCluster.getNamespace(clusterId).then(function(res) {
					that.namespaceList = res.data.result || [];
					that.isNewNamespace = false;
					that.config.namespace = that.namespaceList[0].name || undefined;
					for (i = 0; i < that.namespaceList.length; i++) {
						if (that.namespaceList[i].name == 'default') {
							that.config.namespace = that.namespaceList[i].name;
							break;
						}
					}
				}, function() {
					that.isNewNamespace = false;
					that.namespaceList = [];
					that.config.namespace = undefined;
				}).finally(function() {
					that.loadingIns.finishLoading('namespace');
				});
			}
		},
		// 初始化选中的label
		initSelectedLabels: function() {
			var that = this;
			that.nodeListIns.initLabelsInfo();
			if (!that.config.labelSelectors) {
				return;
			}
			for (var i = 0; i < that.config.labelSelectors.length; i++) {
				var labelName = that.config.labelSelectors[i].name;
				if (labelName != 'kubernetes.io/hostname' && labelName != 'TESTENV' && labelName != 'PRODENV') {
					that.nodeListIns.toggleLabel(labelName, true);
				}
			}
		},
		// 切换当前展示的version
		toggleVersion: function(versionId) {
			var that = this;
			getVersionDetail(this.config.deployId, versionId).then(function(res) {
				if (res.data.result) {
					$.extend(that.config, res.data.result);
					that.initData();
				}
			});
		},
		// containerDrafts：新增containerDraft的oldEnv，newEnv，tagList属性
		formartContainerDrafts: function() {
			var that = this;
			var containerDrafts = that.config.containerDrafts;
			var i, j, w, k;

			function getTag(containerDraft) {
				that.loadingIns.startLoading('tag');
				$domeImage.getDockerImageTags(containerDraft.image, containerDraft.registry).then(function(res) {
					containerDraft.tagList = res.data.result || [];
				}).finally(function() {
					that.loadingIns.finishLoading('tag');
				});
			}
			for (i = 0; i < containerDrafts.length; i++) {
				containerDrafts[i].oldEnv = [];
				containerDrafts[i].newEnv = [];
				// 获得该镜像版本
				getTag(containerDrafts[i]);
				var oldEnv = [];
				// 获得镜像原本的envSettings
				for (j = 0; j < that.imageList.length; j++) {
					if (that.imageList[j].imageName === containerDrafts[i].image) {
						oldEnv = that.imageList[j].envSettings;
						break;
					}
				}
				// 分离镜像本身的image和新添加的image的env
				if (containerDrafts[i].envs) {
					for (w = 0; w < containerDrafts[i].envs.length; w++) {
						var isOldEnv = false;
						for (k = 0; k < oldEnv.length; k++) {
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
		},
		toggleNamespace: function(namespace) {
			this.config.namespace = namespace;
		},
		toggleIsNewNamespace: function() {
			this.isNewNamespace = !this.isNewNamespace;
			this.config.namespace = undefined;
		},
		toggleEnv: function(env) {
			this.config.hostEnv = env.value;
			this.envText = env.text;
			this.nodeListIns.toggleEnv(env.value);
		},
		toggleImageTag: function(index, tag) {
			this.config.containerDrafts[index].tag = tag;
		},
		// 添加containerDraft
		addImage: function(image) {
			var that = this;
			that.loadingIns.startLoading('addImage');
			$domeImage.getDockerImageTags(image.imageName, image.registry).then(function(res) {
				var tags = res.data.result;
				that.config.containerDrafts.push({
					image: image.imageName,
					registry: image.registry,
					cpu: 0.5,
					mem: 1024,
					tag: tags && tags[0] ? tags[0].tag : undefined,
					tagList: tags ? tags : [],
					oldEnv: image.envSettings ? image.envSettings : [],
					newEnv: []
				});
			}).finally(function() {
				that.loadingIns.finishLoading('addImage');
			});
		},
		// 添加其他镜像
		addOtherImage: function() {
			var that = this;
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: '/index/tpl/modal/otherImageModal/otherImageModal.html',
				controller: 'otherImageModalCtr',
				size: 'md'
			});
			modalInstance.result.then(function(imageInfo) {
				that.config.containerDrafts.push({
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
		},
		deleteImage: function(index) {
			this.config.containerDrafts.splice(index, 1);
		},
		addImageEnv: function(index) {
			this.config.containerDrafts[index].newEnv.push({
				key: '',
				value: '',
				description: ''
			});
		},
		deleteImageEnv: function(containerDraftIndex, index) {
			this.config.containerDrafts[containerDraftIndex].newEnv.splice(index, 1);
		},
		addLoadBalance: function() {
			this.config.loadBalanceDrafts.push({
				port: '',
				targetPort: '',
				externalIPs: [{
					ip: ''
				}]
			});
		},
		addInnerService: function() {
			this.config.innerServiceDrafts.push({
				port: '',
				targetPort: ''
			});
		},
		addExternalIPs: function(index) {
			this.config.loadBalanceDrafts[index].externalIPs.push({
				ip: ''
			});
		},
		deleteExternalIPs: function(loadBalanceDraftIndex, index) {
			this.config.loadBalanceDrafts[loadBalanceDraftIndex].externalIPs.splice(index, 1);
		},
		addLogDraft: function() {
			this.config.logDraft.logItemDrafts.push({
				logPath: '',
				autoCollect: false,
				autoDelete: false
			});
		},
		deleteLogDraft: function(index) {
			this.config.logDraft.logItemDrafts.splice(index, 1);
		},
		deleteArrItem: function(item, index) {
			this.config[item].splice(index, 1);
		},
		changeNetworkmode: function() {
			if (this.config.networkMode == 'HOST') {
				for (var i = 0; i < this.config.loadBalanceDrafts.length; i++) {
					this.config.loadBalanceDrafts[i].port = this.config.loadBalanceDrafts[i].targetPort;
				}
			}
		},
		changeTargetPort: function(index) {
			this.config.loadBalanceDrafts[index].port = this.config.loadBalanceDrafts[index].targetPort;
		},
		// 将数据结构转换为与后台交互的数据格式
		_formartDeploy: function() {
			var deployConfig = angular.copy(this.config);
			// console.log(deployConfig);
			var i = 0,
				j = 0,
				logItemDrafts = [],
				containerDrafts = [],
				loadBalanceDrafts = [];
			var that = this;
			var healthCheckerDraft = {
				type: deployConfig.healthCheckerDraft.type
			};

			if (healthCheckerDraft.type == 'TCP' || healthCheckerDraft.type == 'HTTP') {
				healthCheckerDraft.port = deployConfig.healthCheckerDraft.port;
				healthCheckerDraft.timeout = deployConfig.healthCheckerDraft.timeout;
			}
			if (healthCheckerDraft.type == 'HTTP') {
				healthCheckerDraft.url = deployConfig.healthCheckerDraft.url;
			}
			deployConfig.healthCheckerDraft = healthCheckerDraft;

			if (deployConfig.networkMode == 'HOST') {
				deployConfig.loadBalanceDrafts = [];
				deployConfig.accessType = 'DIY';
				deployConfig.innerServiceDrafts = [];
				if (this.visitMode.currentData == 'noAccess') {
					deployConfig.exposePortNum = 0;
				}
			} else {
				deployConfig.exposePortNum = 0;
				if (this.visitMode.currentData == 'noAccess') {
					deployConfig.accessType = 'DIY';
					deployConfig.loadBalanceDrafts = [];
					deployConfig.innerServiceDrafts = [];
				} else if (this.visitMode.currentData == 'internal') {
					deployConfig.accessType = 'K8S_SERVICE';
					deployConfig.innerServiceDrafts[0].targetPort = deployConfig.innerServiceDrafts[0].port;
					deployConfig.loadBalanceDrafts = [];
				} else {
					deployConfig.accessType = 'K8S_SERVICE';
					deployConfig.innerServiceDrafts = [];
				}
			}

			for (i = 0; i < deployConfig.loadBalanceDrafts.length; i++) {
				if (deployConfig.loadBalanceDrafts[i].port && deployConfig.loadBalanceDrafts[i].port !== '') {
					var externalIPs = deployConfig.loadBalanceDrafts[i].externalIPs;
					var externalIPsArr = [];
					for (j = 0; j < externalIPs.length; j++) {
						if (externalIPs[j].ip !== '') {
							externalIPsArr.push(externalIPs[j].ip);
						}
					}
					deployConfig.loadBalanceDrafts[i].externalIPs = externalIPsArr;
					loadBalanceDrafts.push(deployConfig.loadBalanceDrafts[i]);
				}
			}
			deployConfig.loadBalanceDrafts = loadBalanceDrafts;

			if (!deployConfig.stateful) {
				deployConfig.labelSelectors = that.nodeListIns.getFormartSelectedLabels();
			} else {
				deployConfig.hostList = that.nodeListIns.getSelectedNodes();
			}

			deployConfig.clusterId = that.clusterListIns.cluster.id;

			if (that.userGroupListIns.userGroup.id) {
				deployConfig.creator = {
					creatorId: that.userGroupListIns.userGroup.id,
					creatorName: that.userGroupListIns.userGroup.name,
					creatorType: that.userGroupListIns.userGroup.type
				};
			}

			for (i = 0; i < deployConfig.logDraft.logItemDrafts.length; i++) {
				var thisLogItem = deployConfig.logDraft.logItemDrafts[i];
				if (thisLogItem.logPath !== '') {
					var formartLogItem = {
						logPath: thisLogItem.logPath,
						autoCollect: thisLogItem.autoCollect,
						autoDelete: thisLogItem.autoDelete
					};
					if (thisLogItem.autoCollect) {
						formartLogItem.logTopic = thisLogItem.logTopic;
						formartLogItem.processCmd = thisLogItem.processCmd;
					}
					if (thisLogItem.autoDelete) {
						formartLogItem.logExpired = thisLogItem.logExpired;
					}
					logItemDrafts.push(formartLogItem);
				}
			}
			deployConfig.logDraft.logItemDrafts = logItemDrafts;

			if (!deployConfig.stateful) {
				if (deployConfig.containerDrafts) {
					for (i = 0; i < deployConfig.containerDrafts.length; i++) {
						var sigContainerDraft = deployConfig.containerDrafts[i];
						var envConf = sigContainerDraft.oldEnv;
						for (j = 0; j < sigContainerDraft.newEnv.length; j++) {
							if (sigContainerDraft.newEnv[j].key !== '') {
								envConf.push(sigContainerDraft.newEnv[j]);
							}
						}
						containerDrafts.push({
							image: sigContainerDraft.image,
							registry: sigContainerDraft.registry,
							tag: sigContainerDraft.tag,
							cpu: sigContainerDraft.cpu,
							mem: sigContainerDraft.mem,
							envs: envConf
						});
					}
					deployConfig.containerDrafts = containerDrafts;
				}
			}
			return deployConfig;
			// console.log(deployConfig);
		},
		// 创建version
		createVersion: function() {
			var deferred = $q.defer();
			var that = this;
			var newConfig = this._formartDeploy();
			var versionObj = {
				deployId: newConfig.deployId,
				containerDrafts: newConfig.containerDrafts,
				logDraft: newConfig.logDraft,
				labelSelectors: newConfig.labelSelectors
			};
			createVersion(versionObj).then(function(res) {
				if (that.config.deploymentStatus != 'RUNNING' && that.config.deploymentStatus != 'STOP') {
					$domePublic.openPrompt('新建部署版本成功,当前状态不能升级。');
					deferred.resolve('create');
				} else {
					$domePublic.openConfirm('成功新建部署版本，是否继续升级？').then(function() {
						updateVersion(that.config.deployId, res.data.result).then(function() {
							$domePublic.openPrompt('已提交，正在升级！');
							deferred.resolve('update');
						}, function(res) {
							$domePublic.openWarning({
								title: '升级失败！',
								msg: res.data.resultMsg
							});
							deferred.resolve('updateFailed');
						});
					}, function() {
						deferred.resolve('dismiss');
					});
				}
			}, function(res) {
				$domePublic.openWarning({
					title: '创建版本失败！',
					msg: res.data.resultMsg
				});
				deferred.reject('create');
			});
			return deferred.promise;
		},
		// 停止
		stop: function() {
			return $http.post('/api/deploy/action/stop?deployId=' + this.config.deployId);
		},
		// 扩容/缩容
		scale: function() {
			var that = this;
			var deferred = $q.defer();
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'scaleModal.html',
				controller: 'scaleModalCtr',
				size: 'md',
				resolve: {
					oldReplicas: function() {
						return that.config.currentReplicas;
					}
				}
			});
			modalInstance.result.then(function(replicas) {
				replicas = parseInt(replicas);
				var url = '';
				var currentVersionId = that.config.currentVersions[0].version;
				if (replicas > that.config.currentReplicas) {
					url = 'api/deploy/action/scaleup';
				} else if (replicas < that.config.currentReplicas) {
					url = 'api/deploy/action/scaledown';
				}
				$http.post(url + '?deployId=' + that.config.deployId + '&replicas=' + replicas + '&version=' + currentVersionId).then(function(res) {
					$domePublic.openPrompt('操作成功！');
					deferred.resolve(res.data.result);
				}, function() {
					$domePublic.openWarning('请求失败！');
					deferred.reject('requestError');
				});
			}, function() {
				deferred.reject('dismiss');
			});
			return deferred.promise;
		},
		// 恢复
		recoverVersion: function() {
			var deferred = $q.defer();
			var that = this;
			var versionModalIns = $modal.open({
				animation: true,
				templateUrl: 'versionListModal.html',
				controller: 'versionListModalCtr',
				size: 'md',
				resolve: {
					deployInfo: function() {
						return that.config;
					}
				}
			});
			versionModalIns.result.then(function(startInfo) {
				rollback(that.config.deployId, startInfo.versionId, startInfo.replicas).then(function(res) {
					deferred.resolve(res.data.result);
				}, function() {
					deferred.reject();
				});
			}, function() {
				deferred.reject('dismiss');
			});
			return deferred.promise;
		},
		// 升级
		updateVersion: function() {
			var deferred = $q.defer();
			var that = this;
			var versionModalIns = $modal.open({
				animation: true,
				templateUrl: 'versionListModal.html',
				controller: 'versionListModalCtr',
				size: 'md',
				resolve: {
					deployInfo: function() {
						return that.config;
					}
				}
			});
			versionModalIns.result.then(function(startInfo) {
				var currentVersionId = that.config.currentVersions[0].version;
				if (currentVersionId === startInfo.versionId) {
					$domePublic.openWarning("您不能选择当前版本！");
					deferred.reject('dismiss');
				} else if (currentVersionId > startInfo.versionId) {
					rollback(that.config.deployId, startInfo.versionId, startInfo.replicas).then(function(res) {
						$domePublic.openPrompt('已提交，正在回滚！');
						deferred.resolve(res.data.result);
					}, function() {
						$domePublic.openWarning('回滚失败，请重试！');
						deferred.reject();
					});
				} else {
					updateVersion(that.config.deployId, startInfo.versionId, startInfo.replicas).then(function(res) {
						$domePublic.openPrompt('已提交，正在升级！');
						deferred.resolve(res.data.result);
					}, function() {
						$domePublic.openPrompt('升级失败，请重试！');
						deferred.reject();
					});
				}
			}, function() {
				deferred.reject('dismiss');
			});
			return deferred.promise;
		},
		// 启动
		startVersion: function() {
			var deferred = $q.defer();
			var that = this;
			var versionModalIns = $modal.open({
				animation: true,
				templateUrl: 'versionListModal.html',
				controller: 'versionListModalCtr',
				size: 'md',
				resolve: {
					deployInfo: function() {
						return that.config;
					}
				}
			});
			versionModalIns.result.then(function(startInfo) {
				startVersion(that.config.deployId, startInfo.versionId, startInfo.replicas).then(function(res) {
					deferred.resolve(res.data.result);
				}, function() {
					deferred.reject();
				});
			}, function() {
				deferred.reject('dismiss');
			});
			return deferred.promise;
		},
		// 删除
		delete: function() {
			return $http.delete('/api/deploy/id/' + this.config.deployId);
		},
		// 新建
		create: function() {
			var deferred = $q.defer();
			var obj = this._formartDeploy();
			var that = this;

			function createDeploy() {
				$http.post('api/deploy/create', angular.toJson(obj)).then(function(res) {
					deferred.resolve();
				}, function(res) {
					deferred.reject({
						type: 'create',
						msg: res.data.resultMsg
					});
				});
			}

			if (this.isNewNamespace) {
				var namespace = this.config.namespace;
				var namespaceArr = [namespace];
				$domeCluster.createNamespace(this.clusterListIns.cluster.id, namespaceArr).then(function(res) {
					that.toggleIsNewNamespace();
					that.namespaceList.push(namespace);
					that.toggleNamespace(namespace);
					createDeploy();
				}, function(res) {
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
	};
	var DeployInstanceList = function() {
		this.isCheckAll = false;
		this.isCheckAllContainer = false;
		this.containerList = [];
		// 已选中instance数
		this.selectedCount = 0;
		// 已选中container数
		this.selectedContainerCount = 0;
	};
	DeployInstanceList.prototype = {
		init: function(instances) {
			this.isCheckAll = false;
			this.isCheckAllContainer = false;
			this.instanceList = (function(instances) {
				instances = instances || [];
				for (var i = 0; i < instances.length; i++) {
					instances[i].isSelected = false;
					instances[i].keyFilter = true;
					if (instances[i].containers) {
						for (var j = 0; j < instances[i].containers.length; j++) {
							instances[i].containers[j].shortContainerId = instances[i].containers[j].containerId.substring(0, 12);
						}
					}
				}
				return instances;
			})(instances);
		},
		// 选择实例-->切换containerList
		toggleContainerList: function(instance) {
			// console.log(this.instanceList[instanceIndex].containers)
			this.isCheckAllContainer = false;
			this.selectedContainerCount = 0;
			this.containerList = instance.containers || [];
			for (var i = 0; i < this.containerList.length; i++) {
				this.containerList[i].isSelected = false;
			}
		},
		filterWithKey: function(keywords) {
			this.isCheckAll = false;
			this.selectedCount = 0;
			for (var i = 0; i < this.instanceList.length; i++) {
				this.instanceList[i].isSelected = false;
				this.instanceList[i].keyFilter = this.instanceList[i].instanceName.indexOf(keywords) !== -1 ? true : false;
			}
		},
		// 需求删除： 可选择多个instance的container
		// getContainerList: function() {
		// 	var containerList = [],
		// 		i;
		// 	for (i = 0; i < this.instanceList.length; i++) {
		// 		if (this.instanceList[i].isSelected && this.instanceList[i].containers) {
		// 			containerList = containerList.concat(this.instanceList[i].containers);
		// 		}
		// 	}
		// 	for (i = 0; i < containerList.length; i++) {
		// 		containerList[i].isSelected = false;
		// 	}
		// 	this.isCheckAllContainer = false;
		// 	this.containerList = containerList;
		// },
		// 切换单个container的选中状态
		toggleContainerCheck: function(container) {
			var isAllHasChange = true;
			if (container.isSelected) {
				this.selectedContainerCount++;
				// 是否为全选
				for (var i = 0; i < this.containerList.length; i++) {
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
		},
		// 全选/全不选 
		checkAllContainer: function(isCheckAllContainer) {
			this.isCheckAllContainer = isCheckAllContainer === undefined ? !this.isCheckAllContainer : isCheckAllContainer;
			if (this.isCheckAllContainer) {
				this.selectedContainerCount = this.containerList.length;
			} else {
				this.selectedContainerCount = 0;
			}
			for (var i = 0; i < this.containerList.length; i++) {
				this.containerList[i].isSelected = this.isCheckAllContainer;
			}
		},
		// 切换单个实例的选中状态
		toggleCheck: function(instance) {
			var isAllHasChange = true;
			if (instance.isSelected) {
				this.selectedCount++;
				// 是否为全选
				for (var i = 0; i < this.instanceList.length; i++) {
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
		},
		// 全选/全不选 
		checkAllInstance: function(isCheckAll) {
			this.isCheckAll = isCheckAll === undefined ? this.isCheckAll : isCheckAll;
			this.selectedCount = 0;
			for (var i = 0; i < this.instanceList.length; i++) {
				if (this.instanceList[i].keyFilter && this.isCheckAll) {
					this.instanceList[i].isSelected = true;
					this.selectedCount++;
				} else {
					this.instanceList[i].isSelected = false;
				}
			}
		}
	};
	var DeployList = function() {
		this.deploy = {};
		this.isLoading = false;
		this.deployInstanceListIns = new DeployInstanceList();
	};
	DeployList.prototype = {
		init: function(deploys) {
			this.deployList = (function(deploys) {
				deploys = deploys || [];
				return deploys;
			})(deploys);
		},
		toggleDeploy: function(deployId, deployName) {
			var that = this,
				deferred = $q.defer();
			if (!deployId) {
				that.deploy.id = undefined;
				that.deploy.name = undefined;
				that.deployInstanceListIns.init();
				deferred.reject();
			} else {
				that.deploy.id = deployId;
				that.deploy.name = deployName;
				that.isLoading = true;
				getDeployInsList(deployId).then(function(res) {
					that.deployInstanceListIns.init(res.data.result);
					deferred.resolve();
				}).finally(function(res) {
					deferred.reject();
					that.isLoading = false;
				});
			}
			return deferred.promise;
		},
		// @param hostEnv: 'TEST' or 'PROD'
		filterDeploy: function(clusterName, hostEnv) {
			var firstIndex = -1,
				deployId, deployName;
			for (var i = 0; i < this.deployList.length; i++) {
				if (clusterName && this.deployList[i].clusterName === clusterName) {
					this.deployList[i].clusterFilter = true;
				} else {
					this.deployList[i].clusterFilter = false;
				}
				if (hostEnv && this.deployList[i].hostEnv === hostEnv) {
					this.deployList[i].hostFilter = true;
				} else {
					this.deployList[i].hostFilter = false;
				}
				// 选中第一个符合条件的部署并切换到该部署
				if (firstIndex === -1 && this.deployList[i].clusterFilter && this.deployList[i].hostFilter) {
					firstIndex = i;
					deployId = this.deployList[i].deployId;
					deployName = this.deployList[i].deployName;
				}

			}
			if (firstIndex === -1) {
				return this.toggleDeploy();
			} else {
				return this.toggleDeploy(deployId, deployName);
			}
		}
	};
	// 获得实例
	var getInstance = function(className, initInfo) {
		var ins;
		switch (className) {
			case 'DeployList':
				ins = new DeployList();
				break;
			case 'EditDeploy':
				ins = new EditDeploy();
				break;
			default:
				ins = {};
				ins.init = function() {
					console.log('error:there is no ' + className);
				};
				break;
		}
		ins.init(initInfo);
		return ins;
	};
	return {
		getDeployList: getDeployList,
		getDeloyNamespace: getDeloyNamespace,
		getDeployInfo: getDeployInfo,
		getDeployEvents: getDeployEvents,
		getDeployInsList: getDeployInsList,
		createVersion: createVersion,
		getVersionList: getVersionList,
		getVersionDetail: getVersionDetail,
		startVersion: startVersion,
		getInstance: getInstance
	};
}]);