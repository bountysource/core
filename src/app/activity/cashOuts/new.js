'use strict';

angular.module('activity').
  controller('NewCashOutController', function($scope, $api, $window, $location, $q, AddressManager) {

    $scope.templates = [
      'app/activity/cashOuts/new/confirmation.html',
      'app/activity/cashOuts/new/permanentAddress.html',
      'app/activity/cashOuts/new/mailingAddress.html',
      'app/activity/cashOuts/new/paymentMethod.html'
    ];

    $scope.activeTemplateIndex = 0;
    $scope.activeTemplate = $scope.templates[$scope.activeTemplateIndex];

    $scope.cashOut = {
      type: undefined,
      amount: undefined,
      paypal_address: undefined,
      bitcoin_address: undefined,
      address: undefined,
      mailing_address: undefined,
      us_citizen: undefined,
      newAddress: {},
      newMailingAddress: {}
    };

    $scope.usePermanentAddressAsMailing = true;

    $scope.$watch('current_person', function(person) {
      if (angular.isObject(person)) {
        $scope.cashOut.amount = $scope.cashOut.amount || $window.parseFloat(person.account.balance);
      }
    });

    $scope.addressManager = new AddressManager($api.v2.addresses().then(function(response) {
      if (response.success) {
        return angular.copy(response.data);
      }
    }));

    // TODO change to real timestamp
    $scope.feeChangeEnactedAt = new Date();

    // Create permanent address if necessary. Return promise for chaining on cash out create.
    $scope.createPermanentAddress = function() {
      var deferred = $q.defer();

      if (angular.isObject($scope.cashOut.address)) {
        deferred.resolve($scope.cashOut.address);

      } else if (angular.isObject($scope.cashOut.newAddress)) {
        var payload = angular.copy($scope.cashOut.newAddress);

        $api.v2.createAddress(payload).then(function(response) {
          if (response.success) {
            $scope.cashOut.address = angular.copy(response.data);
            deferred.resolve(response.data);
          } else {
            $scope.permanentAddressAlert = { type: 'danger', message: response.data.error };
            deferred.reject(response);
          }
        });

      } else {
        deferred.reject();
      }
      return deferred.promise;
    };

    $scope.createMailingAddress = function() {
      var deferred = $q.defer();

      // Just move on if a check
      if ($scope.cashOut.type !== 'check') {
        deferred.resolve();

      // Move on if same as permanent address
      } else if ($scope.usePermanentAddressAsMailing) {
        $scope.cashOut.mailing_address = angular.copy($scope.cashOut.address);
        deferred.resolve();

      } else if (angular.isObject($scope.cashOut.mailing_address)) {
        deferred.resolve($scope.cashOut.mailing_address);

      } else if (angular.isObject($scope.cashOut.newMailingAddress)) {
        var payload = angular.copy($scope.cashOut.newMailingAddress);

        $api.v2.createAddress(payload).then(function(response) {
          if (response.success) {
            $scope.cashOut.mailing_address = angular.copy(response.data);
            deferred.resolve(response.data);
          } else {
            $scope.mailingAddressAlert = { type: 'danger', message: response.data.error };
            deferred.reject(response);
          }
        });

      } else {
        deferred.reject();
      }
      return deferred.promise;
    };

    $scope.createCashOut = function() {
      if ($window.confirm('Are you sure?')) {
        return $scope.createPermanentAddress().
          then($scope.createMailingAddress).
          then(function() {
            var payload = angular.copy($scope.cashOut);

            // Replace address objects with IDs
            payload.address_id = payload.address.id;
            if (payload.mailing_address) { payload.mailing_address_id = payload.mailing_address.id; }

            delete payload.address;
            delete payload.mailing_address;
            delete payload.newAddress;
            delete payload.newMailingAddress;

            // Remove paypal/bitcoin if wrong type of cash out
            if (payload.type !== 'paypal') { delete payload.paypal_address; }
            if (payload.type !== 'bitcoin') { delete payload.bitcoin_address; }

            $api.v2.createCashOut(payload).then(function(response) {
              if (response.success) {
                // Manually reload account balance by fetching current person again
                $api.load_current_person_from_cookies();

                $location.url('/activity/cash_outs');
              } else {
                $scope.cashOutAlert = { type: 'danger', message: response.data.error };
              }
            });
          });
      }
    };

    $scope.$watch('cashOut.amount', function(amount) {
      if (angular.isNumber(amount)) {
        $api.v2.account({
          cash_out: amount
        }).then(function(response) {
          if (response.success) {
            $scope.fee = response.data.cash_out.fee || 0;
            $scope.feeAdjustment = response.data.cash_out.fee_adjustment || 0;
          }
        });
      }
    });

  });