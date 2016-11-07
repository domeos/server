'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @author  ChandraLee
 * @description  镜像模块
 */

(function (window, undefined) {
    'use strict';

    var imageModule = angular.module('imageModule', []);

    function domeImage($http, $q, $domePublic) {

        function ImageService() {
            var _this = this;

            this._url = '/api/image';
            this.getBaseImages = function () {
                return $http.get(_this._url + '/base');
            };
            this.getProjectImages = function () {
                return $http.get(_this._url);
            };
            this.getAllImages = function () {
                return $http.get(_this._url + '/all');
            };
            this.getImageInfo = function (imageName) {
                return $http.get(_this._url + '/all/detail?name=' + imageName);
            };
            //项目镜像和基础镜像的tag
            this.getImageTags = function (projectName, registry) {
                return $http.get(_this._url + '/detail?name=' + projectName + '&registry=' + registry);
            };
            this.getCustomImages = function () {
                return $http.get(_this._url + '/custom');
            };
            this.getCustomImageInfo = function (id) {
                return $http.get(_this._url + '/custom/' + id);
            };
            this.createCustomImage = function (mirrorInfo) {
                return $http.post(_this._url + '/custom', angular.toJson(mirrorInfo));
            };
            this.buildCustomImage = function (imageId) {
                return $http.post(_this._url + '/custom/build/' + imageId);
            };
            this.deleteCustomImage = function (imageId) {
                return $http.delete(_this._url + '/custom/' + imageId);
            };
            this.validImageName = function (imageName, imageTag) {
                return $http.post(_this._url + '/custom/validate?imageName=' + imageName + '&imageTag=' + imageTag);
            };
            this.createBaseImage = function (imageInfo) {
                return $http.post(_this._url + '/base', angular.toJson(imageInfo));
            };
            this.deleteBaseImage = function (imageId) {
                return $http.delete(_this._url + '/base/' + imageId);
            };
            // @param type: 'java'
            this.getExclusiveImages = function (type) {
                return $http.get(_this._url + '/exclusive/' + type);
            };
        }
        var imageService = new ImageService();

        // 删除基础镜像
        var deleteBaseImage = function deleteBaseImage(imageId) {
            var deferred = $q.defer();
            $domePublic.openDelete().then(function () {
                imageService.deleteBaseImage(imageId).then(function () {
                    deferred.resolve();
                }, function () {
                    deferred.reject();
                    $domePublic.openWarning('删除失败！');
                });
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        };

        var Mirror = function () {
            function Mirror() {
                _classCallCheck(this, Mirror);
            }

            _createClass(Mirror, [{
                key: 'init',
                value: function init() {
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
            }, {
                key: 'addEnvConfDefault',
                value: function addEnvConfDefault() {
                    this.config.envSettings.push({
                        key: '',
                        value: '',
                        description: ''
                    });
                }
            }, {
                key: 'deleteArrItem',
                value: function deleteArrItem(item, index) {
                    this.config[item].splice(index, 1);
                }
            }, {
                key: 'addFileDefault',
                value: function addFileDefault() {
                    this.config.files.push({
                        fileName: '',
                        filePath: '',
                        content: ''
                    });
                }
            }, {
                key: 'clearFileWrite',
                value: function clearFileWrite(index) {
                    this.config.files[index].content = '';
                }
            }]);

            return Mirror;
        }();

        var getMirrorInstance = function getMirrorInstance() {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9pbWFnZU1vZHVsZS9pbWFnZU1vZHVsZS5lcyJdLCJuYW1lcyI6WyJ3aW5kb3ciLCJ1bmRlZmluZWQiLCJpbWFnZU1vZHVsZSIsImFuZ3VsYXIiLCJtb2R1bGUiLCJkb21lSW1hZ2UiLCIkaHR0cCIsIiRxIiwiJGRvbWVQdWJsaWMiLCJJbWFnZVNlcnZpY2UiLCJfdXJsIiwiZ2V0QmFzZUltYWdlcyIsImdldCIsImdldFByb2plY3RJbWFnZXMiLCJnZXRBbGxJbWFnZXMiLCJnZXRJbWFnZUluZm8iLCJpbWFnZU5hbWUiLCJnZXRJbWFnZVRhZ3MiLCJwcm9qZWN0TmFtZSIsInJlZ2lzdHJ5IiwiZ2V0Q3VzdG9tSW1hZ2VzIiwiZ2V0Q3VzdG9tSW1hZ2VJbmZvIiwiaWQiLCJjcmVhdGVDdXN0b21JbWFnZSIsIm1pcnJvckluZm8iLCJwb3N0IiwidG9Kc29uIiwiYnVpbGRDdXN0b21JbWFnZSIsImltYWdlSWQiLCJkZWxldGVDdXN0b21JbWFnZSIsImRlbGV0ZSIsInZhbGlkSW1hZ2VOYW1lIiwiaW1hZ2VUYWciLCJjcmVhdGVCYXNlSW1hZ2UiLCJpbWFnZUluZm8iLCJkZWxldGVCYXNlSW1hZ2UiLCJnZXRFeGNsdXNpdmVJbWFnZXMiLCJ0eXBlIiwiaW1hZ2VTZXJ2aWNlIiwiZGVmZXJyZWQiLCJkZWZlciIsIm9wZW5EZWxldGUiLCJ0aGVuIiwicmVzb2x2ZSIsInJlamVjdCIsIm9wZW5XYXJuaW5nIiwicHJvbWlzZSIsIk1pcnJvciIsImNvbmZpZyIsImF1dG9DdXN0b20iLCJkZXNjcmlwdGlvbiIsImRvY2tlcmZpbGVDb250ZW50IiwiZmlsZXMiLCJmaWxlTmFtZSIsImZpbGVQYXRoIiwiY29udGVudCIsImVudlNldHRpbmdzIiwia2V5IiwidmFsdWUiLCJzb3VyY2VJbWFnZSIsInRoaXJkUGFydHkiLCJyZWdpc3RyeVVybCIsInB1Ymxpc2giLCJwdXNoIiwiaXRlbSIsImluZGV4Iiwic3BsaWNlIiwiZ2V0TWlycm9ySW5zdGFuY2UiLCJpbnMi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InNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBAYXV0aG9yICBDaGFuZHJhTGVlXG4gKiBAZGVzY3JpcHRpb24gIOmVnOWDj+aooeWdl1xuICovXG5cbigod2luZG93LCB1bmRlZmluZWQpID0+IHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgbGV0IGltYWdlTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ2ltYWdlTW9kdWxlJywgW10pO1xuXG4gICAgZnVuY3Rpb24gZG9tZUltYWdlKCRodHRwLCAkcSwgJGRvbWVQdWJsaWMpIHtcblxuICAgICAgICBmdW5jdGlvbiBJbWFnZVNlcnZpY2UoKSB7XG4gICAgICAgICAgICB0aGlzLl91cmwgPSAnL2FwaS9pbWFnZSc7XG4gICAgICAgICAgICB0aGlzLmdldEJhc2VJbWFnZXMgPSAoKSA9PiAkaHR0cC5nZXQoYCR7dGhpcy5fdXJsfS9iYXNlYCk7XG4gICAgICAgICAgICB0aGlzLmdldFByb2plY3RJbWFnZXMgPSAoKSA9PiAkaHR0cC5nZXQodGhpcy5fdXJsKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0QWxsSW1hZ2VzID0gKCkgPT4gJGh0dHAuZ2V0KGAke3RoaXMuX3VybH0vYWxsYCk7XG4gICAgICAgICAgICB0aGlzLmdldEltYWdlSW5mbyA9IChpbWFnZU5hbWUpID0+ICRodHRwLmdldChgJHt0aGlzLl91cmx9L2FsbC9kZXRhaWw/bmFtZT0ke2ltYWdlTmFtZX1gKTtcbiAgICAgICAgICAgIC8v6aG555uu6ZWc5YOP5ZKM5Z+656GA6ZWc5YOP55qEdGFnXG4gICAgICAgICAgICB0aGlzLmdldEltYWdlVGFncyA9IChwcm9qZWN0TmFtZSwgcmVnaXN0cnkpID0+ICRodHRwLmdldChgJHt0aGlzLl91cmx9L2RldGFpbD9uYW1lPSR7cHJvamVjdE5hbWV9JnJlZ2lzdHJ5PSR7cmVnaXN0cnl9YCk7XG4gICAgICAgICAgICB0aGlzLmdldEN1c3RvbUltYWdlcyA9ICgpID0+ICRodHRwLmdldChgJHt0aGlzLl91cmx9L2N1c3RvbWApO1xuICAgICAgICAgICAgdGhpcy5nZXRDdXN0b21JbWFnZUluZm8gPSAoaWQpID0+ICRodHRwLmdldChgJHt0aGlzLl91cmx9L2N1c3RvbS8ke2lkfWApO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDdXN0b21JbWFnZSA9IChtaXJyb3JJbmZvKSA9PiAkaHR0cC5wb3N0KGAke3RoaXMuX3VybH0vY3VzdG9tYCwgYW5ndWxhci50b0pzb24obWlycm9ySW5mbykpO1xuICAgICAgICAgICAgdGhpcy5idWlsZEN1c3RvbUltYWdlID0gKGltYWdlSWQpID0+ICRodHRwLnBvc3QoYCR7dGhpcy5fdXJsfS9jdXN0b20vYnVpbGQvJHtpbWFnZUlkfWApO1xuICAgICAgICAgICAgdGhpcy5kZWxldGVDdXN0b21JbWFnZSA9IChpbWFnZUlkKSA9PiAkaHR0cC5kZWxldGUoYCR7dGhpcy5fdXJsfS9jdXN0b20vJHtpbWFnZUlkfWApO1xuICAgICAgICAgICAgdGhpcy52YWxpZEltYWdlTmFtZSA9IChpbWFnZU5hbWUsIGltYWdlVGFnKSA9PiAkaHR0cC5wb3N0KGAke3RoaXMuX3VybH0vY3VzdG9tL3ZhbGlkYXRlP2ltYWdlTmFtZT0ke2ltYWdlTmFtZX0maW1hZ2VUYWc9JHtpbWFnZVRhZ31gKTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQmFzZUltYWdlID0gKGltYWdlSW5mbykgPT4gJGh0dHAucG9zdChgJHt0aGlzLl91cmx9L2Jhc2VgLCBhbmd1bGFyLnRvSnNvbihpbWFnZUluZm8pKTtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlQmFzZUltYWdlID0gKGltYWdlSWQpID0+ICRodHRwLmRlbGV0ZShgJHt0aGlzLl91cmx9L2Jhc2UvJHtpbWFnZUlkfWApO1xuICAgICAgICAgICAgLy8gQHBhcmFtIHR5cGU6ICdqYXZhJ1xuICAgICAgICAgICAgdGhpcy5nZXRFeGNsdXNpdmVJbWFnZXMgPSAodHlwZSkgPT4gJGh0dHAuZ2V0KGAke3RoaXMuX3VybH0vZXhjbHVzaXZlLyR7dHlwZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbWFnZVNlcnZpY2UgPSBuZXcgSW1hZ2VTZXJ2aWNlKCk7XG5cbiAgICAgICAgLy8g5Yig6Zmk5Z+656GA6ZWc5YOPXG4gICAgICAgIGNvbnN0IGRlbGV0ZUJhc2VJbWFnZSA9IChpbWFnZUlkKSA9PiB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlbkRlbGV0ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGltYWdlU2VydmljZS5kZWxldGVCYXNlSW1hZ2UoaW1hZ2VJZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5Yig6Zmk5aSx6LSl77yBJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuICAgICAgICBjbGFzcyBNaXJyb3Ige1xuICAgICAgICAgICAgaW5pdCgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYXV0b0N1c3RvbTogMCxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VOYW1lOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VUYWc6ICcnLFxuXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcblxuICAgICAgICAgICAgICAgICAgICBkb2NrZXJmaWxlQ29udGVudDogJycsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJydcbiAgICAgICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgICAgIGVudlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xuICAgICAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlSW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXJkUGFydHk6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZU5hbWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VUYWc6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cnlVcmw6ICcnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHB1Ymxpc2g6IDFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkRW52Q29uZkRlZmF1bHQoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZW52U2V0dGluZ3MucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVBcnJJdGVtKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWdbaXRlbV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWRkRmlsZURlZmF1bHQoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZmlsZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2xlYXJGaWxlV3JpdGUoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5maWxlc1tpbmRleF0uY29udGVudCA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBnZXRNaXJyb3JJbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnMgPSBuZXcgTWlycm9yKCk7XG4gICAgICAgICAgICBpbnMuaW5pdCgpO1xuICAgICAgICAgICAgcmV0dXJuIGlucztcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGltYWdlU2VydmljZTogaW1hZ2VTZXJ2aWNlLFxuICAgICAgICAgICAgTWlycm9yOiBNaXJyb3IsXG4gICAgICAgICAgICBkZWxldGVCYXNlSW1hZ2U6IGRlbGV0ZUJhc2VJbWFnZSxcbiAgICAgICAgICAgIGdldE1pcnJvckluc3RhbmNlOiBnZXRNaXJyb3JJbnN0YW5jZVxuICAgICAgICB9O1xuICAgIH1cbiAgICBkb21lSW1hZ2UuJGluamVjdCA9IFsnJGh0dHAnLCAnJHEnLCAnJGRvbWVQdWJsaWMnXTtcbiAgICBpbWFnZU1vZHVsZS5mYWN0b3J5KCckZG9tZUltYWdlJywgZG9tZUltYWdlKTtcbiAgICB3aW5kb3cuaW1hZ2VNb2R1bGUgPSBpbWFnZU1vZHVsZTtcbn0pKHdpbmRvdyk7Il19
