'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @author  ChandraLee
 * @description  项目模块
 */

(function (window, undefined) {
    // 项目管理service
    'use strict';

    var projectModule = angular.module('projectModule', []);

    function DomeProject($http, $util, $state, $domePublic, $domeModel, $q, $modal, $domeImage) {
        var ProjectService = function ProjectService() {
            var _this = this;

            this.url = 'api/project';
            $domeModel.ServiceModel.call(this, this.url);
            this.getProjectCollectionNameById = function (projectCollectionId) {
                return $http.get('/api/projectcollection/' + projectCollectionId + '/name');
            };
            this.getProject = function (projectCollectionId) {
                return $http.get('/api/projectcollection/' + projectCollectionId + '/project');
            };
            this.getReadMe = function (proId, branch) {
                return $http.get(_this.url + '/readme/' + proId + '/' + branch);
            };
            this.getBuildList = function (proId) {
                return $http.get('/api/ci/build/' + proId);
            };
            this.getBranches = function (proId) {
                return $http.get(_this.url + '/branches/' + proId);
            };
            this.getBranchesWithoutId = function (codeId, codeManagerUserId, codeManager) {
                return $http.get(_this.url + '/branches/' + codeManager + '/' + codeId + '/' + codeManagerUserId);
            };
            this.getTags = function (proId) {
                return $http.get(_this.url + '/tags/' + proId);
            };
            this.getTagsWithoutId = function (codeId, codeManagerUserId, codeManager) {
                return $http.get(_this.url + '/tags/' + codeManager + '/' + codeId + '/' + codeManagerUserId);
            };
            this.getGitLabInfo = function () {
                return $http.get(_this.url + '/git/gitlabinfo');
            };
            this.getBuildDockerfile = function (proId, buildId) {
                return $http.get('/api/ci/build/dockerfile/' + proId + '/' + buildId);
            };
            this.previewDockerfile = function (projectConfig) {
                return $http.post('/api/ci/build/dockerfile', angular.toJson(projectConfig), {
                    notIntercept: true
                });
            };
            this.build = function (buildInfo) {
                return $http.post('/api/ci/build/start', angular.toJson(buildInfo), {
                    notIntercept: true
                });
            };
        };
        var projectService = new ProjectService();

        var buildProject = function buildProject(proId, hasCodeInfo) {
            var buildModalIns = $modal.open({
                animation: true,
                templateUrl: '/index/tpl/modal/buildModal/buildModal.html',
                controller: 'BuildModalCtr as vm',
                size: 'md',
                resolve: {
                    projectInfo: {
                        projectId: proId,
                        hasCodeInfo: hasCodeInfo
                    }
                }
            });
            return buildModalIns.result;
        };

        var ProjectImages = function () {
            function ProjectImages() {
                _classCallCheck(this, ProjectImages);

                this.imageInfo = {
                    compileIsPublic: 1,
                    runIsPublic: 1
                };
                this.selectedCompileImage = {};
                this.selectedRunImage = {};
                this.currentCompileList = [];
                // 私有仓库所有镜像
                this.privateRegistryImageList = [];
                // 私有仓库compile镜像
                this.selectedCompilePrivateImageTag = {};
                this.currentCompilePrivateImageTagList = [];
                //私有仓库run镜像
                this.selectedRunPrivateImageTag = {};
                this.currentRunPrivateImageTagList = [];
                this.currentRunList = [];
                this.projectImagesInfo = {
                    compilePublicImageList: [],
                    compilePrivateImageList: [],
                    runPublicImageList: [],
                    runPrivateImageList: []
                };
                this.userList = [];
            }

            _createClass(ProjectImages, [{
                key: 'init',
                value: function init(imagesInfo) {
                    //this.getProjectImageAsPrivateImageList('all');
                    if (!imagesInfo) imagesInfo = {};
                    if (!$util.isArray(imagesInfo.compilePublicImageList)) {
                        imagesInfo.compilePublicImageList = [];
                    }
                    if (!$util.isArray(imagesInfo.compilePrivateImageList)) {
                        imagesInfo.compilePrivateImageList = [];
                    } else {
                        imagesInfo.compilePrivateImageList = this.privateRegistryImageList;
                    }
                    if (!$util.isArray(imagesInfo.runPublicImageList)) {
                        imagesInfo.runPublicImageList = [];
                    }
                    if (!$util.isArray(imagesInfo.runPrivateImageList)) {
                        imagesInfo.runPrivateImageList = [];
                    } else {
                        imagesInfo.runPrivateImageList = this.privateRegistryImageList;
                    }

                    angular.forEach(imagesInfo, function (imageList, imageListName) {
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = imageList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var image = _step.value;

                                image.createDate = $util.getPageDate(image.createTime);
                                image.imageTxt = image.imageName;
                                if (image.imageTag) {
                                    image.imageTxt += ':' + image.imageTag;
                                }
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }
                    });
                    this.projectImagesInfo = imagesInfo;
                    if (Object.keys(this.selectedCompileImage).length === 0) {
                        this.toggleIsPublicImage('compile');
                        this.toggleIsPublicImage('run');
                    }
                }
                // 获取私有镜像的工程镜像，并转换成compilePrivateImageList格式

            }, {
                key: 'getProjectImageAsPrivateImageList',
                value: function getProjectImageAsPrivateImageList(imageType) {
                    var _this2 = this;

                    $domeImage.imageService.getProjectImages().then(function (res) {
                        var imageList = res.data.result || [];
                        var newImageList = [];
                        for (var i = 0; i < imageList.length; i++) {
                            var image = imageList[i];
                            image.createDate = $util.getPageDate(image.createTime);
                            image.imageTxt = image.imageName;
                            image.registryUrl = image.registry;
                            image.registryType = 0;
                            //image.imageTag 后续填入
                            if (image.imageTag) {
                                image.imageTxt += ':' + image.imageTag;
                            }
                            newImageList.push(image);
                        }
                        if (imageType === 'compile') {
                            _this2.projectImagesInfo.compilePrivateImageList = newImageList;
                        } else if (imageType === 'run') {
                            _this2.projectImagesInfo.runPrivateImageList = newImageList;
                        } else if (imageType === 'all') {
                            _this2.privateRegistryImageList = newImageList;
                        }
                    }).finally(function () {});
                }
            }, {
                key: 'getPrivateImageTag',
                value: function getPrivateImageTag(imageType, image) {
                    var _this3 = this;

                    $domeImage.imageService.getImageTags(image.imageName, image.registryUrl).then(function (res) {
                        var tags = res.data.result;
                        if (imageType === 'compile') {
                            _this3.currentCompilePrivateImageTagList = tags;
                        } else if (imageType === 'run') {
                            _this3.currentRunPrivateImageTagList = tags;
                        }
                    }).finally(function () {});
                }
            }, {
                key: 'toggleIsPublicImage',
                value: function toggleIsPublicImage(imageType, isPublic) {
                    if (typeof isPublic === 'undefined') {
                        isPublic = imageType == 'compile' ? this.imageInfo.compileIsPublic : this.imageInfo.runIsPublic;
                    }
                    if (imageType == 'compile') {
                        this.currentCompileList = isPublic === 1 ? this.projectImagesInfo.compilePublicImageList : this.projectImagesInfo.compilePrivateImageList;
                        this.toggleImage('compile', 0);
                    } else {
                        this.currentRunList = isPublic === 1 ? this.projectImagesInfo.runPublicImageList : this.projectImagesInfo.runPrivateImageList;
                        this.toggleImage('run', 0);
                    }
                }
                //切换私有镜像tag，并为私有镜像添加tag

            }, {
                key: 'togglePrivateImageTag',
                value: function togglePrivateImageTag(imageType, index, tag) {
                    if (imageType === 'compile') {
                        this.selectedCompilePrivateImageTag = this.currentCompilePrivateImageTagList[index];
                        for (var l = 0; l < this.currentCompileList.length; l++) {
                            if (this.currentCompileList[l].imageName === tag.imageName) {
                                this.currentCompileList[l].imageTag = this.selectedCompilePrivateImageTag.tag;
                                break;
                            }
                        }
                    } else if (imageType === 'run') {
                        this.selectedRunPrivateImageTag = this.currentRunPrivateImageTagList[index];
                        for (var _l = 0; _l < this.currentRunList.length; _l++) {
                            if (this.currentRunList[_l].imageName === tag.imageName) {
                                this.currentRunList[_l].imageTag = this.selectedRunPrivateImageTag.tag;
                                break;
                            }
                        }
                    }
                }
                // @param imageType: 'compile(编译镜像)/'run'(运行镜像)
                // @param index: 切换到imageType镜像的index下标

            }, {
                key: 'toggleImage',
                value: function toggleImage(imageType, index, image) {
                    if (imageType === 'compile') {
                        if (this.imageInfo.compileIsPublic === 0 || typeof image === 'undefined') {
                            //this.selectedCompileImage = this.currentCompileList[index];
                            this.selectedCompilePrivateImageTag = {};
                            if (typeof image === 'undefined') {
                                image = this.currentCompileList[0]; //切换radio时image为undefined
                            }
                            for (var indexImage = 0; indexImage < this.currentCompileList.length; indexImage++) {
                                var selectedImageTmp = this.currentCompileList[indexImage];
                                if (selectedImageTmp.imageTxt == image.imageTxt) {
                                    this.selectedCompileImage = selectedImageTmp;
                                    break;
                                }
                            }
                            this.getPrivateImageTag('compile', image);
                        } else {
                            if (typeof image !== 'undefined') {
                                for (var _indexImage = 0; _indexImage < this.currentCompileList.length; _indexImage++) {
                                    var _selectedImageTmp = this.currentCompileList[_indexImage];
                                    if (_selectedImageTmp.imageTxt == image.imageTxt) {
                                        this.selectedCompileImage = _selectedImageTmp;
                                        break;
                                    }
                                }
                            } else {
                                this.selectedCompileImage = this.currentCompileList[index];
                            }
                        }
                    } else if (imageType === 'run') {
                        if (this.imageInfo.runIsPublic === 0 || typeof image === 'undefined') {
                            //this.selectedRunImage = this.currentRunList[index];
                            this.selectedRunPrivateImageTag = {};
                            if (typeof image === 'undefined') {
                                image = this.currentRunList[0]; //切换radio时image为undefined
                            }
                            for (var ind = 0; ind < this.currentRunList.length; ind++) {
                                var selectedRunImageTmp = this.currentRunList[ind];
                                if (selectedRunImageTmp.imageTxt == image.imageTxt) {
                                    this.selectedRunImage = selectedRunImageTmp;
                                    break;
                                }
                            }
                            this.getPrivateImageTag('run', image);
                        } else {
                            if (typeof image !== 'undefined') {
                                for (var _ind = 0; _ind < this.currentRunList.length; _ind++) {
                                    var _selectedRunImageTmp = this.currentRunList[_ind];
                                    if (_selectedRunImageTmp.imageTxt == image.imageTxt) {
                                        this.selectedRunImage = _selectedRunImageTmp;
                                        break;
                                    }
                                }
                            } else {
                                this.selectedRunImage = angular.copy(this.currentRunList[index]);
                            }
                        }
                    }
                }
                // 设置默认选择的镜像

            }, {
                key: 'toggleSpecifiedImage',
                value: function toggleSpecifiedImage(type, imgObj) {
                    var imageTxt = '';
                    if ($util.isObject(imgObj)) {
                        imageTxt = imgObj.imageName;
                        if (imgObj.imageTag) {
                            imageTxt += ':' + imgObj.imageTag;
                        }
                    } else {
                        imgObj = {};
                    }
                    if (type == 'compile') {
                        this.selectedCompileImage = imgObj;
                        this.selectedCompileImage.imageTxt = imageTxt;
                        this.selectedCompilePrivateImageTag.tag = imgObj.imageTag;
                        this.imageInfo.compileIsPublic = imgObj.registryType !== void 0 ? imgObj.registryType : 1;
                        this.currentCompileList = imgObj.registryType === 1 ? this.projectImagesInfo.compilePublicImageList : this.projectImagesInfo.compilePrivateImageList;
                    } else {
                        this.selectedRunImage = imgObj;
                        this.selectedRunImage.imageTxt = imageTxt;
                        this.selectedRunPrivateImageTag.tag = imgObj.imageTag;
                        this.imageInfo.runIsPublic = imgObj.registryType !== void 0 ? imgObj.registryType : 1;
                        this.currentRunList = imgObj.registryType === 1 ? this.projectImagesInfo.runPublicImageList : this.projectImagesInfo.runPrivateImageList;
                    }
                }
            }]);

            return ProjectImages;
        }();

        var Project = function () {
            function Project(initInfo) {
                _classCallCheck(this, Project);

                this.config = {};
                // 提取公共config,保持view不变
                this.customConfig = {};
                this.isUseCustom = false;
                this.isDefDockerfile = false;
                this.projectImagesIns = new ProjectImages();
                this.init(initInfo);
            }

            _createClass(Project, [{
                key: 'init',
                value: function init(project) {
                    var i = 0,
                        autoBuildInfo = void 0;
                    if (!$util.isObject(project)) {
                        project = {};
                    }
                    this.customConfig = {};
                    if (!$util.isObject(project.dockerfileInfo)) {
                        project.dockerfileInfo = {};
                    }
                    if (!$util.isObject(project.dockerfileConfig)) {
                        project.dockerfileConfig = {};
                    }
                    if (project.exclusiveBuild) {
                        this.customConfig = project.exclusiveBuild;
                        this.isUseCustom = true;
                        this.isDefDockerfile = false;
                    } else if (project.userDefineDockerfile) {
                        this.customConfig = project.dockerfileInfo;
                        this.isUseCustom = false;
                        this.isDefDockerfile = false;
                    } else if (project.customDockerfile) {
                        this.customConfig = project.customDockerfile;
                        this.isUseCustom = false;
                        this.isDefDockerfile = true;
                    } else {
                        this.customConfig = project.dockerfileConfig;
                        this.isUseCustom = false;
                        this.isDefDockerfile = false;
                    }
                    // 初始化 autoBuildInfo
                    this.autoBuildInfo = angular.copy(project.autoBuildInfo);
                    project.autoBuildInfo = function () {
                        var autoBuildInfo = project.autoBuildInfo,
                            newAutoBuildInfo = void 0,
                            branches = void 0;
                        if (!$util.isObject(autoBuildInfo)) {
                            return {
                                tag: 0,
                                master: false,
                                other: false,
                                branches: ''
                            };
                        }
                        branches = project.autoBuildInfo.branches;
                        newAutoBuildInfo = {
                            tag: autoBuildInfo.tag || 0,
                            master: false,
                            other: false,
                            branches: ''
                        };
                        if (branches) {
                            for (var _i = 0; _i < branches.length; _i++) {
                                if (branches[_i] == 'master') {
                                    newAutoBuildInfo.master = true;
                                    branches.splice(_i, 1);
                                    _i--;
                                }
                            }
                            if (branches.length !== 0) {
                                newAutoBuildInfo.other = true;
                                newAutoBuildInfo.branches = branches.join(',');
                            }
                        }
                        return newAutoBuildInfo;
                    }();

                    project.confFiles = function () {
                        var confFiles = project.confFiles,
                            newArr = [];
                        if (!$util.isObject(confFiles)) {
                            return [{
                                tplDir: '',
                                originDir: ''
                            }];
                        }
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = Object.keys(confFiles)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var key = _step2.value;

                                newArr.push({
                                    tplDir: key,
                                    originDir: confFiles[key]
                                });
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }

                        newArr.push({
                            tplDir: '',
                            originDir: ''
                        });
                        return newArr;
                    }();

                    if (!$util.isArray(project.envConfDefault)) {
                        project.envConfDefault = [];
                    }
                    project.envConfDefault.push({
                        key: '',
                        value: '',
                        description: ''
                    });

                    this.customConfig.compileEnv = function () {
                        var compileEnv = this.customConfig.compileEnv;
                        if (!compileEnv) {
                            return [{
                                envName: '',
                                envValue: ''
                            }];
                        }
                        if (typeof compileEnv !== 'string') {
                            return angular.copy(compileEnv);
                        }
                        var compileEnvArr = compileEnv.split(',');
                        var newArr = compileEnvArr.map(function (item) {
                            var sigEnv = item.split('=');
                            return {
                                envName: sigEnv[0],
                                envValue: sigEnv[1]
                            };
                        });
                        newArr.push({
                            envName: '',
                            envValue: ''
                        });
                        return newArr;
                    }.bind(this)();

                    this.customConfig.uploadFileInfos = function (uploadFileInfos) {
                        if (!uploadFileInfos) uploadFileInfos = [];
                        if (!uploadFileInfos.length) uploadFileInfos.push({ filename: '', content: '' });
                        return uploadFileInfos;
                    }(this.customConfig.uploadFileInfos);

                    this.customConfig.createdFileStoragePath = function () {
                        var createdFileStoragePath = this.customConfig.createdFileStoragePath;
                        if (!$util.isArray(createdFileStoragePath) || createdFileStoragePath.length === 0) {
                            return [{
                                name: ''
                            }];
                        }
                        var newArr = createdFileStoragePath.map(function (item) {
                            return {
                                name: item
                            };
                        });
                        newArr.push({
                            name: ''
                        });
                        return newArr;
                    }.bind(this)();

                    this.config = project;
                    // this.creatorDraft = {};
                }
            }, {
                key: 'resetConfig',
                value: function resetConfig() {
                    this.config.dockerfileConfig = null;
                    this.config.dockerfileInfo = null;
                    this.config.exclusiveBuild = null;
                    this.config.confFiles = null;
                    this.config.envConfDefault = null;
                    this.config.autoBuildInfo = this.autoBuildInfo;
                    this.init(this.config);
                }
            }, {
                key: 'deleteArrItem',
                value: function deleteArrItem(item, index) {
                    this.config[item].splice(index, 1);
                }
            }, {
                key: 'deleteCompileEnv',
                value: function deleteCompileEnv(index) {
                    this.customConfig.compileEnv.splice(index, 1);
                }
            }, {
                key: 'deleteCreatedFileStoragePath',
                value: function deleteCreatedFileStoragePath(index) {
                    this.customConfig.createdFileStoragePath.splice(index, 1);
                }
            }, {
                key: 'addEnvConfDefault',
                value: function addEnvConfDefault() {
                    this.config.envConfDefault.push({
                        key: '',
                        value: '',
                        description: ''
                    });
                }
            }, {
                key: 'addUploadFileInfo',
                value: function addUploadFileInfo() {
                    this.customConfig.uploadFileInfos.push({
                        filename: '',
                        content: ''
                    });
                }
            }, {
                key: 'delUploadFileInfo',
                value: function delUploadFileInfo(index) {
                    this.customConfig.uploadFileInfos.splice(index, 1);
                }
            }, {
                key: 'toggleBaseImage',
                value: function toggleBaseImage(imageName, imageTag, imageRegistry) {
                    this.customConfig.baseImageName = imageName;
                    this.customConfig.baseImageTag = imageTag;
                    this.customConfig.baseImageRegistry = imageRegistry;
                }
            }, {
                key: 'addCreatedFileStoragePath',
                value: function addCreatedFileStoragePath() {
                    this.customConfig.createdFileStoragePath.push({
                        name: ''
                    });
                }
            }, {
                key: 'addCompileEnv',
                value: function addCompileEnv() {
                    this.customConfig.compileEnv.push({
                        envName: '',
                        envValue: ''
                    });
                }
            }, {
                key: 'addConfFiles',
                value: function addConfFiles() {
                    this.config.confFiles.push({
                        tplDir: '',
                        originDir: ''
                    });
                }
            }, {
                key: 'modify',
                value: function modify() {
                    return $http.put('/api/project', angular.toJson(this._formartProject()));
                }
            }, {
                key: 'delete',
                value: function _delete() {
                    var _this4 = this;

                    var defered = $q.defer();
                    $domePublic.openDelete().then(function () {
                        projectService.deleteData(_this4.config.id).then(function () {
                            $domePublic.openPrompt('删除成功！');
                            defered.resolve();
                        }, function (res) {
                            $domePublic.openWarning({
                                title: '删除失败！',
                                msg: res.data.resultMsg
                            });
                            defered.reject('fail');
                        });
                    }, function () {
                        defered.reject('dismiss');
                    });
                    return defered.promise;
                }
            }, {
                key: 'getDockerfile',
                value: function getDockerfile() {
                    var _this5 = this;

                    var openDockerfile = function openDockerfile() {
                        $modal.open({
                            animation: true,
                            templateUrl: '/index/tpl/modal/dockerfileModal/dockerfileModal.html',
                            controller: 'DockerfileModalCtr as vm',
                            size: 'md',
                            resolve: {
                                project: _this5
                            }
                        });
                    };

                    if (this.config.userDefineDockerfile) {

                        var useDockerfileModalIns = $modal.open({
                            templateUrl: '/index/tpl/modal/branchCheckModal/branchCheckModal.html',
                            controller: 'BranchCheckModalCtr as vm',
                            size: 'md',
                            resolve: {
                                codeInfo: function codeInfo() {
                                    return _this5.config.codeInfo;
                                },
                                projectId: function projectId() {
                                    return _this5.config.id;
                                }
                            }
                        });

                        useDockerfileModalIns.result.then(function (branchInfo) {
                            _this5.config.dockerfileInfo.branch = _this5.config.dockerfileInfo.tag = null;
                            _this5.config.dockerfileInfo[branchInfo.type] = branchInfo.value;
                            openDockerfile();
                        });
                    } else {
                        openDockerfile();
                    }
                }
                // _formartCreateProject(projectInfo) {
                // return {
                //     project: projectInfo
                // creatorDraft: creatorDraft
                // };
                // }

            }, {
                key: '_formartProject',
                value: function _formartProject() {
                    var formartProject = {},
                        compileEnvStr = '',
                        createdFileStoragePathArr = [],
                        project = angular.copy(this.config),
                        customConfig = angular.copy(this.customConfig);

                    project.envConfDefault = function () {
                        var newArr = [];
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = project.envConfDefault[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var sigEnvConfDefault = _step3.value;

                                if (sigEnvConfDefault.key && sigEnvConfDefault.value) {
                                    newArr.push({
                                        key: sigEnvConfDefault.key,
                                        value: sigEnvConfDefault.value,
                                        description: sigEnvConfDefault.description
                                    });
                                }
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }

                        return newArr;
                    }();

                    project.autoBuildInfo = function () {
                        var autoBuildInfo = project.autoBuildInfo,
                            newAutoBuildInfo = void 0;
                        if (!project.codeInfo || !autoBuildInfo.other && !autoBuildInfo.master && !autoBuildInfo.tag) {
                            return null;
                        }
                        newAutoBuildInfo = {
                            tag: autoBuildInfo.tag,
                            branches: []
                        };
                        if (autoBuildInfo.other) {
                            newAutoBuildInfo.branches = autoBuildInfo.branches.split(',');
                        }
                        if (autoBuildInfo.master) {
                            newAutoBuildInfo.branches.push('master');
                        }
                        return newAutoBuildInfo;
                    }();

                    if (project.userDefineDockerfile) {
                        formartProject.name = project.name;
                        formartProject.id = project.id;
                        if (project.codeInfo) {
                            formartProject.codeInfo = project.codeInfo;
                            formartProject.autoBuildInfo = project.autoBuildInfo;
                        }
                        formartProject.exclusiveBuild = null;
                        formartProject.userDefineDockerfile = project.userDefineDockerfile;
                        formartProject.dockerfileInfo = project.dockerfileInfo;
                        formartProject.authority = project.authority;
                        formartProject.envConfDefault = project.envConfDefault;
                    } else {
                        if (project.dockerfileInfo) {
                            project.dockerfileInfo = null;
                        }
                        project.confFiles = function () {
                            var newConfFiles = {};
                            var _iteratorNormalCompletion4 = true;
                            var _didIteratorError4 = false;
                            var _iteratorError4 = undefined;

                            try {
                                for (var _iterator4 = project.confFiles[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                    var confFile = _step4.value;

                                    if (confFile.tplDir && confFile.originDir) {
                                        newConfFiles[confFile.tplDir] = confFile.originDir;
                                    }
                                }
                            } catch (err) {
                                _didIteratorError4 = true;
                                _iteratorError4 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                        _iterator4.return();
                                    }
                                } finally {
                                    if (_didIteratorError4) {
                                        throw _iteratorError4;
                                    }
                                }
                            }

                            return newConfFiles;
                        }();

                        compileEnvStr = function () {
                            var str = '',
                                strArr = [];
                            var _iteratorNormalCompletion5 = true;
                            var _didIteratorError5 = false;
                            var _iteratorError5 = undefined;

                            try {
                                for (var _iterator5 = customConfig.compileEnv[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    var env = _step5.value;

                                    if (env.envName && env.envValue) {
                                        strArr.push(env.envName + '=' + env.envValue);
                                    }
                                }
                            } catch (err) {
                                _didIteratorError5 = true;
                                _iteratorError5 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                        _iterator5.return();
                                    }
                                } finally {
                                    if (_didIteratorError5) {
                                        throw _iteratorError5;
                                    }
                                }
                            }

                            return strArr.join(',');
                        }();

                        createdFileStoragePathArr = function () {
                            var newArr = [];
                            var _iteratorNormalCompletion6 = true;
                            var _didIteratorError6 = false;
                            var _iteratorError6 = undefined;

                            try {
                                for (var _iterator6 = customConfig.createdFileStoragePath[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                    var item = _step6.value;

                                    if (item.name) {
                                        newArr.push(item.name);
                                    }
                                }
                            } catch (err) {
                                _didIteratorError6 = true;
                                _iteratorError6 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                        _iterator6.return();
                                    }
                                } finally {
                                    if (_didIteratorError6) {
                                        throw _iteratorError6;
                                    }
                                }
                            }

                            return newArr;
                        }();

                        if (this.isUseCustom) {
                            project.dockerfileConfig = null;
                            project.customDockerfile = null;
                            project.exclusiveBuild = {
                                customType: customConfig.customType,
                                compileImage: this.projectImagesIns.selectedCompileImage,
                                runImage: this.projectImagesIns.selectedRunImage,
                                codeStoragePath: customConfig.codeStoragePath,
                                compileEnv: compileEnvStr,
                                compileCmd: customConfig.compileCmd,
                                createdFileStoragePath: createdFileStoragePathArr,
                                workDir: customConfig.workDir,
                                user: customConfig.user,
                                runFileStoragePath: this.projectImagesIns.selectedRunImage.runFileStoragePath,
                                startCmd: this.projectImagesIns.selectedRunImage.startCommand
                            };
                            // 未初始化this.projectImagesIns.selectedCompileImage时
                            if (!this.projectImagesIns.selectedCompileImage.imageName) {
                                project.exclusiveBuild.compileImage = this.customConfig.compileImage;
                                project.exclusiveBuild.runImage = this.customConfig.runImage;
                                project.exclusiveBuild.runFileStoragePath = this.customConfig.runFileStoragePath;
                                project.exclusiveBuild.startCmd = this.customConfig.startCmd;
                            }
                        } else if (this.isDefDockerfile) {
                            project.exclusiveBuild = null;
                            project.dockerfileConfig = null;
                            project.customDockerfile = {
                                dockerfile: customConfig.dockerfile,
                                uploadFileInfos: customConfig.uploadFileInfos.filter(function (x) {
                                    return x.filename || x.content;
                                })
                            };
                        } else {
                            project.exclusiveBuild = null;
                            project.customDockerfile = null;
                            project.dockerfileConfig = {
                                baseImageName: customConfig.baseImageName,
                                baseImageTag: customConfig.baseImageTag,
                                baseImageRegistry: customConfig.baseImageRegistry,
                                installCmd: customConfig.installCmd,
                                codeStoragePath: customConfig.codeStoragePath,
                                compileEnv: compileEnvStr,
                                compileCmd: customConfig.compileCmd,
                                workDir: customConfig.workDir,
                                startCmd: customConfig.startCmd,
                                user: customConfig.user
                            };
                        }
                        formartProject = project;
                    }
                    return formartProject;
                }
            }, {
                key: 'create',
                value: function create(projectCollectionId) {
                    var createProject = this._formartProject();
                    // creatorDraft = angular.copy(this.creatorDraft);
                    // console.log(createProject);
                    // return $http.post('/api/projectcollection/' + projectCollectionId+ '/project', angular.toJson(this._formartCreateProject(createProject)));
                    return $http.post('/api/projectcollection/' + projectCollectionId + '/project', angular.toJson(createProject));
                }
            }]);

            return Project;
        }();

        var getInstance = $domeModel.instancesCreator({
            Project: Project,
            ProjectImages: ProjectImages
        });

        return {
            projectService: projectService,
            getInstance: getInstance,
            buildProject: buildProject
        };
    }
    DomeProject.$inject = ['$http', '$util', '$state', '$domePublic', '$domeModel', '$q', '$modal', '$domeImage'];
    projectModule.factory('$domeProject', DomeProject);
    window.projectModule = projectModule;
})(window);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9wcm9qZWN0TW9kdWxlL3Byb2plY3RNb2R1bGUuZXMiXSwibmFtZXMiOlsid2luZG93IiwidW5kZWZpbmVkIiwicHJvamVjdE1vZHVsZSIsImFuZ3VsYXIiLCJtb2R1bGUiLCJEb21lUHJvamVjdCIsIiRodHRwIiwiJHV0aWwiLCIkc3RhdGUiLCIkZG9tZVB1YmxpYyIsIiRkb21lTW9kZWwiLCIkcSIsIiRtb2RhbCIsIiRkb21lSW1hZ2UiLCJQcm9qZWN0U2VydmljZSIsInVybCIsIlNlcnZpY2VNb2RlbCIsImNhbGwiLCJnZXRQcm9qZWN0Q29sbGVjdGlvbk5hbWVCeUlkIiwicHJvamVjdENvbGxlY3Rpb25JZCIsImdldCIsImdldFByb2plY3QiLCJnZXRSZWFkTWUiLCJwcm9JZCIsImJyYW5jaCIsImdldEJ1aWxkTGlzdCIsImdldEJyYW5jaGVzIiwiZ2V0QnJhbmNoZXNXaXRob3V0SWQiLCJjb2RlSWQiLCJjb2RlTWFuYWdlclVzZXJJZCIsImNvZGVNYW5hZ2VyIiwiZ2V0VGFncyIsImdldFRhZ3NXaXRob3V0SWQiLCJnZXRHaXRMYWJJbmZvIiwiZ2V0QnVpbGREb2NrZXJmaWxlIiwiYnVpbGRJZCIsInByZXZpZXdEb2NrZXJmaWxlIiwicHJvamVjdENvbmZpZyIsInBvc3QiLCJ0b0pzb24iLCJub3RJbnRlcmNlcHQiLCJidWlsZCIsImJ1aWxkSW5mbyIsInByb2plY3RTZXJ2aWNlIiwiYnVpbGRQcm9qZWN0IiwiaGFzQ29kZUluZm8iLCJidWlsZE1vZGFsSW5zIiwib3BlbiIsImFuaW1hdGlvbiIsInRlbXBsYXRlVXJsIiwiY29udHJvbGxlciIsInNpemUiLCJyZXNvbHZlIiwicHJvamVjdEluZm8iLCJwcm9qZWN0SWQiLCJyZXN1bHQiLCJQcm9qZWN0SW1hZ2VzIiwiaW1hZ2VJbmZvIiwiY29tcGlsZUlzUHVibGljIiwicnVuSXNQdWJsaWMiLCJzZWxlY3RlZENvbXBpbGVJbWFnZSIsInNlbGVjdGVkUnVuSW1hZ2UiLCJjdXJyZW50Q29tcGlsZUxpc3QiLCJwcml2YXRlUmVnaXN0cnlJbWFnZUxpc3QiLCJzZWxlY3RlZENvbXBpbGVQcml2YXRlSW1hZ2VUYWciLCJjdXJyZW50Q29tcGlsZVByaXZhdGVJbWFnZVRhZ0xpc3QiLCJzZWxlY3RlZFJ1blByaXZhdGVJbWFnZVRhZyIsImN1cnJlbnRSdW5Qcml2YXRlSW1hZ2VUYWdMaXN0IiwiY3VycmVudFJ1bkxpc3QiLCJwcm9qZWN0SW1hZ2VzSW5mbyIsImNvbXBpbGVQdWJsaWNJbWFnZUxpc3QiLCJjb21waWxlUHJpdmF0ZUltYWdlTGlzdCIsInJ1blB1YmxpY0ltYWdlTGlzdCIsInJ1blByaXZhdGVJbWFnZUxpc3QiLCJ1c2VyTGlzdCIsImltYWdlc0luZm8iLCJpc0FycmF5IiwiZm9yRWFjaCIsImltYWdlTGlzdCIsImltYWdlTGlzdE5hbWUiLCJpbWFnZSIsImNyZWF0ZURhdGUiLCJnZXRQYWdlRGF0ZSIsImNyZWF0ZVRpbWUiLCJpbWFnZVR4dCIsImltYWdlTmFtZSIsImltYWdlVGFnIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsInRvZ2dsZUlzUHVibGljSW1hZ2UiLCJpbWFnZVR5cGUiLCJpbWFnZVNlcnZpY2UiLCJnZXRQcm9qZWN0SW1hZ2VzIiwidGhlbiIsInJlcyIsImRhdGEiLCJuZXdJbWFnZUxpc3QiLCJpIiwicmVnaXN0cnlVcmwiLCJyZWdpc3RyeSIsInJlZ2lzdHJ5VHlwZSIsInB1c2giLCJmaW5hbGx5IiwiZ2V0SW1hZ2VUYWdzIiwidGFncyIsImlzUHVibGljIiwidG9nZ2xlSW1hZ2UiLCJpbmRleCIsInRhZyIsImwiLCJpbmRleEltYWdlIiwic2VsZWN0ZWRJbWFnZVRtcCIsImdldFByaXZhdGVJbWFnZVRhZyIsImluZCIsInNlbGVjdGVkUnVuSW1hZ2VUbXAiLCJjb3B5IiwidHlwZSIsImltZ09iaiIsImlzT2JqZWN0IiwiUHJvamVjdCIsImluaXRJbmZvIiwiY29uZmlnIiwiY3VzdG9tQ29uZmlnIiwiaXNVc2VDdXN0b20iLCJpc0RlZkRvY2tlcmZpbGUiLCJwcm9qZWN0SW1hZ2VzSW5zIiwiaW5pdCIsInByb2plY3QiLCJhdXRvQnVpbGRJbmZvIiwiZG9ja2VyZmlsZUluZm8iLCJkb2NrZXJmaWxlQ29uZmlnIiwiZXhjbHVzaXZlQnVpbGQiLCJ1c2VyRGVmaW5lRG9ja2VyZmlsZSIsImN1c3RvbURvY2tlcmZpbGUiLCJuZXdBdXRvQnVpbGRJbmZvIiwiYnJhbmNoZXMiLCJtYXN0ZXIiLCJvdGhlciIsInNwbGljZSIsImpvaW4iLCJjb25mRmlsZXMiLCJuZXdBcnIiLCJ0cGxEaXIiLCJvcmlnaW5EaXIiLCJrZXkiLCJlbnZDb25mRGVmYXVsdCIsInZhbHVlIiwiZGVzY3JpcHRpb24iLCJjb21waWxlRW52IiwiZW52TmFtZSIsImVudlZhbHVlIiwiY29tcGlsZUVudkFyciIsInNwbGl0IiwibWFwIiwiaXRlbSIsInNpZ0VudiIsImJpbmQiLCJ1cGxvYWRGaWxlSW5mb3MiLCJmaWxlbmFtZSIsImNvbnRlbnQiLCJjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoIiwibmFtZSIsImltYWdlUmVnaXN0cnkiLCJiYXNlSW1hZ2VOYW1lIiwiYmFzZUltYWdlVGFnIiwiYmFzZUltYWdlUmVnaXN0cnkiLCJwdXQiLCJfZm9ybWFydFByb2plY3QiLCJkZWZlcmVkIiwiZGVmZXIiLCJvcGVuRGVsZXRlIiwiZGVsZXRlRGF0YSIsImlkIiwib3BlblByb21wdCIsIm9wZW5XYXJuaW5nIiwidGl0bGUiLCJtc2ciLCJyZXN1bHRNc2ciLCJyZWplY3QiLCJwcm9taXNlIiwib3BlbkRvY2tlcmZpbGUiLCJ1c2VEb2NrZXJmaWxlTW9kYWxJbnMiLCJjb2RlSW5mbyIsImJyYW5jaEluZm8iLCJmb3JtYXJ0UHJvamVjdCIsImNvbXBpbGVFbnZTdHIiLCJjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoQXJyIiwic2lnRW52Q29uZkRlZmF1bHQiLCJhdXRob3JpdHkiLCJuZXdDb25mRmlsZXMiLCJjb25mRmlsZSIsInN0ciIsInN0ckFyciIsImVudiIsImN1c3RvbVR5cGUiLCJjb21waWxlSW1hZ2UiLCJydW5JbWFnZSIsImNvZGVTdG9yYWdlUGF0aCIsImNvbXBpbGVDbWQiLCJ3b3JrRGlyIiwidXNlciIsInJ1bkZpbGVTdG9yYWdlUGF0aCIsInN0YXJ0Q21kIiwic3RhcnRDb21tYW5kIiwiZG9ja2VyZmlsZSIsImZpbHRlciIsIngiLCJpbnN0YWxsQ21kIiwiY3JlYXRlUHJvamVjdCIsImdldEluc3RhbmNlIiwiaW5zdGFuY2VzQ3JlYXRvciIsIiRpbmplY3QiLCJmYWN0b3J5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7QUFLQSxDQUFDLFVBQUNBLE1BQUQsRUFBU0MsU0FBVCxFQUF1QjtBQUNwQjtBQUNBOztBQUNBLFFBQUlDLGdCQUFnQkMsUUFBUUMsTUFBUixDQUFlLGVBQWYsRUFBZ0MsRUFBaEMsQ0FBcEI7O0FBRUEsYUFBU0MsV0FBVCxDQUFxQkMsS0FBckIsRUFBNEJDLEtBQTVCLEVBQW1DQyxNQUFuQyxFQUEyQ0MsV0FBM0MsRUFBd0RDLFVBQXhELEVBQW9FQyxFQUFwRSxFQUF3RUMsTUFBeEUsRUFBZ0ZDLFVBQWhGLEVBQTRGO0FBQ3hGLFlBQU1DLGlCQUFpQixTQUFqQkEsY0FBaUIsR0FBWTtBQUFBOztBQUMvQixpQkFBS0MsR0FBTCxHQUFXLGFBQVg7QUFDQUwsdUJBQVdNLFlBQVgsQ0FBd0JDLElBQXhCLENBQTZCLElBQTdCLEVBQW1DLEtBQUtGLEdBQXhDO0FBQ0EsaUJBQUtHLDRCQUFMLEdBQW9DLFVBQUNDLG1CQUFEO0FBQUEsdUJBQXlCYixNQUFNYyxHQUFOLDZCQUFvQ0QsbUJBQXBDLFdBQXpCO0FBQUEsYUFBcEM7QUFDQSxpQkFBS0UsVUFBTCxHQUFrQixVQUFDRixtQkFBRDtBQUFBLHVCQUF5QmIsTUFBTWMsR0FBTiw2QkFBb0NELG1CQUFwQyxjQUF6QjtBQUFBLGFBQWxCO0FBQ0EsaUJBQUtHLFNBQUwsR0FBaUIsVUFBQ0MsS0FBRCxFQUFRQyxNQUFSO0FBQUEsdUJBQW1CbEIsTUFBTWMsR0FBTixDQUFhLE1BQUtMLEdBQWxCLGdCQUFnQ1EsS0FBaEMsU0FBeUNDLE1B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T0FBVixFQUFtQixRQUFuQixFQUE2QixhQUE3QixFQUE0QyxZQUE1QyxFQUEwRCxJQUExRCxFQUFnRSxRQUFoRSxFQUEwRSxZQUExRSxDQUF0QjtBQUNBbE4sa0JBQWNtTixPQUFkLENBQXNCLGNBQXRCLEVBQXNDaE4sV0FBdEM7QUFDQUwsV0FBT0UsYUFBUCxHQUF1QkEsYUFBdkI7QUFDSCxDQXZzQkQsRUF1c0JHRixNQXZzQkgiLCJmaWxlIjoiY29tbW9uL3Byb2plY3RNb2R1bGUvcHJvamVjdE1vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXHJcbiAqIEBhdXRob3IgIENoYW5kcmFMZWVcclxuICogQGRlc2NyaXB0aW9uICDpobnnm67mqKHlnZdcclxuICovXHJcblxyXG4oKHdpbmRvdywgdW5kZWZpbmVkKSA9PiB7XHJcbiAgICAvLyDpobnnm67nrqHnkIZzZXJ2aWNlXHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBsZXQgcHJvamVjdE1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwcm9qZWN0TW9kdWxlJywgW10pO1xyXG5cclxuICAgIGZ1bmN0aW9uIERvbWVQcm9qZWN0KCRodHRwLCAkdXRpbCwgJHN0YXRlLCAkZG9tZVB1YmxpYywgJGRvbWVNb2RlbCwgJHEsICRtb2RhbCwgJGRvbWVJbWFnZSkge1xyXG4gICAgICAgIGNvbnN0IFByb2plY3RTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLnVybCA9ICdhcGkvcHJvamVjdCc7XHJcbiAgICAgICAgICAgICRkb21lTW9kZWwuU2VydmljZU1vZGVsLmNhbGwodGhpcywgdGhpcy51cmwpO1xyXG4gICAgICAgICAgICB0aGlzLmdldFByb2plY3RDb2xsZWN0aW9uTmFtZUJ5SWQgPSAocHJvamVjdENvbGxlY3Rpb25JZCkgPT4gJGh0dHAuZ2V0KGAvYXBpL3Byb2plY3Rjb2xsZWN0aW9uLyR7cHJvamVjdENvbGxlY3Rpb25JZH0vbmFtZWApO1xyXG4gICAgICAgICAgICB0aGlzLmdldFByb2plY3QgPSAocHJvamVjdENvbGxlY3Rpb25JZCkgPT4gJGh0dHAuZ2V0KGAvYXBpL3Byb2plY3Rjb2xsZWN0aW9uLyR7cHJvamVjdENvbGxlY3Rpb25JZH0vcHJvamVjdGApO1xyXG4gICAgICAgICAgICB0aGlzLmdldFJlYWRNZSA9IChwcm9JZCwgYnJhbmNoKSA9PiAkaHR0cC5nZXQoYCR7dGhpcy51cmx9L3JlYWRtZS8ke3Byb0lkfS8ke2JyYW5jaH1gKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRCdWlsZExpc3QgPSBwcm9JZCA9PiAkaHR0cC5nZXQoYC9hcGkvY2kvYnVpbGQvJHtwcm9JZH1gKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRCcmFuY2hlcyA9IHByb0lkID0+ICRodHRwLmdldChgJHt0aGlzLnVybH0vYnJhbmNoZXMvJHtwcm9JZH1gKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRCcmFuY2hlc1dpdGhvdXRJZCA9IChjb2RlSWQsIGNvZGVNYW5hZ2VyVXNlcklkLCBjb2RlTWFuYWdlcikgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS9icmFuY2hlcy8ke2NvZGVNYW5hZ2VyfS8ke2NvZGVJZH0vJHtjb2RlTWFuYWdlclVzZXJJZH1gKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRUYWdzID0gcHJvSWQgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS90YWdzLyR7cHJvSWR9YCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0VGFnc1dpdGhvdXRJZCA9IChjb2RlSWQsIGNvZGVNYW5hZ2VyVXNlcklkLCBjb2RlTWFuYWdlcikgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS90YWdzLyR7Y29kZU1hbmFnZXJ9LyR7Y29kZUlkfS8ke2NvZGVNYW5hZ2VyVXNlcklkfWApO1xyXG4gICAgICAgICAgICB0aGlzLmdldEdpdExhYkluZm8gPSAoKSA9PiAkaHR0cC5nZXQoYCR7dGhpcy51cmx9L2dpdC9naXRsYWJpbmZvYCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0QnVpbGREb2NrZXJmaWxlID0gKHByb0lkLCBidWlsZElkKSA9PiAkaHR0cC5nZXQoYC9hcGkvY2kvYnVpbGQvZG9ja2VyZmlsZS8ke3Byb0lkfS8ke2J1aWxkSWR9YCk7XHJcbiAgICAgICAgICAgIHRoaXMucHJldmlld0RvY2tlcmZpbGUgPSAocHJvamVjdENvbmZpZykgPT4gJGh0dHAucG9zdCgnL2FwaS9jaS9idWlsZC9kb2NrZXJmaWxlJywgYW5ndWxhci50b0pzb24ocHJvamVjdENvbmZpZyksIHtcclxuICAgICAgICAgICAgICAgIG5vdEludGVyY2VwdDogdHJ1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5idWlsZCA9IChidWlsZEluZm8pID0+ICRodHRwLnBvc3QoJy9hcGkvY2kvYnVpbGQvc3RhcnQnLCBhbmd1bGFyLnRvSnNvbihidWlsZEluZm8pLCB7XHJcbiAgICAgICAgICAgICAgICBub3RJbnRlcmNlcHQ6IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBwcm9qZWN0U2VydmljZSA9IG5ldyBQcm9qZWN0U2VydmljZSgpO1xyXG5cclxuICAgICAgICBjb25zdCBidWlsZFByb2plY3QgPSAocHJvSWQsIGhhc0NvZGVJbmZvKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkTW9kYWxJbnMgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IHRydWUsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9pbmRleC90cGwvbW9kYWwvYnVpbGRNb2RhbC9idWlsZE1vZGFsLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0J1aWxkTW9kYWxDdHIgYXMgdm0nLFxyXG4gICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcclxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SW5mbzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SWQ6IHByb0lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDb2RlSW5mbzogaGFzQ29kZUluZm9cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRNb2RhbElucy5yZXN1bHQ7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY2xhc3MgUHJvamVjdEltYWdlcyB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUluZm8gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZUlzUHVibGljOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bklzUHVibGljOiAxXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbXBpbGVJbWFnZSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFJ1bkltYWdlID0ge307XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRDb21waWxlTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgLy8g56eB5pyJ5LuT5bqT5omA5pyJ6ZWc5YOPXHJcbiAgICAgICAgICAgICAgICB0aGlzLnByaXZhdGVSZWdpc3RyeUltYWdlTGlzdCA9IFtdXHJcbiAgICAgICAgICAgICAgICAvLyDnp4HmnInku5PlupNjb21waWxl6ZWc5YOPXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29tcGlsZVByaXZhdGVJbWFnZVRhZyA9IHt9O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q29tcGlsZVByaXZhdGVJbWFnZVRhZ0xpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIC8v56eB5pyJ5LuT5bqTcnVu6ZWc5YOPXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkUnVuUHJpdmF0ZUltYWdlVGFnID0ge307XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSdW5Qcml2YXRlSW1hZ2VUYWdMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSdW5MaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb2plY3RJbWFnZXNJbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVQdWJsaWNJbWFnZUxpc3Q6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVQcml2YXRlSW1hZ2VMaXN0OiBbXSxcclxuICAgICAgICAgICAgICAgICAgICBydW5QdWJsaWNJbWFnZUxpc3Q6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIHJ1blByaXZhdGVJbWFnZUxpc3Q6IFtdXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluaXQoaW1hZ2VzSW5mbykge1xyXG4gICAgICAgICAgICAgICAgLy90aGlzLmdldFByb2plY3RJbWFnZUFzUHJpdmF0ZUltYWdlTGlzdCgnYWxsJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWltYWdlc0luZm8pXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VzSW5mbyA9IHt9O1xyXG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KGltYWdlc0luZm8uY29tcGlsZVB1YmxpY0ltYWdlTGlzdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZXNJbmZvLmNvbXBpbGVQdWJsaWNJbWFnZUxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheShpbWFnZXNJbmZvLmNvbXBpbGVQcml2YXRlSW1hZ2VMaXN0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlc0luZm8uY29tcGlsZVByaXZhdGVJbWFnZUxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZXNJbmZvLmNvbXBpbGVQcml2YXRlSW1hZ2VMaXN0ID0gdGhpcy5wcml2YXRlUmVnaXN0cnlJbWFnZUxpc3Q7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkoaW1hZ2VzSW5mby5ydW5QdWJsaWNJbWFnZUxpc3QpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VzSW5mby5ydW5QdWJsaWNJbWFnZUxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheShpbWFnZXNJbmZvLnJ1blByaXZhdGVJbWFnZUxpc3QpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VzSW5mby5ydW5Qcml2YXRlSW1hZ2VMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VzSW5mby5ydW5Qcml2YXRlSW1hZ2VMaXN0ID0gdGhpcy5wcml2YXRlUmVnaXN0cnlJbWFnZUxpc3Q7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGltYWdlc0luZm8sIChpbWFnZUxpc3QsIGltYWdlTGlzdE5hbWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpbWFnZSBvZiBpbWFnZUxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuY3JlYXRlRGF0ZSA9ICR1dGlsLmdldFBhZ2VEYXRlKGltYWdlLmNyZWF0ZVRpbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5pbWFnZVR4dCA9IGltYWdlLmltYWdlTmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlLmltYWdlVGFnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5pbWFnZVR4dCArPSAnOicgKyBpbWFnZS5pbWFnZVRhZztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9qZWN0SW1hZ2VzSW5mbyA9IGltYWdlc0luZm87XHJcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5zZWxlY3RlZENvbXBpbGVJbWFnZSkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVJc1B1YmxpY0ltYWdlKCdjb21waWxlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVJc1B1YmxpY0ltYWdlKCdydW4nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyDojrflj5bnp4HmnInplZzlg4/nmoTlt6XnqIvplZzlg4/vvIzlubbovazmjaLmiJBjb21waWxlUHJpdmF0ZUltYWdlTGlzdOagvOW8j1xyXG4gICAgICAgICAgICBnZXRQcm9qZWN0SW1hZ2VBc1ByaXZhdGVJbWFnZUxpc3QoaW1hZ2VUeXBlKXtcclxuICAgICAgICAgICAgICAgICRkb21lSW1hZ2UuaW1hZ2VTZXJ2aWNlLmdldFByb2plY3RJbWFnZXMoKS50aGVuKChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2VMaXN0ID0gcmVzLmRhdGEucmVzdWx0IHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdJbWFnZUxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpPTA7IGkgPCBpbWFnZUxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlID0gaW1hZ2VMaXN0W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5jcmVhdGVEYXRlID0gJHV0aWwuZ2V0UGFnZURhdGUoaW1hZ2UuY3JlYXRlVGltZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLmltYWdlVHh0ID0gaW1hZ2UuaW1hZ2VOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5yZWdpc3RyeVVybCA9IGltYWdlLnJlZ2lzdHJ5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5yZWdpc3RyeVR5cGUgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2ltYWdlLmltYWdlVGFnIOWQjue7reWhq+WFpVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2UuaW1hZ2VUYWcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLmltYWdlVHh0ICs9ICc6JyArIGltYWdlLmltYWdlVGFnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0ltYWdlTGlzdC5wdXNoKGltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoaW1hZ2VUeXBlID09PSAnY29tcGlsZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9qZWN0SW1hZ2VzSW5mby5jb21waWxlUHJpdmF0ZUltYWdlTGlzdCA9IG5ld0ltYWdlTGlzdDsgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNlIGlmIChpbWFnZVR5cGUgPT09ICdydW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdEltYWdlc0luZm8ucnVuUHJpdmF0ZUltYWdlTGlzdCA9IG5ld0ltYWdlTGlzdDtcclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZSBpZihpbWFnZVR5cGUgPT09ICdhbGwnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcml2YXRlUmVnaXN0cnlJbWFnZUxpc3QgPSBuZXdJbWFnZUxpc3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZ2V0UHJpdmF0ZUltYWdlVGFnKGltYWdlVHlwZSxpbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgJGRvbWVJbWFnZS5pbWFnZVNlcnZpY2UuZ2V0SW1hZ2VUYWdzKGltYWdlLmltYWdlTmFtZSwgaW1hZ2UucmVnaXN0cnlVcmwpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWdzID0gcmVzLmRhdGEucmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGltYWdlVHlwZSA9PT0gJ2NvbXBpbGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudENvbXBpbGVQcml2YXRlSW1hZ2VUYWdMaXN0ID0gdGFnczsgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2UgaWYgKGltYWdlVHlwZSA9PT0gJ3J1bicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UnVuUHJpdmF0ZUltYWdlVGFnTGlzdCA9IHRhZ3M7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG9nZ2xlSXNQdWJsaWNJbWFnZShpbWFnZVR5cGUsIGlzUHVibGljKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpc1B1YmxpYyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNQdWJsaWMgPSBpbWFnZVR5cGUgPT0gJ2NvbXBpbGUnID8gdGhpcy5pbWFnZUluZm8uY29tcGlsZUlzUHVibGljIDogdGhpcy5pbWFnZUluZm8ucnVuSXNQdWJsaWM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZVR5cGUgPT0gJ2NvbXBpbGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudENvbXBpbGVMaXN0ID0gaXNQdWJsaWMgPT09IDEgPyB0aGlzLnByb2plY3RJbWFnZXNJbmZvLmNvbXBpbGVQdWJsaWNJbWFnZUxpc3QgOiB0aGlzLnByb2plY3RJbWFnZXNJbmZvLmNvbXBpbGVQcml2YXRlSW1hZ2VMaXN0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUltYWdlKCdjb21waWxlJywgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UnVuTGlzdCA9IGlzUHVibGljID09PSAxID8gdGhpcy5wcm9qZWN0SW1hZ2VzSW5mby5ydW5QdWJsaWNJbWFnZUxpc3QgOiB0aGlzLnByb2plY3RJbWFnZXNJbmZvLnJ1blByaXZhdGVJbWFnZUxpc3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlSW1hZ2UoJ3J1bicsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy/liIfmjaLnp4HmnInplZzlg490YWfvvIzlubbkuLrnp4HmnInplZzlg4/mt7vliqB0YWdcclxuICAgICAgICAgICAgdG9nZ2xlUHJpdmF0ZUltYWdlVGFnKGltYWdlVHlwZSwgaW5kZXgsIHRhZykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGltYWdlVHlwZSA9PT0gJ2NvbXBpbGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbXBpbGVQcml2YXRlSW1hZ2VUYWcgPSB0aGlzLmN1cnJlbnRDb21waWxlUHJpdmF0ZUltYWdlVGFnTGlzdFtpbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBsPTA7IGw8IHRoaXMuY3VycmVudENvbXBpbGVMaXN0Lmxlbmd0aDsgbCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudENvbXBpbGVMaXN0W2xdLmltYWdlTmFtZSA9PT0gdGFnLmltYWdlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q29tcGlsZUxpc3RbbF0uaW1hZ2VUYWcgPSB0aGlzLnNlbGVjdGVkQ29tcGlsZVByaXZhdGVJbWFnZVRhZy50YWc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaW1hZ2VUeXBlID09PSAncnVuJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSdW5Qcml2YXRlSW1hZ2VUYWcgPSB0aGlzLmN1cnJlbnRSdW5Qcml2YXRlSW1hZ2VUYWdMaXN0W2luZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGw9MDsgbDwgdGhpcy5jdXJyZW50UnVuTGlzdC5sZW5ndGg7IGwrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmN1cnJlbnRSdW5MaXN0W2xdLmltYWdlTmFtZSA9PT0gdGFnLmltYWdlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UnVuTGlzdFtsXS5pbWFnZVRhZyA9IHRoaXMuc2VsZWN0ZWRSdW5Qcml2YXRlSW1hZ2VUYWcudGFnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIEBwYXJhbSBpbWFnZVR5cGU6ICdjb21waWxlKOe8luivkemVnOWDjykvJ3J1bico6L+Q6KGM6ZWc5YOPKVxyXG4gICAgICAgICAgICAgICAgLy8gQHBhcmFtIGluZGV4OiDliIfmjaLliLBpbWFnZVR5cGXplZzlg4/nmoRpbmRleOS4i+agh1xyXG4gICAgICAgICAgICB0b2dnbGVJbWFnZShpbWFnZVR5cGUsIGluZGV4LCBpbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZVR5cGUgPT09ICdjb21waWxlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWFnZUluZm8uY29tcGlsZUlzUHVibGljID09PSAwIHx8IHR5cGVvZiBpbWFnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcy5zZWxlY3RlZENvbXBpbGVJbWFnZSA9IHRoaXMuY3VycmVudENvbXBpbGVMaXN0W2luZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb21waWxlUHJpdmF0ZUltYWdlVGFnID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2YgaW1hZ2UgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UgPSB0aGlzLmN1cnJlbnRDb21waWxlTGlzdFswXTsgLy/liIfmjaJyYWRpb+aXtmltYWdl5Li6dW5kZWZpbmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGluZGV4SW1hZ2UgPSAwOyBpbmRleEltYWdlIDwgdGhpcy5jdXJyZW50Q29tcGlsZUxpc3QubGVuZ3RoOyBpbmRleEltYWdlICsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkSW1hZ2VUbXAgPSB0aGlzLmN1cnJlbnRDb21waWxlTGlzdFtpbmRleEltYWdlXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRJbWFnZVRtcC5pbWFnZVR4dCA9PSBpbWFnZS5pbWFnZVR4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29tcGlsZUltYWdlID0gc2VsZWN0ZWRJbWFnZVRtcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRQcml2YXRlSW1hZ2VUYWcoJ2NvbXBpbGUnLGltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbWFnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGluZGV4SW1hZ2UgPSAwOyBpbmRleEltYWdlIDwgdGhpcy5jdXJyZW50Q29tcGlsZUxpc3QubGVuZ3RoOyBpbmRleEltYWdlICsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZEltYWdlVG1wID0gdGhpcy5jdXJyZW50Q29tcGlsZUxpc3RbaW5kZXhJbWFnZV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZEltYWdlVG1wLmltYWdlVHh0ID09IGltYWdlLmltYWdlVHh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29tcGlsZUltYWdlID0gc2VsZWN0ZWRJbWFnZVRtcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb21waWxlSW1hZ2UgPSB0aGlzLmN1cnJlbnRDb21waWxlTGlzdFtpbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGltYWdlVHlwZSA9PT0gJ3J1bicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VJbmZvLnJ1bklzUHVibGljID09PSAwIHx8IHR5cGVvZiBpbWFnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcy5zZWxlY3RlZFJ1bkltYWdlID0gdGhpcy5jdXJyZW50UnVuTGlzdFtpbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkUnVuUHJpdmF0ZUltYWdlVGFnID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2YgaW1hZ2UgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UgPSB0aGlzLmN1cnJlbnRSdW5MaXN0WzBdOyAvL+WIh+aNonJhZGlv5pe2aW1hZ2XkuLp1bmRlZmluZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaW5kID0gMDsgaW5kIDwgdGhpcy5jdXJyZW50UnVuTGlzdC5sZW5ndGg7IGluZCArKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZFJ1bkltYWdlVG1wID0gdGhpcy5jdXJyZW50UnVuTGlzdFtpbmRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZFJ1bkltYWdlVG1wLmltYWdlVHh0ID09IGltYWdlLmltYWdlVHh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSdW5JbWFnZSA9IHNlbGVjdGVkUnVuSW1hZ2VUbXA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0UHJpdmF0ZUltYWdlVGFnKCdydW4nLGltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbWFnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGluZCA9IDA7IGluZCA8IHRoaXMuY3VycmVudFJ1bkxpc3QubGVuZ3RoOyBpbmQgKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUnVuSW1hZ2VUbXAgPSB0aGlzLmN1cnJlbnRSdW5MaXN0W2luZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZFJ1bkltYWdlVG1wLmltYWdlVHh0ID09IGltYWdlLmltYWdlVHh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkUnVuSW1hZ2UgPSBzZWxlY3RlZFJ1bkltYWdlVG1wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFJ1bkltYWdlID0gYW5ndWxhci5jb3B5KHRoaXMuY3VycmVudFJ1bkxpc3RbaW5kZXhdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIOiuvue9rum7mOiupOmAieaLqeeahOmVnOWDj1xyXG4gICAgICAgICAgICB0b2dnbGVTcGVjaWZpZWRJbWFnZSh0eXBlLCBpbWdPYmopIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbWFnZVR4dCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgaWYgKCR1dGlsLmlzT2JqZWN0KGltZ09iaikpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZVR4dCA9IGltZ09iai5pbWFnZU5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltZ09iai5pbWFnZVRhZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVR4dCArPSAnOicgKyBpbWdPYmouaW1hZ2VUYWc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpbWdPYmogPSB7fTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdjb21waWxlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb21waWxlSW1hZ2UgPSBpbWdPYmo7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbXBpbGVJbWFnZS5pbWFnZVR4dCA9IGltYWdlVHh0O1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb21waWxlUHJpdmF0ZUltYWdlVGFnLnRhZyA9IGltZ09iai5pbWFnZVRhZztcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlSW5mby5jb21waWxlSXNQdWJsaWMgPSBpbWdPYmoucmVnaXN0cnlUeXBlICE9PSB2b2lkIDAgPyBpbWdPYmoucmVnaXN0cnlUeXBlIDogMTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRDb21waWxlTGlzdCA9IGltZ09iai5yZWdpc3RyeVR5cGUgPT09IDEgPyB0aGlzLnByb2plY3RJbWFnZXNJbmZvLmNvbXBpbGVQdWJsaWNJbWFnZUxpc3QgOiB0aGlzLnByb2plY3RJbWFnZXNJbmZvLmNvbXBpbGVQcml2YXRlSW1hZ2VMaXN0O1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFJ1bkltYWdlID0gaW1nT2JqO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSdW5JbWFnZS5pbWFnZVR4dCA9IGltYWdlVHh0O1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSdW5Qcml2YXRlSW1hZ2VUYWcudGFnID0gaW1nT2JqLmltYWdlVGFnO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VJbmZvLnJ1bklzUHVibGljID0gaW1nT2JqLnJlZ2lzdHJ5VHlwZSAhPT0gdm9pZCAwID8gaW1nT2JqLnJlZ2lzdHJ5VHlwZSA6IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UnVuTGlzdCA9IGltZ09iai5yZWdpc3RyeVR5cGUgPT09IDEgPyB0aGlzLnByb2plY3RJbWFnZXNJbmZvLnJ1blB1YmxpY0ltYWdlTGlzdCA6IHRoaXMucHJvamVjdEltYWdlc0luZm8ucnVuUHJpdmF0ZUltYWdlTGlzdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNsYXNzIFByb2plY3Qge1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvcihpbml0SW5mbykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7fTtcclxuICAgICAgICAgICAgICAgIC8vIOaPkOWPluWFrOWFsWNvbmZpZyzkv53mjIF2aWV35LiN5Y+YXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZyA9IHt9O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1VzZUN1c3RvbSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0RlZkRvY2tlcmZpbGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdEltYWdlc0lucyA9IG5ldyBQcm9qZWN0SW1hZ2VzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoaW5pdEluZm8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluaXQocHJvamVjdCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGkgPSAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dG9CdWlsZEluZm87XHJcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KHByb2plY3QpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdCA9IHt9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcgPSB7fTtcclxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNPYmplY3QocHJvamVjdC5kb2NrZXJmaWxlSW5mbykpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmRvY2tlcmZpbGVJbmZvID0ge307XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KHByb2plY3QuZG9ja2VyZmlsZUNvbmZpZykpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmRvY2tlcmZpbGVDb25maWcgPSB7fTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChwcm9qZWN0LmV4Y2x1c2l2ZUJ1aWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcgPSBwcm9qZWN0LmV4Y2x1c2l2ZUJ1aWxkO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNVc2VDdXN0b20gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNEZWZEb2NrZXJmaWxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb2plY3QudXNlckRlZmluZURvY2tlcmZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZyA9IHByb2plY3QuZG9ja2VyZmlsZUluZm87XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1VzZUN1c3RvbSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNEZWZEb2NrZXJmaWxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb2plY3QuY3VzdG9tRG9ja2VyZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnID0gcHJvamVjdC5jdXN0b21Eb2NrZXJmaWxlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNVc2VDdXN0b20gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzRGVmRG9ja2VyZmlsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnID0gcHJvamVjdC5kb2NrZXJmaWxlQ29uZmlnO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNVc2VDdXN0b20gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzRGVmRG9ja2VyZmlsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8g5Yid5aeL5YyWIGF1dG9CdWlsZEluZm9cclxuICAgICAgICAgICAgICAgIHRoaXMuYXV0b0J1aWxkSW5mbyA9IGFuZ3VsYXIuY29weShwcm9qZWN0LmF1dG9CdWlsZEluZm8pO1xyXG4gICAgICAgICAgICAgICAgcHJvamVjdC5hdXRvQnVpbGRJbmZvID0gKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYXV0b0J1aWxkSW5mbyA9IHByb2plY3QuYXV0b0J1aWxkSW5mbyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXV0b0J1aWxkSW5mbywgYnJhbmNoZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc09iamVjdChhdXRvQnVpbGRJbmZvKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzdGVyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5jaGVzOiAnJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmFuY2hlcyA9IHByb2plY3QuYXV0b0J1aWxkSW5mby5icmFuY2hlcztcclxuICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWc6IGF1dG9CdWlsZEluZm8udGFnIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hc3RlcjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmNoZXM6ICcnXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYnJhbmNoZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBicmFuY2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJyYW5jaGVzW2ldID09ICdtYXN0ZXInKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXV0b0J1aWxkSW5mby5tYXN0ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5jaGVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJyYW5jaGVzLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXV0b0J1aWxkSW5mby5vdGhlciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvLmJyYW5jaGVzID0gYnJhbmNoZXMuam9pbignLCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBdXRvQnVpbGRJbmZvO1xyXG5cclxuICAgICAgICAgICAgICAgIH0pKCk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIHByb2plY3QuY29uZkZpbGVzID0gKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY29uZkZpbGVzID0gcHJvamVjdC5jb25mRmlsZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0FyciA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNPYmplY3QoY29uZkZpbGVzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRwbERpcjogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5EaXI6ICcnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMoY29uZkZpbGVzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBcnIucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cGxEaXI6IGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbkRpcjogY29uZkZpbGVzW2tleV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG5ld0Fyci5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHBsRGlyOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luRGlyOiAnJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBcnI7XHJcbiAgICAgICAgICAgICAgICB9KSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheShwcm9qZWN0LmVudkNvbmZEZWZhdWx0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3QuZW52Q29uZkRlZmF1bHQgPSBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHByb2plY3QuZW52Q29uZkRlZmF1bHQucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnJyxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5jb21waWxlRW52ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb21waWxlRW52ID0gdGhpcy5jdXN0b21Db25maWcuY29tcGlsZUVudjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbXBpbGVFbnYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZOYW1lOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudlZhbHVlOiAnJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb21waWxlRW52ICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYW5ndWxhci5jb3B5KGNvbXBpbGVFbnYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY29tcGlsZUVudkFyciA9IGNvbXBpbGVFbnYuc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3QXJyID0gY29tcGlsZUVudkFyci5tYXAoKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNpZ0VudiA9IGl0ZW0uc3BsaXQoJz0nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudk5hbWU6IHNpZ0VudlswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudlZhbHVlOiBzaWdFbnZbMV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdBcnIucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudk5hbWU6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnZWYWx1ZTogJydcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXJyO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcudXBsb2FkRmlsZUluZm9zID0gKCh1cGxvYWRGaWxlSW5mb3MpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXVwbG9hZEZpbGVJbmZvcykgdXBsb2FkRmlsZUluZm9zID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF1cGxvYWRGaWxlSW5mb3MubGVuZ3RoKSB1cGxvYWRGaWxlSW5mb3MucHVzaCh7IGZpbGVuYW1lOiAnJywgY29udGVudDogJycgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVwbG9hZEZpbGVJbmZvcztcclxuICAgICAgICAgICAgICAgIH0pKHRoaXMuY3VzdG9tQ29uZmlnLnVwbG9hZEZpbGVJbmZvcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcuY3JlYXRlZEZpbGVTdG9yYWdlUGF0aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY3JlYXRlZEZpbGVTdG9yYWdlUGF0aCA9IHRoaXMuY3VzdG9tQ29uZmlnLmNyZWF0ZWRGaWxlU3RvcmFnZVBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KGNyZWF0ZWRGaWxlU3RvcmFnZVBhdGgpIHx8IGNyZWF0ZWRGaWxlU3RvcmFnZVBhdGgubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcclxuICAgICAgICAgICAgICAgICAgICAgICAgfV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdBcnIgPSBjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoLm1hcCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0Fyci5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXJyO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSBwcm9qZWN0O1xyXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5jcmVhdG9yRHJhZnQgPSB7fTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXNldENvbmZpZygpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRvY2tlcmZpbGVDb25maWcgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZG9ja2VyZmlsZUluZm8gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZXhjbHVzaXZlQnVpbGQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29uZkZpbGVzID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmVudkNvbmZEZWZhdWx0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmF1dG9CdWlsZEluZm8gPSB0aGlzLmF1dG9CdWlsZEluZm87XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQodGhpcy5jb25maWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZUFyckl0ZW0oaXRlbSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnW2l0ZW1dLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVsZXRlQ29tcGlsZUVudihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcuY29tcGlsZUVudi5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZUNyZWF0ZWRGaWxlU3RvcmFnZVBhdGgoaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnLmNyZWF0ZWRGaWxlU3RvcmFnZVBhdGguc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhZGRFbnZDb25mRGVmYXVsdCgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmVudkNvbmZEZWZhdWx0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGtleTogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWRkVXBsb2FkRmlsZUluZm8oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy51cGxvYWRGaWxlSW5mb3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICcnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWxVcGxvYWRGaWxlSW5mbyhpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcudXBsb2FkRmlsZUluZm9zLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG9nZ2xlQmFzZUltYWdlKGltYWdlTmFtZSwgaW1hZ2VUYWcsIGltYWdlUmVnaXN0cnkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnLmJhc2VJbWFnZU5hbWUgPSBpbWFnZU5hbWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5iYXNlSW1hZ2VUYWcgPSBpbWFnZVRhZztcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnLmJhc2VJbWFnZVJlZ2lzdHJ5ID0gaW1hZ2VSZWdpc3RyeTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhZGRDcmVhdGVkRmlsZVN0b3JhZ2VQYXRoKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcuY3JlYXRlZEZpbGVTdG9yYWdlUGF0aC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWRkQ29tcGlsZUVudigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnLmNvbXBpbGVFbnYucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgZW52TmFtZTogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgZW52VmFsdWU6ICcnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhZGRDb25mRmlsZXMoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jb25mRmlsZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdHBsRGlyOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICBvcmlnaW5EaXI6ICcnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtb2RpZnkoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCcvYXBpL3Byb2plY3QnLCBhbmd1bGFyLnRvSnNvbih0aGlzLl9mb3JtYXJ0UHJvamVjdCgpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVsZXRlKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRlZmVyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlbkRlbGV0ZSgpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RTZXJ2aWNlLmRlbGV0ZURhdGEodGhpcy5jb25maWcuaWQpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCfliKDpmaTmiJDlip/vvIEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+WIoOmZpOWksei0pe+8gScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoJ2ZhaWwnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdCgnZGlzbWlzcycpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGdldERvY2tlcmZpbGUoKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG9wZW5Eb2NrZXJmaWxlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICRtb2RhbC5vcGVuKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9pbmRleC90cGwvbW9kYWwvZG9ja2VyZmlsZU1vZGFsL2RvY2tlcmZpbGVNb2RhbC5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0RvY2tlcmZpbGVNb2RhbEN0ciBhcyB2bScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcudXNlckRlZmluZURvY2tlcmZpbGUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlRG9ja2VyZmlsZU1vZGFsSW5zID0gJG1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9pbmRleC90cGwvbW9kYWwvYnJhbmNoQ2hlY2tNb2RhbC9icmFuY2hDaGVja01vZGFsLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQnJhbmNoQ2hlY2tNb2RhbEN0ciBhcyB2bScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVJbmZvOiAoKSA9PiB0aGlzLmNvbmZpZy5jb2RlSW5mbyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogKCkgPT4gdGhpcy5jb25maWcuaWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB1c2VEb2NrZXJmaWxlTW9kYWxJbnMucmVzdWx0LnRoZW4oKGJyYW5jaEluZm8pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZG9ja2VyZmlsZUluZm8uYnJhbmNoID0gdGhpcy5jb25maWcuZG9ja2VyZmlsZUluZm8udGFnID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZG9ja2VyZmlsZUluZm9bYnJhbmNoSW5mby50eXBlXSA9IGJyYW5jaEluZm8udmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW5Eb2NrZXJmaWxlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wZW5Eb2NrZXJmaWxlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gX2Zvcm1hcnRDcmVhdGVQcm9qZWN0KHByb2plY3RJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIHByb2plY3Q6IHByb2plY3RJbmZvXHJcbiAgICAgICAgICAgICAgICAvLyBjcmVhdG9yRHJhZnQ6IGNyZWF0b3JEcmFmdFxyXG4gICAgICAgICAgICAgICAgLy8gfTtcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICBfZm9ybWFydFByb2plY3QoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZm9ybWFydFByb2plY3QgPSB7fSxcclxuICAgICAgICAgICAgICAgICAgICBjb21waWxlRW52U3RyID0gJycsXHJcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEZpbGVTdG9yYWdlUGF0aEFyciA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3QgPSBhbmd1bGFyLmNvcHkodGhpcy5jb25maWcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbUNvbmZpZyA9IGFuZ3VsYXIuY29weSh0aGlzLmN1c3RvbUNvbmZpZyk7XHJcblxyXG4gICAgICAgICAgICAgICAgcHJvamVjdC5lbnZDb25mRGVmYXVsdCA9ICgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld0FyciA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ0VudkNvbmZEZWZhdWx0IG9mIHByb2plY3QuZW52Q29uZkRlZmF1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNpZ0VudkNvbmZEZWZhdWx0LmtleSAmJiBzaWdFbnZDb25mRGVmYXVsdC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXJyLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogc2lnRW52Q29uZkRlZmF1bHQua2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBzaWdFbnZDb25mRGVmYXVsdC52YWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogc2lnRW52Q29uZkRlZmF1bHQuZGVzY3JpcHRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBcnI7XHJcbiAgICAgICAgICAgICAgICB9KSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHByb2plY3QuYXV0b0J1aWxkSW5mbyA9ICgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGF1dG9CdWlsZEluZm8gPSBwcm9qZWN0LmF1dG9CdWlsZEluZm8sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0F1dG9CdWlsZEluZm87XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwcm9qZWN0LmNvZGVJbmZvIHx8ICFhdXRvQnVpbGRJbmZvLm90aGVyICYmICFhdXRvQnVpbGRJbmZvLm1hc3RlciAmJiAhYXV0b0J1aWxkSW5mby50YWcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG5ld0F1dG9CdWlsZEluZm8gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZzogYXV0b0J1aWxkSW5mby50YWcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5jaGVzOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dG9CdWlsZEluZm8ub3RoZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXV0b0J1aWxkSW5mby5icmFuY2hlcyA9IGF1dG9CdWlsZEluZm8uYnJhbmNoZXMuc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dG9CdWlsZEluZm8ubWFzdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0F1dG9CdWlsZEluZm8uYnJhbmNoZXMucHVzaCgnbWFzdGVyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBdXRvQnVpbGRJbmZvO1xyXG4gICAgICAgICAgICAgICAgfSkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHJvamVjdC51c2VyRGVmaW5lRG9ja2VyZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hcnRQcm9qZWN0Lm5hbWUgPSBwcm9qZWN0Lm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuaWQgPSBwcm9qZWN0LmlkO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9qZWN0LmNvZGVJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hcnRQcm9qZWN0LmNvZGVJbmZvID0gcHJvamVjdC5jb2RlSW5mbztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuYXV0b0J1aWxkSW5mbyA9IHByb2plY3QuYXV0b0J1aWxkSW5mbztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuZXhjbHVzaXZlQnVpbGQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hcnRQcm9qZWN0LnVzZXJEZWZpbmVEb2NrZXJmaWxlID0gcHJvamVjdC51c2VyRGVmaW5lRG9ja2VyZmlsZTtcclxuICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0UHJvamVjdC5kb2NrZXJmaWxlSW5mbyA9IHByb2plY3QuZG9ja2VyZmlsZUluZm87XHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuYXV0aG9yaXR5ID0gcHJvamVjdC5hdXRob3JpdHk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuZW52Q29uZkRlZmF1bHQgPSBwcm9qZWN0LmVudkNvbmZEZWZhdWx0O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvamVjdC5kb2NrZXJmaWxlSW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmRvY2tlcmZpbGVJbmZvID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5jb25mRmlsZXMgPSAoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3Q29uZkZpbGVzID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNvbmZGaWxlIG9mIHByb2plY3QuY29uZkZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZkZpbGUudHBsRGlyICYmIGNvbmZGaWxlLm9yaWdpbkRpcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NvbmZGaWxlc1tjb25mRmlsZS50cGxEaXJdID0gY29uZkZpbGUub3JpZ2luRGlyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdDb25mRmlsZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZUVudlN0ciA9ICgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdHIgPSAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ckFyciA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBlbnYgb2YgY3VzdG9tQ29uZmlnLmNvbXBpbGVFbnYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbnYuZW52TmFtZSAmJiBlbnYuZW52VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJBcnIucHVzaChlbnYuZW52TmFtZSArICc9JyArIGVudi5lbnZWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0ckFyci5qb2luKCcsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEZpbGVTdG9yYWdlUGF0aEFyciA9ICgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdBcnIgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaXRlbSBvZiBjdXN0b21Db25maWcuY3JlYXRlZEZpbGVTdG9yYWdlUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Fyci5wdXNoKGl0ZW0ubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld0FycjtcclxuICAgICAgICAgICAgICAgICAgICB9KSgpO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNVc2VDdXN0b20pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5kb2NrZXJmaWxlQ29uZmlnID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5jdXN0b21Eb2NrZXJmaWxlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5leGNsdXNpdmVCdWlsZCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbVR5cGU6IGN1c3RvbUNvbmZpZy5jdXN0b21UeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUltYWdlOiB0aGlzLnByb2plY3RJbWFnZXNJbnMuc2VsZWN0ZWRDb21waWxlSW1hZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydW5JbWFnZTogdGhpcy5wcm9qZWN0SW1hZ2VzSW5zLnNlbGVjdGVkUnVuSW1hZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlU3RvcmFnZVBhdGg6IGN1c3RvbUNvbmZpZy5jb2RlU3RvcmFnZVBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlRW52OiBjb21waWxlRW52U3RyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUNtZDogY3VzdG9tQ29uZmlnLmNvbXBpbGVDbWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoOiBjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoQXJyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya0RpcjogY3VzdG9tQ29uZmlnLndvcmtEaXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiBjdXN0b21Db25maWcudXNlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bkZpbGVTdG9yYWdlUGF0aDogdGhpcy5wcm9qZWN0SW1hZ2VzSW5zLnNlbGVjdGVkUnVuSW1hZ2UucnVuRmlsZVN0b3JhZ2VQYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDbWQ6IHRoaXMucHJvamVjdEltYWdlc0lucy5zZWxlY3RlZFJ1bkltYWdlLnN0YXJ0Q29tbWFuZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmnKrliJ3lp4vljJZ0aGlzLnByb2plY3RJbWFnZXNJbnMuc2VsZWN0ZWRDb21waWxlSW1hZ2Xml7ZcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnByb2plY3RJbWFnZXNJbnMuc2VsZWN0ZWRDb21waWxlSW1hZ2UuaW1hZ2VOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmV4Y2x1c2l2ZUJ1aWxkLmNvbXBpbGVJbWFnZSA9IHRoaXMuY3VzdG9tQ29uZmlnLmNvbXBpbGVJbWFnZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZXhjbHVzaXZlQnVpbGQucnVuSW1hZ2UgPSB0aGlzLmN1c3RvbUNvbmZpZy5ydW5JbWFnZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZXhjbHVzaXZlQnVpbGQucnVuRmlsZVN0b3JhZ2VQYXRoID0gdGhpcy5jdXN0b21Db25maWcucnVuRmlsZVN0b3JhZ2VQYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5leGNsdXNpdmVCdWlsZC5zdGFydENtZCA9IHRoaXMuY3VzdG9tQ29uZmlnLnN0YXJ0Q21kO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzRGVmRG9ja2VyZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmV4Y2x1c2l2ZUJ1aWxkID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5kb2NrZXJmaWxlQ29uZmlnID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5jdXN0b21Eb2NrZXJmaWxlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9ja2VyZmlsZTogY3VzdG9tQ29uZmlnLmRvY2tlcmZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGxvYWRGaWxlSW5mb3M6IGN1c3RvbUNvbmZpZy51cGxvYWRGaWxlSW5mb3MuZmlsdGVyKCh4KSA9PiB4LmZpbGVuYW1lIHx8IHguY29udGVudClcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmV4Y2x1c2l2ZUJ1aWxkID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5jdXN0b21Eb2NrZXJmaWxlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5kb2NrZXJmaWxlQ29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZUltYWdlTmFtZTogY3VzdG9tQ29uZmlnLmJhc2VJbWFnZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlSW1hZ2VUYWc6IGN1c3RvbUNvbmZpZy5iYXNlSW1hZ2VUYWcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlSW1hZ2VSZWdpc3RyeTogY3VzdG9tQ29uZmlnLmJhc2VJbWFnZVJlZ2lzdHJ5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFsbENtZDogY3VzdG9tQ29uZmlnLmluc3RhbGxDbWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlU3RvcmFnZVBhdGg6IGN1c3RvbUNvbmZpZy5jb2RlU3RvcmFnZVBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlRW52OiBjb21waWxlRW52U3RyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUNtZDogY3VzdG9tQ29uZmlnLmNvbXBpbGVDbWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrRGlyOiBjdXN0b21Db25maWcud29ya0RpcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0Q21kOiBjdXN0b21Db25maWcuc3RhcnRDbWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiBjdXN0b21Db25maWcudXNlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0UHJvamVjdCA9IHByb2plY3Q7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9ybWFydFByb2plY3Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY3JlYXRlKHByb2plY3RDb2xsZWN0aW9uSWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjcmVhdGVQcm9qZWN0ID0gdGhpcy5fZm9ybWFydFByb2plY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdG9yRHJhZnQgPSBhbmd1bGFyLmNvcHkodGhpcy5jcmVhdG9yRHJhZnQpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coY3JlYXRlUHJvamVjdCk7XHJcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9wcm9qZWN0Y29sbGVjdGlvbi8nICsgcHJvamVjdENvbGxlY3Rpb25JZCsgJy9wcm9qZWN0JywgYW5ndWxhci50b0pzb24odGhpcy5fZm9ybWFydENyZWF0ZVByb2plY3QoY3JlYXRlUHJvamVjdCkpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3Byb2plY3Rjb2xsZWN0aW9uLycgKyBwcm9qZWN0Q29sbGVjdGlvbklkKyAnL3Byb2plY3QnLCBhbmd1bGFyLnRvSnNvbihjcmVhdGVQcm9qZWN0KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGdldEluc3RhbmNlID0gJGRvbWVNb2RlbC5pbnN0YW5jZXNDcmVhdG9yKHtcclxuICAgICAgICAgICAgUHJvamVjdDogUHJvamVjdCxcclxuICAgICAgICAgICAgUHJvamVjdEltYWdlczogUHJvamVjdEltYWdlc1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBwcm9qZWN0U2VydmljZTogcHJvamVjdFNlcnZpY2UsXHJcbiAgICAgICAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZSxcclxuICAgICAgICAgICAgYnVpbGRQcm9qZWN0OiBidWlsZFByb2plY3RcclxuICAgICAgICB9O1xyXG5cclxuICAgIH1cclxuICAgIERvbWVQcm9qZWN0LiRpbmplY3QgPSBbJyRodHRwJywgJyR1dGlsJywgJyRzdGF0ZScsICckZG9tZVB1YmxpYycsICckZG9tZU1vZGVsJywgJyRxJywgJyRtb2RhbCcsICckZG9tZUltYWdlJ107XHJcbiAgICBwcm9qZWN0TW9kdWxlLmZhY3RvcnkoJyRkb21lUHJvamVjdCcsIERvbWVQcm9qZWN0KTtcclxuICAgIHdpbmRvdy5wcm9qZWN0TW9kdWxlID0gcHJvamVjdE1vZHVsZTtcclxufSkod2luZG93KTsiXX0=
