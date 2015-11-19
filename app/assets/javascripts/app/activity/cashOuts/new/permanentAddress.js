'use strict';

angular.module('activity').controller('NewCashOutPermanentAddressController', function($scope) {

  $scope.addressManager = $scope.$parent.addressManager;

  $scope.newAddress = {
    name: undefined,
    address1: undefined,
    address2: undefined,
    city: undefined,
    state: undefined,
    postal_code: undefined,
    country: undefined,
    us_citizen: undefined
  };

  $scope.toggleNewAddress = false;

  $scope.$watch('toggleNewAddress', function(value) {
    if (value === true) {
      $scope.$parent.cashOut.address = undefined;
    }
  });

  $scope.nextStep = function() {
    // If address is set, move on
    if ($scope.toggleNewAddress) {
      var payload = angular.copy($scope.newAddress);

      $scope.addressManager.create(payload).then(function(response) {
        console.log('createAddress', response);

        if (response.success) {
          $scope.$parent.cashOut.address = angular.copy(response.data);
          $scope.$parent.cashOut.mailing_address = angular.copy($scope.$parent.cashOut.address);
          $scope.$parent.nextStep();
        } else {
          $scope.alert = {
            message: response.data.error,
            type: 'danger'
          };
        }
      });

    // If user chose to add an Address, created it then add to cashOut
    } else if ($scope.$parent.cashOut.address) {
      // also set mailing_address
      $scope.$parent.cashOut.mailing_address = angular.copy($scope.$parent.cashOut.address);
      $scope.$parent.nextStep();
    }
  };

});