'use strict';

angular.module('activity').controller('NewCashOutMailingAddressController', function($scope, $api) {

  $scope.addressManager = $scope.$parent.addressManager;

  $scope.newMailingAddress = {
    name: undefined,
    address1: undefined,
    address2: undefined,
    city: undefined,
    state: undefined,
    postal_code: undefined,
    country: undefined,
    us_citizen: undefined
  };

  $scope.usePermanentAddress = true;
  $scope.toggleNewMailingAddress = false;

  $scope.$watch('usePermanentAddress', function(value) {
    if (value === false) {
      $scope.$parent.cashOut.mailing_address = undefined;
    } else if (value === true) {

    }
  });

  $scope.$watch('toggleNewMailingAddress', function(value) {
    if (value === true) {
      $scope.$parent.cashOut.mailing_address = undefined;
    }
  });

  $scope.nextStep = function() {
    // Just copy permanent address if checked
    if ($scope.usePermanentAddress) {
      $scope.$parent.cashOut.mailing_address = angular.copy($scope.$parent.cashOut.address);
      $scope.$parent.nextStep();

    // Otherwise, if set by select
    } else if ($scope.$parent.cashOut.mailing_address) {
      $scope.$parent.nextStep();

    // Otherwise, create new mailing address
    } else if ($scope.toggleNewMailingAddress) {
      var payload = angular.copy($scope.newMailingAddress);

      $scope.addressManager.create(payload).then(function(response) {
        console.log('createMailingAddress', response);

        if (response.success) {
          $scope.$parent.cashOut.mailing_address = angular.copy(response.data);
          $scope.$parent.nextStep();
        } else {
          $scope.alert = {
            message: response.data.error,
            type: 'danger'
          };
        }
      });
    }
  };

});