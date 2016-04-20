domeApp.controller('globalSettingCtr', ['$scope', '$domeGlobal', '$state', '$domeUser', '$modal', '$domePublic', '$q', function($scope, $domeGlobal, $state, $domeUser, $modal, $domePublic, $q) {
	'use strict';
	$scope.$emit('pageTitle', {
		title: '全局配置',
		descrition: '在这里您可以进行一些全局配置，保证domeos能够正常运行和使用。',
		mod: 'global'
	});
	$scope.getLoginUser().then(function(user) {
		if (user.username !== 'admin') {
			$state.go('projectManage');
		}
	});

	var ldapOptions = $domeGlobal.getGloabalInstance('ldap');
	var serverOptions = $domeGlobal.getGloabalInstance('server');
	var registryOptions = $domeGlobal.getGloabalInstance('registry');
	var gitOptions = $domeGlobal.getGloabalInstance('git');
	var monitorOptions = $domeGlobal.getGloabalInstance('monitor');
	var sshOptions = $domeGlobal.getGloabalInstance('ssh');
	var clusterOptions = $domeGlobal.getGloabalInstance('cluster');

	$scope.serverInfo = {};
	$scope.ldapInfo = {};
	$scope.registryInfo = {};
	$scope.gitInfo = {};
	// $scope.monitorInfo = {};
	$scope.sshInfo = {};
	$scope.clusterInfo = {};

	$scope.newUser = {};
	$scope.needValidUser = {
		valid: false
	};
	$scope.userKey = {
		key: ''
	};
	$scope.isShowAdd = false;
	// 'USER'(普通用户) or 'LDAP'
	$scope.currentUserType = 'USER';
	// 普通用户列表
	$scope.userList = [];

	$scope.tabActive = [{
		active: false
	}, {
		active: false
	}, {
		active: false
	}, {
		active: false
	}, {
		active: false
	}, {
		active: false
	}, {
		active: false
	}, {
		active: false
	}];

	function UserList() {}
	UserList.prototype = {
		init: function(usersInfo) {
			for (var i = 0; i < usersInfo.length; i++) {
				usersInfo[i].newEmail = usersInfo[i].email;
				usersInfo[i].isEdit = false;
			}
			this.userList = usersInfo;
		},
		saveSingle: function(user) {
			$domeUser.modifyUserInfo(user.username, user.newEmail).then(function(res) {
				user.isEdit = false;
				user.email = user.newEmail;
			}, function() {
				$domePublic.openWarning('修改失败！');
			});
		},
		toggleEdit: function(user, isEdit) {
			user.isEdit = isEdit;
			if (!isEdit) {
				user.newEmail = user.email;
			}
		},
		addUser: function(userInfo) {
			var deferred = $q.defer();
			var that = this;
			$domeUser.createUser(userInfo).then(function() {
				$domePublic.openPrompt('创建成功！');
				var user = angular.copy(userInfo);
				user.newEmail = user.email;
				user.isEdit = false;
				that.userList.push(user);
				deferred.resolve();
			}, function() {
				$domePublic.openWarning('创建失败！');
				deferred.reject();
			});
			return deferred.promise;
		},
		modifyPw: function(user) {
			$modal.open({
				templateUrl: 'newPasswdModal.html',
				controller: 'newPasswdModalCtr',
				size: 'md',
				resolve: {
					username: function() {
						return user.username;
					}
				}
			});
		},
		deleteUser: function(user) {
			var that = this;
			var username = user.username;
			$domePublic.openDelete().then(function() {
				$domeUser.deleteUser(username).then(function() {
					for (var i = 0; i < that.userList.length; i++) {
						if (that.userList[i].username === username) {
							that.userList.splice(i, 1);
							break;
						}
					}
				}, function() {
					$domePublic.openWarning('删除失败！');
				});
			});
		}
	};

	function Monitor() {}
	Monitor.prototype = {
		init: function(info) {
			this.config = info || {};

			function formartStrToObjArr(str) {
				var arr = [];
				var strArr = [];
				if (!str || str === '') {
					return [{
						text: ''
					}];
				}
				strArr = str.split(',');
				for (var i = 0; i < strArr.length; i++) {
					arr.push({
						text: strArr[i]
					});
				}
				arr.push({
					text: ''
				});
				return arr;
			}
			this.config.transfer = formartStrToObjArr(this.config.transfer);
			this.config.graph = formartStrToObjArr(this.config.graph);
		},
		addItem: function(item) {
			this.config[item].push({
				text: ''
			});
		},
		deleteArrItem: function(item, index) {
			this.config[item].splice(index, 1);
		},
		formartMonitor: function() {
			var obj = angular.copy(this.config);

			function formartArrToStr(monitorArr) {
				var strArr = [];
				for (var i = 0; i < monitorArr.length; i++) {
					if (monitorArr[i].text && monitorArr[i].text !== '') {
						strArr.push(monitorArr[i].text);
					}
				}
				return strArr.join(',');
			}
			obj.transfer = formartArrToStr(this.config.transfer);
			obj.graph = formartArrToStr(this.config.graph);
			return obj;
		}
	};

	$domeUser.getUserList().then(function(res) {
		var userList = res.data.result || [];
		for (var i = 0; i < userList.length; i++) {
			if (userList[i].loginType == 'LDAP') {
				$scope.userList.push(userList[i]);
				userList.splice(i, 1);
				i--;
			}
		}
		$scope.userListIns = new UserList();
		$scope.userListIns.init(userList);
	});


	$scope.toggleUserType = function(userType) {
		if (userType !== $scope.currentUserType) {
			$scope.currentUserType = userType;
			$scope.isShowAdd = false;
			$scope.userKey.key = '';
		}
	};
	$scope.toggleShowAdd = function() {
		$scope.isShowAdd = !$scope.isShowAdd;
	};
	$scope.getLdap = function() {
		if (!$scope.ldapInfo.id) {
			ldapOptions.getData().then(function(info) {
				var reg = /(.*):([^:]+)/g;
				$scope.ldapInfo = info;
				$scope.ldapInfo.url = $scope.ldapInfo.server.replace(reg, '$1');
				$scope.ldapInfo.port = $scope.ldapInfo.server.replace(reg, '$2');
			});
		}
	};
	$scope.getGitInfo = function() {
		if (!$scope.gitInfo.id) {
			gitOptions.getData().then(function(gitInfos) {
				$scope.gitInfo = gitInfos[0];
			});
		}
	};
	$scope.getRegistryInfo = function() {
		if (!$scope.registryInfo.id) {
			registryOptions.getData().then(function(info) {
				$scope.registryInfo = info;
			});
		}
	};
	$scope.getServerInfo = function() {
		if (!$scope.serverInfo.id) {
			serverOptions.getData().then(function(info) {
				$scope.serverInfo = info;
			});
		}
	};
	$scope.getMonitorInfo = function() {
		function initMonitorInfo(info) {
			$scope.monitorIns = new Monitor();
			$scope.monitorIns.init(info);
			$scope.monitorConfig = $scope.monitorIns.config;
		}
		if (!$scope.monitorConfig) {
			monitorOptions.getData().then(function(info) {
				initMonitorInfo(info);
			}, initMonitorInfo());
		}
	};
	$scope.getWebSsh = function() {
		if (!$scope.sshInfo.id) {
			sshOptions.getData().then(function(info) {
				$scope.sshInfo = info;
			});
		}
	};
	$scope.getClusterInfo = function() {
		if (!$scope.clusterInfo.id) {
			clusterOptions.getData().then(function(info) {
				$scope.clusterInfo = info;
			});
		}
	};
	$scope.addUser = function(form) {
		var newUser = angular.copy($scope.newUser);
		delete newUser.rePassword;
		$scope.userListIns.addUser(newUser).then(function() {
			$scope.newUser = {};
			$scope.needValidUser.valid = false;
			form.$setPristine();
		});
	};
	$scope.saveLdap = function() {
		var data = angular.copy($scope.ldapInfo);
		data.server = data.url + ':' + data.port;
		delete data.url;
		delete data.port;
		ldapOptions.modifyData(data).then(function(info) {
			$scope.getLdap();
		});
	};
	$scope.saveGit = function() {
		if (!$scope.gitInfo.id) {
			$scope.gitInfo.type = 'GITLAB';
		}
		gitOptions.modifyData($scope.gitInfo).then(function(info) {
			if (info) {
				$scope.gitInfo = info;
			}
		});
	};
	$scope.saveRegistry = function() {
		if ($scope.registryInfo.id) {
			delete($scope.registryInfo.id);
			delete($scope.registryInfo.createTime);
		}
		var registryInfo = angular.copy($scope.registryInfo);
		if (registryInfo.status === 0) {
			delete registryInfo.certification;
		}
		registryOptions.modifyData(registryInfo).then(function(info) {
			if (info) {
				$scope.registryInfo = info;
			}
		});
	};
	$scope.saveServer = function() {
		serverOptions.modifyData($scope.serverInfo).then(function(info) {
			if (info) {
				$scope.serverInfo = info;
			}
		});
	};
	$scope.saveMonitor = function() {
		monitorOptions.modifyData($scope.monitorIns.formartMonitor()).then(function(info) {
			if (info) {
				$scope.monitorIns.init(info);
			}
		});
	};
	$scope.saveSsh = function() {
		sshOptions.modifyData($scope.sshInfo).then(function(info) {
			if (info) {
				$scope.sshInfo = info;
			}
		});
	};
	$scope.saveCluster = function() {
		if ($scope.registryInfo.id) {
			delete($scope.clusterInfo.createTime);
			delete($scope.clusterInfo.lastUpdate);
		}
		clusterOptions.modifyData($scope.clusterInfo).then(function(info) {
			if (info) {
				$scope.clusterInfo = info;
			}
		});
	};
	
	var stateInfo = $state.$current.name;
	if (stateInfo.indexOf('ldapinfo') !== -1) {
		$scope.tabActive[1].active = true;
		$scope.getLdap();
	} else if (stateInfo.indexOf('gitinfo') !== -1) {
		$scope.tabActive[2].active = true;
		$scope.getGitInfo();
	} else if (stateInfo.indexOf('registryinfo') !== -1) {
		$scope.tabActive[3].active = true;
		$scope.getRegistryInfo();
	} else if (stateInfo.indexOf('serverinfo') !== -1) {
		$scope.tabActive[4].active = true;
		$scope.getServerInfo();
	} else if (stateInfo.indexOf('monitorinfo') !== -1) {
		$scope.tabActive[5].active = true;
		$scope.getMonitorInfo();
	} else if (stateInfo.indexOf('sshinfo') !== -1) {
		$scope.tabActive[6].active = true;
		$scope.getWebSsh();
	} else if (stateInfo.indexOf('clusterinfo') !== -1) {
		$scope.tabActive[7].active = true;
		$scope.getClusterInfo();
	} else {
		$scope.tabActive[0].active = true;
	}
}]).controller('newPasswdModalCtr', ['$scope', 'username', '$domeUser', '$modalInstance', '$domePublic', function($scope, username, $domeUser, $modalInstance, $domePublic) {
	$scope.cancel = function() {
		$modalInstance.dismiss();
	};
	$scope.subPw = function() {
		var userInfo = {
			username: username,
			password: $scope.passwd
		};
		$domeUser.modifyPw(userInfo).then(function() {
			$domePublic.openPrompt('修改成功！');
			$modalInstance.close();
		}, function(res) {
			$domePublic.openWarning('修改失败！');
		});
	};
}]);