'use strict';

angular.module('filters').filter('currencyUnit', function ($filter) {
  return function (value, currency) {
    if (currency === 'uBTC') {
      return 'μBTC ';
    } else if (currency === 'XRP') {
      return 'XRP';
    } else if (currency === 'MSC') {
      return 'MSC';
    } else if (currency === 'USD') {
      return '$';
    }
  };
});
