'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @description: 公共函数
 * @version: 0.1
 */
var publicModule = angular.module('publicModule', []);
publicModule.service('$util', ['$q', function ($q) {
    'use strict';
    //  is {}

    var isEmptyObject = function isEmptyObject(obj) {
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
        if (data === null || data === undefined || isNaN(data)) return data;
        if (typeof data !== 'number') {
            return parseFloat(parseFloat(data).toFixed(number));
        } else {
            return parseFloat(data.toFixed(number));
        }
    };
    var formartBytesData = function formartBytesData(data, unit) {
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
    var parseTpl = function parseTpl(str, data) {
        var result;
        var patt = new RegExp('\{\#([a-zA-z0-9]+)\}');
        while ((result = patt.exec(str)) !== null) {
            var v = data[result[1]] === 0 ? '0' : data[result[1]] || '';
            str = str.replace(new RegExp(result[0], 'g'), v);
        }
        return str;
    };
    var objLength = function objLength(obj) {
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
    var isNullorEmpty = function isNullorEmpty(obj) {
        if (!obj || obj && isEmptyObject(obj)) {
            return true;
        }
        return false;
    };
    var calculateDate = function calculateDate(startDate, dayInterval) {
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
    var getDateInterval = function getDateInterval(start, end, isNeedSeconds) {
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
    var getPageInterval = function getPageInterval(start, end) {
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
    var getPageDate = function getPageDate(start, end, isNeedSeconds) {
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
    var loadJs = function loadJs(path) {
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
}]).factory('$domeModel', ['$http', function ($http) {
    'use strict';

    var getWholeUrl = function getWholeUrl(url, params) {
        var wholeUrl = url,
            i;
        for (i = 0; i < params.length; i++) {
            wholeUrl += '/' + params[i];
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
                        if (_typeof(selectList[0]) === 'object') {
                            for (var i = 0; i < selectList.length; i++) {
                                selectList[i].keyFilter = true;
                                if (isSelected !== undefined) selectList[i].isSelected = isSelected;
                                if (selectList[i].isSelected) _this.selectedCount++;
                            }
                        } else {
                            for (var _i = 0; _i < selectList.length; _i++) {
                                selectList[_i] = {
                                    item: selectList[_i],
                                    keyFilter: true,
                                    isSelected: isSelected
                                };
                                if (isSelected !== undefined) selectList[_i].isSelected = isSelected;
                                if (selectList[_i].isSelected) _this.selectedCount++;
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
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = selectList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var sigItem = _step.value;

                            if (sigItem.keyFilter && !sigItem.isSelected) {
                                isAllHasChange = false;
                                break;
                            }
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
                this.isCheckAll = isCheckAll === undefined ? this.isCheckAll : isCheckAll;
                this.selectedCount = 0;
                var selectList = this[this.selectListName];
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = selectList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var sigItem = _step2.value;

                        if (sigItem.keyFilter && this.isCheckAll) {
                            sigItem.isSelected = true;
                            this.selectedCount++;
                        } else {
                            sigItem.isSelected = false;
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
            }
        }, {
            key: 'filterWithKey',
            value: function filterWithKey(keywords, filterItem) {
                this.isCheckAll = false;
                this.selectedCount = 0;
                if (filterItem === undefined) {
                    filterItem = 'item';
                }
                var selectList = this[this.selectListName];
                // 如果没有对应的key
                if (selectList[0][filterItem] === undefined) {
                    return;
                }
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = selectList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var sigItem = _step3.value;

                        sigItem.isSelected = false;
                        sigItem.keyFilter = sigItem[filterItem].indexOf(keywords) !== -1;
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
        }]);

        return SelectListModel;
    }();

    var ServiceModel = function ServiceModel(url) {
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
    var instancesCreator = function instancesCreator(classMap) {
        if (!classMap) classMap = {};
        return function (className) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return function () {
                var ins,
                    func = classMap[className];
                if (func && typeof func == 'function') {
                    ins = new (Function.prototype.bind.apply(func, [null].concat(args)))();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9wdWJsaWNNb2R1bGUvcHVibGljTW9kdWxlLmVzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUlBLElBQUksZUFBZSxRQUFRLE1BQVIsQ0FBZSxjQUFmLEVBQStCLEVBQS9CLENBQWY7QUFDSixhQUFhLE9BQWIsQ0FBcUIsT0FBckIsRUFBOEIsQ0FBQyxJQUFELEVBQU8sVUFBVSxFQUFWLEVBQWM7QUFDM0M7O0FBRDJDO0FBRzNDLFFBQUksZ0JBQWdCLFNBQWhCLGFBQWdCLENBQVUsR0FBVixFQUFlO0FBQy9CLGFBQUssSUFBSSxDQUFKLElBQVMsR0FBZCxFQUFtQjtBQUNmLGdCQUFJLElBQUksY0FBSixDQUFtQixDQUFuQixDQUFKLEVBQTJCO0FBQ3ZCLHVCQUFPLEtBQVAsQ0FEdUI7YUFBM0I7U0FESjtBQUtBLGVBQU8sSUFBUCxDQU4rQjtLQUFmLENBSHVCO0FBVzNDLFFBQUksaUJBQWlCLFNBQWpCLGNBQWlCLENBQVUsSUFBVixFQUFnQjtBQUNqQyxZQUFJLE1BQU0sSUFBSSxNQUFKLENBQVcsVUFBVSxJQUFWLEdBQWlCLGVBQWpCLEVBQWtDLEdBQTdDLENBQU4sQ0FENkI7QUFFakMsWUFBSSxJQUFJLE9BQU8sUUFBUCxDQUFnQixNQUFoQixDQUF1QixNQUF2QixDQUE4QixDQUE5QixFQUFpQyxLQUFqQyxDQUF1QyxHQUF2QyxDQUFKLENBRjZCO0FBR2pDLFlBQUksTUFBTSxJQUFOLEVBQVk7QUFDWixtQkFBTyxTQUFTLEVBQUUsQ0FBRixDQUFULENBQVAsQ0FEWTtTQUFoQjtBQUdBLGVBQU8sSUFBUCxDQU5pQztLQUFoQixDQVhzQjtBQW1CM0MsUUFBSSxZQUFZLFNBQVosU0FBWSxDQUFVLElBQVYsRUFBZ0IsTUFBaEIsRUFBd0I7QUFDcEMsWUFBSSxTQUFTLElBQVQsSUFBaUIsU0FBUyxTQUFULElBQXNCLE1BQU0sSUFBTixDQUF2QyxFQUFvRCxPQUFPLElBQVAsQ0FBeEQ7QUFDQSxZQUFJLE9BQU8sSUFBUCxL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QUFUO0FBQ0EseUJBQVMsT0FBVDtBQUNBLHlCQUFTLE9BQVQ7YUFISixDQURjO1NBQVo7S0FGVixDQWQrQjtDQUFaLENBclUzQiIsImZpbGUiOiJjb21tb24vcHVibGljTW9kdWxlL3B1YmxpY01vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBAZGVzY3JpcHRpb246IOWFrOWFseWHveaVsFxuICogQHZlcnNpb246IDAuMVxuICovXG52YXIgcHVibGljTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3B1YmxpY01vZHVsZScsIFtdKTtcbnB1YmxpY01vZHVsZS5zZXJ2aWNlKCckdXRpbCcsIFsnJHEnLCBmdW5jdGlvbiAoJHEpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICAvLyAgaXMge31cbiAgICAgICAgdmFyIGlzRW1wdHlPYmplY3QgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBuIGluIG9iaikge1xuICAgICAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkobikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgZ2V0UXVlcnlTdHJpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoJyhefCYpJyArIG5hbWUgKyAnPShbXiZdKikoJnwkKScsICdpJyk7XG4gICAgICAgICAgICB2YXIgciA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpLm1hdGNoKHJlZyk7XG4gICAgICAgICAgICBpZiAociAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmVzY2FwZShyWzJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgdG9EZWNpbWFsID0gZnVuY3Rpb24gKGRhdGEsIG51bWJlcikge1xuICAgICAgICAgICAgaWYgKGRhdGEgPT09IG51bGwgfHwgZGF0YSA9PT0gdW5kZWZpbmVkIHx8IGlzTmFOKGRhdGEpKSByZXR1cm4gZGF0YTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChwYXJzZUZsb2F0KGRhdGEpLnRvRml4ZWQobnVtYmVyKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGRhdGEudG9GaXhlZChudW1iZXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGZvcm1hcnRCeXRlc0RhdGEgPSBmdW5jdGlvbiAoZGF0YSwgdW5pdCkge1xuICAgICAgICAgICAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCB8fCBkYXRhID09PSBudWxsIHx8IGlzTmFOKGRhdGEpKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgc3dpdGNoICh1bml0KSB7XG4gICAgICAgICAgICBjYXNlICdNQic6XG4gICAgICAgICAgICAgICAgZGF0YSA9ICgrZGF0YSAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnR0InOlxuICAgICAgICAgICAgICAgIGRhdGEgPSAoK2RhdGEgLyAxMDI0IC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdLQic6XG4gICAgICAgICAgICAgICAgZGF0YSA9ICgrZGF0YSAvIDEwMjQpLnRvRml4ZWQoMik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGRhdGEgPSArZGF0YS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICtkYXRhO1xuICAgICAgICB9O1xuICAgICAgICAvLyBAcGFyYW0gc3RyOjxzcGFuPnt7I25hbWV9fTwvc3Bhbj48cD57eyNhZ2V9fTwvcD5cbiAgICAgICAgLy8gQHBhcmFtIGRhdGE6e25hbWU6J2NoYW5kcmEnLGFnZToxMixhZGRyOidjaGluYSd9XG4gICAgICAgIC8vIEByZXR1cm4gPHNwYW4+Y2hhbmRyYTwvc3Bhbj48cD4xMjwvcD5cbiAgICAgICAgdmFyIHBhcnNlVHBsID0gZnVuY3Rpb24gKHN0ciwgZGF0YSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgIHZhciBwYXR0ID0gbmV3IFJlZ0V4cCgnXFx7XFwjKFthLXpBLXowLTldKylcXH0nKTtcbiAgICAgICAgICAgIHdoaWxlICgocmVzdWx0ID0gcGF0dC5leGVjKHN0cikpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIHYgPSBkYXRhW3Jlc3VsdFsxXV0gPT09IDAgPyAnMCcgOiBkYXRhW3Jlc3VsdFsxXV0gfHwgJyc7XG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cChyZXN1bHRbMF0sICdnJyksIHYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG9iakxlbmd0aCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHZhciBzaXplID0gMCxcbiAgICAgICAgICAgICAgICBrZXk7XG4gICAgICAgICAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2l6ZSsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzaXplO1xuICAgICAgICB9O1xuICAgICAgICAvLyBvYmogaXMgbnVsbCBvciB7fVxuICAgICAgICB2YXIgaXNOdWxsb3JFbXB0eSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIGlmICghb2JqIHx8IG9iaiAmJiBpc0VtcHR5T2JqZWN0KG9iaikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGNhbGN1bGF0ZURhdGUgPSBmdW5jdGlvbiAoc3RhcnREYXRlLCBkYXlJbnRlcnZhbCkge1xuICAgICAgICAgICAgc3RhcnREYXRlID0gbmV3IERhdGUoc3RhcnREYXRlKTtcbiAgICAgICAgICAgIHN0YXJ0RGF0ZS5zZXREYXRlKHN0YXJ0RGF0ZS5nZXREYXRlKCkgKyBkYXlJbnRlcnZhbCk7IC8vZ2V0IHRoZSBkYXRlIGFmdGVyIGRheUludGVydmFsIGRheXMgb3IgYmVmb3JlIGRheUludGVydmFsIGRheXMsc3VjaCBhcyBhZnRlciAyIGRheXMsIGFmdGVyIDMgZGF5cywgYmVmb3JlIDIgZGF5cyAsIGJlZm9yZSAzIGRheXMgYW5kIHNvIG9uXG4gICAgICAgICAgICB2YXIgeSA9IHN0YXJ0RGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgICAgdmFyIG0gPSBzdGFydERhdGUuZ2V0TW9udGgoKSArIDE7XG4gICAgICAgICAgICBpZiAobSA8IDEwKSBtID0gJzAnICsgbTtcbiAgICAgICAgICAgIHZhciBkID0gc3RhcnREYXRlLmdldERhdGUoKTtcbiAgICAgICAgICAgIGlmIChkIDwgMTApIGQgPSAnMCcgKyBkO1xuICAgICAgICAgICAgcmV0dXJuIHkgKyAnLScgKyBtICsgJy0nICsgZDtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gIGludGVydmFsIGJldHdlZW4gbm93IGFuZCBzZWNvbmRzXG4gICAgICAgIHZhciBnZXREYXRlSW50ZXJ2YWwgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCwgaXNOZWVkU2Vjb25kcykge1xuICAgICAgICAgICAgdmFyIHJlcyA9IHt9O1xuICAgICAgICAgICAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkKSBlbmQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIHZhciBpbnRlcnZhbCA9IGVuZCAtIHN0YXJ0O1xuICAgICAgICAgICAgcmVzLmRheSA9IE1hdGguZmxvb3IoaW50ZXJ2YWwgLyAoMjQgKiAzNjAwICogMTAwMCkpO1xuICAgICAgICAgICAgaW50ZXJ2YWwgLT0gcmVzLmRheSAqIDI0ICogMzYwMCAqIDEwMDA7XG4gICAgICAgICAgICByZXMuaG91cnMgPSBNYXRoLmZsb29yKGludGVydmFsIC8gKDM2MDAgKiAxMDAwKSk7XG4gICAgICAgICAgICBpbnRlcnZhbCAtPSByZXMuaG91cnMgKiAzNjAwICogMTAwMDtcbiAgICAgICAgICAgIHJlcy5taW11dGVzID0gTWF0aC5mbG9vcihpbnRlcnZhbCAvICg2MCAqIDEwMDApKTtcbiAgICAgICAgICAgIGlmIChpc05lZWRTZWNvbmRzKSB7XG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwgLT0gcmVzLm1pbXV0ZXMgKiA2MCAqIDEwMDA7XG4gICAgICAgICAgICAgICAgcmVzLnNlY29uZHMgPSBNYXRoLmZsb29yKGludGVydmFsIC8gMTAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgZ2V0UGFnZUludGVydmFsID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgICAgICAgICAgIHZhciBzdHIgPSAnJyxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbFRpbWU7XG4gICAgICAgICAgICBpZiAoIXN0YXJ0IHx8ICFlbmQgfHwgZW5kIC0gc3RhcnQgPD0gMCkge1xuICAgICAgICAgICAgICAgIHN0ciA9ICcw56eSJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW50ZXJ2YWxUaW1lID0gZ2V0RGF0ZUludGVydmFsKHN0YXJ0LCBlbmQsIHRydWUpO1xuICAgICAgICAgICAgICAgIGlmIChpbnRlcnZhbFRpbWUuZGF5ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ciArPSBpbnRlcnZhbFRpbWUuZGF5ICsgJ+WkqSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpbnRlcnZhbFRpbWUuaG91cnMgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc3RyICs9IGludGVydmFsVGltZS5ob3VycyArICflsI/ml7YnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJ2YWxUaW1lLm1pbXV0ZXMgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc3RyICs9IGludGVydmFsVGltZS5taW11dGVzICsgJ+WIhumSnyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpbnRlcnZhbFRpbWUuc2Vjb25kcyAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzdHIgKz0gaW50ZXJ2YWxUaW1lLnNlY29uZHMgKyAn56eSJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHN0ciA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gJzDnp5InO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBnZXRQYWdlRGF0ZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kLCBpc05lZWRTZWNvbmRzKSB7XG4gICAgICAgICAgICBpZiAoIXN0YXJ0ICYmICFlbmQgfHwgc3RhcnQgLSBlbmQgPD0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAn5pegJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpbnRlcnZhbCA9IGdldERhdGVJbnRlcnZhbChzdGFydCwgZW5kLCBpc05lZWRTZWNvbmRzKTtcbiAgICAgICAgICAgIHZhciBkYXkgPSBpbnRlcnZhbC5kYXk7XG4gICAgICAgICAgICB2YXIgaG91cnMgPSBpbnRlcnZhbC5ob3VycztcbiAgICAgICAgICAgIHZhciBtaW11dGVzID0gaW50ZXJ2YWwubWltdXRlcztcbiAgICAgICAgICAgIHZhciByZXM7XG4gICAgICAgICAgICAvLyDlrqLmiLfnq6/ml7bpl7TlkozmnI3liqHlmajml7bpl7TkuI3nu5/kuIDpgKDmiJDnmoTotJ/mlbDmg4XlhrVcbiAgICAgICAgICAgIGlmIChkYXkgPCAwIHx8IGhvdXJzIDwgMCB8fCBtaW11dGVzIDwgMCkge1xuICAgICAgICAgICAgICAgIHJlcyA9ICfliJrliJonO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkYXkgPiA2MCkge1xuICAgICAgICAgICAgICAgIHJlcyA9ICfmm7Tml6knO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkYXkgPiAzMCkge1xuICAgICAgICAgICAgICAgIHJlcyA9ICfkuIDkuKrmnIjliY0nO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkYXkgPiAzKSB7XG4gICAgICAgICAgICAgICAgcmVzID0gZGF5ICsgJ+WkqeWJjSc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRheSA9PSAzKSB7XG4gICAgICAgICAgICAgICAgcmVzID0gJ+S4ieWkqeWJjSc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRheSA9PSAyKSB7XG4gICAgICAgICAgICAgICAgcmVzID0gJ+S4pOWkqeWJjSc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRheSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgcmVzID0gJ+aYqOWkqSc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChob3VycyA+PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcyA9IGhvdXJzICsgJ+Wwj+aXtuWJjSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1pbXV0ZXMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9ICfliJrliJonO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gbWltdXRlcyArICfliIbpkp/liY0nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGxvYWRKcyA9IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgICAgICAgICB2YXIgZGVsYXkgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgJC5nZXRTY3JpcHQocGF0aCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRlbGF5LnJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGRlbGF5LnByb21pc2U7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpc0VtcHR5T2JqZWN0OiBpc0VtcHR5T2JqZWN0LFxuICAgICAgICAgICAgcGFyc2VUcGw6IHBhcnNlVHBsLFxuICAgICAgICAgICAgdG9EZWNpbWFsOiB0b0RlY2ltYWwsXG4gICAgICAgICAgICBmb3JtYXJ0Qnl0ZXNEYXRhOiBmb3JtYXJ0Qnl0ZXNEYXRhLFxuICAgICAgICAgICAgZ2V0UXVlcnlTdHJpbmc6IGdldFF1ZXJ5U3RyaW5nLFxuICAgICAgICAgICAgb2JqTGVuZ3RoOiBvYmpMZW5ndGgsXG4gICAgICAgICAgICBpc051bGxvckVtcHR5OiBpc051bGxvckVtcHR5LFxuICAgICAgICAgICAgY2FsY3VsYXRlRGF0ZTogY2FsY3VsYXRlRGF0ZSxcbiAgICAgICAgICAgIGdldFBhZ2VJbnRlcnZhbDogZ2V0UGFnZUludGVydmFsLFxuICAgICAgICAgICAgZ2V0RGF0ZUludGVydmFsOiBnZXREYXRlSW50ZXJ2YWwsXG4gICAgICAgICAgICBnZXRQYWdlRGF0ZTogZ2V0UGFnZURhdGUsXG4gICAgICAgICAgICBsb2FkSnM6IGxvYWRKc1xuICAgICAgICB9O1xuICAgIH1dKVxuICAgIC5mYWN0b3J5KCckZG9tZU1vZGVsJywgWyckaHR0cCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBnZXRXaG9sZVVybCA9IGZ1bmN0aW9uICh1cmwsIHBhcmFtcykge1xuICAgICAgICAgICAgdmFyIHdob2xlVXJsID0gdXJsLFxuICAgICAgICAgICAgICAgIGk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcGFyYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgd2hvbGVVcmwgKz0gJy8nICsgcGFyYW1zW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHdob2xlVXJsO1xuICAgICAgICB9O1xuICAgICAgICAvLyDlhbfmnInpgInmi6nlip/og73nmoRDbGFzc++8jOWMheaLrOmAieaLqeWNlemhueOAgeWFqOmAieOAgeWFqOS4jemAiVxuICAgICAgICAvLyBAcGFyYW0gc2VsZWN0TGlzdE5hbWU6IOmAieaLqemhueeahGxpc3Tlr7nosaHnmoRrZXnnmoTlkI3lrZcuZWc65Lyg5YWl4oCZaG9zdExpc3TigJjlrp7kvovljJblkI7lpoJ7aG9zdExpc3Q6W3suLi4ufV19XG4gICAgICAgIGNsYXNzIFNlbGVjdExpc3RNb2RlbCB7XG4gICAgICAgICAgICBjb25zdHJ1Y3RvcihzZWxlY3RMaXN0TmFtZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0TGlzdE5hbWUgPSBzZWxlY3RMaXN0TmFtZSA/IHNlbGVjdExpc3ROYW1lIDogJ3NlbGVjdExpc3QnO1xuICAgICAgICAgICAgICAgIC8vIOaYr+WQpuWFqOmAiVxuICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIC8vIOmAieaLqemhueaVsOmHj+e7n+iuoVxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpc1t0aGlzLnNlbGVjdExpc3ROYW1lXSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5pdChzZWxlY3RMaXN0LCBpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzW3RoaXMuc2VsZWN0TGlzdE5hbWVdID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzZWxlY3RMaXN0IHx8IHNlbGVjdExpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNlbGVjdExpc3RbMF0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3RMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdExpc3RbaV0ua2V5RmlsdGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzU2VsZWN0ZWQgIT09IHVuZGVmaW5lZCkgc2VsZWN0TGlzdFtpXS5pc1NlbGVjdGVkID0gaXNTZWxlY3RlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdExpc3RbaV0uaXNTZWxlY3RlZCkgdGhpcy5zZWxlY3RlZENvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGVjdExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0TGlzdFtpXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IHNlbGVjdExpc3RbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXlGaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkOiBpc1NlbGVjdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1NlbGVjdGVkICE9PSB1bmRlZmluZWQpIHNlbGVjdExpc3RbaV0uaXNTZWxlY3RlZCA9IGlzU2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RMaXN0W2ldLmlzU2VsZWN0ZWQpIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnQgPT09IHNlbGVjdExpc3QubGVuZ3RoKSB0aGlzLmlzQ2hlY2tBbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdExpc3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlQ2hlY2soaXRlbSwgaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaXNBbGxIYXNDaGFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmlzU2VsZWN0ZWQgPSBpc1NlbGVjdGVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0TGlzdCA9IHRoaXNbdGhpcy5zZWxlY3RMaXN0TmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmmK/lkKbkuLrlhajpgIlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ0l0ZW0gb2Ygc2VsZWN0TGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaWdJdGVtLmtleUZpbHRlciAmJiAhc2lnSXRlbS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQWxsSGFzQ2hhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0FsbEhhc0NoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDaGVja0FsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWFqOmAiS/lhajkuI3pgIlcbiAgICAgICAgICAgIGNoZWNrQWxsSXRlbShpc0NoZWNrQWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gaXNDaGVja0FsbCA9PT0gdW5kZWZpbmVkID8gdGhpcy5pc0NoZWNrQWxsIDogaXNDaGVja0FsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RMaXN0ID0gdGhpc1t0aGlzLnNlbGVjdExpc3ROYW1lXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzaWdJdGVtIG9mIHNlbGVjdExpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpZ0l0ZW0ua2V5RmlsdGVyICYmIHRoaXMuaXNDaGVja0FsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2lnSXRlbS5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2lnSXRlbS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWx0ZXJXaXRoS2V5KGtleXdvcmRzLCBmaWx0ZXJJdGVtKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NoZWNrQWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICBpZiAoZmlsdGVySXRlbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlckl0ZW0gPSAnaXRlbSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RMaXN0ID0gdGhpc1t0aGlzLnNlbGVjdExpc3ROYW1lXTtcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzmsqHmnInlr7nlupTnmoRrZXlcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0TGlzdFswXVtmaWx0ZXJJdGVtXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc2lnSXRlbSBvZiBzZWxlY3RMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ0l0ZW0uaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBzaWdJdGVtLmtleUZpbHRlciA9IHNpZ0l0ZW1bZmlsdGVySXRlbV0uaW5kZXhPZihrZXl3b3JkcykgIT09IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IFNlcnZpY2VNb2RlbCA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHNlbGYuZ2V0RGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGdldFdob2xlVXJsKHVybCwgYXJndW1lbnRzKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2VsZi5zZXREYXRhID0gZnVuY3Rpb24gKGRhdGEsIGNvbmZpZykge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KHVybCwgZGF0YSwgY29uZmlnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZWxmLnVwZGF0ZURhdGEgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQodXJsLCBkYXRhKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZWxmLmRlbGV0ZURhdGEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZShnZXRXaG9sZVVybCh1cmwsIGFyZ3VtZW50cykpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGluc3RhbmNlc0NyZWF0b3IgPSBmdW5jdGlvbiAoY2xhc3NNYXApIHtcbiAgICAgICAgICAgIGlmICghY2xhc3NNYXApIGNsYXNzTWFwID0ge307XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNsYXNzTmFtZSwgLi4uYXJncykge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbnMsIGZ1bmMgPSBjbGFzc01hcFtjbGFzc05hbWVdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZnVuYyAmJiB0eXBlb2YgZnVuYyA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnMgPSBuZXcgZnVuYyguLi5hcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yOnRoZXJlIGlzIG5vICcgKyBjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnM7XG4gICAgICAgICAgICAgICAgfSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFNlbGVjdExpc3RNb2RlbDogU2VsZWN0TGlzdE1vZGVsLFxuICAgICAgICAgICAgU2VydmljZU1vZGVsOiBTZXJ2aWNlTW9kZWwsXG4gICAgICAgICAgICBpbnN0YW5jZXNDcmVhdG9yOiBpbnN0YW5jZXNDcmVhdG9yXG4gICAgICAgIH07XG4gICAgfV0pXG4gICAgLy8g5pWw5o2u5a2Y5YKoc2VydmljZVxuICAgIC5wcm92aWRlcignJGRvbWVEYXRhJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgIHZhciBzZXREYXRhID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgZ2V0RGF0YSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhW2tleV07XG4gICAgICAgIH07XG4gICAgICAgIHZhciBkZWxEYXRhID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaWYgKGRhdGFba2V5XSkge1xuICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzZXREYXRhOiBzZXREYXRhLFxuICAgICAgICAgICAgJGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHNldERhdGE6IHNldERhdGEsXG4gICAgICAgICAgICAgICAgICAgIGdldERhdGE6IGdldERhdGEsXG4gICAgICAgICAgICAgICAgICAgIGRlbERhdGE6IGRlbERhdGFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
