'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
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
                            token: info.private_token
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
        var alarmGroupService = function () {
            var AlarmGroup = function AlarmGroup() {
                $domeModel.ServiceModel.call(this, '/api/alarm/group');
            };
            return new AlarmGroup();
        }();
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

            // 获取单个资源用户信息
            getSigResourceUser: function getSigResourceUser(resourceType, id) {
                return $http.get('/api/resource/' + resourceType + '/' + id);
            },

            // 获取某类资源用户信息
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

        // 资源成员

        var ResourceUser = function () {
            function ResourceUser(resourceInfo) {
                _classCallCheck(this, ResourceUser);

                this.init(resourceInfo);
            }

            _createClass(ResourceUser, [{
                key: 'init',
                value: function init(resourceInfo) {
                    resourceInfo.userInfos = resourceInfo.userInfos || [];
                    resourceInfo.groupInfo = resourceInfo.groupInfo || [];
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = resourceInfo.userInfos[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var user = _step.value;

                            user.isDirty = false;
                            user.newRole = user.role;
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    this.resourceInfo = resourceInfo;
                }
            }, {
                key: 'toggleRole',
                value: function toggleRole(user, newRole) {
                    if (user.newRole !== newRole) {
                        user.newRole = newRole;
                    }
                    user.isDirty = user.newRole !== user.role;
                }
            }, {
                key: 'saveRole',
                value: function saveRole(user) {
                    var data = void 0,
                        defered = $q.defer();
                    if (this.resourceInfo.resourceType == 'alarm') {
                        data = [{
                            userId: user.userId,
                            role: user.newRole,
                            username: user.username
                        }];
                        alarmGroupService.setData(data).then(function () {
                            user.isDirty = false;
                            user.role = user.newRole;
                            defered.resolve();
                        }, function () {
                            defered.reject();
                            $domePublic.openWarning('修改失败！');
                        });
                    } else if (this.resourceInfo.resourceType == 'group') {
                        data = {
                            members: [{
                                userId: user.userId,
                                role: user.newRole
                            }]
                        };
                        userService.modifyGroupUsers(this.resourceInfo.resourceId, data).then(function () {
                            user.isDirty = false;
                            user.role = user.newRole;
                            defered.resolve();
                        }, function () {
                            defered.reject();
                            $domePublic.openWarning('修改失败！');
                        });
                    } else {
                        data = {
                            resourceId: this.resourceInfo.resourceId,
                            resourceType: this.resourceInfo.resourceType,
                            ownerInfos: [{
                                ownerId: user.userId,
                                ownerType: user.ownerType,
                                role: user.newRole
                            }]
                        };
                        userService.modifyResourceUser(data).then(function () {
                            user.isDirty = false;
                            user.role = user.newRole;
                            defered.resolve();
                        }, function () {
                            defered.reject();
                            $domePublic.openWarning('修改失败！');
                        });
                    }
                    return defered.promise;
                }
            }, {
                key: 'deleteUser',
                value: function deleteUser(user, isSelf) {
                    var _this = this;

                    var defered = $q.defer();

                    var spliceUser = function spliceUser() {
                        for (var i = 0; i < _this.resourceInfo.userInfos.length; i++) {
                            if (_this.resourceInfo.userInfos[i].userId === user.userId) {
                                _this.resourceInfo.userInfos.splice(i, 1);
                                break;
                            }
                        }
                    };
                    if (this.resourceInfo.resourceType == 'group') {
                        userService.deleteGroupUser(this.resourceInfo.resourceId, user.userId).then(function () {
                            spliceUser();
                            defered.resolve();
                        }, function (res) {
                            defered.reject();
                            $domePublic.openWarning({
                                title: '删除失败！',
                                msg: 'Message:' + res.data.resultMsg
                            });
                        });
                    } else {
                        var promptTxt = void 0;
                        if (isSelf && this.resourceInfo.resourceType == 'alarm') {
                            promptTxt = '您确定要离开报警组吗？';
                        }
                        $domePublic.openDelete(promptTxt).then(function () {
                            var deleteFunc = function deleteFunc() {
                                if (_this.resourceInfo.resourceType == 'alarm') {
                                    return alarmGroupService.deleteData(user.userId);
                                } else {
                                    return userService.deleteResourceUser(_this.resourceInfo.resourceType, _this.resourceInfo.resourceId, user.ownerType, user.userId);
                                }
                            };
                            deleteFunc().then(function () {
                                defered.resolve();
                                spliceUser();
                            }, function (res) {
                                defered.reject();
                                $domePublic.openWarning({
                                    title: '删除失败！',
                                    msg: 'Message:' + res.data.resultMsg
                                });
                            });
                        }, function () {
                            defered.reject();
                        });
                    }
                    return defered.promise;
                }
            }]);

            return ResourceUser;
        }();

        var UserGroupList = function () {
            function UserGroupList(userGroupInfo) {
                _classCallCheck(this, UserGroupList);

                this.userGroup = {};
                this.init(userGroupInfo);
            }

            _createClass(UserGroupList, [{
                key: 'init',
                value: function init(userGroupInfo) {
                    this.userGroupList = userGroupInfo || [];
                    if (this.userGroupList[0]) {
                        this.toggle(0);
                    }
                }
            }, {
                key: 'toggle',
                value: function toggle(index) {
                    this.userGroup = this.userGroupList[index];
                }
            }]);

            return UserGroupList;
        }();

        var getInstance = $domeModel.instancesCreator({
            UserGroupList: UserGroupList,
            ResourceUser: ResourceUser
        });

        return {
            alarmGroupService: alarmGroupService,
            userService: userService,
            relatedGitLab: relatedGitLab,
            getLoginUser: getLoginUser,
            getInstance: getInstance
        };
    }]);
    window.userModule = userModule;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi91c2VyTW9kdWxlL3VzZXJNb2R1bGUuZXMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsQ0FBQyxZQUFNO0FBQ0gsaUJBREc7O0FBRUgsUUFBSSxhQUFhLFFBQVEsTUFBUixDQUFlLFlBQWYsRUFBNkIsRUFBN0IsQ0FBYixDQUZEO0FBR0gsZUFBVyxVQUFYLENBQXNCLGtCQUF0QixFQUEwQyxDQUFDLFFBQUQsRUFBVyxXQUFYLEVBQXdCLGdCQUF4QixFQUEwQyxhQUExQyxFQUF5RCxXQUF6RCxFQUFzRSxVQUFVLE1BQVYsRUFBa0IsU0FBbEIsRUFBNkIsY0FBN0IsRUFBNkMsV0FBN0MsRUFBMEQsU0FBMUQsRUFBcUU7QUFDakwsZUFBTyxLQUFQLEdBQWU7QUFDWCxzQkFBVSxVQUFVLFFBQVY7QUFDVix5QkFBYSxFQUFiO0FBQ0EseUJBQWEsRUFBYjtTQUhKLENBRGlMO0FBTWpMLGVBQU8sVUFBUCxHQUFvQixFQUFwQixDQU5pTDtBQU9qTCxlQUFPLFFBQVAsR0FBa0IsWUFBTTtBQUNwQixzQkFBVSxXQUFWLENBQXNCLFlBQXRCLENBQW1DLE9BQU8sS0FBUCxDQUFuQyxDQUFpRCxJQUFqRCxDQUFzRCxZQUFNO0FBQ3hELDRCQUFZLFVBQVosQ0FBdUIsYUFBdkIsRUFBc0MsT0FBdEMsQ0FBOEMsWUFBTTtBQUNoRCw2QkFBUyxJQUFULEdBQWdCLGdDQUFnQyxtQkFBbUIsU0FBUyxJQUFULENBQW5ELENBRGdDO2lCQUFOLENBQTlDLENBRHdEO2FBQU4sRUFLbkQsWUFBTTtBQUNMLDRCQUFZLFdBQVosQ0FBd0IsV0FBeEIsRUFESzthQUFOLENBTEgsQ0FEb0I7U0FBTixDQVArSjs7QUFrQmpMLGVBQU8sTUFBUCxHQUFnQixZQUFNO0FBQ2xCLDJCQUFlLE9BQWYsQ0FBdUIsUUFBdkIsRUFEa0I7U0FBTixDQWxCaUs7S0FBckUsQ0FBaEgsRUFxQkksVUFyQkosQ0FxQmUsbUJBckJmLEVBcUJvQyxDQUFDLFFBQUQsRUFBVyxNQUFYLEVB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bGUvdXNlck1vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIigoKSA9PiB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBsZXQgdXNlck1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCd1c2VyTW9kdWxlJywgW10pO1xyXG4gICAgdXNlck1vZHVsZS5jb250cm9sbGVyKCdNb2RpZnlQd01vZGFsQ3RyJywgWyckc2NvcGUnLCAnbG9naW5Vc2VyJywgJyRtb2RhbEluc3RhbmNlJywgJyRkb21lUHVibGljJywgJyRkb21lVXNlcicsIGZ1bmN0aW9uICgkc2NvcGUsIGxvZ2luVXNlciwgJG1vZGFsSW5zdGFuY2UsICRkb21lUHVibGljLCAkZG9tZVVzZXIpIHtcclxuICAgICAgICAkc2NvcGUucHdPYmogPSB7XHJcbiAgICAgICAgICAgIHVzZXJuYW1lOiBsb2dpblVzZXIudXNlcm5hbWUsXHJcbiAgICAgICAgICAgIG9sZHBhc3N3b3JkOiAnJyxcclxuICAgICAgICAgICAgbmV3cGFzc3dvcmQ6ICcnXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkc2NvcGUubmV3UHdBZ2FpbiA9ICcnO1xyXG4gICAgICAgICRzY29wZS5tb2RpZnRQdyA9ICgpID0+IHtcclxuICAgICAgICAgICAgJGRvbWVVc2VyLnVzZXJTZXJ2aWNlLnVzZXJNb2RpZnlQdygkc2NvcGUucHdPYmopLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5L+u5pS55oiQ5Yqf77yM6K+36YeN5paw55m75b2V77yBJykuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcvbG9naW4vbG9naW4uaHRtbD9yZWRpcmVjdD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGxvY2F0aW9uLmhyZWYpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5L+u5pS55aSx6LSl77yM6K+36YeN6K+V77yBJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoJ2NhbmNlbCcpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XSkuY29udHJvbGxlcignTW9kaWZ5VXNlckluZm9DdHInLCBbJyRzY29wZScsICd1c2VyJywgJyRwdWJsaWNBcGknLCAnJG1vZGFsSW5zdGFuY2UnLCAnJGRvbWVQdWJsaWMnLCBmdW5jdGlvbiAoJHNjb3BlLCB1c2VyLCAkcHVibGljQXBpLCAkbW9kYWxJbnN0YW5jZSwgJGRvbWVQdWJsaWMpIHtcclxuICAgICAgICAkc2NvcGUudXNlciA9IHVzZXI7XHJcbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9ICgpID0+IHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHNjb3BlLnN1Ym1pdCA9ICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHVzZXJJbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IHVzZXIuaWQsXHJcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlci51c2VybmFtZSxcclxuICAgICAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxyXG4gICAgICAgICAgICAgICAgcGhvbmU6IHVzZXIucGhvbmVcclxuXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRwdWJsaWNBcGkubW9kaWZ5VXNlckluZm8odXNlckluZm8pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5L+u5pS55oiQ5Yqf77yBJyk7XHJcbiAgICAgICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSh1c2VySW5mbyk7XHJcbiAgICAgICAgICAgIH0sIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+S/ruaUueWksei0pe+8gScsXHJcbiAgICAgICAgICAgICAgICAgICAgbXNnOiByZXMuZGF0YS5yZXN1bHRNc2dcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfV0pO1xyXG4gICAgLy8g55So5oi3566h55CGc2VydmljZVxyXG4gICAgdXNlck1vZHVsZS5mYWN0b3J5KCckZG9tZVVzZXInLCBbJyRodHRwJywgJyRxJywgJyRkb21lUHVibGljJywgJyRkb21lR2xvYmFsJywgJyRkb21lTW9kZWwnLCBmdW5jdGlvbiAoJGh0dHAsICRxLCAkZG9tZVB1YmxpYywgJGRvbWVHbG9iYWwsICRkb21lTW9kZWwpIHtcclxuICAgICAgICBsZXQgbG9naW5Vc2VyID0ge307XHJcbiAgICAgICAgY29uc3QgcmVsYXRlZEdpdExhYiA9IChsb2dpbkRhdGEpID0+IHtcclxuICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgbGV0IGdpdE9wdGlvbnMgPSAkZG9tZUdsb2JhbC5nZXRHbG9hYmFsSW5zdGFuY2UoJ2dpdCcpO1xyXG4gICAgICAgICAgICBnaXRPcHRpb25zLmdldERhdGEoKS50aGVuKChpbmZvKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWluZm9bMF0udXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+acqumFjee9ruS7o+eggeS7k+W6k+WcsOWdgO+8gScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdXJsID0gaW5mb1swXS51cmw7XHJcbiAgICAgICAgICAgICAgICAgICAgJGh0dHAucG9zdCh1cmwgKyAnL2FwaS92My9zZXNzaW9uJywgYW5ndWxhci50b0pzb24obG9naW5EYXRhKSkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbmZvID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJhbXMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpbmZvLnVzZXJuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW46IGluZm8ucHJpdmF0ZV90b2tlblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW1zO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRodHRwLnBvc3QoJy9hcGkvcHJvamVjdC9naXQvZ2l0bGFiaW5mbycsIGFuZ3VsYXIudG9Kc29uKHBhcmFtcykpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXMuZGF0YS5yZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGFsYXJtR3JvdXBTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBjb25zdCBBbGFybUdyb3VwID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJGRvbWVNb2RlbC5TZXJ2aWNlTW9kZWwuY2FsbCh0aGlzLCAnL2FwaS9hbGFybS9ncm91cCcpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEFsYXJtR3JvdXAoKTtcclxuICAgICAgICB9KCk7XHJcbiAgICAgICAgY29uc3QgdXNlclNlcnZpY2UgPSB7XHJcbiAgICAgICAgICAgIGdldEN1cnJlbnRVc2VyKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS91c2VyL2dldCcpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXRVc2VyTGlzdCgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdXNlci9saXN0Jyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1vZGlmeVVzZXJJbmZvKHVzZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3VzZXIvbW9kaWZ5JywgYW5ndWxhci50b0pzb24odXNlcikpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyDnrqHnkIblkZjkv67mlLnvvJpAcGFyYW0gdXNlckluZm86e3VzZXJuYW1lOid1c2VybmFtZScsIHBhc3N3b3JkOidwYXNzd29yZCd9XHJcbiAgICAgICAgICAgIG1vZGlmeVB3KHVzZXJJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS91c2VyL2FkbWluQ2hhbmdlUGFzc3dvcmQnLCBhbmd1bGFyLnRvSnNvbih1c2VySW5mbykpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyDnlKjmiLfkv67mlLnvvJogQHBhcmFtIHVzZXJJbmZvOiB7dXNlcm5hbWU6J3VzZXJuYW1lJywgb2xkcGFzc3dvcmQ6J29sZHBhc3N3b3JkJywgbmV3cGFzc3dvcmQ6J25ld3Bhc3N3b3JkJ31cclxuICAgICAgICAgICAgdXNlck1vZGlmeVB3KHVzZXJJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS91c2VyL2NoYW5nZVBhc3N3b3JkJywgYW5ndWxhci50b0pzb24odXNlckluZm8pKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVsZXRlVXNlcih1c2VySWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoJy9hcGkvdXNlci9kZWxldGUvJyArIHVzZXJJZCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNyZWF0ZVVzZXIodXNlckluZm8pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3VzZXIvY3JlYXRlJywgYW5ndWxhci50b0pzb24odXNlckluZm8pKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy8g6I635Y+W5Y2V5Liq6LWE5rqQ55So5oi35L+h5oGvXHJcbiAgICAgICAgICAgIGdldFNpZ1Jlc291cmNlVXNlcihyZXNvdXJjZVR5cGUsIGlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3Jlc291cmNlLycgKyByZXNvdXJjZVR5cGUgKyAnLycgKyBpZCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8vIOiOt+WPluafkOexu+i1hOa6kOeUqOaIt+S/oeaBr1xyXG4gICAgICAgICAgICBnZXRSZXNvdXJjZVVzZXIocmVzb3VyY2VUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3Jlc291cmNlLycgKyByZXNvdXJjZVR5cGUgKyAnL3VzZXJvbmx5Jyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1vZGlmeVJlc291cmNlVXNlcihyZXNvdXJjZUluZm8pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvcmVzb3VyY2UnLCBhbmd1bGFyLnRvSnNvbihyZXNvdXJjZUluZm8pKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVsZXRlUmVzb3VyY2VVc2VyKHJlc291cmNlVHlwZSwgcmVzb3VyY2VJZCwgb3duZXJUeXBlLCBvd25lcklkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKCcvYXBpL3Jlc291cmNlLycgKyByZXNvdXJjZVR5cGUgKyAnLycgKyByZXNvdXJjZUlkICsgJy8nICsgb3duZXJUeXBlICsgJy8nICsgb3duZXJJZCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8vIOiOt+WPlui1hOa6kOe7hOS/oeaBr1xyXG4gICAgICAgICAgICBnZXRHcm91cExpc3QoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcgL2FwaS9uYW1lc3BhY2UvbGlzdCcpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyDojrflj5bnu4TliJfooahcclxuICAgICAgICAgICAgZ2V0R3JvdXAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2dyb3VwL2xpc3QnKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0R3JvdXBJbmZvKGdyb3VwSWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZ3JvdXAvZ2V0LycgKyBncm91cElkKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVsZXRlR3JvdXAoZ3JvdXBJZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZSgnL2FwaS9ncm91cC9kZWxldGUvJyArIGdyb3VwSWQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjcmVhdGVHcm91cChncm91cERhdGEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2dyb3VwL2NyZWF0ZScsIGFuZ3VsYXIudG9Kc29uKGdyb3VwRGF0YSkpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtb2RpZnlHcm91cFVzZXJzKGdyb3VwSWQsIHVzZXJzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9ncm91cF9tZW1iZXJzLycgKyBncm91cElkLCBhbmd1bGFyLnRvSnNvbih1c2VycykpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZWxldGVHcm91cFVzZXIoZ3JvdXBJZCwgdXNlcklkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKCcvYXBpL2dyb3VwX21lbWJlcnMvJyArIGdyb3VwSWQgKyAnLycgKyB1c2VySWQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXRHcm91cFVzZXIoZ3JvdXBJZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9ncm91cF9tZW1iZXJzLycgKyBncm91cElkKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbG9nb3V0KCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS91c2VyL2xvZ291dCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBnZXRMb2dpblVzZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGlmIChsb2dpblVzZXIuaWQpIHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUobG9naW5Vc2VyKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHVzZXJTZXJ2aWNlLmdldEN1cnJlbnRVc2VyKCkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9naW5Vc2VyID0gcmVzLmRhdGEucmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUobG9naW5Vc2VyKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIOi1hOa6kOaIkOWRmFxyXG4gICAgICAgIGNsYXNzIFJlc291cmNlVXNlciB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKHJlc291cmNlSW5mbykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KHJlc291cmNlSW5mbyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5pdChyZXNvdXJjZUluZm8pIHtcclxuICAgICAgICAgICAgICAgIHJlc291cmNlSW5mby51c2VySW5mb3MgPSByZXNvdXJjZUluZm8udXNlckluZm9zIHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VJbmZvLmdyb3VwSW5mbyA9IHJlc291cmNlSW5mby5ncm91cEluZm8gfHwgW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB1c2VyIG9mIHJlc291cmNlSW5mby51c2VySW5mb3MpIHtcclxuICAgICAgICAgICAgICAgICAgICB1c2VyLmlzRGlydHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB1c2VyLm5ld1JvbGUgPSB1c2VyLnJvbGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc291cmNlSW5mbyA9IHJlc291cmNlSW5mbztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0b2dnbGVSb2xlKHVzZXIsIG5ld1JvbGUpIHtcclxuICAgICAgICAgICAgICAgIGlmICh1c2VyLm5ld1JvbGUgIT09IG5ld1JvbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB1c2VyLm5ld1JvbGUgPSBuZXdSb2xlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdXNlci5pc0RpcnR5ID0gdXNlci5uZXdSb2xlICE9PSB1c2VyLnJvbGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2F2ZVJvbGUodXNlcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRhdGEsIGRlZmVyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmVzb3VyY2VJbmZvLnJlc291cmNlVHlwZSA9PSAnYWxhcm0nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZDogdXNlci51c2VySWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6IHVzZXIubmV3Um9sZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWU6IHVzZXIudXNlcm5hbWVcclxuICAgICAgICAgICAgICAgICAgICB9XTtcclxuICAgICAgICAgICAgICAgICAgICBhbGFybUdyb3VwU2VydmljZS5zZXREYXRhKGRhdGEpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLmlzRGlydHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5yb2xlID0gdXNlci5uZXdSb2xlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfkv67mlLnlpLHotKXvvIEnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlID09ICdncm91cCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXJzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkOiB1c2VyLnVzZXJJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6IHVzZXIubmV3Um9sZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlclNlcnZpY2UubW9kaWZ5R3JvdXBVc2Vycyh0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZUlkLCBkYXRhKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5pc0RpcnR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXIucm9sZSA9IHVzZXIubmV3Um9sZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5L+u5pS55aSx6LSl77yBJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlSWQ6IHRoaXMucmVzb3VyY2VJbmZvLnJlc291cmNlSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlVHlwZTogdGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvd25lckluZm9zOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3duZXJJZDogdXNlci51c2VySWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lclR5cGU6IHVzZXIub3duZXJUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogdXNlci5uZXdSb2xlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB1c2VyU2VydmljZS5tb2RpZnlSZXNvdXJjZVVzZXIoZGF0YSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXIuaXNEaXJ0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLnJvbGUgPSB1c2VyLm5ld1JvbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+S/ruaUueWksei0pe+8gScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWxldGVVc2VyKHVzZXIsIGlzU2VsZikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRlZmVyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHNwbGljZVVzZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJlc291cmNlSW5mby51c2VySW5mb3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmVzb3VyY2VJbmZvLnVzZXJJbmZvc1tpXS51c2VySWQgPT09IHVzZXIudXNlcklkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc291cmNlSW5mby51c2VySW5mb3Muc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmVzb3VyY2VJbmZvLnJlc291cmNlVHlwZSA9PSAnZ3JvdXAnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlclNlcnZpY2UuZGVsZXRlR3JvdXBVc2VyKHRoaXMucmVzb3VyY2VJbmZvLnJlc291cmNlSWQsIHVzZXIudXNlcklkKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3BsaWNlVXNlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5Yig6Zmk5aSx6LSl77yBJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogJ01lc3NhZ2U6JyArIHJlcy5kYXRhLnJlc3VsdE1zZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb21wdFR4dDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNTZWxmICYmIHRoaXMucmVzb3VyY2VJbmZvLnJlc291cmNlVHlwZSA9PSAnYWxhcm0nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21wdFR4dCA9ICfmgqjnoa7lrpropoHnprvlvIDmiqXorabnu4TlkJfvvJ8nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuRGVsZXRlKHByb21wdFR4dCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkZWxldGVGdW5jID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmVzb3VyY2VJbmZvLnJlc291cmNlVHlwZSA9PSAnYWxhcm0nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsYXJtR3JvdXBTZXJ2aWNlLmRlbGV0ZURhdGEodXNlci51c2VySWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXNlclNlcnZpY2UuZGVsZXRlUmVzb3VyY2VVc2VyKHRoaXMucmVzb3VyY2VJbmZvLnJlc291cmNlVHlwZSwgdGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VJZCwgdXNlci5vd25lclR5cGUsIHVzZXIudXNlcklkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlRnVuYygpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGxpY2VVc2VyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfliKDpmaTlpLHotKXvvIEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogJ01lc3NhZ2U6JyArIHJlcy5kYXRhLnJlc3VsdE1zZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2xhc3MgVXNlckdyb3VwTGlzdCB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKHVzZXJHcm91cEluZm8pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXNlckdyb3VwID0ge307XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQodXNlckdyb3VwSW5mbyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5pdCh1c2VyR3JvdXBJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJHcm91cExpc3QgPSB1c2VyR3JvdXBJbmZvIHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudXNlckdyb3VwTGlzdFswXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlKDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRvZ2dsZShpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyR3JvdXAgPSB0aGlzLnVzZXJHcm91cExpc3RbaW5kZXhdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBnZXRJbnN0YW5jZSA9ICRkb21lTW9kZWwuaW5zdGFuY2VzQ3JlYXRvcih7XHJcbiAgICAgICAgICAgIFVzZXJHcm91cExpc3Q6IFVzZXJHcm91cExpc3QsXHJcbiAgICAgICAgICAgIFJlc291cmNlVXNlcjogUmVzb3VyY2VVc2VyXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGFsYXJtR3JvdXBTZXJ2aWNlOiBhbGFybUdyb3VwU2VydmljZSxcclxuICAgICAgICAgICAgdXNlclNlcnZpY2U6IHVzZXJTZXJ2aWNlLFxyXG4gICAgICAgICAgICByZWxhdGVkR2l0TGFiOiByZWxhdGVkR2l0TGFiLFxyXG4gICAgICAgICAgICBnZXRMb2dpblVzZXI6IGdldExvZ2luVXNlcixcclxuICAgICAgICAgICAgZ2V0SW5zdGFuY2U6IGdldEluc3RhbmNlXHJcbiAgICAgICAgfTtcclxuICAgIH1dKTtcclxuICAgIHdpbmRvdy51c2VyTW9kdWxlID0gdXNlck1vZHVsZTtcclxufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
