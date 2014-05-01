'use strict';

/*
* Show currency value with correct unit.
* */
angular.module('filters').filter('dollars', function($filter, $api, $currency, $window) {
  return function(value, options) {
    options = options || {};

    value = $currency.convert(value, 'USD', $currency.value);
    var unit = $filter('currencyUnit')(value, $currency.value);
    var precision = $currency.precision(options.precision || {});

    return unit + (options.space ? ' ' : '') + $filter('number')(value, precision);
  };
});
