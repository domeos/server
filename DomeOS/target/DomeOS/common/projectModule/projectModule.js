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

    function DomeProject($http, $util, $state, $domePublic, $domeModel, $q, $modal) {
        var ProjectService = function ProjectService() {
            var _this = this;

            this.url = 'api/project';
            $domeModel.ServiceModel.call(this, this.url);
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
                this.currentRunList = [];
                this.projectImagesInfo = {
                    compilePublicImageList: [],
                    compilePrivateImageList: [],
                    runPublicImageList: [],
                    runPrivateImageList: []
                };
            }

            _createClass(ProjectImages, [{
                key: 'init',
                value: function init(imagesInfo) {
                    if (!imagesInfo) imagesInfo = {};
                    if (!$util.isArray(imagesInfo.compilePublicImageList)) {
                        imagesInfo.compilePublicImageList = [];
                    }
                    if (!$util.isArray(imagesInfo.compilePrivateImageList)) {
                        imagesInfo.compilePrivateImageList = [];
                    }
                    if (!$util.isArray(imagesInfo.runPublicImageList)) {
                        imagesInfo.runPublicImageList = [];
                    }
                    if (!$util.isArray(imagesInfo.runPrivateImageList)) {
                        imagesInfo.runPrivateImageList = [];
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
                // @param imageType: 'compile(编译镜像)/'run'(运行镜像)
                // @param index: 切换到imageType镜像的index下标

            }, {
                key: 'toggleImage',
                value: function toggleImage(imageType, index) {
                    if (imageType === 'compile') {
                        this.selectedCompileImage = this.currentCompileList[index];
                    } else if (imageType === 'run') {
                        this.selectedRunImage = angular.copy(this.currentRunList[index]);
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
                        this.imageInfo.compileIsPublic = imgObj.registryType !== void 0 ? imgObj.registryType : 1;
                        this.currentCompileList = imgObj.registryType === 1 ? this.projectImagesInfo.compilePublicImageList : this.projectImagesInfo.compilePrivateImageList;
                    } else {
                        this.selectedRunImage = imgObj;
                        this.selectedRunImage.imageTxt = imageTxt;
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
                    if (project.userDefineDockerfile !== true) {
                        this.customConfig = !project.exclusiveBuild ? project.dockerfileConfig : project.exclusiveBuild;
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
                    this.isUseCustom = !!this.customConfig.customType;

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
                    this.creatorDraft = {};
                }
            }, {
                key: 'resetConfig',
                value: function resetConfig() {
                    this.config.dockerfileConfig = null;
                    this.config.dockerfileInfo = null;
                    this.config.exclusiveBuild = null;
                    this.config.dockerfileInfo = null;
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
                    var _this2 = this;

                    var defered = $q.defer();
                    $domePublic.openDelete().then(function () {
                        projectService.deleteData(_this2.config.id).then(function () {
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
                    var _this3 = this;

                    var openDockerfile = function openDockerfile() {
                        $modal.open({
                            animation: true,
                            templateUrl: '/index/tpl/modal/dockerfileModal/dockerfileModal.html',
                            controller: 'DockerfileModalCtr as vm',
                            size: 'md',
                            resolve: {
                                project: _this3
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
                                    return _this3.config.codeInfo;
                                },
                                projectId: function projectId() {
                                    return _this3.config.id;
                                }
                            }
                        });

                        useDockerfileModalIns.result.then(function (branchInfo) {
                            _this3.config.dockerfileInfo.branch = _this3.config.dockerfileInfo.tag = null;
                            _this3.config.dockerfileInfo[branchInfo.type] = branchInfo.value;
                            openDockerfile();
                        });
                    } else {
                        openDockerfile();
                    }
                }
            }, {
                key: '_formartCreateProject',
                value: function _formartCreateProject(projectInfo, creatorDraft) {
                    return {
                        project: projectInfo,
                        creatorDraft: creatorDraft
                    };
                }
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
                        } else {
                            project.exclusiveBuild = null;
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
                value: function create() {
                    var createProject = this._formartProject(),
                        creatorDraft = angular.copy(this.creatorDraft);
                    console.log(createProject);
                    return $http.post('/api/project', angular.toJson(this._formartCreateProject(createProject, creatorDraft)));
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
    DomeProject.$inject = ['$http', '$util', '$state', '$domePublic', '$domeModel', '$q', '$modal'];
    projectModule.factory('$domeProject', DomeProject);
    window.projectModule = projectModule;
})(window);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9wcm9qZWN0TW9kdWxlL3Byb2plY3RNb2R1bGUuZXMiXSwibmFtZXMiOlsid2luZG93IiwidW5kZWZpbmVkIiwicHJvamVjdE1vZHVsZSIsImFuZ3VsYXIiLCJtb2R1bGUiLCJEb21lUHJvamVjdCIsIiRodHRwIiwiJHV0aWwiLCIkc3RhdGUiLCIkZG9tZVB1YmxpYyIsIiRkb21lTW9kZWwiLCIkcSIsIiRtb2RhbCIsIlByb2plY3RTZXJ2aWNlIiwidXJsIiwiU2VydmljZU1vZGVsIiwiY2FsbCIsImdldFJlYWRNZSIsInByb0lkIiwiYnJhbmNoIiwiZ2V0IiwiZ2V0QnVpbGRMaXN0IiwiZ2V0QnJhbmNoZXMiLCJnZXRCcmFuY2hlc1dpdGhvdXRJZCIsImNvZGVJZCIsImNvZGVNYW5hZ2VyVXNlcklkIiwiY29kZU1hbmFnZXIiLCJnZXRUYWdzIiwiZ2V0VGFnc1dpdGhvdXRJZCIsImdldEdpdExhYkluZm8iLCJnZXRCdWlsZERvY2tlcmZpbGUiLCJidWlsZElkIiwicHJldmlld0RvY2tlcmZpbGUiLCJwcm9qZWN0Q29uZmlnIiwicG9zdCIsInRvSnNvbiIsIm5vdEludGVyY2VwdCIsImJ1aWxkIiwiYnVpbGRJbmZvIiwicHJvamVjdFNlcnZpY2UiLCJidWlsZFByb2plY3QiLCJoYXNDb2RlSW5mbyIsImJ1aWxkTW9kYWxJbnMiLCJvcGVuIiwiYW5pbWF0aW9uIiwidGVtcGxhdGVVcmwiLCJjb250cm9sbGVyIiwic2l6ZSIsInJlc29sdmUiLCJwcm9qZWN0SW5mbyIsInByb2plY3RJZCIsInJlc3VsdCIsIlByb2plY3RJbWFnZXMiLCJpbWFnZUluZm8iLCJjb21waWxlSXNQdWJsaWMiLCJydW5Jc1B1YmxpYyIsInNlbGVjdGVkQ29tcGlsZUltYWdlIiwic2VsZWN0ZWRSdW5JbWFnZSIsImN1cnJlbnRDb21waWxlTGlzdCIsImN1cnJlbnRSdW5MaXN0IiwicHJvamVjdEltYWdlc0luZm8iLCJjb21waWxlUHVibGljSW1hZ2VMaXN0IiwiY29tcGlsZVByaXZhdGVJbWFnZUxpc3QiLCJydW5QdWJsaWNJbWFnZUxpc3QiLCJydW5Qcml2YXRlSW1hZ2VMaXN0IiwiaW1hZ2VzSW5mbyIsImlzQXJyYXkiLCJmb3JFYWNoIiwiaW1hZ2VMaXN0IiwiaW1hZ2VMaXN0TmFtZSIsImltYWdlIiwiY3JlYXRlRGF0ZSIsImdldFBhZ2VEYXRlIiwiY3JlYXRlVGltZSIsImltYWdlVHh0IiwiaW1hZ2VOYW1lIiwiaW1hZ2VUYWciLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwidG9nZ2xlSXNQdWJsaWNJbWFnZSIsImltYWdlVHlwZSIsImlzUHVibGljIiwidG9nZ2xlSW1hZ2UiLCJpbmRleCIsImNvcHkiLCJ0eXBlIiwiaW1nT2JqIiwiaXNPYmplY3QiLCJyZWdpc3RyeVR5cGUiLCJQcm9qZWN0IiwiaW5pdEluZm8iLCJjb25maWciLCJjdXN0b21Db25maWciLCJpc1VzZUN1c3RvbSIsInByb2plY3RJbWFnZXNJbnMiLCJpbml0IiwicHJvamVjdCIsImkiLCJhdXRvQnVpbGRJbmZvIiwiZG9ja2VyZmlsZUluZm8iLCJkb2NrZXJmaWxlQ29uZmlnIiwidXNlckRlZmluZURvY2tlcmZpbGUiLCJleGNsdXNpdmVCdWlsZCIsIm5ld0F1dG9CdWlsZEluZm8iLCJicmFuY2hlcyIsInRhZyIsIm1hc3RlciIsIm90aGVyIiwic3BsaWNlIiwiam9pbiIsImNvbmZGaWxlcyIsIm5ld0FyciIsInRwbERpciIsIm9yaWdpbkRpciIsImtleSIsInB1c2giLCJjdXN0b21UeXBlIiwiZW52Q29uZkRlZmF1bHQiLCJ2YWx1ZSIsImRlc2NyaXB0aW9uIiwiY29tcGlsZUVudiIsImVudk5hbWUiLCJlbnZWYWx1ZSIsImNvbXBpbGVFbnZBcnIiLCJzcGxpdCIsIm1hcCIsIml0ZW0iLCJzaWdFbnYiLCJiaW5kIiwiY3JlYXRlZEZpbGVTdG9yYWdlUGF0aCIsIm5hbWUiLCJjcmVhdG9yRHJhZnQiLCJpbWFnZVJlZ2lzdHJ5IiwiYmFzZUltYWdlTmFtZSIsImJhc2VJbWFnZVRhZyIsImJhc2VJbWFnZVJlZ2lzdHJ5IiwicHV0IiwiX2Zvcm1hcnRQcm9qZWN0IiwiZGVmZXJlZCIsImRlZmVyIiwib3BlbkRlbGV0ZSIsInRoZW4iLCJkZWxldGVEYXRhIiwiaWQiLCJvcGVuUHJvbXB0IiwicmVzIiwib3Blbldhcm5pbmciLCJ0aXRsZSIsIm1zZyIsImRhdGEiLCJyZXN1bHRNc2ciLCJyZWplY3QiLCJwcm9taXNlIiwib3BlbkRvY2tlcmZpbGUiLCJ1c2VEb2NrZXJmaWxlTW9kYWxJbnMiLCJjb2RlSW5mbyIsImJyYW5jaEluZm8iLCJmb3JtYXJ0UHJvamVjdCIsImNvbXBpbGVFbnZTdHIiLCJjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoQXJyIiwic2lnRW52Q29uZkRlZmF1bHQiLCJhdXRob3JpdHkiLCJuZXdDb25mRmlsZXMiLCJjb25mRmlsZSIsInN0ciIsInN0ckFyciIsImVudiIsImNvbXBpbGVJbWFnZSIsInJ1bkltYWdlIiwiY29kZVN0b3JhZ2VQYXRoIiwiY29tcGlsZUNtZCIsIndvcmtEaXIiLCJ1c2VyIiwicnVuRmlsZVN0b3JhZ2VQYXRoIiwic3RhcnRDbWQiLCJzdGFydENvbW1hbmQiLCJpbnN0YWxsQ21kIiwiY3JlYXRlUHJvamVjdCIsImNvbnNvbGUiLCJsb2ciLCJfZm9ybWFydENyZWF0ZVByb2plY3QiLCJnZXRJbnN0YW5jZSIsImluc3RhbmNlc0NyZWF0b3IiLCIkaW5qZWN0IiwiZmFjdG9yeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7O0FBS0EsQ0FBQyxVQUFDQSxNQUFELEVBQVNDLFNBQVQsRUFBdUI7QUFDcEI7QUFDQTs7QUFDQSxRQUFJQyxnQkFBZ0JDLFFBQVFDLE1BQVIsQ0FBZSxlQUFmLEVBQWdDLEVBQWhDLENBQXBCOztBQUVBLGFBQVNDLFdBQVQsQ0FBcUJDLEtBQXJCLEVBQTRCQyxLQUE1QixFQUFtQ0MsTUFBbkMsRUFBMkNDLFdBQTNDLEVBQXdEQyxVQUF4RCxFQUFvRUMsRUFBcEUsRUFBd0VDLE1BQXhFLEVBQWdGO0FBQzVFLFlBQU1DLGlCQUFpQixTQUFq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QUEyQkgsYUFBM0IsRUFBMEM5QyxZQUExQyxDQUFmLENBQTNCLENBQVA7QUFDSDtBQXBnQnVFOztBQUFBO0FBQUE7O0FBdWdCNUUsWUFBTWtELGNBQWM1SyxXQUFXNkssZ0JBQVgsQ0FBNEI7QUFDNUM3RixxQkFBU0EsT0FEbUM7QUFFNUN0QywyQkFBZUE7QUFGNkIsU0FBNUIsQ0FBcEI7O0FBS0EsZUFBTztBQUNIYiw0QkFBZ0JBLGNBRGI7QUFFSCtJLHlCQUFhQSxXQUZWO0FBR0g5SSwwQkFBY0E7QUFIWCxTQUFQO0FBTUg7QUFDRG5DLGdCQUFZbUwsT0FBWixHQUFzQixDQUFDLE9BQUQsRUFBVSxPQUFWLEVBQW1CLFFBQW5CLEVBQTZCLGFBQTdCLEVBQTRDLFlBQTVDLEVBQTBELElBQTFELEVBQWdFLFFBQWhFLENBQXRCO0FBQ0F0TCxrQkFBY3VMLE9BQWQsQ0FBc0IsY0FBdEIsRUFBc0NwTCxXQUF0QztBQUNBTCxXQUFPRSxhQUFQLEdBQXVCQSxhQUF2QjtBQUNILENBM2hCRCxFQTJoQkdGLE1BM2hCSCIsImZpbGUiOiJjb21tb24vcHJvamVjdE1vZHVsZS9wcm9qZWN0TW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIEBhdXRob3IgIENoYW5kcmFMZWVcbiAqIEBkZXNjcmlwdGlvbiAg6aG555uu5qih5Z2XXG4gKi9cblxuKCh3aW5kb3csIHVuZGVmaW5lZCkgPT4ge1xuICAgIC8vIOmhueebrueuoeeQhnNlcnZpY2VcbiAgICAndXNlIHN0cmljdCc7XG4gICAgbGV0IHByb2plY3RNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncHJvamVjdE1vZHVsZScsIFtdKTtcblxuICAgIGZ1bmN0aW9uIERvbWVQcm9qZWN0KCRodHRwLCAkdXRpbCwgJHN0YXRlLCAkZG9tZVB1YmxpYywgJGRvbWVNb2RlbCwgJHEsICRtb2RhbCkge1xuICAgICAgICBjb25zdCBQcm9qZWN0U2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMudXJsID0gJ2FwaS9wcm9qZWN0JztcbiAgICAgICAgICAgICRkb21lTW9kZWwuU2VydmljZU1vZGVsLmNhbGwodGhpcywgdGhpcy51cmwpO1xuICAgICAgICAgICAgdGhpcy5nZXRSZWFkTWUgPSAocHJvSWQsIGJyYW5jaCkgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS9yZWFkbWUvJHtwcm9JZH0vJHticmFuY2h9YCk7XG4gICAgICAgICAgICB0aGlzLmdldEJ1aWxkTGlzdCA9IHByb0lkID0+ICRodHRwLmdldChgL2FwaS9jaS9idWlsZC8ke3Byb0lkfWApO1xuICAgICAgICAgICAgdGhpcy5nZXRCcmFuY2hlcyA9IHByb0lkID0+ICRodHRwLmdldChgJHt0aGlzLnVybH0vYnJhbmNoZXMvJHtwcm9JZH1gKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0QnJhbmNoZXNXaXRob3V0SWQgPSAoY29kZUlkLCBjb2RlTWFuYWdlclVzZXJJZCwgY29kZU1hbmFnZXIpID0+ICRodHRwLmdldChgJHt0aGlzLnVybH0vYnJhbmNoZXMvJHtjb2RlTWFuYWdlcn0vJHtjb2RlSWR9LyR7Y29kZU1hbmFnZXJVc2VySWR9YCk7XG4gICAgICAgICAgICB0aGlzLmdldFRhZ3MgPSBwcm9JZCA9PiAkaHR0cC5nZXQoYCR7dGhpcy51cmx9L3RhZ3MvJHtwcm9JZH1gKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0VGFnc1dpdGhvdXRJZCA9IChjb2RlSWQsIGNvZGVNYW5hZ2VyVXNlcklkLCBjb2RlTWFuYWdlcikgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS90YWdzLyR7Y29kZU1hbmFnZXJ9LyR7Y29kZUlkfS8ke2NvZGVNYW5hZ2VyVXNlcklkfWApO1xuICAgICAgICAgICAgdGhpcy5nZXRHaXRMYWJJbmZvID0gKCkgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS9naXQvZ2l0bGFiaW5mb2ApO1xuICAgICAgICAgICAgdGhpcy5nZXRCdWlsZERvY2tlcmZpbGUgPSAocHJvSWQsIGJ1aWxkSWQpID0+ICRodHRwLmdldChgL2FwaS9jaS9idWlsZC9kb2NrZXJmaWxlLyR7cHJvSWR9LyR7YnVpbGRJZH1gKTtcbiAgICAgICAgICAgIHRoaXMucHJldmlld0RvY2tlcmZpbGUgPSAocHJvamVjdENvbmZpZykgPT4gJGh0dHAucG9zdCgnL2FwaS9jaS9idWlsZC9kb2NrZXJmaWxlJywgYW5ndWxhci50b0pzb24ocHJvamVjdENvbmZpZyksIHtcbiAgICAgICAgICAgICAgICBub3RJbnRlcmNlcHQ6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5idWlsZCA9IChidWlsZEluZm8pID0+ICRodHRwLnBvc3QoJy9hcGkvY2kvYnVpbGQvc3RhcnQnLCBhbmd1bGFyLnRvSnNvbihidWlsZEluZm8pLCB7XG4gICAgICAgICAgICAgICAgbm90SW50ZXJjZXB0OiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcHJvamVjdFNlcnZpY2UgPSBuZXcgUHJvamVjdFNlcnZpY2UoKTtcblxuICAgICAgICBjb25zdCBidWlsZFByb2plY3QgPSAocHJvSWQsIGhhc0NvZGVJbmZvKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBidWlsZE1vZGFsSW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9pbmRleC90cGwvbW9kYWwvYnVpbGRNb2RhbC9idWlsZE1vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdCdWlsZE1vZGFsQ3RyIGFzIHZtJyxcbiAgICAgICAgICAgICAgICBzaXplOiAnbWQnLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdEluZm86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogcHJvSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDb2RlSW5mbzogaGFzQ29kZUluZm9cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkTW9kYWxJbnMucmVzdWx0O1xuICAgICAgICB9O1xuXG4gICAgICAgIGNsYXNzIFByb2plY3RJbWFnZXMge1xuICAgICAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUluZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVJc1B1YmxpYzogMSxcbiAgICAgICAgICAgICAgICAgICAgcnVuSXNQdWJsaWM6IDFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb21waWxlSW1hZ2UgPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkUnVuSW1hZ2UgPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRDb21waWxlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJ1bkxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2plY3RJbWFnZXNJbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICBjb21waWxlUHVibGljSW1hZ2VMaXN0OiBbXSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZVByaXZhdGVJbWFnZUxpc3Q6IFtdLFxuICAgICAgICAgICAgICAgICAgICBydW5QdWJsaWNJbWFnZUxpc3Q6IFtdLFxuICAgICAgICAgICAgICAgICAgICBydW5Qcml2YXRlSW1hZ2VMaXN0OiBbXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0KGltYWdlc0luZm8pIHtcbiAgICAgICAgICAgICAgICBpZiAoIWltYWdlc0luZm8pXG4gICAgICAgICAgICAgICAgICAgIGltYWdlc0luZm8gPSB7fTtcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkoaW1hZ2VzSW5mby5jb21waWxlUHVibGljSW1hZ2VMaXN0KSkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZXNJbmZvLmNvbXBpbGVQdWJsaWNJbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KGltYWdlc0luZm8uY29tcGlsZVByaXZhdGVJbWFnZUxpc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlc0luZm8uY29tcGlsZVByaXZhdGVJbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KGltYWdlc0luZm8ucnVuUHVibGljSW1hZ2VMaXN0KSkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZXNJbmZvLnJ1blB1YmxpY0ltYWdlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkoaW1hZ2VzSW5mby5ydW5Qcml2YXRlSW1hZ2VMaXN0KSkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZXNJbmZvLnJ1blByaXZhdGVJbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goaW1hZ2VzSW5mbywgKGltYWdlTGlzdCwgaW1hZ2VMaXN0TmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpbWFnZSBvZiBpbWFnZUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLmNyZWF0ZURhdGUgPSAkdXRpbC5nZXRQYWdlRGF0ZShpbWFnZS5jcmVhdGVUaW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLmltYWdlVHh0ID0gaW1hZ2UuaW1hZ2VOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlLmltYWdlVGFnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuaW1hZ2VUeHQgKz0gJzonICsgaW1hZ2UuaW1hZ2VUYWc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2plY3RJbWFnZXNJbmZvID0gaW1hZ2VzSW5mbztcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5zZWxlY3RlZENvbXBpbGVJbWFnZSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlSXNQdWJsaWNJbWFnZSgnY29tcGlsZScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUlzUHVibGljSW1hZ2UoJ3J1bicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZUlzUHVibGljSW1hZ2UoaW1hZ2VUeXBlLCBpc1B1YmxpYykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlzUHVibGljID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNQdWJsaWMgPSBpbWFnZVR5cGUgPT0gJ2NvbXBpbGUnID8gdGhpcy5pbWFnZUluZm8uY29tcGlsZUlzUHVibGljIDogdGhpcy5pbWFnZUluZm8ucnVuSXNQdWJsaWM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlVHlwZSA9PSAnY29tcGlsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudENvbXBpbGVMaXN0ID0gaXNQdWJsaWMgPT09IDEgPyB0aGlzLnByb2plY3RJbWFnZXNJbmZvLmNvbXBpbGVQdWJsaWNJbWFnZUxpc3QgOiB0aGlzLnByb2plY3RJbWFnZXNJbmZvLmNvbXBpbGVQcml2YXRlSW1hZ2VMaXN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVJbWFnZSgnY29tcGlsZScsIDApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UnVuTGlzdCA9IGlzUHVibGljID09PSAxID8gdGhpcy5wcm9qZWN0SW1hZ2VzSW5mby5ydW5QdWJsaWNJbWFnZUxpc3QgOiB0aGlzLnByb2plY3RJbWFnZXNJbmZvLnJ1blByaXZhdGVJbWFnZUxpc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUltYWdlKCdydW4nLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBAcGFyYW0gaW1hZ2VUeXBlOiAnY29tcGlsZSjnvJbor5HplZzlg48pLydydW4nKOi/kOihjOmVnOWDjylcbiAgICAgICAgICAgICAgICAvLyBAcGFyYW0gaW5kZXg6IOWIh+aNouWIsGltYWdlVHlwZemVnOWDj+eahGluZGV45LiL5qCHXG4gICAgICAgICAgICB0b2dnbGVJbWFnZShpbWFnZVR5cGUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZVR5cGUgPT09ICdjb21waWxlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbXBpbGVJbWFnZSA9IHRoaXMuY3VycmVudENvbXBpbGVMaXN0W2luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpbWFnZVR5cGUgPT09ICdydW4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkUnVuSW1hZ2UgPSBhbmd1bGFyLmNvcHkodGhpcy5jdXJyZW50UnVuTGlzdFtpbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOiuvue9rum7mOiupOmAieaLqeeahOmVnOWDj1xuICAgICAgICAgICAgdG9nZ2xlU3BlY2lmaWVkSW1hZ2UodHlwZSwgaW1nT2JqKSB7XG4gICAgICAgICAgICAgICAgbGV0IGltYWdlVHh0ID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKCR1dGlsLmlzT2JqZWN0KGltZ09iaikpIHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VUeHQgPSBpbWdPYmouaW1hZ2VOYW1lO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW1nT2JqLmltYWdlVGFnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVR4dCArPSAnOicgKyBpbWdPYmouaW1hZ2VUYWc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbWdPYmogPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ2NvbXBpbGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb21waWxlSW1hZ2UgPSBpbWdPYmo7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb21waWxlSW1hZ2UuaW1hZ2VUeHQgPSBpbWFnZVR4dDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUluZm8uY29tcGlsZUlzUHVibGljID0gaW1nT2JqLnJlZ2lzdHJ5VHlwZSAhPT0gdm9pZCAwID8gaW1nT2JqLnJlZ2lzdHJ5VHlwZSA6IDE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudENvbXBpbGVMaXN0ID0gaW1nT2JqLnJlZ2lzdHJ5VHlwZSA9PT0gMSA/IHRoaXMucHJvamVjdEltYWdlc0luZm8uY29tcGlsZVB1YmxpY0ltYWdlTGlzdCA6IHRoaXMucHJvamVjdEltYWdlc0luZm8uY29tcGlsZVByaXZhdGVJbWFnZUxpc3Q7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkUnVuSW1hZ2UgPSBpbWdPYmo7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSdW5JbWFnZS5pbWFnZVR4dCA9IGltYWdlVHh0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlSW5mby5ydW5Jc1B1YmxpYyA9IGltZ09iai5yZWdpc3RyeVR5cGUgIT09IHZvaWQgMCA/IGltZ09iai5yZWdpc3RyeVR5cGUgOiAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSdW5MaXN0ID0gaW1nT2JqLnJlZ2lzdHJ5VHlwZSA9PT0gMSA/IHRoaXMucHJvamVjdEltYWdlc0luZm8ucnVuUHVibGljSW1hZ2VMaXN0IDogdGhpcy5wcm9qZWN0SW1hZ2VzSW5mby5ydW5Qcml2YXRlSW1hZ2VMaXN0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgY2xhc3MgUHJvamVjdCB7XG4gICAgICAgICAgICBjb25zdHJ1Y3Rvcihpbml0SW5mbykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnID0ge307XG4gICAgICAgICAgICAgICAgLy8g5o+Q5Y+W5YWs5YWxY29uZmlnLOS/neaMgXZpZXfkuI3lj5hcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMuaXNVc2VDdXN0b20gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2plY3RJbWFnZXNJbnMgPSBuZXcgUHJvamVjdEltYWdlcygpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdChpbml0SW5mbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0KHByb2plY3QpIHtcbiAgICAgICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgICAgIGF1dG9CdWlsZEluZm87XG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc09iamVjdChwcm9qZWN0KSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0ID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnID0ge307XG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc09iamVjdChwcm9qZWN0LmRvY2tlcmZpbGVJbmZvKSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmRvY2tlcmZpbGVJbmZvID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNPYmplY3QocHJvamVjdC5kb2NrZXJmaWxlQ29uZmlnKSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmRvY2tlcmZpbGVDb25maWcgPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHByb2plY3QudXNlckRlZmluZURvY2tlcmZpbGUgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcgPSAhcHJvamVjdC5leGNsdXNpdmVCdWlsZCA/IHByb2plY3QuZG9ja2VyZmlsZUNvbmZpZyA6IHByb2plY3QuZXhjbHVzaXZlQnVpbGQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWIneWni+WMliBhdXRvQnVpbGRJbmZvXG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvQnVpbGRJbmZvID0gYW5ndWxhci5jb3B5KHByb2plY3QuYXV0b0J1aWxkSW5mbyk7XG4gICAgICAgICAgICAgICAgcHJvamVjdC5hdXRvQnVpbGRJbmZvID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGF1dG9CdWlsZEluZm8gPSBwcm9qZWN0LmF1dG9CdWlsZEluZm8sXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvLCBicmFuY2hlcztcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc09iamVjdChhdXRvQnVpbGRJbmZvKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWc6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzdGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdGhlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmNoZXM6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyYW5jaGVzID0gcHJvamVjdC5hdXRvQnVpbGRJbmZvLmJyYW5jaGVzO1xuICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiBhdXRvQnVpbGRJbmZvLnRhZyB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFzdGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5jaGVzOiAnJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAoYnJhbmNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnJhbmNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYnJhbmNoZXNbaV0gPT0gJ21hc3RlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXV0b0J1aWxkSW5mby5tYXN0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmFuY2hlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYnJhbmNoZXMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXV0b0J1aWxkSW5mby5vdGhlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXV0b0J1aWxkSW5mby5icmFuY2hlcyA9IGJyYW5jaGVzLmpvaW4oJywnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXV0b0J1aWxkSW5mbztcblxuICAgICAgICAgICAgICAgIH0pKCk7XG5cblxuICAgICAgICAgICAgICAgIHByb2plY3QuY29uZkZpbGVzID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbmZGaWxlcyA9IHByb2plY3QuY29uZkZpbGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXJyID0gW107XG4gICAgICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNPYmplY3QoY29uZkZpbGVzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHBsRGlyOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5EaXI6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMoY29uZkZpbGVzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXJyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRwbERpcjoga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbkRpcjogY29uZkZpbGVzW2tleV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5ld0Fyci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRwbERpcjogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5EaXI6ICcnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXJyO1xuICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1VzZUN1c3RvbSA9ICEhdGhpcy5jdXN0b21Db25maWcuY3VzdG9tVHlwZTtcblxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheShwcm9qZWN0LmVudkNvbmZEZWZhdWx0KSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmVudkNvbmZEZWZhdWx0ID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByb2plY3QuZW52Q29uZkRlZmF1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5jb21waWxlRW52ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29tcGlsZUVudiA9IHRoaXMuY3VzdG9tQ29uZmlnLmNvbXBpbGVFbnY7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29tcGlsZUVudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52TmFtZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52VmFsdWU6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgY29tcGlsZUVudkFyciA9IGNvbXBpbGVFbnYuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld0FyciA9IGNvbXBpbGVFbnZBcnIubWFwKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2lnRW52ID0gaXRlbS5zcGxpdCgnPScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZOYW1lOiBzaWdFbnZbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52VmFsdWU6IHNpZ0VudlsxXVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld0Fyci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudk5hbWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW52VmFsdWU6ICcnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXJyO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSgpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcuY3JlYXRlZEZpbGVTdG9yYWdlUGF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNyZWF0ZWRGaWxlU3RvcmFnZVBhdGggPSB0aGlzLmN1c3RvbUNvbmZpZy5jcmVhdGVkRmlsZVN0b3JhZ2VQYXRoO1xuICAgICAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkoY3JlYXRlZEZpbGVTdG9yYWdlUGF0aCkgfHwgY3JlYXRlZEZpbGVTdG9yYWdlUGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3QXJyID0gY3JlYXRlZEZpbGVTdG9yYWdlUGF0aC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld0Fyci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXJyO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSgpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSBwcm9qZWN0O1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRvckRyYWZ0ID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNldENvbmZpZygpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5kb2NrZXJmaWxlQ29uZmlnID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5kb2NrZXJmaWxlSW5mbyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZXhjbHVzaXZlQnVpbGQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRvY2tlcmZpbGVJbmZvID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jb25mRmlsZXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmVudkNvbmZEZWZhdWx0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5hdXRvQnVpbGRJbmZvID0gdGhpcy5hdXRvQnVpbGRJbmZvO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdCh0aGlzLmNvbmZpZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVBcnJJdGVtKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWdbaXRlbV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZUNvbXBpbGVFbnYoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5jb21waWxlRW52LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVDcmVhdGVkRmlsZVN0b3JhZ2VQYXRoKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcuY3JlYXRlZEZpbGVTdG9yYWdlUGF0aC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkRW52Q29uZkRlZmF1bHQoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZW52Q29uZkRlZmF1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b2dnbGVCYXNlSW1hZ2UoaW1hZ2VOYW1lLCBpbWFnZVRhZywgaW1hZ2VSZWdpc3RyeSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnLmJhc2VJbWFnZU5hbWUgPSBpbWFnZU5hbWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcuYmFzZUltYWdlVGFnID0gaW1hZ2VUYWc7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcuYmFzZUltYWdlUmVnaXN0cnkgPSBpbWFnZVJlZ2lzdHJ5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkQ3JlYXRlZEZpbGVTdG9yYWdlUGF0aCgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5jcmVhdGVkRmlsZVN0b3JhZ2VQYXRoLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkQ29tcGlsZUVudigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5jb21waWxlRW52LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBlbnZOYW1lOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZW52VmFsdWU6ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGRDb25mRmlsZXMoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29uZkZpbGVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0cGxEaXI6ICcnLFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW5EaXI6ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtb2RpZnkoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnB1dCgnL2FwaS9wcm9qZWN0JywgYW5ndWxhci50b0pzb24odGhpcy5fZm9ybWFydFByb2plY3QoKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlKCkge1xuICAgICAgICAgICAgICAgIGxldCBkZWZlcmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuRGVsZXRlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RTZXJ2aWNlLmRlbGV0ZURhdGEodGhpcy5jb25maWcuaWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlblByb21wdCgn5Yig6Zmk5oiQ5Yqf77yBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3Blbldhcm5pbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5Yig6Zmk5aSx6LSl77yBJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2c6IHJlcy5kYXRhLnJlc3VsdE1zZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdCgnZmFpbCcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KCdkaXNtaXNzJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVyZWQucHJvbWlzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdldERvY2tlcmZpbGUoKSB7XG5cbiAgICAgICAgICAgICAgICBsZXQgb3BlbkRvY2tlcmZpbGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2luZGV4L3RwbC9tb2RhbC9kb2NrZXJmaWxlTW9kYWwvZG9ja2VyZmlsZU1vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0RvY2tlcmZpbGVNb2RhbEN0ciBhcyB2bScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiAnbWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy51c2VyRGVmaW5lRG9ja2VyZmlsZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZURvY2tlcmZpbGVNb2RhbElucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2luZGV4L3RwbC9tb2RhbC9icmFuY2hDaGVja01vZGFsL2JyYW5jaENoZWNrTW9kYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQnJhbmNoQ2hlY2tNb2RhbEN0ciBhcyB2bScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiAnbWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVJbmZvOiAoKSA9PiB0aGlzLmNvbmZpZy5jb2RlSW5mbyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SWQ6ICgpID0+IHRoaXMuY29uZmlnLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHVzZURvY2tlcmZpbGVNb2RhbElucy5yZXN1bHQudGhlbigoYnJhbmNoSW5mbykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZG9ja2VyZmlsZUluZm8uYnJhbmNoID0gdGhpcy5jb25maWcuZG9ja2VyZmlsZUluZm8udGFnID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRvY2tlcmZpbGVJbmZvW2JyYW5jaEluZm8udHlwZV0gPSBicmFuY2hJbmZvLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbkRvY2tlcmZpbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3BlbkRvY2tlcmZpbGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfZm9ybWFydENyZWF0ZVByb2plY3QocHJvamVjdEluZm8sIGNyZWF0b3JEcmFmdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RJbmZvLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdG9yRHJhZnQ6IGNyZWF0b3JEcmFmdFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfZm9ybWFydFByb2plY3QoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZvcm1hcnRQcm9qZWN0ID0ge30sXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVFbnZTdHIgPSAnJyxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEZpbGVTdG9yYWdlUGF0aEFyciA9IFtdLFxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0ID0gYW5ndWxhci5jb3B5KHRoaXMuY29uZmlnKSxcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tQ29uZmlnID0gYW5ndWxhci5jb3B5KHRoaXMuY3VzdG9tQ29uZmlnKTtcblxuICAgICAgICAgICAgICAgIHByb2plY3QuZW52Q29uZkRlZmF1bHQgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3QXJyID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNpZ0VudkNvbmZEZWZhdWx0IG9mIHByb2plY3QuZW52Q29uZkRlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaWdFbnZDb25mRGVmYXVsdC5rZXkgJiYgc2lnRW52Q29uZkRlZmF1bHQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBcnIucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogc2lnRW52Q29uZkRlZmF1bHQua2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc2lnRW52Q29uZkRlZmF1bHQudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBzaWdFbnZDb25mRGVmYXVsdC5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBcnI7XG4gICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgIHByb2plY3QuYXV0b0J1aWxkSW5mbyA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhdXRvQnVpbGRJbmZvID0gcHJvamVjdC5hdXRvQnVpbGRJbmZvLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXV0b0J1aWxkSW5mbztcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwcm9qZWN0LmNvZGVJbmZvIHx8ICFhdXRvQnVpbGRJbmZvLm90aGVyICYmICFhdXRvQnVpbGRJbmZvLm1hc3RlciAmJiAhYXV0b0J1aWxkSW5mby50YWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5ld0F1dG9CdWlsZEluZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWc6IGF1dG9CdWlsZEluZm8udGFnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmNoZXM6IFtdXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdXRvQnVpbGRJbmZvLm90aGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvLmJyYW5jaGVzID0gYXV0b0J1aWxkSW5mby5icmFuY2hlcy5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdXRvQnVpbGRJbmZvLm1hc3Rlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXV0b0J1aWxkSW5mby5icmFuY2hlcy5wdXNoKCdtYXN0ZXInKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXV0b0J1aWxkSW5mbztcbiAgICAgICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHByb2plY3QudXNlckRlZmluZURvY2tlcmZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QubmFtZSA9IHByb2plY3QubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuaWQgPSBwcm9qZWN0LmlkO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvamVjdC5jb2RlSW5mbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuY29kZUluZm8gPSBwcm9qZWN0LmNvZGVJbmZvO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuYXV0b0J1aWxkSW5mbyA9IHByb2plY3QuYXV0b0J1aWxkSW5mbztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0UHJvamVjdC5leGNsdXNpdmVCdWlsZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hcnRQcm9qZWN0LnVzZXJEZWZpbmVEb2NrZXJmaWxlID0gcHJvamVjdC51c2VyRGVmaW5lRG9ja2VyZmlsZTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuZG9ja2VyZmlsZUluZm8gPSBwcm9qZWN0LmRvY2tlcmZpbGVJbmZvO1xuICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0UHJvamVjdC5hdXRob3JpdHkgPSBwcm9qZWN0LmF1dGhvcml0eTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuZW52Q29uZkRlZmF1bHQgPSBwcm9qZWN0LmVudkNvbmZEZWZhdWx0O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9qZWN0LmRvY2tlcmZpbGVJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmRvY2tlcmZpbGVJbmZvID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmNvbmZGaWxlcyA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3Q29uZkZpbGVzID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjb25mRmlsZSBvZiBwcm9qZWN0LmNvbmZGaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25mRmlsZS50cGxEaXIgJiYgY29uZkZpbGUub3JpZ2luRGlyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NvbmZGaWxlc1tjb25mRmlsZS50cGxEaXJdID0gY29uZkZpbGUub3JpZ2luRGlyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdDb25mRmlsZXM7XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZUVudlN0ciA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RyID0gJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyQXJyID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBlbnYgb2YgY3VzdG9tQ29uZmlnLmNvbXBpbGVFbnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW52LmVudk5hbWUgJiYgZW52LmVudlZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ckFyci5wdXNoKGVudi5lbnZOYW1lICsgJz0nICsgZW52LmVudlZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyQXJyLmpvaW4oJywnKTtcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoQXJyID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdBcnIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGl0ZW0gb2YgY3VzdG9tQ29uZmlnLmNyZWF0ZWRGaWxlU3RvcmFnZVBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Fyci5wdXNoKGl0ZW0ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld0FycjtcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcblxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzVXNlQ3VzdG9tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmRvY2tlcmZpbGVDb25maWcgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5leGNsdXNpdmVCdWlsZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXN0b21UeXBlOiBjdXN0b21Db25maWcuY3VzdG9tVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlSW1hZ2U6IHRoaXMucHJvamVjdEltYWdlc0lucy5zZWxlY3RlZENvbXBpbGVJbWFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydW5JbWFnZTogdGhpcy5wcm9qZWN0SW1hZ2VzSW5zLnNlbGVjdGVkUnVuSW1hZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZVN0b3JhZ2VQYXRoOiBjdXN0b21Db25maWcuY29kZVN0b3JhZ2VQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVFbnY6IGNvbXBpbGVFbnZTdHIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUNtZDogY3VzdG9tQ29uZmlnLmNvbXBpbGVDbWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEZpbGVTdG9yYWdlUGF0aDogY3JlYXRlZEZpbGVTdG9yYWdlUGF0aEFycixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrRGlyOiBjdXN0b21Db25maWcud29ya0RpcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiBjdXN0b21Db25maWcudXNlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydW5GaWxlU3RvcmFnZVBhdGg6IHRoaXMucHJvamVjdEltYWdlc0lucy5zZWxlY3RlZFJ1bkltYWdlLnJ1bkZpbGVTdG9yYWdlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydENtZDogdGhpcy5wcm9qZWN0SW1hZ2VzSW5zLnNlbGVjdGVkUnVuSW1hZ2Uuc3RhcnRDb21tYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5pyq5Yid5aeL5YyWdGhpcy5wcm9qZWN0SW1hZ2VzSW5zLnNlbGVjdGVkQ29tcGlsZUltYWdl5pe2XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMucHJvamVjdEltYWdlc0lucy5zZWxlY3RlZENvbXBpbGVJbWFnZS5pbWFnZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmV4Y2x1c2l2ZUJ1aWxkLmNvbXBpbGVJbWFnZSA9IHRoaXMuY3VzdG9tQ29uZmlnLmNvbXBpbGVJbWFnZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmV4Y2x1c2l2ZUJ1aWxkLnJ1bkltYWdlID0gdGhpcy5jdXN0b21Db25maWcucnVuSW1hZ2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5leGNsdXNpdmVCdWlsZC5ydW5GaWxlU3RvcmFnZVBhdGggPSB0aGlzLmN1c3RvbUNvbmZpZy5ydW5GaWxlU3RvcmFnZVBhdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5leGNsdXNpdmVCdWlsZC5zdGFydENtZCA9IHRoaXMuY3VzdG9tQ29uZmlnLnN0YXJ0Q21kO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5leGNsdXNpdmVCdWlsZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmRvY2tlcmZpbGVDb25maWcgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZUltYWdlTmFtZTogY3VzdG9tQ29uZmlnLmJhc2VJbWFnZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZUltYWdlVGFnOiBjdXN0b21Db25maWcuYmFzZUltYWdlVGFnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VJbWFnZVJlZ2lzdHJ5OiBjdXN0b21Db25maWcuYmFzZUltYWdlUmVnaXN0cnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFsbENtZDogY3VzdG9tQ29uZmlnLmluc3RhbGxDbWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZVN0b3JhZ2VQYXRoOiBjdXN0b21Db25maWcuY29kZVN0b3JhZ2VQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVFbnY6IGNvbXBpbGVFbnZTdHIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUNtZDogY3VzdG9tQ29uZmlnLmNvbXBpbGVDbWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya0RpcjogY3VzdG9tQ29uZmlnLndvcmtEaXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDbWQ6IGN1c3RvbUNvbmZpZy5zdGFydENtZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiBjdXN0b21Db25maWcudXNlclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0UHJvamVjdCA9IHByb2plY3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmb3JtYXJ0UHJvamVjdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNyZWF0ZSgpIHtcbiAgICAgICAgICAgICAgICBsZXQgY3JlYXRlUHJvamVjdCA9IHRoaXMuX2Zvcm1hcnRQcm9qZWN0KCksXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0b3JEcmFmdCA9IGFuZ3VsYXIuY29weSh0aGlzLmNyZWF0b3JEcmFmdCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY3JlYXRlUHJvamVjdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvcHJvamVjdCcsIGFuZ3VsYXIudG9Kc29uKHRoaXMuX2Zvcm1hcnRDcmVhdGVQcm9qZWN0KGNyZWF0ZVByb2plY3QsIGNyZWF0b3JEcmFmdCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGdldEluc3RhbmNlID0gJGRvbWVNb2RlbC5pbnN0YW5jZXNDcmVhdG9yKHtcbiAgICAgICAgICAgIFByb2plY3Q6IFByb2plY3QsXG4gICAgICAgICAgICBQcm9qZWN0SW1hZ2VzOiBQcm9qZWN0SW1hZ2VzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwcm9qZWN0U2VydmljZTogcHJvamVjdFNlcnZpY2UsXG4gICAgICAgICAgICBnZXRJbnN0YW5jZTogZ2V0SW5zdGFuY2UsXG4gICAgICAgICAgICBidWlsZFByb2plY3Q6IGJ1aWxkUHJvamVjdFxuICAgICAgICB9O1xuXG4gICAgfVxuICAgIERvbWVQcm9qZWN0LiRpbmplY3QgPSBbJyRodHRwJywgJyR1dGlsJywgJyRzdGF0ZScsICckZG9tZVB1YmxpYycsICckZG9tZU1vZGVsJywgJyRxJywgJyRtb2RhbCddO1xuICAgIHByb2plY3RNb2R1bGUuZmFjdG9yeSgnJGRvbWVQcm9qZWN0JywgRG9tZVByb2plY3QpO1xuICAgIHdpbmRvdy5wcm9qZWN0TW9kdWxlID0gcHJvamVjdE1vZHVsZTtcbn0pKHdpbmRvdyk7Il19
