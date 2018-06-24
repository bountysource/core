angular.module('app').directive('cryptoPayOutTable', function($api, $window) {

  return {
    restrict: 'EAC',
    templateUrl: 'admin/crypto_pay_outs/directives/cryptoPayOutTable.html',
    scope: { cryptoPayOuts: '=', options: '&' },
    link: function(scope) {
      scope.sendPayOut = function(id) {
        $api.call('/admin/crypto_pay_outs/' + id + '/send', 'POST', function(response) {
            if (response.meta.status === 200) {
              scope.cryptoPayOuts = scope.cryptoPayOuts.filter(function( obj ) {
                return obj.id !== id;
              });
            } else {
              alert("Error: " + JSON.stringify(response));
            }
          });
      }
    }
  };
});
