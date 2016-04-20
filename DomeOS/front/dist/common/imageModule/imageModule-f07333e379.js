var imageModule = angular.module('imageModule', []);
// 镜像service
imageModule.factory('$domeImage', ['$http', '$q', '$domePublic', function($http, $q, $domePublic) {
	'use strict';
	var getBaseImageList = function() {
		return $http.get('/api/image/base');
		// return $http.get('/api/ci/baseimage');
	};
	var getBaseProjectImgList = function() {
		return $http.get('/api/image');
	};
	var deleteBaseImg = function(id) {
		return $http.delete('/api/image/base' + id);
	};
	var getDockerImage = function() {
		return $http.get('/api/dockerimage');
	};
	//项目镜像和基础镜像的tag
	var getDockerImageTags = function(projectName, registry) {
		return $http.get('/api/image/detail?name=' + projectName + '&registry=' + registry);
		// return $http.get('/api/dockerimage/detail?name=' + projectName + '&registry=' + registry);
	};
	var getGlobalImageInfo = function(imageName) {
		return $http.get('/api/image/all/detail?name=' + imageName);
		// return $http.get('/api/global/dockerimages/detail?name=' + imageName);
	};
	var getAllImages = function() {
		return $http.get('/api/image/all');
		// return $http.get('/api/global/dockerimages');
	};
	var createBaseImage = function(imageInfo) {
		return $http.post('/api/image/base', angular.toJson(imageInfo));
		// return $http.post('/api/ci/baseimage', angular.toJson(imageInfo));
	};
	var getCustomInfo = function() {
		return $http.get('/api/image/custom');
	};
	var getCustomDetail = function(id) {
		return $http.get('/api/image/custom/' + id);
	};
	var monitorName = function(imageName, imageTag) {
		return $http.post('/api/image/custom/validate?imageName=' + imageName + '&imageTag=' + imageTag);
	};
	// 删除基础镜像
	var deleteBaseImage = function(imageId) {
		var deferred = $q.defer();
		$domePublic.openDelete().then(function() {
			$http.delete('/api/image/base/' + imageId).then(function() {
				deferred.resolve();
			}, function() {
				deferred.reject();
				$domePublic.openWarning('删除失败！');
			});
		}, function() {
			deferred.reject();
		});
		return deferred.promise;
	};
	var createCustomize = function(MirrorInfo) {
		return $http.post('/api/image/custom', angular.toJson(MirrorInfo));
	};
	var startBuild = function(imageId) {
		return $http.post('/api/image/custom/build/' + imageId);
	};
	var deleteBuild = function(imageId) {
		return $http.delete('/api/image/custom/' + imageId);
	};

	var Mirror = function() {};
	Mirror.prototype = {
		constructor: Mirror,
		init: function() {
			var mirror = {};
			mirror.autoCustom = 0;
			mirror.imageName = '';
			mirror.imageTag = '';

			mirror.description = '';

			mirror.dockerfileContent = '';
			mirror.files = [{
				fileName: '',
				filePath: '',
				content: ''
			}];
			mirror.envSettings = [{
				key: '',
				value: '',
				description: ''
			}];
			mirror.sourceImage = {
				thirdParty: 0,
				imageName: '',
				imageTag: '',
				registryUrl: ''
			};
			mirror.publish = 1;
			this.config = mirror;
		},
		addEnvConfDefault: function() {
			this.config.envSettings.push({
				key: '',
				value: '',
				description: ''
			});
		},
		deleteArrItem: function(item, index) {
			this.config.envSettings.splice(index, 1);
		},

		addFileDefault: function() {
			this.config.files.push({
				fileName: '',
				filePath: '',
				content: ''
			});
		},
		deleteFileDefault: function(item, index) {
			this.config.files.splice(index, 1);
		},
		clearFileWrite: function(item, index) {
			this.config.files[index].content = '';
		}
	};
	var getMirrorInstance = function() {
		var ins = new Mirror();
		ins.init();
		return ins;
	};
	return {
		getBaseImageList: getBaseImageList,
		getBaseProjectImgList: getBaseProjectImgList,
		getDockerImage: getDockerImage,
		getDockerImageTags: getDockerImageTags,
		getGlobalImageInfo: getGlobalImageInfo,
		getAllImages: getAllImages,
		deleteBaseImage: deleteBaseImage,
		createBaseImage: createBaseImage,
		getCustomInfo: getCustomInfo,
		monitorName: monitorName,
		Mirror: Mirror,
		getMirrorInstance: getMirrorInstance,
		createCustomize: createCustomize,
		startBuild: startBuild,
		getCustomDetail: getCustomDetail,
		deleteBuild: deleteBuild
	};
}]);