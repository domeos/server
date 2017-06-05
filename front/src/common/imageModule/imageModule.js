/*
 * @author  ChandraLee
 * @description  镜像模块
 */

((window, undefined) => {
    'use strict';
    let imageModule = angular.module('imageModule', []);

    function domeImage($http, $q, dialog) {

        function ImageService() {
            this._url = '/api/image';
            this.getBaseImages = () => $http.get(`${this._url}/base`);
            this.getProjectImages = () => $http.get(this._url);
            this.getForBuildImages = () => $http.get(`${this._url}/forbuild`);
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
            // image collection
            this.getCollectionImages = (imageNameDetail) => $http.post(`${this._url}/all/detail`, angular.toJson(imageNameDetail));
            this.deletePrivateImage = (name, tag, registry) => $http.delete(`${this._url}/all/detail/tag?name=${name}&tag=${tag}&registry=${registry}`);
            this.getTagDetail = (imageTagDetailRequest) => $http.post(`${this._url}/all/detail/tag`, angular.toJson(imageTagDetailRequest));
        }
        const imageService = new ImageService();

        // 删除基础镜像
        const deleteBaseImage = (imageId) => {
            var deferred = $q.defer();
            dialog.danger('确认删除', '确认要删除吗？').then(button => { if (button !== dialog.button.BUTTON_OK) throw '' }).then(() => {
                imageService.deleteBaseImage(imageId).then(() => {
                    deferred.resolve();
                }, () => {
                    deferred.reject();
                    dialog.error('删除失败', res.data.resultMsg);
                });
            }, () => {
                deferred.reject();
            });
            return deferred.promise;
        };
        // 删除私有仓库镜像
        const deletePrivateImage = (name, tag, registry) => {
            var deferred = $q.defer();
            dialog.danger('删除', '该镜像名下，image id相同的所有版本都会被删除，请慎重操作').then(button => { if (button !== dialog.button.BUTTON_OK) throw '' }).then(() => {
                imageService.deletePrivateImage(name, tag, registry).then(() => {
                    deferred.resolve();
                }, (res) => {
                    deferred.reject();
                    dialog.error('删除失败！', res.data.errors.message + res.data.resultMsg);
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
            getMirrorInstance: getMirrorInstance,
            deletePrivateImage: deletePrivateImage
        };
    }
    domeImage.$inject = ['$http', '$q', 'dialog'];
    imageModule.factory('$domeImage', domeImage);
    window.imageModule = imageModule;
})(window);
