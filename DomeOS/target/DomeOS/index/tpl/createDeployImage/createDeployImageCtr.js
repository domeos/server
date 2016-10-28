/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('CreateDeployImageCtr', ['$scope', '$state', '$domeData', '$domeDeploy', '$domePublic', function ($scope, $state, $domeData, $domeDeploy, $domePublic) {
		'use strict';
		$scope.$emit('pageTitle', {
			title: '新建部署',
			descrition: '在这里您可以选择一个或多个项目镜像同时部署。',
			mod: 'deployManage'
		});

		$scope.loadingsIns = $domePublic.getLoadingInstance();

		var createDeployInfo = $domeData.getData('createDeployInfoCommon');
		console.log('create delpoy info: %o', createDeployInfo);
		if (!createDeployInfo) {
		  $state.go('createDeployCommon');
		  return;
		}
		$scope.deployIns = createDeployInfo;
		$domeData.delData('createDeployInfoCommon');

		$scope.config = $scope.deployIns.config;
		$scope.currentContainerDraft = {
			index: 0
		};
		$scope.needValid = {
			valid: false
		};
		$scope.deleteImage = function (index) {
			$scope.deployIns.deleteImage(index);
			if ($scope.currentContainerDraft.index > $scope.config.containerDrafts.length - 1) {
				$scope.currentContainerDraft.index = 0;
			}
		};

		$scope.toCreate = function () {

		  if ($scope.config.containerDrafts.length === 0) {
		    $domePublic.openWarning('请至少选择一个镜像！');
		    return;
		  }

			$scope.loadingsIns.startLoading('create');

			$scope.deployIns.create().then(function () {
				$domePublic.openPrompt('创建成功！');
				$state.go('deployManage');
			}, function (res) {
				if (res.type == 'namespace') {
					$domePublic.openWarning({
						title: '创建namespace失败！',
						msg: 'Message:' + res.msg
					});
				} else {
					$domePublic.openWarning({
						title: '创建失败！',
						msg: 'Message:' + res.msg
					});
				}
			}).finally(function () {
				$scope.loadingsIns.finishLoading('create');
			});
		};

		$scope.toLastStep = function () {
		  $domeData.setData('createDeployInfoCommon', $scope.deployIns);
			$state.go('createDeployCommon');
		};

	}]);
})(window.domeApp);