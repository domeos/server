/*
 * @author ChandraLee
 * @description domeos应用商店服务、全局配置服务
 */

(function (domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;
    // 应用商店service
    domeApp.factory('$domeAppStore', ['$http', '$domeDeploy', function ($http, $domeDeploy) {
            var getStoreApps = function () {
                return $http.get('//app-domeos.bjctc.scs.sohucs.com/apps.json', {
                    'notIntercept': true
                });
            };
            // App Class 单个应用
            var AppInfo = function () {};
            AppInfo.prototype = {
                init: function (info) {
                    this.config = info;
                    this.formartToDeploy();
                },
                // 得到对应的部署结构体
                formartToDeploy: function () {
                    var deployObj = {};
                    deployObj = angular.copy(this.config.deploymentTemplate);
                    deployObj.deployName = this.config.appName + parseInt(Math.random() * 10000);
                    this.deployIns = $domeDeploy.getInstance('Deploy', deployObj);
                }
            };
            var getInstance = function (className, initInfo) {
                var ins;
                switch (className) {
                case 'AppInfo':
                    ins = new AppInfo();
                    break;
                default:
                    ins = {};
                    ins.init = function () {
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
        .factory('$domeGlobal', ['$http', 'dialog', '$q', function ($http, dialog, $q) {
            var GlobalConfig = function (type) {
                var _url = (function () {
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
                    case 'gitUser':
                        url = '/api/global/gitconfig/user';
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
                })();
                var _isFirstSet = true;
                this.getData = function () {
                    var deferred = $q.defer();
                    $http.get(_url).then(function (res) {
                        if (!res.data.result || type == 'git' && res.data.result.length === 0) {
                            deferred.reject();
                        } else {
                            _isFirstSet = false;
                            deferred.resolve(res.data.result);
                        }
                    }, function (res) {
                        deferred.reject(res.data.resultMsg);
                    });
                    return deferred.promise;
                };
                this.modifyData = function (info) {
                    var self = this,
                        deferred = $q.defer();
                    var modifySuccess = function (content) {
                        if (type !== 'cluster') {
                            dialog.alert('提示', content);
                        }
                    };
                    var optFailed = function (errMsg) {
                        dialog.error( '保存失败！','Message:' + errMsg);
                    };
                    if(type === 'git' && info.id !== undefined) {
                        _isFirstSet = false;
                    }
                    if (_isFirstSet || type === 'registry') {
                        $http.post(_url, angular.toJson(info)).then(function (res) {
                            _isFirstSet = false;
                            modifySuccess('添加成功！');
                            deferred.resolve(res.data.result);
                        }, function (res) {
                            optFailed(res.data.resultMsg);
                            deferred.reject();
                        });
                    } else {
                        $http.put(_url, angular.toJson(info)).then(function (res) {
                            modifySuccess('保存成功！');
                            deferred.resolve(res.data.result);
                        }, function (res) {
                            optFailed(res.data.resultMsg);
                            deferred.reject();
                        });
                    }
                    return deferred.promise;
                };
                this.deleteData = function(id){
                    return $http.delete(_url +'/'+ id);
                };
            };
            var getGloabalInstance = function (GlobalConfigType) {
                return new GlobalConfig(GlobalConfigType);
            };
            return {
                getGloabalInstance: getGloabalInstance
            };
        }]);
})(angular.module('domeApp'));