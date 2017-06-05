/*
 * @author  ChandraLee
 * @description  项目模块
 */

((window, undefined) => {
    // 项目管理service
    'use strict';
    let projectModule = angular.module('projectModule', []);

    function DomeProject($http, $util, $state, dialog, $domeModel, $q, $modal, $domeImage) {
        const ProjectService = function () {
            this.url = 'api/project';
            $domeModel.ServiceModel.call(this, this.url);
            this.getProjectCollectionNameById = (projectCollectionId) => $http.get(`/api/projectcollection/${projectCollectionId}/name`);
            this.getProject = (projectCollectionId) => $http.get(`/api/projectcollection/${projectCollectionId}/project`);
            this.getReadMe = (proId, branch) => $http.get(`${this.url}/readme/${proId}/${branch}`);
            this.getBuildList = proId => $http.get(`/api/ci/build/${proId}`);
            this.getBranches = proId => $http.get(`${this.url}/branches/${proId}`);
            this.getBranchesWithoutId = (codeId, codeManagerUserId, codeManager) => $http.get(`${this.url}/branches/${codeManager}/${codeId}/${codeManagerUserId}`);
            this.getTags = proId => $http.get(`${this.url}/tags/${proId}`);
            this.getTagsWithoutId = (codeId, codeManagerUserId, codeManager) => $http.get(`${this.url}/tags/${codeManager}/${codeId}/${codeManagerUserId}`);
            this.getGitLabInfo = () => $http.get(`${this.url}/git/gitlabinfo`);
            this.getGitLabInfo = (gitLabId) => $http.get(`${this.url}/git/gitlabinfo/${gitLabId}`);
            this.getBuildDockerfile = (proId, buildId) => $http.get(`/api/ci/build/dockerfile/${proId}/${buildId}`);
            this.previewDockerfile = (projectConfig) => $http.post('/api/ci/build/dockerfile', angular.toJson(projectConfig), {
                notIntercept: true
            });
            this.build = (buildInfo) => $http.post('/api/ci/build/start', angular.toJson(buildInfo), {
                notIntercept: true
            });
            this.stopBulid = (buildId) => $http.get(`/api/ci/build/stop/${buildId}`);
            this.modifyCreator = (projectId,creatorInfo) => $http.post(`${this.url}/creator/${projectId}`, angular.toJson(creatorInfo)); 
            this.modifyCodeInfo = (projectId, CodeConfiguration) => $http.put(`${this.url}/${projectId}/git/gitlabinfo`, angular.toJson(CodeConfiguration));
            this.buildInfoList = (projectId, page, count) => $http.get(`/api/ci/buildInfo/${projectId}/page?page=${page}&count=${count}`);
        };
        const projectService = new ProjectService();

        const buildProject = (proId, hasCodeInfo) => {
            const buildModalIns = $modal.open({
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

        class ProjectImages {
            constructor() {
                this.imageInfo = {
                    compileIsPublic: 1,
                    runIsPublic: 1
                };
                this.selectedCompileImage = {};
                this.selectedRunImage = {};
                this.currentCompileList = [];
                // 私有仓库所有镜像
                this.privateRegistryImageList = []
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
            init(imagesInfo) {
                //this.getForBuildImageAsPrivateImageList('all');
                if (!imagesInfo)
                    imagesInfo = {};
                if (!$util.isArray(imagesInfo.compilePublicImageList)) {
                    imagesInfo.compilePublicImageList = [];
                }
                if (!$util.isArray(imagesInfo.compilePrivateImageList)) {
                    imagesInfo.compilePrivateImageList = [];
                }else {
                    imagesInfo.compilePrivateImageList = this.privateRegistryImageList;
                }
                if (!$util.isArray(imagesInfo.runPublicImageList)) {
                    imagesInfo.runPublicImageList = [];
                }
                if (!$util.isArray(imagesInfo.runPrivateImageList)) {
                    imagesInfo.runPrivateImageList = [];
                }else {
                    imagesInfo.runPrivateImageList = this.privateRegistryImageList;
                }

                angular.forEach(imagesInfo, (imageList, imageListName) => {
                    for (let image of imageList) {
                        image.createDate = $util.getPageDate(image.createTime);
                        image.imageTxt = image.imageName;
                        if (image.imageTag) {
                            image.imageTxt += ':' + image.imageTag;
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
            getForBuildImageAsPrivateImageList(imageType){
                $domeImage.imageService.getForBuildImages().then((res) => {
                    let imageList = res.data.result || [];
                    let newImageList = [];
                    for (let i=0; i < imageList.length; i++) {
                        let image = imageList[i];
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
                    if(imageType === 'compile') {
                        this.projectImagesInfo.compilePrivateImageList = newImageList;                       
                    }else if (imageType === 'run') {
                        this.projectImagesInfo.runPrivateImageList = newImageList;
                    }else if(imageType === 'all'){
                        this.privateRegistryImageList = newImageList;
                    }

                }).finally(() => {
                });
            }
            getPrivateImageTag(imageType,image) {
                $domeImage.imageService.getImageTags(image.imageName, image.registryUrl).then((res) => {
                    let tags = res.data.result;
                    if(imageType === 'compile') {
                        this.currentCompilePrivateImageTagList = tags;                      
                    }else if (imageType === 'run') {
                        this.currentRunPrivateImageTagList = tags;
                    }
                    
                }).finally(() => {

                });
            }
            toggleIsPublicImage(imageType, isPublic) {
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
            togglePrivateImageTag(imageType, index, tag) {
                if (imageType === 'compile') {
                    this.selectedCompilePrivateImageTag = this.currentCompilePrivateImageTagList[index];
                    for(let l=0; l< this.currentCompileList.length; l++) {
                        if(this.currentCompileList[l].imageName === tag.imageName) {
                            this.currentCompileList[l].imageTag = this.selectedCompilePrivateImageTag.tag;
                            break;
                        }
                    }
                } else if (imageType === 'run') {
                    this.selectedRunPrivateImageTag = this.currentRunPrivateImageTagList[index];
                    for(let l=0; l< this.currentRunList.length; l++) {
                        if(this.currentRunList[l].imageName === tag.imageName) {
                            this.currentRunList[l].imageTag = this.selectedRunPrivateImageTag.tag;
                            break;
                        }
                    }
                }
            }
                // @param imageType: 'compile(编译镜像)/'run'(运行镜像)
                // @param index: 切换到imageType镜像的index下标
            toggleImage(imageType, index, image) {
                    if (imageType === 'compile') {
                        if (this.imageInfo.compileIsPublic === 0 || typeof image === 'undefined') {
                            //this.selectedCompileImage = this.currentCompileList[index];
                            this.selectedCompilePrivateImageTag = {};
                            if(typeof image === 'undefined') {
                                image = this.currentCompileList[0]; //切换radio时image为undefined
                            }
                            for(let indexImage = 0; indexImage < this.currentCompileList.length; indexImage ++) {
                                let selectedImageTmp = this.currentCompileList[indexImage];
                                if (selectedImageTmp.imageTxt == image.imageTxt) {
                                    this.selectedCompileImage = selectedImageTmp;
                                    break;
                                }
                            }
                            this.getPrivateImageTag('compile',image);
                        }else {
                            if (typeof image !== 'undefined') {
                                for(let indexImage = 0; indexImage < this.currentCompileList.length; indexImage ++) {
                                    let selectedImageTmp = this.currentCompileList[indexImage];
                                    if (selectedImageTmp.imageTxt == image.imageTxt) {
                                        this.selectedCompileImage = selectedImageTmp;
                                        break;
                                    }
                                }
                            }else {
                                this.selectedCompileImage = this.currentCompileList[index];
                            }
                        }
                    } else if (imageType === 'run') {
                        if (this.imageInfo.runIsPublic === 0 || typeof image === 'undefined') {
                            //this.selectedRunImage = this.currentRunList[index];
                            this.selectedRunPrivateImageTag = {};
                            if(typeof image === 'undefined') {
                                image = this.currentRunList[0]; //切换radio时image为undefined
                            }
                            for(let ind = 0; ind < this.currentRunList.length; ind ++) {
                                let selectedRunImageTmp = this.currentRunList[ind];
                                if (selectedRunImageTmp.imageTxt == image.imageTxt) {
                                    this.selectedRunImage = selectedRunImageTmp;
                                    break;
                                }
                            }
                            this.getPrivateImageTag('run',image);
                        }else {
                            if (typeof image !== 'undefined') {
                                for(let ind = 0; ind < this.currentRunList.length; ind ++) {
                                    let selectedRunImageTmp = this.currentRunList[ind];
                                    if (selectedRunImageTmp.imageTxt == image.imageTxt) {
                                        this.selectedRunImage = selectedRunImageTmp;
                                        break;
                                    }
                                }
                            }else {
                                this.selectedRunImage = angular.copy(this.currentRunList[index]);
                            }
                        }
                    }
                }
                // 设置默认选择的镜像
            toggleSpecifiedImage(type, imgObj) {
                let imageTxt = '';
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
                    this.currentCompileList = this.imageInfo.compileIsPublic === 1 ? this.projectImagesInfo.compilePublicImageList : this.projectImagesInfo.compilePrivateImageList;

                } else {
                    this.selectedRunImage = imgObj;
                    this.selectedRunImage.imageTxt = imageTxt;
                    this.selectedRunPrivateImageTag.tag = imgObj.imageTag;
                    this.imageInfo.runIsPublic = imgObj.registryType !== void 0 ? imgObj.registryType : 1;
                    this.currentRunList = this.imageInfo.compileIsPublic === 1 ? this.projectImagesInfo.runPublicImageList : this.projectImagesInfo.runPrivateImageList;
                }
            }

        }

        class Project {
            constructor(initInfo) {
                this.config = {};
                // 提取公共config,保持view不变
                this.customConfig = {};
                this.isUseCustom = false;
                this.isDefDockerfile = false;
                this.projectImagesIns = new ProjectImages();
                this.init(initInfo);
            }
            init(project) {
                let i = 0,
                    autoBuildInfo;
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
                project.autoBuildInfo = (() => {
                    let autoBuildInfo = project.autoBuildInfo,
                        newAutoBuildInfo, branches;
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
                        for (let i = 0; i < branches.length; i++) {
                            if (branches[i] == 'master') {
                                newAutoBuildInfo.master = true;
                                branches.splice(i, 1);
                                i--;
                            }
                        }
                        if (branches.length !== 0) {
                            newAutoBuildInfo.other = true;
                            newAutoBuildInfo.branches = branches.join(',');
                        }
                    }
                    return newAutoBuildInfo;

                })();


                project.confFiles = (() => {
                    let confFiles = project.confFiles,
                        newArr = [];
                    if (!$util.isObject(confFiles)) {
                        return [{
                            tplDir: '',
                            originDir: ''
                        }];
                    }
                    for (let key of Object.keys(confFiles)) {
                        newArr.push({
                            tplDir: key,
                            originDir: confFiles[key]
                        });
                    }
                    newArr.push({
                        tplDir: '',
                        originDir: ''
                    });
                    return newArr;
                })();

                if (!$util.isArray(project.envConfDefault)) {
                    project.envConfDefault = [];
                }
                project.envConfDefault.push({
                    key: '',
                    value: '',
                    description: ''
                });

                this.customConfig.compileEnv = function () {
                    let compileEnv = this.customConfig.compileEnv;
                    if (!compileEnv) {
                        return [{
                            envName: '',
                            envValue: ''
                        }];
                    }
                    if (typeof compileEnv !== 'string') {
                        return angular.copy(compileEnv);
                    }
                    let compileEnvArr = compileEnv.split(',');
                    let newArr = compileEnvArr.map((item) => {
                        let sigEnv = item.split('=');
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

                this.customConfig.uploadFileInfos = ((uploadFileInfos) => {
                    if (!uploadFileInfos) uploadFileInfos = [];
                    if (!uploadFileInfos.length) uploadFileInfos.push({ filename: '', content: '' });
                    return uploadFileInfos;
                })(this.customConfig.uploadFileInfos);

                this.customConfig.createdFileStoragePath = function () {
                    let createdFileStoragePath = this.customConfig.createdFileStoragePath;
                    if (!$util.isArray(createdFileStoragePath) || createdFileStoragePath.length === 0) {
                        return [{
                            name: ''
                        }];
                    }
                    let newArr = createdFileStoragePath.map((item) => {
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
            resetConfig() {
                this.config.dockerfileConfig = null;
                this.config.dockerfileInfo = null;
                this.config.exclusiveBuild = null;
                this.config.confFiles = null;
                this.config.envConfDefault = null;
                this.config.autoBuildInfo = this.autoBuildInfo;
                this.init(this.config);
            }
            deleteArrItem(item, index) {
                this.config[item].splice(index, 1);
            }
            deleteCompileEnv(index) {
                this.customConfig.compileEnv.splice(index, 1);
            }
            deleteCreatedFileStoragePath(index) {
                this.customConfig.createdFileStoragePath.splice(index, 1);
            }
            addEnvConfDefault() {
                this.config.envConfDefault.push({
                    key: '',
                    value: '',
                    description: ''
                });
            }
            addUploadFileInfo() {
                this.customConfig.uploadFileInfos.push({
                    filename: '',
                    content: ''
                });
            }
            delUploadFileInfo(index) {
                this.customConfig.uploadFileInfos.splice(index, 1);
            }
            toggleBaseImage(imageName, imageTag, imageRegistry) {
                this.customConfig.baseImageName = imageName;
                this.customConfig.baseImageTag = imageTag;
                this.customConfig.baseImageRegistry = imageRegistry;
            }
            addCreatedFileStoragePath() {
                this.customConfig.createdFileStoragePath.push({
                    name: ''
                });
            }
            addCompileEnv() {
                this.customConfig.compileEnv.push({
                    envName: '',
                    envValue: ''
                });
            }
            addConfFiles() {
                this.config.confFiles.push({
                    tplDir: '',
                    originDir: ''
                });
            }
            modify() {
                return $http.put('/api/project', angular.toJson(this._formartProject()));
            }
            delete() {
                let defered = $q.defer();
                dialog.danger('确认删除', '确认要删除吗？').then(button => { if (button !== dialog.button.BUTTON_OK) throw '' }).then(() => {
                    
                    projectService.deleteData(this.config.id).then(() => {
                        dialog.alert('提示', '删除成功！');
                        defered.resolve();
                    }, (res) => {
                        dalog.error('删除失败！', res.data.resultMsg);
                        defered.reject('fail');
                    });
                }, () => {
                    defered.reject('dismiss');
                });
                return defered.promise;
            }
            getDockerfile() {

                let openDockerfile = () => {
                    $modal.open({
                        animation: true,
                        templateUrl: '/index/tpl/modal/dockerfileModal/dockerfileModal.html',
                        controller: 'DockerfileModalCtr as vm',
                        size: 'md',
                        resolve: {
                            project: this
                        }
                    });
                };

                if (this.config.userDefineDockerfile) {

                    const useDockerfileModalIns = $modal.open({
                        templateUrl: '/index/tpl/modal/branchCheckModal/branchCheckModal.html',
                        controller: 'BranchCheckModalCtr as vm',
                        size: 'md',
                        resolve: {
                            codeInfo: () => this.config.codeInfo,
                            projectId: () => this.config.id
                        }
                    });

                    useDockerfileModalIns.result.then((branchInfo) => {
                        this.config.dockerfileInfo.branch = this.config.dockerfileInfo.tag = null;
                        this.config.dockerfileInfo[branchInfo.type] = branchInfo.value;
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
            _formartProject() {
                let formartProject = {},
                    compileEnvStr = '',
                    createdFileStoragePathArr = [],
                    project = angular.copy(this.config),
                    customConfig = angular.copy(this.customConfig);

                project.envConfDefault = (() => {
                    let newArr = [];
                    for (let sigEnvConfDefault of project.envConfDefault) {
                        if (sigEnvConfDefault.key && sigEnvConfDefault.value) {
                            newArr.push({
                                key: sigEnvConfDefault.key,
                                value: sigEnvConfDefault.value,
                                description: sigEnvConfDefault.description
                            });
                        }
                    }
                    return newArr;
                })();

                project.autoBuildInfo = (() => {
                    let autoBuildInfo = project.autoBuildInfo,
                        newAutoBuildInfo;
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
                })();

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
                    project.confFiles = (() => {
                        let newConfFiles = {};
                        for (let confFile of project.confFiles) {
                            if (confFile.tplDir && confFile.originDir) {
                                newConfFiles[confFile.tplDir] = confFile.originDir;
                            }
                        }
                        return newConfFiles;
                    })();

                    compileEnvStr = (() => {
                        let str = '',
                            strArr = [];
                        for (let env of customConfig.compileEnv) {
                            if (env.envName && env.envValue) {
                                strArr.push(env.envName + '=' + env.envValue);
                            }
                        }
                        return strArr.join(',');
                    })();

                    createdFileStoragePathArr = (() => {
                        let newArr = [];
                        for (let item of customConfig.createdFileStoragePath) {
                            if (item.name) {
                                newArr.push(item.name);
                            }
                        }
                        return newArr;
                    })();


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
                            uploadFileInfos: customConfig.uploadFileInfos.filter((x) => x.filename || x.content)
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
            create(projectCollectionId) {
                let createProject = this._formartProject();
                    // creatorDraft = angular.copy(this.creatorDraft);
                // console.log(createProject);
                // return $http.post('/api/projectcollection/' + projectCollectionId+ '/project', angular.toJson(this._formartCreateProject(createProject)));
                return $http.post('/api/projectcollection/' + projectCollectionId+ '/project', angular.toJson(createProject));
            }
        }

        const getInstance = $domeModel.instancesCreator({
            Project: Project,
            ProjectImages: ProjectImages
        });

        return {
            projectService: projectService,
            getInstance: getInstance,
            buildProject: buildProject
        };

    }
    DomeProject.$inject = ['$http', '$util', '$state', 'dialog', '$domeModel', '$q', '$modal', '$domeImage'];
    projectModule.factory('$domeProject', DomeProject);
    window.projectModule = projectModule;
})(window);
