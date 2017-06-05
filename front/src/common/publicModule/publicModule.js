/*
 * @author ChandraLee
 * @description 公共模块
 */
/* jshint esversion: 6 */
/* globals angular */
(function (window) {
    let publicModule = angular.module('publicModule', []);
    publicModule.service('$util', ['$q', function ($q) {
            'use strict';
            const isArray = array => Object.prototype.toString.call(array) === '[object Array]';
            const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]';
            //  is {}
            const isEmptyObject = obj => {
                if (!isObject(obj)) {
                    return;
                }
                for (let n in obj) {
                    if (obj.hasOwnProperty(n)) {
                        return false;
                    }
                }
                return true;
            };
            const getQueryString = name => {
                let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
                let r = window.location.search.substr(1).match(reg);
                if (r !== null) {
                    return unescape(r[2]);
                }
                return null;
            };
            const toDecimal = (data, number) => {
                if (data === null || isNaN(data)) return void 0;
                return +parseFloat(data).toFixed(number);
            };
            const formartBytesData = (data, unit) => {
                if (data === null || isNaN(data)) return void 0;
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
                    data = data.toFixed(2);
                    break;
                }
                return +data;
            };
            const formatMBytesData = (data) => {
                if(data === null || isNaN(data)) {
                    return void 0;
                }
                let thisData;
                if(data >= 0 && data < 1024) {
                    thisData = data.toFixed(2) + 'MB';
                } else if (data >= 1024) {
                    thisData = (data / 1024).toFixed(2) + 'GB';
                }
                return thisData;
            };
            // @param str:<span>{{#name}}</span><p>{{#age}}</p>
            // @param data:{name:'chandra',age:12,addr:'china'}
            // @return <span>chandra</span><p>12</p>
            const parseTpl = (str, data) => {
                let result;
                let patt = new RegExp('\{\#([a-zA-z0-9]+)\}');
                while ((result = patt.exec(str)) !== null) {
                    let v = data[result[1]] === 0 ? '0' : data[result[1]] || '';
                    str = str.replace(new RegExp(result[0], 'g'), v);
                }
                return str;
            };
            
            const calculateDate = (startDate, dayInterval) => {
                startDate = new Date(startDate);
                startDate.setDate(startDate.getDate() + dayInterval); //get the date after dayInterval days or before dayInterval days,such as after 2 days, after 3 days, before 2 days , before 3 days and so on
                let y = startDate.getFullYear(),
                    m = startDate.getMonth() + 1,
                    d = startDate.getDate();
                if (m < 10) m = '0' + m;
                if (d < 10) d = '0' + d;
                return y + '-' + m + '-' + d;
            };
            //  interval between now and seconds
            const getDateInterval = (start, end, isNeedSeconds) => {
                let res = {};
                if (typeof end === 'undefined') end = new Date().getTime();
                let interval = end - start;
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
            const getPageInterval = (start, end) => {
                let str = '',
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
            const getPageDate = (start, end, isNeedSeconds) => {
                if (!start && !end || start - end <= 0) {
                    return '无';
                }
                const interval = getDateInterval(start, end, isNeedSeconds),
                    day = interval.day,
                    hours = interval.hours,
                    mimutes = interval.mimutes;
                let res;
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
            const loadJs = function (path) {
                let delay = $q.defer();
                $.getScript(path, function () {
                    delay.resolve();
                });
                return delay.promise;
            };
            const Base64 = {
                encode(s) {
                    return btoa(unescape(encodeURIComponent(s)));
                },
                decode(s) {
                    return decodeURIComponent(escape(atob(s)));
                }
            };
            return {
                isEmptyObject: isEmptyObject,
                isArray: isArray,
                isObject: isObject,
                parseTpl: parseTpl,
                toDecimal: toDecimal,
                formartBytesData: formartBytesData,
                formatMBytesData: formatMBytesData,
                getQueryString: getQueryString,
                calculateDate: calculateDate,
                getPageInterval: getPageInterval,
                getDateInterval: getDateInterval,
                getPageDate: getPageDate,
                loadJs: loadJs,
                Base64: Base64
            };
        }])
        .factory('$domeModel', ['$http', function ($http) {
            'use strict';
            const getWholeUrl = (url, ...params) => {
                let wholeUrl = url,
                    args = [...params];
                for (let i = 0, l = args.length; i < l; i++) {
                    wholeUrl += '/' + args[i];
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
                            if (Object.prototype.toString.call(selectList[0]) === '[object Object]') {
                                for (let item of selectList) {
                                    item.keyFilter = true;
                                    if (typeof isSelected !== 'undefined') item.isSelected = isSelected;
                                    if (item.isSelected) this.selectedCount++;
                                }
                            } else {
                                for (let i = 0, l = selectList.length; i < l; i++) {
                                    selectList[i] = {
                                        item: selectList[i],
                                        keyFilter: true,
                                        isSelected: isSelected
                                    };
                                    if (typeof isSelected !== 'undefined') selectList[i].isSelected = isSelected;
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
                    this.isCheckAll = typeof isCheckAll === 'undefined' ? this.isCheckAll : isCheckAll;
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
                    if (typeof filterItem === 'undefined') {
                        filterItem = 'item';
                    }
                    let selectList = this[this.selectListName];
                    // 如果没有对应的key
                    if (selectList[0][filterItem] === void 0) {
                        return;
                    }
                    for (let sigItem of selectList) {
                        sigItem.isSelected = false;
                        sigItem.keyFilter = sigItem[filterItem].indexOf(keywords) !== -1;
                    }
                }

            }

            const ServiceModel = function (url) {
                this.getData = (...args) => $http.get(getWholeUrl(url, ...args));
                this.setData = (data, config) => $http.post(url, data, config);
                this.updateData = data => $http.put(url, data);
                this.deleteData = (...args) => $http.delete(getWholeUrl(url, ...args));
            };
            const instancesCreator = classMap => {
                if (!classMap) classMap = {};
                return (className, ...args) => {
                    let ins, func = classMap[className];
                    if (typeof func == 'function') {
                        ins = new func(...args);
                    } else {
                        ins = {};
                        console.log('error:there is no ' + className);
                    }
                    return ins;
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
            let data = {};
            const setData = (key, value) => {
                data[key] = value;
            };
            const getData = key => data[key];
            const delData = key => {
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
    window.publicModule = publicModule;
})(window);