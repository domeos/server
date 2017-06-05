'use strict';
/*
 * @author ChandraLee
 * @description 项目组模块
 */

(function (domeApp, undefined) {
    if (typeof domeApp === 'undefined') return;
    domeApp.factory('$domeProjectCollection', ['$http', '$q', 'dialog', '$domeGlobal', '$domeModel', function ($http, $q, dialog, $domeGlobal, $domeModel) {
        var projectCollectionService = {
            createProjectCollection: function createProjectCollection(projectCollectionData) {
                return $http.post('/api/projectcollection', angular.toJson(projectCollectionData));
            },
            getProjectCollection: function getProjectCollection() {
                return $http.get('/api/projectcollection');
            },
            deleteProjectCollection: function deleteProjectCollection(projectCollectionId) {
                return $http.delete('/api/projectcollection/' + projectCollectionId);
            },
            getProjectCollectionProject: function getProjectCollectionProject(projectCollectionId) {
                return $http.get('/api/projectcollection/' + projectCollectionId + '/project');
            },
            updateProjectCollectionDescription: function updateProjectCollectionDescription (projectCollection) {
                return $http.put('/api/projectcollection/', angular.toJson(projectCollection));
            }

        };
        var deleteProjectCollection = function deleteProjectCollection(projectCollectionId) {
            var deferred = $q.defer();
            dialog.danger('确认删除', '确认要删除吗？').then(button => { if (button !== dialog.button.BUTTON_OK) throw '' }).then(function () {
                projectCollectionService.deleteProjectCollection(projectCollectionId).then(function () {
                    deferred.resolve();
                }, function () {
                    deferred.reject();
                    dialog.error('警告', '删除失败！');
                });
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        };
        return {
            projectCollectionService: projectCollectionService,
            deleteProjectCollection: deleteProjectCollection
        };
    }]);
})(angular.module('domeApp'));
