/*
 * @author tiansheng
 */

(function (domeApp, undefined) {
  'use strict';
  if (typeof domeApp === 'undefined') return;
  domeApp.controller('choseImageCtr', ['$scope', '$modalInstance', '$modal', '$domeProject', '$domeImage', '$domeData', 'dialog', '$state', function ($scope, $modalInstance, $modal, $domeProject, $domeImage, $domeData, dialog, $state) {
    $scope.loading = true;
    $scope.key = {
      searchKey: ''
    };
    $scope.imageList = [];
    $domeImage.imageService.getBaseImages().then(function (res) {
      $scope.imageList = res.data.result;
    }).finally(function () {
      $scope.loading = false;
    });
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    $scope.choseImage = function (img) {
      $modalInstance.close(img);
    };
  }]);
})(angular.module('domeApp'));