var projectModule = angular.module('projectModule', []);
// 项目管理service
projectModule.factory('$domeProject', ['$http', '$util', '$state', '$domePublic', '$q', '$modal', function($http, $util, $state, $domePublic, $q, $modal) {
	'use strict';
	var getProjectList = function() {
		return $http.get('/api/project');
	};
	var getProjectInfo = function(proId) {
		return $http.get('/api/project/' + proId);
	};
	var getReadMe = function(proId, branch) {
		return $http.get('/api/project/readme/' + proId + '/' + branch);
	};
	var getBuildList = function(proId) {
		return $http.get('/api/ci/build/' + proId);
	};
	var toBuild = function(buildInfo) {
		return $http.post('/api/ci/build/start', angular.toJson(buildInfo), {
			notIntercept: true
		});
	};
	var getFinishBuildLog = function(proId, buildId) {
		return $http.get('/api/ci/build/download/' + proId + '/' + buildId);
	};
	var getBranchList = function(proId) {
		return $http.get('/api/project/branches/' + proId);
	};
	var getGitLabInfo = function() {
		return $http.get('/api/project/git/gitlabinfo');
	};
	var getBuildDockerfile = function(proId, buildId) {
		return $http.get('/api/ci/build/dockerfile/' + proId + '/' + buildId);
	};
	var _formartProject = function(useDockerfile, project) {
		var formartProject = {};
		var i = 0,
			confFiles = {},
			envConfDefault = [],
			branches = [],
			compileEnvStrArr = [],
			uploadFile = {},
			sigEnvConfDefault, autoBuildInfo;
		project = angular.copy(project);
		for (i = 0; i < project.envConfDefault.length; i++) {
			sigEnvConfDefault = project.envConfDefault[i];
			if (sigEnvConfDefault.key && sigEnvConfDefault.value && sigEnvConfDefault.key !== '' && sigEnvConfDefault.value !== '') {
				envConfDefault.push({
					key: sigEnvConfDefault.key,
					value: sigEnvConfDefault.value,
					description: sigEnvConfDefault.description
				});
			}
		}
		project.envConfDefault = envConfDefault;
		if (project.codeInfo) {
			autoBuildInfo = {
				tag: project.autoBuildInfo.tag,
				branches: []
			};
			if (project.autoBuildInfo.other) {
				autoBuildInfo.branches = project.autoBuildInfo.branches.split(',');
			}
			if (project.autoBuildInfo.master) {
				autoBuildInfo.branches.push('master');
			}
			project.autoBuildInfo = autoBuildInfo;
		} else {
			project.autoBuildInfo = null;
		}
		if (!project.type) {
			project.type = 'USER';
		}
		if (useDockerfile) {
			formartProject.projectName = project.projectName;
			formartProject.id = project.id;
			formartProject.type = project.type;
			if (project.codeInfo) {
				formartProject.codeInfo = project.codeInfo;
				formartProject.autoBuildInfo = project.autoBuildInfo;
			}
			formartProject.dockerfileInfo = project.dockerfileInfo;
			formartProject.authority = project.authority;
			formartProject.envConfDefault = project.envConfDefault;
		} else {
			if (project.dockerfileInfo) {
				project.dockerfileInfo = null;
			}
			for (i = 0; i < project.confFiles.length; i++) {
				var confFile = project.confFiles[i];
				if (confFile.tplDir && confFile.originDir && confFile.tplDir !== '' && confFile.originDir !== '') {
					confFiles[confFile.tplDir] = confFile.originDir;
				}
			}
			project.confFiles = confFiles;

			for (i = 0; i < project.dockerfileConfig.compileEnv.length; i++) {
				var temp = project.dockerfileConfig.compileEnv[i];
				if (temp.envName !== '' && temp.envValue !== '') {
					compileEnvStrArr.push(temp.envName + '=' + temp.envValue);
				}
			}
			project.dockerfileConfig.compileEnv = compileEnvStrArr.join(',');

			if (project.uploadFile && project.uploadFile.length !== 0) {
				for (i = 0; i < project.uploadFile.length; i++) {
					uploadFile[project.uploadFile[i].location] = project.uploadFile[i].md5;
				}
			}
			project.uploadFile = uploadFile;
			formartProject = project;
		}
		return formartProject;
	};
	var buildProject = function(proId, hasCodeInfo) {
		var buildModalIns = $modal.open({
			animation: true,
			templateUrl: '/index/tpl/modal/buildModal/buildModal.html',
			controller: 'buildModalCtr',
			size: 'md',
			resolve: {
				projectInfo: function() {
					return {
						projectId: proId,
						hasCodeInfo: hasCodeInfo
					};
				}
			}
		});
		return buildModalIns.result;
	};
	var Project = function() {};
	Project.prototype = {
		constructor: Project,
		init: function(project) {
			var i = 0,
				confFiles, compileEnvs = [],
				uploadFile = [],
				compileEnvArr, autoBuildInfo;
			if (!project) {
				project = {};
			}
			if (project.dockerfileInfo && project.dockerfileInfo.dockerfilePath) {
				this.useDockerfile = true;
			} else {
				this.useDockerfile = false;
			}

			// 初始化 autoBuildInfo
			if (!project.autoBuildInfo) {
				project.autoBuildInfo = {
					tag: 0,
					master: false,
					other: false,
					branches: ''
				};
			} else {
				autoBuildInfo = {
					tag: project.autoBuildInfo.tag || 0,
					master: false,
					other: false,
					branches: ''
				};
				if (project.autoBuildInfo.branches) {
					for (i = 0; i < project.autoBuildInfo.branches.length; i++) {
						if (project.autoBuildInfo.branches[i] === 'master') {
							autoBuildInfo.master = true;
						} else {
							autoBuildInfo.branches += project.autoBuildInfo.branches[i] + ',';
						}
					}
					if (autoBuildInfo.branches !== '') {
						autoBuildInfo.other = true;
					}
				}
				project.autoBuildInfo = autoBuildInfo;
			}

			// 初始化 confFiles
			if ($util.isNullorEmpty(project.confFiles)) {
				project.confFiles = [{
					tplDir: '',
					originDir: ''
				}];
			} else {
				confFiles = [];
				for (var item in project.confFiles) {
					confFiles.push({
						tplDir: item,
						originDir: project.confFiles[item]
					});
				}
				project.confFiles = confFiles;
			}
			if (!project.dockerfileConfig) {
				project.dockerfileConfig = {};
			}
			if (!project.envConfDefault || project.envConfDefault.length === 0) {
				project.envConfDefault = [{
					key: '',
					value: '',
					description: ''
				}];
			}
			if (!project.dockerfileInfo) {
				project.dockerfileInfo = {};
			}
			if (project.dockerfileConfig.compileEnv && project.dockerfileConfig.compileEnv === '') {
				compileEnvArr = project.dockerfileConfig.compileEnv.split(',');
				for (i = 0; i < compileEnvArr.length; i++) {
					var sigEnv = compileEnvArr[i].split('=');
					compileEnvs.push({
						envName: sigEnv[0],
						envValue: sigEnv[1]
					});
				}
			} else {
				compileEnvs.push({
					envName: '',
					envValue: ''
				});
			}
			project.dockerfileConfig.compileEnv = compileEnvs;

			if (project.uploadFile) {
				for (var file in project.uploadFile) {
					uploadFile.push({
						md5: project.uploadFile[file],
						location: file
					});
				}
				if (uploadFile.length !== 0) {
					project.uploadFile = uploadFile;
				}
			} else {
				project.uploadFile = [];
			}
			this.config = project;
		},
		deleteArrItem: function(item, index) {
			this.config[item].splice(index, 1);
		},
		deleteCompileEnv: function(index) {
			this.config.dockerfileConfig.compileEnv.splice(index, 1);
		},
		addEnvConfDefault: function() {
			this.config.envConfDefault.push({
				key: '',
				value: '',
				description: ''
			});
		},
		toggleBaseImage: function(imageName, imageTag, imageRegistry) {
			this.config.dockerfileConfig.baseImageName = imageName;
			this.config.dockerfileConfig.baseImageTag = imageTag;
			this.config.dockerfileConfig.baseImageRegistry = imageRegistry;
		},
		addCompileEnv: function() {
			this.config.dockerfileConfig.compileEnv.push({
				envName: '',
				envValue: ''
			});
		},
		addConfFiles: function() {
			this.config.confFiles.push({
				tplDir: '',
				originDir: ''
			});
		},
		modify: function() {
			var createProject = angular.copy(this.config);
			return $http.put('/api/project', angular.toJson(_formartProject(this.useDockerfile, createProject)));
		},
		getDockerfile: function() {
			return $http.post('/api/ci/build/dockerfile', angular.toJson(_formartProject(this.useDockerfile, this.config)), {
				notIntercept: true
			});
		},
		create: function() {
			var createProject = angular.copy(this.config);
			return $http.post('/api/project', angular.toJson(_formartProject(this.useDockerfile, createProject)));
		}
	};
	var getProjectInstance = function(project) {
		var ins = new Project();
		ins.init(project);
		return ins;
	};
	return {
		getProjectList: getProjectList,
		getProjectInfo: getProjectInfo,
		getBuildList: getBuildList,
		getFinishBuildLog: getFinishBuildLog,
		toBuild: toBuild,
		getReadMe: getReadMe,
		getBranchList: getBranchList,
		getGitLabInfo: getGitLabInfo,
		getBuildDockerfile: getBuildDockerfile,
		getProjectInstance: getProjectInstance,
		buildProject: buildProject
	};
}]);