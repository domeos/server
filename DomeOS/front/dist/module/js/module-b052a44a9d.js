var moduleApp = angular.module('moduleApp', ['ngAnimate', 'ui.bootstrap', 'publicModule', 'domeModule', 'userModule']);
moduleApp.controller('appCtr', ['$scope', '$modal', '$publicApi', function($scope, $modal, $publicApi) {
		'use strict';
		$scope.domeVersion = '';
		$publicApi.getDomeVersion().then(function(res) {
			if (res.data.result) {
				$scope.domeVersion = 'v' + res.data.result;
			}
		});
		$publicApi.getCurrentUser().then(function(res) {
			$scope.loginUser = res.data.result;
		});
		$scope.modifyPw = function() {
			$modal.open({
				animation: true,
				templateUrl: 'modifyPwModal.html',
				controller: 'ModifyPwModalCtr',
				size: 'md',
				resolve: {
					loginUser: function() {
						return $scope.loginUser;
					}
				}
			});
		};
		$scope.modifySelfInfo = function() {
			var modalInstance = $modal.open({
				templateUrl: 'modifyUserInfoModal.html',
				controller: 'ModifyUserInfoCtr',
				size: 'md',
				resolve: {
					user: function() {
						return angular.copy($scope.loginUser);
					}
				}
			});
			modalInstance.result.then(function(userInfo) {
				angular.extend($scope.loginUser, userInfo);
			});
		};
		$scope.logout = function() {
			$publicApi.logout();
		};
	}])
	.controller('ModifyPwModalCtr', ['$scope', 'loginUser', '$modalInstance', '$http', '$modal', '$domePublic', function($scope, loginUser, $modalInstance, $http, $modal, $domePublic) {
		'use strict';
		$scope.pwObj = {
			username: loginUser.username,
			oldpassword: '',
			newpassword: ''
		};
		$scope.newPwAgain = '';
		$scope.modiftPw = function() {
			$http.post('/api/user/changePassword', angular.toJson($scope.pwObj)).then(function() {
				$domePublic.openPrompt('修改成功，请重新登录！').finally(function() {
					location.href = '/login/login.html?redirect=' + encodeURIComponent(location.href);
				});
			}, function() {
				$domePublic.openWarning('修改失败！');
			});
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};
	}]);