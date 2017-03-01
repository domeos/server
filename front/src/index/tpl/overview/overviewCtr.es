/* jshint esversion: 6 */
(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('OverviewCtr', ['$scope', 'api', function ($scope, api) {
    $scope.data = {};
    let allRequests = [
      'project',
      'deployment',
      'resource',
      'alarmList',
      'actionList',
      'usage',
      'id',
      'version',
		].map(type => api.overview[type]()
				.then(data => angular.merge($scope.data, data)));

		$scope.trackerReady = false;
		api.SimplePromise.all([
			api.user.whoami(),
      api.SimplePromise.all(allRequests),
		]).then(([user]) => {
      if (!user.isAdmin) return;
			let data = {
				build_auto: $scope.data.action.build.auto.join(),
				build_manual: $scope.data.action.build.manual.join(),
				deploy_auto: $scope.data.action.deploy.auto.join(),
				deploy_online: $scope.data.action.deploy.online.join(),	
				memory_using: $scope.data.memory.using,
				memory_free: $scope.data.memory.free,
				cpu_load_0: $scope.data.cpu.load_0_25,
				cpu_load_25: $scope.data.cpu.load_25_50,
				cpu_load_50: $scope.data.cpu.load_50_75,
				cpu_load_75: $scope.data.cpu.load_75_100,
				disk_using: $scope.data.disk.using,
				disk_free: $scope.data.disk.free,
				node_online: $scope.data.node.online,
				node_offline: $scope.data.node.offline,
				project_collection: $scope.data.project.collection,
				project_total: $scope.data.project.total,
				deploy_collection: $scope.data.deploy.collection,
				deploy_total: $scope.data.deploy.total,
				image_project: $scope.data.image.project,
				uuid: $scope.data.id,
        version: $scope.data.version,
			};
			$scope.trackerUrl = Object.keys(data).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`).join('&');
			$scope.trackerReady = true;	
		});
  }]);
})(window.domeApp);
