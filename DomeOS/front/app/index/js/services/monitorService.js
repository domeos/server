/*
 * @description: 监控service
 * Created by xxs on 15/12/29.
 */

domeApp.factory('$domeMonitor', ['$http', '$q', function($http, $q) {
	function getMonitorInfo() {
		return $http.get('/api/global/monitor/info');
	}

	/**
	 * POST /chart for monitor -- multi counters
	 * @param type = "node"         | 主机监控
	 *        type = "pod"          | pod监控
	 *        type = "container"    | 容器监控
	 * @param graphType = "h"       | Endpoint视角
	 *        graphType = "k"       | Counter视角
	 *        graphType = "a"       | 组合视角
	 * @param monitorData = ["bx-42-197", "bx-42-198"]     | type == "node"
	 *        monitorData = [{"podName": "test-1", "containers": [{"hostname": "bx-42-197", "containerId": "alongcontainerid"}, {...}]}, {...}]    | type == "pod"
	 *        monitorData = [{"hostname": "bx-42-197", "containerId": "alongcontainerid"}, {...}]  | type == "container"
	 * @param counters = ["cpu.busy", "memory.memused", "container.memory.usage"]   | 监控项
	 * @param clusterId = "1"   | 集群ID, string类型
	 */
	function showChart(type, monitorData, counters, clusterId, graphType) {
		var data = {
			type: type,
			data: monitorData,
			counters: counters,
			_r: Math.random()
		};
		var w = window.open();
		var targetUrl;
		if (graphType) {
			data.graph_type = graphType;
			targetUrl = '/api/monitor/charts/' + clusterId;
		} else {
			data.graph_type = 'h';
			targetUrl = '/api/monitor/chart/big/' + clusterId;
		}
		$http.post('/api/monitor/chart/' + clusterId, angular.toJson(data)).then(function(res) {
			var resData = res.data;
			if (resData.ok) {
				w.location = targetUrl + '?id=' + resData.id + '&domeosid=' + resData.domeosid;
			}
		});
	}

	/**
	 * POST /api/counters for listing node monitor items
	 * @param type = "node"         | 主机监控
	 *        type = "pod"          | pod监控
	 *        type = "container"    | 容器监控
	 * @param monitorData = ["bx-42-197", "bx-42-198"]     | type == "node"
	 *        monitorData = [{"podName": "test-1", "containers": [{"hostname": "bx-42-197", "containerId": "alongcontainerid"}, {...}]}, {...}]    | type == "pod"
	 *        monitorData = [{"hostname": "bx-42-197", "containerId": "alongcontainerid"}, {...}]  | type == "container"
	 * @param filter = "cpu and multi selectors"    | 过滤条件，以空格分隔
	 * @param clusterId = "1"   | 集群ID, string类型
	 * @return items = [{"counter": "cpu.busy", "type": "原始值", "step": "10s"}]     | 返回监控项列表，对于 pod 和 contianer 的类型会去除末尾的 id=<containerId>
	 */
	// TODO return items with another parameters
	function getCounterList(type, monitorData, filter, clusterId) {
		var data = {
			type: type,
			data: monitorData,
			filter: filter,
			_r: Math.random()
		};
		var deferred = $q.defer();
		$http.post('/api/monitor/counters/' + clusterId, angular.toJson(data)).then(function(res) {
			var ret = res.data;
			if (ret.ok) {
				var items = [];
				var retItems = ret.data;
				var i, item;
				if (type == 'node') {
					for (i in retItems) {
						item = {
							'counter': retItems[i][0],
							'type': '计数值',
							'step': retItems[i][2]
						};
						if (retItems[i][1] == 'GAUGE') {
							item.type = '原始值';
						}
						items.push(item);
					}
				} else if (type == 'pod' || type == 'container') {
					for (i in retItems) {
						var counter = retItems[i][0].split('/')[0];
						var has = false;
						for (var j = 0; j < items.length; j++) {
							if (items[j].counter == counter) {
								has = true;
								break;
							}
						}
						if (!has) {
							item = {
								'counter': counter,
								'type': '计数值',
								'step': retItems[i][2]
							};
							if (retItems[i][1] == 'GAUGE') {
								item.type = '原始值';
							}
							items.push(item);
						}
					}
				} else {
					deferred.reject('typeError');
				}
				deferred.resolve(items);
			} else {
				deferred.reject('requestError:' + ret.msg);
			}
		}, function() {
			deferred.reject('requestError');
		});

		return deferred.promise;
	}

	var CounterList = function() {
		this.isCheckAll = false;
	};
	CounterList.prototype = {
		init: function(counters) {
			this.counterList = (function(counters) {
				counters = counters || [];
				for (var i = 0; i < counters.length; i++) {
					counters[i].isSelected = false;
				}
				return counters;
			})(counters);
		},
		// 切换单个counter的选中状态
		toggleCheck: function(counter) {
			var isAllHasChange = true;
			if (counter.isSelected) {
				// 是否为全选
				for (var i = 0; i < this.counterList.length; i++) {
					if (!this.counterList[i].isSelected) {
						isAllHasChange = false;
						break;
					}
				}
				if (isAllHasChange) {
					this.isCheckAll = true;
				}
			} else {
				this.isCheckAll = false;
			}
		},
		// 全选/全不选 
		checkAllInstance: function(isCheckAll) {
			this.isCheckAll = isCheckAll === undefined ? this.isCheckAll : isCheckAll;
			for (var i = 0; i < this.counterList.length; i++) {
				this.counterList[i].isSelected = this.isCheckAll;
			}
		}
	};
	var getInstance = function(className, initInfo) {
		var ins;
		switch (className) {
			case 'CounterList':
				ins = new CounterList();
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
		showChart: showChart,
		getCounterList: getCounterList,
		getMonitorInfo: getMonitorInfo,
		getInstance: getInstance
	};
}]);