'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi91c2VyTW9kdWxlL3VzZXJNb2R1bGUuZXMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsQ0FBQyxVQUFDLE1BQUQsRUFBUyxTQUFULEVBQXVCO0FBQ3BCLGlCQURvQjs7QUFFcEIsUUFBSSxhQUFhLFFBQVEsTUFBUixDQUFlLFlBQWYsRUFBNkIsRUFBN0IsQ0FBYixDQUZnQjtBQUdwQixlQUFXLFVBQVgsQ0FBc0Isa0JBQXRCLEVBQTBDLENBQUMsUUFBRCxFQUFXLFdBQVgsRUFBd0IsZ0JBQXhCLEVBQTBDLGFBQTFDLEVBQXlELFdBQXpELEVBQXNFLFVBQVUsTUFBVixFQUFrQixTQUFsQixFQUE2QixjQUE3QixFQUE2QyxXQUE3QyxFQUEwRCxTQUExRCxFQUFxRTtBQUNqTCxlQUFPLEtBQVAsR0FBZTtBQUNYLHNCQUFVLFVBQVUsUUFBVjtBQUNWLHlCQUFhLEVBQWI7QUFDQSx5QkFBYSxFQUFiO1NBSEosQ0FEaUw7QUFNakwsZUFBTyxVQUFQLEdBQW9CLEVBQXBCLENBTmlMO0FBT2pMLGVBQU8sUUFBUCxHQUFrQixZQUFNO0FBQ3BCLHNCQUFVLFdBQVYsQ0FBc0IsWUFBdEIsQ0FBbUMsT0FBTyxLQUFQLENBQW5DLENBQWlELElBQWpELENBQXNELFlBQU07QUFDeEQsNEJBQVksVUFBWixDQUF1QixhQUF2QixFQUFzQyxPQUF0QyxDQUE4QyxZQUFNO0FBQ2hELDZCQUFTLElBQVQsR0FBZ0IsZ0NBQWdDLG1CQUFtQixTQUFTLElBQVQsQ0FBbkQsQ0FEZ0M7aUJBQU4sQ0FBOUMsQ0FEd0Q7YUFBTixFQUtuRCxZQUFNO0FBQ0wsNEJBQVksV0FBWixDQUF3QixXQUF4QixFQURLO2FBQU4sQ0FMSCxDQURvQjtTQUFOLENBUCtKOztBQWtCakwsZUFBTyxNQUFQLEdBQWdCLFlBQU07QUFDbEIsMkJBQWUsT0FBZixDQUF1QixRQUF2QixFQURrQjtTQUFOLENBbEJpSztLQUFyRSxDQUFoSCxFQXFCSSxVQXJCSixDQXFCZSxtQkFyQmYsRUFx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QUFKLEVBQTJCO0FBQ3ZCLDZCQUFLLE1BQUwsQ0FBWSxDQUFaLEVBRHVCO3FCQUEzQjs7Ozt1Q0FJRyxPQUFPO0FBQ1YseUJBQUssU0FBTCxHQUFpQixLQUFLLGFBQUwsQ0FBbUIsS0FBbkIsQ0FBakIsQ0FEVTs7OzttQkFYWjtZQTlNNkk7O0FBOE5uSixZQUFNLGNBQWMsV0FBVyxnQkFBWCxDQUE0QjtBQUM1QywyQkFBZSxhQUFmO0FBQ0EsMEJBQWMsWUFBZDtTQUZnQixDQUFkLENBOU42STs7QUFtT25KLGVBQU87QUFDSCwrQkFBbUIsaUJBQW5CO0FBQ0EseUJBQWEsV0FBYjtBQUNBLDJCQUFlLGFBQWY7QUFDQSwwQkFBYyxZQUFkO0FBQ0EseUJBQWEsV0FBYjtTQUxKLENBbk9tSjtLQUEzRCxDQUE1RixFQWpEb0I7QUE0UnBCLFdBQU8sVUFBUCxHQUFvQixVQUFwQixDQTVSb0I7Q0FBdkIsQ0FBRCxDQTZSRyxNQTdSSCIsImZpbGUiOiJjb21tb24vdXNlck1vZHVsZS91c2VyTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKCh3aW5kb3csIHVuZGVmaW5lZCkgPT4ge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgbGV0IHVzZXJNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgndXNlck1vZHVsZScsIFtdKTtcclxuICAgIHVzZXJNb2R1bGUuY29udHJvbGxlcignTW9kaWZ5UHdNb2RhbEN0cicsIFsnJHNjb3BlJywgJ2xvZ2luVXNlcicsICckbW9kYWxJbnN0YW5jZScsICckZG9tZVB1YmxpYycsICckZG9tZVVzZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBsb2dpblVzZXIsICRtb2RhbEluc3RhbmNlLCAkZG9tZVB1YmxpYywgJGRvbWVVc2VyKSB7XHJcbiAgICAgICAgJHNjb3BlLnB3T2JqID0ge1xyXG4gICAgICAgICAgICB1c2VybmFtZTogbG9naW5Vc2VyLnVzZXJuYW1lLFxyXG4gICAgICAgICAgICBvbGRwYXNzd29yZDogJycsXHJcbiAgICAgICAgICAgIG5ld3Bhc3N3b3JkOiAnJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHNjb3BlLm5ld1B3QWdhaW4gPSAnJztcclxuICAgICAgICAkc2NvcGUubW9kaWZ0UHcgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICRkb21lVXNlci51c2VyU2VydmljZS51c2VyTW9kaWZ5UHcoJHNjb3BlLnB3T2JqKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+S/ruaUueaIkOWKn++8jOivt+mHjeaWsOeZu+W9le+8gScpLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnL2xvZ2luL2xvZ2luLmh0bWw/cmVkaXJlY3Q9JyArIGVuY29kZVVSSUNvbXBvbmVudChsb2NhdGlvbi5ocmVmKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+S/ruaUueWksei0pe+8jOivt+mHjeivle+8gScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY2FuY2VsID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCdjYW5jZWwnKTtcclxuICAgICAgICB9O1xyXG4gICAgfV0pLmNvbnRyb2xsZXIoJ01vZGlmeVVzZXJJbmZvQ3RyJywgWyckc2NvcGUnLCAndXNlcicsICckcHVibGljQXBpJywgJyRtb2RhbEluc3RhbmNlJywgJyRkb21lUHVibGljJywgZnVuY3Rpb24gKCRzY29wZSwgdXNlciwgJHB1YmxpY0FwaSwgJG1vZGFsSW5zdGFuY2UsICRkb21lUHVibGljKSB7XHJcbiAgICAgICAgJHNjb3BlLnVzZXIgPSB1c2VyO1xyXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICRzY29wZS5zdWJtaXQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB1c2VySW5mbyA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiB1c2VyLmlkLFxyXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IHVzZXIudXNlcm5hbWUsXHJcbiAgICAgICAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcclxuICAgICAgICAgICAgICAgIHBob25lOiB1c2VyLnBob25lXHJcblxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkcHVibGljQXBpLm1vZGlmeVVzZXJJbmZvKHVzZXJJbmZvKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+S/ruaUueaIkOWKn++8gScpO1xyXG4gICAgICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UodXNlckluZm8pO1xyXG4gICAgICAgICAgICB9LCAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfkv67mlLnlpLHotKXvvIEnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1dKTtcclxuICAgIC8vIOeUqOaIt+euoeeQhnNlcnZpY2VcclxuICAgIHVzZXJNb2R1bGUuZmFjdG9yeSgnJGRvbWVVc2VyJywgWyckaHR0cCcsICckcScsICckZG9tZVB1YmxpYycsICckZG9tZUdsb2JhbCcsICckZG9tZU1vZGVsJywgZnVuY3Rpb24gKCRodHRwLCAkcSwgJGRvbWVQdWJsaWMsICRkb21lR2xvYmFsLCAkZG9tZU1vZGVsKSB7XHJcbiAgICAgICAgbGV0IGxvZ2luVXNlciA9IHt9O1xyXG4gICAgICAgIGNvbnN0IHJlbGF0ZWRHaXRMYWIgPSAobG9naW5EYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGxldCBnaXRPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdnaXQnKTtcclxuICAgICAgICAgICAgZ2l0T3B0aW9ucy5nZXREYXRhKCkudGhlbigoaW5mbykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpbmZvWzBdLnVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfmnKrphY3nva7ku6PnoIHku5PlupPlnLDlnYDvvIEnKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHVybCA9IGluZm9bMF0udXJsO1xyXG4gICAgICAgICAgICAgICAgICAgICRodHRwLnBvc3QodXJsICsgJy9hcGkvdjMvc2Vzc2lvbicsIGFuZ3VsYXIudG9Kc29uKGxvZ2luRGF0YSkpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW5mbyA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaW5mby51c2VybmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuOiBpbmZvLnByaXZhdGVfdG9rZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtcztcclxuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHBhcmFtcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL3Byb2plY3QvZ2l0L2dpdGxhYmluZm8nLCBhbmd1bGFyLnRvSnNvbihwYXJhbXMpKS50aGVuKChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzLmRhdGEucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBhbGFybUdyb3VwU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY29uc3QgQWxhcm1Hcm91cCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICRkb21lTW9kZWwuU2VydmljZU1vZGVsLmNhbGwodGhpcywgJy9hcGkvYWxhcm0vZ3JvdXAnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBBbGFybUdyb3VwKCk7XHJcbiAgICAgICAgfSgpO1xyXG4gICAgICAgIGNvbnN0IHVzZXJTZXJ2aWNlID0ge1xyXG4gICAgICAgICAgICBnZXRDdXJyZW50VXNlcjogKCkgPT4gJGh0dHAuZ2V0KCcvYXBpL3VzZXIvZ2V0JyksXHJcbiAgICAgICAgICAgIGdldFVzZXJMaXN0OiAoKSA9PiAkaHR0cC5nZXQoJy9hcGkvdXNlci9saXN0JyksXHJcbiAgICAgICAgICAgIG1vZGlmeVVzZXJJbmZvOiB1c2VyID0+ICRodHRwLnBvc3QoJy9hcGkvdXNlci9tb2RpZnknLCBhbmd1bGFyLnRvSnNvbih1c2VyKSksXHJcbiAgICAgICAgICAgIC8vIOeuoeeQhuWRmOS/ruaUue+8mkBwYXJhbSB1c2VySW5mbzp7dXNlcm5hbWU6J3VzZXJuYW1lJywgcGFzc3dvcmQ6J3Bhc3N3b3JkJ31cclxuICAgICAgICAgICAgbW9kaWZ5UHc6IHVzZXJJbmZvID0+ICRodHRwLnBvc3QoJy9hcGkvdXNlci9hZG1pbkNoYW5nZVBhc3N3b3JkJywgYW5ndWxhci50b0pzb24odXNlckluZm8pKSxcclxuICAgICAgICAgICAgLy8g55So5oi35L+u5pS577yaIEBwYXJhbSB1c2VySW5mbzoge3VzZXJuYW1lOid1c2VybmFtZScsIG9sZHBhc3N3b3JkOidvbGRwYXNzd29yZCcsIG5ld3Bhc3N3b3JkOiduZXdwYXNzd29yZCd9XHJcbiAgICAgICAgICAgIHVzZXJNb2RpZnlQdzogdXNlckluZm8gPT4gJGh0dHAucG9zdCgnL2FwaS91c2VyL2NoYW5nZVBhc3N3b3JkJywgYW5ndWxhci50b0pzb24odXNlckluZm8pKSxcclxuICAgICAgICAgICAgZGVsZXRlVXNlcjogdXNlcklkID0+ICRodHRwLmRlbGV0ZShgL2FwaS91c2VyL2RlbGV0ZS8ke3VzZXJJZH1gKSxcclxuICAgICAgICAgICAgY3JlYXRlVXNlcjogdXNlckluZm8gPT4gJGh0dHAucG9zdCgnL2FwaS91c2VyL2NyZWF0ZScsIGFuZ3VsYXIudG9Kc29uKHVzZXJJbmZvKSksXHJcbiAgICAgICAgICAgIC8vIOiOt+WPluWNleS4qui1hOa6kOeUqOaIt+S/oeaBr1xyXG4gICAgICAgICAgICBnZXRTaWdSZXNvdXJjZVVzZXI6IChyZXNvdXJjZVR5cGUsIGlkKSA9PiAkaHR0cC5nZXQoYC9hcGkvcmVzb3VyY2UvJHtyZXNvdXJjZVR5cGV9LyR7aWR9YCksXHJcbiAgICAgICAgICAgIC8vIOiOt+WPluafkOexu+i1hOa6kOeUqOaIt+S/oeaBr1xyXG4gICAgICAgICAgICBnZXRSZXNvdXJjZVVzZXI6IHJlc291cmNlVHlwZSA9PiAkaHR0cC5nZXQoYC9hcGkvcmVzb3VyY2UvJHtyZXNvdXJjZVR5cGV9L3VzZXJvbmx5YCksXHJcbiAgICAgICAgICAgIG1vZGlmeVJlc291cmNlVXNlcjogcmVzb3VyY2VJbmZvID0+ICRodHRwLnB1dCgnL2FwaS9yZXNvdXJjZScsIGFuZ3VsYXIudG9Kc29uKHJlc291cmNlSW5mbykpLFxyXG4gICAgICAgICAgICBkZWxldGVSZXNvdXJjZVVzZXI6IChyZXNvdXJjZVR5cGUsIHJlc291cmNlSWQsIG93bmVyVHlwZSwgb3duZXJJZCkgPT4gJGh0dHAuZGVsZXRlKGAvYXBpL3Jlc291cmNlLyR7cmVzb3VyY2VUeXBlfS8ke3Jlc291cmNlSWR9LyR7b3duZXJUeXBlfS8ke293bmVySWR9YCksXHJcbiAgICAgICAgICAgIC8vIOiOt+WPlui1hOa6kOe7hOS/oeaBr1xyXG4gICAgICAgICAgICBnZXRHcm91cExpc3Q6ICgpID0+ICRodHRwLmdldCgnIC9hcGkvbmFtZXNwYWNlL2xpc3QnKSxcclxuICAgICAgICAgICAgLy8g6I635Y+W57uE5YiX6KGoXHJcbiAgICAgICAgICAgIGdldEdyb3VwOiAoKSA9PiAkaHR0cC5nZXQoJy9hcGkvZ3JvdXAvbGlzdCcpLFxyXG4gICAgICAgICAgICBnZXRHcm91cEluZm86IGdyb3VwSWQgPT4gJGh0dHAuZ2V0KGAvYXBpL2dyb3VwL2dldC8ke2dyb3VwSWR9YCksXHJcbiAgICAgICAgICAgIGRlbGV0ZUdyb3VwOiBncm91cElkID0+ICRodHRwLmRlbGV0ZShgL2FwaS9ncm91cC9kZWxldGUvJHtncm91cElkfWApLFxyXG4gICAgICAgICAgICBjcmVhdGVHcm91cDogZ3JvdXBEYXRhID0+ICRodHRwLnBvc3QoJy9hcGkvZ3JvdXAvY3JlYXRlJywgYW5ndWxhci50b0pzb24oZ3JvdXBEYXRhKSksXHJcbiAgICAgICAgICAgIG1vZGlmeUdyb3VwVXNlcnM6IChncm91cElkLCB1c2VycykgPT4gJGh0dHAucG9zdChgL2FwaS9ncm91cF9tZW1iZXJzLyR7Z3JvdXBJZH1gLCBhbmd1bGFyLnRvSnNvbih1c2VycykpLFxyXG4gICAgICAgICAgICBkZWxldGVHcm91cFVzZXI6IChncm91cElkLCB1c2VySWQpID0+ICRodHRwLmRlbGV0ZShgL2FwaS9ncm91cF9tZW1iZXJzLyR7Z3JvdXBJZH0vJHt1c2VySWR9YCksXHJcbiAgICAgICAgICAgIGdldEdyb3VwVXNlcjogZ3JvdXBJZCA9PiAkaHR0cC5nZXQoYC9hcGkvZ3JvdXBfbWVtYmVycy8ke2dyb3VwSWR9YCksXHJcbiAgICAgICAgICAgIGxvZ291dDogKCkgPT4gJGh0dHAuZ2V0KCcvYXBpL3VzZXIvbG9nb3V0JylcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGdldExvZ2luVXNlciA9ICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgaWYgKGxvZ2luVXNlci5pZCkge1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShsb2dpblVzZXIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdXNlclNlcnZpY2UuZ2V0Q3VycmVudFVzZXIoKS50aGVuKChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dpblVzZXIgPSByZXMuZGF0YS5yZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShsb2dpblVzZXIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8g6LWE5rqQ5oiQ5ZGYXHJcbiAgICAgICAgY2xhc3MgUmVzb3VyY2VVc2VyIHtcclxuICAgICAgICAgICAgY29uc3RydWN0b3IocmVzb3VyY2VJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQocmVzb3VyY2VJbmZvKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbml0KHJlc291cmNlSW5mbykge1xyXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VJbmZvLnVzZXJJbmZvcyA9IHJlc291cmNlSW5mby51c2VySW5mb3MgfHwgW107XHJcbiAgICAgICAgICAgICAgICByZXNvdXJjZUluZm8uZ3JvdXBJbmZvID0gcmVzb3VyY2VJbmZvLmdyb3VwSW5mbyB8fCBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHVzZXIgb2YgcmVzb3VyY2VJbmZvLnVzZXJJbmZvcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXIuaXNEaXJ0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXIubmV3Um9sZSA9IHVzZXIucm9sZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMucmVzb3VyY2VJbmZvID0gcmVzb3VyY2VJbmZvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRvZ2dsZVJvbGUodXNlciwgbmV3Um9sZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHVzZXIubmV3Um9sZSAhPT0gbmV3Um9sZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXIubmV3Um9sZSA9IG5ld1JvbGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB1c2VyLmlzRGlydHkgPSB1c2VyLm5ld1JvbGUgIT09IHVzZXIucm9sZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzYXZlUm9sZSh1c2VyKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSwgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlID09ICdhbGFybScpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkOiB1c2VyLnVzZXJJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogdXNlci5uZXdSb2xlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlci51c2VybmFtZVxyXG4gICAgICAgICAgICAgICAgICAgIH1dO1xyXG4gICAgICAgICAgICAgICAgICAgIGFsYXJtR3JvdXBTZXJ2aWNlLnNldERhdGEoZGF0YSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXIuaXNEaXJ0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLnJvbGUgPSB1c2VyLm5ld1JvbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+S/ruaUueWksei0pe+8gScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZVR5cGUgPT0gJ2dyb3VwJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcnM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQ6IHVzZXIudXNlcklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogdXNlci5uZXdSb2xlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB1c2VyU2VydmljZS5tb2RpZnlHcm91cFVzZXJzKHRoaXMucmVzb3VyY2VJbmZvLnJlc291cmNlSWQsIGRhdGEpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLmlzRGlydHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5yb2xlID0gdXNlci5uZXdSb2xlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfkv67mlLnlpLHotKXvvIEnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VJZDogdGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VUeXBlOiB0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZVR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG93bmVySW5mb3M6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lcklkOiB1c2VyLnVzZXJJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyVHlwZTogdXNlci5vd25lclR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlOiB1c2VyLm5ld1JvbGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJTZXJ2aWNlLm1vZGlmeVJlc291cmNlVXNlcihkYXRhKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5pc0RpcnR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXIucm9sZSA9IHVzZXIubmV3Um9sZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5L+u5pS55aSx6LSl77yBJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZVVzZXIodXNlciwgaXNTZWxmKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3BsaWNlVXNlciA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVzb3VyY2VJbmZvLnVzZXJJbmZvcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXNvdXJjZUluZm8udXNlckluZm9zW2ldLnVzZXJJZCA9PT0gdXNlci51c2VySWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb3VyY2VJbmZvLnVzZXJJbmZvcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlID09ICdncm91cCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB1c2VyU2VydmljZS5kZWxldGVHcm91cFVzZXIodGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VJZCwgdXNlci51c2VySWQpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGxpY2VVc2VyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfliKDpmaTlpLHotKXvvIEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiAnTWVzc2FnZTonICsgcmVzLmRhdGEucmVzdWx0TXNnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvbXB0VHh0O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1NlbGYgJiYgdGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlID09ICdhbGFybScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbXB0VHh0ID0gJ+aCqOehruWumuimgeemu+W8gOaKpeitpue7hOWQl++8nyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5EZWxldGUocHJvbXB0VHh0KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRlbGV0ZUZ1bmMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlID09ICdhbGFybScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWxhcm1Hcm91cFNlcnZpY2UuZGVsZXRlRGF0YSh1c2VyLnVzZXJJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1c2VyU2VydmljZS5kZWxldGVSZXNvdXJjZVVzZXIodGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlLCB0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZUlkLCB1c2VyLm93bmVyVHlwZSwgdXNlci51c2VySWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGVGdW5jKCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwbGljZVVzZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+WIoOmZpOWksei0pe+8gScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiAnTWVzc2FnZTonICsgcmVzLmRhdGEucmVzdWx0TXNnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjbGFzcyBVc2VyR3JvdXBMaXN0IHtcclxuICAgICAgICAgICAgY29uc3RydWN0b3IodXNlckdyb3VwSW5mbykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyR3JvdXAgPSB7fTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdCh1c2VyR3JvdXBJbmZvKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbml0KHVzZXJHcm91cEluZm8pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXNlckdyb3VwTGlzdCA9IHVzZXJHcm91cEluZm8gfHwgW107XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy51c2VyR3JvdXBMaXN0WzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGUoMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG9nZ2xlKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJHcm91cCA9IHRoaXMudXNlckdyb3VwTGlzdFtpbmRleF07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGdldEluc3RhbmNlID0gJGRvbWVNb2RlbC5pbnN0YW5jZXNDcmVhdG9yKHtcclxuICAgICAgICAgICAgVXNlckdyb3VwTGlzdDogVXNlckdyb3VwTGlzdCxcclxuICAgICAgICAgICAgUmVzb3VyY2VVc2VyOiBSZXNvdXJjZVVzZXJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYWxhcm1Hcm91cFNlcnZpY2U6IGFsYXJtR3JvdXBTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogdXNlclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHJlbGF0ZWRHaXRMYWI6IHJlbGF0ZWRHaXRMYWIsXHJcbiAgICAgICAgICAgIGdldExvZ2luVXNlcjogZ2V0TG9naW5Vc2VyLFxyXG4gICAgICAgICAgICBnZXRJbnN0YW5jZTogZ2V0SW5zdGFuY2VcclxuICAgICAgICB9O1xyXG4gICAgfV0pO1xyXG4gICAgd2luZG93LnVzZXJNb2R1bGUgPSB1c2VyTW9kdWxlO1xyXG59KSh3aW5kb3cpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
