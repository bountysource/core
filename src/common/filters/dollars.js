'use strict';

/*
* Show currency value with correct unit.
* @param displayCurrency the currency to show
* @param actualCurrency the currency of value. if not the same as displayCurrency, then convert amount.
* */
angular.module('filters').filter('dollars', function($filter, $api, $currency, $location) {

  function pageChecker (page) {
    var match = (/^\/issues\/[a-z-_0-9]+\/bounty/).test(page) || (/fundraiser\?page=pledge/).test(page) || (/^\/teams\/[a-z-_0-9]+\/account/).test(page);
    return match;
  }

  return function(value, options) {
    options = options || {};
    var displayCurrency = options.displayCurrency || $currency.value;
    var actualCurrency = options.actualCurrency || 'USD';
    var unit = $filter('currencyUnit')(value, displayCurrency);

    // HORRIBLE hacky solution. Brings such shame. 
    // If we are on a pledge, team_payin, bounty checkout page, use normal dollar filter
    // aren't supporting MSC/XRP checkout. They must use regular dollars.
    if (pageChecker($location.url()) && ($currency.isMSC() || $currency.isXRP())) {
      return "$" + (options.space ? " " : "") + $filter('number')(value, 0);
    }

    // Convert amount if display and actual currencies do not match
    if (displayCurrency !== actualCurrency) {
      if (actualCurrency === 'USD' && displayCurrency === 'BTC') {
        value = $currency.usdToBtc(value);
      } else if (actualCurrency === 'USD' && displayCurrency === 'XRP') {
        value = $currency.usdToXrp(value);
      } else if (actualCurrency === 'USD' && displayCurrency === 'MSC') {
        value = $currency.usdToMsc(value);
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
    } else if (displayCurrency === 'XRP') {
      if (value >= 1000) {
        value /= 1000;
        return $filter('number')(value, 0) + 'k XRP';
      } else {
        return $filter('number')(value, 0) + ' XRP';
      }
    } else if (displayCurrency === 'MSC') {
      return $filter('number')(value, 1) + ' MSC';
    }
  };
});
