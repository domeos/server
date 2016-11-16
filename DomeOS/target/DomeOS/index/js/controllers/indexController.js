/*
 * @author ChandraLee
 * @description 顶级controller
 */

(function (domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;

    domeApp.controller('DomeCtr', DomeCtr);

    function DomeCtr($scope, $modal, $util, $domeUser, $publicApi, $q) {
        var vm = this;
        vm.currentMod = {
            mod: ''
        };
        vm.loginUser = {};
        vm.showPrompt = false;
        $scope.$on('pageTitle', function (event, msg) {
            vm.title = msg.title;
            vm.descrition = msg.descrition;
            vm.currentMod.mod = msg.mod;
        });
        $publicApi.getDbConfig().then(function (res) {
            vm.showPrompt = res.data.result == 'H2';
        });
        vm.getLoginUser = function () {
            var deferred = $q.defer();
            if (vm.loginUser.id) {
                deferred.resolve(vm.loginUser);
            } else {
                $domeUser.userService.getCurrentUser().then(function (res) {
                    vm.loginUser = res.data.result;
                    deferred.resolve(vm.loginUser);
                });
            }
            return deferred.promise;
        };
        vm.getLoginUser();
        vm.parseDate = function (seconds) {
            return $util.getPageDate(seconds);
        };
        vm.objLength = $util.objLength;
        vm.logout = function () {
            $domeUser.userService.logout();
        };
        vm.modifyPw = function () {
            $modal.open({
                animate: true,
                templateUrl: 'modifyPwModal.html',
                controller: 'ModifyPwModalCtr',
                size: 'md',
                resolve: {
                    loginUser: function () {
                        return vm.loginUser;
                    }
                }
            });
        };
        vm.modifySelfInfo = function () {
            $domeUser.getLoginUser().then(function (loginUser) {
                var modalInstance = $modal.open({
                    templateUrl: 'modifyUserInfoModal.html',
                    controller: 'ModifyUserInfoCtr',
                    size: 'md',
                    resolve: {
                        user: function () {
                            return angular.copy(loginUser);
                        }
                    }
                });
                modalInstance.result.then(function (userInfo) {
                    angular.extend(loginUser, userInfo);
                });
            });
        };
        vm.isStrNull = function (str) {
            var resTxt = str;
            if (!str) {
                resTxt = '未设置';
            }
            return resTxt;
        };
        vm.stopPropagation = function (event) {
            return event.stopPropagation();
        };
        vm.thinLeftNav = Boolean(Number(localStorage.getItem('thinLeftNav')));
        vm.toggleThinLeftNav = function () {
          vm.thinLeftNav = !vm.thinLeftNav;
          localStorage.setItem('thinLeftNav', String(Number(vm.thinLeftNav)));
        };
    }
    DomeCtr.$inject = ['$scope', '$modal', '$util', '$domeUser', '$publicApi', '$q'];

    domeApp.controller('PromptModalCtrl', ['$scope', '$modalInstance', 'promptTxt', '$timeout', function ($scope, $modalInstance, promptTxt, $timeout) {
        $scope.promptTxt = promptTxt;
        $timeout(function () {
            $modalInstance.dismiss('cancel');
        }, 1000);
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]).controller('WarningModalCtrl', ['$scope', '$modalInstance', 'promptTxt', function ($scope, $modalInstance, promptTxt) {
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
        $scope.promptTxt = promptTxt;
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
        $scope.sure = function () {
            $modalInstance.close();
        };
    }]).controller('DeleteModalCtr', ['$scope', '$modalInstance', 'promptTxt', function ($scope, $modalInstance, promptTxt) {
        $scope.promptTxt = promptTxt || '确定要删除吗？';
        $scope.delete = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
})(window.domeApp);