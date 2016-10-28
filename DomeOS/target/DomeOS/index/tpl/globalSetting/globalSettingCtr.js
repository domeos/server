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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L3RwbC9nbG9iYWxTZXR0aW5nL2dsb2JhbFNldHRpbmdDdHIuZXMiXSwibmFtZXMiOlsiZG9tZUFwcCIsInVuZGVmaW5lZCIsImNvbnRyb2xsZXIiLCJHbG9iYWxTZXR0aW5nQ3RyIiwiTmV3UGFzc3dkTW9kYWxDdHIiLCIkc2NvcGUiLCIkZG9tZUdsb2JhbCIsIiRzdGF0ZSIsIiRkb21lVXNlciIsIiRkb21lQ2x1c3RlciIsIiRtb2RhbCIsIiRkb21lUHVibGljIiwiJHEiLCJ2bSIsIiRlbWl0IiwidGl0bGUiLCJkZXNjcml0aW9uIiwibW9kIiwiZ2V0TG9naW5Vc2VyIiwidGhlbiIsInVzZXIiLCJ1c2VybmFtZSIsImdvIiwibGRhcE9wdGlvbnMiLCJnZXRHbG9hYmFsSW5zdGFuY2UiLCJzZXJ2ZXJPcHRpb25zIiwicmVnaXN0cnlPcHRpb25zIiwiZ2l0T3B0aW9ucyIsIm1vbml0b3JPcHRpb25zIiwic3NoT3B0aW9ucyIsImNsdXN0ZXJPcHRpb25zIiwibm9kZVNlcnZpY2UiLCJnZXRJbnN0YW5jZSIsInNlcnZlckluZm8iLCJsZGFwSW5mbyIsInJlZ2lzdHJ5SW5mbyIsImdpdEluZm8iLCJzc2hJbmZvIiwiY2x1c3RlckluZm8iLCJuZXdVc2VyIiwibmVlZFZhbGlkVXNlciIsInZhbGlkIiwia2V5IiwidXNlcktleSIsIm5vZGVLZXkiLCJpc1Nob3dBZGQiLCJjdXJyZW50VXNlclR5cGUiLCJ0eXBlIiwidXNlckxpc3QiLCJsZGFwVXNlckxpc3QiLCJjbHVzdGVyTG9hZGluZ0lucyIsImdldExvYWRpbmdJbnN0YW5jZSIsInRhYkFjdGl2ZSIsImFjdGl2ZSIsIk1vbml0b3IiLCJpbmZvIiwiY29uZmlnIiwiZm9ybWFydFN0clRvT2JqQXJyIiwic3RyIiwiYXJyIiwic3RyQXJyIiwidGV4dCIsInNwbGl0IiwiaSIsImwiLCJsZW5ndGgiLCJwdXNoIiwidHJhbnNmZXIiLCJncmFwaCIsImp1ZGdlIiwiaXRlbSIsImluZGV4Iiwic3BsaWNlIiwib2JqIiwiYW5ndWxhciIsImNvcHkiLCJmb3JtYXJ0QXJyVG9TdHIiLCJtb25pdG9yQXJyIiwiam9pbiIsInVzZXJTZXJ2aWNlIiwiZ2V0VXNlckxpc3QiLCJyZXMiLCJkYXRhIiwicmVzdWx0IiwiZ2V0Q2x1c3Rlckxpc3QiLCJjbHVzdGVyTGlzdCIsIndoZW4iLCJnZXREYXRhIiwidG9nZ2xlVXNlclR5cGUiLCJ1c2VyVHlwZSIsInRvZ2dsZVNob3dBZGQiLCJtb2RpZnlQdyIsIm9wZW4iLCJ0ZW1wbGF0ZVVybCIsInNpemUiLCJyZXNvbHZlIiwibW9kaWZ5VXNlckluZm8iLCJsb2dpblVzZXIiLCJjb3B5VXNlckluZm8iLCJpZCIsIm1vZGFsSW5zdGFuY2UiLCJ1c2VySW5mbyIsImV4dGVuZCIsImRlbGV0ZVVzZXIiLCJvcGVuRGVsZXRlIiwib3Blbldhcm5pbmciLCJnZXRMZGFwIiwicmVnIiwidXJsIiwic2VydmVyIiwicmVwbGFjZSIsInBvcnQiLCJnZXRHaXRJbmZvIiwiZ2l0SW5mb3MiLCJnZXRSZWdpc3RyeUluZm8iLCJnZXRTZXJ2ZXJJbmZvIiwiZ2V0TW9uaXRvckluZm8iLCJpbml0TW9uaXRvckluZm8iLCJtb25pdG9ySW5zIiwiaW5pdCIsIm1vbml0b3JDb25maWciLCJnZXRXZWJTc2giLCJ0b2dnbGVDbHVzdGVyIiwiY2x1c3RlciIsIm5hbWVzcGFjZSIsImNsdXN0ZXJJZCIsImNsdXN0ZXJOYW1lIiwibmFtZSIsImhvc3QiLCJhcGkiLCJzdGFydExvYWRpbmciLCJnZXROYW1lc3BhY2UiLCJuYW1lc3BhY2VMaXN0IiwiZmluYWxseSIsImZpbmlzaExvYWRpbmciLCJnZXROb2RlTGlzdCIsIm5vZGVMaXN0Iiwibm9kZSIsImNhcGFjaXR5IiwibWVtb3J5IiwidG9GaXhlZCIsImxhYmVscyIsImlzVXNlZEJ5QnVpbGQiLCJCVUlMREVOViIsInRvZ2dsZUNsdXN0ZXJJbmZvIiwiaW5pdENsdXN0ZXJJbmZvIiwiYWxsIiwiYWRkVXNlciIsImZvcm0iLCJyZVBhc3N3b3JkIiwiY3JlYXRlVXNlciIsIm9wZW5Qcm9tcHQiLCIkc2V0UHJpc3RpbmUiLCJzYXZlTGRhcCIsIm1vZGlmeURhdGEiLCJzYXZlR2l0Iiwic2F2ZVJlZ2lzdHJ5IiwiY3JlYXRlVGltZSIsInN0YXR1cyIsImNlcnRpZmljYXRpb24iLCJzYXZlU2VydmVyIiwic2F2ZU1vbml0b3IiLCJmb3JtYXJ0TW9uaXRvciIsInNhdmVTc2giLCJzYXZlQ2x1c3RlciIsImFkZE5vZGVMYWJlbHNJbmZvIiwiZGVsZXRlTm9kZUxhYmVsc0luZm8iLCJhZGRMYWJlbCIsIm1zZyIsInJlc3VsdE1zZyIsInJlamVjdCIsImRlbGV0ZUxhYmVsIiwiY2F0Y2giLCJzdGF0ZUluZm8iLCIkY3VycmVudCIsImluZGV4T2YiLCIkaW5qZWN0IiwiJG1vZGFsSW5zdGFuY2UiLCJjYW5jZWwiLCJkaXNtaXNzIiwic3ViUHciLCJwYXNzd29yZCIsInBhc3N3ZCIsImNsb3NlIiwid2luZG93Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7OztBQUlBLENBQUMsVUFBQ0EsT0FBRCxFQUFVQyxTQUFWLEVBQXdCO0FBQ3JCOztBQUNBLFFBQUksT0FBT0QsT0FBUCxLQUFtQixXQUF2QixFQUFvQzs7QUFFcENBLFlBQVFFLFVBQVIsQ0FBbUIsa0JBQW5CLEVBQXVDQyxnQkFBdkMsRUFDS0QsVUFETCxDQUNnQixtQkFEaEIsRUFDcUNFLGlCQURyQzs7QUFHQSxhQUFTRCxnQkFBVCxDQUEwQkUsTUFBMUIsRUFBa0NDLFdBQWxDLEVBQStDQyxNQUEvQyxFQUF1REMsU0FBdkQsRUFBa0VDLFlBQWxFLEVBQWdGQyxNQUFoRixFQUF3RkMsV0FBeEYsRUFBcUdDLEVBQXJHLEVBQXlHO0FBQ3JHLFlBQUlDLEtBQUssSUFBVDtBQUNBUixlQUFPUyxLQUFQLENBQWEsV0FBYixFQUEwQjtBQUN0QkMsbUJBQU8sTUFEZTtBQUV0QkMsd0JBQVksbUNBRlU7QUFHdEJDLGlCQUFLO0FBSGlCLFNBQTFCO0FBS0FULGtCQUFVVSxZQUFWLEdBQXlCQyxJQUF6QixDQUE4QixVQUFDQyxJ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cUssTUFBSCxHQUFZLFlBQVk7QUFDcEJELDJCQUFlRSxPQUFmO0FBQ0gsU0FGRDtBQUdBdEssV0FBR3VLLEtBQUgsR0FBVyxZQUFZO0FBQ25CLGdCQUFJL0UsV0FBVztBQUNYaEYsMEJBQVVBLFFBREM7QUFFWGdLLDBCQUFVeEssR0FBR3lLO0FBRkYsYUFBZjtBQUlBOUssc0JBQVV1RSxXQUFWLENBQXNCWSxRQUF0QixDQUErQlUsUUFBL0IsRUFBeUNsRixJQUF6QyxDQUE4QyxZQUFZO0FBQ3REUiw0QkFBWTRJLFVBQVosQ0FBdUIsT0FBdkI7QUFDQTBCLCtCQUFlTSxLQUFmO0FBQ0gsYUFIRCxFQUdHLFlBQVk7QUFDWDVLLDRCQUFZOEYsV0FBWixDQUF3QixPQUF4QjtBQUNILGFBTEQ7QUFNSCxTQVhEO0FBWUg7QUFDRHJHLHNCQUFrQjRLLE9BQWxCLEdBQTRCLENBQUMsVUFBRCxFQUFhLFdBQWIsRUFBMEIsZ0JBQTFCLEVBQTRDLGFBQTVDLENBQTVCO0FBRUgsQ0FoZkQsRUFnZkdRLE9BQU94TCxPQWhmViIsImZpbGUiOiJpbmRleC90cGwvZ2xvYmFsU2V0dGluZy9nbG9iYWxTZXR0aW5nQ3RyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogQGF1dGhvciBDaGFuZHJhTGVlXHJcbiAqL1xyXG5cclxuKChkb21lQXBwLCB1bmRlZmluZWQpID0+IHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGlmICh0eXBlb2YgZG9tZUFwcCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcclxuXHJcbiAgICBkb21lQXBwLmNvbnRyb2xsZXIoJ0dsb2JhbFNldHRpbmdDdHInLCBHbG9iYWxTZXR0aW5nQ3RyKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdOZXdQYXNzd2RNb2RhbEN0cicsIE5ld1Bhc3N3ZE1vZGFsQ3RyKTtcclxuXHJcbiAgICBmdW5jdGlvbiBHbG9iYWxTZXR0aW5nQ3RyKCRzY29wZSwgJGRvbWVHbG9iYWwsICRzdGF0ZSwgJGRvbWVVc2VyLCAkZG9tZUNsdXN0ZXIsICRtb2RhbCwgJGRvbWVQdWJsaWMsICRxKSB7XHJcbiAgICAgICAgbGV0IHZtID0gdGhpcztcclxuICAgICAgICAkc2NvcGUuJGVtaXQoJ3BhZ2VUaXRsZScsIHtcclxuICAgICAgICAgICAgdGl0bGU6ICflhajlsYDphY3nva4nLFxyXG4gICAgICAgICAgICBkZXNjcml0aW9uOiAn5Zyo6L+Z6YeM5oKo5Y+v5Lul6L+b6KGM5LiA5Lqb5YWo5bGA6YWN572u77yM5L+d6K+BZG9tZW9z6IO95aSf5q2j5bi46L+Q6KGM5ZKM5L2/55So44CCJyxcclxuICAgICAgICAgICAgbW9kOiAnZ2xvYmFsJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRkb21lVXNlci5nZXRMb2dpblVzZXIoKS50aGVuKCh1c2VyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh1c2VyLnVzZXJuYW1lICE9PSAnYWRtaW4nKSB7XHJcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3Byb2plY3RNYW5hZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBsZGFwT3B0aW9ucyA9ICRkb21lR2xvYmFsLmdldEdsb2FiYWxJbnN0YW5jZSgnbGRhcCcpLFxyXG4gICAgICAgICAgICBzZXJ2ZXJPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdzZXJ2ZXInKSxcclxuICAgICAgICAgICAgcmVnaXN0cnlPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdyZWdpc3RyeScpLFxyXG4gICAgICAgICAgICBnaXRPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdnaXQnKSxcclxuICAgICAgICAgICAgbW9uaXRvck9wdGlvbnMgPSAkZG9tZUdsb2JhbC5nZXRHbG9hYmFsSW5zdGFuY2UoJ21vbml0b3InKSxcclxuICAgICAgICAgICAgc3NoT3B0aW9ucyA9ICRkb21lR2xvYmFsLmdldEdsb2FiYWxJbnN0YW5jZSgnc3NoJyksXHJcbiAgICAgICAgICAgIGNsdXN0ZXJPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdjbHVzdGVyJyksXHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlID0gJGRvbWVDbHVzdGVyLmdldEluc3RhbmNlKCdOb2RlU2VydmljZScpO1xyXG5cclxuICAgICAgICB2bS5zZXJ2ZXJJbmZvID0ge307XHJcbiAgICAgICAgdm0ubGRhcEluZm8gPSB7fTtcclxuICAgICAgICB2bS5yZWdpc3RyeUluZm8gPSB7fTtcclxuICAgICAgICB2bS5naXRJbmZvID0ge307XHJcbiAgICAgICAgdm0uc3NoSW5mbyA9IHt9O1xyXG4gICAgICAgIHZtLmNsdXN0ZXJJbmZvID0ge307XHJcbiAgICAgICAgdm0ubmV3VXNlciA9IHt9O1xyXG4gICAgICAgIHZtLm5lZWRWYWxpZFVzZXIgPSB7XHJcbiAgICAgICAgICAgIHZhbGlkOiBmYWxzZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdm0ua2V5ID0ge1xyXG4gICAgICAgICAgICB1c2VyS2V5OiAnJyxcclxuICAgICAgICAgICAgbm9kZUtleTogJydcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZtLmlzU2hvd0FkZCA9IGZhbHNlO1xyXG4gICAgICAgIHZtLmN1cnJlbnRVc2VyVHlwZSA9IHtcclxuICAgICAgICAgICAgLy8gJ1VTRVInKOaZrumAmueUqOaItykgb3IgJ0xEQVAnXHJcbiAgICAgICAgICAgIHR5cGU6ICdVU0VSJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy8g5pmu6YCa55So5oi35YiX6KGoXHJcbiAgICAgICAgdm0udXNlckxpc3QgPSBbXTtcclxuICAgICAgICAvLyBsZGFw55So5oi35YiX6KGoXHJcbiAgICAgICAgdm0ubGRhcFVzZXJMaXN0ID0gW107XHJcblxyXG4gICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zID0gJGRvbWVQdWJsaWMuZ2V0TG9hZGluZ0luc3RhbmNlKCk7XHJcbiAgICAgICAgdm0udGFiQWN0aXZlID0gW3tcclxuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxyXG4gICAgICAgIH1dO1xyXG5cclxuXHJcbiAgICAgICAgY2xhc3MgTW9uaXRvciB7XHJcbiAgICAgICAgICAgIGluaXQoaW5mbykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSBpbmZvIHx8IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGZvcm1hcnRTdHJUb09iakFycihzdHIpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYXJyID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0ckFyciA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJydcclxuICAgICAgICAgICAgICAgICAgICAgICAgfV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHN0ckFyciA9IHN0ci5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gc3RyQXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnIucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBzdHJBcnJbaV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGFyci5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJydcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcudHJhbnNmZXIgPSBmb3JtYXJ0U3RyVG9PYmpBcnIodGhpcy5jb25maWcudHJhbnNmZXIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZ3JhcGggPSBmb3JtYXJ0U3RyVG9PYmpBcnIodGhpcy5jb25maWcuZ3JhcGgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuanVkZ2UgPSBmb3JtYXJ0U3RyVG9PYmpBcnIodGhpcy5jb25maWcuanVkZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFkZEl0ZW0oaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWdbaXRlbV0ucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJydcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZUFyckl0ZW0oaXRlbSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnW2l0ZW1dLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9ybWFydE1vbml0b3IoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb2JqID0gYW5ndWxhci5jb3B5KHRoaXMuY29uZmlnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBmb3JtYXJ0QXJyVG9TdHIgPSAobW9uaXRvckFycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdHJBcnIgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IG1vbml0b3JBcnIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb25pdG9yQXJyW2ldLnRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ckFyci5wdXNoKG1vbml0b3JBcnJbaV0udGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0ckFyci5qb2luKCcsJyk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgb2JqLnRyYW5zZmVyID0gZm9ybWFydEFyclRvU3RyKHRoaXMuY29uZmlnLnRyYW5zZmVyKTtcclxuICAgICAgICAgICAgICAgIG9iai5ncmFwaCA9IGZvcm1hcnRBcnJUb1N0cih0aGlzLmNvbmZpZy5ncmFwaCk7XHJcbiAgICAgICAgICAgICAgICBvYmouanVkZ2UgPSBmb3JtYXJ0QXJyVG9TdHIodGhpcy5jb25maWcuanVkZ2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJGRvbWVVc2VyLnVzZXJTZXJ2aWNlLmdldFVzZXJMaXN0KCkudGhlbihmdW5jdGlvbiAocmVzKSB7XHJcbiAgICAgICAgICAgIHZtLnVzZXJMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBnZXRDbHVzdGVyTGlzdCA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHZtLmNsdXN0ZXJMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAkcS53aGVuKHZtLmNsdXN0ZXJMaXN0KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlU2VydmljZS5nZXREYXRhKCkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uY2x1c3Rlckxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZtLmNsdXN0ZXJMaXN0O1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZtLnRvZ2dsZVVzZXJUeXBlID0gKHVzZXJUeXBlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh1c2VyVHlwZSAhPT0gdm0uY3VycmVudFVzZXJUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB2bS5jdXJyZW50VXNlclR5cGUudHlwZSA9IHVzZXJUeXBlO1xyXG4gICAgICAgICAgICAgICAgdm0uaXNTaG93QWRkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB2bS5rZXkudXNlcktleSA9ICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2bS50b2dnbGVTaG93QWRkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB2bS5pc1Nob3dBZGQgPSAhdm0uaXNTaG93QWRkO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdm0ubW9kaWZ5UHcgPSAodXNlcikgPT4ge1xyXG4gICAgICAgICAgICAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ25ld1Bhc3N3ZE1vZGFsLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ05ld1Bhc3N3ZE1vZGFsQ3RyIGFzIHZtUHcnLFxyXG4gICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcclxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXNlci51c2VybmFtZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2bS5tb2RpZnlVc2VySW5mbyA9ICh1c2VyKSA9PiB7XHJcbiAgICAgICAgICAgICRkb21lVXNlci5nZXRMb2dpblVzZXIoKS50aGVuKChsb2dpblVzZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBjb3B5VXNlckluZm8gPSBsb2dpblVzZXIuaWQgPT09IHVzZXIuaWQgPyBhbmd1bGFyLmNvcHkobG9naW5Vc2VyKSA6IGFuZ3VsYXIuY29weSh1c2VyKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbW9kaWZ5VXNlckluZm9Nb2RhbC5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnTW9kaWZ5VXNlckluZm9DdHInLFxyXG4gICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29weVVzZXJJbmZvO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKCh1c2VySW5mbykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHVzZXIsIHVzZXJJbmZvKTtcclxuICAgICAgICAgICAgICAgICAgICAkZG9tZVVzZXIuZ2V0TG9naW5Vc2VyKCkudGhlbihmdW5jdGlvbiAobG9naW5Vc2VyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2dpblVzZXIuaWQgPT09IHVzZXIuaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKGxvZ2luVXNlciwgdXNlckluZm8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdm0uZGVsZXRlVXNlciA9ICh1c2VyKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IHVzZXIuaWQ7XHJcbiAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5EZWxldGUoKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICRkb21lVXNlci51c2VyU2VydmljZS5kZWxldGVVc2VyKGlkKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZtLnVzZXJMaXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2bS51c2VyTGlzdFtpXS5pZCA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZtLnVzZXJMaXN0LnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfliKDpmaTlpLHotKXvvIEnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2bS5nZXRMZGFwID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXZtLmxkYXBJbmZvLmlkKSB7XHJcbiAgICAgICAgICAgICAgICBsZGFwT3B0aW9ucy5nZXREYXRhKCkudGhlbihmdW5jdGlvbiAoaW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWcgPSAvKC4qKTooW146XSspL2c7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0ubGRhcEluZm8gPSBpbmZvO1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmxkYXBJbmZvLnVybCA9IHZtLmxkYXBJbmZvLnNlcnZlci5yZXBsYWNlKHJlZywgJyQxJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0ubGRhcEluZm8ucG9ydCA9IHZtLmxkYXBJbmZvLnNlcnZlci5yZXBsYWNlKHJlZywgJyQyJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdm0uZ2V0R2l0SW5mbyA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF2bS5naXRJbmZvLmlkKSB7XHJcbiAgICAgICAgICAgICAgICBnaXRPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChnaXRJbmZvcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmdpdEluZm8gPSBnaXRJbmZvc1swXTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2bS5nZXRSZWdpc3RyeUluZm8gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdm0ucmVnaXN0cnlJbmZvLmlkKSB7XHJcbiAgICAgICAgICAgICAgICByZWdpc3RyeU9wdGlvbnMuZ2V0RGF0YSgpLnRoZW4oZnVuY3Rpb24gKGluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICB2bS5yZWdpc3RyeUluZm8gPSBpbmZvO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZtLmdldFNlcnZlckluZm8gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdm0uc2VydmVySW5mby5pZCkge1xyXG4gICAgICAgICAgICAgICAgc2VydmVyT3B0aW9ucy5nZXREYXRhKCkudGhlbihmdW5jdGlvbiAoaW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLnNlcnZlckluZm8gPSBpbmZvO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZtLmdldE1vbml0b3JJbmZvID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0TW9uaXRvckluZm8oaW5mbykge1xyXG4gICAgICAgICAgICAgICAgdm0ubW9uaXRvcklucyA9IG5ldyBNb25pdG9yKCk7XHJcbiAgICAgICAgICAgICAgICB2bS5tb25pdG9ySW5zLmluaXQoaW5mbyk7XHJcbiAgICAgICAgICAgICAgICB2bS5tb25pdG9yQ29uZmlnID0gdm0ubW9uaXRvcklucy5jb25maWc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF2bS5tb25pdG9yQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICAgICBtb25pdG9yT3B0aW9ucy5nZXREYXRhKCkudGhlbihmdW5jdGlvbiAoaW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXRNb25pdG9ySW5mbyhpbmZvKTtcclxuICAgICAgICAgICAgICAgIH0sIGluaXRNb25pdG9ySW5mbygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdm0uZ2V0V2ViU3NoID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXZtLnNzaEluZm8uaWQpIHtcclxuICAgICAgICAgICAgICAgIHNzaE9wdGlvbnMuZ2V0RGF0YSgpLnRoZW4oZnVuY3Rpb24gKGluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICB2bS5zc2hJbmZvID0gaW5mbztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyBAcGFyYW0gbmFtZXNwYWNlOiDlj6/kuI3loavvvIzmnInlgLzml7bpu5jorqTkuLror6VuYW1lc3BhY2VcclxuICAgICAgICB2bS50b2dnbGVDbHVzdGVyID0gKGNsdXN0ZXIsIG5hbWVzcGFjZSkgPT4ge1xyXG4gICAgICAgICAgICB2bS5jbHVzdGVySW5mby5jbHVzdGVySWQgPSBjbHVzdGVyLmlkO1xyXG4gICAgICAgICAgICB2bS5jbHVzdGVySW5mby5jbHVzdGVyTmFtZSA9IGNsdXN0ZXIubmFtZTtcclxuICAgICAgICAgICAgdm0uY2x1c3RlckluZm8uaG9zdCA9IGNsdXN0ZXIuYXBpO1xyXG4gICAgICAgICAgICB2bS5rZXkubm9kZUtleSA9ICcnO1xyXG4gICAgICAgICAgICB2bS5jbHVzdGVyTG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ25hbWVzcGFjZScpO1xyXG4gICAgICAgICAgICB2bS5jbHVzdGVyTG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ25vZGVMaXN0Jyk7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE5hbWVzcGFjZShjbHVzdGVyLmlkLCBjbHVzdGVyLm5hbWUpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdm0ubmFtZXNwYWNlTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcclxuICAgICAgICAgICAgICAgIGlmIChuYW1lc3BhY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICB2bS5jbHVzdGVySW5mby5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5hbWVzcGFjZSBvZiB2bS5uYW1lc3BhY2VMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuYW1lc3BhY2UubmFtZSA9PSAnZGVmYXVsdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJJbmZvLm5hbWVzcGFjZSA9ICdkZWZhdWx0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB2bS5jbHVzdGVySW5mby5uYW1lc3BhY2UgPSB2bS5uYW1lc3BhY2VMaXN0WzBdICYmIHZtLm5hbWVzcGFjZUxpc3RbMF0ubmFtZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdm0ubmFtZXNwYWNlTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdm0uY2x1c3RlckluZm8ubmFtZXNwYWNlID0gbnVsbDtcclxuICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB2bS5jbHVzdGVyTG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCduYW1lc3BhY2UnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE5vZGVMaXN0KGNsdXN0ZXIuaWQpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG5vZGVMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBub2RlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmNhcGFjaXR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuY2FwYWNpdHkubWVtb3J5ID0gKG5vZGUuY2FwYWNpdHkubWVtb3J5IC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbm9kZS5sYWJlbHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5sYWJlbHMgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1VzZWRCeUJ1aWxkID0gbm9kZS5sYWJlbHMuQlVJTERFTlYgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2bS5ub2RlTGlzdCA9IG5vZGVMaXN0O1xyXG4gICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ25vZGVMaXN0Jyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgdG9nZ2xlQ2x1c3RlckluZm8gPSAoY2x1c3RlckluZm8pID0+IHtcclxuICAgICAgICAgICAgdm0uY2x1c3RlckluZm8gPSBjbHVzdGVySW5mbyB8fCB7fTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2x1c3RlciBvZiB2bS5jbHVzdGVyTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNsdXN0ZXIuYXBpID09PSB2bS5jbHVzdGVySW5mby5ob3N0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0udG9nZ2xlQ2x1c3RlcihjbHVzdGVyLCB2bS5jbHVzdGVySW5mby5uYW1lc3BhY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdm0uaW5pdENsdXN0ZXJJbmZvID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXZtLmNsdXN0ZXJJbmZvLmlkKSB7XHJcbiAgICAgICAgICAgICAgICB2bS5jbHVzdGVyTG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ2NsdXN0ZXInKTtcclxuICAgICAgICAgICAgICAgICRxLmFsbChbZ2V0Q2x1c3Rlckxpc3QoKSwgY2x1c3Rlck9wdGlvbnMuZ2V0RGF0YSgpXSkudGhlbihmdW5jdGlvbiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlQ2x1c3RlckluZm8ocmVzWzFdKTtcclxuICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ2NsdXN0ZXInKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2bS5hZGRVc2VyID0gKGZvcm0pID0+IHtcclxuICAgICAgICAgICAgdmFyIG5ld1VzZXIgPSBhbmd1bGFyLmNvcHkodm0ubmV3VXNlcik7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBuZXdVc2VyLnJlUGFzc3dvcmQ7XHJcblxyXG4gICAgICAgICAgICAkZG9tZVVzZXIudXNlclNlcnZpY2UuY3JlYXRlVXNlcihuZXdVc2VyKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcclxuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+WIm+W7uuaIkOWKn++8gScpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHVzZXIgPSBhbmd1bGFyLmNvcHkobmV3VXNlcik7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzLmRhdGEucmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0udXNlckxpc3QucHVzaChyZXMuZGF0YS5yZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdm0ubmV3VXNlciA9IHt9O1xyXG4gICAgICAgICAgICAgICAgdm0ubmVlZFZhbGlkVXNlci52YWxpZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZm9ybS4kc2V0UHJpc3RpbmUoKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+WIm+W7uuWksei0pe+8gScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZtLnNhdmVMZGFwID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IGFuZ3VsYXIuY29weSh2bS5sZGFwSW5mbyk7XHJcbiAgICAgICAgICAgIGRhdGEuc2VydmVyID0gZGF0YS51cmwgKyAnOicgKyBkYXRhLnBvcnQ7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnVybDtcclxuICAgICAgICAgICAgZGVsZXRlIGRhdGEucG9ydDtcclxuICAgICAgICAgICAgbGRhcE9wdGlvbnMubW9kaWZ5RGF0YShkYXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZtLmdldExkYXAoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2bS5zYXZlR2l0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXZtLmdpdEluZm8uaWQpIHtcclxuICAgICAgICAgICAgICAgIHZtLmdpdEluZm8udHlwZSA9ICdHSVRMQUInO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGdpdE9wdGlvbnMubW9kaWZ5RGF0YSh2bS5naXRJbmZvKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLmdpdEluZm8gPSBpbmZvO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZtLnNhdmVSZWdpc3RyeSA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHZtLnJlZ2lzdHJ5SW5mby5pZCkge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHZtLnJlZ2lzdHJ5SW5mby5pZDtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB2bS5yZWdpc3RyeUluZm8uY3JlYXRlVGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgcmVnaXN0cnlJbmZvID0gYW5ndWxhci5jb3B5KHZtLnJlZ2lzdHJ5SW5mbyk7XHJcbiAgICAgICAgICAgIGlmIChyZWdpc3RyeUluZm8uc3RhdHVzID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVnaXN0cnlJbmZvLmNlcnRpZmljYXRpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVnaXN0cnlPcHRpb25zLm1vZGlmeURhdGEocmVnaXN0cnlJbmZvKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLnJlZ2lzdHJ5SW5mbyA9IGluZm87XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdm0uc2F2ZVNlcnZlciA9ICgpID0+IHtcclxuICAgICAgICAgICAgc2VydmVyT3B0aW9ucy5tb2RpZnlEYXRhKHZtLnNlcnZlckluZm8pLnRoZW4oZnVuY3Rpb24gKGluZm8pIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uc2VydmVySW5mbyA9IGluZm87XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdm0uc2F2ZU1vbml0b3IgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIG1vbml0b3JPcHRpb25zLm1vZGlmeURhdGEodm0ubW9uaXRvcklucy5mb3JtYXJ0TW9uaXRvcigpKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZtLm1vbml0b3JJbnMuaW5pdChpbmZvKTtcclxuICAgICAgICAgICAgICAgICAgICB2bS5tb25pdG9yQ29uZmlnID0gdm0ubW9uaXRvcklucy5jb25maWc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdm0uc2F2ZVNzaCA9ICgpID0+IHtcclxuICAgICAgICAgICAgc3NoT3B0aW9ucy5tb2RpZnlEYXRhKHZtLnNzaEluZm8pLnRoZW4oKGluZm8pID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0uc3NoSW5mbyA9IGluZm87XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdm0uc2F2ZUNsdXN0ZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBjbHVzdGVySW5mbywgbm9kZUxpc3QgPSB2bS5ub2RlTGlzdCxcclxuICAgICAgICAgICAgICAgIGFkZE5vZGVMYWJlbHNJbmZvID0gW10sXHJcbiAgICAgICAgICAgICAgICBkZWxldGVOb2RlTGFiZWxzSW5mbyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBub2RlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuaXNVc2VkQnlCdWlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZE5vZGVMYWJlbHNJbmZvLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlOiBub2RlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQlVJTERFTlY6ICdIT1NURU5WVFlQRSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVOb2RlTGFiZWxzSW5mby5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogbm9kZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJVSUxERU5WOiBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYWRkTm9kZUxhYmVsc0luZm8ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn6K+36Iez5bCR6K6+572u5LiA5Y+w55So5LqO5p6E5bu655qE5Li75py677yBJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnc3VibWl0Q2x1c3RlcicpO1xyXG4gICAgICAgICAgICBjbHVzdGVyT3B0aW9ucy5tb2RpZnlEYXRhKHZtLmNsdXN0ZXJJbmZvKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICBjbHVzdGVySW5mbyA9IGluZm87XHJcbiAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVTZXJ2aWNlLmFkZExhYmVsKHZtLmNsdXN0ZXJJbmZvLmNsdXN0ZXJJZCwgYWRkTm9kZUxhYmVsc0luZm8pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSwgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfplJnor6/vvIEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkZWxldGVOb2RlTGFiZWxzSW5mby5sZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVNlcnZpY2UuZGVsZXRlTGFiZWwodm0uY2x1c3RlckluZm8uY2x1c3RlcklkLCBkZWxldGVOb2RlTGFiZWxzSW5mbykuY2F0Y2goKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+mUmeivr++8gScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRvZ2dsZUNsdXN0ZXJJbmZvKGNsdXN0ZXJJbmZvKTtcclxuICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ3N1Ym1pdENsdXN0ZXInKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIHN0YXRlSW5mbyA9ICRzdGF0ZS4kY3VycmVudC5uYW1lO1xyXG4gICAgICAgIGlmIChzdGF0ZUluZm8uaW5kZXhPZignbGRhcGluZm8nKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdm0udGFiQWN0aXZlWzFdLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHZtLmdldExkYXAoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdnaXRpbmZvJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVsyXS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB2bS5nZXRHaXRJbmZvKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZUluZm8uaW5kZXhPZigncmVnaXN0cnlpbmZvJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVszXS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB2bS5nZXRSZWdpc3RyeUluZm8oKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdzZXJ2ZXJpbmZvJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVs0XS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB2bS5nZXRTZXJ2ZXJJbmZvKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZUluZm8uaW5kZXhPZignbW9uaXRvcmluZm8nKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdm0udGFiQWN0aXZlWzVdLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHZtLmdldE1vbml0b3JJbmZvKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZUluZm8uaW5kZXhPZignc3NoaW5mbycpICE9PSAtMSkge1xyXG4gICAgICAgICAgICB2bS50YWJBY3RpdmVbNl0uYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdm0uZ2V0V2ViU3NoKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZUluZm8uaW5kZXhPZignY2x1c3RlcmluZm8nKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdm0udGFiQWN0aXZlWzddLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHZtLmluaXRDbHVzdGVySW5mbygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVswXS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEdsb2JhbFNldHRpbmdDdHIuJGluamVjdCA9IFsnJHNjb3BlJywgJyRkb21lR2xvYmFsJywgJyRzdGF0ZScsICckZG9tZVVzZXInLCAnJGRvbWVDbHVzdGVyJywgJyRtb2RhbCcsICckZG9tZVB1YmxpYycsICckcSddO1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBOZXdQYXNzd2RNb2RhbEN0cih1c2VybmFtZSwgJGRvbWVVc2VyLCAkbW9kYWxJbnN0YW5jZSwgJGRvbWVQdWJsaWMpIHtcclxuICAgICAgICB2YXIgdm0gPSB0aGlzO1xyXG4gICAgICAgIHZtLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdm0uc3ViUHcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB1c2VySW5mbyA9IHtcclxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcclxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiB2bS5wYXNzd2RcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJGRvbWVVc2VyLnVzZXJTZXJ2aWNlLm1vZGlmeVB3KHVzZXJJbmZvKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+S/ruaUueaIkOWKn++8gScpO1xyXG4gICAgICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+S/ruaUueWksei0pe+8gScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgTmV3UGFzc3dkTW9kYWxDdHIuJGluamVjdCA9IFsndXNlcm5hbWUnLCAnJGRvbWVVc2VyJywgJyRtb2RhbEluc3RhbmNlJywgJyRkb21lUHVibGljJ107XHJcblxyXG59KSh3aW5kb3cuZG9tZUFwcCk7Il19
