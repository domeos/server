/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('ImagesManageCtr', ['$scope', '$state', '$stateParams', '$domeImage', 'dialog','$domeUser', '$modal', '$cookieStore', function ($scope, $state,$stateParams, $domeImage, dialog,$domeUser, $modal, $cookieStore) {
		$scope.$emit('pageTitle', {
			title: '镜像管理',
			descrition: '在这里您可以查看并管理您的镜像仓库。',
			mod: 'image'
		});
		$scope.imageDeleteAuth = false;
		var userService = $domeUser.userService;
		userService.getCurrentUser().then(function (res) {
			var loginUser = res.data.result;
			if(loginUser.adminPrivilege) {
				$scope.imageDeleteAuth = true;
			}
		});
		$scope.isShowImageDetail = -1;
		$scope.imagesInfo = [];
		$scope.isLoading = true;
		$scope.needValid = {
			value: false
		};
		$scope.isShowAdd = false;
		$scope.newImageInfo = {};
		
		var projectCollectionId = '';
		var stateInfo = $state.$current.name,
		imageService = $domeImage.imageService;
		var imageNameDetailRequest = {};
		function init() {
			if($stateParams.args.projectCollectionId !== undefined) {
				$scope.projectRegistry = $stateParams.args.projectRegistry;
				$scope.isDelete = $stateParams.args.deleteable;
				var imgProjectCollection = $stateParams.args;
				imageNameDetailRequest = {
					projectCollectionId: imgProjectCollection.projectCollectionId,
					projectCollectionName: imgProjectCollection.projectCollectionName,
					images: imgProjectCollection.images,
					requestType: imgProjectCollection.requestType,
					registry:imgProjectCollection.projectRegistry
				};
			}else {
				var imageParamCookie = $cookieStore.get('imageParam');
				$scope.projectRegistry = imageParamCookie.projectRegistry;
				$scope.isDelete = imageParamCookie.deleteable;
				var imgProjectCollection = imageParamCookie;
				imageNameDetailRequest = {
					projectCollectionId: imgProjectCollection.projectCollectionId,
					projectCollectionName: imgProjectCollection.projectCollectionName,
					images: [],
					requestType: imgProjectCollection.requestType,
					registry:imgProjectCollection.projectRegistry
				};
			}
			$scope.collectionName =  imageNameDetailRequest.projectCollectionName;
			imageService.getCollectionImages(imageNameDetailRequest).then(function (res) {
				$scope.imagesInfo = res.data.result || [];
			},function(res) {
				dialog.error('查询失败', res.data.resultMsg);
			}).finally(function () {
				$scope.isLoading = false;
			});
		}
		init();
		$scope.getTagDetail = function(image) {
			$scope.isLoadingTagDetail = true;
			var imageTagDetailRequest = {
				registry: image.registry,
				name: image.imageName,
				tags: image.tags
			};
			imageService.getTagDetail(imageTagDetailRequest).then(function(res) {
				var imageTagDetail = res.data.result || [];
				for(var i = 0; i < $scope.imagesInfo.length; i++) {
					if($scope.imagesInfo[i].imageName === image.imageName) {
						$scope.imagesInfo[i].tagsDetail = imageTagDetail;
						break;
					}
				}
			},function(res) {
				dialog.error('查询失败', res.data.resultMsg);
			}).finally(function() {
					$scope.isLoadingTagDetail = false;
			});
		};
		$scope.deletePrivateImage = function (name,tag,registry) {
			$domeImage.deletePrivateImage(name,tag,registry).then(function () {
				init();
				// for (var i = 0; i < $scope.imagesInfo.length; i++) {
				// 	if ($scope.imagesInfo[i].imageName === name ) {
				// 		for (var l = 0; l < $scope.imagesInfo[i].tags.length; l++) {
				// 			if($scope.imagesInfo[i].tags[l] === tag) {
				// 				$scope.imagesInfo[i].tags.splice(l, 1);
				// 				$scope.imagesInfo[i].tagsDetail.splice(l, 1);
				// 				break;
				// 			}
				// 		}
				// 		break;
				// 	}
				// }
			},function(res) {
				dialog.error('删除失败', res.data.resultMsg);
			});
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
				dialog.alert('提示', '添加成功！');
				$scope.newImageInfo = {};
				if (res.data.result) {
					$scope.baseImages.push(res.data.result);
				}
				$scope.needValid = false;
				form.$setPristine();
			}, function () {
				dialog.error('警告', '添加失败，请重试！');
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
	}]);
})(angular.module('domeApp'));