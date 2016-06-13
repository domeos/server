domeApp.controller('TplUserListCtr', ['$scope', '$domeUser', '$domePublic', '$state', '$domeDeploy', function ($scope, $domeUser, $domePublic, $state, $domeDeploy) {
	switch ($scope.resourceType) {
	case 'PROJECT':
		$scope.resourceName = '项目';
		break;
	case 'DEPLOY':
		$scope.resourceName = '部署';
		break;
	case 'group':
		$scope.resourceName = '组';
		break;
	case 'CLUSTER':
		$scope.resourceName = '集群';
		break;
	case 'ALARM':
		$scope.resourceName = '报警组';
		break;
	default:
		$scope.resourceName = '';
		break;
	}
	$scope.isEdit = false;
	$scope.selectWay = 'member';
	$scope.selectedRole = 'REPORTER';
	$scope.userKey = {
		key: ''
	};
	var alarmGroupService, userService = $domeUser.userService;
	var init = function () {
		$scope.selectedGroup = {};
		$scope.selectedUsers = [];
		$scope.selectResource = {};
		var resource;

		userService.getUserList().then(function (res) {
			$scope.userList = res.data.result || [];
		});
		if ($scope.resourceType !== 'group') {
			if ($scope.resourceType === 'ALARM') {
				alarmGroupService = $domeUser.alarmGroupService;
				alarmGroupService.getData().then(function (res) {
					resource = {
						// resourceId: $scope.resourceId,
						resourceType: 'alarm',
						userInfos: res.data.result || []
					};
					$scope.resourceInfo = $domeUser.getInstance('ResourceUser', resource);
					$scope.userInfos = $scope.resourceInfo.resourceInfo.userInfos;
					$scope.groupInfo = $scope.resourceInfo.resourceInfo.groupInfo;
				});
			} else {
				userService.getSigResourceUser($scope.resourceType, $scope.resourceId).then(function (res) {
					$scope.resourceInfo = $domeUser.getInstance('ResourceUser', res.data.result);
					$scope.userInfos = $scope.resourceInfo.resourceInfo.userInfos;
					$scope.groupInfo = $scope.resourceInfo.resourceInfo.groupInfo;
					$scope.$emit('memberPermisson', true);
				}, function () {
					$scope.$emit('memberPermisson', false);
				});

				userService.getResourceUser($scope.resourceType).then(function (res) {
					$scope.selectResourceUser = res.data.result || [];
					/*	deployList = [];
					$domeDeploy.deployService.getList().then(function(res) {
						deployList = res.data.result;
							for (var i = 0; i < resourceUser.length; i++) {
								var findResourceId = resourceUser[i].resourceId;
								for (var j = 0; j < deployList.length; j++) {
									if (deployList[j].deployId === findResourceId) {
										resourceUser[i].namespace = deployList[j].namespace;
										deployList.splice(j, 1);
										break;
									}
								}
							}
						$scope.selectResourceUser = resourceUser;
					});*/
				});
			}

			userService.getGroup().then(function (res) {
				$scope.groupList = res.data.result || [];
			});
		} else {
			userService.getGroupUser($scope.resourceId).then(function (res) {
				// 将group中的user转换为resource中user的格式，保持view不变
				resource = {
					resourceId: $scope.resourceId,
					resourceType: 'group',
					userInfos: res.data.result || []
				};
				$scope.resourceInfo = $domeUser.getInstance('ResourceUser', resource);
				$scope.userInfos = $scope.resourceInfo.resourceInfo.userInfos;
				$scope.groupInfo = $scope.resourceInfo.resourceInfo.groupInfo;
			});
		}
	};
	init();

	function getMasterCount() {
		var masterCount = 0;
		for (var i = 0; i < $scope.userInfos.length; i++) {
			if ($scope.userInfos[i].role == 'MASTER') {
				masterCount++;
				if (masterCount > 1) {
					break;
				}
			}
		}
		return masterCount;
	}
	$scope.checkUser = function (user) {
		var isExsit = false;
		for (var i = 0; i < $scope.selectedUsers.length; i++) {
			if ($scope.selectedUsers[i].username === user.username) {
				isExsit = true;
				break;
			}
		}
		if (!isExsit) {
			$scope.selectedUsers.push({
				username: user.username,
				ownerId: user.id,
				ownerType: 'USER'
			});
		}
		$scope.userKey.key = '';
	};
	$scope.cancelUser = function (index) {
		$scope.selectedUsers.splice(index, 1);
	};
	$scope.userKeyUp = function (event, str, user) {
		if (event.keyCode == 13 && user) {
			$scope.checkUser(user);
		}
		if (!str && event.keyCode == 8) {
			$scope.selectedUsers.pop();
		}
	};
	$scope.toggleRole = function (role) {
		if (role == 'oldRole') {
			if ($scope.selectWay == 'group') {
				$scope.selectedRole = '保留原有组权限';
			} else {
				$scope.selectedRole = '保留原有' + $scope.resourceName + '权限';
			}
		} else {
			$scope.selectedRole = role;
		}
	};
	$scope.toggleWay = function (way) {
		if (way === $scope.selectWay) {
			return;
		}
		$scope.selectResource = {};
		$scope.selectWay = way;
		if (way == 'member') {
			$scope.toggleRole('REPORTER');
		} else {
			$scope.toggleRole('oldRole');
		}
	};
	$scope.toggleResource = function (index) {
		$scope.selectResource = $scope.selectResourceUser[index];
	};
	$scope.toggleGroup = function (name, id) {
		$scope.selectedGroup.name = name;
		$scope.selectedGroup.id = id;
	};
	$scope.saveRole = function (user) {
		$domeUser.getLoginUser().then(function (loginUser) {
			if ($scope.resourceType == 'group' && loginUser.username === user.username && user.role == 'MASTER' && getMasterCount() <= 1) {
				$domePublic.openWarning('您是最后一个master，不能降低权限！');
			} else {
				$scope.resourceInfo.saveRole(user).then(function () {
					if ($scope.resourceType == 'ALARM' && loginUser.username === user.username && user.newRole !== 'MASTER') {
						$scope.$emit('memberPermisson', false);
					}
				});
			}
		});
	};
	$scope.addMember = function () {
		var requestData = {
			resourceId: $scope.resourceInfo.resourceInfo.resourceId,
			resourceType: $scope.resourceInfo.resourceInfo.resourceType
		};
		var ownerInfos = [],
			i = 0;

		var submitModify = function (data, isAlarm) {
			var func = isAlarm ? alarmGroupService.setData : userService.modifyResourceUser;
			$domePublic.openConfirm('会覆盖已有成员的权限，是否继续？').then(function () {
				func(data).then(function () {
					$domePublic.openPrompt('添加成功！');
					init();
				});
			});
		};
		if ($scope.selectWay == 'group') {
			if (!$scope.selectedGroup.id) {
				$domePublic.openWarning('请选择组！');
				return;
			}
			userService.getGroupUser($scope.selectedGroup.id).then(function (res) {
				var userList = res.data.result;
				if (!userList || userList === 0) {
					$domePublic.openWarning('该组没有成员！');
					return;
				}
				// 非资源
				if ($scope.resourceType == 'ALARM') {
					for (i = 0; i < userList.length; i++) {
						ownerInfos.push({
							userId: userList[i].userId,
							role: $scope.selectedRole == '保留原有组权限' ? userList[i].role : $scope.selectedRole
						});
					}
					submitModify(ownerInfos, true);
				} else {
					for (i = 0; i < userList.length; i++) {
						ownerInfos.push({
							ownerId: userList[i].userId,
							ownerType: 'USER',
							role: $scope.selectedRole == '保留原有组权限' ? userList[i].role : $scope.selectedRole
						});
					}
					requestData.ownerInfos = ownerInfos;
					submitModify(requestData);
				}
			});
		} else if ($scope.selectWay == 'member') {
			if ($scope.selectedUsers.length === 0) {
				$domePublic.openWarning('请选择成员！');
				return;
			}
			if ($scope.resourceType == 'group') {
				var membersArr = [];
				for (i = 0; i < $scope.selectedUsers.length; i++) {
					membersArr.push({
						userId: $scope.selectedUsers[i].ownerId,
						role: $scope.selectedRole
					});
				}
				userService.modifyGroupUsers($scope.resourceId, {
					members: membersArr
				}).then(function () {
					$domePublic.openPrompt('添加成功！');
					init();
				}, function (res) {
					$domePublic.openWarning({
						title: '添加失败！',
						msg: 'Message:' + res.data.resultMsg
					});
				});
			} else {
				// 非资源
				if ($scope.resourceType == 'ALARM') {
					for (i = 0; i < $scope.selectedUsers.length; i++) {
						ownerInfos.push({
							userId: $scope.selectedUsers[i].ownerId,
							role: $scope.selectedRole
						});
					}
					submitModify(ownerInfos, true);
				} else {
					for (i = 0; i < $scope.selectedUsers.length; i++) {
						ownerInfos.push({
							ownerId: $scope.selectedUsers[i].ownerId,
							ownerType: 'USER',
							role: $scope.selectedRole
						});
					}
					requestData.ownerInfos = ownerInfos;
					submitModify(requestData);
				}
			}
		} else {
			if ($scope.selectResource.userInfos === undefined) {
				$domePublic.openWarning('请选择' + $scope.resourceName + '！');
				return;
			}
			$scope.selectResource.userInfos = $scope.selectResource.userInfos || [];
			if ($scope.selectResource.userInfos.length === 0) {
				$domePublic.openWarning('当前' + $scope.resourceName + '无成员！');
				return;
			}
			for (i = 0; i < $scope.selectResource.userInfos.length; i++) {
				var userInfo = $scope.selectResource.userInfos[i];
				ownerInfos.push({
					ownerId: userInfo.userId,
					ownerType: 'USER',
					role: $scope.selectedRole == '保留原有' + $scope.resourceName + '权限' ? userInfo.role : $scope.selectedRole
				});
			}
			requestData.ownerInfos = ownerInfos;
			submitModify(requestData);
		}
	};
	$scope.deleteUser = function (user) {
		if ($scope.resourceType == 'group') {
			$domeUser.getLoginUser().then(function (loginUser) {
				if (user.userId === loginUser.id) {
					if (getMasterCount() > 1) {
						$domePublic.openDelete('确定要离开该组吗？').then(function () {
							$scope.resourceInfo.deleteUser(user);
						});
					} else {
						$domePublic.openWarning('您是组中唯一的master，不能离开该组！');
					}
				} else {
					$domePublic.openDelete().then(function () {
						$scope.resourceInfo.deleteUser(user);
					});
				}
			});
		} else {
			$domeUser.getLoginUser().then(function (loginUser) {
				var isSelf;
				if (user.userId === loginUser.id) {
					isSelf = true;
				}
				$scope.resourceInfo.deleteUser(user, isSelf).then(function () {
					if (isSelf && $scope.resourceType == 'ALARM' && loginUser.username !== 'admin') {
						$state.go('monitor');
					}
				});
			});
		}
	};
}]);