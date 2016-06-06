'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
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
                    if (!imagesInfo.compilePublicImageList) {
                        imagesInfo.compilePublicImageList = [];
                    }
                    if (!imagesInfo.compilePrivateImageList) {
                        imagesInfo.compilePrivateImageList = [];
                    }
                    if (!imagesInfo.runPublicImageList) {
                        imagesInfo.runPublicImageList = [];
                    }
                    if (!imagesInfo.runPrivateImageList) {
                        imagesInfo.runPrivateImageList = [];
                    }

                    angular.forEach(imagesInfo, function (imageList, imageListName) {
                        for (var i = 0; i < imageList.length; i++) {
                            imageList[i].createDate = $util.getPageDate(imageList[i].createTime);
                            imageList[i].imageTxt = imageList[i].imageName;
                            if (imageList[i].imageTag) {
                                imageList[i].imageTxt += ':' + imageList[i].imageTag;
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
                    if (isPublic === undefined) {
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
                    if (imgObj) {
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
                        if (imgObj.registryType !== undefined) {
                            this.imageInfo.compileIsPublic = imgObj.registryType;
                        } else {
                            this.imageInfo.compileIsPublic = 1;
                        }
                        this.currentCompileList = imgObj.registryType === 1 ? this.projectImagesInfo.compilePublicImageList : this.projectImagesInfo.compilePrivateImageList;
                    } else {
                        this.selectedRunImage = imgObj;
                        this.selectedRunImage.imageTxt = imageTxt;
                        if (imgObj.registryType !== undefined) {
                            this.imageInfo.runIsPublic = imgObj.registryType;
                        } else {
                            this.imageInfo.runIsPublic = 1;
                        }
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
                    if (!project) {
                        project = {};
                    }
                    this.customConfig = {};
                    if (!project.dockerfileInfo) {
                        project.dockerfileInfo = {};
                    }
                    if (!project.dockerfileConfig) {
                        project.dockerfileConfig = {};
                    }
                    if (!project.userDefineDockerfile) {
                        this.customConfig = !project.exclusiveBuild ? project.dockerfileConfig : project.exclusiveBuild;
                    }
                    // 初始化 autoBuildInfo
                    this.autoBuildInfo = angular.copy(project.autoBuildInfo);
                    project.autoBuildInfo = function () {
                        var autoBuildInfo = project.autoBuildInfo,
                            newAutoBuildInfo = void 0,
                            branches = void 0;
                        if (!autoBuildInfo) {
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
                        if (!confFiles || confFiles.length === 0) {
                            return [{
                                tplDir: '',
                                originDir: ''
                            }];
                        }
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = Object.keys(confFiles)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var key = _step.value;

                                newArr.push({
                                    tplDir: key,
                                    originDir: confFiles[key]
                                });
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

                        newArr.push({
                            tplDir: '',
                            originDir: ''
                        });
                        return newArr;
                    }();
                    this.isUseCustom = !!this.customConfig.customType;

                    if (!project.envConfDefault) {
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
                        if (!createdFileStoragePath || createdFileStoragePath.length === 0) {
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
                    project = null;
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
                    var createProject = this._formartProject();
                    console.log(createProject);
                    return $http.put('/api/project', angular.toJson(createProject));
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
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = project.envConfDefault[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var sigEnvConfDefault = _step2.value;

                                if (sigEnvConfDefault.key && sigEnvConfDefault.value) {
                                    newArr.push({
                                        key: sigEnvConfDefault.key,
                                        value: sigEnvConfDefault.value,
                                        description: sigEnvConfDefault.description
                                    });
                                }
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
                            var _iteratorNormalCompletion3 = true;
                            var _didIteratorError3 = false;
                            var _iteratorError3 = undefined;

                            try {
                                for (var _iterator3 = project.confFiles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                    var confFile = _step3.value;

                                    if (confFile.tplDir && confFile.originDir) {
                                        newConfFiles[confFile.tplDir] = confFile.originDir;
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

                            return newConfFiles;
                        }();

                        compileEnvStr = function () {
                            var str = '',
                                strArr = [];
                            var _iteratorNormalCompletion4 = true;
                            var _didIteratorError4 = false;
                            var _iteratorError4 = undefined;

                            try {
                                for (var _iterator4 = customConfig.compileEnv[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                    var env = _step4.value;

                                    if (env.envName && env.envValue) {
                                        strArr.push(env.envName + '=' + env.envValue);
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

                            return strArr.join(',');
                        }();

                        createdFileStoragePathArr = function () {
                            var newArr = [];
                            var _iteratorNormalCompletion5 = true;
                            var _didIteratorError5 = false;
                            var _iteratorError5 = undefined;

                            try {
                                for (var _iterator5 = customConfig.createdFileStoragePath[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    var item = _step5.value;

                                    if (item.name) {
                                        newArr.push(item.name);
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
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9wcm9qZWN0TW9kdWxlL3Byb2plY3RNb2R1bGUuZXMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsQ0FBQyxZQUFNOztBQUVILGlCQUZHOztBQUdILFFBQUksZ0JBQWdCLFFBQVEsTUFBUixDQUFlLGVBQWYsRUFBZ0MsRUFBaEMsQ0FBaEIsQ0FIRDs7QUFLSCxhQUFTLFdBQVQsQ0FBcUIsS0FBckIsRUFBNEIsS0FBNUIsRUFBbUMsTUFBbkMsRUFBMkMsV0FBM0MsRUFBd0QsVUFBeEQsRUFBb0UsRUFBcEUsRUFBd0UsTUFBeEUsRUFBZ0Y7QUFDNUUsWUFBTSxpQkFBaUIsU0FBakIsY0FBaUIsR0FBWTs7O0FBQy9CLGlCQUFLLEdBQUwsR0FBVyxhQUFYLENBRCtCO0FBRS9CLHVCQUFXLFlBQVgsQ0FBd0IsSUFBeEIsQ0FBNkIsSUFBN0IsRUFBbUMsS0FBSyxHQUFMLENBQW5DLENBRitCO0FBRy9CLGlCQUFLLFNBQUwsR0FBaUIsVUFBQyxLQUFELEVBQVEsTUFBUjt1QkFBbUIsTUFBTSxHQUFOLENBQVUsTUFBSyxHQUFMLEdBQVcsVUFBWCxHQUF3QixLQUF4QixHQUFnQyxHQUFoQyxHQUFzQyxNQUF0QzthQUE3QixDQUhjO0FBSS9CLGlCQUFLLFlBQUwsR0FBb0IsVUFBQyxLQUFEO3VCQUFXLE1BQU0sR0FBTixDQUFVLG1CQUFtQixLQUFuQjthQUFyQixDQUpXO0FBSy9CLGlCQUFLLFdBQUwsR0FBbUIsVUFBQyxLQUFEO3VCQUFXLE1BQU0sR0FBTixDQUFVLE1BQUssR0FBTCxHQUFXLFlBQVgsR0FBMEIsS0FBMUI7YUFBckIsQ0FMWTtBQU0vQixpQkFBSyxvQkFBTCxHQUE0QixVQUFDLE1BQUQsRUFBUyxpQkFBVCxFQUE0QixXQUE1Qjt1QkFBNEMsTUFBTSxHQUFOLENBQVUsTUFBSyxHQUFMLEdBQVcsWUFBWCxHQUEwQixXQUExQixHQUF3QyxHQUF4QyxHQUE4QyxNQUE5QyxHQUF1RCxHQUF2RCxHQUE2RCxpQkFBN0Q7YUFBdEQs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LEtBQUsscUJBQUwsQ0FBMkIsYUFBM0IsRUFBMEMsWUFBMUMsQ0FBZixDQUEzQixDQUFQLENBSks7Ozs7bUJBN1hQO1lBN0lzRTs7QUFraEI1RSxZQUFNLGNBQWMsV0FBVyxnQkFBWCxDQUE0QjtBQUM1QyxxQkFBUyxPQUFUO0FBQ0EsMkJBQWUsYUFBZjtTQUZnQixDQUFkLENBbGhCc0U7O0FBdWhCNUUsZUFBTztBQUNILDRCQUFnQixjQUFoQjtBQUNBLHlCQUFhLFdBQWI7QUFDQSwwQkFBYyxZQUFkO1NBSEosQ0F2aEI0RTtLQUFoRjtBQThoQkEsZ0JBQVksT0FBWixHQUFzQixDQUFDLE9BQUQsRUFBVSxPQUFWLEVBQW1CLFFBQW5CLEVBQTZCLGFBQTdCLEVBQTRDLFlBQTVDLEVBQTBELElBQTFELEVBQWdFLFFBQWhFLENBQXRCLENBbmlCRztBQW9pQkgsa0JBQWMsT0FBZCxDQUFzQixjQUF0QixFQUFzQyxXQUF0QyxFQXBpQkc7QUFxaUJILFdBQU8sYUFBUCxHQUF1QixhQUF2QixDQXJpQkc7Q0FBTixDQUFEIiwiZmlsZSI6ImNvbW1vbi9wcm9qZWN0TW9kdWxlL3Byb2plY3RNb2R1bGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoKCkgPT4ge1xuICAgIC8vIOmhueebrueuoeeQhnNlcnZpY2VcbiAgICAndXNlIHN0cmljdCc7XG4gICAgbGV0IHByb2plY3RNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgncHJvamVjdE1vZHVsZScsIFtdKTtcblxuICAgIGZ1bmN0aW9uIERvbWVQcm9qZWN0KCRodHRwLCAkdXRpbCwgJHN0YXRlLCAkZG9tZVB1YmxpYywgJGRvbWVNb2RlbCwgJHEsICRtb2RhbCkge1xuICAgICAgICBjb25zdCBQcm9qZWN0U2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMudXJsID0gJ2FwaS9wcm9qZWN0JztcbiAgICAgICAgICAgICRkb21lTW9kZWwuU2VydmljZU1vZGVsLmNhbGwodGhpcywgdGhpcy51cmwpO1xuICAgICAgICAgICAgdGhpcy5nZXRSZWFkTWUgPSAocHJvSWQsIGJyYW5jaCkgPT4gJGh0dHAuZ2V0KHRoaXMudXJsICsgJy9yZWFkbWUvJyArIHByb0lkICsgJy8nICsgYnJhbmNoKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0QnVpbGRMaXN0ID0gKHByb0lkKSA9PiAkaHR0cC5nZXQoJy9hcGkvY2kvYnVpbGQvJyArIHByb0lkKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0QnJhbmNoZXMgPSAocHJvSWQpID0+ICRodHRwLmdldCh0aGlzLnVybCArICcvYnJhbmNoZXMvJyArIHByb0lkKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0QnJhbmNoZXNXaXRob3V0SWQgPSAoY29kZUlkLCBjb2RlTWFuYWdlclVzZXJJZCwgY29kZU1hbmFnZXIpID0+ICRodHRwLmdldCh0aGlzLnVybCArICcvYnJhbmNoZXMvJyArIGNvZGVNYW5hZ2VyICsgJy8nICsgY29kZUlkICsgJy8nICsgY29kZU1hbmFnZXJVc2VySWQpO1xuICAgICAgICAgICAgdGhpcy5nZXRUYWdzID0gKHByb0lkKSA9PiAkaHR0cC5nZXQodGhpcy51cmwgKyAnL3RhZ3MvJyArIHByb0lkKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0VGFnc1dpdGhvdXRJZCA9IChjb2RlSWQsIGNvZGVNYW5hZ2VyVXNlcklkLCBjb2RlTWFuYWdlcikgPT4gJGh0dHAuZ2V0KHRoaXMudXJsICsgJy90YWdzLycgKyBjb2RlTWFuYWdlciArICcvJyArIGNvZGVJZCArICcvJyArIGNvZGVNYW5hZ2VyVXNlcklkKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0R2l0TGFiSW5mbyA9ICgpID0+ICRodHRwLmdldCh0aGlzLnVybCArICcvZ2l0L2dpdGxhYmluZm8nKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0QnVpbGREb2NrZXJmaWxlID0gKHByb0lkLCBidWlsZElkKSA9PiAkaHR0cC5nZXQoJy9hcGkvY2kvYnVpbGQvZG9ja2VyZmlsZS8nICsgcHJvSWQgKyAnLycgKyBidWlsZElkKTtcbiAgICAgICAgICAgIHRoaXMucHJldmlld0RvY2tlcmZpbGUgPSAocHJvamVjdENvbmZpZykgPT4gJGh0dHAucG9zdCgnL2FwaS9jaS9idWlsZC9kb2NrZXJmaWxlJywgYW5ndWxhci50b0pzb24ocHJvamVjdENvbmZpZyksIHtcbiAgICAgICAgICAgICAgICBub3RJbnRlcmNlcHQ6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5idWlsZCA9IChidWlsZEluZm8pID0+ICRodHRwLnBvc3QoJy9hcGkvY2kvYnVpbGQvc3RhcnQnLCBhbmd1bGFyLnRvSnNvbihidWlsZEluZm8pLCB7XG4gICAgICAgICAgICAgICAgbm90SW50ZXJjZXB0OiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcHJvamVjdFNlcnZpY2UgPSBuZXcgUHJvamVjdFNlcnZpY2UoKTtcblxuICAgICAgICBjb25zdCBidWlsZFByb2plY3QgPSAocHJvSWQsIGhhc0NvZGVJbmZvKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBidWlsZE1vZGFsSW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9pbmRleC90cGwvbW9kYWwvYnVpbGRNb2RhbC9idWlsZE1vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdCdWlsZE1vZGFsQ3RyIGFzIHZtJyxcbiAgICAgICAgICAgICAgICBzaXplOiAnbWQnLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdEluZm86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogcHJvSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDb2RlSW5mbzogaGFzQ29kZUluZm9cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkTW9kYWxJbnMucmVzdWx0O1xuICAgICAgICB9O1xuXG4gICAgICAgIGNsYXNzIFByb2plY3RJbWFnZXMge1xuICAgICAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUluZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVJc1B1YmxpYzogMSxcbiAgICAgICAgICAgICAgICAgICAgcnVuSXNQdWJsaWM6IDFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb21waWxlSW1hZ2UgPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkUnVuSW1hZ2UgPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRDb21waWxlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJ1bkxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2plY3RJbWFnZXNJbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICBjb21waWxlUHVibGljSW1hZ2VMaXN0OiBbXSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZVByaXZhdGVJbWFnZUxpc3Q6IFtdLFxuICAgICAgICAgICAgICAgICAgICBydW5QdWJsaWNJbWFnZUxpc3Q6IFtdLFxuICAgICAgICAgICAgICAgICAgICBydW5Qcml2YXRlSW1hZ2VMaXN0OiBbXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0KGltYWdlc0luZm8pIHtcbiAgICAgICAgICAgICAgICBpZiAoIWltYWdlc0luZm8pXG4gICAgICAgICAgICAgICAgICAgIGltYWdlc0luZm8gPSB7fTtcbiAgICAgICAgICAgICAgICBpZiAoIWltYWdlc0luZm8uY29tcGlsZVB1YmxpY0ltYWdlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZXNJbmZvLmNvbXBpbGVQdWJsaWNJbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFpbWFnZXNJbmZvLmNvbXBpbGVQcml2YXRlSW1hZ2VMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlc0luZm8uY29tcGlsZVByaXZhdGVJbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFpbWFnZXNJbmZvLnJ1blB1YmxpY0ltYWdlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZXNJbmZvLnJ1blB1YmxpY0ltYWdlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWltYWdlc0luZm8ucnVuUHJpdmF0ZUltYWdlTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZXNJbmZvLnJ1blByaXZhdGVJbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goaW1hZ2VzSW5mbywgKGltYWdlTGlzdCwgaW1hZ2VMaXN0TmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGltYWdlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VMaXN0W2ldLmNyZWF0ZURhdGUgPSAkdXRpbC5nZXRQYWdlRGF0ZShpbWFnZUxpc3RbaV0uY3JlYXRlVGltZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZUxpc3RbaV0uaW1hZ2VUeHQgPSBpbWFnZUxpc3RbaV0uaW1hZ2VOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlTGlzdFtpXS5pbWFnZVRhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlTGlzdFtpXS5pbWFnZVR4dCArPSAnOicgKyBpbWFnZUxpc3RbaV0uaW1hZ2VUYWc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2plY3RJbWFnZXNJbmZvID0gaW1hZ2VzSW5mbztcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5zZWxlY3RlZENvbXBpbGVJbWFnZSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlSXNQdWJsaWNJbWFnZSgnY29tcGlsZScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUlzUHVibGljSW1hZ2UoJ3J1bicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvZ2dsZUlzUHVibGljSW1hZ2UoaW1hZ2VUeXBlLCBpc1B1YmxpYykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNQdWJsaWMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNQdWJsaWMgPSBpbWFnZVR5cGUgPT0gJ2NvbXBpbGUnID8gdGhpcy5pbWFnZUluZm8uY29tcGlsZUlzUHVibGljIDogdGhpcy5pbWFnZUluZm8ucnVuSXNQdWJsaWM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlVHlwZSA9PSAnY29tcGlsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudENvbXBpbGVMaXN0ID0gaXNQdWJsaWMgPT09IDEgPyB0aGlzLnByb2plY3RJbWFnZXNJbmZvLmNvbXBpbGVQdWJsaWNJbWFnZUxpc3QgOiB0aGlzLnByb2plY3RJbWFnZXNJbmZvLmNvbXBpbGVQcml2YXRlSW1hZ2VMaXN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVJbWFnZSgnY29tcGlsZScsIDApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UnVuTGlzdCA9IGlzUHVibGljID09PSAxID8gdGhpcy5wcm9qZWN0SW1hZ2VzSW5mby5ydW5QdWJsaWNJbWFnZUxpc3QgOiB0aGlzLnByb2plY3RJbWFnZXNJbmZvLnJ1blByaXZhdGVJbWFnZUxpc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUltYWdlKCdydW4nLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBAcGFyYW0gaW1hZ2VUeXBlOiAnY29tcGlsZSjnvJbor5HplZzlg48pLydydW4nKOi/kOihjOmVnOWDjylcbiAgICAgICAgICAgICAgICAvLyBAcGFyYW0gaW5kZXg6IOWIh+aNouWIsGltYWdlVHlwZemVnOWDj+eahGluZGV45LiL5qCHXG4gICAgICAgICAgICB0b2dnbGVJbWFnZShpbWFnZVR5cGUsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZVR5cGUgPT09ICdjb21waWxlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbXBpbGVJbWFnZSA9IHRoaXMuY3VycmVudENvbXBpbGVMaXN0W2luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpbWFnZVR5cGUgPT09ICdydW4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkUnVuSW1hZ2UgPSBhbmd1bGFyLmNvcHkodGhpcy5jdXJyZW50UnVuTGlzdFtpbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOiuvue9rum7mOiupOmAieaLqeeahOmVnOWDj1xuICAgICAgICAgICAgdG9nZ2xlU3BlY2lmaWVkSW1hZ2UodHlwZSwgaW1nT2JqKSB7XG4gICAgICAgICAgICAgICAgbGV0IGltYWdlVHh0ID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKGltZ09iaikge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZVR4dCA9IGltZ09iai5pbWFnZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWdPYmouaW1hZ2VUYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVHh0ICs9ICc6JyArIGltZ09iai5pbWFnZVRhZztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGltZ09iaiA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnY29tcGlsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbXBpbGVJbWFnZSA9IGltZ09iajtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbXBpbGVJbWFnZS5pbWFnZVR4dCA9IGltYWdlVHh0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW1nT2JqLnJlZ2lzdHJ5VHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlSW5mby5jb21waWxlSXNQdWJsaWMgPSBpbWdPYmoucmVnaXN0cnlUeXBlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUluZm8uY29tcGlsZUlzUHVibGljID0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRDb21waWxlTGlzdCA9IGltZ09iai5yZWdpc3RyeVR5cGUgPT09IDEgPyB0aGlzLnByb2plY3RJbWFnZXNJbmZvLmNvbXBpbGVQdWJsaWNJbWFnZUxpc3QgOiB0aGlzLnByb2plY3RJbWFnZXNJbmZvLmNvbXBpbGVQcml2YXRlSW1hZ2VMaXN0O1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFJ1bkltYWdlID0gaW1nT2JqO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkUnVuSW1hZ2UuaW1hZ2VUeHQgPSBpbWFnZVR4dDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltZ09iai5yZWdpc3RyeVR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUluZm8ucnVuSXNQdWJsaWMgPSBpbWdPYmoucmVnaXN0cnlUeXBlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUluZm8ucnVuSXNQdWJsaWMgPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJ1bkxpc3QgPSBpbWdPYmoucmVnaXN0cnlUeXBlID09PSAxID8gdGhpcy5wcm9qZWN0SW1hZ2VzSW5mby5ydW5QdWJsaWNJbWFnZUxpc3QgOiB0aGlzLnByb2plY3RJbWFnZXNJbmZvLnJ1blByaXZhdGVJbWFnZUxpc3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBjbGFzcyBQcm9qZWN0IHtcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKGluaXRJbmZvKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSB7fTtcbiAgICAgICAgICAgICAgICAvLyDmj5Dlj5blhazlhbFjb25maWcs5L+d5oyBdmlld+S4jeWPmFxuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5pc1VzZUN1c3RvbSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdEltYWdlc0lucyA9IG5ldyBQcm9qZWN0SW1hZ2VzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KGluaXRJbmZvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluaXQocHJvamVjdCkge1xuICAgICAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICAgICAgYXV0b0J1aWxkSW5mbztcbiAgICAgICAgICAgICAgICBpZiAoIXByb2plY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdCA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgICAgIGlmICghcHJvamVjdC5kb2NrZXJmaWxlSW5mbykge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmRvY2tlcmZpbGVJbmZvID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghcHJvamVjdC5kb2NrZXJmaWxlQ29uZmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3QuZG9ja2VyZmlsZUNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXByb2plY3QudXNlckRlZmluZURvY2tlcmZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcgPSAhcHJvamVjdC5leGNsdXNpdmVCdWlsZCA/IHByb2plY3QuZG9ja2VyZmlsZUNvbmZpZyA6IHByb2plY3QuZXhjbHVzaXZlQnVpbGQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWIneWni+WMliBhdXRvQnVpbGRJbmZvXG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvQnVpbGRJbmZvID0gYW5ndWxhci5jb3B5KHByb2plY3QuYXV0b0J1aWxkSW5mbyk7XG4gICAgICAgICAgICAgICAgcHJvamVjdC5hdXRvQnVpbGRJbmZvID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGF1dG9CdWlsZEluZm8gPSBwcm9qZWN0LmF1dG9CdWlsZEluZm8sXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvLCBicmFuY2hlcztcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhdXRvQnVpbGRJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZzogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXN0ZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmFuY2hlczogJydcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJhbmNoZXMgPSBwcm9qZWN0LmF1dG9CdWlsZEluZm8uYnJhbmNoZXM7XG4gICAgICAgICAgICAgICAgICAgIG5ld0F1dG9CdWlsZEluZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWc6IGF1dG9CdWlsZEluZm8udGFnIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXN0ZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmNoZXM6ICcnXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmIChicmFuY2hlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBicmFuY2hlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChicmFuY2hlc1tpXSA9PSAnbWFzdGVyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvLm1hc3RlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5jaGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChicmFuY2hlcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvLm90aGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvLmJyYW5jaGVzID0gYnJhbmNoZXMuam9pbignLCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBdXRvQnVpbGRJbmZvO1xuXG4gICAgICAgICAgICAgICAgfSkoKTtcblxuXG4gICAgICAgICAgICAgICAgcHJvamVjdC5jb25mRmlsZXMgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29uZkZpbGVzID0gcHJvamVjdC5jb25mRmlsZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBcnIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb25mRmlsZXMgfHwgY29uZkZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHBsRGlyOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5EaXI6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMoY29uZkZpbGVzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXJyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRwbERpcjoga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbkRpcjogY29uZkZpbGVzW2tleV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5ld0Fyci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRwbERpcjogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5EaXI6ICcnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXJyO1xuICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1VzZUN1c3RvbSA9ICEhdGhpcy5jdXN0b21Db25maWcuY3VzdG9tVHlwZTtcblxuICAgICAgICAgICAgICAgIGlmICghcHJvamVjdC5lbnZDb25mRGVmYXVsdCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmVudkNvbmZEZWZhdWx0ID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByb2plY3QuZW52Q29uZkRlZmF1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5jb21waWxlRW52ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29tcGlsZUVudiA9IHRoaXMuY3VzdG9tQ29uZmlnLmNvbXBpbGVFbnY7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29tcGlsZUVudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52TmFtZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52VmFsdWU6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgY29tcGlsZUVudkFyciA9IGNvbXBpbGVFbnYuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld0FyciA9IGNvbXBpbGVFbnZBcnIubWFwKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2lnRW52ID0gaXRlbS5zcGxpdCgnPScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZOYW1lOiBzaWdFbnZbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52VmFsdWU6IHNpZ0VudlsxXVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld0Fyci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudk5hbWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW52VmFsdWU6ICcnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXJyO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSgpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcuY3JlYXRlZEZpbGVTdG9yYWdlUGF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNyZWF0ZWRGaWxlU3RvcmFnZVBhdGggPSB0aGlzLmN1c3RvbUNvbmZpZy5jcmVhdGVkRmlsZVN0b3JhZ2VQYXRoO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNyZWF0ZWRGaWxlU3RvcmFnZVBhdGggfHwgY3JlYXRlZEZpbGVTdG9yYWdlUGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3QXJyID0gY3JlYXRlZEZpbGVTdG9yYWdlUGF0aC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld0Fyci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXJyO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSgpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSBwcm9qZWN0O1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRvckRyYWZ0ID0ge307XG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNldENvbmZpZygpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5kb2NrZXJmaWxlQ29uZmlnID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5kb2NrZXJmaWxlSW5mbyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZXhjbHVzaXZlQnVpbGQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRvY2tlcmZpbGVJbmZvID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jb25mRmlsZXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmVudkNvbmZEZWZhdWx0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5hdXRvQnVpbGRJbmZvID0gdGhpcy5hdXRvQnVpbGRJbmZvO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdCh0aGlzLmNvbmZpZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVBcnJJdGVtKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWdbaXRlbV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZUNvbXBpbGVFbnYoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5jb21waWxlRW52LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVDcmVhdGVkRmlsZVN0b3JhZ2VQYXRoKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcuY3JlYXRlZEZpbGVTdG9yYWdlUGF0aC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkRW52Q29uZkRlZmF1bHQoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZW52Q29uZkRlZmF1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJycsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b2dnbGVCYXNlSW1hZ2UoaW1hZ2VOYW1lLCBpbWFnZVRhZywgaW1hZ2VSZWdpc3RyeSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tQ29uZmlnLmJhc2VJbWFnZU5hbWUgPSBpbWFnZU5hbWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcuYmFzZUltYWdlVGFnID0gaW1hZ2VUYWc7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21Db25maWcuYmFzZUltYWdlUmVnaXN0cnkgPSBpbWFnZVJlZ2lzdHJ5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkQ3JlYXRlZEZpbGVTdG9yYWdlUGF0aCgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5jcmVhdGVkRmlsZVN0b3JhZ2VQYXRoLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkQ29tcGlsZUVudigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUNvbmZpZy5jb21waWxlRW52LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBlbnZOYW1lOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZW52VmFsdWU6ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGRDb25mRmlsZXMoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29uZkZpbGVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0cGxEaXI6ICcnLFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW5EaXI6ICcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtb2RpZnkoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNyZWF0ZVByb2plY3QgPSB0aGlzLl9mb3JtYXJ0UHJvamVjdCgpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNyZWF0ZVByb2plY3QpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvcHJvamVjdCcsIGFuZ3VsYXIudG9Kc29uKGNyZWF0ZVByb2plY3QpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSgpIHtcbiAgICAgICAgICAgICAgICBsZXQgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgJGRvbWVQdWJsaWMub3BlbkRlbGV0ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0U2VydmljZS5kZWxldGVEYXRhKHRoaXMuY29uZmlnLmlkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5Qcm9tcHQoJ+WIoOmZpOaIkOWKn++8gScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRkb21lUHVibGljLm9wZW5XYXJuaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+WIoOmZpOWksei0pe+8gScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnOiByZXMuZGF0YS5yZXN1bHRNc2dcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoJ2ZhaWwnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdCgnZGlzbWlzcycpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcmVkLnByb21pc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnZXREb2NrZXJmaWxlKCkge1xuXG4gICAgICAgICAgICAgICAgbGV0IG9wZW5Eb2NrZXJmaWxlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9pbmRleC90cGwvbW9kYWwvZG9ja2VyZmlsZU1vZGFsL2RvY2tlcmZpbGVNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEb2NrZXJmaWxlTW9kYWxDdHIgYXMgdm0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcudXNlckRlZmluZURvY2tlcmZpbGUpIHtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VEb2NrZXJmaWxlTW9kYWxJbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9pbmRleC90cGwvbW9kYWwvYnJhbmNoQ2hlY2tNb2RhbC9icmFuY2hDaGVja01vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0JyYW5jaENoZWNrTW9kYWxDdHIgYXMgdm0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogJ21kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlSW5mbzogKCkgPT4gdGhpcy5jb25maWcuY29kZUluZm8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdElkOiAoKSA9PiB0aGlzLmNvbmZpZy5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB1c2VEb2NrZXJmaWxlTW9kYWxJbnMucmVzdWx0LnRoZW4oKGJyYW5jaEluZm8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRvY2tlcmZpbGVJbmZvLmJyYW5jaCA9IHRoaXMuY29uZmlnLmRvY2tlcmZpbGVJbmZvLnRhZyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5kb2NrZXJmaWxlSW5mb1ticmFuY2hJbmZvLnR5cGVdID0gYnJhbmNoSW5mby52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW5Eb2NrZXJmaWxlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9wZW5Eb2NrZXJmaWxlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX2Zvcm1hcnRDcmVhdGVQcm9qZWN0KHByb2plY3RJbmZvLCBjcmVhdG9yRHJhZnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0SW5mbyxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRvckRyYWZ0OiBjcmVhdG9yRHJhZnRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX2Zvcm1hcnRQcm9qZWN0KCkge1xuICAgICAgICAgICAgICAgIGxldCBmb3JtYXJ0UHJvamVjdCA9IHt9LFxuICAgICAgICAgICAgICAgICAgICBjb21waWxlRW52U3RyID0gJycsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRGaWxlU3RvcmFnZVBhdGhBcnIgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdCA9IGFuZ3VsYXIuY29weSh0aGlzLmNvbmZpZyksXG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbUNvbmZpZyA9IGFuZ3VsYXIuY29weSh0aGlzLmN1c3RvbUNvbmZpZyk7XG5cbiAgICAgICAgICAgICAgICBwcm9qZWN0LmVudkNvbmZEZWZhdWx0ID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld0FyciA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzaWdFbnZDb25mRGVmYXVsdCBvZiBwcm9qZWN0LmVudkNvbmZEZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2lnRW52Q29uZkRlZmF1bHQua2V5ICYmIHNpZ0VudkNvbmZEZWZhdWx0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXJyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHNpZ0VudkNvbmZEZWZhdWx0LmtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHNpZ0VudkNvbmZEZWZhdWx0LnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogc2lnRW52Q29uZkRlZmF1bHQuZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXJyO1xuICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICBwcm9qZWN0LmF1dG9CdWlsZEluZm8gPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYXV0b0J1aWxkSW5mbyA9IHByb2plY3QuYXV0b0J1aWxkSW5mbyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0F1dG9CdWlsZEluZm87XG4gICAgICAgICAgICAgICAgICAgIGlmICghcHJvamVjdC5jb2RlSW5mbyB8fCAhYXV0b0J1aWxkSW5mby5vdGhlciAmJiAhYXV0b0J1aWxkSW5mby5tYXN0ZXIgJiYgIWF1dG9CdWlsZEluZm8udGFnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBuZXdBdXRvQnVpbGRJbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFnOiBhdXRvQnVpbGRJbmZvLnRhZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5jaGVzOiBbXVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXV0b0J1aWxkSW5mby5vdGhlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXV0b0J1aWxkSW5mby5icmFuY2hlcyA9IGF1dG9CdWlsZEluZm8uYnJhbmNoZXMuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYXV0b0J1aWxkSW5mby5tYXN0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0F1dG9CdWlsZEluZm8uYnJhbmNoZXMucHVzaCgnbWFzdGVyJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld0F1dG9CdWlsZEluZm87XG4gICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgIGlmIChwcm9qZWN0LnVzZXJEZWZpbmVEb2NrZXJmaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hcnRQcm9qZWN0Lm5hbWUgPSBwcm9qZWN0Lm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hcnRQcm9qZWN0LmlkID0gcHJvamVjdC5pZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb2plY3QuY29kZUluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hcnRQcm9qZWN0LmNvZGVJbmZvID0gcHJvamVjdC5jb2RlSW5mbztcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hcnRQcm9qZWN0LmF1dG9CdWlsZEluZm8gPSBwcm9qZWN0LmF1dG9CdWlsZEluZm87XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuZXhjbHVzaXZlQnVpbGQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBmb3JtYXJ0UHJvamVjdC51c2VyRGVmaW5lRG9ja2VyZmlsZSA9IHByb2plY3QudXNlckRlZmluZURvY2tlcmZpbGU7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hcnRQcm9qZWN0LmRvY2tlcmZpbGVJbmZvID0gcHJvamVjdC5kb2NrZXJmaWxlSW5mbztcbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QuYXV0aG9yaXR5ID0gcHJvamVjdC5hdXRob3JpdHk7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hcnRQcm9qZWN0LmVudkNvbmZEZWZhdWx0ID0gcHJvamVjdC5lbnZDb25mRGVmYXVsdDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvamVjdC5kb2NrZXJmaWxlSW5mbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5kb2NrZXJmaWxlSW5mbyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5jb25mRmlsZXMgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld0NvbmZGaWxlcyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY29uZkZpbGUgb2YgcHJvamVjdC5jb25mRmlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZkZpbGUudHBsRGlyICYmIGNvbmZGaWxlLm9yaWdpbkRpcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDb25mRmlsZXNbY29uZkZpbGUudHBsRGlyXSA9IGNvbmZGaWxlLm9yaWdpbkRpcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3Q29uZkZpbGVzO1xuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVFbnZTdHIgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0ciA9ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ckFyciA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgZW52IG9mIGN1c3RvbUNvbmZpZy5jb21waWxlRW52KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVudi5lbnZOYW1lICYmIGVudi5lbnZWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJBcnIucHVzaChlbnYuZW52TmFtZSArICc9JyArIGVudi5lbnZWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0ckFyci5qb2luKCcsJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEZpbGVTdG9yYWdlUGF0aEFyciA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3QXJyID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpdGVtIG9mIGN1c3RvbUNvbmZpZy5jcmVhdGVkRmlsZVN0b3JhZ2VQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBcnIucHVzaChpdGVtLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdBcnI7XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG5cblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1VzZUN1c3RvbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5kb2NrZXJmaWxlQ29uZmlnID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZXhjbHVzaXZlQnVpbGQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VzdG9tVHlwZTogY3VzdG9tQ29uZmlnLmN1c3RvbVR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUltYWdlOiB0aGlzLnByb2plY3RJbWFnZXNJbnMuc2VsZWN0ZWRDb21waWxlSW1hZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVuSW1hZ2U6IHRoaXMucHJvamVjdEltYWdlc0lucy5zZWxlY3RlZFJ1bkltYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVTdG9yYWdlUGF0aDogY3VzdG9tQ29uZmlnLmNvZGVTdG9yYWdlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlRW52OiBjb21waWxlRW52U3RyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVDbWQ6IGN1c3RvbUNvbmZpZy5jb21waWxlQ21kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRGaWxlU3RvcmFnZVBhdGg6IGNyZWF0ZWRGaWxlU3RvcmFnZVBhdGhBcnIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya0RpcjogY3VzdG9tQ29uZmlnLndvcmtEaXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogY3VzdG9tQ29uZmlnLnVzZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVuRmlsZVN0b3JhZ2VQYXRoOiB0aGlzLnByb2plY3RJbWFnZXNJbnMuc2VsZWN0ZWRSdW5JbWFnZS5ydW5GaWxlU3RvcmFnZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDbWQ6IHRoaXMucHJvamVjdEltYWdlc0lucy5zZWxlY3RlZFJ1bkltYWdlLnN0YXJ0Q29tbWFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOacquWIneWni+WMlnRoaXMucHJvamVjdEltYWdlc0lucy5zZWxlY3RlZENvbXBpbGVJbWFnZeaXtlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnByb2plY3RJbWFnZXNJbnMuc2VsZWN0ZWRDb21waWxlSW1hZ2UuaW1hZ2VOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5leGNsdXNpdmVCdWlsZC5jb21waWxlSW1hZ2UgPSB0aGlzLmN1c3RvbUNvbmZpZy5jb21waWxlSW1hZ2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5leGNsdXNpdmVCdWlsZC5ydW5JbWFnZSA9IHRoaXMuY3VzdG9tQ29uZmlnLnJ1bkltYWdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZXhjbHVzaXZlQnVpbGQucnVuRmlsZVN0b3JhZ2VQYXRoID0gdGhpcy5jdXN0b21Db25maWcucnVuRmlsZVN0b3JhZ2VQYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZXhjbHVzaXZlQnVpbGQuc3RhcnRDbWQgPSB0aGlzLmN1c3RvbUNvbmZpZy5zdGFydENtZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuZXhjbHVzaXZlQnVpbGQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5kb2NrZXJmaWxlQ29uZmlnID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VJbWFnZU5hbWU6IGN1c3RvbUNvbmZpZy5iYXNlSW1hZ2VOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VJbWFnZVRhZzogY3VzdG9tQ29uZmlnLmJhc2VJbWFnZVRhZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlSW1hZ2VSZWdpc3RyeTogY3VzdG9tQ29uZmlnLmJhc2VJbWFnZVJlZ2lzdHJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbGxDbWQ6IGN1c3RvbUNvbmZpZy5pbnN0YWxsQ21kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVTdG9yYWdlUGF0aDogY3VzdG9tQ29uZmlnLmNvZGVTdG9yYWdlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlRW52OiBjb21waWxlRW52U3RyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVDbWQ6IGN1c3RvbUNvbmZpZy5jb21waWxlQ21kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtEaXI6IGN1c3RvbUNvbmZpZy53b3JrRGlyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0Q21kOiBjdXN0b21Db25maWcuc3RhcnRDbWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogY3VzdG9tQ29uZmlnLnVzZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9ybWFydFByb2plY3QgPSBwcm9qZWN0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZm9ybWFydFByb2plY3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjcmVhdGUoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNyZWF0ZVByb2plY3QgPSB0aGlzLl9mb3JtYXJ0UHJvamVjdCgpLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdG9yRHJhZnQgPSBhbmd1bGFyLmNvcHkodGhpcy5jcmVhdG9yRHJhZnQpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNyZWF0ZVByb2plY3QpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3Byb2plY3QnLCBhbmd1bGFyLnRvSnNvbih0aGlzLl9mb3JtYXJ0Q3JlYXRlUHJvamVjdChjcmVhdGVQcm9qZWN0LCBjcmVhdG9yRHJhZnQpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBnZXRJbnN0YW5jZSA9ICRkb21lTW9kZWwuaW5zdGFuY2VzQ3JlYXRvcih7XG4gICAgICAgICAgICBQcm9qZWN0OiBQcm9qZWN0LFxuICAgICAgICAgICAgUHJvamVjdEltYWdlczogUHJvamVjdEltYWdlc1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcHJvamVjdFNlcnZpY2U6IHByb2plY3RTZXJ2aWNlLFxuICAgICAgICAgICAgZ2V0SW5zdGFuY2U6IGdldEluc3RhbmNlLFxuICAgICAgICAgICAgYnVpbGRQcm9qZWN0OiBidWlsZFByb2plY3RcbiAgICAgICAgfTtcblxuICAgIH1cbiAgICBEb21lUHJvamVjdC4kaW5qZWN0ID0gWyckaHR0cCcsICckdXRpbCcsICckc3RhdGUnLCAnJGRvbWVQdWJsaWMnLCAnJGRvbWVNb2RlbCcsICckcScsICckbW9kYWwnXTtcbiAgICBwcm9qZWN0TW9kdWxlLmZhY3RvcnkoJyRkb21lUHJvamVjdCcsIERvbWVQcm9qZWN0KTtcbiAgICB3aW5kb3cucHJvamVjdE1vZHVsZSA9IHByb2plY3RNb2R1bGU7XG59KSgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
