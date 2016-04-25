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
	//  列表--左右滚动
	//  <ul list-scroll="list-scroll" width-offset="150">
	//	  <li disabled="true" class="nav-option"><span><a class="icon-last to-last"></a><a class="icon-next to-next"></a></span></li>
	//	  <li ng-repeat="image in editConfig.containerDrafts" ng-cloak="ng-cloak" ng-click="currentContainerDraft.index=$index;" ng-class="{'active':currentContainerDraft.index===$index,'txt-error':needValid.valid&amp;&amp;mirrorsListFrom['Form'+$index].$invalid}">{{image.image}}<a ng-click="deleteImage($index);fresh()" class="icon-cancel"></a></li>
	//	</ul>
	.directive('listScroll', ['$window', '$document', function($window, $document) {
		return {
			restrict: 'A',
			template: '<div class="com-tabset-scroll"><div class="list-back"><ul class="com-list-tab list-scroll" ng-transclude></ul></div></div>',
			replace: true,
			transclude: true,
			link: function(scope, ele, attrs) {
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
				nextEle.bind('click', function() {
					if (totalPage <= 1 || currentPage === totalPage - 1) return;
					listEle.stop().animate({
						marginLeft: (eleWidth - 48) * -(++currentPage)
					}, 600);
				});
				// 上一页
				lastEle.bind('click', function() {
					if (currentPage === 0) return;
					listEle.stop().animate({
						marginLeft: (eleWidth - 48) * -(--currentPage)
					}, 600);
				});
				scope.safeApply = function(fn) {
					var phase = this.$root.$$phase;
					if (phase == '$apply' || phase == '$digest') {
						if (fn && (typeof(fn) === 'function')) {
							fn();
						}
					} else {
						this.$apply(fn);
					}
				};
				// 刷新列表
				scope.$on('changeScrollList', function(event, msg) {
					scope.fresh();
				});
				// TODO:无法及时触发ul的宽度改变事件，此处采用手动触发
				scope.fresh = function() {
					setTimeout(function() {
						scope.safeApply();
					}, 100);
				};
				scope.$watch(function() {
					return {
						windowWidth: w.width(),
						listWidth: listEle.width()
					};
				}, function(newValue, oldValue) {
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
					// console.(eleWidth,newValue.listWidth,totalPage)
					ele.css('max-width', (eleWidth > newValue.listWidth ? newValue.listWidth : eleWidth) + 'px');
					if (oldValue.windowWidth !== newValue.windowWidth) {
						currentPage = 0;
						listEle.css('margin-left', 0);
					}
				}, true);
				w.bind('resize', function() {
					scope.$apply();
				});
			}
		};
	}])
	.directive('logInfo', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				var scrollTop = 0;
				var isNeedScroll = true;
				element.bind('scroll', function(event) {
					if (isNeedScroll) {
						var topPositon = element.find('.log').position().top;
						if (topPositon > scrollTop) {
							isNeedScroll = false;
						}
						scrollTop = topPositon;
					}
				});
				scope.$watch('log', function(newValue, oldValue) {
					if (isNeedScroll) {
						element.scrollTop(element.find('.log').height());
					}
				});
			}
		};
	})
	// 开关
	.directive('domeToggle', function() {
		return {
			restrict: 'AE',
			template: '<button class="ui-toggle"></button>',
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
				$util.loadJs('/lib/js/showdown-ca46797abd.min.js').then(function() {
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
	// 项目构建记录
	.directive('loglist', ['$util', '$domeProject', function($util, $domeProject) {
		return {
			restrict: 'AE',
			template: '<div ng-transclude></div>',
			transclude: true,
			link: function(scope, element) {
				scope.currentIndex = -1;
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
					tplArr.push('					<input class="cmd-txt ui-input-white" disabled="true" value="docker pull {#registry}/{#imageName}:{#imageTag}"/><a class="link-safe link-copy" data-text="docker pull {#registry}/{#imageName}:{#imageTag}">复制</a>');
					tplArr.push('					<p class="cmd-prompt"> 拉取镜像前请登录：docker login domeos.io</p>');
					tplArr.push('				</span>');
					tplArr.push('			</li>');
					if (!!scope.buildList[index].codeBranch) {
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
					return $util.parseTpl(tplArr.join(''), scope.buildList[index]);
				};
				scope.showDetail = function(index) {
					if (index != scope.currentIndex) {
						element.find('.log-detail').remove();
						element.find('tr:eq(' + index + ')').after(getLogDetailTpl(index));
						element.find('.link-copy').zclip({
							path: '/lib/media/ZeroClipboard.swf',
							copy: function() {
								return angular.element(this).data('text');
							}
						});
						$domeProject.getBuildDockerfile(scope.buildList[index].projectId, scope.buildList[index].id).then(function(res) {
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
				scope.parseDate = function(seconds) {
					return $util.getPageDate(seconds);
				};
				scope.getInterval = function(index) {
					return $util.getPageInterval(scope.buildList[index].createTime, scope.buildList[index].finishTime);
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
				$util.loadJs('/lib/js/jquery-a482e1500f.zclip.js').then(function() {
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
	.directive('fileCollapse', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				scope.showFile = false;
				scope.showContent = false;
				scope.toggleFile = function() {
					scope.showFile = true;
				};
				scope.toggleContent = function() {
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
	.directive('customlist', ['$util', '$domeProject', '$domeImage', function($util, $domeProject, $domeImage) {
		return {
			restrict: 'AE',
			template: '<div ng-transclude></div>',
			transclude: true,
			link: function(scope, element) {
				var isZclipLoaded = false;
				scope.currentIndex = -1;
				var getLogDetailTpl = function(index) {
					var tplArr = [];
					var type = scope.customDetailInfo.autoCustom === 0 ? 'Dockerfile' : '配置文件';
					var ispublic = scope.customDetailInfo.publish === 0 ? '否' : '是';
					tplArr.push('<tr class="custom-detail">');
					tplArr.push('	<td colspan="9" class="td-detail">');
					tplArr.push('		<ul class="com-list-info detail-list">');
					tplArr.push('			<li>');
					tplArr.push('				<span class="info-name">定制详情</span>');
					tplArr.push('				<span class="info-simple">' + type + '</span>');
					tplArr.push('			</li>');
					//成功才显示镜像大小和拉取命令
					if (scope.customDetailInfo.status == 'Success') {
						tplArr.push('			<li>');
						tplArr.push('				<span class="info-name">镜像大小</span>');
						tplArr.push('				<span class="info-simple">{#imageSize}MB</span>');
						tplArr.push('			</li>');
						tplArr.push('			<li>');
						tplArr.push('				<span class="info-name">拉取命令</span>');
						tplArr.push('				<div class="info-content cmd-wrap">');
						tplArr.push('					<input class="ui-input-fill" disabled="true" value="docker pull {#registry}/{#imageName}:{#imageTag}"/><button class="ui-btn ui-btn-sm ui-btn-active link-copy" data-text="docker pull {#registry}/{#imageName}:{#imageTag}">复制</button>');
						tplArr.push('					<p class="txt-prompt"> 拉取镜像前请登录：docker login domeos.io</p>');
						tplArr.push('				</div>');
						tplArr.push('			</li>');
					}
					tplArr.push('			<li>');
					tplArr.push('				<span class="info-name">环境变量</span>');
					//环境变量
					var evnList = scope.customDetailInfo.envConfigs;
					var evnLength = evnList.length;
					if (evnLength === 0) {
						tplArr.push('				<span class="info-simple">' + '无' + '</span>');
					} else {
						tplArr.push('				<div class="info-content">');
						tplArr.push('					<table class="ui-table-primary">');
						tplArr.push('						<tr>');
						tplArr.push('							<td>名称</td>');
						tplArr.push('							<td>值</td>');
						tplArr.push('							<td>描述</td>');
						tplArr.push('						</tr>');
						for (var i = 0; i < evnLength; i++) {

							tplArr.push('						<tr>');
							tplArr.push('							<td>' + evnList[i].envKey + '</td>');
							tplArr.push('							<td>' + evnList[i].envValue + '</td>');
							tplArr.push('							<td>' + evnList[i].description + '</td>');
							tplArr.push('						</tr>');

						}
						tplArr.push('					</table>');
						tplArr.push('				</div>');
					}
					tplArr.push('			</li>');
					tplArr.push('			<li>');
					tplArr.push('				<span class="info-name">定制镜像是否作为基础镜像</span>');
					tplArr.push('				<span class="info-simple">' + ispublic + '</span>');
					tplArr.push('			</li>');
					tplArr.push('			<li>');
					tplArr.push('				<span class="info-name">定制镜像描述</span>');
					if (scope.customDetailInfo.description === null || scope.customDetailInfo.description === '') {
						tplArr.push('				<span class="info-simple">' + '无' + '</span>');
					} else {
						tplArr.push('				<span class="info-simple">{#description}</span>');
					}

					tplArr.push('			</li>');
					tplArr.push('			<li>');
					tplArr.push('				<span class="info-name">Dockerfile</span>');
					if (scope.customDetailInfo.dockerfileContent === null || scope.customDetailInfo.dockerfileContent === '') {
						tplArr.push('				<span class="info-simple">' + '无' + '</span>');
					} else {
						tplArr.push('				<div class="info-content">');
						tplArr.push('					<textarea readonly="true" class="ui-input-fill file-txt">{#dockerfileContent}</textarea>');
						tplArr.push('				</div>');
					}

					tplArr.push('			</li>');
					//配置文件(autoCustom === 1)
					if (scope.customDetailInfo.autoCustom === 1 && scope.customDetailInfo.files) {
						tplArr.push('			<li>');
						tplArr.push('				<span class="info-name">配置文件</span>');

						var fileJson = scope.customDetailInfo.files;
						var length = fileJson.length;
						if (length && length !== 0) {
							tplArr.push('				<div class="info-content">');
							for (var j = 0; j < length; j++) {
								tplArr.push('					<div class="line-long">');
								tplArr.push('						<p class="con-num">' + (j + 1) + '</p>');
								tplArr.push('						<span class="config-title">名称:' + fileJson[j].fileName + '</span>');
								tplArr.push('						<span class="config-title">容器内路径:' + fileJson[j].filePath + '</span>');
								tplArr.push('					</div>');
								tplArr.push('					<textarea readonly="true" class="ui-input-fill file-txt">' + fileJson[j].content + '</textarea>');
							}
							tplArr.push('				</div>');
						} else {
							tplArr.push('					<span class="info-simple">' + '无' + '</span>');
						}
						tplArr.push('			</li>');
					}
					tplArr.push('			<li>');
					tplArr.push('				<button class="ui-btn ui-btn-none btn-pack" >收起<i class="icon-down top"></i></button>');
					tplArr.push('			</li>');
					tplArr.push('		</ul>');
					tplArr.push('	</td>');
					tplArr.push('</tr>');
					return $util.parseTpl(tplArr.join(''), scope.customDetailInfo);
				};
				$util.loadJs('/lib/js/jquery-a482e1500f.zclip.js').then(function() {
					isZclipLoaded = true;
				});
				var bindCopy = function() {
					element.find('.link-copy').zclip({
						path: '/lib/media/ZeroClipboard.swf',
						copy: function() {
							return angular.element(this).data('text');
						}
					});
				};
				var bindPickUp = function() {
					element.find('.btn-pack').click(function(event) {
						scope.$apply(function() {
							scope.currentIndex = -1;
							element.find('.custom-detail').remove();
						});
					});
				};
				scope.showDetail = function(index, id) {
					if (index !== scope.currentIndex) {
						$domeImage.getCustomDetail(id).then(function(res) {
							scope.customDetailInfo = res.data.result || {};
							element.find('.custom-detail').remove();
							element.find('tr:eq(' + index + ')').after(getLogDetailTpl(index));
							bindPickUp();
							if (isZclipLoaded) {
								bindCopy();
							} else {
								$util.loadJs('/lib/js/jquery-a482e1500f.zclip.js').then(function() {
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
				scope.getInterval = function(index) {
					return $util.getPageInterval(scope.customList[index].createTime, scope.customList[index].finishTime);
				};
				scope.parseDate = function(seconds) {
					return $util.getPageDate(seconds);
				};
			}
		};
	}]);