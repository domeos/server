/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('TplUserListCtr', ['$scope', '$domeUser', '$domePublic', '$state', '$domeDeploy', function ($scope, $domeUser, $domePublic, $state, $domeDeploy) {
		switch ($scope.resourceType) {
		case 'PROJECT_COLLECTION':
			$scope.resourceName = '项目组';
			break;
		case 'DEPLOY_COLLECTION':
			$scope.resourceName = '部署组';
			break;
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
		$scope.isMaster = false; 
		$scope.userKey = {
			key: ''
		};
		var alarmGroupService, userService = $domeUser.userService;
		var init = function () {
			$scope.selectedGroup = {};
			$scope.selectedUsers = [];
			$scope.selectResource = {};
			$scope.selectedUsersList = [];
			//$scope.remainingOptionalUsers = [];
			var resource;
			userService.getUserList().then(function (res) {
				$scope.userList = res.data.result || [];
				$scope.userListRecord = $scope.userList;//删除用户时，用于添加回userList
			}); 
			if ($scope.resourceType !== 'group' ) {
				if ($scope.resourceType === 'ALARM') {
					$scope.isMaster = true; //只有master角色的用户可以看到报警组tab
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
				} else if($scope.resourceType === 'PROJECT_COLLECTION' || $scope.resourceType === 'DEPLOY_COLLECTION') {
					userService.getResourceUserRole($scope.resourceType, $scope.resourceId).then(function (res) {
						$scope.resourceUserRole = res.data.result;
						$scope.$emit('signalResourceCurrentUserRole', $scope.resourceUserRole);
					}, function () {
						$scope.$emit('signalResourceCurrentUserRole', 'REPORTER');
					});
					userService.getCollectionUser($scope.resourceId,$scope.resourceType).then(function(res) {
						resource = {
							resourceId: $scope.resourceId,
							resourceType: $scope.resourceType,
							userInfos: res.data.result || []
						};
						$scope.resourceInfo = $domeUser.getInstance('ResourceUser', resource);
						$scope.userInfos = $scope.resourceInfo.resourceInfo.userInfos;
						$scope.groupInfo = $scope.resourceInfo.resourceInfo.groupInfo;
						//$scope.remainingoptionalUsers = $scope.userList;
						$scope.userList = removeSelectedUsers($scope.userList,$scope.userInfos);
						$domeUser.getLoginUser().then(function(loginUser){
							if(loginUser.id === 1){ //admin有所有项目的Master权限
								$scope.isMaster = true;
							}
							for(var i=0; i < $scope.userInfos.length; i++){
								if($scope.userInfos[i].userId === loginUser.id){
									if($scope.userInfos[i].role === "MASTER"){
										$scope.isMaster = true;
									}
								}
							}

						});
						
					});
					getResourceList($scope.resourceType);
					/*userService.getCollectionSpaceUser($scope.resourceType).then(function (res) {
						$scope.selectResourceUser = res.data.result || [];
					});*/
				
				} else if ($scope.resourceType === 'CLUSTER') {
					userService.getResourceUserRole($scope.resourceType, $scope.resourceId).then(function (res) {
						var resourceUserRole = res.data.result;
						$scope.$emit('signalResourceCurrentUserRole', resourceUserRole);
						if(resourceUserRole === 'MASTER' || resourceUserRole === 'DEVELOPER') {
							$scope.$emit('memberPermisson', true);
						}else {
							$scope.$emit('memberPermisson', false);
						}
					}, function () {
						$scope.$emit('memberPermisson', false);
					});
					userService.getCollectionUser($scope.resourceId,$scope.resourceType).then(function(res) {
						resource = {
							resourceId: $scope.resourceId,
							resourceType: $scope.resourceType,
							userInfos: res.data.result || []
						};
						$scope.resourceInfo = $domeUser.getInstance('ResourceUser', resource);
						$scope.userInfos = $scope.resourceInfo.resourceInfo.userInfos;
						$scope.groupInfo = $scope.resourceInfo.resourceInfo.groupInfo;
						//$scope.remainingoptionalUsers = $scope.userList;
						$scope.userList = removeSelectedUsers($scope.userList,$scope.userInfos);
						$domeUser.getLoginUser().then(function(loginUser){
							if(loginUser.id === 1){ //admin有所有项目的Master权限
								$scope.isMaster = true;
							}
							for(var i=0; i < $scope.userInfos.length; i++){
								if($scope.userInfos[i].userId === loginUser.id){
									if($scope.userInfos[i].role === "MASTER"){
										$scope.isMaster = true;
									}
								}
							}

						});
						
					});
				}else {
					userService.getResourceUserRole($scope.resourceType, $scope.resourceId).then(function (res) {
						$scope.resourceInfo = $domeUser.getInstance('ResourceUser', res.data.result);
						$scope.userInfos = $scope.resourceInfo.resourceInfo.userInfos;
						$scope.groupInfo = $scope.resourceInfo.resourceInfo.groupInfo;
						$scope.$emit('memberPermisson', true);
					}, function () {
						$scope.$emit('memberPermisson', false);
					});
					userService.getResourceUser($scope.resourceType).then(function (res) {
						$scope.selectResourceUser = res.data.result || [];
						deployList = [];
						/*
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
				/*userService.getGroup().then(function (res) {
					$scope.groupList = res.data.result || [];
				});*/

			} /* else if {
				userService.
				
			}*/ else {
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
		function getResourceList(resourceType){
			userService.getResourceList(resourceType).then(function(res) {
				$scope.selectResourceUser = res.data.result || [];
			},function(error) {

			});

		}
		function getCurrentUserRole() {
			$domeUser.getLoginUser().then(function(loginUser){
				if(loginUser.name === 'admin'){ //admin有所有项目的Master权限
					$scope.isMaster = true;
					return;
				}
				for(var i=0; i < $scope.userInfos.length; i++){
					if($scope.userInfos[i].userId === loginUser.id){
						if($scope.userInfos[i].role === "MASTER"){
							$scope.isMaster = true;
						}
					}
				}

			});
		}
		function getMasterCount() {
			var masterCount = 0;
			for (var i = 0, l = $scope.userInfos.length; i < l; i++) {
				if ($scope.userInfos[i].role == 'MASTER') {
					masterCount++;
					if (masterCount > 1) {
						break;
					}
				}
			}
			return masterCount;
		}

		function getUserCount(){
			return $scope.userInfos.length;
		}

		//检查是否已经是selectedUsers,是则不能加入添加框
		$scope.checkUser = function (user) { 
			var isExsit = false;
			for (var i = 0, l = $scope.selectedUsers.length; i < l; i++) {
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
		// 删除已选择但未添加的用户
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

		//此saveRole是对页面逻辑的判断。userModule.es中的saveRole用于数据的提交
		$scope.saveRole = function (user) {
			$domeUser.getLoginUser().then(function (loginUser) {
				if ($scope.resourceType == 'group' && loginUser.username === user.username && user.role == 'MASTER' && getMasterCount() <= 1) {
					$domePublic.openWarning('您是最后一个master，不能降低权限！');
				} else {
					$scope.resourceInfo.saveRole(user).then(function () {
						if ($scope.resourceType == 'ALARM' && loginUser.username === user.username && user.newRole !== 'MASTER') {
							$scope.$emit('memberPermisson', false);
						}
						if(user.userId === loginUser.id && user.newRole !== 'MASTER') {
							if(loginUser.id !== 1){
								$scope.isMaster = false;
							}
							$scope.isEdit = false;
						}
						
					});
				}
			});
		};
		
		/*参考createProjectCollectionCtl的调用*/
		$scope.selectUser = function (id, username) {
			var i = 0,
				l;
			for (i = 0, l = $scope.selectedUsers.length; i < l; i++) {
				if ($scope.selectedUsers[i].userId === id) {//如已经在添加框，则不添加
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
		
		// 添加选中的用户
		$scope.addUser = function () {
			for (var i = 0, l = $scope.selectedUsers.length; i < l; i++) {
				$scope.selectedUsersList.push({
					userId: $scope.selectedUsers[i].ownerId,
					username: $scope.selectedUsers[i].username,
					role: $scope.selectedRole
				});
			}
			$scope.selectedUsers = [];
			
		};

		// 删除已添加的用户 		
		$scope.deleteUserFromList = function (index) {
			$scope.selectedUsersList.splice(index, 1);
		};


		$scope.userKeyDown = function (event, str, user) {
			if (event.keyCode == 13 && user) {
				$scope.selectUser(user.id, user.username);
			}
			if (!str && event.keyCode == 8) {
				$scope.selectedUsers.pop();
			}
		};	
		var updateUsersList = function() {
			var resource = {};
			userService.getCollectionUser($scope.resourceId,$scope.resourceType).then(function(res) {
				resource = {
					resourceId: $scope.resourceId,
					resourceType: $scope.resourceType,
					userInfos: res.data.result || []
				};
				$scope.resourceInfo = $domeUser.getInstance('ResourceUser', resource);
				$scope.userInfos = $scope.resourceInfo.resourceInfo.userInfos;
				$scope.groupInfo = $scope.resourceInfo.resourceInfo.groupInfo;
				
			});
		};
		var removeSelectedUsers = function (userList,userInfos){ //传入对象数组
			var ids = [];
			for(var i=0; i<userInfos.length; i++){
				ids.push(userInfos[i].userId);
		 	}
		 	return userList.filter(function(item){
				return ids.indexOf(item.id) === -1; 
		 	});
		}


		var pushtToUserList = function(user){
			for(var i = 0; i < $scope.userListRecord.length; i++){
				if($scope.userListRecord[i].id === user.userId){
					$scope.userList.push($scope.userListRecord[i]);
					return;
				}
			}
		}
		/* -参考end	*/

		$scope.addMember = function () {
			$scope.addUser(); // oh orz
			if($scope.resourceType !== 'ALARM') {
				var requestData = {

					//resourceId: $scope.resourceInfo.resourceInfo.resourceId,
					collectionId: $scope.resourceInfo.resourceInfo.resourceId,
					resourceType: $scope.resourceInfo.resourceInfo.resourceType
					//membersArr: []

				};
			}
			
			
			var ownerInfos = [],
				i = 0,
				l;

			var submitModify = function (data, isAlarm) {
				var func = isAlarm ? alarmGroupService.setData : userService.modifyResourceUser;
				//检查是否已有成员
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
						for (i = 0, l = userList.length; i < l; i++) {
							ownerInfos.push({
								userId: userList[i].userId,
								role: $scope.selectedRole == '保留原有组权限' ? userList[i].role : $scope.selectedRole
							});
						}
						submitModify(ownerInfos, true);
					} else {
						for (i = 0, l = userList.length; i < l; i++) {
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
				if ($scope.selectedUsersList.length === 0) { // by gb
					$domePublic.openWarning('请选择成员！');
					return;
				}
				if ($scope.resourceType == 'PROJECT_COLLECTION' || $scope.resourceType == 'DEPLOY_COLLECTION' || $scope.resourceType == 'CLUSTER') {
					var usersList = [],
						projectCollectionId=$scope.resourceInfo.resourceInfo.resourceId;
					for (i = 0, l = $scope.selectedUsersList.length; i < l; i++) {
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
						$scope.selectedUsersList = [];
						$domePublic.openPrompt('添加用户成功！');
						$scope.userList = removeSelectedUsers($scope.userList,usersList);
						updateUsersList();
						//$state.go('projectManage');
					}, function () {
						$scope.isWaitingCreate = false;
						$domePublic.openWarning('添加用户失败！');
						//init();
						
					});			

				} else {
					// 非资源
					if ($scope.resourceType == 'ALARM') {
						for (i = 0, l = $scope.selectedUsersList.length; i < l; i++) {
							ownerInfos.push({
								userId: $scope.selectedUsersList[i].userId,
								username: $scope.selectedUsersList[i].username,
								role: $scope.selectedRole
							});
						}
						submitModify(ownerInfos, true);
					} else {
						for (i = 0, l = $scope.selectedUsers.length; i < l; i++) {
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
			} else if($scope.selectWay == 'item') {
				if ($scope.selectResource.id === undefined) {
					$domePublic.openWarning('请选择' + $scope.resourceName + '！');
					return;
				}
				$scope.selectResource.userInfos = $scope.selectResource.userInfos || [];
				var userListInfos = [];
				userService.getCollectionUser($scope.selectResource.id,$scope.resourceType).then(function(res) {
						var userListInfos = res.data.result ;
						if (userListInfos.length === 0) {
							$domePublic.openWarning('当前' + $scope.resourceName + '无成员！');
							return;
						}
						for (i = 0, l = userListInfos.length; i < l; i++) {
							var userInfo = userListInfos[i];
							ownerInfos.push({
								collectionId: userInfo.collectionId,
								userId: userInfo.userId,
								resourceType: userInfo.resourceType,
								userName: userInfo.userName,
								role: $scope.selectedRole == '保留原有' + $scope.resourceName + '权限' ? userInfo.role : $scope.selectedRole
							});
						}
						var collectionId = $scope.resourceInfo.resourceInfo.resourceId;
						var collectionMembers = {
							collectionId: collectionId,
							resourceType: $scope.resourceType,
							members: ownerInfos
						};
						userService.createCollectionUser(collectionMembers).then(function () {
							init();
							$domePublic.openPrompt('添加用户成功！');
						}, function () {
							$scope.isWaitingCreate = false;
							$domePublic.openWarning('添加用户失败！');		
						});	

				});
				
				

			}else {
				if ($scope.selectResource.userInfos === undefined) {
					$domePublic.openWarning('请选择' + $scope.resourceName + '！');
					return;
				}
				$scope.selectResource.userInfos = $scope.selectResource.userInfos || [];
				if ($scope.selectResource.userInfos.length === 0) {
					$domePublic.openWarning('当前' + $scope.resourceName + '无成员！');
					return;
				}
				for (i = 0, l = $scope.selectResource.userInfos.length; i < l; i++) {
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
			//if ($scope.resourceType == 'group') {
			if ($scope.resourceType === 'PROJECT_COLLECTION' || $scope.resourceType === 'DEPLOY_COLLECTION' || $scope.resourceType === 'CLUSTER') {
				$domeUser.getLoginUser().then(function (loginUser) {
					var role = user.role,
						userId = user.userId,
						collectionId = user.collectionId,
						resourceType = user.resourceType,
						isSelf = false;
						if (user.userId === loginUser.id) {
							isSelf = true;
						}
						/*
						if (getMasterCount() > 1) {
							$domePublic.openDelete('确定要离开该组吗？').then(function () {
								$scope.resourceInfo.deleteUser(user);
							});
						} else {
							$domePublic.openWarning('您是组中唯一的master，不能离开该组！');

						}*/
						$scope.resourceInfo.deleteUser(user,isSelf).then(function () {
							$scope.selectedUsersList = [];
							pushtToUserList(user);
							$domePublic.openPrompt('刪除用户成功！');
						}, function (res) {
							$domePublic.openWarning({
								title: '刪除用户失败！',
								msg: 'Message:' + res.data.resultMsg
							});
							// $state.go('projectManage');
							// if($scope.resourceType === 'PROJECT_COLLECTION'){
							// 	$state.go('projectManage');
							// }else if($scope.resourceType === 'DEPLOY_COLLECTION'){
							// 	$state.go('deployManage');
							// }else if($scope.resourceType === 'CLUSTER'){
							// 	$state.go('clusterDetail',{id:collectionId});
							// }		
			
						});	
						/*
						$domePublic.openDelete().then(function () {
							$scope.resourceInfo.deleteUser(user);
						});
						*/
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
	
})(window.domeApp);