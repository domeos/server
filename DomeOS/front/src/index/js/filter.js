/*
 * @author ChandraLee
 * @description 过滤器集合
 */

(function (domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;
    domeApp.filter('listPage', function () { // 分页过滤
        // @param size 每页数据长度
        // @param pageno 当前第几页
        return function (input, size, pageno) {
            if (input) {
                pageno = parseInt(pageno);
                return input.slice(size * (pageno - 1), size * pageno);
            } else {
                return [];
            }
        };
    }).filter('deployOptions', function () { // 过滤部署条件
        // @param envObj {env1:true/false(是否被选中),env2:true/false(是否被选中)}
        // @params namespaceObj, clusterObj, statusObj 同envObj
        return function (input, envObj, namespaceObj, clusterObj, statusObj) {
            var newInput = [];
            for (var i = 0, l = input.length; i < l; i++) {
                if ((envObj.ALL || envObj[input[i].hostEnv]) && (namespaceObj.ALL || namespaceObj[input[i].namespace]) && (clusterObj.ALL || clusterObj[input[i].clusterName]) && (statusObj.ALL || statusObj[input[i].deploymentStatus])) {
                    newInput.push(input[i]);
                }
            }
            return newInput;
        };
    }).filter('search', function () { // ng-repeat ：（key,value）形式查找value的某一项key
        return function (input, item, searchkey) {
            var tmp = {};
            angular.forEach(input, function (value, key) {
                if (value[item].toString().indexOf(searchkey) !== -1) {
                    tmp[key] = value;
                }
            });
            return tmp;
        };
    }).filter('searchKey', function () { // ng-repeat ：（key,value）形式查找value的某一项key
        return function (input, searchkey) {
            var tmp = {};
            if (!searchkey) {
                return input;
            }
            angular.forEach(input, function (value, key) {
                if (key.toString().indexOf(searchkey) !== -1) {
                    tmp[key] = value;
                }
            });
            return tmp;
        };
    }).filter('dynamicKey', function () { // key为变量
        return function (input, key, searchkey) {
            var newArr = [];
            if (!searchkey) {
                return input;
            }
            for (var i = 0, l = input.length; i < l; i++) {
                if (input[i][key].toString().indexOf(searchkey) !== -1) {
                    newArr.push(input[i]);
                }
            }
            return newArr;
        };
    }).filter('mirrorOptions', function () { // 过滤镜像
        // @param statusObj {status1:true/false(是否被选中),status2:true/false(是否被选中)}
        // @params  builduserObj, typeObj stateObj
        return function (input, stateObj, builduserObj, typeObj, userName) {
            var newInput = [];
            for (var i = 0, l = input.length; i < l; i++) {
                var type = input[i].autoCustom === 0 ? 'dockerfile' : 'configfile';
                if ((stateObj.All || stateObj[input[i].state]) && (builduserObj.All || builduserObj.own && input[i].username == userName) && (typeObj.All || typeObj[type])) {
                    newInput.push(input[i]);
                }
            }
            return newInput;
        };
    }).filter('alarmFilter', ['$filter', function ($filter) {
        return function (input, keywords) {
            if (!input) {
                return;
            }
            var sigItem, newArr = [],
                date;
            for (var i = 0, l = input.length; i < l; i++) {
                sigItem = input[i];
                date = $filter('date')(sigItem.timeStamp, 'yyyy-MM-dd HH:mm:ss');
                if (sigItem.alarmObject.indexOf(keywords) !== -1 || sigItem.templateTypeName.indexOf(keywords) !== -1 || sigItem.metricName.indexOf(keywords) !== -1 || sigItem.alarmNum.indexOf(keywords) !== -1 || sigItem.alarmTimes.indexOf(keywords) !== -1 || date.indexOf(keywords) !== -1) {
                    newArr.push(sigItem);
                }
            }
            return newArr;
        };
    }]).filter('urlProtocolFilter', function () { // 过滤url协议头
        return function (value) {
            if (!value) {
                return '';
            }
            if(value.indexOf('http://') !== -1) {
                return value.substring(7);
            }else if (value.indexOf('https://') !== -1) {
                return value.substring(8);
            }else {
                return '';
            }
        };
    });
})(window.domeApp);