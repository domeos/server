/*
 * @author ChandraLee
 */

((domeApp, undefined) => {
	domeApp.controller('DockerfileModalCtr', DockerfileModalCtr);

	function DockerfileModalCtr($modalInstance, project, $domeProject, $sce) {
		let vm = this;
		$domeProject.projectService.previewDockerfile(project._formartProject()).then(function (res) {
			if (res.data.resultCode == 200) {
				vm.dockerfileTxt = res.data.result ? $sce.trustAsHtml(res.data.result.replace(/[\n\r]/g, '<br/>')) : $sce.trustAsHtml('无数据！');
			} else {
				vm.dockerfileTxt = $sce.trustAsHtml('<h4 class="txt-error">请求失败！</h4><p class="txt-error">错误信息：' + res.data.resultMsg + '</p>');
			}
		}, function () {
			vm.dockerfileTxt = $sce.trustAsHtml('<p class="txt-error">请求失败！</p>');
		});
		vm.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	}
	DockerfileModalCtr.$inject = ['$modalInstance', 'project', '$domeProject', '$sce'];
})(angular.module('domeApp'));