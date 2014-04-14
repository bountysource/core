'use strict';

angular.module('activity').
  controller('NewCashOutController', function($scope, $api, $window, $location, AddressManager, countries, usStates) {

    $scope.countries = countries;
    $scope.usStates = usStates;

    $scope.cashOut = {
      type: undefined,
      amount: undefined,
      paypal_address: undefined,
      bitcoin_address: undefined,
      address_id: undefined,
      mailing_address_id: undefined,
      us_citizen: undefined
    };

    // Create intance of AddressManager. Created this so that mailing_address and address
    // could easily share the same array of addresses.
    $scope.addressManager = new AddressManager($api.v2.addresses().then(function(response) {
      var addresses = angular.copy(response.data);

      // Initialize with the first address
      if (angular.isArray(addresses) && addresses.length > 0) {
        $scope.cashOut.address_id = addresses[0].id;
        $scope.cashOut.mailing_address_id = addresses[0].id;
      }

      return addresses;
    }));

    // Initialize value of address selects if undefined
    $scope.$on($scope.addressManager.addressAddedEvent, function(event, address) {
      if (angular.isUndefined($scope.cashOut.address_id)) {
        $scope.cashOut.address_id = address.id;
      }
      if (angular.isUndefined($scope.cashOut.address_id)) {
        $scope.cashOut.mailing_address_id = address.id;
      }
    });

    // Remove address values from selects where the removed address is the value.
    $scope.$on($scope.addressManager.addressRemovedEvent, function(event, address) {
      if (angular.isDefined($scope.cashOut.address) && address.id === $scope.cashOut.address.id) {
        $scope.cashOut.address_id = undefined;
      }

      if (angular.isDefined($scope.cashOut.mailing_address) && address.id === $scope.cashOut.mailing_address.id) {
        $scope.cashOut.mailing_address_id = undefined;
      }
    });

    // Set default to amount to current account balance
    $scope.$watch('current_person', function(person) {
      if (person) {
        $scope.cashOut.amount = parseFloat(person.account.balance);
      }
    });

    $scope.createCashOut = function() {

      var payload = angular.copy($scope.cashOut);

      // Do not post the US citizen response when not necessary
      if (payload.address.country === 'US') {
        delete payload.us_citizen;
      }

      $api.v2.createCashOut($scope.cashOut).then(function(response) {
        if (response.success) {
          $location.url('/activity/cash_outs');
        } else {
          $scope.alert = {
            type: 'danger',
            message: response.data.error
          };
        }
      });
    };

  });