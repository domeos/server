/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;
    domeApp.controller('CreateProjectCtr1', ['$scope', '$state', '$domeData', '$modal', '$domeProject', 'dialog', '$sce', '$domeGlobal', function ($scope, $state, $domeData, $modal, $domeProject, dialog, $sce, $domeGlobal) {
        $scope.$emit('pageTitle', {
            title: '新建工程',
            descrition: '在这里把您的代码仓库和DomeOS对接即可创建新项目。此外，您还可以对现有项目进行查询和管理。',
            mod: 'projectManage'
        });
        $scope.pageNo = 1;
        $scope.pageSize = 8;
        $scope.projectList = [];
        $scope.creator = {};
        $scope.codeManager = 'gitlab';
        $scope.projectCollectionId = $state.params.projectCollectionId;
        if (!$scope.projectCollectionId) {
            $state.go('projectCollectionManage');
        }
        $domeProject.projectService.getProjectCollectionNameById($scope.projectCollectionId).then(function (res) {
            $scope.projectCollectionName = res.data.result || '';
        });
        $scope.autoBuildInfo = {
            tag: 0,
            master: false,
            other: false,
            branches: ''
        };
        $scope.role = 'user';
        // projectType: commonconfig/dockerfileuserdefined/dockerfileincode/java/php
        $scope.projectType = 'commonconfig';
        $scope.projectTypeLanguage = ['java'];
        $scope.projectTypeNotAllowedWOCodeManager = ['dockerfileincode'].concat($scope.projectTypeLanguage);
        // $scope.currentGroup = {};
        $scope.currentProject = {};
        $scope.isFromLastStep = false;
        //  如果是“上一步”进入本页面
        var createProjectInfo1 = angular.copy($domeData.getData('createProjectInfo1'));
        if (createProjectInfo1) {
            $domeData.delData('createProjectInfo1');
            if (createProjectInfo1.info.codeInfo) {
                $scope.currentProject = (function () {
                    var codeInfo = createProjectInfo1.info.codeInfo;
                    return {
                        nameWithNamespace: codeInfo.nameWithNamespace,
                        sshUrl: codeInfo.codeSshUrl,
                        httpUrl: codeInfo.codeHttpUrl,
                        projectId: codeInfo.codeId
                    };
                })();
                $scope.currentUserId = createProjectInfo1.info.codeInfo.codeManagerUserId;
                $scope.runnersToken = createProjectInfo1.info.codeInfo.runnersToken;
            }
            $scope.codeManager = createProjectInfo1.codeManager;
            $scope.currentGitLab = createProjectInfo1.currentGitLab;
            $scope.gitLabInfo = createProjectInfo1.gitLabInfo;
            $scope.gitLabList = createProjectInfo1.gitLabList;
            $scope.isFromLastStep = createProjectInfo1.isFromLastStep;
            // $scope.creator = {
            // 	id: createProjectInfo1.creatorDraft.creatorId,
            // 	type: 'GROUP'
            // };
            $scope.projectName = createProjectInfo1.info.name;
            if (createProjectInfo1.info.autoBuildInfo) {
                $scope.autoBuildInfo = createProjectInfo1.info.autoBuildInfo;
            } else {
                $scope.autoBuildInfo = {
                    tag: 0,
                    master: false,
                    other: false,
                    branches: ''
                };
            }
            $scope.projectType = createProjectInfo1.projectType;
        }
        $scope.setProjectList = function (info) {
            $scope.pageNo = 1;
            $scope.currentUserId = info.id;
            $scope.projectList = info.projectInfos;
        };
        $scope.setCurrentProject = function (pro) {
            $scope.currentProject = pro;
        };
        var getGitLabList = function () {
            if (!$scope.isFromLastStep) {
                $domeGlobal.getGloabalInstance('gitUser').getData().then(function (res) {
                    var gitLabList = res || {};  //the res is object{"gitConfigList": List<GitConfig>, 'defaultGitlab': int}
                    $scope.gitLabList = gitLabList.gitConfigList;
                    var firstGitLab = null;
                    if ($scope.gitLabList.length > 0 && gitLabList.defaultGitlab) {
                        $scope.gitLabList.forEach(function (item) {
                            if (item.id === gitLabList.defaultGitlab) {
                                firstGitLab = item;
                                return;
                            }
                        });
                        if (firstGitLab != null) {
                            $scope.toggleCodeManager(firstGitLab, 'gitlab');
                        } else {
                            $scope.toggleCodeManager(firstGitLab, null);
                        }
                    } else {
                        $scope.toggleCodeManager(firstGitLab, null);
                    }
                }, function (resError) {
                    dialog.error('拉取 GitLab 失败', resError);
                    $scope.toggleCodeManager(null, null);
                });
            } else if ($scope.currentUserId && $scope.currentProject && $scope.isFromLastStep) { // 判断是否从“上一步”返回该页面，并初始化。
                for (var i = 0, l = $scope.gitLabInfo.length; i < l; i++) {
                    if ($scope.gitLabInfo[i].id === $scope.currentUserId) {
                        $scope.setProjectList($scope.gitLabInfo[i]);
                        for (var j = 0, l1 = $scope.projectList.length; j < l1; j++) {
                            if ($scope.projectList[j].projectId === $scope.currentProject.projectId) {
                                $scope.setCurrentProject($scope.projectList[j]);
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        };
        getGitLabList();
        $scope.getGitLabInfo = function (gitLabId) {
            $scope.isGitLabInfoLoading = true;
            $domeProject.projectService.getGitLabInfo(gitLabId).then(function (res) {
                $scope.gitLabInfo = res.data.result || [];
                if ($scope.gitLabInfo.length > 0) {
                    $scope.setProjectList($scope.gitLabInfo[0]);
                } else {
                    $scope.pageNo = 1;
                    $scope.currentUserId = null;
                    $scope.projectList = [];
                }
            }).finally(function () {
                $scope.isGitLabInfoLoading = false;
            });
        };
        // getGitLabInfo();

        $scope.toggleCodeManager = function (gitLabIns, codeManagerType) {
            if (gitLabIns !== null) {
                $scope.currentGitLab = gitLabIns;
                $scope.codeManager = codeManagerType;
                $scope.isFromLastStep = false;
                $scope.getGitLabInfo($scope.currentGitLab.id);
            } else {
                $scope.currentGitLab = gitLabIns;
                $scope.codeManager = codeManagerType;
            }
            if (!$scope.codeManager && $scope.projectTypeNotAllowedWOCodeManager.indexOf($scope.projectType) !== -1) {
                $scope.projectType = 'common';
            }
            $scope.$broadcast('changeScrollList', new Date());
        };
        $scope.toRelated = function () {
            var loginModalIns = $modal.open({
                templateUrl: 'loginModal.html',
                controller: 'LoginModalCtr',
                size: 'md',
                resolve: {
                    gitLab: function () {
                        return $scope.currentGitLab;
                    },
                },
            });
            loginModalIns.result.then(function () {
                dialog.alert('提示', '关联成功！');
                $scope.isFromLastStep = false;
                $scope.getGitLabInfo($scope.currentGitLab.id);
            });
        };
        // $scope.changeCreator = function (user) {
        // 	$scope.creator = user;
        // };
        $scope.toNext = function () {
            if ($scope.codeManager && !$scope.currentProject.projectId) {
                dialog.error('警告', '请选择一个项目！');
                return;
            }
            // var creatorInfo = {
            // 	creatorType: 'GROUP',
            // 	creatorName: $scope.creator.name,
            // 	creatorId: $scope.creator.id
            // };
            var proInfo = {
                name: $scope.projectName,
                projectCollectionId: $scope.projectCollectionId,
                projectCollectionName: $scope.projectCollectionName,
                projectBelong: $scope.creator.name,
            };

            //使用gitlab
            if ($scope.codeManager) {
                //自动构建
                proInfo.autoBuildInfo = $scope.autoBuildInfo;
                proInfo.codeInfo = {
                    codeManager: $scope.codeManager,
                    nameWithNamespace: $scope.currentProject.nameWithNamespace,
                    codeSshUrl: $scope.currentProject.sshUrl,
                    codeHttpUrl: $scope.currentProject.httpUrl,
                    codeId: $scope.currentProject.projectId,
                    codeManagerUserId: $scope.currentUserId,
                    runnersToken: $scope.runnersToken,
                };
            }

            $domeData.setData('projectInfo', {
                // creatorDraft: creatorInfo,
                codeManager: $scope.codeManager,
                info: proInfo,
                projectType: $scope.projectType,
                gitLabInfo: $scope.gitLabInfo,
                isFromLastStep: true,
                gitLabList: $scope.gitLabList,
                currentGitLab: $scope.currentGitLab,
            });
            // console.log($domeData.getData('projectInfo'));
            $state.go('createProject2', {
                projectCollectionId: $scope.projectCollectionId
            });
        };
        $scope.isDescriptionNull = function (str) {
            var result = str;
            if (!str) {
                result = '无描述信息';
            }
            return result;
        };


        $scope.modifyTooltip = function (data) {
            if (!data) {
                return;
            }
            var tpl = [];
            tpl.push('<div class="table-detail-wrap"><table class="table-detail" style="text-align:left">');
            tpl.push('<tbody>');
            tpl.push('<tr><td>httpUrl: </td><td>' + data.httpUrl + '</td>');
            tpl.push('<tr><td>sshUrl: </td><td>' + data.sshUrl + '</td>');
            tpl.push('</tbody>');
            tpl.push('</table></div>');
            $scope.toolTipText = $sce.trustAsHtml(tpl.join(''));
        };
        $scope.modifyCodeInfo = function (pro) {
            // console.log(pro);
            var modifyProjectModalIns = $modal.open({
                templateUrl: '/index/tpl/modal/codeInfoModal/codeInfoModal.html',
                controller: 'CodeInfoModalCtr as vmPro',
                size: 'md',
                resolve: {
                    project: function () {
                        return pro;
                    },
                    showForm: function () {
                        return 'createProject';
                    }
                }
            });
            modifyProjectModalIns.result.then(function (result) {
                for (var i = 0, l = $scope.projectList.length; i < l; i++) {
                    var project = $scope.projectList[i];
                    if (project.projectId === result.projectId) {
                        $scope.projectList[i] = result;
                        break;
                    }
                }
                $scope.setCurrentProject(result);
            });
        };
    }])
        .controller('LoginModalCtr', ['$scope', '$http', '$modalInstance', '$domeUser', 'gitLab', function ($scope, $http, $modalInstance, $domeUser, gitLab) {
            $scope.gitLab = gitLab;
            $scope.toLogin = function () {
                $scope.errorTxt = '';
                $scope.isWaiting = true;
                var index = $scope.username.indexOf('@');
                var username = $scope.username;
                if (index !== -1) {
                    username = username.substring(0, index);
                }
                var data = {
                    gitlabId: gitLab.id,
                    login: username,
                    password: $scope.password
                };
                $domeUser.relatedGitLab(data).then(function () {
                    $modalInstance.close();
                }, function () {
                    $scope.errorTxt = '关联失败，请重试！';
                    $scope.isWaiting = false;
                });
            };
            $scope.close = function () {
                $modalInstance.dismiss('cancel');
            };
        }]);
})(angular.module('domeApp'));