angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/crypto_pay_outs/pending', {
        templateUrl: 'admin/crypto_pay_outs/pending.html',
        controller: "PendingCryptoPayOutsController"
      });
  })
  .controller("PendingCryptoPayOutsController", function ($scope, $api) {

    $api.call('/admin/crypto_pay_outs', {
      "state": "pending"
    }, function(response) {
      $scope.cryptoPayOuts = angular.copy(response.data);
    });
  });
