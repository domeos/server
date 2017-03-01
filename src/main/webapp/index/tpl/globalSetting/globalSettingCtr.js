'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
    'use strict';

    if (typeof domeApp === 'undefined') return;

    domeApp.controller('GlobalSettingCtr', GlobalSettingCtr).controller('NewPasswdModalCtr', NewPasswdModalCtr).controller('GitLabInfoModalCtr', GitLabInfoModalCtr);

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
            gitOptions.getData().then(function (gitInfos) {
                vm.gitInfos = gitInfos;
            });
        };
        vm.operateGitInfo = function (gitInfo) {
            var _gitInfoDraft = {};
            if (!gitInfo) {
                _gitInfoDraft = {
                    type: 'GITLAB',
                    description: '', // description is name
                    url: ''
                };
            } else {
                _gitInfoDraft = gitInfo;
            }
            var gitInfoModal = $modal.open({
                animation: true,
                templateUrl: 'gitLabInfoModal.html',
                controller: 'GitLabInfoModalCtr',
                size: 'md',
                resolve: {
                    gitInfoDraft: function gitInfoDraft() {
                        return _gitInfoDraft;
                    }
                }
            });
            gitInfoModal.result.then(function (result) {
                console.log('test: ', result);
                if (result === 'ok') {
                    vm.getGitInfo();
                }
            });
        };
        vm.deleteGitInfo = function (gitInfo) {
            $domePublic.openDelete().then(function () {
                gitOptions.deleteData(gitInfo.id).then(function (res) {
                    vm.getGitInfo();
                }, function (res) {
                    $domePublic.openWarning({
                        title: '删除失败',
                        msg: res.data.resultMsg
                    });
                });
            });
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
        vm.saveGit = function (gitInfo) {
            if (!gitInfo.id) {
                gitInfo.type = 'GITLAB';
            }
            gitOptions.modifyData(gitInfo).then(function (info) {
                if (info) {
                    vm.gitInfos.unshift(info);
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
                nodeList = vm.nodeList;

            vm.clusterLoadingIns.startLoading('submitCluster');
            clusterOptions.modifyData(vm.clusterInfo).then(function (info) {
                clusterInfo = info;
            }, function (resError) {
                $domePublic.openWarning({
                    title: '修改失败！',
                    msg: 'Message:' + resError.data.resultMsg
                });
            }).finally(function () {
                toggleClusterInfo(clusterInfo);
                vm.clusterLoadingIns.finishLoading('submitCluster');
            });
        };
        vm.toggleNodeLabel = function (node) {
            node.isUsedByBuild = !node.isUsedByBuild;
            var isOnly = false;
            if (!node.isUsedByBuild) {
                isOnly = true;
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = vm.nodeList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var _node = _step4.value;

                        if (_node.isUsedByBuild) {
                            isOnly = false;
                            break;
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
            }
            if (isOnly) {
                $domePublic.openWarning('请保证集群内至少有一台用于构建的主机！');
                node.isUsedByBuild = !node.isUsedByBuild;
                return;
            }
            var labelsInfo = [{
                node: node.name,
                labels: {
                    'BUILDENV': 'HOSTENVTYPE'
                }
            }];
            if (node.isUsedByBuild) {
                nodeService.addLabel(vm.clusterInfo.clusterId, labelsInfo).catch(function (res) {
                    node.isUsedByBuild = !node.isUsedByBuild;
                    $domePublic.openWarning({
                        title: '修改失败！',
                        msg: 'Message:' + res.data.resultMsg
                    });
                });
            } else {
                nodeService.deleteLabel(vm.clusterInfo.clusterId, labelsInfo).catch(function (res) {
                    node.isUsedByBuild = !node.isUsedByBuild;
                    $domePublic.openWarning({
                        title: '修改失败！',
                        msg: 'Message:' + res.data.resultMsg
                    });
                });
            }
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

    function GitLabInfoModalCtr($scope, $modalInstance, $domeGlobal, gitInfoDraft) {
        $scope.needValidGit = false;
        $scope.gitInfo = angular.copy(gitInfoDraft);
        $scope.submit = function () {
            $domeGlobal.getGloabalInstance('git').modifyData($scope.gitInfo).then(function () {
                $modalInstance.close('ok');
            }).finally(function () {
                $scope.needValidGit = false;
            });
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
    GitLabInfoModalCtr.$inject = ['$scope', '$modalInstance', '$domeGlobal', 'gitInfoDraft'];
})(window.domeApp);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L3RwbC9nbG9iYWxTZXR0aW5nL2dsb2JhbFNldHRpbmdDdHIuZXMiXSwibmFtZXMiOlsiZG9tZUFwcCIsInVuZGVmaW5lZCIsImNvbnRyb2xsZXIiLCJHbG9iYWxTZXR0aW5nQ3RyIiwiTmV3UGFzc3dkTW9kYWxDdHIiLCJHaXRMYWJJbmZvTW9kYWxDdHIiLCIkc2NvcGUiLCIkZG9tZUdsb2JhbCIsIiRzdGF0ZSIsIiRkb21lVXNlciIsIiRkb21lQ2x1c3RlciIsIiRtb2RhbCIsIiRkb21lUHVibGljIiwiJHEiLCJ2bSIsIiRlbWl0IiwidGl0bGUiLCJkZXNjcml0aW9uIiwibW9kIiwiZ2V0TG9naW5Vc2VyIiwidGhlbiIsInVzZXIiLCJ1c2VybmFtZSIsImdvIiwibGRhcE9wdGlvbnMiLCJnZXRHbG9hYmFsSW5zdGFuY2UiLCJzZXJ2ZXJPcHRpb25zIiwicmVnaXN0cnlPcHRpb25zIiwiZ2l0T3B0aW9ucyIsIm1vbml0b3JPcHRpb25zIiwic3NoT3B0aW9ucyIsImNsdXN0ZXJPcHRpb25zIiwibm9kZVNlcnZpY2UiLCJnZXRJbnN0YW5jZSIsInNlcnZlckluZm8iLCJsZGFwSW5mbyIsInJlZ2lzdHJ5SW5mbyIsImdpdEluZm8iLCJzc2hJbmZvIiwiY2x1c3RlckluZm8iLCJuZXdVc2VyIiwibmVlZFZhbGlkVXNlciIsInZhbGlkIiwia2V5IiwidXNlcktleSIsIm5vZGVLZXkiLCJpc1Nob3dBZGQiLCJjdXJyZW50VXNlclR5cGUiLCJ0eXBlIiwidXNlckxpc3QiLCJsZGFwVXNlckxpc3QiLCJjbHVzdGVyTG9hZGluZ0lucyIsImdldExvYWRpbmdJbnN0YW5jZSIsInRhYkFjdGl2ZSIsImFjdGl2ZSIsIk1vbml0b3IiLCJpbmZvIiwiY29uZmlnIiwiZm9ybWFydFN0clRvT2JqQXJyIiwic3RyIiwiYXJyIiwic3RyQXJyIiwidGV4dCIsInNwbGl0IiwiaSIsImwiLCJsZW5ndGgiLCJwdXNoIiwidHJhbnNmZXIiLCJncmFwaCIsImp1ZGdlIiwiaXRlbSIsImluZGV4Iiwic3BsaWNlIiwib2JqIiwiYW5ndWxhciIsImNvcHkiLCJmb3JtYXJ0QXJyVG9TdHIiLCJtb25pdG9yQXJyIiwiam9pbiIsInVzZXJTZXJ2aWNlIiwiZ2V0VXNlckxpc3QiLCJyZXMiLCJkYXRhIiwicmVzdWx0IiwiZ2V0Q2x1c3Rlckxpc3QiLCJjbHVzdGVyTGlzdCIsIndoZW4iLCJnZXREYXRhIiwidG9nZ2xlVXNlclR5cGUiLCJ1c2VyVHlwZSIsInRvZ2dsZVNob3dBZGQiLCJtb2RpZnlQdyIsIm9wZW4iLCJ0ZW1wbGF0ZVVybCIsInNpemUiLCJyZXNvbHZlIiwibW9kaWZ5VXNlckluZm8iLCJsb2dpblVzZXIiLCJjb3B5VXNlckluZm8iLCJpZCIsIm1vZGFsSW5zdGFuY2UiLCJ1c2VySW5mbyIsImV4dGVuZCIsImRlbGV0ZVVzZXIiLCJvcGVuRGVsZXRlIiwib3Blbldhcm5pbmciLCJnZXRMZGFwIiwicmVnIiwidXJsIiwic2VydmVyIiwicmVwbGFjZSIsInBvcnQiLCJnZXRHaXRJbmZvIiwiZ2l0SW5mb3MiLCJvcGVyYXRlR2l0SW5mbyIsImdpdEluZm9EcmFmdCIsImRlc2NyaXB0aW9uIiwiZ2l0SW5mb01vZGFsIiwiYW5pbWF0aW9uIiwiY29uc29sZSIsImxvZyIsImRlbGV0ZUdpdEluZm8iLCJkZWxldGVEYXRhIiwibXNnIiwicmVzdWx0TXNnIiwiZ2V0UmVnaXN0cnlJbmZvIiwiZ2V0U2VydmVySW5mbyIsImdldE1vbml0b3JJbmZvIiwiaW5pdE1vbml0b3JJbmZvIiwibW9uaXRvcklucyIsImluaXQiLCJtb25pdG9yQ29uZmlnIiwiZ2V0V2ViU3NoIiwidG9nZ2xlQ2x1c3RlciIsImNsdXN0ZXIiLCJuYW1lc3BhY2UiLCJjbHVzdGVySWQiLCJjbHVzdGVyTmFtZSIsIm5hbWUiLCJob3N0IiwiYXBpIiwic3RhcnRMb2FkaW5nIiwiZ2V0TmFtZXNwYWNlIiwibmFtZXNwYWNlTGlzdCIsImZpbmFsbHkiLCJmaW5pc2hMb2FkaW5nIiwiZ2V0Tm9kZUxpc3QiLCJub2RlTGlzdCIsIm5vZGUiLCJjYXBhY2l0eSIsIm1lbW9yeSIsInRvRml4ZWQiLCJsYWJlbHMiLCJpc1VzZWRCeUJ1aWxkIiwiQlVJTERFTlYiLCJ0b2dnbGVDbHVzdGVySW5mbyIsImluaXRDbHVzdGVySW5mbyIsImFsbCIsImFkZFVzZXIiLCJmb3JtIiwicmVQYXNzd29yZCIsImNyZWF0ZVVzZXIiLCJvcGVuUHJvbXB0IiwiJHNldFByaXN0aW5lIiwic2F2ZUxkYXAiLCJtb2RpZnlEYXRhIiwic2F2ZUdpdCIsInVuc2hpZnQiLCJzYXZlUmVnaXN0cnkiLCJjcmVhdGVUaW1lIiwic3RhdHVzIiwiY2VydGlmaWNhdGlvbiIsInNhdmVTZXJ2ZXIiLCJzYXZlTW9uaXRvciIsImZvcm1hcnRNb25pdG9yIiwic2F2ZVNzaCIsInNhdmVDbHVzdGVyIiwicmVzRXJyb3IiLCJ0b2dnbGVOb2RlTGFiZWwiLCJpc09ubHkiLCJsYWJlbHNJbmZvIiwiYWRkTGFiZWwiLCJjYXRjaCIsImRlbGV0ZUxhYmVsIiwic3RhdGVJbmZvIiwiJGN1cnJlbnQiLCJpbmRleE9mIiwiJGluamVjdCIsIiRtb2RhbEluc3RhbmNlIiwiY2FuY2VsIiwiZGlzbWlzcyIsInN1YlB3IiwicGFzc3dvcmQiLCJwYXNzd2QiLCJjbG9zZSIsIm5lZWRWYWxpZEdpdCIsInN1Ym1pdCIsIndpbmRvdyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7QUFJQSxDQUFDLFVBQUNBLE9BQUQsRUFBVUMsU0FBVixFQUF3QjtBQUNyQjs7QUFDQSxRQUFJLE9BQU9ELE9BQVAsS0FBbUIsV0FBdkIsRUFBb0M7O0FBRXBDQSxZQUFRRSxVQUFSLENBQW1CLGtCQUFuQixFQUF1Q0MsZ0JBQXZDLEVBQ0tELFVBREwsQ0FDZ0IsbUJBRGhCLEVBQ3FDRSxpQkFEckMsRUFFS0YsVUFGTCxDQUVnQixvQkFGaEIsRUFFcUNHLGtCQUZyQzs7QUFJQSxhQUFTRixnQkFBVCxDQUEwQkcsTUFBMUIsRUFBa0NDLFdBQWxDLEVBQStDQyxNQUEvQyxFQUF1REMsU0FBdkQsRUFBa0VDLFlB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S0FBL0IsRUFBc0M2SSxVQUF0QyxDQUFpRGhLLE9BQU8rQixPQUF4RCxFQUFpRWpCLElBQWpFLENBQXNFLFlBQU07QUFDeEV5SywrQkFBZU0sS0FBZixDQUFxQixJQUFyQjtBQUNILGFBRkQsRUFFR2xELE9BRkgsQ0FFVyxZQUFLO0FBQ1ozSSx1QkFBTzhMLFlBQVAsR0FBc0IsS0FBdEI7QUFDSCxhQUpEO0FBS0gsU0FORDtBQU9BOUwsZUFBT3dMLE1BQVAsR0FBZ0IsWUFBWTtBQUN4QkQsMkJBQWVFLE9BQWYsQ0FBdUIsUUFBdkI7QUFDSCxTQUZEO0FBR0g7QUFDRDFMLHVCQUFtQnVMLE9BQW5CLEdBQTZCLENBQUMsUUFBRCxFQUFVLGdCQUFWLEVBQTJCLGFBQTNCLEVBQXlDLGNBQXpDLENBQTdCO0FBQ0gsQ0F6aUJELEVBeWlCR1UsT0FBT3RNLE9BemlCViIsImZpbGUiOiJpbmRleC90cGwvZ2xvYmFsU2V0dGluZy9nbG9iYWxTZXR0aW5nQ3RyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIEBhdXRob3IgQ2hhbmRyYUxlZVxuICovXG5cbigoZG9tZUFwcCwgdW5kZWZpbmVkKSA9PiB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZG9tZUFwcCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcblxuICAgIGRvbWVBcHAuY29udHJvbGxlcignR2xvYmFsU2V0dGluZ0N0cicsIEdsb2JhbFNldHRpbmdDdHIpXG4gICAgICAgIC5jb250cm9sbGVyKCdOZXdQYXNzd2RNb2RhbEN0cicsIE5ld1Bhc3N3ZE1vZGFsQ3RyKVxuICAgICAgICAuY29udHJvbGxlcignR2l0TGFiSW5mb01vZGFsQ3RyJyxHaXRMYWJJbmZvTW9kYWxDdHIpO1xuXG4gICAgZnVuY3Rpb24gR2xvYmFsU2V0dGluZ0N0cigkc2NvcGUsICRkb21lR2xvYmFsLCAkc3RhdGUsICRkb21lVXNlciwgJGRvbWVDbHVzdGVyLCAkbW9kYWwsICRkb21lUHVibGljLCAkcSkge1xuICAgICAgICBsZXQgdm0gPSB0aGlzO1xuICAgICAgICAkc2NvcGUuJGVtaXQoJ3BhZ2VUaXRsZScsIHtcbiAgICAgICAgICAgIHRpdGxlOiAn5YWo5bGA6YWN572uJyxcbiAgICAgICAgICAgIGRlc2NyaXRpb246ICflnKjov5nph4zmgqjlj6/ku6Xov5vooYzkuIDkupvlhajlsYDphY3nva7vvIzkv53or4Fkb21lb3Pog73lpJ/mraPluLjov5DooYzlkozkvb/nlKjjgIInLFxuICAgICAgICAgICAgbW9kOiAnZ2xvYmFsJ1xuICAgICAgICB9KTtcbiAgICAgICAgJGRvbWVVc2VyLmdldExvZ2luVXNlcigpLnRoZW4oKHVzZXIpID0+IHtcbiAgICAgICAgICAgIGlmICh1c2VyLnVzZXJuYW1lICE9PSAnYWRtaW4nKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdwcm9qZWN0TWFuYWdlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGxkYXBPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdsZGFwJyksXG4gICAgICAgICAgICBzZXJ2ZXJPcHRpb25zID0gJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdzZXJ2ZXInKSxcbiAgICAgICAgICAgIHJlZ2lzdHJ5T3B0aW9ucyA9ICRkb21lR2xvYmFsLmdldEdsb2FiYWxJbnN0YW5jZSgncmVnaXN0cnknKSxcbiAgICAgICAgICAgIGdpdE9wdGlvbnMgPSAkZG9tZUdsb2JhbC5nZXRHbG9hYmFsSW5zdGFuY2UoJ2dpdCcpLFxuICAgICAgICAgICAgbW9uaXRvck9wdGlvbnMgPSAkZG9tZUdsb2JhbC5nZXRHbG9hYmFsSW5zdGFuY2UoJ21vbml0b3InKSxcbiAgICAgICAgICAgIHNzaE9wdGlvbnMgPSAkZG9tZUdsb2JhbC5nZXRHbG9hYmFsSW5zdGFuY2UoJ3NzaCcpLFxuICAgICAgICAgICAgY2x1c3Rlck9wdGlvbnMgPSAkZG9tZUdsb2JhbC5nZXRHbG9hYmFsSW5zdGFuY2UoJ2NsdXN0ZXInKSxcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlID0gJGRvbWVDbHVzdGVyLmdldEluc3RhbmNlKCdOb2RlU2VydmljZScpO1xuXG4gICAgICAgIHZtLnNlcnZlckluZm8gPSB7fTtcbiAgICAgICAgdm0ubGRhcEluZm8gPSB7fTtcbiAgICAgICAgdm0ucmVnaXN0cnlJbmZvID0ge307XG4gICAgICAgIHZtLmdpdEluZm8gPSB7fTtcbiAgICAgICAgdm0uc3NoSW5mbyA9IHt9O1xuICAgICAgICB2bS5jbHVzdGVySW5mbyA9IHt9O1xuICAgICAgICB2bS5uZXdVc2VyID0ge307XG4gICAgICAgIHZtLm5lZWRWYWxpZFVzZXIgPSB7XG4gICAgICAgICAgICB2YWxpZDogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgdm0ua2V5ID0ge1xuICAgICAgICAgICAgdXNlcktleTogJycsXG4gICAgICAgICAgICBub2RlS2V5OiAnJ1xuICAgICAgICB9O1xuICAgICAgICB2bS5pc1Nob3dBZGQgPSBmYWxzZTtcbiAgICAgICAgdm0uY3VycmVudFVzZXJUeXBlID0ge1xuICAgICAgICAgICAgLy8gJ1VTRVInKOaZrumAmueUqOaItykgb3IgJ0xEQVAnXG4gICAgICAgICAgICB0eXBlOiAnVVNFUidcbiAgICAgICAgfTtcbiAgICAgICAgLy8g5pmu6YCa55So5oi35YiX6KGoXG4gICAgICAgIHZtLnVzZXJMaXN0ID0gW107XG4gICAgICAgIC8vIGxkYXDnlKjmiLfliJfooahcbiAgICAgICAgdm0ubGRhcFVzZXJMaXN0ID0gW107XG5cbiAgICAgICAgdm0uY2x1c3RlckxvYWRpbmdJbnMgPSAkZG9tZVB1YmxpYy5nZXRMb2FkaW5nSW5zdGFuY2UoKTtcbiAgICAgICAgdm0udGFiQWN0aXZlID0gW3tcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxuICAgICAgICB9XTtcblxuXG4gICAgICAgIGNsYXNzIE1vbml0b3Ige1xuICAgICAgICAgICAgaW5pdChpbmZvKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSBpbmZvIHx8IHt9O1xuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZm9ybWFydFN0clRvT2JqQXJyKHN0cikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJyID0gW107XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHJBcnIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzdHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzdHJBcnIgPSBzdHIuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzdHJBcnIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcnIucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogc3RyQXJyW2ldXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBhcnIucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcudHJhbnNmZXIgPSBmb3JtYXJ0U3RyVG9PYmpBcnIodGhpcy5jb25maWcudHJhbnNmZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmdyYXBoID0gZm9ybWFydFN0clRvT2JqQXJyKHRoaXMuY29uZmlnLmdyYXBoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5qdWRnZSA9IGZvcm1hcnRTdHJUb09iakFycih0aGlzLmNvbmZpZy5qdWRnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGRJdGVtKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ1tpdGVtXS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZUFyckl0ZW0oaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ1tpdGVtXS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9ybWFydE1vbml0b3IoKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9iaiA9IGFuZ3VsYXIuY29weSh0aGlzLmNvbmZpZyk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBmb3JtYXJ0QXJyVG9TdHIgPSAobW9uaXRvckFycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3RyQXJyID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gbW9uaXRvckFyci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb25pdG9yQXJyW2ldLnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJBcnIucHVzaChtb25pdG9yQXJyW2ldLnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJBcnIuam9pbignLCcpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgb2JqLnRyYW5zZmVyID0gZm9ybWFydEFyclRvU3RyKHRoaXMuY29uZmlnLnRyYW5zZmVyKTtcbiAgICAgICAgICAgICAgICBvYmouZ3JhcGggPSBmb3JtYXJ0QXJyVG9TdHIodGhpcy5jb25maWcuZ3JhcGgpO1xuICAgICAgICAgICAgICAgIG9iai5qdWRnZSA9IGZvcm1hcnRBcnJUb1N0cih0aGlzLmNvbmZpZy5qdWRnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICRkb21lVXNlci51c2VyU2VydmljZS5nZXRVc2VyTGlzdCgpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgdm0udXNlckxpc3QgPSByZXMuZGF0YS5yZXN1bHQgfHwgW107XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGdldENsdXN0ZXJMaXN0ID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHZtLmNsdXN0ZXJMaXN0KSB7XG4gICAgICAgICAgICAgICAgJHEud2hlbih2bS5jbHVzdGVyTGlzdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBub2RlU2VydmljZS5nZXREYXRhKCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm0uY2x1c3Rlckxpc3Q7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZtLnRvZ2dsZVVzZXJUeXBlID0gKHVzZXJUeXBlKSA9PiB7XG4gICAgICAgICAgICBpZiAodXNlclR5cGUgIT09IHZtLmN1cnJlbnRVc2VyVHlwZSkge1xuICAgICAgICAgICAgICAgIHZtLmN1cnJlbnRVc2VyVHlwZS50eXBlID0gdXNlclR5cGU7XG4gICAgICAgICAgICAgICAgdm0uaXNTaG93QWRkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdm0ua2V5LnVzZXJLZXkgPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdm0udG9nZ2xlU2hvd0FkZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHZtLmlzU2hvd0FkZCA9ICF2bS5pc1Nob3dBZGQ7XG4gICAgICAgIH07XG4gICAgICAgIHZtLm1vZGlmeVB3ID0gKHVzZXIpID0+IHtcbiAgICAgICAgICAgICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ25ld1Bhc3N3ZE1vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdOZXdQYXNzd2RNb2RhbEN0ciBhcyB2bVB3JyxcbiAgICAgICAgICAgICAgICBzaXplOiAnbWQnLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1c2VyLnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB2bS5tb2RpZnlVc2VySW5mbyA9ICh1c2VyKSA9PiB7XG4gICAgICAgICAgICAkZG9tZVVzZXIuZ2V0TG9naW5Vc2VyKCkudGhlbigobG9naW5Vc2VyKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGNvcHlVc2VySW5mbyA9IGxvZ2luVXNlci5pZCA9PT0gdXNlci5pZCA/IGFuZ3VsYXIuY29weShsb2dpblVzZXIpIDogYW5ndWxhci5jb3B5KHVzZXIpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdtb2RpZnlVc2VySW5mb01vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnTW9kaWZ5VXNlckluZm9DdHInLFxuICAgICAgICAgICAgICAgICAgICBzaXplOiAnbWQnLFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvcHlVc2VySW5mbztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oKHVzZXJJbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHVzZXIsIHVzZXJJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVVc2VyLmdldExvZ2luVXNlcigpLnRoZW4oZnVuY3Rpb24gKGxvZ2luVXNlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvZ2luVXNlci5pZCA9PT0gdXNlci5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKGxvZ2luVXNlciwgdXNlckluZm8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZtLmRlbGV0ZVVzZXIgPSAodXNlcikgPT4ge1xuICAgICAgICAgICAgdmFyIGlkID0gdXNlci5pZDtcbiAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5EZWxldGUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAkZG9tZVVzZXIudXNlclNlcnZpY2UuZGVsZXRlVXNlcihpZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdm0udXNlckxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2bS51c2VyTGlzdFtpXS5pZCA9PT0gaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2bS51c2VyTGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKCfliKDpmaTlpLHotKXvvIEnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZtLmdldExkYXAgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXZtLmxkYXBJbmZvLmlkKSB7XG4gICAgICAgICAgICAgICAgbGRhcE9wdGlvbnMuZ2V0RGF0YSgpLnRoZW4oZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlZyA9IC8oLiopOihbXjpdKykvZztcbiAgICAgICAgICAgICAgICAgICAgdm0ubGRhcEluZm8gPSBpbmZvO1xuICAgICAgICAgICAgICAgICAgICB2bS5sZGFwSW5mby51cmwgPSB2bS5sZGFwSW5mby5zZXJ2ZXIucmVwbGFjZShyZWcsICckMScpO1xuICAgICAgICAgICAgICAgICAgICB2bS5sZGFwSW5mby5wb3J0ID0gdm0ubGRhcEluZm8uc2VydmVyLnJlcGxhY2UocmVnLCAnJDInKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdm0uZ2V0R2l0SW5mbyA9ICgpID0+IHtcbiAgICAgICAgICAgIGdpdE9wdGlvbnMuZ2V0RGF0YSgpLnRoZW4oZnVuY3Rpb24gKGdpdEluZm9zKSB7XG4gICAgICAgICAgICAgICAgdm0uZ2l0SW5mb3MgPSBnaXRJbmZvcztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2bS5vcGVyYXRlR2l0SW5mbyA9IChnaXRJbmZvKSA9PiB7XG4gICAgICAgICAgICBsZXQgZ2l0SW5mb0RyYWZ0ID0ge307XG4gICAgICAgICAgICBpZighZ2l0SW5mbykge1xuICAgICAgICAgICAgICAgIGdpdEluZm9EcmFmdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0dJVExBQicsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJywgLy8gZGVzY3JpcHRpb24gaXMgbmFtZVxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZXtcbiAgICAgICAgICAgICAgICBnaXRJbmZvRHJhZnQgPSBnaXRJbmZvO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGdpdEluZm9Nb2RhbCA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdnaXRMYWJJbmZvTW9kYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0dpdExhYkluZm9Nb2RhbEN0cicsXG4gICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgIGdpdEluZm9EcmFmdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ2l0SW5mb0RyYWZ0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBnaXRJbmZvTW9kYWwucmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0ZXN0OiAnLHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgaWYocmVzdWx0ID09PSAnb2snKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLmdldEdpdEluZm8oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdm0uZGVsZXRlR2l0SW5mbyA9IChnaXRJbmZvKSA9PiB7XG4gICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuRGVsZXRlKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBnaXRPcHRpb25zLmRlbGV0ZURhdGEoZ2l0SW5mby5pZCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdm0uZ2V0R2l0SW5mbygpO1xuICAgICAgICAgICAgICAgIH0sZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6J+WIoOmZpOWksei0pScsXG4gICAgICAgICAgICAgICAgICAgICAgICBtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHZtLmdldFJlZ2lzdHJ5SW5mbyA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdm0ucmVnaXN0cnlJbmZvLmlkKSB7XG4gICAgICAgICAgICAgICAgcmVnaXN0cnlPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnJlZ2lzdHJ5SW5mbyA9IGluZm87XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZtLmdldFNlcnZlckluZm8gPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXZtLnNlcnZlckluZm8uaWQpIHtcbiAgICAgICAgICAgICAgICBzZXJ2ZXJPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnNlcnZlckluZm8gPSBpbmZvO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2bS5nZXRNb25pdG9ySW5mbyA9ICgpID0+IHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGluaXRNb25pdG9ySW5mbyhpbmZvKSB7XG4gICAgICAgICAgICAgICAgdm0ubW9uaXRvcklucyA9IG5ldyBNb25pdG9yKCk7XG4gICAgICAgICAgICAgICAgdm0ubW9uaXRvcklucy5pbml0KGluZm8pO1xuICAgICAgICAgICAgICAgIHZtLm1vbml0b3JDb25maWcgPSB2bS5tb25pdG9ySW5zLmNvbmZpZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdm0ubW9uaXRvckNvbmZpZykge1xuICAgICAgICAgICAgICAgIG1vbml0b3JPcHRpb25zLmdldERhdGEoKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRNb25pdG9ySW5mbyhpbmZvKTtcbiAgICAgICAgICAgICAgICB9LCBpbml0TW9uaXRvckluZm8oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZtLmdldFdlYlNzaCA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdm0uc3NoSW5mby5pZCkge1xuICAgICAgICAgICAgICAgIHNzaE9wdGlvbnMuZ2V0RGF0YSgpLnRoZW4oZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdm0uc3NoSW5mbyA9IGluZm87XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vIEBwYXJhbSBuYW1lc3BhY2U6IOWPr+S4jeWhq++8jOacieWAvOaXtum7mOiupOS4uuivpW5hbWVzcGFjZVxuICAgICAgICB2bS50b2dnbGVDbHVzdGVyID0gKGNsdXN0ZXIsIG5hbWVzcGFjZSkgPT4ge1xuICAgICAgICAgICAgdm0uY2x1c3RlckluZm8uY2x1c3RlcklkID0gY2x1c3Rlci5pZDtcbiAgICAgICAgICAgIHZtLmNsdXN0ZXJJbmZvLmNsdXN0ZXJOYW1lID0gY2x1c3Rlci5uYW1lO1xuICAgICAgICAgICAgdm0uY2x1c3RlckluZm8uaG9zdCA9IGNsdXN0ZXIuYXBpO1xuICAgICAgICAgICAgdm0ua2V5Lm5vZGVLZXkgPSAnJztcbiAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnbmFtZXNwYWNlJyk7XG4gICAgICAgICAgICB2bS5jbHVzdGVyTG9hZGluZ0lucy5zdGFydExvYWRpbmcoJ25vZGVMaXN0Jyk7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXROYW1lc3BhY2UoY2x1c3Rlci5pZCwgY2x1c3Rlci5uYW1lKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICB2bS5uYW1lc3BhY2VMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdm0uY2x1c3RlckluZm8ubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5hbWVzcGFjZSBvZiB2bS5uYW1lc3BhY2VMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmFtZXNwYWNlLm5hbWUgPT0gJ2RlZmF1bHQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0uY2x1c3RlckluZm8ubmFtZXNwYWNlID0gJ2RlZmF1bHQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2bS5jbHVzdGVySW5mby5uYW1lc3BhY2UgPSB2bS5uYW1lc3BhY2VMaXN0WzBdICYmIHZtLm5hbWVzcGFjZUxpc3RbMF0ubmFtZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdm0ubmFtZXNwYWNlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJJbmZvLm5hbWVzcGFjZSA9IG51bGw7XG4gICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICB2bS5jbHVzdGVyTG9hZGluZ0lucy5maW5pc2hMb2FkaW5nKCduYW1lc3BhY2UnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0Tm9kZUxpc3QoY2x1c3Rlci5pZCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG5vZGVMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuY2FwYWNpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuY2FwYWNpdHkubWVtb3J5ID0gKG5vZGUuY2FwYWNpdHkubWVtb3J5IC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFub2RlLmxhYmVscykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5sYWJlbHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBub2RlLmlzVXNlZEJ5QnVpbGQgPSBub2RlLmxhYmVscy5CVUlMREVOViA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdm0ubm9kZUxpc3QgPSBub2RlTGlzdDtcbiAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ25vZGVMaXN0Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdG9nZ2xlQ2x1c3RlckluZm8gPSAoY2x1c3RlckluZm8pID0+IHtcbiAgICAgICAgICAgIHZtLmNsdXN0ZXJJbmZvID0gY2x1c3RlckluZm8gfHwge307XG4gICAgICAgICAgICBmb3IgKGxldCBjbHVzdGVyIG9mIHZtLmNsdXN0ZXJMaXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGNsdXN0ZXIuYXBpID09PSB2bS5jbHVzdGVySW5mby5ob3N0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnRvZ2dsZUNsdXN0ZXIoY2x1c3Rlciwgdm0uY2x1c3RlckluZm8ubmFtZXNwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdm0uaW5pdENsdXN0ZXJJbmZvID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF2bS5jbHVzdGVySW5mby5pZCkge1xuICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLnN0YXJ0TG9hZGluZygnY2x1c3RlcicpO1xuICAgICAgICAgICAgICAgICRxLmFsbChbZ2V0Q2x1c3Rlckxpc3QoKSwgY2x1c3Rlck9wdGlvbnMuZ2V0RGF0YSgpXSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZUNsdXN0ZXJJbmZvKHJlc1sxXSk7XG4gICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ2NsdXN0ZXInKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdm0uYWRkVXNlciA9IChmb3JtKSA9PiB7XG4gICAgICAgICAgICB2YXIgbmV3VXNlciA9IGFuZ3VsYXIuY29weSh2bS5uZXdVc2VyKTtcbiAgICAgICAgICAgIGRlbGV0ZSBuZXdVc2VyLnJlUGFzc3dvcmQ7XG5cbiAgICAgICAgICAgICRkb21lVXNlci51c2VyU2VydmljZS5jcmVhdGVVc2VyKG5ld1VzZXIpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+WIm+W7uuaIkOWKn++8gScpO1xuICAgICAgICAgICAgICAgIHZhciB1c2VyID0gYW5ndWxhci5jb3B5KG5ld1VzZXIpO1xuICAgICAgICAgICAgICAgIGlmIChyZXMuZGF0YS5yZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdm0udXNlckxpc3QucHVzaChyZXMuZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2bS5uZXdVc2VyID0ge307XG4gICAgICAgICAgICAgICAgdm0ubmVlZFZhbGlkVXNlci52YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGZvcm0uJHNldFByaXN0aW5lKCk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+WIm+W7uuWksei0pe+8gScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHZtLnNhdmVMZGFwID0gKCkgPT4ge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBhbmd1bGFyLmNvcHkodm0ubGRhcEluZm8pO1xuICAgICAgICAgICAgZGF0YS5zZXJ2ZXIgPSBkYXRhLnVybCArICc6JyArIGRhdGEucG9ydDtcbiAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnVybDtcbiAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnBvcnQ7XG4gICAgICAgICAgICBsZGFwT3B0aW9ucy5tb2RpZnlEYXRhKGRhdGEpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZtLmdldExkYXAoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2bS5zYXZlR2l0ID0gKGdpdEluZm8pID0+IHtcbiAgICAgICAgICAgIGlmICghZ2l0SW5mby5pZCkge1xuICAgICAgICAgICAgICAgIGdpdEluZm8udHlwZSA9ICdHSVRMQUInO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ2l0T3B0aW9ucy5tb2RpZnlEYXRhKGdpdEluZm8pLnRoZW4oZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5mbykge1xuICAgICAgICAgICAgICAgICAgICB2bS5naXRJbmZvcy51bnNoaWZ0KGluZm8pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2bS5zYXZlUmVnaXN0cnkgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodm0ucmVnaXN0cnlJbmZvLmlkKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHZtLnJlZ2lzdHJ5SW5mby5pZDtcbiAgICAgICAgICAgICAgICBkZWxldGUgdm0ucmVnaXN0cnlJbmZvLmNyZWF0ZVRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmVnaXN0cnlJbmZvID0gYW5ndWxhci5jb3B5KHZtLnJlZ2lzdHJ5SW5mbyk7XG4gICAgICAgICAgICBpZiAocmVnaXN0cnlJbmZvLnN0YXR1cyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSByZWdpc3RyeUluZm8uY2VydGlmaWNhdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlZ2lzdHJ5T3B0aW9ucy5tb2RpZnlEYXRhKHJlZ2lzdHJ5SW5mbykudGhlbihmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnJlZ2lzdHJ5SW5mbyA9IGluZm87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHZtLnNhdmVTZXJ2ZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBzZXJ2ZXJPcHRpb25zLm1vZGlmeURhdGEodm0uc2VydmVySW5mbykudGhlbihmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnNlcnZlckluZm8gPSBpbmZvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2bS5zYXZlTW9uaXRvciA9ICgpID0+IHtcbiAgICAgICAgICAgIG1vbml0b3JPcHRpb25zLm1vZGlmeURhdGEodm0ubW9uaXRvcklucy5mb3JtYXJ0TW9uaXRvcigpKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdm0ubW9uaXRvcklucy5pbml0KGluZm8pO1xuICAgICAgICAgICAgICAgICAgICB2bS5tb25pdG9yQ29uZmlnID0gdm0ubW9uaXRvcklucy5jb25maWc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHZtLnNhdmVTc2ggPSAoKSA9PiB7XG4gICAgICAgICAgICBzc2hPcHRpb25zLm1vZGlmeURhdGEodm0uc3NoSW5mbykudGhlbigoaW5mbykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnNzaEluZm8gPSBpbmZvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2bS5zYXZlQ2x1c3RlciA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBjbHVzdGVySW5mbywgbm9kZUxpc3QgPSB2bS5ub2RlTGlzdDtcblxuICAgICAgICAgICAgdm0uY2x1c3RlckxvYWRpbmdJbnMuc3RhcnRMb2FkaW5nKCdzdWJtaXRDbHVzdGVyJyk7XG4gICAgICAgICAgICBjbHVzdGVyT3B0aW9ucy5tb2RpZnlEYXRhKHZtLmNsdXN0ZXJJbmZvKS50aGVuKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgY2x1c3RlckluZm8gPSBpbmZvO1xuICAgICAgICAgICAgfSxmdW5jdGlvbihyZXNFcnJvcikge1xuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfkv67mlLnlpLHotKXvvIEnLFxuICAgICAgICAgICAgICAgICAgICBtc2c6ICdNZXNzYWdlOicgKyByZXNFcnJvci5kYXRhLnJlc3VsdE1zZ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdG9nZ2xlQ2x1c3RlckluZm8oY2x1c3RlckluZm8pO1xuICAgICAgICAgICAgICAgIHZtLmNsdXN0ZXJMb2FkaW5nSW5zLmZpbmlzaExvYWRpbmcoJ3N1Ym1pdENsdXN0ZXInKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2bS50b2dnbGVOb2RlTGFiZWwgPSAobm9kZSkgPT4ge1xuICAgICAgICAgICAgbm9kZS5pc1VzZWRCeUJ1aWxkID0gIW5vZGUuaXNVc2VkQnlCdWlsZDtcbiAgICAgICAgICAgIGxldCBpc09ubHkgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICghbm9kZS5pc1VzZWRCeUJ1aWxkKSB7XG4gICAgICAgICAgICAgICAgaXNPbmx5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHZtLm5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmlzVXNlZEJ5QnVpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzT25seSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNPbmx5KSB7XG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+ivt+S/neivgembhue+pOWGheiHs+WwkeacieS4gOWPsOeUqOS6juaehOW7uueahOS4u+acuu+8gScpO1xuICAgICAgICAgICAgICAgIG5vZGUuaXNVc2VkQnlCdWlsZCA9ICFub2RlLmlzVXNlZEJ5QnVpbGQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBsYWJlbHNJbmZvID0gW3tcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlLm5hbWUsXG4gICAgICAgICAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgICAgICAgICAgICdCVUlMREVOVic6ICdIT1NURU5WVFlQRSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XTtcbiAgICAgICAgICAgIGlmIChub2RlLmlzVXNlZEJ5QnVpbGQpIHtcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5hZGRMYWJlbCh2bS5jbHVzdGVySW5mby5jbHVzdGVySWQsIGxhYmVsc0luZm8pLmNhdGNoKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1VzZWRCeUJ1aWxkID0gIW5vZGUuaXNVc2VkQnlCdWlsZDtcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfkv67mlLnlpLHotKXvvIEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiAnTWVzc2FnZTonICsgcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5kZWxldGVMYWJlbCh2bS5jbHVzdGVySW5mby5jbHVzdGVySWQsIGxhYmVsc0luZm8pLmNhdGNoKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pc1VzZWRCeUJ1aWxkID0gIW5vZGUuaXNVc2VkQnlCdWlsZDtcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfkv67mlLnlpLHotKXvvIEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiAnTWVzc2FnZTonICsgcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBzdGF0ZUluZm8gPSAkc3RhdGUuJGN1cnJlbnQubmFtZTtcbiAgICAgICAgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdsZGFwaW5mbycpICE9PSAtMSkge1xuICAgICAgICAgICAgdm0udGFiQWN0aXZlWzFdLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB2bS5nZXRMZGFwKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ2dpdGluZm8nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVsyXS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdm0uZ2V0R2l0SW5mbygpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdyZWdpc3RyeWluZm8nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVszXS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdm0uZ2V0UmVnaXN0cnlJbmZvKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGVJbmZvLmluZGV4T2YoJ3NlcnZlcmluZm8nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVs0XS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdm0uZ2V0U2VydmVySW5mbygpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdtb25pdG9yaW5mbycpICE9PSAtMSkge1xuICAgICAgICAgICAgdm0udGFiQWN0aXZlWzVdLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB2bS5nZXRNb25pdG9ySW5mbygpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdzc2hpbmZvJykgIT09IC0xKSB7XG4gICAgICAgICAgICB2bS50YWJBY3RpdmVbNl0uYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHZtLmdldFdlYlNzaCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlSW5mby5pbmRleE9mKCdjbHVzdGVyaW5mbycpICE9PSAtMSkge1xuICAgICAgICAgICAgdm0udGFiQWN0aXZlWzddLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB2bS5pbml0Q2x1c3RlckluZm8oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZtLnRhYkFjdGl2ZVswXS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIEdsb2JhbFNldHRpbmdDdHIuJGluamVjdCA9IFsnJHNjb3BlJywgJyRkb21lR2xvYmFsJywgJyRzdGF0ZScsICckZG9tZVVzZXInLCAnJGRvbWVDbHVzdGVyJywgJyRtb2RhbCcsICckZG9tZVB1YmxpYycsICckcSddO1xuXG5cbiAgICBmdW5jdGlvbiBOZXdQYXNzd2RNb2RhbEN0cih1c2VybmFtZSwgJGRvbWVVc2VyLCAkbW9kYWxJbnN0YW5jZSwgJGRvbWVQdWJsaWMpIHtcbiAgICAgICAgdmFyIHZtID0gdGhpcztcbiAgICAgICAgdm0uY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgICAgICB9O1xuICAgICAgICB2bS5zdWJQdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB1c2VySW5mbyA9IHtcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHZtLnBhc3N3ZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICRkb21lVXNlci51c2VyU2VydmljZS5tb2RpZnlQdyh1c2VySW5mbykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5L+u5pS55oiQ5Yqf77yBJyk7XG4gICAgICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5L+u5pS55aSx6LSl77yBJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgTmV3UGFzc3dkTW9kYWxDdHIuJGluamVjdCA9IFsndXNlcm5hbWUnLCAnJGRvbWVVc2VyJywgJyRtb2RhbEluc3RhbmNlJywgJyRkb21lUHVibGljJ107XG5cbiAgICBmdW5jdGlvbiBHaXRMYWJJbmZvTW9kYWxDdHIoJHNjb3BlLCRtb2RhbEluc3RhbmNlLCRkb21lR2xvYmFsLGdpdEluZm9EcmFmdCl7XG4gICAgICAgICRzY29wZS5uZWVkVmFsaWRHaXQgPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlLmdpdEluZm8gPSBhbmd1bGFyLmNvcHkoZ2l0SW5mb0RyYWZ0KTtcbiAgICAgICAgJHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGRvbWVHbG9iYWwuZ2V0R2xvYWJhbEluc3RhbmNlKCdnaXQnKS5tb2RpZnlEYXRhKCRzY29wZS5naXRJbmZvKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgnb2snKTtcbiAgICAgICAgICAgIH0pLmZpbmFsbHkoKCk9PiB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm5lZWRWYWxpZEdpdCA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCdjYW5jZWwnKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgR2l0TGFiSW5mb01vZGFsQ3RyLiRpbmplY3QgPSBbJyRzY29wZScsJyRtb2RhbEluc3RhbmNlJywnJGRvbWVHbG9iYWwnLCdnaXRJbmZvRHJhZnQnXVxufSkod2luZG93LmRvbWVBcHApOyJdfQ==
