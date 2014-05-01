'use strict';

angular.module('directives').directive('currencyInput', function ($rootScope, $currency, $timeout) {

  return {
    restrict: 'AC',
    templateUrl: 'common/directives/currencyInput/currencyInput.html',
    replace: true,
    scope: {
      currencyAmount: '=',
      currencyIso: '='
    },
    link: function (scope) {

      var setDisplay = function () {
        scope.displayValue = $currency.convert(scope.currencyAmount, $currency.value, scope.currencyIso);
      };

      scope.updateModel = function () {
        scope.currencyAmount = scope.displayValue;
        scope.currencyIso = $currency.value;
      };

      // Initailize display amount
      scope.$on($currency.currencyChangedEventName, setDisplay);
      $timeout(setDisplay, 0);
    }
  };

});