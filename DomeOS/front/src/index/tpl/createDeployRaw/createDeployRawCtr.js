/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('CreateDeployRawCtr', ['$scope', '$state', '$domeData', '$domeDeploy', '$domePublic', function ($scope, $state, $domeData, $domeDeploy, $domePublic) {
		'use strict';
		$scope.$emit('pageTitle', {
			title: '新建部署',
			descrition: '在这里您可以选择一个或多个项目镜像同时部署。',
			mod: 'deployManage'
		});

		$scope.loadingsIns = $domePublic.getLoadingInstance();

		if(!$state.params.collectionId || !$state.params.collectionName) {
			$state.go('deployCollectionManage');
		}
		$scope.collectionInfo = {
			collectionId: $state.params.collectionId,
			collectionName: $state.params.collectionName
		};
		// 面包屑 父级名称和url
		$scope.collectionName = $scope.collectionInfo.collectionName;
        $scope.parentState = 'deployManage({id:"' + $scope.collectionInfo.collectionId + '",name:"'+ $scope.collectionInfo.collectionName +'"})';

		var createDeployInfo = $domeData.getData('createDeployInfoCommon');
		if (!createDeployInfo) {
		  $state.go('createDeployCommon');
		  return;
		}
		$scope.deployIns = createDeployInfo;
		$domeData.delData('createDeployInfoCommon');

		$scope.config = $scope.deployIns.config;

		$scope.needValid = {
			valid: false
		};

		$scope.loadingsIns.startLoading('deploystr');
		$scope.deployIns.getDeployStr().then(function (res) {
		    var data = res.data.result;
		    $scope.deploystr = data;
		    $scope.config.versionString = data;
		    // console.log($scope.config);
		}, function () {
		    $scope.toLastStep();
		}).finally(function () {
		    $scope.loadingsIns.finishLoading('deploystr');
		});

		$scope.podStrUndoText = null;
		$scope.setPodStrToDefault = function () {
		  $scope.podStrUndoText = $scope.config.versionString.podSpecStr || '';
		  $scope.config.versionString.podSpecStr = $scope.deployIns.defaultVersionString[$scope.config.versionType];
		};
		$scope.clearPodStrUndoText = function () {
		  // console.log('clear');
		  $scope.podStrUndoText = null;
		};
		$scope.undoPodStrToDefault = function () {
		  $scope.config.versionString.podSpecStr = $scope.podStrUndoText;
		  $scope.podStrUndoText = null;
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

		$scope.toLastStep = function () {
		    var info = { 'collectionId': $scope.collectionInfo.collectionId, 'collectionName': $scope.collectionInfo.collectionName };
		    $domeData.setData('createDeployInfoCommon', $scope.deployIns);
			$state.go('createDeployCommon',info);
		};

	}]);
})(window.domeApp);