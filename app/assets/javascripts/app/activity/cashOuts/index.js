angular.module('activity').
  controller('CashOutsController', function($scope, $api, $window) {

    $api.v2.cashOuts({
      include_mailing_address: true
    }).then(function(response) {
      $scope.cashOuts = angular.copy(response.data);
    });

    $scope.cancelCashOut = function(index) {
      if ($window.confirm("Confirm cancel pending cash out request?")) {
        $api.v2.cancelCashOut($scope.cashOuts[index].id, { refund: true }).then(function() {
          $window.location.reload();
        });
      }
    };
  });