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
		return $util.getPageDate(seconds);
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
	$scope.stopPropagation = function(event) {
		return event.stopPropagation();
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
	if (typeof promptTxt === 'string') {
		$scope.titleInfo = promptTxt;
	} else {
		$scope.titleInfo = promptTxt.title;
		$scope.detailInfo = promptTxt.msg;
	}
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
}]);