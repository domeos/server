/*
 * @author ChandraLee
 * @description 日志页面
 */

(function($) {
	'use strict';
	var getQueryString = function(name) {
		var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
		var r = window.location.search.substr(1).match(reg);
		if (r !== null) {
			return unescape(r[2]);
		}
		return null;
	};
	var logUrl = decodeURIComponent(getQueryString('url')),
		logSocket, logStr = '',
		logHasChange = false,
		logEle = $('#log'),
		logWrapEle = $('body'),
		isNeedScroll = true;

	var onMessage = function(event) {
		logHasChange = true;
		logStr += event.data.replace(/[\n]/g, '<br>');
	};
	var onOpen = function() {
		console.log('连接打开！');
	};
	$(window).bind('mousewheel', function(event, delta) {
		var dir = delta > 0 ? 'Up' : 'Down';
		if (isNeedScroll) {
			if (dir == 'Up') {
				isNeedScroll = false;
			}
		} else if (logEle.height() - $(this).scrollTop() < $(this).height() + 20) {
			isNeedScroll = true;
		}
	});
	if (logUrl === '') {
		logEle.append('<p class="nolog">无日志信息</p>');
	} else if (logUrl.indexOf('ws') === 0) {
		logSocket = new WebSocket(logUrl);

		logSocket.onopen = function(event) {
			onOpen(event);
		};
		logSocket.onmessage = function(event) {
			onMessage(event);
		};
		logSocket.onclose = function() {
			console.log('连接被关闭！');
		};
		setInterval(function() {
			if (logHasChange) {
				logEle.append(logStr);
				if (isNeedScroll) {
					logWrapEle.scrollTop(logEle.height());
				}
				logHasChange = false;
				logStr = '';
			}
		}, 1000);
	} else {
		$.ajax({
			method: 'GET',
			url: logUrl,
			success: function(data) {
				if (data.result) {
					var logStr = data.result.replace(/[\n\r]/g, '<br>');
					logEle.append(logStr);
					logWrapEle.scrollTop(logEle.height());
				} else {
					logEle.append('<p class="nolog">无日志信息</p>');
				}
			},
			error: function() {
				logEle.append('<p class="nolog">请求错误！</p>');
			}
		});
	}
})(jQuery);