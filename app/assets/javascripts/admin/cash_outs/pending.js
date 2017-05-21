angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/cash_outs/pending', {
        templateUrl: 'admin/cash_outs/pending.html',
        controller: "PendingCashOutsController"
      });
  })
  .controller("PendingCashOutsController", function ($scope, $api, $window) {

    $api.call('/admin/cash_outs', {
      sent: false,
      order: '-created',
      include_address: true,
      include_mailing_address: true,
      include_person: true
    }, function(response) {
      $scope.cashOuts = angular.copy(response.data);
    });

    $scope.sendPayments = function() {
      if($window.confirm("Are you for real?")) {
        $api.call('/admin/cash_outs/pay', 'POST', {
            sent: false,
            order: '-created',
            include_address: true,
            include_mailing_address: true,
            include_person: true
          }, function (res) {
          $scope.cashOuts = angular.copy(res.data);
        });
      }
    };

  });
