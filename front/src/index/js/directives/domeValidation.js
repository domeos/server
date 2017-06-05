/*
 * @author ChandraLee
 * @description 控制台验证指令：用户验证表单
 */

(function(domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;
    // 验证数字是否超过大小
    // <input ng-model="modelNumber" is-over max="10" min="1">
    domeApp.directive('isOver', function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, iElement, iAttrs, controller) {
                    scope.$watch(function() {
                        return {
                            max: iAttrs.max,
                            min: iAttrs.min,
                            model: controller.$modelValue
                        };
                    }, function(newValue) {
                        var max = newValue.max,
                            min = newValue.min;
                        var isValidMax = false,
                            isValidMin = false;
                        if (isNaN(max) || !isNaN(max) && parseFloat(newValue.model) <= parseFloat(max)) {
                            isValidMax = true;
                        }
                        if (isNaN(min) || !isNaN(min) && parseFloat(newValue.model) >= parseFloat(min)) {
                            isValidMin = true;
                        }
                        if (isValidMax && isValidMin) {
                            controller.$setValidity('isOver', true);
                        } else {
                            controller.$setValidity('isOver', false);
                        }
                    }, true);
                }
            };
        })
        // 验证项目是否存在
        .directive('isProjectExist', ['$domeProject', function($domeProject) {
            return {
                require: 'ngModel',
                scope: {
                    collection: '='
                },
                link: function(scope, iElm, iAttrs, controller) {
                    var projects = {};
                    $domeProject.projectService.getProject(scope.collection).then(function(res) {
                        var data = res.data.result || [],
                            groupName = iAttrs.groupName;
                        for (var i = 0, l = data.length; i < l; i++) {
                            projects[data[i].name] = 1;
                        }

                        function validation(viewValue) {
                            var thisProname = groupName + '/' + viewValue;
                            if (projects[thisProname] === 1) {
                                controller.$setValidity('isProjectExist', false);
                            } else {
                                controller.$setValidity('isProjectExist', true);
                            }
                            return viewValue;
                        }
                        scope.$watch(function() {
                            return iAttrs.groupName;
                        }, function(newValue) {
                            if (newValue) {
                                groupName = newValue;
                            }
                            validation(controller.$modelValue);
                        });
                        controller.$parsers.unshift(validation);
                    });
                }
            };
        }])
        // 验证用户是否存在
        .directive('isUserExist', function() {
            return {
                require: 'ngModel',
                scope: {
                    userList: '=isUserExist'
                },
                link: function(scope, element, attrs, controller) {
                    controller.$parsers.unshift(function(viewValue) {
                        if (scope.userList) {
                            for (var i = 0, l = scope.userList.length; i < l; i++) {
                                if (scope.userList[i].username === viewValue) {
                                    controller.$setValidity('isUserExist', false);
                                    return void 0;
                                }
                            }
                        }
                        controller.$setValidity('isUserExist', true);
                        return viewValue;
                    });
                }
            };
        })
        // 验证集群（Cluster）是否存在
        .directive('isClusterExist', function() {
            return {
                require: 'ngModel',
                scope: {
                    clusterList: '='
                },
                link: function(scope, element, attrs, controller) {
                    controller.$parsers.unshift(function(viewValue) {
                        if (scope.clusterList) {
                            for (var i = 0, l = scope.clusterList.length; i < l; i++) {
                                if (scope.clusterList[i].name === viewValue) {
                                    controller.$setValidity('isClusterExist', false);
                                    return void 0;
                                }
                            }
                        }
                        controller.$setValidity('isClusterExist', true);
                        return viewValue;
                    });
                }
            };
        })
        // 验证api server是否存在
        .directive('isApiServerExist', function() {
            return {
                require: 'ngModel',
                scope: {
                    clusterList: '=',
                    currentCluster: '@'
                },
                link: function(scope, element, attrs, controller) {
                    controller.$parsers.unshift(function(viewValue) {
                        if (scope.clusterList) {
                            for (var i = 0, l = scope.clusterList.length; i < l; i++) {
                                if (scope.currentCluster !== scope.clusterList[i].name && scope.clusterList[i].api === viewValue) {
                                    controller.$setValidity('isApiServerExist', false);
                                    return void 0;
                                }
                            }
                        }
                        controller.$setValidity('isApiServerExist', true);
                        return viewValue;
                    });
                }
            };
        })
        // 验证部署（DeployName）是否存在
        .directive('isDeployExist', ['$domeDeploy', function($domeDeploy) {
            return {
                require: 'ngModel',
                scope: {
                    collection: "="
                },
                link: function(scope, iElm, iAttrs, controller) {
                    var deployList = [],
                        namespace = iAttrs.namespace,
                        clustername = iAttrs.clustername;
                    $domeDeploy.deployService.getListByCollectionId(scope.collection).then(function(res) {
                        deployList = res.data.result || [];
                    });
                    scope.$watch(function() {
                        return {
                            namespace: iAttrs.namespace,
                            clustername: iAttrs.clustername
                        };
                    }, function(newValue) {
                        namespace = newValue.namespace;
                        clustername = newValue.clustername;
                        validate(controller.$modelValue);
                    }, true);

                    function validate(viewValue) {
                        for (var i = 0, l = deployList.length; i < l; i++) {
                            if (deployList[i].clusterName === clustername && deployList[i].namespace === namespace && deployList[i].deployName === viewValue) {
                                controller.$setValidity('isDeployExist', false);
                                return viewValue;
                            }
                        }
                        controller.$setValidity('isDeployExist', true);
                        return viewValue;
                    }
                    controller.$parsers.unshift(validate);
                }
            };
        }])
        .directive('isDeployNameExist', ['$domeCluster', function($domeCluster) {
            return {
                require: 'ngModel',
                link: function(scope, iElm, iAttrs, controller) {
                    var deployList = [];
                    $domeCluster.getInstance('ClusterService').getDeployList().then((res) => {
                        deployList = res.data.result || [];
                    })
                    controller.$parsers.unshift(function(viewValue) {
                        for (var i = 0, l = deployList.length; i < l; i++) {
                            if (deployList[i].deployName === viewValue) {
                                controller.$setValidity('isDeployNameExist', false);
                                return viewValue;
                            }
                        }
                        controller.$setValidity('isDeployNameExist', true);
                        return viewValue;
                    });
                }
            }
        }])
        // 验证集群下的namespace是否存在
        // <input ng-model="modelNumber" is-namespace-exist clusterid="12">
        .directive('isNamespaceExist', ['$domeCluster', function($domeCluster) {
            return {
                require: 'ngModel',
                link: function(scope, iElm, iAttrs, controller) {
                    var namespaceList = [];
                    var getNamespace = $domeCluster.getInstance('ClusterService').getNamespace;
                    scope.$watch(function() {
                        return iAttrs.clusterid;
                    }, function(newValue) {
                        getNamespace(newValue).then(function(res) {
                            namespaceList = res.data.result || [];
                        });
                    });
                    controller.$parsers.unshift(function(viewValue) {
                        for (var i = 0, l = namespaceList.length; i < l; i++) {
                            if (namespaceList[i].name === viewValue) {
                                controller.$setValidity('isNamespaceExist', false);
                                return viewValue;
                            }
                        }
                        controller.$setValidity('isNamespaceExist', true);
                        return viewValue;
                    });
                }
            };
        }])
        // 验证组（group）是否存在
        .directive('isGroupExist', ['$domeUser', function($domeUser) {
            return {
                require: 'ngModel',
                link: function(scope, iElm, iAttrs, controller) {
                    var groupMap = {};
                    $domeUser.userService.getGroup().then(function(res) {
                        var groupList = res.data.result || [];
                        for (var i = 0, l = groupList.length; i < l; i++) {
                            groupMap[groupList[i].name] = 1;
                        }
                    });
                    controller.$parsers.unshift(function(viewValue) {
                        if (groupMap[viewValue]) {
                            controller.$setValidity('isGroupExist', false);
                        } else {
                            controller.$setValidity('isGroupExist', true);
                        }
                        return viewValue;
                    });
                }
            };
        }])
        // 验证报警模板是否存在
        .directive('isAlarmTemplateExist', ['$domeAlarm', function($domeAlarm) {
            return {
                require: 'ngModel',
                scope: {
                    selfName: '@'
                },
                link: function(scope, iElm, iAttrs, controller) {
                    var alarmMap = {};
                    var alarmService = $domeAlarm.getInstance('AlarmService');
                    alarmService.getData().then(function(res) {
                        var alarmList = res.data.result || [];
                        for (var i = 0, l = alarmList.length; i < l; i++) {
                            alarmMap[alarmList[i].templateName] = 1;
                        }
                    });
                    controller.$parsers.unshift(function(viewValue) {
                        if (scope.selfName && scope.selfName === viewValue) {
                            controller.$setValidity('isAlarmTemplateExist', true);
                        } else {
                            if (alarmMap[viewValue]) {
                                controller.$setValidity('isAlarmTemplateExist', false);
                            } else {
                                controller.$setValidity('isAlarmTemplateExist', true);
                            }
                        }
                        return viewValue;
                    });
                }
            };
        }])
        // 验证tag是否存在
        .directive('isTagExist', function() {
            return {
                require: 'ngModel',
                scope: {
                    baseImages: '=baseimages',
                    imageName: '=imagename'
                },
                link: function(scope, iElm, iAttrs, controller) {
                    function validation(viewValue) {
                        var isExist = false;
                        if (scope.imageName && scope.baseImages) {
                            for (var i = 0, l = scope.baseImages.length; i < l; i++) {
                                if (scope.baseImages[i].imageName === scope.imageName && scope.baseImages[i].imageTag === viewValue) {
                                    isExist = true;
                                    break;
                                }
                            }
                        }
                        controller.$setValidity('isTagExist', !isExist);
                        return viewValue;
                    }

                    scope.$watch(function() {
                        return scope.imageName;
                    }, function() {
                        validation(controller.$modelValue);
                    });

                    controller.$parsers.unshift(validation);
                }
            };
        })
        .directive('isHostgroupExist', function() {
            return {
                require: 'ngModel',
                scope: {
                    hostgroupList: '='
                },
                link: function(scope, iElm, iAttrs, controller) {

                    controller.$parsers.unshift(function(viewValue) {
                        for (var i = 0, l = scope.hostgroupList.length; i < l; i++) {
                            if (viewValue === scope.hostgroupList[i].hostGroupName) {
                                controller.$setValidity('isHostgroupExist', false);
                                return viewValue;
                            }
                        }
                        controller.$setValidity('isHostgroupExist', true);
                        return viewValue;
                    });
                }
            };
        })
        .directive('diyPattern', function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    pattern: '=diyPattern'
                },
                link: function(scope, element, attrs, controller) {
                    function validation(viewValue) {
                        viewValue = viewValue || '';
                        if (scope.pattern) {
                            var reg = new RegExp(scope.pattern);
                            controller.$setValidity('diyPattern', reg.test(viewValue));
                            return viewValue;
                        } else {
                            controller.$setValidity('diyPattern', true);
                            return viewValue;
                        }
                    }
                    controller.$parsers.unshift(validation);
                    scope.$watch(function() {
                        return scope.pattern;
                    }, function() {
                        validation(controller.$modelValue);
                    });
                }
            };
        })
        // 动态设置是否必填并验证必填
        // <input ng-model="modelNumber" is-required param1="{{model1}}" param2="{{model2}}"...>
        // 只要其中一个param有数据则需要验证必填
        .directive('isRequired', [function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, iElement, iAttrs, controller) {
                    var params = [];
                    var needValid = false;
                    angular.forEach(iAttrs, function(value, key) {
                        if (key.indexOf('param') !== -1) {
                            params.push(key);
                        }
                    });
                    scope.$watch(function() {
                        var watchParams = {};
                        for (var i = 0, l = params.length; i < l; i++) {
                            watchParams[params[i]] = iAttrs[params[i]];
                        }
                        return {
                            watchParams: watchParams,
                            model: controller.$modelValue
                        };
                    }, function(newValue) {
                        needValid = false;
                        angular.forEach(newValue.watchParams, function(value) {
                            if (value && value !== 'false') {
                                needValid = true;
                            }
                        });
                        if (!needValid || needValid && newValue.model) {
                            controller.$setValidity('isRequired', true);
                        } else {
                            controller.$setValidity('isRequired', false);
                        }
                    }, true);
                }
            };
        }])
        .directive('isProjectCollectionExist', ['$domeProjectCollection', function($domeProjectCollection) {
            return {
                require: 'ngModel',
                link: function(scope, iElm, iAttrs, controller) {
                    var collectionMap = {};
                    $domeProjectCollection.projectCollectionService.getProjectCollection().then(function(res) {
                        var collectionList = res.data.result || [];
                        for (var i = 0, l = collectionList.length; i < l; i++) {
                            collectionMap[collectionList[i].name] = 1;
                        }
                    });
                    controller.$parsers.unshift(function(viewValue) {
                        if (collectionMap[viewValue]) {
                            controller.$setValidity('isProjectCollectionExist', false);
                        } else {
                            controller.$setValidity('isProjectCollectionExist', true);
                        }
                        return viewValue;
                    });
                }
            };
        }])
        .directive('isDeployCollectionExist', ['$domeDeployCollection', function($domeDeployCollection) {
            return {
                require: 'ngModel',
                link: function(scope, iElm, iAttrs, controller) {
                    var collectionMap = {};
                    $domeDeployCollection.deployCollectionService.getDeployCollection().then(function(res) {
                        var collectionList = res.data.result || [];
                        for (var i = 0, l = collectionList.length; i < l; i++) {
                            collectionMap[collectionList[i].name] = 1;
                        }
                    });
                    controller.$parsers.unshift(function(viewValue) {
                        if (collectionMap[viewValue]) {
                            controller.$setValidity('isDeployCollectionExist', false);
                        } else {
                            controller.$setValidity('isDeployCollectionExist', true);
                        }
                        return viewValue;
                    });
                }
            };
        }])
})(window.domeApp);
