/*
 * @author  ChandraLee
 * @description  公共模块
 */
(function (window) {
    var domeModule = angular.module('domeModule', []);
    domeModule.config(['$httpProvider', function ($httpProvider) {
        'use strict';
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
        $httpProvider.interceptors.push(['$rootScope', '$q', function ($rootScope, $q) {
            return {
                'responseError': function (response) {
                  if (!response.config.ignore401 && response.status === 401) {
                        location.href = '/login/login.html?redirect=' + encodeURIComponent(location.href);
                    }
                },
                'response': function (response) {
                    
                    // 判断是否需要自动将resultCode!=200的请求默认为失败 可以设置请求的config:{notIntercept:true},使其不对resultCode!==200的进行拦截
                    if (!response.config.notIntercept) {
                        if (!response.data.resultCode || response.data.resultCode == 200) {
                            return response || $q.resolve(response);
                        }
                        return $q.reject(response);
                    }
                    return response;
                }
            };
        }]);
    }]);
    // 公共service
    domeModule.factory('$domePublic', ['$modal', function ($modal) {
        'use strict';
        var publicService = {};
        var Loadings = function Loadings() {
            this.isLoading = false;
            this.loadingItems = {};
        };
        Loadings.prototype = {
            startLoading: function (loadingItem) {
                this.loadingItems[loadingItem] = true;
                if (!this.isLoading) {
                    this.isLoading = true;
                }
            },
            finishLoading: function (loadingItem) {
                var that = this;
                var isLoadingNow = false;
                that.loadingItems[loadingItem] = false;
                angular.forEach(that.loadingItems, function (value) {
                    if (value && !isLoadingNow) {
                        isLoadingNow = true;
                    }
                });
                that.isLoading = isLoadingNow;
            }
        };
        publicService.getLoadingInstance = function () {
            return new Loadings();
        };
        return publicService;
    }])
    domeModule.factory('$publicApi', ['$http', function ($http) {
        'use strict';
        var apiService = {};
        apiService.getDomeVersion = function () {
            return $http.get('/api/global/version');
        };
        apiService.getDbConfig = function () {
            return $http.get('/api/global/database');
        };
        apiService.getCurrentUser = function () {
            return $http.get('/api/user/get');
        };
        apiService.modifyUserInfo = function (user) {
            return $http.post('/api/user/modify', angular.toJson(user));
        };
        apiService.logout = function () {
          location.href = '/api/user/logout?from=' + encodeURIComponent(location.protocol + '//' + location.host);
        };
        return apiService;
    }]);
    window.domeModule = domeModule;
})(window);