domeApp.controller('mirrorCustomCtr', ['$scope', '$domeImage', '$domePublic', '$modal', '$q', function($scope, $domeImage, $domePublic, $modal, $q) {
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
		$scope.config.envConfigs = [{
				envKey: '',
				envValue: '',
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

	};

	$scope.flag = -1;
	var monitorName = function() {
		var deferred = $q.defer();
		$scope.isLoading = true;
		var imageName = $scope.config.imageName;
		var imageTag = $scope.config.imageTag;
		$domeImage.monitorName(imageName, imageTag).then(function(res) {
			// var flag=-1;
			var data = res.data.result;
			if (data == "PROJECT") {

				$scope.flag = 1;

			} else if (data == "BASEIMAGE") {
				$scope.flag = 2;

			} else if (data == "NEITHER") {
				$scope.flag = 0;
			}
			deferred.resolve($scope.flag);
		}, function(res) {
			deferred.reject(-1);
		});
		return deferred.promise;
	};
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

		monitorName().then(function(res) {
			if ($scope.flag === 1) {
				$domePublic.openWarning('该镜像名已存在，如继续构建会覆盖原镜像！');
			} else if ($scope.flag == 2) {
				$domePublic.openWarning('该镜像已存在，如继续构建会覆盖原镜像！');
			} else if ($scope.flag === 0) {
				$domePublic.openPrompt('不存在同名镜像，可继续构建。');
			}
			$scope.flag = -1;
			
		},function(res){
			$domePublic.openWarning({
				title: '检测失败',
				msg: 'Message:' + res.msg
			});
		});
		$scope.isLoading = false;

	};
	$scope.creatBuild = function() {
		monitorName().then(function(res){
			if ($scope.flag === 0) {
				createNewBuild();
			} else {
				$domePublic.openConfirm('该镜像名已存在，如继续构建会覆盖原镜像！').then(function() {
					createNewBuild();
				}, function(res) {
					// $domePublic.openWarning('创建定制失败，请重试！');
				});
			}
			$scope.flag = -1;
		},function(res){
			$domePublic.openWarning({
				title: '检测失败',
				msg: 'Message:' + res.msg
			});
		});	
		$scope.isLoading = false;
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
		$scope.img.type=mirror;//用于后面获取tag(mirror:baseImages,projectImages,otherImages)
		var listInfo = $scope.img[mirror];
		var length = listInfo.length;
		var i, j, m;
		if (mirror == 'baseImages' || mirror == 'projectImages') {
			$scope.img.mirror=mirror=='baseImages'?'基础镜像':'项目镜像';
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
					imageName:listInfo[m].imageName,
					registry:listInfo[m].registry
				});
			}
			$scope.config.sourceImage.imageName = $scope.img.mirrorNameList[0].imageName;
			$scope.config.sourceImage.registryUrl = $scope.img.mirrorNameList[0].registry;
		} else if (mirror == 'otherImages') {
			$scope.img.mirror='非项目镜像';
			for(i=0;i<length;i++){
				$scope.img.mirrorNameList.push({
					imageName:listInfo[i],
					registry:''
				});
			}
			$scope.config.sourceImage.imageName = $scope.img.mirrorNameList[0].imageName;
		}
	};
	$scope.selectMirrorName = function(mirrorname,registry) {
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
			$domeImage.getDockerImageTags(mirrorname,registry).then(function(res){
				var data=res.data.result||[];
				var length=data.length;
				for(var i=0;i<length;i++){
					$scope.img.mirrorTagList.push(data[i].tag);
				}
				$scope.config.sourceImage.imageTag=$scope.img.mirrorTagList[0] || '';
			},function(res){

			});
			$scope.isLoading = false;
		} else if ($scope.img.type == 'otherImages') {

			$scope.isLoading = true;
			$domeImage.getGlobalImageInfo(mirrorname).then(function(res){
				var data=res.data.result||[];
				var length=data.length;
				for(var i=0;i<length;i++){
					$scope.img.mirrorTagList.push(data[i].tag);
				}
				$scope.config.sourceImage.imageTag=$scope.img.mirrorTagList[0] || '';
				$scope.config.sourceImage.registryUrl = data[0].registry;//非项目镜像获取详情后才能得到registytUrl
			},function(res){

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
				$scope.selectMirrorName($scope.img.baseImages[0].imageName,$scope.img.baseImages[0].registry);
			} else if ($scope.img.projectImages.length !== 0) {
				$scope.img.type = 'projectImages';
				$scope.img.mirror = '项目镜像';
				$scope.selectMirror('projectImages');
				$scope.selectMirrorName($scope.img.projectImages[0].imageName,$scope.img.projectImages[0].registry);
			} else if ($scope.img.otherImages !== 0) {
				$scope.img.type = 'otherImages';
				$scope.img.mirror = '其他镜像';
				$scope.selectMirror('otherImages');
				$scope.selectMirrorName($scope.img.otherImages[0],'');
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
	var init = function() {
		$domeImage.getCustomInfo().then(function(res) {
			$scope.customList = res.data.result || [];
			for (var i = 0; i < $scope.customList.length; i++) {
				var thisCustom = $scope.customList[i];
				if (thisCustom.autoCustom === 0) {
					thisCustom.type = 'Dockerfile';
				} else {
					thisCustom.type = '配置文件';
				}
			}
		}).finally(function() {
			$scope.isLoading = false;
		});
	};
	$scope.selectImgList=function(){
		init();
	};
	$scope.selectOption = {
		status: {
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

	$scope.getBuildLog = function(imgId,status) {
		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'mirrorDairyModal.html',
			controller: 'mirrorDairyModalCtr',
			size: 'lg',
			resolve: {
				params: function() {
					return {
						imageId: imgId,
						status: status
					};
				}
			}
		});
	};
	
}]).controller('mirrorDairyModalCtr',['$scope','params','$sce','$domeImage','$location',function($scope,params,$sce,$domeImage,$location){
	var logSocket, strLog = '',
		requestUrl = 'ws://' + $location.host();
	if ($location.port()) {
		requestUrl += ':' + $location.port();
	}
	if(params.status=='Building'){
		logSocket = new WebSocket(requestUrl + '/api/ci/build/log/realtime?buildId=' + params.imageId+'&type=baseimage');

		var onMessage = function(event) {
			strLog = (strLog + event.data).replace(/[\n]/g, '<br>');
			$scope.$apply(function() {　　
				$scope.log = $sce.trustAsHtml(strLog);
			});
		};

		var onOpen = function(event) {
			console.log("连接打开！");
		};
		logSocket.onopen = function(event) {
			onOpen(event);
		};
		logSocket.onmessage = function(event) {
			onMessage(event);
		};
		logSocket.onclose = function() {
			console.log('连接被关闭！');
		};
	}else if(params.status==='Success'||params.status==='Fail'){
		$domeImage.getLogFile(params.imageId).then(function(res) {
			if (res.data.result) {
				var strLog = res.data.result.replace(/[\n\r]/g, '<br>');
				$scope.log = $sce.trustAsHtml(strLog);
			} else {
				$scope.log = $sce.trustAsHtml('<p class="nolog">无日志信息</p>');
			}

		}, function(res) {
			$scope.log = $sce.trustAsHtml('<p class="nolog">无日志信息</p>');
		});
	}else{
		$scope.log = $sce.trustAsHtml('<p class="nolog">无日志信息</p>');
	}	
	$scope.$on("$destroy", function() {
		if (logSocket) {
			logSocket.close();
			return false;
		}
	});		
}]);