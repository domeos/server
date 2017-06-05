/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('CreateDeployCollectionCtr', ['$scope', '$domeUser', '$domeDeployCollection', 'dialog', '$state', function ($scope, $domeUser, $domeDeployCollection, dialog, $state) {
		'use strict';
		$scope.$emit('pageTitle', {
			title: '新建服务',
			descrition: '在这里您可以新建一个服务。',
			mod: 'user'
		});
		$scope.resourceType = 'DEPLOY_COLLECTION';
		$scope.selectedUsers = [];
		$scope.userList = [];
		$scope.role = 'REPORTER';
		$scope.selectedUsersList = [];
		$scope.group = {};
		$scope.deployCollection = {};
		$scope.userKey = {
			key: ''
		};
		$scope.isWaitingCreate = false;
		var userService = $domeUser.userService;
		var deployCollectionService = $domeDeployCollection.deployCollectionService;
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
			for (i = 0, l = $scope.selectedUsersList.length; i < l; i++) {
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
		$scope.createDeployCollection = function () {
			$scope.isWaitingCreate = true;
			var usersList = [];
			$scope.deployCollection.creatorId = $scope.myself.userId;
			$scope.deployCollection.creatorName = $scope.myself.name;
			deployCollectionService.createDeployCollection($scope.deployCollection).then(function (res) {
				var deployCollectionId = res.data.result.result.id;
				// console.log(res);
				//var usersList = [];
				for (var i = 0, l = $scope.selectedUsersList.length; i < l; i++) {
					usersList.push({
						collectionId: deployCollectionId,
						userId: $scope.selectedUsersList[i].userId,
						role: $scope.selectedUsersList[i].role,
						resourceType: $scope.resourceType
					});
				}
				var projectCollectionMembers = {
					collectionId: deployCollectionId,
					resourceType: $scope.resourceType,
					members: usersList
				};
				userService.createCollectionUser(projectCollectionMembers).then(function () {
					dialog.alert('提示', '创建成功！');
					$state.go('deployCollectionManage');
				}, function (res) {
					$scope.isWaitingCreate = false;
					dialog.error( '创建成功，添加用户失败！', res.data.resultMsg);
					$state.go('deployCollectionManage');
				});
			}, function (res) {
				$scope.isWaitingCreate = false;
				dialog.error( '创建失败，请重试！', res.data.resultMsg);
			});
		};
	}]);
})(angular.module('domeApp'));