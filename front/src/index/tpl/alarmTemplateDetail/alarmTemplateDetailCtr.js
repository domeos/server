/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;

	domeApp.controller('AlarmTemplateDetailCtr', ['$scope', '$http', '$domeAlarm', '$state', 'dialog', '$domeUser', function ($scope, $http, $domeAlarm, $state, dialog, $domeUser) {
		$scope.isEdit = false;
		$scope.needValid = {
			valid: false
		};
		var config = {};
		var tplId = $state.params.id;
		$scope.varibles = {
			isLoading: true
		};
		if (!tplId) {
			$state.go('alarm.template');
		}
		var alarmService = $domeAlarm.getInstance('AlarmService');
		$scope.permission = {};
		var initConfig = function () {
			$scope.alarmTemplateIns.initHostGroupList();
			$scope.alarmTemplateIns.initGroupList();
			// if($scope.alarmTemplateIns.config.)
			$scope.alarmTemplateIns.initDeployAndClusterList();
			$scope.config = $scope.alarmTemplateIns.config;
			config = angular.copy($scope.config);
		};
		alarmService.getData(tplId).then(function (res) {
			$scope.alarmTemplateIns = $domeAlarm.getInstance('AlarmTemplate', res.data.result);
			initConfig();
			$scope.$emit('pageTitle', {
				title: config.templateName,
				descrition: '',
				mod: 'monitor'
			});
			$scope.varibles.isLoading = false;
		}, function () {
			dialog.error('警告', '请求错误！');
			$scope.varibles.isLoading = false;
		});
		// 获取当前用户的报警权限
		$domeUser.getLoginUser().then(function (user) {
		  $http.get('/api/user/resource/ALARM/1000').then(function (res) {
			    var role = res.data.result;
			    $scope.permission.id = user.id;
			    $scope.permission.role = role;
			  });
		});
		$scope.saveModify = function () {
			$scope.varibles.isLoading = true;
			$scope.alarmTemplateIns.modify().then(function () {
				dialog.alert('提示', '修改成功');
				alarmService.getData(tplId).then(function (res) {
					$scope.alarmTemplateIns.init(res.data.result);
					initConfig();
					$scope.$emit('pageTitle', {
						title: config.templateName
					});
				});
				$scope.isEdit = false;
			}, function (res) {
				dialog.error('修改失败', res.data.resultMsg);
			}).finally(function () {
				$scope.varibles.isLoading = false;
			});
		};
		$scope.toggleEdit = function () {
			$scope.isEdit = !$scope.isEdit;
			if (!$scope.isEdit) {
				$scope.config = $scope.alarmTemplateIns.config = angular.copy(config);
			}
		};
	}]);
})(angular.module('domeApp'));