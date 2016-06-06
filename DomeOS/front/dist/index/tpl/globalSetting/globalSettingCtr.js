'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
	domeApp.controller('GlobalSettingCtr', GlobalSettingCtr).controller('NewPasswdModalCtr', NewPasswdModalCtr);

	function GlobalSettingCtr($scope, $domeGlobal, $state, $domeUser, $domeCluster, $modal, $domePublic, $q) {
		'use strict';

		var vm = this;
		$scope.$emit('pageTitle', {
			title: '全局配置',
			descrition: '在这里您可以进行一些全局配置，保证domeos能够正常运行和使用。',
			mod: 'global'
		});
		$domeUser.getLoginUser().then(function (user) {
			if (user.username !== 'admin') {
				$state.go('projectManage');
			}
		});

		var ldapOptions = $domeGlobal.getGloabalInstance('ldap'),
		    serverOptions = $domeGlobal.getGloabalInstance('server'),
		    registryOptions = $domeGlobal.getGloabalInstance('registry'),
		    gitOptions = $domeGlobal.getGloabalInstance('git'),
		    monitorOptions = $domeGlobal.getGloabalInstance('monitor'),
		    sshOptions = $domeGlobal.getGloabalInstance('ssh'),
		    clusterOptions = $domeGlobal.getGloabalInstance('cluster'),
		    nodeService = $domeCluster.getInstance('NodeService');

		vm.serverInfo = {};
		vm.ldapInfo = {};
		vm.registryInfo = {};
		vm.gitInfo = {};
		vm.sshInfo = {};
		vm.clusterInfo = {};
		vm.newUser = {};
		vm.needValidUser = {
			valid: false
		};
		vm.key = {
			userKey: '',
			nodeKey: ''
		};
		vm.isShowAdd = false;
		vm.currentUserType = {
			// 'USER'(普通用户) or 'LDAP'
			type: 'USER'
		};
		// 普通用户列表
		vm.userList = [];
		// ldap用户列表
		vm.ldapUserList = [];

		vm.clusterLoadingIns = $domePublic.getLoadingInstance();
		vm.tabActive = [{
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

		var Monitor = function () {
			function Monitor() {
				_classCallCheck(this, Monitor);
			}

			_createClass(Monitor, [{
				key: 'init',
				value: function init(info) {
					this.config = info || {};

					function formartStrToObjArr(str) {
						var arr = [];
						var strArr = [];
						if (!str) {
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
					this.config.judge = formartStrToObjArr(this.config.judge);
				}
			}, {
				key: 'addItem',
				value: function addItem(item) {
					this.config[item].push({
						text: ''
					});
				}
			}, {
				key: 'deleteArrItem',
				value: function deleteArrItem(item, index) {
					this.config[item].splice(index, 1);
				}
			}, {
				key: 'formartMonitor',
				value: function formartMonitor() {
					var obj = angular.copy(this.config);

					var formartArrToStr = function formartArrToStr(monitorArr) {
						var strArr = [];
						for (var i = 0; i < monitorArr.length; i++) {
							if (monitorArr[i].text) {
								strArr.push(monitorArr[i].text);
							}
						}
						return strArr.join(',');
					};
					obj.transfer = formartArrToStr(this.config.transfer);
					obj.graph = formartArrToStr(this.config.graph);
					obj.judge = formartArrToStr(this.config.judge);
					return obj;
				}
			}]);

			return Monitor;
		}();

		$domeUser.userService.getUserList().then(function (res) {
			vm.userList = res.data.result || [];
		});

		var getClusterList = function getClusterList() {
			if (vm.clusterList) {
				$q.when(vm.clusterList);
			} else {
				return nodeService.getData().then(function (res) {
					vm.clusterList = res.data.result || [];
					return vm.clusterList;
				});
			}
		};
		vm.toggleUserType = function (userType) {
			if (userType !== vm.currentUserType) {
				vm.currentUserType.type = userType;
				vm.isShowAdd = false;
				vm.key.userKey = '';
			}
		};
		vm.toggleShowAdd = function () {
			vm.isShowAdd = !vm.isShowAdd;
		};
		vm.modifyPw = function (user) {
			$modal.open({
				templateUrl: 'newPasswdModal.html',
				controller: 'NewPasswdModalCtr as vmPw',
				size: 'md',
				resolve: {
					username: function username() {
						return user.username;
					}
				}
			});
		};

		vm.modifyUserInfo = function (user) {
			$domeUser.getLoginUser().then(function (loginUser) {
				var copyUserInfo = loginUser.id === user.id ? angular.copy(loginUser) : angular.copy(user);

				var modalInstance = $modal.open({
					templateUrl: 'modifyUserInfoModal.html',
					controller: 'ModifyUserInfoCtr',
					size: 'md',
					resolve: {
						user: function user() {
							return copyUserInfo;
						}
					}
				});
				modalInstance.result.then(function (userInfo) {
					angular.extend(user, userInfo);
					$domeUser.getLoginUser().then(function (loginUser) {
						if (loginUser.id === user.id) {
							angular.extend(loginUser, userInfo);
						}
					});
				});
			});
		};

		vm.deleteUser = function (user) {
			var id = user.id;
			$domePublic.openDelete().then(function () {
				$domeUser.userService.deleteUser(id).then(function () {
					for (var i = 0; i < vm.userList.length; i++) {
						if (vm.userList[i].id === id) {
							vm.userList.splice(i, 1);
							break;
						}
					}
				}, function () {
					$domePublic.openWarning('删除失败！');
				});
			});
		};

		vm.getLdap = function () {
			if (!vm.ldapInfo.id) {
				ldapOptions.getData().then(function (info) {
					var reg = /(.*):([^:]+)/g;
					vm.ldapInfo = info;
					vm.ldapInfo.url = vm.ldapInfo.server.replace(reg, '$1');
					vm.ldapInfo.port = vm.ldapInfo.server.replace(reg, '$2');
				});
			}
		};
		vm.getGitInfo = function () {
			if (!vm.gitInfo.id) {
				gitOptions.getData().then(function (gitInfos) {
					vm.gitInfo = gitInfos[0];
				});
			}
		};
		vm.getRegistryInfo = function () {
			if (!vm.registryInfo.id) {
				registryOptions.getData().then(function (info) {
					vm.registryInfo = info;
				});
			}
		};
		vm.getServerInfo = function () {
			if (!vm.serverInfo.id) {
				serverOptions.getData().then(function (info) {
					vm.serverInfo = info;
				});
			}
		};
		vm.getMonitorInfo = function () {
			function initMonitorInfo(info) {
				vm.monitorIns = new Monitor();
				vm.monitorIns.init(info);
				vm.monitorConfig = vm.monitorIns.config;
			}
			if (!vm.monitorConfig) {
				monitorOptions.getData().then(function (info) {
					initMonitorInfo(info);
				}, initMonitorInfo());
			}
		};
		vm.getWebSsh = function () {
			if (!vm.sshInfo.id) {
				sshOptions.getData().then(function (info) {
					vm.sshInfo = info;
				});
			}
		};
		// @param namespace: 可不填，有值时默认为该namespace
		vm.toggleCluster = function (cluster, namespace) {
			vm.clusterInfo.clusterId = cluster.id;
			vm.clusterInfo.clusterName = cluster.name;
			vm.clusterInfo.host = cluster.api;
			vm.key.nodeKey = '';
			vm.clusterLoadingIns.startLoading('namespace');
			vm.clusterLoadingIns.startLoading('nodeList');
			nodeService.getNamespace(cluster.id, cluster.name).then(function (res) {
				vm.namespaceList = res.data.result || [];
				if (namespace) {
					vm.clusterInfo.namespace = namespace;
				} else {
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = vm.namespaceList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var _namespace = _step.value;

							if (_namespace.name == 'default') {
								vm.clusterInfo.namespace = 'default';
								return;
							}
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

					vm.clusterInfo.namespace = vm.namespaceList[0] && vm.namespaceList[0].name;
				}
			}, function () {
				vm.namespaceList = [];
				vm.clusterInfo.namespace = null;
			}).finally(function () {
				vm.clusterLoadingIns.finishLoading('namespace');
			});
			nodeService.getNodeList(cluster.id).then(function (res) {
				var nodeList = res.data.result || [];
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = nodeList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var node = _step2.value;

						if (node.capacity) {
							node.capacity.memory = (node.capacity.memory / 1024 / 1024).toFixed(2);
						}
						if (!node.labels) {
							node.labels = {};
						}
						node.isUsedByBuild = node.labels.BUILDENV ? true : false;
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}

				vm.nodeList = nodeList;
			}).finally(function () {
				vm.clusterLoadingIns.finishLoading('nodeList');
			});
		};
		var toggleClusterInfo = function toggleClusterInfo(clusterInfo) {
			vm.clusterInfo = clusterInfo || {};
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = vm.clusterList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var cluster = _step3.value;

					if (cluster.api === vm.clusterInfo.host) {
						vm.toggleCluster(cluster, vm.clusterInfo.namespace);
						return;
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}
		};
		vm.initClusterInfo = function () {
			if (!vm.clusterInfo.id) {
				vm.clusterLoadingIns.startLoading('cluster');
				$q.all([getClusterList(), clusterOptions.getData()]).then(function (res) {
					toggleClusterInfo(res[1]);
				}).finally(function () {
					vm.clusterLoadingIns.finishLoading('cluster');
				});
			}
		};
		vm.addUser = function (form) {
			var newUser = angular.copy(vm.newUser);
			delete newUser.rePassword;

			$domeUser.userService.createUser(newUser).then(function (res) {
				$domePublic.openPrompt('创建成功！');
				var user = angular.copy(newUser);
				if (res.data.result) {
					vm.userList.push(res.data.result);
				}
				vm.newUser = {};
				vm.needValidUser.valid = false;
				form.$setPristine();
			}, function () {
				$domePublic.openWarning('创建失败！');
			});
		};
		vm.saveLdap = function () {
			var data = angular.copy(vm.ldapInfo);
			data.server = data.url + ':' + data.port;
			delete data.url;
			delete data.port;
			ldapOptions.modifyData(data).then(function () {
				vm.getLdap();
			});
		};
		vm.saveGit = function () {
			if (!vm.gitInfo.id) {
				vm.gitInfo.type = 'GITLAB';
			}
			gitOptions.modifyData(vm.gitInfo).then(function (info) {
				if (info) {
					vm.gitInfo = info;
				}
			});
		};
		vm.saveRegistry = function () {
			if (vm.registryInfo.id) {
				delete vm.registryInfo.id;
				delete vm.registryInfo.createTime;
			}
			var registryInfo = angular.copy(vm.registryInfo);
			if (registryInfo.status === 0) {
				delete registryInfo.certification;
			}
			registryOptions.modifyData(registryInfo).then(function (info) {
				if (info) {
					vm.registryInfo = info;
				}
			});
		};
		vm.saveServer = function () {
			serverOptions.modifyData(vm.serverInfo).then(function (info) {
				if (info) {
					vm.serverInfo = info;
				}
			});
		};
		vm.saveMonitor = function () {
			monitorOptions.modifyData(vm.monitorIns.formartMonitor()).then(function (info) {
				if (info) {
					vm.monitorIns.init(info);
					vm.monitorConfig = vm.monitorIns.config;
				}
			});
		};
		vm.saveSsh = function () {
			sshOptions.modifyData(vm.sshInfo).then(function (info) {
				if (info) {
					vm.sshInfo = info;
				}
			});
		};
		vm.saveCluster = function () {
			var clusterInfo = void 0,
			    nodeList = vm.nodeList,
			    addNodeLabelsInfo = [],
			    deleteNodeLabelsInfo = [];

			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = nodeList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var node = _step4.value;

					if (node.isUsedByBuild) {
						addNodeLabelsInfo.push({
							node: node.name,
							labels: {
								BUILDENV: 'HOSTENVTYPE'
							}
						});
					} else {
						deleteNodeLabelsInfo.push({
							node: node.name,
							labels: {
								BUILDENV: null
							}
						});
					}
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			if (addNodeLabelsInfo.length === 0) {
				$domePublic.openWarning('请至少设置一台用于构建的主机！');
				return;
			}

			vm.clusterLoadingIns.startLoading('submitCluster');
			clusterOptions.modifyData(vm.clusterInfo).then(function (info) {
				clusterInfo = info;
			}).then(function () {
				return nodeService.addLabel(vm.clusterInfo.clusterId, addNodeLabelsInfo).then(function () {
					return true;
				}, function (res) {
					$domePublic.openWarning({
						title: '错误！',
						msg: res.data.resultMsg
					});
					return $q.reject();
				});
			}).then(function () {
				if (deleteNodeLabelsInfo.length !== 0) {
					return nodeService.deleteLabel(vm.clusterInfo.clusterId, deleteNodeLabelsInfo).catch(function (res) {
						$domePublic.openWarning({
							title: '错误！',
							msg: res.data.resultMsg
						});
						return $q.reject();
					});
				}
			}).finally(function () {
				toggleClusterInfo(clusterInfo);
				vm.clusterLoadingIns.finishLoading('submitCluster');
			});
		};

		var stateInfo = $state.$current.name;
		if (stateInfo.indexOf('ldapinfo') !== -1) {
			vm.tabActive[1].active = true;
			vm.getLdap();
		} else if (stateInfo.indexOf('gitinfo') !== -1) {
			vm.tabActive[2].active = true;
			vm.getGitInfo();
		} else if (stateInfo.indexOf('registryinfo') !== -1) {
			vm.tabActive[3].active = true;
			vm.getRegistryInfo();
		} else if (stateInfo.indexOf('serverinfo') !== -1) {
			vm.tabActive[4].active = true;
			vm.getServerInfo();
		} else if (stateInfo.indexOf('monitorinfo') !== -1) {
			vm.tabActive[5].active = true;
			vm.getMonitorInfo();
		} else if (stateInfo.indexOf('sshinfo') !== -1) {
			vm.tabActive[6].active = true;
			vm.getWebSsh();
		} else if (stateInfo.indexOf('clusterinfo') !== -1) {
			vm.tabActive[7].active = true;
			vm.initClusterInfo();
		} else {
			vm.tabActive[0].active = true;
		}
	}
	GlobalSettingCtr.$inject = ['$scope', '$domeGlobal', '$state', '$domeUser', '$domeCluster', '$modal', '$domePublic', '$q'];

	function NewPasswdModalCtr(username, $domeUser, $modalInstance, $domePublic) {
		var vm = this;
		vm.cancel = function () {
			$modalInstance.dismiss();
		};
		vm.subPw = function () {
			var userInfo = {
				username: username,
				password: vm.passwd
			};
			$domeUser.userService.modifyPw(userInfo).then(function () {
				$domePublic.openPrompt('修改成功！');
				$modalInstance.close();
			}, function () {
				$domePublic.openWarning('修改失败！');
			});
		};
	}
	NewPasswdModalCtr.$inject = ['username', '$domeUser', '$modalInstance', '$domePublic'];
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L3RwbC9nbG9iYWxTZXR0aW5nL2dsb2JhbFNldHRpbmdDdHIuZXMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsQ0FBQyxZQUFZO0FBQ1osU0FBUSxVQUFSLENBQW1CLGtCQUFuQixFQUF1QyxnQkFBdkMsRUFDRSxVQURGLENBQ2EsbUJBRGIsRUFDa0MsaUJBRGxDLEVBRFk7O0FBSVosVUFBUyxnQkFBVCxDQUEwQixNQUExQixFQUFrQyxXQUFsQyxFQUErQyxNQUEvQyxFQUF1RCxTQUF2RCxFQUFrRSxZQUFsRSxFQUFnRixNQUFoRixFQUF3RixXQUF4RixFQUFxRyxFQUFyRyxFQUF5RztBQUN4RyxlQUR3Rzs7QUFFeEcsTUFBSSxLQUFLLElBQUwsQ0FGb0c7QUFHeEcsU0FBTyxLQUFQLENBQWEsV0FBYixFQUEwQjtBQUN6QixVQUFPLE1BQVA7QUFDQSxlQUFZLG1DQUFaO0FBQ0EsUUFBSyxRQUFMO0dBSEQsRUFId0c7QUFReEcsWUFBVSxZQUFWLEdBQXlCLElBQXpCLENBQThCLFVBQUMsSUFBRCxFQUFVO0FBQ3ZDLE9BQUksS0FBSyxRQUFMLEtBQWtCLE9BQWxCLEVBQTJCO0FBQzlCLFdBQU8sRUFBUCxDQUFVLGVBQVYsRUFEOEI7SUFBL0I7R0FENkIsQ0FBOUIsQ0FSd0c7O0FBY3hHLE1BQU0sY0FBYyxZQUFZLGtCQUFaLENBQStCLE1BQS9CLENBQWQ7TUFDTCxnQkFBZ0IsWUFBWSxrQkFBWixDQUErQixRQUEvQixDQUFoQjtNQUNBLGtCQUFrQixZQUFZLGtCQUFaLENBQStCLFVBQS9CLENBQWxCO01BQ0EsYUFBYSxZQUFZLGtCQUFaLENBQStCLEtBQS9CLENBQWI7TUFDQSxpQkFBaUIsWUFBWSxrQkFBWixDQUErQixTQUEvQixDQUFqQjtNQUNBLGFBQWEsWUFBWSxrQkFBWixDQUErQixLQUEvQixDQUFiO01BQ0EsaUJBQWlCLFlBQVksa0JBQVosQ0FBK0IsU0FBL0IsQ0FBakI7TUFDQSxjQUFjLGFBQWEsV0FBYixDQUF5QixhQUF6QixDQUFkLENBckJ1Rzs7QUF1QnhHLEtBQUcsVUFBSCxHQUFnQixFQUFoQixDQXZCd0c7QUF3QnhHLEtBQUcsUUFBSCxHQUFjLEVBQWQsQ0F4QndHO0FBeUJ4RyxLQUFHLFlBQUgsR0FBa0IsRUFBbEIsQ0F6QndHO0FBMEJ4RyxLQUFHLE9BQUgsR0FBYSxFQUFiLENBMUJ3RztBQTJCeEcsS0FBRyxPQUFILEdBQWEsRUFBYixDQTNCd0c7QUE0QnhHLEtBQUcsV0FBSCxHQUFpQixFQUFqQixDQTVCd0c7QUE2QnhHLEtBQUcsT0FBSCxHQUFhLEVBQWIsQ0E3QndHO0FBOEJ4RyxLQUFHLGFBQUgsR0FBbUI7QUFDbEIsVUFBTyxLQUFQO0dBREQsQ0E5QndHO0FBaUN4RyxLQUFHLEdBQUgsR0FBUztBQUNSLFlBQVMsRUFBVDtBQUNBLFlBQVMsRUFBVDtHQUZELENBakN3RztBQXFDeEcsS0FBRyxTQUFILEdBQWUsS0FBZixDQXJDd0c7QUFzQ3hHLEtBQUcsZUFBSCxHQUFxQjs7QUFFcEIsU0FBTSxNQUFOO0dBRkQ7O0FBdEN3RyxJQTJDeEcsQ0FBRyxRQUFILEdBQWMsRUFBZDs7QUEzQ3dHLElBNkN4RyxDQUFHLFlBQUgsR0FBa0IsRUFBbEIsQ0E3Q3dHOztBQStDeEcsS0FBRyxpQkFBSCxHQUF1QixZQUFZLGtCQUFaLEVBQXZCLENBL0N3RztBQWdEeEcsS0FBRyxTQUFILEdBQWUsQ0FBQztBQUNmLFdBQVEsS0FBUjtHQURjLEVBRVo7QUFDRixXQUFRLEtBQVI7R0FIYyxFQUlaO0FBQ0YsV0FBUSxLQUFSO0dBTGMsRUFNWjtBQUNGLFdBQVEsS0FBUjtHQVBjLEVBUVo7QUFDRixXQUFRLEtBQVI7R0FUYyxFQVVaO0FBQ0YsV0FBUSxLQUFSO0dBWGMsRUFZWjtBQUNGLFdBQVEsS0FBUjtHQWJjLEVBY1o7QUFDRixXQUFRLEtBQVI7R0FmYyxDQUFmLENBaER3Rzs7TUFtRWxHOzs7Ozs7O3lCQUNBLE1BQU07QUFDVixVQUFLLE1BQUwsR0FBYyxRQUFRLEVBQVIsQ0FESjs7QUFHVixjQUFTLGtCQUFULENBQTRCLEdBQTVCLEVBQWlDO0FBQ2hDLFVBQUksTUFBTSxFQUFOLENBRDRCO0FBRWhDLFVBQUksU0FBUyxFQUFULENBRjRCO0FBR2hDLFVBQUksQ0FBQyxHQUFELEVBQU07QUFDVCxjQUFPLENBQUM7QUFDUCxjQUFNLEVBQU47UUFETSxDQUFQLENBRFM7T0FBVjtBQUtBLGVBQVMsSUFBSSxLQUFKLENBQVUsR0FBVixDQUFULENBUmdDO0FBU2hDLFdBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLE9BQU8sTUFBUCxFQUFlLEdBQW5DLEVBQXdDO0FBQ3ZDLFdBQUksSUFBSixDQUFTO0FBQ1IsY0FBTSxPQUFPLENBQVAsQ0FBTjtRQURELEVBRHVDO09BQXhDO0FBS0EsVUFBSSxJQUFKLENBQVM7QUFDUixhQUFNLEVBQU47T0FERCxFQWRnQztBQWlCaEMsYUFBTyxHQUFQLENBakJnQztNQUFqQztBQW1CQSxVQUFLLE1BQUwsQ0FBWSxRQUFaLEdBQXVCLG1CQUFtQixLQUFLLE1BQUwsQ0FBWSxRQUFaLENBQTFDLENBdEJVO0FBdUJWLFVBQUssTUFBTCxDQUFZLEtBQVosR0FBb0IsbUJBQW1CLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBdkMsQ0F2QlU7QUF3QlYsVUFBSyxNQUFMLENBQVksS0FBWixHQUFvQixtQkFBbUIsS0FBSyxNQUFMLENBQVksS0FBWixDQUF2QyxDQXhCVTs7Ozs0QkEwQkgsTUFBTTtBQUNiLFVBQUssTUFBTCxDQUFZLElBQVosRUFBa0IsSUFBbEIsQ0FBdUI7QUFDdEIsWUFBTSxFQUFOO01BREQsRUFEYTs7OztrQ0FLQSxNQUFNLE9BQU87QUFDMUIsVUFBSyxNQUFMLENBQVksSUFBWixFQUFrQixNQUFsQixDQUF5QixLQUF6QixFQUFnQyxDQUFoQyxFQUQwQjs7OztxQ0FHVjtBQUNoQixTQUFJLE1BQU0sUUFBUSxJQUFSLENBQWEsS0FBSyxNQUFMLENBQW5CLENBRFk7O0FBR2hCLFNBQU0sa0JBQWtCLFNBQWxCLGVBQWtCLENBQUMsVUFBRCxFQUFnQjtBQUN2QyxVQUFJLFNBQVMsRUFBVCxDQURtQztBQUV2QyxXQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxXQUFXLE1BQVgsRUFBbUIsR0FBdkMsRUFBNEM7QUFDM0MsV0FBSSxXQUFXLENBQVgsRUFBYyxJQUFkLEVBQW9CO0FBQ3ZCLGVBQU8sSUFBUCxDQUFZLFdBQVcsQ0FBWCxFQUFjLElBQWQsQ0FBWixDQUR1QjtRQUF4QjtPQUREO0FBS0EsYUFBTyxPQUFPLElBQVAsQ0FBWSxHQUFaLENBQVAsQ0FQdUM7TUFBaEIsQ0FIUjtBQVloQixTQUFJLFFBQUosR0FBZSxnQkFBZ0IsS0FBSyxNQUFMLENBQVksUUFBWixDQUEvQixDQVpnQjtBQWFoQixTQUFJLEtBQUosR0FBWSxnQkFBZ0IsS0FBSyxNQUFMLENBQVksS0FBWixDQUE1QixDQWJnQjtBQWNoQixTQUFJLEtBQUosR0FBWSxnQkFBZ0IsS0FBSyxNQUFMLENBQVksS0FBWixDQUE1QixDQWRnQjtBQWVoQixZQUFPLEdBQVAsQ0FmZ0I7Ozs7VUFuQ1o7TUFuRWtHOztBQXlIeEcsWUFBVSxXQUFWLENBQXNCLFdBQXRCLEdBQW9DLElBQXBDLENBQXlDLFVBQVUsR0FBVixFQUFlO0FBQ3ZELE1BQUcsUUFBSCxHQUFjLElBQUksSUFBSixDQUFTLE1BQVQsSUFBbUIsRUFBbkIsQ0FEeUM7R0FBZixDQUF6QyxDQXpId0c7O0FBNkh4RyxNQUFNLGlCQUFpQixTQUFqQixjQUFpQixHQUFNO0FBQzVCLE9BQUksR0FBRyxXQUFILEVBQWdCO0FBQ25CLE9BQUcsSUFBSCxDQUFRLEdBQUcsV0FBSCxDQUFSLENBRG1CO0lBQXBCLE1BRU87QUFDTixXQUFPLFlBQVksT0FBWixHQUFzQixJQUF0QixDQUEyQixVQUFDLEdBQUQsRUFBUztBQUMxQyxRQUFHLFdBQUgsR0FBaUIsSUFBSSxJQUFKLENBQVMsTUFBVCxJQUFtQixFQUFuQixDQUR5QjtBQUUxQyxZQUFPLEdBQUcsV0FBSCxDQUZtQztLQUFULENBQWxDLENBRE07SUFGUDtHQURzQixDQTdIaUY7QUF1SXhHLEtBQUcsY0FBSCxHQUFvQixVQUFDLFFBQUQsRUFBYztBQUNqQyxPQUFJLGFBQWEsR0FBRyxlQUFILEVBQW9CO0FBQ3BDLE9BQUcsZUFBSCxDQUFtQixJQUFuQixHQUEwQixRQUExQixDQURvQztBQUVwQyxPQUFHLFNBQUgsR0FBZSxLQUFmLENBRm9DO0FBR3BDLE9BQUcsR0FBSCxDQUFPLE9BQVAsR0FBaUIsRUFBakIsQ0FIb0M7SUFBckM7R0FEbUIsQ0F2SW9GO0FBOEl4RyxLQUFHLGFBQUgsR0FBbUIsWUFBTTtBQUN4QixNQUFHLFNBQUgsR0FBZSxDQUFDLEdBQUcsU0FBSCxDQURRO0dBQU4sQ0E5SXFGO0FBaUp4RyxLQUFHLFFBQUgsR0FBYyxVQUFDLElBQUQsRUFBVTtBQUN2QixVQUFPLElBQVAsQ0FBWTtBQUNYLGlCQUFhLHFCQUFiO0FBQ0EsZ0JBQVksMkJBQVo7QUFDQSxVQUFNLElBQU47QUFDQSxhQUFTO0FBQ1IsZUFBVSxvQkFBWTtBQUNyQixhQUFPLEtBQUssUUFBTCxDQURjO01BQVo7S0FEWDtJQUpELEVBRHVCO0dBQVYsQ0FqSjBGOztBQStKeEcsS0FBRyxjQUFILEdBQW9CLFVBQUMsSUFBRCxFQUFVO0FBQzdCLGFBQVUsWUFBVixHQUF5QixJQUF6QixDQUE4QixVQUFDLFNBQUQsRUFBZTtBQUM1QyxRQUFJLGVBQWUsVUFBVSxFQUFWLEtBQWlCLEtBQUssRUFBTCxHQUFVLFFBQVEsSUFBUixDQUFhLFNBQWIsQ0FBM0IsR0FBcUQsUUFBUSxJQUFSLENBQWEsSUFBYixDQUFyRCxDQUR5Qjs7QUFHNUMsUUFBTSxnQkFBZ0IsT0FBTyxJQUFQLENBQVk7QUFDakMsa0JBQWEsMEJBQWI7QUFDQSxpQkFBWSxtQkFBWjtBQUNBLFdBQU0sSUFBTjtBQUNBLGNBQVM7QUFDUixZQUFNLGdCQUFZO0FBQ2pCLGNBQU8sWUFBUCxDQURpQjtPQUFaO01BRFA7S0FKcUIsQ0FBaEIsQ0FIc0M7QUFhNUMsa0JBQWMsTUFBZCxDQUFxQixJQUFyQixDQUEwQixVQUFDLFFBQUQsRUFBYztBQUN2QyxhQUFRLE1BQVIsQ0FBZSxJQUFmLEVBQXFCLFFBQXJCLEVBRHVDO0FBRXZDLGVBQVUsWUFBVixHQUF5QixJQUF6QixDQUE4QixVQUFVLFNBQVYsRUFBcUI7QUFDbEQsVUFBSSxVQUFVLEVBQVYsS0FBaUIsS0FBSyxFQUFMLEVBQVM7QUFDN0IsZUFBUSxNQUFSLENBQWUsU0FBZixFQUEwQixRQUExQixFQUQ2QjtPQUE5QjtNQUQ2QixDQUE5QixDQUZ1QztLQUFkLENBQTFCLENBYjRDO0lBQWYsQ0FBOUIsQ0FENkI7R0FBVixDQS9Kb0Y7O0FBd0x4RyxLQUFHLFVBQUgsR0FBZ0IsVUFBQyxJQUFELEVBQVU7QUFDekIsT0FBSSxLQUFLLEtBQUssRUFBTCxDQURnQjtBQUV6QixlQUFZLFVBQVosR0FBeUIsSUFBekIsQ0FBOEIsWUFBTTtBQUNuQyxjQUFVLFdBQVYsQ0FBc0IsVUFBdEIsQ0FBaUMsRUFBakMsRUFBcUMsSUFBckMsQ0FBMEMsWUFBTTtBQUMvQyxVQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxHQUFHLFFBQUgsQ0FBWSxNQUFaLEVBQW9CLEdBQXhDLEVBQTZDO0FBQzVDLFVBQUksR0FBRyxRQUFILENBQVksQ0FBWixFQUFlLEVBQWYsS0FBc0IsRUFBdEIsRUFBMEI7QUFDN0IsVUFBRyxRQUFILENBQVksTUFBWixDQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUQ2QjtBQUU3QixhQUY2QjtPQUE5QjtNQUREO0tBRHlDLEVBT3ZDLFlBQU07QUFDUixpQkFBWSxXQUFaLENBQXdCLE9BQXhCLEVBRFE7S0FBTixDQVBILENBRG1DO0lBQU4sQ0FBOUIsQ0FGeUI7R0FBVixDQXhMd0Y7O0FBd014RyxLQUFHLE9BQUgsR0FBYSxZQUFNO0FBQ2xCLE9BQUksQ0FBQyxHQUFHLFFBQUgsQ0FBWSxFQUFaLEVBQWdCO0FBQ3BCLGdCQUFZLE9BQVosR0FBc0IsSUFBdEIsQ0FBMkIsVUFBVSxJQUFWLEVBQWdCO0FBQzFDLFNBQUksTUFBTSxlQUFOLENBRHNDO0FBRTFDLFFBQUcsUUFBSCxHQUFjLElBQWQsQ0FGMEM7QUFHMUMsUUFBRyxRQUFILENBQVksR0FBWixHQUFrQixHQUFHLFFBQUgsQ0FBWSxNQUFaLENBQW1CLE9BQW5CLENBQTJCLEdBQTNCLEVBQWdDLElBQWhDLENBQWxCLENBSDBDO0FBSTFDLFFBQUcsUUFBSCxDQUFZLElBQVosR0FBbUIsR0FBRyxRQUFILENBQVksTUFBWixDQUFtQixPQUFuQixDQUEyQixHQUEzQixFQUFnQyxJQUFoQyxDQUFuQixDQUowQztLQUFoQixDQUEzQixDQURvQjtJQUFyQjtHQURZLENBeE0yRjtBQWtOeEcsS0FBRyxVQUFILEdBQWdCLFlBQU07QUFDckIsT0FBSSxDQUFDLEdBQUcsT0FBSCxDQUFXLEVBQVgsRUFBZTtBQUNuQixlQUFXLE9BQVgsR0FBcUIsSUFBckIsQ0FBMEIsVUFBVSxRQUFWLEVBQW9CO0FBQzdDLFFBQUcsT0FBSCxHQUFhLFNBQVMsQ0FBVCxDQUFiLENBRDZDO0tBQXBCLENBQTFCLENBRG1CO0lBQXBCO0dBRGUsQ0FsTndGO0FBeU54RyxLQUFHLGVBQUgsR0FBcUIsWUFBTTtBQUMxQixPQUFJLENBQUMsR0FBRyxZQUFILENBQWdCLEVBQWhCLEVBQW9CO0FBQ3hCLG9CQUFnQixPQUFoQixHQUEwQixJQUExQixDQUErQixVQUFVLElBQVYsRUFBZ0I7QUFDOUMsUUFBRyxZQUFILEdBQWtCLElBQWxCLENBRDhDO0tBQWhCLENBQS9CLENBRHdCO0lBQXpCO0dBRG9CLENBek5tRjtBQWdPeEcsS0FBRyxhQUFILEdBQW1CLFlBQU07QUFDeEIsT0FBSSxDQUFDLEdBQUcsVUFBSCxDQUFjLEVBQWQsRUFBa0I7QUFDdEIsa0JBQWMsT0FBZCxHQUF3QixJQUF4QixDQUE2QixVQUFVLElBQVYsRUFBZ0I7QUFDNUMsUUFBRyxVQUFILEdBQWdCLElBQWhCLENBRDRDO0tBQWhCLENBQTdCLENBRHNCO0lBQXZCO0dBRGtCLENBaE9xRjtBQXVPeEcsS0FBRyxjQUFILEdBQW9CLFlBQU07QUFDekIsWUFBUyxlQUFULENBQXlCLElBQXpCLEVBQStCO0FBQzlCLE9BQUcsVUFBSCxHQUFnQixJQUFJLE9BQUosRUFBaEIsQ0FEOEI7QUFFOUIsT0FBRyxVQUFILENBQWMsSUFBZCxDQUFtQixJQUFuQixFQUY4QjtBQUc5QixPQUFHLGFBQUgsR0FBbUIsR0FBRyxVQUFILENBQWMsTUFBZCxDQUhXO0lBQS9CO0FBS0EsT0FBSSxDQUFDLEdBQUcsYUFBSCxFQUFrQjtBQUN0QixtQkFBZSxPQUFmLEdBQXlCLElBQXpCLENBQThCLFVBQVUsSUFBVixFQUFnQjtBQUM3QyxxQkFBZ0IsSUFBaEIsRUFENkM7S0FBaEIsRUFFM0IsaUJBRkgsRUFEc0I7SUFBdkI7R0FObUIsQ0F2T29GO0FBbVB4RyxLQUFHLFNBQUgsR0FBZSxZQUFNO0FBQ3BCLE9BQUksQ0FBQyxHQUFHLE9BQUgsQ0FBVyxFQUFYLEVBQWU7QUFDbkIsZUFBVyxPQUFYLEdBQXFCLElBQXJCLENBQTBCLFVBQVUsSUFBVixFQUFnQjtBQUN6QyxRQUFHLE9BQUgsR0FBYSxJQUFiLENBRHlDO0tBQWhCLENBQTFCLENBRG1CO0lBQXBCO0dBRGM7O0FBblB5RixJQTJQeEcsQ0FBRyxhQUFILEdBQW1CLFVBQUMsT0FBRCxFQUFVLFNBQVYsRUFBd0I7QUFDMUMsTUFBRyxXQUFILENBQWUsU0FBZixHQUEyQixRQUFRLEVBQVIsQ0FEZTtBQUUxQyxNQUFHLFdBQUgsQ0FBZSxXQUFmLEdBQTZCLFFBQVEsSUFBUixDQUZhO0FBRzFDLE1BQUcsV0FBSCxDQUFlLElBQWYsR0FBc0IsUUFBUSxHQUFSLENBSG9CO0FBSTFDLE1BQUcsR0FBSCxDQUFPLE9BQVAsR0FBaUIsRUFBakIsQ0FKMEM7QUFLMUMsTUFBRyxpQkFBSCxDQUFxQixZQUFyQixDQUFrQyxXQUFsQyxFQUwwQztBQU0xQyxNQUFHLGlCQUFILENBQXFCLFlBQXJCLENBQWtDLFVBQWxDLEVBTjBDO0FBTzFDLGVBQVksWUFBWixDQUF5QixRQUFRLEVBQVIsRUFBWSxRQUFRLElBQVIsQ0FBckMsQ0FBbUQsSUFBbkQsQ0FBd0QsVUFBQyxHQUFELEVBQVM7QUFDaEUsT0FBRyxhQUFILEdBQW1CLElBQUksSUFBSixDQUFTLE1BQVQsSUFBbUIsRUFBbkIsQ0FENkM7QUFFaEUsUUFBSSxTQUFKLEVBQWU7QUFDZCxRQUFHLFdBQUgsQ0FBZSxTQUFmLEdBQTJCLFNBQTNCLENBRGM7S0FBZixNQUVPOzs7Ozs7QUFDTiwyQkFBc0IsR0FBRyxhQUFILDBCQUF0QixvR0FBd0M7V0FBL0IseUJBQStCOztBQUN2QyxXQUFJLFdBQVUsSUFBVixJQUFrQixTQUFsQixFQUE2QjtBQUNoQyxXQUFHLFdBQUgsQ0FBZSxTQUFmLEdBQTJCLFNBQTNCLENBRGdDO0FBRWhDLGVBRmdDO1FBQWpDO09BREQ7Ozs7Ozs7Ozs7Ozs7O01BRE07O0FBT04sUUFBRyxXQUFILENBQWUsU0FBZixHQUEyQixHQUFHLGFBQUgsQ0FBaUIsQ0FBakIsS0FBdUIsR0FBRyxhQUFILENBQWlCLENBQWpCLEVBQW9CLElBQXBCLENBUDVDO0tBRlA7SUFGdUQsRUFhckQsWUFBTTtBQUNSLE9BQUcsYUFBSCxHQUFtQixFQUFuQixDQURRO0FBRVIsT0FBRyxXQUFILENBQWUsU0FBZixHQUEyQixJQUEzQixDQUZRO0lBQU4sQ0FiSCxDQWdCRyxPQWhCSCxDQWdCVyxZQUFNO0FBQ2hCLE9BQUcsaUJBQUgsQ0FBcUIsYUFBckIsQ0FBbUMsV0FBbkMsRUFEZ0I7SUFBTixDQWhCWCxDQVAwQztBQTBCMUMsZUFBWSxXQUFaLENBQXdCLFFBQVEsRUFBUixDQUF4QixDQUFvQyxJQUFwQyxDQUF5QyxVQUFDLEdBQUQsRUFBUztBQUNqRCxRQUFJLFdBQVcsSUFBSSxJQUFKLENBQVMsTUFBVCxJQUFtQixFQUFuQixDQURrQzs7Ozs7O0FBRWpELDJCQUFpQixtQ0FBakIsd0dBQTJCO1VBQWxCLG9CQUFrQjs7QUFDMUIsVUFBSSxLQUFLLFFBQUwsRUFBZTtBQUNsQixZQUFLLFFBQUwsQ0FBYyxNQUFkLEdBQXVCLENBQUMsS0FBSyxRQUFMLENBQWMsTUFBZCxHQUF1QixJQUF2QixHQUE4QixJQUE5QixDQUFELENBQXFDLE9BQXJDLENBQTZDLENBQTdDLENBQXZCLENBRGtCO09BQW5CO0FBR0EsVUFBSSxDQUFDLEtBQUssTUFBTCxFQUFhO0FBQ2pCLFlBQUssTUFBTCxHQUFjLEVBQWQsQ0FEaUI7T0FBbEI7QUFHQSxXQUFLLGFBQUwsR0FBcUIsS0FBSyxNQUFMLENBQVksUUFBWixHQUF1QixJQUF2QixHQUE4QixLQUE5QixDQVBLO01BQTNCOzs7Ozs7Ozs7Ozs7OztLQUZpRDs7QUFXakQsT0FBRyxRQUFILEdBQWMsUUFBZCxDQVhpRDtJQUFULENBQXpDLENBWUcsT0FaSCxDQVlXLFlBQU07QUFDaEIsT0FBRyxpQkFBSCxDQUFxQixhQUFyQixDQUFtQyxVQUFuQyxFQURnQjtJQUFOLENBWlgsQ0ExQjBDO0dBQXhCLENBM1BxRjtBQXFTeEcsTUFBTSxvQkFBb0IsU0FBcEIsaUJBQW9CLENBQUMsV0FBRCxFQUFpQjtBQUMxQyxNQUFHLFdBQUgsR0FBaUIsZUFBZSxFQUFmLENBRHlCOzs7Ozs7QUFFMUMsMEJBQW9CLEdBQUcsV0FBSCwyQkFBcEIsd0dBQW9DO1NBQTNCLHVCQUEyQjs7QUFDbkMsU0FBSSxRQUFRLEdBQVIsS0FBZ0IsR0FBRyxXQUFILENBQWUsSUFBZixFQUFxQjtBQUN4QyxTQUFHLGFBQUgsQ0FBaUIsT0FBakIsRUFBMEIsR0FBRyxXQUFILENBQWUsU0FBZixDQUExQixDQUR3QztBQUV4QyxhQUZ3QztNQUF6QztLQUREOzs7Ozs7Ozs7Ozs7OztJQUYwQztHQUFqQixDQXJTOEU7QUE4U3hHLEtBQUcsZUFBSCxHQUFxQixZQUFNO0FBQzFCLE9BQUksQ0FBQyxHQUFHLFdBQUgsQ0FBZSxFQUFmLEVBQW1CO0FBQ3ZCLE9BQUcsaUJBQUgsQ0FBcUIsWUFBckIsQ0FBa0MsU0FBbEMsRUFEdUI7QUFFdkIsT0FBRyxHQUFILENBQU8sQ0FBQyxnQkFBRCxFQUFtQixlQUFlLE9BQWYsRUFBbkIsQ0FBUCxFQUFxRCxJQUFyRCxDQUEwRCxVQUFVLEdBQVYsRUFBZTtBQUN4RSx1QkFBa0IsSUFBSSxDQUFKLENBQWxCLEVBRHdFO0tBQWYsQ0FBMUQsQ0FFRyxPQUZILENBRVcsWUFBTTtBQUNoQixRQUFHLGlCQUFILENBQXFCLGFBQXJCLENBQW1DLFNBQW5DLEVBRGdCO0tBQU4sQ0FGWCxDQUZ1QjtJQUF4QjtHQURvQixDQTlTbUY7QUF3VHhHLEtBQUcsT0FBSCxHQUFhLFVBQUMsSUFBRCxFQUFVO0FBQ3RCLE9BQUksVUFBVSxRQUFRLElBQVIsQ0FBYSxHQUFHLE9BQUgsQ0FBdkIsQ0FEa0I7QUFFdEIsVUFBTyxRQUFRLFVBQVIsQ0FGZTs7QUFJdEIsYUFBVSxXQUFWLENBQXNCLFVBQXRCLENBQWlDLE9BQWpDLEVBQTBDLElBQTFDLENBQStDLFVBQVUsR0FBVixFQUFlO0FBQzdELGdCQUFZLFVBQVosQ0FBdUIsT0FBdkIsRUFENkQ7QUFFN0QsUUFBSSxPQUFPLFFBQVEsSUFBUixDQUFhLE9BQWIsQ0FBUCxDQUZ5RDtBQUc3RCxRQUFJLElBQUksSUFBSixDQUFTLE1BQVQsRUFBaUI7QUFDcEIsUUFBRyxRQUFILENBQVksSUFBWixDQUFpQixJQUFJLElBQUosQ0FBUyxNQUFULENBQWpCLENBRG9CO0tBQXJCO0FBR0EsT0FBRyxPQUFILEdBQWEsRUFBYixDQU42RDtBQU83RCxPQUFHLGFBQUgsQ0FBaUIsS0FBakIsR0FBeUIsS0FBekIsQ0FQNkQ7QUFRN0QsU0FBSyxZQUFMLEdBUjZEO0lBQWYsRUFTNUMsWUFBWTtBQUNkLGdCQUFZLFdBQVosQ0FBd0IsT0FBeEIsRUFEYztJQUFaLENBVEgsQ0FKc0I7R0FBVixDQXhUMkY7QUF5VXhHLEtBQUcsUUFBSCxHQUFjLFlBQU07QUFDbkIsT0FBSSxPQUFPLFFBQVEsSUFBUixDQUFhLEdBQUcsUUFBSCxDQUFwQixDQURlO0FBRW5CLFFBQUssTUFBTCxHQUFjLEtBQUssR0FBTCxHQUFXLEdBQVgsR0FBaUIsS0FBSyxJQUFMLENBRlo7QUFHbkIsVUFBTyxLQUFLLEdBQUwsQ0FIWTtBQUluQixVQUFPLEtBQUssSUFBTCxDQUpZO0FBS25CLGVBQVksVUFBWixDQUF1QixJQUF2QixFQUE2QixJQUE3QixDQUFrQyxZQUFZO0FBQzdDLE9BQUcsT0FBSCxHQUQ2QztJQUFaLENBQWxDLENBTG1CO0dBQU4sQ0F6VTBGO0FBa1Z4RyxLQUFHLE9BQUgsR0FBYSxZQUFNO0FBQ2xCLE9BQUksQ0FBQyxHQUFHLE9BQUgsQ0FBVyxFQUFYLEVBQWU7QUFDbkIsT0FBRyxPQUFILENBQVcsSUFBWCxHQUFrQixRQUFsQixDQURtQjtJQUFwQjtBQUdBLGNBQVcsVUFBWCxDQUFzQixHQUFHLE9BQUgsQ0FBdEIsQ0FBa0MsSUFBbEMsQ0FBdUMsVUFBVSxJQUFWLEVBQWdCO0FBQ3RELFFBQUksSUFBSixFQUFVO0FBQ1QsUUFBRyxPQUFILEdBQWEsSUFBYixDQURTO0tBQVY7SUFEc0MsQ0FBdkMsQ0FKa0I7R0FBTixDQWxWMkY7QUE0VnhHLEtBQUcsWUFBSCxHQUFrQixZQUFNO0FBQ3ZCLE9BQUksR0FBRyxZQUFILENBQWdCLEVBQWhCLEVBQW9CO0FBQ3ZCLFdBQU8sR0FBRyxZQUFILENBQWdCLEVBQWhCLENBRGdCO0FBRXZCLFdBQU8sR0FBRyxZQUFILENBQWdCLFVBQWhCLENBRmdCO0lBQXhCO0FBSUEsT0FBSSxlQUFlLFFBQVEsSUFBUixDQUFhLEdBQUcsWUFBSCxDQUE1QixDQUxtQjtBQU12QixPQUFJLGFBQWEsTUFBYixLQUF3QixDQUF4QixFQUEyQjtBQUM5QixXQUFPLGFBQWEsYUFBYixDQUR1QjtJQUEvQjtBQUdBLG1CQUFnQixVQUFoQixDQUEyQixZQUEzQixFQUF5QyxJQUF6QyxDQUE4QyxVQUFVLElBQVYsRUFBZ0I7QUFDN0QsUUFBSSxJQUFKLEVBQVU7QUFDVCxRQUFHLFlBQUgsR0FBa0IsSUFBbEIsQ0FEUztLQUFWO0lBRDZDLENBQTlDLENBVHVCO0dBQU4sQ0E1VnNGO0FBMld4RyxLQUFHLFVBQUgsR0FBZ0IsWUFBTTtBQUNyQixpQkFBYyxVQUFkLENBQXlCLEdBQUcsVUFBSCxDQUF6QixDQUF3QyxJQUF4QyxDQUE2QyxVQUFVLElBQVYsRUFBZ0I7QUFDNUQsUUFBSSxJQUFKLEVBQVU7QUFDVCxRQUFHLFVBQUgsR0FBZ0IsSUFBaEIsQ0FEUztLQUFWO0lBRDRDLENBQTdDLENBRHFCO0dBQU4sQ0EzV3dGO0FBa1h4RyxLQUFHLFdBQUgsR0FBaUIsWUFBTTtBQUN0QixrQkFBZSxVQUFmLENBQTBCLEdBQUcsVUFBSCxDQUFjLGNBQWQsRUFBMUIsRUFBMEQsSUFBMUQsQ0FBK0QsVUFBVSxJQUFWLEVBQWdCO0FBQzlFLFFBQUksSUFBSixFQUFVO0FBQ1QsUUFBRyxVQUFILENBQWMsSUFBZCxDQUFtQixJQUFuQixFQURTO0FBRVQsUUFBRyxhQUFILEdBQW1CLEdBQUcsVUFBSCxDQUFjLE1BQWQsQ0FGVjtLQUFWO0lBRDhELENBQS9ELENBRHNCO0dBQU4sQ0FsWHVGO0FBMFh4RyxLQUFHLE9BQUgsR0FBYSxZQUFNO0FBQ2xCLGNBQVcsVUFBWCxDQUFzQixHQUFHLE9BQUgsQ0FBdEIsQ0FBa0MsSUFBbEMsQ0FBdUMsVUFBQyxJQUFELEVBQVU7QUFDaEQsUUFBSSxJQUFKLEVBQVU7QUFDVCxRQUFHLE9BQUgsR0FBYSxJQUFiLENBRFM7S0FBVjtJQURzQyxDQUF2QyxDQURrQjtHQUFOLENBMVgyRjtBQWlZeEcsS0FBRyxXQUFILEdBQWlCLFlBQU07QUFDdEIsT0FBSSxvQkFBSjtPQUFpQixXQUFXLEdBQUcsUUFBSDtPQUMzQixvQkFBb0IsRUFBcEI7T0FDQSx1QkFBdUIsRUFBdkIsQ0FIcUI7Ozs7Ozs7QUFLdEIsMEJBQWlCLG1DQUFqQix3R0FBMkI7U0FBbEIsb0JBQWtCOztBQUMxQixTQUFJLEtBQUssYUFBTCxFQUFvQjtBQUN2Qix3QkFBa0IsSUFBbEIsQ0FBdUI7QUFDdEIsYUFBTSxLQUFLLElBQUw7QUFDTixlQUFRO0FBQ1Asa0JBQVUsYUFBVjtRQUREO09BRkQsRUFEdUI7TUFBeEIsTUFPTztBQUNOLDJCQUFxQixJQUFyQixDQUEwQjtBQUN6QixhQUFNLEtBQUssSUFBTDtBQUNOLGVBQVE7QUFDUCxrQkFBVSxJQUFWO1FBREQ7T0FGRCxFQURNO01BUFA7S0FERDs7Ozs7Ozs7Ozs7Ozs7SUFMc0I7O0FBc0J0QixPQUFJLGtCQUFrQixNQUFsQixLQUE2QixDQUE3QixFQUFnQztBQUNuQyxnQkFBWSxXQUFaLENBQXdCLGlCQUF4QixFQURtQztBQUVuQyxXQUZtQztJQUFwQzs7QUFLQSxNQUFHLGlCQUFILENBQXFCLFlBQXJCLENBQWtDLGVBQWxDLEVBM0JzQjtBQTRCdEIsa0JBQWUsVUFBZixDQUEwQixHQUFHLFdBQUgsQ0FBMUIsQ0FBMEMsSUFBMUMsQ0FBK0MsVUFBVSxJQUFWLEVBQWdCO0FBQzlELGtCQUFjLElBQWQsQ0FEOEQ7SUFBaEIsQ0FBL0MsQ0FFRyxJQUZILENBRVEsWUFBTTtBQUNiLFdBQU8sWUFBWSxRQUFaLENBQXFCLEdBQUcsV0FBSCxDQUFlLFNBQWYsRUFBMEIsaUJBQS9DLEVBQWtFLElBQWxFLENBQXVFLFlBQU07QUFDbkYsWUFBTyxJQUFQLENBRG1GO0tBQU4sRUFFM0UsVUFBQyxHQUFELEVBQVM7QUFDWCxpQkFBWSxXQUFaLENBQXdCO0FBQ3ZCLGFBQU8sS0FBUDtBQUNBLFdBQUssSUFBSSxJQUFKLENBQVMsU0FBVDtNQUZOLEVBRFc7QUFLWCxZQUFPLEdBQUcsTUFBSCxFQUFQLENBTFc7S0FBVCxDQUZILENBRGE7SUFBTixDQUZSLENBWUcsSUFaSCxDQVlRLFlBQU07QUFDYixRQUFJLHFCQUFxQixNQUFyQixLQUFnQyxDQUFoQyxFQUFtQztBQUN0QyxZQUFPLFlBQVksV0FBWixDQUF3QixHQUFHLFdBQUgsQ0FBZSxTQUFmLEVBQTBCLG9CQUFsRCxFQUF3RSxLQUF4RSxDQUE4RSxVQUFDLEdBQUQsRUFBUztBQUM3RixrQkFBWSxXQUFaLENBQXdCO0FBQ3ZCLGNBQU8sS0FBUDtBQUNBLFlBQUssSUFBSSxJQUFKLENBQVMsU0FBVDtPQUZOLEVBRDZGO0FBSzdGLGFBQU8sR0FBRyxNQUFILEVBQVAsQ0FMNkY7TUFBVCxDQUFyRixDQURzQztLQUF2QztJQURPLENBWlIsQ0FzQkcsT0F0QkgsQ0FzQlcsWUFBTTtBQUNoQixzQkFBa0IsV0FBbEIsRUFEZ0I7QUFFaEIsT0FBRyxpQkFBSCxDQUFxQixhQUFyQixDQUFtQyxlQUFuQyxFQUZnQjtJQUFOLENBdEJYLENBNUJzQjtHQUFOLENBall1Rjs7QUF5YnhHLE1BQUksWUFBWSxPQUFPLFFBQVAsQ0FBZ0IsSUFBaEIsQ0F6YndGO0FBMGJ4RyxNQUFJLFVBQVUsT0FBVixDQUFrQixVQUFsQixNQUFrQyxDQUFDLENBQUQsRUFBSTtBQUN6QyxNQUFHLFNBQUgsQ0FBYSxDQUFiLEVBQWdCLE1BQWhCLEdBQXlCLElBQXpCLENBRHlDO0FBRXpDLE1BQUcsT0FBSCxHQUZ5QztHQUExQyxNQUdPLElBQUksVUFBVSxPQUFWLENBQWtCLFNBQWxCLE1BQWlDLENBQUMsQ0FBRCxFQUFJO0FBQy9DLE1BQUcsU0FBSCxDQUFhLENBQWIsRUFBZ0IsTUFBaEIsR0FBeUIsSUFBekIsQ0FEK0M7QUFFL0MsTUFBRyxVQUFILEdBRitDO0dBQXpDLE1BR0EsSUFBSSxVQUFVLE9BQVYsQ0FBa0IsY0FBbEIsTUFBc0MsQ0FBQyxDQUFELEVBQUk7QUFDcEQsTUFBRyxTQUFILENBQWEsQ0FBYixFQUFnQixNQUFoQixHQUF5QixJQUF6QixDQURvRDtBQUVwRCxNQUFHLGVBQUgsR0FGb0Q7R0FBOUMsTUFHQSxJQUFJLFVBQVUsT0FBVixDQUFrQixZQUFsQixNQUFvQyxDQUFDLENBQUQsRUFBSTtBQUNsRCxNQUFHLFNBQUgsQ0FBYSxDQUFiLEVBQWdCLE1BQWhCLEdBQXlCLElBQXpCLENBRGtEO0FBRWxELE1BQUcsYUFBSCxHQUZrRDtHQUE1QyxNQUdBLElBQUksVUFBVSxPQUFWLENBQWtCLGFBQWxCLE1BQXFDLENBQUMsQ0FBRCxFQUFJO0FBQ25ELE1BQUcsU0FBSCxDQUFhLENBQWIsRUFBZ0IsTUFBaEIsR0FBeUIsSUFBekIsQ0FEbUQ7QUFFbkQsTUFBRyxjQUFILEdBRm1EO0dBQTdDLE1BR0EsSUFBSSxVQUFVLE9BQVYsQ0FBa0IsU0FBbEIsTUFBaUMsQ0FBQyxDQUFELEVBQUk7QUFDL0MsTUFBRyxTQUFILENBQWEsQ0FBYixFQUFnQixNQUFoQixHQUF5QixJQUF6QixDQUQrQztBQUUvQyxNQUFHLFNBQUgsR0FGK0M7R0FBekMsTUFHQSxJQUFJLFVBQVUsT0FBVixDQUFrQixhQUFsQixNQUFxQyxDQUFDLENBQUQsRUFBSTtBQUNuRCxNQUFHLFNBQUgsQ0FBYSxDQUFiLEVBQWdCLE1BQWhCLEdBQXlCLElBQXpCLENBRG1EO0FBRW5ELE1BQUcsZUFBSCxHQUZtRDtHQUE3QyxNQUdBO0FBQ04sTUFBRyxTQUFILENBQWEsQ0FBYixFQUFnQixNQUFoQixHQUF5QixJQUF6QixDQURNO0dBSEE7RUE1Y1I7QUFtZEEsa0JBQWlCLE9BQWpCLEdBQTJCLENBQUMsUUFBRCxFQUFXLGFBQVgsRUFBMEIsUUFBMUIsRUFBb0MsV0FBcEMsRUFBaUQsY0FBakQsRUFBaUUsUUFBakUsRUFBMkUsYUFBM0UsRUFBMEYsSUFBMUYsQ0FBM0IsQ0F2ZFk7O0FBMGRaLFVBQVMsaUJBQVQsQ0FBMkIsUUFBM0IsRUFBcUMsU0FBckMsRUFBZ0QsY0FBaEQsRUFBZ0UsV0FBaEUsRUFBNkU7QUFDNUUsTUFBSSxLQUFLLElBQUwsQ0FEd0U7QUFFNUUsS0FBRyxNQUFILEdBQVksWUFBWTtBQUN2QixrQkFBZSxPQUFmLEdBRHVCO0dBQVosQ0FGZ0U7QUFLNUUsS0FBRyxLQUFILEdBQVcsWUFBWTtBQUN0QixPQUFJLFdBQVc7QUFDZCxjQUFVLFFBQVY7QUFDQSxjQUFVLEdBQUcsTUFBSDtJQUZQLENBRGtCO0FBS3RCLGFBQVUsV0FBVixDQUFzQixRQUF0QixDQUErQixRQUEvQixFQUF5QyxJQUF6QyxDQUE4QyxZQUFZO0FBQ3pELGdCQUFZLFVBQVosQ0FBdUIsT0FBdkIsRUFEeUQ7QUFFekQsbUJBQWUsS0FBZixHQUZ5RDtJQUFaLEVBRzNDLFlBQVk7QUFDZCxnQkFBWSxXQUFaLENBQXdCLE9BQXhCLEVBRGM7SUFBWixDQUhILENBTHNCO0dBQVosQ0FMaUU7RUFBN0U7QUFrQkEsbUJBQWtCLE9BQWxCLEdBQTRCLENBQUMsVUFBRCxFQUFhLFdBQWIsRUFBMEIsZ0JBQTFCLEVBQTRDLGFBQTVDLENBQTVCLENBNWVZO0NBQVosQ0FBRCIsImZpbGUiOiJpbmRleC90cGwvZ2xvYmFsU2V0dGluZy9nbG9iYWxTZXR0aW5nQ3RyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uICgpIHtcblx0ZG9tZUFwcC5jb250cm9sbGVyKCdHbG9iYWxTZXR0aW5nQ3RyJywgR2xvYmFsU2V0dGluZ0N0cilcblx0XHQuY29udHJvbGxlcignTmV3UGFzc3dkTW9kYWxDdHInLCBOZXdQYXNzd2RNb2RhbEN0cik7XG5cblx0ZnVuY3Rpb24gR2xvYmFsU2V0dGluZ0N0cigkc2NvcGUsICRkb21lR2xvYmFsLCAkc3RhdGUsICRkb21lVXNlciwgJGRvbWVDbHVzdGVyLCAkbW9kYWwsICRkb21lUHVibGljLCAkcSkge1xuXHRcdCd1c2Ugc3RyaWN0Jztcblx0XHRsZXQgdm0gPSB0aGlzO1xuXHRcdCRzY29wZS4kZW1pdCgncGFnZVRpdGxlJywge1xuXHRcdFx0dGl0bGU6ICflhajlsYDphY3nva4nLFxuXHRcdFx0ZGVzY3JpdGlvbjogJ+WcqOi/memHjOaCqOWPr+S7pei/m+ihjOS4gOS6m+WFqOWxgOmFjee9ru+8jOS/neivgWRvbWVvc+iDveWkn+ato+W4uOi/kOihjOWSjOS9v+eUqOOAgicsXG5cdFx0XHRtb2Q6ICdnbG9iYWwnXG5cdFx0fSk7XG5cdFx0JGRvbWVVc2VyLmdldExvZ2luVXNlcigpLnRoZW4oKHVzZXIpID0+IHtcblx0XHRcdGlmICh1c2VyLnVzZXJuYW1lICE9PSAnYWRtaW4nKSB7XG5cdFx0XHRcdCRzdGF0ZS5nbygncHJvamVjdE1hbmFnZScpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Y29uc3QgbGRhcE9wdGlvbnMgPSAkZG9tZUdsb2JhbC5nZXRHbG9hYmFsSW5zdGFuY2UoJ2xkYXAnKSxcblx0XHRcdHNlcnZlck9wdGlvbnMgPSAkZG9tZUdsb2JhbC5nZXRHbG9hYmFsSW5zdGFuY2UoJ3NlcnZlcicpLFxuXHRcdFx0cmVnaXN0cnlPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdyZWdpc3RyeScpLFxuXHRcdFx0Z2l0T3B0aW9ucyA9ICRkb21lR2xvYmFsLmdldEdsb2FiYWxJbnN0YW5jZSgnZ2l0JyksXG5cdFx0XHRtb25pdG9yT3B0aW9ucyA9ICRkb21lR2xvYmFsLmdldEdsb2FiYWxJbnN0YW5jZSgnbW9uaXRvcicpLFxuXHRcdFx0c3NoT3B0aW9ucyA9ICRkb21lR2xvYmFsLmdldEdsb2FiYWxJbnN0YW5jZSgnc3NoJyksXG5cdFx0XHRjbHVzdGVyT3B0aW9ucyA9ICRkb21lR2xvYmFsLmdldEdsb2FiYWxJbnN0YW5jZSgnY2x1c3RlcicpLFxuXHRcdFx0bm9kZVNlcnZpY2UgPSAkZG9tZUNsdXN0ZXIuZ2V0SW5zdGFuY2UoJ05vZGVTZXJ2aWNlJyk7XG5cblx0XHR2bS5zZXJ2ZXJJbmZvID0ge307XG5cdFx0dm0ubGRhcEluZm8gPSB7fTtcblx0XHR2bS5yZWdpc3RyeUluZm8gPSB7fTtcblx0XHR2bS5naXRJbmZvID0ge307XG5cdFx0dm0uc3NoSW5mbyA9IHt9O1xuXHRcdHZtLmNsdXN0ZXJJbmZvID0ge307XG5cdFx0dm0ubmV3VXNlciA9IHt9O1xuXHRcdHZtLm5lZWRWYWxpZFVzZXIgPSB7XG5cdFx0XHR2YWxpZDogZmFsc2Vcblx0XHR9O1xuXHRcdHZtLmtleSA9IHtcblx0XHRcdHVzZXJLZXk6ICcnLFxuXHRcdFx0bm9kZUtleTogJydcblx0XHR9O1xuXHRcdHZtLmlzU2hvd0FkZCA9IGZhbHNlO1xuXHRcdHZtLmN1cnJlbnRVc2VyVHlwZSA9IHtcblx0XHRcdC8vICdVU0VSJyjmma7pgJrnlKjmiLcpIG9yICdMREFQJ1xuXHRcdFx0dHlwZTogJ1VTRVInXG5cdFx0fTtcblx0XHQvLyDmma7pgJrnlKjmiLfliJfooahcblx0XHR2bS51c2VyTGlzdCA9IFtdO1xuXHRcdC8vIGxkYXDnlKjmiLfliJfooahcblx0XHR2bS5sZGFwVXNlckxpc3QgPSBbXTtcblxuXHRcdHZtLmNsdXN0ZXJMb2FkaW5nSW5zID0gJGRvbWVQdWJsaWMuZ2V0TG9hZGluZ0luc3RhbmNlKCk7XG5cdFx0dm0udGFiQWN0aXZlID0gW3tcblx0XHRcdGFjdGl2ZTogZmFsc2Vcblx0XHR9LCB7XG5cdFx0XHRhY3RpdmU6IGZhbHNlXG5cdFx0fSwge1xuXHRcdFx0YWN0aXZlOiBmYWxzZVxuXHRcdH0sIHtcblx0XHRcdGFjdGl2ZTogZmFsc2Vcblx0XHR9LCB7XG5cdFx0XHRhY3RpdmU6IGZhbHNlXG5cdFx0fSwge1xuXHRcdFx0YWN0aXZlOiBmYWxzZVxuXHRcdH0sIHtcblx0XHRcdGFjdGl2ZTogZmFsc2Vcblx0XHR9LCB7XG5cdFx0XHRhY3RpdmU6IGZhbHNlXG5cdFx0fV07XG5cblxuXHRcdGNsYXNzIE1vbml0b3Ige1xuXHRcdFx0aW5pdChpbmZvKSB7XG5cdFx0XHRcdHRoaXMuY29uZmlnID0gaW5mbyB8fCB7fTtcblxuXHRcdFx0XHRmdW5jdGlvbiBmb3JtYXJ0U3RyVG9PYmpBcnIoc3RyKSB7XG5cdFx0XHRcdFx0dmFyIGFyciA9IFtdO1xuXHRcdFx0XHRcdHZhciBzdHJBcnIgPSBbXTtcblx0XHRcdFx0XHRpZiAoIXN0cikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIFt7XG5cdFx0XHRcdFx0XHRcdHRleHQ6ICcnXG5cdFx0XHRcdFx0XHR9XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c3RyQXJyID0gc3RyLnNwbGl0KCcsJyk7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzdHJBcnIubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGFyci5wdXNoKHtcblx0XHRcdFx0XHRcdFx0dGV4dDogc3RyQXJyW2ldXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YXJyLnB1c2goe1xuXHRcdFx0XHRcdFx0dGV4dDogJydcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRyZXR1cm4gYXJyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuY29uZmlnLnRyYW5zZmVyID0gZm9ybWFydFN0clRvT2JqQXJyKHRoaXMuY29uZmlnLnRyYW5zZmVyKTtcblx0XHRcdFx0dGhpcy5jb25maWcuZ3JhcGggPSBmb3JtYXJ0U3RyVG9PYmpBcnIodGhpcy5jb25maWcuZ3JhcGgpO1xuXHRcdFx0XHR0aGlzLmNvbmZpZy5qdWRnZSA9IGZvcm1hcnRTdHJUb09iakFycih0aGlzLmNvbmZpZy5qdWRnZSk7XG5cdFx0XHR9XG5cdFx0XHRhZGRJdGVtKGl0ZW0pIHtcblx0XHRcdFx0dGhpcy5jb25maWdbaXRlbV0ucHVzaCh7XG5cdFx0XHRcdFx0dGV4dDogJydcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRkZWxldGVBcnJJdGVtKGl0ZW0sIGluZGV4KSB7XG5cdFx0XHRcdHRoaXMuY29uZmlnW2l0ZW1dLnNwbGljZShpbmRleCwgMSk7XG5cdFx0XHR9XG5cdFx0XHRmb3JtYXJ0TW9uaXRvcigpIHtcblx0XHRcdFx0bGV0IG9iaiA9IGFuZ3VsYXIuY29weSh0aGlzLmNvbmZpZyk7XG5cblx0XHRcdFx0Y29uc3QgZm9ybWFydEFyclRvU3RyID0gKG1vbml0b3JBcnIpID0+IHtcblx0XHRcdFx0XHRsZXQgc3RyQXJyID0gW107XG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBtb25pdG9yQXJyLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRpZiAobW9uaXRvckFycltpXS50ZXh0KSB7XG5cdFx0XHRcdFx0XHRcdHN0ckFyci5wdXNoKG1vbml0b3JBcnJbaV0udGV4dCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBzdHJBcnIuam9pbignLCcpO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRvYmoudHJhbnNmZXIgPSBmb3JtYXJ0QXJyVG9TdHIodGhpcy5jb25maWcudHJhbnNmZXIpO1xuXHRcdFx0XHRvYmouZ3JhcGggPSBmb3JtYXJ0QXJyVG9TdHIodGhpcy5jb25maWcuZ3JhcGgpO1xuXHRcdFx0XHRvYmouanVkZ2UgPSBmb3JtYXJ0QXJyVG9TdHIodGhpcy5jb25maWcuanVkZ2UpO1xuXHRcdFx0XHRyZXR1cm4gb2JqO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdCRkb21lVXNlci51c2VyU2VydmljZS5nZXRVc2VyTGlzdCgpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuXHRcdFx0dm0udXNlckxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG5cdFx0fSk7XG5cblx0XHRjb25zdCBnZXRDbHVzdGVyTGlzdCA9ICgpID0+IHtcblx0XHRcdGlmICh2bS5jbHVzdGVyTGlzdCkge1xuXHRcdFx0XHQkcS53aGVuKHZtLmNsdXN0ZXJMaXN0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBub2RlU2VydmljZS5nZXREYXRhKCkudGhlbigocmVzKSA9PiB7XG5cdFx0XHRcdFx0dm0uY2x1c3Rlckxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG5cdFx0XHRcdFx0cmV0dXJuIHZtLmNsdXN0ZXJMaXN0O1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHZtLnRvZ2dsZVVzZXJUeXBlID0gKHVzZXJUeXBlKSA9PiB7XG5cdFx0XHRpZiAodXNlclR5cGUgIT09IHZtLmN1cnJlbnRVc2VyVHlwZSkge1xuXHRcdFx0XHR2bS5jdXJyZW50VXNlclR5cGUudHlwZSA9IHVzZXJUeXBlO1xuXHRcdFx0XHR2bS5pc1Nob3dBZGQgPSBmYWxzZTtcblx0XHRcdFx0dm0ua2V5LnVzZXJLZXkgPSAnJztcblx0XHRcdH1cblx0XHR9O1xuXHRcdHZtLnRvZ2dsZVNob3dBZGQgPSAoKSA9PiB7XG5cdFx0XHR2bS5pc1Nob3dBZGQgPSAhdm0uaXNTaG93QWRkO1xuXHRcdH07XG5cdFx0dm0ubW9kaWZ5UHcgPSAodXNlcikgPT4ge1xuXHRcdFx0JG1vZGFsLm9wZW4oe1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25ld1Bhc3N3ZE1vZGFsLmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTmV3UGFzc3dkTW9kYWxDdHIgYXMgdm1QdycsXG5cdFx0XHRcdHNpemU6ICdtZCcsXG5cdFx0XHRcdHJlc29sdmU6IHtcblx0XHRcdFx0XHR1c2VybmFtZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHVzZXIudXNlcm5hbWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdH07XG5cblx0XHR2bS5tb2RpZnlVc2VySW5mbyA9ICh1c2VyKSA9PiB7XG5cdFx0XHQkZG9tZVVzZXIuZ2V0TG9naW5Vc2VyKCkudGhlbigobG9naW5Vc2VyKSA9PiB7XG5cdFx0XHRcdGxldCBjb3B5VXNlckluZm8gPSBsb2dpblVzZXIuaWQgPT09IHVzZXIuaWQgPyBhbmd1bGFyLmNvcHkobG9naW5Vc2VyKSA6IGFuZ3VsYXIuY29weSh1c2VyKTtcblxuXHRcdFx0XHRjb25zdCBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOiAnbW9kaWZ5VXNlckluZm9Nb2RhbC5odG1sJyxcblx0XHRcdFx0XHRjb250cm9sbGVyOiAnTW9kaWZ5VXNlckluZm9DdHInLFxuXHRcdFx0XHRcdHNpemU6ICdtZCcsXG5cdFx0XHRcdFx0cmVzb2x2ZToge1xuXHRcdFx0XHRcdFx0dXNlcjogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gY29weVVzZXJJbmZvO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHRcdG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oKHVzZXJJbmZvKSA9PiB7XG5cdFx0XHRcdFx0YW5ndWxhci5leHRlbmQodXNlciwgdXNlckluZm8pO1xuXHRcdFx0XHRcdCRkb21lVXNlci5nZXRMb2dpblVzZXIoKS50aGVuKGZ1bmN0aW9uIChsb2dpblVzZXIpIHtcblx0XHRcdFx0XHRcdGlmIChsb2dpblVzZXIuaWQgPT09IHVzZXIuaWQpIHtcblx0XHRcdFx0XHRcdFx0YW5ndWxhci5leHRlbmQobG9naW5Vc2VyLCB1c2VySW5mbyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdHZtLmRlbGV0ZVVzZXIgPSAodXNlcikgPT4ge1xuXHRcdFx0dmFyIGlkID0gdXNlci5pZDtcblx0XHRcdCRkb21lUHVibGljLm9wZW5EZWxldGUoKS50aGVuKCgpID0+IHtcblx0XHRcdFx0JGRvbWVVc2VyLnVzZXJTZXJ2aWNlLmRlbGV0ZVVzZXIoaWQpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdm0udXNlckxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGlmICh2bS51c2VyTGlzdFtpXS5pZCA9PT0gaWQpIHtcblx0XHRcdFx0XHRcdFx0dm0udXNlckxpc3Quc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sICgpID0+IHtcblx0XHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5Yig6Zmk5aSx6LSl77yBJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdHZtLmdldExkYXAgPSAoKSA9PiB7XG5cdFx0XHRpZiAoIXZtLmxkYXBJbmZvLmlkKSB7XG5cdFx0XHRcdGxkYXBPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG5cdFx0XHRcdFx0dmFyIHJlZyA9IC8oLiopOihbXjpdKykvZztcblx0XHRcdFx0XHR2bS5sZGFwSW5mbyA9IGluZm87XG5cdFx0XHRcdFx0dm0ubGRhcEluZm8udXJsID0gdm0ubGRhcEluZm8uc2VydmVyLnJlcGxhY2UocmVnLCAnJDEnKTtcblx0XHRcdFx0XHR2bS5sZGFwSW5mby5wb3J0ID0gdm0ubGRhcEluZm8uc2VydmVyLnJlcGxhY2UocmVnLCAnJDInKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR2bS5nZXRHaXRJbmZvID0gKCkgPT4ge1xuXHRcdFx0aWYgKCF2bS5naXRJbmZvLmlkKSB7XG5cdFx0XHRcdGdpdE9wdGlvbnMuZ2V0RGF0YSgpLnRoZW4oZnVuY3Rpb24gKGdpdEluZm9zKSB7XG5cdFx0XHRcdFx0dm0uZ2l0SW5mbyA9IGdpdEluZm9zWzBdO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHZtLmdldFJlZ2lzdHJ5SW5mbyA9ICgpID0+IHtcblx0XHRcdGlmICghdm0ucmVnaXN0cnlJbmZvLmlkKSB7XG5cdFx0XHRcdHJlZ2lzdHJ5T3B0aW9ucy5nZXREYXRhKCkudGhlbihmdW5jdGlvbiAoaW5mbykge1xuXHRcdFx0XHRcdHZtLnJlZ2lzdHJ5SW5mbyA9IGluZm87XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dm0uZ2V0U2VydmVySW5mbyA9ICgpID0+IHtcblx0XHRcdGlmICghdm0uc2VydmVySW5mby5pZCkge1xuXHRcdFx0XHRzZXJ2ZXJPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG5cdFx0XHRcdFx0dm0uc2VydmVySW5mbyA9IGluZm87XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dm0uZ2V0TW9uaXRvckluZm8gPSAoKSA9PiB7XG5cdFx0XHRmdW5jdGlvbiBpbml0TW9uaXRvckluZm8oaW5mbykge1xuXHRcdFx0XHR2bS5tb25pdG9ySW5zID0gbmV3IE1vbml0b3IoKTtcblx0XHRcdFx0dm0ubW9uaXRvcklucy5pbml0KGluZm8pO1xuXHRcdFx0XHR2bS5tb25pdG9yQ29uZmlnID0gdm0ubW9uaXRvcklucy5jb25maWc7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXZtLm1vbml0b3JDb25maWcpIHtcblx0XHRcdFx0bW9uaXRvck9wdGlvbnMuZ2V0RGF0YSgpLnRoZW4oZnVuY3Rpb24gKGluZm8pIHtcblx0XHRcdFx0XHRpbml0TW9uaXRvckluZm8oaW5mbyk7XG5cdFx0XHRcdH0sIGluaXRNb25pdG9ySW5mbygpKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHZtLmdldFdlYlNzaCA9ICgpID0+IHtcblx0XHRcdGlmICghdm0uc3NoSW5mby5pZCkge1xuXHRcdFx0XHRzc2hPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG5cdFx0XHRcdFx0dm0uc3NoSW5mbyA9IGluZm87XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0Ly8gQHBhcmFtIG5hbWVzcGFjZTog5Y+v5LiN5aGr77yM5pyJ5YC85pe26buY6K6k5Li66K+lbmFtZXNwYWNlXG5cdFx0dm0udG9nZ2xlQ2x1c3RlciA9IChjbHVzdGVyLCBuYW1lc3BhY2UpID0+IHtcblx0XHRcdHZtLmNsdXN0ZXJJbmZvLmNsdXN0ZXJJZCA9IGNsdXN0ZXIuaWQ7XG5cdFx0XHR2bS5jbHVzdGVySW5mby5jbHVzdGVyTmFtZSA9IGNsdXN0ZXIubmFtZTtcblx0XHRcdHZtLmNsdXN0ZXJJbmZvLmhvc3QgPSBjbHVzdGVyLmFwaTtcblx0XHRcdHZtLmtleS5ub2RlS2V5ID0gJyc7XG5cdFx0XHR2bS5jbHVzdGVyTG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ25hbWVzcGFjZScpO1xuXHRcdFx0dm0uY2x1c3RlckxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdub2RlTGlzdCcpO1xuXHRcdFx0bm9kZVNlcnZpY2UuZ2V0TmFtZXNwYWNlKGNsdXN0ZXIuaWQsIGNsdXN0ZXIubmFtZSkudGhlbigocmVzKSA9PiB7XG5cdFx0XHRcdHZtLm5hbWVzcGFjZUxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG5cdFx0XHRcdGlmIChuYW1lc3BhY2UpIHtcblx0XHRcdFx0XHR2bS5jbHVzdGVySW5mby5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Zm9yIChsZXQgbmFtZXNwYWNlIG9mIHZtLm5hbWVzcGFjZUxpc3QpIHtcblx0XHRcdFx0XHRcdGlmIChuYW1lc3BhY2UubmFtZSA9PSAnZGVmYXVsdCcpIHtcblx0XHRcdFx0XHRcdFx0dm0uY2x1c3RlckluZm8ubmFtZXNwYWNlID0gJ2RlZmF1bHQnO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHZtLmNsdXN0ZXJJbmZvLm5hbWVzcGFjZSA9IHZtLm5hbWVzcGFjZUxpc3RbMF0gJiYgdm0ubmFtZXNwYWNlTGlzdFswXS5uYW1lO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCAoKSA9PiB7XG5cdFx0XHRcdHZtLm5hbWVzcGFjZUxpc3QgPSBbXTtcblx0XHRcdFx0dm0uY2x1c3RlckluZm8ubmFtZXNwYWNlID0gbnVsbDtcblx0XHRcdH0pLmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHR2bS5jbHVzdGVyTG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCduYW1lc3BhY2UnKTtcblx0XHRcdH0pO1xuXHRcdFx0bm9kZVNlcnZpY2UuZ2V0Tm9kZUxpc3QoY2x1c3Rlci5pZCkudGhlbigocmVzKSA9PiB7XG5cdFx0XHRcdGxldCBub2RlTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcblx0XHRcdFx0Zm9yIChsZXQgbm9kZSBvZiBub2RlTGlzdCkge1xuXHRcdFx0XHRcdGlmIChub2RlLmNhcGFjaXR5KSB7XG5cdFx0XHRcdFx0XHRub2RlLmNhcGFjaXR5Lm1lbW9yeSA9IChub2RlLmNhcGFjaXR5Lm1lbW9yeSAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIW5vZGUubGFiZWxzKSB7XG5cdFx0XHRcdFx0XHRub2RlLmxhYmVscyA9IHt9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRub2RlLmlzVXNlZEJ5QnVpbGQgPSBub2RlLmxhYmVscy5CVUlMREVOViA/IHRydWUgOiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2bS5ub2RlTGlzdCA9IG5vZGVMaXN0O1xuXHRcdFx0fSkuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdHZtLmNsdXN0ZXJMb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ25vZGVMaXN0Jyk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdGNvbnN0IHRvZ2dsZUNsdXN0ZXJJbmZvID0gKGNsdXN0ZXJJbmZvKSA9PiB7XG5cdFx0XHR2bS5jbHVzdGVySW5mbyA9IGNsdXN0ZXJJbmZvIHx8IHt9O1xuXHRcdFx0Zm9yIChsZXQgY2x1c3RlciBvZiB2bS5jbHVzdGVyTGlzdCkge1xuXHRcdFx0XHRpZiAoY2x1c3Rlci5hcGkgPT09IHZtLmNsdXN0ZXJJbmZvLmhvc3QpIHtcblx0XHRcdFx0XHR2bS50b2dnbGVDbHVzdGVyKGNsdXN0ZXIsIHZtLmNsdXN0ZXJJbmZvLm5hbWVzcGFjZSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR2bS5pbml0Q2x1c3RlckluZm8gPSAoKSA9PiB7XG5cdFx0XHRpZiAoIXZtLmNsdXN0ZXJJbmZvLmlkKSB7XG5cdFx0XHRcdHZtLmNsdXN0ZXJMb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnY2x1c3RlcicpO1xuXHRcdFx0XHQkcS5hbGwoW2dldENsdXN0ZXJMaXN0KCksIGNsdXN0ZXJPcHRpb25zLmdldERhdGEoKV0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuXHRcdFx0XHRcdHRvZ2dsZUNsdXN0ZXJJbmZvKHJlc1sxXSk7XG5cdFx0XHRcdH0pLmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHRcdHZtLmNsdXN0ZXJMb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ2NsdXN0ZXInKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR2bS5hZGRVc2VyID0gKGZvcm0pID0+IHtcblx0XHRcdHZhciBuZXdVc2VyID0gYW5ndWxhci5jb3B5KHZtLm5ld1VzZXIpO1xuXHRcdFx0ZGVsZXRlIG5ld1VzZXIucmVQYXNzd29yZDtcblxuXHRcdFx0JGRvbWVVc2VyLnVzZXJTZXJ2aWNlLmNyZWF0ZVVzZXIobmV3VXNlcikudGhlbihmdW5jdGlvbiAocmVzKSB7XG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+WIm+W7uuaIkOWKn++8gScpO1xuXHRcdFx0XHR2YXIgdXNlciA9IGFuZ3VsYXIuY29weShuZXdVc2VyKTtcblx0XHRcdFx0aWYgKHJlcy5kYXRhLnJlc3VsdCkge1xuXHRcdFx0XHRcdHZtLnVzZXJMaXN0LnB1c2gocmVzLmRhdGEucmVzdWx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2bS5uZXdVc2VyID0ge307XG5cdFx0XHRcdHZtLm5lZWRWYWxpZFVzZXIudmFsaWQgPSBmYWxzZTtcblx0XHRcdFx0Zm9ybS4kc2V0UHJpc3RpbmUoKTtcblx0XHRcdH0sIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0JGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+WIm+W7uuWksei0pe+8gScpO1xuXHRcdFx0fSk7XG5cdFx0fTtcblx0XHR2bS5zYXZlTGRhcCA9ICgpID0+IHtcblx0XHRcdHZhciBkYXRhID0gYW5ndWxhci5jb3B5KHZtLmxkYXBJbmZvKTtcblx0XHRcdGRhdGEuc2VydmVyID0gZGF0YS51cmwgKyAnOicgKyBkYXRhLnBvcnQ7XG5cdFx0XHRkZWxldGUgZGF0YS51cmw7XG5cdFx0XHRkZWxldGUgZGF0YS5wb3J0O1xuXHRcdFx0bGRhcE9wdGlvbnMubW9kaWZ5RGF0YShkYXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dm0uZ2V0TGRhcCgpO1xuXHRcdFx0fSk7XG5cdFx0fTtcblx0XHR2bS5zYXZlR2l0ID0gKCkgPT4ge1xuXHRcdFx0aWYgKCF2bS5naXRJbmZvLmlkKSB7XG5cdFx0XHRcdHZtLmdpdEluZm8udHlwZSA9ICdHSVRMQUInO1xuXHRcdFx0fVxuXHRcdFx0Z2l0T3B0aW9ucy5tb2RpZnlEYXRhKHZtLmdpdEluZm8pLnRoZW4oZnVuY3Rpb24gKGluZm8pIHtcblx0XHRcdFx0aWYgKGluZm8pIHtcblx0XHRcdFx0XHR2bS5naXRJbmZvID0gaW5mbztcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblx0XHR2bS5zYXZlUmVnaXN0cnkgPSAoKSA9PiB7XG5cdFx0XHRpZiAodm0ucmVnaXN0cnlJbmZvLmlkKSB7XG5cdFx0XHRcdGRlbGV0ZSB2bS5yZWdpc3RyeUluZm8uaWQ7XG5cdFx0XHRcdGRlbGV0ZSB2bS5yZWdpc3RyeUluZm8uY3JlYXRlVGltZTtcblx0XHRcdH1cblx0XHRcdHZhciByZWdpc3RyeUluZm8gPSBhbmd1bGFyLmNvcHkodm0ucmVnaXN0cnlJbmZvKTtcblx0XHRcdGlmIChyZWdpc3RyeUluZm8uc3RhdHVzID09PSAwKSB7XG5cdFx0XHRcdGRlbGV0ZSByZWdpc3RyeUluZm8uY2VydGlmaWNhdGlvbjtcblx0XHRcdH1cblx0XHRcdHJlZ2lzdHJ5T3B0aW9ucy5tb2RpZnlEYXRhKHJlZ2lzdHJ5SW5mbykudGhlbihmdW5jdGlvbiAoaW5mbykge1xuXHRcdFx0XHRpZiAoaW5mbykge1xuXHRcdFx0XHRcdHZtLnJlZ2lzdHJ5SW5mbyA9IGluZm87XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0dm0uc2F2ZVNlcnZlciA9ICgpID0+IHtcblx0XHRcdHNlcnZlck9wdGlvbnMubW9kaWZ5RGF0YSh2bS5zZXJ2ZXJJbmZvKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG5cdFx0XHRcdGlmIChpbmZvKSB7XG5cdFx0XHRcdFx0dm0uc2VydmVySW5mbyA9IGluZm87XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0dm0uc2F2ZU1vbml0b3IgPSAoKSA9PiB7XG5cdFx0XHRtb25pdG9yT3B0aW9ucy5tb2RpZnlEYXRhKHZtLm1vbml0b3JJbnMuZm9ybWFydE1vbml0b3IoKSkudGhlbihmdW5jdGlvbiAoaW5mbykge1xuXHRcdFx0XHRpZiAoaW5mbykge1xuXHRcdFx0XHRcdHZtLm1vbml0b3JJbnMuaW5pdChpbmZvKTtcblx0XHRcdFx0XHR2bS5tb25pdG9yQ29uZmlnID0gdm0ubW9uaXRvcklucy5jb25maWc7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0dm0uc2F2ZVNzaCA9ICgpID0+IHtcblx0XHRcdHNzaE9wdGlvbnMubW9kaWZ5RGF0YSh2bS5zc2hJbmZvKS50aGVuKChpbmZvKSA9PiB7XG5cdFx0XHRcdGlmIChpbmZvKSB7XG5cdFx0XHRcdFx0dm0uc3NoSW5mbyA9IGluZm87XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0dm0uc2F2ZUNsdXN0ZXIgPSAoKSA9PiB7XG5cdFx0XHRsZXQgY2x1c3RlckluZm8sIG5vZGVMaXN0ID0gdm0ubm9kZUxpc3QsXG5cdFx0XHRcdGFkZE5vZGVMYWJlbHNJbmZvID0gW10sXG5cdFx0XHRcdGRlbGV0ZU5vZGVMYWJlbHNJbmZvID0gW107XG5cblx0XHRcdGZvciAobGV0IG5vZGUgb2Ygbm9kZUxpc3QpIHtcblx0XHRcdFx0aWYgKG5vZGUuaXNVc2VkQnlCdWlsZCkge1xuXHRcdFx0XHRcdGFkZE5vZGVMYWJlbHNJbmZvLnB1c2goe1xuXHRcdFx0XHRcdFx0bm9kZTogbm9kZS5uYW1lLFxuXHRcdFx0XHRcdFx0bGFiZWxzOiB7XG5cdFx0XHRcdFx0XHRcdEJVSUxERU5WOiAnSE9TVEVOVlRZUEUnXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZGVsZXRlTm9kZUxhYmVsc0luZm8ucHVzaCh7XG5cdFx0XHRcdFx0XHRub2RlOiBub2RlLm5hbWUsXG5cdFx0XHRcdFx0XHRsYWJlbHM6IHtcblx0XHRcdFx0XHRcdFx0QlVJTERFTlY6IG51bGxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGFkZE5vZGVMYWJlbHNJbmZvLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn6K+36Iez5bCR6K6+572u5LiA5Y+w55So5LqO5p6E5bu655qE5Li75py677yBJyk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dm0uY2x1c3RlckxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdzdWJtaXRDbHVzdGVyJyk7XG5cdFx0XHRjbHVzdGVyT3B0aW9ucy5tb2RpZnlEYXRhKHZtLmNsdXN0ZXJJbmZvKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG5cdFx0XHRcdGNsdXN0ZXJJbmZvID0gaW5mbztcblx0XHRcdH0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gbm9kZVNlcnZpY2UuYWRkTGFiZWwodm0uY2x1c3RlckluZm8uY2x1c3RlcklkLCBhZGROb2RlTGFiZWxzSW5mbykudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH0sIChyZXMpID0+IHtcblx0XHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG5cdFx0XHRcdFx0XHR0aXRsZTogJ+mUmeivr++8gScsXG5cdFx0XHRcdFx0XHRtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KS50aGVuKCgpID0+IHtcblx0XHRcdFx0aWYgKGRlbGV0ZU5vZGVMYWJlbHNJbmZvLmxlbmd0aCAhPT0gMCkge1xuXHRcdFx0XHRcdHJldHVybiBub2RlU2VydmljZS5kZWxldGVMYWJlbCh2bS5jbHVzdGVySW5mby5jbHVzdGVySWQsIGRlbGV0ZU5vZGVMYWJlbHNJbmZvKS5jYXRjaCgocmVzKSA9PiB7XG5cdFx0XHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG5cdFx0XHRcdFx0XHRcdHRpdGxlOiAn6ZSZ6K+v77yBJyxcblx0XHRcdFx0XHRcdFx0bXNnOiByZXMuZGF0YS5yZXN1bHRNc2dcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdCgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KS5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0dG9nZ2xlQ2x1c3RlckluZm8oY2x1c3RlckluZm8pO1xuXHRcdFx0XHR2bS5jbHVzdGVyTG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCdzdWJtaXRDbHVzdGVyJyk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0dmFyIHN0YXRlSW5mbyA9ICRzdGF0ZS4kY3VycmVudC5uYW1lO1xuXHRcdGlmIChzdGF0ZUluZm8uaW5kZXhPZignbGRhcGluZm8nKSAhPT0gLTEpIHtcblx0XHRcdHZtLnRhYkFjdGl2ZVsxXS5hY3RpdmUgPSB0cnVlO1xuXHRcdFx0dm0uZ2V0TGRhcCgpO1xuXHRcdH0gZWxzZSBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ2dpdGluZm8nKSAhPT0gLTEpIHtcblx0XHRcdHZtLnRhYkFjdGl2ZVsyXS5hY3RpdmUgPSB0cnVlO1xuXHRcdFx0dm0uZ2V0R2l0SW5mbygpO1xuXHRcdH0gZWxzZSBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ3JlZ2lzdHJ5aW5mbycpICE9PSAtMSkge1xuXHRcdFx0dm0udGFiQWN0aXZlWzNdLmFjdGl2ZSA9IHRydWU7XG5cdFx0XHR2bS5nZXRSZWdpc3RyeUluZm8oKTtcblx0XHR9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdzZXJ2ZXJpbmZvJykgIT09IC0xKSB7XG5cdFx0XHR2bS50YWJBY3RpdmVbNF0uYWN0aXZlID0gdHJ1ZTtcblx0XHRcdHZtLmdldFNlcnZlckluZm8oKTtcblx0XHR9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdtb25pdG9yaW5mbycpICE9PSAtMSkge1xuXHRcdFx0dm0udGFiQWN0aXZlWzVdLmFjdGl2ZSA9IHRydWU7XG5cdFx0XHR2bS5nZXRNb25pdG9ySW5mbygpO1xuXHRcdH0gZWxzZSBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ3NzaGluZm8nKSAhPT0gLTEpIHtcblx0XHRcdHZtLnRhYkFjdGl2ZVs2XS5hY3RpdmUgPSB0cnVlO1xuXHRcdFx0dm0uZ2V0V2ViU3NoKCk7XG5cdFx0fSBlbHNlIGlmIChzdGF0ZUluZm8uaW5kZXhPZignY2x1c3RlcmluZm8nKSAhPT0gLTEpIHtcblx0XHRcdHZtLnRhYkFjdGl2ZVs3XS5hY3RpdmUgPSB0cnVlO1xuXHRcdFx0dm0uaW5pdENsdXN0ZXJJbmZvKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZtLnRhYkFjdGl2ZVswXS5hY3RpdmUgPSB0cnVlO1xuXHRcdH1cblx0fVxuXHRHbG9iYWxTZXR0aW5nQ3RyLiRpbmplY3QgPSBbJyRzY29wZScsICckZG9tZUdsb2JhbCcsICckc3RhdGUnLCAnJGRvbWVVc2VyJywgJyRkb21lQ2x1c3RlcicsICckbW9kYWwnLCAnJGRvbWVQdWJsaWMnLCAnJHEnXTtcblxuXG5cdGZ1bmN0aW9uIE5ld1Bhc3N3ZE1vZGFsQ3RyKHVzZXJuYW1lLCAkZG9tZVVzZXIsICRtb2RhbEluc3RhbmNlLCAkZG9tZVB1YmxpYykge1xuXHRcdHZhciB2bSA9IHRoaXM7XG5cdFx0dm0uY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0JG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuXHRcdH07XG5cdFx0dm0uc3ViUHcgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgdXNlckluZm8gPSB7XG5cdFx0XHRcdHVzZXJuYW1lOiB1c2VybmFtZSxcblx0XHRcdFx0cGFzc3dvcmQ6IHZtLnBhc3N3ZFxuXHRcdFx0fTtcblx0XHRcdCRkb21lVXNlci51c2VyU2VydmljZS5tb2RpZnlQdyh1c2VySW5mbykudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdCRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+S/ruaUueaIkOWKn++8gScpO1xuXHRcdFx0XHQkbW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuXHRcdFx0fSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5L+u5pS55aSx6LSl77yBJyk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXHR9XG5cdE5ld1Bhc3N3ZE1vZGFsQ3RyLiRpbmplY3QgPSBbJ3VzZXJuYW1lJywgJyRkb21lVXNlcicsICckbW9kYWxJbnN0YW5jZScsICckZG9tZVB1YmxpYyddO1xuXG59KSgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
