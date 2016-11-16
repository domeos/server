'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
                    } else if (this.resourceInfo.resourceType == 'PROJECT_COLLECTION' || this.resourceInfo.resourceType == 'DEPLOY_COLLECTION' || this.resourceInfo.resourceType == 'CLUSTER') {
                        data = {
                            collectionId: parseInt(this.resourceInfo.resourceId),
                            userId: user.userId,
                            role: user.newRole,
                            resourceType: this.resourceInfo.resourceType
                            //userName: user.username
                        };
                        userService.modifyUserRole(data).then(function () {
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
                    } else if (this.resourceInfo.resourceType == 'PROJECT_COLLECTION' || this.resourceInfo.resourceType == 'DEPLOY_COLLECTION' || this.resourceInfo.resourceType == 'CLUSTER') {
                        var _ret = function () {
                            var defered = $q.defer();
                            var promptTxt = '确定要删除吗？';
                            $domePublic.openDelete(promptTxt).then(function () {
                                userService.deleteCollectionUser(_this.resourceInfo.resourceId, user.userId, _this.resourceInfo.resourceType).then(function () {
                                    spliceUser();
                                    defered.resolve();
                                }, function (res) {
                                    defered.reject();
                                    $domePublic.openWarning({
                                        title: '删除失败!',
                                        msg: 'Message:' + res.data.resultMsg
                                    });
                                }, function () {
                                    defered.reject();
                                });
                            });
                            return {
                                v: defered.promise
                            };
                        }();

                        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                    } else {
                        var _promptTxt = void 0;
                        if (isSelf && this.resourceInfo.resourceType == 'alarm') {
                            _promptTxt = '您确定要离开报警组吗？';
                        }
                        $domePublic.openDelete(_promptTxt).then(function () {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi91c2VyTW9kdWxlL3VzZXJNb2R1bGUuZXMiXSwibmFtZXMiOlsid2luZG93IiwidW5kZWZpbmVkIiwidXNlck1vZHVsZSIsImFuZ3VsYXIiLCJtb2R1bGUiLCJjb250cm9sbGVyIiwiJHNjb3BlIiwibG9naW5Vc2VyIiwiJG1vZGFsSW5zdGFuY2UiLCIkZG9tZVB1YmxpYyIsIiRkb21lVXNlciIsInB3T2JqIiwidXNlcm5hbWUiLCJvbGRwYXNzd29yZCIsIm5ld3Bhc3N3b3JkIiwibmV3UHdBZ2FpbiIsIm1vZGlmdFB3IiwidXNlclNlcnZpY2UiLCJ1c2VyTW9kaWZ5UHciLCJ0aGVuIiwib3BlblByb21wdCIsImZpbmFsbHkiLCJsb2NhdGlvbiIsImhyZWYiLCJlbmNvZGVVUklDb21wb25lbnQiLCJvcGVuV2FybmluZyIsImNhbmNlbCIsImRpc21pc3MiLCJ1c2VyIiwiJHB1YmxpY0FwaSIsInN1Ym1pdCIsInVzZXJJbmZvIiwiaWQiLCJlbWFpbCIsInBob25lIiwibW9kaWZ5VXNlckluZm8iLCJjbG9zZSIsInJlcyIsInRpdGxlIiwibXNnIiwiZGF0YSIsInJlc3VsdE1zZyIsImZhY3RvcnkiLCIkaHR0cCIsIiRxIiwiJGRvbWVHbG9iYWwiLCIkZG9tZU1vZGVsIiwicmVsYXRlZEdpdExhYiIsImxvZ2luRGF0YSIsImRlZmVycmVkIiwiZGVmZXIiLCJnaXRPcHRpb25zIiwiZ2V0R2xvYWJhbEluc3RhbmNlIiwiZ2V0RGF0YSIsImluZm8iLCJ1cmwiLCJyZWplY3QiLCJwb3N0IiwidG9Kc29uIiwicGFyYW1zIiwibmFtZSIsInRva2VuIiwicHJpdmF0ZV90b2tlbiIsInJlc29sdmUiLCJyZXN1bHQiLCJwcm9taXNlIiwiYWxhcm1Hcm91cFNlcnZpY2UiLCJBbGFybUdyb3VwIiwiU2VydmljZU1vZGVsIiwiY2FsbCIsImdldEN1cnJlbnRVc2VyIiwiZ2V0IiwiZ2V0VXNlckxpc3QiLCJtb2RpZnlQdyIsImRlbGV0ZVVzZXIiLCJkZWxldGUiLCJ1c2VySWQiLCJjcmVhdGVVc2VyIiwiZ2V0UmVzb3VyY2VVc2VyUm9sZSIsInJlc291cmNlVHlwZSIsImdldFNpZ1Jlc291cmNlVXNlciIsImdldFJlc291cmNlTGlzdCIsImdldFJlc291cmNlVXNlciIsIm1vZGlmeVJlc291cmNlVXNlciIsInB1dCIsInJlc291cmNlSW5mbyIsImRlbGV0ZVJlc291cmNlVXNlciIsInJlc291cmNlSWQiLCJvd25lclR5cGUiLCJvd25lcklkIiwiZ2V0R3JvdXBMaXN0IiwiZ2V0R3JvdXAiLCJnZXRHcm91cEluZm8iLCJncm91cElkIiwiZGVsZXRlR3JvdXAiLCJjcmVhdGVHcm91cCIsImdyb3VwRGF0YSIsIm1vZGlmeUdyb3VwVXNlcnMiLCJ1c2VycyIsImRlbGV0ZUdyb3VwVXNlciIsImdldEdyb3VwVXNlciIsImxvZ291dCIsImRlbGV0ZUNvbGxlY3Rpb25Vc2VyIiwiY29sbGVjdGlvbklkIiwibW9kaWZ5VXNlclJvbGUiLCJjb2xsZWN0aW9uTWVtYmVyIiwiYWRkQ29sbGVjdGlvblVzZXJzIiwiY29sbGVjdGlvbkRhdGEiLCJhZGRPbmVDb2xsZWN0aW9uVXNlciIsImdldENvbGxlY3Rpb25Vc2VyIiwiY3JlYXRlQ29sbGVjdGlvblVzZXIiLCJnZXRDb2xsZWN0aW9uTGlzdCIsImdldExvZ2luVXNlciIsIlJlc291cmNlVXNlciIsImluaXQiLCJ1c2VySW5mb3MiLCJncm91cEluZm8iLCJpc0RpcnR5IiwibmV3Um9sZSIsInJvbGUiLCJkZWZlcmVkIiwic2V0RGF0YSIsIm1lbWJlcnMiLCJwYXJzZUludCIsIm93bmVySW5mb3MiLCJpc1NlbGYiLCJzcGxpY2VVc2VyIiwiaSIsImxlbmd0aCIsInNwbGljZSIsInByb21wdFR4dCIsIm9wZW5EZWxldGUiLCJkZWxldGVGdW5jIiwiZGVsZXRlRGF0YSIsIlVzZXJHcm91cExpc3QiLCJ1c2VyR3JvdXBJbmZvIiwidXNlckdyb3VwIiwidXNlckdyb3VwTGlzdCIsInRvZ2dsZSIsImluZGV4IiwiZ2V0SW5zdGFuY2UiLCJp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dCI6WyIvKlxyXG4gKiBAYXV0aG9yIENoYW5kcmFMZWVcclxuICogQGRlc2NyaXB0aW9uIOeUqOaIt+aooeWdl1xyXG4gKi9cclxuXHJcbigod2luZG93LCB1bmRlZmluZWQpID0+IHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGxldCB1c2VyTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3VzZXJNb2R1bGUnLCBbXSk7XHJcbiAgICB1c2VyTW9kdWxlLmNvbnRyb2xsZXIoJ01vZGlmeVB3TW9kYWxDdHInLCBbJyRzY29wZScsICdsb2dpblVzZXInLCAnJG1vZGFsSW5zdGFuY2UnLCAnJGRvbWVQdWJsaWMnLCAnJGRvbWVVc2VyJywgZnVuY3Rpb24gKCRzY29wZSwgbG9naW5Vc2VyLCAkbW9kYWxJbnN0YW5jZSwgJGRvbWVQdWJsaWMsICRkb21lVXNlcikge1xyXG4gICAgICAgICRzY29wZS5wd09iaiA9IHtcclxuICAgICAgICAgICAgdXNlcm5hbWU6IGxvZ2luVXNlci51c2VybmFtZSxcclxuICAgICAgICAgICAgb2xkcGFzc3dvcmQ6ICcnLFxyXG4gICAgICAgICAgICBuZXdwYXNzd29yZDogJydcclxuICAgICAgICB9O1xyXG4gICAgICAgICRzY29wZS5uZXdQd0FnYWluID0gJyc7XHJcbiAgICAgICAgJHNjb3BlLm1vZGlmdFB3ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAkZG9tZVVzZXIudXNlclNlcnZpY2UudXNlck1vZGlmeVB3KCRzY29wZS5wd09iaikudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCfkv67mlLnmiJDlip/vvIzor7fph43mlrDnmbvlvZXvvIEnKS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy9sb2dpbi9sb2dpbi5odG1sP3JlZGlyZWN0PScgKyBlbmNvZGVVUklDb21wb25lbnQobG9jYXRpb24uaHJlZik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfkv67mlLnlpLHotKXvvIzor7fph43or5XvvIEnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9ICgpID0+IHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XHJcbiAgICAgICAgfTtcclxuICAgIH1dKS5jb250cm9sbGVyKCdNb2RpZnlVc2VySW5mb0N0cicsIFsnJHNjb3BlJywgJ3VzZXInLCAnJHB1YmxpY0FwaScsICckbW9kYWxJbnN0YW5jZScsICckZG9tZVB1YmxpYycsIGZ1bmN0aW9uICgkc2NvcGUsIHVzZXIsICRwdWJsaWNBcGksICRtb2RhbEluc3RhbmNlLCAkZG9tZVB1YmxpYykge1xyXG4gICAgICAgICRzY29wZS51c2VyID0gdXNlcjtcclxuICAgICAgICAkc2NvcGUuY2FuY2VsID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkc2NvcGUuc3VibWl0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgdXNlckluZm8gPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogdXNlci5pZCxcclxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VyLnVzZXJuYW1lLFxyXG4gICAgICAgICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwsXHJcbiAgICAgICAgICAgICAgICBwaG9uZTogdXNlci5waG9uZVxyXG5cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHB1YmxpY0FwaS5tb2RpZnlVc2VySW5mbyh1c2VySW5mbykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCfkv67mlLnmiJDlip/vvIEnKTtcclxuICAgICAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKHVzZXJJbmZvKTtcclxuICAgICAgICAgICAgfSwgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5L+u5pS55aSx6LSl77yBJyxcclxuICAgICAgICAgICAgICAgICAgICBtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICB9XSk7XHJcbiAgICAvLyDnlKjmiLfnrqHnkIZzZXJ2aWNlXHJcbiAgICB1c2VyTW9kdWxlLmZhY3RvcnkoJyRkb21lVXNlcicsIFsnJGh0dHAnLCAnJHEnLCAnJGRvbWVQdWJsaWMnLCAnJGRvbWVHbG9iYWwnLCAnJGRvbWVNb2RlbCcsIGZ1bmN0aW9uICgkaHR0cCwgJHEsICRkb21lUHVibGljLCAkZG9tZUdsb2JhbCwgJGRvbWVNb2RlbCkge1xyXG4gICAgICAgIGxldCBsb2dpblVzZXIgPSB7fTtcclxuICAgICAgICBjb25zdCByZWxhdGVkR2l0TGFiID0gKGxvZ2luRGF0YSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBsZXQgZ2l0T3B0aW9ucyA9ICRkb21lR2xvYmFsLmdldEdsb2FiYWxJbnN0YW5jZSgnZ2l0Jyk7XHJcbiAgICAgICAgICAgIGdpdE9wdGlvbnMuZ2V0RGF0YSgpLnRoZW4oKGluZm8pID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghaW5mb1swXS51cmwpIHtcclxuICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5pyq6YWN572u5Luj56CB5LuT5bqT5Zyw5Z2A77yBJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB1cmwgPSBpbmZvWzBdLnVybDtcclxuICAgICAgICAgICAgICAgICAgICAkaHR0cC5wb3N0KHVybCArICcvYXBpL3YzL3Nlc3Npb24nLCBhbmd1bGFyLnRvSnNvbihsb2dpbkRhdGEpKS50aGVuKChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGluZm8gPSByZXMuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGluZm8udXNlcm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbjogaW5mby5wcml2YXRlX3Rva2VuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJhbXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9wcm9qZWN0L2dpdC9naXRsYWJpbmZvJywgYW5ndWxhci50b0pzb24ocGFyYW1zKSkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlcy5kYXRhLnJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgYWxhcm1Hcm91cFNlcnZpY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IEFsYXJtR3JvdXAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkZG9tZU1vZGVsLlNlcnZpY2VNb2RlbC5jYWxsKHRoaXMsICcvYXBpL2FsYXJtL2dyb3VwJyk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQWxhcm1Hcm91cCgpO1xyXG4gICAgICAgIH0oKTtcclxuICAgICAgICBjb25zdCB1c2VyU2VydmljZSA9IHtcclxuICAgICAgICAgICAgZ2V0Q3VycmVudFVzZXI6ICgpID0+ICRodHRwLmdldCgnL2FwaS91c2VyL2dldCcpLFxyXG4gICAgICAgICAgICBnZXRVc2VyTGlzdDogKCkgPT4gJGh0dHAuZ2V0KCcvYXBpL3VzZXIvbGlzdCcpLFxyXG4gICAgICAgICAgICBtb2RpZnlVc2VySW5mbzogdXNlciA9PiAkaHR0cC5wb3N0KCcvYXBpL3VzZXIvbW9kaWZ5JywgYW5ndWxhci50b0pzb24odXNlcikpLFxyXG4gICAgICAgICAgICAvLyDnrqHnkIblkZjkv67mlLnvvJpAcGFyYW0gdXNlckluZm86e3VzZXJuYW1lOid1c2VybmFtZScsIHBhc3N3b3JkOidwYXNzd29yZCd9XHJcbiAgICAgICAgICAgIG1vZGlmeVB3OiB1c2VySW5mbyA9PiAkaHR0cC5wb3N0KCcvYXBpL3VzZXIvYWRtaW5DaGFuZ2VQYXNzd29yZCcsIGFuZ3VsYXIudG9Kc29uKHVzZXJJbmZvKSksXHJcbiAgICAgICAgICAgIC8vIOeUqOaIt+S/ruaUue+8miBAcGFyYW0gdXNlckluZm86IHt1c2VybmFtZTondXNlcm5hbWUnLCBvbGRwYXNzd29yZDonb2xkcGFzc3dvcmQnLCBuZXdwYXNzd29yZDonbmV3cGFzc3dvcmQnfVxyXG4gICAgICAgICAgICB1c2VyTW9kaWZ5UHc6IHVzZXJJbmZvID0+ICRodHRwLnBvc3QoJy9hcGkvdXNlci9jaGFuZ2VQYXNzd29yZCcsIGFuZ3VsYXIudG9Kc29uKHVzZXJJbmZvKSksXHJcbiAgICAgICAgICAgIGRlbGV0ZVVzZXI6IHVzZXJJZCA9PiAkaHR0cC5kZWxldGUoYC9hcGkvdXNlci9kZWxldGUvJHt1c2VySWR9YCksXHJcbiAgICAgICAgICAgIGNyZWF0ZVVzZXI6IHVzZXJJbmZvID0+ICRodHRwLnBvc3QoJy9hcGkvdXNlci9jcmVhdGUnLCBhbmd1bGFyLnRvSnNvbih1c2VySW5mbykpLFxyXG4gICAgICAgICAgICAvL+iOt+WPlueZu+W9leeUqOaIt+WvueW6lOi1hOa6kOeahOinkuiJslxyXG4gICAgICAgICAgICBnZXRSZXNvdXJjZVVzZXJSb2xlOiAocmVzb3VyY2VUeXBlLCBpZCkgPT4gJGh0dHAuZ2V0KGAvYXBpL3VzZXIvcmVzb3VyY2UvJHtyZXNvdXJjZVR5cGV9LyR7aWR9YCksXHJcbiAgICAgICAgICAgIC8vIOiOt+WPluWNleS4qui1hOa6kOeUqOaIt+S/oeaBr1xyXG4gICAgICAgICAgICBnZXRTaWdSZXNvdXJjZVVzZXI6IChyZXNvdXJjZVR5cGUsIGlkKSA9PiAkaHR0cC5nZXQoYC9hcGkvcmVzb3VyY2UvJHtyZXNvdXJjZVR5cGV9LyR7aWR9YCksXHJcbiAgICAgICAgICAgIGdldFJlc291cmNlTGlzdDogKHJlc291cmNlVHlwZSkgPT4gJGh0dHAuZ2V0KGAvYXBpL2NvbGxlY3Rpb25zLyR7cmVzb3VyY2VUeXBlfWApLFxyXG4gICAgICAgICAgICAvLyDojrflj5bmn5DnsbvotYTmupDnlKjmiLfkv6Hmga8gaGFzIGRlbGV0ZWQgMjAxNi0xMC0yN1xyXG4gICAgICAgICAgICBnZXRSZXNvdXJjZVVzZXI6IHJlc291cmNlVHlwZSA9PiAkaHR0cC5nZXQoYC9hcGkvcmVzb3VyY2UvJHtyZXNvdXJjZVR5cGV9L3VzZXJvbmx5YCksXHJcbiAgICAgICAgICAgIG1vZGlmeVJlc291cmNlVXNlcjogcmVzb3VyY2VJbmZvID0+ICRodHRwLnB1dCgnL2FwaS9yZXNvdXJjZScsIGFuZ3VsYXIudG9Kc29uKHJlc291cmNlSW5mbykpLFxyXG4gICAgICAgICAgICBkZWxldGVSZXNvdXJjZVVzZXI6IChyZXNvdXJjZVR5cGUsIHJlc291cmNlSWQsIG93bmVyVHlwZSwgb3duZXJJZCkgPT4gJGh0dHAuZGVsZXRlKGAvYXBpL3Jlc291cmNlLyR7cmVzb3VyY2VUeXBlfS8ke3Jlc291cmNlSWR9LyR7b3duZXJUeXBlfS8ke293bmVySWR9YCksXHJcbiAgICAgICAgICAgIC8vIOiOt+WPlui1hOa6kOe7hOS/oeaBr1xyXG4gICAgICAgICAgICBnZXRHcm91cExpc3Q6ICgpID0+ICRodHRwLmdldCgnIC9hcGkvbmFtZXNwYWNlL2xpc3QnKSxcclxuICAgICAgICAgICAgLy8g6I635Y+W57uE5YiX6KGoXHJcbiAgICAgICAgICAgIGdldEdyb3VwOiAoKSA9PiAkaHR0cC5nZXQoJy9hcGkvZ3JvdXAvbGlzdCcpLFxyXG4gICAgICAgICAgICBnZXRHcm91cEluZm86IGdyb3VwSWQgPT4gJGh0dHAuZ2V0KGAvYXBpL2dyb3VwL2dldC8ke2dyb3VwSWR9YCksXHJcbiAgICAgICAgICAgIGRlbGV0ZUdyb3VwOiBncm91cElkID0+ICRodHRwLmRlbGV0ZShgL2FwaS9ncm91cC9kZWxldGUvJHtncm91cElkfWApLFxyXG4gICAgICAgICAgICBjcmVhdGVHcm91cDogZ3JvdXBEYXRhID0+ICRodHRwLnBvc3QoJy9hcGkvZ3JvdXAvY3JlYXRlJywgYW5ndWxhci50b0pzb24oZ3JvdXBEYXRhKSksXHJcbiAgICAgICAgICAgIG1vZGlmeUdyb3VwVXNlcnM6IChncm91cElkLCB1c2VycykgPT4gJGh0dHAucG9zdChgL2FwaS9ncm91cF9tZW1iZXJzLyR7Z3JvdXBJZH1gLCBhbmd1bGFyLnRvSnNvbih1c2VycykpLFxyXG4gICAgICAgICAgICBkZWxldGVHcm91cFVzZXI6IChncm91cElkLCB1c2VySWQpID0+ICRodHRwLmRlbGV0ZShgL2FwaS9ncm91cF9tZW1iZXJzLyR7Z3JvdXBJZH0vJHt1c2VySWR9YCksXHJcbiAgICAgICAgICAgIGdldEdyb3VwVXNlcjogZ3JvdXBJZCA9PiAkaHR0cC5nZXQoYC9hcGkvZ3JvdXBfbWVtYmVycy8ke2dyb3VwSWR9YCksXHJcbiAgICAgICAgICAgIGxvZ291dDogKCkgPT4gJGh0dHAuZ2V0KCcvYXBpL3VzZXIvbG9nb3V0JyksXHJcblxyXG4gICAgICAgICAgICAvL2NvbGxlY3Rpb24g55So5oi36KGM5Li6XHJcbiAgICAgICAgICAgICBcclxuICAgICAgICAgICAgZGVsZXRlQ29sbGVjdGlvblVzZXI6IChjb2xsZWN0aW9uSWQsIHVzZXJJZCwgcmVzb3VyY2VUeXBlKSA9PiAkaHR0cC5kZWxldGUoYC9hcGkvY29sbGVjdGlvbl9tZW1iZXJzLyR7Y29sbGVjdGlvbklkfS8ke3VzZXJJZH0vJHsgcmVzb3VyY2VUeXBlfWApLFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbW9kaWZ5VXNlclJvbGU6IGNvbGxlY3Rpb25NZW1iZXIgPT4gJGh0dHAucG9zdCgnL2FwaS9jb2xsZWN0aW9uX21lbWJlcnMvc2luZ2xlJyxhbmd1bGFyLnRvSnNvbihjb2xsZWN0aW9uTWVtYmVyKSksXHJcbiAgICAgICAgICAgIGFkZENvbGxlY3Rpb25Vc2VyczogY29sbGVjdGlvbkRhdGEgPT4gJGh0dHAucG9zdCgnL2FwaS9jb2xsZWN0aW9uX21lbWJlcnMvbXVsdGlwbGUnLCBhbmd1bGFyLnRvSnNvbihjb2xsZWN0aW9uRGF0YSkpLFxyXG4gICAgICAgICAgICBhZGRPbmVDb2xsZWN0aW9uVXNlcjogKGNvbGxlY3Rpb25EYXRhKSA9PiAkaHR0cC5wb3N0KCcvYXBpL2NvbGxlY3Rpb25fbWVtYmVycy9zaW5nbGUnLCBhbmd1bGFyLnRvSnNvbihjb2xsZWN0aW9uRGF0YSkpLFxyXG4gICAgICAgICAgICBnZXRDb2xsZWN0aW9uVXNlcjogKGNvbGxlY3Rpb25JZCxyZXNvdXJjZVR5cGUpID0+ICRodHRwLmdldChgL2FwaS9jb2xsZWN0aW9uX21lbWJlcnMvJHtjb2xsZWN0aW9uSWR9LyR7cmVzb3VyY2VUeXBlfWApLFxyXG4gICAgICAgICAgICAvL+eUqOS6jumhueebruWIm+W7uuaIkOWRmOa3u+WKoOWIneWni+WMluWSjOmhueebruaIkOWRmOagh+etvumhteeahOaIkOWRmOa3u+WKoFxyXG4gICAgICAgICAgICBjcmVhdGVDb2xsZWN0aW9uVXNlcjogY29sbGVjdGlvbkRhdGEgPT4gJGh0dHAucG9zdCgnL2FwaS9jb2xsZWN0aW9uX21lbWJlcnMvbXVsdGlwbGUnLGFuZ3VsYXIudG9Kc29uKGNvbGxlY3Rpb25EYXRhKSksXHJcbiAgICAgICAgICAgIC8v6I635Y+W6aG555uu57uE5oiW6ICF6YOo572y57uE55qE55So5oi35L+h5oGvXHJcbiAgICAgICAgICAgIC8vZ2V0Q29sbGVjdGlvblNwYWNlVXNlcjogKHJlc291cmNlVHlwZSkgPT4gJGh0dHAuZ2V0KGAvYXBpL2NvbGxlY3Rpb25zcGFjZS9saXN0LyR7cmVzb3VyY2VUeXBlfWApXHJcbiAgICAgICAgICAgIGdldENvbGxlY3Rpb25MaXN0OiBjb2xsZWN0aW9uTGlzdCA9PiAkaHR0cC5wb3N0KGAvYXBpL2NvbGxlY3Rpb25zLyR7cmVzb3VyY2VUeXBlfWApXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgZ2V0TG9naW5Vc2VyID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBpZiAobG9naW5Vc2VyLmlkKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGxvZ2luVXNlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB1c2VyU2VydmljZS5nZXRDdXJyZW50VXNlcigpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ2luVXNlciA9IHJlcy5kYXRhLnJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGxvZ2luVXNlcik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyDotYTmupDmiJDlkZhcclxuICAgICAgICBjbGFzcyBSZXNvdXJjZVVzZXIge1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcihyZXNvdXJjZUluZm8pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdChyZXNvdXJjZUluZm8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluaXQocmVzb3VyY2VJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICByZXNvdXJjZUluZm8udXNlckluZm9zID0gcmVzb3VyY2VJbmZvLnVzZXJJbmZvcyB8fCBbXTtcclxuICAgICAgICAgICAgICAgIHJlc291cmNlSW5mby5ncm91cEluZm8gPSByZXNvdXJjZUluZm8uZ3JvdXBJbmZvIHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgdXNlciBvZiByZXNvdXJjZUluZm8udXNlckluZm9zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlci5pc0RpcnR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlci5uZXdSb2xlID0gdXNlci5yb2xlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXNvdXJjZUluZm8gPSByZXNvdXJjZUluZm87XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG9nZ2xlUm9sZSh1c2VyLCBuZXdSb2xlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodXNlci5uZXdSb2xlICE9PSBuZXdSb2xlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlci5uZXdSb2xlID0gbmV3Um9sZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHVzZXIuaXNEaXJ0eSA9IHVzZXIubmV3Um9sZSAhPT0gdXNlci5yb2xlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNhdmVSb2xlKHVzZXIpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkYXRhLCBkZWZlcmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZVR5cGUgPT0gJ2FsYXJtJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQ6IHVzZXIudXNlcklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiB1c2VyLm5ld1JvbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VyLnVzZXJuYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfV07XHJcbiAgICAgICAgICAgICAgICAgICAgYWxhcm1Hcm91cFNlcnZpY2Uuc2V0RGF0YShkYXRhKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5pc0RpcnR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXIucm9sZSA9IHVzZXIubmV3Um9sZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5L+u5pS55aSx6LSl77yBJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmVzb3VyY2VJbmZvLnJlc291cmNlVHlwZSA9PSAnZ3JvdXAnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZDogdXNlci51c2VySWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlOiB1c2VyLm5ld1JvbGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJTZXJ2aWNlLm1vZGlmeUdyb3VwVXNlcnModGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VJZCwgZGF0YSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXIuaXNEaXJ0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLnJvbGUgPSB1c2VyLm5ld1JvbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+S/ruaUueWksei0pe+8gScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZVR5cGUgPT0gJ1BST0pFQ1RfQ09MTEVDVElPTicgfHwgdGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlID09ICdERVBMT1lfQ09MTEVDVElPTicgfHwgdGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlID09ICdDTFVTVEVSJykge1xyXG4gICAgICAgICAgICAgICAgXHRkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgXHRcdGNvbGxlY3Rpb25JZDogcGFyc2VJbnQodGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VJZCksXHJcbiAgICAgICAgICAgICAgICBcdFx0dXNlcklkOiB1c2VyLnVzZXJJZCxcclxuICAgICAgICAgICAgICAgIFx0XHRyb2xlOiB1c2VyLm5ld1JvbGUsXHJcbiAgICAgICAgICAgICAgICBcdFx0cmVzb3VyY2VUeXBlOiB0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZVR5cGVcclxuICAgICAgICAgICAgICAgIFx0XHQvL3VzZXJOYW1lOiB1c2VyLnVzZXJuYW1lXHJcbiAgICAgICAgICAgICAgICBcdH07XHJcbiAgICAgICAgICAgICAgICBcdHVzZXJTZXJ2aWNlLm1vZGlmeVVzZXJSb2xlKGRhdGEpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgXHRcdHVzZXIuaXNEaXJ0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgXHRcdHVzZXIucm9sZSA9IHVzZXIubmV3Um9sZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZXNvbHZlKCk7ICAgICAgICAgICAgICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgXHR9LCgpPT57XHJcbiAgICAgICAgICAgICAgICBcdFx0ZGVmZXJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+S/ruaUueWksei0pe+8gScpO1xyXG5cclxuICAgICAgICAgICAgICAgIFx0fSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlSWQ6IHRoaXMucmVzb3VyY2VJbmZvLnJlc291cmNlSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlVHlwZTogdGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvd25lckluZm9zOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3duZXJJZDogdXNlci51c2VySWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lclR5cGU6IHVzZXIub3duZXJUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogdXNlci5uZXdSb2xlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB1c2VyU2VydmljZS5tb2RpZnlSZXNvdXJjZVVzZXIoZGF0YSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXIuaXNEaXJ0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLnJvbGUgPSB1c2VyLm5ld1JvbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+S/ruaUueWksei0pe+8gScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWxldGVVc2VyKHVzZXIsIGlzU2VsZikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRlZmVyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3BsaWNlVXNlciA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucmVzb3VyY2VJbmZvLnVzZXJJbmZvcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXNvdXJjZUluZm8udXNlckluZm9zW2ldLnVzZXJJZCA9PT0gdXNlci51c2VySWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb3VyY2VJbmZvLnVzZXJJbmZvcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VUeXBlID09ICdncm91cCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB1c2VyU2VydmljZS5kZWxldGVHcm91cFVzZXIodGhpcy5yZXNvdXJjZUluZm8ucmVzb3VyY2VJZCwgdXNlci51c2VySWQpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGxpY2VVc2VyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfliKDpmaTlpLHotKXvvIEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiAnTWVzc2FnZTonICsgcmVzLmRhdGEucmVzdWx0TXNnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKHRoaXMucmVzb3VyY2VJbmZvLnJlc291cmNlVHlwZSA9PSAnUFJPSkVDVF9DT0xMRUNUSU9OJyB8fCB0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZVR5cGUgPT0gJ0RFUExPWV9DT0xMRUNUSU9OJyB8fCB0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZVR5cGUgPT0gJ0NMVVNURVInKSB7XHJcblx0XHRcdFx0XHRsZXQgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XHJcblx0XHRcdFx0XHRsZXQgcHJvbXB0VHh0ID0gJ+ehruWumuimgeWIoOmZpOWQl++8nyc7XHJcblx0XHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuRGVsZXRlKHByb21wdFR4dCkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0XHRcdHVzZXJTZXJ2aWNlLmRlbGV0ZUNvbGxlY3Rpb25Vc2VyKHRoaXMucmVzb3VyY2VJbmZvLnJlc291cmNlSWQsIHVzZXIudXNlcklkLCB0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZVR5cGUpLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdFx0c3BsaWNlVXNlcigpO1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGVmZXJlZC5yZXNvbHZlKCk7XHJcblx0XHRcdFx0XHRcdFx0fSwgKHJlcykgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGVmZXJlZC5yZWplY3QoKTtcclxuXHRcdFx0XHRcdFx0XHRcdCRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dGl0bGU6J+WIoOmZpOWksei0pSEnLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRtc2c6ICdNZXNzYWdlOicgKyByZXMuZGF0YS5yZXN1bHRNc2dcclxuXHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHR9LCAoKSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0ZGVmZXJlZC5yZWplY3QoKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdHJldHVybiBkZWZlcmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9tcHRUeHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzU2VsZiAmJiB0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZVR5cGUgPT0gJ2FsYXJtJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9tcHRUeHQgPSAn5oKo56Gu5a6a6KaB56a75byA5oql6K2m57uE5ZCX77yfJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlbkRlbGV0ZShwcm9tcHRUeHQpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGVsZXRlRnVuYyA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZVR5cGUgPT0gJ2FsYXJtJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhbGFybUdyb3VwU2VydmljZS5kZWxldGVEYXRhKHVzZXIudXNlcklkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVzZXJTZXJ2aWNlLmRlbGV0ZVJlc291cmNlVXNlcih0aGlzLnJlc291cmNlSW5mby5yZXNvdXJjZVR5cGUsIHRoaXMucmVzb3VyY2VJbmZvLnJlc291cmNlSWQsIHVzZXIub3duZXJUeXBlLCB1c2VyLnVzZXJJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZUZ1bmMoKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BsaWNlVXNlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5Yig6Zmk5aSx6LSl77yBJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2c6ICdNZXNzYWdlOicgKyByZXMuZGF0YS5yZXN1bHRNc2dcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNsYXNzIFVzZXJHcm91cExpc3Qge1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvcih1c2VyR3JvdXBJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJHcm91cCA9IHt9O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KHVzZXJHcm91cEluZm8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluaXQodXNlckdyb3VwSW5mbykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyR3JvdXBMaXN0ID0gdXNlckdyb3VwSW5mbyB8fCBbXTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnVzZXJHcm91cExpc3RbMF0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZSgwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0b2dnbGUoaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXNlckdyb3VwID0gdGhpcy51c2VyR3JvdXBMaXN0W2luZGV4XTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZ2V0SW5zdGFuY2UgPSAkZG9tZU1vZGVsLmluc3RhbmNlc0NyZWF0b3Ioe1xyXG4gICAgICAgICAgICBVc2VyR3JvdXBMaXN0OiBVc2VyR3JvdXBMaXN0LFxyXG4gICAgICAgICAgICBSZXNvdXJjZVVzZXI6IFJlc291cmNlVXNlclxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBhbGFybUdyb3VwU2VydmljZTogYWxhcm1Hcm91cFNlcnZpY2UsXHJcbiAgICAgICAgICAgIHVzZXJTZXJ2aWNlOiB1c2VyU2VydmljZSxcclxuICAgICAgICAgICAgcmVsYXRlZEdpdExhYjogcmVsYXRlZEdpdExhYixcclxuICAgICAgICAgICAgZ2V0TG9naW5Vc2VyOiBnZXRMb2dpblVzZXIsXHJcbiAgICAgICAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZVxyXG4gICAgICAgIH07XHJcbiAgICB9XSk7XHJcbiAgICB3aW5kb3cudXNlck1vZHVsZSA9IHVzZXJNb2R1bGU7XHJcbn0pKHdpbmRvdyk7Il19
