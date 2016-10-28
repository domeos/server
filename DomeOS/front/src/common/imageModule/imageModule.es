/*
 * @author  ChandraLee
 * @description  镜像模块
 */

((window, undefined) => {
    'use strict';
    let imageModule = angular.module('imageModule', []);

    function domeImage($http, $q, $domePublic) {

        function ImageService() {
            this._url = '/api/image';
            this.getBaseImages = () => $http.get(`${this._url}/base`);
            this.getProjectImages = () => $http.get(this._url);
            this.getAllImages = () => $http.get(`${this._url}/all`);
            this.getImageInfo = (imageName) => $http.get(`${this._url}/all/detail?name=${imageName}`);
            //项目镜像和基础镜像的tag
            this.getImageTags = (projectName, registry) => $http.get(`${this._url}/detail?name=${projectName}&registry=${registry}`);
            this.getCustomImages = () => $http.get(`${this._url}/custom`);
            this.getCustomImageInfo = (id) => $http.get(`${this._url}/custom/${id}`);
            this.createCustomImage = (mirrorInfo) => $http.post(`${this._url}/custom`, angular.toJson(mirrorInfo));
            this.buildCustomImage = (imageId) => $http.post(`${this._url}/custom/build/${imageId}`);
            this.deleteCustomImage = (imageId) => $http.delete(`${this._url}/custom/${imageId}`);
            this.validImageName = (imageName, imageTag) => $http.post(`${this._url}/custom/validate?imageName=${imageName}&imageTag=${imageTag}`);
            this.createBaseImage = (imageInfo) => $http.post(`${this._url}/base`, angular.toJson(imageInfo));
            this.deleteBaseImage = (imageId) => $http.delete(`${this._url}/base/${imageId}`);
            // @param type: 'java'
            this.getExclusiveImages = (type) => $http.get(`${this._url}/exclusive/${type}`);
        }
        const imageService = new ImageService();

        // 删除基础镜像
        const deleteBaseImage = (imageId) => {
            var deferred = $q.defer();
            $domePublic.openDelete().then(() => {
                imageService.deleteBaseImage(imageId).then(() => {
                    deferred.resolve();
                }, () => {
                    deferred.reject();
                    $domePublic.openWarning('删除失败！');
                });
            }, () => {
                deferred.reject();
            });
            return deferred.promise;
        };
        class Mirror {
            init() {
                this.config = {
                    autoCustom: 0,
                    imageName: '',
                    imageTag: '',

                    description: '',

                    dockerfileContent: '',
                    files: [{
                        fileName: '',
                        filePath: '',
                        content: ''
                    }],
                    envSettings: [{
                        key: '',
                        value: '',
                        description: ''
                    }],
                    sourceImage: {
                        thirdParty: 0,
                        imageName: '',
                        imageTag: '',
                        registryUrl: ''
                    },
                    publish: 1
                };
            }
            addEnvConfDefault() {
                this.config.envSettings.push({
                    key: '',
                    value: '',
                    description: ''
                });
            }
            deleteArrItem(item, index) {
                this.config[item].splice(index, 1);
            }

            addFileDefault() {
                this.config.files.push({
                    fileName: '',
                    filePath: '',
                    content: ''
                });
            }
            clearFileWrite(index) {
                this.config.files[index].content = '';
            }
        }
        var getMirrorInstance = function () {
            var ins = new Mirror();
            ins.init();
            return ins;
        };
        return {
            imageService: imageService,
            Mirror: Mirror,
            deleteBaseImage: deleteBaseImage,
            getMirrorInstance: getMirrorInstance
        };
    }
    domeImage.$inject = ['$http', '$q', '$domePublic'];
    imageModule.factory('$domeImage', domeImage);
    window.imageModule = imageModule;
})(window);