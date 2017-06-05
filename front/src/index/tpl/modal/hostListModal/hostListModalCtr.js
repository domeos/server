/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('HostListModalCtr', ['$scope', 'hostList', '$modalInstance', 'filterFilter', function ($scope, hostList, $modalInstance, filterFilter) {
		$scope.hostList = filterFilter(hostList, {
			'labelFilter': true
		});
		$scope.cancel = function(){
			$modalInstance.dismiss('cancel');
		};
	}]);
})(angular.module('domeApp'));