/*
 * @author ChandraLee
 */

((domeApp, undefined) => {
	function BuildModalCtr(projectInfo, $domeProject, $domePublic, dialog, $modalInstance) {
		'use strict';
		let vm = this;
		vm.projectInfo = projectInfo;
		vm.loadingIns = $domePublic.getLoadingInstance();
		vm.buildWay = 'Branch';
		vm.searchKey = '';
		vm.imageTag = '';
		vm.selectedBranch = '';

		if (vm.projectInfo.hasCodeInfo) {
			vm.loadingIns.startLoading('branch');
			$domeProject.projectService.getBranches(vm.projectInfo.projectId).then((res) => {
				vm.branches = res.data.result || [];
			}).finally(() => {
				vm.loadingIns.finishLoading('branch');
			});
			vm.loadingIns.startLoading('tag');
			$domeProject.projectService.getTags(vm.projectInfo.projectId).then((res) => {
				vm.tags = res.data.result || [];
			}).finally(() => {
				vm.loadingIns.finishLoading('tag');
			});
		}

		vm.toggleBuildWay = (type) => {
			vm.buildWay = type;
			vm.searchKey = '';
			vm.selectedBranch = '';
		};
		vm.toggleBranch = (branch) => {
			vm.selectedBranch = branch;
			vm.searchKey = '';
		};
		vm.close = () => {
			$modalInstance.dismiss('cancel');
		};
		vm.toBuild = () => {
			let buildInfo = {
				projectId: vm.projectInfo.projectId,
				codeInfo: {}, //代码信息
				imageInfo: {} //镜像信息
			};
			if (vm.projectInfo.hasCodeInfo) {
				if (vm.buildWay == 'Branch') buildInfo.codeInfo.codeBranch = vm.selectedBranch;
				else buildInfo.codeInfo.codeTag = vm.selectedBranch;
			}

			if (vm.imageTag) {
				buildInfo.imageInfo.imageTag = vm.imageTag;
			}
			vm.loadingIns.startLoading('submit');
			$domeProject.projectService.build(buildInfo).then((res) => {
				if (res.data.resultCode == 200) {
					$modalInstance.close();
					dialog.alert('提示', '成功，正在构建！');
				} else {
					$modalInstance.close();
					dialog.error('警告', '构建失败！错误信息：' + res.data.resultMsg);
				}
			}, () => {
				dialog.error('警告', '构建失败，请重试！');
			}).finally(() => {
				vm.loadingIns.finishLoading('submit');
			});
		};
	}

	BuildModalCtr.$inject = ['projectInfo', '$domeProject', '$domePublic', 'dialog', '$modalInstance'];
	domeApp.controller('BuildModalCtr', BuildModalCtr);

})(angular.module('domeApp'));