'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

;(function (pageLayout) {

  pageLayout.component('pageContainer', {
    template: '\n      <div class="page-container new-layout" ng-transclude></div>\n    ',
    transclude: true,
    bindings: {},
    controller: [function () {}]
  });

  pageLayout.component('pageSummaryBox', {
    template: '\n      <div class="page-summary-box">\n        <div class="page-summary-box-content" ng-transclude></div>\n      </div>\n    ',
    transclude: true,
    bindings: {},
    controller: [function () {}]
  });

  pageLayout.component('pageSummaryLogo', {
    template: '\n      <div class="page-summary-logo">\n        <div class="page-summary-logo-wrapper">\n          <img ng-src="{{ $ctrl.fallback }}" ng-if="$ctrl.fallback" />\n          <img ng-src="{{ $ctrl.logo }}" onerror="this.style.display = \'none\'" onload="this.style.display = \'block\'" />\n        </div>\n      </div>\n    ',
    bindings: {
      logo: '@',
      fallback: '@?'
    },
    controller: [function () {}]
  });

  pageLayout.component('pageSummaryItem', {
    template: '\n      <div class="page-summary-item">\n        <div class="page-summary-item-title" ng-bind="$ctrl.text"></div>\n        <div class="page-summary-item-content" ng-transclude></div>\n      </div>\n    ',
    transclude: true,
    bindings: {
      text: '@'
    },
    controller: [function () {}]
  });

  pageLayout.component('pageSummaryContent', {
    template: '\n      <div class="page-summary-content-container">\n        <div class="page-summary-content" ng-transclude></div>\n      </div>\n    ',
    transclude: true,
    bindings: {},
    controller: [function () {}]
  });

  pageLayout.directive('pageContentBox', ['$parse', function ($parse) {
    return {
      template: '\n        <div class="page-content-box">\n          <ul class="page-tab-list" ng-if="_$tabs && _$tabs.length">\n            <li class="page-tab-item" ng-repeat="tab in _$tabs" ng-class="{ \'page-tab-item-active\': _$currentPage().page === tab.page }">\n              <a ui-sref="{ page: tab.page }" ng-click="_$gotoPage(tab); $event.stopPropagation()" ng-bind="tab.text"></a>\n            </li>\n          </ul>\n          <div class="page-content-container" ng-if="!_$tabs || !_$tabs.length" ng-transclude></div>\n          <div class="page-content-tab-container"  ng-if="_$tabs && _$tabs.length">\n            <div class="page-content-container" ng-repeat="tab in _$tabs" ng-if="_$loadedPages.indexOf(tab.page) !== -1" ng-show="_$currentPage().page === tab.page" ng-include="tab.html"></div>\n          </div>\n        </div>\n      ',
      scope: true,
      transclude: true,
      link: function link($scope, $element, $attrs) {
        var tabs = $parse($attrs.tabs);
        $scope._$tabs = tabs();
        $scope.$watch(tabs, function () {
          $scope._$tabs = tabs();
        });
      },
      controller: ['$state', '$scope', function ($state, $scope) {
        $scope._$loadedPages = [];
        $scope._$currentPage = function () {
          var tab = function () {
            var page = $state.params.page;
            var match = ($scope._$tabs || []).filter(function (tab) {
              return tab.page === page;
            });
            if (match.length) return match[0];
            var perfer = ($scope._$tabs || []).filter(function (tab) {
              return tab.default;
            });
            if (perfer.length) return perfer[0];
            var empty = ($scope._$tabs || []).filter(function (tab) {
              return tab.page === '';
            });
            if (empty.length) return empty[0];
            return $scope._$tabs[0];
          }();
          if ($scope._$loadedPages.indexOf(tab.page) === -1) {
            $scope._$loadedPages.push(tab.page);
          }
          return tab;
        };
        $scope._$gotoPage = function (tab) {
          $state.go($state.current.name, { page: tab.page }, { notify: false });
        };
      }]
    };
  }]);

  pageLayout.factory('dialog', ['api', '$compile', '$rootScope', function (api, $compile, $rootScope) {
    var dialog = {};

    dialog.button = {
      BUTTON_OK: 1 << 0,
      BUTTON_YES: 1 << 1,
      BUTTON_NO: 1 << 2,
      BUTTON_RETRY: 1 << 3,
      BUTTON_ABORT: 1 << 4,
      BUTTON_IGNORE: 1 << 5,
      BUTTON_CANCEL: 1 << 7
    };

    // 尽量使用这里预设的选项
    // 如果这些项目不够使用，请使用上面的 dialog.button ，用或连接;
    dialog.buttons = {
      BUTTON_OK_ONLY: dialog.button.BUTTON_OK,
      BUTTON_OK_CANCEL: dialog.button.BUTTON_OK | dialog.button.BUTTON_CANCEL,
      BUTTON_YES_NO: dialog.button.BUTTON_YES | dialog.button.BUTTON_NO,
      BUTTON_YES_NO_CANCEL: dialog.button.BUTTON_YES | dialog.button.BUTTON_NO | dialog.button.BUTTON_CANCEL,
      BUTTON_RETRY_CANCEL: dialog.button.BUTTON_RETRY | dialog.button.BUTTON_CANCEL,
      BUTTON_ABORT_RETRY_IGNORE: dialog.button.BUTTON_ABORT | dialog.button.BUTTON_RETRY | dialog.button.BUTTON_CANCEL
    };

    dialog.common = function (_ref) {
      var title = _ref.title,
          buttons = _ref.buttons,
          value = _ref.value,
          template = _ref.template,
          templateUrl = _ref.templateUrl,
          controller = _ref.controller,
          size = _ref.size;

      if (typeof buttons === 'number') {
        buttons = Object.keys(dialog.button).sort(function (k1, k2) {
          return dialog.button[k2] - dialog.button[k1];
        }).filter(function (k) {
          return dialog.button[k] & buttons;
        }).map(function (k) {
          return {
            text: {
              BUTTON_OK: '确定',
              BUTTON_YES: '是',
              BUTTON_NO: '否',
              BUTTON_RETRY: '重试',
              BUTTON_ABORT: '中止',
              BUTTON_IGNORE: '忽略',
              BUTTON_CANCEL: '取消'
            }[k],
            value: dialog.button[k]
          };
        });
      }

      var prepar = angular.element('\n        <div class="dialog-container new-layout">\n          <div class="dialog-cover"></div>\n          <div class="dialog-box">\n            <div class="dialog-title" ng-bind="title"></div>\n            <div class="dialog-content"></div>\n            <div class="dialog-buttons">\n              <form-button-group>\n                <button type="button" ng-repeat="button in buttons"\n                  ng-click="done(button.value)"\n                  ng-bind="button.text"\n                ></button>\n              </form-button-group>\n            </div>\n          </div>\n        </div>\n      ');

      var content = angular.element('.dialog-content', prepar);
      if (template) content.html(template);else if (templateUrl) content.html(angular.element('<div></div').attr('ng-include', templateUrl));

      var box = angular.element('.dialog-box', prepar);
      if (typeof controller === 'string') box.attr('ng-controller', controller);

      if (typeof size === 'number') box.css({ width: size + 'px' });else if (typeof size === 'string') box.css({ width: size });else box.addClass('dialog-box-with-auto');

      var done = null;
      var scope = $rootScope.$new(true);
      scope.title = title || '';
      scope.buttons = buttons || [];
      scope.value = value || void 0;
      scope.done = function (value) {
        hide();
        done(value);
      };

      var element = angular.element($compile(prepar)(scope));
      angular.element(document.body).append(element);
      var hide = function hide() {
        element.remove();
      };

      return new api.SimplePromise(function (resolve, reject) {
        done = resolve;
      });
    };

    dialog.msgbox = function (_ref2) {
      var title = _ref2.title,
          message = _ref2.message,
          buttons = _ref2.buttons;

      return dialog.common({
        title: title,
        buttons: buttons,
        value: message,
        template: '<span class="dialog-message" ng-bind="value"></span>'
      });
    };

    var dialogWithButton = function dialogWithButton(buttons) {
      return function (title, message) {
        if ((typeof title === 'undefined' ? 'undefined' : _typeof(title)) === 'object') {
          ;
          var _title = title;
          title = _title.title;
          message = _title.message;
        }return dialog.msgbox({ title: title, message: message, buttons: buttons });
      };
    };

    dialog.alert = dialogWithButton(dialog.buttons.BUTTON_OK_ONLY);
    dialog.continue = dialogWithButton(dialog.buttons.BUTTON_OK_CANCEL);
    dialog.question = dialogWithButton(dialog.buttons.BUTTON_YES_NO);
    dialog.optquestion = dialogWithButton(dialog.buttons.BUTTON_YES_NO_CANCEL);
    dialog.retry = dialogWithButton(dialog.buttons.BUTTON_RETRY_CANCEL);
    dialog.no_one_need_this = dialogWithButton(dialog.buttons.BUTTON_ABORT_RETRY_IGNORE);

    return dialog;
  }]);
})(window.pageLayout = window.pageLayout || angular.module('pageLayout', ['backendApi']));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9wYWdlTGF5b3V0L3BhZ2VMYXlvdXQuZXMiXSwibmFtZXMiOlsicGFnZUxheW91dCIsImNvbXBvbmVudCIsInRlbXBsYXRlIiwidHJhbnNjbHVkZSIsImJpbmRpbmdzIiwiY29udHJvbGxlciIsImxvZ28iLCJmYWxsYmFjayIsInRleHQiLCJkaXJlY3RpdmUiLCIkcGFyc2UiLCJzY29wZSIsImxpbmsiLCIkc2NvcGUiLCIkZWxlbWVudCIsIiRhdHRycyIsInRhYnMiLCJfJHRhYnMiLCIkd2F0Y2giLCIkc3RhdGUiLCJfJGxvYWRlZFBhZ2VzIiwiXyRjdXJyZW50UGFnZSIsInRhYiIsInBhZ2UiLCJwYXJhbXMiLCJtYXRjaCIsImZpbHRlciIsImxlbmd0aCIsInBlcmZlciIsImRlZmF1bHQiLCJlbXB0eSIsImluZGV4T2YiLCJwdXNoIiwiXyRnb3RvUGFnZSIsImdvIiwiY3VycmVudCIsIm5hbWUiLCJub3RpZnkiLCJmYWN0b3J5IiwiYXBpIiwiJGNvbXBpbGUiLCIkcm9vdFNjb3BlIiwiZGlhbG9nIiwiYnV0dG9uIiwiQlVUVE9OX09LIiwiQlVUVE9OX1lFUyIsIkJVVFRPTl9OTyIsIkJVVFRPTl9SRVRSWSIsIkJVVFRPTl9BQk9SVCIsIkJVVFRPTl9JR05PUkUiLCJCVVRUT05fQ0FOQ0VMIiwiYnV0dG9ucyIsIkJVVFRPTl9PS19PTkxZIiwiQlVUVE9OX09LX0NBTkNFTCIsIkJVVFRPTl9ZRVNfTk8iLCJCVVRUT05fWUVTX05PX0NBTkNFTCIsIkJVVFRPTl9SRVRSWV9DQU5DRUwiLCJCVVRUT05fQUJPUlRfUkVUUllfSUdOT1JFIiwiY29tbW9uIiwidGl0bGUiLCJ2YWx1ZSIsInRlbXBsYXRlVXJsIiwic2l6ZSIsIk9iamVjdCIsImtleXMiLCJzb3J0IiwiazEiLCJrMiIsImsiLCJtYXAiLCJwcmVwYXIiLCJhbmd1bGFyIiwiZWxlbWVudCIsImNvbnRlbnQiLCJodG1sIiwiYXR0ciIsImJveCIsImNzcyIsIndpZHRoIiwiYWRkQ2xhc3MiLCJkb25lIiwiJG5ldyIsImhpZGUiLCJkb2N1bWVudCIsImJvZHkiLCJhcHBlbmQiLCJyZW1vdmUiLCJTaW1wbGVQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm1zZ2JveCIsIm1lc3NhZ2UiLCJkaWFsb2dXaXRoQnV0dG9uIiwiYWxlcnQiLCJjb250aW51ZSIsInF1ZXN0aW9uIiwib3B0cXVlc3Rpb24iLCJyZXRyeSIsIm5vX29uZV9uZWVkX3RoaXMiLCJ3aW5kb3ciLCJtb2R1bGUiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxDQUFHLFdBQVVBLFVBQVYsRUFBc0I7O0FBRXZCQSxhQUFXQyxTQUFYLENBQXFCLGVBQXJCLEVBQXNDO0FBQ3BDQyx5RkFEb0M7QUFJcENDLGdCQUFZLElBSndCO0FBS3BDQyxjQUFVLEVBTDBCO0FBTXBDQyxnQkFBWSxDQUFDLFlBQVksQ0FBRyxDQUFoQjtBQU53QixHQUF0Qzs7QUFTQUwsYUFBV0MsU0FBWCxDQUFxQixnQkFBckIsRUFBdUM7QUFDckNDLDhJQURxQztBQU1yQ0MsZ0JBQVksSUFOeUI7QUFPckNDLGNBQVUsRUFQMkI7QUFRckNDLGdCQUFZLENBQUMsWUFBWSxDQUFHLENBQWhCO0FBUnlCLEdBQXZDOztBQVdBTCxhQUFXQyxTQUFYLENBQXFCLGlCQUFyQixFQUF3QztBQUN0Q0MsaVZBRHNDO0FBU3RDRSxjQUFVO0FBQ1JFLFlBQU0sR0FERTtBQUVSQyxnQkFBVTtBQUZGLEtBVDRCO0FBYXRDRixnQkFBWSxDQUFDLFlBQVksQ0FBRyxDQUFoQjtBQWIwQixHQUF4Qzs7QUFnQkFMLGFBQVdDLFNBQVgsQ0FBcUIsaUJBQXJCLEVBQXdDO0FBQ3RDQywwTkFEc0M7QUFPdENDLGdCQUFZLElBUDBCO0FBUXRDQyxjQUFVO0FBQ1JJLFlBQU07QUFERSxLQVI0QjtBQVd0Q0gsZ0JBQVksQ0FBQyxZQUFZLENBQUcsQ0FBaEI7QUFYMEIsR0FBeEM7O0FBY0FMLGFBQVdDLFNBQVgsQ0FBcUIsb0JBQXJCLEVBQTJDO0FBQ3pDQyx3SkFEeUM7QUFNekNDLGdCQUFZLElBTjZCO0FB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bnRlbnQiOlsiOyAoZnVuY3Rpb24gKHBhZ2VMYXlvdXQpIHtcblxuICBwYWdlTGF5b3V0LmNvbXBvbmVudCgncGFnZUNvbnRhaW5lcicsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGRpdiBjbGFzcz1cInBhZ2UtY29udGFpbmVyIG5ldy1sYXlvdXRcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxuICAgIGAsXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICBiaW5kaW5nczoge30sXG4gICAgY29udHJvbGxlcjogW2Z1bmN0aW9uICgpIHsgfV0sXG4gIH0pO1xuXG4gIHBhZ2VMYXlvdXQuY29tcG9uZW50KCdwYWdlU3VtbWFyeUJveCcsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGRpdiBjbGFzcz1cInBhZ2Utc3VtbWFyeS1ib3hcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInBhZ2Utc3VtbWFyeS1ib3gtY29udGVudFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgYmluZGluZ3M6IHt9LFxuICAgIGNvbnRyb2xsZXI6IFtmdW5jdGlvbiAoKSB7IH1dLFxuICB9KTtcblxuICBwYWdlTGF5b3V0LmNvbXBvbmVudCgncGFnZVN1bW1hcnlMb2dvJywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICA8ZGl2IGNsYXNzPVwicGFnZS1zdW1tYXJ5LWxvZ29cIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInBhZ2Utc3VtbWFyeS1sb2dvLXdyYXBwZXJcIj5cbiAgICAgICAgICA8aW1nIG5nLXNyYz1cInt7ICRjdHJsLmZhbGxiYWNrIH19XCIgbmctaWY9XCIkY3RybC5mYWxsYmFja1wiIC8+XG4gICAgICAgICAgPGltZyBuZy1zcmM9XCJ7eyAkY3RybC5sb2dvIH19XCIgb25lcnJvcj1cInRoaXMuc3R5bGUuZGlzcGxheSA9ICdub25lJ1wiIG9ubG9hZD1cInRoaXMuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcIiAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGAsXG4gICAgYmluZGluZ3M6IHtcbiAgICAgIGxvZ286ICdAJyxcbiAgICAgIGZhbGxiYWNrOiAnQD8nLFxuICAgIH0sXG4gICAgY29udHJvbGxlcjogW2Z1bmN0aW9uICgpIHsgfV0sXG4gIH0pO1xuXG4gIHBhZ2VMYXlvdXQuY29tcG9uZW50KCdwYWdlU3VtbWFyeUl0ZW0nLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJwYWdlLXN1bW1hcnktaXRlbVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwicGFnZS1zdW1tYXJ5LWl0ZW0tdGl0bGVcIiBuZy1iaW5kPVwiJGN0cmwudGV4dFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwicGFnZS1zdW1tYXJ5LWl0ZW0tY29udGVudFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgYmluZGluZ3M6IHtcbiAgICAgIHRleHQ6ICdAJyxcbiAgICB9LFxuICAgIGNvbnRyb2xsZXI6IFtmdW5jdGlvbiAoKSB7IH1dLFxuICB9KTtcblxuICBwYWdlTGF5b3V0LmNvbXBvbmVudCgncGFnZVN1bW1hcnlDb250ZW50Jywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICA8ZGl2IGNsYXNzPVwicGFnZS1zdW1tYXJ5LWNvbnRlbnQtY29udGFpbmVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJwYWdlLXN1bW1hcnktY29udGVudFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgYmluZGluZ3M6IHt9LFxuICAgIGNvbnRyb2xsZXI6IFtmdW5jdGlvbiAoKSB7IH1dLFxuICB9KTtcblxuICBwYWdlTGF5b3V0LmRpcmVjdGl2ZSgncGFnZUNvbnRlbnRCb3gnLCBbJyRwYXJzZScsIGZ1bmN0aW9uICgkcGFyc2UpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cInBhZ2UtY29udGVudC1ib3hcIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJwYWdlLXRhYi1saXN0XCIgbmctaWY9XCJfJHRhYnMgJiYgXyR0YWJzLmxlbmd0aFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPVwicGFnZS10YWItaXRlbVwiIG5nLXJlcGVhdD1cInRhYiBpbiBfJHRhYnNcIiBuZy1jbGFzcz1cInsgJ3BhZ2UtdGFiLWl0ZW0tYWN0aXZlJzogXyRjdXJyZW50UGFnZSgpLnBhZ2UgPT09IHRhYi5wYWdlIH1cIj5cbiAgICAgICAgICAgICAgPGEgdWktc3JlZj1cInsgcGFnZTogdGFiLnBhZ2UgfVwiIG5nLWNsaWNrPVwiXyRnb3RvUGFnZSh0YWIpOyAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcIiBuZy1iaW5kPVwidGFiLnRleHRcIj48L2E+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInBhZ2UtY29udGVudC1jb250YWluZXJcIiBuZy1pZj1cIiFfJHRhYnMgfHwgIV8kdGFicy5sZW5ndGhcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYWdlLWNvbnRlbnQtdGFiLWNvbnRhaW5lclwiICBuZy1pZj1cIl8kdGFicyAmJiBfJHRhYnMubGVuZ3RoXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFnZS1jb250ZW50LWNvbnRhaW5lclwiIG5nLXJlcGVhdD1cInRhYiBpbiBfJHRhYnNcIiBuZy1pZj1cIl8kbG9hZGVkUGFnZXMuaW5kZXhPZih0YWIucGFnZSkgIT09IC0xXCIgbmctc2hvdz1cIl8kY3VycmVudFBhZ2UoKS5wYWdlID09PSB0YWIucGFnZVwiIG5nLWluY2x1ZGU9XCJ0YWIuaHRtbFwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIGAsXG4gICAgICBzY29wZTogdHJ1ZSxcbiAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICBsaW5rOiBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XG4gICAgICAgIGxldCB0YWJzID0gJHBhcnNlKCRhdHRycy50YWJzKTtcbiAgICAgICAgJHNjb3BlLl8kdGFicyA9IHRhYnMoKTtcbiAgICAgICAgJHNjb3BlLiR3YXRjaCh0YWJzLCAoKSA9PiB7ICRzY29wZS5fJHRhYnMgPSB0YWJzKCk7IH0pO1xuICAgICAgfSxcbiAgICAgIGNvbnRyb2xsZXI6IFsnJHN0YXRlJywgJyRzY29wZScsIGZ1bmN0aW9uICgkc3RhdGUsICRzY29wZSkge1xuICAgICAgICAkc2NvcGUuXyRsb2FkZWRQYWdlcyA9IFtdO1xuICAgICAgICAkc2NvcGUuXyRjdXJyZW50UGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBsZXQgdGFiID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCBwYWdlID0gJHN0YXRlLnBhcmFtcy5wYWdlO1xuICAgICAgICAgICAgbGV0IG1hdGNoID0gKCRzY29wZS5fJHRhYnMgfHwgW10pLmZpbHRlcih0YWIgPT4gdGFiLnBhZ2UgPT09IHBhZ2UpO1xuICAgICAgICAgICAgaWYgKG1hdGNoLmxlbmd0aCkgcmV0dXJuIG1hdGNoWzBdO1xuICAgICAgICAgICAgbGV0IHBlcmZlciA9ICgkc2NvcGUuXyR0YWJzIHx8IFtdKS5maWx0ZXIodGFiID0+IHRhYi5kZWZhdWx0KTtcbiAgICAgICAgICAgIGlmIChwZXJmZXIubGVuZ3RoKSByZXR1cm4gcGVyZmVyWzBdO1xuICAgICAgICAgICAgbGV0IGVtcHR5ID0gKCRzY29wZS5fJHRhYnMgfHwgW10pLmZpbHRlcih0YWIgPT4gdGFiLnBhZ2UgPT09ICcnKTtcbiAgICAgICAgICAgIGlmIChlbXB0eS5sZW5ndGgpIHJldHVybiBlbXB0eVswXTtcbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUuXyR0YWJzWzBdO1xuICAgICAgICAgIH0oKSk7XG4gICAgICAgICAgaWYgKCRzY29wZS5fJGxvYWRlZFBhZ2VzLmluZGV4T2YodGFiLnBhZ2UpID09PSAtMSkge1xuICAgICAgICAgICAgJHNjb3BlLl8kbG9hZGVkUGFnZXMucHVzaCh0YWIucGFnZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0YWI7XG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS5fJGdvdG9QYWdlID0gZnVuY3Rpb24gKHRhYikge1xuICAgICAgICAgICRzdGF0ZS5nbygkc3RhdGUuY3VycmVudC5uYW1lLCB7IHBhZ2U6IHRhYi5wYWdlIH0sIHsgbm90aWZ5OiBmYWxzZSB9KTtcbiAgICAgICAgfTtcbiAgICAgIH1dLFxuICAgIH07XG4gIH1dKTtcblxuICBwYWdlTGF5b3V0LmZhY3RvcnkoJ2RpYWxvZycsIFsnYXBpJywgJyRjb21waWxlJywgJyRyb290U2NvcGUnLCBmdW5jdGlvbiAoYXBpLCAkY29tcGlsZSwgJHJvb3RTY29wZSkge1xuICAgIGNvbnN0IGRpYWxvZyA9IHt9O1xuXG4gICAgZGlhbG9nLmJ1dHRvbiA9IHtcbiAgICAgIEJVVFRPTl9PSzogMSA8PCAwLFxuICAgICAgQlVUVE9OX1lFUzogMSA8PCAxLFxuICAgICAgQlVUVE9OX05POiAxIDw8IDIsXG4gICAgICBCVVRUT05fUkVUUlk6IDEgPDwgMyxcbiAgICAgIEJVVFRPTl9BQk9SVDogMSA8PCA0LFxuICAgICAgQlVUVE9OX0lHTk9SRTogMSA8PCA1LFxuICAgICAgQlVUVE9OX0NBTkNFTDogMSA8PCA3LFxuICAgIH07XG5cbiAgICAvLyDlsL3ph4/kvb/nlKjov5nph4zpooTorr7nmoTpgInpoblcbiAgICAvLyDlpoLmnpzov5nkupvpobnnm67kuI3lpJ/kvb/nlKjvvIzor7fkvb/nlKjkuIrpnaLnmoQgZGlhbG9nLmJ1dHRvbiDvvIznlKjmiJbov57mjqU7XG4gICAgZGlhbG9nLmJ1dHRvbnMgPSB7XG4gICAgICBCVVRUT05fT0tfT05MWTogZGlhbG9nLmJ1dHRvbi5CVVRUT05fT0ssXG4gICAgICBCVVRUT05fT0tfQ0FOQ0VMOiBkaWFsb2cuYnV0dG9uLkJVVFRPTl9PSyB8IGRpYWxvZy5idXR0b24uQlVUVE9OX0NBTkNFTCxcbiAgICAgIEJVVFRPTl9ZRVNfTk86IGRpYWxvZy5idXR0b24uQlVUVE9OX1lFUyB8IGRpYWxvZy5idXR0b24uQlVUVE9OX05PLFxuICAgICAgQlVUVE9OX1lFU19OT19DQU5DRUw6IGRpYWxvZy5idXR0b24uQlVUVE9OX1lFUyB8IGRpYWxvZy5idXR0b24uQlVUVE9OX05PIHwgZGlhbG9nLmJ1dHRvbi5CVVRUT05fQ0FOQ0VMLFxuICAgICAgQlVUVE9OX1JFVFJZX0NBTkNFTDogZGlhbG9nLmJ1dHRvbi5CVVRUT05fUkVUUlkgfCBkaWFsb2cuYnV0dG9uLkJVVFRPTl9DQU5DRUwsXG4gICAgICBCVVRUT05fQUJPUlRfUkVUUllfSUdOT1JFOiBkaWFsb2cuYnV0dG9uLkJVVFRPTl9BQk9SVCB8IGRpYWxvZy5idXR0b24uQlVUVE9OX1JFVFJZIHwgZGlhbG9nLmJ1dHRvbi5CVVRUT05fQ0FOQ0VMXG4gICAgfTtcblxuICAgIGRpYWxvZy5jb21tb24gPSBmdW5jdGlvbiAoeyB0aXRsZSwgYnV0dG9ucywgdmFsdWUsIHRlbXBsYXRlLCB0ZW1wbGF0ZVVybCwgY29udHJvbGxlciwgc2l6ZSB9KSB7XG4gICAgICBpZiAodHlwZW9mIGJ1dHRvbnMgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGJ1dHRvbnMgPSBPYmplY3Qua2V5cyhkaWFsb2cuYnV0dG9uKVxuICAgICAgICAgIC5zb3J0KChrMSwgazIpID0+IGRpYWxvZy5idXR0b25bazJdIC0gZGlhbG9nLmJ1dHRvbltrMV0pXG4gICAgICAgICAgLmZpbHRlcihrID0+IGRpYWxvZy5idXR0b25ba10gJiBidXR0b25zKVxuICAgICAgICAgIC5tYXAoayA9PiAoe1xuICAgICAgICAgICAgdGV4dDoge1xuICAgICAgICAgICAgICBCVVRUT05fT0s6ICfnoa7lrponLFxuICAgICAgICAgICAgICBCVVRUT05fWUVTOiAn5pivJyxcbiAgICAgICAgICAgICAgQlVUVE9OX05POiAn5ZCmJyxcbiAgICAgICAgICAgICAgQlVUVE9OX1JFVFJZOiAn6YeN6K+VJyxcbiAgICAgICAgICAgICAgQlVUVE9OX0FCT1JUOiAn5Lit5q2iJyxcbiAgICAgICAgICAgICAgQlVUVE9OX0lHTk9SRTogJ+W/veeVpScsXG4gICAgICAgICAgICAgIEJVVFRPTl9DQU5DRUw6ICflj5bmtognLFxuICAgICAgICAgICAgfVtrXSxcbiAgICAgICAgICAgIHZhbHVlOiBkaWFsb2cuYnV0dG9uW2tdLFxuICAgICAgICAgIH0pKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHByZXBhciA9IGFuZ3VsYXIuZWxlbWVudChgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJkaWFsb2ctY29udGFpbmVyIG5ldy1sYXlvdXRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlhbG9nLWNvdmVyXCI+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImRpYWxvZy1ib3hcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaWFsb2ctdGl0bGVcIiBuZy1iaW5kPVwidGl0bGVcIj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaWFsb2ctY29udGVudFwiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRpYWxvZy1idXR0b25zXCI+XG4gICAgICAgICAgICAgIDxmb3JtLWJ1dHRvbi1ncm91cD5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBuZy1yZXBlYXQ9XCJidXR0b24gaW4gYnV0dG9uc1wiXG4gICAgICAgICAgICAgICAgICBuZy1jbGljaz1cImRvbmUoYnV0dG9uLnZhbHVlKVwiXG4gICAgICAgICAgICAgICAgICBuZy1iaW5kPVwiYnV0dG9uLnRleHRcIlxuICAgICAgICAgICAgICAgID48L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9mb3JtLWJ1dHRvbi1ncm91cD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIGApO1xuXG4gICAgICBsZXQgY29udGVudCA9IGFuZ3VsYXIuZWxlbWVudCgnLmRpYWxvZy1jb250ZW50JywgcHJlcGFyKTtcbiAgICAgIGlmICh0ZW1wbGF0ZSkgY29udGVudC5odG1sKHRlbXBsYXRlKTtcbiAgICAgIGVsc2UgaWYgKHRlbXBsYXRlVXJsKSBjb250ZW50Lmh0bWwoYW5ndWxhci5lbGVtZW50KCc8ZGl2PjwvZGl2JykuYXR0cignbmctaW5jbHVkZScsIHRlbXBsYXRlVXJsKSk7XG5cbiAgICAgIGxldCBib3ggPSBhbmd1bGFyLmVsZW1lbnQoJy5kaWFsb2ctYm94JywgcHJlcGFyKTtcbiAgICAgIGlmICh0eXBlb2YgY29udHJvbGxlciA9PT0gJ3N0cmluZycpIGJveC5hdHRyKCduZy1jb250cm9sbGVyJywgY29udHJvbGxlcik7XG5cbiAgICAgIGlmICh0eXBlb2Ygc2l6ZSA9PT0gJ251bWJlcicpIGJveC5jc3MoeyB3aWR0aDogc2l6ZSArICdweCcgfSk7XG4gICAgICBlbHNlIGlmICh0eXBlb2Ygc2l6ZSA9PT0gJ3N0cmluZycpIGJveC5jc3MoeyB3aWR0aDogc2l6ZSB9KTtcbiAgICAgIGVsc2UgYm94LmFkZENsYXNzKCdkaWFsb2ctYm94LXdpdGgtYXV0bycpO1xuXG4gICAgICBsZXQgZG9uZSA9IG51bGw7XG4gICAgICBsZXQgc2NvcGUgPSAkcm9vdFNjb3BlLiRuZXcodHJ1ZSk7XG4gICAgICBzY29wZS50aXRsZSA9IHRpdGxlIHx8ICcnO1xuICAgICAgc2NvcGUuYnV0dG9ucyA9IGJ1dHRvbnMgfHwgW107XG4gICAgICBzY29wZS52YWx1ZSA9IHZhbHVlIHx8ICh2b2lkIDApO1xuICAgICAgc2NvcGUuZG9uZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBoaWRlKCk7XG4gICAgICAgIGRvbmUodmFsdWUpO1xuICAgICAgfTtcblxuICAgICAgbGV0IGVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoJGNvbXBpbGUocHJlcGFyKShzY29wZSkpO1xuICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmFwcGVuZChlbGVtZW50KTtcbiAgICAgIGxldCBoaWRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBlbGVtZW50LnJlbW92ZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IGFwaS5TaW1wbGVQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZG9uZSA9IHJlc29sdmU7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgZGlhbG9nLm1zZ2JveCA9IGZ1bmN0aW9uICh7IHRpdGxlLCBtZXNzYWdlLCBidXR0b25zIH0pIHtcbiAgICAgIHJldHVybiBkaWFsb2cuY29tbW9uKHtcbiAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICBidXR0b25zOiBidXR0b25zLFxuICAgICAgICB2YWx1ZTogbWVzc2FnZSxcbiAgICAgICAgdGVtcGxhdGU6ICc8c3BhbiBjbGFzcz1cImRpYWxvZy1tZXNzYWdlXCIgbmctYmluZD1cInZhbHVlXCI+PC9zcGFuPicsXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3QgZGlhbG9nV2l0aEJ1dHRvbiA9IGZ1bmN0aW9uIChidXR0b25zKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHRpdGxlLCBtZXNzYWdlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGl0bGUgPT09ICdvYmplY3QnKSAoe3RpdGxlLCBtZXNzYWdlfSA9IHRpdGxlKTtcbiAgICAgICAgcmV0dXJuIGRpYWxvZy5tc2dib3goeyB0aXRsZSwgbWVzc2FnZSwgYnV0dG9ucyB9KTtcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGRpYWxvZy5hbGVydCA9IGRpYWxvZ1dpdGhCdXR0b24oZGlhbG9nLmJ1dHRvbnMuQlVUVE9OX09LX09OTFkpO1xuICAgIGRpYWxvZy5jb250aW51ZSA9IGRpYWxvZ1dpdGhCdXR0b24oZGlhbG9nLmJ1dHRvbnMuQlVUVE9OX09LX0NBTkNFTCk7XG4gICAgZGlhbG9nLnF1ZXN0aW9uID0gZGlhbG9nV2l0aEJ1dHRvbihkaWFsb2cuYnV0dG9ucy5CVVRUT05fWUVTX05PKTtcbiAgICBkaWFsb2cub3B0cXVlc3Rpb24gPSBkaWFsb2dXaXRoQnV0dG9uKGRpYWxvZy5idXR0b25zLkJVVFRPTl9ZRVNfTk9fQ0FOQ0VMKTtcbiAgICBkaWFsb2cucmV0cnkgPSBkaWFsb2dXaXRoQnV0dG9uKGRpYWxvZy5idXR0b25zLkJVVFRPTl9SRVRSWV9DQU5DRUwpO1xuICAgIGRpYWxvZy5ub19vbmVfbmVlZF90aGlzID0gZGlhbG9nV2l0aEJ1dHRvbihkaWFsb2cuYnV0dG9ucy5CVVRUT05fQUJPUlRfUkVUUllfSUdOT1JFKTtcblxuICAgIHJldHVybiBkaWFsb2c7XG4gIH1dKTtcblxufSh3aW5kb3cucGFnZUxheW91dCA9IHdpbmRvdy5wYWdlTGF5b3V0IHx8IGFuZ3VsYXIubW9kdWxlKCdwYWdlTGF5b3V0JywgWydiYWNrZW5kQXBpJ10pKSk7Il19
