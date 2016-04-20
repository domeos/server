/*
 * @description: 集群管理service 
 * @version: 0.1
 */
domeApp.factory('$domeCluster', ['$http', '$domeUser', '$q', '$modal', function($http, $domeUser, $q, $modal) {
	var getClusterList = function() {
		return $http.get('/api/cluster');
	};
	var getClusterDetail = function(clusterId) {
		return $http.get('/api/cluster/' + clusterId);
	};
	var getNodeList = function(clusterId) {
		return $http.get('/api/cluster/' + clusterId + '/nodelist');
	};
	var getNodeInfo = function(clusterId, hostname) {
		return $http.get('/api/cluster/' + clusterId + '/node/' + hostname);
	};
	var getNamespace = function(clusterId) {
		return $http.get('/api/cluster/' + clusterId + '/namespace');
	};
	var createNamespace = function(clusterId, namespaceList) {
		return $http.post('/api/cluster/' + clusterId + '/namespace', angular.toJson(namespaceList));
	};
	var getHostInstance = function(clusterId, hostname) {
		return $http.get('/api/cluster/' + clusterId + '/nodelist/' + hostname);
	};
	var modifyDisk = function(clusterId, nodeName, path) {
		return $http.post('/api/cluster/' + clusterId + '/' + nodeName + '/disk?path=' + path);
	};
	var addLabel = function(clusterId, labelInfo) {
		return $http.post('/api/cluster/' + clusterId + '/nodelabels', angular.toJson(labelInfo));
	};
	var deleteLabel = function(clusterId, nodeName, label) {
		return $http.delete('/api/cluster/' + clusterId + '/' + nodeName + '/' + label);
	};
	// nodeList Class
	var NodeList = function() {
		this.isCheckAll = false;
		this.nodeList = [];
		this.selectedCount = 0;
		this.labelsInfo = {};
	};
	NodeList.prototype = {
		// @params nodes: [], getNodeList() 接口返回的node数据结构
		// @params isFilterDisk : 是否过滤掉nodes中diskinfo等于null或''的node
		init: function(nodes, isFilterDisk) {
			var that = this;
			if (isFilterDisk !== true) {
				isFilterDisk = false;
			}
			// nodeList：nodes中每个node添加keyFilter、labelFilter、isSelected属性之后的重新生成的Array。
			that.nodeList = (function(nodes, isFilterDisk) {
				nodes = nodes ? nodes : [];
				for (var i = 0; i < nodes.length; i++) {
					if (isFilterDisk && (!nodes[i].diskInfo || nodes[i].diskInfo === '')) {
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
			that.labelsInfo = (function() {
				var map = {};
				var nodeList = that.nodeList;
				var i = 0,
					j = 0;
				for (i = 0; i < nodeList.length; i++) {
					for (var key in nodeList[i].labels) {
						if (nodeList[i].labels.hasOwnProperty(key) && key != 'kubernetes.io/hostname' && key != 'hostEnv') {
							if (map[key]) {
								var isContentExist = false;
								for (j = 0; j < map[key].contents.length; j++) {
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
		initLabelsInfo: function() {
			for (var label in this.labelsInfo) {
				if (this.labelsInfo[label].isSelected) {
					this.labelsInfo[label].isSelected = false;
				}
			}
			this.toggleLabelNodes();
		},
		// @param env : 'PROD'(生产环境) or 'TEST'(测试环境)
		toggleEnv: function(env) {
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
		toggleNodeCheck: function(node) {
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
		filterWithKey: function(keywords) {
			this.isCheckAll = false;
			this.selectedCount = 0;
			for (var i = 0; i < this.nodeList.length; i++) {
				this.nodeList[i].isSelected = false;
				this.nodeList[i].keyFilter = this.nodeList[i].name.indexOf(keywords) !== -1 ? true : false;
			}
		},
		// 全选/全不选 node
		checkAllNode: function(isCheckAll) {
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
		toggleLabel: function(label, isSelect) {
			var that = this;
			if (!that.labelsInfo[label]) {
				return;
			}
			if (isSelect !== undefined) {
				if (that.labelsInfo[label].isSelected === isSelect) {
					return;
				}
				that.labelsInfo[label].isSelected = isSelect;
			} else {
				that.labelsInfo[label].isSelected = !that.labelsInfo[label].isSelected;
			}
			that.toggleLabelNodes();
		},
		// 根据label对node进行过滤
		toggleLabelNodes: function() {
			var that = this;
			var isHasLabelSelected = false;
			var i = 0;
			that.isCheckAll = false;
			this.selectedCount = 0;
			angular.forEach(that.labelsInfo, function(value, key) {
				if (!isHasLabelSelected && value.isSelected) {
					isHasLabelSelected = true;
				}
			});
			if (!isHasLabelSelected) {
				for (i = 0; i < that.nodeList.length; i++) {
					that.nodeList[i].isSelected = false;
					that.nodeList[i].labelFilter = true;
				}
			} else {
				for (i = 0; i < that.nodeList.length; i++) {
					var hasAllSelect = true;
					that.nodeList[i].isSelected = false;
					for (var key in that.labelsInfo) {
						if (that.labelsInfo.hasOwnProperty(key) && that.labelsInfo[key].isSelected && that.nodeList[i].labels[key] === undefined) {
							hasAllSelect = false;
							break;
						}
					}
					that.nodeList[i].labelFilter = hasAllSelect;
				}
			}
		},
		// 弹出框展示node
		showHost: function() {
			var that = this;
			var hostModalIns = $modal.open({
				animation: true,
				templateUrl: '/index/tpl/modal/hostListModal/hostListModal.html',
				controller: 'hostListModalCtr',
				size: 'lg',
				resolve: {
					hostList: function() {
						return that.nodeList;
					}
				}
			});
			return hostModalIns.result;
		},
		// @return labelSelectors = [{labelKey1:labelContent1,labelKey1:labelContent2}];
		getFormartSelectedLabels: function() {
			var labelSelectors = [];
			var i = 0;
			angular.forEach(this.labelsInfo, function(value, key) {
				if (value.isSelected) {
					for (i = 0; i < value.contents.length; i++) {
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
		getSelectedNodes: function() {
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
	var Cluster = function() {
		// creator info
		this.userList = [];
		this.etcdValid = true;
		this.zookeeperValid = true;
		this.kafkaValid = true;
		this.config = {};
	};
	Cluster.prototype = {
		init: function(clusterInfo) {
			var etcd = [],
				etcdStrArr, zookeeper = [],
				zookeeperStrArr, kafka = [],
				kafkaStrArr, i;
			var that = this;
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
			// 初始化creator
			$domeUser.getGroupList().then(function(res) {
				that.userList = res.data.result || [];
				if (!clusterInfo.ownerName) {
					that.toggleUser(that.userList[0]);
				}
			});
			this.config = clusterInfo;
		},
		addEtcd: function() {
			this.config.etcd.push({
				name: ''
			});
		},
		addKafka: function() {
			this.config.clusterLog.kafka.push({
				name: ''
			});
		},
		addZookeeper: function() {
			this.config.clusterLog.zookeeper.push({
				name: ''
			});
		},
		deleteArrItem: function(item, index) {
			this.config[item].splice(index, 1);
		},
		deleteLogArrItem: function(item, index) {
			this.config.clusterLog[item].splice(index, 1);
		},
		toggleUser: function(user) {
			this.config.ownerName = user.name;
			this.config.ownerType = user.type;
		},
		toggleLogConfig: function() {
			this.config.logConfig = this.config.logConfig === 1 ? 0 : 1;
		},
		validItem: function(item) {
			var i = 0;
			var itemArr = [];
			var valid = false;
			if (item == 'etcd') {
				itemArr = this.config.etcd;
			} else {
				itemArr = this.config.clusterLog[item];
			}
			if (item != 'etcd' && this.config.logConfig === 0) {
				valid = true;
			} else {
				for (i = 0; i < itemArr.length; i++) {
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
		modify: function() {
			return $http.put('/api/cluster', angular.toJson(this._formartCluster()));
		},
		// 转换为于后台交互的cluster的数据结构
		_formartCluster: function() {
			var clusterConfig = angular.copy(this.config);
			var etcd = '',
				zookeeper = '',
				kafka = '';
			var i, name;
			for (i = 0; i < clusterConfig.etcd.length; i++) {
				name = clusterConfig.etcd[i].name;
				if (name && name !== '') {
					etcd += name + ',';
				}
			}
			clusterConfig.etcd = etcd;

			if (clusterConfig.logConfig === 0) {
				clusterConfig.clusterLog = null;
			} else {
				for (i = 0; i < clusterConfig.clusterLog.zookeeper.length; i++) {
					name = clusterConfig.clusterLog.zookeeper[i].name;
					if (name && name !== '') {
						zookeeper += name + ',';
					}
				}
				clusterConfig.clusterLog.zookeeper = zookeeper;
				for (i = 0; i < clusterConfig.clusterLog.kafka.length; i++) {
					name = clusterConfig.clusterLog.kafka[i].name;
					if (name && name !== '') {
						kafka += name + ',';
					}
				}
				clusterConfig.clusterLog.kafka = kafka;
			}
			return clusterConfig;
		},
		create: function() {
			var cluster = this._formartCluster();
			return $http.post('/api/cluster', angular.toJson(cluster));
		}
	};
	// ClusterList Class
	var ClusterList = function() {
		this.cluster = {};
	};
	ClusterList.prototype = {
		init: function(list) {
			this.clusterList = list ? list : [];
		},
		toggleCluster: function(index) {
			var that = this;
			that.cluster.id = that.clusterList[index].id;
			that.cluster.name = that.clusterList[index].name;
		}
	};
	// 获得实例
	var getInstance = function(className, initInfo) {
		var ins;
		switch (className) {
			case 'ClusterList':
				ins = new ClusterList();
				break;
			case 'Cluster':
				ins = new Cluster();
				break;
			case 'NodeList':
				ins = new NodeList();
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
		getClusterList: getClusterList,
		getClusterDetail: getClusterDetail,
		getNodeList: getNodeList,
		getNodeInfo: getNodeInfo,
		getNamespace: getNamespace,
		createNamespace: createNamespace,
		getHostInstance: getHostInstance,
		modifyDisk: modifyDisk,
		addLabel: addLabel,
		deleteLabel: deleteLabel,
		getInstance: getInstance
	};
}]);