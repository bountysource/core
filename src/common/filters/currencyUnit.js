'use strict';

angular.module('filters').filter('currencyUnit', function ($filter) {
  return function (value, currency) {
    if (currency === 'BTC') {
      if (value <= 0 || value > 0.001) {
        return '฿';
      } else if (value <= 0.001 && value > 0.000001) {
        return 'mBTC ';
      } else {
        return 'μBTC ';
      }
    } else if (currency === 'XRP') {
      return 'Ʀ';
    } else if (currency === 'MSC') {
      return 'MSC';
    } else if (currency === 'USD') {
      return '$';
    }
  };
});
