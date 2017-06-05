/*
 * @author ChandraLee
 * @description 监控页面
 */
(function (undefined) {
	var monitorApp = angular.module('monitorApp', ['ngAnimate', 'ui.bootstrap', 'publicModule', 'amchartsModule', 'domeModule', 'commonFilters', 'pageLayout']);
	monitorApp.directive('datepickerComponent', ['$util', function ($util) {
		var tplArr = [];
		tplArr.push('      <div class="js-dateoptions btn-group" role="group" aria-label="..." >');
		tplArr.push('        <button class="btn btn-default js-interval">最近1小时</button>');
		tplArr.push('      </div>');
		tplArr.push('      <div class="datepicker-con js-datepicker-con">');
		tplArr.push('        <div class="date-choose">');
		tplArr.push('          <datepicker ng-model="selectDate.startDate" max-date="selectDate.endDate" show-weeks="false" custom-class="getDayClass(date, mode)" class="datepicker"></datepicker>');
		tplArr.push('          <datepicker ng-model="selectDate.endDate" min-date="selectDate.startDate" max-date="today" show-weeks="false" custom-class="getDayClass(date, mode)" class="datepicker"></datepicker>');
		tplArr.push('        </div>');
		tplArr.push('        <div class="date-result">');
		tplArr.push('          <div class="result-selected">');
		tplArr.push('            <div class="date-selected">');
		tplArr.push('              <p>开始</p>');
		tplArr.push('              <input disabled="true" type="text" value="{{selectDate.startDate| day}}" class="form-control"/>');
		tplArr.push('            </div>');
		tplArr.push('          </div>');
		tplArr.push('          <div class="result-selected">');
		tplArr.push('            <div class="date-selected">');
		tplArr.push('              <p>结束</p>');
		tplArr.push('              <input disabled="true" type="text" value="{{selectDate.endDate| day}}" class="form-control"/>');
		tplArr.push('            </div>');
		tplArr.push('          </div>');
		tplArr.push('          <div>');
		tplArr.push('            <button ng-click="submitSelfDate();" class="ui-btn ui-btn-primary ui-btn-md btn-submit-date">提交</button>');
		tplArr.push('          </div>');
		tplArr.push('        </div>');
		tplArr.push('      </div>');
		return {
			restrict: 'AE',
			scope: {
				dateOptions: '='
			},
			replce: true,
			template: tplArr.join(''),
			link: function (scope, element) {
				var dateOptionsEle = element.find('.js-dateoptions'),
					datePickersEle = element.find('.js-datepicker-con'),
					optionEles, customEle,
					i, optionsArr = [];
				scope.date = {
					startDate: 0,
					endDate: 0
				};
				scope.today = new Date();
				datePickersEle.hide();
				scope.setDateInterval = function (interval) {
					var day, day1, day2;
					switch (interval) {
					case '30m':
						scope.date.startDate = new Date().getTime() - 1800000;
						scope.date.endDate = new Date().getTime();
						break;
					case '1h':
						scope.date.startDate = new Date().getTime() - 1000 * 60 * 60;
						scope.date.endDate = new Date().getTime();
						break;
					case '6h':
						scope.date.startDate = new Date().getTime() - 1000 * 60 * 60 * 6;
						scope.date.endDate = new Date().getTime();
						break;
					case '12h':
						scope.date.startDate = new Date().getTime() - 1000 * 60 * 60 * 12;
						scope.date.endDate = new Date().getTime();
						break;
					case '24h':
						scope.date.startDate = new Date().getTime() - 1000 * 60 * 60 * 24;
						scope.date.endDate = new Date().getTime();
						break;
					case '7d':
						day = $util.calculateDate(new Date(), -7).split('-');
						scope.date.startDate = new Date(day[0], day[1] - 1, day[2], 0, 0, 0).getTime();
						scope.date.endDate = new Date().getTime();
						break;
					case '30d':
						day = $util.calculateDate(new Date(), -30).split('-');
						scope.date.startDate = new Date(day[0], day[1] - 1, day[2], 0, 0, 0).getTime();
						scope.date.endDate = new Date().getTime();
						break;
					case 'self':
						day1 = $util.calculateDate(new Date(scope.selectDate.startDate), 0).split('-');
						day2 = $util.calculateDate(new Date(scope.selectDate.endDate), 1).split('-');
						scope.date.startDate = new Date(day1[0], day1[1] - 1, day1[2], 0, 0, 0).getTime();
						scope.date.endDate = (new Date(day2[0], day2[1] - 1, day2[2], 0, 0, 0)).getTime() - 1;
						break;
					default:
						return;
					}
					scope.$emit('dateIntervalChange', scope.date);
				};
				if (scope.dateOptions) {
					for (i = 0; i < scope.dateOptions.length; i++) {
						if (scope.dateOptions[i].isDefault) {
							optionsArr.push('<button class="btn btn-default active js-interval" data-interval="' + scope.dateOptions[i].interval + '">' + scope.dateOptions[i].text + '</button>');
							scope.setDateInterval(scope.dateOptions[i].interval);
							scope.selectDate = scope.date;
						} else {
							optionsArr.push('<button class="btn btn-default js-interval" data-interval="' + scope.dateOptions[i].interval + '">' + scope.dateOptions[i].text + '</button>');
						}
					}
					optionsArr.push('<button class="btn btn-default js-custom">自定义</button>');
				}
				dateOptionsEle.html(optionsArr.join(''));
				optionEles = element.find('.js-interval');
				customEle = element.find('.js-custom');
				optionEles.bind('click', function () {
					var thisEle = angular.element(this);
					if (!thisEle.hasClass('active')) {
						optionEles.removeClass('active');
						customEle.removeClass('active');
						thisEle.addClass('active');
					}
					datePickersEle.hide();
					scope.setDateInterval(thisEle.data('interval'));
					scope.selectDate = angular.copy(scope.date);
					scope.$digest();
				});
				customEle.bind('click', function () {
					if (datePickersEle.is(':visible')) {
						datePickersEle.hide();
					} else {
						datePickersEle.show();
					}
				});
				scope.submitSelfDate = function () {
					scope.setDateInterval('self');
					datePickersEle.hide();
					if (!customEle.hasClass('active')) {
						customEle.addClass('active');
						optionEles.removeClass('active');
					}
				};
			}
		};
	}]).directive('chartHeight', function () {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				scope.chartWraperHeight = 0;
				scope.$watch(function () {
					return attrs.chartHeight;
				}, function (newValue) {
					newValue = parseInt(newValue);
					scope.chartWraperHeight = 330 + newValue * 15;
				});
				scope.getFullChartStyle = function () {
					return {
						'height': scope.chartWraperHeight + 20 + 'px'
					};
				};
				scope.getShortChatStyle = function () {
					return {
						'height': scope.chartWraperHeight - 43 + 'px'
					};
				};
			}
		};
	});
	monitorApp.service('$monitor', ['$http', '$q', '$util', '$filter', function ($http, $q, $util, $filter) {
		'use strict';
		var self = this;
		var _tableInfo, _monitorInfo, _monitorCountResult;
		function initMonitorData() {
			// _monitorCountResult = null;
			_monitorCountResult = {
				// cpu占用率
				cpu: {},
				// 内存占用率
				mem: {},
				// 磁盘分区使用率
				diskUsedMult: [],
				// 磁盘读取
				diskReadMult: [],
				// 磁盘写入
				diskWriteMult: [],
				// 网络流入
				netInMult: [],
				netIn: {},
				// 网络流出
				netOutMult: [],
				netOut: {},
				// 表头项对应提示
				keyMap: {
					busy: 'CPU总占用',
					user: '用户级进程',
					nice: 'nice值为负的用户级进程',
					system: '内核级进程',
					iowait: '等待磁盘IO',
					irq: 'CPU服务硬中断',
					softirq: 'CPU服务软中断',
					switches: 'CPU上下文每秒切换次数'
				}
			};
			_monitorInfo = {
				monitorItem: [],
				monitorType: ''
			};
			_tableInfo = {
				tableLength: 6,
				tableKeyName: '',
				tableHead: [],
				tableItem: []
			};
		}
		function toDecimal(data, number, unitShow) {
			if (data === null || isNaN(data)) return '——';
			if (!unitShow) unitShow = '';
			return data.toFixed(number) + unitShow;
		}
		function formartBytesData(data, unit) {
			if (data === null || data === undefined) {
				return '——';
			}
			return $util.formartBytesData(data, unit);
		}
		initMonitorData();
		self.getAmchartConfig = function (monitorTitle, monitorData, monitorUnit) {
			var config = {
				type: 'serial',
				categoryField: 'timeStamp',
				pathToImages: '/lib/images/amcharts/',
				zoomOutButtonAlpha: 0.26,
				startDuration: 0,
				chartScrollbar: {},
				chartCursor: {
					categoryBalloonDateFormat: 'JJ:NN:SS'
				},
				categoryAxis: {
					minPeriod: 'ss',
					parseDates: true,
					labelOffset: 6,
					offset: 1,
					equalSpacing: true
				},
				graphs: [],
				titles: [{
					id: 'Title-1',
					size: 15,
					text: monitorTitle
				}],
				dataProvider: monitorData,
				trendLines: [],
				guides: [],
				valueAxes: [],
				allLabels: [],
				balloon: {}
			};
			if (monitorTitle === '') {
				config.titles = [];
			}
			for (var i = 0; i < _monitorInfo.monitorItem.length; i++) {
				config.graphs.push({
					bullet: 'round',
					id: 'AmGraph' + i,
					title: _monitorInfo.monitorItem[i],
					bulletField: _monitorInfo.monitorItem[i],
					balloonText: '[[' + _monitorInfo.monitorItem[i] + ']]' + monitorUnit,
					valueField: _monitorInfo.monitorItem[i]
				});
				config.legend = {
					useGraphSettings: true,
					valueWidth: 120,
					valueText: '[[value]]' + monitorUnit
				};
			}
			return config;
		};
		function getSelfMonitor(monitorTitle, monitorData, monitorUnit) {
			var monitorConfig = {
				graphs: [],
				titles: [{
					id: 'Title-1',
					size: 15,
					text: monitorTitle
				}],
				dataProvider: monitorData
			};
			if (monitorTitle === '') {
				monitorConfig.titles = [];
			}
			for (var i = 0; i < _monitorInfo.monitorItem.length; i++) {
				monitorConfig.graphs.push({
					bullet: 'round',
					id: 'AmGraph' + i,
					title: _monitorInfo.monitorItem[i],
					bulletField: _monitorInfo.monitorItem[i],
					balloonText: '[[' + _monitorInfo.monitorItem[i] + ']]' + monitorUnit,
					valueField: _monitorInfo.monitorItem[i]
				});
				monitorConfig.legend = {
					useGraphSettings: true,
					valueWidth: 120,
					valueText: '[[value]]' + monitorUnit
				};
			}
			return monitorConfig;
		}
		// @return eg:[{key:'最小值','node1':'0.01%','node2':'0.11%'},{key:'最大值','node1':'0.10%','node2':'0.20%'},{key:'平均值','node1':'0.04%','node2':'0.14%'}]
		function generateMultCountTable(counter, unit) {
			var countResult = {}, //eg:{'node1':{min:'1.00%',max:'2.12%',average:'1.13%',sum:'无用项'}，'node2':{min:'1.00%',max:'2.12%',average:'1.13%',sum:'无用项'}}
				i, j, item, compareItem, tableResult = [{
					key: {
						text: '最小值'
					}
				}, {
					key: {
						text: '最大值'
					}
				}, {
					key: {
						text: '平均值'
					}
				}];
			for (i = 0; i < _monitorInfo.monitorItem.length; i++) {
				countResult[_monitorInfo.monitorItem[i]] = {
					min: {
						value: void 0
					},
					max: {
						value: 0
					},
					sum: 0,
					countHasData: 0,
					average: 0
				};
			}
			for (i = 0; i < counter.length; i++) {
				for (j = 0; j < _monitorInfo.monitorItem.length; j++) {
					item = counter[i][_monitorInfo.monitorItem[j]];
					compareItem = countResult[_monitorInfo.monitorItem[j]];
					if (item !== undefined && item !== null) {
						countResult[_monitorInfo.monitorItem[j]].countHasData++;
						if (item > compareItem.max.value) {
							countResult[_monitorInfo.monitorItem[j]].max.value = item;
							countResult[_monitorInfo.monitorItem[j]].max.time = counter[i].timeStamp;
						}
						if (compareItem.min.value === undefined || item < compareItem.min.value) {
							countResult[_monitorInfo.monitorItem[j]].min.value = item;
							countResult[_monitorInfo.monitorItem[j]].min.time = counter[i].timeStamp;
						}
						countResult[_monitorInfo.monitorItem[j]].sum += item;
					}
				}
			}
			angular.forEach(countResult, function (value, key) {
				if (value.countHasData !== 0) {
					value.average = value.sum / value.countHasData;
				}
				if (unit) {
					if (unit == '%') {
						value.min = {
							text: toDecimal(value.min.value, 2, unit),
							tip: formartDate(value.min.time)
						};
						value.max = {
							text: toDecimal(value.max.value, 2, unit),
							tip: formartDate(value.max.time)
						};
						value.average = {
							text: toDecimal(value.average, 2, unit)
						};
					} else {
						value.min = {
							text: formartBytesData(value.min.value, unit),
							tip: formartDate(value.min.time)
						};
						value.max = {
							text: formartBytesData(value.max.value, unit),
							tip: formartDate(value.max.time)
						};
						value.average = {
							text: formartBytesData(value.average, unit)
						};
					}
				} else {
					value.min = {
						text: value.min.value,
						tip: formartDate(value.min.time)
					};
					value.max = {
						text: value.max.value,
						tip: formartDate(value.max.time)
					};
					value.average = {
						text: value.average
					};
				}
				if (_monitorInfo.monitorType == 'container') {
					key = key.substring(0, 12);
				}
				tableResult[0][key] = value.min;
				tableResult[1][key] = value.max;
				tableResult[2][key] = value.average;
			});
			return tableResult;
		}
		function generateMultRealTimeTable(counter, unit) {
			var count = 0,
				len = counter.length,
				i, j, isFound = false,
				tableBodyData = [],
				thisData, result;
			for (i = len - 1; i >= 0 && count < _tableInfo.tableLength; i--) {
				thisData = counter[i];
				result = {};
				if (!isFound) {
					for (j = 0; j < _monitorInfo.monitorItem.length; j++) {
						var item = thisData[_monitorInfo.monitorItem[j]];
						if (item !== null && item !== undefined) {
							isFound = true;
							break;
						}
					}
				}
				if (isFound) {
					result.key = {
						text: formartDate(counter[i].timeStamp)
					};
					for (j = 0; j < _monitorInfo.monitorItem.length; j++) {
						var keyName = _monitorInfo.monitorType === 'container' ? _monitorInfo.monitorItem[j].substring(0, 12) : _monitorInfo.monitorItem[j];
						if (unit == '%') {
							result[keyName] = {
								text: toDecimal(counter[i][_monitorInfo.monitorItem[j]], 2, '%')
							};
						} else {
							result[keyName] = {
								text: formartBytesData(counter[i][_monitorInfo.monitorItem[j]], unit)
							};
						}
					}
					tableBodyData.push(result);
					count++;
				}
			}
			return tableBodyData;
		}
		function generateMultData(isShowCountTable, tableData, counterData, parseUnit) {
			tableData.head = _tableInfo.tableHead;
			tableData.item = _tableInfo.tableItem;
			if (isShowCountTable) {
				tableData.body = generateMultCountTable(counterData, parseUnit);
			} else {
				tableData.body = generateMultRealTimeTable(counterData, parseUnit);
			}
		}
		// 获取倒数第index个元素
		// function getArrReciprocalEle(arr, index) {
		// 	if (index === 0) {
		// 		return arr && arr.slice(-1)[0];
		// 	} else {
		// 		return arr && arr.slice(-(index + 1), -index)[0];
		// 	}
		// }
		// 获取arr数组里倒数第一个item有值的元素的下标
		function getHasDataLastIndex(arr, item) {
			var startIndex;
			for (startIndex = arr.length - 4; startIndex >= 0; startIndex--) {
				if (arr[startIndex][item] !== undefined && arr[startIndex][item] !== null) {
					return startIndex;
				}
			}
			return -1;
		}
		function getArrEleWithKey(arr, index, key) {
			if (arr && arr[index]) {
				return arr[index][key];
			}
			return undefined;
		}
		function formartDate(ms) {
			if (ms === undefined || ms === null) {
				return;
			}
			return $filter('date')(ms, 'yyyy-MM-dd HH:mm:ss');
		}
		function formartToDecimalArr(monitorItem, arr) {
			if (!arr) return arr;
			var newArr = angular.copy(arr);
			for (var i = 0; i < newArr.length; i++) {
				for (var j = 0; j < monitorItem.length; j++) {
					var item = newArr[i][monitorItem[j]];
					if (item === null || item === undefined || isNaN(item)) {
						continue;
					}
					newArr[i][monitorItem[j]] = item.toFixed(2);
				}
			}
			return newArr;
		}
		function formartFlowArr(monitorItem, arr, unit) {
			if (!arr) return arr;
			// var newArr = arr.slice();
			var newArr = angular.copy(arr);
			for (var i = 0; i < newArr.length; i++) {
				for (var j = 0; j < monitorItem.length; j++) {
					if (newArr[i][monitorItem[j]]) {
						newArr[i][monitorItem[j]] = ($util.formartBytesData(newArr[i][monitorItem[j]], unit)).toFixed(2);
					}
				}
			}
			return newArr;
		}
		// 获取counter的计算结果
		// @param counter : 需要处理的counter
		// @param singleItemName : 需要计算的监控项
		function getCounterCountResult(counter, unit, singleItemName) {
			var max = {
					value: 0,
					time: undefined
				},
				min = {
					value: undefined,
					time: undefined
				},
				average = 0,
				sum = 0,
				countHasData = 0,
				i, item, result;
			if (!counter || singleItemName === undefined) {
				return;
			}
			for (i = 0; i < counter.length; i++) {
				item = counter[i][singleItemName];
				if (item !== null && item !== undefined) {
					countHasData++;
					if (item > max.value) {
						max.value = item;
						max.time = counter[i].timeStamp;
					}
					if (min.value === undefined || item < min.value) {
						min.value = item;
						min.time = counter[i].timeStamp;
					}
					sum += item;
				}
			}
			if (countHasData !== 0) {
				average = sum / countHasData;
			}
			if (unit) {
				if (unit == '%') {
					result = {
						max: {
							text: toDecimal(max.value, 2, unit),
							tip: formartDate(max.time)
						},
						min: {
							text: toDecimal(min.value, 2, unit),
							tip: formartDate(min.time)
						},
						average: {
							text: toDecimal(average, 2, unit)
						}
					};
				} else {
					result = {
						max: {
							text: formartBytesData(max.value, unit),
							tip: formartDate(max.time)
						},
						min: {
							text: formartBytesData(min.value, unit),
							tip: formartDate(min.time)
						},
						average: {
							text: formartBytesData(average, unit)
						}
					};
				}
			} else {
				result = {
					max: {
						text: toDecimal(max.value, 2),
						tip: formartDate(max.time)
					},
					min: {
						text: toDecimal(min.value, 2),
						tip: formartDate(min.time)
					},
					average: {
						text: toDecimal(sum / counter.length, 2)
					}
				};
			}
			return result;
		}
		function getCounterCountTable(counterItem, conuterCount) {
			var table = [{
				key: {
					text: '最小值'
				}
			}, {
				key: {
					text: '最大值'
				}
			}, {
				key: {
					text: '平均值'
				}
			}];
			for (var i = 1; i < counterItem.length; i++) {
				var item = conuterCount[counterItem[i]] || {
					min: {
						text: '——'
					},
					max: {
						text: '——'
					},
					average: {
						text: '——'
					}
				};
				table[0][counterItem[i]] = item.min;
				table[1][counterItem[i]] = item.max;
				table[2][counterItem[i]] = item.average;
			}
			return table;
		}
		self.getMonitorsArr = function (monitorCondition, monitorItem, monitorResult, isShowCountTable) {
			var i,
				// 单个监控项名字
				singleItemName,
				startIndex, endIndex,
				tableData,
				tableLength = _tableInfo.tableLength,
				tableHead = [],
				// 表格数据展示项
				tableItem = [],
				currentCounterData, counterCountResults,
				tableKeyName = _tableInfo.tableKeyName = isShowCountTable ? '统计值' : '时间';
			initMonitorData();
			// 是否是单个监控项
			if (monitorItem.length < 2) {
				singleItemName = monitorItem[0];
			}
			tableHead = function () {
				var head = angular.copy(monitorItem);
				head.unshift(tableKeyName);
				return head;
			}();
			tableItem = angular.copy(monitorItem);
			if (monitorCondition.targetType == 'container') {
				for (i = 0; i < tableItem.length; i++) {
					tableItem[i] = tableItem[i].substring(0, 12);
				}
				for (i = 1; i < tableHead.length; i++) {
					tableHead[i] = tableHead[i].substring(0, 12);
				}
			}
			tableItem.unshift('key');
			_tableInfo.tableItem = tableItem;
			_tableInfo.tableHead = tableHead;
			_monitorInfo.monitorItem = monitorItem;
			_monitorInfo.monitorType = monitorResult.targetType;
			if (monitorResult.targetType == 'node') {
				// 主机：cpu占用率数据
				if (monitorResult.counterResults['cpu.busy']) {
					currentCounterData = monitorResult.counterResults['cpu.busy'];
					tableData = {
						head: [],
						item: [],
						body: []
					};
					// 查看单个监控项
					if (singleItemName !== undefined) {
						tableData.head = [tableKeyName, 'busy', 'user', 'nice', 'system', 'iowait', 'irq', 'softirq', 'switches'];
						tableData.item = ['key', 'busy', 'user', 'nice', 'system', 'iowait', 'irq', 'softirq', 'switches'];
						if (isShowCountTable) {
							counterCountResults = {
								busy: getCounterCountResult(currentCounterData, '%', singleItemName),
								user: getCounterCountResult(monitorResult.counterResults['cpu.user'], '%', singleItemName),
								nice: getCounterCountResult(monitorResult.counterResults['cpu.nice'], '%', singleItemName),
								system: getCounterCountResult(monitorResult.counterResults['cpu.system'], '%', singleItemName),
								iowait: getCounterCountResult(monitorResult.counterResults['cpu.iowait'], '%', singleItemName),
								irq: getCounterCountResult(monitorResult.counterResults['cpu.irq'], '%', singleItemName),
								softirq: getCounterCountResult(monitorResult.counterResults['cpu.softirq'], '%', singleItemName),
								switches: getCounterCountResult(monitorResult.counterResults['cpu.switches'], '', singleItemName)
							};
							tableData.body = getCounterCountTable(tableData.item, counterCountResults);
						} else {
							// 下标：第一个有数据的下标
							startIndex = getHasDataLastIndex(currentCounterData, singleItemName);
							if (startIndex !== -1) {
								endIndex = startIndex - tableLength;
								for (; startIndex >= 0 && startIndex > endIndex; startIndex--) {
									tableData.body.push({
										key: {
											text: formartDate(getArrEleWithKey(currentCounterData, startIndex, 'timeStamp'))
										},
										busy: {
											text: toDecimal(getArrEleWithKey(currentCounterData, startIndex, singleItemName), 2, '%')
										},
										user: {
											text: toDecimal(getArrEleWithKey(monitorResult.counterResults['cpu.user'], startIndex, singleItemName), 2, '%')
										},
										nice: {
											text: toDecimal(getArrEleWithKey(monitorResult.counterResults['cpu.nice'], startIndex, singleItemName), 2, '%')
										},
										system: {
											text: toDecimal(getArrEleWithKey(monitorResult.counterResults['cpu.system'], startIndex, singleItemName), 2, '%')
										},
										iowait: {
											text: toDecimal(getArrEleWithKey(monitorResult.counterResults['cpu.iowait'], startIndex, singleItemName), 2, '%')
										},
										irq: {
											text: toDecimal(getArrEleWithKey(monitorResult.counterResults['cpu.irq'], startIndex, singleItemName), 2, '%')
										},
										softirq: {
											text: toDecimal(getArrEleWithKey(monitorResult.counterResults['cpu.softirq'], startIndex, singleItemName), 2, '%')
										},
										switches: {
											text: toDecimal(getArrEleWithKey(monitorResult.counterResults['cpu.switches'], startIndex, singleItemName), 2)
										}
									});
								}
							}
						}
					} else {
						generateMultData(isShowCountTable, tableData, currentCounterData, '%');
					}
					_monitorCountResult.cpu = {
						chartData: self.getAmchartConfig('CPU使用率(%)', formartToDecimalArr(monitorItem, currentCounterData), '%'),
						tableData: tableData
					};
				}
				angular.forEach(monitorResult.counterResults, function (value, key) {
					var param = key.split('=')[1];
					if (!param) {
						return;
					}
					// 主机： 磁盘分区使用率
					if (key.indexOf('df.bytes.used.percent/') !== -1) {
						tableData = {
							head: [],
							item: [],
							body: []
						};
						if (singleItemName !== undefined) {
							tableData.head = [tableKeyName, '磁盘占用(GB)', '磁盘总量(GB)', '磁盘占用率'];
							tableData.item = ['key', 'mountused', 'mounttotal', 'mountpercent'];
							if (isShowCountTable) {
								counterCountResults = {
									mountused: getCounterCountResult(monitorResult.counterResults['df.bytes.used/mount=' + param], 'GB', singleItemName),
									mounttotal: getCounterCountResult(monitorResult.counterResults['df.bytes.total/mount=' + param], 'GB', singleItemName),
									mountpercent: getCounterCountResult(value, '%', singleItemName)
								};
								tableData.body = getCounterCountTable(tableData.item, counterCountResults);
							} else {
								startIndex = getHasDataLastIndex(value, singleItemName);
								if (startIndex !== -1) {
									endIndex = startIndex - tableLength;
									for (; startIndex >= 0 && startIndex > endIndex; startIndex--) {
										tableData.body.push({
											key: {
												text: formartDate(getArrEleWithKey(value, startIndex, 'timeStamp'))
											},
											mountpercent: {
												text: toDecimal(getArrEleWithKey(value, startIndex, singleItemName), 2, '%')
											},
											mountused: {
												text: formartBytesData(getArrEleWithKey(monitorResult.counterResults['df.bytes.used/mount=' + param], startIndex, singleItemName), 'GB')
											},
											mounttotal: {
												text: formartBytesData(getArrEleWithKey(monitorResult.counterResults['df.bytes.total/mount=' + param], startIndex, singleItemName), 'GB')
											}
										});
									}
								}
							}
						} else {
							generateMultData(isShowCountTable, tableData, value, '%');
						}
						_monitorCountResult.diskUsedMult.push({
							name: param,
							chartData: self.getAmchartConfig('', formartToDecimalArr(monitorItem, value), '%'),
							tableData: tableData
						});
					} else if (key.indexOf('disk.io.read_bytes/') !== -1 || key.indexOf('disk.io.write_bytes/') !== -1) {
						// 主机：磁盘读/写
						var isRead = key.indexOf('disk.io.read_bytes/') !== -1;
						tableData = {
							head: [],
							item: [],
							body: []
						};
						if (singleItemName !== undefined) {
							tableData.head = isRead ? [tableKeyName, '读取数据(KB/s)'] : [tableKeyName, '写入数据(KB/s)'];
							tableData.item = ['key', 'data'];
							if (isShowCountTable) {
								counterCountResults = {
									data: getCounterCountResult(value, 'KB', singleItemName)
								};
								tableData.body = getCounterCountTable(tableData.item, counterCountResults);
							} else {
								startIndex = getHasDataLastIndex(value, singleItemName);
								if (startIndex !== -1) {
									endIndex = startIndex - tableLength;
									for (; startIndex >= 0 && startIndex > endIndex; startIndex--) {
										tableData.body.push({
											key: {
												text: formartDate(getArrEleWithKey(value, startIndex, 'timeStamp'))
											},
											data: {
												text: formartBytesData(getArrEleWithKey(value, startIndex, singleItemName), 'KB')
											}
										});
									}
								}
							}
						} else {
							generateMultData(isShowCountTable, tableData, value, 'KB');
						}
						if (isRead) {
							_monitorCountResult.diskReadMult.push({
								name: param,
								chartData: self.getAmchartConfig('', formartFlowArr(monitorItem, value, 'KB'), 'KB/s'),
								tableData: tableData
							});
						} else {
							_monitorCountResult.diskWriteMult.push({
								name: param,
								chartData: self.getAmchartConfig('', formartFlowArr(monitorItem, value, 'KB'), 'KB/s'),
								tableData: tableData
							});
						}
					} else if (key.indexOf('net.if.out.bytes/') !== -1 || key.indexOf('net.if.in.bytes/') !== -1) {
						// 主机：网络流出/流入
						var isOut = key.indexOf('net.if.out.bytes/') !== -1;
						tableData = {
							head: [],
							item: [],
							body: []
						};
						if (singleItemName !== undefined) {
							tableData.head = isOut ? [tableKeyName, '流出数据(KB/s)'] : [tableKeyName, '流入数据(KB/s)'];
							tableData.item = ['key', 'netdata'];
							if (isShowCountTable) {
								counterCountResults = {
									netdata: getCounterCountResult(value, 'KB', singleItemName)
								};
								tableData.body = getCounterCountTable(tableData.item, counterCountResults);
							} else {
								startIndex = getHasDataLastIndex(value, singleItemName);
								if (startIndex !== -1) {
									endIndex = startIndex - tableLength;
									for (; startIndex >= 0 && startIndex > endIndex; startIndex--) {
										tableData.body.push({
											key: {
												text: formartDate(getArrEleWithKey(value, startIndex, 'timeStamp'))
											},
											netdata: {
												text: formartBytesData(getArrEleWithKey(value, startIndex, singleItemName), 'KB')
											}
										});
									}
								}
							}
						} else {
							generateMultData(isShowCountTable, tableData, value, 'KB');
						}
						if (isOut) {
							_monitorCountResult.netOutMult.push({
								name: param,
								chartData: self.getAmchartConfig('', formartFlowArr(monitorItem, value, 'KB'), 'KB/s'),
								tableData: tableData
							});
						} else {
							_monitorCountResult.netInMult.push({
								name: param,
								chartData: self.getAmchartConfig('', formartFlowArr(monitorItem, value, 'KB'), 'KB/s'),
								tableData: tableData
							});
						}
					}
				});
			} else {
				// 容器/实例：CPU占用率
				if (monitorResult.counterResults['container.cpu.usage.busy']) {
					currentCounterData = monitorResult.counterResults['container.cpu.usage.busy'];
					// 实例/容器：CPU使用率
					tableData = {
						head: [],
						item: [],
						body: []
					};
					// 查看单个监控项
					if (singleItemName !== undefined) {
						tableData.head = [tableKeyName, 'busy', 'user', 'system'];
						tableData.item = ['key', 'busy', 'user', 'system'];
						if (isShowCountTable) {
							counterCountResults = {
								busy: getCounterCountResult(currentCounterData, '%', singleItemName),
								user: getCounterCountResult(monitorResult.counterResults['container.cpu.usage.user'], '%', singleItemName),
								system: getCounterCountResult(monitorResult.counterResults['container.cpu.usage.system'], '%', singleItemName)
							};
							tableData.body = getCounterCountTable(tableData.item, counterCountResults);
						} else {
							// 下标：第一个有数据的下标
							startIndex = getHasDataLastIndex(currentCounterData, singleItemName);
							if (startIndex !== -1) {
								endIndex = startIndex - tableLength;
								for (; startIndex >= 0 && startIndex > endIndex; startIndex--) {
									tableData.body.push({
										key: {
											text: formartDate(getArrEleWithKey(monitorResult.counterResults['container.cpu.usage.busy'], startIndex, 'timeStamp'))
										},
										busy: {
											text: toDecimal(getArrEleWithKey(monitorResult.counterResults['container.cpu.usage.busy'], startIndex, singleItemName), 2, '%')
										},
										user: {
											text: toDecimal(getArrEleWithKey(monitorResult.counterResults['container.cpu.usage.user'], startIndex, singleItemName), 2, '%')
										},
										system: {
											text: toDecimal(getArrEleWithKey(monitorResult.counterResults['container.cpu.usage.system'], startIndex, singleItemName), 2, '%')
										}
									});
								}
							}
						}
					} else {
						generateMultData(isShowCountTable, tableData, currentCounterData, '%');
					}
					_monitorCountResult.cpu = {
						chartData: self.getAmchartConfig('CPU占用率(%)', formartToDecimalArr(monitorItem, currentCounterData), '%'),
						tableData: tableData
					};
				}
				angular.forEach(['container.net.if.in.bytes', 'container.net.if.out.bytes'], function (name) {
					if (!monitorResult.counterResults[name]) {
						return;
					}
					// 实例/容器：网络流入/流出
					var isIn = name === 'container.net.if.in.bytes';
					currentCounterData = monitorResult.counterResults[name];
					tableData = {
						head: [],
						item: [],
						body: []
					};
					// 查看单个监控项
					if (singleItemName !== undefined) {
						tableData.head = isIn ? [tableKeyName, '流入数据(KB/s)'] : [tableKeyName, '流出数据(KB/s)'];
						tableData.item = ['key', 'netdata'];
						if (isShowCountTable) {
							counterCountResults = {
								netdata: getCounterCountResult(currentCounterData, 'KB', singleItemName)
							};
							tableData.body = getCounterCountTable(tableData.item, counterCountResults);
						} else {
							startIndex = getHasDataLastIndex(currentCounterData, singleItemName);
							if (startIndex !== -1) {
								endIndex = startIndex - tableLength;
								for (; startIndex >= 0 && startIndex > endIndex; startIndex--) {
									tableData.body.push({
										key: {
											text: formartDate(getArrEleWithKey(currentCounterData, startIndex, 'timeStamp'))
										},
										netdata: {
											text: formartBytesData(getArrEleWithKey(currentCounterData, startIndex, singleItemName), 'KB')
										}
									});
								}
							}
						}
					} else {
						generateMultData(isShowCountTable, tableData, currentCounterData, 'KB');
					}
					if (isIn) {
						_monitorCountResult.netIn = {
							chartData: self.getAmchartConfig('网络流入(KB/s)', formartFlowArr(monitorItem, currentCounterData, 'KB'), 'KB/s'),
							tableData: tableData
						};
					} else {
						_monitorCountResult.netOut = {
							chartData: self.getAmchartConfig('网络流出(KB/s)', formartFlowArr(monitorItem, currentCounterData, 'KB'), 'KB/s'),
							tableData: tableData
						};
					}
				});
			}
			// 主机/容器/实例： 内存使用率数据
			if (monitorResult.counterResults['mem.memused.percent'] || monitorResult.counterResults['container.mem.usage.percent']) {
				tableData = {
					head: [],
					item: [],
					body: []
				};
				var usedPercetData, usedTotalData, usedData;
				if (monitorResult.counterResults['mem.memused.percent']) {
					usedPercetData = monitorResult.counterResults['mem.memused.percent'];
					usedTotalData = monitorResult.counterResults['mem.memtotal'];
					usedData = monitorResult.counterResults['mem.memused'];
				} else {
					usedPercetData = monitorResult.counterResults['container.mem.usage.percent'];
					usedTotalData = monitorResult.counterResults['container.mem.limit'];
					usedData = monitorResult.counterResults['container.mem.usage'];
				}
				if (singleItemName !== undefined) {
					if (monitorResult.counterResults['mem.memused.percent']) {
						tableData.head = [tableKeyName, '内存占用量(MB)', '内存总量(MB)', '内存占用率'];
					} else {
						tableData.head = [tableKeyName, '内存占用量(MB)', '内存限额(MB)', '内存占用率'];
					}
					tableData.item = ['key', 'memused', 'memtotal', 'mempercent'];
					if (isShowCountTable) {
						counterCountResults = {
							memused: getCounterCountResult(usedData, 'MB', singleItemName),
							memtotal: getCounterCountResult(usedTotalData, 'MB', singleItemName),
							mempercent: getCounterCountResult(usedPercetData, '%', singleItemName)
						};
						tableData.body = getCounterCountTable(tableData.item, counterCountResults);
					} else {
						startIndex = getHasDataLastIndex(usedPercetData, singleItemName);
						if (startIndex !== -1) {
							endIndex = startIndex - tableLength;
							for (; startIndex >= 0 && startIndex > endIndex; startIndex--) {
								tableData.body.push({
									key: {
										text: formartDate(getArrEleWithKey(usedPercetData, startIndex, 'timeStamp'))
									},
									memused: {
										text: formartBytesData(getArrEleWithKey(usedData, startIndex, singleItemName), 'MB')
									},
									memtotal: {
										text: formartBytesData(getArrEleWithKey(usedTotalData, startIndex, singleItemName), 'MB')
									},
									mempercent: {
										text: toDecimal(getArrEleWithKey(usedPercetData, startIndex, singleItemName), 2, '%')
									}
								});
							}
						}
					}
				} else {
					generateMultData(isShowCountTable, tableData, usedPercetData, '%');
				}
				_monitorCountResult.mem = {
					chartData: self.getAmchartConfig('内存占用率(%)', formartToDecimalArr(monitorItem, usedPercetData), '%'),
					tableData: tableData
				};
			}
			return _monitorCountResult;
		};
		self.getMonitor = function (monitorCondition) {
			return $http.get('/api/monitor/data/' + monitorCondition.targetId + '?start=' + monitorCondition.start + '&end=' + monitorCondition.end + '&dataSpec=' + monitorCondition.dataSpec + '&cid=' + monitorCondition.cid);
		};
	}]);
	monitorApp.controller('MonitorCtr', ['$scope', '$http', '$util', '$monitor', '$q', '$timeout', 'dialog', function ($scope, $http, $util, $monitor, $q, $timeout, dialog) {
		'use strict';
		$scope.sampleTypes = [{
			type: 'MIN',
			text: '最小值'
		}, {
			type: 'MAX',
			text: '最大值'
		}, {
			type: 'AVERAGE',
			text: '平均值'
		}];
		var targetInfoId = $util.getQueryString('id'),
			clusterId = $util.getQueryString('cid');
		$scope.clusterName = $util.getQueryString('cname');
		$scope.singleItem = false;
		$scope.monitorItem = [];
		$scope.monitorTypeName = '';
		$scope.isLoading = true;
		$scope.isRealTime = false;
		var timeout;
		var getTargetInfo = function () {
			var deferred = $q.defer();
			if ($scope.targetInfos) {
				deferred.resolve($scope.targetInfos);
			} else {
				$http.get('/api/monitor/target/' + targetInfoId + '?cid=' + clusterId).then(function (res) {
					$scope.targetInfos = res.data.result;
					$scope.monitorItem = [];
					var monitorTargetInfos = $scope.targetInfos.targetInfos,
						i;
					switch ($scope.targetInfos.targetType) {
					case 'node':
						$scope.monitorTypeName = '主机';
						$scope.singleItem = monitorTargetInfos[0].node;
						for (i = 0; i < monitorTargetInfos.length; i++) {
							$scope.monitorItem.push(monitorTargetInfos[i].node);
						}
						break;
					case 'pod':
						$scope.monitorTypeName = '实例';
						$scope.singleItem = monitorTargetInfos[0].pod.podName;
						for (i = 0; i < monitorTargetInfos.length; i++) {
							$scope.monitorItem.push(monitorTargetInfos[i].pod.podName);
						}
						break;
					case 'container':
						$scope.monitorTypeName = '容器';
						$scope.singleItem = monitorTargetInfos[0].container.containerId.substring(0, 12);
						for (i = 0; i < monitorTargetInfos.length; i++) {
							$scope.monitorItem.push(monitorTargetInfos[i].container.containerId);
						}
						break;
					default:
						$scope.singleItem = false;
						break;
					}
					if ($scope.monitorItem.length > 1) {
						$scope.singleItem = false;
					}
					deferred.resolve($scope.targetInfos);
				}, function (res) {
					dialog.error('请求失败', res.data.resultMsg);
					deferred.reject();
				});
			}
			return deferred.promise;
		};
		getTargetInfo();
		$scope.date = {};
		$scope.intervalTime = 0;
		$scope.monitorsInfo = {
			cpu: {
				chartData: []
			},
			mem: {
				chartData: []
			},
			diskUsedMult: [],
			diskWriteMult: [],
			diskReadMult: [],
			netInMult: [],
			netOutMult: [],
			netIn: {
				chartData: []
			},
			netOut: {
				chartData: []
			}
		};
		$scope.selectedMonitor = {
			diskUsedMult: {
				name: '',
				chartData: [],
				tableData: {}
			},
			diskReadMult: {
				name: '',
				chartData: [],
				tableData: {}
			},
			diskWriteMult: {
				name: '',
				chartData: [],
				tableData: {}
			},
			netInMult: {
				name: '',
				chartData: [],
				tableData: {}
			},
			netOutMult: {
				name: '',
				chartData: [],
				tableData: {}
			}
		};
		$scope.currentSampleType = $scope.sampleTypes[2];
		var recoverSelectedItem = function (item) {
			var isFound = false;
			if (!$scope.selectedMonitor[item]) return;
			if ($scope.selectedMonitor[item].name !== '') {
				for (var i = 0; i < $scope.monitorsInfo[item].length; i++) {
					if ($scope.monitorsInfo[item][i].name === $scope.selectedMonitor[item].name) {
						isFound = true;
						$scope.toggleSelectedMonitor(item, i);
					}
				}
				if (!isFound) {
					$scope.toggleSelectedMonitor(item, 0);
				}
			} else {
				$scope.toggleSelectedMonitor(item, 0);
			}
		};
		var freshMonitor = function () {
			if (timeout) {
				$timeout.cancel(timeout);
			}
			getTargetInfo().then(function () {
				var monitorCondition = {
					targetId: targetInfoId,
					start: $scope.date.startDate,
					end: $scope.date.endDate,
					dataSpec: $scope.currentSampleType.type,
					cid: clusterId
				};
				$monitor.getMonitor(monitorCondition).then(function (res) {
					var data = res.data.result || {};
					if (!data.interval || data.interval < 5) {
						data.interval = 5;
					}
					$scope.intervalTime = data.interval * 1000;
					$scope.monitorsInfo = null;
					$scope.monitorsInfo = angular.copy($monitor.getMonitorsArr(monitorCondition, $scope.monitorItem, data, !$scope.isRealTime));
					// 刷新时恢复到原来选择的项
					recoverSelectedItem('diskUsedMult');
					recoverSelectedItem('diskReadMult');
					recoverSelectedItem('diskWriteMult');
					recoverSelectedItem('netInMult');
					recoverSelectedItem('netOutMult');
					if ($scope.isRealTime) {
						timeout = $timeout(function () {
							$scope.date.endDate = new Date().getTime();
							$scope.date.startDate = $scope.date.endDate - 3600000;
							freshMonitor();
						}, $scope.intervalTime);
					}
				}).finally(function () {
					$scope.isLoading = false;
				});
			}, function () {
				$scope.isLoading = false;
			});
		};
		$scope.toggleSelectedMonitor = function (kind, index) {
			if (!$scope.monitorsInfo[kind]) {
				return;
			}
			$scope.selectedMonitor[kind] = $scope.monitorsInfo[kind][index];
		};
		$scope.toggleSampleType = function (index) {
			$scope.isLoading = true;
			$scope.currentSampleType = $scope.sampleTypes[index];
			freshMonitor();
		};
		$scope.$on('dateIntervalChange', function (event, msg) {
			$scope.date = msg;
			$scope.isLoading = true;
			if ($scope.date.endDate - new Date().getTime() < 2000 && $scope.date.endDate - $scope.date.startDate < 3700000) {
				$scope.isRealTime = true;
			} else {
				$scope.isRealTime = false;
			}
			freshMonitor();
		});
	}]);
})();