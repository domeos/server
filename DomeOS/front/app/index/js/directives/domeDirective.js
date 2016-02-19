domeApp.directive('domeNav', ['$compile', function($compile) { //导航栏
		return {
			restrict: 'AE',
			scope: {
				currentMod: '=',
				loginUser: '='
			},
			link: function(scope, element, attrs) {
				scope.currentNav = '';
				scope.toggle = function(info) {
					scope.currentNav = info;
				};
				scope.$watch('currentMod', function(newValue) {
					if (newValue) {
						scope.toggle(newValue);
					}
				});
				attrs.$$element.find('li').each(function(index, el) {
					var thisEle = angular.element(this);
					var thisInfo = thisEle.data('info');
					if (thisInfo) {
						thisEle.attr({
							'ng-click': 'toggle(' + '\'' + thisInfo + '\'' + ')',
							'ng-class': '{\'on\':currentNav===' + '\'' + thisInfo + '\'' + '}'
						});
					}

				});
				element.html($compile(element.html())(scope));
			}
		};
	}])
	.directive('loading', function() {
		return {
			restrict: 'AE',
			template: '<div class="loading"><div class="dot1"></div><div class="dot2"></div></div>',
			replace: true
		};
	})
	.directive('logInfo', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				scope.$watch('log', function(newValue, oldValue) {
					element.scrollTop(element.find('.log').height());
				});
			}
		};
	})
	// 开关
	.directive('domeToggle', function() {
		return {
			restrict: 'AE',
			template: '<button class="check-toggle"></button>',
			replace: true
		};
	})
	// 展示markdown
	.directive('markdown', ['$q', '$domeProject', '$util', function($q, $domeProject, $util) {
		return {
			restrict: 'AE',
			scope: {
				projectid: "=",
				branch: "="
			},
			link: function(scope, element, attrs) {
				$util.loadJs('/lib/js/showdown.min.js').then(function() {
					$domeProject.getReadMe(scope.projectid, scope.branch).then(function(res) {
						var converter = new showdown.Converter(),
							html = res.data.result;
						if (!html) {
							element.html('该项目没有简介');
						} else {
							element.html(converter.makeHtml(html));
						}
					});
				});
			}
		};
	}])
	.directive('loglist', ['$util', '$domeProject', function($util, $domeProject) {
		var htmlTpLArr = [];
		htmlTpLArr.push('        <table class="table-dome">');
		htmlTpLArr.push('          <tbody>');
		htmlTpLArr.push('    	     <tr ng-if="logFilterList.length===0">');
		htmlTpLArr.push('    	    	 <td colspan="5">无相关信息</td>');
		htmlTpLArr.push('    	     </tr>');
		htmlTpLArr.push('            <tr ng-repeat="log in logFilterList = (logLists|filter:{\'autoBuild\':autoBuildKey,\'status\':statusKey})" ng-click="showDetail($index)">');
		htmlTpLArr.push('              <td ng-cloak><i class="icon-label" tooltip="镜像版本" ></i>{{isNull(log.imageTag)}}</td>');
		htmlTpLArr.push('              <td ng-cloak ng-if="log.autoBuild!==1"><i class="icon-user" tooltip="构建者"></i>{{log.userName}}</td>');
		htmlTpLArr.push('              <td ng-if="log.autoBuild==1">自动构建</td>');
		htmlTpLArr.push('              <td ng-switch="log.status">');
		htmlTpLArr.push('             	 <span ng-switch-when="Success" class="txt-success">成功</span>');
		htmlTpLArr.push('             	 <span ng-switch-when="Fail" class="txt-warning">失败</span>');
		htmlTpLArr.push('             	 <span ng-switch-when="Preparing" class="txt-normal">准备中</span>');
		htmlTpLArr.push('             	 <span ng-switch-default class="txt-normal">构建中</span>');
		htmlTpLArr.push('              </td>');
		htmlTpLArr.push('              <td ng-bind="parseDate(log.createTime)"></td>');
		htmlTpLArr.push('              <td ng-bind="getInterval($index)"></td>');
		htmlTpLArr.push('              <td><a class="link-safe" ng-click="getBuildLog({projectId:log.projectId,builId:log.id,status:log.status,event:$event.stopPropagation()})">日志</a></td>');
		htmlTpLArr.push('              <td><i class="icon-down up" ng-class="{\'up\':$index!==currentIndex}"></i></td>');
		htmlTpLArr.push('            </tr>');
		htmlTpLArr.push('          </tbody></table>');
		return {
			restrict: 'AE',
			scope: {
				currentIndex: '@',
				autoBuildKey: '=autobuildKey',
				statusKey: '=statusKey',
				logLists: '=list',
				getBuildLog: '&getbuildlog'
			},
			template: htmlTpLArr.join(''),
			link: function(scope, element) {
				var isZclipLoaded = false;
				var getLogDetailTpl = function(index) {
					var tplArr = [];
					tplArr.push('<tr class="log-detail">');
					tplArr.push('	<td colspan="7">');
					tplArr.push('		<ul class="detail-list">');
					tplArr.push('			<li class="detail-row">');
					tplArr.push('				<span class="detail-title">镜像大小</span>');
					tplArr.push('				<span class="detail-content">{#imageSize}MB</span>');
					tplArr.push('			</li>');
					tplArr.push('			<li class="detail-row">');
					tplArr.push('				<span class="detail-title">拉取命令</span>');
					tplArr.push('				<span class="detail-content">');
					tplArr.push('					<input class="cmd-txt input-white" disabled="true" value="docker pull {#registry}/{#imageName}:{#imageTag}"/><a class="link-safe link-copy" data-text="docker pull {#registry}/{#imageName}:{#imageTag}">复制</a>');
					tplArr.push('					<p class="cmd-prompt"> 拉取镜像前请登录：docker login domeos.io</p>');
					tplArr.push('				</span>');
					tplArr.push('			</li>');
					if (!!scope.logLists[index].codeBranch) {
						tplArr.push('			<li class="detail-row">');
						tplArr.push('				<span class="detail-title">Branch名称</span>');
						tplArr.push('				<span class="detail-content">{#codeBranch}</span>');
						tplArr.push('			</li>');
						tplArr.push('			<li class="detail-row">');
						tplArr.push('				<span class="detail-title">author</span>');
						tplArr.push('				<span class="detail-content">{#cmtAuthorName}</span>');
						tplArr.push('			</li>');
						tplArr.push('			<li class="detail-row">');
						tplArr.push('				<span class="detail-title">committer</span>');
						tplArr.push('				<span class="detail-content">{#cmtCommitterName}</span>');
						tplArr.push('			</li>');
						tplArr.push('			<li class="detail-row">');
						tplArr.push('				<span class="detail-title">commit info</span>');
						tplArr.push('				<span class="detail-content">{#cmtMessage}</span>');
						tplArr.push('			</li>');
					}
					tplArr.push('			<li class="detail-row">');
					tplArr.push('				<span class="detail-title">Dockerfile</span>');
					tplArr.push('				<span id="dockerfile" class="detail-content">加载中……</span>');
					tplArr.push('			</li>');
					tplArr.push('		</ul>');
					tplArr.push('	</td>');
					tplArr.push('</tr>');
					return $util.parseTpl(tplArr.join(''), scope.logLists[index]);
				};
				$util.loadJs('/lib/js/jquery.zclip.js').then(function() {
					isZclipLoaded = true;
				});
				var getDateInterval = function(start, end) {
					var res = {};
					var interval = end - start;
					res.day = Math.floor(interval / (24 * 3600 * 1000));
					interval -= res.day * 24 * 3600 * 1000;
					res.hours = Math.floor(interval / (3600 * 1000));
					interval -= res.hours * 3600 * 1000;
					res.mimutes = Math.floor(interval / (60 * 1000));
					interval -= res.mimutes * 60 * 1000;
					res.seconds = Math.floor(interval / 1000);
					return res;
				};
				var bindCopy = function() {
					angular.element('.link-copy').zclip({
						path: '/lib/media/ZeroClipboard.swf',
						copy: function() {
							return angular.element(this).data('text');
						}
					});
				};
				scope.showDetail = function(index) {
					if (index != scope.currentIndex) {
						element.find('.log-detail').remove();
						element.find('tr:eq(' + index + ')').after(getLogDetailTpl(index));
						if (isZclipLoaded) {
							bindCopy();
						} else {
							$util.loadJs('/lib/js/jquery.zclip.js').then(function() {
								isZclipLoaded = true;
								bindCopy();
							});
						}
						$domeProject.getBuildDockerfile(scope.logLists[index].projectId, scope.logLists[index].id).then(function(res) {
							var dockerfile = res.data.result;
							if (dockerfile) {
								dockerfile = dockerfile.replace(/[\n\r]/g, '<br/>');
								angular.element(element).find('#dockerfile').html(dockerfile);
							} else {
								angular.element(element).find('#dockerfile').html('无');
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
				scope.parseDate = function(seconds) {
					return $util.getPageDate(seconds);
				};
				scope.getInterval = function(index) {
					var str;
					if (scope.logLists[index].finishTime === 0) {
						str = '0秒';
					} else {
						var intervalTime = getDateInterval(scope.logLists[index].createTime, scope.logLists[index].finishTime);
						if (intervalTime.day !== 0) {
							str = intervalTime.day + '天';
						}
						if (intervalTime.hours !== 0) {
							str = intervalTime.hours + '小时';
						}
						if (intervalTime.mimutes !== 0) {
							str = intervalTime.mimutes + '分钟';
						}
						if (intervalTime.seconds !== 0) {
							str = intervalTime.seconds + '秒';
						}
						if (str === '') {
							str = '0秒';
						}
					}
					return str;
				};
				scope.isNull = function(str) {
					var resTxt = str;
					if (!str) {
						resTxt = '无';
					}
					return resTxt;
				};
			}
		};
	}])
	.directive('btnCopy', ['$util', function($util) {
		return {
			restrict: 'A',
			scope: {
				btnCopy: '='
			},
			link: function(scope, element) {
				$util.loadJs('/lib/js/jquery.zclip.js').then(function() {
					element.zclip({
						path: '/lib/media/ZeroClipboard.swf',
						copy: function() {
							return scope.btnCopy;
						}
					});
				});
			}
		};
	}])
	// 镜像展开与收起
	.directive('mirrorCollapse', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				scope.isCollapse = true;
				scope.toggleCollapse = function() {
					scope.isCollapse = !scope.isCollapse;
				};
			}
		};
	})
	// 页码
	.directive('listNo', function() {
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
			link: function(scope, element, attr) {
				var pageSize, pageTpl, i;
				scope.$watch(function() {
					return scope.listLen;
				}, function(newValue) {
					pageTpl = [];
					if (newValue) {
						pageSize = Math.ceil((newValue) / parseInt(scope.size));
						// pageTpl.push('<span class="page-info">当前第<span class="current-page">' + scope.pageno + '</span>页 / 共' + pageSize + '页</span>');
						pageTpl.push('<span class="pageno last"><i class="icon-last"></i></span>');
						pageTpl.push('<span class="pageno turn on">1</span>');
						for (i = 2; i <= pageSize && i <= 10; i++) {
							pageTpl.push('<span class="pageno turn">' + i + '</span>');
						}
						pageTpl.push('<span class="pageno next"><i class="icon-next"></i></span>');
						element.html(pageTpl.join(''));
					}
				});
				element.delegate('.pageno', 'click', function(event) {
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
	// 下拉选择框
	// <div class="select-con">
	// 		<button class="btn btn-select btn-white">{{deployIns.config.version?'version'+deployIns.config.version:'选择版本'}}<i class="icon-down"></i></button>
	// 		<ul class="select-list">
	// 			<li ng-repeat="version in deployIns.versionList" class="select-item"><a ng-click="toggleVersion(version.version)" ng-cloak="ng-cloak">version{{version.version}}</a></li>
	// 		</ul>
	// </div>
	// 
	// btn-select：触发下拉的按钮或输入框
	.directive('selectCon', function() {
		return {
			restrict: 'AEC',
			scope: true,
			controller: function($scope, $element, $attrs) {
				$scope.showSelect = false;
				this.hideSelect = function() {
					$scope.showSelect = false;
				};
			},
			link: function(scope, element, attrs) {
				var dropEle = attrs.$$element.find('.select-list');
				var selectEle = attrs.$$element.find('.btn-select');
				if (selectEle.length === 0) {
					return;
				}
				var blurFun = function(event) {
					scope.showSelect = false;
					scope.$digest();
					return event.stopPropagation();
				};
				selectEle.bind('blur', blurFun);
				dropEle.on('mouseenter', function() {
					selectEle.off('blur', blurFun);
				}).on('mouseleave', function() {
					selectEle.on('blur', blurFun);
				});
				if (selectEle[0].tagName === 'INPUT') {
					selectEle.on('focus', function() {
						scope.showSelect = true;
						scope.$digest();
					});
				} else {
					selectEle.on('click', function() {
						scope.showSelect = !scope.showSelect;
						scope.$digest();
					});
				}
				if (attrs.label == "true") {
					element.on('click', function() {
						selectEle.focus();
					}).on('click', 'li.select-label', function(event) {
						return event.stopPropagation();
					});
				}
				scope.$watch(function() {
					return scope.showSelect;
				}, function(showSelect) {
					if (showSelect) {
						dropEle.show();
						$('.drop').removeClass('up');
					} else {
						dropEle.hide();
						$('.drop').addClass('up');
					}
				});
			}
		};
	}).directive('selectItem', ['$compile', function($compile) {
		return {
			restrict: 'AEC',
			require: '^?selectCon',
			link: function(scope, element, attrs, controller) {
				scope.hideSelect = function() {
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
	}])
	.directive('scrollResize', ['$window', function($window) {
		return {
			scope: true,
			controller: function($scope, $element, $attrs) {
				$scope.totalWidth = 0;
				$scope.eleVisibleWidth = $element.width() - 157;
				$scope.pageCount = 1;
				this.addSigWidth = function(width) {
					$scope.totalWidth += width;
				};
				this.changeWidth = function(newWidth, oldWidth) {
					$scope.totalWidth = $scope.totalWidth - oldWidth + newWidth;
					$attrs.$$element.find('.nav-tabs').width($scope.totalWidth + 8);
					$scope.pageCount = Math.ceil($scope.totalWidth / $scope.eleVisibleWidth);
				};
			},
			link: function(scope, element, attrs) {
				var w = angular.element($window);
				var navOptionEle = attrs.$$element.find('.nav-option');
				var listEle = attrs.$$element.find('ul.nav');
				var currentPage = 1;
				scope.$watch(function() {
					return {
						'windowWidth': w.width(),
						'totalWidth': scope.totalWidth
					};
				}, function(newValue) {
					scope.eleVisibleWidth = element.width() - 157;
					navOptionEle.css({
						left: element.width() - 57
					});
					if (newValue.totalWidth > element.width() && !navOptionEle.is(':visible')) {
						navOptionEle.show();
					} else if (newValue.totalWidth <= element.width() && navOptionEle.is(':visible')) {
						navOptionEle.hide();
					}
					scope.pageCount = Math.ceil(newValue.totalWidth / scope.eleVisibleWidth);
				}, true);
				w.bind('resize', function() {
					scope.$apply();
				});
				listEle.find('.to-last').on('click', function() {
					if (currentPage > 1) {
						currentPage--;
						listEle.stop().animate({
							marginLeft: scope.eleVisibleWidth * (-1) * (currentPage - 1)
						}, 600);
					}
				});
				listEle.find('.to-next').on('click', function() {
					if (currentPage < scope.pageCount) {
						listEle.stop().animate({
							marginLeft: scope.eleVisibleWidth * (-1) * (currentPage++)
						}, 600);
					}
				});
			}
		};
	}])
	.directive('resizeItem', function() {
		return {
			require: "^scrollResize",
			link: function(scope, element, attrs, controller) {
				var width = 0;
				controller.addSigWidth(element.innerWidth());
				scope.$watch(function() {
					return element.innerWidth();
				}, function(newValue, oldValue) {
					controller.changeWidth(newValue, oldValue);
				});
				scope.$on('$destroy', function() {
					controller.changeWidth(0, element.innerWidth());
				});
			}
		};
	});