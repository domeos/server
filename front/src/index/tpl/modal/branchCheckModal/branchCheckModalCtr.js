/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('BranchCheckModalCtr', BranchCheckModalCtr);

	function BranchCheckModalCtr($modalInstance, $domeProject, codeInfo, projectId) {
		var vm = this;
		vm.check = 'Branch';
		vm.branchKey = '';
		if (projectId) {
			$domeProject.projectService.getBranches(projectId).then(function (res) {
				vm.branches = res.data.result || [];
			});
			$domeProject.projectService.getTags(projectId).then(function (res) {
				vm.tags = res.data.result || [];
			});
		} else {
			$domeProject.projectService.getBranchesWithoutId(codeInfo.codeId, codeInfo.codeManagerUserId, codeInfo.codeManager).then(function (res) {
				vm.branches = res.data.result || [];
			});
			$domeProject.projectService.getTagsWithoutId(codeInfo.codeId, codeInfo.codeManagerUserId, codeInfo.codeManager).then(function (res) {
				vm.tags = res.data.result || [];
			});
		}
		vm.toggle = (model) => {
			vm.check = model;
			vm.branchKey = '';
			vm.selectedBranch = '';
		};
		vm.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		vm.submitBranch = function () {
			$modalInstance.close({
				type: vm.check.toLowerCase(),
				value: vm.selectedBranch
			});
		};
		vm.toggleBranch = function (branch) {
			vm.branchKey = '';
			vm.selectedBranch = branch;
		};
	}
	BranchCheckModalCtr.$inject = ['$modalInstance', '$domeProject', 'codeInfo', 'projectId'];
})(angular.module('domeApp'));