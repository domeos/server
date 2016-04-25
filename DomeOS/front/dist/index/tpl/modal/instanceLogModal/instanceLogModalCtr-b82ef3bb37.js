domeApp.controller('instanceLogModalCtr', ['$scope', '$sce', 'instanceInfo', '$location', '$interval', function($scope, $sce, instanceInfo, $location, $interval) {
	'use strict';
	var logSocket, strLog = '',
		interval, logHasChange = false;
	var requestUrl = 'ws://' + $location.host();
	if ($location.port()) {
		requestUrl += ':' + $location.port();
	}
	if (!instanceInfo.containers) {
		instanceInfo.containers = [];
	}
	for (var i = 0; i < instanceInfo.containers.length; i++) {
		instanceInfo.containers[i].pageTxt = instanceInfo.containers[i].containerId.substring(0, 12) + '(' + instanceInfo.containers[i].imageName + ')';
	}
	$scope.instanceInfo = instanceInfo;
	if ($scope.instanceInfo.containers[0]) {
		$scope.currentContainer = $scope.instanceInfo.containers[0];
		openSocket();
	} else {
		return;
	}
	interval = $interval(function() {
		if (logHasChange) {
			$scope.log = $sce.trustAsHtml(strLog);
			logHasChange = false;
		}
	}, 1500);
	var onMessage = function(event) {
		logHasChange = true;
		strLog = (strLog + event.data).replace(/[\n]/g, '<br>');
	};

	var onOpen = function(event) {
		console.log("连接打开！");
	};

	function openSocket() {
		if (logSocket) {
			$scope.log = $sce.trustAsHtml('');
			strLog = '';
			logSocket.close();
		}
		logSocket = new WebSocket(requestUrl + '/api/deploy/instance/log/realtime?clusterid=' + instanceInfo.clusterId + '&namespace=' + instanceInfo.namespace + '&instancename=' + instanceInfo.instanceName + '&containername=' + $scope.currentContainer.containerName);

		logSocket.onopen = function(event) {
			onOpen(event);
		};
		logSocket.onmessage = function(event) {
			onMessage(event);
		};
		logSocket.onclose = function() {
			console.log('连接被关闭！');
		};
	}
	$scope.toggleContainer = function(index) {
		if ($scope.instanceInfo.containers[index].containerId === $scope.currentContainer.containerId) {
			return;
		}
		$scope.currentContainer = $scope.instanceInfo.containers[index];
		openSocket();
	};
	$scope.$on("$destroy", function() {
		$interval.cancel(interval);
		if (logSocket) {
			logSocket.close();
			return false;
		}
	});
}]);