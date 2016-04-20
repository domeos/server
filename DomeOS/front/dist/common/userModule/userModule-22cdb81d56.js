var userModule = angular.module('userModule', []);
userModule.controller('modifyPwModalCtr', ['$scope', 'loginUser', '$modalInstance', '$domePublic', '$domeUser', function($scope, loginUser, $modalInstance, $domePublic, $domeUser) {
	'use strict';
	$scope.pwObj = {
		username: loginUser.username,
		oldpassword: '',
		newpassword: ''
	};
	$scope.newPwAgain = '';
	$scope.modiftPw = function() {
		$domeUser.userModifyPw($scope.pwObj).then(function() {
			$domePublic.openPrompt('修改成功，请重新登录！').finally(function() {
				location.href = '/login/login.html?redirect=' + encodeURIComponent(location.href);
			});

		}, function() {
			$domePublic.openWarning('修改失败，请重试！');
		});
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
}]);
// 用户管理service
userModule.factory('$domeUser', ['$http', '$q', '$domePublic', '$domeGlobal', function($http, $q, $domePublic, $domeGlobal) {
	'use strict';
	var relatedGitLab = function(loginData) {
		var deferred = $q.defer();
		var gitOptions = $domeGlobal.getGloabalInstance('git');
		gitOptions.getData().then(function(info) {
			if (!info[0].url || info[0].url === '') {
				$domePublic.openWarning('未配置代码仓库地址！');
				deferred.reject();
			} else {
				var url = info[0].url;
				$http.post(url + '/api/v3/session', angular.toJson(loginData)).then(function(res) {
					var info = res.data;
					var params = {
						name: info.username,
						token: info.private_token
					};
					return params;
				}, function() {
					deferred.reject();
				}).then(function(params) {
					$http.post('/api/project/git/gitlabinfo', angular.toJson(params)).then(function(res) {
						deferred.resolve(res.data.result);
					}, function() {
						deferred.reject();
					});
				}, function() {
					deferred.reject();
				});
			}
		}, function() {
			deferred.reject();
		});
		return deferred.promise;
	};
	var getCurrentUser = function() {
		return $http.get('/api/user/get');
	};
	var getUserList = function() {
		return $http.get('/api/user/list');
	};
	var modifyUserInfo = function(username, email) {
		return $http.post('/api/user/modify?username=' + username + '&email=' + email);
	};
	// 管理员修改：@param userInfo:{username:'username', password:'password'}
	var modifyPw = function(userInfo) {
		return $http.post('/api/user/adminChangePassword', angular.toJson(userInfo));
	};
	// 用户修改： @param userInfo: {username:'username', oldpassword:'oldpassword', newpassword:'newpassword'}
	var userModifyPw = function(userInfo) {
		return $http.post('/api/user/changePassword', angular.toJson(userInfo));
	};
	var deleteUser = function(username) {
		return $http.delete('/api/user/delete/' + username);
	};
	var createUser = function(userInfo) {
		return $http.post('/api/user/create', angular.toJson(userInfo));
	};
	var getGroupList = function() {
		return $http.get(' /api/namespace/list');
	};
	// 获取单个资源用户信息
	var getSigResourceUser = function(resourceType, id) {
		return $http.get('/api/resource/' + resourceType + '/' + id);
	};
	// 获取某类资源用户信息
	var getResourceUser = function(resourceType) {
		return $http.get('/api/resource/' + resourceType + '/useronly');
	};
	var getGroup = function() {
		return $http.get('/api/group/list');
	};
	var getGroupInfo = function(groupId) {
		return $http.get('/api/group/get/' + groupId);
	};
	var deleteGroup = function(groupId) {
		return $http.delete('/api/group/delete/' + groupId);
	};
	var createGroup = function(groupData) {
		return $http.post('/api/group/create', angular.toJson(groupData));
	};
	var modifyGroupUsers = function(groupId, users) {
		return $http.post('/api/group_members/' + groupId, angular.toJson(users));
	};
	var deleteGroupUser = function(groupId, userId) {
		return $http.delete('/api/group_members/' + groupId + '/' + userId);
	};
	var getGroupUser = function(groupId) {
		return $http.get('/api/group_members/' + groupId);
	};
	var modifyResourceUser = function(ResourceInfo) {
		return $http.put('/api/resource', angular.toJson(ResourceInfo));
	};
	var deleteResourceUser = function(resourceType, resourceId, ownerType, ownerId) {
		return $http.delete('/api/resource/' + resourceType + '/' + resourceId + '/' + ownerType + '/' + ownerId);
	};
	var logout = function() {
		return $http.get('/api/user/logout');
	};
	// 资源成员
	var ResourceUser = function() {};
	ResourceUser.prototype = {
		constructor: ResourceUser,
		init: function(resourceInfo) {
			var i;
			resourceInfo.userInfos = resourceInfo.userInfos || [];
			resourceInfo.groupInfo = resourceInfo.groupInfo || [];
			for (i = 0; i < resourceInfo.userInfos.length; i++) {
				// 是否被修改
				resourceInfo.userInfos[i].isDirty = false;
				// 用来存储用户修改的role
				resourceInfo.userInfos[i].newRole = resourceInfo.userInfos[i].role;
			}
			this.resourceInfo = resourceInfo;
		},
		toggleRole: function(user, newRole) {
			if (user.newRole !== newRole) {
				user.newRole = newRole;
			}
			if (user.newRole === user.role) {
				user.isDirty = false;
			} else {
				user.isDirty = true;
			}
		},
		saveRole: function(user) {
			var data;
			if (this.resourceInfo.resourceType == 'group') {
				data = {
					members: [{
						user_id: user.user_id,
						role: user.newRole
					}]
				};
				modifyGroupUsers(this.resourceInfo.resourceId, data).then(function(res) {
					user.isDirty = false;
					user.role = user.newRole;
				}, function() {
					$domePublic.openWarning('修改失败！');
				});
			} else {
				data = {
					resource_id: this.resourceInfo.resourceId,
					resource_type: this.resourceInfo.resourceType,
					ownerInfos: [{
						owner_id: user.user_id,
						owner_type: user.owner_type,
						role: user.newRole
					}]
				};
				modifyResourceUser(data).then(function(res) {
					user.isDirty = false;
					user.role = user.newRole;
				}, function() {
					$domePublic.openWarning('修改失败！');
				});

			}
		},
		deleteUser: function(user) {
			var that = this;

			function spliceUser() {
				for (var i = 0; i < that.resourceInfo.userInfos.length; i++) {
					if (that.resourceInfo.userInfos[i].user_id === user.user_id) {
						that.resourceInfo.userInfos.splice(i, 1);
						break;
					}
				}
			}
			if (that.resourceInfo.resourceType == 'group') {
				deleteGroupUser(that.resourceInfo.resourceId, user.user_id).then(function(res) {
					spliceUser();
				}, function(res) {
					$domePublic.openWarning({
						title: '删除失败！',
						msg: 'Message:' + res.data.resultMsg
					});
				});
			} else {
				$domePublic.openDelete().then(function() {
					deleteResourceUser(that.resourceInfo.resourceType, that.resourceInfo.resourceId, user.owner_type, user.user_id).then(function(res) {
						spliceUser();
					}, function(res) {
						$domePublic.openWarning({
							title: '删除失败！',
							msg: 'Message:' + res.data.resultMsg
						});
					});
				});
			}
		}
	};

	var UserGroupList = function() {
		this.userGroup = {};
	};
	UserGroupList.prototype = {
		init: function(userGroupInfo) {
			var that = this;
			that.userGroupList = userGroupInfo || [];
			if (that.userGroupList[0]) {
				that.toggle(0);
			}
		},
		toggle: function(index) {
			this.userGroup = this.userGroupList[index];
		}

	};
	var getInstance = function(className, initInfo) {
		var ins;
		switch (className) {
			case 'UserGroupList':
				ins = new UserGroupList();
				break;
			case 'ResourceUser':
				ins = new ResourceUser();
				break;
			default:
				ins = {};
				ins.init = function() {
					console.log('error:there is no ' + className);
				};
				break;
		}
		ins.init(initInfo);
		return ins;
	};

	return {
		relatedGitLab: relatedGitLab,
		getCurrentUser: getCurrentUser,
		getUserList: getUserList,
		modifyUserInfo: modifyUserInfo,
		modifyPw: modifyPw,
		userModifyPw: userModifyPw,
		deleteUser: deleteUser,
		createUser: createUser,
		getGroupList: getGroupList,
		getSigResourceUser: getSigResourceUser,
		getResourceUser: getResourceUser,
		modifyResourceUser: modifyResourceUser,
		getGroup: getGroup,
		getGroupInfo: getGroupInfo,
		deleteGroup: deleteGroup,
		createGroup: createGroup,
		modifyGroupUsers: modifyGroupUsers,
		getGroupUser: getGroupUser,
		logout: logout,
		getInstance: getInstance
	};
}]);