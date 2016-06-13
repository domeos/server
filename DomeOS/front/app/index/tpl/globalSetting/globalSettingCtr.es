((domeApp, undefined) => {
    'use strict';
    if (typeof domeApp === 'undefined') return;

    domeApp.controller('GlobalSettingCtr', GlobalSettingCtr)
        .controller('NewPasswdModalCtr', NewPasswdModalCtr);

    function GlobalSettingCtr($scope, $domeGlobal, $state, $domeUser, $domeCluster, $modal, $domePublic, $q) {
        let vm = this;
        $scope.$emit('pageTitle', {
            title: '全局配置',
            descrition: '在这里您可以进行一些全局配置，保证domeos能够正常运行和使用。',
            mod: 'global'
        });
        $domeUser.getLoginUser().then((user) => {
            if (user.username !== 'admin') {
                $state.go('projectManage');
            }
        });

        const ldapOptions = $domeGlobal.getGloabalInstance('ldap'),
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


        class Monitor {
            init(info) {
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
            addItem(item) {
                this.config[item].push({
                    text: ''
                });
            }
            deleteArrItem(item, index) {
                this.config[item].splice(index, 1);
            }
            formartMonitor() {
                let obj = angular.copy(this.config);

                const formartArrToStr = (monitorArr) => {
                    let strArr = [];
                    for (let i = 0, l = monitorArr.length; i < l; i++) {
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
        }

        $domeUser.userService.getUserList().then(function (res) {
            vm.userList = res.data.result || [];
        });

        const getClusterList = () => {
            if (vm.clusterList) {
                $q.when(vm.clusterList);
            } else {
                return nodeService.getData().then((res) => {
                    vm.clusterList = res.data.result || [];
                    return vm.clusterList;
                });
            }
        };
        vm.toggleUserType = (userType) => {
            if (userType !== vm.currentUserType) {
                vm.currentUserType.type = userType;
                vm.isShowAdd = false;
                vm.key.userKey = '';
            }
        };
        vm.toggleShowAdd = () => {
            vm.isShowAdd = !vm.isShowAdd;
        };
        vm.modifyPw = (user) => {
            $modal.open({
                templateUrl: 'newPasswdModal.html',
                controller: 'NewPasswdModalCtr as vmPw',
                size: 'md',
                resolve: {
                    username: function () {
                        return user.username;
                    }
                }
            });

        };

        vm.modifyUserInfo = (user) => {
            $domeUser.getLoginUser().then((loginUser) => {
                let copyUserInfo = loginUser.id === user.id ? angular.copy(loginUser) : angular.copy(user);

                const modalInstance = $modal.open({
                    templateUrl: 'modifyUserInfoModal.html',
                    controller: 'ModifyUserInfoCtr',
                    size: 'md',
                    resolve: {
                        user: function () {
                            return copyUserInfo;
                        }
                    }
                });
                modalInstance.result.then((userInfo) => {
                    angular.extend(user, userInfo);
                    $domeUser.getLoginUser().then(function (loginUser) {
                        if (loginUser.id === user.id) {
                            angular.extend(loginUser, userInfo);
                        }
                    });
                });
            });
        };

        vm.deleteUser = (user) => {
            var id = user.id;
            $domePublic.openDelete().then(() => {
                $domeUser.userService.deleteUser(id).then(() => {
                    for (var i = 0; i < vm.userList.length; i++) {
                        if (vm.userList[i].id === id) {
                            vm.userList.splice(i, 1);
                            break;
                        }
                    }
                }, () => {
                    $domePublic.openWarning('删除失败！');
                });
            });
        };

        vm.getLdap = () => {
            if (!vm.ldapInfo.id) {
                ldapOptions.getData().then(function (info) {
                    var reg = /(.*):([^:]+)/g;
                    vm.ldapInfo = info;
                    vm.ldapInfo.url = vm.ldapInfo.server.replace(reg, '$1');
                    vm.ldapInfo.port = vm.ldapInfo.server.replace(reg, '$2');
                });
            }
        };
        vm.getGitInfo = () => {
            if (!vm.gitInfo.id) {
                gitOptions.getData().then(function (gitInfos) {
                    vm.gitInfo = gitInfos[0];
                });
            }
        };
        vm.getRegistryInfo = () => {
            if (!vm.registryInfo.id) {
                registryOptions.getData().then(function (info) {
                    vm.registryInfo = info;
                });
            }
        };
        vm.getServerInfo = () => {
            if (!vm.serverInfo.id) {
                serverOptions.getData().then(function (info) {
                    vm.serverInfo = info;
                });
            }
        };
        vm.getMonitorInfo = () => {
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
        vm.getWebSsh = () => {
            if (!vm.sshInfo.id) {
                sshOptions.getData().then(function (info) {
                    vm.sshInfo = info;
                });
            }
        };
        // @param namespace: 可不填，有值时默认为该namespace
        vm.toggleCluster = (cluster, namespace) => {
            vm.clusterInfo.clusterId = cluster.id;
            vm.clusterInfo.clusterName = cluster.name;
            vm.clusterInfo.host = cluster.api;
            vm.key.nodeKey = '';
            vm.clusterLoadingIns.startLoading('namespace');
            vm.clusterLoadingIns.startLoading('nodeList');
            nodeService.getNamespace(cluster.id, cluster.name).then((res) => {
                vm.namespaceList = res.data.result || [];
                if (namespace) {
                    vm.clusterInfo.namespace = namespace;
                } else {
                    for (let namespace of vm.namespaceList) {
                        if (namespace.name == 'default') {
                            vm.clusterInfo.namespace = 'default';
                            return;
                        }
                    }
                    vm.clusterInfo.namespace = vm.namespaceList[0] && vm.namespaceList[0].name;
                }
            }, () => {
                vm.namespaceList = [];
                vm.clusterInfo.namespace = null;
            }).finally(() => {
                vm.clusterLoadingIns.finishLoading('namespace');
            });
            nodeService.getNodeList(cluster.id).then((res) => {
                let nodeList = res.data.result || [];
                for (let node of nodeList) {
                    if (node.capacity) {
                        node.capacity.memory = (node.capacity.memory / 1024 / 1024).toFixed(2);
                    }
                    if (!node.labels) {
                        node.labels = {};
                    }
                    node.isUsedByBuild = node.labels.BUILDENV ? true : false;
                }
                vm.nodeList = nodeList;
            }).finally(() => {
                vm.clusterLoadingIns.finishLoading('nodeList');
            });
        };
        const toggleClusterInfo = (clusterInfo) => {
            vm.clusterInfo = clusterInfo || {};
            for (let cluster of vm.clusterList) {
                if (cluster.api === vm.clusterInfo.host) {
                    vm.toggleCluster(cluster, vm.clusterInfo.namespace);
                    return;
                }
            }
        };
        vm.initClusterInfo = () => {
            if (!vm.clusterInfo.id) {
                vm.clusterLoadingIns.startLoading('cluster');
                $q.all([getClusterList(), clusterOptions.getData()]).then(function (res) {
                    toggleClusterInfo(res[1]);
                }).finally(() => {
                    vm.clusterLoadingIns.finishLoading('cluster');
                });
            }
        };
        vm.addUser = (form) => {
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
        vm.saveLdap = () => {
            var data = angular.copy(vm.ldapInfo);
            data.server = data.url + ':' + data.port;
            delete data.url;
            delete data.port;
            ldapOptions.modifyData(data).then(function () {
                vm.getLdap();
            });
        };
        vm.saveGit = () => {
            if (!vm.gitInfo.id) {
                vm.gitInfo.type = 'GITLAB';
            }
            gitOptions.modifyData(vm.gitInfo).then(function (info) {
                if (info) {
                    vm.gitInfo = info;
                }
            });
        };
        vm.saveRegistry = () => {
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
        vm.saveServer = () => {
            serverOptions.modifyData(vm.serverInfo).then(function (info) {
                if (info) {
                    vm.serverInfo = info;
                }
            });
        };
        vm.saveMonitor = () => {
            monitorOptions.modifyData(vm.monitorIns.formartMonitor()).then(function (info) {
                if (info) {
                    vm.monitorIns.init(info);
                    vm.monitorConfig = vm.monitorIns.config;
                }
            });
        };
        vm.saveSsh = () => {
            sshOptions.modifyData(vm.sshInfo).then((info) => {
                if (info) {
                    vm.sshInfo = info;
                }
            });
        };
        vm.saveCluster = () => {
            let clusterInfo, nodeList = vm.nodeList,
                addNodeLabelsInfo = [],
                deleteNodeLabelsInfo = [];

            for (let node of nodeList) {
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
            if (addNodeLabelsInfo.length === 0) {
                $domePublic.openWarning('请至少设置一台用于构建的主机！');
                return;
            }

            vm.clusterLoadingIns.startLoading('submitCluster');
            clusterOptions.modifyData(vm.clusterInfo).then(function (info) {
                clusterInfo = info;
            }).then(() => {
                return nodeService.addLabel(vm.clusterInfo.clusterId, addNodeLabelsInfo).then(() => {
                    return true;
                }, (res) => {
                    $domePublic.openWarning({
                        title: '错误！',
                        msg: res.data.resultMsg
                    });
                    return $q.reject();
                });
            }).then(() => {
                if (deleteNodeLabelsInfo.length !== 0) {
                    return nodeService.deleteLabel(vm.clusterInfo.clusterId, deleteNodeLabelsInfo).catch((res) => {
                        $domePublic.openWarning({
                            title: '错误！',
                            msg: res.data.resultMsg
                        });
                        return $q.reject();
                    });
                }
            }).finally(() => {
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