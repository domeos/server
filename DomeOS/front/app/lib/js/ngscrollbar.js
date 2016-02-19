/**
 * @name ng-scrollbar
 * @author angrytoro
 * @since 9/12/2014
 * @version 0.1
 * @beta 0.2
 * @see https://github.com/angrytoro/ngscrollbar
 * @copyright 2014 angrytoro
 * @license MIT: You are free to use and modify this code, on the condition that this copyright notice remains.
 *
 * @description The angular directive ng-scrollbar imitate the true browser scrollbar.
 * It's applied to the element which set height or width attribute and the overflow is auto, but exclude body element.
 * It's not necessary to imitate scrollbar for body element, if you use the AngularJS.
 * suggests: don't use the directive, if you don't have to. The scrollbar which is inbuilt in browser is more highly-efficient.
 *AngularJS is not fit for IE which version is less then 9, so the directive is not fit the IE(8,7,6,5).
 *
 *
 * @example
 * 1.
 * <div style="height:300px;overflow:auto;" ng-scrollbar>
 *     <li ng-repeat="item in items">item</li>
 * </div>
 * 2.
 * <div style="height:300px;overflow:auto;" ng-scrollbar scrollbar-x="false" scrollbar-y="true" scrollbar-config="{show:true, autoResize: true, dragSpeed: 1.2}">
 *     <li ng-repeat="item in items">item</li>
 * </div>
 * 3.
 * <div ng-scrollbar>
 *     <div style="height:400px;width:3000px"></div>
 * </div>
 *
 * @conf spec
 * scrollbar-x the value is true or false, to configure the x scrollbar create or no create, the default value is true. but the directive can decide whether it need be created if user not set the attribute.
 *
 * scrollbar-y the value is true or false, to configure the y scrollbar create or no create, the default value is true. but the directive can decide whether it need be created if user not set the attribute.
 *
 * scrollbar-config 
 * default config is
 *
 * {
 *      dragSpeed: 1, //default browser delta value is 120 or -120
        autoResize: false, // if need auto resize, default false
        show: false, // if need show when mouse not enter the container element which need scrollbar, default false.
        scrollbar: {
            width: 6, //scrollbar width
            hoverWidth: 8, //scrollbar width when the mouse hover on it 
            color: 'rgba(0,0,0,.6)' //scrollbar background color
        },
        scrollbarContainer: {
            width: 12, //scrollbarContainer width 
            color: 'rgba(0,0,0,.1)' // scrollbarContainer background 
        }
 * }
 *
 */

angular.module('widget.scrollbar', [])
.directive('ngScrollbar', [
    function() {
        return {
            restrict: 'AE',
            transclude: true,
            scope: {
                scrollbarConfig: '=scrollbarConfig',
                scrollbarX: '@', // the value is true or false, to configure the x scrollbar create or no create.
                scrollbarY: '@' // the value is true or false, to configure the y scrollbar create or no create.
            },
            template: '<div style="position:relative;width:100%;height:100%;">\
                            <div class="ngscroll-content-container" style="display:inline-block;margin-top:0;margin-left:0" ng-transclude>\
                            </div>\
                            <ng-scrollbar-x ng-if="scrollbarX || scrollbarX === undefined"></ng-scrollbar-x>\
                            <ng-scrollbar-y ng-if="scrollbarY || scrollbarY === undefined"></ng-scrollbar-y>\
                       </div>',
            controller: 'scrollbarController',
            compile: function(element) {
                element.css('overflow', 'hidden');
                return function(scope, element, attrs, ctrl) {
                    ctrl.init(element, scope.scrollbarConfig);
                    
                };
            }
        };
    }
])
.controller('scrollbarController', [function() {

    var defaultConfig = {
        dragSpeed: 1, //default browser delta value is 120 or -120
        autoResize: false, // if need auto resize, default false
        show: false, // if need show when mouse not enter the container element which need scrollbar, default false.
        scrollbar: {
            width: 6, //scrollbar width
            hoverWidth: 8, //scrollbar width when the mouse hover on it 
            color: 'rgba(0,0,0,.6)' //scrollbar background color
        },
        scrollbarContainer: {
            width: 12, //scrollbarContainer width 
            color: 'rgba(0,0,0,.1)' // scrollbarContainer background 
        }
    };
    var containerElement, // the element which need the directive of ngscrollbar
        contentElement, // the element which transclude the true content
        config, // config
        scrollbarMargin, // the variable is used to descide the scrollbar element top or left to its parent element scrollbarContainer
        scrollbarHoverMargin; // the variable is used to descide the scrollbar element top or left to its parent element scrollbarContainer when the mouse hover on the scrollbar

    /**
     * it must be called before the controller is used.
     * @param  {jqlite object} element         it's necessary variable
     * @param  {object} scrollbarConfig        the config which is defined by user
     * @return                 
     */
    this.init = function(element, scrollbarConfig) {
        containerElement = element;
        config = angular.copy(angular.extend(defaultConfig, scrollbarConfig || {}));
        contentElement = angular.element(element[0].querySelector('.ngscroll-content-container'));
        scrollbarMargin = (config.scrollbarContainer.width - config.scrollbar.width) / 2;
        scrollbarHoverMargin = (config.scrollbarContainer.width - config.scrollbar.hoverWidth) / 2;
    };

    angular.extend(this, {
        /**
         * get the element which need the directive of ngscrollbar
         * @return {jqlite object} 
         */
        getContainerElement: function() {
            return containerElement;
        },
        /**
         * the element which transclude the true content
         * @return {jqlite object}
         */
        getContentElement: function() {
            return contentElement;
        },
        /**
         * get the config
         * @return {object}
         */
        getConfig: function() {
            return config;
        },
        /**
         * get the scrollbarMargin
         * @return {number}
         */
        getScrollbarMargin: function() {
            return scrollbarMargin;
        },
        /**
         * get the scrollbarHoverMargin
         * @return {number}
         */
        getScrollbarHoverMargin: function() {
            return scrollbarHoverMargin;
        }
    });
}])
.directive('ngScrollbarY', ['$timeout', function($timeout){
    return {
        restrict: 'AE',
        require: '^ngScrollbar',
        replace: true,
        template: '<div class="ngscrollbar-container-y" ng-style="styles.scrollbarContainer"><div class="ngscrollbar-y" ng-style="styles.scrollbar"></div></div>',
        compile: function() {
            return function(scope, element, attrs, ctrl) {

                var config = ctrl.getConfig(),
                    docEl = angular.element(document),
                    containerElement = ctrl.getContainerElement(),
                    contentElement = ctrl.getContentElement(),
                    scrollbar = angular.element(element[0].querySelector('.ngscrollbar-y')),
                    scrollbarMargin = ctrl.getScrollbarMargin(),
                    scrollbarHoverMargin = ctrl.getScrollbarHoverMargin();

                scope.styles = {
                    scrollbarContainer: {
                        position: 'absolute',
                        width: config.scrollbarContainer.width + 'px',
                        height: '100%',
                        top: 0,
                        right: 0,
                        transition: 'background .3s ease-in-out',
                        'border-radius': config.scrollbarContainer.width / 2 + 'px'
                    },
                    scrollbar: {
                        position: 'absolute',
                        width: config.scrollbar.width + 'px',
                        right: scrollbarMargin + 'px',
                        cursor: 'default',
                        opacity: 0,
                        transition: 'opacity .3s ease-in-out, border-radius .1s linear, width .1s linear, right .1s linear',
                        background: config.scrollbar.color,
                        'border-radius': config.scrollbar.width / 2 + 'px'
                    }
                };

                var getContentHeight = function() {
                    return contentElement[0].offsetHeight;
                };

                var getContainerHeight = function() {
                    return containerElement[0].offsetHeight;
                };

                var getScrollbarHeight = function() {
                    var height = Math.pow(getContainerHeight(), 2) / getContentHeight() - scrollbarMargin*2;
                    return height;
                };

                var isOverflow = function() {
                    return getContentHeight() > getContainerHeight();
                };

                var hideScrollbar = function() {
                    scrollbar.css('opacity', 0);
                };

                var showScrollbar = function() {
                    scrollbar.css('opacity', 1);
                };

                var reset = function() {
                    var oldMarginTop = parseInt(contentElement.css('margin-top'), 10);
                    contentElement.css('margin-top', '0px'); // this is for the element which has the attribute of max-height
                    if (isOverflow()) {
                        element.css('display', 'block');
                        scrollbar.css('height', getScrollbarHeight() + 'px');
                        scrollTo(oldMarginTop);
                        if (config.show) {
                            showScrollbar();
                        }
                    } else {
                        element.css('display', 'none');
                    }
                };

                var scrollTo = function(top) {
                    top = Math.min(0, Math.max(top, getContainerHeight() - getContentHeight()));
                    contentElement.css('margin-top', top + 'px');
                    scrollbar.css('top', -top/getContentHeight()*getContainerHeight() + scrollbarMargin + 'px');
                };

                var scroll = function(distance) {
                    var newTop = parseInt(contentElement.css('margin-top'), 10) + distance;
                    scrollTo(newTop);
                };

                containerElement.on('mousewheel', function(event) {
                    if (!isOverflow()) {
                        return;
                    }
                    event.preventDefault();
                    if (event.originalEvent !== undefined) {
                        event = event.originalEvent;
                    }
                    scroll(event.wheelDeltaY || event.wheelDelta);
                });

                if(window.navigator.userAgent.toLowerCase().indexOf('firefox') >= 0) {
                    containerElement.on('wheel', function(event) {
                        if (!isOverflow()) {
                            return;
                        }
                        event.preventDefault();
                        if (event.originalEvent !== undefined) {
                            event = event.originalEvent;
                        }
                        scroll(-event.deltaY * 40);// the ff delta value is 3 or -3 when scroll and the chrome or ie is -120 or 120, so it must multiply by 40
                    });
                }

                element.on('mouseenter', function() {
                    element.css('background', config.scrollbarContainer.color);
                    scrollbar.css('width', config.scrollbar.hoverWidth + 'px');
                    scrollbar.css('right', scrollbarHoverMargin + 'px');
                    scrollbar.css('border-radius', config.scrollbar.hoverWidth / 2 + 'px');
                });

                element.on('mouseleave', function() {
                    element.css('background', 'none');
                    scrollbar.css('width', config.scrollbar.width + 'px');
                    scrollbar.css('right', scrollbarMargin + 'px');
                    scrollbar.css('border-radius', config.scrollbar.width / 2 + 'px');
                });

                var scrollbarMousedown = false,
                    axisY,
                    mouseInElement = false;

                if (!config.show) {
                    containerElement.on('mouseenter', function() {
                        mouseInElement = true;
                        showScrollbar();
                    });
                    containerElement.on('mouseleave', function() {
                        mouseInElement = false;
                        if (scrollbarMousedown) {
                            return;
                        }
                        hideScrollbar();
                    });
                }

                scrollbar.on('mousedown', function(event) {
                    event.preventDefault();
                    axisY = event.screenY;
                    scrollbarMousedown = true;
                    docEl.one('mouseup', function() {
                        scrollbarMousedown = false;
                        if (!config.show && !mouseInElement) {
                            hideScrollbar();
                        }
                        // docEl.off('mouseup', arguments.callee);
                    });
                });
                docEl.on('mousemove', function(event) {
                    if(scrollbarMousedown) {
                        event.preventDefault();
                        scroll(-(event.screenY - axisY) * config.dragSpeed * getContentHeight() / getContainerHeight());
                        axisY = event.screenY;
                    }
                });

                $timeout(function() {
                    reset();
                    if (!!document.createStyleSheet) { //if the browser is ie browser
                        contentElement.on('DOMNodeInserted', reset);
                        contentElement.on('DOMNodeRemoved', reset);
                    } else {
                        var observer = new MutationObserver(function(mutations){
                            if (mutations.length) {
                                reset();
                            }
                        });
                        observer.observe(contentElement[0], {childList:true, subtree: true});
                    }
                }, 5);
            };
        }
    };
}])
.directive('ngScrollbarX', ['$timeout', function($timeout) {
    return {
        restrict: 'AE',
        replace: true,
        require: '^ngScrollbar',
        template: '<div class="ngscrollbar-container-x" ng-style="styles.scrollbarContainer"><div class="ngscrollbar-x" ng-style="styles.scrollbar"></div></div>',
        compile: function() {
            return function(scope, element, attrs, ctrl) {

                var config = ctrl.getConfig(),
                    docEl = angular.element(document),
                    containerElement = ctrl.getContainerElement(),
                    containerDom = containerElement[0],
                    contentElement = ctrl.getContentElement(), //the container of content
                    scrollbar = angular.element(element[0].querySelector('.ngscrollbar-x')),
                    scrollbarMargin = ctrl.getScrollbarMargin(),
                    scrollbarHoverMargin = ctrl.getScrollbarHoverMargin();

                scope.styles = {
                    scrollbarContainer: {
                        position: 'absolute',
                        width: '100%',
                        transition: 'background .3s ease-in-out',
                        'border-radius': config.scrollbarContainer.width / 2 + 'px'
                    },
                    scrollbar: {
                        position: 'absolute',
                        cursor: 'default',
                        opacity: 0,
                        transition: 'opacity .3s ease-in-out, border-radius .1s linear, width .1s linear, right .1s linear',
                        background: config.scrollbar.color,
                        'border-radius': config.scrollbar.width / 2 + 'px'
                    }
                };

                element.css('height', config.scrollbarContainer.width + 'px'); // set the scrollbarContainer height;
                element.css('bottom', 0); // set scrollbarContainer top
                element.css('left', 0); //set scrollbarContainer left
                scrollbar.css('top', scrollbarMargin + 'px'); //set scrollbar top
                scrollbar.css('height', config.scrollbar.width + 'px');

                var getContentWidth = function() {
                    return contentElement[0].offsetWidth;
                };

                var getContainerWidth = function() {
                    return containerDom.offsetWidth;
                };

                var getScrollbarWidth = function() {
                    return Math.pow(getContainerWidth(), 2) / getContentWidth() - scrollbarMargin * 2;
                };

                var showScrollbar = function() {
                    scrollbar.css('opacity', 1);
                };

                var hideScrollbar = function() {
                    scrollbar.css('opacity', 0);
                };

                var isOverflow = function() {
                    return getContentWidth() > getContainerWidth();
                };

                var reset = function() {
                    var oldMarginLeft = parseInt(contentElement.css('margin-left'), 10);
                    contentElement.css('margin-left', '0px');
                    if (isOverflow()) {
                        element.css('display', 'block');
                        scrollbar.css('width', getScrollbarWidth() + 'px');
                        scrollTo(oldMarginLeft);
                        if (config.show) {
                            showScrollbar();
                        }
                    } else {
                        element.css('display', 'none');
                    }
                };

                var scrollTo = function(left) {
                    left = Math.min(0, Math.max(left, getContainerWidth() - getContentWidth()));
                    contentElement.css('margin-left', left + 'px');
                    scrollbar.css('left', -left/getContentWidth()*getContainerWidth() + scrollbarMargin + 'px');
                };

                var scroll = function(distance) {
                    var left = parseInt(contentElement.css('margin-left'), 10) + distance;
                    scrollTo(left);
                };

                element.on('mouseenter', function() {
                    element.css('background', config.scrollbarContainer.color);
                    scrollbar.css('height', config.scrollbar.hoverWidth + 'px');
                    scrollbar.css('top', scrollbarHoverMargin + 'px');
                    scrollbar.css('border-radius', config.scrollbar.hoverWidth / 2 + 'px');
                });

                element.on('mouseleave', function() {
                    element.css('background', 'none');
                    scrollbar.css('height', config.scrollbar.width + 'px');
                    scrollbar.css('top', scrollbarMargin + 'px');
                    scrollbar.css('border-radius', config.scrollbar.width / 2 + 'px');
                });

                var scrollbarMousedown = false,
                    axisX,
                    mouseInElement = false;

                if (!config.show) {
                    containerElement.on('mouseenter', function() {
                        mouseInElement = true;
                        showScrollbar();
                    });
                    containerElement.on('mouseleave', function() {
                        mouseInElement = false;
                        if (scrollbarMousedown) {
                            return;
                        }
                        hideScrollbar();
                    });
                }

                scrollbar.on('mousedown', function(event) {
                    event.preventDefault();
                    scrollbarMousedown = true;
                    axisX = event.screenX;
                    docEl.one('mouseup', function() {
                        scrollbarMousedown = false;
                        if (!config.show && !mouseInElement) {
                            hideScrollbar();
                        }
                        // docEl.off('mouseup', arguments.callee);
                    });
                });
                docEl.on('mousemove', function(event) {
                    if(scrollbarMousedown) {
                        event.preventDefault();
                        scroll(-(event.screenX - axisX) * config.dragSpeed * getContentWidth() / getContainerWidth());
                        axisX = event.screenX;
                    }
                });

                $timeout(function() {
                    reset();
                    if (!!document.createStyleSheet) { //if the browser is ie browser
                        contentElement.on('DOMNodeInserted', reset);
                        contentElement.on('DOMNodeRemoved', reset);
                    } else {
                        var observer = new MutationObserver(function(mutations){
                            if (mutations.length) {
                                reset();
                            }
                        });
                        observer.observe(contentElement[0], {childList:true, subtree: true});
                    }
                }, 5);
            };
        }
    };
}]);