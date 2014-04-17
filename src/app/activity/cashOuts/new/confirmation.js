'use strict';

angular.module('activity').controller('NewCashOutConfirmationController', function($scope, $window, $location, $api) {

  $scope.createCashOut = function() {
    if ($window.confirm('Are you sure?')) {
      var payload = angular.copy($scope.$parent.cashOut);

      // Replace address objects with IDs
      payload.address_id = payload.address.id;
      payload.mailing_address_id = payload.mailing_address.id;
      delete payload.address;
      delete payload.mailing_address;

      // Remove paypal/bitcoin if wrong type of cash out
      if (payload.type !== 'paypal') { delete payload.paypal_address; }
      if (payload.type !== 'bitcoin') { delete payload.bitcoin_address; }

      $api.v2.createCashOut(payload).then(function(response) {
        if (response.success) {
          // Manually reload account balance by fetching current person again
          $api.load_current_person_from_cookies();

          $location.url('/activity/cash_outs');
        }
      });
    }
  };

});