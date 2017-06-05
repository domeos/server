/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('OtherImageModalCtr', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
		$scope.imageInfo = {
			name: '',
			tag: '',
			registry: ''
		};
		$scope.submitImage = function () {
			$modalInstance.close($scope.imageInfo);
		};
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	}]);
})(angular.module('domeApp'));