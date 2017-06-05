/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('MirrorCustomCtr', ['$scope', '$domeImage', 'dialog', '$modal', '$q', '$location', '$state', '$util', '$timeout', function ($scope, $domeImage, dialog, $modal, $q, $location, $state, $util, $timeout) {
		$scope.$emit('pageTitle', {
			title: '镜像定制',
			descrition: '在这里您可以定制满足个性化需求的镜像。',
			mod: 'image'
		});
		var timeout;
		$scope.specificImg = {
			language: 'java',
			imgType: 'compileimage',
			isSelected: false
		};
		$scope.customtype = 'dockerfile';
		$scope.mirror = $domeImage.getMirrorInstance();
		$scope.config = $scope.mirror.config;
		$scope.toggleCustomType = function (type) {
			$scope.customtype = type;
			$scope.config.autoCustom = type == 'dockerfile' ? 0 : 1;
			$scope.config.envSettings = [{
				key: '',
				value: '',
				description: ''
			}];
			$scope.config.publish = 1;
			$scope.config.imageName = '';
			$scope.config.imageTag = '';
			$scope.config.description = '';
			$scope.specificImg = {
				language: 'java',
				imgType: 'compileimage',
				isSelected: false
			};
			$scope.config.dockerfileContent = '';
			$scope.config.files = [{
				fileName: '',
				filePath: '',
				content: ''
			}];

		};
		$scope.tabActive = [{
			active: false
		}, {
			active: false
		}];
		var imageService = $domeImage.imageService;
		var startBuildRequest = function (imageId) {
			imageService.buildCustomImage(imageId).then(function (res) {
				dialog.alert('提示', '成功，正在构建！');
			}, function (res) {
				dialog.error('启动构建失败', res.data.resultMsg);
				imageService.deleteCustomImage(imageId);
			}).finally(function () {
				$scope.isLoading = false;
			});
		};
		var createNewBuild = function () {
			imageService.createCustomImage($scope.config).then(function (res) {
				var data = res.data.result || {};
				startBuildRequest(data.id);
			}, function (res) {
				dialog.error('创建失败', res.data.resultMsg);
			}).finally(function () {
				$scope.isLoading = false;
			});
		};
		$scope.nameTest = function () {
			$scope.isLoading = true;
			imageService.validImageName($scope.config.imageName, $scope.config.imageTag).then(function (res) {
				var data = res.data.result;
				if (data == 'PROJECT') {
					dialog.error('警告', '存在与该镜像同名的项目！');
				} else if (data == 'BASEIMAGE') {
					dialog.error('警告', '存在与该镜像同名的基础镜像！');
				} else if (data == 'NEITHER') {
					dialog.alert('提示', '不存在同名镜像，可继续构建。');
				} else if (data == 'IMAGE_IN_REGISTRY') {
					dialog.error('警告', '镜像仓库中存在同名镜像，如继续会覆盖原镜像!');
				}
			}, function (res) {
				dialog.error('检测失败', res.data.resultMsg);
			}).finally(function () {
				$scope.isLoading = false;
			});
		};
		$scope.creatBuild = function () {
			$scope.isLoading = true;
			imageService.validImageName($scope.config.imageName, $scope.config.imageTag).then(function (res) {
				if (res.data.result == 'NEITHER') {
					createNewBuild();
				} else {
					dialog.continue('提示', '该镜像名已存在，如继续构建会覆盖原镜像！').then(button => { if (button !== dialog.button.BUTTON_OK) throw '' }).then(function () {
						createNewBuild();
					});
				}
			}, function (res) {
				dialog.error('重名检查失败', res.data.resultMsg);
			}).finally(function () {
				$scope.isLoading = false;
			});
		};
		$scope.assigImgName = function (isSelected) {
			if (!isSelected) {
				$scope.config.imageName = '';
			} else {
				$scope.config.imageName = $scope.specificImg.imgType + '-' + $scope.specificImg.language;
			}

		};
		//configfile
		$scope.selectMirror = function (mirror) {
			$scope.img.mirrorNameList = [];
			$scope.img.type = mirror; //用于后面获取tag(mirror:baseImages,projectImages,otherImages)
			var listInfo = $scope.img[mirror];
			var length = listInfo.length;
			var i, j, m;
			if (mirror == 'baseImages' || mirror == 'projectImages') {
				$scope.img.mirror = mirror == 'baseImages' ? '基础镜像' : '项目镜像';
				for (i = 0; i < length; i++) {
					for (j = i + 1; j < length; j++) {
						if (listInfo[i].imageName == listInfo[j].imageName) {
							listInfo.splice(j, 1);
							length--;
							j--;
						}
					}
				}
				var len = listInfo.length;
				for (m = 0; m < len; m++) {
					$scope.img.mirrorNameList.push({
						imageName: listInfo[m].imageName,
						registry: listInfo[m].registry
					});
				}
				$scope.config.sourceImage.imageName = $scope.img.mirrorNameList[0].imageName;
				$scope.config.sourceImage.registryUrl = $scope.img.mirrorNameList[0].registry;
			} else if (mirror == 'otherImages') {
				$scope.img.mirror = '非项目镜像';
				for (i = 0; i < length; i++) {
					$scope.img.mirrorNameList.push({
						imageName: listInfo[i],
						registry: ''
					});
				}
				$scope.config.sourceImage.imageName = $scope.img.mirrorNameList[0].imageName;
			}
		};
		$scope.selectMirrorName = function (mirrorname, registry) {
			$scope.config.sourceImage.imageName = mirrorname;
			$scope.config.sourceImage.registryUrl = registry;

			$scope.img.mirrorTagList = [];
			var listInfo = $scope.img[$scope.img.type];
			var length = listInfo.length;
			var i, j = 0;

			if ($scope.img.type == 'baseImages') {
				for (i = 0; i < length; i++) {
					if (listInfo[i].imageName == mirrorname) {
						$scope.img.mirrorTagList[j++] = listInfo[i].imageTag;
					}
				}
				$scope.config.sourceImage.imageTag = $scope.img.mirrorTagList[0] || '';

			} else if ($scope.img.type == 'projectImages') {
				$scope.isLoading = true;
				imageService.getImageTags(mirrorname, registry).then(function (res) {
					var data = res.data.result || [];
					var length = data.length;
					for (var i = 0; i < length; i++) {
						$scope.img.mirrorTagList.push(data[i].tag);
					}
					$scope.config.sourceImage.imageTag = $scope.img.mirrorTagList[0] || '';
				});
				$scope.isLoading = false;
			} else if ($scope.img.type == 'otherImages') {

				$scope.isLoading = true;
				imageService.getImageInfo(mirrorname).then(function (res) {
					var data = res.data.result || [];
					var length = data.length;
					for (var i = 0; i < length; i++) {
						$scope.img.mirrorTagList.push(data[i].tag);
					}
					$scope.config.sourceImage.imageTag = $scope.img.mirrorTagList[0] || '';
					$scope.config.sourceImage.registryUrl = data[0].registry; //非项目镜像获取详情后才能得到registytUrl
				});
				$scope.isLoading = false;
			}
		};


		var initImg = function () {
			$scope.isLoading = true;
			imageService.getAllImages().then(function (res) {

				var imageInfo = res.data.result || {};

				$scope.img = imageInfo;

				$scope.img.baseImages = imageInfo.baseImages || [];
				$scope.img.projectImages = imageInfo.projectImages || [];
				$scope.img.otherImages = imageInfo.otherImages || [];

				if ($scope.img.baseImages.length !== 0) {
					$scope.img.type = 'baseImages';
					$scope.img.mirror = '基础镜像';
					$scope.selectMirror('baseImages');
					$scope.selectMirrorName($scope.img.baseImages[0].imageName, $scope.img.baseImages[0].registry);
				} else if ($scope.img.projectImages.length !== 0) {
					$scope.img.type = 'projectImages';
					$scope.img.mirror = '项目镜像';
					$scope.selectMirror('projectImages');
					$scope.selectMirrorName($scope.img.projectImages[0].imageName, $scope.img.projectImages[0].registry);
				} else if ($scope.img.otherImages !== 0) {
					$scope.img.type = 'otherImages';
					$scope.img.mirror = '其他镜像';
					$scope.selectMirror('otherImages');
					$scope.selectMirrorName($scope.img.otherImages[0], '');
				}

			}).finally(function () {
				$scope.isLoading = false;
			});
		};

		initImg();


		$scope.toggleMirrorHub = function (num) {
			$scope.config.sourceImage.thirdParty = num;
			if (num === 0) {
				initImg();

			} else {

				$scope.config.sourceImage.registryUrl = '';
				$scope.config.sourceImage.imageName = '';
				$scope.config.sourceImage.imageTag = '';
			}
		};

		//定制记录
		$scope.customImgList = [];
		var _formartCustomImg = function (customImg, requestUrl) {
			var logUrl = '';
			customImg.interval = $util.getPageInterval(customImg.createTime, customImg.finishTime);
			customImg.createTime = $util.getPageDate(customImg.createTime);
			if (customImg.autoCustom === 0) {
				customImg.type = 'Dockerfile';
			} else {
				customImg.type = '配置文件';
			}
			if (customImg.state == 'Building') {
				logUrl = location.protocol.replace('http', 'ws') + '//' + requestUrl + '/api/ci/build/log/realtime/websocket?buildId=' + customImg.id + '&type=baseimage';
			} else if (customImg.state === 'Success' || customImg.state === 'Fail') {
				logUrl = $location.protocol() + '://' + requestUrl + '/api/image/custom/download/' + customImg.id;
			}
			customImg.logHref = '/log/log.html?url=' + encodeURIComponent(logUrl);
		};
		$scope.getImgList = function () {
			if (timeout) {
				$timeout.cancel(timeout);
			}
			imageService.getCustomImages().then(function (res) {
				var i, j, customImgList = res.data.result || [],
					requestUrl = $location.host(),
					isFind, thisCustomImg, newCount = 0;
				if ($location.port()) {
					requestUrl += ':' + $location.port();
				}

				if ($scope.customImgList.length === 0) {
					for (i = 0; i < customImgList.length; i++) {
						_formartCustomImg(customImgList[i], requestUrl);
					}
					$scope.customImgList = customImgList;
				} else {
					for (i = 0; i < customImgList.length; i++) {
						isFind = false;
						thisCustomImg = customImgList[i];
						_formartCustomImg(thisCustomImg, requestUrl);
						for (j = newCount; j < $scope.customImgList.length; j++) {
							if (thisCustomImg.id === $scope.customImgList[j].id) {
								$scope.customImgList[j].imageSize = thisCustomImg.imageSize;
								$scope.customImgList[j].type = thisCustomImg.type;
								if ($scope.customImgList[j].state !== thisCustomImg.state) {
									$scope.customImgList[j].state = thisCustomImg.state;
									$scope.customImgList[j].logHref = thisCustomImg.logHref;
								}
								$scope.customImgList[j].interval = thisCustomImg.interval;
								$scope.customImgList[j].createTime = thisCustomImg.createTime;
								isFind = true;
								break;
							}
						}
						if (!isFind) {
							$scope.customImgList.splice(newCount, 0, thisCustomImg);
							newCount++;
						}
					}
				}
				if ($state.$current.name == 'mirrorCustom.log') {
					timeout = $timeout(function () {
						$scope.getImgList();
					}, 4000);
				}
			}).finally(function () {
				$scope.isLoading = false;
			});
		};
		$scope.selectOption = {
			state: {
				All: true,
				Preparing: false,
				Building: false,
				Success: false,
				Fail: false
			},
			builduser: {
				All: true,
				own: false
			},
			type: {
				All: true,
				dockerfile: false,
				configfile: false
			}
		};

		$scope.toggleAll = function (type) {
			angular.forEach($scope.selectOption[type], function (value, key) {
				$scope.selectOption[type][key] = false;
			});
			$scope.selectOption[type].All = true;
		};

		$scope.toggleSelect = function (type, item) {
			var hasNone = true;
			$scope.selectOption[type][item] = !$scope.selectOption[type][item];
			if (!$scope.selectOption[type][item]) {
				angular.forEach($scope.selectOption[type], function (value, key) {
					if (key !== 'All' && $scope.selectOption[type][key] && hasNone) {
						hasNone = false;
					}
				});
				if (hasNone) {
					$scope.toggleAll(type);
				}
			} else if ($scope.selectOption[type].All) {
				$scope.selectOption[type].All = false;
			}
		};
		$scope.toggleShowDetail = function () {
			$scope.selectOption.isshowmore = !$scope.selectOption.isshowmore;
		};
		$scope.$on('$destroy', function (argument) {
			if (timeout) {
				$timeout.cancel(timeout);
			}
		});

		var stateInfo = $state.$current.name;
		if (stateInfo.indexOf('log') !== -1) {
			$scope.tabActive[1].active = true;
			$scope.getImgList();
		} else {
			$scope.tabActive[0].active = true;
		}
	}]);
})(angular.module('domeApp'));