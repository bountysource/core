'use strict';

/*
* Show currency value with correct unit.
* */
angular.module('filters').filter('dollars', function($filter, $api, $currency) {
  return function(value, options) {
    options = options || {};

    // Force space between unit and value when MSC and XRP
    if ($currency.isMSC() || $currency.isXRP()) {
      options.space = true;
    }

    value = $currency.convert(value, 'USD', $currency.value);

    var displayShortForm = angular.isDefined(options.short) ? options.short : false;
    var showUnit = angular.isDefined(options.unit) ? options.unit : true;

    // If displaying short form, hide unit if required of the currency.
    // TODO clean up a kind of a dirty conditional
    if (displayShortForm) {
      if (!$currency.hasSymbol($currency.value)) {
        showUnit = false;
      }
    }

    var unit = showUnit ? $filter('currencyUnit')(value, $currency.value) : '';
    var precision = $currency.precision($currency.value, options.precision || {});

    var displayValue = $filter('number')(value, precision);

    // If currency has symbol, prepend. Otherwise, append unit.
    if ($currency.hasSymbol($currency.value)) {
      return unit + (options.space ? ' ' : '') + displayValue;

    // If the currency does not have a symbol,
    } else {
      return displayValue + (options.space ? ' ' : '') + unit;
    }
  };
});
