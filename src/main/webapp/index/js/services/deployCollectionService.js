'use strict';
/*
 * @author ChandraLee
 * @description 服务组模块 service
 */

(function (domeApp, undefined) {
    if (typeof domeApp === 'undefined') return;
    domeApp.factory('$domeDeployCollection', ['$http', '$q', '$domePublic', '$domeGlobal', '$domeModel', function ($http, $q, $domePublic, $domeGlobal, $domeModel) {
        var _url = '/api/deploycollection'
        var deployCollectionService = {
           
            createDeployCollection: function createDeployCollection(deployCollectionData) {
                return $http.post(_url, angular.toJson(deployCollectionData));
            },
            getDeployCollection: function getDeployCollection() {
                return $http.get(_url);
            },
            deleteDeployCollection: function deleteDeployCollection(deployCollectionId) {
                return $http.delete(_url +'/'+ deployCollectionId);
            },
            updateDeployCollectionDescription: function updateDeployCollectionDescription(newDeployCollection) {
                return $http.put(_url + '/' + newDeployCollection.id, angular.toJson(newDeployCollection));
            },
            migrateDeploy: function migrateDeploy(deployId,collectionId) {
                return $http.get('/api/deploy/migrate/' + deployId + '/' + collectionId);
            },
        };
        var deleteDeployCollection = function deleteDeployCollection(deployCollectionId) {
            var deferred = $q.defer();
            $domePublic.openDelete().then(function () {
                deployCollectionService.deleteDeployCollection(deployCollectionId).then(function () {
                    deferred.resolve();
                }, function (res) {
                    deferred.reject();
                    $domePublic.openWarning({
                            title: '删除失败！',
                            msg: res.data.resultMsg
                        });
                });
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        };
        return {
            deployCollectionService: deployCollectionService,
            deleteDeployCollection: deleteDeployCollection
        };
    }]);
})(window.domeApp);
