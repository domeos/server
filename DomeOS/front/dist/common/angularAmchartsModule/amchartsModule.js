var amchartsApp = angular.module('amchartsModule', []);
amchartsApp.directive('amchart', function() {
    'use strict';
    return {
        replace: true,
        scope: {
            options: '=ngModel',
            type: '@'
        },
        template: "<div class='amchart' style='width: 100%; height: 100%;'></div>",
        link: function(scope, $el) {
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

            switch (scope.type) {
                case "serial":
                    chart = new AmCharts.AmSerialChart();
                    break;
                case "pie":
                    chart = new AmCharts.AmPieChart();
                    break;
                case "funnel":
                    chart = new AmCharts.AmFunnelChart();
                    break;
                case "gauge":
                    chart = new AmCharts.AmAngularGauge();
                    break;
                case "radar":
                    chart = new AmCharts.AmRadarChart();
                    break;
                case "xy":
                    chart = new AmCharts.AmXYChart();
                    break;
            }


            var renderChart = function() {
                var option = scope.options;
                var chartKeys = Object.keys(option);

                chart.dataProvider = option.data;

                for (var i = 0; i < chartKeys.length; i++) {
                    if (typeof option[chartKeys[i]] !== 'object' && typeof option[chartKeys[i]] !== 'function') {
                        chart[chartKeys[i]] = option[chartKeys[i]];
                    } else {
                        chart[chartKeys[i]] = angular.copy(option[chartKeys[i]]);
                    }
                }
                chart.write(id);
            };
            renderChart(scope.options);
            scope.$watch('options', function(newValue, oldValue) {
                if (id === $el[0].id || !id) {
                    renderChart(newValue);
                }
            }, true);
        }
    };
});