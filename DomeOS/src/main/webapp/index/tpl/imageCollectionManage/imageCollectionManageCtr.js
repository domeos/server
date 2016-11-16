/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('ImageCollectionManageCtr', ['$scope', '$state', '$domeImage', '$domePublic','$domeUser', '$modal', '$cookieStore', function ($scope, $state, $domeImage, $domePublic, $domeUser, $modal, $cookieStore) {
		$scope.$emit('pageTitle', {
			title: '镜像管理',
			descrition: '在这里您可以查看并管理您的镜像仓库。',
			mod: 'image'
		});
		$scope.isShowImageDetail = -1;
		$scope.otherImagesInfo = [];
		$scope.isLoading = true;
		$scope.isLoadingBaseImage = true;
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
		$scope.baseImageDeleteAuth = false;
		var userService = $domeUser.userService;
		userService.getCurrentUser().then(function (res) {
			var loginUser = res.data.result;
			if(loginUser.username === 'admin') {
				$scope.baseImageDeleteAuth = true;
			}
		});
		var stateInfo = $state.$current.name,
			imageService = $domeImage.imageService;
		if (stateInfo.indexOf('proimages') !== -1) {
			$scope.tabActive[1].active = true;
		} else if (stateInfo.indexOf('otherimages') !== -1) {
			$scope.tabActive[2].active = true;
		} else {
			$scope.tabActive[0].active = true;
		}
		imageService.getBaseImages().then(function(res) {
			$scope.isLoadingBaseImage = true;
			$scope.baseImages = res.data.result || [];
			var i = 0,
				l;
			for (i = 0, l = $scope.baseImages.length; i < l; i++) {
				if (!$scope.baseImages[i].description) {
					$scope.baseImages[i].description = '无';
				}
			}
		}).finally(function() {
			$scope.isLoadingBaseImage = false;
		});

		imageService.getAllImages().then(function (res) {
			$scope.isLoading = true;
			var imageInfo = res.data.result || {};
			$scope.imageProjectCollections = imageInfo.imageProjectCollections || [];
			$scope.otherImages = imageInfo.otherImages || [];
			$scope.projectRegistry = imageInfo.registry;
		}).finally(function () {
			$scope.isLoading = false;
		});

		$scope.gotoProjectImageDetail = function(imgProjectCollection) {
			var paramCookies = {
				projectCollectionId: imgProjectCollection.projectCollectionId,
				projectCollectionName: imgProjectCollection.projectCollectionName,
				images: [],
				requestType: 'PROJECT_COLLECTION',
				projectRegistry: $scope.projectRegistry,
				deleteable: imgProjectCollection.deletable
			};
			$cookieStore.put('imageParam', paramCookies);
			var param = {
				args:{
					projectCollectionId: imgProjectCollection.projectCollectionId,
					projectCollectionName: imgProjectCollection.projectCollectionName,
					images: imgProjectCollection.projectImages,
					requestType: 'PROJECT_COLLECTION',
					projectRegistry: $scope.projectRegistry,
					deleteable: imgProjectCollection.deletable
				}
			};
			$state.go('projImagesManage', param);
		};
		$scope.gotoNotProjectImageDetail = function(images) {
			var paramCookies = {
				projectCollectionId:0,
				projectCollectionName: '',
				images: [],
				requestType: 'OTHERIMAGE',
				projectRegistry: $scope.projectRegistry
			};
			$cookieStore.put('imageParam', paramCookies);
			var param = {
				args:{
					projectCollectionId:0,
					projectCollectionName: '',
					images: images,
					requestType: 'OTHERIMAGE',
					projectRegistry: $scope.projectRegistry
				}
			};
			$state.go('otherImagesManage', param);
		};

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
			}, function (res) {
				$domePublic.openWarning({
					title: '添加失败,请重试！',
					msg: res.data.resultMsg
				});
			}).finally(function () {
				$scope.isLoading = false;
			});
		};
		$scope.isShowImage = function (index) {
			if($scope.isShowImageDetail === index) {
				$scope.isShowImageDetail = -1;
			}else {
				$scope.isShowImageDetail = index;
			}
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