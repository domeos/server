var moduleApp = angular.module('moduleApp', ['ngAnimate', 'ui.bootstrap']);
moduleApp.directive('equal', function() {
	return {
		restrict: 'A',
		require: 'ngModel',
		scope: {
			equal: '=equal'
		},
		link: function(scope, element, attrs, controller) {
			controller.$parsers.unshift(function(viewValue) {
				var isEqual = true;
				if (scope.equal) {
					isEqual = scope.equal.toString() === viewValue;
				}
				controller.$setValidity('equal', isEqual);
				return viewValue;
			});
		}
	};
}).directive('selectCon', function() {
	return {
		restrict: 'AEC',
		scope: true,
		controller: function($scope, $element, $attrs) {
			$scope.showSelect = false;
			this.hideSelect = function() {
				$scope.showSelect = false;
			};
		},
		link: function(scope, element, attrs) {
			var dropEle = attrs.$$element.find('.select-list');
			var selectEle = attrs.$$element.find('.btn-select');
			if (selectEle.length === 0) {
				return;
			}
			var blurFun = function(event) {
				scope.showSelect = false;
				scope.$digest();
				return event.stopPropagation();
			};
			selectEle.bind('blur', blurFun);
			dropEle.on('mouseenter', function() {
				selectEle.off('blur', blurFun);
			}).on('mouseleave', function() {
				selectEle.on('blur', blurFun);
			});
			if (selectEle[0].tagName === 'INPUT') {
				selectEle.on('focus', function() {
					scope.showSelect = true;
					scope.$digest();
				});
			} else {
				selectEle.on('click', function() {
					scope.showSelect = !scope.showSelect;
					scope.$digest();
				});
			}
			if (attrs.label == "true") {
				element.on('click', function() {
					selectEle.focus();
				}).on('click', 'li.select-label', function(event) {
					return event.stopPropagation();
				});
			}
			scope.$watch(function() {
				return scope.showSelect;
			}, function(showSelect) {
				if (showSelect) {
					dropEle.show();
					$('.drop').removeClass('up');
				} else {
					dropEle.hide();
					$('.drop').addClass('up');
				}
			});
		}
	};
}).directive('selectItem', ['$compile', function($compile) {
	return {
		restrict: 'AEC',
		require: '^?selectCon',
		link: function(scope, element, attrs, controller) {
			scope.hideSelect = function() {
				controller.hideSelect();
			};
			var linkEle = angular.element(attrs.$$element.find('>a')[0]);
			var clickEvent = linkEle.attr('ng-click');
			if (!clickEvent) {
				clickEvent = 'hideSelect($event.stopPropagation())';
			} else {
				clickEvent += ';hideSelect($event.stopPropagation());';
			}
			linkEle.attr('ng-click', clickEvent);
			element.html($compile(element.html())(scope));
		}
	};
}]);
moduleApp.controller('appCtr', ['$scope', '$http', '$modal', function($scope, $http, $modal) {
	$scope.domeVersion = '';
	$http.get('/api/user/get').then(function(res) {
		$scope.loginUser = res.data.result;
	});
	$http.get('/api/global/version').then(function(res) {
		if (res.data.result) {
			$scope.domeVersion = 'v' + res.data.result;
		}
	});
	$scope.modifyPw = function() {
		$modal.open({
			animation: true,
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
	$scope.logout = function() {
		$http.get('/api/user/logout');
	};
}]).controller('promptModalCtrl', ['$scope', '$modalInstance', '$timeout', function($scope, $modalInstance, $timeout) {
	$timeout(function() {
		$modalInstance.dismiss('cancel');
	}, 1000);
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
}]).controller('warningModalCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
}]).controller('modifyPwModalCtr', ['$scope', 'loginUser', '$modalInstance', '$http', '$modal', function($scope, loginUser, $modalInstance, $http, $modal) {
	$scope.pwObj = {
		username: loginUser.username,
		oldpassword: '',
		newpassword: ''
	};
	$scope.newPwAgain = '';
	$scope.modiftPw = function() {
		$http.post('/api/user/changePassword', angular.toJson($scope.pwObj)).then(function() {

			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'promptModal.html',
				controller: 'promptModalCtrl',
				size: 'sm'
			});
			modalInstance.result.finally(function() {
				location.href = '/login/login.html?redirect=' + encodeURIComponent(location.href);
			});
		}, function() {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'warningModal.html',
				controller: 'warningModalCtrl',
				size: 'sm'
			});
		});
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
}]);
moduleApp.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
	$httpProvider.interceptors.push(function($rootScope, $q) {
		return {
			'response': function(response) {
				if (typeof(response.data) == 'string' && response.data.indexOf('<html ng-app="loginApp">') >= 0) {
					if (response.config.url.indexOf('api/user/logout') !== -1) {
						location.href = '/login/login.html';
					} else {
						location.href = '/login/login.html?redirect=' + encodeURIComponent(location.href);
					}
				}
				// 判断是否需要自动将resultCode!=200的请求默认为失败
				if (!response.config.notIntercept) {
					if (!response.data.resultCode || response.data.resultCode == 200) {
						return response || $q.resolve(response);
					}
					return $q.reject(response);
				}
				return response;
			}
		};
	});
}]);