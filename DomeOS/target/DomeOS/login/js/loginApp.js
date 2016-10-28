/*
 * @author ChandraLee
 * @description 登录页面
 */

var loginApp = angular.module('loginApp', []);
loginApp.controller('loginCtr', ['$scope', '$http', '$location', function($scope, $http, $location) {
	$scope.loginType = 'LDAP';
	$scope.hasError = '';
	$scope.needValid = false;
	var redirect;
	var query = $location.$$absUrl.split('?')[1];
	if (query && query.split('=')[1] && query.split('=')[0] == 'redirect') {
		redirect = decodeURIComponent(query.split('=')[1]);
	}
	$scope.login = function() {
		var loginData = {
			username: $scope.username,
			password: $scope.password,
			loginType: $scope.loginType
		};
		$http({
			method: 'post',
			url: '/api/user/login',
			data: angular.toJson(loginData)
		}).then(function(res) {
			if (res.data.resultCode == 200) {
				location.href = redirect ? redirect : '/module/module.html';
			} else {
				if (res.data.result == 'password wrong') {
					$scope.hasError = '密码错误！';
				} else if (res.data.result == 'username wrong') {
					$scope.hasError = '用户名错误！';
				} else {
					$scope.hasError = '用户名或密码错误！';
				}
			}
		});
	};
	$scope.hideError = function() {
		if ($scope.hasError !== '') {
			$scope.hasError = '';
		}
	};
}]);