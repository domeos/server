/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('ImageManageCtr', ['$scope', '$state', '$domeImage', '$domePublic', '$modal', function ($scope, $state, $domeImage, $domePublic, $modal) {
		$scope.$emit('pageTitle', {
			title: '镜像管理',
			descrition: '在这里您可以查看并管理您的镜像仓库。',
			mod: 'image'
		});
		$scope.isLoading = true;
		$scope.needValid = {
			value: false
		};
		$scope.isShowAdd = false;
		$scope.newImageInfo = {};
		$scope.projectRegistry = '';
		$scope.tabActive = [{
			active: false
		}, {
			active: false
		}, {
			active: false
		}];

		var stateInfo = $state.$current.name,
			imageService = $domeImage.imageService;
		if (stateInfo.indexOf('projectimages') !== -1) {
			$scope.tabActive[1].active = true;
		} else if (stateInfo.indexOf('otherimages') !== -1) {
			$scope.tabActive[2].active = true;
		} else {
			$scope.tabActive[0].active = true;
		}

		imageService.getAllImages().then(function (res) {
			var imageInfo = res.data.result || {};
			var i = 0,
				l;
			$scope.baseImages = imageInfo.baseImages || [];
			$scope.projectImages = imageInfo.projectImages || [];
			$scope.otherImages = imageInfo.otherImages || [];
			for (i = 0, l = $scope.baseImages.length; i < l; i++) {
				if (!$scope.baseImages[i].description) {
					$scope.baseImages[i].description = '无';
				}
			}
			if ($scope.projectImages.length !== 0) {
				$scope.projectRegistry = $scope.projectImages[0].registry;
			}
		}).finally(function () {
			$scope.isLoading = false;
		});
		$scope.toggleShowAdd = function (isShow) {
			$scope.isShowAdd = isShow;
		};
		$scope.openTagModal = function (simpleImageName) {
			$modal.open({
				animation: true,
				templateUrl: 'imageTagModal.html',
				controller: 'ImageTagModalCtr',
				size: 'lg',
				resolve: {
					imageName: function () {
						return simpleImageName;
					}
				}
			});
		};
		$scope.deleteBaseImage = function (id) {
			$domeImage.deleteBaseImage(id).then(function () {
				for (var i = 0; i < $scope.baseImages.length; i++) {
					if ($scope.baseImages[i].id === id) {
						$scope.baseImages.splice(i, 1);
						break;
					}
				}
			});
		};
		$scope.createImage = function (form) {
			$scope.isLoading = true;
			imageService.createBaseImage($scope.newImageInfo).then(function (res) {
				$domePublic.openPrompt('添加成功！');
				$scope.newImageInfo = {};
				if (res.data.result) {
					$scope.baseImages.push(res.data.result);
				}
				$scope.needValid = false;
				form.$setPristine();
			}, function () {
				$domePublic.openWarning('添加失败,请重试！');
			}).finally(function () {
				$scope.isLoading = false;
			});
		};
	}]).controller('ImageTagModalCtr', ['$scope', 'imageName', '$modalInstance', '$domeImage', '$util', function ($scope, imageName, $modalInstance, $domeImage, $util) {
		$scope.imageName = imageName;
		$scope.tagInfo = [];
		$scope.isLoading = true;
		$scope.parseDate = $util.getPageDate;
		$domeImage.imageService.getImageInfo(imageName).then(function (res) {
			$scope.tagInfo = res.data.result || [];
		}).finally(function () {
			$scope.isLoading = false;
		});
	}]);
})(window.domeApp);