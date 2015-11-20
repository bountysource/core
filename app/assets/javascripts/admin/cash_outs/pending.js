angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/cash_outs/pending', {
        templateUrl: 'admin/cash_outs/pending.html',
        controller: "PendingCashOutsController"
      });
  })
  .controller("PendingCashOutsController", function ($scope, $api) {

    $api.call('/admin/cash_outs', {
      sent: false,
      order: '-created',
      include_address: true,
      include_mailing_address: true,
      include_person: true
    }, function(response) {
      $scope.cashOuts = angular.copy(response.data);
    });

  });
