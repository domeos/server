/*!
 *
 * @description : business service module of domeAPP
 *
 * @create date : 2015.08
 * @module : domeService
 * @version : 0.1
 * 
 */

// 应用商店service
domeApp.factory('$domeAppStore', ['$http', '$domeDeploy', function($http, $domeDeploy) {
		var getStoreApps = function() {
			return $http.get('http://app-domeos.bjctc.scs.sohucs.com/apps.json', {
				'notIntercept': true
			});
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
	// 全局配置service
	.factory('$domeGlobal', ['$http', '$domePublic', '$q', function($http, $domePublic, $q) {
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