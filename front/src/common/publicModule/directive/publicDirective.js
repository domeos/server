/*
 * @author ChandraLee
 * @description 公共模块——公共指令
 */

(function (window, publicModule, undefined) {
	// 下拉选择框
	// <div class="com-select-con" select-con>
	// 		<button class="ui-btn ui-btn-select ui-btn-white"><i class="icon-down"></i>{{deployIns.config.version?'version'+deployIns.config.version:'选择版本'}}</button>
	// 		<ul class="select-list">
	// 			<li ng-repeat="version in deployIns.versionList" class="select-item"><a ng-click="toggleVersion(version.version)" ng-cloak="ng-cloak">version{{version.version}}</a></li>
	// 		</ul>
	// </div>

	// 输入框多选控件
	//		<div label="true" class="com-select-con line-element" select-con>
	// 		 // 已选项
	//        <ul class="selected-labels">
	//          <li ng-repeat="user in selectedUsers" ng-cloak="ng-cloak" class="select-label">{{user.username}}<a ng-click="cancelUser($index)" class="icon-cancel"></a></li>
	//          <li class="select-input">
	//            <input placeholder="搜索成员" ng-model="userKey.key" ng-keydown="userKeyDown($event,userKey.key,userListFiltered[0])" class="line-element btn-select"/>
	//          </li>
	//        </ul>
	// 		// 下拉列表
	//       <ul class="select-list">
	//         <li ng-if="!userList||userListFiltered.length===0"><a>无相关用户信息</a></li>
	//          <li ng-repeat="user in userListFiltered=(userList| filter:{'username':userKey.key})" class="select-item"><a ng-bind="user.username" ng-click="selectUser(user.id,user.username);"></a></li>
	//        </ul>
	//   	</div>

	// .ui-btn-select： 触发下拉的标签，可以为按钮或者表单元素
	// .drop： 箭头图标是否跟着下拉列表一起变化
	// label="true"： 输入框多选控件
	publicModule.directive('selectCon', ['$document', function ($document) {
			'use strict';
			return {
				restrict: 'AEC',
				scope: true,
				transclude: true,
				replace: true,
				template: '<div ng-transclude></div>',
				controller: ['$scope', function ($scope) {
					this.hideSelect = function () {
						$scope.hideSelect();
					};
				}],
				link: function (scope, element, attrs) {
					var dropEle = element.find('.select-list'),
						selectEle = element.find('.ui-btn-select'),
						iconEle = element.find('.drop'),
						showSelect = false;
					if (selectEle.length === 0) {
						return;
					}
					dropEle.hide();
					selectEle.on('blur', blurFun);
					var toggleShowDropList = function (isShowSelect) {
						showSelect = isShowSelect !== undefined ? isShowSelect : !showSelect;
						if (showSelect === true) {
							dropEle.show();
							iconEle.removeClass('fa-angle-right').addClass('fa-angle-down');
						} else if (showSelect === false) {
							dropEle.hide();
							iconEle.removeClass('fa-angle-down').addClass('fa-angle-right');
						}
					};
					var blurFun = function (event) {
						toggleShowDropList(false);
						return event.stopPropagation();
					};
					selectEle.on('blur', blurFun);
                    var dropDownEventHandler = function(event) {
                        var target = event.target;
                        if(dropEle.find(target).length === 0 && target.className != 'select-list') {
                            toggleShowDropList(false);
                        }
                        $document.off('click', dropDownEventHandler);
                    };
					dropEle.on('mouseenter', function () {
						selectEle.off('blur', blurFun);
					}).on('mouseleave', function () {
						selectEle.on('blur', blurFun);
						if(attrs.multicheckbox == 'true') {
                            $document.on('click', dropDownEventHandler);
                        }
					});
					if (selectEle[0].tagName === 'INPUT') {
						selectEle.on('focus', function () {
							toggleShowDropList(true);
						});
					} else {
						selectEle.on('click', function () {
							toggleShowDropList();
						});
					}
					if (attrs.label == 'true') {
						element.on('click', function () {
							selectEle.focus();
						});
						// 获得焦点时拉长输入框，失去焦点时还原
						selectEle.bind('focus', function (event) {
							selectEle.width(element.width() - 20 - selectEle.position().left);
							event.stopPropagation();
						}).bind('blur', function () {
							selectEle.width(120);
						});
					}
					scope.hideSelect = function () {
						toggleShowDropList(false);
					};
				}
			};
		}])
		.directive('selectItem', ['$compile', function ($compile) {
			'use strict';
			return {
				restrict: 'AEC',
				require: '^?selectCon',
				link: function (scope, element, attrs, controller) {
					scope.hideSelect = function () {
						controller.hideSelect();
					};
					var linkEle = angular.element(attrs.$$element.find('>a')[0]);
					var clickEvent = linkEle.attr('ng-click');
					if (!clickEvent) {
						clickEvent = 'hideSelect($event.stopPropagation())';
					} else {
						clickEvent += ';hideSelect($event.stopPropagation());';
					}
					linkEle.attr('ng-click', clickEvent);
					element.html($compile(element.html())(scope));
				}
			};
		}]).directive('loading', function () {
			'use strict';
			return {
				restrict: 'AE',
				template: '<div class="com-loading"><div class="dot1"></div><div class="dot2"></div></div>',
				replace: true
			};
		}).directive('domeRadio', function () {
			'use strict';
			return {
				restrict: 'E',
				scope: {
					radioModel: '=dModel',
					label: '@dLabel',
					name: '@dName',
					id: '@dId',
					disabled: '@dDisabled',
					value: '@dValue',
					changeEvent: '&dChange'
				},
				replace: true,
				template: '<span><input id="{{id}}" type="radio" name="{{name}}" class="ui-radio" ng-value="{{value}}" ng-model="radioModel" ng-change="changeEvent({model:radioModel})" ng-disabled="{{disabled}}"/><label ng-bind="label" for="{{id}}"></label></span>'
			};
		}).directive('domeCheck', function () {
			'use strict';
			return {
				restrict: 'E',
				scope: {
					checkModel: '=ngModel',
					label: '@dLabel',
					name: '@dName',
					id: '@dId',
					trueValue: '@dTrueValue',
					falseValue: '@dFalseValue',
					changeEvent: '&dChange'
				},
				replace: true,
				template: '<span><input id="{{id}}" type="checkbox" name="{{name}}" class="ui-check" ng-true-value="{{trueValue||true}}"  ng-false-value="{{falseValue||false}}" ng-model="checkModel" ng-change="changeEvent({model:checkModel})" /><label ng-bind="label" for="{{id}}"></label></span>'
			};
		}).directive('domePrompt',function () {
			return{
				restrict: 'AE',
				scope:{
					content: '@'
				},
				replace: true,
				template: '<p class="txt-prompt"><i class="fa fa-info-circle" style="margin-right: 0.8em;"></i>{{content}}</p>'
			};
    	});

	/**
	 * 验证指令
	 */

	// 验证不等于某个字符串。eg:<input not-equal="equalModel">
	publicModule.directive('notEqual', function () {
			return {
				restrict: 'A',
				require: 'ngModel',
				scope: {
					notEqual: '=notEqual'
				},
				link: function (scope, element, attrs, controller) {
					controller.$parsers.unshift(function (viewValue) {
						var isEqual = scope.notEqual === undefined ? false : scope.notEqual.toString() === viewValue;
						controller.$setValidity('notEqual', !isEqual);
						return viewValue;
					});
				}
			};
		})
		// 验证等于某个字符串。eg:<input equal="equalModel">
		.directive('equal', function () {
			return {
				restrict: 'A',
				require: 'ngModel',
				scope: {
					equal: '=equal'
				},
				link: function (scope, element, attrs, controller) {
					controller.$parsers.unshift(function (viewValue) {
						var isEqual = scope.equal === undefined ? true : scope.equal.toString() === viewValue;
						controller.$setValidity('equal', isEqual);
						return viewValue;
					});
				}
			};
		});
})(window, window.publicModule || {});