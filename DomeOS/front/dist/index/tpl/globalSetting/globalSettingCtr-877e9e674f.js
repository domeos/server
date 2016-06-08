'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (domeApp, undefined) {
    'use strict';

    if (typeof domeApp === 'undefined') return;

    domeApp.controller('GlobalSettingCtr', GlobalSettingCtr).controller('NewPasswdModalCtr', NewPasswdModalCtr);

    function GlobalSettingCtr($scope, $domeGlobal, $state, $domeUser, $domeCluster, $modal, $domePublic, $q) {
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
                        for (var i = 0, l = strArr.length; i < l; i++) {
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
                        for (var i = 0, l = monitorArr.length; i < l; i++) {
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
})(window.domeApp);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L3RwbC9nbG9iYWxTZXR0aW5nL2dsb2JhbFNldHRpbmdDdHIuZXMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsQ0FBQyxVQUFDLE9BQUQsRUFBVSxTQUFWLEVBQXdCO0FBQ3JCLGlCQURxQjs7QUFFckIsUUFBSSxPQUFPLE9BQVAsS0FBbUIsV0FBbkIsRUFBZ0MsT0FBcEM7O0FBRUEsWUFBUSxVQUFSLENBQW1CLGtCQUFuQixFQUF1QyxnQkFBdkMsRUFDSyxVQURMLENBQ2dCLG1CQURoQixFQUNxQyxpQkFEckMsRUFKcUI7O0FBT3JCLGFBQVMsZ0JBQVQsQ0FBMEIsTUFBMUIsRUFBa0MsV0FBbEMsRUFBK0MsTUFBL0MsRUFBdUQsU0FBdkQsRUFBa0UsWUFBbEUsRUFBZ0YsTUFBaEYsRUFBd0YsV0FBeEYsRUFBcUcsRUFBckcsRUFBeUc7QUFDckcsWUFBSSxLQUFLLElBQUwsQ0FEaUc7QUFFckcsZUFBTyxLQUFQLENBQWEsV0FBYixFQUEwQjtBQUN0QixtQkFBTyxNQUFQO0FBQ0Esd0JBQVksbUNBQVo7QUFDQSxpQkFBSyxRQUFMO1NBSEosRUFGcUc7QUFPckcsa0JBQVUsWUFBVixHQUF5QixJQUF6QixDQUE4QixVQUFDLElBQUQsRUFBVTtBQUNwQyxnQkFBSSxLQUFLLFFBQUwsS0FBa0IsT0FBbEIsRUFBMkI7QUFDM0IsdUJBQU8sRUFBUCxDQUFVLGVBQVYsRUFEMkI7YUFBL0I7U0FEMEIsQ0FBOUIsQ0FQcUc7O0FBYXJHLFlBQU0sY0FBYyxZQUFZLGtCQUFaLENBQStCLE1BQS9CLENBQWQ7WUFDRixnQkFBZ0IsWUFBWSxrQkFBWixDQUErQixRQUEvQixDQUFoQjtZQUNBLGtCQUFrQixZQUFZLGtCQUFaLENBQStCLFVBQS9CLENBQWxCO1lBQ0EsYUFBYSxZQUFZLGtCQUFaLENBQStCLEtBQS9CLENBQWI7WUFDQSxpQkFBaUIsWUFBWSxrQkFBWixDQUErQixTQUEvQixDQUFqQjtZQUNBLGFBQWEsWUFBWSxrQkFBWixDQUErQixL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Q0FBK0IsUUFBL0IsRUFBeUMsSUFBekMsQ0FBOEMsWUFBWTtBQUN0RCw0QkFBWSxVQUFaLENBQXVCLE9BQXZCLEVBRHNEO0FBRXRELCtCQUFlLEtBQWYsR0FGc0Q7YUFBWixFQUczQyxZQUFZO0FBQ1gsNEJBQVksV0FBWixDQUF3QixPQUF4QixFQURXO2FBQVosQ0FISCxDQUxtQjtTQUFaLENBTDhEO0tBQTdFO0FBa0JBLHNCQUFrQixPQUFsQixHQUE0QixDQUFDLFVBQUQsRUFBYSxXQUFiLEVBQTBCLGdCQUExQixFQUE0QyxhQUE1QyxDQUE1QixDQTllcUI7Q0FBeEIsQ0FBRCxDQWdmRyxPQUFPLE9BQVAsQ0FoZkgiLCJmaWxlIjoiaW5kZXgvdHBsL2dsb2JhbFNldHRpbmcvZ2xvYmFsU2V0dGluZ0N0ci5qcyIsInNvdXJjZXNDb250ZW50IjpbIigoZG9tZUFwcCwgdW5kZWZpbmVkKSA9PiB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZG9tZUFwcCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcblxuICAgIGRvbWVBcHAuY29udHJvbGxlcignR2xvYmFsU2V0dGluZ0N0cicsIEdsb2JhbFNldHRpbmdDdHIpXG4gICAgICAgIC5jb250cm9sbGVyKCdOZXdQYXNzd2RNb2RhbEN0cicsIE5ld1Bhc3N3ZE1vZGFsQ3RyKTtcblxuICAgIGZ1bmN0aW9uIEdsb2JhbFNldHRpbmdDdHIoJHNjb3BlLCAkZG9tZUdsb2JhbCwgJHN0YXRlLCAkZG9tZVVzZXIsICRkb21lQ2x1c3RlciwgJG1vZGFsLCAkZG9tZVB1YmxpYywgJHEpIHtcbiAgICAgICAgbGV0IHZtID0gdGhpcztcbiAgICAgICAgJHNjb3BlLiRlbWl0KCdwYWdlVGl0bGUnLCB7XG4gICAgICAgICAgICB0aXRsZTogJ+WFqOWxgOmFjee9ricsXG4gICAgICAgICAgICBkZXNjcml0aW9uOiAn5Zyo6L+Z6YeM5oKo5Y+v5Lul6L+b6KGM5LiA5Lqb5YWo5bGA6YWN572u77yM5L+d6K+BZG9tZW9z6IO95aSf5q2j5bi46L+Q6KGM5ZKM5L2/55So44CCJyxcbiAgICAgICAgICAgIG1vZDogJ2dsb2JhbCdcbiAgICAgICAgfSk7XG4gICAgICAgICRkb21lVXNlci5nZXRMb2dpblVzZXIoKS50aGVuKCh1c2VyKSA9PiB7XG4gICAgICAgICAgICBpZiAodXNlci51c2VybmFtZSAhPT0gJ2FkbWluJykge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygncHJvamVjdE1hbmFnZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBsZGFwT3B0aW9ucyA9ICRkb21lR2xvYmFsLmdldEdsb2FiYWxJbnN0YW5jZSgnbGRhcCcpLFxuICAgICAgICAgICAgc2VydmVyT3B0aW9ucyA9ICRkb21lR2xvYmFsLmdldEdsb2FiYWxJbnN0YW5jZSgnc2VydmVyJyksXG4gICAgICAgICAgICByZWdpc3RyeU9wdGlvbnMgPSAkZG9tZUdsb2JhbC5nZXRHbG9hYmFsSW5zdGFuY2UoJ3JlZ2lzdHJ5JyksXG4gICAgICAgICAgICBnaXRPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdnaXQnKSxcbiAgICAgICAgICAgIG1vbml0b3JPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdtb25pdG9yJyksXG4gICAgICAgICAgICBzc2hPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdzc2gnKSxcbiAgICAgICAgICAgIGNsdXN0ZXJPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdjbHVzdGVyJyksXG4gICAgICAgICAgICBub2RlU2VydmljZSA9ICRkb21lQ2x1c3Rlci5nZXRJbnN0YW5jZSgnTm9kZVNlcnZpY2UnKTtcblxuICAgICAgICB2bS5zZXJ2ZXJJbmZvID0ge307XG4gICAgICAgIHZtLmxkYXBJbmZvID0ge307XG4gICAgICAgIHZtLnJlZ2lzdHJ5SW5mbyA9IHt9O1xuICAgICAgICB2bS5naXRJbmZvID0ge307XG4gICAgICAgIHZtLnNzaEluZm8gPSB7fTtcbiAgICAgICAgdm0uY2x1c3RlckluZm8gPSB7fTtcbiAgICAgICAgdm0ubmV3VXNlciA9IHt9O1xuICAgICAgICB2bS5uZWVkVmFsaWRVc2VyID0ge1xuICAgICAgICAgICAgdmFsaWQ6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICAgIHZtLmtleSA9IHtcbiAgICAgICAgICAgIHVzZXJLZXk6ICcnLFxuICAgICAgICAgICAgbm9kZUtleTogJydcbiAgICAgICAgfTtcbiAgICAgICAgdm0uaXNTaG93QWRkID0gZmFsc2U7XG4gICAgICAgIHZtLmN1cnJlbnRVc2VyVHlwZSA9IHtcbiAgICAgICAgICAgIC8vICdVU0VSJyjmma7pgJrnlKjmiLcpIG9yICdMREFQJ1xuICAgICAgICAgICAgdHlwZTogJ1VTRVInXG4gICAgICAgIH07XG4gICAgICAgIC8vIOaZrumAmueUqOaIt+WIl+ihqFxuICAgICAgICB2bS51c2VyTGlzdCA9IFtdO1xuICAgICAgICAvLyBsZGFw55So5oi35YiX6KGoXG4gICAgICAgIHZtLmxkYXBVc2VyTGlzdCA9IFtdO1xuXG4gICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zID0gJGRvbWVQdWJsaWMuZ2V0TG9hZGluZ0luc3RhbmNlKCk7XG4gICAgICAgIHZtLnRhYkFjdGl2ZSA9IFt7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICAgICAgfV07XG5cblxuICAgICAgICBjbGFzcyBNb25pdG9yIHtcbiAgICAgICAgICAgIGluaXQoaW5mbykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnID0gaW5mbyB8fCB7fTtcblxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGZvcm1hcnRTdHJUb09iakFycihzdHIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyciA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RyQXJyID0gW107XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3RyQXJyID0gc3RyLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gc3RyQXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHN0ckFycltpXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJydcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnRyYW5zZmVyID0gZm9ybWFydFN0clRvT2JqQXJyKHRoaXMuY29uZmlnLnRyYW5zZmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5ncmFwaCA9IGZvcm1hcnRTdHJUb09iakFycih0aGlzLmNvbmZpZy5ncmFwaCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuanVkZ2UgPSBmb3JtYXJ0U3RyVG9PYmpBcnIodGhpcy5jb25maWcuanVkZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkSXRlbShpdGVtKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWdbaXRlbV0ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVBcnJJdGVtKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWdbaXRlbV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvcm1hcnRNb25pdG9yKCkge1xuICAgICAgICAgICAgICAgIGxldCBvYmogPSBhbmd1bGFyLmNvcHkodGhpcy5jb25maWcpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybWFydEFyclRvU3RyID0gKG1vbml0b3JBcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN0ckFyciA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IG1vbml0b3JBcnIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9uaXRvckFycltpXS50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyQXJyLnB1c2gobW9uaXRvckFycltpXS50ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyQXJyLmpvaW4oJywnKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIG9iai50cmFuc2ZlciA9IGZvcm1hcnRBcnJUb1N0cih0aGlzLmNvbmZpZy50cmFuc2Zlcik7XG4gICAgICAgICAgICAgICAgb2JqLmdyYXBoID0gZm9ybWFydEFyclRvU3RyKHRoaXMuY29uZmlnLmdyYXBoKTtcbiAgICAgICAgICAgICAgICBvYmouanVkZ2UgPSBmb3JtYXJ0QXJyVG9TdHIodGhpcy5jb25maWcuanVkZ2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAkZG9tZVVzZXIudXNlclNlcnZpY2UuZ2V0VXNlckxpc3QoKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgIHZtLnVzZXJMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBnZXRDbHVzdGVyTGlzdCA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICh2bS5jbHVzdGVyTGlzdCkge1xuICAgICAgICAgICAgICAgICRxLndoZW4odm0uY2x1c3Rlckxpc3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVNlcnZpY2UuZ2V0RGF0YSgpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2bS5jbHVzdGVyTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZtLmNsdXN0ZXJMaXN0O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2bS50b2dnbGVVc2VyVHlwZSA9ICh1c2VyVHlwZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHVzZXJUeXBlICE9PSB2bS5jdXJyZW50VXNlclR5cGUpIHtcbiAgICAgICAgICAgICAgICB2bS5jdXJyZW50VXNlclR5cGUudHlwZSA9IHVzZXJUeXBlO1xuICAgICAgICAgICAgICAgIHZtLmlzU2hvd0FkZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZtLmtleS51c2VyS2V5ID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZtLnRvZ2dsZVNob3dBZGQgPSAoKSA9PiB7XG4gICAgICAgICAgICB2bS5pc1Nob3dBZGQgPSAhdm0uaXNTaG93QWRkO1xuICAgICAgICB9O1xuICAgICAgICB2bS5tb2RpZnlQdyA9ICh1c2VyKSA9PiB7XG4gICAgICAgICAgICAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICduZXdQYXNzd2RNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnTmV3UGFzc3dkTW9kYWxDdHIgYXMgdm1QdycsXG4gICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXNlci51c2VybmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdm0ubW9kaWZ5VXNlckluZm8gPSAodXNlcikgPT4ge1xuICAgICAgICAgICAgJGRvbWVVc2VyLmdldExvZ2luVXNlcigpLnRoZW4oKGxvZ2luVXNlcikgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBjb3B5VXNlckluZm8gPSBsb2dpblVzZXIuaWQgPT09IHVzZXIuaWQgPyBhbmd1bGFyLmNvcHkobG9naW5Vc2VyKSA6IGFuZ3VsYXIuY29weSh1c2VyKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbW9kaWZ5VXNlckluZm9Nb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ01vZGlmeVVzZXJJbmZvQ3RyJyxcbiAgICAgICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb3B5VXNlckluZm87XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKCh1c2VySW5mbykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh1c2VyLCB1c2VySW5mbyk7XG4gICAgICAgICAgICAgICAgICAgICRkb21lVXNlci5nZXRMb2dpblVzZXIoKS50aGVuKGZ1bmN0aW9uIChsb2dpblVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2dpblVzZXIuaWQgPT09IHVzZXIuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmV4dGVuZChsb2dpblVzZXIsIHVzZXJJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB2bS5kZWxldGVVc2VyID0gKHVzZXIpID0+IHtcbiAgICAgICAgICAgIHZhciBpZCA9IHVzZXIuaWQ7XG4gICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuRGVsZXRlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgJGRvbWVVc2VyLnVzZXJTZXJ2aWNlLmRlbGV0ZVVzZXIoaWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZtLnVzZXJMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodm0udXNlckxpc3RbaV0uaWQgPT09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0udXNlckxpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5Yig6Zmk5aSx6LSl77yBJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB2bS5nZXRMZGFwID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF2bS5sZGFwSW5mby5pZCkge1xuICAgICAgICAgICAgICAgIGxkYXBPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZWcgPSAvKC4qKTooW146XSspL2c7XG4gICAgICAgICAgICAgICAgICAgIHZtLmxkYXBJbmZvID0gaW5mbztcbiAgICAgICAgICAgICAgICAgICAgdm0ubGRhcEluZm8udXJsID0gdm0ubGRhcEluZm8uc2VydmVyLnJlcGxhY2UocmVnLCAnJDEnKTtcbiAgICAgICAgICAgICAgICAgICAgdm0ubGRhcEluZm8ucG9ydCA9IHZtLmxkYXBJbmZvLnNlcnZlci5yZXBsYWNlKHJlZywgJyQyJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZtLmdldEdpdEluZm8gPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXZtLmdpdEluZm8uaWQpIHtcbiAgICAgICAgICAgICAgICBnaXRPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChnaXRJbmZvcykge1xuICAgICAgICAgICAgICAgICAgICB2bS5naXRJbmZvID0gZ2l0SW5mb3NbMF07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZtLmdldFJlZ2lzdHJ5SW5mbyA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdm0ucmVnaXN0cnlJbmZvLmlkKSB7XG4gICAgICAgICAgICAgICAgcmVnaXN0cnlPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnJlZ2lzdHJ5SW5mbyA9IGluZm87XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZtLmdldFNlcnZlckluZm8gPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXZtLnNlcnZlckluZm8uaWQpIHtcbiAgICAgICAgICAgICAgICBzZXJ2ZXJPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnNlcnZlckluZm8gPSBpbmZvO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2bS5nZXRNb25pdG9ySW5mbyA9ICgpID0+IHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGluaXRNb25pdG9ySW5mbyhpbmZvKSB7XG4gICAgICAgICAgICAgICAgdm0ubW9uaXRvcklucyA9IG5ldyBNb25pdG9yKCk7XG4gICAgICAgICAgICAgICAgdm0ubW9uaXRvcklucy5pbml0KGluZm8pO1xuICAgICAgICAgICAgICAgIHZtLm1vbml0b3JDb25maWcgPSB2bS5tb25pdG9ySW5zLmNvbmZpZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdm0ubW9uaXRvckNvbmZpZykge1xuICAgICAgICAgICAgICAgIG1vbml0b3JPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRNb25pdG9ySW5mbyhpbmZvKTtcbiAgICAgICAgICAgICAgICB9LCBpbml0TW9uaXRvckluZm8oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZtLmdldFdlYlNzaCA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdm0uc3NoSW5mby5pZCkge1xuICAgICAgICAgICAgICAgIHNzaE9wdGlvbnMuZ2V0RGF0YSgpLnRoZW4oZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdm0uc3NoSW5mbyA9IGluZm87XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vIEBwYXJhbSBuYW1lc3BhY2U6IOWPr+S4jeWhq++8jOacieWAvOaXtum7mOiupOS4uuivpW5hbWVzcGFjZVxuICAgICAgICB2bS50b2dnbGVDbHVzdGVyID0gKGNsdXN0ZXIsIG5hbWVzcGFjZSkgPT4ge1xuICAgICAgICAgICAgdm0uY2x1c3RlckluZm8uY2x1c3RlcklkID0gY2x1c3Rlci5pZDtcbiAgICAgICAgICAgIHZtLmNsdXN0ZXJJbmZvLmNsdXN0ZXJOYW1lID0gY2x1c3Rlci5uYW1lO1xuICAgICAgICAgICAgdm0uY2x1c3RlckluZm8uaG9zdCA9IGNsdXN0ZXIuYXBpO1xuICAgICAgICAgICAgdm0ua2V5Lm5vZGVLZXkgPSAnJztcbiAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnbmFtZXNwYWNlJyk7XG4gICAgICAgICAgICB2bS5jbHVzdGVyTG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ25vZGVMaXN0Jyk7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXROYW1lc3BhY2UoY2x1c3Rlci5pZCwgY2x1c3Rlci5uYW1lKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICB2bS5uYW1lc3BhY2VMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdm0uY2x1c3RlckluZm8ubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5hbWVzcGFjZSBvZiB2bS5uYW1lc3BhY2VMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmFtZXNwYWNlLm5hbWUgPT0gJ2RlZmF1bHQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0uY2x1c3RlckluZm8ubmFtZXNwYWNlID0gJ2RlZmF1bHQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2bS5jbHVzdGVySW5mby5uYW1lc3BhY2UgPSB2bS5uYW1lc3BhY2VMaXN0WzBdICYmIHZtLm5hbWVzcGFjZUxpc3RbMF0ubmFtZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdm0ubmFtZXNwYWNlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJJbmZvLm5hbWVzcGFjZSA9IG51bGw7XG4gICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICB2bS5jbHVzdGVyTG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCduYW1lc3BhY2UnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0Tm9kZUxpc3QoY2x1c3Rlci5pZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG5vZGVMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuY2FwYWNpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuY2FwYWNpdHkubWVtb3J5ID0gKG5vZGUuY2FwYWNpdHkubWVtb3J5IC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFub2RlLmxhYmVscykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5sYWJlbHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBub2RlLmlzVXNlZEJ5QnVpbGQgPSBub2RlLmxhYmVscy5CVUlMREVOViA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdm0ubm9kZUxpc3QgPSBub2RlTGlzdDtcbiAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ25vZGVMaXN0Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdG9nZ2xlQ2x1c3RlckluZm8gPSAoY2x1c3RlckluZm8pID0+IHtcbiAgICAgICAgICAgIHZtLmNsdXN0ZXJJbmZvID0gY2x1c3RlckluZm8gfHwge307XG4gICAgICAgICAgICBmb3IgKGxldCBjbHVzdGVyIG9mIHZtLmNsdXN0ZXJMaXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGNsdXN0ZXIuYXBpID09PSB2bS5jbHVzdGVySW5mby5ob3N0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnRvZ2dsZUNsdXN0ZXIoY2x1c3Rlciwgdm0uY2x1c3RlckluZm8ubmFtZXNwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdm0uaW5pdENsdXN0ZXJJbmZvID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF2bS5jbHVzdGVySW5mby5pZCkge1xuICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnY2x1c3RlcicpO1xuICAgICAgICAgICAgICAgICRxLmFsbChbZ2V0Q2x1c3Rlckxpc3QoKSwgY2x1c3Rlck9wdGlvbnMuZ2V0RGF0YSgpXSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZUNsdXN0ZXJJbmZvKHJlc1sxXSk7XG4gICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ2NsdXN0ZXInKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdm0uYWRkVXNlciA9IChmb3JtKSA9PiB7XG4gICAgICAgICAgICB2YXIgbmV3VXNlciA9IGFuZ3VsYXIuY29weSh2bS5uZXdVc2VyKTtcbiAgICAgICAgICAgIGRlbGV0ZSBuZXdVc2VyLnJlUGFzc3dvcmQ7XG5cbiAgICAgICAgICAgICRkb21lVXNlci51c2VyU2VydmljZS5jcmVhdGVVc2VyKG5ld1VzZXIpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+WIm+W7uuaIkOWKn++8gScpO1xuICAgICAgICAgICAgICAgIHZhciB1c2VyID0gYW5ndWxhci5jb3B5KG5ld1VzZXIpO1xuICAgICAgICAgICAgICAgIGlmIChyZXMuZGF0YS5yZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdm0udXNlckxpc3QucHVzaChyZXMuZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2bS5uZXdVc2VyID0ge307XG4gICAgICAgICAgICAgICAgdm0ubmVlZFZhbGlkVXNlci52YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGZvcm0uJHNldFByaXN0aW5lKCk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+WIm+W7uuWksei0pe+8gScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHZtLnNhdmVMZGFwID0gKCkgPT4ge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBhbmd1bGFyLmNvcHkodm0ubGRhcEluZm8pO1xuICAgICAgICAgICAgZGF0YS5zZXJ2ZXIgPSBkYXRhLnVybCArICc6JyArIGRhdGEucG9ydDtcbiAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnVybDtcbiAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnBvcnQ7XG4gICAgICAgICAgICBsZGFwT3B0aW9ucy5tb2RpZnlEYXRhKGRhdGEpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZtLmdldExkYXAoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2bS5zYXZlR2l0ID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF2bS5naXRJbmZvLmlkKSB7XG4gICAgICAgICAgICAgICAgdm0uZ2l0SW5mby50eXBlID0gJ0dJVExBQic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnaXRPcHRpb25zLm1vZGlmeURhdGEodm0uZ2l0SW5mbykudGhlbihmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLmdpdEluZm8gPSBpbmZvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2bS5zYXZlUmVnaXN0cnkgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodm0ucmVnaXN0cnlJbmZvLmlkKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHZtLnJlZ2lzdHJ5SW5mby5pZDtcbiAgICAgICAgICAgICAgICBkZWxldGUgdm0ucmVnaXN0cnlJbmZvLmNyZWF0ZVRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmVnaXN0cnlJbmZvID0gYW5ndWxhci5jb3B5KHZtLnJlZ2lzdHJ5SW5mbyk7XG4gICAgICAgICAgICBpZiAocmVnaXN0cnlJbmZvLnN0YXR1cyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSByZWdpc3RyeUluZm8uY2VydGlmaWNhdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlZ2lzdHJ5T3B0aW9ucy5tb2RpZnlEYXRhKHJlZ2lzdHJ5SW5mbykudGhlbihmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnJlZ2lzdHJ5SW5mbyA9IGluZm87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHZtLnNhdmVTZXJ2ZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBzZXJ2ZXJPcHRpb25zLm1vZGlmeURhdGEodm0uc2VydmVySW5mbykudGhlbihmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnNlcnZlckluZm8gPSBpbmZvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2bS5zYXZlTW9uaXRvciA9ICgpID0+IHtcbiAgICAgICAgICAgIG1vbml0b3JPcHRpb25zLm1vZGlmeURhdGEodm0ubW9uaXRvcklucy5mb3JtYXJ0TW9uaXRvcigpKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdm0ubW9uaXRvcklucy5pbml0KGluZm8pO1xuICAgICAgICAgICAgICAgICAgICB2bS5tb25pdG9yQ29uZmlnID0gdm0ubW9uaXRvcklucy5jb25maWc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHZtLnNhdmVTc2ggPSAoKSA9PiB7XG4gICAgICAgICAgICBzc2hPcHRpb25zLm1vZGlmeURhdGEodm0uc3NoSW5mbykudGhlbigoaW5mbykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnNzaEluZm8gPSBpbmZvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2bS5zYXZlQ2x1c3RlciA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBjbHVzdGVySW5mbywgbm9kZUxpc3QgPSB2bS5ub2RlTGlzdCxcbiAgICAgICAgICAgICAgICBhZGROb2RlTGFiZWxzSW5mbyA9IFtdLFxuICAgICAgICAgICAgICAgIGRlbGV0ZU5vZGVMYWJlbHNJbmZvID0gW107XG5cbiAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5pc1VzZWRCeUJ1aWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZE5vZGVMYWJlbHNJbmZvLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogbm9kZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQlVJTERFTlY6ICdIT1NURU5WVFlQRSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlTm9kZUxhYmVsc0luZm8ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlOiBub2RlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBCVUlMREVOVjogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWRkTm9kZUxhYmVsc0luZm8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+ivt+iHs+Wwkeiuvue9ruS4gOWPsOeUqOS6juaehOW7uueahOS4u+acuu+8gScpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdm0uY2x1c3RlckxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdzdWJtaXRDbHVzdGVyJyk7XG4gICAgICAgICAgICBjbHVzdGVyT3B0aW9ucy5tb2RpZnlEYXRhKHZtLmNsdXN0ZXJJbmZvKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgY2x1c3RlckluZm8gPSBpbmZvO1xuICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVTZXJ2aWNlLmFkZExhYmVsKHZtLmNsdXN0ZXJJbmZvLmNsdXN0ZXJJZCwgYWRkTm9kZUxhYmVsc0luZm8pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9LCAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn6ZSZ6K+v77yBJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZGVsZXRlTm9kZUxhYmVsc0luZm8ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlU2VydmljZS5kZWxldGVMYWJlbCh2bS5jbHVzdGVySW5mby5jbHVzdGVySWQsIGRlbGV0ZU5vZGVMYWJlbHNJbmZvKS5jYXRjaCgocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfplJnor6/vvIEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdG9nZ2xlQ2x1c3RlckluZm8oY2x1c3RlckluZm8pO1xuICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ3N1Ym1pdENsdXN0ZXInKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBzdGF0ZUluZm8gPSAkc3RhdGUuJGN1cnJlbnQubmFtZTtcbiAgICAgICAgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdsZGFwaW5mbycpICE9PSAtMSkge1xuICAgICAgICAgICAgdm0udGFiQWN0aXZlWzFdLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB2bS5nZXRMZGFwKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ2dpdGluZm8nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVsyXS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdm0uZ2V0R2l0SW5mbygpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdyZWdpc3RyeWluZm8nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVszXS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdm0uZ2V0UmVnaXN0cnlJbmZvKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ3NlcnZlcmluZm8nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVs0XS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdm0uZ2V0U2VydmVySW5mbygpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdtb25pdG9yaW5mbycpICE9PSAtMSkge1xuICAgICAgICAgICAgdm0udGFiQWN0aXZlWzVdLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB2bS5nZXRNb25pdG9ySW5mbygpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdzc2hpbmZvJykgIT09IC0xKSB7XG4gICAgICAgICAgICB2bS50YWJBY3RpdmVbNl0uYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHZtLmdldFdlYlNzaCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdjbHVzdGVyaW5mbycpICE9PSAtMSkge1xuICAgICAgICAgICAgdm0udGFiQWN0aXZlWzddLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB2bS5pbml0Q2x1c3RlckluZm8oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVswXS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIEdsb2JhbFNldHRpbmdDdHIuJGluamVjdCA9IFsnJHNjb3BlJywgJyRkb21lR2xvYmFsJywgJyRzdGF0ZScsICckZG9tZVVzZXInLCAnJGRvbWVDbHVzdGVyJywgJyRtb2RhbCcsICckZG9tZVB1YmxpYycsICckcSddO1xuXG5cbiAgICBmdW5jdGlvbiBOZXdQYXNzd2RNb2RhbEN0cih1c2VybmFtZSwgJGRvbWVVc2VyLCAkbW9kYWxJbnN0YW5jZSwgJGRvbWVQdWJsaWMpIHtcbiAgICAgICAgdmFyIHZtID0gdGhpcztcbiAgICAgICAgdm0uY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgICAgICB9O1xuICAgICAgICB2bS5zdWJQdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB1c2VySW5mbyA9IHtcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHZtLnBhc3N3ZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICRkb21lVXNlci51c2VyU2VydmljZS5tb2RpZnlQdyh1c2VySW5mbykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5L+u5pS55oiQ5Yqf77yBJyk7XG4gICAgICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5L+u5pS55aSx6LSl77yBJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgTmV3UGFzc3dkTW9kYWxDdHIuJGluamVjdCA9IFsndXNlcm5hbWUnLCAnJGRvbWVVc2VyJywgJyRtb2RhbEluc3RhbmNlJywgJyRkb21lUHVibGljJ107XG5cbn0pKHdpbmRvdy5kb21lQXBwKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
