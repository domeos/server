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
            this.getGitLabInfo = function (gitLabId) {
                return $http.get(_this.url + '/git/gitlabinfo/' + gitLabId);
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
            this.stopBulid = function (buildId) {
                return $http.get('/api/ci/build/stop/' + buildId);
            };
            this.modifyCreator = function (projectId, creatorInfo) {
                return $http.post(_this.url + '/creator/' + projectId, angular.toJson(creatorInfo));
            };
            this.modifyCodeInfo = function (projectId, CodeConfiguration) {
                return $http.put(_this.url + '/' + projectId + '/git/gitlabinfo', angular.toJson(CodeConfiguration));
            };
            this.buildInfoList = function (projectId, page, count) {
                return $http.get('/api/ci/buildInfo/' + projectId + '/page?page=' + page + '&count=' + count);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9wcm9qZWN0TW9kdWxlL3Byb2plY3RNb2R1bGUuZXMiXSwibmFtZXMiOlsid2luZG93IiwidW5kZWZpbmVkIiwicHJvamVjdE1vZHVsZSIsImFuZ3VsYXIiLCJtb2R1bGUiLCJEb21lUHJvamVjdCIsIiRodHRwIiwiJHV0aWwiLCIkc3RhdGUiLCIkZG9tZVB1YmxpYyIsIiRkb21lTW9kZWwiLCIkcSIsIiRtb2RhbCIsIiRkb21lSW1hZ2UiLCJQcm9qZWN0U2VydmljZSIsInVybCIsIlNlcnZpY2VNb2RlbCIsImNhbGwiLCJnZXRQcm9qZWN0Q29sbGVjdGlvbk5hbWVCeUlkIiwicHJvamVjdENvbGxlY3Rpb25JZCIsImdldCIsImdldFByb2plY3QiLCJnZXRSZWFkTWUiLCJwcm9JZCIsImJyYW5jaCIsImdldEJ1aWxkTGlzdCIsImdldEJyYW5jaGVzIiwiZ2V0QnJhbmNoZXNXaXRob3V0SWQiLCJjb2RlSWQiLCJjb2RlTWFuYWdlclVzZXJJZCIsImNvZGVNYW5hZ2VyIiwiZ2V0VGFncyIsImdldFRhZ3NXaXRob3V0SWQiLCJnZXRHaXRMYWJJbmZvIiwiZ2l0TGFiSWQiLCJnZXRCdWlsZERvY2tlcmZpbGUiLCJidWlsZElkIiwicHJldmlld0RvY2tlcmZpbGUiLCJwcm9qZWN0Q29uZmlnIiwicG9zdCIsInRvSnNvbiIsIm5vdEludGVyY2VwdCIsImJ1aWxkIiwiYnVpbGRJbmZvIiwic3RvcEJ1bGlkIiwibW9kaWZ5Q3JlYXRvciIsInByb2plY3RJZCIsImNyZWF0b3JJbmZvIiwibW9kaWZ5Q29kZUluZm8iLCJDb2RlQ29uZmlndXJhdGlvbiIsInB1dCIsImJ1aWxkSW5mb0xpc3QiLCJwYWdlIiwiY291bnQiLCJwcm9qZWN0U2VydmljZSIsImJ1aWxkUHJvamVjdCIsImhhc0NvZGVJbmZvIiwiYnVpbGRNb2RhbElucyIsIm9wZW4iLCJhbmltYXRpb24iLCJ0ZW1wbGF0ZVVybCIsImNvbnRyb2xsZXIiLCJzaXplIiwicmVzb2x2ZSIsInByb2plY3RJbmZvIiwicmVzdWx0IiwiUHJvamVjdEltYWdlcyIsImltYWdlSW5mbyIsImNvbXBpbGVJc1B1YmxpYyIsInJ1bklzUHVibGljIiwic2VsZWN0ZWRDb21waWxlSW1hZ2UiLCJzZWxlY3RlZFJ1bkltYWdlIiwiY3VycmVudENvbXBpbGVMaXN0IiwicHJpdmF0ZVJlZ2lzdHJ5SW1hZ2VMaXN0Iiwic2VsZWN0ZWRDb21waWxlUHJpdmF0ZUltYWdlVGFnIiwiY3VycmVudENvbXBpbGVQcml2YXRlSW1hZ2VUYWdMaXN0Iiwic2VsZWN0ZWRSdW5Qcml2YXRlSW1hZ2VUYWciLCJjdXJyZW50UnVuUHJpdmF0ZUltYWdlVGFnTGlzdCIsImN1cnJlbnRSdW5MaXN0IiwicHJvamVjdEltYWdlc0luZm8iLCJjb21waWxlUHVibGljSW1hZ2VMaXN0IiwiY29tcGlsZVByaXZhdGVJbWFnZUxpc3QiLCJydW5QdWJsaWNJbWFnZUxpc3QiLCJydW5Qcml2YXRlSW1hZ2VMaXN0IiwidXNlckxpc3QiLCJpbWFnZXNJbmZvIiwiaXNBcnJheSIsImZvckVhY2giLCJpbWFnZUxpc3QiLCJpbWFnZUxpc3ROYW1lIiwiaW1hZ2UiLCJjcmVhdGVEYXRlIiwiZ2V0UGFnZURhdGUiLCJjcmVhdGVUaW1lIiwiaW1hZ2VUeHQiLCJpbWFnZU5hbWUiLCJpbWFnZVRhZyIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJ0b2dnbGVJc1B1YmxpY0ltYWdlIiwiaW1hZ2VUeXBlIiwiaW1hZ2VTZXJ2aWNlIiwiZ2V0UHJvamVjdEltYWdlcyIsInRoZW4iLCJyZXMiLCJkYXRhIiwibmV3SW1hZ2VMaXN0IiwiaSIsInJlZ2lzdHJ5VXJsIiwicmVnaXN0cnkiLCJyZWdpc3RyeVR5cGUiLCJwdXNoIiwiZmluYWxseSIsImdldEltYWdlVGFncyIsInRhZ3MiLCJpc1B1YmxpYyIsInRvZ2dsZUltYWdlIiwiaW5kZXgiLCJ0YWciLCJsIiwiaW5kZXhJbWFnZSIsInNlbGVjdGVkSW1hZ2VUbXAiLCJnZXRQcml2YXRlSW1hZ2VUYWciLCJpbmQiLCJzZWxlY3RlZFJ1bkltYWdlVG1wIiwiY29weSIsInR5cGUiLCJpbWdPYmoiLCJpc09iamVjdCIsIlByb2plY3QiLCJpbml0SW5mbyIsImNvbmZpZyIsImN1c3RvbUNvbmZpZyIsImlzVXNlQ3VzdG9tIiwiaXNEZWZEb2NrZXJmaWxlIiwicHJvamVjdEltYWdlc0lucyIsImluaXQiLCJwcm9qZWN0IiwiYXV0b0J1aWxkSW5mbyIsImRvY2tlcmZpbGVJbmZvIiwiZG9ja2VyZmlsZUNvbmZpZyIsImV4Y2x1c2l2ZUJ1aWxkIiwidXNlckRlZmluZURvY2tlcmZpbGUiLCJjdXN0b21Eb2NrZXJmaWxlIiwibmV3QXV0b0J1aWxkSW5mbyIsImJyYW5jaGVzIiwibWFzdGVyIiwib3RoZXIiLCJzcGxpY2UiLCJqb2luIiwiY29uZkZpbGVzIiwibmV3QXJyIiwidHBsRGlyIiwib3JpZ2luRGlyIiwia2V5IiwiZW52Q29uZkRlZmF1bHQiLCJ2YWx1ZSIsImRlc2NyaXB0aW9uIiwiY29tcGlsZUVudiIsImVudk5hbWUiLCJlbnZWYWx1ZSIsImNvbXBpbGVFbnZBcnIiLCJzcGxpdCIsIm1hcCIsIml0ZW0iLCJzaWdFbnYiLCJiaW5kIiwidXBsb2FkRmlsZUluZm9zIiwiZmlsZW5hbWUiLCJjb250ZW50IiwiY3JlYXRlZEZpbGVTdG9yYWdlUGF0aCIsIm5hbWUiLCJpbWFnZVJlZ2lzdHJ5IiwiYmFzZUltYWdlTmFtZSIsImJhc2VJbWFnZVRhZyIsImJhc2VJbWFnZVJlZ2lzdHJ5IiwiX2Zvcm1hcnRQcm9qZWN0IiwiZGVmZXJlZCIsImRlZmVyIiwib3BlbkRlbGV0ZSIsImRlbGV0ZURhdGEiLCJpZCIsIm9wZW5Qcm9tcHQiLCJvcGVuV2FybmluZyIsInRpdGxlIiwibXNnIiwicmVzdWx0TXNnIiwicmVqZWN0IiwicHJvbWlzZSIsIm9wZW5Eb2NrZXJmaWxlIiwidXNlRG9ja2VyZmlsZU1vZGFsSW5zIiwiY29kZUluZm8iLCJicmFuY2hJbmZvIiwiZm9ybWFydFByb2plY3QiLCJjb21waWxlRW52U3RyIiwiY3JlYXRlZEZpbGVTdG9yYWdlUGF0aEFyciIsInNpZ0VudkNvbmZEZWZhdWx0IiwiYXV0aG9yaXR5IiwibmV3Q29uZkZpbGVzIiwiY29uZkZpbGUiLCJzdHIiLCJzdHJBcnIiLCJlbnYiLCJjdXN0b21UeXBlIiwiY29tcGlsZUltYWdlIiwicnVuSW1hZ2UiLCJjb2RlU3RvcmFnZVBhdGgiLCJjb21waWxlQ21kIiwid29ya0RpciIsInVzZXIiLCJydW5GaWxlU3RvcmFnZVBhdGgiLCJzdGFydENtZCIsInN0YXJ0Q29tbWFuZCIsImRvY2tlcmZpbGUiLCJmaWx0ZXIiLCJ4IiwiaW5zdGFsbENtZCIsImNyZWF0ZVByb2plY3QiLCJnZXRJbnN0YW5jZSIsImluc3RhbmNlc0NyZWF0b3IiLCIkaW5qZWN0IiwiZmFjdG9yeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7O0FBS0EsQ0FBQyxVQUFDQSxNQUFELEVBQVNDLFNBQVQsRUFBdUI7QUFDcEI7QUFDQTs7QUFDQSxRQUFJQyxnQkFBZ0JDLFFBQVFDLE1BQVIsQ0FBZSxlQUFmLEVBQWdDLEVBQWhDLENBQXBCOztBQUVBLGFBQVNDLFdBQVQsQ0FBcUJDLEtBQXJCLEVBQTRCQyxLQUE1QixFQUFtQ0MsTUFBbkMsRUFBMkNDLFdBQTNDLEVBQXdEQyxVQUF4RCxFQUFvRUMsRUFBcEUsRUFBd0VDLE1BQXhFLEVBQWdGQyxVQUFoRixFQUE0RjtBQUN4RixZQUFNQyxpQkFBaUIsU0FBakJBLGNBQWlCLEdBQVk7QUFBQTs7QUFDL0IsaUJBQUtDLEdBQUwsR0FBVyxhQUFYO0FBQ0FMLHVCQUFXTSxZQUFYLENBQXdCQyxJQUF4QixDQUE2QixJQUE3QixFQUFtQyxLQUFLRixHQUF4QztBQUNBLGlCQUFLRyw0QkFBTCxHQUFvQyxVQUFDQyxtQkFBRDtBQUFBLHVCQUF5QmIsTUFBTWMsR0FBTiw2QkFBb0NELG1CQUFwQyxXQUF6QjtBQUFBLGFBQXBDO0FBQ0EsaUJBQUtFLFVBQUwsR0FBa0IsVUFBQ0YsbUJBQUQ7QUFBQSx1QkFBeUJiLE1BQU1jLEdBQU4sNkJBQW9DRCxtQkFBcEMsY0FBekI7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V0FBdEM7QUFDQUwsV0FBT0UsYUFBUCxHQUF1QkEsYUFBdkI7QUFDSCxDQTVzQkQsRUE0c0JHRixNQTVzQkgiLCJmaWxlIjoiY29tbW9uL3Byb2plY3RNb2R1bGUvcHJvamVjdE1vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBAYXV0aG9yICBDaGFuZHJhTGVlXG4gKiBAZGVzY3JpcHRpb24gIOmhueebruaooeWdl1xuICovXG5cbigod2luZG93LCB1bmRlZmluZWQpID0+IHtcbiAgICAvLyDpobnnm67nrqHnkIZzZXJ2aWNlXG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGxldCBwcm9qZWN0TW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ3Byb2plY3RNb2R1bGUnLCBbXSk7XG5cbiAgICBmdW5jdGlvbiBEb21lUHJvamVjdCgkaHR0cCwgJHV0aWwsICRzdGF0ZSwgJGRvbWVQdWJsaWMsICRkb21lTW9kZWwsICRxLCAkbW9kYWwsICRkb21lSW1hZ2UpIHtcbiAgICAgICAgY29uc3QgUHJvamVjdFNlcnZpY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnVybCA9ICdhcGkvcHJvamVjdCc7XG4gICAgICAgICAgICAkZG9tZU1vZGVsLlNlcnZpY2VNb2RlbC5jYWxsKHRoaXMsIHRoaXMudXJsKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0UHJvamVjdENvbGxlY3Rpb25OYW1lQnlJZCA9IChwcm9qZWN0Q29sbGVjdGlvbklkKSA9PiAkaHR0cC5nZXQoYC9hcGkvcHJvamVjdGNvbGxlY3Rpb24vJHtwcm9qZWN0Q29sbGVjdGlvbklkfS9uYW1lYCk7XG4gICAgICAgICAgICB0aGlzLmdldFByb2plY3QgPSAocHJvamVjdENvbGxlY3Rpb25JZCkgPT4gJGh0dHAuZ2V0KGAvYXBpL3Byb2plY3Rjb2xsZWN0aW9uLyR7cHJvamVjdENvbGxlY3Rpb25JZH0vcHJvamVjdGApO1xuICAgICAgICAgICAgdGhpcy5nZXRSZWFkTWUgPSAocHJvSWQsIGJyYW5jaCkgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS9yZWFkbWUvJHtwcm9JZH0vJHticmFuY2h9YCk7XG4gICAgICAgICAgICB0aGlzLmdldEJ1aWxkTGlzdCA9IHByb0lkID0+ICRodHRwLmdldChgL2FwaS9jaS9idWlsZC8ke3Byb0lkfWApO1xuICAgICAgICAgICAgdGhpcy5nZXRCcmFuY2hlcyA9IHByb0lkID0+ICRodHRwLmdldChgJHt0aGlzLnVybH0vYnJhbmNoZXMvJHtwcm9JZH1gKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0QnJhbmNoZXNXaXRob3V0SWQgPSAoY29kZUlkLCBjb2RlTWFuYWdlclVzZXJJZCwgY29kZU1hbmFnZXIpID0+ICRodHRwLmdldChgJHt0aGlzLnVybH0vYnJhbmNoZXMvJHtjb2RlTWFuYWdlcn0vJHtjb2RlSWR9LyR7Y29kZU1hbmFnZXJVc2VySWR9YCk7XG4gICAgICAgICAgICB0aGlzLmdldFRhZ3MgPSBwcm9JZCA9PiAkaHR0cC5nZXQoYCR7dGhpcy51cmx9L3RhZ3MvJHtwcm9JZH1gKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0VGFnc1dpdGhvdXRJZCA9IChjb2RlSWQsIGNvZGVNYW5hZ2VyVXNlcklkLCBjb2RlTWFuYWdlcikgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS90YWdzLyR7Y29kZU1hbmFnZXJ9LyR7Y29kZUlkfS8ke2NvZGVNYW5hZ2VyVXNlcklkfWApO1xuICAgICAgICAgICAgdGhpcy5nZXRHaXRMYWJJbmZvID0gKCkgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS9naXQvZ2l0bGFiaW5mb2ApO1xuICAgICAgICAgICAgdGhpcy5nZXRHaXRMYWJJbmZvID0gKGdpdExhYklkKSA9PiAkaHR0cC5nZXQoYCR7dGhpcy51cmx9L2dpdC9naXRsYWJpbmZvLyR7Z2l0TGFiSWR9YCk7XG4gICAgICAgICAgICB0aGlzLmdldEJ1aWxkRG9ja2VyZmlsZSA9IChwcm9JZCwgYnVpbGRJZCkgPT4gJGh0dHAuZ2V0KGAvYXBpL2NpL2J1aWxkL2RvY2tlcmZpbGUvJHtwcm9JZH0vJHtidWlsZElkfWApO1xuICAgICAgICAgICAgdGhpcy5wcmV2aWV3RG9ja2VyZmlsZSA9IChwcm9qZWN0Q29uZmlnKSA9PiAkaHR0cC5wb3N0KCcvYXBpL2NpL2J1aWxkL2RvY2tlcmZpbGUnLCBhbmd1bGFyLnRvSnNvbihwcm9qZWN0Q29uZmlnKSwge1xuICAgICAgICAgICAgICAgIG5vdEludGVyY2VwdDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmJ1aWxkID0gKGJ1aWxkSW5mbykgPT4gJGh0dHAucG9zdCgnL2FwaS9jaS9idWlsZC9zdGFydCcsIGFuZ3VsYXIudG9Kc29uKGJ1aWxkSW5mbyksIHtcbiAgICAgICAgICAgICAgICBub3RJbnRlcmNlcHQ6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5zdG9wQnVsaWQgPSAoYnVpbGRJZCkgPT4gJGh0dHAuZ2V0KGAvYXBpL2NpL2J1aWxkL3N0b3AvJHtidWlsZElkfWApO1xuICAgICAgICAgICAgdGhpcy5tb2RpZnlDcmVhdG9yID0gKHByb2plY3RJZCxjcmVhdG9ySW5mbykgPT4gJGh0dHAucG9zdChgJHt0aGlzLnVybH0vY3JlYXRvci8ke3Byb2plY3RJZH1gLCBhbmd1bGFyLnRvSnNvbihjcmVhdG9ySW5mbykpOyBcbiAgICAgICAgICAgIHRoaXMubW9kaWZ5Q29kZUluZm8gPSAocHJvamVjdElkLCBDb2RlQ29uZmlndXJhdGlvbikgPT4gJGh0dHAucHV0KGAke3RoaXMudXJsfS8ke3Byb2plY3RJZH0vZ2l0L2dpdGxhYmluZm9gLCBhbmd1bGFyLnRvSnNvbihDb2RlQ29uZmlndXJhdGlvbikpO1xuICAgICAgICAgICAgdGhpcy5idWlsZEluZm9MaXN0ID0gKHByb2plY3RJZCwgcGFnZSwgY291bnQpID0+ICRodHRwLmdldChgL2FwaS9jaS9idWlsZEluZm8vJHtwcm9qZWN0SWR9L3BhZ2U/cGFnZT0ke3BhZ2V9JmNvdW50PSR7Y291bnR9YCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHByb2plY3RTZXJ2aWNlID0gbmV3IFByb2plY3RTZXJ2aWNlKCk7XG5cbiAgICAgICAgY29uc3QgYnVpbGRQcm9qZWN0ID0gKHByb0lkLCBoYXNDb2RlSW5mbykgPT4ge1xuICAgICAgICAgICAgY29uc3QgYnVpbGRNb2RhbElucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvaW5kZXgvdHBsL21vZGFsL2J1aWxkTW9kYWwvYnVpbGRNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQnVpbGRNb2RhbEN0ciBhcyB2bScsXG4gICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RJbmZvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SWQ6IHByb0lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ29kZUluZm86IGhhc0NvZGVJbmZvXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZE1vZGFsSW5zLnJlc3VsdDtcbiAgICAgICAgfTtcblxuICAgICAgICBjbGFzcyBQcm9qZWN0SW1hZ2VzIHtcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VJbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICBjb21waWxlSXNQdWJsaWM6IDEsXG4gICAgICAgICAgICAgICAgICAgIHJ1bklzUHVibGljOiAxXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29tcGlsZUltYWdlID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFJ1bkltYWdlID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q29tcGlsZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICAvLyDnp4HmnInku5PlupPmiYDmnInplZzlg49cbiAgICAgICAgICAgICAgICB0aGlzLnByaXZhdGVSZWdpc3RyeUltYWdlTGlzdCA9IFtdXG4gICAgICAgICAgICAgICAgLy8g56eB5pyJ5LuT5bqTY29tcGlsZemVnOWDj1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb21waWxlUHJpdmF0ZUltYWdlVGFnID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q29tcGlsZVByaXZhdGVJbWFnZVRhZ0xpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICAvL+engeacieS7k+W6k3J1bumVnOWDj1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSdW5Qcml2YXRlSW1hZ2VUYWcgPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSdW5Qcml2YXRlSW1hZ2VUYWdMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UnVuTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdEltYWdlc0luZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVQdWJsaWNJbWFnZUxpc3Q6IFtdLFxuICAgICAgICAgICAgICAgICAgICBjb21waWxlUHJpdmF0ZUltYWdlTGlzdDogW10sXG4gICAgICAgICAgICAgICAgICAgIHJ1blB1YmxpY0ltYWdlTGlzdDogW10sXG4gICAgICAgICAgICAgICAgICAgIHJ1blByaXZhdGVJbWFnZUxpc3Q6IFtdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJMaXN0ID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0KGltYWdlc0luZm8pIHtcbiAgICAgICAgICAgICAgICAvL3RoaXMuZ2V0UHJvamVjdEltYWdlQXNQcml2YXRlSW1hZ2VMaXN0KCdhbGwnKTtcbiAgICAgICAgICAgICAgICBpZiAoIWltYWdlc0luZm8pXG4gICAgICAgICAgICAgICAgICAgIGltYWdlc0luZm8gPSB7fTtcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkoaW1hZ2VzSW5mby5jb21waWxlUHVibGljSW1hZ2VMaXN0KSkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZXNJbmZvLmNvbXBpbGVQdWJsaWNJbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KGltYWdlc0luZm8uY29tcGlsZVByaXZhdGVJbWFnZUxpc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlc0luZm8uY29tcGlsZVByaXZhdGVJbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlc0luZm8uY29tcGlsZVByaXZhdGVJbWFnZUxpc3QgPSB0aGlzLnByaXZhdGVSZWdpc3RyeUltYWdlTGlzdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KGltYWdlc0luZm8ucnVuUHVibGljSW1hZ2VMaXN0KSkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZXNJbmZvLnJ1blB1YmxpY0ltYWdlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkoaW1hZ2VzSW5mby5ydW5Qcml2YXRlSW1hZ2VMaXN0KSkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZXNJbmZvLnJ1blByaXZhdGVJbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlc0luZm8ucnVuUHJpdmF0ZUltYWdlTGlzdCA9IHRoaXMucHJpdmF0ZVJlZ2lzdHJ5SW1hZ2VMaXN0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChpbWFnZXNJbmZvLCAoaW1hZ2VMaXN0LCBpbWFnZUxpc3ROYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGltYWdlIG9mIGltYWdlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuY3JlYXRlRGF0ZSA9ICR1dGlsLmdldFBhZ2VEYXRlKGltYWdlLmNyZWF0ZVRpbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuaW1hZ2VUeHQgPSBpbWFnZS5pbWFnZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2UuaW1hZ2VUYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5pbWFnZVR4dCArPSAnOicgKyBpbWFnZS5pbWFnZVRhZztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdEltYWdlc0luZm8gPSBpbWFnZXNJbmZvO1xuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkQ29tcGlsZUltYWdlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVJc1B1YmxpY0ltYWdlKCdjb21waWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlSXNQdWJsaWNJbWFnZSgncnVuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8g6I635Y+W56eB5pyJ6ZWc5YOP55qE5bel56iL6ZWc5YOP77yM5bm26L2s5o2i5oiQY29tcGlsZVByaXZhdGVJbWFnZUxpc3TmoLzlvI9cbiAgICAgICAgICAgIGdldFByb2plY3RJbWFnZUFzUHJpdmF0ZUltYWdlTGlzdChpbWFnZVR5cGUpe1xuICAgICAgICAgICAgICAgICRkb21lSW1hZ2UuaW1hZ2VTZXJ2aWNlLmdldFByb2plY3RJbWFnZXMoKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld0ltYWdlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpPTA7IGkgPCBpbWFnZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZSA9IGltYWdlTGlzdFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLmNyZWF0ZURhdGUgPSAkdXRpbC5nZXRQYWdlRGF0ZShpbWFnZS5jcmVhdGVUaW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLmltYWdlVHh0ID0gaW1hZ2UuaW1hZ2VOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UucmVnaXN0cnlVcmwgPSBpbWFnZS5yZWdpc3RyeTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLnJlZ2lzdHJ5VHlwZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2ltYWdlLmltYWdlVGFnIOWQjue7reWhq+WFpVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlLmltYWdlVGFnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuaW1hZ2VUeHQgKz0gJzonICsgaW1hZ2UuaW1hZ2VUYWc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdJbWFnZUxpc3QucHVzaChpbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoaW1hZ2VUeXBlID09PSAnY29tcGlsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdEltYWdlc0luZm8uY29tcGlsZVByaXZhdGVJbWFnZUxpc3QgPSBuZXdJbWFnZUxpc3Q7ICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfWVsc2UgaWYgKGltYWdlVHlwZSA9PT0gJ3J1bicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdEltYWdlc0luZm8ucnVuUHJpdmF0ZUltYWdlTGlzdCA9IG5ld0ltYWdlTGlzdDtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2UgaWYoaW1hZ2VUeXBlID09PSAnYWxsJyl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByaXZhdGVSZWdpc3RyeUltYWdlTGlzdCA9IG5ld0ltYWdlTGlzdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnZXRQcml2YXRlSW1hZ2VUYWcoaW1hZ2VUeXBlLGltYWdlKSB7XG4gICAgICAgICAgICAgICAgJGRvbWVJbWFnZS5pbWFnZVNlcnZpY2UuZ2V0SW1hZ2VUYWdzKGltYWdlLmltYWdlTmFtZSwgaW1hZ2UucmVnaXN0cnlVcmwpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGFncyA9IHJlcy5kYXRhLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgaWYoaW1hZ2VUeXBlID09PSAnY29tcGlsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudENvbXBpbGVQcml2YXRlSW1hZ2VUYWdMaXN0ID0gdGFnczsgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH1lbHNlIGlmIChpbWFnZVR5cGUgPT09ICdydW4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSdW5Qcml2YXRlSW1hZ2VUYWdMaXN0ID0gdGFncztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlSXNQdWJsaWNJbWFnZShpbWFnZVR5cGUsIGlzUHVibGljKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaXNQdWJsaWMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1B1YmxpYyA9IGltYWdlVHlwZSA9PSAnY29tcGlsZScgPyB0aGlzLmltYWdlSW5mby5jb21waWxlSXNQdWJsaWMgOiB0aGlzLmltYWdlSW5mby5ydW5Jc1B1YmxpYztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2VUeXBlID09ICdjb21waWxlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q29tcGlsZUxpc3QgPSBpc1B1YmxpYyA9PT0gMSA/IHRoaXMucHJvamVjdEltYWdlc0luZm8uY29tcGlsZVB1YmxpY0ltYWdlTGlzdCA6IHRoaXMucHJvamVjdEltYWdlc0luZm8uY29tcGlsZVByaXZhdGVJbWFnZUxpc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUltYWdlKCdjb21waWxlJywgMCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSdW5MaXN0ID0gaXNQdWJsaWMgPT09IDEgPyB0aGlzLnByb2plY3RJbWFnZXNJbmZvLnJ1blB1YmxpY0ltYWdlTGlzdCA6IHRoaXMucHJvamVjdEltYWdlc0luZm8ucnVuUHJpdmF0ZUltYWdlTGlzdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlSW1hZ2UoJ3J1bicsIDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy/liIfmjaLnp4HmnInplZzlg490YWfvvIzlubbkuLrnp4HmnInplZzlg4/mt7vliqB0YWdcbiAgICAgICAgICAgIHRvZ2dsZVByaXZhdGVJbWFnZVRhZyhpbWFnZVR5cGUsIGluZGV4LCB0YWcpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW1hZ2VUeXBlID09PSAnY29tcGlsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbXBpbGVQcml2YXRlSW1hZ2VUYWcgPSB0aGlzLmN1cnJlbnRDb21waWxlUHJpdmF0ZUltYWdlVGFnTGlzdFtpbmRleF07XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgbD0wOyBsPCB0aGlzLmN1cnJlbnRDb21waWxlTGlzdC5sZW5ndGg7IGwrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jdXJyZW50Q29tcGlsZUxpc3RbbF0uaW1hZ2VOYW1lID09PSB0YWcuaW1hZ2VOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q29tcGlsZUxpc3RbbF0uaW1hZ2VUYWcgPSB0aGlzLnNlbGVjdGVkQ29tcGlsZVByaXZhdGVJbWFnZVRhZy50YWc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGltYWdlVHlwZSA9PT0gJ3J1bicpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFJ1blByaXZhdGVJbWFnZVRhZyA9IHRoaXMuY3VycmVudFJ1blByaXZhdGVJbWFnZVRhZ0xpc3RbaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGw9MDsgbDwgdGhpcy5jdXJyZW50UnVuTGlzdC5sZW5ndGg7IGwrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jdXJyZW50UnVuTGlzdFtsXS5pbWFnZU5hbWUgPT09IHRhZy5pbWFnZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSdW5MaXN0W2xdLmltYWdlVGFnID0gdGhpcy5zZWxlY3RlZFJ1blByaXZhdGVJbWFnZVRhZy50YWc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQHBhcmFtIGltYWdlVHlwZTogJ2NvbXBpbGUo57yW6K+R6ZWc5YOPKS8ncnVuJyjov5DooYzplZzlg48pXG4gICAgICAgICAgICAgICAgLy8gQHBhcmFtIGluZGV4OiDliIfmjaLliLBpbWFnZVR5cGXplZzlg4/nmoRpbmRleOS4i+agh1xuICAgICAgICAgICAgdG9nZ2xlSW1hZ2UoaW1hZ2VUeXBlLCBpbmRleCwgaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlVHlwZSA9PT0gJ2NvbXBpbGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWFnZUluZm8uY29tcGlsZUlzUHVibGljID09PSAwIHx8IHR5cGVvZiBpbWFnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3RoaXMuc2VsZWN0ZWRDb21waWxlSW1hZ2UgPSB0aGlzLmN1cnJlbnRDb21waWxlTGlzdFtpbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbXBpbGVQcml2YXRlSW1hZ2VUYWcgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2YgaW1hZ2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlID0gdGhpcy5jdXJyZW50Q29tcGlsZUxpc3RbMF07IC8v5YiH5o2icmFkaW/ml7ZpbWFnZeS4unVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGluZGV4SW1hZ2UgPSAwOyBpbmRleEltYWdlIDwgdGhpcy5jdXJyZW50Q29tcGlsZUxpc3QubGVuZ3RoOyBpbmRleEltYWdlICsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZEltYWdlVG1wID0gdGhpcy5jdXJyZW50Q29tcGlsZUxpc3RbaW5kZXhJbWFnZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZEltYWdlVG1wLmltYWdlVHh0ID09IGltYWdlLmltYWdlVHh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29tcGlsZUltYWdlID0gc2VsZWN0ZWRJbWFnZVRtcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0UHJpdmF0ZUltYWdlVGFnKCdjb21waWxlJyxpbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbWFnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpbmRleEltYWdlID0gMDsgaW5kZXhJbWFnZSA8IHRoaXMuY3VycmVudENvbXBpbGVMaXN0Lmxlbmd0aDsgaW5kZXhJbWFnZSArKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkSW1hZ2VUbXAgPSB0aGlzLmN1cnJlbnRDb21waWxlTGlzdFtpbmRleEltYWdlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZEltYWdlVG1wLmltYWdlVHh0ID09IGltYWdlLmltYWdlVHh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbXBpbGVJbWFnZSA9IHNlbGVjdGVkSW1hZ2VUbXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb21waWxlSW1hZ2UgPSB0aGlzLmN1cnJlbnRDb21waWxlTGlzdFtpbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGltYWdlVHlwZSA9PT0gJ3J1bicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmltYWdlSW5mby5ydW5Jc1B1YmxpYyA9PT0gMCB8fCB0eXBlb2YgaW1hZ2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzLnNlbGVjdGVkUnVuSW1hZ2UgPSB0aGlzLmN1cnJlbnRSdW5MaXN0W2luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkUnVuUHJpdmF0ZUltYWdlVGFnID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mIGltYWdlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZSA9IHRoaXMuY3VycmVudFJ1bkxpc3RbMF07IC8v5YiH5o2icmFkaW/ml7ZpbWFnZeS4unVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGluZCA9IDA7IGluZCA8IHRoaXMuY3VycmVudFJ1bkxpc3QubGVuZ3RoOyBpbmQgKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUnVuSW1hZ2VUbXAgPSB0aGlzLmN1cnJlbnRSdW5MaXN0W2luZF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZFJ1bkltYWdlVG1wLmltYWdlVHh0ID09IGltYWdlLmltYWdlVHh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkUnVuSW1hZ2UgPSBzZWxlY3RlZFJ1bkltYWdlVG1wO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRQcml2YXRlSW1hZ2VUYWcoJ3J1bicsaW1hZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW1hZ2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaW5kID0gMDsgaW5kIDwgdGhpcy5jdXJyZW50UnVuTGlzdC5sZW5ndGg7IGluZCArKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUnVuSW1hZ2VUbXAgPSB0aGlzLmN1cnJlbnRSdW5MaXN0W2luZF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRSdW5JbWFnZVRtcC5pbWFnZVR4dCA9PSBpbWFnZS5pbWFnZVR4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSdW5JbWFnZSA9IHNlbGVjdGVkUnVuSW1hZ2VUbXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSdW5JbWFnZSA9IGFuZ3VsYXIuY29weSh0aGlzLmN1cnJlbnRSdW5MaXN0W2luZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOiuvue9rum7mOiupOmAieaLqeeahOmVnOWDj1xuICAgICAgICAgICAgdG9nZ2xlU3BlY2lmaWVkSW1hZ2UodHlwZSwgaW1nT2JqKSB7XG4gICAgICAgICAgICAgICAgbGV0IGltYWdlVHh0ID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKCR1dGlsLmlzT2JqZWN0KGltZ09iaikpIHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VUeHQgPSBpbWdPYmouaW1hZ2VOYW1lO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW1nT2JqLmltYWdlVGFnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVR4dCArPSAnOicgKyBpbWdPYmouaW1hZ2VUYWc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbWdPYmogPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ2NvbXBpbGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb21waWxlSW1hZ2UgPSBpbWdPYmo7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb21waWxlSW1hZ2UuaW1hZ2VUeHQgPSBpbWFnZVR4dDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbXBpbGVQcml2YXRlSW1hZ2VUYWcudGFnID0gaW1nT2JqLmltYWdlVGFnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlSW5mby5jb21waWxlSXNQdWJsaWMgPSBpbWdPYmoucmVnaXN0cnlUeXBlICE9PSB2b2lkIDAgPyBpbWdPYmoucmVnaXN0cnlUeXBlIDogMTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q29tcGlsZUxpc3QgPSBpbWdPYmoucmVnaXN0cnlUeXBlID09PSAxID8gdGhpcy5wcm9qZWN0SW1hZ2VzSW5mby5jb21waWxlUHVibGljSW1hZ2VMaXN0IDogdGhpcy5wcm9qZWN0SW1hZ2VzSW5mby5jb21waWxlUHJpdmF0ZUltYWdlTGlzdDtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSdW5JbWFnZSA9IGltZ09iajtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFJ1bkltYWdlLmltYWdlVHh0ID0gaW1hZ2VUeHQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSdW5Qcml2YXRlSW1hZ2VUYWcudGFnID0gaW1nT2JqLmltYWdlVGFnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlSW5mby5ydW5Jc1B1YmxpYyA9IGltZ09iai5yZWdpc3RyeVR5cGUgIT09IHZvaWQgMCA/IGltZ09iai5yZWdpc3RyeVR5cGUgOiAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSdW5MaXN0ID0gaW1nT2JqLnJlZ2lzdHJ5VHlwZSA9PT0gMSA/IHRoaXMucHJvamVjdEltYWdlc0luZm8ucnVuUHVibGljSW1hZ2VMaXN0IDogdGhpcy5wcm9qZWN0SW1hZ2VzSW5mby5ydW5Qcml2YXRlSW1hZ2VMaXN0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgY2xhc3MgUHJvamVjdCB7XG4gICAgICAgICAgICBjb25zdHJ1Y3Rvcihpbml0SW5mbykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnID0ge307XG4gICAgICAgICAgICAgICAgLy8g5o+Q5Y+W5YWs5YWxY29uZmlnLOS/neaMgXZpZXfkuI3lj5hcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMuaXNVc2VDdXN0b20gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzRGVmRG9ja2VyZmlsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdEltYWdlc0lucyA9IG5ldyBQcm9qZWN0SW1hZ2VzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KGluaXRJbmZvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluaXQocHJvamVjdCkge1xuICAgICAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICAgICAgYXV0b0J1aWxkSW5mbztcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KHByb2plY3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3QgPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcgPSB7fTtcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KHByb2plY3QuZG9ja2VyZmlsZUluZm8pKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3QuZG9ja2VyZmlsZUluZm8gPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc09iamVjdChwcm9qZWN0LmRvY2tlcmZpbGVDb25maWcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3QuZG9ja2VyZmlsZUNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocHJvamVjdC5leGNsdXNpdmVCdWlsZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZyA9IHByb2plY3QuZXhjbHVzaXZlQnVpbGQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNVc2VDdXN0b20gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzRGVmRG9ja2VyZmlsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvamVjdC51c2VyRGVmaW5lRG9ja2VyZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZyA9IHByb2plY3QuZG9ja2VyZmlsZUluZm87XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNVc2VDdXN0b20gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlZkRvY2tlcmZpbGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb2plY3QuY3VzdG9tRG9ja2VyZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZyA9IHByb2plY3QuY3VzdG9tRG9ja2VyZmlsZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1VzZUN1c3RvbSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzRGVmRG9ja2VyZmlsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcgPSBwcm9qZWN0LmRvY2tlcmZpbGVDb25maWc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNVc2VDdXN0b20gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlZkRvY2tlcmZpbGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5Yid5aeL5YyWIGF1dG9CdWlsZEluZm9cbiAgICAgICAgICAgICAgICB0aGlzLmF1dG9CdWlsZEluZm8gPSBhbmd1bGFyLmNvcHkocHJvamVjdC5hdXRvQnVpbGRJbmZvKTtcbiAgICAgICAgICAgICAgICBwcm9qZWN0LmF1dG9CdWlsZEluZm8gPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYXV0b0J1aWxkSW5mbyA9IHByb2plY3QuYXV0b0J1aWxkSW5mbyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0F1dG9CdWlsZEluZm8sIGJyYW5jaGVzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KGF1dG9CdWlsZEluZm8pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZzogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXN0ZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmFuY2hlczogJydcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJhbmNoZXMgPSBwcm9qZWN0LmF1dG9CdWlsZEluZm8uYnJhbmNoZXM7XG4gICAgICAgICAgICAgICAgICAgIG5ld0F1dG9CdWlsZEluZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWc6IGF1dG9CdWlsZEluZm8udGFnIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXN0ZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmNoZXM6ICcnXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmIChicmFuY2hlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBicmFuY2hlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChicmFuY2hlc1tpXSA9PSAnbWFzdGVyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvLm1hc3RlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5jaGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChicmFuY2hlcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvLm90aGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvLmJyYW5jaGVzID0gYnJhbmNoZXMuam9pbignLCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBdXRvQnVpbGRJbmZvO1xuXG4gICAgICAgICAgICAgICAgfSkoKTtcblxuXG4gICAgICAgICAgICAgICAgcHJvamVjdC5jb25mRmlsZXMgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29uZkZpbGVzID0gcHJvamVjdC5jb25mRmlsZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBcnIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc09iamVjdChjb25mRmlsZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cGxEaXI6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbkRpcjogJydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyhjb25mRmlsZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBcnIucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHBsRGlyOiBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luRGlyOiBjb25mRmlsZXNba2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbmV3QXJyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgdHBsRGlyOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbkRpcjogJydcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBcnI7XG4gICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheShwcm9qZWN0LmVudkNvbmZEZWZhdWx0KSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmVudkNvbmZEZWZhdWx0ID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByb2plY3QuZW52Q29uZkRlZmF1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5jb21waWxlRW52ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29tcGlsZUVudiA9IHRoaXMuY3VzdG9tQ29uZmlnLmNvbXBpbGVFbnY7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29tcGlsZUVudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52TmFtZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52VmFsdWU6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbXBpbGVFbnYgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYW5ndWxhci5jb3B5KGNvbXBpbGVFbnYpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb21waWxlRW52QXJyID0gY29tcGlsZUVudi5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3QXJyID0gY29tcGlsZUVudkFyci5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzaWdFbnYgPSBpdGVtLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudk5hbWU6IHNpZ0VudlswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZWYWx1ZTogc2lnRW52WzFdXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbmV3QXJyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgZW52TmFtZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnZWYWx1ZTogJydcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBcnI7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy51cGxvYWRGaWxlSW5mb3MgPSAoKHVwbG9hZEZpbGVJbmZvcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXVwbG9hZEZpbGVJbmZvcykgdXBsb2FkRmlsZUluZm9zID0gW107XG4gICAgICAgICAgICAgICAgICAgIGlmICghdXBsb2FkRmlsZUluZm9zLmxlbmd0aCkgdXBsb2FkRmlsZUluZm9zLnB1c2goeyBmaWxlbmFtZTogJycsIGNvbnRlbnQ6ICcnIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXBsb2FkRmlsZUluZm9zO1xuICAgICAgICAgICAgICAgIH0pKHRoaXMuY3VzdG9tQ29uZmlnLnVwbG9hZEZpbGVJbmZvcyk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5jcmVhdGVkRmlsZVN0b3JhZ2VQYXRoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3JlYXRlZEZpbGVTdG9yYWdlUGF0aCA9IHRoaXMuY3VzdG9tQ29uZmlnLmNyZWF0ZWRGaWxlU3RvcmFnZVBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheShjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoKSB8fCBjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdBcnIgPSBjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbmV3QXJyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBcnI7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHByb2plY3Q7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5jcmVhdG9yRHJhZnQgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc2V0Q29uZmlnKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRvY2tlcmZpbGVDb25maWcgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRvY2tlcmZpbGVJbmZvID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5leGNsdXNpdmVCdWlsZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29uZkZpbGVzID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5lbnZDb25mRGVmYXVsdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuYXV0b0J1aWxkSW5mbyA9IHRoaXMuYXV0b0J1aWxkSW5mbztcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQodGhpcy5jb25maWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlQXJySXRlbShpdGVtLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnW2l0ZW1dLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVDb21waWxlRW52KGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcuY29tcGlsZUVudi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlQ3JlYXRlZEZpbGVTdG9yYWdlUGF0aChpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnLmNyZWF0ZWRGaWxlU3RvcmFnZVBhdGguc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZEVudkNvbmZEZWZhdWx0KCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmVudkNvbmZEZWZhdWx0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICcnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkVXBsb2FkRmlsZUluZm8oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcudXBsb2FkRmlsZUluZm9zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogJycsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxVcGxvYWRGaWxlSW5mbyhpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnLnVwbG9hZEZpbGVJbmZvcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlQmFzZUltYWdlKGltYWdlTmFtZSwgaW1hZ2VUYWcsIGltYWdlUmVnaXN0cnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5iYXNlSW1hZ2VOYW1lID0gaW1hZ2VOYW1lO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnLmJhc2VJbWFnZVRhZyA9IGltYWdlVGFnO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnLmJhc2VJbWFnZVJlZ2lzdHJ5ID0gaW1hZ2VSZWdpc3RyeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZENyZWF0ZWRGaWxlU3RvcmFnZVBhdGgoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcuY3JlYXRlZEZpbGVTdG9yYWdlUGF0aC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZENvbXBpbGVFbnYoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcuY29tcGlsZUVudi5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgZW52TmFtZTogJycsXG4gICAgICAgICAgICAgICAgICAgIGVudlZhbHVlOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkQ29uZkZpbGVzKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbmZGaWxlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHBsRGlyOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luRGlyOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbW9kaWZ5KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvcHJvamVjdCcsIGFuZ3VsYXIudG9Kc29uKHRoaXMuX2Zvcm1hcnRQcm9qZWN0KCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSgpIHtcbiAgICAgICAgICAgICAgICBsZXQgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlbkRlbGV0ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0U2VydmljZS5kZWxldGVEYXRhKHRoaXMuY29uZmlnLmlkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+WIoOmZpOaIkOWKn++8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+WIoOmZpOWksei0pe+8gScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiByZXMuZGF0YS5yZXN1bHRNc2dcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoJ2ZhaWwnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdCgnZGlzbWlzcycpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcmVkLnByb21pc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnZXREb2NrZXJmaWxlKCkge1xuXG4gICAgICAgICAgICAgICAgbGV0IG9wZW5Eb2NrZXJmaWxlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9pbmRleC90cGwvbW9kYWwvZG9ja2VyZmlsZU1vZGFsL2RvY2tlcmZpbGVNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEb2NrZXJmaWxlTW9kYWxDdHIgYXMgdm0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcudXNlckRlZmluZURvY2tlcmZpbGUpIHtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VEb2NrZXJmaWxlTW9kYWxJbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9pbmRleC90cGwvbW9kYWwvYnJhbmNoQ2hlY2tNb2RhbC9icmFuY2hDaGVja01vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0JyYW5jaENoZWNrTW9kYWxDdHIgYXMgdm0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlSW5mbzogKCkgPT4gdGhpcy5jb25maWcuY29kZUluZm8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdElkOiAoKSA9PiB0aGlzLmNvbmZpZy5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB1c2VEb2NrZXJmaWxlTW9kYWxJbnMucmVzdWx0LnRoZW4oKGJyYW5jaEluZm8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRvY2tlcmZpbGVJbmZvLmJyYW5jaCA9IHRoaXMuY29uZmlnLmRvY2tlcmZpbGVJbmZvLnRhZyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5kb2NrZXJmaWxlSW5mb1ticmFuY2hJbmZvLnR5cGVdID0gYnJhbmNoSW5mby52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW5Eb2NrZXJmaWxlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9wZW5Eb2NrZXJmaWxlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gX2Zvcm1hcnRDcmVhdGVQcm9qZWN0KHByb2plY3RJbmZvKSB7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgcHJvamVjdDogcHJvamVjdEluZm9cbiAgICAgICAgICAgICAgICAvLyBjcmVhdG9yRHJhZnQ6IGNyZWF0b3JEcmFmdFxuICAgICAgICAgICAgICAgIC8vIH07XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICBfZm9ybWFydFByb2plY3QoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZvcm1hcnRQcm9qZWN0ID0ge30sXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVFbnZTdHIgPSAnJyxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEZpbGVTdG9yYWdlUGF0aEFyciA9IFtdLFxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0ID0gYW5ndWxhci5jb3B5KHRoaXMuY29uZmlnKSxcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tQ29uZmlnID0gYW5ndWxhci5jb3B5KHRoaXMuY3VzdG9tQ29uZmlnKTtcblxuICAgICAgICAgICAgICAgIHByb2plY3QuZW52Q29uZkRlZmF1bHQgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3QXJyID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ0VudkNvbmZEZWZhdWx0IG9mIHByb2plY3QuZW52Q29uZkRlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaWdFbnZDb25mRGVmYXVsdC5rZXkgJiYgc2lnRW52Q29uZkRlZmF1bHQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBcnIucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogc2lnRW52Q29uZkRlZmF1bHQua2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc2lnRW52Q29uZkRlZmF1bHQudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBzaWdFbnZDb25mRGVmYXVsdC5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBcnI7XG4gICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgIHByb2plY3QuYXV0b0J1aWxkSW5mbyA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhdXRvQnVpbGRJbmZvID0gcHJvamVjdC5hdXRvQnVpbGRJbmZvLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXV0b0J1aWxkSW5mbztcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwcm9qZWN0LmNvZGVJbmZvIHx8ICFhdXRvQnVpbGRJbmZvLm90aGVyICYmICFhdXRvQnVpbGRJbmZvLm1hc3RlciAmJiAhYXV0b0J1aWxkSW5mby50YWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5ld0F1dG9CdWlsZEluZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWc6IGF1dG9CdWlsZEluZm8udGFnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmNoZXM6IFtdXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdXRvQnVpbGRJbmZvLm90aGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvLmJyYW5jaGVzID0gYXV0b0J1aWxkSW5mby5icmFuY2hlcy5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdXRvQnVpbGRJbmZvLm1hc3Rlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXV0b0J1aWxkSW5mby5icmFuY2hlcy5wdXNoKCdtYXN0ZXInKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXV0b0J1aWxkSW5mbztcbiAgICAgICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHByb2plY3QudXNlckRlZmluZURvY2tlcmZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QubmFtZSA9IHByb2plY3QubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuaWQgPSBwcm9qZWN0LmlkO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvamVjdC5jb2RlSW5mbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuY29kZUluZm8gPSBwcm9qZWN0LmNvZGVJbmZvO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuYXV0b0J1aWxkSW5mbyA9IHByb2plY3QuYXV0b0J1aWxkSW5mbztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0UHJvamVjdC5leGNsdXNpdmVCdWlsZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hcnRQcm9qZWN0LnVzZXJEZWZpbmVEb2NrZXJmaWxlID0gcHJvamVjdC51c2VyRGVmaW5lRG9ja2VyZmlsZTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuZG9ja2VyZmlsZUluZm8gPSBwcm9qZWN0LmRvY2tlcmZpbGVJbmZvO1xuICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0UHJvamVjdC5hdXRob3JpdHkgPSBwcm9qZWN0LmF1dGhvcml0eTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuZW52Q29uZkRlZmF1bHQgPSBwcm9qZWN0LmVudkNvbmZEZWZhdWx0O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9qZWN0LmRvY2tlcmZpbGVJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmRvY2tlcmZpbGVJbmZvID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmNvbmZGaWxlcyA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3Q29uZkZpbGVzID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjb25mRmlsZSBvZiBwcm9qZWN0LmNvbmZGaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25mRmlsZS50cGxEaXIgJiYgY29uZkZpbGUub3JpZ2luRGlyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NvbmZGaWxlc1tjb25mRmlsZS50cGxEaXJdID0gY29uZkZpbGUub3JpZ2luRGlyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdDb25mRmlsZXM7XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZUVudlN0ciA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RyID0gJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyQXJyID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBlbnYgb2YgY3VzdG9tQ29uZmlnLmNvbXBpbGVFbnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW52LmVudk5hbWUgJiYgZW52LmVudlZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ckFyci5wdXNoKGVudi5lbnZOYW1lICsgJz0nICsgZW52LmVudlZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyQXJyLmpvaW4oJywnKTtcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoQXJyID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdBcnIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGl0ZW0gb2YgY3VzdG9tQ29uZmlnLmNyZWF0ZWRGaWxlU3RvcmFnZVBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Fyci5wdXNoKGl0ZW0ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld0FycjtcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcblxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzVXNlQ3VzdG9tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmRvY2tlcmZpbGVDb25maWcgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5jdXN0b21Eb2NrZXJmaWxlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZXhjbHVzaXZlQnVpbGQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VzdG9tVHlwZTogY3VzdG9tQ29uZmlnLmN1c3RvbVR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUltYWdlOiB0aGlzLnByb2plY3RJbWFnZXNJbnMuc2VsZWN0ZWRDb21waWxlSW1hZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVuSW1hZ2U6IHRoaXMucHJvamVjdEltYWdlc0lucy5zZWxlY3RlZFJ1bkltYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVTdG9yYWdlUGF0aDogY3VzdG9tQ29uZmlnLmNvZGVTdG9yYWdlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlRW52OiBjb21waWxlRW52U3RyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVDbWQ6IGN1c3RvbUNvbmZpZy5jb21waWxlQ21kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRGaWxlU3RvcmFnZVBhdGg6IGNyZWF0ZWRGaWxlU3RvcmFnZVBhdGhBcnIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya0RpcjogY3VzdG9tQ29uZmlnLndvcmtEaXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogY3VzdG9tQ29uZmlnLnVzZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVuRmlsZVN0b3JhZ2VQYXRoOiB0aGlzLnByb2plY3RJbWFnZXNJbnMuc2VsZWN0ZWRSdW5JbWFnZS5ydW5GaWxlU3RvcmFnZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDbWQ6IHRoaXMucHJvamVjdEltYWdlc0lucy5zZWxlY3RlZFJ1bkltYWdlLnN0YXJ0Q29tbWFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOacquWIneWni+WMlnRoaXMucHJvamVjdEltYWdlc0lucy5zZWxlY3RlZENvbXBpbGVJbWFnZeaXtlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnByb2plY3RJbWFnZXNJbnMuc2VsZWN0ZWRDb21waWxlSW1hZ2UuaW1hZ2VOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5leGNsdXNpdmVCdWlsZC5jb21waWxlSW1hZ2UgPSB0aGlzLmN1c3RvbUNvbmZpZy5jb21waWxlSW1hZ2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5leGNsdXNpdmVCdWlsZC5ydW5JbWFnZSA9IHRoaXMuY3VzdG9tQ29uZmlnLnJ1bkltYWdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZXhjbHVzaXZlQnVpbGQucnVuRmlsZVN0b3JhZ2VQYXRoID0gdGhpcy5jdXN0b21Db25maWcucnVuRmlsZVN0b3JhZ2VQYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZXhjbHVzaXZlQnVpbGQuc3RhcnRDbWQgPSB0aGlzLmN1c3RvbUNvbmZpZy5zdGFydENtZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzRGVmRG9ja2VyZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5leGNsdXNpdmVCdWlsZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmRvY2tlcmZpbGVDb25maWcgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5jdXN0b21Eb2NrZXJmaWxlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY2tlcmZpbGU6IGN1c3RvbUNvbmZpZy5kb2NrZXJmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwbG9hZEZpbGVJbmZvczogY3VzdG9tQ29uZmlnLnVwbG9hZEZpbGVJbmZvcy5maWx0ZXIoKHgpID0+IHguZmlsZW5hbWUgfHwgeC5jb250ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZXhjbHVzaXZlQnVpbGQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5jdXN0b21Eb2NrZXJmaWxlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZG9ja2VyZmlsZUNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlSW1hZ2VOYW1lOiBjdXN0b21Db25maWcuYmFzZUltYWdlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlSW1hZ2VUYWc6IGN1c3RvbUNvbmZpZy5iYXNlSW1hZ2VUYWcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZUltYWdlUmVnaXN0cnk6IGN1c3RvbUNvbmZpZy5iYXNlSW1hZ2VSZWdpc3RyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YWxsQ21kOiBjdXN0b21Db25maWcuaW5zdGFsbENtZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlU3RvcmFnZVBhdGg6IGN1c3RvbUNvbmZpZy5jb2RlU3RvcmFnZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUVudjogY29tcGlsZUVudlN0cixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlQ21kOiBjdXN0b21Db25maWcuY29tcGlsZUNtZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrRGlyOiBjdXN0b21Db25maWcud29ya0RpcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydENtZDogY3VzdG9tQ29uZmlnLnN0YXJ0Q21kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6IGN1c3RvbUNvbmZpZy51c2VyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hcnRQcm9qZWN0ID0gcHJvamVjdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvcm1hcnRQcm9qZWN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3JlYXRlKHByb2plY3RDb2xsZWN0aW9uSWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgY3JlYXRlUHJvamVjdCA9IHRoaXMuX2Zvcm1hcnRQcm9qZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0b3JEcmFmdCA9IGFuZ3VsYXIuY29weSh0aGlzLmNyZWF0b3JEcmFmdCk7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coY3JlYXRlUHJvamVjdCk7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvcHJvamVjdGNvbGxlY3Rpb24vJyArIHByb2plY3RDb2xsZWN0aW9uSWQrICcvcHJvamVjdCcsIGFuZ3VsYXIudG9Kc29uKHRoaXMuX2Zvcm1hcnRDcmVhdGVQcm9qZWN0KGNyZWF0ZVByb2plY3QpKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvcHJvamVjdGNvbGxlY3Rpb24vJyArIHByb2plY3RDb2xsZWN0aW9uSWQrICcvcHJvamVjdCcsIGFuZ3VsYXIudG9Kc29uKGNyZWF0ZVByb2plY3QpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGdldEluc3RhbmNlID0gJGRvbWVNb2RlbC5pbnN0YW5jZXNDcmVhdG9yKHtcbiAgICAgICAgICAgIFByb2plY3Q6IFByb2plY3QsXG4gICAgICAgICAgICBQcm9qZWN0SW1hZ2VzOiBQcm9qZWN0SW1hZ2VzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwcm9qZWN0U2VydmljZTogcHJvamVjdFNlcnZpY2UsXG4gICAgICAgICAgICBnZXRJbnN0YW5jZTogZ2V0SW5zdGFuY2UsXG4gICAgICAgICAgICBidWlsZFByb2plY3Q6IGJ1aWxkUHJvamVjdFxuICAgICAgICB9O1xuXG4gICAgfVxuICAgIERvbWVQcm9qZWN0LiRpbmplY3QgPSBbJyRodHRwJywgJyR1dGlsJywgJyRzdGF0ZScsICckZG9tZVB1YmxpYycsICckZG9tZU1vZGVsJywgJyRxJywgJyRtb2RhbCcsICckZG9tZUltYWdlJ107XG4gICAgcHJvamVjdE1vZHVsZS5mYWN0b3J5KCckZG9tZVByb2plY3QnLCBEb21lUHJvamVjdCk7XG4gICAgd2luZG93LnByb2plY3RNb2R1bGUgPSBwcm9qZWN0TW9kdWxlO1xufSkod2luZG93KTsiXX0=
