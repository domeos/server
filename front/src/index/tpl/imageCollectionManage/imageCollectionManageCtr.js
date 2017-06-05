/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('ImageCollectionManageCtr', ['$scope', '$state', '$domeImage', 'dialog','$domeUser', '$modal', '$cookieStore','api', function ($scope, $state, $domeImage, dialog, $domeUser, $modal, $cookieStore, api) {
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
		
		api.user.whoami().then(response => {
					let whoami = response;
					if(whoami.isAdmin){
							$scope.baseImageDeleteAuth = true;
					}
		});
		
		var stateInfo = $state.$current.name,
			imageService = $domeImage.imageService;
		if (stateInfo.indexOf('proimages') !== -1) {
			$scope.tabActive[2].active = true;
		} else if (stateInfo.indexOf('publicimages') !== -1) {
			$scope.tabActive[1].active = true;
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
				dialog.alert('提示', '添加成功！');
				$scope.newImageInfo = {};
				if (res.data.result) {
					$scope.baseImages.push(res.data.result);
				}
				$scope.needValid = false;
				form.$setPristine();
			}, function (res) {
				dialog.error('添加失败', res.data.resultMsg);
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
		$domeImage.imageService.getImageInfo(imageName).then(function (res) {
			$scope.tagInfo = res.data.result || [];
		}).finally(function () {
			$scope.isLoading = false;
		});
	}]);
	domeApp.controller('ImageCollectionMangePublicImages', ['$scope', 'api', 'dialog', function ($scope, api, dialog) {
	  $scope.loading = true;
	  $scope.imageInfo = {
      imageList: [],
      filteredImageList: [],
      searchText: '',
	  };
	  $scope.filter = function () {
	    $scope.imageInfo.filteredImageList = $scope.imageInfo.imageList.filter(function (image) {
	      return image.name.indexOf($scope.imageInfo.searchText) !== -1;
	    });
	  };
	  api.image.public.list()
      .then(function (imageList) {
        $scope.imageInfo.imageList = imageList;
        $scope.filter();
      })
      .catch(error => {
        return dialog.alert('加载失败', '获取官方仓库镜像列表失败');
      })
      .then(() => {
        $scope.loading = false;
      });
	}]);
})(angular.module('domeApp'));

; (function (formInputs) {
  formInputs.component('imageList', {
    template: `
      <ul class="image-list card-list">
        <li class="image-list-item card-item-container" ng-repeat="image in $ctrl.imageList track by $index">
          <div class="image-list-item-icon-container">
            <img src="index/images/lib/docker-image.png" class="image-list-item-icon" />
            <img ng-src="{{ image.icon }}" class ="image-list-item-icon" onerror="this.style.display = 'none'" onload="this.style.display = 'block'" />
          </div>
          <div class="image-list-item-content">
            <div class="image-list-item-name"><a ui-sref="publicImageDetail({ name: image.name })" ng-bind="image.name"></a></div>
            <div class="image-list-item-info">
              <span class="image-list-item-updatetime">更新时间：<span class="image-list-item-updatetime-output" ng-bind="image.updateTime | time"></span></span>
            </div>
          </div>
          <div class="card-right-info-item image-list-item-info-download-count">
            <icon-download></icon-download><span class="image-list-item-info-download-count-output" ng-bind="image.downloadCount"></span>次
          </div>
          <div class="card-right-info-item image-list-item-info-version-count">
            <a ui-sref="publicImageDetail({ name: image.name, page: 'tags' })"><span class="image-list-item-info-version-count-output" ng-bind="image.tagList.length"></span>个版本</a>
          </div>
        </li>
      </ul>
    `,
    bindings: {
      imageList: '<?',
    },
    controller: [function () { }]
  });

}(angular.module('formInputs')));