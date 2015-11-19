'use strict';

angular.module('filters').filter('emptyFilter', function() {
  return function(array) {
    var returnArray = [];
    angular.forEach(array, function (item) {
      if (item.description !== null) {
        returnArray.push(item);
      }
    });
    return returnArray;
  };
});
