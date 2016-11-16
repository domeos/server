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

		$scope.collectionInfo = {
			collectionId: $state.params.collectionId,
			collectionName: $state.params.collectionName
		};

		$scope.deployIns = $domeData.getData('createDeployInfoCommon');
		if ($scope.deployIns) {
		  $scope.deployIns.formartHealthChecker();
		  $domeData.delData('createDeployInfoCommon');
		} else {
		  $state.go('createDeployCommon', { 'collectionId': $scope.collectionInfo.collectionId, 'collectionName': $scope.collectionInfo.collectionName });
		  return;
		}

		// 面包屑 父级名称和url
		$scope.collectionName = $scope.collectionInfo.collectionName;
		$scope.parentState = 'deployManage({id:"' + $scope.collectionInfo.collectionId + '",name:"' + $scope.collectionInfo.collectionName + '"})';

		$scope.config = $scope.deployIns.config;
		$scope.currentContainerDraft = {
			index: 0
		};
		$scope.needValid = {
			valid: false
		};

		$scope.toLastStep = function () {
			var info = { 'collectionId': $scope.collectionInfo.collectionId, 'collectionName': $scope.collectionInfo.collectionName };
		  	$domeData.setData('createDeployInfoCommon', $scope.deployIns);
			$state.go('createDeployCommon',info);
		};
		$scope.deleteImage = function (index) {
			$scope.deployIns.deleteImage(index);
			if ($scope.currentContainerDraft.index > $scope.config.containerDrafts.length - 1) {
				$scope.currentContainerDraft.index = 0;
			}
		};

		$scope.toCreate = function () {
		  $scope.loadingsIns.startLoading('create');
		  $scope.deployIns.setCollectionId($scope.collectionInfo.collectionId);
		  $scope.deployIns.create().then(function () {
		    $domePublic.openPrompt('创建成功！');
		    $state.go('deployManage', {'id':$scope.collectionInfo.collectionId,'name':$scope.collectionInfo.collectionName});
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


	}]);
})(window.domeApp);