/* jshint esversion: 6 */
(function (domeApp, undefined) {
  'use strict';
  if (typeof domeApp === 'undefined') return;
  domeApp.controller('OverviewCtr', ['$scope', '$timeout', '$filter', 'api', 'chartHandler', function ($scope, $timeout, $filter, api, chartHandler) {
    $scope.data = {};
    let requestByName = {};
    let allRequests = [
      'project',
      'deployment',
      'disk',
      'resource',
      'alarmList',
      'actionList',
      'usage',
      'id',
      'version',
    ].map(type => {
      let request = requestByName[type] = api.overview[type]();
      request.then(data => angular.merge($scope.data, data))
      return request;
    });

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
        storage_total: $scope.data.storage.total,
        volume_total: $scope.data.volume.total,
        uuid: $scope.data.id,
        version: $scope.data.version,
      };
      $scope.trackerUrl = Object.keys(data).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`).join('&');
      $scope.trackerReady = true;
    });

    let now = Date.now();
    let legendContent = function (data) {
      if (data.x == null) return '';
      return `<strong>${$filter('date')(new Date(now + 864e5 * (data.x - 6)), 'MM-dd')}</strong>` +
        data.series.map((series, i) =>
          `<br /><span style="font-weight: bold; color:${['#31b0d5', '#4bd396'][i]};">${series.labelHTML}</span> ${series.yHTML}`).join('');
    };
    let legendWrap = function (legendFunction) {
      return function (data) {
        let content = legendFunction(data);
        return `<div class="legend-content"><div class="legend-wrap"><div class="legend-center">${content}</div></div></div>`;
      };
    };
    let lineChartOption = {
      strokeWidth: 2,
      pointSize: 6,
      xRangePad: 1,
      drawPoints: true,
      axisLabelFontSize: 11,
      legend: 'follow',
      includeZero: true,

      axes: {
        x: {
          axisLineColor: '#fff',
          ticker: function (min, max, pixels) {
            return [...Array(7)].map((_, i) =>
              ({
                v: i,
                label: $filter('date')(new Date(now + 864e5 * (i - 6)), 'MM-dd')
              })
            );
          },
        },
        y: {
          axisLineColor: '#fff',
          axisLabelWidth: 20,
          valueRange: [0, null],
          ticker: function (min, max, pixels) {
            let interval = Math.max(Math.ceil(max / 6), 1);
            let count = Math.ceil((max + 1) / interval);
            let ticks = [...Array(count + 1)].map((_, i) => i * interval)
              .map(n => ({ v: n, label: '' + n }));
            console.log(ticks);
            return ticks;
          },
        }
      },
      legendFormatter: legendWrap(legendContent),
    };

    api.SimplePromise.all([
      chartHandler.get('build-chart'),
      requestByName.project
    ]).then(([handler, data]) => {
      handler.updateData([...Array(7)].map((_, i) =>
        [i, data.action.build.auto[i], data.action.build.manual[i]]
      ));
      handler.updateOptions(angular.copy(lineChartOption));
    });

    api.SimplePromise.all([
      chartHandler.get('deploy-chart'),
      requestByName.deployment
    ]).then(([handler, data]) => {
      let online_detail = data.action.deploy.online_detail;
      handler.updateData([...Array(7)].map((_, i) =>
        [i, data.action.deploy.auto[i], data.action.deploy.online[i]]
      ));
      handler.updateOptions(angular.merge({}, lineChartOption, {
        legendFormatter: legendWrap(function (data) {
          if (data.x == null) return '';
          return legendContent(data) + '<div class="detail-count">' +
            `      　　启动 ${(online_detail[data.x] || {}).start}` +
            `<br />　　升级 ${(online_detail[data.x] || {}).update}` +
            `<br />　　回滚 ${(online_detail[data.x] || {}).rollback}` +
            `<br />　　扩容 ${(online_detail[data.x] || {}).scale_up}` +
            `<br />　　缩容 ${(online_detail[data.x] || {}).scale_down}` +
            '</div>';
        }),
      }));
    });

  }]);
})(angular.module('domeApp'));
