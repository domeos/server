'use strict';
angular.module('AngularAmChart', [])
        .directive('amchart', function () {
            return {
                replace: true,
                scope: {
                    options: '=ngModel'
                },
                template: "<div class='amchart' style='width: 100%; height: 400px;'></div>",
                link: function (scope, $el) {
                    //Gerando um uid para colocar no elemento
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

                    if (scope.options) {
                        //Função que renderiza o gráfico na tela
                        var renderChart = function (amChartOptions) {
                            var option = amChartOptions || scope.options;
                            //Instanciando o chart de serial
                            chart = new AmCharts.AmSerialChart();
                            
                            //verificando qual tipo é o gráfico
                            switch(option.type){
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
                            
                            
                            chart.dataProvider = option.data;

                            //Colocando no objeto chart todos as propriedades que vierem no option
                            var chartKeys = Object.keys(option);
                            for (var i = 0; i < chartKeys.length; i++) {
                                if (typeof option[chartKeys[i]] !== 'object' && typeof option[chartKeys[i]] !== 'function') {
                                    chart[chartKeys[i]] = option[chartKeys[i]];
                                } else {
                                    chart[chartKeys[i]] = angular.copy(option[chartKeys[i]]);
                                }
                            }
                            //Método do objeto Amchart para rendererizar o gráfico
                            chart.write(id);
                        };

                        renderChart();
                        scope.$watch('options', function (newValue, oldValue) {
                            if (id === $el[0].id || !id) {
                                renderChart(newValue);
                            }
                        }, true);
                    }

                }
            };
        });