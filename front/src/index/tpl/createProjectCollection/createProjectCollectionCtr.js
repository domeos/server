/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('CreateProjectCollectionCtr', ['$scope', '$domeUser', '$domeProjectCollection', 'dialog', '$state', function ($scope, $domeUser, $domeProjectCollection, dialog, $state) {
		'use strict';
		$scope.$emit('pageTitle', {
			title: '新建项目',
			descrition: '在这里您可以新建一个项目。',
			mod: 'user'
		});
		$scope.isPublic = false;
		$scope.resourceType = 'PROJECT_COLLECTION';
		$scope.selectedUsers = [];
		$scope.userList = [];
		$scope.role = 'REPORTER';
		$scope.selectedUsersList = [];
		$scope.group = {};
		$scope.projectCollection = {};
		$scope.userKey = {
			key: ''
		};
		$scope.isWaitingCreate = false;
		var userService = $domeUser.userService;
		var projectCollectionService = $domeProjectCollection.projectCollectionService;
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
		$scope.createProjectCollection = function () {
			$scope.isWaitingCreate = true;
			var usersList = [];
			// usersList.push({
			// 	userId: $scope.myself.userId,
			// 	role: $scope.myself.role
			// });
			var creatorInfo = {
				creatorId:$scope.myself.userId,
				name: $scope.myself.name
			};
			$scope.projectCollection.creatorInfo = creatorInfo;
			if($scope.isPublic) {
				$scope.projectCollection.projectCollectionState='PUBLIC';
			}else {
				$scope.projectCollection.projectCollectionState='PRIVATE';
			}
			projectCollectionService.createProjectCollection($scope.projectCollection).then(function (res) {
				var projectCollectionId = res.data.result.id;
				//var usersList = [];
				for (var i = 0, l = $scope.selectedUsersList.length; i < l; i++) {
					usersList.push({
						collectionId: projectCollectionId,
						userId: $scope.selectedUsersList[i].userId,
						role: $scope.selectedUsersList[i].role,
						resourceType: $scope.resourceType
					});
				}
				var projectCollectionMembers = {
					collectionId: projectCollectionId,
					resourceType: $scope.resourceType,
					members: usersList
				};
				userService.createCollectionUser(projectCollectionMembers).then(function () {
					dialog.alert('提示', '创建成功！');
					$state.go('projectCollectionManage');
				}, function (res) {
					$scope.isWaitingCreate = false;
					dialog.error('创建成功，添加用户失败', res.data.resultMsg);
					$state.go('projectCollectionManage');
				});
			}, function (res) {
				$scope.isWaitingCreate = false;
				dialog.error('创建失败', res.data.resultMsg);
			});
		};
	}]);
})(angular.module('domeApp'));