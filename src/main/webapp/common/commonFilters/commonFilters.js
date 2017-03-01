'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* jshint esversion: 6 */
;(function (commonFilters) {

  // 显示文件大小
  commonFilters.filter('byte', function () {
    return function (bytes) {
      if (typeof bytes !== 'number' || !isFinite(bytes) || bytes < 0) return 'N/A';
      var units = [].concat(_toConsumableArray(' KMGTPEZY')).map(function (prefix) {
        return prefix.trim() + 'B';
      });
      var level = 0,
          size = bytes;
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
      return $filter('date')(date, 'yyyy-MM-dd');
    };
  }]);

  // 显示时刻
  commonFilters.filter('time', ['$filter', function ($filter) {
    return function (date) {
      return $filter('date')(date, 'yyyy-MM-dd HH:mm:ss');
    };
  }]);

  // 相对今天的日期
  commonFilters.filter('reldate', ['$filter', function ($filter) {
    return function (rel, format) {
      var date = new Date();
      date.setDate(date.getDate() + rel);
      return $filter('date')(date, format || 'yyyy-MM-dd');
    };
  }]);
})(window.commonFilters = window.commonFilters || angular.module('commonFilters', []));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9jb21tb25GaWx0ZXJzL2NvbW1vbkZpbHRlcnMuZXMiXSwibmFtZXMiOlsiY29tbW9uRmlsdGVycyIsImZpbHRlciIsImJ5dGVzIiwiaXNGaW5pdGUiLCJ1bml0cyIsIm1hcCIsInByZWZpeCIsInRyaW0iLCJsZXZlbCIsInNpemUiLCJsZW5ndGgiLCJzbGljZSIsInJlcGxhY2UiLCIkZmlsdGVyIiwiZGF0ZSIsInJlbCIsImZvcm1hdCIsIkRhdGUiLCJzZXREYXRlIiwiZ2V0RGF0ZSIsIndpbmRvdyIsImFuZ3VsYXIiLCJtb2R1bGUiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBLENBQUcsV0FBVUEsYUFBVixFQUF5Qjs7QUFFMUI7QUFDQUEsZ0JBQWNDLE1BQWQsQ0FBcUIsTUFBckIsRUFBNkIsWUFBWTtBQUN2QyxXQUFPLFVBQVVDLEtBQVYsRUFBaUI7QUFDdEIsVUFBSSxPQUFPQSxLQUFQLEtBQWlCLFFBQWpCLElBQTZCLENBQUNDLFNBQVNELEtBQVQsQ0FBOUIsSUFBaURBLFFBQVEsQ0FBN0QsRUFBZ0UsT0FBTyxLQUFQO0FBQ2hFLFVBQU1FLFFBQVEsNkJBQUksV0FBSixHQUFpQkMsR0FBakIsQ0FBcUI7QUFBQSxlQUFhQyxPQUFPQyxJQUFQLEVBQWI7QUFBQSxPQUFyQixDQUFkO0FBQ0EsVUFBSUMsUUFBUSxDQUFaO0FBQUEsVUFBZUMsT0FBT1AsS0FBdEI7QUFDQSxhQUFPTyxPQUFPLElBQWQsRUFBb0I7QUFDbEJBLGdCQUFRLElBQVI7QUFDQUQ7QUFDRDtBQUNELFVBQUlBLFNBQVNKLE1BQU1NLE1BQW5CLEVBQTJCLE9BQU8sS0FBUDtBQUMzQixhQUFPLENBQUMsS0FBS0QsSUFBTixFQUFZRSxLQUFaLENBQWtCLENBQWxCLEVBQXFCLENBQXJCLEVBQXdCQyxPQUF4QixDQUFnQyxLQUFoQyxFQUF1QyxFQUF2QyxJQUE2Q1IsTUFBTUksS0FBTixDQUFwRDtBQUNELEtBVkQ7QUFXRCxHQVpEOztBQWNBO0FBQ0FSLGdCQUFjQyxNQUFkLENBQXFCLEtBQXJCLEVBQTRCLENBQUMsU0FBRCxFQUFZLFVBQVVZLE9BQVYsRUFBbUI7QUFDekQsV0FBTyxVQUFVQyxJQUFWLEVBQWdCO0FBQ3JCLGFBQU9ELFFBQVEsTUFBUixFQUFnQkMsSUFBaEIsRUFBc0IsWUFBdEIsQ0FBUDtBQUNELEtBRkQ7QUFHRCxHQUoyQixDQUE1Qjs7QUFNQTtBQUNBZCxnQkFBY0MsTUFBZCxDQUFxQixNQUFyQixFQUE2QixDQUFDLFNBQUQsRUFBWSxVQUFVWSxPQUFWLEVBQW1CO0FBQzFELFdBQU8sVUFBVUMsSUFBVixFQUFnQjtBQUNyQixhQUFPRCxRQUFRLE1BQVIsRUFBZ0JDLElBQWhCLEVBQXNCLHFCQUF0QixDQUFQO0FBQ0QsS0FGRDtBQUdELEdBSjRCLENBQTdCOztBQU1BO0FBQ0FkLGdCQUFjQyxNQUFkLENBQXFCLFNBQXJCLEVBQWdDLENBQUMsU0FBRCxFQUFZLFVBQVVZLE9BQVYsRUFBbUI7QUFDN0QsV0FBTyxVQUFVRSxHQUFWLEVBQWVDLE1BQWYsRUFBdUI7QUFDNUIsVUFBSUYsT0FBTyxJQUFJRyxJQUFKLEVBQVg7QUFDQUgsV0FBS0ksT0FBTCxDQUFhSixLQUFLSyxPQUFMLEtBQWlCSixHQUE5QjtBQUNBLGFBQU9GLFFBQVEsTUFBUixFQUFnQkMsSUFBaEIsRUFBc0JFLFVBQVUsWUFBaEMsQ0FBUDtBQUNELEtBSkQ7QUFLRCxHQU4rQixDQUFoQztBQVFELENBeENFLEVBd0NESSxPQUFPcEIsYUFBUCxHQUF1Qm9CLE9BQU9wQixhQUFQLElBQXdCcUIsUUFBUUMsTUFBUixDQUFlLGVBQWYsRUFBZ0MsRUFBaEMsQ0F4QzlDLENBQUQiLCJmaWxlIjoiY29tbW9uL2NvbW1vbkZpbHRlcnMvY29tbW9uRmlsdGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cbjsgKGZ1bmN0aW9uIChjb21tb25GaWx0ZXJzKSB7XG5cbiAgLy8g5pi+56S65paH5Lu25aSn5bCPXG4gIGNvbW1vbkZpbHRlcnMuZmlsdGVyKCdieXRlJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoYnl0ZXMpIHtcbiAgICAgIGlmICh0eXBlb2YgYnl0ZXMgIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShieXRlcykgfHwgYnl0ZXMgPCAwKSByZXR1cm4gJ04vQSc7XG4gICAgICBjb25zdCB1bml0cyA9IFsuLi4nIEtNR1RQRVpZJ10ubWFwKHByZWZpeCA9PiBgJHtwcmVmaXgudHJpbSgpfUJgKTtcbiAgICAgIGxldCBsZXZlbCA9IDAsIHNpemUgPSBieXRlcztcbiAgICAgIHdoaWxlIChzaXplID4gMTAwMCkge1xuICAgICAgICBzaXplIC89IDEwMjQ7XG4gICAgICAgIGxldmVsKys7XG4gICAgICB9XG4gICAgICBpZiAobGV2ZWwgPj0gdW5pdHMubGVuZ3RoKSByZXR1cm4gJ04vQSc7XG4gICAgICByZXR1cm4gKCcnICsgc2l6ZSkuc2xpY2UoMCwgNCkucmVwbGFjZSgvXFwuJC8sICcnKSArIHVuaXRzW2xldmVsXTtcbiAgICB9O1xuICB9KTtcblxuICAvLyDmmL7npLrml6XmnJ9cbiAgY29tbW9uRmlsdGVycy5maWx0ZXIoJ2RheScsIFsnJGZpbHRlcicsIGZ1bmN0aW9uICgkZmlsdGVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICByZXR1cm4gJGZpbHRlcignZGF0ZScpKGRhdGUsICd5eXl5LU1NLWRkJylcbiAgICB9O1xuICB9XSk7XG5cbiAgLy8g5pi+56S65pe25Yi7XG4gIGNvbW1vbkZpbHRlcnMuZmlsdGVyKCd0aW1lJywgWyckZmlsdGVyJywgZnVuY3Rpb24gKCRmaWx0ZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgIHJldHVybiAkZmlsdGVyKCdkYXRlJykoZGF0ZSwgJ3l5eXktTU0tZGQgSEg6bW06c3MnKVxuICAgIH07XG4gIH1dKTtcblxuICAvLyDnm7jlr7nku4rlpKnnmoTml6XmnJ9cbiAgY29tbW9uRmlsdGVycy5maWx0ZXIoJ3JlbGRhdGUnLCBbJyRmaWx0ZXInLCBmdW5jdGlvbiAoJGZpbHRlcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAocmVsLCBmb3JtYXQpIHtcbiAgICAgIGxldCBkYXRlID0gbmV3IERhdGUoKTtcbiAgICAgIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSArIHJlbCk7XG4gICAgICByZXR1cm4gJGZpbHRlcignZGF0ZScpKGRhdGUsIGZvcm1hdCB8fCAneXl5eS1NTS1kZCcpXG4gICAgfTtcbiAgfV0pO1xuXG59KHdpbmRvdy5jb21tb25GaWx0ZXJzID0gd2luZG93LmNvbW1vbkZpbHRlcnMgfHwgYW5ndWxhci5tb2R1bGUoJ2NvbW1vbkZpbHRlcnMnLCBbXSkpKTtcbiJdfQ==
