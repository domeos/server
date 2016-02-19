/*!
 *
 * @description : business service module of domeAPP
 *
 * @create date : 2015.08
 * @module : domeService
 * @version : 0.1
 * 
 */

// constant of domeService
domeApp.service('CONSTANT', function() {
		return {
			COMMON_ADDRESS: ''
		};
	})
	// 公共service 
	.factory('$domePublic', ['$modal', '$q', function($modal, $q) {
		var publicService = {};
		publicService.openWarning = function(txt) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'warningModal.html',
				controller: 'warningModalCtrl',
				size: 'sm',
				resolve: {
					promptTxt: function() {
						return txt;
					}
				}
			});
		};
		publicService.openPrompt = function(txt) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'promptModal.html',
				controller: 'promptModalCtrl',
				size: 'sm',
				resolve: {
					promptTxt: function() {
						return txt;
					}
				}
			});
			return modalInstance.result;
		};
		publicService.openConfirm = function(txt) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'confirmModal.html',
				controller: 'confirmModalCtr',
				size: 'sm',
				resolve: {
					promptTxt: function() {
						return txt;
					}
				}
			});
			return modalInstance.result;
		};
		publicService.openDelete = function(txt) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'deleteModal.html',
				controller: 'deleteModalCtr',
				size: 'sm',
				resolve: {
					promptTxt: function() {
						return txt;
					}
				}
			});
			return modalInstance.result;
		};
		publicService.isDelete = function() {
			var deferred = $q.defer();
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'sureDelete.html',
				controller: 'sureDeleteCtrl',
				size: 'sm'
			});

			modalInstance.result.then(function() {
				deferred.resolve(true);
			}, function() {
				deferred.reject(false);
			});
			return deferred.promise;
		};
		var Loadings = function() {
			this.isLoading = false;
			this.loadingItems = {};
		};
		Loadings.prototype = {
			startLoading: function(loadingItem) {
				this.loadingItems[loadingItem] = true;
				if (!this.isLoading) {
					this.isLoading = true;
				}
			},
			finishLoading: function(loadingItem) {
				var that = this;
				var isLoadingNow = false;
				that.loadingItems[loadingItem] = false;
				angular.forEach(that.loadingItems, function(value, item) {
					if (value && !isLoadingNow) {
						isLoadingNow = true;
					}
				});
				that.isLoading = isLoadingNow;
			}
		};
		publicService.getLoadingInstance = function() {
			return new Loadings();
		};
		return publicService;
	}])
	// 数据存储service
	.provider('$domeData', function() {
		var data = {};
		var setData = function(key, value) {
			data[key] = value;
		};
		var getData = function(key) {
			return data[key];
		};
		var delData = function(key) {
			if (data[key]) {
				data[key] = null;
			}
		};
		return {
			setData: setData,
			$get: function() {
				return {
					setData: setData,
					getData: getData,
					delData: delData
				};
			}
		};
	})
	// 用户管理service
	.factory('$domeUser', ['CONSTANT', '$http', '$q', '$domePublic', '$domeGlobal', function(CONSTANT, $http, $q, $domePublic, $domeGlobal) {
		var commonUrl = CONSTANT.COMMON_ADDRESS;
		var relatedGitLab = function(loginData) {
			var deferred = $q.defer();
			var gitOptions = $domeGlobal.getGloabalInstance('git');
			gitOptions.getData().then(function(info) {
				if (!info[0].url || info[0].url === '') {
					$domePublic.openWarning('未配置代码仓库地址！');
					deferred.reject();
				} else {
					var url = info[0].url;
					$http.post(url + '/api/v3/session', angular.toJson(loginData)).then(function(res) {
						var info = res.data;
						var params = {
							name: info.username,
							token: info.private_token
						};
						return params;
					}, function() {
						deferred.reject();
					}).then(function(params) {
						$http.post(commonUrl + '/api/project/git/gitlabinfo', angular.toJson(params)).then(function(res) {
							deferred.resolve(res.data.result);
						}, function() {
							deferred.reject();
						});
					}, function() {
						deferred.reject();
					});
				}
			}, function() {
				deferred.reject();
			});
			return deferred.promise;
		};
		var getCurrentUser = function() {
			return $http.get(commonUrl + '/api/user/get');
		};
		var getUserList = function() {
			return $http.get(commonUrl + '/api/user/list');
		};
		var modifyUserInfo = function(username, email) {
			return $http.post(commonUrl + '/api/user/modify?username=' + username + '&email=' + email);
		};
		// 管理员修改：@param userInfo:{username:'username', password:'password'}
		var modifyPw = function(userInfo) {
			return $http.post(commonUrl + '/api/user/adminChangePassword', angular.toJson(userInfo));
		};
		// 用户修改： @param userInfo: {username:'username', oldpassword:'oldpassword', newpassword:'newpassword'}
		var userModifyPw = function(userInfo) {
			return $http.post(commonUrl + '/api/user/changePassword', angular.toJson(userInfo));
		};
		var deleteUser = function(username) {
			return $http.delete(commonUrl + '/api/user/delete/' + username);
		};
		var createUser = function(userInfo) {
			return $http.post(commonUrl + '/api/user/create', angular.toJson(userInfo));
		};
		var getGroupList = function() {
			return $http.get(commonUrl + ' /api/namespace/list');
		};
		// 获取单个资源用户信息
		var getSigResourceUser = function(resourceType, id) {
			return $http.get(commonUrl + '/api/resource/' + resourceType + '/' + id);
		};
		// 获取某类资源用户信息
		var getResourceUser = function(resourceType) {
			return $http.get(commonUrl + '/api/resource/' + resourceType + '/useronly');
		};
		var getGroup = function() {
			return $http.get(commonUrl + '/api/group/list');
		};
		var getGroupInfo = function(groupId) {
			return $http.get(commonUrl + '/api/group/get/' + groupId);
		};
		var deleteGroup = function(groupId) {
			return $http.delete(commonUrl + '/api/group/delete/' + groupId);
		};
		var createGroup = function(groupData) {
			return $http.post(commonUrl + '/api/group/create', angular.toJson(groupData));
		};
		var modifyGroupUsers = function(groupId, users) {
			return $http.post(commonUrl + '/api/group_members/' + groupId, angular.toJson(users));
		};
		var deleteGroupUser = function(groupId, userId) {
			return $http.delete(commonUrl + '/api/group_members/' + groupId + '/' + userId);
		};
		var getGroupUser = function(groupId) {
			return $http.get(commonUrl + '/api/group_members/' + groupId);
		};
		var modifyResourceUser = function(ResourceInfo) {
			return $http.put(commonUrl + '/api/resource', angular.toJson(ResourceInfo));
		};
		var deleteResourceUser = function(resourceType, resourceId, ownerType, ownerId) {
			return $http.delete(commonUrl + '/api/resource/' + resourceType + '/' + resourceId + '/' + ownerType + '/' + ownerId);
		};
		var logout = function() {
			return $http.get(commonUrl + '/api/user/logout');
		};
		// 资源成员
		var ResourceUser = function() {};
		ResourceUser.prototype = {
			constructor: ResourceUser,
			init: function(resourceInfo) {
				var i;
				resourceInfo.userInfos = resourceInfo.userInfos || [];
				resourceInfo.groupInfo = resourceInfo.groupInfo || [];
				for (i = 0; i < resourceInfo.userInfos.length; i++) {
					// 是否被修改
					resourceInfo.userInfos[i].isDirty = false;
					// 用来存储用户修改的role
					resourceInfo.userInfos[i].newRole = resourceInfo.userInfos[i].role;
				}
				this.resourceInfo = resourceInfo;
			},
			toggleRole: function(user, newRole) {
				if (user.newRole !== newRole) {
					user.newRole = newRole;
				}
				if (user.newRole === user.role) {
					user.isDirty = false;
				} else {
					user.isDirty = true;
				}
			},
			saveRole: function(user) {
				var data;
				if (this.resourceInfo.resourceType == 'group') {
					data = {
						members: [{
							user_id: user.user_id,
							role: user.newRole
						}]
					};
					modifyGroupUsers(this.resourceInfo.resourceId, data).then(function(res) {
						user.isDirty = false;
						user.role = user.newRole;
					}, function() {
						$domePublic.openWarning('修改失败！');
					});
				} else {
					data = {
						resource_id: this.resourceInfo.resourceId,
						resource_type: this.resourceInfo.resourceType,
						ownerInfos: [{
							owner_id: user.user_id,
							owner_type: user.owner_type,
							role: user.newRole
						}]
					};
					modifyResourceUser(data).then(function(res) {
						user.isDirty = false;
						user.role = user.newRole;
					}, function() {
						$domePublic.openWarning('修改失败！');
					});

				}
			},
			deleteUser: function(user) {
				var that = this;

				function spliceUser() {
					for (var i = 0; i < that.resourceInfo.userInfos.length; i++) {
						if (that.resourceInfo.userInfos[i].user_id === user.user_id) {
							that.resourceInfo.userInfos.splice(i, 1);
							break;
						}
					}
				}
				if (that.resourceInfo.resourceType == 'group') {
					deleteGroupUser(that.resourceInfo.resourceId, user.user_id).then(function(res) {
						spliceUser();
					}, function() {
						$domePublic.openWarning('删除失败！');
					});
				} else {
					$domePublic.openDelete().then(function() {
						deleteResourceUser(that.resourceInfo.resourceType, that.resourceInfo.resourceId, user.owner_type, user.user_id).then(function(res) {
							spliceUser();
						}, function() {
							$domePublic.openWarning('删除失败！');
						});
					});
				}
			}
		};

		var UserGroupList = function() {
			this.userGroup = {};
		};
		UserGroupList.prototype = {
			init: function(userGroupInfo) {
				var that = this;
				that.userGroupList = userGroupInfo || [];
				if (that.userGroupList[0]) {
					that.toggle(0);
				}
			},
			toggle: function(index) {
				this.userGroup = this.userGroupList[index];
			}

		};
		var getInstance = function(className, initInfo) {
			var ins;
			switch (className) {
				case 'UserGroupList':
					ins = new UserGroupList();
					break;
				case 'ResourceUser':
					ins = new ResourceUser();
					break;
				default:
					ins = {};
					ins.init = function() {
						console.log('error:there is no ' + className);
					};
					break;
			}
			ins.init(initInfo);
			return ins;
		};

		return {
			relatedGitLab: relatedGitLab,
			getCurrentUser: getCurrentUser,
			getUserList: getUserList,
			modifyUserInfo: modifyUserInfo,
			modifyPw: modifyPw,
			userModifyPw: userModifyPw,
			deleteUser: deleteUser,
			createUser: createUser,
			getGroupList: getGroupList,
			getSigResourceUser: getSigResourceUser,
			getResourceUser: getResourceUser,
			modifyResourceUser: modifyResourceUser,
			getGroup: getGroup,
			getGroupInfo: getGroupInfo,
			deleteGroup: deleteGroup,
			createGroup: createGroup,
			modifyGroupUsers: modifyGroupUsers,
			getGroupUser: getGroupUser,
			logout: logout,
			getInstance: getInstance
		};
	}])
	// 项目管理service
	.factory('$domeProject', ['CONSTANT', '$http', '$util', '$state', '$domePublic', '$q', '$modal', function(CONSTANT, $http, $util, $state, $domePublic, $q, $modal) {
		var commonUrl = CONSTANT.COMMON_ADDRESS;

		var getProjectList = function() {
			return $http.get(commonUrl + '/api/project');
		};
		var getProjectInfo = function(proId) {
			return $http.get(commonUrl + '/api/project/' + proId);
		};
		var getReadMe = function(proId, branch) {
			return $http.get(commonUrl + '/api/project/readme/' + proId + '/' + branch);
		};
		var getBuildList = function(proId) {
			return $http.get(commonUrl + '/api/ci/build/' + proId);
		};
		var toBuild = function(buildInfo) {
			return $http.post(commonUrl + '/api/ci/build/start', angular.toJson(buildInfo), {
				notIntercept: true
			});
		};
		var getFinishBuildLog = function(proId, buildId) {
			return $http.get(commonUrl + '/api/ci/build/download/' + proId + '/' + buildId);
		};
		var getBranchList = function(proId) {
			return $http.get(commonUrl + '/api/project/branches/' + proId);
		};
		var getGitLabInfo = function() {
			return $http.get(commonUrl + '/api/project/git/gitlabinfo');
		};
		var getBuildDockerfile = function(proId, buildId) {
			return $http.get(commonUrl + '/api/ci/build/dockerfile/' + proId + '/' + buildId);
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
				return $http.put(commonUrl + '/api/project', angular.toJson(_formartProject(this.useDockerfile, createProject)));
			},
			getDockerfile: function() {
				return $http.post(commonUrl + '/api/ci/build/dockerfile', angular.toJson(_formartProject(this.useDockerfile, this.config)), {
					notIntercept: true
				});
			},
			create: function() {
				var createProject = angular.copy(this.config);
				return $http.post(commonUrl + '/api/project', angular.toJson(_formartProject(this.useDockerfile, createProject)));
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
	}])
	// 应用商店service
	.factory('$domeAppStore', ['CONSTANT', '$http', '$domeDeploy', function(CONSTANT, $http, $domeDeploy) {
		var commonUrl = CONSTANT.COMMON_ADDRESS;
		var getStoreApps = function() {
			return $http.get('http://app.domeos.org/apps.json');
		};
		// App Class 单个应用
		var AppInfo = function() {};
		AppInfo.prototype = {
			init: function(info) {
				this.config = info;
				this.formartToDeploy();
			},
			// 得到对应的部署结构体
			formartToDeploy: function() {
				var deployObj = {};
				deployObj = angular.copy(this.config.deploymentTemplate);
				deployObj.deployName = this.config.appName + parseInt(Math.random() * 10000);
				this.deployIns = $domeDeploy.getInstance('EditDeploy', deployObj);
			}
		};
		var getInstance = function(className, initInfo) {
			var ins;
			switch (className) {
				case 'AppInfo':
					ins = new AppInfo();
					break;
				default:
					ins = {};
					ins.init = function() {
						console.log('error:there is no ' + className);
					};
					break;
			}
			ins.init(initInfo);
			return ins;
		};
		return {
			getStoreApps: getStoreApps,
			getInstance: getInstance
		};
	}])
	// 镜像service
	.factory('$domeImage', ['CONSTANT', '$http', function(CONSTANT, $http) {
		var commonUrl = CONSTANT.COMMON_ADDRESS;
		var getBaseImageList = function() {
			return $http.get(commonUrl + '/api/ci/baseimage');
		};
		var getDockerImage = function() {
			return $http.get(commonUrl + '/api/dockerimage');
		};
		var getDockerImageTags = function(projectName, registry) {
			return $http.get(commonUrl + '/api/dockerimage/detail?name=' + projectName + '&registry=' + registry);
		};
		var getGlobalImageInfo = function(imageName) {
			return $http.get(commonUrl + '/api/global/dockerimages/detail?name=' + imageName);
		};
		var getAllImages = function() {
			return $http.get(commonUrl + '/api/global/dockerimages');
		};
		var createBaseImage = function(imageInfo) {
			return $http.post(commonUrl + '/api/ci/baseimage', angular.toJson(imageInfo));
		};
		return {
			getBaseImageList: getBaseImageList,
			getDockerImage: getDockerImage,
			getDockerImageTags: getDockerImageTags,
			getGlobalImageInfo: getGlobalImageInfo,
			getAllImages: getAllImages,
			createBaseImage: createBaseImage
		};
	}]);