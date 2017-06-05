/* jshint esversion: 6 */
(function (domeApp) {
  'use strict';

  domeApp.controller('MainCtr', ['$scope', '$timeout', function ($scope, $timeout) {

    // 管理左侧导航栏的宽度问题
    // 首先是用户配置，并根据用户配置选择默认行为
    // 用户配置保存在本地 localStorage 里
    $scope.thinLeftNav = Boolean(Number(localStorage.getItem('thinLeftNav')));
    $scope.switchThinNav = function () {
      $scope.thinLeftNav = !$scope.thinLeftNav;
      localStorage.setItem('thinLeftNav', String(Number($scope.thinLeftNav)));
    };
    // 其次是检查屏幕分辨率，屏幕分辨率过低时强制折叠
    const targetWidth = 1135;
    const checkResolution = function () {
      $scope.lowResolution = document.body.clientWidth < targetWidth;
    };
    checkResolution();
    window.addEventListener('resize', function () { $timeout(checkResolution); });

  }]);

  domeApp.component('memoryDatabaseWarning', {
    template: `
      <div class="page-prompt" ng-if="$ctrl.isInMemoryDatabase && !$ctrl.userHide">
        <div class="page-prompt-text">为了方便试用DomeOS，目前正在使用内存数据库。数据库数据会在 DomeOS 服务器重启时丢失。您可以配置 MySQL 作为持久化数据库。配置 MySQL 数据库的方法详见<a href="{{ $ctrl.documentUrl }}" target="_blank">使用文档</a>。</div>
        <icon-close class="page-prompt-close" ng-click="$ctrl.hideWarning()"></icon-close>
      </div>
    `,
    bindings: {},
    controller: ['api', 'dialog', 'documentUrl', function (api, dialog, documentUrl) {
      const $ctrl = this;

      $ctrl.documentUrl = documentUrl;

      $ctrl.isInMemoryDatabase = null;
      $ctrl.userHide = false;
      api.global.isInMemoryDatabase().then(isInMemoryDatabase => {
        $ctrl.isInMemoryDatabase = isInMemoryDatabase;
      });
      $ctrl.hideWarning = function () {
        $ctrl.userHide = true;
      };
    }],
  });

  domeApp.component('headerAction', {
    template: `
      <ul class="header-action-container" ng-show="$ctrl.user.name">
        <li class="header-action-item header-action-document">
          <a href="{{ $ctrl.documentUrl }}"><icon-document></icon-document>文档</a>
        </li>
        <li id="header-action-user" class="header-action-item header-action-user">
          <a href="javascript:;">
            <icon-user></icon-user>
            <span ng-bind="$ctrl.user.name"></span>
          </a>
          <ul class="header-action-user-drop-down" ng-show="$ctrl.showUserMenu">
            <li class="header-action-user-drop-down-item"><a href="javascript:;" ng-click="$ctrl.editMyInfo()">修改资料</a></li>
            <li class="header-action-user-drop-down-item"><a href="javascript:;" ng-if="$ctrl.mayEditMyPassword" ng-click="$ctrl.editMyPassword()">修改密码</a></li>
            <li class="header-action-user-drop-down-item"><a href="javascript:;" ng-click="$ctrl.logout()">退出登录</a></li>
          </ul>
          <div class="header-action-user-drop-down-triangle" ng-show="$ctrl.showUserMenu"></div>
        </li>
      </ul>
    `,
    bindings: {},
    controller: ['api', 'dialog', 'userDialog', 'documentUrl', 'logoutUrl', '$timeout', function (api, dialog, userDialog, documentUrl, logoutUrl, $timeout) {
      const $ctrl = this;

      $ctrl.documentUrl = documentUrl;

      $ctrl.mayEditMyPassword = false;
      api.user.whoami().then(({ name, loginType, isAdmin }) => {
        $ctrl.user = { name, loginType, isAdmin };
        // 只有使用密码登录的可以修改密码，使用 LDAP 登录不能修改密码
        if (loginType === 'USER') $ctrl.mayEditMyPassword = true;
      });

      angular.element('#header-action-user').on('focusin', function () {
        $ctrl.showUserMenu = true;
        $timeout(() => { });
      });
      angular.element('#header-action-user').on('focusout', function () {
        $ctrl.showUserMenu = false;
        $timeout(() => { });
      });

      $ctrl.editMyInfo = function () {
        api.user.whoami().then(info => {
          userDialog.editInfo(info);
          api.user.whoami(true);
        });
      };

      $ctrl.editMyPassword = function () {
        userDialog.editPassword($ctrl.user.name);
      };

      $ctrl.logout = function () {
        location.href = logoutUrl + '?from=' + encodeURIComponent(location.protocol + '//' + location.host);
      };
    }],
  });

  domeApp.component('leftNav', {
    template: `
      <div id="left-nav" class="left-nav-container" role="navigation">
        <ul class="left-nav-list">
          <li class="left-nav-item {{ group.classname }}" ng-repeat="group in menu track by $index" ng-class="{ 'left-nav-unfold': group.unfold, 'left-nav-active': group.active }">
            <a class="left-nav-item-link" href="javascript:;" ng-click="click(group)">
              <span class="left-nav-icon"><nav-icon type="{{ group.icon }}"></nav-icon></span>
              <span class="left-nav-text" ng-bind="group.text"></span>
              <span class="left-nav-fold" ng-if="group.children && group.children.length">
                <icon-right-arrow ng-show="!group.unfold"></icon-right-arrow>
                <icon-down-arrow ng-show="group.unfold"></icon-down-arrow>
              </span>
            </a>
            <ul class="left-nav-sub-menu" ng-if="group.children && group.children.length" ng-style="{ 'max-height': group.children.length * 47 - 2 }">
              <li class="left-nav-item" ng-repeat="item in group.children" ng-class="{ 'left-nav-active-item': item.active }">
                <a class="left-nav-item-link" href="javascript:;" ng-click="click(item)">
                  <span class="left-nav-text" ng-bind="item.text"></span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    `,
    bindings: {},
    controller: ['$state', '$scope', '$rootScope', 'api', function ($state, $scope, $rootScope, api) {
      $scope.menu = [];

      const markActiveMenu = function () {
        let allState = [];
        for (let state = $state.current; state;) {
          allState.push(state.name);
          let parent = state.ncyBreadcrumb && state.ncyBreadcrumb.parent;
          if (typeof parent === 'function') parent = parent({});
          if (parent) parent = parent.replace(/\(.*$/g, '');
          if (parent) state = $state.get(parent);
          else break;
        }
        ; (function markMenu(group) {
          return group.map(item => (item.active = markMenu(item.children || []) ||
            allState.indexOf(item.page) !== -1)).reduce((x, y) => x || y, false);
        }($scope.menu));
        $scope.menu.forEach(group => { group.unfold = group.active }); 
      };

      const initMenu = function (isAdmin) {
        $scope.menu = [{
          classname: 'logo-container',
          icon: 'domeos',
          text: 'DomeOS',
          page: 'overview',
        }, {
          icon: 'development',
          text: '开发集成',
          children: [{
            text: '项目',
            page: 'projectCollectionManage',
          }, {
            text: '镜像',
            page: 'imageCollectionManage',
          }]
        }, {
          icon: 'operation',
          text: '运维管理',
          children: [{
            text: '服务',
            page: 'deployCollectionManage',
          }, {
            text: '集群',
            page: 'clusterManage',
          }, {
            text: '负载均衡',
            page: 'loadBalanceCollection',
          }, {
            text: '配置集合',
            page: 'configMapCollection',
          }, {
            text: '应用商店',
            page: 'appStore',
          }],
        }, {
          icon: 'monitor',
          text: '监控报警',
          children: [{
            text: '监控',
            page: 'monitor',
          }, {
            text: '报警',
            page: 'alarm',
          }]
        }].concat(isAdmin ? [{
          icon: 'setting',
          text: '全局设置',
          page: 'globalSetting',
        }] : []);
        markActiveMenu();
      };

      api.user.whoami().then(({ isAdmin }) => {
        initMenu(isAdmin);
      });

      $scope.click = function (item) {
        if (item.page) $state.go(item.page);
        else {
          item.unfold = !item.unfold;
          if (item.unfold) {
            $scope.menu.forEach(group => { group.unfold = group === item; });
          }
        }
      };

      $rootScope.$on('$stateChangeSuccess', function () {
        markActiveMenu();
      });

      setTimeout(function () {
        yaSimpleScrollbar.attach(document.getElementById('left-nav'));
      }, 0);

    }]
  });

  domeApp.component('navIcon', {
    template: `
      <i class="icon icon-nav {{ $ctrl.classname() }}"></i>
    `,
    bindings: {
      type: '@',
    },
    controller: [function () {
      const $ctrl = this;
      $ctrl.classname = () => ({
        'domeos': 'domeos-logo',
        'development': 'fa fa-th-large',
        'operation': 'glyphicon glyphicon-stats', // what the f
        'monitor': 'fa fa-bell-o',
        'setting': 'fa fa-cog',
      }[$ctrl.type]);
    }],
  });

})(angular.module('domeApp'));