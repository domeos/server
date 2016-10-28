'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
})(window);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi91c2VyTW9kdWxlL3VzZXJNb2R1bGUuZXMiXSwibmFtZXMiOlsid2luZG93IiwidW5kZWZpbmVkIiwidXNlck1vZHVsZSIsImFuZ3VsYXIiLCJtb2R1bGUiLCJjb250cm9sbGVyIiwiJHNjb3BlIiwibG9naW5Vc2VyIiwiJG1vZGFsSW5zdGFuY2UiLCIkZG9tZVB1YmxpYyIsIiRkb21lVXNlciIsInB3T2JqIiwidXNlcm5hbWUiLCJvbGRwYXNzd29yZCIsIm5ld3Bhc3N3b3JkIiwibmV3UHdBZ2FpbiIsIm1vZGlmdFB3IiwidXNlclNlcnZpY2UiLCJ1c2VyTW9kaWZ5UHciLCJ0aGVuIiwib3BlblByb21wdCIsImZpbmFsbHkiLCJsb2NhdGlvbiIsImhyZWYiLCJlbmNvZGVVUklDb21wb25lbnQiLCJvcGVuV2FybmluZyIsImNhbmNlbCIsImRpc21pc3MiLCJ1c2VyIiwiJHB1YmxpY0FwaSIsInN1Ym1pdCIsInVzZXJJbmZvIiwiaWQiLCJlbWFpbCIsInBob25lIiwibW9kaWZ5VXNlckluZm8iLCJjbG9zZSIsInJlcyIsInRpdGxlIiwibXNnIiwiZGF0YSIsInJlc3VsdE1zZyIsImZhY3RvcnkiLCIkaHR0cCIsIiRxIiwiJGRvbWVHbG9iYWwiLCIkZG9tZU1vZGVsIiwicmVsYXRlZEdpdExhYiIsImxvZ2luRGF0YSIsImRlZmVycmVkIiwiZGVmZXIiLCJnaXRPcHRpb25zIiwiZ2V0R2xvYWJhbEluc3RhbmNlIiwiZ2V0RGF0YSIsImluZm8iLCJ1cmwiLCJyZWplY3QiLCJwb3N0IiwidG9Kc29uIiwicGFyYW1zIiwibmFtZSIsInRva2VuIiwicHJpdmF0ZV90b2tlbiIsInJlc29sdmUiLCJyZXN1bHQiLCJwcm9taXNlIiwiYWxhcm1Hcm91cFNlcnZpY2UiLCJBbGFybUdyb3VwIiwiU2VydmljZU1vZGVsIiwiY2FsbCIsImdldEN1cnJlbnRVc2VyIiwiZ2V0IiwiZ2V0VXNlckxpc3QiLCJtb2RpZnlQdyIsImRlbGV0ZVVzZXIiLCJkZWxldGUiLCJ1c2VySWQiLCJjcmVhdGVVc2VyIiwiZ2V0U2lnUmVzb3VyY2VVc2VyIiwicmVzb3VyY2VUeXBlIiwiZ2V0UmVzb3VyY2VVc2VyIiwibW9kaWZ5UmVzb3VyY2VVc2VyIiwicHV0IiwicmVzb3VyY2VJbmZvIiwiZGVsZXRlUmVzb3VyY2VVc2VyIiwicmVzb3VyY2VJZCIsIm93bmVyVHlwZSIsIm93bmVySWQiLCJnZXRHcm91cExpc3QiLCJnZXRHcm91cCIsImdldEdyb3VwSW5mbyIsImdyb3VwSWQiLCJkZWxldGVHcm91cCIsImNyZWF0ZUdyb3VwIiwiZ3JvdXBEYXRhIiwibW9kaWZ5R3JvdXBVc2VycyIsInVzZXJzIiwiZGVsZXRlR3JvdXBVc2VyIiwiZ2V0R3JvdXBVc2VyIiwibG9nb3V0IiwiZ2V0TG9naW5Vc2VyIiwiUmVzb3VyY2VVc2VyIiwiaW5pdCIsInVzZXJJbmZvcyIsImdyb3VwSW5mbyIsImlzRGlydHkiLCJuZXdSb2xlIiwicm9sZSIsImRlZmVyZWQiLCJzZXREYXRhIiwibWVtYmVycyIsIm93bmVySW5mb3MiLCJpc1NlbGYiLCJzcGxpY2VVc2VyIiwiaSIsImxlbmd0aCIsInNwbGljZSIsInByb21wdFR4dCIsIm9wZW5EZWxldGUiLCJkZWxldGVGdW5jIiwiZGVsZXRlRGF0YSIsIlVzZXJHcm91cExpc3QiLCJ1c2VyR3JvdXBJbmZvIiwidXNlckdyb3VwIiwidXNlckdyb3VwTGlzdCIsInRvZ2dsZSIsImluZGV4IiwiZ2V0SW5zdGFuY2UiLCJpbnN0YW5jZXNDcmVhdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7QUFLQSxDQUFDLFVBQUNBLE1BQUQsRUFBU0MsU0FBVCxFQUF1QjtBQUNwQjs7QUFDQSxRQUFJQyxhQUFhQyxRQUFRQyxNQUFSLENBQWUsWUFBZixFQUE2QixFQUE3QixDQUFqQjtBQUNBRixlQUFXRyxVQUFYLENBQXNCLGtCQUF0QixFQUEwQyxDQUFDLFFBQUQsRUFBVyxXQUFYLEVBQXdCLGdCQUF4QixFQUEwQyxhQUExQyxFQUF5RCxXQUF6RCxFQUFzRSxVQUFV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SG5DLCtCQUFtQkEsaUJBRGhCO0FBRUhqRCx5QkFBYUEsV0FGVjtBQUdIOEIsMkJBQWVBLGFBSFo7QUFJSHFELDBCQUFjQSxZQUpYO0FBS0gyQix5QkFBYUE7QUFMVixTQUFQO0FBT0gsS0ExTytCLENBQWhDO0FBMk9BL0gsV0FBT0UsVUFBUCxHQUFvQkEsVUFBcEI7QUFDSCxDQTdSRCxFQTZSR0YsTUE3UkgiLCJmaWxlIjoiY29tbW9uL3VzZXJNb2R1bGUvdXNlck1vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXHJcbiAqIEBhdXRob3IgQ2hhbmRyYUxlZVxyXG4gKiBAZGVzY3JpcHRpb24g55So5oi35qih5Z2XXHJcbiAqL1xyXG5cclxuKCh3aW5kb3csIHVuZGVmaW5lZCkgPT4ge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgbGV0IHVzZXJNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgndXNlck1vZHVsZScsIFtdKTtcclxuICAgIHVzZXJNb2R1bGUuY29udHJvbGxlcignTW9kaWZ5UHdNb2RhbEN0cicsIFsnJHNjb3BlJywgJ2xvZ2luVXNlcicsICckbW9kYWxJbnN0YW5jZScsICckZG9tZVB1YmxpYycsICckZG9tZVVzZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBsb2dpblVzZXIsICRtb2RhbEluc3RhbmNlLCAkZG9tZVB1YmxpYywgJGRvbWVVc2VyKSB7XHJcbiAgICAgICAgJHNjb3BlLnB3T2JqID0ge1xyXG4gICAgICAgICAgICB1c2VybmFtZTogbG9naW5Vc2VyLnVzZXJuYW1lLFxyXG4gICAgICAgICAgICBvbGRwYXNzd29yZDogJycsXHJcbiAgICAgICAgICAgIG5ld3Bhc3N3b3JkOiAnJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHNjb3BlLm5ld1B3QWdhaW4gPSAnJztcclxuICAgICAgICAkc2NvcGUubW9kaWZ0UHcgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICRkb21lVXNlci51c2VyU2VydmljZS51c2VyTW9kaWZ5UHcoJHNjb3BlLnB3T2JqKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+S/ruaUueaIkOWKn++8jOivt+mHjeaWsOeZu+W9le+8gScpLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnL2xvZ2luL2xvZ2luLmh0bWw/cmVkaXJlY3Q9JyArIGVuY29kZVVSSUNvbXBvbmVudChsb2NhdGlvbi5ocmVmKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+S/ruaUueWksei0pe+8jOivt+mHjeivle+8gScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY2FuY2VsID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCdjYW5jZWwnKTtcclxuICAgICAgICB9O1xyXG4gICAgfV0pLmNvbnRyb2xsZXIoJ01vZGlmeVVzZXJJbmZvQ3RyJywgWyckc2NvcGUnLCAndXNlcicsICckcHVibGljQXBpJywgJyRtb2RhbEluc3RhbmNlJywgJyRkb21lUHVibGljJywgZnVuY3Rpb24gKCRzY29wZSwgdXNlciwgJHB1YmxpY0FwaSwgJG1vZGFsSW5zdGFuY2UsICRkb21lUHVibGljKSB7XHJcbiAgICAgICAgJHNjb3BlLnVzZXIgPSB1c2VyO1xyXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICRzY29wZS5zdWJtaXQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB1c2VySW5mbyA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiB1c2VyLmlkLFxyXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IHVzZXIudXNlcm5hbWUsXHJcbiAgICAgICAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcclxuICAgICAgICAgICAgICAgIHBob25lOiB1c2VyLnBob25lXHJcblxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkcHVibGljQXBpLm1vZGlmeVVzZXJJbmZvKHVzZXJJbmZvKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+S/ruaUueaIkOWKn++8gScpO1xyXG4gICAgICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UodXNlckluZm8pO1xyXG4gICAgICAgICAgICB9LCAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfkv67mlLnlpLHotKXvvIEnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1dKTtcclxuICAgIC8vIOeUqOaIt+euoeeQhnNlcnZpY2VcclxuICAgIHVzZXJNb2R1bGUuZmFjdG9yeSgnJGRvbWVVc2VyJywgWyckaHR0cCcsICckcScsICckZG9tZVB1YmxpYycsICckZG9tZUdsb2JhbCcsICckZG9tZU1vZGVsJywgZnVuY3Rpb24gKCRodHRwLCAkcSwgJGRvbWVQdWJsaWMsICRkb21lR2xvYmFsLCAkZG9tZU1vZGVsKSB7XHJcbiAgICAgICAgbGV0IGxvZ2luVXNlciA9IHt9O1xyXG4gICAgICAgIGNvbnN0IHJlbGF0ZWRHaXRMYWIgPSAobG9naW5EYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGxldCBnaXRPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdnaXQnKTtcclxuICAgICAgICAgICAgZ2l0T3B0aW9ucy5nZXREYXRhKCkudGhlbigoaW5mbykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpbmZvWzBdLnVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfmnKrphY3nva7ku6PnoIHku5PlupPlnLDlnYDvvIEnKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHVybCA9IGluZm9bMF0udXJsO1xyXG4gICAgICAgICAgICAgICAgICAgICRodHRwLnBvc3QodXJsICsgJy9hcGkvdjMvc2Vzc2lvbicsIGFuZ3VsYXIudG9Kc29uKGxvZ2luRGF0YSkpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW5mbyA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaW5mby51c2VybmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuOiBpbmZvLnByaXZhdGVfdG9rZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtcztcclxuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHBhcmFtcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL3Byb2plY3QvZ2l0L2dpdGxhYmluZm8nLCBhbmd1bGFyLnRvSnNvbihwYXJhbXMpKS50aGVuKChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzLmRhdGEucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBhbGFybUdyb3VwU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY29uc3QgQWxhcm1Hcm91cCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICRkb21lTW9kZWwuU2VydmljZU1vZGVsLmNhbGwodGhpcywgJy9hcGkvYWxhcm0vZ3JvdXAnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBBbGFybUdyb3VwKCk7XHJcbiAgICAgICAgfSgpO1xyXG4gICAgICAgIGNvbnN0IHVzZXJTZXJ2aWNlID0ge1xyXG4gICAgICAgICAgICBnZXRDdXJyZW50VXNlcjogKCkgPT4gJGh0dHAuZ2V0KCcvYXBpL3VzZXIvZ2V0JyksXHJcbiAgICAgICAgICAgIGdldFVzZXJMaXN0OiAoKSA9PiAkaHR0cC5nZXQoJy9hcGkvdXNlci9saXN0JyksXHJcbiAgICAgICAgICAgIG1vZGlmeVVzZXJJbmZvOiB1c2VyID0+ICRodHRwLnBvc3QoJy9hcGkvdXNlci9tb2RpZnknLCBhbmd1bGFyLnRvSnNvbih1c2VyKSksXHJcbiAgICAgICAgICAgIC8vIOeuoeeQhuWRmOS/ruaUue+8mkBwYXJhbSB1c2VySW5mbzp7dXNlcm5hbWU6J3VzZXJuYW1lJywgcGFzc3dvcmQ6J3Bhc3N3b3JkJ31cclxuICAgICAgICAgICAgbW9kaWZ5UHc6IHVzZXJJbmZvID0+ICRodHRwLnBvc3QoJy9hcGkvdXNlci9hZG1pbkNoYW5nZVBhc3N3b3JkJywgYW5ndWxhci50b0pzb24odXNlckluZm8pKSxcclxuICAgICAgICAgICAgLy8g55So5oi35L+u5pS577yaIEBwYXJhbSB1c2VySW5mbzoge3VzZXJuYW1lOid1c2VybmFtZScsIG9sZHBhc3N3b3JkOidvbGRwYXNzd29yZCcsIG5ld3Bhc3N3b3JkOiduZXdwYXNzd29yZCd9XHJcbiAgICAgICAgICAgIHVzZXJNb2RpZnlQdzogdXNlckluZm8gPT4gJGh0dHAucG9zdCgnL2FwaS91c2VyL2NoYW5nZVBhc3N3b3JkJywgYW5ndWxhci50b0pzb24odXNlckluZm8pKSxcclxuICAgICAgICAgICAgZGVsZXRlVXNlcjogdXNlcklkID0+ICRodHRwLmRlbGV0ZShgL2FwaS91c2VyL2RlbGV0ZS8ke3VzZXJJZH1gKSxcclxuICAgICAgICAgICAgY3JlYXRlVXNlcjogdXNlckluZm8gPT4gJGh0dHAucG9zdCgnL2FwaS91c2VyL2NyZWF0ZScsIGFuZ3VsYXIudG9Kc29uKHVzZXJJbmZvKSksXHJcbiAgICAgICAgICAgIC8vIOiOt+WPluWNleS4qui1hOa6kOeUqOaIt+S/oeaBr1xyXG4gICAgICAgICAgICBnZXRTaWdSZXNvdXJjZVVzZXI6IChyZXNvdXJjZVR5cGUsIGlkKSA9PiAkaHR0cC5nZXQoYC9hcGkvcmVzb3VyY2UvJHtyZXNvdXJjZVR5cGV9LyR7aWR9YCksXHJcbiAgICAgICAgICAgIC8vIOiOt+WPluafkOexu+i1hOa6kOeUqOaIt+S/oeaBr1xyXG4gICAgICAgICAgICBnZXRSZXNvdXJjZVVzZXI6IHJlc291cmNlVHlwZSA9PiAkaHR0cC5nZXQoYC9hcGkvcmVzb3VyY2UvJHtyZXNvdXJjZVR5cGV9L3VzZXJvbmx5YCksXHJcbiAgICAgICAgICAgIG1vZGlmeVJlc291cmNlVXNlcjogcmVzb3VyY2VJbmZvID0+ICRodHRwLnB1dCgnL2FwaS9yZXNvdXJjZScsIGFuZ3VsYXIudG9Kc29uKHJlc291cmNlSW5mbykpLFxyXG4gICAgICAgICAgICBkZWxldGVSZXNvdXJjZVVzZXI6IChyZXNvdXJjZVR5cGUsIHJlc291cmNlSWQsIG93bmVyVHlwZSwgb3duZXJJZCkgPT4gJGh0dHAuZGVsZXRlKGAvYXBpL3Jlc291cmNlLyR7cmVzb3VyY2VUeXBlfS8ke3Jlc291cmNlSWR9LyR7b3duZXJUeXBlfS8ke293bmVySWR9YCksXHJcbiAgICAgICAgICAgIC8vIOiOt+WPlui1hOa6kOe7hOS/oeaBr1xyXG4gICAgICAgICAgICBnZXRHcm91cExpc3Q6ICgpID0+ICRodHRwLmdldCgnIC9hcGkvbmFtZXNwYWNlL2xpc3QnKSxcclxuICAgICAgICAgICAgLy8g6I635Y+W57uE5YiX6KGoXHJcbiAgICAgICAgICAgIGdldEdyb3VwOiAoKSA9PiAkaHR0cC5nZXQoJy9hcGkvZ3JvdXAvbGlzdCcpLFxyXG4gICAgICAgICAgICBnZXRHcm91cEluZm86IGdyb3VwSWQgPT4gJGh0dHAuZ2V0KGAvYXBpL2dyb3VwL2dldC8ke2dyb3VwSWR9YCksXHJcbiAgICAgICAgICAgIGRlbGV0ZUdyb3VwOiBncm91cElkID0+ICRodHRwLmRlbGV0ZShgL2FwaS9ncm91cC9kZWxldGUvJHtncm91cElkfWApLFxyXG4gICAgICAgICAgICBjcmVhdGVHcm91cDogZ3JvdXBEYXRhID0+ICRodHRwLnBvc3QoJy9hcGkvZ3JvdXAvY3JlYXRlJywgYW5ndWxhci50b0pzb24oZ3JvdXBEYXRhKSksXHJcbiAgICAgICAgICAgIG1vZGlmeUdyb3VwVXNlcnM6IChncm91cElkLCB1c2VycykgPT4gJGh0dHAucG9zdChgL2FwaS9ncm91cF9tZW1iZXJzLyR7Z3JvdXBJZH1gLCBhbmd1bGFyLnRvSnNvbih1c2VycykpLFxyXG4gICAgICAgICAgICBkZWxldGVHcm91cFVzZXI6IChncm91cElkLCB1c2VySWQpID0+ICRodHRwLmRlbGV0ZShgL2FwaS9ncm91cF9tZW1iZXJzLyR7Z3JvdXBJZH0vJHt1c2VySWR9YCksXHJcbiAgICAgICAgICAgIGdldEdyb3VwVXNlcjogZ3JvdXBJZCA9PiAkaHR0cC5nZXQoYC9hcGkvZ3JvdXBfbWVtYmVycy8ke2dyb3VwSWR9YCksXHJcbiAgICAgICAgICAgIGxvZ291dDogKCkgPT4gJGh0dHAuZ2V0KCcvYXBpL3VzZXIvbG9nb3V0JylcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGdldExvZ2luVXNlciA9ICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgaWYgKGxvZ2luVXNlci5pZCkge1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShsb2dpblVzZXIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdXNlclNlcnZpY2UuZ2V0Q3VycmVudFVzZXIoKS50aGVuKChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dpblVzZXIgPSByZXMuZGF0YS5yZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShsb2dpblVzZXIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8g6LWE5rqQ5oiQ5ZGYXHJcbiAgICAgICAgY2xhc3MgUmVzb3VyY2VVc2VyIHtcclxuICAgICAgICAgICAgY29uc3RydWN0b3IocmVzb3VyY2VJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQocmVzb3VyY2VJbmZvKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbml0KHJlc291cmNlSW5mbykge1xyXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VJbmZvLnVzZXJJbmZvcyA9IHJlc291cmNlSW5mby51c2VySW5mb3MgfHwgW107XHJcbiAgICAgICAgICAgICAgICByZXNvdXJjZUluZm8uZ3JvdXBJbmZvID0gcmVzb3VyY2VJbmZvLmdyb3VwSW5mbyB8fCBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHVzZXIgb2YgcmVzb3VyY2VJbmZvLnVzZXJJbmZvcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXIuaXNEaXJ0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXIubmV3Um9sZSA9IHVzZXIucm9sZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMucmVzb3VyY2VJbmZvID0gcmVzb3VyY2VJbmZvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRvZ2dsZVJvbGUodXNlciwgbmV3Um9sZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHVzZXIubmV3Um9sZSAhPT0gbmV3Um9sZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXIubmV3Um9sZSA9IG5ld1JvbGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB1c2VyLmlzRGlydHkgPSB1c2VyLm5ld1JvbGUgIT09IHVzZXIucm9sZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzYXZlUm9sZSh1c2VyKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSwgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlID09ICdhbGFybScpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkOiB1c2VyLnVzZXJJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogdXNlci5uZXdSb2xlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlci51c2VybmFtZVxyXG4gICAgICAgICAgICAgICAgICAgIH1dO1xyXG4gICAgICAgICAgICAgICAgICAgIGFsYXJtR3JvdXBTZXJ2aWNlLnNldERhdGEoZGF0YSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXIuaXNEaXJ0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLnJvbGUgPSB1c2VyLm5ld1JvbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+S/ruaUueWksei0pe+8gScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZVR5cGUgPT0gJ2dyb3VwJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcnM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQ6IHVzZXIudXNlcklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogdXNlci5uZXdSb2xlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB1c2VyU2VydmljZS5tb2RpZnlHcm91cFVzZXJzKHRoaXMucmVzb3VyY2VJbmZvLnJlc291cmNlSWQsIGRhdGEpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLmlzRGlydHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5yb2xlID0gdXNlci5uZXdSb2xlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfkv67mlLnlpLHotKXvvIEnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VJZDogdGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VUeXBlOiB0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZVR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG93bmVySW5mb3M6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lcklkOiB1c2VyLnVzZXJJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyVHlwZTogdXNlci5vd25lclR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlOiB1c2VyLm5ld1JvbGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJTZXJ2aWNlLm1vZGlmeVJlc291cmNlVXNlcihkYXRhKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5pc0RpcnR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXIucm9sZSA9IHVzZXIubmV3Um9sZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5L+u5pS55aSx6LSl77yBJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZVVzZXIodXNlciwgaXNTZWxmKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3BsaWNlVXNlciA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVzb3VyY2VJbmZvLnVzZXJJbmZvcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXNvdXJjZUluZm8udXNlckluZm9zW2ldLnVzZXJJZCA9PT0gdXNlci51c2VySWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb3VyY2VJbmZvLnVzZXJJbmZvcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlID09ICdncm91cCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB1c2VyU2VydmljZS5kZWxldGVHcm91cFVzZXIodGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VJZCwgdXNlci51c2VySWQpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGxpY2VVc2VyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfliKDpmaTlpLHotKXvvIEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiAnTWVzc2FnZTonICsgcmVzLmRhdGEucmVzdWx0TXNnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvbXB0VHh0O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1NlbGYgJiYgdGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlID09ICdhbGFybScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbXB0VHh0ID0gJ+aCqOehruWumuimgeemu+W8gOaKpeitpue7hOWQl++8nyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5EZWxldGUocHJvbXB0VHh0KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRlbGV0ZUZ1bmMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlID09ICdhbGFybScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWxhcm1Hcm91cFNlcnZpY2UuZGVsZXRlRGF0YSh1c2VyLnVzZXJJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1c2VyU2VydmljZS5kZWxldGVSZXNvdXJjZVVzZXIodGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlLCB0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZUlkLCB1c2VyLm93bmVyVHlwZSwgdXNlci51c2VySWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGVGdW5jKCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwbGljZVVzZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+WIoOmZpOWksei0pe+8gScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiAnTWVzc2FnZTonICsgcmVzLmRhdGEucmVzdWx0TXNnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjbGFzcyBVc2VyR3JvdXBMaXN0IHtcclxuICAgICAgICAgICAgY29uc3RydWN0b3IodXNlckdyb3VwSW5mbykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyR3JvdXAgPSB7fTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdCh1c2VyR3JvdXBJbmZvKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbml0KHVzZXJHcm91cEluZm8pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXNlckdyb3VwTGlzdCA9IHVzZXJHcm91cEluZm8gfHwgW107XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy51c2VyR3JvdXBMaXN0WzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGUoMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG9nZ2xlKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJHcm91cCA9IHRoaXMudXNlckdyb3VwTGlzdFtpbmRleF07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGdldEluc3RhbmNlID0gJGRvbWVNb2RlbC5pbnN0YW5jZXNDcmVhdG9yKHtcclxuICAgICAgICAgICAgVXNlckdyb3VwTGlzdDogVXNlckdyb3VwTGlzdCxcclxuICAgICAgICAgICAgUmVzb3VyY2VVc2VyOiBSZXNvdXJjZVVzZXJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYWxhcm1Hcm91cFNlcnZpY2U6IGFsYXJtR3JvdXBTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogdXNlclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHJlbGF0ZWRHaXRMYWI6IHJlbGF0ZWRHaXRMYWIsXHJcbiAgICAgICAgICAgIGdldExvZ2luVXNlcjogZ2V0TG9naW5Vc2VyLFxyXG4gICAgICAgICAgICBnZXRJbnN0YW5jZTogZ2V0SW5zdGFuY2VcclxuICAgICAgICB9O1xyXG4gICAgfV0pO1xyXG4gICAgd2luZG93LnVzZXJNb2R1bGUgPSB1c2VyTW9kdWxlO1xyXG59KSh3aW5kb3cpOyJdfQ==
