/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('InstanceLogModalCtr', ['$scope', 'instanceInfo', '$location', '$modalInstance', function ($scope, instanceInfo, $location, $modalInstance) {
		var requestUrl = location.protocol.replace('http', 'ws') + '//' + $location.host();
		if ($location.port()) {
			requestUrl += ':' + $location.port();
		}
		if (!instanceInfo.containers) {
			instanceInfo.containers = [];
		}
		for (var i = 0, l = instanceInfo.containers.length; i < l; i++) {
			var url = encodeURIComponent(requestUrl + '/api/deploy/instance/log/realtime/websocket?clusterid=' + instanceInfo.clusterId + '&namespace=' + instanceInfo.namespace + '&instancename=' + instanceInfo.instanceName + '&containername=' + instanceInfo.containers[i].containerName);
			instanceInfo.containers[i].pageTxt = instanceInfo.containers[i].containerId.substring(0, 12) + '(' + instanceInfo.containers[i].imageName + ')';
			instanceInfo.containers[i].href = '/log/log.html?url=' + url;
		}
		$scope.instanceInfo = instanceInfo;
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	}]);
})(angular.module('domeApp'));