angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/cash_outs/sent', {
        templateUrl: 'admin/cash_outs/sent.html',
        controller: "SentCashOutsController"
      });
  })
  .controller("SentCashOutsController", function ($scope, $api) {

    $api.call('/admin/cash_outs', {
        sent: true,
        order: '+sent',
        include_address: true,
        include_mailing_address: true,
        include_person: true
    }, function(response) {
      $scope.cashOuts = angular.copy(response.data);
    });

  });
