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
            $domePublic.openDelete().then(function () {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9pbWFnZU1vZHVsZS9pbWFnZU1vZHVsZS5lcyJdLCJuYW1lcyI6WyJ3aW5kb3ciLCJ1bmRlZmluZWQiLCJpbWFnZU1vZHVsZSIsImFuZ3VsYXIiLCJtb2R1bGUiLCJkb21lSW1hZ2UiLCIkaHR0cCIsIiRxIiwiJGRvbWVQdWJsaWMiLCJJbWFnZVNlcnZpY2UiLCJfdXJsIiwiZ2V0QmFzZUltYWdlcyIsImdldCIsImdldFByb2plY3RJbWFnZXMiLCJnZXRBbGxJbWFnZXMiLCJnZXRJbWFnZUluZm8iLCJpbWFnZU5hbWUiLCJnZXRJbWFnZVRhZ3MiLCJwcm9qZWN0TmFtZSIsInJlZ2lzdHJ5IiwiZ2V0Q3VzdG9tSW1hZ2VzIiwiZ2V0Q3VzdG9tSW1hZ2VJbmZvIiwiaWQiLCJjcmVhdGVDdXN0b21JbWFnZSIsIm1pcnJvckluZm8iLCJwb3N0IiwidG9Kc29uIiwiYnVpbGRDdXN0b21JbWFnZSIsImltYWdlSWQiLCJkZWxldGVDdXN0b21JbWFnZSIsImRlbGV0ZSIsInZhbGlkSW1hZ2VOYW1lIiwiaW1hZ2VUYWciLCJjcmVhdGVCYXNlSW1hZ2UiLCJpbWFnZUluZm8iLCJkZWxldGVCYXNlSW1hZ2UiLCJnZXRFeGNsdXNpdmVJbWFnZXMiLCJ0eXBlIiwiZ2V0Q29sbGVjdGlvbkltYWdlcyIsImltYWdlTmFtZURldGFpbCIsImRlbGV0ZVByaXZhdGVJbWFnZSIsIm5hbWUiLCJ0YWciLCJnZXRUYWdEZXRhaWwiLCJpbWFnZVRhZ0RldGFpbFJlcXVlc3QiLCJpbWFnZVNlcnZpY2UiLCJkZWZlcnJlZCIsImRlZmVyIiwib3BlbkRlbGV0ZSIsInRoZW4iLCJyZXNvbHZlIiwicmVqZWN0Iiwib3Blbldhcm5pbmciLCJ0aXRsZSIsIm1zZyIsInJlcyIsImRhdGEiLCJyZXN1bHRNc2ciLCJwcm9taXNlIiwiZXJyb3JzIiwibWVzc2FnZSIsIk1pcnJvciIsImNvbmZpZyIsImF1dG9DdXN0b20iLCJkZXNjcmlwdGlvbiIsImRvY2tlcmZpbGVDb250ZW50IiwiZmlsZXMiLCJmaWxlTmFtZSIsImZpbGVQYXRoIiwiY29udGVudCIsImVudlNldHRpbmdzIiwia2V5IiwidmFsdWUiLCJzb3VyY2VJbWFnZSIsInRoaXJkUGFydHkiLCJyZWdpc3RyeVVybCIsInB1Ymxpc2giLCJwdXNoIiwiaXRlbSIsImluZGV4Iiwic3BsaWNlIiwiZ2V0TWlycm9ySW5zdGFuY2UiLCJpbnMiLCJpbml0IiwiJGluamVjdCIsImZhY3RvcnkiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7OztBQUtBLENBQUMsVUFBQ0EsTUFBRCxFQUFTQyxTQUFULEVBQXVCO0FBQ3BCOztBQUNBLFFBQUlDLGNBQWNDLFFBQVFDLE1BQVIsQ0FBZSxhQUFmLEVBQThCLEVBQTlCLENBQWxCOztBQUVBLGFBQVNDLFNBQVQsQ0FBbUJDLEtBQW5CLEVBQTBCQyxFQUExQixFQUE4QkMsV0FBOUIsRUFBMkM7O0FBRXZDLGlCQUFTQyxZQUFULEdBQXdCO0FBQUE7O0FBQ3BCLGlCQUFLQyxJQUFMLEdBQVksWUFBWjtBQUNBLGlCQUFLQyxhQUFMLEdBQXFCO0FBQUEsdUJBQU1MLE1BQU1NLEdBQU4sQ0FBYSxNQUFLRixJQUFsQixXQUFOO0FBQUEsYUFBckI7QUFDQSxpQkFBS0csZ0JBQUwsR0FBd0I7QUFBQSx1QkFBTVAsTUFBTU0sR0FBTixDQUFVLE1BQUtGLElBQWYsQ0FBTjtBQUFBLGFBQXhCO0FBQ0EsaUJBQUtJLFlBQUwsR0FBb0I7QUFBQSx1QkFBTVIsTUFBTU0sR0FBTixDQUFhLE1BQUtGLElBQWxCLFVBQU47QUFBQSxhQUFwQjtBQUNBLGlCQUFLSyxZQUFMLEdBQW9CLFVBQUNDLFNBQUQ7QUFBQSx1QkFBZVYsTUFBTU0sR0FBTixDQUFhLE1BQUtGLElBQWxCLHlCQUEwQ00sU0FBMUMsQ0FBZjtBQUFBLGFBQXBCO0FBQ0E7QUFDQSxpQkFBS0MsWUFBTCxHQUFvQixVQUFDQyxXQUFELEVBQWNDLFFBQWQ7QUFBQSx1QkFBMkJiLE1BQU1NLEdBQU4sQ0FBYSxNQUFLRixJQUFsQixxQkFBc0NRLFdBQXRDLGtCQUE4REMsUUFBOUQsQ0FBM0I7QUFBQSxhQUFwQjtBQUNBLGlCQUFLQyxlQUFMLEdBQXVCO0FBQUEsdUJBQU1kLE1BQU1NLEdBQU4sQ0FBYSxNQUFLRixJQUFsQixhQUFOO0FBQUEsYUFBdkI7QUFDQSxpQkFBS1csa0JBQUwsR0FBMEIsVUFBQ0MsRUFBRDtBQUFBLHVCQUFRaEIsTUFBTU0sR0FBTixDQUFhLE1BQUtGLElBQWxCLGdCQUFpQ1ksRUFBakMsQ0FBUjtBQUFBLGFBQTFCO0FBQ0EsaUJBQUtDLGlCQUFMLEdBQXlCLFVBQUNDLFVBQUQ7QUFBQSx1QkFBZ0JsQixNQUFNbUIsSUFBTixDQUFjLE1BQUtmLElBQW5CLGNBQWtDUCxRQUFRdUIsTUFBUixDQUFlRixVQUFmLENBQWxDLENBQWhCO0FBQUEsYUFBekI7QUFDQSxpQkFBS0csZ0JBQUwsR0FBd0IsVUFBQ0MsT0FBRDtBQUFBLHVCQUFhdEIsTUFBTW1CLElBQU4sQ0FBYyxNQUFLZixJQUFuQixzQkFBd0NrQixPQUF4QyxDQUFiO0FBQUEsYUFBeEI7QUFDQSxpQkFBS0MsaUJBQUwsR0FBeUIsVUFBQ0QsT0FBRDtBQUFBLHVCQUFhdEIsTUFBTXdCLE1BQU4sQ0FBZ0IsTUFBS3BCLElBQXJCLGdCQUFvQ2tCLE9BQXBDLENBQWI7QUFBQSxhQUF6QjtBQUNBLGlCQUFLRyxjQUFMLEdBQXNCLFVBQUNmLFNBQUQsRUFBWWdCLFFBQVo7QUFBQSx1QkFBeUIxQixNQUFNbUIsSUFBTixDQUFjLE1BQUtmLElBQW5CLG1DQUFxRE0sU0FBckQsa0JBQTJFZ0IsUUFBM0UsQ0FBekI7QUFBQSxhQUF0QjtBQUNBLGlCQUFLQyxlQUFMLEdBQXVCLFVBQUNDLFNBQUQ7QUFBQSx1QkFBZTVCLE1BQU1tQixJQUFOLENBQWMsTUFBS2YsSUFBbkIsWUFBZ0NQLFFBQVF1QixNQUFSLENBQWVRLFNBQWYsQ0FBaEMsQ0FBZjtBQUFBLGFBQXZCO0FBQ0EsaUJBQUtDLGVBQUwsR0FBdUIsVUFBQ1AsT0FBRDtBQUFBLHVCQUFhdEIsTUFBTXdCLE1BQU4sQ0FBZ0IsTUFBS3BCLElBQXJCLGNBQWtDa0IsT0FBbEMsQ0FBYjtBQUFBLGFBQXZCO0FBQ0E7QUFDQSxpQkFBS1Esa0JBQUwsR0FBMEIsVUFBQ0MsSUFBRDtBQUFBLHVCQUFVL0IsTUFBTU0sR0FBTixDQUFhLE1BQUtGLElBQWxCLG1CQUFvQzJCLElBQXBDLENBQVY7QUFBQSxhQUExQjtBQUNBO0FBQ0EsaUJBQUtDLG1CQUFMLEdBQTJCLFVBQUNDLGVBQUQ7QUFBQSx1QkFBcUJqQyxNQUFNbUIsSUFBTixDQUFjLE1BQUtmLElBQW5CLGtCQUFzQ1AsUUFBUXVCLE1BQVIsQ0FBZWEsZUFBZixDQUF0QyxDQUFyQjtBQUFBLGFBQTNCO0FBQ0EsaUJBQUtDLGtCQUFMLEdBQTBCLFVBQUNDLElBQUQsRUFBT0MsR0FBUCxFQUFZdkIsUUFBWjtBQUFBLHVCQUF5QmIsTUFBTXdCLE1BQU4sQ0FBZ0IsTUFBS3BCLElBQXJCLDZCQUFpRCtCLElBQWpELGFBQTZEQyxHQUE3RCxrQkFBNkV2QixRQUE3RSxDQUF6QjtBQUFBLGFBQTFCO0FBQ0EsaUJBQUt3QixZQUFMLEdBQW9CLFVBQUNDLHFCQUFEO0FBQUEsdUJBQTJCdEMsTUFBTW1CLElBQU4sQ0FBYyxNQUFLZixJQUFuQixzQkFBMENQLFFBQVF1QixNQUFSLENBQWVrQixxQkFBZixDQUExQyxDQUEzQjtBQUFBLGFBQXBCO0FBQ0g7QUFDRCxZQUFNQyxlQUFlLElBQUlwQyxZQUFKLEVBQXJCOztBQUVBO0FBQ0EsWUFBTTBCLGtCQUFrQixTQUFsQkEsZUFBa0IsQ0FBQ1AsT0FBRCxFQUFhO0FBQ2pDLGdCQUFJa0IsV0FBV3ZDLEdBQUd3QyxLQUFILEVBQWY7QUFDQXZDLHdCQUFZd0MsVUFBWixHQUF5QkMsSUFBekIsQ0FBOEIsWUFBTTtBQUNoQ0osNkJBQWFWLGVBQWIsQ0FBNkJQLE9BQTdCLEVBQXNDcUIsSUFBdEMsQ0FBMkMsWUFBTTtBQUM3Q0gsNkJBQVNJLE9BQVQ7QUFDSCxpQkFGRCxFQUVHLFlBQU07QUFDTEosNkJBQVNLLE1BQVQ7QUFDQTNDLGdDQUFZNEMsV0FBWixDQUF3QjtBQUNwQkMsK0JBQU8sT0FEYTtBQUVwQkMsNkJBQUtDLElBQUlDLElBQUosQ0FBU0M7QUFGTSxxQkFBeEI7QUFJSCxpQkFSRDtBQVNILGFBVkQsRUFVRyxZQUFNO0FBQ0xYLHlCQUFTSyxNQUFUO0FBQ0gsYUFaRDtBQWFBLG1CQUFPTCxTQUFTWSxPQUFoQjtBQUNILFNBaEJEO0FBaUJBO0FBQ0EsWUFBTWxCLHFCQUFxQixTQUFyQkEsa0JBQXFCLENBQUNDLElBQUQsRUFBT0MsR0FBUCxFQUFZdkIsUUFBWixFQUF5QjtBQUNoRCxnQkFBSTJCLFdBQVd2QyxHQUFHd0MsS0FBSCxFQUFmO0FBQ0F2Qyx3QkFBWXdDLFVBQVosR0FBeUJDLElBQXpCLENBQThCLFlBQU07QUFDaENKLDZCQUFhTCxrQkFBYixDQUFnQ0MsSUFBaEMsRUFBc0NDLEdBQXRDLEVBQTJDdkIsUUFBM0MsRUFBcUQ4QixJQUFyRCxDQUEwRCxZQUFNO0FBQzVESCw2QkFBU0ksT0FBVDtBQUNILGlCQUZELEVBRUcsVUFBQ0ssR0FBRCxFQUFTO0FBQ1JULDZCQUFTSyxNQUFUO0FBQ0EzQyxnQ0FBWTRDLFdBQVosQ0FBd0I7QUFDcEJDLCtCQUFPLE9BRGE7QUFFcEJDLDZCQUFLQyxJQUFJQyxJQUFKLENBQVNHLE1BQVQsQ0FBZ0JDLE9BQWhCLEdBQTBCTCxJQUFJQyxJQUFKLENBQVNDO0FBRnBCLHFCQUF4QjtBQUlILGlCQVJEO0FBU0gsYUFWRCxFQVVHLFlBQU07QUFDTFgseUJBQVNLLE1BQVQ7QUFDSCxhQVpEO0FBYUEsbUJBQU9MLFNBQVNZLE9BQWhCO0FBQ0gsU0FoQkQ7O0FBOUN1QyxZQStEakNHLE1BL0RpQztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsdUNBZ0U1QjtBQUNILHlCQUFLQyxNQUFMLEdBQWM7QUFDVkMsb0NBQVksQ0FERjtBQUVWL0MsbUNBQVcsRUFGRDtBQUdWZ0Isa0NBQVUsRUFIQTs7QUFLVmdDLHFDQUFhLEVBTEg7O0FBT1ZDLDJDQUFtQixFQVBUO0FBUVZDLCtCQUFPLENBQUM7QUFDSkMsc0NBQVUsRUFETjtBQUVKQyxzQ0FBVSxFQUZOO0FBR0pDLHFDQUFTO0FBSEwseUJBQUQsQ0FSRztBQWFWQyxxQ0FBYSxDQUFDO0FBQ1ZDLGlDQUFLLEVBREs7QUFFVkMsbUNBQU8sRUFGRztBQUdWUix5Q0FBYTtBQUhILHlCQUFELENBYkg7QUFrQlZTLHFDQUFhO0FBQ1RDLHdDQUFZLENBREg7QUFFVDFELHVDQUFXLEVBRkY7QUFHVGdCLHNDQUFVLEVBSEQ7QUFJVDJDLHlDQUFhO0FBSkoseUJBbEJIO0FBd0JWQyxpQ0FBUztBQXhCQyxxQkFBZDtBQTBCSDtBQTNGa0M7QUFBQTtBQUFBLG9EQTRGZjtBQUNoQix5QkFBS2QsTUFBTCxDQUFZUSxXQUFaLENBQXdCTyxJQUF4QixDQUE2QjtBQUN6Qk4sNkJBQUssRUFEb0I7QUFFekJDLCtCQUFPLEVBRmtCO0FBR3pCUixxQ0FBYTtBQUhZLHFCQUE3QjtBQUtIO0FBbEdrQztBQUFBO0FBQUEsOENBbUdyQmMsSUFuR3FCLEVBbUdmQyxLQW5HZSxFQW1HUjtBQUN2Qix5QkFBS2pCLE1BQUwsQ0FBWWdCLElBQVosRUFBa0JFLE1BQWxCLENBQXlCRCxLQUF6QixFQUFnQyxDQUFoQztBQUNIO0FBckdrQztBQUFBO0FBQUEsaURBdUdsQjtBQUNiLHlCQUFLakIsTUFBTCxDQUFZSSxLQUFaLENBQWtCVyxJQUFsQixDQUF1QjtBQUNuQlYsa0NBQVUsRUFEUztBQUVuQkMsa0NBQVUsRUFGUztBQUduQkMsaUNBQVM7QUFIVSxxQkFBdkI7QUFLSDtBQTdHa0M7QUFBQTtBQUFBLCtDQThHcEJVLEtBOUdvQixFQThHYjtBQUNsQix5QkFBS2pCLE1BQUwsQ0FBWUksS0FBWixDQUFrQmEsS0FBbEIsRUFBeUJWLE9BQXpCLEdBQW1DLEVBQW5DO0FBQ0g7QUFoSGtDOztBQUFBO0FBQUE7O0FBa0h2QyxZQUFJWSxvQkFBb0IsU0FBcEJBLGlCQUFvQixHQUFZO0FBQ2hDLGdCQUFJQyxNQUFNLElBQUlyQixNQUFKLEVBQVY7QUFDQXFCLGdCQUFJQyxJQUFKO0FBQ0EsbUJBQU9ELEdBQVA7QUFDSCxTQUpEO0FBS0EsZUFBTztBQUNIckMsMEJBQWNBLFlBRFg7QUFFSGdCLG9CQUFRQSxNQUZMO0FBR0gxQiw2QkFBaUJBLGVBSGQ7QUFJSDhDLCtCQUFtQkEsaUJBSmhCO0FBS0h6QyxnQ0FBb0JBO0FBTGpCLFNBQVA7QUFPSDtBQUNEbkMsY0FBVStFLE9BQVYsR0FBb0IsQ0FBQyxPQUFELEVBQVUsSUFBVixFQUFnQixhQUFoQixDQUFwQjtBQUNBbEYsZ0JBQVltRixPQUFaLENBQW9CLFlBQXBCLEVBQWtDaEYsU0FBbEM7QUFDQUwsV0FBT0UsV0FBUCxHQUFxQkEsV0FBckI7QUFDSCxDQXRJRCxFQXNJR0YsTUF0SUgiLCJmaWxlIjoiY29tbW9uL2ltYWdlTW9kdWxlL2ltYWdlTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogQGF1dGhvciAgQ2hhbmRyYUxlZVxyXG4gKiBAZGVzY3JpcHRpb24gIOmVnOWDj+aooeWdl1xyXG4gKi9cclxuXHJcbigod2luZG93LCB1bmRlZmluZWQpID0+IHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGxldCBpbWFnZU1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdpbWFnZU1vZHVsZScsIFtdKTtcclxuXHJcbiAgICBmdW5jdGlvbiBkb21lSW1hZ2UoJGh0dHAsICRxLCAkZG9tZVB1YmxpYykge1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBJbWFnZVNlcnZpY2UoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VybCA9ICcvYXBpL2ltYWdlJztcclxuICAgICAgICAgICAgdGhpcy5nZXRCYXNlSW1hZ2VzID0gKCkgPT4gJGh0dHAuZ2V0KGAke3RoaXMuX3VybH0vYmFzZWApO1xyXG4gICAgICAgICAgICB0aGlzLmdldFByb2plY3RJbWFnZXMgPSAoKSA9PiAkaHR0cC5nZXQodGhpcy5fdXJsKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRBbGxJbWFnZXMgPSAoKSA9PiAkaHR0cC5nZXQoYCR7dGhpcy5fdXJsfS9hbGxgKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRJbWFnZUluZm8gPSAoaW1hZ2VOYW1lKSA9PiAkaHR0cC5nZXQoYCR7dGhpcy5fdXJsfS9hbGwvZGV0YWlsP25hbWU9JHtpbWFnZU5hbWV9YCk7XHJcbiAgICAgICAgICAgIC8v6aG555uu6ZWc5YOP5ZKM5Z+656GA6ZWc5YOP55qEdGFnXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0SW1hZ2VUYWdzID0gKHByb2plY3ROYW1lLCByZWdpc3RyeSkgPT4gJGh0dHAuZ2V0KGAke3RoaXMuX3VybH0vZGV0YWlsP25hbWU9JHtwcm9qZWN0TmFtZX0mcmVnaXN0cnk9JHtyZWdpc3RyeX1gKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRDdXN0b21JbWFnZXMgPSAoKSA9PiAkaHR0cC5nZXQoYCR7dGhpcy5fdXJsfS9jdXN0b21gKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRDdXN0b21JbWFnZUluZm8gPSAoaWQpID0+ICRodHRwLmdldChgJHt0aGlzLl91cmx9L2N1c3RvbS8ke2lkfWApO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUN1c3RvbUltYWdlID0gKG1pcnJvckluZm8pID0+ICRodHRwLnBvc3QoYCR7dGhpcy5fdXJsfS9jdXN0b21gLCBhbmd1bGFyLnRvSnNvbihtaXJyb3JJbmZvKSk7XHJcbiAgICAgICAgICAgIHRoaXMuYnVpbGRDdXN0b21JbWFnZSA9IChpbWFnZUlkKSA9PiAkaHR0cC5wb3N0KGAke3RoaXMuX3VybH0vY3VzdG9tL2J1aWxkLyR7aW1hZ2VJZH1gKTtcclxuICAgICAgICAgICAgdGhpcy5kZWxldGVDdXN0b21JbWFnZSA9IChpbWFnZUlkKSA9PiAkaHR0cC5kZWxldGUoYCR7dGhpcy5fdXJsfS9jdXN0b20vJHtpbWFnZUlkfWApO1xyXG4gICAgICAgICAgICB0aGlzLnZhbGlkSW1hZ2VOYW1lID0gKGltYWdlTmFtZSwgaW1hZ2VUYWcpID0+ICRodHRwLnBvc3QoYCR7dGhpcy5fdXJsfS9jdXN0b20vdmFsaWRhdGU/aW1hZ2VOYW1lPSR7aW1hZ2VOYW1lfSZpbWFnZVRhZz0ke2ltYWdlVGFnfWApO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUJhc2VJbWFnZSA9IChpbWFnZUluZm8pID0+ICRodHRwLnBvc3QoYCR7dGhpcy5fdXJsfS9iYXNlYCwgYW5ndWxhci50b0pzb24oaW1hZ2VJbmZvKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlQmFzZUltYWdlID0gKGltYWdlSWQpID0+ICRodHRwLmRlbGV0ZShgJHt0aGlzLl91cmx9L2Jhc2UvJHtpbWFnZUlkfWApO1xyXG4gICAgICAgICAgICAvLyBAcGFyYW0gdHlwZTogJ2phdmEnXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RXhjbHVzaXZlSW1hZ2VzID0gKHR5cGUpID0+ICRodHRwLmdldChgJHt0aGlzLl91cmx9L2V4Y2x1c2l2ZS8ke3R5cGV9YCk7XHJcbiAgICAgICAgICAgIC8vIGltYWdlIGNvbGxlY3Rpb25cclxuICAgICAgICAgICAgdGhpcy5nZXRDb2xsZWN0aW9uSW1hZ2VzID0gKGltYWdlTmFtZURldGFpbCkgPT4gJGh0dHAucG9zdChgJHt0aGlzLl91cmx9L2FsbC9kZXRhaWxgLCBhbmd1bGFyLnRvSnNvbihpbWFnZU5hbWVEZXRhaWwpKTtcclxuICAgICAgICAgICAgdGhpcy5kZWxldGVQcml2YXRlSW1hZ2UgPSAobmFtZSwgdGFnLCByZWdpc3RyeSkgPT4gJGh0dHAuZGVsZXRlKGAke3RoaXMuX3VybH0vYWxsL2RldGFpbC90YWc/bmFtZT0ke25hbWV9JnRhZz0ke3RhZ30mcmVnaXN0cnk9JHtyZWdpc3RyeX1gKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRUYWdEZXRhaWwgPSAoaW1hZ2VUYWdEZXRhaWxSZXF1ZXN0KSA9PiAkaHR0cC5wb3N0KGAke3RoaXMuX3VybH0vYWxsL2RldGFpbC90YWdgLCBhbmd1bGFyLnRvSnNvbihpbWFnZVRhZ0RldGFpbFJlcXVlc3QpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW1hZ2VTZXJ2aWNlID0gbmV3IEltYWdlU2VydmljZSgpO1xyXG5cclxuICAgICAgICAvLyDliKDpmaTln7rnoYDplZzlg49cclxuICAgICAgICBjb25zdCBkZWxldGVCYXNlSW1hZ2UgPSAoaW1hZ2VJZCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuRGVsZXRlKCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZVNlcnZpY2UuZGVsZXRlQmFzZUltYWdlKGltYWdlSWQpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5Yig6Zmk5aSx6LSl77yBJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiByZXMuZGF0YS5yZXN1bHRNc2dcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy8g5Yig6Zmk56eB5pyJ5LuT5bqT6ZWc5YOPXHJcbiAgICAgICAgY29uc3QgZGVsZXRlUHJpdmF0ZUltYWdlID0gKG5hbWUsIHRhZywgcmVnaXN0cnkpID0+IHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlbkRlbGV0ZSgpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2VTZXJ2aWNlLmRlbGV0ZVByaXZhdGVJbWFnZShuYW1lLCB0YWcsIHJlZ2lzdHJ5KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9LCAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+WIoOmZpOWksei0pe+8gScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEuZXJyb3JzLm1lc3NhZ2UgKyByZXMuZGF0YS5yZXN1bHRNc2dcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgY2xhc3MgTWlycm9yIHtcclxuICAgICAgICAgICAgaW5pdCgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGF1dG9DdXN0b206IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VOYW1lOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZVRhZzogJycsXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZG9ja2VyZmlsZUNvbnRlbnQ6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZTogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJydcclxuICAgICAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgICAgICBlbnZTZXR0aW5nczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJydcclxuICAgICAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgICAgICBzb3VyY2VJbWFnZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlyZFBhcnR5OiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZU5hbWU6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVRhZzogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJ5VXJsOiAnJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgcHVibGlzaDogMVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhZGRFbnZDb25mRGVmYXVsdCgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmVudlNldHRpbmdzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGtleTogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVsZXRlQXJySXRlbShpdGVtLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWdbaXRlbV0uc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYWRkRmlsZURlZmF1bHQoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5maWxlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZTogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICcnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjbGVhckZpbGVXcml0ZShpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZmlsZXNbaW5kZXhdLmNvbnRlbnQgPSAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZ2V0TWlycm9ySW5zdGFuY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBpbnMgPSBuZXcgTWlycm9yKCk7XHJcbiAgICAgICAgICAgIGlucy5pbml0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnM7XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpbWFnZVNlcnZpY2U6IGltYWdlU2VydmljZSxcclxuICAgICAgICAgICAgTWlycm9yOiBNaXJyb3IsXHJcbiAgICAgICAgICAgIGRlbGV0ZUJhc2VJbWFnZTogZGVsZXRlQmFzZUltYWdlLFxyXG4gICAgICAgICAgICBnZXRNaXJyb3JJbnN0YW5jZTogZ2V0TWlycm9ySW5zdGFuY2UsXHJcbiAgICAgICAgICAgIGRlbGV0ZVByaXZhdGVJbWFnZTogZGVsZXRlUHJpdmF0ZUltYWdlXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGRvbWVJbWFnZS4kaW5qZWN0ID0gWyckaHR0cCcsICckcScsICckZG9tZVB1YmxpYyddO1xyXG4gICAgaW1hZ2VNb2R1bGUuZmFjdG9yeSgnJGRvbWVJbWFnZScsIGRvbWVJbWFnZSk7XHJcbiAgICB3aW5kb3cuaW1hZ2VNb2R1bGUgPSBpbWFnZU1vZHVsZTtcclxufSkod2luZG93KTsiXX0=
