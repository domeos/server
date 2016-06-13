(function () {
    var domeModule = angular.module('domeModule', []);
    domeModule.config(['$httpProvider', function ($httpProvider) {
        'use strict';
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
        $httpProvider.interceptors.push(['$rootScope', '$q', function ($rootScope, $q) {
            return {
                'response': function (response) {
                    if (typeof response.data == 'string' && response.data.indexOf('<html ng-app="loginApp">') >= 0) {
                        if (response.config.url.indexOf('api/user/logout') !== -1) {
                            location.href = '/login/login.html';
                        } else {
                            location.href = '/login/login.html?redirect=' + encodeURIComponent(location.href);
                        }
                    }
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
    domeModule.controller('PromptModalCtrl', ['$scope', '$modalInstance', 'promptTxt', '$timeout', function ($scope, $modalInstance, promptTxt, $timeout) {
        'use strict';
        $scope.promptTxt = promptTxt;
        $timeout(function () {
            $modalInstance.dismiss('cancel');
        }, 1000);
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]).controller('WarningModalCtrl', ['$scope', '$modalInstance', 'promptTxt', function ($scope, $modalInstance, promptTxt) {
        'use strict';
        if (typeof promptTxt === 'string') {
            $scope.titleInfo = promptTxt;
        } else {
            $scope.titleInfo = promptTxt.title;
            $scope.detailInfo = promptTxt.msg;
        }
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]).controller('ConfirmModalCtr', ['$scope', '$modalInstance', 'promptTxt', function ($scope, $modalInstance, promptTxt) {
        'use strict';
        $scope.promptTxt = promptTxt;
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
        $scope.sure = function () {
            $modalInstance.close();
        };
    }]).controller('DeleteModalCtr', ['$scope', '$modalInstance', 'promptTxt', function ($scope, $modalInstance, promptTxt) {
        'use strict';
        $scope.promptTxt = promptTxt || '确定要删除吗？';
        $scope.delete = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]).controller('ModifyUserInfoCtr', ['$scope', 'user', '$publicApi', '$modalInstance', '$domePublic', function ($scope, user, $publicApi, $modalInstance, $domePublic) {
        $scope.user = user;
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
        $scope.submit = function () {
            var userInfo = {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone

            };
            $publicApi.modifyUserInfo(userInfo).then(function () {
                $domePublic.openPrompt('修改成功！');
                $modalInstance.close(userInfo);
            }, function (res) {
                $domePublic.openWarning({
                    title: '修改失败！',
                    msg: res.data.resultMsg
                });
            });
        };
    }]);
    // 公共service
    domeModule.factory('$domePublic', ['$modal', function ($modal) {
        'use strict';
        var publicService = {};
        // info : 'String' or {title:'title info',msg:'warning detail'}
        publicService.openWarning = function (info) {
            $modal.open({
                animation: true,
                templateUrl: 'warningModal.html',
                controller: 'WarningModalCtrl',
                size: 'sm',
                resolve: {
                    promptTxt: function () {
                        return info;
                    }
                }
            });
        };
        publicService.openPrompt = function (txt) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'promptModal.html',
                controller: 'PromptModalCtrl',
                size: 'sm',
                resolve: {
                    promptTxt: function () {
                        return txt;
                    }
                }
            });
            return modalInstance.result;
        };
        publicService.openConfirm = function (txt) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'confirmModal.html',
                controller: 'ConfirmModalCtr',
                size: 'sm',
                resolve: {
                    promptTxt: function () {
                        return txt;
                    }
                }
            });
            return modalInstance.result;
        };
        publicService.openDelete = function (txt) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'deleteModal.html',
                controller: 'DeleteModalCtr',
                size: 'sm',
                resolve: {
                    promptTxt: function () {
                        return txt;
                    }
                }
            });
            return modalInstance.result;
        };
        var Loadings = function () {
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
    }]).factory('$publicApi', ['$http', function ($http) {
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
            return $http.get('/api/user/logout');
        };
        return apiService;
    }]);
    window.domeModule = domeModule;
})();