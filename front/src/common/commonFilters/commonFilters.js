/* jshint esversion: 6 */
; (function (commonFilters) {

  // 显示文件大小
  commonFilters.filter('byte', function () {
    return function (bytes) {
      if (typeof bytes !== 'number' || !isFinite(bytes) || bytes < 0) return 'N/A';
      const units = [...' KMGTPEZY'].map(prefix => `${prefix.trim()}B`);
      let level = 0, size = bytes;
      while (size > 1000) {
        size /= 1024;
        level++;
      }
      if (level >= units.length) return 'N/A';
      return ('' + size).slice(0, 4).replace(/\.$/, '') + units[level];
    };
  });

  // 显示日期
  commonFilters.filter('day', ['$filter', function ($filter) {
    return function (date) {
      if (!+date) return '暂无';
      return $filter('date')(date, 'yyyy-MM-dd')
    };
  }]);

  // 显示时刻
  commonFilters.filter('time', ['$filter', function ($filter) {
    return function (date) {
      if (!+date) return '暂无';
      return $filter('date')(date, 'yyyy-MM-dd HH:mm:ss')
    };
  }]);

  // 相对今天的日期
  commonFilters.filter('reldate', ['$filter', function ($filter) {
    return function (rel, format) {
      let date = new Date();
      date.setDate(date.getDate() + rel);
      return $filter('date')(date, format || 'yyyy-MM-dd')
    };
  }]);

}(window.commonFilters = window.commonFilters || angular.module('commonFilters', [])));
