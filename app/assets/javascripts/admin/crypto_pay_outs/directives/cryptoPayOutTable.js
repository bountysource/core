angular.module('app').directive('cryptoPayOutTable', function($api, $window) {

  return {
    restrict: 'EAC',
    templateUrl: 'admin/crypto_pay_outs/directives/cryptoPayOutTable.html',
    scope: { cryptoPayOuts: '=', options: '&' },
    link: function(scope) {
      scope.sendPayOut = function(id) {
        
      }
    }
  };
});
