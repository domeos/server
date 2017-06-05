/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;

	domeApp.controller('DeployManageCtr', ['$scope', '$domeDeploy', '$domeCluster', '$timeout', '$state', '$modal', '$util', 'dialog', function ($scope, $domeDeploy, $domeCluster, $timeout, $state, $modal, $util, dialog) {
		$scope.$emit('pageTitle', {
			title: '部署',
			descrition: '在这里您可以把项目镜像部署到运行环境中。此外，您还可以对现有部署进行监控和管理。',
			mod: 'deployManage'
		});
		$scope.showSelect = true;
		var stateInfo = $state.$current.name;
		if (stateInfo.indexOf('deployAllManage') === -1) {
			$scope.showSelect = false;
		}else{
			$scope.showSelect = true;
		}
		$scope.isLoading = true;
		$scope.tabActive = [{
			active: false
		}, {
			active: false
		}];
		var stateInfo = $state.$current.name;
		if (stateInfo.indexOf('user') !== -1) {
			$scope.tabActive[1].active = true;
		}else {
			$scope.tabActive[0].active = true;
		}
		$scope.resourceType = 'DEPLOY_COLLECTION'; //add by gb
		$scope.collectionName = $state.params.name;
		$scope.resourceId = $state.params.id;
		$scope.collectionId = $state.params.id;
		$scope.deloyList = [];

		var cluserList = [],
			timeout;
		var clusterService = $domeCluster.getInstance('ClusterService');
		$scope.selectOption = {};
		$scope.selectOption.status = {
			ALL: true,
			DEPLOYING: false,
			RUNNING: false,
			// AB_TEST: false,
			STOP: false,
			ERROR: false,
			STOPPING: false,
			BACKROLLING: false,
			UPDATING: false,
			UPSCALING: false,
			DOWNSCALING: false,
			ABORTING: false,
			BACKROLL_ABORTED: false,
			UPDATE_ABORTED: false
		};
		$scope.selectOption.env = {
			ALL: true,
			PROD: false,
			TEST: false
		};
		$scope.selectOption.namespace = {
			ALL: true
		};
		$scope.selectOption.cluster = {
			ALL: true
		};
		$scope.selectOption.deployTypeShow = {
			ALL: true,
			RC: false,
			Deployment: false,
			DaemonSet: false
		};
		// 登录用户角色
		$scope.userRole = null;
		$scope.setRole = function (role) { $scope.userRole = role; };
		$scope.mayCreate = function () { return $scope.userRole === 'MASTER' || $scope.userRole === 'DEVELOPER'; };
		$scope.mayMigrate = function () { return $scope.userRole === 'MASTER'; };
		$scope.exitToList = function () {
		  $state.go('deployCollectionManage');
		};
        $scope.orderBy = {
            item: '',
            isReverse: false
        };
        $scope.toggleOrderBy = function (item) {
            if ($scope.orderBy.item === item) {
                $scope.orderBy.isReverse = !$scope.orderBy.isReverse;
            } else {
                $scope.orderBy.item = item;
                $scope.orderBy.isReverse = false;
            }
        };

		$scope.deloyList = [];
		function formatDeployData(deploymentList) {
      $scope.deloyList = deploymentList;
      var thisDeploy, cpuPercent, memPercent;
      for (var i = 0, l = $scope.deloyList.length; i < l; i++) {
        thisDeploy = $scope.deloyList[i];
        cpuPercent = Math.max(0, thisDeploy.cpuUsed / thisDeploy.cpuTotal);
        if (!isFinite(cpuPercent)) cpuPercent = 0;
        memPercent = Math.max(0, thisDeploy.memoryUsed / thisDeploy.memoryTotal);
        if (!isFinite(memPercent)) memPercent = 0;
        thisDeploy.memoryUsed = $util.formatMBytesData(thisDeploy.memoryUsed);
        thisDeploy.memoryTotal = $util.formatMBytesData(thisDeploy.memoryTotal);
        if (thisDeploy.serviceDnsName) {
          thisDeploy.dnsName = thisDeploy.serviceDnsName.split(' ').filter(element => element !== '');
        } else {
          thisDeploy.dnsName = '无';
        }
        if (cpuPercent > memPercent) {
          thisDeploy.compare = 'cpu';
          thisDeploy.comparePercentSort = cpuPercent;
        } else {
          thisDeploy.compare = 'memory';
          thisDeploy.comparePercentSort = memPercent;
        }
        thisDeploy.comparePercent = (thisDeploy.comparePercentSort * 100).toFixed(2);

      }
    }
		var init = function () {
			var collectionId = $state.params.id;
			if ($state.current.name.indexOf('deployManage') !== -1) {
				$domeDeploy.deployService.getListByCollectionId(collectionId).then(function (res) {
            formatDeployData(res.data.result || []);
				}).finally(function () {
					$scope.isLoading = false;
					if (timeout) {
						$timeout.cancel(timeout);
					}
					timeout = $timeout(init, 4000);
				});
			}else if ($state.current.name === 'deployAllManage') {
				$domeDeploy.deployService.getList().then(function (res) {
          formatDeployData(res.data.result || []);
				}).finally(function () {
					$scope.isLoading = false;
					if (timeout) {
						$timeout.cancel(timeout);
					}
					timeout = $timeout(init, 4000);
				});
			}
		};
		init();

		var getNamespace = function (clusterId) {
			clusterService.getNamespace(clusterId).then(function (res) {
				var namespaceList = res.data.result || [];
				for (var j = 0, l = namespaceList.length; j < l; j++) {
					if (!$scope.selectOption.namespace[namespaceList[j].name]) {
						$scope.selectOption.namespace[namespaceList[j].name] = false;
					}
				}
			});
		};
		var getNamespaceList = function () {
			var i, l;
			$scope.selectOption.namespace = {
				ALL: true
			};
			if ($scope.selectOption.cluster.ALL) {
				for (i = 0, l = cluserList.length; i < l; i++) {
					getNamespace(cluserList[i].id);
				}
			} else {
				angular.forEach($scope.selectOption.cluster, function (value, key) {
					if (key !== 'ALL' && value) {
						for (i = 0, l = cluserList.length; i < l; i++) {
							if (cluserList[i].name === key) {
								getNamespace(cluserList[i].id);
								break;
							}
						}
					}
				});
			}
		};
		clusterService.getData().then(function (res) {
			cluserList = res.data.result || [];
			getNamespaceList('all');
			for (var i = 0, l = cluserList.length; i < l; i++) {
				$scope.selectOption.cluster[cluserList[i].name] = false;
			}
		});
		$scope.toggleShowSelect = function () {
			$scope.showSelect = !$scope.showSelect;
		};
		$scope.toggleAll = function (type) {
			angular.forEach($scope.selectOption[type], function (value, key) {
				$scope.selectOption[type][key] = false;
			});
			$scope.selectOption[type].ALL = true;
			if (type === 'cluster') {
				getNamespaceList('all');
			}
		};
		$scope.toggleSelect = function (type, item) {
			var hasNone = true;
			$scope.selectOption[type][item] = !$scope.selectOption[type][item];
			if (!$scope.selectOption[type][item]) {
				angular.forEach($scope.selectOption[type], function (value, key) {
					if (key !== 'ALL' && $scope.selectOption[type][key] && hasNone) {
						hasNone = false;
					}
				});
				if (hasNone) {
					$scope.toggleAll(type);
				}
			} else if ($scope.selectOption[type].ALL) {
				$scope.selectOption[type].ALL = false;
			}
			if (type === 'cluster') {
				getNamespaceList(item);
			}
		};
		$scope.$on('$destroy', function (argument) {
			if (timeout) {
				$timeout.cancel(timeout);
			}
		});
		$scope.openMigrateDeployModal = function (deployId,deployName) {
			$modal.open({
				animation: true,
				templateUrl: 'migrateDeployModal.html',
				controller: 'migrateDeployModalCtr',
				size: 'md',
				resolve: {
					deployId: function() {
						return deployId;
					},
					deployName: function () {
						return deployName;
					},
					collectionName: function () {
						return $scope.collectionName;
					}
				}
			});
		};
    $scope.onSuccess = function(e, info) {
      dialog.tip('复制成功', info);
      e.clearSelection();
    };
    $scope.onError = function(e) {
      dialog.alert('复制失败','');
    }
	}]).controller('migrateDeployModalCtr', ['$scope', '$state','dialog', '$domeDeployCollection', 'deployId', 'deployName','collectionName', '$modalInstance', '$util', function ($scope, $state, dialog, $domeDeployCollection, deployId, deployName, collectionName, $modalInstance, $util) {
		$scope.migrateDeployName = deployName;
		$scope.migrateCollectionName = collectionName;
		$scope.migrateCollectionId = '';
		$scope.deployCollectionList = [];
		$scope.isLoading = true;
		$domeDeployCollection.deployCollectionService.getDeployCollection().then(function (res) {
			var collectionList = res.data.result || [];
			for (var i=0; i < collectionList.length; i++) {
				if (collectionList[i].role === "MASTER") {
					$scope.deployCollectionList.push(collectionList[i]);
				}
			}

		}).finally(function () {
			$scope.isLoading = false;
		});
		$scope.toggleCollectionName = function ($index,name,id) {
			$scope.migrateCollectionName = name;
			$scope.migrateCollectionId = id;
		};
		$scope.save = function() {
			$domeDeployCollection.deployCollectionService.migrateDeploy(deployId,$scope.migrateCollectionId).then(function(){
				$state.go('deployManage',{
					id: $scope.migrateCollectionId,
					name: $scope.migrateCollectionName
				});
			}, function(error) {
				dialog.error('警告', '迁移失败:' + error.data.resultMsg);
				$modalInstance.dismiss('cancel');
			}).finally(function() {
				$modalInstance.dismiss('cancel');
			});
		};
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	}]);
})(angular.module('domeApp'));