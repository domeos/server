/*
 * @author ChandraLee
 */

((domeApp, undefined) => {
    'use strict';
    if (typeof domeApp === 'undefined') return;


    domeApp// .controller('GlobalSettingCtr', GlobalSettingCtr)
        .controller('GitLabInfoModalCtr',GitLabInfoModalCtr);

    domeApp.controller('GlobalSettingCtr', ['api', '$state', function (api, $state) {
      api.user.whoami().then(({ isAdmin }) => {
        if (!isAdmin) {
          $state.go('overview');
        }
      });
    }]);

    function GitLabInfoModalCtr($scope,$modalInstance,$domeGlobal,gitInfoDraft){
        $scope.needValidGit = false;
        $scope.gitInfo = angular.copy(gitInfoDraft);
        $scope.submit = function() {
            $domeGlobal.getGloabalInstance('git').modifyData($scope.gitInfo).then(() => {
                $modalInstance.close('ok');
            }).finally(()=> {
                $scope.needValidGit = false;
            });
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
    GitLabInfoModalCtr.$inject = ['$scope','$modalInstance','$domeGlobal','gitInfoDraft']


    domeApp.controller('GlobalSettingUserCtr', [
      '$scope', '$domeGlobal', '$state', '$domeUser', '$domeCluster', '$modal', '$q', 'api', 'dialog', 'userDialog',
    function ($scope, $domeGlobal, $state, $domeUser, $domeCluster, $modal, $q, api, dialog, userDialog) {
      let vm = $scope.vm = {};

      vm.newUser = {};
      vm.needValidUser = {
        valid: false
      };

      vm.key = {
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
      var getUserList = function () {
        $domeUser.userService.getUserList().then(function (res) {
          vm.userList = res.data.result || [];
        });
      };
      getUserList();
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
        userDialog.editPassword(user.username).then(getUserList);
      };

      vm.modifyUserInfo = (user) => {
        userDialog.editInfo({
          name: user.username,
          id: user.id,
          email: user.email,
          phone: user.phone,
        }).then(getUserList);
      };

      vm.deleteUser = (user) => {
        var id = user.id;
        dialog.danger('删除用户', '确认要删除用户吗？').then(() => {
          $domeUser.userService.deleteUser(id).catch(e => {
            dialog.error('删除用户', '删除失败！' + e.data.resultMsg);
          }).then(() => {
            getUserList();
          });
        });
      };

      vm.addUser = (form) => {
        var newUser = angular.copy(vm.newUser);
        delete newUser.rePassword;

        $domeUser.userService.createUser(newUser).then(function (res) {
          dialog.alert('创建用户', '创建成功！');
          var user = angular.copy(newUser);
          getUserList();
        }, function (e) {
          dialog.error('创建用户', '创建失败！' + e.data.resultMsg);
        });
      };

    }]);

    domeApp.controller('GlobalSettingLoginCtr', [
      '$scope', 'api', 'dialog',
    function ($scope, api, dialog) {
      $scope.isLoading = true;
      $scope.loginConfig = {};
      api.globalSetting.login.getConfig()
        .then(config => $scope.loginConfig = config)
        .catch(error => dialog.error('获取设置信息失败', error))
        .then(() => $scope.isLoading = false);
      $scope.saveLoginConfig = function () {
        if ($scope.isLoading) return;
        $scope.isLoading = true;
        api.globalSetting.login.putConfig($scope.loginConfig)
          .then(() => dialog.tip('配置成功', '登录设置配置成功'))
          .catch(error => dialog.error('配置失败', error))
          .then(() => $scope.isLoading = false);
      };
    }]);

    domeApp.controller('GlobalSettingCodeSourceCtr', [
      '$scope', '$domeGlobal', '$state', '$domeUser', '$domeCluster', '$modal', '$q', 'api', 'dialog',
    function ($scope, $domeGlobal, $state, $domeUser, $domeCluster, $modal, $q, api, dialog) {
      let vm = $scope.vm = {};

      const gitOptions = $domeGlobal.getGloabalInstance('git');
      vm.gitInfo = {};

      vm.getGitInfo = () => {
        gitOptions.getData().then(function (gitInfos) {
          vm.gitInfos = gitInfos;
        });
      };
      vm.operateGitInfo = (gitInfo) => {
        let gitInfoDraft = {};
        if (!gitInfo) {
          gitInfoDraft = {
            type: 'GITLAB',
            description: '', // description is name
            url: ''
          };
        } else {
          gitInfoDraft = gitInfo;
        }
        let gitInfoModal = $modal.open({
          animation: true,
          templateUrl: 'gitLabInfoModal.html',
          controller: 'GitLabInfoModalCtr',
          size: 'md',
          resolve: {
            gitInfoDraft: function () {
              return gitInfoDraft;
            }
          }
        });
        gitInfoModal.result.then((result) => {
          console.log('test: ', result);
          if (result === 'ok') {
            vm.getGitInfo();
          }
        });

        vm.getGitInfo();
      };

      vm.deleteGitInfo  =  (gitInfo)  =>  {
                    let warnTxt  =  '确认要删除吗？';
        api.globleConfig.hasGitProject(gitInfo.id).then(function (res) {
          res && (warnTxt  =  `<p class="warn-container">当前共有<em class="font-big">${res}</em>个工程在使用该仓库中的代码，删除后将无法对这些工程进行更新维护，是否继续删除?</p>`);
          dialog.danger('确认删除', warnTxt).then(button => { if (button !== dialog.button.BUTTON_OK) throw '' }).then(function () {
                                gitOptions.deleteData(gitInfo.id).then(function (res)  {
                                      vm.getGitInfo();
                                }, function (resError) {
                                      dialog.error('删除失败!', resError.data.resultMsg);
                                });
                          })
        })
              };
      vm.saveGit = (gitInfo) => {
        if (!gitInfo.id) {
          gitInfo.type = 'GITLAB';
        }
        gitOptions.modifyData(gitInfo).then(function (info) {
          if (info) {
            vm.gitInfos.unshift(info);
          }
        });
      };

      vm.getGitInfo();
    }]);

    domeApp.controller('GlobalSettingRegisteryCtr', [
      '$scope', '$domeGlobal', '$state', '$domeUser', '$domeCluster', '$modal', '$q', 'api', 'dialog',
    function ($scope, $domeGlobal, $state, $domeUser, $domeCluster, $modal, $q, api, dialog) {
      let vm = $scope.vm = {};

      const registryOptions = $domeGlobal.getGloabalInstance('registry');
      vm.registryInfo = {};


      vm.getRegistryInfo = () => {
        if (!vm.registryInfo.id) {
          registryOptions.getData().then(function (info) {
            vm.registryInfo = info;
          });
        }
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
      vm.getRegistryInfo();

    }]);

    domeApp.controller('GlobalSettingServerCtr', [
      '$scope', '$domeGlobal', '$state', '$domeUser', '$domeCluster', '$modal', '$q', 'api', 'dialog',
    function ($scope, $domeGlobal, $state, $domeUser, $domeCluster, $modal, $q, api, dialog) {
      let vm = $scope.vm = {};

      const serverOptions = $domeGlobal.getGloabalInstance('server');
      vm.serverInfo = {};
      vm.getServerInfo = () => {
        if (!vm.serverInfo.id) {
          serverOptions.getData().then(function (info) {
            vm.serverInfo = info;
          });
        }
      };
      vm.saveServer = () => {
        serverOptions.modifyData(vm.serverInfo).then(function (info) {
          if (info) {
            vm.serverInfo = info;
          }
        });
      };
      vm.getServerInfo();

    }]);

    domeApp.controller('GlobalSettingMonitorCtr', [
      '$scope', '$domeGlobal', '$state', '$domeUser', '$domeCluster', '$modal', '$q', 'api', 'dialog',
    function ($scope, $domeGlobal, $state, $domeUser, $domeCluster, $modal, $q, api, dialog) {
      let vm = $scope.vm = {};

      const monitorOptions = $domeGlobal.getGloabalInstance('monitor');

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
      vm.saveMonitor = () => {
        monitorOptions.modifyData(vm.monitorIns.formartMonitor()).then(function (info) {
          if (info) {
            vm.monitorIns.init(info);
            vm.monitorConfig = vm.monitorIns.config;
          }
        });
      };
      vm.getMonitorInfo();

    }]);

    domeApp.controller('GlobalSettingWebSSHCtr', [
      '$scope', '$domeGlobal', '$state', '$domeUser', '$domeCluster', '$modal', '$q', 'api', 'dialog',
    function ($scope, $domeGlobal, $state, $domeUser, $domeCluster, $modal, $q, api, dialog) {
      let vm = $scope.vm = {};

      const sshOptions = $domeGlobal.getGloabalInstance('ssh');
      vm.sshInfo = {};

      vm.getWebSsh = () => {
        if (!vm.sshInfo.id) {
          sshOptions.getData().then(function (info) {
            vm.sshInfo = info;
          });
        }
      };
      vm.saveSsh = () => {
        sshOptions.modifyData(vm.sshInfo).then((info) => {
          if (info) {
            vm.sshInfo = info;
          }
        });
      };
      vm.getWebSsh();

    }]);

    domeApp.controller('GlobalSettingBuildCtr', [
      '$scope', '$domeGlobal', '$state', '$domeUser', '$domeCluster', '$domePublic', '$modal', '$q', 'api', 'dialog',
    function ($scope, $domeGlobal, $state, $domeUser, $domeCluster, $domePublic, $modal, $q, api, dialog) {
      let vm = $scope.vm = {};

      vm.key = {
        nodeKey: ''
      };

      const clusterOptions = $domeGlobal.getGloabalInstance('cluster');
      const nodeService = $domeCluster.getInstance('NodeService');

      vm.clusterInfo = {};
      vm.clusterLoadingIns = $domePublic.getLoadingInstance();

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
      vm.saveCluster = () => {
        let clusterInfo, nodeList = vm.nodeList;

        vm.clusterLoadingIns.startLoading('submitCluster');
        clusterOptions.modifyData(vm.clusterInfo).then(function (info) {
          clusterInfo = info;
        }, function (resError) {
          dialog.danger('修改失败', '修改失败：' + resError.data.resultMsg);
        }).finally(() => {
          vm.clusterList.forEach(x => {
            x.buildConfig = x.id === vm.clusterInfo.clusterId;
          });
          toggleClusterInfo(clusterInfo);
          vm.clusterLoadingIns.finishLoading('submitCluster');
        });
      };
      vm.toggleNodeLabel = (node) => {
        node.isUsedByBuild = !node.isUsedByBuild;
        let isOnly = false;
        if (!node.isUsedByBuild) {
          isOnly = true;
          for (let node of vm.nodeList) {
            if (node.isUsedByBuild) {
              isOnly = false;
              break;
            }
          }
        }
        if (isOnly) {
          dialog.danger('警告', '请保证集群内至少有一台用于构建的主机！');
          node.isUsedByBuild = !node.isUsedByBuild;
          return;
        }
        let labelsInfo = [{
          node: node.name,
          labels: {
            'BUILDENV': 'HOSTENVTYPE'
          }
        }];
        if (node.isUsedByBuild) {
          nodeService.addLabel(vm.clusterInfo.clusterId, labelsInfo).catch((res) => {
            node.isUsedByBuild = !node.isUsedByBuild;
            dialog.danger('修改失败', 'Message:' + res.data.resultMsg);
          });
        } else {
          nodeService.deleteLabel(vm.clusterInfo.clusterId, labelsInfo).catch((res) => {
            node.isUsedByBuild = !node.isUsedByBuild;
            dialog.danger('修改失败！', 'Message:' + res.data.resultMsg);
          });
        }
      };
      vm.initClusterInfo();

    }]);


})(angular.module('domeApp'));
