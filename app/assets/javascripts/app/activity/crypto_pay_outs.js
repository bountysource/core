angular.module('activity').controller('CryptoPayOutsController', function($scope, $routeParams, $api, $pageTitle) {
  $pageTitle.set('Crypto Pay Outs', 'Activity');

  $api.call("/user/crypto_pay_outs").then(function(crypto_pay_outs) {
    $scope.crypto_pay_outs = crypto_pay_outs;
    return crypto_pay_outs;
  });
});
