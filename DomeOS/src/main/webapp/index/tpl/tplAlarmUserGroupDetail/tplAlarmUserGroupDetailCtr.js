/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('TplAlarmUserGroupDetailCtr', ['$scope', '$domeUser', '$domeAlarm', '$domePublic', '$state','$stateParams', function ($scope, $domeUser, $domeAlarm, $domePublic, $state, $stateParams) {
		'use strict';
		$scope.$emit('pageTitle', {
			title: '新建组',
			descrition: '在这里您可以新建一个组。',
			mod: 'user'
		});
		$scope.userGroupId = $stateParams.id;
		$scope.selectedUsers = [];
		$scope.userList = [];
		$scope.selectedUsersList = [];
		$scope.userKey = {
			key: ''
		};
		$scope.isWaitingCreate = false;
		var alarmUserGroupService = $domeAlarm.getInstance('UserGroupService');
		$scope.permission = {
            id: null,
            username: null,
            role: null
        };
        //获取所有用户
        $domeUser.userService.getUserList().then(function (res) {
			$scope.userList = res.data.result || [];	
		});
		// 获取当前用户的报警权限
        function getPermission() {
            $domeUser.getLoginUser().then(function (user) {
                if (user.username == 'admin') {
                    $scope.permission.id = user.id;
                    // 自定义角色标识admin
                    $scope.permission.role = 'admin';
                } else {
                    $domeUser.alarmGroupService.getData().then(function (res) {
                        var alarmUsers = res.data.result;
                        if (alarmUsers && alarmUsers.length !== 0) {
                            for (var i = 0, l = alarmUsers.length; i < l; i++) {
                                if (alarmUsers[i].userId == user.id) {
                                    $scope.permission.id = alarmUsers[i].userId;
                                    $scope.permission.role = alarmUsers[i].role;
                                    break;
                                }
                            }
                            if (!$scope.permission.id) {
                                $state.go('alarm.templates');
                                return;
                            }
                            $scope.$broadcast('permission', $scope.permission);
                        }
                    });
                }
            });
        }
        getPermission();
		function initUserList() {
			alarmUserGroupService.getData().then(function (res) {
				var userGroupInfos = res.data.result || [];

				for(var j=0; j < userGroupInfos.length; j++) {
					if(userGroupInfos[j].id == $stateParams.id) {
						$scope.userInfos = userGroupInfos[j].userList;
						break;
					}
				}
			});
		}
		initUserList();
		// 选中用户
		$scope.selectUser = function (user) {
			var i = 0,
				l;
			for (i = 0, l = $scope.selectedUsers.length; i < l; i++) {
				if ($scope.selectedUsers[i].userId === user.id) {
					return;
				}
			}
			$scope.selectedUsers.push({
				id: user.id,
				username: user.username,
				email: user.email,
				phone: user.phone
			});
			$scope.userKey.key = '';
		};
		// 删除已选择但未添加的用户
		$scope.cancelUser = function (index) {
			$scope.selectedUsers.splice(index, 1);
		};
		// 删除已添加的用户
		$scope.deleteUser = function (userId) {
			$domePublic.openDelete().then(function () {
				alarmUserGroupService.deleteSingleUser($scope.userGroupId, userId).then(function (res) {
					var deleteRes = res.data.result;
					$domePublic.openPrompt('删除成功！ ');
					initUserList();
				}, function (res) {
					$domePublic.openWarning({
						title:'删除失败，请重试！',
						msg: res.data.resultMsg
					});
				});
			});
		};
		$scope.userKeyDown = function (event, str, user) {
			if (event.keyCode == 13 && user) {
				$scope.selectUser(user.id, user.username);
			}
			if (!str && event.keyCode == 8) {
				$scope.selectedUsers.pop();
			}
		};
		$scope.addUser = function () {
			$scope.isWaitingCreate = true;
			alarmUserGroupService.bindUser($scope.userGroupId, $scope.selectedUsers).then(function (res) {
				$domePublic.openPrompt('添加成功！');
				$scope.selectedUsers = [];
				initUserList();
			},function (res) {
				$domePublic.openWarning({
					title:'添加失败，请重试！',
					msg: res.data.resultMsg
				});
			}).finally(function() {
				$scope.isWaitingCreate = false;
			});
		};
	}]);
})(window.domeApp);