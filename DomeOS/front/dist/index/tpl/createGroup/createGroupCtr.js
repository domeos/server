(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('CreateGroupCtr', ['$scope', '$domeUser', '$domePublic', '$state', function ($scope, $domeUser, $domePublic, $state) {
		'use strict';
		$scope.$emit('pageTitle', {
			title: '新建组',
			descrition: '在这里您可以新建一个组。',
			mod: 'user'
		});
		$scope.selectedUsers = [];
		$scope.userList = [];
		$scope.role = 'REPORTER';
		$scope.selectedUsersList = [];
		$scope.group = {};
		$scope.userKey = {
			key: ''
		};
		$scope.isWaitingCreate = false;
		var userService = $domeUser.userService;
		userService.getCurrentUser().then(function (res) {
			var loginUser = res.data.result;
			$scope.myself = {
				userId: loginUser.id,
				username: loginUser.username,
				role: 'MASTER'
			};
			userService.getUserList().then(function (res) {
				$scope.userList = res.data.result || [];
				for (var i = 0; i < $scope.userList.length; i++) {
					if ($scope.userList[i].id === $scope.myself.userId) {
						$scope.userList.splice(i, 1);
						break;
					}
				}
			});
		});
		// 选中用户
		$scope.selectUser = function (id, username) {
			var i = 0,
				l;
			for (i = 0, l = $scope.selectedUsers.length; i < l; i++) {
				if ($scope.selectedUsers[i].userId === id) {
					return;
				}
			}
			for (i = 0, i = $scope.selectedUsersList.length; i < l; i++) {
				if ($scope.selectedUsersList[i].userId === id) {
					return;
				}
			}
			$scope.selectedUsers.push({
				userId: id,
				username: username
			});
			$scope.userKey.key = '';
		};
		// 删除已选择但未添加的用户
		$scope.cancelUser = function (index) {
			$scope.selectedUsers.splice(index, 1);
		};
		// 添加选中的用户
		$scope.addUser = function () {
			for (var i = 0, l = $scope.selectedUsers.length; i < l; i++) {
				$scope.selectedUsersList.push({
					userId: $scope.selectedUsers[i].userId,
					username: $scope.selectedUsers[i].username,
					role: $scope.role
				});
			}
			$scope.selectedUsers = [];
		};
		// 删除已添加的用户
		$scope.deleteUser = function (index) {
			$scope.selectedUsersList.splice(index, 1);
		};
		$scope.toggleRole = function (role) {
			$scope.role = role;
		};
		$scope.userKeyDown = function (event, str, user) {
			if (event.keyCode == 13 && user) {
				$scope.selectUser(user.id, user.username);
			}
			if (!str && event.keyCode == 8) {
				$scope.selectedUsers.pop();
			}
		};
		$scope.createGroup = function () {
			$scope.isWaitingCreate = true;
			var usersList = [];
			for (var i = 0, l = $scope.selectedUsersList.length; i < l; i++) {
				usersList.push({
					userId: $scope.selectedUsersList[i].userId,
					role: $scope.selectedUsersList[i].role
				});
			}
			usersList.push({
				userId: $scope.myself.userId,
				role: $scope.myself.role
			});
			userService.createGroup($scope.group).then(function (res) {
				var groupId = res.data.result.id;
				userService.modifyGroupUsers(groupId, {
					members: usersList
				}).then(function () {
					$domePublic.openPrompt('创建成功！');
					$state.go('groupManage');
				}, function () {
					$scope.isWaitingCreate = false;
					$domePublic.openWarning('创建成功，添加用户失败！');
					$state.go('groupManage');
				});
			}, function () {
				$scope.isWaitingCreate = false;
				$domePublic.openWarning('创建失败，请重试！');
			});
		};
	}]);
})(window.domeApp);