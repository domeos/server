/*
 * @description: 全局配置
 * @version: 0.1
 */
domeApp.factory('$domeGlobal', ['CONSTANT', '$http', '$domePublic', '$q', function(CONSTANT, $http, $domePublic, $q) {
	var commonUrl = CONSTANT.COMMON_ADDRESS;
	var GlobalConfig = function(type) {
		var _url = (function() {
			var url;
			switch (type) {
				case 'ldap':
					url = '/api/global/ldapconfig';
					break;
				case 'server':
					url = '/api/global/serverconfig';
					break;
				case 'git':
					url = '/api/global/gitconfig';
					break;
				case 'registry':
					url = '/api/global/registry/private';
					break;
				case 'monitor':
					url = '/api/global/monitor';
					break;
				case 'ssh':
					url = '/api/global/webssh';
					break;
				case 'cluster':
					url = '/api/global/ci/cluster';
					break;
				default:
					url = '';
					break;
			}
			return url;
		})(type);
		var _isFirstSet = true;
		this.getData = function() {
			var deferred = $q.defer();
			$http.get(_url).then(function(res) {
				if (!res.data.result || (type == 'git' && res.data.result.length === 0)) {
					deferred.reject();
				} else {
					_isFirstSet = false;
					deferred.resolve(res.data.result);
				}
			}, function() {
				deferred.reject();
			});
			return deferred.promise;
		};
		this.modifyData = function(info) {
			var deferred = $q.defer();
			var modifySuccess = function() {
				$domePublic.openPrompt('设置成功！');
			};
			var optFailed = function() {
				$domePublic.openWarning('操作失败！');
			};
			if (_isFirstSet || type === 'registry') {
				_isFirstSet = false;
				$http.post(_url, angular.toJson(info)).then(function(res) {
					modifySuccess();
					deferred.resolve(res.data.result);
				}, function() {
					optFailed();
					deferred.reject();
				});
			} else {
				$http.put(_url, angular.toJson(info)).then(function(res) {
					modifySuccess();
					deferred.resolve(res.data.result);
				}, function() {
					optFailed();
					deferred.reject();
				});
			}
			return deferred.promise;
		};
	};
	var getGloabalInstance = function(GlobalConfigType) {
		return (new GlobalConfig(GlobalConfigType));
	};
	return {
		getGloabalInstance: getGloabalInstance
	};
}]);