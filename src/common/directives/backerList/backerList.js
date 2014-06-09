'use strict';

angular.module('directives').directive('backerList', function() {

  return {
    restrict: 'EAC',
    templateUrl: 'common/directives/backerList/templates/backerList.html',
    scope: { 
      backers: '=', 
      orderModel: '=' 
    },

    link: function(scope) {

      scope.defaultOptions = {
        showPaginationButtons: true
      };

      scope._options = angular.extend(scope.defaultOptions, scope.options||{});

      scope.pagination = {
        perPage: 30
      };

      scope.$watch('backers', function(backers) {
        if (backers) {
          scope.pagination.totalItems = backers.length;
        }
      });

      scope.pageChanged = function(page) {
        console.log('pageChanged: ', page);
      };

      var rawOrderValue = function(value) {
        if (/^[\-\+]/.test(value)) {
          return value.slice(1);
        }
        return value;
      };

      var invertOrder = function(value) {
        if (/^[\+]/.test(value)) {
          return '-' + rawOrderValue(value);
        }
        return '+' + rawOrderValue(value);
      };

      scope.changeOrder = function(value) {
        // If they are the same, Invert order. Otherwise, change col with default desc
        if (value === rawOrderValue(scope.orderModel)) {
          scope.orderModel = invertOrder(scope.orderModel);
        } else {
          scope.orderModel = '+' + rawOrderValue(value);
        }
      };

    }
  };

});
