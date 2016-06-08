'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9wcm9qZWN0TW9kdWxlL3Byb2plY3RNb2R1bGUuZXMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsQ0FBQyxVQUFDLE1BQUQsRUFBUyxTQUFULEVBQXVCOztBQUVwQixpQkFGb0I7O0FBR3BCLFFBQUksZ0JBQWdCLFFBQVEsTUFBUixDQUFlLGVBQWYsRUFBZ0MsRUFBaEMsQ0FBaEIsQ0FIZ0I7O0FBS3BCLGFBQVMsV0FBVCxDQUFxQixLQUFyQixFQUE0QixLQUE1QixFQUFtQyxNQUFuQyxFQUEyQyxXQUEzQyxFQUF3RCxVQUF4RCxFQUFvRSxFQUFwRSxFQUF3RSxNQUF4RSxFQUFnRjtBQUM1RSxZQUFNLGlCQUFpQixTQUFqQixjQUFpQixHQUFZOzs7QUFDL0IsaUJBQUssR0FBTCxHQUFXLGFBQVgsQ0FEK0I7QUFFL0IsdUJBQVcsWUFBWCxDQUF3QixJQUF4QixDQUE2QixJQUE3QixFQUFtQyxLQUFLLEdBQUwsQ0FBbkMsQ0FGK0I7QUFHL0IsaUJBQUssU0FBTCxHQUFpQixVQUFDLEtBQUQsRUFBUSxNQUFSO3VCQUFtQixNQUFNLEdBQU4sQ0FBYSxNQUFLLEdBQUwsZ0JBQW1CLGNBQVMsTUFBekM7YUFBbkIsQ0FIYztBQUkvQixpQkFBSyxZQUFMLEdBQW9CO3VCQUFTLE1BQU0sR0FBTixvQkFBMkIsS0FBM0I7YUFBVCxDQUpXO0FBSy9CLGlCQUFLLFdBQUwsR0FBbUI7dUJBQVMsTUFBTSxHQUFOLENBQWEsTUFBSyxHQUFMLGtCQUFxQixLQUFsQzthQUFULENBTFk7QUFNL0IsaUJBQUssb0JBQUwsR0FBNEIsVUFBQyxNQUFELEVBQVMsaUJBQVQsRUFBNEIsV0FBNUI7dUJBQTRDLE1BQU0sR0FBTixDQUFhLE1BQUssR0FBTCxrQkFBcUIsb0JBQWUsZUFBVSxpQkFBM0Q7YUFBNUMsQ0FORztBQU8vQixpQkFBSyxPQUFMLEdBQWU7dUJBQVMsTUFBTSxHQUFOLENBQWEsTUFBSyxHQUFMLGNBQWlCLEtBQTlCO2FBQVQsQ0FQZ0I7QUFR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QUFiO0FBQ0EsMEJBQWMsWUFBZDtTQUhKLENBNWdCNEU7S0FBaEY7QUFtaEJBLGdCQUFZLE9BQVosR0FBc0IsQ0FBQyxPQUFELEVBQVUsT0FBVixFQUFtQixRQUFuQixFQUE2QixhQUE3QixFQUE0QyxZQUE1QyxFQUEwRCxJQUExRCxFQUFnRSxRQUFoRSxDQUF0QixDQXhoQm9CO0FBeWhCcEIsa0JBQWMsT0FBZCxDQUFzQixjQUF0QixFQUFzQyxXQUF0QyxFQXpoQm9CO0FBMGhCcEIsV0FBTyxhQUFQLEdBQXVCLGFBQXZCLENBMWhCb0I7Q0FBdkIsQ0FBRCxDQTJoQkcsTUEzaEJIIiwiZmlsZSI6ImNvbW1vbi9wcm9qZWN0TW9kdWxlL3Byb2plY3RNb2R1bGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoKHdpbmRvdywgdW5kZWZpbmVkKSA9PiB7XG4gICAgLy8g6aG555uu566h55CGc2VydmljZVxuICAgICd1c2Ugc3RyaWN0JztcbiAgICBsZXQgcHJvamVjdE1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdwcm9qZWN0TW9kdWxlJywgW10pO1xuXG4gICAgZnVuY3Rpb24gRG9tZVByb2plY3QoJGh0dHAsICR1dGlsLCAkc3RhdGUsICRkb21lUHVibGljLCAkZG9tZU1vZGVsLCAkcSwgJG1vZGFsKSB7XG4gICAgICAgIGNvbnN0IFByb2plY3RTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy51cmwgPSAnYXBpL3Byb2plY3QnO1xuICAgICAgICAgICAgJGRvbWVNb2RlbC5TZXJ2aWNlTW9kZWwuY2FsbCh0aGlzLCB0aGlzLnVybCk7XG4gICAgICAgICAgICB0aGlzLmdldFJlYWRNZSA9IChwcm9JZCwgYnJhbmNoKSA9PiAkaHR0cC5nZXQoYCR7dGhpcy51cmx9L3JlYWRtZS8ke3Byb0lkfS8ke2JyYW5jaH1gKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0QnVpbGRMaXN0ID0gcHJvSWQgPT4gJGh0dHAuZ2V0KGAvYXBpL2NpL2J1aWxkLyR7cHJvSWR9YCk7XG4gICAgICAgICAgICB0aGlzLmdldEJyYW5jaGVzID0gcHJvSWQgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS9icmFuY2hlcy8ke3Byb0lkfWApO1xuICAgICAgICAgICAgdGhpcy5nZXRCcmFuY2hlc1dpdGhvdXRJZCA9IChjb2RlSWQsIGNvZGVNYW5hZ2VyVXNlcklkLCBjb2RlTWFuYWdlcikgPT4gJGh0dHAuZ2V0KGAke3RoaXMudXJsfS9icmFuY2hlcy8ke2NvZGVNYW5hZ2VyfS8ke2NvZGVJZH0vJHtjb2RlTWFuYWdlclVzZXJJZH1gKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0VGFncyA9IHByb0lkID0+ICRodHRwLmdldChgJHt0aGlzLnVybH0vdGFncy8ke3Byb0lkfWApO1xuICAgICAgICAgICAgdGhpcy5nZXRUYWdzV2l0aG91dElkID0gKGNvZGVJZCwgY29kZU1hbmFnZXJVc2VySWQsIGNvZGVNYW5hZ2VyKSA9PiAkaHR0cC5nZXQoYCR7dGhpcy51cmx9L3RhZ3MvJHtjb2RlTWFuYWdlcn0vJHtjb2RlSWR9LyR7Y29kZU1hbmFnZXJVc2VySWR9YCk7XG4gICAgICAgICAgICB0aGlzLmdldEdpdExhYkluZm8gPSAoKSA9PiAkaHR0cC5nZXQoYCR7dGhpcy51cmx9L2dpdC9naXRsYWJpbmZvYCk7XG4gICAgICAgICAgICB0aGlzLmdldEJ1aWxkRG9ja2VyZmlsZSA9IChwcm9JZCwgYnVpbGRJZCkgPT4gJGh0dHAuZ2V0KGAvYXBpL2NpL2J1aWxkL2RvY2tlcmZpbGUvJHtwcm9JZH0vJHtidWlsZElkfWApO1xuICAgICAgICAgICAgdGhpcy5wcmV2aWV3RG9ja2VyZmlsZSA9IChwcm9qZWN0Q29uZmlnKSA9PiAkaHR0cC5wb3N0KCcvYXBpL2NpL2J1aWxkL2RvY2tlcmZpbGUnLCBhbmd1bGFyLnRvSnNvbihwcm9qZWN0Q29uZmlnKSwge1xuICAgICAgICAgICAgICAgIG5vdEludGVyY2VwdDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmJ1aWxkID0gKGJ1aWxkSW5mbykgPT4gJGh0dHAucG9zdCgnL2FwaS9jaS9idWlsZC9zdGFydCcsIGFuZ3VsYXIudG9Kc29uKGJ1aWxkSW5mbyksIHtcbiAgICAgICAgICAgICAgICBub3RJbnRlcmNlcHQ6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBwcm9qZWN0U2VydmljZSA9IG5ldyBQcm9qZWN0U2VydmljZSgpO1xuXG4gICAgICAgIGNvbnN0IGJ1aWxkUHJvamVjdCA9IChwcm9JZCwgaGFzQ29kZUluZm8pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkTW9kYWxJbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2luZGV4L3RwbC9tb2RhbC9idWlsZE1vZGFsL2J1aWxkTW9kYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0J1aWxkTW9kYWxDdHIgYXMgdm0nLFxuICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SW5mbzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdElkOiBwcm9JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NvZGVJbmZvOiBoYXNDb2RlSW5mb1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRNb2RhbElucy5yZXN1bHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgY2xhc3MgUHJvamVjdEltYWdlcyB7XG4gICAgICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZUlzUHVibGljOiAxLFxuICAgICAgICAgICAgICAgICAgICBydW5Jc1B1YmxpYzogMVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbXBpbGVJbWFnZSA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSdW5JbWFnZSA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudENvbXBpbGVMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UnVuTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdEltYWdlc0luZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVQdWJsaWNJbWFnZUxpc3Q6IFtdLFxuICAgICAgICAgICAgICAgICAgICBjb21waWxlUHJpdmF0ZUltYWdlTGlzdDogW10sXG4gICAgICAgICAgICAgICAgICAgIHJ1blB1YmxpY0ltYWdlTGlzdDogW10sXG4gICAgICAgICAgICAgICAgICAgIHJ1blByaXZhdGVJbWFnZUxpc3Q6IFtdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluaXQoaW1hZ2VzSW5mbykge1xuICAgICAgICAgICAgICAgIGlmICghaW1hZ2VzSW5mbylcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VzSW5mbyA9IHt9O1xuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheShpbWFnZXNJbmZvLmNvbXBpbGVQdWJsaWNJbWFnZUxpc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlc0luZm8uY29tcGlsZVB1YmxpY0ltYWdlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkoaW1hZ2VzSW5mby5jb21waWxlUHJpdmF0ZUltYWdlTGlzdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VzSW5mby5jb21waWxlUHJpdmF0ZUltYWdlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzQXJyYXkoaW1hZ2VzSW5mby5ydW5QdWJsaWNJbWFnZUxpc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlc0luZm8ucnVuUHVibGljSW1hZ2VMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheShpbWFnZXNJbmZvLnJ1blByaXZhdGVJbWFnZUxpc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlc0luZm8ucnVuUHJpdmF0ZUltYWdlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChpbWFnZXNJbmZvLCAoaW1hZ2VMaXN0LCBpbWFnZUxpc3ROYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGltYWdlIG9mIGltYWdlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuY3JlYXRlRGF0ZSA9ICR1dGlsLmdldFBhZ2VEYXRlKGltYWdlLmNyZWF0ZVRpbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuaW1hZ2VUeHQgPSBpbWFnZS5pbWFnZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2UuaW1hZ2VUYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5pbWFnZVR4dCArPSAnOicgKyBpbWFnZS5pbWFnZVRhZztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdEltYWdlc0luZm8gPSBpbWFnZXNJbmZvO1xuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkQ29tcGlsZUltYWdlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVJc1B1YmxpY0ltYWdlKCdjb21waWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlSXNQdWJsaWNJbWFnZSgncnVuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9nZ2xlSXNQdWJsaWNJbWFnZShpbWFnZVR5cGUsIGlzUHVibGljKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaXNQdWJsaWMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1B1YmxpYyA9IGltYWdlVHlwZSA9PSAnY29tcGlsZScgPyB0aGlzLmltYWdlSW5mby5jb21waWxlSXNQdWJsaWMgOiB0aGlzLmltYWdlSW5mby5ydW5Jc1B1YmxpYztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2VUeXBlID09ICdjb21waWxlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q29tcGlsZUxpc3QgPSBpc1B1YmxpYyA9PT0gMSA/IHRoaXMucHJvamVjdEltYWdlc0luZm8uY29tcGlsZVB1YmxpY0ltYWdlTGlzdCA6IHRoaXMucHJvamVjdEltYWdlc0luZm8uY29tcGlsZVByaXZhdGVJbWFnZUxpc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUltYWdlKCdjb21waWxlJywgMCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSdW5MaXN0ID0gaXNQdWJsaWMgPT09IDEgPyB0aGlzLnByb2plY3RJbWFnZXNJbmZvLnJ1blB1YmxpY0ltYWdlTGlzdCA6IHRoaXMucHJvamVjdEltYWdlc0luZm8ucnVuUHJpdmF0ZUltYWdlTGlzdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlSW1hZ2UoJ3J1bicsIDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEBwYXJhbSBpbWFnZVR5cGU6ICdjb21waWxlKOe8luivkemVnOWDjykvJ3J1bico6L+Q6KGM6ZWc5YOPKVxuICAgICAgICAgICAgICAgIC8vIEBwYXJhbSBpbmRleDog5YiH5o2i5YiwaW1hZ2VUeXBl6ZWc5YOP55qEaW5kZXjkuIvmoIdcbiAgICAgICAgICAgIHRvZ2dsZUltYWdlKGltYWdlVHlwZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlVHlwZSA9PT0gJ2NvbXBpbGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29tcGlsZUltYWdlID0gdGhpcy5jdXJyZW50Q29tcGlsZUxpc3RbaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGltYWdlVHlwZSA9PT0gJ3J1bicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSdW5JbWFnZSA9IGFuZ3VsYXIuY29weSh0aGlzLmN1cnJlbnRSdW5MaXN0W2luZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g6K6+572u6buY6K6k6YCJ5oup55qE6ZWc5YOPXG4gICAgICAgICAgICB0b2dnbGVTcGVjaWZpZWRJbWFnZSh0eXBlLCBpbWdPYmopIHtcbiAgICAgICAgICAgICAgICBsZXQgaW1hZ2VUeHQgPSAnJztcbiAgICAgICAgICAgICAgICBpZiAoJHV0aWwuaXNPYmplY3QoaW1nT2JqKSkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZVR4dCA9IGltZ09iai5pbWFnZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWdPYmouaW1hZ2VUYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVHh0ICs9ICc6JyArIGltZ09iai5pbWFnZVRhZztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGltZ09iaiA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnY29tcGlsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbXBpbGVJbWFnZSA9IGltZ09iajtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbXBpbGVJbWFnZS5pbWFnZVR4dCA9IGltYWdlVHh0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlSW5mby5jb21waWxlSXNQdWJsaWMgPSBpbWdPYmoucmVnaXN0cnlUeXBlICE9PSB2b2lkIDAgPyBpbWdPYmoucmVnaXN0cnlUeXBlIDogMTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q29tcGlsZUxpc3QgPSBpbWdPYmoucmVnaXN0cnlUeXBlID09PSAxID8gdGhpcy5wcm9qZWN0SW1hZ2VzSW5mby5jb21waWxlUHVibGljSW1hZ2VMaXN0IDogdGhpcy5wcm9qZWN0SW1hZ2VzSW5mby5jb21waWxlUHJpdmF0ZUltYWdlTGlzdDtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSdW5JbWFnZSA9IGltZ09iajtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFJ1bkltYWdlLmltYWdlVHh0ID0gaW1hZ2VUeHQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VJbmZvLnJ1bklzUHVibGljID0gaW1nT2JqLnJlZ2lzdHJ5VHlwZSAhPT0gdm9pZCAwID8gaW1nT2JqLnJlZ2lzdHJ5VHlwZSA6IDE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJ1bkxpc3QgPSBpbWdPYmoucmVnaXN0cnlUeXBlID09PSAxID8gdGhpcy5wcm9qZWN0SW1hZ2VzSW5mby5ydW5QdWJsaWNJbWFnZUxpc3QgOiB0aGlzLnByb2plY3RJbWFnZXNJbmZvLnJ1blByaXZhdGVJbWFnZUxpc3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBjbGFzcyBQcm9qZWN0IHtcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKGluaXRJbmZvKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7fTtcbiAgICAgICAgICAgICAgICAvLyDmj5Dlj5blhazlhbFjb25maWcs5L+d5oyBdmlld+S4jeWPmFxuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5pc1VzZUN1c3RvbSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdEltYWdlc0lucyA9IG5ldyBQcm9qZWN0SW1hZ2VzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KGluaXRJbmZvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluaXQocHJvamVjdCkge1xuICAgICAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICAgICAgYXV0b0J1aWxkSW5mbztcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KHByb2plY3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3QgPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcgPSB7fTtcbiAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KHByb2plY3QuZG9ja2VyZmlsZUluZm8pKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3QuZG9ja2VyZmlsZUluZm8gPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc09iamVjdChwcm9qZWN0LmRvY2tlcmZpbGVDb25maWcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3QuZG9ja2VyZmlsZUNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocHJvamVjdC51c2VyRGVmaW5lRG9ja2VyZmlsZSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZyA9ICFwcm9qZWN0LmV4Y2x1c2l2ZUJ1aWxkID8gcHJvamVjdC5kb2NrZXJmaWxlQ29uZmlnIDogcHJvamVjdC5leGNsdXNpdmVCdWlsZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g5Yid5aeL5YyWIGF1dG9CdWlsZEluZm9cbiAgICAgICAgICAgICAgICB0aGlzLmF1dG9CdWlsZEluZm8gPSBhbmd1bGFyLmNvcHkocHJvamVjdC5hdXRvQnVpbGRJbmZvKTtcbiAgICAgICAgICAgICAgICBwcm9qZWN0LmF1dG9CdWlsZEluZm8gPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYXV0b0J1aWxkSW5mbyA9IHByb2plY3QuYXV0b0J1aWxkSW5mbyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0F1dG9CdWlsZEluZm8sIGJyYW5jaGVzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoISR1dGlsLmlzT2JqZWN0KGF1dG9CdWlsZEluZm8pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZzogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXN0ZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmFuY2hlczogJydcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJhbmNoZXMgPSBwcm9qZWN0LmF1dG9CdWlsZEluZm8uYnJhbmNoZXM7XG4gICAgICAgICAgICAgICAgICAgIG5ld0F1dG9CdWlsZEluZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWc6IGF1dG9CdWlsZEluZm8udGFnIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXN0ZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmNoZXM6ICcnXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmIChicmFuY2hlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBicmFuY2hlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChicmFuY2hlc1tpXSA9PSAnbWFzdGVyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvLm1hc3RlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5jaGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChicmFuY2hlcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvLm90aGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvLmJyYW5jaGVzID0gYnJhbmNoZXMuam9pbignLCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBdXRvQnVpbGRJbmZvO1xuXG4gICAgICAgICAgICAgICAgfSkoKTtcblxuXG4gICAgICAgICAgICAgICAgcHJvamVjdC5jb25mRmlsZXMgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29uZkZpbGVzID0gcHJvamVjdC5jb25mRmlsZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBcnIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc09iamVjdChjb25mRmlsZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cGxEaXI6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbkRpcjogJydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyhjb25mRmlsZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBcnIucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHBsRGlyOiBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luRGlyOiBjb25mRmlsZXNba2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbmV3QXJyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgdHBsRGlyOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbkRpcjogJydcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBcnI7XG4gICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzVXNlQ3VzdG9tID0gISF0aGlzLmN1c3RvbUNvbmZpZy5jdXN0b21UeXBlO1xuXG4gICAgICAgICAgICAgICAgaWYgKCEkdXRpbC5pc0FycmF5KHByb2plY3QuZW52Q29uZkRlZmF1bHQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3QuZW52Q29uZkRlZmF1bHQgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHJvamVjdC5lbnZDb25mRGVmYXVsdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJydcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnLmNvbXBpbGVFbnYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb21waWxlRW52ID0gdGhpcy5jdXN0b21Db25maWcuY29tcGlsZUVudjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb21waWxlRW52KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZOYW1lOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZWYWx1ZTogJydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb21waWxlRW52QXJyID0gY29tcGlsZUVudi5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3QXJyID0gY29tcGlsZUVudkFyci5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzaWdFbnYgPSBpdGVtLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudk5hbWU6IHNpZ0VudlswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZWYWx1ZTogc2lnRW52WzFdXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbmV3QXJyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgZW52TmFtZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnZWYWx1ZTogJydcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBcnI7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5jcmVhdGVkRmlsZVN0b3JhZ2VQYXRoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3JlYXRlZEZpbGVTdG9yYWdlUGF0aCA9IHRoaXMuY3VzdG9tQ29uZmlnLmNyZWF0ZWRGaWxlU3RvcmFnZVBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGlmICghJHV0aWwuaXNBcnJheShjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoKSB8fCBjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdBcnIgPSBjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbmV3QXJyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBcnI7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHByb2plY3Q7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdG9yRHJhZnQgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc2V0Q29uZmlnKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRvY2tlcmZpbGVDb25maWcgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRvY2tlcmZpbGVJbmZvID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5leGNsdXNpdmVCdWlsZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZG9ja2VyZmlsZUluZm8gPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbmZGaWxlcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZW52Q29uZkRlZmF1bHQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmF1dG9CdWlsZEluZm8gPSB0aGlzLmF1dG9CdWlsZEluZm87XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KHRoaXMuY29uZmlnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZUFyckl0ZW0oaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ1tpdGVtXS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlQ29tcGlsZUVudihpbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnLmNvbXBpbGVFbnYuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZUNyZWF0ZWRGaWxlU3RvcmFnZVBhdGgoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5jcmVhdGVkRmlsZVN0b3JhZ2VQYXRoLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGRFbnZDb25mRGVmYXVsdCgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5lbnZDb25mRGVmYXVsdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZUJhc2VJbWFnZShpbWFnZU5hbWUsIGltYWdlVGFnLCBpbWFnZVJlZ2lzdHJ5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcuYmFzZUltYWdlTmFtZSA9IGltYWdlTmFtZTtcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5iYXNlSW1hZ2VUYWcgPSBpbWFnZVRhZztcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5iYXNlSW1hZ2VSZWdpc3RyeSA9IGltYWdlUmVnaXN0cnk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGRDcmVhdGVkRmlsZVN0b3JhZ2VQYXRoKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnLmNyZWF0ZWRGaWxlU3RvcmFnZVBhdGgucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGRDb21waWxlRW52KCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnLmNvbXBpbGVFbnYucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGVudk5hbWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICBlbnZWYWx1ZTogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZENvbmZGaWxlcygpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jb25mRmlsZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHRwbERpcjogJycsXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbkRpcjogJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1vZGlmeSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCcvYXBpL3Byb2plY3QnLCBhbmd1bGFyLnRvSnNvbih0aGlzLl9mb3JtYXJ0UHJvamVjdCgpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGUoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGRlZmVyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5EZWxldGUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdFNlcnZpY2UuZGVsZXRlRGF0YSh0aGlzLmNvbmZpZy5pZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuUHJvbXB0KCfliKDpmaTmiJDlip/vvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfliKDpmaTlpLHotKXvvIEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogcmVzLmRhdGEucmVzdWx0TXNnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KCdmYWlsJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoJ2Rpc21pc3MnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJlZC5wcm9taXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ2V0RG9ja2VyZmlsZSgpIHtcblxuICAgICAgICAgICAgICAgIGxldCBvcGVuRG9ja2VyZmlsZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgJG1vZGFsLm9wZW4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvaW5kZXgvdHBsL21vZGFsL2RvY2tlcmZpbGVNb2RhbC9kb2NrZXJmaWxlTW9kYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnRG9ja2VyZmlsZU1vZGFsQ3RyIGFzIHZtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLnVzZXJEZWZpbmVEb2NrZXJmaWxlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlRG9ja2VyZmlsZU1vZGFsSW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvaW5kZXgvdHBsL21vZGFsL2JyYW5jaENoZWNrTW9kYWwvYnJhbmNoQ2hlY2tNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdCcmFuY2hDaGVja01vZGFsQ3RyIGFzIHZtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6ICdtZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZUluZm86ICgpID0+IHRoaXMuY29uZmlnLmNvZGVJbmZvLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogKCkgPT4gdGhpcy5jb25maWcuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdXNlRG9ja2VyZmlsZU1vZGFsSW5zLnJlc3VsdC50aGVuKChicmFuY2hJbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5kb2NrZXJmaWxlSW5mby5icmFuY2ggPSB0aGlzLmNvbmZpZy5kb2NrZXJmaWxlSW5mby50YWcgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZG9ja2VyZmlsZUluZm9bYnJhbmNoSW5mby50eXBlXSA9IGJyYW5jaEluZm8udmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuRG9ja2VyZmlsZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvcGVuRG9ja2VyZmlsZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9mb3JtYXJ0Q3JlYXRlUHJvamVjdChwcm9qZWN0SW5mbywgY3JlYXRvckRyYWZ0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdEluZm8sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0b3JEcmFmdDogY3JlYXRvckRyYWZ0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9mb3JtYXJ0UHJvamVjdCgpIHtcbiAgICAgICAgICAgICAgICBsZXQgZm9ybWFydFByb2plY3QgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZUVudlN0ciA9ICcnLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoQXJyID0gW10sXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3QgPSBhbmd1bGFyLmNvcHkodGhpcy5jb25maWcpLFxuICAgICAgICAgICAgICAgICAgICBjdXN0b21Db25maWcgPSBhbmd1bGFyLmNvcHkodGhpcy5jdXN0b21Db25maWcpO1xuXG4gICAgICAgICAgICAgICAgcHJvamVjdC5lbnZDb25mRGVmYXVsdCA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdBcnIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgc2lnRW52Q29uZkRlZmF1bHQgb2YgcHJvamVjdC5lbnZDb25mRGVmYXVsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNpZ0VudkNvbmZEZWZhdWx0LmtleSAmJiBzaWdFbnZDb25mRGVmYXVsdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Fyci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBzaWdFbnZDb25mRGVmYXVsdC5rZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBzaWdFbnZDb25mRGVmYXVsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHNpZ0VudkNvbmZEZWZhdWx0LmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld0FycjtcbiAgICAgICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICAgICAgcHJvamVjdC5hdXRvQnVpbGRJbmZvID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGF1dG9CdWlsZEluZm8gPSBwcm9qZWN0LmF1dG9CdWlsZEluZm8sXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXByb2plY3QuY29kZUluZm8gfHwgIWF1dG9CdWlsZEluZm8ub3RoZXIgJiYgIWF1dG9CdWlsZEluZm8ubWFzdGVyICYmICFhdXRvQnVpbGRJbmZvLnRhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbmV3QXV0b0J1aWxkSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZzogYXV0b0J1aWxkSW5mby50YWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBicmFuY2hlczogW11cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dG9CdWlsZEluZm8ub3RoZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0F1dG9CdWlsZEluZm8uYnJhbmNoZXMgPSBhdXRvQnVpbGRJbmZvLmJyYW5jaGVzLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dG9CdWlsZEluZm8ubWFzdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvLmJyYW5jaGVzLnB1c2goJ21hc3RlcicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBdXRvQnVpbGRJbmZvO1xuICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocHJvamVjdC51c2VyRGVmaW5lRG9ja2VyZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0UHJvamVjdC5uYW1lID0gcHJvamVjdC5uYW1lO1xuICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0UHJvamVjdC5pZCA9IHByb2plY3QuaWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9qZWN0LmNvZGVJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0UHJvamVjdC5jb2RlSW5mbyA9IHByb2plY3QuY29kZUluZm87XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0UHJvamVjdC5hdXRvQnVpbGRJbmZvID0gcHJvamVjdC5hdXRvQnVpbGRJbmZvO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hcnRQcm9qZWN0LmV4Y2x1c2l2ZUJ1aWxkID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QudXNlckRlZmluZURvY2tlcmZpbGUgPSBwcm9qZWN0LnVzZXJEZWZpbmVEb2NrZXJmaWxlO1xuICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0UHJvamVjdC5kb2NrZXJmaWxlSW5mbyA9IHByb2plY3QuZG9ja2VyZmlsZUluZm87XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hcnRQcm9qZWN0LmF1dGhvcml0eSA9IHByb2plY3QuYXV0aG9yaXR5O1xuICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0UHJvamVjdC5lbnZDb25mRGVmYXVsdCA9IHByb2plY3QuZW52Q29uZkRlZmF1bHQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb2plY3QuZG9ja2VyZmlsZUluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZG9ja2VyZmlsZUluZm8gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3QuY29uZkZpbGVzID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdDb25mRmlsZXMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNvbmZGaWxlIG9mIHByb2plY3QuY29uZkZpbGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZGaWxlLnRwbERpciAmJiBjb25mRmlsZS5vcmlnaW5EaXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q29uZkZpbGVzW2NvbmZGaWxlLnRwbERpcl0gPSBjb25mRmlsZS5vcmlnaW5EaXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld0NvbmZGaWxlcztcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgICAgICBjb21waWxlRW52U3RyID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdHIgPSAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJBcnIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGVudiBvZiBjdXN0b21Db25maWcuY29tcGlsZUVudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbnYuZW52TmFtZSAmJiBlbnYuZW52VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyQXJyLnB1c2goZW52LmVudk5hbWUgKyAnPScgKyBlbnYuZW52VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJBcnIuam9pbignLCcpO1xuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRGaWxlU3RvcmFnZVBhdGhBcnIgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld0FyciA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaXRlbSBvZiBjdXN0b21Db25maWcuY3JlYXRlZEZpbGVTdG9yYWdlUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXJyLnB1c2goaXRlbS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXJyO1xuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNVc2VDdXN0b20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZG9ja2VyZmlsZUNvbmZpZyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmV4Y2x1c2l2ZUJ1aWxkID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbVR5cGU6IGN1c3RvbUNvbmZpZy5jdXN0b21UeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVJbWFnZTogdGhpcy5wcm9qZWN0SW1hZ2VzSW5zLnNlbGVjdGVkQ29tcGlsZUltYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bkltYWdlOiB0aGlzLnByb2plY3RJbWFnZXNJbnMuc2VsZWN0ZWRSdW5JbWFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlU3RvcmFnZVBhdGg6IGN1c3RvbUNvbmZpZy5jb2RlU3RvcmFnZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUVudjogY29tcGlsZUVudlN0cixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlQ21kOiBjdXN0b21Db25maWcuY29tcGlsZUNtZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoOiBjcmVhdGVkRmlsZVN0b3JhZ2VQYXRoQXJyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtEaXI6IGN1c3RvbUNvbmZpZy53b3JrRGlyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6IGN1c3RvbUNvbmZpZy51c2VyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bkZpbGVTdG9yYWdlUGF0aDogdGhpcy5wcm9qZWN0SW1hZ2VzSW5zLnNlbGVjdGVkUnVuSW1hZ2UucnVuRmlsZVN0b3JhZ2VQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0Q21kOiB0aGlzLnByb2plY3RJbWFnZXNJbnMuc2VsZWN0ZWRSdW5JbWFnZS5zdGFydENvbW1hbmRcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmnKrliJ3lp4vljJZ0aGlzLnByb2plY3RJbWFnZXNJbnMuc2VsZWN0ZWRDb21waWxlSW1hZ2Xml7ZcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5wcm9qZWN0SW1hZ2VzSW5zLnNlbGVjdGVkQ29tcGlsZUltYWdlLmltYWdlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZXhjbHVzaXZlQnVpbGQuY29tcGlsZUltYWdlID0gdGhpcy5jdXN0b21Db25maWcuY29tcGlsZUltYWdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZXhjbHVzaXZlQnVpbGQucnVuSW1hZ2UgPSB0aGlzLmN1c3RvbUNvbmZpZy5ydW5JbWFnZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmV4Y2x1c2l2ZUJ1aWxkLnJ1bkZpbGVTdG9yYWdlUGF0aCA9IHRoaXMuY3VzdG9tQ29uZmlnLnJ1bkZpbGVTdG9yYWdlUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmV4Y2x1c2l2ZUJ1aWxkLnN0YXJ0Q21kID0gdGhpcy5jdXN0b21Db25maWcuc3RhcnRDbWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmV4Y2x1c2l2ZUJ1aWxkID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZG9ja2VyZmlsZUNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlSW1hZ2VOYW1lOiBjdXN0b21Db25maWcuYmFzZUltYWdlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlSW1hZ2VUYWc6IGN1c3RvbUNvbmZpZy5iYXNlSW1hZ2VUYWcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZUltYWdlUmVnaXN0cnk6IGN1c3RvbUNvbmZpZy5iYXNlSW1hZ2VSZWdpc3RyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YWxsQ21kOiBjdXN0b21Db25maWcuaW5zdGFsbENtZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlU3RvcmFnZVBhdGg6IGN1c3RvbUNvbmZpZy5jb2RlU3RvcmFnZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUVudjogY29tcGlsZUVudlN0cixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlQ21kOiBjdXN0b21Db25maWcuY29tcGlsZUNtZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrRGlyOiBjdXN0b21Db25maWcud29ya0RpcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydENtZDogY3VzdG9tQ29uZmlnLnN0YXJ0Q21kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6IGN1c3RvbUNvbmZpZy51c2VyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hcnRQcm9qZWN0ID0gcHJvamVjdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvcm1hcnRQcm9qZWN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3JlYXRlKCkge1xuICAgICAgICAgICAgICAgIGxldCBjcmVhdGVQcm9qZWN0ID0gdGhpcy5fZm9ybWFydFByb2plY3QoKSxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRvckRyYWZ0ID0gYW5ndWxhci5jb3B5KHRoaXMuY3JlYXRvckRyYWZ0KTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjcmVhdGVQcm9qZWN0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9wcm9qZWN0JywgYW5ndWxhci50b0pzb24odGhpcy5fZm9ybWFydENyZWF0ZVByb2plY3QoY3JlYXRlUHJvamVjdCwgY3JlYXRvckRyYWZ0KSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZ2V0SW5zdGFuY2UgPSAkZG9tZU1vZGVsLmluc3RhbmNlc0NyZWF0b3Ioe1xuICAgICAgICAgICAgUHJvamVjdDogUHJvamVjdCxcbiAgICAgICAgICAgIFByb2plY3RJbWFnZXM6IFByb2plY3RJbWFnZXNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHByb2plY3RTZXJ2aWNlOiBwcm9qZWN0U2VydmljZSxcbiAgICAgICAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZSxcbiAgICAgICAgICAgIGJ1aWxkUHJvamVjdDogYnVpbGRQcm9qZWN0XG4gICAgICAgIH07XG5cbiAgICB9XG4gICAgRG9tZVByb2plY3QuJGluamVjdCA9IFsnJGh0dHAnLCAnJHV0aWwnLCAnJHN0YXRlJywgJyRkb21lUHVibGljJywgJyRkb21lTW9kZWwnLCAnJHEnLCAnJG1vZGFsJ107XG4gICAgcHJvamVjdE1vZHVsZS5mYWN0b3J5KCckZG9tZVByb2plY3QnLCBEb21lUHJvamVjdCk7XG4gICAgd2luZG93LnByb2plY3RNb2R1bGUgPSBwcm9qZWN0TW9kdWxlO1xufSkod2luZG93KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
