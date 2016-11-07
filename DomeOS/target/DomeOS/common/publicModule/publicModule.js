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
        return {
            isEmptyObject: isEmptyObject,
            isArray: isArray,
            isObject: isObject,
            parseTpl: parseTpl,
            toDecimal: toDecimal,
            formartBytesData: formartBytesData,
            getQueryString: getQueryString,
            objLength: objLength,
            calculateDate: calculateDate,
            getPageInterval: getPageInterval,
            getDateInterval: getDateInterval,
            getPageDate: getPageDate,
            loadJs: loadJs
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9wdWJsaWNNb2R1bGUvcHVibGljTW9kdWxlLmVzIl0sIm5hbWVzIjpbIndpbmRvdyIsInVuZGVmaW5lZCIsInB1YmxpY01vZHVsZSIsImFuZ3VsYXIiLCJtb2R1bGUiLCJzZXJ2aWNlIiwiJHEiLCJpc0FycmF5IiwiT2JqZWN0IiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwiYXJyYXkiLCJpc09iamVjdCIsIm9iaiIsImlzRW1wdHlPYmplY3QiLCJuIiwiaGFzT3duUHJvcGVydHkiLCJnZXRRdWVyeVN0cmluZyIsInJlZyIsIlJlZ0V4cCIsIm5hbWUiLCJyIiwibG9jYXRpb24iLCJzZWFyY2giLCJzdWJzdHIiLCJtYXRjaCIsInVuZXNjYXBlIiwidG9EZWNpbWFsIiwiZGF0YSIsIm51bWJlciIsImlzTmFOIiwicGFyc2VGbG9hdCIsInRvRml4ZWQiLCJmb3JtYXJ0Qnl0ZXNEYXRhIiwidW5pdCIsInBhcnNlVHBsIiwic3RyIiwicmVzdWx0IiwicGF0dCIsImV4ZWMiLCJ2IiwicmVwbGFjZSIsIm9iakxlbmd0aCIsImtleXMiLCJsZW5ndGgiLCJjYWxjdWxhdGVEYXRlIiwic3RhcnREYXRlIiwiZGF5SW50ZXJ2YWwiLCJEYXRlIiwic2V0RGF0ZSIsImdldERhdGUiLCJ5IiwiZ2V0RnVsbFllYXIiLCJtIiwiZ2V0TW9udGgiLCJkIiwiZ2V0RGF0ZUludGVydmFsIiwic3RhcnQiLCJlbmQiLCJpc05lZWRTZWNvbmRzIiwicmVzIiwiZ2V0VGltZSIsImludGVydmFsIiwiZGF5IiwiTWF0aCIsImZsb29yIiwiaG91cnMiLCJtaW11dGVzIiwic2Vjb25kcyIsImdldFBhZ2VJbnRlcnZhbCIsImludGVydmFsVGltZSIsImdldFBhZ2VEYXRlIiwibG9hZEpzIiwicGF0aCIsImRlbGF5IiwiZGVmZXIiLCIkIiwiZ2V0U2NyaXB0IiwicmVzb2x2ZSIsInByb21pc2UiLCJmYWN0b3J5IiwiJGh0dHAiLCJnZXRXaG9sZVVybCIsInVybCIsInBhcmFtcyIsIndob2xlVXJsIiwiYXJncyIsImkiLCJsIiwiU2VsZWN0TGlzdE1vZGVsIiwic2VsZWN0TGlzdE5hbWUiLCJpc0NoZWNrQWxsIiwic2VsZWN0ZWRDb3VudCIsInNlbGVjdExpc3QiLCJpc1NlbGVjdGVkIiwiaXRlbSIsImtleUZpbHRlciIsImlzQWxsSGFzQ2hhbmdlIiwic2lnSXRlbSIsImtleXdvcmRzIiwiZmlsdGVySXRlbSIsImluZGV4T2YiLCJTZXJ2aWNlTW9kZWwiLCJnZXREYXRhIiwiZ2V0Iiwic2V0RGF0YSIsImNvbmZpZyIsInBvc3QiLCJ1cGRhdGVEYXRhIiwicHV0IiwiZGVsZXRlRGF0YSIsImRlbGV0ZSIsImluc3RhbmNlc0NyZWF0b3IiLCJjbGFzc01hcCIsImNsYXNzTmFtZSIsImlucyIsImZ1bmMiLCJjb25zb2xlIiwibG9nIiwicHJvdmlkZXIiLCJrZXkiLCJ2YWx1ZSIsImRlbERhdGEiLCIkZ2V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7QUFLQSxDQUFDLFVBQVVBLE1BQVYsRUFBa0JDLFNBQWxCLEVBQTZCO0FBQzFCLFFBQUlDLGVBQWVDLFFBQVFDLE1BQVIsQ0FBZSxjQUFmLEVBQStCLEVBQS9CLENBQW5CO0FBQ0FGLGlCQUFhRyxPQUFiLENBQXFCLE9BQXJCLEVBQThCLENBQUMsSUFBRCxFQUFPLFVBQVVDLEVBQVYsRUFBYztBQUMzQzs7QUFDQSxZQUFNQyxVQUFVLFNBQVZBLE9BQVU7QUFBQSxtQkFBU0MsT0FBT0MsU0FBUCxDQUFpQkMsUUFBakIsQ0FBMEJDLElBQTFCLENBQStCQyxLQUEvQixNQUEwQyxnQkFBbkQ7QUFBQSxTQUFoQjtBQUNBLFlBQU1DLFdBQVcsU0FBWEEsUUFBVztBQUFBLG1CQUFPTCxPQUFPQyxTQUFQLENBQWlCQyxRQUFqQixDQUEwQkMsSUFBMUIsQ0FBK0JHLEdBQS9CLE1BQXdDLGlCQUEvQztBQUFBLFNBQWpCO0FBQ0E7QUFDQSxZQUFNQyxnQkFBZ0IsU0FBaEJBLGFBQWdCLE1BQU87QUFDekIsZ0JBQUksQ0FBQ0YsU0FBU0Ms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Ii8qXG4gKiBAYXV0aG9yIENoYW5kcmFMZWVcbiAqIEBkZXNjcmlwdGlvbiDlhazlhbHmqKHlnZdcbiAqL1xuXG4oZnVuY3Rpb24gKHdpbmRvdywgdW5kZWZpbmVkKSB7XG4gICAgbGV0IHB1YmxpY01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwdWJsaWNNb2R1bGUnLCBbXSk7XG4gICAgcHVibGljTW9kdWxlLnNlcnZpY2UoJyR1dGlsJywgWyckcScsIGZ1bmN0aW9uICgkcSkge1xuICAgICAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICAgICAgY29uc3QgaXNBcnJheSA9IGFycmF5ID0+IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcnJheSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICAgICAgICBjb25zdCBpc09iamVjdCA9IG9iaiA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSc7XG4gICAgICAgICAgICAvLyAgaXMge31cbiAgICAgICAgICAgIGNvbnN0IGlzRW1wdHlPYmplY3QgPSBvYmogPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNPYmplY3Qob2JqKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAobGV0IG4gaW4gb2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkobikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBnZXRRdWVyeVN0cmluZyA9IG5hbWUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCByZWcgPSBuZXcgUmVnRXhwKCcoXnwmKScgKyBuYW1lICsgJz0oW14mXSopKCZ8JCknLCAnaScpO1xuICAgICAgICAgICAgICAgIGxldCByID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSkubWF0Y2gocmVnKTtcbiAgICAgICAgICAgICAgICBpZiAociAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5lc2NhcGUoclsyXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHRvRGVjaW1hbCA9IChkYXRhLCBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCB8fCBpc05hTihkYXRhKSkgcmV0dXJuIHZvaWQgMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gK3BhcnNlRmxvYXQoZGF0YSkudG9GaXhlZChudW1iZXIpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IGZvcm1hcnRCeXRlc0RhdGEgPSAoZGF0YSwgdW5pdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhID09PSBudWxsIHx8IGlzTmFOKGRhdGEpKSByZXR1cm4gdm9pZCAwO1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodW5pdCkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ01CJzpcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9ICgrZGF0YSAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdHQic6XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSAoK2RhdGEgLyAxMDI0IC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0tCJzpcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9ICgrZGF0YSAvIDEwMjQpLnRvRml4ZWQoMik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhLnRvRml4ZWQoMik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gK2RhdGE7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gQHBhcmFtIHN0cjo8c3Bhbj57eyNuYW1lfX08L3NwYW4+PHA+e3sjYWdlfX08L3A+XG4gICAgICAgICAgICAvLyBAcGFyYW0gZGF0YTp7bmFtZTonY2hhbmRyYScsYWdlOjEyLGFkZHI6J2NoaW5hJ31cbiAgICAgICAgICAgIC8vIEByZXR1cm4gPHNwYW4+Y2hhbmRyYTwvc3Bhbj48cD4xMjwvcD5cbiAgICAgICAgICAgIGNvbnN0IHBhcnNlVHBsID0gKHN0ciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgICAgICAgICAgbGV0IHBhdHQgPSBuZXcgUmVnRXhwKCdcXHtcXCMoW2EtekEtejAtOV0rKVxcfScpO1xuICAgICAgICAgICAgICAgIHdoaWxlICgocmVzdWx0ID0gcGF0dC5leGVjKHN0cikpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2ID0gZGF0YVtyZXN1bHRbMV1dID09PSAwID8gJzAnIDogZGF0YVtyZXN1bHRbMV1dIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShuZXcgUmVnRXhwKHJlc3VsdFswXSwgJ2cnKSwgdik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3Qgb2JqTGVuZ3RoID0gb2JqID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzT2JqZWN0KG9iaikpIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBjYWxjdWxhdGVEYXRlID0gKHN0YXJ0RGF0ZSwgZGF5SW50ZXJ2YWwpID0+IHtcbiAgICAgICAgICAgICAgICBzdGFydERhdGUgPSBuZXcgRGF0ZShzdGFydERhdGUpO1xuICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZS5zZXREYXRlKHN0YXJ0RGF0ZS5nZXREYXRlKCkgKyBkYXlJbnRlcnZhbCk7IC8vZ2V0IHRoZSBkYXRlIGFmdGVyIGRheUludGVydmFsIGRheXMgb3IgYmVmb3JlIGRheUludGVydmFsIGRheXMsc3VjaCBhcyBhZnRlciAyIGRheXMsIGFmdGVyIDMgZGF5cywgYmVmb3JlIDIgZGF5cyAsIGJlZm9yZSAzIGRheXMgYW5kIHNvIG9uXG4gICAgICAgICAgICAgICAgbGV0IHkgPSBzdGFydERhdGUuZ2V0RnVsbFllYXIoKSxcbiAgICAgICAgICAgICAgICAgICAgbSA9IHN0YXJ0RGF0ZS5nZXRNb250aCgpICsgMSxcbiAgICAgICAgICAgICAgICAgICAgZCA9IHN0YXJ0RGF0ZS5nZXREYXRlKCk7XG4gICAgICAgICAgICAgICAgaWYgKG0gPCAxMCkgbSA9ICcwJyArIG07XG4gICAgICAgICAgICAgICAgaWYgKGQgPCAxMCkgZCA9ICcwJyArIGQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHkgKyAnLScgKyBtICsgJy0nICsgZDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyAgaW50ZXJ2YWwgYmV0d2VlbiBub3cgYW5kIHNlY29uZHNcbiAgICAgICAgICAgIGNvbnN0IGdldERhdGVJbnRlcnZhbCA9IChzdGFydCwgZW5kLCBpc05lZWRTZWNvbmRzKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHJlcyA9IHt9O1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW5kID09PSAndW5kZWZpbmVkJykgZW5kID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgbGV0IGludGVydmFsID0gZW5kIC0gc3RhcnQ7XG4gICAgICAgICAgICAgICAgcmVzLmRheSA9IE1hdGguZmxvb3IoaW50ZXJ2YWwgLyAoMjQgKiAzNjAwICogMTAwMCkpO1xuICAgICAgICAgICAgICAgIGludGVydmFsIC09IHJlcy5kYXkgKiAyNCAqIDM2MDAgKiAxMDAwO1xuICAgICAgICAgICAgICAgIHJlcy5ob3VycyA9IE1hdGguZmxvb3IoaW50ZXJ2YWwgLyAoMzYwMCAqIDEwMDApKTtcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCAtPSByZXMuaG91cnMgKiAzNjAwICogMTAwMDtcbiAgICAgICAgICAgICAgICByZXMubWltdXRlcyA9IE1hdGguZmxvb3IoaW50ZXJ2YWwgLyAoNjAgKiAxMDAwKSk7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmVlZFNlY29uZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWwgLT0gcmVzLm1pbXV0ZXMgKiA2MCAqIDEwMDA7XG4gICAgICAgICAgICAgICAgICAgIHJlcy5zZWNvbmRzID0gTWF0aC5mbG9vcihpbnRlcnZhbCAvIDEwMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IGdldFBhZ2VJbnRlcnZhbCA9IChzdGFydCwgZW5kKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHN0ciA9ICcnLFxuICAgICAgICAgICAgICAgICAgICBpbnRlcnZhbFRpbWU7XG4gICAgICAgICAgICAgICAgaWYgKCFzdGFydCB8fCAhZW5kIHx8IGVuZCAtIHN0YXJ0IDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gJzDnp5InO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGludGVydmFsVGltZSA9IGdldERhdGVJbnRlcnZhbChzdGFydCwgZW5kLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGludGVydmFsVGltZS5kYXkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSBpbnRlcnZhbFRpbWUuZGF5ICsgJ+WkqSc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGludGVydmFsVGltZS5ob3VycyAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGludGVydmFsVGltZS5ob3VycyArICflsI/ml7YnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnRlcnZhbFRpbWUubWltdXRlcyAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGludGVydmFsVGltZS5taW11dGVzICsgJ+WIhumSnyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGludGVydmFsVGltZS5zZWNvbmRzICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gaW50ZXJ2YWxUaW1lLnNlY29uZHMgKyAn56eSJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RyID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyID0gJzDnp5InO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgZ2V0UGFnZURhdGUgPSAoc3RhcnQsIGVuZCwgaXNOZWVkU2Vjb25kcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghc3RhcnQgJiYgIWVuZCB8fCBzdGFydCAtIGVuZCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAn5pegJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBnZXREYXRlSW50ZXJ2YWwoc3RhcnQsIGVuZCwgaXNOZWVkU2Vjb25kcyksXG4gICAgICAgICAgICAgICAgICAgIGRheSA9IGludGVydmFsLmRheSxcbiAgICAgICAgICAgICAgICAgICAgaG91cnMgPSBpbnRlcnZhbC5ob3VycyxcbiAgICAgICAgICAgICAgICAgICAgbWltdXRlcyA9IGludGVydmFsLm1pbXV0ZXM7XG4gICAgICAgICAgICAgICAgbGV0IHJlcztcbiAgICAgICAgICAgICAgICAvLyDlrqLmiLfnq6/ml7bpl7TlkozmnI3liqHlmajml7bpl7TkuI3nu5/kuIDpgKDmiJDnmoTotJ/mlbDmg4XlhrVcbiAgICAgICAgICAgICAgICBpZiAoZGF5IDwgMCB8fCBob3VycyA8IDAgfHwgbWltdXRlcyA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzID0gJ+WImuWImic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkYXkgPiA2MCkge1xuICAgICAgICAgICAgICAgICAgICByZXMgPSAn5pu05pepJztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRheSA+IDMwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcyA9ICfkuIDkuKrmnIjliY0nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF5ID4gMykge1xuICAgICAgICAgICAgICAgICAgICByZXMgPSBkYXkgKyAn5aSp5YmNJztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRheSA9PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcyA9ICfkuInlpKnliY0nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF5ID09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzID0gJ+S4pOWkqeWJjSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkYXkgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXMgPSAn5pio5aSpJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaG91cnMgPj0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gaG91cnMgKyAn5bCP5pe25YmNJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtaW11dGVzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gJ+WImuWImic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IG1pbXV0ZXMgKyAn5YiG6ZKf5YmNJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRKcyA9IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGRlbGF5ID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAkLmdldFNjcmlwdChwYXRoLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGF5LnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVsYXkucHJvbWlzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlzRW1wdHlPYmplY3Q6IGlzRW1wdHlPYmplY3QsXG4gICAgICAgICAgICAgICAgaXNBcnJheTogaXNBcnJheSxcbiAgICAgICAgICAgICAgICBpc09iamVjdDogaXNPYmplY3QsXG4gICAgICAgICAgICAgICAgcGFyc2VUcGw6IHBhcnNlVHBsLFxuICAgICAgICAgICAgICAgIHRvRGVjaW1hbDogdG9EZWNpbWFsLFxuICAgICAgICAgICAgICAgIGZvcm1hcnRCeXRlc0RhdGE6IGZvcm1hcnRCeXRlc0RhdGEsXG4gICAgICAgICAgICAgICAgZ2V0UXVlcnlTdHJpbmc6IGdldFF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgICAgIG9iakxlbmd0aDogb2JqTGVuZ3RoLFxuICAgICAgICAgICAgICAgIGNhbGN1bGF0ZURhdGU6IGNhbGN1bGF0ZURhdGUsXG4gICAgICAgICAgICAgICAgZ2V0UGFnZUludGVydmFsOiBnZXRQYWdlSW50ZXJ2YWwsXG4gICAgICAgICAgICAgICAgZ2V0RGF0ZUludGVydmFsOiBnZXREYXRlSW50ZXJ2YWwsXG4gICAgICAgICAgICAgICAgZ2V0UGFnZURhdGU6IGdldFBhZ2VEYXRlLFxuICAgICAgICAgICAgICAgIGxvYWRKczogbG9hZEpzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSlcbiAgICAgICAgLmZhY3RvcnkoJyRkb21lTW9kZWwnLCBbJyRodHRwJywgZnVuY3Rpb24gKCRodHRwKSB7XG4gICAgICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgICAgICBjb25zdCBnZXRXaG9sZVVybCA9ICh1cmwsIC4uLnBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB3aG9sZVVybCA9IHVybCxcbiAgICAgICAgICAgICAgICAgICAgYXJncyA9IFsuLi5wYXJhbXNdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gYXJncy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgd2hvbGVVcmwgKz0gJy8nICsgYXJnc1tpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdob2xlVXJsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIOWFt+aciemAieaLqeWKn+iDveeahENsYXNz77yM5YyF5ous6YCJ5oup5Y2V6aG544CB5YWo6YCJ44CB5YWo5LiN6YCJXG4gICAgICAgICAgICAvLyBAcGFyYW0gc2VsZWN0TGlzdE5hbWU6IOmAieaLqemhueeahGxpc3Tlr7nosaHnmoRrZXnnmoTlkI3lrZcuZWc65Lyg5YWl4oCZaG9zdExpc3TigJjlrp7kvovljJblkI7lpoJ7aG9zdExpc3Q6W3suLi4ufV19XG4gICAgICAgICAgICBjbGFzcyBTZWxlY3RMaXN0TW9kZWwge1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yKHNlbGVjdExpc3ROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0TGlzdE5hbWUgPSBzZWxlY3RMaXN0TmFtZSA/IHNlbGVjdExpc3ROYW1lIDogJ3NlbGVjdExpc3QnO1xuICAgICAgICAgICAgICAgICAgICAvLyDmmK/lkKblhajpgIlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIC8vIOmAieaLqemhueaVsOmHj+e7n+iuoVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzW3RoaXMuc2VsZWN0TGlzdE5hbWVdID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluaXQoc2VsZWN0TGlzdCwgaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpc1t0aGlzLnNlbGVjdExpc3ROYW1lXSA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNlbGVjdExpc3QgfHwgc2VsZWN0TGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc2VsZWN0TGlzdFswXSkgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGl0ZW0gb2Ygc2VsZWN0TGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5rZXlGaWx0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpc1NlbGVjdGVkICE9PSAndW5kZWZpbmVkJykgaXRlbS5pc1NlbGVjdGVkID0gaXNTZWxlY3RlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmlzU2VsZWN0ZWQpIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBzZWxlY3RMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0TGlzdFtpXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBzZWxlY3RMaXN0W2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleUZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkOiBpc1NlbGVjdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpc1NlbGVjdGVkICE9PSAndW5kZWZpbmVkJykgc2VsZWN0TGlzdFtpXS5pc1NlbGVjdGVkID0gaXNTZWxlY3RlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RMaXN0W2ldLmlzU2VsZWN0ZWQpIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnQgPT09IHNlbGVjdExpc3QubGVuZ3RoKSB0aGlzLmlzQ2hlY2tBbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3RMaXN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0b2dnbGVDaGVjayhpdGVtLCBpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXNBbGxIYXNDaGFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5pc1NlbGVjdGVkID0gaXNTZWxlY3RlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdExpc3QgPSB0aGlzW3RoaXMuc2VsZWN0TGlzdE5hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaYr+WQpuS4uuWFqOmAiVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ0l0ZW0gb2Ygc2VsZWN0TGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2lnSXRlbS5rZXlGaWx0ZXIgJiYgIXNpZ0l0ZW0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNBbGxIYXNDaGFuZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0FsbEhhc0NoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50LS07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8g5YWo6YCJL+WFqOS4jemAiVxuICAgICAgICAgICAgICAgIGNoZWNrQWxsSXRlbShpc0NoZWNrQWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IHR5cGVvZiBpc0NoZWNrQWxsID09PSAndW5kZWZpbmVkJyA/IHRoaXMuaXNDaGVja0FsbCA6IGlzQ2hlY2tBbGw7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RMaXN0ID0gdGhpc1t0aGlzLnNlbGVjdExpc3ROYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgc2lnSXRlbSBvZiBzZWxlY3RMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2lnSXRlbS5rZXlGaWx0ZXIgJiYgdGhpcy5pc0NoZWNrQWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnSXRlbS5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnSXRlbS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmlsdGVyV2l0aEtleShrZXl3b3JkcywgZmlsdGVySXRlbSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWx0ZXJJdGVtID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVySXRlbSA9ICdpdGVtJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0TGlzdCA9IHRoaXNbdGhpcy5zZWxlY3RMaXN0TmFtZV07XG4gICAgICAgICAgICAgICAgICAgIC8vIOWmguaenOayoeacieWvueW6lOeahGtleVxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0TGlzdFswXVtmaWx0ZXJJdGVtXSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgc2lnSXRlbSBvZiBzZWxlY3RMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaWdJdGVtLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ0l0ZW0ua2V5RmlsdGVyID0gc2lnSXRlbVtmaWx0ZXJJdGVtXS5pbmRleE9mKGtleXdvcmRzKSAhPT0gLTE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgU2VydmljZU1vZGVsID0gZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGF0YSA9ICguLi5hcmdzKSA9PiAkaHR0cC5nZXQoZ2V0V2hvbGVVcmwodXJsLCAuLi5hcmdzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXREYXRhID0gKGRhdGEsIGNvbmZpZykgPT4gJGh0dHAucG9zdCh1cmwsIGRhdGEsIGNvbmZpZyk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVEYXRhID0gZGF0YSA9PiAkaHR0cC5wdXQodXJsLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZURhdGEgPSAoLi4uYXJncykgPT4gJGh0dHAuZGVsZXRlKGdldFdob2xlVXJsKHVybCwgLi4uYXJncykpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlc0NyZWF0b3IgPSBjbGFzc01hcCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFjbGFzc01hcCkgY2xhc3NNYXAgPSB7fTtcbiAgICAgICAgICAgICAgICByZXR1cm4gKGNsYXNzTmFtZSwgLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5zLCBmdW5jID0gY2xhc3NNYXBbY2xhc3NOYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmdW5jID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucyA9IG5ldyBmdW5jKC4uLmFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZXJyb3I6dGhlcmUgaXMgbm8gJyArIGNsYXNzTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlucztcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgU2VsZWN0TGlzdE1vZGVsOiBTZWxlY3RMaXN0TW9kZWwsXG4gICAgICAgICAgICAgICAgU2VydmljZU1vZGVsOiBTZXJ2aWNlTW9kZWwsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VzQ3JlYXRvcjogaW5zdGFuY2VzQ3JlYXRvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfV0pXG4gICAgICAgIC8vIOaVsOaNruWtmOWCqHNlcnZpY2VcbiAgICAgICAgLnByb3ZpZGVyKCckZG9tZURhdGEnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IHt9O1xuICAgICAgICAgICAgY29uc3Qgc2V0RGF0YSA9IChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgZ2V0RGF0YSA9IGtleSA9PiBkYXRhW2tleV07XG4gICAgICAgICAgICBjb25zdCBkZWxEYXRhID0ga2V5ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YVtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc2V0RGF0YTogc2V0RGF0YSxcbiAgICAgICAgICAgICAgICAkZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXREYXRhOiBzZXREYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0RGF0YTogZ2V0RGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbERhdGE6IGRlbERhdGFcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB3aW5kb3cucHVibGljTW9kdWxlID0gcHVibGljTW9kdWxlO1xufSkod2luZG93KTsiXX0=
