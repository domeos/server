/*
 * @author ChandraLee
 * @description 控制台交互指令
 */

(function (domeApp, undefined) {
    'use strict';
    if (typeof domeApp === 'undefined') return;
    domeApp
        /* creator-selection(default-user-id="2" default-user-type="GROUP")*/
        .directive('creatorSelection', ['$domeUser', function ($domeUser) {
            var tplArr = [];
            tplArr.push('  <div class="com-creator-selection">');
            tplArr.push('       <div select-con="select-con" class="com-select-con role-select">');
            tplArr.push('      <button ng-cloak="ng-cloak" class="ui-btn ui-btn-white ui-btn-select">{{userType==\'USER\'?\'个人\':\'组\'}}<i class="icon-down"></i></button>');
            tplArr.push('      <ul class="select-list">');
            tplArr.push('        <li class="select-item"><a ng-click="toggleUserType(\'USER\')">个人</a></li>');
            tplArr.push('        <li class="select-item"><a ng-click="toggleUserType(\'GROUP\')">组</a></li>');
            tplArr.push('      </ul>');
            tplArr.push('    </div>');
            tplArr.push('    <em ng-show="userType==\'USER\'" ng-bind="\'当前用户：\'+currentUser.name"></em>');
            tplArr.push('    <div select-con="select-con" class="com-select-con group-select" ng-show="userType==\'GROUP\'">');
            tplArr.push('      <button class="ui-btn ui-btn-white ui-btn-select" ng-cloak>{{currentGroup.name}}<i class="icon-down"></i></button>');
            tplArr.push('      <ul class="select-list">');
            tplArr.push('        <li ng-if="roleList.length===0" class="select-item"><a>无组信息</a></li>');
            tplArr.push('        <li ng-repeat="group in roleList" class="select-item"><a ng-bind="group.name" ng-click="toggleGroup(group)"></a></li>');
            tplArr.push('      </ul>');
            tplArr.push('    </div>');
            tplArr.push('  </div>');
            return {
                restrict: 'AE',
                template: tplArr.join(''),
                replace: true,
                scope: {
                    defaultUserType: '@',
                    defaultUserId: '=',
                    changeEvent: '&'
                },
                link: function (scope, element, attrs) {
                    scope.userType = scope.defaultUserType || 'USER';
                    scope.currentGroup = {};
                    scope.currentUser = {};
                    scope.toggleGroup = function (group) {
                        scope.currentGroup = group;
                        scope.changeEvent({
                            user: group
                        });
                    };
                    scope.toggleUserType = function (type) {
                        scope.userType = type;
                        if (type == 'USER') {
                            scope.changeEvent({
                                user: scope.currentUser
                            });
                        } else {
                            scope.changeEvent({
                                user: scope.currentGroup
                            });
                        }
                    };
                    $domeUser.userService.getGroupList().then(function (res) {
                        scope.roleList = res.data.result || [];
                        for (var i = 0; i < scope.roleList.length; i++) {
                            if (scope.defaultUserId && scope.defaultUserType) {
                                if (scope.defaultUserId === scope.roleList[i].id && scope.defaultUserType === scope.roleList[i].type) {
                                    if (scope.defaultUserType == 'GROUP') {
                                        scope.currentGroup = scope.roleList[i];
                                        scope.toggleGroup(scope.roleList[i]);
                                    }
                                }
                            }
                            if (scope.roleList[i].type === 'USER') {
                                scope.currentUser = scope.roleList[i];
                                scope.roleList.splice(i, 1);
                                i--;
                            }
                        }
                        if (!scope.currentGroup.id) {
                            scope.toggleGroup(scope.roleList[0]);
                        }
                        scope.toggleUserType(scope.userType);
                    });
                }
            };
        }])
        // 列表--左右滚动
        // <ul list-scroll="list-scroll" width-offset="150">
        //   <li disabled="true" class="nav-option"><span><a class="icon-last to-last"></a><a class="icon-next to-next"></a></span></li>
        //   <li ng-repeat="image in editConfig.containerDrafts" ng-cloak="ng-cloak" ng-click="currentContainerDraft.index=$index;" ng-class="{'active':currentContainerDraft.index===$index,'txt-error':needValid.valid&amp;&amp;mirrorsListFrom['Form'+$index].$invalid}">{{image.image}}<a ng-click="deleteImage($index);fresh()" class="icon-cancel"></a></li>
        // </ul>
        .directive('listScroll', ['$window', '$document', function ($window, $document) {
            return {
                restrict: 'A',
                template: '<div class="com-tabset-scroll"><div class="list-back"><ul class="com-list-tab list-scroll" style="display:inline-block;padding-left:0;" ng-transclude></ul></div></div>',
                replace: true,
                transclude: true,
                link: function (scope, ele, attrs) {
                    var w = angular.element($window),
                        docEle = angular.element($document),
                        listEle = ele.find('ul'),
                        optEle = ele.find('.nav-option'),
                        nextEle = ele.find('.icon-next'),
                        lastEle = ele.find('.icon-last'),
                        currentPage = 0,
                        totalPage = 1,
                        eleWidth = 0,
                        // 除去ele元素以外的宽度
                        widthOffset = parseInt(attrs.widthOffset || 0);
                    // 下一页
                    nextEle.bind('click', function () {
                        if (totalPage <= 1 || currentPage === totalPage - 1) return;
                        listEle.stop().animate({
                            marginLeft: (eleWidth - 48) * - ++currentPage
                        }, 600);
                    });
                    // 上一页
                    lastEle.bind('click', function () {
                        if (currentPage === 0) return;
                        --currentPage;
                        listEle.stop().animate({
                            marginLeft: (eleWidth - 48) * -currentPage
                        }, 600);
                    });
                    scope.safeApply = function (fn) {
                        var phase = this.$root.$$phase;
                        if (phase == '$apply' || phase == '$digest') {
                            if (fn && typeof fn === 'function') {
                                fn();
                            }
                        } else {
                            this.$apply(fn);
                        }
                    };
                    // 刷新列表
                    scope.$on('changeScrollList', function () {
                        scope.fresh();
                    });
                    // TODO:无法及时触发ul的宽度改变事件，此处采用手动触发
                    scope.fresh = function () {
                        setTimeout(function () {
                            scope.safeApply();
                        }, 100);
                    };
                    scope.$watch(function () {
                        return {
                            windowWidth: w.width(),
                            listWidth: listEle.width()
                        };
                    }, function (newValue, oldValue) {
                        // 如果没有元素，则不显示
                        if (ele.find('li').length === 1) {
                            ele.height(0);
                        } else {
                            ele.height('auto');
                        }
                        eleWidth = docEle.width() - widthOffset;
                        totalPage = Math.ceil(newValue.listWidth / (eleWidth - 48));
                        if (currentPage + 1 > totalPage) {
                            lastEle.trigger('click');
                        }
                        if (totalPage <= 1) {
                            optEle.hide();
                        } else {
                            optEle.show();
                        }
                        // console.log(eleWidth,newValue.listWidth,totalPage);
                        ele.css('max-width', (eleWidth > newValue.listWidth ? newValue.listWidth + 15 : eleWidth) + 'px');
                        if (oldValue.windowWidth !== newValue.windowWidth) {
                            currentPage = 0;
                            listEle.css('margin-left', 0);
                        }
                    }, true);
                    w.bind('resize', function () {
                        scope.$apply();
                    });
                }
            };
        }])
        .directive('selectInput', function () {
            var tplArr = [];
            tplArr.push('       <div><div select-con label="true" class="com-select-con">');
            tplArr.push('        <ul class="selected-labels">');
            tplArr.push('          <li ng-repeat="item in selectedList=(optionList|filter:{isSelected:true})" ng-cloak="ng-cloak" class="select-label"><a ng-click="toggleSelect(item);itemClick()" class="icon-cancel"></a>{{item[showKey]}}</li>');
            tplArr.push('          <li class="select-input">');
            tplArr.push('            <input placeholder="{{placeholder}}" ng-model="keywords.key" ng-keydown="keyDown($event,selectedList,optionListFiltered[0])" class="ui-btn-select"/>');
            tplArr.push('          </li>');
            tplArr.push('        </ul>');
            tplArr.push('        <ul class="select-list">');
            tplArr.push('          <li ng-show="optionListFiltered.length===0" class="select-item"><a>无相关信息</a></li>');
            tplArr.push('          <li ng-repeat="item in optionListFiltered=(optionList|dynamicKey:showKey:keywords.key|filter:{isSelected:false})" class="select-item" select-input-item ><a ng-click="toggleSelect(item);itemClick()"></a></li>');
            tplArr.push('        </ul>');
            tplArr.push('      </div></div>');
            return {
                restrict: 'AE',
                template: tplArr.join(''),
                replace: true,
                scope: {
                    showKey: '@',
                    optionList: '=',
                    placeholder: '@dPlaceholder',
                    itemClick: '&dClick'
                },
                transclude: true,
                controller: ['$scope', '$transclude', function ($scope, $transclude) {
                    this.renderItem = $transclude;
                }],
                link: function (scope) {
                    if (!scope.optionList) {
                        scope.optionList = [];
                    }
                    scope.keywords = {
                        key: ''
                    };
                    scope.toggleSelect = function (item) {
                        item.isSelected = !item.isSelected;
                    };
                    // @param selectedList:已选择的list
                    // @param firstFilterItem: 过滤后的第一个item
                    scope.keyDown = function (event, selectedList, firstFilterItem) {
                        if (!scope.keywords.key && event.keyCode == 8 && selectedList.length > 0) {
                            scope.toggleSelect(selectedList[selectedList.length - 1]);
                        } else if (event.keyCode == 13 && firstFilterItem) {
                            scope.toggleSelect(firstFilterItem);
                        }
                    };
                }
            };
        })
        .directive('selectInputItem', function () {
            return {
                require: '^selectInput',
                link: function (scope, element, attrs, controller) {
                    controller.renderItem(scope, function (dom) {
                        element.find('a').append(dom);
                    });
                }
            };
        })
        // 开关
        .directive('domeToggle', function () {
            return {
                restrict: 'AE',
                template: '<button class="ui-toggle old-button"></button>',
                replace: true
            };
        })
        // 项目构建记录
        .directive('loglist', ['$util', '$domeProject', '$filter', function ($util, $domeProject, $filter) {
            return {
                restrict: 'AE',
                template: '<div ng-transclude></div>',
                transclude: true,
                link: function (scope, element) {
                    scope.currentIndex = -1;
                    var getLogDetailTpl = function (index) {
                        var buildInfo = scope.buildList[index];
                        var tplArr = [];
                        tplArr.push('<tr class="log-detail">');
                        tplArr.push('   <td colspan="8">');
                        tplArr.push('       <ul class="detail-list">');
                        tplArr.push('           <li class="detail-row">');
                        tplArr.push('               <span class="detail-title">镜像大小</span>');
                        tplArr.push('               <span class="detail-content">' + buildInfo.imageInfo.imageSize + 'MB</span>');
                        tplArr.push('           </li>');
                        if (buildInfo.state == 'Success') {
                            tplArr.push('           <li class="detail-row">');
                            tplArr.push('               <span class="detail-title">拉取命令</span>');
                            tplArr.push('               <span class="detail-content">');
                            // tplArr.push('                    <input class="cmd-txt ui-input-white" disabled="true" value="docker pull {#registry}/{#imageName}:{#imageTag}"/><a class="link-safe link-copy" data-text="docker pull {#registry}/{#imageName}:{#imageTag}">复制</a>');
                            tplArr.push('                   <input id="input'+ index +'" class="cmd-txt ui-input-white" readonly="true" value="docker pull ' + buildInfo.imageInfo.registry + '/' + buildInfo.imageInfo.imageName + ':' + buildInfo.imageInfo.imageTag + '"/><a class="link-safe link-copy" id="btn'+ index +'" data-clipboard-target="#input'+ index +'" data-text="docker pull ' + buildInfo.imageInfo.registry + '/' + buildInfo.imageInfo.imageName + ':' + buildInfo.imageInfo.imageTag + '">复制</a>');
                            tplArr.push('                   <p class="cmd-prompt"> 拉取镜像前请登录：docker login domeos.io</p>');
                            tplArr.push('               </span>');
                            tplArr.push('           </li>');
                        }
                        if (buildInfo.codeInfo && buildInfo.commitInfo) {
                            var defaultInfo = '无';
                            tplArr.push('           <li class="detail-row">');
                            tplArr.push('               <span class="detail-title">Branch名称</span>');
                            tplArr.push('               <span class="detail-content">' + buildInfo.codeInfo.codeBranch + '</span>');
                            tplArr.push('           </li>');
                            tplArr.push('           <li class="detail-row">');
                            tplArr.push('               <span class="detail-title">author</span>');
                            tplArr.push('               <span class="detail-content">' + (buildInfo.commitInfo.authorName != null ? buildInfo.commitInfo.authorName : defaultInfo) + '</span>');
                            tplArr.push('           </li>');
                            tplArr.push('           <li class="detail-row">');
                            tplArr.push('               <span class="detail-title">author email</span>');
                            tplArr.push('               <span class="detail-content">' + (buildInfo.commitInfo.authorEmail != null ? buildInfo.commitInfo.authorEmail : defaultInfo) + '</span>');
                            tplArr.push('           </li>');
                            tplArr.push('           <li class="detail-row">');
                            tplArr.push('               <span class="detail-title">commit time</span>');
                            tplArr.push('               <span class="detail-content">' + $filter('day')(buildInfo.commitInfo.createdAt) + '</span>');
                            tplArr.push('           </li>');
                            tplArr.push('           <li class="detail-row">');
                            tplArr.push('               <span class="detail-title">commit info</span>');
                            tplArr.push('               <span class="detail-content">' + buildInfo.commitInfo.message + '</span>');
                            tplArr.push('           </li>');
                        }
                        tplArr.push('           <li class="detail-row">');
                        tplArr.push('               <span class="detail-title">Dockerfile</span>');
                        tplArr.push('               <span id="dockerfile" class="detail-content">加载中……</span>');
                        tplArr.push('           </li>');
                        tplArr.push('       </ul>');
                        tplArr.push('   </td>');
                        tplArr.push('</tr>');
                        return $util.parseTpl(tplArr.join(''), scope.buildList[index]);
                    };
                    var clipboard = null;
                    scope.showDetail = function (index) {
                        if (clipboard != null) {
                            clipboard.destroy();
                        }
                        clipboard = new Clipboard('.link-copy');
                        if (index != scope.currentIndex) {
                            element.find('.log-detail').remove();
                            element.find('tr:eq(' + index + ')').after(getLogDetailTpl(index));
                            // element.find('.link-copy').zclip({
                            //     path: '/lib/media/ZeroClipboard.swf',
                            //     copy: function () {
                            //         return angular.element(this).data('text');
                            //     }
                            // });

                            // clipboard.on('success', function(e) {
                            //     alert("已复制到粘贴板:\n" + e.text);
                            // });
                            clipboard.on('error', function(e) {
                                console.error('Action:', e.action);
                                console.error('Trigger:', e.trigger);
                            });
                            $domeProject.projectService.getBuildDockerfile(scope.buildList[index].projectId, scope.buildList[index].id).then(function (res) {
                                var dockerfile = res.data.result;
                                if (dockerfile) {
                                    dockerfile = dockerfile.replace(/[\n\r]/g, '<br/>');
                                    element.find('#dockerfile').html(dockerfile);
                                } else {
                                    element.find('#dockerfile').html('无');
                                }
                            });
                            scope.currentIndex = index;
                        } else {
                            if (element.find('.log-detail').length !== 0) {
                                element.find('.log-detail').remove();
                            }
                            scope.currentIndex = -1;
                        }

                    };
                    scope.isNull = function (str) {
                        var resTxt = str;
                        if (!str) {
                            resTxt = '无';
                        }
                        return resTxt;
                    };
                    // destory clipboard object when leave
                    scope.$on("$destroy",function( event ) {
                        if (clipboard != null) {
                            clipboard.destroy();
                        }
                    });
                }
            };
        }])
        .directive('btnCopy', ['$util', function ($util) {
            return {
                restrict: 'A',
                scope: {
                    btnCopy: '='
                },
                link: function (scope, element) {
                    $util.loadJs('/lib/js/jquery.zclip.js').then(function () {
                        element.zclip({
                            path: '/lib/media/ZeroClipboard.swf',
                            copy: function () {
                                return scope.btnCopy;
                            }
                        });
                    });
                }
            };
        }])
        // 镜像展开与收起
        .directive('mirrorCollapse', function () {
            return {
                restrict: 'A',
                link: function (scope) {
                    scope.isCollapse = true;
                    scope.toggleCollapse = function () {
                        scope.isCollapse = !scope.isCollapse;
                    };
                }
            };
        })
        // 页码
        .directive('listNo', function () {
            return {
                restrict: 'AE',
                scope: {
                    // 列表长度
                    listLen: '=length',
                    // 当前页码
                    pageno: '=',
                    // 每页数据数量
                    size: '@'
                },
                link: function (scope, element) {
                    var pageSize, pageTpl, i;
                    scope.$watch(function () {
                        return scope.listLen;
                    }, function (newValue) {
                        pageTpl = [];
                        if (newValue) {
                            pageSize = Math.ceil(newValue / parseInt(scope.size));
                            // pageTpl.push('<span class="page-info">当前第<span class="current-page">' + scope.pageno + '</span>页 / 共' + pageSize + '页</span>');
                            pageTpl.push('<span class="pageno last"><i class="icon-last"></i></span>');
                            pageTpl.push('<span class="pageno turn on">1</span>');
                            for (i = 2; i <= pageSize; i++) {
                                pageTpl.push('<span class="pageno turn">' + i + '</span>');
                            }
                            pageTpl.push('<span class="pageno next"><i class="icon-next"></i></span>');
                            element.html(pageTpl.join(''));
                        }
                    });
                    element.delegate('.pageno', 'click', function () {
                        var thisEle = angular.element(this);
                        if (thisEle.hasClass('turn')) {
                            scope.pageno = angular.element(this).html();
                            angular.element('.pageno.on').removeClass('on');
                            thisEle.addClass('on');
                        } else if (thisEle.hasClass('last')) {
                            if (scope.pageno !== 1 && scope.pageno !== '1') {
                                scope.pageno = parseInt(scope.pageno) - 1;
                                angular.element('.pageno.on').removeClass('on').prev('.pageno').addClass('on');
                            }
                        } else if (thisEle.hasClass('next')) {
                            if (scope.pageno < pageSize && parseInt(scope.pageno) < pageSize) {
                                scope.pageno = parseInt(scope.pageno) + 1;
                                angular.element('.pageno.on').removeClass('on').next('.pageno').addClass('on');
                            }
                        }
                        angular.element('.current-page').html(scope.pageno);
                        scope.$apply();
                    });
                }
            };
        })
        .directive('fileCollapse', function () {
            return {
                restrict: 'A',
                link: function (scope) {
                    scope.showFile = false;
                    scope.showContent = false;
                    scope.toggleFile = function () {
                        scope.showFile = true;
                    };
                    scope.toggleContent = function () {
                        scope.showContent = !scope.showContent;
                        scope.showFile = true;
                        if (!scope.showContent && scope.fileInfo.fileName === '' && scope.fileInfo.filePath === '') {
                            scope.showFile = false;
                        }
                    };
                }
            };
        })
        //镜像构建记录
        .directive('customlist', ['$util', '$domeProject', '$domeImage', function ($util, $domeProject, $domeImage) {
            return {
                restrict: 'AE',
                template: '<div ng-transclude></div>',
                transclude: true,
                link: function (scope, element) {
                    var isZclipLoaded = false;
                    scope.currentIndex = -1;
                    var getLogDetailTpl = function () {
                        var tplArr = [];
                        var type = scope.customDetailInfo.autoCustom === 0 ? 'Dockerfile' : '配置文件';
                        var ispublic = scope.customDetailInfo.publish === 0 ? '否' : '是';
                        tplArr.push('<tr class="custom-detail">');
                        tplArr.push('   <td colspan="9" class="td-detail">');
                        tplArr.push('       <ul class="com-list-info detail-list">');
                        tplArr.push('           <li>');
                        tplArr.push('               <span class="info-name">定制详情</span>');
                        tplArr.push('               <span class="info-simple">' + type + '</span>');
                        tplArr.push('           </li>');
                        //成功才显示镜像大小和拉取命令
                        if (scope.customDetailInfo.state == 'Success') {
                            tplArr.push('           <li>');
                            tplArr.push('               <span class="info-name">镜像大小</span>');
                            tplArr.push('               <span class="info-simple">{#imageSize}MB</span>');
                            tplArr.push('           </li>');
                            tplArr.push('           <li>');
                            tplArr.push('               <span class="info-name">拉取命令</span>');
                            tplArr.push('               <div class="info-content cmd-wrap">');
                            tplArr.push('                   <input class="ui-input-fill" disabled="true" value="docker pull {#registry}/{#imageName}:{#imageTag}"/><button class="ui-btn ui-btn-sm ui-btn-active link-copy" data-text="docker pull {#registry}/{#imageName}:{#imageTag}">复制</button>');
                            tplArr.push('                   <p class="txt-prompt"> 拉取镜像前请登录：docker login domeos.io</p>');
                            tplArr.push('               </div>');
                            tplArr.push('           </li>');
                        }

                        if (scope.customDetailInfo.autoCustom === 1) {
                            tplArr.push('           <li>');
                            tplArr.push('               <span class="info-name">环境变量</span>');
                            //环境变量
                            var evnList = scope.customDetailInfo.envSettings;
                            var evnLength = evnList.length;
                            if (evnLength === 0) {
                                tplArr.push('               <span class="info-simple">' + '无' + '</span>');
                            } else {
                                tplArr.push('               <div class="info-content">');
                                tplArr.push('                   <table class="ui-table-primary">');
                                tplArr.push('                       <tr>');
                                tplArr.push('                           <td>名称</td>');
                                tplArr.push('                           <td>值</td>');
                                tplArr.push('                           <td>描述</td>');
                                tplArr.push('                       </tr>');
                                for (var i = 0; i < evnLength; i++) {

                                    tplArr.push('                       <tr>');
                                    tplArr.push('                           <td>' + evnList[i].key + '</td>');
                                    tplArr.push('                           <td>' + evnList[i].value + '</td>');
                                    tplArr.push('                           <td>' + evnList[i].description + '</td>');
                                    tplArr.push('                       </tr>');

                                }
                                tplArr.push('                   </table>');
                                tplArr.push('               </div>');
                            }
                            tplArr.push('           </li>');
                        }

                        tplArr.push('           <li>');
                        tplArr.push('               <span class="info-name">定制镜像是否作为基础镜像</span>');
                        tplArr.push('               <span class="info-simple">' + ispublic + '</span>');
                        tplArr.push('           </li>');
                        tplArr.push('           <li>');
                        tplArr.push('               <span class="info-name">定制镜像描述</span>');
                        if (scope.customDetailInfo.description === null || scope.customDetailInfo.description === '') {
                            tplArr.push('               <span class="info-simple">' + '无' + '</span>');
                        } else {
                            tplArr.push('               <span class="info-simple">{#description}</span>');
                        }

                        tplArr.push('           </li>');
                        tplArr.push('           <li>');
                        tplArr.push('               <span class="info-name">Dockerfile</span>');
                        if (scope.customDetailInfo.dockerfileContent === null || scope.customDetailInfo.dockerfileContent === '') {
                            tplArr.push('               <span class="info-simple">' + '无' + '</span>');
                        } else {
                            tplArr.push('               <div class="info-content">');
                            tplArr.push('                   <textarea readonly="true" class="ui-input-fill file-txt">{#dockerfileContent}</textarea>');
                            tplArr.push('               </div>');
                        }

                        tplArr.push('           </li>');
                        //配置文件(autoCustom === 1)
                        if (scope.customDetailInfo.autoCustom === 1 && scope.customDetailInfo.files) {
                            tplArr.push('           <li>');
                            tplArr.push('               <span class="info-name">配置文件</span>');
                            var fileJson = scope.customDetailInfo.files;
                            var length = fileJson.length;
                            if (length && length !== 0) {
                                tplArr.push('               <div class="info-content">');
                                for (var j = 0; j < length; j++) {
                                    tplArr.push('                   <div class="line-long">');
                                    tplArr.push('                       <p class="con-num">' + (j + 1) + '</p>');
                                    tplArr.push('                       <span class="config-title">名称:' + fileJson[j].fileName + '</span>');
                                    tplArr.push('                       <span class="config-title">容器内路径:' + fileJson[j].filePath + '</span>');
                                    tplArr.push('                   </div>');
                                    tplArr.push('                   <textarea readonly="true" class="ui-input-fill file-txt">' + fileJson[j].content + '</textarea>');
                                }
                                tplArr.push('               </div>');
                            } else {
                                tplArr.push('                   <span class="info-simple">' + '无' + '</span>');
                            }
                            tplArr.push('           </li>');
                        }
                        tplArr.push('           <li>');
                        tplArr.push('               <button class="ui-btn ui-btn-none btn-pack" >收起<i class="icon-down top"></i></button>');
                        tplArr.push('           </li>');
                        tplArr.push('       </ul>');
                        tplArr.push('   </td>');
                        tplArr.push('</tr>');
                        return $util.parseTpl(tplArr.join(''), scope.customDetailInfo);
                    };
                    $util.loadJs('/lib/js/jquery.zclip.js').then(function () {
                        isZclipLoaded = true;
                    });
                    var bindCopy = function () {
                        element.find('.link-copy').zclip({
                            path: '/lib/media/ZeroClipboard.swf',
                            copy: function () {
                                return angular.element(this).data('text');
                            }
                        });
                    };
                    var bindPickUp = function () {
                        element.find('.btn-pack').click(function () {
                            scope.$apply(function () {
                                scope.currentIndex = -1;
                                element.find('.custom-detail').remove();
                            });
                        });
                    };
                    scope.showDetail = function (index, id) {
                        if (index !== scope.currentIndex) {
                            $domeImage.imageService.getCustomImageInfo(id).then(function (res) {
                                scope.customDetailInfo = res.data.result || {};
                                element.find('.custom-detail').remove();
                                element.find('tr:eq(' + index + ')').after(getLogDetailTpl());
                                bindPickUp();
                                if (isZclipLoaded) {
                                    bindCopy();
                                } else {
                                    $util.loadJs('/lib/js/jquery.zclip.js').then(function () {
                                        isZclipLoaded = true;
                                        bindCopy();
                                    });
                                }
                            });
                            scope.currentIndex = index;
                        } else {
                            if (element.find('.custom-detail').length !== 0) {
                                element.find('.custom-detail').remove();
                            }
                            scope.currentIndex = -1;
                        }
                    };
                }
            };
        }])
    .directive('hoverablePopover',['$rootScope', '$timeout', function ($rootScope, $timeout) {
        return {
            restrict: "AE",
            scope: {
                content: '=',
                placeholder:'@'
            },
            link: function (scope, element) {
                $rootScope.insidePopover = false;
                //var content = element.context.innerText;
                element.popover({
                    content: scope.content,
                    placement: scope.placeholder || 'top',
                    html: true
                });
                element.on('mouseenter', function () {
                    if (!$rootScope.insidePopover) {
                        element.popover('show');
                    }

                });
                element.on('mouseleave', function () {
                    if (element.context.nextElementSibling !== null) {
                        $timeout(function () {
                            element.context.nextElementSibling.addEventListener('mouseenter', function () {
                                $rootScope.insidePopover = true;
                            });
                            element.context.nextElementSibling.addEventListener('mouseleave', function () {
                                element.popover('hide');
                                $rootScope.insidePopover = false;
                                //return null;
                            });
                            if (!$rootScope.insidePopover) {
                                element.popover('hide');
                                $rootScope.insidePopover = false;
                            }
                        }, 100);
                    }
                });

            }
        }
    }]);
})(angular.module('domeApp'));
