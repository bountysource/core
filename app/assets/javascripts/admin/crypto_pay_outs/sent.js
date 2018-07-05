angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/crypto_pay_outs/sent', {
        templateUrl: 'admin/crypto_pay_outs/sent.html',
        controller: "SentCryptoPayOutsController"
      });
  })
  .controller("SentCryptoPayOutsController", function ($scope, $api) {

    $api.call('/admin/crypto_pay_outs', {
      "state": "sent"
    }, function(response) {
      $scope.cryptoPayOuts = angular.copy(response.data);
    });
  });
