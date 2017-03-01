/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;

    domeApp.controller('AlarmCtr', AlarmCtr)
        .controller('TabAlarmTemplatesCtr', TabAlarmTemplatesCtr)
        .controller('TabAlarmCurrentAlarmsCtr', TabAlarmCurrentAlarmsCtr)
        .controller('TabHostGroupsCtr', TabHostGroupsCtr)
        .controller('TabUserGroupCtr', TabUserGroupCtr)
        .controller('TabGroupCtr', TabGroupCtr)
        .controller('RenameHostGroupModalCtr', RenameHostGroupModalCtr);

    function AlarmCtr($scope, $http, $domeAlarm, $domeUser, $state, $domePublic) {
        $scope.$emit('pageTitle', {
            title: '报警',
            descrition: '在这里您可以管理主机组和监控模板，并查看未恢复报警',
            mod: 'monitor'
        });
        var vm = this;
        vm.tabName = 'templates';
        $scope.$on('tabName', function (event, msg) {
            vm.tabName = msg;
        });
        vm.permission = {
            id: null,
            username: null,
            role: null
        };
        // 获取当前用户的报警权限
        function getPermission() {
            $domeUser.getLoginUser().then(function (user) {
            $http.get('/api/user/resource/ALARM/1000').then(function (res) {
              var role = res.data.result;
              vm.permission.id = user.id;
              vm.permission.role = role;
            });
          });
        }
        getPermission();
        $scope.$on('memberPermisson', function (event, hasPermisson) {
            if (!hasPermisson) {
                getPermission();
            }
        });
    }

    function TabAlarmTemplatesCtr($scope, $domeAlarm, $domePublic) {
        $scope.$emit('tabName', 'templates');
        var alarmService = $domeAlarm.getInstance('AlarmService'),
            vmTemplate = this;
        vmTemplate.keywords = '';
        alarmService.getData().then(function (res) {
            var templatesList = res.data.result || [];
            for (var i = 0, l = templatesList.length; i < l; i++) {
                var thisTpl = templatesList[i];
                if (thisTpl.templateType == 'host') {
                    thisTpl.templateTypeName = '主机';
                } else if (thisTpl.templateType == 'deploy') {
                    thisTpl.templateTypeName = '容器';
                }
            }
            vmTemplate.templatesList = templatesList;
        }, function (res) {
            $domePublic.openWarning( {
                title:'获取报警模板失败！',
                msg: res.data.resultMsg
            });
        });
        vmTemplate.deleteTpl = function (id) {
            $domePublic.openDelete().then(function () {
                alarmService.deleteData(id).then(function () {
                    for (var i = 0; i < vmTemplate.templatesList.length; i++) {
                        if (vmTemplate.templatesList[i].id === id) {
                            vmTemplate.templatesList.splice(i, 1);
                            return;
                        }
                    }
                }, function (res) {
                    $domePublic.openWarning({
                        title: '删除失败！',
                        msg: 'Message:' + res.data.resultMsg
                    });
                });
            });
        };
    }

    function TabAlarmCurrentAlarmsCtr($scope, $domeAlarm, $domePublic, $util, $sce) {
        $scope.$emit('tabName', 'currentAlarms');
        var vmAlarm = this;
        vmAlarm.keywords = '';
        vmAlarm.loading = true;
        $domeAlarm.alarmEventService.getData().then(function (res) {
            var alarmsList = res.data.result || [];
            var metricKeyMaps = $domeAlarm.keyMaps.metric;
            var getAlarmCounterInfo = function (metric, tag) {
                var mapInfo = metricKeyMaps[metric];
                var metricName = mapInfo.text;
                if (tag) {
                    if (mapInfo.tagName == '分区' && tag.indexOf('mount') === 0) {
                        metricName += '  分区：' + tag.substring(6);
                    } else if (mapInfo.tagName == '设备' && tag.indexOf('device') === 0) {
                        metricName += '  设备：' + tag.substring(7);
                    } else if (mapInfo.tagName == '网卡' && tag.indexOf('iface') === 0) {
                        metricName += '  网卡：' + tag.substring(6);
                    }
                }
                return {
                    metricName: metricName,
                    unit: mapInfo.unit
                };
            };
            var isNotEmptyStrOrNum = function (data) {
                if (data !== null && data !== undefined && data !== '') {
                    return true;
                }
                return false;
            };
            for (var i = 0, l = alarmsList.length; i < l; i++) {
                var thisAlarm = alarmsList[i];
                if (thisAlarm.templateType == 'host') {
                    thisAlarm.templateTypeName = '主机';
                    thisAlarm.alarmObject = thisAlarm.hostInfo.hostname;
                } else if (thisAlarm.templateType == 'deploy') {
                    thisAlarm.templateTypeName = '部署';
                    thisAlarm.alarmObject = thisAlarm.deploymentAlarmInfo.containerId.substring(0, 12);
                }
                var counterInfo = getAlarmCounterInfo(thisAlarm.metric, thisAlarm.tag);
                if (isNotEmptyStrOrNum(thisAlarm.leftValue) && isNotEmptyStrOrNum(thisAlarm.operator) && isNotEmptyStrOrNum(thisAlarm.rightValue)) {
                    thisAlarm.alarmNum = thisAlarm.leftValue + thisAlarm.operator + thisAlarm.rightValue;
                    if (counterInfo.unit !== '') {
                        thisAlarm.alarmNum += '(' + counterInfo.unit + ')';
                    }
                }
                if (isNotEmptyStrOrNum(thisAlarm.currentStep) && isNotEmptyStrOrNum(thisAlarm.maxStep)) {
                    thisAlarm.alarmTimes = thisAlarm.currentStep + '/' + thisAlarm.maxStep;
                }
                thisAlarm.metricName = counterInfo.metricName;
            }
            vmAlarm.alarmsList = alarmsList;
        }, function (res) {
            $domePublic.openWarning( {
                title:'获取未恢复报警失败！',
                msg: res.data.resultMsg
            });
        }).finally(function () {
            vmAlarm.loading = false;
        });
        vmAlarm.ignoreAlarm = function (id) {
            $domePublic.openDelete().then(function () {
                $domeAlarm.alarmEventService.ignore(id + '').then(function () {
                    for (var i = 0; i < vmAlarm.alarmsList.length; i++) {
                        if (vmAlarm.alarmsList[i].id === id) {
                            vmAlarm.alarmsList.splice(i, 1);
                            return;
                        }
                    }
                }, function (res) {
                    $domePublic.openWarning({
                        title: '删除失败！',
                        msg: 'Message:' + res.data.resultMsg
                    });
                });
            });
        };
        vmAlarm.changePopover = function (tpl) {
            var popoverHtmlArr = [],
                hostEnv, obj;
            if (tpl.templateType == 'host' && tpl.hostInfo) {
                popoverHtmlArr.push('<div>集群: ' + tpl.hostInfo.cluster + '</div>');
                popoverHtmlArr.push('<div>ip: ' + tpl.hostInfo.ip + '</div>');
            } else if (tpl.templateType == 'deploy' && tpl.deploymentAlarmInfo) {
                obj = tpl.deploymentAlarmInfo;
                if (obj.hostEnv == 'TEST') {
                    hostEnv = '测试环境';
                } else if (obj.hostEnv == 'PROD') {
                    hostEnv = '生产环境';
                } else {
                    hostEnv = '无';
                }
                popoverHtmlArr.push('<div>集群: ' + (obj.clusterName || '无') + '</div>');
                popoverHtmlArr.push('<div>主机ip: ' + (obj.instanceHostIp || '无') + '</div>');
                popoverHtmlArr.push('<div>环境: ' + hostEnv + '</div>');
                popoverHtmlArr.push('<div>namespace: ' + (obj.namespace || '无') + '</div>');
                popoverHtmlArr.push('<div>部署: ' + obj.deploymentName || '无' + '</div>');
                popoverHtmlArr.push('<div>实例: ' + (obj.instanceName || '无') + '</div>');
                popoverHtmlArr.push('<div>启动时间: ' + $util.getPageDate(obj.instanceCreateTime) + '</div>');
            }
            $scope.currentAlarmPopoverHtml = $sce.trustAsHtml(popoverHtmlArr.join(''));

        };
    }

    function TabHostGroupsCtr($scope, $domeAlarm, $domePublic, $modal) {
        $scope.$emit('tabName', 'hostgroups');
        var hostGroupService = $domeAlarm.getInstance('HostGroupService'),
            vmHostGroup = this;
        vmHostGroup.newHostGroup = '';
        vmHostGroup.hostGroupPopover = {
            ip: '',
            name: ''
        };

        function init() {
            hostGroupService.getData().then(function (res) {
                vmHostGroup.hostGroupList = res.data.result || [];
            }, function (res) {
                $domePublic.openWarning( {
                    title:'获取主机组失败！',
                    msg: res.data.resultMsg
                });
            });
        }
        init();
        vmHostGroup.deleteHostGroup = function (id) {
            $domePublic.openDelete().then(function () {
                hostGroupService.deleteData(id).then(function () {
                    for (var i = 0; i < vmHostGroup.hostGroupList.length; i++) {
                        if (vmHostGroup.hostGroupList[i].id === id) {
                            vmHostGroup.hostGroupList.splice(i, 1);
                            return;
                        }
                    }
                }, function (res) {
                    $domePublic.openWarning({
                        title: '删除失败！',
                        msg: 'Message:' + res.data.resultMsg
                    });
                });
            });
        };
        vmHostGroup.deleteNode = function (hostGroup, nodeIndex) {
            $domePublic.openDelete().then(function () {
                hostGroupService.deleteHost(hostGroup.id, hostGroup.hostList[nodeIndex].id).then(function () {
                    hostGroup.hostList.splice(nodeIndex, 1);
                }, function (res) {
                    $domePublic.openWarning({
                        title: '删除失败！',
                        msg: 'Message:' + res.data.resultMsg
                    });
                });
            });
        };
        vmHostGroup.addHostGroup = function () {
            for (var i = 0, l = vmHostGroup.hostGroupList.length; i < l; i++) {
                if (vmHostGroup.hostGroupList[i].hostGroupName === vmHostGroup.newHostGroup) {
                    $domePublic.openWarning('主机组已存在！');
                    return;
                }
            }
            hostGroupService.setData({
                hostGroupName: vmHostGroup.newHostGroup
            }).then(function (res) {
                if (res.data.result) {
                    vmHostGroup.hostGroupList.unshift(res.data.result);
                }
                vmHostGroup.newHostGroup = '';
            }, function (res) {
                $domePublic.openWarning({
                    title: '添加失败！',
                    msg: 'Message:' + res.data.resultMsg
                });
            });
        };
        vmHostGroup.rename = function (hostGroup) {
            var modalInstance = $modal.open({
                templateUrl: 'renameHostGroupModal.html',
                controller: 'RenameHostGroupModalCtr as vmRename',
                size: 'md',
                resolve: {
                    hostGroupList: function () {
                        return vmHostGroup.hostGroupList;
                    },
                    hostGroup: function () {
                        return hostGroup;
                    },
                    renameFuc: function () {
                        return hostGroupService.updateData;
                    }
                }
            });
            modalInstance.result.then(function (res) {
                if (res === 'success') {
                    init();
                }
            });
        };
    }

    function TabGroupCtr($scope, $state) {
        $scope.$emit('tabName', 'group');
        $scope.resourceType = 'ALARM';
        $scope.resourceId = 1000;
        // $scope.$on('permission', function (event, permission) {
        //     if (permission.role !== 'MASTER') {
        //         $state.go('alarm.templates');
        //     }
        // });
    }

//用户组
    function TabUserGroupCtr($scope, $state, $domeUser, $domeAlarm, $domePublic) {
        $scope.$emit('tabName', 'usergroup');
        var userGroupService = $domeAlarm.getInstance('UserGroupService');
        $scope.resourceType = 'ALARM';
        function init() {
            userGroupService.getData().then(function (res) {
                $scope.userGroupList = res.data.result || [];
            },function (res) {
                $domePublic.openWarning( {
                    title:'获取用户组失败！',
                    msg: res.data.resultMsg
                });
            });
        }
        init();
        $scope.createUserGroup = function() {
            for (var i = 0, l = $scope.userGroupList.length; i < l; i++) {
                if ($scope.userGroupList[i].userGroupName === $scope.newUserGroupName) {
                    $domePublic.openWarning('用户组已存在！');
                    return;
                }
            }
            var UserGroupDraft = {
                id: '',
                userGroupName: $scope.newUserGroupName
            };
            userGroupService.createUserGroup(UserGroupDraft).then(function(res) {
                var result = res.data.result || [];
                init();
            },function (res) {
                $domePublic.openWarning({
                    title: '添加失败！',
                    msg: 'Message:' + res.data.resultMsg
                });
            });
        };
        $scope.deleteUserGroup = function (userGroupId) {
            $domePublic.openDelete().then(function () {
                userGroupService.deleteUserGroup(userGroupId).then(function (res) {
                    $domePublic.openPrompt('删除成功！ ');
                    init();
                },function(res) {
                    $domePublic.openWarning( {
                        title:'删除失败！',
                        msg: res.data.resultMsg
                    });
                });
            });
        };
    }

    function RenameHostGroupModalCtr(hostGroupList, hostGroup, renameFuc, $domePublic, $modalInstance) {
        var vmRename = this;
        vmRename.hostGroupList = hostGroupList;
        vmRename.hostGroup = hostGroup;
        vmRename.hostGroupName = '';
        vmRename.cancel = function () {
            $modalInstance.dismiss();
        };
        vmRename.submitName = function () {
            renameFuc({
                id: hostGroup.id,
                hostGroupName: vmRename.hostGroupName
            }).then(function () {
                $domePublic.openPrompt('修改成功！');
                $modalInstance.close('success');
            }, function (res) {
                $domePublic.openWarning({
                    title: '修改失败！',
                    msg: 'Message:' + res.data.resultMsg
                });
            });
        };
    }
    AlarmCtr.$inject = ['$scope', '$http', '$domeAlarm', '$domeUser', '$state', '$domePublic'];
    TabAlarmTemplatesCtr.$inject = ['$scope', '$domeAlarm', '$domePublic'];
    TabAlarmCurrentAlarmsCtr.$inject = ['$scope', '$domeAlarm', '$domePublic', '$util', '$sce'];
    TabHostGroupsCtr.$inject = ['$scope', '$domeAlarm', '$domePublic', '$modal'];
    TabGroupCtr.$inject = ['$scope', '$state'];
    TabUserGroupCtr.$inject = ['$scope', '$state', '$domeUser', '$domeAlarm', '$domePublic'];
    RenameHostGroupModalCtr.$inject = ['hostGroupList', 'hostGroup', 'renameFuc', '$domePublic', '$modalInstance'];
})(window.domeApp);