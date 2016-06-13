'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9pbWFnZU1vZHVsZS9pbWFnZU1vZHVsZS5lcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxDQUFDLFVBQUMsTUFBRCxFQUFTLFNBQVQsRUFBdUI7QUFDcEIsaUJBRG9COztBQUVwQixRQUFJLGNBQWMsUUFBUSxNQUFSLENBQWUsYUFBZixFQUE4QixFQUE5QixDQUFkLENBRmdCOztBQUlwQixhQUFTLFNBQVQsQ0FBbUIsS0FBbkIsRUFBMEIsRUFBMUIsRUFBOEIsV0FBOUIsRUFBMkM7O0FBRXZDLGlCQUFTLFlBQVQsR0FBd0I7OztBQUNwQixpQkFBSyxJQUFMLEdBQVksWUFBWixDQURvQjtBQUVwQixpQkFBSyxhQUFMLEdBQXFCO3VCQUFNLE1BQU0sR0FBTixDQUFhLE1BQUssSUFBTCxVQUFiO2FBQU4sQ0FGRDtBQUdwQixpQkFBSyxnQkFBTCxHQUF3Qjt1QkFBTSxNQUFNLEdBQU4sQ0FBVSxNQUFLLElBQUw7YUFBaEIsQ0FISjtBQUlwQixpQkFBSyxZQUFMLEdBQW9CO3VCQUFNLE1BQU0sR0FBTixDQUFhLE1BQUssSUFBTCxTQUFiO2FBQU4sQ0FKQTtBQUtwQixpQkFBSyxZQUFMLEdBQW9CLFVBQUMsU0FBRDt1QkFBZSxNQUFNLEdBQU4sQ0FBYSxNQUFLLElBQUwseUJBQTZCLFNBQTFDO2FBQWY7O0FBTEEsZ0JBT3BCLENBQUssWUFBTCxHQUFvQixVQUFDLFdBQUQsRUFBYyxRQUFkO3VCQUEyQixNQUFNLEdBQU4sQ0FBYSxNQUFLLElBQUwscUJBQXlCLDZCQUF3QixRQUE5RDthQUEzQixDQVBBO0FBUXBCLGlCQUFLLGVBQUwsR0FBdUI7dUJBQU0sTUFBTSxHQUFOLENBQWEsTUFBSyxJQUFMLFlBQWI7YUFBTixDQVJIO0FBU3BCLGlCQUFLLGtCQUFMLEdBQTBCLFVBQUMsRUFBRDt1QkFBUSxNQUFNLEdBQU4sQ0FBYSxNQUFLLElBQUwsZ0JBQW9CLEVBQWpDO2FBQVIsQ0FUTjtBQVVwQixpQkFBSyxpQkFBTCxHQUF5QixVQUFD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QkFBSyxNQUFMLENBQVksS0FBWixDQUFrQixLQUFsQixFQUF5QixPQUF6QixHQUFtQyxFQUFuQyxDQURrQjs7OzttQkEvQ3BCO1lBdENpQzs7QUF5RnZDLFlBQUksb0JBQW9CLFNBQXBCLGlCQUFvQixHQUFZO0FBQ2hDLGdCQUFJLE1BQU0sSUFBSSxNQUFKLEVBQU4sQ0FENEI7QUFFaEMsZ0JBQUksSUFBSixHQUZnQztBQUdoQyxtQkFBTyxHQUFQLENBSGdDO1NBQVosQ0F6RmU7QUE4RnZDLGVBQU87QUFDSCwwQkFBYyxZQUFkO0FBQ0Esb0JBQVEsTUFBUjtBQUNBLDZCQUFpQixlQUFqQjtBQUNBLCtCQUFtQixpQkFBbkI7U0FKSixDQTlGdUM7S0FBM0M7QUFxR0EsY0FBVSxPQUFWLEdBQW9CLENBQUMsT0FBRCxFQUFVLElBQVYsRUFBZ0IsYUFBaEIsQ0FBcEIsQ0F6R29CO0FBMEdwQixnQkFBWSxPQUFaLENBQW9CLFlBQXBCLEVBQWtDLFNBQWxDLEVBMUdvQjtBQTJHcEIsV0FBTyxXQUFQLEdBQXFCLFdBQXJCLENBM0dvQjtDQUF2QixDQUFELENBNEdHLE1BNUdIIiwiZmlsZSI6ImNvbW1vbi9pbWFnZU1vZHVsZS9pbWFnZU1vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIigod2luZG93LCB1bmRlZmluZWQpID0+IHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgbGV0IGltYWdlTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ2ltYWdlTW9kdWxlJywgW10pO1xuXG4gICAgZnVuY3Rpb24gZG9tZUltYWdlKCRodHRwLCAkcSwgJGRvbWVQdWJsaWMpIHtcblxuICAgICAgICBmdW5jdGlvbiBJbWFnZVNlcnZpY2UoKSB7XG4gICAgICAgICAgICB0aGlzLl91cmwgPSAnL2FwaS9pbWFnZSc7XG4gICAgICAgICAgICB0aGlzLmdldEJhc2VJbWFnZXMgPSAoKSA9PiAkaHR0cC5nZXQoYCR7dGhpcy5fdXJsfS9iYXNlYCk7XG4gICAgICAgICAgICB0aGlzLmdldFByb2plY3RJbWFnZXMgPSAoKSA9PiAkaHR0cC5nZXQodGhpcy5fdXJsKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0QWxsSW1hZ2VzID0gKCkgPT4gJGh0dHAuZ2V0KGAke3RoaXMuX3VybH0vYWxsYCk7XG4gICAgICAgICAgICB0aGlzLmdldEltYWdlSW5mbyA9IChpbWFnZU5hbWUpID0+ICRodHRwLmdldChgJHt0aGlzLl91cmx9L2FsbC9kZXRhaWw/bmFtZT0ke2ltYWdlTmFtZX1gKTtcbiAgICAgICAgICAgIC8v6aG555uu6ZWc5YOP5ZKM5Z+656GA6ZWc5YOP55qEdGFnXG4gICAgICAgICAgICB0aGlzLmdldEltYWdlVGFncyA9IChwcm9qZWN0TmFtZSwgcmVnaXN0cnkpID0+ICRodHRwLmdldChgJHt0aGlzLl91cmx9L2RldGFpbD9uYW1lPSR7cHJvamVjdE5hbWV9JnJlZ2lzdHJ5PSR7cmVnaXN0cnl9YCk7XG4gICAgICAgICAgICB0aGlzLmdldEN1c3RvbUltYWdlcyA9ICgpID0+ICRodHRwLmdldChgJHt0aGlzLl91cmx9L2N1c3RvbWApO1xuICAgICAgICAgICAgdGhpcy5nZXRDdXN0b21JbWFnZUluZm8gPSAoaWQpID0+ICRodHRwLmdldChgJHt0aGlzLl91cmx9L2N1c3RvbS8ke2lkfWApO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDdXN0b21JbWFnZSA9IChtaXJyb3JJbmZvKSA9PiAkaHR0cC5wb3N0KGAke3RoaXMuX3VybH0vY3VzdG9tYCwgYW5ndWxhci50b0pzb24obWlycm9ySW5mbykpO1xuICAgICAgICAgICAgdGhpcy5idWlsZEN1c3RvbUltYWdlID0gKGltYWdlSWQpID0+ICRodHRwLnBvc3QoYCR7dGhpcy5fdXJsfS9jdXN0b20vYnVpbGQvJHtpbWFnZUlkfWApO1xuICAgICAgICAgICAgdGhpcy5kZWxldGVDdXN0b21JbWFnZSA9IChpbWFnZUlkKSA9PiAkaHR0cC5kZWxldGUoYCR7dGhpcy5fdXJsfS9jdXN0b20vJHtpbWFnZUlkfWApO1xuICAgICAgICAgICAgdGhpcy52YWxpZEltYWdlTmFtZSA9IChpbWFnZU5hbWUsIGltYWdlVGFnKSA9PiAkaHR0cC5wb3N0KGAke3RoaXMuX3VybH0vY3VzdG9tL3ZhbGlkYXRlP2ltYWdlTmFtZT0ke2ltYWdlTmFtZX0maW1hZ2VUYWc9JHtpbWFnZVRhZ31gKTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQmFzZUltYWdlID0gKGltYWdlSW5mbykgPT4gJGh0dHAucG9zdChgJHt0aGlzLl91cmx9L2Jhc2VgLCBhbmd1bGFyLnRvSnNvbihpbWFnZUluZm8pKTtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlQmFzZUltYWdlID0gKGltYWdlSWQpID0+ICRodHRwLmRlbGV0ZShgJHt0aGlzLl91cmx9L2Jhc2UvJHtpbWFnZUlkfWApO1xuICAgICAgICAgICAgLy8gQHBhcmFtIHR5cGU6ICdqYXZhJ1xuICAgICAgICAgICAgdGhpcy5nZXRFeGNsdXNpdmVJbWFnZXMgPSAodHlwZSkgPT4gJGh0dHAuZ2V0KGAke3RoaXMuX3VybH0vZXhjbHVzaXZlLyR7dHlwZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbWFnZVNlcnZpY2UgPSBuZXcgSW1hZ2VTZXJ2aWNlKCk7XG5cbiAgICAgICAgLy8g5Yig6Zmk5Z+656GA6ZWc5YOPXG4gICAgICAgIGNvbnN0IGRlbGV0ZUJhc2VJbWFnZSA9IChpbWFnZUlkKSA9PiB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlbkRlbGV0ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGltYWdlU2VydmljZS5kZWxldGVCYXNlSW1hZ2UoaW1hZ2VJZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZygn5Yig6Zmk5aSx6LSl77yBJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuICAgICAgICBjbGFzcyBNaXJyb3Ige1xuICAgICAgICAgICAgaW5pdCgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYXV0b0N1c3RvbTogMCxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VOYW1lOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VUYWc6ICcnLFxuXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcblxuICAgICAgICAgICAgICAgICAgICBkb2NrZXJmaWxlQ29udGVudDogJycsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJydcbiAgICAgICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgICAgIGVudlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xuICAgICAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlSW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXJkUGFydHk6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZU5hbWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VUYWc6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cnlVcmw6ICcnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHB1Ymxpc2g6IDFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkRW52Q29uZkRlZmF1bHQoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZW52U2V0dGluZ3MucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVBcnJJdGVtKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWdbaXRlbV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWRkRmlsZURlZmF1bHQoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZmlsZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2xlYXJGaWxlV3JpdGUoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5maWxlc1tpbmRleF0uY29udGVudCA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBnZXRNaXJyb3JJbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnMgPSBuZXcgTWlycm9yKCk7XG4gICAgICAgICAgICBpbnMuaW5pdCgpO1xuICAgICAgICAgICAgcmV0dXJuIGlucztcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGltYWdlU2VydmljZTogaW1hZ2VTZXJ2aWNlLFxuICAgICAgICAgICAgTWlycm9yOiBNaXJyb3IsXG4gICAgICAgICAgICBkZWxldGVCYXNlSW1hZ2U6IGRlbGV0ZUJhc2VJbWFnZSxcbiAgICAgICAgICAgIGdldE1pcnJvckluc3RhbmNlOiBnZXRNaXJyb3JJbnN0YW5jZVxuICAgICAgICB9O1xuICAgIH1cbiAgICBkb21lSW1hZ2UuJGluamVjdCA9IFsnJGh0dHAnLCAnJHEnLCAnJGRvbWVQdWJsaWMnXTtcbiAgICBpbWFnZU1vZHVsZS5mYWN0b3J5KCckZG9tZUltYWdlJywgZG9tZUltYWdlKTtcbiAgICB3aW5kb3cuaW1hZ2VNb2R1bGUgPSBpbWFnZU1vZHVsZTtcbn0pKHdpbmRvdyk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
