var imageModule = angular.module('imageModule', []);
// 镜像service
imageModule.factory('$domeImage', ['$http', function($http) {
	'use strict';
	var getBaseImageList = function() {
		return $http.get('/api/ci/baseimage');
	};
	var getDockerImage = function() {
		return $http.get('/api/dockerimage');
	};
	var getDockerImageTags = function(projectName, registry) {
		return $http.get('/api/dockerimage/detail?name=' + projectName + '&registry=' + registry);
	};
	var getGlobalImageInfo = function(imageName) {
		return $http.get('/api/global/dockerimages/detail?name=' + imageName);
	};
	var getAllImages = function() {
		return $http.get('/api/global/dockerimages');
	};
	var createBaseImage = function(imageInfo) {
		return $http.post('/api/ci/baseimage', angular.toJson(imageInfo));
	};
	var getCustomInfo = function() {
		return $http.get('/api/ci/custom');
	};
	var getCustomDetail = function(id) {
		return $http.get('/api/ci/custom/' + id);
	};
	var monitorName = function(imageName, imageTag) {
		return $http.post('/api/ci/custom/validate?imageName=' + imageName + '&imageTag=' + imageTag);
	};
	var createCustomize = function(MirrorInfo) {
		return $http.post('/api/ci/custom', angular.toJson(MirrorInfo));
	};
	var startBuild = function(imageId) {
		return $http.post('/api/ci/custom/build/' + imageId);
	};
	var deleteBuild = function(imageId) {
		return $http.delete('/api/ci/custom/' + imageId);
	};
	var getLogFile = function(imageId) {
		return $http.get('/api/ci/custom/download/' + imageId);
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
			mirror.envConfigs = [{
				envKey: '',
				envValue: '',
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
			this.config.envConfigs.push({
				envKey: '',
				envValue: '',
				description: ''
			});
		},
		deleteArrItem: function(item, index) {
			this.config.envConfigs.splice(index, 1);
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
			this.config.files[index].content='';
		}
	};
	var getMirrorInstance = function() {
		var ins = new Mirror();
		ins.init();
		return ins;
	};
	return {
		getBaseImageList: getBaseImageList,
		getDockerImage: getDockerImage,
		getDockerImageTags: getDockerImageTags,
		getGlobalImageInfo: getGlobalImageInfo,
		getAllImages: getAllImages,
		createBaseImage: createBaseImage,
		getCustomInfo: getCustomInfo,
		monitorName: monitorName,
		Mirror: Mirror,
		getMirrorInstance: getMirrorInstance,
		createCustomize: createCustomize,
		startBuild: startBuild,
		getCustomDetail: getCustomDetail,
		deleteBuild: deleteBuild,
		getLogFile: getLogFile
	};
}]);
