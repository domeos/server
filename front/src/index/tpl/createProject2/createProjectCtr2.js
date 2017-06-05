/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('CreateProjectCtr2', ['$scope', '$modal', '$domeProject', '$domeImage', '$domeData', 'dialog', '$state', '$q','$util', function ($scope, $modal, $domeProject, $domeImage, $domeData, dialog, $state, $q, $util) {
			$scope.$emit('pageTitle', {
				title: '新建工程',
				descrition: '在这里把您的代码仓库和DomeOS对接即可创建新项目。此外，您还可以对现有项目进行查询和管理。',
				mod: 'projectManage'
			});
			var lastPageInfo = angular.copy($domeData.getData('projectInfo'));
			$domeData.delData('projectInfo');
			$scope.projectCollectionId = $state.params.projectCollectionId;
			if(!$scope.projectCollectionId) {
				$state.go('projectCollectionManage');
			}
			if (!lastPageInfo) {
				$state.go('createProject1', {projectCollectionId: $scope.projectCollectionId});
				return;
			}
			$scope.valid = {
				needValid: false,
				createdFileStoragePath: false
			};
			var initConig = function () {
				$scope.config = $scope.project.config;
				// $scope.config.userDefineDockerfile = lastPageInfo.projectType == 'dockerfile';
				$scope.project.customConfig.buildPath = '/';
				$scope.project.customConfig.dockerfilePath = '/Dockerfile';
				$scope.config.authority = 0;
				$scope.projectCollectionId = $state.params.projectCollectionId;
				$domeProject.projectService.getProjectCollectionNameById($scope.projectCollectionId).then(function (res) {
					$scope.projectCollectionName = res.data.result || '';
				});
			};
			$scope.projectTypeLanguage = ['java'];
			$scope.project = $domeProject.getInstance('Project', {
				userDefineDockerfile: lastPageInfo.projectType === 'dockerfileincode',
				exclusiveBuild: $scope.projectTypeLanguage.indexOf(lastPageInfo.projectType) !== -1 ? {
					customType: lastPageInfo.projectType
				} : null,
				customDockerfile: lastPageInfo.projectType === 'dockerfileuserdefined' ? {
					dockerfile: '',
					uploadFileInfos: []
				} : null
			});
			initConig();

			var create = function (projectCollectionId) {
				$scope.project.create(projectCollectionId).then(function () {
					dialog.alert('提示', '新建成功！');
					$state.go('projectManage', {id: projectCollectionId});
				}, function (res) {
					dialog.error('新建失败', res.data.resultMsg);
				});
			};
			if (!$scope.config.userDefineDockerfile) {
				$scope.isLoading = true;
				$q.all([
					$domeImage.imageService.getForBuildImages(),
					$domeImage.imageService.getExclusiveImages('java'),
				]).then(([res1, res2]) => {
					let imageList = res1.data.result || [];
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
					$scope.project.projectImagesIns.privateRegistryImageList = newImageList;
					
					let exclusiveImage = res2.data.result || {};
					$scope.project.projectImagesIns.init(exclusiveImage);
				},()=>{}).finally(()=>{ $scope.isLoading = false; });
				
				$domeImage.imageService.getBaseImages().then(function (res) {
					$scope.imageList = res.data.result;
				});
			}
			// 切换项目类型
			// @param type: 'allType'(通用配置)/'java'
			$scope.toggleProjectType = function (type) {
				// 如果没有改变
				if (!$scope.config.userDefineDockerfile) {
					if (type == 'allType' && !$scope.project.isUseCustom && !$scope.project.isDefDockerfile) return;
					if ($scope.project.isUseCustom && type === $scope.project.customConfig.customType) return;
					if ($scope.project.isDefDockerfile && type === 'defdockerfile') return;
				}
				// 重置配置
				$scope.project.init();
				initConig();
				if (type == 'allType') {
					$scope.project.isUseCustom = false;
					$scope.project.isDefDockerfile = false;
				} else if (type === 'defdockerfile') {
					$scope.project.isUseCustom = false;
					$scope.project.isDefDockerfile = true;
				} else {
					$scope.project.isUseCustom = true;
					$scope.project.isDefDockerfile = false;
					$scope.project.customConfig.customType = type;
				}
			};
			$scope.validCreatedFileStoragePath = function () {
				if (!$scope.project.isUseCustom) {
					$scope.valid.createdFileStoragePath = true;
					return;
				}
				var createdFileStoragePath = $scope.project.customConfig.createdFileStoragePath;
				for (var i = 0, l = createdFileStoragePath.length; i < l; i++) {
					if (createdFileStoragePath[i].name) {
						$scope.valid.createdFileStoragePath = true;
						return;
					}
				}
				$scope.valid.createdFileStoragePath = false;
			};
			$scope.changeDockerfilePath = function (txt) {
				if (txt == '/') {
					$scope.config.dockerfileInfo.dockerfilePath = '/Dockerfile';
				} else {
					$scope.config.dockerfileInfo.dockerfilePath = txt + '/Dockerfile';
				}
			};
			$scope.getDockerfile = function () {
				$scope.config.name = lastPageInfo.info.projectBelong + '/' + lastPageInfo.info.name;
				$scope.config.codeInfo = lastPageInfo.info.codeInfo;
				$scope.config.autoBuildInfo = lastPageInfo.info.autoBuildInfo;

				$scope.project.getDockerfile();
			};
			$scope.toCopy = function () {
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'projectListModal.html',
					controller: 'ProjectListModalCtr',
					size: 'lg',
					resolve: {
						projectInfo: {
							userDefineDockerfile: $scope.config.userDefineDockerfile,
							isUseCustom: $scope.project.isUseCustom,
							isDefDockerfile: $scope.project.isDefDockerfile,
							customType: $scope.project.customConfig.customType,
							projectCollectionId: $scope.projectCollectionId
						}
					}
				});
				modalInstance.result.then(function (projectId) {
					$domeProject.projectService.getData(projectId).then(function (res) {
						var pro = res.data.result,
							customConfig = $scope.project.customConfig;
						$scope.project.init(pro.project);
						var proProject = pro.project;
						if (!proProject.userDefineDockerfile && proProject.exclusiveBuild && proProject.exclusiveBuild.customType) {
							$scope.project.projectImagesIns.getForBuildImageAsPrivateImageList('all');
							$scope.project.projectImagesIns.toggleSpecifiedImage('compile', proProject.exclusiveBuild.compileImage);
							$scope.project.projectImagesIns.toggleSpecifiedImage('run', proProject.exclusiveBuild.runImage);
						}
						$scope.config = $scope.project.config;
						$scope.validCreatedFileStoragePath();
						delete $scope.config.id;
					});

				});
			};
			$scope.toLastPage = function () {
				$domeData.setData('createProjectInfo1', lastPageInfo);
				$state.go('createProject1', {projectCollectionId: lastPageInfo.info.projectCollectionId, projectCollectionName: lastPageInfo.info.projectCollectionName});
			};
			$scope.createProject = function () {
				$scope.config.name = lastPageInfo.info.projectCollectionName + '/' + lastPageInfo.info.name;
				$scope.config.codeInfo = lastPageInfo.info.codeInfo;
				$scope.config.autoBuildInfo = lastPageInfo.info.autoBuildInfo;
				// $scope.project.creatorDraft = lastPageInfo.creatorDraft;
				create(lastPageInfo.info.projectCollectionId);
			};
			$scope.choseBaseImageForCustomDockerfile = function () {
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'index/tpl/tplChoseImage/choseImage.html',
					controller: 'choseImageCtr',
					size: 'lg',
					resolve: {}
				});
				modalInstance.result.then(function (img) {
					var cmd = 'From ' + img.registry.slice(img.registry.lastIndexOf('/') + 1) + '/' + img.imageName + ':' + img.imageTag;
					$scope.config.customDockerfile.dockerfile = cmd + '\n' + ($scope.config.customDockerfile.dockerfile || '');
				});
			};
		}])
    .controller('ProjectListModalCtr', ['$scope', '$filter', '$modalInstance', '$domeProject', '$domeProjectCollection', 'projectInfo', function ($scope, $filter, $modalInstance, $domeProject, $domeProjectCollection, projectInfo) {
			$scope.key = {
				searchKey: ''
			};
      $scope.selectedCollection = { id: projectInfo.projectCollectionId };
      $scope.collectionList = [$scope.selectedCollection];
      $domeProjectCollection.projectCollectionService.getProjectCollection().then(function (resp) {
        $scope.collectionList = resp.data.result;
        if ($scope.selectedCollection) {
          $scope.selectedCollection = $scope.collectionList.filter(function (x) { return x.id ==/* i'm not sure how type converted, but this work, do not add another equal mark */ $scope.selectedCollection.id; })[0];
        }
      });
      var loadProjectList = function (collectionId) {
        $scope.loading = true;
        $domeProject.projectService.getProject(collectionId).then(function (res) {
          var grouped = res.data.result || [], projects = [];
          Object.keys(grouped).forEach(function (groupName) { projects = projects.concat(grouped[groupName]); });
          $scope.projectList = projects.filter(function (project) {
            if (projectInfo.userDefineDockerfile) return project.projectType === 'dockerfileincode';
            if (projectInfo.isDefDockerfile) return project.projectType === 'dockerfileuserdefined';
            if (projectInfo.isUseCustom) {
              if (projectInfo.customType === 'java') return project.projectType === 'java';
              return false;
            }
            return project.projectType === 'commonconfig';
          });
        }).finally(function () {
          $scope.loading = false;
        });
      }
      loadProjectList($scope.selectedCollection.id);
      $scope.selectCollection = function (collection) {
        $scope.selectedCollection = collection;
        loadProjectList(collection.id);
      };
			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};
			$scope.copy = function (projectId) {
				$modalInstance.close(projectId);
			};
		}]);
})(angular.module('domeApp'));