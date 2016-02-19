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
 				}, function(newValue, oldValue) {
 					var max = newValue.max,
 						min = newValue.min;
 					var isValidMax = false,
 						isValidMin = false;
 					if (isNaN(max) || (!isNaN(max) && (parseFloat(newValue.model) <= parseFloat(max)))) {
 						isValidMax = true;
 					}
 					if (isNaN(min) || (!isNaN(min) && (parseFloat(newValue.model) >= parseFloat(min)))) {
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
 			link: function(scope, iElm, iAttrs, controller) {
 				var projects = {};
 				$domeProject.getProjectList().then(function(res) {
 					var data = res.data.result,
 						groupName = iAttrs.groupName;
 					for (var i = 0; i < data.length; i++) {
 						projects[data[i].projectName] = 1;
 						// projects.push(data[i].projectName);
 					}
 					scope.$watch(function() {
 						return iAttrs.groupName;
 					}, function(newValue) {
 						if (newValue) {
 							groupName = newValue;
 						}
 					});
 					controller.$parsers.unshift(function(viewValue) {
 						var thisProname = groupName + '/' + viewValue;
 						if (projects[thisProname] === 1) {
 							controller.$setValidity('isProjectExist', false);
 						} else {
 							controller.$setValidity('isProjectExist', true);
 						}
 						return viewValue;
 					});
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
 					for (var i = 0; i < scope.userList.length; i++) {
 						if (scope.userList[i].username === viewValue) {
 							controller.$setValidity('isUserExist', false);
 							return undefined;
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
 					for (var i = 0; i < scope.clusterList.length; i++) {
 						if (scope.clusterList[i].name === viewValue) {
 							controller.$setValidity('isClusterExist', false);
 							return undefined;
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
 					for (var i = 0; i < scope.clusterList.length; i++) {
 						if (scope.currentCluster !== scope.clusterList[i].name && scope.clusterList[i].api === viewValue) {
 							controller.$setValidity('isApiServerExist', false);
 							return undefined;
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
 			link: function(scope, iElm, iAttrs, controller) {
 				var deployList = [],
 					namespace = iAttrs.namespace,
 					clustername = iAttrs.clustername;
 				$domeDeploy.getDeployList().then(function(res) {
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
 					for (var i = 0; i < deployList.length; i++) {
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
 	// 验证集群下的namespace是否存在
 	// <input ng-model="modelNumber" is-namespace-exist clusterid="12">
 	.directive('isNamespaceExist', ['$domeCluster', function($domeCluster) {
 		return {
 			require: 'ngModel',
 			link: function(scope, iElm, iAttrs, controller) {
 				var namespaceList = [];
 				scope.$watch(function() {
 					return iAttrs.clusterid;
 				}, function(newValue) {
 					$domeCluster.getNamespace(newValue).then(function(res) {
 						namespaceList = res.data.result || [];
 					});
 				});
 				controller.$parsers.unshift(function(viewValue) {
 					for (var i = 0; i < namespaceList.length; i++) {
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
 				$domeUser.getGroup().then(function(res) {
 					var groupList = res.data.result;
 					if (groupList) {
 						for (var i = 0; i < groupList.length; i++) {
 							groupMap[groupList[i].name] = 1;
 						}
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
 	// 验证tag是否存在
 	.directive('isTagExist', function() {
 		return {
 			require: 'ngModel',
 			scope: {
 				baseImages: '=baseimages',
 				imageName: '=imagename'
 			},
 			link: function(scope, iElm, iAttrs, controller) {

 				scope.$watch(function() {
 					return scope.imageName;
 				}, function(newValue) {
 					controller.$parsers[0]();
 				});

 				controller.$parsers.unshift(function(viewValue) {
 					var isExist = false;
 					if (scope.imageName && scope.imageName !== '' && scope.baseImages) {
 						for (var i = 0; i < scope.baseImages.length; i++) {
 							if (scope.baseImages[i].imageName === scope.imageName && scope.baseImages[i].imageTag === viewValue) {
 								isExist = true;
 								break;
 							}
 						}
 					}
 					controller.$setValidity('isTagExist', !isExist);
 					return viewValue;
 				});
 			}
 		};
 	})
 	// 验证不等于某个字符串。eg:<input not-equal="equalModel">
 	.directive('notEqual', function() {
 		return {
 			restrict: 'A',
 			require: 'ngModel',
 			scope: {
 				notEqual: '=notEqual'
 			},
 			link: function(scope, element, attrs, controller) {
 				controller.$parsers.unshift(function(viewValue) {
 					var isEqual = scope.notEqual.toString() === viewValue;
 					controller.$setValidity('notEqual', !isEqual);
 					return viewValue;
 				});
 			}
 		};
 	})
 	// 验证等于某个字符串。eg:<input equal="equalModel">
 	.directive('equal', function() {
 		return {
 			restrict: 'A',
 			require: 'ngModel',
 			scope: {
 				equal: '=equal'
 			},
 			link: function(scope, element, attrs, controller) {
 				controller.$parsers.unshift(function(viewValue) {
 					var isEqual = scope.equal.toString() === viewValue;
 					controller.$setValidity('equal', isEqual);
 					return viewValue;
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
 					for (var i = 0; i < params.length; i++) {
 						watchParams[params[i]] = iAttrs[params[i]];
 					}
 					return {
 						watchParams: watchParams,
 						model: controller.$modelValue
 					};
 				}, function(newValue, oldValue) {
 					needValid = false;
 					angular.forEach(newValue.watchParams, function(value, key) {
 						if (value && value !== '' && value !== 'false') {
 							needValid = true;
 						}
 					});
 					if (!needValid || needValid && newValue.model !== '') {
 						controller.$setValidity('isRequired', true);
 					} else {
 						controller.$setValidity('isRequired', false);
 					}
 				}, true);
 			}
 		};
 	}]);