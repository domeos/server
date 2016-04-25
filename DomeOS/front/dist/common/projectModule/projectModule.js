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
	var getBranchList = function(proId) {
		return $http.get('/api/project/branches/' + proId);
	};
	var getTagList = function(proId) {
		return $http.get('/api/project/tags/' + proId);
	};
	var getGitLabInfo = function() {
		return $http.get('/api/project/git/gitlabinfo');
	};
	var getBuildDockerfile = function(proId, buildId) {
		return $http.get('/api/ci/build/dockerfile/' + proId + '/' + buildId);
	};
	var _formartProject = function(project) {
		var formartProject = {},
			i = 0,
			confFiles = {},
			envConfDefault = [],
			branches = [],
			compileEnvStrArr = [],
			// uploadFile = {},
			sigEnvConfDefault, autoBuildInfo;
		project = angular.copy(project);
		//环境变量
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
		//代码信息，自动构建配置
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
		// if (!project.type) {
		// 	project.type = 'USER';
		// }
		if (project.userDefineDockerfile) {
			formartProject.name = project.name;
			formartProject.id = project.id;
			// formartProject.type = project.type;
			if (project.codeInfo) {
				formartProject.codeInfo = project.codeInfo;
				formartProject.autoBuildInfo = project.autoBuildInfo;
			}
			formartProject.dockerfileInfo = project.dockerfileInfo;
			formartProject.authority = project.authority;
			formartProject.envConfDefault = project.envConfDefault;
			formartProject.userDefineDockerfile = project.userDefineDockerfile;
		} else {
			if (project.dockerfileInfo) {
				project.dockerfileInfo = null;
			}
			//配置文件
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

			// if (project.uploadFile && project.uploadFile.length !== 0) {
			// 	for (i = 0; i < project.uploadFile.length; i++) {
			// 		uploadFile[project.uploadFile[i].location] = project.uploadFile[i].md5;
			// 	}
			// }
			// project.uploadFile = uploadFile;
			formartProject = project;
		}
		return formartProject;
	};
	var _formartCreateProject = function(projectInfo, creatorDraft) {
		var formartCreateProject = {};
		//项目创建信息，创建在分组或者用户名下

		formartCreateProject.project = projectInfo;
		formartCreateProject.creatorDraft = creatorDraft;
		return formartCreateProject;
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
				compileEnvArr, autoBuildInfo;
			if (!project) {
				project = {};
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
			if (project.dockerfileConfig.compileEnv && project.dockerfileConfig.compileEnv !== '') {
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
			//环境变量
			project.dockerfileConfig.compileEnv = compileEnvs;

			this.config = project;
			this.creatorDraft = {};
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
			return $http.put('/api/project', angular.toJson(_formartProject(createProject)));
		},
		getDockerfile: function() {
			return $http.post('/api/ci/build/dockerfile', angular.toJson(_formartProject(this.config)), {
				notIntercept: true
			});
		},
		create: function() {
			var createProject = angular.copy(this.config);
			var formartProject = _formartProject(createProject);
			var creatorDraft = angular.copy(this.creatorDraft);
			return $http.post('/api/project', angular.toJson(_formartCreateProject(formartProject, creatorDraft)));
		},
		delete: function() {
			var defered = $q.defer(),
				that = this;
			$domePublic.openDelete().then(function() {
				$http.delete('/api/project/' + that.config.id).then(function() {
					$domePublic.openPrompt('删除成功！');
					defered.resolve();
				}, function(res) {
					$domePublic.openWarning({
						title: '删除失败！',
						msg: res.data.resultMsg
					});
					defered.reject('fail');
				});
			}, function() {
				defered.reject('dismiss');
			});
			return defered.promise;
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
		toBuild: toBuild,
		getReadMe: getReadMe,
		getBranchList: getBranchList,
		getTagList: getTagList,
		getGitLabInfo: getGitLabInfo,
		getBuildDockerfile: getBuildDockerfile,
		getProjectInstance: getProjectInstance,
		buildProject: buildProject
	};
}]);