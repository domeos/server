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
            // image collection
            this.getCollectionImages = function (imageNameDetail) {
                return $http.post(_this._url + '/all/detail', angular.toJson(imageNameDetail));
            };
            this.deletePrivateImage = function (name, tag, registry) {
                return $http.delete(_this._url + '/all/detail/tag?name=' + name + '&tag=' + tag + '&registry=' + registry);
            };
            this.getTagDetail = function (imageTagDetailRequest) {
                return $http.post(_this._url + '/all/detail/tag', angular.toJson(imageTagDetailRequest));
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
                    $domePublic.openWarning({
                        title: '删除失败！',
                        msg: res.data.resultMsg
                    });
                });
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        };
        // 删除私有仓库镜像
        var deletePrivateImage = function deletePrivateImage(name, tag, registry) {
            var deferred = $q.defer();
            $domePublic.openDelete('该镜像名下，image id相同的所有版本都会被删除，请慎重操作').then(function () {
                imageService.deletePrivateImage(name, tag, registry).then(function () {
                    deferred.resolve();
                }, function (res) {
                    deferred.reject();
                    $domePublic.openWarning({
                        title: '删除失败！',
                        msg: res.data.errors.message + res.data.resultMsg
                    });
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
            getMirrorInstance: getMirrorInstance,
            deletePrivateImage: deletePrivateImage
        };
    }
    domeImage.$inject = ['$http', '$q', '$domePublic'];
    imageModule.factory('$domeImage', domeImage);
    window.imageModule = imageModule;
})(window);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9pbWFnZU1vZHVsZS9pbWFnZU1vZHVsZS5lcyJdLCJuYW1lcyI6WyJ3aW5kb3ciLCJ1bmRlZmluZWQiLCJpbWFnZU1vZHVsZSIsImFuZ3VsYXIiLCJtb2R1bGUiLCJkb21lSW1hZ2UiLCIkaHR0cCIsIiRxIiwiJGRvbWVQdWJsaWMiLCJJbWFnZVNlcnZpY2UiLCJfdXJsIiwiZ2V0QmFzZUltYWdlcyIsImdldCIsImdldFByb2plY3RJbWFnZXMiLCJnZXRBbGxJbWFnZXMiLCJnZXRJbWFnZUluZm8iLCJpbWFnZU5hbWUiLCJnZXRJbWFnZVRhZ3MiLCJwcm9qZWN0TmFtZSIsInJlZ2lzdHJ5IiwiZ2V0Q3VzdG9tSW1hZ2VzIiwiZ2V0Q3VzdG9tSW1hZ2VJbmZvIiwiaWQiLCJjcmVhdGVDdXN0b21JbWFnZSIsIm1pcnJvckluZm8iLCJwb3N0IiwidG9Kc29uIiwiYnVpbGRDdXN0b21JbWFnZSIsImltYWdlSWQiLCJkZWxldGVDdXN0b21JbWFnZSIsImRlbGV0ZSIsInZhbGlkSW1hZ2VOYW1lIiwiaW1hZ2VUYWciLCJjcmVhdGVCYXNlSW1hZ2UiLCJpbWFnZUluZm8iLCJkZWxldGVCYXNlSW1hZ2UiLCJnZXRFeGNsdXNpdmVJbWFnZXMiLCJ0eXBlIiwiZ2V0Q29sbGVjdGlvbkltYWdlcyIsImltYWdlTmFtZURldGFpbCIsImRlbGV0ZVByaXZhdGVJbWFnZSIsIm5hbWUiLCJ0YWciLCJnZXRUYWdEZXRhaWwiLCJpbWFnZVRhZ0RldGFpbFJlcXVlc3QiLCJpbWFnZVNlcnZpY2UiLCJkZWZlcnJlZCIsImRlZmVyIiwib3BlbkRlbGV0ZSIsInRoZW4iLCJyZXNvbHZlIiwicmVqZWN0Iiwib3Blbldhcm5pbmciLCJ0aXRsZSIsIm1zZyIsInJlcyIsImRhdGEiLCJyZXN1bHRNc2ciLCJwcm9taXNlIiwiZXJyb3JzIiwibWVzc2FnZSIsIk1pcnJvciIsImNvbmZpZyIsImF1dG9DdXN0b20iLCJkZXNjcmlwdGlvbiIsImRvY2tlcmZpbGVDb250ZW50IiwiZmlsZXMiLCJmaWxlTmFtZSIsImZpbGVQYXRoIiwiY29udGVudCIsImVudlNldHRpbmdzIiwia2V5IiwidmFsdWUiLCJzb3VyY2VJbWFnZSIsInRoaXJkUGFydHkiLCJyZWdpc3RyeVVybCIsInB1Ymxpc2giLCJwdXNoIiwiaXRlbSIsImluZGV4Iiwic3BsaWNlIiwiZ2V0TWlycm9ySW5zdGFuY2UiLCJpbnMiLCJpbml0IiwiJGluamVjdCIsImZhY3RvcnkiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7OztBQUtBLENBQUMsVUFBQ0EsTUFBRCxFQUFTQyxTQUFULEVBQXVCO0FBQ3BCOztBQUNBLFFBQUlDLGNBQWNDLFFBQVFDLE1BQVIsQ0FBZSxhQUFmLEVBQThCLEVBQTlCLENBQWxCOztBQUVBLGFBQVNDLFNBQVQsQ0FBbUJDLEtBQW5CLEVBQTBCQyxFQUExQixFQUE4QkMsV0FBOUIsRUFBMkM7O0FBRXZDLGlCQUFTQyxZQUFULEdBQXdCO0FBQUE7O0FBQ3BCLGlCQUFLQyxJQUFMLEdBQVksWUFBWjtBQUNBLGlCQUFLQyxhQUFMLEdBQXFCO0FBQUEsdUJBQU1MLE1BQU1NLEdBQU4sQ0FBYSxNQUFLRixJQUFsQixXQUFOO0FBQUEsYUFBckI7QUFDQSxpQkFBS0csZ0JBQUwsR0FBd0I7QUFBQSx1QkFBTVAsTUFBTU0sR0FBTixDQUFVLE1BQUtGLElBQWYsQ0FBTjtBQUFBLGFBQXhCO0FBQ0EsaUJBQUtJLFlBQUwsR0FBb0I7QUFBQSx1QkFBTVIsTUFBTU0sR0FBTixDQUFhLE1BQUtGLElBQWxCLFVBQU47QUFBQSxhQUFwQjtBQUNBLGlCQUFLSyxZQUFMLEdBQW9CLFVBQUNDLFNBQUQ7QUFBQSx1QkFBZVYsTUFBTU0sR0FBTixDQUFhLE1BQUtGLElBQWxCLHlCQUEwQ00sU0FBMUMsQ0FBZjtBQUFBLGFBQXBCO0FBQ0E7QUFDQSxpQkFBS0MsWUFBTCxHQUFvQixVQUFDQyxXQUFELEVBQWNDLFFBQWQ7QUFBQSx1QkFBMkJiLE1BQU1NLEdBQU4sQ0FBYSxNQUFLRixJQUFsQixxQkFBc0NRLFdBQXRDLGtCQUE4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O0FBQ0gsU0FKRDtBQUtBLGVBQU87QUFDSHJDLDBCQUFjQSxZQURYO0FBRUhnQixvQkFBUUEsTUFGTDtBQUdIMUIsNkJBQWlCQSxlQUhkO0FBSUg4QywrQkFBbUJBLGlCQUpoQjtBQUtIekMsZ0NBQW9CQTtBQUxqQixTQUFQO0FBT0g7QUFDRG5DLGNBQVUrRSxPQUFWLEdBQW9CLENBQUMsT0FBRCxFQUFVLElBQVYsRUFBZ0IsYUFBaEIsQ0FBcEI7QUFDQWxGLGdCQUFZbUYsT0FBWixDQUFvQixZQUFwQixFQUFrQ2hGLFNBQWxDO0FBQ0FMLFdBQU9FLFdBQVAsR0FBcUJBLFdBQXJCO0FBQ0gsQ0F0SUQsRUFzSUdGLE1BdElIIiwiZmlsZSI6ImNvbW1vbi9pbWFnZU1vZHVsZS9pbWFnZU1vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBAYXV0aG9yICBDaGFuZHJhTGVlXG4gKiBAZGVzY3JpcHRpb24gIOmVnOWDj+aooeWdl1xuICovXG5cbigod2luZG93LCB1bmRlZmluZWQpID0+IHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgbGV0IGltYWdlTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ2ltYWdlTW9kdWxlJywgW10pO1xuXG4gICAgZnVuY3Rpb24gZG9tZUltYWdlKCRodHRwLCAkcSwgJGRvbWVQdWJsaWMpIHtcblxuICAgICAgICBmdW5jdGlvbiBJbWFnZVNlcnZpY2UoKSB7XG4gICAgICAgICAgICB0aGlzLl91cmwgPSAnL2FwaS9pbWFnZSc7XG4gICAgICAgICAgICB0aGlzLmdldEJhc2VJbWFnZXMgPSAoKSA9PiAkaHR0cC5nZXQoYCR7dGhpcy5fdXJsfS9iYXNlYCk7XG4gICAgICAgICAgICB0aGlzLmdldFByb2plY3RJbWFnZXMgPSAoKSA9PiAkaHR0cC5nZXQodGhpcy5fdXJsKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0QWxsSW1hZ2VzID0gKCkgPT4gJGh0dHAuZ2V0KGAke3RoaXMuX3VybH0vYWxsYCk7XG4gICAgICAgICAgICB0aGlzLmdldEltYWdlSW5mbyA9IChpbWFnZU5hbWUpID0+ICRodHRwLmdldChgJHt0aGlzLl91cmx9L2FsbC9kZXRhaWw/bmFtZT0ke2ltYWdlTmFtZX1gKTtcbiAgICAgICAgICAgIC8v6aG555uu6ZWc5YOP5ZKM5Z+656GA6ZWc5YOP55qEdGFnXG4gICAgICAgICAgICB0aGlzLmdldEltYWdlVGFncyA9IChwcm9qZWN0TmFtZSwgcmVnaXN0cnkpID0+ICRodHRwLmdldChgJHt0aGlzLl91cmx9L2RldGFpbD9uYW1lPSR7cHJvamVjdE5hbWV9JnJlZ2lzdHJ5PSR7cmVnaXN0cnl9YCk7XG4gICAgICAgICAgICB0aGlzLmdldEN1c3RvbUltYWdlcyA9ICgpID0+ICRodHRwLmdldChgJHt0aGlzLl91cmx9L2N1c3RvbWApO1xuICAgICAgICAgICAgdGhpcy5nZXRDdXN0b21JbWFnZUluZm8gPSAoaWQpID0+ICRodHRwLmdldChgJHt0aGlzLl91cmx9L2N1c3RvbS8ke2lkfWApO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDdXN0b21JbWFnZSA9IChtaXJyb3JJbmZvKSA9PiAkaHR0cC5wb3N0KGAke3RoaXMuX3VybH0vY3VzdG9tYCwgYW5ndWxhci50b0pzb24obWlycm9ySW5mbykpO1xuICAgICAgICAgICAgdGhpcy5idWlsZEN1c3RvbUltYWdlID0gKGltYWdlSWQpID0+ICRodHRwLnBvc3QoYCR7dGhpcy5fdXJsfS9jdXN0b20vYnVpbGQvJHtpbWFnZUlkfWApO1xuICAgICAgICAgICAgdGhpcy5kZWxldGVDdXN0b21JbWFnZSA9IChpbWFnZUlkKSA9PiAkaHR0cC5kZWxldGUoYCR7dGhpcy5fdXJsfS9jdXN0b20vJHtpbWFnZUlkfWApO1xuICAgICAgICAgICAgdGhpcy52YWxpZEltYWdlTmFtZSA9IChpbWFnZU5hbWUsIGltYWdlVGFnKSA9PiAkaHR0cC5wb3N0KGAke3RoaXMuX3VybH0vY3VzdG9tL3ZhbGlkYXRlP2ltYWdlTmFtZT0ke2ltYWdlTmFtZX0maW1hZ2VUYWc9JHtpbWFnZVRhZ31gKTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQmFzZUltYWdlID0gKGltYWdlSW5mbykgPT4gJGh0dHAucG9zdChgJHt0aGlzLl91cmx9L2Jhc2VgLCBhbmd1bGFyLnRvSnNvbihpbWFnZUluZm8pKTtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlQmFzZUltYWdlID0gKGltYWdlSWQpID0+ICRodHRwLmRlbGV0ZShgJHt0aGlzLl91cmx9L2Jhc2UvJHtpbWFnZUlkfWApO1xuICAgICAgICAgICAgLy8gQHBhcmFtIHR5cGU6ICdqYXZhJ1xuICAgICAgICAgICAgdGhpcy5nZXRFeGNsdXNpdmVJbWFnZXMgPSAodHlwZSkgPT4gJGh0dHAuZ2V0KGAke3RoaXMuX3VybH0vZXhjbHVzaXZlLyR7dHlwZX1gKTtcbiAgICAgICAgICAgIC8vIGltYWdlIGNvbGxlY3Rpb25cbiAgICAgICAgICAgIHRoaXMuZ2V0Q29sbGVjdGlvbkltYWdlcyA9IChpbWFnZU5hbWVEZXRhaWwpID0+ICRodHRwLnBvc3QoYCR7dGhpcy5fdXJsfS9hbGwvZGV0YWlsYCwgYW5ndWxhci50b0pzb24oaW1hZ2VOYW1lRGV0YWlsKSk7XG4gICAgICAgICAgICB0aGlzLmRlbGV0ZVByaXZhdGVJbWFnZSA9IChuYW1lLCB0YWcsIHJlZ2lzdHJ5KSA9PiAkaHR0cC5kZWxldGUoYCR7dGhpcy5fdXJsfS9hbGwvZGV0YWlsL3RhZz9uYW1lPSR7bmFtZX0mdGFnPSR7dGFnfSZyZWdpc3RyeT0ke3JlZ2lzdHJ5fWApO1xuICAgICAgICAgICAgdGhpcy5nZXRUYWdEZXRhaWwgPSAoaW1hZ2VUYWdEZXRhaWxSZXF1ZXN0KSA9PiAkaHR0cC5wb3N0KGAke3RoaXMuX3VybH0vYWxsL2RldGFpbC90YWdgLCBhbmd1bGFyLnRvSnNvbihpbWFnZVRhZ0RldGFpbFJlcXVlc3QpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbWFnZVNlcnZpY2UgPSBuZXcgSW1hZ2VTZXJ2aWNlKCk7XG5cbiAgICAgICAgLy8g5Yig6Zmk5Z+656GA6ZWc5YOPXG4gICAgICAgIGNvbnN0IGRlbGV0ZUJhc2VJbWFnZSA9IChpbWFnZUlkKSA9PiB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlbkRlbGV0ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGltYWdlU2VydmljZS5kZWxldGVCYXNlSW1hZ2UoaW1hZ2VJZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+WIoOmZpOWksei0pe+8gScsXG4gICAgICAgICAgICAgICAgICAgICAgICBtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG4gICAgICAgIC8vIOWIoOmZpOengeacieS7k+W6k+mVnOWDj1xuICAgICAgICBjb25zdCBkZWxldGVQcml2YXRlSW1hZ2UgPSAobmFtZSwgdGFnLCByZWdpc3RyeSkgPT4ge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5EZWxldGUoJ+ivpemVnOWDj+WQjeS4i++8jGltYWdlIGlk55u45ZCM55qE5omA5pyJ54mI5pys6YO95Lya6KKr5Yig6Zmk77yM6K+35oWO6YeN5pON5L2cJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaW1hZ2VTZXJ2aWNlLmRlbGV0ZVByaXZhdGVJbWFnZShuYW1lLCB0YWcsIHJlZ2lzdHJ5KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0sIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5Yig6Zmk5aSx6LSl77yBJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEuZXJyb3JzLm1lc3NhZ2UgKyByZXMuZGF0YS5yZXN1bHRNc2dcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuICAgICAgICBjbGFzcyBNaXJyb3Ige1xuICAgICAgICAgICAgaW5pdCgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYXV0b0N1c3RvbTogMCxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VOYW1lOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VUYWc6ICcnLFxuXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcblxuICAgICAgICAgICAgICAgICAgICBkb2NrZXJmaWxlQ29udGVudDogJycsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJydcbiAgICAgICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgICAgIGVudlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xuICAgICAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlSW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXJkUGFydHk6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZU5hbWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VUYWc6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cnlVcmw6ICcnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHB1Ymxpc2g6IDFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkRW52Q29uZkRlZmF1bHQoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZW52U2V0dGluZ3MucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVBcnJJdGVtKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWdbaXRlbV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWRkRmlsZURlZmF1bHQoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZmlsZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2xlYXJGaWxlV3JpdGUoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5maWxlc1tpbmRleF0uY29udGVudCA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBnZXRNaXJyb3JJbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnMgPSBuZXcgTWlycm9yKCk7XG4gICAgICAgICAgICBpbnMuaW5pdCgpO1xuICAgICAgICAgICAgcmV0dXJuIGlucztcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGltYWdlU2VydmljZTogaW1hZ2VTZXJ2aWNlLFxuICAgICAgICAgICAgTWlycm9yOiBNaXJyb3IsXG4gICAgICAgICAgICBkZWxldGVCYXNlSW1hZ2U6IGRlbGV0ZUJhc2VJbWFnZSxcbiAgICAgICAgICAgIGdldE1pcnJvckluc3RhbmNlOiBnZXRNaXJyb3JJbnN0YW5jZSxcbiAgICAgICAgICAgIGRlbGV0ZVByaXZhdGVJbWFnZTogZGVsZXRlUHJpdmF0ZUltYWdlXG4gICAgICAgIH07XG4gICAgfVxuICAgIGRvbWVJbWFnZS4kaW5qZWN0ID0gWyckaHR0cCcsICckcScsICckZG9tZVB1YmxpYyddO1xuICAgIGltYWdlTW9kdWxlLmZhY3RvcnkoJyRkb21lSW1hZ2UnLCBkb21lSW1hZ2UpO1xuICAgIHdpbmRvdy5pbWFnZU1vZHVsZSA9IGltYWdlTW9kdWxlO1xufSkod2luZG93KTsiXX0=
