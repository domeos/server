'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @author ChandraLee
 */

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L3RwbC9nbG9iYWxTZXR0aW5nL2dsb2JhbFNldHRpbmdDdHIuZXMiXSwibmFtZXMiOlsiZG9tZUFwcCIsInVuZGVmaW5lZCIsImNvbnRyb2xsZXIiLCJHbG9iYWxTZXR0aW5nQ3RyIiwiTmV3UGFzc3dkTW9kYWxDdHIiLCIkc2NvcGUiLCIkZG9tZUdsb2JhbCIsIiRzdGF0ZSIsIiRkb21lVXNlciIsIiRkb21lQ2x1c3RlciIsIiRtb2RhbCIsIiRkb21lUHVibGljIiwiJHEiLCJ2bSIsIiRlbWl0IiwidGl0bGUiLCJkZXNjcml0aW9uIiwibW9kIiwiZ2V0TG9naW5Vc2VyIiwidGhlbiIsInVzZXIiLCJ1c2VybmFtZSIsImdvIiwibGRhcE9wdGlvbnMiLCJnZXRHbG9hYmFsSW5zdGFuY2UiLCJzZXJ2ZXJPcHRpb25zIiwicmVnaXN0cnlPcHRpb25zIiwiZ2l0T3B0aW9ucyIsIm1vbml0b3JPcHRpb25zIiwic3NoT3B0aW9ucyIsImNsdXN0ZXJPcHRpb25zIiwibm9kZVNlcnZpY2UiLCJnZXRJbnN0YW5jZSIsInNlcnZlckluZm8iLCJsZGFwSW5mbyIsInJlZ2lzdHJ5SW5mbyIsImdpdEluZm8iLCJzc2hJbmZvIiwiY2x1c3RlckluZm8iLCJuZXdVc2VyIiwibmVlZFZhbGlkVXNlciIsInZhbGlkIiwia2V5IiwidXNlcktleSIsIm5vZGVLZXkiLCJpc1Nob3dBZGQiLCJjdXJyZW50VXNlclR5cGUiLCJ0eXBlIiwidXNlckxpc3QiLCJsZGFwVXNlckxpc3QiLCJjbHVzdGVyTG9hZGluZ0lucyIsImdldExvYWRpbmdJbnN0YW5jZSIsInRhYkFjdGl2ZSIsImFjdGl2ZSIsIk1vbml0b3IiLCJpbmZvIiwiY29uZmlnIiwiZm9ybWFydFN0clRvT2JqQXJyIiwic3RyIiwiYXJyIiwic3RyQXJyIiwidGV4dCIsInNwbGl0IiwiaSIsImwiLCJsZW5ndGgiLCJwdXNoIiwidHJhbnNmZXIiLCJncmFwaCIsImp1ZGdlIiwiaXRlbSIsImluZGV4Iiwic3BsaWNlIiwib2JqIiwiYW5ndWxhciIsImNvcHkiLCJmb3JtYXJ0QXJyVG9TdHIiLCJtb25pdG9yQXJyIiwiam9pbiIsInVzZXJTZXJ2aWNlIiwiZ2V0VXNlckxpc3QiLCJyZXMiLCJkYXRhIiwicmVzdWx0IiwiZ2V0Q2x1c3Rlckxpc3QiLCJjbHVzdGVyTGlzdCIsIndoZW4iLCJnZXREYXRhIiwidG9nZ2xlVXNlclR5cGUiLCJ1c2VyVHlwZSIsInRvZ2dsZVNob3dBZGQiLCJtb2RpZnlQdyIsIm9wZW4iLCJ0ZW1wbGF0ZVVybCIsInNpemUiLCJyZXNvbHZlIiwibW9kaWZ5VXNlckluZm8iLCJsb2dpblVzZXIiLCJjb3B5VXNlckluZm8iLCJpZCIsIm1vZGFsSW5zdGFuY2UiLCJ1c2VySW5mbyIsImV4dGVuZCIsImRlbGV0ZVVzZXIiLCJvcGVuRGVsZXRlIiwib3Blbldhcm5pbmciLCJnZXRMZGFwIiwicmVnIiwidXJsIiwic2VydmVyIiwicmVwbGFjZSIsInBvcnQiLCJnZXRHaXRJbmZvIiwiZ2l0SW5mb3MiLCJnZXRSZWdpc3RyeUluZm8iLCJnZXRTZXJ2ZXJJbmZvIiwiZ2V0TW9uaXRvckluZm8iLCJpbml0TW9uaXRvckluZm8iLCJtb25pdG9ySW5zIiwiaW5pdCIsIm1vbml0b3JDb25maWciLCJnZXRXZWJTc2giLCJ0b2dnbGVDbHVzdGVyIiwiY2x1c3RlciIsIm5hbWVzcGFjZSIsImNsdXN0ZXJJZCIsImNsdXN0ZXJOYW1lIiwibmFtZSIsImhvc3QiLCJhcGkiLCJzdGFydExvYWRpbmciLCJnZXROYW1lc3BhY2UiLCJuYW1lc3BhY2VMaXN0IiwiZmluYWxseSIsImZpbmlzaExvYWRpbmciLCJnZXROb2RlTGlzdCIsIm5vZGVMaXN0Iiwibm9kZSIsImNhcGFjaXR5IiwibWVtb3J5IiwidG9GaXhlZCIsImxhYmVscyIsImlzVXNlZEJ5QnVpbGQiLCJCVUlMREVOViIsInRvZ2dsZUNsdXN0ZXJJbmZvIiwiaW5pdENsdXN0ZXJJbmZvIiwiYWxsIiwiYWRkVXNlciIsImZvcm0iLCJyZVBhc3N3b3JkIiwiY3JlYXRlVXNlciIsIm9wZW5Qcm9tcHQiLCIkc2V0UHJpc3RpbmUiLCJzYXZlTGRhcCIsIm1vZGlmeURhdGEiLCJzYXZlR2l0Iiwic2F2ZVJlZ2lzdHJ5IiwiY3JlYXRlVGltZSIsInN0YXR1cyIsImNlcnRpZmljYXRpb24iLCJzYXZlU2VydmVyIiwic2F2ZU1vbml0b3IiLCJmb3JtYXJ0TW9uaXRvciIsInNhdmVTc2giLCJzYXZlQ2x1c3RlciIsImFkZE5vZGVMYWJlbHNJbmZvIiwiZGVsZXRlTm9kZUxhYmVsc0luZm8iLCJhZGRMYWJlbCIsIm1zZyIsInJlc3VsdE1zZyIsInJlamVjdCIsImRlbGV0ZUxhYmVsIiwiY2F0Y2giLCJzdGF0ZUluZm8iLCIkY3VycmVudCIsImluZGV4T2YiLCIkaW5qZWN0IiwiJG1vZGFsSW5zdGFuY2UiLCJjYW5jZWwiLCJkaXNtaXNzIiwic3ViUHciLCJwYXNzd29yZCIsInBhc3N3ZCIsImNsb3NlIiwid2luZG93Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7OztBQUlBLENBQUMsVUFBQ0EsT0FBRCxFQUFVQyxTQUFWLEVBQXdCO0FBQ3JCOztBQUNBLFFBQUksT0FBT0QsT0FBUCxLQUFtQixXQUF2QixFQUFvQzs7QUFFcENBLFlBQVFFLFVBQVIsQ0FBbUIsa0JBQW5CLEVBQXVDQyxnQkFBdkMsRUFDS0QsVUFETCxDQUNnQixtQkFEaEIsRUFDcUNFLGlCQURyQzs7QUFHQSxhQUFTRCxnQkFBVCxDQUEwQkUsTUFBMUIsRUFBa0NDLFdBQWxDLEVBQStDQyxNQUEvQyxFQUF1REMsU0FBdkQsRUFBa0VDLFlBQWxFLEVBQWdGQyxNQUFoRixFQUF3RkMsV0FBeEYsRUFBcUdDLEVBQXJHLEVBQXlHO0FBQ3JHLFlBQUlDLEtBQUssSUFBVDtBQUNBUixlQUFPUyxLQUFQLENBQWEsV0FBYixFQUEwQjtBQUN0QkMsbUJBQU8sTUFEZTtBQUV0QkMsd0JBQVksbUNBRlU7QUFHdEJDLGlCQUFLO0FBSGlCLFNBQTFCO0FBS0FULGtCQUFVVSxZQUFWLEdBQXlCQyxJQUF6QixDQUE4QixVQUFDQyxJ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cUssTUFBSCxHQUFZLFlBQVk7QUFDcEJELDJCQUFlRSxPQUFmO0FBQ0gsU0FGRDtBQUdBdEssV0FBR3VLLEtBQUgsR0FBVyxZQUFZO0FBQ25CLGdCQUFJL0UsV0FBVztBQUNYaEYsMEJBQVVBLFFBREM7QUFFWGdLLDBCQUFVeEssR0FBR3lLO0FBRkYsYUFBZjtBQUlBOUssc0JBQVV1RSxXQUFWLENBQXNCWSxRQUF0QixDQUErQlUsUUFBL0IsRUFBeUNsRixJQUF6QyxDQUE4QyxZQUFZO0FBQ3REUiw0QkFBWTRJLFVBQVosQ0FBdUIsT0FBdkI7QUFDQTBCLCtCQUFlTSxLQUFmO0FBQ0gsYUFIRCxFQUdHLFlBQVk7QUFDWDVLLDRCQUFZOEYsV0FBWixDQUF3QixPQUF4QjtBQUNILGFBTEQ7QUFNSCxTQVhEO0FBWUg7QUFDRHJHLHNCQUFrQjRLLE9BQWxCLEdBQTRCLENBQUMsVUFBRCxFQUFhLFdBQWIsRUFBMEIsZ0JBQTFCLEVBQTRDLGFBQTVDLENBQTVCO0FBRUgsQ0FoZkQsRUFnZkdRLE9BQU94TCxPQWhmViIsImZpbGUiOiJpbmRleC90cGwvZ2xvYmFsU2V0dGluZy9nbG9iYWxTZXR0aW5nQ3RyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIEBhdXRob3IgQ2hhbmRyYUxlZVxuICovXG5cbigoZG9tZUFwcCwgdW5kZWZpbmVkKSA9PiB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZG9tZUFwcCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcblxuICAgIGRvbWVBcHAuY29udHJvbGxlcignR2xvYmFsU2V0dGluZ0N0cicsIEdsb2JhbFNldHRpbmdDdHIpXG4gICAgICAgIC5jb250cm9sbGVyKCdOZXdQYXNzd2RNb2RhbEN0cicsIE5ld1Bhc3N3ZE1vZGFsQ3RyKTtcblxuICAgIGZ1bmN0aW9uIEdsb2JhbFNldHRpbmdDdHIoJHNjb3BlLCAkZG9tZUdsb2JhbCwgJHN0YXRlLCAkZG9tZVVzZXIsICRkb21lQ2x1c3RlciwgJG1vZGFsLCAkZG9tZVB1YmxpYywgJHEpIHtcbiAgICAgICAgbGV0IHZtID0gdGhpcztcbiAgICAgICAgJHNjb3BlLiRlbWl0KCdwYWdlVGl0bGUnLCB7XG4gICAgICAgICAgICB0aXRsZTogJ+WFqOWxgOmFjee9ricsXG4gICAgICAgICAgICBkZXNjcml0aW9uOiAn5Zyo6L+Z6YeM5oKo5Y+v5Lul6L+b6KGM5LiA5Lqb5YWo5bGA6YWN572u77yM5L+d6K+BZG9tZW9z6IO95aSf5q2j5bi46L+Q6KGM5ZKM5L2/55So44CCJyxcbiAgICAgICAgICAgIG1vZDogJ2dsb2JhbCdcbiAgICAgICAgfSk7XG4gICAgICAgICRkb21lVXNlci5nZXRMb2dpblVzZXIoKS50aGVuKCh1c2VyKSA9PiB7XG4gICAgICAgICAgICBpZiAodXNlci51c2VybmFtZSAhPT0gJ2FkbWluJykge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygncHJvamVjdE1hbmFnZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBsZGFwT3B0aW9ucyA9ICRkb21lR2xvYmFsLmdldEdsb2FiYWxJbnN0YW5jZSgnbGRhcCcpLFxuICAgICAgICAgICAgc2VydmVyT3B0aW9ucyA9ICRkb21lR2xvYmFsLmdldEdsb2FiYWxJbnN0YW5jZSgnc2VydmVyJyksXG4gICAgICAgICAgICByZWdpc3RyeU9wdGlvbnMgPSAkZG9tZUdsb2JhbC5nZXRHbG9hYmFsSW5zdGFuY2UoJ3JlZ2lzdHJ5JyksXG4gICAgICAgICAgICBnaXRPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdnaXQnKSxcbiAgICAgICAgICAgIG1vbml0b3JPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdtb25pdG9yJyksXG4gICAgICAgICAgICBzc2hPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdzc2gnKSxcbiAgICAgICAgICAgIGNsdXN0ZXJPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdjbHVzdGVyJyksXG4gICAgICAgICAgICBub2RlU2VydmljZSA9ICRkb21lQ2x1c3Rlci5nZXRJbnN0YW5jZSgnTm9kZVNlcnZpY2UnKTtcblxuICAgICAgICB2bS5zZXJ2ZXJJbmZvID0ge307XG4gICAgICAgIHZtLmxkYXBJbmZvID0ge307XG4gICAgICAgIHZtLnJlZ2lzdHJ5SW5mbyA9IHt9O1xuICAgICAgICB2bS5naXRJbmZvID0ge307XG4gICAgICAgIHZtLnNzaEluZm8gPSB7fTtcbiAgICAgICAgdm0uY2x1c3RlckluZm8gPSB7fTtcbiAgICAgICAgdm0ubmV3VXNlciA9IHt9O1xuICAgICAgICB2bS5uZWVkVmFsaWRVc2VyID0ge1xuICAgICAgICAgICAgdmFsaWQ6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICAgIHZtLmtleSA9IHtcbiAgICAgICAgICAgIHVzZXJLZXk6ICcnLFxuICAgICAgICAgICAgbm9kZUtleTogJydcbiAgICAgICAgfTtcbiAgICAgICAgdm0uaXNTaG93QWRkID0gZmFsc2U7XG4gICAgICAgIHZtLmN1cnJlbnRVc2VyVHlwZSA9IHtcbiAgICAgICAgICAgIC8vICdVU0VSJyjmma7pgJrnlKjmiLcpIG9yICdMREFQJ1xuICAgICAgICAgICAgdHlwZTogJ1VTRVInXG4gICAgICAgIH07XG4gICAgICAgIC8vIOaZrumAmueUqOaIt+WIl+ihqFxuICAgICAgICB2bS51c2VyTGlzdCA9IFtdO1xuICAgICAgICAvLyBsZGFw55So5oi35YiX6KGoXG4gICAgICAgIHZtLmxkYXBVc2VyTGlzdCA9IFtdO1xuXG4gICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zID0gJGRvbWVQdWJsaWMuZ2V0TG9hZGluZ0luc3RhbmNlKCk7XG4gICAgICAgIHZtLnRhYkFjdGl2ZSA9IFt7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICAgICAgfV07XG5cblxuICAgICAgICBjbGFzcyBNb25pdG9yIHtcbiAgICAgICAgICAgIGluaXQoaW5mbykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnID0gaW5mbyB8fCB7fTtcblxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGZvcm1hcnRTdHJUb09iakFycihzdHIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyciA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RyQXJyID0gW107XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3RyQXJyID0gc3RyLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gc3RyQXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHN0ckFycltpXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJydcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnRyYW5zZmVyID0gZm9ybWFydFN0clRvT2JqQXJyKHRoaXMuY29uZmlnLnRyYW5zZmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5ncmFwaCA9IGZvcm1hcnRTdHJUb09iakFycih0aGlzLmNvbmZpZy5ncmFwaCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuanVkZ2UgPSBmb3JtYXJ0U3RyVG9PYmpBcnIodGhpcy5jb25maWcuanVkZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkSXRlbShpdGVtKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWdbaXRlbV0ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVBcnJJdGVtKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWdbaXRlbV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvcm1hcnRNb25pdG9yKCkge1xuICAgICAgICAgICAgICAgIGxldCBvYmogPSBhbmd1bGFyLmNvcHkodGhpcy5jb25maWcpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybWFydEFyclRvU3RyID0gKG1vbml0b3JBcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN0ckFyciA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IG1vbml0b3JBcnIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9uaXRvckFycltpXS50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyQXJyLnB1c2gobW9uaXRvckFycltpXS50ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyQXJyLmpvaW4oJywnKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIG9iai50cmFuc2ZlciA9IGZvcm1hcnRBcnJUb1N0cih0aGlzLmNvbmZpZy50cmFuc2Zlcik7XG4gICAgICAgICAgICAgICAgb2JqLmdyYXBoID0gZm9ybWFydEFyclRvU3RyKHRoaXMuY29uZmlnLmdyYXBoKTtcbiAgICAgICAgICAgICAgICBvYmouanVkZ2UgPSBmb3JtYXJ0QXJyVG9TdHIodGhpcy5jb25maWcuanVkZ2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAkZG9tZVVzZXIudXNlclNlcnZpY2UuZ2V0VXNlckxpc3QoKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgIHZtLnVzZXJMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBnZXRDbHVzdGVyTGlzdCA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICh2bS5jbHVzdGVyTGlzdCkge1xuICAgICAgICAgICAgICAgICRxLndoZW4odm0uY2x1c3Rlckxpc3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVNlcnZpY2UuZ2V0RGF0YSgpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2bS5jbHVzdGVyTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZtLmNsdXN0ZXJMaXN0O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2bS50b2dnbGVVc2VyVHlwZSA9ICh1c2VyVHlwZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHVzZXJUeXBlICE9PSB2bS5jdXJyZW50VXNlclR5cGUpIHtcbiAgICAgICAgICAgICAgICB2bS5jdXJyZW50VXNlclR5cGUudHlwZSA9IHVzZXJUeXBlO1xuICAgICAgICAgICAgICAgIHZtLmlzU2hvd0FkZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZtLmtleS51c2VyS2V5ID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZtLnRvZ2dsZVNob3dBZGQgPSAoKSA9PiB7XG4gICAgICAgICAgICB2bS5pc1Nob3dBZGQgPSAhdm0uaXNTaG93QWRkO1xuICAgICAgICB9O1xuICAgICAgICB2bS5tb2RpZnlQdyA9ICh1c2VyKSA9PiB7XG4gICAgICAgICAgICAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICduZXdQYXNzd2RNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnTmV3UGFzc3dkTW9kYWxDdHIgYXMgdm1QdycsXG4gICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXNlci51c2VybmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdm0ubW9kaWZ5VXNlckluZm8gPSAodXNlcikgPT4ge1xuICAgICAgICAgICAgJGRvbWVVc2VyLmdldExvZ2luVXNlcigpLnRoZW4oKGxvZ2luVXNlcikgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBjb3B5VXNlckluZm8gPSBsb2dpblVzZXIuaWQgPT09IHVzZXIuaWQgPyBhbmd1bGFyLmNvcHkobG9naW5Vc2VyKSA6IGFuZ3VsYXIuY29weSh1c2VyKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbW9kaWZ5VXNlckluZm9Nb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ01vZGlmeVVzZXJJbmZvQ3RyJyxcbiAgICAgICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb3B5VXNlckluZm87XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKCh1c2VySW5mbykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh1c2VyLCB1c2VySW5mbyk7XG4gICAgICAgICAgICAgICAgICAgICRkb21lVXNlci5nZXRMb2dpblVzZXIoKS50aGVuKGZ1bmN0aW9uIChsb2dpblVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2dpblVzZXIuaWQgPT09IHVzZXIuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmV4dGVuZChsb2dpblVzZXIsIHVzZXJJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB2bS5kZWxldGVVc2VyID0gKHVzZXIpID0+IHtcbiAgICAgICAgICAgIHZhciBpZCA9IHVzZXIuaWQ7XG4gICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuRGVsZXRlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgJGRvbWVVc2VyLnVzZXJTZXJ2aWNlLmRlbGV0ZVVzZXIoaWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZtLnVzZXJMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodm0udXNlckxpc3RbaV0uaWQgPT09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0udXNlckxpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5Yig6Zmk5aSx6LSl77yBJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB2bS5nZXRMZGFwID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF2bS5sZGFwSW5mby5pZCkge1xuICAgICAgICAgICAgICAgIGxkYXBPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZWcgPSAvKC4qKTooW146XSspL2c7XG4gICAgICAgICAgICAgICAgICAgIHZtLmxkYXBJbmZvID0gaW5mbztcbiAgICAgICAgICAgICAgICAgICAgdm0ubGRhcEluZm8udXJsID0gdm0ubGRhcEluZm8uc2VydmVyLnJlcGxhY2UocmVnLCAnJDEnKTtcbiAgICAgICAgICAgICAgICAgICAgdm0ubGRhcEluZm8ucG9ydCA9IHZtLmxkYXBJbmZvLnNlcnZlci5yZXBsYWNlKHJlZywgJyQyJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZtLmdldEdpdEluZm8gPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXZtLmdpdEluZm8uaWQpIHtcbiAgICAgICAgICAgICAgICBnaXRPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChnaXRJbmZvcykge1xuICAgICAgICAgICAgICAgICAgICB2bS5naXRJbmZvID0gZ2l0SW5mb3NbMF07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZtLmdldFJlZ2lzdHJ5SW5mbyA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdm0ucmVnaXN0cnlJbmZvLmlkKSB7XG4gICAgICAgICAgICAgICAgcmVnaXN0cnlPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnJlZ2lzdHJ5SW5mbyA9IGluZm87XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZtLmdldFNlcnZlckluZm8gPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXZtLnNlcnZlckluZm8uaWQpIHtcbiAgICAgICAgICAgICAgICBzZXJ2ZXJPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnNlcnZlckluZm8gPSBpbmZvO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2bS5nZXRNb25pdG9ySW5mbyA9ICgpID0+IHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGluaXRNb25pdG9ySW5mbyhpbmZvKSB7XG4gICAgICAgICAgICAgICAgdm0ubW9uaXRvcklucyA9IG5ldyBNb25pdG9yKCk7XG4gICAgICAgICAgICAgICAgdm0ubW9uaXRvcklucy5pbml0KGluZm8pO1xuICAgICAgICAgICAgICAgIHZtLm1vbml0b3JDb25maWcgPSB2bS5tb25pdG9ySW5zLmNvbmZpZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdm0ubW9uaXRvckNvbmZpZykge1xuICAgICAgICAgICAgICAgIG1vbml0b3JPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRNb25pdG9ySW5mbyhpbmZvKTtcbiAgICAgICAgICAgICAgICB9LCBpbml0TW9uaXRvckluZm8oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZtLmdldFdlYlNzaCA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdm0uc3NoSW5mby5pZCkge1xuICAgICAgICAgICAgICAgIHNzaE9wdGlvbnMuZ2V0RGF0YSgpLnRoZW4oZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdm0uc3NoSW5mbyA9IGluZm87XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vIEBwYXJhbSBuYW1lc3BhY2U6IOWPr+S4jeWhq++8jOacieWAvOaXtum7mOiupOS4uuivpW5hbWVzcGFjZVxuICAgICAgICB2bS50b2dnbGVDbHVzdGVyID0gKGNsdXN0ZXIsIG5hbWVzcGFjZSkgPT4ge1xuICAgICAgICAgICAgdm0uY2x1c3RlckluZm8uY2x1c3RlcklkID0gY2x1c3Rlci5pZDtcbiAgICAgICAgICAgIHZtLmNsdXN0ZXJJbmZvLmNsdXN0ZXJOYW1lID0gY2x1c3Rlci5uYW1lO1xuICAgICAgICAgICAgdm0uY2x1c3RlckluZm8uaG9zdCA9IGNsdXN0ZXIuYXBpO1xuICAgICAgICAgICAgdm0ua2V5Lm5vZGVLZXkgPSAnJztcbiAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnbmFtZXNwYWNlJyk7XG4gICAgICAgICAgICB2bS5jbHVzdGVyTG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ25vZGVMaXN0Jyk7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXROYW1lc3BhY2UoY2x1c3Rlci5pZCwgY2x1c3Rlci5uYW1lKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICB2bS5uYW1lc3BhY2VMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdm0uY2x1c3RlckluZm8ubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5hbWVzcGFjZSBvZiB2bS5uYW1lc3BhY2VMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmFtZXNwYWNlLm5hbWUgPT0gJ2RlZmF1bHQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0uY2x1c3RlckluZm8ubmFtZXNwYWNlID0gJ2RlZmF1bHQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2bS5jbHVzdGVySW5mby5uYW1lc3BhY2UgPSB2bS5uYW1lc3BhY2VMaXN0WzBdICYmIHZtLm5hbWVzcGFjZUxpc3RbMF0ubmFtZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdm0ubmFtZXNwYWNlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJJbmZvLm5hbWVzcGFjZSA9IG51bGw7XG4gICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICB2bS5jbHVzdGVyTG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCduYW1lc3BhY2UnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0Tm9kZUxpc3QoY2x1c3Rlci5pZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG5vZGVMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuY2FwYWNpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuY2FwYWNpdHkubWVtb3J5ID0gKG5vZGUuY2FwYWNpdHkubWVtb3J5IC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFub2RlLmxhYmVscykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5sYWJlbHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBub2RlLmlzVXNlZEJ5QnVpbGQgPSBub2RlLmxhYmVscy5CVUlMREVOViA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdm0ubm9kZUxpc3QgPSBub2RlTGlzdDtcbiAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ25vZGVMaXN0Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdG9nZ2xlQ2x1c3RlckluZm8gPSAoY2x1c3RlckluZm8pID0+IHtcbiAgICAgICAgICAgIHZtLmNsdXN0ZXJJbmZvID0gY2x1c3RlckluZm8gfHwge307XG4gICAgICAgICAgICBmb3IgKGxldCBjbHVzdGVyIG9mIHZtLmNsdXN0ZXJMaXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGNsdXN0ZXIuYXBpID09PSB2bS5jbHVzdGVySW5mby5ob3N0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnRvZ2dsZUNsdXN0ZXIoY2x1c3Rlciwgdm0uY2x1c3RlckluZm8ubmFtZXNwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdm0uaW5pdENsdXN0ZXJJbmZvID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF2bS5jbHVzdGVySW5mby5pZCkge1xuICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnY2x1c3RlcicpO1xuICAgICAgICAgICAgICAgICRxLmFsbChbZ2V0Q2x1c3Rlckxpc3QoKSwgY2x1c3Rlck9wdGlvbnMuZ2V0RGF0YSgpXSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZUNsdXN0ZXJJbmZvKHJlc1sxXSk7XG4gICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ2NsdXN0ZXInKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdm0uYWRkVXNlciA9IChmb3JtKSA9PiB7XG4gICAgICAgICAgICB2YXIgbmV3VXNlciA9IGFuZ3VsYXIuY29weSh2bS5uZXdVc2VyKTtcbiAgICAgICAgICAgIGRlbGV0ZSBuZXdVc2VyLnJlUGFzc3dvcmQ7XG5cbiAgICAgICAgICAgICRkb21lVXNlci51c2VyU2VydmljZS5jcmVhdGVVc2VyKG5ld1VzZXIpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+WIm+W7uuaIkOWKn++8gScpO1xuICAgICAgICAgICAgICAgIHZhciB1c2VyID0gYW5ndWxhci5jb3B5KG5ld1VzZXIpO1xuICAgICAgICAgICAgICAgIGlmIChyZXMuZGF0YS5yZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdm0udXNlckxpc3QucHVzaChyZXMuZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2bS5uZXdVc2VyID0ge307XG4gICAgICAgICAgICAgICAgdm0ubmVlZFZhbGlkVXNlci52YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGZvcm0uJHNldFByaXN0aW5lKCk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+WIm+W7uuWksei0pe+8gScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHZtLnNhdmVMZGFwID0gKCkgPT4ge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBhbmd1bGFyLmNvcHkodm0ubGRhcEluZm8pO1xuICAgICAgICAgICAgZGF0YS5zZXJ2ZXIgPSBkYXRhLnVybCArICc6JyArIGRhdGEucG9ydDtcbiAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnVybDtcbiAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnBvcnQ7XG4gICAgICAgICAgICBsZGFwT3B0aW9ucy5tb2RpZnlEYXRhKGRhdGEpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZtLmdldExkYXAoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2bS5zYXZlR2l0ID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF2bS5naXRJbmZvLmlkKSB7XG4gICAgICAgICAgICAgICAgdm0uZ2l0SW5mby50eXBlID0gJ0dJVExBQic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnaXRPcHRpb25zLm1vZGlmeURhdGEodm0uZ2l0SW5mbykudGhlbihmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLmdpdEluZm8gPSBpbmZvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2bS5zYXZlUmVnaXN0cnkgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodm0ucmVnaXN0cnlJbmZvLmlkKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHZtLnJlZ2lzdHJ5SW5mby5pZDtcbiAgICAgICAgICAgICAgICBkZWxldGUgdm0ucmVnaXN0cnlJbmZvLmNyZWF0ZVRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmVnaXN0cnlJbmZvID0gYW5ndWxhci5jb3B5KHZtLnJlZ2lzdHJ5SW5mbyk7XG4gICAgICAgICAgICBpZiAocmVnaXN0cnlJbmZvLnN0YXR1cyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSByZWdpc3RyeUluZm8uY2VydGlmaWNhdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlZ2lzdHJ5T3B0aW9ucy5tb2RpZnlEYXRhKHJlZ2lzdHJ5SW5mbykudGhlbihmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnJlZ2lzdHJ5SW5mbyA9IGluZm87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHZtLnNhdmVTZXJ2ZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBzZXJ2ZXJPcHRpb25zLm1vZGlmeURhdGEodm0uc2VydmVySW5mbykudGhlbihmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnNlcnZlckluZm8gPSBpbmZvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2bS5zYXZlTW9uaXRvciA9ICgpID0+IHtcbiAgICAgICAgICAgIG1vbml0b3JPcHRpb25zLm1vZGlmeURhdGEodm0ubW9uaXRvcklucy5mb3JtYXJ0TW9uaXRvcigpKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdm0ubW9uaXRvcklucy5pbml0KGluZm8pO1xuICAgICAgICAgICAgICAgICAgICB2bS5tb25pdG9yQ29uZmlnID0gdm0ubW9uaXRvcklucy5jb25maWc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHZtLnNhdmVTc2ggPSAoKSA9PiB7XG4gICAgICAgICAgICBzc2hPcHRpb25zLm1vZGlmeURhdGEodm0uc3NoSW5mbykudGhlbigoaW5mbykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnNzaEluZm8gPSBpbmZvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2bS5zYXZlQ2x1c3RlciA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBjbHVzdGVySW5mbywgbm9kZUxpc3QgPSB2bS5ub2RlTGlzdCxcbiAgICAgICAgICAgICAgICBhZGROb2RlTGFiZWxzSW5mbyA9IFtdLFxuICAgICAgICAgICAgICAgIGRlbGV0ZU5vZGVMYWJlbHNJbmZvID0gW107XG5cbiAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5pc1VzZWRCeUJ1aWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZE5vZGVMYWJlbHNJbmZvLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogbm9kZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQlVJTERFTlY6ICdIT1NURU5WVFlQRSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlTm9kZUxhYmVsc0luZm8ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlOiBub2RlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBCVUlMREVOVjogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWRkTm9kZUxhYmVsc0luZm8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+ivt+iHs+Wwkeiuvue9ruS4gOWPsOeUqOS6juaehOW7uueahOS4u+acuu+8gScpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdm0uY2x1c3RlckxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdzdWJtaXRDbHVzdGVyJyk7XG4gICAgICAgICAgICBjbHVzdGVyT3B0aW9ucy5tb2RpZnlEYXRhKHZtLmNsdXN0ZXJJbmZvKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgY2x1c3RlckluZm8gPSBpbmZvO1xuICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVTZXJ2aWNlLmFkZExhYmVsKHZtLmNsdXN0ZXJJbmZvLmNsdXN0ZXJJZCwgYWRkTm9kZUxhYmVsc0luZm8pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9LCAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn6ZSZ6K+v77yBJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZGVsZXRlTm9kZUxhYmVsc0luZm8ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlU2VydmljZS5kZWxldGVMYWJlbCh2bS5jbHVzdGVySW5mby5jbHVzdGVySWQsIGRlbGV0ZU5vZGVMYWJlbHNJbmZvKS5jYXRjaCgocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfplJnor6/vvIEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdG9nZ2xlQ2x1c3RlckluZm8oY2x1c3RlckluZm8pO1xuICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ3N1Ym1pdENsdXN0ZXInKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBzdGF0ZUluZm8gPSAkc3RhdGUuJGN1cnJlbnQubmFtZTtcbiAgICAgICAgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdsZGFwaW5mbycpICE9PSAtMSkge1xuICAgICAgICAgICAgdm0udGFiQWN0aXZlWzFdLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB2bS5nZXRMZGFwKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ2dpdGluZm8nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVsyXS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdm0uZ2V0R2l0SW5mbygpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdyZWdpc3RyeWluZm8nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVszXS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdm0uZ2V0UmVnaXN0cnlJbmZvKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ3NlcnZlcmluZm8nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVs0XS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdm0uZ2V0U2VydmVySW5mbygpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdtb25pdG9yaW5mbycpICE9PSAtMSkge1xuICAgICAgICAgICAgdm0udGFiQWN0aXZlWzVdLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB2bS5nZXRNb25pdG9ySW5mbygpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdzc2hpbmZvJykgIT09IC0xKSB7XG4gICAgICAgICAgICB2bS50YWJBY3RpdmVbNl0uYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHZtLmdldFdlYlNzaCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdjbHVzdGVyaW5mbycpICE9PSAtMSkge1xuICAgICAgICAgICAgdm0udGFiQWN0aXZlWzddLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB2bS5pbml0Q2x1c3RlckluZm8oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVswXS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIEdsb2JhbFNldHRpbmdDdHIuJGluamVjdCA9IFsnJHNjb3BlJywgJyRkb21lR2xvYmFsJywgJyRzdGF0ZScsICckZG9tZVVzZXInLCAnJGRvbWVDbHVzdGVyJywgJyRtb2RhbCcsICckZG9tZVB1YmxpYycsICckcSddO1xuXG5cbiAgICBmdW5jdGlvbiBOZXdQYXNzd2RNb2RhbEN0cih1c2VybmFtZSwgJGRvbWVVc2VyLCAkbW9kYWxJbnN0YW5jZSwgJGRvbWVQdWJsaWMpIHtcbiAgICAgICAgdmFyIHZtID0gdGhpcztcbiAgICAgICAgdm0uY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgICAgICB9O1xuICAgICAgICB2bS5zdWJQdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB1c2VySW5mbyA9IHtcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHZtLnBhc3N3ZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICRkb21lVXNlci51c2VyU2VydmljZS5tb2RpZnlQdyh1c2VySW5mbykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5L+u5pS55oiQ5Yqf77yBJyk7XG4gICAgICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5L+u5pS55aSx6LSl77yBJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgTmV3UGFzc3dkTW9kYWxDdHIuJGluamVjdCA9IFsndXNlcm5hbWUnLCAnJGRvbWVVc2VyJywgJyRtb2RhbEluc3RhbmNlJywgJyRkb21lUHVibGljJ107XG5cbn0pKHdpbmRvdy5kb21lQXBwKTsiXX0=
