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

  $scope.toggleNewMailingAddress = false;

  $scope.$watch('usePermanentAddressAsMailing', function(value) {
    if (value === false) {
      $scope.$parent.cashOut.mailing_address = undefined;
    }
  });

  $scope.$watch('usePermanentAddressAsMailing', function(value) {
    if (value === true) {
      $scope.$parent.cashOut.mailing_address = undefined;
    }
  });

});