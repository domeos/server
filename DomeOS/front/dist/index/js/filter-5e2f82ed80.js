domeApp.filter('listPage', function() { // 分页过滤
	// @param size 每页数据长度
	// @param pageno 当前第几页
	return function(input, size, pageno) {
		if (input) {
			pageno = parseInt(pageno);
			return input.slice(size * (pageno - 1), size * pageno);
		} else {
			return [];
		}
	};
}).filter('deployOptions', function() { // 过滤部署条件
	// @param envObj {env1:true/false(是否被选中),env2:true/false(是否被选中)}
	// @params namespaceObj, clusterObj, statusObj 同envObj
	return function(input, envObj, namespaceObj, clusterObj, statusObj) {
		var newInput = [];
		for (var i = 0; i < input.length; i++) {
			if ((envObj.ALL || envObj[input[i].hostEnv]) && (namespaceObj.ALL || namespaceObj[input[i].namespace]) && (clusterObj.ALL || clusterObj[input[i].clusterName]) && (statusObj.ALL || statusObj[input[i].deploymentStatus])) {
				newInput.push(input[i]);
			}
		}
		return newInput;
	};
}).filter('search', function() { // ng-repeat ：（key,value）形式查找value的某一项key
	return function(input, item, searchkey) {
		var tmp = {};
		angular.forEach(input, function(value, key) {
			if (value[item].toString().indexOf(searchkey) !== -1) {
				tmp[key] = value;
			}
		});
		return tmp;
	};
}).filter('searchKey', function() { // ng-repeat ：（key,value）形式查找value的某一项key
	return function(input, searchkey) {
		var tmp = {};
		if (!searchkey) {
			return input;
		}
		angular.forEach(input, function(value, key) {
			if (key.toString().indexOf(searchkey) !== -1) {
				tmp[key] = value;
			}
		});
		return tmp;
	};
}).filter('mirrorOptions', function() { // 过滤镜像
	// @param statusObj {status1:true/false(是否被选中),status2:true/false(是否被选中)}
	// @params  builduserObj, typeObj statusObj
	return function(input, statusObj, builduserObj, typeObj,userName) {
		var newInput = [];
		for (var i = 0; i < input.length; i++) {
			var type=input[i].autoCustom===0?'dockerfile':'configfile';
			if ((statusObj.All || statusObj[input[i].status]) && (builduserObj.All || (builduserObj.own&&input[i].username==userName)) && (typeObj.All || typeObj[type])) {
				newInput.push(input[i]);
			}
		}
		return newInput;
	};
});