'use strict';

angular.module('activity').
  controller('NewCashOutController', function($scope, $api, $window, $location, AddressManager, countries, usStates) {

    $scope.cashOut = {
      type: undefined,
      amount: undefined,
      paypal_address: undefined,
      bitcoin_address: undefined,
      address_id: undefined,
      mailing_address_id: undefined,
      us_citizen: undefined,
      usePermanentAddressAsMailing: true
    };

    $scope.newPermanentAddress = undefined;
    $scope.newMailingAddress = undefined;

    // Set default to amount to current account balance
    $scope.$watch('current_person', function(person) {
      if (person) {
        $scope.cashOut.amount = parseFloat(person.account.balance);
      }
    });

    $scope.countries = countries;
    $scope.usStates = usStates;

    // Model for checkbox. Use the permanent address as the mailing address
    $scope.usePermanentAddressAsMailing = true;

    // Create intance of AddressManager. Created this so that mailing_address and address
    // could easily share the same array of addresses.
    $scope.addressManager = new AddressManager($api.v2.addresses().then(function(response) {
      return angular.copy(response.data);
    }));

    // Initialize value of address selects if undefined
    $scope.$on($scope.addressManager.addressAddedEvent, function(event, address) {
      if (angular.isUndefined($scope.cashOut.address)) {
        $scope.cashOut.address = address;
      }
      if (angular.isUndefined($scope.cashOut.address)) {
        $scope.cashOut.mailing_address = address;
      }
    });

    // Remove address values from selects where the removed address is the value.
    $scope.$on($scope.addressManager.addressRemovedEvent, function(event, address) {
      if (angular.isDefined($scope.cashOut.address) && address === $scope.cashOut.address) {
        $scope.cashOut.address = undefined;
      }

      if (angular.isDefined($scope.cashOut.mailing_address) && address === $scope.cashOut.mailing_address) {
        $scope.cashOut.mailing_address = undefined;
      }
    });

    $scope.toggleNewPermanentAddress = false;

    // Watch new address toggle.
    // When true, set address to null, and reinitialize with empty object.
    // When false, clear address.
    $scope.$watch('toggleNewPermanentAddress', function(value) {
      if (value === true) {
        $scope.cashOut.address = {};
      } else if (value === false) {
        $scope.cashOut.address = angular.copy($scope.addressManager.addresses[0]);
      }
    });

    $scope.createCashOut = function() {
      // Create permanent address if missing
      if ($scope.cashOut.address && !$scope.cashOut.address.id) {
        $scope.addressManager.create($scope.cashOut.address).then(function(response) {
          $scope.cashOut.address = angular.copy(response.data);
        });
      }

      // Create mailing address if missing
      if ($scope.cashOut.address && !$scope.cashOut.address.id) {
        $scope.addressManager.create($scope.cashOut.address).then(function(response) {
          $scope.cashOut.mailing_address = angular.copy(response.data);
        });
      }

      // Register a listener on the payload. Once all addresses have been created and added,
      // send the CashOut create request. This is all some hacky bullshit.
      var cashOutCreateListener = $scope.$watch('cashOut', function(cashOut) {
        if (cashOut && cashOut.address.id && cashOut.mailing_address.id) {
          cashOutCreateListener();

          var payload = angular.copy($scope.cashOut);

          // Add address IDs, remove address objects
          payload.address_id = payload.address.id;
          payload.mailing_address_id = payload.mailing_address.id;
          delete payload.address;
          delete payload.mailing_address;

          // Do not post the US citizen response when not necessary
          if (payload.address && payload.address.country === 'US') {
            delete payload.us_citizen;
          }

          // If mailing address is to be the permanent address, copy the id.
          if (payload.usePermanentAddressAsMailing) {
            payload.mailing_address_id = payload.address_id;
          }
          delete payload.usePermanentAddressAsMailing;

          $api.v2.createCashOut(payload).then(function(response) {
            if (response.success) {
              // Fetch current person again to reload account balance
              $api.load_current_person_from_cookies();

              $location.url('/activity/cash_outs');
            } else {
              $scope.alert = {
                type: 'danger',
                message: response.data.error
              };
            }
          });
        }
      }, true);
    };

  });