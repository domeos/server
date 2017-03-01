'use strict';

/*
 * @author ChandraLee
 * @description 用户模块
 */

(function (window, undefined) {
    'use strict';

    var userModule = angular.module('userModule', []);
    userModule.controller('ModifyPwModalCtr', ['$scope', 'loginUser', '$modalInstance', '$domePublic', '$domeUser', function ($scope, loginUser, $modalInstance, $domePublic, $domeUser) {
        $scope.pwObj = {
            username: loginUser.username,
            oldpassword: '',
            newpassword: ''
        };
        $scope.newPwAgain = '';
        $scope.modiftPw = function () {
            $domeUser.userService.userModifyPw($scope.pwObj).then(function () {
                $domePublic.openPrompt('修改成功，请重新登录！').finally(function () {
                    location.href = '/login/login.html?redirect=' + encodeURIComponent(location.href);
                });
            }, function () {
                $domePublic.openWarning('修改失败，请重试！');
            });
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
    // 用户管理service
    userModule.factory('$domeUser', ['$http', '$q', '$domePublic', '$domeGlobal', '$domeModel', function ($http, $q, $domePublic, $domeGlobal, $domeModel) {
        var loginUser = {};
        var relatedGitLab = function relatedGitLab(loginData) {
            var deferred = $q.defer();
            var gitOptions = $domeGlobal.getGloabalInstance('git');
            gitOptions.getData().then(function (info) {
                if (!info[0].url) {
                    $domePublic.openWarning('未配置代码仓库地址！');
                    deferred.reject();
                } else {
                    var url = info[0].url;
                    $http.post(url + '/api/v3/session', angular.toJson(loginData)).then(function (res) {
                        var info = res.data;
                        var params = {
                            name: info.username,
                            token: info.private_token,
                            gitlabId: loginData.gitlabId
                        };
                        return params;
                    }, function () {
                        deferred.reject();
                    }).then(function (params) {
                        $http.post('/api/project/git/gitlabinfo', angular.toJson(params)).then(function (res) {
                            deferred.resolve(res.data.result);
                        }, function () {
                            deferred.reject();
                        });
                    }, function () {
                        deferred.reject();
                    });
                }
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        };
        var userService = {
            getCurrentUser: function getCurrentUser() {
                return $http.get('/api/user/get');
            },
            getUserList: function getUserList() {
                return $http.get('/api/user/list');
            },
            modifyUserInfo: function modifyUserInfo(user) {
                return $http.post('/api/user/modify', angular.toJson(user));
            },
            // 管理员修改：@param userInfo:{username:'username', password:'password'}
            modifyPw: function modifyPw(userInfo) {
                return $http.post('/api/user/adminChangePassword', angular.toJson(userInfo));
            },
            // 用户修改： @param userInfo: {username:'username', oldpassword:'oldpassword', newpassword:'newpassword'}
            userModifyPw: function userModifyPw(userInfo) {
                return $http.post('/api/user/changePassword', angular.toJson(userInfo));
            },
            deleteUser: function deleteUser(userId) {
                return $http.delete('/api/user/delete/' + userId);
            },
            createUser: function createUser(userInfo) {
                return $http.post('/api/user/create', angular.toJson(userInfo));
            },
            //获取登录用户对应资源的角色
            getResourceUserRole: function getResourceUserRole(resourceType, id) {
                return $http.get('/api/user/resource/' + resourceType + '/' + id);
            },
            // 获取单个资源用户信息
            getSigResourceUser: function getSigResourceUser(resourceType, id) {
                return $http.get('/api/resource/' + resourceType + '/' + id);
            },
            getResourceList: function getResourceList(resourceType) {
                return $http.get('/api/collections/' + resourceType);
            },
            // 获取某类资源用户信息 has deleted 2016-10-27
            getResourceUser: function getResourceUser(resourceType) {
                return $http.get('/api/resource/' + resourceType + '/useronly');
            },
            modifyResourceUser: function modifyResourceUser(resourceInfo) {
                return $http.put('/api/resource', angular.toJson(resourceInfo));
            },
            deleteResourceUser: function deleteResourceUser(resourceType, resourceId, ownerType, ownerId) {
                return $http.delete('/api/resource/' + resourceType + '/' + resourceId + '/' + ownerType + '/' + ownerId);
            },
            // 获取资源组信息
            getGroupList: function getGroupList() {
                return $http.get(' /api/namespace/list');
            },
            // 获取组列表
            getGroup: function getGroup() {
                return $http.get('/api/group/list');
            },
            getGroupInfo: function getGroupInfo(groupId) {
                return $http.get('/api/group/get/' + groupId);
            },
            deleteGroup: function deleteGroup(groupId) {
                return $http.delete('/api/group/delete/' + groupId);
            },
            createGroup: function createGroup(groupData) {
                return $http.post('/api/group/create', angular.toJson(groupData));
            },
            modifyGroupUsers: function modifyGroupUsers(groupId, users) {
                return $http.post('/api/group_members/' + groupId, angular.toJson(users));
            },
            deleteGroupUser: function deleteGroupUser(groupId, userId) {
                return $http.delete('/api/group_members/' + groupId + '/' + userId);
            },
            getGroupUser: function getGroupUser(groupId) {
                return $http.get('/api/group_members/' + groupId);
            },
            logout: function logout() {
                return $http.get('/api/user/logout');
            },

            //collection 用户行为

            deleteCollectionUser: function deleteCollectionUser(collectionId, userId, resourceType) {
                return $http.delete('/api/collection_members/' + collectionId + '/' + userId + '/' + resourceType);
            },

            modifyUserRole: function modifyUserRole(collectionMember) {
                return $http.post('/api/collection_members/single', angular.toJson(collectionMember));
            },
            addCollectionUsers: function addCollectionUsers(collectionData) {
                return $http.post('/api/collection_members/multiple', angular.toJson(collectionData));
            },
            addOneCollectionUser: function addOneCollectionUser(collectionData) {
                return $http.post('/api/collection_members/single', angular.toJson(collectionData));
            },
            getCollectionUser: function getCollectionUser(collectionId, resourceType) {
                return $http.get('/api/collection_members/' + collectionId + '/' + resourceType);
            },
            //用于项目创建成员添加初始化和项目成员标签页的成员添加
            createCollectionUser: function createCollectionUser(collectionData) {
                return $http.post('/api/collection_members/multiple', angular.toJson(collectionData));
            },
            //获取项目组或者部署组的用户信息
            //getCollectionSpaceUser: (resourceType) => $http.get(`/api/collectionspace/list/${resourceType}`)
            getCollectionList: function getCollectionList(collectionList) {
                return $http.post('/api/collections/' + resourceType);
            }
        };

        var getLoginUser = function getLoginUser() {
            var deferred = $q.defer();
            if (loginUser.id) {
                deferred.resolve(loginUser);
            } else {
                userService.getCurrentUser().then(function (res) {
                    loginUser = res.data.result;
                    deferred.resolve(loginUser);
                });
            }
            return deferred.promise;
        };

        return {
            userService: userService,
            relatedGitLab: relatedGitLab,
            getLoginUser: getLoginUser
        };
    }]);
    window.userModule = userModule;
})(window);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi91c2VyTW9kdWxlL3VzZXJNb2R1bGUuZXMiXSwibmFtZXMiOlsid2luZG93IiwidW5kZWZpbmVkIiwidXNlck1vZHVsZSIsImFuZ3VsYXIiLCJtb2R1bGUiLCJjb250cm9sbGVyIiwiJHNjb3BlIiwibG9naW5Vc2VyIiwiJG1vZGFsSW5zdGFuY2UiLCIkZG9tZVB1YmxpYyIsIiRkb21lVXNlciIsInB3T2JqIiwidXNlcm5hbWUiLCJvbGRwYXNzd29yZCIsIm5ld3Bhc3N3b3JkIiwibmV3UHdBZ2FpbiIsIm1vZGlmdFB3IiwidXNlclNlcnZpY2UiLCJ1c2VyTW9kaWZ5UHciLCJ0aGVuIiwib3BlblByb21wdCIsImZpbmFsbHkiLCJsb2NhdGlvbiIsImhyZWYiLCJlbmNvZGVVUklDb21wb25lbnQiLCJvcGVuV2FybmluZyIsImNhbmNlbCIsImRpc21pc3MiLCJ1c2VyIiwiJHB1YmxpY0FwaSIsInN1Ym1pdCIsInVzZXJJbmZvIiwiaWQiLCJlbWFpbCIsInBob25lIiwibW9kaWZ5VXNlckluZm8iLCJjbG9zZSIsInJlcyIsInRpdGxlIiwibXNnIiwiZGF0YSIsInJlc3VsdE1zZyIsImZhY3RvcnkiLCIkaHR0cCIsIiRxIiwiJGRvbWVHbG9iYWwiLCIkZG9tZU1vZGVsIiwicmVsYXRlZEdpdExhYiIsImxvZ2luRGF0YSIsImRlZmVycmVkIiwiZGVmZXIiLCJnaXRPcHRpb25zIiwiZ2V0R2xvYWJhbEluc3RhbmNlIiwiZ2V0RGF0YSIsImluZm8iLCJ1cmwiLCJyZWplY3QiLCJwb3N0IiwidG9Kc29uIiwicGFyYW1zIiwibmFtZSIsInRva2VuIiwicHJpdmF0ZV90b2tlbiIsImdpdGxhYklkIiwicmVzb2x2ZSIsInJlc3VsdCIsInByb21pc2UiLCJnZXRDdXJyZW50VXNlciIsImdldCIsImdldFVzZXJMaXN0IiwibW9kaWZ5UHciLCJkZWxldGVVc2VyIiwiZGVsZXRlIiwidXNlcklkIiwiY3JlYXRlVXNlciIsImdldFJlc291cmNlVXNlclJvbGUiLCJyZXNvdXJjZVR5cGUiLCJnZXRTaWdSZXNvdXJjZVVzZXIiLCJnZXRSZXNvdXJjZUxpc3QiLCJnZXRSZXNvdXJjZVVzZXIiLCJtb2RpZnlSZXNvdXJjZVVzZXIiLCJwdXQiLCJyZXNvdXJjZUluZm8iLCJkZWxldGVSZXNvdXJjZVVzZXIiLCJyZXNvdXJjZUlkIiwib3duZXJUeXBlIiwib3duZXJJZCIsImdldEdyb3VwTGlzdCIsImdldEdyb3VwIiwiZ2V0R3JvdXBJbmZvIiwiZ3JvdXBJZCIsImRlbGV0ZUdyb3VwIiwiY3JlYXRlR3JvdXAiLCJncm91cERhdGEiLCJtb2RpZnlHcm91cFVzZXJzIiwidXNlcnMiLCJkZWxldGVHcm91cFVzZXIiLCJnZXRHcm91cFVzZXIiLCJsb2dvdXQiLCJkZWxldGVDb2xsZWN0aW9uVXNlciIsImNvbGxlY3Rpb25JZCIsIm1vZGlmeVVzZXJSb2xlIiwiY29sbGVjdGlvbk1lbWJlciIsImFkZENvbGxlY3Rpb25Vc2VycyIsImNvbGxlY3Rpb25EYXRhIiwiYWRkT25lQ29sbGVjdGlvblVzZXIiLCJnZXRDb2xsZWN0aW9uVXNlciIsImNyZWF0ZUNvbGxlY3Rpb25Vc2VyIiwiZ2V0Q29sbGVjdGlvbkxpc3QiLCJnZXRMb2dpblVzZXIiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7O0FBS0EsQ0FBQyxVQUFDQSxNQUFELEVBQVNDLFNBQVQsRUFBdUI7QUFDcEI7O0FBQ0EsUUFBSUMsYUFBYUMsUUFBUUMsTUFBUixDQUFlLFlBQWYsRUFBNkIsRUFBN0IsQ0FBakI7QUFDQUYsZUFBV0csVUFBWCxDQUFzQixrQkFBdEIsRUFBMEMsQ0FBQyxRQUFELEVBQVcsV0FBWCxFQUF3QixnQkFBeEIsRUFBMEMsYUFBMUMsRUFBeUQsV0FBekQsRUFBc0UsVUFBVUMsTUFBVixFQUFrQkMsU0FBbEIsRUFBNkJDLGNBQTdCLEVBQTZDQyxXQUE3QyxFQUEwREMsU0FBMUQsRUFBcUU7QUFDakxKLGVBQU9LLEtBQVAsR0FBZTtBQUNYQyxzQkFBVUwsVUFBVUssUUFEVDtBQUVYQyx5QkFBYSxFQUZGO0FB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QUFELEVBQVM7QUFDdkM5QixnQ0FBWThCLElBQUlHLElBQUosQ0FBU3lCLE1BQXJCO0FBQ0FoQiw2QkFBU2UsT0FBVCxDQUFpQnpELFNBQWpCO0FBQ0gsaUJBSEQ7QUFJSDtBQUNELG1CQUFPMEMsU0FBU2lCLE9BQWhCO0FBQ0gsU0FYRDs7QUFhQSxlQUFPO0FBQ0hqRCx5QkFBYUEsV0FEVjtBQUVIOEIsMkJBQWVBLGFBRlo7QUFHSDhELDBCQUFjQTtBQUhYLFNBQVA7QUFLSCxLQXBHK0IsQ0FBaEM7QUFxR0E3RyxXQUFPRSxVQUFQLEdBQW9CQSxVQUFwQjtBQUNILENBdkpELEVBdUpHRixNQXZKSCIsImZpbGUiOiJjb21tb24vdXNlck1vZHVsZS91c2VyTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogQGF1dGhvciBDaGFuZHJhTGVlXHJcbiAqIEBkZXNjcmlwdGlvbiDnlKjmiLfmqKHlnZdcclxuICovXHJcblxyXG4oKHdpbmRvdywgdW5kZWZpbmVkKSA9PiB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBsZXQgdXNlck1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCd1c2VyTW9kdWxlJywgW10pO1xyXG4gICAgdXNlck1vZHVsZS5jb250cm9sbGVyKCdNb2RpZnlQd01vZGFsQ3RyJywgWyckc2NvcGUnLCAnbG9naW5Vc2VyJywgJyRtb2RhbEluc3RhbmNlJywgJyRkb21lUHVibGljJywgJyRkb21lVXNlcicsIGZ1bmN0aW9uICgkc2NvcGUsIGxvZ2luVXNlciwgJG1vZGFsSW5zdGFuY2UsICRkb21lUHVibGljLCAkZG9tZVVzZXIpIHtcclxuICAgICAgICAkc2NvcGUucHdPYmogPSB7XHJcbiAgICAgICAgICAgIHVzZXJuYW1lOiBsb2dpblVzZXIudXNlcm5hbWUsXHJcbiAgICAgICAgICAgIG9sZHBhc3N3b3JkOiAnJyxcclxuICAgICAgICAgICAgbmV3cGFzc3dvcmQ6ICcnXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkc2NvcGUubmV3UHdBZ2FpbiA9ICcnO1xyXG4gICAgICAgICRzY29wZS5tb2RpZnRQdyA9ICgpID0+IHtcclxuICAgICAgICAgICAgJGRvbWVVc2VyLnVzZXJTZXJ2aWNlLnVzZXJNb2RpZnlQdygkc2NvcGUucHdPYmopLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5L+u5pS55oiQ5Yqf77yM6K+36YeN5paw55m75b2V77yBJykuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcvbG9naW4vbG9naW4uaHRtbD9yZWRpcmVjdD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGxvY2F0aW9uLmhyZWYpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5L+u5pS55aSx6LSl77yM6K+36YeN6K+V77yBJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoJ2NhbmNlbCcpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XSkuY29udHJvbGxlcignTW9kaWZ5VXNlckluZm9DdHInLCBbJyRzY29wZScsICd1c2VyJywgJyRwdWJsaWNBcGknLCAnJG1vZGFsSW5zdGFuY2UnLCAnJGRvbWVQdWJsaWMnLCBmdW5jdGlvbiAoJHNjb3BlLCB1c2VyLCAkcHVibGljQXBpLCAkbW9kYWxJbnN0YW5jZSwgJGRvbWVQdWJsaWMpIHtcclxuICAgICAgICAkc2NvcGUudXNlciA9IHVzZXI7XHJcbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9ICgpID0+IHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHNjb3BlLnN1Ym1pdCA9ICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHVzZXJJbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IHVzZXIuaWQsXHJcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlci51c2VybmFtZSxcclxuICAgICAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxyXG4gICAgICAgICAgICAgICAgcGhvbmU6IHVzZXIucGhvbmVcclxuXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRwdWJsaWNBcGkubW9kaWZ5VXNlckluZm8odXNlckluZm8pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5L+u5pS55oiQ5Yqf77yBJyk7XHJcbiAgICAgICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSh1c2VySW5mbyk7XHJcbiAgICAgICAgICAgIH0sIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+S/ruaUueWksei0pe+8gScsXHJcbiAgICAgICAgICAgICAgICAgICAgbXNnOiByZXMuZGF0YS5yZXN1bHRNc2dcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfV0pO1xyXG4gICAgLy8g55So5oi3566h55CGc2VydmljZVxyXG4gICAgdXNlck1vZHVsZS5mYWN0b3J5KCckZG9tZVVzZXInLCBbJyRodHRwJywgJyRxJywgJyRkb21lUHVibGljJywgJyRkb21lR2xvYmFsJywgJyRkb21lTW9kZWwnLCBmdW5jdGlvbiAoJGh0dHAsICRxLCAkZG9tZVB1YmxpYywgJGRvbWVHbG9iYWwsICRkb21lTW9kZWwpIHtcclxuICAgICAgICBsZXQgbG9naW5Vc2VyID0ge307XHJcbiAgICAgICAgY29uc3QgcmVsYXRlZEdpdExhYiA9IChsb2dpbkRhdGEpID0+IHtcclxuICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgbGV0IGdpdE9wdGlvbnMgPSAkZG9tZUdsb2JhbC5nZXRHbG9hYmFsSW5zdGFuY2UoJ2dpdCcpO1xyXG4gICAgICAgICAgICBnaXRPcHRpb25zLmdldERhdGEoKS50aGVuKChpbmZvKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWluZm9bMF0udXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+acqumFjee9ruS7o+eggeS7k+W6k+WcsOWdgO+8gScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdXJsID0gaW5mb1swXS51cmw7XHJcbiAgICAgICAgICAgICAgICAgICAgJGh0dHAucG9zdCh1cmwgKyAnL2FwaS92My9zZXNzaW9uJywgYW5ndWxhci50b0pzb24obG9naW5EYXRhKSkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbmZvID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJhbXMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpbmZvLnVzZXJuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW46IGluZm8ucHJpdmF0ZV90b2tlbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpdGxhYklkOiBsb2dpbkRhdGEuZ2l0bGFiSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJhbXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9wcm9qZWN0L2dpdC9naXRsYWJpbmZvJywgYW5ndWxhci50b0pzb24ocGFyYW1zKSkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlcy5kYXRhLnJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgdXNlclNlcnZpY2UgPSB7XHJcbiAgICAgICAgICAgIGdldEN1cnJlbnRVc2VyOiAoKSA9PiAkaHR0cC5nZXQoJy9hcGkvdXNlci9nZXQnKSxcclxuICAgICAgICAgICAgZ2V0VXNlckxpc3Q6ICgpID0+ICRodHRwLmdldCgnL2FwaS91c2VyL2xpc3QnKSxcclxuICAgICAgICAgICAgbW9kaWZ5VXNlckluZm86IHVzZXIgPT4gJGh0dHAucG9zdCgnL2FwaS91c2VyL21vZGlmeScsIGFuZ3VsYXIudG9Kc29uKHVzZXIpKSxcclxuICAgICAgICAgICAgLy8g566h55CG5ZGY5L+u5pS577yaQHBhcmFtIHVzZXJJbmZvOnt1c2VybmFtZTondXNlcm5hbWUnLCBwYXNzd29yZDoncGFzc3dvcmQnfVxyXG4gICAgICAgICAgICBtb2RpZnlQdzogdXNlckluZm8gPT4gJGh0dHAucG9zdCgnL2FwaS91c2VyL2FkbWluQ2hhbmdlUGFzc3dvcmQnLCBhbmd1bGFyLnRvSnNvbih1c2VySW5mbykpLFxyXG4gICAgICAgICAgICAvLyDnlKjmiLfkv67mlLnvvJogQHBhcmFtIHVzZXJJbmZvOiB7dXNlcm5hbWU6J3VzZXJuYW1lJywgb2xkcGFzc3dvcmQ6J29sZHBhc3N3b3JkJywgbmV3cGFzc3dvcmQ6J25ld3Bhc3N3b3JkJ31cclxuICAgICAgICAgICAgdXNlck1vZGlmeVB3OiB1c2VySW5mbyA9PiAkaHR0cC5wb3N0KCcvYXBpL3VzZXIvY2hhbmdlUGFzc3dvcmQnLCBhbmd1bGFyLnRvSnNvbih1c2VySW5mbykpLFxyXG4gICAgICAgICAgICBkZWxldGVVc2VyOiB1c2VySWQgPT4gJGh0dHAuZGVsZXRlKGAvYXBpL3VzZXIvZGVsZXRlLyR7dXNlcklkfWApLFxyXG4gICAgICAgICAgICBjcmVhdGVVc2VyOiB1c2VySW5mbyA9PiAkaHR0cC5wb3N0KCcvYXBpL3VzZXIvY3JlYXRlJywgYW5ndWxhci50b0pzb24odXNlckluZm8pKSxcclxuICAgICAgICAgICAgLy/ojrflj5bnmbvlvZXnlKjmiLflr7nlupTotYTmupDnmoTop5LoibJcclxuICAgICAgICAgICAgZ2V0UmVzb3VyY2VVc2VyUm9sZTogKHJlc291cmNlVHlwZSwgaWQpID0+ICRodHRwLmdldChgL2FwaS91c2VyL3Jlc291cmNlLyR7cmVzb3VyY2VUeXBlfS8ke2lkfWApLFxyXG4gICAgICAgICAgICAvLyDojrflj5bljZXkuKrotYTmupDnlKjmiLfkv6Hmga9cclxuICAgICAgICAgICAgZ2V0U2lnUmVzb3VyY2VVc2VyOiAocmVzb3VyY2VUeXBlLCBpZCkgPT4gJGh0dHAuZ2V0KGAvYXBpL3Jlc291cmNlLyR7cmVzb3VyY2VUeXBlfS8ke2lkfWApLFxyXG4gICAgICAgICAgICBnZXRSZXNvdXJjZUxpc3Q6IChyZXNvdXJjZVR5cGUpID0+ICRodHRwLmdldChgL2FwaS9jb2xsZWN0aW9ucy8ke3Jlc291cmNlVHlwZX1gKSxcclxuICAgICAgICAgICAgLy8g6I635Y+W5p+Q57G76LWE5rqQ55So5oi35L+h5oGvIGhhcyBkZWxldGVkIDIwMTYtMTAtMjdcclxuICAgICAgICAgICAgZ2V0UmVzb3VyY2VVc2VyOiByZXNvdXJjZVR5cGUgPT4gJGh0dHAuZ2V0KGAvYXBpL3Jlc291cmNlLyR7cmVzb3VyY2VUeXBlfS91c2Vyb25seWApLFxyXG4gICAgICAgICAgICBtb2RpZnlSZXNvdXJjZVVzZXI6IHJlc291cmNlSW5mbyA9PiAkaHR0cC5wdXQoJy9hcGkvcmVzb3VyY2UnLCBhbmd1bGFyLnRvSnNvbihyZXNvdXJjZUluZm8pKSxcclxuICAgICAgICAgICAgZGVsZXRlUmVzb3VyY2VVc2VyOiAocmVzb3VyY2VUeXBlLCByZXNvdXJjZUlkLCBvd25lclR5cGUsIG93bmVySWQpID0+ICRodHRwLmRlbGV0ZShgL2FwaS9yZXNvdXJjZS8ke3Jlc291cmNlVHlwZX0vJHtyZXNvdXJjZUlkfS8ke293bmVyVHlwZX0vJHtvd25lcklkfWApLFxyXG4gICAgICAgICAgICAvLyDojrflj5botYTmupDnu4Tkv6Hmga9cclxuICAgICAgICAgICAgZ2V0R3JvdXBMaXN0OiAoKSA9PiAkaHR0cC5nZXQoJyAvYXBpL25hbWVzcGFjZS9saXN0JyksXHJcbiAgICAgICAgICAgIC8vIOiOt+WPlue7hOWIl+ihqFxyXG4gICAgICAgICAgICBnZXRHcm91cDogKCkgPT4gJGh0dHAuZ2V0KCcvYXBpL2dyb3VwL2xpc3QnKSxcclxuICAgICAgICAgICAgZ2V0R3JvdXBJbmZvOiBncm91cElkID0+ICRodHRwLmdldChgL2FwaS9ncm91cC9nZXQvJHtncm91cElkfWApLFxyXG4gICAgICAgICAgICBkZWxldGVHcm91cDogZ3JvdXBJZCA9PiAkaHR0cC5kZWxldGUoYC9hcGkvZ3JvdXAvZGVsZXRlLyR7Z3JvdXBJZH1gKSxcclxuICAgICAgICAgICAgY3JlYXRlR3JvdXA6IGdyb3VwRGF0YSA9PiAkaHR0cC5wb3N0KCcvYXBpL2dyb3VwL2NyZWF0ZScsIGFuZ3VsYXIudG9Kc29uKGdyb3VwRGF0YSkpLFxyXG4gICAgICAgICAgICBtb2RpZnlHcm91cFVzZXJzOiAoZ3JvdXBJZCwgdXNlcnMpID0+ICRodHRwLnBvc3QoYC9hcGkvZ3JvdXBfbWVtYmVycy8ke2dyb3VwSWR9YCwgYW5ndWxhci50b0pzb24odXNlcnMpKSxcclxuICAgICAgICAgICAgZGVsZXRlR3JvdXBVc2VyOiAoZ3JvdXBJZCwgdXNlcklkKSA9PiAkaHR0cC5kZWxldGUoYC9hcGkvZ3JvdXBfbWVtYmVycy8ke2dyb3VwSWR9LyR7dXNlcklkfWApLFxyXG4gICAgICAgICAgICBnZXRHcm91cFVzZXI6IGdyb3VwSWQgPT4gJGh0dHAuZ2V0KGAvYXBpL2dyb3VwX21lbWJlcnMvJHtncm91cElkfWApLFxyXG4gICAgICAgICAgICBsb2dvdXQ6ICgpID0+ICRodHRwLmdldCgnL2FwaS91c2VyL2xvZ291dCcpLFxyXG5cclxuICAgICAgICAgICAgLy9jb2xsZWN0aW9uIOeUqOaIt+ihjOS4ulxyXG4gICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGRlbGV0ZUNvbGxlY3Rpb25Vc2VyOiAoY29sbGVjdGlvbklkLCB1c2VySWQsIHJlc291cmNlVHlwZSkgPT4gJGh0dHAuZGVsZXRlKGAvYXBpL2NvbGxlY3Rpb25fbWVtYmVycy8ke2NvbGxlY3Rpb25JZH0vJHt1c2VySWR9LyR7IHJlc291cmNlVHlwZX1gKSxcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIG1vZGlmeVVzZXJSb2xlOiBjb2xsZWN0aW9uTWVtYmVyID0+ICRodHRwLnBvc3QoJy9hcGkvY29sbGVjdGlvbl9tZW1iZXJzL3NpbmdsZScsYW5ndWxhci50b0pzb24oY29sbGVjdGlvbk1lbWJlcikpLFxyXG4gICAgICAgICAgICBhZGRDb2xsZWN0aW9uVXNlcnM6IGNvbGxlY3Rpb25EYXRhID0+ICRodHRwLnBvc3QoJy9hcGkvY29sbGVjdGlvbl9tZW1iZXJzL211bHRpcGxlJywgYW5ndWxhci50b0pzb24oY29sbGVjdGlvbkRhdGEpKSxcclxuICAgICAgICAgICAgYWRkT25lQ29sbGVjdGlvblVzZXI6IChjb2xsZWN0aW9uRGF0YSkgPT4gJGh0dHAucG9zdCgnL2FwaS9jb2xsZWN0aW9uX21lbWJlcnMvc2luZ2xlJywgYW5ndWxhci50b0pzb24oY29sbGVjdGlvbkRhdGEpKSxcclxuICAgICAgICAgICAgZ2V0Q29sbGVjdGlvblVzZXI6IChjb2xsZWN0aW9uSWQscmVzb3VyY2VUeXBlKSA9PiAkaHR0cC5nZXQoYC9hcGkvY29sbGVjdGlvbl9tZW1iZXJzLyR7Y29sbGVjdGlvbklkfS8ke3Jlc291cmNlVHlwZX1gKSxcclxuICAgICAgICAgICAgLy/nlKjkuo7pobnnm67liJvlu7rmiJDlkZjmt7vliqDliJ3lp4vljJblkozpobnnm67miJDlkZjmoIfnrb7pobXnmoTmiJDlkZjmt7vliqBcclxuICAgICAgICAgICAgY3JlYXRlQ29sbGVjdGlvblVzZXI6IGNvbGxlY3Rpb25EYXRhID0+ICRodHRwLnBvc3QoJy9hcGkvY29sbGVjdGlvbl9tZW1iZXJzL211bHRpcGxlJyxhbmd1bGFyLnRvSnNvbihjb2xsZWN0aW9uRGF0YSkpLFxyXG4gICAgICAgICAgICAvL+iOt+WPlumhueebrue7hOaIluiAhemDqOe9sue7hOeahOeUqOaIt+S/oeaBr1xyXG4gICAgICAgICAgICAvL2dldENvbGxlY3Rpb25TcGFjZVVzZXI6IChyZXNvdXJjZVR5cGUpID0+ICRodHRwLmdldChgL2FwaS9jb2xsZWN0aW9uc3BhY2UvbGlzdC8ke3Jlc291cmNlVHlwZX1gKVxyXG4gICAgICAgICAgICBnZXRDb2xsZWN0aW9uTGlzdDogY29sbGVjdGlvbkxpc3QgPT4gJGh0dHAucG9zdChgL2FwaS9jb2xsZWN0aW9ucy8ke3Jlc291cmNlVHlwZX1gKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IGdldExvZ2luVXNlciA9ICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgaWYgKGxvZ2luVXNlci5pZCkge1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShsb2dpblVzZXIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdXNlclNlcnZpY2UuZ2V0Q3VycmVudFVzZXIoKS50aGVuKChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dpblVzZXIgPSByZXMuZGF0YS5yZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShsb2dpblVzZXIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdXNlclNlcnZpY2U6IHVzZXJTZXJ2aWNlLFxyXG4gICAgICAgICAgICByZWxhdGVkR2l0TGFiOiByZWxhdGVkR2l0TGFiLFxyXG4gICAgICAgICAgICBnZXRMb2dpblVzZXI6IGdldExvZ2luVXNlcixcclxuICAgICAgICB9O1xyXG4gICAgfV0pO1xyXG4gICAgd2luZG93LnVzZXJNb2R1bGUgPSB1c2VyTW9kdWxlO1xyXG59KSh3aW5kb3cpOyJdfQ==
