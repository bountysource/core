'use strict';

/*
* Show currency value with correct unit.
* @param displayCurrency the currency to show
* @param actualCurrency the currency of value. if not the same as displayCurrency, then convert amount.
* */
angular.module('filters').filter('dollars', function($filter, $api, $currency) {
  return function(value, options) {
    options = options || {};
    var displayCurrency = options.displayCurrency || $currency.value;
    var actualCurrency = options.actualCurrency || 'USD';
    var unit = $filter('currencyUnit')(value, displayCurrency);

    // Convert amount if display and actual currencies do not match
    if (displayCurrency !== actualCurrency) {
      if (actualCurrency === 'USD' && displayCurrency === 'BTC') {
        value = $currency.usdToBtc(value);
      }
    }

    if (displayCurrency === 'USD') {
      return unit + (options.space ? " " : "") + $filter('number')(value, 0);

    } else if (displayCurrency === 'BTC') {
      if (value <= 0.001 && value > 0.000001) {
        value *= 1000; // mBTC
      } else if (value <= 0.000001) {
        value *= 1000000; // uBTC
      }
      return unit + (options.space ? " " : "") + $filter('number')(value, 3);
    }
  };
});
