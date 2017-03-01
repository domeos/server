; (function (pageLayout) {

  pageLayout.component('pageContainer', {
    template: `
      <div class="page-container new-layout" ng-transclude></div>
    `,
    transclude: true,
    bindings: {},
    controller: [function () { }],
  });

  pageLayout.component('pageSummaryBox', {
    template: `
      <div class="page-summary-box">
        <div class="page-summary-box-content" ng-transclude></div>
      </div>
    `,
    transclude: true,
    bindings: {},
    controller: [function () { }],
  });

  pageLayout.component('pageSummaryLogo', {
    template: `
      <div class="page-summary-logo">
        <div class="page-summary-logo-wrapper">
          <img ng-src="{{ $ctrl.fallback }}" ng-if="$ctrl.fallback" />
          <img ng-src="{{ $ctrl.logo }}" onerror="this.style.display = 'none'" onload="this.style.display = 'block'" />
        </div>
      </div>
    `,
    bindings: {
      logo: '@',
      fallback: '@?',
    },
    controller: [function () { }],
  });

  pageLayout.component('pageSummaryItem', {
    template: `
      <div class="page-summary-item">
        <div class="page-summary-item-title" ng-bind="$ctrl.text"></div>
        <div class="page-summary-item-content" ng-transclude></div>
      </div>
    `,
    transclude: true,
    bindings: {
      text: '@',
    },
    controller: [function () { }],
  });

  pageLayout.component('pageSummaryContent', {
    template: `
      <div class="page-summary-content-container">
        <div class="page-summary-content" ng-transclude></div>
      </div>
    `,
    transclude: true,
    bindings: {},
    controller: [function () { }],
  });

  pageLayout.directive('pageContentBox', ['$parse', function ($parse) {
    return {
      template: `
        <div class="page-content-box">
          <ul class="page-tab-list" ng-if="_$tabs && _$tabs.length">
            <li class="page-tab-item" ng-repeat="tab in _$tabs" ng-class="{ 'page-tab-item-active': _$currentPage().page === tab.page }">
              <a ui-sref="{ page: tab.page }" ng-click="_$gotoPage(tab); $event.stopPropagation()" ng-bind="tab.text"></a>
            </li>
          </ul>
          <div class="page-content-container" ng-if="!_$tabs || !_$tabs.length" ng-transclude></div>
          <div class="page-content-tab-container"  ng-if="_$tabs && _$tabs.length">
            <div class="page-content-container" ng-repeat="tab in _$tabs" ng-if="_$loadedPages.indexOf(tab.page) !== -1" ng-show="_$currentPage().page === tab.page" ng-include="tab.html"></div>
          </div>
        </div>
      `,
      scope: true,
      transclude: true,
      link: function ($scope, $element, $attrs) {
        let tabs = $parse($attrs.tabs);
        $scope._$tabs = tabs();
        $scope.$watch(tabs, () => { $scope._$tabs = tabs(); });
      },
      controller: ['$state', '$scope', function ($state, $scope) {
        $scope._$loadedPages = [];
        $scope._$currentPage = function () {
          let tab = (function () {
            let page = $state.params.page;
            let match = ($scope._$tabs || []).filter(tab => tab.page === page);
            if (match.length) return match[0];
            let perfer = ($scope._$tabs || []).filter(tab => tab.default);
            if (perfer.length) return perfer[0];
            let empty = ($scope._$tabs || []).filter(tab => tab.page === '');
            if (empty.length) return empty[0];
            return $scope._$tabs[0];
          }());
          if ($scope._$loadedPages.indexOf(tab.page) === -1) {
            $scope._$loadedPages.push(tab.page);
          }
          return tab;
        };
        $scope._$gotoPage = function (tab) {
          $state.go($state.current.name, { page: tab.page }, { notify: false });
        };
      }],
    };
  }]);

  pageLayout.factory('dialog', ['api', '$compile', '$rootScope', function (api, $compile, $rootScope) {
    const dialog = {};

    dialog.button = {
      BUTTON_OK: 1 << 0,
      BUTTON_YES: 1 << 1,
      BUTTON_NO: 1 << 2,
      BUTTON_RETRY: 1 << 3,
      BUTTON_ABORT: 1 << 4,
      BUTTON_IGNORE: 1 << 5,
      BUTTON_CANCEL: 1 << 7,
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

    dialog.common = function ({ title, buttons, value, template, templateUrl, controller, size }) {
      if (typeof buttons === 'number') {
        buttons = Object.keys(dialog.button)
          .sort((k1, k2) => dialog.button[k2] - dialog.button[k1])
          .filter(k => dialog.button[k] & buttons)
          .map(k => ({
            text: {
              BUTTON_OK: '确定',
              BUTTON_YES: '是',
              BUTTON_NO: '否',
              BUTTON_RETRY: '重试',
              BUTTON_ABORT: '中止',
              BUTTON_IGNORE: '忽略',
              BUTTON_CANCEL: '取消',
            }[k],
            value: dialog.button[k],
          }));
      }

      let prepar = angular.element(`
        <div class="dialog-container new-layout">
          <div class="dialog-cover"></div>
          <div class="dialog-box">
            <div class="dialog-title" ng-bind="title"></div>
            <div class="dialog-content"></div>
            <div class="dialog-buttons">
              <form-button-group>
                <button type="button" ng-repeat="button in buttons"
                  ng-click="done(button.value)"
                  ng-bind="button.text"
                ></button>
              </form-button-group>
            </div>
          </div>
        </div>
      `);

      let content = angular.element('.dialog-content', prepar);
      if (template) content.html(template);
      else if (templateUrl) content.html(angular.element('<div></div').attr('ng-include', templateUrl));

      let box = angular.element('.dialog-box', prepar);
      if (typeof controller === 'string') box.attr('ng-controller', controller);

      if (typeof size === 'number') box.css({ width: size + 'px' });
      else if (typeof size === 'string') box.css({ width: size });
      else box.addClass('dialog-box-with-auto');

      let done = null;
      let scope = $rootScope.$new(true);
      scope.title = title || '';
      scope.buttons = buttons || [];
      scope.value = value || (void 0);
      scope.done = function (value) {
        hide();
        done(value);
      };

      let element = angular.element($compile(prepar)(scope));
      angular.element(document.body).append(element);
      let hide = function () {
        element.remove();
      }

      return new api.SimplePromise(function (resolve, reject) {
        done = resolve;
      });
    };

    dialog.msgbox = function ({ title, message, buttons }) {
      return dialog.common({
        title: title,
        buttons: buttons,
        value: message,
        template: '<span class="dialog-message" ng-bind="value"></span>',
      });
    };

    const dialogWithButton = function (buttons) {
      return function (title, message) {
        if (typeof title === 'object') ({title, message} = title);
        return dialog.msgbox({ title, message, buttons });
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

}(window.pageLayout = window.pageLayout || angular.module('pageLayout', ['backendApi'])));