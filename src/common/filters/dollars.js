'use strict';

angular.module('filters').filter('dollars', function($filter, $api, $currency) {
  return function(value, options) {
    options = options || {};

    if ($currency.value === 'BTC') {
      value = $currency.usdToBtc(value);
      if (value <= 0 || value > 0.001) {
        return (options.space ? '฿ ' : '฿') + $filter('number')(value, 3);

      // 1 mBTC = 0.001 BTC
      } else if (value <= 0.001 && value > 0.000001) {
        return 'mBTC ' + $filter('number')(value * 1000, 3);

      // 1 uBTC = 0.000001 BTC
      } else {
        return 'μBTC ' + $filter('number')(value * 1000000, 3);
      }
    } else {
      return (options.space ? '$ ' : '$') + $filter('number')(value, 0);
    }
  };
});
