/*
 * @author ChandraLee
 * @description amcharts模块，用angular封装，改自 bower包 "angular-amchart": "~1.0.6",
 */

(function (window, undefined) {
    'use strict';
    var amchartsApp = angular.module('amchartsModule', []);
    amchartsApp.directive('amchart', function () {
        return {
            replace: true,
            scope: {
                options: '=ngModel',
                type: '@'
            },
            template: '<div class="amchart" style="width: 100%; height: 100%;"></div>',
            link: function (scope, $el) {
                var guid = function guid() {
                    function s4() {
                        return Math.floor((1 + Math.random()) * 0x10000)
                            .toString(16)
                            .substring(1);
                    }
                    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                        s4() + '-' + s4() + s4() + s4();
                };

                var id = guid();
                $el.attr('id', id);
                var chart;
                var renderChart = function () {
                    if (chart) {
                        chart.clear();
                    }
                    var option = scope.options;
                    var chartKeys = Object.keys(option);

                    switch (scope.type) {
                    case 'serial':
                        chart = new AmCharts.AmSerialChart();
                        break;
                    case 'pie':
                        chart = new AmCharts.AmPieChart();
                        break;
                    case 'funnel':
                        chart = new AmCharts.AmFunnelChart();
                        break;
                    case 'gauge':
                        chart = new AmCharts.AmAngularGauge();
                        break;
                    case 'radar':
                        chart = new AmCharts.AmRadarChart();
                        break;
                    case 'xy':
                        chart = new AmCharts.AmXYChart();
                        break;
                    }

                    chart.dataProvider = option.data;

                    for (var i = 0, l = chartKeys.length; i < l; i++) {
                        if (typeof option[chartKeys[i]] !== 'object' && typeof option[chartKeys[i]] !== 'function') {
                            chart[chartKeys[i]] = option[chartKeys[i]];
                        } else {
                            chart[chartKeys[i]] = angular.copy(option[chartKeys[i]]);
                        }
                    }
                    chart.write(id);
                };
                renderChart(scope.options);
                scope.$watch('options', function (newValue) {
                    if (id === $el[0].id || !id) {
                        renderChart(newValue);
                    }
                }, true);
            }
        };
    });
    window.amchartsApp = amchartsApp;
})(window);