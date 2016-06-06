'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
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
                return $http.get('/api/image/exclusive/' + type);
            };
        }
        var imageService = new ImageService();

        // 删除基础镜像
        var deleteBaseImage = function deleteBaseImage(imageId) {
            var deferred = $q.defer();
            $domePublic.openDelete().then(function () {
                imageService.deleteBaseImage.then(function () {
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
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9pbWFnZU1vZHVsZS9pbWFnZU1vZHVsZS5lcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxDQUFDLFlBQU07QUFDSCxpQkFERzs7QUFFSCxRQUFJLGNBQWMsUUFBUSxNQUFSLENBQWUsYUFBZixFQUE4QixFQUE5QixDQUFkLENBRkQ7O0FBSUgsYUFBUyxTQUFULENBQW1CLEtBQW5CLEVBQTBCLEVBQTFCLEVBQThCLFdBQTlCLEVBQTJDOztBQUV2QyxpQkFBUyxZQUFULEdBQXdCOzs7QUFDcEIsaUJBQUssSUFBTCxHQUFZLFlBQVosQ0FEb0I7QUFFcEIsaUJBQUssYUFBTCxHQUFxQjt1QkFBTSxNQUFNLEdBQU4sQ0FBVSxNQUFLLElBQUwsR0FBWSxPQUFaO2FBQWhCLENBRkQ7QUFHcEIsaUJBQUssZ0JBQUwsR0FBd0I7dUJBQU0sTUFBTSxHQUFOLENBQVUsTUFBSyxJQUFMO2FBQWhCLENBSEo7QUFJcEIsaUJBQUssWUFBTCxHQUFvQjt1QkFBTSxNQUFNLEdBQU4sQ0FBVSxNQUFLLElBQUwsR0FBWSxNQUFaO2FBQWhCLENBSkE7QUFLcEIsaUJBQUssWUFBTCxHQUFvQixVQUFDLFNBQUQ7dUJBQWUsTUFBTSxHQUFOLENBQVUsTUFBSyxJQUFMLEdBQVksbUJBQVosR0FBa0MsU0FBbEM7YUFBekI7O0FBTEEsZ0JBT3BCLENBQUssWUFBTCxHQUFvQixVQUFDLFdBQUQsRUFBYyxRQUFkO3VCQUEyQixNQUFNLEdBQU4sQ0FBVSxNQUFLLElBQUwsR0FBWSxlQUFaLEdBQThCLFdBQTlCLEdBQTRDLFlBQTVDLEdBQTJELFFBQTNEO2FBQXJDLENBUEE7QUFRcEIsaUJBQUssZUFBTCxHQUF1Qjt1QkFBTSxNQUFNLEdBQU4sQ0FBVSxNQUFLLElBQUwsR0FBWSxTQUFaO2FBQWhCLENBUkg7QUFTcEIsaUJBQUssa0JBQUwsR0FBMEIsVUFBQyxFQUFEO3VCQUFRLE1BQU0sR0FBTixDQUFVLE1BQUssSUFBTCxHQUFZLFVBQVosR0FBeUIsRUFBekI7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QXVCO0FBQ25CLGtDQUFVLEVBQVY7QUFDQSxrQ0FBVSxFQUFWO0FBQ0EsaUNBQVMsRUFBVDtxQkFISixFQURhOzs7OytDQU9GLE9BQU87QUFDbEIseUJBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsS0FBbEIsRUFBeUIsT0FBekIsR0FBbUMsRUFBbkMsQ0FEa0I7Ozs7bUJBL0NwQjtZQXRDaUM7O0FBeUZ2QyxZQUFJLG9CQUFvQixTQUFwQixpQkFBb0IsR0FBWTtBQUNoQyxnQkFBSSxNQUFNLElBQUksTUFBSixFQUFOLENBRDRCO0FBRWhDLGdCQUFJLElBQUosR0FGZ0M7QUFHaEMsbUJBQU8sR0FBUCxDQUhnQztTQUFaLENBekZlO0FBOEZ2QyxlQUFPO0FBQ0gsMEJBQWMsWUFBZDtBQUNBLG9CQUFRLE1BQVI7QUFDQSw2QkFBaUIsZUFBakI7QUFDQSwrQkFBbUIsaUJBQW5CO1NBSkosQ0E5RnVDO0tBQTNDO0FBcUdBLGNBQVUsT0FBVixHQUFvQixDQUFDLE9BQUQsRUFBVSxJQUFWLEVBQWdCLGFBQWhCLENBQXBCLENBekdHO0FBMEdILGdCQUFZLE9BQVosQ0FBb0IsWUFBcEIsRUFBa0MsU0FBbEMsRUExR0c7QUEyR0gsV0FBTyxXQUFQLEdBQXFCLFdBQXJCLENBM0dHO0NBQU4sQ0FBRCIsImZpbGUiOiJjb21tb24vaW1hZ2VNb2R1bGUvaW1hZ2VNb2R1bGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoKCkgPT4ge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBsZXQgaW1hZ2VNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnaW1hZ2VNb2R1bGUnLCBbXSk7XG5cbiAgICBmdW5jdGlvbiBkb21lSW1hZ2UoJGh0dHAsICRxLCAkZG9tZVB1YmxpYykge1xuXG4gICAgICAgIGZ1bmN0aW9uIEltYWdlU2VydmljZSgpIHtcbiAgICAgICAgICAgIHRoaXMuX3VybCA9ICcvYXBpL2ltYWdlJztcbiAgICAgICAgICAgIHRoaXMuZ2V0QmFzZUltYWdlcyA9ICgpID0+ICRodHRwLmdldCh0aGlzLl91cmwgKyAnL2Jhc2UnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0UHJvamVjdEltYWdlcyA9ICgpID0+ICRodHRwLmdldCh0aGlzLl91cmwpO1xuICAgICAgICAgICAgdGhpcy5nZXRBbGxJbWFnZXMgPSAoKSA9PiAkaHR0cC5nZXQodGhpcy5fdXJsICsgJy9hbGwnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0SW1hZ2VJbmZvID0gKGltYWdlTmFtZSkgPT4gJGh0dHAuZ2V0KHRoaXMuX3VybCArICcvYWxsL2RldGFpbD9uYW1lPScgKyBpbWFnZU5hbWUpO1xuICAgICAgICAgICAgLy/pobnnm67plZzlg4/lkozln7rnoYDplZzlg4/nmoR0YWdcbiAgICAgICAgICAgIHRoaXMuZ2V0SW1hZ2VUYWdzID0gKHByb2plY3ROYW1lLCByZWdpc3RyeSkgPT4gJGh0dHAuZ2V0KHRoaXMuX3VybCArICcvZGV0YWlsP25hbWU9JyArIHByb2plY3ROYW1lICsgJyZyZWdpc3RyeT0nICsgcmVnaXN0cnkpO1xuICAgICAgICAgICAgdGhpcy5nZXRDdXN0b21JbWFnZXMgPSAoKSA9PiAkaHR0cC5nZXQodGhpcy5fdXJsICsgJy9jdXN0b20nKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0Q3VzdG9tSW1hZ2VJbmZvID0gKGlkKSA9PiAkaHR0cC5nZXQodGhpcy5fdXJsICsgJy9jdXN0b20vJyArIGlkKTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ3VzdG9tSW1hZ2UgPSAobWlycm9ySW5mbykgPT4gJGh0dHAucG9zdCh0aGlzLl91cmwgKyAnL2N1c3RvbScsIGFuZ3VsYXIudG9Kc29uKG1pcnJvckluZm8pKTtcbiAgICAgICAgICAgIHRoaXMuYnVpbGRDdXN0b21JbWFnZSA9IChpbWFnZUlkKSA9PiAkaHR0cC5wb3N0KHRoaXMuX3VybCArICcvY3VzdG9tL2J1aWxkLycgKyBpbWFnZUlkKTtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlQ3VzdG9tSW1hZ2UgPSAoaW1hZ2VJZCkgPT4gJGh0dHAuZGVsZXRlKHRoaXMuX3VybCArICcvY3VzdG9tLycgKyBpbWFnZUlkKTtcbiAgICAgICAgICAgIHRoaXMudmFsaWRJbWFnZU5hbWUgPSAoaW1hZ2VOYW1lLCBpbWFnZVRhZykgPT4gJGh0dHAucG9zdCh0aGlzLl91cmwgKyAnL2N1c3RvbS92YWxpZGF0ZT9pbWFnZU5hbWU9JyArIGltYWdlTmFtZSArICcmaW1hZ2VUYWc9JyArIGltYWdlVGFnKTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQmFzZUltYWdlID0gKGltYWdlSW5mbykgPT4gJGh0dHAucG9zdCh0aGlzLl91cmwgKyAnL2Jhc2UnLCBhbmd1bGFyLnRvSnNvbihpbWFnZUluZm8pKTtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlQmFzZUltYWdlID0gKGltYWdlSWQpID0+ICRodHRwLmRlbGV0ZSh0aGlzLl91cmwgKyAnL2Jhc2UvJyArIGltYWdlSWQpO1xuICAgICAgICAgICAgLy8gQHBhcmFtIHR5cGU6ICdqYXZhJ1xuICAgICAgICAgICAgdGhpcy5nZXRFeGNsdXNpdmVJbWFnZXMgPSAodHlwZSkgPT4gJGh0dHAuZ2V0KCcvYXBpL2ltYWdlL2V4Y2x1c2l2ZS8nICsgdHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW1hZ2VTZXJ2aWNlID0gbmV3IEltYWdlU2VydmljZSgpO1xuXG4gICAgICAgIC8vIOWIoOmZpOWfuuehgOmVnOWDj1xuICAgICAgICBjb25zdCBkZWxldGVCYXNlSW1hZ2UgPSAoaW1hZ2VJZCkgPT4ge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5EZWxldGUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpbWFnZVNlcnZpY2UuZGVsZXRlQmFzZUltYWdlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoJ+WIoOmZpOWksei0pe+8gScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcbiAgICAgICAgY2xhc3MgTWlycm9yIHtcbiAgICAgICAgICAgIGluaXQoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgICAgICAgICAgICAgIGF1dG9DdXN0b206IDAsXG4gICAgICAgICAgICAgICAgICAgIGltYWdlTmFtZTogJycsXG4gICAgICAgICAgICAgICAgICAgIGltYWdlVGFnOiAnJyxcblxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJycsXG5cbiAgICAgICAgICAgICAgICAgICAgZG9ja2VyZmlsZUNvbnRlbnQ6ICcnLFxuICAgICAgICAgICAgICAgICAgICBmaWxlczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICcnXG4gICAgICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgICAgICBlbnZTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJydcbiAgICAgICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZUltYWdlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlyZFBhcnR5OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VOYW1lOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVGFnOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJ5VXJsOiAnJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBwdWJsaXNoOiAxXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZEVudkNvbmZEZWZhdWx0KCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmVudlNldHRpbmdzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICcnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlQXJySXRlbShpdGVtLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnW2l0ZW1dLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFkZEZpbGVEZWZhdWx0KCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmZpbGVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZTogJycsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsZWFyRmlsZVdyaXRlKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZmlsZXNbaW5kZXhdLmNvbnRlbnQgPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZ2V0TWlycm9ySW5zdGFuY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaW5zID0gbmV3IE1pcnJvcigpO1xuICAgICAgICAgICAgaW5zLmluaXQoKTtcbiAgICAgICAgICAgIHJldHVybiBpbnM7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbWFnZVNlcnZpY2U6IGltYWdlU2VydmljZSxcbiAgICAgICAgICAgIE1pcnJvcjogTWlycm9yLFxuICAgICAgICAgICAgZGVsZXRlQmFzZUltYWdlOiBkZWxldGVCYXNlSW1hZ2UsXG4gICAgICAgICAgICBnZXRNaXJyb3JJbnN0YW5jZTogZ2V0TWlycm9ySW5zdGFuY2VcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZG9tZUltYWdlLiRpbmplY3QgPSBbJyRodHRwJywgJyRxJywgJyRkb21lUHVibGljJ107XG4gICAgaW1hZ2VNb2R1bGUuZmFjdG9yeSgnJGRvbWVJbWFnZScsIGRvbWVJbWFnZSk7XG4gICAgd2luZG93LmltYWdlTW9kdWxlID0gaW1hZ2VNb2R1bGU7XG59KSgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
