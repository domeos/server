/*
 * @description: 公共函数
 * @version: 0.1
 */
var pubServices = angular.module('pubServices', []);
pubServices.service('$util', ['$q', function($q) {
	//  is {}
	var isEmptyObject = function(obj) {
		for (var n in obj) {
			if (obj.hasOwnProperty(n)) {
				return false;
			}
		}
		return true;
	};
	// @param str:<span>{{#name}}</span><p>{{#age}}</p>
	// @param data:{name:'chandra',age:12,addr:'china'}
	// @return <span>chandra</span><p>12</p>
	var parseTpl = function(str, data) {
		var result;
		var patt = new RegExp("\{\#([a-zA-z0-9]+)\}");
		while ((result = patt.exec(str)) !== null) {
			var v = data[result[1]] === 0 ? "0" : data[result[1]] || '';
			str = str.replace(new RegExp(result[0], "g"), v);
		}
		return str;
	};
	var objLength = function(obj) {
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
	var isNullorEmpty = function(obj) {
		if (!obj || (obj && isEmptyObject(obj))) {
			return true;
		}
		return false;
	};
	var calculateDate = function(startDate, dayInterval) {
		startDate = new Date(startDate);
		startDate.setDate(startDate.getDate() + dayInterval); //get the date after dayInterval days or before dayInterval days,such as after 2 days, after 3 days, before 2 days , before 3 days and so on
		var y = startDate.getFullYear();
		var m = startDate.getMonth() + 1;
		if (m < 10) m = '0' + m;
		var d = startDate.getDate();
		if (d < 10) d = '0' + d;
		return y + "-" + m + "-" + d;
	};
	//  interval between now and seconds
	var getDateInterval = function(seconds) {
		var res = {};
		var interval = (new Date().getTime()) - seconds;
		res.day = Math.floor(interval / (24 * 3600 * 1000));
		interval -= res.day * 24 * 3600 * 1000;
		res.hours = Math.floor(interval / (3600 * 1000));
		interval -= res.hours * 3600 * 1000;
		res.mimutes = Math.floor(interval / (60 * 1000));
		return res;
	};
	var getPageDate = function(seconeds) {
		if (!seconeds || seconeds === 0) {
			return '无';
		}
		var interval = getDateInterval(seconeds);
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
	var loadJs = function(path) {
		var deferrd = $q.defer();
		var s = document.createElement('script');
		s.src = path;
		document.body.appendChild(s);
		if (document.all) {
			s.onreadystatechange = function() {
				var state = this.readyState;
				if (state === 'loaded' || state === 'complete') {
					deferrd.resolve();
				}
			};
		} else {
			s.onload = function() {
				deferrd.resolve();
			};
		}
		return deferrd.promise;
	};
	return {
		isEmptyObject: isEmptyObject,
		parseTpl: parseTpl,
		objLength: objLength,
		isNullorEmpty: isNullorEmpty,
		calculateDate: calculateDate,
		getDateInterval: getDateInterval,
		getPageDate: getPageDate,
		loadJs: loadJs
	};
}]);