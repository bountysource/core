'use strict';

angular.module('activity').
  controller('NewCashOutController', function($scope, $api, $window, $location, $q, AddressManager, countries, usStates) {

    $scope.templates = [
      'app/activity/cashOuts/new/permanentAddress.html',
      'app/activity/cashOuts/new/mailingAddress.html',
      'app/activity/cashOuts/new/paymentMethod.html',
      'app/activity/cashOuts/new/confirmation.html'
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
      us_citizen: undefined
    };

    $scope.$watch('current_person', function(person) {
      if (angular.isObject(person)) {
        $scope.cashOut.amount = $window.parseFloat(person.account.balance);
      }
    });

    $scope.addressManager = new AddressManager($api.v2.addresses().then(function(response) {
      if (response.success) {
        return angular.copy(response.data);
      }
    }));

    $scope.nextStep = function() {
      console.log('next!');

      $scope.setPage($scope.activeTemplateIndex + 1);
    };

    $scope.setPage = function(index) {
      if (index <= 0) { index = 0; }
      if (index >= $scope.templates.length) { index = $scope.templates.length - 1; }
      $scope.activeTemplateIndex = index;
      $scope.activeTemplate = $scope.templates[$scope.activeTemplateIndex];
    };

    $scope.previousPage = function() {
      $scope.setPage($scope.activeTemplateIndex - 1);
    };

  });