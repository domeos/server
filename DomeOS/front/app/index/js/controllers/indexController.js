domeApp.controller('domeCtr', ['$scope', '$modal', '$util', '$domeUser', '$q', function($scope, $modal, $util, $domeUser, $q) {
	$scope.currentMod = {
		mod: ''
	};
	$scope.$on("pageTitle", function(event, msg) {
		$scope.title = msg.title;
		$scope.descrition = msg.descrition;
		$scope.currentMod.mod = msg.mod;
	});
	$scope.loginUser = {};

	$scope.getLoginUser = function() {
		var deferred = $q.defer();
		if ($scope.loginUser.id) {
			deferred.resolve($scope.loginUser);
		} else {
			$domeUser.getCurrentUser().then(function(res) {
				$scope.loginUser = res.data.result;
				deferred.resolve($scope.loginUser);
			});
		}
		return deferred.promise;
	};
	$scope.getLoginUser();
	$scope.parseDate = function(seconds) {
		$util.getPageDate(seconds);
	};
	$scope.objLength = $util.objLength;
	$scope.logout = function() {
		$domeUser.logout();
	};
	$scope.modifyPw = function() {
		$modal.open({
			animate: true,
			templateUrl: 'modifyPwModal.html',
			controller: 'modifyPwModalCtr',
			size: 'md',
			resolve: {
				loginUser: function() {
					return $scope.loginUser;
				}
			}
		});
	};
	$scope.isStrNull = function(str) {
		var resTxt = str;
		if (!str) {
			resTxt = '未设置';
		}
		return resTxt;
	};
}]).controller('sureDeleteCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	$scope.delete = function() {
		$modalInstance.close();
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
}]).controller('promptModalCtrl', ['$scope', '$modalInstance', 'promptTxt', '$timeout', function($scope, $modalInstance, promptTxt, $timeout) {
	$scope.promptTxt = promptTxt;
	$timeout(function() {
		$modalInstance.dismiss('cancel');
	}, 1000);
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
}]).controller('warningModalCtrl', ['$scope', '$modalInstance', 'promptTxt', function($scope, $modalInstance, promptTxt) {
	$scope.promptTxt = promptTxt;
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
}]).controller('confirmModalCtr', ['$scope', '$modalInstance', 'promptTxt', function($scope, $modalInstance, promptTxt) {
	$scope.promptTxt = promptTxt;
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
	$scope.sure = function() {
		$modalInstance.close();
	};
}]).controller('deleteModalCtr', ['$scope', '$modalInstance', 'promptTxt', function($scope, $modalInstance, promptTxt) {
	$scope.promptTxt = promptTxt || '确定要删除吗？';
	$scope.delete = function() {
		$modalInstance.close();
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
}]).controller('modifyPwModalCtr', ['$scope', 'loginUser', '$modalInstance', '$domePublic', '$domeUser', function($scope, loginUser, $modalInstance, $domePublic, $domeUser) {
	$scope.pwObj = {
		username: loginUser.username,
		oldpassword: '',
		newpassword: ''
	};
	$scope.newPwAgain = '';
	$scope.modiftPw = function() {
		$domeUser.userModifyPw($scope.pwObj).then(function() {
			$domePublic.openPrompt('修改成功，请重新登录！').finally(function() {
				location.href = '/login/login.html?redirect=' + encodeURIComponent(location.href);
			});

		}, function() {
			$domePublic.openWarning('修改失败，请重试！');
		});
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
}]);