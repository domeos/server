/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;
    domeApp.controller('CreateAlarmTemplateCtr', ['$scope', '$domeAlarm', '$domePublic', '$state', function ($scope, $domeAlarm, $domePublic, $state) {
        $scope.$emit('pageTitle', {
            title: '新建模板',
            descrition: '在这里您可以新建报警模板。',
            mod: 'monitor'
        });
        $scope.keywords = {
            hostgroup: ''
        };
        $scope.needValid = {
            valid: false
        };
        $scope.isLoading = false;
        $scope.alarmTemplateIns = $domeAlarm.getInstance('AlarmTemplate');
        $scope.alarmTemplateIns.initHostGroupList();
        $scope.alarmTemplateIns.initGroupList();
        $scope.alarmTemplateIns.initDeployAndClusterList();
        $scope.config = $scope.alarmTemplateIns.config;
        $scope.toCreate = function () {
            $scope.isLoading = true;
            $scope.alarmTemplateIns.create().then(function () {
                $domePublic.openPrompt('新建成功');
                $state.go('alarm.templates');
            }, function (res) {
                $domePublic.openWarning({
                    title: '删除失败！',
                    msg: 'Message:' + res.data.resultMsg
                });
            }).finally(function () {
                $scope.isLoading = false;
            });
        };
    }]);
})(window.domeApp);