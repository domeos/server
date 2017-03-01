'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

;(function (formInputs) {
  "use strict";

  var genUniqueId = function () {
    var currentIndex = Date.now();
    var randomText = function randomText() {
      return Math.random().toString(36)[4] || '0';
    };
    return function () {
      var text = [].concat(_toConsumableArray(Array(8))).map(randomText).join('').toUpperCase();
      return 'AUTO_GENERATED_INDEX_' + ++currentIndex + '_' + text;
    };
  }();

  var scopedTimeout = function scopedTimeout($timeout, $scope) {
    var promiseList = [];
    $scope.$on('$destory', function () {
      promiseList.forEach(function (promise) {
        return $timeout.cancel(promise);
      });
    });
    return function (callback) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var promise = $timeout.call.apply($timeout, [this, function () {
        promiseList.splice(index, 1);
        callback.apply(this, arguments);
      }].concat(args));
      var index = promiseList.push(promise) - 1;
    };
  };
  var scopedInterval = function scopedInterval($interval, $scope) {
    return scopedTimeout.apply(this, arguments);
  };
  var cleanUpCollections = function cleanUpCollections($scope) {
    var callbacks = [];
    $scope.$on('$destory', function () {
      callbacks.forEach(function (f) {
        return f();
      });
    });
    return function (cleanUpFunction) {
      callbacks.push();
    };
  };

  /*
   * <debugger> 输出某个变量的值
   * 在 Firefox 上，将利用 uneval 输出该变量的值；
   * 在其他不支持 uneval 的浏览器上，会使用自己模拟的 uneval 输出，模拟的 uneval 功能较弱
   *
   * 这个模板只会在地址栏中的网址是 localhost 或 127.0.0.1 时才会显示！
   *
   * value （双向） 要输出的变量
   * text （文本） 描述文字
   */
  formInputs.component('debugger', {
    template: '\n      <div class="debugger-container" ng-if="$ctrl.debuggerEnabled">\n        <span class="debugger-title" style="font-weight: bold" ng-if="$ctrl.text" ng-bind="$ctrl.text"></span>\n        <span class="debugger-content" ng-bind="$ctrl.result"></span>\n      </div>\n    ',
    bindings: {
      text: '@',
      value: '<?'
    },
    controller: ['$scope', function ($scope) {
      var $ctrl = this;
      $ctrl.debuggerEnabled = ['localhost', '127.0.0.1'].indexOf(location.hostname) !== -1 || !!localStorage.debuggerEnabled;
      var tosource = function () {
        "use strict";

        if ('uneval' in window) return window.uneval;
        var helper = function uneval(obj, parents) {
          try {
            if (obj === void 0) return '(void 0)';
            if (obj === null) return 'null';
            if (obj == null) throw 'not support undetectable';
            if (obj === 0 && 1 / obj === -Infinity) return '-0';
            if (typeof obj === 'number') return Number.prototype.toString.call(obj);
            if (typeof obj === 'boolean') return Boolean.prototype.toString.call(obj);
            if (typeof obj === 'string') return JSON.stringify(obj);
            if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'symbol') throw 'symbol not supported';
            if (!(obj instanceof Object)) throw 'not supported type';
            if (obj instanceof Number) return '(new Number(' + uneval(Number.prototype.valueOf.call(obj)) + '))';
            if (obj instanceof String) return '(new String(' + uneval(String.prototype.valueOf.call(obj)) + '))';
            if (obj instanceof Boolean) return '(new Boolean(' + uneval(Boolean.prototype.valueOf.call(obj)) + '))';
            if (obj instanceof RegExp) return obj.toString();
            if (obj instanceof Date) return '(new Date(' + uneval(Date.prototype.valueOf(obj)) + '))';
            if (obj instanceof Error) return '(new Error(' + uneval(obj.message) + '))';
            if (obj instanceof Symbol) throw 'symbol not supported';
            if (obj instanceof Function) {
              var str = '' + obj;
              var isNative = !!str.replace(/\s/g, '').match(/function[^(]*\(\)\{\[nativecode\]\}/);
              if (isNative) return '(function () { "native ${obj.name} function" })';
              return '(' + str + ')';
            }
            if (parents.indexOf(obj) !== -1) {
              if (obj instanceof Array) return '[]';
              return '({})';
            }
            var parentsAndMe = parents.concat([obj]);
            if (obj instanceof Array) {
              if (obj.length === 0) return '[]';
              var lastIsHole = !(obj.length - 1 in obj);
              var _str = obj.map(function (o) {
                return uneval(o, parentsAndMe);
              }).join(', ');
              return '[' + _str + (lastIsHole ? ',' : '') + ']';
            }
            if (obj instanceof Object) {
              var keys = Object.keys(obj).filter(function (k) {
                return k[0] !== '$';
              }); // we skip values by angular
              var _str2 = keys.map(function (k) {
                return JSON.stringify(k) + ': ' + uneval(obj[k], parentsAndMe);
              }).join(', ');
              return '({' + _str2 + '})';
            }
          } catch (e) {
            return '(void ("uneval not supported: ' + JSON.stringify(e.message).slice(1) + '))';
          }
        };
        return function (obj) {
          return helper(obj, []);
        };
      }();
      $scope.$watch('$ctrl.value', function () {
        $ctrl.result = tosource($ctrl.value);
      }, true);
    }]
  });

  /*
   * <icon> 用来展示一个小图标
   *
   * 不要直接使用这个模板，请考虑使用定制好的各类图标
   * 如果尚无定制好的图标符合要求，请考虑添加一个
   */
  formInputs.component('icon', {
    template: '\n      <i class="\n        icon icon16 icon-{{ $ctrl.name || \'custom\' }}\n        fa icon-fa fa-{{ $ctrl.type }}\n        {{ $ctrl.disabled ? \'icon-disabled\' : \'\' }}\n      " ng-style="{\n        color: $ctrl.disabled ? \'#cccccc\' : ($ctrl.color || \'#777\')\n      }"></i>\n    ',
    bindings: {
      name: '@?',
      type: '@',
      color: '@?',
      disabled: '@?'
    },
    controller: [function () {}]
  });
  /*
   * <icon-group> 用于容纳一组图标
   *
   * 在需要一组图标的时候，用 icon-group 标签包裹他们
   *
   * transclude 包含的图标
   */
  formInputs.component('iconGroup', {
    template: '<div class="icon-group-container" ng-transclude></div>',
    bindings: {},
    transclude: true,
    controller: [function () {}]
  });

  ;(function () {
    var color = {
      danger: '#f05050',
      active: '#29b6f6',
      gitlab: '#ff9800',
      ok: '#4bd396',
      cancel: '#f05050',
      close: '#777',
      placeholder: '#ddd',
      text: '#777',
      info: '#aaa',
      edit: '#188ae2'
    };
    var buttons = [
    /*
     * <icon-*> 各种定制的图标
     *
     * 下文数组的含义如下：
     *    * name 用于描述图标的名称，并最后在网页中书写 <icon-name> 使用对应图标
     *    * type 用于描述对应哪个 fa-icon
     *    * color 用于描述图标的颜色
     *
     * 对应模块使用时的参数如下：
     * disabled （字符串） 非空串表示禁用，此时图标会显示成灰色，鼠标从小手图标变化为箭头
     *   如果需要注册 ng-click ，请额外判断图标是否已禁用，不要依赖本属性
     *
     * 如果需要其他的图标（外观相同但意义不同，或意义相似但外观不同都算作新图标）请在此处添加
     */
    { name: 'delete', type: 'trash-o', color: color.danger }, { name: 'details', type: 'ellipsis-v' }, { name: 'transfer', type: 'external-link', color: color.active }, { name: 'stop', type: 'stop', color: color.danger }, { name: 'info', type: 'info-circle' }, { name: 'edit', type: 'pencil', color: color.edit }, { name: 'gitlab', type: 'gitlab', color: color.gitlab }, { name: 'save', type: 'floppy-o', color: color.ok }, { name: 'cancel', type: 'times', color: color.cancel }, { name: 'close', type: 'times', color: color.close }, { name: 'search', type: 'search', color: color.placeholder }, { name: 'drop-down', type: 'caret-down', color: color.text }, { name: 'clipboard', type: 'clipboard' }, { name: 'download', type: 'download' }, { name: 'file', type: 'file-text-o', color: color.active }];
    var buttonMap = {};
    buttons.forEach(function (button) {
      var name = button.name,
          type = button.type,
          color = button.color;
      buttonMap[name] = button;
      if (color === void 0) color = 'inherit';
      var cammelCaseName = ('icon-' + name).replace(/./g, function (i) {
        return i !== i.toLowerCase() ? '-' + i.toLowerCase() : i;
      }).replace(/[-_\s]+(\w)/g, function (_, m) {
        return m.toUpperCase();
      });
      var hypenSplitedName = cammelCaseName.replace(/./g, function (i) {
        return i !== i.toLowerCase() ? '-' + i.toLowerCase() : i;
      });
      formInputs.component(cammelCaseName, {
        template: '\n          <icon name="' + hypenSplitedName + '" type="' + type + '" color="' + color + '" disabled="{{ $ctrl.disabled ? \'disabled\' : \'\' }}"></icon>\n        ',
        bindings: { disabled: '@?' },
        controller: [function () {}]
      });
    });
    formInputs.component('iconByName', {
      template: '\n        <icon name="icon-{{ $ctrl.name }}" type="{{ $ctrl.type }}" color="{{ $ctrl.color }}" disabled="{{ $ctrl.disabled ? \'disabled\' : \'\' }}"></icon>\n      ',
      bindings: { disabled: '@?', name: '@' },
      controller: ['$scope', function ($scope) {
        var $ctrl = this;
        $scope.$watch('$ctrl.name', function () {
          if ($ctrl.name in buttonMap) {
            var _buttonMap$$ctrl$name = buttonMap[$ctrl.name];
            $ctrl.type = _buttonMap$$ctrl$name.type;
            $ctrl.color = _buttonMap$$ctrl$name.color;
          }
        });
      }]
    });
  })();

  formInputs.component('titleLine', {
    template: '\n      <div class="title-line">\n        <div class="title-container"><h2 class="content-title" ng-bind="$ctrl.text"></h2></div>\n        <div class="title-line-remaind" ng-transclude></div>\n      </div>\n    ',
    transclude: true,
    bindings: {
      text: '@',
      param: '=?'
    },
    controller: [function () {}]
  });

  /*
   * <form-container>
   * 所有 form 都应当由这个元素包裹
   *
   * transclude 内部应当书写一个表单元素
   */
  formInputs.component('formContainer', {
    // 使用 id 加 className 添加样式，这样即便被嵌套也会因为书写位置而造成的优先级而正常工作
    // TODO 如果兼容性允许，这里应该使用 CSS 变量
    template: '\n      <style>\n        #{{ $ctrl.uniqueId }} .form-config-item-title  {\n          width: {{ $ctrl.leftWidth }}px;\n        }\n        #{{ $ctrl.uniqueId }} .form-config-item-wrapper {\n          max-width: {{ 2 * ($ctrl.leftWidth + $ctrl.requireWidth) + $ctrl.inputMaxWidth }}px;\n        }\n        #{{ $ctrl.uniqueId }} .form-config-item-wrapper .form-config-item-wrapper {\n          padding-right: 0;\n        }\n        #{{ $ctrl.uniqueId }} .form-config-item {\n          padding-left: {{ $ctrl.leftWidth + $ctrl.requireWidth }}px;\n          max-width: {{ $ctrl.leftWidth + $ctrl.requireWidth + $ctrl.inputMaxWidth }}px;\n        }\n      </style>\n      <div id="{{ $ctrl.uniqueId }}" class="form-container-inner new-layout" ng-transclude>\n      </div>\n    ',
    bindings: {
      leftColumnWidth: '@'
    },
    transclude: true,
    controller: ['$scope', function ($scope) {
      var $ctrl = this;
      $ctrl.uniqueId = genUniqueId();

      $ctrl.defaultLeftWidth = 120;
      $ctrl.inputMaxWidth = 880;
      $ctrl.requireWidth = 20;

      $scope.$watch('$ctrl.leftColumnWidth', function () {
        // 这里使用 parseInt 是因为旧的接口里这里是形如 “120px” 形式的
        var param = parseInt($ctrl.leftColumnWidth, 10);
        $ctrl.leftWidth = Number.isFinite(param) && param >= 0 ? param : $ctrl.defaultLeftWidth;
      });
    }]
  });

  /*
   * <sub-form-container>
   * 这货应当在 form-input-container 里面出现
   *
   * transclude 内部应当书写一个表单元素
   */
  formInputs.component('subFormContainer', {
    template: '\n      <form-container left-column-width="{{ $ctrl.leftColumnWidth }}">\n        <div class="sub-from-container" ng-transclude></div>\n      </form-container>\n    ',
    bindings: {
      leftColumnWidth: '@'
    },
    transclude: true,
    controller: [function () {}]
  });

  /*
   * <form-config-group> 表单 form 中应当仅包含这个元素
   * 这个元素表示一组设置项，一组设置项关系较为紧密（中间没有分割线）
   *
   * transclude 内部应当包含 form-config-item
   */
  formInputs.component('formConfigGroup', {
    template: '\n      <div class="form-config-group-inner" ng-transclude>\n      </div>\n    ',
    bindings: {},
    transclude: true,
    controller: [function () {}]
  });

  /*
   * <form-button-group> 表单末尾的按钮行
   */
  formInputs.component('formButtonGroup', {
    template: '\n      <div class="form-config-group-inner form-config-button-group-inner" ng-transclude>\n      </div>\n    ',
    bindings: {},
    transclude: true,
    controller: [function () {}]
  });
  formInputs.component('formButtonCollection', {
    template: '\n      <div class="form-button-collection-container" ng-transclude>\n      </div>\n    ',
    bindings: {},
    transclude: true,
    controller: [function () {}]
  });

  /*
   * <form-config-item> 应当包含于 <form-config-group> 元素中
   * 表示一个设置项，每个设置项有自己的标题
   *
   * 参数 config-title （字符串）标题
   * 参数 required （布尔） 表示是否显示要求必填的标记（不会影响表单验证逻辑）
   *
   * transclude 内部应当包含该设置项右侧的内容
   */
  formInputs.component('formConfigItem', {
    template: '\n      <div class="form-config-item-wrapper">\n        <div class="form-config-item" ng-class="{\'form-config-item-required\': $ctrl.required}">\n          <div class="form-config-item-title" ng-bind="$ctrl.configTitle"></div>\n          <div class="form-config-item-content" ng-transclude ng-cloak></div>\n        </div>\n      </div>\n    ',
    bindings: {
      required: '@',
      configTitle: '@'
    },
    transclude: true,
    controller: [function () {}]
  });

  /*
   * <form-error-message> 表单验证时的错误信息
   *
   * 参数 form （双向） 表单对象
   * 参数 target （字符串） 待验证项的 name
   * 参数 type （可选，字符串） 哪类出错时显示该提示信息，空缺情况下为任意出错情况
   *
   * 参数 condition （可选，如果给定了该参数，则 form 和 target 可选） 备用的显示错误信息的条件
   *
   * transclude 内部包含出错时显示的信息
   */
  formInputs.component('formErrorMessage', {
    template: '\n      <div class="form-input-error-message" ng-show="\n        $ctrl.form && $ctrl.target && (\n          $ctrl.form.$submitted &&\n          $ctrl.form[$ctrl.target] &&\n          $ctrl.form[$ctrl.target].$invalid &&\n          $ctrl.form[$ctrl.target].$error &&\n          (!$ctrl.type || $ctrl.form[$ctrl.target].$error[$ctrl.type])\n        ) ||\n        $ctrl.condition\n      " ng-transclude></div>\n    ',
    bindings: {
      form: '<',
      target: '@',
      type: '@',
      condition: '<'
    },
    transclude: true,
    controller: [function () {}]
  });

  /*
   * <form-submit-button> 表单提交按钮
   * 请不要直接用 button 表示表单提交按钮，因为那样会导致表单验证失效
   *
   * form （双向） 表单对象
   * on-submit （回调） 点击且表单验证成功后回调
   *
   * transclude 内部应当包含按钮文本
   */
  formInputs.component('formSubmitButton', {
    template: '\n      <button type="submit" ng-transclude ng-click=" $ctrl.validThenTriggerSubmit($event) "></button>\n    ',
    bindings: {
      form: '<',
      onSubmit: '&'
    },
    transclude: true,
    controller: [function () {
      var $ctrl = this;
      $ctrl.validThenTriggerSubmit = function ($event) {
        $ctrl.form.$setSubmitted();
        if ($ctrl.form.$invalid) return;
        $ctrl.onSubmit();
        $event.preventDefault();
        $event.stopPropagation();
      };
    }]
  });

  /*
   * <form-help> 用于显示帮助文本，显示为行内
   *
   * transclude 帮助内容
   */
  formInputs.component('formHelp', {
    template: '<span class="form-help-text" ng-transclude></span>',
    bindings: {},
    transclude: true,
    controller: [function () {}]
  });
  /*
   * <form-help-line> 用于显示帮助文本，显示为一行
   *
   * transclude 帮助内容
   */
  formInputs.component('formHelpLine', {
    template: '<div class="form-help-text form-help-text-line" ng-transclude></div>',
    bindings: {},
    transclude: true,
    controller: [function () {}]
  });

  /*
   * <form-input-container> 用于包含表单中的输入框
   *
   * help-text （字符串） 帮助字符串
   * help-text-position (字符串，可省） 帮助字符串的位置，可选 top （默认）、 right 、 bottom 三个值
   *
   * transclude 内部包含输入框等内容
   */
  formInputs.component('formInputContainer', {
    template: '\n      <div class="form-input-container">\n        <form-help class="form-input-help-text-top" ng-if="$ctrl.helpText && ($ctrl.helpTextPosition || \'top\') === \'top\'">{{ $ctrl.helpText }}</form-help>\n        <div class="form-input-container-inner" ng-if="!($ctrl.helpText && $ctrl.helpTextPosition === \'right\')" ng-transclude></div>\n        <div class="form-input-container-inner form-multiple-inline-container" ng-if="($ctrl.helpText && $ctrl.helpTextPosition === \'right\')">\n          <div class="form-input-container-inner-options form-multiple-inline-item-replacement" ng-transclude></div>\n          <form-help class="form-input-help-text-right form-multiple-inline-item-replacement" ng-if="$ctrl.helpText && $ctrl.helpTextPosition === \'right\'">{{ $ctrl.helpText }}</form-help>\n        </div>\n        <form-help class="form-input-help-text-bottom" ng-if="$ctrl.helpText && $ctrl.helpTextPosition === \'bottom\'">{{ $ctrl.helpText }}</form-help>\n      </div>\n    ',
    bindings: {
      helpTextPosition: '@',
      helpText: '@'
    },
    transclude: true,
    controller: [function () {}]
  });

  /*
   * 仅供本文件内部使用，请勿直接使用！
   *
   * <form-left-right> 用于某一行分成左右两部分
   *
   * left-width （文本） 表示左侧宽度
   * right-width （文本） 表示右侧宽度
   *
   * transclude left 左侧内容
   * transclude right 右侧内容
   */
  formInputs.component('formLeftRight', {
    template: '\n      <div class="form-left-right-container">\n        <div class="form-left-right-wrapper">\n          <div class="form-left-right-left" ng-style="{ width: $ctrl.leftWidth }" ng-transclude="left"></div>\n          <div class="form-left-right-space"></div>\n          <div class="form-left-right-right" ng-style="{ width: $ctrl.rightWidth }" ng-transclude="right"></div>\n        </div>\n      </div>\n    ',
    bindings: {
      leftWidth: '@',
      rightWidth: '@'
    },
    transclude: {
      left: 'left',
      right: 'right'
    },
    controller: [function () {}]
  });

  /*
   * <form-multiple-inline>
   * 表示一行多个的元素
   *
   * align （字符串） 可选值 left
   *   left 靠左贴靠
   *   （默认） 均匀分布
   * contentType （字符串） 可选值 button
   *   button 描述包含按钮（和搜索框）的行
   *   （默认） 其他无特殊规则的行
   *
   */
  formInputs.component('formMultipleInline', {
    template: '\n      <div\n        class="form-multiple-inline-container"\n        ng-class="{\n          \'form-multiple-inline-align-left\': $ctrl.align === \'left\',\n          \'from-multiple-inline-for-search\': $ctrl.contentType === \'search\',\n         }"\n        ng-transclude\n      ></div>\n    ',
    bindings: {
      align: '@',
      contentType: '@'
    },
    transclude: true,
    controller: [function () {}]
  });
  formInputs.component('formMultipleInlineItem', {
    template: '\n      <div class="form-multiple-inline-item-inner"\n        ng-transclude></div>\n    ',
    bindings: {
      width: '@'
    },
    transclude: true,
    controller: [function () {}]
  });

  /*
   * <form-multiple-one-line>
   * 表示一行多个的元素
   *
   */
  formInputs.component('formMultipleOneLine', {
    template: '\n      <div class="form-multiple-one-line-container">\n        <div class="form-multiple-one-line-wrapper">\n        </div>\n      </div>\n    ',
    bindings: {
      align: '@'
    },
    transclude: true,
    controller: [function () {}]
  });

  /*
   * <form-with-button> 用于某一行末尾有一个按钮的情况
   *
   * width （文本） 表示按钮的宽度，默认为 "120px"
   *
   * transclude content-area 按钮左侧的内容
   * transclude button-area 按钮
   *
   * 请只包含一个按钮，需要多个按钮时请使用多次 form-with-button
   */
  formInputs.component('formWithButton', {
    template: '\n      <div class="form-with-button-container">\n        <form-left-right right-width="{{ $ctrl.width || \'120px\' }}">\n          <left><div class="form-with-button-content" ng-transclude="content"></div></left>\n          <right><div class="form-with-button-button" ng-transclude="button"></div></right>\n        </form-left-right>\n      </div>\n    ',
    bindings: {
      width: '@'
    },
    transclude: {
      content: 'contentArea',
      button: 'buttonArea'
    },
    controller: [function () {}]
  });

  /*
   * <form-input-radio-group> 用于表示一组单选圆点
   * 一组单选圆点中应当有至多一个被选中
   *
   * name （字符串，可省） 表单中这组单选框的名称，缺省时自动生成
   * options （数组） 形如 [ {value: 'value1', text: 'text1' } ] 的数组 ，表示所有可选项
   *    其中 value 表示选择该项时被绑定变量的值， text 表示对应项显示的文本
   *    允许有至多一个数组元素中不包含 value 属性，此时会生成一个文本输入框以便输入自定义值
   * ng-model （字符串，双向） 表示被绑定的变量，空串表示当前没有一个值被选中
   * on-change （回调） 值发生变化时的回调函数
   * required （布尔） 用于表单验证该项必填
   * fallbackValue （布尔|字符串|数组，可选） 不填写时如果值非法则置空
   *   若填写了该项， true 表示会默认选择第一个值
   *   字符串值表示会选择 value 与字符串对应的项
   *   数组可以包含字符串或 true ，表示由前至后逐个检查是否可用
   */
  formInputs.component('formInputRadioGroup', {
    template: '\n      <div class="form-input-radio-container" ng-class="{ \'form-input-radio-as-card\': $ctrl.cardTemplate }">\n        <form-multiple-inline align="{{ $ctrl.width ? \'left\' : \'justify\' }}">\n          <form-multiple-inline-item class="form-input-radio-inner" width="{{ $ctrl.width }}" ng-repeat="option in $ctrl.options">\n            <label ng-if="option.value">\n              <span class="form-input-radio-option-container" ng-class="{ \'form-input-radio-option-checked\': $ctrl.value === option.value }">\n                <span class="form-input-radio-wrapper">\n                  <input class="form-input-radio" type="radio" name="{{ $ctrl.name }}" value="{{ option.value }}" ng-model="$ctrl.value" ng-required="!$ctrl.value && $ctrl.required" />\n                  <span class="form-input-radio-icon"></span>\n                </span>\n                <span class="form-input-radio-text" ng-bind="option.text" ng-if="!$ctrl.cardTemplate"></span>\n                <div class="form-input-radio-card" ng-include="$ctrl.cardTemplate" ng-if="$ctrl.cardTemplate" ng-repeat="item in [option]"></div>\n              </span>\n            </label>\n            <label ng-if="!option.value && !$ctrl.cardTemplate">\n              <span class="form-input-radio-option-container" ng-class="{ \'form-input-radio-option-checked\': $ctrl.value === $ctrl.customFakeValue }">\n                <span class="form-input-radio-wrapper">\n                  <input class="form-input-radio" type="radio" name="{{ $ctrl.name }}" value="{{ $ctrl.customFakeValue }}" ng-model="$ctrl.value" ng-required="!$ctrl.value && $ctrl.required" />\n                  <span class="form-input-radio-icon"></span>\n                </span>\n              <input class="form-input-radio-input" type="text" placeholder="{{ option.text }}" ng-model="$ctrl.customValue" ng-change="$ctrl.updateCustom" />\n              </span>\n            </label>\n          </form-multiple-inline-item>\n        </form-multiple-inline>\n      </div>\n    ',
    bindings: {
      name: '@',
      options: '<',
      ngModel: '=',
      onChange: '&',
      required: '@',
      fallbackValue: '<?',
      width: '@',
      cardTemplate: '@'
    },
    controller: ['$scope', '$timeout', function ($scope, angularTimeout) {
      var $ctrl = this;
      var $timeout = scopedTimeout(angularTimeout, $scope);

      $ctrl.customValue = '';
      $ctrl.customFakeValue = genUniqueId();
      $ctrl.value = '';
      if (!$ctrl.name) $ctrl.name = genUniqueId();

      var isValid = function isValid(value) {
        if (!angular.isArray($ctrl.options)) return null;
        if ($ctrl.options.filter(function (option) {
          return option.value === value;
        }).length) return 'valid';
        if ($ctrl.options.some(function (option) {
          return !option.value;
        })) {
          if ($ctrl.customFakeValue === value) return 'fake';
          return 'custom';
        }
        if (value === '') return 'empty';
        return 'invalid';
      };

      var input = function input() {
        var status = isValid($ctrl.ngModel);
        if (status === 'invalid' || status === 'empty') setToFallback();
        if (status === 'custom' || status === 'fake' || $ctrl.ngModel === $ctrl.customValue) {
          $ctrl.customValue = $ctrl.ngModel;
          $ctrl.value = $ctrl.customFakeValue;
        }
        if (status === 'valid') {
          $ctrl.value = $ctrl.ngModel;
        }
      };

      var setToNull = function setToNull() {
        $ctrl.ngModel = $ctrl.value = null;
        $ctrl.customValue = '';
        triggerChange();
      };

      var setToFallbackHelper = function setToFallbackHelper(target) {
        if (target === true) target = ($ctrl.options[0] || {}).value;
        if (!target) target = null;
        if (angular.isArray(target)) return target.some(setToFallback);
        var status = target === null ? 'null' : isValid(target);
        if (status === null) return;
        if (status === 'invalid' || status === 'fake') return false;
        if (status === 'custom') {
          $ctrl.ngModel = $ctrl.customValue = target;
          $ctrl.value = $ctrl.customFakeValue;
          triggerChange();
        }
        if (status === 'valid') {
          $ctrl.ngModel = $ctrl.value = target;
          triggerChange();
        }
        if (status === 'null' || status === 'empty') {
          setToNull();
        }
        return true;
      };

      var setToFallback = function setToFallback() {
        if (!setToFallbackHelper($ctrl.fallbackValue)) {
          setToNull();
        }
      };

      var output = function output() {
        var status = isValid($ctrl.value);
        if (status === null) return;
        if (status === 'invalid' || status === 'custom' || status === 'empty') {
          setToFallback();
        }
        if (status === 'fake') {
          $ctrl.ngModel = $ctrl.customValue;
          triggerChange();
        }
        if (status === 'valid') {
          $ctrl.ngModel = $ctrl.value;
          triggerChange();
        }
      };

      var updateOption = function updateOption() {
        var status = isValid($ctrl.value);
        if (status === null) return;
        if (status === 'invalid') setToFallback();
        if (status === 'custom') {
          $ctrl.customValue = $ctrl.value;
          $ctrl.value = $ctrl.customFakeValue;
        }
        if (status === 'fake') {
          if (isValid($ctrl.ngModel) === 'valid') {
            $ctrl.value = $ctrl.ngModel;
            $ctrl.customValue = '';
          }
        }
        if (status === 'empty') {
          setToFallback();
        }
        output();
      };

      $ctrl.updateCustom = function (newValue, oldValue) {
        $ctrl.value = $ctrl.customFakeValue;
        output();
      };

      var triggerChange = function triggerChange() {
        $timeout(function () {
          return $ctrl.onChange();
        }, 0);
      };

      input();
      $scope.$watch('$ctrl.ngModel', input);
      $scope.$watch('$ctrl.value', output);
      $scope.$watch('$ctrl.options', updateOption);
    }]
  });
  /*
   * 这是示例，请勿使用
   * 而且样式请勿随意内联
   */
  formInputs.component('formInputRadioCardSample', {
    template: '\n      <span class="form-input-radio-card-sample" style="display: block;">\n        <span style="display: block; font-weight: bold;">\u4E00\u4E9B\u6587\u5B57</span>\n        <span style="display: block;" ng-bind=" $ctrl.option.text "></span>\n      </span>\n    ',
    bindings: { option: '=' },
    controller: [function () {}]
  });

  /*
   * <form-input-checkbox> 用于展示一个复选框
   *
   * name （字符串） 输入框的 name
   * value-true （单向，可选） 勾选时绑定得到的值（默认为"on"）
   * value-false （单向，可选） 未选时绑定得到的值（默认为""）
   * ng-model （双向） 待绑定的对象
   * required （可选） 用于表单验证，表示必须勾选
   * required-false （可选） 用于表单验证，表示必须不勾选（处理错误时同样适用 required 类型错误）
   * on-change （回调） 值改变时回调
   * text （文本，可选） 显示在复选框右侧的文字
   * appearance （文本） 复选框展示的样式，可选 checkbox （默认）、 switch 、 button 和 none
   *
   * transclude 如果没有指定文本，则将包含的内容显示在复选框后，否则将不显示
   */
  formInputs.component('formInputCheckbox', {
    template: '\n      <div class="form-input-checkbox-container" ng-class="{\n        \'form-input-checkbox-as-switch-container\': $ctrl.appearance === \'switch\',\n        \'form-input-checkbox-as-button-container\': $ctrl.appearance === \'button\',\n        \'form-input-checkbox-hidden-container\': $ctrl.appearance === \'none\',\n      }">\n        <input\n          name="{{ $ctrl.valid ? $ctrl.randomName : $ctrl.name }}"\n          type="hidden"\n          ng-model="$ctrl.empty"\n          ng-required="{{ !$ctrl.valid }}"\n          ng-disabled="{{ $ctrl.valid }}"\n        />\n        <label>\n          <span class="form-input-checkbox-option-container" ng-class="{ \'form-input-checkbox-option-checked\': $ctrl.value }">\n            <span class="form-input-checkbox-wrapper">\n              <input class="form-input-checkbox"\n                name="{{ $ctrl.valid ? $ctrl.name : $ctrl.randomName }}"\n                type="checkbox"\n                ng-model="$ctrl.value"\n              />\n              <span class="form-input-checkbox-icon"></span>\n            </span>\n            <span class="form-input-radio-content">\n              <span class="form-input-radio-text" ng-if="$ctrl.text != null" ng-bind="$ctrl.text"></span>\n              <span class="form-input-radio-complex" ng-if="$ctrl.text == null" ng-transclude></span>\n          </span>\n          </span>\n        </label>\n      </div>\n    ',
    bindings: {
      name: '@',
      valueTrue: '<?value',
      valueFalse: '<?',
      ngModel: '=',
      required: '@',
      requiredFalse: '@',
      onChange: '&',
      text: '@?',
      appearance: '@'
    },
    transclude: true,
    controller: ['$scope', '$timeout', function ($scope, angularTimeout) {
      var $ctrl = this;
      var $timeout = scopedTimeout(angularTimeout, $scope);

      $ctrl.empty = '';
      $ctrl.randomName = genUniqueId();
      $ctrl.valid = false;

      if (!$ctrl.name) $ctrl.name = genUniqueId();
      if ($ctrl.valueTrue === void 0) $ctrl.valueTrue = 'on';
      if ($ctrl.valueFalse === void 0) $ctrl.valueFalse = '';

      var input = function input() {
        if ($ctrl.ngModel === $ctrl.valueTrue) $ctrl.value = true;else if ($ctrl.ngModel === $ctrl.valueFalse) $ctrl.value = false;else $ctrl.ngModel = $ctrl.value ? $ctrl.valueTrue : $ctrl.valueFalse;
      };
      var output = function output() {
        if (typeof $ctrl.value !== 'boolean') $ctrl.value = $ctrl.value == true;
        if ($ctrl.ngModel !== $ctrl.valueTrue && $ctrl.value) {
          $ctrl.ngModel = $ctrl.valueTrue;
          $timeout(function () {
            return $ctrl.onChange();
          }, 0);
        }
        if ($ctrl.ngModel !== $ctrl.valueFalse && !$ctrl.value) {
          $ctrl.ngModel = $ctrl.valueFalse;
          $timeout(function () {
            return $ctrl.onChange();
          }, 0);
        }
      };
      var valid = function valid() {
        $ctrl.valid = !($ctrl.value ? $ctrl.requiredFalse : $ctrl.required);
      };
      $scope.$watch('$ctrl.ngModel', input);
      $scope.$watch('$ctrl.value', output);
      $scope.$watch('$ctrl.valueTrue', output);
      $scope.$watch('$ctrl.valueFalse', output);
      $scope.$watch('$ctrl.value', valid);
    }]
  });

  /*
   * <form-search-box> 用来描述一个用于搜索的输入框
   *
   * ng-model 被绑定的值
   * placeholder 预定义文本
   */
  formInputs.component('formSearchBox', {
    template: '\n      <div class="form-search-box-container"><label>\n        <input class="form-search-box-input" type="search" ng-model="$ctrl.ngModel" placeholder="{{ $ctrl.placeholder || \'\' }}" ng-model-option="{ debounce: $ctrl.debounce || 0 }" ng-change="$ctrl.change()" />\n        <icon-search class="form-search-box-icon"></icon-search>\n      </label></div>\n    ',
    bindings: { ngModel: '=', placeholder: '@', debounce: '<?', onChange: '&' },
    controller: ['$scope', '$timeout', function ($scope, angularTimeout) {
      var $ctrl = this;
      var $timeout = scopedTimeout(angularTimeout, $scope);
      $ctrl.change = function () {
        $timeout(function () {
          $ctrl.onChange();
        });
      };
    }]
  });

  /*
   * <form-search-box-with-count> 一个搜索框和一个计数器
   *
   * ng-model 被绑定的值
   * placeholder 预定义文本
   * text-prefix 文本前缀
   * text-suffix 文本后缀
   * total 总数
   * match 匹配数
   */
  formInputs.component('formSearchBoxWithCount', {
    template: '\n      <form-multiple-inline>\n        <form-multiple-inline-item class="form-search-box-text-wrapper">\n          <span class="form-search-box-text" ng-if="$ctrl.total || $ctrl.total === 0">\n            <span class="form-search-box-text-prefix" ng-bind="$ctrl.textPrefix"></span>\n            <span class="form-search-box-text-match" ng-bind="$ctrl.match" ng-if="$ctrl.ngModel"></span>\n            <span class="form-search-box-text-line" ng-if="$ctrl.ngModel">/</span>\n            <span class="form-search-box-text-total" ng-bind="$ctrl.total"></span>\n            <span class="form-search-box-text-prefix" ng-bind="$ctrl.textSuffix"></span>\n          </span>\n        </form-multiple-inline-item>\n        <form-multiple-inline-item class="form-search-box-wrapper">\n          <form-search-box ng-model="$ctrl.ngModel" placeholder="{{ $ctrl.placeholder }}" debounce="$ctrl.debounce" on-change="$ctrl.change()"></form-search-box>\n        </form-multiple-inline-item>\n      </form-multiple-inline>\n    ',
    bindings: {
      ngModel: '=',
      placeholder: '@',
      debounce: '<?',
      textPrefix: '@',
      textSuffix: '@',
      total: '@',
      match: '@',
      onChange: '&'
    },
    controller: ['$scope', '$timeout', function ($scope, angularTimeout) {
      var $ctrl = this;
      var $timeout = scopedTimeout(angularTimeout, $scope);
      $ctrl.change = function () {
        $timeout(function () {
          $ctrl.onChange();
        });
      };
    }]
  });

  /*
   * <form-array-container>
   * 用于维护数组值的表单项，包括添加按钮和逐行的删除按钮
   *
   * type （字符串） 控制外观，可以选择 simple 或 complex
   * ng-model （双向） 被绑定的变量（数组）
   * template （字符串） 用于数组项的模板名称（一个 component 或 directive 名）
   * itemDraft （单向） 添加元素时添加什么
   * onChange （回调） 数组有任何修改时回调
   * onAdd （回调） 数组添加时回调
   * onDelete （回调） 数组删除时回调
   * maxLength （单向，数值） 表示最多允许多少元素，maxLength 应当大于等于 0
   * minLength （单向，数值） 表好似最少需要多少元素，minLength 应当大于等于 0 小于等于 maxLength
   */
  formInputs.component('formArrayContainer', {
    template: '\n      <div class="form-array-container" ng-class="{ \'form-array-container-complex\': $ctrl.type === \'complex\' }">\n        <div class="form-array-item" ng-repeat=\'item in $ctrl.ngModel track by $index\'>\n          <div class="form-array-item-content" ng-if="$ctrl.type === \'simple\'">\n            <div class="form-array-item-wrapper" ng-include="$ctrl.template" ng-if="$ctrl.template"></div>\n          </div>\n          <div class="form-array-item-content" ng-if="$ctrl.type === \'complex\'">\n            <sub-form-container left-column-width="{{ $ctrl.leftColumnWidth }}">\n              <form-config-group>\n                <div class="form-array-item-wrapper" ng-if="$ctrl.template" ng-include="$ctrl.template"></div>\n              </form-config-group>\n            </sub-form-container>\n          </div>\n          <div class="form-array-item-delete" ng-click="$ctrl.deleteItem($index)" ng-if="$ctrl.minLength - 0 === $ctrl.minLength && $ctrl.ngModel.length > $ctrl.minLength">\n            <icon-delete class="form-array-item-delete-icon" ng-if="$ctrl.type === \'simple\'"></icon-delete>\n            <icon-close class="form-array-item-delete-icon" ng-if="$ctrl.type === \'complex\'"></icon-close>\n          </div>\n          <div class="form-array-item-delete form-array-item-delete-disabled" ng-if="!($ctrl.minLength - 0 === $ctrl.minLength && $ctrl.ngModel.length > $ctrl.minLength) && $ctrl.type === \'simple\'">\n            <icon-delete class="form-array-item-delete-icon" ng-if="$ctrl.type === \'simple\'" disabled="disabled"></icon-delete>\n          </div>\n        </div>\n        <div class="form-array-item-add" ng-click="$ctrl.addItem()" ng-if="$ctrl.maxLength - 0 === $ctrl.maxLength && $ctrl.ngModel.length < $ctrl.maxLength"></div>\n      </div>\n    ',
    bindings: {
      ngModel: '=',
      template: '@',
      itemDraft: '<',
      onChange: '&',
      onAdd: '&',
      onDelete: '&',
      maxLength: '<',
      minLength: '<',
      type: '@',
      leftColumnWidth: '@'
    },
    transclude: true,
    controller: ['$scope', function ($scope) {
      var $ctrl = this;

      $ctrl.addItem = function () {
        if (!angular.isArray($ctrl.ngModel)) $ctrl.ngModel = [];
        var item = angular.copy($ctrl.itemDraft);
        if (angular.isFunction(item)) item = item($ctrl.ngModel);
        var index = $ctrl.ngModel.push(item) - 1;
        $ctrl.onAdd({ item: item, index: index });
      };
      $ctrl.deleteItem = function (index) {
        var item = $ctrl.ngModel.splice(index, 1)[0];
        $ctrl.onDelete({ item: item, index: index });
      };
      var fitLength = function fitLength() {
        if (!angular.isArray($ctrl.ngModel)) $ctrl.ngModel = [];
        var maxLength = $ctrl.maxLength,
            minLength = $ctrl.minLength;
        maxLength = Math.max(maxLength - 0 === maxLength ? maxLength : Infinity, 0);
        minLength = Math.max(minLength - 0 === minLength ? minLength : 0, 0);
        if (maxLength < minLength) return;
        while ($ctrl.ngModel.length < minLength) {
          $ctrl.addItem();
        }while ($ctrl.ngModel.length > maxLength) {
          $ctrl.deleteItem($ctrl.ngModel.length - 1);
        }
      };
      var change = function change() {
        $ctrl.onChange();
      };
      fitLength();
      $scope.$watch('$ctrl.ngModel', fitLength, true);
      $scope.$watch('$ctrl.ngModel', change, true);
      $scope.$watch('$ctrl.minLength', fitLength);
      $scope.$watch('$ctrl.maxLength', fitLength);
    }]
  });

  /*
   * <form-search-dropdown>
   * 一个自带搜索下拉菜单的输入框，输入框的可选文本必须在搜索框内，输入框的值是和对应文本对应的值
   * 这个输入框不建议在网页中直接使用，而是建议将其封装于其他功能更具体的输入框中使用。
   *
   * name （字符串） 输入框的 name
   * ng-model （双向，可选） 绑定的变量
   * search-text （双向，可选，字符串） 输入的文本
   * options （单向，数组） 描述候选项的数组，数组项是一个对象，包括以下键值
   *     * text （字符串） 显示的文本
   *     * remark （字符串） 显示的备注文本
   *     * value （任意类型） 选择对应选项时 ngModel 绑定的值
   * isLoading （单向，布尔值，可选） 当前是否正在加载（默认为false）
   * empty-text （字符串） 无候选项时的显示文本
   * loading-text （字符串） 正在加载的显示文本
   * placeholder （字符串） 输入框的预设文本
   * show-input （字符串） 输入框的显示方式，可选择 always（默认） 或 never
   * show-options （字符串） 下拉菜单的显示方式，可选择 always 、 never 或 active（默认）
   * on-search （回调） 输入框文本发生变化时触发
   * on-submit （回调） 下拉菜单提交一个新值时触发
   * on-change （回调） 下拉菜单值变化时触发
   * required （布尔） 是否需要在提交表单时验证本项目必填
   * filte-option （布尔，字符串） 是否在输入时根据输入内容过滤候选项，给定字符串 start 则按前缀匹配（默认子串匹配）
   * submit-on-blur （字符串） 是否失去焦点时自动根据输入的文本选择匹配的选项
   * clear-on-submit （字符串） 是否在选择选项后清空输入框
   */
  formInputs.component('formSearchDropdown', {
    template: '\n      <input type="hidden" name="{{ $ctrl.name }}" ng-required="$ctrl.required" ng-model="$ctrl.ngModel" />\n      <span class="form-search-dropdown-container" id="{{ $ctrl.id }}">\n        <span class="form-search-input-container form-search-input-show-{{ $ctrl.currentlyShowInput }}" ng-show="$ctrl.currentlyShowInput">\n          <icon-search class="form-search-input-icon"></icon-search>\n          <input class="form-search-input" type="text" ng-model="$ctrl.searchText" placeholder="{{ $ctrl.placeholder }}" form="_noform" />\n        </span>\n        <span class="form-search-options-container form-search-options-show-{{ $ctrl.showOptions }}" ng-show="$ctrl.currentlyShowOptions" tab-index="-1">\n          <span class="form-search-options-wrapper">\n            <span class="form-search-options-item-container" ng-repeat="option in $ctrl.filteredOptions track by $index" tabindex="-1" ng-show="$ctrl.isLoading !== true">\n              <span class="form-search-options-item" ng-class="{ \'form-search-options-item-active\': $index === $ctrl.currentIndex }" ng-if="option.value" ng-click="$ctrl.itemOnClick(option, $index)" ng-mouseenter="$ctrl.itemOnMouseenter(option, $index)">\n                <span class="form-search-options-item-text" ng-bind="option.text"></span>\n                <span class="form-search-options-item-remark" ng-bind="option.remark" ng-if="option.remark"></span>\n              </span>\n            </span>\n          </span>\n          <span class="form-search-options-empty" ng-show="$ctrl.isLoading !== true && $ctrl.filteredOptions.length === 0" ng-bind="$ctrl.emptyText || \'\'"></span>\n          <span class="form-search-options-loading" ng-show="$ctrl.isLoading === true" ng-bind="$ctrl.loadingText || \'\'"></span>\n        </span>\n      </span>\n    ',
    bindings: {
      name: '@',
      ngModel: '=?',
      searchText: '=?',
      options: '<',
      isLoading: '<?',
      emptyText: '@',
      loadingText: '@',
      placeholder: '@',
      showInput: '@',
      showOptions: '@',
      onSearch: '&',
      onSubmit: '&',
      onChange: '&',
      required: '@',
      filteOption: '@',
      submitOnBlur: '@',
      clearOnSubmit: '@',
      blurOnSubmit: '@',
      parentActive: '=?'
    },
    controller: ['$scope', '$document', '$timeout', function ($scope, $document, angularTimeout) {
      var $ctrl = this;
      var $timeout = scopedTimeout(angularTimeout, $scope);
      var cleanup = cleanUpCollections($scope);

      $ctrl.searchText = '';
      $ctrl.id = genUniqueId();

      // 检查事件是否在下拉框内
      var eventInContainer = function eventInContainer(event) {
        var target = angular.element(event.target);
        var container = angular.element(document.getElementById($ctrl.id));
        return container && container.find(target).length > 0;
      };

      // 维护相关元素的展示与隐藏
      var active = false;
      var updateShowHide = function updateShowHide() {
        $ctrl.currentlyShowInput = {
          always: true,
          never: false
        }[$ctrl.showInput || 'always'];
        $ctrl.currentlyShowOptions = {
          always: true,
          never: false,
          active: active || $ctrl.parentActive
        }[$ctrl.showOptions || 'active'];
      };
      updateShowHide();
      $scope.$watch('$ctrl.showInput', updateShowHide);
      $scope.$watch('$ctrl.showOptions', updateShowHide);

      // 维护当前激活的选项
      $ctrl.currentIndex = -1;
      $ctrl.currentOption = null;
      var setCurrentOption = function setCurrentOption(option, index) {
        $ctrl.currentOption = option;
        $ctrl.currentIndex = index;
      };
      var isTextMatchCurrentOption = function isTextMatchCurrentOption(text) {
        if (!$ctrl.currentOption) return false;
        return text === $ctrl.currentOption.text;
      };
      var clearCurrentOption = function clearCurrentOption() {
        $ctrl.currentOption = null;
        $ctrl.currentIndex = -1;
      };
      // 维护当前选择的选项
      $ctrl.chosedOption = null;
      $ctrl.ngModel = null;
      var setChosedOption = function setChosedOption(option) {
        if (option === null) return clearChosedOption();
        $ctrl.chosedOption = option;
        $ctrl.ngModel = option.value;
        $ctrl.searchText = option.text;
        setCurrentOption(option, -1);
        $timeout(function () {
          $ctrl.onChange({ option: option });
          $ctrl.onSubmit({ option: option });
          if ($ctrl.clearOnSubmit) clearChosedOption();
        }, 0);
      };
      var clearChosedOption = function clearChosedOption() {
        $ctrl.chosedOption = null;
        $ctrl.ngModel = null;
        $ctrl.searchText = '';
        $timeout(function () {
          return $ctrl.onChange({ option: null });
        }, 0);
        clearCurrentOption();
      };

      // 下拉菜单被激活
      var focus = function focus() {
        active = true;
        updateOptions();
        updateShowHide();
      };
      // 下拉菜单失去焦点
      var blur = function blur() {
        if ($ctrl.submitOnBlur) {
          // 如果当前的文本不匹配激活的项目，那么找一找有没有任何匹配的项目，并激活
          if (!isTextMatchCurrentOption($ctrl.searchText)) {
            updateCurrentIndex();
          }
          if (isTextMatchCurrentOption($ctrl.searchText)) {
            // 如果匹配了任何项目，则选择
            setChosedOption($ctrl.currentOption);
          } else if ($ctrl.searchText === '') {
            // 如果输入框被清空，那么清空选项
            clearChosedOption();
          } else {
            // 如果条件都不满足，将输入框设置为合适的值
            setChosedOption($ctrl.chosedOption);
          }
        } else {
          setChosedOption($ctrl.chosedOption);
        }
        active = false;
        updateShowHide();
      };
      var makeMeBlur = function makeMeBlur() {
        $timeout(function () {
          document.body.focus();
          blur();
        }, 0);
      };

      // 监听点击或焦点的事件，处理显示和隐藏
      var focusEventHandler = function focusEventHandler(event) {
        var contained = eventInContainer(event);
        if (contained !== active) {
          if (contained) focus();else blur();
          $timeout(function () {});
        }
      };
      $document.on('click focus focusin', focusEventHandler);
      cleanup(function () {
        return $document.off('click focus focusin', focusEventHandler);
      });

      // 某个选项被点击
      $ctrl.itemOnClick = function (option, index) {
        setChosedOption(option);
        if ($ctrl.blurOnSubmit) makeMeBlur();
      };
      $ctrl.itemOnMouseenter = function (option, index) {
        setCurrentOption(option, index);
      };

      var setCurrentIndex = function setCurrentIndex(index) {
        var options = $ctrl.filteredOptions;
        if (!options || !options.length) return;
        if (index >= options.length) index = 0;
        if (index < 0) index = options.length - 1;
        setCurrentOption(options[index], index);
      };
      var keyboardArrowDown = function keyboardArrowDown() {
        setCurrentIndex($ctrl.currentIndex + 1);
      };
      var keyboardArrowUp = function keyboardArrowUp() {
        setCurrentIndex($ctrl.currentIndex - 1);
      };
      var choseCurrent = function choseCurrent() {
        if (!$ctrl.currentOption) return;
        setChosedOption($ctrl.currentOption);
      };
      var keyboardEventHandler = function keyboardEventHandler(event) {
        if (!(active || $ctrl.parentActive)) return;
        var action = {
          40: keyboardArrowDown,
          38: keyboardArrowUp,
          13: function _() {
            choseCurrent();
            if ($ctrl.blurOnSubmit) makeMeBlur();
          },
          27: makeMeBlur
        }[event.keyCode];
        if (action) {
          action();
          event.preventDefault();
          event.stopPropagation();
          $timeout(function () {
            $timeout(updateScroll, 0);
            $timeout(updateScroll, 250);
          });
        }
      };
      $document.on('keydown', keyboardEventHandler);
      cleanup(function () {
        return $document.on('keydown', keyboardEventHandler);
      });

      // 根据当前的搜索文本找到激活的项目
      // 如果找到了完全匹配的项目，则激活该项目
      // 如果没有找到任何匹配的项目，那么激活指定的默认位置位置的项目
      // 默认位置为 -1 时，不激活任何项目
      var updateCurrentIndex = function updateCurrentIndex() {
        var options = $ctrl.filteredOptions || [],
            text = $ctrl.searchText;
        if (isTextMatchCurrentOption(text)) return;
        var found = -1;
        options.some(function (opt, index) {
          if (opt.text !== text) return false;
          found = index;
          return true;
        });
        if (found !== -1) {
          setCurrentOption(options[found], found);
        } else {
          clearCurrentOption();
        }
      };

      // 触发 onSearch 事件提交
      var lastSearchText = null;
      var triggerOnSearch = function triggerOnSearch() {
        var text = $ctrl.searchText;
        var delay = $ctrl.searchDelay ? Number($ctrl.searchDelay) : 200;
        if (!delay && delay !== 0 || delay < 0) delay = 200;
        if (text === lastSearchText) return;
        $timeout(function () {
          if ($ctrl.searchText !== text) return;
          $ctrl.onSearch({ text: $ctrl.searchText });
        }, delay);
      };

      // 根据输入的内容和所有候选项筛选
      var updateOptions = function updateOptions() {
        triggerOnSearch();

        var options = $ctrl.options || [];
        if ($ctrl.filteOption) {
          var testIndexOf = $ctrl.filteOption === 'start' ? function (i) {
            return i === 0;
          } : function (i) {
            return i !== -1;
          };
          options = options.filter(function (opt) {
            return testIndexOf((opt.text || '').indexOf($ctrl.searchText));
          });
        }
        if (!angular.equals(options, $ctrl.filteredOptions)) {
          $ctrl.filteredOptions = angular.copy(options);
        }

        updateCurrentIndex();
      };

      $scope.$watch('$ctrl.searchText', updateOptions);
      $scope.$watch('$ctrl.options', updateOptions);

      // 按上下键选择候选项时，滚动条要跟着滚动到正确的位置
      var updateScroll = function updateScroll() {
        var container = angular.element(document.getElementById($ctrl.id));
        var optionsContainer = angular.element('.form-search-options-wrapper', container);
        var activeOption = angular.element('.form-search-options-item-active', optionsContainer).parent();
        if (activeOption && activeOption[0]) {
          var top = activeOption[0].offsetTop,
              bottom = top + activeOption.height();
          var scrollTop = optionsContainer.scrollTop(),
              scrollBottom = scrollTop + optionsContainer.height();
          var scrollTo = null;
          if (top < scrollTop) {
            scrollTo = top;
          } else if (bottom > scrollBottom) {
            scrollTo = bottom - optionsContainer.height();
          }
          if (scrollTo !== null) {
            optionsContainer.stop(true, true).animate({ scrollTop: scrollTo }, 200);
          }
        } else {
          optionsContainer.stop(true, true).scrollTop(0);
        }
      };

      // 当外部设置一个 ngModel 值时，根据外部的值设置选择框
      var input = function input(newValue, oldValue) {
        var options = $ctrl.options;
        var matchedOption = null;
        // 如果设置为空，那么清空下拉框
        if ($ctrl.ngModel == null) {
          if ($ctrl.ngModel !== null) $ctrl.ngModel = null;
          if ($ctrl.chosedOption) {
            $ctrl.onChange({ option: null });
            clearChosedOption();
          }
        }
        // 如果设置不空，那么查找对应的设置项
        if ($ctrl.ngModel === $ctrl.chosedOption) {
          matchedOption = $ctrl.chosedOption;
        } else {
          options.some(function (opt) {
            if (opt.value === $ctrl.ngModel) {
              matchedOption = opt;
              return true;
            }
            return false;
          });
        }
        if (matchedOption) {
          // 如果设置的值合法，那么修改为这个值并递交相应的修改和递交事件
          $ctrl.searchText = matchedOption.text;
          $ctrl.onChange({ option: matchedOption });
          $ctrl.onSubmit({ option: matchedOption });
          if ($ctrl.clearOnSubmit) clearChosedOption();
        } else {
          // 如果设置项不合法，那么回退到上次选择的选项去
          if ($ctrl.chosedOption) $ctrl.ngModel = $ctrl.chosedOption.value;else $ctrl.ngModel = null;
          $ctrl.onChange({ option: $ctrl.chosedOption });
          if ($ctrl.chosedOption) {
            $ctrl.onSubmit({ option: $ctrl.chosedOption });
            if ($ctrl.clearOnSubmit) clearChosedOption();
          }
        }
      };
      $scope.$watch('$ctrl.ngModel', input);
    }]
  });

  /*
   * <form-select> 表示一个下拉选择框
   * name （字符串） 输入框的 name
   * ngModel （双向） 绑定的变量
   * options （单向） 候选项，格式参考 form-search-dropdown
   * placeholder （字符串） 未选择任何内容时显示的文本
   * onChange （回调） 值变化时的回调函数
   * required （布尔） 是否为必填项
   * emptyText （文本） 候选项为空时显示的文字
   * showSearchInput （布尔） 是否在下拉菜单中显示搜索用输入框，可以写 never 或 always
   * isLoading （布尔，可选） 表示是否正在加载
   * loadingText （文本，可选） 正在加载时显示的文本
   */
  formInputs.component('formSelect', {
    template: '\n      <span id="{{ $ctrl.id }}" class="form-select-container">\n        <input type="hidden" name="{{ $ctrl.name }}" ng-required="$ctrl.required" value="$ctrl.ngModel" />\n        <span class="form-select-wrapper">\n          <span class="form-select-fake-input" tabindex="0">\n            <span class="form-select-fake-input-value" ng-show="$ctrl.ngModel" ng-bind="$ctrl.text"></span>\n            <span class="form-select-fake-input-placeholder" ng-show="!$ctrl.ngModel" ng-bind="$ctrl.placeholder"></span>\n            <icon-drop-down class="form-select-down-icon"></icon-drop-down>\n          </span>\n        </span>\n        <form-search-dropdown\n          class="form-select-dropdown"\n          ng-model="$ctrl.value"\n          ng-class="{ \'form-select-dropdown-with-search\': $ctrl.showSearchInput !== \'never\' }"\n          ng-show="$ctrl.active"\n          options="$ctrl.options"\n          on-submit="$ctrl.onValueChange(option)"\n          empty-text="{{ $ctrl.emptyText || \'\' }}"\n          show-input="{{ $ctrl.showSearchInput || \'always\' }}"\n          show-options="always"\n          filte-option="{{ $ctrl.showSearchInput !== \'never\' ? \'filte-option\' : \'\' }}"\n          clear-on-submit="clear-on-submit"\n          input-in-dropdown="input-in-dropdown"\n          parent-active="$ctrl.active"\n          blur-on-submit="blur-on-submit"\n          is-loading="$ctrl.isLoading"\n          loading-text="{{ $ctrl.loadingText || \'\' }}"\n        ></form-search-dropdown>\n      </span>\n    ',
    bindings: {
      name: '@',
      ngModel: '=',
      options: '<',
      placeholder: '@',
      onChange: '&',
      required: '@',
      emptyText: '@',
      showSearchInput: '@',
      isLoading: '<',
      loadingText: '@'
    },
    controller: ['$scope', '$timeout', '$document', function ($scope, angularTimeout, $document) {
      var $ctrl = this;
      var $timeout = scopedTimeout(angularTimeout, $scope);
      var cleanup = cleanUpCollections($scope);

      $ctrl.active = false;
      $ctrl.id = genUniqueId();
      $ctrl.ngModel = null;
      $ctrl.value = null;

      var eventInContainer = function eventInContainer(event) {
        var target = angular.element(event.target);
        var container = angular.element(document.getElementById($ctrl.id));
        return container && container.find(target).length > 0;
      };
      var focusEventHandler = function focusEventHandler(event) {
        $ctrl.active = eventInContainer(event);
        $timeout(function () {});
      };
      $document.on('click focus focusin', focusEventHandler);
      cleanup(function () {
        return $document.on('click focus focusin', focusEventHandler);
      });

      $ctrl.onValueChange = function (option) {
        if (option) {
          $ctrl.text = option.text;
          $ctrl.ngModel = option.value;
          $timeout(function () {
            return $ctrl.onChange({ option: option });
          }, 0);
        }
        $timeout(function () {
          return $ctrl.active = false;
        }, 0);
      };

      $scope.$watch('$ctrl.ngModel', function () {
        $ctrl.value = $ctrl.ngModel;
      });
    }]
  });

  /*
   * <form-multiple-select>
   */
  formInputs.component('formMultipleSelect', {
    template: '\n      <span id="{{ $ctrl.id }}" class="form-select-container form-multiple-select-container">\n        <input type="hidden" name="{{ $ctrl.name }}" ng-required="$ctrl.required"\n          value="$ctrl.ngModel.join(\'; \')" maxlength="" />\n        <span class="form-select-wrapper">\n          <span class="form-select-fake-input">\n            <ul class="form-select-item-collection">\n              <li class="form-select-chosed-item" ng-repeat="item in $ctrl.chosed" ng-class="{ \'form-select-chosed-about-to-delete\': $index === $ctrl.aboutToDelete }">\n                <span class="form-select-chosed-item-text" ng-bind="item.text"></span>\n                <icon type="close" class="form-select-chosed-item-delete" ng-click="$ctrl.deleteChosedItem(item)">\n              </li>\n              <li class="form-select-input-item">\n                <span class="form-select-input-text" ng-bind="$ctrl.searchText || $ctrl.placeholder" || \'\'></span>\n                <input type="text" class="form-select-input" placeholder="{{ $ctrl.placeholder }}" ng-model="$ctrl.searchText" ng-trim="false" form="_noform" />\n              </li>\n            </ul>\n          </span>\n        </span>\n        <form-search-dropdown\n          class="form-select-dropdown"\n          ng-model="$ctrl.value"\n          ng-show="$ctrl.active"\n          search-text="$ctrl.searchText"\n          options="$ctrl.options"\n          on-submit="$ctrl.onValueChange(option)"\n          empty-text="{{ $ctrl.emptyText || \'\' }}"\n          show-input="never"\n          show-options="always"\n          filte-option="filte-option"\n          clear-on-submit="clear-on-submit"\n          parent-active="$ctrl.active"\n          is-loading="$ctrl.isLoading || false"\n          loading-text="{{ $ctrl.loadingText || \'\' }}"\n        ></form-search-dropdown>\n      </span>\n    ',
    bindings: {
      name: '@',
      ngModel: '=',
      options: '<',
      placeholder: '@',
      onChange: '&',
      emptyText: '@',
      minLength: '@',
      maxLength: '@',
      isLoading: '<?',
      loadingText: '@'
    },
    controller: ['$scope', '$timeout', '$document', function ($scope, angularTimeout, $document) {
      var $ctrl = this;
      var $timeout = scopedTimeout(angularTimeout, $scope);
      var cleanup = cleanUpCollections($scope);

      $ctrl.active = false;
      $ctrl.id = genUniqueId();
      $ctrl.ngModel = null;
      $ctrl.value = null;
      $ctrl.searchText = '';
      $ctrl.chosed = [];

      // 检查当前是否应当“激活”
      // “激活”时显示下拉候选选项
      var eventInContainer = function eventInContainer(event) {
        var target = angular.element(event.target);
        var container = angular.element(document.getElementById($ctrl.id));
        var contained = container && container.find(target).length > 0;
        return contained;
      };
      var focusOnInput = function focusOnInput() {
        var container = angular.element(document.getElementById($ctrl.id));
        var input = angular.element('.form-select-input', container)[0];
        if (input && input !== document.activeElement) input.focus();
      };
      var focusEventHandler = function focusEventHandler(event) {
        $ctrl.active = eventInContainer(event);
        if ($ctrl.active) focusOnInput();
        $timeout(function () {});
      };
      $document.on('click focus focusin', focusEventHandler);
      cleanup(function () {
        return $document.off('click focus focusin', focusEventHandler);
      });

      // 处理新增选中项的情况
      $ctrl.onValueChange = function (option) {
        if (!angular.isArray($ctrl.chosed)) $ctrl.chosed = [];
        var collections = $ctrl.chosed;
        var find = null;
        collections.some(function (o, i) {
          if (!angular.equals(o, option)) return false;
          find = i;
          return true;
        });
        if (find !== collections.length - 1) {
          if (find !== null) $ctrl.chosed.splice(find, 1);
          $ctrl.chosed.push(option);
        }
        $timeout(focusOnInput, 0);
        output();
      };
      // 处理删除选中项
      $ctrl.deleteChosedItem = function (option) {
        var index = $ctrl.chosed.indexOf(option);
        $ctrl.chosed.splice(index, 1);
        $timeout(focusOnInput, 0);
        output();
      };

      // 按退格键可以删除一个已选项
      $ctrl.aboutToDelete = null;
      // 检查是否当前“选中”了某项
      var isAboutToDelete = function isAboutToDelete() {
        return $ctrl.aboutToDelete !== null;
      };
      // 确认并删除当前“选中”元素
      var deleteCurrentItem = function deleteCurrentItem() {
        var valid = true;
        if (!$ctrl.chosed || !$ctrl.chosed.length) valid = false;
        if ($ctrl.aboutToDelete === null) valid = false;
        if ($ctrl.aboutToDelete < 0 || $ctrl.aboutToDelete >= $ctrl.chosed.length) valid = false;
        if (valid) {
          $ctrl.deleteChosedItem($ctrl.chosed[$ctrl.aboutToDelete]);
        }
        $ctrl.aboutToDelete = null;
        return valid;
      };
      // 如果当前有元素被选中，按退格键会删除该元素
      // 否则；如果在输入框开头按退格键，那么最后一个元素被“选中”
      var targetedBackspacePressed = function targetedBackspacePressed() {
        if (deleteCurrentItem()) return;else {
          $ctrl.aboutToDelete = $ctrl.chosed.length - 1;
        }
      };
      // 输入框为空时按方向键，或当前有元素被选中时按方向键
      // 根据左右向前/后移动“选中”的光标
      // 如果想后移动到最后，则取消“选中”
      var targetedHorizontalArrowPressed = function targetedHorizontalArrowPressed(d) {
        var target = $ctrl.aboutToDelete;
        if (target === null) target = $ctrl.chosed.length;
        target += d;
        if (target >= $ctrl.chosed.length) $ctrl.aboutToDelete = null;
        $ctrl.aboutToDelete = target;
      };
      // 触发任何其他事件时，取消“选中”
      var otherEventTriggered = function otherEventTriggered(e) {
        $ctrl.aboutToDelete = null;
      };
      // 检查当前事件是否是在输入框上的 keydown
      var isInputTargetedKeypress = function isInputTargetedKeypress(e) {
        if (e.type !== 'keydown') return false;
        var container = angular.element(document.getElementById($ctrl.id));
        var input = angular.element('.form-select-input', container)[0];
        if (e.target !== input) return false;
        return true;
      };
      // 检查当前光标是否在输入框开头
      var cursorAtInputBegining = function cursorAtInputBegining() {
        var container = angular.element(document.getElementById($ctrl.id));
        var input = angular.element('.form-select-input', container)[0];
        if (document.activeElement !== input) return false;

        var cursorPosition = null;
        // stackoverflow.com/questions/2897155/get-cursor-position-in-characters-within-a-text-input-field
        if ('selectionStart' in input) {
          cursorPosition = input.selectionStart;
        } else if (document.selection) {
          var sel = document.selection.createRange();
          var selLen = document.selection.createRange().text.length;
          sel.moveStart('character', -input.value.length);
          cursorPosition = sel.text.length - selLen;
        }
        if (cursorPosition !== 0) return false;
        return true;
      };
      // 检查当前输入框是否空
      var isEmptyInput = function isEmptyInput() {
        return $ctrl.searchText === '';
      };
      // 处理所有点击、焦点和按键事件
      var eventHandler = function eventHandler(e) {
        var handled = false;
        if (isInputTargetedKeypress(e)) {
          if (e.keyCode === 8 /* backspace */) {
              if (isAboutToDelete()) {
                handled = true;
                deleteCurrentItem();
              } else if (cursorAtInputBegining()) {
                handled = true;
                targetedBackspacePressed();
              }
            }
          if (e.keyCode === 37 /* left */ || e.keyCode === 39 /* right */) {
              var dir = e.keyCode === 39 ? 1 : -1;
              if (isEmptyInput() || isAboutToDelete()) {
                handled = true;
                targetedHorizontalArrowPressed(dir);
              }
            }
          if (e.keyCode === 46 /* forward delete */) {
              if (isAboutToDelete()) {
                handled = true;
                deleteCurrentItem();
              }
            }
        }
        if (handled) {
          e.preventDefault();
        } else if (isAboutToDelete) {
          handled = true;
          otherEventTriggered(e);
        }
        if (handled) {
          $timeout(function () {});
        }
      };

      $document.on('click focusin focusout keydown', eventHandler);
      cleanup(function () {
        $document.off('click focusin focusout keydown', eventHandler);
      });

      var output = function output() {
        var newValue = $ctrl.chosed.map(function (option) {
          return option.value;
        });
        if (angular.equals(newValue, $ctrl.ngModel)) return;
        $ctrl.ngModel = newValue;
        $timeout(function () {
          return $ctrl.onChange();
        }, 0);
      };

      var input = function input() {
        if (!angular.isArray($ctrl.ngModel)) $ctrl.ngModel = [];
        if (!angular.isArray($ctrl.options)) $ctrl.options = [];
        if (!angular.isArray($ctrl.chosed)) $ctrl.chosed = [];
        var allOptions = $ctrl.options.concat($ctrl.chosed);
        $ctrl.chosed = $ctrl.ngModel.map(function (value) {
          return allOptions.filter(function (option) {
            return option.value === value;
          })[0] || null;
        }).filter(function (x) {
          return x;
        });
        output();
      };
      $scope.$watch('$ctrl.ngModel', input);
    }]
  });

  /*
   * <form-table> 用来在表单中展示一个表格
   *
   * ng-model （双向，对象） 表格绑定的值
   * columns （单向，数组） 一个描述表格有哪些列和这些列的外观与行为的数组，数组元素是一个对象，包括以下键值
   *     * text （字符串） 表格头部将要显示的文本
   *     * key （字符串，可省） 用于这一列中对应单元格的 value 与对应行的对象的哪个键相对应
   * template （字符串） 用于描述单元格样式的模板的名称，每个单元格处将会调用这个模板展示，调用时会提供以下变量
   *     * column （对象） columns 中对应列的那个对象
   *     * row （对象） ngModel 中对应行的那个对象
   *     * value （任意类型） row[column.key] 的简写
   *     * edit （布尔） 当前是否是编辑状态
   *     * rowIndex, columnIndex 当前行号、列号
   * on-save, on-before-edit, on-cancel-edit （回调） 分别用于用户点击“保存”、“编辑”或“取消”时的回调函数，回调函数包括以下值
   *     * data 这一行的数据，取消编辑时是修改后的值
   *     * index 行号
   *   这三个属性如果都未提供，则表格不显示编辑按钮，如果需要编辑功能但是不需要任何回调，可以注册空回调
   * on-delete （回调） 用户点击“删除”时的回调，参数和注意事项参考上文 on-save
   * disabled （字符串） 非空串表示表格禁用编辑，此时不展示操作列，编辑或删除
   * compare-key （字符串，可选） 用于 no-edit, no-delete 参数，如果不传则按照对象比较，否则按特定键值比较
   * no-edit （数组） 如果某行的对象根据 compare-key 指定的比较方式和本数组内的任一值相等，则不可编辑
   * no-delete （数组） 类似 no-edit ，相等时不可删除
   *   请注意，一般情况下，no-edit, no-delete 的元素应当和 ng-model 的元素使用同一个对象的引用
   *   这样可以避免元素被编辑或其他方式修改后，因为不再相等而可以删除的问题
   * custom-buttons （数组） 数组元素是结构体，用于描述表格中额外包括哪些自定义的按钮，结构体包括键值如下
   *     * icon （文本） 表示图标的名称，请参考 <icon-*> 组件
   *     * text （文本） 鼠标划到图标上时显示的文本
   * on-custom-button （回调） 用于点击自定义按钮时展示动作，除上文回调的参数外，额外增加一个参数 action 表示哪个自定义按钮的对象
   * filter （对象，可选） 用于展示用的过滤器，是 angular 的 filter 管道的参数
   * edited-data （对象，可选） 表示当前哪些行处于被编辑状态，键是被编辑的行号，值是这行编辑前的内容
   *   请注意：如果完成某行的编辑，你应当从结构体中使用 delete 删除对应的键值对，而非赋值为 null 或 (void 0)
   */
  formInputs.component('formTable', {
    template: '\n      <table class="form-table">\n        <colgroup ng-if="$ctrl.columns.length">\n          <col class="form-table-column" ng-repeat="column in $ctrl.columns track by $index" ng-style="{ width: column.width || \'auto\' }"></col>\n        </colgroup>\n        <colgroup ng-if="$ctrl.hasButtons()">\n          <col class="form-table-column form-table-action-column" ng-style="{ width: 20 + 30 * $ctrl.buttonCount() }"></col>\n        </colgroup>\n        <thead>\n          <tr class="form-table-first-row">\n            <th class="form-table-column-title" ng-repeat="column in $ctrl.columns track by $index" ng-bind="column.text""></th>\n            <th class="form-table-column-title form-table-action-column-title" ng-if="$ctrl.hasButtons()">\u64CD\u4F5C</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat="(rowIndex, row) in (($ctrl.ngModel || []) | filter:$ctrl.filterRule()) track by $index" class="form-table-row" ng-class="{ \'form-table-row-edit\': $ctrl.getEditStatus(rowIndex), \'form-table-last-row\': $ctrl.ngModel.length - 1 === rowIndex }">\n            <td ng-repeat="(columnIndex, column) in $ctrl.columns track by $index" class="form-table-ceil">\n              <div ng-repeat="edit in [$ctrl.getEditStatus(rowIndex)] track by $index">\n                <div ng-repeat="value in [row[column.key]] track by $index">\n                  <div ng-repeat="param in [$ctrl.param] track by $index">\n                    <div ng-include="$ctrl.template"></div>\n                  </div>\n                </div>\n              </div>\n            </td>\n            <td ng-if="$ctrl.hasButtons()" class="form-table-ceil form-table-action-ceil">\n              <div ng-if="!$ctrl.getEditStatus(rowIndex)">\n                <icon-group>\n                  <icon-by-name ng-repeat="action in $ctrl.customButtons" name="{{ action.icon }}" ng-click="$ctrl.customButton(action, rowIndex)" tooltip="{{ action.text }}"></icon-by-name>\n                  <icon-edit tooltip="\u7F16\u8F91" ng-click="$ctrl.mayEdit(rowIndex) && $ctrl.beforeEdit(rowIndex)" ng-if="$ctrl.hasEdit()" disabled="{{ $ctrl.mayEdit(rowIndex) ? \'\' : \'disabled\' }}"></icon-edit>\n                  <icon-delete tooltip="\u5220\u9664" ng-click="$ctrl.mayDelete(rowIndex) && $ctrl.deleteItem(rowIndex)" ng-if="$ctrl.hasDelete()" disabled="{{ $ctrl.mayDelete(rowIndex) ? \'\' : \'disabled\' }}"></icon-delete>\n                </icon-group>\n              </div>\n              <div ng-if="$ctrl.getEditStatus(rowIndex)">\n                <icon-group>\n                  <icon-save tooltip="\u4FDD\u5B58" ng-click="$ctrl.saveItem(rowIndex)"></icon-save>\n                  <icon-cancel tooltip="\u53D6\u6D88" ng-click="$ctrl.cancelEdit(rowIndex)"></icon-cancel>\n                </icon-group>\n              </div>\n            </td>\n          </tr>\n          <tr ng-if="$ctrl.emptyText && (($ctrl.ngModel || []) | filter:$ctrl.filterRule()).length === 0" class="form-table-row form-table-row-empty">\n            <td class="form-table-empty-text" colspan="{{ $ctrl.columns.length + $ctrl.hasButtons() }}" ng-bind="$ctrl.emptyText"></td>\n          </tr>\n        </tbody>\n      </table>\n    ',
    bindings: {
      columns: '<',
      onDelete: '&?',
      onSave: '&?',
      onBeforeEdit: '&?',
      onCancelEdit: '&?',
      disabled: '@',
      noDelete: '<?',
      noEdit: '<?',
      template: '@',
      ngModel: '=',
      onCustomButton: '&?',
      customButtons: '<?',
      compareKey: '@',
      emptyText: '@',
      filter: '<?',
      editedData: '=?',
      param: '<?'
    },
    controller: [function () {
      var $ctrl = this;

      $ctrl.hasEdit = function () {
        return !!($ctrl.onBeforeEdit || $ctrl.onCancelEdit || $ctrl.onSave);
      };
      $ctrl.hasDelete = function () {
        return !!$ctrl.onDelete;
      };
      $ctrl.hasButtons = function () {
        return !!(!$ctrl.disabled && ($ctrl.hasEdit() || $ctrl.hasDelete() || $ctrl.onCustomButton || $ctrl.customButtons));
      };
      $ctrl.buttonCount = function () {
        return $ctrl.hasEdit() + $ctrl.hasDelete() + ($ctrl.customButtons || []).length;
      };
      $ctrl.getEditStatus = function (index) {
        return !!($ctrl.hasButtons() && !$ctrl.ngModel[index].disabled && index in $ctrl.editedData || false);
      };
      var sameItem = function sameItem(x, y) {
        return $ctrl.compareKey ? angular.equals(x[$ctrl.compareKey], y[$ctrl.compareKey]) : angular.equals(x, y);
      };
      $ctrl.mayEdit = function (index) {
        return ($ctrl.noEdit || []).every(function (v) {
          return !sameItem(v, $ctrl.ngModel[index]);
        });
      };
      $ctrl.mayDelete = function (index) {
        return ($ctrl.noDelete || []).every(function (v) {
          return !sameItem(v, $ctrl.ngModel[index]);
        });
      };

      $ctrl.editedData = {};
      $ctrl.beforeEdit = function (index) {
        if ($ctrl.onBeforeEdit) $ctrl.onBeforeEdit({ data: $ctrl.ngModel[index], index: index });
        $ctrl.editedData[index] = angular.copy($ctrl.ngModel[index]);
      };
      $ctrl.saveItem = function (index) {
        if ($ctrl.onSave) $ctrl.onSave({ data: $ctrl.ngModel[index], index: index });
        delete $ctrl.editedData[index];
      };
      $ctrl.deleteItem = function (index) {
        if ($ctrl.onDelete) $ctrl.onDelete({ data: $ctrl.ngModel[index], index: index });
        $ctrl.ngModel.splice(index, 1);
        for (var i = index; i < $ctrl.ngModel.length; i++) {
          if (i + 1 in $ctrl.editedData) {
            $ctrl.editedData[i] = $ctrl.editedData[i + 1];
            delete $ctrl.editedData[i + 1];
          }
        }
      };
      $ctrl.cancelEdit = function (index) {
        if ($ctrl.onCancelEdit) $ctrl.onCancelEdit({ data: $ctrl.ngModel[index], index: index });
        angular.copy($ctrl.editedData[index], $ctrl.ngModel[index]);
        delete $ctrl.editedData[index];
      };
      $ctrl.customButton = function (action, index) {
        if ($ctrl.onCustomButton) $ctrl.onCustomButton({ action: action, index: index, data: $ctrl.ngModel[index] });
      };

      $ctrl.filterRule = function () {
        return $ctrl.filter || {};
      };
    }]
  });

  /*
   * <input-with-copy> 一个带复制按钮的只读文本框
   *
   * ng-model （双向） 文本框显示的文字
   * appearance （可选，字符串） 可以取值 input（默认）, textarea, codearea
   *   input 输入框展示成单行输入框
   *   textarea 输入框展示成多行文本框
   * readonly （字符串） 输入框是否只读
   * language （字符串） 仅 codearea 时有效，指示代码语言
   *
   * 其他依赖：依赖 clipboard.js
   */
  formInputs.component('inputWithCopy', {
    template: '\n      <div class="input-with-button" id="{{ $ctrl.id }}">\n        <div class="input-with-button-input">\n          <input ng-if="$ctrl.appearance !== \'textarea\' && $ctrl.appearance !== \'codearea\'" type="text" ng-model="$ctrl.ngModel" ng-readonly="$ctrl.readonly" />\n          <textarea ng-if="$ctrl.appearance === \'textarea\'" ng-model="$ctrl.ngModel" ng-readonly="$ctrl.readonly"></textarea>\n          <codearea ng-if="$ctrl.appearance === \'codearea\'" ng-model="$ctrl.ngModel" readonly="{{ $ctrl.readonly ? \'readonly\' : \'\' }}" language="$ctrl.language"></codearea>\n        </div>\n        <div class="input-with-button-button">\n          <button type="button" class="input-with-button-copy" data-clipboard-target="#{{ $ctrl.id }} input, #{{ $ctrl.id }} textarea"><icon-clipboard></icon-clipboard></button>\n        </div>\n      </div>\n    ',
    bindings: {
      ngModel: '=',
      appearance: '@?',
      language: '@',
      readonly: '@'
    },
    controller: ['api', function (api) {
      var $ctrl = this;
      $ctrl.id = genUniqueId();
      var script = api.loadScript('/lib/js/clipboard.js/clipboard.min.js', function () {
        return window.Clipboard;
      });
      script.then(function () {
        var selector = '#' + $ctrl.id + ' button';
        var clipboard = new Clipboard(selector);
        clipboard.on('success', function (e) {
          e.clearSelection();
        });
      });
    }]
  });

  /*
   * <codearea> 一个多行文本框，不过是代码
   *
   * language （字符串） 程序语言，可选 dockerfile, json, markdown, nginx, shell, xml, yaml, text（默认）
   *   注： ace 并不支持 nginx ，因此 nginx 将会展示成 text
   * ngModel （双向，字符串） 绑定的值
   * name （字符串） 表单中的name
   * readonly （布尔） 非空则只读
   * required （布尔） 非空则在表单验证时要求填写
   *
   * 其他依赖：依赖 ace.js
   *
   * 注：这个组件不会读取 <codearea> 标签内的内容，所以请总是使用 ngModel 绑定文本框的值
   */
  formInputs.component('codearea', {
    template: '\n      <div id="{{ $ctrl.id }}" class="codearea-container">\n        <textarea class="codearea-hidden-textarea" style="display: none;" name="$ctrl.name" ng-model="$ctrl.ngModel" ng-required="$ctrl.required"></textarea>\n        <div id="{{ $ctrl.editorId }}" class="codearea-ace-container"></div>\n      </div>\n    ',
    bindings: {
      language: '@',
      ngModel: '=',
      required: '@',
      name: '@?',
      readonly: '@',
      height: '@',
      onChange: '&'
    },
    controller: ['api', '$scope', '$interval', '$timeout', function (api, $scope, angularInterval, angularTimeout) {
      var $ctrl = this;
      var $interval = scopedInterval(angularInterval, $scope);
      var $timeout = scopedInterval(angularTimeout, $scope);

      $ctrl.id = genUniqueId();
      $ctrl.editorId = genUniqueId();
      if (!$ctrl.name) $ctrl.name = genUniqueId();

      var modeMap = {
        dockerfile: 'dockerfile',
        json: 'json',
        markdown: 'markdown',
        shell: 'sh',
        xml: 'xml',
        yaml: 'yaml'
      };

      var editor = null;
      var value = null;
      var min = 0,
          max = 0;

      var script = api.loadScript('/lib/js/ace/ace.js', function () {
        return window.ace;
      });
      script.then(function () {
        editor = ace.edit($ctrl.editorId);
        editor.getSession().setMode('ace/mode/' + (modeMap[$ctrl.language] || 'text'));
        editor.on('input', function () {
          $ctrl.ngModel = value = editor.getValue();
          $timeout(function () {
            $ctrl.onChange();
          });
        });
        editor.setValue(value || '', 1);
        editor.setOptions({ fontSize: '14px' });
        editor.$blockScrolling = Infinity;
        editor.setReadOnly(!!$ctrl.readonly);
        editor.setOptions({ minLines: min, maxLines: max });
      });

      var size = null;
      $interval(function () {
        var element = document.getElementById($ctrl.editorId);
        if (!element || size === element.clientHeight) return;
        size = element.clientHeight;
        if (editor) editor.resize();
      }, 100);
      $scope.$watch('$ctrl.ngModel', function (newValue, oldValue) {
        if (value !== newValue) {
          value = newValue;
          if (editor) editor.setValue(value, 1);
        }
      });
      $scope.$watch('$ctrl.readonly', function (newValue, oldValue) {
        if (editor) editor.setReadOnly(!!$ctrl.readonly);
      });
      $scope.$watch('$ctrl.language', function (newValue, oldValue) {
        if (editor) editor.getSession().setMode('ace/mode/' + (modeMap[$ctrl.language] || 'text'));
      });
      $scope.$watch('$ctrl.height', function (newValue, oldValue) {
        var match = (($ctrl.height || '') + '').match(/^(?=(\d+))(?=(?:\d+\s*,\s*)?(\d*)$)(?:\d+(?:\s*,\s*\d*)?)$/);
        if (!match) {
          min = max = 0;
        } else {
          min = parseInt(match[1], 0) || 0;
          max = match[2] === '' ? Infinity : parseInt(match[2], 0) || 0;
        }
        if (editor) editor.setOptions({ minLines: min, maxLines: max });
      });
    }]
  });

  formInputs.component('markdown', {
    template: '\n      <div class="markdown-container markdown" ng-bind-html="$ctrl.html"></div>\n    ',
    bindings: {
      source: '@?',
      src: '@?',
      emptyText: '@?'
    },
    controller: ['$scope', 'api', function ($scope, api) {
      var $ctrl = this;

      $ctrl.html = '';
      var version = 0;
      var showMarkdown = function showMarkdown() {
        $ctrl.html = '';
        var myVersion = ++version;
        var source = null;
        if ($ctrl.source) source = api.SimplePromise.resolve($ctrl.source);else if ($ctrl.src) source = api.network($ctrl.src, 'GET', { responseType: "arraybuffer" }).then(function (ab) {
          return decodeURIComponent(escape(String.fromCharCode.apply(String, new Uint8Array(ab)))).trim();
        });else source = api.SimplePromise.resolve('');
        source = source.catch(function (error) {
          return '';
        }).then(function (markdown) {
          return markdown || $ctrl.emptyText || '';
        });
        var script = api.loadScript('/lib/js/showdown.min.js', function () {
          return window.showdown;
        }, function () {
          showdown.setOption('strikethrough', 'true');
          showdown.setOption('tables', 'true');
          showdown.setOption('tasklists', 'true');
          showdown.setOption('simplifiedAutoLink', 'true');
        });
        api.SimplePromise.all([source, script]).then(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 1),
              markdown = _ref2[0];

          if (myVersion !== version) return;
          var converter = new showdown.Converter();
          var original = converter.makeHtml(markdown);
          var element = angular.element('<div></div>').html(original);
          angular.element('a, area', element).attr('target', '_blank');
          $ctrl.html = element.html();
        });
      };
      $scope.$watchGroup(['$ctrl.source', '$ctrl.src'], function () {
        showMarkdown();
      });
    }]
  });

  /*
   * <event-list> 事件列表
   *
   * value （数组，单向） 事件列表，元素是一个结构体，键值参考 column 和 eventTypeAttr 参数
   * column （数组，单向） 表示时间列表有哪些列，字符串数组，值对应 value 的属性
   * template （字符串） 使用的模板
   * event-type （字符串） 事件类型，可选 error（红色）, warning（黄色）,success（绿色），info（蓝色）
   * event-type-attr （字符串） value 的结构体中表示事件类型的参数，默认为 `type` 。如果给定了 event-type 参数，则此参数无效。
   *   注：如果未指定 event-type ，且 event-type-attr 指定的属性不存在，那么会展示为 info （蓝色）图标。
   * emptyText （字符串） 当列表为空时显示的文本事件类型可选： error（红色）, warning（黄色）,success（绿色），info（蓝色）
   * param （双向） 绑定用于内部模板使用的参数
   */
  formInputs.component('eventList', {
    template: '\n      <div class="event-list-container">\n        <span class="event-list-empty" ng-bind="$ctrl.emptyText" ng-if="!$ctrl.value || !$ctrl.value.length"></span>\n        <ol class="event-list" ng-if="$ctrl.value && $ctrl.value.length">\n          <li class="event-list-item" ng-repeat="row in $ctrl.value">\n            <span class="event-list-content event-list-icon event-list-icon-{{ $ctrl.eventType || ($ctrl.eventTypeAttr ? row[$ctrl.eventTypeAttr] : row.type) || \'info\' }}">\n            </span>\n            <span class="event-list-content" ng-repeat="column in $ctrl.column track by $index">\n              <span ng-repeat="value in [row[column]] track by $index">\n                <span ng-include="$ctrl.template"></span>\n              </span>\n            </span>\n          </li>\n        </ol>\n      </div>\n    ',
    bindings: {
      value: '<',
      column: '<',
      template: '@',
      param: '<?',
      eventType: '@?',
      eventTypeAttr: '@?',
      emptyText: '@'
    },
    controller: [function () {}]
  });

  /*
   * <chart> 图
   *
   * chart-title （字符串） 图表标题
   * data （数组） 数据，饼图元素为数字，线图元素为数组
   * groups （数组） 图例标签名
   * items （数组） 仅用于线图，线图的元素名称
   * color （数组） 每组数据的代表颜色
   * legend-position （字符串） 图例的位置，可选 right 和 bottom
   * options （对象） 其他提供给 chart.js 的 options 参数
   * empty-text （字符串） 当无数据时显示的文本
   */
  formInputs.component('chart', {
    template: '\n      <div class="chart chart-{{ $ctrl.type }}" id="{{ $ctrl.id }}">\n        <div class="chart-title" ng-bind="$ctrl.chartTitle"></div>\n        <div class="chart-content chart-content-legend-{{ $ctrl.legendPosition }}">\n          <div class="chart-img" ng-style="{ visibility: $ctrl.noData ? \'hidden\' : \'visible\' }">\n            <div class="chart-canvas-wrap">\n              <div class="chart-canvas-conatiner"><canvas></canvas></div>\n            </div>\n          </div>\n          <div class="chart-legend-container" ng-style="{ visibility: $ctrl.noData ? \'hidden\' : \'visible\' }">\n            <ul class="chart-legend">\n              <li class="chart-legend-item" ng-repeat="label in $ctrl.groups">\n                <span class="chart-legend-item-sample" style="background-color: {{ $ctrl.color[$index] }}"></span>\n                <span>{{ label }}</span>\n              </li>\n            </ul>\n          </div>\n          <div class="chart-no-data" ng-bind="$ctrl.emptyText" ng-if="$ctrl.noData"></div>\n        </div>\n      </div>\n    ',
    bindings: {
      chartTitle: '@',
      data: '<',
      groups: '<?',
      items: '<?',
      color: '<',
      type: '@',
      legendPosition: '@',
      options: '<?',
      emptyText: '@'
    },
    controller: ['api', '$scope', function (api, $scope) {
      var $ctrl = this;
      $ctrl.id = genUniqueId();

      var script = api.loadScript('/lib/js/Chart.min.js', function () {
        return window.Chart;
      });

      var chart = null;

      var cleanup = function cleanup() {
        if (chart) try {
          chart.clear().destroy();
        } catch (_ignore) {}
      };
      $scope.$on('$destory', cleanup);
      var repaint = function repaint() {
        cleanup();
        var canvas = angular.element('canvas', document.getElementById($ctrl.id));
        var datasets = void 0,
            labels = void 0,
            options = {};
        $ctrl.noData = false;
        if ($ctrl.type === 'pie') {
          if (!Array.isArray($ctrl.data) || $ctrl.data.indexOf(null) !== -1 || $ctrl.data.reduce(function (x, y) {
            return x + y;
          }, 0) === 0) $ctrl.noData = true;

          datasets = [{
            data: $ctrl.data,
            label: $ctrl.groups,
            backgroundColor: $ctrl.color,
            hoverBackgroundColor: $ctrl.color,
            pointBorderColor: $ctrl.color,
            pointHoverBorderColor: $ctrl.color,
            pointBackgroundColor: $ctrl.color,
            pointHoverBackgroundColor: $ctrl.color
          }];
          labels = $ctrl.groups;
          options = {
            tooltips: {
              callbacks: {
                label: function label(item, data) {
                  return data.labels[item.index];
                }
              }
            }
          };
        } else if ($ctrl.type === 'line') {
          if (!Array.isArray($ctrl.data) || !$ctrl.data.length) $ctrl.noData = true;
          datasets = ($ctrl.data || []).map(function (data, i) {
            if (!Array.isArray(data) || $ctrl.data.indexOf(null) !== -1) $ctrl.noData = true;
            return {
              data: data,
              label: $ctrl.groups[i],
              borderColor: $ctrl.color[i],
              backgroundColor: $ctrl.color[i],
              hoverBackgroundColor: $ctrl.color[i],
              fill: false
            };
          });
          labels = $ctrl.items;
          var maxData = Math.max.apply(Math, $ctrl.data.map(function (data) {
            return Math.max.apply(Math, data);
          }));
          options = {
            scales: {
              yAxes: [{
                ticks: {
                  stepSize: Math.max(1, Math.ceil(maxData / 5)),
                  beginAtZero: true
                }
              }]
            }
          };
        }
        var chartData = angular.copy({
          type: $ctrl.type,
          data: {
            labels: labels,
            datasets: datasets
          },
          options: Object.assign({
            legend: {
              display: false
            },
            responsive: true,
            layout: {
              padding: 20
            }
          }, options, $ctrl.options || {})
        });
        script.then(function () {
          setTimeout(function () {
            return chart = new Chart(canvas, chartData);
          }, 100);
        });
      };

      $scope.$watchGroup(['$ctrl.data', '$ctrl.labels', '$ctrl.color', '$ctrl.type'], function () {
        repaint();
      });
    }]
  });

  /*
   * 以下是业务相关组件
   */

  /*
   * <multiple-user-select> 用户多选下拉框
   *
   * not-in-list （数组） 用户 id 组成的数组
   * ng-model （双向，数组） 绑定的变量，用户结构体组成的数组
   * placeholder （文本） 预定义文本
   */
  formInputs.component('multipleUserSelect', {
    template: '\n      <form-multiple-select\n        options="$ctrl.userListFiltered"\n        ng-model="$ctrl.ngModel"\n        placeholder="{{ $ctrl.placeholder || \'\' }}"\n        is-loading="$ctrl.isLoading"\n        loading-text="\u6B63\u5728\u83B7\u53D6\u7528\u6237\u5217\u8868"\n      ></form-multiple-select>\n    ',
    bindings: {
      notInList: '<?',
      ngModel: '=',
      placeholder: '@'
    },
    controller: ['$scope', 'api', function ($scope, api) {
      var $ctrl = this;

      $ctrl.allUsers = [];
      $ctrl.userListFiltered = [];
      $ctrl.isLoading = true;

      var updateFiltered = function updateFiltered() {
        if ($ctrl.isLoading) return;
        $ctrl.userListFiltered = $ctrl.allUsers.filter(function (user) {
          return ($ctrl.notInList || []).indexOf(user.id) === -1;
        });
      };

      api.user.list().then(function (userList) {
        $ctrl.allUsers = userList.map(function (user) {
          return {
            value: user,
            text: user.name,
            id: user.id
          };
        });
        $ctrl.isLoading = false;
        updateFiltered();
      }).catch(function (error) {
        return angular.noop();
      });

      $scope.$watch('$ctrl.notInList', function () {
        updateFiltered();
      }, true);
    }]
  });

  /*
   * <member-collection-select> 用于展示用户组下拉单选框
   *
   * type （文本） 用户组的类型
   * ngModel （双向） 选中的用户组
   * placeholder （文本） 预定义文字
   */
  formInputs.component('memberCollectionSelect', {
    template: '\n      <form-select\n        options="$ctrl.options"\n        ng-model="$ctrl.ngModel"\n        placeholder="{{ $ctrl.placeholder || \'\' }}"\n        is-loading="$ctrl.loadingTypes[$ctrl.type] !== false"\n        loading-text="\u6B63\u5728\u52A0\u8F7D\u5217\u8868"\n        empty-text="\u65E0\u76F8\u5173\u7528\u6237\u7EC4\u4FE1\u606F"\n      ></form-select>\n    ',
    bindings: {
      type: '@',
      ngModel: '=',
      placeholder: '@',
      notInList: '<?'
    },
    controller: ['$scope', 'api', function ($scope, api) {
      var $ctrl = this;

      var validTypes = [];
      var loadedTypes = {};
      $ctrl.loadingTypes = {};
      $ctrl.options = [];

      var loadDone = function loadDone() {
        if (!loadedTypes[$ctrl.type]) return;
        $ctrl.options = loadedTypes[$ctrl.type].map(function (collection) {
          return { value: collection, text: collection.name };
        }).filter(function (collection) {
          return ($ctrl.notInList || []).every(function (shouldNot) {
            return shouldNot.id !== collection.value.id || shouldNot.type !== collection.value.type;
          });
        });
      };

      var triggerLoading = function triggerLoading() {
        if (validTypes.indexOf($ctrl.type) === -1) return;
        if ($ctrl.loadingTypes[$ctrl.type]) return;
        if (loadedTypes[$ctrl.type]) loadDone();else {
          var type = $ctrl.type;
          $ctrl.loadingTypes[type] = true;
          $ctrl.options = [];
          $ctrl.ngModel = null;
          api.memberCollection.listByType(type).then(function (collections) {
            $ctrl.loadingTypes[type] = false;
            loadedTypes[type] = collections;
            loadDone();
          });
        }
      };

      api.memberCollection.getTypes().then(function (types) {
        validTypes = types;
        triggerLoading();
      });
      $scope.$watch('$ctrl.type', triggerLoading);
      $scope.$watch('$ctrl.notInList', triggerLoading);
    }]
  });

  /*
   * <collection-member-table> 成员管理模块
   */
  formInputs.component('collectionMemberTable', {
    template: '\n      <div class="collection-member-table-container">\n        <form-multiple-inline content-type="search">\n          <form-multiple-inline-item class="collection-member-edit-button-container">\n            <form-button-collection>\n              <form-input-checkbox value="\'MEMBER\'" value-false="null" ng-model="$ctrl.addingTypeOne" on-change="$ctrl.addingType = $ctrl.addingTypeOne; $ctrl.addingTypeMulti = null; $ctrl.addingShown = true;" ng-init="$ctrl.addingTypeOne = null" appearance="button">\u9010\u4E2A\u6DFB\u52A0\u6210\u5458</form-input-checkbox>\n              <form-input-checkbox value="\'GROUP\'" value-false="null" ng-model="$ctrl.addingTypeMulti" on-change="$ctrl.addingType = $ctrl.addingTypeMulti; $ctrl.addingTypeOne = null; $ctrl.addingShown = true;" ng-init="$ctrl.addingTypeMulti = null" appearance="button">\u6279\u91CF\u5BFC\u5165\u6210\u5458</form-input-checkbox>\n            </form-button-collection>\n          </form-multiple-inline-item>\n          <form-multiple-inline-item class="collection-member-count-container">\n            <span>\n              \u5171\n              <span ng-show="$ctrl.searchText">\n                <span class="collection-member-count-filtered" ng-bind="(($ctrl.ngModel || []) | filter:{ name: $ctrl.searchText }).length"></span>\n                /\n              </span>\n              <span>\n                <span class="collection-member-count-total" ng-bind="$ctrl.ngModel.length"></span>\n              </span>\n              \u4F4D\u6210\u5458\n            </span>\n          </form-multiple-inline-item>\n          <form-multiple-inline-item class="collection-member-search-container">\n            <form-search-box ng-init="$ctrl.searchText = \'\'" ng-model="$ctrl.searchText" placeholder="\u641C\u7D22\u9879\u76EE\u6210\u5458"></form-search-box>\n          </form-multiple-inline-item>\n        </form-multiple-inline>\n        <form-help-line ng-if="$ctrl.helpText">\n          <icon-info></icon-info> <span ng-bind="$ctrl.helpText"></span>\n        </form-help-line>\n        <div class="collection-member-adding-panel" ng-show="$ctrl.addingType" ng-if="$ctrl.addingShown">\n          <form-multiple-inline algin="left">\n            <form-multiple-inline-item class="collection-member-group-type-selector-container" ng-show="$ctrl.addingType === \'GROUP\'">\n              <script id="collectionMemberTypeTemplate" type="text/ng-template">\n                <span ng-bind="option.text"></span>\n              </script>\n              <form-select\n                class="collection-member-type-radio"\n                options="[\n                  { value: \'PROJECT_COLLECTION\', text: \'\u5BFC\u5165\u9879\u76EE\u6210\u5458\' },\n                  { value: \'DEPLOY_COLLECTION\', text: \'\u5BFC\u5165\u670D\u52A1\u6210\u5458\' },\n                  { value: \'CLUSTER\', text: \'\u5BFC\u5165\u96C6\u7FA4\u6210\u5458\' },\n                ]"\n                ng-model="$ctrl.groupType"\n                ng-init="$ctrl.groupType = \'PROJECT_COLLECTION\'"\n                show-search-input="never"\n                card-template="collectionMemberTypeTemplate"\n              ></form-input-radio-group>\n            </form-multiple-inline-item>\n            <form-multiple-inline-item class="collection-member-users-selector-container">\n              <multiple-user-select\n                ng-show="$ctrl.addingType === \'MEMBER\'"\n                ng-model="$ctrl.chosedMemberList"\n                placeholder="\u9009\u62E9\u7528\u6237\u4EE5\u6DFB\u52A0"\n              ></multiple-user-select>\n              <member-collection-select\n                ng-show="$ctrl.addingType === \'GROUP\'"\n                type="{{ $ctrl.groupType }}"\n                ng-model="$ctrl.chosedGroup"\n                placeholder="\u9009\u62E9{{ ({\n                  PROJECT_COLLECTION : \'\u9879\u76EE\',\n                  DEPLOY_COLLECTION : \'\u670D\u52A1\',\n                  CLUSTER : \'\u96C6\u7FA4\',\n                })[$ctrl.groupType] }}\u4EE5\u5BFC\u5165"\n                not-in-list="[{ type: $ctrl.collectionType, id: $ctrl.collectionId }]"\n              ></member-collection-select>\n            </form-multiple-inline-item>\n            <form-multiple-inline-item class="collection-member-role-selector-container">\n              <form-select\n                ng-show="$ctrl.addingType === \'MEMBER\'"\n                options="[\n                  { value: \'MASTER\', text: \'MASTER\' },\n                  { value: \'DEVELOPER\', text: \'DEVELOPER\' },\n                  { value: \'REPORTER\', text: \'REPORTER\' },\n                ]"\n                ng-init="$ctrl.addingMemberRole = \'MASTER\'"\n                show-search-input="never"\n                ng-model="$ctrl.addingMemberRole"\n              ></form-select>\n              <form-select\n                ng-show="$ctrl.addingType !== \'MEMBER\'"\n                options="[\n                  { value: \'MASTER\', text: \'MASTER\' },\n                  { value: \'DEVELOPER\', text: \'DEVELOPER\' },\n                  { value: \'REPORTER\', text: \'REPORTER\' },\n                  { value: \'DEFAULT\', text: \'\u4FDD\u7559\u7EC4\u5185\u6743\u9650\u8BBE\u7F6E\' },\n                ]"\n                ng-init="$ctrl.addingGroupRole = \'DEFAULT\'"\n                show-search-input="never"\n                ng-model="$ctrl.addingGroupRole"\n              ></form-select>\n            </form-multiple-inline-item>\n            <form-multiple-inline-item class="collection-member-add-button-container">\n              <button class="collection-member-new-button" type="button" ng-click="$ctrl.addMember()" ng-bind="$ctrl.addingType === \'MEMBER\' ? \'\u6DFB\u52A0\' : \'\u5BFC\u5165\'"></button>\n            </form-multiple-inline-item>\n          </form-multiple-inline>\n        </div>\n        <script id="collectionMemberTableTemplate" type="text/ng-template">\n          <div ng-if="edit && column.key === \'role\'">\n            <form-select\n              ng-model="row.role"\n              options="[\n                {value: \'MASTER\', text: \'MASTER\'},\n                {value: \'DEVELOPER\', text: \'DEVELOPER\'},\n                {value: \'REPORTER\', text: \'REPORTER\'}\n              ]"\n              show-search-input="never"\n            ></form-select>\n          </div>\n          <div ng-if="!edit || column.key !== \'role\'">\n            <div ng-bind="value"></div>\n          </div>\n        </script>\n        <form-table\n          class="collection-member-table"\n          ng-model="$ctrl.value"\n          columns="[{text: \'\u6210\u5458\', key: \'name\'}, {text: \'\u7EC4\u5185\u89D2\u8272\', key: \'role\'}]"\n          template="collectionMemberTableTemplate"\n          filter="{ name: $ctrl.searchText }"\n          empty-text="{{ $ctrl.loading ? \'\u6B63\u5728\u83B7\u53D6\u6210\u5458\u5217\u8868\uFF0C\u8BF7\u7A0D\u5019\' : ($ctrl.searchText ? \'\u65E0\u5339\u914D\u6210\u5458\u4FE1\u606F\' : \'\u65E0\u6210\u5458\u4FE1\u606F\') }}"\n          edited-data="$ctrl.editedData"\n          on-save="$ctrl.updateUserRole(data)"\n          on-delete="$ctrl.removeUser(data)"\n          no-edit="$ctrl.noEdit"\n          no-delete="$ctrl.noDelete"\n        ></form-table>\n        <div class="collection-member-loading-cover" ng-show="$ctrl.loading">\n        </div>\n      </div>\n    ',
    bindings: {
      ngModel: '=?',
      collectionType: '<?',
      collectionId: '<?',
      onNoPermission: '&?',
      onRoleChange: '&',
      helpText: '@'
    },
    controller: ['$scope', 'api', '$domePublic', function ($scope, api, $domePublic) {
      var $ctrl = this;
      var errMsgBox = function errMsgBox(text) {
        $domePublic.openWarning({
          title: '操作失败',
          msg: text
        });
      };
      $ctrl.loading = false;
      $ctrl.userRole = null;

      var roles = ['MASTER', 'DEVELOPER', 'REPORTER', 'GUEST'];
      var roleLevel = function roleLevel(role) {
        return roles.indexOf(role) + 1 || roles.length;
      };
      var downgradeOwnRoleNeedConfirm = function downgradeOwnRoleNeedConfirm(newRole) {
        var warningText = null;
        if (newRole) warningText = '\u60A8\u5C06\u8981\u628A\u81EA\u5DF1\u7684\u6743\u9650\u964D\u4F4E\u4E3A' + newRole + '\uFF0C\u4FEE\u6539\u540E\u60A8\u53EF\u80FD\u65E0\u6CD5\u7EE7\u7EED\u7F16\u8F91\u6210\u5458\u4FE1\u606F\u6216\u6267\u884C\u90E8\u5206\u7BA1\u7406\u64CD\u4F5C\uFF0C\u786E\u8BA4\u8981\u7EE7\u7EED\u5417\uFF1F';else warningText = '您将要把自己从成员列表中删除，删除后您将不能继续访问相关资源，确认要继续吗？';
        return api.SimplePromise.resolve($domePublic.openConfirm(warningText));
      };
      var deleteMemberConfirm = function deleteMemberConfirm(username) {
        return api.SimplePromise.resolve($domePublic.openConfirm('\u60A8\u5C06\u8981\u628A' + username + '\u4ECE\u6210\u5458\u5217\u8868\u4E2D\u5220\u9664\uFF0C\u786E\u8BA4\u8981\u7EE7\u7EED\u5417\uFF1F'));
      };

      // 添加成员
      $ctrl.addMember = function () {
        if (!$ctrl.currentCollection) return;
        var memberGetter = void 0;
        if ($ctrl.addingType === 'MEMBER') {
          if (!$ctrl.chosedMemberList || !$ctrl.chosedMemberList.length) return;
          var newMembers = $ctrl.chosedMemberList.map(function (user) {
            return { id: user.id, role: $ctrl.addingMemberRole };
          });
          memberGetter = api.SimplePromise.resolve(newMembers);
        } else {
          if (!$ctrl.chosedGroup) return;
          memberGetter = api.memberCollection.get($ctrl.chosedGroup);
          if ($ctrl.addingGroupRole !== 'DEFAULT') {
            memberGetter = memberGetter.then(function (userList) {
              userList.forEach(function (user) {
                user.role = $ctrl.addingGroupRole;
              });
              return userList;
            });
          }
        }
        $ctrl.loading = true;
        memberGetter.then(function (userList) {
          return api.memberCollection.add($ctrl.currentCollection, userList);
        }).then(function () {
          $ctrl.chosedMemberList = [];
          $ctrl.chosedGroup = void 0;
        }, function (error) {
          errMsgBox(error.message || '添加用户时发生错误');
        }).catch(function (error) {
          errMsgBox(error.message || '获取组成员时发生错误');
        }).then(function () {
          return fetchCollectionInfo();
        }).then(function () {
          $ctrl.loading = false;
        });
      };

      // 修改权限
      $ctrl.updateUserRole = function (data) {
        $ctrl.loading = true;
        var confirm = null;
        if (data.id === $ctrl.myInfo.id && roleLevel(data.role) > roleLevel($ctrl.userRole) && !$ctrl.myInfo.isAdmin) {
          confirm = downgradeOwnRoleNeedConfirm(data.role);
        } else confirm = api.SimplePromise.resolve();
        confirm.then(function () {
          return api.memberCollection.modify($ctrl.currentCollection, data);
        }, function () {}).catch(function (error) {
          errMsgBox(error.message || '修改权限时放生错误');
        }).then(function () {
          return fetchCollectionInfo();
        }).then(function () {
          $ctrl.loading = false;
        });
      };

      // 删除用户
      $ctrl.removeUser = function (data) {
        $ctrl.loading = true;
        var confirm = null;
        if (data.id === $ctrl.myInfo.id && !$ctrl.myInfo.isAdmin) {
          confirm = downgradeOwnRoleNeedConfirm();
        } else confirm = deleteMemberConfirm(data.name);
        confirm.then(function () {
          return api.memberCollection.delete($ctrl.currentCollection, data);
        }, function () {}).catch(function (error) {
          errMsgBox(error.message || '删除用户时发生错误');
        }).then(function () {
          return fetchCollectionInfo();
        }).then(function () {
          $ctrl.loading = false;
        });
      };

      $ctrl.ngModel = {};
      $ctrl.value = [];
      $ctrl.noEdit = [];
      $ctrl.noDelete = [];
      $ctrl.editedData = {};

      var updateCollectionInfo = function updateCollectionInfo(members, me, role) {
        $ctrl.ngModel = members;

        $ctrl.noEdit = [];
        $ctrl.noDelete = [];
        // 非 MASTER 只能删掉自己
        if (role !== 'MASTER') {
          $ctrl.noEdit = members.slice(0);
          $ctrl.noDelete = members.filter(function (user) {
            return user.id !== me.id;
          });
        }
        // 最后一个 MASTER 不能被删除
        var masterList = members.filter(function (user) {
          return user.role === 'MASTER';
        });
        if (masterList.length === 1) {
          $ctrl.noEdit.push(masterList[0]);
          $ctrl.noDelete.push(masterList[0]);
        }

        // 更新表信息但保留编辑状态
        var oldEditedDataById = {},
            oldValueById = {};
        var newValue = angular.copy(members);
        Object.keys($ctrl.editedData).forEach(function (i) {
          var data = $ctrl.editedData[i];
          oldEditedDataById[data.id] = data;
          oldValueById[data.id] = $ctrl.value[i];
        });
        var newEditedData = {};
        members.forEach(function (user, index) {
          if (oldEditedDataById[user.id]) {
            newEditedData[index] = user;
            newValue[index] = oldValueById[user.id];
          }
        });
        $ctrl.value = newValue;
        $ctrl.editedData = newEditedData;
      };

      // 获取当前的状态
      $ctrl.currentCollection = null;
      var fetchCollectionInfo = function fetchCollectionInfo(collection) {
        if (collection == null) collection = $ctrl.currentCollection;
        var getRole = api.memberCollection.myRole(collection);
        var getMyInfo = api.user.whoami();
        var getMember = api.memberCollection.get(collection);

        getRole.then(function (role) {
          $ctrl.userRole = role;$ctrl.onRoleChange({ role: role });
        });
        getMyInfo.then(function (me) {
          $ctrl.myInfo = me;
        });

        return api.SimplePromise.all([getMember, getMyInfo, getRole]).then(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 3),
              members = _ref4[0],
              me = _ref4[1],
              role = _ref4[2];

          if (collection.id !== $ctrl.collectionId) return;
          if (collection.type !== $ctrl.collectionType) return;
          $ctrl.currentCollection = collection;
          updateCollectionInfo(members, me, role);
        }).catch(function (error) {
          return getRole.then(function (role) {
            if (role === 'GUEST' && $ctrl.onNoPermission) $ctrl.onNoPermission();else throw error;
          }).catch(function (error) {
            errMsgBox(error.message || '获取成员信息时发生错误');
          });
        });
      };

      // 处理 collection 信息初始化或指定的 collection 发生变化的情况
      var initialCurrentCollection = function initialCurrentCollection(collection) {
        clearCurrentCollection();
        return fetchCollectionInfo(collection);
      };
      var clearCurrentCollection = function clearCurrentCollection() {
        $ctrl.ngModel = void 0;
        $ctrl.currentCollection = null;
        $ctrl.role = null;
        $ctrl.editedData = {};
        return api.SimplePromise.resolve();
      };
      var inputCollectionInfo = function inputCollectionInfo() {
        var currentCollection = void 0;
        if (!$ctrl.collectionType || !$ctrl.collectionId) currentCollection = null;
        currentCollection = { type: $ctrl.collectionType, id: $ctrl.collectionId };
        var loadCollection = void 0;
        if (currentCollection) loadCollection = initialCurrentCollection(currentCollection);else loadCollection = clearCurrentCollection();
        $ctrl.loading = true;
        loadCollection.then(function () {
          return $ctrl.loading = false;
        });
      };
      $scope.$watchGroup(['$ctrl.collectionType', '$ctrl.collectionId'], inputCollectionInfo);
    }]
  });

  /*
   * 以下包括历史遗留代码，需要清理
   */
  /*
   * 选择镜像的下拉菜单
   */
  formInputs.component('formSelectorImage', {
    template: '\n      <div class="com-select-con add-mirror" select-con>\n        <input class="ui-input-white ui-btn-select input-image"\n          placeholder="{{ $ctrl.placeholder }}" ng-model="imageKey" />\n        <ul class="select-list">\n          <li class="select-item" ng-repeat="image in $ctrl.imageList | filter: { \'imageName\': imageKey }">\n            <a ng-click="$ctrl.choseImage(image)"><span ng-bind="image.imageName"></span><span class="txt-prompt pull-right" ng-bind="image.registry"></span></a>\n          </li>\n        </ul>\n      </div>\n    ',
    bindings: {
      onImageSelected: '&',
      imageList: '<',
      placeholder: '<'
    },
    controller: [function () {
      var $ctrl = this;
      $ctrl.choseImage = function (image) {
        $ctrl.onImageSelected({ image: image });
      };
    }]
  });

  formInputs.component('formSelectorProjectImage', {
    template: '\n      <form-selector-image\n        on-image-selected="$ctrl.subOnImageSelected(image)"\n        image-list="$ctrl.imageList"\n        placeholder="$ctrl.placeholder"\n      ></form-selector-image>\n    ',
    bindings: {
      onImageSelected: '&'
    },
    controller: ['$http', function ($http) {
      var $ctrl = this;
      $ctrl.placeholder = '选择镜像';
      $ctrl.imageList = [];
      $http.get('/api/image').then(function (res) {
        var imageList = res.data.result || [];
        Array.prototype.push.apply($ctrl.imageList, imageList);
      });
      $ctrl.subOnImageSelected = function (image) {
        $ctrl.onImageSelected({ image: image });
      };
    }]
  });
})(window.formInputs = window.formInputs || angular.module('formInputs', ['backendApi', 'domeModule', 'ngSanitize']));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9mb3JtSW5wdXRzL2Zvcm1JbnB1dHMuZXMiXSwibmFtZXMiOlsiZm9ybUlucHV0cyIsImdlblVuaXF1ZUlkIiwiY3VycmVudEluZGV4IiwiRGF0ZSIsIm5vdyIsInJhbmRvbVRleHQiLCJNYXRoIiwicmFuZG9tIiwidG9TdHJpbmciLCJ0ZXh0IiwiQXJyYXkiLCJtYXAiLCJqb2luIiwidG9VcHBlckNhc2UiLCJzY29wZWRUaW1lb3V0IiwiJHRpbWVvdXQiLCIkc2NvcGUiLCJwcm9taXNlTGlzdCIsIiRvbiIsImZvckVhY2giLCJjYW5jZWwiLCJwcm9taXNlIiwiY2FsbGJhY2siLCJhcmdzIiwiY2FsbCIsInNwbGljZSIsImluZGV4IiwiYXBwbHkiLCJhcmd1bWVudHMiLCJwdXNoIiwic2NvcGVkSW50ZXJ2YWwiLCIkaW50ZXJ2YWwiLCJjbGVhblVwQ29sbGVjdGlvbnMiLCJjYWxsYmFja3MiLCJmIiwiY2xlYW5VcEZ1bmN0aW9uIiwiY29tcG9uZW50IiwidGVtcGxhdGUiLCJiaW5kaW5ncyIsInZhbHVlIiwiY29udHJvbGxlciIsIiRjdHJsIiwiZGVidWdnZXJFbmFibGVkIiwiaW5kZXhPZiIsImxvY2F0aW9uIiwiaG9zdG5hbWUiLCJsb2NhbFN0b3JhZ2UiLCJ0b3NvdXJjZSIsIndpbmRvdyIsInVuZXZhbCIsImhlbHBlciIsIm9iaiIsInBhcmVudHMiLCJJbmZpbml0eSIsIk51bWJlciIsInByb3RvdHlwZSIsIkJvb2xlYW4iLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0IiwidmFsdWVPZiIsIlN0cmluZyIsIlJlZ0V4cCIsIkVycm9yIiwibWVzc2FnZSIsIlN5bWJvbCIsIkZ1bmN0aW9uIiwic3RyIiwiaXNOYXRpdmUiLCJyZXBsYWNlIiwibWF0Y2giLCJwYXJlbnRzQW5kTWUiLCJjb25jYXQiLCJsZW5ndGgiLCJsYXN0SXNIb2xlIiwibyIsImtleXMiLCJmaWx0ZXIiLCJrIiwiZSIsInNsaWNlIiwiJHdhdGNoIiwicmVzdWx0IiwibmFtZSIsInR5cGUiLCJjb2xvciIsImRpc2FibGVkIiwidHJhbnNjbHVkZSIsImRhbmdlciIsImFjdGl2ZSIsImdpdGxhYiIsIm9rIiwiY2xvc2UiLCJwbGFjZWhvbGRlciIsImluZm8iLCJlZGl0IiwiYnV0dG9ucyIsImJ1dHRvbk1hcCIsImJ1dHRvbiIsImNhbW1lbENhc2VOYW1lIiwiaSIsInRvTG93ZXJDYXNlIiwiXyIsIm0iLCJoeXBlblNwbGl0ZWROYW1lIiwicGFyYW0iLCJsZWZ0Q29sdW1uV2lkdGgiLCJ1bmlxdWVJZCIsImRlZmF1bHRMZWZ0V2lkdGgiLCJpbnB1dE1heFdpZHRoIiwicmVxdWlyZVdpZHRoIiwicGFyc2VJbnQiLCJsZWZ0V2lkdGgiLCJpc0Zpbml0ZSIsInJlcXVpcmVkIiwiY29uZmlnVGl0bGUiLCJmb3JtIiwidGFyZ2V0IiwiY29uZGl0aW9uIiwib25TdWJtaXQiLCJ2YWxpZFRoZW5UcmlnZ2VyU3VibWl0IiwiJGV2ZW50IiwiJHNldFN1Ym1pdHRlZCIsIiRpbnZhbGlkIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJoZWxwVGV4dFBvc2l0aW9uIiwiaGVscFRleHQiLCJyaWdodFdpZHRoIiwibGVmdCIsInJpZ2h0IiwiYWxpZ24iLCJjb250ZW50VHlwZSIsIndpZHRoIiwiY29udGVudCIsIm9wdGlvbnMiLCJuZ01vZGVsIiwib25DaGFuZ2UiLCJmYWxsYmFja1ZhbHVlIiwiY2FyZFRlbXBsYXRlIiwiYW5ndWxhclRpbWVvdXQiLCJjdXN0b21WYWx1ZSIsImN1c3RvbUZha2VWYWx1ZSIsImlzVmFsaWQiLCJhbmd1bGFyIiwiaXNBcnJheSIsIm9wdGlvbiIsInNvbWUiLCJpbnB1dCIsInN0YXR1cyIsInNldFRvRmFsbGJhY2siLCJzZXRUb051bGwiLCJ0cmlnZ2VyQ2hhbmdlIiwic2V0VG9GYWxsYmFja0hlbHBlciIsIm91dHB1dCIsInVwZGF0ZU9wdGlvbiIsInVwZGF0ZUN1c3RvbSIsIm5ld1ZhbHVlIiwib2xkVmFsdWUiLCJ2YWx1ZVRydWUiLCJ2YWx1ZUZhbHNlIiwicmVxdWlyZWRGYWxzZSIsImFwcGVhcmFuY2UiLCJlbXB0eSIsInJhbmRvbU5hbWUiLCJ2YWxpZCIsImRlYm91bmNlIiwiY2hhbmdlIiwidGV4dFByZWZpeCIsInRleHRTdWZmaXgiLCJ0b3RhbCIsIml0ZW1EcmFmdCIsIm9uQWRkIiwib25EZWxldGUiLCJtYXhMZW5ndGgiLCJtaW5MZW5ndGgiLCJhZGRJdGVtIiwiaXRlbSIsImNvcHkiLCJpc0Z1bmN0aW9uIiwiZGVsZXRlSXRlbSIsImZpdExlbmd0aCIsIm1heCIsInNlYXJjaFRleHQiLCJpc0xvYWRpbmciLCJlbXB0eVRleHQiLCJsb2FkaW5nVGV4dCIsInNob3dJbnB1dCIsInNob3dPcHRpb25zIiwib25TZWFyY2giLCJmaWx0ZU9wdGlvbiIsInN1Ym1pdE9uQmx1ciIsImNsZWFyT25TdWJtaXQiLCJibHVyT25TdWJtaXQiLCJwYXJlbnRBY3RpdmUiLCIkZG9jdW1lbnQiLCJjbGVhbnVwIiwiaWQiLCJldmVudEluQ29udGFpbmVyIiwiZXZlbnQiLCJlbGVtZW50IiwiY29udGFpbmVyIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImZpbmQiLCJ1cGRhdGVTaG93SGlkZSIsImN1cnJlbnRseVNob3dJbnB1dCIsImFsd2F5cyIsIm5ldmVyIiwiY3VycmVudGx5U2hvd09wdGlvbnMiLCJjdXJyZW50T3B0aW9uIiwic2V0Q3VycmVudE9wdGlvbiIsImlzVGV4dE1hdGNoQ3VycmVudE9wdGlvbiIsImNsZWFyQ3VycmVudE9wdGlvbiIsImNob3NlZE9wdGlvbiIsInNldENob3NlZE9wdGlvbiIsImNsZWFyQ2hvc2VkT3B0aW9uIiwiZm9jdXMiLCJ1cGRhdGVPcHRpb25zIiwiYmx1ciIsInVwZGF0ZUN1cnJlbnRJbmRleCIsIm1ha2VNZUJsdXIiLCJib2R5IiwiZm9jdXNFdmVudEhhbmRsZXIiLCJjb250YWluZWQiLCJvbiIsIm9mZiIsIml0ZW1PbkNsaWNrIiwiaXRlbU9uTW91c2VlbnRlciIsInNldEN1cnJlbnRJbmRleCIsImZpbHRlcmVkT3B0aW9ucyIsImtleWJvYXJkQXJyb3dEb3duIiwia2V5Ym9hcmRBcnJvd1VwIiwiY2hvc2VDdXJyZW50Iiwia2V5Ym9hcmRFdmVudEhhbmRsZXIiLCJhY3Rpb24iLCJrZXlDb2RlIiwidXBkYXRlU2Nyb2xsIiwiZm91bmQiLCJvcHQiLCJsYXN0U2VhcmNoVGV4dCIsInRyaWdnZXJPblNlYXJjaCIsImRlbGF5Iiwic2VhcmNoRGVsYXkiLCJ0ZXN0SW5kZXhPZiIsImVxdWFscyIsIm9wdGlvbnNDb250YWluZXIiLCJhY3RpdmVPcHRpb24iLCJwYXJlbnQiLCJ0b3AiLCJvZmZzZXRUb3AiLCJib3R0b20iLCJoZWlnaHQiLCJzY3JvbGxUb3AiLCJzY3JvbGxCb3R0b20iLCJzY3JvbGxUbyIsInN0b3AiLCJhbmltYXRlIiwibWF0Y2hlZE9wdGlvbiIsInNob3dTZWFyY2hJbnB1dCIsIm9uVmFsdWVDaGFuZ2UiLCJjaG9zZWQiLCJmb2N1c09uSW5wdXQiLCJhY3RpdmVFbGVtZW50IiwiY29sbGVjdGlvbnMiLCJkZWxldGVDaG9zZWRJdGVtIiwiYWJvdXRUb0RlbGV0ZSIsImlzQWJvdXRUb0RlbGV0ZSIsImRlbGV0ZUN1cnJlbnRJdGVtIiwidGFyZ2V0ZWRCYWNrc3BhY2VQcmVzc2VkIiwidGFyZ2V0ZWRIb3Jpem9udGFsQXJyb3dQcmVzc2VkIiwiZCIsIm90aGVyRXZlbnRUcmlnZ2VyZWQiLCJpc0lucHV0VGFyZ2V0ZWRLZXlwcmVzcyIsImN1cnNvckF0SW5wdXRCZWdpbmluZyIsImN1cnNvclBvc2l0aW9uIiwic2VsZWN0aW9uU3RhcnQiLCJzZWxlY3Rpb24iLCJzZWwiLCJjcmVhdGVSYW5nZSIsInNlbExlbiIsIm1vdmVTdGFydCIsImlzRW1wdHlJbnB1dCIsImV2ZW50SGFuZGxlciIsImhhbmRsZWQiLCJkaXIiLCJhbGxPcHRpb25zIiwieCIsImNvbHVtbnMiLCJvblNhdmUiLCJvbkJlZm9yZUVkaXQiLCJvbkNhbmNlbEVkaXQiLCJub0RlbGV0ZSIsIm5vRWRpdCIsIm9uQ3VzdG9tQnV0dG9uIiwiY3VzdG9tQnV0dG9ucyIsImNvbXBhcmVLZXkiLCJlZGl0ZWREYXRhIiwiaGFzRWRpdCIsImhhc0RlbGV0ZSIsImhhc0J1dHRvbnMiLCJidXR0b25Db3VudCIsImdldEVkaXRTdGF0dXMiLCJzYW1lSXRlbSIsInkiLCJtYXlFZGl0IiwiZXZlcnkiLCJ2IiwibWF5RGVsZXRlIiwiYmVmb3JlRWRpdCIsImRhdGEiLCJzYXZlSXRlbSIsImNhbmNlbEVkaXQiLCJjdXN0b21CdXR0b24iLCJmaWx0ZXJSdWxlIiwibGFuZ3VhZ2UiLCJyZWFkb25seSIsImFwaSIsInNjcmlwdCIsImxvYWRTY3JpcHQiLCJDbGlwYm9hcmQiLCJ0aGVuIiwic2VsZWN0b3IiLCJjbGlwYm9hcmQiLCJjbGVhclNlbGVjdGlvbiIsImFuZ3VsYXJJbnRlcnZhbCIsImVkaXRvcklkIiwibW9kZU1hcCIsImRvY2tlcmZpbGUiLCJqc29uIiwibWFya2Rvd24iLCJzaGVsbCIsInhtbCIsInlhbWwiLCJlZGl0b3IiLCJtaW4iLCJhY2UiLCJnZXRTZXNzaW9uIiwic2V0TW9kZSIsImdldFZhbHVlIiwic2V0VmFsdWUiLCJzZXRPcHRpb25zIiwiZm9udFNpemUiLCIkYmxvY2tTY3JvbGxpbmciLCJzZXRSZWFkT25seSIsIm1pbkxpbmVzIiwibWF4TGluZXMiLCJzaXplIiwiY2xpZW50SGVpZ2h0IiwicmVzaXplIiwic291cmNlIiwic3JjIiwiaHRtbCIsInZlcnNpb24iLCJzaG93TWFya2Rvd24iLCJteVZlcnNpb24iLCJTaW1wbGVQcm9taXNlIiwicmVzb2x2ZSIsIm5ldHdvcmsiLCJyZXNwb25zZVR5cGUiLCJkZWNvZGVVUklDb21wb25lbnQiLCJlc2NhcGUiLCJmcm9tQ2hhckNvZGUiLCJVaW50OEFycmF5IiwiYWIiLCJ0cmltIiwiY2F0Y2giLCJzaG93ZG93biIsInNldE9wdGlvbiIsImFsbCIsImNvbnZlcnRlciIsIkNvbnZlcnRlciIsIm9yaWdpbmFsIiwibWFrZUh0bWwiLCJhdHRyIiwiJHdhdGNoR3JvdXAiLCJjb2x1bW4iLCJldmVudFR5cGUiLCJldmVudFR5cGVBdHRyIiwiY2hhcnRUaXRsZSIsImdyb3VwcyIsIml0ZW1zIiwibGVnZW5kUG9zaXRpb24iLCJDaGFydCIsImNoYXJ0IiwiY2xlYXIiLCJkZXN0cm95IiwiX2lnbm9yZSIsInJlcGFpbnQiLCJjYW52YXMiLCJkYXRhc2V0cyIsImxhYmVscyIsIm5vRGF0YSIsInJlZHVjZSIsImxhYmVsIiwiYmFja2dyb3VuZENvbG9yIiwiaG92ZXJCYWNrZ3JvdW5kQ29sb3IiLCJwb2ludEJvcmRlckNvbG9yIiwicG9pbnRIb3ZlckJvcmRlckNvbG9yIiwicG9pbnRCYWNrZ3JvdW5kQ29sb3IiLCJwb2ludEhvdmVyQmFja2dyb3VuZENvbG9yIiwidG9vbHRpcHMiLCJib3JkZXJDb2xvciIsImZpbGwiLCJtYXhEYXRhIiwic2NhbGVzIiwieUF4ZXMiLCJ0aWNrcyIsInN0ZXBTaXplIiwiY2VpbCIsImJlZ2luQXRaZXJvIiwiY2hhcnREYXRhIiwiYXNzaWduIiwibGVnZW5kIiwiZGlzcGxheSIsInJlc3BvbnNpdmUiLCJsYXlvdXQiLCJwYWRkaW5nIiwic2V0VGltZW91dCIsIm5vdEluTGlzdCIsImFsbFVzZXJzIiwidXNlckxpc3RGaWx0ZXJlZCIsInVwZGF0ZUZpbHRlcmVkIiwidXNlciIsImxpc3QiLCJ1c2VyTGlzdCIsIm5vb3AiLCJ2YWxpZFR5cGVzIiwibG9hZGVkVHlwZXMiLCJsb2FkaW5nVHlwZXMiLCJsb2FkRG9uZSIsImNvbGxlY3Rpb24iLCJzaG91bGROb3QiLCJ0cmlnZ2VyTG9hZGluZyIsIm1lbWJlckNvbGxlY3Rpb24iLCJsaXN0QnlUeXBlIiwiZ2V0VHlwZXMiLCJ0eXBlcyIsImNvbGxlY3Rpb25UeXBlIiwiY29sbGVjdGlvbklkIiwib25Ob1Blcm1pc3Npb24iLCJvblJvbGVDaGFuZ2UiLCIkZG9tZVB1YmxpYyIsImVyck1zZ0JveCIsIm9wZW5XYXJuaW5nIiwidGl0bGUiLCJtc2ciLCJsb2FkaW5nIiwidXNlclJvbGUiLCJyb2xlcyIsInJvbGVMZXZlbCIsInJvbGUiLCJkb3duZ3JhZGVPd25Sb2xlTmVlZENvbmZpcm0iLCJuZXdSb2xlIiwid2FybmluZ1RleHQiLCJvcGVuQ29uZmlybSIsImRlbGV0ZU1lbWJlckNvbmZpcm0iLCJ1c2VybmFtZSIsImFkZE1lbWJlciIsImN1cnJlbnRDb2xsZWN0aW9uIiwibWVtYmVyR2V0dGVyIiwiYWRkaW5nVHlwZSIsImNob3NlZE1lbWJlckxpc3QiLCJuZXdNZW1iZXJzIiwiYWRkaW5nTWVtYmVyUm9sZSIsImNob3NlZEdyb3VwIiwiZ2V0IiwiYWRkaW5nR3JvdXBSb2xlIiwiYWRkIiwiZXJyb3IiLCJmZXRjaENvbGxlY3Rpb25JbmZvIiwidXBkYXRlVXNlclJvbGUiLCJjb25maXJtIiwibXlJbmZvIiwiaXNBZG1pbiIsIm1vZGlmeSIsInJlbW92ZVVzZXIiLCJkZWxldGUiLCJ1cGRhdGVDb2xsZWN0aW9uSW5mbyIsIm1lbWJlcnMiLCJtZSIsIm1hc3Rlckxpc3QiLCJvbGRFZGl0ZWREYXRhQnlJZCIsIm9sZFZhbHVlQnlJZCIsIm5ld0VkaXRlZERhdGEiLCJnZXRSb2xlIiwibXlSb2xlIiwiZ2V0TXlJbmZvIiwid2hvYW1pIiwiZ2V0TWVtYmVyIiwiaW5pdGlhbEN1cnJlbnRDb2xsZWN0aW9uIiwiY2xlYXJDdXJyZW50Q29sbGVjdGlvbiIsImlucHV0Q29sbGVjdGlvbkluZm8iLCJsb2FkQ29sbGVjdGlvbiIsIm9uSW1hZ2VTZWxlY3RlZCIsImltYWdlTGlzdCIsImNob3NlSW1hZ2UiLCJpbWFnZSIsIiRodHRwIiwicmVzIiwic3ViT25JbWFnZVNlbGVjdGVkIiwibW9kdWxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLENBQUcsV0FBVUEsVUFBVixFQUFzQjtBQUN2Qjs7QUFFQSxNQUFNQyxjQUFlLFlBQVk7QUFDL0IsUUFBSUMsZUFBZUMsS0FBS0MsR0FBTCxFQUFuQjtBQUNBLFFBQUlDLGFBQWEsU0FBYkEsVUFBYTtBQUFBLGFBQU1DLEtBQUtDLE1BQUwsR0FBY0MsUUFBZCxDQUF1QixFQUF2QixFQUEyQixDQUEz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VUFBUCxHQUFvQmdELE9BQU9oRCxVQUFQLElBQXFCZ0osUUFBUXFXLE1BQVIsQ0FBZSxZQUFmLEVBQTZCLENBQUMsWUFBRCxFQUFlLFlBQWYsRUFBNkIsWUFBN0IsQ0FBN0IsQ0ExdEZ4QyxDQUFEIiwiZmlsZSI6ImNvbW1vbi9mb3JtSW5wdXRzL2Zvcm1JbnB1dHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyI7IChmdW5jdGlvbiAoZm9ybUlucHV0cykge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICBjb25zdCBnZW5VbmlxdWVJZCA9IChmdW5jdGlvbiAoKSB7XG4gICAgbGV0IGN1cnJlbnRJbmRleCA9IERhdGUubm93KCk7XG4gICAgbGV0IHJhbmRvbVRleHQgPSAoKSA9PiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KVs0XSB8fCAnMCc7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGxldCB0ZXh0ID0gWy4uLkFycmF5KDgpXS5tYXAocmFuZG9tVGV4dCkuam9pbignJykudG9VcHBlckNhc2UoKTtcbiAgICAgIHJldHVybiBgQVVUT19HRU5FUkFURURfSU5ERVhfJHsrK2N1cnJlbnRJbmRleH1fJHt0ZXh0fWA7XG4gICAgfTtcbiAgfSgpKTtcblxuICBjb25zdCBzY29wZWRUaW1lb3V0ID0gZnVuY3Rpb24gKCR0aW1lb3V0LCAkc2NvcGUpIHtcbiAgICB2YXIgcHJvbWlzZUxpc3QgPSBbXTtcbiAgICAkc2NvcGUuJG9uKCckZGVzdG9yeScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHByb21pc2VMaXN0LmZvckVhY2gocHJvbWlzZSA9PiAkdGltZW91dC5jYW5jZWwocHJvbWlzZSkpO1xuICAgIH0pO1xuICAgIHJldHVybiBmdW5jdGlvbiAoY2FsbGJhY2ssIC4uLmFyZ3MpIHtcbiAgICAgIHZhciBwcm9taXNlID0gJHRpbWVvdXQuY2FsbCh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHByb21pc2VMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9LCAuLi5hcmdzKTtcbiAgICAgIHZhciBpbmRleCA9IHByb21pc2VMaXN0LnB1c2gocHJvbWlzZSkgLSAxO1xuICAgIH07XG4gIH07XG4gIGNvbnN0IHNjb3BlZEludGVydmFsID0gZnVuY3Rpb24gKCRpbnRlcnZhbCwgJHNjb3BlKSB7XG4gICAgcmV0dXJuIHNjb3BlZFRpbWVvdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbiAgY29uc3QgY2xlYW5VcENvbGxlY3Rpb25zID0gZnVuY3Rpb24gKCRzY29wZSkge1xuICAgIHZhciBjYWxsYmFja3MgPSBbXTtcbiAgICAkc2NvcGUuJG9uKCckZGVzdG9yeScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNhbGxiYWNrcy5mb3JFYWNoKGYgPT4gZigpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGNsZWFuVXBGdW5jdGlvbikge1xuICAgICAgY2FsbGJhY2tzLnB1c2goKTtcbiAgICB9O1xuICB9O1xuXG4gIC8qXG4gICAqIDxkZWJ1Z2dlcj4g6L6T5Ye65p+Q5Liq5Y+Y6YeP55qE5YC8XG4gICAqIOWcqCBGaXJlZm94IOS4iu+8jOWwhuWIqeeUqCB1bmV2YWwg6L6T5Ye66K+l5Y+Y6YeP55qE5YC877ybXG4gICAqIOWcqOWFtuS7luS4jeaUr+aMgSB1bmV2YWwg55qE5rWP6KeI5Zmo5LiK77yM5Lya5L2/55So6Ieq5bex5qih5ouf55qEIHVuZXZhbCDovpPlh7rvvIzmqKHmi5/nmoQgdW5ldmFsIOWKn+iDvei+g+W8sVxuICAgKlxuICAgKiDov5nkuKrmqKHmnb/lj6rkvJrlnKjlnLDlnYDmoI/kuK3nmoTnvZHlnYDmmK8gbG9jYWxob3N0IOaIliAxMjcuMC4wLjEg5pe25omN5Lya5pi+56S677yBXG4gICAqXG4gICAqIHZhbHVlIO+8iOWPjOWQke+8iSDopoHovpPlh7rnmoTlj5jph49cbiAgICogdGV4dCDvvIjmlofmnKzvvIkg5o+P6L+w5paH5a2XXG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZGVidWdnZXInLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJkZWJ1Z2dlci1jb250YWluZXJcIiBuZy1pZj1cIiRjdHJsLmRlYnVnZ2VyRW5hYmxlZFwiPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImRlYnVnZ2VyLXRpdGxlXCIgc3R5bGU9XCJmb250LXdlaWdodDogYm9sZFwiIG5nLWlmPVwiJGN0cmwudGV4dFwiIG5nLWJpbmQ9XCIkY3RybC50ZXh0XCI+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImRlYnVnZ2VyLWNvbnRlbnRcIiBuZy1iaW5kPVwiJGN0cmwucmVzdWx0XCI+PC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgdGV4dDogJ0AnLFxuICAgICAgdmFsdWU6ICc8PycsXG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBbJyRzY29wZScsIGZ1bmN0aW9uICgkc2NvcGUpIHtcbiAgICAgIGNvbnN0ICRjdHJsID0gdGhpcztcbiAgICAgICRjdHJsLmRlYnVnZ2VyRW5hYmxlZCA9IFsnbG9jYWxob3N0JywgJzEyNy4wLjAuMSddLmluZGV4T2YobG9jYXRpb24uaG9zdG5hbWUpICE9PSAtMSB8fCAhIWxvY2FsU3RvcmFnZS5kZWJ1Z2dlckVuYWJsZWQ7XG4gICAgICBsZXQgdG9zb3VyY2UgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAgICAgaWYgKCd1bmV2YWwnIGluIHdpbmRvdykgcmV0dXJuIHdpbmRvdy51bmV2YWw7XG4gICAgICAgIGxldCBoZWxwZXIgPSBmdW5jdGlvbiB1bmV2YWwob2JqLCBwYXJlbnRzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChvYmogPT09IHZvaWQgMCkgcmV0dXJuICcodm9pZCAwKSc7XG4gICAgICAgICAgICBpZiAob2JqID09PSBudWxsKSByZXR1cm4gJ251bGwnO1xuICAgICAgICAgICAgaWYgKG9iaiA9PSBudWxsKSB0aHJvdyAnbm90IHN1cHBvcnQgdW5kZXRlY3RhYmxlJztcbiAgICAgICAgICAgIGlmIChvYmogPT09IDAgJiYgMSAvIG9iaiA9PT0gLUluZmluaXR5KSByZXR1cm4gJy0wJztcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqID09PSAnbnVtYmVyJykgcmV0dXJuIE51bWJlci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmogPT09ICdib29sZWFuJykgcmV0dXJuIEJvb2xlYW4ucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJykgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iaik7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3N5bWJvbCcpIHRocm93ICdzeW1ib2wgbm90IHN1cHBvcnRlZCc7XG4gICAgICAgICAgICBpZiAoIShvYmogaW5zdGFuY2VvZiBPYmplY3QpKSB0aHJvdyAnbm90IHN1cHBvcnRlZCB0eXBlJztcbiAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBOdW1iZXIpIHJldHVybiBgKG5ldyBOdW1iZXIoJHt1bmV2YWwoTnVtYmVyLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwob2JqKSl9KSlgO1xuICAgICAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIFN0cmluZykgcmV0dXJuIGAobmV3IFN0cmluZygke3VuZXZhbChTdHJpbmcucHJvdG90eXBlLnZhbHVlT2YuY2FsbChvYmopKX0pKWA7XG4gICAgICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgQm9vbGVhbikgcmV0dXJuIGAobmV3IEJvb2xlYW4oJHt1bmV2YWwoQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKG9iaikpfSkpYDtcbiAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBSZWdFeHApIHJldHVybiBvYmoudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gYChuZXcgRGF0ZSgke3VuZXZhbChEYXRlLnByb3RvdHlwZS52YWx1ZU9mKG9iaikpfSkpYDtcbiAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIGAobmV3IEVycm9yKCR7dW5ldmFsKG9iai5tZXNzYWdlKX0pKWA7XG4gICAgICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgU3ltYm9sKSB0aHJvdyAnc3ltYm9sIG5vdCBzdXBwb3J0ZWQnO1xuICAgICAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgIGxldCBzdHIgPSAnJyArIG9iajtcbiAgICAgICAgICAgICAgbGV0IGlzTmF0aXZlID0gISFzdHIucmVwbGFjZSgvXFxzL2csICcnKS5tYXRjaCgvZnVuY3Rpb25bXihdKlxcKFxcKVxce1xcW25hdGl2ZWNvZGVcXF1cXH0vKTtcbiAgICAgICAgICAgICAgaWYgKGlzTmF0aXZlKSByZXR1cm4gJyhmdW5jdGlvbiAoKSB7IFwibmF0aXZlICR7b2JqLm5hbWV9IGZ1bmN0aW9uXCIgfSknO1xuICAgICAgICAgICAgICByZXR1cm4gYCgke3N0cn0pYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJlbnRzLmluZGV4T2Yob2JqKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIEFycmF5KSByZXR1cm4gJ1tdJztcbiAgICAgICAgICAgICAgcmV0dXJuICcoe30pJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBwYXJlbnRzQW5kTWUgPSBwYXJlbnRzLmNvbmNhdChbb2JqXSk7XG4gICAgICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgaWYgKG9iai5sZW5ndGggPT09IDApIHJldHVybiAnW10nO1xuICAgICAgICAgICAgICBsZXQgbGFzdElzSG9sZSA9ICEoKG9iai5sZW5ndGggLSAxKSBpbiBvYmopO1xuICAgICAgICAgICAgICBsZXQgc3RyID0gb2JqLm1hcChvID0+IHVuZXZhbChvLCBwYXJlbnRzQW5kTWUpKS5qb2luKCcsICcpO1xuICAgICAgICAgICAgICByZXR1cm4gYFske3N0cn0ke2xhc3RJc0hvbGUgPyAnLCcgOiAnJ31dYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhvYmopLmZpbHRlcihrID0+IGtbMF0gIT09ICckJyk7IC8vIHdlIHNraXAgdmFsdWVzIGJ5IGFuZ3VsYXJcbiAgICAgICAgICAgICAgbGV0IHN0ciA9IGtleXMubWFwKGsgPT4gYCR7SlNPTi5zdHJpbmdpZnkoayl9OiAke3VuZXZhbChvYmpba10sIHBhcmVudHNBbmRNZSl9YCkuam9pbignLCAnKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGAoeyR7c3RyfX0pYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gYCh2b2lkIChcInVuZXZhbCBub3Qgc3VwcG9ydGVkOiAke0pTT04uc3RyaW5naWZ5KGUubWVzc2FnZSkuc2xpY2UoMSl9KSlgO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICByZXR1cm4gaGVscGVyKG9iaiwgW10pO1xuICAgICAgICB9O1xuICAgICAgfSgpKTtcbiAgICAgICRzY29wZS4kd2F0Y2goJyRjdHJsLnZhbHVlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkY3RybC5yZXN1bHQgPSB0b3NvdXJjZSgkY3RybC52YWx1ZSk7XG4gICAgICB9LCB0cnVlKTtcbiAgICB9XSxcbiAgfSk7XG5cbiAgLypcbiAgICogPGljb24+IOeUqOadpeWxleekuuS4gOS4quWwj+Wbvuagh1xuICAgKlxuICAgKiDkuI3opoHnm7TmjqXkvb/nlKjov5nkuKrmqKHmnb/vvIzor7fogIPomZHkvb/nlKjlrprliLblpb3nmoTlkITnsbvlm77moIdcbiAgICog5aaC5p6c5bCa5peg5a6a5Yi25aW955qE5Zu+5qCH56ym5ZCI6KaB5rGC77yM6K+36ICD6JmR5re75Yqg5LiA5LiqXG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnaWNvbicsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGkgY2xhc3M9XCJcbiAgICAgICAgaWNvbiBpY29uMTYgaWNvbi17eyAkY3RybC5uYW1lIHx8ICdjdXN0b20nIH19XG4gICAgICAgIGZhIGljb24tZmEgZmEte3sgJGN0cmwudHlwZSB9fVxuICAgICAgICB7eyAkY3RybC5kaXNhYmxlZCA/ICdpY29uLWRpc2FibGVkJyA6ICcnIH19XG4gICAgICBcIiBuZy1zdHlsZT1cIntcbiAgICAgICAgY29sb3I6ICRjdHJsLmRpc2FibGVkID8gJyNjY2NjY2MnIDogKCRjdHJsLmNvbG9yIHx8ICcjNzc3JylcbiAgICAgIH1cIj48L2k+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgbmFtZTogJ0A/JyxcbiAgICAgIHR5cGU6ICdAJyxcbiAgICAgIGNvbG9yOiAnQD8nLFxuICAgICAgZGlzYWJsZWQ6ICdAPycsXG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBbZnVuY3Rpb24gKCkgeyB9XSxcbiAgfSk7XG4gIC8qXG4gICAqIDxpY29uLWdyb3VwPiDnlKjkuo7lrrnnurPkuIDnu4Tlm77moIdcbiAgICpcbiAgICog5Zyo6ZyA6KaB5LiA57uE5Zu+5qCH55qE5pe25YCZ77yM55SoIGljb24tZ3JvdXAg5qCH562+5YyF6KO55LuW5LusXG4gICAqXG4gICAqIHRyYW5zY2x1ZGUg5YyF5ZCr55qE5Zu+5qCHXG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnaWNvbkdyb3VwJywge1xuICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImljb24tZ3JvdXAtY29udGFpbmVyXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5gLFxuICAgIGJpbmRpbmdzOiB7fSxcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIGNvbnRyb2xsZXI6IFtmdW5jdGlvbiAoKSB7IH1dLFxuICB9KTtcblxuICA7IChmdW5jdGlvbiAoKSB7XG4gICAgbGV0IGNvbG9yID0ge1xuICAgICAgZGFuZ2VyOiAnI2YwNTA1MCcsXG4gICAgICBhY3RpdmU6ICcjMjliNmY2JyxcbiAgICAgIGdpdGxhYjogJyNmZjk4MDAnLFxuICAgICAgb2s6ICcjNGJkMzk2JyxcbiAgICAgIGNhbmNlbDogJyNmMDUwNTAnLFxuICAgICAgY2xvc2U6ICcjNzc3JyxcbiAgICAgIHBsYWNlaG9sZGVyOiAnI2RkZCcsXG4gICAgICB0ZXh0OiAnIzc3NycsXG4gICAgICBpbmZvOiAnI2FhYScsXG4gICAgICBlZGl0OiAnIzE4OGFlMicsXG4gICAgfTtcbiAgICBsZXQgYnV0dG9ucyA9IFtcbiAgICAgIC8qXG4gICAgICAgKiA8aWNvbi0qPiDlkITnp43lrprliLbnmoTlm77moIdcbiAgICAgICAqXG4gICAgICAgKiDkuIvmlofmlbDnu4TnmoTlkKvkuYnlpoLkuIvvvJpcbiAgICAgICAqICAgICogbmFtZSDnlKjkuo7mj4/ov7Dlm77moIfnmoTlkI3np7DvvIzlubbmnIDlkI7lnKjnvZHpobXkuK3kuablhpkgPGljb24tbmFtZT4g5L2/55So5a+55bqU5Zu+5qCHXG4gICAgICAgKiAgICAqIHR5cGUg55So5LqO5o+P6L+w5a+55bqU5ZOq5LiqIGZhLWljb25cbiAgICAgICAqICAgICogY29sb3Ig55So5LqO5o+P6L+w5Zu+5qCH55qE6aKc6ImyXG4gICAgICAgKlxuICAgICAgICog5a+55bqU5qih5Z2X5L2/55So5pe255qE5Y+C5pWw5aaC5LiL77yaXG4gICAgICAgKiBkaXNhYmxlZCDvvIjlrZfnrKbkuLLvvIkg6Z2e56m65Liy6KGo56S656aB55So77yM5q2k5pe25Zu+5qCH5Lya5pi+56S65oiQ54Gw6Imy77yM6byg5qCH5LuO5bCP5omL5Zu+5qCH5Y+Y5YyW5Li6566t5aS0XG4gICAgICAgKiAgIOWmguaenOmcgOimgeazqOWGjCBuZy1jbGljayDvvIzor7fpop3lpJbliKTmlq3lm77moIfmmK/lkKblt7LnpoHnlKjvvIzkuI3opoHkvp3otZbmnKzlsZ7mgKdcbiAgICAgICAqXG4gICAgICAgKiDlpoLmnpzpnIDopoHlhbbku5bnmoTlm77moIfvvIjlpJbop4Lnm7jlkIzkvYbmhI/kuYnkuI3lkIzvvIzmiJbmhI/kuYnnm7jkvLzkvYblpJbop4LkuI3lkIzpg73nrpfkvZzmlrDlm77moIfvvInor7flnKjmraTlpITmt7vliqBcbiAgICAgICAqL1xuICAgICAgeyBuYW1lOiAnZGVsZXRlJywgdHlwZTogJ3RyYXNoLW8nLCBjb2xvcjogY29sb3IuZGFuZ2VyIH0sXG4gICAgICB7IG5hbWU6ICdkZXRhaWxzJywgdHlwZTogJ2VsbGlwc2lzLXYnIH0sXG4gICAgICB7IG5hbWU6ICd0cmFuc2ZlcicsIHR5cGU6ICdleHRlcm5hbC1saW5rJywgY29sb3I6IGNvbG9yLmFjdGl2ZSB9LFxuICAgICAgeyBuYW1lOiAnc3RvcCcsIHR5cGU6ICdzdG9wJywgY29sb3I6IGNvbG9yLmRhbmdlciB9LFxuICAgICAgeyBuYW1lOiAnaW5mbycsIHR5cGU6ICdpbmZvLWNpcmNsZScgfSxcbiAgICAgIHsgbmFtZTogJ2VkaXQnLCB0eXBlOiAncGVuY2lsJywgY29sb3I6IGNvbG9yLmVkaXQgfSxcbiAgICAgIHsgbmFtZTogJ2dpdGxhYicsIHR5cGU6ICdnaXRsYWInLCBjb2xvcjogY29sb3IuZ2l0bGFiIH0sXG4gICAgICB7IG5hbWU6ICdzYXZlJywgdHlwZTogJ2Zsb3BweS1vJywgY29sb3I6IGNvbG9yLm9rIH0sXG4gICAgICB7IG5hbWU6ICdjYW5jZWwnLCB0eXBlOiAndGltZXMnLCBjb2xvcjogY29sb3IuY2FuY2VsIH0sXG4gICAgICB7IG5hbWU6ICdjbG9zZScsIHR5cGU6ICd0aW1lcycsIGNvbG9yOiBjb2xvci5jbG9zZSB9LFxuICAgICAgeyBuYW1lOiAnc2VhcmNoJywgdHlwZTogJ3NlYXJjaCcsIGNvbG9yOiBjb2xvci5wbGFjZWhvbGRlciB9LFxuICAgICAgeyBuYW1lOiAnZHJvcC1kb3duJywgdHlwZTogJ2NhcmV0LWRvd24nLCBjb2xvcjogY29sb3IudGV4dCB9LFxuICAgICAgeyBuYW1lOiAnY2xpcGJvYXJkJywgdHlwZTogJ2NsaXBib2FyZCcgfSxcbiAgICAgIHsgbmFtZTogJ2Rvd25sb2FkJywgdHlwZTogJ2Rvd25sb2FkJyB9LFxuICAgICAgeyBuYW1lOiAnZmlsZScsIHR5cGU6ICdmaWxlLXRleHQtbycsIGNvbG9yOiBjb2xvci5hY3RpdmUgfSxcbiAgICBdO1xuICAgIGxldCBidXR0b25NYXAgPSB7fTtcbiAgICBidXR0b25zLmZvckVhY2goKGJ1dHRvbikgPT4ge1xuICAgICAgbGV0IHtuYW1lLCB0eXBlLCBjb2xvcn0gPSBidXR0b247IGJ1dHRvbk1hcFtuYW1lXSA9IGJ1dHRvbjtcbiAgICAgIGlmIChjb2xvciA9PT0gdm9pZCAwKSBjb2xvciA9ICdpbmhlcml0JztcbiAgICAgIGxldCBjYW1tZWxDYXNlTmFtZSA9ICgnaWNvbi0nICsgbmFtZSlcbiAgICAgICAgLnJlcGxhY2UoLy4vZywgaSA9PiBpICE9PSBpLnRvTG93ZXJDYXNlKCkgPyAnLScgKyBpLnRvTG93ZXJDYXNlKCkgOiBpKVxuICAgICAgICAucmVwbGFjZSgvWy1fXFxzXSsoXFx3KS9nLCAoXywgbSkgPT4gbS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgIGxldCBoeXBlblNwbGl0ZWROYW1lID0gY2FtbWVsQ2FzZU5hbWVcbiAgICAgICAgLnJlcGxhY2UoLy4vZywgaSA9PiBpICE9PSBpLnRvTG93ZXJDYXNlKCkgPyAnLScgKyBpLnRvTG93ZXJDYXNlKCkgOiBpKTtcbiAgICAgIGZvcm1JbnB1dHMuY29tcG9uZW50KGNhbW1lbENhc2VOYW1lLCB7XG4gICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgPGljb24gbmFtZT1cIiR7aHlwZW5TcGxpdGVkTmFtZX1cIiB0eXBlPVwiJHt0eXBlfVwiIGNvbG9yPVwiJHtjb2xvcn1cIiBkaXNhYmxlZD1cInt7ICRjdHJsLmRpc2FibGVkID8gJ2Rpc2FibGVkJyA6ICcnIH19XCI+PC9pY29uPlxuICAgICAgICBgLFxuICAgICAgICBiaW5kaW5nczogeyBkaXNhYmxlZDogJ0A/JyB9LFxuICAgICAgICBjb250cm9sbGVyOiBbZnVuY3Rpb24gKCkge31dXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnaWNvbkJ5TmFtZScsIHtcbiAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDxpY29uIG5hbWU9XCJpY29uLXt7ICRjdHJsLm5hbWUgfX1cIiB0eXBlPVwie3sgJGN0cmwudHlwZSB9fVwiIGNvbG9yPVwie3sgJGN0cmwuY29sb3IgfX1cIiBkaXNhYmxlZD1cInt7ICRjdHJsLmRpc2FibGVkID8gJ2Rpc2FibGVkJyA6ICcnIH19XCI+PC9pY29uPlxuICAgICAgYCxcbiAgICAgIGJpbmRpbmdzOiB7IGRpc2FibGVkOiAnQD8nLCBuYW1lOiAnQCcgfSxcbiAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgZnVuY3Rpb24gKCRzY29wZSkge1xuICAgICAgICBjb25zdCAkY3RybCA9IHRoaXM7XG4gICAgICAgICRzY29wZS4kd2F0Y2goJyRjdHJsLm5hbWUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKCRjdHJsLm5hbWUgaW4gYnV0dG9uTWFwKSB7XG4gICAgICAgICAgICAoeyB0eXBlOiAkY3RybC50eXBlLCBjb2xvcjogJGN0cmwuY29sb3IgfSA9IGJ1dHRvbk1hcFskY3RybC5uYW1lXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1dXG4gICAgfSk7XG4gIH0oKSk7XG5cbiAgZm9ybUlucHV0cy5jb21wb25lbnQoJ3RpdGxlTGluZScsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGRpdiBjbGFzcz1cInRpdGxlLWxpbmVcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInRpdGxlLWNvbnRhaW5lclwiPjxoMiBjbGFzcz1cImNvbnRlbnQtdGl0bGVcIiBuZy1iaW5kPVwiJGN0cmwudGV4dFwiPjwvaDI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0aXRsZS1saW5lLXJlbWFpbmRcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICB0ZXh0OiAnQCcsXG4gICAgICBwYXJhbTogJz0/JyxcbiAgICB9LFxuICAgIGNvbnRyb2xsZXI6IFtmdW5jdGlvbiAoKSB7fV0sXG4gIH0pO1xuXG4gIC8qXG4gICAqIDxmb3JtLWNvbnRhaW5lcj5cbiAgICog5omA5pyJIGZvcm0g6YO95bqU5b2T55Sx6L+Z5Liq5YWD57Sg5YyF6KO5XG4gICAqXG4gICAqIHRyYW5zY2x1ZGUg5YaF6YOo5bqU5b2T5Lmm5YaZ5LiA5Liq6KGo5Y2V5YWD57SgXG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZm9ybUNvbnRhaW5lcicsIHtcbiAgICAvLyDkvb/nlKggaWQg5YqgIGNsYXNzTmFtZSDmt7vliqDmoLflvI/vvIzov5nmoLfljbPkvr/ooqvltYzlpZfkuZ/kvJrlm6DkuLrkuablhpnkvY3nva7ogIzpgKDmiJDnmoTkvJjlhYjnuqfogIzmraPluLjlt6XkvZxcbiAgICAvLyBUT0RPIOWmguaenOWFvOWuueaAp+WFgeiuuO+8jOi/memHjOW6lOivpeS9v+eUqCBDU1Mg5Y+Y6YePXG4gICAgdGVtcGxhdGU6IGBcbiAgICAgIDxzdHlsZT5cbiAgICAgICAgI3t7ICRjdHJsLnVuaXF1ZUlkIH19IC5mb3JtLWNvbmZpZy1pdGVtLXRpdGxlICB7XG4gICAgICAgICAgd2lkdGg6IHt7ICRjdHJsLmxlZnRXaWR0aCB9fXB4O1xuICAgICAgICB9XG4gICAgICAgICN7eyAkY3RybC51bmlxdWVJZCB9fSAuZm9ybS1jb25maWctaXRlbS13cmFwcGVyIHtcbiAgICAgICAgICBtYXgtd2lkdGg6IHt7IDIgKiAoJGN0cmwubGVmdFdpZHRoICsgJGN0cmwucmVxdWlyZVdpZHRoKSArICRjdHJsLmlucHV0TWF4V2lkdGggfX1weDtcbiAgICAgICAgfVxuICAgICAgICAje3sgJGN0cmwudW5pcXVlSWQgfX0gLmZvcm0tY29uZmlnLWl0ZW0td3JhcHBlciAuZm9ybS1jb25maWctaXRlbS13cmFwcGVyIHtcbiAgICAgICAgICBwYWRkaW5nLXJpZ2h0OiAwO1xuICAgICAgICB9XG4gICAgICAgICN7eyAkY3RybC51bmlxdWVJZCB9fSAuZm9ybS1jb25maWctaXRlbSB7XG4gICAgICAgICAgcGFkZGluZy1sZWZ0OiB7eyAkY3RybC5sZWZ0V2lkdGggKyAkY3RybC5yZXF1aXJlV2lkdGggfX1weDtcbiAgICAgICAgICBtYXgtd2lkdGg6IHt7ICRjdHJsLmxlZnRXaWR0aCArICRjdHJsLnJlcXVpcmVXaWR0aCArICRjdHJsLmlucHV0TWF4V2lkdGggfX1weDtcbiAgICAgICAgfVxuICAgICAgPC9zdHlsZT5cbiAgICAgIDxkaXYgaWQ9XCJ7eyAkY3RybC51bmlxdWVJZCB9fVwiIGNsYXNzPVwiZm9ybS1jb250YWluZXItaW5uZXIgbmV3LWxheW91dFwiIG5nLXRyYW5zY2x1ZGU+XG4gICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICBsZWZ0Q29sdW1uV2lkdGg6ICdAJyxcbiAgICB9LFxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgY29udHJvbGxlcjogWyckc2NvcGUnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gICAgICBjb25zdCAkY3RybCA9IHRoaXM7XG4gICAgICAkY3RybC51bmlxdWVJZCA9IGdlblVuaXF1ZUlkKCk7XG5cbiAgICAgICRjdHJsLmRlZmF1bHRMZWZ0V2lkdGggPSAxMjA7XG4gICAgICAkY3RybC5pbnB1dE1heFdpZHRoID0gODgwO1xuICAgICAgJGN0cmwucmVxdWlyZVdpZHRoID0gMjA7XG5cbiAgICAgICRzY29wZS4kd2F0Y2goJyRjdHJsLmxlZnRDb2x1bW5XaWR0aCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6L+Z6YeM5L2/55SoIHBhcnNlSW50IOaYr+WboOS4uuaXp+eahOaOpeWPo+mHjOi/memHjOaYr+W9ouWmgiDigJwxMjBweOKAnSDlvaLlvI/nmoRcbiAgICAgICAgbGV0IHBhcmFtID0gcGFyc2VJbnQoJGN0cmwubGVmdENvbHVtbldpZHRoLCAxMCk7XG4gICAgICAgICRjdHJsLmxlZnRXaWR0aCA9IE51bWJlci5pc0Zpbml0ZShwYXJhbSkgJiYgcGFyYW0gPj0gMCA/IHBhcmFtIDogJGN0cmwuZGVmYXVsdExlZnRXaWR0aDtcbiAgICAgIH0pO1xuICAgIH1dLFxuICB9KTtcblxuICAvKlxuICAgKiA8c3ViLWZvcm0tY29udGFpbmVyPlxuICAgKiDov5notKflupTlvZPlnKggZm9ybS1pbnB1dC1jb250YWluZXIg6YeM6Z2i5Ye6546wXG4gICAqXG4gICAqIHRyYW5zY2x1ZGUg5YaF6YOo5bqU5b2T5Lmm5YaZ5LiA5Liq6KGo5Y2V5YWD57SgXG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnc3ViRm9ybUNvbnRhaW5lcicsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGZvcm0tY29udGFpbmVyIGxlZnQtY29sdW1uLXdpZHRoPVwie3sgJGN0cmwubGVmdENvbHVtbldpZHRoIH19XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzdWItZnJvbS1jb250YWluZXJcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxuICAgICAgPC9mb3JtLWNvbnRhaW5lcj5cbiAgICBgLFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICBsZWZ0Q29sdW1uV2lkdGg6ICdAJyxcbiAgICB9LFxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgY29udHJvbGxlcjogW2Z1bmN0aW9uICgpIHsgfV0sXG4gIH0pO1xuXG4gIC8qXG4gICAqIDxmb3JtLWNvbmZpZy1ncm91cD4g6KGo5Y2VIGZvcm0g5Lit5bqU5b2T5LuF5YyF5ZCr6L+Z5Liq5YWD57SgXG4gICAqIOi/meS4quWFg+e0oOihqOekuuS4gOe7hOiuvue9rumhue+8jOS4gOe7hOiuvue9rumhueWFs+ezu+i+g+S4uue0p+Wvhu+8iOS4remXtOayoeacieWIhuWJsue6v++8iVxuICAgKlxuICAgKiB0cmFuc2NsdWRlIOWGhemDqOW6lOW9k+WMheWQqyBmb3JtLWNvbmZpZy1pdGVtXG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZm9ybUNvbmZpZ0dyb3VwJywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1jb25maWctZ3JvdXAtaW5uZXJcIiBuZy10cmFuc2NsdWRlPlxuICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge30sXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICBjb250cm9sbGVyOiBbZnVuY3Rpb24gKCkge1xuICAgIH1dLFxuICB9KTtcblxuICAvKlxuICAgKiA8Zm9ybS1idXR0b24tZ3JvdXA+IOihqOWNleacq+WwvueahOaMiemSruihjFxuICAgKi9cbiAgZm9ybUlucHV0cy5jb21wb25lbnQoJ2Zvcm1CdXR0b25Hcm91cCcsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tY29uZmlnLWdyb3VwLWlubmVyIGZvcm0tY29uZmlnLWJ1dHRvbi1ncm91cC1pbm5lclwiIG5nLXRyYW5zY2x1ZGU+XG4gICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGJpbmRpbmdzOiB7fSxcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIGNvbnRyb2xsZXI6IFtmdW5jdGlvbiAoKSB7fV0sXG4gIH0pO1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZm9ybUJ1dHRvbkNvbGxlY3Rpb24nLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWJ1dHRvbi1jb2xsZWN0aW9uLWNvbnRhaW5lclwiIG5nLXRyYW5zY2x1ZGU+XG4gICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGJpbmRpbmdzOiB7fSxcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIGNvbnRyb2xsZXI6IFtmdW5jdGlvbiAoKSB7fV0sXG4gIH0pO1xuXG4gIC8qXG4gICAqIDxmb3JtLWNvbmZpZy1pdGVtPiDlupTlvZPljIXlkKvkuo4gPGZvcm0tY29uZmlnLWdyb3VwPiDlhYPntKDkuK1cbiAgICog6KGo56S65LiA5Liq6K6+572u6aG577yM5q+P5Liq6K6+572u6aG55pyJ6Ieq5bex55qE5qCH6aKYXG4gICAqXG4gICAqIOWPguaVsCBjb25maWctdGl0bGUg77yI5a2X56ym5Liy77yJ5qCH6aKYXG4gICAqIOWPguaVsCByZXF1aXJlZCDvvIjluIPlsJTvvIkg6KGo56S65piv5ZCm5pi+56S66KaB5rGC5b+F5aGr55qE5qCH6K6w77yI5LiN5Lya5b2x5ZON6KGo5Y2V6aqM6K+B6YC76L6R77yJXG4gICAqXG4gICAqIHRyYW5zY2x1ZGUg5YaF6YOo5bqU5b2T5YyF5ZCr6K+l6K6+572u6aG55Y+z5L6n55qE5YaF5a65XG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZm9ybUNvbmZpZ0l0ZW0nLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNvbmZpZy1pdGVtLXdyYXBwZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tY29uZmlnLWl0ZW1cIiBuZy1jbGFzcz1cInsnZm9ybS1jb25maWctaXRlbS1yZXF1aXJlZCc6ICRjdHJsLnJlcXVpcmVkfVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNvbmZpZy1pdGVtLXRpdGxlXCIgbmctYmluZD1cIiRjdHJsLmNvbmZpZ1RpdGxlXCI+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tY29uZmlnLWl0ZW0tY29udGVudFwiIG5nLXRyYW5zY2x1ZGUgbmctY2xvYWs+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgcmVxdWlyZWQ6ICdAJyxcbiAgICAgIGNvbmZpZ1RpdGxlOiAnQCcsXG4gICAgfSxcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIGNvbnRyb2xsZXI6IFtmdW5jdGlvbiAoKSB7XG4gICAgfV0sXG4gIH0pO1xuXG4gIC8qXG4gICAqIDxmb3JtLWVycm9yLW1lc3NhZ2U+IOihqOWNlemqjOivgeaXtueahOmUmeivr+S/oeaBr1xuICAgKlxuICAgKiDlj4LmlbAgZm9ybSDvvIjlj4zlkJHvvIkg6KGo5Y2V5a+56LGhXG4gICAqIOWPguaVsCB0YXJnZXQg77yI5a2X56ym5Liy77yJIOW+hemqjOivgemhueeahCBuYW1lXG4gICAqIOWPguaVsCB0eXBlIO+8iOWPr+mAie+8jOWtl+espuS4su+8iSDlk6rnsbvlh7rplJnml7bmmL7npLror6Xmj5DnpLrkv6Hmga/vvIznqbrnvLrmg4XlhrXkuIvkuLrku7vmhI/lh7rplJnmg4XlhrVcbiAgICpcbiAgICog5Y+C5pWwIGNvbmRpdGlvbiDvvIjlj6/pgInvvIzlpoLmnpznu5nlrprkuobor6Xlj4LmlbDvvIzliJkgZm9ybSDlkowgdGFyZ2V0IOWPr+mAie+8iSDlpIfnlKjnmoTmmL7npLrplJnor6/kv6Hmga/nmoTmnaHku7ZcbiAgICpcbiAgICogdHJhbnNjbHVkZSDlhoXpg6jljIXlkKvlh7rplJnml7bmmL7npLrnmoTkv6Hmga9cbiAgICovXG4gIGZvcm1JbnB1dHMuY29tcG9uZW50KCdmb3JtRXJyb3JNZXNzYWdlJywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1pbnB1dC1lcnJvci1tZXNzYWdlXCIgbmctc2hvdz1cIlxuICAgICAgICAkY3RybC5mb3JtICYmICRjdHJsLnRhcmdldCAmJiAoXG4gICAgICAgICAgJGN0cmwuZm9ybS4kc3VibWl0dGVkICYmXG4gICAgICAgICAgJGN0cmwuZm9ybVskY3RybC50YXJnZXRdICYmXG4gICAgICAgICAgJGN0cmwuZm9ybVskY3RybC50YXJnZXRdLiRpbnZhbGlkICYmXG4gICAgICAgICAgJGN0cmwuZm9ybVskY3RybC50YXJnZXRdLiRlcnJvciAmJlxuICAgICAgICAgICghJGN0cmwudHlwZSB8fCAkY3RybC5mb3JtWyRjdHJsLnRhcmdldF0uJGVycm9yWyRjdHJsLnR5cGVdKVxuICAgICAgICApIHx8XG4gICAgICAgICRjdHJsLmNvbmRpdGlvblxuICAgICAgXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cbiAgICBgLFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICBmb3JtOiAnPCcsXG4gICAgICB0YXJnZXQ6ICdAJyxcbiAgICAgIHR5cGU6ICdAJyxcbiAgICAgIGNvbmRpdGlvbjogJzwnLFxuICAgIH0sXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICBjb250cm9sbGVyOiBbZnVuY3Rpb24gKCkge1xuICAgIH1dLFxuICB9KTtcblxuICAvKlxuICAgKiA8Zm9ybS1zdWJtaXQtYnV0dG9uPiDooajljZXmj5DkuqTmjInpkq5cbiAgICog6K+35LiN6KaB55u05o6l55SoIGJ1dHRvbiDooajnpLrooajljZXmj5DkuqTmjInpkq7vvIzlm6DkuLrpgqPmoLfkvJrlr7zoh7TooajljZXpqozor4HlpLHmlYhcbiAgICpcbiAgICogZm9ybSDvvIjlj4zlkJHvvIkg6KGo5Y2V5a+56LGhXG4gICAqIG9uLXN1Ym1pdCDvvIjlm57osIPvvIkg54K55Ye75LiU6KGo5Y2V6aqM6K+B5oiQ5Yqf5ZCO5Zue6LCDXG4gICAqXG4gICAqIHRyYW5zY2x1ZGUg5YaF6YOo5bqU5b2T5YyF5ZCr5oyJ6ZKu5paH5pysXG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZm9ybVN1Ym1pdEJ1dHRvbicsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgbmctdHJhbnNjbHVkZSBuZy1jbGljaz1cIiAkY3RybC52YWxpZFRoZW5UcmlnZ2VyU3VibWl0KCRldmVudCkgXCI+PC9idXR0b24+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgZm9ybTogJzwnLFxuICAgICAgb25TdWJtaXQ6ICcmJyxcbiAgICB9LFxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgY29udHJvbGxlcjogW2Z1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0ICRjdHJsID0gdGhpcztcbiAgICAgICRjdHJsLnZhbGlkVGhlblRyaWdnZXJTdWJtaXQgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgICRjdHJsLmZvcm0uJHNldFN1Ym1pdHRlZCgpO1xuICAgICAgICBpZiAoJGN0cmwuZm9ybS4kaW52YWxpZCkgcmV0dXJuO1xuICAgICAgICAkY3RybC5vblN1Ym1pdCgpO1xuICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgfTtcbiAgICB9XSxcbiAgfSk7XG5cbiAgLypcbiAgICogPGZvcm0taGVscD4g55So5LqO5pi+56S65biu5Yqp5paH5pys77yM5pi+56S65Li66KGM5YaFXG4gICAqXG4gICAqIHRyYW5zY2x1ZGUg5biu5Yqp5YaF5a65XG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZm9ybUhlbHAnLCB7XG4gICAgdGVtcGxhdGU6ICc8c3BhbiBjbGFzcz1cImZvcm0taGVscC10ZXh0XCIgbmctdHJhbnNjbHVkZT48L3NwYW4+JyxcbiAgICBiaW5kaW5nczoge30sXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICBjb250cm9sbGVyOiBbZnVuY3Rpb24gKCkgeyB9XSxcbiAgfSk7XG4gIC8qXG4gICAqIDxmb3JtLWhlbHAtbGluZT4g55So5LqO5pi+56S65biu5Yqp5paH5pys77yM5pi+56S65Li65LiA6KGMXG4gICAqXG4gICAqIHRyYW5zY2x1ZGUg5biu5Yqp5YaF5a65XG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZm9ybUhlbHBMaW5lJywge1xuICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImZvcm0taGVscC10ZXh0IGZvcm0taGVscC10ZXh0LWxpbmVcIiBuZy10cmFuc2NsdWRlPjwvZGl2PicsXG4gICAgYmluZGluZ3M6IHt9LFxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgY29udHJvbGxlcjogW2Z1bmN0aW9uICgpIHsgfV0sXG4gIH0pO1xuXG4gIC8qXG4gICAqIDxmb3JtLWlucHV0LWNvbnRhaW5lcj4g55So5LqO5YyF5ZCr6KGo5Y2V5Lit55qE6L6T5YWl5qGGXG4gICAqXG4gICAqIGhlbHAtdGV4dCDvvIjlrZfnrKbkuLLvvIkg5biu5Yqp5a2X56ym5LiyXG4gICAqIGhlbHAtdGV4dC1wb3NpdGlvbiAo5a2X56ym5Liy77yM5Y+v55yB77yJIOW4ruWKqeWtl+espuS4sueahOS9jee9ru+8jOWPr+mAiSB0b3Ag77yI6buY6K6k77yJ44CBIHJpZ2h0IOOAgSBib3R0b20g5LiJ5Liq5YC8XG4gICAqXG4gICAqIHRyYW5zY2x1ZGUg5YaF6YOo5YyF5ZCr6L6T5YWl5qGG562J5YaF5a65XG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZm9ybUlucHV0Q29udGFpbmVyJywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1pbnB1dC1jb250YWluZXJcIj5cbiAgICAgICAgPGZvcm0taGVscCBjbGFzcz1cImZvcm0taW5wdXQtaGVscC10ZXh0LXRvcFwiIG5nLWlmPVwiJGN0cmwuaGVscFRleHQgJiYgKCRjdHJsLmhlbHBUZXh0UG9zaXRpb24gfHwgJ3RvcCcpID09PSAndG9wJ1wiPnt7ICRjdHJsLmhlbHBUZXh0IH19PC9mb3JtLWhlbHA+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWlucHV0LWNvbnRhaW5lci1pbm5lclwiIG5nLWlmPVwiISgkY3RybC5oZWxwVGV4dCAmJiAkY3RybC5oZWxwVGV4dFBvc2l0aW9uID09PSAncmlnaHQnKVwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWlucHV0LWNvbnRhaW5lci1pbm5lciBmb3JtLW11bHRpcGxlLWlubGluZS1jb250YWluZXJcIiBuZy1pZj1cIigkY3RybC5oZWxwVGV4dCAmJiAkY3RybC5oZWxwVGV4dFBvc2l0aW9uID09PSAncmlnaHQnKVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWlucHV0LWNvbnRhaW5lci1pbm5lci1vcHRpb25zIGZvcm0tbXVsdGlwbGUtaW5saW5lLWl0ZW0tcmVwbGFjZW1lbnRcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxuICAgICAgICAgIDxmb3JtLWhlbHAgY2xhc3M9XCJmb3JtLWlucHV0LWhlbHAtdGV4dC1yaWdodCBmb3JtLW11bHRpcGxlLWlubGluZS1pdGVtLXJlcGxhY2VtZW50XCIgbmctaWY9XCIkY3RybC5oZWxwVGV4dCAmJiAkY3RybC5oZWxwVGV4dFBvc2l0aW9uID09PSAncmlnaHQnXCI+e3sgJGN0cmwuaGVscFRleHQgfX08L2Zvcm0taGVscD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxmb3JtLWhlbHAgY2xhc3M9XCJmb3JtLWlucHV0LWhlbHAtdGV4dC1ib3R0b21cIiBuZy1pZj1cIiRjdHJsLmhlbHBUZXh0ICYmICRjdHJsLmhlbHBUZXh0UG9zaXRpb24gPT09ICdib3R0b20nXCI+e3sgJGN0cmwuaGVscFRleHQgfX08L2Zvcm0taGVscD5cbiAgICAgIDwvZGl2PlxuICAgIGAsXG4gICAgYmluZGluZ3M6IHtcbiAgICAgIGhlbHBUZXh0UG9zaXRpb246ICdAJyxcbiAgICAgIGhlbHBUZXh0OiAnQCcsXG4gICAgfSxcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIGNvbnRyb2xsZXI6IFtmdW5jdGlvbiAoKSB7XG4gICAgfV0sXG4gIH0pO1xuXG4gIC8qXG4gICAqIOS7heS+m+acrOaWh+S7tuWGhemDqOS9v+eUqO+8jOivt+WLv+ebtOaOpeS9v+eUqO+8gVxuICAgKlxuICAgKiA8Zm9ybS1sZWZ0LXJpZ2h0PiDnlKjkuo7mn5DkuIDooYzliIbmiJDlt6blj7PkuKTpg6jliIZcbiAgICpcbiAgICogbGVmdC13aWR0aCDvvIjmlofmnKzvvIkg6KGo56S65bem5L6n5a695bqmXG4gICAqIHJpZ2h0LXdpZHRoIO+8iOaWh+acrO+8iSDooajnpLrlj7Pkvqflrr3luqZcbiAgICpcbiAgICogdHJhbnNjbHVkZSBsZWZ0IOW3puS+p+WGheWuuVxuICAgKiB0cmFuc2NsdWRlIHJpZ2h0IOWPs+S+p+WGheWuuVxuICAgKi9cbiAgZm9ybUlucHV0cy5jb21wb25lbnQoJ2Zvcm1MZWZ0UmlnaHQnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWxlZnQtcmlnaHQtY29udGFpbmVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWxlZnQtcmlnaHQtd3JhcHBlclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWxlZnQtcmlnaHQtbGVmdFwiIG5nLXN0eWxlPVwieyB3aWR0aDogJGN0cmwubGVmdFdpZHRoIH1cIiBuZy10cmFuc2NsdWRlPVwibGVmdFwiPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWxlZnQtcmlnaHQtc3BhY2VcIj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1sZWZ0LXJpZ2h0LXJpZ2h0XCIgbmctc3R5bGU9XCJ7IHdpZHRoOiAkY3RybC5yaWdodFdpZHRoIH1cIiBuZy10cmFuc2NsdWRlPVwicmlnaHRcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICBsZWZ0V2lkdGg6ICdAJyxcbiAgICAgIHJpZ2h0V2lkdGg6ICdAJyxcbiAgICB9LFxuICAgIHRyYW5zY2x1ZGU6IHtcbiAgICAgIGxlZnQ6ICdsZWZ0JyxcbiAgICAgIHJpZ2h0OiAncmlnaHQnXG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBbZnVuY3Rpb24gKCkge1xuICAgIH1dLFxuICB9KTtcblxuICAvKlxuICAgKiA8Zm9ybS1tdWx0aXBsZS1pbmxpbmU+XG4gICAqIOihqOekuuS4gOihjOWkmuS4queahOWFg+e0oFxuICAgKlxuICAgKiBhbGlnbiDvvIjlrZfnrKbkuLLvvIkg5Y+v6YCJ5YC8IGxlZnRcbiAgICogICBsZWZ0IOmdoOW3pui0tOmdoFxuICAgKiAgIO+8iOm7mOiupO+8iSDlnYfljIDliIbluINcbiAgICogY29udGVudFR5cGUg77yI5a2X56ym5Liy77yJIOWPr+mAieWAvCBidXR0b25cbiAgICogICBidXR0b24g5o+P6L+w5YyF5ZCr5oyJ6ZKu77yI5ZKM5pCc57Si5qGG77yJ55qE6KGMXG4gICAqICAg77yI6buY6K6k77yJIOWFtuS7luaXoOeJueauiuinhOWImeeahOihjFxuICAgKlxuICAgKi9cbiAgZm9ybUlucHV0cy5jb21wb25lbnQoJ2Zvcm1NdWx0aXBsZUlubGluZScsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzcz1cImZvcm0tbXVsdGlwbGUtaW5saW5lLWNvbnRhaW5lclwiXG4gICAgICAgIG5nLWNsYXNzPVwie1xuICAgICAgICAgICdmb3JtLW11bHRpcGxlLWlubGluZS1hbGlnbi1sZWZ0JzogJGN0cmwuYWxpZ24gPT09ICdsZWZ0JyxcbiAgICAgICAgICAnZnJvbS1tdWx0aXBsZS1pbmxpbmUtZm9yLXNlYXJjaCc6ICRjdHJsLmNvbnRlbnRUeXBlID09PSAnc2VhcmNoJyxcbiAgICAgICAgIH1cIlxuICAgICAgICBuZy10cmFuc2NsdWRlXG4gICAgICA+PC9kaXY+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgYWxpZ246ICdAJyxcbiAgICAgIGNvbnRlbnRUeXBlOiAnQCcsXG4gICAgfSxcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIGNvbnRyb2xsZXI6IFtmdW5jdGlvbiAoKSB7XG4gICAgfV0sXG4gIH0pO1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZm9ybU11bHRpcGxlSW5saW5lSXRlbScsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tbXVsdGlwbGUtaW5saW5lLWl0ZW0taW5uZXJcIlxuICAgICAgICBuZy10cmFuc2NsdWRlPjwvZGl2PlxuICAgIGAsXG4gICAgYmluZGluZ3M6IHtcbiAgICAgIHdpZHRoOiAnQCcsXG4gICAgfSxcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIGNvbnRyb2xsZXI6IFtmdW5jdGlvbiAoKSB7XG4gICAgfV0sXG4gIH0pO1xuXG4gIC8qXG4gICAqIDxmb3JtLW11bHRpcGxlLW9uZS1saW5lPlxuICAgKiDooajnpLrkuIDooYzlpJrkuKrnmoTlhYPntKBcbiAgICpcbiAgICovXG4gIGZvcm1JbnB1dHMuY29tcG9uZW50KCdmb3JtTXVsdGlwbGVPbmVMaW5lJywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1tdWx0aXBsZS1vbmUtbGluZS1jb250YWluZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tbXVsdGlwbGUtb25lLWxpbmUtd3JhcHBlclwiPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGAsXG4gICAgYmluZGluZ3M6IHtcbiAgICAgIGFsaWduOiAnQCcsXG4gICAgfSxcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIGNvbnRyb2xsZXI6IFtmdW5jdGlvbiAoKSB7XG4gICAgfV0sXG4gIH0pO1xuXG4gIC8qXG4gICAqIDxmb3JtLXdpdGgtYnV0dG9uPiDnlKjkuo7mn5DkuIDooYzmnKvlsL7mnInkuIDkuKrmjInpkq7nmoTmg4XlhrVcbiAgICpcbiAgICogd2lkdGgg77yI5paH5pys77yJIOihqOekuuaMiemSrueahOWuveW6pu+8jOm7mOiupOS4uiBcIjEyMHB4XCJcbiAgICpcbiAgICogdHJhbnNjbHVkZSBjb250ZW50LWFyZWEg5oyJ6ZKu5bem5L6n55qE5YaF5a65XG4gICAqIHRyYW5zY2x1ZGUgYnV0dG9uLWFyZWEg5oyJ6ZKuXG4gICAqXG4gICAqIOivt+WPquWMheWQq+S4gOS4quaMiemSru+8jOmcgOimgeWkmuS4quaMiemSruaXtuivt+S9v+eUqOWkmuasoSBmb3JtLXdpdGgtYnV0dG9uXG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZm9ybVdpdGhCdXR0b24nLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXdpdGgtYnV0dG9uLWNvbnRhaW5lclwiPlxuICAgICAgICA8Zm9ybS1sZWZ0LXJpZ2h0IHJpZ2h0LXdpZHRoPVwie3sgJGN0cmwud2lkdGggfHwgJzEyMHB4JyB9fVwiPlxuICAgICAgICAgIDxsZWZ0PjxkaXYgY2xhc3M9XCJmb3JtLXdpdGgtYnV0dG9uLWNvbnRlbnRcIiBuZy10cmFuc2NsdWRlPVwiY29udGVudFwiPjwvZGl2PjwvbGVmdD5cbiAgICAgICAgICA8cmlnaHQ+PGRpdiBjbGFzcz1cImZvcm0td2l0aC1idXR0b24tYnV0dG9uXCIgbmctdHJhbnNjbHVkZT1cImJ1dHRvblwiPjwvZGl2PjwvcmlnaHQ+XG4gICAgICAgIDwvZm9ybS1sZWZ0LXJpZ2h0PlxuICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgd2lkdGg6ICdAJyxcbiAgICB9LFxuICAgIHRyYW5zY2x1ZGU6IHtcbiAgICAgIGNvbnRlbnQ6ICdjb250ZW50QXJlYScsXG4gICAgICBidXR0b246ICdidXR0b25BcmVhJ1xuICAgIH0sXG4gICAgY29udHJvbGxlcjogW2Z1bmN0aW9uICgpIHtcbiAgICB9XSxcbiAgfSk7XG5cbiAgLypcbiAgICogPGZvcm0taW5wdXQtcmFkaW8tZ3JvdXA+IOeUqOS6juihqOekuuS4gOe7hOWNlemAieWchueCuVxuICAgKiDkuIDnu4TljZXpgInlnIbngrnkuK3lupTlvZPmnInoh7PlpJrkuIDkuKrooqvpgInkuK1cbiAgICpcbiAgICogbmFtZSDvvIjlrZfnrKbkuLLvvIzlj6/nnIHvvIkg6KGo5Y2V5Lit6L+Z57uE5Y2V6YCJ5qGG55qE5ZCN56ew77yM57y655yB5pe26Ieq5Yqo55Sf5oiQXG4gICAqIG9wdGlvbnMg77yI5pWw57uE77yJIOW9ouWmgiBbIHt2YWx1ZTogJ3ZhbHVlMScsIHRleHQ6ICd0ZXh0MScgfSBdIOeahOaVsOe7hCDvvIzooajnpLrmiYDmnInlj6/pgInpoblcbiAgICogICAg5YW25LitIHZhbHVlIOihqOekuumAieaLqeivpemhueaXtuiiq+e7keWumuWPmOmHj+eahOWAvO+8jCB0ZXh0IOihqOekuuWvueW6lOmhueaYvuekuueahOaWh+acrFxuICAgKiAgICDlhYHorrjmnInoh7PlpJrkuIDkuKrmlbDnu4TlhYPntKDkuK3kuI3ljIXlkKsgdmFsdWUg5bGe5oCn77yM5q2k5pe25Lya55Sf5oiQ5LiA5Liq5paH5pys6L6T5YWl5qGG5Lul5L6/6L6T5YWl6Ieq5a6a5LmJ5YC8XG4gICAqIG5nLW1vZGVsIO+8iOWtl+espuS4su+8jOWPjOWQke+8iSDooajnpLrooqvnu5HlrprnmoTlj5jph4/vvIznqbrkuLLooajnpLrlvZPliY3msqHmnInkuIDkuKrlgLzooqvpgInkuK1cbiAgICogb24tY2hhbmdlIO+8iOWbnuiwg++8iSDlgLzlj5HnlJ/lj5jljJbml7bnmoTlm57osIPlh73mlbBcbiAgICogcmVxdWlyZWQg77yI5biD5bCU77yJIOeUqOS6juihqOWNlemqjOivgeivpemhueW/heWhq1xuICAgKiBmYWxsYmFja1ZhbHVlIO+8iOW4g+WwlHzlrZfnrKbkuLJ85pWw57uE77yM5Y+v6YCJ77yJIOS4jeWhq+WGmeaXtuWmguaenOWAvOmdnuazleWImee9ruepulxuICAgKiAgIOiLpeWhq+WGmeS6huivpemhue+8jCB0cnVlIOihqOekuuS8mum7mOiupOmAieaLqeesrOS4gOS4quWAvFxuICAgKiAgIOWtl+espuS4suWAvOihqOekuuS8mumAieaLqSB2YWx1ZSDkuI7lrZfnrKbkuLLlr7nlupTnmoTpoblcbiAgICogICDmlbDnu4Tlj6/ku6XljIXlkKvlrZfnrKbkuLLmiJYgdHJ1ZSDvvIzooajnpLrnlLHliY3oh7PlkI7pgJDkuKrmo4Dmn6XmmK/lkKblj6/nlKhcbiAgICovXG4gIGZvcm1JbnB1dHMuY29tcG9uZW50KCdmb3JtSW5wdXRSYWRpb0dyb3VwJywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1pbnB1dC1yYWRpby1jb250YWluZXJcIiBuZy1jbGFzcz1cInsgJ2Zvcm0taW5wdXQtcmFkaW8tYXMtY2FyZCc6ICRjdHJsLmNhcmRUZW1wbGF0ZSB9XCI+XG4gICAgICAgIDxmb3JtLW11bHRpcGxlLWlubGluZSBhbGlnbj1cInt7ICRjdHJsLndpZHRoID8gJ2xlZnQnIDogJ2p1c3RpZnknIH19XCI+XG4gICAgICAgICAgPGZvcm0tbXVsdGlwbGUtaW5saW5lLWl0ZW0gY2xhc3M9XCJmb3JtLWlucHV0LXJhZGlvLWlubmVyXCIgd2lkdGg9XCJ7eyAkY3RybC53aWR0aCB9fVwiIG5nLXJlcGVhdD1cIm9wdGlvbiBpbiAkY3RybC5vcHRpb25zXCI+XG4gICAgICAgICAgICA8bGFiZWwgbmctaWY9XCJvcHRpb24udmFsdWVcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb3JtLWlucHV0LXJhZGlvLW9wdGlvbi1jb250YWluZXJcIiBuZy1jbGFzcz1cInsgJ2Zvcm0taW5wdXQtcmFkaW8tb3B0aW9uLWNoZWNrZWQnOiAkY3RybC52YWx1ZSA9PT0gb3B0aW9uLnZhbHVlIH1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvcm0taW5wdXQtcmFkaW8td3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZm9ybS1pbnB1dC1yYWRpb1wiIHR5cGU9XCJyYWRpb1wiIG5hbWU9XCJ7eyAkY3RybC5uYW1lIH19XCIgdmFsdWU9XCJ7eyBvcHRpb24udmFsdWUgfX1cIiBuZy1tb2RlbD1cIiRjdHJsLnZhbHVlXCIgbmctcmVxdWlyZWQ9XCIhJGN0cmwudmFsdWUgJiYgJGN0cmwucmVxdWlyZWRcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb3JtLWlucHV0LXJhZGlvLWljb25cIj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9ybS1pbnB1dC1yYWRpby10ZXh0XCIgbmctYmluZD1cIm9wdGlvbi50ZXh0XCIgbmctaWY9XCIhJGN0cmwuY2FyZFRlbXBsYXRlXCI+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWlucHV0LXJhZGlvLWNhcmRcIiBuZy1pbmNsdWRlPVwiJGN0cmwuY2FyZFRlbXBsYXRlXCIgbmctaWY9XCIkY3RybC5jYXJkVGVtcGxhdGVcIiBuZy1yZXBlYXQ9XCJpdGVtIGluIFtvcHRpb25dXCI+PC9kaXY+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8bGFiZWwgbmctaWY9XCIhb3B0aW9uLnZhbHVlICYmICEkY3RybC5jYXJkVGVtcGxhdGVcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb3JtLWlucHV0LXJhZGlvLW9wdGlvbi1jb250YWluZXJcIiBuZy1jbGFzcz1cInsgJ2Zvcm0taW5wdXQtcmFkaW8tb3B0aW9uLWNoZWNrZWQnOiAkY3RybC52YWx1ZSA9PT0gJGN0cmwuY3VzdG9tRmFrZVZhbHVlIH1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvcm0taW5wdXQtcmFkaW8td3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZm9ybS1pbnB1dC1yYWRpb1wiIHR5cGU9XCJyYWRpb1wiIG5hbWU9XCJ7eyAkY3RybC5uYW1lIH19XCIgdmFsdWU9XCJ7eyAkY3RybC5jdXN0b21GYWtlVmFsdWUgfX1cIiBuZy1tb2RlbD1cIiRjdHJsLnZhbHVlXCIgbmctcmVxdWlyZWQ9XCIhJGN0cmwudmFsdWUgJiYgJGN0cmwucmVxdWlyZWRcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb3JtLWlucHV0LXJhZGlvLWljb25cIj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJmb3JtLWlucHV0LXJhZGlvLWlucHV0XCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cInt7IG9wdGlvbi50ZXh0IH19XCIgbmctbW9kZWw9XCIkY3RybC5jdXN0b21WYWx1ZVwiIG5nLWNoYW5nZT1cIiRjdHJsLnVwZGF0ZUN1c3RvbVwiIC8+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPC9mb3JtLW11bHRpcGxlLWlubGluZS1pdGVtPlxuICAgICAgICA8L2Zvcm0tbXVsdGlwbGUtaW5saW5lPlxuICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgbmFtZTogJ0AnLFxuICAgICAgb3B0aW9uczogJzwnLFxuICAgICAgbmdNb2RlbDogJz0nLFxuICAgICAgb25DaGFuZ2U6ICcmJyxcbiAgICAgIHJlcXVpcmVkOiAnQCcsXG4gICAgICBmYWxsYmFja1ZhbHVlOiAnPD8nLFxuICAgICAgd2lkdGg6ICdAJyxcbiAgICAgIGNhcmRUZW1wbGF0ZTogJ0AnLFxuICAgIH0sXG4gICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbiAoJHNjb3BlLCBhbmd1bGFyVGltZW91dCkge1xuICAgICAgY29uc3QgJGN0cmwgPSB0aGlzO1xuICAgICAgY29uc3QgJHRpbWVvdXQgPSBzY29wZWRUaW1lb3V0KGFuZ3VsYXJUaW1lb3V0LCAkc2NvcGUpO1xuXG4gICAgICAkY3RybC5jdXN0b21WYWx1ZSA9ICcnO1xuICAgICAgJGN0cmwuY3VzdG9tRmFrZVZhbHVlID0gZ2VuVW5pcXVlSWQoKTtcbiAgICAgICRjdHJsLnZhbHVlID0gJyc7XG4gICAgICBpZiAoISRjdHJsLm5hbWUpICRjdHJsLm5hbWUgPSBnZW5VbmlxdWVJZCgpO1xuXG4gICAgICBjb25zdCBpc1ZhbGlkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KCRjdHJsLm9wdGlvbnMpKSByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKCRjdHJsLm9wdGlvbnMuZmlsdGVyKG9wdGlvbiA9PiBvcHRpb24udmFsdWUgPT09IHZhbHVlKS5sZW5ndGgpIHJldHVybiAndmFsaWQnO1xuICAgICAgICBpZiAoJGN0cmwub3B0aW9ucy5zb21lKG9wdGlvbiA9PiAhb3B0aW9uLnZhbHVlKSkge1xuICAgICAgICAgIGlmICgkY3RybC5jdXN0b21GYWtlVmFsdWUgPT09IHZhbHVlKSByZXR1cm4gJ2Zha2UnO1xuICAgICAgICAgIHJldHVybiAnY3VzdG9tJztcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUgPT09ICcnKSByZXR1cm4gJ2VtcHR5JztcbiAgICAgICAgcmV0dXJuICdpbnZhbGlkJztcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGlucHV0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBsZXQgc3RhdHVzID0gaXNWYWxpZCgkY3RybC5uZ01vZGVsKTtcbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gJ2ludmFsaWQnIHx8IHN0YXR1cyA9PT0gJ2VtcHR5Jykgc2V0VG9GYWxsYmFjaygpO1xuICAgICAgICBpZiAoc3RhdHVzID09PSAnY3VzdG9tJyB8fCBzdGF0dXMgPT09ICdmYWtlJyB8fCAkY3RybC5uZ01vZGVsID09PSAkY3RybC5jdXN0b21WYWx1ZSkge1xuICAgICAgICAgICRjdHJsLmN1c3RvbVZhbHVlID0gJGN0cmwubmdNb2RlbDtcbiAgICAgICAgICAkY3RybC52YWx1ZSA9ICRjdHJsLmN1c3RvbUZha2VWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdHVzID09PSAndmFsaWQnKSB7XG4gICAgICAgICAgJGN0cmwudmFsdWUgPSAkY3RybC5uZ01vZGVsO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBzZXRUb051bGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRjdHJsLm5nTW9kZWwgPSAkY3RybC52YWx1ZSA9IG51bGw7XG4gICAgICAgICRjdHJsLmN1c3RvbVZhbHVlID0gJyc7XG4gICAgICAgIHRyaWdnZXJDaGFuZ2UoKTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHNldFRvRmFsbGJhY2tIZWxwZXIgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICh0YXJnZXQgPT09IHRydWUpIHRhcmdldCA9ICgkY3RybC5vcHRpb25zWzBdIHx8IHt9KS52YWx1ZTtcbiAgICAgICAgaWYgKCF0YXJnZXQpIHRhcmdldCA9IG51bGw7XG4gICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkodGFyZ2V0KSkgcmV0dXJuIHRhcmdldC5zb21lKHNldFRvRmFsbGJhY2spO1xuICAgICAgICBsZXQgc3RhdHVzID0gdGFyZ2V0ID09PSBudWxsID8gJ251bGwnIDogaXNWYWxpZCh0YXJnZXQpO1xuICAgICAgICBpZiAoc3RhdHVzID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIGlmIChzdGF0dXMgPT09ICdpbnZhbGlkJyB8fCBzdGF0dXMgPT09ICdmYWtlJykgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoc3RhdHVzID09PSAnY3VzdG9tJykge1xuICAgICAgICAgICRjdHJsLm5nTW9kZWwgPSAkY3RybC5jdXN0b21WYWx1ZSA9IHRhcmdldDtcbiAgICAgICAgICAkY3RybC52YWx1ZSA9ICRjdHJsLmN1c3RvbUZha2VWYWx1ZTtcbiAgICAgICAgICB0cmlnZ2VyQ2hhbmdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gJ3ZhbGlkJykge1xuICAgICAgICAgICRjdHJsLm5nTW9kZWwgPSAkY3RybC52YWx1ZSA9IHRhcmdldDtcbiAgICAgICAgICB0cmlnZ2VyQ2hhbmdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gJ251bGwnIHx8IHN0YXR1cyA9PT0gJ2VtcHR5Jykge1xuICAgICAgICAgIHNldFRvTnVsbCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcblxuICAgICAgY29uc3Qgc2V0VG9GYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFzZXRUb0ZhbGxiYWNrSGVscGVyKCRjdHJsLmZhbGxiYWNrVmFsdWUpKSB7XG4gICAgICAgICAgc2V0VG9OdWxsKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IG91dHB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbGV0IHN0YXR1cyA9IGlzVmFsaWQoJGN0cmwudmFsdWUpO1xuICAgICAgICBpZiAoc3RhdHVzID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIGlmIChzdGF0dXMgPT09ICdpbnZhbGlkJyB8fCBzdGF0dXMgPT09ICdjdXN0b20nIHx8IHN0YXR1cyA9PT0gJ2VtcHR5Jykge1xuICAgICAgICAgIHNldFRvRmFsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdHVzID09PSAnZmFrZScpIHtcbiAgICAgICAgICAkY3RybC5uZ01vZGVsID0gJGN0cmwuY3VzdG9tVmFsdWU7XG4gICAgICAgICAgdHJpZ2dlckNoYW5nZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGF0dXMgPT09ICd2YWxpZCcpIHtcbiAgICAgICAgICAkY3RybC5uZ01vZGVsID0gJGN0cmwudmFsdWU7XG4gICAgICAgICAgdHJpZ2dlckNoYW5nZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBjb25zdCB1cGRhdGVPcHRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxldCBzdGF0dXMgPSBpc1ZhbGlkKCRjdHJsLnZhbHVlKTtcbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICBpZiAoc3RhdHVzID09PSAnaW52YWxpZCcpIHNldFRvRmFsbGJhY2soKTtcbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gJ2N1c3RvbScpIHtcbiAgICAgICAgICAkY3RybC5jdXN0b21WYWx1ZSA9ICRjdHJsLnZhbHVlO1xuICAgICAgICAgICRjdHJsLnZhbHVlID0gJGN0cmwuY3VzdG9tRmFrZVZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGF0dXMgPT09ICdmYWtlJykge1xuICAgICAgICAgIGlmIChpc1ZhbGlkKCRjdHJsLm5nTW9kZWwpID09PSAndmFsaWQnKSB7XG4gICAgICAgICAgICAkY3RybC52YWx1ZSA9ICRjdHJsLm5nTW9kZWw7XG4gICAgICAgICAgICAkY3RybC5jdXN0b21WYWx1ZSA9ICcnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdHVzID09PSAnZW1wdHknKSB7XG4gICAgICAgICAgc2V0VG9GYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICAgIG91dHB1dCgpO1xuICAgICAgfTtcblxuICAgICAgJGN0cmwudXBkYXRlQ3VzdG9tID0gZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICAkY3RybC52YWx1ZSA9ICRjdHJsLmN1c3RvbUZha2VWYWx1ZTtcbiAgICAgICAgb3V0cHV0KCk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCB0cmlnZ2VyQ2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkdGltZW91dCgoKSA9PiAkY3RybC5vbkNoYW5nZSgpLCAwKTtcbiAgICAgIH07XG5cbiAgICAgIGlucHV0KCk7XG4gICAgICAkc2NvcGUuJHdhdGNoKCckY3RybC5uZ01vZGVsJywgaW5wdXQpO1xuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwudmFsdWUnLCBvdXRwdXQpO1xuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwub3B0aW9ucycsIHVwZGF0ZU9wdGlvbik7XG4gICAgfV1cbiAgfSk7XG4gIC8qXG4gICAqIOi/meaYr+ekuuS+i++8jOivt+WLv+S9v+eUqFxuICAgKiDogIzkuJTmoLflvI/or7fli7/pmo/mhI/lhoXogZRcbiAgICovXG4gIGZvcm1JbnB1dHMuY29tcG9uZW50KCdmb3JtSW5wdXRSYWRpb0NhcmRTYW1wbGUnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgIDxzcGFuIGNsYXNzPVwiZm9ybS1pbnB1dC1yYWRpby1jYXJkLXNhbXBsZVwiIHN0eWxlPVwiZGlzcGxheTogYmxvY2s7XCI+XG4gICAgICAgIDxzcGFuIHN0eWxlPVwiZGlzcGxheTogYmxvY2s7IGZvbnQtd2VpZ2h0OiBib2xkO1wiPuS4gOS6m+aWh+Wtlzwvc3Bhbj5cbiAgICAgICAgPHNwYW4gc3R5bGU9XCJkaXNwbGF5OiBibG9jaztcIiBuZy1iaW5kPVwiICRjdHJsLm9wdGlvbi50ZXh0IFwiPjwvc3Bhbj5cbiAgICAgIDwvc3Bhbj5cbiAgICBgLFxuICAgIGJpbmRpbmdzOiB7IG9wdGlvbjogJz0nIH0sXG4gICAgY29udHJvbGxlcjogW2Z1bmN0aW9uICgpIHsgfV1cbiAgfSk7XG5cbiAgLypcbiAgICogPGZvcm0taW5wdXQtY2hlY2tib3g+IOeUqOS6juWxleekuuS4gOS4quWkjemAieahhlxuICAgKlxuICAgKiBuYW1lIO+8iOWtl+espuS4su+8iSDovpPlhaXmoYbnmoQgbmFtZVxuICAgKiB2YWx1ZS10cnVlIO+8iOWNleWQke+8jOWPr+mAie+8iSDli77pgInml7bnu5HlrprlvpfliLDnmoTlgLzvvIjpu5jorqTkuLpcIm9uXCLvvIlcbiAgICogdmFsdWUtZmFsc2Ug77yI5Y2V5ZCR77yM5Y+v6YCJ77yJIOacqumAieaXtue7keWumuW+l+WIsOeahOWAvO+8iOm7mOiupOS4ulwiXCLvvIlcbiAgICogbmctbW9kZWwg77yI5Y+M5ZCR77yJIOW+hee7keWumueahOWvueixoVxuICAgKiByZXF1aXJlZCDvvIjlj6/pgInvvIkg55So5LqO6KGo5Y2V6aqM6K+B77yM6KGo56S65b+F6aG75Yu+6YCJXG4gICAqIHJlcXVpcmVkLWZhbHNlIO+8iOWPr+mAie+8iSDnlKjkuo7ooajljZXpqozor4HvvIzooajnpLrlv4XpobvkuI3li77pgInvvIjlpITnkIbplJnor6/ml7blkIzmoLfpgILnlKggcmVxdWlyZWQg57G75Z6L6ZSZ6K+v77yJXG4gICAqIG9uLWNoYW5nZSDvvIjlm57osIPvvIkg5YC85pS55Y+Y5pe25Zue6LCDXG4gICAqIHRleHQg77yI5paH5pys77yM5Y+v6YCJ77yJIOaYvuekuuWcqOWkjemAieahhuWPs+S+p+eahOaWh+Wtl1xuICAgKiBhcHBlYXJhbmNlIO+8iOaWh+acrO+8iSDlpI3pgInmoYblsZXnpLrnmoTmoLflvI/vvIzlj6/pgIkgY2hlY2tib3gg77yI6buY6K6k77yJ44CBIHN3aXRjaCDjgIEgYnV0dG9uIOWSjCBub25lXG4gICAqXG4gICAqIHRyYW5zY2x1ZGUg5aaC5p6c5rKh5pyJ5oyH5a6a5paH5pys77yM5YiZ5bCG5YyF5ZCr55qE5YaF5a655pi+56S65Zyo5aSN6YCJ5qGG5ZCO77yM5ZCm5YiZ5bCG5LiN5pi+56S6XG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZm9ybUlucHV0Q2hlY2tib3gnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWlucHV0LWNoZWNrYm94LWNvbnRhaW5lclwiIG5nLWNsYXNzPVwie1xuICAgICAgICAnZm9ybS1pbnB1dC1jaGVja2JveC1hcy1zd2l0Y2gtY29udGFpbmVyJzogJGN0cmwuYXBwZWFyYW5jZSA9PT0gJ3N3aXRjaCcsXG4gICAgICAgICdmb3JtLWlucHV0LWNoZWNrYm94LWFzLWJ1dHRvbi1jb250YWluZXInOiAkY3RybC5hcHBlYXJhbmNlID09PSAnYnV0dG9uJyxcbiAgICAgICAgJ2Zvcm0taW5wdXQtY2hlY2tib3gtaGlkZGVuLWNvbnRhaW5lcic6ICRjdHJsLmFwcGVhcmFuY2UgPT09ICdub25lJyxcbiAgICAgIH1cIj5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgbmFtZT1cInt7ICRjdHJsLnZhbGlkID8gJGN0cmwucmFuZG9tTmFtZSA6ICRjdHJsLm5hbWUgfX1cIlxuICAgICAgICAgIHR5cGU9XCJoaWRkZW5cIlxuICAgICAgICAgIG5nLW1vZGVsPVwiJGN0cmwuZW1wdHlcIlxuICAgICAgICAgIG5nLXJlcXVpcmVkPVwie3sgISRjdHJsLnZhbGlkIH19XCJcbiAgICAgICAgICBuZy1kaXNhYmxlZD1cInt7ICRjdHJsLnZhbGlkIH19XCJcbiAgICAgICAgLz5cbiAgICAgICAgPGxhYmVsPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9ybS1pbnB1dC1jaGVja2JveC1vcHRpb24tY29udGFpbmVyXCIgbmctY2xhc3M9XCJ7ICdmb3JtLWlucHV0LWNoZWNrYm94LW9wdGlvbi1jaGVja2VkJzogJGN0cmwudmFsdWUgfVwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb3JtLWlucHV0LWNoZWNrYm94LXdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiZm9ybS1pbnB1dC1jaGVja2JveFwiXG4gICAgICAgICAgICAgICAgbmFtZT1cInt7ICRjdHJsLnZhbGlkID8gJGN0cmwubmFtZSA6ICRjdHJsLnJhbmRvbU5hbWUgfX1cIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgbmctbW9kZWw9XCIkY3RybC52YWx1ZVwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9ybS1pbnB1dC1jaGVja2JveC1pY29uXCI+PC9zcGFuPlxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb3JtLWlucHV0LXJhZGlvLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb3JtLWlucHV0LXJhZGlvLXRleHRcIiBuZy1pZj1cIiRjdHJsLnRleHQgIT0gbnVsbFwiIG5nLWJpbmQ9XCIkY3RybC50ZXh0XCI+PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvcm0taW5wdXQtcmFkaW8tY29tcGxleFwiIG5nLWlmPVwiJGN0cmwudGV4dCA9PSBudWxsXCIgbmctdHJhbnNjbHVkZT48L3NwYW4+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvZGl2PlxuICAgIGAsXG4gICAgYmluZGluZ3M6IHtcbiAgICAgIG5hbWU6ICdAJyxcbiAgICAgIHZhbHVlVHJ1ZTogJzw/dmFsdWUnLFxuICAgICAgdmFsdWVGYWxzZTogJzw/JyxcbiAgICAgIG5nTW9kZWw6ICc9JyxcbiAgICAgIHJlcXVpcmVkOiAnQCcsXG4gICAgICByZXF1aXJlZEZhbHNlOiAnQCcsXG4gICAgICBvbkNoYW5nZTogJyYnLFxuICAgICAgdGV4dDogJ0A/JyxcbiAgICAgIGFwcGVhcmFuY2U6ICdAJyxcbiAgICB9LFxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbiAoJHNjb3BlLCBhbmd1bGFyVGltZW91dCkge1xuICAgICAgY29uc3QgJGN0cmwgPSB0aGlzO1xuICAgICAgY29uc3QgJHRpbWVvdXQgPSBzY29wZWRUaW1lb3V0KGFuZ3VsYXJUaW1lb3V0LCAkc2NvcGUpO1xuXG4gICAgICAkY3RybC5lbXB0eSA9ICcnO1xuICAgICAgJGN0cmwucmFuZG9tTmFtZSA9IGdlblVuaXF1ZUlkKCk7XG4gICAgICAkY3RybC52YWxpZCA9IGZhbHNlO1xuXG4gICAgICBpZiAoISRjdHJsLm5hbWUpICRjdHJsLm5hbWUgPSBnZW5VbmlxdWVJZCgpO1xuICAgICAgaWYgKCRjdHJsLnZhbHVlVHJ1ZSA9PT0gdm9pZCAwKSAkY3RybC52YWx1ZVRydWUgPSAnb24nO1xuICAgICAgaWYgKCRjdHJsLnZhbHVlRmFsc2UgPT09IHZvaWQgMCkgJGN0cmwudmFsdWVGYWxzZSA9ICcnO1xuXG4gICAgICBjb25zdCBpbnB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCRjdHJsLm5nTW9kZWwgPT09ICRjdHJsLnZhbHVlVHJ1ZSkgJGN0cmwudmFsdWUgPSB0cnVlO1xuICAgICAgICBlbHNlIGlmICgkY3RybC5uZ01vZGVsID09PSAkY3RybC52YWx1ZUZhbHNlKSAkY3RybC52YWx1ZSA9IGZhbHNlO1xuICAgICAgICBlbHNlICRjdHJsLm5nTW9kZWwgPSAkY3RybC52YWx1ZSA/ICRjdHJsLnZhbHVlVHJ1ZSA6ICRjdHJsLnZhbHVlRmFsc2U7XG4gICAgICB9O1xuICAgICAgY29uc3Qgb3V0cHV0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodHlwZW9mICRjdHJsLnZhbHVlICE9PSAnYm9vbGVhbicpICRjdHJsLnZhbHVlID0gJGN0cmwudmFsdWUgPT0gdHJ1ZTtcbiAgICAgICAgaWYgKCRjdHJsLm5nTW9kZWwgIT09ICRjdHJsLnZhbHVlVHJ1ZSAmJiAkY3RybC52YWx1ZSkge1xuICAgICAgICAgICRjdHJsLm5nTW9kZWwgPSAkY3RybC52YWx1ZVRydWU7XG4gICAgICAgICAgJHRpbWVvdXQoKCkgPT4gJGN0cmwub25DaGFuZ2UoKSwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCRjdHJsLm5nTW9kZWwgIT09ICRjdHJsLnZhbHVlRmFsc2UgJiYgISRjdHJsLnZhbHVlKSB7XG4gICAgICAgICAgJGN0cmwubmdNb2RlbCA9ICRjdHJsLnZhbHVlRmFsc2U7XG4gICAgICAgICAgJHRpbWVvdXQoKCkgPT4gJGN0cmwub25DaGFuZ2UoKSwgMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjb25zdCB2YWxpZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJGN0cmwudmFsaWQgPSAhKCRjdHJsLnZhbHVlID8gJGN0cmwucmVxdWlyZWRGYWxzZSA6ICRjdHJsLnJlcXVpcmVkKTtcbiAgICAgIH07XG4gICAgICAkc2NvcGUuJHdhdGNoKCckY3RybC5uZ01vZGVsJywgaW5wdXQpO1xuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwudmFsdWUnLCBvdXRwdXQpO1xuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwudmFsdWVUcnVlJywgb3V0cHV0KTtcbiAgICAgICRzY29wZS4kd2F0Y2goJyRjdHJsLnZhbHVlRmFsc2UnLCBvdXRwdXQpO1xuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwudmFsdWUnLCB2YWxpZCk7XG4gICAgfV0sXG4gIH0pO1xuXG4gIC8qXG4gICAqIDxmb3JtLXNlYXJjaC1ib3g+IOeUqOadpeaPj+i/sOS4gOS4queUqOS6juaQnOe0oueahOi+k+WFpeahhlxuICAgKlxuICAgKiBuZy1tb2RlbCDooqvnu5HlrprnmoTlgLxcbiAgICogcGxhY2Vob2xkZXIg6aKE5a6a5LmJ5paH5pysXG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZm9ybVNlYXJjaEJveCcsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tc2VhcmNoLWJveC1jb250YWluZXJcIj48bGFiZWw+XG4gICAgICAgIDxpbnB1dCBjbGFzcz1cImZvcm0tc2VhcmNoLWJveC1pbnB1dFwiIHR5cGU9XCJzZWFyY2hcIiBuZy1tb2RlbD1cIiRjdHJsLm5nTW9kZWxcIiBwbGFjZWhvbGRlcj1cInt7ICRjdHJsLnBsYWNlaG9sZGVyIHx8ICcnIH19XCIgbmctbW9kZWwtb3B0aW9uPVwieyBkZWJvdW5jZTogJGN0cmwuZGVib3VuY2UgfHwgMCB9XCIgbmctY2hhbmdlPVwiJGN0cmwuY2hhbmdlKClcIiAvPlxuICAgICAgICA8aWNvbi1zZWFyY2ggY2xhc3M9XCJmb3JtLXNlYXJjaC1ib3gtaWNvblwiPjwvaWNvbi1zZWFyY2g+XG4gICAgICA8L2xhYmVsPjwvZGl2PlxuICAgIGAsXG4gICAgYmluZGluZ3M6IHsgbmdNb2RlbDogJz0nLCBwbGFjZWhvbGRlcjogJ0AnLCBkZWJvdW5jZTogJzw/Jywgb25DaGFuZ2U6ICcmJywgfSxcbiAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckdGltZW91dCcsIGZ1bmN0aW9uICgkc2NvcGUsIGFuZ3VsYXJUaW1lb3V0KSB7XG4gICAgICBjb25zdCAkY3RybCA9IHRoaXM7XG4gICAgICBjb25zdCAkdGltZW91dCA9IHNjb3BlZFRpbWVvdXQoYW5ndWxhclRpbWVvdXQsICRzY29wZSk7XG4gICAgICAkY3RybC5jaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICR0aW1lb3V0KCgpID0+IHsgJGN0cmwub25DaGFuZ2UoKTsgfSk7XG4gICAgICB9O1xuICAgIH1dLFxuICB9KTtcblxuICAvKlxuICAgKiA8Zm9ybS1zZWFyY2gtYm94LXdpdGgtY291bnQ+IOS4gOS4quaQnOe0ouahhuWSjOS4gOS4quiuoeaVsOWZqFxuICAgKlxuICAgKiBuZy1tb2RlbCDooqvnu5HlrprnmoTlgLxcbiAgICogcGxhY2Vob2xkZXIg6aKE5a6a5LmJ5paH5pysXG4gICAqIHRleHQtcHJlZml4IOaWh+acrOWJjee8gFxuICAgKiB0ZXh0LXN1ZmZpeCDmlofmnKzlkI7nvIBcbiAgICogdG90YWwg5oC75pWwXG4gICAqIG1hdGNoIOWMuemFjeaVsFxuICAgKi9cbiAgZm9ybUlucHV0cy5jb21wb25lbnQoJ2Zvcm1TZWFyY2hCb3hXaXRoQ291bnQnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgIDxmb3JtLW11bHRpcGxlLWlubGluZT5cbiAgICAgICAgPGZvcm0tbXVsdGlwbGUtaW5saW5lLWl0ZW0gY2xhc3M9XCJmb3JtLXNlYXJjaC1ib3gtdGV4dC13cmFwcGVyXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb3JtLXNlYXJjaC1ib3gtdGV4dFwiIG5nLWlmPVwiJGN0cmwudG90YWwgfHwgJGN0cmwudG90YWwgPT09IDBcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9ybS1zZWFyY2gtYm94LXRleHQtcHJlZml4XCIgbmctYmluZD1cIiRjdHJsLnRleHRQcmVmaXhcIj48L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvcm0tc2VhcmNoLWJveC10ZXh0LW1hdGNoXCIgbmctYmluZD1cIiRjdHJsLm1hdGNoXCIgbmctaWY9XCIkY3RybC5uZ01vZGVsXCI+PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb3JtLXNlYXJjaC1ib3gtdGV4dC1saW5lXCIgbmctaWY9XCIkY3RybC5uZ01vZGVsXCI+Lzwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9ybS1zZWFyY2gtYm94LXRleHQtdG90YWxcIiBuZy1iaW5kPVwiJGN0cmwudG90YWxcIj48L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvcm0tc2VhcmNoLWJveC10ZXh0LXByZWZpeFwiIG5nLWJpbmQ9XCIkY3RybC50ZXh0U3VmZml4XCI+PC9zcGFuPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPC9mb3JtLW11bHRpcGxlLWlubGluZS1pdGVtPlxuICAgICAgICA8Zm9ybS1tdWx0aXBsZS1pbmxpbmUtaXRlbSBjbGFzcz1cImZvcm0tc2VhcmNoLWJveC13cmFwcGVyXCI+XG4gICAgICAgICAgPGZvcm0tc2VhcmNoLWJveCBuZy1tb2RlbD1cIiRjdHJsLm5nTW9kZWxcIiBwbGFjZWhvbGRlcj1cInt7ICRjdHJsLnBsYWNlaG9sZGVyIH19XCIgZGVib3VuY2U9XCIkY3RybC5kZWJvdW5jZVwiIG9uLWNoYW5nZT1cIiRjdHJsLmNoYW5nZSgpXCI+PC9mb3JtLXNlYXJjaC1ib3g+XG4gICAgICAgIDwvZm9ybS1tdWx0aXBsZS1pbmxpbmUtaXRlbT5cbiAgICAgIDwvZm9ybS1tdWx0aXBsZS1pbmxpbmU+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgbmdNb2RlbDogJz0nLFxuICAgICAgcGxhY2Vob2xkZXI6ICdAJyxcbiAgICAgIGRlYm91bmNlOiAnPD8nLFxuICAgICAgdGV4dFByZWZpeDogJ0AnLFxuICAgICAgdGV4dFN1ZmZpeDogJ0AnLFxuICAgICAgdG90YWw6ICdAJyxcbiAgICAgIG1hdGNoOiAnQCcsXG4gICAgICBvbkNoYW5nZTogJyYnLFxuICAgIH0sXG4gICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbiAoJHNjb3BlLCBhbmd1bGFyVGltZW91dCkge1xuICAgICAgY29uc3QgJGN0cmwgPSB0aGlzO1xuICAgICAgY29uc3QgJHRpbWVvdXQgPSBzY29wZWRUaW1lb3V0KGFuZ3VsYXJUaW1lb3V0LCAkc2NvcGUpO1xuICAgICAgJGN0cmwuY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkdGltZW91dCgoKSA9PiB7ICRjdHJsLm9uQ2hhbmdlKCk7IH0pO1xuICAgICAgfTtcbiAgICB9XSxcbiAgfSk7XG5cbiAgLypcbiAgICogPGZvcm0tYXJyYXktY29udGFpbmVyPlxuICAgKiDnlKjkuo7nu7TmiqTmlbDnu4TlgLznmoTooajljZXpobnvvIzljIXmi6zmt7vliqDmjInpkq7lkozpgJDooYznmoTliKDpmaTmjInpkq5cbiAgICpcbiAgICogdHlwZSDvvIjlrZfnrKbkuLLvvIkg5o6n5Yi25aSW6KeC77yM5Y+v5Lul6YCJ5oupIHNpbXBsZSDmiJYgY29tcGxleFxuICAgKiBuZy1tb2RlbCDvvIjlj4zlkJHvvIkg6KKr57uR5a6a55qE5Y+Y6YeP77yI5pWw57uE77yJXG4gICAqIHRlbXBsYXRlIO+8iOWtl+espuS4su+8iSDnlKjkuo7mlbDnu4TpobnnmoTmqKHmnb/lkI3np7DvvIjkuIDkuKogY29tcG9uZW50IOaIliBkaXJlY3RpdmUg5ZCN77yJXG4gICAqIGl0ZW1EcmFmdCDvvIjljZXlkJHvvIkg5re75Yqg5YWD57Sg5pe25re75Yqg5LuA5LmIXG4gICAqIG9uQ2hhbmdlIO+8iOWbnuiwg++8iSDmlbDnu4TmnInku7vkvZXkv67mlLnml7blm57osINcbiAgICogb25BZGQg77yI5Zue6LCD77yJIOaVsOe7hOa3u+WKoOaXtuWbnuiwg1xuICAgKiBvbkRlbGV0ZSDvvIjlm57osIPvvIkg5pWw57uE5Yig6Zmk5pe25Zue6LCDXG4gICAqIG1heExlbmd0aCDvvIjljZXlkJHvvIzmlbDlgLzvvIkg6KGo56S65pyA5aSa5YWB6K645aSa5bCR5YWD57Sg77yMbWF4TGVuZ3RoIOW6lOW9k+Wkp+S6juetieS6jiAwXG4gICAqIG1pbkxlbmd0aCDvvIjljZXlkJHvvIzmlbDlgLzvvIkg6KGo5aW95Ly85pyA5bCR6ZyA6KaB5aSa5bCR5YWD57Sg77yMbWluTGVuZ3RoIOW6lOW9k+Wkp+S6juetieS6jiAwIOWwj+S6juetieS6jiBtYXhMZW5ndGhcbiAgICovXG4gIGZvcm1JbnB1dHMuY29tcG9uZW50KCdmb3JtQXJyYXlDb250YWluZXInLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWFycmF5LWNvbnRhaW5lclwiIG5nLWNsYXNzPVwieyAnZm9ybS1hcnJheS1jb250YWluZXItY29tcGxleCc6ICRjdHJsLnR5cGUgPT09ICdjb21wbGV4JyB9XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWFycmF5LWl0ZW1cIiBuZy1yZXBlYXQ9J2l0ZW0gaW4gJGN0cmwubmdNb2RlbCB0cmFjayBieSAkaW5kZXgnPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWFycmF5LWl0ZW0tY29udGVudFwiIG5nLWlmPVwiJGN0cmwudHlwZSA9PT0gJ3NpbXBsZSdcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWFycmF5LWl0ZW0td3JhcHBlclwiIG5nLWluY2x1ZGU9XCIkY3RybC50ZW1wbGF0ZVwiIG5nLWlmPVwiJGN0cmwudGVtcGxhdGVcIj48L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1hcnJheS1pdGVtLWNvbnRlbnRcIiBuZy1pZj1cIiRjdHJsLnR5cGUgPT09ICdjb21wbGV4J1wiPlxuICAgICAgICAgICAgPHN1Yi1mb3JtLWNvbnRhaW5lciBsZWZ0LWNvbHVtbi13aWR0aD1cInt7ICRjdHJsLmxlZnRDb2x1bW5XaWR0aCB9fVwiPlxuICAgICAgICAgICAgICA8Zm9ybS1jb25maWctZ3JvdXA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tYXJyYXktaXRlbS13cmFwcGVyXCIgbmctaWY9XCIkY3RybC50ZW1wbGF0ZVwiIG5nLWluY2x1ZGU9XCIkY3RybC50ZW1wbGF0ZVwiPjwvZGl2PlxuICAgICAgICAgICAgICA8L2Zvcm0tY29uZmlnLWdyb3VwPlxuICAgICAgICAgICAgPC9zdWItZm9ybS1jb250YWluZXI+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tYXJyYXktaXRlbS1kZWxldGVcIiBuZy1jbGljaz1cIiRjdHJsLmRlbGV0ZUl0ZW0oJGluZGV4KVwiIG5nLWlmPVwiJGN0cmwubWluTGVuZ3RoIC0gMCA9PT0gJGN0cmwubWluTGVuZ3RoICYmICRjdHJsLm5nTW9kZWwubGVuZ3RoID4gJGN0cmwubWluTGVuZ3RoXCI+XG4gICAgICAgICAgICA8aWNvbi1kZWxldGUgY2xhc3M9XCJmb3JtLWFycmF5LWl0ZW0tZGVsZXRlLWljb25cIiBuZy1pZj1cIiRjdHJsLnR5cGUgPT09ICdzaW1wbGUnXCI+PC9pY29uLWRlbGV0ZT5cbiAgICAgICAgICAgIDxpY29uLWNsb3NlIGNsYXNzPVwiZm9ybS1hcnJheS1pdGVtLWRlbGV0ZS1pY29uXCIgbmctaWY9XCIkY3RybC50eXBlID09PSAnY29tcGxleCdcIj48L2ljb24tY2xvc2U+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tYXJyYXktaXRlbS1kZWxldGUgZm9ybS1hcnJheS1pdGVtLWRlbGV0ZS1kaXNhYmxlZFwiIG5nLWlmPVwiISgkY3RybC5taW5MZW5ndGggLSAwID09PSAkY3RybC5taW5MZW5ndGggJiYgJGN0cmwubmdNb2RlbC5sZW5ndGggPiAkY3RybC5taW5MZW5ndGgpICYmICRjdHJsLnR5cGUgPT09ICdzaW1wbGUnXCI+XG4gICAgICAgICAgICA8aWNvbi1kZWxldGUgY2xhc3M9XCJmb3JtLWFycmF5LWl0ZW0tZGVsZXRlLWljb25cIiBuZy1pZj1cIiRjdHJsLnR5cGUgPT09ICdzaW1wbGUnXCIgZGlzYWJsZWQ9XCJkaXNhYmxlZFwiPjwvaWNvbi1kZWxldGU+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1hcnJheS1pdGVtLWFkZFwiIG5nLWNsaWNrPVwiJGN0cmwuYWRkSXRlbSgpXCIgbmctaWY9XCIkY3RybC5tYXhMZW5ndGggLSAwID09PSAkY3RybC5tYXhMZW5ndGggJiYgJGN0cmwubmdNb2RlbC5sZW5ndGggPCAkY3RybC5tYXhMZW5ndGhcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGAsXG4gICAgYmluZGluZ3M6IHtcbiAgICAgIG5nTW9kZWw6ICc9JyxcbiAgICAgIHRlbXBsYXRlOiAnQCcsXG4gICAgICBpdGVtRHJhZnQ6ICc8JyxcbiAgICAgIG9uQ2hhbmdlOiAnJicsXG4gICAgICBvbkFkZDogJyYnLFxuICAgICAgb25EZWxldGU6ICcmJyxcbiAgICAgIG1heExlbmd0aDogJzwnLFxuICAgICAgbWluTGVuZ3RoOiAnPCcsXG4gICAgICB0eXBlOiAnQCcsXG4gICAgICBsZWZ0Q29sdW1uV2lkdGg6ICdAJyxcbiAgICB9LFxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgY29udHJvbGxlcjogWyckc2NvcGUnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gICAgICBjb25zdCAkY3RybCA9IHRoaXM7XG5cbiAgICAgICRjdHJsLmFkZEl0ZW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KCRjdHJsLm5nTW9kZWwpKSAkY3RybC5uZ01vZGVsID0gW107XG4gICAgICAgIGxldCBpdGVtID0gYW5ndWxhci5jb3B5KCRjdHJsLml0ZW1EcmFmdCk7XG4gICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oaXRlbSkpIGl0ZW0gPSBpdGVtKCRjdHJsLm5nTW9kZWwpO1xuICAgICAgICBsZXQgaW5kZXggPSAkY3RybC5uZ01vZGVsLnB1c2goaXRlbSkgLSAxO1xuICAgICAgICAkY3RybC5vbkFkZCh7IGl0ZW0sIGluZGV4IH0pO1xuICAgICAgfTtcbiAgICAgICRjdHJsLmRlbGV0ZUl0ZW0gPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgbGV0IGl0ZW0gPSAkY3RybC5uZ01vZGVsLnNwbGljZShpbmRleCwgMSlbMF07XG4gICAgICAgICRjdHJsLm9uRGVsZXRlKHsgaXRlbSwgaW5kZXggfSk7XG4gICAgICB9O1xuICAgICAgY29uc3QgZml0TGVuZ3RoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIWFuZ3VsYXIuaXNBcnJheSgkY3RybC5uZ01vZGVsKSkgJGN0cmwubmdNb2RlbCA9W107XG4gICAgICAgIGxldCBtYXhMZW5ndGggPSAkY3RybC5tYXhMZW5ndGgsIG1pbkxlbmd0aCA9ICRjdHJsLm1pbkxlbmd0aDtcbiAgICAgICAgbWF4TGVuZ3RoID0gTWF0aC5tYXgobWF4TGVuZ3RoIC0wID09PSBtYXhMZW5ndGggPyBtYXhMZW5ndGg6IEluZmluaXR5LCAwKTtcbiAgICAgICAgbWluTGVuZ3RoID0gTWF0aC5tYXgobWluTGVuZ3RoIC0wID09PSBtaW5MZW5ndGggPyBtaW5MZW5ndGg6IDAsIDApO1xuICAgICAgICBpZiAobWF4TGVuZ3RoIDwgbWluTGVuZ3RoKSByZXR1cm47XG4gICAgICAgIHdoaWxlICgkY3RybC5uZ01vZGVsLmxlbmd0aCA8IG1pbkxlbmd0aCkgJGN0cmwuYWRkSXRlbSgpO1xuICAgICAgICB3aGlsZSAoJGN0cmwubmdNb2RlbC5sZW5ndGggPiBtYXhMZW5ndGgpICRjdHJsLmRlbGV0ZUl0ZW0oJGN0cmwubmdNb2RlbC5sZW5ndGggLTEpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJGN0cmwub25DaGFuZ2UoKTtcbiAgICAgIH07XG4gICAgICBmaXRMZW5ndGgoKTtcbiAgICAgICRzY29wZS4kd2F0Y2goJyRjdHJsLm5nTW9kZWwnLCBmaXRMZW5ndGgsIHRydWUpO1xuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwubmdNb2RlbCcsIGNoYW5nZSwgdHJ1ZSk7XG4gICAgICAkc2NvcGUuJHdhdGNoKCckY3RybC5taW5MZW5ndGgnLCBmaXRMZW5ndGgpO1xuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwubWF4TGVuZ3RoJywgZml0TGVuZ3RoKTtcbiAgICB9XVxuICB9KTtcblxuICAvKlxuICAgKiA8Zm9ybS1zZWFyY2gtZHJvcGRvd24+XG4gICAqIOS4gOS4quiHquW4puaQnOe0ouS4i+aLieiPnOWNleeahOi+k+WFpeahhu+8jOi+k+WFpeahhueahOWPr+mAieaWh+acrOW/hemhu+WcqOaQnOe0ouahhuWGhe+8jOi+k+WFpeahhueahOWAvOaYr+WSjOWvueW6lOaWh+acrOWvueW6lOeahOWAvFxuICAgKiDov5nkuKrovpPlhaXmoYbkuI3lu7rorq7lnKjnvZHpobXkuK3nm7TmjqXkvb/nlKjvvIzogIzmmK/lu7rorq7lsIblhbblsIHoo4Xkuo7lhbbku5blip/og73mm7TlhbfkvZPnmoTovpPlhaXmoYbkuK3kvb/nlKjjgIJcbiAgICpcbiAgICogbmFtZSDvvIjlrZfnrKbkuLLvvIkg6L6T5YWl5qGG55qEIG5hbWVcbiAgICogbmctbW9kZWwg77yI5Y+M5ZCR77yM5Y+v6YCJ77yJIOe7keWumueahOWPmOmHj1xuICAgKiBzZWFyY2gtdGV4dCDvvIjlj4zlkJHvvIzlj6/pgInvvIzlrZfnrKbkuLLvvIkg6L6T5YWl55qE5paH5pysXG4gICAqIG9wdGlvbnMg77yI5Y2V5ZCR77yM5pWw57uE77yJIOaPj+i/sOWAmemAiemhueeahOaVsOe7hO+8jOaVsOe7hOmhueaYr+S4gOS4quWvueixoe+8jOWMheaLrOS7peS4i+mUruWAvFxuICAgKiAgICAgKiB0ZXh0IO+8iOWtl+espuS4su+8iSDmmL7npLrnmoTmlofmnKxcbiAgICogICAgICogcmVtYXJrIO+8iOWtl+espuS4su+8iSDmmL7npLrnmoTlpIfms6jmlofmnKxcbiAgICogICAgICogdmFsdWUg77yI5Lu75oSP57G75Z6L77yJIOmAieaLqeWvueW6lOmAiemhueaXtiBuZ01vZGVsIOe7keWumueahOWAvFxuICAgKiBpc0xvYWRpbmcg77yI5Y2V5ZCR77yM5biD5bCU5YC877yM5Y+v6YCJ77yJIOW9k+WJjeaYr+WQpuato+WcqOWKoOi9ve+8iOm7mOiupOS4umZhbHNl77yJXG4gICAqIGVtcHR5LXRleHQg77yI5a2X56ym5Liy77yJIOaXoOWAmemAiemhueaXtueahOaYvuekuuaWh+acrFxuICAgKiBsb2FkaW5nLXRleHQg77yI5a2X56ym5Liy77yJIOato+WcqOWKoOi9veeahOaYvuekuuaWh+acrFxuICAgKiBwbGFjZWhvbGRlciDvvIjlrZfnrKbkuLLvvIkg6L6T5YWl5qGG55qE6aKE6K6+5paH5pysXG4gICAqIHNob3ctaW5wdXQg77yI5a2X56ym5Liy77yJIOi+k+WFpeahhueahOaYvuekuuaWueW8j++8jOWPr+mAieaLqSBhbHdheXPvvIjpu5jorqTvvIkg5oiWIG5ldmVyXG4gICAqIHNob3ctb3B0aW9ucyDvvIjlrZfnrKbkuLLvvIkg5LiL5ouJ6I+c5Y2V55qE5pi+56S65pa55byP77yM5Y+v6YCJ5oupIGFsd2F5cyDjgIEgbmV2ZXIg5oiWIGFjdGl2Ze+8iOm7mOiupO+8iVxuICAgKiBvbi1zZWFyY2gg77yI5Zue6LCD77yJIOi+k+WFpeahhuaWh+acrOWPkeeUn+WPmOWMluaXtuinpuWPkVxuICAgKiBvbi1zdWJtaXQg77yI5Zue6LCD77yJIOS4i+aLieiPnOWNleaPkOS6pOS4gOS4quaWsOWAvOaXtuinpuWPkVxuICAgKiBvbi1jaGFuZ2Ug77yI5Zue6LCD77yJIOS4i+aLieiPnOWNleWAvOWPmOWMluaXtuinpuWPkVxuICAgKiByZXF1aXJlZCDvvIjluIPlsJTvvIkg5piv5ZCm6ZyA6KaB5Zyo5o+Q5Lqk6KGo5Y2V5pe26aqM6K+B5pys6aG555uu5b+F5aGrXG4gICAqIGZpbHRlLW9wdGlvbiDvvIjluIPlsJTvvIzlrZfnrKbkuLLvvIkg5piv5ZCm5Zyo6L6T5YWl5pe25qC55o2u6L6T5YWl5YaF5a656L+H5ruk5YCZ6YCJ6aG577yM57uZ5a6a5a2X56ym5LiyIHN0YXJ0IOWImeaMieWJjee8gOWMuemFje+8iOm7mOiupOWtkOS4suWMuemFje+8iVxuICAgKiBzdWJtaXQtb24tYmx1ciDvvIjlrZfnrKbkuLLvvIkg5piv5ZCm5aSx5Y6754Sm54K55pe26Ieq5Yqo5qC55o2u6L6T5YWl55qE5paH5pys6YCJ5oup5Yy56YWN55qE6YCJ6aG5XG4gICAqIGNsZWFyLW9uLXN1Ym1pdCDvvIjlrZfnrKbkuLLvvIkg5piv5ZCm5Zyo6YCJ5oup6YCJ6aG55ZCO5riF56m66L6T5YWl5qGGXG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZm9ybVNlYXJjaERyb3Bkb3duJywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICA8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ7eyAkY3RybC5uYW1lIH19XCIgbmctcmVxdWlyZWQ9XCIkY3RybC5yZXF1aXJlZFwiIG5nLW1vZGVsPVwiJGN0cmwubmdNb2RlbFwiIC8+XG4gICAgICA8c3BhbiBjbGFzcz1cImZvcm0tc2VhcmNoLWRyb3Bkb3duLWNvbnRhaW5lclwiIGlkPVwie3sgJGN0cmwuaWQgfX1cIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJmb3JtLXNlYXJjaC1pbnB1dC1jb250YWluZXIgZm9ybS1zZWFyY2gtaW5wdXQtc2hvdy17eyAkY3RybC5jdXJyZW50bHlTaG93SW5wdXQgfX1cIiBuZy1zaG93PVwiJGN0cmwuY3VycmVudGx5U2hvd0lucHV0XCI+XG4gICAgICAgICAgPGljb24tc2VhcmNoIGNsYXNzPVwiZm9ybS1zZWFyY2gtaW5wdXQtaWNvblwiPjwvaWNvbi1zZWFyY2g+XG4gICAgICAgICAgPGlucHV0IGNsYXNzPVwiZm9ybS1zZWFyY2gtaW5wdXRcIiB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwiJGN0cmwuc2VhcmNoVGV4dFwiIHBsYWNlaG9sZGVyPVwie3sgJGN0cmwucGxhY2Vob2xkZXIgfX1cIiBmb3JtPVwiX25vZm9ybVwiIC8+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJmb3JtLXNlYXJjaC1vcHRpb25zLWNvbnRhaW5lciBmb3JtLXNlYXJjaC1vcHRpb25zLXNob3cte3sgJGN0cmwuc2hvd09wdGlvbnMgfX1cIiBuZy1zaG93PVwiJGN0cmwuY3VycmVudGx5U2hvd09wdGlvbnNcIiB0YWItaW5kZXg9XCItMVwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9ybS1zZWFyY2gtb3B0aW9ucy13cmFwcGVyXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvcm0tc2VhcmNoLW9wdGlvbnMtaXRlbS1jb250YWluZXJcIiBuZy1yZXBlYXQ9XCJvcHRpb24gaW4gJGN0cmwuZmlsdGVyZWRPcHRpb25zIHRyYWNrIGJ5ICRpbmRleFwiIHRhYmluZGV4PVwiLTFcIiBuZy1zaG93PVwiJGN0cmwuaXNMb2FkaW5nICE9PSB0cnVlXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9ybS1zZWFyY2gtb3B0aW9ucy1pdGVtXCIgbmctY2xhc3M9XCJ7ICdmb3JtLXNlYXJjaC1vcHRpb25zLWl0ZW0tYWN0aXZlJzogJGluZGV4ID09PSAkY3RybC5jdXJyZW50SW5kZXggfVwiIG5nLWlmPVwib3B0aW9uLnZhbHVlXCIgbmctY2xpY2s9XCIkY3RybC5pdGVtT25DbGljayhvcHRpb24sICRpbmRleClcIiBuZy1tb3VzZWVudGVyPVwiJGN0cmwuaXRlbU9uTW91c2VlbnRlcihvcHRpb24sICRpbmRleClcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvcm0tc2VhcmNoLW9wdGlvbnMtaXRlbS10ZXh0XCIgbmctYmluZD1cIm9wdGlvbi50ZXh0XCI+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9ybS1zZWFyY2gtb3B0aW9ucy1pdGVtLXJlbWFya1wiIG5nLWJpbmQ9XCJvcHRpb24ucmVtYXJrXCIgbmctaWY9XCJvcHRpb24ucmVtYXJrXCI+PC9zcGFuPlxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9ybS1zZWFyY2gtb3B0aW9ucy1lbXB0eVwiIG5nLXNob3c9XCIkY3RybC5pc0xvYWRpbmcgIT09IHRydWUgJiYgJGN0cmwuZmlsdGVyZWRPcHRpb25zLmxlbmd0aCA9PT0gMFwiIG5nLWJpbmQ9XCIkY3RybC5lbXB0eVRleHQgfHwgJydcIj48L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb3JtLXNlYXJjaC1vcHRpb25zLWxvYWRpbmdcIiBuZy1zaG93PVwiJGN0cmwuaXNMb2FkaW5nID09PSB0cnVlXCIgbmctYmluZD1cIiRjdHJsLmxvYWRpbmdUZXh0IHx8ICcnXCI+PC9zcGFuPlxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L3NwYW4+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgbmFtZTogJ0AnLFxuICAgICAgbmdNb2RlbDogJz0/JyxcbiAgICAgIHNlYXJjaFRleHQ6ICc9PycsXG4gICAgICBvcHRpb25zOiAnPCcsXG4gICAgICBpc0xvYWRpbmc6ICc8PycsXG4gICAgICBlbXB0eVRleHQ6ICdAJyxcbiAgICAgIGxvYWRpbmdUZXh0OiAnQCcsXG4gICAgICBwbGFjZWhvbGRlcjogJ0AnLFxuICAgICAgc2hvd0lucHV0OiAnQCcsXG4gICAgICBzaG93T3B0aW9uczogJ0AnLFxuICAgICAgb25TZWFyY2g6ICcmJyxcbiAgICAgIG9uU3VibWl0OiAnJicsXG4gICAgICBvbkNoYW5nZTogJyYnLFxuICAgICAgcmVxdWlyZWQ6ICdAJyxcbiAgICAgIGZpbHRlT3B0aW9uOiAnQCcsXG4gICAgICBzdWJtaXRPbkJsdXI6ICdAJyxcbiAgICAgIGNsZWFyT25TdWJtaXQ6ICdAJyxcbiAgICAgIGJsdXJPblN1Ym1pdDogJ0AnLFxuICAgICAgcGFyZW50QWN0aXZlOiAnPT8nLFxuICAgIH0sXG4gICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGRvY3VtZW50JywgJyR0aW1lb3V0JywgZnVuY3Rpb24gKCRzY29wZSwgJGRvY3VtZW50LCBhbmd1bGFyVGltZW91dCkge1xuICAgICAgY29uc3QgJGN0cmwgPSB0aGlzO1xuICAgICAgY29uc3QgJHRpbWVvdXQgPSBzY29wZWRUaW1lb3V0KGFuZ3VsYXJUaW1lb3V0LCAkc2NvcGUpO1xuICAgICAgY29uc3QgY2xlYW51cCA9IGNsZWFuVXBDb2xsZWN0aW9ucygkc2NvcGUpO1xuXG4gICAgICAkY3RybC5zZWFyY2hUZXh0ID0gJyc7XG4gICAgICAkY3RybC5pZCA9IGdlblVuaXF1ZUlkKCk7XG5cbiAgICAgIC8vIOajgOafpeS6i+S7tuaYr+WQpuWcqOS4i+aLieahhuWGhVxuICAgICAgY29uc3QgZXZlbnRJbkNvbnRhaW5lciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBsZXQgdGFyZ2V0ID0gYW5ndWxhci5lbGVtZW50KGV2ZW50LnRhcmdldCk7XG4gICAgICAgIGxldCBjb250YWluZXIgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJGN0cmwuaWQpKTtcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lciAmJiBjb250YWluZXIuZmluZCh0YXJnZXQpLmxlbmd0aCA+IDA7XG4gICAgICB9O1xuXG4gICAgICAvLyDnu7TmiqTnm7jlhbPlhYPntKDnmoTlsZXnpLrkuI7pmpDol49cbiAgICAgIGxldCBhY3RpdmUgPSBmYWxzZTtcbiAgICAgIGNvbnN0IHVwZGF0ZVNob3dIaWRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkY3RybC5jdXJyZW50bHlTaG93SW5wdXQgPSB7XG4gICAgICAgICAgYWx3YXlzOiB0cnVlLFxuICAgICAgICAgIG5ldmVyOiBmYWxzZSxcbiAgICAgICAgfVskY3RybC5zaG93SW5wdXQgfHwgJ2Fsd2F5cyddO1xuICAgICAgICAkY3RybC5jdXJyZW50bHlTaG93T3B0aW9ucyA9IHtcbiAgICAgICAgICBhbHdheXM6IHRydWUsXG4gICAgICAgICAgbmV2ZXI6IGZhbHNlLFxuICAgICAgICAgIGFjdGl2ZTogYWN0aXZlIHx8ICRjdHJsLnBhcmVudEFjdGl2ZVxuICAgICAgICB9WyRjdHJsLnNob3dPcHRpb25zIHx8ICdhY3RpdmUnXTtcbiAgICAgIH07XG4gICAgICB1cGRhdGVTaG93SGlkZSgpO1xuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwuc2hvd0lucHV0JywgdXBkYXRlU2hvd0hpZGUpO1xuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwuc2hvd09wdGlvbnMnLCB1cGRhdGVTaG93SGlkZSk7XG5cbiAgICAgIC8vIOe7tOaKpOW9k+WJjea/gOa0u+eahOmAiemhuVxuICAgICAgJGN0cmwuY3VycmVudEluZGV4ID0gLTE7XG4gICAgICAkY3RybC5jdXJyZW50T3B0aW9uID0gbnVsbDtcbiAgICAgIGxldCBzZXRDdXJyZW50T3B0aW9uID0gZnVuY3Rpb24gKG9wdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgJGN0cmwuY3VycmVudE9wdGlvbiA9IG9wdGlvbjtcbiAgICAgICAgJGN0cmwuY3VycmVudEluZGV4ID0gaW5kZXg7XG4gICAgICB9O1xuICAgICAgbGV0IGlzVGV4dE1hdGNoQ3VycmVudE9wdGlvbiA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgIGlmICghJGN0cmwuY3VycmVudE9wdGlvbikgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdGV4dCA9PT0gJGN0cmwuY3VycmVudE9wdGlvbi50ZXh0O1xuICAgICAgfTtcbiAgICAgIGxldCBjbGVhckN1cnJlbnRPcHRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRjdHJsLmN1cnJlbnRPcHRpb24gPSBudWxsO1xuICAgICAgICAkY3RybC5jdXJyZW50SW5kZXggPSAtMTtcbiAgICAgIH07XG4gICAgICAvLyDnu7TmiqTlvZPliY3pgInmi6nnmoTpgInpoblcbiAgICAgICRjdHJsLmNob3NlZE9wdGlvbiA9IG51bGw7XG4gICAgICAkY3RybC5uZ01vZGVsID0gbnVsbDtcbiAgICAgIGxldCBzZXRDaG9zZWRPcHRpb24gPSBmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgICAgIGlmIChvcHRpb24gPT09IG51bGwpIHJldHVybiBjbGVhckNob3NlZE9wdGlvbigpO1xuICAgICAgICAkY3RybC5jaG9zZWRPcHRpb24gPSBvcHRpb247XG4gICAgICAgICRjdHJsLm5nTW9kZWwgPSBvcHRpb24udmFsdWU7XG4gICAgICAgICRjdHJsLnNlYXJjaFRleHQgPSBvcHRpb24udGV4dDtcbiAgICAgICAgc2V0Q3VycmVudE9wdGlvbihvcHRpb24sIC0xKTtcbiAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICRjdHJsLm9uQ2hhbmdlKHsgb3B0aW9uIH0pO1xuICAgICAgICAgICRjdHJsLm9uU3VibWl0KHsgb3B0aW9uIH0pO1xuICAgICAgICAgIGlmICgkY3RybC5jbGVhck9uU3VibWl0KSBjbGVhckNob3NlZE9wdGlvbigpO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH07XG4gICAgICBsZXQgY2xlYXJDaG9zZWRPcHRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRjdHJsLmNob3NlZE9wdGlvbiA9IG51bGw7XG4gICAgICAgICRjdHJsLm5nTW9kZWwgPSBudWxsO1xuICAgICAgICAkY3RybC5zZWFyY2hUZXh0ID0gJyc7XG4gICAgICAgICR0aW1lb3V0KCgpID0+ICRjdHJsLm9uQ2hhbmdlKHsgb3B0aW9uOiBudWxsIH0pLCAwKTtcbiAgICAgICAgY2xlYXJDdXJyZW50T3B0aW9uKCk7XG4gICAgICB9O1xuXG4gICAgICAvLyDkuIvmi4noj5zljZXooqvmv4DmtLtcbiAgICAgIGNvbnN0IGZvY3VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBhY3RpdmUgPSB0cnVlO1xuICAgICAgICB1cGRhdGVPcHRpb25zKCk7XG4gICAgICAgIHVwZGF0ZVNob3dIaWRlKCk7XG4gICAgICB9O1xuICAgICAgLy8g5LiL5ouJ6I+c5Y2V5aSx5Y6754Sm54K5XG4gICAgICBjb25zdCBibHVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoJGN0cmwuc3VibWl0T25CbHVyKSB7XG4gICAgICAgICAgLy8g5aaC5p6c5b2T5YmN55qE5paH5pys5LiN5Yy56YWN5r+A5rS755qE6aG555uu77yM6YKj5LmI5om+5LiA5om+5pyJ5rKh5pyJ5Lu75L2V5Yy56YWN55qE6aG555uu77yM5bm25r+A5rS7XG4gICAgICAgICAgaWYgKCFpc1RleHRNYXRjaEN1cnJlbnRPcHRpb24oJGN0cmwuc2VhcmNoVGV4dCkpIHtcbiAgICAgICAgICAgIHVwZGF0ZUN1cnJlbnRJbmRleCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaXNUZXh0TWF0Y2hDdXJyZW50T3B0aW9uKCRjdHJsLnNlYXJjaFRleHQpKSB7XG4gICAgICAgICAgICAvLyDlpoLmnpzljLnphY3kuobku7vkvZXpobnnm67vvIzliJnpgInmi6lcbiAgICAgICAgICAgIHNldENob3NlZE9wdGlvbigkY3RybC5jdXJyZW50T3B0aW9uKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCRjdHJsLnNlYXJjaFRleHQgPT09ICcnKSB7XG4gICAgICAgICAgICAvLyDlpoLmnpzovpPlhaXmoYbooqvmuIXnqbrvvIzpgqPkuYjmuIXnqbrpgInpoblcbiAgICAgICAgICAgIGNsZWFyQ2hvc2VkT3B0aW9uKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOWmguaenOadoeS7tumDveS4jea7oei2s++8jOWwhui+k+WFpeahhuiuvue9ruS4uuWQiOmAgueahOWAvFxuICAgICAgICAgICAgc2V0Q2hvc2VkT3B0aW9uKCRjdHJsLmNob3NlZE9wdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldENob3NlZE9wdGlvbigkY3RybC5jaG9zZWRPcHRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB1cGRhdGVTaG93SGlkZSgpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IG1ha2VNZUJsdXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmZvY3VzKCk7XG4gICAgICAgICAgYmx1cigpO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIOebkeWQrOeCueWHu+aIlueEpueCueeahOS6i+S7tu+8jOWkhOeQhuaYvuekuuWSjOmakOiXj1xuICAgICAgY29uc3QgZm9jdXNFdmVudEhhbmRsZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgbGV0IGNvbnRhaW5lZCA9IGV2ZW50SW5Db250YWluZXIoZXZlbnQpO1xuICAgICAgICBpZiAoY29udGFpbmVkICE9PSBhY3RpdmUpIHtcbiAgICAgICAgICBpZiAoY29udGFpbmVkKSBmb2N1cygpOyBlbHNlIGJsdXIoKTtcbiAgICAgICAgICAkdGltZW91dCgoKSA9PiB7fSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkZG9jdW1lbnQub24oJ2NsaWNrIGZvY3VzIGZvY3VzaW4nLCBmb2N1c0V2ZW50SGFuZGxlcik7XG4gICAgICBjbGVhbnVwKCgpID0+ICRkb2N1bWVudC5vZmYoJ2NsaWNrIGZvY3VzIGZvY3VzaW4nLCBmb2N1c0V2ZW50SGFuZGxlcikpO1xuXG4gICAgICAvLyDmn5DkuKrpgInpobnooqvngrnlh7tcbiAgICAgICRjdHJsLml0ZW1PbkNsaWNrID0gZnVuY3Rpb24gKG9wdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgc2V0Q2hvc2VkT3B0aW9uKG9wdGlvbik7XG4gICAgICAgIGlmICgkY3RybC5ibHVyT25TdWJtaXQpIG1ha2VNZUJsdXIoKTtcbiAgICAgIH07XG4gICAgICAkY3RybC5pdGVtT25Nb3VzZWVudGVyID0gZnVuY3Rpb24gKG9wdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgc2V0Q3VycmVudE9wdGlvbihvcHRpb24sIGluZGV4KTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHNldEN1cnJlbnRJbmRleCA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICBsZXQgb3B0aW9ucyA9ICRjdHJsLmZpbHRlcmVkT3B0aW9ucztcbiAgICAgICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICBpZiAoaW5kZXggPj0gb3B0aW9ucy5sZW5ndGgpIGluZGV4ID0gMDtcbiAgICAgICAgaWYgKGluZGV4IDwgMCkgaW5kZXggPSBvcHRpb25zLmxlbmd0aCAtIDE7XG4gICAgICAgIHNldEN1cnJlbnRPcHRpb24ob3B0aW9uc1tpbmRleF0sIGluZGV4KTtcbiAgICAgIH07XG4gICAgICBjb25zdCBrZXlib2FyZEFycm93RG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2V0Q3VycmVudEluZGV4KCRjdHJsLmN1cnJlbnRJbmRleCArIDEpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGtleWJvYXJkQXJyb3dVcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2V0Q3VycmVudEluZGV4KCRjdHJsLmN1cnJlbnRJbmRleCAtIDEpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGNob3NlQ3VycmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCEkY3RybC5jdXJyZW50T3B0aW9uKSByZXR1cm47XG4gICAgICAgIHNldENob3NlZE9wdGlvbigkY3RybC5jdXJyZW50T3B0aW9uKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBrZXlib2FyZEV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoIShhY3RpdmUgfHwgJGN0cmwucGFyZW50QWN0aXZlKSkgcmV0dXJuO1xuICAgICAgICBsZXQgYWN0aW9uID0ge1xuICAgICAgICAgIDQwOiBrZXlib2FyZEFycm93RG93bixcbiAgICAgICAgICAzODoga2V5Ym9hcmRBcnJvd1VwLFxuICAgICAgICAgIDEzOiAoKSA9PiB7XG4gICAgICAgICAgICBjaG9zZUN1cnJlbnQoKTtcbiAgICAgICAgICAgIGlmICgkY3RybC5ibHVyT25TdWJtaXQpIG1ha2VNZUJsdXIoKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIDI3OiBtYWtlTWVCbHVyXG4gICAgICAgIH1bZXZlbnQua2V5Q29kZV07XG4gICAgICAgIGlmIChhY3Rpb24pIHtcbiAgICAgICAgICBhY3Rpb24oKTtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAkdGltZW91dCh1cGRhdGVTY3JvbGwsIDApO1xuICAgICAgICAgICR0aW1lb3V0KHVwZGF0ZVNjcm9sbCwgMjUwKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRkb2N1bWVudC5vbigna2V5ZG93bicsIGtleWJvYXJkRXZlbnRIYW5kbGVyKTtcbiAgICAgIGNsZWFudXAoKCkgPT4gJGRvY3VtZW50Lm9uKCdrZXlkb3duJywga2V5Ym9hcmRFdmVudEhhbmRsZXIpKTtcblxuICAgICAgLy8g5qC55o2u5b2T5YmN55qE5pCc57Si5paH5pys5om+5Yiw5r+A5rS755qE6aG555uuXG4gICAgICAvLyDlpoLmnpzmib7liLDkuoblrozlhajljLnphY3nmoTpobnnm67vvIzliJnmv4DmtLvor6Xpobnnm65cbiAgICAgIC8vIOWmguaenOayoeacieaJvuWIsOS7u+S9leWMuemFjeeahOmhueebru+8jOmCo+S5iOa/gOa0u+aMh+WumueahOm7mOiupOS9jee9ruS9jee9rueahOmhueebrlxuICAgICAgLy8g6buY6K6k5L2N572u5Li6IC0xIOaXtu+8jOS4jea/gOa0u+S7u+S9lemhueebrlxuICAgICAgY29uc3QgdXBkYXRlQ3VycmVudEluZGV4ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBsZXQgb3B0aW9ucyA9ICRjdHJsLmZpbHRlcmVkT3B0aW9ucyB8fCBbXSwgdGV4dCA9ICRjdHJsLnNlYXJjaFRleHQ7XG4gICAgICAgIGlmIChpc1RleHRNYXRjaEN1cnJlbnRPcHRpb24odGV4dCkpIHJldHVybjtcbiAgICAgICAgbGV0IGZvdW5kID0gLTE7XG4gICAgICAgIG9wdGlvbnMuc29tZSgob3B0LCBpbmRleCkgPT4ge1xuICAgICAgICAgIGlmIChvcHQudGV4dCAhPT0gdGV4dCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIGZvdW5kID0gaW5kZXg7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZm91bmQgIT09IC0xKSB7XG4gICAgICAgICAgc2V0Q3VycmVudE9wdGlvbihvcHRpb25zW2ZvdW5kXSwgZm91bmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNsZWFyQ3VycmVudE9wdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyDop6blj5Egb25TZWFyY2gg5LqL5Lu25o+Q5LqkXG4gICAgICBsZXQgbGFzdFNlYXJjaFRleHQgPSBudWxsO1xuICAgICAgY29uc3QgdHJpZ2dlck9uU2VhcmNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBsZXQgdGV4dCA9ICRjdHJsLnNlYXJjaFRleHQ7XG4gICAgICAgIGxldCBkZWxheSA9ICRjdHJsLnNlYXJjaERlbGF5ID8gTnVtYmVyKCRjdHJsLnNlYXJjaERlbGF5KSA6IDIwMDtcbiAgICAgICAgaWYgKCFkZWxheSAmJiBkZWxheSAhPT0gMCB8fCBkZWxheSA8IDApIGRlbGF5ID0gMjAwO1xuICAgICAgICBpZiAodGV4dCA9PT0gbGFzdFNlYXJjaFRleHQpIHJldHVybjtcbiAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGlmICgkY3RybC5zZWFyY2hUZXh0ICE9PSB0ZXh0KSByZXR1cm47XG4gICAgICAgICAgJGN0cmwub25TZWFyY2goeyB0ZXh0OiAkY3RybC5zZWFyY2hUZXh0IH0pO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgICB9O1xuXG4gICAgICAvLyDmoLnmja7ovpPlhaXnmoTlhoXlrrnlkozmiYDmnInlgJnpgInpobnnrZvpgIlcbiAgICAgIGNvbnN0IHVwZGF0ZU9wdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRyaWdnZXJPblNlYXJjaCgpO1xuXG4gICAgICAgIGxldCBvcHRpb25zID0gJGN0cmwub3B0aW9ucyB8fCBbXTtcbiAgICAgICAgaWYgKCRjdHJsLmZpbHRlT3B0aW9uKSB7XG4gICAgICAgICAgbGV0IHRlc3RJbmRleE9mID0gJGN0cmwuZmlsdGVPcHRpb24gPT09ICdzdGFydCcgPyAoaSA9PiBpID09PSAwKSA6IChpID0+IGkgIT09IC0xKTtcbiAgICAgICAgICBvcHRpb25zID0gb3B0aW9ucy5maWx0ZXIob3B0ID0+IHRlc3RJbmRleE9mKChvcHQudGV4dCB8fCAnJykuaW5kZXhPZigkY3RybC5zZWFyY2hUZXh0KSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYW5ndWxhci5lcXVhbHMob3B0aW9ucywgJGN0cmwuZmlsdGVyZWRPcHRpb25zKSkge1xuICAgICAgICAgICRjdHJsLmZpbHRlcmVkT3B0aW9ucyA9IGFuZ3VsYXIuY29weShvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHVwZGF0ZUN1cnJlbnRJbmRleCgpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwuc2VhcmNoVGV4dCcsIHVwZGF0ZU9wdGlvbnMpO1xuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwub3B0aW9ucycsIHVwZGF0ZU9wdGlvbnMpO1xuXG4gICAgICAvLyDmjInkuIrkuIvplK7pgInmi6nlgJnpgInpobnml7bvvIzmu5rliqjmnaHopoHot5/nnYDmu5rliqjliLDmraPnoa7nmoTkvY3nva5cbiAgICAgIGNvbnN0IHVwZGF0ZVNjcm9sbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgkY3RybC5pZCkpO1xuICAgICAgICBsZXQgb3B0aW9uc0NvbnRhaW5lciA9IGFuZ3VsYXIuZWxlbWVudCgnLmZvcm0tc2VhcmNoLW9wdGlvbnMtd3JhcHBlcicsIGNvbnRhaW5lcik7XG4gICAgICAgIGxldCBhY3RpdmVPcHRpb24gPSBhbmd1bGFyLmVsZW1lbnQoJy5mb3JtLXNlYXJjaC1vcHRpb25zLWl0ZW0tYWN0aXZlJywgb3B0aW9uc0NvbnRhaW5lcikucGFyZW50KCk7XG4gICAgICAgIGlmIChhY3RpdmVPcHRpb24gJiYgYWN0aXZlT3B0aW9uWzBdKSB7XG4gICAgICAgICAgbGV0IHRvcCA9IGFjdGl2ZU9wdGlvblswXS5vZmZzZXRUb3AsIGJvdHRvbSA9IHRvcCArIGFjdGl2ZU9wdGlvbi5oZWlnaHQoKTtcbiAgICAgICAgICBsZXQgc2Nyb2xsVG9wID0gb3B0aW9uc0NvbnRhaW5lci5zY3JvbGxUb3AoKSwgc2Nyb2xsQm90dG9tID0gc2Nyb2xsVG9wICsgb3B0aW9uc0NvbnRhaW5lci5oZWlnaHQoKTtcbiAgICAgICAgICBsZXQgc2Nyb2xsVG8gPSBudWxsO1xuICAgICAgICAgIGlmICh0b3AgPCBzY3JvbGxUb3ApIHtcbiAgICAgICAgICAgIHNjcm9sbFRvID0gdG9wO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYm90dG9tID4gc2Nyb2xsQm90dG9tKSB7XG4gICAgICAgICAgICBzY3JvbGxUbyA9IGJvdHRvbSAtIG9wdGlvbnNDb250YWluZXIuaGVpZ2h0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzY3JvbGxUbyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgb3B0aW9uc0NvbnRhaW5lci5zdG9wKHRydWUsIHRydWUpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IHNjcm9sbFRvIH0sIDIwMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9wdGlvbnNDb250YWluZXIuc3RvcCh0cnVlLCB0cnVlKS5zY3JvbGxUb3AoMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIOW9k+WklumDqOiuvue9ruS4gOS4qiBuZ01vZGVsIOWAvOaXtu+8jOagueaNruWklumDqOeahOWAvOiuvue9rumAieaLqeahhlxuICAgICAgY29uc3QgaW5wdXQgPSBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIGxldCBvcHRpb25zID0gJGN0cmwub3B0aW9ucztcbiAgICAgICAgbGV0IG1hdGNoZWRPcHRpb24gPSBudWxsO1xuICAgICAgICAvLyDlpoLmnpzorr7nva7kuLrnqbrvvIzpgqPkuYjmuIXnqbrkuIvmi4nmoYZcbiAgICAgICAgaWYgKCRjdHJsLm5nTW9kZWwgPT0gbnVsbCkge1xuICAgICAgICAgIGlmICgkY3RybC5uZ01vZGVsICE9PSBudWxsKSAkY3RybC5uZ01vZGVsID0gbnVsbDtcbiAgICAgICAgICBpZiAoJGN0cmwuY2hvc2VkT3B0aW9uKSB7XG4gICAgICAgICAgICAkY3RybC5vbkNoYW5nZSh7IG9wdGlvbjogbnVsbCB9KTtcbiAgICAgICAgICAgIGNsZWFyQ2hvc2VkT3B0aW9uKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIOWmguaenOiuvue9ruS4jeepuu+8jOmCo+S5iOafpeaJvuWvueW6lOeahOiuvue9rumhuVxuICAgICAgICBpZiAoJGN0cmwubmdNb2RlbCA9PT0gJGN0cmwuY2hvc2VkT3B0aW9uKSB7XG4gICAgICAgICAgbWF0Y2hlZE9wdGlvbiA9ICRjdHJsLmNob3NlZE9wdGlvbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvcHRpb25zLnNvbWUob3B0ID0+IHtcbiAgICAgICAgICAgIGlmIChvcHQudmFsdWUgPT09ICRjdHJsLm5nTW9kZWwpIHtcbiAgICAgICAgICAgICAgbWF0Y2hlZE9wdGlvbiA9IG9wdDtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hdGNoZWRPcHRpb24pIHtcbiAgICAgICAgICAvLyDlpoLmnpzorr7nva7nmoTlgLzlkIjms5XvvIzpgqPkuYjkv67mlLnkuLrov5nkuKrlgLzlubbpgJLkuqTnm7jlupTnmoTkv67mlLnlkozpgJLkuqTkuovku7ZcbiAgICAgICAgICAkY3RybC5zZWFyY2hUZXh0ID0gbWF0Y2hlZE9wdGlvbi50ZXh0O1xuICAgICAgICAgICRjdHJsLm9uQ2hhbmdlKHsgb3B0aW9uOiBtYXRjaGVkT3B0aW9uIH0pO1xuICAgICAgICAgICRjdHJsLm9uU3VibWl0KHsgb3B0aW9uOiBtYXRjaGVkT3B0aW9uIH0pO1xuICAgICAgICAgIGlmICgkY3RybC5jbGVhck9uU3VibWl0KSBjbGVhckNob3NlZE9wdGlvbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIOWmguaenOiuvue9rumhueS4jeWQiOazle+8jOmCo+S5iOWbnumAgOWIsOS4iuasoemAieaLqeeahOmAiemhueWOu1xuICAgICAgICAgIGlmICgkY3RybC5jaG9zZWRPcHRpb24pICRjdHJsLm5nTW9kZWwgPSAkY3RybC5jaG9zZWRPcHRpb24udmFsdWU7XG4gICAgICAgICAgZWxzZSAkY3RybC5uZ01vZGVsID0gbnVsbDtcbiAgICAgICAgICAkY3RybC5vbkNoYW5nZSh7IG9wdGlvbjogJGN0cmwuY2hvc2VkT3B0aW9uIH0pO1xuICAgICAgICAgIGlmICgkY3RybC5jaG9zZWRPcHRpb24pIHtcbiAgICAgICAgICAgICRjdHJsLm9uU3VibWl0KHtvcHRpb246ICRjdHJsLmNob3NlZE9wdGlvbiB9KTtcbiAgICAgICAgICAgIGlmICgkY3RybC5jbGVhck9uU3VibWl0KSBjbGVhckNob3NlZE9wdGlvbigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS4kd2F0Y2goJyRjdHJsLm5nTW9kZWwnLCBpbnB1dCk7XG5cbiAgICB9XVxuICB9KTtcblxuICAvKlxuICAgKiA8Zm9ybS1zZWxlY3Q+IOihqOekuuS4gOS4quS4i+aLiemAieaLqeahhlxuICAgKiBuYW1lIO+8iOWtl+espuS4su+8iSDovpPlhaXmoYbnmoQgbmFtZVxuICAgKiBuZ01vZGVsIO+8iOWPjOWQke+8iSDnu5HlrprnmoTlj5jph49cbiAgICogb3B0aW9ucyDvvIjljZXlkJHvvIkg5YCZ6YCJ6aG577yM5qC85byP5Y+C6ICDIGZvcm0tc2VhcmNoLWRyb3Bkb3duXG4gICAqIHBsYWNlaG9sZGVyIO+8iOWtl+espuS4su+8iSDmnKrpgInmi6nku7vkvZXlhoXlrrnml7bmmL7npLrnmoTmlofmnKxcbiAgICogb25DaGFuZ2Ug77yI5Zue6LCD77yJIOWAvOWPmOWMluaXtueahOWbnuiwg+WHveaVsFxuICAgKiByZXF1aXJlZCDvvIjluIPlsJTvvIkg5piv5ZCm5Li65b+F5aGr6aG5XG4gICAqIGVtcHR5VGV4dCDvvIjmlofmnKzvvIkg5YCZ6YCJ6aG55Li656m65pe25pi+56S655qE5paH5a2XXG4gICAqIHNob3dTZWFyY2hJbnB1dCDvvIjluIPlsJTvvIkg5piv5ZCm5Zyo5LiL5ouJ6I+c5Y2V5Lit5pi+56S65pCc57Si55So6L6T5YWl5qGG77yM5Y+v5Lul5YaZIG5ldmVyIOaIliBhbHdheXNcbiAgICogaXNMb2FkaW5nIO+8iOW4g+WwlO+8jOWPr+mAie+8iSDooajnpLrmmK/lkKbmraPlnKjliqDovb1cbiAgICogbG9hZGluZ1RleHQg77yI5paH5pys77yM5Y+v6YCJ77yJIOato+WcqOWKoOi9veaXtuaYvuekuueahOaWh+acrFxuICAgKi9cbiAgZm9ybUlucHV0cy5jb21wb25lbnQoJ2Zvcm1TZWxlY3QnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgIDxzcGFuIGlkPVwie3sgJGN0cmwuaWQgfX1cIiBjbGFzcz1cImZvcm0tc2VsZWN0LWNvbnRhaW5lclwiPlxuICAgICAgICA8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ7eyAkY3RybC5uYW1lIH19XCIgbmctcmVxdWlyZWQ9XCIkY3RybC5yZXF1aXJlZFwiIHZhbHVlPVwiJGN0cmwubmdNb2RlbFwiIC8+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiZm9ybS1zZWxlY3Qtd3JhcHBlclwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9ybS1zZWxlY3QtZmFrZS1pbnB1dFwiIHRhYmluZGV4PVwiMFwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb3JtLXNlbGVjdC1mYWtlLWlucHV0LXZhbHVlXCIgbmctc2hvdz1cIiRjdHJsLm5nTW9kZWxcIiBuZy1iaW5kPVwiJGN0cmwudGV4dFwiPjwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9ybS1zZWxlY3QtZmFrZS1pbnB1dC1wbGFjZWhvbGRlclwiIG5nLXNob3c9XCIhJGN0cmwubmdNb2RlbFwiIG5nLWJpbmQ9XCIkY3RybC5wbGFjZWhvbGRlclwiPjwvc3Bhbj5cbiAgICAgICAgICAgIDxpY29uLWRyb3AtZG93biBjbGFzcz1cImZvcm0tc2VsZWN0LWRvd24taWNvblwiPjwvaWNvbi1kcm9wLWRvd24+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxmb3JtLXNlYXJjaC1kcm9wZG93blxuICAgICAgICAgIGNsYXNzPVwiZm9ybS1zZWxlY3QtZHJvcGRvd25cIlxuICAgICAgICAgIG5nLW1vZGVsPVwiJGN0cmwudmFsdWVcIlxuICAgICAgICAgIG5nLWNsYXNzPVwieyAnZm9ybS1zZWxlY3QtZHJvcGRvd24td2l0aC1zZWFyY2gnOiAkY3RybC5zaG93U2VhcmNoSW5wdXQgIT09ICduZXZlcicgfVwiXG4gICAgICAgICAgbmctc2hvdz1cIiRjdHJsLmFjdGl2ZVwiXG4gICAgICAgICAgb3B0aW9ucz1cIiRjdHJsLm9wdGlvbnNcIlxuICAgICAgICAgIG9uLXN1Ym1pdD1cIiRjdHJsLm9uVmFsdWVDaGFuZ2Uob3B0aW9uKVwiXG4gICAgICAgICAgZW1wdHktdGV4dD1cInt7ICRjdHJsLmVtcHR5VGV4dCB8fCAnJyB9fVwiXG4gICAgICAgICAgc2hvdy1pbnB1dD1cInt7ICRjdHJsLnNob3dTZWFyY2hJbnB1dCB8fCAnYWx3YXlzJyB9fVwiXG4gICAgICAgICAgc2hvdy1vcHRpb25zPVwiYWx3YXlzXCJcbiAgICAgICAgICBmaWx0ZS1vcHRpb249XCJ7eyAkY3RybC5zaG93U2VhcmNoSW5wdXQgIT09ICduZXZlcicgPyAnZmlsdGUtb3B0aW9uJyA6ICcnIH19XCJcbiAgICAgICAgICBjbGVhci1vbi1zdWJtaXQ9XCJjbGVhci1vbi1zdWJtaXRcIlxuICAgICAgICAgIGlucHV0LWluLWRyb3Bkb3duPVwiaW5wdXQtaW4tZHJvcGRvd25cIlxuICAgICAgICAgIHBhcmVudC1hY3RpdmU9XCIkY3RybC5hY3RpdmVcIlxuICAgICAgICAgIGJsdXItb24tc3VibWl0PVwiYmx1ci1vbi1zdWJtaXRcIlxuICAgICAgICAgIGlzLWxvYWRpbmc9XCIkY3RybC5pc0xvYWRpbmdcIlxuICAgICAgICAgIGxvYWRpbmctdGV4dD1cInt7ICRjdHJsLmxvYWRpbmdUZXh0IHx8ICcnIH19XCJcbiAgICAgICAgPjwvZm9ybS1zZWFyY2gtZHJvcGRvd24+XG4gICAgICA8L3NwYW4+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgbmFtZTogJ0AnLFxuICAgICAgbmdNb2RlbDogJz0nLFxuICAgICAgb3B0aW9uczogJzwnLFxuICAgICAgcGxhY2Vob2xkZXI6ICdAJyxcbiAgICAgIG9uQ2hhbmdlOiAnJicsXG4gICAgICByZXF1aXJlZDogJ0AnLFxuICAgICAgZW1wdHlUZXh0OiAnQCcsXG4gICAgICBzaG93U2VhcmNoSW5wdXQ6ICdAJyxcbiAgICAgIGlzTG9hZGluZzogJzwnLFxuICAgICAgbG9hZGluZ1RleHQ6ICdAJyxcbiAgICB9LFxuICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJyRkb2N1bWVudCcsIGZ1bmN0aW9uICgkc2NvcGUsIGFuZ3VsYXJUaW1lb3V0LCAkZG9jdW1lbnQpIHtcbiAgICAgIGNvbnN0ICRjdHJsID0gdGhpcztcbiAgICAgIGNvbnN0ICR0aW1lb3V0ID0gc2NvcGVkVGltZW91dChhbmd1bGFyVGltZW91dCwgJHNjb3BlKTtcbiAgICAgIGNvbnN0IGNsZWFudXAgPSBjbGVhblVwQ29sbGVjdGlvbnMoJHNjb3BlKTtcblxuICAgICAgJGN0cmwuYWN0aXZlID0gZmFsc2U7XG4gICAgICAkY3RybC5pZCA9IGdlblVuaXF1ZUlkKCk7XG4gICAgICAkY3RybC5uZ01vZGVsID0gbnVsbDtcbiAgICAgICRjdHJsLnZhbHVlID0gbnVsbDtcblxuICAgICAgY29uc3QgZXZlbnRJbkNvbnRhaW5lciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBsZXQgdGFyZ2V0ID0gYW5ndWxhci5lbGVtZW50KGV2ZW50LnRhcmdldCk7XG4gICAgICAgIGxldCBjb250YWluZXIgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJGN0cmwuaWQpKTtcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lciAmJiBjb250YWluZXIuZmluZCh0YXJnZXQpLmxlbmd0aCA+IDA7XG4gICAgICB9O1xuICAgICAgY29uc3QgZm9jdXNFdmVudEhhbmRsZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgJGN0cmwuYWN0aXZlID0gZXZlbnRJbkNvbnRhaW5lcihldmVudCk7XG4gICAgICAgICR0aW1lb3V0KCgpID0+IHt9KTtcbiAgICAgIH07XG4gICAgICAkZG9jdW1lbnQub24oJ2NsaWNrIGZvY3VzIGZvY3VzaW4nLCBmb2N1c0V2ZW50SGFuZGxlcik7XG4gICAgICBjbGVhbnVwKCgpID0+ICRkb2N1bWVudC5vbignY2xpY2sgZm9jdXMgZm9jdXNpbicsIGZvY3VzRXZlbnRIYW5kbGVyKSk7XG5cbiAgICAgICRjdHJsLm9uVmFsdWVDaGFuZ2UgPSBmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgICAgIGlmIChvcHRpb24pIHtcbiAgICAgICAgICAkY3RybC50ZXh0ID0gb3B0aW9uLnRleHQ7XG4gICAgICAgICAgJGN0cmwubmdNb2RlbCA9IG9wdGlvbi52YWx1ZTtcbiAgICAgICAgICAkdGltZW91dCgoKSA9PiAkY3RybC5vbkNoYW5nZSh7IG9wdGlvbiB9KSwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgJHRpbWVvdXQoKCkgPT4gJGN0cmwuYWN0aXZlID0gZmFsc2UsIDApO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwubmdNb2RlbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJGN0cmwudmFsdWUgPSAkY3RybC5uZ01vZGVsO1xuICAgICAgfSk7XG4gICAgfV1cbiAgfSk7XG5cbiAgLypcbiAgICogPGZvcm0tbXVsdGlwbGUtc2VsZWN0PlxuICAgKi9cbiAgZm9ybUlucHV0cy5jb21wb25lbnQoJ2Zvcm1NdWx0aXBsZVNlbGVjdCcsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPHNwYW4gaWQ9XCJ7eyAkY3RybC5pZCB9fVwiIGNsYXNzPVwiZm9ybS1zZWxlY3QtY29udGFpbmVyIGZvcm0tbXVsdGlwbGUtc2VsZWN0LWNvbnRhaW5lclwiPlxuICAgICAgICA8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ7eyAkY3RybC5uYW1lIH19XCIgbmctcmVxdWlyZWQ9XCIkY3RybC5yZXF1aXJlZFwiXG4gICAgICAgICAgdmFsdWU9XCIkY3RybC5uZ01vZGVsLmpvaW4oJzsgJylcIiBtYXhsZW5ndGg9XCJcIiAvPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImZvcm0tc2VsZWN0LXdyYXBwZXJcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvcm0tc2VsZWN0LWZha2UtaW5wdXRcIj5cbiAgICAgICAgICAgIDx1bCBjbGFzcz1cImZvcm0tc2VsZWN0LWl0ZW0tY29sbGVjdGlvblwiPlxuICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJmb3JtLXNlbGVjdC1jaG9zZWQtaXRlbVwiIG5nLXJlcGVhdD1cIml0ZW0gaW4gJGN0cmwuY2hvc2VkXCIgbmctY2xhc3M9XCJ7ICdmb3JtLXNlbGVjdC1jaG9zZWQtYWJvdXQtdG8tZGVsZXRlJzogJGluZGV4ID09PSAkY3RybC5hYm91dFRvRGVsZXRlIH1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvcm0tc2VsZWN0LWNob3NlZC1pdGVtLXRleHRcIiBuZy1iaW5kPVwiaXRlbS50ZXh0XCI+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxpY29uIHR5cGU9XCJjbG9zZVwiIGNsYXNzPVwiZm9ybS1zZWxlY3QtY2hvc2VkLWl0ZW0tZGVsZXRlXCIgbmctY2xpY2s9XCIkY3RybC5kZWxldGVDaG9zZWRJdGVtKGl0ZW0pXCI+XG4gICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgIDxsaSBjbGFzcz1cImZvcm0tc2VsZWN0LWlucHV0LWl0ZW1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvcm0tc2VsZWN0LWlucHV0LXRleHRcIiBuZy1iaW5kPVwiJGN0cmwuc2VhcmNoVGV4dCB8fCAkY3RybC5wbGFjZWhvbGRlclwiIHx8ICcnPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tc2VsZWN0LWlucHV0XCIgcGxhY2Vob2xkZXI9XCJ7eyAkY3RybC5wbGFjZWhvbGRlciB9fVwiIG5nLW1vZGVsPVwiJGN0cmwuc2VhcmNoVGV4dFwiIG5nLXRyaW09XCJmYWxzZVwiIGZvcm09XCJfbm9mb3JtXCIgLz5cbiAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxmb3JtLXNlYXJjaC1kcm9wZG93blxuICAgICAgICAgIGNsYXNzPVwiZm9ybS1zZWxlY3QtZHJvcGRvd25cIlxuICAgICAgICAgIG5nLW1vZGVsPVwiJGN0cmwudmFsdWVcIlxuICAgICAgICAgIG5nLXNob3c9XCIkY3RybC5hY3RpdmVcIlxuICAgICAgICAgIHNlYXJjaC10ZXh0PVwiJGN0cmwuc2VhcmNoVGV4dFwiXG4gICAgICAgICAgb3B0aW9ucz1cIiRjdHJsLm9wdGlvbnNcIlxuICAgICAgICAgIG9uLXN1Ym1pdD1cIiRjdHJsLm9uVmFsdWVDaGFuZ2Uob3B0aW9uKVwiXG4gICAgICAgICAgZW1wdHktdGV4dD1cInt7ICRjdHJsLmVtcHR5VGV4dCB8fCAnJyB9fVwiXG4gICAgICAgICAgc2hvdy1pbnB1dD1cIm5ldmVyXCJcbiAgICAgICAgICBzaG93LW9wdGlvbnM9XCJhbHdheXNcIlxuICAgICAgICAgIGZpbHRlLW9wdGlvbj1cImZpbHRlLW9wdGlvblwiXG4gICAgICAgICAgY2xlYXItb24tc3VibWl0PVwiY2xlYXItb24tc3VibWl0XCJcbiAgICAgICAgICBwYXJlbnQtYWN0aXZlPVwiJGN0cmwuYWN0aXZlXCJcbiAgICAgICAgICBpcy1sb2FkaW5nPVwiJGN0cmwuaXNMb2FkaW5nIHx8IGZhbHNlXCJcbiAgICAgICAgICBsb2FkaW5nLXRleHQ9XCJ7eyAkY3RybC5sb2FkaW5nVGV4dCB8fCAnJyB9fVwiXG4gICAgICAgID48L2Zvcm0tc2VhcmNoLWRyb3Bkb3duPlxuICAgICAgPC9zcGFuPlxuICAgIGAsXG4gICAgYmluZGluZ3M6IHtcbiAgICAgIG5hbWU6ICdAJyxcbiAgICAgIG5nTW9kZWw6ICc9JyxcbiAgICAgIG9wdGlvbnM6ICc8JyxcbiAgICAgIHBsYWNlaG9sZGVyOiAnQCcsXG4gICAgICBvbkNoYW5nZTogJyYnLFxuICAgICAgZW1wdHlUZXh0OiAnQCcsXG4gICAgICBtaW5MZW5ndGg6ICdAJyxcbiAgICAgIG1heExlbmd0aDogJ0AnLFxuICAgICAgaXNMb2FkaW5nOiAnPD8nLFxuICAgICAgbG9hZGluZ1RleHQ6ICdAJyxcbiAgICB9LFxuICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJyRkb2N1bWVudCcsIGZ1bmN0aW9uICgkc2NvcGUsIGFuZ3VsYXJUaW1lb3V0LCAkZG9jdW1lbnQpIHtcbiAgICAgIGNvbnN0ICRjdHJsID0gdGhpcztcbiAgICAgIGNvbnN0ICR0aW1lb3V0ID0gc2NvcGVkVGltZW91dChhbmd1bGFyVGltZW91dCwgJHNjb3BlKTtcbiAgICAgIGNvbnN0IGNsZWFudXAgPSBjbGVhblVwQ29sbGVjdGlvbnMoJHNjb3BlKTtcblxuICAgICAgJGN0cmwuYWN0aXZlID0gZmFsc2U7XG4gICAgICAkY3RybC5pZCA9IGdlblVuaXF1ZUlkKCk7XG4gICAgICAkY3RybC5uZ01vZGVsID0gbnVsbDtcbiAgICAgICRjdHJsLnZhbHVlID0gbnVsbDtcbiAgICAgICRjdHJsLnNlYXJjaFRleHQgPSAnJztcbiAgICAgICRjdHJsLmNob3NlZCA9IFtdO1xuXG4gICAgICAvLyDmo4Dmn6XlvZPliY3mmK/lkKblupTlvZPigJzmv4DmtLvigJ1cbiAgICAgIC8vIOKAnOa/gOa0u+KAneaXtuaYvuekuuS4i+aLieWAmemAiemAiemhuVxuICAgICAgY29uc3QgZXZlbnRJbkNvbnRhaW5lciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBsZXQgdGFyZ2V0ID0gYW5ndWxhci5lbGVtZW50KGV2ZW50LnRhcmdldCk7XG4gICAgICAgIGxldCBjb250YWluZXIgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJGN0cmwuaWQpKTtcbiAgICAgICAgbGV0IGNvbnRhaW5lZCA9IGNvbnRhaW5lciAmJiBjb250YWluZXIuZmluZCh0YXJnZXQpLmxlbmd0aCA+IDA7XG4gICAgICAgIHJldHVybiBjb250YWluZWQ7XG4gICAgICB9O1xuICAgICAgY29uc3QgZm9jdXNPbklucHV0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBsZXQgY29udGFpbmVyID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCRjdHJsLmlkKSk7XG4gICAgICAgIGxldCBpbnB1dCA9IGFuZ3VsYXIuZWxlbWVudCgnLmZvcm0tc2VsZWN0LWlucHV0JywgY29udGFpbmVyKVswXTtcbiAgICAgICAgaWYgKGlucHV0ICYmIGlucHV0ICE9PSBkb2N1bWVudC5hY3RpdmVFbGVtZW50KSBpbnB1dC5mb2N1cygpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGZvY3VzRXZlbnRIYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICRjdHJsLmFjdGl2ZSA9IGV2ZW50SW5Db250YWluZXIoZXZlbnQpO1xuICAgICAgICBpZiAoJGN0cmwuYWN0aXZlKSBmb2N1c09uSW5wdXQoKTtcbiAgICAgICAgJHRpbWVvdXQoKCkgPT4ge30pO1xuICAgICAgfTtcbiAgICAgICRkb2N1bWVudC5vbignY2xpY2sgZm9jdXMgZm9jdXNpbicsIGZvY3VzRXZlbnRIYW5kbGVyKTtcbiAgICAgIGNsZWFudXAoKCkgPT4gJGRvY3VtZW50Lm9mZignY2xpY2sgZm9jdXMgZm9jdXNpbicsIGZvY3VzRXZlbnRIYW5kbGVyKSk7XG5cbiAgICAgIC8vIOWkhOeQhuaWsOWinumAieS4remhueeahOaDheWGtVxuICAgICAgJGN0cmwub25WYWx1ZUNoYW5nZSA9IGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICAgICAgaWYgKCFhbmd1bGFyLmlzQXJyYXkoJGN0cmwuY2hvc2VkKSkgJGN0cmwuY2hvc2VkID0gW107XG4gICAgICAgIGxldCBjb2xsZWN0aW9ucyA9ICRjdHJsLmNob3NlZDtcbiAgICAgICAgbGV0IGZpbmQgPSBudWxsO1xuICAgICAgICBjb2xsZWN0aW9ucy5zb21lKChvLCBpKSA9PiB7XG4gICAgICAgICAgaWYgKCFhbmd1bGFyLmVxdWFscyhvLCBvcHRpb24pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgZmluZCA9IGk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZmluZCAhPT0gY29sbGVjdGlvbnMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIGlmIChmaW5kICE9PSBudWxsKSAkY3RybC5jaG9zZWQuc3BsaWNlKGZpbmQsIDEpO1xuICAgICAgICAgICRjdHJsLmNob3NlZC5wdXNoKG9wdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgJHRpbWVvdXQoZm9jdXNPbklucHV0LCAwKTtcbiAgICAgICAgb3V0cHV0KCk7XG4gICAgICB9O1xuICAgICAgLy8g5aSE55CG5Yig6Zmk6YCJ5Lit6aG5XG4gICAgICAkY3RybC5kZWxldGVDaG9zZWRJdGVtID0gZnVuY3Rpb24gKG9wdGlvbikge1xuICAgICAgICBsZXQgaW5kZXggPSAkY3RybC5jaG9zZWQuaW5kZXhPZihvcHRpb24pO1xuICAgICAgICAkY3RybC5jaG9zZWQuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgJHRpbWVvdXQoZm9jdXNPbklucHV0LCAwKTtcbiAgICAgICAgb3V0cHV0KCk7XG4gICAgICB9O1xuXG4gICAgICAvLyDmjInpgIDmoLzplK7lj6/ku6XliKDpmaTkuIDkuKrlt7LpgInpoblcbiAgICAgICRjdHJsLmFib3V0VG9EZWxldGUgPSBudWxsO1xuICAgICAgLy8g5qOA5p+l5piv5ZCm5b2T5YmN4oCc6YCJ5Lit4oCd5LqG5p+Q6aG5XG4gICAgICBjb25zdCBpc0Fib3V0VG9EZWxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkY3RybC5hYm91dFRvRGVsZXRlICE9PSBudWxsO1xuICAgICAgfTtcbiAgICAgIC8vIOehruiupOW5tuWIoOmZpOW9k+WJjeKAnOmAieS4reKAneWFg+e0oFxuICAgICAgY29uc3QgZGVsZXRlQ3VycmVudEl0ZW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxldCB2YWxpZCA9IHRydWU7XG4gICAgICAgIGlmICghJGN0cmwuY2hvc2VkIHx8ICEkY3RybC5jaG9zZWQubGVuZ3RoKSB2YWxpZCA9IGZhbHNlO1xuICAgICAgICBpZiAoJGN0cmwuYWJvdXRUb0RlbGV0ZSA9PT0gbnVsbCkgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKCRjdHJsLmFib3V0VG9EZWxldGUgPCAwIHx8ICRjdHJsLmFib3V0VG9EZWxldGUgPj0gJGN0cmwuY2hvc2VkLmxlbmd0aCkgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHZhbGlkKSB7XG4gICAgICAgICAgJGN0cmwuZGVsZXRlQ2hvc2VkSXRlbSgkY3RybC5jaG9zZWRbJGN0cmwuYWJvdXRUb0RlbGV0ZV0pO1xuICAgICAgICB9XG4gICAgICAgICRjdHJsLmFib3V0VG9EZWxldGUgPSBudWxsO1xuICAgICAgICByZXR1cm4gdmFsaWQ7XG4gICAgICB9O1xuICAgICAgLy8g5aaC5p6c5b2T5YmN5pyJ5YWD57Sg6KKr6YCJ5Lit77yM5oyJ6YCA5qC86ZSu5Lya5Yig6Zmk6K+l5YWD57SgXG4gICAgICAvLyDlkKbliJnvvJvlpoLmnpzlnKjovpPlhaXmoYblvIDlpLTmjInpgIDmoLzplK7vvIzpgqPkuYjmnIDlkI7kuIDkuKrlhYPntKDooqvigJzpgInkuK3igJ1cbiAgICAgIGNvbnN0IHRhcmdldGVkQmFja3NwYWNlUHJlc3NlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGRlbGV0ZUN1cnJlbnRJdGVtKCkpIHJldHVybjtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgJGN0cmwuYWJvdXRUb0RlbGV0ZSA9ICRjdHJsLmNob3NlZC5sZW5ndGggLSAxO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgLy8g6L6T5YWl5qGG5Li656m65pe25oyJ5pa55ZCR6ZSu77yM5oiW5b2T5YmN5pyJ5YWD57Sg6KKr6YCJ5Lit5pe25oyJ5pa55ZCR6ZSuXG4gICAgICAvLyDmoLnmja7lt6blj7PlkJHliY0v5ZCO56e75Yqo4oCc6YCJ5Lit4oCd55qE5YWJ5qCHXG4gICAgICAvLyDlpoLmnpzmg7PlkI7np7vliqjliLDmnIDlkI7vvIzliJnlj5bmtojigJzpgInkuK3igJ1cbiAgICAgIGNvbnN0IHRhcmdldGVkSG9yaXpvbnRhbEFycm93UHJlc3NlZCA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIGxldCB0YXJnZXQgPSAkY3RybC5hYm91dFRvRGVsZXRlO1xuICAgICAgICBpZiAodGFyZ2V0ID09PSBudWxsKSB0YXJnZXQgPSAkY3RybC5jaG9zZWQubGVuZ3RoO1xuICAgICAgICB0YXJnZXQgKz0gZDtcbiAgICAgICAgaWYgKHRhcmdldCA+PSAkY3RybC5jaG9zZWQubGVuZ3RoKSAkY3RybC5hYm91dFRvRGVsZXRlID0gbnVsbDtcbiAgICAgICAgJGN0cmwuYWJvdXRUb0RlbGV0ZSA9IHRhcmdldDtcbiAgICAgIH07XG4gICAgICAvLyDop6blj5Hku7vkvZXlhbbku5bkuovku7bml7bvvIzlj5bmtojigJzpgInkuK3igJ1cbiAgICAgIGNvbnN0IG90aGVyRXZlbnRUcmlnZ2VyZWQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAkY3RybC5hYm91dFRvRGVsZXRlID0gbnVsbDtcbiAgICAgIH07XG4gICAgICAvLyDmo4Dmn6XlvZPliY3kuovku7bmmK/lkKbmmK/lnKjovpPlhaXmoYbkuIrnmoQga2V5ZG93blxuICAgICAgY29uc3QgaXNJbnB1dFRhcmdldGVkS2V5cHJlc3MgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZS50eXBlICE9PSAna2V5ZG93bicpIHJldHVybiBmYWxzZTtcbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgkY3RybC5pZCkpO1xuICAgICAgICBsZXQgaW5wdXQgPSBhbmd1bGFyLmVsZW1lbnQoJy5mb3JtLXNlbGVjdC1pbnB1dCcsIGNvbnRhaW5lcilbMF07XG4gICAgICAgIGlmIChlLnRhcmdldCAhPT0gaW5wdXQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgICAgLy8g5qOA5p+l5b2T5YmN5YWJ5qCH5piv5ZCm5Zyo6L6T5YWl5qGG5byA5aS0XG4gICAgICBjb25zdCBjdXJzb3JBdElucHV0QmVnaW5pbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxldCBjb250YWluZXIgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJGN0cmwuaWQpKTtcbiAgICAgICAgbGV0IGlucHV0ID0gYW5ndWxhci5lbGVtZW50KCcuZm9ybS1zZWxlY3QtaW5wdXQnLCBjb250YWluZXIpWzBdO1xuICAgICAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gaW5wdXQpIHJldHVybiBmYWxzZTtcblxuICAgICAgICBsZXQgY3Vyc29yUG9zaXRpb24gPSBudWxsO1xuICAgICAgICAvLyBzdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjg5NzE1NS9nZXQtY3Vyc29yLXBvc2l0aW9uLWluLWNoYXJhY3RlcnMtd2l0aGluLWEtdGV4dC1pbnB1dC1maWVsZFxuICAgICAgICBpZiAoJ3NlbGVjdGlvblN0YXJ0JyBpbiBpbnB1dCkge1xuICAgICAgICAgIGN1cnNvclBvc2l0aW9uID0gaW5wdXQuc2VsZWN0aW9uU3RhcnQ7XG4gICAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XG4gICAgICAgICAgdmFyIHNlbCA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAgIHZhciBzZWxMZW4gPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKS50ZXh0Lmxlbmd0aDtcbiAgICAgICAgICBzZWwubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtaW5wdXQudmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICBjdXJzb3JQb3NpdGlvbiA9IHNlbC50ZXh0Lmxlbmd0aCAtIHNlbExlbjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3Vyc29yUG9zaXRpb24gIT09IDApIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgICAgLy8g5qOA5p+l5b2T5YmN6L6T5YWl5qGG5piv5ZCm56m6XG4gICAgICBjb25zdCBpc0VtcHR5SW5wdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkY3RybC5zZWFyY2hUZXh0ID09PSAnJztcbiAgICAgIH07XG4gICAgICAvLyDlpITnkIbmiYDmnInngrnlh7vjgIHnhKbngrnlkozmjInplK7kuovku7ZcbiAgICAgIGNvbnN0IGV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciBoYW5kbGVkID0gZmFsc2U7XG4gICAgICAgIGlmIChpc0lucHV0VGFyZ2V0ZWRLZXlwcmVzcyhlKSkge1xuICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDggLyogYmFja3NwYWNlICovKSB7XG4gICAgICAgICAgICBpZiAoaXNBYm91dFRvRGVsZXRlKCkpIHtcbiAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgIGRlbGV0ZUN1cnJlbnRJdGVtKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnNvckF0SW5wdXRCZWdpbmluZygpKSB7XG4gICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICB0YXJnZXRlZEJhY2tzcGFjZVByZXNzZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzcgLyogbGVmdCAqLyB8fCBlLmtleUNvZGUgPT09IDM5IC8qIHJpZ2h0ICovKSB7XG4gICAgICAgICAgICBsZXQgZGlyID0gZS5rZXlDb2RlID09PSAzOSA/IDEgOiAtMTtcbiAgICAgICAgICAgIGlmIChpc0VtcHR5SW5wdXQoKSB8fCBpc0Fib3V0VG9EZWxldGUoKSkge1xuICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgdGFyZ2V0ZWRIb3Jpem9udGFsQXJyb3dQcmVzc2VkKGRpcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDQ2IC8qIGZvcndhcmQgZGVsZXRlICovKSB7XG4gICAgICAgICAgICBpZiAoaXNBYm91dFRvRGVsZXRlKCkpIHtcbiAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgIGRlbGV0ZUN1cnJlbnRJdGVtKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQWJvdXRUb0RlbGV0ZSkge1xuICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgIG90aGVyRXZlbnRUcmlnZ2VyZWQoZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhbmRsZWQpIHtcbiAgICAgICAgICAkdGltZW91dCgoKSA9PiB7fSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgICRkb2N1bWVudC5vbignY2xpY2sgZm9jdXNpbiBmb2N1c291dCBrZXlkb3duJywgZXZlbnRIYW5kbGVyKTtcbiAgICAgIGNsZWFudXAoKCkgPT4ge1xuICAgICAgICAkZG9jdW1lbnQub2ZmKCdjbGljayBmb2N1c2luIGZvY3Vzb3V0IGtleWRvd24nLCBldmVudEhhbmRsZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IG91dHB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbGV0IG5ld1ZhbHVlID0gJGN0cmwuY2hvc2VkLm1hcChvcHRpb24gPT4gb3B0aW9uLnZhbHVlKTtcbiAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKG5ld1ZhbHVlLCAkY3RybC5uZ01vZGVsKSkgcmV0dXJuO1xuICAgICAgICAkY3RybC5uZ01vZGVsID0gbmV3VmFsdWU7XG4gICAgICAgICR0aW1lb3V0KCgpID0+ICRjdHJsLm9uQ2hhbmdlKCksIDApO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaW5wdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KCRjdHJsLm5nTW9kZWwpKSAkY3RybC5uZ01vZGVsID0gW107XG4gICAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KCRjdHJsLm9wdGlvbnMpKSAkY3RybC5vcHRpb25zID0gW107XG4gICAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KCRjdHJsLmNob3NlZCkpICRjdHJsLmNob3NlZCA9IFtdO1xuICAgICAgICBsZXQgYWxsT3B0aW9ucyA9ICRjdHJsLm9wdGlvbnMuY29uY2F0KCRjdHJsLmNob3NlZCk7XG4gICAgICAgICRjdHJsLmNob3NlZCA9ICRjdHJsLm5nTW9kZWxcbiAgICAgICAgICAubWFwKHZhbHVlID0+IGFsbE9wdGlvbnMuZmlsdGVyKG9wdGlvbiA9PiBvcHRpb24udmFsdWUgPT09IHZhbHVlKVswXSB8fCBudWxsKVxuICAgICAgICAgIC5maWx0ZXIoeCA9PiB4KTtcbiAgICAgICAgb3V0cHV0KCk7XG4gICAgICB9O1xuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwubmdNb2RlbCcsIGlucHV0KTtcblxuICAgIH1dXG4gIH0pO1xuXG4gIC8qXG4gICAqIDxmb3JtLXRhYmxlPiDnlKjmnaXlnKjooajljZXkuK3lsZXnpLrkuIDkuKrooajmoLxcbiAgICpcbiAgICogbmctbW9kZWwg77yI5Y+M5ZCR77yM5a+56LGh77yJIOihqOagvOe7keWumueahOWAvFxuICAgKiBjb2x1bW5zIO+8iOWNleWQke+8jOaVsOe7hO+8iSDkuIDkuKrmj4/ov7DooajmoLzmnInlk6rkupvliJflkozov5nkupvliJfnmoTlpJbop4LkuI7ooYzkuLrnmoTmlbDnu4TvvIzmlbDnu4TlhYPntKDmmK/kuIDkuKrlr7nosaHvvIzljIXmi6zku6XkuIvplK7lgLxcbiAgICogICAgICogdGV4dCDvvIjlrZfnrKbkuLLvvIkg6KGo5qC85aS06YOo5bCG6KaB5pi+56S655qE5paH5pysXG4gICAqICAgICAqIGtleSDvvIjlrZfnrKbkuLLvvIzlj6/nnIHvvIkg55So5LqO6L+Z5LiA5YiX5Lit5a+55bqU5Y2V5YWD5qC855qEIHZhbHVlIOS4juWvueW6lOihjOeahOWvueixoeeahOWTquS4qumUruebuOWvueW6lFxuICAgKiB0ZW1wbGF0ZSDvvIjlrZfnrKbkuLLvvIkg55So5LqO5o+P6L+w5Y2V5YWD5qC85qC35byP55qE5qih5p2/55qE5ZCN56ew77yM5q+P5Liq5Y2V5YWD5qC85aSE5bCG5Lya6LCD55So6L+Z5Liq5qih5p2/5bGV56S677yM6LCD55So5pe25Lya5o+Q5L6b5Lul5LiL5Y+Y6YePXG4gICAqICAgICAqIGNvbHVtbiDvvIjlr7nosaHvvIkgY29sdW1ucyDkuK3lr7nlupTliJfnmoTpgqPkuKrlr7nosaFcbiAgICogICAgICogcm93IO+8iOWvueixoe+8iSBuZ01vZGVsIOS4reWvueW6lOihjOeahOmCo+S4quWvueixoVxuICAgKiAgICAgKiB2YWx1ZSDvvIjku7vmhI/nsbvlnovvvIkgcm93W2NvbHVtbi5rZXldIOeahOeugOWGmVxuICAgKiAgICAgKiBlZGl0IO+8iOW4g+WwlO+8iSDlvZPliY3mmK/lkKbmmK/nvJbovpHnirbmgIFcbiAgICogICAgICogcm93SW5kZXgsIGNvbHVtbkluZGV4IOW9k+WJjeihjOWPt+OAgeWIl+WPt1xuICAgKiBvbi1zYXZlLCBvbi1iZWZvcmUtZWRpdCwgb24tY2FuY2VsLWVkaXQg77yI5Zue6LCD77yJIOWIhuWIq+eUqOS6jueUqOaIt+eCueWHu+KAnOS/neWtmOKAneOAgeKAnOe8lui+keKAneaIluKAnOWPlua2iOKAneaXtueahOWbnuiwg+WHveaVsO+8jOWbnuiwg+WHveaVsOWMheaLrOS7peS4i+WAvFxuICAgKiAgICAgKiBkYXRhIOi/meS4gOihjOeahOaVsOaNru+8jOWPlua2iOe8lui+keaXtuaYr+S/ruaUueWQjueahOWAvFxuICAgKiAgICAgKiBpbmRleCDooYzlj7dcbiAgICogICDov5nkuInkuKrlsZ7mgKflpoLmnpzpg73mnKrmj5DkvpvvvIzliJnooajmoLzkuI3mmL7npLrnvJbovpHmjInpkq7vvIzlpoLmnpzpnIDopoHnvJbovpHlip/og73kvYbmmK/kuI3pnIDopoHku7vkvZXlm57osIPvvIzlj6/ku6Xms6jlhoznqbrlm57osINcbiAgICogb24tZGVsZXRlIO+8iOWbnuiwg++8iSDnlKjmiLfngrnlh7vigJzliKDpmaTigJ3ml7bnmoTlm57osIPvvIzlj4LmlbDlkozms6jmhI/kuovpobnlj4LogIPkuIrmlocgb24tc2F2ZVxuICAgKiBkaXNhYmxlZCDvvIjlrZfnrKbkuLLvvIkg6Z2e56m65Liy6KGo56S66KGo5qC856aB55So57yW6L6R77yM5q2k5pe25LiN5bGV56S65pON5L2c5YiX77yM57yW6L6R5oiW5Yig6ZmkXG4gICAqIGNvbXBhcmUta2V5IO+8iOWtl+espuS4su+8jOWPr+mAie+8iSDnlKjkuo4gbm8tZWRpdCwgbm8tZGVsZXRlIOWPguaVsO+8jOWmguaenOS4jeS8oOWImeaMieeFp+WvueixoeavlOi+g++8jOWQpuWImeaMieeJueWumumUruWAvOavlOi+g1xuICAgKiBuby1lZGl0IO+8iOaVsOe7hO+8iSDlpoLmnpzmn5DooYznmoTlr7nosaHmoLnmja4gY29tcGFyZS1rZXkg5oyH5a6a55qE5q+U6L6D5pa55byP5ZKM5pys5pWw57uE5YaF55qE5Lu75LiA5YC855u4562J77yM5YiZ5LiN5Y+v57yW6L6RXG4gICAqIG5vLWRlbGV0ZSDvvIjmlbDnu4TvvIkg57G75Ly8IG5vLWVkaXQg77yM55u4562J5pe25LiN5Y+v5Yig6ZmkXG4gICAqICAg6K+35rOo5oSP77yM5LiA6Iis5oOF5Ya15LiL77yMbm8tZWRpdCwgbm8tZGVsZXRlIOeahOWFg+e0oOW6lOW9k+WSjCBuZy1tb2RlbCDnmoTlhYPntKDkvb/nlKjlkIzkuIDkuKrlr7nosaHnmoTlvJXnlKhcbiAgICogICDov5nmoLflj6/ku6Xpgb/lhY3lhYPntKDooqvnvJbovpHmiJblhbbku5bmlrnlvI/kv67mlLnlkI7vvIzlm6DkuLrkuI3lho3nm7jnrYnogIzlj6/ku6XliKDpmaTnmoTpl67pophcbiAgICogY3VzdG9tLWJ1dHRvbnMg77yI5pWw57uE77yJIOaVsOe7hOWFg+e0oOaYr+e7k+aehOS9k++8jOeUqOS6juaPj+i/sOihqOagvOS4remineWkluWMheaLrOWTquS6m+iHquWumuS5ieeahOaMiemSru+8jOe7k+aehOS9k+WMheaLrOmUruWAvOWmguS4i1xuICAgKiAgICAgKiBpY29uIO+8iOaWh+acrO+8iSDooajnpLrlm77moIfnmoTlkI3np7DvvIzor7flj4LogIMgPGljb24tKj4g57uE5Lu2XG4gICAqICAgICAqIHRleHQg77yI5paH5pys77yJIOm8oOagh+WIkuWIsOWbvuagh+S4iuaXtuaYvuekuueahOaWh+acrFxuICAgKiBvbi1jdXN0b20tYnV0dG9uIO+8iOWbnuiwg++8iSDnlKjkuo7ngrnlh7voh6rlrprkuYnmjInpkq7ml7blsZXnpLrliqjkvZzvvIzpmaTkuIrmloflm57osIPnmoTlj4LmlbDlpJbvvIzpop3lpJblop7liqDkuIDkuKrlj4LmlbAgYWN0aW9uIOihqOekuuWTquS4quiHquWumuS5ieaMiemSrueahOWvueixoVxuICAgKiBmaWx0ZXIg77yI5a+56LGh77yM5Y+v6YCJ77yJIOeUqOS6juWxleekuueUqOeahOi/h+a7pOWZqO+8jOaYryBhbmd1bGFyIOeahCBmaWx0ZXIg566h6YGT55qE5Y+C5pWwXG4gICAqIGVkaXRlZC1kYXRhIO+8iOWvueixoe+8jOWPr+mAie+8iSDooajnpLrlvZPliY3lk6rkupvooYzlpITkuo7ooqvnvJbovpHnirbmgIHvvIzplK7mmK/ooqvnvJbovpHnmoTooYzlj7fvvIzlgLzmmK/ov5nooYznvJbovpHliY3nmoTlhoXlrrlcbiAgICogICDor7fms6jmhI/vvJrlpoLmnpzlrozmiJDmn5DooYznmoTnvJbovpHvvIzkvaDlupTlvZPku47nu5PmnoTkvZPkuK3kvb/nlKggZGVsZXRlIOWIoOmZpOWvueW6lOeahOmUruWAvOWvue+8jOiAjOmdnui1i+WAvOS4uiBudWxsIOaIliAodm9pZCAwKVxuICAgKi9cbiAgZm9ybUlucHV0cy5jb21wb25lbnQoJ2Zvcm1UYWJsZScsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPHRhYmxlIGNsYXNzPVwiZm9ybS10YWJsZVwiPlxuICAgICAgICA8Y29sZ3JvdXAgbmctaWY9XCIkY3RybC5jb2x1bW5zLmxlbmd0aFwiPlxuICAgICAgICAgIDxjb2wgY2xhc3M9XCJmb3JtLXRhYmxlLWNvbHVtblwiIG5nLXJlcGVhdD1cImNvbHVtbiBpbiAkY3RybC5jb2x1bW5zIHRyYWNrIGJ5ICRpbmRleFwiIG5nLXN0eWxlPVwieyB3aWR0aDogY29sdW1uLndpZHRoIHx8ICdhdXRvJyB9XCI+PC9jb2w+XG4gICAgICAgIDwvY29sZ3JvdXA+XG4gICAgICAgIDxjb2xncm91cCBuZy1pZj1cIiRjdHJsLmhhc0J1dHRvbnMoKVwiPlxuICAgICAgICAgIDxjb2wgY2xhc3M9XCJmb3JtLXRhYmxlLWNvbHVtbiBmb3JtLXRhYmxlLWFjdGlvbi1jb2x1bW5cIiBuZy1zdHlsZT1cInsgd2lkdGg6IDIwICsgMzAgKiAkY3RybC5idXR0b25Db3VudCgpIH1cIj48L2NvbD5cbiAgICAgICAgPC9jb2xncm91cD5cbiAgICAgICAgPHRoZWFkPlxuICAgICAgICAgIDx0ciBjbGFzcz1cImZvcm0tdGFibGUtZmlyc3Qtcm93XCI+XG4gICAgICAgICAgICA8dGggY2xhc3M9XCJmb3JtLXRhYmxlLWNvbHVtbi10aXRsZVwiIG5nLXJlcGVhdD1cImNvbHVtbiBpbiAkY3RybC5jb2x1bW5zIHRyYWNrIGJ5ICRpbmRleFwiIG5nLWJpbmQ9XCJjb2x1bW4udGV4dFwiXCI+PC90aD5cbiAgICAgICAgICAgIDx0aCBjbGFzcz1cImZvcm0tdGFibGUtY29sdW1uLXRpdGxlIGZvcm0tdGFibGUtYWN0aW9uLWNvbHVtbi10aXRsZVwiIG5nLWlmPVwiJGN0cmwuaGFzQnV0dG9ucygpXCI+5pON5L2cPC90aD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3RoZWFkPlxuICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgPHRyIG5nLXJlcGVhdD1cIihyb3dJbmRleCwgcm93KSBpbiAoKCRjdHJsLm5nTW9kZWwgfHwgW10pIHwgZmlsdGVyOiRjdHJsLmZpbHRlclJ1bGUoKSkgdHJhY2sgYnkgJGluZGV4XCIgY2xhc3M9XCJmb3JtLXRhYmxlLXJvd1wiIG5nLWNsYXNzPVwieyAnZm9ybS10YWJsZS1yb3ctZWRpdCc6ICRjdHJsLmdldEVkaXRTdGF0dXMocm93SW5kZXgpLCAnZm9ybS10YWJsZS1sYXN0LXJvdyc6ICRjdHJsLm5nTW9kZWwubGVuZ3RoIC0gMSA9PT0gcm93SW5kZXggfVwiPlxuICAgICAgICAgICAgPHRkIG5nLXJlcGVhdD1cIihjb2x1bW5JbmRleCwgY29sdW1uKSBpbiAkY3RybC5jb2x1bW5zIHRyYWNrIGJ5ICRpbmRleFwiIGNsYXNzPVwiZm9ybS10YWJsZS1jZWlsXCI+XG4gICAgICAgICAgICAgIDxkaXYgbmctcmVwZWF0PVwiZWRpdCBpbiBbJGN0cmwuZ2V0RWRpdFN0YXR1cyhyb3dJbmRleCldIHRyYWNrIGJ5ICRpbmRleFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgbmctcmVwZWF0PVwidmFsdWUgaW4gW3Jvd1tjb2x1bW4ua2V5XV0gdHJhY2sgYnkgJGluZGV4XCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IG5nLXJlcGVhdD1cInBhcmFtIGluIFskY3RybC5wYXJhbV0gdHJhY2sgYnkgJGluZGV4XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgbmctaW5jbHVkZT1cIiRjdHJsLnRlbXBsYXRlXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgPHRkIG5nLWlmPVwiJGN0cmwuaGFzQnV0dG9ucygpXCIgY2xhc3M9XCJmb3JtLXRhYmxlLWNlaWwgZm9ybS10YWJsZS1hY3Rpb24tY2VpbFwiPlxuICAgICAgICAgICAgICA8ZGl2IG5nLWlmPVwiISRjdHJsLmdldEVkaXRTdGF0dXMocm93SW5kZXgpXCI+XG4gICAgICAgICAgICAgICAgPGljb24tZ3JvdXA+XG4gICAgICAgICAgICAgICAgICA8aWNvbi1ieS1uYW1lIG5nLXJlcGVhdD1cImFjdGlvbiBpbiAkY3RybC5jdXN0b21CdXR0b25zXCIgbmFtZT1cInt7IGFjdGlvbi5pY29uIH19XCIgbmctY2xpY2s9XCIkY3RybC5jdXN0b21CdXR0b24oYWN0aW9uLCByb3dJbmRleClcIiB0b29sdGlwPVwie3sgYWN0aW9uLnRleHQgfX1cIj48L2ljb24tYnktbmFtZT5cbiAgICAgICAgICAgICAgICAgIDxpY29uLWVkaXQgdG9vbHRpcD1cIue8lui+kVwiIG5nLWNsaWNrPVwiJGN0cmwubWF5RWRpdChyb3dJbmRleCkgJiYgJGN0cmwuYmVmb3JlRWRpdChyb3dJbmRleClcIiBuZy1pZj1cIiRjdHJsLmhhc0VkaXQoKVwiIGRpc2FibGVkPVwie3sgJGN0cmwubWF5RWRpdChyb3dJbmRleCkgPyAnJyA6ICdkaXNhYmxlZCcgfX1cIj48L2ljb24tZWRpdD5cbiAgICAgICAgICAgICAgICAgIDxpY29uLWRlbGV0ZSB0b29sdGlwPVwi5Yig6ZmkXCIgbmctY2xpY2s9XCIkY3RybC5tYXlEZWxldGUocm93SW5kZXgpICYmICRjdHJsLmRlbGV0ZUl0ZW0ocm93SW5kZXgpXCIgbmctaWY9XCIkY3RybC5oYXNEZWxldGUoKVwiIGRpc2FibGVkPVwie3sgJGN0cmwubWF5RGVsZXRlKHJvd0luZGV4KSA/ICcnIDogJ2Rpc2FibGVkJyB9fVwiPjwvaWNvbi1kZWxldGU+XG4gICAgICAgICAgICAgICAgPC9pY29uLWdyb3VwPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBuZy1pZj1cIiRjdHJsLmdldEVkaXRTdGF0dXMocm93SW5kZXgpXCI+XG4gICAgICAgICAgICAgICAgPGljb24tZ3JvdXA+XG4gICAgICAgICAgICAgICAgICA8aWNvbi1zYXZlIHRvb2x0aXA9XCLkv53lrZhcIiBuZy1jbGljaz1cIiRjdHJsLnNhdmVJdGVtKHJvd0luZGV4KVwiPjwvaWNvbi1zYXZlPlxuICAgICAgICAgICAgICAgICAgPGljb24tY2FuY2VsIHRvb2x0aXA9XCLlj5bmtohcIiBuZy1jbGljaz1cIiRjdHJsLmNhbmNlbEVkaXQocm93SW5kZXgpXCI+PC9pY29uLWNhbmNlbD5cbiAgICAgICAgICAgICAgICA8L2ljb24tZ3JvdXA+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICAgIDx0ciBuZy1pZj1cIiRjdHJsLmVtcHR5VGV4dCAmJiAoKCRjdHJsLm5nTW9kZWwgfHwgW10pIHwgZmlsdGVyOiRjdHJsLmZpbHRlclJ1bGUoKSkubGVuZ3RoID09PSAwXCIgY2xhc3M9XCJmb3JtLXRhYmxlLXJvdyBmb3JtLXRhYmxlLXJvdy1lbXB0eVwiPlxuICAgICAgICAgICAgPHRkIGNsYXNzPVwiZm9ybS10YWJsZS1lbXB0eS10ZXh0XCIgY29sc3Bhbj1cInt7ICRjdHJsLmNvbHVtbnMubGVuZ3RoICsgJGN0cmwuaGFzQnV0dG9ucygpIH19XCIgbmctYmluZD1cIiRjdHJsLmVtcHR5VGV4dFwiPjwvdGQ+XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgPC90Ym9keT5cbiAgICAgIDwvdGFibGU+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgY29sdW1uczogJzwnLFxuICAgICAgb25EZWxldGU6ICcmPycsXG4gICAgICBvblNhdmU6ICcmPycsXG4gICAgICBvbkJlZm9yZUVkaXQ6ICcmPycsXG4gICAgICBvbkNhbmNlbEVkaXQ6ICcmPycsXG4gICAgICBkaXNhYmxlZDogJ0AnLFxuICAgICAgbm9EZWxldGU6ICc8PycsXG4gICAgICBub0VkaXQ6ICc8PycsXG4gICAgICB0ZW1wbGF0ZTogJ0AnLFxuICAgICAgbmdNb2RlbDogJz0nLFxuICAgICAgb25DdXN0b21CdXR0b246ICcmPycsXG4gICAgICBjdXN0b21CdXR0b25zOiAnPD8nLFxuICAgICAgY29tcGFyZUtleTogJ0AnLFxuICAgICAgZW1wdHlUZXh0OiAnQCcsXG4gICAgICBmaWx0ZXI6ICc8PycsXG4gICAgICBlZGl0ZWREYXRhOiAnPT8nLFxuICAgICAgcGFyYW06ICc8PycsXG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBbZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgJGN0cmwgPSB0aGlzO1xuXG4gICAgICAkY3RybC5oYXNFZGl0ID0gKCkgPT4gISEoJGN0cmwub25CZWZvcmVFZGl0IHx8ICRjdHJsLm9uQ2FuY2VsRWRpdCB8fCAkY3RybC5vblNhdmUpO1xuICAgICAgJGN0cmwuaGFzRGVsZXRlID0gKCkgPT4gISEoJGN0cmwub25EZWxldGUpO1xuICAgICAgJGN0cmwuaGFzQnV0dG9ucyA9ICgpID0+ICEhKCEkY3RybC5kaXNhYmxlZCAmJiAoJGN0cmwuaGFzRWRpdCgpIHx8ICRjdHJsLmhhc0RlbGV0ZSgpIHx8ICRjdHJsLm9uQ3VzdG9tQnV0dG9uIHx8ICRjdHJsLmN1c3RvbUJ1dHRvbnMpKTtcbiAgICAgICRjdHJsLmJ1dHRvbkNvdW50ID0gKCkgPT4gJGN0cmwuaGFzRWRpdCgpICsgJGN0cmwuaGFzRGVsZXRlKCkgKyAoJGN0cmwuY3VzdG9tQnV0dG9ucyB8fCBbXSkubGVuZ3RoO1xuICAgICAgJGN0cmwuZ2V0RWRpdFN0YXR1cyA9IChpbmRleCkgPT4gISEoKCRjdHJsLmhhc0J1dHRvbnMoKSAmJiAhJGN0cmwubmdNb2RlbFtpbmRleF0uZGlzYWJsZWQgJiYgKGluZGV4IGluICRjdHJsLmVkaXRlZERhdGEpIHx8IGZhbHNlKSk7XG4gICAgICBjb25zdCBzYW1lSXRlbSA9ICh4LCB5KSA9PiAkY3RybC5jb21wYXJlS2V5ID8gYW5ndWxhci5lcXVhbHMoeFskY3RybC5jb21wYXJlS2V5XSwgeVskY3RybC5jb21wYXJlS2V5XSkgOiBhbmd1bGFyLmVxdWFscyh4LCB5KTtcbiAgICAgICRjdHJsLm1heUVkaXQgPSAoaW5kZXgpID0+ICgkY3RybC5ub0VkaXQgfHwgW10pLmV2ZXJ5KHYgPT4gIXNhbWVJdGVtKHYsICRjdHJsLm5nTW9kZWxbaW5kZXhdKSk7XG4gICAgICAkY3RybC5tYXlEZWxldGUgPSAoaW5kZXgpID0+ICgkY3RybC5ub0RlbGV0ZSB8fCBbXSkuZXZlcnkodiA9PiAhc2FtZUl0ZW0odiwgJGN0cmwubmdNb2RlbFtpbmRleF0pKTtcblxuICAgICAgJGN0cmwuZWRpdGVkRGF0YSA9IHt9O1xuICAgICAgJGN0cmwuYmVmb3JlRWRpdCA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICBpZiAoJGN0cmwub25CZWZvcmVFZGl0KSAkY3RybC5vbkJlZm9yZUVkaXQoeyBkYXRhOiAkY3RybC5uZ01vZGVsW2luZGV4XSwgaW5kZXg6IGluZGV4IH0pO1xuICAgICAgICAkY3RybC5lZGl0ZWREYXRhW2luZGV4XSA9IGFuZ3VsYXIuY29weSgkY3RybC5uZ01vZGVsW2luZGV4XSk7XG4gICAgICB9O1xuICAgICAgJGN0cmwuc2F2ZUl0ZW0gPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgaWYgKCRjdHJsLm9uU2F2ZSkgJGN0cmwub25TYXZlKHsgZGF0YTogJGN0cmwubmdNb2RlbFtpbmRleF0sIGluZGV4OiBpbmRleCB9KTtcbiAgICAgICAgZGVsZXRlICRjdHJsLmVkaXRlZERhdGFbaW5kZXhdO1xuICAgICAgfTtcbiAgICAgICRjdHJsLmRlbGV0ZUl0ZW0gPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgaWYgKCRjdHJsLm9uRGVsZXRlKSAkY3RybC5vbkRlbGV0ZSh7IGRhdGE6ICRjdHJsLm5nTW9kZWxbaW5kZXhdLCBpbmRleDogaW5kZXggfSk7XG4gICAgICAgICRjdHJsLm5nTW9kZWwuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IGluZGV4OyBpIDwgJGN0cmwubmdNb2RlbC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICgoaSArIDEpIGluICRjdHJsLmVkaXRlZERhdGEpIHtcbiAgICAgICAgICAgICRjdHJsLmVkaXRlZERhdGFbaV0gPSAkY3RybC5lZGl0ZWREYXRhW2kgKyAxXTtcbiAgICAgICAgICAgIGRlbGV0ZSAkY3RybC5lZGl0ZWREYXRhW2kgKyAxXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkY3RybC5jYW5jZWxFZGl0ID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgIGlmICgkY3RybC5vbkNhbmNlbEVkaXQpICRjdHJsLm9uQ2FuY2VsRWRpdCh7IGRhdGE6ICRjdHJsLm5nTW9kZWxbaW5kZXhdLCBpbmRleDogaW5kZXggfSk7XG4gICAgICAgIGFuZ3VsYXIuY29weSgkY3RybC5lZGl0ZWREYXRhW2luZGV4XSwgJGN0cmwubmdNb2RlbFtpbmRleF0pO1xuICAgICAgICBkZWxldGUgJGN0cmwuZWRpdGVkRGF0YVtpbmRleF07XG4gICAgICB9O1xuICAgICAgJGN0cmwuY3VzdG9tQnV0dG9uID0gZnVuY3Rpb24gKGFjdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgaWYgKCRjdHJsLm9uQ3VzdG9tQnV0dG9uKSAkY3RybC5vbkN1c3RvbUJ1dHRvbih7IGFjdGlvbiwgaW5kZXgsIGRhdGE6ICRjdHJsLm5nTW9kZWxbaW5kZXhdIH0pO1xuICAgICAgfTtcblxuICAgICAgJGN0cmwuZmlsdGVyUnVsZSA9ICgpID0+ICRjdHJsLmZpbHRlciB8fCB7fTtcbiAgICB9XSxcbiAgfSk7XG5cbiAgLypcbiAgICogPGlucHV0LXdpdGgtY29weT4g5LiA5Liq5bim5aSN5Yi25oyJ6ZKu55qE5Y+q6K+75paH5pys5qGGXG4gICAqXG4gICAqIG5nLW1vZGVsIO+8iOWPjOWQke+8iSDmlofmnKzmoYbmmL7npLrnmoTmloflrZdcbiAgICogYXBwZWFyYW5jZSDvvIjlj6/pgInvvIzlrZfnrKbkuLLvvIkg5Y+v5Lul5Y+W5YC8IGlucHV077yI6buY6K6k77yJLCB0ZXh0YXJlYSwgY29kZWFyZWFcbiAgICogICBpbnB1dCDovpPlhaXmoYblsZXnpLrmiJDljZXooYzovpPlhaXmoYZcbiAgICogICB0ZXh0YXJlYSDovpPlhaXmoYblsZXnpLrmiJDlpJrooYzmlofmnKzmoYZcbiAgICogcmVhZG9ubHkg77yI5a2X56ym5Liy77yJIOi+k+WFpeahhuaYr+WQpuWPquivu1xuICAgKiBsYW5ndWFnZSDvvIjlrZfnrKbkuLLvvIkg5LuFIGNvZGVhcmVhIOaXtuacieaViO+8jOaMh+ekuuS7o+eggeivreiogFxuICAgKlxuICAgKiDlhbbku5bkvp3otZbvvJrkvp3otZYgY2xpcGJvYXJkLmpzXG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnaW5wdXRXaXRoQ29weScsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGRpdiBjbGFzcz1cImlucHV0LXdpdGgtYnV0dG9uXCIgaWQ9XCJ7eyAkY3RybC5pZCB9fVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtd2l0aC1idXR0b24taW5wdXRcIj5cbiAgICAgICAgICA8aW5wdXQgbmctaWY9XCIkY3RybC5hcHBlYXJhbmNlICE9PSAndGV4dGFyZWEnICYmICRjdHJsLmFwcGVhcmFuY2UgIT09ICdjb2RlYXJlYSdcIiB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwiJGN0cmwubmdNb2RlbFwiIG5nLXJlYWRvbmx5PVwiJGN0cmwucmVhZG9ubHlcIiAvPlxuICAgICAgICAgIDx0ZXh0YXJlYSBuZy1pZj1cIiRjdHJsLmFwcGVhcmFuY2UgPT09ICd0ZXh0YXJlYSdcIiBuZy1tb2RlbD1cIiRjdHJsLm5nTW9kZWxcIiBuZy1yZWFkb25seT1cIiRjdHJsLnJlYWRvbmx5XCI+PC90ZXh0YXJlYT5cbiAgICAgICAgICA8Y29kZWFyZWEgbmctaWY9XCIkY3RybC5hcHBlYXJhbmNlID09PSAnY29kZWFyZWEnXCIgbmctbW9kZWw9XCIkY3RybC5uZ01vZGVsXCIgcmVhZG9ubHk9XCJ7eyAkY3RybC5yZWFkb25seSA/ICdyZWFkb25seScgOiAnJyB9fVwiIGxhbmd1YWdlPVwiJGN0cmwubGFuZ3VhZ2VcIj48L2NvZGVhcmVhPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LXdpdGgtYnV0dG9uLWJ1dHRvblwiPlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiaW5wdXQtd2l0aC1idXR0b24tY29weVwiIGRhdGEtY2xpcGJvYXJkLXRhcmdldD1cIiN7eyAkY3RybC5pZCB9fSBpbnB1dCwgI3t7ICRjdHJsLmlkIH19IHRleHRhcmVhXCI+PGljb24tY2xpcGJvYXJkPjwvaWNvbi1jbGlwYm9hcmQ+PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgbmdNb2RlbDogJz0nLFxuICAgICAgYXBwZWFyYW5jZTogJ0A/JyxcbiAgICAgIGxhbmd1YWdlOiAnQCcsXG4gICAgICByZWFkb25seTogJ0AnLFxuICAgIH0sXG4gICAgY29udHJvbGxlcjogWydhcGknLCBmdW5jdGlvbiAoYXBpKSB7XG4gICAgICBjb25zdCAkY3RybCA9IHRoaXM7XG4gICAgICAkY3RybC5pZCA9IGdlblVuaXF1ZUlkKCk7XG4gICAgICBsZXQgc2NyaXB0ID0gYXBpLmxvYWRTY3JpcHQoJy9saWIvanMvY2xpcGJvYXJkLmpzL2NsaXBib2FyZC5taW4uanMnLCAoKSA9PiB3aW5kb3cuQ2xpcGJvYXJkKTtcbiAgICAgIHNjcmlwdC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbGV0IHNlbGVjdG9yID0gYCMkeyRjdHJsLmlkfSBidXR0b25gO1xuICAgICAgICBsZXQgY2xpcGJvYXJkID0gbmV3IENsaXBib2FyZChzZWxlY3Rvcik7XG4gICAgICAgIGNsaXBib2FyZC5vbignc3VjY2VzcycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgZS5jbGVhclNlbGVjdGlvbigpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1dXG4gIH0pO1xuXG4gIC8qXG4gICAqIDxjb2RlYXJlYT4g5LiA5Liq5aSa6KGM5paH5pys5qGG77yM5LiN6L+H5piv5Luj56CBXG4gICAqXG4gICAqIGxhbmd1YWdlIO+8iOWtl+espuS4su+8iSDnqIvluo/or63oqIDvvIzlj6/pgIkgZG9ja2VyZmlsZSwganNvbiwgbWFya2Rvd24sIG5naW54LCBzaGVsbCwgeG1sLCB5YW1sLCB0ZXh077yI6buY6K6k77yJXG4gICAqICAg5rOo77yaIGFjZSDlubbkuI3mlK/mjIEgbmdpbngg77yM5Zug5q2kIG5naW54IOWwhuS8muWxleekuuaIkCB0ZXh0XG4gICAqIG5nTW9kZWwg77yI5Y+M5ZCR77yM5a2X56ym5Liy77yJIOe7keWumueahOWAvFxuICAgKiBuYW1lIO+8iOWtl+espuS4su+8iSDooajljZXkuK3nmoRuYW1lXG4gICAqIHJlYWRvbmx5IO+8iOW4g+WwlO+8iSDpnZ7nqbrliJnlj6ror7tcbiAgICogcmVxdWlyZWQg77yI5biD5bCU77yJIOmdnuepuuWImeWcqOihqOWNlemqjOivgeaXtuimgeaxguWhq+WGmVxuICAgKlxuICAgKiDlhbbku5bkvp3otZbvvJrkvp3otZYgYWNlLmpzXG4gICAqXG4gICAqIOazqO+8mui/meS4que7hOS7tuS4jeS8muivu+WPliA8Y29kZWFyZWE+IOagh+etvuWGheeahOWGheWuue+8jOaJgOS7peivt+aAu+aYr+S9v+eUqCBuZ01vZGVsIOe7keWumuaWh+acrOahhueahOWAvFxuICAgKi9cbiAgZm9ybUlucHV0cy5jb21wb25lbnQoJ2NvZGVhcmVhJywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICA8ZGl2IGlkPVwie3sgJGN0cmwuaWQgfX1cIiBjbGFzcz1cImNvZGVhcmVhLWNvbnRhaW5lclwiPlxuICAgICAgICA8dGV4dGFyZWEgY2xhc3M9XCJjb2RlYXJlYS1oaWRkZW4tdGV4dGFyZWFcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCIgbmFtZT1cIiRjdHJsLm5hbWVcIiBuZy1tb2RlbD1cIiRjdHJsLm5nTW9kZWxcIiBuZy1yZXF1aXJlZD1cIiRjdHJsLnJlcXVpcmVkXCI+PC90ZXh0YXJlYT5cbiAgICAgICAgPGRpdiBpZD1cInt7ICRjdHJsLmVkaXRvcklkIH19XCIgY2xhc3M9XCJjb2RlYXJlYS1hY2UtY29udGFpbmVyXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICBsYW5ndWFnZTogJ0AnLFxuICAgICAgbmdNb2RlbDogJz0nLFxuICAgICAgcmVxdWlyZWQ6ICdAJyxcbiAgICAgIG5hbWU6ICdAPycsXG4gICAgICByZWFkb25seTogJ0AnLFxuICAgICAgaGVpZ2h0OiAnQCcsXG4gICAgICBvbkNoYW5nZTogJyYnLFxuICAgIH0sXG4gICAgY29udHJvbGxlcjogWydhcGknLCAnJHNjb3BlJywgJyRpbnRlcnZhbCcsICckdGltZW91dCcsIGZ1bmN0aW9uIChhcGksICRzY29wZSwgYW5ndWxhckludGVydmFsLCBhbmd1bGFyVGltZW91dCkge1xuICAgICAgY29uc3QgJGN0cmwgPSB0aGlzO1xuICAgICAgY29uc3QgJGludGVydmFsID0gc2NvcGVkSW50ZXJ2YWwoYW5ndWxhckludGVydmFsLCAkc2NvcGUpO1xuICAgICAgY29uc3QgJHRpbWVvdXQgPSBzY29wZWRJbnRlcnZhbChhbmd1bGFyVGltZW91dCwgJHNjb3BlKTtcblxuICAgICAgJGN0cmwuaWQgPSBnZW5VbmlxdWVJZCgpO1xuICAgICAgJGN0cmwuZWRpdG9ySWQgPSBnZW5VbmlxdWVJZCgpO1xuICAgICAgaWYgKCEkY3RybC5uYW1lKSAkY3RybC5uYW1lID0gZ2VuVW5pcXVlSWQoKTtcblxuICAgICAgY29uc3QgbW9kZU1hcCA9IHtcbiAgICAgICAgZG9ja2VyZmlsZTogJ2RvY2tlcmZpbGUnLFxuICAgICAgICBqc29uOiAnanNvbicsXG4gICAgICAgIG1hcmtkb3duOiAnbWFya2Rvd24nLFxuICAgICAgICBzaGVsbDogJ3NoJyxcbiAgICAgICAgeG1sOiAneG1sJyxcbiAgICAgICAgeWFtbDogJ3lhbWwnLFxuICAgICAgfTtcblxuICAgICAgbGV0IGVkaXRvciA9IG51bGw7XG4gICAgICBsZXQgdmFsdWUgPSBudWxsO1xuICAgICAgbGV0IG1pbiA9IDAsIG1heCA9IDA7XG5cbiAgICAgIGxldCBzY3JpcHQgPSBhcGkubG9hZFNjcmlwdCgnL2xpYi9qcy9hY2UvYWNlLmpzJywgKCkgPT4gd2luZG93LmFjZSk7XG4gICAgICBzY3JpcHQudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIGVkaXRvciA9IGFjZS5lZGl0KCRjdHJsLmVkaXRvcklkKTtcbiAgICAgICAgZWRpdG9yLmdldFNlc3Npb24oKS5zZXRNb2RlKGBhY2UvbW9kZS8keyBtb2RlTWFwWyRjdHJsLmxhbmd1YWdlXSB8fCAndGV4dCcgfWApO1xuICAgICAgICBlZGl0b3Iub24oJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRjdHJsLm5nTW9kZWwgPSB2YWx1ZSA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICR0aW1lb3V0KCgpID0+IHsgJGN0cmwub25DaGFuZ2UoKTsgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBlZGl0b3Iuc2V0VmFsdWUodmFsdWUgfHwgJycsIDEpO1xuICAgICAgICBlZGl0b3Iuc2V0T3B0aW9ucyh7IGZvbnRTaXplOiAnMTRweCcgfSk7XG4gICAgICAgIGVkaXRvci4kYmxvY2tTY3JvbGxpbmcgPSBJbmZpbml0eTtcbiAgICAgICAgZWRpdG9yLnNldFJlYWRPbmx5KCEhJGN0cmwucmVhZG9ubHkpO1xuICAgICAgICBlZGl0b3Iuc2V0T3B0aW9ucyh7IG1pbkxpbmVzOiBtaW4sIG1heExpbmVzOiBtYXggfSk7XG4gICAgICB9KTtcblxuICAgICAgbGV0IHNpemUgPSBudWxsO1xuICAgICAgJGludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgkY3RybC5lZGl0b3JJZCk7XG4gICAgICAgIGlmICghZWxlbWVudCB8fCBzaXplID09PSBlbGVtZW50LmNsaWVudEhlaWdodCkgcmV0dXJuO1xuICAgICAgICBzaXplID0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIGlmIChlZGl0b3IpIGVkaXRvci5yZXNpemUoKTtcbiAgICAgIH0sIDEwMCk7XG4gICAgICAkc2NvcGUuJHdhdGNoKCckY3RybC5uZ01vZGVsJywgZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgICAgdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgICBpZiAoZWRpdG9yKSBlZGl0b3Iuc2V0VmFsdWUodmFsdWUsIDEpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgICRzY29wZS4kd2F0Y2goJyRjdHJsLnJlYWRvbmx5JywgZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICBpZiAoZWRpdG9yKSBlZGl0b3Iuc2V0UmVhZE9ubHkoISEkY3RybC5yZWFkb25seSk7XG4gICAgICB9KTtcbiAgICAgICRzY29wZS4kd2F0Y2goJyRjdHJsLmxhbmd1YWdlJywgZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICBpZiAoZWRpdG9yKSBlZGl0b3IuZ2V0U2Vzc2lvbigpLnNldE1vZGUoYGFjZS9tb2RlLyR7IG1vZGVNYXBbJGN0cmwubGFuZ3VhZ2VdIHx8ICd0ZXh0JyB9YCk7XG4gICAgICB9KTtcbiAgICAgICRzY29wZS4kd2F0Y2goJyRjdHJsLmhlaWdodCcsIGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgbGV0IG1hdGNoID0gKCgkY3RybC5oZWlnaHQgfHwgJycpICsgJycpLm1hdGNoKC9eKD89KFxcZCspKSg/PSg/OlxcZCtcXHMqLFxccyopPyhcXGQqKSQpKD86XFxkKyg/OlxccyosXFxzKlxcZCopPykkLyk7XG4gICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICBtaW4gPSBtYXggPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1pbiA9IHBhcnNlSW50KG1hdGNoWzFdLCAwKSB8fCAwO1xuICAgICAgICAgIG1heCA9IG1hdGNoWzJdID09PSAnJyA/IEluZmluaXR5IDogKHBhcnNlSW50KG1hdGNoWzJdLCAwKSB8fCAwKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWRpdG9yKSBlZGl0b3Iuc2V0T3B0aW9ucyh7IG1pbkxpbmVzOiBtaW4sIG1heExpbmVzOiBtYXggfSlcbiAgICAgIH0pO1xuICAgIH1dXG4gIH0pO1xuXG4gIGZvcm1JbnB1dHMuY29tcG9uZW50KCdtYXJrZG93bicsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGRpdiBjbGFzcz1cIm1hcmtkb3duLWNvbnRhaW5lciBtYXJrZG93blwiIG5nLWJpbmQtaHRtbD1cIiRjdHJsLmh0bWxcIj48L2Rpdj5cbiAgICBgLFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICBzb3VyY2U6ICdAPycsXG4gICAgICBzcmM6ICdAPycsXG4gICAgICBlbXB0eVRleHQ6ICdAPycsXG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICdhcGknLCBmdW5jdGlvbiAoJHNjb3BlLCBhcGkpIHtcbiAgICAgIGNvbnN0ICRjdHJsID0gdGhpcztcblxuICAgICAgJGN0cmwuaHRtbCA9ICcnO1xuICAgICAgbGV0IHZlcnNpb24gPSAwO1xuICAgICAgY29uc3Qgc2hvd01hcmtkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkY3RybC5odG1sID0gJyc7XG4gICAgICAgIGxldCBteVZlcnNpb24gPSArK3ZlcnNpb247XG4gICAgICAgIGxldCBzb3VyY2UgPSBudWxsO1xuICAgICAgICBpZiAoJGN0cmwuc291cmNlKSBzb3VyY2UgPSBhcGkuU2ltcGxlUHJvbWlzZS5yZXNvbHZlKCRjdHJsLnNvdXJjZSk7XG4gICAgICAgIGVsc2UgaWYgKCRjdHJsLnNyYykgc291cmNlID0gYXBpLm5ldHdvcmsoJGN0cmwuc3JjLCAnR0VUJywgeyByZXNwb25zZVR5cGU6IFwiYXJyYXlidWZmZXJcIiB9KVxuICAgICAgICAgIC50aGVuKGFiID0+IGRlY29kZVVSSUNvbXBvbmVudChlc2NhcGUoU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShTdHJpbmcsIG5ldyBVaW50OEFycmF5KGFiKSkpKS50cmltKCkpO1xuICAgICAgICBlbHNlIHNvdXJjZSA9IGFwaS5TaW1wbGVQcm9taXNlLnJlc29sdmUoJycpO1xuICAgICAgICBzb3VyY2UgPSBzb3VyY2UuY2F0Y2goZXJyb3IgPT4gJycpLnRoZW4obWFya2Rvd24gPT4gbWFya2Rvd24gfHwgJGN0cmwuZW1wdHlUZXh0IHx8ICcnKTtcbiAgICAgICAgbGV0IHNjcmlwdCA9IGFwaS5sb2FkU2NyaXB0KCcvbGliL2pzL3Nob3dkb3duLm1pbi5qcycsXG4gICAgICAgICAgKCkgPT4gd2luZG93LnNob3dkb3duLFxuICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHNob3dkb3duLnNldE9wdGlvbignc3RyaWtldGhyb3VnaCcsICd0cnVlJyk7XG4gICAgICAgICAgICBzaG93ZG93bi5zZXRPcHRpb24oJ3RhYmxlcycsICd0cnVlJyk7XG4gICAgICAgICAgICBzaG93ZG93bi5zZXRPcHRpb24oJ3Rhc2tsaXN0cycsICd0cnVlJyk7XG4gICAgICAgICAgICBzaG93ZG93bi5zZXRPcHRpb24oJ3NpbXBsaWZpZWRBdXRvTGluaycsICd0cnVlJyk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBhcGkuU2ltcGxlUHJvbWlzZS5hbGwoW3NvdXJjZSwgc2NyaXB0XSkudGhlbigoW21hcmtkb3duXSkgPT4ge1xuICAgICAgICAgIGlmIChteVZlcnNpb24gIT09IHZlcnNpb24pIHJldHVybjtcbiAgICAgICAgICB2YXIgY29udmVydGVyID0gbmV3IHNob3dkb3duLkNvbnZlcnRlcigpO1xuICAgICAgICAgIGxldCBvcmlnaW5hbCA9IGNvbnZlcnRlci5tYWtlSHRtbChtYXJrZG93bik7XG4gICAgICAgICAgbGV0IGVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXY+PC9kaXY+JykuaHRtbChvcmlnaW5hbCk7XG4gICAgICAgICAgYW5ndWxhci5lbGVtZW50KCdhLCBhcmVhJywgZWxlbWVudCkuYXR0cigndGFyZ2V0JywgJ19ibGFuaycpO1xuICAgICAgICAgICRjdHJsLmh0bWwgPSBlbGVtZW50Lmh0bWwoKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgJHNjb3BlLiR3YXRjaEdyb3VwKFsnJGN0cmwuc291cmNlJywgJyRjdHJsLnNyYyddLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNob3dNYXJrZG93bigpO1xuICAgICAgfSk7XG4gICAgfV1cbiAgfSk7XG5cbiAgLypcbiAgICogPGV2ZW50LWxpc3Q+IOS6i+S7tuWIl+ihqFxuICAgKlxuICAgKiB2YWx1ZSDvvIjmlbDnu4TvvIzljZXlkJHvvIkg5LqL5Lu25YiX6KGo77yM5YWD57Sg5piv5LiA5Liq57uT5p6E5L2T77yM6ZSu5YC85Y+C6ICDIGNvbHVtbiDlkowgZXZlbnRUeXBlQXR0ciDlj4LmlbBcbiAgICogY29sdW1uIO+8iOaVsOe7hO+8jOWNleWQke+8iSDooajnpLrml7bpl7TliJfooajmnInlk6rkupvliJfvvIzlrZfnrKbkuLLmlbDnu4TvvIzlgLzlr7nlupQgdmFsdWUg55qE5bGe5oCnXG4gICAqIHRlbXBsYXRlIO+8iOWtl+espuS4su+8iSDkvb/nlKjnmoTmqKHmnb9cbiAgICogZXZlbnQtdHlwZSDvvIjlrZfnrKbkuLLvvIkg5LqL5Lu257G75Z6L77yM5Y+v6YCJIGVycm9y77yI57qi6Imy77yJLCB3YXJuaW5n77yI6buE6Imy77yJLHN1Y2Nlc3PvvIjnu7/oibLvvInvvIxpbmZv77yI6JOd6Imy77yJXG4gICAqIGV2ZW50LXR5cGUtYXR0ciDvvIjlrZfnrKbkuLLvvIkgdmFsdWUg55qE57uT5p6E5L2T5Lit6KGo56S65LqL5Lu257G75Z6L55qE5Y+C5pWw77yM6buY6K6k5Li6IGB0eXBlYCDjgILlpoLmnpznu5nlrprkuoYgZXZlbnQtdHlwZSDlj4LmlbDvvIzliJnmraTlj4LmlbDml6DmlYjjgIJcbiAgICogICDms6jvvJrlpoLmnpzmnKrmjIflrpogZXZlbnQtdHlwZSDvvIzkuJQgZXZlbnQtdHlwZS1hdHRyIOaMh+WumueahOWxnuaAp+S4jeWtmOWcqO+8jOmCo+S5iOS8muWxleekuuS4uiBpbmZvIO+8iOiTneiJsu+8ieWbvuagh+OAglxuICAgKiBlbXB0eVRleHQg77yI5a2X56ym5Liy77yJIOW9k+WIl+ihqOS4uuepuuaXtuaYvuekuueahOaWh+acrOS6i+S7tuexu+Wei+WPr+mAie+8miBlcnJvcu+8iOe6ouiJsu+8iSwgd2FybmluZ++8iOm7hOiJsu+8iSxzdWNjZXNz77yI57u/6Imy77yJ77yMaW5mb++8iOiTneiJsu+8iVxuICAgKiBwYXJhbSDvvIjlj4zlkJHvvIkg57uR5a6a55So5LqO5YaF6YOo5qih5p2/5L2/55So55qE5Y+C5pWwXG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZXZlbnRMaXN0Jywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtbGlzdC1jb250YWluZXJcIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJldmVudC1saXN0LWVtcHR5XCIgbmctYmluZD1cIiRjdHJsLmVtcHR5VGV4dFwiIG5nLWlmPVwiISRjdHJsLnZhbHVlIHx8ICEkY3RybC52YWx1ZS5sZW5ndGhcIj48L3NwYW4+XG4gICAgICAgIDxvbCBjbGFzcz1cImV2ZW50LWxpc3RcIiBuZy1pZj1cIiRjdHJsLnZhbHVlICYmICRjdHJsLnZhbHVlLmxlbmd0aFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cImV2ZW50LWxpc3QtaXRlbVwiIG5nLXJlcGVhdD1cInJvdyBpbiAkY3RybC52YWx1ZVwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJldmVudC1saXN0LWNvbnRlbnQgZXZlbnQtbGlzdC1pY29uIGV2ZW50LWxpc3QtaWNvbi17eyAkY3RybC5ldmVudFR5cGUgfHwgKCRjdHJsLmV2ZW50VHlwZUF0dHIgPyByb3dbJGN0cmwuZXZlbnRUeXBlQXR0cl0gOiByb3cudHlwZSkgfHwgJ2luZm8nIH19XCI+XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImV2ZW50LWxpc3QtY29udGVudFwiIG5nLXJlcGVhdD1cImNvbHVtbiBpbiAkY3RybC5jb2x1bW4gdHJhY2sgYnkgJGluZGV4XCI+XG4gICAgICAgICAgICAgIDxzcGFuIG5nLXJlcGVhdD1cInZhbHVlIGluIFtyb3dbY29sdW1uXV0gdHJhY2sgYnkgJGluZGV4XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gbmctaW5jbHVkZT1cIiRjdHJsLnRlbXBsYXRlXCI+PC9zcGFuPlxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgPC9vbD5cbiAgICAgIDwvZGl2PlxuICAgIGAsXG4gICAgYmluZGluZ3M6IHtcbiAgICAgIHZhbHVlOiAnPCcsXG4gICAgICBjb2x1bW46ICc8JyxcbiAgICAgIHRlbXBsYXRlOiAnQCcsXG4gICAgICBwYXJhbTogJzw/JyxcbiAgICAgIGV2ZW50VHlwZTogJ0A/JyxcbiAgICAgIGV2ZW50VHlwZUF0dHI6ICdAPycsXG4gICAgICBlbXB0eVRleHQ6ICdAJyxcbiAgICB9LFxuICAgIGNvbnRyb2xsZXI6IFtmdW5jdGlvbiAoKSB7fV1cbiAgfSk7XG5cbiAgLypcbiAgICogPGNoYXJ0PiDlm75cbiAgICpcbiAgICogY2hhcnQtdGl0bGUg77yI5a2X56ym5Liy77yJIOWbvuihqOagh+mimFxuICAgKiBkYXRhIO+8iOaVsOe7hO+8iSDmlbDmja7vvIzppbzlm77lhYPntKDkuLrmlbDlrZfvvIznur/lm77lhYPntKDkuLrmlbDnu4RcbiAgICogZ3JvdXBzIO+8iOaVsOe7hO+8iSDlm77kvovmoIfnrb7lkI1cbiAgICogaXRlbXMg77yI5pWw57uE77yJIOS7heeUqOS6jue6v+Wbvu+8jOe6v+WbvueahOWFg+e0oOWQjeensFxuICAgKiBjb2xvciDvvIjmlbDnu4TvvIkg5q+P57uE5pWw5o2u55qE5Luj6KGo6aKc6ImyXG4gICAqIGxlZ2VuZC1wb3NpdGlvbiDvvIjlrZfnrKbkuLLvvIkg5Zu+5L6L55qE5L2N572u77yM5Y+v6YCJIHJpZ2h0IOWSjCBib3R0b21cbiAgICogb3B0aW9ucyDvvIjlr7nosaHvvIkg5YW25LuW5o+Q5L6b57uZIGNoYXJ0LmpzIOeahCBvcHRpb25zIOWPguaVsFxuICAgKiBlbXB0eS10ZXh0IO+8iOWtl+espuS4su+8iSDlvZPml6DmlbDmja7ml7bmmL7npLrnmoTmlofmnKxcbiAgICovXG4gIGZvcm1JbnB1dHMuY29tcG9uZW50KCdjaGFydCcsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGRpdiBjbGFzcz1cImNoYXJ0IGNoYXJ0LXt7ICRjdHJsLnR5cGUgfX1cIiBpZD1cInt7ICRjdHJsLmlkIH19XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjaGFydC10aXRsZVwiIG5nLWJpbmQ9XCIkY3RybC5jaGFydFRpdGxlXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjaGFydC1jb250ZW50IGNoYXJ0LWNvbnRlbnQtbGVnZW5kLXt7ICRjdHJsLmxlZ2VuZFBvc2l0aW9uIH19XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNoYXJ0LWltZ1wiIG5nLXN0eWxlPVwieyB2aXNpYmlsaXR5OiAkY3RybC5ub0RhdGEgPyAnaGlkZGVuJyA6ICd2aXNpYmxlJyB9XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2hhcnQtY2FudmFzLXdyYXBcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNoYXJ0LWNhbnZhcy1jb25hdGluZXJcIj48Y2FudmFzPjwvY2FudmFzPjwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNoYXJ0LWxlZ2VuZC1jb250YWluZXJcIiBuZy1zdHlsZT1cInsgdmlzaWJpbGl0eTogJGN0cmwubm9EYXRhID8gJ2hpZGRlbicgOiAndmlzaWJsZScgfVwiPlxuICAgICAgICAgICAgPHVsIGNsYXNzPVwiY2hhcnQtbGVnZW5kXCI+XG4gICAgICAgICAgICAgIDxsaSBjbGFzcz1cImNoYXJ0LWxlZ2VuZC1pdGVtXCIgbmctcmVwZWF0PVwibGFiZWwgaW4gJGN0cmwuZ3JvdXBzXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjaGFydC1sZWdlbmQtaXRlbS1zYW1wbGVcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6IHt7ICRjdHJsLmNvbG9yWyRpbmRleF0gfX1cIj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4+e3sgbGFiZWwgfX08L3NwYW4+XG4gICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaGFydC1uby1kYXRhXCIgbmctYmluZD1cIiRjdHJsLmVtcHR5VGV4dFwiIG5nLWlmPVwiJGN0cmwubm9EYXRhXCI+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgY2hhcnRUaXRsZTogJ0AnLFxuICAgICAgZGF0YTogJzwnLFxuICAgICAgZ3JvdXBzOiAnPD8nLFxuICAgICAgaXRlbXM6ICc8PycsXG4gICAgICBjb2xvcjogJzwnLFxuICAgICAgdHlwZTogJ0AnLFxuICAgICAgbGVnZW5kUG9zaXRpb246ICdAJyxcbiAgICAgIG9wdGlvbnM6ICc8PycsXG4gICAgICBlbXB0eVRleHQ6ICdAJyxcbiAgICB9LFxuICAgIGNvbnRyb2xsZXI6IFsnYXBpJywgJyRzY29wZScsIGZ1bmN0aW9uKGFwaSwgJHNjb3BlKXtcbiAgICAgIGNvbnN0ICRjdHJsID0gdGhpcztcbiAgICAgICRjdHJsLmlkID0gZ2VuVW5pcXVlSWQoKTtcblxuICAgICAgbGV0IHNjcmlwdCA9IGFwaS5sb2FkU2NyaXB0KCcvbGliL2pzL0NoYXJ0Lm1pbi5qcycsICgpID0+IHdpbmRvdy5DaGFydCk7XG5cbiAgICAgIGxldCBjaGFydCA9IG51bGw7XG5cbiAgICAgIGNvbnN0IGNsZWFudXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChjaGFydCkgdHJ5IHtcbiAgICAgICAgICBjaGFydC5jbGVhcigpLmRlc3Ryb3koKTtcbiAgICAgICAgfSBjYXRjaCAoX2lnbm9yZSkge31cbiAgICAgIH07XG4gICAgICAkc2NvcGUuJG9uKCckZGVzdG9yeScsIGNsZWFudXApO1xuICAgICAgY29uc3QgcmVwYWludCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICBsZXQgY2FudmFzID0gYW5ndWxhci5lbGVtZW50KCdjYW52YXMnLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgkY3RybC5pZCkpO1xuICAgICAgICBsZXQgZGF0YXNldHMsIGxhYmVscywgb3B0aW9ucyA9IHt9O1xuICAgICAgICAkY3RybC5ub0RhdGEgPSBmYWxzZTtcbiAgICAgICAgaWYgKCRjdHJsLnR5cGUgPT09ICdwaWUnKSB7XG4gICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KCRjdHJsLmRhdGEpIHx8XG4gICAgICAgICAgICAkY3RybC5kYXRhLmluZGV4T2YobnVsbCkgIT09IC0xIHx8XG4gICAgICAgICAgICAkY3RybC5kYXRhLnJlZHVjZSgoeCwgeSkgPT4geCArIHksIDApID09PSAwKVxuICAgICAgICAgICAgJGN0cmwubm9EYXRhID0gdHJ1ZTtcbiAgICAgICAgICBcbiAgICAgICAgICBkYXRhc2V0cyA9IFt7XG4gICAgICAgICAgICBkYXRhOiAkY3RybC5kYXRhLFxuICAgICAgICAgICAgbGFiZWw6ICRjdHJsLmdyb3VwcyxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJGN0cmwuY29sb3IsXG4gICAgICAgICAgICBob3ZlckJhY2tncm91bmRDb2xvcjogJGN0cmwuY29sb3IsXG4gICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiAkY3RybC5jb2xvcixcbiAgICAgICAgICAgIHBvaW50SG92ZXJCb3JkZXJDb2xvcjogJGN0cmwuY29sb3IsXG4gICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogJGN0cmwuY29sb3IsXG4gICAgICAgICAgICBwb2ludEhvdmVyQmFja2dyb3VuZENvbG9yOiAkY3RybC5jb2xvcixcbiAgICAgICAgICB9XTtcbiAgICAgICAgICBsYWJlbHMgPSAkY3RybC5ncm91cHM7XG4gICAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHRvb2x0aXBzOiB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrczoge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBmdW5jdGlvbihpdGVtLCBkYXRhKXtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLmxhYmVsc1tpdGVtLmluZGV4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCRjdHJsLnR5cGUgPT09ICdsaW5lJykge1xuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSgkY3RybC5kYXRhKSB8fCAhJGN0cmwuZGF0YS5sZW5ndGgpICRjdHJsLm5vRGF0YSA9IHRydWU7XG4gICAgICAgICAgZGF0YXNldHMgPSAoJGN0cmwuZGF0YSB8fCBbXSkubWFwKChkYXRhLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkgfHwgJGN0cmwuZGF0YS5pbmRleE9mKG51bGwpICE9PSAtMSkgJGN0cmwubm9EYXRhID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgIGxhYmVsOiAkY3RybC5ncm91cHNbaV0sXG4gICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAkY3RybC5jb2xvcltpXSxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAkY3RybC5jb2xvcltpXSxcbiAgICAgICAgICAgICAgaG92ZXJCYWNrZ3JvdW5kQ29sb3I6ICRjdHJsLmNvbG9yW2ldLFxuICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbGFiZWxzID0gJGN0cmwuaXRlbXM7XG4gICAgICAgICAgbGV0IG1heERhdGEgPSBNYXRoLm1heC5hcHBseShNYXRoLCAkY3RybC5kYXRhLm1hcChkYXRhID0+IE1hdGgubWF4LmFwcGx5KE1hdGgsIGRhdGEpKSk7XG4gICAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHNjYWxlczoge1xuICAgICAgICAgICAgICB5QXhlczogW3tcbiAgICAgICAgICAgICAgICB0aWNrczoge1xuICAgICAgICAgICAgICAgICAgc3RlcFNpemU6IE1hdGgubWF4KDEsIE1hdGguY2VpbChtYXhEYXRhIC8gNSkpLFxuICAgICAgICAgICAgICAgICAgYmVnaW5BdFplcm86IHRydWUsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNoYXJ0RGF0YSA9IGFuZ3VsYXIuY29weSh7XG4gICAgICAgICAgdHlwZTogJGN0cmwudHlwZSxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBsYWJlbHM6IGxhYmVscyxcbiAgICAgICAgICAgIGRhdGFzZXRzOiBkYXRhc2V0cyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9wdGlvbnM6IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgbGVnZW5kOiB7XG4gICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXG4gICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgcGFkZGluZzogMjAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sIG9wdGlvbnMsICRjdHJsLm9wdGlvbnMgfHwge30pLFxuICAgICAgICB9KTtcbiAgICAgICAgc2NyaXB0LnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gY2hhcnQgPSBuZXcgQ2hhcnQoY2FudmFzLCBjaGFydERhdGEpLCAxMDApO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS4kd2F0Y2hHcm91cChbJyRjdHJsLmRhdGEnLCAnJGN0cmwubGFiZWxzJywgJyRjdHJsLmNvbG9yJywgJyRjdHJsLnR5cGUnXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXBhaW50KCk7XG4gICAgICB9KTtcbiAgICB9XVxuICB9KTtcblxuICAvKlxuICAgKiDku6XkuIvmmK/kuJrliqHnm7jlhbPnu4Tku7ZcbiAgICovXG5cbiAgLypcbiAgICogPG11bHRpcGxlLXVzZXItc2VsZWN0PiDnlKjmiLflpJrpgInkuIvmi4nmoYZcbiAgICpcbiAgICogbm90LWluLWxpc3Qg77yI5pWw57uE77yJIOeUqOaItyBpZCDnu4TmiJDnmoTmlbDnu4RcbiAgICogbmctbW9kZWwg77yI5Y+M5ZCR77yM5pWw57uE77yJIOe7keWumueahOWPmOmHj++8jOeUqOaIt+e7k+aehOS9k+e7hOaIkOeahOaVsOe7hFxuICAgKiBwbGFjZWhvbGRlciDvvIjmlofmnKzvvIkg6aKE5a6a5LmJ5paH5pysXG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnbXVsdGlwbGVVc2VyU2VsZWN0Jywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICA8Zm9ybS1tdWx0aXBsZS1zZWxlY3RcbiAgICAgICAgb3B0aW9ucz1cIiRjdHJsLnVzZXJMaXN0RmlsdGVyZWRcIlxuICAgICAgICBuZy1tb2RlbD1cIiRjdHJsLm5nTW9kZWxcIlxuICAgICAgICBwbGFjZWhvbGRlcj1cInt7ICRjdHJsLnBsYWNlaG9sZGVyIHx8ICcnIH19XCJcbiAgICAgICAgaXMtbG9hZGluZz1cIiRjdHJsLmlzTG9hZGluZ1wiXG4gICAgICAgIGxvYWRpbmctdGV4dD1cIuato+WcqOiOt+WPlueUqOaIt+WIl+ihqFwiXG4gICAgICA+PC9mb3JtLW11bHRpcGxlLXNlbGVjdD5cbiAgICBgLFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICBub3RJbkxpc3Q6ICc8PycsXG4gICAgICBuZ01vZGVsOiAnPScsXG4gICAgICBwbGFjZWhvbGRlcjogJ0AnLFxuICAgIH0sXG4gICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnYXBpJywgZnVuY3Rpb24gKCRzY29wZSwgYXBpKSB7XG4gICAgICBjb25zdCAkY3RybCA9IHRoaXM7XG5cbiAgICAgICRjdHJsLmFsbFVzZXJzID0gW107XG4gICAgICAkY3RybC51c2VyTGlzdEZpbHRlcmVkID0gW107XG4gICAgICAkY3RybC5pc0xvYWRpbmcgPSB0cnVlO1xuXG4gICAgICBjb25zdCB1cGRhdGVGaWx0ZXJlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCRjdHJsLmlzTG9hZGluZykgcmV0dXJuO1xuICAgICAgICAkY3RybC51c2VyTGlzdEZpbHRlcmVkID0gJGN0cmwuYWxsVXNlcnMuZmlsdGVyKHVzZXIgPT4gKCRjdHJsLm5vdEluTGlzdCB8fCBbXSkuaW5kZXhPZih1c2VyLmlkKSA9PT0gLTEpO1xuICAgICAgfTtcblxuICAgICAgYXBpLnVzZXIubGlzdCgpLnRoZW4odXNlckxpc3QgPT4ge1xuICAgICAgICAkY3RybC5hbGxVc2VycyA9IHVzZXJMaXN0Lm1hcCh1c2VyID0+ICh7XG4gICAgICAgICAgdmFsdWU6IHVzZXIsXG4gICAgICAgICAgdGV4dDogdXNlci5uYW1lLFxuICAgICAgICAgIGlkOiB1c2VyLmlkLFxuICAgICAgICB9KSk7XG4gICAgICAgICRjdHJsLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICB1cGRhdGVGaWx0ZXJlZCgpO1xuICAgICAgfSkuY2F0Y2goZXJyb3IgPT4gYW5ndWxhci5ub29wKCkpO1xuXG4gICAgICAkc2NvcGUuJHdhdGNoKCckY3RybC5ub3RJbkxpc3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHVwZGF0ZUZpbHRlcmVkKCk7XG4gICAgICB9LCB0cnVlKTtcblxuICAgIH1dLFxuICB9KTtcblxuICAvKlxuICAgKiA8bWVtYmVyLWNvbGxlY3Rpb24tc2VsZWN0PiDnlKjkuo7lsZXnpLrnlKjmiLfnu4TkuIvmi4nljZXpgInmoYZcbiAgICpcbiAgICogdHlwZSDvvIjmlofmnKzvvIkg55So5oi357uE55qE57G75Z6LXG4gICAqIG5nTW9kZWwg77yI5Y+M5ZCR77yJIOmAieS4reeahOeUqOaIt+e7hFxuICAgKiBwbGFjZWhvbGRlciDvvIjmlofmnKzvvIkg6aKE5a6a5LmJ5paH5a2XXG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnbWVtYmVyQ29sbGVjdGlvblNlbGVjdCcsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGZvcm0tc2VsZWN0XG4gICAgICAgIG9wdGlvbnM9XCIkY3RybC5vcHRpb25zXCJcbiAgICAgICAgbmctbW9kZWw9XCIkY3RybC5uZ01vZGVsXCJcbiAgICAgICAgcGxhY2Vob2xkZXI9XCJ7eyAkY3RybC5wbGFjZWhvbGRlciB8fCAnJyB9fVwiXG4gICAgICAgIGlzLWxvYWRpbmc9XCIkY3RybC5sb2FkaW5nVHlwZXNbJGN0cmwudHlwZV0gIT09IGZhbHNlXCJcbiAgICAgICAgbG9hZGluZy10ZXh0PVwi5q2j5Zyo5Yqg6L295YiX6KGoXCJcbiAgICAgICAgZW1wdHktdGV4dD1cIuaXoOebuOWFs+eUqOaIt+e7hOS/oeaBr1wiXG4gICAgICA+PC9mb3JtLXNlbGVjdD5cbiAgICBgLFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICB0eXBlOiAnQCcsXG4gICAgICBuZ01vZGVsOiAnPScsXG4gICAgICBwbGFjZWhvbGRlcjogJ0AnLFxuICAgICAgbm90SW5MaXN0OiAnPD8nLFxuICAgIH0sXG4gICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnYXBpJywgZnVuY3Rpb24gKCRzY29wZSwgYXBpKSB7XG4gICAgICBjb25zdCAkY3RybCA9IHRoaXM7XG5cbiAgICAgIGxldCB2YWxpZFR5cGVzID0gW107XG4gICAgICBsZXQgbG9hZGVkVHlwZXMgPSB7fTtcbiAgICAgICRjdHJsLmxvYWRpbmdUeXBlcyA9IHt9O1xuICAgICAgJGN0cmwub3B0aW9ucyA9IFtdO1xuXG4gICAgICBjb25zdCBsb2FkRG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFsb2FkZWRUeXBlc1skY3RybC50eXBlXSkgcmV0dXJuO1xuICAgICAgICAkY3RybC5vcHRpb25zID0gbG9hZGVkVHlwZXNbJGN0cmwudHlwZV1cbiAgICAgICAgICAubWFwKGNvbGxlY3Rpb24gPT4gKHsgdmFsdWU6IGNvbGxlY3Rpb24sIHRleHQ6IGNvbGxlY3Rpb24ubmFtZSB9KSlcbiAgICAgICAgICAuZmlsdGVyKGNvbGxlY3Rpb24gPT4gKCRjdHJsLm5vdEluTGlzdCB8fCBbXSkuZXZlcnkoc2hvdWxkTm90ID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzaG91bGROb3QuaWQgIT09IGNvbGxlY3Rpb24udmFsdWUuaWQgfHxcbiAgICAgICAgICAgICAgc2hvdWxkTm90LnR5cGUgIT09IGNvbGxlY3Rpb24udmFsdWUudHlwZTtcbiAgICAgICAgICB9KSk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCB0cmlnZ2VyTG9hZGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHZhbGlkVHlwZXMuaW5kZXhPZigkY3RybC50eXBlKSA9PT0gLTEpIHJldHVybjtcbiAgICAgICAgaWYgKCRjdHJsLmxvYWRpbmdUeXBlc1skY3RybC50eXBlXSkgcmV0dXJuO1xuICAgICAgICBpZiAobG9hZGVkVHlwZXNbJGN0cmwudHlwZV0pIGxvYWREb25lKCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxldCB0eXBlPSAkY3RybC50eXBlO1xuICAgICAgICAgICRjdHJsLmxvYWRpbmdUeXBlc1t0eXBlXSA9IHRydWU7XG4gICAgICAgICAgJGN0cmwub3B0aW9ucyA9IFtdO1xuICAgICAgICAgICRjdHJsLm5nTW9kZWwgPSBudWxsO1xuICAgICAgICAgIGFwaS5tZW1iZXJDb2xsZWN0aW9uLmxpc3RCeVR5cGUodHlwZSkudGhlbihjb2xsZWN0aW9ucyA9PiB7XG4gICAgICAgICAgICAkY3RybC5sb2FkaW5nVHlwZXNbdHlwZV0gPSBmYWxzZTtcbiAgICAgICAgICAgIGxvYWRlZFR5cGVzW3R5cGVdID0gY29sbGVjdGlvbnM7XG4gICAgICAgICAgICBsb2FkRG9uZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgfTtcblxuICAgICAgYXBpLm1lbWJlckNvbGxlY3Rpb24uZ2V0VHlwZXMoKS50aGVuKHR5cGVzID0+IHtcbiAgICAgICAgdmFsaWRUeXBlcyA9IHR5cGVzO1xuICAgICAgICB0cmlnZ2VyTG9hZGluZygpO1xuICAgICAgfSk7XG4gICAgICAkc2NvcGUuJHdhdGNoKCckY3RybC50eXBlJywgdHJpZ2dlckxvYWRpbmcpO1xuICAgICAgJHNjb3BlLiR3YXRjaCgnJGN0cmwubm90SW5MaXN0JywgdHJpZ2dlckxvYWRpbmcpO1xuICAgIH1dLFxuICB9KTtcblxuICAvKlxuICAgKiA8Y29sbGVjdGlvbi1tZW1iZXItdGFibGU+IOaIkOWRmOeuoeeQhuaooeWdl1xuICAgKi9cbiAgZm9ybUlucHV0cy5jb21wb25lbnQoJ2NvbGxlY3Rpb25NZW1iZXJUYWJsZScsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGRpdiBjbGFzcz1cImNvbGxlY3Rpb24tbWVtYmVyLXRhYmxlLWNvbnRhaW5lclwiPlxuICAgICAgICA8Zm9ybS1tdWx0aXBsZS1pbmxpbmUgY29udGVudC10eXBlPVwic2VhcmNoXCI+XG4gICAgICAgICAgPGZvcm0tbXVsdGlwbGUtaW5saW5lLWl0ZW0gY2xhc3M9XCJjb2xsZWN0aW9uLW1lbWJlci1lZGl0LWJ1dHRvbi1jb250YWluZXJcIj5cbiAgICAgICAgICAgIDxmb3JtLWJ1dHRvbi1jb2xsZWN0aW9uPlxuICAgICAgICAgICAgICA8Zm9ybS1pbnB1dC1jaGVja2JveCB2YWx1ZT1cIidNRU1CRVInXCIgdmFsdWUtZmFsc2U9XCJudWxsXCIgbmctbW9kZWw9XCIkY3RybC5hZGRpbmdUeXBlT25lXCIgb24tY2hhbmdlPVwiJGN0cmwuYWRkaW5nVHlwZSA9ICRjdHJsLmFkZGluZ1R5cGVPbmU7ICRjdHJsLmFkZGluZ1R5cGVNdWx0aSA9IG51bGw7ICRjdHJsLmFkZGluZ1Nob3duID0gdHJ1ZTtcIiBuZy1pbml0PVwiJGN0cmwuYWRkaW5nVHlwZU9uZSA9IG51bGxcIiBhcHBlYXJhbmNlPVwiYnV0dG9uXCI+6YCQ5Liq5re75Yqg5oiQ5ZGYPC9mb3JtLWlucHV0LWNoZWNrYm94PlxuICAgICAgICAgICAgICA8Zm9ybS1pbnB1dC1jaGVja2JveCB2YWx1ZT1cIidHUk9VUCdcIiB2YWx1ZS1mYWxzZT1cIm51bGxcIiBuZy1tb2RlbD1cIiRjdHJsLmFkZGluZ1R5cGVNdWx0aVwiIG9uLWNoYW5nZT1cIiRjdHJsLmFkZGluZ1R5cGUgPSAkY3RybC5hZGRpbmdUeXBlTXVsdGk7ICRjdHJsLmFkZGluZ1R5cGVPbmUgPSBudWxsOyAkY3RybC5hZGRpbmdTaG93biA9IHRydWU7XCIgbmctaW5pdD1cIiRjdHJsLmFkZGluZ1R5cGVNdWx0aSA9IG51bGxcIiBhcHBlYXJhbmNlPVwiYnV0dG9uXCI+5om56YeP5a+85YWl5oiQ5ZGYPC9mb3JtLWlucHV0LWNoZWNrYm94PlxuICAgICAgICAgICAgPC9mb3JtLWJ1dHRvbi1jb2xsZWN0aW9uPlxuICAgICAgICAgIDwvZm9ybS1tdWx0aXBsZS1pbmxpbmUtaXRlbT5cbiAgICAgICAgICA8Zm9ybS1tdWx0aXBsZS1pbmxpbmUtaXRlbSBjbGFzcz1cImNvbGxlY3Rpb24tbWVtYmVyLWNvdW50LWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgIOWFsVxuICAgICAgICAgICAgICA8c3BhbiBuZy1zaG93PVwiJGN0cmwuc2VhcmNoVGV4dFwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY29sbGVjdGlvbi1tZW1iZXItY291bnQtZmlsdGVyZWRcIiBuZy1iaW5kPVwiKCgkY3RybC5uZ01vZGVsIHx8IFtdKSB8IGZpbHRlcjp7IG5hbWU6ICRjdHJsLnNlYXJjaFRleHQgfSkubGVuZ3RoXCI+PC9zcGFuPlxuICAgICAgICAgICAgICAgIC9cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNvbGxlY3Rpb24tbWVtYmVyLWNvdW50LXRvdGFsXCIgbmctYmluZD1cIiRjdHJsLm5nTW9kZWwubGVuZ3RoXCI+PC9zcGFuPlxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIOS9jeaIkOWRmFxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvZm9ybS1tdWx0aXBsZS1pbmxpbmUtaXRlbT5cbiAgICAgICAgICA8Zm9ybS1tdWx0aXBsZS1pbmxpbmUtaXRlbSBjbGFzcz1cImNvbGxlY3Rpb24tbWVtYmVyLXNlYXJjaC1jb250YWluZXJcIj5cbiAgICAgICAgICAgIDxmb3JtLXNlYXJjaC1ib3ggbmctaW5pdD1cIiRjdHJsLnNlYXJjaFRleHQgPSAnJ1wiIG5nLW1vZGVsPVwiJGN0cmwuc2VhcmNoVGV4dFwiIHBsYWNlaG9sZGVyPVwi5pCc57Si6aG555uu5oiQ5ZGYXCI+PC9mb3JtLXNlYXJjaC1ib3g+XG4gICAgICAgICAgPC9mb3JtLW11bHRpcGxlLWlubGluZS1pdGVtPlxuICAgICAgICA8L2Zvcm0tbXVsdGlwbGUtaW5saW5lPlxuICAgICAgICA8Zm9ybS1oZWxwLWxpbmUgbmctaWY9XCIkY3RybC5oZWxwVGV4dFwiPlxuICAgICAgICAgIDxpY29uLWluZm8+PC9pY29uLWluZm8+IDxzcGFuIG5nLWJpbmQ9XCIkY3RybC5oZWxwVGV4dFwiPjwvc3Bhbj5cbiAgICAgICAgPC9mb3JtLWhlbHAtbGluZT5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbGxlY3Rpb24tbWVtYmVyLWFkZGluZy1wYW5lbFwiIG5nLXNob3c9XCIkY3RybC5hZGRpbmdUeXBlXCIgbmctaWY9XCIkY3RybC5hZGRpbmdTaG93blwiPlxuICAgICAgICAgIDxmb3JtLW11bHRpcGxlLWlubGluZSBhbGdpbj1cImxlZnRcIj5cbiAgICAgICAgICAgIDxmb3JtLW11bHRpcGxlLWlubGluZS1pdGVtIGNsYXNzPVwiY29sbGVjdGlvbi1tZW1iZXItZ3JvdXAtdHlwZS1zZWxlY3Rvci1jb250YWluZXJcIiBuZy1zaG93PVwiJGN0cmwuYWRkaW5nVHlwZSA9PT0gJ0dST1VQJ1wiPlxuICAgICAgICAgICAgICA8c2NyaXB0IGlkPVwiY29sbGVjdGlvbk1lbWJlclR5cGVUZW1wbGF0ZVwiIHR5cGU9XCJ0ZXh0L25nLXRlbXBsYXRlXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gbmctYmluZD1cIm9wdGlvbi50ZXh0XCI+PC9zcGFuPlxuICAgICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgICAgPGZvcm0tc2VsZWN0XG4gICAgICAgICAgICAgICAgY2xhc3M9XCJjb2xsZWN0aW9uLW1lbWJlci10eXBlLXJhZGlvXCJcbiAgICAgICAgICAgICAgICBvcHRpb25zPVwiW1xuICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ1BST0pFQ1RfQ09MTEVDVElPTicsIHRleHQ6ICflr7zlhaXpobnnm67miJDlkZgnIH0sXG4gICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnREVQTE9ZX0NPTExFQ1RJT04nLCB0ZXh0OiAn5a+85YWl5pyN5Yqh5oiQ5ZGYJyB9LFxuICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0NMVVNURVInLCB0ZXh0OiAn5a+85YWl6ZuG576k5oiQ5ZGYJyB9LFxuICAgICAgICAgICAgICAgIF1cIlxuICAgICAgICAgICAgICAgIG5nLW1vZGVsPVwiJGN0cmwuZ3JvdXBUeXBlXCJcbiAgICAgICAgICAgICAgICBuZy1pbml0PVwiJGN0cmwuZ3JvdXBUeXBlID0gJ1BST0pFQ1RfQ09MTEVDVElPTidcIlxuICAgICAgICAgICAgICAgIHNob3ctc2VhcmNoLWlucHV0PVwibmV2ZXJcIlxuICAgICAgICAgICAgICAgIGNhcmQtdGVtcGxhdGU9XCJjb2xsZWN0aW9uTWVtYmVyVHlwZVRlbXBsYXRlXCJcbiAgICAgICAgICAgICAgPjwvZm9ybS1pbnB1dC1yYWRpby1ncm91cD5cbiAgICAgICAgICAgIDwvZm9ybS1tdWx0aXBsZS1pbmxpbmUtaXRlbT5cbiAgICAgICAgICAgIDxmb3JtLW11bHRpcGxlLWlubGluZS1pdGVtIGNsYXNzPVwiY29sbGVjdGlvbi1tZW1iZXItdXNlcnMtc2VsZWN0b3ItY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgIDxtdWx0aXBsZS11c2VyLXNlbGVjdFxuICAgICAgICAgICAgICAgIG5nLXNob3c9XCIkY3RybC5hZGRpbmdUeXBlID09PSAnTUVNQkVSJ1wiXG4gICAgICAgICAgICAgICAgbmctbW9kZWw9XCIkY3RybC5jaG9zZWRNZW1iZXJMaXN0XCJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIumAieaLqeeUqOaIt+S7pea3u+WKoFwiXG4gICAgICAgICAgICAgID48L211bHRpcGxlLXVzZXItc2VsZWN0PlxuICAgICAgICAgICAgICA8bWVtYmVyLWNvbGxlY3Rpb24tc2VsZWN0XG4gICAgICAgICAgICAgICAgbmctc2hvdz1cIiRjdHJsLmFkZGluZ1R5cGUgPT09ICdHUk9VUCdcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJ7eyAkY3RybC5ncm91cFR5cGUgfX1cIlxuICAgICAgICAgICAgICAgIG5nLW1vZGVsPVwiJGN0cmwuY2hvc2VkR3JvdXBcIlxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwi6YCJ5oupe3sgKHtcbiAgICAgICAgICAgICAgICAgIFBST0pFQ1RfQ09MTEVDVElPTiA6ICfpobnnm64nLFxuICAgICAgICAgICAgICAgICAgREVQTE9ZX0NPTExFQ1RJT04gOiAn5pyN5YqhJyxcbiAgICAgICAgICAgICAgICAgIENMVVNURVIgOiAn6ZuG576kJyxcbiAgICAgICAgICAgICAgICB9KVskY3RybC5ncm91cFR5cGVdIH195Lul5a+85YWlXCJcbiAgICAgICAgICAgICAgICBub3QtaW4tbGlzdD1cIlt7IHR5cGU6ICRjdHJsLmNvbGxlY3Rpb25UeXBlLCBpZDogJGN0cmwuY29sbGVjdGlvbklkIH1dXCJcbiAgICAgICAgICAgICAgPjwvbWVtYmVyLWNvbGxlY3Rpb24tc2VsZWN0PlxuICAgICAgICAgICAgPC9mb3JtLW11bHRpcGxlLWlubGluZS1pdGVtPlxuICAgICAgICAgICAgPGZvcm0tbXVsdGlwbGUtaW5saW5lLWl0ZW0gY2xhc3M9XCJjb2xsZWN0aW9uLW1lbWJlci1yb2xlLXNlbGVjdG9yLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICA8Zm9ybS1zZWxlY3RcbiAgICAgICAgICAgICAgICBuZy1zaG93PVwiJGN0cmwuYWRkaW5nVHlwZSA9PT0gJ01FTUJFUidcIlxuICAgICAgICAgICAgICAgIG9wdGlvbnM9XCJbXG4gICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnTUFTVEVSJywgdGV4dDogJ01BU1RFUicgfSxcbiAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdERVZFTE9QRVInLCB0ZXh0OiAnREVWRUxPUEVSJyB9LFxuICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ1JFUE9SVEVSJywgdGV4dDogJ1JFUE9SVEVSJyB9LFxuICAgICAgICAgICAgICAgIF1cIlxuICAgICAgICAgICAgICAgIG5nLWluaXQ9XCIkY3RybC5hZGRpbmdNZW1iZXJSb2xlID0gJ01BU1RFUidcIlxuICAgICAgICAgICAgICAgIHNob3ctc2VhcmNoLWlucHV0PVwibmV2ZXJcIlxuICAgICAgICAgICAgICAgIG5nLW1vZGVsPVwiJGN0cmwuYWRkaW5nTWVtYmVyUm9sZVwiXG4gICAgICAgICAgICAgID48L2Zvcm0tc2VsZWN0PlxuICAgICAgICAgICAgICA8Zm9ybS1zZWxlY3RcbiAgICAgICAgICAgICAgICBuZy1zaG93PVwiJGN0cmwuYWRkaW5nVHlwZSAhPT0gJ01FTUJFUidcIlxuICAgICAgICAgICAgICAgIG9wdGlvbnM9XCJbXG4gICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnTUFTVEVSJywgdGV4dDogJ01BU1RFUicgfSxcbiAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdERVZFTE9QRVInLCB0ZXh0OiAnREVWRUxPUEVSJyB9LFxuICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ1JFUE9SVEVSJywgdGV4dDogJ1JFUE9SVEVSJyB9LFxuICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0RFRkFVTFQnLCB0ZXh0OiAn5L+d55WZ57uE5YaF5p2D6ZmQ6K6+572uJyB9LFxuICAgICAgICAgICAgICAgIF1cIlxuICAgICAgICAgICAgICAgIG5nLWluaXQ9XCIkY3RybC5hZGRpbmdHcm91cFJvbGUgPSAnREVGQVVMVCdcIlxuICAgICAgICAgICAgICAgIHNob3ctc2VhcmNoLWlucHV0PVwibmV2ZXJcIlxuICAgICAgICAgICAgICAgIG5nLW1vZGVsPVwiJGN0cmwuYWRkaW5nR3JvdXBSb2xlXCJcbiAgICAgICAgICAgICAgPjwvZm9ybS1zZWxlY3Q+XG4gICAgICAgICAgICA8L2Zvcm0tbXVsdGlwbGUtaW5saW5lLWl0ZW0+XG4gICAgICAgICAgICA8Zm9ybS1tdWx0aXBsZS1pbmxpbmUtaXRlbSBjbGFzcz1cImNvbGxlY3Rpb24tbWVtYmVyLWFkZC1idXR0b24tY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJjb2xsZWN0aW9uLW1lbWJlci1uZXctYnV0dG9uXCIgdHlwZT1cImJ1dHRvblwiIG5nLWNsaWNrPVwiJGN0cmwuYWRkTWVtYmVyKClcIiBuZy1iaW5kPVwiJGN0cmwuYWRkaW5nVHlwZSA9PT0gJ01FTUJFUicgPyAn5re75YqgJyA6ICflr7zlhaUnXCI+PC9idXR0b24+XG4gICAgICAgICAgICA8L2Zvcm0tbXVsdGlwbGUtaW5saW5lLWl0ZW0+XG4gICAgICAgICAgPC9mb3JtLW11bHRpcGxlLWlubGluZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxzY3JpcHQgaWQ9XCJjb2xsZWN0aW9uTWVtYmVyVGFibGVUZW1wbGF0ZVwiIHR5cGU9XCJ0ZXh0L25nLXRlbXBsYXRlXCI+XG4gICAgICAgICAgPGRpdiBuZy1pZj1cImVkaXQgJiYgY29sdW1uLmtleSA9PT0gJ3JvbGUnXCI+XG4gICAgICAgICAgICA8Zm9ybS1zZWxlY3RcbiAgICAgICAgICAgICAgbmctbW9kZWw9XCJyb3cucm9sZVwiXG4gICAgICAgICAgICAgIG9wdGlvbnM9XCJbXG4gICAgICAgICAgICAgICAge3ZhbHVlOiAnTUFTVEVSJywgdGV4dDogJ01BU1RFUid9LFxuICAgICAgICAgICAgICAgIHt2YWx1ZTogJ0RFVkVMT1BFUicsIHRleHQ6ICdERVZFTE9QRVInfSxcbiAgICAgICAgICAgICAgICB7dmFsdWU6ICdSRVBPUlRFUicsIHRleHQ6ICdSRVBPUlRFUid9XG4gICAgICAgICAgICAgIF1cIlxuICAgICAgICAgICAgICBzaG93LXNlYXJjaC1pbnB1dD1cIm5ldmVyXCJcbiAgICAgICAgICAgID48L2Zvcm0tc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgbmctaWY9XCIhZWRpdCB8fCBjb2x1bW4ua2V5ICE9PSAncm9sZSdcIj5cbiAgICAgICAgICAgIDxkaXYgbmctYmluZD1cInZhbHVlXCI+PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2NyaXB0PlxuICAgICAgICA8Zm9ybS10YWJsZVxuICAgICAgICAgIGNsYXNzPVwiY29sbGVjdGlvbi1tZW1iZXItdGFibGVcIlxuICAgICAgICAgIG5nLW1vZGVsPVwiJGN0cmwudmFsdWVcIlxuICAgICAgICAgIGNvbHVtbnM9XCJbe3RleHQ6ICfmiJDlkZgnLCBrZXk6ICduYW1lJ30sIHt0ZXh0OiAn57uE5YaF6KeS6ImyJywga2V5OiAncm9sZSd9XVwiXG4gICAgICAgICAgdGVtcGxhdGU9XCJjb2xsZWN0aW9uTWVtYmVyVGFibGVUZW1wbGF0ZVwiXG4gICAgICAgICAgZmlsdGVyPVwieyBuYW1lOiAkY3RybC5zZWFyY2hUZXh0IH1cIlxuICAgICAgICAgIGVtcHR5LXRleHQ9XCJ7eyAkY3RybC5sb2FkaW5nID8gJ+ato+WcqOiOt+WPluaIkOWRmOWIl+ihqO+8jOivt+eojeWAmScgOiAoJGN0cmwuc2VhcmNoVGV4dCA/ICfml6DljLnphY3miJDlkZjkv6Hmga8nIDogJ+aXoOaIkOWRmOS/oeaBrycpIH19XCJcbiAgICAgICAgICBlZGl0ZWQtZGF0YT1cIiRjdHJsLmVkaXRlZERhdGFcIlxuICAgICAgICAgIG9uLXNhdmU9XCIkY3RybC51cGRhdGVVc2VyUm9sZShkYXRhKVwiXG4gICAgICAgICAgb24tZGVsZXRlPVwiJGN0cmwucmVtb3ZlVXNlcihkYXRhKVwiXG4gICAgICAgICAgbm8tZWRpdD1cIiRjdHJsLm5vRWRpdFwiXG4gICAgICAgICAgbm8tZGVsZXRlPVwiJGN0cmwubm9EZWxldGVcIlxuICAgICAgICA+PC9mb3JtLXRhYmxlPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29sbGVjdGlvbi1tZW1iZXItbG9hZGluZy1jb3ZlclwiIG5nLXNob3c9XCIkY3RybC5sb2FkaW5nXCI+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgbmdNb2RlbDogJz0/JyxcbiAgICAgIGNvbGxlY3Rpb25UeXBlOiAnPD8nLFxuICAgICAgY29sbGVjdGlvbklkOiAnPD8nLFxuICAgICAgb25Ob1Blcm1pc3Npb246ICcmPycsXG4gICAgICBvblJvbGVDaGFuZ2U6ICcmJyxcbiAgICAgIGhlbHBUZXh0OiAnQCcsXG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICdhcGknLCAnJGRvbWVQdWJsaWMnLCBmdW5jdGlvbiAoJHNjb3BlLCBhcGksICRkb21lUHVibGljKSB7XG4gICAgICBjb25zdCAkY3RybCA9IHRoaXM7XG4gICAgICBjb25zdCBlcnJNc2dCb3ggPSBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICAkZG9tZVB1YmxpYy5vcGVuV2FybmluZyh7XG4gICAgICAgICAgdGl0bGU6ICfmk43kvZzlpLHotKUnLFxuICAgICAgICAgIG1zZzogdGV4dFxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICAkY3RybC5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAkY3RybC51c2VyUm9sZSA9IG51bGw7XG5cbiAgICAgIGNvbnN0IHJvbGVzID0gWydNQVNURVInLCAnREVWRUxPUEVSJywgJ1JFUE9SVEVSJywgJ0dVRVNUJ107XG4gICAgICBjb25zdCByb2xlTGV2ZWwgPSByb2xlID0+IChyb2xlcy5pbmRleE9mKHJvbGUpICsgMSkgfHwgcm9sZXMubGVuZ3RoO1xuICAgICAgY29uc3QgZG93bmdyYWRlT3duUm9sZU5lZWRDb25maXJtID0gZnVuY3Rpb24gKG5ld1JvbGUpIHtcbiAgICAgICAgbGV0IHdhcm5pbmdUZXh0ID0gbnVsbDtcbiAgICAgICAgaWYgKG5ld1JvbGUpIHdhcm5pbmdUZXh0ID0gYOaCqOWwhuimgeaKiuiHquW3seeahOadg+mZkOmZjeS9juS4uiR7bmV3Um9sZX3vvIzkv67mlLnlkI7mgqjlj6/og73ml6Dms5Xnu6fnu63nvJbovpHmiJDlkZjkv6Hmga/miJbmiafooYzpg6jliIbnrqHnkIbmk43kvZzvvIznoa7orqTopoHnu6fnu63lkJfvvJ9gO1xuICAgICAgICBlbHNlIHdhcm5pbmdUZXh0ID0gJ+aCqOWwhuimgeaKiuiHquW3seS7juaIkOWRmOWIl+ihqOS4reWIoOmZpO+8jOWIoOmZpOWQjuaCqOWwhuS4jeiDvee7p+e7reiuv+mXruebuOWFs+i1hOa6kO+8jOehruiupOimgee7p+e7reWQl++8nyc7XG4gICAgICAgIHJldHVybiBhcGkuU2ltcGxlUHJvbWlzZS5yZXNvbHZlKCRkb21lUHVibGljLm9wZW5Db25maXJtKHdhcm5pbmdUZXh0KSk7XG4gICAgICB9O1xuICAgICAgY29uc3QgZGVsZXRlTWVtYmVyQ29uZmlybSA9IGZ1bmN0aW9uICh1c2VybmFtZSkge1xuICAgICAgICByZXR1cm4gYXBpLlNpbXBsZVByb21pc2UucmVzb2x2ZSgkZG9tZVB1YmxpYy5vcGVuQ29uZmlybShg5oKo5bCG6KaB5oqKJHt1c2VybmFtZX3ku47miJDlkZjliJfooajkuK3liKDpmaTvvIznoa7orqTopoHnu6fnu63lkJfvvJ9gKSk7XG4gICAgICB9O1xuXG4gICAgICAvLyDmt7vliqDmiJDlkZhcbiAgICAgICRjdHJsLmFkZE1lbWJlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCEkY3RybC5jdXJyZW50Q29sbGVjdGlvbikgcmV0dXJuO1xuICAgICAgICBsZXQgbWVtYmVyR2V0dGVyO1xuICAgICAgICBpZiAoJGN0cmwuYWRkaW5nVHlwZSA9PT0gJ01FTUJFUicpIHtcbiAgICAgICAgICBpZiAoISRjdHJsLmNob3NlZE1lbWJlckxpc3QgfHwgISRjdHJsLmNob3NlZE1lbWJlckxpc3QubGVuZ3RoKSByZXR1cm47XG4gICAgICAgICAgbGV0IG5ld01lbWJlcnMgPSAkY3RybC5jaG9zZWRNZW1iZXJMaXN0XG4gICAgICAgICAgICAubWFwKHVzZXIgPT4gKHsgaWQ6IHVzZXIuaWQsIHJvbGU6ICRjdHJsLmFkZGluZ01lbWJlclJvbGUgfSkpO1xuICAgICAgICAgIG1lbWJlckdldHRlciA9IGFwaS5TaW1wbGVQcm9taXNlLnJlc29sdmUobmV3TWVtYmVycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCEkY3RybC5jaG9zZWRHcm91cCkgcmV0dXJuO1xuICAgICAgICAgIG1lbWJlckdldHRlciA9IGFwaS5tZW1iZXJDb2xsZWN0aW9uLmdldCgkY3RybC5jaG9zZWRHcm91cCk7XG4gICAgICAgICAgaWYgKCRjdHJsLmFkZGluZ0dyb3VwUm9sZSAhPT0gJ0RFRkFVTFQnKSB7XG4gICAgICAgICAgICBtZW1iZXJHZXR0ZXIgPSBtZW1iZXJHZXR0ZXIudGhlbih1c2VyTGlzdCA9PiB7XG4gICAgICAgICAgICAgIHVzZXJMaXN0LmZvckVhY2godXNlciA9PiB7IHVzZXIucm9sZSA9ICRjdHJsLmFkZGluZ0dyb3VwUm9sZTsgfSk7XG4gICAgICAgICAgICAgIHJldHVybiB1c2VyTGlzdDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAkY3RybC5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgbWVtYmVyR2V0dGVyXG4gICAgICAgICAgLnRoZW4odXNlckxpc3QgPT4gYXBpLm1lbWJlckNvbGxlY3Rpb24uYWRkKCRjdHJsLmN1cnJlbnRDb2xsZWN0aW9uLCB1c2VyTGlzdCkpXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgJGN0cmwuY2hvc2VkTWVtYmVyTGlzdCA9IFtdO1xuICAgICAgICAgICAgJGN0cmwuY2hvc2VkR3JvdXAgPSB2b2lkIDA7XG4gICAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgZXJyTXNnQm94KGVycm9yLm1lc3NhZ2UgfHwgJ+a3u+WKoOeUqOaIt+aXtuWPkeeUn+mUmeivrycpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGVycm9yID0+IHsgIGVyck1zZ0JveChlcnJvci5tZXNzYWdlIHx8ICfojrflj5bnu4TmiJDlkZjml7blj5HnlJ/plJnor68nKTsgfSlcbiAgICAgICAgICAudGhlbigoKSA9PiBmZXRjaENvbGxlY3Rpb25JbmZvKCkpXG4gICAgICAgICAgLnRoZW4oKCkgPT4geyAkY3RybC5sb2FkaW5nID0gZmFsc2U7IH0pO1xuICAgICAgfTtcblxuICAgICAgLy8g5L+u5pS55p2D6ZmQXG4gICAgICAkY3RybC51cGRhdGVVc2VyUm9sZSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICRjdHJsLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICBsZXQgY29uZmlybSA9IG51bGw7XG4gICAgICAgIGlmIChkYXRhLmlkID09PSAkY3RybC5teUluZm8uaWQgJiYgcm9sZUxldmVsKGRhdGEucm9sZSkgPiByb2xlTGV2ZWwoJGN0cmwudXNlclJvbGUpICYmICEkY3RybC5teUluZm8uaXNBZG1pbikge1xuICAgICAgICAgIGNvbmZpcm0gPSBkb3duZ3JhZGVPd25Sb2xlTmVlZENvbmZpcm0oZGF0YS5yb2xlKTtcbiAgICAgICAgfSBlbHNlIGNvbmZpcm0gPSBhcGkuU2ltcGxlUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIGNvbmZpcm1cbiAgICAgICAgICAudGhlbigoKSA9PiBhcGkubWVtYmVyQ29sbGVjdGlvbi5tb2RpZnkoJGN0cmwuY3VycmVudENvbGxlY3Rpb24sIGRhdGEpLCAoKSA9PiB7fSlcbiAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4geyBlcnJNc2dCb3goZXJyb3IubWVzc2FnZSB8fCAn5L+u5pS55p2D6ZmQ5pe25pS+55Sf6ZSZ6K+vJyk7IH0pXG4gICAgICAgICAgLnRoZW4oKCkgPT4gZmV0Y2hDb2xsZWN0aW9uSW5mbygpKVxuICAgICAgICAgIC50aGVuKCgpID0+IHsgJGN0cmwubG9hZGluZyA9IGZhbHNlOyB9KTtcbiAgICAgIH07XG5cbiAgICAgIC8vIOWIoOmZpOeUqOaIt1xuICAgICAgJGN0cmwucmVtb3ZlVXNlciA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICRjdHJsLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICBsZXQgY29uZmlybSA9IG51bGw7XG4gICAgICAgIGlmIChkYXRhLmlkID09PSAkY3RybC5teUluZm8uaWQgJiYgISRjdHJsLm15SW5mby5pc0FkbWluKSB7XG4gICAgICAgICAgY29uZmlybSA9IGRvd25ncmFkZU93blJvbGVOZWVkQ29uZmlybSgpO1xuICAgICAgICB9IGVsc2UgY29uZmlybSA9IGRlbGV0ZU1lbWJlckNvbmZpcm0oZGF0YS5uYW1lKTtcbiAgICAgICAgY29uZmlybVxuICAgICAgICAgIC50aGVuKCgpID0+IGFwaS5tZW1iZXJDb2xsZWN0aW9uLmRlbGV0ZSgkY3RybC5jdXJyZW50Q29sbGVjdGlvbiwgZGF0YSksICgpID0+IHt9KVxuICAgICAgICAgIC5jYXRjaChlcnJvciA9PiB7IGVyck1zZ0JveChlcnJvci5tZXNzYWdlIHx8ICfliKDpmaTnlKjmiLfml7blj5HnlJ/plJnor68nKTsgfSlcbiAgICAgICAgICAudGhlbigoKSA9PiBmZXRjaENvbGxlY3Rpb25JbmZvKCkpXG4gICAgICAgICAgLnRoZW4oKCkgPT4geyAkY3RybC5sb2FkaW5nID0gZmFsc2U7IH0pO1xuICAgICAgfTtcblxuICAgICAgJGN0cmwubmdNb2RlbCA9IHt9O1xuICAgICAgJGN0cmwudmFsdWUgPSBbXTtcbiAgICAgICRjdHJsLm5vRWRpdCA9IFtdO1xuICAgICAgJGN0cmwubm9EZWxldGUgPSBbXTtcbiAgICAgICRjdHJsLmVkaXRlZERhdGEgPSB7fTtcblxuICAgICAgY29uc3QgdXBkYXRlQ29sbGVjdGlvbkluZm8gPSBmdW5jdGlvbiAobWVtYmVycywgbWUsIHJvbGUpIHtcbiAgICAgICAgJGN0cmwubmdNb2RlbCA9IG1lbWJlcnM7XG5cbiAgICAgICAgJGN0cmwubm9FZGl0ID0gW107XG4gICAgICAgICRjdHJsLm5vRGVsZXRlID0gW107XG4gICAgICAgIC8vIOmdniBNQVNURVIg5Y+q6IO95Yig5o6J6Ieq5bexXG4gICAgICAgIGlmIChyb2xlICE9PSAnTUFTVEVSJykge1xuICAgICAgICAgICRjdHJsLm5vRWRpdCA9IG1lbWJlcnMuc2xpY2UoMCk7XG4gICAgICAgICAgJGN0cmwubm9EZWxldGUgPSBtZW1iZXJzLmZpbHRlcih1c2VyID0+IHVzZXIuaWQgIT09IG1lLmlkKTtcbiAgICAgICAgfVxuICAgICAgICAvLyDmnIDlkI7kuIDkuKogTUFTVEVSIOS4jeiDveiiq+WIoOmZpFxuICAgICAgICBsZXQgbWFzdGVyTGlzdCA9IG1lbWJlcnMuZmlsdGVyKHVzZXIgPT4gdXNlci5yb2xlID09PSAnTUFTVEVSJyk7XG4gICAgICAgIGlmIChtYXN0ZXJMaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICRjdHJsLm5vRWRpdC5wdXNoKG1hc3Rlckxpc3RbMF0pO1xuICAgICAgICAgICRjdHJsLm5vRGVsZXRlLnB1c2gobWFzdGVyTGlzdFswXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmm7TmlrDooajkv6Hmga/kvYbkv53nlZnnvJbovpHnirbmgIFcbiAgICAgICAgbGV0IG9sZEVkaXRlZERhdGFCeUlkID0ge30sIG9sZFZhbHVlQnlJZCA9IHt9O1xuICAgICAgICBsZXQgbmV3VmFsdWUgPSBhbmd1bGFyLmNvcHkobWVtYmVycyk7XG4gICAgICAgIE9iamVjdC5rZXlzKCRjdHJsLmVkaXRlZERhdGEpLmZvckVhY2goaSA9PiB7XG4gICAgICAgICAgbGV0IGRhdGEgPSAkY3RybC5lZGl0ZWREYXRhW2ldO1xuICAgICAgICAgIG9sZEVkaXRlZERhdGFCeUlkW2RhdGEuaWRdID0gZGF0YTtcbiAgICAgICAgICBvbGRWYWx1ZUJ5SWRbZGF0YS5pZF0gPSAkY3RybC52YWx1ZVtpXTtcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBuZXdFZGl0ZWREYXRhID0ge307XG4gICAgICAgIG1lbWJlcnMuZm9yRWFjaCgodXNlciwgaW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAob2xkRWRpdGVkRGF0YUJ5SWRbdXNlci5pZF0pIHtcbiAgICAgICAgICAgIG5ld0VkaXRlZERhdGFbaW5kZXhdID0gdXNlcjtcbiAgICAgICAgICAgIG5ld1ZhbHVlW2luZGV4XSA9IG9sZFZhbHVlQnlJZFt1c2VyLmlkXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAkY3RybC52YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICAkY3RybC5lZGl0ZWREYXRhID0gbmV3RWRpdGVkRGF0YTtcbiAgICAgIH07XG5cbiAgICAgIC8vIOiOt+WPluW9k+WJjeeahOeKtuaAgVxuICAgICAgJGN0cmwuY3VycmVudENvbGxlY3Rpb24gPSBudWxsO1xuICAgICAgY29uc3QgZmV0Y2hDb2xsZWN0aW9uSW5mbyA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uKSB7XG4gICAgICAgIGlmIChjb2xsZWN0aW9uID09IG51bGwpIGNvbGxlY3Rpb24gPSAkY3RybC5jdXJyZW50Q29sbGVjdGlvbjtcbiAgICAgICAgbGV0IGdldFJvbGUgPSBhcGkubWVtYmVyQ29sbGVjdGlvbi5teVJvbGUoY29sbGVjdGlvbik7XG4gICAgICAgIGxldCBnZXRNeUluZm8gPSBhcGkudXNlci53aG9hbWkoKTtcbiAgICAgICAgbGV0IGdldE1lbWJlciA9IGFwaS5tZW1iZXJDb2xsZWN0aW9uLmdldChjb2xsZWN0aW9uKTtcblxuICAgICAgICBnZXRSb2xlLnRoZW4ocm9sZSA9PiB7ICRjdHJsLnVzZXJSb2xlID0gcm9sZTsgJGN0cmwub25Sb2xlQ2hhbmdlKHsgcm9sZSB9KTsgfSk7XG4gICAgICAgIGdldE15SW5mby50aGVuKG1lID0+IHsgJGN0cmwubXlJbmZvID0gbWU7IH0pO1xuXG4gICAgICAgIHJldHVybiBhcGkuU2ltcGxlUHJvbWlzZS5hbGwoWyBnZXRNZW1iZXIsIGdldE15SW5mbywgZ2V0Um9sZSBdKS50aGVuKChbIG1lbWJlcnMsIG1lLCByb2xlIF0pID0+IHtcbiAgICAgICAgICBpZiAoY29sbGVjdGlvbi5pZCAhPT0gJGN0cmwuY29sbGVjdGlvbklkKSByZXR1cm47XG4gICAgICAgICAgaWYgKGNvbGxlY3Rpb24udHlwZSAhPT0gJGN0cmwuY29sbGVjdGlvblR5cGUpIHJldHVybjtcbiAgICAgICAgICAkY3RybC5jdXJyZW50Q29sbGVjdGlvbiA9IGNvbGxlY3Rpb247XG4gICAgICAgICAgdXBkYXRlQ29sbGVjdGlvbkluZm8obWVtYmVycywgbWUsIHJvbGUpO1xuICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgcmV0dXJuIGdldFJvbGUudGhlbihyb2xlID0+IHtcbiAgICAgICAgICAgIGlmIChyb2xlID09PSAnR1VFU1QnICYmICRjdHJsLm9uTm9QZXJtaXNzaW9uKSAkY3RybC5vbk5vUGVybWlzc2lvbigpO1xuICAgICAgICAgICAgZWxzZSB0aHJvdyBlcnJvcjtcbiAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICBlcnJNc2dCb3goZXJyb3IubWVzc2FnZSB8fCAn6I635Y+W5oiQ5ZGY5L+h5oGv5pe25Y+R55Sf6ZSZ6K+vJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgLy8g5aSE55CGIGNvbGxlY3Rpb24g5L+h5oGv5Yid5aeL5YyW5oiW5oyH5a6a55qEIGNvbGxlY3Rpb24g5Y+R55Sf5Y+Y5YyW55qE5oOF5Ya1XG4gICAgICBjb25zdCBpbml0aWFsQ3VycmVudENvbGxlY3Rpb24gPSBmdW5jdGlvbiAoY29sbGVjdGlvbikge1xuICAgICAgICBjbGVhckN1cnJlbnRDb2xsZWN0aW9uKCk7XG4gICAgICAgIHJldHVybiBmZXRjaENvbGxlY3Rpb25JbmZvKGNvbGxlY3Rpb24pO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGNsZWFyQ3VycmVudENvbGxlY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRjdHJsLm5nTW9kZWwgPSAodm9pZCAwKTtcbiAgICAgICAgJGN0cmwuY3VycmVudENvbGxlY3Rpb24gPSBudWxsO1xuICAgICAgICAkY3RybC5yb2xlID0gbnVsbDtcbiAgICAgICAgJGN0cmwuZWRpdGVkRGF0YSA9IHt9O1xuICAgICAgICByZXR1cm4gYXBpLlNpbXBsZVByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGlucHV0Q29sbGVjdGlvbkluZm8gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxldCBjdXJyZW50Q29sbGVjdGlvbjtcbiAgICAgICAgaWYgKCEkY3RybC5jb2xsZWN0aW9uVHlwZSB8fCAhJGN0cmwuY29sbGVjdGlvbklkKSBjdXJyZW50Q29sbGVjdGlvbiA9IG51bGw7XG4gICAgICAgIGN1cnJlbnRDb2xsZWN0aW9uID0geyB0eXBlOiAkY3RybC5jb2xsZWN0aW9uVHlwZSwgaWQ6ICRjdHJsLmNvbGxlY3Rpb25JZCB9O1xuICAgICAgICBsZXQgbG9hZENvbGxlY3Rpb247XG4gICAgICAgIGlmIChjdXJyZW50Q29sbGVjdGlvbikgbG9hZENvbGxlY3Rpb24gPSBpbml0aWFsQ3VycmVudENvbGxlY3Rpb24oY3VycmVudENvbGxlY3Rpb24pO1xuICAgICAgICBlbHNlIGxvYWRDb2xsZWN0aW9uID0gY2xlYXJDdXJyZW50Q29sbGVjdGlvbigpO1xuICAgICAgICAkY3RybC5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgbG9hZENvbGxlY3Rpb24udGhlbigoKSA9PiAkY3RybC5sb2FkaW5nID0gZmFsc2UpO1xuICAgICAgfTtcbiAgICAgICRzY29wZS4kd2F0Y2hHcm91cChbJyRjdHJsLmNvbGxlY3Rpb25UeXBlJywgJyRjdHJsLmNvbGxlY3Rpb25JZCddLCBpbnB1dENvbGxlY3Rpb25JbmZvKTtcblxuICAgIH1dLFxuICB9KTtcblxuXG4gIC8qXG4gICAqIOS7peS4i+WMheaLrOWOhuWPsumBl+eVmeS7o+egge+8jOmcgOimgea4heeQhlxuICAgKi9cbiAgLypcbiAgICog6YCJ5oup6ZWc5YOP55qE5LiL5ouJ6I+c5Y2VXG4gICAqL1xuICBmb3JtSW5wdXRzLmNvbXBvbmVudCgnZm9ybVNlbGVjdG9ySW1hZ2UnLCB7XG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgPGRpdiBjbGFzcz1cImNvbS1zZWxlY3QtY29uIGFkZC1taXJyb3JcIiBzZWxlY3QtY29uPlxuICAgICAgICA8aW5wdXQgY2xhc3M9XCJ1aS1pbnB1dC13aGl0ZSB1aS1idG4tc2VsZWN0IGlucHV0LWltYWdlXCJcbiAgICAgICAgICBwbGFjZWhvbGRlcj1cInt7ICRjdHJsLnBsYWNlaG9sZGVyIH19XCIgbmctbW9kZWw9XCJpbWFnZUtleVwiIC8+XG4gICAgICAgIDx1bCBjbGFzcz1cInNlbGVjdC1saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwic2VsZWN0LWl0ZW1cIiBuZy1yZXBlYXQ9XCJpbWFnZSBpbiAkY3RybC5pbWFnZUxpc3QgfCBmaWx0ZXI6IHsgJ2ltYWdlTmFtZSc6IGltYWdlS2V5IH1cIj5cbiAgICAgICAgICAgIDxhIG5nLWNsaWNrPVwiJGN0cmwuY2hvc2VJbWFnZShpbWFnZSlcIj48c3BhbiBuZy1iaW5kPVwiaW1hZ2UuaW1hZ2VOYW1lXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwidHh0LXByb21wdCBwdWxsLXJpZ2h0XCIgbmctYmluZD1cImltYWdlLnJlZ2lzdHJ5XCI+PC9zcGFuPjwvYT5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgb25JbWFnZVNlbGVjdGVkOiAnJicsXG4gICAgICBpbWFnZUxpc3Q6ICc8JyxcbiAgICAgIHBsYWNlaG9sZGVyOiAnPCcsXG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBbZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgJGN0cmwgPSB0aGlzO1xuICAgICAgJGN0cmwuY2hvc2VJbWFnZSA9IGZ1bmN0aW9uIChpbWFnZSkge1xuICAgICAgICAkY3RybC5vbkltYWdlU2VsZWN0ZWQoeyBpbWFnZSB9KTtcbiAgICAgIH07XG4gICAgfV0sXG4gIH0pO1xuXG4gIGZvcm1JbnB1dHMuY29tcG9uZW50KCdmb3JtU2VsZWN0b3JQcm9qZWN0SW1hZ2UnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgIDxmb3JtLXNlbGVjdG9yLWltYWdlXG4gICAgICAgIG9uLWltYWdlLXNlbGVjdGVkPVwiJGN0cmwuc3ViT25JbWFnZVNlbGVjdGVkKGltYWdlKVwiXG4gICAgICAgIGltYWdlLWxpc3Q9XCIkY3RybC5pbWFnZUxpc3RcIlxuICAgICAgICBwbGFjZWhvbGRlcj1cIiRjdHJsLnBsYWNlaG9sZGVyXCJcbiAgICAgID48L2Zvcm0tc2VsZWN0b3ItaW1hZ2U+XG4gICAgYCxcbiAgICBiaW5kaW5nczoge1xuICAgICAgb25JbWFnZVNlbGVjdGVkOiAnJicsXG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBbJyRodHRwJywgZnVuY3Rpb24gKCRodHRwKSB7XG4gICAgICBjb25zdCAkY3RybCA9IHRoaXM7XG4gICAgICAkY3RybC5wbGFjZWhvbGRlciA9ICfpgInmi6nplZzlg48nO1xuICAgICAgJGN0cmwuaW1hZ2VMaXN0ID0gW107XG4gICAgICAkaHR0cC5nZXQoJy9hcGkvaW1hZ2UnKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgbGV0IGltYWdlTGlzdCA9IHJlcy5kYXRhLnJlc3VsdCB8fCBbXTtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoJGN0cmwuaW1hZ2VMaXN0LCBpbWFnZUxpc3QpO1xuICAgICAgfSk7XG4gICAgICAkY3RybC5zdWJPbkltYWdlU2VsZWN0ZWQgPSBmdW5jdGlvbiAoaW1hZ2UpIHtcbiAgICAgICAgJGN0cmwub25JbWFnZVNlbGVjdGVkKHsgaW1hZ2UgfSk7XG4gICAgICB9O1xuICAgIH1dLFxuICB9KTtcblxufSh3aW5kb3cuZm9ybUlucHV0cyA9IHdpbmRvdy5mb3JtSW5wdXRzIHx8IGFuZ3VsYXIubW9kdWxlKCdmb3JtSW5wdXRzJywgWydiYWNrZW5kQXBpJywgJ2RvbWVNb2R1bGUnLCAnbmdTYW5pdGl6ZSddKSkpO1xuIl19
