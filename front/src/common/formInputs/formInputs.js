/* jshint esversion: 6, eqnull: true */
; (function (formInputs) {
  "use strict";
  const genUniqueId = (function () {
    let currentIndex = Date.now();
    let randomText = () => Math.random().toString(36)[4] || '0';
    return () => {
      let text = [...Array(8)].map(randomText).join('').toUpperCase();
      return `AUTO_GENERATED_INDEX_${++currentIndex}_${text}`;
    };
  }());
  const scopedTimeout = function ($timeout, $scope) {
    var promiseList = [];
    $scope.$on('$destory', function () {
      promiseList.forEach(promise => $timeout.cancel(promise));
    });
    return function (callback, ...args) {
      var promise = $timeout.call(this, function () {
        promiseList.splice(index, 1);
        callback.apply(this, arguments);
      }, ...args);
      var index = promiseList.push(promise) - 1;
    };
  };
  const scopedInterval = function ($interval, $scope) {
    return scopedTimeout.apply(this, arguments);
  };
  const cleanUpCollections = function ($scope) {
    var callbacks = [];
    $scope.$on('$destory', function () {
      callbacks.forEach(f => f());
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
    template: `
      <div class="debugger-container" ng-if="$ctrl.debuggerEnabled">
        <span class="debugger-title" style="font-weight: bold" ng-if="$ctrl.text" ng-bind="$ctrl.text"></span>
        <span class="debugger-content" ng-bind="$ctrl.result"></span>
      </div>
    `,
    bindings: {
      text: '@',
      value: '<?',
    },
    controller: ['$scope', function ($scope) {
      const $ctrl = this;
      $ctrl.debuggerEnabled = ['localhost', '127.0.0.1'].indexOf(location.hostname) !== -1 || !!localStorage.debuggerEnabled;
      let tosource = (function () {
        /* jshint -W034 */
        "use strict";
        /* jshint +W034 */
        if ('uneval' in window) return window.uneval;
        let helper = function uneval(obj, parents) {
          try {
            if (obj === void 0) return '(void 0)';
            if (obj === null) return 'null';
            if (obj == null) throw 'not support undetectable';
            if (obj === 0 && 1 / obj === -Infinity) return '-0';
            if (typeof obj === 'number') return Number.prototype.toString.call(obj);
            if (typeof obj === 'boolean') return Boolean.prototype.toString.call(obj);
            if (typeof obj === 'string') return JSON.stringify(obj);
            if (typeof obj === 'symbol') throw 'symbol not supported';
            if (!(obj instanceof Object)) throw 'not supported type';
            if (obj instanceof Number) return `(new Number(${uneval(Number.prototype.valueOf.call(obj))}))`;
            if (obj instanceof String) return `(new String(${uneval(String.prototype.valueOf.call(obj))}))`;
            if (obj instanceof Boolean) return `(new Boolean(${uneval(Boolean.prototype.valueOf.call(obj))}))`;
            if (obj instanceof RegExp) return obj.toString();
            if (obj instanceof Date) return `(new Date(${uneval(Date.prototype.valueOf(obj))}))`;
            if (obj instanceof Error) return `(new Error(${uneval(obj.message)}))`;
            if (obj instanceof Symbol) throw 'symbol not supported';
            if (obj instanceof Function) {
              let str = '' + obj;
              let isNative = !!str.replace(/\s/g, '').match(/function[^(]*\(\)\{\[nativecode\]\}/);
              if (isNative) return '(function () { "native ${obj.name} function" })';
              return `(${str})`;
            }
            if (parents.indexOf(obj) !== -1) {
              if (obj instanceof Array) return '[]';
              return '({})';
            }
            let parentsAndMe = parents.concat([obj]);
            if (obj instanceof Array) {
              if (obj.length === 0) return '[]';
              let lastIsHole = !((obj.length - 1) in obj);
              let str = obj.map(o => uneval(o, parentsAndMe)).join(', ');
              return `[${str}${lastIsHole ? ',' : ''}]`;
            }
            if (obj instanceof Object) {
              let keys = Object.keys(obj).filter(k => k[0] !== '$'); // we skip values by angular
              let str = keys.map(k => `${JSON.stringify(k)}: ${uneval(obj[k], parentsAndMe)}`).join(', ');
              return `({${str}})`;
            }
          } catch (e) {
            return `(void ("uneval not supported: ${JSON.stringify(e.message).slice(1)}))`;
          }
        };
        return function (obj) {
          return helper(obj, []);
        };
      }());
      $scope.$watch('$ctrl.value', function () {
        $ctrl.result = tosource($ctrl.value);
      }, true);
    }],
  });
  /*
   * <icon> 用来展示一个小图标
   *
   * 不要直接使用这个模板，请考虑使用定制好的各类图标
   * 如果尚无定制好的图标符合要求，请考虑添加一个
   */
  formInputs.component('icon', {
    template: `
      <i class="
        icon icon16 icon-{{ $ctrl.name || 'custom' }}
        fa icon-fa fa-{{ $ctrl.type }}
        {{ $ctrl.disabled ? 'icon-disabled' : '' }}
      " ng-style="{
        color: $ctrl.disabled ? '#cccccc' : ($ctrl.color || '#777')
      }"></i>
    `,
    bindings: {
      name: '@?',
      type: '@',
      color: '@?',
      disabled: '@?',
    },
    controller: [function () { }],
  });
  /*
   * <icon-group> 用于容纳一组图标
   *
   * 在需要一组图标的时候，用 icon-group 标签包裹他们
   *
   * transclude 包含的图标
   */
  formInputs.component('iconGroup', {
    template: `<div class="icon-group-container" ng-transclude></div>`,
    bindings: {},
    transclude: true,
    controller: [function () { }],
  });
  ; (function () {
    let color = {
      danger: '#f05050',
      active: '#29b6f6',
      gitlab: '#ff9800',
      ok: '#4bd396',
      cancel: '#f05050',
      close: '#777',
      placeholder: '#ddd',
      text: '#777',
      info: '#aaa',
      edit: '#188ae2',
      button: '#fff',
    };
    let buttons = [
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
      { name: 'delete', type: 'trash-o', color: color.danger },
      { name: 'details', type: 'ellipsis-v' },
      { name: 'transfer', type: 'external-link', color: color.active },
      { name: 'stop', type: 'stop', color: color.danger },
      { name: 'info', type: 'info-circle' },
      { name: 'edit', type: 'pencil', color: color.edit },
      { name: 'gitlab', type: 'gitlab', color: color.gitlab },
      { name: 'save', type: 'floppy-o', color: color.ok },
      { name: 'cancel', type: 'times', color: color.cancel },
      { name: 'close', type: 'times', color: color.close },
      { name: 'search', type: 'search', color: color.placeholder },
      { name: 'drop-down', type: 'caret-down', color: color.text },
      { name: 'clipboard', type: 'clipboard' },
      { name: 'download', type: 'download' },
      { name: 'file', type: 'file-text-o', color: color.active },
      { name: 'document', type: 'file-o' },
      { name: 'user', type: 'user-o' },
      { name: 'nav-switch', type: 'bars' },
      { name: 'right-arrow', type: 'angle-right' },
      { name: 'down-arrow', type: 'angle-down' },
      { name: 'list', type: 'list-alt', color: color.active },
      { name: 'plus', type: 'plus'},
      { name: 'setting', type: 'cog'}, //设置，小齿轮
    ];
    let buttonMap = {};
    buttons.forEach((button) => {
      let {name, type, color} = button; buttonMap[name] = button;
      if (color === void 0) color = 'inherit';
      let cammelCaseName = ('icon-' + name)
        .replace(/./g, i => i !== i.toLowerCase() ? '-' + i.toLowerCase() : i)
        .replace(/[-_\s]+(\w)/g, (_, m) => m.toUpperCase());
      let hypenSplitedName = cammelCaseName
        .replace(/./g, i => i !== i.toLowerCase() ? '-' + i.toLowerCase() : i);
      formInputs.component(cammelCaseName, {
        template: `
          <icon name="${hypenSplitedName}" type="${type}" color="${color}" disabled="{{ $ctrl.disabled ? 'disabled' : '' }}"></icon>
        `,
        bindings: { disabled: '@?' },
        controller: [function () { }]
      });
    });
    formInputs.component('iconByName', {
      template: `
        <icon name="icon-{{ $ctrl.name }}" type="{{ $ctrl.type }}" color="{{ $ctrl.color }}" disabled="{{ $ctrl.disabled ? 'disabled' : '' }}"></icon>
      `,
      bindings: { disabled: '@?', name: '@' },
      controller: ['$scope', function ($scope) {
        const $ctrl = this;
        $scope.$watch('$ctrl.name', function () {
          if ($ctrl.name in buttonMap) {
            ({ type: $ctrl.type, color: $ctrl.color } = buttonMap[$ctrl.name]);
          }
        });
      }]
    });
  }());
  formInputs.component('titleLine', {
    template: `
      <div class="title-line">
        <div class="title-container"><h2 class="content-title" ng-bind="$ctrl.text"></h2></div>
        <div class="title-line-remaind" ng-transclude></div>
      </div>
    `,
    transclude: true,
    bindings: {
      text: '@',
      param: '=?',
    },
    controller: [function () {}],
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
    template: `
      <style>
        #{{ $ctrl.uniqueId }} .form-config-item-title  {
          width: {{ $ctrl.leftWidth }}px;
        }
        #{{ $ctrl.uniqueId }} .form-config-item-wrapper {
          max-width: {{ 2 * ($ctrl.leftWidth + $ctrl.requireWidth) + $ctrl.inputMaxWidth }}px;
        }
        #{{ $ctrl.uniqueId }} .form-config-item-wrapper .form-config-item-wrapper {
          padding-right: 0;
        }
        #{{ $ctrl.uniqueId }} .form-config-item {
          padding-left: {{ $ctrl.leftWidth + $ctrl.requireWidth }}px;
          max-width: {{ $ctrl.leftWidth + $ctrl.requireWidth + $ctrl.inputMaxWidth }}px;
        }
      </style>
      <div id="{{ $ctrl.uniqueId }}" class="form-container-inner new-layout" ng-cloak ng-transclude>
      </div>
    `,
    bindings: {
      leftColumnWidth: '@',
    },
    transclude: true,
    controller: ['$scope', function ($scope) {
      const $ctrl = this;
      $ctrl.uniqueId = genUniqueId();
      $ctrl.defaultLeftWidth = 120;
      $ctrl.inputMaxWidth = 880;
      $ctrl.requireWidth = 28; // default is 20
      $scope.$watch('$ctrl.leftColumnWidth', function () {
        // 这里使用 parseInt 是因为旧的接口里这里是形如 “120px” 形式的
        let param = parseInt($ctrl.leftColumnWidth, 10);
        $ctrl.leftWidth = Number.isFinite(param) && param >= 0 ? param : $ctrl.defaultLeftWidth;
      });
    }],
  });
  /*
   * <sub-form-container>
   * 这货应当在 form-input-container 里面出现
   *
   * transclude 内部应当书写一个表单元素
   */
  formInputs.component('subFormContainer', {
    template: `
      <form-container left-column-width="{{ $ctrl.leftColumnWidth }}">
        <div class="sub-form-container" ng-transclude></div>
      </form-container>
    `,
    bindings: {
      leftColumnWidth: '@',
    },
    transclude: true,
    controller: [function () { }],
  });
  /*
   * <form-config-group> 表单 form 中应当仅包含这个元素
   * 这个元素表示一组设置项，一组设置项关系较为紧密（中间没有分割线）
   *
   * transclude 内部应当包含 form-config-item
   */
  formInputs.component('formConfigGroup', {
    template: `
      <div class="form-config-group-inner" ng-transclude>
      </div>
    `,
    bindings: {},
    transclude: true,
    controller: [function () {
    }],
  });
  /*
   * <form-button-group> 表单末尾的按钮行
   */
  formInputs.component('formButtonGroup', {
    template: `
      <div class="form-config-group-inner form-config-button-group-inner" ng-transclude>
      </div>
    `,
    bindings: {},
    transclude: true,
    controller: [function () { }],
  });
  formInputs.component('formButtonCollection', {
    template: `
      <div class="form-button-collection-container" ng-transclude>
      </div>
    `,
    bindings: {},
    transclude: true,
    controller: [function () { }],
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
    template: `
      <div class="form-config-item-wrapper">
        <div class="form-config-item" ng-class="{'form-config-item-required': $ctrl.required}">
          <div class="form-config-item-title" ng-bind="$ctrl.configTitle"></div>
          <div class="form-config-item-content" ng-transclude ng-cloak></div>
        </div>
      </div>
    `,
    bindings: {
      required: '@',
      configTitle: '@',
    },
    transclude: true,
    controller: [function () {
    }],
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
    template: `
      <input type="hidden" ng-if="$ctrl.condition !== undefined" required ng-model="$ctrl.valid" />
      <div class="form-input-error-message" ng-show="
        $ctrl.form && $ctrl.target && (
          $ctrl.form.$submitted &&
          $ctrl.form[$ctrl.target] &&
          $ctrl.form[$ctrl.target].$invalid &&
          $ctrl.form[$ctrl.target].$error &&
          (!$ctrl.type || $ctrl.form[$ctrl.target].$error[$ctrl.type])
        ) ||
        $ctrl.condition && $ctrl.form.$submitted
      " ng-transclude></div>
    `,
    bindings: {
      form: '<?',
      target: '@?',
      type: '@?',
      condition: '<?',
    },
    transclude: true,
    controller: ['$scope', function ($scope) {
      const $ctrl = this;
      $scope.$watch('$ctrl.condition', function () {
        $ctrl.valid = $ctrl.condition === true ? '' : 'valid';
      });
    }],
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
    template: `
      <button type="submit" ng-transclude  ng-disabled="$ctrl.ngDisabled" ng-click=" $ctrl.validThenTriggerSubmit($event) "></button>
    `,
    bindings: {
      form: '<',
      onSubmit: '&',
      ngDisabled:'<',
    },
    transclude: true,
    controller: [function () {
      const $ctrl = this;
      $ctrl.validThenTriggerSubmit = function ($event) {
        $ctrl.form.$setSubmitted();
        angular.forEach($ctrl.form, function(item) {
          if(item && item.$$parentForm === $ctrl.form && item.$setSubmitted) {
              item.$setSubmitted();
          }
          });
        if ($ctrl.form.$invalid) return;
        $ctrl.onSubmit();
        $event.preventDefault();
        $event.stopPropagation();
      };
    }],
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
    controller: [function () { }],
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
    controller: [function () { }],
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
    template: `
      <div class="form-input-container">
        <form-help class="form-input-help-text-top" ng-if="$ctrl.helpText && ($ctrl.helpTextPosition || 'top') === 'top'">{{ $ctrl.helpText }}</form-help>
        <div class="form-input-container-inner" ng-if="!($ctrl.helpText && $ctrl.helpTextPosition === 'right')" ng-transclude></div>
        <div class="form-input-container-inner form-multiple-inline-container" ng-if="($ctrl.helpText && $ctrl.helpTextPosition === 'right')">
          <div class="form-input-container-inner-options form-multiple-inline-item-replacement" ng-transclude></div>
          <form-help class="form-input-help-text-right form-multiple-inline-item-replacement" ng-if="$ctrl.helpText && $ctrl.helpTextPosition === 'right'">{{ $ctrl.helpText }}</form-help>
        </div>
        <form-help class="form-input-help-text-bottom" ng-if="$ctrl.helpText && $ctrl.helpTextPosition === 'bottom'">{{ $ctrl.helpText }}</form-help>
      </div>
    `,
    bindings: {
      helpTextPosition: '@',
      helpText: '@',
    },
    transclude: true,
    controller: [function () {
    }],
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
    template: `
      <div class="form-left-right-container">
        <div class="form-left-right-wrapper">
          <div class="form-left-right-left" ng-style="{ width: $ctrl.leftWidth }" ng-transclude="left"></div>
          <div class="form-left-right-space"></div>
          <div class="form-left-right-right" ng-style="{ width: $ctrl.rightWidth }" ng-transclude="right"></div>
        </div>
      </div>
    `,
    bindings: {
      leftWidth: '@',
      rightWidth: '@',
    },
    transclude: {
      left: 'left',
      right: 'right'
    },
    controller: [function () {
    }],
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
    template: `
      <div
        class="form-multiple-inline-container"
        ng-class="{
          'form-multiple-inline-align-left': $ctrl.align === 'left',
          'from-multiple-inline-for-search': $ctrl.contentType === 'search',
         }"
        ng-transclude
      ></div>
    `,
    bindings: {
      align: '@',
      contentType: '@',
    },
    transclude: true,
    controller: [function () {
    }],
  });
  formInputs.component('formMultipleInlineItem', {
    template: `
      <div class="form-multiple-inline-item-inner"
        ng-transclude></div>
    `,
    bindings: {
      width: '@',
    },
    transclude: true,
    controller: [function () {
    }],
  });
  /*
   * <form-multiple-one-line>
   * 表示一行多个的元素
   *
   */
  formInputs.component('formMultipleOneLine', {
    template: `
      <div class="form-multiple-one-line-container">
        <div class="form-multiple-one-line-wrapper">
        </div>
      </div>
    `,
    bindings: {
      align: '@',
    },
    transclude: true,
    controller: [function () {
    }],
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
    template: `
      <div class="form-with-button-container">
        <form-left-right right-width="{{ $ctrl.width || '120px' }}">
          <left><div class="form-with-button-content" ng-transclude="content"></div></left>
          <right><div class="form-with-button-button" ng-transclude="button"></div></right>
        </form-left-right>
      </div>
    `,
    bindings: {
      width: '@',
    },
    transclude: {
      content: 'contentArea',
      button: 'buttonArea'
    },
    controller: [function () {
    }],
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
    template: `
      <div class="form-input-radio-container" ng-class="{ 'form-input-radio-as-card': $ctrl.cardTemplate }">
        <form-multiple-inline align="{{ $ctrl.width ? 'left' : 'justify' }}">
          <form-multiple-inline-item class="form-input-radio-inner" width="{{ $ctrl.width }}" ng-repeat="option in $ctrl.options">
            <label ng-if="option.value">
              <span class="form-input-radio-option-container" ng-class="{ 'form-input-radio-option-checked': $ctrl.value === option.value }">
                <span class="form-input-radio-wrapper">
                  <input class="form-input-radio" type="radio" name="{{ $ctrl.name }}" value="{{ option.value }}" ng-model="$ctrl.value" ng-required="!$ctrl.value && $ctrl.required" />
                  <span class="form-input-radio-icon"></span>
                </span>
                <span class="form-input-radio-text" ng-bind="option.text" ng-if="!$ctrl.cardTemplate"></span>
                <div class="form-input-radio-card" ng-include="$ctrl.cardTemplate" ng-if="$ctrl.cardTemplate" ng-repeat="item in [option]"></div>
              </span>
            </label>
            <label ng-if="!option.value && !$ctrl.cardTemplate">
              <span class="form-input-radio-option-container" ng-class="{ 'form-input-radio-option-checked': $ctrl.value === $ctrl.customFakeValue }">
                <span class="form-input-radio-wrapper">
                  <input class="form-input-radio" type="radio" name="{{ $ctrl.name }}" value="{{ $ctrl.customFakeValue }}" ng-model="$ctrl.value" ng-required="!$ctrl.value && $ctrl.required" />
                  <span class="form-input-radio-icon"></span>
                </span>
              <input class="form-input-radio-input" type="text" placeholder="{{ option.text }}" ng-model="$ctrl.customValue" ng-change="$ctrl.updateCustom" />
              </span>
            </label>
          </form-multiple-inline-item>
        </form-multiple-inline>
      </div>
    `,
    bindings: {
      name: '@',
      options: '<',
      ngModel: '=',
      onChange: '&',
      required: '@',
      fallbackValue: '<?',
      width: '@',
      cardTemplate: '@',
    },
    controller: ['$scope', '$timeout', function ($scope, angularTimeout) {
      const $ctrl = this;
      const $timeout = scopedTimeout(angularTimeout, $scope);
      $ctrl.customValue = '';
      $ctrl.customFakeValue = genUniqueId();
      $ctrl.value = '';
      if (!$ctrl.name) $ctrl.name = genUniqueId();
      const isValid = function (value) {
        if (!angular.isArray($ctrl.options)) return null;
        if ($ctrl.options.filter(option => option.value === value).length) return 'valid';
        if ($ctrl.options.some(option => !option.value)) {
          if ($ctrl.customFakeValue === value) return 'fake';
          return 'custom';
        }
        if (value === '') return 'empty';
        return 'invalid';
      };
      const input = function () {
        let status = isValid($ctrl.ngModel);
        if (status === 'invalid' || status === 'empty') setToFallback();
        if (status === 'custom' || status === 'fake' || $ctrl.ngModel === $ctrl.customValue) {
          $ctrl.customValue = $ctrl.ngModel;
          $ctrl.value = $ctrl.customFakeValue;
        }
        if (status === 'valid') {
          $ctrl.value = $ctrl.ngModel;
        }
      };
      const setToNull = function () {
        $ctrl.ngModel = $ctrl.value = null;
        $ctrl.customValue = '';
        triggerChange();
      };
      const setToFallbackHelper = function (target) {
        if (target === true) target = ($ctrl.options[0] || {}).value;
        if (!target) target = null;
        if (angular.isArray(target)) return target.some(setToFallback);
        let status = target === null ? 'null' : isValid(target);
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
      const setToFallback = function () {
        if (!setToFallbackHelper($ctrl.fallbackValue)) {
          setToNull();
        }
      };
      const output = function () {
        let status = isValid($ctrl.value);
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
      const updateOption = function () {
        let status = isValid($ctrl.value);
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
      const triggerChange = function () {
        $timeout(() => $ctrl.onChange(), 0);
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
    template: `
      <span class="form-input-radio-card-sample" style="display: block;">
        <span style="display: block; font-weight: bold;">一些文字</span>
        <span style="display: block;" ng-bind=" $ctrl.option.text "></span>
      </span>
    `,
    bindings: { option: '=' },
    controller: [function () { }]
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
    template: `
      <div class="form-input-checkbox-container" ng-class="{
        'form-input-checkbox-as-switch-container': $ctrl.appearance === 'switch',
        'form-input-checkbox-as-button-container': $ctrl.appearance === 'button',
        'form-input-checkbox-hidden-container': $ctrl.appearance === 'none',
      }">
        <input
          name="{{ $ctrl.valid ? $ctrl.randomName : $ctrl.name }}"
          type="hidden"
          ng-model="$ctrl.empty"
          ng-required="!$ctrl.valid"
          ng-disabled="$ctrl.valid"
        />
        <label>
          <span class="form-input-checkbox-option-container" ng-class="{ 'form-input-checkbox-option-checked': $ctrl.value }">
            <span class="form-input-checkbox-wrapper">
              <input class="form-input-checkbox"
                name="{{ $ctrl.valid ? $ctrl.name : $ctrl.randomName }}"
                type="checkbox"
                ng-model="$ctrl.value"
              />
              <span class="form-input-checkbox-icon"></span>
            </span>
            <span class="form-input-radio-content">
              <span class="form-input-radio-text" ng-if="$ctrl.text != null" ng-bind="$ctrl.text"></span>
              <span class="form-input-radio-complex" ng-if="$ctrl.text == null" ng-transclude></span>
          </span>
          </span>
        </label>
      </div>
    `,
    bindings: {
      name: '@',
      valueTrue: '<?value',
      valueFalse: '<?',
      ngModel: '=',
      required: '@',
      requiredFalse: '@',
      onChange: '&',
      text: '@?',
      appearance: '@',
    },
    transclude: true,
    controller: ['$scope', '$timeout', function ($scope, angularTimeout) {
      const $ctrl = this;
      const $timeout = scopedTimeout(angularTimeout, $scope);
      $ctrl.empty = '';
      $ctrl.randomName = genUniqueId();
      $ctrl.valid = false;
      if (!$ctrl.name) $ctrl.name = genUniqueId();
      if ($ctrl.valueTrue === void 0) $ctrl.valueTrue = 'on';
      if ($ctrl.valueFalse === void 0) $ctrl.valueFalse = '';
      const input = function () {
        if ($ctrl.ngModel === $ctrl.valueTrue) $ctrl.value = true;
        else if ($ctrl.ngModel === $ctrl.valueFalse) $ctrl.value = false;
        else $ctrl.ngModel = $ctrl.value ? $ctrl.valueTrue : $ctrl.valueFalse;
      };
      const output = function () {
        /* jshint ignore: start */
        // here, we compare `$ctrl.value` to `true`
        if (typeof $ctrl.value !== 'boolean') $ctrl.value = $ctrl.value == true;
        /* jshint ignore: end */
        if ($ctrl.ngModel !== $ctrl.valueTrue && $ctrl.value) {
          $ctrl.ngModel = $ctrl.valueTrue;
          $timeout(() => $ctrl.onChange(), 0);
        }
        if ($ctrl.ngModel !== $ctrl.valueFalse && !$ctrl.value) {
          $ctrl.ngModel = $ctrl.valueFalse;
          $timeout(() => $ctrl.onChange(), 0);
        }
      };
      const valid = function () {
        $ctrl.valid = !($ctrl.value ? $ctrl.requiredFalse : $ctrl.required);
      };
      $scope.$watch('$ctrl.ngModel', input);
      $scope.$watch('$ctrl.value', output);
      $scope.$watch('$ctrl.valueTrue', output);
      $scope.$watch('$ctrl.valueFalse', output);
      $scope.$watch('$ctrl.value', valid);
    }],
  });
  /*
   * <form-search-box> 用来描述一个用于搜索的输入框
   *
   * ng-model 被绑定的值
   * placeholder 预定义文本
   */
  formInputs.component('formSearchBox', {
    template: `
      <div class="form-search-box-container"><label>
        <input class="form-search-box-input" type="search" ng-model="$ctrl.ngModel" placeholder="{{ $ctrl.placeholder || '' }}" ng-model-option="{ debounce: $ctrl.debounce || 0 }" ng-change="$ctrl.change()" />
        <icon-search class="form-search-box-icon"></icon-search>
      </label></div>
    `,
    bindings: { ngModel: '=', placeholder: '@', debounce: '<?', onChange: '&', },
    controller: ['$scope', '$timeout', function ($scope, angularTimeout) {
      const $ctrl = this;
      const $timeout = scopedTimeout(angularTimeout, $scope);
      $ctrl.change = function () {
        $timeout(() => { $ctrl.onChange(); });
      };
    }],
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
    template: `
      <form-multiple-inline>
        <form-multiple-inline-item class="form-search-box-text-wrapper">
          <span class="form-search-box-text" ng-if="$ctrl.total || $ctrl.total === 0">
            <span class="form-search-box-text-prefix" ng-bind="$ctrl.textPrefix"></span>
            <span class="form-search-box-text-match" ng-bind="$ctrl.match" ng-if="$ctrl.ngModel"></span>
            <span class="form-search-box-text-line" ng-if="$ctrl.ngModel">/</span>
            <span class="form-search-box-text-total" ng-bind="$ctrl.total"></span>
            <span class="form-search-box-text-prefix" ng-bind="$ctrl.textSuffix"></span>
          </span>
        </form-multiple-inline-item>
        <form-multiple-inline-item class="form-search-box-wrapper">
          <form-search-box ng-model="$ctrl.ngModel" placeholder="{{ $ctrl.placeholder }}" debounce="$ctrl.debounce" on-change="$ctrl.change()"></form-search-box>
        </form-multiple-inline-item>
      </form-multiple-inline>
    `,
    bindings: {
      ngModel: '=',
      placeholder: '@',
      debounce: '<?',
      textPrefix: '@',
      textSuffix: '@',
      total: '@',
      match: '@',
      onChange: '&',
    },
    controller: ['$scope', '$timeout', function ($scope, angularTimeout) {
      const $ctrl = this;
      const $timeout = scopedTimeout(angularTimeout, $scope);
      $ctrl.change = function () {
        $timeout(() => { $ctrl.onChange(); });
      };
    }],
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
    template: `
      <div class="form-array-container" ng-class="{ 'form-array-container-complex': $ctrl.type === 'complex' }">
        <div class="form-array-item" ng-repeat='item in $ctrl.ngModel track by $index'>
          <div class="form-array-item-content" ng-if="$ctrl.type === 'simple'">
            <div class="form-array-item-wrapper" ng-include="$ctrl.template" ng-if="$ctrl.template"></div>
          </div>
          <div class="form-array-item-content" ng-if="$ctrl.type === 'complex'">
            <sub-form-container left-column-width="{{ $ctrl.leftColumnWidth }}">
              <form-config-group>
                <div class="form-array-item-wrapper" ng-if="$ctrl.template" ng-include="$ctrl.template"></div>
              </form-config-group>
            </sub-form-container>
          </div>
          <div class="form-array-item-delete" ng-click="$ctrl.deleteItem($index)" ng-if="$ctrl.minLength - 0 === $ctrl.minLength && $ctrl.ngModel.length > $ctrl.minLength">
            <icon-delete class="form-array-item-delete-icon" ng-if="$ctrl.type === 'simple'"></icon-delete>
            <icon-close class="form-array-item-delete-icon" ng-if="$ctrl.type === 'complex'"></icon-close>
          </div>
          <div class="form-array-item-delete form-array-item-delete-disabled" ng-if="!($ctrl.minLength - 0 === $ctrl.minLength && $ctrl.ngModel.length > $ctrl.minLength) && $ctrl.type === 'simple'">
            <icon-delete class="form-array-item-delete-icon" ng-if="$ctrl.type === 'simple'" disabled="disabled"></icon-delete>
          </div>
        </div>
        <div class="form-array-item-add" ng-click="$ctrl.addItem()" ng-if="$ctrl.maxLength - 0 === $ctrl.maxLength && $ctrl.ngModel.length < $ctrl.maxLength"></div>
      </div>
    `,
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
      leftColumnWidth: '@',
      param: '<?'
    },
    transclude: true,
    controller: ['$scope', function ($scope) {
      const $ctrl = this;
      $ctrl.addItem = function () {
        if (!angular.isArray($ctrl.ngModel)) $ctrl.ngModel = [];
        let item = angular.copy($ctrl.itemDraft);
        if (angular.isFunction(item)) item = item($ctrl.ngModel);
        let index = $ctrl.ngModel.push(item) - 1;
        $ctrl.onAdd({ item, index });
      };
      $ctrl.deleteItem = function (index) {
        let item = $ctrl.ngModel.splice(index, 1)[0];
        $ctrl.onDelete({ item, index });
      };
      const fitLength = function () {
        if (!angular.isArray($ctrl.ngModel)) $ctrl.ngModel = [];
        let maxLength = $ctrl.maxLength, minLength = $ctrl.minLength;
        maxLength = Math.max(maxLength - 0 === maxLength ? maxLength : Infinity, 0);
        minLength = Math.max(minLength - 0 === minLength ? minLength : 0, 0);
        if (maxLength < minLength) return;
        while ($ctrl.ngModel.length < minLength) $ctrl.addItem();
        while ($ctrl.ngModel.length > maxLength) $ctrl.deleteItem($ctrl.ngModel.length - 1);
      };
      const change = function () {
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
   * submit-on-blur （布尔） 是否失去焦点时自动根据输入的文本选择匹配的选项
   * clear-on-submit （布尔） 是否在选择选项后清空输入框
   * blur-on-submit （布尔） 是否在选中后收起下拉框
   */
  formInputs.component('formSearchDropdown', {
    template: `
      <input type="hidden" name="{{ $ctrl.name }}" ng-required="$ctrl.required" ng-model="$ctrl.ngModel" />
      <span class="form-search-dropdown-container" id="{{ $ctrl.id }}">
        <span class="form-search-input-container form-search-input-show-{{ $ctrl.currentlyShowInput }}" ng-show="$ctrl.currentlyShowInput">
          <icon-search class="form-search-input-icon"></icon-search>
          <input class="form-search-input" type="text" ng-model="$ctrl.searchText" placeholder="{{ $ctrl.placeholder }}" form="_noform" />
        </span>
        <span class="form-search-options-container form-search-options-show-{{ $ctrl.showOptions }}" ng-show="$ctrl.currentlyShowOptions" tab-index="-1">
          <span class="form-search-options-wrapper" ng-show="$ctrl.isLoading !== true">
            <span class="form-search-options-item-container" ng-repeat="option in $ctrl.filteredOptions track by $index" tabindex="-1">
              <span class="form-search-options-item" ng-class="{ 'form-search-options-item-active': $index === $ctrl.currentIndex }" ng-if="option.value" ng-click="$ctrl.itemOnClick(option, $index)" ng-mouseenter="$ctrl.itemOnMouseenter(option, $index)">
                <span class="form-search-options-item-text" ng-bind="option.text"></span>
                <span class="form-search-options-item-remark" ng-bind="option.remark" ng-if="option.remark"></span>
              </span>
            </span>
          </span>
          <span class="form-search-options-empty" ng-show="$ctrl.isLoading !== true && $ctrl.filteredOptions.length === 0" ng-bind="$ctrl.emptyText || ''"></span>
          <span class="form-search-options-loading" ng-show="$ctrl.isLoading === true" ng-bind="$ctrl.loadingText || ''"></span>
        </span>
      </span>
    `,
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
      submitOnBlur: '<?',
      clearOnSubmit: '<?',
      blurOnSubmit: '<?',
      parentActive: '=?',
    },
    controller: ['$scope', '$document', '$timeout', function ($scope, $document, angularTimeout) {
      const $ctrl = this;
      const $timeout = scopedTimeout(angularTimeout, $scope);
      const cleanup = cleanUpCollections($scope);
      $ctrl.searchText = '';
      $ctrl.id = genUniqueId();
      // 检查事件是否在下拉框内
      const eventInContainer = function (event) {
        let target = angular.element(event.target);
        let container = angular.element(document.getElementById($ctrl.id));
        return container && container.find(target).length > 0;
      };
      // 维护相关元素的展示与隐藏
      let active = false;
      const updateShowHide = function () {
        $ctrl.currentlyShowInput = {
          always: true,
          never: false,
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
      let setCurrentOption = function (option, index) {
        $ctrl.currentOption = option;
        $ctrl.currentIndex = index;
      };
      let isTextMatchCurrentOption = function (text) {
        if (!$ctrl.currentOption) return false;
        return text === $ctrl.currentOption.text;
      };
      let clearCurrentOption = function () {
        $ctrl.currentOption = null;
        $ctrl.currentIndex = -1;
      };
      // 维护当前选择的选项
      $ctrl.chosedOption = null;
      $ctrl.ngModel = null;
      let setChosedOption = function (option) {
        if (option === null) return clearChosedOption();
        $ctrl.chosedOption = option;
        let oldNgModel = $ctrl.ngModel;
        $ctrl.ngModel = option.value;
        $ctrl.searchText = option.text;
        setCurrentOption(option, -1);
        $timeout(() => {
          if (oldNgModel !== option) $ctrl.onChange({ option });
          $ctrl.onSubmit({ option });
          if ($ctrl.clearOnSubmit) clearChosedOption();
        }, 0);
      };
      let clearChosedOption = function () {
        $ctrl.chosedOption = null;
        $ctrl.ngModel = null;
        $ctrl.searchText = '';
        $timeout(() => $ctrl.onChange({ option: null }), 0);
        clearCurrentOption();
      };
      // 下拉菜单被激活
      const focus = function () {
        active = true;
        updateOptions();
        updateShowHide();
      };
      // 下拉菜单失去焦点
      const blur = function () {
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
      const makeMeBlur = function () {
        $timeout(() => {
          document.body.focus();
          blur();
        }, 0);
      };
      // 监听点击或焦点的事件，处理显示和隐藏
      const focusEventHandler = function (event) {
        let contained = eventInContainer(event);
        if (contained !== active) {
          if (contained) focus(); else blur();
          $timeout(() => { });
        }
      };
      $document.on('click focus focusin', focusEventHandler);
      cleanup(() => $document.off('click focus focusin', focusEventHandler));
      // 某个选项被点击
      $ctrl.itemOnClick = function (option, index) {
        setChosedOption(option);
        if ($ctrl.blurOnSubmit) makeMeBlur();
      };
      $ctrl.itemOnMouseenter = function (option, index) {
        setCurrentOption(option, index);
      };
      const setCurrentIndex = function (index) {
        let options = $ctrl.filteredOptions;
        if (!options || !options.length) return;
        if (index >= options.length) index = 0;
        if (index < 0) index = options.length - 1;
        setCurrentOption(options[index], index);
      };
      const keyboardArrowDown = function () {
        setCurrentIndex($ctrl.currentIndex + 1);
      };
      const keyboardArrowUp = function () {
        setCurrentIndex($ctrl.currentIndex - 1);
      };
      const choseCurrent = function () {
        if (!$ctrl.currentOption) return;
        setChosedOption($ctrl.currentOption);
      };
      const keyboardEventHandler = function (event) {
        if (!(active || $ctrl.parentActive)) return;
        let action = {
          40: keyboardArrowDown,
          38: keyboardArrowUp,
          13: () => {
            choseCurrent();
            if ($ctrl.blurOnSubmit) makeMeBlur();
          },
          27: makeMeBlur
        }[event.keyCode];
        if (action) {
          action();
          event.preventDefault();
          event.stopPropagation();
          $timeout(() => {
            $timeout(updateScroll, 0);
            $timeout(updateScroll, 250);
          });
        }
      };
      $document.on('keydown', keyboardEventHandler);
      cleanup(() => $document.on('keydown', keyboardEventHandler));
      // 根据当前的搜索文本找到激活的项目
      // 如果找到了完全匹配的项目，则激活该项目
      // 如果没有找到任何匹配的项目，那么激活指定的默认位置位置的项目
      // 默认位置为 -1 时，不激活任何项目
      const updateCurrentIndex = function () {
        let options = $ctrl.filteredOptions || [], text = $ctrl.searchText;
        if (isTextMatchCurrentOption(text)) return;
        let found = -1;
        options.some((opt, index) => {
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
      let lastSearchText = null;
      const triggerOnSearch = function () {
        let text = $ctrl.searchText;
        let delay = $ctrl.searchDelay ? Number($ctrl.searchDelay) : 200;
        if (!delay && delay !== 0 || delay < 0) delay = 200;
        if (text === lastSearchText) return;
        $timeout(() => {
          if ($ctrl.searchText !== text) return;
          $ctrl.onSearch({ text: $ctrl.searchText });
        }, delay);
      };
      // 根据输入的内容和所有候选项筛选
      const updateOptions = function () {
        triggerOnSearch();
        let options = $ctrl.options || [];
        if ($ctrl.filteOption) {
          let testIndexOf = $ctrl.filteOption === 'start' ? (i => i === 0) : (i => i !== -1);
          options = options.filter(opt => testIndexOf((opt.text || '').indexOf($ctrl.searchText)));
        }
        if (!angular.equals(options, $ctrl.filteredOptions)) {
          $ctrl.filteredOptions = angular.copy(options);
        }
        updateCurrentIndex();
      };
      $scope.$watch('$ctrl.searchText', updateOptions);
      $scope.$watch('$ctrl.options', updateOptions);
      // 按上下键选择候选项时，滚动条要跟着滚动到正确的位置
      const updateScroll = function () {
        let container = angular.element(document.getElementById($ctrl.id));
        let optionsContainer = angular.element('.form-search-options-wrapper', container);
        let activeOption = angular.element('.form-search-options-item-active', optionsContainer).parent();
        if (activeOption && activeOption[0]) {
          let top = activeOption[0].offsetTop, bottom = top + activeOption.height();
          let scrollTop = optionsContainer.scrollTop(), scrollBottom = scrollTop + optionsContainer.height();
          let scrollTo = null;
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
      const input = function (newValue, oldValue) {
        let options = $ctrl.options;
        let matchedOption = null;
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
          options.some(opt => {
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
          if ($ctrl.chosedOption) $ctrl.ngModel = $ctrl.chosedOption.value;
          else $ctrl.ngModel = null;
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
   * ng-model （双向） 绑定的变量
   * options （单向） 候选项，格式参考 form-search-dropdown
   * placeholder （字符串） 未选择任何内容时显示的文本
   * on-change （回调） 值变化时的回调函数
   * required （布尔） 是否为必填项
   * empty-text （文本） 候选项为空时显示的文字
   * show-search-input （布尔） 是否在下拉菜单中显示搜索用输入框，可以写 never 或 always
   * is-loading （布尔，可选） 表示是否正在加载
   * loading-text （文本，可选） 正在加载时显示的文本
   */
  formInputs.component('formSelect', {
    template: `
      <span id="{{ $ctrl.id }}" class="form-select-container">
        <input type="hidden" name="{{ $ctrl.name }}" ng-required="$ctrl.required" ng-model="$ctrl.ngModel" />
        <span class="form-select-wrapper">
          <span class="form-select-fake-input" tabindex="0">
            <span class="form-select-fake-input-value" ng-show="$ctrl.ngModel" ng-bind="$ctrl.text"></span>
            <span class="form-select-fake-input-placeholder" ng-show="!$ctrl.ngModel" ng-bind="$ctrl.placeholder"></span>
            <icon-drop-down class="form-select-down-icon"></icon-drop-down>
          </span>
        </span>
        <form-search-dropdown
          class="form-select-dropdown"
          ng-model="$ctrl.value"
          ng-class="{ 'form-select-dropdown-with-search': $ctrl.showSearchInput !== 'never' }"
          ng-show="$ctrl.active"
          options="$ctrl.options"
          on-submit="$ctrl.onValueChange(option)"
          empty-text="{{ $ctrl.emptyText || '' }}"
          show-input="{{ $ctrl.showSearchInput || 'always' }}"
          show-options="always"
          filte-option="{{ $ctrl.showSearchInput !== 'never' ? 'filte-option' : '' }}"
          clear-on-submit="true"
          input-in-dropdown="input-in-dropdown"
          parent-active="$ctrl.active"
          blur-on-submit="true"
          is-loading="$ctrl.isLoading"
          loading-text="{{ $ctrl.loadingText || '' }}"
        ></form-search-dropdown>
      </span>
    `,
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
      loadingText: '@',
    },
    controller: ['$scope', '$timeout', '$document', function ($scope, angularTimeout, $document) {
      const $ctrl = this;
      const $timeout = scopedTimeout(angularTimeout, $scope);
      const cleanup = cleanUpCollections($scope);
      $ctrl.active = false;
      $ctrl.id = genUniqueId();
      $ctrl.ngModel = null;
      $ctrl.value = null;
      const eventInContainer = function (event) {
        let target = angular.element(event.target);
        let container = angular.element(document.getElementById($ctrl.id));
        return container && container.find(target).length > 0;
      };
      const focusEventHandler = function (event) {
        $ctrl.active = eventInContainer(event);
        $timeout(() => { });
      };
      $document.on('click focus focusin', focusEventHandler);
      cleanup(() => $document.on('click focus focusin', focusEventHandler));
      $ctrl.onValueChange = function (option) {
        if (option) {
          $ctrl.text = option.text;
          $ctrl.ngModel = option.value;
          $timeout(() => $ctrl.onChange({ option }), 0);
        }
        $timeout(() => $ctrl.active = false, 0);
      };
      $scope.$watch('$ctrl.ngModel', function () {
        $ctrl.value = $ctrl.ngModel;
      });
    }]
  });
  /*
   * <form-select-with-backend> 封装了后台接口的候选框
   *
   * backend （字符串） 获取列表的 api 名称
   * param （对象，可选） 提供给后台接口的参数
   * name （字符串） 输入框的 name
   * ng-model （双向） 绑定的变量
   * options （双向，外部应只读） 候选项列表
   * placeholder （字符串） 未选择时框内的占位文本
   * on-change （回调） 选择的内容发生变化时的回调
   * required （布尔） 是否为必选项
   * empty-text （字符串） 候选项为空时展示的文本
   * show-search-input （字符串，可选）是否在下拉菜单中显示搜索用输入框，可以写 never 或 always
   * loading-text （字符串） 加载时显示的文本
   *
   * 如果这个候选框不能满足你的业务逻辑要求，请优先考虑修改后台封装逻辑
   */
  formInputs.component('formSelectWithBackend', {
    template: `
      <form-select
        ng-model="$ctrl.value"
        name="{{ $ctrl.name }}"
        on-change="$ctrl.output()"
        options="$ctrl.candidateList"
        show-search-input="{{ $ctrl.showSearchInput || 'always' }}"
        placeholder="{{$ctrl.placeholder}}"
        is-loading="$ctrl.isLoading"
        loading-text="{{$ctrl.loadingText || '正在加载…'}}"
        empty-text="{{$ctrl.emptyText || '无匹配选项'}}"
        ng-required="$ctrl.required"
      ></form-select>
    `,
    bindings: {
      backend: '@',
      param: '<?',
      name: '@',
      ngModel: '=?',
      options: '=?',
      placeholder: '@',
      onChange: '&',
      required: '@',
      emptyText: '@',
      showSearchInput: '@',
      loadingText: '@',
    },
    controller: ['$scope', 'api', '$timeout', '$filter', function ($scope, api, $timeout, $filter) {
      const $ctrl = this;
      $ctrl.candidateList = [];
      let getCandidatesPromise = api.SimplePromise.resolve({});
      const getList = function () {
        if (!$ctrl.backend) return;
        $ctrl.isLoading = true;
        let param = $ctrl.param;
        getCandidatesPromise = api.select[$ctrl.backend](param).then(result => {
          $ctrl.candidateList = result;
          return { param, result };
        });
        getCandidatesPromise.catch(e => console.error(e)).then(() => {
          $ctrl.isLoading = false;
          $ctrl.input();
        })
      };

      $ctrl.input = function () {
        if ($ctrl.ngModel == null) {
          $ctrl.value = null;
          return;
        }
        getCandidatesPromise.then(({ param, result } = {}) => {
          if (!param || !angular.equals(param, $ctrl.param)) return;
          if (result !== $ctrl.candidateList) return;
          let chosen = null;
          if (typeof $ctrl.ngModel === 'object' && $ctrl.ngModel) {
            chosen = result.find(element => {
              return $filter('filter')([$ctrl.ngModel], element.match, true).length;
            });
          } else {
            chosen = result.find(element => element.value === $ctrl.ngModel);
          }
          if (chosen) $ctrl.value = chosen.value;
          else $ctrl.value = null;
          $ctrl.output();
        });
      };

      $ctrl.output = function () {
        if (angular.equals($ctrl.ngModel, $ctrl.value)) return;
        let option = $ctrl.ngModel = $ctrl.value;
        $timeout(() => { $ctrl.onChange({ option }); });
      };

      $scope.$watch('$ctrl.param', getList, true);
      $scope.$watch('$ctrl.backend', getList);
      $scope.$watch('$ctrl.ngModel', $ctrl.input);
    }],
  });

  /*
   * <form-multiple-select>
   */
  formInputs.component('formMultipleSelect', {
    template: `
      <span id="{{ $ctrl.id }}" class="form-select-container form-multiple-select-container">
        <input type="hidden" name="{{ $ctrl.name }}" ng-required="$ctrl.required"
          ng-model="$ctrl.validValue" maxlength="" />
        <span class="form-select-wrapper">
          <span class="form-select-fake-input">
            <ul class="form-select-item-collection">
              <li class="form-select-chosed-item" ng-repeat="item in $ctrl.chosed" ng-class="{ 'form-select-chosed-about-to-delete': $index === $ctrl.aboutToDelete }">
                <span class="form-select-chosed-item-text" ng-bind="item.text"></span>
                <icon type="close" class="form-select-chosed-item-delete" ng-click="$ctrl.deleteChosedItem(item)">
              </li>
              <li class="form-select-input-item">
                <span class="form-select-input-text" ng-bind="$ctrl.searchText || $ctrl.placeholder" || ''></span>
                <input type="text" class="form-select-input" placeholder="{{ $ctrl.placeholder }}" ng-model="$ctrl.searchText" ng-trim="false" form="_noform" />
              </li>
            </ul>
          </span>
        </span>
        <form-search-dropdown
          class="form-select-dropdown"
          ng-model="$ctrl.value"
          ng-show="$ctrl.active"
          search-text="$ctrl.searchText"
          options="$ctrl.options"
          on-submit="$ctrl.onValueChange(option)"
          empty-text="{{ $ctrl.emptyText || '' }}"
          show-input="never"
          show-options="always"
          filte-option="filte-option"
          clear-on-submit="true"
          parent-active="$ctrl.active"
          is-loading="$ctrl.isLoading || false"
          loading-text="{{ $ctrl.loadingText || '' }}"
        ></form-search-dropdown>
      </span>
    `,
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
      loadingText: '@',
      required: '@',
    },
    controller: ['$scope', '$timeout', '$document', function ($scope, angularTimeout, $document) {
      const $ctrl = this;
      const $timeout = scopedTimeout(angularTimeout, $scope);
      const cleanup = cleanUpCollections($scope);
      $ctrl.active = false;
      $ctrl.id = genUniqueId();
      $ctrl.ngModel = null;
      $ctrl.value = null;
      $ctrl.searchText = '';
      $ctrl.chosed = [];
      $ctrl.validValue = null;

      // 检查当前是否应当“激活”
      // “激活”时显示下拉候选选项
      const eventInContainer = function (event) {
        let target = angular.element(event.target);
        let container = angular.element(document.getElementById($ctrl.id));
        let contained = container && container.find(target).length > 0;
        return contained;
      };
      const focusOnInput = function () {
        let container = angular.element(document.getElementById($ctrl.id));
        let input = angular.element('.form-select-input', container)[0];
        if (input && input !== document.activeElement) input.focus();
      };
      const focusEventHandler = function (event) {
        $ctrl.active = eventInContainer(event);
        if ($ctrl.active) focusOnInput();
        $timeout(() => { });
      };
      $document.on('click focus focusin', focusEventHandler);
      cleanup(() => $document.off('click focus focusin', focusEventHandler));
      // 处理新增选中项的情况
      $ctrl.onValueChange = function (option) {
        if (!angular.isArray($ctrl.chosed)) $ctrl.chosed = [];
        let collections = $ctrl.chosed;
        let find = null;
        collections.some((o, i) => {
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
        let index = $ctrl.chosed.indexOf(option);
        $ctrl.chosed.splice(index, 1);
        $timeout(focusOnInput, 0);
        output();
      };
      // 按退格键可以删除一个已选项
      $ctrl.aboutToDelete = null;
      // 检查是否当前“选中”了某项
      const isAboutToDelete = function () {
        return $ctrl.aboutToDelete !== null;
      };
      // 确认并删除当前“选中”元素
      const deleteCurrentItem = function () {
        let valid = true;
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
      const targetedBackspacePressed = function () {
        if (deleteCurrentItem()) return;
        else {
          $ctrl.aboutToDelete = $ctrl.chosed.length - 1;
        }
      };
      // 输入框为空时按方向键，或当前有元素被选中时按方向键
      // 根据左右向前/后移动“选中”的光标
      // 如果想后移动到最后，则取消“选中”
      const targetedHorizontalArrowPressed = function (d) {
        let target = $ctrl.aboutToDelete;
        if (target === null) target = $ctrl.chosed.length;
        target += d;
        if (target >= $ctrl.chosed.length) $ctrl.aboutToDelete = null;
        $ctrl.aboutToDelete = target;
      };
      // 触发任何其他事件时，取消“选中”
      const otherEventTriggered = function (e) {
        $ctrl.aboutToDelete = null;
      };
      // 检查当前事件是否是在输入框上的 keydown
      const isInputTargetedKeypress = function (e) {
        if (e.type !== 'keydown') return false;
        let container = angular.element(document.getElementById($ctrl.id));
        let input = angular.element('.form-select-input', container)[0];
        if (e.target !== input) return false;
        return true;
      };
      // 检查当前光标是否在输入框开头
      const cursorAtInputBegining = function () {
        let container = angular.element(document.getElementById($ctrl.id));
        let input = angular.element('.form-select-input', container)[0];
        if (document.activeElement !== input) return false;
        let cursorPosition = null;
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
      const isEmptyInput = function () {
        return $ctrl.searchText === '';
      };
      // 处理所有点击、焦点和按键事件
      const eventHandler = function (e) {
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
            let dir = e.keyCode === 39 ? 1 : -1;
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
          $timeout(() => { });
        }
      };
      $document.on('click focusin focusout keydown', eventHandler);
      cleanup(() => {
        $document.off('click focusin focusout keydown', eventHandler);
      });
      const output = function () {
        let newValue = $ctrl.chosed.map(option => option.value);
        if (angular.equals(newValue, $ctrl.ngModel)) return;
        $ctrl.ngModel = newValue;
        $timeout(() => $ctrl.onChange(), 0);
      };
      const input = function () {
        if (!angular.isArray($ctrl.ngModel)) $ctrl.ngModel = [];
        if (!angular.isArray($ctrl.options)) $ctrl.options = [];
        if (!angular.isArray($ctrl.chosed)) $ctrl.chosed = [];
        let allOptions = $ctrl.options.concat($ctrl.chosed);
        $ctrl.chosed = $ctrl.ngModel
          .map(value => allOptions.filter(option => option.value === value)[0] || null)
          .filter(x => x);
        output();
        $ctrl.validValue = $ctrl.ngModel.join('; '); //用于表单验证
      };
      $scope.$watch('$ctrl.ngModel', input, true);
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
    template: `
      <table class="form-table">
        <colgroup ng-if="$ctrl.columns.length">
          <col class="form-table-column" ng-repeat="column in $ctrl.columns track by $index" ng-style="{ width: column.width || 'auto' }"></col>
        </colgroup>
        <colgroup ng-if="$ctrl.hasButtons()">
          <col class="form-table-column form-table-action-column" ng-style="{ width: 20 + 30 * $ctrl.buttonCount() }"></col>
        </colgroup>
        <thead>
          <tr class="form-table-first-row">
            <th class="form-table-column-title" ng-repeat="column in $ctrl.columns track by $index" ng-bind="column.text""></th>
            <th class="form-table-column-title form-table-action-column-title" ng-if="$ctrl.hasButtons()">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr ng-repeat="(rowIndex, row) in (($ctrl.ngModel || []) | filter:$ctrl.filterRule()) track by $index" class="form-table-row" ng-class="{ 'form-table-row-edit': $ctrl.getEditStatus(rowIndex), 'form-table-last-row': $ctrl.ngModel.length - 1 === rowIndex }">
            <td ng-repeat="(columnIndex, column) in $ctrl.columns track by $index" class="form-table-ceil">
              <div ng-repeat="edit in [$ctrl.getEditStatus(rowIndex)] track by $index">
                <div ng-repeat="value in [row[column.key]] track by $index">
                  <div ng-repeat="param in [$ctrl.param] track by $index">
                    <div ng-include="$ctrl.template"></div>
                  </div>
                </div>
              </div>
            </td>
            <td ng-if="$ctrl.hasButtons()" class="form-table-ceil form-table-action-ceil">
              <div ng-if="!$ctrl.getEditStatus(rowIndex)">
                <icon-group>
                  <icon-by-name ng-repeat="action in $ctrl.customButtons" name="{{ action.icon }}" ng-click="$ctrl.customButton(action, rowIndex)" tooltip="{{ action.text }}"></icon-by-name>
                  <icon-edit tooltip="编辑" ng-click="$ctrl.mayEdit(rowIndex) && $ctrl.beforeEdit(rowIndex)" ng-if="$ctrl.hasEdit()" disabled="{{ $ctrl.mayEdit(rowIndex) ? '' : 'disabled' }}"></icon-edit>
                  <icon-delete tooltip="删除" ng-click="$ctrl.mayDelete(rowIndex) && $ctrl.deleteItem(rowIndex)" ng-if="$ctrl.hasDelete()" disabled="{{ $ctrl.mayDelete(rowIndex) ? '' : 'disabled' }}"></icon-delete>
                </icon-group>
              </div>
              <div ng-if="$ctrl.getEditStatus(rowIndex)">
                <icon-group>
                  <icon-save tooltip="保存" ng-click="$ctrl.saveItem(rowIndex)"></icon-save>
                  <icon-cancel tooltip="取消" ng-click="$ctrl.cancelEdit(rowIndex)"></icon-cancel>
                </icon-group>
              </div>
            </td>
          </tr>
          <tr ng-if="$ctrl.emptyText && (($ctrl.ngModel || []) | filter:$ctrl.filterRule()).length === 0" class="form-table-row form-table-row-empty">
            <td class="form-table-empty-text" colspan="{{ $ctrl.columns.length + $ctrl.hasButtons() }}" ng-bind="$ctrl.emptyText"></td>
          </tr>
        </tbody>
      </table>
    `,
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
      param: '<?',
    },
    controller: [function () {
      const $ctrl = this;
      $ctrl.hasEdit = () => !!($ctrl.onBeforeEdit || $ctrl.onCancelEdit || $ctrl.onSave);
      $ctrl.hasDelete = () => !!($ctrl.onDelete);
      $ctrl.hasButtons = () => !!(!$ctrl.disabled && ($ctrl.hasEdit() || $ctrl.hasDelete() || $ctrl.onCustomButton || $ctrl.customButtons));
      $ctrl.buttonCount = () => $ctrl.hasEdit() + $ctrl.hasDelete() + ($ctrl.customButtons || []).length;
      $ctrl.getEditStatus = (index) => !!(($ctrl.hasButtons() && !$ctrl.ngModel[index].disabled && (index in $ctrl.editedData) || false));
      const sameItem = (x, y) => $ctrl.compareKey ? angular.equals(x[$ctrl.compareKey], y[$ctrl.compareKey]) : angular.equals(x, y);
      $ctrl.mayEdit = (index) => ($ctrl.noEdit || []).every(v => !sameItem(v, $ctrl.ngModel[index]));
      $ctrl.mayDelete = (index) => ($ctrl.noDelete || []).every(v => !sameItem(v, $ctrl.ngModel[index]));
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
        for (let i = index; i < $ctrl.ngModel.length; i++) {
          if ((i + 1) in $ctrl.editedData) {
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
        if ($ctrl.onCustomButton) $ctrl.onCustomButton({ action, index, data: $ctrl.ngModel[index] });
      };
      $ctrl.filterRule = () => $ctrl.filter || {};
    }],
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
    template: `
      <div class="input-with-button" id="{{ $ctrl.id }}">
        <div class="input-with-button-input">
          <input ng-if="$ctrl.appearance !== 'textarea' && $ctrl.appearance !== 'codearea'" type="text" ng-model="$ctrl.ngModel" ng-readonly="$ctrl.readonly" />
          <textarea ng-if="$ctrl.appearance === 'textarea'" ng-model="$ctrl.ngModel" ng-readonly="$ctrl.readonly"></textarea>
          <codearea ng-if="$ctrl.appearance === 'codearea'" ng-model="$ctrl.ngModel" readonly="{{ $ctrl.readonly ? 'readonly' : '' }}" language="$ctrl.language"></codearea>
        </div>
        <div class="input-with-button-button">
          <button type="button" class="input-with-button-copy" data-clipboard-target="#{{ $ctrl.id }} input, #{{ $ctrl.id }} textarea"><icon-clipboard></icon-clipboard></button>
        </div>
      </div>
    `,
    bindings: {
      ngModel: '=',
      appearance: '@?',
      language: '@',
      readonly: '@',
    },
    controller: ['api', function (api) {
      const $ctrl = this;
      $ctrl.id = genUniqueId();
      let script = api.loadScript('/lib/js/clipboard.js/clipboard.min.js', () => window.Clipboard);
      script.then(function () {
        let selector = `#${$ctrl.id} button`;
        let clipboard = new Clipboard(selector);
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
    template: `
      <div id="{{ $ctrl.id }}" class="codearea-container">
        <textarea class="codearea-hidden-textarea" style="display: none;" name="$ctrl.name" ng-model="$ctrl.ngModel" ng-required="$ctrl.required"></textarea>
        <div id="{{ $ctrl.editorId }}" class="codearea-ace-container"></div>
      </div>
    `,
    bindings: {
      language: '@',
      ngModel: '=',
      required: '@',
      name: '@?',
      readonly: '@',
      height: '@',
      onChange: '&',
    },
    controller: ['api', '$scope', '$interval', '$timeout', function (api, $scope, angularInterval, angularTimeout) {
      const $ctrl = this;
      const $interval = scopedInterval(angularInterval, $scope);
      const $timeout = scopedInterval(angularTimeout, $scope);
      $ctrl.id = genUniqueId();
      $ctrl.editorId = genUniqueId();
      if (!$ctrl.name) $ctrl.name = genUniqueId();
      const modeMap = {
        dockerfile: 'dockerfile',
        json: 'json',
        markdown: 'markdown',
        shell: 'sh',
        xml: 'xml',
        yaml: 'yaml',
      };
      let editor = null;
      let value = null;
      let min = 0, max = 0;
      let script = api.loadScript('/lib/js/ace/ace.js', () => window.ace);
      script.then(function () {
        editor = ace.edit($ctrl.editorId);
        editor.getSession().setMode(`ace/mode/${modeMap[$ctrl.language] || 'text'}`);
        editor.on('input', function () {
          $ctrl.ngModel = value = editor.getValue();
          $timeout(() => { $ctrl.onChange(); });
        });
        editor.setValue(value || '', 1);
        editor.setOptions({ fontSize: '14px' });
        editor.$blockScrolling = Infinity;
        editor.setReadOnly(!!$ctrl.readonly);
        editor.setOptions({ minLines: min, maxLines: max });
      });
      let size = null;
      $interval(function () {
        let element = document.getElementById($ctrl.editorId);
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
        if (editor) editor.getSession().setMode(`ace/mode/${modeMap[$ctrl.language] || 'text'}`);
      });
      $scope.$watch('$ctrl.height', function (newValue, oldValue) {
        let match = (($ctrl.height || '') + '').match(/^(?=(\d+))(?=(?:\d+\s*,\s*)?(\d*)$)(?:\d+(?:\s*,\s*\d*)?)$/);
        if (!match) {
          min = max = 0;
        } else {
          min = parseInt(match[1], 0) || 0;
          max = match[2] === '' ? Infinity : (parseInt(match[2], 0) || 0);
        }
        if (editor) editor.setOptions({ minLines: min, maxLines: max });
      });
    }]
  });
  formInputs.component('markdown', {
    template: `
      <div class="markdown-container markdown" ng-bind-html="$ctrl.html"></div>
    `,
    bindings: {
      source: '@?',
      src: '@?',
      emptyText: '@?',
    },
    controller: ['$scope', 'api', function ($scope, api) {
      const $ctrl = this;
      $ctrl.html = '';
      let version = 0;
      const showMarkdown = function () {
        $ctrl.html = '';
        let myVersion = ++version;
        let source = null;
        if ($ctrl.source) source = api.SimplePromise.resolve($ctrl.source);
        else if ($ctrl.src) source = api.network($ctrl.src, 'GET', { responseType: "arraybuffer" })
          .then(ab => decodeURIComponent(escape(String.fromCharCode.apply(String, new Uint8Array(ab)))).trim());
        else source = api.SimplePromise.resolve('');
        source = source.catch(error => '').then(markdown => markdown || $ctrl.emptyText || '');
        let script = api.loadScript('/lib/js/showdown.min.js',
          () => window.showdown,
          () => {
            showdown.setOption('strikethrough', 'true');
            showdown.setOption('tables', 'true');
            showdown.setOption('tasklists', 'true');
            showdown.setOption('simplifiedAutoLink', 'true');
          }
        );
        api.SimplePromise.all([source, script]).then(([markdown]) => {
          if (myVersion !== version) return;
          var converter = new showdown.Converter();
          let original = converter.makeHtml(markdown);
          let element = angular.element('<div></div>').html(original);
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
    template: `
      <div class="event-list-container">
        <span class="event-list-empty" ng-bind="$ctrl.emptyText" ng-if="!$ctrl.value || !$ctrl.value.length"></span>
        <ol class="event-list" ng-if="$ctrl.value && $ctrl.value.length">
          <li class="event-list-item" ng-repeat="row in $ctrl.value">
            <span class="event-list-content event-list-icon event-list-icon-{{ $ctrl.eventType || ($ctrl.eventTypeAttr ? row[$ctrl.eventTypeAttr] : row.type) || 'info' }}">
            </span>
            <span class="event-list-content" ng-repeat="column in $ctrl.column track by $index">
              <span ng-repeat="value in [row[column]] track by $index">
                <span ng-include="$ctrl.template"></span>
              </span>
            </span>
          </li>
        </ol>
      </div>
    `,
    bindings: {
      value: '<',
      column: '<',
      template: '@',
      param: '<?',
      eventType: '@?',
      eventTypeAttr: '@?',
      emptyText: '@',
    },
    controller: [function () {}]
  });
  /*
   * <chart-container> 图的容器
   * 请勿直接使用这个组件
   */
  formInputs.component('chartContainer', {
    template: `
      <div class="chart chart-container" id="$ctrl.id">
        <div class="chart-title">{{ $ctrl.chartTitle }}</div>
        <div class="chart-content chart-content-legend-{{ $ctrl.legendPosition }}">
          <div class="chart-img" ng-style="{ visibility: $ctrl.noData === true ? 'hidden' : 'visible' }">
            <div class="chart-img-wrap" style="padding: 20px 10px {{ $ctrl.chartHeight + 0 === $ctrl.chartHeight * 1 ? ($ctrl.chartHeight + 'px') : $ctrl.chartHeight }}">
              <div class="chart-img-container" ng-transclude></div>
            </div>
          </div>
          <div class="chart-legend-container" ng-style="{ visibility: $ctrl.noData === true ? 'hidden' : 'visible' }">
            <ul class="chart-legend">
              <li class="chart-legend-item" ng-repeat="label in $ctrl.groups"
                ng-mouseenter="$ctrl.onLegendMouseenter({ legend: label })"
                ng-mouseleave="$ctrl.onLegendMouseleave({ legend: label })"
                ng-click="$ctrl.onLegendClick({ legend: label })"
              >
                <span class="chart-legend-item-sample" style="background-color: {{ $ctrl.color[$index] }}"></span>
                <span>{{ label }}</span>
              </li>
            </ul>
          </div>
          <div class="chart-no-data" ng-bind="$ctrl.emptyText" ng-if="$ctrl.noData"></div>
        </div>
      </div>
    `,
    transclude: true,
    bindings: {
      chartHeight: '@?',
      chartTitle: '@',
      noData: '<?',
      legendPosition: '@',
      groups: '<',
      color: '<',
      emptyText: '@',
      onLegendMouseenter: '&',
      onLegendMouseleave: '&',
      onLegendClick: '&',
    },
    controller: [function () {
      const $ctrl = this;
      $ctrl.id = genUniqueId();
    }]
  });
  /*
   * <chart> 图
   *
   * type （字符串） 类型，可选 line, pie
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
    template: `
      <chart-container
        chart-title="{{ $ctrl.chartTitle }}"
        groups="$ctrl.groups"
        color="$ctrl.color"
        legend-position="{{ $ctrl.legendPosition }}"
        empty-text="{{ $ctrl.emptyText }}"
        no-data="$ctrl.noData"
        class="chartjs chart chart-{{ $ctrl.type }}"
        id="{{ $ctrl.id }}"
        chart-height="{{ $ctrl.type === 'line' ? '50%' : '100%' }}"
      >
          <canvas></canvas>
      </chart-container>
    `,
    bindings: {
      chartTitle: '@',
      data: '<',
      groups: '<?',
      items: '<?',
      color: '<',
      type: '@',
      legendPosition: '@',
      options: '<?',
      emptyText: '@',
    },
    controller: ['api', '$scope', function(api, $scope){
      const $ctrl = this;
      $ctrl.id = genUniqueId();
      let script = api.loadScript('/lib/js/Chart.min.js', () => window.Chart);
      let chart = null;
      const cleanup = function () {
        if (chart) try {
          chart.clear().destroy();
        } catch (_ignore) {}
      };
      $scope.$on('$destory', cleanup);
      const repaint = function () {
        cleanup();
        let canvas = angular.element('canvas', document.getElementById($ctrl.id));
        let datasets, labels, options = {};
        $ctrl.noData = false;
        if ($ctrl.type === 'pie') {
          if (!Array.isArray($ctrl.data) ||
            $ctrl.data.indexOf(null) !== -1 ||
            $ctrl.data.reduce((x, y) => x + y, 0) === 0)
            $ctrl.noData = true;
          
          datasets = [{
            data: $ctrl.data,
            label: $ctrl.groups,
            backgroundColor: $ctrl.color,
            hoverBackgroundColor: $ctrl.color,
            pointBorderColor: $ctrl.color,
            pointHoverBorderColor: $ctrl.color,
            pointBackgroundColor: $ctrl.color,
            pointHoverBackgroundColor: $ctrl.color,
          }];
          labels = $ctrl.groups;
          options = {
            tooltips: {
              callbacks: {
                label: function(item, data){
                  return data.labels[item.index];
                }
              }
            },
          }
        } else if ($ctrl.type === 'line') {
          if (!Array.isArray($ctrl.data) || !$ctrl.data.length) $ctrl.noData = true;
          datasets = ($ctrl.data || []).map((data, i) => {
            if (!Array.isArray(data) || $ctrl.data.indexOf(null) !== -1) $ctrl.noData = true;
            return {
              data: data,
              label: $ctrl.groups[i],
              borderColor: $ctrl.color[i],
              backgroundColor: $ctrl.color[i],
              hoverBackgroundColor: $ctrl.color[i],
              fill: false,
            };
          });
          labels = $ctrl.items;
          let maxData = Math.max.apply(Math, $ctrl.data.map(data => Math.max.apply(Math, data)));
          options = {
            scales: {
              yAxes: [{
                ticks: {
                  stepSize: Math.max(1, Math.ceil(maxData / 5)),
                  beginAtZero: true,
                }
              }]
            }
          };
        }
        let chartData = angular.copy({
          type: $ctrl.type,
          data: {
            labels: labels,
            datasets: datasets,
          },
          options: Object.assign({
            legend: {
              display: false,
            },
            responsive: true,
            layout: {
              padding: 20,
            },
          }, options, $ctrl.options || {}),
        });
        script.then(() => {
          setTimeout(() => chart = new Chart(canvas, chartData), 100);
        });
      };
      $scope.$watchGroup(['$ctrl.data', '$ctrl.labels', '$ctrl.color', '$ctrl.type'], function () {
        repaint();
      });
    }]
  });
  /*
   * <line-chart> 线图
   *
   * chart-title （字符串） 图表标题
   * groups （数组） 表示每条线的信息，包括如下键
   *   * legend （字符串） 图例的名称
   *   * color （字符串） 线的颜色
   * empty-text （字符串） 当无数据时显示的文本
   * legend-position （字符串） 图例的位置，可选 right 和 bottom
   * on-legend-mouseenter （回调） 鼠标移动到图例上时
   * on-legend-mouseleave （回调） 鼠标移动到图例外时
   * on-legend-click （回调） 鼠标点击图例时
   *
   * 你可以通过 chartHandler.get(容器元素ID) 获取到线图的句柄，有如下方法：
   * getDygraph 获取 Dygraph 对象
   * updateOptions 更新 Dygraph 的设置
   * updateData 更新数据
   */
  formInputs.component('lineChart', {
    template: `
      <chart-container
        chart-title="{{ $ctrl.chartTitle }}"
        groups="$ctrl.groups"
        color="$ctrl.color"
        legend-position="{{ $ctrl.legendPosition }}"
        empty-text="{{ $ctrl.emptyText }}"
        no-data="!$ctrl.data"
        on-legend-mouseenter="$ctrl.onLegendMouseenter({ legend: legend })"
        on-legend-mouseleave="$ctrl.onLegendMouseleave({ legend: legend })"
        on-legend-click="$ctrl.onLegendClick({ legend: legend })"
        class="dygraph chart chart-line"
        id="{{ $ctrl.id }}"
        chart-height="{{ $ctrl.chartHeight || '100%' }}"
      >
        <div class="dygraph-chart-container"></div>
      </chart-container>
    `,
    bindings: {
      chartTitle: '@',
      groups: '<',
      color: '<',
      emptyText: '@',
      chartHeight: '@',
      legendPosition: '@',
      onLegendMouseenter: '&',
      onLegendMouseleave: '&',
      onLegendClick: '&',
      data: '<?',
    },
    controller: ['$scope', '$timeout', 'chartHandler', function ($scope, $timeout, chartHandler) {
      const $ctrl = this;
      $ctrl.id = genUniqueId();
      // 注册句柄以供外部调用
      let dygraph = null;
      let handler = null;
      $timeout(function init() {
        let element = document.getElementById($ctrl.id);
        let dygraphElement = element.getElementsByClassName('dygraph-chart-container')[0];

        dygraph = new Dygraph(dygraphElement, $ctrl.data || [], {
          labels: ['x', ...$ctrl.groups],
          connectSeparatedPoints: true,
          drawPoints: true,
          interactionModel: {},
          colors: $ctrl.color,
          plotter: smoothPlotter,
        });

        if (!handler) {
          handler = {
            getDygraph() { return dygraph; },
            updateOptions(...args) {
              return dygraph.updateOptions(...args);
            },
            updateData(newData) {
              $ctrl.data = newData;
              dygraph.updateOptions({ 'file': newData });
            },
          };

          chartHandler.set(element, handler);
          $scope.$on('$destory', () => { chartHandler.del(element); });
        }
      });

    }],
  });

  // 使用 Dygraph 绘制线图时，可以在 <dygraph>元素上使用 chartHandler.get(element_or_id) 获取图表的句柄
  // 可以利用这个句柄更新数据及进行更多操作
  formInputs.service('chartHandler', ['$timeout', 'api', function ($timeout, api) {
    let charts = [];
    let waiting = [];
    const isMatchElement = function (matcher, content) {
      return matcher === content || matcher.firstElementChild === content;
    };
    const resolveWaiting = function (matcher) {
      waiting = waiting.filter(({ matcher, resolve }) => {
        let { chart } = charts.filter(({ content }) => isMatchElement(matcher, content))[0] || {};
        if (chart) resolve(chart); else return true;
        return false;
      });
    };
    this.get = function (matcher) {
      return new api.SimplePromise(resolve => {
        if (typeof matcher === 'string') $timeout(() => {
          matcher = document.getElementById(matcher);
          if (matcher) waiting.push({ matcher, resolve });
          resolveWaiting();
        }); else waiting.push({ matcher, resolve });
        resolveWaiting();
      });
    };
    this.set = function (content, chart) {
      charts.push({ content, chart });
      resolveWaiting();
    };
    this.del = function (content) {
      this.set(content, null);
      charts = charts.filter(({ c: content }) => c !== content);
    };
  }]);


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
    template: `
      <form-multiple-select
        options="$ctrl.userListFiltered"
        ng-model="$ctrl.ngModel"
        placeholder="{{ $ctrl.placeholder || '' }}"
        is-loading="$ctrl.isLoading"
        loading-text="正在获取用户列表"
      ></form-multiple-select>
    `,
    bindings: {
      notInList: '<?',
      ngModel: '=',
      placeholder: '@',
    },
    controller: ['$scope', 'api', function ($scope, api) {
      const $ctrl = this;
      $ctrl.allUsers = [];
      $ctrl.userListFiltered = [];
      $ctrl.isLoading = true;
      const updateFiltered = function () {
        if ($ctrl.isLoading) return;
        $ctrl.userListFiltered = $ctrl.allUsers.filter(user => ($ctrl.notInList || []).indexOf(user.id) === -1);
      };
      api.user.list().then(userList => {
        $ctrl.allUsers = userList.map(user => ({
          value: user,
          text: user.name,
          id: user.id,
        }));
        $ctrl.isLoading = false;
        updateFiltered();
      }).catch(error => angular.noop());
      $scope.$watch('$ctrl.notInList', function () {
        updateFiltered();
      }, true);
    }],
  });
  /*
   * <member-collection-select> 用于展示用户组下拉单选框
   *
   * type （文本） 用户组的类型
   * ngModel （双向） 选中的用户组
   * placeholder （文本） 预定义文字
   */
  formInputs.component('memberCollectionSelect', {
    template: `
      <form-select
        options="$ctrl.options"
        ng-model="$ctrl.ngModel"
        placeholder="{{ $ctrl.placeholder || '' }}"
        is-loading="$ctrl.loadingTypes[$ctrl.type] !== false"
        loading-text="正在加载列表"
        empty-text="无相关用户组信息"
      ></form-select>
    `,
    bindings: {
      type: '@',
      ngModel: '=',
      placeholder: '@',
      notInList: '<?',
    },
    controller: ['$scope', 'api', function ($scope, api) {
      const $ctrl = this;
      let validTypes = [];
      let loadedTypes = {};
      $ctrl.loadingTypes = {};
      $ctrl.options = [];
      const loadDone = function () {
        if (!loadedTypes[$ctrl.type]) return;
        $ctrl.options = loadedTypes[$ctrl.type]
          .map(collection => ({ value: collection, text: collection.name }))
          .filter(collection => ($ctrl.notInList || []).every(shouldNot => {
            return shouldNot.id !== collection.value.id ||
              shouldNot.type !== collection.value.type;
          }));
      };
      const triggerLoading = function () {
        if (validTypes.indexOf($ctrl.type) === -1) return;
        if ($ctrl.loadingTypes[$ctrl.type]) return;
        if (loadedTypes[$ctrl.type]) loadDone();
        else {
          let type = $ctrl.type;
          $ctrl.loadingTypes[type] = true;
          $ctrl.options = [];
          $ctrl.ngModel = null;
          api.memberCollection.listByType(type).then(collections => {
            $ctrl.loadingTypes[type] = false;
            loadedTypes[type] = collections;
            loadDone();
          });
        }
      };
      api.memberCollection.getTypes().then(types => {
        validTypes = types;
        triggerLoading();
      });
      $scope.$watch('$ctrl.type', triggerLoading);
      $scope.$watch('$ctrl.notInList', triggerLoading);
    }],
  });
  /*
   * <collection-member-table> 成员管理模块
   */
  formInputs.component('collectionMemberTable', {
    template: `
      <div class="collection-member-table-container">
        <form-multiple-inline content-type="search">
          <form-multiple-inline-item class="collection-member-edit-button-container">
            <form-button-collection>
              <form-input-checkbox value="'MEMBER'" value-false="null" ng-model="$ctrl.addingTypeOne" on-change="$ctrl.addingType = $ctrl.addingTypeOne; $ctrl.addingTypeMulti = null; $ctrl.addingShown = true;" ng-init="$ctrl.addingTypeOne = null" appearance="button">逐个添加成员</form-input-checkbox>
              <form-input-checkbox value="'GROUP'" value-false="null" ng-model="$ctrl.addingTypeMulti" on-change="$ctrl.addingType = $ctrl.addingTypeMulti; $ctrl.addingTypeOne = null; $ctrl.addingShown = true;" ng-init="$ctrl.addingTypeMulti = null" appearance="button">批量导入成员</form-input-checkbox>
            </form-button-collection>
          </form-multiple-inline-item>
          <form-multiple-inline-item class="collection-member-count-container">
            <span>
              共
              <span ng-show="$ctrl.searchText">
                <span class="collection-member-count-filtered" ng-bind="(($ctrl.ngModel.length ? $ctrl.ngModel : []) | filter:{ name: $ctrl.searchText }).length"></span>
                /
              </span>
              <span>
                <span class="collection-member-count-total" ng-bind="$ctrl.ngModel.length"></span>
              </span>
              位成员
            </span>
          </form-multiple-inline-item>
          <form-multiple-inline-item class="collection-member-search-container">
            <form-search-box ng-init="$ctrl.searchText = ''" ng-model="$ctrl.searchText" placeholder="搜索项目成员"></form-search-box>
          </form-multiple-inline-item>
        </form-multiple-inline>
        <form-help-line ng-if="$ctrl.helpText">
          <icon-info></icon-info> <span ng-bind="$ctrl.helpText"></span>
        </form-help-line>
        <div class="collection-member-adding-panel" ng-show="$ctrl.addingType" ng-if="$ctrl.addingShown">
          <form-multiple-inline algin="left">
            <form-multiple-inline-item class="collection-member-group-type-selector-container" ng-show="$ctrl.addingType === 'GROUP'">
              <script id="collectionMemberTypeTemplate" type="text/ng-template">
                <span ng-bind="option.text"></span>
              </script>
              <form-select
                class="collection-member-type-radio"
                options="[
                  { value: 'PROJECT_COLLECTION', text: '导入项目成员' },
                  { value: 'DEPLOY_COLLECTION', text: '导入服务成员' },
                  { value: 'CLUSTER', text: '导入集群成员' },
                  { value: 'CONFIGURATION_COLLECTION', text: '导入配置管理成员' },
                  { value: 'LOADBALANCER_COLLECTION', text: '导入负载均衡成员' },
                ]"
                ng-model="$ctrl.groupType"
                ng-init="$ctrl.groupType = 'PROJECT_COLLECTION'"
                show-search-input="never"
                card-template="collectionMemberTypeTemplate"
              ></form-input-radio-group>
            </form-multiple-inline-item>
            <form-multiple-inline-item class="collection-member-users-selector-container">
              <multiple-user-select
                ng-show="$ctrl.addingType === 'MEMBER'"
                ng-model="$ctrl.chosedMemberList"
                placeholder="选择用户以添加"
              ></multiple-user-select>
              <member-collection-select
                ng-show="$ctrl.addingType === 'GROUP'"
                type="{{ $ctrl.groupType }}"
                ng-model="$ctrl.chosedGroup"
                placeholder="选择{{ ({
                  PROJECT_COLLECTION : '项目',
                  DEPLOY_COLLECTION : '服务',
                  CLUSTER : '集群',
                  STORAGE_CLUSTER : '存储',
                  CONFIGURATION_COLLECTION : '配置管理',
                  LOADBALANCER_COLLECTION : '负载均衡'
                })[$ctrl.groupType] }}以导入"
                not-in-list="[{ type: $ctrl.collectionType, id: $ctrl.collectionId }]"
              ></member-collection-select>
            </form-multiple-inline-item>
            <form-multiple-inline-item class="collection-member-role-selector-container">
              <form-select
                ng-show="$ctrl.addingType === 'MEMBER'"
                options="[
                  { value: 'MASTER', text: 'MASTER' },
                  { value: 'DEVELOPER', text: 'DEVELOPER' },
                  { value: 'REPORTER', text: 'REPORTER' },
                ]"
                ng-init="$ctrl.addingMemberRole = 'MASTER'"
                show-search-input="never"
                ng-model="$ctrl.addingMemberRole"
              ></form-select>
              <form-select
                ng-show="$ctrl.addingType !== 'MEMBER'"
                options="[
                  { value: 'MASTER', text: 'MASTER' },
                  { value: 'DEVELOPER', text: 'DEVELOPER' },
                  { value: 'REPORTER', text: 'REPORTER' },
                  { value: 'DEFAULT', text: '保留组内权限设置' },
                ]"
                ng-init="$ctrl.addingGroupRole = 'DEFAULT'"
                show-search-input="never"
                ng-model="$ctrl.addingGroupRole"
              ></form-select>
            </form-multiple-inline-item>
            <form-multiple-inline-item class="collection-member-add-button-container">
              <button class="collection-member-new-button" type="button" ng-click="$ctrl.addMember()" ng-bind="$ctrl.addingType === 'MEMBER' ? '添加' : '导入'"></button>
            </form-multiple-inline-item>
          </form-multiple-inline>
        </div>
        <script id="collectionMemberTableTemplate" type="text/ng-template">
          <div ng-if="edit && column.key === 'role'">
            <form-select
              ng-model="row.role"
              options="[
                {value: 'MASTER', text: 'MASTER'},
                {value: 'DEVELOPER', text: 'DEVELOPER'},
                {value: 'REPORTER', text: 'REPORTER'}
              ]"
              show-search-input="never"
            ></form-select>
          </div>
          <div ng-if="!edit || column.key !== 'role'">
            <div ng-bind="value"></div>
          </div>
        </script>
        <form-table
          class="collection-member-table"
          ng-model="$ctrl.value"
          columns="[{text: '成员', key: 'name'}, {text: '组内角色', key: 'role'}]"
          template="collectionMemberTableTemplate"
          filter="{ name: $ctrl.searchText }"
          empty-text="{{ $ctrl.loading ? '正在获取成员列表，请稍候' : ($ctrl.searchText ? '无匹配成员信息' : '无成员信息') }}"
          edited-data="$ctrl.editedData"
          on-save="$ctrl.updateUserRole(data)"
          on-delete="$ctrl.removeUser(data)"
          no-edit="$ctrl.noEdit"
          no-delete="$ctrl.noDelete"
        ></form-table>
        <div class="collection-member-loading-cover" ng-show="$ctrl.loading">
        </div>
      </div>
    `,
    bindings: {
      ngModel: '=?',
      collectionType: '<?',
      collectionId: '<?',
      onNoPermission: '&?',
      onRoleChange: '&',
      helpText: '@',
    },
    controller: ['$scope', 'api', 'dialog', function ($scope, api, dialog) {
      const $ctrl = this;
      $ctrl.loading = false;
      $ctrl.userRole = null;
      const question = (...args) => dialog.continue(...args).then(button => {
        if (button === dialog.button.BUTTON_OK) return;
        throw '';
      });

      const roles = ['MASTER', 'DEVELOPER', 'REPORTER', 'GUEST'];
      const roleLevel = role => (roles.indexOf(role) + 1) || roles.length;
      const downgradeOwnRoleNeedConfirm = function (newRole) {
        let warningText = null;
        if (newRole) warningText = `您将要把自己的权限降低为${newRole}，修改后您可能无法继续编辑成员信息或执行部分管理操作，确认要继续吗？`;
        else warningText = '您将要把自己从成员列表中删除，删除后您将不能继续访问相关资源，确认要继续吗？';
        return api.SimplePromise.resolve(question('您的权限即将发生变化', warningText));
      };
      const deleteMemberConfirm = function (username) {
        return api.SimplePromise.resolve(question('确认删除成员', `您将要把${username}从成员列表中删除，确认要继续吗？`));
      };
      // 添加成员
      $ctrl.addMember = function () {
        if (!$ctrl.currentCollection) return;
        let memberGetter;
        if ($ctrl.addingType === 'MEMBER') {
          if (!$ctrl.chosedMemberList || !$ctrl.chosedMemberList.length) return;
          let newMembers = $ctrl.chosedMemberList
            .map(user => ({ id: user.id, role: $ctrl.addingMemberRole }));
          memberGetter = api.SimplePromise.resolve(newMembers);
        } else {
          if (!$ctrl.chosedGroup) return;
          memberGetter = api.memberCollection.get($ctrl.chosedGroup);
          if ($ctrl.addingGroupRole !== 'DEFAULT') {
            memberGetter = memberGetter.then(userList => {
              userList.forEach(user => { user.role = $ctrl.addingGroupRole; });
              return userList;
            });
          }
        }
        $ctrl.loading = true;
        memberGetter
          .then(userList => api.memberCollection.add($ctrl.currentCollection, userList))
          .then(() => {
            $ctrl.chosedMemberList = [];
            $ctrl.chosedGroup = void 0;
          }, error => {
            dialog.error('操作失败', error.message || '添加用户时发生错误');
          })
          .catch(error => { dialog.error('操作失败', error.message || '获取组成员时发生错误'); })
          .then(() => fetchCollectionInfo())
          .then(() => { $ctrl.loading = false; });
      };
      // 修改权限
      $ctrl.updateUserRole = function (data) {
        $ctrl.loading = true;
        let confirm = null;
        if (data.id === $ctrl.myInfo.id && roleLevel(data.role) > roleLevel($ctrl.userRole) && !$ctrl.myInfo.isAdmin) {
          confirm = downgradeOwnRoleNeedConfirm(data.role);
        } else confirm = api.SimplePromise.resolve();
        confirm
          .then(() => api.memberCollection.modify($ctrl.currentCollection, data), () => { })
          .catch(error => { dialog.error('操作失败', error.message || '修改权限时放生错误'); })
          .then(() => fetchCollectionInfo())
          .then(() => { $ctrl.loading = false; });
      };
      // 删除用户
      $ctrl.removeUser = function (data) {
        $ctrl.loading = true;
        let confirm = null;
        if (data.id === $ctrl.myInfo.id && !$ctrl.myInfo.isAdmin) {
          confirm = downgradeOwnRoleNeedConfirm();
        } else confirm = deleteMemberConfirm(data.name);
        confirm
          .then(() => api.memberCollection.delete($ctrl.currentCollection, data), () => { })
          .catch(error => { dialog.error('操作失败', error.message || '删除用户时发生错误'); })
          .then(() => fetchCollectionInfo())
          .then(() => { $ctrl.loading = false; });
      };
      $ctrl.ngModel = [];
      $ctrl.value = [];
      $ctrl.noEdit = [];
      $ctrl.noDelete = [];
      $ctrl.editedData = {};
      const updateCollectionInfo = function (members, me, role) {
        $ctrl.ngModel = members;
        $ctrl.noEdit = [];
        $ctrl.noDelete = [];
        // 非 MASTER 只能删掉自己
        if (role !== 'MASTER') {
          $ctrl.noEdit = members.slice(0);
          $ctrl.noDelete = members.filter(user => user.id !== me.id);
        }
        // 最后一个 MASTER 不能被删除
        let masterList = members.filter(user => user.role === 'MASTER');
        if (masterList.length === 1) {
          $ctrl.noEdit.push(masterList[0]);
          $ctrl.noDelete.push(masterList[0]);
        }
        // 更新表信息但保留编辑状态
        let oldEditedDataById = {}, oldValueById = {};
        let newValue = angular.copy(members);
        Object.keys($ctrl.editedData).forEach(i => {
          let data = $ctrl.editedData[i];
          oldEditedDataById[data.id] = data;
          oldValueById[data.id] = $ctrl.value[i];
        });
        let newEditedData = {};
        members.forEach((user, index) => {
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
      const fetchCollectionInfo = function (collection) {
        if (collection == null) collection = $ctrl.currentCollection;
        let getRole = api.memberCollection.myRole(collection);
        let getMyInfo = api.user.whoami();
        let getMember = api.memberCollection.get(collection);
        getRole.then(role => {
            $ctrl.userRole = role;
            $ctrl.onRoleChange({ role });
        });
        getMyInfo.then(me => { $ctrl.myInfo = me; });
        return api.SimplePromise.all([getMember, getMyInfo, getRole]).then(([members, me, role]) => {
          if (collection.id !== $ctrl.collectionId) return;
          if (collection.type !== $ctrl.collectionType) return;
          $ctrl.currentCollection = collection;
          updateCollectionInfo(members, me, role);
        }).catch(error => {
          return getRole.then(role => {
            if (role === 'GUEST' && $ctrl.onNoPermission) $ctrl.onNoPermission();
            else throw error;
          }).catch(error => {
            dialog.error('操作失败', error.message || '获取成员信息时发生错误');
          });
        });
      };
      // 处理 collection 信息初始化或指定的 collection 发生变化的情况
      const initialCurrentCollection = function (collection) {
        clearCurrentCollection();
        return fetchCollectionInfo(collection);
      };
      const clearCurrentCollection = function () {
        $ctrl.ngModel = (void 0);
        $ctrl.currentCollection = null;
        $ctrl.role = null;
        $ctrl.editedData = {};
        return api.SimplePromise.resolve();
      };
      const inputCollectionInfo = function () {
        let currentCollection;
        if (!$ctrl.collectionType || !$ctrl.collectionId) currentCollection = null;
        currentCollection = { type: $ctrl.collectionType, id: $ctrl.collectionId };
        let loadCollection;
        if (currentCollection) loadCollection = initialCurrentCollection(currentCollection);
        else loadCollection = clearCurrentCollection();
        $ctrl.loading = true;
        loadCollection.then(() => $ctrl.loading = false);
      };
      $scope.$watchGroup(['$ctrl.collectionType', '$ctrl.collectionId'], inputCollectionInfo);
    }],
  });
  /*
   * 以下包括历史遗留代码，需要清理
   */
  /*
   * 选择镜像的下拉菜单
   */
  formInputs.component('formSelectorImage', {
    template: `
      <div class="com-select-con add-mirror" select-con>
        <input class="ui-input-white ui-btn-select input-image"
          placeholder="{{ $ctrl.placeholder }}" ng-model="imageKey" />
        <ul class="select-list">
          <li class="select-item" ng-repeat="image in $ctrl.imageList | filter: { 'imageName': imageKey }">
            <a ng-click="$ctrl.choseImage(image)"><span ng-bind="image.imageName"></span><span class="txt-prompt pull-right" ng-bind="image.registry"></span></a>
          </li>
        </ul>
      </div>
    `,
    bindings: {
      onImageSelected: '&',
      imageList: '<',
      placeholder: '<',
    },
    controller: [function () {
      const $ctrl = this;
      $ctrl.choseImage = function (image) {
        $ctrl.onImageSelected({ image });
      };
    }],
  });
  formInputs.component('formSelectorProjectImage', {
    template: `
      <form-selector-image
        on-image-selected="$ctrl.subOnImageSelected(image)"
        image-list="$ctrl.imageList"
        placeholder="$ctrl.placeholder"
      ></form-selector-image>
    `,
    bindings: {
      onImageSelected: '&',
    },
    controller: ['$http', function ($http) {
      const $ctrl = this;
      $ctrl.placeholder = '选择镜像';
      $ctrl.imageList = [];
      $http.get('/api/image').then((res) => {
        let imageList = res.data.result || [];
        Array.prototype.push.apply($ctrl.imageList, imageList);
      });
      $ctrl.subOnImageSelected = function (image) {
        $ctrl.onImageSelected({ image });
      };
    }],
  });
  /*
  * <add-multiple-member>
  *
  * chosenUserList = [{id:id, name:name, memberRole:memberRole}]
  *
  * */
  formInputs.component('addMultipleMember', {
        template: `
        <div class="collection-member-adding-panel">
            <form-multiple-inline algin="left">
                <form-multiple-inline-item class="collection-member-users-selector-container">
                    <multiple-user-select ng-model="$ctrl.addingUserList" placeholder="选择成员"></multiple-user-select>
                </form-multiple-inline-item>
                <form-multiple-inline-item class="collection-member-role-selector-container">
                    <form-select ng-init="$ctrl.addingUserRole = 'MASTER'" ng-model="$ctrl.addingUserRole" options="[{ value: 'MASTER', text: 'MASTER' }, { value: 'DEVELOPER', text: 'DEVELOPER'}, {value: 'REPORTER', text: 'REPORTER'}]" show-search-input="never")></form-select>
                </form-multiple-inline-item>
                <form-multiple-inline-item class="collection-member-add-button-container">
                    <button class="collection-member-new-button" type="button" ng-click="$ctrl.addUser()">添加</button>
                </form-multiple-inline-item>
            </form-multiple-inline>
        </div>
        <form-table 
            ng-model="$ctrl.chosenUserList" 
            template="chosenUserTable" 
            columns="[
                {text: '成员名称', key: 'name', width: '50%'},
                {text: '角色权限', key: 'role', width: '35%'}
            ]"
            on-delete 
            no-delete="$ctrl.noDelete" 
            compare-key="id"
            param="{myself: $ctrl.myself}"
        ></form-table>
        <script type="text/ng-template" id="chosenUserTable">
            <div ng-if="column.key === 'name'" ng-bind="value"></div>
            <div ng-if="param.myself.id !== row.id && column.key === 'role'">
                <form-select
                    ng-model="row.role"
                    options="[
                        {value: 'MASTER', text: 'MASTER'},
                        {value: 'DEVELOPER', text: 'DEVELOPER'},
                        {value: 'REPORTER', text: 'REPORTER'}
                      ]"
                    show-search-input="never"
                ></form-select>
            </div>
            <div ng-if="param.myself.id == row.id && column.key === 'role'" ng-bind="value"></div>
        </script>`,
        bindings: {
            chosenUserList: '=?'
        },
        controller: ['api', function (api) {
            const $ctrl = this;
            // $ctrl.chosenUserList = [{id:id, name:name, memberRole:memberRole}]
            $ctrl.chosenUserList = [];
            $ctrl.noDelete = [];
            api.user.whoami().then(response => {
                let whoami = response;
                $ctrl.myself = {id: whoami.id, name: whoami.name, role: 'MASTER'};
                $ctrl.noDelete.push($ctrl.myself);
                $ctrl.chosenUserList.push({id: whoami.id, name: whoami.name, role: 'MASTER'});
            });

            $ctrl.addUser = function () {
                $ctrl.addingUserList.map((addingUser) => {
                    if ($ctrl.chosenUserList.every(choseUser => choseUser.id !== addingUser.id)) {
                        $ctrl.chosenUserList.push({id: addingUser.id, name: addingUser.name, role: $ctrl.addingUserRole});
                    }
                });
                $ctrl.addingUserList = [];
            };
        }]
  });
    /**
     * <cluster-selector> 集群下拉菜单
     * name （字符串）组件名称，可用于表单验证
     * ng-model （双向，集群对象） 绑定集群对象 {id, name, logConfig, ...}
     * on-change （回调） 值发生变化时的回调函数
     * required （布尔） 用于表单验证该项必填
     */
  formInputs.component('clusterSelector', {
      template: `
      <form-select 
        ng-model="$ctrl.ngModel" 
        name="$ctrl.name" 
        options="$ctrl.clusterSelectorList" 
        placeholder="请选择集群" 
        on-change="$ctrl.toggleCluster()" 
        show-search-input="never" 
        ng-required="$ctrl.required"
        is-loading="$ctrl.isLoadingCluster" 
        loading-text="正在获取集群" 
        empty-text="无相关集群信息">
      </form-select>
      `,
      bindings: {
          name: '@',
          ngModel: '=?',
          onChange: '&',
          required: '@',
      },
      controller: ['$scope', 'api', '$timeout', function($scope, api, angularTimeout) {
          const $ctrl = this;
          $ctrl.isLoadingCluster = true;
          api.cluster.listCluster().then(response => {
              let clusterList = response || [];
              $ctrl.clusterSelectorList = clusterList.map(cluster => ({ text: cluster.name, value: cluster }));
              if (clusterList.length > 0) {
                  if($ctrl.ngModel) {
                      $ctrl.ngModel = clusterList.forEach(cluster => {
                          if(cluster.id === $ctrl.ngModel.id) {
                              return cluster;
                          }
                      });
                  } else {
                      $ctrl.ngModel = clusterList[0];
                  }
              }
          }).catch(exception => {
              console.log('clusterSelector list exception: ', exception);
          }).then(() => {
            $ctrl.isLoadingCluster = false;
          });
          const $timeout = scopedTimeout(angularTimeout, $scope);
          $ctrl.toggleCluster = function () {
              $timeout(() => { $ctrl.onChange() });
          };
      }],
  });
    /**
     * <namespace-selector> namespace 下拉选择框，并可新建namespace（可检验重复）
     *
     * name （字符串）组件名称，可用于表单验证
     * ng-model （双向，namespace对象） 绑定对象 {name, isExistentNamespace}
     * on-change （回调） 值发生变化时的回调函数
     * cluster （单项，集群对象，必填） 用于查询namespace
     * formName （单项） 组件所在form的名称，用于表单验证该项必填
     */
  formInputs.component('namespaceSelector', {
      template: `
      <form-with-button width="150px">
          <content-area>
            <form-select ng-if="$ctrl.isDisplayExistentNamespace()" ng-model="$ctrl.value.namespace" name="{{ $ctrl.name + 'selector' }}" on-change="$ctrl.toggleNamespace()" options="$ctrl.namespaceSelectorList" placeholder="请选择namespace" required="true" is-loading="isLoadingNamespace" loading-text="正在获取namespace" empty-text="无相关信息"></form-select>
            <input ng-if="!$ctrl.isDisplayExistentNamespace()" ng-model="$ctrl.value.namespace" type="text" name="{{ $ctrl.name + 'input' }}" placeholder="新建namespace" required is-namespace-Unique ng-pattern="/^[a-zA-Z][a-zA-Z0-9_-]*$/" clusterid="{{$ctrl.cluster.id}}" ng-model-options="{updateOn:'default blur',debounce:{default:500,blur:0}}" />
            <form-error-message form="$ctrl.formName" target="{{ $ctrl.name + 'selector' }}" type="required">namespace不能为空，请新建或者更改集群</form-error-message>
            <form-error-message form="$ctrl.formName" target="{{ $ctrl.name + 'input' }}" type="required">namespace不能为空</form-error-message>
            <form-error-message form="$ctrl.formName" target="{{ $ctrl.name + 'input' }}" type="isNamespaceUnique"> namespace已存在，请修改后重试！</form-error-message>
            <form-error-message form="$ctrl.formName" target="{{ $ctrl.name + 'input' }}" type="pattern"> namespace格式错误，请修改后重试！</form-error-message>
          </content-area>
        <button-area>
            <button type="button" ng-click="$ctrl.toggleNamespaceFillInType()"> {{ $ctrl.namespaceFillInType[$ctrl.value.isExistentNamespace] }} </button>
        </button-area>
      </form-with-button>
      `,
      bindings: {
          name: '@',
          ngModel: '=?',
          onChange: '&',
          cluster: '<?',
          formName: '<?',
      },
      controller: ['$scope', 'api', '$timeout', function ($scope, api, angularTimeout) {
          const $ctrl = this;
          $ctrl.value = {
              isExistentNamespace: true, // true：列表中已有，false：新建namespace
              namespace: null,
          };
          $ctrl.namespaceFillInType = {
              true: '新建namespace',
              false: '选择已有namespace',
          };
          $ctrl.isLoadingNamespace = true;
          const getNamespace = function() {
              if($ctrl.cluster && $ctrl.cluster.id) {
                  api.cluster.getNamespace($ctrl.cluster.id).then(response => {
                      let namespaceList = response || [];
                      $ctrl.namespaceSelectorList = [];
                      namespaceList.forEach(function (namespace) {
                          if (namespace.name === 'default') {
                              $ctrl.value.namespace = namespace.name;
                          }
                          $ctrl.namespaceSelectorList.push({
                              text: namespace.name,
                              value: namespace.name
                          });
                      });
                      if (namespaceList.length > 0 && $ctrl.value.namespace == null) {
                          $ctrl.value.namespace = namespaceList[0].name;
                      } else if (namespaceList.length === 0 && $ctrl.value.isExistentNamespace) {
                          $ctrl.value.namespace = null;
                      }
                      $ctrl.isLoadingNamespace = false;
                  }).catch(exception => {
                      $ctrl.isLoadingNamespace = false;
                      console.log('exception: ', exception);
                  });
              }
          };
        const $timeout = scopedTimeout(angularTimeout, $scope);
        $ctrl.toggleNamespace = function () {
          $timeout(()=> {$ctrl.onChange()});
        };
          $ctrl.isDisplayExistentNamespace = function() {
              return $ctrl.value.isExistentNamespace;
          };
          let namespace = "";
          $ctrl.toggleNamespaceFillInType = function () {
              if ($ctrl.value.isExistentNamespace) {
                  namespace = $ctrl.ngModel.namespace;
                  $ctrl.value.namespace = null;
              } else {
                  $ctrl.value.namespace = namespace;
              }
              $ctrl.value.isExistentNamespace = !$ctrl.value.isExistentNamespace;
          };
          $scope.$watch('$ctrl.cluster', getNamespace);
          $scope.$watch('$ctrl.value', function(){$ctrl.ngModel = $ctrl.value});
      }],
  });

    /**
   * <form-multiple-select-list> 多选下拉列表组件
   * ng-model (双向，数组)已选择主机标签
   * parameters 查询参数
   * name 用于对应报错信息
   * formName
   * placeholder
   * emptyText
   * errorMessage
   * getListFn 获取列表函数
   */
  formInputs.component("formMultipleSelectList", {
    template: `
        <form-multiple-select name="{{ $ctrl.name || ''}}" ng-model="$ctrl.value" on-change="$ctrl.output()" 
        options="$ctrl.candidateList" placeholder="{{$ctrl.placeholder || '' }}" is-loading="$ctrl.isLoading" loading-text=" {{ $ctrl.loadingText || '' }}" empty-text="{{ $ctrl.emptyText || '' }}" required="true">
        </form-multiple-select>
        <form-error-message form="$ctrl.formName" target="{{ $ctrl.name || ''}}" type="required">{{$ctrl.errorMessage || ''}}</form-error-message>
      `,
    bindings: {
      ngModel: '=?',
      parameters: '<?',
      formName: '<?',
      placeholder: '@',
      loadingText: '@',
      emptyText: '@',
      errorMessage: '@',
      name: '@',
      getListFn: '@',
    },
    controller: ['$scope', 'api', '$filter', function ($scope, api, $filter) {
      const $ctrl = this;
      $ctrl.candidateList = [];
      let getCandidatesPromise = api.SimplePromise.resolve({});
      const getList = function () {
        if (Object.keys($ctrl.parameters).filter(k => $ctrl.parameters[k] === void 0).length) return;
        if (!$ctrl.getListFn) return;
        
        $ctrl.isLoading = true;
        getCandidatesPromise = api.listItem[$ctrl.getListFn]($ctrl.parameters).then(response => {
          $ctrl.candidateList = response;
          return {
            parameters: $ctrl.parameters,
            result: response
          };
        });
        getCandidatesPromise.catch(() => { })
          .then(() => {
            $ctrl.isLoading = false;
            $ctrl.input();
          });
      };

      $ctrl.input = function () {
        if (!angular.isArray($ctrl.ngModel)) return;
        if (($ctrl.ngModel || []).length === 0) return;
        
          getCandidatesPromise.then(response => {
            if (angular.equals(response.parameters, $ctrl.parameters)) {
              let selected = [];
              $ctrl.ngModel.forEach(selectedItem => {
                response.result.forEach(element => {
                  if(angular.isObject(selectedItem)){
                    if ($filter('filter')([selectedItem], element.match, true).length) {
                      selected.push(element.value);
                    }
                  }
                  else{
                    if(selectedItem === element.match){
                      selected.push(element.value);
                    }
                  }
                })
              })
              $ctrl.value = selected;
              $ctrl.output();
            }
          });
        
      };

      $ctrl.output = function () {
        if (!angular.equals($ctrl.ngModel, $ctrl.value)) $ctrl.ngModel = $ctrl.value;
      };

      $scope.$watch('$ctrl.parameters', getList, true);
      $scope.$watch('$ctrl.getListFn', getList);
      $scope.$watch('$ctrl.ngModel', $ctrl.input);
    }],
  });

  /**
   * <form-select-list>  单选下拉列表组件   lb-related-deployment
   * name 组件名称
   * ng-model
   * form-name 
   * parameters
   * loadingText
   * emptyText
   * placeholder
   * errorMessage
   * getListFn 获取列表函数
   * on-change 回调函数
   */
  formInputs.component('formSelectList', {
    template: `
      <form-select ng-model="$ctrl.value" name="{{ $ctrl.name }}" on-change="$ctrl.toggle()" options="$ctrl.candidateList" show-search-input="always" placeholder="{{$ctrl.placeholder}}" is-loading="$ctrl.isLoading" loading-text="{{$ctrl.loadingText}}" empty-text="{{$ctrl.emptyText}}" required="true"></form-select>
      <form-error-message form="$ctrl.formName" target="{{ $ctrl.name }}" type="required">{{$ctrl.errorMessage}}</form-error-message>
    `,
    bindings: {
      name: '@',
      ngModel: '=?',
      formName: '<?',
      fallbackOptions:'<?',
      parameters: '<?',
      onChange: '&',
      loadingText: '@',
      emptyText: '@',
      placeholder: '@',
      errorMessage: '@',
      getListFn: '@',
    },
    controller: ['$scope', 'api', '$timeout', '$filter', function ($scope, api, $timeout, $filter) {
      const $ctrl = this;
      $ctrl.candidateList = [];
      let getCandidatesPromise = api.SimplePromise.resolve({});
      const getList = function () {
        if(Object.keys($ctrl.parameters).filter(k=>$ctrl.parameters[k] === void 0).length) return
        if(Object.keys($ctrl.parameters).filter(k=>$ctrl.parameters[k] === null).length) return
        if (!$ctrl.getListFn) return;
        
        $ctrl.isLoading = true;

        getCandidatesPromise = api.listItem[$ctrl.getListFn]($ctrl.parameters).then(response => {
          if($ctrl.fallbackOptions&&$ctrl.fallbackOptions.text&&$ctrl.fallbackOptions.value){
            if(!response.some((element)=>{
              if(element.text===$ctrl.fallbackOptions.text){
                return true;
              }
              return false;
            }))
            response.push($ctrl.fallbackOptions);
          }
          $ctrl.candidateList = response;
          return {
            parameters: $ctrl.parameters,
            result:response
          }
        })
        getCandidatesPromise.catch(() => { }).then(() => {
          $ctrl.isLoading = false;
          $ctrl.input();
        })
      };

      $ctrl.input = function () {
        if (!$ctrl.ngModel) return;
        getCandidatesPromise.then((response) => {
          if (angular.equals(response.parameters, $ctrl.parameters)) {
            if (!response.result.some(element => {
              if ($filter('filter')([$ctrl.ngModel], element.match, true).length) {
                $ctrl.value = element.value;
                return true;
              }
              return false;
            }))
            $ctrl.value = null;

            $ctrl.output();
          }
        })
      };

      $ctrl.output = function () {
        if (!angular.equals($ctrl.ngModel, $ctrl.value)) $ctrl.ngModel = $ctrl.value;
      };

      $ctrl.toggle = function () {
        $ctrl.output();
        $timeout(() => {
          $ctrl.onChange();
        });
      };

      $scope.$watch('$ctrl.parameters', getList, true);
      $scope.$watch('$ctrl.getListFn', getList);
      $scope.$watch('$ctrl.ngModel', $ctrl.input);
    }],
  });


}(window.formInputs = window.formInputs || angular.module('formInputs', ['backendApi', 'domeModule', 'ngSanitize'])));
