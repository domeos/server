'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @author ChandraLee
 * @description 公共模块
 */

(function (window, undefined) {
    var publicModule = angular.module('publicModule', []);
    publicModule.service('$util', ['$q', function ($q) {
        'use strict';

        var isArray = function isArray(array) {
            return Object.prototype.toString.call(array) === '[object Array]';
        };
        var isObject = function isObject(obj) {
            return Object.prototype.toString.call(obj) === '[object Object]';
        };
        //  is {}
        var isEmptyObject = function isEmptyObject(obj) {
            if (!isObject(obj)) {
                return;
            }
            for (var n in obj) {
                if (obj.hasOwnProperty(n)) {
                    return false;
                }
            }
            return true;
        };
        var getQueryString = function getQueryString(name) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
            var r = window.location.search.substr(1).match(reg);
            if (r !== null) {
                return unescape(r[2]);
            }
            return null;
        };
        var toDecimal = function toDecimal(data, number) {
            if (data === null || isNaN(data)) return void 0;
            return +parseFloat(data).toFixed(number);
        };
        var formartBytesData = function formartBytesData(data, unit) {
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
        var formatMBytesData = function formatMBytesData(data) {
            if (data === null || isNaN(data)) {
                return void 0;
            }
            var thisData = void 0;
            if (data >= 0 && data < 1024) {
                thisData = data.toFixed(2) + 'MB';
            } else if (data >= 1024) {
                thisData = (data / 1024).toFixed(2) + 'GB';
            }
            return thisData;
        };
        // @param str:<span>{{#name}}</span><p>{{#age}}</p>
        // @param data:{name:'chandra',age:12,addr:'china'}
        // @return <span>chandra</span><p>12</p>
        var parseTpl = function parseTpl(str, data) {
            var result = void 0;
            var patt = new RegExp('\{\#([a-zA-z0-9]+)\}');
            while ((result = patt.exec(str)) !== null) {
                var v = data[result[1]] === 0 ? '0' : data[result[1]] || '';
                str = str.replace(new RegExp(result[0], 'g'), v);
            }
            return str;
        };
        var objLength = function objLength(obj) {
            if (!isObject(obj)) return 0;
            return Object.keys(obj).length;
        };
        var getFormatDate = function getFormatDate(seconds, summary) {
            if (!seconds || seconds <= 0) {
                return '无';
            }
            var date = new Date(seconds);
            var yyyy = date.getFullYear() + '-';
            var MM = (date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
            var dd = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
            var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
            var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
            var ss = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
            if (typeof summary === 'undefined') {
                return yyyy + MM + dd + hh + mm + ss;
            } else if (summary === 'summary') {
                return yyyy + MM + dd;
            } else {
                return '无';
            }
        };
        var calculateDate = function calculateDate(startDate, dayInterval) {
            startDate = new Date(startDate);
            startDate.setDate(startDate.getDate() + dayInterval); //get the date after dayInterval days or before dayInterval days,such as after 2 days, after 3 days, before 2 days , before 3 days and so on
            var y = startDate.getFullYear(),
                m = startDate.getMonth() + 1,
                d = startDate.getDate();
            if (m < 10) m = '0' + m;
            if (d < 10) d = '0' + d;
            return y + '-' + m + '-' + d;
        };
        //  interval between now and seconds
        var getDateInterval = function getDateInterval(start, end, isNeedSeconds) {
            var res = {};
            if (typeof end === 'undefined') end = new Date().getTime();
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
        var getPageInterval = function getPageInterval(start, end) {
            var str = '',
                intervalTime = void 0;
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
        var getPageDate = function getPageDate(start, end, isNeedSeconds) {
            if (!start && !end || start - end <= 0) {
                return '无';
            }
            var interval = getDateInterval(start, end, isNeedSeconds),
                day = interval.day,
                hours = interval.hours,
                mimutes = interval.mimutes;
            var res = void 0;
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
        var loadJs = function loadJs(path) {
            var delay = $q.defer();
            $.getScript(path, function () {
                delay.resolve();
            });
            return delay.promise;
        };
        var Base64 = {
            encode: function encode(s) {
                return btoa(unescape(encodeURIComponent(s)));
            },
            decode: function decode(s) {
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
            objLength: objLength,
            calculateDate: calculateDate,
            getPageInterval: getPageInterval,
            getDateInterval: getDateInterval,
            getPageDate: getPageDate,
            getFormatDate: getFormatDate,
            loadJs: loadJs,
            Base64: Base64
        };
    }]).factory('$domeModel', ['$http', function ($http) {
        'use strict';

        var getWholeUrl = function getWholeUrl(url) {
            for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                params[_key - 1] = arguments[_key];
            }

            var wholeUrl = url,
                args = [].concat(params);
            for (var i = 0, l = args.length; i < l; i++) {
                wholeUrl += '/' + args[i];
            }
            return wholeUrl;
        };
        // 具有选择功能的Class，包括选择单项、全选、全不选
        // @param selectListName: 选择项的list对象的key的名字.eg:传入’hostList‘实例化后如{hostList:[{....}]}

        var SelectListModel = function () {
            function SelectListModel(selectListName) {
                _classCallCheck(this, SelectListModel);

                this.selectListName = selectListName ? selectListName : 'selectList';
                // 是否全选
                this.isCheckAll = false;
                // 选择项数量统计
                this.selectedCount = 0;
                this[this.selectListName] = [];
            }

            _createClass(SelectListModel, [{
                key: 'init',
                value: function init(selectList, isSelected) {
                    var _this = this;

                    this.isCheckAll = false;
                    this.selectedCount = 0;
                    this[this.selectListName] = function () {
                        if (!selectList || selectList.length === 0) {
                            return [];
                        } else {
                            if (Object.prototype.toString.call(selectList[0]) === '[object Object]') {
                                var _iteratorNormalCompletion = true;
                                var _didIteratorError = false;
                                var _iteratorError = undefined;

                                try {
                                    for (var _iterator = selectList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                        var item = _step.value;

                                        item.keyFilter = true;
                                        if (typeof isSelected !== 'undefined') item.isSelected = isSelected;
                                        if (item.isSelected) _this.selectedCount++;
                                    }
                                } catch (err) {
                                    _didIteratorError = true;
                                    _iteratorError = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion && _iterator.return) {
                                            _iterator.return();
                                        }
                                    } finally {
                                        if (_didIteratorError) {
                                            throw _iteratorError;
                                        }
                                    }
                                }
                            } else {
                                for (var i = 0, l = selectList.length; i < l; i++) {
                                    selectList[i] = {
                                        item: selectList[i],
                                        keyFilter: true,
                                        isSelected: isSelected
                                    };
                                    if (typeof isSelected !== 'undefined') selectList[i].isSelected = isSelected;
                                    if (selectList[i].isSelected) _this.selectedCount++;
                                }
                            }
                            if (_this.selectedCount === selectList.length) _this.isCheckAll = true;
                            return selectList;
                        }
                    }();
                }
            }, {
                key: 'toggleCheck',
                value: function toggleCheck(item, isSelected) {
                    var isAllHasChange = true;
                    item.isSelected = isSelected;
                    if (isSelected) {
                        this.selectedCount++;
                        var selectList = this[this.selectListName];
                        // 是否为全选
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = selectList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var sigItem = _step2.value;

                                if (sigItem.keyFilter && !sigItem.isSelected) {
                                    isAllHasChange = false;
                                    break;
                                }
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
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

            }, {
                key: 'checkAllItem',
                value: function checkAllItem(isCheckAll) {
                    this.isCheckAll = typeof isCheckAll === 'undefined' ? this.isCheckAll : isCheckAll;
                    this.selectedCount = 0;
                    var selectList = this[this.selectListName];
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = selectList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var sigItem = _step3.value;

                            if (sigItem.keyFilter && this.isCheckAll) {
                                sigItem.isSelected = true;
                                this.selectedCount++;
                            } else {
                                sigItem.isSelected = false;
                            }
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                _iterator3.return();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }
                }
            }, {
                key: 'filterWithKey',
                value: function filterWithKey(keywords, filterItem) {
                    this.isCheckAll = false;
                    this.selectedCount = 0;
                    if (typeof filterItem === 'undefined') {
                        filterItem = 'item';
                    }
                    var selectList = this[this.selectListName];
                    // 如果没有对应的key
                    if (selectList[0][filterItem] === void 0) {
                        return;
                    }
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = selectList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var sigItem = _step4.value;

                            sigItem.isSelected = false;
                            sigItem.keyFilter = sigItem[filterItem].indexOf(keywords) !== -1;
                        }
                    } catch (err) {
                        _didIteratorError4 = true;
                        _iteratorError4 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                _iterator4.return();
                            }
                        } finally {
                            if (_didIteratorError4) {
                                throw _iteratorError4;
                            }
                        }
                    }
                }
            }]);

            return SelectListModel;
        }();

        var ServiceModel = function ServiceModel(url) {
            this.getData = function () {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                return $http.get(getWholeUrl.apply(undefined, [url].concat(args)));
            };
            this.setData = function (data, config) {
                return $http.post(url, data, config);
            };
            this.updateData = function (data) {
                return $http.put(url, data);
            };
            this.deleteData = function () {
                for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    args[_key3] = arguments[_key3];
                }

                return $http.delete(getWholeUrl.apply(undefined, [url].concat(args)));
            };
        };
        var instancesCreator = function instancesCreator(classMap) {
            if (!classMap) classMap = {};
            return function (className) {
                for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                    args[_key4 - 1] = arguments[_key4];
                }

                var ins = void 0,
                    func = classMap[className];
                if (typeof func == 'function') {
                    ins = new (Function.prototype.bind.apply(func, [null].concat(args)))();
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

        var data = {};
        var setData = function setData(key, value) {
            data[key] = value;
        };
        var getData = function getData(key) {
            return data[key];
        };
        var delData = function delData(key) {
            if (data[key]) {
                data[key] = null;
            }
        };
        return {
            setData: setData,
            $get: function $get() {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9wdWJsaWNNb2R1bGUvcHVibGljTW9kdWxlLmVzIl0sIm5hbWVzIjpbIndpbmRvdyIsInVuZGVmaW5lZCIsInB1YmxpY01vZHVsZSIsImFuZ3VsYXIiLCJtb2R1bGUiLCJzZXJ2aWNlIiwiJHEiLCJpc0FycmF5IiwiT2JqZWN0IiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwiYXJyYXkiLCJpc09iamVjdCIsIm9iaiIsImlzRW1wdHlPYmplY3QiLCJuIiwiaGFzT3duUHJvcGVydHkiLCJnZXRRdWVyeVN0cmluZyIsInJlZyIsIlJlZ0V4cCIsIm5hbWUiLCJyIiwibG9jYXRpb24iLCJzZWFyY2giLCJzdWJzdHIiLCJtYXRjaCIsInVuZXNjYXBlIiwidG9EZWNpbWFsIiwiZGF0YSIsIm51bWJlciIsImlzTmFOIiwicGFyc2VGbG9hdCIsInRvRml4ZWQiLCJmb3JtYXJ0Qnl0ZXNEYXRhIiwidW5pdCIsImZvcm1hdE1CeXRlc0RhdGEiLCJ0aGlzRGF0YSIsInBhcnNlVHBsIiwic3RyIiwicmVzdWx0IiwicGF0dCIsImV4ZWMiLCJ2IiwicmVwbGFjZSIsIm9iakxlbmd0aCIsImtleXMiLCJsZW5ndGgiLCJnZXRGb3JtYXREYXRlIiwic2Vjb25kcyIsInN1bW1hcnkiLCJkYXRlIiwiRGF0ZSIsInl5eXkiLCJnZXRGdWxsWWVhciIsIk1NIiwiZ2V0TW9udGgiLCJkZCIsImdldERhdGUiLCJoaCIsImdldEhvdXJzIiwibW0iLCJnZXRNaW51dGVzIiwic3MiLCJnZXRTZWNvbmRzIiwiY2FsY3VsYXRlRGF0ZSIsInN0YXJ0RGF0ZSIsImRheUludGVydmFsIiwic2V0RGF0ZSIsInkiLCJtIiwiZCIsImdldERhdGVJbnRlcnZhbCIsInN0YXJ0IiwiZW5kIiwiaXNOZWVkU2Vjb25kcyIsInJlcyIsImdldFRpbWUiLCJpbnRlcnZhbCIsImRheSIsIk1hdGgiLCJmbG9vciIsImhvdXJzIiwibWltdXRlcyIsImdldFBhZ2VJbnRlcnZhbCIsImludGVydmFsVGltZSIsImdldFBhZ2VEYXRlIiwibG9hZEpzIiwicGF0aCIsImRlbGF5IiwiZGVmZXIiLCIkIiwiZ2V0U2NyaXB0IiwicmVzb2x2ZSIsInByb21pc2UiLCJCYXNlNjQiLCJlbmNvZGUiLCJzIiwiYnRvYSIsImVuY29kZVVSSUNvbXBvbmVudCIsImRlY29kZSIsImRlY29kZVVSSUNvbXBvbmVudCIsImVzY2FwZSIsImF0b2IiLCJmYWN0b3J5IiwiJGh0dHAiLCJnZXRXaG9sZVVybCIsInVybCIsInBhcmFtcyIsIndob2xlVXJsIiwiYXJncyIsImkiLCJsIiwiU2VsZWN0TGlzdE1vZGVsIiwic2VsZWN0TGlzdE5hbWUiLCJpc0NoZWNrQWxsIiwic2VsZWN0ZWRDb3VudCIsInNlbGVjdExpc3QiLCJpc1NlbGVjdGVkIiwiaXRlbSIsImtleUZpbHRlciIsImlzQWxsSGFzQ2hhbmdlIiwic2lnSXRlbSIsImtleXdvcmRzIiwiZmlsdGVySXRlbSIsImluZGV4T2YiLCJTZXJ2aWNlTW9kZWwiLCJnZXREYXRhIiwiZ2V0Iiwic2V0RGF0YSIsImNvbmZpZyIsInBvc3QiLCJ1cGRhdGVEYXRhIiwicHV0IiwiZGVsZXRlRGF0YSIsImRlbGV0ZSIsImluc3RhbmNlc0NyZWF0b3IiLCJjbGFzc01hcCIsImNsYXNzTmFtZSIsImlucyIsImZ1bmMiLCJjb25zb2xlIiwibG9nIiwicHJvdmlkZXIiLCJrZXkiLCJ2YWx1ZSIsImRlbERhdGEiLCIkZ2V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7QUFLQSxDQUFDLFVBQVVBLE1BQVYsRUFBa0JDLFNBQWxCLEVBQTZCO0FBQzFCLFFBQUlDLGVBQWVDLFFBQVFDLE1BQVIsQ0FBZSxjQUFmLEVBQStCLEVBQS9CLENBQW5CO0FBQ0FGLGlCQUFhRyxPQUFiLENBQXFCLE9BQXJCLEVBQThCLENBQUMsSUFBRCxFQUFPLFVBQVVDLEVBQVYsRUFBYztBQUMzQzs7QUFDQSxZQUFNQyxVQUFVLFNBQVZBLE9BQVU7QUFBQSxtQkFBU0MsT0FBT0MsU0FBUCxDQUFpQkMsUUFBakIs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RUFvWEdGLE1BcFhIIiwiZmlsZSI6ImNvbW1vbi9wdWJsaWNNb2R1bGUvcHVibGljTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIEBhdXRob3IgQ2hhbmRyYUxlZVxuICogQGRlc2NyaXB0aW9uIOWFrOWFseaooeWdl1xuICovXG5cbihmdW5jdGlvbiAod2luZG93LCB1bmRlZmluZWQpIHtcbiAgICBsZXQgcHVibGljTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3B1YmxpY01vZHVsZScsIFtdKTtcbiAgICBwdWJsaWNNb2R1bGUuc2VydmljZSgnJHV0aWwnLCBbJyRxJywgZnVuY3Rpb24gKCRxKSB7XG4gICAgICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgICAgICBjb25zdCBpc0FycmF5ID0gYXJyYXkgPT4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycmF5KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICAgICAgICAgIGNvbnN0IGlzT2JqZWN0ID0gb2JqID0+IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBPYmplY3RdJztcbiAgICAgICAgICAgIC8vICBpcyB7fVxuICAgICAgICAgICAgY29uc3QgaXNFbXB0eU9iamVjdCA9IG9iaiA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc09iamVjdChvYmopKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbiBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShuKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IGdldFF1ZXJ5U3RyaW5nID0gbmFtZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHJlZyA9IG5ldyBSZWdFeHAoJyhefCYpJyArIG5hbWUgKyAnPShbXiZdKikoJnwkKScsICdpJyk7XG4gICAgICAgICAgICAgICAgbGV0IHIgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cigxKS5tYXRjaChyZWcpO1xuICAgICAgICAgICAgICAgIGlmIChyICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmVzY2FwZShyWzJdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgdG9EZWNpbWFsID0gKGRhdGEsIG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhID09PSBudWxsIHx8IGlzTmFOKGRhdGEpKSByZXR1cm4gdm9pZCAwO1xuICAgICAgICAgICAgICAgIHJldHVybiArcGFyc2VGbG9hdChkYXRhKS50b0ZpeGVkKG51bWJlcik7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgZm9ybWFydEJ5dGVzRGF0YSA9IChkYXRhLCB1bml0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEgPT09IG51bGwgfHwgaXNOYU4oZGF0YSkpIHJldHVybiB2b2lkIDA7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh1bml0KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnTUInOlxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gKCtkYXRhIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0dCJzpcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9ICgrZGF0YSAvIDEwMjQgLyAxMDI0IC8gMTAyNCkudG9GaXhlZCgyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnS0InOlxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gKCtkYXRhIC8gMTAyNCkudG9GaXhlZCgyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEudG9GaXhlZCgyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiArZGF0YTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBmb3JtYXRNQnl0ZXNEYXRhID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBpZihkYXRhID09PSBudWxsIHx8IGlzTmFOKGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCB0aGlzRGF0YTtcbiAgICAgICAgICAgICAgICBpZihkYXRhID49IDAgJiYgZGF0YSA8IDEwMjQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpc0RhdGEgPSBkYXRhLnRvRml4ZWQoMikgKyAnTUInO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YSA+PSAxMDI0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNEYXRhID0gKGRhdGEgLyAxMDI0KS50b0ZpeGVkKDIpICsgJ0dCJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNEYXRhO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIEBwYXJhbSBzdHI6PHNwYW4+e3sjbmFtZX19PC9zcGFuPjxwPnt7I2FnZX19PC9wPlxuICAgICAgICAgICAgLy8gQHBhcmFtIGRhdGE6e25hbWU6J2NoYW5kcmEnLGFnZToxMixhZGRyOidjaGluYSd9XG4gICAgICAgICAgICAvLyBAcmV0dXJuIDxzcGFuPmNoYW5kcmE8L3NwYW4+PHA+MTI8L3A+XG4gICAgICAgICAgICBjb25zdCBwYXJzZVRwbCA9IChzdHIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICAgICAgICAgIGxldCBwYXR0ID0gbmV3IFJlZ0V4cCgnXFx7XFwjKFthLXpBLXowLTldKylcXH0nKTtcbiAgICAgICAgICAgICAgICB3aGlsZSAoKHJlc3VsdCA9IHBhdHQuZXhlYyhzdHIpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdiA9IGRhdGFbcmVzdWx0WzFdXSA9PT0gMCA/ICcwJyA6IGRhdGFbcmVzdWx0WzFdXSB8fCAnJztcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cChyZXN1bHRbMF0sICdnJyksIHYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IG9iakxlbmd0aCA9IG9iaiA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGg7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgZ2V0Rm9ybWF0RGF0ZSA9IChzZWNvbmRzLHN1bW1hcnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXNlY29uZHMgfHwgc2Vjb25kcyA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAn5pegJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShzZWNvbmRzKTtcbiAgICAgICAgICAgICAgICB2YXIgeXl5eSA9IGRhdGUuZ2V0RnVsbFllYXIoKSArICctJztcbiAgICAgICAgICAgICAgICB2YXIgTU0gPSAoZGF0ZS5nZXRNb250aCgpIDwgOSA/ICcwJyArIChkYXRlLmdldE1vbnRoKCkrMSkgOiBkYXRlLmdldE1vbnRoKCkrMSkgKyAnLSc7XG4gICAgICAgICAgICAgICAgdmFyIGRkID0gKGRhdGUuZ2V0RGF0ZSgpIDwgMTAgPyAnMCcgKyBkYXRlLmdldERhdGUoKSA6IGRhdGUuZ2V0RGF0ZSgpKSArICcgJztcbiAgICAgICAgICAgICAgICB2YXIgaGggPSAoZGF0ZS5nZXRIb3VycygpIDwgMTAgPyAnMCcgKyBkYXRlLmdldEhvdXJzKCkgOiBkYXRlLmdldEhvdXJzKCkpICsgJzonO1xuICAgICAgICAgICAgICAgIHZhciBtbSA9IChkYXRlLmdldE1pbnV0ZXMoKSA8IDEwID8gJzAnICsgZGF0ZS5nZXRNaW51dGVzKCkgOiBkYXRlLmdldE1pbnV0ZXMoKSkgKyAnOic7XG4gICAgICAgICAgICAgICAgdmFyIHNzID0gZGF0ZS5nZXRTZWNvbmRzKCkgPCAxMCA/ICcwJyArIGRhdGUuZ2V0U2Vjb25kcygpIDogZGF0ZS5nZXRTZWNvbmRzKCk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzdW1tYXJ5ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geXl5eSArIE1NICsgZGQgKyBoaCArIG1tICsgc3M7XG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKHN1bW1hcnkgPT09ICdzdW1tYXJ5Jykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geXl5eSArIE1NICsgZGQ7XG4gICAgICAgICAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ+aXoCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IGNhbGN1bGF0ZURhdGUgPSAoc3RhcnREYXRlLCBkYXlJbnRlcnZhbCkgPT4ge1xuICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZSA9IG5ldyBEYXRlKHN0YXJ0RGF0ZSk7XG4gICAgICAgICAgICAgICAgc3RhcnREYXRlLnNldERhdGUoc3RhcnREYXRlLmdldERhdGUoKSArIGRheUludGVydmFsKTsgLy9nZXQgdGhlIGRhdGUgYWZ0ZXIgZGF5SW50ZXJ2YWwgZGF5cyBvciBiZWZvcmUgZGF5SW50ZXJ2YWwgZGF5cyxzdWNoIGFzIGFmdGVyIDIgZGF5cywgYWZ0ZXIgMyBkYXlzLCBiZWZvcmUgMiBkYXlzICwgYmVmb3JlIDMgZGF5cyBhbmQgc28gb25cbiAgICAgICAgICAgICAgICBsZXQgeSA9IHN0YXJ0RGF0ZS5nZXRGdWxsWWVhcigpLFxuICAgICAgICAgICAgICAgICAgICBtID0gc3RhcnREYXRlLmdldE1vbnRoKCkgKyAxLFxuICAgICAgICAgICAgICAgICAgICBkID0gc3RhcnREYXRlLmdldERhdGUoKTtcbiAgICAgICAgICAgICAgICBpZiAobSA8IDEwKSBtID0gJzAnICsgbTtcbiAgICAgICAgICAgICAgICBpZiAoZCA8IDEwKSBkID0gJzAnICsgZDtcbiAgICAgICAgICAgICAgICByZXR1cm4geSArICctJyArIG0gKyAnLScgKyBkO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vICBpbnRlcnZhbCBiZXR3ZWVuIG5vdyBhbmQgc2Vjb25kc1xuICAgICAgICAgICAgY29uc3QgZ2V0RGF0ZUludGVydmFsID0gKHN0YXJ0LCBlbmQsIGlzTmVlZFNlY29uZHMpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzID0ge307XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbmQgPT09ICd1bmRlZmluZWQnKSBlbmQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICBsZXQgaW50ZXJ2YWwgPSBlbmQgLSBzdGFydDtcbiAgICAgICAgICAgICAgICByZXMuZGF5ID0gTWF0aC5mbG9vcihpbnRlcnZhbCAvICgyNCAqIDM2MDAgKiAxMDAwKSk7XG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwgLT0gcmVzLmRheSAqIDI0ICogMzYwMCAqIDEwMDA7XG4gICAgICAgICAgICAgICAgcmVzLmhvdXJzID0gTWF0aC5mbG9vcihpbnRlcnZhbCAvICgzNjAwICogMTAwMCkpO1xuICAgICAgICAgICAgICAgIGludGVydmFsIC09IHJlcy5ob3VycyAqIDM2MDAgKiAxMDAwO1xuICAgICAgICAgICAgICAgIHJlcy5taW11dGVzID0gTWF0aC5mbG9vcihpbnRlcnZhbCAvICg2MCAqIDEwMDApKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNOZWVkU2Vjb25kcykge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcnZhbCAtPSByZXMubWltdXRlcyAqIDYwICogMTAwMDtcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNlY29uZHMgPSBNYXRoLmZsb29yKGludGVydmFsIC8gMTAwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgZ2V0UGFnZUludGVydmFsID0gKHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgc3RyID0gJycsXG4gICAgICAgICAgICAgICAgICAgIGludGVydmFsVGltZTtcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXJ0IHx8ICFlbmQgfHwgZW5kIC0gc3RhcnQgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzdHIgPSAnMOenkic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWxUaW1lID0gZ2V0RGF0ZUludGVydmFsKHN0YXJ0LCBlbmQsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJ2YWxUaW1lLmRheSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGludGVydmFsVGltZS5kYXkgKyAn5aSpJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJ2YWxUaW1lLmhvdXJzICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gaW50ZXJ2YWxUaW1lLmhvdXJzICsgJ+Wwj+aXtic7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGludGVydmFsVGltZS5taW11dGVzICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gaW50ZXJ2YWxUaW1lLm1pbXV0ZXMgKyAn5YiG6ZKfJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJ2YWxUaW1lLnNlY29uZHMgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSBpbnRlcnZhbFRpbWUuc2Vjb25kcyArICfnp5InO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHIgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgPSAnMOenkic7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBnZXRQYWdlRGF0ZSA9IChzdGFydCwgZW5kLCBpc05lZWRTZWNvbmRzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFzdGFydCAmJiAhZW5kIHx8IHN0YXJ0IC0gZW5kIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICfml6AnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IGdldERhdGVJbnRlcnZhbChzdGFydCwgZW5kLCBpc05lZWRTZWNvbmRzKSxcbiAgICAgICAgICAgICAgICAgICAgZGF5ID0gaW50ZXJ2YWwuZGF5LFxuICAgICAgICAgICAgICAgICAgICBob3VycyA9IGludGVydmFsLmhvdXJzLFxuICAgICAgICAgICAgICAgICAgICBtaW11dGVzID0gaW50ZXJ2YWwubWltdXRlcztcbiAgICAgICAgICAgICAgICBsZXQgcmVzO1xuICAgICAgICAgICAgICAgIC8vIOWuouaIt+err+aXtumXtOWSjOacjeWKoeWZqOaXtumXtOS4jee7n+S4gOmAoOaIkOeahOi0n+aVsOaDheWGtVxuICAgICAgICAgICAgICAgIGlmIChkYXkgPCAwIHx8IGhvdXJzIDwgMCB8fCBtaW11dGVzIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICByZXMgPSAn5Yia5YiaJztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRheSA+IDYwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcyA9ICfmm7Tml6knO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF5ID4gMzApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzID0gJ+S4gOS4quaciOWJjSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkYXkgPiAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcyA9IGRheSArICflpKnliY0nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF5ID09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzID0gJ+S4ieWkqeWJjSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkYXkgPT0gMikge1xuICAgICAgICAgICAgICAgICAgICByZXMgPSAn5Lik5aSp5YmNJztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRheSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcyA9ICfmmKjlpKknO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChob3VycyA+PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXMgPSBob3VycyArICflsI/ml7bliY0nO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1pbXV0ZXMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgPSAn5Yia5YiaJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gbWltdXRlcyArICfliIbpkp/liY0nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgbG9hZEpzID0gZnVuY3Rpb24gKHBhdGgpIHtcbiAgICAgICAgICAgICAgICBsZXQgZGVsYXkgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICQuZ2V0U2NyaXB0KHBhdGgsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsYXkucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWxheS5wcm9taXNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IEJhc2U2NCA9IHtcbiAgICAgICAgICAgICAgICBlbmNvZGUocykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQocykpKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlY29kZShzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoZXNjYXBlKGF0b2IocykpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpc0VtcHR5T2JqZWN0OiBpc0VtcHR5T2JqZWN0LFxuICAgICAgICAgICAgICAgIGlzQXJyYXk6IGlzQXJyYXksXG4gICAgICAgICAgICAgICAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICAgICAgICAgICAgICAgIHBhcnNlVHBsOiBwYXJzZVRwbCxcbiAgICAgICAgICAgICAgICB0b0RlY2ltYWw6IHRvRGVjaW1hbCxcbiAgICAgICAgICAgICAgICBmb3JtYXJ0Qnl0ZXNEYXRhOiBmb3JtYXJ0Qnl0ZXNEYXRhLFxuICAgICAgICAgICAgICAgIGZvcm1hdE1CeXRlc0RhdGE6IGZvcm1hdE1CeXRlc0RhdGEsXG4gICAgICAgICAgICAgICAgZ2V0UXVlcnlTdHJpbmc6IGdldFF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgICAgIG9iakxlbmd0aDogb2JqTGVuZ3RoLFxuICAgICAgICAgICAgICAgIGNhbGN1bGF0ZURhdGU6IGNhbGN1bGF0ZURhdGUsXG4gICAgICAgICAgICAgICAgZ2V0UGFnZUludGVydmFsOiBnZXRQYWdlSW50ZXJ2YWwsXG4gICAgICAgICAgICAgICAgZ2V0RGF0ZUludGVydmFsOiBnZXREYXRlSW50ZXJ2YWwsXG4gICAgICAgICAgICAgICAgZ2V0UGFnZURhdGU6IGdldFBhZ2VEYXRlLFxuICAgICAgICAgICAgICAgIGdldEZvcm1hdERhdGU6IGdldEZvcm1hdERhdGUsXG4gICAgICAgICAgICAgICAgbG9hZEpzOiBsb2FkSnMsXG4gICAgICAgICAgICAgICAgQmFzZTY0OiBCYXNlNjRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1dKVxuICAgICAgICAuZmFjdG9yeSgnJGRvbWVNb2RlbCcsIFsnJGh0dHAnLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgICAgICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgICAgIGNvbnN0IGdldFdob2xlVXJsID0gKHVybCwgLi4ucGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHdob2xlVXJsID0gdXJsLFxuICAgICAgICAgICAgICAgICAgICBhcmdzID0gWy4uLnBhcmFtc107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBhcmdzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB3aG9sZVVybCArPSAnLycgKyBhcmdzW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gd2hvbGVVcmw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8g5YW35pyJ6YCJ5oup5Yqf6IO955qEQ2xhc3PvvIzljIXmi6zpgInmi6nljZXpobnjgIHlhajpgInjgIHlhajkuI3pgIlcbiAgICAgICAgICAgIC8vIEBwYXJhbSBzZWxlY3RMaXN0TmFtZTog6YCJ5oup6aG555qEbGlzdOWvueixoeeahGtleeeahOWQjeWtly5lZzrkvKDlhaXigJlob3N0TGlzdOKAmOWunuS+i+WMluWQjuWmgntob3N0TGlzdDpbey4uLi59XX1cbiAgICAgICAgICAgIGNsYXNzIFNlbGVjdExpc3RNb2RlbCB7XG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3Ioc2VsZWN0TGlzdE5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RMaXN0TmFtZSA9IHNlbGVjdExpc3ROYW1lID8gc2VsZWN0TGlzdE5hbWUgOiAnc2VsZWN0TGlzdCc7XG4gICAgICAgICAgICAgICAgICAgIC8vIOaYr+WQpuWFqOmAiVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgLy8g6YCJ5oup6aG55pWw6YeP57uf6K6hXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNbdGhpcy5zZWxlY3RMaXN0TmFtZV0gPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW5pdChzZWxlY3RMaXN0LCBpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzW3RoaXMuc2VsZWN0TGlzdE5hbWVdID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc2VsZWN0TGlzdCB8fCBzZWxlY3RMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzZWxlY3RMaXN0WzBdKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaXRlbSBvZiBzZWxlY3RMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmtleUZpbHRlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlzU2VsZWN0ZWQgIT09ICd1bmRlZmluZWQnKSBpdGVtLmlzU2VsZWN0ZWQgPSBpc1NlbGVjdGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uaXNTZWxlY3RlZCkgdGhpcy5zZWxlY3RlZENvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IHNlbGVjdExpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RMaXN0W2ldID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IHNlbGVjdExpc3RbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5RmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGlzU2VsZWN0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlzU2VsZWN0ZWQgIT09ICd1bmRlZmluZWQnKSBzZWxlY3RMaXN0W2ldLmlzU2VsZWN0ZWQgPSBpc1NlbGVjdGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdExpc3RbaV0uaXNTZWxlY3RlZCkgdGhpcy5zZWxlY3RlZENvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRDb3VudCA9PT0gc2VsZWN0TGlzdC5sZW5ndGgpIHRoaXMuaXNDaGVja0FsbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdExpc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRvZ2dsZUNoZWNrKGl0ZW0sIGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc0FsbEhhc0NoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmlzU2VsZWN0ZWQgPSBpc1NlbGVjdGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0TGlzdCA9IHRoaXNbdGhpcy5zZWxlY3RMaXN0TmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5piv5ZCm5Li65YWo6YCJXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgc2lnSXRlbSBvZiBzZWxlY3RMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaWdJdGVtLmtleUZpbHRlciAmJiAhc2lnSXRlbS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0FsbEhhc0NoYW5nZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQWxsSGFzQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyDlhajpgIkv5YWo5LiN6YCJXG4gICAgICAgICAgICAgICAgY2hlY2tBbGxJdGVtKGlzQ2hlY2tBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gdHlwZW9mIGlzQ2hlY2tBbGwgPT09ICd1bmRlZmluZWQnID8gdGhpcy5pc0NoZWNrQWxsIDogaXNDaGVja0FsbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdExpc3QgPSB0aGlzW3RoaXMuc2VsZWN0TGlzdE5hbWVdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzaWdJdGVtIG9mIHNlbGVjdExpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaWdJdGVtLmtleUZpbHRlciAmJiB0aGlzLmlzQ2hlY2tBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWdJdGVtLmlzU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWdJdGVtLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaWx0ZXJXaXRoS2V5KGtleXdvcmRzLCBmaWx0ZXJJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGZpbHRlckl0ZW0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJJdGVtID0gJ2l0ZW0nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RMaXN0ID0gdGhpc1t0aGlzLnNlbGVjdExpc3ROYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c5rKh5pyJ5a+55bqU55qEa2V5XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RMaXN0WzBdW2ZpbHRlckl0ZW1dID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzaWdJdGVtIG9mIHNlbGVjdExpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ0l0ZW0uaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2lnSXRlbS5rZXlGaWx0ZXIgPSBzaWdJdGVtW2ZpbHRlckl0ZW1dLmluZGV4T2Yoa2V5d29yZHMpICE9PSAtMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBTZXJ2aWNlTW9kZWwgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXREYXRhID0gKC4uLmFyZ3MpID0+ICRodHRwLmdldChnZXRXaG9sZVVybCh1cmwsIC4uLmFyZ3MpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldERhdGEgPSAoZGF0YSwgY29uZmlnKSA9PiAkaHR0cC5wb3N0KHVybCwgZGF0YSwgY29uZmlnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZURhdGEgPSBkYXRhID0+ICRodHRwLnB1dCh1cmwsIGRhdGEpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlRGF0YSA9ICguLi5hcmdzKSA9PiAkaHR0cC5kZWxldGUoZ2V0V2hvbGVVcmwodXJsLCAuLi5hcmdzKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VzQ3JlYXRvciA9IGNsYXNzTWFwID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWNsYXNzTWFwKSBjbGFzc01hcCA9IHt9O1xuICAgICAgICAgICAgICAgIHJldHVybiAoY2xhc3NOYW1lLCAuLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbnMsIGZ1bmMgPSBjbGFzc01hcFtjbGFzc05hbWVdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGZ1bmMgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zID0gbmV3IGZ1bmMoLi4uYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcjp0aGVyZSBpcyBubyAnICsgY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5zO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBTZWxlY3RMaXN0TW9kZWw6IFNlbGVjdExpc3RNb2RlbCxcbiAgICAgICAgICAgICAgICBTZXJ2aWNlTW9kZWw6IFNlcnZpY2VNb2RlbCxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZXNDcmVhdG9yOiBpbnN0YW5jZXNDcmVhdG9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSlcbiAgICAgICAgLy8g5pWw5o2u5a2Y5YKoc2VydmljZVxuICAgICAgICAucHJvdmlkZXIoJyRkb21lRGF0YScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgICAgIGxldCBkYXRhID0ge307XG4gICAgICAgICAgICBjb25zdCBzZXREYXRhID0gKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBnZXREYXRhID0ga2V5ID0+IGRhdGFba2V5XTtcbiAgICAgICAgICAgIGNvbnN0IGRlbERhdGEgPSBrZXkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzZXREYXRhOiBzZXREYXRhLFxuICAgICAgICAgICAgICAgICRnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldERhdGE6IHNldERhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXREYXRhOiBnZXREYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsRGF0YTogZGVsRGF0YVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIHdpbmRvdy5wdWJsaWNNb2R1bGUgPSBwdWJsaWNNb2R1bGU7XG59KSh3aW5kb3cpOyJdfQ==
