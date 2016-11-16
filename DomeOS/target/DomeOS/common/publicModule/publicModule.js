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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9wdWJsaWNNb2R1bGUvcHVibGljTW9kdWxlLmVzIl0sIm5hbWVzIjpbIndpbmRvdyIsInVuZGVmaW5lZCIsInB1YmxpY01vZHVsZSIsImFuZ3VsYXIiLCJtb2R1bGUiLCJzZXJ2aWNlIiwiJHEiLCJpc0FycmF5IiwiT2JqZWN0IiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwiYXJyYXkiLCJpc09iamVjdCIsIm9iaiIsImlzRW1wdHlPYmplY3QiLCJuIiwiaGFzT3duUHJvcGVydHkiLCJnZXRRdWVyeVN0cmluZyIsInJlZyIsIlJlZ0V4cCIsIm5hbWUiLCJyIiwibG9jYXRpb24iLCJzZWFyY2giLCJzdWJzdHIiLCJtYXRjaCIsInVuZXNjYXBlIiwidG9EZWNpbWFsIiwiZGF0YSIsIm51bWJlciIsImlzTmFOIiwicGFyc2VGbG9hdCIsInRvRml4ZWQiLCJmb3JtYXJ0Qnl0ZXNEYXRhIiwidW5pdCIsInBhcnNlVHBsIiwic3RyIiwicmVzdWx0IiwicGF0dCIsImV4ZWMiLCJ2IiwicmVwbGFjZSIsIm9iakxlbmd0aCIsImtleXMiLCJsZW5ndGgiLCJjYWxjdWxhdGVEYXRlIiwic3RhcnREYXRlIiwiZGF5SW50ZXJ2YWwiLCJEYXRlIiwic2V0RGF0ZSIsImdldERhdGUiLCJ5IiwiZ2V0RnVsbFllYXIiLCJtIiwiZ2V0TW9udGgiLCJkIiwiZ2V0RGF0ZUludGVydmFsIiwic3RhcnQiLCJlbmQiLCJpc05lZWRTZWNvbmRzIiwicmVzIiwiZ2V0VGltZSIsImludGVydmFsIiwiZGF5IiwiTWF0aCIsImZsb29yIiwiaG91cnMiLCJtaW11dGVzIiwic2Vjb25kcyIsImdldFBhZ2VJbnRlcnZhbCIsImludGVydmFsVGltZSIsImdldFBhZ2VEYXRlIiwibG9hZEpzIiwicGF0aCIsImRlbGF5IiwiZGVmZXIiLCIkIiwiZ2V0U2NyaXB0IiwicmVzb2x2ZSIsInByb21pc2UiLCJmYWN0b3J5IiwiJGh0dHAiLCJnZXRXaG9sZVVybCIsInVybCIsInBhcmFtcyIsIndob2xlVXJsIiwiYXJncyIsImkiLCJsIiwiU2VsZWN0TGlzdE1vZGVsIiwic2VsZWN0TGlzdE5hbWUiLCJpc0NoZWNrQWxsIiwic2VsZWN0ZWRDb3VudCIsInNlbGVjdExpc3QiLCJpc1NlbGVjdGVkIiwiaXRlbSIsImtleUZpbHRlciIsImlzQWxsSGFzQ2hhbmdlIiwic2lnSXRlbSIsImtleXdvcmRzIiwiZmlsdGVySXRlbSIsImluZGV4T2YiLCJTZXJ2aWNlTW9kZWwiLCJnZXREYXRhIiwiZ2V0Iiwic2V0RGF0YSIsImNvbmZpZyIsInBvc3QiLCJ1cGRhdGVEYXRhIiwicHV0IiwiZGVsZXRlRGF0YSIsImRlbGV0ZSIsImluc3RhbmNlc0NyZWF0b3IiLCJjbGFzc01hcCIsImNsYXNzTmFtZSIsImlucyIsImZ1bmMiLCJjb25zb2xlIiwibG9nIiwicHJvdmlkZXIiLCJrZXkiLCJ2YWx1ZSIsImRlbERhdGEiLCIkZ2V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7QUFLQSxDQUFDLFVBQVVBLE1BQVYsRUFBa0JDLFNBQWxCLEVBQTZCO0FBQzFCLFFBQUlDLGVBQWVDLFFBQVFDLE1BQVIsQ0FBZSxjQUFmLEVBQStCLEVBQS9CLENBQW5CO0FBQ0FGLGlCQUFhRyxPQUFiLENBQXFCLE9BQXJCLEVBQThCLENBQUMsSUFBRCxFQUFPLFVBQVVDLEVBQVYsRUFBYztBQUMzQzs7QUFDQSxZQUFNQyxVQUFVLFNBQVZBLE9BQVU7QUFBQSxtQkFBU0MsT0FBT0MsU0FBUCxDQUFpQkMsUUFBakIsQ0FBMEJDLElBQTFCLENBQStCQyxLQUEvQixNQUEwQyxnQkFBbkQ7QUFBQSxTQUFoQjtBQUNBLFlBQU1DLFdBQVcsU0FBWEEsUUFBVztBQUFBLG1CQUFPTCxPQUFPQyxTQUFQLENBQWlCQyxRQUFqQixDQUEwQkMsSUFBMUIsQ0FBK0JHLEdBQS9CLE1BQXdDLGlCQUEvQztBQUFBLFNBQWpCO0FBQ0E7QUFDQSxZQUFNQyxnQkFBZ0IsU0FBaEJBLGFBQWdCLE1BQU87QUFDekIsZ0JBQUksQ0FBQ0YsU0FBU0MsR0FBVCxDQUFMLEVBQW9CO0FBQ2hCO0FBQ0g7QUFDRCxpQkFBSyxJQUFJRSxDQUFULElBQWNGLEdBQWQsRUFBbUI7QUFDZixvQkFBSUEsSUFBSUcsY0FBSixDQUFtQkQsQ0FBbkIsQ0FBSixFQUEyQjtBQUN2QiwyQkFBTyxLQUFQO0FBQ0g7QUFDSjtBQUNELG1CQUFPLElBQVA7QUFDSCxTQVZEO0FBV0EsWUFBTUUsaUJBQWlCLFNBQWpCQSxjQUFpQixPQUFRO0FBQzNCLGdCQUFJQyxNQUFNLElBQUlDLE1BQUosQ0FBVyxVQUFVQyxJQUFWLEdBQWlCLGVBQTVCLEVBQTZDLEdBQTdDLENBQVY7QUFDQSxnQkFBSUMsSUFBSXRCLE9BQU91QixRQUFQLENBQWdCQyxNQUFoQixDQUF1QkMsTUFBdkIsQ0FBOEIsQ0FBOUIsRUFBaUNDLEtBQWpDLENBQXVDUCxHQUF2QyxDQUFSO0FBQ0EsZ0JBQUlHLE1BQU0sSUFBVixFQUFnQjtBQUNaLHVCQUFPSyxTQUFTTCxFQUFFLENBQUYsQ0FBVCxDQUFQO0FBQ0g7QUFDRCxtQkFBTyxJQUFQO0FBQ0gsU0FQRDtBQVFBLFlBQU1NLFlBQVksU0FBWkEsU0FBWSxDQUFDQyxJQUFELEVBQU9DLE1BQVAsRUFBa0I7QUFDaEMsZ0JBQUlELFNBQVMsSUFBVCxJQUFpQkUsTUFBTUYsSUFBTixDQUFyQixFQUFrQyxPQUFPLEtBQUssQ0FBWjtBQUNsQyxtQkFBTyxDQUFDRyxXQUFXSCxJQUFYLEVBQWlCSSxPQUFqQixDQUF5QkgsTUFBekIsQ0FBUjtBQUNILFNBSEQ7QUFJQSxZQUFNSSxtQkFBbUIsU0FBbkJBLGdCQUFtQixDQUFDTCxJQUFELEVBQU9NLElBQVAsRUFBZ0I7QUFDckMsZ0JBQUlOLFNBQVMsSUFBVCxJQUFpQkUsTUFBTUYsSUFBTixDQUFyQixFQUFrQyxPQUFPLEtBQUssQ0FBWjtBQUNsQyxvQkFBUU0sSUFBUjtBQUNBLHFCQUFLLElBQUw7QUFDSU4sMkJBQU8sQ0FBQyxDQUFDQSxJQUFELEdBQVEsSUFBUixHQUFlLElBQWhCLEVBQXNCSSxPQUF0QixDQUE4QixDQUE5QixDQUFQO0FBQ0E7QUFDSixxQkFBSyxJQUFMO0FBQ0lKLDJCQUFPLENBQUMsQ0FBQ0EsSUFBRCxHQUFRLElBQVIsR0FBZSxJQUFmLEdBQXNCLElBQXZCLEVBQTZCSSxPQUE3QixDQUFxQyxDQUFyQyxDQUFQO0FBQ0E7QUFDSixxQkFBSyxJQUFMO0FBQ0lKLDJCQUFPLENBQUMsQ0FBQ0EsSUFBRCxHQUFRLElBQVQsRUFBZUksT0FBZixDQUF1QixDQUF2QixDQUFQO0FBQ0E7QUFDSjtBQUNJSiwyQkFBT0EsS0FBS0ksT0FBTCxDQUFhLENBQWIsQ0FBUDtBQUNBO0FBWko7QUFjQSxtQkFBTyxDQUFDSixJQUFSO0FBQ0gsU0FqQkQ7QUFrQkE7QUFDQTtBQUNBO0FBQ0EsWUFBTU8sV0FBVyxTQUFYQSxRQUFXLENBQUNDLEdBQUQsRUFBTVIsSUFBTixFQUFlO0FBQzVCLGdCQUFJUyxlQUFKO0FBQ0EsZ0JBQUlDLE9BQU8sSUFBSW5CLE1BQUosQ0FBVyxzQkFBWCxDQUFYO0FBQ0EsbUJBQU8sQ0FBQ2tCLFNBQVNDLEtBQUtDLElBQUwsQ0FBVUgsR0FBVixDQUFWLE1BQThCLElBQXJDLEVBQTJDO0FBQ3ZDLG9CQUFJSSxJQUFJWixLQUFLUyxPQUFPLENBQVAsQ0FBTCxNQUFvQixDQUFwQixHQUF3QixHQUF4QixHQUE4QlQsS0FBS1MsT0FBTyxDQUFQLENBQUwsS0FBbUIsRUFBekQ7QUFDQUQsc0JBQU1BLElBQUlLLE9BQUosQ0FBWSxJQUFJdEIsTUFBSixDQUFXa0IsT0FBTyxDQUFQLENBQVgsRUFBc0IsR0FBdEIsQ0FBWixFQUF3Q0csQ0FBeEMsQ0FBTjtBQUNIO0FBQ0QsbUJBQU9KLEdBQVA7QUFDSCxTQVJEO0FBU0EsWUFBTU0sWUFBWSxTQUFaQSxTQUFZLE1BQU87QUFDckIsZ0JBQUksQ0FBQzlCLFNBQVNDLEdBQVQsQ0FBTCxFQUFvQixPQUFPLENBQVA7QUFDcEIsbUJBQU9OLE9BQU9vQyxJQUFQLENBQVk5QixHQUFaLEVBQWlCK0IsTUFBeEI7QUFDSCxTQUhEO0FBSUEsWUFBTUMsZ0JBQWdCLFNBQWhCQSxhQUFnQixDQUFDQyxTQUFELEVBQVlDLFdBQVosRUFBNEI7QUFDOUNELHdCQUFZLElBQUlFLElBQUosQ0FBU0YsU0FBVCxDQUFaO0FBQ0FBLHNCQUFVRyxPQUFWLENBQWtCSCxVQUFVSSxPQUFWLEtBQXNCSCxXQUF4QyxFQUY4QyxDQUVRO0FBQ3RELGdCQUFJSSxJQUFJTCxVQUFVTSxXQUFWLEVBQVI7QUFBQSxnQkFDSUMsSUFBSVAsVUFBVVEsUUFBVixLQUF1QixDQUQvQjtBQUFBLGdCQUVJQyxJQUFJVCxVQUFVSSxPQUFWLEVBRlI7QUFHQSxnQkFBSUcsSUFBSSxFQUFSLEVBQVlBLElBQUksTUFBTUEsQ0FBVjtBQUNaLGdCQUFJRSxJQUFJLEVBQVIsRUFBWUEsSUFBSSxNQUFNQSxDQUFWO0FBQ1osbUJBQU9KLElBQUksR0FBSixHQUFVRSxDQUFWLEdBQWMsR0FBZCxHQUFvQkUsQ0FBM0I7QUFDSCxTQVREO0FBVUE7QUFDQSxZQUFNQyxrQkFBa0IsU0FBbEJBLGVBQWtCLENBQUNDLEtBQUQsRUFBUUMsR0FBUixFQUFhQyxhQUFiLEVBQStCO0FBQ25ELGdCQUFJQyxNQUFNLEVBQVY7QUFDQSxnQkFBSSxPQUFPRixHQUFQLEtBQWUsV0FBbkIsRUFBZ0NBLE1BQU0sSUFBSVYsSUFBSixHQUFXYSxPQUFYLEVBQU47QUFDaEMsZ0JBQUlDLFdBQVdKLE1BQU1ELEtBQXJCO0FBQ0FHLGdCQUFJRyxHQUFKLEdBQVVDLEtBQUtDLEtBQUwsQ0FBV0gsWUFBWSxLQUFLLElBQUwsR0FBWSxJQUF4QixDQUFYLENBQVY7QUFDQUEsd0JBQVlGLElBQUlHLEdBQUosR0FBVSxFQUFWLEdBQWUsSUFBZixHQUFzQixJQUFsQztBQUNBSCxnQkFBSU0sS0FBSixHQUFZRixLQUFLQyxLQUFMLENBQVdILFlBQVksT0FBTyxJQUFuQixDQUFYLENBQVo7QUFDQUEsd0JBQVlGLElBQUlNLEtBQUosR0FBWSxJQUFaLEdBQW1CLElBQS9CO0FBQ0FOLGdCQUFJTyxPQUFKLEdBQWNILEtBQUtDLEtBQUwsQ0FBV0gsWUFBWSxLQUFLLElBQWpCLENBQVgsQ0FBZDtBQUNBLGdCQUFJSCxhQUFKLEVBQW1CO0FBQ2ZHLDRCQUFZRixJQUFJTyxPQUFKLEdBQWMsRUFBZCxHQUFtQixJQUEvQjtBQUNBUCxvQkFBSVEsT0FBSixHQUFjSixLQUFLQyxLQUFMLENBQVdILFdBQVcsSUFBdEIsQ0FBZDtBQUNIO0FBQ0QsbUJBQU9GLEdBQVA7QUFDSCxTQWREO0FBZUEsWUFBTVMsa0JBQWtCLFNBQWxCQSxlQUFrQixDQUFDWixLQUFELEVBQVFDLEdBQVIsRUFBZ0I7QUFDcEMsZ0JBQUl0QixNQUFNLEVBQVY7QUFBQSxnQkFDSWtDLHFCQURKO0FBRUEsZ0JBQUksQ0FBQ2IsS0FBRCxJQUFVLENBQUNDLEdBQVgsSUFBa0JBLE1BQU1ELEtBQU4sSUFBZSxDQUFyQyxFQUF3QztBQUNwQ3JCLHNCQUFNLElBQU47QUFDSCxhQUZELE1BRU87QUFDSGtDLCtCQUFlZCxnQkFBZ0JDLEtBQWhCLEVBQXVCQyxHQUF2QixFQUE0QixJQUE1QixDQUFmO0FBQ0Esb0JBQUlZLGFBQWFQLEdBQWIsS0FBcUIsQ0FBekIsRUFBNEI7QUFDeEIzQiwyQkFBT2tDLGFBQWFQLEdBQWIsR0FBbUIsR0FBMUI7QUFDSDtBQUNELG9CQUFJTyxhQUFhSixLQUFiLEtBQXVCLENBQTNCLEVBQThCO0FBQzFCOUIsMkJBQU9rQyxhQUFhSixLQUFiLEdBQXFCLElBQTVCO0FBQ0g7QUFDRCxvQkFBSUksYUFBYUgsT0FBYixLQUF5QixDQUE3QixFQUFnQztBQUM1Qi9CLDJCQUFPa0MsYUFBYUgsT0FBYixHQUF1QixJQUE5QjtBQUNIO0FBQ0Qsb0JBQUlHLGFBQWFGLE9BQWIsS0FBeUIsQ0FBN0IsRUFBZ0M7QUFDNUJoQywyQkFBT2tDLGFBQWFGLE9BQWIsR0FBdUIsR0FBOUI7QUFDSDtBQUNELG9CQUFJaEMsUUFBUSxFQUFaLEVBQWdCO0FBQ1pBLDBCQUFNLElBQU47QUFDSDtBQUNKO0FBQ0QsbUJBQU9BLEdBQVA7QUFDSCxTQXhCRDtBQXlCQSxZQUFNbUMsY0FBYyxTQUFkQSxXQUFjLENBQUNkLEtBQUQsRUFBUUMsR0FBUixFQUFhQyxhQUFiLEVBQStCO0FBQy9DLGdCQUFJLENBQUNGLEtBQUQsSUFBVSxDQUFDQyxHQUFYLElBQWtCRCxRQUFRQyxHQUFSLElBQWUsQ0FBckMsRUFBd0M7QUFDcEMsdUJBQU8sR0FBUDtBQUNIO0FBQ0QsZ0JBQU1JLFdBQVdOLGdCQUFnQkMsS0FBaEIsRUFBdUJDLEdBQXZCLEVBQTRCQyxhQUE1QixDQUFqQjtBQUFBLGdCQUNJSSxNQUFNRCxTQUFTQyxHQURuQjtBQUFBLGdCQUVJRyxRQUFRSixTQUFTSSxLQUZyQjtBQUFBLGdCQUdJQyxVQUFVTCxTQUFTSyxPQUh2QjtBQUlBLGdCQUFJUCxZQUFKO0FBQ0E7QUFDQSxnQkFBSUcsTUFBTSxDQUFOLElBQVdHLFFBQVEsQ0FBbkIsSUFBd0JDLFVBQVUsQ0FBdEMsRUFBeUM7QUFDckNQLHNCQUFNLElBQU47QUFDSCxhQUZELE1BRU8sSUFBSUcsTUFBTSxFQUFWLEVBQWM7QUFDakJILHNCQUFNLElBQU47QUFDSCxhQUZNLE1BRUEsSUFBSUcsTUFBTSxFQUFWLEVBQWM7QUFDakJILHNCQUFNLE1BQU47QUFDSCxhQUZNLE1BRUEsSUFBSUcsTUFBTSxDQUFWLEVBQWE7QUFDaEJILHNCQUFNRyxNQUFNLElBQVo7QUFDSCxhQUZNLE1BRUEsSUFBSUEsT0FBTyxDQUFYLEVBQWM7QUFDakJILHNCQUFNLEtBQU47QUFDSCxhQUZNLE1BRUEsSUFBSUcsT0FBTyxDQUFYLEVBQWM7QUFDakJILHNCQUFNLEtBQU47QUFDSCxhQUZNLE1BRUEsSUFBSUcsT0FBTyxDQUFYLEVBQWM7QUFDakJILHNCQUFNLElBQU47QUFDSCxhQUZNLE1BRUE7QUFDSCxvQkFBSU0sU0FBUyxDQUFiLEVBQWdCO0FBQ1pOLDBCQUFNTSxRQUFRLEtBQWQ7QUFDSCxpQkFGRCxNQUVPO0FBQ0gsd0JBQUlDLFlBQVksQ0FBaEIsRUFBbUI7QUFDZlAsOEJBQU0sSUFBTjtBQUNILHFCQUZELE1BRU87QUFDSEEsOEJBQU1PLFVBQVUsS0FBaEI7QUFDSDtBQUNKO0FBQ0o7QUFDRCxtQkFBT1AsR0FBUDtBQUNILFNBcENEO0FBcUNBLFlBQU1ZLFNBQVMsU0FBVEEsTUFBUyxDQUFVQyxJQUFWLEVBQWdCO0FBQzNCLGdCQUFJQyxRQUFRckUsR0FBR3NFLEtBQUgsRUFBWjtBQUNBQyxjQUFFQyxTQUFGLENBQVlKLElBQVosRUFBa0IsWUFBWTtBQUMxQkMsc0JBQU1JLE9BQU47QUFDSCxhQUZEO0FBR0EsbUJBQU9KLE1BQU1LLE9BQWI7QUFDSCxTQU5EO0FBT0EsZUFBTztBQUNIakUsMkJBQWVBLGFBRFo7QUFFSFIscUJBQVNBLE9BRk47QUFHSE0sc0JBQVVBLFFBSFA7QUFJSHVCLHNCQUFVQSxRQUpQO0FBS0hSLHVCQUFXQSxTQUxSO0FBTUhNLDhCQUFrQkEsZ0JBTmY7QUFPSGhCLDRCQUFnQkEsY0FQYjtBQVFIeUIsdUJBQVdBLFNBUlI7QUFTSEcsMkJBQWVBLGFBVFo7QUFVSHdCLDZCQUFpQkEsZUFWZDtBQVdIYiw2QkFBaUJBLGVBWGQ7QUFZSGUseUJBQWFBLFdBWlY7QUFhSEMsb0JBQVFBO0FBYkwsU0FBUDtBQWVILEtBNUt5QixDQUE5QixFQTZLS1EsT0E3S0wsQ0E2S2EsWUE3S2IsRUE2SzJCLENBQUMsT0FBRCxFQUFVLFVBQVVDLEtBQVYsRUFBaUI7QUFDOUM7O0FBQ0EsWUFBTUMsY0FBYyxTQUFkQSxXQUFjLENBQUNDLEdBQUQsRUFBb0I7QUFBQSw4Q0FBWEMsTUFBVztBQUFYQSxzQkFBVztBQUFBOztBQUNwQyxnQkFBSUMsV0FBV0YsR0FBZjtBQUFBLGdCQUNJRyxpQkFBV0YsTUFBWCxDQURKO0FBRUEsaUJBQUssSUFBSUcsSUFBSSxDQUFSLEVBQVdDLElBQUlGLEtBQUsxQyxNQUF6QixFQUFpQzJDLElBQUlDLENBQXJDLEVBQXdDRCxHQUF4QyxFQUE2QztBQUN6Q0YsNEJBQVksTUFBTUMsS0FBS0MsQ0FBTCxDQUFsQjtBQUNIO0FBQ0QsbUJBQU9GLFFBQVA7QUFDSCxTQVBEO0FBUUE7QUFDQTs7QUFYOEMsWUFZeENJLGVBWndDO0FBYTFDLHFDQUFZQyxjQUFaLEVBQTRCO0FBQUE7O0FBQ3hCLHFCQUFLQSxjQUFMLEdBQXNCQSxpQkFBaUJBLGNBQWpCLEdBQWtDLFlBQXhEO0FBQ0E7QUFDQSxxQkFBS0MsVUFBTCxHQUFrQixLQUFsQjtBQUNBO0FBQ0EscUJBQUtDLGFBQUwsR0FBcUIsQ0FBckI7QUFDQSxxQkFBSyxLQUFLRixjQUFWLElBQTRCLEVBQTVCO0FBQ0g7O0FBcEJ5QztBQUFBO0FBQUEscUNBcUJyQ0csVUFyQnFDLEVBcUJ6QkMsVUFyQnlCLEVBcUJiO0FBQUE7O0FBQ3pCLHlCQUFLSCxVQUFMLEdBQWtCLEtBQWxCO0FBQ0EseUJBQUtDLGFBQUwsR0FBcUIsQ0FBckI7QUFDQSx5QkFBSyxLQUFLRixjQUFWLElBQTZCLFlBQU07QUFDL0IsNEJBQUksQ0FBQ0csVUFBRCxJQUFlQSxXQUFXakQsTUFBWCxLQUFzQixDQUF6QyxFQUE0QztBQUN4QyxtQ0FBTyxFQUFQO0FBQ0gseUJBRkQsTUFFTztBQUNILGdDQUFJckMsT0FBT0MsU0FBUCxDQUFpQkMsUUFBakIsQ0FBMEJDLElBQTFCLENBQStCbUYsV0FBVyxDQUFYLENBQS9CLE1BQWtELGlCQUF0RCxFQUF5RTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNyRSx5REFBaUJBLFVBQWpCLDhIQUE2QjtBQUFBLDRDQUFwQkUsSUFBb0I7O0FBQ3pCQSw2Q0FBS0MsU0FBTCxHQUFpQixJQUFqQjtBQUNBLDRDQUFJLE9BQU9GLFVBQVAsS0FBc0IsV0FBMUIsRUFBdUNDLEtBQUtELFVBQUwsR0FBa0JBLFVBQWxCO0FBQ3ZDLDRDQUFJQyxLQUFLRCxVQUFULEVBQXFCLE1BQUtGLGFBQUw7QUFDeEI7QUFMb0U7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU14RSw2QkFORCxNQU1PO0FBQ0gscUNBQUssSUFBSUwsSUFBSSxDQUFSLEVBQVdDLElBQUlLLFdBQVdqRCxNQUEvQixFQUF1QzJDLElBQUlDLENBQTNDLEVBQThDRCxHQUE5QyxFQUFtRDtBQUMvQ00sK0NBQVdOLENBQVgsSUFBZ0I7QUFDWlEsOENBQU1GLFdBQVdOLENBQVgsQ0FETTtBQUVaUyxtREFBVyxJQUZDO0FBR1pGLG9EQUFZQTtBQUhBLHFDQUFoQjtBQUtBLHdDQUFJLE9BQU9BLFVBQVAsS0FBc0IsV0FBMUIsRUFBdUNELFdBQVdOLENBQVgsRUFBY08sVUFBZCxHQUEyQkEsVUFBM0I7QUFDdkMsd0NBQUlELFdBQVdOLENBQVgsRUFBY08sVUFBbEIsRUFBOEIsTUFBS0YsYUFBTDtBQUNqQztBQUNKO0FBQ0QsZ0NBQUksTUFBS0EsYUFBTCxLQUF1QkMsV0FBV2pELE1BQXRDLEVBQThDLE1BQUsrQyxVQUFMLEdBQWtCLElBQWxCO0FBQzlDLG1DQUFPRSxVQUFQO0FBQ0g7QUFDSixxQkF4QjJCLEVBQTVCO0FBeUJIO0FBakR5QztBQUFBO0FBQUEsNENBa0Q5QkUsSUFsRDhCLEVBa0R4QkQsVUFsRHdCLEVBa0RaO0FBQ3RCLHdCQUFJRyxpQkFBaUIsSUFBckI7QUFDQUYseUJBQUtELFVBQUwsR0FBa0JBLFVBQWxCO0FBQ0Esd0JBQUlBLFVBQUosRUFBZ0I7QUFDWiw2QkFBS0YsYUFBTDtBQUNBLDRCQUFJQyxhQUFhLEtBQUssS0FBS0gsY0FBVixDQUFqQjtBQUNBO0FBSFk7QUFBQTtBQUFBOztBQUFBO0FBSVosa0RBQW9CRyxVQUFwQixtSUFBZ0M7QUFBQSxvQ0FBdkJLLE9BQXVCOztBQUM1QixvQ0FBSUEsUUFBUUYsU0FBUixJQUFxQixDQUFDRSxRQUFRSixVQUFsQyxFQUE4QztBQUMxQ0cscURBQWlCLEtBQWpCO0FBQ0E7QUFDSDtBQUNKO0FBVFc7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFVWiw0QkFBSUEsY0FBSixFQUFvQjtBQUNoQixpQ0FBS04sVUFBTCxHQUFrQixJQUFsQjtBQUNIO0FBQ0oscUJBYkQsTUFhTztBQUNILDZCQUFLQyxhQUFMO0FBQ0EsNkJBQUtELFVBQUwsR0FBa0IsS0FBbEI7QUFDSDtBQUNKO0FBQ0Q7O0FBdkVzQztBQUFBO0FBQUEsNkNBd0U3QkEsVUF4RTZCLEVBd0VqQjtBQUNyQix5QkFBS0EsVUFBTCxHQUFrQixPQUFPQSxVQUFQLEtBQXNCLFdBQXRCLEdBQW9DLEtBQUtBLFVBQXpDLEdBQXNEQSxVQUF4RTtBQUNBLHlCQUFLQyxhQUFMLEdBQXFCLENBQXJCO0FBQ0Esd0JBQUlDLGFBQWEsS0FBSyxLQUFLSCxjQUFWLENBQWpCO0FBSHFCO0FBQUE7QUFBQTs7QUFBQTtBQUlyQiw4Q0FBb0JHLFVBQXBCLG1JQUFnQztBQUFBLGdDQUF2QkssT0FBdUI7O0FBQzVCLGdDQUFJQSxRQUFRRixTQUFSLElBQXFCLEtBQUtMLFVBQTlCLEVBQTBDO0FBQ3RDTyx3Q0FBUUosVUFBUixHQUFxQixJQUFyQjtBQUNBLHFDQUFLRixhQUFMO0FBQ0gsNkJBSEQsTUFHTztBQUNITSx3Q0FBUUosVUFBUixHQUFxQixLQUFyQjtBQUNIO0FBQ0o7QUFYb0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVl4QjtBQXBGeUM7QUFBQTtBQUFBLDhDQXFGNUJLLFFBckY0QixFQXFGbEJDLFVBckZrQixFQXFGTjtBQUNoQyx5QkFBS1QsVUFBTCxHQUFrQixLQUFsQjtBQUNBLHlCQUFLQyxhQUFMLEdBQXFCLENBQXJCO0FBQ0Esd0JBQUksT0FBT1EsVUFBUCxLQUFzQixXQUExQixFQUF1QztBQUNuQ0EscUNBQWEsTUFBYjtBQUNIO0FBQ0Qsd0JBQUlQLGFBQWEsS0FBSyxLQUFLSCxjQUFWLENBQWpCO0FBQ0E7QUFDQSx3QkFBSUcsV0FBVyxDQUFYLEVBQWNPLFVBQWQsTUFBOEIsS0FBSyxDQUF2QyxFQUEwQztBQUN0QztBQUNIO0FBVitCO0FBQUE7QUFBQTs7QUFBQTtBQVdoQyw4Q0FBb0JQLFVBQXBCLG1JQUFnQztBQUFBLGdDQUF2QkssT0FBdUI7O0FBQzVCQSxvQ0FBUUosVUFBUixHQUFxQixLQUFyQjtBQUNBSSxvQ0FBUUYsU0FBUixHQUFvQkUsUUFBUUUsVUFBUixFQUFvQkMsT0FBcEIsQ0FBNEJGLFFBQTVCLE1BQTBDLENBQUMsQ0FBL0Q7QUFDSDtBQWQrQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBZW5DO0FBcEd5Qzs7QUFBQTtBQUFBOztBQXdHOUMsWUFBTUcsZUFBZSxTQUFmQSxZQUFlLENBQVVuQixHQUFWLEVBQWU7QUFDaEMsaUJBQUtvQixPQUFMLEdBQWU7QUFBQSxtREFBSWpCLElBQUo7QUFBSUEsd0JBQUo7QUFBQTs7QUFBQSx1QkFBYUwsTUFBTXVCLEdBQU4sQ0FBVXRCLDhCQUFZQyxHQUFaLFNBQW9CRyxJQUFwQixFQUFWLENBQWI7QUFBQSxhQUFmO0FBQ0EsaUJBQUttQixPQUFMLEdBQWUsVUFBQzdFLElBQUQsRUFBTzhFLE1BQVA7QUFBQSx1QkFBa0J6QixNQUFNMEIsSUFBTixDQUFXeEIsR0FBWCxFQUFnQnZELElBQWhCLEVBQXNCOEUsTUFBdEIsQ0FBbEI7QUFBQSxhQUFmO0FBQ0EsaUJBQUtFLFVBQUwsR0FBa0I7QUFBQSx1QkFBUTNCLE1BQU00QixHQUFOLENBQVUxQixHQUFWLEVBQWV2RCxJQUFmLENBQVI7QUFBQSxhQUFsQjtBQUNBLGlCQUFLa0YsVUFBTCxHQUFrQjtBQUFBLG1EQUFJeEIsSUFBSjtBQUFJQSx3QkFBSjtBQUFBOztBQUFBLHVCQUFhTCxNQUFNOEIsTUFBTixDQUFhN0IsOEJBQVlDLEdBQVosU0FBb0JHLElBQXBCLEVBQWIsQ0FBYjtBQUFBLGFBQWxCO0FBQ0gsU0FMRDtBQU1BLFlBQU0wQixtQkFBbUIsU0FBbkJBLGdCQUFtQixXQUFZO0FBQ2pDLGdCQUFJLENBQUNDLFFBQUwsRUFBZUEsV0FBVyxFQUFYO0FBQ2YsbUJBQU8sVUFBQ0MsU0FBRCxFQUF3QjtBQUFBLG1EQUFUNUIsSUFBUztBQUFUQSx3QkFBUztBQUFBOztBQUMzQixvQkFBSTZCLFlBQUo7QUFBQSxvQkFBU0MsT0FBT0gsU0FBU0MsU0FBVCxDQUFoQjtBQUNBLG9CQUFJLE9BQU9FLElBQVAsSUFBZSxVQUFuQixFQUErQjtBQUMzQkQsNkRBQVVDLElBQVYsZ0JBQWtCOUIsSUFBbEI7QUFDSCxpQkFGRCxNQUVPO0FBQ0g2QiwwQkFBTSxFQUFOO0FBQ0FFLDRCQUFRQyxHQUFSLENBQVksdUJBQXVCSixTQUFuQztBQUNIO0FBQ0QsdUJBQU9DLEdBQVA7QUFDSCxhQVREO0FBVUgsU0FaRDtBQWFBLGVBQU87QUFDSDFCLDZCQUFpQkEsZUFEZDtBQUVIYSwwQkFBY0EsWUFGWDtBQUdIVSw4QkFBa0JBO0FBSGYsU0FBUDtBQUtILEtBaElzQixDQTdLM0I7QUE4U0k7QUE5U0osS0ErU0tPLFFBL1NMLENBK1NjLFdBL1NkLEVBK1MyQixZQUFZO0FBQy9COztBQUNBLFlBQUkzRixPQUFPLEVBQVg7QUFDQSxZQUFNNkUsVUFBVSxTQUFWQSxPQUFVLENBQUNlLEdBQUQsRUFBTUMsS0FBTixFQUFnQjtBQUM1QjdGLGlCQUFLNEYsR0FBTCxJQUFZQyxLQUFaO0FBQ0gsU0FGRDtBQUdBLFlBQU1sQixVQUFVLFNBQVZBLE9BQVU7QUFBQSxtQkFBTzNFLEtBQUs0RixHQUFMLENBQVA7QUFBQSxTQUFoQjtBQUNBLFlBQU1FLFVBQVUsU0FBVkEsT0FBVSxNQUFPO0FBQ25CLGdCQUFJOUYsS0FBSzRGLEdBQUwsQ0FBSixFQUFlO0FBQ1g1RixxQkFBSzRGLEdBQUwsSUFBWSxJQUFaO0FBQ0g7QUFDSixTQUpEO0FBS0EsZUFBTztBQUNIZixxQkFBU0EsT0FETjtBQUVIa0Isa0JBQU0sZ0JBQVk7QUFDZCx1QkFBTztBQUNIbEIsNkJBQVNBLE9BRE47QUFFSEYsNkJBQVNBLE9BRk47QUFHSG1CLDZCQUFTQTtBQUhOLGlCQUFQO0FBS0g7QUFSRSxTQUFQO0FBVUgsS0FyVUw7QUFzVUEzSCxXQUFPRSxZQUFQLEdBQXNCQSxZQUF0QjtBQUNILENBelVELEVBeVVHRixNQXpVSCIsImZpbGUiOiJjb21tb24vcHVibGljTW9kdWxlL3B1YmxpY01vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXHJcbiAqIEBhdXRob3IgQ2hhbmRyYUxlZVxyXG4gKiBAZGVzY3JpcHRpb24g5YWs5YWx5qih5Z2XXHJcbiAqL1xyXG5cclxuKGZ1bmN0aW9uICh3aW5kb3csIHVuZGVmaW5lZCkge1xyXG4gICAgbGV0IHB1YmxpY01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwdWJsaWNNb2R1bGUnLCBbXSk7XHJcbiAgICBwdWJsaWNNb2R1bGUuc2VydmljZSgnJHV0aWwnLCBbJyRxJywgZnVuY3Rpb24gKCRxKSB7XHJcbiAgICAgICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICAgICAgY29uc3QgaXNBcnJheSA9IGFycmF5ID0+IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcnJheSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XHJcbiAgICAgICAgICAgIGNvbnN0IGlzT2JqZWN0ID0gb2JqID0+IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBPYmplY3RdJztcclxuICAgICAgICAgICAgLy8gIGlzIHt9XHJcbiAgICAgICAgICAgIGNvbnN0IGlzRW1wdHlPYmplY3QgPSBvYmogPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpc09iamVjdChvYmopKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbiBpbiBvYmopIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KG4pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3QgZ2V0UXVlcnlTdHJpbmcgPSBuYW1lID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCByZWcgPSBuZXcgUmVnRXhwKCcoXnwmKScgKyBuYW1lICsgJz0oW14mXSopKCZ8JCknLCAnaScpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHIgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cigxKS5tYXRjaChyZWcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHIgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5lc2NhcGUoclsyXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3QgdG9EZWNpbWFsID0gKGRhdGEsIG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEgPT09IG51bGwgfHwgaXNOYU4oZGF0YSkpIHJldHVybiB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gK3BhcnNlRmxvYXQoZGF0YSkudG9GaXhlZChudW1iZXIpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBmb3JtYXJ0Qnl0ZXNEYXRhID0gKGRhdGEsIHVuaXQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhID09PSBudWxsIHx8IGlzTmFOKGRhdGEpKSByZXR1cm4gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh1bml0KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdNQic6XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9ICgrZGF0YSAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnR0InOlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSAoK2RhdGEgLyAxMDI0IC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdLQic6XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9ICgrZGF0YSAvIDEwMjQpLnRvRml4ZWQoMik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhLnRvRml4ZWQoMik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gK2RhdGE7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8vIEBwYXJhbSBzdHI6PHNwYW4+e3sjbmFtZX19PC9zcGFuPjxwPnt7I2FnZX19PC9wPlxyXG4gICAgICAgICAgICAvLyBAcGFyYW0gZGF0YTp7bmFtZTonY2hhbmRyYScsYWdlOjEyLGFkZHI6J2NoaW5hJ31cclxuICAgICAgICAgICAgLy8gQHJldHVybiA8c3Bhbj5jaGFuZHJhPC9zcGFuPjxwPjEyPC9wPlxyXG4gICAgICAgICAgICBjb25zdCBwYXJzZVRwbCA9IChzdHIsIGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGF0dCA9IG5ldyBSZWdFeHAoJ1xce1xcIyhbYS16QS16MC05XSspXFx9Jyk7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoKHJlc3VsdCA9IHBhdHQuZXhlYyhzdHIpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB2ID0gZGF0YVtyZXN1bHRbMV1dID09PSAwID8gJzAnIDogZGF0YVtyZXN1bHRbMV1dIHx8ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKG5ldyBSZWdFeHAocmVzdWx0WzBdLCAnZycpLCB2KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBzdHI7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IG9iakxlbmd0aCA9IG9iaiA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWlzT2JqZWN0KG9iaikpIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBjYWxjdWxhdGVEYXRlID0gKHN0YXJ0RGF0ZSwgZGF5SW50ZXJ2YWwpID0+IHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZSA9IG5ldyBEYXRlKHN0YXJ0RGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBzdGFydERhdGUuc2V0RGF0ZShzdGFydERhdGUuZ2V0RGF0ZSgpICsgZGF5SW50ZXJ2YWwpOyAvL2dldCB0aGUgZGF0ZSBhZnRlciBkYXlJbnRlcnZhbCBkYXlzIG9yIGJlZm9yZSBkYXlJbnRlcnZhbCBkYXlzLHN1Y2ggYXMgYWZ0ZXIgMiBkYXlzLCBhZnRlciAzIGRheXMsIGJlZm9yZSAyIGRheXMgLCBiZWZvcmUgMyBkYXlzIGFuZCBzbyBvblxyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSBzdGFydERhdGUuZ2V0RnVsbFllYXIoKSxcclxuICAgICAgICAgICAgICAgICAgICBtID0gc3RhcnREYXRlLmdldE1vbnRoKCkgKyAxLFxyXG4gICAgICAgICAgICAgICAgICAgIGQgPSBzdGFydERhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG0gPCAxMCkgbSA9ICcwJyArIG07XHJcbiAgICAgICAgICAgICAgICBpZiAoZCA8IDEwKSBkID0gJzAnICsgZDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB5ICsgJy0nICsgbSArICctJyArIGQ7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8vICBpbnRlcnZhbCBiZXR3ZWVuIG5vdyBhbmQgc2Vjb25kc1xyXG4gICAgICAgICAgICBjb25zdCBnZXREYXRlSW50ZXJ2YWwgPSAoc3RhcnQsIGVuZCwgaXNOZWVkU2Vjb25kcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlcyA9IHt9O1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbmQgPT09ICd1bmRlZmluZWQnKSBlbmQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgICAgIGxldCBpbnRlcnZhbCA9IGVuZCAtIHN0YXJ0O1xyXG4gICAgICAgICAgICAgICAgcmVzLmRheSA9IE1hdGguZmxvb3IoaW50ZXJ2YWwgLyAoMjQgKiAzNjAwICogMTAwMCkpO1xyXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwgLT0gcmVzLmRheSAqIDI0ICogMzYwMCAqIDEwMDA7XHJcbiAgICAgICAgICAgICAgICByZXMuaG91cnMgPSBNYXRoLmZsb29yKGludGVydmFsIC8gKDM2MDAgKiAxMDAwKSk7XHJcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCAtPSByZXMuaG91cnMgKiAzNjAwICogMTAwMDtcclxuICAgICAgICAgICAgICAgIHJlcy5taW11dGVzID0gTWF0aC5mbG9vcihpbnRlcnZhbCAvICg2MCAqIDEwMDApKTtcclxuICAgICAgICAgICAgICAgIGlmIChpc05lZWRTZWNvbmRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWwgLT0gcmVzLm1pbXV0ZXMgKiA2MCAqIDEwMDA7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNlY29uZHMgPSBNYXRoLmZsb29yKGludGVydmFsIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBnZXRQYWdlSW50ZXJ2YWwgPSAoc3RhcnQsIGVuZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHN0ciA9ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGludGVydmFsVGltZTtcclxuICAgICAgICAgICAgICAgIGlmICghc3RhcnQgfHwgIWVuZCB8fCBlbmQgLSBzdGFydCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gJzDnp5InO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnRlcnZhbFRpbWUgPSBnZXREYXRlSW50ZXJ2YWwoc3RhcnQsIGVuZCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGludGVydmFsVGltZS5kYXkgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGludGVydmFsVGltZS5kYXkgKyAn5aSpJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGludGVydmFsVGltZS5ob3VycyAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gaW50ZXJ2YWxUaW1lLmhvdXJzICsgJ+Wwj+aXtic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnRlcnZhbFRpbWUubWltdXRlcyAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gaW50ZXJ2YWxUaW1lLm1pbXV0ZXMgKyAn5YiG6ZKfJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGludGVydmFsVGltZS5zZWNvbmRzICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSBpbnRlcnZhbFRpbWUuc2Vjb25kcyArICfnp5InO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RyID09PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgPSAnMOenkic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3QgZ2V0UGFnZURhdGUgPSAoc3RhcnQsIGVuZCwgaXNOZWVkU2Vjb25kcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzdGFydCAmJiAhZW5kIHx8IHN0YXJ0IC0gZW5kIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ+aXoCc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IGdldERhdGVJbnRlcnZhbChzdGFydCwgZW5kLCBpc05lZWRTZWNvbmRzKSxcclxuICAgICAgICAgICAgICAgICAgICBkYXkgPSBpbnRlcnZhbC5kYXksXHJcbiAgICAgICAgICAgICAgICAgICAgaG91cnMgPSBpbnRlcnZhbC5ob3VycyxcclxuICAgICAgICAgICAgICAgICAgICBtaW11dGVzID0gaW50ZXJ2YWwubWltdXRlcztcclxuICAgICAgICAgICAgICAgIGxldCByZXM7XHJcbiAgICAgICAgICAgICAgICAvLyDlrqLmiLfnq6/ml7bpl7TlkozmnI3liqHlmajml7bpl7TkuI3nu5/kuIDpgKDmiJDnmoTotJ/mlbDmg4XlhrVcclxuICAgICAgICAgICAgICAgIGlmIChkYXkgPCAwIHx8IGhvdXJzIDwgMCB8fCBtaW11dGVzIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcyA9ICfliJrliJonO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkYXkgPiA2MCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcyA9ICfmm7Tml6knO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkYXkgPiAzMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcyA9ICfkuIDkuKrmnIjliY0nO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkYXkgPiAzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzID0gZGF5ICsgJ+WkqeWJjSc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRheSA9PSAzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzID0gJ+S4ieWkqeWJjSc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRheSA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzID0gJ+S4pOWkqeWJjSc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRheSA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzID0gJ+aYqOWkqSc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChob3VycyA+PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IGhvdXJzICsgJ+Wwj+aXtuWJjSc7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1pbXV0ZXMgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9ICfliJrliJonO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gbWltdXRlcyArICfliIbpkp/liY0nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3QgbG9hZEpzID0gZnVuY3Rpb24gKHBhdGgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkZWxheSA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAkLmdldFNjcmlwdChwYXRoLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsYXkucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVsYXkucHJvbWlzZTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGlzRW1wdHlPYmplY3Q6IGlzRW1wdHlPYmplY3QsXHJcbiAgICAgICAgICAgICAgICBpc0FycmF5OiBpc0FycmF5LFxyXG4gICAgICAgICAgICAgICAgaXNPYmplY3Q6IGlzT2JqZWN0LFxyXG4gICAgICAgICAgICAgICAgcGFyc2VUcGw6IHBhcnNlVHBsLFxyXG4gICAgICAgICAgICAgICAgdG9EZWNpbWFsOiB0b0RlY2ltYWwsXHJcbiAgICAgICAgICAgICAgICBmb3JtYXJ0Qnl0ZXNEYXRhOiBmb3JtYXJ0Qnl0ZXNEYXRhLFxyXG4gICAgICAgICAgICAgICAgZ2V0UXVlcnlTdHJpbmc6IGdldFF1ZXJ5U3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgb2JqTGVuZ3RoOiBvYmpMZW5ndGgsXHJcbiAgICAgICAgICAgICAgICBjYWxjdWxhdGVEYXRlOiBjYWxjdWxhdGVEYXRlLFxyXG4gICAgICAgICAgICAgICAgZ2V0UGFnZUludGVydmFsOiBnZXRQYWdlSW50ZXJ2YWwsXHJcbiAgICAgICAgICAgICAgICBnZXREYXRlSW50ZXJ2YWw6IGdldERhdGVJbnRlcnZhbCxcclxuICAgICAgICAgICAgICAgIGdldFBhZ2VEYXRlOiBnZXRQYWdlRGF0ZSxcclxuICAgICAgICAgICAgICAgIGxvYWRKczogbG9hZEpzXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfV0pXHJcbiAgICAgICAgLmZhY3RvcnkoJyRkb21lTW9kZWwnLCBbJyRodHRwJywgZnVuY3Rpb24gKCRodHRwKSB7XHJcbiAgICAgICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICAgICAgY29uc3QgZ2V0V2hvbGVVcmwgPSAodXJsLCAuLi5wYXJhbXMpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCB3aG9sZVVybCA9IHVybCxcclxuICAgICAgICAgICAgICAgICAgICBhcmdzID0gWy4uLnBhcmFtc107XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGFyZ3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2hvbGVVcmwgKz0gJy8nICsgYXJnc1tpXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB3aG9sZVVybDtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgLy8g5YW35pyJ6YCJ5oup5Yqf6IO955qEQ2xhc3PvvIzljIXmi6zpgInmi6nljZXpobnjgIHlhajpgInjgIHlhajkuI3pgIlcclxuICAgICAgICAgICAgLy8gQHBhcmFtIHNlbGVjdExpc3ROYW1lOiDpgInmi6npobnnmoRsaXN05a+56LGh55qEa2V555qE5ZCN5a2XLmVnOuS8oOWFpeKAmWhvc3RMaXN04oCY5a6e5L6L5YyW5ZCO5aaCe2hvc3RMaXN0Olt7Li4uLn1dfVxyXG4gICAgICAgICAgICBjbGFzcyBTZWxlY3RMaXN0TW9kZWwge1xyXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3Ioc2VsZWN0TGlzdE5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdExpc3ROYW1lID0gc2VsZWN0TGlzdE5hbWUgPyBzZWxlY3RMaXN0TmFtZSA6ICdzZWxlY3RMaXN0JztcclxuICAgICAgICAgICAgICAgICAgICAvLyDmmK/lkKblhajpgIlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2hlY2tBbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDpgInmi6npobnmlbDph4/nu5/orqFcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXNbdGhpcy5zZWxlY3RMaXN0TmFtZV0gPSBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluaXQoc2VsZWN0TGlzdCwgaXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpc1t0aGlzLnNlbGVjdExpc3ROYW1lXSA9ICgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc2VsZWN0TGlzdCB8fCBzZWxlY3RMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzZWxlY3RMaXN0WzBdKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpdGVtIG9mIHNlbGVjdExpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5rZXlGaWx0ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlzU2VsZWN0ZWQgIT09ICd1bmRlZmluZWQnKSBpdGVtLmlzU2VsZWN0ZWQgPSBpc1NlbGVjdGVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5pc1NlbGVjdGVkKSB0aGlzLnNlbGVjdGVkQ291bnQrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gc2VsZWN0TGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0TGlzdFtpXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IHNlbGVjdExpc3RbaV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXlGaWx0ZXI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkOiBpc1NlbGVjdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaXNTZWxlY3RlZCAhPT0gJ3VuZGVmaW5lZCcpIHNlbGVjdExpc3RbaV0uaXNTZWxlY3RlZCA9IGlzU2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RMaXN0W2ldLmlzU2VsZWN0ZWQpIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnQgPT09IHNlbGVjdExpc3QubGVuZ3RoKSB0aGlzLmlzQ2hlY2tBbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdExpc3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdG9nZ2xlQ2hlY2soaXRlbSwgaXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXNBbGxIYXNDaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmlzU2VsZWN0ZWQgPSBpc1NlbGVjdGVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0TGlzdCA9IHRoaXNbdGhpcy5zZWxlY3RMaXN0TmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDmmK/lkKbkuLrlhajpgIlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ0l0ZW0gb2Ygc2VsZWN0TGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaWdJdGVtLmtleUZpbHRlciAmJiAhc2lnSXRlbS5pc1NlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQWxsSGFzQ2hhbmdlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0FsbEhhc0NoYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQtLTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWFqOmAiS/lhajkuI3pgIlcclxuICAgICAgICAgICAgICAgIGNoZWNrQWxsSXRlbShpc0NoZWNrQWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gdHlwZW9mIGlzQ2hlY2tBbGwgPT09ICd1bmRlZmluZWQnID8gdGhpcy5pc0NoZWNrQWxsIDogaXNDaGVja0FsbDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RMaXN0ID0gdGhpc1t0aGlzLnNlbGVjdExpc3ROYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzaWdJdGVtIG9mIHNlbGVjdExpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNpZ0l0ZW0ua2V5RmlsdGVyICYmIHRoaXMuaXNDaGVja0FsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnSXRlbS5pc1NlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnSXRlbS5pc1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmaWx0ZXJXaXRoS2V5KGtleXdvcmRzLCBmaWx0ZXJJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGZpbHRlckl0ZW0gPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckl0ZW0gPSAnaXRlbSc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RMaXN0ID0gdGhpc1t0aGlzLnNlbGVjdExpc3ROYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzmsqHmnInlr7nlupTnmoRrZXlcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0TGlzdFswXVtmaWx0ZXJJdGVtXSA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgc2lnSXRlbSBvZiBzZWxlY3RMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ0l0ZW0uaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaWdJdGVtLmtleUZpbHRlciA9IHNpZ0l0ZW1bZmlsdGVySXRlbV0uaW5kZXhPZihrZXl3b3JkcykgIT09IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IFNlcnZpY2VNb2RlbCA9IGZ1bmN0aW9uICh1cmwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGF0YSA9ICguLi5hcmdzKSA9PiAkaHR0cC5nZXQoZ2V0V2hvbGVVcmwodXJsLCAuLi5hcmdzKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldERhdGEgPSAoZGF0YSwgY29uZmlnKSA9PiAkaHR0cC5wb3N0KHVybCwgZGF0YSwgY29uZmlnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRGF0YSA9IGRhdGEgPT4gJGh0dHAucHV0KHVybCwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZURhdGEgPSAoLi4uYXJncykgPT4gJGh0dHAuZGVsZXRlKGdldFdob2xlVXJsKHVybCwgLi4uYXJncykpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZXNDcmVhdG9yID0gY2xhc3NNYXAgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFjbGFzc01hcCkgY2xhc3NNYXAgPSB7fTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoY2xhc3NOYW1lLCAuLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGlucywgZnVuYyA9IGNsYXNzTWFwW2NsYXNzTmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmdW5jID09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zID0gbmV3IGZ1bmMoLi4uYXJncyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcjp0aGVyZSBpcyBubyAnICsgY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlucztcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBTZWxlY3RMaXN0TW9kZWw6IFNlbGVjdExpc3RNb2RlbCxcclxuICAgICAgICAgICAgICAgIFNlcnZpY2VNb2RlbDogU2VydmljZU1vZGVsLFxyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VzQ3JlYXRvcjogaW5zdGFuY2VzQ3JlYXRvclxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1dKVxyXG4gICAgICAgIC8vIOaVsOaNruWtmOWCqHNlcnZpY2VcclxuICAgICAgICAucHJvdmlkZXIoJyRkb21lRGF0YScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHt9O1xyXG4gICAgICAgICAgICBjb25zdCBzZXREYXRhID0gKGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBnZXREYXRhID0ga2V5ID0+IGRhdGFba2V5XTtcclxuICAgICAgICAgICAgY29uc3QgZGVsRGF0YSA9IGtleSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YVtrZXldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHNldERhdGE6IHNldERhdGEsXHJcbiAgICAgICAgICAgICAgICAkZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0RGF0YTogc2V0RGF0YSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0RGF0YTogZ2V0RGF0YSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsRGF0YTogZGVsRGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB3aW5kb3cucHVibGljTW9kdWxlID0gcHVibGljTW9kdWxlO1xyXG59KSh3aW5kb3cpOyJdfQ==
