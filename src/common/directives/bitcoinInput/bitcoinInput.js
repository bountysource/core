'use strict';

angular.module('directives').directive("bitcoinInput", function ($currency) {
  return {
    restrict: "E",
    templateUrl: 'common/directives/bitcoinInput/templates/bitcoinInput.html',
    replace: true,
    scope: {
      amount: '='
    },
    link: function (scope) {
      scope.$currency = $currency;
      scope.display_value = angular.copy(scope.amount);

      scope.$watch("display_value", function (new_value) {
        if (new_value) {
          if(scope.display_currency === "BTC") {
            scope.amount = $currency.btcToUsd(scope.display_value);
          } else {
            scope.amount = scope.display_value;
          }
        }
      });

      scope.display_currency = 'BTC';

      scope.toggleCurrency = function (denomination) {
        // changing it to the current denom. do nothing
        if (scope.display_currency === denomination) {
          // already set to this
        } else {
          if(denomination === 'BTC') {
            scope.display_currency = 'BTC';
            // changing dollar to BTC
            scope.display_value = $currency.usdToBtc(scope.display_value);
          } else {
            scope.display_currency = 'USD';
            // changing dollar to BTC
            scope.display_value = $currency.btcToUsd(scope.display_value);
          }
        }
      };
    }
  };
});
