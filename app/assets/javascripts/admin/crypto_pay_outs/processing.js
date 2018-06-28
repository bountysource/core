angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/crypto_pay_outs/processing', {
        templateUrl: 'admin/crypto_pay_outs/processing.html',
        controller: "ProcessingCryptoPayOutsController"
      });
  })
  .controller("ProcessingCryptoPayOutsController", function ($scope, $api) {

    $api.call('/admin/crypto_pay_outs', {
      "state": "processing"
    }, function(response) {
      $scope.cryptoPayOuts = angular.copy(response.data);
    });
  });
