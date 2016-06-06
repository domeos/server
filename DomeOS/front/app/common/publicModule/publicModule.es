/*
 * @description: 公共函数
 * @version: 0.1
 */
var publicModule = angular.module('publicModule', []);
publicModule.service('$util', ['$q', function ($q) {
        'use strict';
        //  is {}
        var isEmptyObject = function (obj) {
            for (var n in obj) {
                if (obj.hasOwnProperty(n)) {
                    return false;
                }
            }
            return true;
        };
        var getQueryString = function (name) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
            var r = window.location.search.substr(1).match(reg);
            if (r !== null) {
                return unescape(r[2]);
            }
            return null;
        };
        var toDecimal = function (data, number) {
            if (data === null || data === undefined || isNaN(data)) return data;
            if (typeof data !== 'number') {
                return parseFloat(parseFloat(data).toFixed(number));
            } else {
                return parseFloat(data.toFixed(number));
            }
        };
        var formartBytesData = function (data, unit) {
            if (data === undefined || data === null || isNaN(data)) return undefined;
            switch (unit) {
            case 'MB':
                data = (+data / 1024 / 1024).toFixed(2);
                break;
            case 'GB':
                data = (+data / 1024 / 1024 / 1024).toFixed(2);
                break;
            case 'KB':
                data = (+data / 1024).toFixed(2);
                break;
            default:
                data = +data.toFixed(2);
                break;
            }
            return +data;
        };
        // @param str:<span>{{#name}}</span><p>{{#age}}</p>
        // @param data:{name:'chandra',age:12,addr:'china'}
        // @return <span>chandra</span><p>12</p>
        var parseTpl = function (str, data) {
            var result;
            var patt = new RegExp('\{\#([a-zA-z0-9]+)\}');
            while ((result = patt.exec(str)) !== null) {
                var v = data[result[1]] === 0 ? '0' : data[result[1]] || '';
                str = str.replace(new RegExp(result[0], 'g'), v);
            }
            return str;
        };
        var objLength = function (obj) {
            var size = 0,
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    size++;
                }
            }
            return size;
        };
        // obj is null or {}
        var isNullorEmpty = function (obj) {
            if (!obj || obj && isEmptyObject(obj)) {
                return true;
            }
            return false;
        };
        var calculateDate = function (startDate, dayInterval) {
            startDate = new Date(startDate);
            startDate.setDate(startDate.getDate() + dayInterval); //get the date after dayInterval days or before dayInterval days,such as after 2 days, after 3 days, before 2 days , before 3 days and so on
            var y = startDate.getFullYear();
            var m = startDate.getMonth() + 1;
            if (m < 10) m = '0' + m;
            var d = startDate.getDate();
            if (d < 10) d = '0' + d;
            return y + '-' + m + '-' + d;
        };
        //  interval between now and seconds
        var getDateInterval = function (start, end, isNeedSeconds) {
            var res = {};
            if (end === undefined) end = new Date().getTime();
            var interval = end - start;
            res.day = Math.floor(interval / (24 * 3600 * 1000));
            interval -= res.day * 24 * 3600 * 1000;
            res.hours = Math.floor(interval / (3600 * 1000));
            interval -= res.hours * 3600 * 1000;
            res.mimutes = Math.floor(interval / (60 * 1000));
            if (isNeedSeconds) {
                interval -= res.mimutes * 60 * 1000;
                res.seconds = Math.floor(interval / 1000);
            }
            return res;
        };
        var getPageInterval = function (start, end) {
            var str = '',
                intervalTime;
            if (!start || !end || end - start <= 0) {
                str = '0秒';
            } else {
                intervalTime = getDateInterval(start, end, true);
                if (intervalTime.day !== 0) {
                    str += intervalTime.day + '天';
                }
                if (intervalTime.hours !== 0) {
                    str += intervalTime.hours + '小时';
                }
                if (intervalTime.mimutes !== 0) {
                    str += intervalTime.mimutes + '分钟';
                }
                if (intervalTime.seconds !== 0) {
                    str += intervalTime.seconds + '秒';
                }
                if (str === '') {
                    str = '0秒';
                }
            }
            return str;
        };
        var getPageDate = function (start, end, isNeedSeconds) {
            if (!start && !end || start - end <= 0) {
                return '无';
            }
            var interval = getDateInterval(start, end, isNeedSeconds);
            var day = interval.day;
            var hours = interval.hours;
            var mimutes = interval.mimutes;
            var res;
            // 客户端时间和服务器时间不统一造成的负数情况
            if (day < 0 || hours < 0 || mimutes < 0) {
                res = '刚刚';
            } else if (day > 60) {
                res = '更早';
            } else if (day > 30) {
                res = '一个月前';
            } else if (day > 3) {
                res = day + '天前';
            } else if (day == 3) {
                res = '三天前';
            } else if (day == 2) {
                res = '两天前';
            } else if (day == 1) {
                res = '昨天';
            } else {
                if (hours >= 1) {
                    res = hours + '小时前';
                } else {
                    if (mimutes === 0) {
                        res = '刚刚';
                    } else {
                        res = mimutes + '分钟前';
                    }
                }
            }
            return res;
        };
        var loadJs = function (path) {
            var delay = $q.defer();
            $.getScript(path, function () {
                delay.resolve();
            });
            return delay.promise;
        };
        return {
            isEmptyObject: isEmptyObject,
            parseTpl: parseTpl,
            toDecimal: toDecimal,
            formartBytesData: formartBytesData,
            getQueryString: getQueryString,
            objLength: objLength,
            isNullorEmpty: isNullorEmpty,
            calculateDate: calculateDate,
            getPageInterval: getPageInterval,
            getDateInterval: getDateInterval,
            getPageDate: getPageDate,
            loadJs: loadJs
        };
    }])
    .factory('$domeModel', ['$http', function ($http) {
        'use strict';
        var getWholeUrl = function (url, params) {
            var wholeUrl = url,
                i;
            for (i = 0; i < params.length; i++) {
                wholeUrl += '/' + params[i];
            }
            return wholeUrl;
        };
        // 具有选择功能的Class，包括选择单项、全选、全不选
        // @param selectListName: 选择项的list对象的key的名字.eg:传入’hostList‘实例化后如{hostList:[{....}]}
        class SelectListModel {
            constructor(selectListName) {
                this.selectListName = selectListName ? selectListName : 'selectList';
                // 是否全选
                this.isCheckAll = false;
                // 选择项数量统计
                this.selectedCount = 0;
                this[this.selectListName] = [];
            }
            init(selectList, isSelected) {
                this.isCheckAll = false;
                this.selectedCount = 0;
                this[this.selectListName] = (() => {
                    if (!selectList || selectList.length === 0) {
                        return [];
                    } else {
                        if (typeof selectList[0] === 'object') {
                            for (let i = 0; i < selectList.length; i++) {
                                selectList[i].keyFilter = true;
                                if (isSelected !== undefined) selectList[i].isSelected = isSelected;
                                if (selectList[i].isSelected) this.selectedCount++;
                            }
                        } else {
                            for (let i = 0; i < selectList.length; i++) {
                                selectList[i] = {
                                    item: selectList[i],
                                    keyFilter: true,
                                    isSelected: isSelected
                                };
                                if (isSelected !== undefined) selectList[i].isSelected = isSelected;
                                if (selectList[i].isSelected) this.selectedCount++;
                            }
                        }
                        if (this.selectedCount === selectList.length) this.isCheckAll = true;
                        return selectList;
                    }
                })();
            }
            toggleCheck(item, isSelected) {
                    let isAllHasChange = true;
                    item.isSelected = isSelected;
                    if (isSelected) {
                        this.selectedCount++;
                        let selectList = this[this.selectListName];
                        // 是否为全选
                        for (let sigItem of selectList) {
                            if (sigItem.keyFilter && !sigItem.isSelected) {
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
            checkAllItem(isCheckAll) {
                this.isCheckAll = isCheckAll === undefined ? this.isCheckAll : isCheckAll;
                this.selectedCount = 0;
                let selectList = this[this.selectListName];
                for (let sigItem of selectList) {
                    if (sigItem.keyFilter && this.isCheckAll) {
                        sigItem.isSelected = true;
                        this.selectedCount++;
                    } else {
                        sigItem.isSelected = false;
                    }
                }
            }
            filterWithKey(keywords, filterItem) {
                this.isCheckAll = false;
                this.selectedCount = 0;
                if (filterItem === undefined) {
                    filterItem = 'item';
                }
                let selectList = this[this.selectListName];
                // 如果没有对应的key
                if (selectList[0][filterItem] === undefined) {
                    return;
                }
                for (let sigItem of selectList) {
                    sigItem.isSelected = false;
                    sigItem.keyFilter = sigItem[filterItem].indexOf(keywords) !== -1;
                }
            }

        }

        let ServiceModel = function (url) {
            var self = this;
            self.getData = function () {
                return $http.get(getWholeUrl(url, arguments));
            };
            self.setData = function (data, config) {
                return $http.post(url, data, config);
            };
            self.updateData = function (data) {
                return $http.put(url, data);
            };
            self.deleteData = function () {
                return $http.delete(getWholeUrl(url, arguments));
            };
        };
        var instancesCreator = function (classMap) {
            if (!classMap) classMap = {};
            return function (className, ...args) {
                return function () {
                    var ins, func = classMap[className];
                    if (func && typeof func == 'function') {
                        ins = new func(...args);
                    } else {
                        ins = {};
                        console.log('error:there is no ' + className);
                    }
                    return ins;
                }();
            };
        };
        return {
            SelectListModel: SelectListModel,
            ServiceModel: ServiceModel,
            instancesCreator: instancesCreator
        };
    }])
    // 数据存储service
    .provider('$domeData', function () {
        'use strict';
        var data = {};
        var setData = function (key, value) {
            data[key] = value;
        };
        var getData = function (key) {
            return data[key];
        };
        var delData = function (key) {
            if (data[key]) {
                data[key] = null;
            }
        };
        return {
            setData: setData,
            $get: function () {
                return {
                    setData: setData,
                    getData: getData,
                    delData: delData
                };
            }
        };
    });