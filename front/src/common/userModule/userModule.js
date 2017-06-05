/*
 * @author ChandraLee
 * @description 用户模块
 */

((window, undefined) => {
    'use strict';
    let userModule = angular.module('userModule', []);
    userModule.controller('ModifyPwModalCtr', ['$scope', 'loginUser', '$modalInstance', 'dialog', '$domeUser', function ($scope, loginUser, $modalInstance, dialog, $domeUser) {
        $scope.pwObj = {
            username: loginUser.username,
            oldpassword: '',
            newpassword: ''
        };
        $scope.newPwAgain = '';
        $scope.modiftPw = () => {
            $domeUser.userService.userModifyPw($scope.pwObj).then(() => {
                dialog.alert('提示', '修改成功，请重新登录！').then(() => {
                    location.href = '/login/login.html?redirect=' + encodeURIComponent(location.href);
                });

            }, () => {
                dialog.error('警告', '修改失败，请重试！');
            });
        };

        $scope.cancel = () => {
            $modalInstance.dismiss('cancel');
        };
    }]).controller('ModifyUserInfoCtr', ['$scope', 'user', '$publicApi', '$modalInstance', 'dialog', function ($scope, user, $publicApi, $modalInstance, dialog) {
        $scope.user = user;
        $scope.cancel = () => {
            $modalInstance.dismiss();
        };
        $scope.submit = () => {
            let userInfo = {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone

            };
            $publicApi.modifyUserInfo(userInfo).then(() => {
                dialog.alert('提示', '修改成功！');
                $modalInstance.close(userInfo);
            }, (res) => {
                dialog.error('修改失败', res.data.resultMsg);
            });
        };
    }]);
    // 用户管理service
    userModule.factory('$domeUser', ['$http', '$q', 'dialog', '$domeGlobal', '$domeModel', function ($http, $q, dialog, $domeGlobal, $domeModel) {
        let loginUser = {};
        const relatedGitLab = (loginData) => {
            let deferred = $q.defer();
            let gitOptions = $domeGlobal.getGloabalInstance('git');
            gitOptions.getData().then((info) => {
                info = info.filter(x => x.id === loginData.gitlabId);
                if (!info[0] || !info[0].url) {
                    dialog.error('警告', '未配置代码仓库地址！');
                    deferred.reject();
                } else {
                    let url = info[0].url;
                    $http.post(url + '/api/v3/session', angular.toJson(loginData), { ignore401: true, }).then((res) => {
                        let info = res.data;
                        let params = {
                            name: info.username,
                            token: info.private_token,
                            gitlabId: loginData.gitlabId,
                        };
                        return params;
                    }, () => {
                        deferred.reject();
                    }).then(function (params) {
                        $http.post('/api/project/git/gitlabinfo', angular.toJson(params)).then((res) => {
                            deferred.resolve(res.data.result);
                        }, () => {
                            deferred.reject();
                        });
                    }, () => {
                        deferred.reject();
                    });
                }
            }, () => {
                deferred.reject();
            });
            return deferred.promise;
        };
        const userService = {
            getCurrentUser: () => $http.get('/api/user/get'),
            getUserList: () => $http.get('/api/user/list'),
            modifyUserInfo: user => $http.post('/api/user/modify', angular.toJson(user)),
            // 管理员修改：@param userInfo:{username:'username', password:'password'}
            modifyPw: userInfo => $http.post('/api/user/adminChangePassword', angular.toJson(userInfo)),
            // 用户修改： @param userInfo: {username:'username', oldpassword:'oldpassword', newpassword:'newpassword'}
            userModifyPw: userInfo => $http.post('/api/user/changePassword', angular.toJson(userInfo)),
            deleteUser: userId => $http.delete(`/api/user/delete/${userId}`),
            createUser: userInfo => $http.post('/api/user/create', angular.toJson(userInfo)),
            //获取登录用户对应资源的角色
            getResourceUserRole: (resourceType, id) => $http.get(`/api/user/resource/${resourceType}/${id}`),
            // 获取单个资源用户信息
            getSigResourceUser: (resourceType, id) => $http.get(`/api/resource/${resourceType}/${id}`),
            getResourceList: (resourceType) => $http.get(`/api/collections/${resourceType}`),
            // 获取某类资源用户信息 has deleted 2016-10-27
            getResourceUser: resourceType => $http.get(`/api/resource/${resourceType}/useronly`),
            modifyResourceUser: resourceInfo => $http.put('/api/resource', angular.toJson(resourceInfo)),
            deleteResourceUser: (resourceType, resourceId, ownerType, ownerId) => $http.delete(`/api/resource/${resourceType}/${resourceId}/${ownerType}/${ownerId}`),
            // 获取资源组信息
            getGroupList: () => $http.get(' /api/namespace/list'),
            // 获取组列表
            getGroup: () => $http.get('/api/group/list'),
            getGroupInfo: groupId => $http.get(`/api/group/get/${groupId}`),
            deleteGroup: groupId => $http.delete(`/api/group/delete/${groupId}`),
            createGroup: groupData => $http.post('/api/group/create', angular.toJson(groupData)),
            modifyGroupUsers: (groupId, users) => $http.post(`/api/group_members/${groupId}`, angular.toJson(users)),
            deleteGroupUser: (groupId, userId) => $http.delete(`/api/group_members/${groupId}/${userId}`),
            getGroupUser: groupId => $http.get(`/api/group_members/${groupId}`),
            logout: () => { location.href = '/api/user/logout?from=' + encodeURIComponent(location.protocol + '//' + location.host); },

            //collection 用户行为
             
            deleteCollectionUser: (collectionId, userId, resourceType) => $http.delete(`/api/collection_members/${collectionId}/${userId}/${ resourceType}`),
            
            modifyUserRole: collectionMember => $http.post('/api/collection_members/single',angular.toJson(collectionMember)),
            addCollectionUsers: collectionData => $http.post('/api/collection_members/multiple', angular.toJson(collectionData)),
            addOneCollectionUser: (collectionData) => $http.post('/api/collection_members/single', angular.toJson(collectionData)),
            getCollectionUser: (collectionId,resourceType) => $http.get(`/api/collection_members/${collectionId}/${resourceType}`),
            //用于项目创建成员添加初始化和项目成员标签页的成员添加
            createCollectionUser: collectionData => $http.post('/api/collection_members/multiple',angular.toJson(collectionData)),
            //获取项目组或者部署组的用户信息
            //getCollectionSpaceUser: (resourceType) => $http.get(`/api/collectionspace/list/${resourceType}`)
            getCollectionList: collectionList => $http.post(`/api/collections/${resourceType}`)
        };

        const getLoginUser = () => {
            let deferred = $q.defer();
            if (loginUser.id) {
                deferred.resolve(loginUser);
            } else {
                userService.getCurrentUser().then((res) => {
                    loginUser = res.data.result;
                    deferred.resolve(loginUser);
                });
            }
            return deferred.promise;
        };

        return {
            userService: userService,
            relatedGitLab: relatedGitLab,
            getLoginUser: getLoginUser,
        };
    }]);
    window.userModule = userModule;
})(window);