/*
* Show currency value with correct unit.
* */
angular.module('filters').filter('dollars', function($filter, $api) {
  return function(value, options) {
    options = options || {};


    var displayShortForm = angular.isDefined(options.short) ? options.short : false;
    var showUnit = angular.isDefined(options.unit) ? options.unit : true;

    var unit = showUnit ? '$' : '';
    var precision = options.precision;

    var displayValue = $filter('number')(value, precision);

    return unit + (options.space ? ' ' : '') + displayValue;
  };
});
