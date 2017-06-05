/*
 * @author ChandraLee
 * @description 监控模块服务
 */

(function (domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;
    domeApp.factory('$domeMonitor', ['$http', '$q', '$util', 'dialog', function ($http, $q, $util, dialog) {
        var getMonitorInfo = function () {
            return $http.get('/api/global/monitor/info');
        };
        var storeMonitorTarget = function (targetInfos) {
            return $http.post('/api/monitor/target', angular.toJson(targetInfos));
        };
        var getMonitorTarget = function (targetId) {
            return $http.get('/api/monitor/target/' + targetId);
        };

        var getMonitorData = function (targetId, start, end, dataSpec, clusterId) {
            return $http.get('/api/monitor/data/' + targetId + '?start=' + start + '&end=' + end + '&dataSpec=' + dataSpec + '&cid=' + clusterId);

        };
        var toMonitorPage = function (clusterId, clusterName, monitorTargetInfo) {
            var winRef = window.open('', '_blank');
            var monitorType = monitorTargetInfo.targetType;
            storeMonitorTarget(monitorTargetInfo).then(function (res) {
                var id = res.data.result;
                if (typeof id === 'undefined') {
                    dialog.error('警告', '请求错误！');
                    return;
                }
                setTimeout(function () {
                    winRef.location = '/monitor/monitor.html?cid=' + clusterId + '&cname=' + clusterName + '&id=' + id + '&type=' + monitorType;
                }, 0);
            });
        };
        var getMonitorStatistical = function (monitorType, clusterId, monitorInfo, monitorItems) {
            var defered = $q.defer();

            function toDecimal(data, number, unitShow) {
                if (Object.prototype.toString.call(data) === '[object Null]' || isNaN(data)) return '——';
                if (!unitShow) unitShow = '';
                data = +data.toFixed(number);
                if (unitShow) {
                    data += unitShow;
                }
                return data;
            }

            function formartBytesData(data, unit) {
                data = $util.formartBytesData(data, unit);
                if (Object.prototype.toString.call(data) === '[object Null]' || typeof data === 'undefined') {
                    return '——';
                }
                return +data.toFixed(2);
            }
            storeMonitorTarget({
                clusterId: clusterId,
                targetType: monitorType,
                targetInfos: monitorInfo
            }).then(function (res) {
                return getMonitorData(res.data.result, new Date().getTime() - 300000, new Date().getTime(), 'AVERAGE', clusterId);
            }).then(function (res) {
                var monitorData = res.data.result;
                var cpuBusy, memPercet,
                    // 监控数据： {node1:{diskUsedData:[{item:'/var',value:20},{item:'/opt',value:10}],maxDiskUsed:20}}
                    monitorItemData = {},
                    // 监控项汇总： {cpuUsed:{'/var':{timeStamp:xxxxxx,node1:10,node2:20},'/opt':{...}, ...}
                    collectMonitorInfo = {},
                    i, l;
                /**
                 * @param item: 单项名字  eg:'diskUsed'(表示磁盘使用情况-->生成map的key1：diskUsedData(磁盘占用率详情：对应的磁盘各分区的占用量);key2:diskUsedCount(统计后的磁盘占用量))
                 * @param countMethod: 'MAX/SUM'，生成[item]Count 的方法
                 * @param sourceData: 需要处理的数据  eg：{'/分区1':{'host1':'hos1Data','host2':'host2Data'}}
                 **/
                function getMonitorItemData(item, countMethod, sourceData, unit) {
                    var dataName = item + 'Data',
                        countName = item + 'Count';
                    angular.forEach(sourceData, function (sigMonitorData, sigMonitorItem) {
                        // console.info(item, sigMonitorItem, sigMonitorData)
                        for (var key in sigMonitorData) {
                            if (sigMonitorData.hasOwnProperty(key) && key !== 'timeStamp' && monitorItemData[key]) {
                                var sigItemValue;
                                if (typeof unit !== 'undefined') {
                                    if (unit == '%') {
                                        sigItemValue = toDecimal(sigMonitorData[key], 2, unit);
                                    } else {
                                        sigItemValue = formartBytesData(sigMonitorData[key], unit);
                                    }
                                }
                                monitorItemData[key][dataName].push({
                                    item: sigMonitorItem,
                                    value: sigItemValue
                                });
                                if (monitorItemData[key][countName] === null && !sigMonitorData[key]) {
                                    continue;
                                }
                                if (countMethod == 'MAX') {
                                    if (sigMonitorData[key] > monitorItemData[key][countName]) {
                                        monitorItemData[key][countName] = sigMonitorData[key];
                                    }
                                } else if (countMethod == 'SUM') {
                                    monitorItemData[key][countName] += sigMonitorData[key];
                                    // console.info('SUM', key, countName, monitorItemData[key][countName])
                                }
                            }
                        }
                    });
                    if (typeof unit !== 'undefined') {
                        angular.forEach(monitorItemData, function (data) {
                            if (unit == '%') {
                                data[countName] = toDecimal(data[countName], 2);
                            } else {
                                data[countName] = formartBytesData(data[countName], unit);
                            }
                        });
                    }
                }

                if (monitorType == 'node') {
                    cpuBusy = monitorData.counterResults['cpu.busy'].slice(-3, -2)[0];
                    memPercet = monitorData.counterResults['mem.memused.percent'].slice(-3, -2)[0];
                    collectMonitorInfo = {
                        diskUsedMap: {},
                        diskReadMap: {},
                        diskWriteMap: {},
                        netInMap: {},
                        netOutMap: {}
                    };

                    for (i = 0, l = monitorItems.length; i < l; i++) {
                        monitorItemData[monitorItems[i]] = {
                            diskUsedData: [],
                            diskUsedCount: 0,
                            diskReadData: [],
                            diskReadCount: 0,
                            diskWriteData: [],
                            diskWriteCount: 0,
                            netInData: [],
                            netInCount: 0,
                            netOutData: [],
                            netOutCount: 0,
                            cpuBusyCount: toDecimal(cpuBusy[monitorItems[i]], 2),
                            memPercentCount: toDecimal(memPercet[monitorItems[i]], 2)
                        };
                    }
                    angular.forEach(monitorData.counterResults, function (value, key) {
                        var param = key.split('=')[1];
                        if (key.indexOf('df.bytes.used.percent') !== -1) {
                            // 取倒数第三个点，前两个点可能没有数据
                            collectMonitorInfo.diskUsedMap[param] = value.slice(-3, -2)[0];
                        } else if (key.indexOf('disk.io.read_bytes') !== -1) {
                            collectMonitorInfo.diskReadMap[param] = value.slice(-3, -2)[0];
                        } else if (key.indexOf('disk.io.write_bytes') !== -1) {
                            collectMonitorInfo.diskWriteMap[param] = value.slice(-3, -2)[0];
                        } else if (key.indexOf('net.if.in.bytes') !== -1) {
                            collectMonitorInfo.netInMap[param] = value.slice(-3, -2)[0];
                        } else if (key.indexOf('net.if.out.bytes') !== -1) {
                            collectMonitorInfo.netOutMap[param] = value.slice(-3, -2)[0];
                        }
                    });

                    getMonitorItemData('diskUsed', 'MAX', collectMonitorInfo.diskUsedMap, '%');
                    getMonitorItemData('diskRead', 'SUM', collectMonitorInfo.diskReadMap, 'KB');
                    getMonitorItemData('diskWrite', 'SUM', collectMonitorInfo.diskWriteMap, 'KB');
                    getMonitorItemData('netIn', 'SUM', collectMonitorInfo.netInMap, 'KB');
                    getMonitorItemData('netOut', 'SUM', collectMonitorInfo.netOutMap, 'KB');

                } else if (monitorType == 'pod' || monitorType == 'container') {
                    cpuBusy = monitorData.counterResults['container.cpu.usage.busy'].slice(-3, -2)[0];
                    memPercet = monitorData.counterResults['container.mem.usage.percent'].slice(-3, -2)[0];
                    collectMonitorInfo = {
                        netIn: monitorData.counterResults['container.net.if.in.bytes'].slice(-3, -2)[0],
                        netOut: monitorData.counterResults['container.net.if.out.bytes'].slice(-3, -2)[0]
                    };

                    for (i = 0, l = monitorItems.length; i < l; i++) {
                        monitorItemData[monitorItems[i]] = {
                            netInCount: formartBytesData(collectMonitorInfo.netIn[monitorItems[i]], 'KB'),
                            netOutCount: formartBytesData(collectMonitorInfo.netOut[monitorItems[i]], 'KB'),
                            cpuBusyCount: toDecimal(cpuBusy[monitorItems[i]], 2),
                            memPercentCount: toDecimal(memPercet[monitorItems[i]], 2)
                        };
                    }
                }
                defered.resolve(monitorItemData);
            }, function () {
                defered.reject();
            });
            return defered.promise;
        };
        return {
            getMonitorInfo: getMonitorInfo,
            getMonitorStatistical: getMonitorStatistical,
            storeMonitorTarget: storeMonitorTarget,
            getMonitorTarget: getMonitorTarget,
            getMonitorData: getMonitorData,
            toMonitorPage: toMonitorPage
        };
    }]);
})(angular.module('domeApp'));