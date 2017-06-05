/**
 * Created on 2016/12/22.
 */
(function (domeApp, undefined) {
  'use strict';
  if (domeApp === 'undefined')
    return;
  domeApp.controller("StorageDetailCtr", [
    '$scope',
    '$state',
    '$domeStorage',
    '$modal',
    'dialog',
    function (
      $scope,
      $state,
      $domeStorage,
      $modal,
      dialog
    ) {
      $scope.$emit('pageTitle', {
        title: '存储详情',
        descrition: '',
        mod: 'storageManage'
      });
      if (!$state.params.id) {
        $state.go('storageManage');
      }
      let storageId = $state.params.id;
      $scope.resourceType = 'STORAGE_CLUSTER'; // 用户行为接口
      $scope.resourceId = storageId; //用户接口使用
      $scope.isEditStorage = false;
      $scope.hasVolume = false;
      // 登录用户角色
      $scope.userRole = null;
      $scope.setRole = function (role) {
        $scope.userRole = role;
        updateNoDeleteList();
      };
      $scope.mayPost = () => $scope.userRole === 'MASTER' || $scope.userRole === 'DEVELOPER';
      $scope.mayDelete = () => $scope.userRole === 'MASTER';
      $scope.exitToList = () => {
        $state.go('storageManage');
      };
      const storageBackend = $domeStorage.storageBackend;

      function initStorageIns() {
        storageBackend.getStorage(storageId).then(function (res) {
          $scope.storageInstance = res.data.result || {};
        });
      }

      initStorageIns();

      $scope.volumeInfo = {
        volumeList: [],
        filteredVolumeList: [],
        searchKeyword: '',
      };
      const updateNoDeleteList = () => {
        $scope.noDeleteList = $scope.mayDelete() ? [] : $scope.volumeInfo.filteredVolumeList;
      };
      $scope.filterVolumeList = function () {
        $scope.volumeInfo.filteredVolumeList = $scope.volumeInfo.volumeList.filter(function (volume) {
          return volume.storageVolumeDraft.name.indexOf($scope.volumeInfo.searchKeyword) !== -1;
        });
        updateNoDeleteList();
      };
      function initVolumeIns() {
        $scope.isVolumeLoading = true;
        storageBackend.getStorageVolume(storageId).then(function (res) {
          $scope.volumeInfo.volumeList = res.data.result || [];
          $scope.filterVolumeList();
        }, function (resError) {
          dialog.error('查询失败', resError.data.resultMsg);
        }).finally(function () {
          $scope.isVolumeLoading = false;
        });
      }

      initVolumeIns();
      $scope.deleteVolume = function (volume) {
        debugger
        $domeStorage.storageBackend.listRelatedDeployInfo(volume.storageVolumeDraft.id).then(function (res) {
          $scope.relatedList = res.data.result || [];
          $scope.relatedDeployList = $scope.relatedList.filter(ov => ov.loadBalancer === false);
          $scope.relatedLoadBalancerList = $scope.relatedList.filter(ov => ov.loadBalancer === true);
        }).then(function () {
          if ($scope.relatedList.length === 0) {
            dialog.danger('确认删除', '是否确认删除').then(button => { if (button !== dialog.button.BUTTON_OK) throw ''}).then(function () {
              storageBackend.deleteVolume(storageId, volume.storageVolumeDraft.id).then(function () {
                initVolumeIns();
              }, function (resError) {
                dialog.error( '删除失败！', resError.data.resultMsg);
              });
            });
          } else {
            let promptText = '';
            if ($scope.relatedDeployList.length > 0 && $scope.relatedLoadBalancerList.length === 0) {
              promptText = '部署';
            } else if ($scope.relatedDeployList.length === 0 && $scope.relatedLoadBalancerList.length > 0) {
              promptText = '负载均衡';
            } else {
              promptText = '';
            }
            dialog.alert('删除失败', `此数据卷已被${promptText}使用，请先废弃对应版本！进入数据卷可查看已关联${promptText}列表。`);
          }
        }).catch(function (error) {
          console.log("an error occured: " + error);
        }).then(() => {
          initVolumeIns();
        });
      };
      $scope.deleteStorage = function (storageId) {
        if ($scope.volumeInfo.volumeList.length > 0) {
          dialog.alert("此存储中存在数据卷，禁止删除！");
        } else {
          dialog.danger('确认删除', '是否确认删除').then(button => { if (button !== dialog.button.BUTTON_OK) throw ''}).then(function () {
            storageBackend.deleteStorage(storageId).then(function () {
              $state.go('storageManage');
            }, function (res) {
              dialog.error( '删除失败!', res.data.resultMsg);
            });
          });
        }
      };
      $scope.toggleIsEditStorage = function (operate) {
        if (operate === 'edit') {
          $scope.hasVolume = false;
          if ($scope.volumeInfo.volumeList && $scope.volumeInfo.volumeList.length > 0) {
            $scope.hasVolume = true;
          }
          else {
            storageBackend.getStorageVolume(storageId).then(function (res) {
              let volumeList = res.data.result || [];
              if (volumeList && volumeList.length > 0) {
                $scope.hasVolume = true;
              }
            }, function () {
              $scope.hasVolume = false;
            });
          }
        } else {
          initStorageIns();
        }
        $scope.isEditStorage = !$scope.isEditStorage;
      };
      $scope.saveEditStorage = function () {
        $scope.isRunning = true;
        storageBackend.modifyStorage($scope.storageInstance).then(function () {
          $scope.toggleIsEditStorage();
        }, function (resError) {
          dialog.error('修改失败！', resError.data.resultMsg);
        }).finally(function () {
          $scope.isRunning = false;
        });
      };
    }]);

})(angular.module('domeApp'));
