domeApp.controller('mirrorCustomCtr', ['$scope', '$domeImage', '$domePublic', '$modal', '$q', '$location', '$state', function($scope, $domeImage, $domePublic, $modal, $q, $location, $state) {
	$scope.$emit('pageTitle', {
		title: '镜像定制',
		descrition: '在这里您可以定制满足个性化需求的镜像。',
		mod: 'image'
	});
	$scope.specificImg = {
		language: 'java',
		imgType: 'compileimage',
		isSelected: false
	};
	$scope.customtype = 'dockerfile';
	$scope.mirror = $domeImage.getMirrorInstance();
	$scope.config = $scope.mirror.config;
	$scope.toggleCustomType = function(type) {
		$scope.customtype = type;
		$scope.config.autoCustom = (type == 'dockerfile') ? 0 : 1;
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
	var startBuildRequest = function(imageId) {
		$domeImage.startBuild(imageId).then(function(res) {
			if (res.data.resultCode === 200) {
				$domePublic.openPrompt('成功，正在构建！');
			} else {
				$domePublic.openWarning('启动构建失败，请重试！');
				$domeImage.deleteBuild(imageId);
			}
		}, function(res) {
			$domePublic.openWarning({
				title: '启动构建失败',
				msg: 'Message:' + res.msg
			});
			$domeImage.deleteBuild(imageId);
		}).finally(function() {
			$scope.isLoading = false;
		});
	};
	var createNewBuild = function() {
		$domeImage.createCustomize($scope.config).then(function(res) {
			var data = res.data.result || {};
			if (res.data.resultCode === 200) {
				startBuildRequest(data.id);
			} else {
				$domePublic.openWarning('创建定制失败，请重试！');
			}
		}, function(res) {
			$domePublic.openWarning({
				title: '创建失败',
				msg: 'Message:' + res.msg
			});
		}).finally(function() {
			$scope.isLoading = false;
		});
	};
	$scope.nameTest = function() {
		$scope.isLoading = true;
		$domeImage.monitorName($scope.config.imageName, $scope.config.imageTag).then(function(res) {
			var data = res.data.result;
			if (data == 'PROJECT') {
				$domePublic.openWarning('存在与该镜像同名的项目！');
			} else if (data == 'BASEIMAGE') {
				$domePublic.openWarning('存在与该镜像同名的基础镜像！');
			} else if (data == 'NEITHER') {
				$domePublic.openPrompt('不存在同名镜像，可继续构建。');
			} else if (data == 'IMAGE_IN_REGISTRY') {
				$domePublic.openWarning('镜像仓库中存在同名镜像，如继续会覆盖原镜像!');
			}
		}, function(res) {
			$domePublic.openWarning({
				title: '检测失败',
				msg: 'Message:' + res.data.resultMsg
			});
		}).finally(function() {
			$scope.isLoading = false;
		});
	};
	$scope.creatBuild = function() {
		$scope.isLoading = true;
		$domeImage.monitorName($scope.config.imageName, $scope.config.imageTag).then(function(res) {
			var data = res.data.result;
			if (res.data.result == 'NEITHER') {
				createNewBuild();
			} else {
				$domePublic.openConfirm('该镜像名已存在，如继续构建会覆盖原镜像！').then(function() {
					createNewBuild();
				});
			}
		}, function(res) {
			$domePublic.openWarning({
				title: '重名检测失败',
				msg: 'Message:' + res.data.resultMsg
			});
		}).finally(function() {
			$scope.isLoading = false;
		});
	};
	$scope.assigImgName = function(isSelected) {
		if (!isSelected) {
			$scope.config.imageName = '';
		} else {
			$scope.config.imageName = $scope.specificImg.imgType + '-' + $scope.specificImg.language;
		}

	};
	//configfile
	$scope.selectMirror = function(mirror) {
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
	$scope.selectMirrorName = function(mirrorname, registry) {
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
			$domeImage.getDockerImageTags(mirrorname, registry).then(function(res) {
				var data = res.data.result || [];
				var length = data.length;
				for (var i = 0; i < length; i++) {
					$scope.img.mirrorTagList.push(data[i].tag);
				}
				$scope.config.sourceImage.imageTag = $scope.img.mirrorTagList[0] || '';
			}, function(res) {

			});
			$scope.isLoading = false;
		} else if ($scope.img.type == 'otherImages') {

			$scope.isLoading = true;
			$domeImage.getGlobalImageInfo(mirrorname).then(function(res) {
				var data = res.data.result || [];
				var length = data.length;
				for (var i = 0; i < length; i++) {
					$scope.img.mirrorTagList.push(data[i].tag);
				}
				$scope.config.sourceImage.imageTag = $scope.img.mirrorTagList[0] || '';
				$scope.config.sourceImage.registryUrl = data[0].registry; //非项目镜像获取详情后才能得到registytUrl
			}, function(res) {

			});
			$scope.isLoading = false;
		}
	};


	var initImg = function() {
		$scope.isLoading = true;
		$domeImage.getAllImages().then(function(res) {

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

		}).finally(function() {
			$scope.isLoading = false;
		});
	};

	initImg();


	$scope.toggleMirrorHub = function(num) {
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
	$scope.customList = [];
	$scope.selectImgList = function() {
		var requestUrl = $location.host(),
			logUrl;
		if ($location.port()) {
			requestUrl += ':' + $location.port();
		}
		$domeImage.getCustomInfo().then(function(res) {
			$scope.customList = res.data.result || [];
			for (var i = 0; i < $scope.customList.length; i++) {
				logUrl = '';
				var thisCustom = $scope.customList[i];
				if (thisCustom.autoCustom === 0) {
					thisCustom.type = 'Dockerfile';
				} else {
					thisCustom.type = '配置文件';
				}
				if (thisCustom.state == 'Building') {
					logUrl = 'ws://' + requestUrl + '/api/ci/build/log/realtime?buildId=' + thisCustom.id + '&type=baseimage';
				} else if (thisCustom.state === 'Success' || thisCustom.state === 'Fail') {
					logUrl = $location.protocol() + '://' + requestUrl + '/api/image/custom/download/' + thisCustom.id;
				}
				thisCustom.logHref = '/log/log.html?url=' + encodeURIComponent(logUrl);
			}
		}).finally(function() {
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

	$scope.toggleAll = function(type) {
		angular.forEach($scope.selectOption[type], function(value, key) {
			$scope.selectOption[type][key] = false;
		});
		$scope.selectOption[type].All = true;
	};

	$scope.toggleSelect = function(type, item) {
		var hasNone = true;
		$scope.selectOption[type][item] = !$scope.selectOption[type][item];
		if (!$scope.selectOption[type][item]) {
			angular.forEach($scope.selectOption[type], function(value, key) {
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
	$scope.toggleShowDetail = function() {
		$scope.selectOption.isshowmore = !$scope.selectOption.isshowmore;
	};

	var stateInfo = $state.$current.name;
	if (stateInfo.indexOf('log') !== -1) {
		$scope.tabActive[1].active = true;
		$scope.selectImgList();
	} else {
		$scope.tabActive[0].active = true;
	}
}]);