domeApp.controller('AlarmTemplateDetailCtr', ['$scope', '$domeAlarm', '$state', '$domePublic', '$domeUser', function($scope, $domeAlarm, $state, $domePublic, $domeUser) {
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
	var initConfig = function() {
		$scope.alarmTemplateIns.initHostGroupList();
		$scope.alarmTemplateIns.initGroupList();
		// if($scope.alarmTemplateIns.config.)
		$scope.alarmTemplateIns.initDeployAndClusterList();
		$scope.config = $scope.alarmTemplateIns.config;
		config = angular.copy($scope.config);
	};
	alarmService.getData(tplId).then(function(res) {
		$scope.alarmTemplateIns = $domeAlarm.getInstance('AlarmTemplate', res.data.result);
		initConfig();
		$scope.$emit('pageTitle', {
			title: config.templateName,
			descrition: '',
			mod: 'monitor'
		});
		$scope.varibles.isLoading = false;
	}, function() {
		$domePublic.openWarning('请求错误！');
		$scope.varibles.isLoading = false;
	});
	// 获取当前用户的报警权限
	$domeUser.getLoginUser().then(function(user) {
		if (user.username == 'admin') {
			$scope.permission.id = user.id;
			// 自定义角色标识admin
			$scope.permission.role = 'ADMIN';
		} else {
			$domeUser.alarmGroupService.getData().then(function(res) {
				var alarmUsers = res.data.result;
				if (alarmUsers && alarmUsers.length !== 0) {
					for (var i = 0; i < alarmUsers.length; i++) {
						if (alarmUsers[i].userId == user.id) {
							$scope.permission.id = alarmUsers[i].userId;
							$scope.permission.role = alarmUsers[i].role;
							break;
						}
					}
					if (!$scope.permission.id) {
						$state.go('monitor');
					}
				}
			});
		}
	});
	$scope.saveModify = function() {
		$scope.varibles.isLoading = true;
		$scope.alarmTemplateIns.modify().then(function() {
			$domePublic.openPrompt('修改成功');
			alarmService.getData(tplId).then(function(res) {
				$scope.alarmTemplateIns.init(res.data.result);
				initConfig();
				$scope.$emit('pageTitle', {
					title: config.templateName
				});
			});
			$scope.isEdit = false;
		}, function(res) {
			$domePublic.openWarning({
				title: '修改失败！',
				msg: 'Message:' + res.data.resultMsg
			});
		}).finally(function() {
			$scope.varibles.isLoading = false;
		});
	};
	$scope.toggleEdit = function() {
		$scope.isEdit = !$scope.isEdit;
		if (!$scope.isEdit) {
			$scope.config = $scope.alarmTemplateIns.config = angular.copy(config);
		}
	};
}]);