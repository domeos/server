; (function (commonDialogs) {

  /*
   * 以下是业务相关组件
   */
  commonDialogs.factory('userDialog', ['dialog', 'api', function (dialog, api) {
    var userDialog = {};

    // 修改信息
    userDialog.editInfo = function ({ name, id, email, phone }) {
      return dialog.common({
        title: '修改资料',
        buttons: dialog.buttons.BUTTON_OK_CANCEL,
        template: `
          <form name="modifyInfo"><form-container left-column-width="80">
            <form-config-group ng-show="data.id !== undefined">
              <form-config-item config-title="用户名">
                <span ng-bind="data.name"></span>
              </form-config-item>
              <form-config-item config-title="邮箱">
                <input placeholder="请输入邮箱地址" type="email" name="email" required ng-model="data.email" />
                <form-error-message form="modifyInfo" target="email" type="required">请输入邮箱地址</form-error-message>
                <form-error-message form="modifyInfo" target="email" type="email">邮箱地址格式不正确</form-error-message>
              </form-config-item>
              <form-config-item config-title="电话">
                <input placeholder="请输入电话号码" type="tel" name="phone" ng-model="data.phone" />
                <form-error-message form="modifyInfo" target="phone" type="required">请输入电话号码</form-error-message>
                <form-error-message form="modifyInfo" target="phone" type="pattern">电话号码格式不正确</form-error-message>
              </form-config-item>
            </form-config-group>
            <button ng-show="false"></button>
          </form-container></form>
        `,
        size: 600,
        controller: ['$scope', function ($scope) {

          $scope.data = { id, name, email, phone };

          $scope.onbeforeclose = function (button) {
            if (button !== dialog.button.BUTTON_OK) return;
            $scope.formSubmit();
            return false;
          };

          $scope.formSubmit = function () {
            $scope.modifyInfo.$setSubmitted();
            if ($scope.modifyInfo.$invalid) return;
            api.user.modify($scope.data).then(() => {
              dialog.tip('修改资料成功', '修改资料成功。')
                .then(() => $scope.resolve(dialog.button.BUTTON_OK));
            }, error => {
              dialog.error('修改资料失败', '修改密码失败，请重试。');
            });
          };

        }],
      });
    };

    // 修改密码
    userDialog.editPassword = function (username) {
      return dialog.common({
        title: '修改密码',
        buttons: dialog.buttons.BUTTON_OK_CANCEL,
        template: `
          <form name="modifyPassword"><form-container left-column-width="80">
            <form-config-group>
              <form-config-item config-title="用户名" ng-if="isAdmin === true">
                <span ng-bind="username"></span>
              </form-config-item>
              <form-config-item config-title="原密码" ng-if="isAdmin === false">
                <input placeholder="请输入原密码" type="password" name="old" ng-model="data.oldPassword" required />
                <form-error-message form="modifyPassword" target="old">请输入原密码</form-error-message>
              </form-config-item>
              <form-config-item config-title="新密码">
                <input placeholder="密码长度应为 8 ～ 20 位" type="password" name="password" required pattern="^.{8,20}$" ng-model="data.newPassword" />
                <form-error-message form="modifyPassword" target="password" type="required">请输入新密码</form-error-message>
                <form-error-message form="modifyPassword" target="password" type="pattern">密码长度应为 8 ～ 20 位</form-error-message>
              </form-config-item>
              <form-config-item config-title="确认密码">
                <input placeholder="请再次输入新密码" type="password" name="verify" ng-model="data.verifyPassword" />
                <form-error-message form="modifyPassword" condition="data.newPassword && data.newPassword !== data.verifyPassword">两次输入的密码不一致</form-error-message>
              </form-config-item>
            </form-config-group>
            <button ng-show="false"></button>
          </form-container></form>
        `,
        size: 600,
        controller: ['$scope', function ($scope) {

          $scope.username = username;

          $scope.isAdmin = null;
          api.user.whoami().then(({ isAdmin, name }) => {
            $scope.isAdmin = isAdmin;
            $scope.currentUser = name;
          });

          $scope.data = {
            oldPassword: '',
            newPassword: '',
            verifyPassword: '',
          };

          $scope.onbeforeclose = function (button) {
            if (button !== dialog.button.BUTTON_OK) return;
            $scope.modifyPassword.$setSubmitted();
            if (!$scope.modifyPassword.$invalid) $scope.formSubmit();
            return false;
          };

          $scope.formSubmit = function () {
            api.user.passwd(Object.assign({
              name: username,
              newPassword: $scope.data.newPassword
            }, $scope.isAdmin ? {} : {
              oldPassword: $scope.data.oldPassword,              
            })).then(() => {
              if (!$scope.isAdmin) {
                dialog.alert('修改密码成功', '修改密码成功，请重新登录。')
                  .then(() => { location.href = '/login/login.html?redirect=' + encodeURIComponent(location.href); });
              } else {
                let successDialog;
                if (username === $scope.currentUser) {
                  successDialog = dialog.tip('修改密码成功', '您的密码已修改，下次登录时请使用新密码登录。');
                } else {
                  successDialog = dialog.tip('修改密码成功', `用户 ${username} 的密码已修改，下次登录时请使用新密码登录。`);
                }
                successDialog.then(() => { $scope.resolve(dialog.button.BUTTON_OK); });
              }
            }, error => {
              dialog.error('修改密码失败', '修改密码失败，' + (error ? error + '，' : '') + '请重试。');
            });
          };

        }],
      });
    };

    return userDialog;
  }]);

}(angular.module('commonDialogs', ['pageLayout', 'backendApi'])));