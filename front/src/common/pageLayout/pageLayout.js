/* jshint esversion: 6 */
; (function (pageLayout) {

  pageLayout.component('pageTitle', {
    template: '',
    bindings: {
      pageTitle: '@',
    },
    controller: ['$scope', '$rootScope', function ($scope, $rootScope) {
      const $ctrl = this;
      $scope.$watch('$ctrl.pageTitle', function () {
        $rootScope.$emit('pageTitle', {
          title: $ctrl.pageTitle,
        });
      });
    }],
  });


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
        const updateLoadedPages = function() {
          ($scope._$tabs || []).forEach(tab => {
            if (tab.lazy === false && $scope._$loadedPages.indexOf(tab.page) === -1){
              $scope._$loadedPages.push(tab.page);
            }
          });
        };
        let tabs = $parse($attrs.tabs);
        $scope._$tabs = tabs();
        $scope.$watch(tabs, () => { $scope._$tabs = tabs(); updateLoadedPages();});
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

  pageLayout.factory('dialog', [
    'api', '$compile', '$rootScope', '$controller', '$timeout', 'userFriendlyMessage',
  function (api, $compile, $rootScope, $controller, $timeout, userFriendlyMessage) {
    const dialog = {};
    let dialogId = 0;

    // 所有支持的预定义按钮
    dialog.button = {
      BUTTON_OK: 1 << 0,
      BUTTON_YES: 1 << 1,
      BUTTON_NO: 1 << 2,
      BUTTON_RETRY: 1 << 3,
      BUTTON_ABORT: 1 << 4,
      BUTTON_IGNORE: 1 << 5,
      BUTTON_CANCEL: 1 << 7,
    };

    // 这些按钮比较次要，会默认展示成较为不显著的颜色
    dialog.secondaryButtons = [
      dialog.button.BUTTON_NO,
      dialog.button.BUTTON_ABORT, 
      dialog.button.BUTTON_IGNORE, 
      dialog.button.BUTTON_CANCEL,
    ];

    // 尽量使用这里预设的选项
    // 如果这些项目不够使用，请使用上面的 dialog.button ，用或连接;
    dialog.buttons = {
      BUTTON_EMPTY: 0,
      BUTTON_OK_ONLY: dialog.button.BUTTON_OK,
      BUTTON_OK_CANCEL: dialog.button.BUTTON_OK | dialog.button.BUTTON_CANCEL,
      BUTTON_YES_NO: dialog.button.BUTTON_YES | dialog.button.BUTTON_NO,
      BUTTON_YES_NO_CANCEL: dialog.button.BUTTON_YES | dialog.button.BUTTON_NO | dialog.button.BUTTON_CANCEL,
      BUTTON_RETRY_CANCEL: dialog.button.BUTTON_RETRY | dialog.button.BUTTON_CANCEL,
      BUTTON_ABORT_RETRY_IGNORE: dialog.button.BUTTON_ABORT | dialog.button.BUTTON_RETRY | dialog.button.BUTTON_CANCEL
    };

    /*
     * 用于描述一个复杂的对话框，如果想描述基本的文字提示框，请使用下面定制的函数
     * 
     * 参数：
     * title （字符串） 对话框的标题
     * buttons （整数或数组） 对话框的按钮
     *   （整数，推荐） 根据 dialog.button 给定特定的按钮，推荐使用 dialog.buttons 中定义和常量
     *   （数组） { text, value } 表示按钮显示的文本，和点击时回传的值
     * value （任意对象） 将要给对话框内 scope 的 value 属性绑定的值，用于给对话框传递数据
     * template （字符串） 对话框使用的模板（ angular HTML 模板）
     * templateUrl （字符串） 对话框使用的模板名称（ HTML 文件名或模板名称）（与 template 只可选其一）
     * controller （字符串） 对话框内绑定的控制器名称
     * size （数字或字符串） 对话框的宽度，数字则表示像素值，字符串则依样写入 css
     * mayEscape （布尔） 可否被 Escape 按键关闭，默认为是
     * autoclose （布尔或数字） 是否自动关闭对话框及延迟
     *   false 表示不自动关闭（默认）
     *   true 表示默认的自动关闭（推荐在需要自动关闭时使用这个），目前设定为 2 秒
     *   数字 表示自动关闭的延迟，单位毫秒
     * form (字符串) form表单名称
     * 
     * 控制器绑定的 scope 上会有如下值：
     *   title （字符串） 对话框标题
     *   buttons （数组） 对话框的按钮（如果给定的是整数，那么会自动变换为数组格式）
     *   value （任意对象） 上文绑定的值
     *   close （函数） 调用该函数可以关闭对话框，调用的参数表示对话框返回的值
     *     close 有一个参数，表示关闭对话框后返回的值
     *   resolve （函数） 关闭对话框，与 close 的区别在于不会触发 onbeforeclose 检查
     *   onbeforeclose （函数） 覆盖这个函数，以实现在 close 被调用（或被按钮点击事件调用）时的相关操作
     *     函数可以返回一个 Promise ，那么对话框会在 Promise 解析后决定是否关闭
     *     如果函数返回 false 或返回的 Promise 被解析为 false ，那么对话框将会保持而非关闭
     * 
     * 返回值：
     *   函数返回一个 api.SimplePromise ，当 Promise 完成时，会得到最后调用 close 时传入的值
     *   * 如果对话框是因为 Escape 按键关闭的，那么这个值是 undefined
     *   * 如果对话框是因为默认的按钮关闭的，那么这个值是按钮的 value （或 dialog.button 中对应的键的值）
     *   * 如果对话框时因为控制器中调用 close 关闭的，那么这个值是传入到 close 中的值
     *   在需要判断是“确定”还是“取消”，或者“是”还是“否”时，请判断是否等于“确定”或“是”
     *     因为 Escape 键造成的关闭并不会返回“取消”的值，但意义与取消类似
     *   
     */
    dialog.common = function commonDialog(args) {
      let { title, buttons, value, template, templateUrl, controller, size, mayEscape = true, autoclose = false, warning = false, form } = args;

      // 首先初始化按钮
      // 如果传入的按钮时整数值，要在这里改成对象数组形式
      if (typeof buttons === 'number') {
        buttons = Object.keys(dialog.button)
          .sort((k1, k2) => dialog.button[k1] - dialog.button[k2])
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
            secondary: dialog.secondaryButtons.indexOf(dialog.button[k]) !== -1
          }));
      }

      // 初始化相关 HTML 元素
      let element = angular.element(`
        <div class="dialog-container new-layout dialog-hidden" id="{{ id }}">
          <div class="dialog-cover"></div>
          <div class="dialog-box" ng-cloak>
            <div class="dialog-title" ng-bind="title"></div>
              <div class="dialog-content"></div>
            <div class="dialog-buttons" ng-if="buttons.length">
              <form-button-group>
                <button type="button" ng-repeat="button in buttons"
                  ng-click="close(button.value)"
                  ng-bind="button.text"
                  ng-class="{ 'secondary-button': button.secondary }"
                ></button>
              </form-button-group>
            </div>
          </div>
        </div>
      `);

      if (form) {
        let dialogBox  = angular.element('.dialog-box', element);
        dialogBox.wrap(`<form name="${form}"></form>`);
      }
      // 设置宽度
      let box = angular.element('.dialog-box', element);
      if (typeof size === 'number') box.css({ width: size + 'px' });
      else if (typeof size === 'string') box.css({ width: size });
      else box.addClass('dialog-box-with-auto');

      // 设置警示颜色
      if (warning) box.addClass('dialog-warning');

      // 设置内容
      let content = angular.element('.dialog-content', element);
      if (template) content.html(template);
      else if (templateUrl) content.html(angular.element('<div></div>').attr('ng-include', templateUrl));

      // 保留最后要处理的 Promise 的 resolve 的引用
      let done = null;

      // 新建一个 scope ，并设置对应的值
      let scope = $rootScope.$new(true);
      if (controller) scope.$ctrl = controller;
      scope.title = title || '';
      scope.buttons = buttons || [];
      scope.value = value || (void 0);
      scope.form = form || (void 0);
      Object.defineProperty(scope, 'resolve', {
        enumerable: true,
        configurable: false,
        writable: false,
        value:  function (value) {
          api.SimplePromise.resolve(value).then(result => {
            if (result === false) return;
            hide();
            done(value);
          });
        }
      });
      Object.defineProperty(scope, 'close', {
        enumerable: true,
        configurable: false,
        writable: false,
        value:  function (value) {
          let doClose = true;
          if (form && value === dialog.button.BUTTON_OK) {
            scope[form].$submitted = true;
            if (!scope[form].$valid) return;
          }
          if (typeof scope.onbeforeclose === 'function') {
            doClose = scope.onbeforeclose(value);
          }
          if (doClose !== false) scope.resolve(value);
        }
      });
      scope.onbeforeclose = function () {};
      scope.id = 'dialog_' + (++dialogId);
      // 将元素插入到网页内
      element.appendTo(document.body);
      // 绑定 controller 
      if (controller) $controller(controller, { $scope: scope });
      $compile(element)(scope);

      // 当关闭对话框时要清理绑定的事件
      let clearEventHandler = function () {};

      // 关闭对话框
      const hide = (function () {
        let disposed = false;
        return function () {
          // 如果已经关闭，那么什么都不做
          if (disposed) return;
          disposed = true;
          // 设置关闭动画
          element.addClass('dialog-hidden');
          $timeout(() => {
            // 删除元素和进行相关清理操作
            element.remove();
            scope.$destroy();
            clearEventHandler();
          }, 200);
        };
      }());

      // 这个参数表示是否可以用 Escape 键等方式关闭对话框
      if (mayEscape) {
        const cover = angular.element('.dialog-cover', element);
        const keyupEventHandler = function (event) {
          if (event.keyCode !== 27) return;
          scope.close((void 0));
        };
        const clickBackgroundHandler = function () {
          scope.close((void 0));
        };
        cover.on('click', clickBackgroundHandler);
        angular.element(document).on('keyup', keyupEventHandler);
        clearEventHandler = function () {
          cover.off('click', clickBackgroundHandler);
          angular.element(document).off('keyup', keyupEventHandler);
        };
      }

      // 设置对话框的自动关闭
      if (autoclose) {
        let closeDelay = (typeof autoclose === 'number' ? autoclose : 2000);
        $timeout(scope.close, closeDelay + 200);
      }

      // 设置显示时的动画
      $timeout(() => {
        element.removeClass('dialog-hidden')
        $timeout(() => {
          (element[0].querySelector('input[autofocuse]') ||
            element[0].querySelector('input') || element[0]).focus();
        }, 200);
      });

      return new api.SimplePromise(function (resolve, reject) {
        done = resolve;
      });
    };

    /*
     * 一个简化的对话框
     */
    dialog.msgbox = function ({ title, message, buttons, autoclose = false, warning = false }) {
      return dialog.common({
        title, buttons, autoclose, warning,
        value: userFriendlyMessage(message),
        template: '<span class="dialog-message" ng-bind-html="value"></span>',
      });
    };

    const dialogWithButton = function (buttons, { autoclose = false, warning = false } = {}) {
      return function (title, message) {
        if (typeof title === 'object') ({ title, message } = title);
        return dialog.msgbox({ title, message, buttons, autoclose, warning });
      };
    };

    /*
     * 显示简单的文本提示对话框时，可以使用如下函数
     * 参数： title, message 字符串，表示标题和内容
     * alert 只有确定
     * continue 确定/取消
     * question 是/否
     * optquestion 是/否/取消
     * retry 重试/取消
     * no_one_need_this 只有用 vbs 的人才会用的对话框，请不要用它
     */
    dialog.tip = dialogWithButton(dialog.buttons.BUTTON_EMPTY, { autoclose: true });
    dialog.alert = dialogWithButton(dialog.buttons.BUTTON_OK_ONLY);
    dialog.continue = dialogWithButton(dialog.buttons.BUTTON_OK_CANCEL);
    dialog.question = dialogWithButton(dialog.buttons.BUTTON_YES_NO);
    dialog.optquestion = dialogWithButton(dialog.buttons.BUTTON_YES_NO_CANCEL);
    dialog.retry = dialogWithButton(dialog.buttons.BUTTON_RETRY_CANCEL);
    dialog.no_one_need_this = dialogWithButton(dialog.buttons.BUTTON_ABORT_RETRY_IGNORE);

    /*
     * 以下对话框显示为警告颜色
     * error 显示出错信息，只有确定按钮
     * danger 确认危险操作，有确认和取消按钮
     */
    dialog.error = dialogWithButton(dialog.buttons.BUTTON_OK_ONLY, { warning: true });
    dialog.danger = dialogWithButton(dialog.buttons.BUTTON_OK_CANCEL, { warning: true });

    return dialog;
  }]);

}(angular.module('pageLayout', ['backendApi'])));
