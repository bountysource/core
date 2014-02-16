'use strict';

angular.module('bountysource.filters').filter('dollars', function($filter) {
  var currency = $filter('currency');
  return function(input, options) {
    options = options || {};
    return currency(input, (options.space ? '$ ' : '$')).replace(/\.\d\d$/,'');
  };
});